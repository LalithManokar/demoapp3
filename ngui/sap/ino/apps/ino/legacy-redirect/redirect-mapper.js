function _concatenateQueryParams(aQueryParams, sTarget) {
    var rval = sTarget;
    for(var i = 0; i < aQueryParams.length; i++) {
        rval += ((i === 0) ? "?" : "&") + aQueryParams[i];
    }
    return rval;
}
function _addSorterParams(oSorter, aQueryParams) {
    if (oSorter) {
        aQueryParams.push("sort=" + oSorter.sPath);
        aQueryParams.push("order=" + (oSorter.bDescending ? "DESC" : "ASC"));
    }
}
/**
 * replaces JSON character strings with their quoted equivalent. Excludes boolean values and numbers
 * 
 * @param   {string}    sInput      JSON name or value
 * @returns {string}                if applicable the quoted name or value, unquoted for booleans and numbers
 */ 
function _quoteReplacement(sInput) {
    if (/^\d+?$/i.test(sInput) || sInput === "true" || sInput === "false") {
        return sInput;
    } 
    return '"' + sInput + '"';
}
/**
 * Fixes: legacy-style URLs in Word files remove quotation marks when clicking link - this makes passed JSON invalid.
 * 
 * @param   {string}    sJSON       JSON string from URL
 * @returns {object}                the parsed JSON object
 * @throws  {Error}                 if input JSON string is not parsable
 */ 
function repairAndParseJSON(sJSON) {
    var oResult;
    try {
        oResult = JSON.parse(sJSON);
    } catch (exc) {
        // empty quotes must be duplicated
        sJSON = sJSON.replace(/"/g, '""');
        // quote all alphanumeric character strings
        sJSON = sJSON.replace(/(\w+)/gi, _quoteReplacement);
        // try parsing again
        try {
            oResult = JSON.parse(sJSON);
        } catch (exc2) {
            // fixed content couldn't be parsed
            throw new Error("Incorrect parameters given!");
        }
    }
    return oResult;
}
function mapIdea(aParams, sNewTarget) {
    var sFormattedTarget = sNewTarget;
    if (aParams && aParams[1]) {
        var oParam = repairAndParseJSON(aParams[1]);
        var sSection;
        switch (oParam.view) {
            case "details": 
                sSection = "sectionDetails";
                break;
            case "evaluations":
                sSection = "sectionEvaluations";
                break;
            case "myevaluations":
                sSection = "sectionEvaluations";
                break;
            case "relatedideas":
                sSection = "sectionRelated";
                break;
            case "expertfinder":
                sSection = "sectionExperts";
                break;
            default:
                sSection = "sectionDetails";
                break;
        }
        sFormattedTarget += oParam.id + "/?section=" + sSection;
    }
    return sFormattedTarget;
}
function mapIdeaCreate(aParams, sNewTarget) {
    var sFormattedTarget = sNewTarget;
    if (aParams && aParams[1]) {
        var oParam = repairAndParseJSON(aParams[1]);
        if (oParam) {
            sFormattedTarget += (oParam.campaign && oParam.campaign > 0) ? ("?campaign=" + oParam.campaign) : "";
        }
    }
    return sFormattedTarget;
}
function mapIdeaModify(aParams, sNewTarget) {
    var sFormattedTarget;
    if (aParams && aParams[1]) {
        var oParam = repairAndParseJSON(aParams[1]);
        if (oParam && oParam.id && oParam.id > 0) {
            sFormattedTarget = "#/idea-edit/" + oParam.id;
        }
    }
    return sFormattedTarget;
}
function mapIdeabrowser(aParams, sNewTarget) {
    var sFormattedTarget;
    var aQueryParams = [];
    if (aParams && aParams[1]) {
        var oParam = repairAndParseJSON(aParams[1]);
        if (oParam) {
            _addSorterParams(oParam.sorter, aQueryParams);
            if (oParam.status) {
                aQueryParams.push("status=" + oParam.status);
            }
            if (oParam.campaign && oParam.campaign > 0) {
                aQueryParams.push("campaign=" + oParam.campaign);
            } 
            switch (oParam.view) {
                case "myAuthoredIdeas": 
                    sFormattedTarget = "#/ideas-my/";
                    break;
                default:
                    sFormattedTarget = "#/ideas-all/";
                    break;
            }
        }
    }
    return _concatenateQueryParams(aQueryParams, sFormattedTarget);
}
function mapCampaign(aParams, sNewTarget) {
    var sFormattedTarget = sNewTarget;
    var aQueryParams = [];
    if (aParams && aParams[1]) {
        var oParam = repairAndParseJSON(aParams[1]);
        if (oParam) {
            sFormattedTarget += oParam.campaign + "/";
            switch (oParam.view) {
                case "campaignIdeas": 
                    sFormattedTarget += "ideas";
                    break;
                case "campaignComments": 
                    sFormattedTarget += "comment";
                    break;
                default:
                    sFormattedTarget += "ideas";
                    break;
            }
            _addSorterParams(oParam.sorter, aQueryParams);
            if (oParam.status) {
                aQueryParams.push("status=" + oParam.status);
            }
            if (oParam.phase) {
                aQueryParams.push("phase=" + oParam.phase);
            }
        }
    }
    return _concatenateQueryParams(aQueryParams, sFormattedTarget);
}
function mapCampaignbrowser(aParams, sNewTarget) {
    var sFormattedTarget;
    var aQueryParams = [];
    if (aParams && aParams[1]) {
        var oParam = repairAndParseJSON(aParams[1]);
        if (oParam) {
            sFormattedTarget += oParam.campaign + "/";
            switch (oParam.view) {
                case "active": 
                    sFormattedTarget = "#/campaigns-active/";
                    break;
                case "future": 
                    sFormattedTarget = "#/campaigns-future/";
                    break;
                case "past": 
                    sFormattedTarget = "#/campaigns-past/";
                    break;
                default:
                    sFormattedTarget = "#/campaigns-all/";
                    break;
            }
            _addSorterParams(oParam.sorter, aQueryParams);
        }
    }
    return _concatenateQueryParams(aQueryParams, sFormattedTarget);
}
function mapWall(aParams, sNewTarget) {
    var sFormattedTarget;
    if (aParams && aParams[1]) {
        var oParam = repairAndParseJSON(aParams[1]);
        if (oParam && oParam.id && oParam.id > 0) {
            sFormattedTarget = "#/wall/" + oParam.id;
        }
    }
    return sFormattedTarget;
}
function mapWallbrowser(aParams, sNewTarget) {
    var sFormattedTarget;
    var aQueryParams = [];
    if (aParams && aParams[1]) {
        var oParam = repairAndParseJSON(aParams[1]);
        if (oParam) {
            switch (oParam.view) {
                case "myWalls": 
                    sFormattedTarget = "#/walls-my/";
                    break;
                case "sharedWalls": 
                    sFormattedTarget = "#/walls-shared/";
                    break;
                case "myWallTemplates": 
                    sFormattedTarget = "#/walls-templates/";
                    break;
                case "sharedWallTemplates": 
                    sFormattedTarget = "#/walls-sharedtemplates/";
                    break;
                default:
                    sFormattedTarget = "#/walls-my/";
                    break;
            }
            _addSorterParams(oParam.sorter, aQueryParams);
        }
    }
    return _concatenateQueryParams(aQueryParams, sFormattedTarget);
}