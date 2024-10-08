sap.ui.define([],function(){
    "use strict";
    
    /**
     * @class
     * Mixin for a short Identity Profile
     */
    var ExpertFinderMixin = function() {
        throw "Mixin may not be instantiated directly";
    };
    
    ExpertFinderMixin.getExpertFinderDialog = function() {
		if (!this._oExpertFinderDialog) {
 			this._oExpertFinderDialog = this.createFragment("sap.ino.vc.evaluation.fragments.ExpertFinder", this.getView().createId());
			this.getView().addDependent(this._oExpertFinderDialog);
// 			this._oExpertFinderDialog.onAfterRendering = function(){
// 			    jQuery.sap.delayedCall(1000, this, function(){
// 			        jQuery("button.sapInoIdentityAddRemoveBtn").each(function(iIndex, oItem){
//     			        if(!jQuery(oItem).attr("title")){
//     			            jQuery(oItem).remove();
//     			        }
// 			        });
// 			    });
// 			};
		}
		return this._oExpertFinderDialog;
	};
	
	ExpertFinderMixin.onFindExpert = function(oEvent) {
	    var oModel = this.getObjectModel();
		var oDialog = this.getExpertFinderDialog();
		this.setViewProperty("/IS_DIALOG", true);
		this._aExperts = [].concat(oModel.getProperty("/Experts") || []);
		oDialog.open();
	};
	
	ExpertFinderMixin.onExpertFinderDialogOK = function(oEvent){
	    var oDialog = this.getExpertFinderDialog();
	    oDialog.close();
	};
	
	ExpertFinderMixin.onExpertFinderDialogCancel = function(oEvent){
	    var oModel = this.getObjectModel();
	    var oDialog = this.getExpertFinderDialog();
	    oModel.setProperty("/Experts", this._aExperts);
		oDialog.close();
	};
	
    return ExpertFinderMixin;
});