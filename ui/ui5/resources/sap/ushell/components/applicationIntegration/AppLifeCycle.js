// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/components/applicationIntegration/elements/model","sap/ushell/components/applicationIntegration/Storage","sap/ushell/components/applicationIntegration/application/BlueBoxHandler","sap/ushell/ui5service/ShellUIService","sap/ushell/components/applicationIntegration/application/Application","sap/ushell/components/applicationIntegration/relatedServices/RelatedServices","sap/ushell/components/applicationIntegration/relatedShellElements/RelatedShellElements","sap/ushell/components/applicationIntegration/configuration/AppMeta","sap/ushell/services/AppConfiguration","sap/ushell/utils","sap/ui/Device","sap/ushell/Config","sap/ushell/ui5service/AppIsolationService","sap/ushell/ApplicationType","sap/ushell/components/applicationIntegration/DelegationBootstrap","sap/base/util/UriParameters","sap/ui/thirdparty/jquery","sap/base/Log","sap/m/library"],function(E,S,B,a,A,R,b,c,d,u,D,C,e,f,g,U,q,L,m){"use strict";function h(){var v,i=["URL"],r,s,j,I={},o,k=false,l={},n={home:{embedded:"embedded-home",headerless:"headerless-home",merged:"blank-home",blank:"blank-home"},app:{minimal:"minimal",app:"app",standalone:"standalone",embedded:"embedded",headerless:"headerless",merged:"merged",home:"home",blank:"blank",lean:"lean"}},p,G=[],t={},w=false,O;var x=m.URLHelper;this.shellElements=function(){return b;};this.service=function(){return R;};this.isCurrentApp=function(y){return(l.appId===y);};this.isAppWithSimilarShellHashInCache=function(y,F){var z=S.get(y);if(z){if(z.shellHash===F){return true;}return false;}return false;};this.isAppInCache=function(y){return!!S.get(y);};this.normalizeAppId=function(y){var z="-component",F=y.endsWith(z);if(F){return y.substring(0,y.length-z.length);}return y;};this.onComponentCreated=function(y,z,F){var H=F.component,J=this.normalizeAppId(H.getId());if(this.isAppInCache(J)){S.get(J).app=H;this.active(J);}else{l.app=H;if(H.active){H.active();}}};this.onGetMe=function(y,z,F){F.AppLifeCycle=this;};this.store=function(y){var z=S.get(y);if(z){A.store(z.app);R.store(z.service);c.store(z.meta);}};this.destroy=function(y,F,z){var H=S.get(y),J;function K(){A.destroy(F);b.destroy(F);c.destroy(F);}this.removeControl(y);if(H){J=B.getStateFul(F.getUrl());if(J&&B.isStatefulContainerSupported(J)){var M=B.getHandler();M.destroy(J,y);}else{H.container.destroy();B.deleteStateFul(F.getUrl());}S.remove(y);if(z){z.resolve();}}else{var P=F&&F.sendBeforeAppCloseEvent&&F.sendBeforeAppCloseEvent();if(P===undefined){K();if(z){z.resolve();}}else{P.then(function(){K();if(z){z.resolve();}},function(N){K();if(z){z.resolve();}q.sap.log.error("FLP got a failed response from the iframe for the 'sap.ushell.services.CrossApplicationNavigation.beforeAppCloseEvent' message sent",N,"sap.ushell.components.applicationIntegration.AppLifeCycle.js");});}}};this.restore=function(y){var z=S.get(y);if(z){A.restore(z.app);R.restore(z.service);c.restore(z.meta);}};this.active=function(y){var z=S.get(y);if(z){A.active(z.app);}};this.handleExitStateful=function(F,y){var z,H=B.getHandler();if(S.get(F)){z=B.getStorageKey(y);if(z&&B.isKeepAliveSupported(y)){return H.store(y,z);}return Promise.resolve();}return H.destroy(y);};this.handleExitApplication=function(F,y,z){var H;if(F&&y){if(y.getUrl()&&B.isStatefulContainerSupported(B.getStateFul(y.getUrl()))){this.handleExitStateful(F,y);}else if(S.get(F)){this.store(F);}else if((y.getIsStateful&&y.getIsStateful())||(y.getApplicationType&&this.applicationIsStatefulType(y.getApplicationType()))){if(z){y.postMessageRequest("sap.gui.triggerCloseSessionImmediately");}}else{H=i.indexOf(y.getApplicationType)>=0;if(this.isAppOfTypeCached(F,H)===false){this.destroy(F,y);}}if(F.indexOf("Shell-appfinder-component")>0){sap.ui.getCore().getEventBus().publish("sap.ushell","appFinderAfterNavigate");}}};this.onAfterNavigate=function(F,y,T,z){var H=T.indexOf("Shell-appfinder-component")>0||T.indexOf("Shell-home-component")>0;this.handleExitApplication(F,y,H);if(T){if(S.get(T)){this.restore(T);}else{}}};this.storeApp=function(y,z,T,F){if(!this.isAppInCache(y)){S.set(y,{service:R.create(),shellHash:F,appId:y,stt:"loading",appRelatedElements:b.getAppRelatedElement(),container:z,meta:d.getMetadata(T),app:undefined});I[F]=y;B.setStorageKey(z,y);return true;}return false;};this.restoreApp=function(y){if(this.isAppInCache(y)){l=S.get(y);if(B.getStorageKey(l.container)){B.setStorageKey(l.container,y);}}};this.isAppOfTypeCached=function(y,z){if(!k&&y.indexOf(r)!==-1){return true;}if(!k&&y.indexOf("Shell-appfinder")!==-1){return true;}if(new U(window.location.href).get("sap-keep-alive")=="true"&&z){return true;}return false;};h.prototype._getURLParsing=function(){if(!this._oURLParsing){this._oURLParsing=sap.ushell.Container.getService("URLParsing");}return this._oURLParsing;};this.calculateAppType=function(T){if(T.applicationType==="URL"&&T.additionalInformation&&T.additionalInformation.startsWith("SAPUI5.Component=")){return"SAPUI5";}return T.applicationType;};this.getStatefulCapabilities=function(T){if(T.appCapabilities&&T.appCapabilities&&T.appCapabilities.statefulContainer){return T.appCapabilities.statefulContainer;}return undefined;};this.isNotifyInnerAppRouteChangeEnabled=function(T){if(T.appCapabilities&&T.appCapabilities.notifyInnerAppRouteChange){return true;}return false;};this.isStatefulCapabilityEnabled=function(T){var y=this.getStatefulCapabilities(T);if(y&&(y.enabled===true||y===true)){return true;}return false;};this.isGUICapabilityEnabled=function(T){var y=this.getStatefulCapabilities(T);if(y&&y.protocol==="GUI"){return true;}return false;};this.isFLPCapabilityEnabled=function(T){return!this.isGUICapabilityEnabled(T)&&this.isStatefulCapabilityEnabled(T);};this.isGUIStatefulCapabilityEnabled=function(T){return this.isGUICapabilityEnabled(T)&&this.isStatefulCapabilityEnabled(T);};this.openApp=function(y,T,z,F){var H,J,K=i.indexOf(T.applicationType)>=0,M,N;var P="application"+y;H=B.getStateFul(T.url);if(H&&B.isStatefulContainerSupported(H)){if(this.isAppOfTypeCached(P,K)||this.isCachedEnabledAsAppParameter(z,T)){if(!this.isAppInCache(P)){this.storeApp(P,H,T,F);}this.restoreApp(P);}else{l={appId:P,stt:"loading",container:H,meta:d.getMetadata(T),app:undefined};}}else if(this.isAppOfTypeCached(P,K)||this.isCachedEnabledAsAppParameter(z,T)){if(!this.isAppInCache(P)){H=this.createApplicationContainer(y,T);this.storeApp(P,H,T,F);B.set(T.url,H);}this.restoreApp(P);}else if(this.applicationIsStatefulType(T.applicationType)||B.isCapByTarget(T,"isGUIStateful")){H=this.getStatefulContainer(T.applicationType);if(!H){H=this.createApplicationContainer(y,T);this.setStatefulContainer(T.applicationType,H);H.setIsStateful(true);}l={appId:P,stt:"loading",container:H,meta:d.getMetadata(T),app:undefined};}else{if(H){J=z.semanticObject+"-"+z.action;this.removeApplication(J);}else if(T.applicationType==="URL"||T.applicationType==="TR"||T.applicationType==="NWBC"){J=z.semanticObject+"-"+z.action;M=B.getById("application-"+J)||this.getControl(J);if(M){N=M.getUrl();B.removeCapabilities(M);this.destroy("application-"+J,M);B.deleteStateFul(N);}}H=this.createApplicationContainer(y,T);B.set(T.url,H);if(B.isCapUT(H,"isFLP")){B.setCapabilities(H,[{service:"sap.ushell.services.appLifeCycle",action:"create"},{service:"sap.ushell.services.appLifeCycle",action:"destroy"}]);}l={appId:P,stt:"loading",container:H,meta:d.getMetadata(T),app:undefined};}};this.getAppMeta=function(){return c;};this.evict=function(y){var z,F=y.value,H=y.key;this.removeControl(H);if(F.container.getUrl&&F.container.getUrl()){z=B.getStateFul(F.container.getUrl());}if(z){var J=B.getHandler();J.destroy(z,H);}else{F.container.destroy();}};this.init=function(y,z,F,H,J,K,M){var N=this,P;if(sap.ushell&&sap.ushell.Container){var Q=sap.ushell.Container.getService("AppState");var T=Q.getPersistentWhenShared();if(T===true){O=x.triggerEmail.bind(x);x.triggerEmail=function(W,X,Y,Z,$){var _=document.URL;Q.makeStatePersistent(_).done(function(a1,b1,c1,d1,e1){X=X&&b1&&d1&&X.includes(b1)?X.replace(b1,d1):X;X=X&&c1&&e1&&X.includes(c1)?X.replace(c1,e1):X;Y=Y&&b1&&d1&&Y.includes(b1)?Y.replace(b1,d1):Y;Y=Y&&c1&&e1&&Y.includes(c1)?Y.replace(c1,e1):Y;O(W,X,Y,Z,$);}).fail(function(W,X,Y,Z,$){O(W,X,Y,Z,$);});};}}if(D.system.phone){P=10;if(M&&M.limit&&M.limit.phone){P=M.limit.phone;}}else if(D.system.tablet){P=10;if(M&&M.limit&&M.limit.tablet){P=M.limit.tablet;}}else if(D.system.desktop){P=15;if(M&&M.limit&&M.limit.desktop){P=M.limit.desktop;}}else{P=10;}g.init(this.registerShellCommunicationHandler,this.postMessageToIframeApp);g.bootstrap();s=new a({scopeObject:J.ownerComponent,scopeType:"component"});o=new e({scopeObject:J.ownerComponent,scopeType:"component"});j=y;v=z;r=F;c.init(r);k=H;B.init({oShellUIService:s,oAppIsolationService:o},M,this);S.init(P,function(W){this.evict(W);}.bind(this));this.registerShellCommunicationHandler({"sap.ushell.services.appLifeCycle":{oRequestCalls:{"create":{isActiveOnly:true,distributionType:["URL"],fnResponseHandler:function(W){W.then(function(X){L.info("sap.ushell.services.appLifeCycle.create:"+X);}).catch(function(X){L.error("Error: sap.ushell.services.appLifeCycle.create:"+X);});}},"destroy":{isActiveOnly:true,distributionType:["URL"],fnResponseHandler:function(W){W.then(function(X){L.info("sap.ushell.services.appLifeCycle.destroy:"+X);}).catch(function(X){L.error("Error: sap.ushell.services.appLifeCycle.destroy:"+X);});}},"store":{isActiveOnly:true,distributionType:["URL"],fnResponseHandler:function(W){W.then(function(X){L.info("sap.ushell.services.appLifeCycle.store:"+X);}).catch(function(X){L.error("Error: sap.ushell.services.appLifeCycle.store:"+X);});}},"restore":{isActiveOnly:true,distributionType:["URL"],fnResponseHandler:function(W){W.then(function(X){L.info("sap.ushell.services.appLifeCycle.restore:"+X);}).catch(function(X){L.error("Error: sap.ushell.services.appLifeCycle.restore:"+X);});}}},oServiceCalls:{"subscribe":{executeServiceCallFn:function(W){B.mapCapabilities(W.oContainer,W.oMessageData.body);return new q.Deferred().resolve({}).promise();}},"setup":{executeServiceCallFn:function(W){return new q.Deferred().resolve().promise();}}}}});this.registerShellCommunicationHandler({"sap.ushell.eventDelegation":{oRequestCalls:{"registerEventHandler":{isActiveOnly:false,distributionType:["URL"]}},oServiceCalls:{"registerEventHandler":{executeServiceCallFn:function(W){var X=V(W);return new q.Deferred().resolve(X).promise();}}}}});function V(W){var X=W.oMessageData.body.eventSerObj;return N.registerEventHandler(X);}sap.ui.getCore().getEventBus().subscribe("sap.ushell","appComponentLoaded",this.onComponentCreated,this);sap.ui.getCore().getEventBus().subscribe("sap.ushell","getAppLifeCycle",this.onGetMe,this);b.init(this.getElementsModel(),K);};this.addControl=function(y){v.addCenterViewPort(y);};this.removeControl=function(y){var z=B.getById(y),F=B.isStatefulContainerSupported(z);if(!F){v.removeCenterViewPort(y,true);}};this.removeApplication=function(y){var z=this.getControl(y);if(z){this.removeControl(z.getId());z.destroy();}};this.getControl=function(y){return v&&(v.getViewPortControl("centerViewPort","application-"+y)||v.getViewPortControl("centerViewPort","applicationShellPage-"+y));};this.getViewPortContainer=function(){return v;};this.navTo=function(y){v.navTo("centerViewPort",y,"show");};this.getCurrentApplication=function(){return l;};this.setApplicationFullWidth=function(y){var z=this.getCurrentApplication();if(z.container){z.container.toggleStyleClass("sapUShellApplicationContainerLimitedWidth",!y);}};this.createComponent=function(y,P){this.shellElements().setDangling(true);return A.createComponent(y,P);};this.getAppContainer=function(y,z,F,H,J){z.shellUIService=s.getInterface();z.appIsolationService=o.getInterface();z.targetNavigationMode=F?"explace":"inplace";this.openApp(y,z,H,J);if(G.length>0){l.container.registerShellCommunicationHandler(G);}if(t.UI5APP){l.container.setIframeHandlers(t.UI5APP);}return l.container;};this.getShellUIService=function(){return s;};this.getAppIsolationService=function(){return o;};this.initShellUIService=function(y){s._attachHierarchyChanged(c.onHierarchyChange.bind(this));s._attachTitleChanged(c.onTitleChange.bind(this));s._attachRelatedAppsChanged(c.onRelatedAppsChange.bind(this));s._attachBackNavigationChanged(y.fnOnBackNavigationChange.bind(this));};this.parseStatefulContainerConfiguration=function(y){var z={};if(y){var F={"GUI":true};Object.keys(y).filter(function(H){return y[H]===true&&F[H];}).map(function(H){var J=H;if(J==="GUI"){J="TR";}return J;}).forEach(function(H){z[H]=null;});}p=z;};this.setStatefulApplicationContainer=function(y){p=y;};this.getStatefulApplicationContainer=function(){return p;};this.applicationIsStatefulType=function(y){return p.hasOwnProperty(y);};this.getStatefulContainer=function(y){return p[y];};this.setStatefulContainer=function(y,z){p[y]=z;};this.statefulContainerForTypeExists=function(y){return!!this.getStatefulContainer(y);};this.getAllApplicationContainers=function(){return Object.keys(p).map(function(K){return p[K];}).filter(function(y){return!!y;});};this.getElementsModel=function(){return E;};this.activeContainer=function(y){var z=this.getAllApplicationContainers();z.forEach(function(F){L.info("Deactivating container "+F.getId());F.setActive(false);});if(y){L.info("Activating container "+y.getId());y.setActive(true);}};this.showApplicationContainer=function(y){this.navTo(y.getId());y.toggleStyleClass("hidden",false);L.info("New application context opened successfully in an existing transaction UI session.");};this.reuseStateFulContainerAndRestore=function(y,T,H,F){var z=this,J=I[F];if(B.getStorageKey(y)){B.setStorageKey(y,J);}return H.restore(y,J).then(function(){z.showApplicationContainer(y);},function(K){L.error(K&&K.message||K);});};this.reuseStateFulContainer=function(y,z,T,H,F){var J=this;I[F]=T;if(B.getStorageKey(y)){B.setStorageKey(y,T);}this.initAppMetaParams();return H.create(y,z,T).then(function(){J.showApplicationContainer(y);},function(K){L.error(K&&K.message||K);});};this.initAppMetaParams=function(){if(!this.getAppMeta().getIsHierarchyChanged()){s.setHierarchy();}if(!this.getAppMeta().getIsTitleChanged()){s.setTitle();}if(!this.getAppMeta().getIsRelatedAppsChanged()){s.setRelatedApps();}if(!w){s.setBackNavigation();}};this.reuseApplicationContainer=function(y,z,F){var H=this;return y.setNewApplicationContext(z,F).then(function(){H.navTo(y.getId());y.toggleStyleClass("hidden",false);L.info("New application context opened successfully in an existing transaction UI session.");},function(J){L.error(J&&J.message||J);});};this.createApplicationContainer=function(y,z){return A.createApplicationContainer(y,z);};this.publishNavigationStateEvents=function(y,z,F){var H,J=y.getId?y.getId():"",K=this;var M=d.getMetadata(),N=M.icon,T=M.title;y.addEventDelegate({onAfterRendering:F});H=y.exit;y.exit=function(){if(H){H.apply(this,arguments);}K.getAppMeta()._applyContentDensityByPriority();setTimeout(function(){var Q=q.extend(true,{},z);delete Q.componentHandle;Q.appId=J;Q.usageIcon=N;Q.usageTitle=T;sap.ui.getCore().getEventBus().publish("sap.ushell","appClosed",Q);L.info("app was closed");},0);var P=K._publicEventDataFromResolutionResult(z);sap.ushell.renderers.fiori2.utils.publishExternalEvent("appClosed",P);};};this._publicEventDataFromResolutionResult=function(y){var P={};if(!y){return y;}["applicationType","ui5ComponentName","url","additionalInformation","text"].forEach(function(z){P[z]=y[z];});Object.freeze(P);return P;};this.isCachedEnabledAsAppParameter=function(y,T){if(y&&y.params&&y.params["sap-keep-alive"]){if(y.params["sap-keep-alive"]=="true"){return true;}}if(T&&T.url){if(new U(T.url).get("sap-keep-alive")=="true"){return true;}}return false;};this.getInMemoryInstance=function(y,F){var z="application-"+y,H=S.get(z);if(H){if(H.shellHash===F){return{isInstanceSupported:true,appId:H.appId,container:H.container};}return{isInstanceSupported:false,appId:H.appId,container:H.container};}return{isInstanceSupported:false,appId:undefined,container:undefined};};this.handleOpenStateful=function(y,z,T,F,H,J){var K=B.getHandler(),P;if(S.get(T)&&y===false){P=this.reuseStateFulContainerAndRestore(F,T,K,J);}else{P=this.reuseStateFulContainer(F,H.url,T,K,J);if(z){if(!this.isAppInCache(T)){this.storeApp(T,F,H,J);}}}return P;};this.leave=function(y,z){var F=B.isStatefulContainerSupported(y);if(F){return this.handleExitStateful(z,y);}return Promise.resolve();};this.open=function(y,z,F,T,W,H,M){var J=this,K,N=this.statefulContainerForTypeExists(T.applicationType),P,Q=i.indexOf(T.applicationType)>=0,V="application-"+y,X,Y=this.isAppOfTypeCached(V,Q)||this.isCachedEnabledAsAppParameter(F,T),Z,$=false,_,a1,b1=new q.Deferred();Z=this.calculateAppType(T);_=f.getDefaultFullWidthSetting(Z);K=B.getStateFul(T.url);P=B.isStatefulContainerSupported(K);if(!P){if(l&&V!==l.appId){K=undefined;}X=S.get("application"+z);if(X){K=X.container;}}if(P){if(!K){K=W(y,M,F,T,z,T.fullWidth||M.fullWidth||_,H);this.restoreApp(K.getId());this.navTo(K.getId());$=true;}}else if(!N&&K&&!Y){a1=new q.Deferred();this.destroy(K.getId(),K,a1);a1.then(function(){K=W(y,M,F,T,z,T.fullWidth||M.fullWidth||_,H);});}else if(!K){K=W(y,M,F,T,z,T.fullWidth||M.fullWidth||_,H);}if(a1===undefined){a1=new q.Deferred().resolve();}a1.then(function(){if(!N&&!P){J.restoreApp(K.getId());J.navTo(K.getId());}var c1=new q.Deferred().resolve().promise();if(P){c1=J.handleOpenStateful($,Y,"application"+z,K,T,H);}else if(N){c1=J.reuseApplicationContainer(K,T.applicationType,T.url);}c1.then(function(){v.switchState("Center");u.setPerformanceMark("FLP -- centerViewPort");J.activeContainer(K);b1.resolve();});});return b1.promise();};this.handleControl=function(y,z,F,T,W,H){var J=this,M=d.getMetadata(T),K=v.getCurrentCenterPage?v.getCurrentCenterPage():undefined,N=sap.ui.getCore().byId(K);return new Promise(function(P,Q){J.leave(N,K).then(function(){J.open(y,z,F,T,W,H,M).then(P,Q);},function(V){L.error(V&&V.message||V);Q(V&&V.message||V);});});};this.switchViewState=function(y,z,F){var H=y,J;if(n[y]&&n[y][j]){H=n[y][j];}var K=C.last("/core/shell/model/currentState/stateName")==="home";if(!K&&(!l.appId||!S.get(l.appId))){E.destroyManageQueue();}J=S.get("application"+F);if(J){b.restore(J);}else{b.assignNew(y);}E.switchState(H,z,F);this.shellElements().setDangling(false);this.shellElements().processDangling();if(y==="searchResults"){this.getElementsModel().setProperty("/lastSearchScreen","");if(!window.hasher.getHash().indexOf("Action-search")===0){var M=sap.ui.getCore().getModel("searchModel");window.hasher.setHash("Action-search&/searchTerm="+M.getProperty("/uiFilter/searchTerms")+"&dataSource="+JSON.stringify(M.getProperty("/uiFilter/dataSource").getJson()));}}};this.registerShellCommunicationHandler=function(y){A.registerShellCommunicationHandler(y);};this.registerIframeCommunicationHandler=function(H,T){t[T]=H;};this.postMessageToIframeApp=function(y,z,M,W){var F,H=A.getActiveAppContainer(),J=[];if(B.hasIFrame(H)&&(B.isCapabilitySupported(H,y,z)||A.isAppTypeSupported(H,y,z))){J.push(A.postMessageToIframeApp(H,y,z,M,W));}if(!A.isActiveOnly(y,z)){B.forEach(function(N){if(B.hasIFrame(N)){if(B.isCapabilitySupported(N,y,z)||A.isAppTypeSupported(N,y,z)){J.push(A.postMessageToIframeApp(N,y,z,M,W));}}});}F=A.getResponseHandler(y,z);var K=Promise.all(J);if(F){F(K);}return K;};this.postMessageToIframeAppAccordingToPolicy=function(y,z,M,W,P){var F,H=A.getActiveAppContainer(),J=[];if(B.hasIFrame(H)&&A.isAppTypeSupportedByPolicy(H,P)){J.push(A.postMessageToIframeApp(H,y,z,M,W));}if(!P.isActiveOnly){B.forEach(function(N){if(B.hasIFrame(N)){if(B.isCapabilitySupported(N,y,z)||A.isAppTypeSupported(N,y,z)){J.push(A.postMessageToIframeApp(N,y,z,M,W));}}});}F=A.getResponseHandler(y,z);var K=Promise.all(J);if(F){F(K);}return K;};this.registerTunnels=function(T){g.registerTunnels(T,this.registerShellCommunicationHandler);};this.registerEvents=function(y){g.registerEvents(y,this.registerShellCommunicationHandler);};this.setBackNavigationChanged=function(y){w=y;};this.getBackNavigationChanged=function(){return w;};}return new h();},true);
