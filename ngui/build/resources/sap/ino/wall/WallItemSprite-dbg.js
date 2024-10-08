/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.WallItemSprite");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBase");
    jQuery.sap.require("sap.ino.wall.util.Helper");
    jQuery.sap.require("sap.ino.wall.SpriteDesign");
    jQuery.sap.require("sap.ino.wall.ColorPicker");
    jQuery.sap.require("sap.ino.wall.WallConfig");

    /**
     * Constructor for a new WallItemSprite.
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
     * <li>{@link #getColor color} : string (default: '#cc0000')</li>
     * <li>{@link #getType type} : string (default: 'ROUND')</li>
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
     * @class Add your documentation for the new WallItemSprite
     * @extends sap.ino.wall.WallItemBase
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.WallItemSprite
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ino.wall.WallItemBase.extend("sap.ino.wall.WallItemSprite", {
        metadata : {
            properties : {
                "color" : {
                    type : "string",
                    group : "Appearance",
                    defaultValue : '#cc0000'
                },
                "type" : {
                    type : "string",
                    group : "Appearance",
                    defaultValue : 'ROUND'
                }
            },
            aggregations : {
                "_textAreaDescription" : {
                    type : "sap.ui.core.Control",
                    multiple : false,
                    visibility : "hidden"
                },
                "_checkboxMulti" : {
                    type : "sap.m.CheckBox",
                    multiple : false,
                    visibility : "hidden"
                },
                "_buttonColorSelector" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_colorPicker" : {
                    type : "sap.ino.wall.ColorPicker",
                    multiple : false,
                    visibility : "hidden"
                },
                "_iconSelect" : {
                    type : "sap.ino.wall.ColorPicker",
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
     * Creates a new subclass of class sap.ino.wall.WallItemSprite with name <code>sClassName</code> and enriches
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
     * @name sap.ino.wall.WallItemSprite.extend
     * @function
     */

    /**
     * Getter for property <code>color</code>. The sprite color.
     * 
     * Default value is <code>#cc0000</code>
     * 
     * @return {string} the value of property <code>color</code>
     * @public
     * @name sap.ino.wall.WallItemSprite#getColor
     * @function
     */

    /**
     * Setter for property <code>color</code>.
     * 
     * Default value is <code>#cc0000</code>
     * 
     * @param {string}
     *            sColor new value for property <code>color</code>
     * @return {sap.ino.wall.WallItemSprite} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemSprite#setColor
     * @function
     */

    /**
     * Getter for property <code>type</code>. The sprite design.
     * 
     * Default value is <code>Round</code>
     * 
     * @return {string} the value of property <code>type</code>
     * @public
     * @name sap.ino.wall.WallItemSprite#getType
     * @function
     */

    /**
     * Setter for property <code>type</code>.
     * 
     * Default value is <code>Round</code>
     * 
     * @param {string}
     *            sType new value for property <code>type</code>
     * @return {sap.ino.wall.WallItemSprite} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemSprite#setType
     * @function
     */

    sap.ino.wall.WallItemSprite.TITLE_MODE_CHAR_UPPERCASE = 0;
    sap.ino.wall.WallItemSprite.TITLE_MODE_CHAR_LOWERCASE = 1;
    sap.ino.wall.WallItemSprite.TITLE_MODE_NUMBER = 2;

    /**
     * Singleton to return the next number for a new item
     * 
     * @public
     * @static
     * @return {integer} the next number
     */
    sap.ino.wall.WallItemSprite.getNextTitle = function() {
        var sResult = "!";

        // init with random mode
        if (!sap.ino.wall.WallItemSprite._iTitleCount) {
            sap.ino.wall.WallItemSprite._iTitleMode = sap.ino.wall.util.Helper.randomMinMax(0, 2);
            sap.ino.wall.WallItemSprite._iTitleCount = 0;
        }

        // return the next char/number
        switch (sap.ino.wall.WallItemSprite._iTitleMode) {
            case sap.ino.wall.WallItemSprite.TITLE_MODE_NUMBER :
                sap.ino.wall.WallItemSprite._iTitleCount++;
                sResult = String(sap.ino.wall.WallItemSprite._iTitleCount);
                break;
            case sap.ino.wall.WallItemSprite.TITLE_MODE_CHAR_LOWERCASE :
                sResult = String.fromCharCode(97 + sap.ino.wall.WallItemSprite._iTitleCount % 26);
                sap.ino.wall.WallItemSprite._iTitleCount++;
                break;
            case sap.ino.wall.WallItemSprite.TITLE_MODE_CHAR_UPPERCASE :
                /* falls through */
            default :
                sResult = String.fromCharCode(65 + sap.ino.wall.WallItemSprite._iTitleCount % 26);
                sap.ino.wall.WallItemSprite._iTitleCount++;
                break;
        }
        return sResult;
    };

    /**
     * Singleton to update the title counter to show the next number/letter
     * 
     * @public
     * @static
     * @return {integer} the next number
     */
    sap.ino.wall.WallItemSprite.updateNextTitle = function(sTitle) {
        var iNumber;

        sTitle = sTitle.trim();

        if (/^[0-9]+$/.test(sTitle)) { // just digits
            // set count to current number
            iNumber = parseInt(sTitle, 10);
            sap.ino.wall.WallItemSprite._iTitleMode = sap.ino.wall.WallItemSprite.TITLE_MODE_NUMBER;
            sap.ino.wall.WallItemSprite._iTitleCount = iNumber;
        } else if (/^[A-Z]$/.test(sTitle)) { // one uppercase letter
            // set count to current uppercase letter
            sap.ino.wall.WallItemSprite._iTitleMode = sap.ino.wall.WallItemSprite.TITLE_MODE_CHAR_UPPERCASE;
            sap.ino.wall.WallItemSprite._iTitleCount = sTitle.charCodeAt(0) - 65 + 1;
        } else if (/^[a-z]$/.test(sTitle)) { // one lowercase letter
            // set count to current lowercase letter
            sap.ino.wall.WallItemSprite._iTitleMode = sap.ino.wall.WallItemSprite.TITLE_MODE_CHAR_LOWERCASE;
            sap.ino.wall.WallItemSprite._iTitleCount = sTitle.charCodeAt(0) - 97 + 1;
        }
    };

    /**
     * Initializes the control
     * 
     * @private
     */
    sap.ino.wall.WallItemSprite.prototype.init = function() {
        sap.ino.wall.WallItemBase.prototype.init.call(this);

        this.setResizable(true);
    };
    
    /** Setter for the flipped property to suppress re-rendering
    * It calls the base method and sets an additional flag to re-calculate the positioning when resizing 
     * @param {boolean} bFlipped the value
    * @override
    * @returns {this} this pointer for chaining
    * @public
    */
    sap.ino.wall.WallItemSprite.prototype.setFlipped = function (bFlipped) {
        var oColorPicker = this._getColorPicker();

        if (oColorPicker.isOpen()) {
            oColorPicker.close();
        }
        sap.ino.wall.WallItemBase.prototype.setFlipped.apply(this, arguments);
        if (this.getFlipped()) {
            this._bCorrectPositioningAfterFlip = true;
        }
        return this;
    };

    sap.ino.wall.WallItemSprite.prototype.onAfterRendering = function() {
        var fLuminance = sap.ino.wall.util.Helper.getColorLuminance(this.getColor()), oButtonColorSelector = sap.ui.getCore().byId(this.getId() + "-buttonColorSelector");

        // call base class method
        sap.ino.wall.WallItemBase.prototype.onAfterRendering.apply(this, arguments);
        // update background color of button
        if (oButtonColorSelector) {
            sap.ui.getCore().byId(this.getId() + "-buttonColorSelector").$().find(".sapMBtnInner").css("background-color", this.getColor());
        }
        // update color picker icon based on luminosity of the color
        if (fLuminance <= 0.6) {
            this._getButtonColorSelector().addStyleClass("sapInoWallWISpriteColorSelectorButtonBright").removeStyleClass("sapInoWallWISpriteColorSelectorButtonNormal");
        } else {
            this._getButtonColorSelector().addStyleClass("sapInoWallWISpriteColorSelectorButtonNormal").removeStyleClass("sapInoWallWISpriteColorSelectorButtonBright");
        }
    };

    /**
     * Setter for the title property (as in WallItemBase but with line breaks)
     * 
     * @param {string}
     *            sColor color identifier
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemSprite.prototype.setTitle = function(sTitle, bSuppressNotify) {
        if (sTitle !== this.getTitle()) {
            this.setProperty("title", sTitle, true);
            // try updating the next title settings so that when creating the next sprite it will continue with the next
            // number/letter
            sap.ino.wall.WallItemSprite.updateNextTitle(sTitle);
            if (this._isRendered()) {
                // show newlines as entered in text field
                this.$().children(".flippable").find(".front .sapInoWallWITitleText").html(jQuery.sap.encodeHTML(this.getProperty("title")));
                this._adjustFontSize();
            }
            // inform wall that this item has changed a persistence property
            if (this.getParent() && !bSuppressNotify) {
                this.getParent()._notifyItemChanged(this);
            }
        }
        return this;
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
    sap.ino.wall.WallItemSprite.prototype.setColor = function(sColor, bSuppressNotify) {
        var fLuminance, $front = this.$().children(".flippable").find(".front");

        if (sColor !== this.getColor()) {
            this.setProperty("color", sColor, true);
            if (this._isRendered()) {
                fLuminance = sap.ino.wall.util.Helper.getColorLuminance(sColor);
                // update sprite color
                $front.css("border-color", sap.ino.wall.util.Helper.shadeColor(sColor, -10));
                $front.css("background-color", sColor);
                $front.css("color", (fLuminance <= 0.6 ? "#F5F5F5" : "#232323"));
                $front.css("background-image", sap.ino.wall.util.Helper.addBrowserPrefix("linear-gradient(top, " + sap.ino.wall.util.Helper.shadeColor(sColor, 5) + " 0%, " + sap.ino.wall.util.Helper.shadeColor(sColor, -5) + " 100%)"));
                // update button color
                sap.ui.getCore().byId(this.getId() + "-buttonColorSelector").$().find(".sapMBtnInner").css("background-color", sColor);
                // update color picker icon based on luminosity of the color
                if (fLuminance <= 0.6) {
                    this._getButtonColorSelector().addStyleClass("sapInoWallWISpriteColorSelectorButtonBright").removeStyleClass("sapInoWallWISpriteColorSelectorButtonNormal");
                } else {
                    this._getButtonColorSelector().addStyleClass("sapInoWallWISpriteColorSelectorButtonNormal").removeStyleClass("sapInoWallWISpriteColorSelectorButtonBright");
                }
            }
            // inform wall that this item has changed a persistence property
            if (this.getParent() && !bSuppressNotify) {
                this.getParent()._notifyItemChanged(this);
            }
        }
    };

    /**
     * Changes the type without re-rendering
     * 
     * @override
     * @param (string)
     *            sType the new value
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemSprite.prototype.setType = function(sType) {
        if (sType !== this.getType()) {
            // remove old color
            this.$().children(".flippable").find(".front").toggleClass("sapInoWallWISprite" + this.getType(), false);
            // save property
            this.setProperty("type", sType, true);
            // set new color
            this.$().children(".flippable").find(".front").toggleClass("sapInoWallWISprite" + this.getType(), true);

            // inform wall that this item has changed a persistence property
            if (this.getParent()) {
                this.getParent()._notifyItemChanged(this);
            }
        }
        return this;
    };

    /**
     * Adjusts the font size to the given control size and text width
     * 
     * @protected
     */
    sap.ino.wall.WallItemSprite.prototype._adjustFontSize = function() {
        var sTextLength = this.getTitle().length || 1;

        // subtrat 25% of length (2 = 1.5, 3 = 2.25)
        if (sTextLength > 1) {
            sTextLength -= sTextLength / 4;
        }
        this.$().children(".flippable").find(".sapInoWallWITitleText.sapInoWallWISpriteText").css("line-height", this.getH()).css("font-size", (Math.min(parseInt(this.getW(), 10), parseInt(this.getH(), 10) * 1.5) - 10) / sTextLength);
    };

    /**
     * Hook called when the item has been resized by user interaction
     * 
     * @param {boolean}
     *            bSytemCall true when called by system call and not by user interaction
     * @oaram {float} fDeltaX the amount in px the item has been resized, if < 0 it got smaller, if > 0 is got bigger
     * @oaram {float} fDeltaY the amount in px the item has been resized, if < 0 it got smaller, if > 0 is got bigger
     * 
     * @protected
     */
    sap.ino.wall.WallItemSprite.prototype._onResize = function(bSystemCall, fDeltaX, fDeltaY) {
        var iCurrentW = parseInt(this.getW(), 10), iCurrentH = parseInt(this.getH(), 10);

        // special case: back side is larger than front side
        // this can only happen with sticky notes currently so we fix it here
        if (this.getFlipped() && (iCurrentW < sap.ino.wall.WallConfig._ITEM_MIN_SIZE || this._bAddDeltaWhenResizing)) {
            // when starting with a large size and decreasing it to less than the minimum size we have to remember the
            // negative delta in this mode and add it to the width
            if (fDeltaX < 0 && !this._fDeltaWidthWhenResizing) {
                this._fDeltaWidthWhenResizing = Math.abs(fDeltaX + sap.ino.wall.WallConfig._ITEM_MIN_SIZE - iCurrentW);
            }
            // set internal flag to keep this mode for the whole resizing process
            this._bAddDeltaWhenResizing = true;
            // scale width to the back side's width (subtract padding of 10 from DOM value)
            this.setW(Math.max(sap.ino.wall.WallConfig._ITEM_MIN_SIZE, sap.ino.wall.WallConfig._ITEM_MIN_SIZE + fDeltaX + (this._fDeltaWidthWhenResizing || 0)) + "px");

            // correct X value once (when flipping and the backside is larger than the front it is moved to the left by
            // the browser)
            if (this._bCorrectPositioningAfterFlip) {
                this.setX(parseInt(this.getX(), 10) - Math.abs(iCurrentW - parseInt(this.getW(), 10)) + "px");
                this._bCorrectPositioningAfterFlip = false;
            }
        }
        if (this.getFlipped() && (iCurrentH < sap.ino.wall.WallConfig._ITEM_MIN_SIZE || this._bAddDeltaWhenResizing)) {
            // when starting with a large size and decreasing it to less than the minimum size we have to remember the
            // negative delta in this mode and add it to the width
            if (fDeltaY < 0 && !this._fDeltaHeightWhenResizing) {
                this._fDeltaHeightWhenResizing = Math.abs(fDeltaY + sap.ino.wall.WallConfig._ITEM_MIN_SIZE - iCurrentH);
            }
            // set internal flag to keep this mode for the whole resizing process
            this._bAddDeltaWhenResizing = true;
            // scale height to the back side's height (subtract padding of 5 from DOM value)
            this.setH(Math.max(sap.ino.wall.WallConfig._ITEM_MIN_SIZE, sap.ino.wall.WallConfig._ITEM_MIN_SIZE + fDeltaY + (this._fDeltaHeightWhenResizing || 0)) + "px");
        }

        this._adjustTShirtSize();
        this._adjustFontSize();

        // workaround for no flex support & IE10
        if (!jQuery.support.hasFlexBoxSupport || sap.ui.Device.browser.internet_explorer && sap.ui.Device.browser.version === 10) {
            var iFixHeight = this.$().find(".sapInoWallWISpritePickerContainer").outerHeight() + this.$().find(".sapInoWallWISpriteMulti").outerHeight();
            this.$().children(".flippable").find(".back .sapInoWallWISpriteText").height(this.$().find(".back").height() - iFixHeight - 10);
            // workaround for IE: adjust padding
            this.$().children(".flippable").find(".sapInoWallWISpriteTextTA").css("padding-bottom", "10px");
        }
    };

    /**
     * Hook called when the resize user interaction has finished
     * 
     * @protected
     */
    sap.ino.wall.WallItemSprite.prototype._onResizeEnd = function() {
        this._bAddDeltaWhenResizing = false;
        this._fDeltaWidthWhenResizing = 0;
        this._fDeltaHeightWhenResizing = 0;
    };

    /**
     * Creates a minimalic JSON representation of the item to be stored in the db
     * 
     * @override
     * @returns {object} the JSON object representation of the item
     * @public
     */
    sap.ino.wall.WallItemSprite.prototype.formatToJSON = function() {
        // call the base object's JSON method
        var oJSON = sap.ino.wall.WallItemBase.prototype.formatToJSON.call(this);
        // add properties of this control
        oJSON.color = this.getColor();
        oJSON.type = this.getType();
        oJSON.bgcolor = ""; // TODO: unused
        oJSON.icon = ""; // TODO: unused
        oJSON.image = ""; // TODO: unused
        // return the final object
        return oJSON;
    };

    /*
     * Lazy initialization of the internal control @private @override @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemSprite.prototype._getInputTitle = function() {
        var oInput = sap.ino.wall.WallItemBase.prototype._getInputTitle.apply(this, arguments);
        // we don't want to trigger an invalidation here so we set the property directly
        oInput.setProperty("maxLength", 10, true);

        return oInput;
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemSprite.prototype._getButtonColorSelector = function() {
        var that = this, oControl = this.getAggregation("_buttonColorSelector");

        if (!oControl) {
            // create control
            oControl = new sap.m.Button(this.getId() + "-buttonColorSelector", {
                tooltip : this._oRB.getText("WALL_ITEMLINE_STATUSMSG_COLOR_SELECT"),
                press : function(oEvent) {
                    var oColorPicker = that._getColorPicker();

                    if (oColorPicker.isOpen()) {
                        oColorPicker.close();
                    } else {
                        oColorPicker.openBy(oControl, 0, 0);
                    }
                },
                icon : "sap-icon://palette"
            }).addStyleClass("noflip").addStyleClass("sapInoWallWISpriteColorSelectorButton").addStyleClass("sapInoWallWISpriteColorSelectorButtonNormal");

            // set hidden aggregation without rerendering
            this.setAggregation("_buttonColorSelector", oControl, true);
        }

        return oControl;
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemSprite.prototype._getColorPicker = function() {
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

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Select} the select
     */
    sap.ino.wall.WallItemSprite.prototype._getSelectType = function() {
        var that = this, oControl = this.getAggregation("_selectType"), sSelectedItemId = null, oItem, aItems, sType = this.getType(), sKey = null, i = 0;

        if (!oControl) {
            // create select control
            oControl = new sap.m.Select(this.getId() + "-type", {
                width : "100%",
                change : function(oEvent) {
                    that.setType(oEvent.getParameter("selectedItem").getKey());
                }
            }).addStyleClass("sapInoWallWIBSelect").addStyleClass("noflip");

            // add all sprite designs
            for (sKey in sap.ino.wall.SpriteDesign) {
                if (sap.ino.wall.SpriteDesign.hasOwnProperty(sKey)) {
                    oItem = new sap.ui.core.Item({
                        key : sap.ino.wall.SpriteDesign[sKey],
                        text : this._oRB.getText("WALL_ITEMSPRITE_TYPE_" + sap.ino.wall.SpriteDesign[sKey])
                    });
                    oControl.addItem(oItem);
                    // in the same step, define the selected item
                    if (sType === sKey && !sSelectedItemId) {
                        sSelectedItemId = oItem.getId();
                    }
                }
            }

            // set selected item
            oControl.setSelectedItem(sSelectedItemId);

            // set hidden aggregation
            this.setAggregation("_selectType", oControl, true);
        } else {
            // just set the selected item to the current state
            aItems = oControl.getItems();
            for (; i < aItems.length; i++) {
                if (aItems[i].getKey() === sType) {
                    oControl.setSelectedItem(aItems[i]);
                    break;
                }
            }
        }

        return oControl;
    };

})();