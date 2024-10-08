/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.Pos");

(function() {
    "use strict";

    /**
     * Constructor for a new Pos.
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
     * <li>{@link #getX x} : float (default: -1)</li>
     * <li>{@link #getY y} : float (default: -1)</li>
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
     * In addition, all settings applicable to the base type {@link sap.ui.core.Element#constructor sap.ui.core.Element}
     * can be used as well.
     * 
     * @param {string}
     *            [sId] id for the new control, generated automatically if no id is given
     * @param {object}
     *            [mSettings] initial settings for the new control
     * 
     * @class Add your documentation for the newPos
     * @extends sap.ui.core.Element
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.Pos
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ui.core.Element.extend("sap.ino.wall.Pos", {
        metadata : {
            properties : {
                "x" : {
                    type : "float",
                    group : "Misc",
                    defaultValue : -1
                },
                "y" : {
                    type : "float",
                    group : "Misc",
                    defaultValue : -1
                }
            }
        }
    });

    /**
     * Creates a new subclass of class sap.ino.wall.Pos with name <code>sClassName</code> and enriches it with the
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
     * @name sap.ino.wall.Pos.extend
     * @function
     */

    /**
     * Getter for property <code>x</code>. The x coordinate of the position
     * 
     * Default value is <code>-1</code>
     * 
     * @return {float} the value of property <code>x</code>
     * @public
     * @name sap.ino.wall.Pos#getX
     * @function
     */

    /**
     * Setter for property <code>x</code>.
     * 
     * Default value is <code>-1</code>
     * 
     * @param {float}
     *            fX new value for property <code>x</code>
     * @return {sap.ino.wall.Pos} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Pos#setX
     * @function
     */

    /**
     * Getter for property <code>y</code>. The y coordinate of the position
     * 
     * Default value is <code>-1</code>
     * 
     * @return {float} the value of property <code>y</code>
     * @public
     * @name sap.ino.wall.Pos#getY
     * @function
     */

    /**
     * Setter for property <code>y</code>.
     * 
     * Default value is <code>-1</code>
     * 
     * @param {float}
     *            fY new value for property <code>y</code>
     * @return {sap.ino.wall.Pos} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.Pos#setY
     * @function
     */

    sap.ino.wall.Pos.prototype.floorify = function() {
        this.setX(Math.floor(this.getX()));
        this.setY(Math.floor(this.getY()));
    };

})();