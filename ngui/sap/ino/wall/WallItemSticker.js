/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.WallItemSticker");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBase");
    jQuery.sap.require("sap.ino.wall.util.Formatter");
    jQuery.sap.require("sap.ino.wall.util.Helper");
    jQuery.sap.require("sap.ino.wall.config.Config");
    jQuery.sap.require("sap.ino.wall.TextEditor");
    jQuery.sap.require("sap.ino.wall.StickerColor");
    jQuery.sap.require("sap.ino.wall.TShirtSize");
    
    /**
     * Constructor for a new WallItemSticker.
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
     * <li>{@link #getColor color} : sap.ino.wall.StickerColor (default: sap.ino.wall.StickerColor.Yellow)</li>
     * <li>{@link #getMultiLine multiLine} : boolean (default: false)</li>
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
     * @class Add your documentation for the newWallItemSticker
     * @extends sap.ino.wall.WallItemBase
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.WallItemSticker
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ino.wall.WallItemBase.extend("sap.ino.wall.WallItemSticker", {
        metadata : {
            properties : {
                "color" : {
                    type : "sap.ino.wall.StickerColor",
                    group : "Appearance",
                    defaultValue : sap.ino.wall.StickerColor.Yellow
                },
                "multiLine" : {
                    type : "boolean",
                    group : "Misc",
                    defaultValue : true
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
                }
            }
        }
    });

    /**
     * Creates a new subclass of class sap.ino.wall.WallItemSticker with name <code>sClassName</code> and enriches
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
     * @name sap.ino.wall.WallItemSticker.extend
     * @function
     */

    /**
     * Getter for property <code>color</code>. The sticker design.
     * 
     * Default value is <code>Yellow</code>
     * 
     * @return {sap.ino.wall.StickerColor} the value of property <code>color</code>
     * @public
     * @name sap.ino.wall.WallItemSticker#getColor
     * @function
     */

    /**
     * Setter for property <code>color</code>.
     * 
     * Default value is <code>Yellow</code>
     * 
     * @param {sap.ino.wall.StickerColor}
     *            oColor new value for property <code>color</code>
     * @return {sap.ino.wall.WallItemSticker} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemSticker#setColor
     * @function
     */

    /**
     * Getter for property <code>multiLine</code>. Decides whether the user can send the sticky note by pressing
     * enter or not.
     * 
     * Default value is <code>false</code>
     * 
     * @return {boolean} the value of property <code>multiLine</code>
     * @public
     * @name sap.ino.wall.WallItemSticker#getMultiLine
     * @function
     */

    /**
     * Setter for property <code>multiLine</code>.
     * 
     * Default value is <code>false</code>
     * 
     * @param {boolean}
     *            bMultiLine new value for property <code>multiLine</code>
     * @return {sap.ino.wall.WallItemSticker} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemSticker#setMultiLine
     * @function
     */

    /**
     * Initializes the control
     * 
     * @private
     */
    sap.ino.wall.WallItemSticker.prototype.init = function() {
        sap.ino.wall.WallItemBase.prototype.init.call(this);

        this.setResizable(true);
    };

    /**
     * Setter for the color property to suppress re-rendering and dynamically update the item
     * 
     * @param {string}
     *            sColor color identifier
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemSticker.prototype.setColor = function(sColor, bSuppressNotify) {
        if (sColor !== this.getColor()) {
            // remove old color
            this.$().children(".flippable").find(".front, .back").toggleClass("sapInoWallWISticker" + this.getColor(), false);
            // save property
            this.setProperty("color", sColor, true);
            // set new color
            this.$().children(".flippable").find(".front, .back").toggleClass("sapInoWallWISticker" + this.getColor(), true);

            // update active class on back side
            var $All = this.$().children(".flippable").find(".sapInoWallStickerColorPicker");
            $All.removeClass("active");
            $All.attr("aria-pressed", "false");

            var $Active = this.$().children(".flippable").find(".sapInoWallStickerColorPicker.sapInoWallWISticker" + sColor);
            $Active.addClass("active");
            $Active.attr("aria-pressed", "true");

            this._updateAssistiveTechnologyDescription();

            // inform wall that this item has changed a persistence property
            if (this.getParent() && !bSuppressNotify) {
                this.getParent()._notifyItemChanged(this);
            }
        }
        return this;
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
    sap.ino.wall.WallItemSticker.prototype.setTitle = function(sTitle, bSuppressNotify) {
        if (this.getTitle() !== sTitle) {
            this.setProperty("title", sTitle, true);
            if (sap.ino.wall.config.Config.getEnableRichtTextEditing()) {
                // show the sanitized HTML
                this.$().children(".flippable").find(".front .sapInoWallWITitleText").html(sap.ino.wall.util.Formatter.nl2br(sap.ino.wall.util.Helper.stripTags(this.getProperty("title"), "<div><br><b><strong><u><i><em><ol><ul><li><font>")));
            } else {
                // show newlines as entered in text field
                this.$().children(".flippable").find(".front .sapInoWallWITitleText").html(sap.ino.wall.util.Formatter.nl2br(jQuery.sap.encodeHTML(this.getProperty("title"))));
            }

            this._updateAssistiveTechnologyDescription();

            // inform wall that this item has changed a persistence property
            if (this.getParent() && !bSuppressNotify) {
                this.getParent()._notifyItemChanged(this);
            }
        }
        return this;
    };

    /**
     * Setter for the multiLine property
     * 
     * @param {boolean}
     *            bMulti the new value
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemSticker.prototype.setMultiLine = function(bMulti, bSuppressNotify) {
        this.setProperty("multiLine", bMulti, true);
        return this;
    };

    sap.ino.wall.WallItemSticker.prototype.setFlipped = function(bFlipped, bVisualize) {
        var oTextEditor = sap.ui.getCore().byId(this.getId() + "-textEditor");
        if (oTextEditor && jQuery.type(oTextEditor._getColorPicker) === "function") {
            var oColorPicker = oTextEditor._getColorPicker();

            if (oColorPicker.isOpen()) {
                oColorPicker.close();
            }
        }

        sap.ino.wall.WallItemBase.prototype.setFlipped.apply(this, arguments);
    };

    sap.ino.wall.WallItemSticker.prototype.ontouchend = function(oEvent) {
        var oTextEditor = sap.ui.getCore().byId(this.getId() + "-textEditor");
        if (oTextEditor && jQuery.type(oTextEditor._getColorPicker) === "function") {
            var oColorPicker = oTextEditor._getColorPicker();

            if (oColorPicker.isOpen()) {
                oColorPicker.close();
            }
        }

        if (sap.ino.wall.WallItemBase.prototype.ontouchend) {
            sap.ino.wall.WallItemBase.prototype.ontouchend.apply(this, arguments);
        }
    };

    sap.ino.wall.WallItemSticker.prototype.onkeydown = function(oEvent) {
        // cannot or must not be handled
        // e.g. when we trigger a keydown ourselfs
        if (!oEvent.keyCode) {
            return;
        }

        var oTextEditor = sap.ui.getCore().byId(this.getId() + "-textEditor");
        if (oTextEditor && jQuery.type(oTextEditor._getColorPicker) === "function") {
            var oColorPicker = oTextEditor._getColorPicker();

            if (oColorPicker.isOpen()) {
                oColorPicker.close();
            }
        }

        /*
         * if (oEvent.keyCode === jQuery.sap.KeyCodes.ENTER && this.getFlipped() && !this.getMultiLine()) {
         * this.setFlipped(false, true);
         * 
         * oEvent.preventDefault(); oEvent.stopPropagation(); oEvent.stopImmediatePropagation();
         * 
         * return; }
         */

        if (jQuery(oEvent.target).hasClass("sapInoWallStickerColorPicker")) {
            if (oEvent.keyCode === jQuery.sap.KeyCodes.ENTER || oEvent.keyCode === jQuery.sap.KeyCodes.SPACE) {

                var sColor = oEvent.target.dataset.sapColor;
                this.setColor(sColor);

                oEvent.preventDefault();
                oEvent.stopPropagation();
                oEvent.stopImmediatePropagation();

                return;
            }
        }

        // default handling of base class
        sap.ino.wall.WallItemBase.prototype.onkeydown.apply(this, arguments);

        if (!oEvent.isDefaultPrevented() && !oEvent.isPropagationStopped() && sap.ino.wall.config.Config.getEnableRichtTextEditing()) {
            // if not nicEdit stop propagating, as nicEdit would react even if the event is not for it
            if (!jQuery(oEvent.target).hasClass("nicEdit-main")) {
                oEvent.preventDefault();
                oEvent.stopPropagation();
                oEvent.stopImmediatePropagation();

                // instead trigger a custom event for the wall
                $(oEvent.target).trigger("keydown", [oEvent]);
            }
        }
    };

    /**
     * Hook called when the item has been resized by user interaction
     * 
     * @param {boolean}
     *            bSytemCall true when called by system call and not by user interaction
     * @oaram {float} fDeltaX the amount in px the item has been resized
     * @oaram {float} fDeltaY the amount in px the item has been resized
     * @protected
     */
    sap.ino.wall.WallItemSticker.prototype._onResize = function(bSystemCall, fDeltaX, fDeltaY) {
        var sSize = this._adjustTShirtSize(), oEditor = this._getTextareaDescription(), iFixHeight, iLastPickerPosition, sLineHeight;

        // default for XS/S size
        sLineHeight = 28;
        
        switch (sSize) {
            case sap.ino.wall.TShirtSize.M :
                sLineHeight = 33;
                break;
            case sap.ino.wall.TShirtSize.L :
            case sap.ino.wall.TShirtSize.XL :
                sLineHeight = 53;
                break;
            default:
                break;
        }

        if (oEditor instanceof sap.ino.wall.TextEditor) {
            oEditor.setControlDetails(sSize);
        }

        // workaround for no flex support & Safari & IE10
        // firefox has also troubles with the heigh calculations of the scrollContainer, we use the fallback here too
        if (!jQuery.support.hasFlexBoxSupport || sap.ui.Device.browser.safari || sap.ui.Device.browser.firefox || sap.ui.Device.browser.internet_explorer && sap.ui.Device.browser.version >= 10) {
            iFixHeight = this.$().children(".flippable").find(".sapInoWallWIStickerPickerContainer").outerHeight() + this.$().find(".sapInoWallWIStickerMulti").outerHeight();
            this.$().children(".flippable").find(".back .sapInoWallWIStickerText").height(this.$().find(".back").height() - iFixHeight - 10);
            this.$().children(".flippable").find(".back .sapInoWallTextEditorContent").height(this.$().find(".back").height() - iFixHeight - this.$().children(".flippable").find(".sapInoWallTextEditorControls").children().outerHeight() - 30);
            // workaround for IE: adjust padding
            this.$().children(".flippable").find(".sapInoWallWIStickerTextTA").css("padding-bottom", "10px");
        } else {
            // calculate the relative offset of the last color picker palette
            iLastPickerPosition = this.$().children(".flippable").find(".sapInoWallWIStickerPickerContainer").children().last().position().top - this.$().children(".flippable").find(".sapInoWallWIStickerPickerContainer").position().top;
            // dynamically set the height of the color picker palette so that the flex properties work smoothly (x * 30px)
            this.$().children(".flippable").find(".sapInoWallWIStickerPickerContainer").css("min-height", ((Math.floor((iLastPickerPosition) / sLineHeight) + 1) * sLineHeight) + "px");
        }
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Input} the input
     */
    sap.ino.wall.WallItemSticker.prototype._getTextareaDescription = function() {
        var that = this, oControl = this.getAggregation("_textAreaDescription");

        if (!oControl) {
            // create control
            if (sap.ino.wall.config.Config.getEnableRichtTextEditing()) {
                oControl = new sap.ino.wall.TextEditor(this.getId() + "-textEditor", {
                    value : (this.getTitle() === this._oRB.getText("WALL_ITEMSTICKER_NEW_TEXT") ? "<b></b>" : sap.ino.wall.util.Formatter.escapeBindingCharacters(this.getTitle())),
                    change : function(oEvent) {
                        that.setTitle(oEvent.getParameter("value"));
                    }
                }).addStyleClass("noflip").addStyleClass("sapInoWallWIStickerTextTA");
            } else {
                oControl = new sap.m.TextArea({
                    value : (this.getTitle() === this._oRB.getText("WALL_ITEMSTICKER_NEW_TEXT") ? "" : sap.ino.wall.util.Formatter.escapeBindingCharacters(this.getTitle())),
                    // of title
                    change : function(oEvent) {
                        that.setTitle(oEvent.getParameter("value"));
                    }
                }).addStyleClass("noflip").addStyleClass("sapInoWallWIStickerTextTA");
            }

            // add a custom enter event
            oControl.addEventDelegate({
                onsapenter : function(oEvent) {
                    var oTextEditor = sap.ui.getCore().byId(this.getId() + "-textEditor");

                    if (!this.getMultiLine()) {
                        // TODO: remove this later
                        if (sap.ino.wall.config.Config.getEnableRichtTextEditing()) {
                            // for sap.ino.wall.TextEditor
                            oTextEditor.blur();
                            // prevent adding a new line
                            oEvent.preventDefault();
                        } else {
                            // for sap.m.TextArea
                            this.$().find("textarea").blur();
                        }
                        return false;
                    }
                }.bind(this)
            });

            // set hidden aggregation without rerendering
            this.setAggregation("_textAreaDescription", oControl, true);
        }

        return oControl;
    };

    sap.ino.wall.WallItemSticker.prototype._updateAssistiveTechnologyDescription = function() {
        var $Description = this.$().find("#" + this.getId() + "-wallitem-description");
        var sColor = this._oRB.getText("CRTL_WALL_ITEMSTICKER_COLOR_" + (this.getColor() ? this.getColor().toUpperCase() : "YELLOW"));
        var sText = sap.ino.wall.util.Helper.stripTags(this.getProperty("title"));

        if (sText && sText.trim() !== "") {
            $Description.html(this._oRB.getText("CRTL_WALL_ITEMSTICKER_EXP_READERTEXT", [sColor, sText]));
        } else {
            $Description.html(this._oRB.getText("CRTL_WALL_ITEMSTICKER_EXP_READERTEXT_EMPTY", [sColor]));
        }

    };

    /**
     * Creates a minimalic JSON representation of the item to be stored in the db
     * 
     * @override
     * @returns {object} the JSON object representation of the item
     * @public
     */
    sap.ino.wall.WallItemSticker.prototype.formatToJSON = function() {
        // call the base object's JSON method
        var oJSON = sap.ino.wall.WallItemBase.prototype.formatToJSON.call(this);
        // add properties of this control
        oJSON.color = this.getColor();
        // set the description field instead of the title field (is longer in the DB)
        oJSON.description = this.getTitle();
        delete oJSON.title;
        // return the final object
        return oJSON;
    };

})();