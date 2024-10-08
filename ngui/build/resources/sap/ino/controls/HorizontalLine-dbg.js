/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/core/Control",
	"sap/base/security/sanitizeHTML"
], function (Control, sanitizeHTML) {
	"use strict";
	
	/**
     * 
     * Control displaying a horizontal Line
     * 
     */
	return Control.extend("sap.ino.controls.HorizontalLine", {
	    metadata : {
	        properties: {
                "height": {
                    type: "string",
                    defaultValue: "1px"
                },
                "width": {
                    type: "string",
                    defaultValue: "100%"
                }
	        }
	    },

        renderer : function(oRm, oControl) {
            var sHeight = sanitizeHTML(oControl.getHeight());
            var sWidth = sanitizeHTML(oControl.getWidth());
            
            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.addStyle("width", sWidth);
            oRm.addStyle("overflow", "hidden");
            oRm.writeStyles();
            oRm.addClass("sapInoHorizontalLine");
            oRm.writeClasses();
            oRm.write(">");
            
            oRm.write("<svg");
            oRm.writeAttribute("focusable", "false"); // required by IE
            oRm.addStyle("width", sWidth);
            oRm.addStyle("height", sHeight);
            
            oRm.writeStyles();
            oRm.writeClasses();
            oRm.write(">");
            
            oRm.write("<rect");
            oRm.writeAttributeEscaped("x", 0);
            oRm.writeAttributeEscaped("y", 0);
            oRm.writeAttributeEscaped("width", sWidth);
            oRm.writeAttributeEscaped("height", sHeight);
            oRm.write("/>");

            oRm.write("</svg>");
            oRm.write("</div>");
        }
	});
});