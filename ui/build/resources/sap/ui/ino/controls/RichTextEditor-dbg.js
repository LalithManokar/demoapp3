/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.RichTextEditor");
(function() {
    "use strict";

    jQuery.sap.require("sap.ui.richtexteditor.RichTextEditor");

    /**
     * Works like sap.ui.richtexteditor.RichTextEditor. It is enhanced with a Value State property so that we can show
     * any error state.
     * 
     * <ul>
     * <li>Properties
     * <ul>
     * <li>enabled: is editor enabled (currently not used, only for correspondence to other controls)</li>
     * </ul>
     * <ul>
     * <li>valueState: sap.ui.core.ValueState</li>
     * </ul>
     * </li>
     * </ul>
     * 
     * @see sap.ui.richtexteditor.RichTextEditor
     */

    sap.ui.richtexteditor.RichTextEditor.extend("sap.ui.ino.controls.RichTextEditor", {
        metadata : {
            properties : {
                "enabled" : {
                    type : "boolean",
                    defaultValue : true
                },
                "valueState" : {
                    type : "sap.ui.core.ValueState",
                    defaultValue : sap.ui.core.ValueState.None,
                    visibility : "hidden"
                }
            }
        },
        
        fireReady : function() {
        	if (typeof sap.ui.richtexteditor.RichTextEditor.prototype.fireReady === "function") {
        		sap.ui.richtexteditor.RichTextEditor.prototype.fireReady.apply(this, arguments);
        	}
        	
        	var that = this;
        	var $IFrame = this.$().find("iframe");

            if ($IFrame && $IFrame.length > 0) {
                $IFrame[0].contentDocument.addEventListener("click", function(oEvent) {
                	that._focusEvent(oEvent);
                });
                $IFrame[0].contentDocument.addEventListener("keyup", function(oEvent) {
                	that._focusEvent(oEvent);
                });                
            }
        },
        
        exit : function() {
        	if (typeof sap.ui.richtexteditor.RichTextEditor.prototype.exit === "function") {
        		sap.ui.richtexteditor.RichTextEditor.prototype.exit.apply(this, arguments);
        	}
        	
        	var that = this;
        	var $IFrame = this.$().find("iframe");

            if ($IFrame && $IFrame.length > 0) {
                $IFrame[0].contentDocument.removeEventListener("click", function(oEvent) {
                    that._focusEvent(oEvent);
                });
                $IFrame[0].contentDocument.removeEventListener("keyup", function(oEvent) {
                	that._focusEvent(oEvent);
                });                
            }
        },
        
        _focusEvent : function(oEvent) {

            var $this = this.$();

            if ($this && $this.length > 0) {
                var oThis = $this[0];
                // <control>.toggle("<class>"); => not supported by IE9
                var regExpRTE = new RegExp('(\\s|^)sapUiInoRTEHasFocus(\\s|$)');
                if (!oThis.className.match(regExpRTE)) {
                	oThis.className += " sapUiInoRTEHasFocus";
                }
            }
        },
        
        removeFocus : function(oEvent) {
        	var $this = this.$();

            if ($this && $this.length > 0) {
                var oThis = $this[0];
                // <control>.toggle("<class>"); => not supported by IE9
                var regExpRTE = new RegExp('(\\s|^)sapUiInoRTEHasFocus(\\s|$)');
                if (oThis.className.match(regExpRTE)) {
                	oThis.className = oThis.className.replace(regExpRTE, ' ');
                	oThis.className = oThis.className.replace('  ', ' ');
                	return true;
                }
            }
            return false;
        },
                
        setValueState : function(sValueState) {
            this.setProperty("valueState", sValueState);
            
            this.$().removeClass("sapUiTfErr");
            this.$().removeClass("sapUiTfSucc");
            this.$().removeClass("sapUiTfWarn");
            
            var sStyleClass = this.getStyleClassForValueState();
            if (sStyleClass) {
                this.$().addClass(sStyleClass);
            } 
        },
        
        getValueState : function() {
            return this.getProperty("valueState");
        },
        
        getStyleClassForValueState : function() {
            switch (this.getValueState()) {
                case (sap.ui.core.ValueState.Error) :
                    return "sapUiTfErr";
                case (sap.ui.core.ValueState.Success) :
                    return "sapUiTfSucc";
                case (sap.ui.core.ValueState.Warning) :
                    return "sapUiTfWarn";
            }
        },
        
        onAfterRendering : function() {
            if (sap.ui.richtexteditor.RichTextEditor.prototype.onAfterRendering) {
                sap.ui.richtexteditor.RichTextEditor.prototype.onAfterRendering.apply(this, arguments);
            }
            var sStyleClass = this.getStyleClassForValueState();
            if (sStyleClass) {
                this.$().addClass(sStyleClass);
            }            
        },
        
        renderer : "sap.ui.richtexteditor.RichTextEditorRenderer"

    });

})();