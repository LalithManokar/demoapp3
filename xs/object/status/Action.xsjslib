var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.definition = {
    type : ObjectType.Configuration,
    Root : {
        table : "sap.ino.db.status::t_status_action",
        customProperties : {
            codeTextBundle : "sap.ino.config::t_status_action"
        }
    }
};