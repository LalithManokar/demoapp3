/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/m/ToggleButton",
    "sap/m/Input"
], function(Control,ToggleButton, Input) {
    "use strict";

    /**
     * Constructor for a new lightweight colorPicker.
     *
     * <ul>
     * <li>Properties
     * <ul>
     * <li>color: This is the import-parameter of the ColorPicker.
     * As input-parameter, it can be a Hexadecimal string (#FFFFFF), or just a String without the "#" (FFFFFF)
     * As output-parameter it is a Hexadecimal string (FFFFFF) without "#".
     * </li>
     * <li>valueStateText: This text is displayed below the input field if the input is invalid. Default is null
     * </li>
     * <li>showValueStateMessage: Boolean property that states whether a valueStateText is displayed or not. Default is true </li>
     * <li>defaultColors: Here the colors for the buttons are put in. The amount of buttons is equal to the amount of put in color strings.
     * As input-parameter, it takes a Array of Strings. defaultColors="#ffffff,f0ab00, f27020, e52929, ab218e, 009de0, 007cc0, 004990, 73bf93,008a3b,#bfbfbf, #777777"
     * </li>
     * <li>preview: Boolean property that states whether a preview of the current color is displayed beside the input field or not. Default is true </li>
     * <li>showHex: Boolean proerty that states if the hex input field should be shown (overrules the preview property)</li>
     * </ul>
     * <li>Events
     * <ul>
     * <li>change: Color has been changed. Value was changed. This event is fired if the value has changed.</li>
     * </ul>
     * </li>
     * </ul>
     */
     
    var ColorPicker = Control.extend("sap.ino.controls.ColorPickerLite", {
            metadata: {
                properties: {
                    color: {
                        type: "string",
                        defaultValue: "FFFFFF"
                    },
                    valueStateText: {
                        type: "string",
                        defaultValue: null
                    },
                    showValueStateMessage  : {
                        type: "boolean",
                        defaultValue: true
                    },
                    defaultColors : {
                        type: "string[]",
                        defaultValue: ["#ffffff", "f0ab00", "f27020", "e52929", "ab218e", "009de0", "007cc0", "004990", "73bf93", "008a3b", "#bfbfbf", "#777777"]
                    },
                    preview : {
                        type: "boolean",
                        defaultValue: true
                    },
                    showHex : {
                        type: "boolean",
                        defaultValue: true
                    }
                },
                aggregations: {
                    "_colorButtons" : {
                        type : "sap.m.ToggleButton",
			            multiple: true,
			            visibility: "hidden"
                    },
                    "_input" : {
                       type : "sap.m.Input",
			           multiple: false,
			           visibility: "hidden" 
                    }
                },
                events: {
                    change: {}
                }
            },
            
            _getButtons : function() {
                var aButtons = this.getAggregation("_colorButtons");

                if(!aButtons || aButtons.length === 0) {
                    var that = this;
                    aButtons = [];
                    for(var i = 0; i < this.getDefaultColors().length; i++) {
                        var oButton = new ToggleButton({
                            customData: {
                                Type:"sap.ui.core.CustomData",
                                key:"button-color",
                                value: that._cleanColor(this.getDefaultColors()[i].trim())
                            },
                            press : function(oEvent) {
                                that._onPress(oEvent.getSource().data("button-color"));
                            }
                        });
                        oButton.addStyleClass("sapInoColorPickerColorButton");
                        this.addAggregation("_colorButtons", oButton);
                    }
                    aButtons = this.getAggregation("_colorButtons");
                }
		        return aButtons;
            },
            
            _getInput : function () {
                var oInput = this.getAggregation("_input");
                if(!oInput) {
                    var that = this;
                    oInput = new Input({
                        valueStateText : this.getValueStateText(),
                        maxLength : 7,
                        showValueStateMessage : this.getShowValueStateMessage(),
                        liveChange : function (oEvent) {
                            that._setCurrentColor(oEvent.getParameter("newValue"), false, false);
                        },
                        change : function (oEvent) {
                            var sValue = oEvent.getParameter("newValue");
                            that._setCurrentColor(sValue, false, true);
                            sValue = that._cleanColor(sValue);
                            that.fireChange({
                                value : sValue,
                                hashValue : "#" + sValue
                            });
                        }
                    });
                    this.setAggregation("_input", oInput, true);
                }
                return oInput;
            },
            
            _setCurrentColor : function (sValue, bUpdateInput, bSetProperty ) {
                if(this._validateLiveInput(sValue)) {
                    if (/(^[0-9A-F]{6}$)|(^[0-9A-F]{3}$)/i.test(sValue)) {
                        this._setColor(sValue, bUpdateInput, bSetProperty);
                    } else if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(sValue)){
                        this._setColor(sValue.substr(1), bUpdateInput, bSetProperty);
                    } else if(bSetProperty){
                        this._getInput.setValueState("Error");    
                    }
                }
            },
            
            _setColor : function(sValue, bUpdateInput, bSetProperty  ) {
                jQuery(".sapInoColorPickerLitePreview").css("background", "#" + sValue);
                if(bUpdateInput) {
                    this._getInput().setValue("#" + sValue);    
                }
                if(bSetProperty) {
                   this.setProperty("color", sValue, true); 
                }
            },
        
            _validateLiveInput : function (sValue) {
                if (/(^[0-9A-F]{0,6}$)/i.test(sValue)) {
                   this._getInput().setValueState("None");
                   return true;
                }
                if (/(^#[0-9A-F]{0,7}$)/i.test(sValue)){
                   this._getInput().setValueState("None");
                   return true;
                } 
                this._getInput().setValueState("Error");
                return false;
            },
            
            _onPress : function(sColor) {
                var aButtons = this.getAggregation("_colorButtons");
                aButtons.forEach(function(oButton) {
                    oButton.setPressed(oButton.data("button-color") === sColor);
                });
                this._setCurrentColor(sColor, true, true);
                sColor = this._cleanColor(sColor);
                this.fireChange({
                    value : sColor,
                    hashValue : "#" + sColor
                });
            },
            
            _cleanColor : function (sColor) {
                if (sColor && sColor.substr(0, 1) === '#') {
                    sColor = sColor.substr(1);
                }
                return sColor.toUpperCase();
            },
            
            renderer: function (oRm, oControl) {
                // write the HTML into the render manager
                oRm.write("<div");   // Outer DIV
                oRm.writeControlData(oControl);
                oRm.addClass("sapInoColorPickerLite");
                oRm.writeClasses("");
                oRm.write(">"); // <DIV> element
                
                oRm.write("<div");   // Button Div
                oRm.addClass("sapInoColorPickerLiteButtonContainer");
                oRm.writeClasses("");
                oRm.write(">");
                oControl._getButtons().forEach(function (oButton) {
                   oRm.renderControl(oButton); 
                });
                oRm.write("</div>");  // Button Div
                
                if (oControl.getShowHex()) {
                    oRm.write("<div");   //Preview Input div
                    oRm.addClass("sapInoColorPickerLitePreviewInput");
                    oRm.writeClasses("");
                    oRm.write(">");
                    
                    if(oControl.getPreview()) {
                        oRm.write("<div"); //Preview
                        oRm.addClass("sapInoColorPickerLitePreview");
                        oRm.writeClasses("");
                        oRm.write(">");
                        oRm.write("</div>"); //Preview    
                    }
    
                    oRm.renderControl(oControl._getInput());
                    
                    oRm.write("</div>");  //Preview Input div
                }
                
                oRm.write("</div>");  // outer DIV
            }
        }
    );
    
    ColorPicker.prototype.onAfterRendering = function() {
        //Set the Color for input and preview
        var color = this._cleanColor(this.getColor());
        this._setCurrentColor(color, true, true);
        
        //Set the colors for the togglebuttons
        var aButtons = this.getAggregation("_colorButtons");
        for(var i = 0; i < aButtons.length; i++) {
            jQuery(aButtons[i].getDomRef().children[0]).css("background", "#" + aButtons[i].data("button-color"));
            jQuery(aButtons[i].getDomRef().children[0]).attr("aria-label", "#" + aButtons[i].data("button-color"));
            jQuery(aButtons[i].getDomRef().children[0]).attr("title", "#" + aButtons[i].data("button-color"));
            
            // set the button selected for the current value
            aButtons[i].setPressed(aButtons[i].data("button-color") === color);
        }
        
    };

    return ColorPicker;
});