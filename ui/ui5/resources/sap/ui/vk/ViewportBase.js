/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/core/Control","./library","./SelectionMode","./RenderMode"],function(C,v,S,R){"use strict";var V=C.extend("sap.ui.vk.ViewportBase",{metadata:{library:"sap.ui.vk","abstract":true,properties:{showDebugInfo:{type:"boolean",defaultValue:false},backgroundColorTop:{type:"sap.ui.core.CSSColor",defaultValue:"rgba(50, 50, 50, 1)"},backgroundColorBottom:{type:"sap.ui.core.CSSColor",defaultValue:"rgba(255, 255, 255, 1)"},width:{type:"sap.ui.core.CSSSize",defaultValue:"100%"},height:{type:"sap.ui.core.CSSSize",defaultValue:"100%"},selectionMode:{type:"sap.ui.vk.SelectionMode",defaultValue:S.Sticky},freezeCamera:{type:"boolean",defaultValue:false},renderMode:{type:"sap.ui.vk.RenderMode",defaultValue:R.Default}},associations:{contentConnector:{type:"sap.ui.vk.ContentConnector",multiple:false},viewStateManager:{type:"sap.ui.vk.ViewStateManager",multiple:false},tools:{type:"sap.ui.vk.tools.Tool",multiple:true}},aggregations:{content:{type:"sap.ui.core.Control",multiple:true}},events:{urlClicked:{parameters:{nodeRef:"any",url:"string"},enableEventBubbling:true},nodeClicked:{parameters:{nodeRef:"any",x:"int",y:"int"},enableEventBubbling:true},resize:{parameters:{size:"object"},enableEventBubbling:true},nodesPicked:{parameters:{picked:{type:"any[]"}},enableEventBubbling:true},nodeZoomed:{parameters:{zoomed:{type:"any"},isZoomIn:{type:"boolean"}},enableEventBubbling:true},viewActivated:{parameters:{viewIndex:"int",view:"sap.ui.vk.View",type:{type:"string"}},enableEventBubbling:true},procedureFinished:{enableEventBubbling:true},viewFinished:{parameters:{viewIndex:"int"},enableEventBubbling:true},animationStarted:{enableEventBubbling:true},animationFinished:{enableEventBubbling:true},animationUpdated:{parameters:{value:"float"},enableEventBubbling:true}}}});var b=V.getMetadata().getParent().getClass().prototype;V.prototype.init=function(){if(b.init){b.init.call(this);}this._camera=null;};V.prototype.exit=function(){if(this._camera){if(this._contentConnector){var c=this._contentConnector.getContentManager();if(c){c.destroyCamera(this._camera);}this._camera=null;}}if(b.exit){b.exit.call(this);}};V.prototype.getImage=function(w,h){return null;};V.prototype.stickySelectionHandler=function(n){if(this._viewStateManager==null){return;}if(n.length===0){var c=[];this._viewStateManager.enumerateSelection(function(e){c.push(e);});if(c.length>0){this._viewStateManager.setSelectionStates([],c);}}else{var s=[];var d=[];var i=this._viewStateManager.getSelectionState(n);for(var a=0;a<i.length;a++){if(i[a]){d.push(n[a]);}else{s.push(n[a]);}}this._viewStateManager.setSelectionStates(s,d);}};V.prototype.exclusiveSelectionHandler=function(n){if(this._viewStateManager==null){return;}var a=true;if(n.length===1){a=!this._viewStateManager.getSelectionState(n[0]);}else if(n.length>1){var i=this._viewStateManager.getSelectionState(n);for(var c=0;c<i.length;c++){if(i[c]){a=false;break;}}}var u=[];if(n.length===0||a){this._viewStateManager.enumerateSelection(function(s){u.push(s);});}this._viewStateManager.setSelectionStates(n,u);};V.prototype.setCamera=function(c){if(c!==this._camera){if(this._camera&&this._contentConnector){var a=this._contentConnector.getContentManager();if(a){a.destroyCamera(this._camera);}}}this._camera=c;return this;};V.prototype.getCamera=function(){return this._camera;};V.prototype._onBeforeClearContentConnector=function(){this.setCamera(null);};V.prototype.activateView=function(a,n){return this;};V.prototype.pan=function(d,a){return this;};V.prototype.rotate=function(d,a){return this;};V.prototype.zoom=function(d){return this;};return V;});
