/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
 sap.ui.define([
	"sap/ino/controls/util/ColorSupport",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarRenderer",
	"sap/ui/Device"
], function (ColorSupport, Bar, BarRenderer, Device) {
	"use strict";
	
	/**
     * 
     * A Color bar is a standard bar with a background color and the adapted font color. 
     * 
     * <ul>
     * <li>Properties
     * <ul>
     * <li>backgroundColor: color used for rendering the background (hex encoded incl. #)</li>
     * </ul>
     * </li>
     * </ul>
     */
	return Bar.extend("sap.ino.controls.ColorBar", {
	    metadata: {
            properties : {
                "backgroundColor" : {
                    type : "sap.ui.core.CSSColor"
                },
                "enablePhone" : {
                    type : "boolean",
                    defaultValue : false
                }
            }
        },
		
		renderer : BarRenderer,
        
		onAfterRendering : function() {
		    var $this = jQuery(this.getDomRef());
		    $this.addClass("sapInoColorBar");
		    if (this.getProperty("enablePhone")) {
		        $this.addClass("sapInoColorBarPhoneEnabled");
		    }
			if(!Device.system.phone || this.getProperty("enablePhone")){
			    var sBackgroundColor = this.getProperty("backgroundColor");
	            if(sBackgroundColor && sBackgroundColor.length === 7){
	                var sTextColor = ColorSupport.calculateTitleTextColor(sBackgroundColor.substr(1, 2), sBackgroundColor.substr(3, 2), sBackgroundColor.substr(5, 2));
	               	$this.css("background-color", sBackgroundColor);
	               	$this.css("background", sBackgroundColor);
	                $this.addClass("sapInoColorBarText" + sTextColor);
	            }   
			}		    
        },
        
        onfocusin : function() {
            // for testing only
        }
		
	});
});