const trace = $.import("sap.ino.xs.xslib", "trace");
const whoAmI = 'sap.ino.xs.object.iam.login';
var textBundle = $.import("sap.ino.xs.xslib", "textBundle");
var i18n = $.import("sap.ino.xs.xslib", "i18n");
var simpleHtmlUtil = $.import("sap.ino.xs.xslib", "simpleHtmlUtil");
const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");

function debug(line) {
	trace.debug(whoAmI, line);
}

var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var EnhancementSpot = $.import("sap.ino.xs.xslib.enhancement", "EnhancementSpot");

/*
 * Application login, triggered during UI bootstrap
 *
 * @returns { status: HTTP status code, body: object to put in response }
 */
function executeUserActionInternal(oAobjectLib, oAobject, sActionName, iUserId, oParameters) {
	var oResponse;
	try {
		// ensure that framework can alter data
		oAobjectLib.setLoginMode();
		debug("execute action: " + sActionName);
		oResponse = oAobject[sActionName].call(undefined, iUserId, oParameters);
	} finally {
		oAobjectLib.resetLoginMode();
	}
	return oResponse;
}

function executeUserSettingsActionInternal(oAobjectLib, oAobject, sActionName, iUserId, oParameters) {
	debug("execute action: " + sActionName);
	return oAobject[sActionName].call(undefined, iUserId, oParameters);
}

function wrapAction() {
	var aArgs = _.toArray(arguments);

	var sObjectLib = aArgs.shift();
	var fnFunction = aArgs.shift();

	var AOF = $.import("sap.ino.xs.aof.core", "framework");
	var oTransaction = AOF.getTransaction();
	var iObjectIndex = sObjectLib.lastIndexOf(".");
	var AObjectLib = $.import(sObjectLib.substring(0, iObjectIndex), sObjectLib.substring(iObjectIndex + 1));
	var AObject = AOF.getApplicationObject(sObjectLib);

	aArgs.unshift(AObjectLib, AObject);
	var oResponse = fnFunction.apply(this, aArgs);

	var iMinSeverity = _.min(_.pluck(oResponse.messages, "severity"));
	if (iMinSeverity <= AOF.MessageSeverity.Error) {
		oTransaction.rollback();
		debug("messages: " + JSON.stringify(oResponse.messages));
		throw _.map(oResponse.messages, function(message) {
			return new Error(message.messageText);
		});
	} else {
		oTransaction.commit();
		return oResponse;
	}
}

function executeUserAction() {
	var aArgs = _.toArray(arguments);
	aArgs.unshift("sap.ino.xs.object.iam.User", executeUserActionInternal);
	return wrapAction.apply(this, aArgs);
}

function executeUserSettingsAction() {
	var aArgs = _.toArray(arguments);
	aArgs.unshift("sap.ino.xs.object.iam.UserSettings", executeUserSettingsActionInternal);
	return wrapAction.apply(this, aArgs);
}

function getPrivileges(oSession) {
	var aPrivileges = ["sap.ino.xs.rest.admin.application::execute",
                       "sap.ino.xs.rest.admin.application::campaign",
                       "sap.ino.xs.rest.admin.application::user",
                       "sap.ino.ui::backoffice.access"];
	return _.reduce(aPrivileges, function(oPrivilege, sPrivilege) {
		oPrivilege[sPrivilege] = oSession.hasSystemPrivilege(sPrivilege);
		return oPrivilege;
	}, {});
}

function activateUser(iUserId) {
	executeUserAction("activate", iUserId);
}

function getSamlUserInfo(oSession) {
	return {
		USER_NAME: oSession.getUsername(),
		EMAIL: oSession.samlUserInfo.email,
		FIRST_NAME: simpleHtmlUtil.decode(oSession.samlUserInfo.first_name),
		LAST_NAME: simpleHtmlUtil.decode(oSession.samlUserInfo.last_name),
		NAME: ((oSession.samlUserInfo.name !== "" && oSession.samlUserInfo.name !== "None") ? simpleHtmlUtil.decode(oSession.samlUserInfo.name) :
			simpleHtmlUtil.decode(oSession.samlUserInfo
				.first_name) + " " + simpleHtmlUtil.decode(oSession.samlUserInfo.last_name)),
		PHONE: oSession.samlUserInfo.phone,
		MOBILE: oSession.samlUserInfo.mobile,
		COST_CENTER: oSession.samlUserInfo.cost_center,
		ORGANIZATION: oSession.samlUserInfo.organization,
		OFFICE: oSession.samlUserInfo.office,
		COMPANY: oSession.samlUserInfo.company,
		STREET: oSession.samlUserInfo.street,
		CITY: oSession.samlUserInfo.city,
		COUNTRY: oSession.samlUserInfo.country,
		ZIP_CODE: oSession.samlUserInfo.zip_code
	};
}

