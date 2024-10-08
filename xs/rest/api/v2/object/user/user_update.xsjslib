var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
var util = $.import("sap.ino.xs.rest.api", "util");
var sqlUtil = $.import("sap.ino.xs.rest.api", "sqlUtil");
const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();

const aAllowUpdateFields = ["USER_NAME", "FIRST_NAME", "LAST_NAME", "EMAIL", "PHONE", "MOBILE", "COST_CENTER", "ORGANIZATION", "OFFICE",
	"DESCRIPTION", "COMPANY", "STREET", "CITY", "COUNTRY", "ZIP_CODE", "VALIDATION_TO"];

function user_update(oPayload, response) {
    try {
		util.getSessionUser(oPayload); //get user
	} catch (e) {
		response = util.generateResponseData(403, "Error", "The UserID you input is not existed");
		return util.handleResponse(response);
	}
	var aUpdateResult = [];

	var aUpdatedUser = oPayload.Parameters && oPayload.Parameters instanceof Array ? oPayload.Parameters : [];
	if (aUpdatedUser.length > 2500) {
		response.status = 400;
		response.msg = 'The length of parameters of users is over 2500';
		return util.handleResponse(response);
	}
	_.map(aUpdatedUser, function(user) {
		try {
			const oUpdateObj = sqlUtil.generateUpdateSql(user, aAllowUpdateFields);
			sqlUtil.updateObjectByUserName("\"sap.ino.db.iam::t_identity\"", oUpdateObj, user.USER_NAME, oHQ);
		} catch (dbException) {
			aUpdateResult.push({
				user_name: user.USER_NAME,
				message: dbException.toString()
			});
			oConn.rollback();
		}
	});

	response.status = aUpdateResult.length > 0 ? 400 : 200;
	response.data = {
		data: aUpdateResult
	};
	response.msg = aUpdateResult.length > 0 ?
		"Indicated users have been updated unsuccessfully, Please refer to the response data to check your input" :
		"Indicated users have been updated successfully";

	util.logMonitor(oPayload, response);
	if (aUpdateResult.length === 0) {
		oConn.commit();
	} else {
		oConn.rollback();
	}
	return util.handleResponse(response);

}