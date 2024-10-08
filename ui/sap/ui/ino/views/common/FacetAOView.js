/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.views.common.GenericControl");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");

(function() {

    sap.ui.ino.views.common.FacetAOView = {
        _onShow : function() {
            this.onShow();
        },

        _onHide : function() {
            var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
            oApp.removeNotificationMessages(undefined, sap.ui.core.MessageType.Success);
            this.onHide();
        },

        onShow : function() {
            // Redefine when needed
        },

        onHide : function() {
            // Redefine when needed
        },

        setModel : function(oModel, sModelName) {
            sap.ui.core.mvc.View.prototype.setModel.apply(this, arguments);
            jQuery.each(this._aFacetContent || [], function(iIndex, oFacetContent) {
                oFacetContent.setModel(oModel, sModelName);
            });
        },

        initWithMode : function(sMode) {
            // Used if specific initializations are needed for some modes. Called when the view is created
            // But before createContent is called by the ThingInspector
            return;
        },

        initializeWithMode : function(sMode) {
            // Users should override this if they need to do custom initialization for the facet depending on the mode,
            // before create Facet Content is called
            return;
        },

        setBusy : function(bBusy) {
            this.getController().getThingInspectorController().getView().setBusy(bBusy);
        },

        getActions : function() {
            return [];
        },

        _createFacetContent : function(oController) {
            this._aFacetContent = this.createFacetContent(oController);
            return this._aFacetContent;
        },

        createFacetContent : function() {
            return [];
        },

        createContent : function(oController) {
            return null;
        },

        getModelPrefix : function() {
            return this.getController().getThingInspectorController().getModelPrefix();
        },

        getBoundPath : function(sPath, bAbsolute) {
            return this.getController().getBoundPath(sPath, bAbsolute);
        },

        getBoundObject : function(oBinding, absolute, oType) {
            return this.getController().getBoundObject(oBinding, absolute, oType);
        },

        getFormatterPath : function(sPath, absolute) {
            return this.getController().getFormatterPath(sPath, absolute);
        },

        getWritePath : function(sPath, bBrackets) {
            return this.getController().getThingInspectorController().getWritePath(sPath, bBrackets);
        },

        getApplication : function() {
            return sap.ui.ino.application.backoffice.Application.getInstance();
        },

        getResourceBundle : function() {
            return this.getController.getTextModel();
        },

        getText : function(sTextKey, aArguments) {
            return this.getController().getTextModel().getText(sTextKey, aArguments);
        },

        getActions : function() {
            return [];
        },

        getActionCallback : function(id) {
            return (function() {
                jQuery.sap.log.warning("No Valid callback for action: " + id, undefined, "sap.ui.ino.views.common.FacetAOView");
            });
        },

        getThingInspectorView : function() {
            return this.getController().getThingInspectorView();
        },

        getThingInspectorController : function() {
            return this.getController().getThingInspectorController();
        },

        hasPendingChanges : function() {
            return false; // False by default since most facets do not have an independent edit mode
        },

        cancelChanges : function() {
            // Does nothing. Only implement for facet who manage their own edit mode
        },

        needsSavedData : function() {
            // can be overwritten: Returns true when the Facet needs a saved data state to run.
            // TI will bring a save popup to save. If data is not saved facet will not be displayed
            return false;
        },

        createControl : function(oSettings) {
            if (!oSettings.View) {
                oSettings.View = this;
            }
            return sap.ui.ino.views.common.GenericControl.create(oSettings);
        },

        revalidateMessages : function() {
            var oThingInspectorView = this.getThingInspectorView();
            oThingInspectorView.revalidateMessages();
        }
    };
}());