/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
	"sap/ui/richtexteditor/RichTextEditor",
	'sap/ui/core/Popup'
], function (RichTextEditor, Popup) {
	"use strict";
	
	/**
	 * 
	 * Works like sap.ui.richtexteditor.RichTextEditor. It is enhanced with a
	 * Value State property so that we can show any error state.
	 * 
	 * <ul>
	 * <li>Properties
	 * <ul>
	 * <li>enabled: is editor enabled (currently not used, only for
	 * correspondence to other controls)</li>
	 * </ul>
	 * <ul>
	 * <li>valueState: sap.ui.core.ValueState</li>
	 * </ul>
	 * </li>
	 * </ul>
	 */
     
	return RichTextEditor.extend("sap.ino.controls.RichTextEditor", {
	    
        metadata : {
            properties : {
                "valueState" : {
                    type : "sap.ui.core.ValueState",
                    defaultValue : sap.ui.core.ValueState.None
                },
                "valueStateText" : {
                    type: "string",
                    defaultValue: null
                }
            }
        },
        
        exit : function() {
            if ( this._popup ){
                this._popup.destroy();
                this._popup = null;
    		}
        },
        
        refreshDataState : function (sName, oDataState) {
            if (sName === "value") {
                this.propagateMessages(sName, oDataState.getMessages());
            }
        },
        
        propagateMessages : function(sName, aMessages) {
            if (aMessages && aMessages.length > 0) {
                this.setValueState(aMessages[0].type);
                this.setValueStateText(aMessages[0].message);
            } else {
                this.setValueState(sap.ui.core.ValueState.None);
                this.setValueStateText('');
                this.closeValueStateMessage();
            }
        },
    	
        setValueStateText : function (sText) {
		    this.setProperty("valueStateText", sText, true);
		    this.$("message-text").text( this.getValueStateText() );
		    return this;
        },
	    
        setValueState : function(sValueState) {
            this.setProperty("valueState", sValueState, true);
            var $rte = this.$();
            if($rte) {
                $rte.removeClass("sapUiInoRteTfErr");
                $rte.removeClass("sapUiInoRteTfSucc");
                $rte.removeClass("sapUiInoRteTfWarn");
                
                var sStyleClass = this._getStyleClassForValueState();
                if (sStyleClass) {
                    $rte.addClass(sStyleClass);
                } 
            }
        },
        
        _getStyleClassForValueState : function() {
            switch (this.getValueState()) {
                case (sap.ui.core.ValueState.Error) :
                    return "sapUiInoRteTfErr";
                case (sap.ui.core.ValueState.Success) :
                    return "sapUiInoRteTfSucc";
                case (sap.ui.core.ValueState.Warning) :
                    return "sapUiInoRteTfWarn";
            }
        },
        
		getDomRefForValueStateMessage : function(){
		    return this.getFocusDomRef();
	    },
	    
		closeValueStateMessage : function (){
            if (this._popup) {
                this._popup.close();
            }
            var $Input = jQuery(this.getFocusDomRef());
            $Input.removeAriaDescribedBy(this.getId() + "-message");
	    },
    
        openValueStateMessage : function () {
            var sState = this.getValueState();
            
            if (this.getEditable()) {
            
            	// get value state text
            	var sText = this.getValueStateText();
            	if (!sText) {
            		sText = sap.ui.core.ValueStateSupport.getAdditionalText(this);
            	}
            
            	if (!sText) {
            		return;
            	}
            
            	// create message popup
            	var sMessageId = this.getId() + "-message";
            	if (!this._popup) {
            	    
               	    this._popup = new Popup(jQuery("<span></span>")[0] /*Just some dummy */, false, false, false);
            		this._popup.attachClosed(function () {
            			jQuery.sap.byId(sMessageId).remove();
            		});
            	}
            
            	var $Input = jQuery(this.getFocusDomRef());
     			var mDock = Popup.Dock;
     			var bIsRightAligned = $Input.css("text-align") === "right";
            
            	var sClass = "sapMValueStateMessage sapMValueStateMessage" + sState;
            	var sTextClass = "sapMInputBaseMessageText";
            	var oRB = sap.ui.getCore().getLibraryResourceBundle("sap.m");
            	if (sState === sap.ui.core.ValueState.Success) {
            		sClass = "sapUiInvisibleText";
            		sText = "";
            	}
            
            	var $Content = jQuery("<div>", {
            		"id": sMessageId,
            		"class": sClass,
            		"role": "tooltip",
            		"aria-live": "assertive"
            	}).append(
            		jQuery("<span>", {
            			"aria-hidden": true,
            			"class": "sapUiHidden",
            			"text": oRB.getText("INPUTBASE_VALUE_STATE_" + sState.toUpperCase())
            		})
            	).append(
            		jQuery("<span>", {
            			"id": sMessageId + "-text",
            			"class": sTextClass,
            			"text": sText
            		})
            	);
            
            	this._popup.setContent($Content[0]);
            
                this._popup.close(0);
                var that = this;
                this._popup.open(
            		200,
    				bIsRightAligned ? mDock.EndTop : mDock.BeginTop,
    				bIsRightAligned ? mDock.EndBottom : mDock.BeginBottom,
            		this.getDomRefForValueStateMessage(),
            		"0 4",
            		null,
            		function() {
            			that._popup.close();
                    }
            	);
            	
            	// Check whether popup is below or above the input
            	if ($Input.offset().top < this._popup._$().offset().top) {
            		this._popup._$().addClass("sapMInputBaseMessageBottom");
            	} else {
            		this._popup._$().addClass("sapMInputBaseMessageTop");
            	}
            
            	$Input.addAriaDescribedBy(sMessageId);
            }
        },
        
        renderer : "sap.ui.richtexteditor.RichTextEditorRenderer",
    	
		onfocusin : function(oEvent) {
    		// iE10+ fires the input event when an input field with a native
			// placeholder is focused
    		this._bIgnoreNextInput = !this.bShowLabelAsPlaceholder &&
    									sap.ui.Device.browser.msie &&
    									sap.ui.Device.browser.version > 9 &&
    									(jQuery.type(this.getPlaceholder) === "function" && !!this.getPlaceholder()) &&
    									!this._getInputValue();
    
    		this.$().toggleClass("sapMFocus", true);
    		if (sap.ui.Device.support.touch) {
    			// listen to all touch events
    			jQuery(document).on('touchstart.sapMIBtouchstart', jQuery.proxy(this._touchstartHandler, this));
    		}
    
    		// open value state message popup when focus is in the input
    		this.openValueStateMessage();
    	},
    	
    	onfocusout : function(oEvent) {
    		this.$().toggleClass("sapMFocus", false);
    
    		// remove touch handler from document for mobile devices
    		jQuery(document).off(".sapMIBtouchstart");

    		// close value state message popup when focus is out of the input
    		this.closeValueStateMessage();
    	}
	});
});