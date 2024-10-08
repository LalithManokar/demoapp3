/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.WallItemBase");

(function() {
    "use strict";

    jQuery.sap.require("sap.ui.core.Control");
    jQuery.sap.require("sap.ino.wall.util.Helper");
    jQuery.sap.require("sap.ino.wall.util.Formatter");
    jQuery.sap.require("sap.ino.wall.config.Config");
    jQuery.sap.require("sap.ino.wall.TShirtSize");
    jQuery.sap.require("sap.ino.wall.WallConfig");
    jQuery.sap.require("sap.ino.wall.WallMode");
    
    /**
     * Constructor for a new WallItemBase.
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
     * <li>{@link #getX x} : sap.ui.core.CSSSize</li>
     * <li>{@link #getY y} : sap.ui.core.CSSSize</li>
     * <li>{@link #getW w} : sap.ui.core.CSSSize</li>
     * <li>{@link #getH h} : sap.ui.core.CSSSize</li>
     * <li>{@link #getDepth depth} : int</li>
     * <li>{@link #getFlipped flipped} : boolean</li>
     * <li>{@link #getEnabled enabled} : boolean (default: true)</li>
     * <li>{@link #getSelected selected} : boolean (default: false)</li>
     * <li>{@link #getStorageId storageId} : int (default: -1)</li>
     * <li>{@link #getResizable resizable} : boolean (default: false)</li>
     * </ul>
     * </li>
     * <li>Aggregations
     * <ul>
     * <li>{@link #getChilds childs} : sap.ino.wall.WallItemBase[]</li>
     * </ul>
     * </li>
     * <li>Associations
     * <ul>
     * </ul>
     * </li>
     * <li>Events
     * <ul>
     * <li>{@link sap.ino.wall.WallItemBase#event:dataChange dataChange} : fnListenerFunction or
     * [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
     * <li>{@link sap.ino.wall.WallItemBase#event:positionChange positionChange} : fnListenerFunction or
     * [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
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
     * @class Add your documentation for the newWallItemBase
     * @extends sap.ui.core.Control
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.WallItemBase
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ui.core.Control.extend("sap.ino.wall.WallItemBase", {
        metadata : {
            properties : {
                "title" : {
                    type : "string",
                    group : "Data",
                    defaultValue : null
                },
                "x" : {
                    type : "sap.ui.core.CSSSize",
                    group : "Appearance",
                    defaultValue : null
                },
                "y" : {
                    type : "sap.ui.core.CSSSize",
                    group : "Appearance",
                    defaultValue : null
                },
                "w" : {
                    type : "sap.ui.core.CSSSize",
                    group : "Appearance",
                    defaultValue : "200px"
                },
                "h" : {
                    type : "sap.ui.core.CSSSize",
                    group : "Appearance",
                    defaultValue : "200px"
                },
                "depth" : {
                    type : "int",
                    group : "Appearance",
                    defaultValue : null
                },
                "flipped" : {
                    type : "boolean",
                    group : "Behavior",
                    defaultValue : null
                },
                "enabled" : {
                    type : "boolean",
                    group : "Behavior",
                    defaultValue : true
                },
                "selected" : {
                    type : "boolean",
                    group : "Behavior",
                    defaultValue : false
                },
                "storageId" : {
                    type : "int",
                    group : "Identification",
                    defaultValue : -1
                },
                "resizable" : {
                    type : "boolean",
                    group : "Misc",
                    defaultValue : false
                }
            },
            aggregations : {
                "_buttonFlip" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_inputTitle" : {
                    type : "sap.m.Input",
                    multiple : false,
                    visibility : "hidden"
                },
                "_iconResize" : {
                    type : "sap.ui.core.Icon",
                    multiple : false,
                    visibility : "hidden"
                },
                "childs" : {
                    type : "sap.ino.wall.WallItemBase",
                    multiple : true,
                    singularName : "child",
                    bindable : "bindable"
                }
            },
            events : {
                "dataChange" : {},
                "positionChange" : {}
            }
        }
    });

    /**
     * Creates a new subclass of class sap.ino.wall.WallItemBase with name <code>sClassName</code> and enriches it
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
     * @name sap.ino.wall.WallItemBase.extend
     * @function
     */

    sap.ino.wall.WallItemBase.M_EVENTS = {
        'dataChange' : 'dataChange',
        'positionChange' : 'positionChange'
    };

    /**
     * Getter for property <code>title</code>. The title of the item.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {string} the value of property <code>title</code>
     * @public
     * @name sap.ino.wall.WallItemBase#getTitle
     * @function
     */

    /**
     * Setter for property <code>title</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {string}
     *            sTitle new value for property <code>title</code>
     * @return {sap.ino.wall.WallItemBase} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemBase#setTitle
     * @function
     */

    /**
     * Getter for property <code>x</code>. The horizontal position of the item on the wall.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {sap.ui.core.CSSSize} the value of property <code>x</code>
     * @public
     * @name sap.ino.wall.WallItemBase#getX
     * @function
     */

    /**
     * Setter for property <code>x</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {sap.ui.core.CSSSize}
     *            sX new value for property <code>x</code>
     * @return {sap.ino.wall.WallItemBase} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemBase#setX
     * @function
     */

    /**
     * Getter for property <code>y</code>. The vertical position of the item on the wall.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {sap.ui.core.CSSSize} the value of property <code>y</code>
     * @public
     * @name sap.ino.wall.WallItemBase#getY
     * @function
     */

    /**
     * Setter for property <code>y</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {sap.ui.core.CSSSize}
     *            sY new value for property <code>y</code>
     * @return {sap.ino.wall.WallItemBase} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemBase#setY
     * @function
     */

    /**
     * Getter for property <code>w</code>. The width of the item.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {sap.ui.core.CSSSize} the value of property <code>w</code>
     * @public
     * @name sap.ino.wall.WallItemBase#getW
     * @function
     */

    /**
     * Setter for property <code>w</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {sap.ui.core.CSSSize}
     *            sW new value for property <code>w</code>
     * @return {sap.ino.wall.WallItemBase} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemBase#setW
     * @function
     */

    /**
     * Getter for property <code>h</code>. The height of the item.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {sap.ui.core.CSSSize} the value of property <code>h</code>
     * @public
     * @name sap.ino.wall.WallItemBase#getH
     * @function
     */

    /**
     * Setter for property <code>h</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {sap.ui.core.CSSSize}
     *            sH new value for property <code>h</code>
     * @return {sap.ino.wall.WallItemBase} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemBase#setH
     * @function
     */

    /**
     * Getter for property <code>depth</code>. The depth of the item.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {int} the value of property <code>depth</code>
     * @public
     * @name sap.ino.wall.WallItemBase#getDepth
     * @function
     */

    /**
     * Setter for property <code>depth</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {int}
     *            iDepth new value for property <code>depth</code>
     * @return {sap.ino.wall.WallItemBase} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemBase#setDepth
     * @function
     */

    /**
     * Getter for property <code>flipped</code>. Defines wheter the front or back side of the item is visible.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {boolean} the value of property <code>flipped</code>
     * @public
     * @name sap.ino.wall.WallItemBase#getFlipped
     * @function
     */

    /**
     * Setter for property <code>flipped</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {boolean}
     *            bFlipped new value for property <code>flipped</code>
     * @return {sap.ino.wall.WallItemBase} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemBase#setFlipped
     * @function
     */

    /**
     * Getter for property <code>enabled</code>. Boolean property to enable the control (default is true).
     * 
     * Default value is <code>true</code>
     * 
     * @return {boolean} the value of property <code>enabled</code>
     * @public
     * @name sap.ino.wall.WallItemBase#getEnabled
     * @function
     */

    /**
     * Setter for property <code>enabled</code>.
     * 
     * Default value is <code>true</code>
     * 
     * @param {boolean}
     *            bEnabled new value for property <code>enabled</code>
     * @return {sap.ino.wall.WallItemBase} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemBase#setEnabled
     * @function
     */

    /**
     * Getter for property <code>selected</code>. Boolean property to select the control (default is false).
     * 
     * Default value is <code>false</code>
     * 
     * @return {boolean} the value of property <code>selected</code>
     * @public
     * @name sap.ino.wall.WallItemBase#getSelected
     * @function
     */

    /**
     * Setter for property <code>selected</code>.
     * 
     * Default value is <code>false</code>
     * 
     * @param {boolean}
     *            bSelected new value for property <code>selected</code>
     * @return {sap.ino.wall.WallItemBase} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemBase#setSelected
     * @function
     */

    /**
     * Getter for property <code>storageId</code>. Temp: stores the db id of this wallItem
     * 
     * Default value is <code>-1</code>
     * 
     * @return {int} the value of property <code>storageId</code>
     * @public
     * @name sap.ino.wall.WallItemBase#getStorageId
     * @function
     */

    /**
     * Setter for property <code>storageId</code>.
     * 
     * Default value is <code>-1</code>
     * 
     * @param {int}
     *            iStorageId new value for property <code>storageId</code>
     * @return {sap.ino.wall.WallItemBase} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemBase#setStorageId
     * @function
     */

    /**
     * Getter for property <code>resizable</code>. This flag defines whether the WallItem can be resized or not.
     * 
     * Default value is <code>false</code>
     * 
     * @return {boolean} the value of property <code>resizable</code>
     * @public
     * @name sap.ino.wall.WallItemBase#getResizable
     * @function
     */

    /**
     * Setter for property <code>resizable</code>.
     * 
     * Default value is <code>false</code>
     * 
     * @param {boolean}
     *            bResizable new value for property <code>resizable</code>
     * @return {sap.ino.wall.WallItemBase} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemBase#setResizable
     * @function
     */

    /**
     * Getter for aggregation <code>childs</code>.<br/> Items attached to this item that should be moved together
     * 
     * @return {sap.ino.wall.WallItemBase[]}
     * @public
     * @name sap.ino.wall.WallItemBase#getChilds
     * @function
     */

    /**
     * Inserts a child into the aggregation named <code>childs</code>.
     * 
     * @param {sap.ino.wall.WallItemBase}
     *            oChild the child to insert; if empty, nothing is inserted
     * @param {int}
     *            iIndex the <code>0</code>-based index the child should be inserted at; for a negative value of
     *            <code>iIndex</code>, the child is inserted at position 0; for a value greater than the current size
     *            of the aggregation, the child is inserted at the last position
     * @return {sap.ino.wall.WallItemBase} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemBase#insertChild
     * @function
     */

    /**
     * Adds some child <code>oChild</code> to the aggregation named <code>childs</code>.
     * 
     * @param {sap.ino.wall.WallItemBase}
     *            oChild the child to add; if empty, nothing is inserted
     * @return {sap.ino.wall.WallItemBase} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemBase#addChild
     * @function
     */

    /**
     * Removes an child from the aggregation named <code>childs</code>.
     * 
     * @param {int |
     *            string | sap.ino.wall.WallItemBase} vChild the child to remove or its index or id
     * @return {sap.ino.wall.WallItemBase} the removed child or null
     * @public
     * @name sap.ino.wall.WallItemBase#removeChild
     * @function
     */

    /**
     * Removes all the controls in the aggregation named <code>childs</code>.<br/> Additionally unregisters them
     * from the hosting UIArea.
     * 
     * @return {sap.ino.wall.WallItemBase[]} an array of the removed elements (might be empty)
     * @public
     * @name sap.ino.wall.WallItemBase#removeAllChilds
     * @function
     */

    /**
     * Checks for the provided <code>sap.ino.wall.WallItemBase</code> in the aggregation named <code>childs</code>
     * and returns its index if found or -1 otherwise.
     * 
     * @param {sap.ino.wall.WallItemBase}
     *            oChild the child whose index is looked for.
     * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
     * @public
     * @name sap.ino.wall.WallItemBase#indexOfChild
     * @function
     */

    /**
     * Destroys all the childs in the aggregation named <code>childs</code>.
     * 
     * @return {sap.ino.wall.WallItemBase} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemBase#destroyChilds
     * @function
     */

    /**
     * Binder for aggregation <code>childs</code>.
     * 
     * @param {string}
     *            sPath path to a list in the model
     * @param {sap.ui.core.Element}
     *            oTemplate the control template for this aggregation
     * @param {sap.ui.model.Sorter}
     *            oSorter the initial sort order (optional)
     * @param {array}
     *            aFilters the predefined filters for this aggregation (optional)
     * @return {sap.ino.wall.WallItemBase} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemBase#bindChilds
     * @function
     */

    /**
     * Unbinder for aggregation <code>childs</code>.
     * 
     * @return {sap.ino.wall.WallItemBase} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemBase#unbindChilds
     * @function
     */

    /**
     * 
     * @name sap.ino.wall.WallItemBase#dataChange
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
     * Attach event handler <code>fnFunction</code> to the 'dataChange' event of this
     * <code>sap.ino.wall.WallItemBase</code>.<br/>. When called, the context of the event handler (its
     * <code>this</code>) will be bound to <code>oListener<code> if specified
     * otherwise to this <code>sap.ino.wall.WallItemBase</code>.<br/> itself. 
     *  
     *
     * @param {object}
     *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
     * @param {function}
     *            fnFunction The function to call, when the event occurs.  
     * @param {object}
     *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ino.wall.WallItemBase</code>.<br/> itself.
     *
     * @return {sap.ino.wall.WallItemBase} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemBase#attachDataChange
     * @function
     */

    /**
     * Detach event handler <code>fnFunction</code> from the 'dataChange' event of this
     * <code>sap.ino.wall.WallItemBase</code>.<br/>
     * 
     * The passed function and listener object must match the ones used for event registration.
     * 
     * @param {function}
     *            fnFunction The function to call, when the event occurs.
     * @param {object}
     *            oListener Context object on which the given function had to be called.
     * @return {sap.ino.wall.WallItemBase} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemBase#detachDataChange
     * @function
     */

    /**
     * Fire event dataChange to attached listeners.
     * 
     * @param {Map}
     *            [mArguments] the arguments to pass along with the event.
     * @return {sap.ino.wall.WallItemBase} <code>this</code> to allow method chaining
     * @protected
     * @name sap.ino.wall.WallItemBase#fireDataChange
     * @function
     */

    /**
     * 
     * @name sap.ino.wall.WallItemBase#positionChange
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
     * Attach event handler <code>fnFunction</code> to the 'positionChange' event of this
     * <code>sap.ino.wall.WallItemBase</code>.<br/>. When called, the context of the event handler (its
     * <code>this</code>) will be bound to <code>oListener<code> if specified
     * otherwise to this <code>sap.ino.wall.WallItemBase</code>.<br/> itself. 
     *  
     *
     * @param {object}
     *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
     * @param {function}
     *            fnFunction The function to call, when the event occurs.  
     * @param {object}
     *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ino.wall.WallItemBase</code>.<br/> itself.
     *
     * @return {sap.ino.wall.WallItemBase} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemBase#attachPositionChange
     * @function
     */

    /**
     * Detach event handler <code>fnFunction</code> from the 'positionChange' event of this
     * <code>sap.ino.wall.WallItemBase</code>.<br/>
     * 
     * The passed function and listener object must match the ones used for event registration.
     * 
     * @param {function}
     *            fnFunction The function to call, when the event occurs.
     * @param {object}
     *            oListener Context object on which the given function had to be called.
     * @return {sap.ino.wall.WallItemBase} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemBase#detachPositionChange
     * @function
     */

    /**
     * Fire event positionChange to attached listeners.
     * 
     * @param {Map}
     *            [mArguments] the arguments to pass along with the event.
     * @return {sap.ino.wall.WallItemBase} <code>this</code> to allow method chaining
     * @protected
     * @name sap.ino.wall.WallItemBase#firePositionChange
     * @function
     */

    /* =========================================================== */
    /* begin: control lifecycle methods */
    /* =========================================================== */

    /**
     * Initializes the control.
     * 
     * @private
     */
    sap.ino.wall.WallItemBase.prototype.init = function() {
        this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.wall");
        this._saveTimer = undefined;
    };

    /**
     * Destroys the control.
     * 
     * @private
     */
    sap.ino.wall.WallItemBase.prototype.exit = function() {
        this._saveTimer = undefined;
        this._totalDeltaX = 0;
        this._totalDeltaY = 0;
        this._snapDeltaX = 0;
        this._snapDeltaY = 0;
    };

    /**
     * Adjusts control after rendering.
     * 
     * @private
     */
    sap.ino.wall.WallItemBase.prototype.onAfterRendering = function() {
        var $this = this.$();

        // call item hook to react on initial resize changes
        if (this._onResize) {
            this._onResize(true);
        }
        // position child container relative to the parent dimensions
        if (this.getParent() instanceof sap.ino.wall.Wall || this.getParent() instanceof sap.ino.wall.WallItemGroup) {
            this._adjustChildContainerPositioning(this.$("childs"));
        }
        // adjust visibility for IE after re-rendering (this should not occur anyway)
        if (sap.ui.Device.browser.internet_explorer) {
            if (this.getFlipped()) {
                $this.children(".flippable").find(".back").css("backface-visibility", "visible");
                $this.children(".flippable").find(".front").css("display", "none");
            }
        }

        var $FlipButtonGroup = $this.find(".sapInoWallWIFlipBackButtonGroup");
        if ($FlipButtonGroup && $FlipButtonGroup.length > 0) {
            $FlipButtonGroup.attr("aria-label", this._oRB.getText("CTRL_WALL_ITEMBASE_EXP_FLIPBUTTON"));
        } else {
            var $FlipButton = $this.find(".sapInoWallWIFlipBackButton");
            if ($FlipButton && $FlipButton.length > 0) {
                $FlipButton.attr("aria-label", this._oRB.getText("CTRL_WALL_ITEMBASE_EXP_FLIPBUTTON"));
            }
        }
    };

    sap.ino.wall.WallItemBase.prototype.setFocusVisible = function(bVisible) {
        if (bVisible || bVisible === undefined) {
            this.addStyleClass("sapInoWallWIBVisibleFocus");
        } else {
            this.removeStyleClass("sapInoWallWIBVisibleFocus");
        }
    };

    sap.ino.wall.WallItemBase.prototype.onfocusout = function(oEvent) {
        this.removeStyleClass("sapInoWallWIBVisibleFocus");
    };

    sap.ino.wall.WallItemBase.prototype.onkeydown = function(oEvent) {
        var $this = this.$();
        
        // do nothing if wall is locked
        if (sap.ino.wall.WallMode.Write !== this.getWall().getMode()) {
        	if (this.getFlipped()) {
        		this.setFlipped(false, true);
                $this.focus();
        	}
        	return;
        }

        // enter the item
        if (!oEvent.ctrlKey && jQuery(oEvent.target).hasClass("sapInoWallWIB") && (oEvent.keyCode === jQuery.sap.KeyCodes.ENTER || oEvent.keyCode === jQuery.sap.KeyCodes.F2)) {
            this.setBackFocus(true);

            oEvent.preventDefault();
            oEvent.stopPropagation();
            oEvent.stopImmediatePropagation();
        } else if ((jQuery(oEvent.target).hasClass("sapInoWallWIFlipBackButton") || jQuery(oEvent.target).hasClass("sapInoWallWIFlipBackButtonNormal")) && oEvent.keyCode === jQuery.sap.KeyCodes.ENTER) {

            this.setFlipped(false, true);
            $this.focus();

            oEvent.preventDefault();
            oEvent.stopPropagation();
            oEvent.stopImmediatePropagation();
        } else if (oEvent.keyCode === jQuery.sap.KeyCodes.TAB && this.getProperty("flipped") && !jQuery(oEvent.target).hasClass("sapInoWallWIB")) {
            // loop item
            var iIndex;
            var aBack = $this.children(".flippable").children(".back").find('input[type=text], textarea, select[tabindex!="-1"], button, [tabindex="0"], .nicEdit-main, .sapInoWallDropUploadArea');
            var $FlipButton = $this.find(".sapInoWallWIFlipBackButton");
            if ($FlipButton && $FlipButton.length > 0) {
                aBack.push($FlipButton[0]);
            }

            aBack = jQuery.grep(aBack, function(oControl) {
                return jQuery(oControl).is(":visible");
            });

            if (aBack && aBack.length > 0) {
                var $Nice = $this.children(".flippable").children(".back").find('.nicEdit-main');
                var bTargetNice = jQuery(oEvent.target).hasClass("nicEdit-main");

                if (bTargetNice && $Nice && $Nice.length > 0) {
                    iIndex = aBack.indexOf($Nice[0]);
                    $Nice.control(0).blur();
                } else {
                    iIndex = aBack.indexOf(oEvent.target);
                }

                // if (iIndex === -1) let someone else handle this => do nothing
                if (iIndex !== -1) {
                    if (oEvent.shiftKey) {
                        iIndex--;
                        if (iIndex === -1) {
                            iIndex = aBack.length - 1;
                        }
                    } else {
                        iIndex++;
                        if (iIndex >= aBack.length) {
                            iIndex = 0;
                        }
                    }
                }

                var oFocus = aBack[iIndex];
                if ($Nice && $Nice.length > 0 && oFocus === $Nice[0]) {
                    jQuery(oFocus).control(0).focus();
                } else {
                    jQuery(oFocus).focus();
                }

                oEvent.preventDefault();
                oEvent.stopPropagation();
                oEvent.stopImmediatePropagation();
            }
        } else if (oEvent.keyCode === jQuery.sap.KeyCodes.ESCAPE && this.getProperty("flipped") && !jQuery(oEvent.target).hasClass("sapInoWallWIB")) {
            this.setFlipped(false, true);
            $this.focus();

            oEvent.preventDefault();
            oEvent.stopPropagation();
            oEvent.stopImmediatePropagation();
        }
    };

    /* =========================================================== */
    /* begin: API methods */
    /* =========================================================== */

    /**
     * Creates a minimalic JSON representation of the item to be stored in the db.
     * 
     * @returns {object} the JSON object representation of the item
     * @public
     */
    sap.ino.wall.WallItemBase.prototype.formatToJSON = function() {
        // TODO: this function is currently called by the items, do it the other way round to be consistent and be able
        // to modify the result?
        var oWall = this.getWall(), aChilds = this.getChilds() || [], oResult, i = 0;

        oResult = {
            "id" : this.getStorageId(),
            "parentId" : (this.getParent() instanceof sap.ino.wall.WallItemBase ? this.getParent().getStorageId() : "0"),
            "wallId" : oWall.getStorageId(),
            "title" : this.getTitle(),
            "className" : this.getMetadata()._sClassName,
            "position" : {
                "x" : this.getX(),
                "y" : this.getY()
            },
            "w" : this.getW(),
            "h" : this.getH(),
            "depth" : this.getDepth(),
            "content" : {
            // TODO: remove content, it is not needed and only brings overhead
            }
        };

        // add child items to JSON format
        if (aChilds.length) {
            oResult.childs = [];
            // add JSON for each child
            for (; i < aChilds.length; i++) {
                oResult.childs.push(aChilds[i].formatToJSON());
            }
        }

        return oResult;
    };

    /**
     * Setter for the title property to suppress re-rendering.
     * 
     * @param {string}
     *            sTitle the value
     * @param {boolean}
     *            bSuppressNotify flag to suppress notification of the wall
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemBase.prototype.setTitle = function(sTitle, bSuppressNotify) {
        if (this.getTitle() !== sTitle) {
            this.setProperty("title", sTitle, true);
            if (this._isRendered()) {
                if (this instanceof sap.ino.wall.WallItemGroup) {
                    this.$().children(".flippable").children(".front").find(".sapInoWallWIGTitle").find(".sapInoWallWITitleText").text(sTitle);
                } else {
                    this.$().children(".flippable").children(".front").find(".sapInoWallWITitleText").text(sTitle);
                }
            }
            // inform wall that this item has changed a persistence property
            if (this.getParent() && !bSuppressNotify) {
                this.getParent()._notifyItemChanged(this);
            }
        }
        return this;
    };

    /**
     * Setter for the depth property to suppress re-rendering.
     * 
     * @param {integer}
     *            iDepth the value
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemBase.prototype.setDepth = function(iDepth) {
        if (this.getDepth() !== iDepth) {
            this.setProperty("depth", iDepth, true);
            this.$().css("z-index", iDepth);
            // inform wall that this item has changed a persistence property
            if (this.getParent()) {
                this.getParent()._notifyItemChanged(this);
            }
        }
        return this;
    };

    /**
     * Setter for the enabled property to suppress re-rendering
     * 
     * @param {boolean}
     *            bEnabled the value
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemBase.prototype.setEnabled = function(bEnabled) {
        if (this.getEnabled() !== bEnabled) {
            this.setProperty("enabled", bEnabled, true);
            if (bEnabled) {
                this.removeStyleClass("sapInoWallWIBDisabled");
            } else {
                this.addStyleClass("sapInoWallWIBDisabled");
            }
        }
        return this;
    };

    /**
     * Setter for the selected property to suppress re-rendering
     * 
     * @param {boolean}
     *            bSelected the value
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemBase.prototype.setSelected = function(bSelected) {
        if (this.getSelected() !== bSelected) {
            this.setProperty("selected", bSelected, true);
            if (bSelected) {
                this.addStyleClass("sapInoWallWIBSelected");
            } else {
                this.removeStyleClass("sapInoWallWIBSelected");
            }
        }
        return this;
    };

    /**
     * Setter for the storageId property to suppress re-rendering
     * 
     * @param {integer}
     *            iValue the value
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemBase.prototype.setStorageId = function(iValue) {
        this.setProperty("storageId", iValue, true);
        return this;
    };

    /**
     * Setter for the x property to suppress re-rendering
     * 
     * @param {integer}
     *            iValue the value
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemBase.prototype.setX = function(iValue) {
        if (jQuery.type(iValue) === "number") {
            iValue += "px";
        }

        if (this.getX() !== iValue) {
            this.setProperty("x", iValue, true);
            this.$().css("left", iValue);
            // inform wall that this item has changed a persistence property
            if (this.getParent()) {
                this.getParent()._notifyItemChanged(this);
            }
        }
        return this;
    };

    /**
     * Setter for the y property to suppress re-rendering
     * 
     * @param {integer}
     *            iValue the value
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemBase.prototype.setY = function(iValue) {
        if (jQuery.type(iValue) === "number") {
            iValue += "px";
        }

        if (this.getY() !== iValue) {
            this.setProperty("y", iValue, true);
            this.$().css("top", iValue);
            // inform wall that this item has changed a persistence property
            if (this.getParent()) {
                this.getParent()._notifyItemChanged(this);
            }
        }
        return this;
    };

    /**
     * Helper method to set x and y property together
     * 
     * @param {integer}
     *            x the value
     * @param {integer}
     *            y the value
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemBase.prototype.setXY = function(x, y) {
        this.setX(x);
        this.setY(y);
        return this;
    };

    /**
     * Setter for the w property to suppress re-rendering
     * 
     * @param {CSSSize}
     *            sValue the value
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemBase.prototype.setW = function(sValue) {
        // minimum size of resizable items is 150px
        var iValue = parseInt(sValue, 10);

        if (jQuery.type(sValue) === "number") {
            sValue += "px";
        }

        if (this instanceof sap.ino.wall.WallItemSprite) {
            if (iValue <= 48) { // or 48px for Sprite
                sValue = "48px";
            }
        } else if (this instanceof sap.ino.wall.WallItemArrow) {
            if (iValue <= 1) { // or 0px for Arrow
                sValue = "1px";
            }
        } else if (iValue < sap.ino.wall.WallConfig._ITEM_MIN_SIZE) {
            sValue = sap.ino.wall.WallConfig._ITEM_MIN_SIZE + "px";
        }
        if (this.getW() !== sValue) {
            this.setProperty("w", sValue, true);
            this.$().css("width", sValue);
            this.$("front").css("width", sValue);
            this.$("back").css("width", sValue);
            // inform wall that this item has changed a persistence property
            if (this.getParent()) {
                this.getParent()._notifyItemChanged(this);
            }
        }
        return this;
    };

    /**
     * Setter for the h property to suppress re-rendering
     * 
     * @param {CSSSize}
     *            sValue the value
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemBase.prototype.setH = function(sValue) {
        // minimum size of resizable items is 150px
        var iValue = parseInt(sValue, 10);

        if (jQuery.type(sValue) === "number") {
            sValue += "px";
        }

        if (this instanceof sap.ino.wall.WallItemSprite) {
            if (iValue <= 48) { // or 48px for Sprite
                sValue = "48px";
            }
        } else if (this instanceof sap.ino.wall.WallItemArrow) {
            if (iValue <= 1) { // or 0px for Arrow
                sValue = "1px";
            }
        } else if (iValue < sap.ino.wall.WallConfig._ITEM_MIN_SIZE) {
            sValue = sap.ino.wall.WallConfig._ITEM_MIN_SIZE + "px";
        }
        if (this.getH() !== sValue) {
            this.setProperty("h", sValue, true);
            this.$().css("height", sValue);
            this.$("front").css("height", sValue);
            this.$("back").css("height", sValue);
            // inform wall that this item has changed a persistence property
            if (this.getParent()) {
                this.getParent()._notifyItemChanged(this);
            }
        }
        return this;
    };

    /**
     * Helper method to set w and h property together
     * 
     * @param {integer}
     *            w the value
     * @param {integer}
     *            h the value
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemBase.prototype.setWH = function(w, h) {
        this.setW(w);
        this.setH(h);
        return this;
    };

    /**
     * Setter for the flipped property to suppress re-rendering It displays the front/back side of the item and
     * implements worarounds for several browser issues
     * 
     * @param {boolean}
     *            bFlipped the value
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemBase.prototype.setFlipped = function(bFlipped, bVisualizeFocus) {
        var that = this, $this = this.$(), oWall = this.getWall();

        // cloned item does not have a parent yet
        if (!oWall) {
            return;
        }

        // no flipping in readonly mode / if already flipped, flip back to front
        if (oWall.getMode() === "Readonly") {
        	if (this.getFlipped()) {
        		bFlipped = false;
        	}
        	else {
        		return;
        	}
        }

        // fix for IE: do not flip again while transition is going on
        if (this._bFlipModeSquad) {
            return;
        }

        // TODO: rework this, it seems to be too complicated
        /* fix for firefox, there is a bug with backface-visibility for the front side */
        if (sap.ui.Device.browser.firefox) {
            if (bFlipped) {
                setTimeout(function() {
                    $this.children(".flippable").find(".front").css("display", "none");
                }, 180);
            } else {
                setTimeout(function() {
                    $this.children(".flippable").find(".front").css("display", "block");
                }, 200);
                // Firefox does not blur the fields when flipping the items, we do it manually
                this.$().children(".flippable").find("input[type=text], textarea, select").blur();
            }
        }
        /* fix for IE 10 (backface is not showing correctly otherwise) */
        else if (sap.ui.Device.browser.internet_explorer) {
            if (sap.ui.Device.browser.version >= 10) { // fixes for ie10
                if (bFlipped !== this.getFlipped() && !this._bFlipModeSquad) {
                    // set flipped is called twice, once by ontouchend and another time by the button press event
                    // we set a flag to remember that a flip is currently active and we handle only one event
                    this._bFlipModeSquad = true;

                    // show front side (for opacity animation)
                    if (!bFlipped) {
                        // $this.children(".flippable").find(".front").css("display", "block");
                        $this.children(".flippable").find(".back").css("backface-visibility", "visible");
                    }
                    // show trigger backface visibility and hide front side after 300ms (1/2 animation time
                    if (bFlipped) {
                        $this.children(".flippable").find(".back").css("backface-visibility", "hidden");
                        setTimeout(function() {
                            $this.children(".flippable").find(".back").css("backface-visibility", "visible");
                            $this.children(".flippable").find(".front").css("display", "none");
                        }, 250);
                    } else {
                        setTimeout(function() {
                            $this.children(".flippable").find(".back").css("backface-visibility", "hidden");
                            $this.children(".flippable").find(".front").css("display", "block");
                        }, 250);
                    }
                    // hide front side because it can be clicked even on the backside (due to opacity animation)
                    setTimeout(function() {
                        that._bFlipModeSquad = false;
                    }, 600);
                }
                // IE does not blur the fields when flipping the items, we do it manually
                this.$().children(".flippable").find("input[type=text], textarea, select").blur();
            } else { // fixes for ie9
                // ie9 does not support backface visibility, we just switch the display mode
                $this.children(".flippable").find(".front").css("display", (bFlipped ? "none" : "block"));
                $this.children(".flippable").find(".back").css("display", (!bFlipped ? "none" : "block"));
                // call item hook to react on resize changes after flip for IE9
                if (this._onResize) {
                    this._onResize(true);
                }
            }
        }

        // for all browsers, hide the not visible side (and show the visible)
        $this.children(".flippable").find(".front").css("visibility", "visible");
        $this.children(".flippable").find(".back").css("visibility", "visible");
        setTimeout(function() {
            $this.children(".flippable").find(".front").css("visibility", (bFlipped ? "hidden" : "visible"));
            $this.children(".flippable").find(".back").css("display", (bFlipped ? "visible" : "hidden"));
        }, 300);

        // focus first element if on back side
        if (bFlipped && !this.getFlipped()) {
            if (!sap.ui.Device.support.touch) {
                setTimeout(function() {
                    $this.children(".flippable").children(".back").find('input[type=text], textarea, select[tabindex!="-1"], button, [tabindex="0"], .sapInoWallDropUploadArea').filter(':visible:first').focus();
                    // nicEdit content needs to be focussed manually
                    if (that.$().find(".nicEdit-main").control(0)) {
                        that.$().find(".nicEdit-main").control(0).focus();
                    }
                }, 300);
            }
        } else {
            // nicEdit content needs to be blurred manually
            if (this.$().find(".nicEdit-main").control(0)) {
                this.$().find(".nicEdit-main").control(0).blur();
            }
        }

        if (!bFlipped) {
            setTimeout(function() {
                // select item
                that.setFocusVisible(bVisualizeFocus === true); /* explicit comparision required! */
                $this.focus();
            }, 200);
        }

        // save property without rerendering
        this.setProperty("flipped", bFlipped, true);

        // toggle css animation
        this.$().toggleClass("flipped", bFlipped);
    };

    sap.ino.wall.WallItemBase.prototype.setBackFocus = function() {
        var that = this, $this = this.$();

        if (this.getFlipped()) {
            if (!sap.ui.Device.support.touch) {
                $this.children(".flippable").children(".back").find('input[type=text], textarea, select[tabindex!="-1"], button, [tabindex="0"], .sapInoWallDropUploadArea').filter(':visible:first').focus();
                // nicEdit content needs to be focussed manually
                if (that.$().find(".nicEdit-main").control(0)) {
                    that.$().find(".nicEdit-main").control(0).focus();
                }
            }
        } else {
            this.setFlipped(true);
        }
    };

    /**
     * Adds a child item without rerendering the wall item
     * 
     * @override
     * @returns {this} this pointer for chaining
     * @private
     */
    sap.ino.wall.WallItemBase.prototype.addChildWithoutRendering = function(oItem) {
        var $childContainer = this.$("childs");

        // set initial width if child is added because the child container will push the container to a larger width
        // otherwise
        if (!this.getW() && !(this instanceof sap.ino.wall.WallItemHeadline)) {
            this.setW(sap.ino.wall.WallConfig._ITEM_MIN_SIZE + "px");
        }
        this.addAggregation("childs", oItem, true);
        sap.ino.wall.util.Helper.renderItemIntoContainer($childContainer[0], oItem, false, true);
        $childContainer.removeClass("sapInoWallInvisible");

        this._adjustChildContainerPositioning($childContainer);

        return this;
    };

    /**
     * Remove a child item without rerendering the wall item
     * 
     * @override
     * @returns {this} this pointer for chaining
     * @private
     */
    sap.ino.wall.WallItemBase.prototype.removeChildWithoutRendering = function(oItem) {
        var $childContainer = this.$("childs"), aChilds = this.getChilds() || [];

        this.removeAggregation("childs", oItem, true);
        oItem.$().remove();

        if (aChilds.length === 0) {
            $childContainer.addClass("sapInoWallInvisible");
        } else {
            this._adjustChildContainerPositioning($childContainer);
        }

        return this;
    };

    /**
     * Positions the childcontainer correctly for Firefox and IE (scale-based position centers the item)
     * 
     * @param {jQuery.Selector}
     *            $dom a jQuery selector
     * @returns {this} this pointer for chaining
     * @private
     */
    sap.ino.wall.WallItemBase.prototype._adjustChildContainerPositioning = function($container) {
        var fLeftPosition = parseInt(this.getW(), 10) - 20, iWidth, iHeight, fZoomFactor;
        // zoom based calculations do also zoom the position
        if (sap.ui.Device.browser.chrome) {
            fLeftPosition /= sap.ino.wall.WallConfig._ITEM_CHILD_ZOOM;
        }
        // adjust the child container position to the current size of the item
        $container.css("left", (isNaN(fLeftPosition) ? "0" : fLeftPosition) + "px");
        $container.css("top", "30px");

        // ff+ie+sf: scaling the container will center the dimensions, so we have to deduct the half of the difference
        // to the normal size
        if (!sap.ino.wall.config.Config.getZoomCapable()) {
            iWidth = parseInt($container.css("width"), 10);
            iHeight = parseInt($container.css("height"), 10);
            fZoomFactor = sap.ino.wall.WallConfig._ITEM_CHILD_ZOOM;

            // scaling the container will center the dimensions, so we have to deduct the half of the difference to the
            // normal size
            $container.css("left", parseInt($container.css("left"), 10) + (iWidth * fZoomFactor - iWidth) / 2.0);
            $container.css("top", parseInt($container.css("top"), 10) + (iHeight * fZoomFactor - iHeight) / 2.0);
        }

        return this;
    };

    /**
     * Returns the wall instance from the parent chain if the item is placed on a wall
     * 
     * @returns {Wall} the wall instance
     * @private
     */
    sap.ino.wall.WallItemBase.prototype.getWall = function() {
        var oParent = this, i = 0;

        // stop after three iterations (child of a member of a group is the deepest hirarchy it can get currently)
        while (i < 3 && oParent) {
            oParent = oParent.getParent();
            if (oParent instanceof sap.ino.wall.Wall) {
                return oParent;
            }
            i++;
        }
    };

    /* =========================================================== */
    /* begin: events */
    /* =========================================================== */

    /**
     * Do not select any text while the item is moving
     * 
     * @param {jQuery.EventObject}
     *            oEvent The event object
     * @override
     * @private
     */
    sap.ino.wall.WallItemBase.prototype.onselectstart = function(oEvent) {
        if (this._bMoving) {
            oEvent.preventDefault();
            oEvent.stopPropagation();
            return false;
        } else {
            sap.ui.core.Control.prototype.onselectstart.apply(this, arguments);
        }
    };

    sap.ino.wall.WallItemBase.prototype.ondragstart = function(oEvent) {
        // TODO: find out how to pass data by drag and drop
        // oEvent.preventDefault();
        // oEvent.stopPropagation();
        // oEvent.dataTransfer.effectAllowed = 'move';
        // oEvent.dataTransfer.setData('text/html', this.getStorageId());
        oEvent.data = this.getStorageId();
        // debugger;
        oEvent.preventDefault();
        oEvent.stopPropagation();
        // oEvent.dataTransfer.effectAllowed = 'move';
        // oEvent.dataTransfer.setData('text/html', this.getStorageId());
    };

    /**
     * Handle the touch start/click event.
     * 
     * @param {jQuery.EventObject}
     *            oEvent The event object
     * @private
     */
    sap.ino.wall.WallItemBase.prototype.ontouchstart = function(oEvent) {
        var oWall = this.getWall(), oClonedItem;

        if (oWall.getMode() === "Readonly" || oWall._bSpacePressed) {
            return;
        }

        // we don't process events on items while something is attached to the cursor on the wall (let the wall take
        // care of it
        if (oWall._hasFollowCursorItems()) {
            return;
        }

        // an inner item was moved (e.g. a group child), ignore this event
        if (oEvent.isMarked("_sapInoWallInnerItemMove")) {
            return;
        }

        // firefox fix: when clicking on scrollbar we do not want to move the item or flip
        // this calculates the click coordinates and checks if they are outside the container
        if (sap.ui.Device.browser.firefox && (jQuery(oEvent.target).parent().hasClass("sapMTextArea") || jQuery(oEvent.target).hasClass("sapInoWallScrollable")) && (oEvent.pageX - jQuery(oEvent.target).offset().left - jQuery(oEvent.target).width() * oWall.getZoom() / 100 > -16 * oWall.getZoom() / 100 || oEvent.pageY - $(oEvent.target).offset().top - $(oEvent.target).height() * oWall.getZoom() / 100 > -16 * oWall.getZoom() / 100)) {
            oEvent.preventDefault();
            oEvent.stopPropagation();
            return;
        }

        // internet explorer fix: no touchend event is fired when clicking scrollbar
        if (sap.ui.Device.browser.internet_explorer && (this instanceof sap.ino.wall.WallItemText && jQuery(oEvent.target).control(0) instanceof sap.m.ScrollContainer || jQuery(oEvent.target).hasClass("sapInoWallScrollable")) &&
        // check if we hit the vertical scroll bar
        oEvent.target.clientWidth && oEvent.offsetX - oEvent.target.clientWidth > 0 && oEvent.offsetX - oEvent.target.clientWidth < 20 * oWall.getZoom() / 100) {
            oEvent.preventDefault();
            oEvent.stopPropagation();
            return;
        }

        // when selecting text in input fields, we do not want to start dragging the item
        if ((jQuery(oEvent.target).filter('input[type=text],textarea,select').length) || oEvent.srcControl instanceof sap.ino.wall.TextEditor) {
            // increase depth so that the item is topmost
            if (this._touchMode !== sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVECHILD) {
                this.setDepth(oWall._getNextDepth());
            }
            return;
        }

        // wall gets this event afterwards, we mark it so that the wall knows it was already processed
        // the buttons and inner controls get it even later so we cannot stop the propagation here
        oEvent.setMarked("_sapInoWallInnerItemMove");

        // detect touch move based on DOM element that was hit (resize icon or the resize div is a resize, otherwise
        // move)
        // the order is important here:
        // - children cannot be resized
        // - but group items can
        // - group items can also be moved
        // - everything else is just a normal move
        var bCustomItemTouchStart = false;
        if (typeof this.onTouchStartItem === "function") {
            bCustomItemTouchStart = this.onTouchStartItem(oEvent);
            if (bCustomItemTouchStart == null || bCustomItemTouchStart == undefined) {
                return true;
            }
        }
        if (!bCustomItemTouchStart) {
            if (this.getParent() instanceof sap.ino.wall.WallItemBase && !(this.getParent() instanceof sap.ino.wall.WallItemGroup)) {
                this._touchMode = sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVECHILD;
            } else if (this.getResizable() && (jQuery(oEvent.target).hasClass("sapInoWallWIResizeHandle") || jQuery(oEvent.target).parent().hasClass("sapInoWallWIResizeHandle"))) {
                this._touchMode = sap.ino.wall.WallConfig._ITEM_TOUCHMODE_RESIZE;
                this._touchStartItemWidth = parseFloat(this.getW() ? this.getW() : "160px");
                this._touchStartItemHeight = parseFloat(this.getH() ? this.getH() : "160px");
                this._touchStartItemX = parseFloat(this.getX());
                this._touchStartItemY = parseFloat(this.getY());
            } else if (this.getParent() instanceof sap.ino.wall.WallItemGroup) {
                this._touchMode = sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVEGROUPITEM;
            } else {
                this._touchMode = sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVE;
            }
        }

        // disable text selection globally until touchend event
        jQuery(document).disableSelection();

        // just invert selection when using shift key
        if (oEvent.shiftKey && !oEvent.ctrlKey && this._touchMode !== sap.ino.wall.WallConfig._ITEM_TOUCHMODE_RESIZE) {
            oWall._toggleSelection(this);
            return false;
        }

        // clone item with CTRL key and move
        if (oEvent.ctrlKey && this._touchMode !== sap.ino.wall.WallConfig._ITEM_TOUCHMODE_RESIZE) {
            // we need this position to immediately place the item when it has been moved
            oWall._iItemClonePosition = [sap.ino.wall.util.Helper.getEventX(oEvent), sap.ino.wall.util.Helper.getEventY(oEvent)];
            oClonedItem = this._clone();
            // place the item
            oWall.placeItem(oClonedItem, sap.ino.wall.WallConfig._ADD_MODE_CLONE);

            // do not further proces
            oEvent.preventDefault();
            oEvent.stopPropagation();
            return false;
        }

        // init move/end proxy
        if (!this._touchEndProxy) {
            this._touchEndProxy = jQuery.proxy(this._ontouchend, this);
        }

        if (!this._touchMoveProxy) {
            this._touchMoveProxy = jQuery.proxy(this._ontouchmove, this);
        }

        // here also bound to the mouseup mousemove event to enable it working in desktop browsers
        jQuery(document).on("touchend touchcancel mouseup", this._touchEndProxy);
        jQuery(document).on("touchmove mousemove", this._touchMoveProxy);

        this._totalDeltaX = 0;
        this._totalDeltaY = 0;

        // for line item snapping
        if (this instanceof sap.ino.wall.WallItemLine) {
            this._snapDeltaX = 0;
            this._snapDeltaY = 0;
        }

        this._touchStartMousePositionX = sap.ino.wall.util.Helper.getEventX(oEvent);
        this._touchStartMousePositionY = sap.ino.wall.util.Helper.getEventY(oEvent);

        // increase depth so that the item is topmost
        if (this._touchMode !== sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVECHILD) {
            this.setDepth(oWall._getNextDepth());
        }
    };

    sap.ino.wall.WallItemBase.prototype._clone = function() {
        var oClonedItem = this.clone();
        
        // for some unknown reason, the title property is automatically bound to the default value when cloning
        oClonedItem.unbindProperty("title");
        oClonedItem.setTitle(this.getTitle());

        // set some properties back to default
        var iCloneStorageId = -1;
        oClonedItem.setStorageId(iCloneStorageId--);
        oClonedItem.setSelected(false);
        
        resetItem(oClonedItem);
        
        function resetItem(oClonedItem) {
            jQuery.each(oClonedItem.getChilds(), function(index, oClonedChildItem) {
                oClonedChildItem.setStorageId(iCloneStorageId--);
                oClonedChildItem.setSelected(false);
                resetItem(oClonedChildItem);
            });
        }
        
        return oClonedItem;
    };
    
    /**
     * Handle the touch move event.
     * 
     * @param {jQuery.EventObject}
     *            oEvent The event object
     * @private
     */
    sap.ino.wall.WallItemBase.prototype._ontouchmove = function(oEvent) {
        var oWall = this.getWall(), oTarget, oTargetParent, fDeltaX = sap.ino.wall.util.Helper.getEventX(oEvent) - this._touchStartMousePositionX, fDeltaY = sap.ino.wall.util.Helper.getEventY(oEvent) - this._touchStartMousePositionY, offset = this.$().offset(), fZoomModifier, $trashAbove = null, // chrome
        // only
        // behavior
        $trash, iTrashDistanceX, iTrashDistanceY, $childContainer, aChilds, fCurrentX, fCurrentY, iCurrentW, iCurrentH, aSelectionItems, i = 0, iMaxDelta;
        
        if (!oWall) {
            // Item is currently in sync, and has no parent
            jQuery(document).unbind("touchend touchcancel mouseup", this._touchEndProxy);
            jQuery(document).unbind("touchmove mousemove", this._touchMoveProxy);
            this._bMoving = false;
            return;
        }

        fZoomModifier = 100 / oWall.getZoom();
        $trash = oWall.$("trash");
        if (sap.ui.Device.browser.chrome) {
            $trashAbove = oWall.$("trashAbove");
        }
        iTrashDistanceX = Math.abs(sap.ino.wall.util.Helper.getEventX(oEvent) - $trash.offset().left - 100);
        iTrashDistanceY = Math.abs(sap.ino.wall.util.Helper.getEventY(oEvent) - $trash.offset().top - 100);

        this._touchStartMousePositionX = sap.ino.wall.util.Helper.getEventX(oEvent);
        this._touchStartMousePositionY = sap.ino.wall.util.Helper.getEventY(oEvent);
        this._fDeltaX = fDeltaX;
        this._fDeltaY = fDeltaY;
        this._totalDeltaX += fDeltaX;
        this._totalDeltaY += fDeltaY;

        // when selecting text in input fields, we do not want to move the item
        if ((jQuery(oEvent.target).filter('input[type=text],textarea,select').length) || oEvent.srcControl instanceof sap.ino.wall.TextEditor) {
            return;
        }

        // check if the target or it's parent is an input control that we use inside wall objects (button, select,
        // segmentedButton, dropUpload)
        oTarget = jQuery(oEvent.target).control(0);
        if (oTarget) {
            oTargetParent = oTarget.getParent();
        }
        if (oTarget instanceof sap.m.Select || oTarget instanceof sap.m.Button || oTarget instanceof sap.m.SegmentedButton || oTarget instanceof sap.ino.wall.DropUpload) {
            return;
        } else if (oTargetParent && oTargetParent instanceof sap.m.Select || oTargetParent instanceof sap.m.Button || oTargetParent instanceof sap.m.SegmentedButton || oTargetParent instanceof sap.ino.wall.DropUpload) {
            return;
        }

        // the parent is getting the event after the child, but we don't move it when the child has been moved
        if (oEvent.isMarked("_sapInoWallChildMove")) {
            return;
        }

        if (this._touchMode === sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVECHILD) {
            if (fDeltaX || fDeltaY) {
                // flag this item and the wall as moving
                this._bMoving = true;
                oWall._bMovingItem = true;
            }
            oEvent.setMarked("_sapInoWallChildMove", true);
            if (Math.abs(this._totalDeltaX) >= sap.ino.wall.WallConfig._ITEM_CHILD_UNSNAP_DISTANCE || Math.abs(this._totalDeltaY) >= sap.ino.wall.WallConfig._ITEM_CHILD_UNSNAP_DISTANCE) {
                // detach item and put it on cursor
                this.removeStyleClass("sapInoWallWIBUnsnap");
                this.getParent().removeChildWithoutRendering(this);
                oWall._onmousemoveItemUpdate(this, undefined, oEvent);
                oWall.placeItem(this, sap.ino.wall.WallConfig._ADD_MODE_DETACHGROUPITEM);
                // stop the move event chain here, the item is on the wall again
                jQuery(document).unbind("touchend touchcancel mouseup", this._touchEndProxy);
                jQuery(document).unbind("touchmove mousemove", this._touchMoveProxy);
                this._bMoving = false;
                oWall._bMovingItem = false;
                return;
            } else {
                this.addStyleClass("sapInoWallWIBUnsnap");
            }
        } else if (this._touchMode === sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVE || this._touchMode === sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVEGROUPITEM) {
            if (this._totalDeltaX > 0 || this._totalDeltaY > 0) {
                // set cursor to grabbing
                this.$().addClass("dragCursor");
            }

            // special case line: can only be moved in one direction, other direction swaps orientation
            if (this instanceof sap.ino.wall.WallItemLine) {
                // for line item snapping
                this._snapDeltaX += fDeltaX;
                this._snapDeltaY += fDeltaY;
                if (this.getOrientation() === "HORIZONTAL") {
                    fDeltaX = 0;
                    // switch to vertical mode
                    if (Math.abs(this._snapDeltaX) > 200) {
                        this.setOrientation("VERTICAL");
                        this._snapDeltaX = 0;
                        this._snapDeltaY = 0;
                    }
                } else if (this.getOrientation() === "VERTICAL") {
                    fDeltaY = 0;
                    // switch to horizontal mode
                    if (Math.abs(this._snapDeltaY) > 200) {
                        this.setOrientation("HORIZONTAL");
                        this._snapDeltaX = 0;
                        this._snapDeltaY = 0;
                    }
                }
            }
            if (fDeltaX || fDeltaY) {
                // flag this item and the wall as moving
                this._bMoving = true;
                oWall._bMovingItem = true;

                // move this item
                fCurrentX = parseFloat(this.getX()) || 0;
                fCurrentY = parseFloat(this.getY()) || 0;
                this.setXY((fCurrentX + fDeltaX * fZoomModifier) + "px", (fCurrentY + fDeltaY * fZoomModifier) + "px");

                // special case group item: if group boundaries are exceeded we need to remove the item from the group
                if (this._touchMode === sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVEGROUPITEM) {
                    // make group calculations dirty, they need to be updated when a child moves
                    this.getParent()._recalculateItemDimensions = true;

                    // calculate current dimensions
                    iCurrentW = parseInt(this.getW(), 10) || sap.ino.wall.WallConfig._ITEM_MIN_SIZE;
                    iCurrentH = parseInt(this.getH(), 10) || sap.ino.wall.WallConfig._ITEM_MIN_SIZE;

                    if (fCurrentX < 0 || fCurrentY < 0 || fCurrentX + iCurrentW > (parseInt(this.getParent().getW(), 10 || sap.ino.wall.WallConfig._ITEM_MIN_SIZE)) || fCurrentY + iCurrentH > (parseInt(this.getParent().getH(), 10) || sap.ino.wall.WallConfig._ITEM_MIN_SIZE)) {
                        // remove item from group
                        this.getParent().removeChildWithoutRerendering(this);

                        // place item on the wall again (attach to mouse cursor)
                        oWall._onmousemoveItemUpdate(this, undefined, oEvent);
                        oWall.placeItem(this, sap.ino.wall.WallConfig._ADD_MODE_DETACHCHILD);

                        // stop the move event chain here, the item is on the wall again
                        jQuery(document).unbind("touchend touchcancel mouseup", this._touchEndProxy);
                        jQuery(document).unbind("touchmove mousemove", this._touchMoveProxy);

                        this._bMoving = false;
                        oWall._bMovingItem = false;
                        return false;
                    }
                }

                // move other selected items
                aSelectionItems = oWall._aSelectedItems || [];

                if (aSelectionItems.length) {
                    // only move other items if current item is part of the selection
                    if (!(this instanceof sap.ino.wall.WallItemLine) && $.inArray(this, aSelectionItems) >= 0) {
                        for (; i < aSelectionItems.length; i++) {
                            if (aSelectionItems[i].getId() === this.getId() || aSelectionItems[i] instanceof sap.ino.wall.WallItemLine) {
                                continue;
                            }
                            fCurrentX = parseFloat(aSelectionItems[i].getX()) || 0;
                            fCurrentY = parseFloat(aSelectionItems[i].getY()) || 0;
                            aSelectionItems[i].setXY((fCurrentX + fDeltaX * fZoomModifier) + "px", (fCurrentY + fDeltaY * fZoomModifier) + "px");
                        }
                    }
                }
            }

            // TODO: performance-optimize this
            // show trash based on position
            // if (iTrashDistanceX < 400 && iTrashDistanceY < 400) {
            $trash.clearQueue().css("opacity", 1);
            if (sap.ui.Device.browser.chrome) {
                $trashAbove.css("opacity", 1);
            }
            $trash.css("z-index", this.getDepth() - 1);

            if (iTrashDistanceX < 100 && iTrashDistanceY < 100 && (this._totalDeltaX > 25 || this._totalDeltaY > 25)) {
                $trash.addClass("active");
                if (sap.ui.Device.browser.chrome) {
                    $trashAbove.addClass("active");
                }
            } else {
                $trash.removeClass("active");
                if (sap.ui.Device.browser.chrome) {
                    $trashAbove.removeClass("active");
                }
            }
            /*
             * } else { $trash.clearQueue().css("opacity", 0); if (sap.ui.Device.browser.chrome) {
             * $trashAbove.css("opacity", 0); } $trash.css("z-index", 10000); }
             */
        } else if (this._touchMode === sap.ino.wall.WallConfig._ITEM_TOUCHMODE_RESIZE) {
            // prevent the resize event for the group if the item has already been resized
            if (oEvent.isMarked("_sapInoWallGroupItemResize")) {
                return;
            }

            fDeltaX = this._totalDeltaX;
            fDeltaY = this._totalDeltaY;

            if (fDeltaX || fDeltaY) {
                // flag this item and the wall as moving
                this._bMoving = true;
                oWall._bMovingItem = true;

                // resize according to the longest distance only
                if (oEvent.shiftKey) {
                    iMaxDelta = Math.max(this._totalDeltaX, this._totalDeltaY);
                    fDeltaX = iMaxDelta;
                    fDeltaY = iMaxDelta;
                }

                // in all cases resize the item based on the distance of the pointer event
                // when resizing with control key, the size has to be doubled (also moves item in opposite direction)
                this.setWH((this._touchStartItemWidth + (oEvent.ctrlKey ? fDeltaX * 2.0 : fDeltaX) * fZoomModifier) + "px", (this._touchStartItemHeight + (oEvent.ctrlKey ? fDeltaY * 2.0 : fDeltaY) * fZoomModifier) + "px");

                if (oEvent.ctrlKey) {
                    // only move item if it can be resized
                    if (parseInt(this.getW(), 10) > sap.ino.wall.WallConfig._ITEM_MIN_SIZE) {
                        this.setX((this._touchStartItemX - fDeltaX * fZoomModifier) + "px");
                    }
                    if (parseInt(this.getH(), 10) > sap.ino.wall.WallConfig._ITEM_MIN_SIZE) {
                        this.setY((this._touchStartItemY - fDeltaY * fZoomModifier) + "px");
                    }
                }

                aChilds = this.getChilds() || [];
                if (aChilds.length) {
                    $childContainer = this.$("childs");
                    this._adjustChildContainerPositioning($childContainer);
                }

                // call item hook to react on resize changes
                if (this._onResize) {
                    this._onResize(false, fDeltaX * fZoomModifier, fDeltaY * fZoomModifier);
                }

                if (this.getParent() instanceof sap.ino.wall.WallItemGroup) {
                    // mark the event so that the group is not resized as well
                    oEvent.setMarked("_sapInoWallGroupItemResize", true);
                }
            }
        }

        // show debug
        if (sap.ino.wall.config.Config.getDebugPositioning()) {
            oWall._calculateAllCollisions(this, sap.ino.wall.WallConfig._COLLISION_ALL, this);
        }

        // TODO: do not stop propagation, we need it for the dragstart event and text selection
        oEvent.preventDefault();
        oEvent.stopPropagation();
    };

    /**
     * Handle the touch end event.
     * 
     * @param {jQuery.EventObject}
     *            oEvent The event object
     * @private
     */
    sap.ino.wall.WallItemBase.prototype._ontouchend = function(oEvent) {
        var that = this, oWall = this.getWall(), $this = this.$(), $trashAbove = null, // chrome special behavior
        $trash, iTrashDistanceX, iTrashDistanceY, aChilds = this.getChilds() || [], bFlipable = true, aSelectionItems, i = 0, fDeltaXY, oOffset, fZoomModifier, fLeft, fTop, aCollisions = [], iCurrentDistance, iClosestDistance, fMiddleX, fMiddleY, oClosestItem, oGroup;
        
        if (!oWall) {
            // Item is currently in sync, and has no parent
            jQuery(document).unbind("touchend touchcancel mouseup", this._touchEndProxy);
            jQuery(document).unbind("touchmove mousemove", this._touchMoveProxy);
            this._bMoving = false;
            return false;
        }

        $trash = oWall.$("trash");
        if (sap.ui.Device.browser.chrome) {
            $trashAbove = oWall.$("trashAbove");
        }
        iTrashDistanceX = Math.abs(sap.ino.wall.util.Helper.getEventX(oEvent) - $trash.offset().left - 100);
        iTrashDistanceY = Math.abs(sap.ino.wall.util.Helper.getEventY(oEvent) - $trash.offset().top - 100);

        // enable text selection globally until touchend event
        jQuery(document).enableSelection();

        // do not process this event for childs
        if (this._touchMode === sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVECHILD) {
            jQuery(document).unbind("touchend touchcancel mouseup", this._touchEndProxy);
            jQuery(document).unbind("touchmove mousemove", this._touchMoveProxy);
            this._bMoving = false;
            oWall._bMovingItem = false;
            return false;
        }

        if (!this._bMoving && this._touchMode !== sap.ino.wall.WallConfig._ITEM_TOUCHMODE_RESIZE) {
            if ($this[0].contains(oEvent.target)) {
                // special case, if it is a child we do not flip
                if (this.getParent() instanceof sap.ino.wall.WallItemBase && !(this.getParent() instanceof sap.ino.wall.WallItemGroup)) {
                    bFlipable = false;
                }

                // special case, scrolling in scroll container should not trigger flip
                if (jQuery(oEvent.target).hasClass("sapMScrollCont") || jQuery(oEvent.target).hasClass("sapInoWallScrollable")) {
                    fDeltaXY = sap.ino.wall.util.Helper.getEventX(oEvent) - this._touchStartMousePositionX + sap.ino.wall.util.Helper.getEventY(oEvent) - this._touchStartMousePositionY;
                    if (fDeltaXY) {
                        bFlipable = false;
                    }
                }

                // flip item if source was not an input element
                bFlipable = bFlipable && !(jQuery(oEvent.target).filter('.noflip,input[type=text],textarea,select,.sapMImg,.sapMBtnIcon').length) &&
                // or a UI5 control with noflip class set
                !((jQuery(oEvent.target).control(0)) && jQuery(oEvent.target).control(0).hasStyleClass("noflip")) &&
                // or a select
                !jQuery(oEvent.target).parent().hasClass("sapMSlt") &&
                // or a button (oEvent.target is either an image or the inner span element
                !jQuery(oEvent.target).parent().hasClass("noflip") &&
                // or nicEdit area clicked
                !(jQuery(oEvent.target).attr("class") && jQuery(oEvent.target).attr("class").trim().indexOf("nicEdit") === 0) &&
                // or a placeholder label of an input field in IE
                !jQuery(oEvent.target).filter(".sapMInputBasePlaceholder").length &&
                // overwritten event handlers for special situations (ScrollContainer scrollbar)
                !oEvent._sapwallDoNotFlip;

                if (bFlipable) {
                    // TODO: don't flip when placing other items (don't access wall members here)
                    if (!oWall._hasFollowCursorItems()) {
                        this.setFlipped(!this.getFlipped());
                        // stop propagation to prevent click actions
                        oEvent.preventDefault();
                        oEvent.stopPropagation();
                    }
                }
            }
        } else {
            oWall._updateBoundingBox();
        }

        // set cursor to normal
        this.$().removeClass("dragCursor");

        // check if item has been dropped on trash
        if ($trash.css("opacity") > 0) {
            $trash.css("opacity", 1).clearQueue().animate({
                opacity : "0"
            }, 500);
        }
        if (sap.ui.Device.browser.chrome) {
            $trashAbove.css("opacity", 0);
        }

        // delete item when not in resize mode and close to trash and item has been moved more than 30px
        if (this._touchMode !== sap.ino.wall.WallConfig._ITEM_TOUCHMODE_RESIZE && iTrashDistanceX < 100 && iTrashDistanceY < 100 && (this._totalDeltaX > 25 || this._totalDeltaY > 25) && !this._ignoreTrash) {

            // remove other selected items first
            aSelectionItems = oWall._aSelectedItems || [];

            if (aSelectionItems.length) {
                // only remove other items if current item is part of the selection
                if (!(this instanceof sap.ino.wall.WallItemLine) && $.inArray(this, aSelectionItems) >= 0) {
                    oWall.deleteItems(aSelectionItems);
                    oWall._clearSelection();
                }
            } else {
                oWall.deleteItems([this]);
            }

            // when deleting, we have to set this without timeout because the this point is not valid anymore
            oWall._bMovingItem = false;

            $trash.removeClass("active");
            if (sap.ui.Device.browser.chrome) {
                $trashAbove.removeClass("active");
            }
        }

        // add to childs when colliding with only one item
        // TODO: needs better logic, it is just adding it to the first collision currently
        if (this._touchMode !== sap.ino.wall.WallConfig._ITEM_TOUCHMODE_RESIZE && sap.ino.wall.config.Config.getEnableChildItems() && this._bMoving && !(this instanceof sap.ino.wall.WallItemLine) && !(this instanceof sap.ino.wall.WallItemGroup)) {

            oOffset = oWall.$("inner").offset();
            fZoomModifier = 100 / oWall.getZoom();

            // calculated mouse cursor coordinates of cursor position from screen coordinates
            fLeft = sap.ino.wall.util.Helper.getEventX(oEvent);
            fTop = sap.ino.wall.util.Helper.getEventY(oEvent);
            if (!sap.ino.wall.config.Config.getZoomCapable()) { // scale
                fLeft = (fLeft + Math.abs(oOffset.left)) * fZoomModifier;
                fTop = (fTop + Math.abs(oOffset.top)) * fZoomModifier;
            } else { // zoom
                fLeft = fLeft * fZoomModifier - oOffset.left;
                fTop = (fTop) * fZoomModifier - oOffset.top;
            }

            // calculate collisions with current mouse position
            if (!aChilds.length && this._touchMode === sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVEGROUPITEM) {
                // calculate collisions inside group (relative to group)
                oGroup = this.getParent();
                fLeft -= parseInt(oGroup.getX(), 10);
                fTop -= parseInt(oGroup.getY(), 10);
                aCollisions = oWall._calculateCollisions(oGroup.getChilds(), [fLeft, fTop, 0, 0], sap.ino.wall.WallConfig._COLLISION_INTERSECTIONS, this)[0];
            } else if (this._touchMode === sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVE_START || 
                       this._touchMode === sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVE_END) {
                aCollisions = [];
            } else if (this._touchMode !== sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVEGROUPITEM) {
                // calculate collisions with all items on wall (to add as child to an item or a group)
                aCollisions = oWall._calculateAllCollisions([fLeft, fTop, 0, 0], sap.ino.wall.WallConfig._COLLISION_INTERSECTIONS, this)[0];
            }

            // calculate the closest collision if needed
            if (aCollisions.length > 1) {
                i = 0;
                iCurrentDistance = 0;
                iClosestDistance = 99999;
                fMiddleX = 0;
                fMiddleY = 0;
                oClosestItem = null;

                for (; i < aCollisions.length; i++) {
                    fMiddleX = parseInt(aCollisions[i].getX(), 10) + (aCollisions[i].getW() ? parseInt(aCollisions[i].getW(), 10) : sap.ino.wall.WallConfig._ITEM_MIN_SIZE) / 2;
                    fMiddleY = parseInt(aCollisions[i].getY(), 10) + (aCollisions[i].getH() ? parseInt(aCollisions[i].getH(), 10) : sap.ino.wall.WallConfig._ITEM_MIN_SIZE) / 2;
                    // calculate distance between the mouse position and the middle of the item
                    iCurrentDistance = Math.sqrt(Math.pow(fMiddleX - fLeft, 2) + Math.pow(fMiddleY - fTop, 2));
                    if (iCurrentDistance < iClosestDistance) {
                        iClosestDistance = iCurrentDistance;
                        oClosestItem = aCollisions[i];
                    }
                }
                if (oClosestItem) {
                    aCollisions = [oClosestItem];
                }
            }

            // add this item as child to the closest collision
            if (aCollisions.length > 0) {
                if (!aChilds.length || aChilds.length && aCollisions[0] instanceof sap.ino.wall.WallItemGroup) {
                    if (aCollisions[0] instanceof sap.ino.wall.WallItemGroup || !(this instanceof sap.ino.wall.WallItemArrow)) {
                        this.setFlipped(false);
                        aCollisions[0].setFlipped(false);
                        oWall.removeItemWithoutRendering(this);
                        aCollisions[0].addChildWithoutRendering(this);
                        aCollisions[0].setDepth(oWall._getNextDepth());
                        if (!(aCollisions[0] instanceof sap.ino.wall.WallItemGroup)) {
                            sap.m.MessageToast.show(sap.ino.wall.util.Helper.stringFormat(this._oRB.getText("WALL_TOOLTIP_ADD_CHILD"), sap.ino.wall.util.Helper.stripTags(this.getTitle()), sap.ino.wall.util.Helper.stripTags(aCollisions[0].getTitle())));
                        } else {
                            sap.m.MessageToast.show(sap.ino.wall.util.Helper.stringFormat(this._oRB.getText("WALL_TOOLTIP_ADD_GROUP"), sap.ino.wall.util.Helper.stripTags(this.getTitle()), sap.ino.wall.util.Helper.stripTags(aCollisions[0].getTitle())));
                            // save the group as well to assign the child dependency
                            aCollisions[0]._notifyItemChanged(aCollisions[0]);
                        }
                        // when item is not moved anymore then the parent relation is not stored, so we save the item as well
                        this._notifyItemChanged(this);
                    }
                }
            }
        }

        // we set a timeout to allow other events (click) to also detect if item was moved
        setTimeout(function() {
            that._bMoving = false;
            if (oWall) { // will only work if the item has not been destroyed/deleted yet
                oWall._bMovingItem = false;
            }
        }, 0);

        // call the resize end hook
        if (this._touchMode === sap.ino.wall.WallConfig._ITEM_TOUCHMODE_RESIZE) {
            if (this._onResizeEnd) {
                this._onResizeEnd();
            }
        }

        jQuery(document).unbind("touchend touchcancel mouseup", this._touchEndProxy);
        jQuery(document).unbind("touchmove mousemove", this._touchMoveProxy);
    };

    /* =========================================================== */
    /* begin: internal methods */
    /* =========================================================== */

    /**
     * Checks if the control is already written to the DOM to allow for layout changes
     * 
     * @returns {this} this pointer for chaining
     * @private
     */
    sap.ino.wall.WallItemBase.prototype._isRendered = function() {
        if (this._bIsInDOM === undefined || this._bIsInDOM === 0) {
            this._bIsInDOM = jQuery.sap.byId(this.getId()).length;
        }

        return this._bIsInDOM;
    };

    /**
     * Renders and flushes a wall item without re-rendering the complete wall
     * 
     * @returns {this} this pointer for chaining
     * @private
     */
    // TODO: make this the same as in wall
    sap.ino.wall.WallItemBase.prototype._renderItemIntoContainer = function(oDomRef, oItem, bDoNotPreserve, vInsert) {
        var rm;

        if (oDomRef) {
            rm = sap.ui.getCore().createRenderManager();
            rm.renderControl(oItem);
            rm.flush(oDomRef, bDoNotPreserve, vInsert);
            rm.destroy();
        }

        return this;
    };

    /**
     * Calculates the current T-Shirt size after resizing the item
     * 
     * @private
     */
    // TODO: make hook so that items can also react to t-shirt size change in JS
    sap.ino.wall.WallItemBase.prototype._adjustTShirtSize = function() {
        var iW = parseInt(this.getW(), 10), iH = parseInt(this.getH(), 10), sSize = sap.ino.wall.TShirtSize.S;

        // do not adjust size when no width and height are set
        if (isNaN(iW) || isNaN(iH)) {
            return;
        }

        if (iW < 100 || iH < 100) {
            sSize = sap.ino.wall.TShirtSize.XS;
            this.addStyleClass(sSize);
            this.removeStyleClass(sap.ino.wall.TShirtSize.S);
            this.removeStyleClass(sap.ino.wall.TShirtSize.M);
            this.removeStyleClass(sap.ino.wall.TShirtSize.L);
            this.removeStyleClass(sap.ino.wall.TShirtSize.XL);
        } else if (iW < 300 || iH < 200) {
            sSize = sap.ino.wall.TShirtSize.S;
            this.removeStyleClass(sap.ino.wall.TShirtSize.XS);
            this.addStyleClass(sSize);
            this.removeStyleClass(sap.ino.wall.TShirtSize.M);
            this.removeStyleClass(sap.ino.wall.TShirtSize.L);
            this.removeStyleClass(sap.ino.wall.TShirtSize.XL);
        } else if (iW < 450 || iH < 400) {
            sSize = sap.ino.wall.TShirtSize.M;
            this.removeStyleClass(sap.ino.wall.TShirtSize.XS);
            this.removeStyleClass(sap.ino.wall.TShirtSize.S);
            this.addStyleClass(sSize);
            this.removeStyleClass(sap.ino.wall.TShirtSize.L);
            this.removeStyleClass(sap.ino.wall.TShirtSize.XL);
        } else if (iW < 600 || iH < 600) {
            sSize = "L";
            this.removeStyleClass(sap.ino.wall.TShirtSize.XS);
            this.removeStyleClass(sap.ino.wall.TShirtSize.S);
            this.removeStyleClass(sap.ino.wall.TShirtSize.M);
            this.addStyleClass(sSize);
            this.removeStyleClass(sap.ino.wall.TShirtSize.XL);
        } else {
            sSize = sap.ino.wall.TShirtSize.XL;
            this.removeStyleClass(sap.ino.wall.TShirtSize.XS);
            this.removeStyleClass(sap.ino.wall.TShirtSize.S);
            this.removeStyleClass(sap.ino.wall.TShirtSize.M);
            this.removeStyleClass(sap.ino.wall.TShirtSize.L);
            this.addStyleClass(sSize);
        }

        return sSize;
    };

    /**
     * Redirects child changes to the wall to update this item and its child in the DB
     * 
     * @private
     */
    sap.ino.wall.WallItemBase.prototype._notifyItemChanged = function(oItem) {
        if (oItem.getParent() instanceof sap.ino.wall.WallItemGroup && this.getWall()) {
            // do not save the whole group when only an item has been changed inside the group
            this.getWall()._notifyItemChanged(oItem);
        } else if (this.getParent()) {
            this.getParent()._notifyItemChanged(oItem);
        }
    };

    /* =========================================================== */
    /* begin: internal getters for lazy controls */
    /* =========================================================== */

    /*
     * Lazy initialization of the internal dialog @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemBase.prototype._getButtonFlip = function() {
        var that = this, oButton = this.getAggregation("_buttonFlip");

        if (!oButton) {
            // create control
            oButton = new sap.m.Button({
                icon : sap.ui.core.IconPool.getIconURI("redo"),
                press : function(oEvent) {
                    // this is only the click handler
                    // keypress is handled in onkeydown
                    that.setFlipped(false);

                    if (oEvent) {
                        oEvent.preventDefault();
                    }
                },
                tooltip : this._oRB.getText("CTRL_WALL_ITEMBASE_EXP_FLIPBUTTON")
            }).addStyleClass("sapInoWallWIFlipBackButton");

            // set hidden aggregation without rerendering
            this.setAggregation("_buttonFlip", oButton, true);
        }

        return oButton;
    };

    /*
     * Lazy initialization of the internal resize icon @private @returns {sap.ui.core/Icon} the icon
     */
    sap.ino.wall.WallItemBase.prototype._getIconResize = function() {
        var oIcon = this.getAggregation("_iconResize");

        if (!oIcon) {
            // create control
            oIcon = new sap.ui.core.Icon({
                src : "sap-icon://dropdown",
                size : "15px",
                width : "12px",
                height : "15px",
                decorative : true
            });

            // set hidden aggregation without rerendering
            this.setAggregation("_iconResize", oIcon, true);
        }

        return oIcon;
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Input} the control
     */
    sap.ino.wall.WallItemBase.prototype._getInputTitle = function() {
        var that = this, oControl = this.getAggregation("_inputTitle"), sTitle = sap.ino.wall.util.Formatter.escapeBindingCharacters(this.getTitle()), sType = this.getMetadata()._sClassName.split(".").pop().replace("WallItem", "").toUpperCase();

        if (!oControl) {
            // create control
            oControl = new sap.m.Input({
                value : (sTitle === this._oRB.getText("WALL_ITEM" + sType + "_NEW_TEXT") ? "" : sTitle), // only set
                // title
                // when it
                // is not
                // the
                // inital
                // text
                maxLength : 500,
                change : function(oEvent) {
                    that.setTitle(oEvent.getParameter("newValue"), false, true);
                }
            }).addStyleClass("sapInoWallWIBTitle");

            // set hidden aggregation without rerendering
            this.setAggregation("_inputTitle", oControl, true);
        }

        return oControl;
    };

})();