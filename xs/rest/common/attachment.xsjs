var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

function getAttachmentId() {
	var queryPath = $.request.queryPath;
	if (queryPath) {
		var queryPathParts = queryPath.split("/") || [];
		if (queryPathParts.length >= 1 && !isNaN(queryPathParts[0])) {
			var id = parseInt(queryPathParts[0]);
			return id;
		}
	}
	return 0;
}

function unicodeToString(sString) {
	return sString.replace(/\\u[\dABCDEFabcdef][\dABCDEFabcdef][\dABCDEFabcdef][\dABCDEFabcdef]/g, function(sMatch) {
		return String.fromCharCode(parseInt(sMatch.replace(/\\u/g, ""), 16));
	});
}

var oMapper;

/**
 * Multipart-Request: $.request.entities contains the multi parts, $.request.body is not bound. Each part has its own
 * body with headers and content. Attachment service only respects the first multipart entity, others are ignored for
 * now
 */
if ($.request.method == $.net.http.POST || ($.request.method == $.net.http.PUT && $.request.entities && $.request.entities.length > 0)) {

	var iId = 0;
	var sFileName = null;

	oMapper = {
		requestMapper: function(oRequest) {
		    if($.request.queryPath === "rename"){
		        return JSON.parse($.request.body.asString());
		    }
			var oPayload = null;

			var data, dataSmall, dataLarge;
			var headers;

			if (oRequest.entities && oRequest.entities.length > 0) {
				if (oRequest.entities.length === 1) {
					data = oRequest.entities[0].body.asArrayBuffer();
					dataSmall = undefined;
					dataLarge = undefined;
				}
				if (oRequest.entities.length === 2) {
					data = undefined;
					dataSmall = oRequest.entities[0].body.asArrayBuffer();
					dataLarge = oRequest.entities[1].body.asArrayBuffer();
				}
				if (oRequest.entities.length === 3) {
					data = oRequest.entities[0].body.asArrayBuffer();
					dataSmall = oRequest.entities[1].body.asArrayBuffer();
					dataLarge = oRequest.entities[2].body.asArrayBuffer();
				}
				headers = oRequest.entities[0].headers;
			} else if ($.request.body === undefined) {
				data = undefined;
				headers = $.request.headers;
			} else {
				data = $.request.body.asArrayBuffer();
				headers = $.request.headers;
			}
			if (headers.length) {
				iId = getAttachmentId();
				if (!iId && $.request.method == $.net.http.POST) {
					iId = -1;
				}

				var sCustomInfo = null;
				var iFolderId = null;
				var sFileLabel = null;

				for (var i = 0; i < headers.length; i++) {
					var oHeader = headers[i];
					if (oHeader.name == "filename") {
						sFileName = oHeader.value;
					} else if (oHeader.name == "~content_filename") {
						sFileName = oHeader.value;
					} else if (oHeader.name == "unicode_filename") {
						sFileName = unicodeToString(oHeader.value);
					} else if (oHeader.name == "~content_unicode_filename") {
						sFileName = unicodeToString(oHeader.value);
					} else if (oHeader.name == "id") {
						iId = parseInt(oHeader.value);
					} else if (oHeader.name == "custom_info") {
						sCustomInfo = oHeader.value;
					} else if (oHeader.name == "folder_id") {
						iFolderId = parseInt(oHeader.value);
					}
				}
				for (var index = 0; index < $.request.headers.length; index++) {
					if ($.request.headers[index].name === "label") {
						sFileLabel = $.request.headers[index].value;
						break;
					}
				}

				oPayload = {
					ID: iId,
					DATA: data,
					DATA_SMALL: dataSmall,
					DATA_LARGE: dataLarge
				};

				if (sFileName) {
					sFileName = _.stripFilename(_.stripTags(sFileName.split(/(\\|\/)/g).pop()));
					oPayload.FILE_NAME = sFileName;
				}
				if (sCustomInfo) {
					oPayload.CUSTOM_INFO = sCustomInfo;
				}
				if (iFolderId) {
					oPayload.FOLDER_ID = iFolderId;
				}
				if (sFileLabel) {
					oPayload.LABEL = sFileLabel;
				}
			}
			return oPayload;
		},
		responseMapper: function(oResponse, sAction) {
		    if(sAction === "rename"){
		        return oResponse;
		    }
			var oResult;
			var aMessage;
			var oResultBody = JSON.parse(oResponse.body);

			if (oResponse.status === $.net.http.CREATED || oResponse.status === $.net.http.OK) {
				var AOF = $.import("sap.ino.xs.aof.core", "framework");
				var oAttachment = AOF.getApplicationObject("sap.ino.xs.object.attachment.Attachment");

				if (iId < 0 && oResultBody.GENERATED_IDS && sAction === 'create') {
					iId = oResultBody.GENERATED_IDS[iId];
				} else {
					iId = getAttachmentId();
				}

				var oInstance = oAttachment.read(iId);
				if (!oInstance.messages) {

					oResult = {
						FILE_NAME: oInstance.FILE_NAME,
						MEDIA_TYPE: oInstance.MEDIA_TYPE,
						GENERATED_IDS: oResultBody.GENERATED_IDS || {},
						MESSAGES: oResultBody.MESSAGES || []
					};

					/**
					 * UI5 (to support IE file upload) expects the result of a file upload to be a HTML file, containing
					 * the status code in the payload. Response status code is always 200 [OK]. UI 5 Reference:
					 * /demokit/#test-resources/sap/ui/commons/demokit/FileUploader.html
					 */
					oResponse.status = $.net.http.OK;
					oResponse.contentType = "text/html";
					oResponse.body = "<html><head></head><body>[200]:" + JSON.stringify(oResult) + "</body></html>";
					return oResponse;
				} else {
					aMessage = oInstance.messages;
				}
			}

			oResult = oResultBody;
			oResult.ID = iId;
			oResult.FILE_NAME = sFileName;
			oResult.MEDIA_TYPE = "";
			oResult.ERROR = true;
			oResult.MESSAGES = oResult.MESSAGES || [];
			if (aMessage) {
				oResult.MESSAGES = oResult.MESSAGES.concat(aMessage);
			}

			oResponse.status = $.net.http.OK;
			oResponse.contentType = "text/html";
			oResponse.body = "<html><head></head><body>[400]:" + JSON.stringify(oResult) + "</body></html>";
			return oResponse;
		}
	};
}

$.import("sap.ino.xs.aof.rest", "dispatcher").dispatchDefault(oMapper);