/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/base/Log","./SceneBuilder"],function(L,S){"use strict";var o=function(e){var d=e.data;if(d.ready){o.resolve();}else{var s=S.getById(d.sceneBuilderId);s[d.method].apply(s,d.args);}};var a=function(e){L.error("Error in WebWorker",e);};var g=(function(){var p;return function(){return p||(p=new Promise(function(r){var w=new Worker(sap.ui.require.toUrl("sap/ui/vk/threejs/MataiLoaderWorker.js"));o.resolve=r.bind(null,w);w.onmessage=o;w.onerror=a;}));};})();var l=function(b,u,p,c,r,d){g().then(function(w){var s=new S(p,c,r,d);w.postMessage({method:"loadSceneFromArrayBuffer",sceneBuilderId:s.getId(),buffer:b,fileName:u,sourceLocation:"remote"},[b]);});};return function(p,c){return new Promise(function(r,b){if(typeof c.getSource()==="string"){var u=c.getSource();fetch(u).then(function(e){if(e.ok){return e.arrayBuffer();}throw(new Error(e.statusText));}).then(function(e){l(e,u,p,c,r,b);}).catch(function(e){b(e);});}else if(c.getSource()instanceof File){var d=new FileReader();d.onload=function(e){l(e.target.result,c.getSource().name,p,c,r,b);};d.onerror=function(e){b(e);};d.readAsArrayBuffer(c.getSource());}});};});
