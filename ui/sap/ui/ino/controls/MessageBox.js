/*!
 * @copyright@
 */ 
jQuery.sap.declare("sap.ui.ino.controls.MessageBox");
(function() {
    "use strict";
    
    /**
     * 
     * MessageBox.
     * 
     */
    sap.ui.ino.controls.MessageBox = {};
    
    sap.ui.ino.controls.MessageBox.show = function(sMessage, oIcon, sTitle, vActions, fnCallback, oDefaultAction, sDialogId) {
        sap.ui.commons.MessageBox.show(sMessage, oIcon, sTitle, vActions, fnCallback, oDefaultAction, sDialogId);
        // sap.ui.ino.controls.MessageBox._setZIndex(1000000);
        sap.ui.ino.controls.MessageBox._setZIndex(1000000001);
    };
        
    sap.ui.ino.controls.MessageBox.alert = function(sMessage, fnCallback, sTitle, sDialogId) {
        sap.ui.commons.MessageBox.alert(sMessage, fnCallback, sTitle, sDialogId);
        sap.ui.ino.controls.MessageBox._setZIndex(1000000);
    };
        
    sap.ui.ino.controls.MessageBox.confirm = function(sMessage, fnCallback, sTitle, sDialogId) {
        sap.ui.commons.MessageBox.confirm(sMessage, fnCallback, sTitle, sDialogId);
        sap.ui.ino.controls.MessageBox._setZIndex(1000000);
    };
    
    sap.ui.ino.controls.MessageBox._setZIndex = function(iZIndex) {
        jQuery("#sap-ui-blocklayer-popup").css("z-index", iZIndex);
        jQuery(".sapUiDlg[data-sap-ui-popup]").css("z-index", iZIndex + 1);
    };

})();