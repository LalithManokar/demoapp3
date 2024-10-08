const systemSetting = $.import("sap.ino.xs.xslib", "systemSettings");
const attachment = $.import("sap.ino.xs.xslib", "attachment");
const attachmentRepository = $.import("sap.ino.xs.xslib", "attachment_repository");
const TextBundle = $.import("sap.ino.xs.xslib", "textBundle");
const htmlEntityDecode = $.import("sap.ino.xs.xslib", "htmlEntityDecode");
const Status = $.import("sap.ino.xs.object.status", "Status");
const oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const oHQ = $.import("sap.ino.xs.xslib", "hQuery").hQuery(oConn);
var traceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var StatusColors = {
	INACTIVE: "E5E5E5",
	ACTIVE: "048E3E",
	STOPPED: "9F1313"
};

var RegularExpressions = {
	IDEA_TITLE_IMAGE: new RegExp("{{IDEA_TITLE_IMAGE}}", "g"),
	XML_TAG: new RegExp("<[^>]*>", "g"),
	XML_FUNCTIONAL_CHAR: new RegExp("&[a-z]*;", "g"),
	AMPERSAND: new RegExp("&", "g"),
	BACKSPACE: new RegExp("&nbsp;", "g"),
	LOWER_THAN: new RegExp("<", "g"),
	GREATER_THAN: new RegExp(">", "g"),
	IDEA_LINK: new RegExp("%7b%7bIDEA_LINK%7d%7d", "g"),
	EMPTY_NAMESPACE: new RegExp(" xmlns=\"\"", "g")
};

function _getText(objectName, textId) {

	// var aTextBundle = oHQ.statement('select CONTENT from "sap.ino.db.basis::v_resolved_text" where OBJECT_NAME = ? and TEXT_ID = ?').execute(objectName,textId);

	// if(aTextBundle.length === 0) {
	//     return;
	// }

	// return aTextBundle[0].CONTENT;
	var aTextBundle = TextBundle.getText(objectName, textId, null);
	if (aTextBundle.length === 0) {
		return;
	}
	return aTextBundle;
}

function _getValidXMLString(sString) {
	var sStringValid = htmlEntityDecode.decode(sString);
	return sStringValid.replace(RegularExpressions.BACKSPACE, "\r\n")
		.replace(RegularExpressions.AMPERSAND, "&amp;")
		.replace(RegularExpressions.LOWER_THAN, "&lt;")
		.replace(RegularExpressions.GREATER_THAN, "&gt;")
		.replace(RegularExpressions.XML_FUNCTIONAL_CHAR, " ")
		.replace(RegularExpressions.XML_TAG, "");
}

function _getShortTextFromRichText(richText) {
	// Regular expression to match HTML tags and capture their content
	const regex = /(?:<\/?\w+[^>]*>)([^<]*)/g;

	// Array to store the extracted data from each tag
	const extractedData = [];

	// Loop through all the matches using a while loop
	let match;
	while ((match = regex.exec(richText)) !== null) {
		// Trim the whitespace and remove newlines from the captured content
		const fieldValue = match[1].trim().replace(/\n/g, '');

		// Check if the field value is not empty before pushing it to the array
		if (fieldValue !== "") {
			extractedData.push(fieldValue);
		}

		// Update the lastIndex property of the regex to prevent infinite loops
		regex.lastIndex = match.index + match[0].length;
	}

	// Join the extracted data and return as a single string
	if (extractedData.length > 0) {
		return extractedData.join(' ');
	} else {
		// If no tags were found, return the original content without tags
		return richText.replace(/<\/?[^>]+>/g, "").trim();
	}
}

