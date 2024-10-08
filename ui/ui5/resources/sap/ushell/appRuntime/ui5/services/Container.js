// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/services/Container","sap/ushell/appRuntime/ui5/AppRuntimeService","sap/ushell/appRuntime/ui5/renderers/fiori2/Renderer","sap/ushell/appRuntime/ui5/ui/UIProxy","sap/base/assert"],function(c,A,R,U,a){"use strict";function C(){var o,O,b=false,r=[],d=[],s=[],e=false;this.bootstrap=function(p,m){return sap.ushell.bootstrap(p,m).then(function(f){O=sap.ushell.Container.setDirtyFlag;o=sap.ushell.Container._getAdapter();sap.ushell.Container.inAppRuntime=function(){return true;};sap.ushell.Container.runningInIframe=sap.ushell.Container.inAppRuntime;sap.ushell.Container.setDirtyFlag=function(i){O(i);A.sendMessageToOuterShell("sap.ushell.services.ShellUIService.setDirtyFlag",{"bIsDirty":i});};sap.ushell.Container.getFLPUrl=function(i){return A.sendMessageToOuterShell("sap.ushell.services.Container.getFLPUrl",{bIncludeHash:i});};sap.ushell.Container.getFLPUrlAsync=function(i){return sap.ushell.Container.getFLPUrl(i);};sap.ushell.Container.getRenderer=function(){return R;};sap.ushell.Container.logout=function(){return o.logout();};sap.ushell.Container.setDirtyFlag=function(i){b=i;A.sendMessageToOuterShell("sap.ushell.services.Container.setDirtyFlag",{bIsDirty:i});};sap.ushell.Container.getDirtyFlag=function(){return b||sap.ushell.Container.handleDirtyStateProvider();};sap.ushell.Container.registerDirtyStateProvider=function(D){if(typeof D!=="function"){throw new Error("fnDirty must be a function");}r.push(D);if(r.length===1){A.sendMessageToOuterShell("sap.ushell.services.Container.registerDirtyStateProvider",{bRegister:true});}};sap.ushell.Container.handleDirtyStateProvider=function(n){var D=false;if(r.length>0){for(var i=0;i<r.length&&D===false;i++){D=D||r[i](n)||false;}}return D;};sap.ushell.Container.deregisterDirtyStateProvider=function(D){if(typeof D!=="function"){throw new Error("fnDirty must be a function");}var n=-1;for(var i=r.length-1;i>=0;i--){if(r[i]===D){n=i;break;}}if(n===-1){return;}r.splice(n,1);if(r.length===0){A.sendMessageToOuterShell("sap.ushell.services.Container.registerDirtyStateProvider",{bRegister:false});}};sap.ushell.Container.cleanDirtyStateProviderArray=function(){r=[];b=false;};sap.ushell.Container.setAsyncDirtyStateProvider=function(){};sap.ushell.Container.getAsyncDirtyStateProviders=function(){return r;};sap.ushell.Container.setAsyncDirtyStateProviders=function(D){r=D;if(r.length>0){A.sendMessageToOuterShell("sap.ushell.services.Container.registerDirtyStateProvider",{bRegister:true});}};function _(F,h){var j=false;for(var i=0;i<F.length;i++){if(F[i]===h){j=true;break;}}if(!j){F.push(h);}}sap.ushell.Container.attachLogoutEvent=function(F,h){a(typeof(F)==="function","Container.attachLogoutEvent: fnFunction must be a function");if(h===true){_(d,F);}else{_(s,F);}if(!e){e=true;return A.sendMessageToOuterShell("sap.ushell.services.Container.attachLogoutEvent",{});}};sap.ushell.Container._getAsyncFunctionsArray=function(){return d;};sap.ushell.Container._getSyncFunctionsArray=function(){return d;};sap.ushell.Container.executeAsyncAndSyncLogoutFunctions=function(){return new Promise(function(h,k){var l=[];if(s.length>0){for(var i=0;i<s.length;i++){s[i]();}}if(d.length>0){for(var j=0;j<d.length;j++){l.push(d[j]());}}Promise.all(l).then(h);});};function g(F,h){for(var i=0;i<F.length;i++){if(F[i]===h){F.splice(i,1);break;}}}sap.ushell.Container.detachLogoutEvent=function(F){g(s,F);g(d,F);};sap.ushell.Container._getAsyncFunctionsArray=function(){return d;};sap.ushell.Container._getSyncFunctionsArray=function(){return s;};sap.ushell.Container._clearAsyncFunctionsArray=function(){d=[];};sap.ushell.Container._clearSyncFunctionsArray=function(){s=[];};});};}return new C();},true);
