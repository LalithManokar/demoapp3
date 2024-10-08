//provide some functions to export_idea.xsjs service
var exportPPT = $.import("sap.ino.xs.xslib", "exportPPT");
const Mail = $.import("sap.ino.xs.xslib", "mail");
var SystemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
const TextBundle = $.import("sap.ino.xs.xslib", "textBundle");
const htmlEntityDecode = $.import("sap.ino.xs.xslib", "htmlEntityDecode");

var AOF = $.import("sap.ino.xs.aof.core", "framework");
const ohQuery = $.import("sap.ino.xs.xslib", "hQuery");
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var Auth = $.import("sap.ino.xs.aof.core", "authorization");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var oHQ = ohQuery.hQuery(oConn).setSchema("SAP_INO");
const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");

var FORMAT_CSV = "csv";
var FORMAT_XLS = "xls";
var FORMAT_TXT = "txt";
var FORMAT_XML = "xml";
var FORMAT_PPTX = "pptx";

function hex(iChar, iLength) {
	var sHex = iChar.toString(16);
	if (iLength) {
		while (iLength > sHex.length) {
			sHex = "0" + sHex;
		}
	}
	return sHex;
}

var rHtml =
	/[\x00-\x2b\x2f\x3a-\x40\x5b-\x5e\x60\x7b-\xff\u2028\u2029\u002d\u0022\u0026\u0027\u003C\u003E\u00A0\u00A1\u00A2\u00A3\u00A4\u00A5\u00A6\u00A7\u00A8\u00A9\u00AA\u00AB\u00AC\u00AD\u00AE\u00AF\u00B0\u00B1\u00B2\u00B3\u00B4\u00B5\u00B6\u00B7\u00B8\u00B9\u00BA\u00BB\u00BC\u00BD\u00BE\u00BF\u00C0\u00C1\u00C2\u00C3\u00C4\u00C5\u00C6\u00C7\u00C8\u00C9\u00CA\u00CB\u00CC\u00CD\u00CE\u00CF\u00D0\u00D1\u00D2\u00D3\u00D4\u00D5\u00D6\u00D7\u00D8\u00D9\u00DA\u00DB\u00DC\u00DD\u00DE\u00DF\u00E0\u00E1\u00E2\u00E3\u00E4\u00E5\u00E6\u00E7\u00E8\u00E9\u00EA\u00EB\u00EC\u00ED\u00EE\u00EF\u00F0\u00F1\u00F2\u00F3\u00F4\u00F5\u00F6\u00F7\u00F8\u00F9\u00FA\u00FB\u00FC\u00FD\u00FE\u00FF\u0152\u0153\u0160\u0161\u0178\u0192\u02C6\u02DC\u0391\u0392\u0393\u0394\u0395\u0396\u0397\u0398\u0399\u039A\u039B\u039C\u039D\u039E\u039F\u03A0\u03A1\u03A3\u03A4\u03A5\u03A6\u03A7\u03A8\u03A9\u03B1\u03B2\u03B3\u03B4\u03B5\u03B6\u03B7\u03B8\u03B9\u03BA\u03BB\u03BC\u03BD\u03BE\u03BF\u03C0\u03C1\u03C2\u03C3\u03C4\u03C5\u03C6\u03C7\u03C8\u03C9\u03D1\u03D2\u03D6\u2002\u2003\u2009\u200C\u200D\u200E\u200F\u2013\u2014\u2018\u2019\u201A\u201C\u201D\u201E\u2020\u2021\u2022\u2026\u2030\u2032\u2033\u2039\u203A\u203E\u2044\u20AC\u2111\u2118\u211C\u2122\u2135\u2190\u2191\u2192\u2193\u2194\u21B5\u21D0\u21D1\u21D2\u21D3\u21D4\u2200\u2202\u2203\u2205\u2207\u2208\u2209\u220B\u220F\u2211\u2212\u2217\u221A\u221D\u221E\u2220\u2227\u2228\u2229\u222A\u222B\u2234\u223C\u2245\u2248\u2260\u2261\u2264\u2265\u2282\u2283\u2284\u2286\u2287\u2295\u2297\u22A5\u22C5\u2308\u2309\u230A\u230B\u2329\u232A\u25CA\u2660\u2663\u2665\u2666]/g,
	rHtmlReplace = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/,
	mHtmlLookup = {
		"<": "&lt;",
		">": "&gt;",
		"&": "&amp;",
		"\"": "&quot;"
	};

var fHtml = function(sChar) {
	var sEncoded = mHtmlLookup[sChar];
	if (!sEncoded) {
		if (rHtmlReplace.test(sChar)) {
			sEncoded = "&#xfffd;";
		} else {
			sEncoded = "&#x" + hex(sChar.charCodeAt(0)) + ";";
		}
		mHtmlLookup[sChar] = sEncoded;
	}
	return sEncoded;
};

function encodeXML(sString) {
	// 	return sString.replace(rHtml, fHtml);
	//return htmlEntityDecode.decode(sString).replace(rHtml, fHtml);
	//  return sString;
	if (!sString) {
		return "";
	}
	sString = htmlEntityDecode.decode(sString);
	var aResult = [];
	for (var index = 0; index < sString.length; index++) {
		var sChar = sString.charAt(index);
		var sEncoded = mHtmlLookup[sChar];
		if (!sEncoded) {
			if (rHtmlReplace.test(sChar)) {
				sEncoded = "&#xfffd;";
			} else {
				sEncoded = "&#x" + hex(sString.charCodeAt(index)) + ";";
			}
		}
		aResult.push(sEncoded);
	}
	return aResult.join("");
}

function findFieldValue(oHeader, aFieldsValue) {
	var oFieldValue = _.find(aFieldsValue, function(oValue) {
		return oValue.FIELD_CODE === oHeader.FIELD_CODE;
	});
	return oFieldValue;
}

function formatFieldValue(oFieldValue){
    if(!oFieldValue || !oFieldValue.FIELD_VALUE)
    {
        return "";
    }
    return _.stripTags((oFieldValue.FIELD_VALUE || "") + "").substring(0, 2000);
}

function _getText(objectName, textId) {

	// 	var aTextBundle = oHQ.statement('select CONTENT from "sap.ino.db.basis::v_resolved_text" where OBJECT_NAME = ? and TEXT_ID = ?').execute(
	// 		objectName, textId);

	// 	if (aTextBundle.length === 0) {
	// 		return;
	// 	}

	// 	return aTextBundle[0].CONTENT;
	var aTextBundle = TextBundle.getText(objectName, textId, null);
	if (aTextBundle.length === 0) {
		return;
	}
	return aTextBundle;
}

