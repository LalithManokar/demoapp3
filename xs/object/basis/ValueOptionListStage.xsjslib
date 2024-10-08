var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var AOF = $.import("sap.ino.xs.aof.core", "framework");

var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");

var configCheck = $.import("sap.ino.xs.aof.config", "check");
var configDetermine = $.import("sap.ino.xs.aof.config", "determination");
var configUtil = $.import("sap.ino.xs.aof.config", "util");

var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;
var Message = $.import("sap.ino.xs.aof.lib", "message");
var BasisMessage = $.import("sap.ino.xs.object.basis", "message");

var DataType = $.import("sap.ino.xs.object.basis", "Datatype");

this.definition = {
	type: ObjectType.Stage,
	actions: {
		create: {
			authorizationCheck: false,
			enabledCheck: configCheck.configEnabledCheck
		},
		update: {
			authorizationCheck: false,
			executionCheck: updateExecutionCheck,
			enabledCheck: configCheck.configEnabledCheck
		},
		del: {
			authorizationCheck: false,
			enabledCheck: deleteEnabledCheck
		},
		read: {
			authorizationCheck: false,
			enabledCheck: configCheck.configEnabledCheck
		},
		copy: {
			authorizationCheck: false,
			enabledCheck: copyEnabledCheck,
		},
	},
	Root: {
		table: "sap.ino.db.basis::t_value_option_list_stage",
		sequence: "sap.ino.db.basis::s_value_option_list",
		customProperties: {
			fileName: "t_value_option_list",
			contentOnlyInRepository: false
		},
		consistencyChecks: [check.duplicateAlternativeKeyCheck("PLAIN_CODE", BasisMessage.VALUE_OPTION_LIST_DUPLICATE_CODE, true),
			valueConsistencyCheck],
		activationCheck: activationCheck,
		determinations: {
			onCreate: [configDetermine.determineConfigPackage],
			onCopy: [configDetermine.determineConfigPackage, updateTitles, determineCode],
			onModify: [determineCode, determine.systemAdminData],
			onPersist: [configDetermine.activateContent]
		},
		attributes: {
			PACKAGE_ID: {
				readOnly: true,
			},
			CODE: {
				readOnly: true
			},
			ID: {
				isPrimaryKey: true
			},
			DATATYPE_CODE: {
				required: true,
				foreignKeyTo: "sap.ino.xs.object.basis.Datatype.Root"
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
				readOnly: true
			},
			CHANGED_BY_ID: {
				readOnly: true
			}
		},
		nodes: {
			ValueOptions: {
				table: "sap.ino.db.basis::t_value_option_stage",
				sequence: "sap.ino.db.basis::s_value_option",
				customProperties: {
					fileName: "t_value_option"
				},
				parentKey: "LIST_ID",
				consistencyChecks: [check.duplicateCheck("CODE", BasisMessage.VALUE_OPTION_DUPLICATE_CODE, true), valueDuplicateCheck],
				attributes: {
					ID: {
						isPrimaryKey: true
					},
					CODE: {
						readOnly: true
					},
					PLAIN_CODE: {
						required: true,
						consistencyChecks: [configCheck.validPlainCodeCheck]
					},
					DEFAULT_TEXT: {
						required: true
					},
					BOOL_VALUE: {
						consistencyChecks: []
					}
				}
			}
		}
	}
};

function valueDuplicateCheck(vKey, oWorkObjectNode, addMessage, oContext, oNodeMetadata) {
	var sDataType = oContext.getProcessedObject().DATATYPE_CODE;
	var fnCheck;
	if (sDataType == DataType.DataType.Numeric || sDataType == DataType.DataType.Integer) {
		fnCheck = check.duplicateCheck("NUM_VALUE", BasisMessage.VALUE_OPTION_DUPLICATE_VALUE);
	} else if (sDataType == DataType.DataType.Text) {
		fnCheck = check.duplicateCheck("TEXT_VALUE", BasisMessage.VALUE_OPTION_DUPLICATE_VALUE);
	} else if (sDataType == DataType.DataType.Boolean) {
		fnCheck = check.duplicateCheck("BOOL_VALUE", BasisMessage.VALUE_OPTION_DUPLICATE_VALUE);
	}
	if (fnCheck) {
		fnCheck.apply(undefined, arguments);
	}
}

