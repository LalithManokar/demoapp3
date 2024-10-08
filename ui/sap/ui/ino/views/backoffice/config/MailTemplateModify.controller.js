/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOController");
jQuery.sap.require("sap.ui.ino.models.object.MailTemplateStage");

sap.ui.controller("sap.ui.ino.views.backoffice.config.MailTemplateModify", jQuery.extend({},
        sap.ui.ino.views.common.ThingInspectorAOController, {

    mMessageParameters : {
        group : "configuration_evaluation",
        save : {
            success : "MSG_MAIL_TEMPLATE_SAVE_SUCCESS"
        },
        del : {
            success : "MSG_MAIL_TEMPLATE_DELETED", // text key for delete success message
            title : "BO_MAIL_TEMPLATE_TIT_DEL", // text key for dialog title
            dialog : "BO_MAIL_TEMPLATE_INS_DEL" // text key for dialog message
        }
    },
	
    createModel : function(iId) {
        if (this.oModel === undefined || this.oModel === null) {
            this.oModel = new sap.ui.ino.models.object.MailTemplateStage(iId > 0 ? iId : undefined, {
                actions : ["modify", "del"],
                nodes : ["Root"],
                continuousUse : true,
                concurrencyEnabled : true
            });
        }

        // this binding to the unnamed global model is used for read-only facets like comments, evaluations
        // where data is not contained in the Application Object model
        if(iId && iId > 0){
            this.getView().bindElement("/StagingMailTemplate(" + iId + ")");
        }
        
        return this.oModel;
    },
    
    initLanguageTemplateModel : function(sPagePath) {
        var oLanguageTemplateModel = sap.ui.getCore().getModel("specialLanguageModel");
        if (!oLanguageTemplateModel) {
            oLanguageTemplateModel = new sap.ui.model.json.JSONModel();
            sap.ui.getCore().setModel(oLanguageTemplateModel, "specialLanguageModel");
        }
        
        var oData = { 
            TEMPLATE : undefined
        };
        
        if (sPagePath && this.oModel) {
            oData.TEMPLATE = this.oModel.getProperty(sPagePath + "/TEMPLATE");
        }
            
        oLanguageTemplateModel.setData(oData);         
    }
}));