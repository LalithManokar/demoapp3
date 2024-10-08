/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/fe/core/TemplateComponent","sap/ui/model/odata/v4/ODataListBinding"],function(T,O){"use strict";var a=T.extend("sap.fe.templates.ObjectPage.Component",{metadata:{properties:{},library:"sap.fe",manifest:"json"},onBeforeBinding:function(c,p){return this.getRootControl().getController().onBeforeBinding(c,p);},onAfterBinding:function(c,p){this.getRootControl().getController().onAfterBinding(c,p);},createDeferredContext:function(p){var l,t=this;l=new O(this.getModel(),p.replace("(...)",""));var v=this.getRootControl();var n=v.getController().getOwnerComponent().getRootControl();n.setBusy(true);t.getRootControl().getController().editFlow.createDocument(l,{creationMode:"Sync",noHistoryEntry:true}).catch(function(){n.setBusy(false);window.history.back();});},getViewData:function(){var v={};return v;},exit:function(){var o=this.getRootControl();if(o.getBindingContext()&&o.getBindingContext().hasPendingChanges()){o.getBindingContext().getBinding().resetChanges();}}});return a;},true);
