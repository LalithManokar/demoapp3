/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/ui/core/UIComponent","sap/apf/api"],function(U,a){'use strict';var c=sap.ui.core.UIComponent.extend("sap.apf.Component",{oApi:null,metadata:{"config":{"fullWidth":true},"name":"CoreComponent","version":"0.0.1","publicMethods":["getApi"],"dependencies":{"libs":["sap.m","sap.ui.layout","sap.viz","sap.ui.comp","sap.suite.ui.commons"]}},init:function(){if(!this.oApi){this.oApi=new sap.apf.Api(this);}var b=this.oApi.getStartParameterFacade().getApplicationConfigurationPath();if(b){this.oApi.loadApplicationConfig(b);}sap.ui.core.UIComponent.prototype.init.apply(this,arguments);},createContent:function(){sap.ui.core.UIComponent.prototype.createContent.apply(this,arguments);return this.oApi.startApf();},exit:function(){try{this.oApi.destroy();}catch(e){}},getApi:function(){return this.oApi;}});return c;},true);
