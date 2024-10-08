/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */ 
jQuery.sap.declare("sap.ui.ino.controls.Dialog");
(function() {
    "use strict";
    jQuery.sap.require("sap.ui.commons.Dialog");
    jQuery.sap.require("sap.ui.commons.DialogRenderer");
    
    sap.ui.commons.Dialog.extend("sap.ui.ino.controls.Dialog", {
    	open : function() {
    	    sap.ui.commons.Dialog.prototype.open.apply(this, arguments);
	        this._setZIndex(1000000);
	    },
        
	    _setZIndex : function(iZIndex) {
	        jQuery("#sap-ui-blocklayer-popup").css("z-index", iZIndex);
	        jQuery(".sapUiDlg[data-sap-ui-popup]").css("z-index", iZIndex + 1);
	    },
	    
	    handleOpened : function() {
            sap.ui.commons.Dialog.prototype.handleOpened.apply(this, arguments);
            var oCloseButton = jQuery.sap.domById(this.getId() + "-close");
            jQuery.sap.focus(oCloseButton);
        },
	    
	    renderer : "sap.ui.commons.DialogRenderer"
    });
})();