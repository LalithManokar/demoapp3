var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;
var configCheck = $.import("sap.ino.xs.aof.config", "check");
var configDetermine = $.import("sap.ino.xs.aof.config", "determination");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var BasisMessage = $.import("sap.ino.xs.object.basis", "message");
var Message = $.import("sap.ino.xs.aof.lib", "message");

this.definition = {
	type: ObjectType.Stage,
	actions: {
		create: {
			authorizationCheck: false,
			enabledCheck: configCheck.configEnabledCheck
		},
		copy: {
			authorizationCheck: false,
			enabledCheck: copyEnabledCheck
		},
		update: {
			authorizationCheck: false,
			executionCheck: updateExecutionCheck,
			enabledCheck: configCheck.configEnabledCheck
		},
		read: {
			authorizationCheck: false,
			enabledCheck: configCheck.configEnabledCheck
		},
		del: {
			authorizationCheck: false,
			enabledCheck: deleteEnabledCheck
		}
	},
	Root: {
		table: "sap.ino.db.basis::t_milestone_task_stage",
		sequence: "sap.ino.db.basis::s_milestone_task_stage",
		customProperties: {
			fileName: "t_milestone_task",
			contentOnlyInRepository: false
		},
		determinations: {
			onCreate: [configDetermine.determineConfigPackage],
			onCopy: [configDetermine.determineConfigPackage, updateTitles, configDetermine.determinePackageAndCode],
			onModify: [configDetermine.determinePackageAndCode, determine.systemAdminData],
			onPersist: [configDetermine.activateContent]
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
			}
		}
	}
};

function isTaskUsed(sMilestoneCode, oHQ) {
	var sSelect =
		'select * from "sap.ino.db.campaign::t_campaign_task" as camp_task \
                        inner join "sap.ino.db.basis::t_milestone_task" as miles_task \
                            on miles_task.code = camp_task.task_code \
                            where miles_task.code = ?';
	var aResult = oHQ.statement(sSelect).execute(sMilestoneCode);

	return aResult.length > 0;
}

function updateExecutionCheck(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext) {

	var oHQ = oContext.getHQ();
	// check for being used or not
	if (oRequestObject.PLAIN_CODE && isTaskUsed(oPersistedObject.CODE, oHQ)) {
		addMessage(Message.MessageSeverity.Error, BasisMessage.TASK_UNCHANGEABLE, vKey, "Root", "PLAIN_CODE", oPersistedObject.PLAIN_CODE);
	}
}

function deleteEnabledCheck(vKey, oPersistedObject, addMessage, oContext) {
	configCheck.configEnabledCheck(vKey, oPersistedObject, addMessage, oContext);
	var oHQ = oContext.getHQ();
	if (isTaskUsed(oPersistedObject.CODE, oHQ)) {
		addMessage(Message.MessageSeverity.Error, BasisMessage.TASK_UNCHANGEABLE, vKey, "Root", "PLAIN_CODE", oPersistedObject.PLAIN_CODE);
	}
}

function copyEnabledCheck(vKey, oPersistedObject, addMessage, oContext) {
	configCheck.configAvailableCheck(vKey, oPersistedObject, addMessage, oContext);

	// if the Model has no ID it cannot be copied...
	if (!oPersistedObject.ID || oPersistedObject.ID <= 0) {
		addMessage(Message.MessageSeverity.Error, BasisMessage.TEXT_MODULE_NO_COPY, vKey, "Root", "DEFAULT_TEXT", oPersistedObject.DEFAULT_TEXT);
	}
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