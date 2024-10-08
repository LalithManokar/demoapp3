/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/m/Button",
    "sap/ui/Device",
	"sap/base/security/sanitizeHTML"
], function(Control, Button, Device, sanitizeHTML) {
    "use strict";

    /**
     * 
     * An image cropping control to crop an image with mouse and keyboard support. Use function crop() to retrieve the
     * cropped image as file.
     * 
     * <ul>
     * <li>Properties
     * <ul>
     * <li>url: url to the image to be cropped</li>
     * <li>width: width of the control</li>
     * <li>height: height of the control</li>
     * <li>showZoom: show zoom controls</li>
     * <li>showMove: show move controls</li>
     * <li>showClear: show clear control</li>
     * <li>showCrop: show crop control</li>
     * <li>zoomStep: zoom step size for zoom buttons</li>
     * <li>moveStep: move step size for move buttons</li>
     * </ul>
     * </li>
     * <li>Aggregations
     * <ul>
     * </ul>
     * </li>
     * <li>Events
     * <ul>
     * <li>clear: event is thrown when the clear button was pressed</li>
     * <li>crop: event is thrown when the crop button was pressed, the cropped image file is passed as parameter</li>
     * </ul>
     * </li>
     * <li>Methods
     * <ul>
     * <li>crop: returns the cropped image based</li>
     * </ul>
     * </li>
     * </ul>
     */
    return Control.extend("sap.ino.controls.ImageCropping", {
        metadata : {
            properties : {
                url : {
                    type : "string"
                },
                width : {
                    type : "sap.ui.core.CSSSize",
                    defaultValue : "216px"
                },
                height : {
                    type : "sap.ui.core.CSSSize",
                    defaultValue : "121px"
                },
                showZoom : {
                    type : "boolean",
                    defaultValue : true
                },
                showMove : {
                    type : "boolean",
                    defaultValue : false
                },
                showClear : {
                    type : "boolean",
                    defaultValue : false
                },
                showCrop : {
                    type : "boolean",
                    defaultValue : false
                },
                zoomStep : {
                    type : "int",
                    defaultValue : 1
                },
                moveStep : {
                    type : "int",
                    defaultValue : 1
                },
                enabled : {
                    type : "boolean",
                    defaultValue : true
                }
            },
            aggregations : {
                "_zoomPlusButton" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_zoomMinusButton" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_moveUpButton" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_moveDownButton" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_moveLeftButton" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_moveRightButton" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_clearButton" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_cropButton" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                }
            },
            events : {
                clear : {},
                crop : {},
                cropImg: {}
            }
        },

        init : function() {
            this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.controls");
            this._bImgLoaded = false;
        },

        renderer : function(oRM, oControl) {
            oRM.write("<div");
            oRM.writeControlData(oControl);
            oRM.addClass("sapInoImageCrop");
            oRM.writeClasses();

            oRM.addStyle("width", sanitizeHTML(oControl.getWidth()));
            oRM.addStyle("height", sanitizeHTML(oControl.getHeight()));
            oRM.writeStyles();

            oRM.write(">");

            if (oControl.getUrl()) {

                oRM.write("<div");
                oRM.writeAttributeEscaped("tabindex", "0");
                oRM.writeAttributeEscaped("title", oControl._oRB.getText("IMAGE_CROP_DETAIL"));
                oRM.addClass("sapInoImageCropImageContainer");
                oRM.addClass("sapInoImageCropImageContainerHidden");
                if (!oControl.getEnabled()) {
                    oRM.addClass("sapInoImageCropImageContainerDisabled");
                }
                oRM.writeClasses();
                oRM.write(">");

                oRM.write("<img");
                oRM.writeAttributeEscaped("src", oControl.getUrl());
                oRM.writeAttributeEscaped("title", oControl._oRB.getText("IMAGE_CROP_DETAIL"));
                oRM.addClass("sapInoImageCropImage");
                oRM.writeClasses();
                oRM.write("></img>");

                oRM.write("</div>");
                
                if (oControl.getEnabled()) {
                    if (oControl.getShowZoom()) {
                        oRM.renderControl(oControl.getZoomPlusButton());
                        oRM.renderControl(oControl.getZoomMinusButton());
                    }
                    if (oControl.getShowMove()) {
                        oRM.renderControl(oControl.getMoveUpButton());
                        oRM.renderControl(oControl.getMoveDownButton());
                        oRM.renderControl(oControl.getMoveLeftButton());
                        oRM.renderControl(oControl.getMoveRightButton());
                    }
                    if (oControl.getShowClear()) {
                        oRM.renderControl(oControl.getClearButton());
                    }
                    if (oControl.getShowCrop()) {
                        oRM.renderControl(oControl.getCropButton());
                    }
                }
            }

            oRM.write("</div>");
        },

        onAfterRendering : function() {
            var oImg = this.cropImage();
            if (oImg) {
                var that = this;
                oImg.onload = function() {
                    that.cropInit();
                    jQuery(that.cropImageContainer()).removeClass("sapInoImageCropImageContainerHidden");
                    that._bImgLoaded = true;
                };
                
                if(this._bImgLoaded){
                    jQuery(this.cropImageContainer()).removeClass("sapInoImageCropImageContainerHidden");
                }
            }
        },

        setFocus : function() {
            if (this.cropImage()) {
                jQuery(this.cropImage()).parent().focus();
            }
        },

        getZoomPlusButton : function() {
            var that = this;
            var oZoomPlusButton = this.getAggregation("_zoomPlusButton");
            if (!oZoomPlusButton) {
                oZoomPlusButton = new Button({
                    icon : "sap-icon://zoom-in",
                    tooltip : this._oRB.getText("IMAGE_CROP_ZOOM_PLUS"),
                    press : function(oEvent) {
                        oEvent.cancelBubble();
                        oEvent.preventDefault();
                        that.cropZoom(that.getZoomStep());
                        that.getFocusDomRef().focus();
                    },
                    enabled : false
                }).addStyleClass("sapInoImageCropButton").addStyleClass("sapInoImageCropZoomPlus");
                this.setAggregation("_zoomPlusButton", oZoomPlusButton);
            }
            return oZoomPlusButton;
        },

        getZoomMinusButton : function() {
            var that = this;
            var oZoomMinusButton = this.getAggregation("_zoomMinusButton");
            if (!oZoomMinusButton) {
                oZoomMinusButton = new Button({
                    icon : "sap-icon://zoom-out",
                    tooltip : this._oRB.getText("IMAGE_CROP_ZOOM_MINUS"),
                    press : function(oEvent) {
                        oEvent.cancelBubble();
                        oEvent.preventDefault();
                        that.cropZoom(-that.getZoomStep());
                        that.getFocusDomRef().focus();
                    },
                    enabled : false
                }).addStyleClass("sapInoImageCropButton").addStyleClass("sapInoImageCropZoomMinus");
                this.setAggregation("_zoomMinusButton", oZoomMinusButton);
            }
            return oZoomMinusButton;
        },

        getMoveUpButton : function() {
            var that = this;
            var oMoveUpButton = this.getAggregation("_moveUpButton");
            if (!oMoveUpButton) {
                oMoveUpButton = new Button({
                    icon : "sap-icon://slim-arrow-up",
                    tooltip : this._oRB.getText("IMAGE_CROP_MOVE_UP"),
                    press : function(oEvent) {
                        oEvent.cancelBubble();
                        oEvent.preventDefault();
                        that.cropMoveBy(0, -that.getMoveStep());
                        that.getFocusDomRef().focus();
                    },
                    enabled : false
                }).addStyleClass("sapInoImageCropButton").addStyleClass("sapInoImageCropMoveUp");
                this.setAggregation("_moveUpButton", oMoveUpButton);
            }
            return oMoveUpButton;
        },

        getMoveDownButton : function() {
            var that = this;
            var oMoveDownButton = this.getAggregation("_moveDownButton");
            if (!oMoveDownButton) {
                oMoveDownButton = new Button({
                    icon : "sap-icon://slim-arrow-down",
                    tooltip : this._oRB.getText("IMAGE_CROP_MOVE_DOWN"),
                    press : function(oEvent) {
                        oEvent.cancelBubble();
                        oEvent.preventDefault();
                        that.cropMoveBy(0, that.getMoveStep());
                        that.getFocusDomRef().focus();
                    },
                    enabled : false
                }).addStyleClass("sapInoImageCropButton").addStyleClass("sapInoImageCropMoveDown");
                this.setAggregation("_moveDownButton", oMoveDownButton);
            }
            return oMoveDownButton;
        },

        getMoveLeftButton : function() {
            var that = this;
            var oMoveLeftButton = this.getAggregation("_moveLeftButton");
            if (!oMoveLeftButton) {
                oMoveLeftButton = new Button({
                    icon : "sap-icon://slim-arrow-left",
                    tooltip : this._oRB.getText("IMAGE_CROP_MOVE_LEFT"),
                    press : function(oEvent) {
                        oEvent.cancelBubble();
                        oEvent.preventDefault();
                        that.cropMoveBy(-that.getMoveStep(), 0);
                        that.getFocusDomRef().focus();
                    },
                    enabled : false
                }).addStyleClass("sapInoImageCropButton").addStyleClass("sapInoImageCropMoveLeft");
                this.setAggregation("_moveLeftButton", oMoveLeftButton);
            }
            return oMoveLeftButton;
        },

        getMoveRightButton : function() {
            var that = this;
            var oMoveRightButton = this.getAggregation("_moveRightButton");
            if (!oMoveRightButton) {
                oMoveRightButton = new Button({
                    icon : "sap-icon://slim-arrow-right",
                    tooltip : this._oRB.getText("IMAGE_CROP_MOVE_RIGHT"),
                    press : function(oEvent) {
                        oEvent.cancelBubble();
                        oEvent.preventDefault();
                        that.cropMoveBy(that.getMoveStep(), 0);
                        that.getFocusDomRef().focus();
                    },
                    enabled : false
                }).addStyleClass("sapInoImageCropButton").addStyleClass("sapInoImageCropMoveRight");
                this.setAggregation("_moveRightButton", oMoveRightButton);
            }
            return oMoveRightButton;
        },
        
        getClearButton : function() {
            var that = this;
            var oClearButton = this.getAggregation("_clearButton");
            if (!oClearButton) {
                oClearButton = new Button({
                    icon : "sap-icon://sys-cancel",
                    tooltip : this._oRB.getText("IMAGE_CROP_CLEAR"),
                    press : function(oEvent) {
                        oEvent.cancelBubble();
                        oEvent.preventDefault();
                        that.fireClear();
                        that.getFocusDomRef().focus();
                    },
                    enabled : true
                }).addStyleClass("sapInoImageCropButton").addStyleClass("sapInoImageCropClear");
                this.setAggregation("_clearButton", oClearButton);
            }
            return oClearButton;
        },
        
        getCropButton : function() {
            var that = this;
            var oCropButton = this.getAggregation("_cropButton");
            if (!oCropButton) {
                oCropButton = new Button({
                    icon : "sap-icon://crop",
                    tooltip : this._oRB.getText("IMAGE_CROP_CROP"),
                    press : function(oEvent) {
                        oEvent.cancelBubble();
                        oEvent.preventDefault();
                        that.fireCropImg();
                        that.getFocusDomRef().focus();
                    },
                    enabled : false
                }).addStyleClass("sapInoImageCropButton").addStyleClass("sapInoImageCropCrop");
                this.setAggregation("_cropButton", oCropButton);
            }
            return oCropButton;
        },

        cropInit : function(bSupressInitImage) {
            this.cropInitMove();
            this.cropInitScrollZoom();
            if (!bSupressInitImage) {
                this.cropInitImage();
            }
            this.cropCheckButtons();
        },

        cropImageContainer : function() {
            return jQuery(this.getDomRef()).find(".sapInoImageCropImageContainer")[0];
        },

        cropImage : function() {
            return jQuery(this.getDomRef()).find(".sapInoImageCropImage")[0];
        },

        cropInitImage : function() {
            var oImg = this.cropImage();
            var jDom = jQuery(this.getDomRef());
            var ratio = oImg.naturalWidth / oImg.naturalHeight;
            var zoomX = jDom.width() - oImg.naturalWidth;
            var zoomY = jDom.height() - oImg.naturalHeight;
            var dx = zoomX > zoomY * ratio ? zoomX : zoomY * ratio;
            this.cropZoomBy(dx);
            jQuery(oImg).css({
                "left" : 0,
                "top" : 0,
                "position" : "relative"
            });
        },

        cropInitMove : function() {
            if (!this.getEnabled()) {
                return;
            }
            var that = this;
            var oImg = this.cropImage();
            var jImg = jQuery(oImg);
            // Desktop Mouse
            jImg.on("mousedown", function(e) {
                e.preventDefault();
                var posX = jImg.offset().left - e.pageX;
                var posY = jImg.offset().top - e.pageY;
                jImg.on("mousemove", function(e) {
                    that.cropMoveAt(posX + e.pageX, posY + e.pageY);
                });
            }).on("mouseup", function() {
                jImg.off("mousemove");
            }).on("mouseout", function() {
                jImg.off("mousemove");
            });
            // Mobile Touch
            jImg.on("touchstart", function(e) {
                e.preventDefault();
                if (e.touches && e.touches.length > 0) {
                    var t = e.touches[0];
                    var posX = jImg.offset().left - t.pageX;
                    var posY = jImg.offset().top - t.pageY;
                    var dist = -1;
                    jImg.on("touchmove", function(e) {
                        if (e.touches && e.touches.length > 0) {
                            if (e.touches.length == 2) {
                                var t1 = e.touches[0];
                                var t2 = e.touches[1];
                                var newDist = Math.sqrt(Math.pow(t1.pageX - t2.pageX, 2) + Math.pow(t1.pageY - t2.pageY, 2));
                                if (dist > 0) {
                                    that.cropZoomBy(newDist - dist);
                                }
                                dist = newDist;
                            } else {
                                var t = e.touches[0];
                                that.cropMoveAt(posX + t.pageX, posY + t.pageY);
                            }
                        }
                    });
                }
            }).on("touchend", function() {
                jImg.off("touchmove");
            });
        },

        cropInitScrollZoom : function() {
            if (!this.getEnabled()) {
                return;
            }
            var that = this;
            var oImg = this.cropImage();
            var jImg = jQuery(oImg);
            jImg.parent().bind("wheel mousewheel", function(e) {
                if (e.originalEvent.deltaY > 0) {
                    that.cropZoom(-1.0);
                } else {
                    that.cropZoom(1.0);
                }
                e.originalEvent.preventDefault();
                e.originalEvent.stopPropagation();
                e.originalEvent.stopImmediatePropagation();
                return false;
            });
        },

        onkeydown : function(oEvent) {
            if (!this.getEnabled()) {
                return;
            }
            var bStopBubble = true;
            switch (oEvent.keyCode) {
                case jQuery.sap.KeyCodes.ARROW_LEFT :
                    this.cropMoveBy(-1, 0);
                    break;
                case jQuery.sap.KeyCodes.ARROW_UP :
                    this.cropMoveBy(0, -1);
                    break;
                case jQuery.sap.KeyCodes.ARROW_RIGHT :
                    this.cropMoveBy(1, 0);
                    break;
                case jQuery.sap.KeyCodes.ARROW_DOWN :
                    this.cropMoveBy(0, 1);
                    break;
                case jQuery.sap.KeyCodes.PLUS :
                case jQuery.sap.KeyCodes.NUMPAD_PLUS :
                case 171 : // Firefox: PLUS (no constant)
                    this.cropZoom(1.0);
                    break;
                case jQuery.sap.KeyCodes.SLASH :
                case jQuery.sap.KeyCodes.MINUS :
                case jQuery.sap.KeyCodes.NUMPAD_MINUS :
                case 173 : // Firefox: MINUS (no constant)
                    this.cropZoom(-1.0);
                    break;
                default :
                    bStopBubble = false;
                    break;
            }
            if (bStopBubble) {
                oEvent.preventDefault();
                oEvent.stopPropagation();
                oEvent.stopImmediatePropagation();
            }
        },

        cropCheckButtons : function() {
            if (!this.getEnabled()) {
                return;
            }
            var jImg = jQuery(this.cropImage());
            var jDom = jQuery(this.getDomRef());
            var maxLeft = -(jImg.width() - jDom.width());
            var maxTop = -(jImg.height() - jDom.height());
            var left = parseInt(jImg.css("left"), 10);
            var top = parseInt(jImg.css("top"), 10);

            if (this.getAggregation("_zoomPlusButton")) {
                this.getAggregation("_zoomPlusButton").setEnabled(true);
            }
            if (this.getAggregation("_zoomMinusButton")) {
                this.getAggregation("_zoomMinusButton").setEnabled(jImg.width() > jDom.width() && jImg.height() > jDom.height());
            }
            if (this.getAggregation("_moveUpButton")) {
                this.getAggregation("_moveUpButton").setEnabled(top > maxTop);
            }
            if (this.getAggregation("_moveDownButton")) {
                this.getAggregation("_moveDownButton").setEnabled(top < 0);
            }
            if (this.getAggregation("_moveLeftButton")) {
                this.getAggregation("_moveLeftButton").setEnabled(left > maxLeft);
            }
            if (this.getAggregation("_moveRightButton")) {
                this.getAggregation("_moveRightButton").setEnabled(left < 0);
            }
            if (this.getAggregation("_cropButton")) {
                this.getAggregation("_cropButton").setEnabled(jImg.width() !== jDom.width() || jImg.height() !== jDom.height());
            }
        },

        cropMoveAt : function(x, y) {
            if (!this.getEnabled()) {
                return;
            }
            var oImg = this.cropImage();
            var jImg = jQuery(oImg);
            var jDom = jQuery(this.getDomRef());
            jImg.offset({
                left : x,
                top : y
            });
            var maxLeft = -(jImg.width() - jDom.width());
            var maxTop = -(jImg.height() - jDom.height());
            var left = parseInt(jImg.css("left"), 10);
            var top = parseInt(jImg.css("top"), 10);
            if (top > 0) {
                jImg.css("top", 0);
            }
            if (top < maxTop) {
                jImg.css("top", maxTop);
            }
            if (left > 0) {
                jImg.css("left", 0);
            }
            if (left < maxLeft) {
                jImg.css("left", maxLeft);
            }
            this.cropCheckButtons();
        },

        cropMoveBy : function(dx, dy) {
            if (!this.getEnabled()) {
                return;
            }
            var oImg = this.cropImage();
            var pos = jQuery(oImg).offset();
            this.cropMoveAt(pos.left + dx, pos.top + dy);
        },

        cropZoom : function(factor) {
            if (!this.getEnabled()) {
                return;
            }
            this.cropZoomBy(10.0 * (factor || 1.0));
        },

        cropZoomBy : function(dx) {
            if (!this.getEnabled()) {
                return;
            }
            var oImg = this.cropImage();
            var jImg = jQuery(oImg);
            var jDom = jQuery(this.getDomRef());
            var ratio = jImg.width() / jImg.height();
            var newWidth = jImg.width() + dx;
            var newHeight = newWidth / ratio;
            if (newWidth < jDom.width() || newHeight < jDom.height()) {
                if (newWidth - jDom.width() < newHeight - jDom.height()) {
                    newWidth = jDom.width();
                    newHeight = newWidth / ratio;
                } else {
                    newHeight = jDom.height();
                    newWidth = ratio * newHeight;
                }
            }
            jImg.width(newWidth);
            jImg.height(newHeight);
            var pos = jImg.offset();
            this.cropMoveAt(pos.left - dx / 2.0, pos.top - dx / 2.0);
            this.cropCheckButtons();
        },

        crop : function() {
            var that = this;
            var oImg = this.cropImage();
            if (oImg) {
                var jImg = jQuery(oImg);
                var jDom = jQuery(this.getDomRef());
                if (jImg.width() !== jDom.width() || jImg.height() !== jDom.height()) {
                    var oCanvas = document.createElement("canvas");
                    var oContext = oCanvas.getContext("2d");
                    oContext.mozImageSmoothingEnabled = true;
                    oContext.webkitImageSmoothingEnabled = true;
                    oContext.msImageSmoothingEnabled = true;
                    oContext.imageSmoothingEnabled = true;

                    oCanvas.width = jDom.width();
                    oCanvas.height = jDom.height();

                    oContext.fillStyle = "#FFFFFF";
                    oContext.fillRect(0, 0, oCanvas.width, oCanvas.height);

                    // Safari has issues when sx + swidth > naturalWidth or sy + sheight > naturalHeight
                    // This happens when the image was zoomed and the cropped area is outside of the natural size
                    // bounds in the zoomed image:
                    // To fix this the following is performed on the width and heights
                    // - Current image left position (originalLeft) is substracted from width
                    // - Current image top position (originalTop) is substracted from height
                    // - Relative image left position to natural (left) is substracted from swidth
                    // - Relative image top position to natural (top) is substracted from swidth
                    var originalLeft = Math.abs(parseInt(jImg.css("left"), 10));
                    var originalTop = Math.abs(parseInt(jImg.css("top"), 10));
                    var left = originalLeft * (oImg.naturalWidth / jImg.width());
                    var top = originalTop * (oImg.naturalHeight / jImg.height());

                    var width = oImg.naturalWidth;
                    var height = oImg.naturalHeight;

                    this.cropDrawImage(oContext, oImg, left, top, width - left, height - top, 0, 0, jImg.width() - originalLeft, jImg.height() - originalTop);
                    var sCropImageUrl = oCanvas.toDataURL();

                    var aBlobBin = atob(sCropImageUrl.split(",")[1]);
                    var aArray = [];
                    for (var i = 0; i < aBlobBin.length; i++) {
                        aArray.push(aBlobBin.charCodeAt(i));
                    }
                    var oFile = new Blob([new Uint8Array(aArray)], {
                        type : "image/png",
                        name : "image.png"
                    });

                    return oFile;
                }
            }
            return null;
        },

        cropCalcVerticalRatio : function(oImg) {
            if (!Device.os.ios) {
                return 1.0;
            }
            // iOS does not draw images in correct ratio on canvas => calculate correct vertical ratio
            var iNaturalHeight = oImg.naturalHeight;
            var oCanvas = document.createElement("canvas");
            oCanvas.width = 1.0;
            oCanvas.height = iNaturalHeight;
            var oContext = oCanvas.getContext("2d");
            oContext.drawImage(oImg, 0, 0);
            var aData = oContext.getImageData(0, 0, 1, iNaturalHeight).data;
            var iStartY = 0;
            var iCurrentY = iNaturalHeight;
            var iPointY = iNaturalHeight;
            while (iPointY > iStartY) {
                var fAlpha = aData[(iPointY - 1) * 4 + 3];
                if (fAlpha === 0) {
                    iCurrentY = iPointY;
                } else {
                    iStartY = iPointY;
                }
                iPointY = (iCurrentY + iStartY) >> 1;
            }
            var fRatio = (iPointY / iNaturalHeight);
            return (fRatio === 0) ? 1.0 : fRatio;
        },

        cropDrawImage : function(context, img, sx, sy, swidth, sheight, x, y, width, height) {
            var fVerticalRatio = 1.0; // this.cropCalcVerticalRatio(img); iOS Bug - already fixed
            context.drawImage(img, sx * fVerticalRatio, sy * fVerticalRatio, swidth * fVerticalRatio, sheight * fVerticalRatio, x, y, width, height);
        }
    });
});