/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2015 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/UIComponent","sap/apf/api","sap/ui/thirdparty/jquery"],function(U,a,q){'use strict';var c=sap.ui.core.UIComponent.extend("sap.apf.base.Component",{metadata:{"manifest":"json","library":"sap.apf","publicMethods":["getApi"]},oApi:null,init:function(){var b;var m;var A;if(!this.oApi){b=c.prototype.getMetadata().getManifest();m=q.extend({},true,this.getMetadata().getManifest());if(this.getMetadata().getAllProperties().injectedApfApi){A=this.getMetadata().getAllProperties().injectedApfApi.appData.Constructor;}else{A=sap.apf.Api;}this.oApi=new A(this,undefined,{manifest:m,baseManifest:b});if(this.oApi.startupSucceeded()){sap.ui.core.UIComponent.prototype.init.apply(this,arguments);}}else{return;}},createContent:function(){sap.ui.core.UIComponent.prototype.createContent.apply(this,arguments);return this.oApi.startApf();},exit:function(){this.oApi.destroy();},getApi:function(){return this.oApi;},getInjections:function(){return{exits:{},instances:{},functions:{},constructors:{},probe:function(){}};}});return c;},true);
