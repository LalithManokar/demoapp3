/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/thirdparty/jquery","sap/base/Log","sap/base/util/ObjectPath","sap/ui/base/EventProvider","./Utility","sap/gantt/shape/ResizeShadowShape","sap/gantt/shape/ext/rls/SelectedRelationship","sap/gantt/shape/SelectedShape","sap/gantt/shape/Group","sap/gantt/shape/Text"],function(q,L,O,E,U){"use strict";var S=E.extend("sap.gantt.misc.ShapeManager",{constructor:function(g){E.apply(this);this.mShapeElementIds={};this.mShapeConfig={};this.mShapeInstance={};this.aShapeInstance=[];this.oGantt=g;}});S.prototype.instantiateShapes=function(s){this.mShapeConfig={};for(var i=0;i<s.length;i++){this.mShapeConfig[s[i].getKey()]=s[i];}return this.recursiveInstantiateShapes(this.mShapeConfig).then(function(a){this.aShapeInstance=a;q.each(this.aShapeInstance,function(k,o){this.mShapeInstance[o.mShapeConfig.getKey()]=o;}.bind(this));}.bind(this));};S.prototype.getAllShapeInstances=function(){return this.aShapeInstance;};S.prototype.getSelectedShapeInstance=function(s,o){if(this.bDestroyed){return Promise.reject();}var c=o.getCategory(null,this.oGantt.getAxisTime(),this.oGantt.getAxisOrdinal());var a=s.getSelectedClassName();if(!a){if(c===sap.gantt.shape.ShapeCategory.Relationship){a="sap.gantt.shape.ext.rls.SelectedRelationship";}else{a="sap.gantt.shape.SelectedShape";}}return this.instantiateShapeClass(a);};S.prototype.recursiveInstantiateShapes=function(s,p){var h=function(k){var o;var a=p?p:k;var i=p?p+"_"+k:k;var b=s[k];var c=b.getShapeClassName();if(c){return this.instantiateShapeClass(c).then(function(d){o=d;this.setSpecialProperty(o,b);this.setShapeElementId(i,a,o.getId());var P;if(!p){P=this.getSelectedShapeInstance(b,o).then(function(e){this.setSpecialProperty(e,b);o.setAggregation("selectedShape",e);i=a+"_selected"+a;this.setShapeElementId(i,undefined,e.getId());return this._createResizeShadowShape(b,o,a+"_resizeShadow"+a);}.bind(this));}else{P=Promise.resolve();}P=P.then(function(){var e=b.getGroupAggregation();if(e&&e instanceof Array){return this.recursiveInstantiateShapes(e,a).then(function(A){A.forEach(o.addShape,o);});}}.bind(this)).then(function(){var e=b.getClippathAggregation();if(e&&e instanceof Array){return this.recursiveInstantiateShapes(e,a).then(function(f){f.forEach(o.addPath,o);});}return o;}.bind(this));return P;}.bind(this));}else{return Promise.resolve(null);}}.bind(this);return Promise.all(Object.keys(s).map(h)).then(function(i){i=i.filter(function(I){return!!I;});if(!p){this.sortByShapeLevelAccendingly(i);}return i;}.bind(this));};S.prototype.setSpecialProperty=function(s,o){s.mShapeConfig=o;s.mChartInstance=this.oGantt;s.dataSet=[];};S.prototype.sortByShapeLevelAccendingly=function(i){i.sort(function(s,o){var l=s.mShapeConfig.getLevel(),a=o.mShapeConfig.getLevel();var b=q.isNumeric(l)?l:99;var c=q.isNumeric(a)?a:99;return c-b;});};S.prototype.loadClass=function(s){return new Promise(function(r){var a=O.get(s);if(a){r(a);}else{sap.ui.require([s.replace(/\./g,"/")],function(a){r(a);});}});};S.prototype.instantiateShapeClass=function(s){return this.loadClass(s).then(function(a){var o=new a();if(!o){L.error("shapeClassName:"+s+" can't be instantiated");L.warning("shapeClassName:"+s+" fallback to sap.gantt.shape.Shape");o=new sap.gantt.shape.Shape();}return o;});};S.prototype.isShapeSelectable=function(s,e){return this.getShapePropertyValue("enableSelection",s,e);};S.prototype.isShapeResizable=function(s,e){return this.getShapePropertyValue("enableResize",s,e);};S.prototype.isShapeDuration=function(s,e){return this.getShapePropertyValue("isDuration",s,e);};S.prototype.isShapeHoverable=function(s,e){return this.getShapePropertyValue("enableHover",s,e);};S.prototype.getShapePropertyValue=function(p,s,e){var i,v;if(s){i=this.getShapeInstance(s,e)||sap.ui.getCore().byId(e);var m="get"+p.substr(0,1).toUpperCase()+p.substr(1);v=(i&&i[m])?i[m](s):v;}return v;};S.prototype.isShapeDraggable=function(s,e){return this.getShapePropertyValue("enableDnD",s,e);};S.prototype.setShapeElementId=function(i,s,a){this.mShapeElementIds[i]={"shapeElementId":a,"shapeKey":s};};S.prototype.getShapeInstance=function(s,a){var c={};if(a){c=this._getShapeElementConfig(a);}else{var b=U.getShapeDataNameByUid(s.uid);for(var d in this.mShapeInstance){var e=this.mShapeInstance[d].mShapeConfig.getShapeDataName();if(b===e){c=this.mShapeElementIds[d];break;}}}return this.mShapeInstance[c?c.shapeKey:null];};S.prototype._getShapeElementConfig=function(s){for(var a in this.mShapeElementIds){var c=this.mShapeElementIds[a];if(c.shapeElementId===s){return c;}}return null;};S.prototype.collectDataForSelectedShapes=function(s,o,c){var m=this.mShapeInstance;for(var a in m){var b=m[a];var d=b.mShapeConfig.getShapeDataName();var e=b.getAggregation("selectedShape");var C=e.getCategory(null,this.oGantt.getAxisTime(),this.oGantt._oAxisOrdinal);e.dataSet=[];if(C===sap.gantt.shape.ShapeCategory.Relationship){var f=s.getSelectedRelationships();e.dataSet.push({"shapeData":f});}else{var g=s.getSelectedShapeDatum();for(var i=0;i<g.length;i++){var h=g[i];if(U.getShapeDataNameByUid(h.uid)!==d){continue;}var r=U.getRowDatumByShapeUid(h.uid,this.oGantt.getId());var v=s.isSelectedShapeVisible(h.uid,this.oGantt.getId());if(r&&v&&this.isShapeSelectable(h,b.getId())&&this.isShapeDisplayableInRow(r,a,o,c)){e.dataSet.push({"objectInfoRef":r,"shapeData":[h]});}}}}};S.prototype.collectDataForAllShapeInstances=function(r,o,c){var j=true;var s=this.mShapeInstance;for(var a in s){var b=s[a];var d;var B=b.mShapeConfig.getShapeDataName();b.dataSet=[];if(b._attributeNameBindingMap){b._attributeNameBindingMap=undefined;}for(var i=0;i<r.length;i++){var R=r[i];if(!B){b.dataSet.push({"objectInfoRef":R,"shapeData":R.data});continue;}var D=this.isShapeDisplayableInRow(R,a,o,c);if(!D){continue;}if(j){d=R.data[B];}else if(B===R.shapeName){d=R.shapeData;}else{continue;}if(d){b.dataSet.push({"objectInfoRef":R,"shapeData":d});}}}};S.prototype.isShapeDisplayableInRow=function(r,s,o,c){var C;if(r.chartScheme){C=r.chartScheme;}else{C=o[r.type]?o[r.type].getMainChartSchemeKey():sap.gantt.config.DEFAULT_CHART_SCHEME_KEY;}var a=c[C];if(a===undefined){return false;}var b=a.getShapeKeys();var m=a.getModeKey()!==sap.gantt.config.DEFAULT_MODE_KEY?a.getModeKey():this.oGantt.getMode();var d=this.mShapeConfig;if((C!==sap.gantt.config.DEFAULT_CHART_SCHEME_KEY&&b.indexOf(s)===-1)||(m!==sap.gantt.config.DEFAULT_MODE_KEY&&d[s].getModeKeys()&&d[s].getModeKeys().length>0&&d[s].getModeKeys().indexOf(m)<0)||!r.data){return false;}return true;};S.prototype.isRelationshipDisplayable=function(s){var m=this.mShapeConfig;var a=s.mShapeConfig.getKey();var b=m[a]?m[a].getModeKeys():[];if(q.inArray(this.oGantt.getMode(),b)===-1&&this.oGantt.getMode()!==sap.gantt.config.DEFAULT_MODE_KEY){return false;}return true;};S.prototype.getResizeShadowShapeInstance=function(s,o){if(this.bDestroyed){return Promise.reject();}var c=o.getCategory(null,this.oGantt.getAxisTime(),this.oGantt.getAxisOrdinal());var r=s.getResizeShadowClassName();if(!r||r===""){if(c===sap.gantt.shape.ShapeCategory.InRowShape){r="sap.gantt.shape.ResizeShadowShape";}else{return Promise.resolve(null);}}return this.instantiateShapeClass(r);};S.prototype._createResizeShadowShape=function(s,o,r){return this.getResizeShadowShapeInstance(s,o).then(function(R){if(this.bDestroyed){return;}if(R){this.setSpecialProperty(R,s);o.setAggregation("resizeShadowShape",R);this.setShapeElementId(r,undefined,R.getId());}}.bind(this));};S.prototype.destroy=function(){this.bDestroyed=true;};S.prototype._createResizeShadowShapeSync=function(s,o,r){var R=this.getResizeShadowShapeInstanceSync(s,o);if(R){this.setSpecialProperty(R,s);o.setAggregation("resizeShadowShape",R);this.setShapeElementId(r,undefined,R.getId());}};S.prototype.getResizeShadowShapeInstanceSync=function(s,o){var r=null;var c=o.getCategory(null,this.oGantt.getAxisTime(),this.oGantt.getAxisOrdinal());var R=s.getResizeShadowClassName();if(!R||R===""){if(c===sap.gantt.shape.ShapeCategory.InRowShape){R="sap.gantt.shape.ResizeShadowShape";}else{return null;}}r=this.instantiateShapeClassSync(R);return r;};S.prototype.instantiateShapeClassSync=function(s){var C=O.get(s);if(!C){throw new Error("Class "+s+" not preloaded. Please add it to require of your"+" controller to ensure that it's initialized before this point or use Gantt 2.0.");}var o=new C();if(!o){L.error("shapeClassName:"+s+" can't be instantiated");L.warning("shapeClassName:"+s+" fallback to sap.gantt.shape.Shape");o=new sap.gantt.shape.Shape();}return o;};S.prototype.recursiveInstantiateShapesSync=function(s,p){var i=[],o;for(var K in s){var a=p?p:K;var I=p?p+"_"+K:K;var b=s[K];var c=b.getShapeClassName();if(c){o=this.instantiateShapeClassSync(c);this.setSpecialProperty(o,b);this.setShapeElementId(I,a,o.getId());if(!p){var d=this.getSelectedShapeInstanceSync(b,o);this.setSpecialProperty(d,b);o.setAggregation("selectedShape",d);I=a+"_selected"+a;this.setShapeElementId(I,undefined,d.getId());this._createResizeShadowShapeSync(b,o,a+"_resizeShadow"+a);}var e=b.getGroupAggregation();if(e&&e instanceof Array){var A=this.recursiveInstantiateShapesSync(e,a);for(var k=0;k<A.length;k++){o.addShape(A[k]);}}var f=b.getClippathAggregation();if(f&&f instanceof Array){var P=this.recursiveInstantiateShapesSync(f,a);for(var j=0;j<P.length;j++){o.addPath(P[j]);}}}i.push(o);}if(!p){this.sortByShapeLevelAccendingly(i);}return i;};S.prototype.getSelectedShapeInstanceSync=function(s,o){var a=null;var c=o.getCategory(null,this.oGantt.getAxisTime(),this.oGantt.getAxisOrdinal());var b=s.getSelectedClassName();if(!b){if(c===sap.gantt.shape.ShapeCategory.Relationship){b="sap.gantt.shape.ext.rls.SelectedRelationship";}else{b="sap.gantt.shape.SelectedShape";}}a=this.instantiateShapeClassSync(b);return a;};S.prototype.instantiateShapesSync=function(s){this.mShapeConfig={};for(var i=0;i<s.length;i++){this.mShapeConfig[s[i].getKey()]=s[i];}this.aShapeInstance=this.recursiveInstantiateShapesSync(this.mShapeConfig);q.each(this.aShapeInstance,function(k,o){this.mShapeInstance[o.mShapeConfig.getKey()]=o;}.bind(this));};return S;});
