this.definition = {
    actions: {
        update: {
            authorizationCheck: false
        },
        read: {
            authorizationCheck: false
        }
    },
    Root: {
        table: "sap.ino.db.iam::t_identity_attribute",
        sequence: "sap.ino.db.iam::s_identity_attribute",
        customProperties : {
            codeTextBundle : "sap.ino.config::t_identity_attribute"
        },
        attributes: {
            ID : {
                isPrimaryKey : true
            },
            CODE: {
                required: true,
                readOnly: true
            }
        }
    }
};