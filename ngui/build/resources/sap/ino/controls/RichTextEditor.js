/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["sap/ui/richtexteditor/RichTextEditor",'sap/ui/core/Popup'],function(R,P){"use strict";return R.extend("sap.ino.controls.RichTextEditor",{metadata:{properties:{"valueState":{type:"sap.ui.core.ValueState",defaultValue:sap.ui.core.ValueState.None},"valueStateText":{type:"string",defaultValue:null}}},exit:function(){if(this._popup){this._popup.destroy();this._popup=null;}},refreshDataState:function(n,d){if(n==="value"){this.propagateMessages(n,d.getMessages());}},propagateMessages:function(n,m){if(m&&m.length>0){this.setValueState(m[0].type);this.setValueStateText(m[0].message);}else{this.setValueState(sap.ui.core.ValueState.None);this.setValueStateText('');this.closeValueStateMessage();}},setValueStateText:function(t){this.setProperty("valueStateText",t,true);this.$("message-text").text(this.getValueStateText());return this;},setValueState:function(v){this.setProperty("valueState",v,true);var $=this.$();if($){$.removeClass("sapUiInoRteTfErr");$.removeClass("sapUiInoRteTfSucc");$.removeClass("sapUiInoRteTfWarn");var s=this._getStyleClassForValueState();if(s){$.addClass(s);}}},_getStyleClassForValueState:function(){switch(this.getValueState()){case(sap.ui.core.ValueState.Error):return"sapUiInoRteTfErr";case(sap.ui.core.ValueState.Success):return"sapUiInoRteTfSucc";case(sap.ui.core.ValueState.Warning):return"sapUiInoRteTfWarn";}},getDomRefForValueStateMessage:function(){return this.getFocusDomRef();},closeValueStateMessage:function(){if(this._popup){this._popup.close();}var i=jQuery(this.getFocusDomRef());i.removeAriaDescribedBy(this.getId()+"-message");},openValueStateMessage:function(){var s=this.getValueState();if(this.getEditable()){var t=this.getValueStateText();if(!t){t=sap.ui.core.ValueStateSupport.getAdditionalText(this);}if(!t){return;}var m=this.getId()+"-message";if(!this._popup){this._popup=new P(jQuery("<span></span>")[0],false,false,false);this._popup.attachClosed(function(){jQuery.sap.byId(m).remove();});}var i=jQuery(this.getFocusDomRef());var d=P.Dock;var I=i.css("text-align")==="right";var c="sapMValueStateMessage sapMValueStateMessage"+s;var T="sapMInputBaseMessageText";var r=sap.ui.getCore().getLibraryResourceBundle("sap.m");if(s===sap.ui.core.ValueState.Success){c="sapUiInvisibleText";t="";}var C=jQuery("<div>",{"id":m,"class":c,"role":"tooltip","aria-live":"assertive"}).append(jQuery("<span>",{"aria-hidden":true,"class":"sapUiHidden","text":r.getText("INPUTBASE_VALUE_STATE_"+s.toUpperCase())})).append(jQuery("<span>",{"id":m+"-text","class":T,"text":t}));this._popup.setContent(C[0]);this._popup.close(0);var a=this;this._popup.open(200,I?d.EndTop:d.BeginTop,I?d.EndBottom:d.BeginBottom,this.getDomRefForValueStateMessage(),"0 4",null,function(){a._popup.close();});if(i.offset().top<this._popup._$().offset().top){this._popup._$().addClass("sapMInputBaseMessageBottom");}else{this._popup._$().addClass("sapMInputBaseMessageTop");}i.addAriaDescribedBy(m);}},renderer:"sap.ui.richtexteditor.RichTextEditorRenderer",onfocusin:function(e){this._bIgnoreNextInput=!this.bShowLabelAsPlaceholder&&sap.ui.Device.browser.msie&&sap.ui.Device.browser.version>9&&(jQuery.type(this.getPlaceholder)==="function"&&!!this.getPlaceholder())&&!this._getInputValue();this.$().toggleClass("sapMFocus",true);if(sap.ui.Device.support.touch){jQuery(document).on('touchstart.sapMIBtouchstart',jQuery.proxy(this._touchstartHandler,this));}this.openValueStateMessage();},onfocusout:function(e){this.$().toggleClass("sapMFocus",false);jQuery(document).off(".sapMIBtouchstart");this.closeValueStateMessage();}});});
