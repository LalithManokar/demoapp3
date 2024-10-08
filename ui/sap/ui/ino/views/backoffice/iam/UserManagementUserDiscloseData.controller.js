/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
jQuery.sap.require("sap.ui.ino.views.common.TableExport");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
var TableExport = sap.ui.ino.views.common.TableExport;
var CatagoryType = {
	campaign: "CAMPAIGN",
	idea: "IDEA",
	blog: "BLOG",
	campaigncomment: "CAMP_COMMENT",
	ideacomment: "IDEA_COMMENT",
	reward: "REWARD",
	evaluation: "EVAL",
	tag: "TAG",
	wall: "WALL"
};
sap.ui.controller("sap.ui.ino.views.backoffice.iam.UserManagementUserDiscloseData", jQuery.extend({},
	sap.ui.ino.views.common.FacetAOController, {
		bindingData: function(oTreeTable) {
			var oBinding = {
				path: this.getFormatterPath("UserDiscloseData", true),
				parameters: {
					arrayNames: ["children"],
					countMode: 'Inline'
				}
			};
			oTreeTable.bindRows(oBinding);
		},
		onNavigateTo: function(sType, sName, sId, sCorrObjectName, sCorrObjectId) {
			var sPath = "";
			if (sType === CatagoryType.campaign) {
				if (!sId) {
					return;
				}
				sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow(
					"campaign", {
						id: sId,
						edit: false
					});
			}
			if (sType === CatagoryType.blog) {
				if (!sId) {
					return;
				}
				sap.ui.ino.application.ApplicationBase.getApplication().
				navigateToExternal('sap.ino.config.URL_PATH_UI_FRONTOFFICE', '/blog', sId);
			}
			if (sType === CatagoryType.campaigncomment) {
				if (!sCorrObjectId) {
					return;
				}
				sPath = sCorrObjectId + "/comment";
				sap.ui.ino.application.ApplicationBase.getApplication().
				navigateToExternal('sap.ino.config.URL_PATH_UI_FRONTOFFICE', '/campaign', sPath);
			}
			if (sType === CatagoryType.idea) {
				if (!sId) {
					return;
				}
				sap.ui.ino.application.ApplicationBase.getApplication().
				navigateToExternal('sap.ino.config.URL_PATH_UI_FRONTOFFICE', 'idea', sId);
			}
			if (sType === CatagoryType.reward) {
				if (!sCorrObjectId) {
					return;
				}
				sPath = sCorrObjectId + "/?section=sectionRewards";
				sap.ui.ino.application.ApplicationBase.getApplication().navigateToExternal('sap.ino.config.URL_PATH_UI_FRONTOFFICE', 'idea', sPath);
			}
			if (sType === CatagoryType.evaluation) {
				if (!sCorrObjectId) {
					return;
				}
				sPath = sCorrObjectId + "/?section=sectionEvaluations";
				sap.ui.ino.application.ApplicationBase.getApplication().navigateToExternal('sap.ino.config.URL_PATH_UI_FRONTOFFICE', 'idea', sPath);
			}
			if (sType === CatagoryType.ideacomment) {
				if (!sCorrObjectId) {
					return;
				}
				sPath = sCorrObjectId + "/?section=sectionComments";
				sap.ui.ino.application.ApplicationBase.getApplication().navigateToExternal('sap.ino.config.URL_PATH_UI_FRONTOFFICE', 'idea', sPath);
			}
			if (sType === CatagoryType.wall) {
				if (!sId) {
					return;
				}
				sap.ui.ino.application.ApplicationBase.getApplication().
				navigateToExternal('sap.ino.config.URL_PATH_UI_FRONTOFFICE', '/wall', sId);
			}
		},
		onDownloadData: function(oEvent) {
			var that = this;
			var oView = that.getView();
			var oMenuItem = oEvent.getParameter("item");
			var sFormat = oMenuItem.getCustomData()[0].getValue();

			var oReadyData = this.getModel().oData.UserDisCloseDataDownload;
			var oExportData = {
				headers: [oView.getText("BO_IDENT_DISCLOSE_DATA_FILE_DWN_TYPE"),
				          oView.getText("BO_IDENT_DISCLOSE_DATA_FILE_DWN_ID"),
				          oView.getText("BO_IDENT_DISCLOSE_DATA_FILE_DWN_NAME")],
				rows: []
			};
			for (var i = 0; i < oReadyData.length; i++) {
				var oRow = {
					cells: []
				};
				var j = 0;
				for (j = 0; j < 3; j++) {
					var oCell = {
						header: oExportData.headers[j]
					};
					switch (j) {
						case 0:
							oCell.content = oReadyData[i].type;
							oCell.contentRaw = oReadyData[i].type;
							oCell.type = "String";
							break;
						case 1:
							oCell.content = oReadyData[i].id.toString();
							oCell.contentRaw = oReadyData[i].id.toString();
							oCell.type = "String";
							break;
						case 2:
							if (!oReadyData[i].name) {
								oCell.content = "";
								oCell.contentRaw = "";
							} else {
								oCell.content = oReadyData[i].name;
								oCell.contentRaw = oReadyData[i].name;
							}
							oCell.type = "String";
							break;
					}
					oRow.cells.push(oCell);
				}
				oExportData.rows.push(oRow);
			}
			var FORMAT_CSV = "csv";
			var CHARSET_UTF8 = "utf-8";
			var MIME_TYPE_CSV = "text/csv";
			var MIME_TYPE_XLS = "application/vnd.ms-excel";
			var sMimeType = sFormat == FORMAT_CSV ? MIME_TYPE_CSV : MIME_TYPE_XLS;
			var sCharset = sFormat == FORMAT_CSV ? CHARSET_UTF8 : "";
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd-MM-yyyy_HH-mm"
			});
			var sFileName = oView.getText("BO_IDENT_DISCLOSE_DATA_FILE_PREFIX"),
				sAuthor = sap.ui.ino.application.ApplicationBase.getApplication().getCurrentUserName(),
				sPrefix;
			sFileName += "_" + oDateFormat.format(new Date());
			sFileName += "." + sFormat;
			var sExportData = TableExport._convertToFormat(oExportData, sFormat, sFileName, sAuthor, sPrefix);
			if (TableExport._oBrowser.name !== TableExport._oBrowser.BROWSER.INTERNET_EXPLORER) {
				TableExport._downloadContent(sExportData, sFileName, sMimeType, sCharset);
			} else {
				TableExport._showIEInstructionPopup(function() {
					TableExport._saveContent(sExportData, sFileName, sMimeType, sCharset);
				}, function() {}, sFormat);
			}

		}
	}));