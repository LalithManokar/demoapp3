/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
jQuery.sap.require("sap.ui.ino.models.core.PropertyModel");
jQuery.sap.require("sap.ui.ino.models.object.Tag");
jQuery.sap.require("sap.ui.ino.models.core.ApplicationObjectChange");
jQuery.sap.require("sap.ui.ino.application.Configuration");

var Configuration = sap.ui.ino.application.Configuration;

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.tag.TagSimilarityFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOController, {
    oSelectedTag : null,
    onReindex : function(oEvent) {
        var oTIController = this.getThingInspectorController();
        return oTIController.onModelAction(sap.ui.ino.models.object.Tag.reindex, "group", true, false);
    },
     
    initSimilarityModel : function() {
        // per default the usage views are in the analytical service
        var sOdataPath = Configuration.getApplicationPath("sap.ino.config.URL_PATH_OD_ANALYTICS");
        var oSimilarityModel = new sap.ui.model.odata.ODataModel(Configuration.getBackendRootURL() + '/' + sOdataPath, false);

        var oView = this.getView();
        oView.setModel(oSimilarityModel);
    },

    // Opens up the merge confirm dialog
    onMergeSelectedPressed : function(oEvent) {
        var iTagId = this.getModel().getProperty("/ID");
        var iMergeTagId = this.oSelectedTag.ID;

        var oPropertyModel = new sap.ui.ino.models.core.PropertyModel("sap.ino.xs.object.tag.Tag", iTagId, {
            actions : [{
                "merge" : [iMergeTagId]
            }]
        });

        var oMergeSelectedConfirmationDialog = new sap.ui.commons.Dialog({
            title : "{i18n>BO_TAG_MODIFY_TIT_MERGE_TAG}"

        });

        oMergeSelectedConfirmationDialog.setModel(oPropertyModel, "property");

        var oConfirmationDialog = sap.ui.view({
            viewName : "sap.ui.ino.views.backoffice.tag.MergeConfirmationDialog",
            type : sap.ui.core.mvc.ViewType.JS,
            viewData : {
                action : "merge",
                parentController : this, // controller
                fnMerge : this.onMergeSelected, // function to call the merge
                confirmationDialog : oMergeSelectedConfirmationDialog,
                objectName : this.getModel().getProperty("/NAME")
                // parent dialog for the confirmation view
            }
        });
    },

    // Opens up the merge confirm dialog
    onMergeAllPressed : function(oEvent) {
        var oController = this;
        var oMergeAllConfirmationDialog = new sap.ui.commons.Dialog({
            title : "{i18n>BO_TAG_MODIFY_TIT_MERGE_TAG}",

        });

        oMergeAllConfirmationDialog.setModel(this.getModel().getPropertyModel(), "property");

        var oConfirmationDialog = sap.ui.view({
            viewName : "sap.ui.ino.views.backoffice.tag.MergeConfirmationDialog",
            type : sap.ui.core.mvc.ViewType.JS,
            viewData : {
                action : "mergeAllSimilarTags",
                parentController : oController, // controller
                fnMerge : this.onMergeAll, // function to call the merge
                confirmationDialog : oMergeAllConfirmationDialog,
                objectName : this.getModel().getProperty("/NAME")
                // parent dialog for the confirmation view
            }
        });

    },

    rebindModel : function() {
        var oBindingInformation = this.getView().getTableBindingInformation();
        this.getView().oSimilarityTable.bindRows(oBindingInformation);
        this.getView().oMergeSelectedButton.setEnabled(false);
    },

    onSelectionChanged : function(oEvent) {
        var oView = this.getView();
        var iSelectedIndex = oEvent.getSource().getSelectedIndex();
        if (iSelectedIndex < 0) {
            oView.oMergeSelectedButton.setEnabled(false);
        } else {
            var oSelectionContext = oView.oSimilarityTable.getContextByIndex(iSelectedIndex);
            this.oSelectedTag = oSelectionContext.getObject();
             oView.oMergeSelectedButton.setEnabled(true);
        }
    },

    // is static method.
    onMergeAll : function(that) {
        var promise = that.getThingInspectorController().onModelAction(that.getModel().mergeAllSimilarTags, "merge", true, false, true);
        promise.done(function(oResponse) {
            that.rebindModel(); 
            jQuery.each(that.getModel().getPropertyModel().getProperty("/actions/mergeAllSimilarTags/customProperties/AFFECTED_OBJECTS"), function(iIndex, oTag){
                sap.ui.ino.models.core.ApplicationObjectChange.fireChange(sap.ui.ino.models.object.Tag, oTag.ID, sap.ui.ino.models.core.ApplicationObjectChange.Action.Del);
            });
        });

    },

    onMergeSelected : function(that) {
        var iTagID = that.oSelectedTag.ID;
        var promise = that.getThingInspectorController().onModelAction(that.getModel().merge, "merge", true, false, true, {
            ID : iTagID
        });
        promise.done(function(oResponse) {
            that.rebindModel();
            sap.ui.ino.models.core.ApplicationObjectChange.fireChange(sap.ui.ino.models.object.Tag, iTagID, sap.ui.ino.models.core.ApplicationObjectChange.Action.Del);
        });
    },
}));
