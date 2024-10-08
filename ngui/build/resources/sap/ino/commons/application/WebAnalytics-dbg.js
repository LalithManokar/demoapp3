/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.commons.application.WebAnalytics");

sap.ui.define([], function() {
	"use strict";

	var SWACustomEvent = {
		campaignView: "CAMPAIGN",
		ideaView: "IDEA",
		wallView: "WALL"
	};

	sap.ino.commons.application.WebAnalytics = {

		start: function(oConfiguration) {

			var bTrackingActive = oConfiguration.isComponentActive('sap.ino.config.SWA_ACTIVE');
			if (!bTrackingActive) {
				return;
			}

			var bClickActive = oConfiguration.isComponentActive('sap.ino.config.SWA_CLICK_ACTIVE');

			var iDNTLevel = 1;
			var sDNTLevel = oConfiguration.getSystemSetting('sap.ino.config.SWA_DNT_LEVEL');
			if (sDNTLevel) {
				iDNTLevel = parseInt(sDNTLevel, 0);
			}

			var sBaseURL = oConfiguration.getSWABaseURL();
			var sLoggingURL = oConfiguration.getSWATrackerURL();

			window.swa = {
				pubToken: 'HCO_INO',
				baseUrl: sBaseURL,
				loggingUrl: sLoggingURL,
				dntLevel: iDNTLevel,
				bannerEnabled: false,
				loggingEnabled: bTrackingActive,
				clicksEnabled: false,
				pageLoadEnabled: true,
				customEventsEnabled: true,
				visitorCookieDuration: 7776000000
			};
			// 	window.swa = {
			// 		pubToken: 'd5f11c9c-4793-73e2-ba8a-bbab74e0f39d',
			// 		baseUrl: "https://webanalytics.cfapps.eu10.hana.ondemand.com/tracker/",
			// 		loggingUrl: "https://webanalytics.cfapps.eu10.hana.ondemand.com/tracker/",
			// 		dntLevel : iDNTLevel,
			// 		bannerEnabled: false,
			// 		loggingEnabled: bTrackingActive,
			// 		clicksEnabled: false,
			// 		pageLoadEnabled: true,
			// 		customEventsEnabled: true,  
			// 		visitorCookieDuration: 7776000000
			// 	}; 
			//the initializer code
			var d = document,
				g = d.createElement('script'),
				s = d.getElementsByTagName('script')[0];
			g.type = 'text/javascript';
			g.defer = true;
			g.async = true;
			g.src = window.swa.baseUrl + 'js/privacy.js';
			g.onload = function() {
                window.swa.trackLoad =  function() {
				window.Matomo.getAsyncTracker().disableAlwaysUseSendBeacon();
				if ((window.swa.loggingEnabled) && (window.swa.pageLoadEnabled) && (typeof window.Piwik !== "undefined")) {
					window.Matomo.getAsyncTracker().trackPageView();
				}};	
			};			
			s.parentNode.insertBefore(g, s);

		},

		stop: function() {
			if (window.swa) {
				window.swa.loggingEnabled = false;
				window.swa.disable();
			}
		},

		piwikPromise: function() {
			return new Promise(function(fnResolve, fnReject) {
				//Check if the data is already on the client
				var iCounter = 0;
				window.Matomo.getAsyncTracker().disableAlwaysUseSendBeacon();
				var iInterval = setInterval(function() {
					if (window.swa.trackCustomEvent && window.Piwik) {
						clearInterval(iInterval);
						fnResolve();
					}
					iCounter++;
					if (iCounter > 20) {
						clearInterval(iInterval);
						fnReject();
					}
				}, 1000);
			});
		},

		logCampaignView: function(iId) {
			//if SWA is not there, there is nothing to do
			if (window.swa) {
				sap.ino.commons.application.WebAnalytics.piwikPromise().then(
					function() {
						window.swa.trackCustomEvent(SWACustomEvent.campaignView, iId);
					},
					function() {
						throw "Event could not be logged: " + SWACustomEvent.campaignView + " " + iId;
					}
				);
			}
		},

		logIdeaView: function(iId) {
			//if SWA is not there, there is nothing to do
			if (window.swa) {
				sap.ino.commons.application.WebAnalytics.piwikPromise().then(
					function() {
						window.swa.trackCustomEvent(SWACustomEvent.ideaView, iId);
					},
					function() {
						throw "Event could not be logged: " + SWACustomEvent.ideaView + " " + iId;
					}
				);
			}
		},

		logWallView: function(iId) {
			//if SWA is not there, there is nothing to do
			if (window.swa) {
				sap.ino.commons.application.WebAnalytics.piwikPromise().then(
					function() {
						window.swa.trackCustomEvent(SWACustomEvent.wallView, iId);
					},
					function() {
						throw "Event could not be logged: " + SWACustomEvent.wallView + " " + iId;
					}
				);
			}
		}
	};

	return sap.ino.commons.application.WebAnalytics;
});