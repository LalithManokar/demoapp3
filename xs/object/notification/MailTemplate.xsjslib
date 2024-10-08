var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;

this.definition = {
    type : ObjectType.Configuration,
    actions : {
        read : {
            authorizationCheck : false
        }
    },
    Root : {
        table : "sap.ino.db.notification::t_mail_template",
        customProperties : {
            codeTextBundle : "sap.ino.config::t_mail_template"
        },
        nodes : {
            MailTemplateText : {
                table : "sap.ino.db.notification::t_mail_template_t",
                parentKey : "MAIL_TEMPLATE_CODE"
            }
        }
    }
};