function activationCheck(oActiveConfiguration, oStage, addMessage, oContext) {
	checkValues(oStage, addMessage, "CODE");
	if (oActiveConfiguration) {
		checkUpdateForActive(oStage, oActiveConfiguration, oStage.CODE, addMessage, oContext.getHQ());
	}
}

function valueConsistencyCheck(vKey, oWorkObject, addMessage, oContext) {
	checkValues(oWorkObject, addMessage, "ID");
}

function updateExecutionCheck(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext) {
	var oHQ = oContext.getHQ();
	if (oRequestObject.PLAIN_CODE !== undefined) {
		if (isListCodeUsed(oPersistedObject.CODE, oHQ)) {
			addMessage(Message.MessageSeverity.Error, BasisMessage.VALUE_OPTION_LIST_PLAIN_CODE_UNCHANGEABLE, vKey, "Root", "PLAIN_CODE",
				oWorkObject.PLAIN_CODE);
			return;
		}
	}

	// make sure that determined codes are set before doing the update check
	determineCode(vKey, oWorkObject, oPersistedObject, addMessage, undefined, oContext);
	checkUpdate(oWorkObject, oPersistedObject, vKey, addMessage, oContext.getHQ());
}

function deleteEnabledCheck(vKey, oPersistedObject, addMessage, oContext) {
	configCheck.configEnabledCheck(vKey, oPersistedObject, addMessage, oContext);
	if (isListCodeUsed(oPersistedObject.CODE, oContext.getHQ())) {
		addMessage(Message.MessageSeverity.Error, BasisMessage.VALUE_OPTION_LIST_UNCHANGEABLE, vKey, "Root", "CODE", oPersistedObject.PLAIN_CODE);
	}
}

function determineCode(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext) {
	configDetermine.determinePackageAndCode(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext);
	if (oWorkObject.ValueOptions) {
		_.each(oWorkObject.ValueOptions, function(oValueOption) {
			oValueOption.PACKAGE_ID = oWorkObject.PACKAGE_ID;
			oValueOption.CODE = configUtil.getFullCode(oWorkObject.PACKAGE_ID, oWorkObject.PLAIN_CODE + "." + oValueOption.PLAIN_CODE);
			oValueOption.LIST_CODE = oWorkObject.CODE;
		});
	}
}

function checkValues(oWorkObject, addMessage, sMessageKey) {
	var sDataType = oWorkObject.DATATYPE_CODE;

	// Check validity
	if (oWorkObject.ValueOptions) {

		// check for valid values
		var aInvalidDataType = _.filter(oWorkObject.ValueOptions, function(oValueOption) {
			return (sDataType == DataType.DataType.Boolean && (oValueOption.NUM_VALUE || oValueOption.TEXT_VALUE)) || ((sDataType == DataType.DataType
				.Numeric || sDataType == DataType.DataType.Integer) && (oValueOption.BOOL_VALUE || oValueOption.TEXT_VALUE)) || (sDataType ==
				DataType.DataType.Text && (oValueOption.BOOL_VALUE || oValueOption.NUM_VALUE));
		});
		if (aInvalidDataType.length > 0) {
			addMessage(Message.MessageSeverity.Error, BasisMessage.VALUE_OPTION_INVALID_VALUE, oWorkObject[sMessageKey], "Root", "DATATYPE_CODE",
				sDataType);
		}

		var aInvalidValueOptionBool = _.filter(oWorkObject.ValueOptions, function(oValueOption) {
			return (sDataType == DataType.DataType.Boolean && (oValueOption.BOOL_VALUE === null || oValueOption.BOOL_VALUE === undefined || !(
				oValueOption.BOOL_VALUE === 0 || oValueOption.BOOL_VALUE === 1)));
		});
		if (aInvalidValueOptionBool) {
			_.each(aInvalidValueOptionBool, function(oInvalidValueOptionBool) {
				addMessage(Message.MessageSeverity.Error, BasisMessage.VALUE_OPTION_INVALID_VALUE, oInvalidValueOptionBool[sMessageKey],
					"ValueOptions", "BOOL_VALUE", oInvalidValueOptionBool.BOOL_VALUE || undefined);
			});
		}
		var aInvalidValueOptionNum = _.filter(oWorkObject.ValueOptions, function(oValueOption) {
			return (sDataType == DataType.DataType.Numeric && (oValueOption.NUM_VALUE === undefined || oValueOption.NUM_VALUE === null || isNaN(
				oValueOption.NUM_VALUE))) || (sDataType == DataType.DataType.Integer && (oValueOption.NUM_VALUE === undefined || oValueOption.NUM_VALUE ===
				null || isNaN(oValueOption.NUM_VALUE) || Math.floor(oValueOption.NUM_VALUE) != Math.ceil(oValueOption.NUM_VALUE)));
		});
		if (aInvalidValueOptionNum) {
			_.each(aInvalidValueOptionNum, function(oInvalidValueOptionNum) {
				addMessage(Message.MessageSeverity.Error, BasisMessage.VALUE_OPTION_INVALID_VALUE, oInvalidValueOptionNum[sMessageKey], "ValueOptions",
					"NUM_VALUE", oInvalidValueOptionNum.NUM_VALUE || undefined);
			});
		}
		var aInvalidValueOptionText = _.filter(oWorkObject.ValueOptions, function(oValueOption) {
			return (sDataType == DataType.DataType.Text && (!oValueOption.TEXT_VALUE || !_.isString(oValueOption.TEXT_VALUE)));
		});
		if (aInvalidValueOptionText) {
			_.each(aInvalidValueOptionText, function(oInvalidValueOptionText) {
				addMessage(Message.MessageSeverity.Error, BasisMessage.VALUE_OPTION_INVALID_VALUE, oInvalidValueOptionText[sMessageKey],
					"ValueOptions", "TEXT_VALUE", oInvalidValueOptionText.TEXT_VALUE || undefined);
			});
		}

	}
}

