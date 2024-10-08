// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/renderers/fiori2/allMyApps/AllMyAppsManager","sap/ushell/Config","sap/ui/Device","sap/ui/performance/Measurement","sap/ui/events/KeyCodes","sap/ui/thirdparty/jquery","sap/ui/model/json/JSONModel","sap/ushell/resources","sap/ushell/utils/WindowUtils"],function(A,C,D,M,K,q,J,r,W){"use strict";var s=false,a=function(v){this.init(v);};sap.ui.controller("sap.ushell.renderers.fiori2.allMyApps.AllMyApps",{oStateEnum:{FIRST_LEVEL:0,SECOND_LEVEL:1,DETAILS:2,FIRST_LEVEL_SPREAD:3},iNumberOfProviders:0,onInit:function(){this.bFirstLoadOfAllMyApps=true;var o=new J();o.setSizeLimit(10000);o.setProperty("/AppsData",[]);this.getView().setModel(o,"allMyAppsModel");sap.ui.getCore().getEventBus().subscribe("launchpad","allMyAppsFirstCatalogLoaded",this.updateMasterFocusAndDetailsContext,this);sap.ui.getCore().getEventBus().subscribe("launchpad","allMyAppsFirstCatalogLoaded",this.onDetailLoad,this);sap.ui.getCore().getEventBus().subscribe("launchpad","allMyAppsMasterLoaded",this.onMasterLoad,this);sap.ui.getCore().getEventBus().subscribe("launchpad","allMyAppsNoCatalogsLoaded",this.onNoCatalogsLoaded,this);},onExit:function(){sap.ui.getCore().getEventBus().unsubscribe("launchpad","allMyAppsFirstCatalogLoaded",this.updateMasterFocusAndDetailsContext);sap.ui.getCore().getEventBus().unsubscribe("launchpad","allMyAppsFirstCatalogLoaded",this.onDetailLoad,this);sap.ui.getCore().getEventBus().unsubscribe("launchpad","allMyAppsMasterLoaded",this.onMasterLoad,this);sap.ui.getCore().getEventBus().unsubscribe("launchpad","allMyAppsNoCatalogsLoaded",this.onNoCatalogsLoaded,this);},onAfterRendering:function(){var t=this,v=this.getView(),o=v.getModel("allMyAppsModel"),S=v.oSplitApp;if(!this.bAfterInitialLoading){S.toMaster("allMyAppsMasterBusyIndicator","show");if(!D.system.phone){S.toDetail("allMyAppsDetailBusyIndicator","show");}}if(this.bFirstLoadOfAllMyApps){o.setProperty("/AppsData",[]);}else{var m=o.getProperty("/AppsData");o.setProperty("/AppsData",m);}setTimeout(function(){t._getAllMyAppsManager().loadAppsData(o,t._getPopoverObject(),t.bFirstLoadOfAllMyApps);s=t._isSingleDataSource();t.switchToInitialState();t.bFirstLoadOfAllMyApps=false;},0);},switchToInitialState:function(){var v=this.getView(),S;if(this._isSingleDataSource()){C.emit("/core/shell/model/allMyAppsMasterLevel",this.oStateEnum.FIRST_LEVEL_SPREAD);v.oDataSourceList.bindItems("allMyAppsModel>/AppsData/0/groups",v.oDataSourceListTemplate);}else{C.emit("/core/shell/model/allMyAppsMasterLevel",this.oStateEnum.FIRST_LEVEL);v.oDataSourceList.bindItems("allMyAppsModel>/AppsData",v.oDataSourceListTemplate);}if(D.system.phone){S=this.getView().oSplitApp;S.toMaster("sapUshellAllMyAppsMasterPage","show");}v.oDataSourceList.rerender();this.updateMasterFocusAndDetailsContext(undefined,undefined,{bFirstCatalogLoadedEvent:true});this._getPopoverHeaderLabel().setText(r.i18n.getText("allMyApps_headerTitle"));this.updateHeaderButtonsState();},handleSwitchToMasterAreaOnPhone:function(){var S=this.getView().oSplitApp,b=this._getDataSourcesSelectedPath(),p=b.split("/");S.toMaster("sapUshellAllMyAppsMasterPage","show");if(this._isSingleDataSource()){C.emit("/core/shell/model/allMyAppsMasterLevel",this.oStateEnum.FIRST_LEVEL_SPREAD);}else if(p.length===3){C.emit("/core/shell/model/allMyAppsMasterLevel",this.oStateEnum.FIRST_LEVEL);}else{C.emit("/core/shell/model/allMyAppsMasterLevel",this.oStateEnum.SECOND_LEVEL);}this.updateHeaderButtonsState();},handleMasterListItemPress:function(o){var c=this._getClickedDataSourceItemPath(o),v=this.getView(),b=v.getModel("allMyAppsModel"),d=b.getProperty(c+"/type"),e=C.last("/core/shell/model/allMyAppsMasterLevel"),i=(d===sap.ushell.Container.getService("AllMyApps").getProviderTypeEnum().CATALOG),B;this.lastPressedMasterItem=o.getParameter("listItem");if(i||(e===this.oStateEnum.FIRST_LEVEL_SPREAD)||(e===this.oStateEnum.SECOND_LEVEL)){B=this.handleMasterListItemPress_toDetails(o);}else{B=this.handleMasterListItemPress_toSecondLevel(o);}v.oCustomLabel.setBindingContext(B,"allMyAppsModel");v.oCustomPanel.setBindingContext(B,"allMyAppsModel");if(v.oCustomLink){v.oCustomLink.setBindingContext(B,"allMyAppsModel");}},handleMasterListItemPress_toSecondLevel:function(o){var c=this._getClickedDataSourceItemPath(o),v=this.getView(),b=v.getModel("allMyAppsModel"),d=b.getProperty(c+"/type"),e=b.getProperty(c+"/title"),S=this.getView().oSplitApp,B,f;if(!D.system.phone){S.toDetail("sapUshellAllMyAppsDetailsPage");}v.oDataSourceList.bindItems("allMyAppsModel>"+c+"/groups",v.oDataSourceListTemplate);C.emit("/core/shell/model/allMyAppsMasterLevel",this.oStateEnum.SECOND_LEVEL);B=this._setBindingContext(c+"/groups/0",v.oItemsContainer);v.oDataSourceList.rerender();v.oDataSourceList.setSelectedItem(v.oDataSourceList.getItems()[0]);f=v.oDataSourceList.getSelectedItem();if(f){f.focus();}if(d===sap.ushell.Container.getService("AllMyApps").getProviderTypeEnum().HOME){this._getPopoverHeaderLabel().setText(r.i18n.getText("allMyApps_homeEntryTitle"));}else if(d===sap.ushell.Container.getService("AllMyApps").getProviderTypeEnum().EXTERNAL){this._getPopoverHeaderLabel().setText(e);}this._getDetailsHeaderLabel().setText(b.getProperty(c+"/groups/0/title"));this.updateHeaderButtonsState();return B;},handleMasterListItemPress_toDetails:function(c){var b=this._getClickedDataSourceItemPath(c),v=this.getView(),o=v.getModel("allMyAppsModel"),S=v.oSplitApp,B=this._setBindingContext(b,v.oItemsContainer);this._getDetailsHeaderLabel().setText(o.getProperty(b+"/title"));if(D.system.phone){S.toDetail("sapUshellAllMyAppsDetailsPage");C.emit("/core/shell/model/allMyAppsMasterLevel",this.oStateEnum.DETAILS);}this.updateHeaderButtonsState();return B;},onMasterLoad:function(){var v=this.getView(),S=v.oSplitApp,b=this._getPopoverHeaderBackButton();this.bAfterInitialLoading=true;if(S.getCurrentMasterPage()==v.oMasterBusyIndicator){S.toMaster("sapUshellAllMyAppsMasterPage","show");}b.focus();s=this._isSingleDataSource();this.updateMasterFocusAndDetailsContext(undefined,undefined,{bFirstCatalogLoadedEvent:false});},onDetailLoad:function(){var v=this.getView(),S=v.oSplitApp;this.bAfterInitialLoading=true;if(!D.system.phone){S.toDetail("sapUshellAllMyAppsDetailsPage","show");}},onNoCatalogsLoaded:function(){var v=this.getView(),S=v.oSplitApp;if((!D.system.phone)&&(!s)){S.toDetail("sapUshellAllMyAppsEmptyDetailsPage","show");}else if((!D.system.phone)&&s){S.toDetail("sapUshellAllMyAppsDetailsPage");}},updateMasterFocusAndDetailsContext:function(c,e,d){var v=this.getView(),o=v.getModel("allMyAppsModel"),f=this._getInitialFirstLevelSelectionIndex(),b,B,S;if(s===true){b=o.createBindingContext("/AppsData/0/groups/0");B=o.getProperty(b.sPath);}else{b=o.createBindingContext("/AppsData/"+f);B=o.getProperty(b.sPath);}v.oItemsContainer.setBindingContext(b,"allMyAppsModel");v.oCustomLabel.setBindingContext(b,"allMyAppsModel");v.oCustomPanel.setBindingContext(b,"allMyAppsModel");if(v.oCustomLink){v.oCustomLink.setBindingContext(b,"allMyAppsModel");}if(B!==undefined){this._getDetailsHeaderLabel().setText(B.title);}if(d.bFirstCatalogLoadedEvent===true){v.oDataSourceList.rerender();}if(d.bFirstCatalogLoadedEvent===false&&f===0){this.onNoCatalogsLoaded();}v.oDataSourceList.setSelectedItem(v.oDataSourceList.getItems()[f]);S=v.oDataSourceList.getSelectedItem();if(S){setTimeout(function(){S.focus();},0);}if(d.bFirstCatalogLoadedEvent){M.end("FLP:ShellAppTitle.onClick");M.end("FLP:ShellNavMenu.footerClick");}},handleGroupPress:function(e){var v=this.getView();var d=v.oCustomLink?v.oCustomLink.getBindingContext("allMyAppsModel").getObject():{};if(d.handlePress){d.handlePress(e,d);}},updateHeaderButtonsState:function(){this._getShellAppTitleToggleListButton().setVisible(this.getToggleListButtonVisible());this._getPopoverHeaderBackButton().setVisible(this.getBackButtonVisible());},getToggleListButtonVisible:function(){var o=this.getCurrentState(),i=D.media.getCurrentRange(D.media.RANGESETS.SAP_STANDARD).name==="Phone",v=(i||D.system.phone)&&(o===this.getStateEnum().DETAILS);return v;},getBackButtonVisible:function(){var S=C.last("/core/shellHeader/ShellAppTitleState");if(S!==this._getShellAppTitleStateEnum().ALL_MY_APPS_ONLY){return true;}var o=this.getCurrentState();if(o===this.getStateEnum().SECOND_LEVEL||o===this.getStateEnum().DETAILS){return true;}return false;},onAppItemClick:function(c){var o=this.getView().getModel("allMyAppsModel"),b=c.getBindingContext("allMyAppsModel").sPath,u=o.getProperty(b+"/url");if(u){if(u[0]==="#"){hasher.setHash(u);setTimeout(function(){this.getView().getParent().close();}.bind(this),50);}else{W.openURL(u,"_blank");}}},getCurrentState:function(){return C.last("/core/shell/model/allMyAppsMasterLevel");},getStateEnum:function(){return this.oStateEnum;},_isSingleDataSource:function(){var o=sap.ushell.Container.getService("AllMyApps");if(o.isCatalogAppsEnabled()){return false;}if(!o.isExternalProviderAppsEnabled()&&o.isHomePageAppsEnabled()){return true;}if(o.isExternalProviderAppsEnabled()&&Object.keys(o.getDataProviders()).length===1&&!o.isHomePageAppsEnabled()){return true;}return false;},_getInitialFirstLevelSelectionIndex:function(){var v=this.getView(),o=v.getModel("allMyAppsModel"),d=o.getProperty("/AppsData"),i,t;for(i=0;i<d.length;i++){t=d[i];if(t.type===sap.ushell.Container.getService("AllMyApps").getProviderTypeEnum().CATALOG){return i;}}return 0;},_getPopoverHeaderBackButton:function(){if(!this._oPopoverHeaderBackButton){this._oPopoverHeaderBackButton=this._getPopoverHeaderContent(0);}return this._oPopoverHeaderBackButton;},_getShellAppTitleToggleListButton:function(){if(!this._oShellAppTitleToggleListButton){this._oShellAppTitleToggleListButton=this._getPopoverHeaderContent(1);}return this._oShellAppTitleToggleListButton;},_getPopoverHeaderContent:function(c){var o,h,b;o=this._getPopoverObject().getCustomHeader();h=o.getContentLeft();b=h[c];return b;},_getPopoverHeaderLabel:function(){var c,o;c=this._getPopoverObject().getCustomHeader();o=c.getContentMiddle();return o[0];},_getPopoverObject:function(){return this.getView().getParent();},_getDetailsHeaderLabel:function(){return this.getView().oDetailsHeaderLabel;},_setBindingContext:function(b,B){var o=this.getView().getModel("allMyAppsModel"),c=o.createBindingContext(b);B.setBindingContext(c,"allMyAppsModel");return c;},_getClickedDataSourceItemPath:function(o){var c=o.getParameter("listItem");return c.getBindingContext("allMyAppsModel").sPath;},_getAllMyAppsManager:function(){return A;},_getDataSourcesSelectedPath:function(){return this.lastPressedMasterItem.getBindingContextPath();},_getShellAppTitleStateEnum:function(){var S=sap.ui.getCore().byId("shellAppTitle");return S.getStateEnum();},initKeyBoardNavigationHandling:function(){if(this.keyboardNavigation){this.keyboardNavigation.destroy();}this.keyboardNavigation=new a(this.getView());}});a.prototype.init=function(v){this.keyCodes=K;v.oDataSourceList.addEventDelegate({onsaptabnext:function(e){var d=q(".sapUshellAllMyAppsListItem");this.jqDetailAreaElement=v.oItemsContainer.$();this.jqDetailAreaElement.on("keydown.keyboardNavigation",this.keydownHandler.bind(this));this._setItemFocus(e,d[0]);}.bind(this)});v.oItemsContainer.addEventDelegate({onsaptabprevious:function(){var c=q(".sapUshellAllMyAppsListItem[tabindex=\"0\"]")[0];q(c).attr("tabindex",-1);},onsaptabnext:function(){var c=q(".sapUshellAllMyAppsCustomPanel"),o=q(".sapUshellAllMyAppsListItem[tabindex=\"0\"]")[0];if(c.length===0){q(o).attr("tabindex",-1);}}});v.oCustomPanel.addEventDelegate({onsaptabnext:function(e){var c=q(".sapUshellAllMyAppsListItem[tabindex=\"0\"]")[0];q(c).attr("tabindex",-1);}});};a.prototype.keydownHandler=function(e){switch(e.keyCode){case this.keyCodes.ARROW_UP:this.arrowKeyHandler(e,-2);break;case this.keyCodes.ARROW_DOWN:this.arrowKeyHandler(e,2);break;case this.keyCodes.ARROW_LEFT:this.arrowKeyHandler(e,-1);break;case this.keyCodes.ARROW_RIGHT:this.arrowKeyHandler(e,1);break;default:break;}};a.prototype.arrowKeyHandler=function(e,d){var b=q(".sapUshellAllMyAppsListItem").toArray(),c=q(".sapUshellAllMyAppsListItem[tabindex=\"0\"]")[0],i=b.indexOf(c),E=b[i+d];if(E){q(c).attr("tabindex",-1);this._setItemFocus(e,E);}};a.prototype._setItemFocus=function(e,E){if(E){e.preventDefault();e.stopImmediatePropagation();q(E).attr("tabindex",0);E.focus();}};a.prototype.destroy=function(){if(this.jqDetailAreaElement){this.jqDetailAreaElement.off(".keyboardNavigation");}delete this.jqDetailAreaElement;};});
