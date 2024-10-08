/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.WallItemImage");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBase");
    jQuery.sap.require("sap.ino.wall.DropUpload");
    jQuery.sap.require("sap.ino.wall.LightBox");
    jQuery.sap.require("sap.ino.commons.models.object.Attachment");
    jQuery.sap.require("sap.ino.commons.application.Configuration");
    var Configuration = sap.ino.commons.application.Configuration;

    /**
     * Constructor for a new WallItemImage.
     * 
     * Accepts an object literal <code>mSettings</code> that defines initial property values, aggregated and
     * associated objects as well as event handlers.
     * 
     * If the name of a setting is ambiguous (e.g. a property has the same name as an event), then the framework assumes
     * property, aggregation, association, event in that order. To override this automatic resolution, one of the
     * prefixes "aggregation:", "association:" or "event:" can be added to the name of the setting (such a prefixed name
     * must be enclosed in single or double quotes).
     * 
     * The supported settings are:
     * <ul>
     * <li>Properties
     * <ul>
     * <li>{@link #getStatus status} : string (default: 'Normal')</li>
     * <li>{@link #getPreview preview} : sap.ui.core.URI</li>
     * <li>{@link #getImage image} : sap.ui.core.URI</li>
     * </ul>
     * </li>
     * <li>Aggregations
     * <ul>
     * </ul>
     * </li>
     * <li>Associations
     * <ul>
     * </ul>
     * </li>
     * <li>Events
     * <ul>
     * </ul>
     * </li>
     * </ul>
     * 
     * 
     * In addition, all settings applicable to the base type
     * {@link sap.ino.wall.WallItemBase#constructor sap.ino.wall.WallItemBase} can be used as well.
     * 
     * @param {string}
     *            [sId] id for the new control, generated automatically if no id is given
     * @param {object}
     *            [mSettings] initial settings for the new control
     * 
     * @class Add your documentation for the WallItemImage
     * @extends sap.ino.wall.WallItemBase
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.WallItemImage
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ino.wall.WallItemBase.extend("sap.ino.wall.WallItemImage", {
        metadata : {
            properties : {
                "status" : {
                    type : "string",
                    group : "Appearance",
                    defaultValue : 'Normal'
                },
                "preview" : {
                    type : "sap.ui.core.URI",
                    group : "Data",
                    defaultValue : null
                },
                "image" : {
                    type : "sap.ui.core.URI",
                    group : "Data",
                    defaultValue : null
                },
                "assignmentId" : {
                    type : "int",
                    group : "Identification",
                    defaultValue : -1
                },
                "showAsIcon" : {
                    type : "boolean",
                    group : "Appearance",
                    defaultValue : false
                }
            },
            aggregations : {
                "_icon" : {
                    type : "sap.ui.core.Icon",
                    multiple : false,
                    visibility : "hidden"
                },
                "imagePreview" : {
                    type : "sap.m.Image",
                    multiple : false,
                    visibility : "hidden"
                },
                "imageLarge" : {
                    type : "sap.m.Image",
                    multiple : false,
                    visibility : "hidden"
                },
                "_busyIndicator" : {
                    type : "sap.m.BusyIndicator",
                    multiple : false,
                    visibility : "hidden"
                },
                "_dropUpload" : {
                    type : "sap.ino.wall.DropUpload",
                    multiple : false,
                    visibility : "hidden"
                },
                "_checkBox" : {
                    type : "sap.m.CheckBox",
                    multiple : false,
                    visibility : "hidden"
                },
                "_lightBox" : {
                    type : "sap.ino.wall.LightBox",
                    multiple : false,
                    visibility : "hidden"
                }
            }
        }
    });

    /**
     * Creates a new subclass of class sap.ino.wall.WallItemImage with name <code>sClassName</code> and enriches it
     * with the information contained in <code>oClassInfo</code>.
     * 
     * <code>oClassInfo</code> might contain the same kind of informations as described in
     * {@link sap.ui.core.Element.extend Element.extend}.
     * 
     * @param {string}
     *            sClassName name of the class to be created
     * @param {object}
     *            [oClassInfo] object literal with informations about the class
     * @param {function}
     *            [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to
     *            sap.ui.core.ElementMetadata.
     * @return {function} the created class / constructor function
     * @public
     * @static
     * @name sap.ino.wall.WallItemImage.extend
     * @function
     */

    /**
     * Getter for property <code>status</code>. The status of the image item. If set to "Busy" a busy indicator will
     * overlay the preview to indicate that the image is currently uploaded.
     * 
     * Default value is <code>Normal</code>
     * 
     * @return {string} the value of property <code>status</code>
     * @public
     * @name sap.ino.wall.WallItemImage#getStatus
     * @function
     */

    /**
     * Setter for property <code>status</code>.
     * 
     * Default value is <code>Normal</code>
     * 
     * @param {string}
     *            sStatus new value for property <code>status</code>
     * @return {sap.ino.wall.WallItemImage} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemImage#setStatus
     * @function
     */

    /**
     * Getter for property <code>preview</code>. The preview image URI.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {sap.ui.core.URI} the value of property <code>preview</code>
     * @public
     * @name sap.ino.wall.WallItemImage#getPreview
     * @function
     */

    /**
     * Setter for property <code>preview</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {sap.ui.core.URI}
     *            sPreview new value for property <code>preview</code>
     * @return {sap.ino.wall.WallItemImage} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemImage#setPreview
     * @function
     */

    /**
     * Getter for property <code>image</code>. The large image URI to be displayed when clicking on the preview.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {sap.ui.core.URI} the value of property <code>image</code>
     * @public
     * @name sap.ino.wall.WallItemImage#getImage
     * @function
     */

    /**
     * Setter for property <code>image</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {sap.ui.core.URI}
     *            sImage new value for property <code>image</code>
     * @return {sap.ino.wall.WallItemImage} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemImage#setImage
     * @function
     */

    sap.ino.wall.WallItemImage._CAPTION_HEIGHT = 20;

    /**
     * Initializes the control
     * 
     * @private
     */
    sap.ino.wall.WallItemImage.prototype.init = function() {
        sap.ino.wall.WallItemBase.prototype.init.call(this);

        this.setResizable(true);
    };

    /*******************************************************************************************************************
     * overloaded setters to supress rendering and update ui
     ******************************************************************************************************************/

    sap.ino.wall.WallItemImage.prototype.setImage = function(sURI) {
        var oOldImage = this.getAggregation("imageLarge");

        // TODO: try this without re-rendering
        // this.setProperty("image", sURI, (oOldImage ? true : false));
        this.setProperty("image", sURI, true);
        if (oOldImage) {
            oOldImage.destroy(true);
        }
        this.setAggregation("imageLarge", new sap.m.Image({
            src : sURI,
            densityAware : false
        }), true);

        if (this._isRendered()) {
            this.$().find("#" + this.getId() + "-imagePreviewWrapper").children("a").attr("href", sURI);
            this._renderItemIntoContainer(this.$().find("#" + this.getId() + "-imagePreviewWrapper").children("a")[0], this.getAggregation("imagePreview"), false, true);
            // inform wall that this item has changed a persistence property
            if (this.getParent()) {
                this.getParent()._notifyItemChanged(this);
            }
        }
        return this;
    };

    sap.ino.wall.WallItemImage.prototype.setAssignmentId = function(iID) {

        this.setProperty("assignmentId", iID, true);

        // inform wall that this item has changed a persistence property
        if (this.getParent()) {
            this.getParent()._notifyItemChanged(this);
        }
        return this;
    };

    sap.ino.wall.WallItemImage.prototype.setShowAsIcon = function(bValue) {

        this.setProperty("showAsIcon", bValue, true);

        if (this._isRendered()) {
            jQuery(this._getCheckBox().getDomRef()).prop("'checked", bValue);
            var oFront = this.$().find(".front");
            var oTitle = oFront.find(".sapInoWallWITitle");
            var oResizeHandle = oFront.find(".sapInoWallWIResizeHandle");
            if (bValue) {
                oFront.removeClass("sapInoWallWII");
                oTitle.addClass("sapInoWallWIITitleIcon");
                oResizeHandle.addClass("sapInoWallWIResizeHandleHidden");
            } else {
                oFront.addClass("sapInoWallWII");
                oTitle.removeClass("sapInoWallWIITitleIcon");
                oResizeHandle.removeClass("sapInoWallWIResizeHandleHidden");
            }
        }

        // inform wall that this item has changed a persistence property
        if (this.getParent()) {
            this.getParent()._notifyItemChanged(this);
        }
        return this;
    };

    /**
     * sets the width of the item and the internal preview image
     * 
     * @param {string}
     *            sValue the css width value
     * @public
     * @override
     */
    sap.ino.wall.WallItemImage.prototype.setW = function(sValue) {
        var oPreview = this.getAggregation("imagePreview");
        if (oPreview) {
            if (parseInt(sValue, 10) < parseInt(this.$().css("min-width"), 10)) {
                sValue = this.$().css("min-width");
            }
            oPreview.setProperty("width", sValue, true);
            oPreview.$().width(sValue);
        }
        sap.ino.wall.WallItemBase.prototype.setW.apply(this, [sValue]);
    };

    /**
     * sets the width of the item and the internal preview image
     * 
     * @param {string}
     *            sValue the css height value
     * @public
     * @override
     */
    sap.ino.wall.WallItemImage.prototype.setH = function(sValue) {
        var oPreview = this.getAggregation("imagePreview"), sPreviewHeight = sValue;
        if (oPreview) {
            if (!this.getShowAsIcon()) {
                if (parseInt(sValue, 10) > sap.ino.wall.WallItemImage._CAPTION_HEIGHT) {
                    sPreviewHeight = (parseInt(sValue, 10) - sap.ino.wall.WallItemImage._CAPTION_HEIGHT) + "px";
                }
            }
            if (parseInt(sPreviewHeight, 10) < parseInt(this.$().css("min-height"), 10)) {
                sPreviewHeight = this.$().css("min-height");
            }
            oPreview.setProperty("height", sPreviewHeight, true);
            oPreview.$().height(sPreviewHeight);
        }
        sap.ino.wall.WallItemBase.prototype.setH.apply(this, [sValue]);
    };

    sap.ino.wall.WallItemImage.prototype.setPreview = function(sURI, bUpdateDimensions) {
        /* as we do not have a calculated preview, we always start w/ 150x130 px */
        // TODO keep aspect ratio
        if (isNaN(parseInt(this.getW(), 10)) || isNaN(parseInt(this.getH(), 10))) {
            this.setW("150px", true);
            this.setH("130px", true);
        }

        var that = this, oOldImage = this.getAggregation("imagePreview"), oNewImage = null, oDomRef, fnImageOnload = function(oEvent) {
            var $DomNode;

            // call original function
            if (sap.m.Image.prototype.onload) {
                sap.m.Image.prototype.onload.apply(this, arguments);
            }

            // hide busy indicator after loading the preview
            that.setStatus("Normal");

            $DomNode = this.$();

            var $that = sap.ui.getCore().byId(that.getId());
            var $Preview = sap.ui.getCore().byId(that.getId() + "-preview");

            if ($that) {
                $that.removeStyleClass("sapInoWallWIIImageError");
            }
            if ($Preview) {
                $Preview.removeStyleClass("sapInoWallInvisible");
            }

            // set width and height in image control (missing feature in sap.m.Image)
            if ($DomNode.width()) {
                this.setProperty("width", $DomNode.width() + "px", true);
            }
            if ($DomNode.height()) {
                this.setProperty("height", $DomNode.height() + "px", true);
            }

            if (bUpdateDimensions) {
                // set width and height in WallItemImage according to image
                var fImageWidth = parseFloat(this.getWidth(), 10);
                var fImageHeight = parseFloat(this.getHeight(), 10);
                var fItemWidth = parseFloat(that.getW(), 10)
                var fItemHeight = parseFloat(that.getH(), 10);
                if (fImageWidth > fItemWidth || fImageHeight > fItemHeight) {
                    var fImageRatio = fImageWidth / fImageHeight;
                    if (fImageRatio >= 1.0) {
                        var fNewItemWidth = fItemHeight * fImageRatio;
                        that.setWH(fNewItemWidth + "px", that.getH());
                    } else {
                        var fNewItemHeight = fItemWidth / fImageRatio;
                        fNewItemHeight = fNewItemHeight + (that.getTitle() ? sap.ino.wall.WallItemImage._CAPTION_HEIGHT : 0);
                        that.setWH(that.getW(), fNewItemHeight + "px");                    
                    }
                } else {
                    var fNewItemHeight = parseFloat(this.getHeight(), 10);
                    fNewItemHeight = fNewItemHeight + (that.getTitle() ? sap.ino.wall.WallItemImage._CAPTION_HEIGHT : 0);
                    that.setWH(this.getWidth(), fNewItemHeight + "px");
                }
                // for browsers with no flex support we have to recalc the dimensions here as well
                that._onResize(true);
            } else {
                // set width and height of image according to WallItemImage
                sap.ui.getCore().byId(that.getId() + "-preview").$().width(that.getW()).height(that.getTitle() ? parseFloat(that.getH(), 10) - sap.ino.wall.WallItemImage._CAPTION_HEIGHT + "px" : that.getH());
            }
        }, fnImageOnError = function(oEvent) {
            // set an error image if something went wrong
            var $that = sap.ui.getCore().byId(that.getId());
            var $Preview = sap.ui.getCore().byId(that.getId() + "-preview");

            that.setStatus("Normal");

            if ($that && !$that.hasStyleClass("sapInoWallWIIImageError")) {
                $that.addStyleClass("sapInoWallWIIImageError");
            }
            if ($Preview && !$Preview.hasStyleClass("sapInoWallInvisible")) {
                $Preview.addStyleClass("sapInoWallInvisible");
                $Preview.setSrc("");
            }
        }, sImageStorageId = (/.xsjs\/([0-9]*)$/.exec(sURI) || {})[1];

        // restore image storage id from URL (could also be a property)
        if (sImageStorageId) {
            this._iImageStorageId = parseInt(sImageStorageId, 10);
        }

        // re-rendering, replace it with a DOM manipulation
        this.setProperty("preview", sURI, true);
        if (oOldImage) {
            oOldImage.destroy(true);
        }

        // create new image and override onload event method to adjust our width and height
        oNewImage = new sap.m.Image(this.getId() + "-preview", {
            src : sURI,
            densityAware : false,
            //width : this.getW(),
            //height : this.getTitle() ? parseFloat(this.getH(), 10) - sap.ino.wall.WallItemImage._CAPTION_HEIGHT + "px" : this.getH(),
            press : function() {
                var oParent = this.getParent();
                // if it is a child, the wall is the parent's parent
                if (oParent instanceof sap.ino.wall.WallItemBase) {
                    oParent = oParent.getParent();
                }

                // only open the image when no drag is in progress
                if (!this._bMoving && this.getImage() && !oParent._hasFollowCursorItems()) {
                    if (this.getShowAsIcon()) {
                        this.setFlipped(true);
                    } else {
                        this._showLargeImage();
                    }
                }
            }.bind(this)
        }).addEventDelegate({
            // only density-aware images call onload/onerror in the current implementation but we don't have a
            // high-res picture so we need to register the handlers by ourselves
            onBeforeRendering : function(oEvent) {
                var oImage = oEvent.srcControl, $image = oImage.$();

                // unbind the load and error event handler
                $image.unbind("load", oImage.___onloadproxy);
                $image.unbind("error", oImage.___onloadproxy);
            },
            onAfterRendering : jQuery.proxy(function(oEvent) {
                var oImage = oEvent.srcControl, $image = oImage.$();

                // set an internal pointer inside sap.m.Image
                if (!oImage.___onloadproxy) {
                    oImage.___onloadproxy = jQuery.proxy(oImage.onload, oImage);
                    oImage.___onerrorproxy = jQuery.proxy(oImage.onerror, oImage);
                }
                // bind the load and error event handler
                $image.bind("load", jQuery.proxy(oImage.___onloadproxy, oImage));
                $image.bind("error", jQuery.proxy(oImage.___onerrorproxy, oImage));
            }, oNewImage)
        });
        // we add our custom handlers to do stuff that is currently not possible with sap.m.Image
        oNewImage.onload = fnImageOnload;
        oNewImage.onerror = fnImageOnError;

        this.setAggregation("imagePreview", oNewImage, true);

        if (this._isRendered()) {
            // set the old image dimensions first to remove flickering while new image is loaded
            if (!bUpdateDimensions && !isNaN(parseInt(that.getW(), 10)) && !isNaN(parseInt(that.getH(), 10))) {
                oNewImage.setProperty("width", that.getW(), true);
                oNewImage.setProperty("height", this.getTitle() ? parseFloat(this.getH(), 10) - sap.ino.wall.WallItemImage._CAPTION_HEIGHT + "px" : this.getH(), true);
            }
            this.setStatus("Busy");

            // render the image into the DOM structure without re-rendering the whole item
            oDomRef = this.$().find(".sapInoWallWIIImageWrapper")[0];
            this._renderItemIntoContainer(oDomRef, oNewImage, true, false);

            // inform wall that this item has changed a persistence property
            if (this.getParent()) {
                this.getParent()._notifyItemChanged(this);
            }
        }
        return this;
    };

    sap.ino.wall.WallItemImage.prototype._uploadImage = function(oEvent) {
        var that = this, aFiles = oEvent.getParameter("files"), oFile, sFilename, oFormData, oReader, iStorageId;

        // display an error if user tries to drop a file with IE9
        if (sap.ui.Device.browser.name === "ie" && sap.ui.Device.browser.version < 10 && aFiles === undefined) {
            return;
        }

        // hide drag preview
        jQuery.sap.byId(this.getParent().getId() + "-drag").css("display", "none");

        // reset cursor to normal
        this.$().removeClass("dragCursor");

        if (aFiles.length !== 0) {
            oFile = aFiles[0];
            if (!!oFile.type.match(/image\.*/)) {
                that.setStatus("Busy");
                that.setFlipped(false);
                sap.ino.commons.models.object.Attachment.uploadFile(oFile).done(function(oResponse) {
                    var iStorageId = oResponse.attachmentId;
                    var sFileName = oResponse.fileName;
                    setTimeout(function() {
                        that.setPreview(Configuration.getAttachmentDownloadURL(iStorageId), true);
                        that.setImage(Configuration.getAttachmentDownloadURL(iStorageId));
                        if (!that.getTitle() || that.getTitle() === that._oRB.getText("WALL_ITEMIMAGE_NEW_TEXT")) {
                            that.setTitle(sFileName);
                        }
                        that._iImageStorageId = iStorageId;
                    }, 500);
                }).fail(function(oResponse) {
                    // TODO: Handle error
                });
            }
        }
    };

    /**
     * Hook called when the item has been resized by user interaction
     * 
     * @param {boolean}
     *            bSytemCall true when called by system call and not by user interaction
     * @oaram {float} fDeltaX the amount in px the item has been resized
     * @oaram {float} fDeltaY the amount in px the item has been resized
     * @protected
     */
    sap.ino.wall.WallItemImage.prototype._onResize = function(bSystemCall, fDeltaX, fDeltaY) {
        var iFixHeight;

        /* we currently do not support a real preview => no rebind required */
        /*
         * // schedule preview re-rendering if (!bSystemCall && this._iImageStorageId && this.getStatus() !== "Busy") {
         * clearTimeout(this._iPreviewUpdateTimer); this._iPreviewUpdateTimer = setTimeout(function() { var fW =
         * parseFloat(this.getW(), 10), fH = parseFloat(this.getH(), 10); //
         * this.setPreview(Config.getBackendImageServiceProviderUrl() + // '?action=scalenew&x=' + (fW) + '&y=' +
         * (this.getTitle() ? fH - // sap.ino.wall.WallItemImage._CAPTION_HEIGHT : fH) + '&id=' +
         * this._iImageStorageId); this.setPreview(Configuration.getAttachmentDownloadURL(this._iImageStorageId));
         * }.bind(this), 1000); }
         */

        // back side: flex workaround
        // workaround for no flex support & Safari & IE10
        if (!jQuery.support.hasFlexBoxSupport || sap.ui.Device.browser.safari || sap.ui.Device.browser.internet_explorer && sap.ui.Device.browser.version === 10) {
            // back
            iFixHeight = this.$().find(".back .sapInoWallWIIitleEdit").outerHeight() + 10;
            this.$().find(".back .sapInoWallWIIPreviewEdit").height(this.$().find(".back").height() - iFixHeight);
            this.$().find(".back .sapInoWallDropUpload").height(this.$().find(".back .sapInoWallWIIPreviewEdit").height());
            this.$().find(".back .sapInoWallDropUploadArea").css("height", this.$().find(".back .sapInoWallDropUpload").height() + "px");
        }
        this._adjustTShirtSize();
    };

    /*******************************************************************************************************************
     * overloaded setters to supress rendering and update ui
     ******************************************************************************************************************/

    sap.ino.wall.WallItemImage.prototype.setTitle = function(sTitle, bSuppressNotify) {
        sap.ino.wall.WallItemBase.prototype.setTitle.apply(this, [sTitle, bSuppressNotify]);
        if (sTitle !== this._oRB.getText("WALL_ITEMIMAGE_NEW_TEXT")) {
            this._getInputTitle().setValue(sTitle);
            this._getInputTitle().$().children("input").attr("value", sTitle);
        }
    };

    /**
     * Lazy initialization of control managed in an internal aggregation
     * 
     * @private
     * @returns {sap.m/BusyIndicator} the control
     */

    sap.ino.wall.WallItemImage.prototype._getBusyIndicator = function() {
        var oBusyIndicator = this.getAggregation("_busyIndicator");

        if (!oBusyIndicator) {
            // create control
            oBusyIndicator = new sap.m.BusyIndicator(this.getId() + "-busy").addStyleClass("sapInoWallIndicatorBusy");

            // set hidden aggregation without rerendering
            this.setAggregation("_busyIndicator", oBusyIndicator, true);
        }

        return oBusyIndicator;
    };

    /**
     * Lazy initialization of a control managed in an internal aggregation
     * 
     * @private
     * @returns {sap.ui.core/Control} the control
     */
    sap.ino.wall.WallItemImage.prototype._getDropUpload = function() {
        var oControl = this.getAggregation("_dropUpload");

        if (!oControl) {
            // create control
            oControl = new sap.ino.wall.DropUpload({
                size : "L",
                change : [this._uploadImage, this]
            });

            // set hidden aggregation without rerendering
            this.setAggregation("_dropUpload", oControl, true);
        }

        return oControl;
    };

    /**
     * Lazy initialization of a control managed in an internal aggregation
     * 
     * @private
     * @returns {sap.ui.core/Control} the control
     */
    sap.ino.wall.WallItemImage.prototype._getLightBox = function() {
        var oControl = this.getAggregation("_lightBox");
        if (oControl) {
            this.removeAggregation("_lightBox");
            oControl = null;
        }
        // create control
        oControl = new sap.ino.wall.LightBox({
            image : this.getImage(),
            title : this.getTitle()
        });

        // set hidden aggregation without rerendering
        this.setAggregation("_lightBox", oControl, true);
        return oControl;
    };

    sap.ino.wall.WallItemImage.prototype._getCheckBox = function() {
        var that = this;
        var oControl = this.getAggregation("_checkBox");

        if (!oControl) {
            // create control
            oControl = new sap.m.CheckBox({
                text : this._oRB.getText("WALL_ITEMIMAGE_SHOW_AS_ICON"),
                selected : this.getShowAsIcon(),
                select : function(oEvent) {
                    that.setShowAsIcon(oEvent.getSource().getSelected());
                }
            });

            // set hidden aggregation without rerendering
            this.setAggregation("_checkBox", oControl, true);
        }

        return oControl;
    };

    sap.ino.wall.WallItemImage.prototype._getIcon = function() {
        var oControl = this.getAggregation("_icon");
        var that = this;
        var iSize = 100;
        var sIcon = "sap-icon://picture";
        if (!oControl) {
            // create control
            oControl = new sap.ui.core.Icon({
                src : sIcon,
                size : iSize + "px",
                width : "100%",
                height : "0px",
                decorative : true
            });
            // set hidden aggregation without rerendering
            this.setAggregation("_icon", oControl, true);
        }
        return oControl;
    };

    /**
     * Instantiates a dialog with the large version of the image
     * 
     * @private
     * @returns {sap.ui.core/Control} the control
     */
    sap.ino.wall.WallItemImage.prototype._showLargeImage = function() {
        this._getLightBox().open();
    };

    /*
     * Shows/hides a busy indicator when uploading imaged without rerendering @override
     */
    sap.ino.wall.WallItemImage.prototype.setStatus = function(sStatus) {
        this.setProperty("status", sStatus, true);
        if (this._isRendered()) {
            var $Busy = sap.ui.getCore().byId(this.getId() + "-busy");
            var $Preview = sap.ui.getCore().byId(this.getId() + "-preview");

            if (this.getStatus() === "Busy") {
                if ($Busy) {
                    $Busy.removeStyleClass("sapInoWallInvisible");
                }
                if ($Preview) {
                    $Preview.addStyleClass("sapInoWallImageBusy");
                }
            } else {
                if ($Busy) {
                    $Busy.addStyleClass("sapInoWallInvisible");
                }
                if ($Preview) {
                    $Preview.removeStyleClass("sapInoWallImageBusy");
                }
            }
        }
    };

    sap.ino.wall.WallItemImage.prototype.onAfterRendering = function() {
        if (this._isRendered()) {
            var oFront = this.$().find(".front");
            var oResizeHandle = oFront.find(".sapInoWallWIResizeHandle");
            if (this.getShowAsIcon()) {
                oResizeHandle.addClass("sapInoWallWIResizeHandleHidden");
            } else {
                oResizeHandle.removeClass("sapInoWallWIResizeHandleHidden");
            }
        }
    };

    /**
     * creates a minimalic JSON representation of the item to be stored in the db
     * 
     * @param {string}
     *            sColor color identifier
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemImage.prototype.formatToJSON = function() {
        // call the base object's JSON method
        var oJSON = sap.ino.wall.WallItemBase.prototype.formatToJSON.call(this);
        // add properties of this control
        if (this.getImage()) {
            oJSON.content.image = this.getImage();
            oJSON.content.assignmentId = this.getAssignmentId();
            oJSON.content.preview = this.getPreview();
        }
        oJSON.content.showAsIcon = this.getShowAsIcon();
        // return the final object
        return oJSON;
    };

})();