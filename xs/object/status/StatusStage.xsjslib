var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;
var configCheck = $.import("sap.ino.xs.aof.config", "check");
var configDetermine = $.import("sap.ino.xs.aof.config", "determination");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var StatusMessage = $.import("sap.ino.xs.object.status", "message");
var Message = $.import("sap.ino.xs.aof.lib", "message");
var AOF = $.import("sap.ino.xs.aof.core", "framework");

this.definition = {
	type: ObjectType.Stage,
	actions: {
		create: {
			authorizationCheck: false,
			enabledCheck: configCheck.configEnabledCheck,
			historyEvent: "STATUS_CREATED"
		},
		copy: {
			authorizationCheck: false,
			enabledCheck: configCheck.configAvailableCheck,
			historyEvent: "STATUS_CREATED"
		}, 
		update: {
			authorizationCheck: false,
			executionCheck: updateExecutionCheck,
			enabledCheck: configCheck.configEnabledCheck,
			historyEvent: "STATUS_UPDATED"
		},
		read: {
			authorizationCheck: false,
			enabledCheck: configCheck.configEnabledCheck
		},
		del: {
			authorizationCheck: false,
			executionCheck: deleteExecutionCheck,
			enabledCheck: deleteEnableCheck,
			historyEvent: "STATUS_DELETED"
		}
	},
	Root: {
		table: "sap.ino.db.status::t_status_stage",
		sequence: "sap.ino.db.status::s_status",
		customProperties: {
			fileName: "t_status",
			codeTextBundle: "sap.ino.config::t_status",
			contentOnlyInRepository: false
		},
		determinations: {
			onCreate: [configDetermine.determineConfigPackage],
			onCopy: [configDetermine.determineConfigPackage, updateTitles, configDetermine.determinePackageAndCode],
			onModify: [configDetermine.determinePackageAndCode, determine.systemAdminData],
			onPersist: [configDetermine.activateContent, onDeleteStatusAuthorization, copyAuthorizationForStatus]
		},
		attributes: {
			ID: {
				isPrimaryKey: true
			},
			CODE: {
				readOnly: true
			},
			PACKAGE_ID: {
				readOnly: true
			},
			PLAIN_CODE: {
				required: true,
				consistencyChecks: [configCheck.validPlainCodeCheck]
			},
			DEFAULT_TEXT: {
				required: true
			},
			CREATED_AT: {
				readOnly: true
			},
			CREATED_BY_ID: {
				readOnly: true
			},
			CHANGED_AT: {
				readOnly: true,
				concurrencyControl: true
			},
			CHANGED_BY_ID: {
				readOnly: true
			},
			COLOR_CODE: {
			    readOnly: false
			}
		}
	}
};

function deleteEnableCheck(vKey, oPersistedObject, addMessage, oContext) {
	configCheck.configEnabledCheck(vKey, oPersistedObject, addMessage, oContext);
	var oHQ = oContext.getHQ();
	// check for being used or not
	var aResult = oHQ.statement(
		'select CODE from "sap.ino.db.status::t_status_model_transition" \
                    where CURRENT_STATUS_CODE = ? or NEXT_STATUS_CODE = ?'
	).execute(oPersistedObject.CODE, oPersistedObject.CODE);
	if (aResult.length > 0) {
		addMessage(Message.MessageSeverity.Error, StatusMessage.SYSTEM_STATUS_UNCHANGEABLE);
	}
}

function updateExecutionCheck(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext) {

	var oHQ = oContext.getHQ();
	// check for being used or not
	var aResult = oHQ.statement(
		'select CODE from "sap.ino.db.status::t_status_model_transition" \
                    where CURRENT_STATUS_CODE = ? or NEXT_STATUS_CODE = ?'
	).execute(oWorkObject.CODE, oWorkObject.CODE);
	if (aResult.length > 0 && (oRequestObject.DEFAULT_TEXT !== undefined || oRequestObject.PLAIN_CODE !== undefined || oRequestObject.STATUS_TYPE !==
		undefined)) {
		addMessage(Message.MessageSeverity.Error, StatusMessage.STATUS_UNCHANGEABLE, vKey, "Root", "CODE", oWorkObject.CODE);
		return;
	}
}

