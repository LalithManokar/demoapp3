/*
 * SAP Web Analytics - Tracking Script
 *
 * Version: 1.1.0 (0.1.3)
 *
 * (C) 2013-2015 SAP AG. All rights reserved.
 */
var swa=swa||{};var _paq=_paq||[];swa.logger=true;swa.variableInit=function(){if(typeof swa.loggingUrl==="undefined"){swa.loggingUrl=swa.baseUrl}if(typeof swa.pageLoadEnabled==="undefined"){swa.pageLoadEnabled=true}if(typeof swa.clicksEnabled==="undefined"){swa.clicksEnabled=true}if(typeof swa.customEventsEnabled==="undefined"){swa.customEventsEnabled=true}if(typeof swa.hotkeysEnabled==="undefined"){swa.hotkeysEnabled=false}if(typeof swa.loggingEnabled==="undefined"){swa.loggingEnabled=true}if(typeof swa.dntLevel==="undefined"){swa.dntLevel=1}if(typeof swa.bannerEnabled==="undefined"){swa.bannerEnabled=false}if(typeof swa.licenseUrl==="undefined"){swa.licenseUrl="about:blank"}if(typeof swa.cookiesEnabled==="undefined"){swa.cookiesEnabled=true}if(typeof swa.visitorCookieDuration==="undefined"){swa.visitorCookieDuration=7776000000}if(typeof swa.test==="undefined"){swa.test=false}swa.currentEvent="";swa._respectDNT=true};swa.documentReady=function(){swa.variableInit();if(jQuery("#SAPwebanalytics_license").length){swa.appendLicense()}if(swa.bannerEnabled){swa.addBanner()}if(swa.licenseUrl!="about:blank"){swa.addLicense()}swa.privacy_init();jQuery("#swa_background, .close_license").click(function(a){jQuery("#swa_background").fadeOut(500);jQuery("#swa_license").fadeOut(500);a.preventDefault()});window.setTimeout(function(){jQuery(".showlicense").click(function(c){var b=jQuery(window).height();var g=jQuery(window).width();var a=jQuery("#swa_license").outerHeight();var f=jQuery("#swa_license").outerWidth();var e=(b-a)/2;var d=(g-f)/2;jQuery("#swa_license").css({top:e,left:d});jQuery("#swa_background").css({display:"block",opacity:0});jQuery("#swa_background").fadeTo(500,0.8);jQuery("#swa_license").fadeIn(500);c.preventDefault()})},1000)};swa.privacy_init=function(){var c=jQuery(".swa_checkid");var a;c.click(swa.stateChanged);c.prop("checked",false);var d=(navigator.cookieEnabled)?true:false;if(typeof navigator.cookieEnabled=="undefined"&&!d){document.cookie="testcookie";d=(document.cookie.indexOf("testcookie")!=-1)?true:false;if(!d){c.prop("disabled",true);if(swa.bannerEnabled){jQuery(".banner").slideDown()}return}}if(swa.dntLevel!==3){a=navigator.doNotTrack||navigator.msDoNotTrack;if(a==="yes"||a==="1"){if(swa.dntLevel===2){if(Function("/*@cc_on return /^10/.test(@_jscript_version) @*/")()){swa._respectDNT=false}}if(swa._respectDNT){c.prop("disabled",true);if(swa.bannerEnabled){jQuery(".banner").slideDown()}return}}}else{swa._respectDNT=false}var b=swa.getPrivacyCookie("_swa_save."+swa.pubToken);if(b==1){c.prop("checked",true);swa.loggingEnabled=true;swa.loadLogger()}else{if(b===0){c.prop("checked",false);swa.loggingEnabled=false}else{if(swa.loggingEnabled){c.prop("checked",true);if(swa.bannerEnabled){jQuery(".banner").slideDown()}swa.loadLogger()}else{c.prop("checked",false);if(swa.bannerEnabled){jQuery(".banner").slideDown()}}}}};swa.loadLogger=function(){var b=swa.baseUrl,a=swa._addScript;var c="piwik_plugin.js";_paq.push(["setSiteId",swa.pubToken]);_paq.push(["setTrackerUrl",swa.loggingUrl+"log"]);_paq.push(["setDoNotTrack",swa._respectDNT]);_paq.push(["setCookieNamePrefix","_swa_"]);_paq.push(["setCustomRequestProcessing",function(g){if(g){var m={};var n=g.split("&");for(var h=0;h<n.length;h++){var l=n[h].split("=");m[decodeURIComponent(l[0].replace(/\+/g,"%20"))]=decodeURIComponent(l[1].replace(/\+/g,"%20"))}var f=false;if((window)&&(window.location)){var k=window.location.href;if("url" in m){if(m.url!=k){if(typeof Piwik!=="undefined"){Piwik.getAsyncTracker().setCustomUrl(k)}m.url=k;f=true}}}if(document){var d=document.getElementsByTagName("title");if(d.length>0){var o=d[0].innerHTML;if("pageTitle" in m){if(m.pageTitle!=o){m.pageTitle=o;f=true}}}}if(f===true){var e=[];for(var j in m){if(m.hasOwnProperty(j)){e.push(encodeURIComponent(j)+"="+encodeURIComponent(m[j]))}}g=e.join("&")}return g}}]);if(typeof swa.sessionTime!=="undefined"){_paq.push(["setSessionCookieTimeout",swa.sessionTime])}if(!swa.cookiesEnabled){_paq.push(["disableCookies"])}a(b+"js/piwik.js",function(){a(b+"js/"+c,function(){Piwik.addPlugin("swa",swa.plugin);if(swa.logger){swa.trackLoad();swa.logger=false}})});swa.loggerLoaded=true};swa.enable=function(){swa.loggingEnabled=true;if(!swa.loggerLoaded){swa.loadLogger()}};swa.disable=function(){if(typeof Piwik!=="undefined"){Piwik.getAsyncTracker().setDoNotTrack(false)}swa.loggingEnabled=false};swa.trackLoad=function(){if((swa.loggingEnabled)&&(swa.pageLoadEnabled)&&(typeof Piwik!=="undefined")){Piwik.getAsyncTracker().trackPageView()}};swa.trackLink=function(a){if((swa.loggingEnabled)&&(swa.clicksEnabled)&&(typeof Piwik!=="undefined")){swa.plugin.clickedElements.push(a);Piwik.getAsyncTracker().trackLink("click","event_type")}};swa.trackClick=function(b,a,d){if((swa.loggingEnabled)&&(swa.clicksEnabled)&&(typeof Piwik!=="undefined")){var c={};if(typeof b!=="undefined"){if(swa._isUI5()){c.target=b}else{c.currentTarget=b}if(typeof a!=="undefined"){c.pageX=a}if(typeof d!=="undefined"){c.pageY=d}swa.plugin.clickedElements.push(c);Piwik.getAsyncTracker().trackLink("click","event_type")}}};swa.trackCustomEvent=function(a,b){if((swa.loggingEnabled)&&(swa.customEventsEnabled)&&(typeof Piwik!=="undefined")){Piwik.getAsyncTracker().trackEvent(a,b)}};swa.getEvent=function(){return swa.currentEvent};swa.getPrivacyCookie=function(b){var c=document.cookie;var a;var d=c.indexOf(" "+b+"=");if(d==-1){d=c.indexOf(b+"=")}if(d==-1){c=null}else{d=c.indexOf("=",d)+1;a=c.indexOf(";",d);a=c.indexOf(";",d);if(a==-1){a=c.length}c=unescape(c.substring(d,a))}return c};swa.cookieman=function(c,b){var e,d,a;if(b){e=Date.now()+swa.visitorCookieDuration}else{e=Date.now()-swa.visitorCookieDuration;if(typeof Piwik!=="undefined"){Piwik.getAsyncTracker().deleteCookies()}}d=new Date(parseInt(e,10));a="_swa_save."+swa.pubToken+"="+c+"; expires="+d.toUTCString();a+="; path=/";document.cookie=a};swa.deleteCookies=function(){validTo=Date.now()-swa.visitorCookieDuration;if(typeof Piwik!=="undefined"){Piwik.getAsyncTracker().deleteCookies()}exdate=new Date(parseInt(validTo,10));cookie="_swa_save."+swa.pubToken+"=0; expires="+exdate.toUTCString();cookie+="; path=/";document.cookie=cookie};swa.stateChanged=function(a){var c=jQuery(a.target).closest("div");var b=c.find(".swa_checkid")[0];jQuery(".swa_checkid").prop("checked",b.checked);if(b.checked){swa.enable();jQuery(".swa_save").prop("checked",false)}else{swa.disable()}};swa.saveOption=function(a){var c=jQuery(a.target).closest("div");var b=c.find(".swa_checkid")[0];jQuery(".swa_checkid").prop("checked",b.checked);if(b.checked===false){swa.cookieman("0",true);swa.disable()}else{if(b.checked===true){swa.cookieman("1",true);swa.enable()}}};swa.addBanner=function(){jQuery("body").append('<style>.banner {font-family:Arial,Helvetica,sans-serif;width: 100%;height: 37px;background-color: #FFFFC0;z-index: 9999;position: absolute;left: 0;top: 0;display: none;font-size:80%}.banner p {display: inline;position: absolute;left: 0px;margin:3px;}.banner img{vertical-align:top;}.banner form {display: inline;position: absolute;right: 0px;margin: 3px;}</style><div id="bann" class="banner"><p><strong>This website uses <a href="http://webanalytics.hana.ondemand.com" target="_blank" rel="noopener">SAP Web Analytics</a> for tracking.</strong></p><form action="#" onsubmit="return false"><input type="checkbox" class="swa_checkid" id="swa_p_checkid" /><LABEL for="swa_p_checkid" id="l_swa_p_checkid">&nbsp;Allow tracking</LABEL>&nbsp;&nbsp;<button type="button" id="swa_save_banner" class="swa_saveButton" onclick="banner_save(event)"; class="swa_ignore">Save</button><a href="#" style="margin-left:20px;" onclick="jQuery(\'.banner\').slideUp(); return false;"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAACIiIhaeOqmAAAAAXRSTlMAQObYZgAAAC9JREFUaN5jYGBgEOBgsJBhqLFjsKthkP/BwP+Bgf0BCAEZQC5QECgFVABUxsAAAOcxCbuaDAybAAAAAElFTkSuQmCC" /></a></form></div>')};swa.addLicense=function(){jQuery("body").append('<style>#swa_background{position:fixed;top:0px;left:0px;height:100%;width:100%;display:none;background-color: black;z-index:100;}#swa_license{font-family:Arial,Helvetica,sans-serif;background-color: white;color: black;border: 1px solid gray;position:absolute;display:none;z-index:11100;padding: 30px; display:none;background: #FFF;border-radius: 5px; -moz-border-radius: 5px; -webkit-border-radius: 5px;box-shadow: 0px 0px 4px rgba(0,0,0,0.7); -webkit-box-shadow: 0 0 4px rgba(0,0,0,0.7); -moz-box-shadow: 0 0px 4px rgba(0,0,0,0.7);}.close_license{ position: absolute; top: 12px; right: 12px; display: block; width: 14px; height: 14px; background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAACIiIhaeOqmAAAAAXRSTlMAQObYZgAAAC9JREFUaN5jYGBgEOBgsJBhqLFjsKthkP/BwP+Bgf0BCAEZQC5QECgFVABUxsAAAOcxCbuaDAybAAAAAElFTkSuQmCC); z-index: 2;}.swabutton{display:inline;position: absolute;right: 25px;margin: 0px}.swalicensetxt{width:500px; height:350px; overflow-y: scroll;overflow-x: scroll;}</style><div id="swa_background"></div><div id="swa_license"><div id="swa_header"><table><tr><td><strong>Privacy Statement</strong></td></tr></table><a class="close_license" href="#"></a></div><iframe id="swa_licence_window" class="swalicensetxt" src="about:blank" scrolling="yes"></iframe><div id="swa_form"><p></p><p></p><input type="checkbox" class="swa_checkid" id="swa_p_checkid" /><LABEL for="swa_p_checkid" id="l_swa_p_checkid">&nbsp;Allow use of SAP Web Analytics</LABEL>&nbsp;&nbsp;<button class="swabutton" type="button" id="swa_save_modal" class="swa_saveButton" onclick="frame_save(event);">Save</button></div></div>');jQuery("#swa_licence_window").attr("src",swa.licenseUrl)};swa.appendLicense=function(){jQuery("#SAPwebanalytics_license").append('<style></style><table id="swa_app_license" border="0"><tr><form action="#" onsubmit="return false"><td><input type="checkbox" class="swa_checkid" id="swa_p_checkid" /><LABEL for="swa_p_checkid" id="l_swa_p_checkid">&nbsp;Allow tracking</LABEL></td><td><button type="button" id="swa_save_page" class="swa_saveButton" onclick="page_save(event);">Save</button></form></td></tr></table>')};function banner_save(a){swa.saveOption(a);jQuery(".banner").slideUp();a.preventDefault()}function frame_save(a){swa.saveOption(a);jQuery("#swa_background").fadeOut(500);jQuery("#swa_license").fadeOut(500);jQuery(".banner").slideUp();a.preventDefault()}function page_save(a){swa.saveOption(a);jQuery(".banner").slideUp();setTimeout(function(){history.back();return false})}function showSwaLicense(){var b=jQuery(window).height();var f=jQuery(window).width();var a=jQuery("#swa_license").outerHeight();var e=jQuery("#swa_license").outerWidth();var d=(b-a)/2;var c=(f-e)/2;jQuery("#swa_license").css({top:d,left:c});jQuery("#swa_background").css({display:"block",opacity:0});jQuery("#swa_background").fadeTo(500,0.8);jQuery("#swa_license").fadeIn(500)}function showClickstreamlicense(){showSwaLicense()}swa._addScript=function(a,h){swa.variableInit();h=h||function(){};var f=document,e=f.createElement("script");e.type="text/javascript";e.defer=true;e.async=true;e.onload=e.onreadystatechange=function(){var d=this.readyState;if((d)&&(d!="complete")&&(d!="loaded")){return}try{h()}catch(g){}};e.src=a;if(f.body){f.body.appendChild(e)}else{var b=f.getElementsByTagName("script"),c=b[b.length-1];c.parentNode.insertBefore(e,c.nextSibling)}};swa._isUI5=function(){return !((typeof sap=="undefined")||(typeof sap.ui=="undefined"))};swa._bootstrap=function(){if(typeof clickstream!=="undefined"){jQuery.extend(swa,clickstream)}swa.documentReady()};if((!swa._isUI5())&&(typeof jQuery=="undefined")){var jQuerySafeMode=(typeof(window.$)!="undefined");var scriptToAdd=swa.baseUrl+"js/jquery.min.js";if(location.protocol==="file:"){if(swa.test===true){scriptToAdd=swa.baseUrl+"test/js/jquery.min.js"}}swa._addScript(scriptToAdd,function(){if(jQuerySafeMode){jQuery.noConflict()}swa._bootstrap()})}else{swa._bootstrap()};