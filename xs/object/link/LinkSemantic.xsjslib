var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.definition = {
    type : ObjectType.SystemConfiguration,
    Root : {
        table : "sap.ino.db.link::t_link_semantic",
        customProperties : {
            codeTextBundle : "sap.ino.text::t_link_semantic"
        }
    }
};