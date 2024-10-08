var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var NotificationMessage = $.import("sap.ino.xs.object.notification", "message");
var Message = $.import("sap.ino.xs.aof.lib", "message");

this.definition = {
    actions : {
        read : {
            authorizationCheck : authCheck(NotificationMessage.AUTH_MISSING_NOTIFICATION_READ),
        },
        readNotification : {
            authorizationCheck : authCheck(NotificationMessage.AUTH_MISSING_NOTIFICATION_UPDATE),
            execute : function(vKey, oParameters, oNotificationStatus, addMessage, getNextHandle, oContext) {
                oNotificationStatus.STATUS_CODE = "READ";
            }
        },
        readAllNotifications : {
            authorizationCheck : authCheck(NotificationMessage.AUTH_MISSING_NOTIFICATION_UPDATE),
            execute : function(vKey, oParameters, oNotificationStatus, addMessage, getNextHandle, oContext) {
                oNotificationStatus.STATUS_CODE = "READ";
                var oHQ = oContext.getHQ();
                var sUpdateStatement = "UPDATE \"sap.ino.db.notification::t_notification_status\" SET STATUS_CODE = 'READ' WHERE ID <= ? AND USER_ID = ? AND STATUS_CODE = 'UNREAD'";
                oHQ.statement(sUpdateStatement).execute(vKey, oContext.getUser().ID);
            }
        }
    },
    Root : {
        table : "sap.ino.db.notification::t_notification_status",
        sequence : "sap.ino.db.notification::s_notification_status",
    }
};

function authCheck(sAuthFailMsg) {
    return function(vKey, oWorkObject, fnMessage, oContext) {
        if (oWorkObject.USER_ID != oContext.getUser().ID) {
            fnMessage(Message.MessageSeverity.Fatal, sAuthFailMsg, vKey, "Root", null);
            return false;
        }
        return true;
    };
}