/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.WallItemLink");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBase");
    jQuery.sap.require("sap.ino.wall.util.Formatter");
    jQuery.sap.require("sap.ino.wall.LinkType");

    /**
     * Constructor for a new WallItemLink.
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
     * <li>{@link #getType type} : sap.ino.wall.LinkType (default: sap.ino.wall.LinkType.Misc)</li>
     * <li>{@link #getDescription description} : string</li>
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
     * @class Add your documentation for the newWallItemLink
     * @extends sap.ino.wall.WallItemBase
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.WallItemLink
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ino.wall.WallItemBase.extend("sap.ino.wall.WallItemLink", {
        metadata : {
            properties : {
                "type" : {
                    type : "sap.ino.wall.LinkType",
                    group : "Misc",
                    defaultValue : 'MISC'
                },
                "description" : {
                    type : "string",
                    group : "Misc",
                    defaultValue : null
                }
            },
            aggregations : {
                "_icon" : {
                    type : "sap.ui.core.Icon",
                    multiple : false,
                    visibility : "hidden"
                },
                "_inputLink" : {
                    type : "sap.m.Input",
                    multiple : false,
                    visibility : "hidden"
                },
                "_selectType" : {
                    type : "sap.m.Select",
                    multiple : false,
                    visibility : "hidden"
                }
            }
        }
    });

    /**
     * Creates a new subclass of class sap.ino.wall.WallItemLink with name <code>sClassName</code> and enriches it
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
     * @name sap.ino.wall.WallItemLink.extend
     * @function
     */

    /**
     * Getter for property <code>type</code>. The type of the link. See type definitions for more details.
     * 
     * Default value is <code>Misc</code>
     * 
     * @return {sap.ino.wall.LinkType} the value of property <code>type</code>
     * @public
     * @name sap.ino.wall.WallItemLink#getType
     * @function
     */

    /**
     * Setter for property <code>type</code>.
     * 
     * Default value is <code>Misc</code>
     * 
     * @param {sap.ino.wall.LinkType}
     *            oType new value for property <code>type</code>
     * @return {sap.ino.wall.WallItemLink} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemLink#setType
     * @function
     */

    /**
     * Getter for property <code>description</code>. A description text.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {string} the value of property <code>description</code>
     * @public
     * @name sap.ino.wall.WallItemLink#getDescription
     * @function
     */

    /**
     * Setter for property <code>description</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {string}
     *            sDescription new value for property <code>description</code>
     * @return {sap.ino.wall.WallItemLink} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemLink#setDescription
     * @function
     */

    /**
     * strips protocol and www from the links URL for display
     * 
     * @returns {string} the link text
     * @public
     */
    sap.ino.wall.WallItemLink.prototype.getLinkText = function() {
        return this.getDescription().replace("https://www.", "").replace("http://www.", "").replace("http://", "").replace("https://", "").replace("mailto://", "");
    };

    sap.ino.wall.WallItemLink.prototype._getIcon = function() {
        var that = this, oIcon = this.getAggregation("_icon"), sIconURI, sSize;

        switch (this.getType()) {
            case sap.ino.wall.LinkType.COLLABORATE :
                sSize = "85px";
                sIconURI = sap.ui.core.IconPool.getIconURI("collaborate");
                break;
            case sap.ino.wall.LinkType.WIKI :
                sSize = "80px";
                sIconURI = sap.ui.core.IconPool.getIconURI("documents");
                break;
            case sap.ino.wall.LinkType.PRIVATE :
                sSize = "95px";
                sIconURI = sap.ui.core.IconPool.getIconURI("private");
                break;
            case sap.ino.wall.LinkType.WALL :
                sSize = "70px";
                sIconURI = sap.ui.core.IconPool.getIconURI("full-stacked-chart");
                break;
            case sap.ino.wall.LinkType.IDEA :
                sSize = "75px";
                sIconURI = sap.ui.core.IconPool.getIconURI("lightbulb");
                break;
            case sap.ino.wall.LinkType.MISC :
                /* falls through */
            default :
                sSize = "103px";
                sIconURI = sap.ui.core.IconPool.getIconURI("world");
        }

        // create new icon
        if (!oIcon) {
            oIcon = new sap.ui.core.Icon({
                color : "#e6e6e6",
                activeColor : "#e6e6e6",
                press : function() {
                    var oParent = this.getParent(), sDescription = this.getDescription();

                    // if it is a child, the wall is the parent's parent
                    if (oParent instanceof sap.ino.wall.WallItemBase) {
                        oParent = oParent.getParent();
                    }

                    // only open the link when no drag is in progress
                    if (!this._bMoving && !oParent._hasFollowCursorItems()) {
                        if (sDescription && sDescription !== "http://" && sDescription !== "https://" && sDescription !== "file://") {
                            var windower = window.open(sDescription, '_blank');
                            windower.opener = null;
                        } else {
                            // flip the item when the link is empty or initial
                            if (!(this.getParent() instanceof sap.ino.wall.WallItemBase && !(this.getParent() instanceof sap.ino.wall.WallItemGroup))) {
                                this.setFlipped(true);
                            }
                        }
                    }
                }.bind(this)
            });

            // add custom styles
            oIcon.addStyleClass("sapInoWallWILIcon").addStyleClass("noflip");

            // set hidden aggregation
            this.setAggregation("_icon", oIcon, true);
        }
        // update icon
        if (oIcon.getSrc() !== sIconURI) {
            oIcon.setSrc(sIconURI);
            oIcon.setSize(sSize);
        }

        return oIcon;
    };

    sap.ino.wall.WallItemLink.prototype.onkeydown = function(oEvent) {
        var sDescription = this.getDescription();

        if (jQuery(oEvent.target).hasClass("sapInoWallWIB") && sDescription && sDescription !== "http://" && sDescription !== "https://" && ((oEvent.ctrlKey && oEvent.keyCode === jQuery.sap.KeyCodes.ENTER) || oEvent.keyCode === jQuery.sap.KeyCodes.SPACE)) {

            var windower = window.open(sDescription, '_blank');
            windower.opener = null;
            oEvent.preventDefault();
            oEvent.stopPropagation();
            oEvent.stopImmediatePropagation();
        } else {
            sap.ino.wall.WallItemBase.prototype.onkeydown.apply(this, arguments);
        }
    };

    sap.ino.wall.WallItemLink.prototype._getSelectType = function() {
        var that = this, oSelect = this.getAggregation("_selectType"), sSelectedItemId = null, oItem, aItems, sType = this.getType(), sKey = null, i = 0;

        if (!oSelect) {
            // create select control
            oSelect = new sap.m.Select(this.getId() + "-type", {
                width : "100%",
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
            for (sKey in sap.ino.wall.LinkType) {
                if (sap.ino.wall.LinkType.hasOwnProperty(sKey)) {
                    oItem = new sap.ui.core.Item({
                        key : sap.ino.wall.LinkType[sKey],
                        text : this._oRB.getText("WALL_ITEMLINK_TYPE_" + sap.ino.wall.LinkType[sKey])
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

            // add a delegate to fix the positioning of the popover
            oSelect.addDelegate({
                onAfterRendering : this._afterSelectOpen
            });

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

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Input} the input
     */
    sap.ino.wall.WallItemLink.prototype._getInputLink = function() {
        var that = this, oControl = this.getAggregation("_inputLink");

        if (!oControl) {
            // create control
            oControl = new sap.m.Input({
                value : sap.ino.wall.util.Formatter.escapeBindingCharacters(sap.ino.wall.util.Formatter.escapeNetworkPaths(this.getDescription())),
                placeholder : this._oRB.getText("WALL_ITEMLINK_PLACEHOLDER_LINK"),
                change : function(oEvent) {
                    var sURL = oEvent.getParameter("newValue");
                    if (sURL && sURL.indexOf("http://") != 0 && sURL.indexOf("https://") != 0 && sURL.indexOf("mailto:") != 0) {
                        sURL = "http://" + sURL;
                        this.setValue(sURL);
                    }
                    that.setDescription(sURL);
                }
            }).addStyleClass("sapInoWallWILLinkIP");

            // set hidden aggregation without rerendering
            this.setAggregation("_inputLink", oControl, true);
        }

        return oControl;
    };

    /*******************************************************************************************************************
     * overloaded setters to supress rendering and update ui
     ******************************************************************************************************************/

    sap.ino.wall.WallItemLink.prototype.setDescription = function(sText) {

        this.setProperty("description", sText, true);
        sText = this.getDescription();

        this.$().find(".front .sapInoWallWILDescriptionLink").attr("href", sText);
        // strip protocol and www for display
        this.$().find(".front .sapInoWallWILLinkText").text(this.getLinkText());
        // inform wall that this item has changed a persistence property
        if (this.getParent()) {
            this.getParent()._notifyItemChanged(this);
        }
        return this;
    };

    sap.ino.wall.WallItemLink.prototype.setType = function(sType) {
        var oDomIcon = this.getDomRef("icon"), sOldType = this.getType();

        this.setProperty("type", sType, true);

        // render new icon into DOM without re-rendering
        if (sType !== sOldType && oDomIcon) {
            this._renderItemIntoContainer(oDomIcon, this._getIcon(), true, false);
        }

        // inform wall that this item has changed a persistence property
        if (this.getParent()) {
            this.getParent()._notifyItemChanged(this);
        }
        return this;
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
    sap.ino.wall.WallItemLink.prototype.formatToJSON = function() {
        // call the base object's JSON method
        var oJSON = sap.ino.wall.WallItemBase.prototype.formatToJSON.call(this);
        // add properties of this control
        oJSON.type = this.getType();
        oJSON.description = this.getDescription();
        // return the final object
        return oJSON;
    };

})();