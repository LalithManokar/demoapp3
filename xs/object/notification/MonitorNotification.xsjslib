const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var IAMMessage = $.import("sap.ino.xs.object.iam", "message");

this.definition = {
	Root: {
		table: "sap.ino.db.notification::t_notification_status",
		sequence: "sap.ino.db.notificaiton::s_notification_status",
		determinations: {}
	},
	actions: {
		del: {
			authorizationCheck: false
		},
		updateNotificationStatus: {
			authorizationCheck: false,
			execute: updateNotificationStatus,
			isStatic: true
		}
	}
};

function updateNotificationStatus(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	var oHQ = oContext.getHQ();
	const sUpdateQuery =
		`UPDATE "sap.ino.db.notification::t_notification_status" 
	        SET MAIL_STATUS_CODE=?
          WHERE ID=?`;
	oHQ.statement(sUpdateQuery).execute(['UNSENT', oReq.ID]);
}
//END