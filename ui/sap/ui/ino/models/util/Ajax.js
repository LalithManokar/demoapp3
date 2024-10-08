/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.util.Ajax");
 
(function() {
    "use strict";
    
    jQuery.sap.require("sap.ui.ino.application.Configuration");

    sap.ui.ino.models.util.Ajax = {};
    
    sap.ui.ino.models.util.Ajax.parseResponse = function(oResponse) {
        var oResponseObject = {};
        // No response text ==> Response is already parsed
        if (!oResponse.responseText) {
            oResponseObject = oResponse;
        } else {
            try {
                oResponseObject = JSON.parse(oResponse.responseText);
            } catch (e) {
                var sText = oResponse.responseText;
                if (sText) {
                    sText = sText.replace(/<(.|\n)*?>/g, " ").replace(/\s+/g, " ").trim();
                }

                oResponseObject.MESSAGES = [{
                    MESSAGE : oResponse.status === 403 ? "MSG_GENERIC_AUTH_ERROR" : "MSG_GENERIC_ERROR",
                    TYPE : "E",
                    PARAMETERS : [sText]
                }];
            }
        }
        if (oResponse.status === 412) {
            oResponseObject.concurrencyConflict = true;
        }
        oResponseObject.getHeader = jQuery.proxy(oResponse.getResponseHeader, oResponse);
        return oResponseObject;
    };
    
    sap.ui.ino.models.util.Ajax.process = function(oAjaxSettings) {
        var oDeferred = new jQuery.Deferred();

        if (sap.ui.ino.application.Configuration.isBackendTraceActive()) {
            oAjaxSettings.url += "?$trace=true";
        }

        var oAjaxPromise = jQuery.ajax(oAjaxSettings);
        oAjaxPromise.done(function(oResponse, sSuccess, oAjaxResponse) {
            oDeferred.resolve(oResponse, sSuccess, oAjaxResponse);
        });
        oAjaxPromise.fail(function(oResponse) {
            var bXSRFValid = sap.ui.ino.application.Configuration.validateXSRFToken(oResponse);
            if (!bXSRFValid) {
                // XSRFToken was not valid, but was reloaded in configuration already
                // We need to resend the request with the new XSRFToken
                oAjaxPromise = jQuery.ajax(oAjaxSettings);
                oAjaxPromise.done(function(oResponse, sSuccess, oAjaxResponse) {
                    oDeferred.resolve(oResponse, sSuccess, oAjaxResponse);
                });
                oAjaxPromise.fail(function(oResponse) {
                    // We only try resending once once
                    oDeferred.reject(sap.ui.ino.models.util.Ajax.parseResponse(oResponse));
                });
            } else {
                oDeferred.reject(sap.ui.ino.models.util.Ajax.parseResponse(oResponse));
            }
        });

        return oDeferred.promise();
    };
})();