function checkUpdate(oWorkObject, oPersistedObject, vKey, addMessage, oHQ) {
	if (!oPersistedObject) {
		return;
	}
	var bIsEqual;
	var aWorkValueOptions = _.sortBy(oWorkObject.ValueOptions, "CODE");
	var aPersistedValueOptions = _.sortBy(oPersistedObject.ValueOptions, "CODE");
	if (oWorkObject.CODE.contains('sap.ino.config')) {
		bIsEqual = _.isEqualOmit(aWorkValueOptions, aPersistedValueOptions, ["DEFAULT_TEXT", "DEFAULT_LONG_TEXT","ACTIVE","SEQUENCE_NO"]);
	} else {
		var aNewList = [];
		_.each(aWorkValueOptions, function(element) {
			if (element.ID > 0) {
				aNewList.push(element);
			}
		});

		aNewList = _.sortBy(aNewList, "CODE");
		bIsEqual = _.isEqualOmit(aNewList, aPersistedValueOptions, ["DEFAULT_TEXT", "DEFAULT_LONG_TEXT","ACTIVE","SEQUENCE_NO"]);
	}

	// if evaluations have been created or the value list is used somewhere the content of the value options may not be
	// changed any more
	// Sorting is done to ensure same order
	if (!bIsEqual && (isUsedInEvaluations(oPersistedObject.CODE, oHQ) || isListCodeUsed(oPersistedObject.CODE, oHQ))) {
		addMessage(Message.MessageSeverity.Error, BasisMessage.VALUE_OPTION_LIST_UNCHANGEABLE, vKey, "Root", "CODE", oWorkObject.PLAIN_CODE ||
			oWorkObject.CODE);
	}
	// Data type may not be changed when evaluations exist or the list code is used
	if ((oWorkObject.DATATYPE_CODE !== oPersistedObject.DATATYPE_CODE) && (isUsedInEvaluations(oPersistedObject.CODE, oHQ) || isListCodeUsed(
		oPersistedObject.CODE, oHQ))) {
		addMessage(Message.MessageSeverity.Error, BasisMessage.VALUE_OPTION_LIST_DATATYPE_UNCHANGEABLE, vKey, "Root", "DATATYPE_CODE",
			oWorkObject.PLAIN_CODE || oWorkObject.CODE);
	}
}

function isUsedInEvaluations(sValueOptionListCode, oHQ) {
	var sCriterionValueSelect = 'select top 1 ID from "sap.ino.db.evaluation::v_criterion_value" where value_option_list_code = ?';
	var aResult = oHQ.statement(sCriterionValueSelect).execute(sValueOptionListCode);
	return aResult && aResult.length > 0;
}

