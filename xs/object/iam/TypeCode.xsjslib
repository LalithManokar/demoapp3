var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.TypeCode = {
    User : "USER",
    Group : "GROUP",
};

this.definition = {
    type : ObjectType.SystemConfiguration,
    Root : {
        table : "sap.ino.db.iam::t_type_code",
        customProperties : {
            codeTextBundle : "sap.ino.text::t_type_code"
        }
    }
};