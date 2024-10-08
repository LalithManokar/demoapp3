//Example calls:
//select experts from idea 2
//http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/experts2.xsjs/byid?ID=2

//select experts from idea 2 and 54
//http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/experts2.xsjs/byid?ID=2&ID=54

//select experts from tags BPM and HANA
//http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/experts2.xsjs/bytag?TAG=BPM&TAG=HANA

//select experts from tags HANA
//http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/experts2.xsjs/bytag?&TAG=HANA
const traceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");

/**
 * parses the query path in order to get endpoint and all other parameters
 * 
 * @private
 * @returns {object}        an JS object containing endpoint and other information
 */ 
function parseParameters() {
    var vIds = $.request.parameters.get("id");
    var vTags = $.request.parameters.get("tag");
    var iLimit = parseInt($.request.parameters.get("limit"), 10);
    var iIdeas = parseInt($.request.parameters.get("ideas"), 10);
    // split query Path and clean from empty parts
    var aParts = ($.request.queryPath && $.request.queryPath.split("/") || []).filter(function (item) { return !!item; });
    var sEndpoint = (aParts && aParts[0] || "").toLowerCase();
    
    return {
        ids : vIds || null,
        tags: vTags || null,
        endpoint: sEndpoint,
        limit: iLimit,
        ideas: iIdeas
    };
}

traceWrapper.wrap_request_handler(function(bTraceActive) {
    const expert = $.import("sap.ino.xs.xslib", "expertFinder");
    
    var oParams = parseParameters();
    
    if(expert.checkIsActive() && ["bytag", "byid"].indexOf(oParams.endpoint) !== -1) {
        
        var oBody;
        
        if (oParams.endpoint === "bytag") {
            oBody = expert.identifyExpertsByTag(oParams.tags, oParams.limit, oParams.ideas);
        } else if (oParams.endpoint === "byid") {
            oBody = expert.identifyExpertsById(oParams.ids, oParams.limit, oParams.ideas);
        }
        
        if (oBody) {
            $.response.contentType = "application/json";
            $.response.setBody(JSON.stringify(oBody)); 
            $.response.status = $.net.http.OK;
        } else {
            $.response.contentType = "text/plain";
            $.response.setBody("");
            $.response.status = $.net.http.BAD_REQUEST;
        }
    } else {
        $.response.contentType = "text/plain";
        $.response.setBody("");
        $.response.status = $.net.http.NOT_FOUND;
    }
});