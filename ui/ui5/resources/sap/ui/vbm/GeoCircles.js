/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
sap.ui.define(['./VoAggregation','./library'],function(V,l){"use strict";var G=V.extend("sap.ui.vbm.GeoCircles",{metadata:{library:"sap.ui.vbm",properties:{posChangeable:{type:"boolean",group:"Misc",defaultValue:true},radiusChangeable:{type:"boolean",group:"Misc",defaultValue:true}},defaultAggregation:"items",aggregations:{items:{type:"sap.ui.vbm.GeoCircle",multiple:true,singularName:"item"}},events:{}}});G.prototype.getBindInfo=function(){var b=V.prototype.getBindInfo.apply(this,arguments);var t=this.getTemplateBindingInfo();b.C=(t)?t.hasOwnProperty("color"):true;b.CB=(t)?t.hasOwnProperty("colorBorder"):true;b.P=(t)?t.hasOwnProperty("position"):true;b.NS=(t)?t.hasOwnProperty("slices"):true;b.R=(t)?t.hasOwnProperty("radius"):true;return b;};G.prototype.getTemplateObject=function(){var t=V.prototype.getTemplateObject.apply(this,arguments);var b=this.mBindInfo=this.getBindInfo();var v=(b.hasTemplate)?this.getBindingInfo("items").template:null;t["type"]="{00100000-2013-0004-B001-686F01B57873}";if(b.P){t["midpoint.bind"]=t.id+".P";}else{t.pos=v.getPosition();}if(b.NS){t["slices.bind"]=t.id+".NS";}else{t.slices=v.getSlices();}if(b.C){t["color.bind"]=t.id+".C";}else{t.color=v.getColor();}if(b.CB){t["colorBorder.bind"]=t.id+".CB";}else{t.colorBorder=v.getColorBorder();}if(b.R){t["radius.bind"]=t.id+".R";}else{t.radius=v.getRadius();}return t;};G.prototype.getTypeObject=function(){var t=V.prototype.getTypeObject.apply(this,arguments);var b=this.mBindInfo;if(b.P){t.A.push({"changeable":this.getPosChangeable().toString(),"name":"P","alias":"P","type":"vector"});}if(b.R){t.A.push({"changeable":this.getRadiusChangeable().toString(),"name":"R","alias":"R","type":"double"});}if(b.C){t.A.push({"name":"C","alias":"C","type":"color"});}if(b.CB){t.A.push({"name":"CB","alias":"CB","type":"color"});}if(b.NS){t.A.push({"name":"NS","alias":"NS","type":"long"});}return t;};G.prototype.getActionArray=function(){var a=V.prototype.getActionArray.apply(this,arguments);var i=this.getId();if(this.mEventRegistry["click"]||this.isEventRegistered("click")){a.push({"id":i+"1","name":"click","refScene":"MainScene","refVO":i,"refEvent":"Click","AddActionProperty":[{"name":"pos"}]});}if(this.mEventRegistry["contextMenu"]||this.isEventRegistered("contextMenu")){a.push({"id":i+"2","name":"contextMenu","refScene":"MainScene","refVO":i,"refEvent":"ContextMenu"});}if(this.mEventRegistry["drop"]||this.isEventRegistered("drop")){a.push({"id":i+"3","name":"drop","refScene":"MainScene","refVO":i,"refEvent":"Drop"});}return a;};return G;});
