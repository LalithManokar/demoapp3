/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.ColorPicker");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.config.Config");
        
    /**
     * Constructor for a new ColorPicker. 
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
     * <li>{@link #getColor color} : string (default: '#ffffff')</li>
     * <li>{@link #getPlacement placement} : sap.m.PlacementType (default: sap.m.PlacementType.Right)</li>
     * </ul>
     * </li>
     * <li>Aggregations
     * <ul>
     * <li>{@link #get_popoverColorSelector _popoverColorSelector} : sap.m.Popover</li>
     * </ul>
     * </li>
     * <li>Associations
     * <ul>
     * </ul>
     * </li>
     * <li>Events
     * <ul>
     * <li>{@link sap.ino.wall.ColorPicker#event:change change} : fnListenerFunction or [fnListenerFunction,
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
     * @class A ColorPicker control that uses the default UI5 colorpicker inside a sap.m.Popover for display. The
     *        popover display the color picker wheel and an input field to enter color values directly.
     * @extends sap.ui.core.Control
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.ColorPicker
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ui.core.Control.extend("sap.ino.wall.ColorPicker", {
        metadata : {

            publicMethods : [
            // methods
            "close", "openBy", "isOpen"],
            properties : {
                "color" : {
                    type : "string",
                    group : "Misc",
                    defaultValue : '#ffffff'
                },
                "colorInputActive" : {
                    type : "boolean",
                    group : "Misc",
                    defaultValue : true
                },
                "placement" : {
                    type : "sap.m.PlacementType",
                    group : "Behavior",
                    defaultValue : sap.m.PlacementType.Right
                },
                "zoomable" : {
                    type : "boolean",
                    defaultValue : true
                },
                "autoClose" : {
                    type : "boolean",
                    defaultValue : false
                }
            },
            aggregations : {
                "_popoverColorSelector" : {
                    type : "sap.m.Popover",
                    multiple : false
                },
                "_colorPickerControl" : {
                    type : "sap.ino.controls.ColorPickerLite",
                    multiple : false,
                    visibility : "hidden"
                },
                "colorInputControl" : {
                    type : "sap.m.Input",
                    multiple : false
                }
            },
            events : {
                "change" : {}
            }
        }
    });

    /**
     * Creates a new subclass of class sap.ino.wall.ColorPicker with name <code>sClassName</code> and enriches it
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
     * @name sap.ino.wall.ColorPicker.extend
     * @function
     */

    sap.ino.wall.ColorPicker.M_EVENTS = {
        'change' : 'change'
    };

    /**
     * Getter for property <code>color</code>. The color in hex value format with leading "#".
     * 
     * Default value is <code>#ffffff</code>
     * 
     * @return {string} the value of property <code>color</code>
     * @public
     * @name sap.ino.wall.ColorPicker#getColor
     * @function
     */

    /**
     * Setter for property <code>color</code>.
     * 
     * Default value is <code>#ffffff</code>
     * 
     * @param {string}
     *            sColor new value for property <code>color</code>
     * @return {sap.ino.wall.ColorPicker} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ColorPicker#setColor
     * @function
     */

    /**
     * Getter for property <code>placement</code>. This is the information about on which side will the popover be
     * placed at. Possible values are sap.m.PlacementType.Left, sap.m.PlacementType.Right, sap.m.PlacementType.Top,
     * sap.m.PlacementType.Bottom, sap.m.PlacementType.Vertical, sap.m.PlacementType.Left.Horizontal,
     * sap.m.PlacementType.Left.Auto. The default value is sap.m.PlacementType.Right. Setting this property while
     * popover is open won't cause any rerendering of the popover, but it will take effect when it's opened again.
     * 
     * Default value is <code>Right</code>
     * 
     * @return {sap.m.PlacementType} the value of property <code>placement</code>
     * @public
     * @name sap.ino.wall.ColorPicker#getPlacement
     * @function
     */

    /**
     * Setter for property <code>placement</code>.
     * 
     * Default value is <code>Right</code>
     * 
     * @param {sap.m.PlacementType}
     *            oPlacement new value for property <code>placement</code>
     * @return {sap.ino.wall.ColorPicker} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ColorPicker#setPlacement
     * @function
     */

    /**
     * Getter for aggregation <code>_popoverColorSelector</code>.<br/> This is the hidden aggregation for managing
     * an internally created control.
     * 
     * @return {sap.m.Popover}
     * @public
     * @name sap.ino.wall.ColorPicker#get_popoverColorSelector
     * @function
     */

    /**
     * Setter for the aggregated <code>_popoverColorSelector</code>.
     * 
     * @param {sap.m.Popover}
     *            o_popoverColorSelector
     * @return {sap.ino.wall.ColorPicker} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ColorPicker#set_popoverColorSelector
     * @function
     */

    /**
     * Destroys the _popoverColorSelector in the aggregation named <code>_popoverColorSelector</code>.
     * 
     * @return {sap.ino.wall.ColorPicker} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ColorPicker#destroy_popoverColorSelector
     * @function
     */

    /**
     * 
     * @name sap.ino.wall.ColorPicker#change
     * @event
     * @param {sap.ui.base.Event}
     *            oControlEvent
     * @param {sap.ui.base.EventProvider}
     *            oControlEvent.getSource
     * @param {object}
     *            oControlEvent.getParameters
     * @param {string}
     *            oControlEvent.getParameters.color
     * @public
     */

    /**
     * Attach event handler <code>fnFunction</code> to the 'change' event of this
     * <code>sap.ino.wall.ColorPicker</code>.<br/>. When called, the context of the event handler (its
     * <code>this</code>) will be bound to <code>oListener<code> if specified
     * otherwise to this <code>sap.ino.wall.ColorPicker</code>.<br/> itself. 
     *  
     *
     * @param {object}
     *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
     * @param {function}
     *            fnFunction The function to call, when the event occurs.  
     * @param {object}
     *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ino.wall.ColorPicker</code>.<br/> itself.
     *
     * @return {sap.ino.wall.ColorPicker} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ColorPicker#attachChange
     * @function
     */

    /**
     * Detach event handler <code>fnFunction</code> from the 'change' event of this
     * <code>sap.ino.wall.ColorPicker</code>.<br/>
     * 
     * The passed function and listener object must match the ones used for event registration.
     * 
     * @param {function}
     *            fnFunction The function to call, when the event occurs.
     * @param {object}
     *            oListener Context object on which the given function had to be called.
     * @return {sap.ino.wall.ColorPicker} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.ColorPicker#detachChange
     * @function
     */

    /**
     * Fire event change to attached listeners.
     * 
     * Expects following event parameters:
     * <ul>
     * <li>'color' of type <code>string</code> </li>
     * </ul>
     * 
     * @param {Map}
     *            [mArguments] the arguments to pass along with the event.
     * @return {sap.ino.wall.ColorPicker} <code>this</code> to allow method chaining
     * @protected
     * @name sap.ino.wall.ColorPicker#fireChange
     * @function
     */

    /**
     * Close the color picker popover.
     * 
     * @name sap.ino.wall.ColorPicker#close
     * @function
     * @type sap.m.Popover
     * @public
     * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
     */

    /**
     * Open the color picker popover.
     * 
     * @name sap.ino.wall.ColorPicker#openBy
     * @function
     * @param {object}
     *            oControl This is the control to which the popover will be placed. It can be not only a UI5 control,
     *            but also an existing dom reference. The side of the placement depends on the placement property set in
     *            the popover.
     * @type sap.m.Popover
     * @public
     * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
     */

    /**
     * The method checks if the Popover is open. It returns true when the Popover is currently open (this includes
     * opening and closing animations), otherwise it returns false.
     * 
     * @name sap.ino.wall.ColorPicker#isOpen
     * @function
     * @type boolean
     * @public
     * @since 1.9.1
     * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
     */

    /* =========================================================== */
    /* begin: API methods */
    /* =========================================================== */

    /**
     * Setter for the color property that surpesses re-rendering and updates.
     * 
     * @public
     * @override
     * @param {string}
     *            sColor a hex color representation starting with #
     * @returns {sap.ui.core/Control} this pointer for chaining
     */
    sap.ino.wall.ColorPicker.prototype.setColor = function(sColor) {
        var sPreviousColor = this.getColor();
        this.setProperty("color", sColor, true);

        // update button and input
        if (this.isOpen() && sPreviousColor != sColor) {
            var oColorPicker = this.getAggregation("_colorPickerControl");
            if (oColorPicker) {
                oColorPicker.setColor(sColor);
            }
        }

        return this;
    };

    sap.ino.wall.ColorPicker.prototype._setColor = function(sColor) {
        if (sColor.match(/NaN/)) {
            return;
        }
        // fire change event
        if (this.getColor() !== sColor) {
            this.setProperty("color", sColor, true);
            this.fireChange({
                color : sColor
            });
        }
        this._getPopoverColorSelector().focus();
    };

    /**
     * Get the internal Popover's placement property {@link sap.m.Popover}.
     * 
     * @override
     * @public
     * @returns {string} the placement mode
     */
    sap.ino.wall.ColorPicker.prototype.getPlacement = function() {
        return this._getPopoverColorSelector().getPlacement();
    };
    
    /**
     * Set the internal Popover's placement property {@link sap.m.Popover}.
     * 
     * @override
     * @public
     * @param {string}
     *            sPlacement the new placement mode
     * @returns {this} this pointer for chaining
     */
    sap.ino.wall.ColorPicker.prototype.setPlacement = function(sPlacement) {
        this._getPopoverColorSelector().setPlacement(sPlacement);

        return this;
    };

    /**
     * Returns true if the popover is open, else false.
     * 
     * @public
     * @returns {Boolean}
     */
    sap.ino.wall.ColorPicker.prototype.isOpen = function() {
        var oPopover = this.getAggregation("_popoverColorSelector");

        if (oPopover && oPopover.isOpen()) {
            return true;
        }

        return false;
    };

    /**
     * Returns true if the popover is open, else false.
     * 
     * @public
     * @param {sap.ui.core/Control}
     *            the reference control
     * @returns {sap.ui.core/Control} this pointer for chaining
     */
    sap.ino.wall.ColorPicker.prototype.openBy = function(oControl) {
        if (sap.ino.wall.ColorPicker.INSTANCE) {
            sap.ino.wall.ColorPicker.INSTANCE.close();
        }
        sap.ino.wall.ColorPicker.INSTANCE = this;
        
        this._getPopoverColorSelector().openBy(oControl);

        return this;
    };

    /**
     * Returns true if the popover is open, else false.
     * 
     * @public
     * @returns {sap.ui.core/Control} this pointer for chaining
     */
    sap.ino.wall.ColorPicker.prototype.close = function() {
        if (sap.ino.wall.ColorPicker.INSTANCE) {
            sap.ino.wall.ColorPicker.INSTANCE = null;
        }
        
        var oPopover = this.getAggregation("_popoverColorSelector");

        if (oPopover) {
            oPopover.close();
        }
        return this;
    };

      /* =========================================================== */
    /* begin: internal methods */
    /* =========================================================== */

    /**
     * Lazy initialization of the internal control.
     * 
     * @private
     * @returns {sap.m/Button} the button
     */
    sap.ino.wall.ColorPicker.prototype._getPopoverColorSelector = function() {
        var that = this;

        var oColorPicker = this.getAggregation("_colorPickerControl");
        if (!oColorPicker) {
            oColorPicker = new sap.ino.controls.ColorPickerLite({
                color : that.getColor(),
                change : function(oEvent) {
                    var sValue = oEvent.getParameter("hashValue");
                    // validate the hex value input
                    if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(sValue)) {
                        that._setColor(sValue);
                    }
                },
                preview : false,
                showValueStateMessage : false,
                showHex : false
            });
            
            this.setAggregation("_colorPickerControl", oColorPicker, true);
        }

        var oPopover = this.getAggregation("_popoverColorSelector");
        if (!oPopover) {
            
            var oPanel = new sap.m.Panel({
                content: [this.getAggregation("_colorPickerControl")]
            }).addStyleClass("sapInoWallColorPickerPopoverPanel");
            
            oPopover = new sap.m.Popover(this.getId() + "-popoverColorSelector", {
                showHeader : false,
                placement : sap.m.PlacementType.Auto,
                contentWidth : '154px',
                verticalScrolling : false,
                horizontalScrolling : false,
                content : [oPanel]
            }).addStyleClass("sapInoWallColorPickerPopover");
            oPopover.setHorizontalScrolling(false);
            
            var fnOnAfterRendering = oPopover.onAfterRendering;
            oPopover.onAfterRendering = function() {
                if (jQuery.type(fnOnAfterRendering) === "function") {
                    fnOnAfterRendering.apply(this, arguments);
                }      
                this.$().attr("tabindex", "");
            };
            
            // set hidden aggregation without rerendering
            this.setAggregation("_popoverColorSelector", oPopover, true);
            
            oPopover.oPopup.attachOpened(function() { this.setAutoClose(that.getAutoClose()); });
        }

        return oPopover;
    };
    
    sap.ino.wall.ColorPicker.INSTANCE = null;

})();