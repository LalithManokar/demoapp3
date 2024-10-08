/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['./Input','./Tokenizer','./Token','./library','sap/ui/core/EnabledPropagator','sap/ui/base/ManagedObject','sap/ui/base/ManagedObjectMetadata','sap/ui/Device','./Popover','./List','./Title','./Bar','./Toolbar','./StandardListItem','sap/ui/core/ResizeHandler','sap/ui/core/IconPool','./MultiInputRenderer',"sap/ui/dom/containsOrEquals","sap/ui/events/KeyCodes","sap/ui/thirdparty/jquery","sap/ui/dom/jquery/cursorPos","sap/ui/dom/jquery/control"],function(I,T,a,l,E,M,b,D,P,L,c,B,d,S,R,f,g,h,K,q){"use strict";var j=l.PlacementType,k=l.ListMode;var m=I.extend("sap.m.MultiInput",{metadata:{library:"sap.m",designtime:"sap/m/designtime/MultiInput.designtime",properties:{enableMultiLineMode:{type:"boolean",group:"Behavior",defaultValue:false},maxTokens:{type:"int",group:"Behavior"}},aggregations:{tokens:{type:"sap.m.Token",multiple:true,singularName:"token"},tokenizer:{type:"sap.m.Tokenizer",multiple:false,visibility:"hidden"}},events:{tokenChange:{parameters:{type:{type:"string"},token:{type:"sap.m.Token"},tokens:{type:"sap.m.Token[]"},addedTokens:{type:"sap.m.Token[]"},removedTokens:{type:"sap.m.Token[]"}}},tokenUpdate:{allowPreventDefault:true,parameters:{type:{type:"string"},addedTokens:{type:"sap.m.Token[]"},removedTokens:{type:"sap.m.Token[]"}}}},dnd:{draggable:false,droppable:true}}});E.apply(m.prototype,[true]);var r=sap.ui.getCore().getLibraryResourceBundle("sap.m");m.prototype.init=function(){this._bShowListWithTokens=false;I.prototype.init.call(this);this._bIsValidating=false;this._tokenizer=new T();this._tokenizer._setAdjustable(true);this._setTokenizerCollapsed(true);this.setAggregation("tokenizer",this._tokenizer);this._tokenizer.attachTokenChange(this._onTokenChange,this);this._tokenizer.attachTokenUpdate(this._onTokenUpdate,this);this._tokenizer._handleNMoreIndicatorPress(this._handleIndicatorPress.bind(this));this._tokenizer.addEventDelegate({onThemeChanged:this._handleInnerVisibility.bind(this)},this);this.setShowValueHelp(true);this.setShowSuggestion(true);this.attachSuggestionItemSelected(this._onSuggestionItemSelected,this);this.attachLiveChange(this._onLiveChange,this);this.attachValueHelpRequest(this._onValueHelpRequested,this);this._getValueHelpIcon().setProperty("visible",true,true);this._modifySuggestionPicker();};m.prototype.exit=function(){I.prototype.exit.call(this);if(this._oSelectedItemPicker){this._oSelectedItemPicker.destroy();this._oSelectedItemPicker=null;}if(this._oSelectedItemsList){this._oSelectedItemsList.destroy();this._oSelectedItemsList=null;}if(this._getReadOnlyPopover()){var o=this._getReadOnlyPopover();o.destroy();o=null;}this._deregisterResizeHandler();};m.prototype.onBeforeRendering=function(){I.onBeforeRendering.apply(this,arguments);this._tokenizer.setEnabled(this.getEnabled());};m.prototype.onAfterRendering=function(){this._registerResizeHandler();this._tokenizer.setMaxWidth(this._calculateSpaceForTokenizer());this._tokenizer._useCollapsedMode(this._getTokenizerCollapsed());this._handleInnerVisibility();this._syncInputWidth(this._tokenizer);I.prototype.onAfterRendering.apply(this,arguments);};m.prototype._handleInnerVisibility=function(){var H=this._tokenizer._hasMoreIndicator();this[H?"_setValueInvisible":"_setValueVisible"].call(this);};m.prototype.oninput=function(e){this.setProperty("selectedKey",'',true);I.prototype.oninput.call(this,e);this._manageListsVisibility(false);this._getSelectedItemsPicker().close();};m.prototype._registerResizeHandler=function(){if(!this._iResizeHandlerId){this._iResizeHandlerId=R.register(this,this._onResize.bind(this));}if(!this._iTokenizerResizeHandler){this._iTokenizerResizeHandler=R.register(this._tokenizer,this._onResize.bind(this));}};m.prototype._deregisterResizeHandler=function(){if(this._iResizeHandlerId){R.deregister(this._iResizeHandlerId);this._iResizeHandlerId=null;}if(this._iTokenizerResizeHandler){R.deregister(this._iTokenizerResizeHandler);this._iTokenizerResizeHandler=null;}};m.prototype._onResize=function(){this._tokenizer.setMaxWidth(this._calculateSpaceForTokenizer());this._handleInnerVisibility();this._syncInputWidth(this._tokenizer);this._registerResizeHandler();};m.prototype._onTokenChange=function(e){this.fireTokenChange(e.getParameters());this.invalidate();if(e.getParameter("type")==="removed"){this._setTokenizerCollapsed(false);this._tokenizer._useCollapsedMode(false);}if((this._oSuggestionPopup&&this._oSuggestionPopup.isOpen())||this._bUseDialog){this._fillList();}if(this._bUseDialog){this._manageListsVisibility(true);}};m.prototype._onTokenUpdate=function(e){var i=this.fireTokenUpdate(e.getParameters());if(!this.getTokens().length){this.$().find("input").focus();}if(!i){e.preventDefault();}else{this.invalidate();}};m.prototype._onSuggestionItemSelected=function(e){var i=null,t=null,o=this._tokenizer.getTokens().length;if(this.getMaxTokens()&&o>=this.getMaxTokens()||this._bValueHelpOpen){return;}if(this._hasTabularSuggestions()){i=e.getParameter("selectedRow");}else{i=e.getParameter("selectedItem");if(i){t=new a({text:M.escapeSettingsValue(i.getText()),key:M.escapeSettingsValue(i.getKey())});}}if(i){var n=this.getValue();this._tokenizer._addValidateToken({text:n,token:t,suggestionObject:i,validationCallback:this._validationCallback.bind(this,o)});}if(this._bUseDialog){var N=this._tokenizer.getTokens().length;if(o<N){this.setValue("");}if(this._getSuggestionsList()instanceof sap.m.Table){this._getSuggestionsList().addStyleClass("sapMInputSuggestionTableHidden");}else{this._getSuggestionsList().destroyItems();}var s=this._oSuggestionPopup.getScrollDelegate();if(s){s.scrollTo(0,0,0);}this._oSuggPopover._oPopupInput.focus();}};m.prototype._onValueHelpRequested=function(){this._bValueHelpOpen=true;};m.prototype._onLiveChange=function(e){this._tokenizer._removeSelectedTokens();};m.prototype._setValueInvisible=function(){this.$("inner").css("opacity","0");};m.prototype._setValueVisible=function(){this.$("inner").css("opacity","1");};m.prototype.setEnableMultiLineMode=function(e){return this.setProperty("enableMultiLineMode",e,true);};m.prototype.onmousedown=function(e){if(e.target==this.getDomRef('content')){e.preventDefault();e.stopPropagation();}};m.prototype._openMultiLineOnDesktop=function(){};m.prototype.openMultiLine=function(){};m.prototype.closeMultiLine=function(){};m.prototype.getScrollDelegate=function(){return this._tokenizer._oScroller;};m.prototype.onBeforeRendering=function(){I.prototype.onBeforeRendering.apply(this,arguments);this._deregisterResizeHandler();};m.prototype.addValidator=function(v){this._tokenizer.addValidator(v);};m.prototype.removeValidator=function(v){this._tokenizer.removeValidator(v);};m.prototype.removeAllValidators=function(){this._tokenizer.removeAllValidators();};m.prototype.onsapnext=function(e){if(e.isMarked()){return;}var F=q(document.activeElement).control()[0];if(!F){return;}if(this._tokenizer===F||this._tokenizer.$().find(F.$()).length>0){this._scrollAndFocus();}};m.prototype.onsapbackspace=function(e){if(this.getCursorPosition()>0||!this.getEditable()||this.getValue().length>0){return;}if(!e.isMarked()){T.prototype.onsapbackspace.apply(this._tokenizer,arguments);}if(e.isMarked("forwardFocusToParent")){this.focus();}e.preventDefault();e.stopPropagation();};m.prototype.onsapdelete=function(e){if(!this.getEditable()){return;}if(this.getValue()&&!this._completeTextIsSelected()){return;}if(e.isMarked("forwardFocusToParent")){this.focus();}};m.prototype.onkeydown=function(e){if(!this.getEnabled()){return;}if(e.which===K.TAB){this._tokenizer._changeAllTokensSelection(false);}if((e.ctrlKey||e.metaKey)&&e.which===K.A){if(this._tokenizer.getTokens().length>0){this._tokenizer.focus();this._tokenizer._changeAllTokensSelection(true);e.preventDefault();}}if((e.ctrlKey||e.metaKey)&&(e.which===K.C||e.which===K.INSERT)){this._tokenizer._copy();}if(((e.ctrlKey||e.metaKey)&&e.which===K.X)||(e.shiftKey&&e.which===K.DELETE)){if(this.getEditable()){this._tokenizer._cut();}else{this._tokenizer._copy();}}};m.prototype.onpaste=function(e){var o,i,v=[],A=[];if(this.getValueHelpOnly()){return;}if(window.clipboardData){o=window.clipboardData.getData("Text");}else{o=e.originalEvent.clipboardData.getData('text/plain');}if(o.length&&o.endsWith("\r\n")){o=o.substring(0,o.lastIndexOf("\r\n"));}var s=this._tokenizer._parseString(o);if(s.length<=1){return;}setTimeout(function(){if(s){if(this.fireEvent("_validateOnPaste",{texts:s},true)){var n="";for(i=0;i<s.length;i++){if(s[i]){var t=this._convertTextToToken(s[i],true);if(t){v.push(t);}else{n=s[i];}}}this.updateDomValue(n);for(i=0;i<v.length;i++){if(this._tokenizer._addUniqueToken(v[i])){A.push(v[i]);}}if(A.length>0){this.fireTokenUpdate({addedTokens:A,removedTokens:[],type:T.TokenUpdateType.Added});}}if(A.length){this.cancelPendingSuggest();}}}.bind(this),0);};m.prototype._convertTextToToken=function(t,C){var e=null,i=null,n=null,o=this._tokenizer.getTokens().length;if(!this.getEditable()){return null;}t=t.trim();if(!t){return null;}if(this._getIsSuggestionPopupOpen()||C){if(this._hasTabularSuggestions()){i=this._oSuggestionTable._oSelectedItem;}else{i=this._getSuggestionItem(t);}}if(i&&i.getText&&i.getKey){n=new a({text:M.escapeSettingsValue(i.getText()),key:i.getKey()});}e=this._tokenizer._validateToken({text:t,token:n,suggestionObject:i,validationCallback:this._validationCallback.bind(this,o)});return e;};m.prototype._validationCallback=function(o,v){var n=this._tokenizer.getTokens().length;this._bIsValidating=false;if(v){this.setValue("");if(this._bUseDialog&&this._oSuggPopover&&this._oSuggPopover._oPopupInput&&(o<n)){this._oSuggPopover._oPopupInput.setValue("");}}};m.prototype.onsapprevious=function(e){if(this._getIsSuggestionPopupOpen()){return;}if(this.getCursorPosition()===0){if(e.srcControl===this){T.prototype.onsapprevious.apply(this._tokenizer,arguments);}}if(e.keyCode===K.ARROW_UP){e.preventDefault();}};m.prototype._scrollAndFocus=function(){this._tokenizer.scrollToEnd();this.$().find("input").focus();};m.prototype.onsaphome=function(e){if(!this.getFocusDomRef().selectionStart){T.prototype.onsaphome.apply(this._tokenizer,arguments);}};m.prototype.onsapend=function(e){if(e.isMarked("forwardFocusToParent")){this.focus();}};m.prototype.onsapenter=function(e){if(I.prototype.onsapenter){I.prototype.onsapenter.apply(this,arguments);}var v=true;if(this._oSuggestionPopup&&this._oSuggestionPopup.isOpen()){if(this._hasTabularSuggestions()){v=!this._oSuggestionTable.getSelectedItem();}else{v=!this._getSuggestionsList().getSelectedItem();}}if(v){this._validateCurrentText();}this.focus();};m.prototype._checkFocus=function(){return this.getDomRef()&&h(this.getDomRef(),document.activeElement);};m.prototype.onsapfocusleave=function(e){var p=this._oSuggestionPopup,s=this._oSelectedItemPicker,n=false,N=false,i=this._checkFocus(),o,F,t;if(p.isA("sap.m.Popover")){if(e.relatedControlId){o=sap.ui.getCore().byId(e.relatedControlId).getFocusDomRef();n=h(p.getFocusDomRef(),o);N=h(this._tokenizer.getFocusDomRef(),o);t=h(this._oReadOnlyPopover&&this._oReadOnlyPopover.getFocusDomRef(),o);if(s){F=h(s.getFocusDomRef(),o);}}}if(!N&&!n){this._tokenizer.scrollToEnd();}I.prototype.onsapfocusleave.apply(this,arguments);if(this._bIsValidating||this._bValueHelpOpen){return;}if(!this._bUseDialog&&!n&&e.relatedControlId!==this.getId()&&!N){this._validateCurrentText(true);}if(!this._bUseDialog&&this.getEditable()){if(i||n){return;}}if(!F&&!N){this._setTokenizerCollapsed(true);this._tokenizer._useCollapsedMode(true);}if(this._oReadOnlyPopover&&this._oReadOnlyPopover.isOpen()&&!N&&!t){this._oReadOnlyPopover.close();}this._handleInnerVisibility();};m.prototype._onDialogClose=function(){this.setAggregation("tokenizer",this._tokenizer);this._tokenizer.setReverseTokens(false);this._tokenizer.invalidate();};m.prototype.ontap=function(e){if(document.activeElement===this._$input[0]||document.activeElement===this._tokenizer.getDomRef()){this._tokenizer.selectAllTokens(false);}if(e&&e.isMarked("tokenDeletePress")){return;}I.prototype.ontap.apply(this,arguments);};m.prototype._onclick=function(e){if(this._bUseDialog&&this.getTokens().length){this._openSuggestionsPopover();}};m.prototype.onfocusin=function(e){this._deregisterResizeHandler();this._bValueHelpOpen=false;if(e.target===this.getFocusDomRef()){I.prototype.onfocusin.apply(this,arguments);}if(!this._bUseDialog&&this.getEditable()&&(!e.target.classList.contains("sapMInputValHelp")&&!e.target.classList.contains("sapMInputValHelpInner"))){if(this._oSuggestionPopup&&this._oSuggestionPopup.isOpen()){return;}this._setTokenizerCollapsed(false);this._tokenizer._useCollapsedMode(false);this._setValueVisible();this._tokenizer.scrollToEnd();}};m.prototype.onsapescape=function(e){this._tokenizer.selectAllTokens(false);this.selectText(0,0);I.prototype.onsapescape.apply(this,arguments);};m.prototype._validateCurrentText=function(e){var t=this.getValue(),o=this._tokenizer.getTokens().length;if(!t||!this.getEditable()){return;}t=t.trim();if(!t){return;}var i=null;if(e||this._getIsSuggestionPopupOpen()){if(this._hasTabularSuggestions()){i=this._oSuggestionTable._oSelectedItem;}else{i=this._getSuggestionItem(t,e);}}var n=null;if(i&&i.getText&&i.getKey){n=new a({text:M.escapeSettingsValue(i.getText()),key:i.getKey()});}if(!this.getMaxTokens()||this.getTokens().length<this.getMaxTokens()){this._bIsValidating=true;this._tokenizer._addValidateToken({text:t,token:n,suggestionObject:i,validationCallback:this._validationCallback.bind(this,o)});}};m.prototype.getCursorPosition=function(){return this._$input.cursorPos();};m.prototype._completeTextIsSelected=function(){var i=this._$input[0];if(i.selectionStart!==0){return false;}if(i.selectionEnd!==this.getValue().length){return false;}return true;};m.prototype._getIsSuggestionPopupOpen=function(){return this._oSuggPopover&&this._oSuggPopover._oPopover&&this._oSuggPopover._oPopover.isOpen();};m.prototype.setEditable=function(e){e=this.validateProperty("editable",e);var t=this._getTokensList();if(e===this.getEditable()){return this;}if(I.prototype.setEditable){I.prototype.setEditable.apply(this,arguments);}this._tokenizer.setEditable(e);if(e){if(this._bUseDialog){this._oSuggPopover._oPopover.addContent(t);}else{this._getSelectedItemsPicker().addContent(t);}t.setMode(k.Delete);}else{t.setMode(k.None);this._getReadOnlyPopover().addContent(t);}return this;};m.prototype._findItem=function(t,e,n,G){if(!t){return;}if(!(e&&e.length)){return;}t=t.toLowerCase();var o=e.length;for(var i=0;i<o;i++){var p=e[i];var s=G(p);if(!s){continue;}s=s.toLowerCase();if(s===t){return p;}if(!n&&s.indexOf(t)===0){return p;}}};m.prototype._getSuggestionItem=function(t,e){var n=null;var o=null;if(this._hasTabularSuggestions()){n=this.getSuggestionRows();o=this._findItem(t,n,e,function(p){var s=p.getCells();var u=null;if(s){var i;for(i=0;i<s.length;i++){if(s[i].getText){u=s[i].getText();break;}}}return u;});}else{n=this.getSuggestionItems();o=this._findItem(t,n,e,function(o){return o.getText();});}return o;};m.prototype.clone=function(){var C;this.detachSuggestionItemSelected(this._onSuggestionItemSelected,this);this.detachLiveChange(this._onLiveChange,this);this._tokenizer.detachTokenChange(this._onTokenChange,this);this._tokenizer.detachTokenUpdate(this._onTokenUpdate,this);this.detachValueHelpRequest(this._onValueHelpRequested,this);C=I.prototype.clone.apply(this,arguments);this.attachSuggestionItemSelected(this._onSuggestionItemSelected,this);this.attachLiveChange(this._onLiveChange,this);this._tokenizer.attachTokenChange(this._onTokenChange,this);this._tokenizer.attachTokenUpdate(this._onTokenUpdate,this);this.attachValueHelpRequest(this._onValueHelpRequested,this);return C;};m.getMetadata().forwardAggregation("tokens",{getter:function(){return this._tokenizer;},aggregation:"tokens",forwardBinding:true});m.prototype.getPopupAnchorDomRef=function(){return this.getDomRef("content");};m.prototype.setTokens=function(t){var v,V=[],i;if(Array.isArray(t)){for(i=0;i<t.length;i++){v=this.validateAggregation("tokens",t[i],true);b.addAPIParentInfoBegin(t[i],this,"tokens");V.push(v);}this._tokenizer.setTokens(V);for(i=0;i<t.length;i++){b.addAPIParentInfoEnd(t[i]);}}else{throw new Error("\""+t+"\" is of type "+typeof t+", expected array for aggregation tokens of "+this);}return this;};m.TokenChangeType={Added:"added",Removed:"removed",RemovedAll:"removedAll",TokensChanged:"tokensChanged"};m.WaitForAsyncValidation="sap.m.Tokenizer.WaitForAsyncValidation";m.prototype.getDomRefForValueStateMessage=m.prototype.getPopupAnchorDomRef;m.prototype.updateInputField=function(n){I.prototype.updateInputField.call(this,n);this.setDOMValue('');if(this._oSuggPopover._oPopupInput){this._oSuggPopover._oPopupInput.setDOMValue('');}};m.prototype.getAccessibilityInfo=function(){var t=this.getTokens().map(function(o){return o.getText();}).join(" ");var i=I.prototype.getAccessibilityInfo.apply(this,arguments);i.type=r.getText("ACC_CTR_TYPE_MULTIINPUT");i.description=((i.description||"")+" "+t).trim();return i;};m.prototype._modifySuggestionPicker=function(){var t=this,e,s;if(!this._bUseDialog){return;}this._oSuggPopover._oPopover.addContent(this._getTokensList());this._oSuggPopover._oPopover.attachBeforeOpen(function(){e=t.getTokens();s=e.length?true:false;t._manageListsVisibility(s);t._fillList();t._updatePickerHeaderTitle();}).attachAfterClose(function(){t._setTokenizerCollapsed(true);t._tokenizer._useCollapsedMode(true);t._bShowListWithTokens=false;});};m.prototype._modifyPopupInput=function(p){var t=this;p.addEventDelegate({oninput:t._manageListsVisibility.bind(t,false),onsapenter:function(e){if(p.getValue()){t._closeSuggestionPopup();}t._validateCurrentText();t._setValueInvisible();t.onChange(e,null,p.getValue());}});return p;};m.prototype._hasShowSelectedButton=function(){return true;};m.prototype.forwardEventHandlersToSuggPopover=function(s){I.prototype.forwardEventHandlersToSuggPopover.apply(this,arguments);s.setShowSelectedPressHandler(this._handleShowSelectedPress.bind(this));};m.prototype._handleShowSelectedPress=function(e){this._bShowListWithTokens=e.getSource().getPressed();this._manageListsVisibility(this._bShowListWithTokens);};m.prototype._onBeforeOpenTokensPicker=function(){var p=this._getSelectedItemsPicker(),o=this.getDomRef(),w;this._setValueInvisible();this._fillList();if(o&&p){w=(o.offsetWidth/parseFloat(l.BaseFontSize))+"rem";p.setContentMinWidth(w);}};m.prototype._onAfterCloseTokensPicker=function(){if(this._oSuggPopover&&!this.getValue()){this._tokenizer._useCollapsedMode(true);this._setTokenizerCollapsed(true);this._setValueInvisible();}};m.prototype.getDialogTitle=function(){var p=this._oSuggPopover._oPopover,H=p&&p.getCustomHeader();if(H){return H.getContentMiddle()[0];}return null;};m.prototype._updatePickerHeaderTitle=function(){var o,e;e=this.getLabels();if(e.length){o=e[0];if(o&&(typeof o.getText==="function")){this.getDialogTitle().setText(o.getText());}}else{this.getDialogTitle().setText(r.getText("COMBOBOX_PICKER_TITLE"));}};m.prototype._openSelectedItemsPicker=function(){if(this._bUseDialog){this._oSuggPopover._oPopover.open();}else{var p=this._getSelectedItemsPicker();if(p){p.open();}}this._manageListsVisibility(true);this._setValueVisible();return this;};m.prototype._getTokensList=function(){if(!this._oSelectedItemsList){this._oSelectedItemsList=this._createTokensList();}return this._oSelectedItemsList;};m.prototype._getSuggestionsList=function(){return this._oSuggPopover&&this._oSuggPopover._oList;};m.prototype._createTokensList=function(){return new L({width:"auto",mode:k.Delete}).attachDelete(this._handleNMoreItemDelete,this);};m.prototype._filterTokens=function(v){this._getTokensList().getItems().forEach(function(i){if(i.getTitle().toLowerCase().indexOf(v)>-1){i.setVisible(true);}else{i.setVisible(false);}});};m.prototype.getFilterSelectedButton=function(){return this._getSuggestionsPopover().getFilterSelectedButton();};m.prototype._manageListsVisibility=function(s){this._getTokensList().setVisible(s);this._getSuggestionsList()&&this._getSuggestionsList().setVisible(!s);if(this._bUseDialog){this.getFilterSelectedButton().setPressed(s);}};m.prototype._mapTokenToListItem=function(t){if(!t){return null;}var o=new S({selected:true});o.setTitle(t.getText());o.data("tokenId",t.getId());return o;};m.prototype._fillList=function(){var t=this.getTokens(),o;if(!t){return;}this._getTokensList().removeAllItems();for(var i=0,e=t.length;i<e;i++){var n=t[i],o=this._mapTokenToListItem(n);this._getTokensList().addItem(o);}};m.prototype._handleIndicatorPress=function(){this._bShowListWithTokens=true;if(this.getEditable()){this._openSelectedItemsPicker();}else{this._fillList();this._getReadOnlyPopover().openBy(this._tokenizer._oIndicator[0]);}};m.prototype._handleNMoreItemDelete=function(e){var o=e.getParameter("listItem"),s=o&&o.data("tokenId"),t;t=this.getTokens().filter(function(i){return i.getId()===s;})[0];if(t&&t.getEditable()){this._tokenizer._onTokenDelete(t);this._getTokensList().removeItem(o);}this.focus();};m.prototype._getSelectedItemsPicker=function(){if(this._oSelectedItemPicker){return this._oSelectedItemPicker;}this._oSelectedItemPicker=this._createDropdown();if(!this._bUseDialog){this._oSelectedItemPicker.setHorizontalScrolling(false).attachBeforeOpen(this._onBeforeOpenTokensPicker,this).attachAfterClose(this._onAfterCloseTokensPicker,this).addContent(this._getTokensList());}return this._oSelectedItemPicker;};m.prototype._createDropdown=function(){var o=new P(this._getDropdownSettings());o.setInitialFocus(this);this._decoratePopover(o);return o;};m.prototype._getReadOnlyPopover=function(){if(!this._oReadOnlyPopover){this._oReadOnlyPopover=this._createReadOnlyPopover();}return this._oReadOnlyPopover;};m.prototype._createReadOnlyPopover=function(){return new P({showArrow:true,placement:j.Auto,showHeader:false,contentMinWidth:"auto"}).addStyleClass("sapMMultiInputReadOnlyPopover").setInitialFocus(this);};m.prototype._decoratePopover=function(p){var t=this;p.open=function(){return this.openBy(t);};};m.prototype._getDropdownSettings=function(){return{showArrow:false,showHeader:false,placement:j.VerticalPreferredBottom,offsetX:0,offsetY:0,bounce:false};};m.prototype._calculateSpaceForTokenizer=function(){if(this.getDomRef()){var s,C=this.getDomRef().offsetWidth,i=this.$().find(".sapMInputDescriptionWrapper").width(),e=this._calculateIconsSpace(),o=this.$().find(".sapMInputBaseInner"),n=["min-width","padding-right","padding-left"],p=n.reduce(function(A,t){return A+(parseInt(o.css(t))||0);},0);s=C-(e+p+i);s=s<0?0:s;return s+"px";}else{return null;}};m.prototype._syncInputWidth=function(t){var F=this.getDomRef('inner'),s,i;if(!F||(t&&!t.getDomRef())){return;}s=this._calculateIconsSpace();i=Math.ceil(t.getDomRef().getBoundingClientRect().width);F.style.width='calc(100% - '+Math.floor(s+i)+"px";};m.prototype.isValueHelpOnlyOpener=function(t){return[this._$input[0],this._getValueHelpIcon().getDomRef()].indexOf(t)>-1;};m.prototype._setTokenizerCollapsed=function(C){this._bTokenizerCollapsed=C;return this;};m.prototype._getTokenizerCollapsed=function(){return this._bTokenizerCollapsed;};return m;});
