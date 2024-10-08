/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.object.MailTemplateStage");

(function() {
	"use strict";
	jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
	jQuery.sap.require("sap.ui.ino.models.core.ReadSource");
	jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
	jQuery.sap.require("sap.ui.ino.application.Configuration");
	var Configuration = sap.ui.ino.application.Configuration;

	sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.MailTemplateStage", {
		objectName: "sap.ino.xs.object.notification.MailTemplateStage",
		readSource: sap.ui.ino.models.core.ReadSource.getDefaultODataSource("StagingMailTemplate"),
		invalidation: {
			entitySets: ["StagingMailTemplate", "StagingMailTemplateSearch"]
		},
		determinations: {
			onCreate: function(oDefaultData, objectInstance) {
				var oInitialTemplateData = {
					"PLAIN_CODE": "",
					"DEFAULT_TEXT": "",
					"DEFAULT_LONG_TEXT": "",
					MailTemplateText: []
				};

				_mergeLanguageTexts(oInitialTemplateData, objectInstance);

				return oInitialTemplateData;
			},
			onRead: _onRead,
			onNormalizeData: _replaceURL
		},
		validateHTML: function(iId) {
			var aMessage = [];
			jQuery.each(this.getData().MailTemplateText, function(i, oMailTemplateText) {
				if (iId && oMailTemplateText.ID !== iId) {
					return;
				}
				var aCodes = sap.ui.ino.models.core.CodeModel.getCodes("sap.ino.xs.object.basis.Language.Root", function(oLanguage) {
					return oLanguage.ISO_CODE === oMailTemplateText.LANG;
				});
				var oMessage = {
					"TYPE": "E",
					"MESSAGE": "MSG_MAIL_TEMPLATE_INVALID_HTML",
					"REF_ID": oMailTemplateText.ID,
					"REF_NODE": "MailTemplateText",
					"REF_FIELD": "TEMPLATE",
					"PARAMETERS": [this.getData().DEFAULT, "{code>sap.ino.xs.object.basis.Language.Root:" + aCodes[0].CODE + "}"]
				};
				try {
					// Validate HTML
					var aResult = new jQuery(oMailTemplateText.TEMPLATE);
					if (!aResult || aResult.length === 0) {
						aMessage.push(oMessage);
					}
				} catch (e) {
					aMessage.push(oMessage);
				}
			});
			return aMessage;
		}
	});

	function _mergeLanguageTexts(oData, objectInstance) {
		var aExistingMailTemplateText = oData.MailTemplateText;
		var aCodes = sap.ui.ino.models.core.CodeModel.getCodes("sap.ino.xs.object.basis.Language.Root", function(oLanguage) {
			var aFound = jQuery.grep(aExistingMailTemplateText, function(oMailTemplateText) {
				return oMailTemplateText.LANG === oLanguage.ISO_CODE;
			});
			// only take currently unused language codes
			return aFound.length === 0;
		});

		var aInitialMailTemplateText = jQuery.map(aCodes, function(oLanguageCode) {
			return {
				LANG: oLanguageCode.ISO_CODE,
				ID: objectInstance.getNextHandle(),
				TEMPLATE: ""
			};
		});

		oData.MailTemplateText = oData.MailTemplateText.concat(aInitialMailTemplateText);

		return oData;
	}

	function _replaceCID(oData) {
		var aAttachments = [];

		var oModel = sap.ui.getCore().getModel();
		oModel.read("/RepositoryAttachment", null, null, false,
			function(oResult) {
				aAttachments = oResult.results;
			}
		);

		jQuery.each(oData.MailTemplateText, function(iIndex, oTemplateText) {
			jQuery.each(aAttachments, function(iIndex, oAttachment) {
				var sCID = "cid:" + oAttachment.PATH.substring(oAttachment.PATH.lastIndexOf("/") + 1, oAttachment.PATH.lastIndexOf(".")).toUpperCase();
				var oCIDReg = new RegExp('(?!<img[^>]+src=")(?:' + sCID + ')(?=".+\/>)', 'ig');
				oTemplateText.TEMPLATE = oTemplateText.TEMPLATE.replace(
					oCIDReg,
					Configuration.getBackendRootURL() + "/" + oAttachment.PATH
				);
			});
		});
		return oData;
	}

	function _onRead(oData, objectInstance) {
		oData = _replaceCID(oData);
		return _mergeLanguageTexts(oData, objectInstance);
	}

	function _replaceURL(oData) {
		if (!oData.MailTemplateText) {
			return oData;
		}
		jQuery.each(oData.MailTemplateText, function(iIndex, oTemplateText) {
			var aProperties = sap.ui.getCore().getModel().getProperty("/");
			var oRegexp = new RegExp("^RepositoryAttachment.*");

			jQuery.each(aProperties, function(sKey) {
				if (oRegexp.test(sKey)) {
					var oProperty = aProperties[sKey];
					var sCID = "cid:" + oProperty.PATH.substring(oProperty.PATH.lastIndexOf("/") + 1, oProperty.PATH.lastIndexOf(".")).toUpperCase();
					oTemplateText.TEMPLATE = oTemplateText.TEMPLATE.replace(
						Configuration.getBackendRootURL() + "/" + oProperty.PATH,
						sCID
					);
				}
			});
		});
		oData.MailTemplateText = jQuery.grep(oData.MailTemplateText, function(oMailTemplateText) {
			return oMailTemplateText.TEMPLATE !== "";
		});
		return oData;
	}
})();