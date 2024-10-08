/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.controller("sap.ui.ino.views.backoffice.config.EvaluationModelCriterionDetail", {

    oParentController : null,

    onSelectionChanged : function(oSelectedRowContext, iSelectedIndex, oTable) {
        if(iSelectedIndex >= 0){
            this.getView().setCriterionContext(oSelectedRowContext);
        } else {
            this.getView().setCriterionContext(null);
        }
    },

    createNewCriterion : function(oEvent) {
        var oModel = this.getModel();
        var iHandle = oModel.addCriterion();
        if (iHandle != 0) {
            this.getView().setCriterionContextByCriterionID(iHandle);
        }
    },

    createNewSubCriterion : function(oEvent, oSelectedRowContext) {
    	var oTextModel = this.getTextModel();
        if (!oSelectedRowContext) {
            jQuery.sap.log.error(oTextModel.getText("BO_MODEL_INS_SELECT_CRITERION"));
            return;
        }
        var oModel = this.getModel();
        var sParentID = oModel.getProperty("ID", oSelectedRowContext);
        var iHandle = 0;
        if (!sParentID || sParentID == 0 || sParentID == "") {
        	jQuery.sap.log.error(oTextModel.getText("BO_MODEL_INS_SELECT_CRITERION"));
        } else {
            iHandle = oModel.addCriterion(sParentID);
        };
        if (iHandle != 0) {
            this.getView().setCriterionContextBySubCriterionID(sParentID, iHandle);
        }
    },

    moveCriterionUp : function(oEvent, oSelectedRowContext) {
        if (!oSelectedRowContext) {
            var oTextModel = this.getTextModel();
            jQuery.sap.log.error(oTextModel.getText("BO_MODEL_INS_SELECT_CRITERION"));
            return;
        }
        var oCriterion = oSelectedRowContext.getObject();
        var oModel = this.getModel();
        oModel.moveCriterionUp(oCriterion);
        this.getView().setCriterionContextByID(oCriterion.ID);
    },

    moveCriterionDown : function(oEvent, oSelectedRowContext) {
        if (!oSelectedRowContext) {
            var oTextModel = this.getTextModel();
            jQuery.sap.log.error(oTextModel.getText("BO_MODEL_INS_SELECT_CRITERION"));
            return;
        }
        var oCriterion = oSelectedRowContext.getObject();
        var oModel = this.getModel();
        oModel.moveCriterionDown(oCriterion);
        this.getView().setCriterionContextByID(oCriterion.ID);
    },

    deleteCriterion : function(oEvent, oSelectedRowContext) {
        if (!oSelectedRowContext) {
            var oTextModel = this.getTextModel();
            jQuery.sap.log.error(oTextModel.getText("BO_MODEL_INS_SELECT_CRITERION"));
            return;
        }
        var oModel = this.getModel();
        var oCriterion = oSelectedRowContext.getObject();
        oModel.removeCriterion(oCriterion);
        this.getView().refreshCriterionDetailContent(oEvent);
    },
    
    refresh : function(){
        this.getView().refreshCriterionDetailContent();
    },

    setParentController : function(oController) {
        this.oParentController = oController;
    },

    isInEditMode : function() {
        return this.oParentController.isInEditMode();
    },

    getTextModelPrefix : function() {
        return this.oParentController.getTextModelPrefix();
    },

    getCodeModelPrefix : function() {
        return this.oParentController.getCodeModelPrefix();
    },

    getTextModel : function() {
        if (this.i18n == null) {
            this.i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
        }
        return this.i18n;
    },

    getModelPrefix : function() {
        return this.oParentController.getModelPrefix();
    },

    getModelName : function() {
        return this.oParentController.getModelName();
    },

    getModel : function() {
        return this.oParentController.getModel();
    },

    getModelKey : function() {
        return this.oParentController.getModelKey();
    },

    getBoundPath : function(sPath, absolute) {
        return this.oParentController.getBoundPath(sPath, absolute);
    },

    getBoundObject : function(oBinding, absolute, oType) {
        return this.oParentController.getBoundObject(oBinding, absolute, oType);
    },

    getFormatterPath : function(sPath, absolute) {
        return this.oParentController.getFormatterPath(sPath, absolute);
    },

    getTextPath : function(sPath) {
        return this.oParentController.getTextPath(sPath);
    },
});