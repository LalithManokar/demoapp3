/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.DragButton");

(function() {
    "use strict";

    /**
     * Constructor for a new DragButton.
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
     * <li>{@link sap.ino.wall.DragButton#event:drag drag} : fnListenerFunction or [fnListenerFunction,
     * oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
     * </ul>
     * </li>
     * </ul>
     * 
     * 
     * In addition, all settings applicable to the base type {@link sap.m.Button#constructor sap.m.Button} can be used
     * as well.
     * 
     * @param {string}
     *            [sId] id for the new control, generated automatically if no id is given
     * @param {object}
     *            [mSettings] initial settings for the new control
     * 
     * @class A button that additionally fires an event when the touchout event on the button
     * @extends sap.m.Button
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.DragButton
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.m.Button.extend("sap.ino.wall.DragButton", {
        metadata : {
            events : {
                "drag" : {},
                "activateByKey" : {}
            }
        }
    });

    /**
     * Creates a new subclass of class sap.ino.wall.DragButton with name <code>sClassName</code> and enriches it
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
     * @name sap.ino.wall.DragButton.extend
     * @function
     */

    sap.ino.wall.DragButton.M_EVENTS = {
        'drag' : 'drag',
        'activateByKey' : 'activateByKey'
    };

    /**
     * 
     * @name sap.ino.wall.DragButton#drag
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
     * Attach event handler <code>fnFunction</code> to the 'drag' event of this
     * <code>sap.ino.wall.DragButton</code>.<br/>. When called, the context of the event handler (its
     * <code>this</code>) will be bound to <code>oListener<code> if specified
     * otherwise to this <code>sap.ino.wall.DragButton</code>.<br/> itself. 
     *  
     *
     * @param {object}
     *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
     * @param {function}
     *            fnFunction The function to call, when the event occurs.  
     * @param {object}
     *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ino.wall.DragButton</code>.<br/> itself.
     *
     * @return {sap.ino.wall.DragButton} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.DragButton#attachDrag
     * @function
     */

    /**
     * Detach event handler <code>fnFunction</code> from the 'drag' event of this
     * <code>sap.ino.wall.DragButton</code>.<br/>
     * 
     * The passed function and listener object must match the ones used for event registration.
     * 
     * @param {function}
     *            fnFunction The function to call, when the event occurs.
     * @param {object}
     *            oListener Context object on which the given function had to be called.
     * @return {sap.ino.wall.DragButton} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.DragButton#detachDrag
     * @function
     */

    /**
     * Fire event drag to attached listeners.
     * 
     * @param {Map}
     *            [mArguments] the arguments to pass along with the event.
     * @return {sap.ino.wall.DragButton} <code>this</code> to allow method chaining
     * @protected
     * @name sap.ino.wall.DragButton#fireDrag
     * @function
     */

    /**
     * Initializes the control.
     * 
     * @private
     */
    sap.ino.wall.DragButton.prototype.init = function() {
        this.addStyleClass("sapInoWallDragButton");
    };

    /**
     * Handle the touch start event.
     * 
     * @param {jQuery.EventObject}
     *            oEvent The event object
     * @private
     */
    sap.ino.wall.DragButton.prototype.ontouchstart = function(oEvent) {
        if (sap.ui.Device.system.desktop) {
            // fire the drag event
            this.__wall_bTouchStartHappenedOnThisControl = true;
        }
        if (sap.m.Button.prototype.ontouchstart) {
            sap.m.Button.prototype.ontouchstart.apply(this, arguments);
        }
    };

    /**
     * Handle the touch end event.
     * 
     * @param {jQuery.EventObject}
     *            oEvent The event object
     * @private
     */
    sap.ino.wall.DragButton.prototype.ontouchend = function(oEvent) {
        if (sap.ui.Device.system.desktop) {
            // fire the drag event
            if (this.__wall_bTouchStartHappenedOnThisControl) {
                this.fireDrag();            
            }
            this.__wall_bTouchStartHappenedOnThisControl = false;
            oEvent.stopPropagation();
        }
        if (sap.m.Button.prototype.ontouchend) {
            return sap.m.Button.prototype.ontouchend.apply(this, arguments);
        }
        return false;
    };
    
    /**
     * Handle the key down event.
     * 
     * @param {jQuery.EventObject}
     *            oEvent The event object
     * @private
     */
    sap.ino.wall.DragButton.prototype.onkeydown = function(oEvent) {
        if (oEvent.keyCode === jQuery.sap.KeyCodes.ENTER || oEvent.keyCode === jQuery.sap.KeyCodes.SPACE) {
            this.__wall_bKeyPressStartHappenedOnThisControl = true;
        }

        if (sap.m.Button.prototype.onkeydown) {
            sap.m.Button.prototype.onkeydown.apply(this, arguments);
        }
    };

    /**
     * Handle the key up event.
     * 
     * @param {jQuery.EventObject}
     *            oEvent The event object
     * @private
     */
    sap.ino.wall.DragButton.prototype.onkeyup = function(oEvent) {
        if (oEvent.keyCode === jQuery.sap.KeyCodes.ENTER || oEvent.keyCode === jQuery.sap.KeyCodes.SPACE) {
            if (this.__wall_bKeyPressStartHappenedOnThisControl) {
                this.fireActivateByKey(oEvent);            
            }
            this.__wall_bKeyPressStartHappenedOnThisControl = false;
        }
        
        if (sap.m.Button.prototype.onkeyup) {
            sap.m.Button.prototype.onkeyup.apply(this, arguments);
        }

        oEvent.stopPropagation();
        return false;
    };
})();