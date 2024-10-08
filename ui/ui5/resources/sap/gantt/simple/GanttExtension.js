/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object"],function(B){"use strict";var G=B.extend("sap.gantt.simple.GanttExtension",{_gantt:null,_settings:null,constructor:function(g,s){B.call(this);this._gantt=g;this._settings=s||{};var e=this._init(this._gantt,this._settings);if(e){var t=this;g["_get"+e]=function(){return t;};}},destroy:function(){this._detachEvents();this._gantt=null;B.prototype.destroy.apply(this,arguments);},getInterface:function(){return this;}});G.prototype.getGantt=function(){return this._gantt;};G.prototype.getDomRefs=function(){var b=function(s){return window.document.getElementById(this.getGantt().getId()+s);}.bind(this);var h=b("-header-svg"),H=null;if(h){H=h.parentNode;}return{gantt:b("-gantt"),ganttSvg:b("-svg"),header:H,headerSvg:h};};G.prototype._init=function(g,s){return null;};G.prototype._attachEvents=function(){};G.prototype._detachEvents=function(){};G.attachEvents=function(g){if(!g._aExtensions){return;}for(var i=0;i<g._aExtensions.length;i++){g._aExtensions[i]._attachEvents();}};G.detachEvents=function(g){if(!g._aExtensions){return;}for(var i=0;i<g._aExtensions.length;i++){g._aExtensions[i]._detachEvents();}};G.enrich=function(g,E,s){if(!E||!(E.prototype instanceof G)){return null;}var e=new E(g,s);if(!g._aExtensions){g._aExtensions=[];}g._aExtensions.push(e);return e;};G.cleanup=function(g){if(!g._bExtensionsInitialized||!g._aExtensions){return;}for(var i=0;i<g._aExtensions.length;i++){g._aExtensions[i].destroy();}delete g._aExtensions;delete g._bExtensionsInitialized;};return G;});
