var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.definition = {
    type: ObjectType.Configuration,
    actions: {
        read: {
            internal: true,
            authorizationCheck : false
        }
    },
    Root: {
        table: "sap.ino.db.basis::t_milestone_task",
        customProperties : {
            codeTextBundle : "sap.ino.config::t_milestone_task"
        },
        attributes: {
            CODE: {
                readOnly: true
            }
        }
    }

};