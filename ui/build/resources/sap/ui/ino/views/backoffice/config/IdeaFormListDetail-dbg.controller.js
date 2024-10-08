/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
 
jQuery.sap.require("sap.ui.model.json.JSONModel");
 
sap.ui.controller("sap.ui.ino.views.backoffice.config.IdeaFormListDetail", {
    setParentController : function(oController) {
        this.oParentController = oController;
    },
    
    onSelectionChanged :function(oSelectedRowContext, iSelectedIndex, oTable){
        if(iSelectedIndex >= 0){
            this.getView().setFieldContext(oSelectedRowContext);
            this.updatePropertyModel(iSelectedIndex);
        }else{
            this.getView().setFieldContext(null);
        }
    },
    
    createNewField : function(){
        var oModel = this.getModel();
        var iHandle = oModel.addField();
        
        if(iHandle !== 0){
            this.getView().setFieldContextByID(iHandle);
        }
    },
    
    moveFieldUp : function(oEvent, oSelectedRowContext){
        if (!oSelectedRowContext) {
            var oTextModel = this.getTextModel();
            jQuery.sap.log.error(oTextModel.getText("BO_IDEA_FORM_ADMINISTRATION_INS_SELECT_CRITERION"));
            return;
        }
        var oField = oSelectedRowContext.getObject();
        var oModel = this.getModel();
        oModel.moveFieldUp(oField);
        this.getView().setFieldContextByID(oField.ID);        
    },
    
    moveFieldDown : function(oEvent, oSelectedRowContext){
        if (!oSelectedRowContext) {
            var oTextModel = this.getTextModel();
            jQuery.sap.log.error(oTextModel.getText("BO_IDEA_FORM_ADMINISTRATION_INS_SELECT_CRITERION"));
            return;
        }
        var oField = oSelectedRowContext.getObject();
        var oModel = this.getModel();
        oModel.moveFieldDown(oField);
        this.getView().setFieldContextByID(oField.ID);
    },
    
    deleteField : function(oEvent, oSelectedRowContext){
        if (!oSelectedRowContext) {
            var oTextModel = this.getTextModel();
            jQuery.sap.log.error(oTextModel.getText("BO_IDEA_FORM_ADMINISTRATION_INS_SELECT_CRITERION"));
            return;
        }
        var oField = oSelectedRowContext.getObject();
        var oModel = this.getModel();
        var oToolBarPropertyModel = this.getView().getModel(this.getToolBarProperyModelName());
        
        this.getView().oFieldTable.setSelectedIndex(-1);
        oToolBarPropertyModel.setProperty("/del", false);
        oModel.removeField(oField);
        this.getView().oFieldDetailLayout.destroyRows(); 
    },
    
    isInEditMode : function() {
        return this.oParentController.isInEditMode();
    },
    
    setToolBarProperyModel : function(){
        var oToolbarPropery = {
            up      :   false,
            down    :   false,
            del     :   false
        };
        
        var oPropertyModel = this.getView().getModel(this.getToolBarProperyModelName());
        
        if(oPropertyModel === undefined || oPropertyModel === null){
            oPropertyModel  = new sap.ui.model.json.JSONModel(oToolbarPropery);
            this.getView().setModel(oPropertyModel, this.getToolBarProperyModelName());
        }
        
        
    },
    
    updatePropertyModel : function(iIdx){
        if(!this.getView().getModel("applicationObject")){
            return;
        }
        var aRows = this.getView().getModel("applicationObject").getProperty("/Fields");
        var oProperModel  = this.getView().getModel(this.getToolBarProperyModelName());
        if(iIdx === 0){
            if(aRows.length === 1){
                oProperModel.setProperty("/up"  , false);
                oProperModel.setProperty("/down", false);
                oProperModel.setProperty("/del" , true);
            }else{
                oProperModel.setProperty("/up"  , false);
                oProperModel.setProperty("/down", true);
                oProperModel.setProperty("/del" , true);
            }

        }else if(iIdx === aRows.length - 1  && aRows.length !== 1){
            oProperModel.setProperty("/up"   , true);
            oProperModel.setProperty("/down" , false);
            oProperModel.setProperty("/del"  , true);
        }else{
            oProperModel.setProperty("/up"   , true);
            oProperModel.setProperty("/down" , true);
            oProperModel.setProperty("/del"  , true);
        }
    },
    changeMandatoryFieldValue:function(oEvent,oBindingContext){
        var oModel = this.getModel();
        var sPath = oBindingContext.sPath;
        var oSource = oEvent.getSource();
        var bCheck = oSource.getChecked();
        if(bCheck){
            //Clear other fileds
            oModel.setProperty(sPath + "/DEFAULT_LONG_TEXT", "");
            oModel.setProperty(sPath + "/IS_HIDDEN", null);
            oModel.setProperty(sPath + "/IS_PUBLISH", null);
            oModel.setProperty(sPath + "/MANDATORY", 0);
            oModel.setProperty(sPath + "/NUM_VALUE_MAX", null); 
            oModel.setProperty(sPath + "/NUM_VALUE_MIN", null);  
            oModel.setProperty(sPath + "/NUM_VALUE_STEP_SIZE", null);
            oModel.setProperty(sPath + "/UOM_CODE", "");
            oModel.setProperty(sPath + "/VALUE_OPTION_LIST_CODE", "");               
             oModel.setProperty(sPath + "/DATATYPE_CODE", "RICHTEXT");
        } else {
            //Clear current display text
            oModel.setProperty(sPath + "/DISPLAY_TEXT", "");
             oModel.setProperty(sPath + "/DATA_TYPE_CODE", null);            
        }
        		
        
    },
    
    getToolBarFormatterpath    : function(sPath){
        return this.getToolBarProperyModelName() + ">/" + sPath;
    },
    
    getToolBarProperyModelName : function(){
        return "property";  
    },
    
    getTextModelPrefix : function() {
        return this.oParentController.getTextModelPrefix();
    },

    getCodeModelPrefix : function() {
        return this.oParentController.getCodeModelPrefix();
    },

    getTextModel : function() {
        if (this.i18n === null  || typeof(this.i18n) === undefined) {
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
    }
});
