/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOController");

jQuery.sap.require("sap.ui.ino.models.object.ValueOptionListStage");

sap.ui.controller("sap.ui.ino.views.backoffice.config.ValueOptionListModify", jQuery.extend({},
        sap.ui.ino.views.common.ThingInspectorAOController, {

    mMessageParameters : {
        group : "configuration_evaluation",
        save : {
            success : "MSG_VALUE_OPTION_LIST_SAVE_SUCCESS",
        },
        del : {
            success : "MSG_VALUE_OPTION_LIST_DELETED", // text key for delete success message
            title : "BO_VALUE_OPTION_LIST_TIT_DEL_VOL", // text key for dialog title
            dialog : "BO_VALUE_OPTION_LIST_INS_DEL_VOL" // text key for dialog message
        }
    },

    createModel : function(iId) {
        var oView = this.getView();
        if (this.oModel == null) {
            this.oModel = new sap.ui.ino.models.object.ValueOptionListStage(iId > 0 ? iId : undefined, {
                actions : ["modify", "del"],
                nodes : ["Root", "ValueOptions"],
                continuousUse : true,
                concurrencyEnabled : true
            });
        }
        
        // this binding to the unnamed global model is used for read-only facets like comments, evaluations
        // where data is not contained in the Application Object model
        if(iId && iId > 0){
            this.getView().bindElement("/StagingValueOptionList(" + iId + ")");
        }
        
        return this.oModel;
    },
    
    onInit : function() {
        sap.ui.ino.views.common.ThingInspectorAOController.onInit.apply(this, arguments);
        this.triggerRefreshOnClose = false;
    },

    
    onSave : function() {
        this.getView().resetBindingLookup();
        var oModel = this.getModel();
        var oData = this.getModel().getData();
        if(oData.ValueOptions){
           oModel.normalizeSequenceNo(oData.ValueOptions);
        }
        oModel.setData(oData);
        return sap.ui.ino.views.common.ThingInspectorAOController.onSave.apply(this, arguments);
    },

    shouldTriggerRefreshOnClose : function() {
        return this.triggerRefreshOnClose;
    },            scrollToTop : function() {
        var oView = this.getView();
        jQuery(oView.oDialog.getDomRef()).find(".sapUiDlgCont").animate({
            scrollTop : 0
        });
    },

    scrollToTop : function() {
        var oView = this.getView();
        jQuery(oView.oDialog.getDomRef()).find(".sapUiDlgCont").animate({
            scrollTop : 0
        });
    },
}));