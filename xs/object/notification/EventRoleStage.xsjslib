var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.definition = {
    type : ObjectType.Stage,
    Root : {
        table : "sap.ino.db.notification::t_notification_event_role_stage",
        sequence : "sap.ino.db.notification::s_notification_event_role",
        customProperties : {
            fileName : "t_notification_event_role",
            contentOnlyInRepository : true
        },
        attributes : {
            ID : {
                isPrimaryKey : true
            }
        }
    }
};