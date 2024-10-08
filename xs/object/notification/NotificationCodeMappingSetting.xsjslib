var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.definition = {
    type: ObjectType.Configuration,
    actions: {
        read: {
            internal: true,
            authorizationCheck : false
        }
    },
    Root: {
        table: "sap.ino.db.notification::t_notification_code_mapping_setting",
        attributes: {
            CODE: {
                readOnly: true,
                isPrimaryKey : true
            }
        }
    }

};