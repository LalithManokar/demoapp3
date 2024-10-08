/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/m/TextArea",
    "sap/m/Toolbar",
    "sap/m/ToolbarDesign",
    "sap/ui/core/IconPool",
    "sap/m/ToggleButton",
    "sap/m/Dialog",
    "sap/m/InputBase",
    "sap/ui/core/ResizeHandler",
	"sap/base/security/sanitizeHTML"
], function(Control, TextArea, Toolbar, ToolbarDesign, IconPool, Button, Dialog, InputBase, ResizeHandler, sanitizeHTML) {
    "use strict";

    /**
     * Constructor for a rich text editor that also works on mobile. It contains only basic rich text editing
     * capabilities like: bold, underline, italic and bullet and number lists.
     * <ul>
     * <li>Properties
     * <ul>
     * <li>dialogTitle: Title that is shown when the editor is shown full screen in a dialog mode</li>
     * <li>editable: value is editable</li>
     * <li>enabled: editor is enabled (= part of tab chain)</li>
     * <li>height: height of the editor</li>
     * <li>maxHeight: Maximal height of the editor</li>
     * <li>openInDialog: Tapping on the editor will open it in a fullscreen dialog</li>
     * <li>showToolbar: Toolbar with editor buttons is shown</li>
     * <li>showValueStateMessage: Value state message should be shown</li>
     * <li>value: HTML content</li>
     * <li>valueState: Value state</li>
     * <li>valueStateText: Text describing the value state</li>
     * <li>width: Width</li>
     * <li>Events
     * <ul>
     * <li>change: Editor value has changed (when focus is left or dialog is closed)</li>
     * </ul>
     * </li>
     * </ul>
     *
     * @class
     * @extends sap.ui.core.Control
     * @version 2.0
     *
     * @constructor
     * @public
     * @name sap.ino.controls.MobileTextEditor
     */
    return Control.extend("sap.ino.controls.MobileTextEditor", {
        metadata: {
            properties: {
                dialogTitle: {
                    type: "string",
                    defaultValue: ""
                },
                editable: {
                    type: "boolean",
                    defaultValue: true
                },
                enabled: {
                    type: "boolean",
                    defaultValue: true
                },
                height: {
                    type: "sap.ui.core.CSSSize",
                    defaultValue : "100%"
                },
                minHeight: {
                    type: "sap.ui.core.CSSSize",
                    defaultValue : "1rem"
                },
                maxHeight: {
                    type: "sap.ui.core.CSSSize",
                    defaultValue : ""
                },
                openInDialog: {
                    type: "boolean",
                    defaultValue: false
                },
                showToolbar: {
                    type: "boolean",
                    defaultValue: true
                },
                showValueStateMessage: {
                    type: "boolean",
                    defaultValue: true
                },
                value: {
                    type: "string",
                    defaultValue: ""
                },
                valueState: {
                    type: "sap.ui.core.ValueState",
                    defaultValue: sap.ui.core.ValueState.None
                },
                valueStateText: {
                    type: "string",
                    defaultValue: null
                },
                width: {
                    type: "sap.ui.core.CSSSize",
                    defaultValue : "100%"
                }
            },
            aggregations: {
                "_editorControls": {
                    type: "sap.m.Toolbar",
                    multiple: false,
                    fitContainer: true,
                    visibility: "hidden"
                },
                "_dialog" : {
                    type: "sap.m.Dialog",
                    multiple: false,
                    visibility: "hidden"
                }
            },
            events : {
                change : {}
            }
        },

        /**
         * @private
         */
        init: function() {
            this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.controls");
            this._sResizeRegId = ResizeHandler.register(this, this._onResize);

        },

        /**
         * @private
         */
        exit: function() {
            ResizeHandler.deregister(this._sResizeRegId);
        },

        /**
         * @private
         */
        setValue : function(sValue) {
            this.setProperty("value", sValue, true);
            var oEditor = this._getNicEditor();
            if (!oEditor) {
                jQuery.sap.log.warning("NicEditor not found in method setValue",undefined,"sap.ino.controls.MobileTextEditor");
                return;
            }
            this._getNicEditor().setContent(sValue || "");
        },

        /**
         * @private
         */
        onAfterRendering: function() {
            this._recalculateHeight();

            // lazy loading
            jQuery.sap.require("sap.ino.thirdparty.nicEdit");

            this._oNicEditor = new nicEditor({ // jshint ignore:line
                buttonList: ["bold", "italic", "underline", "ol", "ul"]
            });

            if (this.getShowToolbar()) {
                this._oNicEditor.addEvent("buttonActivate", jQuery.proxy(this._nicButtonActivate, this));
                this._oNicEditor.addEvent("buttonDeactivate", jQuery.proxy(this._nicButtonDeactivate, this));
            }

            this._oNicEditor.setPanel(this.getId() + "-nicPanel");
            this._oNicEditor.panelInstance(this.getId() + "-nicContentTA");

            if (!(this.getEnabled() && this.getEditable())) {
                this.$().addClass("sapMInputBaseDisabled");
                this._getNicEditor().disable();
            } else {
                if (this.getShowToolbar()) {
                    this._oNicEditor.setPanel(this.getId() + "-editorControls");
                }
            }
        },

        /**
         * @private
         */
        _nicButtonActivate : function(oItem) {
            this._syncButtonState(oItem.name, true);
        },
        /**
         * @private
         */
        _nicButtonDeactivate : function(oItem) {
            this._syncButtonState(oItem.name, false);
        },

        /**
         * @private
         */
        _syncButtonState : function(sName, bToggled) {
            var oButton = sap.ui.getCore().byId(this.getId() + "-" + sName);
            oButton.setPressed(bToggled);
        },

        /**
         * @private
         * @override
         */
        focus : function() {
            var $this = this.$();
            if (!$this) {
                return;
            }
            // Make sure the caret is being displayed, so that typing can start
            jQuery.sap.focus($this.find('.nicEdit-main').first());
        },

        /**
         * @private
         */
        onfocusin : function() {
            this.openValueStateMessage();
        },

        /**
         * @private
         */
        onfocusout : function(oEvent) {
            var oEditor = this._getNicEditor();
            if (!oEditor) {
                return;
            }
            var sContent = oEditor.getContent();
            this.setProperty("value", sContent, true);
            this.closeValueStateMessage();
            if (this.getEditable()) {
                this.fireChange({
                    value : sContent
                });
            }
        },

        /**
         * @private
         */
        ontap : function(oEvent) {
            this._openInDialog();
        },


        /**
         * @private
         */
        ontouchmove : function(oEvent) {
            // mark the event such that scrolling on iOS is not prevented out
            // which is the default for popups
            // see incident 1472005153
            oEvent.setMarked();
        },


        /**
         * @private
         */
        _onResize: function(oEvent) {
            oEvent.control._recalculateHeight();
        },

        /**
         * @private
         */
        _getNicEditor : function() {
            return this._oNicEditor && this._oNicEditor.instanceById(this.getId() + "-nicContentTA");
        },


        /**
         * @private
         */
        _recalculateHeight: function() {
            var bIsOpenInDialog = this._bOpenInDialog;

            // When shown in dialog set the height to half of the screen so that
            // the device keyboard does not disturb entry
            if (bIsOpenInDialog && (!this.getHeight() || this.getHeight() === "100%")) {
                var aParents = this.$().parents(".sapMDialog");
                // 152 = size of toolbar and dialog header and footer
                var iHeight = (aParents[0].clientHeight - 152) / 2;
                // prevent any strange effects of very small screen sizes
                if (iHeight > 0) {
                    this.$().height(iHeight);
                }
            }
        },

        /**
         * @private
         */
        _openInDialog : function() {
            if (!this.getOpenInDialog() || this._bOpenInDialog === true) {
                return;
            }

            var oDialog = new Dialog({
                stretch : true,
                horizontalScrolling : false,
                verticalScrolling : true,
                showHeader : true,
                title : this.getDialogTitle(),
                beginButton: new Button({
                    text: this._oRB.getText("CTRL_MTE_DONE"),
                    press: function () {
                        oDialog.close();
                    }
                })
            });

            var oEditor = new this.constructor( {
                value : this.getValue(),
                editable : this.getEditable(),
                enabled : this.getEnabled()
            }).addStyleClass("sapInoMTEDialog");
            oEditor._bOpenInDialog = true;
            this.setAggregation("_dialog", oDialog);
            oDialog.addContent(oEditor);

            oDialog.attachAfterOpen(this._onOpenDialog, this);
            oDialog.attachAfterClose(this._onCloseDialog, this);
            oDialog.open();
        },

        /**
         * @private
         */
        _onCloseDialog: function(oEvent){
            var oDialog = oEvent.getSource();
            var sValue = oDialog.getContent()[0].getValue();
            this.setAggregation("_dialog", null);
            oDialog.destroy();
            this.setValue(sValue);
            if (this.getEditable()) {
                this.fireChange({
                    value : sValue
                });
            }
        },

        /**
         * @private
         */
        _onOpenDialog: function(oEvent){
            oEvent.getSource().getContent()[0].focus();
        },

        setValueStateText : function (sText) {
            this.setProperty("valueStateText", sText, true);
            return this;
        },

        setValueState : function(sValueState) {
            this.setProperty("valueState", sValueState, true);
            var $editor = this.$();
            if (!$editor) {
                return;
            }

            var $content = $editor.find(".sapInoMTEContent");
            $content.removeClass("sapMInputBaseErrorInner");
            $content.removeClass("sapMInputBaseSuccessInner");
            $content.removeClass("sapMInputBaseWarningInner");
            $content.removeClass("sapMInputBaseStateInner");

            var sStyleClass = this._getStyleClassForValueState();
            if (sStyleClass) {
                $content.addClass(sStyleClass);
                $content.addClass("sapMInputBaseStateInner");
            }
            return this;
        },

        /**
         * @private
         */
        _getStyleClassForValueState : function() {
            switch (this.getValueState()) {
                case (sap.ui.core.ValueState.Error) :
                    return "sapMInputBaseErrorInner";
                case (sap.ui.core.ValueState.Success) :
                    return "sapMInputBaseSuccessInner";
                case (sap.ui.core.ValueState.Warning) :
                    return "sapMInputBaseWarningInner";
            }
        },

        refreshDataState : InputBase.prototype.refreshDataState,
        propagateMessages : InputBase.prototype.propagateMessages,
        openValueStateMessage: InputBase.prototype.openValueStateMessage,
        closeValueStateMessage: InputBase.prototype.closeValueStateMessage,
        getDomRefForValueStateMessage : InputBase.prototype.getDomRefForValueStateMessage,

        /**
         * @private
         */
        _getEditorControls: function(oEvent) {
            var that = this;
            var oControl = this.getAggregation("_editorControls");
            if (!oControl) {
                oControl = new Toolbar({
                    design : ToolbarDesign.Solid,
                    content: [
                        new Button(this.getId() + "-bold", {
                            press: function(oEvent) {
                                that._getNicEditor().nicCommand("Bold");
                            },
                            text: "B"
                        }).addStyleClass("sapInoMTEButton").addStyleClass("sapInoMTEButtonBold"),
                        new Button(this.getId() + "-italic", {
                            press: function(oEvent) {
                                that._getNicEditor().nicCommand("Italic");
                            },
                            text: "I"
                        }).addStyleClass("sapInoMTEButton").addStyleClass("sapInoMTEButtonItalic"),
                        new Button(this.getId() + "-underline", {
                            press: function(oEvent) {
                                that._getNicEditor().nicCommand("Underline");
                            },
                            text: "U"
                        }).addStyleClass("sapInoMTEButton").addStyleClass("sapInoMTEButtonUnderline"),
                        new Button(this.getId() + "-ol", {
                            press: function(oEvent) {
                                that._getNicEditor().nicCommand("insertorderedlist");
                            },
                            icon: IconPool.getIconURI("multi-select")
                        }).addStyleClass("sapInoMTEButton"),
                        new Button(this.getId() + "-ul", {
                            press: function(oEvent) {
                                that._getNicEditor().nicCommand("insertunorderedlist");
                            },
                            icon: IconPool.getIconURI("menu")
                        }).addStyleClass("sapInoMTEButton")
                    ]
                });

                this.setAggregation("_editorControls", oControl, true);
            }
            return oControl;
        },

        /**
         * @private
         */
        renderer: function(oRM, oControl) {
            oRM.write("<div ");
            oRM.writeControlData(oControl);
            oRM.addClass("sapInoMTE");
            oRM.writeClasses();
            oRM.write(">");

            oRM.write("<div");
            oRM.writeAttribute("id", sanitizeHTML(oControl.getId()) + "-nicPanel");
            oRM.addClass("sapInoMTENicPanel");
            oRM.writeClasses();
            oRM.write("/>");

            // display our own editor controls instead of the ones from nicedit to have a UI5 look and feel
            if (oControl.getShowToolbar()) {
                oRM.write("<div");
                    oRM.writeAttribute("id", sanitizeHTML(oControl.getId()) + "-editorControls");
                    oRM.writeAttribute("role", "toolbar");
                    oRM.writeAttributeEscaped("aria-label", oControl._oRB.getText("CRTL_MTE_TOOLBAR_LABEL"));
                    oRM.addClass("sapInoMTEControls");
                    oRM.writeClasses();
                oRM.write(">");
                oRM.renderControl(oControl._getEditorControls());
                oRM.write("</div>");
            }

            oRM.write("<div");
            oRM.writeAttribute("id", sanitizeHTML(oControl.getId()) + "-nicContent");
            oRM.addClass("sapInoMTEContent");
            oRM.addClass("sapMInputBaseInner");
            oRM.addClass("sapMTextAreaInner");
            if (!(oControl.getEnabled() && oControl.getEditable())) {
                oRM.addClass("sapMInputBaseDisabledInner");
            }
            oRM.writeClasses();
            oRM.addStyle("width", sanitizeHTML(oControl.getWidth()));
            oRM.addStyle("height", sanitizeHTML(oControl.getHeight()));
            
            if (oControl.getMinHeight()) {
                oRM.addStyle("min-height", sanitizeHTML(oControl.getMinHeight()));
            }

            if (oControl.getMaxHeight()) {
                oRM.addStyle("max-height", sanitizeHTML(oControl.getMaxHeight()));
            }

            oRM.writeStyles();
            oRM.write(">");

            // render a dummy textarea that will be replaced with the rich text editor
            oRM.write("<textarea");
            oRM.writeAttribute("id", sanitizeHTML(oControl.getId()) + "-nicContentTA");
            oRM.addClass("sapInoMTEContent");
            oRM.addClass("sapMInputBaseInner");
            oRM.writeClasses();
            oRM.writeStyles();
            oRM.write(">");
            oRM.writeEscaped(oControl.getValue());
            oRM.write("</textarea>");

            oRM.write("</div>");
            oRM.write("</div>");
        }
    });
});