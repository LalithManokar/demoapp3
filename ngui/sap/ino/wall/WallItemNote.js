/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.WallItemNote");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBase");
    jQuery.sap.require("sap.ino.wall.util.Formatter");

    /**
     * Constructor for a new WallItemNote.
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
     * <li>{@link #getNumber number} : int</li>
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
     * @class Add your documentation for the newWallItemNote
     * @extends sap.ino.wall.WallItemBase
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.WallItemNote
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ino.wall.WallItemBase.extend("sap.ino.wall.WallItemNote", {
        metadata : {
            properties : {
                "number" : {
                    type : "int",
                    group : "Behavior",
                    defaultValue : null
                }
            },
            aggregations : {
                "_inputNumber" : {
                    type : "sap.m.Input",
                    multiple : false,
                    visibility : "hidden"
                }
            }
        }
    });

    /**
     * Creates a new subclass of class sap.ino.wall.WallItemNote with name <code>sClassName</code> and enriches it with
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
     * @name sap.ino.wall.WallItemNote.extend
     * @function
     */

    /**
     * Getter for property <code>number</code>. The SAP Note number this object represents.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {int} the value of property <code>number</code>
     * @public
     * @name sap.ino.wall.WallItemNote#getNumber
     * @function
     */

    /**
     * Setter for property <code>number</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {int}
     *            iNumber new value for property <code>number</code>
     * @return {sap.ino.wall.WallItemNote} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemNote#setNumber
     * @function
     */

    /*******************************************************************************************************************
     * overloaded setters to supress rendering and update ui
     ******************************************************************************************************************/

    /*
     * Sets the note number without rerendering @override @param {integer} sNumber the new note number @returns {this}
     * this pointer
     */
    sap.ino.wall.WallItemNote.prototype.setNumber = function(sNumber) {
        sNumber = parseInt(sNumber, 10);
        this.setProperty("number", sNumber, true);
        this.$().find(".front > .sapInoWallWINNumberText").text(sNumber);
        // inform wall that this item has changed a persistence property
        if (this.getParent()) {
            this.getParent()._notifyItemChanged(this);
        }
        return this;
    };
    /*
     * Sets the note title and changes the link to the SAP Note without rerendering Note: this method shadows the
     * wallItemBase method @override @param {string} sTitle the new title @returns {this} this pointer
     */
    sap.ino.wall.WallItemNote.prototype.setTitle = function(sTitle, bSuppressNotify) {
        this.setProperty("title", sTitle, true);
        this.$().find(".front .sapInoWallWITitleText a").text(sTitle);
        // this.$().find(".front .sapInoWallWITitleText a").attr("href", "http://service.sap.com/sap/support/notes/" + this.getNumber());
        // inform wall that this item has changed a persistence property
        if (this.getParent()) {
            this.getParent()._notifyItemChanged(this);
        }
        return this;
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Input} the input
     */
    sap.ino.wall.WallItemNote.prototype._getInputNumber = function() {
        var that = this, oControl = this.getAggregation("_inputNumber");

        if (!oControl) {
            // create control
            oControl = new sap.m.Input({
                value : (this.getNumber() === 12345 ? "" : sap.ino.wall.util.Formatter.escapeBindingCharacters(this.getNumber())),
                placeholder : this._oRB.getText("WALL_ITEMNOTE_PLACEHOLDER_NUMBER"),
                change : function(oEvent) {
                    that.setNumber(oEvent.getParameter("newValue"));
                }
            }).addStyleClass("sapInoWallWINNumberIP");

            // set hidden aggregation without rerendering
            this.setAggregation("_inputNumber", oControl, true);
        }

        return oControl;
    };

    sap.ino.wall.WallItemNote.prototype.formatToJSON = function() {
        var oJSON = sap.ino.wall.WallItemBase.prototype.formatToJSON.call(this);

        oJSON.number = this.getNumber();

        return oJSON;
    };

})();