sap.ui.define([
    "sap/ino/vc/commons/BaseController",
    "sap/m/Text",
    "sap/m/ResponsivePopover",
    "sap/ui/core/HTML"
], function (Controller, Text, ResponsivePopover, HTML) {
    "use strict";
    return Controller.extend("sap.ino.vc.app.Help", {
        onInit: function () {
            Controller.prototype.onInit.apply(this, arguments);

            this._oDialog = this.byId("helpDialog");
            this._oDraggableDialog = this.byId("helpDraggableDialog");
            
            this._oDialog.setInitialFocus(this.getView().sId + "--helpClose");
            this._oDraggableDialog.setInitialFocus(this.getView().sId + "--helpDraggableClose");
            
            // dialog is not modal
            this._oDraggableDialog.oPopup.setModal(false);
            this._oDraggableDialog.oPopup.setShadow(false);
            // do not cycle dialog
            this._oDraggableDialog.onfocusin = function() {};
        },
        
        show : function(sHTML) {
            var that = this;
            jQuery("#content").addClass("sapInoBlur");
            this._$BeforeFocus = jQuery(":focus");
            this._oDialog.open();
            
            this._sContent = sHTML || that.getModel("help").getProperty("/CONTENT");

            setTimeout(function() {
                // HTML Control has problems w/ updating the binding therefore we set it directly
                var $Containers = that._oDialog.$().find(".sapInoHelpContentContainer");
                jQuery.each($Containers, function(iIdx, $Container) {
                    var oContainer = sap.ui.getCore().getElementById($Container.id);
                    oContainer.removeAllContent();
                    oContainer.addContent(new HTML({ content : "<p>" + that._sContent + "</p>"}));
                    oContainer.rerender();
                });
            }, 0);
        },
        
        onClose : function() {
            jQuery("#content").removeClass("sapInoBlur");
        	this._oDialog.close();            
        },
        
        onAfterClose : function() {
            jQuery("#content").removeClass("sapInoBlur");
            if (!this._bNoFocusAfterClose && this._$BeforeFocus) {
                this._$BeforeFocus.focus();
            }
            
            this._bNoFocusAfterClose = false;
        },
        
        onDraggableAfterClose : function() {
            if (this._$BeforeFocus) {
                this._$BeforeFocus.focus();
            }
        },
        
        onDraggableDialogOpen : function() {
            var that = this;
            
            jQuery("#content").removeClass("sapInoBlur");
            this._bNoFocusAfterClose = true;
            this._oDialog.close();         
        	this._oDraggableDialog.open();
        	
            setTimeout(function() {
                // HTML Control has problems w/ updating the binding therefore we set it directly
                var $Containers = that._oDraggableDialog.$().find(".sapInoHelpContentContainer");
                jQuery.each($Containers, function(iIdx, $Container) {
                    var oContainer = sap.ui.getCore().getElementById($Container.id);
                    oContainer.removeAllContent();
                    oContainer.addContent(new HTML({ content : "<p>" + that._sContent + "</p>"}));
                    oContainer.rerender();
                });
            }, 0);
        },
        
        onDraggableClose : function() {
            this._oDraggableDialog.close();            
        }
   });
});