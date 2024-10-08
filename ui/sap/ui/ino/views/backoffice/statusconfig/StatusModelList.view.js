/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailView");
jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");
jQuery.sap.require("sap.ui.ino.models.util.Table");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");

sap.ui.jsview("sap.ui.ino.views.backoffice.statusconfig.StatusModelList", jQuery.extend({},
	sap.ui.ino.views.common.MasterDetailView, {
		getControllerName: function() {
			return "sap.ui.ino.views.backoffice.statusconfig.StatusModelList";
		},

		hasPendingChanges: function() {
			return this.getController().hasPendingChanges();
		},

		createColumns: function() {
			var oController = this.getController();

			return [sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("CODE"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_MODEL_LIST_ROW_CODE}"
					}),
					template: new sap.ui.commons.Link({
						text: {
							path: "CODE",
							formatter: sap.ui.ino.views.backoffice.config.Util.formatPlainCode
						},
						press: function(oEvent) {
							var oBindingContext = oEvent.getSource().getBindingContext();
							var iId = oBindingContext.getObject().ID;
							oController.onNavigateToModel(iId, false);
						}
					}),
					sortProperty: "CODE",
					filterProperty: "CODE"
				})), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("PACKAGE_ID"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_MODEL_LIST_ROW_PACKAGE_ID}"
					}),
					template: new sap.ui.commons.TextView({
						text: "{PACKAGE_ID}"
					}),
					sortProperty: "PACKAGE_ID",
					filterProperty: "PACKAGE_ID"
				})),
                sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("DEFAULT_TEXT"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_MODEL_LIST_ROW_DEFAULT_TEXT}"
					}),
					template: new sap.ui.commons.TextView({
						text: "{DEFAULT_TEXT}"
					}),
					sortProperty: "DEFAULT_TEXT",
					filterProperty: "DEFAULT_TEXT"
				})),
                new sap.ui.table.Column(this.createId("CHANGED_AT"), {
                    label : new sap.ui.commons.Label({
                        text : "{i18n>BO_MODEL_LIST_ROW_CHANGED_AT}"
                    }),
                    template : new sap.ui.commons.TextView({
                        text : {
                            path : "CHANGED_AT",
                            type : new sap.ui.model.type.Date()
                        }
                    }),
                    sortProperty : "CHANGED_AT"
                }),

                sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("CHANGED_BY"), {
                    label : new sap.ui.commons.Label({
                        text : "{i18n>BO_MODEL_LIST_ROW_CHANGED_BY}"
                    }),
                    template : new sap.ui.commons.Link({
                        text : "{CHANGED_BY}",
                        press : sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CHANGED_BY_ID", "user")
                    }),
                    sortProperty : "CHANGED_BY",
                    filterProperty : "CHANGED_BY"
                }))];
		},

		createActionButtons: function(oController) {
            
            this._oCreateButton = new sap.ui.commons.Button({
				id: this.createId("BUT_CREATE"),
				text: "{i18n>BO_MODEL_LIST_BUT_STATUS_CREATE}",
				press: [oController.onCreatePressed, oController],
				lite: false,
				enabled: "{property>/actions/create/enabled}"
			});
            this._oCopyButton = new sap.ui.commons.Button({
				id: this.createId("BUT_COPY"),
				text: "{i18n>BO_MODEL_LIST_BUT_COPY}",
				press: [oController.onCopyPressed, oController],
				lite: false,
				enabled: "{property>/actions/copy/enabled}"
			});            
			this._oEditButton = new sap.ui.commons.Button({
				id: this.createId("BUT_EDIT"),
				text: "{i18n>BO_MODEL_LIST_BUT_EDIT}",
				press: [oController.onEditPressed, oController],
				lite: false,
				enabled: "{property>/actions/update/enabled}"
			});
			
			this._oDeleteButton = new sap.ui.commons.Button({
				id: this.createId("BUT_DELETE"),
				text: "{i18n>BO_MODEL_LIST_BUT_DELETE}",
				press: [oController.onDeletePressed, oController],
				lite: false,
				enabled: "{property>/actions/del/enabled}"
			});
			this.createCopyAsDialog();
			return [this._oCreateButton, this._oCopyButton,this._oEditButton, this._oDeleteButton];
		},
		createCopyAsDialog: function() {
			var oOverlay = this;
			var oDialogCopyButton = new sap.ui.commons.Button({
				text: "{i18n>BO_COMMON_BUT_COPY}",
				press: function(oEvent) {
					oOverlay.getController().onPressCopy(oOverlay.oCopyAsCodeField.getValue());
				}
			});
			var oDialogCancelButton = new sap.ui.commons.Button({
				text: "{i18n>BO_COMMON_BUT_CANCEL}",
				press: function() {
					oOverlay.oCopyAsDialog.close();
				}
			});

			var oCopyAsCodeLabel = new sap.ui.commons.Label({
				text: "{i18n>BO_STATUS_MODEL_LIST_COPY_PLAIN_CODE}"
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
				title: "{i18n>BO_STATUS_MODEL_MODEL_TIT_DIALOG_COPY}",
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
		},
		createDetailsView: function() {
			return sap.ui.jsview("sap.ui.ino.views.backoffice.statusconfig.StatusModelListDetails");
		}
	}));