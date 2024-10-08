/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/apf/core/utils/checkForTimeout","sap/ui/model/odata/ODataUtils"],function(c,O){"use strict";sap.apf.core.odataRequestWrapper=function(i,r,s,e,b){var d=i.instances.datajs;function a(k,n){var M=sap.apf.core.utils.checkForTimeout(n);var E={};if(M){E.messageObject=M;e(E);}else{s(k,n);}}function f(E){var M=sap.apf.core.utils.checkForTimeout(E);if(M){E.messageObject=M;}e(E);}var m=r.serviceMetadata;var g=i.functions.getSapSystem();if(g&&!r.isSemanticObjectRequest){var h=/(\/[^\/]+)$/g;if(r.requestUri&&r.requestUri[r.requestUri.length-1]==='/'){r.requestUri=r.requestUri.substring(0,r.requestUri.length-1);}var l=r.requestUri.match(h)[0];var j=r.requestUri.split(l);var t=sap.ui.model.odata.ODataUtils.setOrigin(j[0],{force:true,alias:g});r.requestUri=t+l;}d.request(r,a,f,b,undefined,m);};});
