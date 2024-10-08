/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.controls.TextView");
jQuery.sap.require("sap.ui.ino.models.formatter.DateFormatter");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");

sap.ui.jsview("sap.ui.ino.views.backoffice.campaign.CampaignActivitiesDetails", {

    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.campaign.CampaignActivitiesDetails";
    },

    getFacetView : function() {
        return this._oFacetView;
    },

    setFacetView : function(oFacetView) {
        this._oFacetView = oFacetView;
    },

    createContent : function(oController) {
        var that = this;
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
        }

        var oDetailDataLeft = new sap.ui.commons.layout.MatrixLayout({
            columns : 2,
            widths : ["20%", "auto"]
        });

        oDetailDataLeft.addRow(labeledTextRow("{i18n>BO_IDEA_PROCESS_LOG_ROW_ACTION}", new sap.ui.ino.controls.TextView({
            text : {
                path : "HISTORY_BIZ_EVENT",
                formatter : function(event) {
                    var sStatus = "";
                    if (event) {
                        if (event.indexOf("STATUS_ACTION_") === 0) {
                            sStatus = sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.status.Action.Root", event.substring(14));
                        } else {
                            sStatus = that.getFacetView().getThingInspectorView().getText("BO_EVENT_" + event);
                        }
                    }
                    return sStatus;
                }
            }
        })));

        oDetailDataLeft.addRow(labeledTextRow("{i18n>BO_CAMPAIGNDETAIL_FLD_CHANGED_BY}", new sap.ui.ino.controls.TextView({
            text : "{HISTORY_ACTOR_NAME}"
        })));

        oDetailDataLeft.addRow(labeledTextRow("{i18n>BO_CAMPAIGNDETAIL_FLD_CHANGED_AT}", new sap.ui.ino.controls.TextView({
            text : {
                path : "HISTORY_AT",
                formatter : sap.ui.ino.models.formatter.DateFormatter.formatInfinityWithTime
            }
        })));

        oDetailDataLeft.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
            cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                hAlign : sap.ui.commons.layout.HAlign.Begin,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                content : [new sap.ui.commons.Label({
                    text : " ",
                    design : sap.ui.commons.LabelDesign.Bold
                })],
                colSpan : 2
            })]
        }));

        var oRowRepeater = new sap.ui.commons.RowRepeater({
            numberOfRows : 7,
            noData : new sap.ui.commons.TextView({
                text : "{i18n>BO_CAMPAIGNDETAIL_NO_DATA}"
            })
        });
        oRowRepeater.bindRows({
            path : "Details",
            factory : function(sId, oContext) {
                if (oContext) {
                    switch (oContext.getProperty("CHANGE_EVENT")) {
                        case "ACTION_SUBMIT_TO_CHANGED" :
                        case "ACTION_SUBMIT_FROM_CHANGED" :
                        case "ACTION_VALID_TO_CHANGED" :
                        case "ACTION_VALID_FROM_CHANGED" :
                        case "ACTION_REGISTER_TO_CHANGED" :
                        case "ACTION_REGISTER_FROM_CHANGED" :
                            return oController.getView().createDateChangedTemplate(oContext);
                        case "ACTION_IDEA_CONTENT_EDITABLE_CHANGED" :
                        case "ACTION_PHASE_VOTING_ACTIVE_CHANGED" :
                        case "ACTION_SHOW_IDEA_IN_COMMUNITY_CHANGED" :
                        case "ACTION_BLACK_BOX_CHANGED" :
                        case "ACTION_IS_REGISTER_AUTO_APPROVE_CHANGED" :
                        case "ACTION_REWARD_CHANGED" :    
                        case "ACTION_GAMIFICATION_ENABLE_CHANGED" : 
                            return oController.getView().createBooleanChangedTemplate(oContext);
                        case "ACTION_CAMPAIGN_SUBMITTED" :
                            return oController.getView().createCampaignSubmittedTemplate(oContext);
                        case "ACTION_VOTE_TYPE_CODE_CHANGED" :
                            return oController.getView().createVoteTypeChangedTemplate(oContext);
                        case "ACTION_TITLE_CHANGED" :
                        case "ACTION_MAIL_TEMPLATE_CHANGED" :
                        case "ACTION_MAIL_SUCCESS_TEXT_CHANGED" :
                        case "ACTION_MAIL_REJECTION_TEXT_CHANGED" :
                        case "ACTION_MAIL_PHASE_CHANGE_TEXT_CHANGED" :
                        case "ACTION_FORM_CODE_CHANGED" :
                        case "ACTION_RESP_CODE_CHANGED" :
                        case "ACTION_REWARD_UNIT_CODE_CHANGED" :    
                        case "ACTION_SHORT_TITLE_CHANGED" :
                        case "ACTION_DESCRIPTION_CHANGED" :    
                            return oController.getView().createStringChangedTemplate(oContext);
                        case "ACTION_COLOR_CODE_CHANGED" :
                            return oController.getView().createColorChangedTemplate(oContext);
                        case "ACTION_PROCESS_CHANGED" :
                            return oController.getView().createProcessChangedTemplate(oContext, "Process");
                        case "ACTION_MANAGERS_CHANGED" :
                            return oController.getView().createRolesChangedTemplate(oContext, "Managers");
                        case "ACTION_PARTICIPANTS_CHANGED" :
                            return oController.getView().createRolesChangedTemplate(oContext, "Participants");
                        case "ACTION_EXPERTS_CHANGED" :
                            return oController.getView().createRolesChangedTemplate(oContext, "Experts");
                        case "ACTION_COACHES_CHANGED" :
                            return oController.getView().createRolesChangedTemplate(oContext, "Coaches");
                        default :
                            return new sap.ui.commons.TextView({
                                text : ""
                            });
                    }
                } else {
                    return new sap.ui.commons.TextView({
                        text : ""
                    });
                }
            },
            sorter : new sap.ui.model.Sorter("ORDER_NUMBER", false)
        });

        var oVerticalLayout = new sap.ui.commons.layout.VerticalLayout({
            columns : 1
        });

        oVerticalLayout.addContent(oDetailDataLeft);
        oVerticalLayout.addContent(oRowRepeater);

        var oPanel = new sap.ui.commons.Panel({
            content : [oVerticalLayout],
            showCollapseIcon : false,
            areaDesign : sap.ui.commons.enums.AreaDesign.Plain,
            borderDesign : sap.ui.commons.enums.BorderDesign.None
        });

        return oPanel;
    },

    createCampaignSubmittedTemplate : function(oContext) {
        var that = this;
        return new sap.ui.commons.TextView({
            text : {
                path : "CHANGE_EVENT",
                formatter : function(event) {
                    var sStatus = "";
                    if (event) {
                        if (event.indexOf("STATUS_ACTION_") === 0) {
                            sStatus = sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.status.Action.Root", event.substring(14));
                        } else {
                            sStatus = that.getFacetView().getThingInspectorView().getText("BO_EVENT_CAMPAIGN_" + event);
                        }
                    }
                    return sStatus;
                }
            },
            design : sap.ui.commons.TextViewDesign.Bold
        });
    },

    createProcessChangedTemplate : function(oContext, sSuffix) {
        var that = this;
        return this.createValueChangedTemplateWrapper(oContext, function() {
            return that.createProcessTable(oContext, "New" + sSuffix);
        }, function() {
            return that.createProcessTable(oContext, "Old" + sSuffix);
        });
    },

    createProcessTable : function(oContext, sBindingPath) {
        var oTable = new sap.ui.table.Table({
            enableColumnReordering : false,
            selectionMode : sap.ui.table.SelectionMode.None,
            visibleRowCount : 5
        });

        var oPhaseColumn = new sap.ui.table.Column({
            label : new sap.ui.commons.Label({
                text : "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_PHASE_HEADER}"
            }),
            template : new sap.ui.commons.TextView({
                text : "{PHASE_NAME}"
            })
        });
        oTable.addColumn(oPhaseColumn);

        var oStatusModelColumn = new sap.ui.table.Column({
            label : new sap.ui.commons.Label({
                text : "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_STATUS_MODEL_HEADER}"
            }),
            template : new sap.ui.commons.TextView({
                text : {
                    path : "STATUS_MODEL_CODE",
                    formatter : sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.status.Model.Root")
                }
            })
        });
        oTable.addColumn(oStatusModelColumn);

        var oEvalModelColumn = new sap.ui.table.Column({
            label : new sap.ui.commons.Label({
                text : "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_EVAL_MODEL_HEADER}"
            }),
            template : new sap.ui.commons.TextView({
                text : {
                    path : "EVALUATION_MODEL_CODE",
                    formatter : sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.evaluation.Model.Root")
                }
            })
        });
        oTable.addColumn(oEvalModelColumn);

        var oAutoPublEvalColumn = new sap.ui.table.Column({
            label : new sap.ui.commons.Label({
                text : "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_AUTO_PUB_EVAL_HEADER}"
            }),
            template : new sap.ui.commons.TextView({
                text : {
                    path : "AUTO_EVAL_PUB_CODE",
                    formatter : sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.evaluation.AutoPublication.Root")
                }
            })
        });
        oTable.addColumn(oAutoPublEvalColumn);

        var oVoteColumn = new sap.ui.table.Column({
            label : new sap.ui.commons.Label({
                text : "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_VOTE_HEADER}"
            }),
            template : new sap.ui.commons.CheckBox({
                editable : false,
                checked : {
                    path : "VOTING_ACTIVE",
                    type : new sap.ui.ino.models.types.IntBooleanType()
                }
            })
        });
        oTable.addColumn(oVoteColumn);

        var oCommunityColumn = new sap.ui.table.Column({
            label : new sap.ui.commons.Label({
                text : "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_COMMUNITY_HEADER}"
            }),
            template : new sap.ui.commons.CheckBox({
                editable : false,
                checked : {
                    path : "SHOW_IDEA_IN_COMMUNITY",
                    type : new sap.ui.ino.models.types.IntBooleanType()
                }
            })
        });
        oTable.addColumn(oCommunityColumn);

        var oEditColumn = new sap.ui.table.Column({
            label : new sap.ui.commons.Label({
                text : "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_EDITABLE_HEADER}"
            }),
            template : new sap.ui.commons.CheckBox({
                editable : false,
                checked : {
                    path : "IDEA_CONTENT_EDITABLE",
                    type : new sap.ui.ino.models.types.IntBooleanType()
                }
            })
        });
        oTable.addColumn(oEditColumn);

        var oSelfAssessmentColumn = new sap.ui.table.Column({
            label : new sap.ui.commons.Label({
                text : "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_SELF_ASSESSMENT_HEADER}"
            }),
            template : new sap.ui.commons.CheckBox({
                editable : false,
                checked : {
                    path : "SELF_EVALUATION_ACTIVE",
                    type : new sap.ui.ino.models.types.IntBooleanType()
                }
            })
        });
        oTable.addColumn(oSelfAssessmentColumn);

        oTable.bindRows({
            path : sBindingPath,
            sorter : new sap.ui.model.Sorter("SEQUENCE_NO")
        });

        return oTable;
    },

    createRolesChangedTemplate : function(oContext, sSuffix) {
        var that = this;
        return this.createValueChangedTemplateWrapper(oContext, function() {
            return that.createRoleTable(oContext, "New" + sSuffix);
        }, function() {
            return that.createRoleTable(oContext, "Old" + sSuffix);
        });
    },

    createRoleTable : function(oContext, sPath) {
        var oController = this.getController();

        function sendMail(aRecipients) {
            oController.sendMail(aRecipients);
        }

        var oIdentityTemplate = sap.ui.ino.application.backoffice.ControlFactory.createIdentityTemplate(undefined, "IDENTITY_ID", false, true, false, function() {
        }, sendMail);

        var oRowRepeater = new sap.ui.commons.RowRepeater({
            numberOfRows : 10
        });

        oRowRepeater.bindRows({
            path : sPath,
            template : oIdentityTemplate
        });

        return oRowRepeater;
    },

    createColorChangedTemplate : function(oContext) {
        var fnColorValueControlBuilder = function(sPath) {
            return new sap.ui.core.HTML({
                content : {
                    path : sPath,
                    formatter : function(sColor) {
                        sColor = sColor || "FFFFFF";
                        sColor = "#" + sColor;
                        return "<div class='sapUiInoCampaignColorSample' style='background-color: " + sColor + ";'></div>";
                    }
                },
                sanitizeContent : true
            });
        };

        return this.createValueChangedTemplateWrapper(oContext, fnColorValueControlBuilder, fnColorValueControlBuilder);
    },

    createDateChangedTemplate : function(oContext) {
        var fnDateValueControlBuilder = function(sPath) {
            return new sap.ui.commons.TextView({
                text : {
                    path : sPath,
                    formatter : sap.ui.ino.models.formatter.DateFormatter.formatInfinity
                }
            });
        };

        return this.createValueChangedTemplateWrapper(oContext, fnDateValueControlBuilder, fnDateValueControlBuilder);
    },

    createVoteTypeChangedTemplate : function(oContext) {
        var fnTextValueControlBuilder = function(sPath) {
            return new sap.ui.commons.TextView({
                text : {
                    path : sPath,
                    formatter : sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.campaign.VoteType.Root")
                }
            });
        };

        return this.createValueChangedTemplateWrapper(oContext, fnTextValueControlBuilder, fnTextValueControlBuilder);
    },

    createStringChangedTemplate : function(oContext) {
        var fnTextValueControlBuilder = function(sPath) {
            return new sap.ui.commons.TextView({
                text : {
                    path : sPath
                }
            });
        };

        return this.createValueChangedTemplateWrapper(oContext, fnTextValueControlBuilder, fnTextValueControlBuilder);
    },

    createBooleanChangedTemplate : function(oContext) {
        var fnBooleanValueControlBuilder = function(sPath) {
            return new sap.ui.commons.CheckBox({
                editable : false,
                checked : {
                    path : sPath,
                    type : new sap.ui.ino.models.types.IntBooleanType()
                }
            });
        };

        return this.createValueChangedTemplateWrapper(oContext, fnBooleanValueControlBuilder, fnBooleanValueControlBuilder);
    },

    createValueChangedTemplateWrapper : function(oContext, fnNewValueControlBuilder, fnOldValueControlBuilder) {
        if (oContext.getProperty("BIZ_EVENT") === "CAMP_CREATED") {
            return this.createNewValueTemplate(oContext, fnNewValueControlBuilder(oContext.getProperty("CHANGED_ATTRIBUTE_TYPE").toUpperCase() + "_NEW_VALUE"));
        } else {
            return this.createValueChangedTemplate(oContext, fnNewValueControlBuilder(oContext.getProperty("CHANGED_ATTRIBUTE_TYPE").toUpperCase() + "_NEW_VALUE"), fnOldValueControlBuilder(oContext.getProperty("CHANGED_ATTRIBUTE_TYPE").toUpperCase() + "_OLD_VALUE"));
        }
    },

    createValueChangedTemplate : function(oContext, oNewValueControl, oOldValueControl) {
        var that = this;
        var oMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
            columns : 3,
            widths : ["20%", "10%", "70%"]
        });

        var oEventDetailLabel = new sap.ui.commons.Label({
            text : {
                path : "CHANGE_EVENT",
                formatter : function(event) {
                    var sStatus = "";
                    if (event) {
                        if (event.indexOf("STATUS_ACTION_") === 0) {
                            sStatus = sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.status.Action.Root", event.substring(14));
                        } else {
                            sStatus = that.getFacetView().getThingInspectorView().getText("BO_EVENT_CAMPAIGN_" + event);
                        }
                    }
                    return sStatus;
                }
            },
            design : sap.ui.commons.LabelDesign.Bold
        });
        var oEventDetailLabelCell = new sap.ui.commons.layout.MatrixLayoutCell({
            hAlign : sap.ui.commons.layout.HAlign.Begin,
            vAlign : sap.ui.commons.layout.VAlign.Top,
            content : [oEventDetailLabel],
            rowSpan : 2
        });

        var oNewValueLabel = new sap.ui.commons.Label({
            text : "{i18n>BO_CAMPAIGN_ACTIVITY_LOG_NEW_VALUE}"
        });
        var oNewValueLabelCell = new sap.ui.commons.layout.MatrixLayoutCell({
            hAlign : sap.ui.commons.layout.HAlign.Begin,
            vAlign : sap.ui.commons.layout.VAlign.Top,
            content : [oNewValueLabel]
        });

        var oNewValue = oNewValueControl;
        var oNewValueCell = new sap.ui.commons.layout.MatrixLayoutCell({
            hAlign : sap.ui.commons.layout.HAlign.Begin,
            vAlign : sap.ui.commons.layout.VAlign.Top,
            content : [oNewValue]
        });
        oNewValueLabel.setLabelFor(oNewValue);

        oMatrixLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
            cells : [oEventDetailLabelCell, oNewValueLabelCell, oNewValueCell]
        }));

        var oOldValueLabel = new sap.ui.commons.Label({
            text : "{i18n>BO_CAMPAIGN_ACTIVITY_LOG_OLD_VALUE}"
        });
        var oOldValueLabelCell = new sap.ui.commons.layout.MatrixLayoutCell({
            hAlign : sap.ui.commons.layout.HAlign.Begin,
            vAlign : sap.ui.commons.layout.VAlign.Top,
            content : [oOldValueLabel]
        });

        var oOldValue = oOldValueControl;
        var oOldValueCell = new sap.ui.commons.layout.MatrixLayoutCell({
            hAlign : sap.ui.commons.layout.HAlign.Begin,
            vAlign : sap.ui.commons.layout.VAlign.Top,
            content : [oOldValue]
        });
        oOldValueLabel.setLabelFor(oOldValue);

        oMatrixLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
            cells : [oOldValueLabelCell, oOldValueCell]
        }));

        oMatrixLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
            cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                hAlign : sap.ui.commons.layout.HAlign.Begin,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                content : [new sap.ui.commons.HorizontalDivider({
                    width : "100%"
                })],
                colSpan : 3
            })]
        }));

        return oMatrixLayout;
    },

    createNewValueTemplate : function(oContext, oNewValueControl) {
        var that = this;
        var oMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
            columns : 2,
            widths : ["20%", "80%"]
        });

        var oEventDetailLabel = new sap.ui.commons.Label({
            text : {
                path : "CHANGE_EVENT",
                formatter : function(event) {
                    var sStatus = "";
                    if (event) {
                        if (event.indexOf("STATUS_ACTION_") === 0) {
                            sStatus = sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.status.Action.Root", event.substring(14));
                        } else {
                            sStatus = that.getFacetView().getThingInspectorView().getText("BO_EVENT_CAMPAIGN_" + event);
                        }
                    }
                    return sStatus;
                }
            },
            design : sap.ui.commons.LabelDesign.Bold
        });
        var oEventDetailLabelCell = new sap.ui.commons.layout.MatrixLayoutCell({
            hAlign : sap.ui.commons.layout.HAlign.Begin,
            vAlign : sap.ui.commons.layout.VAlign.Top,
            content : [oEventDetailLabel],
            rowSpan : 2
        });

        var oNewValue = oNewValueControl;
        var oNewValueCell = new sap.ui.commons.layout.MatrixLayoutCell({
            hAlign : sap.ui.commons.layout.HAlign.Begin,
            vAlign : sap.ui.commons.layout.VAlign.Top,
            content : [oNewValue]
        });

        oMatrixLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
            cells : [oEventDetailLabelCell, oNewValueCell]
        }));

        oMatrixLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
            cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                hAlign : sap.ui.commons.layout.HAlign.Begin,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                content : [new sap.ui.commons.HorizontalDivider({
                    width : "100%"
                })],
                colSpan : 3
            })]
        }));

        return oMatrixLayout;
    }
});