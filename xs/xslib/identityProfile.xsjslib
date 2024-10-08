//provide some functions to identity_profile.xsjs service
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const ohQuery = $.import("sap.ino.xs.xslib", "hQuery");
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var oHQ = ohQuery.hQuery(oConn).setSchema("SAP_INO");

var oFullIdentityConfiguration = {
	COMPANY: 1,
	COST_CENTER: 1,
	OFFICE: 1,
	PHONE: 1,
	MOBILE: 1,
	EMAIL: 1,
	STREET: 1,
	ZIP_CODE: 1,
	CITY: 1,
	COUNTRY: 1,
	ORGANIZATION: 1
};

function getIdentityConfiguration() {
	var sSelect = 'select * from "sap.ino.db.iam.ext::v_ext_identity_attribute"';
	var aResult = oHQ.statement(sSelect).execute();
	//To get the map of the sql array result
	var oResult = convertToMap(aResult, "CODE", "IS_PUBLIC");
	return oResult;
}

function convertToMap(aInput, sKey, sValue) {
	var oMap = {};
	_.each(aInput, function(oInput) {
		oMap[oInput[sKey].split('.')[3]] = oInput[sValue];
	});
	return oMap;
}

function getCurrentUserPrivilege(oSession) {
	//select IS_EXTERNAL from "sap.ino.db.iam::v_auth_application_user"
	//$.session.hasSystemPrivilege("sap.ino.ui::backoffice.access");
	var oResult = {};
	var sSelect = 'select ID, IS_EXTERNAL from "sap.ino.db.iam::v_auth_application_user"';
	var aResult = oHQ.statement(sSelect).execute();
	oResult.USER_ID = aResult[0].ID;
	oResult.IS_EXTERNAL = aResult[0].IS_EXTERNAL;
	oResult.HAS_BACKOFFICE_PRIVILEGE = oSession.hasSystemPrivilege("sap.ino.ui::backoffice.access");
	return oResult;
}

function getCurrentUser() {
	var oResult = {};
	var sSelect = 'select ID, IS_EXTERNAL from "sap.ino.db.iam::v_auth_application_user"';
	var aResult = oHQ.statement(sSelect).execute();
	oResult.USER_ID = aResult[0].ID;
	return oResult;
}

function getTargetUserData(oSession, iUserId) {
	var vResult = {};
	var oResponse = {
		status: $.net.http.OK,
		body: vResult
	};

	function missUserId() {
		oResponse.status = $.net.http.INTERNAL_SERVER_ERROR;
		oResponse.body = "The parameter should contain user_id.";
		return oResponse;
	}

	function missUserData() {
		oResponse.status = $.net.http.INTERNAL_SERVER_ERROR;
		oResponse.body = "The User " + iUserId + " could not be found.";
		return oResponse;
	}

	if (!iUserId || !_.isInteger(iUserId)) {
		missUserId();
		return oResponse;
	}

	var oCurrentUserPrivilege = getCurrentUserPrivilege(oSession);
	var sSelect = 'select * from "sap.ino.db.iam::v_identity" where ID = ?';
	var aResult = oHQ.statement(sSelect).execute(iUserId);

	if (aResult.length > 0) {
		var oUserData = aResult[0];
		if ((!oCurrentUserPrivilege.IS_EXTERNAL && !oUserData.IS_EXTERNAL) ||
			(!oCurrentUserPrivilege.IS_EXTERNAL && oCurrentUserPrivilege.HAS_BACKOFFICE_PRIVILEGE) ||
			oCurrentUserPrivilege.USER_ID === oUserData.ID) {
			oResponse.body = filterUserData(oFullIdentityConfiguration, oUserData, oCurrentUserPrivilege);
		} else {
			oResponse.body = filterUserData(getIdentityConfiguration(), oUserData, oCurrentUserPrivilege);
		}
	} else {
		missUserData();
	}
	return oResponse;
}

//filter the user date according to the uesr privileges and user configuration
function filterUserData(oConfiguation, oUserData, oCurrentUserPrivilege) {
	var Dimension = $.import("sap.ino.xs.object.gamification", "Dimension");
	var oResultUserData = {
		CORP_INFO: {},
		CONTACT_DETAIL: {},
		ADDR_INFO: {},
		GAMIFICATION_INFO: oUserData.TYPE_CODE === 'USER' ? Dimension.getUserProfileForGamification(oUserData.ID, oHQ, getCurrentUser().USER_ID) : []
	};

	_.each(oConfiguation, function(iValue, sKey) {
		if (iValue) {
			switch (sKey) {
				case 'COMPANY':
				case 'COST_CENTER':
				case 'OFFICE':
					oResultUserData.CORP_INFO[sKey] = oUserData[sKey];
					break;
				case 'PHONE':
				case 'MOBILE':
				case 'EMAIL':
					oResultUserData.CONTACT_DETAIL[sKey] = oUserData[sKey];
					break;
				case 'STREET':
				case 'ZIP_CODE':
				case 'CITY':
				case 'COUNTRY':
					oResultUserData.ADDR_INFO[sKey] = oUserData[sKey];
					break;
				case 'ORGANIZATION':
					oResultUserData.ORGANIZATION = oUserData.ORGANIZATION;
					break;
			}
		}
	});

	_.map(oResultUserData, function(oValue, sKey) {
		if (_.isEmpty(oValue)) {
			oResultUserData[sKey] = null;
		}
	});

	//add the basic user data of the user
	oResultUserData.NAME = oUserData.NAME;
	oResultUserData.IDENTITY_IMAGE_ID = oUserData.IDENTITY_IMAGE_ID;
	oResultUserData.CREATED_BY_ID = oUserData.CREATED_BY_ID;
	oResultUserData.TYPE_CODE = oUserData.TYPE_CODE;
	if (oCurrentUserPrivilege.USER_ID === oUserData.ID) {
		oResultUserData.VALIDATION_TO = oUserData.VALIDATION_TO;
		oResultUserData.LAST_LOGIN = oUserData.LAST_LOGIN;
		oResultUserData.FIRST_NAME = oUserData.FIRST_NAME;
		oResultUserData.LAST_NAME = oUserData.LAST_NAME;
		oResultUserData.USER_NAME = oUserData.USER_NAME;
	} else {
		oResultUserData.VALIDATION_TO = '';
		oResultUserData.LAST_LOGIN = '';
		oResultUserData.FIRST_NAME = '';
		oResultUserData.LAST_NAME = '';
		oResultUserData.USER_NAME = '';
	}

	return oResultUserData;
}