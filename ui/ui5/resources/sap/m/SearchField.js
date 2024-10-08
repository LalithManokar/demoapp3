/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['./library','sap/ui/core/Control','sap/ui/core/EnabledPropagator','sap/ui/core/IconPool','./Suggest','sap/ui/Device','./SearchFieldRenderer',"sap/ui/events/KeyCodes","sap/ui/thirdparty/jquery","sap/ui/dom/jquery/cursorPos"],function(l,C,E,I,S,D,a,K,q){"use strict";var r=sap.ui.getCore().getLibraryResourceBundle("sap.m");a.oSearchFieldToolTips={SEARCH_BUTTON_TOOLTIP:r.getText("SEARCHFIELD_SEARCH_BUTTON_TOOLTIP"),RESET_BUTTON_TOOLTIP:r.getText("SEARCHFIELD_RESET_BUTTON_TOOLTIP"),REFRESH_BUTTON_TOOLTIP:r.getText("SEARCHFIELD_REFRESH_BUTTON_TOOLTIP")};var b=C.extend("sap.m.SearchField",{metadata:{interfaces:["sap.ui.core.IFormContent","sap.f.IShellBar","sap.m.IToolbarInteractiveControl"],library:"sap.m",properties:{value:{type:"string",group:"Data",defaultValue:null,bindable:"bindable"},width:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:null},enabled:{type:"boolean",group:"Behavior",defaultValue:true},visible:{type:"boolean",group:"Appearance",defaultValue:true},maxLength:{type:"int",group:"Behavior",defaultValue:0},placeholder:{type:"string",group:"Misc",defaultValue:null},showMagnifier:{type:"boolean",group:"Misc",defaultValue:true,deprecated:true},showRefreshButton:{type:"boolean",group:"Behavior",defaultValue:false},refreshButtonTooltip:{type:"string",group:"Misc",defaultValue:null},showSearchButton:{type:"boolean",group:"Behavior",defaultValue:true},enableSuggestions:{type:"boolean",group:"Behavior",defaultValue:false},selectOnFocus:{type:"boolean",group:"Behavior",defaultValue:true,deprecated:true}},associations:{ariaDescribedBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaDescribedBy"},ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"}},defaultAggregation:"suggestionItems",designtime:"sap/m/designtime/SearchField.designtime",aggregations:{suggestionItems:{type:"sap.m.SuggestionItem",multiple:true,singularName:"suggestionItem"}},events:{search:{parameters:{query:{type:"string"},suggestionItem:{type:"sap.m.SuggestionItem"},refreshButtonPressed:{type:"boolean"},clearButtonPressed:{type:"boolean"}}},liveChange:{parameters:{newValue:{type:"string"}}},suggest:{parameters:{suggestValue:{type:"string"}}}}}});E.call(b.prototype);I.insertFontFaceStyle();b.prototype.init=function(){this.setProperty("placeholder",r.getText("FACETFILTER_SEARCH"),true);};b.prototype.getFocusDomRef=function(){return this.getInputElement();};b.prototype.getFocusInfo=function(){var f=C.prototype.getFocusInfo.call(this),i=this.getDomRef("I");if(i){q.extend(f,{cursorPos:q(i).cursorPos()});}return f;};b.prototype.applyFocusInfo=function(f){C.prototype.applyFocusInfo.call(this,f);if("cursorPos"in f){this.$("I").cursorPos(f.cursorPos);}return this;};b.prototype.getWidth=function(){return this.getProperty("width")||"100%";};b.prototype._hasPlaceholder=(function(){return"placeholder"in document.createElement("input");}());b.prototype.getInputElement=function(){return this.getDomRef("I");};b.prototype.onBeforeRendering=function(){this._unregisterEventListeners();};b.prototype.onAfterRendering=function(){var i=this.getInputElement();this._resetElement=this.getDomRef("reset");q(i).on("input",this.onInput.bind(this)).on("search",this.onSearch.bind(this)).on("focus",this.onFocus.bind(this)).on("blur",this.onBlur.bind(this));q(this.getDomRef("F")).on("click",this.onFormClick.bind(this));if(D.system.desktop||D.system.combi){this.$().on("touchstart mousedown",this.onButtonPress.bind(this));if(D.browser.firefox){this.$().find(".sapMSFB").on("mouseup mouseout",function(g){q(g.target).removeClass("sapMSFBA");});}}else if(window.PointerEvent){q(this._resetElement).on("touchstart",function(){this._active=document.activeElement;}.bind(this));}var f=sap.ui.getCore();if(!f.isThemeApplied()){f.attachThemeChanged(this._handleThemeLoad,this);}};b.prototype._handleThemeLoad=function(){if(this._oSuggest){this._oSuggest.setPopoverMinWidth();}var f=sap.ui.getCore();f.detachThemeChanged(this._handleThemeLoad,this);};b.prototype.clear=function(O){var v=O&&O.value||"";if(!this.getInputElement()||this.getValue()===v){return;}this.setValue(v);u(this);this.fireLiveChange({newValue:v});this.fireSearch({query:v,refreshButtonPressed:false,clearButtonPressed:!!(O&&O.clearButton)});};b.prototype.exit=function(){this._unregisterEventListeners();if(this._oSuggest){this._oSuggest.destroy(true);this._oSuggest=null;}};b.prototype.onButtonPress=function(f){if(f.originalEvent.button===2){return;}var i=this.getInputElement();if(document.activeElement===i&&f.target!==i){f.preventDefault();}if(D.browser.firefox){var g=q(f.target);if(g.hasClass("sapMSFB")){g.addClass("sapMSFBA");}}};b.prototype.ontouchstart=function(f){this._oTouchStartTarget=f.target;};b.prototype.ontouchend=function(f){if(f.originalEvent.button===2){return;}var g=f.target,v=true,i=this.getInputElement();if(this._oTouchStartTarget){v=this._oTouchStartTarget===g;this._oTouchStartTarget=null;}if(g.id==this.getId()+"-reset"&&v){c(this);this._bSuggestionSuppressed=true;var h=!this.getValue();this.clear({clearButton:true});var j=document.activeElement;if(((D.system.desktop||h||/(INPUT|TEXTAREA)/i.test(j.tagName)||j===this._resetElement&&this._active===i))&&(j!==i)){i.focus();}}else if(g.id==this.getId()+"-search"&&v){c(this);if(D.system.desktop&&!this.getShowRefreshButton()&&(document.activeElement!==i)){i.focus();}this.fireSearch({query:this.getValue(),refreshButtonPressed:!!(this.getShowRefreshButton()&&!this.$().hasClass("sapMFocus")),clearButtonPressed:false});}else{this.onmouseup(f);}};b.prototype.onmouseup=function(f){if(D.system.phone&&this.getEnabled()&&f.target.tagName=="INPUT"&&document.activeElement===f.target&&!d(this)){this.onFocus(f);}};b.prototype.onFormClick=function(f){if(this.getEnabled()&&f.target.tagName=="FORM"){this.getInputElement().focus();}};b.prototype.onSearch=function(f){var v=this.getInputElement().value;this.setValue(v);this.fireSearch({query:v,refreshButtonPressed:false,clearButtonPressed:false});if(!D.system.desktop){this._blur();}};b.prototype._blur=function(){var t=this;window.setTimeout(function(){var i=t.getInputElement();if(i){i.blur();}},13);};b.prototype.onChange=function(f){this.setValue(this.getInputElement().value);};b.prototype.onInput=function(f){var v=this.getInputElement().value;if(v!=this.getValue()){this.setValue(v);this.fireLiveChange({newValue:v});if(this.getEnableSuggestions()){if(this._iSuggestDelay){clearTimeout(this._iSuggestDelay);}this._iSuggestDelay=setTimeout(function(){this.fireSuggest({suggestValue:v});u(this);this._iSuggestDelay=null;}.bind(this),400);}}};b.prototype.onkeydown=function(f){var g;var h;var v;switch(f.which){case K.F5:case K.ENTER:this.$("search").toggleClass("sapMSFBA",true);f.stopPropagation();f.preventDefault();if(d(this)){c(this);if((g=this._oSuggest.getSelected())>=0){h=this.getSuggestionItems()[g];this.setValue(h.getSuggestionText());}}this.fireSearch({query:this.getValue(),suggestionItem:h,refreshButtonPressed:this.getShowRefreshButton()&&f.which===K.F5,clearButtonPressed:false});break;case K.ESCAPE:if(d(this)){c(this);f.setMarked();}else{v=this.getValue();if(v===this._sOriginalValue){this._sOriginalValue="";}this.clear({value:this._sOriginalValue});if(v!==this.getValue()){f.setMarked();}}f.preventDefault();break;}};b.prototype.onkeyup=function(f){if(f.which===K.F5||f.which===K.ENTER){this.$("search").toggleClass("sapMSFBA",false);}};b.prototype.onFocus=function(f){if(D.browser.internet_explorer&&!document.hasFocus()){return;}this.$().toggleClass("sapMFocus",true);this._sOriginalValue=this.getValue();if(this.getEnableSuggestions()){if(!this._bSuggestionSuppressed){this.fireSuggest({suggestValue:this.getValue()});}else{this._bSuggestionSuppressed=false;}}this._setToolTips(f.type);};b.prototype.onBlur=function(f){this.$().toggleClass("sapMFocus",false);if(this._bSuggestionSuppressed){this._bSuggestionSuppressed=false;}this._setToolTips(f.type);};b.prototype._setToolTips=function(t){var $=this.$("search"),f=this.$("reset");if(this.getShowRefreshButton()){if(t==="focus"){$.attr("title",a.oSearchFieldToolTips.SEARCH_BUTTON_TOOLTIP);}else if(t==="blur"){var R=this.getRefreshButtonTooltip(),T=R===""?a.oSearchFieldToolTips.REFRESH_BUTTON_TOOLTIP:R;if(T){$.attr("title",T);}}}if(this.getValue()===""){f.attr("title",a.oSearchFieldToolTips.SEARCH_BUTTON_TOOLTIP);}else{f.attr("title",a.oSearchFieldToolTips.RESET_BUTTON_TOOLTIP);}};b.prototype.setValue=function(v){v=v||"";var i=this.getInputElement();if(i){if(i.value!==v){i.value=v;}var $=this.$();if($.hasClass("sapMSFVal")==!v){$.toggleClass("sapMSFVal",!!v);}}this.setProperty("value",v,true);this._setToolTips();return this;};b.prototype._unregisterEventListeners=function(){var i=this.getInputElement();if(i){this.$().find(".sapMSFB").off();this.$().off();q(this.getDomRef("F")).off();q(i).off();}};b.prototype.onsapshow=function(f){if(this.getEnableSuggestions()){if(d(this)){c(this);}else{this.fireSuggest({suggestValue:this.getValue()});}}};b.prototype.onsaphide=function(f){this.suggest(false);};function s(f,g,i,R){var h;if(d(f)){h=f._oSuggest.setSelected(i,R);if(h>=0){f.setValue(f.getSuggestionItems()[h].getSuggestionText());}g.preventDefault();}}b.prototype.onsapdown=function(f){s(this,f,1,true);};b.prototype.onsapup=function(f){s(this,f,-1,true);};b.prototype.onsaphome=function(f){s(this,f,0,false);};b.prototype.onsapend=function(f){var L=this.getSuggestionItems().length-1;s(this,f,L,false);};b.prototype.onsappagedown=function(f){s(this,f,10,true);};b.prototype.onsappageup=function(f){s(this,f,-10,true);};b.prototype.getPopupAnchorDomRef=function(){return this.getDomRef("F");};b.prototype._getToolbarInteractive=function(){return true;};function c(f){f._oSuggest&&f._oSuggest.close();}function o(f){if(f.getEnableSuggestions()){if(!f._oSuggest){f._oSuggest=new S(f);}f._oSuggest.open();}}function d(f){return f._oSuggest&&f._oSuggest.isOpen();}b.prototype.suggest=function(f){if(this.getEnableSuggestions()){f=f===undefined||!!f;if(f&&(this.getSuggestionItems().length||D.system.phone)){o(this);}else{c(this);}}return this;};function u(f){f._oSuggest&&f._oSuggest.update();}var e="suggestionItems";b.prototype.insertSuggestionItem=function(O,i,f){u(this);return C.prototype.insertAggregation.call(this,e,O,i,true);};b.prototype.addSuggestionItem=function(O,f){u(this);return C.prototype.addAggregation.call(this,e,O,true);};b.prototype.removeSuggestionItem=function(O,f){u(this);return C.prototype.removeAggregation.call(this,e,O,true);};b.prototype.removeAllSuggestionItems=function(f){u(this);return C.prototype.removeAllAggregation.call(this,e,true);};return b;});
