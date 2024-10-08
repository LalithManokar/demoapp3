var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;
var DB = $.import("sap.ino.xs.aof.core", "db");

this.definition = {
    type : ObjectType.Configuration,
    Root : {
        table : "sap.ino.db.campaign::t_phase",
        customProperties : {
            codeTextBundle : "sap.ino.config::t_phase",
        }
    }
};