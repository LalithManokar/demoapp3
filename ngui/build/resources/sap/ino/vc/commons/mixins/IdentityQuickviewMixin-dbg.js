sap.ui.define(["sap/ino/commons/application/Configuration"], 
    function(Configuration) {
    "use strict";

    /**
     * @class
     * Mixin that provides a single feature for displaying a Identity QuickView 
     */
    var IdentityQuickviewMixin = function() {
        throw "Mixin may not be instantiated directly";
    };
    
    /**
     * programmatic form for opening an identity QuickView
     */ 
    IdentityQuickviewMixin.openIdentityQuickView = function(oSource, iIdentityId) {
        if (oSource && iIdentityId) {
            if (!this._oIdentityCardView || !this._oIdentityCardView.getController()) {
                this._oIdentityCardView = sap.ui.xmlview({
                    viewName: "sap.ino.vc.iam.IdentityCard"
                });
                oSource.addDependent(this._oIdentityCardView);
            }
            this._oIdentityCardView.getController().open(oSource, iIdentityId);
        }
    };
    
    /**
     * event form for opening an identity QuickView
     */ 
    IdentityQuickviewMixin.onOpenIdentityQuickView = function(oEvent) {
        var oSource =  oEvent.getSource();
        var iIdentityId = 
            // identity card
            oEvent.getParameter("identityId") || 
            // idea card
            oEvent.getParameter("ideaSubmitterId");
        if (oSource && iIdentityId) {
            if (!this._oIdentityCardView || !this._oIdentityCardView.getController()) {
                this._oIdentityCardView = sap.ui.xmlview({
                    viewName: "sap.ino.vc.iam.IdentityCard"
                });
                oSource.addDependent(this._oIdentityCardView);
            }
            this._oIdentityCardView.getController().open(oSource, iIdentityId);
        }
    };

    return IdentityQuickviewMixin;
});