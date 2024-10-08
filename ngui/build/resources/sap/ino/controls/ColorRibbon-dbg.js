/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/layout/HorizontalLayout",
    "sap/ui/core/Icon",
	"sap/base/security/sanitizeHTML"
], function(Control, HorizontalLayout, Icon, sanitizeHTML) {
    "use strict";

    /**
     * 
     * An Color Ribbon
     * 
     * <ul>
     * <li>Properties
     * <ul>
     * <li>color: HEX Value (without #)</li>
     * </ul>
     * </li>
     * <li>Aggregations
     * <ul>
     * </ul>
     * </li>
     * <li>Events
     * <ul>
     * </ul>
     * </li>
     * </ul>
     */

    var ColorRibbon = Control.extend("sap.ino.controls.ColorRibbon", {
        metadata : {
            properties : {
                color : {
                    type : "string"
                }
            }
        },

        renderer : function(oRm, oControl) {
            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.writeClasses();
            
            var sColor = sanitizeHTML(oControl.getColor());
            if (sColor && sColor.length === 6) {
                sColor = "#" + sColor;
            } else {
                sColor = "#FFFFFF";
            }
            
            oRm.addStyle("background-color", sColor);
            oRm.writeStyles();
            oRm.write("></div>");
        }
    });

    return ColorRibbon;
});