/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/f/library","sap/f/cards/BaseContent","sap/ui/util/openWindow","sap/m/List","sap/m/StandardListItem","sap/ui/base/ManagedObject","sap/f/cards/IconFormatter","sap/f/cards/BindingHelper"],function(l,B,o,s,S,M,I,a){"use strict";var A=l.cards.AreaType;var L=B.extend("sap.f.cards.ListContent",{renderer:{}});L.prototype._getList=function(){if(this._bIsBeingDestroyed){return null;}var b=this.getAggregation("_content");if(!b){b=new s({id:this.getId()+"-list",growing:false,showNoData:false,showSeparators:"None"});this.setAggregation("_content",b);}return b;};L.prototype.init=function(){B.prototype.init.apply(this,arguments);var b=this._getList();var t=this;b.attachUpdateFinished(function(){if(t._iVisibleItems){var c=b.getItems();for(var i=t._iVisibleItems+1;i<c.length;i++){c[i].setVisible(false);}}});this._oItemTemplate=new S({iconDensityAware:false});};L.prototype.exit=function(){B.prototype.exit.apply(this,arguments);if(this._oItemTemplate){this._oItemTemplate.destroy();this._oItemTemplate=null;}};L.prototype.setConfiguration=function(c){B.prototype.setConfiguration.apply(this,arguments);if(!c){return this;}if(c.items){this._setStaticItems(c.items);return this;}if(c.item){this._setItem(c.item);}return this;};L.prototype._setItem=function(i){i.title&&this._bindObjectItemProperty("title",i.title);i.description&&this._bindObjectItemProperty("description",i.description);i.icon&&i.icon.src&&a.bindProperty(this._oItemTemplate,"icon",i.icon.src,function(v){return I.formatSrc(v,this._sAppId);}.bind(this));i.highlight&&a.bindProperty(this._oItemTemplate,"highlight",i.highlight);i.info&&a.bindProperty(this._oItemTemplate,"info",i.info.value);i.info&&a.bindProperty(this._oItemTemplate,"infoState",i.info.state);this._oActions.setAreaType(A.ContentItem);this._oActions.attach(i,this);var b={template:this._oItemTemplate};this._bindAggregation("items",this._getList(),b);};L.prototype._setStaticItems=function(i){var b=this._getList();i.forEach(function(c){var d=new S({iconDensityAware:false,title:c.title?c.title:"",description:c.description?c.description:"",icon:c.icon?c.icon:"",infoState:c.infoState?c.infoState:"None",info:c.info?c.info:"",highlight:c.highlight?c.highlight:"None"});if(c.action){d.setType("Navigation");if(c.action.url){d.attachPress(function(){o(c.action.url,c.target||"_blank");});}}b.addItem(d);});this.fireEvent("_actionContentReady");};L.prototype._bindObjectItemProperty=function(p,P){if(typeof P==="string"){a.bindProperty(this._oItemTemplate,p,P);}else{a.bindProperty(this._oItemTemplate,p,P.value);}};L.prototype.getInnerList=function(){return this._getList();};return L;});
