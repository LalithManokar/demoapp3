/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/commons/application/Configuration",
    "sap/ino/commons/models/core/CodeModel",
    "sap/ui/core/format/DateFormat",
    "sap/ino/controls/util/ColorSupport",
    "sap/ino/controls/IdeaStatusType",
    "sap/ui/thirdparty/jszip"
], function(Configuration, CodeModel, DateFormat, ColorSupport, IdeaStatusType, JSZip) {
    "use strict";

    var RegularExpressions = {
        CAMPAIGN_TEXT:           new RegExp("{{CAMPAIGN_TEXT}}", "g"),
        CAMPAIGN_NAME:           new RegExp("{{CAMPAIGN_NAME}}", "g"),
        CAMPAIGN_COLOR:          new RegExp("{{CAMPAIGN_COLOR}}", "g"),
        CAMPAIGN_TEXT_COLOR:     new RegExp("{{CAMPAIGN_TEXT_COLOR}}", "g"),
        IDEA_TITLE:              new RegExp("{{IDEA_TITLE}}", "g"),
        IDEA_NAME:               new RegExp("{{IDEA_NAME}}", "g"),
        STATUS_TEXT:             new RegExp("{{STATUS_TEXT}}", "g"),
        IDEA_STATUS:             new RegExp("{{IDEA_STATUS}}", "g"),
        PHASE_TEXT:              new RegExp("{{PHASE_TEXT}}", "g"),
        IDEA_PHASE:              new RegExp("{{IDEA_PHASE}}", "g"),
        IDEA_SHORT_DESCRIPTION:  new RegExp("{{IDEA_SHORT_DESCRIPTION}}", "g"),
        AUTHOR_TEXT:             new RegExp("{{AUTHOR_TEXT}}", "g"),
        AUTHOR_NAME:             new RegExp("{{AUTHOR_NAME}}", "g"),
        COACH_TEXT:              new RegExp("{{COACH_TEXT}}", "g"),
        COACH_NAME:              new RegExp("{{COACH_NAME}}", "g"),
        COMMENT_COUNT:           new RegExp("{{COMMENT_COUNT}}", "g"),
        EVALUATION_COUNT:        new RegExp("{{EVALUATION_COUNT}}", "g"),
        VOTE_COUNT:              new RegExp("{{VOTE_COUNT}}", "g"),
        IDEA_LINK:               new RegExp("%7b%7bIDEA_LINK%7d%7d", "g"),
        IDEA_TITLE_IMAGE:        new RegExp("{{IDEA_TITLE_IMAGE}}", "g"),
        STATUS_CHANGE_REASON_TEXT: new RegExp("{{REASON_TEXT}}", "g"),
        STATUS_CHANGE_REASON:    new RegExp("{{CHANGE_REASON}}", "g"), 
        
        XML_TAG:                 new RegExp("<[^>]*>", "g"),
        XML_FUNCTIONAL_CHAR:     new RegExp("&[a-z]*;", "g"),
        AMPERSAND:               new RegExp("&", "g"),
        BACKSPACE:               new RegExp("nbsp;", "g"),
        LOWER_THAN:              new RegExp("<", "g"),
        GREATER_THAN:            new RegExp(">", "g"),
        
        EMPTY_NAMESPACE:         new RegExp(" xmlns=\"\"", "g")
        
        // RESP_VALUE:             new RegExp("{{RESP_VALUE}}","g"),
        // RESP_NAME:              new RegExp("{{RESP_NAME}}","g"),
        // CHANGE_REASON_CODE:     new RegExp("{{CHANGE_REASON_CODE}}","g"),
        // CHANGE_REASON_CODE_TEXT:new RegExp("{{CHANGE_REASON_CODE_TEXT}}","g"),
        // IDEA_SHORT_DESCRIPTION_TEXT:new RegExp("{{IDEA_SHORT_DESCRIPTION_TEXT}}","g")
    };
    
    var Formatter = {
        STATUS_FORMATTER: CodeModel.getFormatter("sap.ino.xs.object.status.Status.Root"),
        PHASE_FORMATTER:  CodeModel.getFormatter("sap.ino.xs.object.campaign.Phase.Root"),
        VALUE_OPTION: CodeModel.getFormatter("sap.ino.xs.object.basis.ValueOptionList.ValueOptions")
    };
    
    var StatusColors = {
        INACTIVE: "E5E5E5",
        ACTIVE: "048E3E",
        STOPPED: "9F1313"
    };
    
    var _XMLSerializer = new XMLSerializer();

    return {
        _getText : function() {
            if (this.i18n) {
                return this.i18n.getResourceBundle().getText.apply(this.i18n.getResourceBundle(), arguments);
            }
            return "";
        },
        
        _getValidXMLString : function(sString) {
            return sString.replace(RegularExpressions.AMPERSAND, "&amp;")
                          .replace(RegularExpressions.LOWER_THAN, "&lt;")
                          .replace(RegularExpressions.GREATER_THAN, "&gt;")
                          .replace(RegularExpressions.XML_FUNCTIONAL_CHAR, " ")
                          .replace(RegularExpressions.BACKSPACE, "\r\n")
                          .replace(RegularExpressions.XML_TAG, "");
        },
        
        _getTemplate : function() {
            var oDeferred = new jQuery.Deferred();

            var sPath = Configuration.getBackendRootURL() + "/" +
                        Configuration.getSystemSetting("sap.ino.config.URL_PATH_XS_PPTX_TEMPLATE_DOWNLOAD") + "?FILE_NAME=IdeaExport";
            
            var oRequest = new XMLHttpRequest();
        
            oRequest.open("GET", sPath, true);
        
            if(oRequest.responseType){
                oRequest.responseType = "arraybuffer";
            }
            if(oRequest.overrideMimeType){
                oRequest.overrideMimeType("text/plain; charset=x-user-defined");
            }
        
            oRequest.onreadystatechange = function() {
                if (oRequest.readyState === 4) {
                    if(oRequest.status === 200) {
                        oDeferred.resolve(oRequest.response);
                    } else {
                        oDeferred.reject(oRequest.response);
                    }
                }
            };
            oRequest.send();
            
            return oDeferred;
        },
        
        _getProcessIndicator : function(oIdeaData, oPlaceholder) {
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
                sImage += '<p:sp><p:nvSpPr><p:cNvPr id="' + (iObjectIndex++) + '" name="Rectangle ' + (iObjectIndex++) + '"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>' +
                          '<p:spPr><a:xfrm><a:off x="' + iX + '" y="' + iLinePosY + '"/><a:ext cx="' + iLineWidth + '" cy="' + iLineHeight + 
                                '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="' + sColor +'"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr>' +
                          '<p:style><a:lnRef idx="2"><a:schemeClr val="accent1"><a:shade val="50000"/></a:schemeClr></a:lnRef><a:fillRef idx="1"><a:schemeClr val="accent1"/>' +
                                '</a:fillRef><a:effectRef idx="0"><a:schemeClr val="accent1"/></a:effectRef><a:fontRef idx="minor"><a:schemeClr val="lt1"/></a:fontRef></p:style>' +
                          '<p:txBody><a:bodyPr rtlCol="0" anchor="ctr"/><a:lstStyle/><a:p><a:pPr algn="ctr"/><a:endParaRPr lang="en-US" dirty="0"/></a:p></p:txBody></p:sp>';
            }

            function circle(iX, sColor) {
                sImage += '<p:sp><p:nvSpPr><p:cNvPr id="' + iObjectIndex++ + '" name="Oval ' + iObjectIndex++ + '"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>' +
                            '<p:spPr><a:xfrm><a:off x="' + iX + '" y="' + oPlaceholder.y + '"/><a:ext cx="' + oPlaceholder.cy + '" cy="' + oPlaceholder.cy + '"/></a:xfrm><a:prstGeom prst="ellipse">' +
                            '<a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="' + sColor + '"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr>' +
                            '<p:style><a:lnRef idx="2"><a:schemeClr val="accent1"><a:shade val="50000"/></a:schemeClr></a:lnRef><a:fillRef idx="1"><a:schemeClr val="accent1"/>' +
                            '</a:fillRef><a:effectRef idx="0"><a:schemeClr val="accent1"/></a:effectRef><a:fontRef idx="minor"><a:schemeClr val="lt1"/></a:fontRef></p:style>' +
                            '<p:txBody><a:bodyPr rtlCol="0" anchor="ctr"/><a:lstStyle/><a:p><a:pPr algn="ctr"/><a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp>';
            }
            
            var sStatusColor = StatusColors.ACTIVE;
            if (oIdeaData.STATUS === IdeaStatusType.Discontinued || oIdeaData.STATUS === IdeaStatusType.Merged) {
                sStatusColor = StatusColors.STOPPED;
            }
            
            if (iSteps > 1) {
                if(iProgressLineWidth > 0) {
                    line(Math.round(oPlaceholder.x + oPlaceholder.cy / 2), iProgressLineWidth, sStatusColor);
                }
                if(oPlaceholder.cx - oPlaceholder.cy - iProgressLineWidth > 0) {
                    line(Math.round(oPlaceholder.x + oPlaceholder.cy / 2 + iProgressLineWidth), oPlaceholder.cx - oPlaceholder.cy - iProgressLineWidth, StatusColors.INACTIVE);
                }
            }
            
            for (var i = 0; i < iSteps; i ++) {
                var x = oPlaceholder.x + i * fStepX;
                var sStepStatusColor = sStatusColor;
                if (i > iCurrentStep || oIdeaData.STATUS === IdeaStatusType.Draft) {
                    sStepStatusColor = StatusColors.INACTIVE;
                }
                circle(x, sStepStatusColor);
            }
            
            return sImage;
        },
        
        _addImageTypesToContentTypes : function (oContentTypesContent){
            var oElement;
            if(jQuery(oContentTypesContent).find('[Extension="png"]').length === 0) {
                oElement = oContentTypesContent.createElement("Default");
                jQuery(oElement).attr("Extension","png").attr("ContentType","image/png");
                oContentTypesContent.documentElement.appendChild(oElement);
            }
            if(jQuery(oContentTypesContent).find('[Extension="jpeg"]').length === 0){
                oElement = oContentTypesContent.createElement("Default");
                jQuery(oElement).attr("Extension","jpeg").attr("ContentType","image/jpeg");
                oContentTypesContent.documentElement.appendChild(oElement);
            }
            if(jQuery(oContentTypesContent).find('[Extension="jpg"]').length === 0) {
                oElement = oContentTypesContent.createElement("Default");
                jQuery(oElement).attr("Extension","jpg").attr("ContentType","application/octet-stream");
                oContentTypesContent.documentElement.appendChild(oElement);
            }
            return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
                    _XMLSerializer.serializeToString(oContentTypesContent.documentElement).replace(RegularExpressions.EMPTY_NAMESPACE, "");
        },
        
        _stringToArrayBuffer : function(sString) {
            var oArrayBuffer = new ArrayBuffer(sString.length);
            var oBufferView = new Uint8Array(oArrayBuffer);
        
            for (var i = 0, strLen = sString.length; i < strLen; i++) {
                oBufferView[i] = sString.charCodeAt(i);
            }
            return oArrayBuffer;
        },
        
        _getImagePlaceholderDimensions : function(sSlideContent, sImagePlaceholder) {
            var oSlideContent = jQuery.parseXML(sSlideContent);
            var aElements = oSlideContent.getElementsByTagNameNS("*","sp");
            var oPlaceholder;
            jQuery.each(aElements, function(iIndex, oElement) {
                var aSubElements = oElement.getElementsByTagNameNS("*","t");
                if(aSubElements && aSubElements.length > 0 && oElement.getElementsByTagNameNS("*","t")[0].firstChild.data === sImagePlaceholder) {
                    oPlaceholder = oElement;
                    return false;
                }
            });
            if(oPlaceholder) {
                var oDimensionElement = oPlaceholder.getElementsByTagNameNS("*","xfrm")[0];
                var oOffset = oDimensionElement.getElementsByTagNameNS("*","off")[0];
                var oExtension = oDimensionElement.getElementsByTagNameNS("*","ext")[0];
    
                return {
                    name: sImagePlaceholder,
                    x: parseInt(oOffset.getAttribute("x"), 10),
                    y: parseInt(oOffset.getAttribute("y"), 10),
                    cx: parseInt(oExtension.getAttribute("cx"), 10),
                    cy: parseInt(oExtension.getAttribute("cy"), 10)
                };
            }
        },
        
        _addImage : function(iImageId, oPlaceholder, sFileExtension, sSlideContent, sRelsSlideContent) {
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
            sSlideContent = sSlideContent.replace(new RegExp("<p:sp>(?:(?!<p:sp>).)*Rectangle(?:(?!<p:sp>).)*" + oPlaceholder.name + ".*?<\/p:sp>", "g"), sImageElement);

            var oRelsImageElement = jQuery.parseXML(
                '<Relationship Id="rId' + iImageId +
                    '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/' +
                    'image' + iImageId + "." + sFileExtension + '"/>'
            );
            var oRelsSlideContent = jQuery.parseXML(sRelsSlideContent);
            oRelsSlideContent.documentElement.appendChild(oRelsImageElement.documentElement);
            
            return {
                SlideContent: sSlideContent,
                RelsSlideContent: "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" + 
                                    _XMLSerializer.serializeToString(oRelsSlideContent.documentElement).replace(RegularExpressions.EMPTY_NAMESPACE, "")
            };
        },
        
        _addProcessIndicator : function(oIdeaData, sSlideContent) {
            var oPlaceholder = this._getImagePlaceholderDimensions(sSlideContent, "{{PROCESS_INDICATOR}}");
            if(!oPlaceholder) {
                return sSlideContent;
            }
            var sImage = this._getProcessIndicator(oIdeaData, oPlaceholder);
            sSlideContent = sSlideContent.replace(new RegExp("<p:sp>(?:(?!<p:sp>).)*Rectangle(?:(?!<p:sp>).)*" + oPlaceholder.name + ".*?<\/p:sp>", "g"), sImage);
            
            return sSlideContent;
        },
        
        _addTitelImage : function(oIdeaData, oZip, iImageId, sSlideContent, sRelsSlideContent) {
            if( oIdeaData.TITLE_IMAGE_ID ){
                var oPlaceholder = this._getImagePlaceholderDimensions(sSlideContent, "{{IDEA_TITLE_IMAGE}}");
                if(oPlaceholder) {
                    var sFileExtension = oIdeaData.TITLE_IMAGE_MEDIA_TYPE.indexOf("/") > -1 ? oIdeaData.TITLE_IMAGE_MEDIA_TYPE.split("/")[1] : oIdeaData.TITLE_IMAGE_MEDIA_TYPE;

                    var oDeferred = new jQuery.Deferred();
                    var oRequest = new XMLHttpRequest();
                    oRequest.onreadystatechange = function() {
                        if (oRequest.readyState === 4) {  // Makes sure the document is ready to parse.
                            if (oRequest.status === 200) {  // Makes sure it's found the file.
                                var oImage = oRequest.response || oRequest.responseText;
                                oZip.file("ppt/media/image" + iImageId + "." + sFileExtension, oImage);
                                oDeferred.resolve();
                            } else {
                                oDeferred.resolve();
                            }
                        }
                    };
                    var sAttachmentURL = Configuration.getBackendRootURL() + "/" +
                        Configuration.getSystemSetting("sap.ino.config.URL_PATH_XS_ATTACHMENT_TITLE_IMAGE_DOWNLOAD") + "/" + oIdeaData.TITLE_IMAGE_ID;
                    oRequest.open("GET", sAttachmentURL, true);
                    oRequest.responseType = "arraybuffer";
                    oRequest.send(null);
                    
                    var oResult = this._addImage(iImageId, oPlaceholder, sFileExtension, sSlideContent, sRelsSlideContent);
                    oResult.ZIP = oZip;
                    oResult.ImageDeferred = oDeferred;
                    return oResult;
                }
            }
            
            var sImageText; 
            var iBlank = oIdeaData.NAME.indexOf(" ");
            if(iBlank > -1) {
                sImageText = oIdeaData.NAME.substring(0, Math.min(iBlank, 8));
                var sSecondWord = oIdeaData.NAME.substring(iBlank + 1);
                iBlank = sSecondWord.indexOf(" ");
                if(iBlank > -1) {
                    sImageText = sImageText + "\n" + sSecondWord.substring(0, Math.min(iBlank, 8));
                } else {
                    sImageText = sImageText + "\n" + sSecondWord.substring(0, 8);
                }
            } else {
                sImageText = oIdeaData.NAME.substring(0,8);
            }
            sImageText =  this._getValidXMLString(sImageText);
                

            return {
                ZIP: oZip,
                SlideContent: sSlideContent.replace(RegularExpressions.IDEA_TITLE_IMAGE, sImageText.toUpperCase()),
                RelsSlideContent: sRelsSlideContent
            };
        },
        
        
        _getMaxSlideId : function(aRelationships){
            var iMaxSlideId = 1;
            
            jQuery.each(aRelationships, function(iIndex, sRelationship) {
                var sId = jQuery(sRelationship).attr('Id');
                try {
                    var iId = parseInt(sId.substring(3), 10);
                    iMaxSlideId = iMaxSlideId < iId ? iId : iMaxSlideId;
                } catch(e) {
                }
            });

            return iMaxSlideId;
        },
        
        /**
         * Export all data for current control bindings as file
         * 
         */
        convertToFormatPPTX : function(aExportData) {
            var oDeferred = jQuery.Deferred();
            var oTemplateDeferred = this._getTemplate();
            
            var that = this;
            
            oTemplateDeferred.done(function(oTemplate) {
                try {
                    var oZip = JSZip(oTemplate);
                    
                    var sSlideContentTemplate = oZip.file("ppt/slides/slide1.xml").asText();
                    var aSlideContentPlaceHolder = sSlideContentTemplate.match(/{{\w*}}/g);
        	        oZip.remove("ppt/slides/slide1.xml");

                    var sRelsSlideTemplate = oZip.file("ppt/slides/_rels/slide1.xml.rels").asText();
                    oZip.remove("ppt/slides/_rels/slide1.xml.rels");

                    var oContentTypesContent = jQuery.parseXML(oZip.file("[Content_Types].xml").asText());
                    var oContentTypesContentTypes = oContentTypesContent.getElementsByTagName("Types")[0];
                    var oContentTypesContentSlide = jQuery(oContentTypesContent).find("[PartName='/ppt/slides/slide1.xml']")[0];
                    oContentTypesContentTypes.removeChild(oContentTypesContentSlide);

                    var sPresentationXmlContent = oZip.file("ppt/presentation.xml").asText();

                    var oPresentationXmlRelsContent = jQuery.parseXML(oZip.file("ppt/_rels/presentation.xml.rels").asText());
                    var oPresentationXmlRelsContentRelationships = oPresentationXmlRelsContent.getElementsByTagName("Relationships")[0];
                    var oPresentationXmlRelSlide = jQuery(oPresentationXmlRelsContentRelationships).find("[Target='slides/slide1.xml']")[0];
                    oPresentationXmlRelsContentRelationships.removeChild(oPresentationXmlRelSlide);
                    var iSlideIndex = that._getMaxSlideId(oPresentationXmlRelsContentRelationships.childNodes) + 1;

                    var sCampaignText = that._getText("LIST_TIT_FILTER_CAMPAIGN_HEADER");
                    var sIdeaTitleText = that._getText("LIST_TIT_FILTER_IDEA_HEADER");
                    var sPhaseText  = that._getText("LIST_TIT_FILTER_PHASE_HEADER");
                    var sStatusText = that._getText("LIST_TIT_FILTER_STATUS_HEADER");
                    var sAuthorText = that._getText("LIST_TIT_FILTER_AUTHOR_HEADER");
                    var sCoachText  = that._getText("LIST_TIT_FILTER_COACH_HEADER");
                    var sStatusChangeReasonText = that._getText("IDEA_LIST_FLD_STATUS_CHANGE_REASON");
                    
                    var aImageDeferred = [];
                    
                    // var testA = {};
                    // jQuery.each(aSlideContentPlaceHolder, function(iIndex, sSlideContentPlaceHolder){
                    //     switch(sSlideContentPlaceHolder){
                    //         case "{{IDEA_NAME}}":
                    //             testA[sSlideContentPlaceHolder] = that._getValidXMLString;
                    //             break;
                    //         default:
                    //             break;
                    //     }
                    // });
                    
                    

                    
                    //as IE corrupts the XML when using the XMLSerializer we need to use the string concat fallback
                    var sNewPresentationSlides = "";
                    var iObjectIndex = 400;
                    jQuery.each(aExportData, function(iIndex, oIdeaData) {
                        var sSlideContent = sSlideContentTemplate;
                        var sRelsSlideContent = sRelsSlideTemplate;
                        
                        var sShortDescription = oIdeaData.SHORT_DESCRIPTION || "";
                        if(sShortDescription.length === 500) {
                            sShortDescription += "...";
                        }
                        sShortDescription = that._getValidXMLString(sShortDescription);
                        
                        var sIdeaLink = window.location.protocol + "//" +
                                            window.location.host +
                                            window.location.pathname +
                                            "#/idea/" + oIdeaData.ID;
                        var sCampaignColor = oIdeaData.CAMPAIGN_COLOR || "ffffff";
                        var sCampaignTextColor = ColorSupport.calculateMediaTextColor(sCampaignColor.substr(0, 2), sCampaignColor.substr(2, 2), sCampaignColor.substr(4, 2)).slice(1);

                        jQuery.each(aSlideContentPlaceHolder, function(iPlaceHolderIndex, sSlideContentPlaceHolder){
                            switch(sSlideContentPlaceHolder){
                                case "{{IDEA_NAME}}":
                                    sSlideContent = sSlideContent.replace(new RegExp(sSlideContentPlaceHolder, "g"), that._getValidXMLString(oIdeaData.NAME));
                                    break;
                                default:
                                    break;
                            }
                        });
                        

                        sSlideContent = sSlideContent.replace(RegularExpressions.CAMPAIGN_TEXT, sCampaignText);
                        sSlideContent = sSlideContent.replace(RegularExpressions.IDEA_TITLE, sIdeaTitleText);
                        sSlideContent = sSlideContent.replace(RegularExpressions.PHASE_TEXT, sPhaseText);
                        sSlideContent = sSlideContent.replace(RegularExpressions.STATUS_TEXT, sStatusText);
                        sSlideContent = sSlideContent.replace(RegularExpressions.COACH_TEXT, sCoachText);
                        sSlideContent = sSlideContent.replace(RegularExpressions.AUTHOR_TEXT, sAuthorText);
                        sSlideContent = sSlideContent.replace(RegularExpressions.IDEA_SHORT_DESCRIPTION, sShortDescription);
                        // sSlideContent = sSlideContent.replace(RegularExpressions.IDEA_NAME, that._getValidXMLString(oIdeaData.NAME));
                        sSlideContent = sSlideContent.replace(RegularExpressions.IDEA_PHASE, Formatter.PHASE_FORMATTER(oIdeaData.PHASE));
                        sSlideContent = sSlideContent.replace(RegularExpressions.IDEA_STATUS, Formatter.STATUS_FORMATTER(oIdeaData.STATUS));
                        sSlideContent = sSlideContent.replace(RegularExpressions.CAMPAIGN_NAME, that._getValidXMLString(oIdeaData.CAMPAIGN_NAME));
                        sSlideContent = sSlideContent.replace(RegularExpressions.COACH_NAME, oIdeaData.COACH_NAME || "");
                        sSlideContent = sSlideContent.replace(RegularExpressions.AUTHOR_NAME, oIdeaData.SUBMITTER_NAME);
                        sSlideContent = sSlideContent.replace(RegularExpressions.CAMPAIGN_COLOR, sCampaignColor.toUpperCase());
                        sSlideContent = sSlideContent.replace(RegularExpressions.CAMPAIGN_TEXT_COLOR, sCampaignTextColor.toUpperCase());
                        sSlideContent = sSlideContent.replace(RegularExpressions.STATUS_CHANGE_REASON_TEXT, sStatusChangeReasonText);
                        sSlideContent = sSlideContent.replace(RegularExpressions.STATUS_CHANGE_REASON, Formatter.VALUE_OPTION(oIdeaData.REASON_CODE));
                        
                        sRelsSlideContent = sRelsSlideContent.replace(RegularExpressions.IDEA_LINK, sIdeaLink);
                        
                        var oResult = that._addTitelImage(oIdeaData, oZip, iObjectIndex, sSlideContent, sRelsSlideContent);
                        oZip = oResult.ZIP;
                        sSlideContent = oResult.SlideContent;
                        sRelsSlideContent = oResult.RelsSlideContent;
                        if(oResult.ImageDeferred) {
                            aImageDeferred.push(oResult.ImageDeferred);
                            iObjectIndex++;
                        }
                        sSlideContent = that._addProcessIndicator(oIdeaData, sSlideContent);

                        oZip.file("ppt/slides/slide" + iSlideIndex + ".xml", sSlideContent);
                        oZip.file("ppt/slides/_rels/slide" + iSlideIndex + ".xml.rels", sRelsSlideContent);
                        
                        var oNewContentTypesContentSlide = oContentTypesContentSlide.cloneNode();
                        jQuery(oNewContentTypesContentSlide).attr("PartName", "/ppt/slides/slide" + iSlideIndex + ".xml");
                        oContentTypesContentTypes.appendChild(oNewContentTypesContentSlide);
                        
                        var iCurrentObjectIndex = iObjectIndex++;
                        sNewPresentationSlides = sNewPresentationSlides + "<p:sldId id=\"" + iObjectIndex++ + "\" r:id=\"rId" + iCurrentObjectIndex + "\"/>";
                        
                        var oNewRelationship = oPresentationXmlRelSlide.cloneNode();
                        jQuery(oNewRelationship).attr("Id", "rId" + iCurrentObjectIndex).attr("Target", "slides/slide" + iSlideIndex + ".xml");
                        oPresentationXmlRelsContentRelationships.appendChild(oNewRelationship);
                        
                        iSlideIndex++;
                    });
                    
                    oZip.remove("[Content_Types].xml");
                    var sContentTypesContent = that._addImageTypesToContentTypes(oContentTypesContent);
                    oZip.file("[Content_Types].xml", sContentTypesContent);
                    
                    oZip.remove("ppt/presentation.xml");
                    sPresentationXmlContent = sPresentationXmlContent.replace(new RegExp("<p:sldId [^>]*(r:)?id[^>]*(r:)?id[^>]*\/>", "g"), sNewPresentationSlides);
                    oZip.file("ppt/presentation.xml", sPresentationXmlContent);
                    
                    oZip.remove("ppt/_rels/presentation.xml.rels");
                    oZip.file("ppt/_rels/presentation.xml.rels",
                                    "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" + _XMLSerializer.serializeToString(oPresentationXmlRelsContent.documentElement));
                    
                    jQuery.when.apply(jQuery, aImageDeferred).then(function() {
                        oDeferred.resolve(oZip.generate({type:"blob"}));
                    });
                } catch(e) {
                    oDeferred.reject(e.toString());
                }
            });
            return oDeferred.promise();
        }
    };
});