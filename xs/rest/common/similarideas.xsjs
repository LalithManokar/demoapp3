const traceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");

/**
 * parses the query path in order to get endpoint and idea id, further assembles all optional parameters
 * 
 * @private
 * @returns {object}        an JS object containing id, filterDraft and endpoint
 */ 
function parseParameters() {
    var iParamId, sEndpoint;
    var iId = parseInt($.request.parameters.get("id"), 10);
    var bFilterDraft = $.request.parameters.get("filterDraft") === "true";
    var iLimit = parseInt($.request.parameters.get("limit"), 10);
    var iCampId = parseInt($.request.parameters.get("campId"), 10);
    // split query Path and clean from empty parts
    var aParts = ($.request.queryPath && $.request.queryPath.split("/") || []).filter(function (item) { return !!item; });
    if (aParts.length >= 2) {
        // standard: 2 query path parts - endpoint/id
        sEndpoint = aParts[0];
        iParamId = parseInt(aParts[1], 10);
    } else if (aParts.length === 1) {
        // backwards compatibility - only id
        iParamId = parseInt(aParts[0], 10);
        if ($.request.method === $.net.http.POST) {
            sEndpoint = "bytext";
        } else {
            sEndpoint = "byid";
        }
    } else if (aParts.length === 0) {
        // nothing - behave nicely
        sEndpoint = "byid";
        iParamId = null;
    }
    return {
        id : iParamId || iId || null,
        filterDraft : bFilterDraft,
        endpoint: sEndpoint,
        limit: iLimit,
        iCampId: iCampId
    };
}

traceWrapper.wrap_request_handler(function(bTraceActive) {
    const similarIdeas = $.import("sap.ino.xs.xslib", "SimilarIdeas");
    // analyze parameters
    var oParameters = parseParameters();
    var oResult, sTitle, sDescription, aTags;
    
    // check for request endpoint - "byid" - GET is similarity by id, "bytext" - POST is similarity by texts
    switch (oParameters.endpoint) {
        case "bytext":
            // must be POST!
            if ($.request.method !== $.net.http.POST) {
                $.response.status = $.net.http.METHOD_NOT_ALLOWED;
                return;
            }
            // extract data from POST data
            sTitle = $.request.parameters.get("name");
            sDescription = $.request.parameters.get("description");
            try {
                aTags = JSON.parse($.request.parameters.get("tags"));
            } catch (ex) {
                aTags = [];
            }
            oResult = similarIdeas.getSimilarIdeasByText(oParameters.id, sTitle || "", sDescription || "", aTags || [], undefined, oParameters.filterDraft, oParameters.limit, oParameters.iCampId);
            break;
        case "byid":
            oResult = similarIdeas.getSimilarIdeasById(oParameters.id, oParameters.filterDraft, oParameters.limit, oParameters.iCampId);
            break;
        default:
            // default action is similarity by ID
            oResult = similarIdeas.getSimilarIdeasById(oParameters.id, oParameters.filterDraft, oParameters.limit, oParameters.iCampId);
    }

    $.response.contentType = "application/json";
    $.response.status = $.net.http.OK;
    oResult = JSON.stringify(oResult);
    // fulfill tracing contract
    if (!bTraceActive) {
        $.response.setBody(oResult);
    } else {
        return oResult;
    }
});