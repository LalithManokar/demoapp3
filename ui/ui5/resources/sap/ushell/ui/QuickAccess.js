//Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/thirdparty/jquery","sap/ui/core/Fragment","sap/ui/model/json/JSONModel","sap/ushell/Config","sap/ushell/resources","sap/ushell/services/AppType","sap/ushell/utils","sap/ushell/utils/WindowUtils"],function(q,F,J,C,r,A,u,W){"use strict";var Q={oModel:new J({recentActivities:[],frequentActivities:[]}),sFocusIdAfterClose:null,_createQuickAccessDialog:function(){var t=this;var p=F.load({name:"sap.ushell.ui.QuickAccess",type:"XML",controller:this});p.then(function(f){t.oQuickAccessDialog=f;t.oQuickAccessDialog.setModel(t.oModel);t.oQuickAccessDialog.addEventDelegate({onkeydown:function(e){if(e.keyCode===27){t._closeDialog();}}});sap.ui.getCore().byId("shell").addDependent(t.oQuickAccessDialog);});return Promise.resolve(p);},_updateQuickAccessDialog:function(d){var U=sap.ushell.Container.getService("UserRecents"),I=d.getContent()[0],t=this,R,f;if(U&&I){I.setBusy(true);R=U.getRecentActivity().then(function(a){for(var i=0;i<a.length;i++){a[i].timestamp=u.formatDate(a[i].timestamp);}return a;},function(){return new q.Deferred().resolve([]);});f=U.getFrequentActivity().then(function(a){return a;},function(){return new q.Deferred().resolve([]);});q.when(R,f).done(function(a,b){t.oModel.setData({recentActivities:a,frequentActivities:b});t._setDialogContentHeight(d,Math.max(a.length,b.length));I.setBusy(false);});}},_setDialogContentHeight:function(d,i){var h=(i+0.5)*4+2.75;if(h<18){h=18;}else if(h>42){h=42;}d.setContentHeight(h+"rem");},_closeDialog:function(){this.oQuickAccessDialog.close();this.oQuickAccessDialog.destroy();var f=sap.ui.getCore().byId(this.sFocusIdAfterClose);if(f){f.focus();return;}sap.ushell.components.ComponentKeysHandler.goToTileContainer();},_titleFormatter:function(t,a){if(a===A.SEARCH){t="\""+t+"\"";}return t;},_descriptionFormatter:function(a){if(a===A.SEARCH){return r.i18n.getText("recentActivitiesSearchDescription");}return A.getDisplayName(a);},_itemPress:function(e){var m=this.oModel,p=e.getParameter("listItem").getBindingContextPath(),i=m.getProperty(p);if(i.url[0]==="#"){window.hasher.setHash(i.url);this._closeDialog();}else{var l=C.last("/core/shell/enableRecentActivity")&&C.last("/core/shell/enableRecentActivityLogging");if(l){var R={title:i.title,appType:A.URL,url:i.url,appId:i.url};sap.ushell.Container.getRenderer("fiori2").logRecentActivity(R);}W.openURL(i.url,"_blank");}}};return{openQuickAccessDialog:function(f,s){Q._createQuickAccessDialog().then(function(d){var i=d.getContent()[0];Q.sFocusIdAfterClose=s;Q._updateQuickAccessDialog(d);i.setSelectedKey(f);d.open();});},_getQuickAccess:function(){return Q;}};},false);
