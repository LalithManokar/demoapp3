/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
(function(){"use strict";if(typeof QUnit==="undefined"){throw new Error("qunit-junit.js: QUnit is not loaded yet!");}var l=!(parseFloat(QUnit.version)>=2.0);var t=document.location.pathname.substr(1).replace(/\./g,"_").replace(/\//g,".")+document.location.search.replace(/\./g,'_');function f(n){return String(n||'default').replace(/\./g,"_");}QUnit.config.callbacks.begin.unshift(function(){var q=document.querySelector("#qunit");var a=document.querySelectorAll('#qunit-header,#qunit-banner,#qunit-userAgent,#qunit-testrunner-toolbar,#qunit-tests');var c=document.querySelector("#qunit-fixture");if(q==null&&a.length>0){q=document.createElement('DIV');q.id='qunit';a[0].parentNode.insertBefore(q,a[0]);for(var i=0;i<a.length;i++){q.appendChild(a[i]);}}if(c==null&&q){c=document.createElement('DIV');c.id='qunit-fixture';q.parentNode.insertBefore(c,q.nextSibling);}});if(l){QUnit.equals=window.equals=window.equal;QUnit.raises=window.raises=window["throws"];}QUnit.moduleStart(function(D){D.name=t+"."+f(D.name);});QUnit.testStart(function(D){D.module=t+"."+f(D.module);if(l){window.assert=QUnit.config.current.assert;}});if(l){QUnit.testDone(function(a){try{delete window.assert;}catch(e){if(!window._$cleanupFailed){QUnit.test("A script loaded via script tag defines a global assert function!",function(a){a.ok(QUnit.config.ignoreCleanupFailure,e);});window._$cleanupFailed=true;}}});}if(!QUnit.jUnitDone){var d=document.location.href.replace(/\?.*|#.*/g,""),s=document.getElementsByTagName("script"),b=null,F=null,r;for(var i=0;i<s.length;i++){var S=s[i].getAttribute("src");if(S){var B=S.match(/(.*)qunit\/qunit-junit\.js$/i);if(B&&B.length>1){b=B[1];break;}}}if(b===null){if(typeof sap==='object'&&sap.ui&&sap.ui.require&&sap.ui.require.toUrl){F=sap.ui.require.toUrl("sap/ui/thirdparty/qunit-reporter-junit.js");}else if(typeof jQuery!=='undefined'&&jQuery.sap&&jQuery.sap.getResourcePath){F=jQuery.sap.getResourcePath("sap/ui/thirdparty/qunit-reporter-junit",".js");}else{throw new Error("qunit-junit.js: The script tag seems to be malformed!");}}else{F=b+"thirdparty/qunit-reporter-junit.js";}r=new XMLHttpRequest();r.open('GET',F,false);r.onreadystatechange=function(){if(r.readyState==4){var a=r.responseText;if(typeof URI!=="undefined"){a+="\n//# sourceURL="+URI(F).absoluteTo(d);}window.eval(a);}};r.send(null);}QUnit.jUnitDone(function(D){window._$jUnitReport.results=D.results;window._$jUnitReport.xml=D.xml;});QUnit.log(function(D){window._$jUnitReport.tests=window._$jUnitReport.tests||[];var T=String(D.message)||(D.result?"okay":"failed");if(!D.result){if(D.expected!==undefined){T+="\nExpected: "+D.expected;}if(D.actual!==undefined){T+="\nResult: "+D.actual;}if(D.expected!==undefined&&D.actual!==undefined){T+="\nDiff: "+D.expected+" != "+D.actual;}if(D.source){T+="\nSource: "+D.source;}}window._$jUnitReport.tests.push({module:D.module,name:D.name,text:T,pass:D.result});});window._$jUnitReport={};})();
