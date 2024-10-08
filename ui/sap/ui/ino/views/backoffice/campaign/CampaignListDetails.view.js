/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.controls.TextView");
jQuery.sap.require("sap.ui.ino.views.common.ExtensionPointHelper");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.controls.Repeater");

sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignListDetails", {

    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.campaign.CampaignListDetails";
    },

    setCampaign : function(campaignId) {
        this.getController().onSetCampaign(campaignId);
    },

    bindTags : function() {
        this.oTagRepeater.bindRows("Tags", this.oTagTemplate);
    },

    createContent : function(oController) {

        function labeledTextRow(sLabelText, oTextControl) {

            var oLabel = new sap.ui.commons.Label({
                text : sLabelText,
                design : sap.ui.commons.LabelDesign.Bold
            });

            var oCellLabel = new sap.ui.commons.layout.MatrixLayoutCell({
                hAlign : sap.ui.commons.layout.HAlign.Begin,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                content : [oLabel]
            });
            var oCellText = new sap.ui.commons.layout.MatrixLayoutCell({
                hAlign : sap.ui.commons.layout.HAlign.Begin,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                content : [oTextControl]
            });

            oLabel.setLabelFor(oTextControl);

            return new sap.ui.commons.layout.MatrixLayoutRow({
                cells : [oCellLabel, oCellText]
            });
        };

        var oDetailDataLeft = new sap.ui.commons.layout.MatrixLayout({
            columns : 2,
            widths : ['120px', 'auto']
        });

        oDetailDataLeft.addRow(labeledTextRow("{i18n>BO_CAMPAIGNDETAIL_FLD_SHORT_NAME}", new sap.ui.ino.controls.TextView({
            text : "{SHORT_NAME}"
        })));

        oDetailDataLeft.addRow(labeledTextRow("{i18n>BO_CAMPAIGNDETAIL_FLD_NAME}", new sap.ui.ino.controls.TextView({
            text : "{NAME}"
        })));

        this.oTagRepeater = new sap.ui.ino.controls.Repeater({
            floatHorizontal : true,
            floatHorizontalSeparatorControl : new sap.ui.commons.TextView({
                text : ","
            })
        });

        oDetailDataLeft.addRow(labeledTextRow("{i18n>BO_COMMON_FLD_TAGS}", this.oTagRepeater));

        // binding is done in separate method bindTags at a later point in time
        this.oTagTemplate = new sap.ui.ino.controls.TextView({
            text : "{NAME}"
        });

        oDetailDataLeft.addRow(labeledTextRow("{i18n>BO_CAMPAIGNDETAIL_FLD_DESCRIPTION}", new sap.ui.core.HTML({
            content : {
                path : "DESCRIPTION",
                formatter : function(sDescription) {
                    sDescription = sDescription ? sDescription : "";

                    // content is expected to be wrapped by proper HTML
                    // we ensure this by adding the divs around it
                    return "<div style='word-wrap: break-word;'>" + sDescription + "</div>";
                }
            },
            sanitizeContent : true
        })));

        var oLeftLayout = new sap.ui.layout.VerticalLayout({
            content : [oDetailDataLeft]
        });

        var oDetailDataRight = new sap.ui.commons.layout.MatrixLayout({
            columns : 2,
            widths : ['150px', 'auto']
        });

        oDetailDataRight.addRow(labeledTextRow("{i18n>BO_CAMPAIGNDETAIL_CKL_IS_BLACKBOX}", new sap.ui.commons.CheckBox({
            editable : false,
            checked : {
                path : "IS_BLACK_BOX",
                formatter : function(sVal) {
                    return sVal == 1;
                }
            }
        })));

        oDetailDataRight.addRow(labeledTextRow("{i18n>BO_CAMPAIGNDETAIL_FLD_CREATED_AT}", new sap.ui.ino.controls.TextView({
            text : {
                path : "CREATED_AT",
                type : new sap.ui.model.type.Date()
            }
        })));

        oDetailDataRight.addRow(labeledTextRow("{i18n>BO_CAMPAIGNDETAIL_FLD_CREATED_BY}", new sap.ui.commons.Link({
            text : "{CREATED_BY_NAME}",
            press : sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CREATED_BY_ID", "user")
        })));

        oDetailDataRight.addRow(labeledTextRow("{i18n>BO_CAMPAIGNDETAIL_FLD_CHANGED_AT}", new sap.ui.ino.controls.TextView({
            text : {
                path : "CHANGED_AT",
                type : new sap.ui.model.type.Date()
            }
        })));

        oDetailDataRight.addRow(labeledTextRow("{i18n>BO_CAMPAIGNDETAIL_FLD_CHANGED_BY}", new sap.ui.commons.Link({
            text : "{CHANGED_BY_NAME}",
            press : sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CHANGED_BY_ID", "user")
        })));

        var oRightLayout = new sap.ui.layout.VerticalLayout({
            content : [oDetailDataRight]
        });

        // EXTENSION POINT
        sap.ui.ino.views.common.ExtensionPointHelper.handleExtensionFields(sap.ui.xmlfragment("sap.ui.ino.views.backoffice.extension.CampaignListDetailsExtension", oController), undefined, function(oExtensionField) {
            oRightLayout.addContent(oExtensionField);
        });

        var oLayout = new sap.ui.commons.layout.MatrixLayout({
            columns : 3,
            widths : ['40%', '10%', 'auto']
        });

        oLayout.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
            content : oLeftLayout,
            padding : sap.ui.commons.layout.Padding.End,
            vAlign : sap.ui.commons.layout.VAlign.Top,
            hAlign : sap.ui.commons.layout.HAlign.Begin
        }), // dummy layout cell
        new sap.ui.commons.layout.MatrixLayoutCell({
            padding : sap.ui.commons.layout.Padding.End,
            vAlign : sap.ui.commons.layout.VAlign.Top,
            hAlign : sap.ui.commons.layout.HAlign.Begin
        }), new sap.ui.commons.layout.MatrixLayoutCell({
            content : oRightLayout,
            padding : sap.ui.commons.layout.Padding.Both,
            vAlign : sap.ui.commons.layout.VAlign.Top,
            hAlign : sap.ui.commons.layout.HAlign.Begin
        }));

        // This is important to take the full height of the shell content
        this.setHeight('100%');
        // this avoids scrollbars for 100% height
        this.setDisplayBlock(true);

        var oPanel = new sap.ui.commons.Panel({
            content : oLayout,
            showCollapseIcon : false,
            areaDesign : sap.ui.commons.enums.AreaDesign.Plain,
            borderDesign : sap.ui.commons.enums.BorderDesign.None,
            text : "{i18n>BO_CAMPAIGN_LIST_DETAILS_HEADER}"
        }).addStyleClass("sapUiInoCampaignListDetail");

        this.bindTags();

        return oPanel;
    },

});