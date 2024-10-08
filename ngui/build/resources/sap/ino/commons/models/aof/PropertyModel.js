/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["sap/ui/model/json/JSONModel","sap/ino/commons/models/aof/MetaModel","sap/ino/commons/models/aof/PropertyModelCache"],function(J,M,P){"use strict";var N={Root:"Root",Extension:"Extension"};var p=new P({});var a=J.extend("sap.aof.PropertyModel",{metadata:{events:{"modelInitialized":{},"modelCacheUpdated":{},"modelCacheInvalidated":{}}},constructor:function(A,k,s,S,m,o){J.apply(this,[]);if(m){this.attachEvent("modelInitialized",m);}this.applicationObjectName=A;this.key=k;this.scope=s;this.syncRead=S;this.propertyDefault=o;this.initDefault=false;this._load();},bindProperty:function(s,C,m){return J.prototype.bindProperty.apply(this,arguments);},_load:function(){var t=this;if(!this.initDefault){var D={nodes:{},actions:{}};if(this.scope.staticNodes){jQuery.each(this.scope.staticNodes,function(i,n){var f=e(t.propertyDefault,"readOnly",n);D.nodes[n]={readOnly:f!==undefined?f:true,messages:[]};});}if(this.scope.staticActions){jQuery.each(this.scope.staticActions,function(i,A){var s=_(A);var f=e(t.propertyDefault,"enabled",undefined,s);D.actions[s]={enabled:f!==undefined?f:false,messages:[]};});}if(this.scope.nodes){jQuery.each(this.scope.nodes,function(i,n){var f=e(t.propertyDefault,"readOnly",n);D.nodes[n]={readOnly:f!==undefined?f:true,messages:[]};D.nodes[n][t.key]={readOnly:f!==undefined?f:true,messages:[]};});}if(this.scope.actions){jQuery.each(this.scope.actions,function(i,A){var s=_(A);var f=e(t.propertyDefault,"enabled",undefined,s);D.actions[s]={enabled:f!==undefined?f:false,messages:[]};});}if(t.propertyDefault){if(t.propertyDefault.nodes){jQuery.each(t.propertyDefault.nodes,function(n,f){var g=f.readOnly;if(!D.nodes[n]){D.nodes[n]={readOnly:g!==undefined?g:true,messages:[]};}});}if(t.propertyDefault.actions){jQuery.each(t.propertyDefault.actions,function(A,f){var g=f.enabled;if(!D.actions[A]){D.actions[A]={enabled:g!==undefined?g:false,messages:[]};}});}}this.setData(D);this.initDefault=true;}var o=new jQuery.Deferred();this._oDataInitPromise=o.promise();b(this.applicationObjectName,this.key,this.scope,!this.syncRead,function(f){if(f.properties&&f.properties[t.key]){if(f.properties[t.key].nodes){jQuery.each(f.properties[t.key].nodes,function(n,g){if(n===N.Root&&g[t.key]){jQuery.each(g[t.key],function(s,h){g[s]=h;});}if(n===N.Extension){var k=Object.keys(g);if(k.length===1){jQuery.each(g[k[0]],function(s,h){g[s]=h;});}}});if(f.properties[t.key].nodes){jQuery.each(f.properties[t.key].nodes,function(n,g){t.setPropertyInternal("/nodes/"+n,g);});}if(f.properties[t.key].actions){jQuery.each(f.properties[t.key].actions,function(A,g){t.setPropertyInternal("/actions/"+A,g);});}}}if(f.staticProperties){if(f.staticProperties.nodes){jQuery.each(f.staticProperties.nodes,function(n,g){if(!t.getProperty("/nodes/"+n)){t.setPropertyInternal("/nodes/"+n,g);}});}if(f.staticProperties.actions){jQuery.each(f.staticProperties.actions,function(A,g){t.setPropertyInternal("/actions/"+A,g);});}}o.resolve(t.getData());setTimeout(function(){t.fireEvent("modelInitialized");},0);});},setProperty:function(){return;},setPropertyInternal:function(){J.prototype.setProperty.apply(this,arguments);},getNodeReadOnlyFormatter:function(n){var t=this;return function(k){k=k?k:t.key;return!!t.getProperty("/nodes/"+n+"/"+k+"/readOnly");};},getNodeChangeableFormatter:function(n){var t=this;return function(k){k=k?k:t.key;return!!t.getProperty("/nodes/"+n+"/"+k+"/changeable");};},getAttributeReadOnlyFormatter:function(n,A){var t=this;return function(k){k=k?k:t.key;return!!t.getProperty("/nodes/"+n+"/"+k+"/attributes/"+A+"/readOnly");};},getAttributeChangeableFormatter:function(n,A){var t=this;return function(k){k=k?k:t.key;return!!t.getProperty("/nodes/"+n+"/"+k+"/attributes/"+A+"/changeable");};},getActionEnabledFormatter:function(A){var t=this;return function(k){return!!t.getProperty("/actions/"+A+"/enabled");};},getStaticActionEnabledFormatter:function(A){return this.getActionEnabledFormatter(A);},getProperties:function(){return this.getData();},sync:function(k,s){if(!s){a.invalidateCachedProperties(this.applicationObjectName,this.key);}this.key=k||this.key;this._load();},getDataInitializedPromise:function(){return this._oDataInitPromise;}});function _(A){if(typeof A==="object"){return Object.keys(A)[0];}return A;}function b(A,k,s,f,S){var r=false;var o=p.getProperty("/"+A);if(!o){p.setProperty("/"+A,{nodes:{},actions:{}});r=true;}if(k&&(!o||!o[k])){p.setProperty("/"+A+"/"+k,{nodes:{},actions:{}});r=true;}else{if(k){if(!r&&s.nodes){jQuery.each(s.nodes,function(i,n){if(!p.getProperty("/"+A+"/"+k+"/nodes/"+n)){r=true;}});}if(!r&&s.actions){jQuery.each(s.actions,function(i,v){if(typeof v==="object"){r=true;}else{if(!p.getProperty("/"+A+"/"+k+"/actions/"+v)){r=true;}}});}}else{if(!r&&s.staticNodes){jQuery.each(s.staticNodes,function(i,n){if(!p.getProperty("/"+A+"/nodes/"+n)){r=true;}});}if(!r&&!jQuery.isEmptyObject(s.staticActions)){r=true;}}}var g={properties:{},staticProperties:{}};if(r){c(A,k,s,f).done(function(n){if(n.properties){var h=n.properties[k];if(h){if(h.nodes){jQuery.each(h.nodes,function(j,l){p.setProperty("/"+A+"/"+k+"/nodes/"+j,l);});}if(h.actions){jQuery.each(h.actions,function(j,l){p.setProperty("/"+A+"/"+k+"/actions/"+j,l);});}}g.properties=n.properties;}if(n.staticProperties){var i=n.staticProperties;if(i){if(i.nodes){jQuery.each(i.nodes,function(j,l){p.setProperty("/"+A+"/nodes/"+j,l);});}if(i.actions){jQuery.each(i.actions,function(j,l){p.setProperty("/"+A+"/actions/"+j,l);});}}g.staticProperties=n.staticProperties;}p.fireEvent("modelCacheUpdated",n);if(S){S(n);}});}else{if(k){g.properties[k]=o[k];}g.staticProperties={nodes:o.nodes,actions:o.actions};if(S){S({properties:g.properties,staticProperties:g.staticProperties});}}return g;}function c(A,k,s,f){var u,U;var E=M.getEndpoint(A);var r=k&&k>0&&((!!s.nodes&&s.nodes.length>0)||(!!s.actions&&s.actions.length>0));var R=(!!s.staticNodes&&s.staticNodes.length>0)||(!!s.staticActions&&s.staticActions.length>0);var o;if(r){u=[];if(s.nodes){jQuery.each(s.nodes,function(i,n){u.push("node="+n);});}if(s.actions){jQuery.each(s.actions,function(i,v){if(typeof v==="object"){u.push("action="+encodeURI(JSON.stringify(v)));}else{u.push("action="+v);}});}U=u.length>0?"?"+u.join("&"):"";o=jQuery.ajax({url:E+"/"+k+"/properties"+U,async:f,dataType:"json"});o.fail(function(){jQuery.sap.log.debug("Property request failed");});}var S;if(R){u=[];if(s.staticNodes){jQuery.each(s.staticNodes,function(i,n){u.push("node="+n);});}if(s.staticActions){jQuery.each(s.staticActions,function(i,v){if(typeof v==="object"){u.push("action="+encodeURI(JSON.stringify(v)));}else{u.push("action="+v);}});}U=u.length>0?"?"+u.join("&"):"";S=jQuery.ajax({url:E+"/staticProperties"+U,async:f,dataType:"json"});S.fail(function(){jQuery.sap.log.debug("Static property request failed");});}var D=new jQuery.Deferred();jQuery.when(o,S).done(function(g,h){var i={};if(g&&g.length>0){var j=g[0];if(j){if(j[k]&&j[k].nodes){jQuery.each(j[k].nodes,function(n,m){jQuery.each(m,function(k,I){I.changeable=!I.readOnly;jQuery.each(I.attributes,function(q,t){t.changeable=!t.readOnly;});});});}i.properties=j;}}if(h&&h.length>0){var l=h[0];if(l){if(l.nodes){jQuery.each(l.nodes,function(n,m){m.changeable=!m.readOnly;jQuery.each(m.attributes,function(q,t){t.changeable=!t.readOnly;});});}i.staticProperties=l;}}D.resolve(i);});return D.promise();}function d(o,s,k,n,v,A,f){if(k){if(o.properties&&o.properties[k]){var i=o.properties[k];if(f&&i.actions&&i.actions[f]){var g=i.actions[f];return g[s];}else if(n&&i.nodes&&i.nodes[n]&&i.nodes[n][v]){var h=i.nodes[n][v];if(A&&h.attributes&&h.attributes[A]){var j=h.attributes[A];return j[s];}else{return h[s];}}}}else{if(f&&o.staticProperties&&o.staticProperties.actions&&o.staticProperties.actions[f]){var S=o.staticProperties.actions[f];return S[s];}else if(n&&o.staticProperties&&o.staticProperties.nodes&&o.staticProperties.nodes[n]){var l=o.staticProperties.nodes[n];return l[s];}}return undefined;}function e(o,s,n,A){if(o){if(A&&o.actions&&o.actions[A]){var f=o.actions[A];return f[s];}else if(n&&o.nodes&&o.nodes[n]){var g=o.nodes[n];return g[s];}}return undefined;}a.getNodeReadOnlyStaticFormatter=function(A,n){return function(k,v){var o=b(A,k,{nodes:[n]},false);return!!d(o,"readOnly",k,n,v||k);};};a.getNodeChangeableStaticFormatter=function(A,n){return function(k,v){var o=b(A,k,{nodes:[n]},false);return!!d(o,"changeable",k,n,v||k);};};a.getAttributeReadOnlyStaticFormatter=function(A,n,s){return function(k,v){var o=b(A,k,{nodes:[n]},false);return!!d(o,"readOnly",k,n,v||k,s);};};a.getAttributeChangeableStaticFormatter=function(A,n,s){return function(k,v){var o=b(A,k,{nodes:[n]},false);return!!d(o,"changeable",k,n,v||k,s);};};a.getActionEnabledStaticFormatter=function(A,s,o){var r;var R;var f=typeof o==="function"?o:undefined;return function(k,n){if(f){if(!k){return false;}o=f(k,n||k);}var C=JSON.stringify({key:k,parameter:o});if(R===C&&r!==undefined){return r;}R=C;var g=null;if(o){g={};g[s]=o;}else{g=s;}var h=b(A,k,{actions:[g]},false);r=!!d(h,"enabled",k,undefined,undefined,undefined,s);return r;};};a.getStaticActionEnabledStaticFormatter=function(A,s,o){var r;var R;var f=typeof o==="function"?o:undefined;return function(k,n){if(f){if(!k){return false;}o=f(k,n||k);}var C=JSON.stringify({parameter:o});if(R===C&&r!==undefined){return r;}R=C;var S={};S[s]=o;var g=b(A,undefined,{staticActions:[S]},false);r=!!d(g,"enabled",undefined,undefined,undefined,undefined,s);return r;};};a.getStaticActionEnabledDynamicFormatter=function(A,s,o){var f=typeof o==="function"?o:undefined;return function(k,n){var r;if(f){if(!k){return false;}o=f(k,n||k);}var S={};S[s]=o;var g=b(A,undefined,{staticActions:[S]},false);r=!!d(g,"enabled",undefined,undefined,undefined,undefined,s);return r;};};a.getCacheModel=function(){return p;};a.getCachedProperties=function(A){if(!A){return p.getData();}else{return p.getProperty("/"+A);}};a.invalidateCachedProperties=function(A,k){if(!k){if(A){var D=p.getData();delete D[A];p.setData(D);}else{p.setData({});}}else{var o=p.getProperty("/"+A);if(o){if(jQuery.isArray(k)){jQuery.each(k,function(i,v){delete o[v];});}else{delete o[k];}p.setProperty("/"+A,o);}}p.fireEvent("modelCacheInvalidated",{applicationObjectName:A,key:k});};a.refresh=function(){a.invalidateCachedProperties();};a.setMetaModel=function(m){M=m;};return a;});
