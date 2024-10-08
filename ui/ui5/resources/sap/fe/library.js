/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/fe/services/TemplatedViewServiceFactory","sap/fe/services/ResourceModelServiceFactory","sap/fe/services/CacheHandlerServiceFactory","sap/fe/services/NamedBindingModelServiceFactory","sap/ui/core/service/ServiceFactoryRegistry"],function(T,R,C,N,S){"use strict";sap.ui.getCore().initLibrary({name:"sap.fe",dependencies:["sap.ui.core"],types:["sap.fe.VariantManagement"],interfaces:[],controls:[],elements:[],version:"1.71.2"});sap.fe.VariantManagement={None:"None",Page:"Page",Control:"Control"};S.register("sap.fe.services.TemplatedViewService",new T());S.register("sap.fe.services.ResourceModelService",new R());S.register("sap.fe.services.CacheHandlerService",new C());S.register("sap.fe.services.NamedBindingModelService",new N());return sap.fe;},false);