function _escapeRegExp(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function _getTemplate() {
	var sFileName = "IdeaExport";
	var aTemplateData = oHQ.statement('select * from "sap.ino.db.attachment.ext::v_ext_repository_powerpoint" where file_name = ?').execute(
		sFileName);
	if (aTemplateData.length === 0) {
		return;
	}

	var oTemplateData = aTemplateData[0];
	var oAttachment = attachmentRepository.readAttachment(oTemplateData.PACKAGE_ID, sFileName, "pptx", oHQ);

	if (!oAttachment) {
		return;
	}

	return oAttachment;
}

function _getProcessIndicator(oIdeaData, oPlaceholder) {
	var sImage = "";

	var iSteps = oIdeaData.STEPS;
	var iCurrentStep = oIdeaData.STEP;

	var iLineHeight = Math.round(oPlaceholder.cy / 5);
	var iLinePosY = oPlaceholder.y + Math.round(oPlaceholder.cy / 5) * 2;

	var fStepX = 0;
	if (iSteps >= 2) {
		fStepX = Math.round((oPlaceholder.cx - oPlaceholder.cy) / (iSteps - 1));
	}

	var iProgressLineWidth = ((iCurrentStep < 0) ? 0 : iCurrentStep * fStepX);
	if (iCurrentStep >= iSteps) {
		iProgressLineWidth = oPlaceholder.cx - oPlaceholder.cy;
	}

	var iObjectIndex = 100;

	function line(iX, iLineWidth, sColor) {
		sImage += '<p:sp><p:nvSpPr><p:cNvPr id="' + (iObjectIndex++) + '" name="Rectangle ' + (iObjectIndex++) +
			'"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>' +
			'<p:spPr><a:xfrm><a:off x="' + iX + '" y="' + iLinePosY + '"/><a:ext cx="' + iLineWidth + '" cy="' + iLineHeight +
			'"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="' + sColor +
			'"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr>' +
			'<p:style><a:lnRef idx="2"><a:schemeClr val="accent1"><a:shade val="50000"/></a:schemeClr></a:lnRef><a:fillRef idx="1"><a:schemeClr val="accent1"/>' +
			'</a:fillRef><a:effectRef idx="0"><a:schemeClr val="accent1"/></a:effectRef><a:fontRef idx="minor"><a:schemeClr val="lt1"/></a:fontRef></p:style>' +
			'<p:txBody><a:bodyPr rtlCol="0" anchor="ctr"/><a:lstStyle/><a:p><a:pPr algn="ctr"/><a:endParaRPr lang="en-US" dirty="0"/></a:p></p:txBody></p:sp>';
	}

	function circle(iX, sColor) {
		sImage += '<p:sp><p:nvSpPr><p:cNvPr id="' + iObjectIndex+++'" name="Oval ' + iObjectIndex+++'"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>' +
			'<p:spPr><a:xfrm><a:off x="' + iX + '" y="' + oPlaceholder.y + '"/><a:ext cx="' + oPlaceholder.cy + '" cy="' + oPlaceholder.cy +
			'"/></a:xfrm><a:prstGeom prst="ellipse">' +
			'<a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="' + sColor + '"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr>' +
			'<p:style><a:lnRef idx="2"><a:schemeClr val="accent1"><a:shade val="50000"/></a:schemeClr></a:lnRef><a:fillRef idx="1"><a:schemeClr val="accent1"/>' +
			'</a:fillRef><a:effectRef idx="0"><a:schemeClr val="accent1"/></a:effectRef><a:fontRef idx="minor"><a:schemeClr val="lt1"/></a:fontRef></p:style>' +
			'<p:txBody><a:bodyPr rtlCol="0" anchor="ctr"/><a:lstStyle/><a:p><a:pPr algn="ctr"/><a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp>';
	}

	var sStatusColor = StatusColors.ACTIVE;

	if (Status.isFinalIdeaStatus(oIdeaData.STATUS)) {
		sStatusColor = StatusColors.STOPPED;
	}

	if (iSteps > 1) {
		if (iProgressLineWidth > 0) {
			line(Math.round(oPlaceholder.x + oPlaceholder.cy / 2), iProgressLineWidth, sStatusColor);
		}
		if (oPlaceholder.cx - oPlaceholder.cy - iProgressLineWidth > 0) {
			line(Math.round(oPlaceholder.x + oPlaceholder.cy / 2 + iProgressLineWidth), oPlaceholder.cx - oPlaceholder.cy - iProgressLineWidth,
				StatusColors.INACTIVE);
		}
	}

	for (var i = 0; i < iSteps; i++) {
		var x = oPlaceholder.x + i * fStepX;
		var sStepStatusColor = sStatusColor;
		if (i > iCurrentStep || oIdeaData.STATUS === "sap.ino.config.DRAFT") {
			sStepStatusColor = StatusColors.INACTIVE;
		}
		circle(x, sStepStatusColor);
	}

	return sImage;
}

function _addImageTypesToContentTypes(oContentTypesContent) {

	if (oContentTypesContent.search(/Extension="png"/g) < 0) {
		oContentTypesContent = oContentTypesContent.replace("</Types>", '<Default Extension="png" ContentType="image/png"/></Types>');
	}
	if (oContentTypesContent.search(/Extension="jpeg"/g) < 0) {
		oContentTypesContent = oContentTypesContent.replace("</Types>", '<Default Extension="jpeg" ContentType="image/jpeg"/></Types>');
	}
	if (oContentTypesContent.search(/Extension="jpg"/g) < 0) {
		oContentTypesContent = oContentTypesContent.replace("</Types>",
			'<Default Extension="jpg" ContentType="application/octet-stream"/></Types>');
	}

	return oContentTypesContent.replace(RegularExpressions.EMPTY_NAMESPACE, "");
}

function _stringToArrayBuffer(sString) {
	var oArrayBuffer = new ArrayBuffer(sString.length);
	var oBufferView = new Uint8Array(oArrayBuffer);

	for (var i = 0, strLen = sString.length; i < strLen; i++) {
		oBufferView[i] = sString.charCodeAt(i);
	}
	return oArrayBuffer;
}

function _calculateMediaTextColor(r, g, b) {
	var brightness;
	brightness = (parseInt(r, 16) * 299) + (parseInt(g, 16) * 587) + (parseInt(b, 16) * 114);
	brightness = brightness / 255000;

	// values range from 0 to 1
	if (brightness >= 0.9) {
		var iR = parseInt(r, 16);
		iR = (iR - 40 > 0) ? iR - 40 : 0;
		r = iR.toString(16);
		var iG = parseInt(g, 16);
		iG = (iG - 40 > 0) ? iG - 40 : 0;
		g = iG.toString(16);
		var iB = parseInt(b, 16);
		iB = (iB - 40 > 0) ? iB - 40 : 0;
		b = iB.toString(16);
		return "#" + r + g + b;
	} else {
		return "#ffffff";
	}
}

function _addImage(iImageId, oPlaceholder, sFileExtension, sSlideContent, sRelsSlideContent) {
	var sImageElement =
		'<p:pic>' +
		'<p:nvPicPr>' +
		'<p:cNvPr id="' + iImageId + '" name="Picture ' + iImageId + '"/>' +
		'<p:cNvPicPr>' +
		'<a:picLocks noChangeAspect="1"/>' +
		'</p:cNvPicPr>' +
		'<p:nvPr/>' +
		'</p:nvPicPr>' +
		'<p:blipFill>' +
		'<a:blip r:embed="rId' + iImageId + '" cstate="print">' +
		'<a:extLst>' +
		'<a:ext uri="{28A0092B-C50C-407E-A947-70E740481C1C}">' +
		'<a14:useLocalDpi xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main" val="0"/>' +
		'</a:ext>' +
		'</a:extLst>' +
		'</a:blip>' +
		'<a:stretch>' +
		'<a:fillRect/>' +
		'</a:stretch>' +
		'</p:blipFill>' +
		'<p:spPr>' +
		'<a:xfrm>' +
		'<a:off x="' + oPlaceholder.x + '" y="' + oPlaceholder.y + '"/>' +
		'<a:ext cx="' + oPlaceholder.cx + '" cy="' + oPlaceholder.cy + '"/>' +
		'</a:xfrm>' +
		'<a:prstGeom prst="rect">' +
		'<a:avLst/>' +
		'</a:prstGeom>' +
		'</p:spPr>' +
		'</p:pic>';
	sSlideContent = sSlideContent.replace(new RegExp("<p:sp>(?:(?!<p:sp>).)*Rectangle(?:(?!<p:sp>).)*" + oPlaceholder.name + ".*?<\/p:sp>",
		"g"), sImageElement);
	var oRelsImageElement =
		'<Relationship Id="rId' + iImageId +
		'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/' +
		'image' + iImageId + "." + sFileExtension + '"/>';
	var oRelsSlideContent = sRelsSlideContent.replace("</Relationships>", oRelsImageElement + "</Relationships>");

	return {
		SlideContent: sSlideContent,
		RelsSlideContent: oRelsSlideContent
	};
}

function _addProcessIndicator(oIdeaData, sSlideContent) {
	var oPlaceholder = this._getPlaceholderDimensions(sSlideContent, "{{PROCESS_INDICATOR}}");
	if (!oPlaceholder) {
		return sSlideContent;
	}
	var sImage = this._getProcessIndicator(oIdeaData, oPlaceholder);
	sSlideContent = sSlideContent.replace(new RegExp("<p:sp>(?:(?!<p:sp>).)*Rectangle(?:(?!<p:sp>).)*" + oPlaceholder.name + ".*?<\/p:sp>",
		"g"), sImage);

	return sSlideContent;
}

function _addTitelImage(oIdeaData, oZip, iImageId, sSlideContent, sRelsSlideContent) {
	if (oIdeaData.TITLE_IMAGE_ID) {
		var oPlaceholder = this._getPlaceholderDimensions(sSlideContent, "{{IDEA_TITLE_IMAGE}}");
		if (oPlaceholder) {
			var sFileExtension = oIdeaData.TITLE_IMAGE_MEDIA_TYPE.indexOf("/") > -1 ? oIdeaData.TITLE_IMAGE_MEDIA_TYPE.split("/")[1] : oIdeaData.TITLE_IMAGE_MEDIA_TYPE;
			var sSelect = 'select data from "sap.ino.db.attachment.ext::v_ext_attachment_title_image_data" where id = ?';
			var oImage = oHQ.statement(sSelect).execute(oIdeaData.TITLE_IMAGE_ID);
			oZip["ppt/media/image" + iImageId + "." + sFileExtension] = oImage[0].DATA;
			var oResult = this._addImage(iImageId, oPlaceholder, sFileExtension, sSlideContent, sRelsSlideContent);
			oResult.ZIP = oZip;
			return oResult;
		}
	}
	var sImageText;
	var iBlank = oIdeaData.NAME.indexOf(" ");
	if (iBlank > -1) {
		sImageText = oIdeaData.NAME.substring(0, Math.min(iBlank, 8));
		var sSecondWord = oIdeaData.NAME.substring(iBlank + 1);
		iBlank = sSecondWord.indexOf(" ");
		if (iBlank > -1) {
			sImageText = sImageText + "\n" + sSecondWord.substring(0, Math.min(iBlank, 8));
		} else {
			sImageText = sImageText + "\n" + sSecondWord.substring(0, 8);
		}
	} else {
		sImageText = oIdeaData.NAME.substring(0, 8);
	}
	sImageText = this._getValidXMLString(sImageText);
	return {
		ZIP: oZip,
		SlideContent: sSlideContent.replace(RegularExpressions.IDEA_TITLE_IMAGE, sImageText.toUpperCase()),
		RelsSlideContent: sRelsSlideContent
	};
}

function _getContentByTag(Content, TagName) {
	var RegString = "<(?:.*?)" + TagName + ".*?>([\\s\\S]*?)<\/(?:.*?)" + TagName + ">";
	var regExp = new RegExp(RegString, "g");
	return regExp.exec(Content);
}

function _getPlaceholderDimensions(sContent, sImagePlaceholder) {
	// var RegString = '<p:sp>(?:.*?)<a:off x="(\\d+)" y="(\\d+)"\/><a:ext cx="(\\d+)" cy="(\\d+)"\/>(?:.*?)'+sImagePlaceholder+'(?:.*?)';
	var RegString = '<p:sp>(?:(?!<\/p:sp>).)*?<a:off x="(\\d+)" y="(\\d+)"\/><a:ext cx="(\\d+)" cy="(\\d+)"\/>(?:(?!<\/p:sp>).)*?' +
		sImagePlaceholder + '.*?<\/p:sp>';
	var regExp = new RegExp(RegString, "g");
	var oResult = regExp.exec(sContent);
	if (oResult) {
		return {
			name: sImagePlaceholder,
			x: parseInt(oResult[1], 10),
			y: parseInt(oResult[2], 10),
			cx: parseInt(oResult[3], 10),
			cy: parseInt(oResult[4], 10)
		};
	}

}

function _getMaxSlideId(aRelationships) {
	var iMaxSlideId = 1;
	var regStr = /<Relationship Id="rId(\d+)" [^>]*?\/>/g;
	for (var result = regStr.exec(aRelationships); result; result = regStr.exec(aRelationships)) {

		try {
			var iId = parseInt(result[1], 10);
			iMaxSlideId = iMaxSlideId < iId ? iId : iMaxSlideId;
		} catch (e) {}

	}

	return iMaxSlideId;
}

function S4() {
	return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

/**
 * Export all data for current control bindings as file
 *
 */
function convertToFormatPPTX(aExportData) {
	var that = this;
	var oTemplate = this._getTemplate();
	var oZip = new $.util.Zip(oTemplate);
	// get PPT Template xml file
	var sSlideContentTemplate = String.fromCharCode.apply(null, new Uint8Array(oZip["ppt/slides/slide1.xml"]));
	delete oZip["ppt/slides/slide1.xml"];
	var sRelsSlideTemplate = String.fromCharCode.apply(null, new Uint8Array(oZip["ppt/slides/_rels/slide1.xml.rels"]));
	delete oZip["ppt/slides/_rels/slide1.xml.rels"];

	//get all PlaceHolder from Template
	// var aSlideContentPlaceHolder = sSlideContentTemplate.match(/{{\w*}}/g);
	var aSlideContentPlaceHolder = sSlideContentTemplate.match(/{{.*?}}/g);
	//get Content_Types XML 
	var oContentTypesContent = String.fromCharCode.apply(null, new Uint8Array(oZip["[Content_Types].xml"]));

	//Get slide1 XML node
	var regExpContentTypesContentSlide = new RegExp(/<Override PartName="\/ppt\/slides\/slide1.xml" .*?\/>/, "g");
	var oContentTypesContentSlide = regExpContentTypesContentSlide.exec(oContentTypesContent)[0];

	//Remove slide1 XML
	oContentTypesContent = oContentTypesContent.replace(/<Override PartName="\/ppt\/slides\/slide1.xml" .*?\/>/g, "");

	//Get Content for Types node
	// var regExpContentTypes = new RegExp(/(?:.*?)<Types .*?>([\s\S]*?)<\/Types>/, "g");
	// var oContentTypesContentTypes = regExpContentTypes.exec(oContentTypesContent)[1].replace(/<Override PartName="\/ppt\/slides\/slide1.xml" .*?\/>/g, "");

	//get presentation XML
	var sPresentationXmlContent = String.fromCharCode.apply(null, new Uint8Array(oZip["ppt/presentation.xml"]));
	var oPresentationXmlRelsContent = String.fromCharCode.apply(null, new Uint8Array(oZip["ppt/_rels/presentation.xml.rels"]));

	//get relationship from presentation 
	var reExpPresentXML = new RegExp(/<Relationship[^>]*?Target="slides\/slide1.xml"\/>/, "g");
	var aoPresentationXmlRelsContent = this._getContentByTag(oPresentationXmlRelsContent, "Relationships");
	var oPresentationXmlRelSlide = reExpPresentXML.exec(aoPresentationXmlRelsContent[1]);
	var oPresentationXmlRelsContentRelationships = aoPresentationXmlRelsContent[1].replace(
		/<Relationship [^>]*? Target="slides\/slide1.xml"\/>/g, "");
	var iSlideIndex = that._getMaxSlideId(oPresentationXmlRelsContentRelationships) + 1;

	oPresentationXmlRelsContent = oPresentationXmlRelsContent.replace(/<Relationship [^>]*? Target="slides\/slide1.xml"\/>/g, "");

	var regPresentationSection = new RegExp(/<p:extLst>(.*?)<\/p:extLst>/, "g");
	var sNewPresentationSlides = "";
	var sNewPresentationSection = "";
	var sNewSection = "";
	var iObjectIndex = 400;
	//loop Export Data
	sNewPresentationSection = '<p:ext uri="{521415D9-36F7-43E2-AB2F-B90AF26B5E84}">' +
		'<p14:sectionLst xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main">';
	_.each(aExportData, function(aExportRow, iCampaignIndex) {

		//Generate PPT section
		var guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toUpperCase();
		sNewSection = '<p14:section id="{' + guid + '}" ' + 'name="campaign - ' + iCampaignIndex + '">' +
			'<p14:sldIdLst>';
		var sNewSectionContent = "";
		_.each(aExportRow.rows, function(oIdeaData, iIndex) {
			// for testing&debug --  if(oIdeaData.ID === 11111){        
			var sSlideContent = sSlideContentTemplate.replace(/>(?:[\s]*?)</g, "><");
			// var sSlideContent = sSlideContentTemplate;
			var sRelsSlideContent = sRelsSlideTemplate;

			var sShortDescription = oIdeaData.SHORT_DESCRIPTION || "";
			if (sShortDescription.length === 500) {
				sShortDescription += "...";
			}
			sShortDescription = that._getValidXMLString(sShortDescription);

			var sDescription = oIdeaData.DESCRIPTION || "";
			sDescription = _.stripTags(sDescription).substring(0, 1000);
			if (sDescription.length === 1000) {
				sDescription += "...";
			}

			var sIdeaLink = systemSetting.getIniValue("host") + "/sap/ino" + "/#/idea/" + oIdeaData.ID;
			var sCampaignColor = oIdeaData.CAMPAIGN_COLOR || "ffffff";
			var sCampaignTextColor = that._calculateMediaTextColor(sCampaignColor.substr(0, 2), sCampaignColor.substr(2, 2), sCampaignColor.substr(
				4, 2)).slice(1);

			_.each(aSlideContentPlaceHolder, function(sSlideContentPlaceHolder, iPlaceHolderIndex) {

				var oFieldValue = _.find(oIdeaData.FieldsValue, function(oValue) {
					var FIELD_CODE = "{{" + oValue.FIELD_CODE + "}}";
					return FIELD_CODE === htmlEntityDecode.decode(sSlideContentPlaceHolder);
				});

				switch (sSlideContentPlaceHolder) {

					case "{{AUTHOR_TEXT}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), that._getText("t_idea_export_fields",
							"EXPORT_AUTHOR_NAME"));
						break;

					case "{{COACH_TEXT}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), that._getText("t_idea_export_fields",
							"EXPORT_COACH_NAME"));
						break;

					case "{{PHASE_TEXT}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), that._getText("t_idea_export_fields",
							"EXPORT_PHASE"));
						break;

					case "{{STATUS_TEXT}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), that._getText("t_idea_export_fields",
							"EXPORT_STATUS"));
						break;

					case "{{REASON_TEXT}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), that._getText("t_idea_export_fields",
							"EXPORT_STATUS_REASON"));
						break;

					case "{{IDEA_TITLE}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), that._getText("t_idea_export_fields",
							"EXPORT_NAME"));
						break;

					case "{{CAMPAIGN_TEXT}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), that._getText("t_idea_export_fields",
							"EXPORT_CAMPAIGN_NAME"));
						break;

					case "{{IDEA_NAME}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), that._getValidXMLString(oIdeaData.NAME));
						break;

					case "{{IDEA_SHORT_DESCRIPTION_TEXT}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), that._getText("t_idea_export_fields",
							"EXPORT_SHORT_DESCRIPTION"));
						break;

					case "{{CHANGE_REASON_CODE_TEXT}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), that._getText("t_idea_export_fields",
							"EXPORT_CHANGE_REASON_CODE"));
						break;

					case "{{IDEA_SHORT_DESCRIPTION}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), that._getValidXMLString(sDescription));
						break;

					case "{{CAMPAIGN_NAME}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), that._getValidXMLString(oIdeaData.CAMPAIGN_NAME));
						break;

					case "{{COACH_NAME}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), that._getValidXMLString(oIdeaData.COACH_NAME ||
							""));
						break;

					case "{{AUTHOR_NAME}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), that._getValidXMLString(oIdeaData.SUBMITTER_NAME) ||
							"");
						break;

					case "{{CHANGE_REASON_CODE}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), oIdeaData.REASON_CODE ? that._getText(
							"t_value_option", oIdeaData.REASON_CODE || "") : "");
						break;

					case "{{IDEA_PHASE}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), that._getText("t_phase", oIdeaData.PHASE || ""));
						break;

					case "{{IDEA_STATUS}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), that._getText("t_status", oIdeaData.STATUS || ""));
						break;

					case "{{CHANGE_REASON}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), that._getValidXMLString(oIdeaData.REASON_COMMENT ||
							""));
						break;
					case "{{RESP_NAME}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), that._getValidXMLString(oIdeaData.RESP_NAME || ""));
						break;
					case "{{RESP_VALUE}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), that._getValidXMLString(oIdeaData.RESP_VALUE_NAME ||
							""));
						break;
					case (oFieldValue !== undefined && ("{{" + oFieldValue.FIELD_CODE.replace(RegularExpressions.AMPERSAND, "&amp;").replace(
						RegularExpressions.LOWER_THAN, "&lt;").replace(RegularExpressions.GREATER_THAN, "&gt;") + "}}")):
						sSlideContent = sSlideContent.replace(new RegExp(that._escapeRegExp(sSlideContentPlaceHolder), "g"), that._getValidXMLString(
							oFieldValue.FIELD_NAME +
							":" + that._getShortTextFromRichText(oFieldValue.FIELD_VALUE || "")));
						break;
					case "{{CAMPAIGN_TEXT_COLOR}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), sCampaignTextColor.toUpperCase());
						break;
					case "{{IDEA_ID}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), that._getText("t_idea_export_fields",
							"EXPORT_ID"));
						break;
					case "{{ID}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), that._getText("t_ID", oIdeaData.ID || ""));
						break;
					case "{{VOTING_SCORE_TEXT}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), that._getText("t_idea_export_fields",
							"EXPORT_SCORE"));
						break;
					case "{{SCORE}}":
						sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), oIdeaData.SCORE || "");
						break;
					default:
						break;
				}
				// if (oFieldValue.FILED_CODE !== undefined){
				//     sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), (oFieldValue.FIELD_NAME + ":" + oFieldValue.FIELD_VALUE));
				// }
				// sSlideContent = sSlideContent.replace(RegularExpressions.CAMPAIGN_COLOR, sCampaignColor.toUpperCase());
				// // sSlideContent = sSlideContent.replace(RegularExpressions.CAMPAIGN_TEXT_COLOR, sCampaignTextColor.toUpperCase());
				// // sSlideContent = sSlideContent.replace(RegularExpressions.STATUS_CHANGE_REASON, Formatter.VALUE_OPTION(oIdeaData.REASON_CODE));
			});

			sRelsSlideContent = sRelsSlideContent.replace(RegularExpressions.IDEA_LINK, sIdeaLink);

			var oResult = that._addTitelImage(oIdeaData, oZip, iObjectIndex, sSlideContent, sRelsSlideContent);

			oZip = oResult.ZIP;
			sSlideContent = oResult.SlideContent;
			sRelsSlideContent = oResult.RelsSlideContent;
			sSlideContent = that._addProcessIndicator(oIdeaData, sSlideContent);
			oZip["ppt/slides/slide" + iSlideIndex + ".xml"] = sSlideContent;
			oZip["ppt/slides/_rels/slide" + iSlideIndex + ".xml.rels"] = sRelsSlideContent;

			//format content type slide
			var oNewContentTypesContentSlide = oContentTypesContentSlide;
			var sSlidName = 'PartName="/ppt/slides/slide' + iSlideIndex + '.xml"';
			oNewContentTypesContentSlide = oNewContentTypesContentSlide.replace(new RegExp('PartName="(.*?)"', "g"), sSlidName);
			// oContentTypesContentTypes = oContentTypesContentTypes.replace("</Types>",oNewContentTypesContentSlide+'</Types>');
			oContentTypesContent = oContentTypesContent.replace("</Types>", oNewContentTypesContentSlide + '</Types>');

			var iCurrentObjectIndex = iObjectIndex++;
			sNewSectionContent = sNewSectionContent + '<p14:sldId id="' + iObjectIndex + '"/>';
			sNewPresentationSlides = sNewPresentationSlides + "<p:sldId id=\"" + iObjectIndex + "\" r:id=\"rId" + iCurrentObjectIndex + "\"/>";

			var oNewRelationship = oPresentationXmlRelSlide[0];
			var regRelationship = new RegExp('<Relationship.*?Type="(.*?)".*?\/>', "g");
			var sRelationshipType = (regRelationship.exec(oNewRelationship))[1];
			var oNewRelationshipXML = '<Relationship Id="rId' + iCurrentObjectIndex + '"' + " " + 'Type="' + sRelationshipType + '"' + " " +
				'Target="slides/slide' + iSlideIndex + '.xml"/>';
			// oPresentationXmlRelsContentRelationships = oPresentationXmlRelsContentRelationships.replace("</Relationships>",oNewRelationshipXML+"</Relationships>");
			oPresentationXmlRelsContent = oPresentationXmlRelsContent.replace("</Relationships>", oNewRelationshipXML + "</Relationships>");

			iSlideIndex++;
			// }

		});

		sNewSection = sNewSection + sNewSectionContent + "</p14:sldIdLst></p14:section>";
		sNewPresentationSection = sNewPresentationSection + sNewSection;
	});

	delete oZip["[Content_Types].xml"];
	var sContentTypesContent = that._addImageTypesToContentTypes(oContentTypesContent);
	oZip["[Content_Types].xml"] = sContentTypesContent;

	delete oZip["ppt/presentation.xml"];
	sPresentationXmlContent = sPresentationXmlContent.replace(new RegExp("<p:sldId [^>]*(r:)?id[^>]*(r:)?id[^>]*\/>", "g"),
		sNewPresentationSlides);
	var sPresentationExtContent = regPresentationSection.exec(sPresentationXmlContent);
	// sNewPresentationSection = sNewPresentationSection + sNewSection + "</p14:sectionLst></p:ext>" + sPresentationExtContent[1];
	sNewPresentationSection = sNewPresentationSection + "</p14:sectionLst></p:ext>" + sPresentationExtContent[1];
	sPresentationXmlContent = sPresentationXmlContent.replace(sPresentationExtContent[1], sNewPresentationSection);
	oZip["ppt/presentation.xml"] = sPresentationXmlContent;

	delete oZip["ppt/_rels/presentation.xml.rels"];
	oZip["ppt/_rels/presentation.xml.rels"] = oPresentationXmlRelsContent;

	return oZip.asArrayBuffer();
}