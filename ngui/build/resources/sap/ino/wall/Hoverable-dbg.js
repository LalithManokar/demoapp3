/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.Hoverable");

(function() {
    "use strict";

    /**
     * Constructor for a new Hoverable.
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
     * <li>{@link #getContent content} : sap.ui.core.Control</li>
     * </ul>
     * </li>
     * <li>Associations
     * <ul>
     * </ul>
     * </li>
     * <li>Events
     * <ul>
     * <li>{@link sap.ino.wall.Hoverable#event:enter enter} : fnListenerFunction or [fnListenerFunction,
     * oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
     * <li>{@link sap.ino.wall.Hoverable#event:leave leave} : fnListenerFunction or [fnListenerFunction,
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
     * @class A Hoverable wraps a control and adds enter and leave events to it.
     * @extends sap.ui.core.Control
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.Hoverable
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ui.core.Control.extend("sap.ino.wall.Hoverable", {
        metadata : {
            aggregations : {
                "content" : {
                    type : "sap.ui.core.Control",
                    multiple : false
                }
            },
            events : {
                "enter" : {},
                "leave" : {}
            }
        }
    });

    /**
     * Creates a new subclass of class sap.ino.wall.Hoverable with name <code>sClassName</code> and enriches it with
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
     * @name sap.ino.wall.Hoverable.extend
     * @function
     */

    sap.ino.wall.Hoverable.M_EVENTS = {
        'enter' : 'enter',
        'leave' : 'leave'
    };

    /**
     * Getter for aggregation <code>content</code>.<br/> The control that should be hoverable.
     * 
     * @return {sap.ui.core.Control}
     * @public
     * @name sap.ino.wall.Hoverable#getContent
     * @function
     */

    /**
     * Setter for the aggregated <code>content</code>.
     * 
     * @param {sap.ui.core.Control}
     *            oContent
     * @return {sap.ino.wall.Hoverable} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Hoverable#setContent
     * @function
     */

    /**
     * Destroys the content in the aggregation named <code>content</code>.
     * 
     * @return {sap.ino.wall.Hoverable} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Hoverable#destroyContent
     * @function
     */

    /**
     * 
     * @name sap.ino.wall.Hoverable#enter
     * @event
     * @param {sap.ui.base.Event}
     *            oControlEvent
     * @param {sap.ui.base.EventProvider}
     *            oControlEvent.getSource
     * @param {object}
     *            oControlEvent.getParameters
     * @param {object}
     *            oControlEvent.getParameters.event
     * @public
     */

    /**
     * Attach event handler <code>fnFunction</code> to the 'enter' event of this <code>sap.ino.wall.Hoverable</code>.<br/>.
     * When called, the context of the event handler (its <code>this</code>) will be bound to
     * <code>oListener<code> if specified
     * otherwise to this <code>sap.ino.wall.Hoverable</code>.<br/> itself. 
     *  
     *
     * @param {object}
     *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
     * @param {function}
     *            fnFunction The function to call, when the event occurs.  
     * @param {object}
     *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ino.wall.Hoverable</code>.<br/> itself.
     *
     * @return {sap.ino.wall.Hoverable} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Hoverable#attachEnter
     * @function
     */

    /**
     * Detach event handler <code>fnFunction</code> from the 'enter' event of this <code>sap.ino.wall.Hoverable</code>.<br/>
     * 
     * The passed function and listener object must match the ones used for event registration.
     * 
     * @param {function}
     *            fnFunction The function to call, when the event occurs.
     * @param {object}
     *            oListener Context object on which the given function had to be called.
     * @return {sap.ino.wall.Hoverable} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Hoverable#detachEnter
     * @function
     */

    /**
     * Fire event enter to attached listeners.
     * 
     * Expects following event parameters:
     * <ul>
     * <li>'event' of type <code>object</code> </li>
     * </ul>
     * 
     * @param {Map}
     *            [mArguments] the arguments to pass along with the event.
     * @return {sap.ino.wall.Hoverable} <code>this</code> to allow method chaining
     * @protected
     * @name sap.ino.wall.Hoverable#fireEnter
     * @function
     */

    /**
     * 
     * @name sap.ino.wall.Hoverable#leave
     * @event
     * @param {sap.ui.base.Event}
     *            oControlEvent
     * @param {sap.ui.base.EventProvider}
     *            oControlEvent.getSource
     * @param {object}
     *            oControlEvent.getParameters
     * @param {object}
     *            oControlEvent.getParameters.event
     * @public
     */

    /**
     * Attach event handler <code>fnFunction</code> to the 'leave' event of this <code>sap.ino.wall.Hoverable</code>.<br/>.
     * When called, the context of the event handler (its <code>this</code>) will be bound to
     * <code>oListener<code> if specified
     * otherwise to this <code>sap.ino.wall.Hoverable</code>.<br/> itself. 
     *  
     *
     * @param {object}
     *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
     * @param {function}
     *            fnFunction The function to call, when the event occurs.  
     * @param {object}
     *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ino.wall.Hoverable</code>.<br/> itself.
     *
     * @return {sap.ino.wall.Hoverable} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Hoverable#attachLeave
     * @function
     */

    /**
     * Detach event handler <code>fnFunction</code> from the 'leave' event of this <code>sap.ino.wall.Hoverable</code>.<br/>
     * 
     * The passed function and listener object must match the ones used for event registration.
     * 
     * @param {function}
     *            fnFunction The function to call, when the event occurs.
     * @param {object}
     *            oListener Context object on which the given function had to be called.
     * @return {sap.ino.wall.Hoverable} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Hoverable#detachLeave
     * @function
     */

    /**
     * Fire event leave to attached listeners.
     * 
     * Expects following event parameters:
     * <ul>
     * <li>'event' of type <code>object</code> </li>
     * </ul>
     * 
     * @param {Map}
     *            [mArguments] the arguments to pass along with the event.
     * @return {sap.ino.wall.Hoverable} <code>this</code> to allow method chaining
     * @protected
     * @name sap.ino.wall.Hoverable#fireLeave
     * @function
     */

    sap.ino.wall.Hoverable._TYPE_ENTER = 0;
    sap.ino.wall.Hoverable._TYPE_LEAVE = 1;

    /* =========================================================== */
    /* begin: control lifecycle methods */
    /* =========================================================== */

    /**
     * Initializes the control.
     * 
     * @private
     */
    sap.ino.wall.Hoverable.prototype.init = function() {
        this._iEventDelayTimerEnter = 0;
        this._iEventDelayTimerLeave = 0;
        this._blockEnter = false;
    };

    /**
     * Destroys the control.
     * 
     * @private
     */
    sap.ino.wall.Hoverable.prototype.exit = function() {
        this._iEventDelayTimerEnter = 0;
        this._iEventDelayTimerLeave = 0;
        this._blockEnter = false;
    };

    /**
     * Adjusts control before rendering. Were place the original events with our delegate functions that fire the hover
     * events
     * 
     * @private
     */
    sap.ino.wall.Hoverable.prototype.onBeforeRendering = function() {
        var that = this, oControl = this.getContent(), fnOldMouseEnter = oControl.onmouseover, fnOldMouseEnd = oControl.onmouseout, fnOldTouchStart = oControl.ontouchstart, fnOldTouchEnd = oControl.ontouchend;

        if (!this._initialized) {
            if (sap.ui.Device.system.desktop) {
                oControl.onmouseover = function(oEvent) {
                    that._fireDelayedEnter(oEvent);
                    if (fnOldMouseEnter) {
                        fnOldMouseEnter.apply(this, arguments);
                    }
                };
                oControl.onmouseout = function(oEvent) {
                    that._fireDelayedLeave(oEvent);
                    if (fnOldMouseEnd) {
                        fnOldMouseEnd.apply(this, arguments);
                    }
                };
            } else {
                // this causes flickering on desktop controls
                oControl.ontouchstart = function(oEvent) {
                    that._fireDelayedEnter(oEvent);
                    if (fnOldTouchStart) {
                        fnOldTouchStart.apply(this, arguments);
                    }
                };
                oControl.ontouchend = function(oEvent) {
                    that._fireDelayedLeave(oEvent);
                    if (fnOldTouchEnd) {
                        fnOldTouchEnd.apply(this, arguments);
                    }
                };
            }
            this._initialized = true;
        }

        // delegate call to inner control
        if (this.getContent().onBeforeRendering) {
            this.getContent().onBeforeRendering.apply(this.getContent(), arguments);
        }
    };

    /**
     * Adjusts control after rendering.
     * 
     * @private
     */
    sap.ino.wall.Hoverable.prototype.onAfterRendering = function() {
        // delegate call to inner control
        if (this.getContent().onAfterRendering) {
            this.getContent().onAfterRendering.apply(this.getContent(), arguments);
        }
    };

    /**
     * Re-renders inner control instead of this one.
     * 
     * @protected
     */
    sap.ino.wall.Hoverable.prototype.rerender = function() {
        sap.ui.core.Control.prototype.rerender.apply(this.getContent(), arguments);
    };

    /* =========================================================== */
    /* begin: internal methods and properties */
    /* =========================================================== */

    /**
     * Fires a delayed hover enter event so that multiple events from the control are only fired once
     * 
     * @private
     * @param {jQuery.Event}
     *            oEvent The browser event
     */
    sap.ino.wall.Hoverable.prototype._fireDelayedEnter = function(oEvent) {
        var that = this;
        clearTimeout(this._iEventDelayTimerEnter);
        this._iEventDelayTimerEnter = setTimeout(function() {
            if (!that._blockEnter) {
                that.fireEnter({
                    event : oEvent
                });
                that._blockEnter = true;
            }
        }, 100);
    };

    /**
     * Fires a delayed hoverleave event so that multiple events from the control are only fired once
     * 
     * @private
     * @param {jQuery.Event}
     *            oEvent The browser event
     */
    sap.ino.wall.Hoverable.prototype._fireDelayedLeave = function(oEvent) {
        var that = this;
        clearTimeout(this._iEventDelayTimerLeave);
        this._iEventDelayTimerLeave = setTimeout(function() {
            that.fireLeave({
                event : oEvent
            });
            that._blockEnter = false;
        }, 100);
    };
    
})();