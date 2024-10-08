/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.controls.ExpertGraph");
jQuery.sap.require("sap.ui.ino.controls.ThemeFactory");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.models.object.User");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

sap.ui.jsview("sap.ui.ino.views.backoffice.ExpertFinder", {

    getControllerName: function() {
        return "sap.ui.ino.views.backoffice.ExpertFinder";
    },

    createTableView: function(oController) {
        var oLayout = new sap.ui.layout.VerticalLayout({
            id: this.createId("expertTableLayout"),
            width: "100%"
        });
        var that = this;

        var oTable = new sap.ui.table.Table({
            id: this.createId("expertTable"),
            visibleRowCount: 10,
            selectionMode: sap.ui.table.SelectionMode.Single
        });

        oTable.addColumn(sap.ui.ino.application.backoffice.ControlFactory.createClipboardColumn(undefined, sap.ui.ino.models.object.User, "ID", oController.sInvolvedPersonsModelName));

        oTable.addColumn(new sap.ui.table.Column({
            label: new sap.ui.commons.Label({
                text: "{i18n>CTRL_EXPERTFINDER_GRP_ID}"
            }),
            template: new sap.ui.commons.TextView({
                text: "{" + oController.sInvolvedPersonsModelName + ">ID}"
            }),
            sortProperty: "ID",
            filterProperty: "ID",
            visible: false
        }));

        oTable.addColumn(new sap.ui.table.Column({
            label: new sap.ui.commons.Label({
                text: "{i18n>CTRL_EXPERTFINDER_GRP_NAME}"
            }),
            template: new sap.ui.commons.Link({
                text: "{" + oController.sInvolvedPersonsModelName + ">NAME}",
                tooltip: "{" + oController.sInvolvedPersonsModelName + ">NAME}",
                press: function() {
                    var iID = this.data("ID");
                    if (!iID) {
                        return;
                    }
                    sap.ui.jsview("sap.ui.ino.views.backoffice.iam.UserManagementInstance").show(iID, "display");
                },
                customData: [new sap.ui.core.CustomData({
                    key: "ID",
                    value: "{" + oController.sInvolvedPersonsModelName + ">ID}"
                })]
            }),
            sortProperty: "NAME",
            filterProperty: "NAME"
        }));

        oTable.addColumn(new sap.ui.table.Column({
            label: new sap.ui.commons.Label({
                text: "{i18n>CTRL_EXPERTFINDER_GRP_TAGS}"
            }),
            template: new sap.ui.commons.TextView({
                text: "{" + oController.sInvolvedPersonsModelName + ">TAGS}",
                tooltip: "{" + oController.sInvolvedPersonsModelName + ">TAGS}"
            }),
            sortProperty: "TAGS",
            filterProperty: "TAGS"
        }));

        oLayout.addContent(oTable);

        oTable.attachRowSelectionChange(function(oControlEvent) {
            if (oLayout.getContent().length >= 2) {
                oLayout.removeContent(oLayout.getContent()[1]);
            }

            var aSelectedRowIndices = oTable.getSelectedIndices();
            if (aSelectedRowIndices && aSelectedRowIndices.length > 0) {
                var j = 0;
                var currentPersonId = 0;
                while (j < aSelectedRowIndices.length) {
                    if (oTable.getContextByIndex(aSelectedRowIndices[j]) && oTable.getContextByIndex(aSelectedRowIndices[j]).getObject()) {
                        var oObject = oTable.getContextByIndex(aSelectedRowIndices[j]).getObject();
                        currentPersonId = oObject.ID;
                        break;
                    }
                    j++;
                }
                if (currentPersonId > 0) {
                    var persons = oController._involvedPersons;

                    for (var i = 0; i < persons.length; i++) {
                        if (persons[i].ID === currentPersonId) {
                            var oPanel = new sap.ui.commons.Panel({
                                showCollapseIcon: false,
                                areaDesign: sap.ui.commons.enums.AreaDesign.Plain,
                                borderDesign: sap.ui.commons.enums.BorderDesign.None,
                                content: [that.createExpertCard(persons[i])],
                                text: persons[i].NAME
                            });

                            oLayout.addContent(oPanel);
                            break;
                        }
                    }
                }
            }
        });

        oTable.bindRows(oController.sInvolvedPersonsModelName + ">/");

        return oLayout;
    },

    createExpertCard: function(expert) {
        var oLayout = new sap.ui.commons.layout.MatrixLayout({
            layoutFixed: true,
            columns: 2,
            width: "100%"
        });
        var oLeftContent = new sap.ui.commons.layout.MatrixLayoutCell({
            vAlign: sap.ui.commons.layout.VAlign.Top
        });
        var oRightContent = new sap.ui.commons.layout.MatrixLayoutCell();
        oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
            cells: [oLeftContent, oRightContent]
        }));

        var oMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
            layoutFixed: false,
            columns: 2
        });

        function addCell(leftContent, rightContent) {
            var oLeftCell = new sap.ui.commons.layout.MatrixLayoutCell({
                hAlign: sap.ui.commons.layout.HAlign.Begin,
                vAlign: sap.ui.commons.layout.VAlign.Top,
                content: [leftContent]
            });

            var oRightCell = new sap.ui.commons.layout.MatrixLayoutCell({
                hAlign: sap.ui.commons.layout.HAlign.Begin,
                vAlign: sap.ui.commons.layout.VAlign.Top,
                content: [rightContent]
            });

            var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
                cells: [oLeftCell, oRightCell]
            });
            oMatrixLayout.addRow(oRow);
        }

        var oLinkName = new sap.ui.commons.Link({
            text: expert.NAME,
            press: function() {
                var iID = this.data("ID");
                if (!iID) {
                    return;
                }
                sap.ui.jsview("sap.ui.ino.views.backoffice.iam.UserManagementInstance").show(iID, "display");
            },
            customData: new sap.ui.core.CustomData({
                key: "ID",
                value: expert.ID
            })
        });

        var oLabel = new sap.ui.commons.Label({
            text: "{i18n>CTRL_EXPERTFINDER_FLD_NAME}",
            labelFor: oLinkName
        });
        addCell(oLabel, oLinkName);

        var oLinkEmail = new sap.ui.commons.Link({
            text: expert.EMAIL,
            href: "mailto:" + expert.EMAIL
        });
        oLabel = new sap.ui.commons.Label({
            text: "{i18n>CTRL_EXPERTFINDER_FLD_EMAIL}",
            labelFor: oLinkEmail
        });
        addCell(oLabel, oLinkEmail);

        var oLinkPhone = new sap.ui.commons.Link({
            text: expert.PHONE,
            href: "tel:" + expert.PHONE
        });
        oLabel = new sap.ui.commons.Label({
            text: "{i18n>CTRL_EXPERTFINDER_FLD_PHONE}",
            labelFor: oLinkPhone
        });
        addCell(oLabel, oLinkPhone);

        var oLinkMobile = new sap.ui.commons.Link({
            text: expert.MOBILE,
            href: "tel:" + expert.MOBILE
        });
        oLabel = new sap.ui.commons.Label({
            text: "{i18n>CTRL_EXPERTFINDER_FLD_MOBILE}",
            labelFor: oLinkMobile
        });
        addCell(oLabel, oLinkMobile);

        var oTextViewOffice = new sap.ui.commons.TextView({
            text: expert.OFFICE
        });
        oLabel = new sap.ui.commons.Label({
            text: "{i18n>CTRL_EXPERTFINDER_FLD_OFFICE}",
            labelFor: oTextViewOffice
        });
        addCell(oLabel, oTextViewOffice);

        oLeftContent.addContent(oMatrixLayout);

        var oTable = new sap.ui.table.Table({
            title: "{i18n>CTRL_EXPERTFINDER_GRP_CORRELATION}",
            visibleRowCount: 5,
            firstVisibleRow: 0,
            selectionMode: sap.ui.table.SelectionMode.Single
        });

        oTable.addColumn(new sap.ui.table.Column({
            label: new sap.ui.commons.Label({
                text: "{i18n>CTRL_EXPERTFINDER_GRP_TYPE}"
            }),
            template: new sap.ui.commons.TextView({
                text: {
                    parts: [{
                        path: "TYPE"
                    }],
                    formatter: function(type) {
                        var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
                        switch (type) {
                            case "SUBMITTER":
                                return i18n.getText("CTRL_EXPERTFINDER_GRP_SUBMITTER");
                            case "EVALUATOR":
                                return i18n.getText("CTRL_EXPERTFINDER_GRP_EVALUATOR");
                            case "COMMENTATOR":
                                return i18n.getText("CTRL_EXPERTFINDER_GRP_COMMENTATOR");
                            case "COACH":
                                return i18n.getText("CTRL_EXPERTFINDER_GRP_COACH");
                            case "CONTRIBUTOR":
                                return i18n.getText("CTRL_EXPERTFINDER_GRP_CONTRIBUTOR");
                            default:
                                break;
                        }
                    }
                }
            }),
            sortProperty: "TYPE",
            filterProperty: "TYPE",
            width: "100px"
        }));

        oTable.addColumn(new sap.ui.table.Column({
            label: new sap.ui.commons.Label({
                text: "{i18n>CTRL_EXPERTFINDER_GRP_IDEA}"
            }),
            template: new sap.ui.commons.Link({
                text: "{IDEA/NAME}",
                press: function(oControlEvent) {
                    var oRowBindingContext = oControlEvent.getSource().getBindingContext();
                    var iID = oRowBindingContext.getProperty("IDEA/ID");
                    var oApp = sap.ui.ino.application.ApplicationBase.getApplication();
                    oApp.navigateToExternal('sap.ino.config.URL_PATH_UI_FRONTOFFICE', 'idea', iID);
                }
            }),
            sortProperty: "IDEA/NAME",
            filterProperty: "IDEA/NAME"
        }));

        var tempArray = [];
        jQuery.each(expert.CORRELATION, function(index, currentCorrelation) {
            var result = jQuery.grep(tempArray, function(e) {
                return (e.TYPE === currentCorrelation.TYPE) && (e.IDEA.ID === currentCorrelation.IDEA.ID);
            });

            if (result.length === 0) {
                tempArray.push(currentCorrelation);
            }
        });

        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData({
            modelData: tempArray
        });
        oTable.setModel(oModel);
        oTable.bindRows("/modelData");
        oRightContent.addContent(oTable);

        return oLayout;
    },

    createPreviewExpert: function() {
        var oMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
            layoutFixed: true,
            widths: ["135px", "100%"],
            columns: 2
        });

        function addRow(leftContent, rightContent) {
            var oLeftCell = new sap.ui.commons.layout.MatrixLayoutCell({
                hAlign: sap.ui.commons.layout.HAlign.Begin,
                vAlign: sap.ui.commons.layout.VAlign.Top,
                content: [leftContent]
            });

            var oRightCell = new sap.ui.commons.layout.MatrixLayoutCell({
                hAlign: sap.ui.commons.layout.HAlign.Begin,
                vAlign: sap.ui.commons.layout.VAlign.Top,
                content: [rightContent]
            });

            var oMatrixRow = new sap.ui.commons.layout.MatrixLayoutRow({
                cells: [oLeftCell, oRightCell]
            });
            oMatrixLayout.addRow(oMatrixRow);
        }

        var oLinkName = new sap.ui.commons.Link({
            text: "{expert>/NAME}",
            press: function() {
                var iID = this.data("ID");
                if (!iID) {
                    return;
                }
                sap.ui.jsview("sap.ui.ino.views.backoffice.iam.UserManagementInstance").show(iID, "display");
            },
            customData: [new sap.ui.core.CustomData({
                key: "ID",
                value: "{expert>/PERSON_ID}"
            })]
        });
        var oLabel = new sap.ui.commons.Label({
            text: "{i18n>CTRL_EXPERTFINDER_FLD_NAME}",
            labelFor: oLinkName
        });

        this._oUserClipboardToggleButton = sap.ui.ino.application.backoffice.ControlFactory.createClipboardToggleButton(
            sap.ui.ino.models.object.User,
            "/PERSON_ID",
            this.getController().sExpertModelName
        ).addStyleClass("sapUiInoBackofficeSmallButton");
        this._oUserClipboardToggleButton.setHeight("18px");
        var oHorizontalLayout = new sap.ui.layout.HorizontalLayout({
            content: [oLinkName, this._oUserClipboardToggleButton]
        });
        addRow(oLabel, oHorizontalLayout);

        var oTextViewScore = new sap.ui.commons.TextView({
            text: "{expert>/RANK}"
        });
        oLabel = new sap.ui.commons.Label({
            text: "{i18n>CTRL_EXPERTFINDER_FLD_RANK}",
            labelFor: oTextViewScore
        });
        addRow(oLabel, oTextViewScore);

        function fnVisible(sValue) {
            if (sValue && sValue !== "") {
                return true;
            }
            return false;
        }

        var oLinkMail = new sap.ui.commons.Link({
            text: "{expert>/EMAIL}",
            href: {
                path: "{expert>/EMAIL}",
                formatter: function(sMail) {
                    return "mailto:" + sMail;
                }
            },
            visible: {
                path: "{expert>/EMAIL}",
                formatter: fnVisible
            }
        });
        var oLabelMail = new sap.ui.commons.Label({
            text: "{i18n>CTRL_EXPERTFINDER_FLD_EMAIL}",
            labelFor: oLinkMail,
            visible: {
                path: "{expert>/EMAIL}",
                formatter: fnVisible
            }
        });
        addRow(oLabelMail, oLinkMail);

        var oLinkPhone = new sap.ui.commons.Link({
            text: "{expert>/PHONE}",
            href: {
                path: "{expert>/PHONE}",
                formatter: function(sPhone) {
                    return "tel:" + sPhone;
                }
            },
            visible: {
                path: "{expert>/PHONE}",
                formatter: fnVisible
            }
        });
        var oLabelPhone = new sap.ui.commons.Label({
            text: "{i18n>CTRL_EXPERTFINDER_FLD_PHONE}",
            labelFor: oLinkPhone,
            visible: {
                path: "{expert>/PHONE}",
                formatter: fnVisible
            }
        });
        addRow(oLabelPhone, oLinkPhone);

        var oLinkMobile = new sap.ui.commons.Link({
            text: "{expert>/MOBILE}",
            href: {
                path: "{expert>/MOBILE}",
                formatter: function(sPhone) {
                    return "tel:" + sPhone;
                }
            },
            visible: {
                path: "{expert>/MOBILE}",
                formatter: fnVisible
            }
        });
        var oLabelMobile = new sap.ui.commons.Label({
            text: "{i18n>CTRL_EXPERTFINDER_FLD_MOBILE}",
            labelFor: oLinkMobile
        });
        addRow(oLabelMobile, oLinkMobile);

        var oTextViewOffice = new sap.ui.commons.TextView({
            text: "{expert>/OFFICE}",
            visible: {
                path: "{expert>/OFFICE}",
                formatter: fnVisible
            }
        });
        var oLabelOffice = new sap.ui.commons.Label({
            text: "{i18n>CTRL_EXPERTFINDER_FLD_OFFICE}",
            labelFor: oTextViewOffice,
            visible: {
                path: "{expert>/OFFICE}",
                formatter: fnVisible
            }
        });
        addRow(oLabelOffice, oTextViewOffice);

        var oPanel = new sap.ui.commons.Panel({
            title: new sap.ui.core.Title({
                text: "{i18n>CTRL_EXPERTFINDER_GRP_CORRELATION}"
            }),
            width: "100%",
            collapsed: true
        });

        this.oCorrelationTable = new sap.ui.table.Table({
            visibleRowCount: 5,
            firstVisibleRow: 0,
            selectionMode: sap.ui.table.SelectionMode.Single
        });

        this.oCorrelationTable.addColumn(new sap.ui.table.Column({
            label: new sap.ui.commons.Label({
                text: "{i18n>CTRL_EXPERTFINDER_GRP_TYPE}"
            }),
            template: new sap.ui.commons.TextView({
                text: {
                    parts: [{
                        path: "TYPE"
                    }],
                    formatter: function(type) {
                        var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
                        switch (type) {
                            case "SUBMITTER":
                                return i18n.getText("CTRL_EXPERTFINDER_GRP_SUBMITTER");
                            case "EVALUATOR":
                                return i18n.getText("CTRL_EXPERTFINDER_GRP_EVALUATOR");
                            case "COMMENTATOR":
                                return i18n.getText("CTRL_EXPERTFINDER_GRP_COMMENTATOR");
                            case "COACH":
                                return i18n.getText("CTRL_EXPERTFINDER_GRP_COACH");
                            case "CONTRIBUTOR":
                                return i18n.getText("CTRL_EXPERTFINDER_GRP_CONTRIBUTOR");
                            default:
                                break;
                        }
                    }
                }
            }),
            sortProperty: "TYPE",
            filterProperty: "TYPE",
            width: "100px"
        }));

        this.oCorrelationTable.addColumn(new sap.ui.table.Column({
            label: new sap.ui.commons.Label({
                text: "{i18n>CTRL_EXPERTFINDER_GRP_IDEA}"
            }),
            template: new sap.ui.commons.Link({
                text: {
                    path: "IDEA/NAME",
                    formatter: function(name) {
                        var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
                        if (!name || name === "") {
                            return i18n.getText("BO_COMMON_NOT_AUTHORIZED");
                        }
                        return name;
                    }
                },
                press: function(oControlEvent) {
                    var oRowBindingContext = oControlEvent.getSource().getBindingContext();
                    var iID = oRowBindingContext.getProperty("IDEA/ID");
                    if (!iID) {
                        return;
                    }
                    var oApp = sap.ui.ino.application.ApplicationBase.getApplication();
                    oApp.navigateToExternal('sap.ino.config.URL_PATH_UI_FRONTOFFICE', 'idea', iID);
                }
            }),
            sortProperty: "IDEA/NAME",
            filterProperty: "IDEA/NAME"
        }));

        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData({
            modelData: []
        });
        this.oCorrelationTable.setModel(oModel);
        this.oCorrelationTable.bindRows("/modelData");

        oPanel.addContent(this.oCorrelationTable);
        var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            content: [oPanel],
            colSpan: 2
        });
        var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
            cells: [oCell]
        });
        oMatrixLayout.addRow(oRow);

        return oMatrixLayout;
    },

    createContent: function(oController) {
        var that = this;
        this._expertTable = this.createTableView(oController);

        this._oPreviewExpert = this.createPreviewExpert(oController);
        var oExpertPanel = new sap.ui.commons.Panel({
            id: this.createId("expertPanel"),
            content: this._oPreviewExpert,
            width: "500px",
            showCollapseIcon: false,
            text: "{i18n>CTRL_EXPERTFINDER_FLD_EXPERT}"
        });
        oExpertPanel.addStyleClass("sapUiInoExpertGraphDetails");
        //working with a styleclass instead of the visible flag will prevent rerendering (-> flickering graph)
        oExpertPanel.addStyleClass("sapUiInoDisplayNone");
        
        var oCloseButton = new sap.ui.commons.Button({
            lite : true,
            icon : sap.ui.ino.controls.ThemeFactory.getImage("remove.png"),
            press : function() {
                oExpertPanel.addStyleClass("sapUiInoDisplayNone");
                
            }
        }).addStyleClass("sapUiInoExpertPanelCloseButton");

        oExpertPanel.insertButton(oCloseButton);
        
        this._expertGraph = new sap.ui.ino.controls.ExpertGraph({
            id: this.createId("expertGraph"),
            experts: oController._involvedPersons,
            clickNode: function(oEvent) {
                if (oEvent.getParameters().group !== "0") {
                    var currentExpert = oEvent.getParameters();
                    that.getController().setExpert(currentExpert);

                    var tempArray = [];
                    jQuery.each(currentExpert.CORRELATION, function(index, currentCorrelation) {
                        var result = jQuery.grep(tempArray, function(e) {
                            return (e.TYPE === currentCorrelation.TYPE) && (e.IDEA.ID === currentCorrelation.IDEA.ID);
                        });

                        if (result.length === 0) {
                            tempArray.push(currentCorrelation);
                        }
                    });

                    var oModel = new sap.ui.model.json.JSONModel();
                    oModel.setData({
                        modelData: tempArray
                    });
                    that.oCorrelationTable.setModel(oModel);
                    that.oCorrelationTable.bindRows("/modelData");
                    oExpertPanel.removeStyleClass("sapUiInoDisplayNone");
                }
            }
        });

        this._oVLayout = new sap.ui.layout.VerticalLayout({
            width: "100%"
        }).addStyleClass("sapUiInoExpertLayout").addStyleClass("sapUiInoExpertLayoutGraph");

        var oSegmentedButtonIcon = new sap.ui.commons.SegmentedButton({
            buttons: [new sap.ui.commons.Button({
                lite: false,
                icon: sap.ui.ino.controls.ThemeFactory.getImage("graphview_expertfinder.png"),
                iconHovered: sap.ui.ino.controls.ThemeFactory.getImage("graphview_expertfinder_active.png"),
                iconSelected: sap.ui.ino.controls.ThemeFactory.getImage("graphview_expertfinder_hover.png"),
                press: function() {
                    that._oVLayout.addStyleClass("sapUiInoExpertLayoutGraph");
                    that._oVLayout.removeStyleClass("sapUiInoExpertLayoutTable");
                    oController.selectGraphView();
                }
            }), new sap.ui.commons.Button({
                lite: false,
                icon: sap.ui.ino.controls.ThemeFactory.getImage("list_preview.png"),
                iconHovered: sap.ui.ino.controls.ThemeFactory.getImage("list_preview_active.png"),
                iconSelected: sap.ui.ino.controls.ThemeFactory.getImage("list_preview_hover.png"),
                press: function() {
                    that._oVLayout.removeStyleClass("sapUiInoExpertLayoutGraph");
                    that._oVLayout.addStyleClass("sapUiInoExpertLayoutTable");
                    oController.selectTableView();
                }
            })]
        }).addStyleClass("sapUiInoSegmentedButtonStyle");

        oSegmentedButtonIcon.setSelectedButton(oSegmentedButtonIcon.getButtons()[0]);

        var oMLayout = new sap.ui.commons.layout.MatrixLayout({
            width: "100%",
            columns: 2,
            widths: ["100%", "65px"],
            rows: [new sap.ui.commons.layout.MatrixLayoutRow({
                cells: [new sap.ui.commons.layout.MatrixLayoutCell({
                    content: [this.createTagFilter()]
                }), new sap.ui.commons.layout.MatrixLayoutCell({
                    hAlign: sap.ui.commons.layout.HAlign.End,
                    vAlign: sap.ui.commons.layout.VAlign.Top,
                    content: [oSegmentedButtonIcon]
                })]
            })]
        });

        this._oVLayout.addContent(oMLayout);
        this._oVLayout.addContent(new sap.ui.commons.HorizontalDivider({}));
        this._oVLayout.addContent(this._expertGraph);
        this._oVLayout.addContent(oExpertPanel);

        return this._oVLayout;
    },

    createTagFilter: function() {
        var oController = this.getController();
        var oExtension = new sap.ui.view({
            viewName: "sap.ui.ino.views.common.TagFilter",
            type: sap.ui.core.mvc.ViewType.JS,
            viewData: {
                objectInstance: "sap.ino.xs.object.expert.Tag",
                placeholder: "{i18n>BO_COMMON_INS_SEARCHTAGS}"
            }
        });
        oExtension.attachChange(function() {
            var aSelectedTags = this.getController().getSelectedTags();
            oController.getExperts(aSelectedTags);
        });
        return oExtension;
    }
});