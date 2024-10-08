/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["jquery.sap.global","sap/ui/core/Control","sap/m/Image"],function(q,C,I){"use strict";var V=I.extend("sap.ui.vk.ViewGalleryThumbnail",{metadata:{associations:{viewGallery:{type:"sap.ui.vk.ViewGallery"}},properties:{enabled:{type:"boolean",defaultValue:true},thumbnailWidth:{type:"sap.ui.core.CSSSize",defaultValue:"5rem"},thumbnailHeight:{type:"sap.ui.core.CSSSize",defaultValue:"5rem"},source:{type:"string",defaultValue:""},tooltip:{type:"string",defaultValue:""},selected:{type:"boolean",defaultValue:false},processing:{type:"boolean",defaultValue:false},animated:{type:"boolean",defaultValue:false}}}});V.prototype.init=function(){};V.prototype.getViewGallery=function(){var a=sap.ui.getCore().byId(this.getAssociation("viewGallery"));if(a instanceof sap.ui.vk.ViewGallery){return a;}};V.prototype._getIndex=function(){var a=this.getViewGallery();var i=a._viewItems.indexOf(this);return i;};return V;});
