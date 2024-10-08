var determine = $.import("sap.ino.xs.aof.lib", "determination");
var IdeaMessage = $.import("sap.ino.xs.object.idea", "message");
var Message = $.import("sap.ino.xs.aof.lib", "message");

this.definition = {
    actions: {
        create: {
			authorizationCheck: false,
			executionCheck: checkMultiVolunteer,
			historyEvent: "IDEA_VOLUNTEERS_CREATE"
		},
		read: {
			authorizationCheck: false
		},
		del: {
			authorizationCheck: false,
			historyEvent: "IDEA_VOLUNTEERS_DEL"
		}
    },
    Root: {
        table: "sap.ino.db.idea::t_volunteers",
        sequence: "sap.ino.db.idea::s_volunteers",
        historyTable: "sap.ino.db.idea::t_volunteers_h",
        determinations : {
            onModify : [determine.systemAdminData, determinBusinessData]
        },
        attributes: {
            ID: {
				isPrimaryKey: true
			},
            CREATED_AT: {
				readOnly: true
			},
			CREATED_BY_ID: {
				readOnly: true
			}
        }
    }
};

function determinBusinessData(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext) {
    if (oContext.getAction().name === 'create') {
        oWorkObject.IDENTITY_ID = oContext.getUser().ID;
    }
}

function checkMultiVolunteer(vKey, oRequestObject, oWorkObject, oPersistedObject, addMessage, oContext) {

    var hq = oContext.getHQ();
    var sSql = 'select * from "sap.ino.db.idea::t_volunteers" where IDEA_ID = ? and IDENTITY_ID = ?';
    var result = hq.statement(sSql).execute(oRequestObject.IDEA_ID,  oContext.getUser().ID);
    if (result.length > 0) {
        addMessage(Message.MessageSeverity.Error, IdeaMessage.DOUBLE_VOLUNTEER_ON_IDEA, vKey);
    }
}