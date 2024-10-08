var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
var util = $.import("sap.ino.xs.rest.api", "util");
const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();

function user_get_all(user, response) {
	try {
		util.getSessionUser(user); //get user
	} catch (e) {
		response = util.generateResponseData(403, "Error", "The UserID you input is not existed");
		return util.handleResponse(response);
	}
	var aAllUser = [];
	try {
		aAllUser = oHQ.statement(
			'select  ID,USER_NAME,EMAIL from "sap.ino.db.iam::t_identity" where ERASED = 0'
		).execute();
	} catch (e) {
		response.status = 400;
		response.msg = 'The length of parameters of users is over 2500';
		return util.handleResponse(response);
	}

	response = {
		"status": 200,
		"data": {
			count: aAllUser.length,
			data: aAllUser
		},
		"msg": "Successfully get all users"

	};
	util.handleResponse(response);

	return $.response;

}