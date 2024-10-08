/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.object.Attachment");
(function() {
    "use strict";

    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");
    jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.Attachment", {
        objectName : "sap.ino.xs.object.attachment.Attachment",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultODataSource("Attachment")
    });

    function ajaxCall(sMethod, sUrl, oFile, sFilename, fnSuccess, fnError, sFileLabel) {
        var oFormData = new FormData();
        // oFormData.append("label", sFileLabel);
        if (Array.isArray(oFile)) {
			oFile.map(function(f) {
				if (sFilename !== null && sFilename !== undefined) {
					oFormData.append("upload", f, sFilename);
				} else {
					oFormData.append("upload", f, sFilename);
				}
			});
		} else {
			if (sFilename !== null && sFilename !== undefined) {
				oFormData.append("upload", oFile, sFilename);
			} else {
				oFormData.append("upload", oFile);
			}
		}

        var oApplication = sap.ui.ino.application.ApplicationBase.getApplication();
        var sXSRFToken = oApplication.getXSRFToken();

        var oHeaders = {};
        if (sXSRFToken) {
            oHeaders["X-CSRF-Token"] = sXSRFToken;
        }
        oHeaders.label = sFileLabel;

        return jQuery.ajax({
            url : sUrl,
            type : sMethod,
            headers : oHeaders,
            success : function(oResponse) {
                /*
                 * expected format <html><head></head><body>[statuscode]:{...}</body></html>
                 */
                var aReg = oResponse.match(new RegExp("^<html.*<body>.*((?:[0-9]*...))\]:(.*)</body></html>"));
                if (aReg && aReg.length === 3 && !isNaN(parseInt(aReg[1], 10))) {
                    var httpCode = parseInt(aReg[1], 10);
                    oResponse = {
                        responseText : aReg[2]
                    };
                    if (httpCode === 200) {
                        if (fnSuccess) {
                            fnSuccess(JSON.parse(oResponse.responseText));
                        }
                    } else {
                        if (fnError) {
                            fnError(JSON.parse(oResponse.responseText));
                        }
                    }
                    return JSON.parse(oResponse.responseText);
                } else {
                    // no message from the attachment service, maybe session timed out
                    // => write a generic error
                    if (fnError) {
                        var i18n = sap.ui.getCore().getModel("msg").getResourceBundle();
                        var sError = i18n.getText("MSG_GENERIC_ERROR", [oResponse]);
                        var oResponseObject = {
                            responseText : sError
                        };
                        oResponseObject.MESSAGES = [sError];
                        fnError(oResponseObject);
                    }
                }
            },
            error : function(oResponse) {
                if (fnError) {
                    fnError(sap.ui.ino.models.object.Attachment.parseResponse(oResponse));
                }
            },
            data : oFormData,
            cache : false,
            contentType : false,
            processData : false
        });
        
    }
    
    function uploadFile(oFile, sFilename, fnSuccess, fnError, sURL, sFileLabel) {
        var oDeferred = new jQuery.Deferred();
        sURL = sURL || sap.ui.ino.models.object.Attachment.getEndpointURL();
         ajaxCall("POST", sURL, oFile, sFilename,function(oResult) {
            oDeferred.resolve(oResult);
        }, function(oResult) {
            oDeferred.reject(oResult);
        }, sFileLabel);
        return oDeferred.promise();
    }
    
    function upload(oFile, sFilename, fnSuccess, fnError, sURL) {
        sURL = sURL || sap.ui.ino.models.object.Attachment.getEndpointURL();
        return ajaxCall("POST", sURL, oFile, sFilename, fnSuccess, fnError);
    }

    function uploadUpdate(iId, oFile, fnSuccess, fnError) {
        return ajaxCall("PUT", sap.ui.ino.models.object.Attachment.getEndpointURL() + "/" + iId, oFile, "", fnSuccess, fnError);
    }
    
    function parseUploadResponse(sResponseRaw) {
        // expected format <html><head></head><body>[statuscode]:{...}</body></html>
        var aReg = sResponseRaw.match(new RegExp("^<html.*<body>.*((?:[0-9]*...))\]:(.*)</body></html>"));
        if (aReg && aReg.length === 3 && !isNaN(parseInt(aReg[1], 10))) {
            var iStatusCode = parseInt(aReg[1], 10);
            try {
                var oResponse = JSON.parse(aReg[2]);
                var oResult = JSON.parse(aReg[2]); 
                return {
                    success : iStatusCode < 300, 
                    attachmentId : oResult.GENERATED_IDS && oResult.GENERATED_IDS[-1] || null,
                    fileName : oResult.FILE_NAME, 
                    mediaType : oResult.MEDIA_TYPE,
                    messages : oResult.MESSAGES
                };
            } catch (oException) {
                return null;
            }
        } else {
            return null;
        }
    }
    
    sap.ui.ino.models.object.Attachment.upload = upload;
    sap.ui.ino.models.object.Attachment.uploadFile = uploadFile;
    sap.ui.ino.models.object.Attachment.uploadUpdate = uploadUpdate;
    sap.ui.ino.models.object.Attachment.uploadUpdate = parseUploadResponse;
})();