/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.WallItemVideo");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBase");
    jQuery.sap.require("sap.ino.wall.util.Formatter");

    /**
     * Constructor for a new WallItemVideo.
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
     * <li>{@link #getVideo video} : sap.ui.core.URI</li>
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
     * @name sap.ino.wall.WallItemVideo
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ino.wall.WallItemBase.extend("sap.ino.wall.WallItemVideo", {
        metadata : {
            properties : {
                "status" : {
                    type : "string",
                    group : "Behavior",
                    defaultValue : 'Normal'
                },
                "preview" : {
                    type : "sap.ui.core.URI",
                    group : "Behavior",
                    defaultValue : null
                },
                "video" : {
                    type : "sap.ui.core.URI",
                    group : "Behavior",
                    defaultValue : null
                }
            },
            aggregations : {
                "textAreaDescription" : {
                    type : "sap.m.TextArea",
                    multiple : false,
                    visibility : "hidden"
                },
                "imagePreview" : {
                    type : "sap.m.Image",
                    multiple : false,
                    visibility : "hidden"
                },
                "_busyIndicator" : {
                    type : "sap.m.BusyIndicator",
                    multiple : false,
                    visibility : "hidden"
                },
                "_inputVideo" : {
                    type : "sap.m.Input",
                    multiple : false,
                    visibility : "hidden"
                }
            }
        }
    });

    /**
     * Creates a new subclass of class sap.ino.wall.WallItemVideo with name <code>sClassName</code> and enriches it
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
     * @name sap.ino.wall.WallItemVideo.extend
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
     * @name sap.ino.wall.WallItemVideo#getStatus
     * @function
     */

    /**
     * Setter for property <code>status</code>.
     * 
     * Default value is <code>Normal</code>
     * 
     * @param {string}
     *            sStatus new value for property <code>status</code>
     * @return {sap.ino.wall.WallItemVideo} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemVideo#setStatus
     * @function
     */

    /**
     * Getter for property <code>preview</code>. The preview image URI.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {sap.ui.core.URI} the value of property <code>preview</code>
     * @public
     * @name sap.ino.wall.WallItemVideo#getPreview
     * @function
     */

    /**
     * Setter for property <code>preview</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {sap.ui.core.URI}
     *            sPreview new value for property <code>preview</code>
     * @return {sap.ino.wall.WallItemVideo} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemVideo#setPreview
     * @function
     */

    /**
     * Getter for property <code>video</code>. The large video URI to be embedded when clicking on the preview.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {sap.ui.core.URI} the value of property <code>video</code>
     * @public
     * @name sap.ino.wall.WallItemVideo#getVideo
     * @function
     */

    /**
     * Setter for property <code>video</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {sap.ui.core.URI}
     *            sVideo new value for property <code>video</code>
     * @return {sap.ino.wall.WallItemVideo} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemVideo#setVideo
     * @function
     */

    /*******************************************************************************************************************
     * overloaded setters to supress rendering and update ui
     ******************************************************************************************************************/

    sap.ino.wall.WallItemVideo.prototype.setPreview = function(sURI) {
        var oOldImage = this.getAggregation("imagePreview");

        this.setProperty("preview", sURI, false);
        if (oOldImage) {
            oOldImage.destroy(true);
        }
        this.setAggregation("imagePreview", new sap.m.Image({
            src : sURI,
            densityAware : false
        }), true);
        this.getAggregation("imagePreview").setWidth("240px");

        // set an error image if something went wrong
        if (!this.getAggregation("imagePreview") || !this.getAggregation("imagePreview").getSrc()) { // TODO: better
            // error
            // handling
            this.setAggregation("imagePreview", new sap.m.Image({
                src : "",
                densityAware : false,
                decorative : true
            }).addStyleClass("sapInoWallWIVVideoError"), true);
        }

        if (this._isRendered()) {
            // render new item

            this._renderItemIntoContainer(this.$().find("#" + this.getId() + "-imagePreviewWrapper"), this.getAggregation("imagePreview"), true, false);

            // inform wall that this item has changed a persistence property
            if (this.getParent()) {
                this.getParent()._notifyItemChanged(this);
            }
        }
        return this;
    };

    sap.ino.wall.WallItemVideo.prototype.setVideo = function(sURI) {
        var oOldImage = this.getAggregation("imagePreview"), aVideoIds = null, sVideoId = null;
        
        if (sURI && sURI.indexOf("http://") != 0 && sURI.indexOf("https://") != 0 && sURI.indexOf("mailto:") != 0) {
            sURI = "http://" + sURI;
        }

        if (jQuery.sap.validateUrl(sURI)) {
            
            this.setProperty("video", sURI, false);
            if (oOldImage) {
                oOldImage.destroy();
            }
            
            this._getInputVideo().setValueState("None");
        
            // try to extract a new preview image for the video URL by retrieving the id from the URL
            if (/www\.youtube\.com/.test(sURI)) {
                // youtube id extraction
                // format: www.youtube.com/watch?v=[id]
                aVideoIds = /www\.youtube\.com\/watch\?v=([^&]+)/.exec(sURI);
                if (!aVideoIds) {
                    // format: www.youtube.com/v/[id]
                    aVideoIds = /www\.youtube\.com\/v\/([^&]+)/.exec(sURI);
                }
                if (!aVideoIds) {
                    // format: www.youtube.com/embed/[id]
                    aVideoIds = /www\.youtube\.com\/embed\/([^?]+)/.exec(sURI);
                }
                if (aVideoIds) {
                    sVideoId = aVideoIds[1];
                    this.setPreview("https://img.youtube.com/vi/" + sVideoId + "/mqdefault.jpg");
                }
            } else if (/youtu\.be/.test(sURI)) {
                // youtube short URL
                aVideoIds = /youtu\.be\/([^?]+)/.exec(sURI);
                if (aVideoIds) {
                    sVideoId = aVideoIds[1];
                    this.setPreview("https://img.youtube.com/vi/" + sVideoId + "/mqdefault.jpg");
                }
            }
        }
        else {
            this._getInputVideo().setValueState("Error");
        }

        return this;
    };

    /*******************************************************************************************************************
     * overloaded setters to supress rendering and update ui
     ******************************************************************************************************************/

    sap.ino.wall.WallItemVideo.prototype.setTitle = function(sTitle, bSuppressNotify) {
        sap.ino.wall.WallItemBase.prototype.setTitle.apply(this, [sTitle, bSuppressNotify]);
        if (sTitle !== this._oRB.getText("WALL_ITEMVIDEO_NEW_TEXT")) {
            this._getInputTitle().setProperty("value", sTitle, true);
            this._getInputTitle().$().children("input").attr("value", sTitle);
        }
    };

    /*
     * Lazy initialization of the internal dialog @private @returns {sap.m/Button} the button
     */

    sap.ino.wall.WallItemVideo.prototype._getBusyIndicator = function() {
        var oBusyIndicator = this.getAggregation("_busyIndicator");

        if (!oBusyIndicator) {
            // create control
            oBusyIndicator = new sap.m.BusyIndicator(this.getId() + "-busy").addStyleClass("sapInoWallIndicatorBusy");

            // set hidden aggregation without rerendering
            this.setAggregation("_busyIndicator", oBusyIndicator, true);
        }

        return oBusyIndicator;
    };

    /*
     * Lazy initialization of the internal dialog @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemVideo.prototype._getImagePreview = function() {
        var oPreview = this.getAggregation("imagePreview");

        if (!oPreview) {
            oPreview = new sap.m.Image({
                src : "",
                densityAware : false
            }).addStyleClass("sapInoWallWIVVideoDefault");
            // set hidden aggregation without rerendering
            this.setAggregation("imagePreview", oPreview, true);
        }
        return oPreview;
    };

    /*
     * Lazy initialization of the internal dialog @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemVideo.prototype._getInputVideo = function() {
        var that = this, oInput = this.getAggregation("_inputVideo");

        if (!oInput) {
            // create control
            oInput = new sap.m.Input({
                value : sap.ino.wall.util.Formatter.escapeBindingCharacters(this.getVideo()),
                placeholder : this._oRB.getText("WALL_ITEMVIDEO_PLACEHOLDER_LINK"),
                change : function(oEvent) {
                    that.setVideo(oEvent.getParameter("newValue"));
                }
            }).addStyleClass("sapInoWallWIVVideo");

            // set hidden aggregation without rerendering
            this.setAggregation("_inputVideo", oInput, true);
        }

        return oInput;
    };

    /*
     * Shows/hides a busy indicator when uploading imaged without rerendering @override
     */
    sap.ino.wall.WallItemVideo.prototype.setStatus = function(sStatus) {
        this.setProperty("status", sStatus, true);
        if (this._isRendered()) {
            if (this.getStatus() === "Busy") {
                sap.ui.getCore().byId(this.getId() + "-busy").removeStyleClass("sapInoWallInvisible");
                sap.ui.getCore().byId(this.getId() + "-preview").addStyleClass("sapInoWallImageBusy");
            } else {
                sap.ui.getCore().byId(this.getId() + "-busy").addStyleClass("sapInoWallInvisible");
                sap.ui.getCore().byId(this.getId() + "-preview").removeStyleClass("sapInoWallImageBusy");
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
    sap.ino.wall.WallItemVideo.prototype.formatToJSON = function() {
        // call the base object's JSON method
        var oJSON = sap.ino.wall.WallItemBase.prototype.formatToJSON.call(this);
        // add properties of this control
        oJSON.content.video = this.getVideo();
        oJSON.content.preview = this.getPreview();
        // return the final object
        return oJSON;
    };

})();