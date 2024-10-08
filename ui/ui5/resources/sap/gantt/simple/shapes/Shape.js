/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/gantt/simple/BaseShape","sap/ui/thirdparty/jquery","sap/gantt/misc/Format","sap/ui/core/theming/Parameters"],function(B,q,F,P){"use strict";var D=12;var S=B.extend("sap.gantt.simple.shapes.Shape",{metadata:{properties:{color:{type:"sap.gantt.PaletteColor",defaultValue:"sapUiLegend6"},height:{type:"sap.gantt.SVGLength",defaultValue:"auto"},width:{type:"sap.gantt.SVGLength",defaultValue:"auto"},startX:{type:"sap.gantt.SVGLength",defaultValue:"auto"},fill:{type:"sap.gantt.ValueSVGPaintServer"},fillOpacity:{type:"float",defaultValue:1.0},stroke:{type:"sap.gantt.ValueSVGPaintServer"},opacity:{type:"float",defaultValue:1.0},selectable:{type:"boolean",defaultValue:true},hoverable:{type:"boolean",defaultValue:true}}}});S.prototype.init=function(){B.prototype.init.call(this);this._bHover=false;this._bIgnoreHover=false;};S.prototype.getSelectable=function(){return true;};S.prototype.getHoverable=function(){return true;};S.prototype.getRowPadding=function(){var h=this.getHeight();if(h==="auto"||h==="inherit"){return D;}else{return 0;}};S.prototype.getPixelHeight=function(){var h=this.getHeight();if(h==="auto"||h==="inherit"){return this._iBaseRowHeight||0;}return Number(h);};S.prototype.getTranslatedColor=function(){return P.get(this.getColor());};S.prototype.getHoverBackgroundColor=function(){return P.get("sapUiButtonHoverBackground");};S.prototype.getHoverColor=function(){return P.get("sapUiButtonHoverBorderColor");};S.prototype.getSelectedColor=function(){return P.get("sapUiButtonActiveBackground");};S.prototype.getPixelWidth=function(){var w=this.getWidth();if(w!=="auto"){return Number(w);}var a=this.getAxisTime();if(!a){return 0;}var s=a.timeToView(F.abapTimestampToDate(this.getTime())),e=a.timeToView(F.abapTimestampToDate(this.getEndTime()));if(q.isNumeric(s)&&q.isNumeric(e)){return Math.abs(e-s);}else{return 0;}};S.prototype.getXStart=function(){var s=this.getProperty("startX");if(s!=="auto"){return Number(s);}var a=this.getAxisTime();if(!a){return 0;}var r=sap.ui.getCore().getConfiguration().getRTL();return Number(a.timeToView(F.abapTimestampToDate(r?(this.getEndTime()||this.getTime()):this.getTime())));};S.prototype.getXEnd=function(){if(this.getProperty("startX")!=="auto"){return this.getXStart()+this.getPixelWidth();}var a=this.getAxisTime();if(!a){return 0;}var r=sap.ui.getCore().getConfiguration().getRTL();return Number(a.timeToView(F.abapTimestampToDate(r?(this.getTime()||this.getEndTime()):this.getEndTime())));};S.prototype.renderElement=function(r){throw new Error("This function must be overridden in implementing classes.");};S.prototype.renderContent=function(r){throw new Error("This function must be overridden in implementing classes.");};S.prototype.generateArcRadius=function(f,s){return Math.min(3,Math.min(f,s));};S.prototype.getHoverState=function(){return this._bHover;};S.prototype.hoverStateChange=function(h){if(this.getHoverState()!==h&&!this._bIgnoreHover){this._bHover=h;this.rerenderShape();}};S.prototype.setSelected=function(v){this.setProperty("selected",v,true);if(this.getHoverState()){this._bHover=false;this._bIgnoreHover=true;}this.rerenderShape();};S.prototype.onmouseover=function(e){if(!this.getHoverable()){return;}B.prototype.onmouseover.call(this,e);this.hoverStateChange(true);};S.prototype.onmouseout=function(e){if(!this.getHoverable()){return;}B.prototype.onmouseout.call(this,e);this._bIgnoreHover=false;this.hoverStateChange(false);};S.prototype.rerenderShape=function(){var d=this.getDomRef();if(d){var r=sap.ui.getCore().createRenderManager();this.renderContent(r);r.flush(d);r.destroy();}else{this.invalidate();}};return S;});
