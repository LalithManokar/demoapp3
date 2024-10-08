var iamMsg = $.import("sap.ino.xs.object.iam", "message");
var Message = $.import("sap.ino.xs.aof.lib", "message");

function authorizationCheck(vKey, oLog, addMessage, oContext) {
	if ($.session.hasSystemPrivilege("sap.ino.xs.rest.admin.application::execute") || oContext.getUser().ID === oLog.ID) {
		return true;
	}
	addMessage(Message.MessageSeverity.Error, iamMsg.MSG_GENERIC_AUTH_ERROR, vKey);
	return false;
}

function enabledCheck(vKey, oLog, addMessage, oContext) {
	var oHQ = oContext.getHQ();
	var oLogs = oHQ.statement('select * from "sap.ino.db.iam::t_identity" where id = ? and validation_to < CURRENT_TIMESTAMP')
		.execute(oLog.IDENTITY_ID);
    if(oLogs && oLogs.length > 0){
        return true;
    }
	addMessage(Message.MessageSeverity.Error);
	return false;
}

this.definition = {
	actions: {
		create: {
			authorizationCheck: authorizationCheck
		},
		del: {
			authorizationCheck: authorizationCheck,
			enabledCheck: enabledCheck
		},
		read: {
			authorizationCheck: authorizationCheck
		}
	},
	Root: {
		table: "sap.ino.db.iam::t_identity_log",
		sequence: "sap.ino.db.iam::s_identity_log",
		attributes: {
			ID: {
				isPrimaryKey: true
			},
			CREATED_AT: {
				required: true
			},
			CREATED_BY_ID: {
				required: true,
				foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
			},
			CHANGED_AT: {
				required: true
			},
			CHANGED_BY_ID: {
				required: true,
				foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
			},
			IDENTITY_ID: {
				required: true,
				foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
			},
			CHANGED_ATTRIBUTE: {
				required: true
			},
			CHANGED_ATTRIBUTE_TYPE: {
				required: true
			}
		}
	}
};