/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['./Bar','./InstanceManager','./AssociativeOverflowToolbar','./ToolbarSpacer','./Title','./library','sap/ui/core/Control','sap/ui/core/IconPool','sap/ui/core/Popup','sap/ui/core/delegate/ScrollEnablement','sap/ui/core/RenderManager','sap/ui/core/InvisibleText','sap/ui/core/ResizeHandler',"sap/ui/core/theming/Parameters",'sap/ui/Device','sap/ui/base/ManagedObject','sap/ui/core/library','./TitlePropagationSupport','./DialogRenderer',"sap/base/Log","sap/ui/thirdparty/jquery","sap/ui/core/Core","sap/ui/core/Configuration","sap/ui/dom/jquery/control","sap/ui/dom/jquery/Focusable"],function(B,I,A,T,a,l,C,b,P,S,R,c,d,f,D,M,g,h,j,L,q,k,m){"use strict";var O=g.OpenState;var n=l.DialogType;var o=l.DialogRoleType;var V=g.ValueState;var s=k.getConfiguration().getAnimationMode();var u=s!==m.AnimationMode.none&&s!==m.AnimationMode.minimal;var p=u?300:10;var r=17;var H=5;var t=f.get({name:"_sap_m_Dialog_VerticalMargin",callback:function(e){t=parseFloat(e);}});if(t){t=parseFloat(t);}else{t=3;}var v=C.extend("sap.m.Dialog",{metadata:{interfaces:["sap.ui.core.PopupInterface"],library:"sap.m",properties:{icon:{type:"sap.ui.core.URI",group:"Appearance",defaultValue:null},title:{type:"string",group:"Appearance",defaultValue:null},showHeader:{type:"boolean",group:"Appearance",defaultValue:true},type:{type:"sap.m.DialogType",group:"Appearance",defaultValue:n.Standard},state:{type:"sap.ui.core.ValueState",group:"Appearance",defaultValue:V.None},stretchOnPhone:{type:"boolean",group:"Appearance",defaultValue:false,deprecated:true},stretch:{type:"boolean",group:"Appearance",defaultValue:false},contentWidth:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null},contentHeight:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null},horizontalScrolling:{type:"boolean",group:"Behavior",defaultValue:true},verticalScrolling:{type:"boolean",group:"Behavior",defaultValue:true},resizable:{type:"boolean",group:"Behavior",defaultValue:false},draggable:{type:"boolean",group:"Behavior",defaultValue:false},escapeHandler:{type:"any",group:"Behavior",defaultValue:null},role:{type:"sap.m.DialogRoleType",group:"Data",defaultValue:o.Dialog,visibility:"hidden"}},defaultAggregation:"content",aggregations:{content:{type:"sap.ui.core.Control",multiple:true,singularName:"content"},subHeader:{type:"sap.m.IBar",multiple:false},customHeader:{type:"sap.m.IBar",multiple:false},beginButton:{type:"sap.m.Button",multiple:false},endButton:{type:"sap.m.Button",multiple:false},buttons:{type:"sap.m.Button",multiple:true,singularName:"button"},_header:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"},_title:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"},_icon:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"},_toolbar:{type:"sap.m.OverflowToolbar",multiple:false,visibility:"hidden"},_valueState:{type:"sap.ui.core.InvisibleText",multiple:false,visibility:"hidden"}},associations:{leftButton:{type:"sap.m.Button",multiple:false,deprecated:true},rightButton:{type:"sap.m.Button",multiple:false,deprecated:true},initialFocus:{type:"sap.ui.core.Control",multiple:false},ariaDescribedBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaDescribedBy"},ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"}},events:{beforeOpen:{},afterOpen:{},beforeClose:{parameters:{origin:{type:"sap.m.Button"}}},afterClose:{parameters:{origin:{type:"sap.m.Button"}}}},designtime:"sap/m/designtime/Dialog.designtime"}});h.call(v.prototype,"content",function(){return this._headerTitle?this._headerTitle.getId():false;});v._bPaddingByDefault=(sap.ui.getCore().getConfiguration().getCompatibilityVersion("sapMDialogWithPadding").compareTo("1.16")<0);v._mIcons={};v._mIcons[V.Success]=b.getIconURI("message-success");v._mIcons[V.Warning]=b.getIconURI("message-warning");v._mIcons[V.Error]=b.getIconURI("message-error");v._mIcons[V.Information]=b.getIconURI("hint");v.prototype.init=function(){var e=this;this._externalIcon=undefined;this._oManuallySetSize=null;this._oManuallySetPosition=null;this._bRTL=sap.ui.getCore().getConfiguration().getRTL();this._scrollContentList=["sap.m.NavContainer","sap.m.Page","sap.m.ScrollContainer","sap.m.SplitContainer","sap.m.MultiInput","sap.m.SimpleFixFlex"];this.oPopup=new P();this.oPopup.setShadow(true);this.oPopup.setNavigationMode("SCOPE");if(D.os.ios&&D.system.phone&&!this._bMessageType){this.oPopup.setModal(true,"sapMDialogTransparentBlk");}else{this.oPopup.setModal(true,"sapMDialogBlockLayerInit");}this.oPopup.setAnimations(q.proxy(this._openAnimation,this),q.proxy(this._closeAnimation,this));this.oPopup._applyPosition=function(i,F){e._setDimensions();e._adjustScrollingPane();if(e._oManuallySetPosition){i.at={left:e._oManuallySetPosition.x,top:e._oManuallySetPosition.y};}else{i.at=e._calcPosition();}e._deregisterContentResizeHandler();P.prototype._applyPosition.call(this,i);e._registerContentResizeHandler();};if(v._bPaddingByDefault){this.addStyleClass("sapUiPopupWithPadding");}this._initTitlePropagationSupport();};v.prototype.onBeforeRendering=function(){if(this._hasSingleScrollableContent()){this.setProperty("verticalScrolling",false);this.setProperty("horizontalScrolling",false);L.info("VerticalScrolling and horizontalScrolling in sap.m.Dialog with ID "+this.getId()+" has been disabled because there's scrollable content inside");}else if(!this._oScroller){this._oScroller=new S(this,this.getId()+"-scroll",{horizontal:this.getHorizontalScrolling(),vertical:this.getVerticalScrolling()});}this._createToolbarButtons();if(sap.ui.getCore().getConfiguration().getAccessibility()&&this.getState()!=V.None){var e=new c({text:this.getValueStateString(this.getState())});this.setAggregation("_valueState",e);this.addAriaLabelledBy(e.getId());}};v.prototype.onAfterRendering=function(){this._$scrollPane=this.$("scroll");this._$content=this.$("cont");this._$dialog=this.$();if(this.isOpen()){this._setInitialFocus();}};v.prototype.exit=function(){I.removeDialogInstance(this);this._deregisterContentResizeHandler();this._deregisterResizeHandler();if(this.oPopup){this.oPopup.detachOpened(this._handleOpened,this);this.oPopup.detachClosed(this._handleClosed,this);this.oPopup.destroy();this.oPopup=null;}if(this._oScroller){this._oScroller.destroy();this._oScroller=null;}if(this._header){this._header.destroy();this._header=null;}if(this._headerTitle){this._headerTitle.destroy();this._headerTitle=null;}if(this._iconImage){this._iconImage.destroy();this._iconImage=null;}if(this._toolbarSpacer){this._toolbarSpacer.destroy();this._toolbarSpacer=null;}};v.prototype.open=function(){var e=this.oPopup;e.setInitialFocusId(this.getId());var i=e.getOpenState();switch(i){case O.OPEN:case O.OPENING:return this;case O.CLOSING:this._bOpenAfterClose=true;break;default:}this._oCloseTrigger=null;this.fireBeforeOpen();e.attachOpened(this._handleOpened,this);this._iLastWidthAndHeightWithScroll=null;e.setContent(this);e.open();this._registerResizeHandler();I.addDialogInstance(this);return this;};v.prototype.close=function(){this._bOpenAfterClose=false;this.$().removeClass('sapDialogDisableTransition');this._deregisterResizeHandler();var e=this.oPopup;var i=this.oPopup.getOpenState();if(!(i===O.CLOSED||i===O.CLOSING)){l.closeKeyboard();this.fireBeforeClose({origin:this._oCloseTrigger});e.attachClosed(this._handleClosed,this);this._bDisableRepositioning=false;this._oManuallySetPosition=null;this._oManuallySetSize=null;e.close();this._deregisterContentResizeHandler();}return this;};v.prototype.isOpen=function(){return this.oPopup&&this.oPopup.isOpen();};v.prototype._handleOpened=function(){this.oPopup.detachOpened(this._handleOpened,this);this._setInitialFocus();this.fireAfterOpen();};v.prototype._handleClosed=function(){if(!this.oPopup){return;}this.oPopup.detachClosed(this._handleClosed,this);if(this.getDomRef()){R.preserveContent(this.getDomRef());this.$().remove();}I.removeDialogInstance(this);this.fireAfterClose({origin:this._oCloseTrigger});if(this._bOpenAfterClose){this._bOpenAfterClose=false;this.open();}};v.prototype.onfocusin=function(e){var i=e.target;if(i.id===this.getId()+"-firstfe"){var x=this.$("footer").lastFocusableDomRef()||this.$("cont").lastFocusableDomRef()||(this.getSubHeader()&&this.getSubHeader().$().firstFocusableDomRef())||(this._getAnyHeader()&&this._getAnyHeader().$().lastFocusableDomRef());if(x){x.focus();}}else if(i.id===this.getId()+"-lastfe"){var F=(this._getAnyHeader()&&this._getAnyHeader().$().firstFocusableDomRef())||(this.getSubHeader()&&this.getSubHeader().$().firstFocusableDomRef())||this.$("cont").firstFocusableDomRef()||this.$("footer").firstFocusableDomRef();if(F){F.focus();}}};v.prototype._getPromiseWrapper=function(){var e=this;return{reject:function(){e.currentPromise.reject();},resolve:function(){e.currentPromise.resolve();}};};v.prototype.onsapescape=function(e){var E=this.getEscapeHandler(),i={},x=this;if(e.originalEvent&&e.originalEvent._sapui_handledByControl){return;}this._oCloseTrigger=null;if(typeof E==='function'){new window.Promise(function(y,z){i.resolve=y;i.reject=z;x.currentPromise=i;E(x._getPromiseWrapper());}).then(function(y){x.close();}).catch(function(){L.info("Disallow dialog closing");});}else{this.close();}e.stopPropagation();};v.prototype._openAnimation=function($,i,e){$.addClass("sapMDialogOpen");setTimeout(e,p);};v.prototype._closeAnimation=function($,i,e){$.removeClass("sapMDialogOpen");setTimeout(e,p);};v.prototype._setDimensions=function(){var $=this.$(),e=this.getStretch(),i=this.getStretchOnPhone()&&D.system.phone,x=this._bMessageType,y={};if(!e){if(!this._oManuallySetSize){y.width=this.getContentWidth()||undefined;y.height=this.getContentHeight()||undefined;}else{y.width=this._oManuallySetSize.width;y.height=this._oManuallySetSize.height;}}if(y.width=='auto'){y.width=undefined;}if(y.height=='auto'){y.height=undefined;}if((e&&!x)||(i)){this.$().addClass('sapMDialogStretched');}$.css(y);$.css(this._calcMaxSizes());if(!this._oManuallySetSize&&!this._bDisableRepositioning){$.css(this._calcPosition());}if(window.navigator.userAgent.toLowerCase().indexOf("chrome")!==-1&&this.getStretch()){$.find('> footer').css({bottom:'0.001px'});}};v.prototype._adjustScrollingPane=function(){if(this._oScroller){this._oScroller.refresh();}};v.prototype._reposition=function(){};v.prototype._repositionAfterOpen=function(){};v.prototype._reapplyPosition=function(){this._adjustScrollingPane();};v.prototype._onResize=function(){var $=this.$(),e=this.$('cont'),i=this.getContentWidth(),x=this._calcMaxSizes().maxWidth,y=D.browser;if(this._oManuallySetSize){e.css({width:'auto'});return;}if(D.system.desktop&&!y.chrome){var z=e.width()+"x"+e.height(),E=$.css("min-width")!==$.css("width");if(z!==this._iLastWidthAndHeightWithScroll&&E){if(this._hasVerticalScrollbar()&&(!i||i=='auto')&&!this.getStretch()&&e.width()<x){$.addClass("sapMDialogVerticalScrollIncluded");e.css({"padding-right":r});this._iLastWidthAndHeightWithScroll=z;}else{$.removeClass("sapMDialogVerticalScrollIncluded");e.css({"padding-right":""});this._iLastWidthAndHeightWithScroll=null;}}else if(!this._hasVerticalScrollbar()||!E){$.removeClass("sapMDialogVerticalScrollIncluded");e.css({"padding-right":""});this._iLastWidthAndHeightWithScroll=null;}}if(!this._oManuallySetSize&&!this._bDisableRepositioning){this._positionDialog();}};v.prototype._hasVerticalScrollbar=function(){var $=this.$('cont');if(D.browser.msie){return $[0].clientWidth<$.outerWidth();}return $[0].clientHeight<$[0].scrollHeight;};v.prototype._positionDialog=function(){var $=this.$();$.css(this._calcMaxSizes());$.css(this._calcPosition());};v.prototype._calcPosition=function(){var e=this._getAreaDimensions(),$=this.$(),i,x,y;if(D.system.phone&&this.getStretch()){i=0;x=0;}else if(this.getStretch()){i=this._percentOfSize(e.width,H);x=this._percentOfSize(e.height,t);}else{i=(e.width-$.outerWidth())/2;x=(e.height-$.outerHeight())/2;}y={top:Math.round(e.top+x)};y[this._bRTL?"right":"left"]=Math.round(e.left+i);return y;};v.prototype._calcMaxSizes=function(){var e=this._getAreaDimensions(),$=this.$(),i=$.find(".sapMDialogTitleGroup").height()||0,x=$.find(".sapMDialogSubHeader").height()||0,F=$.find("footer").height()||0,y=i+x+F,z,E;if(D.system.phone&&this.getStretch()){E=e.width;z=e.height-y;}else{E=this._percentOfSize(e.width,100-2*H);z=this._percentOfSize(e.height,100-2*t)-y;}return{maxWidth:Math.floor(E),maxHeight:Math.floor(z)};};v.prototype._getAreaDimensions=function(){var W=P.getWithinAreaDomRef(),e;if(W===window){e={left:0,top:0,width:W.innerWidth,height:W.innerHeight};}else{var i=W.getBoundingClientRect(),$=q(W);e={left:i.left+parseFloat($.css("border-left-width")),top:i.top+parseFloat($.css("border-top-width")),width:W.clientWidth,height:W.clientHeight};}e.right=e.left+e.width;e.bottom=e.top+e.height;return e;};v.prototype._percentOfSize=function(i,e){return Math.round(i*e/100);};v.prototype._createHeader=function(){if(!this._header){this._header=new B(this.getId()+"-header");this._header._setRootAccessibilityRole("heading");this._header._setRootAriaLevel("2");this.setAggregation("_header",this._header,false);}};v.prototype._hasSingleScrollableContent=function(){var e=this.getContent();while(e.length===1&&e[0]instanceof C&&e[0].isA("sap.ui.core.mvc.View")){e=e[0].getContent();}if(e.length===1&&e[0]instanceof C&&e[0].isA(this._scrollContentList)){return true;}return false;};v.prototype._initBlockLayerAnimation=function(){this.oPopup._hideBlockLayer=function(){var $=q("#sap-ui-blocklayer-popup");$.removeClass("sapMDialogTransparentBlk");P.prototype._hideBlockLayer.call(this);};};v.prototype._clearBlockLayerAnimation=function(){if(D.os.ios&&D.system.phone&&!this._bMessageType){delete this.oPopup._showBlockLayer;this.oPopup._hideBlockLayer=function(){var $=q("#sap-ui-blocklayer-popup");$.removeClass("sapMDialogTransparentBlk");P.prototype._hideBlockLayer.call(this);};}};v.prototype._getFocusId=function(){return this.getInitialFocus()||this._getFirstFocusableContentSubHeader()||this._getFirstFocusableContentElementId()||this._getFirstVisibleButtonId()||this.getId();};v.prototype._getFirstVisibleButtonId=function(){var e=this.getBeginButton(),E=this.getEndButton(),x=this.getButtons(),y="";if(e&&e.getVisible()){y=e.getId();}else if(E&&E.getVisible()){y=E.getId();}else if(x&&x.length>0){for(var i=0;i<x.length;i++){if(x[i].getVisible()){y=x[i].getId();break;}}}return y;};v.prototype._getFirstFocusableContentSubHeader=function(){var $=this.$().find('.sapMDialogSubHeader');var e;var F=$.firstFocusableDomRef();if(F){e=F.id;}return e;};v.prototype._getFirstFocusableContentElementId=function(){var e="";var $=this.$("cont");var F=$.firstFocusableDomRef();if(F){e=F.id;}return e;};v.prototype._setInitialFocus=function(){var F=this._getFocusId();var e=sap.ui.getCore().byId(F);var i;if(e){if(e.getVisible&&!e.getVisible()){this.focus();return;}i=e.getFocusDomRef();}i=i||((F?window.document.getElementById(F):null));if(!i){this.setInitialFocus("");i=sap.ui.getCore().byId(this._getFocusId());}if(!this.getInitialFocus()){this.setAssociation('initialFocus',i?i.id:this.getId(),true);}if(D.system.desktop||(i&&!/input|textarea|select/i.test(i.tagName))){if(i){i.focus();}}else{this.focus();}};v.prototype.getScrollDelegate=function(){return this._oScroller;};v.prototype._composeAggreNameInHeader=function(e){var i;if(e==="Begin"){i="contentLeft";}else if(e==="End"){i="contentRight";}else{i="content"+e;}return i;};v.prototype._isToolbarEmpty=function(){var e=this._oToolbar.getContent().filter(function(i){return i.getMetadata().getName()!=='sap.m.ToolbarSpacer';});return e.length===0;};v.prototype._setButton=function(e,i,x){return this;};v.prototype._getButton=function(e){var i=e.toLowerCase()+"Button",x="_o"+this._firstLetterUpperCase(e)+"Button";if(D.system.phone){return this.getAggregation(i,null,true);}else{return this[x];}};v.prototype._getButtonFromHeader=function(e){if(this._header){var i=this._composeAggreNameInHeader(this._firstLetterUpperCase(e)),x=this._header.getAggregation(i);return x&&x[0];}else{return null;}};v.prototype._firstLetterUpperCase=function(e){return e.charAt(0).toUpperCase()+e.slice(1);};v.prototype._getAnyHeader=function(){var e=this.getCustomHeader();if(e){e._setRootAriaLevel("2");return e._setRootAccessibilityRole("heading");}else{var i=this.getShowHeader();if(!i){return null;}this._createHeader();return this._header;}};v.prototype._deregisterResizeHandler=function(){var W=P.getWithinAreaDomRef();if(this._resizeListenerId){d.deregister(this._resizeListenerId);this._resizeListenerId=null;}if(W===window){D.resize.detachHandler(this._onResize,this);}else{d.deregister(this._withinResizeListenerId);this._withinResizeListenerId=null;}};v.prototype._registerResizeHandler=function(){var _=this.$("scroll"),W=P.getWithinAreaDomRef();this._resizeListenerId=d.register(_.get(0),q.proxy(this._onResize,this));if(W===window){D.resize.attachHandler(this._onResize,this);}else{this._withinResizeListenerId=d.register(W,this._onResize.bind(this));}};v.prototype._deregisterContentResizeHandler=function(){if(this._sContentResizeListenerId){d.deregister(this._sContentResizeListenerId);this._sContentResizeListenerId=null;}};v.prototype._registerContentResizeHandler=function(){if(!this._sContentResizeListenerId){this._sContentResizeListenerId=d.register(this.getDomRef("scrollCont"),q.proxy(this._onResize,this));}this._onResize();};v.prototype._attachHandler=function(e){var i=this;if(!this._oButtonDelegate){this._oButtonDelegate={ontap:function(){i._oCloseTrigger=this;},onkeyup:function(){i._oCloseTrigger=this;},onkeydown:function(){i._oCloseTrigger=this;}};}if(e){e.addDelegate(this._oButtonDelegate,true,e);}};v.prototype._createToolbarButtons=function(){var e=this._getToolbar();var i=this.getButtons();var x=this.getBeginButton();var y=this.getEndButton(),z=this,E=[x,y];E.forEach(function(F){if(F&&z._oButtonDelegate){F.removeDelegate(z._oButtonDelegate);}});e.removeAllContent();if(!("_toolbarSpacer"in this)){this._toolbarSpacer=new T();}e.addContent(this._toolbarSpacer);E.forEach(function(F){z._attachHandler(F);});if(i&&i.length){i.forEach(function(F){e.addContent(F);});}else{if(x){e.addContent(x);}if(y){e.addContent(y);}}};v.prototype._getToolbar=function(){if(!this._oToolbar){this._oToolbar=new A(this.getId()+"-footer").addStyleClass("sapMTBNoBorders");this._oToolbar.addDelegate({onAfterRendering:function(){if(this.getType()===n.Message){this.$("footer").removeClass("sapContrast sapContrastPlus");}}},false,this);this.setAggregation("_toolbar",this._oToolbar);}return this._oToolbar;};v.prototype.getValueStateString=function(e){var i=sap.ui.getCore().getLibraryResourceBundle("sap.m");switch(e){case(V.Success):return i.getText("LIST_ITEM_STATE_SUCCESS");case(V.Warning):return i.getText("LIST_ITEM_STATE_WARNING");case(V.Error):return i.getText("LIST_ITEM_STATE_ERROR");case(V.Information):return i.getText("LIST_ITEM_STATE_INFORMATION");default:return"";}};v.prototype.setSubHeader=function(e){this.setAggregation("subHeader",e);if(e){e.setVisible=function(i){this.$().toggleClass('sapMDialogWithSubHeader',i);e.setProperty("visible",i);}.bind(this);}return this;};v.prototype.setLeftButton=function(e){if(typeof e==="string"){e=sap.ui.getCore().byId(e);}this.setBeginButton(e);return this.setAssociation("leftButton",e);};v.prototype.setRightButton=function(e){if(typeof e==="string"){e=sap.ui.getCore().byId(e);}this.setEndButton(e);return this.setAssociation("rightButton",e);};v.prototype.getLeftButton=function(){var e=this.getBeginButton();return e?e.getId():null;};v.prototype.getRightButton=function(){var e=this.getEndButton();return e?e.getId():null;};v.prototype.setBeginButton=function(e){if(e&&e.isA("sap.m.Button")){e.addStyleClass("sapMDialogBeginButton");}return this.setAggregation("beginButton",e);};v.prototype.setEndButton=function(e){if(e&&e.isA("sap.m.Button")){e.addStyleClass("sapMDialogEndButton");}return this.setAggregation("endButton",e);};v.prototype.getAggregation=function(e,i,x){var y=C.prototype.getAggregation.apply(this,Array.prototype.slice.call(arguments,0,2));if(e==='buttons'&&y.length===0){this.getBeginButton()&&y.push(this.getBeginButton());this.getEndButton()&&y.push(this.getEndButton());}return y;};v.prototype.getAriaLabelledBy=function(){var e=this._getAnyHeader(),i=this.getAssociation("ariaLabelledBy",[]).slice();var x=this.getSubHeader();if(x){i.unshift(x.getId());}if(e){var y=e.findAggregatedObjects(true,function(z){return z.isA("sap.m.Title");});if(y.length){i=y.map(function(z){return z.getId();}).concat(i);}else{i.unshift(e.getId());}}return i;};v.prototype.setTitle=function(e){this.setProperty("title",e,true);if(this._headerTitle){this._headerTitle.setText(e);}else{this._headerTitle=new a(this.getId()+"-title",{text:e,level:"H2"}).addStyleClass("sapMDialogTitle");this._createHeader();this._header.addContentMiddle(this._headerTitle);}return this;};v.prototype.setState=function(e){var F={},$=this.$(),N;F[e]=true;this.setProperty("state",e,true);for(N in j._mStateClasses){$.toggleClass(j._mStateClasses[N],!!F[N]);}this.setIcon(v._mIcons[e],true);return this;};v.prototype.setIcon=function(i,e){if(!e){this._externalIcon=i;}else{if(this._externalIcon){i=this._externalIcon;}}if(i){if(i!==this.getIcon()){if(this._iconImage){this._iconImage.setSrc(i);}else{this._iconImage=b.createControlByURI({id:this.getId()+"-icon",src:i,useIconTooltip:false},sap.m.Image).addStyleClass("sapMDialogIcon");this._createHeader();this._header.insertAggregation("contentMiddle",this._iconImage,0);}}}else{var x=this.getState();if(!e&&x!==V.None){if(this._iconImage){this._iconImage.setSrc(v._mIcons[x]);}}else{if(this._iconImage){this._iconImage.destroy();this._iconImage=null;}}}this.setProperty("icon",i,true);return this;};v.prototype.setType=function(e){var i=this.getType();if(i===e){return this;}this._bMessageType=(e===n.Message);return this.setProperty("type",e,false);};v.prototype.setStretch=function(e){this._bStretchSet=true;return this.setProperty("stretch",e);};v.prototype.setStretchOnPhone=function(e){if(this._bStretchSet){L.warning("sap.m.Dialog: stretchOnPhone property is deprecated. Setting stretchOnPhone property is ignored when there's already stretch property set.");return this;}this.setProperty("stretchOnPhone",e);return this.setProperty("stretch",e&&D.system.phone);};v.prototype.setVerticalScrolling=function(e){var i=this.getVerticalScrolling(),x=this._hasSingleScrollableContent();if(x){L.warning("sap.m.Dialog: property verticalScrolling automatically reset to false. See documentation.");e=false;}if(i===e){return this;}this.$().toggleClass("sapMDialogVerScrollDisabled",!e);this.setProperty("verticalScrolling",e);if(this._oScroller){this._oScroller.setVertical(e);}return this;};v.prototype.setHorizontalScrolling=function(e){var i=this.getHorizontalScrolling(),x=this._hasSingleScrollableContent();if(x){L.warning("sap.m.Dialog: property horizontalScrolling automatically reset to false. See documentation.");e=false;}if(i===e){return this;}this.$().toggleClass("sapMDialogHorScrollDisabled",!e);this.setProperty("horizontalScrolling",e);if(this._oScroller){this._oScroller.setHorizontal(e);}return this;};v.prototype.setInitialFocus=function(i){return this.setAssociation("initialFocus",i,true);};v.prototype.invalidate=function(e){if(this.isOpen()){C.prototype.invalidate.call(this,e);}};function w(e){var $=q(e);var i=$.control(0);if($.parents('.sapMDialogSection').length){return false;}if(!i||i.getMetadata().getInterfaces().indexOf("sap.m.IBar")>-1){return true;}return $.hasClass('sapMDialogTitleGroup');}if(D.system.desktop){v.prototype.ondblclick=function(e){if(w(e.target)){var $=this.$('cont');this._bDisableRepositioning=false;this._oManuallySetPosition=null;this._oManuallySetSize=null;this.oPopup&&this.oPopup._applyPosition(this.oPopup._oLastPosition,true);$.css({height:'100%'});}};v.prototype.onmousedown=function(e){if(e.which===3){return;}if(this.getStretch()||(!this.getDraggable()&&!this.getResizable())){return;}var i;var x=this;var $=q(document);var y=q(e.target);var z=y.hasClass('sapMDialogResizeHandler')&&this.getResizable();var E=function(X){i=i?clearTimeout(i):setTimeout(function(){X();},0);};var F=this._getAreaDimensions();var G={x:e.pageX,y:e.pageY,width:x._$dialog.width(),height:x._$dialog.height(),outerHeight:x._$dialog.outerHeight(),offset:{x:e.offsetX?e.offsetX:e.originalEvent.layerX,y:e.offsetY?e.offsetY:e.originalEvent.layerY},position:{x:x._$dialog.offset().left,y:x._$dialog.offset().top}};function J(){var X=x.$(),Y=x.$('cont'),Z,_;$.off("mouseup mousemove");if(z){x._$dialog.removeClass('sapMDialogResizing');Z=parseInt(X.height());_=parseInt(X.css("border-top-width"))+parseInt(X.css("border-bottom-width"));Y.height(Z+_);}}if((w(e.target)&&this.getDraggable())||z){x._bDisableRepositioning=true;x._$dialog.addClass('sapDialogDisableTransition');x._oManuallySetPosition={x:G.position.x,y:G.position.y};x._$dialog.css({left:Math.min(Math.max(F.left,x._oManuallySetPosition.x),F.right-G.width),top:Math.min(Math.max(F.top,x._oManuallySetPosition.y),F.bottom-G.height),width:G.width});}if(w(e.target)&&this.getDraggable()){$.on("mousemove",function(X){if(X.buttons===0){J();return;}E(function(){x._bDisableRepositioning=true;x._oManuallySetPosition={x:Math.max(F.left,Math.min(X.pageX-e.pageX+G.position.x,F.right-G.width)),y:Math.max(F.top,Math.min(X.pageY-e.pageY+G.position.y,F.bottom-G.outerHeight))};x._$dialog.css({top:x._oManuallySetPosition.y,left:x._oManuallySetPosition.x,right:x._bRTL?"":undefined});});});}else if(z){x._$dialog.addClass('sapMDialogResizing');var K={};var N=parseInt(x._$dialog.css('min-width'));var Q=G.x+G.width-N;var U=y.width()-e.offsetX;var W=y.height()-e.offsetY;$.on("mousemove",function(X){E(function(){x._bDisableRepositioning=true;x.$('cont').height('').width('');if(X.pageY+W>F.bottom){X.pageY=F.bottom-W;}if(X.pageX+U>F.right){X.pageX=F.right-U;}x._oManuallySetSize={width:G.width+X.pageX-G.x,height:G.height+X.pageY-G.y};if(x._bRTL){K.left=Math.min(Math.max(X.pageX,0),Q);x._oManuallySetSize.width=G.width+G.x-Math.max(X.pageX,0);}K.width=x._oManuallySetSize.width;K.height=x._oManuallySetSize.height;x._$dialog.css(K);});});}else{return;}$.on("mouseup",J);e.preventDefault();e.stopPropagation();};}v.prototype._applyContextualSettings=function(){M.prototype._applyContextualSettings.call(this,M._defaultContextualSettings);};return v;});
