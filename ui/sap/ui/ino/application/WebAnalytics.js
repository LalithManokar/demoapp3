/*!
 * @copyright@
*/
jQuery.sap.declare("sap.ui.ino.application.WebAnalytics");
(function() {
    "use strict";
    
    var SWACustomEvent = {
        campaignView : "CAMPAIGN",
        ideaView : "IDEA",
        DiscloseDataView:"DISCLOSE_DATA"        
    };

    sap.ui.ino.application.WebAnalytics = {
        
    
        start : function(oConfiguration){
            
            var bTrackingActive = oConfiguration.isComponentActive('sap.ino.config.SWA_ACTIVE');
            if(!bTrackingActive){
                return;
            }
            
            var bClickActive = oConfiguration.isComponentActive('sap.ino.config.SWA_CLICK_ACTIVE');
            
            var iDNTLevel = 1;
            var sDNTLevel = oConfiguration.getSystemSetting('sap.ino.config.SWA_DNT_LEVEL');
            if(sDNTLevel){
                iDNTLevel = parseInt(sDNTLevel, 0);
            }
            
            var sBaseURL = oConfiguration.getSWABaseURL();
            var sLoggingURL = oConfiguration.getSWATrackerURL();
            
            window.swa = {
        		pubToken: 'HCO_INO',
        		baseUrl: sBaseURL,
        		loggingUrl: sLoggingURL,
        		dntLevel : iDNTLevel,
        		bannerEnabled: false,
        		loggingEnabled: bTrackingActive,
        		clicksEnabled: bClickActive,
        		pageLoadEnabled: true,
        		customEventsEnabled: true,  
        		visitorCookieDuration: 7776000000
        	}; 
        	//the initializer code
        	var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        	g.type='text/javascript'; 
        	g.defer=true; 
        	g.async=true; 
        	g.src=window.swa.baseUrl+'js/privacy.js';
        	s.parentNode.insertBefore(g,s);
        },
        
        stop : function(){
            if(window.swa){
                window.swa.loggingEnabled = false;
                window.swa.disable();
            }
        },
        
        piwikPromise : function () {
           return new Promise(function (fnResolve, fnReject) {
              //Check if the data is already on the client
              var iCounter = 0;
              var iInterval = setInterval(function () {
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
        
        logCampaignView : function(iId){
            //if SWA is not there, there is nothing to do
            if(window.swa){
                sap.ui.ino.application.WebAnalytics.piwikPromise().then(
                    function () {
                        window.swa.trackCustomEvent(SWACustomEvent.campaignView, iId);
                    }, 
                    function () {
                       throw "Event could not be logged: " + SWACustomEvent.campaignView + " " + iId;
                    }
                );
            }
        },
        
        logIdeaView : function(iId){
            //if SWA is not there, there is nothing to do
            if(window.swa){
                sap.ui.ino.application.WebAnalytics.piwikPromise().then(
                    function () {
                        window.swa.trackCustomEvent(SWACustomEvent.ideaView, iId);
                    }, 
                    function () {
                       throw "Event could not be logged: " + SWACustomEvent.ideaView + " " + iId;
                    }
                );
            }
        },
        logDiscloseDataView: function(iId)
        {   //if SWA is not there, there is nothing to do
            if(window.swa){
                sap.ui.ino.application.WebAnalytics.piwikPromise().then(
                    function () {
                        window.swa.trackCustomEvent(SWACustomEvent.DiscloseDataView, iId);
                    }, 
                    function () {
                       throw "Event could not be logged: " + SWACustomEvent.DiscloseDataView + " " + iId;
                    }
                );
            }            
        }        
    };

})();