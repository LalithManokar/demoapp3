var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.definition = {
    type : ObjectType.Configuration,
    actions : {
        read : {
            authorizationCheck : false
        }
    },
    Root : {
        table : "sap.ino.db.evaluation::t_model",
        customProperties : {
            codeTextBundle : "sap.ino.config::t_model"
        },
        nodes : {
            Criterion : {
                table : "sap.ino.db.evaluation::t_criterion",
                parentKey : "MODEL_CODE",
                customProperties : {
                    codeTextBundle : "sap.ino.config::t_criterion"
                },
                attributes : {
                    VALUE_OPTION_LIST_CODE : {
                        foreignKeyTo : "sap.ino.xs.object.basis.ValueOptionList.Root"
                    },
                    AGGREGATION_TYPE : {
                        foreignKeyTo : "sap.ino.xs.object.evaluation.AggregationType.Root"
                    },
                    DATATYPE_CODE : {
                        foreignKeyTo : "sap.ino.xs.object.basis.Datatype.Root"
                    },
                    UOM_CODE : {
                        foreignKeyTo : "sap.ino.xs.object.basis.Unit.Root"
                    }
                }
            }
        }
    }
};