function deleteExecutionCheck(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext) {
	if (oWorkObject.PACKAGE_ID === 'sap.ino.config') {
		addMessage(Message.MessageSeverity.Error, StatusMessage.SYSTEM_STATUS_UNCHANGEABLE);
		return;
	}
	updateExecutionCheck(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext);
}

function updateTitles(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext, oNodeMetadata) {
	var textBundle = $.import("sap.ino.xs.xslib", "textBundle");
	var oMeta = oNodeMetadata.objectMetadata.getNodeMetadata("Root");

	var sDefaultText = oWorkObject.DEFAULT_TEXT;
	var sPrefix = textBundle.getText("uitexts", "BO_PHASE_COPY_PREFIX", [], "", false, oContext.getHQ());
	sDefaultText = sPrefix + sDefaultText;

	// check length
	sDefaultText = sDefaultText.substr(0, oMeta.attributes.DEFAULT_TEXT.length);

	oWorkObject.DEFAULT_TEXT = sDefaultText;

	var sPlainCodeText = oWorkObject.PLAIN_CODE;
	// check length
	sPlainCodeText = sPlainCodeText.substr(0, oMeta.attributes.PLAIN_CODE.length);

	oWorkObject.PLAIN_CODE = sPlainCodeText;
}

function copyAuthorizationForStatus(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext, oNodeMetadata) {
	if (oContext.getAction().name === "copy") {
		var AuthorizationForStatus = AOF.getApplicationObject("sap.ino.xs.object.status.AuthorizationForStatus");
		var sStatusId = getStatusId();

		var oHQ = oContext.getHQ();
		// check for being used setting or not
		var aSettingResult = oHQ.statement(
			' select id,value  from"sap.ino.db.status::t_status_authorization_stage" where ID_OF_STATUS_STAGE = ? ').execute(sStatusId);
		if(aSettingResult.length > 0){
		    var sSettingId = aSettingResult[0].ID;
		var sCopySettingValue = aSettingResult[0].VALUE;
		var aCopyAuthorization = [];
		var oCopyAuthorization = {};
		var aContentForAutorization = oHQ.statement(
			' select *  from"sap.ino.db.status::t_status_authorization" where ID_OF_STATUS_AUTHORIZATION_STAGE = ? ').execute(sSettingId);
		aContentForAutorization.forEach(function(object) {

			oCopyAuthorization.ID = -1;
			oCopyAuthorization.ACTION_CODE = object.ACTION_CODE;
			oCopyAuthorization.ROLE_CODE = object.ROLE_CODE;
			oCopyAuthorization.CAN_DO_ACTION = object.CAN_DO_ACTION;
			aCopyAuthorization.push(oCopyAuthorization);
			oCopyAuthorization = {};
		});
		var oAuthorizationForStatus = {
			ID: -1,
			ID_OF_STATUS_STAGE: oPersistedObject.ID,
			SETTING_CODE: "OPEN_STATUS_AUTHORIZATION",
			VALUE: sCopySettingValue,
			AuthorizationForStatus: aCopyAuthorization
		};
		var copyResult;
		if (sCopySettingValue !== null) {
			copyResult = AuthorizationForStatus.create(oAuthorizationForStatus);
		}
		return copyResult;
		}
		
	}
}

function getStatusId() {
	var queryPath = $.request.queryPath;
	if (queryPath) {
		var queryPathParts = queryPath.split("/") || [];
		if (queryPathParts.length >= 1 && !isNaN(queryPathParts[0])) {
			var id = parseInt(queryPathParts[0]);
			return id;
		}
	}
	return 0;
}

function onDeleteStatusAuthorization(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext) {
	var delResult;
	if (oContext.getAction().name === "del" && vKey) {
		var AuthorizationForStatus = AOF.getApplicationObject("sap.ino.xs.object.status.AuthorizationForStatus");
		var oHQ = oContext.getHQ();
		// check for being used setting or not
		var aResult = oHQ.statement(' select id  from"sap.ino.db.status::t_status_authorization_stage" where ID_OF_STATUS_STAGE = ? ').execute(
			vKey);
		if (aResult && aResult.length > 0) {
			delResult = AuthorizationForStatus.del(aResult[0].ID);
		}

	}
	return delResult;
}