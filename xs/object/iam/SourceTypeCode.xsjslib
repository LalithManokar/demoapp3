var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.SourceTypeCode = {
    User : "USER",
    Upload : "UPLOAD",
    IdentityProvider : "IDP",
    Automatic : "AUTOMATIC"
};

this.definition = {
    type : ObjectType.SystemConfiguration,
    Root : {
        table : "sap.ino.db.iam::t_source_type_code",
        customProperties : {
            codeTextBundle : "sap.ino.text::t_source_type_code"
        }
    }
};