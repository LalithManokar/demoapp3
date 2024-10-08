var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.definition = {
    type : ObjectType.Configuration,
    Root : {
        table : "sap.ino.db.basis::t_unit",
        customProperties : {
            codeTextBundle : "sap.ino.config::t_unit"
        }
    }
};