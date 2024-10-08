/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");

sap.ui.controller("sap.ui.ino.views.backoffice.config.NotificationActionStatusModelFacet", jQuery.extend({},
	sap.ui.ino.views.common.FacetAOController, {
	onAfterModeSwitch: function(sNewMode) {
	    this.getView()._createReceiverTokenizer(sNewMode === 'edit');
	} 
	    
}));