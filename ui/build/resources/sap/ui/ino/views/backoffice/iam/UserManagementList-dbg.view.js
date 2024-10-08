/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailView");
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");
jQuery.sap.require("sap.ui.ino.models.util.Table");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");

sap.ui.jsview("sap.ui.ino.views.backoffice.iam.UserManagementList", jQuery.extend({},
	sap.ui.ino.views.common.MasterDetailView, {

		getControllerName: function() {
			return "sap.ui.ino.views.backoffice.iam.UserManagementList";
		},

		createColumns: function(oTable) {
			var oController = this.getController();

			var oClipboard = sap.ui.ino.application.backoffice.ControlFactory.createClipboardColumn(this.createId("CLIPBOARD"), sap.ui.ino.models.object
				.User);

			var oLink = sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column({
				id: this.createId("NAME"),
				label: new sap.ui.commons.Label({
					text: "{i18n>BO_USERMANAGEMENT_LIST_ROW_NAME}"
				}),
				template: new sap.ui.commons.Link({
					text: "{NAME}",
					press: function(oControlEvent) {
						var oRowBindingContext = oControlEvent.getSource().getBindingContext();
						sap.ui.jsview("sap.ui.ino.views.backoffice.iam.UserManagementInstance").show(
							oRowBindingContext.getProperty("ID"), "display");
					}
				}),
				sortProperty: "NAME",
				filterProperty: "NAME"
			}));

			var oExternalColumn = new sap.ui.table.Column({
				id: this.createId("IS_EXTERNAL"),
				label: new sap.ui.commons.Label({
					text: "{i18n>BO_USERMANAGEMENT_LIST_ROW_EXTERNAL}"
				}),
				template: new sap.ui.commons.CheckBox({
					editable: false,
					checked: {
						path: "IS_EXTERNAL",
						type: new sap.ui.ino.models.types.IntBooleanType()
					}
				}),
				sortProperty: "IS_EXTERNAL",
				filterProperty: "IS_EXTERNAL"
			});

			var oExternalFilterMenu = new sap.ui.commons.Menu({
				items: [sap.ui.ino.application.backoffice.ControlFactory.createTableColumnBoolFilterMenu(this._oTable, oExternalColumn)]
			});

			oExternalColumn.setMenu(oExternalFilterMenu);
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				style: "medium"
			});
			var aColumns = [
                 oClipboard,
                 oLink,
                 sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column({
					id: this.createId("FIRST_NAME"),
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_USERMANAGEMENT_LIST_ROW_FIRST_NAME}"
					}),
					template: new sap.ui.commons.TextView({
						text: "{FIRST_NAME}"
					}),
					sortProperty: "FIRST_NAME",
					filterProperty: "FIRST_NAME"
				})), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column({
					id: this.createId("LAST_NAME"),
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_USERMANAGEMENT_LIST_ROW_LAST_NAME}"
					}),
					template: new sap.ui.commons.TextView({
						text: "{LAST_NAME}"
					}),
					sortProperty: "LAST_NAME",
					filterProperty: "LAST_NAME"
				})), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column({
					id: this.createId("USER_NAME"),
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_USERMANAGEMENT_LIST_ROW_USER_NAME}"
					}),
					template: new sap.ui.commons.TextView({
						text: "{USER_NAME}"
					}),
					sortProperty: "USER_NAME",
					filterProperty: "USER_NAME"
				})),sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column({
					id: this.createId("SOURCE_TYPE_CODE"),
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_USERMANAGEMENT_LIST_ROW_SOURCE_TYPE_CODE}"
					}),
					template: new sap.ui.commons.TextView({
						text: {
        					path: "SOURCE_TYPE_CODE",
        					formatter: sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.iam.SourceTypeCode.Root")
        				}
					}),
					sortProperty: "SOURCE_TYPE_CODE",
					filterProperty: "SOURCE_TYPE_CODE"
				})), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column({
					id: this.createId("EMAIL"),
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_USERMANAGEMENT_LIST_ROW_EMAIL}"
					}),
					template: new sap.ui.commons.Link({
						text: "{EMAIL}",
						href: {
							path: "EMAIL",
							formatter: function(sVal) {
								return "mailto:" + sVal;
							}
						}
					}),
					sortProperty: "EMAIL",
					filterProperty: "EMAIL"
				})), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column({
					id: this.createId("VALID_TO"),
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_USERMANAGEMENT_LIST_ROW_VALIDATIONTO}"
					}),
					template: new sap.ui.commons.TextView({
						text: {
							path: "VALIDATION_TO",
							formatter: function(oDate) {
								if (!oDate) {
									oDate = new Date("9999-12-31T00:00:00.000Z");
								}
								return oDateFormat.format(oDate);
							}
						}
					}),
					sortProperty: "VALIDATION_TO",
					filterProperty: "VALIDATION_TO"
				}),true), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column({
					id: this.createId("LAST_LOGIN"),
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_USERMANAGEMENT_LIST_ROW_LASTLOGIN}"
					}),
				    template: new sap.ui.commons.TextView({
						text: {
							path: "LAST_LOGIN",
							formatter: function(oDate) {
								return sap.ui.core.format.DateFormat.getDateInstance({pattern: "yyyy-MM-dd"}).format(oDate) + " " + sap.ui.core.format.DateFormat.getDateInstance({pattern: "HH:mm:ss"}).format(oDate);
							}
						}
					}),
					sortProperty: "LAST_LOGIN",
					filterProperty: "LAST_LOGIN"
				}),true),
                oExternalColumn];
			return aColumns;
		},

		createActionButtons: function(oController) {
			var oView = this;
            this.oBtnCreate = new sap.ui.commons.Button({
				id: this.createId("BUT_NEW_USER"),
				press: function() {
					sap.ui.jsview("sap.ui.ino.views.backoffice.iam.UserManagementInstance").show(-1, "edit");
				},
				text: "{i18n>BO_IDENT_BUT_NEW_USER}",
				lite: false
			});
			
			this.oEditButton = new sap.ui.commons.Button({
				id: this.createId("BUT_EDIT"),
				press: function() {
					if (oView.getSelectedRowContext()) {
						// the user inspector works only in display mode
						sap.ui.jsview("sap.ui.ino.views.backoffice.iam.UserManagementInstance").show(
							oView.getSelectedRowContext().getProperty("ID"), "edit");
					}
				},
				text: "{i18n>BO_IDENT_BUT_EDIT}",
				lite: false,
				enabled: false
			});

			this.oDeleteButton = new sap.ui.commons.Button({
				id: this.createId("BUT_DELETE"),
				press: function() {
					oController.onDelete();
				},
				text: "{i18n>BO_IDENT_BUT_DELETE}",
				lite: false,
				enabled: false
			});

			return [this.oBtnCreate, this.oEditButton, this.oDeleteButton];

		},

		createDetailsView: function() {
			this._oDetailsView = sap.ui.jsview("sap.ui.ino.views.backoffice.iam.UserManagementListDetails");
			return this._oDetailsView;
		}
	}));