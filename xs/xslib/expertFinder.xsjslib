(function(exports) {
    "use strict";

    const oSI = $.import("sap.ino.xs.xslib", "SimilarIdeas");    
    const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
    var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
    var oHQ = $.import("sap.ino.xs.xslib", "hQuery").hQuery(oConn).setSchema('SAP_INO_EXT');

    /**
     * old experts finder compatible API - roles / human readable
     */ 
    const Types = { 
        SUBMITTER : "SUBMITTER",
        CONTRIBUTOR : "CONTRIBUTOR",
        COMMENTATOR : "COMMENTATOR",
        COACH : "COACH",
        EVALUATOR : "EVALUATOR" 
    };

    /**
     * checks whether expert finder is enabled for this installation
     * 
     * @returns {boolean}   expert finder flag is set (>0)
     */ 
    function checkIsActive() {
        var sSQL = "select value from \"SAP_INO_EXT\".\"sap.ino.db.basis.ext::v_ext_system_setting\" where code = 'sap.ino.config.EXPERT_FINDER_ACTIVE'";
        var result = oHQ.statement(sSQL).execute();
        if (result.length > 0 && !isNaN(parseInt(result[0].VALUE, 10))) {
            return result[0].VALUE > 0;
        } else {
            return false;
        }
    }

    /**
     * returns a list of ideas based on given tags
     * 
     * @param {string|string[]}    aTagNames    array of tag names
     * @returns {object[]}                      array of input idea - tag - mappings
     */ 
    function getSimilarIdeasByTags(aTagNames) {
        if (!aTagNames) {
            return [];
        }
        // input validation
        if (!Array.isArray(aTagNames)) {
            aTagNames = [aTagNames];
        }
        // basic statement, simscore defaults to 1 in case of tags
        var sSQL = ['select IDEA_ID, TAG_ID, 1.0 as SIMSCORE',
            'from "SAP_INO_EXT"."sap.ino.db.idea.ext::v_ext_idea_tag"',
            'where LOWER(NAME) in ({TAGS})'].join(" ");
        // normalize tags
        aTagNames = _.uniq(aTagNames.map(function(sTagName) { return sTagName.toLowerCase(); }));
        // make prepared statement for leveraging statement cache
        var sPlaceholders = aTagNames.map(function() { return "?"; }).join(",");
        var oResult = oHQ.statement(sSQL.replace("{TAGS}", sPlaceholders)).execute(aTagNames);
        return oResult;
    }

    /**
     * returns a list of ideas based on given ideas.
     * 
     * This calls the similar ideas code.
     * 
     * @param {int|int[]}       aIdeaIds    array of valid idea IDs
     * @returns {object[]}                  array of input ideas with similarity values
     */
    function getSimilarIdeasById(aIdeaIds) {
        if (!aIdeaIds) {
            return [];
        }
        // input validation
        if (!Array.isArray(aIdeaIds)) {
            aIdeaIds = [aIdeaIds];
        }
        var aSimilarIdeas = [];
        _.each(aIdeaIds, function(iIdeaId) {
            aSimilarIdeas = aSimilarIdeas.concat(oSI.getSimilarIdeasById(parseInt(iIdeaId, 10)));
            // add mock idea itself with perfect similarity
            aSimilarIdeas.push({ID: iIdeaId, AGG_SCORE: 1.0});
        });
        return aSimilarIdeas.map(
            function (oSimIdea) { 
                return {
                    IDEA_ID: oSimIdea.ID,
                    // tags are not relevant for similar ideas use case
                    TAG_ID: -1,
                    SIMSCORE: oSimIdea.AGG_SCORE
                };
            }
        );
    }

    /**
     * helper function: create an expert structure
     * 
     * @param   {object}    oExpert     expert object as returned from database proc
     * @returns {object}                expert object conforming to old expert.xsjs API
     */ 
    function createExpert(oExpert) {
        var oResult = {
            ID: oExpert.IDENTITY_ID,
            NAME: oExpert.NAME,
            ORGANIZATION: oExpert.ORGANIZATION,
            IS_VALID_EMAIL: oExpert.IS_VALID_EMAIL,
            IMAGE_ID: oExpert.IDENTITY_IMAGE_ID,
            CORRELATION: [],
            OVERALL_ACTIVITY: {
                COACH_COUNT: oExpert.OVERALL_COACH_COUNT,
                COMMENT_COUNT: oExpert.OVERALL_COMMENT_COUNT,
                EVAL_COUNT: oExpert.OVERALL_EVAL_COUNT,
                AUTHOR_COUNT: oExpert.OVERALL_AUTHOR_COUNT
            },
            RANK: oExpert.IDENTITY_RANK,
            SCORE: oExpert.IDENTITY_END_SCORE
        };
        return oResult;
    }
    
    /**
     * helper function: create an correlated idea structure
     * 
     * @param   {object}    oExpert     expert object as returned from database proc
     * @returns {object}                correlated idea object conforming to old expert.xsjs API
     */ 
    function createCorrelatedIdea(oExpert) {
        var oResult = {
            IDEA: {
                ID: oExpert.IDEA_ID,
                NAME: oExpert.IDEA_NAME,
                IMAGE_ID: oExpert.IDEA_IMAGE_ID
            },
            TAGS: [],
            COMMENT_COUNT: oExpert.COUNT_COMMENTATOR,
            EVAL_COUNT: oExpert.COUNT_EVALUATOR,
            EXPERT_ROLES: [],
            SCORE: oExpert.IDEA_RELATIVE_SCORE
        };
        // assemble roles
        if (oExpert.COUNT_SUBMITTER) { oResult.EXPERT_ROLES.push(Types.SUBMITTER); }
        if (oExpert.COUNT_CONTRIBUTOR) { oResult.EXPERT_ROLES.push(Types.CONTRIBUTOR); }
        if (oExpert.COUNT_EVALUATOR) { oResult.EXPERT_ROLES.push(Types.EVALUATOR); }
        if (oExpert.COUNT_COACH) { oResult.EXPERT_ROLES.push(Types.COACH); }
        if (oExpert.COUNT_COMMENTATOR) { oResult.EXPERT_ROLES.push(Types.COMMENTATOR); }
        // split up tag objects
        if (oExpert.TAG_NAMES) {
            oResult.TAGS = _.map(_.zip(oExpert.TAG_IDS.split(","), oExpert.TAG_NAMES.split(",")), function (aItem) {
                return {
                    ID: aItem[0],
                    NAME: aItem[1]
                };
            });
        }
        return oResult;
    }

    /**
     * helper: builds up expert finder results from database proc result set
     * 
     * @param {object[]}    aExperts    result set from database proc
     * @returns {object[]}              expert finder result
     */ 
    function buildExpertResult(aExperts) {
        var aResult = [];
        var iLastUser, oLastExpert;
        _.each(aExperts, function(oExpert) {
            if (oExpert.IDENTITY_ID !== iLastUser) {
                oLastExpert = createExpert(oExpert);
                aResult.push(oLastExpert);
                iLastUser = oExpert.IDENTITY_ID;
            }
            oLastExpert.CORRELATION.push(createCorrelatedIdea(oExpert));
        });
        return aResult;
    }

    /**
     * identifies experts based on given idea id(s)
     * 
     * @param {int|int[]}   vIds            array of idea ids
     * @param {int}         iLimitExperts   maximum rank of returned experts (>iLimitExperts in case of ties)
     * @param {int}         iLimitIdeas     maximum rank of returned ideas per expert (>iLimitIdeas in case of ties)
     * @returns {object[]}                  expert finder result
     */ 
    function identifyExpertsById(vIds, iLimitExperts, iLimitIdeas) {
        var oIdeas = getSimilarIdeasById(vIds);
        var oResult;
        if (oIdeas.length > 0) {
            oResult = oHQ.procedure("sap.ino.db.expert.ext::p_ext_expert_data_service").execute({
                "IT_IDEA_IDS": oIdeas, 
                "IV_FILTER_BY_TAGS": 0,
                "IV_MAX_RANK_IDENTITY": parseInt(iLimitExperts, 10) || 0,
                "IV_MAX_RANK_IDEAS_PER_IDENTITY": parseInt(iLimitIdeas, 10) || 0
            });
        }
        return buildExpertResult(oResult && oResult.OT_RESULTS || []);
    }
    
    /**
     * identifies experts based on given tag(s)
     * 
     * @param {string|string[]} vTags           array of tag names
     * @param {int}             iLimitExperts   maximum rank of returned experts (>iLimitExperts in case of ties)
     * @param {int}             iLimitIdeas     maximum rank of returned ideas per expert (>iLimitIdeas in case of ties)
     * @returns {object[]}                      expert finder result
     */ 
    function identifyExpertsByTag(vTags, iLimitExperts, iLimitIdeas) {
        var oIdeas = getSimilarIdeasByTags(vTags);
        var oResult;
        if (oIdeas.length > 0) {
            oResult = oHQ.procedure("sap.ino.db.expert.ext::p_ext_expert_data_service").execute({
                "IT_IDEA_IDS": oIdeas, 
                "IV_FILTER_BY_TAGS": 1,
                "IV_MAX_RANK_IDENTITY": parseInt(iLimitExperts, 10) || 0,
                "IV_MAX_RANK_IDEAS_PER_IDENTITY": parseInt(iLimitIdeas, 10) || 0
            });
        }
        return buildExpertResult(oResult && oResult.OT_RESULTS || []);
    }

    exports.checkIsActive = checkIsActive;
    exports.identifyExpertsById = identifyExpertsById;
    exports.identifyExpertsByTag = identifyExpertsByTag;
}(this));