var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.core", "authorization");
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
var util = $.import("sap.ino.xs.rest.api", "util");
const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();

function idea_evaluations(user, return_inf) {
	var errorMessages;
	try {
		util.getSessionUser(user); //get user
	} catch (e) {
		errorMessages = {
			"STATUS": "The UserID you input is not existed "
		};
		$.response.status = 403;
		util.handlError(return_inf, user, errorMessages, $.response);
		return false;
	}
	var ideaId = user.Parameters.IDEA_ID;

	if (util.check_type(ideaId, "number", return_inf)) {
		return util.get_Wrong_inf(user, return_inf);
	}
	var oResponse;
	try {
		if (ideaId) {
			oResponse = oHQ.statement(
				'select * from "sap.ino.db.evaluation.ext::v_ext_evaluation" where IDEA_ID = ?'
			)
				.execute(ideaId);
		}
	} catch (eMissPrivilege) {
		errorMessages = "Please check whether the user you input has privilege read this idea";
		$.response.status = 401;
		util.handlError(return_inf, user, errorMessages, $.response);
		return false;

	}
	if (oResponse === null) {
		errorMessages = "The idea id you indicated is not existed ";
		$.response.status = 400;
		util.handlError(return_inf, user, errorMessages, $.response);
		return false;
	}
	return_inf = util.get_inf(user, return_inf, ideaId, oResponse);
	util.send_mes(return_inf);
	oConn.commit();
}