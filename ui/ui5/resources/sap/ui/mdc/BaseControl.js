/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/Control"],function(C){"use strict";var B=C.extend("sap.ui.mdc.BaseControl",{metadata:{library:"sap.ui.mdc",properties:{width:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:"100%",invalidate:true},height:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:"100%",invalidate:true},metadataDelegate:{type:"string",group:"Data"},personalization:{type:"any",multiple:false}}},renderer:C.renderer});B.prototype.setMetadataDelegate=function(m){this.oDelegatePromise=new Promise(function(r,a){sap.ui.require([m],function(M){this.DELEGATE=M;r(M);}.bind(this),function(){a("Module not found control is not ready to use");});}.bind(this));return this.setProperty("metadataDelegate",m,true);};B.prototype.exit=function(){};return B;},true);
