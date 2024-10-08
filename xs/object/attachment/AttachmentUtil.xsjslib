var Message = $.import("sap.ino.xs.aof.lib", "message");
var AttachmentMessage = $.import("sap.ino.xs.object.attachment", "message");
const systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

function determineFileSize(vKey, oFile, oData, sActionName, addMessage) {
	oFile.FILE_SIZE = oData ? oData.byteLength : 0;
	if (oFile.FILE_SIZE <= 0 && sActionName === "create") {
		addMessage(Message.MessageSeverity.Error, AttachmentMessage.ATTACHMENT_EMPTY_DATA, vKey, "Root", "DATA");
	}
}

function determineMediaType(vKey, oFile, oData, sFileName, addMessage, oHQ, bRepoUpload) {
	var sFileExt = null;

	// Only last path component is used for file extension
	if (sFileName && sFileName.length > 0 && sFileName.split(".").length > 0) {
		sFileExt = sFileName.split(".").pop();
	}

	if (sFileExt && sFileExt.length > 0) {

		sFileExt = sFileExt.toLowerCase();

		var iMaxSize = 0;
		var sFileSiteSelect =
			"select value from \"sap.ino.db.basis.ext::v_ext_local_system_setting\" where code = 'sap.ino.config.MAXIMUM_ALLOWED_FILE_SIZE_BYTE'";
		var aSizeResult = oHQ.statement(sFileSiteSelect).execute();
		if (aSizeResult && aSizeResult.length > 0) {
			iMaxSize = aSizeResult[0].VALUE;
		}

		var sFileExtSelect = "select media_type from \"sap.ino.db.attachment.ext::v_ext_attachment_allowed_file\" where lcase(file_ext) = ?";
		if (bRepoUpload) {
			sFileExtSelect = sFileExtSelect + " and media_type like 'image/%'";
		}
		var aResult = oHQ.statement(sFileExtSelect).execute(sFileExt);

		if (aResult && aResult.length > 0) {

			oFile.MEDIA_TYPE = aResult[0].MEDIA_TYPE;
			if (oFile.Data && oFile.Data.length > 0) {
				if (oFile.Data[0].DATA) {
					oFile.Data[0].DATA.MEDIA_TYPE = oFile.MEDIA_TYPE;
				}
			}

			if (oFile.FILE_SIZE > iMaxSize) {

				var aMeasure = ["bytes",
                                "kilobytes",
                                "megabytes",
                                "gigabytes",
                                "terabytes"];

				var iMeasureIndex = 0;
				while (iMaxSize > 1024.0 && iMeasureIndex < aMeasure.length) {
					iMaxSize = iMaxSize / 1024.0;
					iMeasureIndex++;
				}

				iMaxSize = Math.floor(iMaxSize * 100) / 100;
				addMessage(Message.MessageSeverity.Error, AttachmentMessage.ATTACHMENT_EXCEED_MAX_SIZE, vKey, "Root", "DATA", iMaxSize, aMeasure[
					iMeasureIndex], sFileExt);
			}

		} else {
			sFileExt = null;
		}

		if (!sFileExt) {
			var sAllowedExtensions = "";
			var sAllowedFileExtSelect = "select file_ext from \"sap.ino.db.attachment.ext::v_ext_attachment_allowed_file\"";
			if (bRepoUpload) {
				sAllowedFileExtSelect += " where media_type like 'image/%'";
			}
			sAllowedFileExtSelect += " order by file_ext";

			var aExtResult = oHQ.statement(sAllowedFileExtSelect).execute();
			if (aExtResult.length > 0) {
				sAllowedExtensions = _.map(aExtResult, function(oExtResult) {
					return "." + oExtResult.FILE_EXT.toLowerCase();
				}).join(", ");
			}
			addMessage(Message.MessageSeverity.Error, AttachmentMessage.ATTACHMENT_FILE_EXT_NOT_ALLOWED, vKey, "Root", "FILE_NAME",
				sAllowedExtensions);
		}
	}
}

function scanOnPremise(vKey, oData, sFileName, addMessage) {
	// Anti Virus check
	var av = new $.security.AntiVirus();
// 	if (!av.isAvailable()) {
// 		addMessage(Message.MessageSeverity.Error, AttachmentMessage.ATTACHMENT_FILE_MALICIOUS_SOFT, vKey, "Root", "FILE_NAME",
// 			"The external Anti-Virus (AV) engines doesn't install.");
// 		return true;
// 	}
	try {
		av.scan(oData, sFileName);
		return true;
	} catch (oException) {
		addMessage(Message.MessageSeverity.Error, AttachmentMessage.ATTACHMENT_FILE_MALICIOUS_CONTENT, vKey, "Root", "DATA", (oException || "").toString());
		return false;
	}
}

function scanOnBtp(vKey, oData, sFileName, addMessage) {
	var scanner = $.import("sap.ino.xs.object.attachment", "Scanner");
	if (!scanner.preCheck()) {
		addMessage(Message.MessageSeverity.Error, AttachmentMessage.ATTACHMENT_FILE_MALWARESCANNING_SERVICE_UNAVAILABLE, vKey, "Root", "DATA", "");
		return false;
	}
	var result = scanner.scan(oData);
	if (!result.success) {
		if (result.msg) {
			addMessage(Message.MessageSeverity.Error, AttachmentMessage.ATTACHMENT_FILE_MALICIOUS_CONTENT, vKey, "Root", "DATA", result.msg);
		} else {
			addMessage(Message.MessageSeverity.Error, AttachmentMessage.ATTACHMENT_FILE_MALWARESCANNING_SERVICE_ERROR, vKey, "Root", "DATA", "");
		}
		return false;
	}
	return true;
}

function antiVirusCheck(vKey, oData, sFileName, addMessage) {
	if (oData) {
		var type = systemSettings.getIniValue("virus_scanner_type");
		if (type === 1 || type === '1') {
			scanOnBtp(vKey, oData, sFileName, addMessage);
		} else {
			scanOnPremise(vKey, oData, sFileName, addMessage);
		}
	}
}