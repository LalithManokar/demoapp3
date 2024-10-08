/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOView");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.controls.ThemeFactory");
jQuery.sap.require("sap.ui.ino.models.formatter.GenericFormatter");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

sap.ui.jsview("sap.ui.ino.views.backoffice.tag.TagGroupManagementInstance", jQuery.extend({}, sap.ui.ino.views.common.ThingInspectorAOView, {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.tag.TagGroupManagementInstance";
	},

	createHeaderContent: function() {
		var oController = this.getController();

		this.removeAllHeaderGroups();

		this.oTitleContent = new sap.ui.commons.layout.MatrixLayout({
			rows: [new sap.ui.commons.layout.MatrixLayoutRow({
				cells: [new sap.ui.commons.layout.MatrixLayoutCell({
					hAlign: sap.ui.commons.layout.HAlign.Center,
					vAlign: sap.ui.commons.layout.VAlign.Top,
					content: [new sap.ui.commons.TextView({
						text: oController.getBoundPath("/NAME"),
						design: sap.ui.commons.TextViewDesign.Bold
					})],
					colSpan: 2
				})]
			})],
			widths: ["40%", "60%"]
		});

		this.oBasicInformationContent = new sap.ui.commons.layout.MatrixLayout({
			rows: [
                this.createRow(oController.getTextModel().getText("BO_TAG_GROUP_FLD_TAGS_COUNT"), new sap.ui.commons.TextView({
					text: {
						path: oController.getFormatterPath("TAGS_COUNT", true),
						formatter: function(sMembers) {
							if (!sMembers) {
								return "0";
							}
							return sMembers;
						}
					}
				}))],
			widths: ["40%", "60%"]
		});

		this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
			title: oController.getTextModel().getText("BO_TAG_GROUP_GRP_HEADER_NAME"),
			content: this.oTitleContent
		}));

		this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
			title: oController.getTextModel().getText("BO_TAG_GROUP_GRP_HEADER_GENERAL"),
			content: this.oBasicInformationContent
		}));

		var oAdminDataContent = new sap.ui.commons.layout.MatrixLayout({
			rows: [this.createRow(oController.getTextModel().getText("BO_TAG_GROUP_FLD_ID"), new sap.ui.commons.TextView({
				text: {
					path: oController.getFormatterPath("ID", true),
					type: new sap.ui.model.type.Integer(),
					formatter: sap.ui.ino.models.formatter.GenericFormatter.formatIdNoHandle
				}
			})), this.createRow(this.getText("BO_TAG_GROUP_FLD_CREATED_AT"), new sap.ui.commons.TextView({
				text: {
					path: oController.getFormatterPath("CREATED_AT", true),
					type: new sap.ui.model.type.Date()
				}
			})), this.createRow(this.getText("BO_TAG_GROUP_FLD_CREATED_BY"), new sap.ui.commons.Link({
				text: {
					path: oController.getFormatterPath("CREATED_BY", true)
				},
				press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CREATED_BY_ID", "user")
			})), this.createRow(this.getText("BO_TAG_GROUP_FLD_CHANGED_AT"), new sap.ui.commons.TextView({
				text: {
					path: oController.getFormatterPath("CHANGED_AT", true),
					type: new sap.ui.model.type.Date()
				}
			})), this.createRow(this.getText("BO_TAG_GROUP_FLD_CHANGED_BY"), new sap.ui.commons.Link({
				text: {
					path: oController.getFormatterPath("CHANGED_BY", true)
				},
				press: sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CHANGED_BY_ID", "user")
			}))],
			widths: ["40%", "60%"]
		});

		this.addHeaderGroup(new sap.ui.ux3.ThingGroup({
			title: oController.getTextModel().getText("BO_TAG_GROUP_GRP_ADMIN_DATA"),
			content: oAdminDataContent
		}));
		this.createDeletionDialog();
		this.refreshHeaderGroups();
	},
	createDeletionDialog: function() {
		var oOverlay = this;
		var oController = this.getController();
		var oDialogOKButton = new sap.ui.commons.Button({
			text: "{i18n>BO_TAG_GROUP_DIALOG_BUT_OK}",
			press: function(oEvent) {
				oOverlay.getController().onDeletionOKPressed(oOverlay);
			}
		});

		var oDeletionLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 1,
			widths: ['100%']
		});
		var oDescTextField = new sap.ui.commons.TextView({
			text: "{i18n>BO_TAG_GROUP_DIALOG_DESC}"
		});
		var oDescRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: oDescTextField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oDeletionLayout.addRow(oDescRow);

		oOverlay.oTableDisplay = new sap.ui.table.Table({
			//  rows:{path:"applicationObject>/AssignedGroup"},
			enableColumnReordering: false,
			visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Interactive,
			visibleRowCount: 5,
			minAutoRowCount: 1,
			columnHeaderHeight: 30,
			selectionMode: sap.ui.table.SelectionMode.Single,
			selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly
		});

		var oLink = new sap.ui.table.Column({
		    //MSGCRT
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_TAG_GROUP_DIALOG_GROUP_ID}"
			}),
			template: new sap.ui.commons.Link({
				text: this.getBoundPath("ASSIGNED_GROUP_ID"),
				press: function(oControlEvent) {
					var oSource = oControlEvent.getSource();
					var iId = parseInt(oSource.getText(), 10);
					sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow('taggroup', {
						id: iId,
						edit: false
					});
				}
			})
		});
		var aColumns = [oLink, new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>BO_TAG_GROUP_DIALOG_GROUP_NAME}"
				}),
				template: new sap.ui.commons.TextView({
					text: this.getBoundPath("ASSIGNED_GROUP_NAME")
				})
			})
                ];

		jQuery.each(aColumns, function(iIndex, oColumn) {
			oOverlay.oTableDisplay.addColumn(oColumn);
		});
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: oOverlay.oTableDisplay,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oDeletionLayout.addRow(oRow);

		this.oDeletionDialog = new sap.ui.commons.Dialog({
			width: "50%",
			title: "{i18n>BO_TAG_GROUP_DIALOG_TITLE}",
			content: [oDeletionLayout]
		});
		this.oDeletionDialog.addButton(oDialogOKButton);

	},
	getDeletionDialog: function() {
		return this.oDeletionDialog;
	},

	setThingInspectorConfiguration: function() {
		var oController = this.getController();

		this.sType = "Group";
		this.sHelpContext = "BO_TAGGROUP";

		/**
		 * Thing Inspector Settings
		 */
		this.oSettings.firstTitle = null;
		this.oSettings.type = oController.getTextModel().getText("BO_TAG_GROUP_TIT_TYPE");
		this.oSettings.icon = sap.ui.ino.controls.ThemeFactory.getImage("group_48x48.png");

		this.addFacet("sap.ui.ino.views.backoffice.tag.TagGroupManagementGroupDataFacet", "{i18n>BO_TAG_GROUP_TIT_GROUP_DATA}");

		this.addStandardButtons({
			save: true,
			edit: true,
			cancel: true,
			del: true,
			close: false,
			toggleClipboard: false
		});
	}

}));