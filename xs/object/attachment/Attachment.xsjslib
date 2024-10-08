var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var IdentityRole = $.import("sap.ino.xs.object.iam", "ObjectIdentityRole");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var AttachmentMessage = $.import("sap.ino.xs.object.attachment", "message");
var AttachmentUtil = $.import("sap.ino.xs.object.attachment", "AttachmentUtil");

this.definition = {
	actions: {
		create: {
			authorizationCheck: auth.parentInstanceAccessCheck("sap.ino.db.attachment.folder::v_auth_attachment_folder_write", "FOLDER_ID",
				"FOLDER_ID", AttachmentMessage.AUTH_MISSING_ATTACHMENT_CREATE, true),
			historyEvent: "ATTACH_CREATED"
		},
		/* same as create */
		copy: {
			authorizationCheck: auth.parentInstanceAccessCheck("sap.ino.db.attachment.folder::v_auth_attachment_folder_write", "FOLDER_ID",
				"FOLDER_ID", AttachmentMessage.AUTH_MISSING_ATTACHMENT_CREATE, true),
			historyEvent: "ATTACH_CREATED"
		},
		update: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.attachment::v_auth_attachment_update", "ATTACHMENT_ID", AttachmentMessage.AUTH_MISSING_ATTACHMENT_UPDATE),
			historyEvent: "ATTACH_UPDATED"
		},
		del: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.attachment::v_auth_attachment_delete", "ATTACHMENT_ID", AttachmentMessage.AUTH_MISSING_ATTACHMENT_DELETE),
			historyEvent: "ATTACH_DELETED"
		},
		read: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.attachment::v_auth_attachment", "ATTACHMENT_ID", AttachmentMessage.AUTH_MISSING_ATTACHMENT_READ)
		},
		//refer to Evaluation.xsjslib
		changeAuthor: {
			authorizationCheck: false,
			execute: bulkChangeAuthor,
			historyEvent: "ATTACHMENT_CHANGE_AUTHOR",
			isStatic: true,
			isInternal: true
		},
		getAttachmentImgName: {
			authorizationCheck: false,
			execute: getAttachmentImgName,
		},
		rename: {
			authorizationCheck: false,
			execute: rename,
			historyEvent: "ATTACHMENT_RENAME",
			isStatic: true,
			isInternal: false
		}
	},
	Root: {
		table: "sap.ino.db.attachment::t_attachment",
		sequence: "sap.ino.db.attachment::s_attachment",
		determinations: {
			onCreate: [createOwner],
			onCopy: [createOwner],
			onModify: [determine.systemAdminData, createData, determineFileSize, determineMediaType]
		},
		consistencyChecks: [antiVirusCheck],
		nodes: {
			Owner: IdentityRole.node(IdentityRole.ObjectType.Attachment, IdentityRole.Role.AttachmentOwner, true),
			Data: {
				table: "sap.ino.db.attachment::t_attachment_data",
				parentKey: "ID",
				readOnly: false
			}
		},
		attributes: {
			FOLDER_ID: {
				foreignKeyTo: "sap.ino.xs.object.attachment.AttachmentFolder.Root"
			},
			DATA: {
				// transient attribute
			},
			DATA_SMALL: {
				// transient attribute
			},
			DATA_LARGE: {
				// transient attribute
			},
			FILE_NAME: {
				required: true
			},
			FILE_SIZE: {
				readOnly: true
			},
			MEDIA_TYPE: {
				readOnly: true
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

function createOwner(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext) {
	var iUserId = oContext.getUser().ID;
	oWorkObject.Owner = [{
		ID: getNextHandle(),
		IDENTITY_ID: iUserId
    }];
}

function createData(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext) {
	if (oWorkObject.DATA) {
		oWorkObject.Data = [{
			DATA: oWorkObject.DATA,
			DATA_SMALL: oWorkObject.DATA_SMALL,
			DATA_LARGE: oWorkObject.DATA_LARGE
        }];
	} else {
		if (oWorkObject.DATA_SMALL && oWorkObject.DATA_LARGE) {
			oWorkObject.Data = [{
				DATA_SMALL: oWorkObject.DATA_SMALL,
				DATA_LARGE: oWorkObject.DATA_LARGE
            }];
		}
	}
}

function determineFileSize(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext) {
	var oData;
	if (oWorkObject.Data && oWorkObject.Data.length > 0) {
		oData = oWorkObject.Data[0].DATA;
	}
	AttachmentUtil.determineFileSize(vKey, oWorkObject, oData, oContext.getAction().name, addMessage);
}

function determineMediaType(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext) {
	var oData;
	if (oWorkObject.Data && oWorkObject.Data.length > 0) {
		oData = oWorkObject.Data[0].DATA;
	}
	AttachmentUtil.determineMediaType(vKey, oWorkObject, oData, oWorkObject.FILE_NAME, addMessage, oContext.getHQ());
}

function antiVirusCheck(vKey, oAttachment, addMessage, oContext) {
	var oData;
	if (oAttachment.Data && oAttachment.Data.length > 0) {
		oData = oAttachment.Data[0].DATA;
	}
	AttachmentUtil.antiVirusCheck(vKey, oData, oAttachment.FILE_NAME, addMessage);
}

function bulkChangeAuthor(oParameters, oBulkAccess, addMessage, getNextHandle, oContext) {
	if (oParameters && oParameters.AUTHOR_ID && oParameters.keys) {
		var sCondition = "(e.IDEA_ID = ? ";
		for (var index = 1; index < oParameters.keys.length; index++) {
			sCondition += " OR e.IDEA_ID = ? ";
		}
		sCondition += ")";
		var sWhere =
			`
		(ID IN (SELECT DISTINCT a.ATTACHMENT_ID
		FROM "sap.ino.db.attachment::t_attachment_assignment" AS a
			INNER JOIN "sap.ino.db.evaluation::t_evaluation" AS e
			ON a.OWNER_ID = e.ID
		WHERE OWNER_TYPE_CODE = 'EVALUATION'
			AND 
		`;
		sWhere += " " + sWhere + sCondition + "))";
		var oResponse = oBulkAccess.update({
			Root: {
				CREATED_BY_ID: oParameters.AUTHOR_ID,
				CHANGED_BY_ID: oContext.getUser().ID,
				CHANGED_AT: oContext.getRequestTimestamp()
			}
		}, {
			condition: sCondition,
			conditionParameters: oParameters.keys
		});
		addMessage(oResponse.messages);
	} else {
		addMessage(Message.MessageSeverity.Error, AttachmentMessage.ATTACHMENT_BULK_CHANGE_AUTHOR_PARAMETER_REQUIRED, undefined, "", "");
	}
}

function getAttachmentImgName(vKey, oParameters, oAttachment, addMessage, getNextHandle, oContext) {
	var oHQ = oContext.getHQ();
	var sSelect = 'select FILE_NAME from "sap.ino.db.attachment::t_attachment" WHERE ID=?';
	var aResult = oHQ.statement(sSelect).execute(oAttachment.ID);
	return aResult[0].FILE_NAME;
}

function rename(oParameters, oBulkAccess, addMessage, getNextHandle, oContext) {
	if (oParameters && oParameters.id && oParameters.fileName) {
		var fnCheck = auth.instanceAccessCheck("sap.ino.db.attachment::v_auth_attachment_update", "ATTACHMENT_ID", AttachmentMessage.AUTH_MISSING_ATTACHMENT_UPDATE);
		var bCheck = fnCheck(oParameters.id, undefined, function() {}, oContext);
		if (!bCheck) {
			var oHQ = oContext.getHQ();
			var sSelect =
				'SELECT idea.ID, idea.CAMPAIGN_ID, idea.RESP_VALUE_CODE FROM "sap.ino.db.idea::t_idea" AS idea INNER JOIN "sap.ino.db.attachment::t_attachment_assignment" AS attch ON idea.id = attch.owner_id WHERE attch.attachment_id = ? AND attch.owner_type_code = ? ';
			var aResult = oHQ.statement(sSelect).execute(oParameters.id, 'IDEA');
			if (aResult && aResult.length > 0) {
				var oPersistedIdea = aResult[0];
				var fnIdeaUpdateCheck = auth.instanceAccessCheck("sap.ino.db.idea::v_auth_ideas_update", "IDEA_ID", undefined);
				bCheck = bCheck || fnIdeaUpdateCheck(oPersistedIdea.IDs, undefined, function() {}, oContext);
				var fnRespInstanceCheck = auth.instanceAccessCheck("sap.ino.db.idea::v_auth_backoffice_responsibility_privilege", "RESP_VALUE_CODE",
					undefined);
				var fnCampInstanceCheck = auth.instanceAccessCheck("sap.ino.db.idea::v_auth_backoffice_campaign_privilege", "CAMPAIGN_ID", undefined);
				var fnInstanceCheck = auth.atLeastOneMulKeysAccessCheck([fnCampInstanceCheck, fnRespInstanceCheck]);
				bCheck = bCheck || fnInstanceCheck([oPersistedIdea.CAMPAIGN_ID || 0, oPersistedIdea.RESP_VALUE_CODE], undefined, function() {},
					oContext);
			}
		}
		if (!bCheck) {
			addMessage(Message.MessageSeverity.Error, AttachmentMessage.AUTH_MISSING_ATTACHMENT_UPDATE, undefined, "", "");
			return;
		}
		var oResponse = oBulkAccess.update({
			Root: {
				FILE_NAME: oParameters.fileName,
				CHANGED_BY_ID: oContext.getUser().ID,
				CHANGED_AT: oContext.getRequestTimestamp()
			}
		}, {
			condition: " ID = ? ",
			conditionParameters: oParameters.id
		});
	} else {
		addMessage(Message.MessageSeverity.Error, AttachmentMessage.AUTH_MISSING_ATTACHMENT_UPDATE, undefined, "", "");
	}
}