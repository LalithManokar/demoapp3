var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;
var DB = $.import("sap.ino.xs.aof.core", "db");

this.definition = {
    type : ObjectType.Configuration,
    Root : {
        table : "sap.ino.db.status::t_status_model",
        customProperties : {
            codeTextBundle : "sap.ino.config::t_status_model"
        },
        nodes : {
            Transitions : {
                table : "sap.ino.db.status::t_status_model_transition",
                parentKey : "STATUS_MODEL_CODE",
                attributes : {
                    STATUS_ACTION_CODE : {
                        foreignKeyTo : "sap.ino.xs.object.status.Action.Root"
                    },
                    CURRENT_STATUS_CODE : {
                        foreignKeyTo : "sap.ino.xs.object.status.Status.Root"
                    },
                    NEXT_STATUS_CODE : {
                        foreignKeyTo : "sap.ino.xs.object.status.Status.Root"
                    }
                }
            }
        }
    }
};