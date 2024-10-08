/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOController");
jQuery.sap.require("sap.ui.ino.models.object.UrlWhitelistStage");

sap.ui.controller("sap.ui.ino.views.backoffice.config.UrlWhitelistModify", jQuery.extend({},
        sap.ui.ino.views.common.ThingInspectorAOController, {

    mMessageParameters : {
        group : "configuration_evaluation",
        save : {
            success : "MSG_URL_WHITELIST_SAVE_SUCCESS"
        },
        del : {
            success : "MSG_URL_WHITELIST_DELETED", // text key for delete success message
            title : "BO_URL_WHITELIST_TIT_DEL", // text key for dialog title
            dialog : "BO_URL_WHITELIST_INS_DEL" // text key for dialog message
        }
    },
	
    createModel : function(iId) {
        if (!this.oModel) {
            this.oModel = new sap.ui.ino.models.object.UrlWhitelistStage(iId > 0 ? iId : undefined, {
                actions : ["modify", "del"],
                nodes : ["Root"],
                continuousUse : true,
                concurrencyEnabled : true
            });
        }
        
        // this binding to the unnamed global model is used for read-only facets like comments, evaluations
        // where data is not contained in the Application Object model
        if(iId && iId > 0){
            this.getView().bindElement("/StagingUrlWhitelist(" + iId + ")");
        }
        
        return this.oModel;
    },
    
    onInit : function() {
        sap.ui.ino.views.common.ThingInspectorAOController.onInit.apply(this, arguments);
        this.triggerRefreshOnClose = false;
    }
    
}));