function assignStaticBackofficeRole(iUserId) {
	executeUserAction("assignStaticRoles", iUserId, {
		GRANT: true,
		STATIC_ROLE_ASSIGNMENT: [{
			ROLE_CODE: 'INNOVATION_OFFICE_USER'
        }]
	});
}

function revokeStaticBackofficeRole(iUserId) {
	executeUserAction("assignStaticRoles", iUserId, {
		REVOKE: true,
		STATIC_ROLE_ASSIGNMENT: [{
			ROLE_CODE: 'INNOVATION_OFFICE_USER'
        }]
	});
}

function samlLoginUpdateUserInfo(oSession, oHQ) {
	function forbidden() {
		oResponse.status = $.net.http.FORBIDDEN;
		oResponse.body = "User " + oSession.getUsername() + " not registered.";
		return oResponse;
	}

	function failedToCreateUserFromSAML() {
		oResponse.status = $.net.http.INTERNAL_SERVER_ERROR;
		oResponse.body = "Failed to create SAML application user for " + oSession.getUsername();
		return oResponse;
	}

	function failedToUpdateUserFromSAML() {
		oResponse.status = $.net.http.INTERNAL_SERVER_ERROR;
		oResponse.body = "Failed to process SAML assertion for " + oSession.getUsername();
		return oResponse;
	}

	function duplicateUserAssignment() {
		oResponse.status = $.net.http.INTERNAL_SERVER_ERROR;
		oResponse.body = "Duplicate USER_NAME assignment";
		return oResponse;
	}

	function failedToExecuteLoginExit() {
		oResponse.status = $.net.http.FORBIDDEN;
		oResponse.body = "Failed to login application user " + oSession.getUsername();
		return oResponse;
	}

	function readUser() {
		const aUser = oHQ.statement('select * from "sap.ino.db.iam.ext::v_ext_logon_user"').execute();
		var oUser = aUser && aUser.length !== 0 ? aUser[0] : undefined;
		if (aUser.length > 1) {
			oUser.isDuplicate = true;
		}
		return oUser;
	}

	function readGroups(iUserID) {
		const aGroup = oHQ.statement('select g.name ' +
			'from "SAP_INO"."sap.ino.db.iam::t_identity_group_member" as group_member ' +
			'inner join "SAP_INO"."sap.ino.db.iam::t_identity" as g ' +
			'on group_member.group_id = g.id and ' +
			'g.type_code = ? and ' +
			'g.source_type_code = ? and ' +
			'group_member.member_id = ?').execute('GROUP', 'IDP', iUserID);
		return _.map(aGroup, function(oGroup) {
			return oGroup.NAME;
		});
	}

	function setSystemAdminApplicationUser() {
		const auth = $.import("sap.ino.xs.aof.core", "authorization");
		// the admin is the first user which created himself during the bootstrap
		const aAdmin = oHQ.statement(
			'select top 1 user_name from "sap.ino.db.iam::t_identity" where id = created_by_id order by erased asc, created_at asc').execute();
		var oAdmin = aAdmin && aAdmin.length !== 0 ? aAdmin[0] : undefined;
		if (!oAdmin) {
			return false;
		}
		auth.setApplicationUser(oAdmin.USER_NAME);
		return true;
	}

	function resetSystemAdminApplicationUser() {
		const auth = $.import("sap.ino.xs.aof.core", "authorization");
		auth.setApplicationUser(oSession.getUsername());
	}

	var vResult = {};
	var oResponse = {
		status: $.net.http.OK,
		body: vResult
	};
	var oUser = readUser();
	var oLoginExit = EnhancementSpot.get("sap.ino.xs.object.iam.loginExit");
	var bAuthenticatedWithSAML;
	//temporary workaround of HANA XS samluserinfo bug
	var attributes = [];
	for (var prop in oSession.samlUserInfo) {
		attributes.push({
			name: prop,
			value: oSession.samlUserInfo[prop]
		});
	}
	bAuthenticatedWithSAML = attributes.length > 0;
	var oSAMLUserInfo;
	var aSAMLGroupInfo;
	if (bAuthenticatedWithSAML) {
		oSAMLUserInfo = getSamlUserInfo(oSession);
		// 			aSAMLGroupInfo = oSession.samlUserInfo.groups;
		// 			if (!aSAMLGroupInfo) {
		// 				aSAMLGroupInfo = [];
		// 			} else if (!(aSAMLGroupInfo instanceof Array)) {
		// 				aSAMLGroupInfo = [aSAMLGroupInfo];
		// 			}

		try {
			oSAMLUserInfo.IS_EXTERNAL = oSession.samlUserInfo.is_external !== undefined ? parseInt(oSession.samlUserInfo.is_external, 10) : 0;
		} catch (e) {
			return failedToCreateUserFromSAML();
		}

		if (oLoginExit) {
			oLoginExit.enhanceSAMLUserInfo(_.clone(oUser), oSAMLUserInfo);
			// Protect user name
			oSAMLUserInfo.USER_NAME = oSession.getUsername();
		}
		aSAMLGroupInfo = oSAMLUserInfo.GROUPS || oSession.samlUserInfo.groups;
		if (!aSAMLGroupInfo) {
			aSAMLGroupInfo = [];
		} else if (!(aSAMLGroupInfo instanceof Array)) {
			aSAMLGroupInfo = [aSAMLGroupInfo];
		}
	}

	//  var dateValid = new Date();
	//     dateValid.setFullYear(dateValid.getFullYear() + 3);
	//     oSAMLUserInfo.VALIDATION_TO = dateValid;

	if (oLoginExit) {
		if (!oLoginExit.allowLogin(_.clone(oUser), _.clone(oSAMLUserInfo))) {
			oLoginExit.failToLogin();
			return;
		}
	}

	if (!oUser) {
		if (!bAuthenticatedWithSAML) {
			return forbidden();
		}
		if (!setSystemAdminApplicationUser()) {
			return failedToCreateUserFromSAML();
		}
		try {
			oSAMLUserInfo.SOURCE_TYPE_CODE = "IDP";
			executeUserAction("create", oSAMLUserInfo);
		} finally {
			resetSystemAdminApplicationUser(oSession);
		}
		oUser = readUser();
		if (!oUser) {
			return failedToUpdateUserFromSAML();
		}
	}

	if (oUser.isDuplicate) {
		const aUser = oHQ.statement('select * from "sap.ino.db.iam.ext::v_ext_logon_user"').execute();
		var sIds = '';
		var aIds = [];
		if (aUser) {
			var nMinUserId = _.min(_.pluck(aUser, 'USER_ID'));
			_.each(aUser, function(user) {
				if (user.USER_ID !== nMinUserId) {
					sIds += " ID = ? OR";
					aIds.push(user.USER_ID);
				}
			});
			sIds = sIds.substr(0, sIds.length - 3);
			oHQ.statement('DELETE FROM "SAP_INO"."sap.ino.db.iam::t_identity" WHERE ' + sIds).execute(aIds);
			oHQ.connection.commit();
		}
		//return duplicateUserAssignment();
	}

	var bValid = oHQ.statement('select IS_VALID from "sap.ino.db.iam.ext::v_ext_identity" where id = ?').execute(oUser.USER_ID);
	if (bValid && !bValid[0].IS_VALID) {
		var sLang = i18n.getSessionLanguage(oHQ);
		var sText = textBundle.getText("messages", "MSG_USER_ID_INVALID", undefined, sLang, true, oHQ);

		oResponse.status = $.net.http.FORBIDDEN;
		oResponse.body = sText;
		return oResponse;
	}

	if (bAuthenticatedWithSAML) {
		var oSAMLUserDelta = {};
		_.each(oSAMLUserInfo, function(sValue, sKey) {
			// undefined means that the assertion has *not* been mapped
			if (sValue === undefined) {
				return;
			}
			if (sValue === oUser[sKey]) {
				return;
			}
			oSAMLUserDelta[sKey] = sValue;
		});

		if (!_.isEmpty(oSAMLUserDelta)) {
			oSAMLUserDelta.ID = oUser.USER_ID;
			executeUserAction('update', oSAMLUserDelta);
			oUser = readUser();
			if (!oUser) {
				return failedToUpdateUserFromSAML();
			}
		}

		var aUserSAMLGroups = oUser ? readGroups(oUser.USER_ID) : [];
		var aGroupsToAdd = _.difference(aSAMLGroupInfo, aUserSAMLGroups);
		var aGroupsToRemove = _.difference(aUserSAMLGroups, aSAMLGroupInfo);
		// TraceWrapper.log_exception(JSON.stringify(aUserSAMLGroups));
		// TraceWrapper.log_exception(JSON.stringify(aGroupsToAdd));
		// TraceWrapper.log_exception(JSON.stringify(aGroupsToRemove));
		if (!(_.isEmpty(aGroupsToAdd) && _.isEmpty(aGroupsToRemove))) {
			executeUserAction('assignSAMLGroups', oUser.USER_ID, {
				GROUPS_TO_ADD: aGroupsToAdd,
				GROUPS_TO_REMOVE: aGroupsToRemove
			});
		}
	}
	return oResponse;
}

