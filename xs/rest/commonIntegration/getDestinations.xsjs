var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

const trace = $.import("sap.ino.xs.xslib", "trace");
//var httpdest = $.import("sap.hana.xs.admin.server.httpDestination", "httpdest");
var getDest = $.import("sap.ino.xs.rest.commonIntegration", "destinations");
const whoAmI = 'sap.ino.xs.rest.redirect_jira';

function debug(line) {
	trace.debug(whoAmI, line);
}

var ContentType = {
	Plain: "text/plain",
	JSON: "application/json"
};

function _forwardRequest(oRequest, oResponse) {
	var iMethod = oRequest.method;
// 	var sQueryPath = oRequest.queryPath;
    var aParameters = oRequest.parameters;
    var sPackage,sName;
    for(var i = 0 ;i < aParameters.length;i++)
    {
        if(aParameters[i].name === "package")
        {
            sPackage = aParameters[i].value;
        }
        if(aParameters[i].name === "name")
        {
            sName = aParameters[i].value;
        }
    }
    
	if (iMethod !== $.net.http.GET) {
		oResponse.status = $.net.http.METHOD_NOT_ALLOWED;
		oResponse.contentType = ContentType.Plain;
		oResponse.setBody("Method not supported");
		return undefined;
	} else {
		//var aDestinations = getDest.getAllDestinations();
        var oDestionation = getDest.getDestination(sPackage ,sName);
		var JSONstr = JSON.stringify(oDestionation, null, 4);

		$.response.contentType = ContentType.JSON;
		$.response.setBody(JSONstr);
	}
}

$.import("sap.ino.xs.xslib", "traceWrapper")
	.wrap_request_handler(function() {
		return _forwardRequest($.request, $.response);
	});