//$.import("sap.ino.xs.aof.rest", "dispatcher").dispatchDefault();
var Dispatcher = $.import("sap.ino.xs.aof.rest", "dispatcher");
var RESTAdapter = $.import("sap.ino.xs.aof.rest", "adapter");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");

TraceWrapper.wrap_request_handler(function(){
    var oRequestInfo = RESTAdapter._getRequestInfo($.request);
    if (oRequestInfo.isPropertiesRequest) {
        var oBody = {};
        var sKey = oRequestInfo.keys[0];
        oBody[sKey] = {
            actions: {},
            nodes: {}
        };
        oRequestInfo.requestedActions.forEach(function(sAction) {
            oBody[sKey].actions[sAction] = {enabled: true, messages: []};
        });
        oRequestInfo.requestedNodes.forEach(function(sNode) {
            if (sNode === "Root") {
                oBody[sKey].nodes[sNode] = {};
                oBody[sKey].nodes[sNode][sKey] = {
                    attributes: {
                        ACTION_CODE: {
            				required: true,
            				messages: []
            			}
                    },
                    messages: [],
                    readOnly: false
                };
            }
        });
        $.response.status = 200;
        $.response.contentType = "application/json";
        $.response.setBody(JSON.stringify(oBody));
    } else {
        Dispatcher.dispatchDefault();
    }
});