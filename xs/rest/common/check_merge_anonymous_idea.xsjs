var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");

const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();
var res = {
	allow: 1,
	reject: 0
};

function check() {
	var ideaId = $.request.parameters.get("idea_id");
	var aIdeaArray = ideaId.split(','),
		sCondition, aIdeaIds = [];
	if (aIdeaArray.length > 3000) {
		return res.reject;
	}
	for (var i = 0; i < aIdeaArray.length; i++) {
		if (!Number.isNaN(Number(aIdeaArray[i])) && Number(aIdeaArray[i]) > 0) {
			aIdeaIds.push(Number(aIdeaArray[i]));
			sCondition += " OR IDEA_ID = ? ";
		}
	}
	var resultBody = oHQ.statement(
		'SELECT IS_ANONYMOUS FROM "sap.ino.db.idea::v_idea_settings_test" WHERE 1!=1 ' + sCondition
	).execute(aIdeaIds);

	if (resultBody && resultBody.length > 0) {
		for (var index = 0; index < resultBody.length; index++) {
			if (resultBody[index].IS_ANONYMOUS === 'true') {
				return res.reject;
			}
		}
	}
	return res.allow;
}
var result = check();
$.response.contentType = "applition/json";
$.response.setBody(result);