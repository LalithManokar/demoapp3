var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.definition = {
    type : ObjectType.Configuration,
    actions : {
        read : {
            authorizationCheck : false
        }
    },
    Root : {
        table : "sap.ino.db.ideaform::t_form",
        customProperties: {},
        nodes : {
            Fields : {
                table : "sap.ino.db.ideaform::t_field",
                customProperties:{},
                parentKey : "FORM_CODE",
                attributes : {
                    VALUE_OPTION_LIST_CODE : {
                        foreignKeyTo : "sap.ino.xs.object.basis.ValueOptionList.Root"
                    },
                    DATATYPE_CODE : {
                        foreignKeyTo : "sap.ino.xs.object.basis.Datatype.Root"
                    }
                }
            }
        }
    }
};