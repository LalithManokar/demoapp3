var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.core", "authorization");
var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
var Attachment = AOF.getApplicationObject("sap.ino.xs.object.attachment.Attachment");
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
var util = $.import("sap.ino.xs.rest.api", "util");
const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();

function user_get(user, return_inf) {
	var errorMessages;
	try {
		util.getSessionUser(user);//get user
	} catch (e) {
		  errorMessages = {
			"STATUS": "The UserID you input is not existed "
		};
	$.response.status = 403;
    util.handlError(return_inf, user, errorMessages, $.response);
					return false;
	} 
	var aID1;
	var aID2;

	var oUsername = user.Parameters.Username ? user.Parameters.Username : "";
	var oEmailAddress = user.Parameters.Email ? user.Parameters.Email : "";
	if (!oUsername && !oEmailAddress) {
		return_inf = {
			"RESULT": "E",
			"Username": oUsername,
			"EmailAddress": oEmailAddress,
			"IdentityId": "",
			"MESSAGES": [
				{
					"STATUS": "error from input data"
                        }
                        ]

		};
		var JSONstr = JSON.stringify(return_inf, null, 4);
		$.response.status = 400;
		$.response.contentType = "applition/json";
		$.response.setBody(JSONstr);

		return;
	}

	if (oUsername) {
		aID1 = oHQ.statement(
			'select ID from "sap.ino.db.iam::t_identity" where USER_NAME = ?'
		)
			.execute(oUsername);
	}

	if (oEmailAddress) {
		aID2 = oHQ.statement(
			'select  ID from "sap.ino.db.iam::t_identity" where EMAIL = ?'
		)
			.execute(oEmailAddress);
	}

	var bID1 = aID1 && ((aID1.length > 0) ? aID1[0].ID : "");
	var bID2 = aID2 && ((aID2.length > 0) ? aID2[0].ID : " ");
	if ((aID1 && aID2) && (aID1.length > 0) && (aID2.length > 0) && aID1[0].ID !== aID2[0].ID) {
		return_inf = {
			"RESULT": "E",
			"Username": oUsername,
			"EmailAddress": oEmailAddress,
			"IdentityId": "",
			"MESSAGES": [
				{
					"STATUS": "The user information you input is not matching"
                        }
                        ]

		};
		$.response.status = 400;
		$.response.contentType = "applition/json";
		$.response.setBody(JSON.stringify(return_inf, null, 4));

		return;
	}
	if (bID1 || bID2) {
		return_inf = {
			"RESULT": "S",
			"Username": oUsername,
			"EmailAddress": oEmailAddress,
			"IdentityId": bID1 ? bID1 : bID2,
			"MESSAGES": [
				{
					"STATUS": "Completed the query successfully"
                                }
                            ]

		};

	} else {
		return_inf = {
			"RESULT": "E",
			"Username": oUsername,
			"EmailAddress": oEmailAddress,
			"IdentityId": "",
			"MESSAGES": [
				{
					"STATUS": "There is no matching data"
                                }
                            ]

		};
		$.response.status = 400;
	}

	$.response.contentType = "applition/json";
	$.response.setBody(JSON.stringify(return_inf, null, 4));
	oConn.commit();
	return $.response;

}