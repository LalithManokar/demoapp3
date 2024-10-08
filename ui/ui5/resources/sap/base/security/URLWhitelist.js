/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/assert"],function(a){"use strict";var u={};function U(p,h,c,d){if(p){this.protocol=p.toUpperCase();}if(h){this.host=h.toUpperCase();}this.port=c;this.path=d;}var w=[];u.clear=function(){w.splice(0,w.length);};u.add=function(p,h,c,d){var e=new U(p,h,c,d);var i=w.length;w[i]=e;};u.delete=function(e){w.splice(w.indexOf(e),1);};u.entries=function(){return w.slice();};var r=/[\u0009\u000A\u000D]/;var b=/^((?:ftp|https?|wss?):)([\s\S]+)$/;u.validate=function(s){if(typeof s==="string"){if(r.test(s)){return false;}}var c=b.exec(s);if(c&&!/^[\/\\]{2}/.test(c[2])){s=c[1]+"//"+c[2];}c=/^(?:([^:\/?#]+):)?((?:[\/\\]{2,}((?:\[[^\]]+\]|[^\/?#:]+))(?::([0-9]+))?)?([^?#]*))(?:\?([^#]*))?(?:#(.*))?$/.exec(s);if(!c){return false;}var p=c[1],B=c[2],h=c[3],P=c[4],d=c[5],q=c[6],H=c[7];var e=/^([a-z0-9-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*$/i;var f=/^([a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9a-f]{2})*$/i;var g=f;var j=/^([a-z0-9!$'*+:^_`{|}~-]|%[0-9a-f]{2})+(?:\.([a-z0-9!$'*+:^_`{|}~-]|%[0-9a-f]{2})+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;var k=/^([0-9]{1,3}\.){3}[0-9]{1,3}$/;var l=/^(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$/;var m=/^\[[^\]]+\]$/;var n=/^\[(((([0-9a-f]{1,4}:){6}|(::([0-9a-f]{1,4}:){5})|(([0-9a-f]{1,4})?::([0-9a-f]{1,4}:){4})|((([0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::([0-9a-f]{1,4}:){3})|((([0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::([0-9a-f]{1,4}:){2})|((([0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:)|((([0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::))(([0-9a-f]{1,4}:[0-9a-f]{1,4})|(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])))|((([0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4})|((([0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::))\]$/i;var o=/^([a-z0-9]([a-z0-9\-]*[a-z0-9])?\.)*[a-z0-9]([a-z0-9\-]*[a-z0-9])?$/i;if(p){p=p.toUpperCase();if(w.length<=0){if(!/^(https?|ftp)/i.test(p)){return false;}}}if(h){if(k.test(h)){if(!l.test(h)){return false;}}else if(m.test(h)){if(!n.test(h)){return false;}}else if(!o.test(h)){return false;}h=h.toUpperCase();}if(d){if(p==="MAILTO"){var A=B.split(",");for(var i=0;i<A.length;i++){if(!j.test(A[i])){return false;}}}else{var C=d.split("/");for(var i=0;i<C.length;i++){if(!e.test(C[i])){return false;}}}}if(q){if(!f.test(q)){return false;}}if(H){if(!g.test(H)){return false;}}if(w.length>0){var F=false;for(var i=0;i<w.length;i++){a(w[i]instanceof U,"whitelist entry type wrong");if(!p||!w[i].protocol||p==w[i].protocol){var O=false;if(h&&w[i].host&&/^\*/.test(w[i].host)){var t=w[i].host.slice(1).replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&");var v=RegExp(t+"$");if(v.test(h)){O=true;}}else if(!h||!w[i].host||h==w[i].host){O=true;}if(O){if((!h&&!P)||!w[i].port||P==w[i].port){if(w[i].path&&/\*$/.test(w[i].path)){var x=w[i].path.slice(0,-1).replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&");var v=RegExp("^"+x);if(v.test(d)){F=true;}}else if(!w[i].path||d==w[i].path){F=true;}}}}if(F){break;}}if(!F){return false;}}return true;};return u;});
