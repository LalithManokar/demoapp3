/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/vc/commons/BaseController", 
    "sap/ino/wall/util/Helper", 
    "sap/ino/commons/models/object/Attachment", 
    "sap/ino/commons/application/Configuration",
    "sap/ino/commons/formatters/BaseFormatter",
    "sap/ui/core/CustomData",
    "sap/m/Image",
    "sap/m/MessageToast",
    "sap/ino/wall/ColorPicker",
    "sap/m/PlacementType"
], function(BaseController, Helper, Attachment, Configuration, BaseFormatter, CustomData, Image, MessageToast, ColorPicker, PlacementType) {
    
    var WALL_BG_IMAGE_PATH = "/sap/ino/ngui/sap/ino/assets/img/wall/bg/";
    
    var oFormatter = jQuery.extend({}, BaseFormatter);
    
    return BaseController.extend("sap.ino.vc.wall.WallSettingsBackground", {
        
        formatter : oFormatter,

        onInit : function() {
            if (BaseController.prototype.onInit) {
                BaseController.prototype.onInit.apply(this, arguments);
            }
            
            this.standardImages = Helper.getStandardImages();
            
            this.standardImageControls = [];
            
            var that = this;
            jQuery.each(this.standardImages, function(iIndex, oStandardImage) {
                that.createStandardImage(oStandardImage);
            });
        },
        
        onAfterRendering : function() {
            this.refresh();
        },

        getWallModel : function() {
            return this.getView().getModel("object");
        },

        getWall : function() {
            var oControl = this.getView().getParent();
            while (oControl) {
                if (typeof oControl.getController == "function" && typeof oControl.getController().getWall == "function") {
                    return oControl.getController().getWall();
                }
                oControl = oControl.getParent();
            }
            return null;
        },

        getColorOpener : function() {
            return this.byId("colorOpener");
        },
        
        getCustomImageUpload : function() {
            return this.byId("customImageUpload");
        },
        
        createStandardImage : function(oData) {
            var oStandardImage = new Image({
                src : WALL_BG_IMAGE_PATH + oData.preview,
                width : "100px",
                height : "100px",
                press : [this.onStandardImage, this],
                densityAware : false,
                tooltip : oData.name,
                tabindex : 0,
                customData : [new CustomData({
                    key : "file",
                    value : oData.file
                }), new CustomData({
                    key : "preview",
                    value : oData.preview
                }), new CustomData({
                    key : "name",
                    value : oData.name
                })]
            }).addStyleClass("sapInoWallSettingsBgPreview");
            this.byId("tiles").addItem(oStandardImage);
            this.standardImageControls.push(oStandardImage);
        },
        
        onStandardImage : function(oEvent) {
            this.closeColorPicker();
            
            var oImage = oEvent.getSource();
            
            var oWallModel = this.getWallModel();
            oWallModel.clearBackgroundAttachmentImage(true);
            oWallModel.setProperty("/BACKGROUND_COLOR", "");
            oWallModel.setProperty("/BACKGROUND_IMAGE_URL", oImage.data("file"));
            
            var oWall = this.getWall();
            oWall.setBackgroundImageZoom(0.0);
            oWall.setBackgroundImageTiled(false);
            oWall.setBackgroundImage(oImage.data("file"));
            
            this.refresh();
            MessageToast.show(this.getText("WALL_SETTING_BACKGROUND_MESSAGE_UPDATE", [oImage.data("name")]));
        },
        
        onCustomImageUpload : function(oEvent) {
            this.closeColorPicker();
            
            var oDropUpload = oEvent.getSource();
            //  display an error if user tries to drop a file with IE9
            if (sap.ui.Device.browser.name === "ie" && sap.ui.Device.browser.version < 10 && aFiles === undefined) {
                return;
            }
            var aFiles = oEvent.getParameter("files");
            if (aFiles.length !== 0) {
                var oFile = aFiles[0];
                if (!!oFile.type.match(/image\.*/)) {
                    this.setBusy(true);
                    var that = this;
                    Attachment.uploadFile(oFile).done(function(oResponse) {
                        that.setBusy(false);
                        var iId = oResponse.attachmentId;
                        
                        var oWallModel = that.getWallModel();
                        oWallModel.setBackgroundAttachmentImage(iId);
                        oWallModel.setProperty("/BACKGROUND_IMAGE_ZOOM", 10.0);
                        oWallModel.setProperty("/BACKGROUND_IMAGE_REPEAT", 0);
                        oWallModel.setProperty("/BACKGROUND_COLOR", "");
                        
                        var oWall = that.getWall();
                        oWall.setBackgroundImage(Configuration.getAttachmentDownloadURL(iId));
                        oWall.setBackgroundImageZoom(10.0);
                        oWall.setBackgroundImageTiled(false);
                        oWall.setBackgroundColor("");

                        that.refresh();
                    }).always(function(oResponse) {
                        that.setBusy(false);
                    });
                } else {
                    sap.m.MessageToast.show(this.getText("WALL_SETTING_BACKGROUND_MESSAGE_UNSUPPORTED_FORMAT", [oFile.type]));
                }
            }
        },
        
        onRepeatChange : function(oEvent) {
            var bSelected = oEvent.getParameter("selected");
            this.getWall().setBackgroundImageTiled(bSelected);
        },
        
        onZoomChange : function(oEvent) {
            var fValue = oEvent.getParameter("value");
            this.getWallModel().setProperty("/BACKGROUND_IMAGE_ZOOM", fValue);
            this.getWall().setBackgroundImageZoom(fValue);
        },
        
        onColorChange : function(oEvent) {
            var that = this;
            var sColor = oEvent.getParameter("color");
    
            var oWallModel = that.getWallModel();
            oWallModel.clearBackgroundAttachmentImage(true);
            oWallModel.setProperty("/BACKGROUND_IMAGE_URL", "");
            oWallModel.setProperty("/BACKGROUND_COLOR", sColor.substr(1));
        
            var oWall = that.getWall();
            oWall.setBackgroundImage("");
            oWall.setBackgroundImageZoom(0.0);
            oWall.setBackgroundImageTiled(false);
            oWall.setBackgroundColor(sColor.substr(1));
            
            this.refresh();
        },
        
        onColorOpener : function(oEvent) {
            var oColorPicker = this.getColorPicker();
            if (oColorPicker.isOpen()) {
                oColorPicker.close();
            } else {
                oColorPicker.openBy(this.getColorOpener(), 0, 0);
            }
        },
        
        closeColorPicker : function(oEvent) {
            var oColorPicker = this.getColorPicker();
            if (oColorPicker.isOpen()) {
                oColorPicker.close();
            }
        },
        
        setColorOpenerColor : function() {
            var oWallModel = this.getWallModel();
            if (oWallModel) {
                var sColor = oWallModel.getProperty("/BACKGROUND_COLOR");
                sColor = sColor ? "#" + sColor : "#FFFFFF";
                var fLuminance = Helper.getColorLuminance(Helper.shadeColor(sColor, -20));
                this.getColorOpener().removeStyleClass("sapInoWallSettingsColorSelectorButtonNormal");
                this.getColorOpener().removeStyleClass("sapInoWallSettingsColorSelectorButtonBright");
                if (fLuminance <= 0.6) {
                    this.getColorOpener().addStyleClass("sapInoWallSettingsColorSelectorButtonBright");
                } else {
                    this.getColorOpener().addStyleClass("sapInoWallSettingsColorSelectorButtonNormal");
                }            
                var oColorOpenerDomRef = jQuery(this.getColorOpener().getDomRef());
                if (oColorOpenerDomRef) {
                    oColorOpenerDomRef.css("background-color", sColor);
                    oColorOpenerDomRef.css("background-image", Helper.addBrowserPrefix("linear-gradient(top, " + Helper.shadeColor(sColor, 10) + " 0%, " + Helper.shadeColor(sColor, -10) + " 100%)"));
                }
            }
        },
        
        getColorPicker : function() {
            var that = this;
            if (!this._oColorPicker) {
                this._oColorPicker = new ColorPicker({
                    color : {
                        path : "object>BACKGROUND_COLOR",
                        formatter : function(sColor) {
                            return sColor ? "#" + sColor : "transparent";
                        }
                    },
                    change : function(oEvent) {
                        that.onColorChange(oEvent);
                    },
                    zoomable : false
                });
                this._oColorPicker.setPlacement(PlacementType.Vertical);
                this.getView().addDependent(this._oColorPicker);
            }
            return this._oColorPicker;
        },
        
        clearSelection : function() {
            jQuery(this.getView().getDomRef()).find(".sapInoWallSettingsBgPreview, .sapInoWallDropUpload").removeClass("active");
        },
        
        setSelection : function() {
            this.clearSelection();
            if (this.getWallModel()) {
                var oWallData = this.getWallModel().getData();
                if (oWallData) {
                    if (oWallData.BackgroundImage && oWallData.BackgroundImage.length > 0) {
                        jQuery(this.getCustomImageUpload().getDomRef()).addClass("active");
                    } else if (oWallData.BACKGROUND_IMAGE_URL) {
                        var aResult = jQuery.grep(this.standardImageControls, function(oImage) {
                            return oWallData.BACKGROUND_IMAGE_URL == oImage.data("file");
                        });
                        if (aResult.length > 0) {
                            jQuery(aResult[0].getDomRef()).addClass("active");
                        }
                    } else if (oWallData.BACKGROUND_COLOR) {
                        jQuery(this.getColorOpener().getDomRef()).addClass("active");
                    }
                }
            }
        },
        
        refresh : function() {
            this.setColorOpenerColor();
            this.setSelection();
        }
    });
});