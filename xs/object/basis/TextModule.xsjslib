var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.definition = {
    type : ObjectType.Configuration,
    actions : {
        read : {
            authorizationCheck : false
        }
    },
    Root : {
        table : "sap.ino.db.basis::t_text_module",
        customProperties : {
            codeTextBundle : "sap.ino.config::t_text_module"
        },
        nodes : {
            TextModuleText : {
                table : "sap.ino.db.basis::t_text_module_t",
                customProperties : {
                    codeTextBundle : "sap.ino.config::t_text_module_t"
                },
                parentKey : "TEXT_MODULE_CODE"
            }
        }
    }
};