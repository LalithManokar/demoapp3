/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.WidgetRowItem");

(function() {
    "use strict";

    jQuery.sap.require("sap.ui.ino.controls.ColorSupport");
    var ColorSupport = sap.ui.ino.controls.ColorSupport;
    jQuery.sap.require("sap.ui.ino.application.Configuration");
    var Configuration = sap.ui.ino.application.Configuration;

    /**
     * A widget row item is a component that can be repeated using the Repeater in a widget. It takes full width of the
     * parent component and has a fixed height. It can have an image, a text, a subtext and two sub lines
     * 
     * <ul>
     * <li>Properties
     * <ul>
     * <li>imageId: ID of the Image that will be shown. The image has to be available in the attachments</li>
     * <li>defaultImageURL: Source of the image that will be shown when no imageId is set</li>
     * <li>imageWidth: Absolute image width that will set for the image</li>
     * <li>relativeImageWidth: Relative Size of the image (in Percent). Alternative to imageWidth (Leading)</li>
     * <li>imageHeightFactor: Factor that is used to calculate the Height of the image dependend on its Width</li>
     * <li>imageColor: If there is neither an imageId or a defaultImageURL set a rendered image will be shown with the specified color</li>
     * <li>tooltip: String, Tooltip set for the displayed Title</li>
     * <li>title: String that is shown in the first line of the control</li>
     * <li>allowMultilineTitle: Boolean Indicator. Indicates whether the title will wrapped or not</li>
     * <li>detailsURL: URL that will be called when the title link is clicked</li>
     * <li>subTitle: Smaller text directly attached to the title</li>
     * <li>footer: Footer Text shown at the bottom of the Control</li>
     * <li>subFooter: Smaller text directly attached to the footer</li>
     * </ul>
     * </li>
     * </ul>
     */
    sap.ui.core.Control.extend("sap.ui.ino.controls.WidgetRowItem", {
        metadata : {
            properties : {
                imageId : {
                    type : "int",
                    defaultValue : 0
                },
                defaultImageURL : "string",
                imageWidth : {
                    type : "int",
                    defaultValue : 0
                },
                relativeImageWidth : {
                    type : "int",
                    defaultValue : 0
                },
                imageHeightFactor : {
                    type : "float",
                    defaultValue : 0
                },
                imageColor : {
                    type : "string",
                    defaultValue : "666666"
                },
                tooltip : "string",
                title : "string",
                allowMultilineTitle : {
                    type : "boolean",
                    defaultValue : false
                },
                detailsURL : "string",
                subTitle: "string",
                footer: "string",
                subFooter: "string"
            }
        },

        renderer : function(oRm, oControl) {
            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.writeClasses();
            oRm.write(">");

            oRm.write("<table border='0'");
            oRm.addClass("sapUiInoWidgetRowItem");
            oRm.writeClasses();
            oRm.write(">");
            oRm.write("<tr>");

            if(oControl.getRelativeImageWidth() > 0 || oControl.getImageWidth() > 0) {
                oRm.write("<td rowspan='2'");
                if(oControl.getRelativeImageWidth() > 0) {
                    oRm.writeAttributeEscaped("style", "width:" + oControl.getRelativeImageWidth() + "%;");
                } else if(oControl.getImageWidth() > 0) {
                    oRm.writeAttributeEscaped("style", "width:" + oControl.getImageWidth() + "px;");
                }
                oRm.addClass("sapUIInoWidgetRowItemImageCell");
                oRm.writeClasses();
                oRm.write(">");

                if (oControl.getDetailsURL()) {
                    oRm.write("<a style='border:none;' target='_blank'");
                    oRm.writeAttributeEscaped("rel", oControl.getTitle());
                    oRm.writeAttributeEscaped("href", oControl.getDetailsURL());
                    oRm.addClass("sapUiInoWidgetRowItemImageLink");
                    oRm.writeClasses();
                    oRm.write(">");
                }

                var tooltip = oControl.getTitle();
                if (oControl.getTooltip()) {
                    tooltip = oControl.getTooltip();
                }

                var imgSrc = oControl.getDefaultImageURL();
                if(oControl.getImageId()) {
                    imgSrc = Configuration.getAttachmentTitleImageDownloadURL(oControl.getImageId());
                }

                if(imgSrc == undefined
                    || imgSrc == null) {
                    oRm.write("<div title='" + tooltip +"'");
                    oRm.addClass("sapUiInoWidgetRowItemImgContainer " + 
                                 "sapUiInoWidgetRowItemImgTextContainer");
                    oRm.writeClasses();
                    
                    var sColor = oControl.getImageColor();
                    if (sColor && sColor.length == 6) {
                        var sStyleAttribute = "opacity: 0.4; color: "
                                + ColorSupport.calculateMediaTextColor(sColor.substr(0, 2), sColor
                                        .substr(2, 2), sColor.substr(4, 2)) + "; background-color: #"
                                + sColor;
                        oRm.writeAttributeEscaped("style", sStyleAttribute);
                    }
                    oRm.write(">");

                    oRm.write("<div");
                    oRm.addClass("sapUiInoWidgetRowItemImgText");
                    oRm.writeClasses();
                    oRm.write(">");
                    if (oControl.getTitle()) {
                        oRm.writeEscaped(oControl.getTitle());
                    }
                    oRm.write("</div>");

                    oRm.write("</div>");
                } else {
                    oRm.write("<div title='" + tooltip + "'");
                    if(oControl.getImageId()) {
                        oRm.addClass("sapUiInoWidgetRowItemImgContainer " +
                                     "sapUiInoWidgetRowItemImg");
                    } else {
                        oRm.addClass("sapUiInoWidgetRowItemImgContainer " +
                                     "sapUiInoWidgetRowItemDefaultImg");
                    }
                    oRm.writeClasses();
                    var sStyleAttribute = "background-image: url(" + imgSrc + ");";
                    oRm.writeAttributeEscaped("style", sStyleAttribute);
                    oRm.write(">");
                    oRm.write("</div>");
                }

                if (oControl.getDetailsURL()) {
                    oRm.write("</a>");
                }

                oRm.write("</td>");
            }
            
            oRm.write("<td");
            oRm.addClass("sapUiInoWidgetRowItemTitleCell");
            oRm.writeClasses();
            oRm.write(">");
            oRm.write("<div");
            oRm.addClass("sapUiInoWidgetRowItemTitle");
            oRm.writeClasses();
            if(oControl.getAllowMultilineTitle() === false) {
                oRm.writeAttributeEscaped("style", "white-space: nowrap;");
            }
            oRm.write(">");

            if (oControl.getDetailsURL()) {
                oRm.write("<a style='border:none;' target='_blank'");
                oRm.writeAttributeEscaped("href", oControl.getDetailsURL());
                oRm.writeAttributeEscaped("rel", oControl.getTitle());
                oRm.addClass("sapUiInoWidgetRowItemTitle");
                oRm.addClass("sapUiInoWidgetRowItemTitleLink");
                oRm.writeClasses();
                oRm.write(">");
                oRm.writeEscaped(oControl.getTitle());
                oRm.write("</a>");
            } else {
                oRm.write("<div");
                oRm.addClass("sapUiInoWidgetRowItemTitle");
                oRm.writeClasses();
                oRm.write(">");
                if (oControl.getTitle()) {
                    oRm.writeEscaped(oControl.getTitle());
                }
                oRm.write("</div>");
            }

            oRm.write("</div>");
            
            if (oControl.getSubTitle()) {
                oRm.write("<div");
                oRm.addClass("sapUiInoWidgetRowItemSubTitle");
                oRm.writeClasses();
                oRm.write(">");
                oRm.writeEscaped(oControl.getSubTitle());
                oRm.write("</div>");
            }
            oRm.write("</td>");
            oRm.write("</tr>");

            oRm.write("<tr>");
            oRm.write("<td");
            oRm.addClass("sapUiInoWidgetRowItemFooterCell");
            oRm.writeClasses();
            oRm.write(">");
            if (oControl.getFooter()) {
                oRm.write("<div>");
                oRm.writeEscaped(oControl.getFooter());
                oRm.write("</div>");
            }

            if (oControl.getSubFooter()) {
                oRm.write("<div>");
                oRm.writeEscaped(oControl.getSubFooter());
                oRm.write("</div>");
            }
            oRm.write("</td>");
            oRm.write("</tr>");

            oRm.write("</table>");
        },

        onAfterRendering : function(oEvent) {
            if(this.getRelativeImageWidth() === 0
                    && this.getImageWidth() === 0) {
                    return;
            }

            var oControl = this;
            this._setImageSize();
            jQuery(window).resize(function() {
                oControl._setImageSize();
            });
        },
        
        _setImageSize : function() {
            var iImageWidth = 0;
            var iRowWidth = jQuery(this.getDomRef()).width();
            if(this.getImageWidth() > 0) {
                iImageWidth = this.getImageWidth();
            } else {
                iImageWidth = Math.round(iRowWidth * this.getRelativeImageWidth() / 100);
            }

            var iRowHeight = 50;
            if(iRowWidth >= 350 && iRowWidth < 650){
                iRowHeight = Math.round(50 + ((iRowWidth-350) / 15));
            } else if(iRowWidth >= 650) {
                iRowHeight = 70;
            }
            
            //max-height of Item: 70px (image: 68px)
            var iImageHeight = iRowHeight - 2;
            if(this.getImageHeightFactor() > 0) {
                iImageHeight = iImageWidth * this.getImageHeightFactor();
                if(iImageHeight > 68) {
                    iImageHeight = 68;
                    iImageWidth = iImageHeight / this.getImageHeightFactor();
                } else if(iImageHeight < 48) {
                    iImageHeight = 48;
                    iImageWidth = iImageHeight / this.getImageHeightFactor();
                } 
            }

            var oDomRef = jQuery(this.getDomRef());
            oDomRef.find(".sapUiInoWidgetRowItemImgContainer").css('width',iImageWidth+'px');
            oDomRef.find(".sapUiInoWidgetRowItemImgContainer").css('height',iImageHeight+'px');
            if(this.getImageId() === 0
                    && this.getDefaultImageURL() === undefined) {
                oDomRef.find(".sapUiInoWidgetRowItemImgTextContainer").css('height',iImageHeight+'px');
                oDomRef.find(".sapUiInoWidgetRowItemImgText").css('height',iImageHeight+'px');
            }
            oDomRef.find(".sapUiInoWidgetRowItem").css("height",iRowHeight+'px');
        }
    });
})();