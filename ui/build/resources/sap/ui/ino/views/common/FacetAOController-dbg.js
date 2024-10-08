/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.views.common.FacetAOController");

(function() {

    sap.ui.ino.views.common.FacetAOController = {

        onEnterEditMode : function() {
            // Users can override to subscribe
        },

        onExitEditMode : function() {
            // Users can override to subscribe
        },

        onModeSwitch : function(newMode) {
            // Users can override to subscribe
        },

        onAfterModeSwitch : function(newMode) {
            // Users can override to subscribe
        },

        onAfterModelAction : function(sActionName) {
            // Users can override to subscribe
            // function is called after a TI save/model action on the active Facet to do facet specific stuff
        },

        setMode : function(sMode) {
            this.getThingInspectorController().setMode(sMode);
        },

        getMode : function() {
            return this.getThingInspectorController().getMode();
        },

        isInMode : function(sMode) {
            return this.getThingInspectorController().isInMode(sMode);
        },

        isInEditMode : function() {
            return this.getThingInspectorController().isInEditMode();
        },

        getTextModelPrefix : function() {
            return this.getThingInspectorController().getTextModelPrefix();
        },

        getCodeModelPrefix : function() {
            return this.getThingInspectorController().getCodeModelPrefix();
        },

        getTextModel : function() {
            if (this.i18n == null) {
                this.i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
            }
            return this.i18n;
        },

        getModelPrefix : function() {
            return this.getThingInspectorController().getModelPrefix();
        },

        getModelName : function() {
            return this.getThingInspectorController().getModelName();
        },

        getModel : function() {
            return this.getThingInspectorController().getModel();
        },

        getModelKey : function() {
            return this.getThingInspectorController().getModelKey();
        },

        getBoundPath : function(sPath, absolute) {
            return this.getThingInspectorController().getBoundPath(sPath, absolute);
        },

        getBoundObject : function(oBinding, absolute, oType) {
            return this.getThingInspectorController().getBoundObject(oBinding, absolute, oType);
        },

        getFormatterPath : function(sPath, absolute) {
            return this.getThingInspectorController().getFormatterPath(sPath, absolute);
        },

        getTextPath : function(sPath) {
            return this.getThingInspectorController().getTextPath(sPath);
        },

        getThingInspectorView : function() {
            return this.getThingInspectorController().getView();
        },

        getThingInspectorController : function() {
            return this.oThingInspectorController;
        },

        setThingInspectorController : function(oController) {
            this.oThingInspectorController = oController;
        }
    };
}());