function isListCodeUsed(sCode, oHQ) {
	return (configUtil.isCodeUsed("sap.ino.xs.object.basis.ValueOptionList", "Root", sCode, oHQ) || isListCodeUsedInExtensionField(sCode));
}

function isListCodeUsedInExtensionField(sCode) {
	// Check if it is being used in extension nodes of Idea or Campaign
	var aObjectToCheck = ["sap.ino.xs.object.campaign.Campaign", "sap.ino.xs.object.idea.Idea"];
	var bUsed = false;
	_.each(aObjectToCheck, function(sObjectName) {
		var oExtensionNodeMetadata = AOF.getMetadata(sObjectName).getNodeMetadata("Extension");
		bUsed = bUsed || !!_.find(oExtensionNodeMetadata.attributes, function(oAttributeMetadata) {
			return oAttributeMetadata.customProperties && oAttributeMetadata.customProperties.valueOptionList === sCode;
		});
	});
	return bUsed;
}

function copyEnabledCheck(vKey, oPersistedObject, addMessage, oContext) {
	configCheck.configAvailableCheck(vKey, oPersistedObject, addMessage, oContext);

	// if the Model has no ID it cannot be copied...
	if (!oPersistedObject.ID || oPersistedObject.ID <= 0) {
		addMessage(Message.MessageSeverity.Error, BasisMessage.VALUE_OPTION_LIST_NO_COPY, vKey, "Root", "PLAIN_CODE", oPersistedObject.PLAIN_CODE);
	}
}

function updateTitles(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext, oNodeMetadata) {
	var textBundle = $.import("sap.ino.xs.xslib", "textBundle");
	var oMeta = oNodeMetadata.objectMetadata.getNodeMetadata("Root");

	var sDefaultText = oWorkObject.DEFAULT_TEXT;
	var sPrefix = textBundle.getText("uitexts", "BO_VALUE_OPTION_LIST_COPY_PREFIX", [], "", false, oContext.getHQ());
	sDefaultText = sPrefix + sDefaultText;

	// check length
	sDefaultText = sDefaultText.substr(0, oMeta.attributes.DEFAULT_TEXT.length);

	oWorkObject.DEFAULT_TEXT = sDefaultText;

	var sPlainCodeText = oWorkObject.PLAIN_CODE;
	// check length
	sPlainCodeText = sPlainCodeText.substr(0, oMeta.attributes.PLAIN_CODE.length);

	oWorkObject.PLAIN_CODE = sPlainCodeText;
}

function checkUpdateForActive(oWorkObject, oPersistedObject, vKey, addMessage, oHQ) {
	if (!oPersistedObject) {
		return;
	}

	var aWorkValueOptions = _.sortBy(oWorkObject.ValueOptions, "CODE");
	var aPersistedValueOptions = _.sortBy(oPersistedObject.ValueOptions, "CODE");

	var bIsEqual = _.isEqualOmit(aWorkValueOptions, aPersistedValueOptions, ["DEFAULT_TEXT", "DEFAULT_LONG_TEXT","SEQUENCE_NO"]);

	// if evaluations have been created or the value list is used somewhere the content of the value options may not be
	// changed any more
	// Sorting is done to ensure same order
	if (!bIsEqual && (isUsedInEvaluations(oPersistedObject.CODE, oHQ) || isListCodeUsed(oPersistedObject.CODE, oHQ))) {
		addMessage(Message.MessageSeverity.Error, BasisMessage.VALUE_OPTION_LIST_UNCHANGEABLE, vKey, "Root", "CODE", oWorkObject.PLAIN_CODE ||
			oWorkObject.CODE);
	}
	// Data type may not be changed when evaluations exist or the list code is used
	if ((oWorkObject.DATATYPE_CODE !== oPersistedObject.DATATYPE_CODE) && (isUsedInEvaluations(oPersistedObject.CODE, oHQ) || isListCodeUsed(
		oPersistedObject.CODE, oHQ))) {
		addMessage(Message.MessageSeverity.Error, BasisMessage.VALUE_OPTION_LIST_DATATYPE_UNCHANGEABLE, vKey, "Root", "DATATYPE_CODE",
			oWorkObject.PLAIN_CODE || oWorkObject.CODE);
	}
}