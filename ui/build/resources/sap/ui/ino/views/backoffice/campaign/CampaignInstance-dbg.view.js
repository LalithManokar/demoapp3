/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOView");
jQuery.sap.require("sap.ui.ino.controls.ThemeFactory");
jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.models.core.PropertyModel");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.models.formatter.GenericFormatter");
jQuery.sap.require("sap.ui.ino.models.object.Campaign");

var Configuration = sap.ui.ino.application.Configuration;

sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignInstance", jQuery.extend({}, sap.ui.ino.views.common.ThingInspectorAOView, {

    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.campaign.CampaignInstance";
    },

    createHeaderContent : function() {
        var oController = this.getController();

        this.removeAllHeaderGroups();

        /**
         * Title information
         */
        var oTitleContent = new sap.ui.commons.layout.MatrixLayout({
            rows : [new sap.ui.commons.layout.MatrixLayoutRow({
                cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                    hAlign : sap.ui.commons.layout.HAlign.Center,
                    vAlign : sap.ui.commons.layout.VAlign.Top,
                    content : [new sap.ui.commons.TextView({
                        text : this.getBoundPath("NAME", true),
                        design : sap.ui.commons.TextViewDesign.Bold
                    })],
                    colSpan : 2
                })]
            })],
            widths : ["40%", "60%"]
        });

        this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
            title : oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_ROW_TITLE"),
            content : oTitleContent
        }));

        /**
         * Image
         */
        var oImageContent = new sap.ui.commons.layout.MatrixLayout({
            rows : [new sap.ui.commons.layout.MatrixLayoutRow({
                cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                    hAlign : sap.ui.commons.layout.HAlign.Begin,
                    vAlign : sap.ui.commons.layout.VAlign.Top,
                    content : [new sap.ui.core.HTML({
                        content : {
                            path : this.getFormatterPath("CAMPAIGN_IMAGE_ID", true),
                            formatter : function(iId) {
                                if (iId) {
                                    // getAttachmentTitleImageDownloadURL cannot be used as in write mode
                                    // the title image attachment may not have an assignment to an idea and is therefore
                                    // not returned
                                    return "<div class='sapUiInoCampaignImageSidebar' style='background-image: url(" + Configuration.getAttachmentDownloadURL(iId) + ")' />";
                                } else {
                                    return "<div class='sapUiInoCampaignNoImageContainer'><p class='sapUiInoCampaignNoImageText'>" + oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_FLD_NO_DETAIL_IMAGE") + "</p></div>";
                                }
                            }
                        },
                        sanitizeContent : true
                    })],
                    colSpan : 2
                })]
            })],
            widths : ["40%", "60%"]
        });

        this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
            content : oImageContent
        }));

        var bUsageReportingActive = sap.ui.ino.application.Configuration.isUsageReportingActive();
        if (bUsageReportingActive) {
            var oParticipantsRow = this.createRow(oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_FLD_PARTICIPANTS_COUNT"), 1, new sap.ui.commons.TextView({
                text : {
                    path : this.getFormatterPath("PARTICIPANTS_COUNT", true),
                    formatter : function(iCount) {
                        if (!iCount) {
                            return 1;
                        }
                        return iCount;
                    }
                }
            }), 1, oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_FLD_PARTICIPANTS_COUNT"));

            var oVisitorsRow = this.createRow(oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_FLD_UNIQUE_VISITORS"), 1, new sap.ui.commons.TextView({
                text : {
                    path : this.getFormatterPath("ACTIVE_PARTICIPANT_COUNT", true),
                    formatter : function(iCount) {
                        if (!iCount) {
                            return 1;
                        }
                        return iCount;
                    }
                }
            }), 1, oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_FLD_UNIQUE_VISITORS"));

            var oViewsRow = this.createRow(oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_FLD_VIEWS"), 1, new sap.ui.commons.TextView({
                text : {
                    path : this.getFormatterPath("VIEW_COUNT", true),
                    formatter : function(iCount) {
                        if (!iCount) {
                            return 1;
                        }
                        return iCount;
                    }
                }
            }), 1, oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_FLD_VIEWS"));

        }
        

        
        

        /**
         * General information
         */
        var oGeneralContent = new sap.ui.commons.layout.MatrixLayout({
            rows : [this.createRow(oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_FLD_STARTDATE"), 1, new sap.ui.commons.TextView({
                text : {
                    path : this.getFormatterPath("VALID_FROM", true),
                    type : new sap.ui.model.type.Date({
                        style : "medium"
                    })
                }
            }), 1, oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_FLD_STARTDATE")), this.createRow(oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_FLD_ENDDATE"), 1, new sap.ui.commons.TextView({
                text : {
                    path : this.getFormatterPath("VALID_TO", true),
                    type : new sap.ui.model.type.Date({
                        style : "medium"
                    }),
                    formatter : function(sDate) {
                        var dEnd = new Date(sDate);
                        var dInfinity = new Date("Dec 31 9999");
                        if (dEnd >= dInfinity) {
                            return oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_FLD_INFINITE");
                        } else {
                            return sDate;
                        }
                    }
                }
            }), 1, oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_FLD_ENDDATE")), new sap.ui.commons.layout.MatrixLayoutRow({
                cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                    hAlign : sap.ui.commons.layout.HAlign.Begin,
                    vAlign : sap.ui.commons.layout.VAlign.Top,
                    content : [new sap.ui.core.HTML({
                        content : {
                            path : this.getFormatterPath("ID", true),
                            formatter : function(iId) {
                                if (iId > 0) {
                                    return "<br/>";
                                } else {
                                    return undefined;
                                }
                            }
                        },
                        sanitizeContent : true
                    })],
                    colSpan : 2
                })]
            }),         this.createRow(oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_FLD_IDEAS"), 1, new sap.ui.commons.TextView({
                text : {
                    path : this.getFormatterPath("ALL_IDEAS_COUNT", true)
                }
            }), 1, oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_FLD_IDEAS")), oParticipantsRow, oVisitorsRow, oViewsRow, new sap.ui.commons.layout.MatrixLayoutRow({
                cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                    hAlign : sap.ui.commons.layout.HAlign.Begin,
                    vAlign : sap.ui.commons.layout.VAlign.Top,
                    content : [new sap.ui.core.HTML({
                        content : {
                            path : this.getFormatterPath("ID", true),
                            formatter : function(iId) {
                                if (iId > 0) {
                                    return "<br/>";
                                } else {
                                    return undefined;
                                }
                            }
                        },
                        sanitizeContent : true
                    })],
                    colSpan : 2
                })]
            }),

            new sap.ui.commons.layout.MatrixLayoutRow({
                cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                    hAlign : sap.ui.commons.layout.HAlign.Center,
                    vAlign : sap.ui.commons.layout.VAlign.Top,
                    content : [new sap.ui.commons.Link({
                        text : {
                            path : this.getFormatterPath("STATUS_CODE", true),
                            formatter : function(sStatus) {
                                if (sStatus === sap.ui.ino.models.object.Campaign.Status.Published) {
                                    return oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_LNK_OPEN_FO_CAMPAIGN");
                                } else {
                                    return oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_LNK_PREVIEW_FO_CAMPAIGN");
                                }
                            }
                        },
                        target : "_blank",
                        press : function(oEvent) {
                            var oApp = sap.ui.ino.application.ApplicationBase.getApplication();
                            oApp.navigateToExternal('sap.ino.config.URL_PATH_UI_FRONTOFFICE', 'campaign', oController.getModel().getProperty("/ID"));
                        },
                        visible : {
                            path : this.getFormatterPath("ID", true),
                            formatter : function(iId) {
                                return (iId > 0);
                            },
                            type : null
                        }
                    })],
                    colSpan : 2
                })]
            })],
            widths : ["40%", "60%"]
        });

        this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
            title : oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_ROW_GENERAL"),
            content : oGeneralContent
        }));

        /**
         * Status information
         */
        var oStatusContent = new sap.ui.commons.layout.MatrixLayout({
            rows : [new sap.ui.commons.layout.MatrixLayoutRow({
                cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                    hAlign : sap.ui.commons.layout.HAlign.Center,
                    vAlign : sap.ui.commons.layout.VAlign.Top,
                    content : [new sap.ui.commons.TextView({
                        text : {
                            path : this.getFormatterPath("STATUS_CODE", true),
                            formatter : function(sStatus) {
                                if (sStatus) {
                                    return oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_FLD_STATUSCODE_" + sStatus);
                                } else {
                                    return oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_FLD_EMPTY_STATUSCODE");
                                }
                            }
                        },
                        design : sap.ui.commons.TextViewDesign.Bold
                    })],
                    colSpan : 2
                })]
            })],
            widths : ["40%", "60%"]
        });

        this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
            title : oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_ROW_STATUS"),
            content : oStatusContent
        }));

        var oAdminDataContent = new sap.ui.commons.layout.MatrixLayout({
            rows : [this.createRow(this.getText("BO_CAMPAIGN_INSTANCE_FLD_ID"), new sap.ui.commons.TextView({
                text : {
                    path : this.getFormatterPath("ID", true),
                    formatter : sap.ui.ino.models.formatter.GenericFormatter.formatIdNoHandle
                }
            })), this.createRow(this.getText("BO_CAMPAIGNDETAIL_FLD_CREATED_AT"), new sap.ui.commons.TextView({
                text : {
                    path : this.getFormatterPath("CREATED_AT", true),
                    type : new sap.ui.model.type.Date()
                }
            })), this.createRow(this.getText("BO_CAMPAIGNDETAIL_FLD_CREATED_BY"), new sap.ui.commons.Link({
                text : {
                    path : this.getFormatterPath("CREATED_BY_NAME", true)
                },
                visible : {
                    path : this.getFormatterPath("CREATED_BY_NAME", true),
                    formatter : function(sName) {
                        return (sName != null);
                    }
                },
                press : sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CREATED_BY_ID", "user")
            })), this.createRow(this.getText("BO_CAMPAIGNDETAIL_FLD_CHANGED_AT"), new sap.ui.commons.TextView({
                text : {
                    path : this.getFormatterPath("CHANGED_AT", true),
                    type : new sap.ui.model.type.Date()
                }
            })), this.createRow(this.getText("BO_CAMPAIGNDETAIL_FLD_CHANGED_BY"), new sap.ui.commons.Link({
                text : {
                    path : this.getFormatterPath("CHANGED_BY_NAME", true)
                },
                visible : {
                    path : this.getFormatterPath("CHANGED_BY_NAME", true),
                    formatter : function(sName) {
                        return (sName != null);
                    }
                },
                press : sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CHANGED_BY_ID", "user")
            }))],
            widths : ["40%", "60%"]
        });

        this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
            title : this.getText("BO_CAMPAIGN_INSTANCE_ADMIN_DATA_TIT"),
            content : oAdminDataContent
        }));

        this.refreshHeaderGroups();
    },

    setThingInspectorConfiguration : function() {
        var oController = this.getController();
        var oView = this;
        this.sType = "Campaign";
        this.sHelpContext = "BO_CAMPAIGN_DETAIL";
        this.sAdditionalHelpContext = "BO_CAMPAIGN_DETAIL_ADDITIONAL";

        this.oSettings.firstTitle = null;
        this.oSettings.type = oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_TIT_TYPE");
        this.oSettings.icon = sap.ui.ino.controls.ThemeFactory.getImage("campaign_48x48.png");

        this.addFacet("sap.ui.ino.views.backoffice.campaign.CampaignGeneralDataFacet", oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_TIT_GENERAL"));
        this.addFacet("sap.ui.ino.views.backoffice.campaign.CampaignLandingPageFacet", oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_TIT_LANDINGPAGE"));
        this.addFacet("sap.ui.ino.views.backoffice.campaign.CampaignSettingPageFacet", oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_TIT_CAMPAIGN_MILESTONES"));
        this.addFacet("sap.ui.ino.views.backoffice.campaign.CampaignProcessFacet", oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_TIT_PROCESS"));
        this.addFacet("sap.ui.ino.views.backoffice.campaign.CampaignRolesFacet", oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_TIT_ROLES"));
        this.addFacet("sap.ui.ino.views.backoffice.campaign.CampaignIntegrationFacet", oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_TIT_INTEGRATION"));
        
        // Email Notification Facet
        var oSystemSetting = sap.ui.ino.application.Configuration.getSystemSettingsModel();
		var isEnableNewNotification = oSystemSetting.getProperty("/sap.ino.config.ENABLE_NEW_NOTIFICATION") === "0" ? false : true;
        if (isEnableNewNotification) {
            this.addFacet("sap.ui.ino.views.backoffice.campaign.CampaignMailNotificationFacet", oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_TIT_MAIL_NOTIFICATION"));
        } else {
            this.addFacet("sap.ui.ino.views.backoffice.campaign.CampaignMailTemplateFacet", oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_TIT_MAIL_TEMPLATE"));
        }
        
        this.addFacet("sap.ui.ino.views.backoffice.campaign.CampaignActivitiesFacet", oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_TIT_ACTIVITIES"));

        var oSubmit = new sap.ui.ux3.ThingAction({
            text : oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_BUT_SUBMIT"),
            // we only need this in the edit mode
            enabled : "{" + oController.getModelPrefix() + "/property/actions/publish/enabled}",
            tooltip : {
                parts : [{
                    path : oController.getModelPrefix() + "/property/actions/create/messages"
                }, {
                    path : oController.getModelPrefix() + "/property/actions/update/messages"
                }, {
                    path : oController.getModelPrefix() + "/property/actions/submit/messages"
                }],
                formatter : function(aCreateMessages, aUpdateMessages, aSubmitMessages) {
                    var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG).getResourceBundle();
                    if (oView.iId > 0 && aSubmitMessages && aSubmitMessages.length > 0) {
                        return oMsg.getText(aSubmitMessages[0].MESSAGE);
                    } else if (oView.iId > 0 && aUpdateMessages && aUpdateMessages.length > 0) {
                        return oMsg.getText(aUpdateMessages[0].MESSAGE);
                    } else if (oView.iId < 0 && aCreateMessages && aCreateMessages.length > 0) {
                        return oMsg.getText(aCreateMessages[0].MESSAGE);
                    } else {
                        return undefined;
                    }
                }
            },
            select : [oController.onSubmit, oController]
        });
        this.addAction(oSubmit, false, true);

        var oSave = new sap.ui.ux3.ThingAction({
            text : oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_BUT_SAVE"),
            // we only need this in the edit mode
            enabled : "{" + oController.getModelPrefix() + "/property/actions/save/enabled}",
            tooltip : {
                parts : [{
                    path : oController.getModelPrefix() + "/property/actions/create/messages"
                }, {
                    path : oController.getModelPrefix() + "/property/actions/update/messages"
                }],
                formatter : function(aCreateMessages, aUpdateMessages) {
                    var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG).getResourceBundle();
                    if (oView.iId > 0 && aUpdateMessages && aUpdateMessages.length > 0) {
                        return oMsg.getText(aUpdateMessages[0].MESSAGE);
                    } else if (oView.iId < 0 && aCreateMessages && aCreateMessages.length > 0) {
                        return oMsg.getText(aCreateMessages[0].MESSAGE);
                    } else {
                        return undefined;
                    }
                }
            },
            select : [oController.onSave, oController]
        });
        this.addAction(oSave, false, true);

        var oEdit = new sap.ui.ux3.ThingAction({
            text : oController.getTextModel().getText("BO_CAMPAIGN_INSTANCE_BUT_EDIT"),
            enabled : {
                path : this.getFormatterPath("ID", true),
                type : null,
                formatter : function(iId) {
                    var fnSave = sap.ui.ino.models.core.PropertyModel.getActionEnabledStaticFormatter("sap.ino.xs.object.campaign.Campaign", "update");
                    var fnSubmit = sap.ui.ino.models.core.PropertyModel.getActionEnabledStaticFormatter("sap.ino.xs.object.campaign.Campaign", "submit");
                    return fnSave(iId) || fnSubmit(iId);
                }
            },
            select : [oController.onEdit, oController]
        });
        this.addAction(oEdit, true, false);

        this.addStandardButtons({
            save : false,
            edit : false,
            cancel : true,
            del : true,
            toggleClipboard : true
        });
    }
}));