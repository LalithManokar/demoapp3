/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailView");
jQuery.sap.require("sap.ui.ino.models.util.Table");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");

sap.ui.jsview("sap.ui.ino.views.backoffice.gamification.DimensionList", jQuery.extend({}, 
sap.ui.ino.views.common.MasterDetailView, {
	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.gamification.DimensionList";
	},

	hasPendingChanges: function() {
		return this.getController().hasPendingChanges();
	},

	createActionButtons: function(oController) {
		this._oCreateButton = new sap.ui.commons.Button({
			id: this.createId("BUT_CREATE"),
			text: "{i18n>BO_GAMIFICATION_DIMENSION_LIST_BUT_CREATE}",
			press: [oController.hanldeCreate, oController],
			lite: false,
			enabled: "{property>/actions/create/enabled}"
		});
		this._oCopyButton = new sap.ui.commons.Button({
			id: this.createId("BUT_COPY"),
			text: "{i18n>BO_GAMIFICATION_DIMENSION_LIST_BUT_COPY}",
			press: [oController.onCopyAsPressed, oController],
			lite: false,
			enabled: false
		});
		this._oEditButton = new sap.ui.commons.Button({
			id: this.createId("BUT_EDIT"),
			text: "{i18n>BO_GAMIFICATION_DIMENSION_LIST_BUT_EDIT}",
			press: [oController.handleEdit, oController],
			lite: false,
			enabled: "{property>/actions/update/enabled}"
		});
		this._oDeleteButton = new sap.ui.commons.Button({
			id: this.createId("BUT_DELETE"),
			text: "{i18n>BO_GAMIFICATION_DIMENSION_LIST_BUT_DELETE}",
			press: [oController.handleDelete, oController],
			lite: false,
			enabled: "{property>/actions/del/enabled}"
		});
		this.createCopyAsDialog();
		return [this._oCreateButton, this._oCopyButton, this._oEditButton, this._oDeleteButton];
	},

	createColumns: function() {
		var oController = this.getController();

		return [sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("NAME"), {
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_GAMIFICATION_DIMENSION_LIST_COL_NAME}"
			}),
			template: new sap.ui.commons.Link({
				text: "{NAME}",
				press: function(oEvent) {
					var oBindingContext = oEvent.getSource().getBindingContext();
					var iId = oBindingContext.getObject().ID;
					oController.onNavigateToModel(iId, false);
				}
			}),
			sortProperty: "NAME",
			filterProperty: "NAME"
		})), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("TECHNICAL_NAME"), {
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_GAMIFICATION_DIMENSION_LIST_COL_TECHNICAL_NAME}"
			}),
			template: new sap.ui.commons.TextView({
				text: "{TECHNICAL_NAME}"
			})
		})), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("STATUS"), {
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_GAMIFICATION_DIMENSION_LIST_COL_STATUS}"
			}),
			template: new sap.ui.commons.TextView({
				text: {
				    path: "STATUS",
				    formatter: function(sStatus){
				        var oBundle = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_TEXT).getResourceBundle();
				        if(sStatus && Number(sStatus)===1){
				            return oBundle.getText("BO_GAMIFICATION_DIMENSION_DETAIL_ACTIVE_ITEM");
				        }
				        return oBundle.getText("BO_GAMIFICATION_DIMENSION_DETAIL_INACTIVE_ITEM");
				    }
				}
			})
		})), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("REDEEM"), {
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_GAMIFICATION_DIMENSION_LIST_COL_REDEEM}"
			}),
			template: new sap.ui.commons.CheckBox({
				editable: false,
				checked: {
					path: "REDEEM",
					type: new sap.ui.ino.models.types.IntBooleanType()
				}
			})
		})), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("DESCRIPTION"), {
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_GAMIFICATION_DIMENSION_LIST_COL_DESCRIPTION}"
			}),
			template: new sap.ui.commons.TextView({
				text: "{DESCRIPTION}"
			})
		})), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("UNIT"), {
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_GAMIFICATION_DIMENSION_LIST_COL_UNIT}"
			}),
			template: new sap.ui.commons.TextView({
				text: {
				    path:"UNIT",
				    formatter:sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.basis.Unit.Root")
				    // function(sUnit){
				    //     var sCodeTable = "sap.ino.xs.object.Unit.Root";
				    //     var oFormatter = sap.ui.ino.models.core.CodeModel.getFormatter(sCodeTable);
				    //     return oFormatter.;
				    // }
				}
			})
		})), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("SCOPE"), {
			label: new sap.ui.commons.Label({
				text: "{i18n>BO_GAMIFICATION_DIMENSION_LIST_COL_SCOPE}"
			}),
			template: new sap.ui.commons.TextView({
				text: "{SCOPE}"
			})
		}))];
	},

	createDetailsView: function() {
		return sap.ui.jsview("sap.ui.ino.views.backoffice.gamification.DimensionListDetail");
	},

	createCopyAsDialog: function() {
		var oOverlay = this;
		var oDialogCopyButton = new sap.ui.commons.Button({
			text: "{i18n>BO_COMMON_BUT_COPY}",
			press: function() {
				oOverlay.getController().onCopyPressed(oOverlay.oCopyAsCodeField.getValue());
			}
		});
		var oDialogCancelButton = new sap.ui.commons.Button({
			text: "{i18n>BO_COMMON_BUT_CANCEL}",
			press: function() {
				oOverlay.oCopyAsDialog.close();
			}
		});

		var oCopyAsCodeLabel = new sap.ui.commons.Label({
			text: "{i18n>BO_GAMIFICATION_DIMENSION_FLD_PLAIN_CODE}"
		});

		this.oCopyAsCodeField = new sap.ui.commons.TextField({
			ariaLabelledBy: oCopyAsCodeLabel,
			liveChange: function(oEvent) {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
				if (oEvent.getParameters().liveValue.length > 0) {
					oDialogCopyButton.setEnabled(true);
				} else {
					oDialogCopyButton.setEnabled(false);
				}
			}
		});

		oCopyAsCodeLabel.setLabelFor(this.oCopyAsCodeField);

		var oCopyAsLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 2,
			widths: ['140px', '60%']
		});

		var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: oCopyAsCodeLabel,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: this.oCopyAsCodeField,
				vAlign: sap.ui.commons.layout.VAlign.Top,
				hAlign: sap.ui.commons.layout.HAlign.Begin
			})]
		});
		oCopyAsLayout.addRow(oRow);

		this.oCopyAsDialog = new sap.ui.commons.Dialog({
			title: "{i18n>BO_GAMIFICATION_DIMENSION_TIT_DIALOG_COPY}",
			content: [oCopyAsLayout]
		});
		this.oCopyAsDialog.addButton(oDialogCopyButton);
		this.oCopyAsDialog.addButton(oDialogCancelButton);
	},

	getCopyAsDialog: function() {
		return this.oCopyAsDialog;
	},

	getCopyAsCodeField: function() {
		return this.oCopyAsCodeField;
	}
}));