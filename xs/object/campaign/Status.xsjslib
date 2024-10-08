var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

// This is a "dummy" object for filtered status values in UI code model
this.definition = {
    type : ObjectType.Configuration,
    Root : {
        table : "sap.ino.db.status::t_status",
        customProperties : {
            codeTextBundle : "sap.ino.config::t_status"
        }
    }
};