var oSI = $.import("sap.ino.xs.xslib", "SimilarIdeas");
var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var oHQ = $.import("sap.ino.xs.xslib", "hQuery").hQuery(oConn).setSchema('SAP_INO_EXT');

var Types = this.Types = { 
        SUBMITTER : "SUBMITTER",
        CONTRIBUTOR : "CONTRIBUTOR",
        COMMENTATOR : "COMMENTATOR",
        COACH : "COACH",
        EVALUATOR : "EVALUATOR" 
};

var Quantifier = this.Quantifier = {
        SUBMITTER : 40,
        CONTRIBUTOR : 40,
        COMMENTATOR : 1,
        COACH : 5,
        EVALUATOR : 10 
};

this.isTagSearch = false;

function getSimilarIdeasByTag(tag) {

    var oResult = oHQ.statement(
            "select " +
                "tag.IDEA_ID as ID, " +
                "tag.TAG_ID, " +
                "tag.NAME as TAG_NAME, " +
                "idea.SUBMITTED_AT as CREATED_AT, " +
                "idea.NAME, " +
                "idea.TITLE_IMAGE_ID as IMAGE_ID " +
            "from " +
                "\"SAP_INO\".\"sap.ino.db.idea::v_idea_tag\" as tag " +
            "left outer join " + 
                "\"SAP_INO_EXT\".\"sap.ino.db.idea.ext::v_ext_ideas_full\" as idea " +
            "on " +
                "tag.IDEA_ID = idea.ID " +
            "where " +
                "tag.name = ?"
    ).execute(tag);
    
    _.each(oResult, function(idea) {
        idea.SIM_SCORE = 1;
    });
    
    return oResult;
}

function getIdeaData(iIdeaId) {
    var oResult = oHQ.statement(
           "select id as similar_idea_id, * " +
           "from \"SAP_INO_EXT\".\"sap.ino.db.idea.ext::v_ext_ideas_full\" " + 
           "where id = ?"
    ).execute(iIdeaId);
    
    oResult[0].SIM_SCORE = 1;
    
    return oResult[0];
}

