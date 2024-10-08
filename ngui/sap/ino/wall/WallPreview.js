/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.WallPreview");
jQuery.sap.declare("sap.ino.wall.Helper");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.util.Formatter");
    jQuery.sap.require("sap.ino.wall.util.Helper");
    jQuery.sap.require("sap.ino.wall.DocumentType");
    jQuery.sap.require("sap.ino.wall.Wall");

    /**
     * Constructor for a new WallPreview.
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
     * <li>{@link #getMode mode} : string (default: 'wall')</li>
     * <li>{@link #getEnabled enabled} : boolean (default: true)</li>
     * <li>{@link #getNumberOfItems numberOfItems} : int (default: 0)</li>
     * <li>{@link #getHits hits} : int (default: 0)</li>
     * <li>{@link #getLastUpdate lastUpdate} : string</li>
     * <li>{@link #getOwner owner} : string</li>
     * </ul>
     * </li>
     * <li>Aggregations
     * <ul>
     * </ul>
     * </li>
     * <li>Associations
     * <ul>
     * <li>{@link #getWall wall} : string | sap.ino.wall.Wall</li>
     * </ul>
     * </li>
     * <li>Events
     * <ul>
     * <li>{@link sap.ino.wall.WallPreview#event:press press} : fnListenerFunction or [fnListenerFunction,
     * oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
     * </ul>
     * </li>
     * </ul>
     * 
     * 
     * @param {string}
     *            [sId] id for the new control, generated automatically if no id is given
     * @param {object}
     *            [mSettings] initial settings for the new control
     * 
     * @class Add your documentation for the newWallPreview
     * @extends sap.ui.core.Control
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.WallPreview
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ui.core.Control.extend("sap.ino.wall.WallPreview", {
        metadata : {
            properties : {
                "mode" : {
                    type : "string",
                    group : "Misc",
                    defaultValue : 'wall'
                },
                "enabled" : {
                    type : "boolean",
                    group : "Appearance",
                    defaultValue : true
                },
                "numberOfItems" : {
                    type : "int",
                    group : "Misc",
                    defaultValue : 0
                },
                "hits" : {
                    type : "int",
                    group : "Misc",
                    defaultValue : 0
                },
                "lastUpdate" : {
                    type : "string",
                    group : "Misc",
                    defaultValue : null
                },
                "owner" : {
                    type : "string",
                    group : "Misc",
                    defaultValue : null
                },
                "showRemoveIcon" : {
                    type : "boolean",
                    group : "Misc",
                    defaultValue : false
                },
                "textOnly" : {
                    type : "boolean",
                    group : "Misc",
                    defaultValue : false
                }
            },
            aggregations : {
                "_iconNew" : {
                    type : "sap.ui.core.Icon",
                    multiple : false,
                    visibility : "hidden"
                },
                "_iconTemplate" : {
                    type : "sap.ui.core.Icon",
                    multiple : false,
                    visibility : "hidden"
                },
                "_layoutFooter" : {
                    type : "sap.ui.core.Control",
                    multiple : false,
                    visibility : "hidden"
                },
                "_iconRemove" : {
                    type : "sap.ui.core.Control",
                    multiple : false,
                    visibility : "hidden"
                }
            },
            associations : {
                "wall" : {
                    type : "sap.ino.wall.Wall",
                    multiple : false
                }
            },
            events : {
                "press" : {},
                "remove" : {}
            }
        }
    });

    /**
     * Creates a new subclass of class sap.ino.wall.WallPreview with name <code>sClassName</code> and enriches it
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
     * @name sap.ino.wall.WallPreview.extend
     * @function
     */

    sap.ino.wall.WallPreview.M_EVENTS = {
        'press' : 'press',
        'remove' : 'remove'
    };

    /**
     * Getter for property <code>mode</code>. can be set to "new" or "wall" to define the type of preview (TODO: only
     * for prototype, make this properly)
     * 
     * Default value is <code>wall</code>
     * 
     * @return {string} the value of property <code>mode</code>
     * @public
     * @name sap.ino.wall.WallPreview#getMode
     * @function
     */

    /**
     * Setter for property <code>mode</code>.
     * 
     * Default value is <code>wall</code>
     * 
     * @param {string}
     *            sMode new value for property <code>mode</code>
     * @return {sap.ino.wall.WallPreview} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallPreview#setMode
     * @function
     */

    /**
     * Getter for property <code>enabled</code>. Boolean property to enable the control (default is true).
     * 
     * Default value is <code>true</code>
     * 
     * @return {boolean} the value of property <code>enabled</code>
     * @public
     * @name sap.ino.wall.WallPreview#getEnabled
     * @function
     */

    /**
     * Setter for property <code>enabled</code>.
     * 
     * Default value is <code>true</code>
     * 
     * @param {boolean}
     *            bEnabled new value for property <code>enabled</code>
     * @return {sap.ino.wall.WallPreview} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallPreview#setEnabled
     * @function
     */

    /**
     * Getter for property <code>numberOfItems</code>. blubb
     * 
     * Default value is <code>0</code>
     * 
     * @return {int} the value of property <code>numberOfItems</code>
     * @public
     * @name sap.ino.wall.WallPreview#getNumberOfItems
     * @function
     */

    /**
     * Setter for property <code>numberOfItems</code>.
     * 
     * Default value is <code>0</code>
     * 
     * @param {int}
     *            iNumberOfItems new value for property <code>numberOfItems</code>
     * @return {sap.ino.wall.WallPreview} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallPreview#setNumberOfItems
     * @function
     */

    /**
     * Getter for property <code>hits</code>. blubb
     * 
     * Default value is <code>0</code>
     * 
     * @return {int} the value of property <code>hits</code>
     * @public
     * @name sap.ino.wall.WallPreview#getHits
     * @function
     */

    /**
     * Setter for property <code>hits</code>.
     * 
     * Default value is <code>0</code>
     * 
     * @param {int}
     *            iHits new value for property <code>hits</code>
     * @return {sap.ino.wall.WallPreview} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallPreview#setHits
     * @function
     */

    /**
     * Getter for property <code>lastUpdate</code>. blubb
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {string} the value of property <code>lastUpdate</code>
     * @public
     * @name sap.ino.wall.WallPreview#getLastUpdate
     * @function
     */

    /**
     * Setter for property <code>lastUpdate</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {string}
     *            sLastUpdate new value for property <code>lastUpdate</code>
     * @return {sap.ino.wall.WallPreview} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallPreview#setLastUpdate
     * @function
     */

    /**
     * Getter for property <code>owner</code>. blubb
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {string} the value of property <code>owner</code>
     * @public
     * @name sap.ino.wall.WallPreview#getOwner
     * @function
     */

    /**
     * Setter for property <code>owner</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {string}
     *            sOwner new value for property <code>owner</code>
     * @return {sap.ino.wall.WallPreview} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallPreview#setOwner
     * @function
     */

    /**
     * the wall to be previewed
     * 
     * @return {string} Id of the element which is the current target of the <code>wall</code> association, or null
     * @public
     * @name sap.ino.wall.WallPreview#getWall
     * @function
     */

    /**
     * the wall to be previewed
     * 
     * @param {string |
     *            sap.ino.wall.Wall} vWall Id of an element which becomes the new target of this <code>wall</code>
     *            association. Alternatively, an element instance may be given.
     * @return {sap.ino.wall.WallPreview} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallPreview#setWall
     * @function
     */

    /**
     * This event is fired when the control is clicked
     * 
     * @name sap.ino.wall.WallPreview#press
     * @event
     * @param {sap.ui.base.Event}
     *            oControlEvent
     * @param {sap.ui.base.EventProvider}
     *            oControlEvent.getSource
     * @param {object}
     *            oControlEvent.getParameters
     * @public
     */

    /**
     * Attach event handler <code>fnFunction</code> to the 'press' event of this
     * <code>sap.ino.wall.WallPreview</code>.<br/>. When called, the context of the event handler (its
     * <code>this</code>) will be bound to <code>oListener<code> if specified
     * otherwise to this <code>sap.ino.wall.WallPreview</code>.<br/> itself. 
     *  
     * This event is fired when the control is clicked
     *
     * @param {object}
     *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
     * @param {function}
     *            fnFunction The function to call, when the event occurs.  
     * @param {object}
     *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ino.wall.WallPreview</code>.<br/> itself.
     *
     * @return {sap.ino.wall.WallPreview} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallPreview#attachPress
     * @function
     */

    /**
     * Detach event handler <code>fnFunction</code> from the 'press' event of this
     * <code>sap.ino.wall.WallPreview</code>.<br/>
     * 
     * The passed function and listener object must match the ones used for event registration.
     * 
     * @param {function}
     *            fnFunction The function to call, when the event occurs.
     * @param {object}
     *            oListener Context object on which the given function had to be called.
     * @return {sap.ino.wall.WallPreview} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallPreview#detachPress
     * @function
     */

    /**
     * Fire event press to attached listeners.
     * 
     * @param {Map}
     *            [mArguments] the arguments to pass along with the event.
     * @return {sap.ino.wall.WallPreview} <code>this</code> to allow method chaining
     * @protected
     * @name sap.ino.wall.WallPreview#firePress
     * @function
     */

    /**
     * Initializes the control.
     * 
     * @private
     */
    sap.ino.wall.WallPreview.prototype.init = function() {
        // deactivate text selection on drag events
        this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.wall");
        this.allowTextSelection(false);
    };

    /**
     * Adjusts control after rendering: - renders canvas
     * 
     * @private
     */
    sap.ino.wall.WallPreview.prototype.onAfterRendering = function() {
        if (this.getWallControl()) {
            this._renderCanvas();
        }
    };

    /* =========================================================== */
    /* end: control lifecycle methods */
    /* =========================================================== */

    /**
     * Native tap/click event
     * 
     * @param {jQuery.Event}
     *            oEvent The browser event
     * @private
     */
    sap.ino.wall.WallPreview.prototype.ontap = function(oEvent) {
        if (oEvent.srcControl !== this.getAggregation("_iconRemove")) {
            this.firePress();
        }
    };

    /* =========================================================== */
    /* begin: overrides */
    /* =========================================================== */

    /* =========================================================== */
    /* begin: events */
    /* =========================================================== */

    /* =========================================================== */
    /* begin: API methods */
    /* =========================================================== */

    /**
     * Returns the control for the wall association (convenience method)
     * 
     * @private
     * @returns {Wall} the wall object
     */
    sap.ino.wall.WallPreview.prototype.getWallControl = function() {
        return sap.ui.getCore().byId(this.getWall());
    };

    /**
     * renders a wall to the corresponding preview element
     * 
     * @override
     * @param {sap.ino.wall.Wall}
     *            oWall the wall to be displayed
     * @returns {this} this pointer for chaining
     */
    sap.ino.wall.WallPreview.prototype.setWall = function(oWall) {
        if (oWall instanceof sap.ino.wall.Wall) {
            this.setAssociation("wall", oWall, true);
            this.setMode("Wall");
        } else {
            this.setMode("Error");
        }

        return this;
    };

    sap.ino.wall.WallPreview.prototype.setEnabled = function(bEnabled) {
        this.setProperty("enabled", bEnabled, true);
        if (bEnabled) {
            this.removeStyleClass("sapmUiWallPreviewDisabled");
        } else {
            this.addStyleClass("sapmUiWallPreviewDisabled");
        }
        return this;
    };

    sap.ino.wall.WallPreview.prototype.setShowRemoveIcon = function(bShowRemoveIcon) {
        this.setProperty("showRemoveIcon", bShowRemoveIcon, true);
        return this;
    };

    /* =========================================================== */
    /* begin: internal methods and properties */
    /* =========================================================== */

    /**
     * Formats the hits in a short formal 1000 = 1k, 1000000 = 1m, 1000000000 = 1b etc
     * 
     * @returns {string} the formatted string
     */
    sap.ino.wall.WallPreview.prototype._getShortHits = function() {
        var iHits = this.getHits();
        var sHits = iHits || 1;
        if (iHits > 1000) {
            iHits = Math.floor(iHits / 1000);
            sHits = this._oRB.getText("WALL_ITEMPREVIEW_VIEWS_K", [iHits]);
        } else if (iHits > 1000000) {
            iHits = Math.floor(iHits / 1000000);
            sHits = this._oRB.getText("WALL_ITEMPREVIEW_VIEWS_M", [iHits]);
        } else if (iHits > 1000000000) {
            iHits = Math.floor(iHits / 1000000000);
            sHits = this._oRB.getText("WALL_ITEMPREVIEW_VIEWS_B", [iHits]);
        }
        return sHits;
    };
    
    /**
     * Renders a wall to the corresponding preview element
     * 
     * @param {string}
     *            sId the id of the DOM element
     * @returns {this} this pointer for chaining
     */
    sap.ino.wall.WallPreview.prototype._renderCanvas = function() {
        var that = this, 
            $drawingCanvas = jQuery.sap.byId(this.getId() + "-canvas"), 
            domDrawingCanvas = $drawingCanvas[0], 
            oContext, 
            oWall = this.getWallControl(), 
            sBackgroundImage = oWall.getBackgroundImage(), 
            sBackgroundColor = oWall.getBackgroundColor(), 
            oImg;

        var WALL_BG_IMAGE_PATH = "/sap/ino/ngui/sap/ino/assets/img/wall/bg/";

        // TODO: this might consume too much performance
        // render canvas in wall and only load the image here:
        // Check the element is in the DOM and the browser supports canvas
        if (domDrawingCanvas && domDrawingCanvas.getContext) {
            // Initialize a 2-dimensional drawing oContext
            oContext = domDrawingCanvas.getContext("2d");

            // draw background image
            oImg = new Image();

            oImg.onload = function() { // ...then set the onload handler...
                oContext.drawImage(oImg, 0, 0, oImg.width, oImg.height, 0, 0, 300, Math.max(200, 300 * oImg.height / oImg.width));
                // render items on top of background image
                if (that.getWallControl().getItems().length) {
                    that._renderCanvasItems(oContext, parseInt(domDrawingCanvas.getAttribute("width"), 10), parseInt(domDrawingCanvas.getAttribute("height"), 10));
                }
            };
            oImg.onerror = function() {
                // render items with default image
                if (that.getWallControl().getItems().length) {
                    that._renderCanvasItems(oContext, parseInt(domDrawingCanvas.getAttribute("width"), 10), parseInt(domDrawingCanvas.getAttribute("height"), 10));
                }
            };
            // set image url
            if (sBackgroundImage) {
                if (sBackgroundImage.indexOf("http://") === 0 || sBackgroundImage.indexOf("https://") === 0) {
                    // custom background image
                    oImg.src = sBackgroundImage;
                } else {
                    // standard background image
                    var aStandardImages = sap.ino.wall.util.Helper.getStandardImages();
                    var aPreviewImage = $.grep(aStandardImages, function(o){return o.file === sBackgroundImage;});
                    if (aPreviewImage.length > 0 && aPreviewImage[0].preview) {
                        $drawingCanvas.css("background-image", "url(" + WALL_BG_IMAGE_PATH + aPreviewImage[0].preview +")");
                        $drawingCanvas.css("background-repeat", "repeat");
                        // render items without background image
                        if (that.getWallControl().getItems().length) {
                            that._renderCanvasItems(oContext, parseInt(domDrawingCanvas.getAttribute("width"), 10), parseInt(domDrawingCanvas.getAttribute("height"), 10));
                        }
                    } else {
                        oImg.src = WALL_BG_IMAGE_PATH + sBackgroundImage;
                    }
                }
            } else if (sBackgroundColor) {
                $drawingCanvas.css("background-color", "#" + sBackgroundColor);
                $drawingCanvas.css("background-image", sap.ino.wall.util.Helper.addBrowserPrefix("linear-gradient(top, " + sap.ino.wall.util.Helper.shadeColor(sBackgroundColor, 10) + " 0%, " + sap.ino.wall.util.Helper.shadeColor(sBackgroundColor, -10) + " 100%)"));
                // render items without background image
                if (that.getWallControl().getItems().length) {
                    that._renderCanvasItems(oContext, parseInt(domDrawingCanvas.getAttribute("width"), 10), parseInt(domDrawingCanvas.getAttribute("height"), 10));
                }
            } else {
                oImg.src = "";
            }
        }

        return this;
    };

    sap.ino.wall.WallPreview.prototype._getItemStyle = function(oItem, oContext) {
        var sClassName = oItem.getMetadata()._sClassName.split(".").pop(), oStyle = {};

        // global styles & defaults
        oStyle.shadowColor = "rgba(50, 25, 0, 0.5)";

        switch (sClassName) {
            case "WallItemSticker" :
                // bg colors
                oStyle.shape = "Rect";
                switch (oItem.getColor()) {
                    case "Yellow" :
                        oStyle.bgColor1 = "#fcf294";
                        oStyle.bgColor2 = "#f9e900";
                        oStyle.fontColor = "#140F00";
                        break;
                    case "Pink" :
                        oStyle.bgColor1 = "#e5b0e8";
                        oStyle.bgColor2 = "#d831cd";
                        oStyle.fontColor = "#260822";
                        break;
                    case "Cyan" :
                        oStyle.bgColor1 = "#87e0fd";
                        oStyle.bgColor2 = "#05abe0";
                        oStyle.fontColor = "#001521";
                        break;
                    case "Green" :
                        oStyle.bgColor1 = "#d2ff52";
                        oStyle.bgColor2 = "#91e842";
                        oStyle.fontColor = "#0D1606";
                        break;
                    case "Orange" :
                        oStyle.bgColor1 = "#ffa84c";
                        oStyle.bgColor2 = "#ff7b0d";
                        oStyle.fontColor = "#1C0E01";
                        break;
                    case "Red" :
                        oStyle.bgColor1 = "#ff3019";
                        oStyle.bgColor2 = "#d80404";
                        oStyle.fontColor = "#190000";
                        break;
                    case "Rose" :
                        oStyle.bgColor1 = "#f9d6d6";
                        oStyle.bgColor2 = "#ffb5b5";
                        oStyle.fontColor = "#161210";
                        break;
                    case "Lavender" :
                        oStyle.bgColor1 = "#c4c6ff";
                        oStyle.bgColor2 = "#9ba7db";
                        oStyle.fontColor = "#15171E";
                        break;
                    case "Neutral" :
                        oStyle.bgColor1 = "#ffffff";
                        oStyle.bgColor2 = "#efefef";
                        oStyle.fontColor = "#1C1C1C";
                        break;
                    case "Black" :
                        oStyle.bgColor1 = "#45484d";
                        oStyle.bgColor2 = "#000000";
                        oStyle.fontColor = "#eeeeee";
                        break;
                }
                // border
                oStyle.borderColor = null;
                oStyle.borderWidth = 0;
                // font
                oStyle.fontSize = "30px";
                oStyle.fontFace = "Calibri";
                break;
            case "WallItemText" :
                // bg colors
                oStyle.shape = "Rect";
                oStyle.bgColor1 = "#ffffff";
                oStyle.bgColor2 = "#E5F5E1";
                // border
                oStyle.borderColor = "#89898";
                oStyle.borderWidth = 0;
                // font
                oStyle.fontColor = "#555555";
                break;
            case "WallItemVideo" :
                // bg colors
                oStyle.shape = "Rect";
                oStyle.bgColor1 = "#131313";
                oStyle.bgColor2 = "#1c1c1c";
                // border
                oStyle.borderColor = null;
                oStyle.borderWidth = 0;
                // font
                oStyle.fontColor = "#ffffff";
                // flags
                oStyle.multiLineText = false;
                break;
            case "WallItemImage" :
                // bg colors
                oStyle.shape = "Rect";
                oStyle.bgColor1 = "#e1e1e1";
                oStyle.bgColor2 = "#f6f6f6";
                // border
                oStyle.borderColor = "#9e9e9e";
                oStyle.borderWidth = 4;
                // font
                oStyle.fontColor = "#555555";
                // flags
                oStyle.multiLineText = false;
                break;
            case "WallItemNote" :
                // bg colors
                oStyle.shape = "Rect";
                oStyle.bgColor1 = "#e6f8fd";
                oStyle.bgColor2 = "#b1d8f5";
                // border
                oStyle.borderColor = "#555555";
                oStyle.borderWidth = 4;
                // font
                oStyle.fontColor = "#0000EE";
                break;
            case "WallItemGroup" :
                // bg colors
                oStyle.shape = "Rect";
                // border
                oStyle.borderWidth = 3;
                // font
                oStyle.fontColor = "#ffffff";
                oStyle.shadowColor = "rgba(50, 25, 0, 0.1)";
                oStyle.multiLineText = false;
                break;
            case "WallItemLink" :
                // bg colors
                oStyle.shape = "Circle";
                oStyle.bgColor1 = "#dff6ff";
                oStyle.bgColor2 = "#7bd5fc";
                // border
                oStyle.borderColor = "#3d5000";
                oStyle.borderWidth = 4;
                // font
                oStyle.fontColor = "#ffffff";
                // flags
                oStyle.multiLineText = false;
                break;
            case "WallItemPerson" :
                // bg colors
                oStyle.shape = "Circle";
                oStyle.bgColor1 = "#cff1fc";
                oStyle.bgColor2 = "#87e0fd";
                // border
                oStyle.borderColor = null;
                oStyle.borderWidth = 0;
                // font
                oStyle.fontColor = "#555555";
                break;
            case "WallItemDocument" :
            case "WallItemAttachment" :
                // bg colors
                oStyle.shape = "Rect";
                oStyle.bgColor1 = "#f6f6f6";
                oStyle.bgColor2 = "#ededed";
                // border
                oStyle.borderColor = "#cccccc";
                oStyle.borderWidth = 0;
                // font
                oStyle.fontColor = "#555555";
                // flags
                oStyle.multiLineText = false;
                break;
            case "WallItemLine" :
                oStyle.shape = "Line";
                break;
            case "WallItemHeadline" :
                // bg colors
                oStyle.shape = "Headline";
                oStyle.multiLineText = false;
                switch (oItem.getType()) {
                    case "Clear" :
                        oStyle.bgColor1 = "rgba(235, 235, 235, 0.4)";
                        break;
                    case "Brag" :
                        oStyle.bgColor1 = "#fceabb";
                        oStyle.bgColor2 = "#fbdf93";
                        oStyle.borderColor = "#DD8200";
                        oStyle.borderWidth = 1;
                        break;
                    case "Elegant" :
                        oStyle.bgColor1 = "#7d7e7d";
                        oStyle.bgColor2 = "#0e0e0e";
                        oStyle.borderColor = "#84731E";
                        oStyle.borderWidth = 1;
                        oStyle.fontColor = "#F4D538";
                        break;
                    case "Cool" :
                        oStyle.bgColor1 = "#e4f5fc";
                        oStyle.bgColor2 = "#2ab0ed";
                        oStyle.borderColor = "#0988BF";
                        oStyle.borderWidth = 1;
                        break;
                    case "Simple" :
                        /* falls through */
                    default :
                        oStyle.bgColor1 = "rgba(235, 235, 235, 0.8)";
                }

                // border
                if (!oStyle.borderColor) {
                    oStyle.borderColor = "#cccccc";
                }
                if (!oStyle.borderWidth) {
                    oStyle.borderWidth = 0;
                }
                // font
                if (!oStyle.fontColor) {
                    oStyle.fontColor = "#232323";
                }
                break;
            case "WallItemSprite" :
                // shape
                oStyle.shape = "Circle";
                // border
                oStyle.borderWidth = 3;
                // font
                oStyle.fontColor = "#000000";
                oStyle.fontSize = "30px";
                // flags
                oStyle.multiLineText = false;
                break;
            case "WallItemArrow" :
                oStyle.shape = "Arrow";
                break;
            default :

        }
        if (oStyle.multiLineText === undefined) {
            oStyle.multiLineText = true;
        }
        return oStyle;
    };

    sap.ino.wall.WallPreview.prototype._renderCanvasWord = function(oContext, x1, y1, x2/* , y2 */) {
        var iLineWidth = oContext.lineWidth, iLineLength = iLineWidth, iCurrentX = x1, iDeltaX = x2 - iCurrentX, bUp = true;

        if (iLineWidth < 4) {
            // draw normal line for small items
            oContext.moveTo(x1, y1);
            oContext.lineTo(x2, y1);
        } else {
            // set a smaller line width
            oContext.lineWidth = Math.ceil(iLineWidth / 4);

            // draw zig zag line for larger items

            while (iDeltaX > 0) {
                // cut off last stroke
                iLineLength = Math.min(iDeltaX, iLineWidth);

                // stroke up and down repeatedly
                oContext.moveTo(iCurrentX, y1 + iLineWidth / 3 * (bUp ? 1 : -1));
                oContext.lineTo(iCurrentX + iLineLength, y1 - iLineLength / 3 * (bUp ? 1 : -1));
                iCurrentX += iLineLength - oContext.lineWidth / 2;
                iDeltaX = x2 - iCurrentX;
                // set to 0 on last stroke to finish loop
                if (iLineLength !== iLineWidth) {
                    iDeltaX = 0;
                }
                bUp = !bUp;
            }
        }
        oContext.stroke();

        // reset to original line width
        oContext.lineWidth = iLineWidth;
    };

    sap.ino.wall.WallPreview.prototype._renderLineText = function(oContext, x1, y1, x2, y2, sText) {
        var dx = x2 - x1;
        var dy = y2 - y1;   
        oContext.save();
        oContext.textAlign = "center";
        oContext.translate(x1 + dx * 0.5, y1 + dy * 0.5 - 5);
        oContext.rotate(Math.atan2(dy, dx));
        oContext.fillText(Array(sText.length + 1).join("."), 0, 0, Math.sqrt(dx * dx + dy * dy));
        oContext.restore();
    };
    
    sap.ino.wall.WallPreview.prototype._renderArrowHead = function(oContext, x1, y1, x2, y2, fScaleFactor, bEnd) {
        var radians = 0;
        var x = 0;
        var y = 0;
        if (bEnd) {
            radians = Math.atan((y2 - y1) / (x2 - x1));
            radians += ((x2 > x1) ? 90 : - 90) * Math.PI / 180;
            x = x2;
            y = y2;
        } else {
            radians = Math.atan((y2 - y1) / (x2 - x1));
            radians += ((x2 > x1) ? -90 : 90 ) * Math.PI / 180;
            x = x1;
            y = y1;
        }
        oContext.save();
        oContext.beginPath();
        oContext.translate(x, y);
        oContext.rotate(radians);
        oContext.moveTo(0, 0);
        oContext.lineTo(10 * fScaleFactor, 20 * fScaleFactor);
        oContext.lineTo(-10 * fScaleFactor, 20 * fScaleFactor);
        oContext.closePath();
        oContext.restore();
        oContext.fill();
    };
    
    sap.ino.wall.WallPreview.prototype._renderDashedLine = function(oContext, x1, y1, x2, y2, dashLen) {
        if (dashLen == undefined) {
            dashLen = 2;
        }
        oContext.moveTo(x1, y1);

        var dX = x2 - x1, dY = y2 - y1, dashes = Math.floor(Math.sqrt(dX * dX + dY * dY) / dashLen), dashX = dX / dashes, dashY = dY / dashes, q = 0;

        while (q++ < dashes) {
            x1 += dashX;
            y1 += dashY;
            oContext[q % 2 === 0 ? 'moveTo' : 'lineTo'](x1, y1);
        }
        oContext[q % 2 === 0 ? 'moveTo' : 'lineTo'](x2, y2);
    };

    sap.ino.wall.WallPreview.prototype._renderCanvasItems = function(oContext, iWidth, iHeight) {
        var oWall = this.getWallControl(), aItems = oWall.getItems(), oItem,
        // drawing stuff
        oStyle, oBgGradient,
        // item stuff
        fItemX, fItemY, fItemLeft, fItemTop, fItemWidth, fItemHeight,
        // wall stuff
        aBoundingBox, oUpperLeft, oLowerRight,
        // preview stuff
        iPadding = 10, fScaleFactorX, fScaleFactorY, fScaleFactor = 1, iHeadlineScaleFactor, fDeltaX, fDeltaY, fOffsetX = iPadding, fOffsetY = iPadding, fShadowDistance, iFontSize, iDashLength, fInnerItemLeft, fInnerItemTop, fInnerItemWidth, fInnerItemHeight, iInnerPadding, iCurrentBorderWidth, x, y, w, h, sDocumentColor, fMin, iLineHeight, iLetterSize, oItemText, aWords, iWordSize, iLimit, iCurrentLine, iCurrentPosInLine, fChildrenTop, fChildrenLeft, fChildrenHeight, aChilds, i = 0, j = 0;

        // set default width/height to be more error tolerant
        if (!iWidth) {
            iWidth = 300;
        }
        if (!iHeight) {
            iHeight = 200;
        }

        // calculate bounding box
        aBoundingBox = oWall._calculateBoundingBox();

        // only items on the wall that do not have an impact on the bounding box, we do not need to draw anything
        if (!aBoundingBox) {
            return;
        }

        oUpperLeft = aBoundingBox[0];
        oLowerRight = aBoundingBox[1];
        fDeltaX = oLowerRight.getX() - oUpperLeft.getX();
        fDeltaY = oLowerRight.getY() - oUpperLeft.getY();

        // calculate scale factor based on preview size
        if (fDeltaX !== 0) {
            fScaleFactorX = (iWidth - 2 * iPadding) / fDeltaX;
            fScaleFactorY = (iHeight - 2 * iPadding) / fDeltaY;

            // take the lesser side to scale all items
            fScaleFactor = Math.min(fScaleFactorX, fScaleFactorY);

            // set scaling boundaries to: 0.1 - 2
            fScaleFactor = Math.max(0.1, fScaleFactor);
            fScaleFactor = Math.min(1, fScaleFactor);

            // center item when smaller than preview size
            if (fDeltaX * fScaleFactor < iWidth) {
                fOffsetX = (iWidth - fDeltaX * fScaleFactor) / 2.0;
            }
            if (fDeltaY * fScaleFactor < iHeight) {
                fOffsetY = (iHeight - fDeltaY * fScaleFactor) / 2.0;
            }
        }
        fShadowDistance = 4 * fScaleFactor;

        // order items by depth ascending
        function compare(a, b) {
            if (a.getDepth() < b.getDepth()) {
                return -1;
            } else if (a.getDepth() > b.getDepth()) {
                return 1;
            }
            return 0;
        }
        aItems.sort(compare);

        // draw preview items
        for (; i < aItems.length; i++) {
            oItem = aItems[i];
            oStyle = this._getItemStyle(oItem, oContext);
            fItemX = parseInt(oItem.getX(), 10);
            fItemY = parseInt(oItem.getY(), 10);

            // when items are stored incorrectly we will not display them
            if (isNaN(fItemX) || isNaN(fItemY) || fItemX < 0 || fItemY < 0) {
                continue;
            }

            // use actual width when possible
            fItemWidth = aItems[i].getW();
            fItemHeight = aItems[i].getH();
            if (fItemWidth) {
                fItemWidth = parseInt(fItemWidth, 10);
            }
            if (fItemHeight) {
                fItemHeight = parseInt(fItemHeight, 10);
            }

            // defaults width for non-resizable items and items that do not have w/h set
            if (aItems[i] instanceof sap.ino.wall.WallItemVideo) {
                if (!fItemWidth) {
                    fItemWidth = 250;
                }
                if (!fItemHeight) {
                    fItemHeight = 250;
                }
            } else {
                if (!fItemWidth) {
                    fItemWidth = 150;
                }
                if (!fItemHeight) {
                    fItemHeight = 150;
                }
            }

            // scale units to canvas size
            fItemWidth = fItemWidth * fScaleFactor - 2 * oStyle.borderWidth * fScaleFactor;
            fItemHeight = fItemHeight * fScaleFactor - 2 * oStyle.borderWidth * fScaleFactor;
            fItemLeft = fOffsetX + Math.abs(fItemX - oUpperLeft.getX()) * fScaleFactor;
            fItemTop = fOffsetY + Math.abs(fItemY - oUpperLeft.getY()) * fScaleFactor;
            iFontSize = 12 * fScaleFactor;

            if (oStyle.shape === "Headline") {
                // H4CK: use the number "H1-H6" for size calculation
                // H1 = 1/2, H6 = 2
                iHeadlineScaleFactor = (oItem.getSize().substring(1) ? 4 / (parseInt(oItem.getSize().substring(1), 10) + 3) : 1);
                fItemWidth = fItemWidth * iHeadlineScaleFactor * 1.8 * Math.min(oItem.getTitle().length / 3, 1);
                fItemHeight = fItemHeight / 3 * iHeadlineScaleFactor;
                iFontSize = iFontSize * iHeadlineScaleFactor * 1.5;
                // H4CK: render the modified rectangle now
                oStyle.shape = "Rect";
            }

            /* 1) rectangle */
            if (oStyle.shape === "Rect") {
                // draw shadow
                oContext.fillStyle = oStyle.shadowColor;
                oContext.beginPath();
                oContext.rect(fItemLeft + fShadowDistance, fItemTop + fShadowDistance, fItemWidth, fItemHeight);
                oContext.fill();

                // fill with background
                if (oStyle.bgColor2) {
                    // set up gradient based on current position
                    oBgGradient = oContext.createLinearGradient(0, fItemTop, 0, fItemTop + fItemHeight);
                    oBgGradient.addColorStop(0, oStyle.bgColor1);
                    oBgGradient.addColorStop(1, oStyle.bgColor2);
                    oContext.fillStyle = oBgGradient;
                } else {
                    // use single color from item or from style
                    oContext.fillStyle = (oItem.getColor ? oItem.getColor() : oStyle.bgColor1);
                }

                if (oItem instanceof sap.ino.wall.WallItemGroup) {
                    oContext.fillStyle = sap.ino.wall.util.Helper.transparentColor(oContext.fillStyle, 30);
                }

                oContext.beginPath();
                oContext.rect(fItemLeft, fItemTop, fItemWidth, fItemHeight);
                oContext.fill();

                if (oItem instanceof sap.ino.wall.WallItemGroup) {
                    oContext.fillStyle = (oItem.getColor ? oItem.getColor() : oStyle.bgColor1);
                }

                // stroke if we need an outline
                if (oStyle.borderWidth) {
                    oContext.strokeStyle = (oItem.getColor ? sap.ino.wall.util.Helper.shadeColor(oItem.getColor(), -20) : oStyle.borderColor);
                    oContext.lineWidth = oStyle.borderWidth * fScaleFactor;
                    oContext.stroke();
                }
            } else if (oStyle.shape === "Circle") {
                // draw shadow circle
                oContext.fillStyle = oStyle.shadowColor;
                oContext.beginPath();
                oContext.arc(fItemLeft + fItemWidth / 2 + fShadowDistance, fItemTop + fItemHeight / 2 + fShadowDistance, Math.min(fItemWidth, fItemHeight) / 2, 0, 2 * Math.PI, false);
                oContext.fill();

                // fill with background
                if (oStyle.bgColor2) {
                    // set up gradient based on current position
                    oBgGradient = oContext.createLinearGradient(0, fItemTop, 0, fItemTop + fItemHeight);
                    oBgGradient.addColorStop(0, oStyle.bgColor1);
                    oBgGradient.addColorStop(1, oStyle.bgColor2);
                    oContext.fillStyle = oBgGradient;
                } else {
                    // use single color from item or from style
                    oContext.fillStyle = (oItem.getColor ? oItem.getColor() : oStyle.bgColor1);
                }
                oContext.beginPath();
                oContext.arc(fItemLeft + fItemWidth / 2, fItemTop + fItemHeight / 2, Math.min(fItemWidth, fItemHeight) / 2, 0, 2 * Math.PI, false);
                oContext.fill();

                // stroke if we need an outline
                if (oStyle.borderWidth) {
                    // use style color or darkened item color
                    oContext.strokeStyle = (oItem.getColor ? sap.ino.wall.util.Helper.shadeColor(oItem.getColor(), -20) : oStyle.borderColor);
                    oContext.lineWidth = oStyle.borderWidth * fScaleFactor;
                    oContext.stroke();
                }
            } else if (oStyle.shape === "Line") {
                iDashLength = iWidth;
                oContext.beginPath();
                oContext.strokeStyle = oItem.getColor();
                oContext.lineWidth = oItem.getThickness() * fScaleFactor;
                switch (oItem.getStyle()) {
                    case "DASHED" :
                        iDashLength = oContext.lineWidth * 3;
                        break;
                    case "DOTTED" :
                        iDashLength = oContext.lineWidth;
                        break;
                    case "SOLID" :
                        /* falls through */
                    default :
                        iDashLength = (oItem.getOrientation() === "HORIZONTAL" ? iWidth : iHeight);
                        break;
                }
                if (oItem.getOrientation() === "HORIZONTAL") {
                    if (fItemTop > 0 && fItemTop < iHeight) {
                        this._renderDashedLine(oContext, 0, fItemTop, iWidth, fItemTop, iDashLength);
                        oContext.stroke();
                    }
                } else {
                    if (fItemLeft > 0 && fItemLeft < iWidth) {
                        this._renderDashedLine(oContext, fItemLeft, 0, fItemLeft, iHeight, iDashLength);
                        oContext.stroke();
                    }
                }
                oContext.closePath();
                // nothing else to be done here, skip rendering anything else
                continue;
            } else if (oStyle.shape === "Arrow") {
                var x = fItemLeft;
                var y = fItemTop;
                var x1 = fOffsetX + Math.abs(oItem.getX1() - oUpperLeft.getX()) * fScaleFactor;
                var y1 = fOffsetY + Math.abs(oItem.getY1() - oUpperLeft.getY()) * fScaleFactor;
                var x2 = fOffsetX + Math.abs(oItem.getX2() - oUpperLeft.getX()) * fScaleFactor;
                var y2 = fOffsetY + Math.abs(oItem.getY2() - oUpperLeft.getY()) * fScaleFactor;
                iDashLength = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
                oContext.beginPath();
                oContext.strokeStyle = oItem.getColor();
                oContext.fillStyle = oItem.getColor();
                oContext.lineWidth = oItem.getThickness() * fScaleFactor;
                switch (oItem.getStyle()) {
                    case "DASHED" :
                        iDashLength = oContext.lineWidth * 3;
                        break;
                    case "DOTTED" :
                        iDashLength = oContext.lineWidth;
                        break;
                    case "SOLID" :
                        /* falls through */                        
                    default :
                        break;
                }
                this._renderDashedLine(oContext, x1, y1, x2, y2, iDashLength);
                oContext.stroke();
                oContext.closePath();
                if (oItem.getTitle()) {
                    this._renderLineText(oContext, x1, y1, x2, y2, oItem.getTitle());
                }
                if (oItem.getHeadStyle() == "START" || oItem.getHeadStyle() == "BOTH") {
                    this._renderArrowHead(oContext, x1, y1, x2, y2, fScaleFactor, false); 
                } 
                if (oItem.getHeadStyle() == "END" || oItem.getHeadStyle() == "BOTH") {
                    this._renderArrowHead(oContext, x1, y1, x2, y2, fScaleFactor, true);
                }
                // nothing else to be done here, skip rendering anything else
                continue;
            }

            fInnerItemLeft = fItemLeft;
            fInnerItemTop = fItemTop;
            fInnerItemWidth = fItemWidth;
            fInnerItemHeight = fItemHeight;
            iInnerPadding = 10 * fScaleFactor;

            // special cases
            switch (oItem.getMetadata()._sClassName.split(".").pop()) {
                case "WallItemImage" :
                    // draw image dummy
                    oContext.fillStyle = "#cccccc";
                    oContext.beginPath();
                    oContext.rect(fItemLeft + iInnerPadding, fItemTop + iInnerPadding, fItemWidth - 2 * iInnerPadding, fItemHeight - iInnerPadding - 35 * fScaleFactor);
                    oContext.fill();
                    // TODO: draw a smiley
                    // draw shadow circle
                    oContext.fillStyle = "#eeeeee";
                    oContext.beginPath();
                    oContext.arc(fItemLeft + fItemWidth / 2, fItemTop + (fItemHeight - 30 * fScaleFactor) / 2, Math.min(fItemWidth, fItemHeight) / 4, 0, 2 * Math.PI, false);
                    oContext.fill();
                    // oContext.strokeStyle = oStyle.borderColor;
                    // oContext.stroke();

                    fInnerItemTop += fItemHeight - 40 * fScaleFactor;
                    fInnerItemHeight += 30 * fScaleFactor;
                    break;
                case "WallItemVideo" :
                    // draw video area
                    //
                    // .-------. /.
                    // | |< |
                    // .-------. \.

                    // set up gradient based on current position
                    oBgGradient = oContext.createLinearGradient(0, fItemTop, 0, fItemTop + fItemHeight);
                    oBgGradient.addColorStop(0, "#686868");
                    oBgGradient.addColorStop(1, "#3F3F3F");
                    oContext.fillStyle = oBgGradient;

                    // draw bg
                    oContext.beginPath();
                    oContext.rect(fItemLeft + iInnerPadding, fItemTop + iInnerPadding, fItemWidth - 2 * iInnerPadding, fItemHeight - iInnerPadding - 35 * fScaleFactor);
                    oContext.fill();

                    // draw camera rect
                    oContext.fillStyle = "#aaaaaa";
                    oContext.beginPath();
                    oContext.rect(fItemLeft + fItemWidth / 3, fItemTop + fItemWidth / 3, fItemWidth / 4, 35 * fScaleFactor);
                    oContext.fill();

                    // draw camera triangle
                    oContext.beginPath();
                    oContext.moveTo(fItemLeft + fItemWidth * 7 / 12, fItemTop + fItemWidth / 3 + 17.5 * fScaleFactor);
                    oContext.lineTo(fItemLeft + fItemWidth * 7 / 12 + 17.5 * fScaleFactor, fItemTop + fItemWidth / 3);
                    oContext.lineTo(fItemLeft + fItemWidth * 7 / 12 + 17.5 * fScaleFactor, fItemTop + fItemWidth / 3 + 35 * fScaleFactor);
                    oContext.lineTo(fItemLeft + fItemWidth * 7 / 12, fItemTop + fItemWidth / 3 + 17.5 * fScaleFactor);

                    oContext.fill();
                    oContext.closePath();

                    fInnerItemTop += fItemHeight - 40 * fScaleFactor;
                    fInnerItemHeight += 30 * fScaleFactor;
                    break;
                case "WallItemNote" :
                    iCurrentBorderWidth = oStyle.borderWidth * fScaleFactor * 0.5;
                    x = fItemLeft + iInnerPadding;
                    y = fItemTop + iInnerPadding;

                    // header bg
                    oContext.fillStyle = "#AECCE8";
                    oContext.beginPath();
                    oContext.rect(fItemLeft + iCurrentBorderWidth, fItemTop + iCurrentBorderWidth, fItemWidth - iCurrentBorderWidth * 2, 42 * fScaleFactor - iCurrentBorderWidth);
                    oContext.fill();

                    // draw SAP shape
                    // .--------.
                    // | SAP /
                    // .------.
                    oContext.fillStyle = "#03AEEB";
                    oContext.beginPath();
                    oContext.moveTo(x, y);
                    oContext.lineTo(x + fItemWidth / 3, y);
                    oContext.lineTo(x + fItemWidth / 5, y + 25 * fScaleFactor);
                    oContext.lineTo(x, y + 25 * fScaleFactor);
                    oContext.lineTo(x, y);
                    oContext.fill();
                    oContext.closePath();

                    // draw note number
                    oContext.lineWidth = iFontSize;
                    oContext.beginPath();
                    this._renderCanvasWord(oContext, x + fItemWidth / 3 + iInnerPadding, // x1
                    y + iInnerPadding, // y1
                    fItemLeft + fItemWidth - iInnerPadding // x2
                    );
                    oContext.closePath();
                    fInnerItemTop += 40 * fScaleFactor;
                    fInnerItemHeight -= 40 * fScaleFactor;
                    break;

                case "WallItemLink" :
                    x = fItemLeft + iInnerPadding;
                    y = fItemTop + iInnerPadding;
                    w = fItemWidth - 2 * iInnerPadding;
                    h = fItemHeight - 2 * iInnerPadding;

                    // draw cursor shape
                    // .
                    // / \
                    // / \
                    // / \
                    // .-. .-.
                    // / /
                    // /--/
                    oContext.fillStyle = "#b8f84e";
                    oContext.strokeStyle = "#3d5000";
                    oContext.beginPath();
                    // coordinates taken from rotated arror from iconFont
                    oContext.moveTo(x + w * 0.38, y + h);
                    oContext.lineTo(x + w * 0.63, y + h * 0.62);
                    oContext.lineTo(x + w * 0.86, y + h * 0.76);
                    oContext.lineTo(x + w * 0.82, y);
                    oContext.lineTo(x + w * 0.12, y + h * 0.28);
                    oContext.lineTo(x + w * 0.33, y + h * 0.42);
                    oContext.lineTo(x + w * 0.09, y + h * 0.80);
                    oContext.lineTo(x + w * 0.38, y + h);
                    oContext.fill();
                    oContext.stroke();
                    oContext.closePath();

                    // draw vertically centered box
                    oContext.fillStyle = "#709520";
                    oContext.beginPath();
                    oContext.rect(fItemLeft, fItemTop + fItemHeight / 2 + 30 * fScaleFactor, fItemWidth, 25 * fScaleFactor);
                    oContext.fill();
                    oContext.strokeStyle = "#3d5000";
                    oContext.stroke();

                    // draw vertically centered box
                    oContext.fillStyle = "#87B52F";
                    oContext.beginPath();
                    oContext.rect(fItemLeft, fItemTop + fItemHeight / 2 + 55 * fScaleFactor, fItemWidth, 25 * fScaleFactor);
                    oContext.fill();
                    oContext.strokeStyle = "#3d5000";
                    oContext.stroke();

                    // draw link title
                    oContext.strokeStyle = oStyle.fontColor;
                    oContext.lineWidth = iFontSize;
                    oContext.beginPath();
                    this._renderCanvasWord(oContext, x, // x1
                    y + fItemHeight / 2 + 60 * fScaleFactor, // y1
                    x + w // x2
                    );
                    oContext.closePath();
                    oContext.lineWidth = oStyle.borderWidth * fScaleFactor;

                    fInnerItemLeft += iInnerPadding;
                    fInnerItemTop += fItemHeight / 2 + 20 * fScaleFactor;
                    fInnerItemHeight = 60 * fScaleFactor - 2 * iInnerPadding;
                    break;

                case "WallItemPerson" :
                    x = fItemLeft + iInnerPadding;
                    y = fItemTop + iInnerPadding;
                    w = fItemWidth - 2 * iInnerPadding;

                    // draw head
                    oContext.fillStyle = "#cccccc";
                    oContext.beginPath();
                    oContext.arc(fItemLeft + fItemWidth / 2, fItemTop + (fItemWidth - 30 * fScaleFactor) / 3, fItemWidth / 4, 0, 2 * Math.PI, false);
                    oContext.fill();

                    // draw body
                    oContext.fillStyle = "#cccccc";
                    oContext.beginPath();
                    oContext.rect(fItemLeft + iInnerPadding * 3, fItemTop + iInnerPadding + fItemHeight / 2.5, fItemWidth - 6 * iInnerPadding, fItemHeight / 2 - 35 * fScaleFactor);
                    oContext.fill();

                    // draw vertically centered box
                    oContext.fillStyle = "#cff1fc";
                    oContext.beginPath();
                    oContext.rect(fItemLeft, fItemTop + fItemHeight / 2 + 30 * fScaleFactor, fItemWidth, 50 * fScaleFactor);
                    oContext.fill();
                    oContext.lineWidth = 4 * fScaleFactor;
                    oContext.strokeStyle = "#44D1FC";
                    oContext.stroke();
                    oContext.closePath();

                    // draw person title
                    oContext.strokeStyle = oStyle.fontColor;
                    oContext.lineWidth = iFontSize;
                    oContext.beginPath();
                    this._renderCanvasWord(oContext, x, // x1
                    y + fItemHeight / 2 + 60 * fScaleFactor, // y1
                    x + w // x2
                    );
                    oContext.closePath();
                    oContext.lineWidth = oStyle.borderWidth * fScaleFactor;

                    fInnerItemLeft += iInnerPadding;
                    fInnerItemTop += fItemHeight / 2 + 20 * fScaleFactor;
                    fInnerItemHeight = 60 * fScaleFactor - 2 * iInnerPadding;
                    break;
                case "WallItemDocument" :
                    // draw document circle
                    switch (oItem.getType()) {
                        case sap.ino.wall.DocumentType.Word :
                            sDocumentColor = "#1067C1";
                            break;
                        case sap.ino.wall.DocumentType.Excel :
                            sDocumentColor = "#52A039";
                            break;
                        case sap.ino.wall.DocumentType.PowerPoint :
                            sDocumentColor = "#EB671B";
                            break;
                        case sap.ino.wall.DocumentType.PDF :
                            sDocumentColor = "#DC1414";
                            break;
                        case sap.ino.wall.DocumentType.Zip :
                            sDocumentColor = "#FBC121";
                            break;
                        case sap.ino.wall.DocumentType.Text :
                            sDocumentColor = "#4CBDFF";
                            break;
                        case sap.ino.wall.DocumentType.Video :
                            sDocumentColor = "#8200E5";
                            break;
                        case sap.ino.wall.DocumentType.Misc :
                            /* falls through */
                        default :
                            sDocumentColor = "#bbbbbb";
                    }

                    // draw document triangle
                    oContext.beginPath();
                    oContext.fillStyle = sDocumentColor;
                    oContext.moveTo(fItemLeft + fItemWidth * 3.85 / 12, fItemTop + fItemWidth * 2.85 / 12);
                    oContext.lineTo(fItemLeft + fItemWidth * 4.85 / 12, fItemTop + fItemWidth * 2.85 / 12);
                    oContext.lineTo(fItemLeft + fItemWidth * 4.85 / 12, fItemTop + fItemWidth * 1.85 / 12);
                    oContext.fill();
                    oContext.closePath();

                    // draw document outline
                    oContext.lineWidth = 8 * fScaleFactor;
                    oContext.strokeStyle = sDocumentColor;
                    oContext.moveTo(fItemLeft + fItemWidth * 3.52 / 12, fItemTop + fItemWidth * 3 / 12);
                    oContext.lineTo(fItemLeft + fItemWidth * 3.52 / 12, fItemTop + fItemWidth * 7.5 / 12);
                    oContext.lineTo(fItemLeft + fItemWidth * 8.5 / 12, fItemTop + fItemWidth * 7.5 / 12);
                    oContext.lineTo(fItemLeft + fItemWidth * 8.5 / 12, fItemTop + fItemWidth * 6.78 / 12);
                    oContext.moveTo(fItemLeft + fItemWidth * 8.5 / 12, fItemTop + fItemWidth * 2.4 / 12);
                    oContext.lineTo(fItemLeft + fItemWidth * 8.5 / 12, fItemTop + fItemWidth * 1.45 / 12);
                    oContext.lineTo(fItemLeft + fItemWidth * 5.05 / 12, fItemTop + fItemWidth * 1.45 / 12);
                    oContext.stroke();

                    // draw colored circle for the inner line
                    oContext.beginPath();
                    oContext.arc(fItemLeft + fItemWidth * 2 / 3, fItemTop + (fItemWidth - 36 * fScaleFactor) / 2, fItemWidth / 7, 0, 2 * Math.PI, false);
                    oContext.stroke();
                    oContext.closePath();

                    // draw a horizontal line
                    oContext.beginPath();
                    oContext.lineWidth = 4 * fScaleFactor;
                    oContext.strokeStyle = oStyle.borderColor;
                    oContext.moveTo(fInnerItemLeft + 5 * fScaleFactor, fInnerItemTop + fItemHeight - 37 * fScaleFactor);
                    oContext.lineTo(fInnerItemLeft + fInnerItemWidth - 5 * fScaleFactor, fInnerItemTop + fItemHeight - 37 * fScaleFactor);
                    oContext.stroke();
                    oContext.closePath();

                    fInnerItemTop += fItemHeight - 40 * fScaleFactor;
                    fInnerItemHeight += 30 * fScaleFactor;
                    break;
                case "WallItemAttachment" :
                    // draw attachment circle
                    sDocumentColor = "#bbbbbb";

                    // draw document triangle
                    oContext.beginPath();
                    oContext.fillStyle = sDocumentColor;
                    oContext.moveTo(fItemLeft + fItemWidth * 3.85 / 12, fItemTop + fItemWidth * 2.85 / 12);
                    oContext.lineTo(fItemLeft + fItemWidth * 4.85 / 12, fItemTop + fItemWidth * 2.85 / 12);
                    oContext.lineTo(fItemLeft + fItemWidth * 4.85 / 12, fItemTop + fItemWidth * 1.85 / 12);
                    oContext.fill();
                    oContext.closePath();

                    // draw document outline
                    oContext.lineWidth = 8 * fScaleFactor;
                    oContext.strokeStyle = sDocumentColor;
                    oContext.moveTo(fItemLeft + fItemWidth * 3.52 / 12, fItemTop + fItemWidth * 3 / 12);
                    oContext.lineTo(fItemLeft + fItemWidth * 3.52 / 12, fItemTop + fItemWidth * 7.5 / 12);
                    oContext.lineTo(fItemLeft + fItemWidth * 8.5 / 12, fItemTop + fItemWidth * 7.5 / 12);
                    oContext.lineTo(fItemLeft + fItemWidth * 8.5 / 12, fItemTop + fItemWidth * 6.78 / 12);
                    oContext.moveTo(fItemLeft + fItemWidth * 8.5 / 12, fItemTop + fItemWidth * 2.4 / 12);
                    oContext.lineTo(fItemLeft + fItemWidth * 8.5 / 12, fItemTop + fItemWidth * 1.45 / 12);
                    oContext.lineTo(fItemLeft + fItemWidth * 5.05 / 12, fItemTop + fItemWidth * 1.45 / 12);
                    oContext.stroke();

                    // draw colored circle for the inner line
                    oContext.beginPath();
                    oContext.arc(fItemLeft + fItemWidth * 2 / 3, fItemTop + (fItemWidth - 36 * fScaleFactor) / 2, fItemWidth / 7, 0, 2 * Math.PI, false);
                    oContext.stroke();
                    oContext.closePath();

                    // draw a horizontal line
                    oContext.beginPath();
                    oContext.lineWidth = 4 * fScaleFactor;
                    oContext.strokeStyle = oStyle.borderColor;
                    oContext.moveTo(fInnerItemLeft + 5 * fScaleFactor, fInnerItemTop + fItemHeight - 37 * fScaleFactor);
                    oContext.lineTo(fInnerItemLeft + fInnerItemWidth - 5 * fScaleFactor, fInnerItemTop + fItemHeight - 37 * fScaleFactor);
                    oContext.stroke();
                    oContext.closePath();

                    fInnerItemTop += fItemHeight - 40 * fScaleFactor;
                    fInnerItemHeight += 30 * fScaleFactor;
                    break;
                case "WallItemSprite" :
                    fMin = Math.min(fItemWidth, fItemHeight);
                    fInnerItemLeft += iInnerPadding + (fItemWidth - Math.min(fItemWidth, fItemHeight)) / 2;
                    fInnerItemTop += iInnerPadding / 2 + (fItemHeight - Math.min(fItemWidth, fItemHeight)) / 2;
                    fInnerItemWidth = fMin - 2 * iInnerPadding;
                    fInnerItemHeight = fMin - 2 * iInnerPadding;
                    iFontSize = fInnerItemHeight / 2;
                    iInnerPadding = fInnerItemWidth / 5;
                    break;
                case "WallItemGroup" :
                    fInnerItemLeft = fItemLeft + fItemWidth / 4;
                    fInnerItemTop = fItemTop - 20 * fScaleFactor;
                    fInnerItemWidth = fItemWidth / 2;

                    x = fItemLeft + fItemWidth / 4 + iInnerPadding;
                    y = fItemTop + 3 * iInnerPadding;
                    w = fItemWidth / 2 - 2 * iInnerPadding;
                    // fItemTop += 10 * fScaleFactor;
                    fItemHeight = fItemHeight - 10 * fScaleFactor;

                    // draw vertically centered box
                    oContext.beginPath();
                    oContext.rect(fItemLeft + fItemWidth / 4, fInnerItemTop, fItemWidth - fItemWidth / 2, 40 * fScaleFactor);
                    oContext.fill();
                    oContext.lineWidth = 4 * fScaleFactor;
                    oContext.stroke();
                    oContext.closePath();
            }

            // draw lines for text
            iLineHeight = iFontSize * 2;
            iLetterSize = iFontSize * 0.666;
            oItemText = (oItem.getDescrption ? oItem.getDescription() : oItem.getTitle());
            aWords = oItemText.split(" ");
            iLimit = Math.min(10, aWords.length); // draw max. 10 words
            iCurrentLine = 0;
            iCurrentPosInLine = iInnerPadding;
            j = 0;

            oContext.strokeStyle = oStyle.fontColor;
            oContext.lineWidth = iFontSize;

            oContext.beginPath();
            for (; j < iLimit; j++) {
                // stop if next line would exceed the inner height of the item (i+1 lines with spacing + 1x font size)
                if ((iCurrentLine + 1) * ((j === 0 ? 0 : iLineHeight) + iFontSize) + iInnerPadding > fInnerItemHeight) {
                    break;
                }
                // limit words to the minimum (3 letters) and maximum line length (size available)
                iWordSize = Math.min(Math.max(aWords[j].length, 3) * iLetterSize, fInnerItemWidth - 2 * iInnerPadding);
                // add a line break if next word would exceed the inner item width
                if (iInnerPadding + iCurrentPosInLine + iWordSize > fInnerItemWidth) {
                    iCurrentPosInLine = iInnerPadding;
                    if (oStyle.multiLineText) {
                        iCurrentLine++;
                    } else {
                        break;
                    }
                }
                // render the word
                this._renderCanvasWord(oContext, fInnerItemLeft + iCurrentPosInLine, // x1
                fInnerItemTop + iFontSize + iInnerPadding + iCurrentLine * (iLineHeight + iFontSize), // y1
                fInnerItemLeft + iCurrentPosInLine + iWordSize, // x2
                fInnerItemTop + iFontSize + iInnerPadding + iCurrentLine * (iLineHeight + iFontSize) // y2
                );
                // increase caret position
                iCurrentPosInLine += iWordSize + iLetterSize;
            }
            oContext.closePath();

            // draw children box
            aChilds = aItems[i].getChilds();
            if (aChilds.length) {
                if (oItem instanceof sap.ino.wall.WallItemGroup) {
                    oContext.strokeStyle = "#aaaaaa";
                    oContext.lineWidth = 4 * fScaleFactor;

                    for (j = 0; j < aChilds.length; j++) {
                        // render small boxes for each child
                        fChildrenTop = fItemTop + iInnerPadding + parseInt(aChilds[j].getY(), 10) * fScaleFactor;
                        fChildrenLeft = fItemLeft + parseInt(aChilds[j].getX(), 10) * fScaleFactor;
                        fChildrenHeight = Math.min(160 * fScaleFactor, fItemHeight - 2 * iInnerPadding - 40 * fScaleFactor);

                        // fill
                        oBgGradient = oContext.createLinearGradient(fChildrenLeft, fChildrenTop, fChildrenLeft, fChildrenTop + fChildrenHeight);
                        oBgGradient.addColorStop(0, "rgba(155, 155, 155, 0.5)");
                        oBgGradient.addColorStop(1, "rgba(80,80,80, 0.5)");
                        oContext.fillStyle = oBgGradient;

                        oContext.beginPath();
                        oContext.rect(fChildrenLeft, fChildrenTop, fChildrenHeight, fChildrenHeight);
                        oContext.fill();

                        // border
                        oContext.stroke();
                    }
                } else {
                    // render a dummy child container
                    fChildrenTop = fItemTop + 20 * fScaleFactor;
                    fChildrenLeft = fItemLeft + fItemWidth - 20 * fScaleFactor;
                    fChildrenHeight = Math.min(160 * fScaleFactor, fItemHeight - 40 * fScaleFactor);

                    // fill
                    oBgGradient = oContext.createLinearGradient(0, fChildrenTop, 0, fItemTop + fChildrenHeight);
                    oBgGradient.addColorStop(0, "rgba(155, 155, 155, 0.5)");
                    oBgGradient.addColorStop(1, "rgba(80,80,80, 0.5)");
                    oContext.fillStyle = oBgGradient;

                    oContext.beginPath();
                    oContext.rect(fChildrenLeft, fChildrenTop, fChildrenHeight, fChildrenHeight);
                    oContext.fill();

                    // border
                    oContext.strokeStyle = "#aaaaaa";
                    oContext.lineWidth = 4 * fScaleFactor;
                    oContext.stroke();
                }
            }
        }
    };

    /* =========================================================== */
    /* begin: internal getters for lazy controls */
    /* =========================================================== */

    /*
     * Lazy initialization of the internal dialog @private @returns {sap.ui.layout/HorizontalLayout} the button
     */
    sap.ino.wall.WallPreview.prototype._getFooter = function(sTitle, sOwner) {
        var that = this, sMode = this.getMode(), oHLPreviewFooter, sLastUpdate, oControl = this.getAggregation("_layoutFooter");

        if (!oControl) {
            // create control
            oControl = new sap.ui.layout.VerticalLayout().addStyleClass("sapInoWallPreviewFooter");
           if (this.getMode() === "NewTemplate") {
                oControl.addStyleClass("sapInoWallPreviewFooterSingleCell");
            }
            // set hidden aggregation without rerendering
            this.setAggregation("_layoutFooter", oControl, true);

            // add title link
            if (that.getTextOnly()) {
                oControl.addAggregation("content", new sap.m.Text({
                    width : "100%",
                    text : sap.ino.wall.util.Formatter.escapeBindingCharacters(sTitle)
                }).addStyleClass("sapInoWallFooterTitle"), true);
            }
            else {
                oControl.addAggregation("content", new sap.m.Link({
                    width : "100%",
                    text : sap.ino.wall.util.Formatter.escapeBindingCharacters(sTitle),
                    press : function() {
                        if (that.getMode() === "New") {
                            that.firePress({
                                "action" : "New"
                            });
                        }
                        return false;
                    }
                }).addStyleClass("sapInoWallFooterTitleLink"), true);
            }
            
            // add author
            oControl.addContent(new sap.m.Text({
                width : "100%",
                text : sap.ino.wall.util.Formatter.escapeBindingCharacters(sOwner)
            }).addStyleClass("sapInoWallFooterText"), true);
            
            // add wall views
            var oHorizontalControl = new sap.ui.layout.HorizontalLayout();
            oHorizontalControl.addAggregation("content", new sap.ui.core.Icon({
                src: "sap-icon://show",
                tooltip: this._oRB.getText("WALL_ITEMPREVIEW_VIEWS", [this.getHits() || 1])
                }).addStyleClass("sapInoWallPreviewFooterViewsIcon"), true);
            
            // add wall views
            oHorizontalControl.addContent(new sap.m.Label({
                text: this._getShortHits(),
                tooltip: this._oRB.getText("WALL_ITEMPREVIEW_VIEWS", [this.getHits() || 1])
            }).addStyleClass("sapInoWallPreviewFooterViews"), true);
            
            oControl.addContent(oHorizontalControl, true);
            
        }else {
            oControl.getContent()[0].setText(sTitle);
        }

        return oControl;
    };

    /*
     * Lazy initialization of the internal resize icon @private @returns {sap.ui.core/Icon} the icon
     */
    sap.ino.wall.WallPreview.prototype._getIconNew = function() {
        var that = this, oControl = this.getAggregation("_iconNew");

        if (!oControl) {
            // create control
            oControl = new sap.ui.core.Icon({
                src : "sap-icon://add",
                size : "3.5rem",
                width : (this.getMode() === "New" ? "148px" : "300px"),
                height : "200px",
                color : "#aaaaaa",
                press : function(oEvent) {
                    that.firePress({
                        "action" : "New"
                    });
                    return false;
                }
            });

            // set hidden aggregation without rerendering
            this.setAggregation("_iconNew", oControl, true);
        }

        return oControl;
    };

    sap.ino.wall.WallPreview.prototype._getIconRemove = function() {
        var that = this, oControl = this.getAggregation("_iconRemove");

        if (!oControl) {
            // create control
            oControl = new sap.ui.core.Icon({
                src : "sap-icon://sys-cancel",
                tooltip: this._oRB.getText("WALL_ITEMPREVIEW_TOOLTIP_REMOVE"),
                press : function(oEvent) {
                    oEvent.preventDefault();
                    oEvent.cancelBubble();
                    that.fireRemove();
                    return false;
                }
            });
            oControl.addStyleClass("sapInoWallPreviewRemove");

            // set hidden aggregation without rerendering
            this.setAggregation("_iconRemove", oControl, true);
        }

        return oControl;
    };

    /*
     * Lazy initialization of the internal resize icon @private @returns {sap.ui.core/Icon} the icon
     */
    sap.ino.wall.WallPreview.prototype._getIconTemplate = function() {
        var that = this, oControl = this.getAggregation("_iconTemplate");

        if (!oControl) {
            // create control
            oControl = new sap.ui.core.Icon({
                src : "sap-icon://inspect",
                size : "3.5rem",
                width : "150px",
                height : "200px",
                color : "#aaaaaa",
                press : function(oEvent) {
                    that.firePress({
                        "action" : "Template"
                    });
                    return false;
                }
            });

            // set hidden aggregation without rerendering
            this.setAggregation("_iconTemplate", oControl, true);
        }

        return oControl;
    };
})();