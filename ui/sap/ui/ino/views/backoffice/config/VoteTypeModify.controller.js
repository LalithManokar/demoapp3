/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOController");

jQuery.sap.require("sap.ui.ino.models.object.VoteTypeStage");

sap.ui.controller("sap.ui.ino.views.backoffice.config.VoteTypeModify", jQuery.extend({},
        sap.ui.ino.views.common.ThingInspectorAOController, {

    mMessageParameters : {
        group : "configuration_vote",
        save : {
            success : "MSG_VOTE_TYPE_SAVED"
        },
        del : {
            success : "MSG_VOTE_TYPE_DELETED", // text key for delete success message
            title : "BO_VOTE_TYPE_TIT_DEL", // text key for dialog title
            dialog : "BO_VOTE_TYPE_INS_DEL" // text key for dialog message
        }
    },
	
    createModel : function(iId) {
        if (this.oModel == null) {
            this.oModel = new sap.ui.ino.models.object.VoteTypeStage(iId > 0 ? iId : undefined, {
                actions : ["modify", "del"],
                nodes : ["Root"],
                continuousUse : true,
                concurrencyEnabled : true
            });
        }
        
        // this binding to the unnamed global model is used for read-only facets like comments, evaluations
        // where data is not contained in the Application Object model
        if(iId && iId > 0){
            this.getView().bindElement("/StagingVoteType(" + iId + ")");
        }
        
        return this.oModel;
    },
    
    onInit : function() {
        sap.ui.ino.views.common.ThingInspectorAOController.onInit.apply(this, arguments);
        this.triggerRefreshOnClose = false;
    }
}));