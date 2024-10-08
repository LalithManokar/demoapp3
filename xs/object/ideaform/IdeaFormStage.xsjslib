var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var aof = $.import("sap.ino.xs.aof.core", "framework");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");

var configDetermine = $.import("sap.ino.xs.aof.config", "determination");
var configUtil = $.import("sap.ino.xs.aof.config", "util");
var configCheck = $.import("sap.ino.xs.aof.config", "check");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var IdeaFormMessage = $.import("sap.ino.xs.object.ideaform", "message");
var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

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
			executionCheck: modifyExecutionCheck,
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
			enabledCheck: configCheck.configEnabledCheck
		}
	},
	Root: {
		table: "sap.ino.db.ideaform::t_form_stage",
		sequence: "sap.ino.db.ideaform::s_form",
		customProperties: {
			fileName: "t_form"
		},
		determinations: {
			onCreate: [configDetermine.determineConfigPackage],
			onCopy: [configDetermine.determineConfigPackage, updateTitles, determineCode],
			onModify: [determineCode, determine.systemAdminData, determineNumValueMinMax],
			onPersist: [configDetermine.activateContent]
		},
		consistencyChecks: [check.duplicateAlternativeKeyCheck("PLAIN_CODE", IdeaFormMessage.FORM_DUPLICATE_CODE, true)],
		nodes: {
			Fields: {
				table: "sap.ino.db.ideaform::t_field_stage",
				sequence: "sap.ino.db.ideaform::s_field",
				parentKey: "FORM_ID",
				customProperties: {
					fileName: "t_field"
				},
				consistencyChecks: [check.duplicateAlternativeKeyCheck("PLAIN_CODE", IdeaFormMessage.FORM_DUPLICATE_CODE, true), FieldNodeCheck],
				attributes: {
					PACKAGE_ID: {
						readOnly: true
					},
					CODE: {
						readOnly: true
					},
					FORM_CODE: {
						readOnly: true
					},
					SEQUENCE_NO: {
						required: true
					},
					DEFAULT_TEXT: {
						required: true
					},
					DEFAULT_LONG_TEXT: {},
					PLAIN_CODE: {
						required: true,
						consistencyChecks: [configCheck.validPlainCodeCheck]
					},
					ID: {
						isPrimaryKey: true
					},
					MANDATORY: {
						required: true
					},
					DATATYPE_CODE: {
						required: true,
						foreignKeyTo: "sap.ino.xs.object.basis.Datatype.Root"
					},
					VALUE_OPTION_LIST_CODE: {
						foreignKeyTo: "sap.ino.xs.object.basis.ValueOptionList.Root"
					},
					UOM_CODE: {
						foreignKeyTo: "sap.ino.xs.object.basis.Unit.Root"
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
				}
			}
		},
		attributes: {
			PACKAGE_ID: {
				readOnly: true
			},
			CODE: {
				readOnly: true
			},
			DEFAULT_TEXT: {
				required: true
			},
			DEFAULT_LONG_TEXT: {},
			ID: {
				isPrimaryKey: true
			},
			PLAIN_CODE: {
				required: true,
				consistencyChecks: [configCheck.validPlainCodeCheck]
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
		}
	}
};

function updateTitles(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext, oNodeMetadata) {
	var textBundle = $.import("sap.ino.xs.xslib", "textBundle");
	var oMeta = oNodeMetadata.objectMetadata.getNodeMetadata("Root");

	var sDefaultText = oWorkObject.DEFAULT_TEXT;
	var sPrefix = textBundle.getText("uitexts", "BO_MODEL_COPY_PREFIX", [], "", false, oContext.getHQ());
	sDefaultText = sPrefix + sDefaultText;

	// check length
	sDefaultText = sDefaultText.substr(0, oMeta.attributes.DEFAULT_TEXT.length);

	oWorkObject.DEFAULT_TEXT = sDefaultText;

	var sPlainCodeText = oWorkObject.PLAIN_CODE;
	// check length
	sPlainCodeText = sPlainCodeText.substr(0, oMeta.attributes.PLAIN_CODE.length);

	oWorkObject.PLAIN_CODE = sPlainCodeText;
}

function determineCode(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext) {
	oWorkObject.CODE = configUtil.getFullCode(oWorkObject.PACKAGE_ID, oWorkObject.PLAIN_CODE);
	if (oWorkObject.Fields) {
		// First determine all codes!
		_.each(oWorkObject.Fields, function(oField) {
			oField.PACKAGE_ID = oWorkObject.PACKAGE_ID;
			oField.CODE = configUtil.getFullCode(oWorkObject.CODE, oField.PLAIN_CODE);
			oField.FORM_CODE = oWorkObject.CODE;
		});
	}
}

const iMaxInt = 9007199254740992; // Max Int
const iMinInt = -9007199254740992; // Min Int

function determineNumValueMinMax(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext) {
	// determinations only exist on root node
	if (oWorkObject.Fields) {
		_.each(oWorkObject.Fields, function(oField) {
			if ((oField.VALUE_OPTION_LIST_CODE) && (oField.DATATYPE_CODE == DataType.DataType.Integer || oField.DATATYPE_CODE == DataType.DataType.Numeric)) {
				// if there is a value list, determine the min max out of the value list
				var oValueOptionListAO = aof.getApplicationObject("sap.ino.xs.object.basis.ValueOptionList");
				var oValueOptionList = oValueOptionListAO.read(oField.VALUE_OPTION_LIST_CODE);
				if (!oValueOptionList) {
					// error message value option list does not exist
					addMessage(Message.MessageSeverity.Error, IdeaFormMessage.FORMFIELD_VALUE_OPTION_LIST_INVALID, oField.ID, "FormField",
						"VALUE_OPTION_LIST_CODE", oField.VALUE_OPTION_LIST_CODE);
				}
				determineNumValueMinMaxFromValueOptionList(oField, oValueOptionList);
			}
		});
	}
}

function determineNumValueMinMaxFromValueOptionList(oField, oValueOptionList) {
	var iMinValue = iMaxInt;
	var iMaxValue = iMinInt;
	_.each(oValueOptionList.ValueOptions, function(oValueOption) {
		if (oValueOption.NUM_VALUE < iMinValue) {
			iMinValue = oValueOption.NUM_VALUE;
		}
		if (oValueOption.NUM_VALUE > iMaxValue) {
			iMaxValue = oValueOption.NUM_VALUE;
		}
	});

	// set the values if changed
	if (iMinValue < iMaxInt) {
		oField.NUM_VALUE_MIN = iMinValue;
	}

	if (iMaxValue > iMinInt) {
		oField.NUM_VALUE_MAX = iMaxValue;
	}
	//set step size to 0
	oField.NUM_VALUE_STEP_SIZE = 0;
}

function deleteEnabledCheck(vKey, oIdeaForm, addMessage, oContext) {
	configCheck.configEnabledCheck(vKey, oIdeaForm, addMessage, oContext);

	var oHQ = oContext.getHQ();
	var sIdeaFormSelect = 'select TOP 1 * from "sap.ino.db.campaign::t_campaign" where form_code = ?';
	var oIdeaFormResult = oHQ.statement(sIdeaFormSelect).execute(oIdeaForm.CODE);
	var sAdminFormSelct = 'select TOP 1 * from "sap.ino.db.campaign::t_campaign" where admin_form_code = ?';
	var oAdminFormResult = oHQ.statement(sAdminFormSelct).execute(oIdeaForm.CODE);

	if (oIdeaFormResult.length > 0 || oAdminFormResult.length > 0) {
		addMessage(Message.MessageSeverity.Error, IdeaFormMessage.FORM_UNDELETEABLE, vKey);
	}
}

function modifyExecutionCheck(vKey, oChangeRequest, oIdeaForm, oPersistedIdeaForm, addMessage, oContext) {
	var oHQ = oContext.getHQ();
	checkUpdateAllowed(oIdeaForm, oPersistedIdeaForm, vKey, addMessage, oHQ);
}

function FieldNodeCheck(vKey, oWorkObjectNode, addMessage, oContext) {
	FieldCheck(oWorkObjectNode, addMessage, "ID");
}

function FieldCheck(oWorkObjectNode, addMessage, sMessageKey) {
	_.each(oWorkObjectNode, function(oField) {

		// Check the Code
		if (!oField.CODE) {
			addMessage(Message.MessageSeverity.Error, IdeaFormMessage.FIELD_INVALID_CODE, oField[sMessageKey], "Criterion", "CODE", oField.PLAIN_CODE ||
				oField[sMessageKey]);
		}

		if (oField.DATATYPE_CODE) {
			if (oField.DATATYPE_CODE == DataType.DataType.Integer || oField.DATATYPE_CODE == DataType.DataType.Numeric) {
				// Make sure min and max are maintained correctly
				if (oField.NUM_VALUE_MIN !== undefined && oField.NUM_VALUE_MAX !== undefined) {
					if (oField.NUM_VALUE_MAX < oField.NUM_VALUE_MIN) {
						addMessage(Message.MessageSeverity.Error, IdeaFormMessage.FIELD_NUM_VALUE_INTERVAL_INVALID, oField[sMessageKey], "Criterion",
							"NUM_VALUE_MAX", oField.PLAIN_CODE || oField[sMessageKey]);
					}
				}
				if (oField.NUM_VALUE_STEP_SIZE < 0) {
					addMessage(Message.MessageSeverity.Error, IdeaFormMessage.FIELD_NUM_VALUE_STEP_SIZE_NEGATIVE, oField[sMessageKey], "Criterion",
						"NUM_VALUE_STEP_SIZE", oField.PLAIN_CODE || oField[sMessageKey]);
				}

				// max - min should be a multiple of the step size
				if (oField.NUM_VALUE_STEP_SIZE &&
					oField.NUM_VALUE_MIN !== undefined &&
					oField.NUM_VALUE_MAX !== undefined &&
					((oField.NUM_VALUE_MAX - oField.NUM_VALUE_MIN) % oField.NUM_VALUE_STEP_SIZE) !== 0) {
					addMessage(Message.MessageSeverity.Warning, IdeaFormMessage.FIELD_NUM_VALUE_STEP_SIZE_INVALID, oField[sMessageKey], "Criterion",
						"NUM_VALUE_STEP_SIZE", oField.PLAIN_CODE || oField[sMessageKey]);
				}

				// Step size without min/max does not make sense
				if (oField.NUM_VALUE_STEP_SIZE &&
					(oField.NUM_VALUE_MIN === undefined ||
						oField.NUM_VALUE_MAX === undefined)) {
					addMessage(Message.MessageSeverity.Warning, IdeaFormMessage.FIELD_NUM_VALUE_STEP_SIZE_INVALID, oField[sMessageKey], "Criterion",
						"NUM_VALUE_STEP_SIZE", oField.PLAIN_CODE || oField[sMessageKey]);
				}
			}
			// if there is a value list, check if it has the same data type
			if (oField.VALUE_OPTION_LIST_CODE) {
				var oValueOptionList = configUtil.readStageObject(oField.VALUE_OPTION_LIST_CODE, "sap.ino.xs.object.basis.ValueOptionList");
				if (!oValueOptionList) {
					// error message value option list does not exist
					addMessage(Message.MessageSeverity.Error, IdeaFormMessage.FORMFIELD_VALUE_OPTION_LIST_INVALID, oField[sMessageKey], "Criterion",
						"VALUE_OPTION_LIST_CODE", oField.PLAIN_CODE || oField[sMessageKey]);
				} else if (oValueOptionList.DATATYPE_CODE != oField.DATATYPE_CODE) {
					// error message: value option list must have the same data type as the criterion
					addMessage(Message.MessageSeverity.Error, IdeaFormMessage.FIELD_VALUE_OPTION_LIST_WRONG_DATATYPE, oField[sMessageKey], "Criterion",
						"VALUE_OPTION_LIST_CODE", oField.VALUE_OPTION_LIST_CODE, oField[sMessageKey]);
				}
			}
			//If the is display only checked the field for display text should be set as mandatory
			if(oField.IS_DISPLAY_ONLY){
			    if(!oField.DISPLAY_TEXT || oField.DISPLAY_TEXT.length < 1){
					addMessage(Message.MessageSeverity.Error, IdeaFormMessage.FORMFIELD_DISPLAY_TEXT_EMPTY, oField[sMessageKey], "Criterion",
						"DISPLAY_TEXT", oField.PLAIN_CODE || oField[sMessageKey]);			        
			    }
			}
		}
	});
}

function checkUpdateAllowed(oWorkObject, oPersistedObject, vKey, addMessage, oHQ) {
	if (!oPersistedObject) {
		return;
	}

	var bIsFormUsed = isFormUsed(oPersistedObject.CODE, oHQ);
	var bIsCreatedFieldValue = isCreatedFieldValue(oPersistedObject.CODE, oHQ);
	var bIsAdminFormChanged = isAdminFormChanged(oPersistedObject.IS_ADMIN_FORM, oWorkObject.IS_ADMIN_FORM);

	var aWorkFields = _.sortBy(oWorkObject.Fields, "CODE");
	var aPersistedFields = _.sortBy(oPersistedObject.Fields, "CODE");
       _.each(aWorkFields, function(oField){
           if(oField.IS_PUBLISH === null){
               oField.IS_PUBLISH = 0;
           } 
           if(oField.IS_HIDDEN === null){
               oField.IS_HIDDEN = 0;
           }   
           if(oField.IS_DISPLAY_ONLY === null){
               oField.IS_DISPLAY_ONLY = 0;
           }              
           
       });       
       
       _.each(aPersistedFields, function(oField){
           if(oField.IS_PUBLISH === null){
               oField.IS_PUBLISH = 0;
           } 
           if(oField.IS_HIDDEN === null){
               oField.IS_HIDDEN = 0;
           }   
           if(oField.IS_DISPLAY_ONLY === null){
               oField.IS_DISPLAY_ONLY = 0;
           }              
           
       });
       
	if (bIsFormUsed && bIsCreatedFieldValue) {
		var aPersistedCode = _.pluck(aPersistedFields, "CODE");
		var aWorkCode = _.pluck(aWorkFields, "CODE");
		var aDiffFieldCode = _.difference(aPersistedCode, aWorkCode);
		if(aDiffFieldCode.length > 0){
		var bFieldCreatedValue = isFieldCretedValueForCode(aDiffFieldCode, oHQ);
		bIsCreatedFieldValue = bIsCreatedFieldValue && bFieldCreatedValue;	 
		}
		
		var aWorkFieldsExcludeNew = _.filter(aWorkFields, function(field) {
			return field.ID > 0;
		});
		var aWorkFieldsOnlyNew = _.filter(aWorkFields, function(field) {
			return field.ID < 0;
		});
		if (aWorkFieldsOnlyNew.length > 0) {
			var bIsMandatoryFieldsForNew = isMandatoryFieldsforNew(aWorkFieldsOnlyNew);
			if (bIsMandatoryFieldsForNew) {
				addMessage(Message.MessageSeverity.Error, IdeaFormMessage.FORM_FIELD_MANDATORY_UNCHANGEABLE, vKey, "Root", "", oPersistedObject.DEFAULT_TEXT);
			}
			aWorkFields = aWorkFieldsExcludeNew;
		}
	}

	var bIsEqual = _.isEqualOmit(aWorkFields, aPersistedFields, ["DEFAULT_TEXT", "DEFAULT_LONG_TEXT", "IS_HIDDEN", "MANDATORY","DISPLAY_TEXT","IS_ACTIVE"]);

	// Sort before comparison as the order is significant when comparing arrays
	if (!bIsEqual && bIsCreatedFieldValue) {
		addMessage(Message.MessageSeverity.Error, IdeaFormMessage.FORM_FIELD_UNCHANGEABLE, vKey, "Root", "", oPersistedObject.DEFAULT_TEXT);
	}

	if (oWorkObject.PLAIN_CODE) {
		if ((oWorkObject.PLAIN_CODE !== oPersistedObject.PLAIN_CODE) && (bIsCreatedFieldValue || bIsFormUsed)) {
			addMessage(Message.MessageSeverity.Error, IdeaFormMessage.FORM_PLAIN_CODE_UNCHANGABLE, vKey, "Root", "PLAIN_CODE", oPersistedObject.PLAIN_CODE);
		}
	}

	if (bIsAdminFormChanged && bIsFormUsed) {
		addMessage(Message.MessageSeverity.Error, IdeaFormMessage.ADMIN_ONLY_UNCHANGEABLE, vKey, "Root", "", oPersistedObject.DEFAULT_TEXT);
	}
}

function isAdminFormChanged(bIsAdminFormPersisted, bIsAdminFormWork) {
	if (bIsAdminFormPersisted !== bIsAdminFormWork) {
		return true;
	} else {
		return false;
	}
}

function isFormUsed(sCode, oHQ) {
	return configUtil.isCodeUsed("sap.ino.xs.object.ideaform.IdeaForm", "Root", sCode, oHQ);
}

function isCreatedFieldValue(sCode, oHQ) {
	var sSelect =
		'select top 1 * from "sap.ino.db.ideaform::v_field_value" where form_code = ?';
	var result = oHQ.statement(sSelect).execute(sCode);

	if (result.length > 0) {
		return true;
	}

	return false;
}

function isFieldCretedValueForCode(aFieldCode, oHQ) {
	var sCodeString = aFieldCode.join('\',\'');

	var sSelect =
		'select top 1 * from "sap.ino.db.ideaform::v_field_value" where field_code in (\'' + sCodeString + '\')';
	var result = oHQ.statement(sSelect).execute();
	if (result.length > 0) {
		return true;
	}

	return false;
}

function isMandatoryFieldsforNew(aFields) {
	var bMandatory = false;
	for (var i = 0; i < aFields.length; i++) {
		if (aFields[i].MANDATORY) {
			bMandatory = true;
			break;
		}

	}
	return bMandatory;

}