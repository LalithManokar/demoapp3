/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.IdentityCard");
(function() {
    "use strict";

    jQuery.sap.require("sap.ui.ino.application.Configuration");
    var Configuration = sap.ui.ino.application.Configuration;

    sap.ui.core.Control.extend("sap.ui.ino.controls.IdentityCard", {
        metadata : {
            properties : {
                name : "string",
                phone : "string",
                mobile : "string",
                email : "string",
                office : "string",
                organization : "string",
                costCenter : "string",
                imageId : "string",
                outerMargin : {
                    type : "boolean",
                    defaultValue : false
                }
            }
        },

        renderer : function(oRm, oControl) {
            oRm.write("<div ");
            oRm.writeControlData(oControl);
            oRm.addClass("sapUiInoIdentityCardOuterContainer");
            if(oControl.getOuterMargin()) {
                oRm.addClass("sapUiInoIdentityCardOuterContainerMargin");
            }
            oRm.writeClasses();
            oRm.write(">");

            oRm.write("<table");
            oRm.writeControlData(oControl);
            oRm.addClass("sapUiInoIdentityCardInnerTable");
            oRm.writeAttribute("role", "presentation");
            oRm.writeClasses();
            oRm.write(">");

            oRm.write("<tr>");
            oRm.write("<td rowspan=\"2\"");
            oRm.addClass("sapUiInoIdentityCardIcon");
            oRm.writeClasses();
            oRm.write(">");
            
            var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();

            oRm.write("<div ");
            oRm.addClass("sapUiInoIdentityIconBar");
            oRm.writeClasses();
            oRm.write(">");
            oRm.write("<div ");
            if (oControl.getImageId()) {
                oRm.addClass("sapUiInoIdentityIcon");
                oRm.writeClasses();
                oRm.write(">");
                oRm.write("<img src=" + Configuration.getAttachmentTitleImageDownloadURL(oControl.getImageId()) +
                            " title=\"" + oControl.getName() + "\" class=\"sapUiInoFileUploaderCropImage\" style=\"width: 80px; height: 103px; position: relative; top: 0px; left: 0px;\">");
            } else {
                oRm.addClass("sapUiInoIdentityIconPlaceholder");
                oRm.writeClasses();
                oRm.write(">");
                oRm.write("<div ");
                oRm.writeAttributeEscaped("title", oControl.getName());
                oRm.addClass("sapUiInoDefaultIdentityIcon");
                oRm.writeClasses();
                oRm.write(">");
                oRm.write("</div>");
            }
            oRm.write("</div>");
            oRm.write("</div>");

            oRm.write("</td>");

            oRm.write("<td ");
            oRm.addClass("sapUiInoIdentityCardName");
            oRm.writeClasses();
            oRm.write(">");
            
            oRm.write("<table>");
            oRm.write("<tr>");
            oRm.write("<td>");
            
            if(oControl.getName()) {
                oRm.write("<label");
                oRm.addClass("sapUiInoIdentityCardBold");
                oRm.writeClasses();
                oRm.write(">");
                oRm.write(oControl.getName());
                oRm.write("</label>");
            }
            
            oRm.write("</td>");
            oRm.write("</tr>");
            oRm.write("<tr>");
            oRm.write("<td>");

            if(oControl.getOffice()) {
                oRm.write("<label>");
                oRm.write(oControl.getOffice());
                oRm.write("</label>");
            }
            
            oRm.write("</td>");
            oRm.write("</tr>");
            oRm.write("<tr>");
            oRm.write("<td>");

            var sOrga = oControl.getOrganization();
            if(oControl.getCostCenter()) {
                if(sOrga) {
                    sOrga = sOrga + " - " + oControl.getCostCenter();
                } else {
                    sOrga = oControl.getCostCenter();
                }
            }
            if(sOrga) {
                oRm.write("<label>");
                oRm.write(sOrga);
                oRm.write("</label>");
            }
            
            oRm.write("</td>");
            oRm.write("</tr>");
            oRm.write("</table>");

            oRm.write("</td>");
            oRm.write("</tr>");

            oRm.write("<tr>");

            oRm.write("<td ");
            oRm.addClass("sapUiInoIdentityCardContact");
            oRm.writeClasses();
            oRm.write(">");

            oRm.write("<table>");

            if (oControl.getPhone()) {
                oRm.write("<tr>");
                oRm.write("<td");
                oRm.writeAttributeEscaped("width","15px");
                oRm.write(">");

                oRm.write("<label");
                oRm.addClass("sapUiInoIdentityCardBold");
                oRm.writeClasses();
                oRm.write(">");
                oRm.write(i18n.getText("CTRL_IDENTITYCARD_PHONE"));
                oRm.write(" </label>");
            
                oRm.write("</td>");
                oRm.write("<td>");
            
                oControl._addContactRow(oRm, oControl.getPhone(), "tel:");
                
                oRm.write("</td>");
                oRm.write("</tr>");
            }
            if (oControl.getMobile()) {
                oRm.write("<tr>");
                oRm.write("<td");
                oRm.writeAttributeEscaped("width","15px");
                oRm.write(">");

                oRm.write("<label");
                oRm.addClass("sapUiInoIdentityCardBold");
                oRm.writeClasses();
                oRm.write(">");
                oRm.write(i18n.getText("CTRL_IDENTITYCARD_MOBILE"));
                oRm.write(" </label>");

                oRm.write("</td>");
                oRm.write("<td>");

                oControl._addContactRow(oRm, oControl.getMobile(), "tel:");
                
                oRm.write("</td>");
                oRm.write("</tr>");
            }
            if (oControl.getEmail()) {
                oRm.write("<tr>");
                oRm.write("<td");
                oRm.writeAttributeEscaped("colspan","2");
                oRm.writeAttributeEscaped("style","padding: 0;");
                oRm.write(">");

                oControl._addContactRow(oRm, oControl.getEmail(), "mailto:");

                oRm.write("</td>");
                oRm.write("</tr>");
            }

            oRm.write("</table>");

            oRm.write("</td>");
            oRm.write("</tr>");

            oRm.write("</table>");
            oRm.write("</div>");
        },

        _addContactRow : function(oRm, sText, sLinkPrefix) {
            oRm.write("<a");
            oRm.addClass("sapUiInoIdentityCardContactLink");
            oRm.addClass("sapUiLnk");
            oRm.writeClasses();
            oRm.writeAttributeEscaped("href", sLinkPrefix + sText);
            oRm.writeAttributeEscaped("tabindex", 0);
            oRm.write(">" + sText + "</a>");
        }
    });
})();