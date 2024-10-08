/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/Device','sap/ui/core/Control','sap/ui/core/Popup','sap/ui/core/theming/Parameters','./SplitContainer','./library','./ShellLayoutRenderer','sap/ui/dom/containsOrEquals','sap/base/Log',"sap/ui/thirdparty/jquery",'sap/ui/dom/jquery/Focusable'],function(D,C,P,a,S,l,b,c,L,q){"use strict";var d=C.extend("sap.ui.unified.ShellLayout",{metadata:{library:"sap.ui.unified",properties:{showPane:{type:"boolean",group:"Appearance",defaultValue:false},headerHiding:{type:"boolean",group:"Appearance",defaultValue:false},headerVisible:{type:"boolean",group:"Appearance",defaultValue:true}},defaultAggregation:"content",aggregations:{content:{type:"sap.ui.core.Control",multiple:true,singularName:"content",forwarding:{idSuffix:"-container",aggregation:"content"}},paneContent:{type:"sap.ui.core.Control",multiple:true,singularName:"paneContent",forwarding:{idSuffix:"-container",aggregation:"secondaryContent"}},header:{type:"sap.ui.core.Control",multiple:false},canvasSplitContainer:{type:"sap.ui.unified.SplitContainer",multiple:false,visibility:"hidden"},curtainSplitContainer:{type:"sap.ui.unified.SplitContainer",multiple:false,visibility:"hidden"}}}});d._SIDEPANE_WIDTH_PHONE=208;d._SIDEPANE_WIDTH_TABLET=208;d._SIDEPANE_WIDTH_DESKTOP=240;d._HEADER_ALWAYS_VISIBLE=true;d._HEADER_AUTO_CLOSE=true;d._HEADER_TOUCH_TRESHOLD=15;if(D.browser.chrome&&D.browser.version<36){d._HEADER_TOUCH_TRESHOLD=10;}d.prototype.init=function(){this._rtl=sap.ui.getCore().getConfiguration().getRTL();this._animation=sap.ui.getCore().getConfiguration().getAnimation();this._showHeader=true;this._showCurtain=false;this._iHeaderHidingDelay=3000;this._useStrongBG=false;this._cont=new S(this.getId()+"-container");this._cont._bRootContent=true;if(sap.ui.getCore().getConfiguration().getAccessibility()){var t=this;this._cont.addEventDelegate({onAfterRendering:function(){t._cont.$("canvas").attr("role","main");t._cont.$("pane").attr("role","complementary");}});}this.setAggregation("canvasSplitContainer",this._cont,true);this._curtCont=new S(this.getId()+"-curt-container");this._curtCont._bRootContent=true;this.setAggregation("curtainSplitContainer",this._curtCont,true);this._setSidePaneWidth();D.media.attachHandler(this._handleMediaChange,this,D.media.RANGESETS.SAP_STANDARD);D.resize.attachHandler(this._handleResizeChange,this);};d.prototype.exit=function(){D.media.detachHandler(this._handleMediaChange,this,D.media.RANGESETS.SAP_STANDARD);D.resize.detachHandler(this._handleResizeChange,this);delete this._cont;delete this._curtCont;};d.prototype.onAfterRendering=function(){var t=this;function h(B){var e=q.event.fix(B);if(c(t.getDomRef("hdr"),e.target)){t._timedHideHeader(e.type==="focus");}}if(window.addEventListener&&!d._HEADER_ALWAYS_VISIBLE){var H=this.getDomRef("hdr");H.addEventListener("focus",h,true);H.addEventListener("blur",h,true);}this._refreshAfterRendering();};d.prototype.onThemeChanged=function(){this._refreshAfterRendering();};d.prototype.onfocusin=function(e){var i=this.getId();if(e.target.id===i+"-curt-focusDummyOut"&&this.$("hdrcntnt").firstFocusableDomRef()){this.$("hdrcntnt").firstFocusableDomRef().focus();}else if(e.target.id===i+"-main-focusDummyOut"&&this.$("curtcntnt").firstFocusableDomRef()){this.$("curtcntnt").firstFocusableDomRef().focus();}};(function(){function _(s){if(s._startY===undefined||s._currY===undefined){return;}var y=s._currY-s._startY;if(Math.abs(y)>d._HEADER_TOUCH_TRESHOLD){s._doShowHeader(y>0);s._startY=s._currY;}}if(D.support.touch){d._HEADER_ALWAYS_VISIBLE=false;d.prototype.ontouchstart=function(e){this._startY=e.touches[0].pageY;if(this._startY>2*48){this._startY=undefined;}this._currY=this._startY;};d.prototype.ontouchend=function(e){_(this);this._startY=undefined;this._currY=undefined;};d.prototype.ontouchcancel=d.prototype.ontouchend;d.prototype.ontouchmove=function(e){this._currY=e.touches[0].pageY;_(this);};}})();d.prototype.setHeaderHiding=function(e){e=!!e;return this._mod(function(r){return this.setProperty("headerHiding",e,r);},function(){this._doShowHeader(!e?true:this._showHeader);});};d.prototype.setHeaderHidingDelay=function(i){this._iHeaderHidingDelay=i;return this;};d.prototype.getHeaderHidingDelay=function(){return this._iHeaderHidingDelay;};d.prototype.getShowPane=function(){return this._cont.getShowSecondaryContent();};d.prototype.setShowPane=function(s){this._cont.setShowSecondaryContent(s);this.setProperty("showPane",!!s,true);return this;};d.prototype.setShowCurtainPane=function(s){this._curtCont.setShowSecondaryContent(s);return this;};d.prototype.getShowCurtainPane=function(){return this._curtCont.getShowSecondaryContent();};d.prototype.setHeaderVisible=function(h){h=!!h;this.setProperty("headerVisible",h,true);this.$().toggleClass("sapUiUfdShellNoHead",!h);return this;};d.prototype.setShowCurtain=function(s){s=!!s;return this._mod(function(r){this._showCurtain=s;return this;},function(){this.$("main-focusDummyOut").attr("tabindex",s?0:-1);this.$().toggleClass("sapUiUfdShellCurtainHidden",!s).toggleClass("sapUiUfdShellCurtainVisible",s);if(s){var z=P.getNextZIndex();this.$("curt").css("z-index",z+1);this.$("hdr").css("z-index",z+3);this.$("brand").css("z-index",z+7);this.$().toggleClass("sapUiUfdShellCurtainClosed",false);}this._timedCurtainClosed(s);this._doShowHeader(true);});};d.prototype.getShowCurtain=function(){return this._showCurtain;};d.prototype.setHeader=function(h){this.setAggregation("header",h,true);h=this.getHeader();if(this.getDomRef()){if(!h){this.$("hdrcntnt").html("");}else{var r=sap.ui.getCore().createRenderManager();r.renderControl(h);r.flush(this.getDomRef("hdrcntnt"));r.destroy();}}return this;};d.prototype.destroyHeader=function(){this.destroyAggregation("header",true);this.$("hdrcntnt").html("");return this;};d.prototype.getCurtainContent=function(){return this._curtCont.getContent();};d.prototype.insertCurtainContent=function(o,i){this._curtCont.insertContent(o,i);return this;};d.prototype.addCurtainContent=function(o){this._curtCont.addContent(o);return this;};d.prototype.removeCurtainContent=function(i){return this._curtCont.removeContent(i);};d.prototype.removeAllCurtainContent=function(){return this._curtCont.removeAllContent();};d.prototype.destroyCurtainContent=function(){this._curtCont.destroyContent();return this;};d.prototype.indexOfCurtainContent=function(o){return this._curtCont.indexOfCurtainContent(o);};d.prototype.getCurtainPaneContent=function(){return this._curtCont.getSecondaryContent();};d.prototype.insertCurtainPaneContent=function(o,i){this._curtCont.insertSecondaryContent(o,i);return this;};d.prototype.addCurtainPaneContent=function(o){this._curtCont.addSecondaryContent(o);return this;};d.prototype.removeCurtainPaneContent=function(i){return this._curtCont.removeSecondaryContent(i);};d.prototype.removeAllCurtainPaneContent=function(){return this._curtCont.removeAllSecondaryContent();};d.prototype.destroyCurtainPaneContent=function(){this._curtCont.destroySecondaryContent();return this;};d.prototype.indexOfCurtainPaneContent=function(o){return this._curtCont.indexOfSecondaryContent(o);};d.prototype._setStrongBackground=function(u){this._useStrongBG=!!u;this.$("strgbg").toggleClass("sapUiStrongBackgroundColor",this._useStrongBG);};d.prototype._mod=function(m,o){var r=!!this.getDomRef();var e=m.apply(this,[r]);if(r&&o){if(o instanceof l._ContentRenderer){o.render();}else{o.apply(this);}}return e;};d.prototype._doShowHeader=function(s){var w=this._showHeader;this._showHeader=this._isHeaderHidingActive()?!!s:true;this.$().toggleClass("sapUiUfdShellHeadHidden",!this._showHeader).toggleClass("sapUiUfdShellHeadVisible",this._showHeader);if(this._showHeader){this._timedHideHeader();}if(w!=this._showHeader&&this._isHeaderHidingActive()){setTimeout(function(){try{var r=document.createEvent("UIEvents");r.initUIEvent("resize",true,false,window,0);window.dispatchEvent(r);}catch(e){L.error(e);}},500);}};d.prototype._timedHideHeader=function(e){if(this._headerHidingTimer){clearTimeout(this._headerHidingTimer);this._headerHidingTimer=null;}if(e||!d._HEADER_AUTO_CLOSE||!this._isHeaderHidingActive()||this._iHeaderHidingDelay<=0){return;}this._headerHidingTimer=setTimeout(function(){if(this._isHeaderHidingActive()&&this._iHeaderHidingDelay>0&&!c(this.getDomRef("hdr"),document.activeElement)){this._doShowHeader(false);}}.bind(this),this._iHeaderHidingDelay);};d.prototype._timedCurtainClosed=function(e){if(this._curtainClosedTimer){clearTimeout(this._curtainClosedTimer);this._curtainClosedTimer=null;}if(e){return;}var f=parseInt(a.get("_sap_ui_unified_ShellLayout_AnimDuration"));if(!this._animation||(D.browser.internet_explorer&&D.browser.version<10)){f=0;}this._curtainClosedTimer=setTimeout(function(){this._curtainClosedTimer=null;this.$("curt").css("z-index","");this.$("hdr").css("z-index","");this.$("brand").css("z-index","");this.$().toggleClass("sapUiUfdShellCurtainClosed",true);}.bind(this),f);};d.prototype._isHeaderHidingActive=function(){if(d._HEADER_ALWAYS_VISIBLE||this.getShowCurtain()||!this.getHeaderHiding()||l._iNumberOfOpenedShellOverlays>0||!this.getHeaderVisible()){return false;}return true;};d.prototype._setSidePaneWidth=function(r){if(!r){r=D.media.getCurrentRange(D.media.RANGESETS.SAP_STANDARD).name;}var w=d["_SIDEPANE_WIDTH_"+r.toUpperCase()]+"px";this._cont.setSecondaryContentSize(w);this._curtCont.setSecondaryContentSize(w);};d.prototype._handleMediaChange=function(p){if(!this.getDomRef()){return false;}this._setSidePaneWidth(p.name);};d.prototype._handleResizeChange=function(p){};d.prototype._refreshAfterRendering=function(){var o=this.getDomRef();if(!o){return false;}this._timedHideHeader();return true;};d.prototype._getSearchWidth=function(){return-1;};return d;});