function getSimilarIdeas(ideaId, tags) {
    
    var similarIdeas = [];
    var tagIds = [];
    var that = this;

    if(this.isTagSearch) {
        _.each(tags, function(currentTag) {
            similarIdeas = similarIdeas.concat(that.getSimilarIdeasByTag(currentTag));
        });
        
        _.each(similarIdeas, function(currentIdea) {
            tagIds.push(currentIdea.TAG_ID);
        });
        tagIds = _.uniq(tagIds);
    } else {
        _.each(ideaId, function(currentIdea) {
            var oSimIdeas = oSI.getSimilarIdeasById(parseInt(currentIdea, 10));
            similarIdeas = similarIdeas.concat(oSimIdeas);
            similarIdeas.push(getIdeaData(currentIdea));
        });

        _.each(similarIdeas, function(currentIdea) {
            currentIdea.TAG_ID = -1;
        });
    }
    
    var finalIdeas = [];
    
    if (similarIdeas.length > 0) {
        var overallScoreCounter = 0.0;
        
        var submitters = [];
        var commentators = [];
        var contributors = [];
        var coaches = [];
        var evaluators = [];
        var result;

        if(this.isTagSearch) {
            var tagIds2 = _.map(tagIds, function(match) { return {ID: match}; });
            var it_tags = { "IT_TAGS" : tagIds2 };
            
            result = oHQ.procedure("sap.ino.db.expert.ext::p_ext_expert_tag_data_service").execute(it_tags);
            submitters = result.OT_SUBMITTERS;
            commentators = result.OT_COMMENTATORS;
            contributors = result.OT_CONTRIBUTORS;
            coaches = result.OT_COACHES;
            evaluators = result.OT_EVALUATIONS;
        } else {
            var ideaIds = _.map(similarIdeas, function(match) { return {ID: match.ID}; });
            var it_ideas = { "IT_IDEAS" : ideaIds };
            
            result = oHQ.procedure("sap.ino.db.expert.ext::p_ext_expert_idea_data_service").execute(it_ideas);
            submitters = result.OT_SUBMITTERS;
            commentators = result.OT_COMMENTATORS;
            contributors = result.OT_CONTRIBUTORS;
            coaches = result.OT_COACHES;
            evaluators = result.OT_EVALUATIONS;
        }
        
        var expertFinder = this;
        _.each(similarIdeas, function(currentIdea) {
            var persons = [];
            
            var targetSubmitters = _.where(submitters, { IDEA_ID: currentIdea.ID, TAG_ID: currentIdea.TAG_ID });
            var targetCommentators = _.where(commentators, { IDEA_ID: currentIdea.ID, TAG_ID: currentIdea.TAG_ID });
            var targetContributors = _.where(contributors, { IDEA_ID: currentIdea.ID, TAG_ID: currentIdea.TAG_ID });
            var targetCoaches = _.where(coaches, { IDEA_ID: currentIdea.ID, TAG_ID: currentIdea.TAG_ID });
            var targetEvaluators = _.where(evaluators, { IDEA_ID: currentIdea.ID, TAG_ID: currentIdea.TAG_ID });
            
            _.each(targetSubmitters , function(obj){
                var person = expertFinder.createPerson(obj);
                person.type = Types.SUBMITTER;
                person.quantifier = Quantifier.SUBMITTER;
                person.relativeQuantifier = 0.0;
                person.relativeSimilarity = 0.0;
                persons.push(person);
            });
            
            _.each(targetCommentators, function(obj){ //gather commentators
                var person = expertFinder.createPerson(obj);
                person.type = Types.COMMENTATOR;
                person.quantifier = Quantifier.COMMENTATOR;
                persons.push(person);
            });
            
            _.each(targetContributors, function(obj){ //gather contributors
                var person = expertFinder.createPerson(obj);
                person.type = Types.CONTRIBUTOR;
                person.quantifier = Quantifier.CONTRIBUTOR;
                persons.push(person);
            });
            
            _.each(targetCoaches, function(obj){ //gather coaches
                var person = expertFinder.createPerson(obj);
                person.type = Types.COACH;
                person.quantifier = Quantifier.COACH;
                persons.push(person);
            });
            
            _.each(targetEvaluators, function(obj){ //gather evaluators
                var person = expertFinder.createPerson(obj);
                person.type = Types.EVALUATOR;
                person.quantifier = Quantifier.EVALUATOR;
                persons.push(person);
            });

            finalIdeas.push({
                id: !currentIdea.NAME ? 0 : currentIdea.ID,
                name: currentIdea.NAME,
                score: parseFloat(currentIdea.SIM_SCORE),
                relativeScore: 0,
                tag_id: currentIdea.TAG_ID,
                tag_name: currentIdea.TAG_NAME,
                persons: persons,
                image_id: currentIdea.TITLE_IMAGE_ID
            });
            
            var quantifierSum = 0.0;
            _.each(persons, function(currentPerson){
                quantifierSum += currentPerson.quantifier;
            });
            //rel. qant. auf ebener einer idee in der summe 1  
            _.each(persons, function(currentPerson){
                currentPerson.relativeQuantifier += currentPerson.quantifier / quantifierSum; 
            });          
            //dasselbe aber abgewertet mit der ähnlichkeit der idee
            _.each(persons, function(currentPerson){
                currentPerson.relativeSimilarity = currentPerson.relativeQuantifier * currentIdea.SIM_SCORE;
            });

            overallScoreCounter += parseFloat(currentIdea.SIM_SCORE);
        });
        
        _.each(finalIdeas, function(currentIdea){ 
            currentIdea.relativeScore = currentIdea.score / overallScoreCounter;
        });
    }
    
    return finalIdeas;
}

