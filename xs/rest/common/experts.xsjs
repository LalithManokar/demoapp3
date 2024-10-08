$.import("sap.ino.xs.xslib", "hQuery");
$.import("sap.ino.xs.xslib", "trace");
var trace = $.sap.ino.xs.xslib.trace;
$.import("sap.ino.xs.xslib", "traceWrapper");
var traceWrapper = $.sap.ino.xs.xslib.traceWrapper;

var expert = $.import("sap.ino.xs.xslib", "experts");

if(expert.checkIsActive()) {
    var tags = $.request.parameters.get("TAG");
    var ideaIds = $.request.parameters.get("ID");
    var iLimit = $.request.parameters.get("TOP");
    var bGroupByIdea = ["true", "TRUE", "X"].indexOf($.request.parameters.get("GROUPIDEAS")) > -1 ? true : false;

    if(typeof tags != 'undefined' || typeof ideaIds != 'undefined') {
        var body = JSON.stringify(expert.getExperts(tags,ideaIds,iLimit, bGroupByIdea));

        $.response.contentType = "application/json";
        $.response.setBody(body); 
        $.response.status = $.net.http.OK;
    } else {
        $.response.contentType = "text/plain";
        $.response.setBody('');
        $.response.status = $.net.http.BAD_REQUEST;
    }
} else {
    $.response.contentType = "text/plain";
    $.response.setBody('');
    $.response.status = $.net.http.NOT_FOUND;
}

//Example calls:
//select experts from idea 2
//http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/experts.xsjs?ID=2

//select experts from idea 2 and 54
//http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/experts.xsjs?ID=2&ID=54

//select experts from tags BPM and HANA
//http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/experts.xsjs?TAG=BPM&TAG=HANA

//select experts from tags HANA
//http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/experts.xsjs&TAG=HANA

//these calls combine Tags and Ids
//http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/experts.xsjs?ID=2&TAG=BPM
//http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/experts.xsjs?ID=2&ID=54&TAG=BPM

//group ideas and provide expert activity counters
//http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/experts.xsjs?ID=2&GROUPIDEAS=X
//http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/experts.xsjs?TAG=BPM&GROUPIDEAS=TRUE
