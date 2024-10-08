/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.LightBox");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.util.Helper");
    
    /**
     * Constructor for a new LightBox.
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
     * <li>{@link #getTitle title} : string</li>
     * <li>{@link #getImage image} : sap.ui.core.URI</li>
     * <li>{@link #getAlt alt} : string</li>
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
     * @param {string}
     *            [sId] id for the new control, generated automatically if no id is given
     * @param {object}
     *            [mSettings] initial settings for the new control
     * 
     * @class A LightBox is used to display larger versions of an image insinde a dialog.
     * @extends sap.ui.core.Control
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.LightBox
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ui.core.Control.extend("sap.ino.wall.LightBox", {
        metadata : {

            publicMethods : [
            // methods
            "open"],
            properties : {
                "title" : {
                    type : "string",
                    group : "Appearance",
                    defaultValue : null
                },
                "image" : {
                    type : "sap.ui.core.URI",
                    group : "Data",
                    defaultValue : null
                },
                "alt" : {
                    type : "string",
                    group : "Data",
                    defaultValue : null
                }
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
        }
    });

    /**
     * Creates a new subclass of class sap.ino.wall.LightBox with name <code>sClassName</code> and enriches it with
     * the information contained in <code>oClassInfo</code>.
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
     * @name sap.ino.wall.LightBox.extend
     * @function
     */

    /**
     * Getter for property <code>title</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {string} the value of property <code>title</code>
     * @public
     * @name sap.ino.wall.LightBox#getTitle
     * @function
     */

    /**
     * Setter for property <code>title</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {string}
     *            sTitle new value for property <code>title</code>
     * @return {sap.ino.wall.LightBox} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.LightBox#setTitle
     * @function
     */

    /**
     * Getter for property <code>image</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {sap.ui.core.URI} the value of property <code>image</code>
     * @public
     * @name sap.ino.wall.LightBox#getImage
     * @function
     */

    /**
     * Setter for property <code>image</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {sap.ui.core.URI}
     *            sImage new value for property <code>image</code>
     * @return {sap.ino.wall.LightBox} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.LightBox#setImage
     * @function
     */

    /**
     * Getter for property <code>alt</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {string} the value of property <code>alt</code>
     * @public
     * @name sap.ino.wall.LightBox#getAlt
     * @function
     */

    /**
     * Setter for property <code>alt</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {string}
     *            sAlt new value for property <code>alt</code>
     * @return {sap.ino.wall.LightBox} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.LightBox#setAlt
     * @function
     */

    /**
     * Opens the lightbox dialog.
     * 
     * @name sap.ino.wall.LightBox#open
     * @function
     * @type void
     * @public
     * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
     */

    /**
     * Initializes the control.
     * 
     * @private
     */
    sap.ino.wall.LightBox.prototype.init = function() {
        this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.wall");
    };

    /**
     * Destroys the control.
     * 
     * @private
     */
    sap.ino.wall.LightBox.prototype.exit = function() {
        this._oImage.destroy();
        this._oImage = null;

        sap.ui.Device.resize.detachHandler(this._getBoundResizeHandler());
    };

    /**
     * Lazy initialization of a control managed in an internal aggregation
     * 
     * @private
     * @returns {sap.ui.core/Control} the control
     */
    sap.ino.wall.LightBox.prototype._getDialog = function() {
        var that = this, oControl = this.getAggregation("_dialog"), fnClose = function() {
            sap.ui.Device.resize.detachHandler(that._getBoundResizeHandler());
            jQuery("#sap-ui-blocklayer-popup").off("click", fnClose);
            oControl.close();
        }, fnOpen = function() {
            // A click on the block layer also closes the dialog
            jQuery("#sap-ui-blocklayer-popup").on("click", fnClose);
        };

        if (!oControl) {
            // create control
            var oImage = this._getImage().clone();
            oImage.attachPress(fnClose);
            oControl = new sap.m.Dialog({
                stretch : sap.ui.Device.system.phone,
                showHeader : false,
                verticalScrolling : false,
                horizontalScrolling : false,
                afterClose : fnClose,
                afterOpen : fnOpen,
                content : [oImage, new sap.m.Label({
                    textAlign : (sap.ui.Device.system.phone ? "Center" : "Left"),
                    text : this.getTitle(),
                    design : sap.m.LabelDesign.Bold
                }).addStyleClass("sapInoWallLightBoxTitle")]
            }).addEventDelegate({
                ontap : fnClose
            }).addStyleClass("sapInoWallLightBoxDialog");

            // set hidden aggregation without rerendering
            this.setAggregation("_dialog", oControl, true);
        }

        return oControl;
    };

    /**
     * Lazy initialization of a control managed in an internal aggregation
     * 
     * @private
     * @returns {sap.ui.core/Control} the control
     */
    sap.ino.wall.LightBox.prototype._getBusyDialog = function() {
        var oControl = this.getAggregation("_busyDialog");

        if (!oControl) {
            // create control
            oControl = new sap.m.BusyDialog();

            // set hidden aggregation without rerendering
            this.setAggregation("_busyDialog", oControl, true);
        }

        return oControl;
    };

    /**
     * Lazy initialization of a control managed in an internal aggregation
     * 
     * @private
     * @returns {sap.ui.core/Control} the control
     */
    sap.ino.wall.LightBox.prototype._getImage = function() {
        if (!this._oImage) {
            // create control
            this._oImage = new sap.m.Image(this.getId() + "-image", {
                src : this.getImage(),
                alt : this.getAlt()
            });
        }

        return this._oImage;
    };

    /**
     * Adjusts an image size to the available screen space
     * 
     * @param {int}
     *            iImageWidth the image width
     * @param {int}
     *            iImageHeight the image height
     * @private
     * @returns {array} an array with the new width and height
     */
    sap.ino.wall.LightBox.prototype._adjustImageSizeToScreen = function(iImageWidth, iImageHeight) {
        var oDialog = this._getDialog(), iWindowWidth = sap.ui.Device.resize.width, iWindowHeight = sap.ui.Device.resize.height, iTemp, iTemp2;

        if (!iImageWidth || !iImageHeight) {
            return;
        }

        // the dynamic repositioning of the dialog control makes it really hard to read these values at run time
        // therefore we subtract some default values that might have to be adjusted when the UX spec changes
        // dialog has a minimum of 8px top and bottom spacing, 64px left and right spacing, and 1rem padding inside
        if (!oDialog.getStretch()) {
            // desktop and tablet
            iWindowWidth -= 2 * 64 + 2 * 16; // margin + padding
            iWindowHeight -= 2 * 8 + 2 * 16 + 48; // margin + padding + title
        } else {
            // phone
            iWindowWidth -= 2 * 16; // padding
            iWindowHeight -= 2 * 16 + 24; // padding + title height
        }

        // scale image dimensions: max width exceeded
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

        // scale image dimensions: max height exceeded
        if (iImageHeight > iWindowHeight) {
            iTemp = iWindowHeight;
            iImageWidth = (iTemp / iImageHeight) * iImageWidth;
            // dialog has a min width of 400 px - 32px padding inside, we do not want to scale smaller
            if (!sap.ui.Device.system.phone) {
                iImageWidth = Math.max(iImageWidth, 368);
            }
            iImageHeight = iTemp;
            // when the window is getting really small, it can happen that the height is getting < 0
            iImageHeight = Math.max(iImageHeight, 1);
        }

        return [iImageWidth, iImageHeight];
    };

    /**
     * Returns the resize handler bound to the this pointer
     * 
     * @private
     * @return {function} the bound function
     */
    sap.ino.wall.LightBox.prototype._getBoundResizeHandler = function() {
        if (!this._onResizeHandler) {
            this._onResizeHandler = this._onResize.bind(this);
        }

        return this._onResizeHandler;
    };

    /**
     * Updates the image dimensions when the dialog is resized or the orientation of the device is changed
     * 
     * @private
     */
    sap.ino.wall.LightBox.prototype._onResize = function() {
        var oDialog = this._getDialog(), oImage = oDialog.getContent()[0], aScaledImageDimensions = this._adjustImageSizeToScreen(this._iImageWidth, this._iImageHeight);

        if (aScaledImageDimensions) {
            oImage.setWidth(aScaledImageDimensions[0] + "px").setHeight((aScaledImageDimensions[1] - 50) + "px");
        }
    };

    /**
     * Opens the lightbox dialog with a description and the resized image
     * 
     * @private
     * @returns {sap.ui.core/Control} the control
     */
    sap.ino.wall.LightBox.prototype.open = function() {
        var that = this, oDialog = this._getDialog(), oBusyIndicator = this._getBusyDialog(), oPreload = new Image();

        // Preload image
        oBusyIndicator.open();
        oPreload.src = this.getImage();
        oPreload.onload = function() {
            var aScaledImageDimensions, oImage = oDialog.getContent()[0];

            // we need to store the real dimensions here because the sap.m.Image does not update the width and
            // height properties after loading the image
            that._iImageWidth = this.width;
            that._iImageHeight = this.height;

            aScaledImageDimensions = that._adjustImageSizeToScreen(that._iImageWidth, that._iImageHeight);

            // hide busy indicator
            oBusyIndicator.close();

            // set the maximum image width possible to fit on the screen
            if (aScaledImageDimensions) {
                oImage.setWidth(aScaledImageDimensions[0] + "px").setHeight((aScaledImageDimensions[1] - 50) + "px");
            }

            // add a resize handler to update the image dimensions
            sap.ui.Device.resize.attachHandler(that._getBoundResizeHandler());

            oDialog.open();
        };
        oPreload.onerror = function() {
            oBusyIndicator.close();
            sap.ino.wall.util.Helper.showErrorUnexpected(that._oRB.getText("WALL_LIGHTBOX_IMAGE_LOAD_ERROR", [oPreload.src]));
        };
    };

})();