/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2013 SAP AG. All rights reserved
 */
sap.ui.define(["sap/landvisz/library","sap/ui/core/Control","sap/ui/core/CustomData","sap/ui/commons/Image","sap/ui/commons/MenuButton","sap/ui/commons/Menu","sap/ui/commons/MenuItem","./ActionBarRenderer"],function(l,C,a,I,M,b,c,A){"use strict";var d=l.ActionType;var E=l.EntityCSSSize;var e=C.extend("sap.landvisz.internal.ActionBar",{metadata:{library:"sap.landvisz",properties:{actionLabel:{type:"string",group:"Data",defaultValue:null},renderingSize:{type:"sap.landvisz.EntityCSSSize",group:"Dimension",defaultValue:E.Regular},iconSrc:{type:"sap.ui.core.URI",group:"Data",defaultValue:null},actionType:{type:"sap.landvisz.ActionType",group:"Data",defaultValue:d.NORMAL},menuData:{type:"object",group:"Data",defaultValue:null},actionTooltip:{type:"string",group:"Data",defaultValue:null},enable:{type:"boolean",group:"Identification",defaultValue:true},changeView:{type:"boolean",group:"Identification",defaultValue:false}},aggregations:{menu:{type:"sap.ui.commons.Menu",multiple:true,singularName:"menu"}},events:{select:{}}}});e.prototype.init=function(){this.initializationDone=false;this.lastButton=false;this.selectedItem;this.systemId="";};e.prototype.exit=function(){this.customAction&&this.customAction.destroy();this.oActToolBar&&this.oActToolBar.destroy();this.oToolBarBtn&&this.oToolBarBtn.destroy();};e.prototype.initControls=function(){var f=this.getId();this.oToolBarBtn;this.oActToolBar;if(!this.customActionIcon&&this.getIconSrc()&&this.getIconSrc()!="")this.customActionIcon=new I(f+"-CLVCustomActionImg");if(!this.menuButton)this.menuButton=new M(f+'-'+"MenuButton");};e.prototype.onclick=function(o){if(this.getEnable()==false)o.preventDefault();else this.fireSelect();};e.prototype.onsapenter=function(o){if(this.getEnable()==false)o.preventDefault();else this.fireSelect();};e.prototype.nsapenter=function(o){if(this.getEnable()==false)o.preventDefault();else this.fireSelect();};e.prototype.getSelectedItem=function(){return this.selectedItem;};e.prototype.getSystemId=function(){return this.systemId;};e.prototype.setSelectedItemSubAction=function(s){var m=this.getMenuData();var f=this._addSubActions(m,s);};e.prototype._addSubActions=function(m,s){for(var i=0;i<m.length;i++){if(this.selectedItem.getText()==m[i].text){m[i].subActions=s;return;}}};e.prototype._createMenu=function(m){var f=null;var g=null;var h=new b();h.addStyleClass("sapLandviszMenuItemBorber");for(var i=0;i<m.length;i++){g=m[i];f=new c({text:g.text,tooltip:g.tooltip});if(g.customdata){var j=new a({key:g.customdata,});f.addCustomData(j);}h.addItem(f);if(g.subActions&&g.subActions.length>0){var s=this._createMenu(g.subActions);f.setSubmenu(s);}}return h;};return e;});
