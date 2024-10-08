var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.core", "authorization");
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");

const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();

function handlError(return_inf, user, errorMessages, response) {
	return_inf.RESULT = "E";
	return_inf.MESSAGES = [];
	var messages = {
		"STATUS": errorMessages
	};
	return_inf.MESSAGES.push(messages);
	get_Wrong_inf(user, return_inf, response);
	return;
}

function stringToArrayBuffer(str) {
	var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
	var bufView = new Uint16Array(buf);
	for (var i = 0, strLen = str.length; i < strLen; i++) {
		bufView[i] = str.charCodeAt(i);
	}
	return buf;
}

function getSessionUser(user) {
	var sessionName = $.session.getUsername();
	if (user.UserID) {
		var UserId = user.UserID.toUpperCase();
		var oResult = oHQ.statement(' select user_name from "sap.ino.db.iam::t_identity" where user_name = \'' + UserId + '\'').execute();
		auth.setApplicationUser(oResult[0].USER_NAME);
		return;
	}
	auth.setApplicationUser(sessionName);
	return;
}
//Check the type of input
function check_type(para, type, return_inf) {
	return_inf.MESSAGES = [];
	if (para) {
		if ((typeof para) !== type) {
			return_inf.RESULT = "E";
			var MESSAGES = {
				"STATUS": para + "is Invalid data type for" + type
			};
			return_inf.MESSAGES.push(MESSAGES);
			return true;
		} else {
			return false;
		}
	} else {
		return_inf.RESULT = "E";
		var oMESSAGES = {
			"STATUS": "Required field missing "
		};
		return_inf.MESSAGES.push(oMESSAGES);
		return true;
	}
}

function getLength(str) {
	var realLength = 0,
		len = str.length,
		charCode = -1;
	for (var i = 0; i < len; i++) {
		charCode = str.charCodeAt(i);
		if (charCode >= 0 && charCode <= 128) {
			realLength += 1;
		} else {
			realLength += 2;
		}
	}
	return realLength;

}
//
function selectionSort(arr) {
	var len = arr.length;
	var minIndex, temp;
	for (var i = 0; i < len - 1; i++) {
		minIndex = i;
		for (var j = i + 1; j < len; j++) {
			if (arr[j] < arr[minIndex]) {
				minIndex = j;
			}
		}
		temp = arr[i];
		arr[i] = arr[minIndex];
		arr[minIndex] = temp;
	}
	return arr;
}

function selectionSort_res(arr) {
	var len = arr.length;
	var minIndex, temp;
	for (var i = 0; i < len - 1; i++) {
		minIndex = i;
		for (var j = i + 1; j < len; j++) {
			if (arr[j].PAGE_NO < arr[minIndex].PAGE_NO) {
				minIndex = j;
			}
		}
		temp = arr[i].PAGE_NO;
		arr[i].PAGE_NO = arr[minIndex].PAGE_NO;
		arr[minIndex].PAGE_NO = temp;
	}
	return arr;
}

//The response od AOF
function error_response(oResponse, back) {

	for (var ii = 0; ii < oResponse.messages.length; ii++) {

		var message = {
			"messageKey": oResponse.messages[ii].messageKey,
			"messageText": oResponse.messages[ii].messageText
		};
		back.MESSAGES.push(message);

	}
	return back;

}

