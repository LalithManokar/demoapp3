/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.DropUpload");

(function() {
    "use strict";

    /**
     * Constructor for a new DropUpload.
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
     * <li>{@link #getSize size} : string (default: 'M')</li>
     * <li>{@link #getIcon icon} : sap.ui.core.URI (default: 'sap-icon://add-photo')</li>
     * <li>{@link #getAccept accept} : string (default: 'image/*')</li>
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
     * <li>{@link sap.ino.wall.DropUpload#event:change change} : fnListenerFunction or [fnListenerFunction,
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
     * @class Add your documentation for the newDropUpload
     * @extends sap.ui.core.Control
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.DropUpload
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ui.core.Control.extend("sap.ino.wall.DropUpload", {
        metadata : {
            properties : {
                "size" : {
                    type : "string",
                    group : "Misc",
                    defaultValue : 'M'
                },
                "icon" : {
                    type : "sap.ui.core.URI",
                    group : "Appearance",
                    defaultValue : 'sap-icon://add-photo'
                },
                "accept" : {
                    type : "string",
                    group : "Behavior",
                    defaultValue : 'image/*'
                },
                "tooltip" : {
                    type : "string",
                    group : "Misc",
                    defaultValue : "{i18n>WALL_DROPUPLOAD_STATUSMSG_DROP}"
                }
            },
            aggregations : {
                "_icon" : {
                    type : "sap.ui.core.Icon",
                    multiple : false,
                    visibility : "hidden"
                }
            },
            events : {
                "change" : {}
            }
        }
    });

    /**
     * Creates a new subclass of class sap.ino.wall.DropUpload with name <code>sClassName</code> and enriches it
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
     * @name sap.ino.wall.DropUpload.extend
     * @function
     */

    sap.ino.wall.DropUpload.M_EVENTS = {
        'change' : 'change'
    };

    /**
     * Getter for property <code>size</code>. The T-Shirt size of the upload control.
     * 
     * Default value is <code>M</code>
     * 
     * @return {string} the value of property <code>size</code>
     * @public
     * @name sap.ino.wall.DropUpload#getSize
     * @function
     */

    /**
     * Setter for property <code>size</code>.
     * 
     * Default value is <code>M</code>
     * 
     * @param {string}
     *            sSize new value for property <code>size</code>
     * @return {sap.ino.wall.DropUpload} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.DropUpload#setSize
     * @function
     */

    /**
     * Getter for property <code>icon</code>. The icon that is displayed within the upload control.
     * 
     * Default value is <code>sap-icon://add-photo</code>
     * 
     * @return {sap.ui.core.URI} the value of property <code>icon</code>
     * @public
     * @name sap.ino.wall.DropUpload#getIcon
     * @function
     */

    /**
     * Setter for property <code>icon</code>.
     * 
     * Default value is <code>sap-icon://add-photo</code>
     * 
     * @param {sap.ui.core.URI}
     *            sIcon new value for property <code>icon</code>
     * @return {sap.ino.wall.DropUpload} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.DropUpload#setIcon
     * @function
     */

    /**
     * Getter for property <code>accept</code>. The icon that is displayed within the upload control.
     * 
     * Default value is <code>image/*</code>
     * 
     * @return {string} the value of property <code>accept</code>
     * @public
     * @name sap.ino.wall.DropUpload#getAccept
     * @function
     */

    /**
     * Setter for property <code>accept</code>.
     * 
     * Default value is <code>image/*</code>
     * 
     * @param {string}
     *            sAccept new value for property <code>accept</code>
     * @return {sap.ino.wall.DropUpload} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.DropUpload#setAccept
     * @function
     */

    /**
     * 
     * @name sap.ino.wall.DropUpload#change
     * @event
     * @param {sap.ui.base.Event}
     *            oControlEvent
     * @param {sap.ui.base.EventProvider}
     *            oControlEvent.getSource
     * @param {object}
     *            oControlEvent.getParameters
     * @param {string}
     *            oControlEvent.getParameters.mode The input mode of the upload (Drop or Select).
     * @param {any}
     *            oControlEvent.getParameters.files An array of files to upload.
     * @public
     */

    /**
     * Attach event handler <code>fnFunction</code> to the 'change' event of this
     * <code>sap.ino.wall.DropUpload</code>.<br/>. When called, the context of the event handler (its
     * <code>this</code>) will be bound to <code>oListener<code> if specified
     * otherwise to this <code>sap.ino.wall.DropUpload</code>.<br/> itself. 
     *  
     *
     * @param {object}
     *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
     * @param {function}
     *            fnFunction The function to call, when the event occurs.  
     * @param {object}
     *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ino.wall.DropUpload</code>.<br/> itself.
     *
     * @return {sap.ino.wall.DropUpload} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.DropUpload#attachChange
     * @function
     */

    /**
     * Detach event handler <code>fnFunction</code> from the 'change' event of this
     * <code>sap.ino.wall.DropUpload</code>.<br/>
     * 
     * The passed function and listener object must match the ones used for event registration.
     * 
     * @param {function}
     *            fnFunction The function to call, when the event occurs.
     * @param {object}
     *            oListener Context object on which the given function had to be called.
     * @return {sap.ino.wall.DropUpload} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.DropUpload#detachChange
     * @function
     */

    /**
     * Fire event change to attached listeners.
     * 
     * Expects following event parameters:
     * <ul>
     * <li>'mode' of type <code>string</code> The input mode of the upload (Drop or Select).</li>
     * <li>'files' of type <code>any</code> An array of files to upload.</li>
     * </ul>
     * 
     * @param {Map}
     *            [mArguments] the arguments to pass along with the event.
     * @return {sap.ino.wall.DropUpload} <code>this</code> to allow method chaining
     * @protected
     * @name sap.ino.wall.DropUpload#fireChange
     * @function
     */

    /**
     * Initializes the control.
     * 
     * @private
     */
    sap.ino.wall.DropUpload.prototype.init = function() {
        this._onclickProxy = jQuery.proxy(this._onclick, this);
        this._onkeydownProxy = jQuery.proxy(this._onkeydown, this);
        this._ondropProxy = jQuery.proxy(this._ondrop, this);
        this._onchangeProxy = jQuery.proxy(this._onchange, this);
    };

    /**
     * Destroys the control.
     * 
     * @private
     */
    sap.ino.wall.DropUpload.prototype.exit = function() {
        this._onclickProxy = null;
        this._onkeydownProxy = null;
        this._ondropProxy = null;
        this._onchangeProxy = null;
    };

    /**
     * Adjusts control before rendering. Were place the original events with our delegate functions that fire the hover
     * events-
     * 
     * @private
     */
    sap.ino.wall.DropUpload.prototype.onBeforeRendering = function() {
        this.$().find("#" + this.getId() + "-fileDrop").unbind('drop.dropupload', this._ondropProxy);
        this.$().find("#" + this.getId() + "-fileDrop").unbind('keydown.dropupload', this._onkeydownProxy);
        this.$().find("#" + this.getId() + "-fileDrop").unbind('click.dropupload', this._onclickProxy);
        this.$().find("#" + this.getId() + "-fileUpload").unbind("change.dropupload", this._onchangeProxy);
    };

    /**
     * Adjusts control after rendering.
     * 
     * @private
     */
    sap.ino.wall.DropUpload.prototype.onAfterRendering = function() {
        var iMargin, sSize;

        // create a file drop area
        this.$().find("#" + this.getId() + "-fileDrop").bind('drop.dropupload', this._ondropProxy);
        // when clicking on the drop area open the file selector
        this.$().find("#" + this.getId() + "-fileDrop").bind('click.dropupload', this._onclickProxy);
        // when hitting the drop area open the file selector
        this.$().find("#" + this.getId() + "-fileDrop").bind('keydown.dropupload', this._onkeydownProxy);
        // add change handler to the hidden upload field
        this.$().find("#" + this.getId() + "-fileUpload").bind("change.dropupload", this._onchangeProxy);

        if (!jQuery.support.hasFlexBoxSupport || sap.ui.Device.browser.safari || sap.ui.Device.browser.internet_explorer && sap.ui.Device.browser.version === 10) {
            this.$().addClass("sapUiNoFlex");
            iMargin = -24;
            sSize = this.getSize();
            if (sSize === "S") {
                iMargin = -15;
            } else if (sSize === "L") {
                iMargin = -30;
            }

            //this.$().find(".sapInoWallDropUploadAreaInner").css("margin-top", (iMargin - 10) + "px");
        }
    };

    /**
     * Setter for the size property that also updates the icon.
     * 
     * @public
     * @param {string}
     *            sSize the size property (default M)
     */
    sap.ino.wall.DropUpload.prototype.setSize = function(sSize) {
        var iSize = 48, oIcon = this._getIcon();

        this.setProperty("size", sSize, true);

        if (sSize === "S") {
            iSize = 30;
        } else if (sSize === "L") {
            iSize = 66;
        }

        oIcon.setSize(iSize + "px");
        oIcon.setWidth(iSize + "px");
        oIcon.setHeight((iSize + 10) + "px");
    };

    /* =========================================================== */
    /* begin: internal methods */
    /* =========================================================== */

    /**
     * An internal event handler for the click event. It will open the native upload dialog.
     * 
     * @param oEvent
     */
    sap.ino.wall.DropUpload.prototype._onclick = function(oEvent) {
        this.$().find("#" + this.getId() + "-fileUpload").trigger('click');

        // stop browsers default behavior
        if (oEvent) {
            oEvent.preventDefault();
            oEvent.stopPropagation();
        }
    };

    /**
     * An internal event handler for the keydown event. It will open the native upload dialog.
     * 
     * @param oEvent
     */
    sap.ino.wall.DropUpload.prototype._onkeydown = function(oEvent) {
        if (oEvent) {
            if (oEvent.keyCode === jQuery.sap.KeyCodes.ENTER || oEvent.keyCode === jQuery.sap.KeyCodes.SPACE) {
                this.$().find("#" + this.getId() + "-fileUpload").trigger('click');

                // stop browsers default behavior
                oEvent.preventDefault();
                oEvent.stopPropagation();
            }
        }
    };

    /**
     * An internal event handler for the drop event. it will fire the change event of this control.
     * 
     * @param oEvent
     */
    sap.ino.wall.DropUpload.prototype._ondrop = function(oEvent) {
        this.fireChange({
            mode : "Drop",
            files : oEvent.originalEvent.dataTransfer.files
        });

        // stop browsers default behavior
        if (oEvent) {
            oEvent.preventDefault();
            oEvent.stopPropagation();
        }
    };

    /**
     * Lazy initialization of a control managed in an internal aggregation.
     * 
     * @private
     * @returns {sap.ui.core/Icon} the control
     */
    sap.ino.wall.DropUpload.prototype._onchange = function(oEvent) {
        var $fileUpload = this.$().find("#" + this.getId() + "-fileUpload");

        this.fireChange({
            mode : "Select",
            files : this.$().find("#" + this.getId() + "-fileUpload")[0].files
        });

        // clear the upload form to be able to upload the same file twice
        $fileUpload.replaceWith($fileUpload.clone(true));
    };

    /**
     * Lazy initialization of a control managed in an internal aggregation.
     * 
     * @private
     * @returns {sap.ui.core/Icon} the control
     */
    sap.ino.wall.DropUpload.prototype._getIcon = function() {
        var oControl = this.getAggregation("_icon"), sSize = this.getSize(), iSize = 40;

        if (sSize === "S") {
            iSize = 22;
        } else if (sSize === "L") {
            iSize = 58;
        }

        if (!oControl) {
            // create control
            oControl = new sap.ui.core.Icon({
                src : this.getIcon(),
                size : iSize + "px",
                width : iSize + "px",
                height : (iSize + 10) + "px",
                decorative : true,
                tooltip : this.getTooltip()
            });

            // set hidden aggregation without rerendering
            this.setAggregation("_icon", oControl, true);
        }

        // update icon every access
        oControl.setSrc(this.getIcon());

        return oControl;
    };

})();