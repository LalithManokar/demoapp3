/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.BusyIndicator");

(function() {
	"use strict";
	
	jQuery.sap.require("sap.ui.core.LocalBusyIndicator");
    
    /**
     * 
     * Indicator shown when app is busy e.g. due to server requests.
     * 
     */
    sap.ui.ino.controls.BusyIndicator = {
        imageOnly: true
    };
    
    sap.ui.ino.controls.BusyIndicator.show = function(iDelay) {
        sap.ui.core.BusyIndicator.show(iDelay);
        sap.ui.ino.controls.BusyIndicator._setZIndex(999999999);     
        
        if (!sap.ui.ino.controls.BusyIndicator.imageOnly) {
            var oIndicator = new sap.ui.core.LocalBusyIndicator();
            var $Busy = jQuery("#sapUiBusyIndicator");
            if ($Busy && $Busy.length > 0) {
                if (-1 === $Busy[0].className.indexOf("sapUiInoBackofficeBusyIndicator")) {
                    $Busy[0].className += " sapUiInoBackofficeBusyIndicator";
                }
                oIndicator.placeAt($Busy[0], "only");
            }
        }
    };
        
    sap.ui.ino.controls.BusyIndicator.hide = function() {
        sap.ui.core.BusyIndicator.hide();
    };
    
    sap.ui.ino.controls.BusyIndicator._setZIndex = function(iZIndex) {
        jQuery("#sap-ui-blocklayer-popup").css("z-index", iZIndex);
        jQuery("#sapUiBusyIndicator").css("z-index", iZIndex + 1);
        jQuery("#sapUiBusyIndicator").css("position", "fixed");
        jQuery("#sapUiBusyIndicator").css("top", "0px");
        jQuery("#sapUiBusyIndicator").css("left", "0px");
    };

})();