var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.definition = {
    type: ObjectType.Configuration,
    actions: {
        read: {
            internal: true,
            authorizationCheck : false,
        }
    },
    Root: {
        table: "sap.ino.db.basis::t_system_setting",
        customProperties : {
            codeTextBundle : "sap.ino.config::t_system_setting"
        },
        attributes: {
            CODE: {
                readOnly: true
            },
            DATATYPE_CODE: {
                readOnly: true,
                required: false,
                foreignKeyTo: "sap.ino.xs.object.basis.Datatype.Root"
            }
        }
    }

};