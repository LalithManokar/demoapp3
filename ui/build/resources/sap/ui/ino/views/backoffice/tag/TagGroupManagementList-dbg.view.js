/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
 
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailView");
jQuery.sap.require("sap.ui.ino.models.util.Table");

sap.ui.jsview("sap.ui.ino.views.backoffice.tag.TagGroupManagementList", jQuery.extend({},
	sap.ui.ino.views.common.MasterDetailView, {

		getControllerName: function() {
			return "sap.ui.ino.views.backoffice.tag.TagGroupManagementList";
		},

		createColumns: function(oTable) {
			var oLink = sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column({
				id: this.createId("NAME"),
				label: new sap.ui.commons.Label({
					text: "{i18n>BO_TAG_GROUP_LIST_ROW_NAME}"
				}),
				template: new sap.ui.commons.Link({
					text: "{NAME}",
					press: function(oControlEvent) {
						var oRowBindingContext = oControlEvent.getSource().getBindingContext();
						var oGroupInstanceView = sap.ui
							.jsview("sap.ui.ino.views.backoffice.tag.TagGroupManagementInstance");
						oGroupInstanceView
							.show(oRowBindingContext.getProperty("ID"), "display");
					}
				}),
				sortProperty: "NAME",
				filterProperty: "NAME"
			}));

			var aColumns = [
                 oLink,
                 sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column({
					id: this.createId("DESCRIPTION"),
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_TAG_GROUP_LIST_ROW_DESCRIPTION}"
					}),
					template: new sap.ui.commons.TextView({
						text: "{DESCRIPTION}"
					}),
					sortProperty: "DESCRIPTION",
					filterProperty: "DESCRIPTION"
				})),
               new sap.ui.table.Column(this.createId("TAGS_COUNT"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_TAG_GROUP_LIST_ROW_TAGS_COUNT}"
					}),
					template: new sap.ui.commons.TextView({
						text: {
							path: "TAGS_COUNT"
						}
					}),
					sortProperty: "TAGS_COUNT",
					filterProperty: "TAGS_COUNT",
					filterType: new sap.ui.model.type.Integer()
				})
                ];
			return aColumns;
		},

		createActionButtons: function(oController) {
			var oView = this;
			var oController = this.getController();

			this.oNewGroupButton = new sap.ui.commons.Button({
				id: this.createId("BUT_NEW_GROUP"),
				press: function() {
					sap.ui.jsview("sap.ui.ino.views.backoffice.tag.TagGroupManagementInstance").show(-1, "edit");
				},
				text: "{i18n>BO_TAG_GROUP_BUT_NEW_GROUP}",
				lite: false
			});

			this.oEditButton = new sap.ui.commons.Button({
				id: this.createId("BUT_EDIT"),
				press: function() {
					if (oView.getSelectedRowContext()) {
						var oGroupInstanceView = sap.ui.jsview("sap.ui.ino.views.backoffice.tag.TagGroupManagementInstance");
						oGroupInstanceView.show(oView.getSelectedRowContext().getProperty("ID"), "edit");
					}
				},
				text: "{i18n>BO_TAG_GROUP_BUT_EDIT}",
				lite: false,
				enabled: "{property>/actions/update/enabled}"
			});

			this.oDeleteButton = new sap.ui.commons.Button({
				id: this.createId("BUT_DELETE"),
				press: function() {
					oController.onDelete();
				},
				text: "{i18n>BO_TAG_GROUP_BUT_DELETE}",
				lite: false,
				enabled: "{property>/actions/del/enabled}"
			});

			return [this.oNewGroupButton, this.oEditButton, this.oDeleteButton];

		},

		createDetailsView: function() {
			this._oDetailsView = sap.ui.jsview("sap.ui.ino.views.backoffice.tag.TagGroupManagementListDetails");
			return this._oDetailsView;
		}
	}));