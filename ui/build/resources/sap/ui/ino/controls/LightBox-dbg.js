/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.LightBox");

(function() {
    "use strict";

    jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
    
    sap.ui.core.Control.extend("sap.ui.ino.controls.LightBox", {
        metadata : {
            properties : {
                "title" : "string",
                "image" : "sap.ui.core.URI",
                "alt" : "string"
            },
            aggregations : {
                "_dialog" : {
                    type : "sap.m.Dialog",
                    multiple : false,
                    visibility : "hidden"
                },
                "_busyDialog" : {
                    type : "sap.m.BusyDialog",
                    multiple : false,
                    visibility : "hidden"
                }
            }
        },

        init : function() {
            this._oRB = sap.ui.getCore().getModel("i18n").getResourceBundle();
        },

        exit : function() {
            this._oImage.destroy();
            this._oImage = null;
            sap.ui.Device.resize.detachHandler(this._getBoundResizeHandler());
        },

        _getDialog : function() {
            var that = this, oControl = this.getAggregation("_dialog"), fnClose = function() {
                var oTarget = sap.ui.getCore().byId(arguments[0].target.id);
                if (!oTarget || (oTarget.getMetadata().getName() !== "sap.ui.commons.Link" && oTarget.getMetadata().getName() !== "sap.m.Image")) {
                    sap.ui.Device.resize.detachHandler(that._getBoundResizeHandler());
                    jQuery("#sap-ui-blocklayer-popup").off("click", fnClose);
                    oControl.destroy();
                    oControl = null;
                }
            }, fnOpen = function() {
                jQuery("#sap-ui-blocklayer-popup").on("click", fnClose);
            };
            
            var fnDownload = function() {
                sap.ui.ino.application.ApplicationBase.getApplication().navigateToByURLInNewWindow(that.getImage());
            };

            if (!oControl) {
                var oImage = this._getImage().clone(); 
                oImage.attachPress(fnDownload);
                oControl = new sap.m.Dialog({
                    stretch : sap.ui.Device.system.phone,
                    showHeader : false,
                    verticalScrolling : false,
                    horizontalScrolling : false,
                    afterClose : fnClose,
                    afterOpen : fnOpen,
                    content : [oImage, new sap.ui.commons.Link({
                        text : this.getTitle(),
                        href : that.getImage(),
                        target : "_blank"                        
                    }).addStyleClass("sapUiInoLightBoxTitle")]
                }).addEventDelegate({
                    ontap : fnClose
                }).addStyleClass("sapUiInoLightBoxDialog");
                this.setAggregation("_dialog", oControl, true);
            }

            return oControl;
        },

        _getBusyDialog : function() {
            var oControl = this.getAggregation("_busyDialog");
            if (!oControl) {
                oControl = new sap.m.BusyDialog();
                this.setAggregation("_busyDialog", oControl, true);
            }
            return oControl;
        },

        _getImage : function() {
            if (!this._oImage) {
                this._oImage = new sap.m.Image(this.getId() + "-image", {
                    src : this.getImage(),
                    alt : this.getAlt()
                });
            }
            return this._oImage;
        },

        _adjustImageSizeToScreen : function(iImageWidth, iImageHeight) {
            var oDialog = this._getDialog();
            var iWindowWidth = sap.ui.Device.resize.width;
            var iWindowHeight = sap.ui.Device.resize.height;
            var iTemp, iTemp2;

            if (!iImageWidth || !iImageHeight) {
                return;
            }

            if (!oDialog.getStretch()) {
                iWindowWidth -= 2 * 64 + 2 * 16;
                iWindowHeight -= 2 * 8 + 2 * 16 + 48;
            } else {
                iWindowWidth -= 2 * 16;
                iWindowHeight -= 2 * 16 + 24;
            }

            if (iImageWidth > iWindowWidth) {
                iTemp = iWindowWidth;
                iImageHeight = (iTemp / iImageWidth) * iImageHeight;
                iImageWidth = iTemp;
                if (!sap.ui.Device.system.phone) {
                    iTemp2 = Math.max(iImageWidth, 368);
                    iImageHeight = (iTemp2 / iImageWidth) * iImageHeight;
                    iImageWidth = iTemp2;
                }
            }

            if (iImageHeight > iWindowHeight) {
                iTemp = iWindowHeight;
                iImageWidth = (iTemp / iImageHeight) * iImageWidth;
                if (!sap.ui.Device.system.phone) {
                    iImageWidth = Math.max(iImageWidth, 368);
                }
                iImageHeight = iTemp;
                iImageHeight = Math.max(iImageHeight, 1);
            }

            return [iImageWidth, iImageHeight];
        },

        _getBoundResizeHandler : function() {
            if (!this._onResizeHandler) {
                this._onResizeHandler = this._onResize.bind(this);
            }
            return this._onResizeHandler;
        },

        _onResize : function() {
            var oDialog = this._getDialog(), oImage = oDialog.getContent()[0], aScaledImageDimensions = this._adjustImageSizeToScreen(this._iImageWidth, this._iImageHeight);
            if (aScaledImageDimensions) {
                oImage.setWidth(aScaledImageDimensions[0] + "px").setHeight((aScaledImageDimensions[1] - 50) + "px");
            }
        },

        open : function() {
            var that = this, oDialog = this._getDialog(), oBusyIndicator = this._getBusyDialog(), oPreload = new Image();
            oBusyIndicator.open();
            oPreload.src = this.getImage();
            oPreload.onload = function() {
                var aScaledImageDimensions, oImage = oDialog.getContent()[0];
                that._iImageWidth = this.width;
                that._iImageHeight = this.height;
                aScaledImageDimensions = that._adjustImageSizeToScreen(that._iImageWidth, that._iImageHeight);
                oBusyIndicator.close();
                if (aScaledImageDimensions) {
                    oImage.setWidth(aScaledImageDimensions[0] + "px").setHeight((aScaledImageDimensions[1] - 50) + "px");
                }
                sap.ui.Device.resize.attachHandler(that._getBoundResizeHandler());
                oDialog.open();
            };
            oPreload.onerror = function() {
                oBusyIndicator.close();
            };
        },
        
        renderer : function(oRm, oControl) {
        }

    });
})();