function _convertToFormatCSV(oExportData, sFilename, sAuthor, oExportIdeaFormObject, aIdeasMetadata) {
	var oZip = new $.util.Zip();

	_.each(oExportData, function(oCampaignIdeas) {
		var csv = ["\uFEFF"];
		var sCampaignName = oCampaignIdeas.rows[0].CAMPAIGN_NAME;
		var sCampaignID = oCampaignIdeas.rows[0].CAMPAIGN_ID;

		for (var i = 0; i < oCampaignIdeas.headers.length; i++) {
			var sHeader = oCampaignIdeas.headers[i].COLUMN_TITLE;
			if (oCampaignIdeas.headers[i].COLUMN_NAME === 'NAME') {
				csv.push(sHeader);
			} else {
				csv.push('"' + sHeader + '"');
			}
			csv.push(",");
		}

		csv.push("\r");

		for (i = 0; i < oCampaignIdeas.rows.length; i++) {
			var oRow = oCampaignIdeas.rows[i];
			for (var j = 0; j < oCampaignIdeas.headers.length; j++) {
				var oHeader = oCampaignIdeas.headers[j];
				if (oHeader.DATA_TYPE_NAME === "FIELDS") {
					var oFieldValue = findFieldValue(oHeader, oRow.FieldsValue);

					if (oFieldValue && oFieldValue.FIELD_VALUE) {
						csv.push('"' + formatFieldValue(oFieldValue).replace(/"/g, '""') + '"');
					} else {
						csv.push('');
					}
				} else if (oHeader.DATA_TYPE_NAME === "RESPONSIBILITY") {
					if (oHeader.COLUMN_NAME == oRow.RESP_NAME && oRow.RESP_VALUE_NAME) {
						csv.push('"' + oRow.RESP_VALUE_NAME.replace(/"/g, '""') + '"');
					} else {
						csv.push('');
					}
				} else {
					var oValue;

					switch (oHeader.COLUMN_NAME) {
						case 'STATUS':
							oValue = _getText("t_status", oRow[oHeader.COLUMN_NAME]);
							break;
						case 'PHASE':
							oValue = _getText("t_phase", oRow[oHeader.COLUMN_NAME]);
							break;
						case 'DESCRIPTION':
							oValue = _.stripTags(oRow[oCampaignIdeas.headers[j].COLUMN_NAME] || "").substring(0, 2000);
							break;
						default:
							oValue = oRow[oHeader.COLUMN_NAME];
					}

					oValue = typeof(oValue) === "string" ? oValue.replace(/=/, " =") : oValue;
					oValue = typeof(oValue) === "string" ? oValue.replace(/"/g, '""') : oValue;
					oValue = typeof(oValue) === "string" ? htmlEntityDecode.decode(oValue) : oValue;
					if (oValue) {
						csv.push('"' + oValue + '"');
					} else {
						csv.push('');
					}
				}
				csv.push(",");
			}
			csv.push("\r");
		}

		sCampaignName = (sCampaignName || sCampaignID).toString().replace(/[\/\:\*\?"<>\|]/, "");
		oZip[sCampaignName + "." + FORMAT_CSV] = csv.join("");
	});

	var oFormFieldsData = prepareFormFieldsData(oExportIdeaFormObject, aIdeasMetadata);
	generateCSVforFormFields(oFormFieldsData, oZip);

	return oZip.asArrayBuffer();
}

function _convertToFormatXLS(oExportData, sFilename, sAuthor, oExportIdeaFormObject, aIdeasMetadata) {
	var xls = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>" +
		"<Workbook xmlns=\"urn:schemas-microsoft-com:office:spreadsheet\" " +
		"xmlns:o=\"urn:schemas-microsoft-com:office:office\" " +
		"xmlns:x=\"urn:schemas-microsoft-com:office:excel\" " +
		"xmlns:ss=\"urn:schemas-microsoft-com:office:spreadsheet\" " +
		"xmlns:html=\"http://www.w3.org/TR/REC-html40\">" +
		"<DocumentProperties xmlns=\"urn:schemas-microsoft-com:office:office\">" +
		"<LastAuthor>" +
		encodeXML(sAuthor ? sAuthor : "Microsoft Office User") +
		"</LastAuthor>" +
		"<Created>" +
		new Date().toISOString() +
		"</Created>" +
		"<Version>14.0</Version>" +
		"</DocumentProperties>" +
		"<OfficeDocumentSettings xmlns=\"urn:schemas-microsoft-com:office:office\">" +
		"<AllowPNG/>" +
		"</OfficeDocumentSettings>" +
		"<ExcelWorkbook xmlns=\"urn:schemas-microsoft-com:office:excel\">" +
		"<WindowHeight>10300</WindowHeight>" +
		"<WindowWidth>25720</WindowWidth>" +
		"<WindowTopX>900</WindowTopX>" +
		"<WindowTopY>100</WindowTopY>" +
		"<ProtectStructure>False</ProtectStructure>" +
		"<ProtectWindows>False</ProtectWindows>" +
		"</ExcelWorkbook>" +
		"<Styles>" +
		"<Style ss:ID=\"Default\" ss:Name=\"Normal\">" +
		"<Alignment ss:Vertical=\"Bottom\"/>" +
		"<Borders/>" +
		"<Font ss:FontName=\"Calibri\" ss:Size=\"12\" ss:Color=\"#000000\"/>" +
		"<Interior/>" +
		"<NumberFormat/>" +
		"<Protection/>" +
		"</Style>" +
		"<Style ss:ID=\"s62\">" +
		"<Font ss:FontName=\"Calibri\" ss:Size=\"12\" ss:Color=\"#000000\" ss:Bold=\"1\"/>" +
		"</Style>" +
		"<Style ss:ID=\"s63\">" +
		"<NumberFormat ss:Format=\"Short Date\"/>" +
		"</Style>" +
		"<Style ss:ID=\"s64\">" +
		"<NumberFormat ss:Format=\"Fixed\"/>" +
		"</Style>" +
		"<Style ss:ID=\"s65\">" +
		"<NumberFormat ss:Format=\"0\"/>" +
		"</Style>" +
		"<Style ss:ID=\"s66\" ss:Name=\"Hyperlink\">" +
		"<Font ss:FontName=\"Calibri\" x:Family=\"Swiss\" ss:Size=\"11\" ss:Color=\"#0563C1\" ss:Underline=\"Single\"/>" +
		"</Style>" +
		"</Styles>";
	var sheetName;
	_.each(oExportData, function(oCampaignIdeas) {
		if (!oCampaignIdeas.rows[0].CAMPAIGN_NAME) {
			sheetName = " ";
		} else {
			sheetName = "(" + oCampaignIdeas.rows[0].CAMPAIGN_ID + ")" + oCampaignIdeas.rows[0].CAMPAIGN_NAME;
		}
		sheetName = sheetName.replace(/[:|\\|/|\?|\*|\[|\]]/gim, "").substr(0, 29);
		xls += "<Worksheet ss:Name=\"" +
			encodeXML(sheetName) + "\">" +
			"<Names>" +
			"<NamedRange ss:Name=\"_FilterDatabase\" ss:RefersTo=\"=Export!R1C1:R1C" + oCampaignIdeas.headers.length + "\" ss:Hidden=\"1\"/>" +
			"</Names>" +
			"<Table ss:ExpandedColumnCount=\"" + oCampaignIdeas.headers.length + "\" ss:ExpandedRowCount=\"" + (oCampaignIdeas.rows.length + 1) +
			"\" " +
			"x:FullColumns=\"1\" x:FullRows=\"1\" ss:DefaultColumnWidth=\"150\" ss:DefaultRowHeight=\"15\">";

		xls += "<Row ss:AutoFitHeight=\"0\">";
		for (var i = 0; i < oCampaignIdeas.headers.length; i++) {
			var sHeader = oCampaignIdeas.headers[i].COLUMN_TITLE;
			xls += "<Cell ss:StyleID=\"s62\"><Data ss:Type=\"String\">" + encodeXML(sHeader) +
				"</Data><NamedCell ss:Name=\"_FilterDatabase\"/></Cell>";
		}
		xls += "</Row>";

		var sCampaigntUrl = SystemSettings.getIniValue('host', oHQ) + '/' +
			SystemSettings.getValue('sap.ino.config.URL_PATH_UI_FRONTOFFICE_CAMPAIGN', oHQ) + '/' +
			oCampaignIdeas.rows[0].CAMPAIGN_ID;

		for (i = 0; i < oCampaignIdeas.rows.length; i++) {
			var sIdeaUrl = SystemSettings.getIniValue('host', oHQ) + '/' +
				SystemSettings.getValue('sap.ino.config.URL_PATH_UI_FRONTOFFICE_IDEA', oHQ) + '/' +
				oCampaignIdeas.rows[i].ID;
			var sReferenceUrl = oCampaignIdeas.rows[i].REFERENCE_URL;

			var oRow = oCampaignIdeas.rows[i];
			xls += "<Row ss:AutoFitHeight=\"0\">";
			for (var j = 0; j < oCampaignIdeas.headers.length; j++) {
				var sType = "String";
				var sContent;
				var sStyle = "";
				var sHRef = "";

				switch (oCampaignIdeas.headers[j].COLUMN_NAME) {
					case 'STATUS':
						sContent = _getText("t_status", oRow[oCampaignIdeas.headers[j].COLUMN_NAME]);
						break;
					case 'PHASE':
						sContent = _getText("t_phase", oRow[oCampaignIdeas.headers[j].COLUMN_NAME]);
						break;
					case 'DESCRIPTION':
						sContent = _.stripTags(oRow[oCampaignIdeas.headers[j].COLUMN_NAME] || "").substring(0, 2000);
						break;
					default:
						sContent = oRow[oCampaignIdeas.headers[j].COLUMN_NAME] || "";
				}

				switch (oCampaignIdeas.headers[j].DATA_TYPE_NAME) {
					case 'TIMESTAMP':
						sType = "DateTime";
						if (sContent[sContent.length - 1] == "Z") {
							sContent = sContent.substring(0, sContent.length - 1);
						}
						sStyle = " ss:StyleID=\"s63\"";
						break;
					case 'DOUBLE':
						sType = "Number";
						sStyle = " ss:StyleID=\"s64\"";
						break;
					case 'INTEGER':
						sType = "Number";
						sStyle = " ss:StyleID=\"s65\"";
						break;
					case 'TINYINT':
						sType = "Boolean";
						sContent = sContent ? 1 : 0;
						break;
					case 'RESPONSIBILITY':
						if (oCampaignIdeas.headers[j].COLUMN_NAME == oRow.RESP_NAME && oRow.RESP_VALUE_NAME) {
							sContent = oRow.RESP_VALUE_NAME;
						}
						break;
					case 'FIELDS':
						var oFieldValue = findFieldValue(oCampaignIdeas.headers[j], oRow.FieldsValue);

						if (oFieldValue && oFieldValue.FIELD_VALUE) {
							sContent = formatFieldValue(oFieldValue);
						}
						break;
					default:
						if (oCampaignIdeas.headers[j].COLUMN_NAME === 'CAMPAIGN_NAME') {
							sStyle = " ss:StyleID=\"s66\"";
							sHRef = " ss:HRef=\"" + sCampaigntUrl + "\"";
						} else if (oCampaignIdeas.headers[j].COLUMN_NAME === 'NAME') {
							sStyle = " ss:StyleID=\"s66\"";
							sHRef = " ss:HRef=\"" + sIdeaUrl + "\"";
						} else if (oCampaignIdeas.headers[j].COLUMN_NAME === 'REFERENCE_LABEL') {
							sStyle = " ss:StyleID=\"s66\"";
							sHRef = " ss:HRef=\"" + sReferenceUrl + "\"";
						}
				}

				if (sType === "String") {
					if (sContent.indexOf("=") === 0) {
						sContent = sContent.replace(/=/, " =");
					}
					sContent = encodeXML(sContent);
				}

				xls += "<Cell" + sStyle + sHRef + "><Data ss:Type=\"" + sType + "\">" + sContent + "</Data></Cell>";
			}
			xls += "</Row>";
		}

		xls += "</Table>" +
			"<WorksheetOptions xmlns=\"urn:schemas-microsoft-com:office:excel\">" +
			"<PageSetup>" +
			"<Header x:Margin=\"0.3\"/>" +
			"<Footer x:Margin=\"0.3\"/>" +
			"<PageMargins x:Bottom=\"0.75\" x:Left=\"0.7\" x:Right=\"0.7\" x:Top=\"0.75\"/>" +
			"</PageSetup>" +
			"<Unsynced/>" +
			"<PageLayoutZoom>0</PageLayoutZoom>" +
			"<Selected/>" +
			"<FreezePanes/>" +
			"<FrozenNoSplit/>" +
			"<SplitHorizontal>1</SplitHorizontal>" +
			"<TopRowBottomPane>1</TopRowBottomPane>" +
			"<ActivePane>2</ActivePane>" +
			"<Panes>" +
			"<Pane><Number>3</Number></Pane>" +
			"<Pane><Number>2</Number><ActiveRow>1</ActiveRow></Pane>" +
			"</Panes>" +
			"<ProtectObjects>False</ProtectObjects>" +
			"<ProtectScenarios>False</ProtectScenarios>" +
			"</WorksheetOptions>" +
			"<AutoFilter xmlns=\"urn:schemas-microsoft-com:office:excel\" x:Range=\"R1C1:R1C" + oCampaignIdeas.headers.length + "\"/>" +
			"</Worksheet>";
	});

	var oFormFieldsData = prepareFormFieldsData(oExportIdeaFormObject, aIdeasMetadata);
	xls += generateSheetDetail(oFormFieldsData);
	xls += "</Workbook>";

	return xls;
}

function prepareFormFieldsData(ideaObjects, aIdeasMetadata) {
	var oIdeaGroups = [],
		aIdeaForms = [];
	var oExportData = {};

	var oIdeaFormGroups = _.groupBy(ideaObjects.ideaFormIdeas, 'IDEA_FORM_CODE');
	var oIdeaAdminFormGroups = _.groupBy(ideaObjects.adminFormIdeas, 'ADMIN_FORM_CODE');
	//Collect Data    
	collectFormData(oExportData, oIdeaFormGroups, aIdeasMetadata,false);
	collectFormData(oExportData, oIdeaAdminFormGroups, aIdeasMetadata,true);

	return oExportData;

}

function collectFormData(oExportData, oIdeaFormGroups, aIdeasMetadata,bAdminForms) {
	_.each(oIdeaFormGroups, function(aIdeas, formCode) {
		oExportData[formCode] = {};
		oExportData[formCode].headers = _.copyDeep(aIdeasMetadata.OT_COLUMN_METADATA);
        oExportData[formCode].formName = bAdminForms ? "AF-" : "CF-";
		var aFormFileds = getFieldsFromFormCode(formCode);
		if (aFormFileds.length > 0) {
			oExportData[formCode].formName += aFormFileds[0].FORM_NAME;
		}
		_.each(aFormFileds, function(oField) {
			oExportData[formCode].headers.push({
				COLUMN_NAME: oField.DEFAULT_TEXT,
				COLUMN_TITLE: oField.DEFAULT_TEXT,
				FIELD_CODE: oField.CODE,
				DATA_TYPE_NAME: "FIELDS"
			});
		});

		oExportData[formCode].headers.push({
			COLUMN_NAME: "RESPONSIBILITY",
			COLUMN_TITLE: TextBundle.getText("t_idea_export_fields", "EXPORT_RESPONSIBILITY"),
			DATA_TYPE_NAME: "RESPONSIBILITY"
		});
		oExportData[formCode].headers.push({
			COLUMN_NAME: "RESPONSIBILITY_VALUE",
			COLUMN_TITLE: TextBundle.getText("t_idea_export_fields", "EXPORT_RESPONSIBILITY_VALUE"),
			DATA_TYPE_NAME: "RESPONSIBILITY_VALUE"
		});
		oExportData[formCode].rows = aIdeas;
	});
}

function generateSheetDetail(oExportData) {
	var sheetName;
	var xls = "";
	_.each(oExportData, function(oCampaignIdeas) {
		if (!oCampaignIdeas.formName) {
			sheetName = " ";
		} else {
			sheetName = oCampaignIdeas.formName; // + oCampaignIdeas.rows[0].CAMPAIGN_NAME;
		}
		sheetName = sheetName.replace(/[:|\\|/|\?|\*|\[|\]]/gim, "").substr(0, 29);
		xls += "<Worksheet ss:Name=\"" +
			encodeXML(sheetName) + "\">" +
			"<Names>" +
			"<NamedRange ss:Name=\"_FilterDatabase\" ss:RefersTo=\"=Export!R1C1:R1C" + oCampaignIdeas.headers.length + "\" ss:Hidden=\"1\"/>" +
			"</Names>" +
			"<Table ss:ExpandedColumnCount=\"" + oCampaignIdeas.headers.length + "\" ss:ExpandedRowCount=\"" + (oCampaignIdeas.rows.length + 1) +
			"\" " +
			"x:FullColumns=\"1\" x:FullRows=\"1\" ss:DefaultColumnWidth=\"150\" ss:DefaultRowHeight=\"15\">";

		xls += "<Row ss:AutoFitHeight=\"0\">";
		for (var i = 0; i < oCampaignIdeas.headers.length; i++) {
			var sHeader = oCampaignIdeas.headers[i].COLUMN_TITLE;
			xls += "<Cell ss:StyleID=\"s62\"><Data ss:Type=\"String\">" + encodeXML(sHeader) +
				"</Data><NamedCell ss:Name=\"_FilterDatabase\"/></Cell>";
		}
		xls += "</Row>";

		var sCampaigntUrl = SystemSettings.getIniValue('host', oHQ) + '/' +
			SystemSettings.getValue('sap.ino.config.URL_PATH_UI_FRONTOFFICE_CAMPAIGN', oHQ) + '/' +
			oCampaignIdeas.rows[0].CAMPAIGN_ID;

		for (i = 0; i < oCampaignIdeas.rows.length; i++) {
			var sIdeaUrl = SystemSettings.getIniValue('host', oHQ) + '/' +
				SystemSettings.getValue('sap.ino.config.URL_PATH_UI_FRONTOFFICE_IDEA', oHQ) + '/' +
				oCampaignIdeas.rows[i].ID;
			var sReferenceUrl = oCampaignIdeas.rows[i].REFERENCE_URL;

			var oRow = oCampaignIdeas.rows[i];
			xls += "<Row ss:AutoFitHeight=\"0\">";
			for (var j = 0; j < oCampaignIdeas.headers.length; j++) {
				var sType = "String";
				var sContent;
				var sStyle = "";
				var sHRef = "";

				switch (oCampaignIdeas.headers[j].COLUMN_NAME) {
					case 'STATUS':
						sContent = _getText("t_status", oRow[oCampaignIdeas.headers[j].COLUMN_NAME]);
						break;
					case 'PHASE':
						sContent = _getText("t_phase", oRow[oCampaignIdeas.headers[j].COLUMN_NAME]);
						break;
					case 'DESCRIPTION':
						sContent = _.stripTags(oRow[oCampaignIdeas.headers[j].COLUMN_NAME] || "").substring(0, 2000);
						break;
					default:
						sContent = oRow[oCampaignIdeas.headers[j].COLUMN_NAME] || "";
				}

				switch (oCampaignIdeas.headers[j].DATA_TYPE_NAME) {
					case 'TIMESTAMP':
						sType = "DateTime";
						if (sContent[sContent.length - 1] === "Z") {
							sContent = sContent.substring(0, sContent.length - 1);
						}
						sStyle = " ss:StyleID=\"s63\"";
						break;
					case 'DOUBLE':
						sType = "Number";
						sStyle = " ss:StyleID=\"s64\"";
						break;
					case 'INTEGER':
						sType = "Number";
						sStyle = " ss:StyleID=\"s65\"";
						break;
					case 'TINYINT':
						sType = "Boolean";
						sContent = sContent ? 1 : 0;
						break;
					case 'RESPONSIBILITY':
						//if (oCampaignIdeas.headers[j].COLUMN_NAME == oRow.RESP_NAME && oRow.RESP_VALUE_NAME) {
						sContent = oRow.RESP_NAME;
						sContent = sContent === null ? "" : sContent;
						//}
						break;
					case 'RESPONSIBILITY_VALUE':
						//if (oCampaignIdeas.headers[j].COLUMN_NAME == oRow.RESP_NAME && oRow.RESP_VALUE_NAME) {

						sContent = oRow.RESP_VALUE_NAME;
						sContent = sContent === null ? "" : sContent;
						//}
						break;
					case 'FIELDS':
						var oFieldValue = findFieldValue(oCampaignIdeas.headers[j], oRow.FieldsValue);

						if (oFieldValue && oFieldValue.FIELD_VALUE) {
							sContent = formatFieldValue(oFieldValue);
						}
						break;
					default:
						if (oCampaignIdeas.headers[j].COLUMN_NAME === 'CAMPAIGN_NAME') {
							sStyle = " ss:StyleID=\"s66\"";
							sHRef = " ss:HRef=\"" + sCampaigntUrl + "\"";
						} else if (oCampaignIdeas.headers[j].COLUMN_NAME === 'NAME') {
							sStyle = " ss:StyleID=\"s66\"";
							sHRef = " ss:HRef=\"" + sIdeaUrl + "\"";
						} else if (oCampaignIdeas.headers[j].COLUMN_NAME === 'REFERENCE_LABEL') {
							sStyle = " ss:StyleID=\"s66\"";
							sHRef = " ss:HRef=\"" + sReferenceUrl + "\"";
						}
				}

				if (sType === "String") {
					if (sContent.indexOf("=") === 0) {
						sContent = sContent.replace(/=/, " =");
					}
					sContent = encodeXML(sContent);
				}

				xls += "<Cell" + sStyle + sHRef + "><Data ss:Type=\"" + sType + "\">" + sContent + "</Data></Cell>";
			}
			xls += "</Row>";
		}

		xls += "</Table>" +
			"<WorksheetOptions xmlns=\"urn:schemas-microsoft-com:office:excel\">" +
			"<PageSetup>" +
			"<Header x:Margin=\"0.3\"/>" +
			"<Footer x:Margin=\"0.3\"/>" +
			"<PageMargins x:Bottom=\"0.75\" x:Left=\"0.7\" x:Right=\"0.7\" x:Top=\"0.75\"/>" +
			"</PageSetup>" +
			"<Unsynced/>" +
			"<PageLayoutZoom>0</PageLayoutZoom>" +
			"<Selected/>" +
			"<FreezePanes/>" +
			"<FrozenNoSplit/>" +
			"<SplitHorizontal>1</SplitHorizontal>" +
			"<TopRowBottomPane>1</TopRowBottomPane>" +
			"<ActivePane>2</ActivePane>" +
			"<Panes>" +
			"<Pane><Number>3</Number></Pane>" +
			"<Pane><Number>2</Number><ActiveRow>1</ActiveRow></Pane>" +
			"</Panes>" +
			"<ProtectObjects>False</ProtectObjects>" +
			"<ProtectScenarios>False</ProtectScenarios>" +
			"</WorksheetOptions>" +
			"<AutoFilter xmlns=\"urn:schemas-microsoft-com:office:excel\" x:Range=\"R1C1:R1C" + oCampaignIdeas.headers.length + "\"/>" +
			"</Worksheet>";
	});
	return xls;
}

function generateCSVforFormFields(oExportData, oZip) {
	_.each(oExportData, function(oCampaignIdeas) {
		var csv = ["\uFEFF"];

		for (var i = 0; i < oCampaignIdeas.headers.length; i++) {
			var sHeader = oCampaignIdeas.headers[i].COLUMN_TITLE;
			if (oCampaignIdeas.headers[i].COLUMN_NAME === 'NAME') {
				csv.push(sHeader);
			} else {
				csv.push('"' + sHeader + '"');
			}
			csv.push(",");
		}

		csv.push("\r");

		for (i = 0; i < oCampaignIdeas.rows.length; i++) {
			var oRow = oCampaignIdeas.rows[i];
			for (var j = 0; j < oCampaignIdeas.headers.length; j++) {
				var oHeader = oCampaignIdeas.headers[j];
				if (oHeader.DATA_TYPE_NAME === "FIELDS") {
					var oFieldValue = findFieldValue(oHeader, oRow.FieldsValue);

					if (oFieldValue && oFieldValue.FIELD_VALUE) {
						csv.push('"' + formatFieldValue(oFieldValue).replace(/"/g, '""') + '"');
					} else {
						csv.push('');
					}
				} else if (oHeader.DATA_TYPE_NAME === "RESPONSIBILITY") {
					if (oRow.RESP_NAME) {
						csv.push('"' + oRow.RESP_NAME.replace(/"/g, '""') + '"');
					} else {
						csv.push('');
					}
				} else if (oHeader.DATA_TYPE_NAME === "RESPONSIBILITY_VALUE") {
					if (oRow.RESP_VALUE_NAME) {
						csv.push('"' + oRow.RESP_NAME.replace(/"/g, '""') + '"');
					} else {
						csv.push('');
					}
				} else {
					var oValue;

					switch (oHeader.COLUMN_NAME) {
						case 'STATUS':
							oValue = _getText("t_status", oRow[oHeader.COLUMN_NAME]);
							break;
						case 'PHASE':
							oValue = _getText("t_phase", oRow[oHeader.COLUMN_NAME]);
							break;
						case 'DESCRIPTION':
							oValue = _.stripTags(oRow[oCampaignIdeas.headers[j].COLUMN_NAME] || "").substring(0, 2000);
							break;
						default:
							oValue = oRow[oHeader.COLUMN_NAME];
					}

					oValue = typeof(oValue) === "string" ? oValue.replace(/=/, " =") : oValue;
					oValue = typeof(oValue) === "string" ? oValue.replace(/"/g, '""') : oValue;
					oValue = typeof(oValue) === "string" ? htmlEntityDecode.decode(oValue) : oValue;
					if (oValue) {
						csv.push('"' + oValue + '"');
					} else {
						csv.push('');
					}
				}
				csv.push(",");
			}
			csv.push("\r");
		}
		var sFormName = oCampaignIdeas.formName.toString().replace(/[\/\:\*\?"<>\|]/, "");
		oZip[sFormName + "." + FORMAT_CSV] = csv.join("");
	});
}

function getFieldsFromCampaign(iCampaignID, aParameters) {
	var oParameters = formatParams(aParameters);
	oParameters.FILTERBACKOFFICE = parseInt(oParameters.FILTERBACKOFFICE, 10);
	// 	var sApplicationUserQuery = 'select ID, IS_EXTERNAL from "sap.ino.db.iam::v_auth_application_user"';
	// 	var aApplicationUserResult = oHQ.statement(sApplicationUserQuery).execute();	

	var sSelectIdeaForm, sSelectAdminForm;
	if (oParameters.FILTERBACKOFFICE) { //Backoffice authorization
		///Custom form fields Column Header	    
		sSelectIdeaForm =
			'SELECT DISTINCT \
        FIELD.CODE,FIELD.DEFAULT_TEXT,FIELD.SEQUENCE_NO \
        FROM \
        "sap.ino.db.ideaform::t_field" AS FIELD \
        LEFT OUTER join "sap.ino.db.campaign::t_campaign" AS CAMPAIGN \
	        on CAMPAIGN.FORM_CODE = FIELD.FORM_CODE \
        WHERE \
            CAMPAIGN.ID = ? \
        ORDER BY FIELD.SEQUENCE_NO;';
		///Admin form fields Column Header
		sSelectAdminForm =
			'SELECT DISTINCT \
        FIELD.CODE,FIELD.DEFAULT_TEXT,FIELD.SEQUENCE_NO \
        FROM \
        "sap.ino.db.ideaform::t_field" AS FIELD \
        LEFT OUTER join "sap.ino.db.campaign::t_campaign" AS CAMPAIGN \
	        on CAMPAIGN.ADMIN_FORM_CODE = FIELD.FORM_CODE \
        WHERE \
            CAMPAIGN.ID = ? \
        ORDER BY FIELD.SEQUENCE_NO;';
	} else {

		sSelectIdeaForm =
			'SELECT DISTINCT \
            FIELD.CODE,FIELD.DEFAULT_TEXT,FIELD.SEQUENCE_NO \
        FROM \
        "sap.ino.db.ideaform::t_field" AS FIELD \
        LEFT OUTER join "sap.ino.db.campaign::t_campaign" AS CAMPAIGN \
	        on CAMPAIGN.FORM_CODE = FIELD.FORM_CODE \
        WHERE \
             CAMPAIGN.ID = ? \
        ORDER BY FIELD.SEQUENCE_NO;';

		sSelectAdminForm =
			'SELECT DISTINCT \
        FIELD.CODE,FIELD.DEFAULT_TEXT,FIELD.SEQUENCE_NO \
        FROM \
        "sap.ino.db.ideaform::t_field" AS FIELD \
        LEFT OUTER join "sap.ino.db.campaign::t_campaign" AS CAMPAIGN \
	        on CAMPAIGN.ADMIN_FORM_CODE = FIELD.FORM_CODE \
        INNER JOIN  "sap.ino.db.ideaform::t_field_value" AS VAL \
            ON FIELD.CODE = VAL.FIELD_CODE \
        INNER JOIN "sap.ino.db.idea::t_idea" AS IDEA \
            ON VAL.IDEA_ID = IDEA.ID \
        WHERE \
            CAMPAIGN.ID = ?  and VAL.STATE_OF_PUBLISH = 1 \
        ORDER BY FIELD.SEQUENCE_NO;';

	}
	var aResult = [];
	var aIdeaFormResult = oHQ.statement(sSelectIdeaForm).execute(iCampaignID);
	var aAdminFormResult = oHQ.statement(sSelectAdminForm).execute(iCampaignID);
	if (aIdeaFormResult.length > 0) {
		aResult = aIdeaFormResult.concat(aAdminFormResult);
	} else {
		aResult = aAdminFormResult;
	}

	return aResult;
}

function getRespListFromCampaign(iCampaignID) {
	var sSelect =
		'select * from "sap.ino.db.subresponsibility::t_responsibility_stage" as responsibility \
                    left outer join "sap.ino.db.campaign::t_campaign" as campaign \
                        on responsibility.code = campaign.resp_code \
                    where campaign.id = ?';
	var aResult = oHQ.statement(sSelect).execute(iCampaignID);

	return aResult[0];
}

function getFieldsFromFormCode(sFormCode) {
	var sIdeaFormSelect =
		'select field.*,form.DEFAULT_TEXT as form_name from "sap.ino.db.ideaform::t_field" as field \
		            inner join "sap.ino.db.ideaform::t_form" as form on field.FORM_CODE = form.CODE \
                    where field.FORM_CODE = ? order by SEQUENCE_NO';
	var aResult = oHQ.statement(sIdeaFormSelect).execute(sFormCode);

	return aResult;
}

function formatParams(aParameters) {
	var oParameters = {};
	_.each(aParameters, function(oParameter) {
		oParameters[oParameter.name.toUpperCase()] = oParameter.value;
	});

	return oParameters;
}

function formatIdeasData(aIdeasData, aIdeasMetadata, oExportIdeaFormObject) {
	var oExportData = {};
	var aIdeasDownload = [];
	var oParameters = formatParams($.request.parameters);	
	//format the ideas data
	_.each(aIdeasData.OT_IDEAS, function(oIdea) {
		var oAuthor = _.find(aIdeasData.OT_AUTHOR, function(author) {
			return author.IDEA_ID === oIdea.ID;
		});

		var oCoach = _.find(aIdeasData.OT_COACH, function(coach) {
			return coach.IDEA_ID === oIdea.ID;
		});

		var oExpert = _.find(aIdeasData.OT_EXPERT, function(expert) {
			return expert.IDEA_ID === oIdea.ID;
		});

		var oVoter = _.find(aIdeasData.OT_VOTER, function(voter) {
			return voter.IDEA_ID === oIdea.ID;
		});

		var oTag = _.find(aIdeasData.OT_TAG, function(tag) {
			return tag.IDEA_ID === oIdea.ID;
		});

		if (oAuthor) {
			oIdea.AUTHOR_NAME = oAuthor.IDENTITY_NAME;
		}

		if (oCoach) {
			oIdea.COACH_NAME = oCoach.IDENTITY_NAME;
		}

		if (oExpert) {
			oIdea.EXPERT_NAME = oExpert.IDENTITY_NAME;
		}

		if (oVoter) {
			oIdea.VOTER_NAME = oVoter.IDENTITY_NAME;
		}

		if (oTag) {
			oIdea.TAG_NAME = oTag.TAG_NAME;
		}
		oParameters.FILTERBACKOFFICE = parseInt(oParameters.FILTERBACKOFFICE, 10);
		var aFieldValue = [];
		if (oParameters.FILTERBACKOFFICE) {
			aFieldValue = _.filter(aIdeasData.OT_FIELD_VALUE, function(fieldValue) {
				return fieldValue.IDEA_ID === oIdea.ID;
			});
		} else {
			aFieldValue = _.filter(aIdeasData.OT_FIELD_VALUE, function(fieldValue) {
				return (fieldValue.IDEA_ID === oIdea.ID && fieldValue.IS_ADMIN_FORM !== 1) || ( fieldValue.IDEA_ID === oIdea.ID && fieldValue.IS_ADMIN_FORM === 1 && fieldValue.STATE_OF_PUBLISH === 1);
			});
		}
		oIdea.FieldsValue = aFieldValue;
		//If download xls/csv need to enhance the old form value
		oIdea.HAS_OLD_FIELD_VALUE = false;
		if (oExportIdeaFormObject.bIncludeOldFormValue === true) {
			var oAdminFormFieldValue = _.find(aFieldValue, function(fieldValue) {
				return fieldValue.IS_ADMIN_FORM === 1;
			});
			var oIdeaFormFieldValue = _.find(aFieldValue, function(fieldValue) {
				return fieldValue.IS_ADMIN_FORM !== 1;
			});
			if (oIdeaFormFieldValue && oIdeaFormFieldValue.FORM_CODE !== oIdea.CAMPAIGN_FORM_CODE) {
				oIdea.IDEA_FORM_CODE = oIdeaFormFieldValue.FORM_CODE;
				oIdea.IS_ADMIN_FORM = false;
				oIdea.HAS_OLD_FIELD_VALUE = true;
				oExportIdeaFormObject.ideaFormIdeas.push(oIdea);
			}
			if (oAdminFormFieldValue && oAdminFormFieldValue.FORM_CODE !== oIdea.CAMPAIGN_ADMIN_FORM_CODE) {
				oIdea.ADMIN_FORM_CODE = oAdminFormFieldValue.FORM_CODE;
				oIdea.IS_ADMIN_FORM = true;
				oIdea.HAS_OLD_FIELD_VALUE = true;
				oExportIdeaFormObject.adminFormIdeas.push(oIdea);
			}
		}
		if (!oIdea.HAS_OLD_FIELD_VALUE) {
			aIdeasDownload.push(oIdea);
		}
	});

	// 	var oIdeaGroups = _.groupBy(aIdeasData.OT_IDEAS, 'CAMPAIGN_ID');
	var oIdeaGroups = _.groupBy(aIdeasDownload, 'CAMPAIGN_ID');
	_.each(oIdeaGroups, function(aIdeas, sCampaignID) {
		oExportData[sCampaignID] = {};
		oExportData[sCampaignID].headers = _.copyDeep(aIdeasMetadata.OT_COLUMN_METADATA);

		//add campaign fields and responsibility list to headers
		var aCampaignFields = getFieldsFromCampaign(parseInt(sCampaignID, 10), $.request.parameters);
		_.each(aCampaignFields, function(oField) {
			oExportData[sCampaignID].headers.push({
				COLUMN_NAME: oField.DEFAULT_TEXT,
				COLUMN_TITLE: oField.DEFAULT_TEXT,
				FIELD_CODE: oField.CODE,
				DATA_TYPE_NAME: "FIELDS"
			});
		});

		var oCampaignRespList = getRespListFromCampaign(parseInt(sCampaignID, 10));
		if (oCampaignRespList) {
			oExportData[sCampaignID].headers.push({
				COLUMN_NAME: oCampaignRespList.DEFAULT_TEXT,
				COLUMN_TITLE: oCampaignRespList.DEFAULT_TEXT,
				DATA_TYPE_NAME: "RESPONSIBILITY"
			});
		}

		oExportData[sCampaignID].rows = aIdeas;
	});

	return oExportData;
}

function _stringToArrayBuffer(sString) {
	var oArrayBuffer = new ArrayBuffer(sString.length);
	var oBufferView = new Uint8Array(oArrayBuffer);

	for (var i = 0, strLen = sString.length; i < strLen; i++) {
		oBufferView[i] = sString.charCodeAt(i);
	}
	return oArrayBuffer;
}

function getUserFromUsername(sUsername) {
	var sSelect = 'select email, name from "sap.ino.db.iam::t_identity" where user_name = ?';
	var aResult = oHQ.statement(sSelect).execute(sUsername);

	return aResult[0];
}

function generateAttachment(sFilename, sData, sUsername, isNotSendEmail) {
	var Attachment = AOF.getApplicationObject("sap.ino.xs.object.attachment.Attachment");
	var oResponse = Attachment.create({
		ID: -1,
		FILE_NAME: sFilename,
		DATA: sData
	});
	var sAttachmentUrl;

	//send email to notice the user
	try {
		var oUser = getUserFromUsername(sUsername);
		sAttachmentUrl = _getHost() + '/' + SystemSettings.getValue(
			'sap.ino.config.URL_PATH_XS_ATTACHMENT_DOWNLOAD', oHQ) + '/' + oResponse.generatedKeys[-1];
		var sContent = TextBundle.getText("messages", "MSG_EXPORT_IDEA_EMAIL_BODY", [oUser.NAME, sAttachmentUrl]);
		var sSubject = TextBundle.getText("messages", "MSG_EXPORT_IDEA_EMAIL_SUBJECT", [sFilename.replace(/Idea_/g, "").replace(/_/g, " ").replace(
			/-/g, " ")]);
		if (!isNotSendEmail) {
			Mail.send(oUser.EMAIL, sSubject, sContent);
		}
	} catch (e) {
		AOF.getTransaction().rollback();
		var error = new Error("MSG_EXPORT_MAIL_SEND_FAILED");
		throw error;
	}

	AOF.getTransaction().commit();
	return sAttachmentUrl;
}

function _getHost() {
	var defaultSysHost = SystemSettings.getIniValue('host', oHQ);
	if (!$.request || !$.request.headers || !$.request.headers.get('clientprotocol') || !$.request.headers.get('host')) {
		return defaultSysHost;
	}
	return htmlEntityDecode.decode($.request.headers.get('clientprotocol')) + "://" + htmlEntityDecode.decode($.request.headers.get('host'));
}

function exportAdvanced(sFormat, sAuthor, sFileName, aIdeasData, aIdeasMetadata, isNotSendEmail) {
	var oExportIdeasData;
	var exportUrl;
	var oExportIdeaFormObject = {
		ideaFormIdeas: [],
		adminFormIdeas: [],
		bIncludeOldFormValue: false
	};
	try {
		switch (sFormat) {
			case FORMAT_CSV:
				oExportIdeaFormObject.bIncludeOldFormValue = true;
				oExportIdeasData = formatIdeasData(aIdeasData, aIdeasMetadata, oExportIdeaFormObject);
				var sZip = _convertToFormatCSV(oExportIdeasData, sFileName, sAuthor, oExportIdeaFormObject, aIdeasMetadata);
				exportUrl = generateAttachment(sFileName + ".zip", sZip, sAuthor, isNotSendEmail);
				break;
			case FORMAT_XLS:
				oExportIdeaFormObject.bIncludeOldFormValue = true;
				oExportIdeasData = formatIdeasData(aIdeasData, aIdeasMetadata, oExportIdeaFormObject);
				var sXls = _convertToFormatXLS(oExportIdeasData, sFileName, sAuthor, oExportIdeaFormObject, aIdeasMetadata);
				exportUrl = generateAttachment(sFileName + "." + sFormat, _stringToArrayBuffer(sXls), sAuthor, isNotSendEmail);
				break;
			case FORMAT_PPTX:
				oExportIdeasData = formatIdeasData(aIdeasData, aIdeasMetadata, oExportIdeaFormObject);
				var sPPT = exportPPT.convertToFormatPPTX(oExportIdeasData);
				exportUrl = generateAttachment(sFileName + "." + sFormat, sPPT, sAuthor, isNotSendEmail);
				break;
			default:
				var error = new Error("MSG_EXPORT_MISS_PATAMETERS");
				throw error;
		}
	} catch (e) {
		throw e;
	}
	return exportUrl;
}

function exportIdea(oSession, aParameters) {
	var oResponse = {
		status: $.net.http.OK,
		body: {
			messageKey: "MSG_EXPORT_SUCCESS"
		}
	};
	var exportUrl = "";

	function missParameters() {
		oResponse.status = $.net.http.INTERNAL_SERVER_ERROR;
		oResponse.body = {
			messageKey: "MSG_EXPORT_MISS_PATAMETERS"
		};
		return oResponse;
	}

	function sendEmailFailed() {
		oResponse.status = $.net.http.INTERNAL_SERVER_ERROR;
		oResponse.body = {
			messageKey: "MSG_EXPORT_MAIL_SEND_FAILED"
		};
		return oResponse;
	}

	var oParameters = formatParams(aParameters);
	var sFileName = oParameters.FILENAME;
	var sFormat = oParameters.FILEFORMAT;
	var isNotSendEmail = oParameters.ISNOTSENDEMAIL;

	if (!sFileName || !sFormat) {
		missParameters();
		return oResponse;
	}

	try {
		delete oParameters.FILEFORMAT;
		delete oParameters.FILENAME;
		delete oParameters.ISNOTSENDEMAIL;
		//decode the filterParams
		oParameters.FILTERSTRING = oParameters.FILTERSTRING.replace('$filter=', '').replace(/%20eq%20/g, '=')
			.replace(/%20ne%20/g, '<>').replace(/%20le%20/g, '<=').replace(/%20ge%20/g, '>=').replace(/%20/g, ' ').replace(/%27/g, "'");
		if (oParameters.SEARCHTOKEN) {
			oParameters.SEARCHTOKEN = oParameters.SEARCHTOKEN.replace(/%20/g, ' ');
		}
		oParameters.FILTERBACKOFFICE = parseInt(oParameters.FILTERBACKOFFICE, 10);
		if (oParameters.FILTERSTRING === '()') {
			oParameters.FILTERSTRING = '';
		}
		if (oParameters.FILTERSTRING) {
			oParameters.FILTERSTRING = oParameters.FILTERSTRING.replace(/(VOTE_COUNT\s*[>|<]{0,1}=\s*)(?:binary)?(-?\d+)(?:[d|m|l|f])(?=\s*)/ig,
				"$1$2");
		}
		oParameters.C1 = oParameters.C1 || '';
		oParameters.O1 = oParameters.O1 || -1;
		oParameters.V1 = oParameters.V1 || '';
		oParameters.C2 = oParameters.C2 || '';
		oParameters.O2 = oParameters.O2 || -1;
		oParameters.V2 = oParameters.V2 || '';
		oParameters.C3 = oParameters.C3 || '';
		oParameters.O3 = oParameters.O3 || -1;
		oParameters.V3 = oParameters.V3 || '';
		oParameters.CVT = oParameters.CVT || '';
		oParameters.CVY = oParameters.CVY || 0;
		oParameters.CVR = oParameters.CVR || 0;
		var aIdeasData, aIdeasMetadata;
		if (oParameters.FILTERBACKOFFICE) {
		    oParameters.SEARCHTYPE = oParameters.SEARCHTYPE || 0;
			aIdeasData = oHQ.procedure("SAP_INO", "sap.ino.db.idea::p_ideas_medium_search").execute(oParameters);
			aIdeasMetadata = oHQ.procedure("SAP_INO", "sap.ino.db.idea::p_idea_medium_metadata").execute();
		} else {
			aIdeasData = oHQ.procedure("SAP_INO", "sap.ino.db.idea::p_ideas_community_search").execute(oParameters);
			aIdeasMetadata = oHQ.procedure("SAP_INO", "sap.ino.db.idea::p_idea_community_metadata").execute();
			var sId = '';
			_.each(aIdeasData.OT_IDEAS, function(oIdea, index) {
				if (index !== aIdeasData.OT_IDEAS.length - 1) {
					sId += oIdea.ID + ',';
				} else {
					sId += oIdea.ID;
				}
			});
			if (sId) {
				var sSelect = 'select id, description from "sap.ino.db.idea::t_idea" where id in (' + sId + ')';
				var result = oHQ.statement(sSelect).execute();
				_.each(aIdeasData.OT_IDEAS, function(oIdea) {
					_.each(result, function(sResult) {
						if (oIdea.ID === sResult.ID) {
							oIdea.DESCRIPTION = sResult.DESCRIPTION;
						}
					});
				});
			}
		}

		exportUrl = exportAdvanced(sFormat, oSession.getUsername(), sFileName, aIdeasData, aIdeasMetadata, isNotSendEmail);
	} catch (e) {
		if (e.message === "MSG_EXPORT_MAIL_SEND_FAILED") {
			sendEmailFailed();
		} else {
			missParameters();
		}
		TraceWrapper.log_exception(e);
		return oResponse;
	}
	if (isNotSendEmail) {
		oResponse.body = {
			messageKey: "MSG_EXPORT_SUCCESS_NOT_VIA_EMAIL",
			downloadUrl: exportUrl
		};
	}
	return oResponse;
}