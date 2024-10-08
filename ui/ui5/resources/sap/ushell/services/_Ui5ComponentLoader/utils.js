// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/thirdparty/jquery","sap/base/util/UriParameters"],function(q,U){"use strict";var i=sap.ushell&&sap.ushell.Container&&sap.ushell.Container.getLogonSystem().getPlatform()==="abap";var O={name:"core-ext-light",count:4,debugName:"core-ext-light",path:i?"sap/ushell_abap/bootstrap/evo/":"sap/fiori/"};function c(C,o){var D=new q.Deferred();C.componentData=o;C.async=true;sap.ui.component(C).then(function(n){D.resolve(n);},function(E){D.reject(E);});return D.promise();}function s(S){var A=(S&&S.hasOwnProperty("amendedLoading"))?S.amendedLoading:true;return A;}function a(A){var L=true;if(A.hasOwnProperty("loadCoreExt")){L=A.loadCoreExt;}return L;}function b(A,S,n){var L=true;if(A.hasOwnProperty("loadDefaultDependencies")){L=A.loadDefaultDependencies;}if(S&&S.hasOwnProperty("loadDefaultDependencies")){L=L&&S.loadDefaultDependencies;}L=L&&n;return L;}function d(P){var S=P.semanticObject||null;var A=P.action||null;if(!S||!A){return null;}return"application-"+S+"-"+A+"-component";}function u(n){return n&&n.indexOf("?")>=0;}function r(n){if(!n){return n;}var I=n.indexOf("?");if(I>=0){return n.slice(0,I);}return n;}function e(){return q.sap.isDeclared("sap.fiori.core",true)||q.sap.isDeclared("sap.fiori.core-ext-light",true);}function l(A,E,n,o,C){var t="The issue is most likely caused by application "+A,w="Failed to load UI5 component with properties: '"+C+"'.";if(o){w+=" Error likely caused by:\n"+o;}else{w+=" Error: '"+E+"'";}if(n==="parsererror"){t+=", as one or more of its resources could not be parsed";}t+=". Please create a support incident and assign it to the support component of the respective application.";q.sap.log.error(t,w,A);}function g(n){var P=new U(n||window.location.href).mParams,x=P["sap-xapp-state"],R;delete P["sap-xapp-state"];R={startupParameters:P};if(x){R["sap-xapp-state"]=x;}return R;}function f(A,M){if(!Array.isArray(M)){return;}M.forEach(function(o){var S=String.prototype.toLowerCase.call(o.severity||"");S=["trace","debug","info","warning","error","fatal"].indexOf(S)!==-1?S:"error";q.sap.log[S](o.text,o.details,A);});}function p(C){var B,o={name:"CoreResourcesComplement"};if(v(C)){B=C;}else{B=O;}if(window["sap-ui-debug"]===true){o.aResources=[B.path+B.debugName+".js"];}else{o.aResources=h(B.name,B.path,B.count);}return o;}function h(B,P,R){var n=arguments[3]||[],o=P;if(typeof B!=="string"||typeof o!=="string"||typeof R!=="number"){q.sap.log.error("Ui5ComponentLoader: _buildBundleResourcesArray called with invalid arguments");return null;}if(o.substr(-1)!=="/"){o+="/";}if(R===1){n.push(o+B+".js");}if(n.length>=R){return n;}n.push(o+B+"-"+n.length+".js");return h(B,o,R,n);}function v(C){var n=true;if(!C){return false;}if(!C.name||typeof C.name!=="string"){q.sap.log.error("Ui5ComponentLoader: Configured CoreResourcesComplement Bundle has incorrect 'name' property");n=false;}if(!C.count||typeof C.count!=="number"){q.sap.log.error("Ui5ComponentLoader: Configured CoreResourcesComplement Bundle has incorrect 'count' property");n=false;}if(!C.debugName||typeof C.debugName!=="string"){q.sap.log.error("Ui5ComponentLoader: Configured CoreResourcesComplement Bundle has incorrect 'debugName' property");n=false;}if(!C.path||typeof C.path!=="string"){q.sap.log.error("Ui5ComponentLoader: Configured CoreResourcesComplement Bundle has incorrect 'path' property");n=false;}return n;}function j(B){if(!B||!Array.isArray(B.aResources)||!B.name){q.sap.log.error("Ui5ComponentLoader: loadBundle called with invalid arguments");return null;}var P=[],D=new q.Deferred();B.aResources.forEach(function(R){P.push(q.sap._loadJSResourceAsync(R));});Promise.all(P).then(function(){D.resolve();}).catch(function(){q.sap.log.error("Ui5ComponentLoader: failed to load bundle: "+B.name);D.reject();});return D.promise();}function k(A,L,w,o,n,C,t,x){var y=q.extend(true,{},o);if(!y.asyncHints){y.asyncHints=L?{"libs":["sap.ca.scfld.md","sap.ca.ui","sap.me","sap.ui.unified"]}:{};}if(A){y.asyncHints.preloadBundles=y.asyncHints.preloadBundles||[];y.asyncHints.preloadBundles=y.asyncHints.preloadBundles.concat(x.aResources);}if(w){y.asyncHints.waitFor=w;}if(!y.name){y.name=n;}if(C){y.url=r(C);}if(t){y.id=t;}return y;}function m(B,C,A,t){var o=q.extend(true,{startupParameters:{}},B);if(A){o.config=A;}if(t){o.technicalParameters=t;}if(u(C)){var n=g(C);o.startupParameters=n.startupParameters;if(n["sap-xapp-state"]){o["sap-xapp-state"]=n["sap-xapp-state"];}}return o;}return{constructAppComponentId:d,getParameterMap:g,isCoreExtAlreadyLoaded:e,logAnyApplicationDependenciesMessages:f,logInstantiateComponentError:l,shouldLoadCoreExt:a,shouldLoadDefaultDependencies:b,shouldUseAmendedLoading:s,urlHasParameters:u,removeParametersFromUrl:r,createUi5Component:c,prepareBundle:p,loadBundle:j,createComponentProperties:k,createComponentData:m,buildBundleResourcesArray:h};},false);
