/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["sap/ui/model/json/JSONModel","sap/ino/commons/models/aof/MetaModel","sap/ino/commons/models/aof/ApplicationObject","sap/ino/commons/models/aof/ApplicationObjectChange","sap/ino/commons/application/Configuration","sap/ui/model/BindingMode","sap/ui/model/json/JSONListBinding","sap/ui/model/odata/ODataModel","sap/ui/model/resource/ResourceModel"],function(J,M,A,a,C,B,b,O,R){"use strict";jQuery.sap.declare("sap.ino.commons.models.core.CodeModel");var c=A.ObjectType;sap.ino.commons.models.core.CodeModel=new J({});var d=sap.ino.commons.models.core.CodeModel;d.sDefaultBindingMode=B.OneWay;d.mSupportedBindingModes={"OneWay":true,"OneTime":true,"TwoWay":false};a.attachChange(undefined,function(E){var z=E.getParameter("object").getApplicationObjectMetadata();if(z.type===c.Stage){var F=z.name.substring(0,z.name.length-5);d.refresh(F);}});var V="sap.ino.xs.object.basis.ValueOptionList.Root_";var e="sap.ino.xs.object.basis.ValueOptionList.ValueOptions";var f="sap.ino.xs.object.basis.ValueOptionList.Root";var D="INTEGER";var g="NUMERIC";var h="BOOLEAN";var i="TEXT";var _=null;function j(){if(_===null){_=new O(C.getFullApplicationPath("sap.ino.config.URL_PATH_OD_CONFIGURATION"),true);}return _;}function k(z){return jQuery.sap.startsWith(z,V);}function l(z){var P=z.split(V,2);if(P.length===2){return P[1];}else{return null;}}function m(z,E){if(z.TEXT>E.TEXT){return 1;}if(z.TEXT<E.TEXT){return-1;}return 0;}function n(z,E){if(z.TEXT>E.TEXT){return-1;}if(z.TEXT<E.TEXT){return 1;}return 0;}function o(z){return function(E,F){if(z==="NUM_VALUE"){E[z]=parseFloat(E[z]);F[z]=parseFloat(F[z]);}if(E[z]>F[z]){return 1;}if(E[z]<F[z]){return-1;}return 0;};}function p(z){return function(E,F){if(E[z]<F[z]){return-1;}else{return 1;}};}function q(z){var E=j();var P=z;if(k(z)){var F=l(z);var G=r(e,function(N){return N.LIST_CODE===F;});var H=r(f,F);var I="";switch(H.DATATYPE_CODE){case D:case g:I="NUM_VALUE";break;case h:I="BOOL_VALUE";break;case i:I="NUM_VALUE";break;default:break;}G.sort(p("SEQUENCE_NO"));var K=jQuery.map(G,function(N){var Q=jQuery.extend({},N);switch(H.DATATYPE_CODE){case D:Q.NUM_VALUE=parseInt(Q.NUM_VALUE,10);Q.CODE=Q.NUM_VALUE;break;case g:Q.NUM_VALUE=parseFloat(Q.NUM_VALUE);Q.CODE=Q.NUM_VALUE;break;case h:Q.CODE=Q.BOOL_VALUE;break;case i:Q.CODE=Q.TEXT_VALUE;break;default:break;}return Q;});return K;}var L=[];E.read(P,null,null,false,function(N){if(N&&N.results&&N.results.length>0){jQuery.each(N.results,function(Q,S){S=jQuery.extend({},S);delete S.__metadata;S.TEXT=s(z,S.CODE);if(S.DEFAULT_TEXT&&(S.TEXT===null||!S.TEXT)){S.TEXT=S.DEFAULT_TEXT;}if(["sap.ino.xs.object.iam.IdentityLogSetting.Root"].indexOf(z)===-1){S.LONG_TEXT=t(z,S.CODE);}if(S.LONG_TEXT===null){if(S.DEFAULT_LONG_TEXT){S.LONG_TEXT=S.DEFAULT_LONG_TEXT;}else{S.LONG_TEXT=S.TEXT;}}L.push(S);});}});if(P!=="sap.ino.xs.object.basis.ValueOptionList.ValueOptions"){return L.sort(m);}else{return L.sort(p("SEQUENCE_NO"));}}function r(z,E,P){var F=d.getProperty("/"+z);var G;if(P){G=d.getProperty("/"+JSON.stringify(P)+"/"+z);}if(F===null||F===undefined){F=q(z);d.setProperty("/"+z,F);}if(P&&G){F=G;}if(P&&!G){if(P.includeEmptyCode===true){var H={CODE:"",TEXT:"",LONG_TEXT:""};G=[H].concat(F);}else{G=F;}F=G;var I=d.getProperty("/"+JSON.stringify(P))||{};I[z]=G;d.setProperty("/"+JSON.stringify(P),I);}if(E===undefined||E===""){return F;}var K=E;if(!jQuery.isFunction(K)){K=function(N){return(N.CODE===E);};}if(K&&jQuery.isFunction(K)){var L=jQuery.grep(F,K);if(!jQuery.isFunction(E)){return L[0];}else{return L;}}return F;}function s(z,E){var T;if(v(z)){T=v(z).getProperty(E);}if(T===E){return null;}else{return T;}}function t(z,E){var L=E+"_LONG";var T;if(v(z)){T=v(z).getProperty(L);}if(T===L){return null;}else{return T;}}var u={};function v(z){if(u[z]){return u[z];}var N=z.split(".");var E=N.pop();var F=N.join(".");var G=M.getApplicationObjectMetadata(F);if(!G){throw Error("Please provide valid fully qualified AOF object node reference");}var H;if(G.nodes[E].customProperties&&G.nodes[E].customProperties.codeTextBundle){H=new sap.ui.model.resource.ResourceModel({bundleUrl:w(G.nodes[E].customProperties.codeTextBundle)});}u[z]=H;return H;}function w(z){if(z.indexOf("::")>-1){var P=arguments[0].split("::");z=P[1];}return C.getResourceBundleURL(z);}function x(T,z){if(z){return function(E){return T(z,E);};}else{return function(z,E){return T(z,E);};}}function y(z,E,T){if(E===null||E===undefined){return"";}var F=r(z,E);if(!F){return E;}return F[T];}d.bindList=function(P,z,S,F,E){var G=P.substring(1,P.length);if(!z&&P!="/"){d.getCodes(G,undefined,E);}if(E){P="/"+JSON.stringify(E)+"/"+G;}var H=new b(this,P,z,S,F,E);return H;};d.getCodes=function(z,F,P){return r(z,F,P);};d.getText=function(z,E){return y(z,E,"TEXT");};d.getLongText=function(z,E){return y(z,E,"LONG_TEXT");};d.getFormatter=function(z){return x(d.getText,z);};d.getLongTextFormatter=function(z){return x(d.getLongText,z);};d.getConfigObjectNodeForValueOptionList=function(z){return V+z;};d.refresh=function(z){if(!z){d.setData({});return;}var P=[];jQuery.each(d.getData(),function(E,F){if(E.lastIndexOf(z)!=-1){P.push("/"+E);return;}if(jQuery.isPlainObject(F)){jQuery.each(F,function(G){if(G.lastIndexOf(z)!=-1){P.push("/"+E+"/"+G);}});}});jQuery.each(P,function(I,E){d.setProperty(E,null);});};return sap.ino.commons.models.core.CodeModel;});
