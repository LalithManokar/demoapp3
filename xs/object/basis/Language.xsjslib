var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.definition = {
    type : ObjectType.Configuration,
    Root : {
        table : "sap.ino.db.basis::t_language",
        customProperties : {
            // codeTextBundle : "sap.ino.config::t_language"
        },
        nodes : {
            Locale : {
                table : "sap.ino.db.basis::t_locale",
                customProperties : {
                    codeTextBundle : "sap.ino.config::t_locale"
                },
                parentKey : "LANGUAGE_CODE"
            }
        }
    }
};