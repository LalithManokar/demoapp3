var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var aof = $.import("sap.ino.xs.aof.core", "framework");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");

var configDetermine = $.import("sap.ino.xs.aof.config", "determination");
var configUtil = $.import("sap.ino.xs.aof.config", "util");
var configCheck = $.import("sap.ino.xs.aof.config", "check");

var TagAssignment = $.import("sap.ino.xs.object.tag", "TagAssignment");
var IdentityRole = $.import("sap.ino.xs.object.iam", "ObjectIdentityRole");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var RespMessage = $.import("sap.ino.xs.object.subresponsibility", "message");
var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

var DataType = $.import("sap.ino.xs.object.basis", "Datatype");

var UrlWhiteList = $.import("sap.ino.xs.xslib", "urlWhiteList");

this.definition = {
	actions: {
		create: {
			authorizationCheck: false,
			enabledCheck: configCheck.configEnabledCheck,
			historyEvent: "RESP_CREATED"
		},
		update: {
			authorizationCheck: false,
			executionCheck: modifyExecutionCheck,
			enabledCheck: configCheck.configEnabledCheck,
			historyEvent: "RESP_UPDATED"
		},
		del: {
			authorizationCheck: false,
			enabledCheck: deleteEnabledCheck,
			historyEvent: "RESP_DELETED"
		},
		read: {
			authorizationCheck: false,
			enabledCheck: configCheck.configEnabledCheck
		},
		copy: {
			authorizationCheck: false,
			enabledCheck: configCheck.configEnabledCheck,
			historyEvent: "RESP_COPIED"
		},
		deleteTagAssignments: TagAssignment.includeDeleteTagAssignment(),
		mergeTagAssignments: TagAssignment.includeMergeTagAssignment()
	},
	Root: {
		table: "sap.ino.db.subresponsibility::t_responsibility_stage",
		sequence: "sap.ino.db.subresponsibility::s_responsibility",
		determinations: {
			onCreate: [configDetermine.determineConfigPackage],
			onCopy: [configDetermine.determineConfigPackage, updateTitles, determineCode],
			onModify: [determineCode, determine.systemAdminData, determineNewTags],
			onPersist: []
		},
		consistencyChecks: [check.duplicateAlternativeKeyCheck("PLAIN_CODE", RespMessage.RESP_DUPLICATE_CODE, true), emptyPeopleCheck,
			emptyValueCheck, validateUrlCheck],
		nodes: {
			RespValues: {
				table: "sap.ino.db.subresponsibility::t_responsibility_value_stage",
				sequence: "sap.ino.db.subresponsibility::s_responsibility_value",
				parentKey: "RESP_ID",
				attributes: {
					PACKAGE_ID: {
						readOnly: true
					},
					CODE: {
						readOnly: true
					},
					RESP_CODE: {
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
					},
					PARENT_VALUE_CODE: {
						//readOnly : true
					},
					PARENT_VALUE_ID: {
						foreignKeyTo: "sap.ino.xs.object.subresponsibility.ResponsibilityStage.RespValues",
						foreignKeyIntraObject: true
					}
				},
				nodes: {
					Tags: TagAssignment.node(TagAssignment.ObjectTypeCode.Responsibility),
					Coaches: IdentityRole.node(IdentityRole.ObjectType.Responsibility, IdentityRole.Role.ResponsibilityCoach, false),
					Experts: IdentityRole.node(IdentityRole.ObjectType.Responsibility, IdentityRole.Role.ResponsibilityExpert, false)
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
	if (oWorkObject.RespValues) {
		// First determine all codes!
		_.each(oWorkObject.RespValues, function(oRespValue) {
			oRespValue.PACKAGE_ID = oWorkObject.PACKAGE_ID;
			oRespValue.CODE = configUtil.getFullCode(oWorkObject.CODE, oRespValue.PLAIN_CODE);
			oRespValue.RESP_CODE = oWorkObject.CODE;
		});
	}

	_.each(oWorkObject.RespValues, function(oRespValue) {
		determineRespValueCodeFromId(oWorkObject.RespValues, oRespValue, "PARENT_VALUE_ID", "PARENT_VALUE_CODE");
	});
}

function determineNewTags(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext) {
	if (oWorkObject.RespValues) {
		//check and create new tags
		_.each(oWorkObject.RespValues, function(oRespValue) {
			TagAssignment.createTags(oRespValue.ID, oRespValue, oPersistedObject, addMessage, getNextHandle, oContext);
		});
	}
}

function emptyPeopleCheck(vKey, oResponsibility, addMessage, oContext) {
	_.each(oResponsibility.RespValues, function(oRespValue) {
		if (!oRespValue.Coaches || oRespValue.Coaches.length === 0) {
			addMessage(Message.MessageSeverity.Warning, RespMessage.RESPONSIBILITY_VALUE_ONE_COACH_MANDATORY, vKey, "Coaches", "IDENTITY_ID",
				oRespValue.DEFAULT_TEXT);
		}

		if (!oRespValue.Experts || oRespValue.Experts.length === 0) {
			addMessage(Message.MessageSeverity.Warning, RespMessage.RESPONSIBILITY_VALUE_ONE_EXPERT_MANDATORY, vKey, "Experts", "IDENTITY_ID",
				oRespValue.DEFAULT_TEXT);
		}
	});
}

function validateUrlCheck(vKey, oResponsibility, addMessage, oContext) {
	UrlWhiteList.initURLWhitelist();
	_.each(oResponsibility.RespValues, function(oRespValue) {
		var sURL = oRespValue.LINK_URL;
		if (oRespValue.LINK_URL) {
			if (sURL && sURL.indexOf("http://") !== 0 && sURL.indexOf("https://") !== 0 && sURL.indexOf("mailto:") !== 0) {
				sURL = "http://" + sURL;
			}

			if (!sURL || sURL === "" || !UrlWhiteList.validateUrl(sURL)) {
				addMessage(Message.MessageSeverity.Error, RespMessage.RESPONSIBILITY_VALUE_INVALID_URL, oRespValue.CODE, "RespValues", "LINK_URL",
					oRespValue.LINK_URL);
			}
		}
	});
}

function emptyValueCheck(vKey, oResponsibility, addMessage, oContext) {
	if (oResponsibility.RespValues.length === 0) {
		addMessage(Message.MessageSeverity.Error, RespMessage.RESPONSIBILITY_ONE_VALUE_MANDATORY, vKey, "Root");
	}
}

function updateEnabledCheck(vKey, oResponsibility, addMessage, oContext) {
	configCheck.configEnabledCheck(vKey, oResponsibility, addMessage, oContext);

	var oHQ = oContext.getHQ();
	var sSelect = 'select TOP 1 * from "sap.ino.db.campaign::t_campaign" where resp_code = ?';
	var result = oHQ.statement(sSelect).execute(oResponsibility.CODE);
	if (result.length > 0) {
		addMessage(Message.MessageSeverity.Error, RespMessage.RESP_UNDELETEABLE, vKey);
	}
}

function deleteEnabledCheck(vKey, oResponsibility, addMessage, oContext) {
	configCheck.configEnabledCheck(vKey, oResponsibility, addMessage, oContext);

	var oHQ = oContext.getHQ();
	var sSelect = 'select TOP 1 * from "sap.ino.db.campaign::t_campaign" where resp_code = ?';
	var result = oHQ.statement(sSelect).execute(oResponsibility.CODE);
	if (result.length > 0) {
		addMessage(Message.MessageSeverity.Error, RespMessage.RESP_UNDELETEABLE, vKey);
	}
}

function modifyExecutionCheck(vKey, oChangeRequest, oResponsibility, oPersistedResponsibility, addMessage, oContext) {
	plainCodeChangableCheck(vKey, oChangeRequest, oResponsibility, oPersistedResponsibility, addMessage, oContext);
	respValuesPlainCodeChangableCheck(vKey, oChangeRequest, oResponsibility, oPersistedResponsibility, addMessage, oContext);
	respValuesPlainCodeDuplicateCheck(vKey, oChangeRequest, oResponsibility, oPersistedResponsibility, addMessage, oContext);
	//check if the responsibility values are used in submitted ideas, if so, we can't delete the root node
	checkRootRespValueDelete(vKey, oChangeRequest, oResponsibility, oPersistedResponsibility, addMessage, oContext);
	assignDeletedRespValue(vKey, oChangeRequest, oResponsibility, oPersistedResponsibility, addMessage, oContext);
}

function assignDeletedRespValue(vKey, oChangeRequest, oResponsibility, oPersistedResponsibility, addMessage, oContext) {
	if (oChangeRequest.RespValues) {
		var aDeletedNodes = oPersistedResponsibility.RespValues.filter(function(oPersistedRespValue) {
			var aResult = oResponsibility.RespValues.filter(function(oChangedRespValue) {
				return oChangedRespValue.ID === oPersistedRespValue.ID;
			});

			return (aResult.length === 0);
		});

		if (aDeletedNodes.length > 0) {
			var aDeletedChangeNodes = JSON.parse(JSON.stringify(aDeletedNodes));
			//if the parent node and children nodes are deleted together, the children nodes should be behaved as their Parent Nodes
			aDeletedChangeNodes = convertToHierarchy(aDeletedChangeNodes, "ID", "PARENT_VALUE_ID");

			_.each(aDeletedChangeNodes, function(oDeletedNode) {
				//recur update all the children nodes which are uesd in ideas
				assignDeletedRespValueToParent(oDeletedNode, oDeletedNode.PARENT_VALUE_CODE, oContext);
			});
		}
	}
}

function assignDeletedRespValueToParent(oRespValue, sParentCode, oContext) {
	var oHQ = oContext.getHQ();
	var sUpdate = 'UPDATE "sap.ino.db.idea::t_idea" SET RESP_VALUE_CODE = ? WHERE RESP_VALUE_CODE = ?';

	oHQ.statement(sUpdate).execute([sParentCode, oRespValue.CODE]);
	if (oRespValue.children && oRespValue.children.length > 0) {
		_.each(oRespValue.children, function(oChildRespValue) {
			assignDeletedRespValueToParent(oChildRespValue, sParentCode, oContext);
		});
	}
}

function checkRootRespValueDelete(vKey, oChangeRequest, oResponsibility, oPersistedResponsibility, addMessage, oContext) {
	if (oChangeRequest.RespValues) {
		var aPersistedRootNodes = oPersistedResponsibility.RespValues.filter(function(oRespValue) {
			return !oRespValue.PARENT_VALUE_ID;
		});
		var aDeletedRootNodes = aPersistedRootNodes.filter(function(oRespValue) {
			var aResult = oResponsibility.RespValues.filter(function(oChangedRespValue) {
				return oChangedRespValue.ID === oRespValue.ID;
			});
			return (aResult.length === 0);
		}); //define an array to store the Root nodes which are deleted

		if (aDeletedRootNodes.length > 0) {
			var oCheckRespValues = JSON.parse(JSON.stringify(oPersistedResponsibility.RespValues));
			oCheckRespValues = convertToHierarchy(oCheckRespValues, "ID", "PARENT_VALUE_ID");

			_.each(oCheckRespValues, function(oRespValue) {
				var aResult = aDeletedRootNodes.filter(function(oDeletedRootNode) {
					return oDeletedRootNode.CODE === oRespValue.CODE;
				});
				if (aResult.length > 0) {
					if (visitChildrenValue(oRespValue, oContext)) {
						addMessage(Message.MessageSeverity.Error, RespMessage.RESPONSIBILITY_ROOT_VALUE_UNDELETEABLE, vKey, "RespValues", "ID",
							oRespValue.DEFAULT_TEXT);
					}
				}
			});
		}
	}
}

//recur visit the children values to check out whether it is used in ideas or not
function visitChildrenValue(oRespValue, oContext) {
	var oHQ = oContext.getHQ();
	var sSelect =
		'select TOP 1 * from "sap.ino.db.idea::t_idea" where resp_value_code = ? \
	            and status_code != \'sap.ino.config.DRAFT\'';
	var result = oHQ.statement(sSelect).execute(oRespValue.CODE);
	if (result.length > 0) {
		return true; //ideas used the responsibility value
	} else if (oRespValue.children && oRespValue.children.length > 0) {
		for (var i = 0; i < oRespValue.children.length; i++) {
			if (visitChildrenValue(oRespValue.children[i], oContext)) {
				return true; //ideas used the responsibility value
			}
		}
	}

	return false; //no idea used any chlldren responsibility value
}

function convertToHierarchy(aObjects, sKeyName, sParentKeyName) {
	var aNodeObjects = createStructure(aObjects);

	for (var i = aNodeObjects.length - 1; i >= 0; i--) {
		var oCurrentNode = aNodeObjects[i];

		var oParent = getParent(oCurrentNode, aNodeObjects, sKeyName, sParentKeyName);

		if (oParent === null) {
			continue;
		}

		oParent.children.push(oCurrentNode);
		aNodeObjects.splice(i, 1);
	}

	// What remains in nodeObjects will be the root nodes.

	return aNodeObjects;
}

function getParent(oChild, aNodes, sKeyName, sParentKeyName) {
	var oParent = null;

	for (var i = 0; i < aNodes.length; i++) {
		if (aNodes[i][sKeyName] === oChild[sParentKeyName]) {
			oParent = aNodes[i];
			break;
		}
	}

	return oParent;
}

function createStructure(aNodes) {
	var aObjects = [];

	for (var i = 0; i < aNodes.length; i++) {
		if (!aNodes[i].children || !_.isArray(aNodes[i].children)) {
			aNodes[i].children = []; // create empty array for children later
		}
		aObjects.push(aNodes[i]);
	}

	return aObjects;
}

function determineRespValueCodeFromId(aRespValues, oRespValue, sID, sCode) {
	if (oRespValue[sID]) {
		// determine the code out of the ID again
		var oRefRespValue = _.findWhere(aRespValues, {
			ID: oRespValue[sID]
		});
		if (oRefRespValue) {
			oRespValue[sCode] = oRefRespValue.CODE;
		}
	}
}

function plainCodeChangableCheck(vKey, oChangeRequest, oResponsibility, oPersistedResponsibility, addMessage, oContext) {
	if (oChangeRequest.PLAIN_CODE) {
		var oHQ = oContext.getHQ();
		var sSelect = 'select TOP 1 * from "sap.ino.db.campaign::t_campaign" where resp_code = ?';
		var result = oHQ.statement(sSelect).execute(oResponsibility.CODE);
		if (result.length > 0) {
			addMessage(Message.MessageSeverity.Error, RespMessage.RESPONSIBILITY_PLAIN_CODE_UNCHANGABLE, vKey);
		}
	}
}

function respValuesPlainCodeChangableCheck(vKey, oChangeRequest, oResponsibility, oPersistedResponsibility, addMessage, oContext) {
	if (oChangeRequest.RespValues && oChangeRequest.RespValues.length > 0) {
		var aSortedRespValues = _.sortBy(oPersistedResponsibility.RespValues, "SEQUENCE_NO");

		var oHQ = oContext.getHQ();
		var sSelect = 'select TOP 1 * from "sap.ino.db.idea::t_idea" where resp_value_code = ?';
		for (var i = 0; i < oChangeRequest.RespValues.length; i++) {
			if (aSortedRespValues[i] && oChangeRequest.RespValues[i].PLAIN_CODE) {
				var result = oHQ.statement(sSelect).execute(aSortedRespValues[i].CODE);
				if (result.length > 0) {
					addMessage(Message.MessageSeverity.Error, RespMessage.RESPONSIBILITY_VALUE_PLAIN_CODE_UNCHANGABLE, vKey, "RespValues", "PLAIN_CODE",
						aSortedRespValues[i].PLAIN_CODE);
				}
			}
		}
	}
}

function respValuesPlainCodeDuplicateCheck(vKey, oChangeRequest, oResponsibility, oPersistedResponsibility, addMessage, oContext) {
	if (oChangeRequest.RespValues && oChangeRequest.RespValues.length > 0) {
		var dupliateRespValue = {};
		_.each(oChangeRequest.RespValues, function(oRespValue) {
			if (!oRespValue.PLAIN_CODE) {
				return true;
			}
			if (dupliateRespValue[oRespValue.PLAIN_CODE] === 1) {
				addMessage(Message.MessageSeverity.Error, RespMessage.RESP_DUPLICATE_CODE, vKey, "RespValues", "PLAIN_CODE", oRespValue.PLAIN_CODE);
				return false;
			}
			dupliateRespValue[oRespValue.PLAIN_CODE] = 1;
		});
		var oHQ = oContext.getHQ();
		var sSelect;
		
		for (var i = 0; i < oChangeRequest.RespValues.length; i++) {
			if (!!oChangeRequest.RespValues && !!oChangeRequest.RespValues[i].PLAIN_CODE) {
			    var params = [oChangeRequest.RespValues[i].PLAIN_CODE];
			    sSelect = 'select TOP 1 * from "sap.ino.db.subresponsibility::t_responsibility_value_stage" where PLAIN_CODE = ? ';
		    	if(oChangeRequest.RespValues[i].ID > 0){
			        sSelect += " AND ID <> ? ";
			        params.push(oChangeRequest.RespValues[i].ID);
		        }
				var result = oHQ.statement(sSelect).execute(params);
				if (result.length > 0) {
					addMessage(Message.MessageSeverity.Error, RespMessage.RESP_DUPLICATE_CODE, vKey, "RespValues", "PLAIN_CODE", oChangeRequest.RespValues[
						i].PLAIN_CODE);
					break;
				}
			}
		}
	}
}