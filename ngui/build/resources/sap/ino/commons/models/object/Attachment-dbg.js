/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObject",
    "sap/ino/commons/models/core/ReadSource",
    "sap/ino/commons/application/Configuration",
    "sap/ui/unified/FileUploaderParameter",
    "sap/ino/thirdparty/jimp.min"
], function(ApplicationObject, ReadSource, Configuration, FileUploaderParameter) {
	"use strict";

	var Attachment = ApplicationObject.extend("sap.ino.commons.models.object.Attachment", {
		objectName: "sap.ino.xs.object.attachment.Attachment",
		readSource: ReadSource.getDefaultODataSource("Attachment")
	});

	function ajaxCall(sUrl, oFile, sFilename, sType, fnSuccess, fnError,sFileLabel) {
		var oFormData = new FormData();
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
		var oHeaders = {};
		oHeaders.label = sFileLabel;
		return jQuery.ajax({
			url: sUrl,
			type: sType,
			headers : oHeaders,
			success: function(oResponse) {
				var oResult = Attachment.parseUploadResponse(oResponse);
				if (jQuery.type(fnSuccess) === "function") {
					fnSuccess(oResult);
				}
			},
			error: function(oResponse) {
				if (jQuery.type(fnError) === "function") {
					fnError(oResponse);
				}
			},
			data: oFormData,
			cache: false,
			contentType: false,
			processData: false
		});
	}

	Attachment.prepareFileUploader = function(oFileUploader, aFile) {
		oFileUploader.removeAllHeaderParameters();
		var oCustomerHeaderToken = new FileUploaderParameter({
			name: "x-csrf-token",
			value: Configuration.getXSRFToken()
		});
		oFileUploader.addHeaderParameter(oCustomerHeaderToken);
		var oCustomerHeaderFilename = new FileUploaderParameter({
			name: "unicode_filename",
			value: Attachment.stringToUnicode(aFile[0].name)
		});
		oFileUploader.addHeaderParameter(oCustomerHeaderFilename);
	};

	Attachment.uploadFile = function(oFile, oSrcFile, iFileId, bCompressed) {
		var oDeferred = new jQuery.Deferred();
		var sFileName = oFile.name || oFile.type.replace(/\//g, ".");
		var sUrlPath = iFileId ? '/' + iFileId : '';
		var sUrl = Attachment.getEndpointURL() + sUrlPath;
		var sType = iFileId ? 'PUT' : 'POST';
		var bUploadSource = oSrcFile && !iFileId ? true : false;
		if(bCompressed){
    		this.compressFile(oFile, oSrcFile, bUploadSource).then(function(oData) {
    			ajaxCall(sUrl, oData, sFileName, sType, function(oResult) {
    				oDeferred.resolve(oResult);
    			}, function() {
    				oDeferred.reject();
    			});
    		}).catch(function() {
    			oDeferred.reject();
    		});
		} else {
		    ajaxCall(sUrl, oFile, sFileName, sType, function(oResult) {
				oDeferred.resolve(oResult);
			}, function() {
				oDeferred.reject();
			});
		}
		return oDeferred.promise();
	};
	Attachment.uploadFileIncludeFileLabel = function(oFile, sFileLabel, oSrcFile, iFileId, bCompressed) {
		var oDeferred = new jQuery.Deferred();
		var sFileName = oFile.name || oFile.type.replace(/\//g, ".");
		var sUrlPath = iFileId ? '/' + iFileId : '';
		var sUrl = Attachment.getEndpointURL() + sUrlPath;
		var sType = iFileId ? 'PUT' : 'POST';
		var bUploadSource = oSrcFile && !iFileId ? true : false;
		if(bCompressed){
    		this.compressFile(oFile, oSrcFile, bUploadSource).then(function(oData) {
    			ajaxCall(sUrl, oData, sFileName, sType, function(oResult) {
    				oDeferred.resolve(oResult);
    			}, function() {
    				oDeferred.reject();
    			},sFileLabel);
    		}).catch(function() {
    			oDeferred.reject();
    		});
		} else {
		    ajaxCall(sUrl, oFile, sFileName, sType, function(oResult) {
				oDeferred.resolve(oResult);
			}, function() {
				oDeferred.reject();
			},sFileLabel);
		}
		
		return oDeferred.promise();
	};
	function _getPromise(oBlob, quality) {
		return new Promise(function(resolve) {
			if (!quality) {
				resolve(oBlob);
			} else {
				try {
					if (oBlob.type.startsWith('image') && Jimp) {
						var reader = new FileReader();

						reader.onload = function() {
							var fBuffer = reader.result;
                            
						    Jimp.read(fBuffer).then(function(img) {
								var compressedImg = img;

								compressedImg = compressedImg.quality(
									quality
								);

								compressedImg
									.getBufferAsync(oBlob.type)
									.then(function(compressedBuffer) {
										var newBlob = new Blob([compressedBuffer], {
											type: oBlob.type
										});
										// assign file.name to blob
										newBlob.name = oBlob.name;

										// Sometimes the compressed image will be larger than the original size
										if (newBlob.size > oBlob.size) {
											resolve(oBlob);
										} else {
											resolve(newBlob);
										}

									});
							});

						};

						reader.readAsArrayBuffer(oBlob);

					} else {
						// no image
						resolve(oBlob);
					}
				} catch (err) {
					// compress failed, downgrade to original blob file
					// MessageToast.show('compress img failed');
					resolve(oBlob);
				}
			}

		});
	}

	Attachment.compressFile = function(oFile, oSrcFile, bUploadSource) {
		var promiseList = [];
		if(bUploadSource && oSrcFile){
		    promiseList.push(_getPromise(oSrcFile));
		}
		promiseList.push(_getPromise(oFile, 20));
		promiseList.push(_getPromise(oFile, 80));
		return Promise.all(promiseList);
	};

	Attachment.parseUploadResponse = function(sResponseRaw) {
		// expected format <html><head></head><body>[statuscode]:{...}</body></html>
		var aReg = sResponseRaw.match(new RegExp("^<html.*<body>.*((?:[0-9]*...))\]:(.*)</body></html>"));
		if (aReg && aReg.length === 3 && !isNaN(parseInt(aReg[1], 10))) {
			var iStatusCode = parseInt(aReg[1], 10);
			try {
				var oResponse = JSON.parse(aReg[2]);
				var oResult = JSON.parse(aReg[2]);
				return {
					success: iStatusCode < 300,
					attachmentId: oResult.GENERATED_IDS && oResult.GENERATED_IDS[-1] || null,
					fileName: oResult.FILE_NAME,
					mediaType: oResult.MEDIA_TYPE,
					messages: oResult.MESSAGES
				};
			} catch (oException) {
				return null;
			}
		} else {
			return null;
		}
	};

	Attachment.stringToUnicode = function(sString) {
		return sString.replace(/[\s\S]/g, function(sEscape) {
			return "\\u" + ("0000" + sEscape.charCodeAt().toString(16)).slice(-4);
		});
	};

	Attachment.unicodeToString = function(sString) {
		return sString.replace(/\\u[\dABCDEFabcdef][\dABCDEFabcdef][\dABCDEFabcdef][\dABCDEFabcdef]/g, function(sMatch) {
			return String.fromCharCode(parseInt(sMatch.replace(/\\u/g, ""), 16));
		});
	};

	return Attachment;
});