var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var aHanlders = {
	"sap.ino.xs.object.idea.Idea": function getIdea(nId) {
		var oHQ = dbConnection.getHQ();
		var sSql = ' ' +
			'SELECT idea.id AS ID, ' +
			' 	idea.campaign_id AS REF_ID, ' +
			' 	camp.name AS REF_NAME' +
			' FROM "sap.ino.db.idea::t_idea" AS idea ' +
			' 	INNER JOIN "sap.ino.db.campaign::v_campaign_t_locale" AS camp ' +
			' 	ON idea.campaign_id = camp.campaign_id ' +
			' WHERE idea.id = ? ';
		return oHQ.statement(sSql).execute(nId);
	}
};

TraceWrapper.wrap_request_handler(function() {
	if ($.request.method !== $.net.http.POST) {
		$.response.status = 405;
		return;
	}

	if (!$.request.body) {
		$.response.status = 400;
		return;
	}
	try {
		var reqBody = JSON.parse($.request.body.asString());
		var sObject = ["sap.ino.xs.object.idea.Idea"];
		if (sObject.indexOf(reqBody.ObjectName) < 0) {
			$.response.status = 403;
			return;
		}
		if(!_.isInteger(reqBody.ID)){
			$.response.status = 400;
			return;
		}
		var result = aHanlders[reqBody.ObjectName](reqBody.ID);
		if(!result && result.length === 0){
    		$.response.status = 404;
    		return;
		}
		$.response.contentType = "application/json";
		$.response.setBody(JSON.stringify(result[0], null, 4));
	} catch (e) {
		$.response.status = 500;
	}
});