/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.Wall");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallMode");
    jQuery.sap.require("sap.ino.wall.WallConfig");
    jQuery.sap.require("sap.ino.wall.WallItemGroup");

    jQuery.sap.require("sap.ino.wall.util.Helper");
    jQuery.sap.require("sap.ino.wall.util.Formatter");
    jQuery.sap.require("sap.ino.wall.util.Logger");
    jQuery.sap.require("sap.ino.wall.config.Config");

    jQuery.sap.require("sap.ino.wall.WallItemAttachment");
    jQuery.sap.require("sap.ino.wall.WallItemImage");
    jQuery.sap.require("sap.ino.wall.WallItemLink");
    jQuery.sap.require("sap.ino.wall.WallItemVideo");
    jQuery.sap.require("sap.ino.wall.WallItemPerson");
    jQuery.sap.require("sap.ino.wall.WallItemNote");
    jQuery.sap.require("sap.ino.wall.WallItemSticker");
    jQuery.sap.require("sap.ino.wall.WallItemText");
    jQuery.sap.require("sap.ino.wall.WallItemHeadline");
    jQuery.sap.require("sap.ino.wall.WallItemLine");
    jQuery.sap.require("sap.ino.wall.WallItemDocument");
    jQuery.sap.require("sap.ino.wall.WallItemSprite");
    jQuery.sap.require("sap.ino.wall.WallItemArrow");
    jQuery.sap.require("sap.ino.wall.Pos");
    jQuery.sap.require("sap.ino.wall.Hoverable");
    jQuery.sap.require("sap.ino.wall.ColorPicker");
    jQuery.sap.require("sap.ino.commons.models.object.Attachment");

    jQuery.sap.require("sap.ino.commons.application.Configuration");
    var Configuration = sap.ino.commons.application.Configuration;

    jQuery.sap.require("sap.ino.wall.util.WallPatches");
    var WallPatches = sap.ino.wall.util.WallPatches;

    jQuery.sap.require("sap.m.MessageBox");
    jQuery.sap.require("sap.m.MessageToast");

    /**
     * Constructor for a new Wall.
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
     * <li>{@link #getEditable editable} : boolean</li>
     * <li>{@link #getBackgroundImage backgroundImage} : string</li>
     * <li>{@link #getBackgroundImageZoom backgroundImageZoom} : int (default: 30)</li>
     * <li>{@link #getBackgroundColor backgroundColor} : string</li>
     * <li>{@link #getMouseX mouseX} : float</li>
     * <li>{@link #getMouseY mouseY} : float</li>
     * <li>{@link #getTouchPosition touchPosition} : any</li>
     * <li>{@link #getZoom zoom} : float (default: 100)</li>
     * <li>{@link #getViewPoint viewPoint} : any</li>
     * <li>{@link #getTitle title} : string</li>
     * <li>{@link #getStorageId storageId} : int (default: -1)</li>
     * <li>{@link #getType type} : string (default: 'Wall')</li>
     * <li>{@link #getMode mode} : sap.ino.wall.WallMode (default: sap.ino.wall.WallMode.Write)</li>
     * <li>{@link #getOwner owner} : string</li>
     * </ul>
     * </li>
     * <li>Aggregations
     * <ul>
     * <li>{@link #getItems items} : sap.ui.core.Control[]</li>
     * </ul>
     * </li>
     * <li>Associations
     * <ul>
     * </ul>
     * </li>
     * <li>Events
     * <ul>
     * <li>{@link sap.ino.wall.Wall#event:itemAdd itemAdd} : fnListenerFunction or [fnListenerFunction,
     * oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
     * <li>{@link sap.ino.wall.Wall#event:itemDelete itemDelete} : fnListenerFunction or [fnListenerFunction,
     * oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
     * <li>{@link sap.ino.wall.Wall#event:zoomChange zoomChange} : fnListenerFunction or [fnListenerFunction,
     * oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
     * <li>{@link sap.ino.wall.Wall#event:itemChange itemChange} : fnListenerFunction or [fnListenerFunction,
     * oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
     * <li>{@link sap.ino.wall.Wall#event:change change} : fnListenerFunction or [fnListenerFunction,
     * oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
     * <li>{@link sap.ino.wall.Wall#event:hover hover} : fnListenerFunction or [fnListenerFunction, oListenerObject]
     * or [oData, fnListenerFunction, oListenerObject]</li>
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
     * @class The wall.
     * @extends sap.ui.core.Control
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.Wall
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ui.core.Control.extend("sap.ino.wall.Wall", { metadata : {

        publicMethods : [
            // methods
            "toggleEnableItems"
        ],
        properties : {
            "editable" : {type : "boolean", group : "Behavior", defaultValue : null},
            "backgroundImage" : {type : "string", group : "Appearance", defaultValue : null},
            "backgroundImageZoom" : {type : "int", group : "Appearance", defaultValue : 100},
            "backgroundImageTiled" : {type : "boolean", group : "Appearance", defaultValue : false},
            "backgroundColor" : {type : "string", group : "Appearance", defaultValue : null},
            "mouseX" : {type : "float", group : "Appearance", defaultValue : null},
            "mouseY" : {type : "float", group : "Appearance", defaultValue : null},
            "touchPosition" : {type : "any", group : "Misc", defaultValue : null},
            "zoom" : {type : "float", group : "Behavior", defaultValue : 100},
            "viewPoint" : {type : "any", group : "Misc", defaultValue : null},
            "title" : {type : "string", group : "Appearance", defaultValue : null},
            "storageId" : {type : "int", group : "Identification", defaultValue : -1},
            "type" : {type : "string", group : "Misc", defaultValue : 'Wall'},
            "mode" : {type : "sap.ino.wall.WallMode", group : "Misc", defaultValue : sap.ino.wall.WallMode.Write},
            "owner" : {type : "string", group : "Identification", defaultValue : null},
            "headerHeight" : {type : "int", group : "Appearance", defaultValue : 63},
            "footerHeight" : {type : "int", group : "Appearance", defaultValue : 31}
        },
        aggregations : {
            "items" : {type : "sap.ui.core.Control", multiple : true, singularName : "item"}
        },
        events : {
            "itemAdd" : {}, 
            "itemDelete" : {}, 
            "zoomChange" : {}, 
            "itemChange" : {}, 
            "change" : {}, 
            "hover" : {},
            "sync" : {},
            "syncModeChange" : {},
        }
    }});


    /**
     * Creates a new subclass of class sap.ino.wall.Wall with name <code>sClassName</code> and enriches it with the
     * information contained in <code>oClassInfo</code>.
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
     * @name sap.ino.wall.Wall.extend
     * @function
     */

    sap.ino.wall.Wall.M_EVENTS = {'itemAdd':'itemAdd','itemDelete':'itemDelete','zoomChange':'zoomChange','itemChange':'itemChange','change':'change','hover':'hover'};


    /**
     * Getter for property <code>editable</code>. If set to true, new items can be added to the wall and the existing
     * items can be rearranged.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {boolean} the value of property <code>editable</code>
     * @public
     * @name sap.ino.wall.Wall#getEditable
     * @function
     */

    /**
     * Setter for property <code>editable</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {boolean}
     *            bEditable new value for property <code>editable</code>
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#setEditable
     * @function
     */


    /**
     * Getter for property <code>backgroundImage</code>. A URI to the background image.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {string} the value of property <code>backgroundImage</code>
     * @public
     * @name sap.ino.wall.Wall#getBackgroundImage
     * @function
     */

    /**
     * Setter for property <code>backgroundImage</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {string}
     *            sBackgroundImage new value for property <code>backgroundImage</code>
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#setBackgroundImage
     * @function
     */


    /**
     * Getter for property <code>backgroundImageZoom</code>. The zoom value for custom background images.
     * 
     * Default value is <code>30</code>
     * 
     * @return {int} the value of property <code>backgroundImageZoom</code>
     * @public
     * @name sap.ino.wall.Wall#getBackgroundImageZoom
     * @function
     */

    /**
     * Setter for property <code>backgroundImageZoom</code>.
     * 
     * Default value is <code>30</code>
     * 
     * @param {int}
     *            iBackgroundImageZoom new value for property <code>backgroundImageZoom</code>
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#setBackgroundImageZoom
     * @function
     */


    /**
     * Getter for property <code>backgroundColor</code>. A background color in hex format (e.g. #FF0000).
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {string} the value of property <code>backgroundColor</code>
     * @public
     * @name sap.ino.wall.Wall#getBackgroundColor
     * @function
     */

    /**
     * Setter for property <code>backgroundColor</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {string}
     *            sBackgroundColor new value for property <code>backgroundColor</code>
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#setBackgroundColor
     * @function
     */


    /**
     * Getter for property <code>mouseX</code>. The horizontal mouse position
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {float} the value of property <code>mouseX</code>
     * @public
     * @name sap.ino.wall.Wall#getMouseX
     * @function
     */

    /**
     * Setter for property <code>mouseX</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {float}
     *            fMouseX new value for property <code>mouseX</code>
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#setMouseX
     * @function
     */


    /**
     * Getter for property <code>mouseY</code>. The vertical mouse position
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {float} the value of property <code>mouseY</code>
     * @public
     * @name sap.ino.wall.Wall#getMouseY
     * @function
     */

    /**
     * Setter for property <code>mouseY</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {float}
     *            fMouseY new value for property <code>mouseY</code>
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#setMouseY
     * @function
     */


    /**
     * Getter for property <code>touchPosition</code>. The current mouse/finger position.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {any} the value of property <code>touchPosition</code>
     * @public
     * @name sap.ino.wall.Wall#getTouchPosition
     * @function
     */

    /**
     * Setter for property <code>touchPosition</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {any}
     *            oTouchPosition new value for property <code>touchPosition</code>
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#setTouchPosition
     * @function
     */


    /**
     * Getter for property <code>zoom</code>. The zoom level for the wall.
     * 
     * Default value is <code>100</code>
     * 
     * @return {float} the value of property <code>zoom</code>
     * @public
     * @name sap.ino.wall.Wall#getZoom
     * @function
     */

    /**
     * Setter for property <code>zoom</code>.
     * 
     * Default value is <code>100</code>
     * 
     * @param {float}
     *            fZoom new value for property <code>zoom</code>
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#setZoom
     * @function
     */


    /**
     * Getter for property <code>viewPoint</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {any} the value of property <code>viewPoint</code>
     * @public
     * @name sap.ino.wall.Wall#getViewPoint
     * @function
     */

    /**
     * Setter for property <code>viewPoint</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {any}
     *            oViewPoint new value for property <code>viewPoint</code>
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#setViewPoint
     * @function
     */


    /**
     * Getter for property <code>title</code>. The wall title.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {string} the value of property <code>title</code>
     * @public
     * @name sap.ino.wall.Wall#getTitle
     * @function
     */

    /**
     * Setter for property <code>title</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {string}
     *            sTitle new value for property <code>title</code>
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#setTitle
     * @function
     */


    /**
     * Getter for property <code>storageId</code>. Temp: stores the db id of this wall
     * 
     * Default value is <code>-1</code>
     * 
     * @return {int} the value of property <code>storageId</code>
     * @public
     * @name sap.ino.wall.Wall#getStorageId
     * @function
     */

    /**
     * Setter for property <code>storageId</code>.
     * 
     * Default value is <code>-1</code>
     * 
     * @param {int}
     *            iStorageId new value for property <code>storageId</code>
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#setStorageId
     * @function
     */


    /**
     * Getter for property <code>type</code>. Sets the typ of a wall (Wall or Template). This is a read-only property
     * that can only be modified in the backend.
     * 
     * Default value is <code>Wall</code>
     * 
     * @return {string} the value of property <code>type</code>
     * @public
     * @name sap.ino.wall.Wall#getType
     * @function
     */

    /**
     * Setter for property <code>type</code>.
     * 
     * Default value is <code>Wall</code>
     * 
     * @param {string}
     *            sType new value for property <code>type</code>
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#setType
     * @function
     */


    /**
     * Getter for property <code>mode</code>. Defines the interaction mode for the wall.
     * 
     * Default value is <code>Write</code>
     * 
     * @return {sap.ino.wall.WallMode} the value of property <code>mode</code>
     * @public
     * @name sap.ino.wall.Wall#getMode
     * @function
     */

    /**
     * Setter for property <code>mode</code>.
     * 
     * Default value is <code>Write</code>
     * 
     * @param {sap.ino.wall.WallMode}
     *            oMode new value for property <code>mode</code>
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#setMode
     * @function
     */


    /**
     * Getter for property <code>owner</code>. Owner
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {string} the value of property <code>owner</code>
     * @public
     * @name sap.ino.wall.Wall#getOwner
     * @function
     */

    /**
     * Setter for property <code>owner</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {string}
     *            sOwner new value for property <code>owner</code>
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#setOwner
     * @function
     */


    /**
     * Getter for aggregation <code>items</code>.<br/> The wall items.
     * 
     * @return {sap.ui.core.Control[]}
     * @public
     * @name sap.ino.wall.Wall#getItems
     * @function
     */


    /**
     * Inserts a item into the aggregation named <code>items</code>.
     * 
     * @param {sap.ui.core.Control}
     *            oItem the item to insert; if empty, nothing is inserted
     * @param {int}
     *            iIndex the <code>0</code>-based index the item should be inserted at; for a negative value of
     *            <code>iIndex</code>, the item is inserted at position 0; for a value greater than the current size
     *            of the aggregation, the item is inserted at the last position
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#insertItem
     * @function
     */

    /**
     * Adds some item <code>oItem</code> to the aggregation named <code>items</code>.
     * 
     * @param {sap.ui.core.Control}
     *            oItem the item to add; if empty, nothing is inserted
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#addItem
     * @function
     */

    /**
     * Removes an item from the aggregation named <code>items</code>.
     * 
     * @param {int |
     *            string | sap.ui.core.Control} vItem the item to remove or its index or id
     * @return {sap.ui.core.Control} the removed item or null
     * @public
     * @name sap.ino.wall.Wall#removeItem
     * @function
     */

    /**
     * Removes all the controls in the aggregation named <code>items</code>.<br/> Additionally unregisters them from
     * the hosting UIArea.
     * 
     * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
     * @public
     * @name sap.ino.wall.Wall#removeAllItems
     * @function
     */

    /**
     * Checks for the provided <code>sap.ui.core.Control</code> in the aggregation named <code>items</code> and
     * returns its index if found or -1 otherwise.
     * 
     * @param {sap.ui.core.Control}
     *            oItem the item whose index is looked for.
     * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
     * @public
     * @name sap.ino.wall.Wall#indexOfItem
     * @function
     */
        

    /**
     * Destroys all the items in the aggregation named <code>items</code>.
     * 
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#destroyItems
     * @function
     */


    /**
     * This event is called when a wall item was added to the wall by user interaction
     * 
     * @name sap.ino.wall.Wall#itemAdd
     * @event
     * @param {sap.ui.base.Event}
     *            oControlEvent
     * @param {sap.ui.base.EventProvider}
     *            oControlEvent.getSource
     * @param {object}
     *            oControlEvent.getParameters
     * @param {WallItemBase}
     *            oControlEvent.getParameters.item The wall item.
     * @public
     */
     
    /**
     * Attach event handler <code>fnFunction</code> to the 'itemAdd' event of this <code>sap.ino.wall.Wall</code>.<br/>.
     * When called, the context of the event handler (its <code>this</code>) will be bound to
     * <code>oListener<code> if specified
     * otherwise to this <code>sap.ino.wall.Wall</code>.<br/> itself. 
     *  
     * This event is called when a wall item was added to the wall by user interaction
     *
     * @param {object}
     *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
     * @param {function}
     *            fnFunction The function to call, when the event occurs.  
     * @param {object}
     *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ino.wall.Wall</code>.<br/> itself.
     *
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#attachItemAdd
     * @function
     */

    /**
     * Detach event handler <code>fnFunction</code> from the 'itemAdd' event of this <code>sap.ino.wall.Wall</code>.<br/>
     * 
     * The passed function and listener object must match the ones used for event registration.
     * 
     * @param {function}
     *            fnFunction The function to call, when the event occurs.
     * @param {object}
     *            oListener Context object on which the given function had to be called.
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#detachItemAdd
     * @function
     */

    /**
     * Fire event itemAdd to attached listeners.
     * 
     * Expects following event parameters:
     * <ul>
     * <li>'item' of type <code>WallItemBase</code> The wall item.</li>
     * </ul>
     * 
     * @param {Map}
     *            [mArguments] the arguments to pass along with the event.
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @protected
     * @name sap.ino.wall.Wall#fireItemAdd
     * @function
     */


    /**
     * This event is called when a wall item has been deleted.
     * 
     * @name sap.ino.wall.Wall#itemDelete
     * @event
     * @param {sap.ui.base.Event}
     *            oControlEvent
     * @param {sap.ui.base.EventProvider}
     *            oControlEvent.getSource
     * @param {object}
     *            oControlEvent.getParameters
     * @param {WallItemBase}
     *            oControlEvent.getParameters.item The wall item.
     * @public
     */
     
    /**
     * Attach event handler <code>fnFunction</code> to the 'itemDelete' event of this
     * <code>sap.ino.wall.Wall</code>.<br/>. When called, the context of the event handler (its <code>this</code>)
     * will be bound to <code>oListener<code> if specified
     * otherwise to this <code>sap.ino.wall.Wall</code>.<br/> itself. 
     *  
     * This event is called when a wall item has been deleted.
     *
     * @param {object}
     *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
     * @param {function}
     *            fnFunction The function to call, when the event occurs.  
     * @param {object}
     *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ino.wall.Wall</code>.<br/> itself.
     *
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#attachItemDelete
     * @function
     */

    /**
     * Detach event handler <code>fnFunction</code> from the 'itemDelete' event of this
     * <code>sap.ino.wall.Wall</code>.<br/>
     * 
     * The passed function and listener object must match the ones used for event registration.
     * 
     * @param {function}
     *            fnFunction The function to call, when the event occurs.
     * @param {object}
     *            oListener Context object on which the given function had to be called.
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#detachItemDelete
     * @function
     */

    /**
     * Fire event itemDelete to attached listeners.
     * 
     * Expects following event parameters:
     * <ul>
     * <li>'item' of type <code>WallItemBase</code> The wall item.</li>
     * </ul>
     * 
     * @param {Map}
     *            [mArguments] the arguments to pass along with the event.
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @protected
     * @name sap.ino.wall.Wall#fireItemDelete
     * @function
     */


    /**
     * 
     * @name sap.ino.wall.Wall#zoomChange
     * @event
     * @param {sap.ui.base.Event}
     *            oControlEvent
     * @param {sap.ui.base.EventProvider}
     *            oControlEvent.getSource
     * @param {object}
     *            oControlEvent.getParameters
     * @param {float}
     *            oControlEvent.getParameters.zoom The new zoom value.
     * @public
     */
     
    /**
     * Attach event handler <code>fnFunction</code> to the 'zoomChange' event of this
     * <code>sap.ino.wall.Wall</code>.<br/>. When called, the context of the event handler (its <code>this</code>)
     * will be bound to <code>oListener<code> if specified
     * otherwise to this <code>sap.ino.wall.Wall</code>.<br/> itself. 
     *  
     *
     * @param {object}
     *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
     * @param {function}
     *            fnFunction The function to call, when the event occurs.  
     * @param {object}
     *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ino.wall.Wall</code>.<br/> itself.
     *
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#attachZoomChange
     * @function
     */

    /**
     * Detach event handler <code>fnFunction</code> from the 'zoomChange' event of this
     * <code>sap.ino.wall.Wall</code>.<br/>
     * 
     * The passed function and listener object must match the ones used for event registration.
     * 
     * @param {function}
     *            fnFunction The function to call, when the event occurs.
     * @param {object}
     *            oListener Context object on which the given function had to be called.
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#detachZoomChange
     * @function
     */

    /**
     * Fire event zoomChange to attached listeners.
     * 
     * Expects following event parameters:
     * <ul>
     * <li>'zoom' of type <code>float</code> The new zoom value.</li>
     * </ul>
     * 
     * @param {Map}
     *            [mArguments] the arguments to pass along with the event.
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @protected
     * @name sap.ino.wall.Wall#fireZoomChange
     * @function
     */


    /**
     * This event is triggered [_wallSaveDelay]ms after the last change happened to an item or [_wallSaveInterval]ms
     * after the first change. It passed an array of all changed items to be saved in the database.
     * 
     * @name sap.ino.wall.Wall#itemChange
     * @event
     * @param {sap.ui.base.Event}
     *            oControlEvent
     * @param {sap.ui.base.EventProvider}
     *            oControlEvent.getSource
     * @param {object}
     *            oControlEvent.getParameters
     * @param {WallItemBase}
     *            oControlEvent.getParameters.items The items that have been changed since the last save run.
     * @public
     */
     
    /**
     * Attach event handler <code>fnFunction</code> to the 'itemChange' event of this
     * <code>sap.ino.wall.Wall</code>.<br/>. When called, the context of the event handler (its <code>this</code>)
     * will be bound to <code>oListener<code> if specified
     * otherwise to this <code>sap.ino.wall.Wall</code>.<br/> itself. 
     *  
     * This event is triggered [_wallSaveDelay]ms after the last change happened to an item or [_wallSaveInterval]ms after the first change. It passed an array of all changed items to be saved in the database.
     *
     * @param {object}
     *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
     * @param {function}
     *            fnFunction The function to call, when the event occurs.  
     * @param {object}
     *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ino.wall.Wall</code>.<br/> itself.
     *
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#attachItemChange
     * @function
     */

    /**
     * Detach event handler <code>fnFunction</code> from the 'itemChange' event of this
     * <code>sap.ino.wall.Wall</code>.<br/>
     * 
     * The passed function and listener object must match the ones used for event registration.
     * 
     * @param {function}
     *            fnFunction The function to call, when the event occurs.
     * @param {object}
     *            oListener Context object on which the given function had to be called.
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#detachItemChange
     * @function
     */

    /**
     * Fire event itemChange to attached listeners.
     * 
     * Expects following event parameters:
     * <ul>
     * <li>'items' of type <code>WallItemBase</code> The items that have been changed since the last save run.</li>
     * </ul>
     * 
     * @param {Map}
     *            [mArguments] the arguments to pass along with the event.
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @protected
     * @name sap.ino.wall.Wall#fireItemChange
     * @function
     */


    /**
     * This event is triggered [_wallSaveDelay]ms after the last change happened to a wall property or
     * [_wallSaveInterval]ms after the first change. It passes an array of all changed parameters to be saved in the
     * database.
     * 
     * @name sap.ino.wall.Wall#change
     * @event
     * @param {sap.ui.base.Event}
     *            oControlEvent
     * @param {sap.ui.base.EventProvider}
     *            oControlEvent.getSource
     * @param {object}
     *            oControlEvent.getParameters
     * @param {any}
     *            oControlEvent.getParameters.properties Array of properties names that have been changed.
     * @public
     */
     
    /**
     * Attach event handler <code>fnFunction</code> to the 'change' event of this <code>sap.ino.wall.Wall</code>.<br/>.
     * When called, the context of the event handler (its <code>this</code>) will be bound to
     * <code>oListener<code> if specified
     * otherwise to this <code>sap.ino.wall.Wall</code>.<br/> itself. 
     *  
     * This event is triggered [_wallSaveDelay]ms after the last change happened to a wall property or [_wallSaveInterval]ms after the first change. It passes an array of all changed parameters to be saved in the database.
     *
     * @param {object}
     *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
     * @param {function}
     *            fnFunction The function to call, when the event occurs.  
     * @param {object}
     *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ino.wall.Wall</code>.<br/> itself.
     *
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#attachChange
     * @function
     */

    /**
     * Detach event handler <code>fnFunction</code> from the 'change' event of this <code>sap.ino.wall.Wall</code>.<br/>
     * 
     * The passed function and listener object must match the ones used for event registration.
     * 
     * @param {function}
     *            fnFunction The function to call, when the event occurs.
     * @param {object}
     *            oListener Context object on which the given function had to be called.
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#detachChange
     * @function
     */

    /**
     * Fire event change to attached listeners.
     * 
     * Expects following event parameters:
     * <ul>
     * <li>'properties' of type <code>any</code> Array of properties names that have been changed.</li>
     * </ul>
     * 
     * @param {Map}
     *            [mArguments] the arguments to pass along with the event.
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @protected
     * @name sap.ino.wall.Wall#fireChange
     * @function
     */


    /**
     * This event is triggered when a part of the wall UI (trash, lock, template) is entered or left to display
     * according tooltips or status messages in the app.
     * 
     * @name sap.ino.wall.Wall#hover
     * @event
     * @param {sap.ui.base.Event}
     *            oControlEvent
     * @param {sap.ui.base.EventProvider}
     *            oControlEvent.getSource
     * @param {object}
     *            oControlEvent.getParameters
     * @param {string}
     *            oControlEvent.getParameters.element The UI element that has been interacted with (trash, lock,
     *            template).
     * @param {string}
     *            oControlEvent.getParameters.interaction The interaction that has been done (enter, leave).
     * @param {string}
     *            oControlEvent.getParameters.tooltip The tooltip text that corresponds to the interaction.
     * @public
     */
     
    /**
     * Attach event handler <code>fnFunction</code> to the 'hover' event of this <code>sap.ino.wall.Wall</code>.<br/>.
     * When called, the context of the event handler (its <code>this</code>) will be bound to
     * <code>oListener<code> if specified
     * otherwise to this <code>sap.ino.wall.Wall</code>.<br/> itself. 
     *  
     * This event is triggered when a part of the wall UI (trash, lock, template) is entered or left to display according tooltips or status messages in the app.
     *
     * @param {object}
     *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
     * @param {function}
     *            fnFunction The function to call, when the event occurs.  
     * @param {object}
     *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ino.wall.Wall</code>.<br/> itself.
     *
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#attachHover
     * @function
     */

    /**
     * Detach event handler <code>fnFunction</code> from the 'hover' event of this <code>sap.ino.wall.Wall</code>.<br/>
     * 
     * The passed function and listener object must match the ones used for event registration.
     * 
     * @param {function}
     *            fnFunction The function to call, when the event occurs.
     * @param {object}
     *            oListener Context object on which the given function had to be called.
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Wall#detachHover
     * @function
     */

    /**
     * Fire event hover to attached listeners.
     * 
     * Expects following event parameters:
     * <ul>
     * <li>'element' of type <code>string</code> The UI element that has been interacted with (trash, lock,
     * template).</li>
     * <li>'interaction' of type <code>string</code> The interaction that has been done (enter, leave).</li>
     * <li>'tooltip' of type <code>string</code> The tooltip text that corresponds to the interaction.</li>
     * </ul>
     * 
     * @param {Map}
     *            [mArguments] the arguments to pass along with the event.
     * @return {sap.ino.wall.Wall} <code>this</code> to allow method chaining
     * @protected
     * @name sap.ino.wall.Wall#fireHover
     * @function
     */


    /**
     * Enables/Disables all wall items
     * 
     * @name sap.ino.wall.Wall#toggleEnableItems
     * @function
     * @param {boolean}
     *            bBEnable If set to true, all items will be enabled, otherwise disabled
     * @type void
     * @public
     * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
     */

    /**
     * Factory to create a wall item (from JSON format)
     * 
     * @param {object}
     *            oItem the wall in JSON format
     * @public
     * @static
     * @return {WallItemBase} the freshly created wall item
     */
    sap.ino.wall.Wall.createWallItemFromJSON = function (oItem) {
        oItem = jQuery.extend(true, {}, oItem);
        var oNewItem = null,
            sClassName = oItem.className,
            oContent = oItem.content || {},
            oJSONChilds = oItem.childs || [],
            i = 0;
    
        // remove items to get a clean wall JSON and avoid UI5 assertions
        delete oItem.content;
        delete oItem.childs;
        delete oItem.parentId;
        delete oItem.className;
        delete oItem.actionCode;
    
        // escape title to avoid binding errors
        if (oItem.title) {
            oItem.title = sap.ino.wall.util.Formatter.escapeBindingCharacters(sap.ino.wall.util.Formatter.escapeNetworkPaths(oItem.title));
        }
        if (oItem.description) {
            oItem.description = sap.ino.wall.util.Formatter.escapeBindingCharacters(sap.ino.wall.util.Formatter.escapeNetworkPaths(oItem.description));
        }
        
        // position is stored as position object in JSON, we need to rewrite the coordinates here to match the
        // properties
        oItem.x = oItem.position.x;
        oItem.y = oItem.position.y;
        delete oItem.position;
    
        // initialize item based on type
        switch (sClassName) {
        case "sap.ino.wall.WallItemAttachment":
            oNewItem = new sap.ino.wall.WallItemAttachment(oItem);
            if (oContent.URL) {
                oNewItem.setURL(oContent.URL);
            }
            if (oContent.type) {
                oNewItem.setType(oContent.type);
            }
            if (oContent.fileName) {
                oNewItem.setFileName(oContent.fileName);
            }
            if (oContent.assignmentId) {
                oNewItem.setAssignmentId(oContent.assignmentId);
            }
            break;
        case "sap.ino.wall.WallItemImage":
            oNewItem = new sap.ino.wall.WallItemImage(oItem);
            if (oContent.preview) {
                oNewItem.setPreview(oContent.preview);
            }
            if (oContent.image) {
                oNewItem.setImage(oContent.image);
            }
            if (oContent.assignmentId) {
                oNewItem.setAssignmentId(oContent.assignmentId);
            }
            if (oContent.showAsIcon) {
                oNewItem.setShowAsIcon(oContent.showAsIcon);
            }
            break;
        case "sap.ino.wall.WallItemLink":
            oNewItem = new sap.ino.wall.WallItemLink(oItem);
            break;
        case "sap.ino.wall.WallItemVideo":
            oNewItem = new sap.ino.wall.WallItemVideo(oItem);
            if (oContent.preview) {
                oNewItem.setPreview(oContent.preview);
            }
            if (oContent.video) {
                oNewItem.setVideo(oContent.video);
            }
            break;
        case "sap.ino.wall.WallItemPerson":
            oNewItem = new sap.ino.wall.WallItemPerson(oItem);
            if (oContent.phone) {
                oNewItem.setPhone(oContent.phone);
            }
            if (oContent.email) {
                oNewItem.setEmail(oContent.email);
            }
            if (oContent.image) {
                oNewItem.setImage(oContent.image);
            }
            if (oContent.requestImage) {
                oNewItem.setRequestImage(oContent.requestImage);
            }
            if (oContent.assignmentId) {
                oNewItem.setAssignmentId(oContent.assignmentId);
            }
            break;
        case "sap.ino.wall.WallItemNote":
            oNewItem = new sap.ino.wall.WallItemNote(oItem);
            break;
        case "sap.ino.wall.WallItemSticker":
            // use the description field as title (is longer in db)
            if (oItem.description) {
                oItem.title = oItem.description;
            }
            delete oItem.description;
            oNewItem = new sap.ino.wall.WallItemSticker(oItem);
            break;
        case "sap.ino.wall.WallItemText":
            oNewItem = new sap.ino.wall.WallItemText(oItem);
            break;
        case "sap.ino.wall.WallItemHeadline":
            oNewItem = new sap.ino.wall.WallItemHeadline(oItem);
            break;
        case "sap.ino.wall.WallItemLine":
            oNewItem = new sap.ino.wall.WallItemLine(oItem);
            break;
        case "sap.ino.wall.WallItemDocument":
            oNewItem = new sap.ino.wall.WallItemDocument(oItem);
            break;
        case "sap.ino.wall.WallItemSprite":
            oNewItem = new sap.ino.wall.WallItemSprite(oItem);
            break;
        case "sap.ino.wall.WallItemGroup":
            oNewItem = new sap.ino.wall.WallItemGroup(oItem);
            break;
        case "sap.ino.wall.WallItemArrow":
            oNewItem = new sap.ino.wall.WallItemArrow(oItem);
            break;
        default:
            break;
        }        
    
        if (oNewItem !== null) {
            // add children to childs aggregation
            for (; i < oJSONChilds.length; i++) {
                oItem = sap.ino.wall.Wall.createWallItemFromJSON(oJSONChilds[i]);
                oNewItem.addChild(oItem);
            }
            return oNewItem;
        }
    };
    
    /**
     * Factory to create a wall with items (from JSON format)
     * 
     * @param {JSON}
     *            oJSON the wall in JSON format
     * @public
     * @static
     * @return {sap.ino.wall.Wall} the freshly created wall
     */
    sap.ino.wall.Wall.createWallFromJSON = function (oJSON) {
        var oJSONItems = oJSON.items,
            oWall,
            oItem,
            i = 0;

        // remove items to get a clean wall JSON
        delete oJSON.items;
        // escape title to avoid binding errors
        oJSON.title = sap.ino.wall.util.Formatter.escapeBindingCharacters(oJSON.title);
        // uppercase first letter of type for frontend (Template/Wall)
        oJSON.type = sap.ino.wall.util.Formatter.capitalizeFirstLetter(oJSON.type);
        // remove fields that are not relevant for the control to avoid UI5 assertions
        delete oJSON.lastUpdate;
        delete oJSON.ownerLastName;
        delete oJSON.timestamp;
        delete oJSON.hits;
        delete oJSON.ownerEMail;
        delete oJSON.numberOfItems;
        delete oJSON.favorite;
        delete oJSON.ownerFirstName;
        delete oJSON.strongestAuth;
        delete oJSON.auth;
        delete oJSON.actionCode;
        
        sap.ino.wall.util.Formatter.mapNullToInitialValues(oJSON);
        
        // create wall without items by passing the JSON data to the constructor
        oWall = new sap.ino.wall.Wall(oJSON);
        // set mode based on users permissions
        if (oJSON.strongestAuth === "read" || oJSON.strongestAuth === "none") {
            oWall.setMode("Readonly");
        }
        if (!oJSONItems) {
            return oWall;
        }
        // add items based on type specified in JSON format
        for (; i < oJSONItems.length; i++) {
            oItem = sap.ino.wall.Wall.createWallItemFromJSON(oJSONItems[i]);
            oWall._nextDepth = Math.max(oWall._nextDepth, oItem.getDepth());
            oWall.addItem(oItem);
            
            if (oItem instanceof sap.ino.wall.WallItemPerson) {
                if (oItem.getRequestImage()) {
                    oItem._requestIdentity(oItem.getEmail() || oItem.getTitle());
                }
            }
        }

        return oWall;
    };
    
    /* =========================================================== */
    /* begin: control lifecycle methods */
    /* =========================================================== */
    
    /**
     * Initializes the control.
     * 
     * @private
     */
    sap.ino.wall.Wall.prototype.init = function () {
        // init members
        this.setTouchPosition(new sap.ino.wall.Pos());
        this.setViewPoint(new sap.ino.wall.Pos({
            x: 5000,
            y: 5000
        }));

        // init helper variables
        this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.wall");
        this._followHandlers = [];
        this._bIsInDOM = undefined;

        // helper variables for save timing
        this._iWallSaveDelay = sap.ino.wall.config.Config.getWallSaveDelay();
        this._iWallSaveDelayTimer = 0;
        this._iWallItemsSaveDelayTimer = 0;
        this._iWallSyncDelay = 0;
        this._iWallSyncDelayTimer = 0;
        this._iWallSyncMode = false;
        this._oItemsChanged = {};
        this._oPropertiesChanged = {};

        // helper variables for events
        this._touchStartMousePositionX = null;
        this._touchStartMousePositionY = null;
        this._bMoving = false;
        this._bTextSelectionCleared = false;

        this._nextDepth = sap.ino.wall.WallConfig._MIN_DEPTH;

        // do something for initialization
        sap.ino.wall.util.Logger.info('Wall "' + this.getId() + '" is initializing');
    };
        
    sap.ino.wall.Wall.prototype.setWallSaveDelay = function(iWallSaveDelay) {
        this._iWallSaveDelay = iWallSaveDelay;
    };
    
    sap.ino.wall.Wall.prototype.setWallSyncDelay = function(iWallSyncDelay) {
        var that = this;
        this._iWallSyncDelay = iWallSyncDelay;
        clearInterval(this._iWallSyncDelayTimer);
        this._iWallSyncDelayTimer = 0;
        if (this._iWallSyncDelay > 0) {
            this._iWallSyncDelayTimer = setInterval(function () {
                that.fireSync();
            }, this._iWallSyncDelay);   
        }
    };
    
    sap.ino.wall.Wall.prototype.setWallSyncMode = function(bWallSyncMode) {
        this._iWallSyncMode = bWallSyncMode;
        this.fireSyncModeChange({ value : this._iWallSyncMode });
    };
    
    sap.ino.wall.Wall.prototype.getWallSyncMode = function() {
        return this._iWallSyncMode;
    };
    
    /**
     * Complete Updates the wall with items (from JSON format)
     * 
     * @param {JSON}
     *            oJSON the wall in JSON format
     * @public
     * @static
     * @return {sap.ino.wall.Wall} the update wall
     */
    sap.ino.wall.Wall.prototype.updateWallFromJSON = function(oJSON) {
        var oWall = this;
        
        sap.ino.wall.util.Formatter.mapNullToInitialValues(oJSON);
        this.setWallAttributesFromJSON(oJSON);
        
        jQuery.each(oWall.getItems() || [], function(index, oItem) {
            oWall.removeItemWithoutRendering(oItem);
        });
        
        jQuery.each(oJSON.items || [], function(index, oJSONItem) {
            var oItem = sap.ino.wall.Wall.createWallItemFromJSON(oJSONItem);
            oWall.addItemWithoutRendering(oItem);
        });
        
        this.clearAllPendingChanges();
        this.clearAllPendingItemChanges();
        
        return this;
    };
    
    /**
     * Delta Updates the wall with items (from JSON format)
     * 
     * @param {JSON}
     *            oJSON the wall in JSON format
     * @public
     * @static
     * @return {sap.ino.wall.Wall} the update wall
     */
    sap.ino.wall.Wall.prototype.deltaUpdateWallFromJSON = function(oJSON) {
        var oWall = this;
                
        sap.ino.wall.util.Formatter.mapNullToInitialValues(oJSON);
        var bChanged = this.setWallAttributesFromJSON(oJSON);

        function removeItem(oItem) {
            var oParentItem = oItem.getParent() instanceof sap.ino.wall.WallItemBase ? oItem.getParent() : null;
            if (!oParentItem) {
                oWall.removeItemWithoutRendering(oItem);
            } else {
                oParentItem.removeChildWithoutRendering(oItem);
            }
            bChanged = true;
            return oItem;
        }
        
        function addItem(oJSONItem) {
            var oItem = sap.ino.wall.Wall.createWallItemFromJSON(oJSONItem);
            if (oJSONItem.parentId > 0) {
                var oParentItem = oWall.getItemById(oJSONItem.parentId, true);
                if (oParentItem) {
                    oParentItem.addChildWithoutRendering(oItem, true);
                }
            } else {
                oWall.addItemWithoutRendering(oItem);
            }
            bChanged = true;
            return oItem;
        }
        
        function updateItem(oItem, oJSONItem) {
            delete oJSONItem.childs;
            var oNewItem = sap.ino.wall.Wall.createWallItemFromJSON(oJSONItem);
            callSetter(oItem, "title", oNewItem.getTitle());
            callSetter(oItem, "x", oNewItem.getX());
            callSetter(oItem, "y", oNewItem.getY());
            callSetter(oItem, "w", oNewItem.getW());
            callSetter(oItem, "h", oNewItem.getH());
            callSetter(oItem, "depth", oNewItem.getDepth());
            jQuery.each(oItem.getMetadata().getProperties(), function(sPropertyName, oPropertyDef) {
                callSetter(oItem, sPropertyName, oNewItem.getProperty(sPropertyName));
            });
            var oParentItem = oItem.getParent() instanceof sap.ino.wall.WallItemBase ? oItem.getParent() : null;
            if (oParentItem && !oJSONItem.parentId) {
                oParentItem.removeChildWithoutRendering(oItem);
                oWall.addItemWithoutRendering(oItem);
            } else if (!oParentItem && oJSONItem.parentId > 0) {
                oWall.removeItemWithoutRendering(oItem);
                oParentItem = oWall.getItemById(oJSONItem.parentId, true);
                if (oParentItem) {
                    oParentItem.addChildWithoutRendering(oItem, true);
                }
            }
            oItem.invalidate();
            bChanged = true;
            return oItem;
        }
        
        function callSetter(oItem, sProperty, vValue) {
            var sSetter = "set" + sProperty.substring(0, 1).toUpperCase() + sProperty.substring(1);
            if (typeof oItem[sSetter] === "function") {
                oItem[sSetter].apply(oItem, [vValue]);
            } else {
                oItem.setProperty(sProperty, vValue, true);
            }
        }
        
        function handleItem(oJSONItem) {
            var oItem = null;
            if (oJSONItem.storageId > 0) {
                oItem = oWall.getItemById(oJSONItem.storageId, true);
            }
            if (oItem && (oItem.getFlipped() || oItem.$().hasClass("dragCursor"))) {
                return;
            }
            if (oItem && oJSONItem.actionCode == "DELETED") {
                removeItem(oItem);
            } else if (!oItem && (oJSONItem.actionCode == "CREATED" || oJSONItem.actionCode == "UPDATED")) {
                addItem(oJSONItem);
            } else if (oItem && oJSONItem.actionCode == "UPDATED") {
                var aChildItem = oItem.getChilds(); 
                removeItem(oItem);
                var oNewItem = addItem(oJSONItem);
                // Handle Child on Parent
                jQuery.each(aChildItem, function(index, oChildItem) {
                    var aExistingChild = jQuery.grep(oNewItem.getChilds(), function(oExistingChildItem) {
                        return oExistingChildItem.getStorageId() == oChildItem.getStorageId();
                    });
                    var oExistingChild;
                    if (!aExistingChild.length) {
                        oNewItem.addChildWithoutRendering(oChildItem, true);
                        oExistingChild = oChildItem;
                    } else {
                        oExistingChild = aExistingChild[0];
                    } 
                    // Handle Child on Parent in Group
                    jQuery.each(oChildItem.getChilds(), function(index, oChildChildItem) {
                        if (jQuery.grep(oExistingChild.getChilds(), function(oExistingChildChildItem) {
                            return oExistingChildChildItem.getStorageId() == oChildChildItem.getStorageId();
                        }).length == 0) {
                            oExistingChild.addChildWithoutRendering(oChildChildItem, true);
                        }
                    });
                });
                // TODO: Enable delta update instead of remove/add above
                // updateItem(oItem, oJSONItem);
            }
        }
        
        jQuery.each(oJSON.items || [], function(index, oJSONItem) {
            handleItem(oJSONItem);
            bChanged = true;
        });
        
        this.clearAllPendingChanges();
        this.clearAllPendingItemChanges();
        
        return bChanged;
    };
    
    sap.ino.wall.Wall.prototype.setWallAttributesFromJSON = function(oJSON) {
        var oWall = this;
        var bChanged = false;
        
        if (oJSON.title && oWall.getTitle() != sap.ino.wall.util.Formatter.escapeBindingCharacters(oJSON.title)) {
            oWall.setTitle(sap.ino.wall.util.Formatter.escapeBindingCharacters(oJSON.title));
            bChanged = true;
        }
        if (oJSON.backgroundImage && oWall.getBackgroundImage() != oJSON.backgroundImage) {
            oWall.setBackgroundImage(oJSON.backgroundImage);
            bChanged = true;
        }
        if (oJSON.backgroundImageZoom && oWall.getBackgroundImageZoom() != oJSON.backgroundImageZoom) {
            oWall.setBackgroundImageZoom(oJSON.backgroundImageZoom);
            bChanged = true;
        }
        if (oJSON.backgroundImageTiled && oWall.getBackgroundImageTiled() != oJSON.backgroundImageTiled) {
            oWall.setBackgroundImageTiled(oJSON.backgroundImageTiled);
            bChanged = true;
        }
        if (oJSON.backgroundColor && oWall.getBackgroundColor() != oJSON.backgroundColor) {
            oWall.setBackgroundColor(oJSON.backgroundColor);
            bChanged = true;
        }
        if (oJSON.mode && oWall.getMode() != oJSON.mode) {
            oWall.setMode(oJSON.mode);
            bChanged = true;
        }
        if ((oJSON.strongestAuth === "read" || oJSON.strongestAuth === "none") && oWall.getMode() != "Readonly") {
            oWall.setMode("Readonly");
            bChanged = true;
        }
        return bChanged;
    };
    
    /**
     * Get Item by Id
     * 
     */
    sap.ino.wall.Wall.prototype.getItemById = function(iWallItemId, bIncludeChildren) {
        return this._getItemById(this.getItems(), iWallItemId, bIncludeChildren);
    };
    
    sap.ino.wall.Wall.prototype._getItemById = function(aItem, iWallItemId, bIncludeChildren) {
        var that = this;
        var oResult = null;
        jQuery.each(aItem, function(index, oItem) {
            if (oItem.getStorageId() == iWallItemId) {
                oResult = oItem;
            } else if (bIncludeChildren && oItem.getChilds() && oItem.getChilds().length > 0) {
                oResult = that._getItemById(oItem.getChilds(), iWallItemId, true);
            }
            return !oResult;
        });
        return oResult;
    };
    
    /**
     * Destroys the control.
     * 
     * @private
     */
    sap.ino.wall.Wall.prototype.exit = function () {
        // eventing
        this.deregisterWallEvents();
        this._ondragenterProxy = null;
        this._ondragoverProxy = null;
        this._ondragleaveProxy = null;
        this._ondragendProxy = null;
        this._onmousewheelProxy = null;
        this._onpasteProxy = null;
        this._onkeydownProxy = null;
        this._onkeyupProxy = null;
        this._orientationChangeProxy = null;
        this._onmousemoveProxy = null;
        this._touchendProxy = null;
        this._touchmoveProxy = null;

        // flags
        this._bIsInDOM = null;

        // misc
        this._iWallSaveDelay = sap.ino.wall.config.Config.getWallSaveDelay();
        clearTimeout(this._iWallSaveDelayTimer);
        this._iWallSaveDelayTimer = 0;
        clearTimeout(this._iWallItemsSaveDelayTimer);
        this._iWallItemsSaveDelayTimer = 0;
        this._iWallSyncDelay = 0;
        clearTimeout(this._iWallSyncDelayTimer);
        this._iWallSyncDelayTimer = 0;
        this._iWallSyncMode = false;
        this._oItemsChanged = null;
        this._oPropertiesChanged = null;

        // inner controls
        if (this._oHLTrashAbove) {
            this._oHLTrashAbove.destroy();
            this._oHLTrashAbove = null;
        }
        if (this._oHLTrash) {
            this._oHLTrash.destroy();
            this._oHLTrash = null;
        }
        if (this._oSelectionRectangle) {
            this._oSelectionRectangle.destroy();
            this._oSelectionRectangle = null;
        }
        if (this._oLock) {
            this._oLock.destroy();
            this._oLock = null;
        }
        if (this._oTemplateIndicator) {
            this._oTemplateIndicator.destroy();
            this._oTemplateIndicator = null;
        }
    };

    /**
     * Adjusts control before rendering.
     * 
     * @private
     */
    sap.ino.wall.Wall.prototype.onBeforeRendering = function () {
        if (!this._bFirstRenderCall) {
            // set up internal controls
            this._createTrashBin();
            this._createSelectionRectangle();
            this._createLock();
            this._createTemplateIndicator();
            this._bFirstRenderCall = true;
        }
        this.deregisterWallEvents();
    };

    /**
     * Adjusts control after rendering: - update zoom and viewport
     * 
     * @private
     */
    sap.ino.wall.Wall.prototype.onAfterRendering = function () {
        this.registerWallEvents();
        this.updateViewport();
        
        // TODO: for HTML controls we need to adjust the DOM directly, toggleStyleClass does not work
        this._oTemplateIndicator.$().toggleClass("sapInoWallInvisible", this.getType() !== "Template");
    };
    
    /* =========================================================== */
    /* begin: event methods */
    /* =========================================================== */
    
    sap.ino.wall.Wall.prototype.setupWallEvents = function () {
        if (!this._onmousewheelProxy) {
            this._ondragenterProxy = jQuery.proxy(this._ondragenter, this);
            this._ondragoverProxy = jQuery.proxy(this._ondragover, this);
            this._ondragleaveProxy = jQuery.proxy(this._ondragleave, this);
            this._ondragendProxy = jQuery.proxy(this._ondragend, this);
            this._onmousewheelProxy = jQuery.proxy(this._onmousewheel, this);
            this._onpasteProxy = jQuery.proxy(this._onpaste, this);
            this._onkeydownProxy = jQuery.proxy(this._onkeydown, this);
            this._onkeyupProxy = jQuery.proxy(this._onkeyup, this);
            this._orientationChangeProxy = jQuery.proxy(this._onOrientationChange, this);
            this._touchendProxy = jQuery.proxy(this._ontouchend, this);
            this._touchmoveProxy = jQuery.proxy(this._ontouchmove, this);
            // TODO: still needed?
            this._onmousemoveProxy = jQuery.proxy(this._onmousemove, this);
        }
    };
    
    sap.ino.wall.Wall.prototype.registerWallEvents = function () {
        this.setupWallEvents();
        // drag & drop events
        // TODO: currently only needed for debug, check if we still need it
        // TODO: check why debug square is not displayed anymore on drag
        jQuery(window.document).bind("dragenter.wall", this._ondragenterProxy);
        jQuery(window.document).bind("dragover.wall", this._ondragoverProxy);
        jQuery(window.document).bind("dragleave.wall", this._ondragleaveProxy);
        jQuery(window.document).bind("dragend.wall", this._ondragendProxy);
    
        // mouse wheel event (DOMMouseScroll in Firefox, mousewheel else)
        jQuery(window.document).bind(!!sap.ui.Device.browser.firefox ? "DOMMouseScroll.wall" : "mousewheel.wall", this._onmousewheelProxy);
    
        // copy and paste event (needs to be global)
        jQuery(window.document).bind("paste.wall", this._onpasteProxy);
    
        // bind other special keys (like space or CTRL+A) in generic key events
        jQuery(window.document).bind("keydown.wall", this._onkeydownProxy);
        jQuery(window.document).bind("keyup.wall", this._onkeyupProxy);
    
        // mouse events
        jQuery(window.document).bind("touchmove.wall mousemove.wall", this._onmousemoveProxy);
        
        // orientation change
        sap.ui.Device.orientation.attachHandler(this._orientationChangeProxy);
    };
    
    sap.ino.wall.Wall.prototype.deregisterWallEvents = function () {
        jQuery(window.document).unbind("dragenter.wall", this._ondragenterProxy);
        jQuery(window.document).unbind("dragover.wall", this._ondragoverProxy);
        jQuery(window.document).unbind("dragleave.wall", this._ondragleaveProxy);
        jQuery(window.document).unbind("dragend.wall", this._ondragendProxy);
        jQuery(window.document).unbind(!!sap.ui.Device.browser.firefox ? "DOMMouseScroll.wall" : "mousewheel.wall", this._onmousewheelProxy);
        jQuery(window.document).unbind("paste.wall", this._onpasteProxy);
        jQuery(window.document).unbind("keydown.wall", this._onkeydownProxy);
        jQuery(window.document).unbind("keyup.wall", this._onkeyupProxy);
        jQuery(document).unbind("touchmove.wall mousemove.wall", this._onmousemoveProxy);
        sap.ui.Device.orientation.detachHandler(this._orientationChangeProxy);
    };
    
    /**
     * On drop event. Checks the clipboard pasted on the wall and creates an item for it.
     * 
     * @param {jQuery.Event}
     *            oEvent The browser event
     * @private
     */
    sap.ino.wall.Wall.prototype._onpaste = function (oEvent) {
        if (this._wallInteractionPossible(oEvent.target)) {
            // Note: paste event only working with text and in Chrome currently, other browsers only allow to
            // capture the paste event in input controls
            var sText = oEvent.originalEvent.clipboardData.getData(oEvent.originalEvent.clipboardData.items[0].type);
            if (sText) {
                this._processTextDrop(sText, false, sap.ino.wall.WallConfig._ADD_MODE_COPYPASTE);
            }
        }
    };
        
    /**
     * On drop event. Checks the data dropped onto the wall and creates an item for it.
     * 
     * @param {jQuery.Event}
     *            oEvent The browser event
     * @private
     */
    sap.ino.wall.Wall.prototype.ondrop = function (oEvent) {
        // TODO: why is wall not this here
        var that = this,
            dt = oEvent.originalEvent.dataTransfer,
            aFiles = dt.files,
            oFile,
            formData,
            reader,
            aMatches,
            sText,
            aLines,
            bExceedsStickyNoteLength = false,
            i = 0,
            j = 0,
            iMultiOffset = 0;
    
        // prevent further processing of this event
        oEvent.preventDefault();
        oEvent.stopPropagation();
    
        // hide drag preview
        jQuery("drag").css("display", "none");
    
        // reset cursor to normal
        this.$("inner").removeClass("dragCursor");
    
        if (this.getMode() === "Readonly") {
            return;
        }
    
        // display an error if user tries to drop a file with IE9
        if (sap.ui.Device.browser.name === "ie" && sap.ui.Device.browser.version < 10 && aFiles === undefined && oEvent.originalEvent.dataTransfer.getData("text") === null) {
            return;
        }
        
        var oOffset = this.$("inner").offset();
        var fZoomModifier = 100 / this.getZoom();

	    var iX;
	    var iY;
	
	    if (!sap.ino.wall.config.Config.getZoomCapable()) { // scale
	        iX = ((sap.ino.wall.util.Helper.getEventX(oEvent) + Math.abs(oOffset.left)) * fZoomModifier);
	        iY = ((sap.ino.wall.util.Helper.getEventY(oEvent) + Math.abs(oOffset.top)) * fZoomModifier);
	
	    } else { // zoom
	        iX = (sap.ino.wall.util.Helper.getEventX(oEvent) * fZoomModifier - oOffset.left);
	        iY = (sap.ino.wall.util.Helper.getEventY(oEvent) * fZoomModifier - oOffset.top + 5);
	    }	    
    
        if (aFiles && aFiles.length !== 0) { // for ie9 this is empty
            // calculate multi-offset for the last item based on how many non-empty items we have
            for (; i < aFiles.length; i++) {
                oFile = aFiles[i];
                if (!!oFile.type.match(/image\.*/)) {
                    j++;
                }
            }
            iMultiOffset = (j - 1) * sap.ino.wall.WallConfig._MULTI_OFFSET;
            
            var fnFileUpload = function(oFile, iOffset, bImage) {
            	// create a local scope item for the image
                var sFileName = oFile.name;
                var oNewItem;
                
                if (bImage) {
                	oNewItem = new sap.ino.wall.WallItemImage({
	                    status: "Busy",
	                    title : that._oRB.getText("WALL_IMAGE_UPLOAD_TITLE"),
	                    storageId : -2 // -1 is used by the attachment itself
	                });
                }
                else {
                	oNewItem = new sap.ino.wall.WallItemAttachment({
	                    status: "Busy",
	                    title : that._oRB.getText("WALL_ITEMATTACHMENT_NEW_TEXT"),
	                    storageId : -2 // -1 is used by the attachment itself
	                });
                }
                
                var iH = parseInt(oNewItem.getH()) || 0;
                var iW = parseInt(oNewItem.getW()) || 0;
                var sX = (iX + iOffset - (iW / 2)) + "px";
                var sY = (iY + iOffset - (iH / 2)) + "px";
                
                oNewItem.setXY(sX,sY);
                that.addItemWithoutRendering(oNewItem);                
                
                sap.ino.commons.models.object.Attachment.uploadFile(oFile).done(function(oResponse) {
                    var iStorageId = oResponse.attachmentId;
                    var sFileName = oResponse.fileName;
                    if (bImage) {
                    	oNewItem.setPreview(Configuration.getAttachmentDownloadURL(iStorageId), true);
                    	oNewItem.setImage(Configuration.getAttachmentDownloadURL(iStorageId));
                    	oNewItem.setTitle(sFileName);
                        oNewItem.setStatus("Normal");
                	}
                	else {
                		setTimeout(function() {
                			oNewItem.setURL(Configuration.getAttachmentDownloadURL(iStorageId));
                			oNewItem.setTitle(sFileName);
                			oNewItem.setType(oResponse.mediaType);
                			oNewItem.setFileName(sFileName);
                			oNewItem.updateIcon();
                			oNewItem.setStatus("Normal");
                		}, 500);
                	} 
                }).fail(function(oResponse) {
                    // TODO: Handle error
                    that.removeItem(oNewItem);
                });
            };
    
            // upload all files and create items
            for (i = aFiles.length - 1; i >= 0; i--) {
                oFile = aFiles[i];
                fnFileUpload(oFile, iMultiOffset, !!oFile.type.match(/image\.*/));
                iMultiOffset -= sap.ino.wall.WallConfig._MULTI_OFFSET;
            }
        } else {
            sText = oEvent.originalEvent.dataTransfer.getData("text");
            aLines = sText.trim().split("\n"); // firefox does not like \r
    
            // batch drop detection: more than 60 chars in one of the lines or an empty line in the text will cancel
            // the batch drop
            for (; i < aLines.length; i++) {
                
                if (aLines[i].length > sap.ino.wall.WallConfig._MAX_STICKY_NOTE_CREATION_LENGTH * (1 + aLines.length / 30) || (aLines[i].trim().length === 0 && i !== 0 && i !== aLines.length - 1)) {
                    bExceedsStickyNoteLength = true;
                    break;
                }
            }
    
            // request user decision if the text contains many short lines
            if (aLines.length >= 3 && !bExceedsStickyNoteLength) {
                // ask user if he wants to drop multiple sticky notes or a single text node
                sap.m.MessageBox.confirm(this._oRB.getText("WALL_DIALOG_BATCH_STICKY_NOTES"), {
                    onClose: function (sActionClicked) {
                        // process batch of sticky notes if user confirmed it
                        that._processTextDrop(sText, sActionClicked === sap.m.MessageBox.Action.OK, sap.ino.wall.WallConfig._ADD_MODE_DROP, iX, iY);
                    }
                });
            } else {
                // process text event (drop)
                this._processTextDrop(sText, false, sap.ino.wall.WallConfig._ADD_MODE_DROP, iX, iY);
            }
        }
    };
    
    sap.ino.wall.Wall.prototype._processTextDrop = function (sText, bMulti, iMode, iX, iY) {
        var that = this,
            oNewItem = null,
            oRegExpURL = /^(ftp|http|https):\/\/[^ "]+$/,
            oRegExpEmail = /.+@.+\..+/,
            aItems,
            iMultiOffset = 0,
            i = 0,
            j = 0,
            aTemp,
            sName,
            sEmail,
            aLines;
        
        var fnAddItem = function(oItem, iOffset) {
        	var iH = parseInt(oItem.getH()) || 0;
            var iW = parseInt(oItem.getW()) || 0;
            if (isNaN(iX) || isNaN(iY)) {
                that.placeItemInCurrentViewPoint(oItem, true, iOffset);
            } else {
                var sX = (iX + iOffset - (iW / 2)) + "px";
                var sY = (iY + iOffset - (iH / 2)) + "px";
                oItem.setXY(sX,sY);
                that.addItemWithoutRendering(oItem);
            }
        };
    
        // sanitize input for control text properties
        sText = sap.ino.wall.util.Formatter.escapeBindingCharacters(sText);
        // only max 4000 characters
        sText = sText.substring(0, 4000);
    
        if (oRegExpURL.test(sText)) {
            // URL
            if (/www\.youtube\.com\/watch\?v=/.test(sText) || /youtu\.be\// .test(sText)) {
                // youtube video link
                oNewItem = new sap.ino.wall.WallItemVideo({
                    title: that._oRB.getText("WALL_ITEMVIDEO_NEW_TEXT"),
                    video: sText
                });
            } else {
                oNewItem = new sap.ino.wall.WallItemLink({
                    title: that._oRB.getText("WALL_ITEMLINK_NEW_TEXT"),
                    description: sText
                });
            }
        } else if (oRegExpEmail.test(sText) && sText.length < ((sText.match(/[\w\.]+@[\w\.]+\.\w+/g) || []).length) * 100) { 
        	// sanity check for texts including an eMail address (100 chars per mail adress should be enough even for
            // "name <@>" format
            // outlook format
            if (/<[\w\.]+@[\w\.]+\.\w+>/.test(sText)) {
                aItems = sText.split(";");
                iMultiOffset = 0;
                i = 0;
                j = 0;
    
                // calculate multi-offset for the last item based on how many non-empty items we have
                for (; i < aItems.length; i++) {
                    if (aItems[i]) {
                        j++;
                    }
                }
                iMultiOffset = (j - 1) * sap.ino.wall.WallConfig._MULTI_OFFSET;
        
                // when user requested it, add all lines as sticky notes
                for (i = aItems.length - 1; i >= 0; i--) {
                    if (aItems[i]) {
                        // outlook format (name <email>)
                        aTemp = aItems[i].split("<");
                        sName = aTemp[0].trim();
                        sEmail = aTemp[1].replace(">", "");
    
                        (function () {
                            var oNewItem = new sap.ino.wall.WallItemPerson({
                                title: sName
                            });
                            oNewItem.setEmail(sEmail, false, true);
        
                            fnAddItem(oNewItem, iMultiOffset);
                            iMultiOffset -= sap.ino.wall.WallConfig._MULTI_OFFSET;
                        }) ();
                    }
                }
                return;
            } else {
                // fallback: an onrecognized email pattern, add person items for each email address
                aItems = sText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
                iMultiOffset = 0;
                i = 0;
                j = 0;
    
                // calculate multi-offset for the last item based on how many non-empty items we have
                for (; i < aItems.length; i++) {
                    if (aItems[i]) {
                        j++;
                    }
                }
                iMultiOffset = (j - 1) * sap.ino.wall.WallConfig._MULTI_OFFSET;
    
                // fallback: an unrecognized email pattern
                for (i = aItems.length - 1; i >= 0; i--) {
                    if (aItems[i]) {
                        (function () {
                            var oNewItem = new sap.ino.wall.WallItemPerson({
                                title: that._oRB.getText("WALL_ITEMPERSON_NEW_TEXT"),

                            });
                            oNewItem.setEmail(aItems[i], false, true);
                            
                            fnAddItem(oNewItem, iMultiOffset);
                            iMultiOffset -= sap.ino.wall.WallConfig._MULTI_OFFSET;
                        }) ();
                    }
                }
                return;
            }
        } else {
            // TODO: call an identifier service here or ask the user
            // <= 80 chars = sticky note
            // > 80 chars = text
            if (sText && bMulti) {
                aLines = sText.split("\n"); // firefox does not like \r
                iMultiOffset = 0;
                i = 0;
                j = 0;
    
                // calculate multi-offset for the last item based on how many non-empty items we have
                for (; i < aLines.length; i++) {
                    if (aLines[i].trim().length) {
                        j++;
                    }
                }
                iMultiOffset = (j - 1) * sap.ino.wall.WallConfig._MULTI_OFFSET;
    
                // when user requested it, add all lines as sticky notes
                for (i = aLines.length - 1; i >= 0; i--) {
                    if (aLines[i].trim().length) {
                        oNewItem = new sap.ino.wall.WallItemSticker({
                            title: aLines[i]
                        });
                        fnAddItem(oNewItem, iMultiOffset);
                        iMultiOffset -= sap.ino.wall.WallConfig._MULTI_OFFSET;
                    }
                }
                return;
            } else if (sText && sText.length <= sap.ino.wall.WallConfig._MAX_STICKY_NOTE_CREATION_LENGTH) {
                oNewItem = new sap.ino.wall.WallItemSticker({
                    title: sText
                });         
            } else {
                oNewItem = new sap.ino.wall.WallItemText({
                    title: that._oRB.getText("WALL_ITEMTEXT_NEW_TEXT"),
                    description: sText
                });
            }
        }
        fnAddItem(oNewItem, iMultiOffset);
    };
    
    /**
     * On drag enter event called by proxy
     * 
     * @param {jQuery.Event}
     *            oEvent The browser event
     * @private
     */
    sap.ino.wall.Wall.prototype._ondragenter = function (oEvent) { 
        var fDragZoomFactor,
            $dragIndicator,
            $dragIndicatorInner;
    
        // TODO: find out why this is not called
        if (this.getMode() === "Readonly") {
            return;
        }
    
        // the unoptimized formula would be 50 * zoom / 100 (normal drag size = 50px)
        fDragZoomFactor = this.getZoom() / 2;
        
        // show a preview when starting to drag (adopted to zoom factor)
        clearTimeout(this._iDragHideTimer);
        $dragIndicator = jQuery.sap.byId(this.getId() + "-drag");
        $dragIndicator.css("display", "inline");
        $dragIndicatorInner = $dragIndicator.children();
        $dragIndicatorInner.css("width", fDragZoomFactor).css("height", fDragZoomFactor);
        $dragIndicatorInner.css("box-shadow", "0px 0px " + fDragZoomFactor + "px");
    
        // set cursor to grabbing
        this.$("inner").addClass("dragCursor");
    
        if (sap.ino.wall.config.Config.getDebugPositioning()) {
            jQuery.sap.byId(this.getId() + "-dragIndicator").css("display", "inline");
        }
    };
    
    
    /**
     * On drag over event
     * 
     * @param {jQuery.Event}
     *            oEvent The browser event
     * @private
     */
    sap.ino.wall.Wall.prototype._ondragover = function (oEvent) {
        var $dragIndicator;
    
        // sap.ino.wall.util.Logger.info('ondragover');
    
        // move a preview while dragging
        $dragIndicator = this.$("drag");
        $dragIndicator.css("left", sap.ino.wall.util.Helper.getEventX(oEvent)).css("top", sap.ino.wall.util.Helper.getEventY(oEvent) - 60);
    
        // in some cases the drag indicator stays visible (dragend/leave is not called properly, therefore we create
        // a time)
        clearTimeout(this._iDragHideTimer);
        this._iDragHideTimer = setTimeout(function () {
            this.$("drag").css("display", "none");
        }.bind(this), 5000);
    
        // debug: show an indicator for drag position
        if (sap.ino.wall.config.Config.getDebugPositioning()) {
            this.$("dragIndicator").css("display", "inline").css("left", sap.ino.wall.util.Helper.getEventX(oEvent)).css("top", sap.ino.wall.util.Helper.getEventY(oEvent));
        }
    };
    
    sap.ino.wall.Wall.prototype._ondragend = function (oEvent) {
        // TODO: find out why this is not called
        // sap.ino.wall.util.Logger.info('ondragend');
        jQuery.sap.byId(this.getId() + "-drag").css("display", "none");
        if (sap.ino.wall.config.Config.getDebugPositioning()) {
            jQuery.sap.byId(this.getId() + "-dragIndicator").css("display", "none");
        }
    };
    
    /**
     * On drag leave event
     * 
     * @param {jQuery.Event}
     *            oEvent The browser event
     * @private
     */
    sap.ino.wall.Wall.prototype._ondragleave = function (oEvent) {
        // TODO: find out why this is always called
        sap.ino.wall.util.Logger.warning('ondragleave');
        if (oEvent.srcControl) {
            jQuery.sap.byId(this.getId() + "-drag").css("display", "none");
        }
        if (sap.ino.wall.config.Config.getDebugPositioning()) {
            jQuery.sap.byId(this.getId() + "-dragIndicator").css("display", "none");
        }
        oEvent.preventDefault();
        oEvent.stopPropagation();
    };
    
    /**
     * On mouse move event, is used to store the last position of the pointer and for debug positioning
     * 
     * @param {jQuery.Event}
     *            oEvent The browser event
     * @private
     */
    sap.ino.wall.Wall.prototype._onmousemove = function (oEvent) {
        var wallId = this.getId(),
            oOffset = this.$("inner").offset(),
            oTouchPos = this.getTouchPosition();
    
        if (oOffset && sap.ino.wall.util.Helper.getEventX(oEvent) && sap.ino.wall.util.Helper.getEventY(oEvent)) {
            oTouchPos.setX(sap.ino.wall.util.Helper.getEventX(oEvent) - oOffset.left);
            oTouchPos.setY(sap.ino.wall.util.Helper.getEventY(oEvent) - oOffset.top + 25);
    
            this.setTouchPosition(oTouchPos);
    
            // debug: show an indicator for mouse position
            if (sap.ino.wall.config.Config.getDebugPositioning()) {
                jQuery.sap.byId(wallId + "-pointerIndicator").css("display", "inline");
                jQuery.sap.byId(wallId + "-pointerIndicator").css("left", sap.ino.wall.util.Helper.getEventX(oEvent)).css("top", sap.ino.wall.util.Helper.getEventY(oEvent) - 20);
            }
        }
    };
    
    /**
     * Place items that are following the cursor
     * 
     * @param {jQuery.EventObject}
     *            oEvent The event object
     * @private
     */
    sap.ino.wall.Wall.prototype._placeFollowHandlerItems = function () {
        var i = 0;

        if (this._hasFollowCursorItems()) {
            for (;i < this._followHandlers.length; i++) {
                // if items have no position yet (mouse cursor has not moved on the wall) we do not place them
                if (this._followHandlers[i][1].getX() === "" || this._followHandlers[i][1].getY() === "") {
                    continue;
                }

                // unregister the event
                jQuery(document).unbind("touchmove mousemove", this._followHandlers[i][0]);

                // flip item to edit it immediately (except for drop, clone, and detach child mode)
                if (this._followHandlers[i][2] !== sap.ino.wall.WallConfig._ADD_MODE_DROP && 
                    this._followHandlers[i][2] !== sap.ino.wall.WallConfig._ADD_MODE_CLONE && 
                    this._followHandlers[i][2] !== sap.ino.wall.WallConfig._ADD_MODE_DETACHCHILD &&
                    this._followHandlers[i][2] !== sap.ino.wall.WallConfig._ADD_MODE_DETACHGROUPITEM) {
                    this._followHandlers[i][1].setFlipped(true);
                }
    
                this.fireItemAdd({ // pass item as parameter
                    item: this._followHandlers[i][1],
                    mode: this._followHandlers[i][2]
                });
                
                this._followHandlers.splice(i, 1);
                i--; // decrement
            }
    
            // calculate new bounding box
            this._updateBoundingBox();
            // this._followHandlers = []; // empty the array
            return;
        }
    };
    
    /**
     * Handle the touch start/click event.
     * 
     * @param {jQuery.EventObject}
     *            oEvent The event object
     * @private
     */
    sap.ino.wall.Wall.prototype.ontouchstart = function (oEvent) {
        if (sap.ino.wall.ColorPicker.INSTANCE) {
            sap.ino.wall.ColorPicker.INSTANCE.close();
        }
        var iOffsetTop, $selectionRectangle;
        
        // place items that are following the cursor
        this._placeFollowHandlerItems();

        // wall item already took care of the event, we don't need to do anything here
        if (oEvent.isMarked("_sapInoWallInnerItemMove")) {
            return;
        }

        // user is selecting text or doing something in an input field skip this touch event
        if (oEvent.srcControl instanceof sap.m.TextArea || oEvent.srcControl instanceof sap.m.Input || oEvent.srcControl instanceof sap.ino.wall.TextEditor) {
            return;
        }

        // otherwise we set it as handled by the wall
        oEvent.setMarked();

        // here also bound to the mouseup mousemove event to enable it working in desktop browsers
        jQuery(document).on("touchend touchcancel mouseup", this._touchendProxy);
        jQuery(document).on("touchmove mousemove", this._touchmoveProxy);

        if (oEvent.shiftKey) {
            iOffsetTop = this.$("inner").parent().offset().top;
            $selectionRectangle = this.$("selectionRectangle");

            this._touchMode = sap.ino.wall.WallConfig._TOUCHMODE_SELECT;
            // add selection cursor
            this.$("inner").addClass("selectCursor");
            $selectionRectangle.css("display", "block");
            $selectionRectangle.css("left", sap.ino.wall.util.Helper.getEventX(oEvent));
            $selectionRectangle.css("top", sap.ino.wall.util.Helper.getEventY(oEvent) - iOffsetTop);
            $selectionRectangle.css("z-index", this._getNextDepth());
        } else {
            this._touchMode = sap.ino.wall.WallConfig._TOUCHMODE_MOVE;

            // set cursor to grabbing
            this.$("inner").addClass("dragCursor");

            // clear current selection
            this._clearSelection();
        }

        this._touchStartMousePositionX = sap.ino.wall.util.Helper.getEventX(oEvent);
        this._touchStartMousePositionY = sap.ino.wall.util.Helper.getEventY(oEvent);
        this._touchMoveMousePositionX = sap.ino.wall.util.Helper.getEventX(oEvent);
        this._touchMoveMousePositionY = sap.ino.wall.util.Helper.getEventY(oEvent);
        this._bTextSelectionCleared = false;
    };

    /**
     * Handle the touch move event.
     * 
     * @param {jQuery.EventObject}
     *            oEvent The event object
     * @private
     */
    sap.ino.wall.Wall.prototype._ontouchmove = function (oEvent) {
        var fDeltaX,
            fDeltaY,
            fZoomModifier,
            fSpeedX,
            fSpeedY,
            oViewPoint,
            $this,
            iWidth,
            iHeight,
            iOffsetTop,
            $selectionRectangle;
    
        if (oEvent.isMarked()) {
            return;
        }
        
        if (oEvent.touches && oEvent.touches.length > 1) {
            
            var fXDiff = Math.abs(oEvent.touches[0].pageX - oEvent.touches[1].pageX) - this._touchZoomXScale;
            var fYDiff = Math.abs(oEvent.touches[0].pageY - oEvent.touches[1].pageY) - this._touchZoomYScale;
            if (fXDiff || fYDiff) {
                var fZoom = this.getZoom() + (fXDiff ? fXDiff / 3 : 0) + (fYDiff ? fYDiff / 3 : 0);
                this.setZoom(fZoom);
            }
            
            this._touchZoomXScale = Math.abs(oEvent.touches[0].pageX - oEvent.touches[1].pageX);
            this._touchZoomYScale = Math.abs(oEvent.touches[0].pageY - oEvent.touches[1].pageY);
        }
        else {
        
            // calculate helper values
            fDeltaX = sap.ino.wall.util.Helper.getEventX(oEvent) - this._touchMoveMousePositionX;
            fDeltaY = sap.ino.wall.util.Helper.getEventY(oEvent) - this._touchMoveMousePositionY;
            fZoomModifier = 100 / this.getZoom();
            fSpeedX = Math.abs(fDeltaX / 50 * fZoomModifier);
            fSpeedY = Math.abs(fDeltaY / 50 * fZoomModifier);
            oViewPoint = this.getViewPoint();
            $this = this.$("inner");
        
            // remember touch position
            this._touchMoveMousePositionX = sap.ino.wall.util.Helper.getEventX(oEvent);
            this._touchMoveMousePositionY = sap.ino.wall.util.Helper.getEventY(oEvent);
        
            // update wall
            if (fDeltaX || fDeltaY) {
                // clear text selection once when dragging starts
                if (!this._bTextSelectionCleared) {
                    sap.ino.wall.util.Helper.deselectAllText();
                    this._bTextSelectionCleared = true;
                }
                
                if (this._touchMode === sap.ino.wall.WallConfig._TOUCHMODE_SELECT) {
                    iWidth = this._touchMoveMousePositionX - this._touchStartMousePositionX;
                    iHeight = this._touchMoveMousePositionY - this._touchStartMousePositionY;
                    iOffsetTop = this.$("inner").parent().offset().top;
                    $selectionRectangle = this.$("selectionRectangle");
        
                    if (iWidth >= 0) {
                        $selectionRectangle.css("left", this._touchStartMousePositionX);
                        $selectionRectangle.css("width", iWidth);
                    } else {
                        $selectionRectangle.css("left", this._touchStartMousePositionX + iWidth);
                        $selectionRectangle.css("width", Math.abs(iWidth));
                    }
                    if (iHeight >= 0) {
                        $selectionRectangle.css("top", this._touchStartMousePositionY - iOffsetTop);
                        $selectionRectangle.css("height", iHeight);
                    } else {
                        $selectionRectangle.css("top", this._touchStartMousePositionY - iOffsetTop + iHeight);
                        $selectionRectangle.css("height", Math.abs(iHeight));
                    }
                } else {
                    // set moving flag
                    this._bMoving = true;
                    // set cursor to grabbing
                    this.$("inner").addClass("dragCursor");
        
                    // calculate pan speed
                    if (fSpeedX < 1) {
                        fSpeedX = 1;
                    } else if (fSpeedX > 50) {
                        fSpeedX = 50;
                    }
                    if (fSpeedY < 1) {
                        fSpeedY = 1;
                    } else if (fSpeedY > 50) {
                        fSpeedY = 50;
                    }
            
                    // implement a logarithmic pan to compensate zoom factor and allow faster dragging
                    fDeltaX *= Math.log(fSpeedX) + 1;
                    fDeltaY *= Math.log(fSpeedY) + 1;
            
                    // set the new view point
                    oViewPoint.setX(oViewPoint.getX() - fDeltaX);
                    oViewPoint.setY(oViewPoint.getY() - fDeltaY);
                    this.setViewPoint(oViewPoint);
            
                    // ff+ie+sf: adjust wall to viewpoint
                    if (!sap.ino.wall.config.Config.getZoomCapable()) {
                        $this.css("margin", "-" + (oViewPoint.getY() + (oViewPoint.getY() - 5000) * ((this.getZoom() / 100) - 1)) + "px 0 0 -" + (oViewPoint.getX() + (oViewPoint.getX() - 5000) * ((this.getZoom() / 100) - 1)) + "px");
                    } else {
                        $this.css("margin", "-" + oViewPoint.getY() + "px 0 0 -" + oViewPoint.getX() + "px");
                    }
                }
            }
        }
    };
    
    /**
     * Handle the touch end event.
     * 
     * @param {jQuery.EventObject}
     *            oEvent The event object
     * @private
     */
    sap.ino.wall.Wall.prototype._ontouchend = function (oEvent) {
        var that = this,
            $selectionRectangle;
            
        this._touchZoomXScale = undefined;
        this._touchZoomYScale = undefined;
    
        // place items that are following the cursor (except for cloning)
        if (this._iItemClonePosition) {
            // if the item has been cloned and the mouse has moved more than 5px we place it direclty, otherwise a
            // separate click is required
            if (Math.abs(sap.ino.wall.util.Helper.getEventX(oEvent) - this._iItemClonePosition[0]) > 5 ||
                    Math.abs(sap.ino.wall.util.Helper.getEventY(oEvent) - this._iItemClonePosition[1]) > 5) {
                    this._placeFollowHandlerItems();
            }
        } else {
            this._placeFollowHandlerItems();
        }
        this._iItemClonePosition = undefined;
        
        // if an item was moved we don't need to do anything here
        if (this._bMovingItem) {
            jQuery(document).unbind("touchend touchcancel mouseup", this._touchendProxy);
            jQuery(document).unbind("touchmove mousemove", this._touchmoveProxy);
            return;
        }
    
        if (this._touchMode === sap.ino.wall.WallConfig._TOUCHMODE_SELECT) {
            $selectionRectangle = this.$("selectionRectangle");
    
            // determine the selected items in the rectangle
            this._calculateAndTriggerSelection($selectionRectangle.position().left, $selectionRectangle.position().top, $selectionRectangle.outerWidth(), $selectionRectangle.outerHeight());
    
            // remove the selection layer
            $selectionRectangle.css("display", "none");
            $selectionRectangle.css("width", "0px");
            $selectionRectangle.css("height", "0px");
            this.$("inner").removeClass("selectCursor");
        } else {
            // set cursor to normal
            this.$("inner").removeClass("dragCursor");
    
            // we set a timeout to allow other events (click) to also detect if item was moved
            setTimeout(function ()  {
                that._bMoving = false;  
            }, 0);
        }
        this._touchMode = undefined;
    
        jQuery(document).unbind("touchend touchcancel mouseup", this._touchendProxy);
        jQuery(document).unbind("touchmove mousemove", this._touchmoveProxy);
    };
    
    /**
     * Touch cancel event
     * 
     * @param {jQuery.Event}
     *            oEvent
     * @private
     */
    sap.ino.wall.Wall.prototype.ontouchcancel = sap.ino.wall.Wall.prototype.ontouchend;
    
    /**
     * Event object contains detail (for Firefox and Opera), and wheelData (for Internet Explorer, Safari, and Opera).
     * Scrolling down is a positive number for detail, but a negative number for wheelDelta.
     * 
     * @param {jQuery.Event}
     *            oEvent Event object contains detail (for Firefox and Opera), and wheelData (for Internet Explorer,
     *            Safari, and Opera).
     * @private
     */
    sap.ino.wall.Wall.prototype._onmousewheel = function (oEvent)  {
        // init event data and direction (see comments above)
        var oOriginalEvent = oEvent.originalEvent,
            fWheelFactor = oOriginalEvent.detail ? oOriginalEvent.detail : oOriginalEvent.wheelDelta * (-1) / 40.0,
            fZoomFactor = this.getZoom();
        
        var aParents = jQuery(oEvent.target).parents();
        var bIsWall = false;
        var bScroll = false;
        for (var ii = 0; ii < aParents.length; ii++) {
            if (jQuery(aParents[ii]).hasClass("flippable") || jQuery(aParents[ii]).hasClass("sapInoWallWIB")) {
                continue;
            }
            
            if (jQuery(aParents[ii]).hasClass("sapInoWallWOuter") || jQuery(aParents[ii]).hasClass("sapInoWallWInner")) {
                bIsWall = true;
                break;
            }
            
            if (!bIsWall && jQuery(aParents[ii]).get(0).scrollHeight > jQuery(aParents[ii]).outerHeight(true)) {
                bScroll = true;
            }
        }
    
        if (this._wallInteractionPossible(oEvent.target) && 
            bIsWall && !bScroll) {
            // speed up zoom factors > 100 and slowdown for zoom factors < 100
            fZoomFactor += fWheelFactor * (-1) * fZoomFactor / 100.0;
                
            // set the new zoom factor
            this.setZoom(fZoomFactor);
            
            // prevent the default behavior
            oEvent.preventDefault();
            oEvent.stopPropagation();
            return false;
        }
    };
    
    /**
     * Handler for orientation change event.
     * 
     * @param {jQuery.EventObject}
     *            oEvent The event object
     * @private
     */
    sap.ino.wall.Wall.prototype._onOrientationChange = function (oEvent) {
        this.updateViewport();
    };
    
    
    /**
     * Handle the key down event for space detection
     * 
     * @param {jQuery.Event}
     *            oEvent the keyboard event.
     * @private
     */
    sap.ino.wall.Wall.prototype._onkeydown = function (oEvent, oCustomEvent) {
        var that = this,
            iSpaceClearTimer = 0,
            iSelectedItemCount,
            fnCallback;
        
        var bWrite = (sap.ino.wall.WallMode.Write == this.getMode());
        
        // a custom event is given if an item w/ nicEdit works around nicEdit
        // => pass real event as parameter
        if (oCustomEvent) {
            oEvent = oCustomEvent;
        }
    
        if (oEvent.keyCode === 32) { // SPACE KEY: just set a flag
            this._bSpacePressed = true;
            // sometimes key up for space is not coming and the browser hangs anyway after a second
            // we clear the state automatically after 2 seconds to allow movement again
            clearTimeout(iSpaceClearTimer);
            iSpaceClearTimer = setTimeout(function () {
                that._bSpacePressed = false;
            }, 2000);
        }
    
        if (bWrite && oEvent.ctrlKey && oEvent.keyCode === jQuery.sap.KeyCodes.A) { // CTRL + A: select all
            // check if we are on the wall and not in an input field
            if (this._wallInteractionPossible(oEvent.target)) {
                this._selectAll();
                sap.m.MessageToast.show(this._oRB.getText("WALL_TOOLTIP_SELECT_ALL"));
    
                return false; // to suppress default browser behaviour
            }
        } else if (bWrite && oEvent.ctrlKey && oEvent.keyCode === jQuery.sap.KeyCodes.D) { // CTRL + D: deselect all
            // check if we are on the wall and not in an input field
            if (this._wallInteractionPossible(oEvent.target)) {
                this._clearSelection();
                sap.m.MessageToast.show(this._oRB.getText("WALL_TOOLTIP_UNSELECT_ALL"));
    
                return false; // to suppress default browser behaviour
            }
        } else if (oEvent.ctrlKey && oEvent.altKey && (oEvent.keyCode === jQuery.sap.KeyCodes.MINUS || oEvent.keyCode === jQuery.sap.KeyCodes.NUMPAD_MINUS || oEvent.ctrlKey && oEvent.keyCode === 189)) { // CTRL
                                                                                                                                                                // +
                                                                                                                                                                // ALT
                                                                                                                                                                // +
                                                                                                                                                                // MINUS:
                                                                                                                                                                // zoom
                                                                                                                                                                // out
            // check if we are on the wall and not in an input field
            if (this._wallInteractionPossible(oEvent.target)) {
                this.setZoom(this.getZoom() - 10);
            }
            
            // intercept browser zoom with CTRL + "+"
            if (oEvent.keyCode === 189) {
                oEvent.preventDefault();
                oEvent.stopPropagation();
            }            
            
        } else if (oEvent.ctrlKey&& oEvent.altKey && (oEvent.keyCode === jQuery.sap.KeyCodes.PLUS || oEvent.keyCode === jQuery.sap.KeyCodes.NUMPAD_PLUS || oEvent.ctrlKey && oEvent.keyCode === 187)) { // CTRL
                                                                                                                                                            // +
                                                                                                                                                            // ALT
                                                                                                                                                            // +
                                                                                                                                                            // PLUS:
                                                                                                                                                            // zoom
                                                                                                                                                            // in
            // check if we are on the wall and not in an input field
            if (this._wallInteractionPossible(oEvent.target)) {
                this.setZoom(this.getZoom() + 10);
            }
            
            // intercept browser zoom with CTRL + "+"
            if (oEvent.keyCode === 187) {
                oEvent.preventDefault();
                oEvent.stopPropagation();
            }
            
        } else if (oEvent.ctrlKey && oEvent.keyCode === jQuery.sap.KeyCodes.HOME) { // CTRL + HOME: show all items
            // check if we are on the wall and not in an input field
            if (this._wallInteractionPossible(oEvent.target)) {
                this.updateViewport();
                sap.m.MessageToast.show(this._oRB.getText("WALL_TOOLTIP_VIEWPORT_UPDATE"));
            }
        } else if (bWrite && oEvent.keyCode === jQuery.sap.KeyCodes.DELETE) { // DEL: Delete items in selection after
                                                                                // confirmation
            // check if we are on the wall and not in an input field
            if (this._wallInteractionPossible(oEvent.target)) {
                // show confirmation box
                iSelectedItemCount = (this._getSelection() || []).length;
                fnCallback = function (sAction) {
                    if (sAction === sap.m.MessageBox.Action.OK) {
                        that._deleteSelection();
                    }
                };

                if (iSelectedItemCount) {
                    if (iSelectedItemCount === 1) {
                        sap.m.MessageBox.confirm(this._oRB.getText("WALL_DIALOG_CONFIRM_DELETE_ITEM", [sap.ino.wall.util.Formatter.escapeBindingCharacters(sap.ino.wall.util.Helper.stripTags(this._getSelection()[0].getTitle()))]), fnCallback);
                    } else {
                        sap.m.MessageBox.confirm(this._oRB.getText("WALL_DIALOG_CONFIRM_DELETE_ITEMS_MULTIPLE", [iSelectedItemCount]), fnCallback);
                    }
                } else {
                    var oItem = sap.ui.getCore().getElementById(jQuery(oEvent.target)[0].id);
                    
                    if (oItem) {
                        fnCallback = function (sAction) {
                            if (sAction === sap.m.MessageBox.Action.OK) {
                                that.deleteItems([oItem]);                                
                            }
                        };
                        
                        sap.m.MessageBox.confirm(this._oRB.getText("WALL_DIALOG_CONFIRM_DELETE_ITEM", [sap.ino.wall.util.Formatter.escapeBindingCharacters(sap.ino.wall.util.Helper.stripTags(oItem.getTitle()))]), fnCallback);
                    }
                    else {
                        sap.m.MessageToast.show(this._oRB.getText("WALL_TOOLTIP_DELETE_ONLY_WITH_SELECTION"));
                    }
                }
            }
        }
        else if (oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_DOWN ||
                 oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_UP ||
                 oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_LEFT ||
                 oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_RIGHT ||
                 oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_NUMPAD_2 ||
                 oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_NUMPAD_4 ||
                 oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_NUMPAD_6 ||
                 oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_NUMPAD_8) {
            if (jQuery(oEvent.target).hasClass("sapInoWallSelector")) {
                var iStep = 50;
                if (oEvent.ctrlKey) {
                    iStep = 10;
                }
                
                var $Inner = this.$().children().filter(".sapInoWallWInner");
                var oViewPoint = this.getViewPoint();
                
                switch (oEvent.keyCode) {
                    case jQuery.sap.KeyCodes.ARROW_DOWN:
                    case jQuery.sap.KeyCodes.ARROW_NUMPAD_2:
                        iStep = (oViewPoint.getY() + iStep > 10000) ? 10000 : oViewPoint.getY() + iStep; 
                        oViewPoint.setY(iStep);
                        break;
                    case jQuery.sap.KeyCodes.ARROW_UP:
                    case jQuery.sap.KeyCodes.ARROW_NUMPAD_8:
                        iStep = (oViewPoint.getY() - iStep < 0) ? 0 : oViewPoint.getY() - iStep;
                        oViewPoint.setY(iStep);
                        break;
                    case jQuery.sap.KeyCodes.ARROW_LEFT:
                    case jQuery.sap.KeyCodes.ARROW_NUMPAD_4:
                        iStep = (oViewPoint.getX() - iStep < 0) ? 0 : oViewPoint.getX() - iStep;
                        oViewPoint.setX(iStep);
                        break;
                    case jQuery.sap.KeyCodes.ARROW_RIGHT:
                    case jQuery.sap.KeyCodes.ARROW_NUMPAD_6:
                        iStep = (oViewPoint.getX() + iStep > 10000) ? 10000 : oViewPoint.getX() + iStep;
                        oViewPoint.setX(iStep);
                        break;
                    default:
                        break;
                }
                
                // for ff+ie+sf (use scale instead of zoom) we have to add the distance to the center because scale
                // works
                // diferently
                if (!sap.ino.wall.config.Config.getZoomCapable()) {
                    // formula: subtract half the distance to the middle of the wall
                    // x = x + (5000 - x) * 0.5 * invertedZoom
                    // y = y + (5000 - y) * 0.5 * invertedZoom
                    
                    // x = x + (delta to middle point) * zoomFactor/100 -1
                    // x = x + (5000 - x) * 0.8
                    $Inner.css("margin", "-" + (oViewPoint.getY() + (oViewPoint.getY() - 5000) * ((this.getZoom() / 100) - 1)) + "px 0 0 -" + (oViewPoint.getX() + (oViewPoint.getX() - 5000) * ((this.getZoom() / 100) - 1)) + "px");
                } else {
                    $Inner.css("margin", "-" + oViewPoint.getY() + "px 0 0 -" + oViewPoint.getX() + "px");
                }
            
                this.setViewPoint(oViewPoint);     
                
                oEvent.preventDefault();
                oEvent.stopPropagation();
                oEvent.stopImmediatePropagation();
            }
            // TODO move to WallItemBase
            else if (bWrite && jQuery(oEvent.target).hasClass("sapInoWallWIB")) {
                var oItem = sap.ui.getCore().getElementById(jQuery(oEvent.target)[0].id);
                var iStep = 10;
                
                if (oItem) {
                    oItem.setFocusVisible();
                    
                    oItem.setDepth(this._getNextDepth(oItem.getDepth()));
                    
                    if (oEvent.shiftKey) {
                        if (oEvent.ctrlKey) {
                            iStep = 2;
                        }
                        if (oItem.getResizable()) {
                            switch (oEvent.keyCode) {
                                case jQuery.sap.KeyCodes.ARROW_DOWN:
                                case jQuery.sap.KeyCodes.ARROW_NUMPAD_2:
                                    var iBefore = parseInt(oItem.getH(), 10);
                                    oItem.setH((parseInt(oItem.getH(), 10) || sap.ino.wall.WallConfig._ITEM_MIN_SIZE) - iStep);
                                    var iAfter = parseInt(oItem.getH(), 10);
                                    oItem.setY(parseInt(oItem.getY(), 10) + (iBefore - iAfter) / 2);                                    
                                    break;
                                case jQuery.sap.KeyCodes.ARROW_UP:
                                case jQuery.sap.KeyCodes.ARROW_NUMPAD_8:
                                    var iBefore = parseInt(oItem.getH(), 10);
                                    oItem.setH((parseInt(oItem.getH(), 10) || sap.ino.wall.WallConfig._ITEM_MIN_SIZE) + iStep);
                                    var iAfter = parseInt(oItem.getH(), 10);
                                    oItem.setY(parseInt(oItem.getY(), 10) - (iAfter - iBefore) / 2);  
                                    break;
                                case jQuery.sap.KeyCodes.ARROW_LEFT:
                                case jQuery.sap.KeyCodes.ARROW_NUMPAD_4:
                                    var iBefore = parseInt(oItem.getW(), 10);
                                    oItem.setW((parseInt(oItem.getW(), 10) || sap.ino.wall.WallConfig._ITEM_MIN_SIZE) - iStep);
                                    var iAfter = parseInt(oItem.getW(), 10);
                                    oItem.setX(parseInt(oItem.getX(), 10) + (iBefore - iAfter) / 2);  
                                    break;
                                case jQuery.sap.KeyCodes.ARROW_RIGHT:
                                case jQuery.sap.KeyCodes.ARROW_NUMPAD_6:
                                    var iBefore = parseInt(oItem.getW(), 10);
                                    oItem.setW((parseInt(oItem.getW(), 10) || sap.ino.wall.WallConfig._ITEM_MIN_SIZE) + iStep);
                                    var iAfter = parseInt(oItem.getW(), 10);
                                    oItem.setX(parseInt(oItem.getX(), 10) - (iAfter - iBefore) / 2);  
                                    break;
                                default:
                                    break;
                            }
                            
                            var aChilds = oItem.getChilds() || [];
                            if (aChilds.length) {
                                var $childContainer = oItem.$("childs");
                                oItem._adjustChildContainerPositioning($childContainer);
                            }

                            // call item hook to react on resize changes
                            if (oItem._onResize) {
                                oItem._onResize();
                            }
                        }
                    }
                    else {
                        if (oEvent.ctrlKey) {
                            iStep = 1;
                        }
                        
                        switch (oEvent.keyCode) {
                            case jQuery.sap.KeyCodes.ARROW_DOWN:
                            case jQuery.sap.KeyCodes.ARROW_NUMPAD_2:
                                if (!jQuery(oEvent.target).hasClass("sapInoWallWILineVERTICAL")) {
                                    oItem.setY(parseInt(oItem.getY(), 10) + iStep);
                                }
                                break;
                            case jQuery.sap.KeyCodes.ARROW_UP:
                            case jQuery.sap.KeyCodes.ARROW_NUMPAD_8:
                                if (!jQuery(oEvent.target).hasClass("sapInoWallWILineVERTICAL")) {
                                    oItem.setY(parseInt(oItem.getY(), 10) - iStep);
                                }
                                break;
                            case jQuery.sap.KeyCodes.ARROW_LEFT:
                            case jQuery.sap.KeyCodes.ARROW_NUMPAD_4:
                                if (!jQuery(oEvent.target).hasClass("sapInoWallWILineHORIZONTAL")) {
                                    oItem.setX(parseInt(oItem.getX(), 10) - iStep);
                                }
                                break;
                            case jQuery.sap.KeyCodes.ARROW_RIGHT:
                            case jQuery.sap.KeyCodes.ARROW_NUMPAD_6:
                                if (!jQuery(oEvent.target).hasClass("sapInoWallWILineHORIZONTAL")) {
                                    oItem.setX(parseInt(oItem.getX(), 10) + iStep);
                                }
                                break;
                            default:
                                break;
                        }
                    }
                    
                    this._notifyItemChanged(oItem);
                    
                    oEvent.preventDefault();
                    oEvent.stopPropagation();
                    oEvent.stopImmediatePropagation();
                }
            }            
        }
        // like in PPT Crtl + Shift + G to "group"
        else if (bWrite && oEvent.keyCode === jQuery.sap.KeyCodes.G && oEvent.ctrlKey && oEvent.shiftKey) {
            if (jQuery(oEvent.target).hasClass("sapInoWallWIB")) {
                var oItem = sap.ui.getCore().getElementById(jQuery(oEvent.target)[0].id);
                
                if (oItem && !(oItem instanceof sap.ino.wall.WallItemGroup)) {
                    var bGroupOnly = false;
                    var aChildren = oItem.getChilds();
                    if (aChildren && aChildren.length > 0) {
                        // an item with children can only be added to a group
                        bGroupOnly = true;
                    }
                    
                    var aCollisions = this._calculateAllCollisions(oItem, sap.ino.wall.WallConfig._COLLISION_ALL);
                    if (aCollisions && aCollisions.length > 0 && aCollisions[0].length > 0) {
                        // TODO chose the item w/ the biggest collision
                        var iTop = -1;
                        var oCollisionItem;
                        for (var ii = 0; ii < aCollisions[0].length; ++ii) {
                            if (aCollisions[0][ii].getDepth() > iTop && aCollisions[0][ii].getEnabled()) {
                                if (bGroupOnly && !(aCollisions[0][ii] instanceof sap.ino.wall.WallItemGroup)) {
                                    continue;
                                }
                                iTop = aCollisions[0][ii].getDepth();
                                oCollisionItem = aCollisions[0][ii];
                            }
                        }
                        
                        if (oCollisionItem) {
                            // first remove the item from the wall, as the invalidation of the remove is not propagated
                            // during the addAggregation call
                            this.removeAggregation("items", oItem, true);
                            oCollisionItem.addChildWithoutRendering(oItem);
                            
                            this._notifyItemChanged(oItem);
                            this._notifyItemChanged(oCollisionItem);
                            
                            oEvent.preventDefault();
                            oEvent.stopPropagation();
                            oEvent.stopImmediatePropagation();
                            
                            setTimeout(function() {
                                oCollisionItem.setFocusVisible();
                                oCollisionItem.focus();
                            }, 100);
                        }
                    }
                }
            }
        }
        // like in PPT Crtl + Shift + H to "ungroup"
        else if (bWrite && oEvent.keyCode === jQuery.sap.KeyCodes.H && oEvent.ctrlKey && oEvent.shiftKey) {
            if (jQuery(oEvent.target).hasClass("sapInoWallWIB")) {
                var oItem = sap.ui.getCore().getElementById(jQuery(oEvent.target)[0].id);
                
                if (oItem) {
                    var aChilds = oItem.getChilds();
                    
                    var x = parseInt(oItem.getX(), 10) || 5000;
                    var y = parseInt(oItem.getY(), 10) || 5000;
                    
                    var iOffset = sap.ino.wall.WallConfig._MULTI_OFFSET;
                    
                    if (aChilds && aChilds.length > 0) {
                        for (var ii = 0; ii < aChilds.length; ++ii) {
                            aChilds[ii].setX(x + iOffset);
                            aChilds[ii].setY(y + iOffset);
                            
                            iOffset += sap.ino.wall.WallConfig._MULTI_OFFSET;
                            
                            oItem.removeChildWithoutRendering(aChilds[ii]);
                            that.addItemWithoutRendering(aChilds[ii]);
                            
                            this._notifyItemChanged(aChilds[ii]);
                        }
                        
                        this._notifyItemChanged(oItem);
                        
                        oEvent.preventDefault();
                        oEvent.stopPropagation();
                        oEvent.stopImmediatePropagation();
                    }                    
                }
            }
        }
        else if (oEvent.keyCode === jQuery.sap.KeyCodes.ESCAPE) {
            // only handle ESCAPE on wall => even those within the inner wall
            var $InnerWall = jQuery(oEvent.target).parents(".sapInoWallWInner");
            // ignore ESCAPE accidently bubbling from item
            if ($InnerWall && $InnerWall.length > 0 && jQuery(oEvent.target).parents(".sapInoWallWIB").length === 0) {
                jQuery("#" + this.getId() + "-wall-selector").focus();
                
                oEvent.preventDefault();
                oEvent.stopPropagation();
                oEvent.stopImmediatePropagation();
            }
        }
        else if (oEvent.keyCode === jQuery.sap.KeyCodes.ENTER ||
                 oEvent.keyCode === jQuery.sap.KeyCodes.F2) {
            // only handle ENTER on wall
            var $OuterWall = jQuery(oEvent.target).parents(".sapInoWallWOuter");
            // ignore ENTER acciently bubbling from item
            if ($OuterWall && $OuterWall.length > 0 && jQuery(oEvent.target).parents(".sapInoWallWIB").length === 0) {
                var sTarget = jQuery(oEvent.target)[0].id;
                if (sTarget === this.getId() + "-wall-selector") {
                    // enter the wall
                    
                    var aItems = this.getItemsByPosition(undefined, true);
                    this._aTabItems = aItems.filter(function(oItem) {
                        return oItem.getEnabled();
                    });  
                    
                    if (this._aTabItems && this._aTabItems.length > 0) {
                        this.showItems([this._aTabItems[0]]);
                        this._aTabItems[0].setFocusVisible();
                        this._aTabItems[0].focus();
                        
                        oEvent.preventDefault();
                        oEvent.stopPropagation();
                        oEvent.stopImmediatePropagation();
                    }
                }
            }
        }
        else if (oEvent.keyCode === jQuery.sap.KeyCodes.TAB) {
            // only handle tabs on wall
            var $OuterWall = jQuery(oEvent.target).parents(".sapInoWallWOuter");
            // ignore TAB acciently bubbling from item
            if ($OuterWall && $OuterWall.length > 0 && jQuery(oEvent.target).parents(".sapInoWallWIB").length === 0) {
                var sTarget = jQuery(oEvent.target)[0].id;
                var iTabIndex = -1;
                // leave the wall
                if (sTarget === this.getId() + "-wall-selector") {
                    var aTabbable = jQuery(document).find("[tabindex='0']");
                    if (oEvent.shiftKey) {
                        iTabIndex = aTabbable.index(jQuery("#" + this.getId() + "-wall-selector-begin"));
                        iTabIndex--;
                        if (iTabIndex < 0) {
                            iTabIndex = aTabbable.length - 1;
                        }                        
                    }
                    else {
                        iTabIndex = aTabbable.index(jQuery("#" + this.getId() + "-wall-selector-end"))
                        iTabIndex++;
                        if (iTabIndex >= aTabbable.length) {
                            iTabIndex = 0;
                        }                        
                    }    
                    aTabbable[iTabIndex].focus();                    
                }
                else {
                    // TODO optimze performance
                    var aItems = this.getItemsByPosition(undefined, true);
                    
                    this._aTabItems = aItems.filter(function(oItem) {
                        return oItem.getEnabled();
                    });                
                    
                    if (this._aTabItems && this._aTabItems.length === 1) {
                        this.showItems([this._aTabItems[0]]);
                        this._aTabItems[0].setFocusVisible();
                        this._aTabItems[0].focus();
                    }
                    else if (this._aTabItems && this._aTabItems.length > 1) {
                        var $Focus = jQuery(oEvent.target);
                        var oCurrentFocusControl;
                        if ($Focus) {
                            oCurrentFocusControl = sap.ui.getCore().getElementById($Focus.attr("id"));
                        }
                        
                        var iIndex = this._aTabItems.indexOf(oCurrentFocusControl);                
                        
                        if (!oCurrentFocusControl || iIndex === -1) {
                            this.showItems([this._aTabItems[0]]);
                            this._aTabItems[0].setFocusVisible();
                            this._aTabItems[0].focus();
                        }
                        else {
                            if (oEvent.shiftKey) {
                                iIndex--;
                                if (iIndex === -1) {
                                    iIndex = this._aTabItems.length - 1;
                                }                        
                            }
                            else {
                                iIndex++;
                                if (iIndex >= this._aTabItems.length) {
                                    iIndex = 0;
                                }
                            }
                            
                            this.showItems([this._aTabItems[iIndex]]);
                            this._aTabItems[iIndex].setFocusVisible();
                            this._aTabItems[iIndex].focus();
                        }
                    }
                }
                
                oEvent.preventDefault();
                oEvent.stopPropagation();
                oEvent.stopImmediatePropagation();   
            }
        }
    };
    
    /**
     * Handle the key up event for space detection
     * 
     * @param {jQuery.Event}
     *            oEvent the keyboard event.
     * @private
     */
    sap.ino.wall.Wall.prototype._onkeyup = function (oEvent) {
        var that = this;
        
        if (oEvent.keyCode === 32) {
            this._bSpacePressed = false;
        }
        
        // only handle tabs on wall
        var $OuterWall = jQuery(oEvent.target).parents(".sapInoWallWOuter");
        if ($OuterWall && $OuterWall.length > 0) {
            var sTarget = jQuery(oEvent.target)[0].id;
            // focus the wall
            if ((sTarget === this.getId() + "-wall-selector-end" && oEvent.keyCode === jQuery.sap.KeyCodes.TAB && oEvent.shiftKey) ||
                (sTarget === this.getId() + "-wall-selector-begin" && oEvent.keyCode === jQuery.sap.KeyCodes.TAB)) {
                
                jQuery("#" + that.getId() + "-wall-selector").focus();
                                
                oEvent.preventDefault();
                oEvent.stopPropagation();
                oEvent.stopImmediatePropagation();   
            }
        }
    };
    
    /* =========================================================== */
    /* begin: API methods */
    /* =========================================================== */
    
    sap.ino.wall.Wall.prototype.followCursor = function (oItem, iMode, iOffset) {
        var that = this,
    
        fnMouseMoveHandler = function () {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(iOffset); // put iOffset as second element in the array
            args.unshift(oItem); // put oItem as first element in the array
            that._onmousemoveItemUpdate.apply(that, args);
        };
    
        // we store an internal reference to the item and handler [fn, item, mode(0 = add, 1 = drop, 2 = C+P, 3 =
        // Clone)]
        this._followHandlers.push([fnMouseMoveHandler, oItem, iMode, iOffset]);
    
        jQuery(document).on("touchmove mousemove", fnMouseMoveHandler);
    
        return this;
    };
    
    sap.ino.wall.Wall.prototype.editAll = function (bToggle) {
        var aItems = this.getItems(),
            i = 0;
    
        for (;i < aItems.length; i++) {
            aItems[i].setFlipped(bToggle);
        }
        return this;
    };
    
    /**
     * Adds a wall item
     * 
     * @override
     * @returns {this} this pointer for chaining
     * @private
     */
    sap.ino.wall.Wall.prototype.addItem = function (oItem) {
        this.addAggregation("items", oItem);
        return this;
    };
    
    /**
     * A convenience method that can be used in console and bookmarks to add a new item to a wall
     * 
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.Wall.prototype.addAndSaveItem = function (oItem) {
        this.addAggregation("items", oItem);
        this._notifyItemChanged(oItem);
    };
    
    /**
     * Adds a wall item without rerendering the wall
     * 
     * @override
     * @returns {this} this pointer for chaining
     * @private
     */
    sap.ino.wall.Wall.prototype.addItemWithoutRendering = function (oItem) {
        this.addAggregation("items", oItem, true);
        this._renderItemIntoContainer(oItem, false, true);
        return this;
    };
    
    /**
     * Remove a wall item without rerendering the wall
     * 
     * @override
     * @returns {this} this pointer for chaining
     * @private
     */
    sap.ino.wall.Wall.prototype.removeItemWithoutRendering = function (oItem) {
        this.removeAggregation("items", oItem, true);
        oItem.$().remove();
        return this;
    };
    
    /*
     * Adds a new item to the wall with intial settings (depth, follow cursor) @param {WallItemBase} oItem the item
     * @param {int} iFollowMode the follow mode @param {int} iOffset the offset of the item when multiple items are
     * added at the same time @param {int} bBatch true when multiple items are added so that the automatic offset
     * calculation can be ommited @override @returns {this} this pointer for chaining @public
     */
    sap.ino.wall.Wall.prototype.placeItem = function (oItem, iFollowMode, iOffset, bBatch) {
        if (!iOffset) {
            iOffset = 0;
        }
        
        // add an offset if there are already items positioned at the cursor
        if (iOffset === 0 && !bBatch) {
            iOffset += this._followHandlers.length * sap.ino.wall.WallConfig._MULTI_OFFSET;
        }
                    
        oItem.setDepth(this._getNextDepth());
        this.addItemWithoutRendering(oItem, false);
        this.followCursor(oItem, iFollowMode, iOffset);
        
        // bind the touchend event handler so that the item can be immediately placed
        jQuery(document).on("touchend touchcancel mouseup", this._touchendProxy);
        return this;
    };
    
    sap.ino.wall.Wall.prototype.placeItemInCurrentViewPoint = function (oItem, bFocus, iOffset) {
        var oViewPoint = this.getViewPoint();
        var iItemXOffset = (parseInt(oItem.getW(), 10) || sap.ino.wall.WallConfig._ITEM_MIN_SIZE) / 2;
        var iItemYOffset = (parseInt(oItem.getH(), 10) || sap.ino.wall.WallConfig._ITEM_MIN_SIZE) / 2;

        oItem.setXY(oViewPoint.getX() - iItemXOffset + (iOffset || 0), oViewPoint.getY() - iItemYOffset + (iOffset || 0));

        oItem.setDepth(this._getNextDepth());
        
        this.addItemWithoutRendering(oItem, false);
        
        this._notifyItemChanged(oItem);
        
        this.fireItemAdd({
            item: oItem,
            mode: sap.ino.wall.WallConfig._ADD_MODE_MANUAL
        });
        
        setTimeout(function() {
            oItem.setFocusVisible();
            oItem.focus();
            oItem.setFlipped(true);
        }, 100);
        
        return this;
    };
    
    /*
     * Setter for the zoom property to suppress re-rendering and dynamically update the wall @param {float} fValue input
     * value @override @returns {this} this pointer for chaining @public
     */
    sap.ino.wall.Wall.prototype.setZoom = function (fValue, bSuppressNotify) {
        var $this = this.$("inner"),
            oViewPoint;
    
        if (isNaN(fValue)) {
            sap.ino.wall.util.Logger.error("ZoomFactor could not be calculated");
            return;
        }
        
        // sanitize input
        fValue = Math.min(fValue, 200); // set max to 200%
        fValue = Math.max(fValue, 20); // set min to 20%
        if (sap.ui.Device.system.tablet) {
            fValue = Math.max(fValue, 30);
        }
        fValue = Math.round(fValue) * 1.0;
       
        // set property first
        this.setProperty("zoom", fValue, true);
    
        // then do css transformations
        if (this._isRendered()) {
            if (!bSuppressNotify) {
                this._notifyChanged("zoom");
            }
            if (sap.ui.Device.browser.internet_explorer) { // scale
                $this.css("-ms-transform", "scale(" + (fValue / 100) + ")");
            } else if (sap.ui.Device.browser.firefox) { // scale
                $this.css("-moz-transform", "scale(" + (fValue / 100) + ")");
            } else if (sap.ui.Device.browser.safari) { // scale
                $this.css("-webkit-transform", "scale(" + (fValue / 100) + ")");
            } else { // zoom
                // $this.css("-webkit-transform", "scale(" + (fValue/100) + ")");
                $this.css("zoom", fValue + "%");
            }
        }
    
        // ff+ie+sf scale the whole area so the viewport is shifted
        // we have to re-calculate the margins for the current viewport and scale factor again
        if (!sap.ino.wall.config.Config.getZoomCapable()) {
            oViewPoint = this.getViewPoint();
            $this.css("margin", "-" + (oViewPoint.getY() + (oViewPoint.getY() - 5000) * ((this.getZoom() / 100) - 1)) + "px 0 0 -" + (oViewPoint.getX() + (oViewPoint.getX() - 5000) * ((this.getZoom() / 100) - 1)) + "px");
        }
    
        // finally, fire the event to allow listening controls to update
        this.fireZoomChange({
            zoom: this.getZoom()
        });
    
        sap.ino.wall.util.Logger.info("Zoom factor set to " + this.getZoom());
    
        return this;
    };
    
    /**
     * Setter for the title property to suppress re-rendering and dynamically update the wall
     * 
     * @param {string}
     *            sValue input value
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.Wall.prototype.setTitle = function (sValue, bSuppressNotify) {
        if (this.getTitle() !== sValue) {
            var $Description = this.$("wall-description");
            this.setProperty("title", sValue, true);
            if (this._isRendered()) {
                // $Description.html(this._oRB.getText("CRTL_WALL_DESCRIPTION", [sValue]))
                $Description.text(this._oRB.getText("CRTL_WALL_DESCRIPTION", [sValue]));
                if (!bSuppressNotify) {
                    this._notifyChanged("title");
                }
            }
        }
    };
    
    /**
     * Setter for the background image property to suppress re-rendering and dynamically update the wall
     * 
     * @param {string}
     *            sName name of the background image
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.Wall.prototype.setBackgroundImage = function (sName, bSuppressNotify) {
        var $this = this.$("inner");
    
        if (this.getBackgroundImage() !== sName) {
            this.setProperty("backgroundImage", sName, true);
            this.setProperty("backgroundColor", "", true);
        
            if (this._isRendered()) {
                if (!bSuppressNotify) {
                    this._notifyChanged("backgroundImage");
                    this._notifyChanged("backgroundColor");
                }
                $this.css("background-color", "transparent");
                if (this.getBackgroundImage().indexOf("http://") === 0 || this.getBackgroundImage().indexOf("https://") === 0) {
                    // custom background: tile or center and don't repeat
                    $this.css("background-image", "url(" + this.getBackgroundImage() + ")");
                    if (this.getBackgroundImageTiled()) {
                        $this.css("background-position", "initial");
                        $this.css("background-repeat", "repeat");
                    } else {
                        $this.css("background-position", "50% 50%");
                        $this.css("background-repeat", "no-repeat");
                    }
                } else {
                    // default background: just repeat
                    $this.css("background-image", (sName ? "url(/sap/ino/ngui/sap/ino/assets/img/wall/bg/" + this.getBackgroundImage() + ")" : "none"));
                    $this.css("background-position", "0% 0%");
                    $this.css("background-repeat", "repeat");
                    $this.css("background-size", "auto");
                }
            }
        }
    };
    
    /**
     * Setter for the background image zoom property to suppress re-rendering and dynamically update the wall
     * 
     * @param {string}
     *            fPercentage the zoom value in %
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.Wall.prototype.setBackgroundImageZoom = function (fPercentage, bSuppressNotify) {
        var $this = this.$("inner");
    
        if (this.getBackgroundImageZoom() !== fPercentage) {
            this.setProperty("backgroundImageZoom", fPercentage, true);
        
            if (this._isRendered()) {
                if (!bSuppressNotify) {
                    this._notifyChanged("backgroundImageZoom");
                }
        
                if (this.getBackgroundImage().indexOf("http://") === 0 || this.getBackgroundImage().indexOf("https://") === 0) {
                    $this.css("background-size", fPercentage + "%");
                }
            }
        }
    };    
    
    /**
     * Setter for the background image tiled property to suppress re-rendering and dynamically update the wall
     * 
     * @param {boolean}
     *            bTiled whether the (custom) background image should be displayed tiled or not
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.Wall.prototype.setBackgroundImageTiled = function (bTiled, bSuppressNotify) {
        var $this = this.$("inner");
    
        if (this.getBackgroundImageTiled() !== bTiled) {
            this.setProperty("backgroundImageTiled", bTiled, true);
    
            if (this._isRendered()) {
                if (!bSuppressNotify) {
                    this._notifyChanged("backgroundImageTiled");
                }
    
                // only allow non-tiling for custom images, otherwise tile as default
                if (!this.getBackgroundImageTiled() && (this.getBackgroundImage().indexOf("http://") === 0 || this.getBackgroundImage().indexOf("https://") === 0)) {
                    $this.css("background-position", "50% 50%");
                    $this.css("background-repeat", "no-repeat");
                } else {
                    $this.css("background-position", "initial");
                    $this.css("background-repeat", "repeat");
                }
            }
        }
    };

    
    /**
     * Setter for the background image property to suppress re-rendering and dynamically update the wall
     * 
     * @param {string}
     *            sName name of the background image
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.Wall.prototype.setBackgroundColor = function (sColor, bSuppressNotify) {
        var $this = this.$("inner");
    
        if (this.getBackgroundColor() !== sColor) {
            this.setProperty("backgroundImage", "", true);
            this.setProperty("backgroundColor", sColor, true);
        
            if (this._isRendered()) {
                if (!bSuppressNotify) {
                    this._notifyChanged("backgroundImage");
                    this._notifyChanged("backgroundColor");
                }
                $this.css("background-color", "#"+sColor);
                $this.css("background-image", sap.ino.wall.util.Helper.addBrowserPrefix("linear-gradient(top, " + sap.ino.wall.util.Helper.shadeColor(sColor, 10) + " 0%, " + sap.ino.wall.util.Helper.shadeColor(sColor, -10) + " 100%)"));
        
                // default background: just repeat
                $this.css("background-position", "initial");
                $this.css("background-repeat", "no-repeat");
                $this.css("background-size", "initial");
            }
        }
    };
    
    /**
     * Setter for the storageId property to suppress re-rendering
     * 
     * @param {integer}
     *            iValue the storage id of the wall
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.Wall.prototype.setStorageId = function (iValue) {
        this.setProperty("storageId", iValue, true);
    };
    
    /**
     * Setter for the owner property to suppress re-rendering
     * 
     * @param {string}
     *            sOwner the username of the owner of the wall
     * @override
     * @public
     * @returns {this} this pointer for chaining
     * 
     */
    sap.ino.wall.Wall.prototype.setOwner = function (sValue) {
        this.setProperty("owner", sValue, true);
    };
    
    /**
     * Setter for the title property to suppress re-rendering and dynamically update the wall
     * 
     * @param {string}
     *            sValue input value
     * @override
     * @public
     * @returns {this} this pointer for chaining
     */
    sap.ino.wall.Wall.prototype.setMode = function (sMode) {
        this.setProperty("mode", sMode, true);
        // show the lock symbol when the wall is in readonly mode
        if (this._oLock) {
            this._oLock.toggleStyleClass("sapInoWallInvisible", sMode !== sap.ino.wall.WallMode.Readonly);
        }
    };
    
    /**
     * Returns all wall items by the current position from top left to bottom right To get the optimal order of items
     * the algorithm will categorize all items in horizontal lanes and then sort them by lane in vertical orientation.
     * --------------- | 2 5 | | 1 3 4 | |-- lane end --| | 7 9 | | 6 8 | ----------------
     * 
     * @param {array}
     *            [aItems] an array of wall items (optional)
     * @param {boolean}
     *            bWithLayoutItems if true, layout items like lines will also be included (optional)
     * @public
     * @returns {[WallItemBase]} an array of WallItems ordered by position
     */
    sap.ino.wall.Wall.prototype.getItemsByPosition = function (aItems, bWithLayoutItems) {
        var aClusters,
            aSortedItems = [],
            i = 0;

        // if no arguments have been passe we use the current selection
        if (!aItems) {
            aItems = this._getSelection();
        }
        // if there is no selection we use all items
        if (!aItems) {
            aItems = this.getItems();
        }

        // step 1: calculate clusters
        aClusters = this._calculateItemClusters(aItems);

        // step 2: sort clusters
        aClusters = this._swimLaneSort(aClusters);

        // step 3: sort items in each cluster and add them to the result set
        for (; i < aClusters.length; i++) {
            aSortedItems = aSortedItems.concat(this._swimLaneSort(aClusters[i].items));
        }

        // TODO: what about lines? do they have to be inserted at a logical position or at the end

        return aSortedItems;
    };

    /**
     * Combines the 3 methods to calculate zoom and re-positioning.
     * 
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.Wall.prototype.updateViewport = function () {
        var that = this;
        
        if (this.getItems().length) {
            this._updateBoundingBox();
        }
            
        function _updateViewPort() {
            if (that._boundingBox) {
                that._adoptZoomFactorToBoundingBox();
                that._adoptViewPointToBoundingBox();
            }
        }
        
        // Respect custom background image in bounding box (if not tiled)
        if (this.getBackgroundImage() && (this.getBackgroundImage().indexOf("http://") === 0 || this.getBackgroundImage().indexOf("https://") === 0) && !this.getBackgroundImageTiled()) {
            var aItemBoundingBox = this._calculateBoundingBox();
            var oWallInner = this.$("inner");
            var fWallWidth = oWallInner.width();
            var fWallHeight = oWallInner.height();
            
            var img = new Image();
            img.src = oWallInner.css("background-image").replace(/url\(|\)$|"/ig, '');
            img.onload = function () {
                // Respect background image scale
                var fScale = parseInt(that.getBackgroundImageZoom()) / 100.0;
                var fLeft = fWallWidth * (1-fScale) / 2.0;
                var fTop = fWallHeight * (1-fScale) / 2.0;
                
                // Center with image ratio
                var fRatio = img.width / img.height;
                if (fRatio > 1) {
                    fTop += (fWallHeight * fScale - fWallWidth * fScale / fRatio) / 2.0;
                } else if (fRatio < 1) {
                    fTop -= fWallHeight * fScale - fWallWidth * fScale * fRatio;
                }

                var fRight = fWallWidth - fLeft;  
                var fBottom = fWallHeight - fTop;
                
                // Min, Max with wall items
                if (aItemBoundingBox) {
                    fLeft = Math.min(fLeft, aItemBoundingBox[0].getX());
                    fTop = Math.min(fTop, aItemBoundingBox[0].getY());
                    fRight = Math.max(fRight, aItemBoundingBox[1].getX());
                    fBottom = Math.max(fBottom, aItemBoundingBox[1].getY());
                }
                
                var oUpperLeft = new sap.ino.wall.Pos({ x: fLeft, y: fTop });
                var oLowerRight = new sap.ino.wall.Pos({ x: fRight, y: fBottom });
                that._boundingBox = [oUpperLeft, oLowerRight];
                _updateViewPort();
            };
        } else {
            _updateViewPort();
        }
        return this;
    };

    /**
     * Updates the viewport to show the items passed in
     * 
     * @param {[WallItemBase]}
     *            aItems the items to show
     * @param {boolean}
     *            bAdjustZoom pass true to adjust the zoom as well
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.Wall.prototype.showItems = function (aItems, bAdjustZoom) {
        this._adoptViewPointToBoundingBox(this._calculateBoundingBox(aItems));
        if (bAdjustZoom) {
            this._adoptZoomFactorToBoundingBox();
        }
        return this;
    };

    /**
     * Returns the average height of the items passed in as parameters
     * 
     * @param {mixed}
     *            aItems an array of wall items or an array of cluster objects {id, boundingBox, items} to calulate the
     *            order for
     * @private
     * @returns {float} the average height of the items
     */
    sap.ino.wall.Wall.prototype._calculateAverageItemHeight = function (aItems) {
        var i = 0,
            fHeight,
            $item,
            iItemCount = 0,
            fHeightSum = 0.0;

        for (; i < aItems.length; i++) {
            // an item
            if (aItems[i] instanceof sap.ino.wall.WallItemBase) {
                // lines are spanning across the whole area so we skip them
                if (aItems[i] instanceof sap.ino.wall.WallItemLine) {
                    continue;
                }

                $item = aItems[i].$();
                if ($item.length) {
                    fHeight = $item.find(".front").outerHeight();
                } else {
                    fHeight = aItems[i].getH();
                    if (fHeight) {
                        fHeight = parseInt(fHeight, 10);
                    }
                    if (!fHeight) {
                        fHeight = 160;
                    }
                }
            } else {
                // a cluster
                fHeight = aItems[i].boundingBox[1].getY() - aItems[i].boundingBox[0].getY();
            }
            fHeightSum += fHeight;
            iItemCount ++;
        }

        return fHeightSum / iItemCount;
    };

    /**
     * Returns all wall items by the current position from top left to bottom right To get the optimal order of items
     * the algorithm will categorize all items in horizontal lanes and then sort them by lane in vertical orientation.
     * --------------- | 2 5 | | 1 3 4 | |-- lane end --| | 7 9 | | 6 8 | ----------------
     * 
     * @param {mixed}
     *            aItems an array of wall items or an array of cluster objects {id, boundingBox, items} to calulate the
     *            order for
     * @param {boolean}
     *            bWithLayoutItems if true, layout items like lines will also be included (optional)
     * @public
     * @returns {[WallItemBase]} an array of WallItems ordered by position
     */
    sap.ino.wall.Wall.prototype._swimLaneSort = function (aItems, bWithLayoutItems) {
        var fBeginLaneCount = 0,
            fBeginLaneY,
            aLaneItems,
            aResults = [],
            fCurrentItemY,
            iLaneThreshold = this._calculateAverageItemHeight(aItems), // px
            i = 0;

        // sort items by y coordinate ascending (use top left corner)
        aItems = aItems.sort(function (a, b) {
            var y1, y2;

            if (a instanceof sap.ino.wall.WallItemBase) {
                y1 = parseInt(a.getY(), 10);
            } else {
                y1 = a.boundingBox[0].getY();
            }
            if (b instanceof sap.ino.wall.WallItemBase) {
                y2 = parseInt(b.getY(), 10);
            } else {
                y2 = b.boundingBox[0].getY();
            }
            return y1 - y2;
        });

        // process items in horizontal lanes
        while (fBeginLaneCount < aItems.length) {
            if (aItems[fBeginLaneCount] instanceof sap.ino.wall.WallItemBase) {
                fBeginLaneY = parseInt(aItems[fBeginLaneCount].getY(), 10);
            } else {
                fBeginLaneY = parseInt(aItems[fBeginLaneCount].boundingBox[0].getY(), 10);
            }
            aLaneItems = [];

            // collect items for current lane
            for (i = fBeginLaneCount; i < aItems.length; i++) {
                // update current position counter
                fBeginLaneCount = i;
    
                // skip layout items (lines)
                if (!bWithLayoutItems) {
                    if (aItems[i] instanceof sap.ino.wall.WallItemLine) {
                        // skip this item
                        fBeginLaneCount++;
                        continue;
                    }
                }

                // calculate top left y value of the item
                if (aItems[i] instanceof sap.ino.wall.WallItemBase) {
                    fCurrentItemY = parseInt(aItems[i].getY(), 10);
                } else {
                    fCurrentItemY = parseInt(aItems[i].boundingBox[0].getY(), 10);
                }
                
                // bugfix for invalid items (skip them)
                if (isNaN(fCurrentItemY)) {
                    fBeginLaneCount++;
                    break;
                }

                // add all items to current lane until threshold is reached
                if (fCurrentItemY < fBeginLaneY + iLaneThreshold) {
                    // add this item to the current lane
                    fBeginLaneCount++;
                    aLaneItems.push(aItems[i]);
                } else {
                    // start a new lane with current item
                    break;
                }
            }
    
            // sort all current lane items by x value
            aLaneItems = aLaneItems.sort(function (a, b) {
                var x1, x2;

                if (a instanceof sap.ino.wall.WallItemBase) {
                    x1 = parseInt(a.getX(), 10);
                } else {
                    x1 = a.boundingBox[0].getX();
                }
                if (b instanceof sap.ino.wall.WallItemBase) {
                    x2 = parseInt(b.getX(), 10);
                } else {
                    x2 = b.boundingBox[0].getX();
                }
                return x1 - x2;
            });

            // add lane items to result set
            aResults = aResults.concat(aLaneItems);
        }

        return aResults;
    };    
    
    /**
     * Enables/Disables all wall items
     * 
     * @param {boolean}
     *            bEnable if set to true, all items will be enabled, otherwise disabled
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.Wall.prototype.toggleEnableItems = function (bEnable) {
        var aItems = this.getItems(),
            i = 0;
    
        for (; i < aItems.length; i++) {
            aItems[i].setEnabled(bEnable);
        }
    };
    
    sap.ino.wall.Wall.prototype._getSelection = function () {
        return this._aSelectedItems;
    };
    
    /**
     * Toggle the selection of the items
     * 
     * @param {any}
     *            [aItems]|aItem the items or a single ot be selected
     * @param {WallItemBase}
     *            bSelected if set to true, all items will be selected, if false unselected, if left out selection will
     *            be inverted (PowerPoint like selection)
     * @param {boolean}
     *            bEnable if set to true, all items will be enabled, otherwise disabled
     * @returns {this} this pointer for chaining
     * @private
     */
    sap.ino.wall.Wall.prototype._toggleSelection = function (aItems, bSelected) {
        var i = 0;
    
        if (!aItems) {
            return;
        }
    
        // to allow also single values
        if (!(aItems instanceof Array)) {
            aItems = [aItems];
        }
    
        for (; i < aItems.length; i++) {
            if (bSelected === true) {
                aItems[i].setSelected(true);
            } else if (bSelected === false) {
                aItems[i].setSelected(false);
            } else {
                aItems[i].setSelected(!aItems[i].getSelected());
            }
        }
    
        // now calculate new selection
        this._aSelectedItems = [];
        aItems = this.getItems();
        for (i = 0; i < aItems.length; i++) {
            if (aItems[i].getSelected()) {
                this._aSelectedItems.push(aItems[i]);
            }
        }
        // this._aSelectedItems = (this._aSelectedItems ?
        // sap.ino.wall.util.Helper.arrayUnique(this._aSelectedItems.concat(aItems)) : aItems);
    
        return this;
    };
    
    /**
     * Selects all items on the wall
     * 
     * @param {WallItemBase}
     *            [aItems] the items ot be selected
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.Wall.prototype._selectAll = function () {
        var aItems = this.getItems(),
            i = 0;
    
        this._aSelectedItems = [];
    
        for (; i < aItems.length; i++) {
            if (aItems[i] instanceof sap.ino.wall.WallItemLine) {
                continue; // skip lines
            }
            this._aSelectedItems.push(aItems[i]);
            aItems[i].setSelected(true);
        }
    
        return this;
    };
    
    /**
     * Clears all selected items on the wall
     * 
     * @returns {this} this pointer for chaining
     * @private
     */
    sap.ino.wall.Wall.prototype._clearSelection = function () {
        var aItems = this.getItems(),
            i = 0;
    
        for (; i < aItems.length; i++) {
            aItems[i].setSelected(false);
        }
        this._aSelectedItems = null;
    
        return this;
    };
    
    /**
     * Deletes all selected items on the wall
     * 
     * @returns {this} this pointer for chaining
     * @private
     */
    sap.ino.wall.Wall.prototype._deleteSelection = function () {
        var aSelectionItems = this._getSelection() || [];
        this.deleteItems(aSelectionItems)
        this._aSelectedItems = null;
    
        return this;
    };
    
    sap.ino.wall.Wall.prototype.deleteItems = function (aItems) {
        var that = this;
        
        var aRemoveItems = [];
        function removeItems(aItems) {
            for (var i = 0; i < aItems.length; i++) {
                var oItem = aItems[i];
                aRemoveItems.push(oItem);
                removeItems(oItem.getChilds() || []);
                that.clearPendingItemChange(oItem, true);
                that.removeItemWithoutRendering(oItem);
            }    
        }
        
        removeItems(aItems);
        // fire delete event
        this.fireItemDelete({
            items: aRemoveItems
        });
        
        return this;
    };
    
    
    /**
     * Creates a minimalic JSON representation of the wall to be stored in the db
     * 
     * @param {boolean}
     *            sColor color identifier
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.Wall.prototype.formatToJSON = function (bWithItems) {
        var aItems = this.getItems(),
            oResult = {
                "title": this.getTitle(),
                "id": this.getId(),
                // "type": this.getType(), should not be changed by frontend
                "backgroundColor" : this.getBackgroundColor(),
                "backgroundImage" : this.getBackgroundImage(),
                "backgroundImageZoom" : this.getBackgroundImageZoom(),
                "backgroundImageTiled" : this.getBackgroundImageTiled(),
                "storageId" : this.getStorageId()
            },
            i = 0;
    
        if (bWithItems) {
            oResult.items = [];
            // add JSON for each item
            for (; i < aItems.length; i++) {
                oResult.items.push(aItems[i].formatToJSON());
            }
        }
    
        return oResult;
    };
    
    /* =========================================================== */
    /* begin: internal methods and properties */
    /* =========================================================== */
    
    sap.ino.wall.Wall.prototype._onmousemoveItemUpdate = function (oItem, iCustomItemOffset, oEvent) {
        var oOffset = this.$("inner").offset(),
            fZoomModifier = 100 / this.getZoom(),
            iItemOffset = iCustomItemOffset || 0;
    
        // FIX: some chrome installations do fail here
        if (!this.$().length) {
            sap.ino.wall.util.Logger.warning('_onmousemoveItemUpdate failed, wall is not rendered');
            return;
        }
        
        if (!sap.ino.wall.config.Config.getZoomCapable()) { // scale
            oItem.setXY(((sap.ino.wall.util.Helper.getEventX(oEvent) + Math.abs(oOffset.left)) * fZoomModifier + iItemOffset) + "px", ((sap.ino.wall.util.Helper.getEventY(oEvent) + Math.abs(oOffset.top)) * fZoomModifier + iItemOffset) + "px");
        } else { // zoom
            oItem.setXY((sap.ino.wall.util.Helper.getEventX(oEvent) * fZoomModifier - oOffset.left + iItemOffset) + "px", (sap.ino.wall.util.Helper.getEventY(oEvent) * fZoomModifier - oOffset.top + iItemOffset + 5) + "px");
        }
    
        // TODO: these checks are done twice (in wallItemBase touchMove and here): put them somewhere else
        // special case line: can only be moved in one direction, other direction swaps orientation
        if (oItem instanceof sap.ino.wall.WallItemLine) {
            if (oItem.getOrientation() === "HORIZONTAL") {
                oItem.setX("0px");
            } else if (oItem.getOrientation() === "VERTICAL") {
                oItem.setY("0px");
            }
        }
    };

    /**
     * Updates the bounding box for all wall items and shows debug information It is used for dynamically calculating
     * the zoom factor and re-positioning the wall.
     * 
     * @returns {sap.ino.wall.Wall} this pointer for chaining
     * @private
     */
    sap.ino.wall.Wall.prototype._updateBoundingBox = function () {
        var aBoundingBox = this._calculateBoundingBox(),
            aClusters,
            $boundingBox,
            $clusterContainer,
            $clusterBox,
            i = 0;

        if (aBoundingBox) {
            this._boundingBox = aBoundingBox;

            // debug: show and log the bounding box
            if (sap.ino.wall.config.Config.getDebugPositioning()) {
                // show bounding box
                sap.ino.wall.util.Logger.info("new bounding box: ul (" + aBoundingBox[0].getX() + "px/" + aBoundingBox[0].getY() + "px), lr (" + aBoundingBox[1].getX() + "px/" + aBoundingBox[1].getY() + "px)");
                $boundingBox = jQuery.sap.byId(this.getId() + "-boundingBox");
                $boundingBox.css("display", "block");
                $boundingBox.css("left", Math.floor(aBoundingBox[0].getX())).css("top", Math.floor(aBoundingBox[0].getY()));
                $boundingBox.width(Math.floor(aBoundingBox[1].getX() - aBoundingBox[0].getX()));
                $boundingBox.height(Math.floor(aBoundingBox[1].getY() - aBoundingBox[0].getY()));
                $boundingBox.text("ul (" + aBoundingBox[0].getX() + "px/" + aBoundingBox[0].getY() + "px), lr (" + aBoundingBox[1].getX() + "px/" + aBoundingBox[1].getY() + "px)");

                // calculate clusters for debug output
                aClusters = this._calculateItemClusters(this.getItems());

                // show cluster as debug output
                sap.ino.wall.util.Logger.info("new cluster calculation: " + aClusters.length + " clusters identified");
                $clusterContainer = jQuery.sap.byId(this.getId() + "-clusterBox");
                $clusterContainer.css("display", "block");
                $clusterContainer.empty();

                for (; i < aClusters.length; i++) {
                    aBoundingBox = aClusters[i].boundingBox;
                    $clusterBox = jQuery('<div id="' + this.getId() + '"-clusterBox" class="saUiWallWCB"></div>');
                    $clusterBox.css("left", Math.floor(aBoundingBox[0].getX())).css("top", Math.floor(aBoundingBox[0].getY()));
                    $clusterBox.width(Math.floor(aBoundingBox[1].getX() - aBoundingBox[0].getX()));
                    $clusterBox.height(Math.floor(aBoundingBox[1].getY() - aBoundingBox[0].getY()));
                    $clusterBox.text("cluster " + i + ": ul (" + aBoundingBox[0].getX() + "px/" + aBoundingBox[0].getY() + "px), lr (" + aBoundingBox[1].getX() + "px/" + aBoundingBox[1].getY() + "px)");
                    $clusterContainer.append($clusterBox);
                }
            }
        }
        return this;
    };

    /**
     * A simple algorithm to calculate the bounding box of any wall items
     * 
     * @parameter {WallItemBase} aItems an array of wall items for which the bounding box should be calculated
     * @returns {array} the coordinates of the bounding box as two sap.ino.wall.Pos objects
     * @private
     */
    sap.ino.wall.Wall.prototype._calculateBoundingBox = function (aItems) {
        var i = 0,
            oUpperLeft = null,
            oLowerRight = null,
            $item,
            pos,
            fOuterWidth,
            fOuterHeight,
            firstItem = true;

        // call without arguments: take all items
        if (!aItems) {
            aItems = this.getItems();
        }

        for (; i < aItems.length; i++) {
            // lines are spanning across the whole area so we skip them
            if (aItems[i] instanceof sap.ino.wall.WallItemLine) {
                continue;
            }

            $item = aItems[i].$();
            if ($item.length) {
                // for wall re-calculations we use the actual dom value calculated by the browser
                fOuterWidth = $item.find(".front").outerWidth();
                fOuterHeight = $item.find(".front").outerHeight();
            } else {
                // try using the stored height of the items
                fOuterWidth = aItems[i].getW();
                fOuterHeight = aItems[i].getH();
                if (fOuterWidth) {
                    fOuterWidth = parseInt(fOuterWidth, 10);
                }
                if (fOuterHeight) {
                    fOuterHeight = parseInt(fOuterHeight, 10);
                }
    
                // fallback (default w/h)
                if (!fOuterWidth) {
                    fOuterWidth = 160;
                }
                if (!fOuterHeight) {
                    fOuterHeight = 160;
                }
            }
            // TODO: for preview the wall is not rendered, calc based on estimations
            pos = {
                left: parseFloat(aItems[i].getX(), 10),
                top: parseFloat(aItems[i].getY(), 10)
            };
            if (!(aItems[i].getParent() instanceof sap.ino.wall.WallItemGroup) && (pos.left <= 0 || pos.top <= 0)) {
                // when item is added by addItem it gets (0/0) position by default
                // faulty negative values prohibit the wall to be scrolled, we ignore them
                // group items are ok though, they can be at position 0/0 and even at negative values because they are
                // placed relatively to the group
                continue; 
            }
            if (pos.left === "" || pos.top === "" || isNaN(pos.left) || isNaN(pos.top)) {
                continue; // ignore items with faulty values
            }

            if (firstItem) {
                // init with first items coordinates
                oUpperLeft = new sap.ino.wall.Pos({ x: pos.left, y: pos.top});
                oLowerRight = new sap.ino.wall.Pos({ x: pos.left + fOuterWidth, y: pos.top + fOuterHeight});
                firstItem = false;
            } else {
                // check ul and x
                if (pos.left < oUpperLeft.getX()) {
                    oUpperLeft.setX(pos.left);
                } 
                // check ul and y
                if (pos.top < oUpperLeft.getY()) {
                    oUpperLeft.setY(pos.top);
                } 
                
                // check lr and x
                if ((pos.left + fOuterWidth) > oLowerRight.getX()) {
                    oLowerRight.setX(pos.left + fOuterWidth);
                }
                // check lr and y
                if ((pos.top + fOuterHeight) > oLowerRight.getY()) {
                    oLowerRight.setY(pos.top + fOuterHeight);
                }
            }
        }

        if (!oUpperLeft) {
            // we only have items that do not affect the bounding box
            return;
        }

        // TODO: the pos coordinates are not destroyed and initialized
        oUpperLeft.floorify();
        oLowerRight.floorify();
        return [oUpperLeft, oLowerRight];
    };

    /**
     * Calculates the zoom factor that matches best to the current bounding box.
     * 
     * @returns {this} this pointer for chaining
     * @private
     */
    sap.ino.wall.Wall.prototype._adoptZoomFactorToBoundingBox = function () {
        var that = this,
            iWallWidth = this.getParent().$().width(),
            iWallHeight = $(document).height() - this.getHeaderHeight() - this.getFooterHeight(),
            oUpperLeft = this._boundingBox[0],
            oLowerRight = this._boundingBox[1],
            iDeltaX,
            iDeltaY,
            fZoomX,
            fZoomY,
            fZoomFactor;

        // add some margin to the bounding box to have a small distance between the items and page
        iDeltaX = (oLowerRight.getX() - oUpperLeft.getX());
        iDeltaY = (oLowerRight.getY() - oUpperLeft.getY());
        fZoomX = iWallWidth / iDeltaX;
        fZoomY = iWallHeight / iDeltaY;

        fZoomFactor = Math.min(fZoomX, fZoomY) * 100.0;
        fZoomFactor = Math.min(fZoomFactor, 180); // set max to 180%
        // fZoomFactor = Math.max(fZoomFactor, 50); // set min to 50 (not needed anymore)
        that.setZoom(Math.floor(fZoomFactor));

        return this;
    };

    /**
     * Calculates the view point that matches best to the current bounding box.
     * 
     * @returns {this} this pointer for chaining
     * @private
     */
    sap.ino.wall.Wall.prototype._adoptViewPointToBoundingBox = function (aBoundingBox) {
        var aBoundingBox = aBoundingBox || this._boundingBox,
            $this = this.$("inner"),
            oViewPoint = this.getViewPoint(),
            iWallWidth = this.getParent().$().width(),
            iWallHeight = jQuery(document).height() - this.getHeaderHeight() - this.getFooterHeight(),
            oUpperLeft = aBoundingBox[0],
            oLowerRight = aBoundingBox[1],
            deltaX,
            deltaY,
            zoomFactor = this.getZoom() / 100;
    
        // formula: pageSize - zoom(WallSize)
        deltaX = iWallWidth - (oLowerRight.getX() - oUpperLeft.getX()) * zoomFactor; // TODO
        deltaY = iWallHeight - (oLowerRight.getY() - oUpperLeft.getY()) * zoomFactor; // TODO
    
        // always show a small margin when the wall is larger than screen (delta is < 0)
        deltaX = Math.max(deltaX, 32); // 2rem
        deltaY = Math.max(deltaY, 32); // 2rem
    
        // formula: upperLeft + invertZoom(windowSize - deltaSize) / 2
        oViewPoint.setX(oUpperLeft.getX() + (iWallWidth - deltaX) * 1 / (zoomFactor * 2));
        oViewPoint.setY(oUpperLeft.getY() + (iWallHeight - deltaY) * 1 / (zoomFactor * 2));
    
        // for ff+ie+sf (use scale instead of zoom) we have to add the distance to the center because scale works
        // diferently
        if (!sap.ino.wall.config.Config.getZoomCapable()) {
            // formula: subtract half the distance to the middle of the wall
            // x = x + (5000 - x) * 0.5 * invertedZoom
            // y = y + (5000 - y) * 0.5 * invertedZoom
            
            // x = x + (delta to middle point) * zoomFactor/100 -1
            // x = x + (5000 - x) * 0.8
            $this.css("margin", "-" + (oViewPoint.getY() + (oViewPoint.getY() - 5000) * ((this.getZoom() / 100) - 1)) + "px 0 0 -" + (oViewPoint.getX() + (oViewPoint.getX() - 5000) * ((this.getZoom() / 100) - 1)) + "px");
        } else {
            $this.css("margin", "-" + oViewPoint.getY() + "px 0 0 -" + oViewPoint.getX() + "px");
        }
    
        this.setViewPoint(oViewPoint);
    
        return this;
    };
    
    sap.ino.wall.Wall.prototype._calculateAndTriggerSelection = function (fLeft, fTop, fWidth, fHeight) {
        var oOffset = this.$("inner").offset(),
            fZoomModifier = 100 / this.getZoom();

        // calculated wall coordinates from screen coordinates
        // TODO: header offset is static
        var fTopOffset = this.$("inner").parent().offset().top;
        if (!sap.ino.wall.config.Config.getZoomCapable()) {
            fLeft = (fLeft + Math.abs(oOffset.left)) * fZoomModifier;
            fTop = (fTop + Math.abs(oOffset.top)) * fZoomModifier + fTopOffset * fZoomModifier;
            fWidth = fWidth * fZoomModifier;
            fHeight = fHeight * fZoomModifier;
        } else { // zoom
            fLeft = fLeft * fZoomModifier - oOffset.left;
            fTop = fTop * fZoomModifier - oOffset.top + fTopOffset * fZoomModifier;
            fWidth = fWidth * fZoomModifier;
            fHeight = fHeight * fZoomModifier;
        }

        // calculate collisions with selection box and select the items
        this._toggleSelection(this._calculateAllCollisions([fLeft, fTop, fWidth, fHeight], sap.ino.wall.WallConfig._COLLISION_INTERSECTIONS)[0]);
    };
    
    /**
     * Convenience function to calculate the collissions for all wall items. Calls _calculateCollisions with all wall
     * items
     * 
     * @param {mixed}
     *            oItem a WallItemBase or an array of ["left", "top", "width", height"]
     * @param {int}
     *            iMode sap.ino.wall.WallConfig._COLLISION_ALL || sap.ino.wall.WallConfig._COLLISION_NEIGHBOURS ||
     *            sap.ino.wall.WallConfig._COLLISION_INTERSECTES
     * @param {WallItemBase}
     *            oSkipItem an optional item that is skipped automatically
     * @returns {mixed} two arrays with the inner and outer collisions of this item
     * @protected
     */
    sap.ino.wall.Wall.prototype._calculateAllCollisions = function (oItem, iMode, oSkipItem) {
        var aItems = this.getItems();
    
        return this._calculateCollisions(aItems, oItem, iMode, oSkipItem);
    };
    
    /**
     * Calculates the inner and outer collisions with other items on the wall.
     * 
     * @param {mixed}
     *            aItems an array of wall items or an array of ["left", "top", "width", height"] to calulate the
     *            collisions for
     * @param {mixed}
     *            oItem a WallItemBase or an array of ["left", "top", "width", height"]
     * @param {int}
     *            iMode sap.ino.wall.WallConfig._COLLISION_ALL || sap.ino.wall.WallConfig._COLLISION_NEIGHBOURS ||
     *            sap.ino.wall.WallConfig._COLLISION_INTERSECTIONS
     * @param {WallItemBase}
     *            oSkipItem an optional item that is skipped automatically
     * @param {int}
     *            iCustomTheshold a custom threshold in px for calculating the neighborhood
     * @returns {mixed} two arrays with the inner and outer collisions of this item
     * @protected
     */
    sap.ino.wall.Wall.prototype._calculateCollisions = function (aItems, oItem, iMode, oSkipItem, iCustomThreshold) {
        var aCollisions = [],
            aNeighbours = [],
            i = 0,
            iThreshold = iCustomThreshold || sap.ino.wall.config.Config.getWallCollisionThreshold(),
            $item = null,
            oItemUL,
            oItemLR,
            oCollisionItem,
            $collisionItem,
            oCollisionUL,
            oCollisionLR,
            fOuterWidth,
            fOuterHeight,
            temp;

        // TODO: optimize this so that only the items currently visible are checked

        // skip line
        if (oItem instanceof sap.ino.wall.WallItemLine) {
            return [aCollisions, aNeighbours];
        }

        if (aItems.length) {
            // TODO: are these pos objects ever destroyed???!?!!?
            if (oItem instanceof sap.ino.wall.WallItemBase) {
                $item = oItem.$();
    
                // init check item outer coordinates once
                if ($item.length) {
                    fOuterWidth = $item.find(".front").outerWidth();
                    fOuterHeight = $item.find(".front").outerHeight();
                    oItemUL = new sap.ino.wall.Pos({x: parseInt($item.css("left"), 10), y: parseInt($item.css("top"), 10)});
                    oItemLR = new sap.ino.wall.Pos({x: oItemUL.getX() + fOuterWidth, y: oItemUL.getY() + fOuterHeight});
                } else {
                    fOuterWidth = 160;
                    fOuterHeight = 160;
                    oItemUL = new sap.ino.wall.Pos({x: parseInt(oItem.getX(), 10), y: parseInt(oItem.getY(), 10)});
                    oItemLR = new sap.ino.wall.Pos({x: oItemUL.getX() + fOuterWidth, y: oItemUL.getY() + fOuterHeight});
                }
            } else {
                oItemUL = new sap.ino.wall.Pos({x: oItem[0], y: oItem[1]});
                oItemLR = new sap.ino.wall.Pos({x: oItem[0] + oItem[2], y: oItem[1] + oItem[3]});
            }
    
            // reset debug colors
            if (sap.ino.wall.config.Config.getDebugPositioning() && oItem instanceof sap.ino.wall.WallItemBase && !iCustomThreshold) { 
                if ($item) {
                    $item.find(".sapInoWallWIBIntersectionBox").css("background-color", "");
                    $item.find(".sapInoWallWIBNeighbourBox").css("background-color", "");
                }
    
                for (; i < aItems.length; i++) {
                    aItems[i].$().find(".sapInoWallWIBIntersectionBox").css("background-color", "");
                    aItems[i].$().find(".sapInoWallWIBNeighbourBox").css("background-color", "");
                }
            }

            for (i = 0; i < aItems.length; i++) {
                oCollisionItem = aItems[i];

                // skip self
                if (oCollisionItem === oItem || oCollisionItem === oSkipItem) {
                    continue;
                }

                // skip lines
                if (oCollisionItem instanceof sap.ino.wall.WallItemLine) {
                    continue;
                }

                // skip arrows
                if (oCollisionItem instanceof sap.ino.wall.WallItemArrow) {
                    continue;
                }
                
                if (oCollisionItem instanceof sap.ino.wall.WallItemBase) {
                    $collisionItem = oCollisionItem.$();
                    if ($collisionItem.length) {
                        fOuterWidth = $collisionItem.find(".front").outerWidth();
                        fOuterHeight = $collisionItem.find(".front").outerHeight();
                        oCollisionUL = new sap.ino.wall.Pos({x: parseInt($collisionItem.css("left"), 10), y: parseInt($collisionItem.css("top"), 10)});
                        oCollisionLR = new sap.ino.wall.Pos({x: oCollisionUL.getX() + fOuterWidth, y: oCollisionUL.getY() + fOuterHeight});
                        // if anything goes wrong during the conversion we skip this collision item
                        if (isNaN(oCollisionUL.getX()) || isNaN(oCollisionUL.getY()) || isNaN(oCollisionLR.getX()) || isNaN(oCollisionLR.getY())) {
                            continue;
                        }
                    } else {
                        fOuterWidth = 160; // TODO: make this more flexible
                        fOuterHeight = 160; // TODO: make this more flexible
                        oCollisionUL = new sap.ino.wall.Pos({x: parseInt(oCollisionItem.getX(), 10), y: parseInt(oCollisionItem.getY(), 10)});
                        oCollisionLR = new sap.ino.wall.Pos({x: oCollisionUL.getX() + fOuterWidth, y: oCollisionUL.getY() + fOuterHeight});
                    }
        
                    if (oCollisionUL.getX() === 0 && oCollisionUL.getY() === 0) {
                        continue; // when item is added by addItem it gets (0/0) position by default
                    }
                } else {
                    oCollisionUL = new sap.ino.wall.Pos({x: oCollisionItem[0], y: oCollisionItem[1]});
                    oCollisionLR = new sap.ino.wall.Pos({x: oCollisionItem[0] + oCollisionItem[2], y: oCollisionItem[1] + oCollisionItem[3]});
                }
    
                // TODO: performance optimize this
                // basic 2d collision detection logic: NOT ((Rect1.Bottom < Rect2.Top) OR (Rect1.Top > Rect2.Bottom)
                // OR (Rect1.Left > Rect2.Right) OR (Rect1.Right < Rect2.Left) )
                if ((iMode === sap.ino.wall.WallConfig._COLLISION_ALL || iMode === sap.ino.wall.WallConfig._COLLISION_INTERSECTIONS) &&
                    !(
                        (oItemLR.getY() < oCollisionUL.getY()) ||
                        (oItemUL.getY() > oCollisionLR.getY()) ||
                        (oItemUL.getX() > oCollisionLR.getX()) ||
                        (oItemLR.getX() < oCollisionUL.getX())
                    )) {
                    // these objects collide, add either the object or the index of the boundingBox
                    if (oCollisionItem instanceof sap.ino.wall.WallItemBase) {
                        aCollisions.push(aItems[i]);
                    } else {
                        aCollisions.push(oCollisionItem[4]); // the id of the boundingBox / cluster
                    }
                    if (sap.ino.wall.config.Config.getDebugPositioning() && !iCustomThreshold) {
                        sap.ino.wall.util.Logger.info("Item \"" + oItem + "\" collides with item \"" + aItems[i] + "\"");
                        if (oItem instanceof sap.ino.wall.WallItemBase) {
                            oItem.$().find(".sapInoWallWIBIntersectionBox").css("background-color", "rgba(255,0,0,0.6)");
                        }
                        if (oCollisionItem instanceof sap.ino.wall.WallItemBase) {
                            aItems[i].$().find(".sapInoWallWIBIntersectionBox").css("background-color", "rgba(255,0,0,0.6)");
                        }
                    }
                } else if ((iMode === sap.ino.wall.WallConfig._COLLISION_ALL || iMode === sap.ino.wall.WallConfig._COLLISION_NEIGHBOURS) &&
                    !(
                        (oItemLR.getY() + iThreshold < oCollisionUL.getY() - iThreshold) ||
                        (oItemUL.getY() - iThreshold > oCollisionLR.getY() + iThreshold) ||
                        (oItemUL.getX() - iThreshold > oCollisionLR.getX() + iThreshold) ||
                        (oItemLR.getX() + iThreshold < oCollisionUL.getX() - iThreshold)
                    )) {

                    // these objects are neighbours, add either the object or the index of the boundingBox
                    if (oCollisionItem instanceof sap.ino.wall.WallItemBase) {
                        aNeighbours.push(aItems[i]);
                    } else {
                        aNeighbours.push(oCollisionItem[4]); // the id of the boundingBox / cluster
                    }
                    if (sap.ino.wall.config.Config.getDebugPositioning() && !iCustomThreshold) {
                        sap.ino.wall.util.Logger.info("Item \"" + oItem + "\" is neighbour of item \"" + aItems[i] + "\"");
                        if (oItem instanceof sap.ino.wall.WallItemBase) {
                            oItem.$().find(".sapInoWallWIBNeighbourBox").css("background-color", "rgba(255,125,0,0.6)");
                        }
                        if (oCollisionItem instanceof sap.ino.wall.WallItemBase) {
                            aItems[i].$().find(".sapInoWallWIBNeighbourBox").css("background-color", "rgba(255,125,0,0.6)");
                        }
                    }
                }
            }
        }
    
        // return both arrays to the caller
        return [aCollisions, aNeighbours];
    };
    
    /**
     * A flexible algorithm to cluster wall items (using our internal collision detection and bounding box algorithms)
     * It is used for managing the tab chain, the item export order, and the search focus
     * 
     * @returns {this} this pointer for chaining
     * @private
     */
    sap.ino.wall.Wall.prototype._calculateItemClusters = function (aItems) {
        // shared
        var aClusters = [],
            i = 0,
            j,
            aCollisions,
            aCollisionIds,
            // step 1
            aClusterBoundingBox,
            // step 2
            bMergedClusters = false,
            aAllOtherClusters,
            aAllOtherClusterBoxes,
            aClustersToMerge,
            aClustersToMergeIds,
            oNewCluster,
            iSafetyCheck = 0;
    
        // step 1: transform all items into clusters
        while (aItems.length > 0) {
            // lines are spanning across the whole area so we skip them
            if (aItems[0] instanceof sap.ino.wall.WallItemLine) {
                aItems.splice(0, 1);
                continue;
            }
    
            // step 1a) calculate collisions for this item with all other items
            aCollisions = this._calculateCollisions(aItems, aItems[0], sap.ino.wall.WallConfig._COLLISION_ALL, null, 100); // custom
                                                                                                                            // neighbour
                                                                                                                            // theshold
            // merge collisions and neighbors
            aCollisions = aCollisions[0].concat(aCollisions[1]);
            // add own item
            aCollisions.push(aItems[0]);
    
            // step 1b) calculate the bounding box for the new cluster
            aClusterBoundingBox = this._calculateBoundingBox(aCollisions);
    
            // step 1c) save cluster with bounding box
            
            // sanity check: only add items that have a valid bounding box
            if (aClusterBoundingBox) {
                aClusters.push({
                    id: jQuery.sap.uid(),
                    boundingBox: aClusterBoundingBox,
                    items: aCollisions
                });
            }
    
            // step 1d) remove the collisions from the items array for the next iteration
            aCollisionIds = aCollisions.map(function (oItem) {
                return oItem.getId();
            });
            aItems = aItems.filter(function (oItem) {
                return (aCollisionIds.indexOf(oItem.getId()) === -1);
            });
        }
    
        // step 2) expand the clusters by calculating the collisions of the cluster bounding box to other clusters
        do {
            // end condition: if this stays false we will leave the loop
            bMergedClusters = false;
            iSafetyCheck++;
            for (i = 0; i < aClusters.length; i++) {
                // copy clusters
                aAllOtherClusters = aClusters.slice(0);
    
                // remove current cluster
                aAllOtherClusters.splice(i, 1);
    
                // create an array of the bounding boxes to test with
                aAllOtherClusterBoxes = [];
                for (j = 0; j < aAllOtherClusters.length; j++) {
                    aAllOtherClusterBoxes.push([
                        aAllOtherClusters[j].boundingBox[0].getX(), // left
                        aAllOtherClusters[j].boundingBox[0].getY(), // top
                        aAllOtherClusters[j].boundingBox[1].getX() - aClusters[i].boundingBox[0].getX(), // width
                        aAllOtherClusters[j].boundingBox[1].getY() - aClusters[i].boundingBox[0].getY(), // height
                        aAllOtherClusters[j].id // the id to identify the bounding box
                    ]);
                }
    
                // step 2a) calculate collisions with all items of other clusters
                aCollisions = this._calculateCollisions(aAllOtherClusterBoxes, [
                    aClusters[i].boundingBox[0].getX(), // left
                    aClusters[i].boundingBox[0].getY(), // top
                    aClusters[i].boundingBox[1].getX() - aClusters[i].boundingBox[0].getX(), // width
                    aClusters[i].boundingBox[1].getY() - aClusters[i].boundingBox[0].getY(), // height
                    aClusters[i].id // the id to identify the bounding box
                ], sap.ino.wall.WallConfig._COLLISION_ALL, null, 70); // custom neighbour threshold
                // merge collisions and neighbors
                aCollisions = aCollisions[0].concat(aCollisions[1]);
    
                // step 2b) merge clusters
                if (aCollisions.length > 0) {
                    // return either the id of the item or the index of the cluster
                    aCollisionIds = aCollisions.map(function (oItem) {
                        return (oItem.getId ? oItem.getId() : oItem);
                    });
    
                    // find and add the clusters that were returned as an index by the collision detection mechanism
                    aClustersToMerge = aClusters.filter(function (oCluster) {
                        return (aCollisionIds.indexOf(oCluster.id)  !== -1);
                    });
                    aClustersToMerge.push(aClusters[i]);
    
                    // calculate new cluster
                    oNewCluster = {
                        id: jQuery.sap.uid(),
                        boundingBox: [],
                        items: []
                    };
                    for (j = 0; j < aClustersToMerge.length; j++) {
                        oNewCluster.items = oNewCluster.items.concat(aClustersToMerge[j].items);
                    }
                    oNewCluster.boundingBox = this._calculateBoundingBox(oNewCluster.items);
    
                    // remove merged clusters from the cluster array
                    aClustersToMergeIds = aClustersToMerge.map(function (oCluster) {
                        return oCluster.id; 
                    });
                    for (j = 0; j < aClusters.length; j++) {
                        if (aClustersToMergeIds.indexOf(aClusters[j].id) !== -1) {
                            aClusters.splice(j, 1);
                            j--;
                        }
                    }
    
                    // add new cluster to the cluster array
                    aClusters.push(oNewCluster);
    
                    // stop loop and repeat
                    bMergedClusters = true;
                    break;
                }
            }
            // TODO: check why this happens
            if (iSafetyCheck > 90) {
                jQuery.sap.log.error("something went wrong when calculating the clusters!");
            }
        } while (bMergedClusters && aClusters.length !== 1 && iSafetyCheck < 99);
    
        return aClusters;
    };
    
    /**
     * Get the next depth value for an item
     * 
     * @param {int}
     *            current depth (optional), only return a higher depth if required
     * @public
     * @static
     * @return {int} the next possible depth value
     */
    sap.ino.wall.Wall.prototype._getNextDepth = function (iDepth) {
        
        if (iDepth != undefined && this._nextDepth === iDepth) {
            return this._nextDepth;
        }
        
        // if depth range is exceeded, we need to reduce the depth range for all items
        if (this._nextDepth + sap.ino.wall.WallConfig._DEPTH_STEP > sap.ino.wall.WallConfig._MAX_DEPTH) {
            this._reduceItemDepth();
        }
        this._nextDepth += sap.ino.wall.WallConfig._DEPTH_STEP;
        return this._nextDepth;
    };
    
    // TODO: implement this
    sap.ino.wall.Wall.prototype._reduceItemDepth = function () {
        var aItems = this.getItems(),
            aItemsSortedByDepth = aItems.sort(function (a, b) {
                if (a.getDepth() < b.getDepth()) {
                    return -1;
                } else if (a.getDepth() > b.getDepth()) {
                    return 1;
                } else {
                    return 0;
                }
            }),
            i = 0;
    
        // set minimum possible depth values on all items
        this._nextDepth = sap.ino.wall.WallConfig._MIN_DEPTH;
        for (; i < aItemsSortedByDepth.length; i++) {
            aItemsSortedByDepth[i].setDepth(this._getNextDepth());
        }
    };
    
    /* =========================================================== */
    /* begin: general purpose helper functions */
    /* =========================================================== */
    
    /**
     * Renders and flushes a wall item without re-rendering the complete wall
     * 
     * @returns {this} this pointer for chaining
     * @private
     */
    sap.ino.wall.Wall.prototype._renderItemIntoContainer = function (oItem, bDoNotPreserve, vInsert) {
        var oDomRef = this.$("inner")[0];
        
        sap.ino.wall.util.Helper.renderItemIntoContainer(oDomRef, oItem, bDoNotPreserve, vInsert);
    
        return this;
    };
    
    /**
     * Checks if the control is already written to the DOM to allow for layout changes
     * 
     * @returns {this} this pointer for chaining
     * @private
     */
    sap.ino.wall.Wall.prototype._isRendered = function () {
        if (this._bIsInDOM === undefined || this._bIsInDOM === 0) {
            this._bIsInDOM = jQuery.sap.byId(this.getId() + "-inner").length;
        }
    
        return this._bIsInDOM;
    };
    
    /**
     * Checks if there are any items attached to the cursor
     * 
     * @returns {boolean} true if there are items attached to the cursor, false if not
     * @protected
     */
    sap.ino.wall.Wall.prototype._hasFollowCursorItems = function () {
        return this._followHandlers.length > 0;
    };
    
    /**
     * Fires the wall item change event after no further action has happened for a configurable delay
     * 
     * @param {WallItemBase}
     *            oItem the item that has been changed
     * @returns {this} this pointer for chaining
     * @private
     */
    sap.ino.wall.Wall.prototype._notifyItemChanged = function (oItem) {
        var that = this;
    
        if (this.getMode() === "Readonly") {
            return;
        }
        
        if (oItem.getStorageId() > 0) {
            if (oItem) {
                this._oItemsChanged[oItem.getId()] = oItem;
            }
        
            clearTimeout(this._iWallItemsSaveDelayTimer);
            this._iWallItemsSaveDelayTimer = setTimeout(function () {
                // fire changed event with all items after [_wallSaveDelay] without further changes
                that.fireItemChange({items: that._oItemsChanged});
                that._oItemsChanged  = {};
            }, this._iWallSaveDelay);
        }
    
        return this;
    };
    
    /**
     * checks if the wall is the current page and if the control is not an input field
     * 
     * @returns {this} this pointer for chaining
     * @param {sap.ui.core.Control}
     *            oTargetControl the control that triggered the even
     * @private
     */
    sap.ino.wall.Wall.prototype._wallInteractionPossible = function (oTargetControl) {
        if (this.getParent() &&
            !(jQuery(oTargetControl).control()[0] instanceof sap.ino.wall.TextEditor) &&
            jQuery(oTargetControl).filter('input,textarea,select').length === 0) {
            return true;
        }
        return false;
    };

    /**
     * Fires the wall change event after no further action has happened for a configurable delay
     * 
     * @param {string}
     *            sProperty the property that has been changed
     * @returns {this} this pointer for chaining
     * @private
     */
    sap.ino.wall.Wall.prototype._notifyChanged = function (sProperty) {
        var that = this;

        if (this.getMode() === "Readonly") {
            return;
        }

        if (sProperty) {
            this._oPropertiesChanged[sProperty] = true;
        }
        clearTimeout(this._iWallSaveDelayTimer);
        this._iWallSaveDelayTimer = setTimeout(function () {
            // fire changed event with all items after [_wallSaveDelay] without further changes
            that.fireChange({properties: that._oPropertiesChanged});
            that._oPropertiesChanged  = {};
        }, this._iWallSaveDelay);

        return this;
    };
    
    sap.ino.wall.Wall.prototype.forceSyncFireChange = function () {
        var that = this;
        
        var aPromise = [];
        
        if (!jQuery.isEmptyObject(that._oPropertiesChanged)) {
            var oDeferred = jQuery.Deferred();
            that.fireChange({ properties: that._oPropertiesChanged,
                              sync : true,
                              deferred: oDeferred });
            aPromise.push(oDeferred.promise());
        }
        that.clearAllPendingChanges();
        
        if (!jQuery.isEmptyObject(that._oItemsChanged)) {
            var oDeferred = jQuery.Deferred();
            that.fireItemChange({ items: that._oItemsChanged,
                                  sync : true,
                                  deferred: oDeferred });
            aPromise.push(oDeferred.promise());
        }
        that.clearAllPendingItemChanges();
        
        return jQuery.when.apply(undefined, aPromise);
    }

    /**
     * Clears the change timer and resets the changed items (call this function when saving the wall manually)
     * 
     * @returns {this} this pointer for chaining
     * @private
     */
    sap.ino.wall.Wall.prototype.clearAllPendingItemChanges = function () {
        clearTimeout(this._iWallItemsSaveDelayTimer);
        this._oItemsChanged  = {};
    };

    /**
     * Clears the change timer and resets the changed items (call this function when saving the wall manually)
     * 
     * @returns {this} this pointer for chaining
     * @private
     */
    sap.ino.wall.Wall.prototype.clearAllPendingChanges = function () {
        clearTimeout(this._iWallSaveDelayTimer);
        this._oPropertiesChanged  = {};
    };

    /**
     * Clears an item from the pending changes and removes the timer if there are no other items to be saved (call this
     * function when saving a wall item manually)
     * 
     * @returns {this} this pointer for chaining
     * @param {WallItemBase}
     *            the item to be cleared
     * @param {boolean}
     *            whether the children should also be cleared or not
     * @private
     */
    sap.ino.wall.Wall.prototype.clearPendingItemChange = function (oItem, bWithChildren) {
        var i = 0, aChilds;
        
        delete this._oItemsChanged[oItem.getId()];
        if (Object.keys(this._oItemsChanged).length === 0) {
            clearTimeout(this._iWallItemsSaveDelayTimer);
        }
        
        // also clear the pending changes for children if requested
        if (bWithChildren) {
            aChilds = oItem.getChilds();
            for (; i < aChilds.length; i++) {
                this.clearPendingItemChange(aChilds[i], true);
            }
        }
    };

    /**
     * Returns true if there are properties to be saved, otherwise false
     * 
     * @returns {boolean} the expected result
     * @private
     */
    sap.ino.wall.Wall.prototype.hasPendingChanges = function () {
        return !!Object.keys(this._oPropertiesChanged).length;
    };

    /**
     * Returns true if there are items to be saved, otherwise false
     * 
     * @returns {boolean} the expected result
     * @private
     */
    sap.ino.wall.Wall.prototype.hasPendingItemChanges = function () {
        return !!Object.keys(this._oItemsChanged).length;
    };

    /**
     * Set up the internal trash bin structure
     * 
     * @private
     */
    sap.ino.wall.Wall.prototype._createTrashBin = function () {
        var that = this;

        // trash above: in chrome, the trash bin is below the item so we add a second semi-transparent trashbin
        // above the item
        if (sap.ui.Device.browser.chrome) {
            this._oHLTrashAbove = new sap.ui.layout.HorizontalLayout(this.getId() + "-trashAbove", {
                content: [
                    new sap.ino.wall.Hoverable({
                        enter: function () {
                            var $trash;
    
                            if (that.getMode() === sap.ino.wall.WallMode.Readonly || that._bMovingItem) {
                                return;
                            }
                            that.fireHover({
                                element: "Trash",
                                interaction: "Enter",
                                tooltip: this.getContent().getTooltip()
                            });
    
                            // bring to front when hovering
                            $trash = that.$("trash");
                            $trash.clearQueue().css("opacity", 1);
                            $trash.css("z-index", 10000);
                        },
                        leave: function () {
                            var $trash;
    
                            if (that.getMode() === sap.ino.wall.WallMode.Readonly || that._bMovingItem) {
                                return;
                            }
                            that.fireHover({
                                element: "Trash",
                                interaction: "Leave",
                                tooltip: null
                            });
    
                            $trash = that.$("trash");
                            $trash.clearQueue().css("opacity", 0);// .animate({opacity: "0"}, 500);
                        },
                        content: sap.ui.core.IconPool.createControlByURI({
                            id: this.getId() + "-trashbinAbove",
                            tooltip: "{i18n>WALL_STATUSMSG_TRASH}",
                            src: sap.ui.core.IconPool.getIconURI("delete")
                        }).addStyleClass("sapInoWallWTrashBin above")
                    })
                ]
            }).addStyleClass("sapInoWallWTrash above");
            this.addDependent(this._oHLTrashAbove);
        }

        /* trash */
        this._oHLTrash = new sap.ui.layout.HorizontalLayout(this.getId() + "-trash", {
            content: [
                new sap.ino.wall.Hoverable({
                    enter: function () {
                        var $trash;

                        if (that.getMode() === sap.ino.wall.WallMode.Readonly || that._bMovingItem) {
                            return;
                        }
                        that.fireHover({
                            element: "Trash",
                            interaction: "Enter",
                            tooltip: this.getContent().getTooltip()
                        });

                        // bring to front when hovering
                        $trash = that.$("trash");
                        $trash.clearQueue().css("opacity", 1);
                        $trash.css("z-index", 10000);
                    },
                    leave: function () {
                        var $trash;

                        if (that.getMode() === sap.ino.wall.WallMode.Readonly || that._bMovingItem) {
                            return;
                        }
                        that.fireHover({
                            element: "Trash",
                            interaction: "Leave",
                            tooltip: null
                        });

                        $trash = that.$("trash");
                        $trash.clearQueue().css("opacity", 0);// .animate({opacity: "0"}, 500);
                    },
                    content: sap.ui.core.IconPool.createControlByURI({
                        id: this.getId() + "-trashbin",
                        tooltip: "{i18n>WALL_STATUSMSG_TRASH}",
                        src: sap.ui.core.IconPool.getIconURI("delete")
                    }).addStyleClass("sapInoWallWTrashBin")
                })
            ]
        }).addStyleClass("sapInoWallWTrash");
        this.addDependent(this._oHLTrash);
    };

    /**
     * Set up the internal selection rectangle structure
     * 
     * @private
     */
    sap.ino.wall.Wall.prototype._createSelectionRectangle = function () {
        this._oSelectionRectangle = new sap.ui.core.HTML(this.getId() + "-selectionRectangle", {
            content: '<div class="sapInoWallWSelectionRectangle sapInoWallWNoSelection"></div>',
            sanitizeContent: true
        });
    };
    
    /**
     * Set up the internal lock structure
     * 
     * @private
     */
    sap.ino.wall.Wall.prototype._createLock = function () {
        this._oLock = new sap.ui.layout.HorizontalLayout(this.getId() + "-lock", {
            content: [
                      new sap.ino.wall.Hoverable({
                          content: sap.ui.core.IconPool.createControlByURI({
                              id: this.getId() + "-lockIcon",                              
                              src: sap.ui.core.IconPool.getIconURI("locked")
                          }).bindProperty("tooltip", "i18n>WALL_STATUSMSG_LOCK").addStyleClass("sapInoWallWLockIcon")
                      })
                      ]
        }).addStyleClass("sapInoWallWLock");
        this.addDependent(this._oLock);
        
        // hide lock if not in readonly mode
        if (this.getMode() !== sap.ino.wall.WallMode.Readonly) {
            this._oLock.addStyleClass("sapInoWallInvisible");
        }
    };
    
    /**
     * Set up the internal template indicator structure
     * 
     * @private
     */
    sap.ino.wall.Wall.prototype._createTemplateIndicator = function () {
        this._oTemplateIndicator = new sap.ui.core.HTML(this.getId() + "-templateIndicator", {
            content: '<div class="sapInoWallWTemplateIndicator sapInoWallInvisible" title="' + this._oRB.getText("WALL_STATUSMSG_TEMPLATE") + '"><div class="sapInoWallWTemplateIndicatorInner">' + this._oRB.getText("WALL_TEMPLATE_INDICATOR") + '</div></div>',
            sanitizeContent: true
        });
        this.addDependent(this._oTemplateIndicator);
    };

})();