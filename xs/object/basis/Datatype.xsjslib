var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.DataType = {
    Boolean : "BOOLEAN",
    Code : "CODE",
    Numeric : "NUMERIC",
    Integer : "INTEGER",
    Text : "TEXT",
    Blob : "BLOB",
    RichText : "RICHTEXT",
    Date : "Date",
    Token: "TOKEN"
};

this.definition = {
    type : ObjectType.SystemConfiguration,
    Root : {
        table : "sap.ino.db.basis::t_datatype",
        customProperties : {
            codeTextBundle : "sap.ino.text::t_datatype"
        }
    }
};