function createPerson(obj) {
    return {
        id : obj.IDENTITY_ID === null ? -1 : obj.IDENTITY_ID,
        created_at: obj.CREATED_AT,
        name : obj.IDENTITY_NAME,
        email : obj.IDENTITY_EMAIL,
        phone : obj.IDENTITY_PHONE,
        mobile : obj.IDENTITY_MOBILE,
        office : obj.IDENTITY_OFFICE,
        image_id : obj.IDENTITY_IMAGE_ID,
        organization : obj.IDENTITY_ORGANIZATION,
        cost_center : obj.IDENTITY_COST_CENTER,
        relativeQuantifier : 0
    };
}

function identifyExperts(similarIdeas, iLimit) { //tries to identify the experts from the converted datasource and put them into new array
    var personArray = [];
    var that = this;

    _.each(similarIdeas, function(currentIdea){ 
        
        _.each(currentIdea.persons, function(currentPerson){ 
            
            var person = _.find(personArray, function(obj){ 
                return obj.ID === currentPerson.id; 
            });
            if (!person) {
                person = {
                    ID: currentPerson.id,
                    NAME: currentPerson.name,
                    EMAIL: currentPerson.email,
                    PHONE: currentPerson.phone,
                    MOBILE: currentPerson.mobile,
                    OFFICE: currentPerson.office,
                    ORGANIZATION: currentPerson.organization,
                    COST_CENTER: currentPerson.cost_center,
                    IMAGE_ID: currentPerson.image_id,
                    WEIGHT: 0.0,
                    CORRELATION: []};
                personArray.push(person);
            }
            
            var oCorrelatedIdea;
            
            if (that.isGroupActivities) {
                oCorrelatedIdea = _.find(person.CORRELATION, function(obj){ 
                    return obj.IDEA.ID === currentIdea.id; 
                });
            }
            
            if (!oCorrelatedIdea) {
                oCorrelatedIdea = {
                    TYPE: (that.isGroupActivities ? null : currentPerson.type),
                    CREATED_AT: currentPerson.created_at,
                    WEIGHT: currentPerson.relativeQuantifier * currentIdea.relativeScore,
                    IDEA: {
                        ID: currentIdea.id,
                        NAME: currentIdea.name,
                        IMAGE_ID: currentIdea.image_id
                    },
                    TAG: {
                        ID: currentIdea.tag_id,
                        NAME: currentIdea.tag_name
                    }
                };
                person.CORRELATION.push(oCorrelatedIdea);

                if (that.isIdeaCommentCount) {
                    oCorrelatedIdea.COMMENT_COUNT = that.getCommentCount(currentIdea, person.ID);
                }
                if (that.isIdeaEvalCount) {
                    oCorrelatedIdea.EVAL_COUNT = that.getEvalCount(currentIdea, person.ID);
                }
                if (that.isGroupActivities) {
                    oCorrelatedIdea.CREATED_AT = that.getLastActivityDate(currentIdea, person.ID);
                }
            }

            if (that.isGroupActivities && currentPerson.type) {
                oCorrelatedIdea.EXPERT_ROLES = oCorrelatedIdea.EXPERT_ROLES || [];
                if (oCorrelatedIdea.EXPERT_ROLES.indexOf(currentPerson.type) === -1){
                    oCorrelatedIdea.EXPERT_ROLES.push(currentPerson.type);
                }
            }

            person.WEIGHT += currentPerson.relativeQuantifier * currentIdea.relativeScore;
    
        });
    });

    if (that.isExpertOverallActivity) {
        _.each(personArray, function(currentPerson){
            currentPerson.OVERALL_ACTIVITY = that.getOverallActivity(similarIdeas, currentPerson.ID);
        });
    }

    _.each(personArray, function(currentPerson){ 
       currentPerson.CORRELATION = _.sortBy(currentPerson.CORRELATION, function (obj) { return -obj.WEIGHT; });
       _.each(currentPerson.CORRELATION, function (obj) { delete obj.WEIGHT; });
    });
    
    var iRank = 1;
    personArray = _.sortBy(personArray, function (obj) { return -obj.WEIGHT; });
    _.each(personArray, function (obj) { delete obj.WEIGHT; obj.RANK = iRank++; });
    
    if (iLimit) {
        return personArray.slice(0, iLimit);
    }
    else {
        return personArray;
    }
}

