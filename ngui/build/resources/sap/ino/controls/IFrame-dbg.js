/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.controls.IFrame");

(function() {
    "use strict";

    /**
     * 
     * The IFrame control can be used to sho html code independent from other css styles
     * 
     * <ul>
     * <li>Properties
     * <ul>
     * <li>content: Content to be shown in the IFrame</li>
     * </ul>
     * </li>
     * </ul>
     */
    sap.ui.core.HTML.extend("sap.ino.controls.IFrame", {
        metadata : {
            properties : {
                content : "string",
                width : {
                    type : "string",
                    defaultValue : "100%"
                },
                height : {
                    type : "string",
                    defaultValue : "100%"
                },
                backgroundColor : {
                    type : "string",
                    defaultValue : "white"
                }
            }
        },

        constructor : function(sContent) {
            this.sanitizeContent = true;
            sap.ui.core.HTML.apply(this, arguments);
        },
        
        onAfterRendering : function() {
            var oDomRef = this.getDomRef();
            var oDoc = oDomRef.contentWindow.document;
            oDoc.open();
            oDoc.write(this.getContent() || "");
            oDoc.close();
        },

        renderer : function(oRm, oControl) {
            oRm.write("<iframe");
            oRm.writeControlData(oControl);
            oRm.writeAttributeEscaped("style", "width:" + oControl.getWidth() + ";height:" + oControl.getHeight() + ";background-color:" + oControl.getBackgroundColor() + ";border:0");
            oRm.write("></iframe>");
        }
    });
})();