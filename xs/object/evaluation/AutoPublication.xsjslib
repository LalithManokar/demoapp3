var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.definition = {
    type : ObjectType.SystemConfiguration,
    Root : {
        table : "sap.ino.db.evaluation::t_auto_publication",
        customProperties : {
            codeTextBundle : "sap.ino.text::t_auto_publication"
        }
    }
};