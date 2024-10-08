// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/utils","sap/ushell/System","sap/ushell/Ui5ServiceFactory","sap/ushell/Ui5NativeServiceFactory","sap/ui/base/EventProvider","sap/ui/core/service/ServiceFactoryRegistry","sap/ui/core/Control","sap/ui/performance/Measurement","sap/ui/thirdparty/URI","sap/ui/util/Mobile","sap/base/util/uid"],function(u,S,U,a,E,b,C,M,c,d,f){"use strict";var g="sap.ushell.services.Container",h="sap.ushell.Container.dirtyState.",o={},j,p,F;function k(){close();}function r(){document.location="about:blank";}function l(P){if(p&&p[P]){return p[P];}return"sap.ushell.adapters."+P;}function m(e){return(j.services&&j.services[e])||{};}function n(N,e,P,A){var i=m(N).adapter||{},t=i.module||l(e.getPlatform())+"."+N+"Adapter";function v(){return new(jQuery.sap.getObject(t))(e,P,{config:i.config||{}});}if(A){return new Promise(function(w,x){var y=t.replace(/\./g,"/");sap.ui.require([y],function(){try{w(v());}catch(z){x(z);}});});}jQuery.sap.require(t);return v();}function q(A){var t=new E(),v=false,R=[],w={},x="sap.ushell.Container."+A.getSystem().getPlatform()+".remoteSystem.",y={},G,z,L=u.getLocalStorage(),B=new u.Map(),D="sap.ushell.Container."+A.getSystem().getPlatform()+".sessionTermination",H=this;this.cancelLogon=function(){if(this.oFrameLogonManager){this.oFrameLogonManager.cancelLogon();}};this.createRenderer=function(e,i){var K,N,O;M.start("FLP:Container.InitLoading","Initial Loading","FLP");u.setPerformanceMark("FLP - renderer created");e=e||j.defaultRenderer;if(!e){throw new Error("Missing renderer name");}O=(j.renderers&&j.renderers[e])||{};N=O.module||(e.indexOf(".")<0?"sap.ushell.renderers."+e+".Renderer":e);if(O.componentData&&O.componentData.config){K={config:O.componentData.config};}function P(){var Q=new(jQuery.sap.getObject(N))({componentData:K}),T=Q instanceof sap.ui.core.UIComponent?new sap.ui.core.ComponentContainer({component:Q,height:"100%",width:"100%"}):Q;if(!(T instanceof C)){throw new Error("Unsupported renderer type for name "+e);}T.placeAt=function(V,W){var X=V,Y="canvas",Z=document.body;if(V===Z.id){X=document.createElement("div");X.setAttribute("id",Y);X.classList.add("sapUShellFullHeight");switch(W){case"first":if(Z.firstChild){Z.insertBefore(X,Z.firstChild);break;}case"only":Z.innerHTML="";default:Z.appendChild(X);}V=Y;W="";}C.prototype.placeAt.call(this,V,W);};w[e]=Q;t.fireEvent("rendererCreated",{renderer:Q});return T;}if(i){return new Promise(function(Q,T){var V=N.replace(/\./g,"/");sap.ui.require([V],function(){try{Q(P());}catch(W){T(W);}});});}jQuery.sap.require(N);return P();};this.getRenderer=function(e){var i,K;e=e||j.defaultRenderer;if(e){i=w[e];}else{K=Object.keys(w);if(K.length===1){i=w[K[0]];}else{jQuery.sap.log.warning("getRenderer() - cannot determine renderer, because no default renderer is configured and multiple instances exist.",undefined,g);}}if(i&&i.isA("sap.ui.core.ComponentContainer")){return i.getComponentInstance();}return i;};this.DirtyState={CLEAN:"CLEAN",DIRTY:"DIRTY",MAYBE_DIRTY:"MAYBE_DIRTY",PENDING:"PENDING",INITIAL:"INITIAL"};this.getGlobalDirty=function(){var i,K=new jQuery.Deferred(),N=f(),O,P=0,Q=this.DirtyState.CLEAN;function T(){if(P===0||Q===H.DirtyState.DIRTY){K.resolve(Q);jQuery.sap.log.debug("getGlobalDirty() Resolving: "+Q,null,"sap.ushell.Container");}}function V(W){if(W.key.indexOf(h)===0&&W.newValue!==H.DirtyState.INITIAL&&W.newValue!==H.DirtyState.PENDING){jQuery.sap.log.debug("getGlobalDirty() Receiving event key: "+W.key+" value: "+W.newValue,null,"sap.ushell.Container");if(W.newValue===H.DirtyState.DIRTY||W.newValue===H.DirtyState.MAYBE_DIRTY){Q=W.newValue;}P-=1;T();}}try{L.setItem(N,"CHECK");L.removeItem(N);}catch(e){jQuery.sap.log.warning("Error calling localStorage.setItem(): "+e,null,"sap.ushell.Container");return K.resolve(this.DirtyState.MAYBE_DIRTY).promise();}if(G){throw new Error("getGlobalDirty already called!");}G=K;window.addEventListener("storage",V);K.always(function(){window.removeEventListener("storage",V);G=undefined;});for(i=L.length-1;i>=0;i-=1){O=L.key(i);if(O.indexOf(h)===0){if(L.getItem(O)==="PENDING"){L.removeItem(O);jQuery.sap.log.debug("getGlobalDirty() Cleanup of unresolved 'PENDINGS':"+O,null,"sap.ushell.Container");}else{P+=1;u.localStorageSetItem(O,this.DirtyState.PENDING,true);jQuery.sap.log.debug("getGlobalDirty() Requesting status for: "+O,null,"sap.ushell.Container");}}}T();setTimeout(function(){if(K.state()!=="resolved"){K.resolve("MAYBE_DIRTY");jQuery.sap.log.debug("getGlobalDirty() Timeout reached, - resolved 'MAYBE_DIRTY'",null,"sap.ushell.Container");}},P*2000);return K.promise();};this.getLogonSystem=function(){return A.getSystem();};this.getUser=function(){return A.getUser();};this.getDirtyFlag=function(){for(var i=0;i<R.length;i++){v=v||R[i].call();}return v;};this.setDirtyFlag=function(i){v=i;};this.sessionKeepAlive=function(){if(A.sessionKeepAlive){A.sessionKeepAlive();}};this.registerDirtyStateProvider=function(e){if(typeof e!=="function"){throw new Error("fnDirty must be a function");}R.push(e);};this.deregisterDirtyStateProvider=function(e){if(typeof e!=="function"){throw new Error("fnDirty must be a function");}var K=-1;for(var i=R.length-1;i>=0;i--){if(R[i]===e){K=i;break;}}if(K===-1){return;}R.splice(K,1);};this.getService=function(e,P,i){var K={},N,O,Q,T,V,W;function X($){var a1=new jQuery.Deferred();if(!$){throw new Error("Missing system");}a1.resolve(n(e,$,P));sap.ushell.Container.addRemoteSystem($);return a1.promise();}if(!e){throw new Error("Missing service name");}if(e.indexOf(".")>=0){throw new Error("Unsupported service name");}V=m(e);N=V.module||"sap.ushell.services."+e;O=N+"/"+(P||"");W={config:V.config||{}};function Y($,T){K.createAdapter=X;return new $(T,K,P,W);}function Z(Q,i){var $;if(Q.hasNoAdapter){$=new Q(K,P,W);}else{T=n(e,A.getSystem(),P,i);if(i){return T.then(function(a1){var $=Y(Q,a1);B.put(O,$);return $;});}$=Y(Q,T);}B.put(O,$);return i?Promise.resolve($):$;}if(!B.containsKey(O)){if(i){return new Promise(function($){sap.ui.require([N.replace(/[.]/g,"/")],function(a1){$(Z(a1,true));});});}Q=sap.ui.requireSync(N.replace(/[.]/g,"/"));return Z(Q);}if(i){return Promise.resolve(B.get(O));}return B.get(O);};this.getServiceAsync=function(e,P){return Promise.resolve(this.getService(e,P,true));};function I(){var K,N,i,O;for(i=L.length-1;i>=0;i-=1){O=L.key(i);if(O.indexOf(x)===0){try{K=O.substring(x.length);N=JSON.parse(L.getItem(O));y[K]=new S(N);}catch(e){L.removeItem(O);}}}return y;}function J(){if(typeof OData==="undefined"){return;}function e(i,K,N){jQuery.sap.log.warning(i,null,"sap.ushell.Container");if(N){setTimeout(N.bind(null,i),5000);}return{abort:function(){return;}};}OData.read=function(i,K,N){return e("OData.read('"+(i&&i.Uri?i.requestUri:i)+"') disabled during logout processing",K,N);};OData.request=function(i,K,N){return e("OData.request('"+(i?i.requestUri:"")+"') disabled during logout processing",K,N);};}this.addRemoteSystem=function(e){var i=e.getAlias(),O=y[i];if(this._isLocalSystem(e)){return;}if(O){if(O.toString()===e.toString()){return;}jQuery.sap.log.warning("Replacing "+O+" by "+e,null,"sap.ushell.Container");}else{jQuery.sap.log.debug("Added "+e,null,"sap.ushell.Container");}y[i]=e;u.localStorageSetItem(x+i,e);};this._isLocalSystem=function(e){var i=e.getAlias();if(i&&i.toUpperCase()==="LOCAL"){return true;}var K=new c(u.getLocationHref()),N=this.getLogonSystem().getClient()||"";if(e.getBaseUrl()===K.origin()&&e.getClient()===N){return true;}return false;};this.addRemoteSystemForServiceUrl=function(e){var i,K={baseUrl:";o="};if(!e||e.charAt(0)!=="/"||e.indexOf("//")===0){return;}i=/^[^?]*;o=([^\/;?]*)/.exec(e);if(i&&i.length>=2){K.alias=i[1];}e=e.replace(/;[^\/?]*/g,"");if(/^\/sap\/(bi|hana|hba)\//.test(e)){K.platform="hana";K.alias=K.alias||"hana";}else if(/^\/sap\/opu\//.test(e)){K.platform="abap";}if(K.alias&&K.platform){this.addRemoteSystem(new S(K));}};this.attachLogoutEvent=function(e){t.attachEvent("Logout",e);};this.detachLogoutEvent=function(e){t.detachEvent("Logout",e);};this.attachRendererCreatedEvent=function(e){t.attachEvent("rendererCreated",e);};this.detachRendererCreatedEvent=function(e){t.detachEvent("rendererCreated",e);};this.defaultLogout=function(){var i=new jQuery.Deferred();function K(){A.logout(true).always(function(){L.removeItem(D);i.resolve();});}function N(){if(t.fireEvent("Logout",true)){K();}else{setTimeout(K,1000);}}function O(){var y,P=[];if(z){window.removeEventListener("storage",z);}u.localStorageSetItem(D,"pending");H._suppressOData();y=H._getRemoteSystems();Object.keys(y).forEach(function(Q){try{P.push(n("Container",y[Q]).logout(false));}catch(e){jQuery.sap.log.warning("Could not create adapter for "+Q,e.toString(),"sap.ushell.Container");}L.removeItem(x+Q);});jQuery.when.apply(jQuery,P).done(N);}if(typeof A.addFurtherRemoteSystems==="function"){A.addFurtherRemoteSystems().always(O);}else{O();}return i.promise();};this.logout=this.defaultLogout;this.registerLogout=function(e){this.logout=e;};this.setLogonFrameProvider=function(e){if(this.oFrameLogonManager){this.oFrameLogonManager.logonFrameProvider=e;}};this.setXhrLogonTimeout=function(P,T){if(this.oFrameLogonManager){this.oFrameLogonManager.setTimeout(P,T);}};this.getFLPConfig=function(){var H=this,P=new Promise(function(e,i){var K={URL:H.getFLPUrl()};if(o.CDMPromise){o.CDMPromise.then(function(N){N.getSite().then(function(O){K.scopeId=O.site.identification.id;e(K);});});}else{e(K);}});return P;};this.getFLPUrl=function(i){var e=u.getLocationHref(),K=e.indexOf(this.getService("URLParsing").getShellHash(e));if(K===-1||i===true){return e;}return e.substr(0,K-1);};this.getFLPUrlAsync=function(i){return new jQuery.Deferred().resolve(H.getFLPUrl(i)).promise();};this.inAppRuntime=function(){return false;};this.runningInIframe=this.inAppRuntime;this._getAdapter=function(){return A;};this._closeWindow=k;this._redirectWindow=r;this._getRemoteSystems=I;this._suppressOData=J;sap.ui.getCore().getEventBus().subscribe("sap.ushell.Container","addRemoteSystemForServiceUrl",function(e,i,K){H.addRemoteSystemForServiceUrl(K);});if(typeof A.logoutRedirect==="function"){z=function(e){function i(){H._closeWindow();H._redirectWindow();}if(sap.ushell.Container!==H){return;}if(e.key.indexOf(x)===0&&e.newValue&&e.newValue!==L.getItem(e.key)){u.localStorageSetItem(e.key,e.newValue);}if(e.key===D){if(e.newValue==="pending"){H._suppressOData();if(t.fireEvent("Logout",true)){i();}else{setTimeout(i,1000);}}}};window.addEventListener("storage",z);}this._getFunctionsForUnitTest=function(){return{createAdapter:n};};}function s(e,A){e.forEach(function(i){var t=U.createServiceFactory(i,A);b.register("sap.ushell.ui5service."+i,t);});}function _(e){e.forEach(function(i){var t=a.createServiceFactory(i);b.register("sap.ushell.ui5service."+i,t);});}sap.ushell.bootstrap=function(P,A){var e,D=new jQuery.Deferred();d.init();if(sap.ushell.Container!==undefined){e=new Error("Unified shell container is already initialized - cannot initialize twice.\nStacktrace of first initialization:"+F);jQuery.sap.log.error(e,e.stack,g);throw e;}F=(new Error()).stack;j=jQuery.extend({},true,window["sap-ushell-config"]||{});p=A;if(typeof window["sap.ushell.bootstrap.callback"]==="function"){setTimeout(window["sap.ushell.bootstrap.callback"]);}if(j.modulePaths){Object.keys(j.modulePaths).forEach(function(t){jQuery.sap.registerModulePath(t,j.modulePaths[t]);});}s(["Personalization","URLParsing","CrossApplicationNavigation"],true);s(["Configuration"],false);_(["CardNavigation","CardUserRecents","CardUserFrequents"]);var i=new S({alias:"",platform:j.platform||P});n("Container",i,null,true).then(function(t){t.load().then(function(){function v(){var x,y;var z=window["sap-ushell-config"];if(!z||!z.services){return false;}x=z.services.PluginManager;y=x&&x.config;return y&&y.loadPluginsFromSite;}sap.ushell.Container=new q(t);var w=[sap.ushell.Container.getServiceAsync("PluginManager")];if(v()){o.CDMPromise=sap.ushell.Container.getServiceAsync("CommonDataModel");w.push(o.CDMPromise);}Promise.all(w).then(function(x){var y=x[0],z=x[1];var B=z?z.getPlugins():jQuery.when({});B.then(function(G){var H=jQuery.extend(true,{},j.bootstrapPlugins,G);y.registerPlugins(H);});}).then(function(){if(u.hasFLPReadyNotificationCapability()){u.getPrivateEpcm().doEventFlpReady();}});D.resolve();});});return D.promise();};});
