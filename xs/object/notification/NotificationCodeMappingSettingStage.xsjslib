var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.definition = {
    type : ObjectType.Stage,
    Root : {
        table: "sap.ino.db.notification::t_notification_code_mapping_setting_stage",
        sequence : "sap.ino.db.notification::s_notification_code_mapping_setting_stage",
        customProperties : {
            fileName : "t_notification_code_mapping_setting",
            contentOnlyInRepository : true
        },
        attributes : {
            ID : {
                isPrimaryKey : true
            }
        }
    }
};