//send mes
function send_mes(back) {
	var real_back = {};
	real_back = back;
	var MESSAGES = back.MESSAGES;
	delete real_back.MESSAGES;

	real_back.MESSAGES = MESSAGES;
	// 	real_back.user_name = $.session.getUsername();

	var JSONstr = JSON.stringify(real_back, null, 4);
	$.response.contentType = "applition/json";
	$.response.setBody(JSONstr);
	return $.response;

}
// return response when check_type make mistakes
function get_Wrong_inf(user, return_inf) {

	switch (user.method) {
		case "page_add":

			return_inf.CAMPAIGN_ID = user.Parameters.ID ? user.Parameters.ID : "";
			// objectName = "CAMPAIGN_ID";
			break;
		case "campaign_create":

			return_inf.CAMPAIGN_ID = "-1";
			//objectName = "CAMPAIGN_ID";
			break;
		case "idea_update":
		case "idea_create":
		case "idea_delete":
		case "idea_read":
		case "idea_evaluations":

			return_inf.IDEA_ID = user.Parameters.IDEA_ID ? user.Parameters.IDEA_ID : "";
			//objectName = "IDEA_ID";
			break;
		case "campaign_publish":

			return_inf.CAMPAIGN_ID = user.Parameters.Campaign_ID ? user.Parameters.Campaign_ID : "";
			//objectName = "CAMPAIGN_ID";
			break;
		case "campaign_read":

			return_inf.CAMPAIGN_ID = user.Parameters.Campaign_ID ? user.Parameters.Campaign_ID : "";
			//objectName = "CAMPAIGN_ID";
			break;
		case "campaign_copy":

			return_inf.CAMPAIGN_ID = "";
			//objectName = "CAMPAIGN_ID";
			break;
		case "campaign_update":

			return_inf.CAMPAIGN_ID = "";
			//objectName = "CAMPAIGN_ID";
			break;
		case "campaign_update":

			return_inf.Attachment_ID = "";
			//objectName = "Attachment_ID";
			break;
		case "campaign_resp_list_read":

			return_inf.CAMPAIGN_ID = user.Parameters.CAMPAIGN_ID;
			//objectName = "CAMPAIGN_ID";
			break;
		case "campaign_ideaForm_read":

			return_inf.CAMPAIGN_ID = user.Parameters.CAMPAIGN_ID;
			//objectName = "CAMPAIGN_ID";
			break;
	}
	if ($.response.status !== 400 && $.response.status !== 200) {
		$.response.status = $.response.status;
	} else {
		$.response.status = 400;
	}
	send_mes(return_inf);
}
//judge the information from the aof
function check_rep(oResponse, return_inf, user) {

	var ouser = user;
	// var objectName = "";
	if (oResponse.messages && oResponse.messages[0].severity <= 2) {
		return_inf.RESULT = "E";
		var ostatus;
		switch (user.method) {
			case "page_add":

				return_inf.CAMPAIGN_ID = oResponse.messages[0].refKey;
				return_inf.MESSAGES = [];
				ostatus = {
					"STATUS": "error from input data"

				};
				return_inf.MESSAGES.push(ostatus);
				break;
			case "campaign_create":

				return_inf.CAMPAIGN_ID = oResponse.messages[0].refKey;
				return_inf.MESSAGES = [];
				ostatus = {
					"STATUS": "error from input data"

				};
				return_inf.MESSAGES.push(ostatus);
				break;
			case "idea_update":

				return_inf.IDEA_ID = oResponse.messages[0].refKey;
				return_inf.MESSAGES = [];
				ostatus = {
					"STATUS": "error from input data"

				};
				return_inf.MESSAGES.push(ostatus);
				break;

			case "campaign_publish":

				return_inf.CAMPAIGN_ID = oResponse.messages[0].refKey;
				return_inf.MESSAGES = [];
				ostatus = {
					"STATUS": "error from input data"

				};
				return_inf.MESSAGES.push(ostatus);
				break;
			case "campaign_update":

				return_inf.CAMPAIGN_ID = oResponse.messages[0].refKey;
				return_inf.MESSAGES = [];
				ostatus = {
					"STATUS": "error from input data"

				};
				return_inf.MESSAGES.push(ostatus);
				break;
			case "campaign_copy":

				return_inf.CAMPAIGN_ID = user.Parameters.Campaign_ID;
				return_inf.MESSAGES = [];
				ostatus = {
					"STATUS": "error from input data"

				};
				return_inf.MESSAGES.push(ostatus);
				break;
			case "idea_create":
				return_inf.IDEA_ID = "";
				return_inf.MESSAGES = [];
				ostatus = {
					"STATUS": "error from input data"

				};
				return_inf.MESSAGES.push(ostatus);
				break;
			case "idea_delete":
				return_inf.IDEA_ID = "";
				return_inf.MESSAGES = [];
				ostatus = {
					"STATUS": "error from input data"

				};
				return_inf.MESSAGES.push(ostatus);
				break;
			case "idea_read":
				return_inf.IDEA_ID = "";
				return_inf.MESSAGES = [];
				ostatus = {
					"STATUS": "error from input data"

				};
				return_inf.MESSAGES.push(ostatus);
				break;
			case "idea_evaluations":
				return_inf.IDEA_ID = "";
				return_inf.MESSAGES = [];
				ostatus = {
					"STATUS": "error from input data"

				};
				return_inf.MESSAGES.push(ostatus);
				break;
			case "attachment_create":
				return_inf.Attachment_ID = "";
				return_inf.MESSAGES = [];
				ostatus = {
					"STATUS": "error from input data"

				};
				return_inf.MESSAGES.push(ostatus);
				break;
		}
		$.response.status = 400;
		oConn.rollback();
		return_inf = error_response(oResponse, return_inf);
		return send_mes(return_inf);
	}

	var iKey = oResponse.generatedKeys[-1];

	return_inf = get_inf(ouser, return_inf, iKey);

	return_inf = error_response(oResponse, return_inf);
	send_mes(return_inf);
	oConn.commit();

}
//  return successful information
function get_inf(user, back, iKey, response) {
	back.MESSAGES = [];
	var MESSAGES;
	switch (user.method) {
		case "page_add":
			back.RESULT = "S";
			back.CAMPAIGN_ID = user.Parameters.ID;
			MESSAGES = {
				"STATUS": "Successfully added the page"
			};
			back.MESSAGES.push(MESSAGES);
			break;
		case "campaign_create":
			back.RESULT = "S";
			back.CAMPAIGN_ID = iKey;
			MESSAGES = {
				"STATUS": "Successfully created the campaign"
			};
			back.MESSAGES.push(MESSAGES);
			break;
		case "campaign_update":
			back.RESULT = "S";
			back.CAMPAIGN_ID = iKey;
			MESSAGES = {
				"STATUS": "Successfully updated the campaign"
			};
			back.MESSAGES.push(MESSAGES);
			break;
		case "idea_update":
			back.RESULT = "S";
			back.IDEA_ID = iKey;
			MESSAGES = {
				"STATUS": "Successfully Updated the idea "
			};
			back.MESSAGES.push(MESSAGES);
			break;
		case "campaign_publish":
			back.RESULT = "S";
			back.CAMPAIGN_ID = user.Parameters.Campaign_ID;
			MESSAGES = {
				"STATUS": "Successfully Published the campaign"
			};
			back.MESSAGES.push(MESSAGES);
			break;
		case "campaign_read":
			back.RESULT = "S";
			back.CAMPAIGN_ID = user.Parameters.Campaign_ID;
			MESSAGES = {
				"STATUS": "Successfully read the campaign",
				"RETURN": response
			};
			back.MESSAGES.push(MESSAGES);
			break;
		case "campaign_copy":
			back.RESULT = "S";
			back.CAMPAIGN_ID = iKey;
			MESSAGES = {
				"STATUS": "Successfully created template based compaign"
			};
			back.MESSAGES.push(MESSAGES); //error
			break;
		case "idea_create":
			back.RESULT = "S";
			back.IDEA_ID = iKey;
			MESSAGES = {
				"STATUS": "Successfully created the idea"
			};
			back.MESSAGES.push(MESSAGES); //error
			break;
		case "idea_delete":
			back.RESULT = "S";
			back.IDEA_ID = iKey;
			MESSAGES = {
				"STATUS": "Successfully deleted the idea"
			};
			back.MESSAGES.push(MESSAGES); //error
			break;
		case "idea_read":
			back.RESULT = "S";
			back.IDEA_ID = iKey;
			MESSAGES = {
				"STATUS": "Successfully read the idea",
				"RETURN": response
			};
			back.MESSAGES.push(MESSAGES); //error
			break;
		case "idea_evaluations":
			back.RESULT = "S";
			back.IDEA_ID = iKey;
			MESSAGES = {
				"STATUS": "Successfully read the evaluations",
				"RETURN": response
			};
			back.MESSAGES.push(MESSAGES); //error
			break;
		case "attachment_create":
			back.RESULT = "S";
			back.Attachments = iKey;
			MESSAGES = {
				"STATUS": "Successfully created the attachments",
				"RETURN": response
			};
			back.MESSAGES.push(MESSAGES); //error
			break;
		case "campaign_resp_list_read":
			back.RESULT = "S";
			back.Attachments = iKey;
			MESSAGES = {
				"STATUS": "Successfully read the responsibility list value",
				"RETURN": response
			};
			back.MESSAGES.push(MESSAGES); //error
			break;
		case "campaign_ideaForm_read":
			back.RESULT = "S";
			back.Attachments = iKey;
			MESSAGES = {
				"STATUS": "Successfully read the Idea From",
				"RETURN": response
			};
			back.MESSAGES.push(MESSAGES); //error
			break;
		default:
			back.RESULT = "S";
			MESSAGES = {
				"STATUS": "Successfully",
				"RETURN": response
			};
			back.MESSAGES.push(MESSAGES); //error
			break;
	}
	return back;
}
// parse json 
function parseJSON() {
	var req = $.request;
	var user = {};

	if (!req.body) {
		user = {
			error: "Invalid data type"
		};
		return user;
	}

	var bodyAsString = req.body.asString();
	var jsonText = JSON.parse(bodyAsString);

	function getmethod(Action) {
		var omethod = Action.method;
		return omethod;
	}

	function getParameters(Action) {
		var oParameters = Action.Parameters;
		return oParameters;
	}

	return (function() {
		var omethod = getmethod(jsonText);
		var oParameters = getParameters(jsonText);
		user = {
			method: omethod,
			Parameters: oParameters
		};
		if (jsonText.UserID) {
			user.UserID = jsonText.UserID;
		}
		return user;
	}());
}