function getLastActivityDate(oIdea, expertId) {
    var aExpertActivities = _.where(oIdea.persons, {id: expertId});
    var oLastExpertActivity = _.max(aExpertActivities, function(oActivity){ 
        return new Date(oActivity.created_at); 
    });
    return oLastExpertActivity && oLastExpertActivity.created_at;
}

function getCommentCount(oIdea, expertId) {
    return _.where(oIdea.persons, {id: expertId, type: Types.COMMENTATOR}).length;
}

function getEvalCount(oIdea, expertId) {
    return _.where(oIdea.persons, {id: expertId, type: Types.EVALUATOR}).length;
}

function getOverallActivity(aIdeas, expertId) {
    var iCoachCount, iCommentCount, iEvalCount, iAuthorCount;
    iCoachCount = iCommentCount = iEvalCount = iAuthorCount = 0; 
    _.each(aIdeas, function(idea){
        _.each(idea.persons, function(person) {
            if (person.id === expertId) {
                iCoachCount = (person.type === Types.COACH) ? iCoachCount + 1 : iCoachCount;
                iCommentCount = (person.type === Types.COMMENTATOR) ? iCommentCount + 1 : iCommentCount;
                iEvalCount = (person.type === Types.EVALUATOR) ? iEvalCount + 1 : iEvalCount;
                iAuthorCount = (person.type === Types.SUBMITTER) ? iAuthorCount + 1 : iAuthorCount;
                iAuthorCount = (person.type === Types.CONTRIBUTOR) ? iAuthorCount + 1 : iAuthorCount;
            }
        });
    });
    
    var oActivity = {
        COACH_COUNT: iCoachCount,
        COMMENT_COUNT: iCommentCount,
        EVAL_COUNT: iEvalCount,
        AUTHOR_COUNT: iAuthorCount // submitter + contributor
    };
    return oActivity;
}

function checkIsActive() {
    var sSelect = "select value from \"SAP_INO_EXT\".\"sap.ino.db.basis.ext::v_ext_system_setting\" where code = ?";
    var result = oHQ.statement(sSelect).execute("sap.ino.config.EXPERT_FINDER_ACTIVE");
    if(result.length < 1) {
        return false;
    }
    if(isNaN(result[0].VALUE)) {
        return false;
    }
    return !!parseInt(result[0].VALUE, 10);
}

function getExperts(tags,ideaIds,iLimit, bGroupByIdea) {
    var similarIdeas = [];
    
    if (bGroupByIdea) {
        this.isGroupActivities = true;
        this.isIdeaEvalCount = true;
        this.isIdeaCommentCount = true;
        this.isExpertOverallActivity = true;
    }

    if(typeof ideaIds != 'undefined') {
        this.isTagSearch = false;
        
        if(typeof ideaIds === "string") {
            similarIdeas = similarIdeas.concat(this.getSimilarIdeas([ideaIds], null));
        } else {
            similarIdeas = similarIdeas.concat(this.getSimilarIdeas(ideaIds, null));
        }
    }
    if(typeof tags != "undefined"){
        this.isTagSearch = true;
        
        if(typeof tags === "string") {
            similarIdeas = similarIdeas.concat(this.getSimilarIdeas(null, [tags]));
        } else {
            similarIdeas = similarIdeas.concat(this.getSimilarIdeas(null, tags));
        }
    } 
    iLimit = parseInt(iLimit, 10);
    if (iLimit.toString() === "NaN") {
        iLimit = undefined;
    }
    return this.identifyExperts(similarIdeas, iLimit);
}