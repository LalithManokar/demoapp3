/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.ToolPopup");
(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ux3.ToolPopup");
    jQuery.sap.require("sap.ui.ux3.ToolPopupRenderer");

    sap.ui.ux3.ToolPopup.extend("sap.ui.ino.controls.ToolPopup", {
        init : function() {
            sap.ui.ux3.ToolPopup.prototype.init.apply(this, arguments);
            
            this.addStyleClass("sapUiInoToolPopup");
        },
        
        open : function() {
            sap.ui.ux3.ToolPopup.prototype.open.apply(this, arguments);
            
            var that = this;
            jQuery(document).on("mouseup.sapUiInoToolPopup", function(e) {
                that.closeOnClick(e);
            });
        },
        
        closeOnClick : function(e) {
            if (this.isOpen()) {
                var oContainer = jQuery(this.getDomRef());
                if (oContainer.is(e.target) || oContainer.has(e.target).length !== 0) {
                    return;
                }

                if (e.target.nodeName === "HTML") {
                    // check if the scrollbar is part of popup or of window
                    if ((oContainer.outerWidth() + parseInt(oContainer.css("left"), 10) + 1 < e.clientX) ||
                        (oContainer.outerHeight() + parseInt(oContainer.css("top"), 10) + 1 < e.clientY)) {
                        this.close();
                    }                        
                } else {
                    var bClose = true;
                    var aChildPopups = this.oPopup.getChildPopups();
                    jQuery.each(aChildPopups, function(iIndex, sChildPopup){
                        var oChildPopup = jQuery("#" + sChildPopup);
                        if(oChildPopup.has(e.target).length !== 0) {
                            bClose = false;
                            return;
                        }
                    });
                    if(bClose) {
                        this.close();
                    }
                }
            }
        },
        
        close : function() {
            sap.ui.ux3.ToolPopup.prototype.close.apply(this, arguments);
            
            jQuery(document).off("mouseup.sapUiInoToolPopup");
            jQuery(document).off("onkeyup.sapUiInoToolPopup");
        },
        
        renderer : "sap.ui.ux3.ToolPopupRenderer"
    });
})();