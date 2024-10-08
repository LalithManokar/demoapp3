/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.TextEditor");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.util.Helper");
    jQuery.sap.require("sap.ino.wall.ColorPicker");
    jQuery.sap.require("sap.ino.wall.WallItemBase");
    jQuery.sap.require("sap.ino.wall.TShirtSize");

    jQuery.sap.require("sap.ino.thirdparty.nicEdit");

    /**
     * Constructor for a new TextEditor.
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
     * <li>{@link #getValue value} : string</li>
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
     * <li>{@link sap.ino.wall.TextEditor#event:change change} : fnListenerFunction or [fnListenerFunction,
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
     * @class Add your documentation for the newTextEditor
     * @extends sap.ui.core.Control
     * @version 1.16.4
     * 
     * @constructor
     * @public
     * @name sap.ino.wall.TextEditor
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    sap.ui.core.Control.extend("sap.ino.wall.TextEditor", {
        metadata : {
            properties : {
                "value" : {
                    type : "string",
                    group : "Misc",
                    defaultValue : null
                }
            },
            aggregations : {
                "_textArea" : {
                    type : "sap.m.TextArea",
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
                "_editorControls" : {
                    type : "sap.ui.layout.HorizontalLayout",
                    multiple : false,
                    visibility : "hidden"
                },
            },
            events : {
                "change" : {}
            }
        }
    });

    /**
     * Creates a new subclass of class sap.ino.wall.TextEditor with name <code>sClassName</code> and enriches it
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
     * @name sap.ino.wall.TextEditor.extend
     * @function
     */

    sap.ino.wall.TextEditor.M_EVENTS = {
        'change' : 'change'
    };

    /**
     * Getter for property <code>value</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @return {string} the value of property <code>value</code>
     * @public
     * @name sap.ino.wall.TextEditor#getValue
     * @function
     */

    /**
     * Setter for property <code>value</code>.
     * 
     * Default value is empty/<code>undefined</code>
     * 
     * @param {string}
     *            sValue new value for property <code>value</code>
     * @return {sap.ino.wall.TextEditor} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.TextEditor#setValue
     * @function
     */

    /**
     * 
     * @name sap.ino.wall.TextEditor#change
     * @event
     * @param {sap.ui.base.Event}
     *            oControlEvent
     * @param {sap.ui.base.EventProvider}
     *            oControlEvent.getSource
     * @param {object}
     *            oControlEvent.getParameters
     * @param {string}
     *            oControlEvent.getParameters.value
     * @public
     */

    /**
     * Attach event handler <code>fnFunction</code> to the 'change' event of this
     * <code>sap.ino.wall.TextEditor</code>.<br/>. When called, the context of the event handler (its
     * <code>this</code>) will be bound to <code>oListener<code> if specified
     * otherwise to this <code>sap.ino.wall.TextEditor</code>.<br/> itself. 
     *  
     *
     * @param {object}
     *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
     * @param {function}
     *            fnFunction The function to call, when the event occurs.  
     * @param {object}
     *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ino.wall.TextEditor</code>.<br/> itself.
     *
     * @return {sap.ino.wall.TextEditor} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.TextEditor#attachChange
     * @function
     */

    /**
     * Detach event handler <code>fnFunction</code> from the 'change' event of this
     * <code>sap.ino.wall.TextEditor</code>.<br/>
     * 
     * The passed function and listener object must match the ones used for event registration.
     * 
     * @param {function}
     *            fnFunction The function to call, when the event occurs.
     * @param {object}
     *            oListener Context object on which the given function had to be called.
     * @return {sap.ino.wall.TextEditor} <code>this</code> to allow method chaining
     * @public
     * @name sap.ino.wall.TextEditor#detachChange
     * @function
     */

    /**
     * Fire event change to attached listeners.
     * 
     * Expects following event parameters:
     * <ul>
     * <li>'value' of type <code>string</code> </li>
     * </ul>
     * 
     * @param {Map}
     *            [mArguments] the arguments to pass along with the event.
     * @return {sap.ino.wall.TextEditor} <code>this</code> to allow method chaining
     * @protected
     * @name sap.ino.wall.TextEditor#fireChange
     * @function
     */

    /**
     * Initializes the control
     * 
     * @private
     */
    sap.ino.wall.TextEditor.prototype.init = function() {
        this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.wall");
    };

    /**
     * Adjusts control after rendering.
     * 
     * @private
     */
    sap.ino.wall.TextEditor.prototype.onAfterRendering = function() {
        var fLuminance;

        // Note: after re-rendering we need to re-initialize the nicEditor control, focus of the control will be lost
        // therefore re-rendering should be avoided in any case, we override the setValue method to update the DOM
        this._oNicEditor = new nicEditor({ // jshint ignore:line
            buttonList : ["bold", "italic", "underline", "left", "center", "right", "ol", "ul", "forecolor", "fontSize", "fontFamily"]
        });

        // synchronize events for the editor controls and the current text selection
        this._oNicEditor.addEvent("buttonActivate", jQuery.proxy(this._nicButtonActivate, this));
        this._oNicEditor.addEvent("buttonDeactivate", jQuery.proxy(this._nicButtonDeactivate, this));

        // TODO: this happens way too often (multiple times for every click), use another event
        this._oNicEditor.addEvent("blur", jQuery.proxy(this._fireChange, this));

        // the original buttons have to be shown to capture the nicEdit events properly
        this._oNicEditor.setPanel(this.getId() + "-nicPanel");

        // register our textarea for nicEdit
        this._oNicEditor.addInstance(this.getId() + "-nicContentTA");

        // update button color
        sap.ui.getCore().byId(this.getId() + "-buttonColorSelector").$().find(".sapMBtnInner").css("background-color", this._sTextColor);
        fLuminance = sap.ino.wall.util.Helper.getColorLuminance(this._sTextColor);
        // switch picker icon based on luminosity of the color
        if (fLuminance <= 0.6) {
            this._getButtonColorSelector().addStyleClass("sapInoWallWTextEditorColorSelectorButtonBright").removeStyleClass("sapInoWallWTextEditorColorSelectorButtonNormal");
        } else {
            this._getButtonColorSelector().addStyleClass("sapInoWallWTextEditorColorSelectorButtonNormal").removeStyleClass("sapInoWallWTextEditorColorSelectorButtonBright");
        }
        
        /* workaround for buf: new sticker, new text, open colorpicker, text is removed
         * trigger the creation of the colorpicker and its components before solves the issue
         */ 
        this._getColorPicker().getPlacement();
    };

    /* =========================================================== */
    /* begin: API methods */
    /* =========================================================== */

    /**
     * Setter for the value property to suppress re-rendering
     * 
     * @param {string}
     *            sValue the new editor value
     * @override
     * @returns {this} this pointer for chaining
     * @public
     */
    sap.ino.wall.TextEditor.prototype.setValue = function(sValue) {
        if (sValue !== this.getValue()) {
            this.setProperty("value", sValue, true);
            if (this._isRendered()) {
                this.$().children("textarea").html(jQuery.sap.encodeHTML(this.getProperty("value")));
            }
        }
        return this;
    };

    /**
     * Returns the nicEdit-main panel instead of the root div.
     * 
     * @override
     * @returns
     */
    sap.ino.wall.TextEditor.prototype.getFocusDomRef = function() {
        return this.$().find(".nicEdit-main")[0];
    };

    /**
     * Blurs the text editor.
     * 
     * @public
     */
    sap.ino.wall.TextEditor.prototype.blur = function() {
        this.getFocusDomRef().blur();
        // for some reason, we also need to trigger the blur event on the nicEdit instance as well to update the
        // control's value
        this._getNicEditor().ne.fireEvent("blur");
    };

    /**
     * Toggles the visibility of the editor controls based on the current T-Shirt-Size.
     * 
     * @public
     * @param {TShirtSize}
     *            sSize a T-Shirt size calculaded by the item
     * @returns {sap.m/Input} the control
     */
    sap.ino.wall.TextEditor.prototype.setControlDetails = function(sNewSize) {
        var oEditorControls = this._getEditorControls().getContent(), sSize = sNewSize || "S", // default value
        i = 0;

        if (this._sPreviousSize === sSize) {
            return;
        }

        switch (sSize) {
            case sap.ino.wall.TShirtSize.XS :
                /* falls through */
            case sap.ino.wall.TShirtSize.S :
                /* falls through */
            default :
                // first 3 items are always visible (b/i/u)
                for (i = 3; i < oEditorControls.length; i++) {
                    oEditorControls[i].toggleStyleClass("sapInoWallInvisible", true);
                }
                break;
            case sap.ino.wall.TShirtSize.M :
                // first 3 items are always visible
                // show (ff/fs)
                for (i = 3; i < 6; i++) {
                    oEditorControls[i].toggleStyleClass("sapInoWallInvisible", false);
                }
                // hide rest
                for (i = 6; i < oEditorControls.length; i++) {
                    oEditorControls[i].toggleStyleClass("sapInoWallInvisible", true);
                }
                break;
            case sap.ino.wall.TShirtSize.L :
            case sap.ino.wall.TShirtSize.XL :
                // first 3 items are always visible
                // show rest
                for (i = 3; i < oEditorControls.length; i++) {
                    oEditorControls[i].toggleStyleClass("sapInoWallInvisible", false);
                }
                break;
        }

        this._sPreviousSize = sSize;
    };

    /* =========================================================== */
    /* begin: internal methods */
    /* =========================================================== */

    /**
     * Checks if the control is already written to the DOM to allow for layout changes
     * 
     * @returns {this} this pointer for chaining
     * @private
     */
    sap.ino.wall.WallItemBase.prototype._isRendered = function() {
        if (this._bIsInDOM === undefined || this._bIsInDOM === 0) {
            this._bIsInDOM = jQuery.sap.byId(this.getId()).length;
        }

        return this._bIsInDOM;
    };

    /**
     * Returns the nicEdit instance for this control by querying the internal textarea
     * 
     * @returns {object} the nicEdit instance
     * @private
     */
    sap.ino.wall.TextEditor.prototype._getNicEditor = function() {
        return nicEditors.findEditor(this.getId() + "-nicContentTA"); // jshint ignore:line
    };

    /**
     * Activates out UI5 button control when the nicEdit event is thrown
     * 
     * @returns {object} the nicEdit instance
     * @private
     */
    sap.ino.wall.TextEditor.prototype._nicButtonActivate = function(oItem) {
        this._syncButtonState(oItem.name, true);
    };

    /**
     * Deactivates out UI5 button control when the nicEdit event is thrown
     * 
     * @returns {object} the nicEdit instance
     * @private
     */
    sap.ino.wall.TextEditor.prototype._nicButtonDeactivate = function(oItem) {
        this._syncButtonState(oItem.name, false);
    };

    /**
     * Activates out UI5 button control when the nicEdit event is thrown
     * 
     * @returns {object} the nicEdit instance
     * @private
     */
    sap.ino.wall.TextEditor.prototype._syncButtonState = function(sName, bToggled) {
        var oJustifyButton;

        switch (sName) {
            case "bold" :
                /* falls through */
            case "italic" :
                /* falls through */
            case "underline" :
                /* falls through */
            case "ol" :
                /* falls through */
            case "ul" :
                sap.ui.getCore().byId(this.getId() + "-" + sName).setPressed(bToggled);
                break;
            case "left" :
                if (bToggled) {
                    oJustifyButton = sap.ui.getCore().byId(this.getId() + "-justify");
                    oJustifyButton.setSelectedButton(oJustifyButton.getButtons()[0]);
                }
                break;
            case "center" :
                if (bToggled) {
                    oJustifyButton = sap.ui.getCore().byId(this.getId() + "-justify");
                    oJustifyButton.setSelectedButton(oJustifyButton.getButtons()[1]);
                }
                break;
            case "right" :
                if (bToggled) {
                    oJustifyButton = sap.ui.getCore().byId(this.getId() + "-justify");
                    oJustifyButton.setSelectedButton(oJustifyButton.getButtons()[2]);
                }
                break;
            default:
                break;
        }
    };

    /**
     * Checks if the value has changed and fires the control's change event.
     * 
     * @private
     */
    sap.ino.wall.TextEditor.prototype._fireChange = function(oEvent) {
        var oNicEditor = this._getNicEditor();
        if (oNicEditor) {
            var sEditorContent = this._cleanEditorContent(oNicEditor.getContent());
            if (sEditorContent != oNicEditor.getContent()) {
                oNicEditor.setContent(sEditorContent);
            }
            if (this.getValue() !== sEditorContent) {
                this.setProperty("value", sEditorContent, true);
                this.fireChange({
                    value : sEditorContent
                });
            }
        }
    };

    sap.ino.wall.TextEditor.prototype._cleanEditorContent = function(sEditorContent) {
        var iStartIndex = sEditorContent.indexOf("<!--StartFragment-->");
        if (iStartIndex >= 0) {
            var iEndIndex = sEditorContent.indexOf("<!--EndFragment-->");
            sEditorContent = sEditorContent.substring(iStartIndex + 20, iEndIndex >= 0 ? iEndIndex : undefined);
            sEditorContent = jQuery.trim(sEditorContent);
        }
        sEditorContent = sEditorContent.substring(0, 4000);
        return sEditorContent;
    };

    /**
     * Updates the color picker button and value of the current text selection.
     * 
     * @private
     */
    sap.ino.wall.TextEditor.prototype._setColor = function(sColor) {
        var fLuminance;

        // store internal color reference
        this._sTextColor = sColor;
        if (this._isRendered()) {
            // update text color
            this._getNicEditor().nicCommand("foreColor", sColor);
            // update button color
            sap.ui.getCore().byId(this.getId() + "-buttonColorSelector").$().find(".sapMBtnInner").css("background-color", sColor);
            // update color picker icon
            fLuminance = sap.ino.wall.util.Helper.getColorLuminance(sColor);
            // switch picker icon based on luminosity of the color
            if (fLuminance <= 0.6) {
                this._getButtonColorSelector().addStyleClass("sapInoWallWTextEditorColorSelectorButtonBright").removeStyleClass("sapInoWallWTextEditorColorSelectorButtonNormal");
            } else {
                this._getButtonColorSelector().addStyleClass("sapInoWallWTextEditorColorSelectorButtonNormal").removeStyleClass("sapInoWallWTextEditorColorSelectorButtonBright");
            }
        }
    };

    /**
     * Checks if the control is already written to the DOM to allow for layout changes
     * 
     * @returns {boolean} true if the control has been found in DOM, otherwise false
     * @private
     */
    sap.ino.wall.TextEditor.prototype._isRendered = function() {
        if (this._bIsInDOM === undefined || this._bIsInDOM === 0) {
            this._bIsInDOM = jQuery.sap.byId(this.getId()).length;
        }

        return this._bIsInDOM;
    };

    /**
     * Creates our own set of editor controls to have a UI5 look and feel for nicEdit.
     * 
     * @private
     * @returns {sap.ui.layout/HorizntalLayout} the editor controls wrapped inside a HorizontalLayout
     */
    sap.ino.wall.TextEditor.prototype._getEditorControls = function(oEvent) {
        var that = this, oControl = this.getAggregation("_editorControls");

        // pressing the buttons will instruct nicEdit to execute the corresponding DOM events:
        // Note: some of them might not work for all browsers that are supported by UI5
        // https://developer.mozilla.org/en-US/docs/Web/API/document.execCommand
        if (!oControl) {
            oControl = new sap.ui.layout.HorizontalLayout({
                allowWrapping : true,
                content : [new sap.m.ToggleButton(this.getId() + "-bold", {
                    press : function(oEvent) {
                        var $that = that.$(), oSelectedControl;

                        if (!sap.ino.wall.util.Helper.getTextSelection()) {
                            sap.ino.wall.util.Helper.selectAllText($that.find(".nicEdit-main")[0]);
                        } else {
                            oSelectedControl = jQuery(sap.ino.wall.util.Helper.getTextSelectionNode()).control(0);
                            if (oSelectedControl && oSelectedControl !== that) {
                                // when the selection is in another editor we do not do the action on this one
                                this.setPressed(!this.getPressed());
                                return;
                            }
                        }
                        that._getNicEditor().nicCommand("Bold");
                        // keep focus on keyboard events
                        setTimeout(function() {
                            if (this.__triggeredKeyEvent) {
                                this.focus();
                            }
                        }.bind(this), 0);
                    }
                }).addStyleClass("noflip").addStyleClass("nicEdit").addStyleClass("sapInoWallTextEditorControlButton").addStyleClass("sapInoWallTextEditorControlButtonBold").addEventDelegate({
                    onkeydown : function(oEvent) {
                        oEvent.srcControl.__triggeredKeyEvent = true;
                    }.bind(this),
                    onkeyup : function(oEvent) {
                        oEvent.srcControl.__triggeredKeyEvent = false;

                    },
                    onsapenter : function(oEvent) {
                        oEvent.preventDefault();
                        oEvent.stopPropagation();
                    }
                }), new sap.m.ToggleButton(this.getId() + "-italic", {
                    press : function(oEvent) {
                        var $that = that.$(), oSelectedControl;

                        if (!sap.ino.wall.util.Helper.getTextSelection()) {
                            sap.ino.wall.util.Helper.selectAllText($that.find(".nicEdit-main")[0]);
                        } else {
                            oSelectedControl = jQuery(sap.ino.wall.util.Helper.getTextSelectionNode()).control(0);
                            if (oSelectedControl && oSelectedControl !== that) {
                                // when the selection is in another editor we do not do the action on this one
                                this.setPressed(!this.getPressed());
                                return;
                            }
                        }
                        that._getNicEditor().nicCommand("Italic");
                        // keep focus on keyboard events
                        setTimeout(function() {
                            if (this.__triggeredKeyEvent) {
                                this.focus();
                            }
                        }.bind(this), 0);
                    }
                }).addStyleClass("noflip").addStyleClass("nicEdit").addStyleClass("sapInoWallTextEditorControlButton").addStyleClass("sapInoWallTextEditorControlButtonItalic").addEventDelegate({
                    onkeydown : function(oEvent) {
                        oEvent.srcControl.__triggeredKeyEvent = true;
                    }.bind(this),
                    onkeyup : function(oEvent) {
                        oEvent.srcControl.__triggeredKeyEvent = false;

                    },
                    onsapenter : function(oEvent) {
                        oEvent.preventDefault();
                        oEvent.stopPropagation();
                    }
                }), new sap.m.ToggleButton(this.getId() + "-underline", {
                    press : function(oEvent) {
                        var $that = that.$(), oSelectedControl;

                        if (!sap.ino.wall.util.Helper.getTextSelection()) {
                            sap.ino.wall.util.Helper.selectAllText($that.find(".nicEdit-main")[0]);
                        } else {
                            oSelectedControl = jQuery(sap.ino.wall.util.Helper.getTextSelectionNode()).control(0);
                            if (oSelectedControl && oSelectedControl !== that) {
                                // when the selection is in another editor we do not do the action on this one
                                this.setPressed(!this.getPressed());
                                return;
                            }
                        }
                        that._getNicEditor().nicCommand("Underline");
                        // keep focus on keyboard events
                        setTimeout(function() {
                            if (this.__triggeredKeyEvent) {
                                this.focus();
                            }
                        }.bind(this), 0);
                    }
                }).addStyleClass("noflip").addStyleClass("nicEdit").addStyleClass("sapInoWallTextEditorControlButton").addStyleClass("sapInoWallTextEditorControlButtonUnderline").addEventDelegate({
                    onkeydown : function(oEvent) {
                        oEvent.srcControl.__triggeredKeyEvent = true;
                    }.bind(this),
                    onkeyup : function(oEvent) {
                        oEvent.srcControl.__triggeredKeyEvent = false;

                    },
                    onsapenter : function(oEvent) {
                        oEvent.preventDefault();
                        oEvent.stopPropagation();
                    }
                }), this._getButtonColorSelector(), new sap.m.Select(this.getId() + "-face", {
                    width : "130px",
                    items : [new sap.ui.core.Item({
                        key : "",
                        text : this._oRB.getText("WALL_TEXTEDITOR_FAMILY_SELECT")
                    }), new sap.ui.core.Item({
                        key : "arial",
                        text : this._oRB.getText("WALL_TEXTEDITOR_FLD_FONT_ARIAL")
                    }), new sap.ui.core.Item({
                        key : "comic sans ms",
                        text : this._oRB.getText("WALL_TEXTEDITOR_FLD_FONT_COMIC")
                    }), new sap.ui.core.Item({
                        key : "courier new",
                        text : this._oRB.getText("WALL_TEXTEDITOR_FLD_FONT_COURIER")
                    }), new sap.ui.core.Item({
                        key : "geogria",
                        text : this._oRB.getText("WALL_TEXTEDITOR_FLD_FONT_GEORGIA")
                    }), new sap.ui.core.Item({
                        key : "helvetica",
                        text : this._oRB.getText("WALL_TEXTEDITOR_FLD_FONT_HELVETICA")
                    }), new sap.ui.core.Item({
                        key : "impact",
                        text : this._oRB.getText("WALL_TEXTEDITOR_FLD_FONT_IMPACT")
                    }), new sap.ui.core.Item({
                        key : "times new roman",
                        text : this._oRB.getText("WALL_TEXTEDITOR_FLD_FONT_TIMES")
                    }), new sap.ui.core.Item({
                        key : "trebuchet ms",
                        text : this._oRB.getText("WALL_TEXTEDITOR_FLD_FONT_TREBUCHET")
                    }), new sap.ui.core.Item({
                        key : "verdana",
                        text : this._oRB.getText("WALL_TEXTEDITOR_FLD_FONT_VERDANA")
                    })],
                    change : function(oEvent) {
                        var oItem = oEvent.getParameter("selectedItem"), $that = that.$(), oSelectedControl;

                        if (!sap.ino.wall.util.Helper.getTextSelection()) {
                            sap.ino.wall.util.Helper.selectAllText($that.find(".nicEdit-main")[0]);
                        } else {
                            oSelectedControl = jQuery(sap.ino.wall.util.Helper.getTextSelectionNode()).control(0);
                            if (oSelectedControl && oSelectedControl !== that) {
                                return;
                            }
                        }
                        if (oItem.getKey() !== "") {
                            that._getNicEditor().nicCommand("fontname", oItem.getKey());
                        }
                        // keep focus on keyboard events
                        setTimeout(function() {
                            if (this.__triggeredKeyEvent) {
                                this.focus();
                            }
                        }.bind(this), 0);
                    }
                }).addStyleClass("noflip").addStyleClass("sapInoWallWIBSelect").addStyleClass("nicEdit").addStyleClass("sapInoWallTextEditorControlSelect").addEventDelegate({
                    onkeydown : function(oEvent) {
                        oEvent.srcControl.__triggeredKeyEvent = true;
                    }.bind(this),
                    onkeyup : function(oEvent) {
                        oEvent.srcControl.__triggeredKeyEvent = false;

                    },
                    onsapenter : function(oEvent) {
                        oEvent.preventDefault();
                        oEvent.stopPropagation();
                    }
                }), new sap.m.Select(this.getId() + "-size", {
                    width : "130px",
                    items : [new sap.ui.core.Item({
                        key : "",
                        text : this._oRB.getText("WALL_TEXTEDITOR_SIZE_SELECT")
                    }), new sap.ui.core.Item({
                        key : "2",
                        text : this._oRB.getText("WALL_ITEMHEADLINE_SIZE_H6")
                    }), new sap.ui.core.Item({
                        key : "3",
                        text : this._oRB.getText("WALL_ITEMHEADLINE_SIZE_H5")
                    }), new sap.ui.core.Item({
                        key : "4",
                        text : this._oRB.getText("WALL_ITEMHEADLINE_SIZE_H4")
                    }), new sap.ui.core.Item({
                        key : "5",
                        text : this._oRB.getText("WALL_ITEMHEADLINE_SIZE_H3")
                    }), new sap.ui.core.Item({
                        key : "6",
                        text : this._oRB.getText("WALL_ITEMHEADLINE_SIZE_H2")
                    }), new sap.ui.core.Item({
                        key : "7",
                        text : this._oRB.getText("WALL_ITEMHEADLINE_SIZE_H1")
                    })],
                    change : function(oEvent) {
                        var oItem = oEvent.getParameter("selectedItem"), $that = that.$(), oSelectedControl;

                        if (!sap.ino.wall.util.Helper.getTextSelection()) {
                            sap.ino.wall.util.Helper.selectAllText($that.find(".nicEdit-main")[0]);
                        } else {
                            oSelectedControl = jQuery(sap.ino.wall.util.Helper.getTextSelectionNode()).control(0);
                            if (oSelectedControl && oSelectedControl !== that) {
                                return;
                            }
                        }

                        if (oItem.getKey() !== "") {
                            that._getNicEditor().nicCommand("fontsize", oItem.getKey());
                        }
                        // keep focus on keyboard events
                        setTimeout(function() {
                            if (this.__triggeredKeyEvent) {
                                this.focus();
                            }
                        }.bind(this), 0);
                    }
                }).addStyleClass("noflip").addStyleClass("sapInoWallWIBSelect").addStyleClass("nicEdit").addStyleClass("sapInoWallTextEditorControlSelect").addEventDelegate({
                    onkeydown : function(oEvent) {
                        oEvent.srcControl.__triggeredKeyEvent = true;
                    }.bind(this),
                    onkeyup : function(oEvent) {
                        oEvent.srcControl.__triggeredKeyEvent = false;

                    },
                    onsapenter : function(oEvent) {
                        oEvent.preventDefault();
                        oEvent.stopPropagation();
                    }
                }), new sap.m.SegmentedButton(this.getId() + "-justify", {
                    buttons : [new sap.m.Button(), new sap.m.Button(), new sap.m.Button()],
                    select : function(oEvent) {
                        var oSelectedButton = oEvent.getParameter("button"), aButtons = oEvent.getSource().getButtons(), $that = that.$(), oSelectedControl;

                        if (!sap.ino.wall.util.Helper.getTextSelection()) {
                            sap.ino.wall.util.Helper.selectAllText($that.find(".nicEdit-main")[0]);
                        } else {
                            oSelectedControl = jQuery(sap.ino.wall.util.Helper.getTextSelectionNode()).control(0);
                            if (oSelectedControl && oSelectedControl !== that) {
                                return;
                            }
                        }

                        if (oSelectedButton === aButtons[0]) {
                            that._getNicEditor().nicCommand("justifyleft");
                        } else if (oSelectedButton === aButtons[1]) {
                            that._getNicEditor().nicCommand("justifycenter");
                        } else if (oSelectedButton === aButtons[2]) {
                            that._getNicEditor().nicCommand("justifyright");
                        }
                        // keep focus on keyboard events
                        setTimeout(function() {
                            if (this.__triggeredKeyEvent) {
                                oSelectedButton.focus();
                            }
                        }.bind(this), 0);
                    }
                }).addStyleClass("noflip").addStyleClass("nicEdit").addStyleClass("sapInoWallTextEditorControlButton").addStyleClass("sapInoWallTextEditorControlButtonAlignment").addEventDelegate({
                    onkeydown : function(oEvent) {
                        oEvent.srcControl.__triggeredKeyEvent = true;
                    }.bind(this),
                    onkeyup : function(oEvent) {
                        oEvent.srcControl.__triggeredKeyEvent = false;

                    },
                    onsapenter : function(oEvent) {
                        oEvent.preventDefault();
                        oEvent.stopPropagation();
                    }
                }), new sap.m.ToggleButton(this.getId() + "-ol", {
                    press : function(oEvent) {
                        var $that = that.$(), oSelectedControl;

                        if (!sap.ino.wall.util.Helper.getTextSelection()) {
                            sap.ino.wall.util.Helper.selectAllText($that.find(".nicEdit-main")[0]);
                        } else {
                            oSelectedControl = jQuery(sap.ino.wall.util.Helper.getTextSelectionNode()).control(0);
                            if (oSelectedControl && oSelectedControl !== that) {
                                this.setPressed(!this.getPressed());
                                return;
                            }
                        }
                        sap.ui.getCore().byId(that.getId() + "-ul").setPressed(false);
                        that._getNicEditor().nicCommand("insertorderedlist");
                        // keep focus on keyboard events
                        setTimeout(function() {
                            if (this.__triggeredKeyEvent) {
                                this.focus();
                            }
                        }.bind(this), 0);
                    }
                }).addStyleClass("noflip").addStyleClass("nicEdit").addStyleClass("sapInoWallTextEditorControlButton").addStyleClass("sapInoWallTextEditorControlButtonOl").addEventDelegate({
                    onkeydown : function(oEvent) {
                        oEvent.srcControl.__triggeredKeyEvent = true;
                    }.bind(this),
                    onkeyup : function(oEvent) {
                        oEvent.srcControl.__triggeredKeyEvent = false;

                    },
                    onsapenter : function(oEvent) {
                        oEvent.preventDefault();
                        oEvent.stopPropagation();
                    }
                }), new sap.m.ToggleButton(this.getId() + "-ul", {
                    press : function(oEvent) {
                        var $that = that.$(), oSelectedControl;

                        if (!sap.ino.wall.util.Helper.getTextSelection()) {
                            sap.ino.wall.util.Helper.selectAllText($that.find(".nicEdit-main")[0]);
                        } else {
                            oSelectedControl = jQuery(sap.ino.wall.util.Helper.getTextSelectionNode()).control(0);
                            if (oSelectedControl && oSelectedControl !== that) {
                                this.setPressed(!this.getPressed());
                                return;
                            }
                        }
                        sap.ui.getCore().byId(that.getId() + "-ol").setPressed(false);
                        that._getNicEditor().nicCommand("insertunorderedlist");
                        // keep focus on keyboard events
                        setTimeout(function() {
                            if (this.__triggeredKeyEvent) {
                                this.focus();
                            }
                        }.bind(this), 0);
                    }
                }).addStyleClass("noflip").addStyleClass("nicEdit").addStyleClass("sapInoWallTextEditorControlButton").addStyleClass("sapInoWallTextEditorControlButtonUl").addEventDelegate({
                    onkeydown : function(oEvent) {
                        oEvent.srcControl.__triggeredKeyEvent = true;
                    }.bind(this),
                    onkeyup : function(oEvent) {
                        oEvent.srcControl.__triggeredKeyEvent = false;

                    },
                    onsapenter : function(oEvent) {
                        oEvent.preventDefault();
                        oEvent.stopPropagation();
                    }
                })]
            }).addStyleClass("noflip");

            // suppress default (textArea should not loose focus)
            oControl.addEventDelegate({
                "onmousedown" : function(oEvent) {
                    oEvent.preventDefault();
                    return false;
                }
            });

            this.setAggregation("_editorControls", oControl, true);
        }

        return oControl;
    };

    /**
     * Lazy initialization of an internal control
     * 
     * @private
     * @returns {ColorPicker} the button
     */
    sap.ino.wall.TextEditor.prototype._getColorPicker = function() {
        var that = this, oControl = this.getAggregation("_colorPicker");

        if (!oControl) {
            // create control
            oControl = new sap.ino.wall.ColorPicker(this.getId() + "-colorPicker", {
                color : that._sTextColor,
                change : function(oEvent) {
                    var $that = that.$(), oFocus = jQuery(":focus"), oSelectedControl;

                    if (!sap.ino.wall.util.Helper.getTextSelection()) {
                        sap.ino.wall.util.Helper.selectAllText($that.find(".nicEdit-main")[0]);
                    } else {
                        oSelectedControl = jQuery(sap.ino.wall.util.Helper.getTextSelectionNode()).control(0);
                        if (oSelectedControl && oSelectedControl !== that) {
                            // when the selection is in another editor we do not do the action on this one
                            return;
                        }
                    }
                    that._setColor(oEvent.getParameter("color"));
                    oFocus.focus();
                }
            }).addStyleClass("nicEdit");

            // set hidden aggregation without rerendering
            this.setAggregation("_colorPicker", oControl, true);
        }

        return oControl;
    };

    /**
     * Lazy initialization of an internal control.
     * 
     * @private
     * @returns {sap.m/Button} the button
     */
    sap.ino.wall.TextEditor.prototype._getButtonColorSelector = function() {
        var that = this, sRandomColor, oControl = this._buttonColorSelector;

        if (!oControl) {
            // create control
            oControl = new sap.m.Button(this.getId() + "-buttonColorSelector", {
                tooltip : this._oRB.getText("WALL_ITEMLINE_STATUSMSG_COLOR_SELECT"),
                press : function(oEvent) {
                    var oColorPicker = that._getColorPicker(), sRandomColor, $that = that.$();

                    if (oColorPicker.isOpen()) {
                        oColorPicker.close();
                    } else {
                        oColorPicker.openBy(oControl, 0, 0);

                        if (this.__triggeredKeyEvent) {
                            oColorPicker.focus();
                        }
                    }
                },
                icon : "sap-icon://palette"
            }).addStyleClass("noflip").addStyleClass("sapInoWallTextEditorControlButton").addStyleClass("sapInoWallTextEditorColorSelectorButton").addEventDelegate({
                onkeydown : function(oEvent) {
                    oEvent.srcControl.__triggeredKeyEvent = true;
                },
                onkeyup : function(oEvent) {
                    oEvent.srcControl.__triggeredKeyEvent = false;
                },
                onsapenter : function(oEvent) {
                    oEvent.preventDefault();
                    oEvent.stopPropagation();
                }
            });

            // create initial random color
            sRandomColor = sap.ino.wall.util.Helper.createRandomHexColor();
            that._setColor(sRandomColor);

            // set hidden aggregation without rerendering
            this._buttonColorSelector = oControl;
        }

        return oControl;
    };

})();