function getUserByUsername(sUsername, oHQ) {
	if (sUsername) {
		var result = oHQ.statement(
				'select ID,USER_NAME,EMAIL,NAME  from "sap.ino.db.iam::t_identity" where USER_NAME = ?'
			)
			.execute(sUsername);
		return result.length > 0 ? result[0] : {
			ID: 0
		};
	} else {
		return {
			ID: 0
		};
	}
}

function handleResponse(oResposne) {
	$.response.status = oResposne.status;
	$.response.contentType = "applition/json";
	$.response.setBody(JSON.stringify(oResposne, null, 4));
	return $.response;
}

function logMonitor(oRequest, oResponse) {
	var monitorAO = AOF.getApplicationObject("sap.ino.xs.object.integration.MonitorIntegration");
	var sNowISO = new Date().toISOString();
	var iUserId = $.session.getUsername() || '';
	var oRes = monitorAO.create({
		ID: -1,
		STATUS: oResponse.status,
		RESPONSE_MESSAGE: JSON.stringify(oResponse),
		OBJECT_ID: null,
		DIRECTION_PATH: 'Outbound',
		PATH: "/v2/mainEntryAPI.xsjs",
		INTERFACE_NAME: oRequest.method,
		OPERATOR_BY_ID: 0,
		OPERATOR_AT: sNowISO,
		OBJECT_PAYLOAD_JSON: JSON.stringify(oRequest)
	});
	return oRes;
}

function generateResponseData(status, result, msg, data) {
	var response = {
		status: status,
		Result: result,
		Msg: msg
	};
	if (data) {
		response.Data = data;
	}
	return response;
}

function hasTime(oDate) {
	if (oDate.getHours() > 0 || oDate.getMinutes() > 0 || oDate.getSeconds() > 0 || oDate.getMilliseconds() > 0) {
		return true;
	}
	return false;
}

function setBeginOfDay(oDate) {
	if (!oDate) {
		return oDate;
	}
	oDate.setHours(0);
	oDate.setMinutes(0);
	oDate.setSeconds(0);
	oDate.setMilliseconds(0);
	return oDate;
}

function setEndOfDay(oDate) {
	if (!oDate) {
		return oDate;
	}

	oDate.setHours(23);
	oDate.setMinutes(59);
	oDate.setSeconds(59);
	oDate.setMilliseconds(999);
	return oDate;
}