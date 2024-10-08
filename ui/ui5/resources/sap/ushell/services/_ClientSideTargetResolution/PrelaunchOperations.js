// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/Log","sap/ui/generic/app/navigation/service/SelectionVariant","sap/ushell/services/_ClientSideTargetResolution/Utils","sap/ushell/utils/clone"],function(L,S,c,C){"use strict";var a="sap.ushell.services.ClientSideTargetResolution.PrelaunchOperations";function _(A){if(!A){return Promise.resolve(null);}return new Promise(function(r,R){sap.ushell.Container.getService("AppState").getAppState(A).done(function(i){r(i);}).fail(function(E){R(E);});});}function b(P,M,s,i,D){if(P.startupParametersModified){M.mappedIntentParamsPlusSimpleDefaults=i;}if(P.defaultedParameterNamesModified){M.mappedDefaultedParamNames=D;}if(P.selectionVariantModified){var A=sap.ushell.Container.getService("AppState");var N=A.createEmptyAppState(undefined,true);N.setData({selectionVariant:s.toJSONObject()});return new Promise(function(r,R){N.save().done(function(){M.mappedIntentParamsPlusSimpleDefaults["sap-xapp-state"]=[N.getKey()];r(M);}).fail(function(t){R(t);});});}return Promise.resolve(M);}function d(O){var s=O.type;switch(s){case"merge":case"split":return s+" - source: "+O.source+" & target: "+O.target;case"delete":return s+" - target: "+O.target;default:return"";}}function e(P,s){if(s.getSelectOption(P)){return s.getSelectOption(P)[0].Low;}return undefined;}function f(P,s){if(s.getSelectOption(P)){return s.getSelectOption(P)[0].High;}return undefined;}function g(P,s){if(s[P]){return s[P][0];}return undefined;}function h(O,s,i){var r=O.source[0],t=O.source[1],u=e(r,s),v=e(t,s),w=g(r,i),x=g(t,i),y,z,T=O.target;function A(V,B){if(B===undefined||V===B){return V;}return undefined;}if(u&&v){y=A(u,w);z=A(v,x);}else if(w&&x){y=A(w,u);z=A(x,v);}if(y&&z&&!s.getSelectOption(T)&&!i.hasOwnProperty(T)){s.addSelectOption(T,"I","BT",y,z);return{selectionVariantModified:true,startupParametersModified:false,defaultedParameterNamesModified:false};}return{};}function j(O,s,i){var t=O.target,r=O.source;if(!s.getSelectOption(r)){L.error("Invalid split operation: "+r+" does not exist in selection variant");return false;}if(s.getSelectOption(t[0])){L.error("Invalid split operation: "+t[0]+" already exists in selection variant");return false;}if(s.getSelectOption(t[1])){L.error("Invalid split operation: "+t[1]+" already exists in selection variant");return false;}if(i[t[0]]){L.error("Invalid split operation: "+t[0]+" already exists in startup parameters");return false;}if(i[t[1]]){L.error("Invalid split operation: "+t[1]+" already exists in startup parameters");return false;}return true;}function k(O,s,i){var t=O.target,r=O.source,u=j(O,s,i);if(u){var v=e(r,s),w=f(r,s);s.addSelectOption(t[0],"I","EQ",v,null);i[t[0]]=[v];s.addSelectOption(t[1],"I","EQ",w||v,null);i[t[1]]=[w||v];return{selectionVariantModified:true,startupParametersModified:true,defaultedParameterNamesModified:false};}return{};}function l(O,s,r,D){var t=O.target,u={selectionVariantModified:false,startupParametersModified:false,defaultedParameterNamesModified:false};for(var i=0;i<t.length;i++){var T=t[i];if(T==="sap-xapp-state"){L.warning("Cannot execute delete: 'sap-xapp-state' is not allowed to be deleted");continue;}if(s.getParameter(T)){s.removeParameter(T);u.selectionVariantModified=true;}if(s.getSelectOption(T)){s.removeSelectOption(T);u.selectionVariantModified=true;}if(r[T]){delete r[T];u.startupParametersModified=true;}var v=D.indexOf(T);if(v>-1){D.splice(v,1);u.defaultedParameterNamesModified=true;}}return u;}function m(P){var i;if(P===""){return[];}try{i=JSON.parse(P);}catch(r){L.error("Cannot parse operation array: sap-prelaunch-operations should be in json format.");return[];}if(!Array.isArray(i)){L.error("Invalid operation array: sap-prelaunch-operations should be an array.");return[];}return i;}function n(P){if(P.length===0){return null;}var v={"split":true,"merge":true,"delete":true};var i=P.filter(function(O){return!v[O.type];});if(i.length>0){L.error("Invalid operation: the following sap-prelaunch-operations are invalid: "+i.join(", "));return null;}var s=P.some(function(O){return O.type==="split"&&O.target[0]===O.target[1];});if(s){L.error("Invalid operation: split operation contains the same target value. Use two different target values instead.");return null;}var I=P.some(function(O){if(O.type==="split"){return!O.hasOwnProperty("source")||!O.hasOwnProperty("target")||typeof O.source!=="string"||!Array.isArray(O.target)||Object.keys(O).length!==3||Object.keys(O.target).length!==2;}if(O.type==="merge"){return!O.hasOwnProperty("source")||!O.hasOwnProperty("target")||typeof O.target!=="string"||!Array.isArray(O.source)||Object.keys(O).length!==3||Object.keys(O.source).length!==2;}if(O.type==="delete"){return!O.hasOwnProperty("target")||!Array.isArray(O.target)||Object.keys(O).length!==2;}});if(I){L.error("Invalid operation: one or more operations are specified in an incorrect format.");return null;}return P;}function p(P){var i=m(P);return n(i);}function o(s,P,i,D){var r=c.isDebugEnabled()?[]:null,t={selectionVariantModified:false,startupParametersModified:false};P.forEach(function(O){var E={};switch(O.type){case"split":E=k(O,s,i);break;case"merge":E=h(O,s,i);break;case"delete":E=l(O,s,i,D);break;default:L.error("Invalid operation: "+O.type+" prelaunch operation type is not supported");}if(r){var I=Object.keys(E).length!==0?"\u2705":"\u274c";r.push(I+" "+d(O));}if(Object.keys(E).length===0){L.warning("Cannot execute "+d(O));}t.selectionVariantModified=t.selectionVariantModified||E.selectionVariantModified;t.startupParametersModified=t.startupParametersModified||E.startupParametersModified;t.defaultedParameterNamesModified=t.defaultedParameterNamesModified||E.defaultedParameterNamesModified;});if(r){L.debug(a+"\n"+r.join("\n"));}return t;}function q(M,P){if(!P){return Promise.resolve(M);}var s=M.mappedIntentParamsPlusSimpleDefaults,D=M.mappedDefaultedParamNames,i=s["sap-xapp-state"]&&s["sap-xapp-state"][0],r=p(P);if(!r||r.length===0){return Promise.resolve(M);}return _(i).then(function(A){var t=A?A.getData():{},u=C(s),v=C(D),w;if(t.selectionVariant){w=new S(JSON.stringify(t.selectionVariant));}else{w=new S();}var x=o(w,r,u,v);return b(x,M,w,u,v);});}return{executePrelaunchOperations:q,parseAndValidateOperations:p};});
