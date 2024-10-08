/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.application.mashup.Application");

jQuery.sap.require("sap.ui.core.routing.HashChanger");
jQuery.sap.require("sap.ui.ino.controls.MessageBox");

(function() {
    "use strict";

    jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
    sap.ui.ino.application.ApplicationBase.extend("sap.ui.ino.application.mashup.Application", {

        init : function() {
            // Moved to init to prevent synchronous calls in bootstrap causing endless loop when login into cached UI in Chrome
            jQuery.sap.require("sap.ui.ino.controls.ContentPane");

            //due to jam issues we need to set the hash depending on a parameter
            var oTypeUriParameter = jQuery.sap.getUriParameters().mParams.content;
            if(oTypeUriParameter && 
                    oTypeUriParameter.constructor === Array &&
                    oTypeUriParameter.length > 0) {
                var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
                oHashChanger.replaceHash(oTypeUriParameter[0]);
            }

            sap.ui.ino.application.ApplicationBase.prototype.init.apply(this, arguments);
            this.setNavigationPaths({
                "home" : {
                    pageView : "sap.ui.ino.views.mashup.RecentIdeasWidget"
                },
                "recentideas" : {
                    pageView : "sap.ui.ino.views.mashup.RecentIdeasWidget"
                },
                "recentideacards" : {
                    pageView : "sap.ui.ino.views.mashup.RecentIdeasCardWidget"
                },
                "recentcomments" : {
                    pageView : "sap.ui.ino.views.mashup.RecentCommentsWidget"
                },
                "topcommentators" : {
                    pageView : "sap.ui.ino.views.mashup.TopCommentatorsWidget"
                },
                "topcontributors" : {
                    pageView : "sap.ui.ino.views.mashup.TopContributorsWidget"
                }
            });
        },

        initRootContent : function() {
            this.setRootContent(new sap.ui.ino.controls.ContentPane({
                fullsize : true
            }));
        },

        enhanceHistoryState : function(historyState) {
            if (jQuery.sap.getUriParameters().mParams) {
                if (typeof historyState !== "object") {
                    historyState = {};
                }
                for ( var sParam in jQuery.sap.getUriParameters().mParams) {
                    if (sParam.indexOf("sap-") !== 0) {
                        var value = jQuery.sap.getUriParameters().mParams[sParam];
                        if (Array.isArray(value)) {
                            if (value.length === 1) {
                                value = value[0];
                            }
                        }
                        historyState[sParam] = value;
                    }
                }
            }
            return historyState;
        },

        getApplicationCode : function() {
            return "sap.ino.config.URL_PATH_UI_MASHUP";
        },

        handleODataError : function(oEvent) {
            this.showODataError(oEvent);
        },

        showMessageError : function(sMessage, sTitle, fnOk) {
            sap.ui.ino.controls.MessageBox.show(sMessage, sap.ui.commons.MessageBox.Icon.ERROR, sTitle, [sap.ui.commons.MessageBox.Action.OK], fnOk, sap.ui.commons.MessageBox.Action.OK);
        }
    });

    sap.ui.ino.application.mashup.Application.getInstance = function() {
        return sap.ui.ino.application.ApplicationBase.getApplication();
    };
})();