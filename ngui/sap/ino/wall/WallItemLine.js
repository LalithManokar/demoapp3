/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.WallItemLine");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBase");
    jQuery.sap.require("sap.ino.wall.util.Helper");
    jQuery.sap.require("sap.ino.wall.config.Config");
    jQuery.sap.require("sap.ino.wall.ColorPicker");

    /**
     * Constructor for a new WallItemLine.
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
     * <li>{@link #getOrientation orientation} : string (default: 'Horizontal')</li>
     * <li>{@link #getThickness thickness} : int (default: 4)</li>
     * <li>{@link #getStyle style} : string (default: 'Solid')</li>
     * <li>{@link #getColor color} : string (default: '#888888')</li>
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
     * @class Add your documentation for the WallItemLine
     * @extends sap.ino.wall.WallItemBase
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.WallItemLine
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ino.wall.WallItemBase.extend("sap.ino.wall.WallItemLine", {
        metadata : {
            properties : {
                "orientation" : {
                    type : "string",
                    group : "Misc",
                    defaultValue : 'HORIZONTAL'
                },
                "thickness" : {
                    type : "int",
                    group : "Misc",
                    defaultValue : 4
                },
                "style" : {
                    type : "string",
                    group : "Misc",
                    defaultValue : 'SOLID'
                },
                "color" : {
                    type : "string",
                    group : "Misc",
                    defaultValue : '#888888'
                }
            },
            aggregations : {
                "_selectOrientation" : {
                    type : "sap.m.Select",
                    multiple : false,
                    visibility : "hidden"
                },
                "_selectThickness" : {
                    type : "sap.m.Select",
                    multiple : false,
                    visibility : "hidden"
                },
                "_inputColor" : {
                    type : "sap.m.Input",
                    multiple : false,
                    visibility : "hidden"
                },
                "_buttonOrientationH" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_buttonOrientationV" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_buttonStyleSolid" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_buttonStyleDashed" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_buttonStyleDotted" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_buttonThickness1px" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_buttonThickness3px" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_buttonThickness5px" : {
                    type : "sap.m.Button",
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
                }
            }
        }
    });

    /**
     * Creates a new subclass of class sap.ino.wall.WallItemLine with name <code>sClassName</code> and enriches it
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
     * @name sap.ino.wall.WallItemLine.extend
     * @function
     */

    /**
     * Getter for property <code>orientation</code>. The orientation of the line. See type definitions for more
     * details.
     * 
     * Default value is <code>Horizontal</code>
     * 
     * @return {string} the value of property <code>orientation</code>
     * @public
     * @name sap.ino.wall.WallItemLine#getOrientation
     * @function
     */

    /**
     * Setter for property <code>orientation</code>.
     * 
     * Default value is <code>Horizontal</code>
     * 
     * @param {string}
     *            sOrientation new value for property <code>orientation</code>
     * @return {sap.ino.wall.WallItemLine} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemLine#setOrientation
     * @function
     */

    /**
     * Getter for property <code>thickness</code>. The thickness of the line
     * 
     * Default value is <code>4</code>
     * 
     * @return {int} the value of property <code>thickness</code>
     * @public
     * @name sap.ino.wall.WallItemLine#getThickness
     * @function
     */

    /**
     * Setter for property <code>thickness</code>.
     * 
     * Default value is <code>4</code>
     * 
     * @param {int}
     *            iThickness new value for property <code>thickness</code>
     * @return {sap.ino.wall.WallItemLine} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemLine#setThickness
     * @function
     */

    /**
     * Getter for property <code>style</code>. The style of the line
     * 
     * Default value is <code>Solid</code>
     * 
     * @return {string} the value of property <code>style</code>
     * @public
     * @name sap.ino.wall.WallItemLine#getStyle
     * @function
     */

    /**
     * Setter for property <code>style</code>.
     * 
     * Default value is <code>Solid</code>
     * 
     * @param {string}
     *            sStyle new value for property <code>style</code>
     * @return {sap.ino.wall.WallItemLine} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemLine#setStyle
     * @function
     */

    /**
     * Getter for property <code>color</code>. The color of the line
     * 
     * Default value is <code>#888888</code>
     * 
     * @return {string} the value of property <code>color</code>
     * @public
     * @name sap.ino.wall.WallItemLine#getColor
     * @function
     */

    /**
     * Setter for property <code>color</code>.
     * 
     * Default value is <code>#888888</code>
     * 
     * @param {string}
     *            sColor new value for property <code>color</code>
     * @return {sap.ino.wall.WallItemLine} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemLine#setColor
     * @function
     */

    sap.ino.wall.WallItemLine.prototype.init = function() {
        sap.ino.wall.WallItemBase.prototype.init.call(this);

        this.setTitle(this._oRB.getText("WALL_ITEMLINE_STATUSMSG_ORIENTATION_HORIZONTAL"), true);
    };

    sap.ino.wall.WallItemLine.prototype.onAfterRendering = function() {
        var fLuminance = sap.ino.wall.util.Helper.getColorLuminance(this.getColor()), oButtonColorSelector = sap.ui.getCore().byId(this.getId() + "-buttonColorSelector");

        // call base class method
        sap.ino.wall.WallItemBase.prototype.onAfterRendering.apply(this, arguments);
        // update background color of button
        if (oButtonColorSelector) {
            oButtonColorSelector.$().find(".sapMBtnInner").css("background-color", this.getColor());
        }
        // update color picker icon based on luminosity of the color
        if (fLuminance <= 0.6) {
            this._getButtonColorSelector().addStyleClass("sapInoWallWILineColorSelectorButtonBright").removeStyleClass("sapInoWallWILineColorSelectorButtonNormal");
        } else {
            this._getButtonColorSelector().addStyleClass("sapInoWallWILineColorSelectorButtonNormal").removeStyleClass("sapInoWallWILineColorSelectorButtonBright");
        }
    };

    // TODO: document this (override of setFlipped method)
    var fnWallItemBasebaseSetFlipped = sap.ino.wall.WallItemBase.prototype.setFlipped;
    sap.ino.wall.WallItemLine.prototype.setFlipped = function(bFlipped) {
        var oViewPoint;

        if (bFlipped && this._isRendered()) {
            oViewPoint = this.getParent().getViewPoint();
            if (this.getOrientation() === "HORIZONTAL") {
                // edit bar should be 512px long (10 buttons x 48px + 4 spacer x8px)
                this.$().find(".sapInoWallWILineEditButtons").css("left", oViewPoint.getX() - this.$().find(".sapInoWallWILineEditButtons").width() / 2).css("top", -33 - this.getThickness() / 2);
            } else {
                this.$().find(".sapInoWallWILineEditButtons").css("left", -10 /*- this.getThickness()/2*/).css("top", oViewPoint.getY() - this.$().find(".sapInoWallWILineEditButtons").height() / 2);
            }
        }

        // close color selector if it is initialized
        if (this.getAggregation("_colorPicker")) {
            this.getAggregation("_colorPicker").close();
        }

        fnWallItemBasebaseSetFlipped.apply(this, arguments);
    };

    /**
     * changes the orientation of a line without re-rendering (switches x/y coordinates)
     * 
     * @override
     * @param (string)
     *            sOrientation the new value
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemLine.prototype.setOrientation = function(sOrientation, bSuppressNotify) {
        var sOldOrientation = this.getOrientation(), fZoomModifier;

        this.setProperty("orientation", sOrientation, true);
        if (this._isRendered() && sOldOrientation !== sOrientation) {
            fZoomModifier = 100 / this.getParent().getZoom();
            if (sOldOrientation === "HORIZONTAL") {
                if (this._touchStartMousePositionX) {
                    if (!sap.ino.wall.config.Config.getZoomCapable()) {
                        this.setX(Math.abs((this.getParent().$("inner").offset().left - this._touchStartMousePositionX) * fZoomModifier) + "px");
                    } else {
                        this.setX(Math.abs(this.getParent().$("inner").offset().left - this._touchStartMousePositionX * fZoomModifier) + "px");
                    }
                } else {
                    this.setX(this.getY());
                }
                this.setY("0px");
                if (this._isRendered()) {
                    this.$().removeClass("sapInoWallWILineHORIZONTAL").addClass("sapInoWallWILineVERTICAL");
                    this.$().find("#" + this.getId() + "-front").removeClass("sapInoWallWILineHORIZONTAL").addClass("sapInoWallWILineVERTICAL");
                    this.$().find("#" + this.getId() + "-back").removeClass("sapInoWallWILineHORIZONTAL").addClass("sapInoWallWILineVERTICAL");
                    this.$().find(".sapInoWallWILineFirst").css("border-right-style", this.getStyle().toLowerCase());
                    this.$().find(".sapInoWallWILineFirst").css("border-bottom-style", "none");
                    
                    var sDim = this.$().find(".sapInoWallWILineFirst").css("height");
                    this.$().find(".sapInoWallWILineFirst").css("height", "");
                    this.$().find(".sapInoWallWILineFirst").css("width", sDim);
                    this.$().find(".sapInoWallWILineSecond").css("height", "");
                    this.$().find(".sapInoWallWILineSecond").css("width", sDim);    
                }
            } else if (sOldOrientation === "VERTICAL") {
                if (this._touchStartMousePositionY) {
                    if (!sap.ino.wall.config.Config.getZoomCapable()) {
                        this.setY(Math.abs((this.getParent().$("inner").offset().top - this._touchStartMousePositionY) * fZoomModifier) + "px");
                    } else {
                        this.setY(Math.abs(this.getParent().$("inner").offset().top - this._touchStartMousePositionY * fZoomModifier) + "px");
                    }
                } else {
                    this.setY(this.getX());
                }
                this.setX("0px");
                if (this._isRendered()) {
                    this.$().removeClass("sapInoWallWILineVERTICAL").addClass("sapInoWallWILineHORIZONTAL");
                    this.$().find("#" + this.getId() + "-front").removeClass("sapInoWallWILineVERTICAL").addClass("sapInoWallWILineHORIZONTAL");
                    this.$().find("#" + this.getId() + "-back").removeClass("sapInoWallWILineVERTICAL").addClass("sapInoWallWILineHORIZONTAL");
                    this.$().find(".sapInoWallWILineFirst").css("border-right-style", "none");
                    this.$().find(".sapInoWallWILineFirst").css("border-bottom-style", this.getStyle().toLowerCase());
                    
                    var sDim = this.$().find(".sapInoWallWILineFirst").css("width");
                    this.$().find(".sapInoWallWILineFirst").css("width", "");
                    this.$().find(".sapInoWallWILineFirst").css("height", sDim);
                    this.$().find(".sapInoWallWILineSecond").css("width", "");
                    this.$().find(".sapInoWallWILineSecond").css("height", sDim);
                }
            }
            // somehow the line flips back to front after the setX/setY (by setting left or top css attribute)
            // it keeps the flipped css class but shows the front side, thus it needs to be flipped again
            if (this.$().hasClass("flipped")) {
                this.setFlipped(true);
            }
            // set title to translated text for frontend: Horizontal line / Vertical line
            this.setTitle(this._oRB.getText("WALL_ITEMLINE_STATUSMSG_ORIENTATION_" + sOrientation.toUpperCase()), true);

            // update ui (in case it was flipped by moving the line)
            sap.ui.getCore().byId(this.getId() + "-buttonOrientation" + (sOrientation === "HORIZONTAL" ? "V" : "H")).setPressed(false);
            sap.ui.getCore().byId(this.getId() + "-buttonOrientation" + (sOrientation === "HORIZONTAL" ? "H" : "V")).setPressed(true);
        }

        // inform wall that this item has changed a persistence property
        if (this.getParent() && !bSuppressNotify) {
            this.getParent()._notifyItemChanged(this);
        }
    };

    /**
     * changes the style of a line without re-rendering (switches x/y coordinates)
     * 
     * @override
     * @param (string)
     *            sOrientation the new value
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemLine.prototype.setStyle = function(sStyle, bSuppressNotify) {
        this.setProperty("style", sStyle, true);
        if (this._isRendered()) {
            this.$().find(".sapInoWallWILineFirst").css("border-" + (this.getOrientation() === "HORIZONTAL" ? "bottom" : "right") + "-style", sStyle.toLowerCase());
        }
        // inform wall that this item has changed a persistence property
        if (this.getParent() && !bSuppressNotify) {
            this.getParent()._notifyItemChanged(this);
        }
    };

    /**
     * changes the thickness of a line without re-rendering
     * 
     * @override
     * @param (int)
     *            iThickness the new value
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemLine.prototype.setThickness = function(iThickness, bSuppressNotify) {
        var iOldThickness = this.getThickness(), $lineEditButtons = this.$().find(".sapInoWallWILineEditButtons");

        this.setProperty("thickness", iThickness, true);
        if (this._isRendered() && iOldThickness !== iThickness) {
            var iDim = 13 - parseInt(iThickness / 2);
            var sDim = (this.getOrientation() === "VERTICAL") ? "width" : "height";
            
            this.$().find(".sapInoWallWILineFirst").css("border-width", iThickness);
            this.$().find(".sapInoWallWILineFirst").css(sDim, iDim);
            this.$().find(".sapInoWallWILineSecond").css(sDim, iDim);            
            /*
            if (this.getOrientation() === "Horizontal") {
                $lineEditButtons.css("top", (parseInt($lineEditButtons.css("top"), 10) + (iOldThickness - iThickness) / 2) + "px");
            } else {
                $lineEditButtons.css("left", (parseInt($lineEditButtons.css("left"), 10) - (iOldThickness - iThickness) / 2) + "px");
            }
            */
        }
        // inform wall that this item has changed a persistence property
        if (this.getParent() && !bSuppressNotify) {
            this.getParent()._notifyItemChanged(this);
        }
    };

    /**
     * changes the color of a line without re-rendering
     * 
     * @override
     * @param (string)
     *            sColor the new value
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemLine.prototype.setColor = function(sColor, bSuppressNotify) {
        var fLuminance;
        var oButtonColorSelector = this._getButtonColorSelector();

        this.setProperty("color", sColor, true);
        if (this._isRendered()) {
            // update line color
            this.$().find(".sapInoWallWILineFirst").css("border-color", sColor);
            // update button color
            if (oButtonColorSelector) {
                sap.ui.getCore().byId(this.getId() + "-buttonColorSelector").$().find(".sapMBtnInner").css("background-color", this.getColor());
            }
            // update color picker icon
            fLuminance = sap.ino.wall.util.Helper.getColorLuminance(sColor);
            // switch picker icon based on luminosity of the color
            if (fLuminance <= 0.6) {
                this._getButtonColorSelector().addStyleClass("sapInoWallWILineColorSelectorButtonBright").removeStyleClass("sapInoWallWILineColorSelectorButtonNormal");
            } else {
                this._getButtonColorSelector().addStyleClass("sapInoWallWILineColorSelectorButtonNormal").removeStyleClass("sapInoWallWILineColorSelectorButtonBright");
            }
        }
        // inform wall that this item has changed a persistence property
        if (this.getParent() && !bSuppressNotify) {
            this.getParent()._notifyItemChanged(this);
        }
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemLine.prototype._getButtonOrientationH = function() {
        var that = this, oControl = this.getAggregation("_buttonOrientationH");

        if (!oControl) {
            // create control
            oControl = new sap.m.ToggleButton(this.getId() + "-buttonOrientationH", {
                tooltip : this._oRB.getText("WALL_ITEMLINE_STATUSMSG_ORIENTATION_HORIZONTAL"),
                press : function(oEvent) {
                    that.setOrientation("HORIZONTAL");
                    sap.ui.getCore().byId(that.getId() + "-buttonOrientationH").setPressed(true);
                    sap.ui.getCore().byId(that.getId() + "-buttonOrientationV").setPressed(false);
                }
            }).addStyleClass("noflip").addStyleClass("sapInoWallWILineButton").addStyleClass("sapInoWallWILineButtonHORIZONTAL");

            // set initial state
            if (this.getOrientation() === "HORIZONTAL") {
                oControl.setPressed(true);
            }

            // set hidden aggregation without rerendering
            this.setAggregation("_buttonOrientationH", oControl, true);
        }

        return oControl;
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemLine.prototype._getButtonOrientationV = function() {
        var that = this, oControl = this.getAggregation("_buttonOrientationV");

        if (!oControl) {
            // create control
            oControl = new sap.m.ToggleButton(this.getId() + "-buttonOrientationV", {
                tooltip : this._oRB.getText("WALL_ITEMLINE_STATUSMSG_ORIENTATION_VERTICAL"),
                press : function(oEvent) {
                    that.setOrientation("VERTICAL");
                    sap.ui.getCore().byId(that.getId() + "-buttonOrientationH").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonOrientationV").setPressed(true);
                }
            }).addStyleClass("noflip").addStyleClass("sapInoWallWILineButton").addStyleClass("sapInoWallWILineButtonEnd").addStyleClass("sapInoWallWILineButtonVERTICAL");

            // set initial state
            if (this.getOrientation() === "VERTICAL") {
                oControl.setPressed(true);
            }

            // set hidden aggregation without rerendering
            this.setAggregation("_buttonOrientationV", oControl, true);
        }

        return oControl;
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemLine.prototype._getButtonStyleSolid = function() {
        var that = this, oControl = this.getAggregation("_buttonStyleSolid");

        if (!oControl) {
            // create control
            oControl = new sap.m.ToggleButton(this.getId() + "-buttonStyleSolid", {
                tooltip : this._oRB.getText("WALL_ITEMLINE_STATUSMSG_STYLE_SOLID"),
                press : function(oEvent) {
                    that.setStyle("SOLID");
                    sap.ui.getCore().byId(that.getId() + "-buttonStyleSolid").setPressed(true);
                    sap.ui.getCore().byId(that.getId() + "-buttonStyleDashed").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonStyleDotted").setPressed(false);
                }
            }).addStyleClass("noflip").addStyleClass("sapInoWallWILineButton").addStyleClass("sapInoWallWILineButtonSOLID");

            // set initial state
            if (this.getStyle() === "SOLID") {
                oControl.setPressed(true);
            }

            // set hidden aggregation without rerendering
            this.setAggregation("_buttonStyleSolid", oControl, true);
        }

        return oControl;
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemLine.prototype._getButtonStyleDashed = function() {
        var that = this, oControl = this.getAggregation("_buttonStyleDashed");

        if (!oControl) {
            // create control
            oControl = new sap.m.ToggleButton(this.getId() + "-buttonStyleDashed", {
                tooltip : this._oRB.getText("WALL_ITEMLINE_STATUSMSG_STYLE_DASHED"),
                press : function(oEvent) {
                    that.setStyle("DASHED");
                    sap.ui.getCore().byId(that.getId() + "-buttonStyleSolid").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonStyleDashed").setPressed(true);
                    sap.ui.getCore().byId(that.getId() + "-buttonStyleDotted").setPressed(false);
                }
            }).addStyleClass("noflip").addStyleClass("sapInoWallWILineButton").addStyleClass("sapInoWallWILineButtonDASHED");

            // set initial state
            if (this.getStyle() === "DASHED") {
                oControl.setPressed(true);
            }

            // set hidden aggregation without rerendering
            this.setAggregation("_buttonStyleDashed", oControl, true);
        }

        return oControl;
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemLine.prototype._getButtonStyleDotted = function() {
        var that = this, oControl = this.getAggregation("_buttonStyleDotted");

        if (!oControl) {
            // create control
            oControl = new sap.m.ToggleButton(this.getId() + "-buttonStyleDotted", {
                tooltip : this._oRB.getText("WALL_ITEMLINE_STATUSMSG_STYLE_DOTTED"),
                press : function(oEvent) {
                    that.setStyle("DOTTED");
                    sap.ui.getCore().byId(that.getId() + "-buttonStyleSolid").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonStyleDashed").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonStyleDotted").setPressed(true);
                }
            }).addStyleClass("noflip").addStyleClass("sapInoWallWILineButton").addStyleClass("sapInoWallWILineButtonEnd").addStyleClass("sapInoWallWILineButtonDOTTED");

            // set initial state
            if (this.getStyle() === "DOTTED") {
                oControl.setPressed(true);
            }

            // set hidden aggregation without rerendering
            this.setAggregation("_buttonStyleDotted", oControl, true);
        }

        return oControl;
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemLine.prototype._getButtonThickness1px = function() {
        var that = this, oControl = this.getAggregation("_buttonThickness1px");

        if (!oControl) {
            // create control
            oControl = new sap.m.ToggleButton(this.getId() + "-buttonThickness1px", {
                tooltip : this._oRB.getText("WALL_ITEMLINE_STATUSMSG_THICKNESS_1"),
                press : function(oEvent) {
                    that.setThickness(2);
                    sap.ui.getCore().byId(that.getId() + "-buttonThickness1px").setPressed(true);
                    sap.ui.getCore().byId(that.getId() + "-buttonThickness3px").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonThickness5px").setPressed(false);
                }
            }).addStyleClass("noflip").addStyleClass("sapInoWallWILineButton").addStyleClass("sapInoWallWILineButtonThin");

            // set initial state
            if (this.getThickness() === 2) {
                oControl.setPressed(true);
            }

            // set hidden aggregation without rerendering
            this.setAggregation("_buttonThickness1px", oControl, true);
        }

        return oControl;
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemLine.prototype._getButtonThickness3px = function() {
        var that = this, oControl = this.getAggregation("_buttonThickness3px");

        if (!oControl) {
            // create control
            oControl = new sap.m.ToggleButton(this.getId() + "-buttonThickness3px", {
                tooltip : this._oRB.getText("WALL_ITEMLINE_STATUSMSG_THICKNESS_3"),
                press : function(oEvent) {
                    that.setThickness(4);
                    sap.ui.getCore().byId(that.getId() + "-buttonThickness1px").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonThickness3px").setPressed(true);
                    sap.ui.getCore().byId(that.getId() + "-buttonThickness5px").setPressed(false);
                }
            }).addStyleClass("noflip").addStyleClass("sapInoWallWILineButton").addStyleClass("sapInoWallWILineButtonMedium");

            // set initial state
            if (this.getThickness() === 4) {
                oControl.setPressed(true);
            }

            // set hidden aggregation without rerendering
            this.setAggregation("_buttonThickness3px", oControl, true);
        }

        return oControl;
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemLine.prototype._getButtonThickness5px = function() {
        var that = this, oControl = this.getAggregation("_buttonThickness5px");

        if (!oControl) {
            // create control
            oControl = new sap.m.ToggleButton(this.getId() + "-buttonThickness5px", {
                tooltip : this._oRB.getText("WALL_ITEMLINE_STATUSMSG_THICKNESS_5"),
                press : function(oEvent) {
                    that.setThickness(6);
                    sap.ui.getCore().byId(that.getId() + "-buttonThickness1px").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonThickness3px").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonThickness5px").setPressed(true);
                }
            }).addStyleClass("noflip").addStyleClass("sapInoWallWILineButton").addStyleClass("sapInoWallWILineButtonEnd").addStyleClass("sapInoWallWILineButtonThick");

            // set initial state
            if (this.getThickness() === 6) {
                oControl.setPressed(true);
            }

            // set hidden aggregation without rerendering
            this.setAggregation("_buttonThickness5px", oControl, true);
        }

        return oControl;
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemLine.prototype._getColorPicker = function() {
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
     * Lazy initialization of the internal control @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemLine.prototype._getButtonColorSelector = function() {
        var that = this, oControl = this.getAggregation("_buttonColorSelector");

        if (!oControl) {
            // create control
            oControl = new sap.m.Button(this.getId() + "-buttonColorSelector", {
                tooltip : this._oRB.getText("WALL_ITEMLINE_STATUSMSG_COLOR_SELECT"),
                press : function(oEvent) {
                    var oColorPicker = that._getColorPicker();

                    // set placement orthogonal to line orientation
                    oColorPicker.setPlacement(that.getOrientation() === "HORIZONTAL" ? sap.m.PlacementType.Vertical : sap.m.PlacementType.Horizontal);

                    if (oColorPicker.isOpen()) {
                        oColorPicker.close();
                    } else {
                        oColorPicker.openBy(oControl, 40, 40);
                    }
                },
                icon : "sap-icon://palette"
            }).addStyleClass("noflip").addStyleClass("sapInoWallWILineColorSelectorButton").addStyleClass("sapInoWallWILineButton").addStyleClass("sapInoWallWILineButtonEnd").addStyleClass("sapInoWallWILineColorSelectorButtonNormal");

            // set hidden aggregation without rerendering
            this.setAggregation("_buttonColorSelector", oControl, true);
        }

        return oControl;
    };

    /**
     * creates a minimalic JSON representation of the item to be stored in the db
     * 
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.WallItemLine.prototype.formatToJSON = function() {
        // call the base object's JSON method
        var oJSON = sap.ino.wall.WallItemBase.prototype.formatToJSON.call(this);
        // add properties of this control
        oJSON.orientation = this.getOrientation();
        oJSON.thickness = this.getThickness();
        oJSON.style = this.getStyle();
        oJSON.color = this.getColor();
        // return the final object
        return oJSON;
    };
})();