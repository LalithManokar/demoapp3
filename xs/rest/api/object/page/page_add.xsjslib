var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.core", "authorization");
var Campaign = AOF.getApplicationObject("sap.ino.xs.object.campaign.Campaign");
var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
var Attachment = AOF.getApplicationObject("sap.ino.xs.object.attachment.Attachment");
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
var util = $.import("sap.ino.xs.rest.api", "util");
const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();

function page_add(user, return_inf) {
	//Define a merged template
	var new_para = {
		ID: "",
		LanguagePages: ""
	};
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
	var page = [];
	var page_sort = [];
	var page_new = [];
	var ii_count = 0;
	var oo_count = 0;

	if (util.check_type(user.Parameters.ID, "number", return_inf)) {
		return util.get_Wrong_inf(user, return_inf);
	}
	var oResponse;
	try {
		oResponse = Campaign.read(user.Parameters.ID); //read campaign
	} catch (e) {
		return_inf.RESULT = "E";
		return_inf.MESSAGES = [];
		var messages = {
			"STATUS": "Please check your input and privileges for User "
		};
		return_inf.MESSAGES.push(messages);
		util.get_Wrong_inf(user, return_inf);

	}
	oResponse.LanguagePages = util.selectionSort_res(oResponse.LanguagePages); //Sort the original pages 
	for (var ii = 0; ii < oResponse.LanguagePages.length; ii++) {
		page_sort[ii] = oResponse.LanguagePages[ii].PAGE_NO;
		ii_count += 1;

	}
	page = util.selectionSort(page_sort); //Sort the input pages 
	for (var oo = 0; oo < user.Parameters.LanguagePages.length; oo++) {
		page_new[oo] = user.Parameters.LanguagePages[oo].PAGE_NO;
		oo_count += 1;

	}
	//if original pages count is empty
	(function() {
		if (ii_count === 0) {
			for (var pp = 0; pp < user.Parameters.LanguagePages.length; pp++) {
				user.Parameters.LanguagePages[pp].PAGE_NO = pp;

			}
			var oResponse_f;
			try {
				oResponse_f = Campaign.update(user.Parameters);
			} catch (e) {
				return_inf.RESULT = "E";
				return_inf.MESSAGES = [];
				var messages = {
					"STATUS": "Please check your input and privileges for User "
				};
				return_inf.MESSAGES.push(messages);
				util.get_Wrong_inf(user, return_inf);

			}
			if (oResponse_f.messages.length !== 0) {
				util.check_rep(oResponse_f, return_inf, user);
				return;
			}

			return_inf = util.get_inf(user, return_inf);
			util.send_mes(return_inf);
			oConn.commit();
			return;

		}
	}());
	//logic ot the insertion

	(function() {
		var max_page = page[ii_count - 1];
		for (var pp = 0; pp < user.Parameters.LanguagePages.length; pp++) {
			if (page_new[pp] > max_page) {

				user.Parameters.LanguagePages[pp].PAGE_NO = max_page + 1;
				max_page++;
			} else {
				for (var qq = 0; qq < oResponse.LanguagePages.length; qq++) {
					if (page_new[pp] === oResponse.LanguagePages[qq].PAGE_NO) {
						for (var aa = qq; aa < oResponse.LanguagePages.length; aa++) {
							oResponse.LanguagePages[aa].PAGE_NO += 1;
							page[aa] += 1;

						}

					}
				}

			}

		}

		new_para.LanguagePages = user.Parameters.LanguagePages.concat(oResponse.LanguagePages);
		new_para.ID = user.Parameters.ID;
		var oResponse_s;
		try {
			oResponse_s = Campaign.update(new_para);
		} catch (eMissPrivilege) {
			errorMessages = "Please check whether the user you input has privilege ";
			$.response.status = 401;
			util.handlError(return_inf, user, errorMessages, $.response);
			return false;

		}
		if (oResponse_s.messages.length !== 0) {
			util.check_rep(oResponse_s, return_inf, user);
			return;
		}

		return_inf = util.get_inf(user, return_inf);
		util.send_mes(return_inf);
		oConn.commit();
		return;

	}());

}