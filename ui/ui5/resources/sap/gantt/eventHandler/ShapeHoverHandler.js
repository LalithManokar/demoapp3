/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object"],function(B){"use strict";var S=B.extend("sap.gantt.eventHandler.ShapeHoverHandler",{constructor:function(c){B.call(this);this._oSourceChart=c;this._oShapeManager=c._oShapeManager;this._oLastHoverShapeUID=undefined;this._oLastHoverShapeData=undefined;this._sHoverDelayCall=undefined;this._iHoverDelayInMillionsecond=500;}});S.prototype.handleShapeHover=function(s,e){if(this._oSourceChart._bDragStart){if(e&&this._oLastHoverShapeUID!==undefined){window.clearTimeout(this._sHoverDelayCall);this.fireMouseLeave(e);}}else{if(e){var a=e.target.getAttribute("class")?e.target.getAttribute("class").split(" ")[0]:undefined;window.clearTimeout(this._sHoverDelayCall);this._sHoverDelayCall=window.setTimeout(this.fireHoverEvent.bind(this),this._iHoverDelayInMillionsecond,s,a,e);}}};S.prototype.fireHoverEvent=function(s,a,e){if(!s&&this._oLastHoverShapeUID!==undefined){this.fireMouseLeave(e);}else if(this._oShapeManager.isShapeHoverable(s,a)){if(this._oLastHoverShapeUID!==s.uid){if(this._oLastHoverShapeUID!==undefined){this.fireMouseLeave(e);}this.fireMouseEnter(s,e);}}else{if(this._oLastHoverShapeUID!==undefined){this.fireMouseLeave(e);}}};S.prototype.fireMouseEnter=function(c,o){this._oLastHoverShapeUID=c.uid;this._oLastHoverShapeData=c;this._oSourceChart.fireShapeMouseEnter({shapeData:c,pageX:o.pageX,pageY:o.pageY,originEvent:o});};S.prototype.fireMouseLeave=function(o){this._oSourceChart.fireShapeMouseLeave({shapeData:this._oLastHoverShapeData,originEvent:o});this._oLastHoverShapeUID=undefined;this._oLastHoverShapeData=undefined;};return S;},true);
