/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2018 SAP SE. All rights reserved
 */
sap.ui.define(['sap/apf/utils/proxyTextHandlerForLocalTexts','sap/apf/cloudFoundry/utils'],function(P,c){'use strict';function M(s,a){var b=a.instances.messageHandler;var d=a.manifests.manifest;var e=d["sap.app"].dataSources;var f=e&&e["apf.designTime.customer.applications"]&&e["apf.designTime.customer.applications"].uri;var g=e&&e["apf.designTime.customer.analyticalConfigurations"]&&e["apf.designTime.customer.analyticalConfigurations"].uri;var h=e&&e["apf.designTime.customer.applicationAndAnalyticalConfiguration"]&&e["apf.designTime.customer.applicationAndAnalyticalConfiguration"].uri;var t=e&&e["apf.designTime.textFileAndAnalyticalConfigurations"]&&e["apf.designTime.textFileAndAnalyticalConfigurations"].uri;var j=e&&e["apf.designTime.textFiles"]&&e["apf.designTime.textFiles"].uri;var v=e&&e["apf.designTime.vendor.importToCustomerLayer"]&&e["apf.designTime.vendor.importToCustomerLayer"].uri;var k=e&&e["apf.designTime.vendor.analyticalConfigurations"]&&e["apf.designTime.vendor.analyticalConfigurations"].uri;var p=a.instances.proxyTextHandlerForLocalTexts;var r=c.resolveUri.bind(this,a.instances.coreApi);function l(){return{};}function n(i){var L=JSON.parse(i.SerializedAnalyticalConfiguration);delete i.SerializedAnalyticalConfiguration;L.configHeader=i;i.SerializedAnalyticalConfiguration=JSON.stringify(L);return i;}this.create=function(i,L,N){if(i==='application'){o(L,N);}else if(i==='configuration'&&L.CreationUTCDateTime&&L.LastChangeUTCDateTime){L=n(L);var O=L.AnalyticalConfiguration;K({type:"HEAD",url:r(g+"/"+O),success:function(){var Q=b.createMessageObject({code:"5238",aParams:[O]});N(undefined,undefined,Q);},error:function(Q,R,S,T){if(Q.status===404){C(L,function(V,U){N(L,V,U);});}else{var U=F(Q,T,b);N(undefined,undefined,U);}}});}else if(i==='configuration'){L=n(L);q(L,N);}else if(i==='texts'){u(L,N);}else{b.check(false,'The create operation on entity set '+i+' is currently not supported by the modeler proxy.');}};function o(i,L){var N={applicationName:i.ApplicationName,textFile:{inDevelopmentLanguage:""}};var O="POST";var Q=r(f);if(i.Application){O="PUT";Q=Q+'/'+i.Application;}K({type:O,url:Q,data:JSON.stringify(N),dataType:"json",success:function(R,S,T){if(O==='POST'&&R&&!jQuery.isEmptyObject(R)){var U={ApplicationName:i.ApplicationName,Application:R.application};L(U,l(),undefined);}else if(O==='PUT'){var U={ApplicationName:i.ApplicationName,Application:i.Application};L(U,l(),undefined);}else{var V=c.buildErrorMessage(T,"5227",[],undefined,b);L(undefined,l(),V);}},error:function(R,S,T,U){var V=c.buildErrorMessage(R,"5227",[],U,b);L(undefined,l(),V);},async:true});}function q(i,L){var N=i.Application;var O={analyticalConfigurationName:i.AnalyticalConfigurationName,application:N,serializedAnalyticalConfiguration:i.SerializedAnalyticalConfiguration,textFile:{inDevelopmentLanguage:p.createTextFileOfApplication(N)}};K({type:"POST",url:r(g),data:JSON.stringify(O),dataType:"json",success:function(Q,S,R){if(Q&&!jQuery.isEmptyObject(Q)){var T={AnalyticalConfiguration:Q.analyticalConfiguration,AnalyticalConfigurationName:O.analyticalConfigurationName};L(T,l(),undefined);}else{var U=c.buildErrorMessage(R,"5226",[N],undefined,b);L(undefined,l(),U);}},error:function(Q,S,R,T){var U=c.buildErrorMessage(Q,"5226",[N],T,b);L(undefined,l(),U);},async:true});}function u(i,L){var N=p.addText(i);i.TextElement=N;L(i,l());}this.readCollection=function(i,L,N,O,Q){if(i==='application'){w(L);}else if(i==='configuration'){x(L,Q);}else if(i==='texts'){L([],undefined);}else{b.check(false,'The read collection operation on entity set '+i+' is currently not supported by the modeler proxy.');}};function w(i){var L=r(f+"?$select=Application,ApplicationName");K({type:"GET",url:L,success:function(N,S,O){if(N&&!jQuery.isEmptyObject(N)){var Q=[];if(N.applications!==null){N.applications.forEach(function(T){Q.push({Application:T.application,ApplicationName:T.applicationName,SemanticObject:""});});}i(Q,l(),undefined);}else{var R=c.buildErrorMessage(O,"5229",[],undefined,b);i(undefined,l(),R);}},error:function(N,S,O,Q){var R=c.buildErrorMessage(N,"5229",[],Q,b);i(undefined,l(),R);},async:true});}function x(i,L){var T=L.getFilterTermsForProperty('Application');var N=T[0].getValue();var O=r(t+"?$select=AnalyticalConfiguration,AnalyticalConfigurationName,SerializedAnalyticalConfiguration&$filter="+L.toUrlParam());K({type:"GET",url:O,success:function(Q,S,R){if(Q&&!jQuery.isEmptyObject(Q)){var U=[];if(Q.analyticalConfigurations!==null){Q.analyticalConfigurations.forEach(function(W){U.push({AnalyticalConfiguration:W.analyticalConfiguration,Application:N,AnalyticalConfigurationName:W.analyticalConfigurationName,SerializedAnalyticalConfiguration:W.serializedAnalyticalConfiguration});});}p.initApplicationTexts(N,Q.textFile.inDevelopmentLanguage);i(U,l(),undefined);}else{var V=c.buildErrorMessage(R,"5223",[N],undefined,b);i(undefined,l(),V);}},error:function(Q,S,R,U){var V=c.buildErrorMessage(Q,"5223",[N],U,b);i(undefined,l(),V);},async:true});}this.readEntity=function(i,L,N,O,Q){if(i==='configuration'){var R=N[0].value;if(O&&O.length===2&&jQuery.inArray("CreationUTCDateTime",O)>-1&&jQuery.inArray("LastChangeUTCDateTime",O)>-1){y(R,Q,L);}else{z(R,Q,L);}}else{b.check(false,'The read single entity operation on entity set '+i+' is currently not supported by the modeler proxy.');}};function y(i,L,N){var O=r(g+"/"+i+"?$select=Application,CreationUtcDateTime,LastChangeUtcDateTime,ServiceInstance");K({type:"GET",url:O,success:function(Q,S,R){if(Q&&!jQuery.isEmptyObject(Q)){var T={CreationUTCDateTime:Q.analyticalConfiguration.creationUtcDateTime,LastChangeUTCDateTime:Q.analyticalConfiguration.lastChangeUtcDateTime};N(T,l());}else{var U=c.buildErrorMessage(R,"5221",[L,i],undefined,b);N(undefined,l(),U);}},error:function(Q,S,R,T){var U=c.buildErrorMessage(Q,"5221",[L,i],T,b);N(undefined,l(),U);},async:true});}function z(i,L,N){var O=r(g+"/"+i+"?$select=AnalyticalConfigurationName,SerializedAnalyticalConfiguration");K({type:"GET",url:O,success:function(Q,S,R){if(Q&&!jQuery.isEmptyObject(Q)){var T={Application:L,SerializedAnalyticalConfiguration:Q.analyticalConfiguration.serializedAnalyticalConfiguration,AnalyticalConfiguration:i};N(T,l(),undefined);}else{var U=c.buildErrorMessage(R,"5221",[L,i],undefined,b);N(undefined,l(),U);}},error:function(Q,S,R,T){var U=c.buildErrorMessage(Q,"5221",[L,i],T,b);N(undefined,l(),U);},async:true});}this.update=function(i,L,N,O){if(i==='application'){var Q=O[0].value;A(L,Q,N);}else if(i==='configuration'&&L.CreationUTCDateTime&&L.LastChangeUTCDateTime){L=n(L);C(L,N);}else if(i==='configuration'){L=n(L);B(L,N);}else{b.check(false,'The update operation on entity set '+i+' is currently not supported by the modeler proxy.');}};function A(i,L,N){var O={applicationName:i.ApplicationName};var Q=r(f+'/'+L);K({type:"PUT",url:Q,data:JSON.stringify(O),dataType:"json",success:function(R,S,T){N(l(),undefined);},error:function(R,S,T,U){var V=c.buildErrorMessage(R,"5228",[L],U,b);N(l(),V);},async:true});}function B(i,L){var N=JSON.parse(i.SerializedAnalyticalConfiguration);var O=i.AnalyticalConfiguration;var Q=r(g+'/'+O);var R=i.Application;N.configHeader={Application:R,AnalyticalConfiguration:O,AnalyticalConfigurationName:i.AnalyticalConfigurationName,CreationUTCDateTime:i.CreationUTCDateTime,LastChangeUTCDateTime:i.LastChangeUTCDateTime};var S={analyticalConfigurationName:i.AnalyticalConfigurationName,serializedAnalyticalConfiguration:JSON.stringify(N),textFile:{inDevelopmentLanguage:p.createTextFileOfApplication(R)}};K({type:"PUT",url:Q,data:JSON.stringify(S),dataType:"json",success:function(T,U,V){L(l(),undefined);},error:function(T,U,V,W){var X=c.buildErrorMessage(T,"5233",[R,O],W,b);L(l(),X);},async:true});}function C(i,L){var N=JSON.parse(i.SerializedAnalyticalConfiguration);var O=N.configHeader.AnalyticalConfiguration;var Q=r(h+'/'+O);var R=i.Application;var S={analyticalConfigurationName:i.AnalyticalConfigurationName,application:R,serializedAnalyticalConfiguration:i.SerializedAnalyticalConfiguration};K({type:"PUT",url:Q,data:JSON.stringify(S),dataType:"json",success:function(T,U,V){L(l(),undefined);},error:function(T,U,V,W){var X=c.buildErrorMessage(T,"5233",[R,O],W,b);L(l(),X);},async:true});}this.remove=function(i,L,N,O,Q,R){if(i==='application'){var S=L[0].value;D(S,N);}else if(i==='configuration'){var T=L[0].value;E(T,Q,N);}else{b.check(false,'The delete operation on entity set '+i+' is currently not supported by the modeler proxy.');}};function D(i,L){var N=r(f+'/'+i);K({type:"DELETE",url:N,success:function(O,S,Q){L(l(),undefined);},error:function(O,S,Q,R){var T=c.buildErrorMessage(O,"5237",[i],R,b);L(l(),T);},async:true});}function E(i,L,N){var O=r(g+'/'+i);K({type:"DELETE",url:O,success:function(Q,S,R){N(l(),undefined);},error:function(Q,S,R,T){var U=c.buildErrorMessage(Q,"5225",[L,i],T,b);N(l(),U);},async:true});}this.doChangeOperationsInBatch=function(i,L,N,O){i.forEach(function(Q){if(Q.entitySetName!=='texts'){b.check(false,'The create/update/delete operation in batch on entity set '+Q.entitySetName+' is not supported by the modeler proxy.');}Q.application=N;});this._readConfigurationListAndTextFile(N).then(function(Q){var R=Q.textFile.inDevelopmentLanguage;this._initText(N,R);this._applyChangesOnTextFile(i);var S=this._createTextFileOfApplication(N);this._updateRemoteTextFile(N,'DEV',S,O).then(function(){L(undefined);},function(T){L(T);});}.bind(this),function(Q){L(Q);});};this._readConfigurationListAndTextFile=function(i){var L="'";var N=new Promise(function(O,Q){var R=r(t+'?$select=AnalyticalConfiguration,AnalyticalConfigurationName,SerializedAnalyticalConfiguration'+'&$filter=(Application%20eq%20'+L+i+L+')');K({type:"GET",url:R,success:function(S,T,U){var V=[];if(S.analyticalConfigurations!==null){S.analyticalConfigurations.forEach(function(X){V.push({analyticalConfiguration:X.analyticalConfiguration,analyticalConfigurationName:X.analyticalConfigurationName,serializedAnalyticalConfiguration:X.serializedAnalyticalConfiguration});});}var W={analyticalConfigurations:V,textFile:{inDevelopmentLanguage:S.textFile.inDevelopmentLanguage}};O(W);},error:function(S,T,U,V){var W=c.buildErrorMessage(S,"5222",[i],V,b);Q(W);},async:true});});return N;};this._initText=function(i,L){p.initApplicationTexts(i,L);};this._applyChangesOnTextFile=function(i){i.forEach(function(L){if(L.entitySetName==='texts'){switch(L.method){case"POST":var N=L.data;this._createOrUpdateLocalText(N);break;case"PUT":var O=L.data;this._createOrUpdateLocalText(O);break;case"DELETE":var Q=L.application;var R=L.inputParameters[0].value;this._deleteLocalText(Q,R);break;default:b.check(false,'The method '+L.method+' is not supported during text processing in batch mode by the modeler proxy.');break;}}else{b.check(false,'The create/update/delete operation on entity set '+L.entitySetName+' is not supported by the modeler proxy.');}}.bind(this));};this._createTextFileOfApplication=function(i){return p.createTextFileOfApplication(i);};this._createOrUpdateLocalText=function(i){p.addText(i);};this._deleteLocalText=function(i,L){var N={application:i,inputParameters:[{value:L}]};p.removeText(N);};this._updateRemoteTextFile=function(i,L,N,O){var Q=new Promise(function(R,S){var T;if(O===true){T=r(j+'/'+i);}else{T=r(j+'/'+i+'/'+L);}var U={serializedTextFile:N};K({type:"PUT",data:JSON.stringify(U),url:T,success:function(V,W,X){R();},error:function(V,W,X,Y){var Z=c.buildErrorMessage(V,"5230",[i],Y,b);S(Z);},async:true});});return Q;};this.readCollectionsInBatch=function(i,L){var N=i[0];b.check(N.entitySetName==='configuration',"wrong usage, only 'configuration' is allowed");var T=N.filter.getFilterTermsForProperty('Application');var O=T[0].getValue();function Q(){function R(S,U,V){if(V){L(undefined,V);}else{var W=[];W.push(S);W.push(p.getTextElements(O));L(W);}}return R;}this.readCollection(N.entitySetName,Q(),N.inputParameters,N.selectList,N.filter);};function F(i,L,b){var N=b.createMessageObject({code:"5214",aParameters:[i.status,i.statusText]});if(L){N.setPrevious(L);}return N;}this.importVendorContent=function(i,L,N,O,Q){this.readAllConfigurationsFromVendorLayer().done(function(R){G(i,L,N,O,Q,R);}).fail(function(R){O(undefined,undefined,R);});};function G(L,N,O,Q,R,S){var i;var T,U;var V=L+"."+N;for(i=0;i<S.length;i++){if(S[i].value===V){U=S[i].configurationText;T=S[i].applicationText;break;}}K({type:"HEAD",url:r(g+"/"+N),success:function(){O(X,Y,U);},error:function(Z,$,_,a1){if(Z.status===404){I(N,W);}else{var b1=F(Z,a1,b);Q(undefined,undefined,b1);}}});function W(Z,$,_){if(!_){R(L,T);}Q(Z,$,_);}function X(){I(N,Q);}function Y(Z){var $=r(k+"/"+N+"?$select=SerializedAnalyticalConfiguration");K({type:"GET",url:$,success:function(_){H(L,Z,_.serializedAnalyticalConfiguration,Q);},error:function(_,a1,b1,c1){var d1=F(_,c1,b);Q(undefined,undefined,d1);}});}}function H(i,L,N,O){var Q=r(g);var R={analyticalConfigurationName:L,application:i,serializedAnalyticalConfiguration:N};K({type:"POST",url:Q,dataType:"json",data:JSON.stringify(R),success:function(R){O(R.analyticalConfiguration);},error:function(S,T,U,V){var W=F(S,V,b);O(undefined,undefined,W);}});}function I(i,L){K({type:"PUT",url:r(v+"/"+i),contentType:'application/x-www-form-urlencoded',success:function(){L(i);},error:function(N,O,Q,R){var S=F(N,R,b);L(undefined,undefined,S);}});}var J;this.readAllConfigurationsFromVendorLayer=function(){var i=jQuery.Deferred();if(J){i.resolve(J);}else{K({url:r(k+"?$select=Application,ApplicationName,AnalyticalConfiguration,AnalyticalConfigurationName"),success:function(L){var N=[];if(L!==null){L.forEach(function(O){N.push({configurationText:O.analyticalConfigurationName,applicationText:O.applicationName,value:O.application+'.'+O.analyticalConfiguration});});}J=N;i.resolve(N);},error:function(L,N,O,Q){var R=F(L,Q,b);var S=b.createMessageObject({code:'5231'});S.setPrevious(R);i.reject(S);}});}return i.promise();};function K(S){return a.instances.ajaxHandler.send(S);}}var m={ModelerProxy:M};return m;},true);
