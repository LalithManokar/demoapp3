/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["sap/ui/core/Control","sap/ui/core/Icon","sap/m/Text","sap/m/HBox"],function(C,I,T,H){"use strict";var L=C.extend("sap.ino.controls.LabelledIcon",{metadata:{properties:{"iconUrl":{type:"string"},"label":{type:"string"},"exportLabel":{type:"string"}},aggregations:{"_box":{type:"sap.m.HBox",multiple:false,visibility:"hidden"},"_exportText":{type:"sap.m.Text",multiple:false,visibility:"hidden"}}},init:function(){this._oRB=sap.ui.getCore().getLibraryResourceBundle("sap.ino.controls");},_getIcon:function(){return this._getBox().getItems()[0];},_getLabel:function(){return this._getBox().getItems()[1];},_getExportLabel:function(){var e=this.getAggregation("_exportText");if(!e){e=new T({text:this.getExportLabel(),wrapping:false});this.setAggregation("_exportText",e);}return e;},_getBox:function(){var b=this.getAggregation("_box");if(!b){var i=new I({src:this.getIconUrl(),useIconTooltip:false}).addStyleClass("sapInoLabelledIconIcon");var t=new T({text:this.getLabel(),wrapping:false,}).addStyleClass("sapInoLabelledIconLabel");b=new H({items:[i,t],displayInline:true});this.setAggregation("_box",b,true);}return b;},renderer:function(r,c){r.write("<div");r.writeControlData(c);r.addClass("sapInoLabelledIcon");r.writeClasses();if(c.getTooltip_Text()){r.writeAttributeEscaped("title",c.getTooltip_Text());}r.write(">");r.renderControl(c._getBox());r.write("</div>");}});L.prototype.onAfterRendering=function(){this._getLabel().data(this.data());this._getExportLabel().data(this.data());};L.prototype.bindProperty=function(k,b){C.prototype.bindProperty.apply(this,arguments);switch(k){case"label":this._getLabel().bindProperty("text",b);break;case"exportLabel":this._getExportLabel().bindProperty("text",b);break;default:break;}};L.prototype.setIconUrl=function(v){this.setProperty("iconUrl",v);this._getIcon().setSrc(v);};L.prototype.setLabel=function(v){this.setProperty("label",v);this._getLabel().setText(v);};L.prototype.setExportLabel=function(v){this.setProperty("exportLabel",v);};return L;});
