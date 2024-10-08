/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object","sap/ui/core/ComponentContainer","sap/ui/core/routing/HashChanger","sap/ui/core/routing/History","sap/ui/core/library","sap/suite/ui/generic/template/lib/ProcessObserver","sap/suite/ui/generic/template/lib/routingHelper","sap/suite/ui/generic/template/lib/TemplateComponent","sap/suite/ui/generic/template/lib/testableHelper","sap/ui/fl/ControlPersonalizationAPI","sap/base/Log","sap/base/util/merge"],function(B,C,H,a,c,P,r,T,t,b,L,m){"use strict";var d=c.routing.HistoryDirection;var h=a.getInstance();var o=sap.ushell&&sap.ushell.Container&&sap.ushell.Container.getService("CrossApplicationNavigation");function f(R){var e=R.substring(R.length-5,R.length);if(e==="query"){return R.substring(0,R.length-5);}return R;}function n(s){if(s.indexOf("/")===0){return s;}return"/"+s;}function A(e){var D="";var R="";var j=Object.keys(e).sort();j.forEach(function(s){var v=e[s];if(Array.isArray(v)){var V=v.sort();for(var i=0;i<V.length;i++){var u=V[i];R=R+D+s+"="+u;D="&";}}else{R=R+D+s+"="+v;D="&";}});return R;}function g(s,e){s=s||"";var D=(s.charAt(s.length-1)==="/")?"?":"/?";return s+(e?D+e:"");}function k(s,e){var i=A(e);return g(s,i);}function l(i,R,j){var s=i.mRoutingTree[R.name];var u=R.template;var E=R.entitySet;var v=s.level;var O=-1;if(i.oFlexibleColumnLayoutHandler){O=v<3?v:0;}var w=O<0?i.oNavigationObserver:i.aNavigationObservers[O];var x=new P();var y=O<0?i.oHeaderLoadingObserver:i.aHeaderLoadingObservers[O];y.addObserver(x);var z={};var S={appComponent:i.oAppComponent,isLeaf:!R.pages||!R.pages.length,entitySet:E,navigationProperty:R.navigationProperty,componentData:{registryEntry:{oAppComponent:i.oAppComponent,componentCreateResolve:j,route:R.name,routeConfig:R,viewLevel:s.level,routingSpec:R.routingSpec,oNavigationObserver:w,oHeaderLoadingObserver:x,preprocessorsData:z}}};if(R.component.settings){Object.assign(S,R.component.settings);}var D;i.oAppComponent.runAsOwner(function(){try{var F=sap.ui.core.Component.create({name:u,settings:S,handleValidation:true,manifest:true});var G;D=new C({propagateModel:true,width:"100%",height:"100%",settings:S});G=F.then(function(I){D.setComponent(I);var s=i.mRoutingTree[R.name];s.componentId=I.getId();return D;});D.loaded=function(){return G;};}catch(e){throw new Error("Component "+u+" could not be loaded");}});return D;}function p(e,s){t.testable(l,"fnCreateComponentInstance");var u=!o||o.isInitialNavigation();var M=(sap.ushell&&sap.ushell.Container)?new Promise(function(i){sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function(j){var $1=j.getCurrentApplication();var _1=function(){$1=$1||j.getCurrentApplication();var a2=$1.getIntent();Promise.all([a2,sap.ushell.Container.getServiceAsync("URLParsing")]).then(function(b2){var a2=b2[0];var c2=b2[1];a2.appSpecificRoute="&/";var d2=c2.constructShellHash(a2);i("#"+d2);});};if($1){_1();}else{j.attachAppLoaded(null,_1);}});}):Promise.resolve("");var v={};var w={iHashChangeCount:0,backTarget:0,aCurrentKeys:[],componentsDisplayed:Object.create(null)};var x=[];var y=Promise.resolve();function G(){var i=s.oRouter,j=i.getTargets()._mTargets,$1=[];Object.keys(j).forEach(function(_1){var a2=j[_1],b2=a2._oOptions,c2=i.getRoute(b2.viewName),d2=c2&&c2._oConfig;if(d2&&(!d2.navigation||!d2.navigation.display)){$1.push({oConfig:d2});}});return $1;}t.testable(G,"fnGetAllPages");function z(i){var j=i||G();if(!Array.isArray(j)){j=[j];}j.forEach(function($1){$1.oComponentContainer=l(e,$1.oConfig,function(){});});return j;}t.testable(z,"fnCreatePages");function D(){var i=s.oRouter.getViews();i.getView({viewName:"root"});return e.mRouteToTemplateComponentPromise.root;}function E(){return s.oAppComponent.getManifestEntry("sap.app").title;}function F(i,j,$1){var _1=i&&e.componentRegistry[i];var a2=_1&&_1.methods.getUrlParameterInfo;return a2?_1.viewRegistered.then(function(){var b2=j&&n(j);return a2(b2,w.componentsDisplayed[_1.route]===1).then(function(c2){Object.assign($1,c2);});}):Promise.resolve();}function I(i,j,$1){var _1=e.mRoutingTree[i];return F(_1.componentId,$1,j);}function S(i,j){var $1;if(!i&&j instanceof T){var _1=j&&e.componentRegistry[j.getId()];var a2=_1&&_1.methods.getTitle;$1=a2&&a2();}else if(!i&&j&&j.title){$1=j.title;}$1=$1||E();e.oShellServicePromise.then(function(b2){b2.setTitle($1);}).catch(function(){L.warning("No ShellService available");});}function J(i){var j=[e.oPagesDataLoadedObserver.getProcessFinished(true)];var $1=null;var _1=w.iHashChangeCount;delete U.componentsDisplayed;var a2=-1;for(var b2 in e.componentRegistry){var c2=e.componentRegistry[b2];var d2=c2.oControllerUtils&&c2.oControllerUtils.oServices.oTemplateCapabilities.oMessageButtonHelper;var e2=w.componentsDisplayed[c2.route]===1;var f2=c2.utils.getTemplatePrivateModel();f2.setProperty("/generic/isActive",e2);if(e2){j.push(c2.oViewRenderedPromise);if(c2.viewLevel>a2){a2=c2.viewLevel;$1=c2.oComponent;}}else{c2.utils.suspendBinding();}if(d2){d2.setEnabled(e2);}}var g2=e.oFlexibleColumnLayoutHandler&&e.oFlexibleColumnLayoutHandler.isAppTitlePrefered();S(g2,i||$1);Promise.all(j).then(function(){if(_1===w.iHashChangeCount&&jQuery.isEmptyObject(v)){e.oAppComponent.firePageDataLoaded();}});}var K=J.bind(null,null);function O(i,j){var $1=[];for(var _1=i;_1.level>=j;_1=e.mRoutingTree[_1.parentRoute]){$1.push(_1);}return $1.reverse();}function Q(j,$1,_1){if(j.level===0){return null;}var a2=_1?j.pattern:j.contextPath;if(!a2){return null;}if(a2.indexOf("/")!==0){a2="/"+a2;}for(var i=1;i<=j.level;i++){a2=a2.replace("{keys"+i+"}",$1[i]);}return a2;}var R;var U;var V;t.testable(function(i){U=i;x.push(w);w={backTarget:0,componentsDisplayed:Object.create(null)};},"setCurrentIdentity");function W(){return U;}function X(j,$1){if(Array.isArray(j)&&j.length<2){j=j[0];}if(Array.isArray($1)&&$1.length<2){$1=$1[0];}if(Array.isArray(j)){if(Array.isArray($1)){if(j.length===$1.length){j=j.sort();$1=$1.sort();return j.every(function(_1,i){return _1===$1[i];});}return false;}return false;}return $1===j;}function Y(i){if(!U||U.treeNode!==i.treeNode){return false;}for(var j=i.treeNode;j.level>0;j=e.mRoutingTree[j.parentRoute]){if(!j.noKey&&i.keys[j.level]!==U.keys[j.level]){return false;}}if(jQuery.isEmptyObject(i.appStates)!==jQuery.isEmptyObject(U.appStates)){return false;}if(jQuery.isEmptyObject(i.appStates)){return true;}var $1=Object.assign(Object.create(null),i.appStates,U.appStates);for(var _1 in $1){if(!X(i.appStates[_1],U.appStates[_1])){return false;}}return true;}function Z(i,j,$1){var _1=Object.create(null);for(var a2=i;a2.level>0;a2=e.mRoutingTree[a2.parentRoute]){if(!a2.noKey){_1["keys"+a2.level]=j[a2.level];}}var b2=!jQuery.isEmptyObject($1);var c2=i.sRouteName+(b2?"query":"");if(b2){_1["query"]=$1;}return{route:c2,parameters:_1};}function $(i){var j=Z(R.identity.treeNode,R.identity.keys,R.identity.appStates);s.oRouter.navTo(j.route,j.parameters,i);}function _(i){if(!i||!R.identity){return;}var j=function(_1,a2,b2){b2=a2?a2.getId():b2;var c2=e.componentRegistry[b2];(c2.methods.presetDisplayMode||jQuery.noop)(i,_1);};for(var $1=R.identity.treeNode;$1;$1=$1.parentRoute&&e.mRoutingTree[$1.parentRoute]){if($1.componentId){j(w.componentsDisplayed[$1.sRouteName]===1,null,$1.componentId);}else{e.mRouteToTemplateComponentPromise[$1.sRouteName].then(j.bind(null,false));}if($1.fCLLevel===0||$1.fCLLevel===3){break;}}}function a1(i){var j;if(i){if(R||(U&&U.preset)){R={identity:i.identity,followUpNeeded:true};_(i.displayMode);return;}if(i.identity&&Y(i.identity)){return;}j=i.mode;R=i;_(i.displayMode);delete R.displayMode;}else{j=1;}R.followUpNeeded=R.identity&&j<0;if(R.identity||(j===-1&&w.backTarget)){e.oBusyHelper.setBusyReason("HashChange",true);R.displayMode=0;}else{R=null;}if(j<0){window.history.go(j);}else{$(j===1);}}function b1(i,j){i.text=((i.headerTitle!==j)&&j)||"";if(V&&V.linkInfos.length>i.level){V.adjustNavigationHierarchy();}}function c1(i,j){var $1=Object.create(null);var _1=Q(i,U.keys);if(e.oFlexibleColumnLayoutHandler){e.oFlexibleColumnLayoutHandler.adaptBreadCrumbUrlParameters($1,i);}var a2={treeNode:i};var b2=F(i.componentId,_1,$1).then(function(){var c2=Z(i,U.keys,$1);a2.fullLink=s.oRouter.getURL(c2.route,c2.parameters);});j.push(b2);a2.navigate=function(c2){e.oBusyHelper.setBusy(b2.then(function(){var d2={treeNode:i,keys:U.keys.slice(0,i.level+1),appStates:$1};n1(d2,false,c2);}));};a2.adaptBreadCrumbLink=function(c2){b2.then(function(){var h2=s.oHashChanger.hrefForAppSpecificHash?s.oHashChanger.hrefForAppSpecificHash(a2.fullLink):"#/"+a2.fullLink;c2.setHref(h2);});var d2=function(){b1(i,c2.getText());};if(!a2.bLinkAttached){a2.bLinkAttached=true;var e2=c2.getBindingInfo("text")||{};e2.events={change:d2};}var f2=c2.getElementBinding();var g2=f2&&f2.getPath();if(g2===_1){d2();}else{c2.bindElement({path:_1,parameters:{canonicalRequest:!e.bCreateRequestsCanonical}});}};return a2;}function d1(i,j){var $1={title:j.treeNode.headerTitle||"",icon:j.treeNode.titleIconUrl||"",subtitle:j.treeNode.text,intent:i+j.fullLink};return $1;}function e1(){var j=[];var $1=[M];var _1=e.oFlexibleColumnLayoutHandler&&e.oFlexibleColumnLayoutHandler.hasNavigationMenuSelfLink(U);for(var a2=_1?U.treeNode:e.mRoutingTree[U.treeNode.parentRoute];a2;a2=e.mRoutingTree[a2.parentRoute]){var b2=c1(a2,$1);j[a2.level]=b2;}var c2=Promise.all($1);var d2=function(){e.oShellServicePromise.then(function(e2){e2.setHierarchy([]);c2.then(function(f2){var g2=f2[0];var h2=[];for(var i=j.length-1;i>=0;i--){h2.push(d1(g2,j[i]));}e2.setHierarchy(h2);});}).catch(function(){L.warning("No ShellService available");});};V={linkInfos:j,adjustNavigationHierarchy:d2};d2();}function f1(){return V.linkInfos;}function g1(i){var j=U;if(R&&R.identity&&!R.followUpNeeded){U=R.identity;}else{U=Object.create(null);var $1=i.getParameter("config");var _1=f($1.name);U.treeNode=e.mRoutingTree[_1];var a2=i.getParameter("arguments");U.appStates=a2["?query"]||Object.create(null);U.keys=[""];for(var b2=U.treeNode;b2.level>0;b2=e.mRoutingTree[b2.parentRoute]){U.keys[b2.level]=b2.noKey?"":a2["keys"+b2.level];}}U.previousIdentity=j;U.componentsDisplayed=Object.create(null);U.componentsDisplayed[U.treeNode.sRouteName]=1;e1();}function h1(i,j){var $1={identity:{treeNode:U.treeNode,keys:U.keys,appStates:Object.assign(Object.create(null),U.appStates)},mode:1};if(Array.isArray(j)&&j.length<2){j=j[0];}if(j){$1.identity.appStates[i]=j;}else{delete $1.identity.appStates[i];}a1($1);}var i1;function j1(i,j,$1,_1){if(!i){A1(j);return;}var a2=o1(i);if(!a2){return;}a2.appStates=Object.create(null);var b2;if(a2.treeNode.fCLLevel===0||a2.treeNode.fCLLevel===3){var c2=Q(a2.treeNode,a2.keys);b2=F(a2.treeNode.componentId,c2,a2.appStates);}else{b2=e.oFlexibleColumnLayoutHandler.getAppStatesPromiseForNavigation(U,a2);}if(!j&&_1&&_1.bIsCreate&&_1.bIsDraft&&!_1.bIsDraftModified){i1={index:x.length,path:i.getPath(),identity:a2,displayMode:s1()};}e.oBusyHelper.setBusy(b2.then(function(){n1(a2,j,$1);}));}function k1(j){if(!i1||i1.path!==j.getPath()){return null;}var $1;var _1=function(f2,i){return f2!==$1.identity.keys[i];};for(var i=i1.index+1;i<x.length;i++){$1=x[i];if($1.identity.treeNode.level<i1.identity.treeNode.level||i1.identity.keys.some(_1)){return null;}}var a2=0;for(var b2=w;b2.iHashChangeCount!==i1.index;b2=x[b2.backTarget]){if(b2.iHashChangeCount<i1.index){return null;}a2--;}var c2=x[i1.index].identity;var d2={treeNode:c2.treeNode,keys:c2.keys,appStates:Object.create(null)};var e2=a1.bind(null,{identity:d2,mode:a2,displayMode:i1.displayMode});if(c2.treeNode.fCLLevel===0||c2.treeNode.fCLLevel===3){Object.assign(d2.appStates,c2.appStates);return Promise.resolve(e2);}return e.oFlexibleColumnLayoutHandler.getSpecialDraftCancelPromise(U,c2,d2.appStates).then(function(){return e2;});}function l1(i,$1){var _1=r.determineNavigationPath(i);var a2={keys:["",_1.key],appStates:Object.create(null)};var b2=n1.bind(null,a2,true,$1);if(U.treeNode.level===1){a2.treeNode=U.treeNode;Object.assign(a2.appStates,U.appStates);return Promise.resolve(b2);}var c2=O(U.treeNode,2);var d2=c2.map(function(j){if(j.noKey){return Promise.resolve(true);}if(!j.isDraft){return Promise.resolve(U.keys[j.level]);}var f2=j.noOData?Q(j,U.keys):"/"+j.entitySet+"("+U.keys[j.level]+")";var g2=e.oApplicationProxy.getSiblingPromise(f2);return g2.then(function(i){var h2=i&&r.determineNavigationPath(i,j.navigationProperty);return h2&&h2.key;},jQuery.noop);});var e2=Promise.all(d2);return e2.then(function(f2){var g2=e.mEntityTree[_1.entitySet];for(var j=0;f2[j];j++){g2=c2[j];a2.keys.push(g2.noKey?"":f2[j]);}a2.treeNode=g2;if(g2===U.treeNode){Object.assign(a2.appStates,U.appStates);return b2;}var h2=e.oFlexibleColumnLayoutHandler.getAppStatesPromiseForColumnClose(g2,a2.appStates);return h2.then(function(){return b2;});});}function m1(i,j){if((i&&i.treeNode)!==j.treeNode){return Promise.resolve(false);}if(e.oFlexibleColumnLayoutHandler&&!e.oFlexibleColumnLayoutHandler.areIdentitiesLayoutEquivalent(i,j)){return Promise.resolve(false);}var $1=true;var _1=i.treeNode.sRouteName;for(var a2=i.treeNode;a2.level>0;a2=e.mRoutingTree[a2.parentRoute]){var b2=a2.noKey||i.keys[a2.level]===j.keys[a2.level];if(!b2&&a2.noOData){return Promise.resolve(false);}$1=$1&&b2;if(a2.noOData){_1=a2.parentRoute;}}if($1){return Promise.resolve(true);}var c2=e.mRoutingTree[_1];var d2=i.keys.slice(0,c2.level+1);var e2=j.keys.slice(0,c2.level+1);var f2=Q(c2,d2);var g2=Q(c2,e2);return e.oApplicationProxy.areTwoKnownPathesIdentical(f2,g2,c2.level===1);}function n1(i,j,$1){var _1=x[w.backTarget];var a2=-1;if(i.treeNode.level===0||(e.oFlexibleColumnLayoutHandler&&i.treeNode.fCLLevel===0)){for(;_1.backTarget>0&&_1.identity.treeNode.level>i.treeNode.level;a2--){_1=x[_1.backTarget];}}var b2=m1(_1&&_1.identity,i);var c2=b2.then(function(d2){var e2=d2?a2:(0+!!j);var f2={identity:i,mode:e2,displayMode:$1};a1(f2);});e.oBusyHelper.setBusy(c2);return c2;}function o1(i){if(i){var j=r.determineNavigationPath(i);var $1=e.mEntityTree[j.entitySet];var _1=U.treeNode;for(;_1.level>$1.level-1;){_1=e.mRoutingTree[_1.parentRoute];}if(_1.sRouteName!==$1.parentRoute){L.error("Navigation to context from entity set "+j.entitySet+" not possible while being on route "+U.treeNode.sRouteName);return null;}var a2=U.keys.slice(0,_1.level+1);a2.push(j.key);return{treeNode:$1,keys:a2};}return{treeNode:e.mRoutingTree["root"],keys:[""]};}function p1(i,j,$1){if(i.fCLLevel===0||i.fCLLevel===3){return F(i.componentId,null,j);}return e.oFlexibleColumnLayoutHandler[(i.level>U.treeNode.level)?"getAppStatesPromiseForColumnOpen":"getAppStatesPromiseForColumnClose"](i,j,$1);}function q1(i){var j=o1(i);j.appStates=Object.create(null);var $1;if(j.treeNode===U.treeNode){Object.assign(j.appStates,U.appStates);$1={identity:j,mode:1,displayMode:1};a1($1);return;}var _1=p1(j.treeNode,j.appStates);e.oBusyHelper.setBusy(_1.then(n1.bind(null,j,true,1)));}function r1(i){var j;var $1=0;for(j=w;j.backTarget>0&&(!j.identity||j.identity.treeNode.level>i);$1++){j=x[j.backTarget];}if(!u&&($1===0||j.identity.treeNode.level>i)){window.history.go(-$1-1);return;}var _1=-$1||1;var a2=R1(i);var b2={treeNode:a2,keys:U.keys.slice(0,a2.level+1),appStates:Object.create(null)};var c2=p1(b2.treeNode,b2.appStates).then(function(){if(_1<0&&(b2.treeNode.fCLLevel===1||b2.treeNode.fCLLevel===2)&&j.identity.treeNode===b2.treeNode){for(;j.backTarget>0&&!e.oFlexibleColumnLayoutHandler.areIdentitiesLayoutEquivalent(j.identity,b2);_1--){j=x[j.backTarget];if(j.identity.treeNode!==b2.treeNode){break;}}}var d2={identity:b2,mode:_1,displayMode:b2.treeNode.isDraft?6:1};a1(d2);});e.oBusyHelper.setBusy(c2);}function s1(){var i=e.componentRegistry[U.treeNode.componentId];var j=i.utils.getTemplatePrivateModel();var $1=j.getProperty("/objectPage/displayMode")||0;return $1;}function t1($1,_1,a2,b2){var c2;var d2=true;for(var i=0;i<U.treeNode.children.length&&!c2;i++){var e2=U.treeNode.children[i];var f2=e.mEntityTree[e2];if(f2[U.treeNode.level?"navigationProperty":"sRouteName"]===$1){c2=f2.sRouteName;d2=!f2.noKey;}}var g2=!c2&&_1&&U.treeNode.embeddedComponents[_1];if(g2){for(var j=0;j<g2.pages.length&&!c2;j++){var h2=g2.pages[j];if(h2.navigationProperty===$1){c2=U.treeNode.sRouteName+"/"+_1+"/"+$1;d2=!(h2.routingSpec&&h2.routingSpec.noKey);}}}if(c2){var i2=e.mRoutingTree[c2];var j2=U.keys.concat([d2?a2:""]);var k2=Object.create(null);var l2=p1(i2,k2,j2);l2.then(function(){var m2=s1();var n2={treeNode:i2,keys:j2,appStates:k2};n1(n2,b2,m2);});}}function u1(){return!!R;}function v1(i){L.info("Navigate back");if(w.backTarget&&n(h.getPreviousHash()||"")!==n(w.hash)){e.oBusyHelper.setBusyReason("HashChange",true);}w.LeaveByBack=!w.forwardingInfo;if(w.LeaveByBack){w.backSteps=i;}window.history.go(-i);}function w1(j,$1,_1,a2){var b2=e.oAppComponent.getConfig();var c2=b2&&b2.settings&&b2.settings.objectPageDynamicHeaderTitleWithVM;if(!c2){if(b2&&b2.settings&&b2.settings.objectPageHeaderType==="Dynamic"){c2=(b2&&b2.settings&&b2.settings.objectPageVariantManagement==="VendorLayer")?true:false;}}var d2;var e2=jQuery.sap.getUriParameters();if(e2.mParams["sap-ui-layer"]){var f2=e2.mParams["sap-ui-layer"];for(var i=0;i<f2.length;i++){if(f2[i].toUpperCase()==="VENDOR"){d2=true;break;}}}j=n(j||"");L.info("Navigate to hash: "+j);if(j===w.hash){L.info("Navigation suppressed since hash is the current hash");return;}w.targetHash=j;if(w.backTarget&&n(h.getPreviousHash()||"")===j){v1(1);return;}if(w.oEvent){var g2=w.oEvent.getParameter("config").viewLevel;}if(c2&&d2){if(!a2){if(!e.oFlexibleColumnLayoutHandler){b.clearVariantParameterInURL();}else{if(g2>=_1){if(_1===1){b.clearVariantParameterInURL();}else if(_1===2){var h2;for(var i2 in e.componentRegistry){if(e.componentRegistry[i2].viewLevel===2){h2=e.componentRegistry[i2];break;}}var j2=h2.oController.byId("template::ObjectPage::ObjectPageVariant");b.clearVariantParameterInURL(j2);}}}}}e.oBusyHelper.setBusyReason("HashChange",true);w.LeaveByReplace=$1;if($1){s.oHashChanger.replaceHash(j);}else{s.oHashChanger.setHash(j);}}function x1(i,j,$1,_1,a2,b2){var c2=j.then(function(d2){i=g(i,d2);if(a2){w.backwardingInfo={count:a2.count,index:a2.index,targetHash:n(i)};v1(a2.count);}else{w1(i,_1,$1,b2);}return i;});e.oBusyHelper.setBusy(c2);return c2;}function y1(i,j){var $1,_1,a2,b2,c2,d2;$1=0;_1=w.iHashChangeCount;a2=null;for(b2=w;b2.oEvent;$1++){c2=b2.oEvent.getParameter("config");d2=c2?c2.viewLevel:-1;if(d2===0||(i&&n(b2.hash).indexOf(j)!==0)){a2={count:$1,index:_1,routeName:c2?c2.name:undefined};break;}if(b2.backTarget===0){if(i){a2={count:$1+1,index:_1,routeName:undefined};}break;}_1=b2.backTarget;b2=x[_1];}return a2;}function z1(i,j,$1){if($1===0){return y1();}var _1=x[w.backTarget];return _1&&_1.hash&&n(_1.hash.split("?")[0])===n(j)&&{count:1,index:w.backTarget};}function A1(i){if(U.treeNode.level===0){return;}var j={treeNode:e.mRoutingTree["root"],keys:[""],appStates:Object.create(null)};var $1=e.oFlexibleColumnLayoutHandler?e.oFlexibleColumnLayoutHandler.getAppStatesPromiseForColumnClose(j.treeNode,j.appStates):I("root",j.appStates);$1.then(n1.bind(null,j,i));e.oBusyHelper.setBusy($1);}function B1(i){var j=e.mEntityTree[i.entitySet].sRouteName;var $1=e.mRouteToTemplateComponentPromise[j];return[$1];}function C1(j,$1){var _1=w.componentsDisplayed;var a2=function(c2){var d2=e.componentRegistry[c2.getId()];(d2.methods.presetDisplayMode||jQuery.noop)($1,_1[d2.route]===1);};for(var i=0;i<j.length;i++){var b2=j[i];b2.then(a2);}}function D1(i){var j=i&&e.mEntityTree[i.entitySet];var $1=j?j.level:1;return $1;}function E1(j,$1){var _1=e.oApplicationProxy.getHierarchySectionsFromCurrentHash();var a2=j;for(var i=$1-2;i>=0;i--){a2=_1[i]+"/"+a2;}return"/"+a2;}function F1(i,j,$1,_1,a2){var b2={};var c2=e.oFlexibleColumnLayoutHandler&&e.oFlexibleColumnLayoutHandler.getFCLAppStatesPromise(i,b2);var d2=I(i,b2,j);var e2=(c2?Promise.all([c2,d2]):d2).then(A.bind(null,b2));var f2=z1(_1,j,$1);var g2=x1(j,e2,$1,_1,f2,a2);e.oBusyHelper.setBusy(g2);return g2;}function G1(j,$1,_1,a2,b2,c2){var d2;var e2,f2,g2;var h2=[];if(typeof j==="string"){d2=j;var i2=n(d2);if(i2==="/"){e2=0;}else{g2=i2.split("/");e2=g2.length-1;}switch(e2){case 0:f2="root";break;case 1:f2=g2[1].split("(")[0];break;default:f2="";var j2="";for(var i=0;i<e2;i++){var k2=g2[i+1];var l2=k2.indexOf("(");if(l2>0){k2=k2.substring(0,l2);}f2=f2+j2+k2;j2="/";}f2=f2.replace("---","/");}}else{var m2=r.determineNavigationPath(j,$1);e2=D1(m2);d2=m2.path;h2=B1(m2);f2=e.mEntityTree[m2.entitySet].sRouteName;}if($1){d2=E1(d2,e2);}C1(h2,a2||0);if(b2){d2=k(d2,b2);w1(d2,_1,e2,c2);return Promise.resolve(d2);}else{return F1(f2,d2,e2,_1,c2);}}function H1(i,j,$1,_1,a2){return G1(i,j,$1,_1,undefined,a2);}function I1(i,j){w.componentsDisplayed[i]=j;var $1=e.mRoutingTree[i];var _1=$1.componentId;if(_1){var a2=e.componentRegistry[_1];var b2=a2.utils.getTemplatePrivateModel();b2.setProperty("/generic/isActive",j===1);}}function J1(i){var j,$1,_1,a2,b2,c2=null,d2,e2;if(i){j=i.entitySet;$1=i.text;c2=i.icon;e2=i.description;}if(j){d2=e.oAppComponent.getModel().getMetaModel();if(d2){_1=d2.getODataEntitySet(j);a2=d2.getODataEntityType(_1.entityType);b2=a2["com.sap.vocabularies.UI.v1.HeaderInfo"];}if(b2&&b2.TypeImageUrl&&b2.TypeImageUrl.String){c2=b2.TypeImageUrl.String;}}e.oShellServicePromise.then(function(h2){if(h2.setBackNavigation){h2.setBackNavigation(undefined);}}).catch(function(){L.warning("No ShellService available");});e.oTemplatePrivateGlobalModel.setProperty("/generic/messagePage",{text:$1,icon:c2,description:e2});if(e.oFlexibleColumnLayoutHandler){e.oFlexibleColumnLayoutHandler.displayMessagePage(i,w.componentsDisplayed);}else{var f2=s.oRouter.getTargets();f2.display("messagePage");for(var g2 in w.componentsDisplayed){I1(g2,5);}}J(i);}function K1(){if(!jQuery.isEmptyObject(v)){var j=null;for(var i=0;!j;i++){j=v[i];}v={};J1(j);}}function L1(i){if(s.oTemplateContract.oFlexibleColumnLayoutHandler){i.viewLevel=i.viewLevel||0;v[i.viewLevel]=i;var j=Promise.all([y,s.oTemplateContract.oPagesDataLoadedObserver.getProcessFinished(true)]);j.then(K1);j.then(e.oBusyHelper.setBusyReason.bind(null,"HashChange",false));return;}J1(i);e.oBusyHelper.setBusyReason("HashChange",false);}function M1(){var i=[];var j=U.componentsDisplayed||w.componentsDisplayed;for(var $1 in e.componentRegistry){var _1=e.componentRegistry[$1];if(j[_1.route]===1){i.push($1);}}return i;}function N1(){var i=[];for(var j in e.componentRegistry){i.push(j);}return i;}function O1(i){return U.keys.slice(0,i+1);}function P1(j){var $1="";var _1=w.hash;var a2=_1.split("/");var b2="";for(var i=0;i<=j;i++){$1=$1+b2+a2[i];b2="/";}return $1;}function Q1(){return w;}function R1(i){var j=U.treeNode;for(;j.level>i;){j=e.mRoutingTree[j.parentRoute];}return j;}function S1(i,j,$1){var _1=$1.getId();var a2=e.componentRegistry[_1];var b2=a2.route;var c2=j.componentsDisplayed[b2];var d2=c2===1;w.componentsDisplayed[b2]=1;var e2=$1.onActivate(i,d2)||Promise.resolve();return Promise.all([e2,a2.viewRegistered]).then(function(){a2.aKeys=O1(a2.viewLevel);});}function T1(i,j,$1){return S1(i,j,$1).then(K);}function U1(i,j,$1){var _1={};if(j||$1){var a2=i.level;for(var b2=0;b2<a2;b2++){_1[b2]=e.oPaginatorInfo[b2];}}e.oPaginatorInfo=_1;}function V1(i){return e.oApplicationProxy.getAlternativeContextPromise(i);}function W1(i){g1(i);U.preset=true;if(e.oFlexibleColumnLayoutHandler){e.oFlexibleColumnLayoutHandler.handleBeforeRouteMatched(U);}}function X1(j){if(R&&R.followUpNeeded&&R.identity&&!Y(R.identity)){a1();return;}e.oBusyHelper.setBusyReason("HashChange",false);var $1=U.treeNode.level;var _1=n(s.oHashChanger.getHash()||"");L.info("Route matched with hash "+_1);var a2;if(w.backwardingInfo){a2=w;a2.identity=U.previousIdentity;delete U.previousIdentity;x.push(a2);var b2=a2.iHashChangeCount+1;w={iHashChangeCount:b2,forwardingInfo:{bIsProgrammatic:true,bIsBack:true,iHashChangeCount:b2,targetHash:a2.backwardingInfo.targetHash,componentsDisplayed:a2.componentsDisplayed},backTarget:x[a2.backwardingInfo.index].backTarget,componentsDisplayed:Object.create(null)};}if(w.forwardingInfo&&w.forwardingInfo.targetHash&&w.forwardingInfo.targetHash!==_1){w.hash=_1;var c2=w.forwardingInfo.targetHash;delete w.forwardingInfo.targetHash;w1(c2,true);return;}var d2=false;for(var i=0;i<e.aStateChangers.length;i++){var e2=e.aStateChangers[i];if(e2.isStateChange(U.appStates)){d2=true;}}if(d2){R=null;w.hash=_1;return;}e.oTemplatePrivateGlobalModel.setProperty("/generic/routeLevel",$1);var f2=w.forwardingInfo;delete w.forwardingInfo;if(!f2){f2={componentsDisplayed:w.componentsDisplayed};var g2=w.iHashChangeCount;f2.iHashChangeCount=g2+1;var h2=h.getDirection();if(R){f2.bIsProgrammatic=!!R.identity;f2.bIsBack=R.mode<0;if(f2.bIsBack){w.backSteps=0-R.mode;}f2.bIsForward=!f2.bIsBack&&(h2===d.Forwards);w.LeaveByReplace=R.mode===1;}else{f2.bIsProgrammatic=(_1===w.targetHash);f2.bIsBack=!!(w.LeaveByBack||(!f2.bIsProgrammatic&&(h2===d.Backwards)));f2.bIsForward=!f2.bIsBack&&(h2===d.Forwards);w.LeaveByReplace=f2.bIsProgrammatic&&w.LeaveByReplace;}w.LeaveByBack=f2.bIsBack;a2=w;a2.identity=U.previousIdentity;delete U.previousIdentity;x.push(a2);w={iHashChangeCount:f2.iHashChangeCount,componentsDisplayed:Object.create(null)};if(a2.LeaveByReplace){w.backTarget=a2.backTarget;}else if(f2.bIsBack){var i2=a2.backTarget;for(var j2=a2.backSteps||1;j2>0;j2--){i2=x[i2].backTarget;}w.backTarget=i2;}else{w.backTarget=g2;}}R=null;w.oEvent=j;w.hash=_1;var k2=function(m2){var n2=j.getParameter("arguments");if(m2){var o2=n2["?query"];w.forwardingInfo=f2;G1(m2.context,null,true,m2.iDisplayMode,o2||{});return;}U1(U.treeNode,f2.bIsProgrammatic,f2.bIsBack);if(e.oFlexibleColumnLayoutHandler){y=e.oFlexibleColumnLayoutHandler.handleRouteMatched(f2);}else{if($1===0||f2.bIsBack||!f2.bIsProgrammatic){e.oApplicationProxy.setEditableNDC(false);}var p2=e.mRouteToTemplateComponentPromise[U.treeNode.sRouteName];y=p2.then(function(q2){return T1(Q(U.treeNode,U.keys),f2,q2);});}e.oBusyHelper.setBusy(y);};if(f2.bIsBack){var l2=Q(R1(1),U.keys);e.oBusyHelper.setBusy(V1(l2).then(k2));}else{k2();}}function Y1(i){if(U&&U.preset){delete U.preset;}else{g1(i);}i=m({},i);var j=e.oStatePreserversAvailablePromise.then(X1.bind(null,i),e.oBusyHelper.setBusyReason.bind(null,"HashChange",false));e.oBusyHelper.setBusy(j);}function Z1(){U={appStates:Object.create(null),keys:[]};L1({title:e.getText("ST_ERROR"),text:e.getText("ST_GENERIC_UNKNOWN_NAVIGATION_TARGET"),description:""});}if(e.sRoutingType==="f"){s.oRouter.attachBeforeRouteMatched(W1);}s.oRouter.attachRouteMatched(Y1);s.oRouter.attachBypassed(Z1);s.concatPathAndAppStates=k;s.navigate=w1;s.activateOneComponent=S1;s.afterActivation=K;s.addUrlParameterInfoForRoute=I;s.getApplicableStateForComponentAddedPromise=F;s.setVisibilityOfRoute=I1;s.getActiveComponents=M1;s.getAllComponents=N1;s.getRootComponentPromise=D;s.getActivationInfo=Q1;s.getCurrentKeys=O1;s.getCurrentHash=P1;s.getAppTitle=E;s.navigateByExchangingQueryParam=h1;s.navigateToSubContext=j1;s.getSwitchToSiblingPromise=l1;s.getSpecialDraftCancelPromise=k1;s.getCurrentIdentity=W;s.navigateToIdentity=n1;s.navigateAfterActivation=q1;s.navigateUpAfterDeletion=r1;s.navigateToChild=t1;s.isNavigating=u1;s.getLinksToUpperLayers=f1;s.setTextForTreeNode=b1;s.determinePathForKeys=Q;s.createComponentInstance=l;return{navigateToRoot:A1,navigateToContext:H1,navigateToMessagePage:L1,navigateBack:v1.bind(null,1)};}function q(e,i){var j={oAppComponent:i.oAppComponent,oRouter:i.oAppComponent.getRouter(),oTemplateContract:i,oHashChanger:H.getInstance(),mRouteToComponentResolve:{}};i.oNavigationControllerProxy=j;var F=new Promise(function(s){j.fnInitializationResolve=s;});i.oBusyHelper.setBusy(F);Object.assign(e,p(i,j));Object.assign(j,e);var R=Object.create(null);j.oRouter._oViews._getViewWithGlobalId=function(v){v.viewName=v.name||v.viewName;for(var s in i.componentRegistry){if(i.componentRegistry[s].route===v.viewName){return i.componentRegistry[s].oComponent.getComponentContainer();}}var u=R[v.viewName];if(u){return u;}var w=j.oRouter.getRoute(v.viewName);var x;if(w&&w._oConfig){x=l(i,w._oConfig,j.mRouteToComponentResolve[v.viewName]);}else{x=sap.ui.view({viewName:v.viewName,type:v.type,height:"100%"});}if(v.viewName==="root"){i.rootContainer=x;}u=x.loaded();R[v.viewName]=u;return u;};r.startupRouter(j);}var N=B.extend("sap.suite.ui.generic.template.lib.NavigationController",{metadata:{library:"sap.suite.ui.generic.template"},constructor:function(e){B.apply(this,arguments);t.testableStatic(q,"NavigationController")(this,e);}});N._sChanges="Changes";return N;});
