var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.DateType = {
    Day : "DAY",
    Month : "MONTH",
    Quarter : "QUARTER"
};

this.definition = {
    type : ObjectType.SystemConfiguration,
    Root : {
        table : "sap.ino.db.basis::t_datetype",
        customProperties : {
            codeTextBundle : "sap.ino.text::t_datetype"
        }
    }
};