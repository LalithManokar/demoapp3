/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.WallItemHeadline");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBase");
    jQuery.sap.require("sap.ino.wall.HeadlineSize");
    jQuery.sap.require("sap.ino.wall.HeadlineType");

    /**
     * Constructor for a new WallItemHeadline.
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
     * <li>{@link #getType type} : string (default: 'CLEAR')</li>
     * <li>{@link #getSize size} : string (default: 'H3')</li>
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
     * @class Add your documentation for the WallItemHeadline
     * @extends sap.ino.wall.WallItemBase
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.WallItemHeadline
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ino.wall.WallItemBase.extend("sap.ino.wall.WallItemHeadline", {
        metadata : {
            properties : {
                "type" : {
                    type : "string",
                    group : "Misc",
                    defaultValue : 'CLEAR'
                },
                "size" : {
                    type : "string",
                    group : "Misc",
                    defaultValue : 'H3'
                }
            },
            aggregations : {
                "_selectType" : {
                    type : "sap.m.Select",
                    multiple : false,
                    visibility : "hidden"
                },
                "_selectSize" : {
                    type : "sap.m.Select",
                    multiple : false,
                    visibility : "hidden"
                }
            }
        }
    });

    /**
     * Creates a new subclass of class sap.ino.wall.WallItemHeadline with name <code>sClassName</code> and enriches
     * it with the information contained in <code>oClassInfo</code>.
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
     * @name sap.ino.wall.WallItemHeadline.extend
     * @function
     */

    /**
     * Getter for property <code>type</code>. The type of the headline. See type definitions for more details.
     * 
     * Default value is <code>Clear</code>
     * 
     * @return {string} the value of property <code>type</code>
     * @public
     * @name sap.ino.wall.WallItemHeadline#getType
     * @function
     */

    /**
     * Setter for property <code>type</code>.
     * 
     * Default value is <code>Clear</code>
     * 
     * @param {string}
     *            sType new value for property <code>type</code>
     * @return {sap.ino.wall.WallItemHeadline} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemHeadline#setType
     * @function
     */

    /**
     * Getter for property <code>size</code>. The headline size (H1-H6)
     * 
     * Default value is <code>H3</code>
     * 
     * @return {string} the value of property <code>size</code>
     * @public
     * @name sap.ino.wall.WallItemHeadline#getSize
     * @function
     */

    /**
     * Setter for property <code>size</code>.
     * 
     * Default value is <code>H3</code>
     * 
     * @param {string}
     *            sSize new value for property <code>size</code>
     * @return {sap.ino.wall.WallItemHeadline} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemHeadline#setSize
     * @function
     */

    /**
     * Changes the type without re-rendering
     * 
     * @override
     * @param (string)
     *            sType the new value
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemHeadline.prototype.setType = function(sType) {
        var sKey = "";

        if (sType !== this.getType()) {
            // save property
            this.setProperty("type", sType, true);

            // toggle all available type classes
            for (sKey in sap.ino.wall.HeadlineType) {
                if (sap.ino.wall.HeadlineType.hasOwnProperty(sKey)) {
                    this.$().find(".front").toggleClass("sapInoWallWIH" + sap.ino.wall.HeadlineType[sKey], sType === sap.ino.wall.HeadlineType[sKey]);
                }
            }

            // inform wall that this item has changed a persistence property
            if (this.getParent()) {
                this.getParent()._notifyItemChanged(this);
            }
        }
        return this;
    };

    /**
     * Changes the size without re-rendering
     * 
     * @override
     * @param (string)
     *            sSize the new value
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemHeadline.prototype.setSize = function(sSize) {
        var sKey = "";

        if (sSize !== this.getSize()) {
            // save property
            this.setProperty("size", sSize, true);

            // toggle all available size classes
            for (sKey in sap.ino.wall.HeadlineSize) {
                if (sap.ino.wall.HeadlineSize.hasOwnProperty(sKey)) {
                    this.$().find(".front").toggleClass("sapInoWallWIH" + sKey, sSize === sKey);
                }
            }

            // inform wall that this item has changed a persistence property
            if (this.getParent()) {
                this.getParent()._notifyItemChanged(this);
            }
        }
        return this;
    };

    sap.ino.wall.WallItemHeadline.prototype._getSelectType = function() {
        var that = this, oSelect = this.getAggregation("_selectType"), sSelectedItemId = null, oItem, aItems, sType = this.getType(), sKey = null, i = 0;

        if (!oSelect) {
            // create select control
            oSelect = new sap.m.Select(this.getId() + "-type", {
                width : "100%",
                tooltip : this._oRB.getText("WALL_ITEMHEADLINE_STATUSMSG_TYPE"),
                change : function(oEvent) {
                    that.setType(oEvent.getParameter("selectedItem").getKey());
                }
            }).addStyleClass("sapInoWallWIBSelect").addStyleClass("noflip").addEventDelegate({
                onsapenter : function(oEvent) {
                    oEvent.preventDefault();
                    oEvent.stopPropagation();
                }
            });

            // add all link types
            for (sKey in sap.ino.wall.HeadlineType) {
                if (sap.ino.wall.HeadlineType.hasOwnProperty(sKey)) {
                    oItem = new sap.ui.core.Item({
                        key : sap.ino.wall.HeadlineType[sKey],
                        text : this._oRB.getText("WALL_ITEMHEADLINE_TYPE_" + sap.ino.wall.HeadlineType[sKey])
                    });
                    oSelect.addItem(oItem);
                    // in the same step, define the selected item
                    if (sType === sKey && !sSelectedItemId) {
                        sSelectedItemId = oItem.getId();
                    }
                }
            }

            // set selected item
            oSelect.setSelectedItem(sSelectedItemId);

            // set hidden aggregation
            this.setAggregation("_selectType", oSelect, true);
        } else {
            // just set the selected item to the current state
            aItems = oSelect.getItems();
            for (; i < aItems.length; i++) {
                if (aItems[i].getKey() === sType) {
                    oSelect.setSelectedItem(aItems[i]);
                    break;
                }
            }
        }

        return oSelect;
    };

    sap.ino.wall.WallItemHeadline.prototype._getSelectSize = function() {
        var that = this, oSelect = this.getAggregation("_selectSize"), sSelectedItemId = null, oItem, aItems, sSize = this.getSize(), sKey = null, i = 0;

        if (!oSelect) {
            // create select control
            oSelect = new sap.m.Select(this.getId() + "-size", {
                width : "100%",
                tooltip : this._oRB.getText("WALL_ITEMHEADLINE_STATUSMSG_SIZE"),
                change : function(oEvent) {
                    that.setSize(oEvent.getParameter("selectedItem").getKey());
                }
            }).addStyleClass("sapInoWallWIBSelect").addStyleClass("noflip").addEventDelegate({
                onsapenter : function(oEvent) {
                    oEvent.preventDefault();
                    oEvent.stopPropagation();
                }
            });

            // add all link types
            for (sKey in sap.ino.wall.HeadlineSize) {
                if (sap.ino.wall.HeadlineSize.hasOwnProperty(sKey)) {
                    oItem = new sap.ui.core.Item({
                        key : sKey,
                        text : this._oRB.getText("WALL_ITEMHEADLINE_SIZE_" + sKey)
                    });
                    oSelect.addItem(oItem);
                    // in the same step, define the selected item
                    if (sSize === sKey && !sSelectedItemId) {
                        sSelectedItemId = oItem.getId();
                    }
                }
            }

            // set selected item
            oSelect.setSelectedItem(sSelectedItemId);

            // set hidden aggregation
            this.setAggregation("_selectSize", oSelect, true);
        } else {
            // just set the selected item to the current state
            aItems = oSelect.getItems();
            for (; i < aItems.length; i++) {
                if (aItems[i].getKey() === sSize) {
                    oSelect.setSelectedItem(aItems[i]);
                    break;
                }
            }
        }

        return oSelect;
    };

    /**
     * creates a minimalic JSON representation of the item to be stored in the db
     * 
     * @param {string}
     *            sColor color identifier
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemHeadline.prototype.formatToJSON = function() {
        // call the base object's JSON method
        var oJSON = sap.ino.wall.WallItemBase.prototype.formatToJSON.call(this);
        // add properties of this control
        oJSON.type = this.getType();
        oJSON.size = this.getSize();
        // return the final object
        return oJSON;
    };

})();