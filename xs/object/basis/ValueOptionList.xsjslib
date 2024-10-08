var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.definition = {
    type : ObjectType.Configuration,
    actions : {
        read : {
            // at the moment it is accessed internally only - no instance auth check needed
            authorizationCheck : false
        }
    },
    Root : {
        table : "sap.ino.db.basis::t_value_option_list",
        customProperties : {
            codeTextBundle : "sap.ino.config::t_value_option_list",
        },
        attributes : {
            DATATYPE_CODE : {
                foreignKeyTo : "sap.ino.xs.object.basis.Datatype.Root"
            }
        },
        nodes : {
            ValueOptions : {
                table : "sap.ino.db.basis::t_value_option",
                parentKey : "LIST_CODE",
                customProperties : {
                    codeTextBundle : "sap.ino.config::t_value_option",
                }
            }
        }
    }
};