function login(oSession, oLoginRequest, oHQ, bUpdateUserInfo) {
    //  $.response.status = $.net.http.SEE_OTHER;
    //  $.response.headers.set("Location", "/sap/ino/config");
    //  return;
	var vResult = {};
	var oResponse = {
		status: $.net.http.OK,
		body: vResult
	};
	//  var sSql = 'insert into "sap.ino.db.iam::t_identity_log"("ID", "CREATED_AT", "CREATED_BY_ID", "CHANGED_AT", "CHANGED_BY_ID", "IDENTITY_ID", "CHANGED_ATTRIBUTE", "CHANGED_ATTRIBUTE_TYPE", 	"DATE_NEW_VALUE", "DATE_OLD_VALUE", 	"STRING_NEW_VALUE", "STRING_OLD_VALUE", "INT_NEW_VALUE", "INT_OLD_VALUE")  SELECT "SAP_INO"."sap.ino.db.iam::s_identity_log".nextval, current_utctimestamp,-1,  current_utctimestamp,-1,  -1, \'sap.ino.config.LOGIN\',\'INSERT\', null, null,  \'login\',?, null,null  from dummy;'
	// 	oHQ.statement(sSql).execute(oSession.getUsername());
	function forbidden() {
		oResponse.status = $.net.http.FORBIDDEN;
		oResponse.body = "User " + oSession.getUsername() + " not registered.";
		return oResponse;
	}

	function failedToCreateUserFromSAML() {
		oResponse.status = $.net.http.INTERNAL_SERVER_ERROR;
		oResponse.body = "Failed to create SAML application user for " + oSession.getUsername();
		return oResponse;
	}

	function failedToUpdateUserFromSAML() {
		oResponse.status = $.net.http.INTERNAL_SERVER_ERROR;
		oResponse.body = "Failed to process SAML assertion for " + oSession.getUsername();
		return oResponse;
	}

	function duplicateUserAssignment() {
		oResponse.status = $.net.http.INTERNAL_SERVER_ERROR;
		oResponse.body = "Duplicate USER_NAME assignment";
		return oResponse;
	}

	function failedToExecuteLoginExit() {
		oResponse.status = $.net.http.FORBIDDEN;
		oResponse.body = "Failed to login application user " + oSession.getUsername();
		return oResponse;
	}

	function readUser() {
		const aUser = oHQ.statement('select * from "sap.ino.db.iam.ext::v_ext_logon_user"').execute();
		var oUser = aUser && aUser.length !== 0 ? aUser[0] : undefined;
		if (aUser.length > 1) {
			oUser.isDuplicate = true;
		}
		return oUser;
	}

	function readGroups(iUserID) {
		const aGroup = oHQ.statement('select g.name ' +
			'from "SAP_INO"."sap.ino.db.iam::t_identity_group_member" as group_member ' +
			'inner join "SAP_INO"."sap.ino.db.iam::t_identity" as g ' +
			'on group_member.group_id = g.id and ' +
			'g.type_code = ? and ' +
			'g.source_type_code = ? and ' +
			'group_member.member_id = ?').execute('GROUP', 'IDP', iUserID);
		return _.map(aGroup, function(oGroup) {
			return oGroup.NAME;
		});
	}

	function readExpertRole() {
		const aExpert = oHQ.statement('select top 1 * from "sap.ino.db.evaluation::v_auth_evaluation_create"').execute();
		return aExpert && aExpert.length !== 0;
	}

	function readCampaignManagerRole() {
		const aCampaignManager = oHQ.statement('select top 1 * from "sap.ino.db.campaign::v_auth_campaigns_manage"').execute();
		return aCampaignManager && aCampaignManager.length !== 0;
	}

	function getInstanceRoles() {
		var sql =
			`SELECT DISTINCT ROLE_CODE
FROM "sap.ino.db.iam::v_auth_application_user_role_transitive" AS ORT
WHERE ROLE_CODE = 'CAMPAIGN_MANAGER'
	OR ROLE_CODE = 'CAMPAIGN_COACH'
	OR ROLE_CODE = 'CAMPAIGN_EXPERT'
	OR ROLE_CODE = 'CAMPAIGN_USER'

UNION ALL

SELECT DISTINCT ORT.ROLE_CODE
FROM "sap.ino.db.iam::v_auth_application_user_role_transitive" AS ORT
INNER JOIN "sap.ino.db.subresponsibility::t_responsibility_value_stage" AS RESP_V
ON ORT.OBJECT_ID = RESP_V.ID
	AND ORT.OBJECT_TYPE_CODE = 'RESPONSIBILITY'
INNER JOIN "sap.ino.db.subresponsibility::t_responsibility_stage" AS RESP
ON RESP.ID = RESP_V.RESP_ID
INNER JOIN "sap.ino.db.campaign::t_campaign" AS CAMP
ON RESP.CODE = CAMP.RESP_CODE
WHERE ORT.ROLE_CODE = 'RESP_COACH'
OR ORT.ROLE_CODE = 'RESP_EXPERT';
`;
		var aRoles = oHQ.statement(sql).execute();
		vResult.privileges["sap.ino.ui::camps_mgr_role"] = _.where(aRoles, {
			"ROLE_CODE": "CAMPAIGN_MANAGER"
		}).length > 0;
		vResult.privileges["sap.ino.ui::camps_coach_role"] = _.where(aRoles, {
			"ROLE_CODE": "CAMPAIGN_COACH"
		}).length > 0;
		vResult.privileges["sap.ino.ui::camps_expert_role"] = _.where(aRoles, {
			"ROLE_CODE": "CAMPAIGN_EXPERT"
		}).length > 0;
		vResult.privileges["sap.ino.ui::camps_part_role"] = _.where(aRoles, {
			"ROLE_CODE": "CAMPAIGN_USER"
		}).length > 0;
		vResult.privileges["sap.ino.ui::camps_resp_coach_role"] = _.where(aRoles, {
			"ROLE_CODE": "RESP_COACH"
		}).length > 0;
		vResult.privileges["sap.ino.ui::camps_resp_expert_role"] = _.where(aRoles, {
			"ROLE_CODE": "RESP_EXPERT"
		}).length > 0;
	}

	function setSystemAdminApplicationUser() {
		const auth = $.import("sap.ino.xs.aof.core", "authorization");
		// the admin is the first user which created himself during the bootstrap
		const aAdmin = oHQ.statement(
			'select top 1 user_name from "sap.ino.db.iam::t_identity" where id = created_by_id order by erased asc, created_at asc').execute();
		var oAdmin = aAdmin && aAdmin.length !== 0 ? aAdmin[0] : undefined;
		if (!oAdmin) {
			return false;
		}
		auth.setApplicationUser(oAdmin.USER_NAME);
		return true;
	}

	function resetSystemAdminApplicationUser() {
		const auth = $.import("sap.ino.xs.aof.core", "authorization");
		auth.setApplicationUser(oSession.getUsername());
	}

	var oUser = readUser();
	var oLoginExit = EnhancementSpot.get("sap.ino.xs.object.iam.loginExit");
	var bAuthenticatedWithSAML;
	//vResult.updateUserInfo = false;	
	//temporary workaround of HANA XS samluserinfo bug
	var attributes = [];
	for (var prop in oSession.samlUserInfo) {
		attributes.push({
			name: prop,
			value: oSession.samlUserInfo[prop]
		});
	}

	bAuthenticatedWithSAML = attributes.length > 0;
	var oSAMLUserInfo
	if (bAuthenticatedWithSAML) {
		oSAMLUserInfo = getSamlUserInfo(oSession);
	}
	if (oLoginExit) {
		if (!oLoginExit.allowLogin(_.clone(oUser), _.clone(oSAMLUserInfo))) {
			oLoginExit.failToLogin();
			return;
		}
	}
	vResult.user = oUser;

	// Staged users need to be activated lazy
	if (oUser.STAGED === 1) {
		debug("activate staged user");
		activateUser(oUser.USER_ID);
	}

	var oLoginUser = {};
	oLoginUser.LAST_LOGIN = new Date().toISOString();
	oLoginUser.ID = oUser.USER_ID;
	executeUserAction("update", oLoginUser);

	var aTheme = oHQ.statement('select * from "sap.ino.db.basis.ext::v_ext_user_parameter" where USER_ID=? and SECTION=? and KEY=?')
		.execute(oUser.USER_ID, 'ui', 'theme');

	if (aTheme && aTheme.length === 1) {
		vResult.theme = aTheme[0].VALUE;
	} else {
		vResult.theme = "";
	}

	//temporary workaround of HANA XS samluserinfo bug
	var aLogonTicketInfo = [];
	for (var sprop in oSession.logonTicketInfo) {
		aLogonTicketInfo.push({
			name: sprop,
			value: oSession.logonTicketInfo[prop]
		});
	}

	oUser.BASIC_AUTH = (aLogonTicketInfo.length === 0) && !bAuthenticatedWithSAML;

	if (oUser.LOCALE === "" || oUser.LOCALE === undefined || oUser.LOCALE === null) {
		var sLocale = $.request.parameters.get("locale") || $.application.language;
		oUser.LOCALE = executeUserSettingsAction("updateUserLocale", oUser.USER_ID, {
			LOCALE: sLocale
		}).result;
	} else if (oUser.LOCALE === "2q") {
		oUser.LOCALE = "en-US-x-sappsd";
	}
	$.application.language = oUser.LOCALE;

	if (!oLoginRequest || oLoginRequest.backoffice !== true) {
		return oResponse;
	}

	// Attention:
	// The following logic relies on certain privileges to recognize
	// innovation manager and backoffice users roles to avoid additional
	// expensive checks.
	// This means as soon as the privileges of these roles change
	// this needs to be revisited.
	vResult.privileges = getPrivileges(oSession);
	getInstanceRoles();
	// add pseudo expert privilege
	vResult.privileges["sap.ino.ui::expert"] = readExpertRole();

	//add campaign manager privilege
	vResult.privileges["sap.ino.ui::campaign_manager"] = readCampaignManagerRole();

	var bHasStaticBackofficeRole = !!vResult.privileges["sap.ino.ui::backoffice.access"];
	var bIsInnoManager = !!vResult.privileges["sap.ino.xs.rest.admin.application::execute"];

	if (bIsInnoManager) {
		return oResponse;
	}

	var aHasInstanceBackofficeRole = oHQ.statement('select * from "sap.ino.db.iam.ext::v_ext_has_backoffice_instance_role"').execute();
	var bHasInstanceBackofficeRole = aHasInstanceBackofficeRole &&
		aHasInstanceBackofficeRole.length > 0 &&
		aHasInstanceBackofficeRole[0].HAS_BACKOFFICE_INSTANCE_ROLE === 'X';

	// everything as it should be
	if (bHasInstanceBackofficeRole && bHasStaticBackofficeRole) {
		return oResponse;
	}

	// static role missing
	if (bHasInstanceBackofficeRole && !bHasStaticBackofficeRole) {
		assignStaticBackofficeRole(oUser.USER_ID);
		// set privileges manually to new privileges as
		// they are only available on the next request
		vResult.privileges = vResult.privileges || {};
		vResult.privileges["sap.ino.ui::backoffice.access"] = true;
		return oResponse;
	}
	if (!bHasInstanceBackofficeRole && bHasStaticBackofficeRole && vResult.privileges["sap.ino.xs.rest.admin.application::user"] === true) {
		return oResponse;
	}
	// static role not needed any more
	if (!bHasInstanceBackofficeRole && bHasStaticBackofficeRole) {
		revokeStaticBackofficeRole(oUser.USER_ID);
		oResponse.status = $.net.http.FORBIDDEN;
		// TODO: clarify why this should result in an explanatory message. 
		oResponse.body = "User not allowed in backoffice any more";
		return oResponse;
	}

	return oResponse;
}