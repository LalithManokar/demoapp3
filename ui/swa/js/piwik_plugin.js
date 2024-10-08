/*
 * SAP Web Analytics - Tracking Script
 *
 * Piwik Plugin 
 * 
 * Version: 1.1.0 (0.1.2d-fix)
 *
 * (C) 2013-2015 SAP AG. All rights reserved.
 */
var swa=swa||{};var varlength=225;var previous={};previous.timeStamp=0;swa.plugin={log:function(){swa.currentEvent="load";var a=swa.plugin._getCommons();a.element_type="page";a.event_type="load";if(swa.test){parent.window.swa_tests("load",a)}return"&"+jQuery.param(a)},link:function(){swa.currentEvent="click";var d=swa.plugin;var e=d.clickedElements.shift();var b=swa._isUI5()?e.target:e.currentTarget;var a=d._getCommons();if(e.ctrlKey||e.altKey){a.element_id=String.fromCharCode(e.keyCode);a.element_type="Hotkey press";a.element_text=e.ctrlKey?"Ctrl + "+String.fromCharCode(e.keyCode):"Alt + "+String.fromCharCode(e.keyCode);a.xpath="";a.clickX=0;a.clickY=0;a.elementX=0;a.elementY=0;a.clickTime=Math.round(+new Date()/1000);a.elementWidth=0;a.elementHeight=0}else{if(typeof b!=="undefined"){var c=b.tagName.toLowerCase();a.element_id=b.id;a.element_type=c;a.element_text=d._getElementText(b).substring(0,varlength);a.xpath=d._getXpath(b);a.clickX=Math.round(e.pageX);a.clickY=Math.round(e.pageY);a.elementX=Math.round(jQuery(b).offset().left);a.elementY=Math.round(jQuery(b).offset().top);a.clickTime=Math.round(+new Date()/1000);a.elementWidth=Math.round(jQuery(b).outerWidth());a.elementHeight=Math.round(jQuery(b).outerHeight());if(c=="a"&&b.href){a.target_url=b.href}}}if(swa.test){parent.window.swa_tests("click",a)}return"&"+jQuery.param(a)},event:function(){swa.currentEvent="custom";var a=swa.plugin._getCommons();a.event_type="custom";a.element_type="event";if(swa.test){parent.window.swa_tests("custom",a)}return"&"+jQuery.param(a)},_getXpath:function(b){var a="";var c=b;for(;c&&c.nodeType==1;c=c.parentNode){var d=jQuery(c.parentNode).children(c.tagName).index(c)+1;d=d>1?"["+d+"]":"";a="/"+c.tagName.toLowerCase()+d+a}return a},_getCommons:function(){var a={timezone:new Date().getTimezoneOffset(),locale:(navigator.language?navigator.language:navigator.browserLanguage),pageTitle:document.title};for(var b=0;b<10;b++){var e="custom"+String(b+1);var d=swa.plugin._getCustomvalues(b+1);if(d===null){continue}var c=window[d[0]];if(typeof c==="function"){a[e]=c.apply(null,d[1])}else{a[e]=d[0]}}return a},_getElementText:function(a){var b=jQuery(a);if(b.text().length>0){return b.text()}return b.attr("title")?b.attr("title"):b.val()},_getCustomvalues:function(b){var a;switch(b){case 1:if(typeof swa.custom1==="undefined"){break}return[swa.custom1.ref,swa.custom1.params];case 2:if(typeof swa.custom2==="undefined"){break}return[swa.custom2.ref,swa.custom2.params];case 3:if(typeof swa.custom3==="undefined"){break}return[swa.custom3.ref,swa.custom3.params];case 4:if(typeof swa.custom4==="undefined"){break}return[swa.custom4.ref,swa.custom4.params];case 5:if(typeof swa.custom5==="undefined"){break}return[swa.custom5.ref,swa.custom5.params];case 6:if(typeof swa.custom6==="undefined"){break}return[swa.custom6.ref,swa.custom6.params];case 7:if(typeof swa.custom7==="undefined"){break}return[swa.custom7.ref,swa.custom7.params];case 8:if(typeof swa.custom8==="undefined"){break}return[swa.custom8.ref,swa.custom8.params];case 9:if(typeof swa.custom9==="undefined"){break}return[swa.custom9.ref,swa.custom9.params];case 10:if(typeof swa.custom10==="undefined"){break}return[swa.custom10.ref,swa.custom10.params];default:return null}return null},clickedElements:[]};if(!swa._isUI5()){jQuery("*").not("swa_ignore").on("click.swa","*",function(a){if(swa.loggingEnabled&&swa.clicksEnabled){if(this===a.target){if(previous.timeStamp!=a.timeStamp){previous.timeStamp=a.timeStamp;if(a.currentTarget.className.indexOf("swa_ignore")==-1){swa.plugin.clickedElements.push(a);Piwik.getAsyncTracker().trackLink("click","event_type")}}}}});jQuery(window).keydown(function(a){if(swa.hotkeysEnabled&&(a.ctrlKey||a.altKey)&&(a.keyCode!=17&&a.keyCode!=18)){swa.plugin.clickedElements.push(a);Piwik.getAsyncTracker().trackLink("keypress","event_type")}})}else{sap.ui.getCore().attachControlEvent(function(a){var d=a.getParameter("browserEvent");if(d&&d.type==="click"){var c=d;var b=c.target.tagName.toLowerCase();if(typeof(c.target.className.indexOf)==="function"){if(c.target.className.indexOf("swa_ignore")==-1){if(swa.loggingEnabled&&swa.clicksEnabled){swa.plugin.clickedElements.push(c);Piwik.getAsyncTracker().trackLink("click","event_type")}}}else{if(swa.loggingEnabled&&swa.clicksEnabled){swa.plugin.clickedElements.push(c);Piwik.getAsyncTracker().trackLink("click","event_type")}}}});jQuery(window).keydown(function(a){if(swa.hotkeysEnabled&&(a.ctrlKey||a.altKey)&&(a.keyCode!=17&&a.keyCode!=18)){swa.plugin.clickedElements.push(a);Piwik.getAsyncTracker().trackLink("keypress","event_type")}})};