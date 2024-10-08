/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.controls.Widget");

(function() {
    "use strict";

    jQuery.sap.require("sap.ui.ino.controls.WidgetBannerData");
    jQuery.sap.require("sap.ui.ino.controls.ColorSupport");
    var ColorSupport = sap.ui.ino.controls.ColorSupport;
    jQuery.sap.require("sap.ui.ino.application.Configuration");
    var Configuration = sap.ui.ino.application.Configuration;

    /**
     * A widget is a component that has a header, border and a scrollable content taking up the complete available space
     * of the parent container.
     * 
     * <ul>
     * <li>Properties
     * <ul>
     * <li>bannerVisible: Boolean indicator whether the banner should be visible </li>
     * <li>headerText: Text shown in the header section of the widget </li>
     * <li>headerVisible: Boolean indicator whether the header should be visible. </li>
     * <li>borderVisible: Boolean indicator whether a border around the widget should be visible </li>
     * </ul>
     * </li>
     * <li>Aggregations
     * <ul>
     * <li>bannerData: Control containing all banner relevant data</li>
     * <li>content: Control containing the scrollable content of the widget</li>
     * </ul>
     * </li>
     * </ul>
     */
    sap.ui.core.Control.extend("sap.ui.ino.controls.Widget", {
        metadata : {
            properties : {
                bannerVisible : {
                    type : "boolean",
                    defaultValue : true
                },
                headerText : {
                    type : "string"
                },
                headerVisible : {
                    type : "boolean",
                    defaultValue : true
                },
                borderVisible : "boolean"
            },
            aggregations : {
                bannerData : {
                    type : "sap.ui.ino.controls.WidgetBannerData",
                    multiple : false,
                    bindable : true
                },
                content : {
                    type : "sap.ui.core.Control",
                    multiple : false
                }
            }
        },

        _renderBanner : function(oRm, oControl) {
            var oBannerData = oControl.getBannerData();
            var iBannerHeight = 0;

            oRm.write("<div");
            oRm.addClass("sapUiInoWidgetBanner");
            var sColor = oBannerData.getColorCode();
            if (sColor && sColor.length == 6) {
                oRm.writeAttributeEscaped("style", "background-color: #" + oBannerData.getColorCode());
            }
            oRm.write(">");

            if(oBannerData.getTitle()) {
                oRm.write("<div");
                oRm.addClass("sapUiInoWidgetBannerCenter");
                oRm.writeClasses();
                oRm.write(">");

                var sTextColorStyle = "sapUiInoWidgetBannerLink" + ColorSupport.calculateTitleTextColor(
                                                                           sColor.substr(0, 2),
                                                                           sColor.substr(2, 2),
                                                                           sColor.substr(4, 2));
                var sStyleClass = "sapUiInoWidgetBannerText " + sTextColorStyle;

                if (oBannerData.getDetailsURL()) {
                    oRm.write("<a style='border:none;' target='_blank'");
                    oRm.writeAttributeEscaped("href", oBannerData.getDetailsURL());
                    oRm.addClass(sStyleClass);
                    oRm.addClass("sapUiInoWidgetBannerLink");
                    oRm.writeClasses();
                    oRm.write(">");
                    oRm.write(oBannerData.getTitle());
                    oRm.write("</a>");
                } else {
                    oRm.write("<div");
                    oRm.addClass(sStyleClass);
                    oRm.writeClasses();
                    oRm.write(">");
                    oRm.writeEscaped(oBannerData.getTitle());
                    oRm.write("</div>");
                }
                oRm.write("</div>");

                iBannerHeight += 40;
            }

            if(oBannerData.getImageId() > 0) {
                if (oBannerData.getDetailsURL()) {
                    oRm.write("<a style='border:none;' target='_blank'");
                    oRm.writeAttributeEscaped("href", oBannerData.getDetailsURL());
                    oRm.write(">");
                }

                var tooltip = oBannerData.getTitle();
                if (oBannerData.getTooltip()) {
                    tooltip = oBannerData.getTooltip();
                }
                oRm.write("<div title='" + tooltip + "'");
                oRm.addClass("sapUiInoWidgetBannerImg");
                oRm.writeClasses();
                oRm.write("style='background-size:");
                if(oBannerData.getImageStyle() == "contain") {
                    oRm.write("contain;background-repeat:no-repeat;");
                } else {
                    oRm.write("cover;");
                }

                oRm.write("background-image: url(");
                var imgSrc = Configuration.getAttachmentTitleImageDownloadURL(oBannerData.getImageId());
            
                oRm.write(imgSrc);
                oRm.write(");'>");
                oRm.write("</div>");

                if (oBannerData.getDetailsURL()) {
                    oRm.write("</a>");
                }

                iBannerHeight += 140;
            }

            oRm.write("</div>");
            return iBannerHeight;
        },

        _renderHeader : function(oRm, oControl) {
            var iHeaderHeight = 1;

            if(oControl.getHeaderText()) {
                oRm.write("<div");
                oRm.addClass("sapUiInoWidgetHeader");
                oRm.writeClasses();
                oRm.write(">");

                oRm.write("<span");
                oRm.addClass("sapUiInoWidgetHeaderText");
                oRm.writeClasses();
                oRm.write(">");
                oRm.writeEscaped(oControl.getHeaderText());
                oRm.write("</span>");

                oRm.write("</div>");
                iHeaderHeight += 40;
            }

            return iHeaderHeight;
        },

        renderer : function(oRm, oControl) {
            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.addClass("sapUiInoWidget");
            if (oControl.getBorderVisible()) {
                oRm.addClass("sapUiInoWidgetBorder");
            }
            oRm.writeClasses();
            oRm.write(">");

            // Banner
            var iHeaderHeight = 0;
            if ( oControl.getBannerVisible() && oControl.getBannerData() ) {
                iHeaderHeight += oControl._renderBanner(oRm, oControl);
            }

            if (oControl.getHeaderText() && oControl.getHeaderVisible()) {
                iHeaderHeight += oControl._renderHeader(oRm, oControl);
            }

            oRm.write("<div");
            oRm.addClass("sapUiInoWidgetScrollableContent");
            oRm.writeClasses();
            var sContentHeight = 'calc(100% - ' + iHeaderHeight + 'px)';
            oRm.write("style='height:" + sContentHeight + "'");
            oRm.write(">");
            if (oControl.getContent()) {
                oRm.renderControl(oControl.getContent());
            }
            oRm.write("</div>");

            oRm.write("</div>");
        }
    });
})();