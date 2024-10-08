// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/utils","sap/ushell/EventHub","sap/base/Log","sap/ui/util/Mobile","sap/ui/thirdparty/jquery","sap/base/util/ObjectPath","sap/base/i18n/ResourceBundle","sap/ushell/resources","sap/ui/core/IconPool","sap/m/library"],function(u,E,L,M,q,O,R,r,I,m){"use strict";var B=m.ButtonType;function A(){var o={},a=true,c=null,b=[],d=[];E.on("AppRendered").do(e.bind(this));function e(){a=false;if(d.length){for(var i=0;i<d.length;i++){d[i]();}d.length=0;}}this.addActivity=function(g){var C=sap.ushell.Container;return C&&C.getService("UserRecents").addActivity(g);};this.setApplicationInInitMode=function(){a=true;};this.getApplicationRequestQueue=function(){return d;};this.getCurrentApplication=function(){return c;};this.getCurrentAppliction=this.getCurrentApplication;this.getMetadata=function(g){if(!g){g=c;}if(g){var h=hasher&&hasher.getHash?hasher.getHash():"",k=this._processKey(h);if(!(o.hasOwnProperty(k))||!o[k].complete){this.addMetadata(g,k);}if(!o[k]){o[k]={complete:false};}if(!o[k].title){o[k].title=g.text||r.i18n.getText("default_app_title");}return o[k];}return{};};this._processKey=function(C){var i=C.split("?")[0],p=C.split("?")[1],s,P={},S,g="",h="",j;if(p){s=p.split("&");s.forEach(function(k){var l=k.split("=");P[l[0]]=l[1];});S=Object.keys(P).sort();S.forEach(function(k,l){h=l?"&":"?";g+=h+k+"="+P[k];});return i+g;}j=sap.ushell.Container.getService("URLParsing").parseShellHash(C);i=j?j.semanticObject+"-"+j.action:"";return i;};this.setCurrentApplication=function(g){c=g;if(d.length){d.length=0;}};this.setHeaderHiding=function(){L.warning("Application configuration headerHiding property is deprecated and has no effect");};this.addApplicationSettingsButtons=function(g){if(a){d.push(function(){f(g);});}else{f(g);}};function f(g){var i,h=[],j=sap.ushell.Container.getRenderer("fiori2");for(i=0;i<g.length;i++){var C=g[i];h.push(C.getId());C.setIcon(C.getIcon()||I.getIconURI("customize"));if(r.i18n.getText("userSettings")===C.getProperty("text")){C.setProperty("text",r.i18n.getText("userAppSettings"));}C.setType(B.Unstyled);}if(sap.ushell.Container&&j){if(b.length){j.hideActionButton(b,true);}b=h;j.showActionButton(h,true,undefined,true);}}this.setWindowTitle=function(t){window.document.title=t;};this.setIcons=function(i){M.setIcons(i);};this.setApplicationFullWidth=function(v){sap.ushell.components.applicationIntegration.AppLifeCycle.setApplicationFullWidth(v);};this.getSettingsControlAsync=function(){var D=new q.Deferred();sap.ui.require(["sap/ushell/ui/footerbar/SettingsButton"],function(S){D.resolve(new S());});return D.promise();};this.getSettingsControl=function(){var s="sap/ushell/ui/footerbar/SettingsButton",g="sap.ushell.ui.footerbar.SettingsButton",S=sap.ui.require(s);if(S){return new S();}q.sap.require(g);S=O.get(g||"");return new S();};this.getApplicationName=function(g){var h,s=(g&&g.additionalInformation)||null;if(s){h=/^SAPUI5\.Component=(.+)$/i.exec(s);if(h){return h[1];}}return null;};this.getApplicationUrl=function(g){var U=(g&&g.url)||null,s="P_TCODE",i;if(U){if(g.applicationType==="NWBC"&&U.indexOf(s)){return U;}i=U.indexOf("?");if(i>=0){U=U.slice(0,i);}if(U.slice(-1)!=="/"){U+="/";}}return U;};this.getPropertyValueFromConfig=function(C,p,g){var v;if(g&&C.hasOwnProperty(p+"Resource")){v=g.getText(C[p+"Resource"]);}else if(C.hasOwnProperty(p)){v=C[p];}return v;};this.getPropertyValueFromManifest=function(l,p,P){var s=p[P].manifestEntryKey,g=p[P].path,h=l.getManifestEntry(s);return O.get(g||"",h);};this.addMetadata=function(g,k){try{var C=this.getApplicationName(g),U=this.getApplicationUrl(g),l,h,p={"fullWidth":{"manifestEntryKey":"sap.ui","path":"fullWidth"},"hideLightBackground":{"manifestEntryKey":"sap.ui","path":"hideLightBackground"},"title":{"manifestEntryKey":"sap.app","path":"title"},"icon":{"manifestEntryKey":"sap.ui","path":"icons.icon"},"favIcon":{"manifestEntryKey":"sap.ui","path":"icons.favIcon"},"homeScreenIconPhone":{"manifestEntryKey":"sap.ui","path":"icons.phone"},"homeScreenIconPhone@2":{"manifestEntryKey":"sap.ui","path":"icons.phone@2"},"homeScreenIconTablet":{"manifestEntryKey":"sap.ui","path":"icons.tablet"},"homeScreenIconTablet@2":{"manifestEntryKey":"sap.ui","path":"icons.tablet@2"},"startupImage320x460":{"manifestEntryKey":"sap.ui","path":"icons.startupImage640x920"},"startupImage640x920":{"manifestEntryKey":"sap.ui","path":"icons.startupImage640x920"},"startupImage640x1096":{"manifestEntryKey":"sap.ui","path":"icons.startupImage640x1096"},"startupImage768x1004":{"manifestEntryKey":"sap.ui","path":"icons.startupImage768x1004"},"startupImage748x1024":{"manifestEntryKey":"sap.ui","path":"icons.startupImage748x1024"},"startupImage1536x2008":{"manifestEntryKey":"sap.ui","path":"icons.startupImage1536x2008"},"startupImage1496x2048":{"manifestEntryKey":"sap.ui","path":"icons.startupImage1496x2048"},"compactContentDensity":{"manifestEntryKey":"sap.ui5","path":"contentDensities.compact"},"cozyContentDensity":{"manifestEntryKey":"sap.ui5","path":"contentDensities.cozy"}},i,s,j,n,P,t,v,w=g&&g.componentHandle;if(k){if(!(o.hasOwnProperty(k))){o[k]={complete:false};}if(!o[k].complete){if(w){l=w.getMetadata();}else if(C){L.warning("No component handle available for '"+C+"'; SAPUI5 component metadata is incomplete",null,"sap.ushell.services.AppConfiguration");return;}if(l){h=l.getConfig();n=(l.getManifest()!==undefined);o[k].complete=true;if(h){t=h.resourceBundle||"";if(t){if(t.slice(0,1)!=="/"){t=U+t;}v=R.create({url:t,locale:sap.ui.getCore().getConfiguration().getLanguage()});}}for(P in p){if(p.hasOwnProperty(P)){if(n){o[k][P]=this.getPropertyValueFromManifest(l,p,P);}if(h&&o[k][P]===undefined){o[k][P]=this.getPropertyValueFromConfig(h,P,v);}}}o[k].version=l.getVersion();o[k].technicalName=l.getComponentName();}else if(u.isApplicationTypeEmbeddedInIframe(g.applicationType)){var W="/~canvas;window=app/wda/",x=g.url.indexOf(W),y="/bc/gui/sap/its/webgui",z=g.url.indexOf(y);if(x>=0){o[k].technicalName=g.url.substring((x+W.length),g.url.indexOf("/",(x+W.length)));}o[k].complete=true;if(z>=0){var D="etransaction=",F=g.url.indexOf(D,z+y.length),G=g.url.indexOf("&",F),H=(G>=0)?G:g.url.length;o[k].technicalName=decodeURIComponent(g.url.substring(F+D.length,H))+" (TCODE)";}}else{L.warning("No technical information for the given application could be determined",null,"sap.ushell.services.AppConfiguration");}}i=["favIcon","homeScreenIconPhone","homeScreenIconPhone@2","homeScreenIconTablet","homeScreenIconTablet@2","startupImage320x460","startupImage640x920","startupImage640x1096","startupImage768x1004","startupImage748x1024","startupImage1536x2008","startupImage1496x2048"];s=(U&&U[U.length-1]==="/")?U.substring(0,U.length-1):U;j=function(U){if(U.match(/^https?:\/\/.*/)){return false;}return U&&U[0]!=="/";};i.forEach(function(K){var N=o[k][K],Q=null;if(N){Q=j(N)?s+"/"+N:N;}o[k][K]=Q;});}}catch(J){L.warning("Application configuration could not be parsed");}};}return new A();},true);
