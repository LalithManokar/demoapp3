/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOController");
jQuery.sap.require("sap.ui.ino.models.object.TextModuleStage");

sap.ui.controller("sap.ui.ino.views.backoffice.config.TextModuleModify", jQuery.extend({},
        sap.ui.ino.views.common.ThingInspectorAOController, {

    mMessageParameters : {
        group : "configuration_text_module",
        save : {
            success : "MSG_TEXT_MODULE_SAVE_SUCCESS"
        },
        del : {
            success : "MSG_TEXT_MODULE_DELETED", // text key for delete success message
            title : "BO_TEXT_MODULE_TIT_DEL", // text key for dialog title
            dialog : "BO_TEXT_MODULE_INS_DEL" // text key for dialog message
        }
    },
	
    createModel : function(iId) {
        if (this.oModel === undefined || this.oModel === null) {
            this.oModel = new sap.ui.ino.models.object.TextModuleStage(iId > 0 ? iId : undefined, {
                actions : ["modify", "del"],
                nodes : ["Root"],
                continuousUse : true,
                concurrencyEnabled : true
            });
        }

        if(iId && iId > 0){
            this.getView().bindElement("/StagingTextModule(" + iId + ")");
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
                TEXT_MODULE : undefined
        };
        
        if (sPagePath && this.oModel) {
            oData.TEXT_MODULE = this.oModel.getProperty(sPagePath + "/TEXT_MODULE");
        }
            
        oLanguageTemplateModel.setData(oData);         
    }
}));