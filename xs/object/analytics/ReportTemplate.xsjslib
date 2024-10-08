var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.definition = {
    type : ObjectType.Configuration,
    Root : {
        table : "sap.ino.db.analytics::t_report_template",
        customProperties : {
            codeTextBundle : "sap.ino.config::t_report_template"
        }
    }
};