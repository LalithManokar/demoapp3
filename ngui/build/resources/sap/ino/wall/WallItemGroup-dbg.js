/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.WallItemGroup");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBase");
    jQuery.sap.require("sap.ino.wall.util.Helper");
    jQuery.sap.require("sap.ino.wall.ColorPicker");

    /**
     * Constructor for a new WallItemGroup.
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
     * @class A wall item group. Can be used to display multiple items.
     * @extends sap.ino.wall.WallItemBase
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.WallItemGroup
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ino.wall.WallItemBase.extend("sap.ino.wall.WallItemGroup", {
        metadata : {
            properties : {
                "color" : {
                    type : "string",
                    group : "Appearance",
                    defaultValue : '#ffffff'
                }
            },
            aggregations : {
                "_buttonColorSelector" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_colorPicker" : {
                    type : "sap.ino.wall.ColorPicker",
                    multiple : false,
                    visibility : "hidden"
                }
            }
        }
    });

    /**
     * Creates a new subclass of class sap.ino.wall.WallItemGroup with name <code>sClassName</code> and enriches it
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
     * @name sap.ino.wall.WallItemGroup.extend
     * @function
     */

    /**
     * Initializes the control
     * 
     * @private
     */
    sap.ino.wall.WallItemGroup.prototype.init = function() {
        sap.ino.wall.WallItemBase.prototype.init.call(this);

        // make the group larger
        this.setW("300px");
        this.setH("300px");

        this._recalculateItemDimensions = true;

        this.setResizable(true);
    };

    sap.ino.wall.WallItemGroup.prototype.onAfterRendering = function() {
        var fLuminance = sap.ino.wall.util.Helper.getColorLuminance(this.getColor()), oButtonColorSelector = sap.ui.getCore().byId(this.getId() + "-buttonColorSelector");

        // call base class method
        sap.ino.wall.WallItemBase.prototype.onAfterRendering.apply(this, arguments);

        // update background color of button
        if (oButtonColorSelector) {
            sap.ui.getCore().byId(this.getId() + "-buttonColorSelector").$().find(".sapMBtnInner").css("background-color", this.getColor());
        }

        // update color picker icon based on luminosity of the color
        if (fLuminance <= 0.6) {
            this._getButtonColorSelector().addStyleClass("sapInoWallWIGroupColorSelectorButtonBright").removeStyleClass("sapInoWallWIGroupColorSelectorButtonNormal");
        } else {
            this._getButtonColorSelector().addStyleClass("sapInoWallWIGroupColorSelectorButtonNormal").removeStyleClass("sapInoWallWIGroupColorSelectorButtonBright");
        }
    };

    /**
     * Handle the touch start/click event.
     * 
     * @param {jQuery.EventObject}
     *            oEvent The event object
     * @private
     */
    sap.ino.wall.WallItemGroup.prototype.ontouchstart = function(oEvent) {
        sap.ino.wall.WallItemBase.prototype.ontouchstart.apply(this, arguments);
    };

    /**
     * Changes the color without re-rendering
     * 
     * @override
     * @param (string)
     *            sColor the new value
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemGroup.prototype.setColor = function(sColor, bSuppressNotify) {
        var fLuminance, $front = this.$().children(".flippable").children(".front"), $back = this.$().children(".flippable").children(".back"), $frontHeader = $front.find(".sapInoWallWIGTitle").children(0), sBackgroundColor = sap.ino.wall.util.Helper.transparentColor(sap.ino.wall.util.Helper.shadeColor(sColor, -30), 30);

        if (sColor !== this.getColor()) {
            this.setProperty("color", sColor, true);
            if (this._isRendered()) {
                fLuminance = sap.ino.wall.util.Helper.getColorLuminance(sap.ino.wall.util.Helper.shadeColor(sColor, -20));
                // update group color
                $front.css("border-color", sColor);
                $front.css("background-color", sBackgroundColor);
                $back.css("border-color", sColor);
                $back.css("background-color", sBackgroundColor);
                // update group header color
                $frontHeader.css("background-color", sap.ino.wall.util.Helper.shadeColor(sColor, -20));
                $frontHeader.css("color", (fLuminance <= 0.6 ? "#F5F5F5" : "#232323"));
                $frontHeader.css("border-color", sap.ino.wall.util.Helper.shadeColor(sColor, -10));
                $frontHeader.css("background-image", sap.ino.wall.util.Helper.addBrowserPrefix("linear-gradient(top, " + sap.ino.wall.util.Helper.shadeColor(sColor, 5) + " 0%, " + sap.ino.wall.util.Helper.shadeColor(sColor, -5) + " 100%)"));

                // update button color
                sap.ui.getCore().byId(this.getId() + "-buttonColorSelector").$().find(".sapMBtnInner").css("background-color", sColor);
                // update color picker icon based on luminosity of the color
                if (fLuminance <= 0.6) {
                    this._getButtonColorSelector().addStyleClass("sapInoWallWIGroupColorSelectorButtonBright").removeStyleClass("sapInoWallWIGroupColorSelectorButtonNormal");
                } else {
                    this._getButtonColorSelector().addStyleClass("sapInoWallWIGroupColorSelectorButtonNormal").removeStyleClass("sapInoWallWIGroupColorSelectorButtonBright");
                }
            }
            // inform wall that this item has changed a persistence property
            if (this.getParent() && !bSuppressNotify) {
                this.getParent()._notifyItemChanged(this);
            }
        }
    };

    /**
     * Adds a group item without rerendering the wall item
     * 
     * @override
     * @returns {this} this pointer for chaining
     * @private
     */
    sap.ino.wall.WallItemGroup.prototype.addChildWithoutRendering = function(oItem, bSuppressGroupOffset) {
        var $groupContainer = this.$().find(".sapInoWallWIGroupContent");

        // group items are positioned relatively to the group, remove the group position
        if (!bSuppressGroupOffset) {
            oItem.setX(Math.max(0, parseInt(oItem.getX(), 10) - parseInt(this.getX(), 10)) + "px");
            oItem.setY(Math.max(0, parseInt(oItem.getY(), 10) - parseInt(this.getY(), 10)) + "px");
        }

        // render item into the container
        this.addAggregation("childs", oItem, true);
        sap.ino.wall.util.Helper.renderItemIntoContainer($groupContainer[0], oItem, false, true);

        return this;
    };

    /**
     * Removes a group item without rerendering and adds it to the wall
     * 
     * @override
     * @returns {this} this pointer for chaining
     * @private
     */
    sap.ino.wall.WallItemGroup.prototype.removeChildWithoutRerendering = function(oItem) {
        // group items are positioned relatively to the group, restore the wall position
        oItem.setX(Math.max(0, parseInt(oItem.getX(), 10) + parseInt(this.getX(), 10)) + "px");
        oItem.setY(Math.max(0, parseInt(oItem.getY(), 10) + parseInt(this.getY(), 10)) + "px");

        // remove the DOM
        this.removeAggregation("childs", oItem, true);
        oItem.$().remove();

        return this;
    };

    /**
     * Hook called when the item has been resized by user interaction
     * @param {boolean} bSytemCall true when called by system call and not by user interaction
     * @oaram {float} fDeltaX the amount in px the item has been resized
     * @oaram {float} fDeltaY the amount in px the item has been resized
     * @protected
     */
    sap.ino.wall.WallItemGroup.prototype._onResize = function (bSystemCall, fDeltaX, fDeltaY) {
        var iBoundingBoxWidth,
            iBoundingBoxHeight,
            iWidthDifference,
            iHeightDifference,
            aGroupItems = this.getChilds(),
            iMinPadding = 10,
            fGroupWidth = parseFloat(this.getW(), 10),
            fGroupHeight = parseFloat(this.getH(), 10),
            iMinGroupWidth,
            iMinGroupHeight,
            i = 0;

        if (aGroupItems.length === 0) {
            return;
        }

        // TODO: calculate this only when an item is moved
        if (this._recalculateItemDimensions) {
            this._boundingBox = this.getParent()._calculateBoundingBox(aGroupItems);
            if (!this._boundingBox) {
                return;
            }
            this._recalculateItemDimensions = false;
        }

        iBoundingBoxWidth = this._boundingBox[1].getX() - this._boundingBox[0].getX();
        iBoundingBoxHeight = this._boundingBox[1].getY() - this._boundingBox[0].getY();
        iWidthDifference = fGroupWidth - iBoundingBoxWidth - this._boundingBox[0].getX() - iMinPadding;
        iHeightDifference = fGroupHeight - iBoundingBoxHeight - this._boundingBox[0].getY() - iMinPadding;

        if (iWidthDifference < 0) {
            // try to move the items to the left alltogether
            if (this._boundingBox[0].getX() > iMinPadding) {
                for (; i < aGroupItems.length; i++) {
                    aGroupItems[i].setX(Math.max(iMinPadding, parseInt(aGroupItems[i].getX(), 10) - Math.min(Math.abs(iWidthDifference), this._boundingBox[0].getX())) + "px");
                }
                this._recalculateItemDimensions = true;
            }

            // set the width to the minimum value (bouding box + padding)
            iMinGroupWidth = (this._boundingBox[1].getX() - this._boundingBox[0].getX() + 2 * iMinPadding);
            if (fGroupWidth - iMinGroupWidth < 0) {
                this.setW(iMinGroupWidth + "px");
            } 
        }

        if (iHeightDifference < 0) {
            // try to move the items to the left alltogether
            if (this._boundingBox[0].getY() > iMinPadding) {
                for (; i < aGroupItems.length; i++) {
                    aGroupItems[i].setY(Math.max(iMinPadding, parseInt(aGroupItems[i].getY(), 10) - Math.min(Math.abs(iHeightDifference), this._boundingBox[0].getY())) + "px");
                }
                this._recalculateItemDimensions = true;
            }

            // set the height to the minimum value (bouding box + padding)
            iMinGroupHeight = (this._boundingBox[1].getY() - this._boundingBox[0].getY() + 2 * iMinPadding);
            if (fGroupHeight - iMinGroupHeight < 0) {
                this.setH(iMinGroupHeight + "px");
            } 
        }
    };

    /**
     * Creates a minimalic JSON representation of the item to be stored in the db
     * 
     * @override
     * @returns {object} the JSON object representation of the item
     * @public
     */
    sap.ino.wall.WallItemGroup.prototype.formatToJSON = function() {
        var oJSON = sap.ino.wall.WallItemBase.prototype.formatToJSON.apply(this), oGroupItems = this.getChilds(), oChild, i = 0;

        // add properties of this control
        oJSON.color = this.getColor();

        oJSON.childs = [];
        for (; i < oGroupItems.length; i++) {
            oChild = sap.ino.wall.WallItemBase.prototype.formatToJSON.call(oGroupItems[i]);
            oJSON.childs.push(oChild);
        }

        return oJSON;
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemGroup.prototype._getButtonColorSelector = function() {
        var that = this, oControl = this.getAggregation("_buttonColorSelector");

        if (!oControl) {
            // create control
            oControl = new sap.m.Button(this.getId() + "-buttonColorSelector", {
                tooltip : this._oRB.getText("WALL_ITEMLINE_STATUSMSG_COLOR_SELECT"),
                press : function(oEvent) {
                    var oColorPicker = that._getColorPicker();

                    if (oColorPicker.isOpen()) {
                        oColorPicker.close();
                    }
                    else {
                        oColorPicker.openBy(oControl, 0, 0);
                    }
                },
                icon : "sap-icon://palette"
            }).addStyleClass("noflip").addStyleClass("sapInoWallWIGroupColorSelectorButton").addStyleClass("sapInoWallWIGroupColorSelectorButtonNormal");

            // set hidden aggregation without rerendering
            this.setAggregation("_buttonColorSelector", oControl, true);
        }

        return oControl;
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemGroup.prototype._getColorPicker = function() {
        var that = this, oControl = this.getAggregation("_colorPicker");

        if (!oControl) {
            // create control
            oControl = new sap.ino.wall.ColorPicker(this.getId() + "-colorPicker", {
                color : this.getColor(),
                change : function(oEvent) {
                    that.setColor(oEvent.getParameter("color"));
                }
            });

            // do not set during initialiting colorpicker => bug w/ setting the color to the colorpicker
            oControl.setPlacement(sap.m.PlacementType.Vertical);

            // set hidden aggregation without rerendering
            this.setAggregation("_colorPicker", oControl, true);
        }

        return oControl;
    };

})();