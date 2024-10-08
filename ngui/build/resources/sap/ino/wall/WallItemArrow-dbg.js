/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.WallItemArrow");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBase");
    jQuery.sap.require("sap.ino.wall.WallConfig");
    jQuery.sap.require("sap.ino.wall.ColorPicker");
    jQuery.sap.require("sap.ino.wall.util.Helper");
    
    /**
     * Constructor for a new WallItemArrow.
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
     * @class Add your documentation for the newWallItemArrow
     * @extends sap.ino.wall.WallItemBase
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.WallItemArrow
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ino.wall.WallItemBase.extend("sap.ino.wall.WallItemArrow", {
        metadata : {
            properties : {
                "x1" : {
                    type : "float",
                    defaultValue : 0
                },
                "y1" : {
                    type : "float",
                    defaultValue : 0
                },
                "x2" : {
                    type : "float",
                    defaultValue : 0
                },
                "y2" : {
                    type : "float",
                    defaultValue : 0
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
                    defaultValue : '#000000'
                },
                "headStyle" : {
                    group : "Misc",
                    defaultValue : 'END'
                }
            },
            aggregations : {
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
                "_buttonThickness3" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_buttonThickness4" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_buttonThickness5" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_buttonHeadStyleNone" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_buttonHeadStyleStart" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_buttonHeadStyleEnd" : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                },
                "_buttonHeadStyleBoth" : {
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
     * Creates a new subclass of class sap.ino.wall.WallItemArrow with name <code>sClassName</code> and enriches
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
     * @name sap.ino.wall.WallItemArrow.extend
     * @function
     */

    /**
     * Getter for property <code>color</code>. The Arrow design.
     * 
     * Default value is <code>Yellow</code>
     * 
     * @return {string} the value of property <code>color</code>
     * @public
     * @name sap.ino.wall.WallItemArrow#getColor
     * @function
     */

    /**
     * Setter for property <code>color</code>.
     * 
     * Default value is <code>Yellow</code>
     * 
     * @param {string}
     *            oColor new value for property <code>color</code>
     * @return {sap.ino.wall.WallItemArrow} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.WallItemArrow#setColor
     * @function
     */

    /**
     * Initializes the control
     * 
     * @private
     */
    sap.ino.wall.WallItemArrow.prototype.init = function() {
        sap.ino.wall.WallItemBase.prototype.init.call(this);

        this.setResizable(true);
    };

    sap.ino.wall.WallItemArrow.prototype.onAfterRendering = function() {
        var fLuminance = sap.ino.wall.util.Helper.getColorLuminance(this.getColor()), oButtonColorSelector = sap.ui.getCore().byId(this.getId() + "-buttonColorSelector");

        // call base class method
        sap.ino.wall.WallItemBase.prototype.onAfterRendering.apply(this, arguments);
        // update background color of button
        if (oButtonColorSelector) {
            oButtonColorSelector.$().find(".sapMBtnInner").css("background-color", this.getColor());
        }
        // update color picker icon based on luminosity of the color
        if (fLuminance <= 0.6) {
            this._getButtonColorSelector().addStyleClass("sapInoWallWIArrowColorSelectorButtonBright").removeStyleClass("sapInoWallWIArrowColorSelectorButtonNormal");
        } else {
            this._getButtonColorSelector().addStyleClass("sapInoWallWIArrowColorSelectorButtonNormal").removeStyleClass("sapInoWallWIArrowColorSelectorButtonBright");
        }
    };
    
    sap.ino.wall.WallItemArrow.prototype.calcFigures = function() {
        var f = {
            w : Math.max(parseFloat(this.getW()) || 0, 1),
            h : Math.max(parseFloat(this.getH()) || 0, 25),
            x : parseFloat(this.getX()) || 0,
            y : parseFloat(this.getY()) || 0,
            x1 : this.getX1() || 0,
            y1 : this.getY1() || 0,
            x2 : this.getX2() || 0,
            y2 : this.getY2() || 0
        };
        f.d = Math.sqrt(Math.pow(f.w, 2) + Math.pow(f.h, 2));
        f.t = 50;
        f.r = Math.atan((f.y2 - f.y1) / (f.x2 - f.x1));
        f.hx = (f.x1 + f.x2 - f.d) / 2;
        f.hy = (f.y1 + f.y2 - f.t) / 2;
        f.hs = f.t / 2; // Adjust handle size with thickness??
        return f;
    };
    
    sap.ino.wall.WallItemArrow.prototype.updateSide = function(sSideId, f) {
        var $side = jQuery(this.getDomRef()).find("#" + this.getId() + "-" + sSideId);
        if ($side) {
            $side.css("width", (f.w || 0) + "px");
            $side.css("height", (f.h || 0) + "px");
        }
        var $arrow = $side.find("#" + this.getId() + "-" + sSideId + "-arrow");
        if ($arrow) {
            $arrow.attr("width", f.w + "px");
            $arrow.attr("height", f.h + "px");
            // No jQuery used to modify case-sensitive attribute
            $arrow[0].setAttribute("viewBox", "0 0 " + f.w + " " + f.h);
            // Arrow Head Start
            var $markerStart = jQuery($arrow.children()[0]);
            $markerStart[0].setAttribute("markerWidth", this.getThickness());
            $markerStart[0].setAttribute("markerHeight", this.getThickness());
            $markerStart[0].setAttribute("refX", this.getThickness() / 2);
            var $markerStartPath = jQuery($markerStart.children()[0]);
            $markerStartPath.attr("fill", this.getColor());
            // Arrow Head End            
            var $markerEnd = jQuery($arrow.children()[1]);
            $markerEnd[0].setAttribute("markerWidth", this.getThickness());
            $markerEnd[0].setAttribute("markerHeight", this.getThickness());
            $markerEnd[0].setAttribute("refX", 6 + this.getThickness() / 2);
            var $markerEndPath = jQuery($markerEnd.children()[0]);
            $markerEndPath.attr("fill", this.getColor());
            // Arrow Line
            var $line = jQuery($arrow.children()[2]);
            $line.attr("x1", (f.x1-f.x));
            $line.attr("y1", (f.y1-f.y));
            $line.attr("x2", (f.x2-f.x));
            $line.attr("y2", (f.y2-f.y));
            $line.attr("stroke", this.getColor());
            $line.attr("stroke-width", this.getThickness());
            var sMarkerStartId = this.getId() + "-" + sSideId + "-start-triangle";
            var sMarkerEndId = this.getId() + "-" + sSideId + "-end-triangle";
            $line.attr("marker-start", this.getHeadStyle() == "START" || this.getHeadStyle() == "BOTH" ? "url(#" + sMarkerStartId + ")" : "none");
            $line.attr("marker-end", this.getHeadStyle() == "END" || this.getHeadStyle() == "BOTH" ? "url(#" + sMarkerEndId + ")" : "none");
            switch (this.getStyle()) {
                case "DOTTED":
                    $line.attr("stroke-dasharray", "4, 4");
                    break;
                case "DASHED":
                    $line.attr("stroke-dasharray", "10, 5");
                    break;
                case "SOLID" :
                    /* falls through */
                default:
                    $line.attr("stroke-dasharray", "none");
                    break;
            }
        }        
    };
    
    sap.ino.wall.WallItemArrow.prototype.updateArrowSVG = function() {
        if (this.getDomRef()) {
            var f = this.calcFigures();
            this.updateSide("front", f);
            this.updateSide("back", f);

            var fHandleSize = 35; 
            var $startHandle = jQuery(this.getDomRef()).find(".sapInoWallWIArrowStartHandle");
            if ($startHandle) {
                $startHandle.css("left", (f.x1-f.x-f.hs/2) + "px");
                $startHandle.css("top", (f.y1-f.y-f.hs/2) + "px");
            }
            var $endHandle = jQuery(this.getDomRef()).find(".sapInoWallWIArrowEndHandle");
            if ($endHandle) {
                $endHandle.css("left", (f.x2-f.x-f.hs/2) + "px");
                $endHandle.css("top", (f.y2-f.y-f.hs/2) + "px");
            }
            var $moveHandle = jQuery(this.getDomRef()).find(".sapInoWallWIArrowMoveHandle");
            if ($moveHandle) {
                $moveHandle.css("transform", "rotateZ(" + f.r + "rad)");
                $moveHandle.css("width", f.d + "px");
                $moveHandle.css("height", f.t + "px");
                $moveHandle.css("left", (f.hx-f.x) + "px");
                $moveHandle.css("top", (f.hy-f.y) + "px");
                $moveHandle.css("color", this.getColor());
            }
        }
    };

    sap.ino.wall.WallItemArrow.prototype.setTitle = function(sTitle, bSuppressNotify) {
        if (sTitle !== this.getTitle()) {
            this.setProperty("title", sTitle, true);
            this.$().find(".front .sapInoWallWIArrowMoveHandle").text(sTitle);
            
            // inform wall that this item has changed a persistence property
            if (this.getParent() && !bSuppressNotify) {
                this.getParent()._notifyItemChanged(this);
            }
        }
        return this;
    };

    var fnWallItemBasebaseSetFlipped = sap.ino.wall.WallItemBase.prototype.setFlipped;
    sap.ino.wall.WallItemArrow.prototype.setFlipped = function(bFlipped) {
        // close color selector if it is initialized
        if (this.getAggregation("_colorPicker")) {
            this.getAggregation("_colorPicker").close();
        }
        fnWallItemBasebaseSetFlipped.apply(this, arguments);
        this.focus();
    };
    
    sap.ino.wall.WallItemArrow.prototype.setColor = function(sColor, bSuppressNotify) {
        if (sColor !== this.getColor()) {
            var fLuminance;
            var oButtonColorSelector = this._getButtonColorSelector();

            this.setProperty("color", sColor, true);
            if (this._isRendered()) {
                // update button color
                if (oButtonColorSelector) {
                    sap.ui.getCore().byId(this.getId() + "-buttonColorSelector").$().find(".sapMBtnInner").css("background-color", this.getColor());
                }
                // update color picker icon
                fLuminance = sap.ino.wall.util.Helper.getColorLuminance(sColor);
                // switch picker icon based on luminosity of the color
                if (fLuminance <= 0.6) {
                    this._getButtonColorSelector().addStyleClass("sapInoWallWIArrowColorSelectorButtonBright").removeStyleClass("sapInoWallWIArrowColorSelectorButtonNormal");
                } else {
                    this._getButtonColorSelector().addStyleClass("sapInoWallWIArrowColorSelectorButtonNormal").removeStyleClass("sapInoWallWIArrowColorSelectorButtonBright");
                }
                this.updateArrowSVG();                
            }
        }
        return this;
    };
    
    sap.ino.wall.WallItemArrow.prototype.setThickness = function(iThickness, bSuppressRecalc) {
        this.setProperty("thickness", iThickness, true);
        this.updateArrowSVG();
    };
    
    sap.ino.wall.WallItemArrow.prototype.setStyle = function(sStyle, bSuppressRecalc) {
        this.setProperty("style", sStyle, true);
        this.updateArrowSVG();
    };
    
    sap.ino.wall.WallItemArrow.prototype.setHeadStyle = function(sHeadStyle, bSuppressRecalc) {
        this.setProperty("headStyle", sHeadStyle, true);
        this.updateArrowSVG();
    };
    
    sap.ino.wall.WallItemArrow.prototype.setW = function(sW, bSuppressRecalc) {
        sap.ino.wall.WallItemBase.prototype.setW.apply(this, arguments);
        if (!bSuppressRecalc) {
            this.recalcPoints();
        }
        this.updateArrowSVG();
    };
    
    sap.ino.wall.WallItemArrow.prototype.setH = function(sH, bSuppressRecalc) {
        sap.ino.wall.WallItemBase.prototype.setH.apply(this, arguments);
        if (!bSuppressRecalc) {
            this.recalcPoints();
        }
        this.updateArrowSVG();
    };
    
    sap.ino.wall.WallItemArrow.prototype.setX = function(sX, bSuppressRecalc) {
        sap.ino.wall.WallItemBase.prototype.setX.apply(this, arguments);
        if (!bSuppressRecalc) {
            this.recalcPoints();
        }
        this.updateArrowSVG();
    };
    
    sap.ino.wall.WallItemArrow.prototype.setY = function(sY, bSuppressRecalc) {
        sap.ino.wall.WallItemBase.prototype.setY.apply(this, arguments);
        if (!bSuppressRecalc) {
            this.recalcPoints();
        }
        this.updateArrowSVG();
    };
    
    sap.ino.wall.WallItemArrow.prototype.setX1 = function(x1) {
        this.setProperty("x1", x1, true);
        this.updateArrowSVG();
    };
    
    sap.ino.wall.WallItemArrow.prototype.setY1 = function(y1) {
        this.setProperty("y1", y1, true);
        this.updateArrowSVG();
    };
    
    sap.ino.wall.WallItemArrow.prototype.setX2 = function(x2) {
        this.setProperty("x2", x2, true);
        this.updateArrowSVG();
    };
    
    sap.ino.wall.WallItemArrow.prototype.setY2 = function(y2) {
        this.setProperty("y2", y2, true);
        this.updateArrowSVG();
    };
        
    sap.ino.wall.WallItemArrow.prototype.recalcPoints = function() {
        if (this.getX1() <= this.getX2()) {
           this.setX1(parseFloat(this.getProperty("x")) || 0);
           this.setX2((parseFloat(this.getProperty("x")) || 0) + (parseFloat(this.getProperty("w")) || 0));
        } else {
           this.setX1((parseFloat(this.getProperty("x")) || 0) + (parseFloat(this.getProperty("w")) || 0));
           this.setX2(parseFloat(this.getProperty("x")) || 0);
        }
        if (this.getY1() <= this.getY2()) {
            this.setY1(parseFloat(this.getProperty("y")) || 0);
            this.setY2((parseFloat(this.getProperty("y")) || 0) + (parseFloat(this.getProperty("h")) || 0));
        } else {
            this.setY1((parseFloat(this.getProperty("y")) || 0) + (parseFloat(this.getProperty("h")) || 0));
            this.setY2(parseFloat(this.getProperty("y")) || 0);
        }
    };
    
    sap.ino.wall.WallItemArrow.prototype.recalcBounds = function() {
        this.setX(Math.min(this.getX1(), this.getX2()) + "px", true);
        this.setY(Math.min(this.getY1(), this.getY2()) + "px", true);
        this.setW(Math.max(Math.abs(this.getX2() - this.getX1()), 1) + "px", true);
        this.setH(Math.max(Math.abs(this.getY2() - this.getY1()), 1) + "px", true);
    };
    
    sap.ino.wall.WallItemArrow.prototype.onTouchStartItem = function(oEvent) {
        if (jQuery(oEvent.target).hasClass("sapInoWallWIArrowStartHandle")) {
            this._touchMode = sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVE_START;
            this._touchStartItemX = parseFloat(this.getX());
            this._touchStartItemY = parseFloat(this.getY());
            // set cursor to grabbing
            this.$().find(".sapInoWallWIArrowStartHandle").addClass("dragCursor");
            this.$().find(".sapInoWallWIArrowEndHandle").addClass("dragCursor");
            return true;
        } else if (jQuery(oEvent.target).hasClass("sapInoWallWIArrowEndHandle")) {
            this._touchMode = sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVE_END;
            this._touchStartItemX = parseFloat(this.getX());
            this._touchStartItemY = parseFloat(this.getY());
            // set cursor to grabbing
            this.$().find(".sapInoWallWIArrowStartHandle").addClass("dragCursor");
            this.$().find(".sapInoWallWIArrowEndHandle").addClass("dragCursor");
            return true;
        } else if (!jQuery(oEvent.target).hasClass("sapInoWallWIArrowMoveHandle")) {
            if (this.getFlipped()) {
                return false;
            } else {
                return null;
            }
        }
        return false;
    };
    
    sap.ino.wall.WallItemArrow.prototype._ontouchmove = function(oEvent) {
        sap.ino.wall.WallItemBase.prototype._ontouchmove.apply(this, arguments);
        if (this._touchMode == sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVE_START ||
            this._touchMode == sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVE_END) {    
            var oWall = this.getWall()
            if (this._fDeltaX || this._fDeltaY) {
                // flag this item and the wall as moving
                this._bMoving = true;
                oWall._bMovingItem = true;
            }
            this._ignoreTrash = true;
            
            var fZoomModifier = 100 / oWall.getZoom();        
            var fDeltaX = this._fDeltaX * fZoomModifier;
            var fDeltaY = this._fDeltaY * fZoomModifier;
            if (this._touchMode == sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVE_START) {
                this.setX1(this.getX1() + fDeltaX);
                this.setY1(this.getY1() + fDeltaY);
                this.recalcBounds();
            } else if (this._touchMode == sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVE_END) {
                this.setX2(this.getX2() + fDeltaX);
                this.setY2(this.getY2() + fDeltaY);
                this.recalcBounds();
            }
        }
    };

    sap.ino.wall.WallItemArrow.prototype._ontouchend = function(oEvent) {
        sap.ino.wall.WallItemBase.prototype._ontouchend.apply(this, arguments);
        if (this._touchMode == sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVE_START) {
            this._bMoving = false;
            this._ignoreTrash = false;
        } else if (this._touchMode == sap.ino.wall.WallConfig._ITEM_TOUCHMODE_MOVE_END) {
            this._bMoving = false;
            this._ignoreTrash = false;
        }
        this.$().find(".sapInoWallWIArrowStartHandle").removeClass("dragCursor");
        this.$().find(".sapInoWallWIArrowEndHandle").removeClass("dragCursor");
    };
    
    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemArrow.prototype._getButtonStyleSolid = function() {
        var that = this, oControl = this.getAggregation("_buttonStyleSolid");

        if (!oControl) {
            // create control
            oControl = new sap.m.ToggleButton(this.getId() + "-buttonStyleSolid", {
                tooltip : this._oRB.getText("WALL_ITEMARROW_STATUSMSG_STYLE_SOLID"),
                press : function(oEvent) {
                    that.setStyle("SOLID");
                    sap.ui.getCore().byId(that.getId() + "-buttonStyleSolid").setPressed(true);
                    sap.ui.getCore().byId(that.getId() + "-buttonStyleDashed").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonStyleDotted").setPressed(false);
                }
            }).addStyleClass("noflip").addStyleClass("sapInoWallWIArrowButton").addStyleClass("sapInoWallWIArrowButtonSOLID");

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
    sap.ino.wall.WallItemArrow.prototype._getButtonStyleDashed = function() {
        var that = this, oControl = this.getAggregation("_buttonStyleDashed");

        if (!oControl) {
            // create control
            oControl = new sap.m.ToggleButton(this.getId() + "-buttonStyleDashed", {
                tooltip : this._oRB.getText("WALL_ITEMARROW_STATUSMSG_STYLE_DASHED"),
                press : function(oEvent) {
                    that.setStyle("DASHED");
                    sap.ui.getCore().byId(that.getId() + "-buttonStyleSolid").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonStyleDashed").setPressed(true);
                    sap.ui.getCore().byId(that.getId() + "-buttonStyleDotted").setPressed(false);
                }
            }).addStyleClass("noflip").addStyleClass("sapInoWallWIArrowButton").addStyleClass("sapInoWallWIArrowButtonDASHED");

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
    sap.ino.wall.WallItemArrow.prototype._getButtonStyleDotted = function() {
        var that = this, oControl = this.getAggregation("_buttonStyleDotted");

        if (!oControl) {
            // create control
            oControl = new sap.m.ToggleButton(this.getId() + "-buttonStyleDotted", {
                tooltip : this._oRB.getText("WALL_ITEMARROW_STATUSMSG_STYLE_DOTTED"),
                press : function(oEvent) {
                    that.setStyle("DOTTED");
                    sap.ui.getCore().byId(that.getId() + "-buttonStyleSolid").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonStyleDashed").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonStyleDotted").setPressed(true);
                }
            }).addStyleClass("noflip").addStyleClass("sapInoWallWIArrowButton").addStyleClass("sapInoWallWIArrowButtonEnd").addStyleClass("sapInoWallWIArrowButtonDOTTED");

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
    sap.ino.wall.WallItemArrow.prototype._getButtonThickness3 = function() {
        var that = this, oControl = this.getAggregation("_buttonThickness3");

        if (!oControl) {
            // create control
            oControl = new sap.m.ToggleButton(this.getId() + "-buttonThickness3", {
                tooltip : this._oRB.getText("WALL_ITEMARROW_STATUSMSG_THICKNESS_3"),
                press : function(oEvent) {
                    that.setThickness(3);
                    sap.ui.getCore().byId(that.getId() + "-buttonThickness3").setPressed(true);
                    sap.ui.getCore().byId(that.getId() + "-buttonThickness4").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonThickness5").setPressed(false);
                }
            }).addStyleClass("noflip").addStyleClass("sapInoWallWIArrowButton").addStyleClass("sapInoWallWIArrowButtonThin");

            // set initial state
            if (this.getThickness() === 3) {
                oControl.setPressed(true);
            }

            // set hidden aggregation without rerendering
            this.setAggregation("_buttonThickness3", oControl, true);
        }

        return oControl;
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemArrow.prototype._getButtonThickness4 = function() {
        var that = this, oControl = this.getAggregation("_buttonThickness4");

        if (!oControl) {
            // create control
            oControl = new sap.m.ToggleButton(this.getId() + "-buttonThickness4", {
                tooltip : this._oRB.getText("WALL_ITEMARROW_STATUSMSG_THICKNESS_4"),
                press : function(oEvent) {
                    that.setThickness(4);
                    sap.ui.getCore().byId(that.getId() + "-buttonThickness3").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonThickness4").setPressed(true);
                    sap.ui.getCore().byId(that.getId() + "-buttonThickness5").setPressed(false);
                }
            }).addStyleClass("noflip").addStyleClass("sapInoWallWIArrowButton").addStyleClass("sapInoWallWIArrowButtonMedium");

            // set initial state
            if (this.getThickness() === 4) {
                oControl.setPressed(true);
            }

            // set hidden aggregation without rerendering
            this.setAggregation("_buttonThickness4", oControl, true);
        }

        return oControl;
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemArrow.prototype._getButtonThickness5 = function() {
        var that = this, oControl = this.getAggregation("_buttonThickness5");

        if (!oControl) {
            // create control
            oControl = new sap.m.ToggleButton(this.getId() + "-buttonThickness5", {
                tooltip : this._oRB.getText("WALL_ITEMARROW_STATUSMSG_THICKNESS_5"),
                press : function(oEvent) {
                    that.setThickness(5);
                    sap.ui.getCore().byId(that.getId() + "-buttonThickness3").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonThickness4").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonThickness5").setPressed(true);
                }
            }).addStyleClass("noflip").addStyleClass("sapInoWallWIArrowButton").addStyleClass("sapInoWallWIArrowButtonEnd").addStyleClass("sapInoWallWIArrowButtonThick");

            // set initial state
            if (this.getThickness() === 5) {
                oControl.setPressed(true);
            }

            // set hidden aggregation without rerendering
            this.setAggregation("_buttonThickness5", oControl, true);
        }

        return oControl;
    };
    
    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemArrow.prototype._getButtonHeadStyleNone = function() {
        var that = this, oControl = this.getAggregation("_buttonHeadStyleNone");

        if (!oControl) {
            // create control
            oControl = new sap.m.ToggleButton(this.getId() + "-buttonHeadStyleNone", {
                tooltip : this._oRB.getText("WALL_ITEMARROW_STATUSMSG_HEAD_STYLE_NONE"),
                press : function(oEvent) {
                    that.setHeadStyle("NONE");
                    sap.ui.getCore().byId(that.getId() + "-buttonHeadStyleNone").setPressed(true);
                    sap.ui.getCore().byId(that.getId() + "-buttonHeadStyleStart").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonHeadStyleEnd").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonHeadStyleBoth").setPressed(false);
                }
            }).addStyleClass("noflip").addStyleClass("sapInoWallWIArrowButton").addStyleClass("sapInoWallWIArrowButtonNONE");

            // set initial state
            if (this.getHeadStyle() === "NONE") {
                oControl.setPressed(true);
            }

            // set hidden aggregation without rerendering
            this.setAggregation("_buttonHeadStyleNone", oControl, true);
        }

        return oControl;
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemArrow.prototype._getButtonHeadStyleStart = function() {
        var that = this, oControl = this.getAggregation("_buttonHeadStyleStart");

        if (!oControl) {
            // create control
            oControl = new sap.m.ToggleButton(this.getId() + "-buttonHeadStyleStart", {
                tooltip : this._oRB.getText("WALL_ITEMARROW_STATUSMSG_HEAD_STYLE_START"),
                press : function(oEvent) {
                    that.setHeadStyle("START");
                    sap.ui.getCore().byId(that.getId() + "-buttonHeadStyleNone").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonHeadStyleStart").setPressed(true);
                    sap.ui.getCore().byId(that.getId() + "-buttonHeadStyleEnd").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonHeadStyleBoth").setPressed(false);
                }
            }).addStyleClass("noflip").addStyleClass("sapInoWallWIArrowButton").addStyleClass("sapInoWallWIArrowButtonSTART");

            // set initial state
            if (this.getHeadStyle() === "START") {
                oControl.setPressed(true);
            }

            // set hidden aggregation without rerendering
            this.setAggregation("_buttonHeadStyleStart", oControl, true);
        }

        return oControl;
    };

    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemArrow.prototype._getButtonHeadStyleEnd = function() {
        var that = this, oControl = this.getAggregation("_buttonHeadStyleEnd");

        if (!oControl) {
            // create control
            oControl = new sap.m.ToggleButton(this.getId() + "-buttonHeadStyleEnd", {
                tooltip : this._oRB.getText("WALL_ITEMARROW_STATUSMSG_HEAD_STYLE_END"),
                press : function(oEvent) {
                    that.setHeadStyle("END");
                    sap.ui.getCore().byId(that.getId() + "-buttonHeadStyleNone").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonHeadStyleStart").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonHeadStyleEnd").setPressed(true);
                    sap.ui.getCore().byId(that.getId() + "-buttonHeadStyleBoth").setPressed(false);
                }
            }).addStyleClass("noflip").addStyleClass("sapInoWallWIArrowButton").addStyleClass("sapInoWallWIArrowButtonEND");

            // set initial state
            if (this.getHeadStyle() === "END") {
                oControl.setPressed(true);
            }

            // set hidden aggregation without rerendering
            this.setAggregation("_buttonHeadStyleEnd", oControl, true);
        }

        return oControl;
    };
    
    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemArrow.prototype._getButtonHeadStyleBoth = function() {
        var that = this, oControl = this.getAggregation("_buttonHeadStyleBoth");

        if (!oControl) {
            // create control
            oControl = new sap.m.ToggleButton(this.getId() + "-buttonHeadStyleBoth", {
                tooltip : this._oRB.getText("WALL_ITEMARROW_STATUSMSG_HEAD_STYLE_BOTH"),
                press : function(oEvent) {
                    that.setHeadStyle("BOTH");
                    sap.ui.getCore().byId(that.getId() + "-buttonHeadStyleNone").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonHeadStyleStart").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonHeadStyleEnd").setPressed(false);
                    sap.ui.getCore().byId(that.getId() + "-buttonHeadStyleBoth").setPressed(true);
                }
            }).addStyleClass("noflip").addStyleClass("sapInoWallWIArrowButton").addStyleClass("sapInoWallWIArrowButtonEnd").addStyleClass("sapInoWallWIArrowButtonBOTH");

            // set initial state
            if (this.getHeadStyle() === "BOTH") {
                oControl.setPressed(true);
            }

            // set hidden aggregation without rerendering
            this.setAggregation("_buttonHeadStyleBoth", oControl, true);
        }

        return oControl;
    };
    
    /*
     * Lazy initialization of the internal control @private @returns {sap.m/Button} the button
     */
    sap.ino.wall.WallItemArrow.prototype._getColorPicker = function() {
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
    sap.ino.wall.WallItemArrow.prototype._getButtonColorSelector = function() {
        var that = this, oControl = this.getAggregation("_buttonColorSelector");

        if (!oControl) {
            // create control
            oControl = new sap.m.Button(this.getId() + "-buttonColorSelector", {
                tooltip : this._oRB.getText("WALL_ITEMARROW_STATUSMSG_COLOR_SELECT"),
                press : function(oEvent) {
                    var oColorPicker = that._getColorPicker();
                    if (oColorPicker.isOpen()) {
                        oColorPicker.close();
                    } else {
                        oColorPicker.openBy(oControl, 40, 40);
                    }
                },
                icon : "sap-icon://palette"
            }).addStyleClass("noflip").addStyleClass("sapInoWallWIArrowColorSelectorButton").addStyleClass("sapInoWallWIArrowButton").addStyleClass("sapInoWallWIArrowButtonEnd").addStyleClass("sapInoWallWIArrowColorSelectorButtonNormal");

            // set hidden aggregation without rerendering
            this.setAggregation("_buttonColorSelector", oControl, true);
        }

        return oControl;
    };

    
    /**
     * Creates a minimalic JSON representation of the item to be stored in the db
     * 
     * @override
     * @returns {object} the JSON object representation of the item
     * @public
     */
    sap.ino.wall.WallItemArrow.prototype.formatToJSON = function() {
        // call the base object's JSON method
        var oJSON = sap.ino.wall.WallItemBase.prototype.formatToJSON.call(this);
        // add properties of this control
        oJSON.x1 = this.getX1();
        oJSON.y1 = this.getY1();
        oJSON.x2 = this.getX2();
        oJSON.y2 = this.getY2();
        oJSON.thickness = this.getThickness();
        oJSON.style = this.getStyle();
        oJSON.color = this.getColor();
        oJSON.headStyle = this.getHeadStyle();
        // return the final object
        return oJSON;
    };

})();