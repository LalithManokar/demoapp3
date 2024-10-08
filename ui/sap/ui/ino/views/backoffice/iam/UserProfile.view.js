/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
jQuery.sap.require("sap.ui.ino.views.common.ControlFactory");
jQuery.sap.require("sap.ui.ino.views.common.MessageSupportView");

sap.ui.jsview("sap.ui.ino.views.backoffice.iam.UserProfile", jQuery.extend({}, sap.ui.ino.views.common.MessageSupportView, {

	init: function() {
		this.initMessageSupportView();
	},

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.iam.UserProfile";
	},

	hasPendingChanges: function() {
		return this.getController().hasPendingChanges();
	},

	createContent: function() {
		var oController = this.getController();
		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 1,
			widths: ["100%"]
		});

		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		this.oSaveButton = new sap.ui.commons.Button({
			id: this.createId("BUT_SAVE"),
			text: "{i18n>BO_LOCAL_USER_PROFILE_BUT_SAVE}",
			press: [oController.onSavePressed, oController],
			lite: false,
			enabled: false
		});

		var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this.oSaveButton]
		});
		oRow.addCell(oCell);
		oLayout.addRow(oRow);

		//BO_APPLICATION_MSG_USERSPROFILE
		oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oLabel = new sap.ui.commons.Label({
			text: "{i18n>BO_APPLICATION_MSG_USERSPROFILE}",
			textAlign: sap.ui.core.TextAlign.Left,
			width: "100%"
		});

		oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oLabel]
		});
		oRow.addCell(oCell);
		oLayout.addRow(oRow);

		oRow = new sap.ui.commons.layout.MatrixLayoutRow();

		this.oRepeaterLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 5,
			widths: ["100px", "30px", "30px", "30px","100%"]
		});

		this.bindRows();
		oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [this.oRepeaterLayout]
		});
		oRow.addCell(oCell);
		oLayout.addRow(oRow);

		return oLayout;
	},

	bindRows: function() {
		var oView = this;
		var oController = this.getController();
		var oSorter = new sap.ui.model.Sorter("CODE", false);
		this.oUserProfile = {};

		this.oRepeaterLayout.bindAggregation("rows", {
			sorter: oSorter,
			path: "/IdentityAttributes",
			factory: function(sId, oContext) {
				if (oContext) {
					var sControlWidth = "200px";
					var oTypeDescr = {
						bindingRef: "IS_PUBLIC",
						editable: true,
						dataType: "BOOLEAN",
						width: sControlWidth
					};
					oView.oUserProfile[oContext.getProperty("CODE")] = oContext.getProperty("IS_PUBLIC");
					var oControl = sap.ui.ino.views.common.ControlFactory.getControlForType("IS_PUBLIC", oTypeDescr);
					if (oControl.attachLiveChange) {
						oControl.attachLiveChange(oController.onValueChanged, oController);
					}
					if (oControl.attachChange) {
						oControl.attachChange(oController.onValueChanged, oController);
					}
					var oLabel = new sap.ui.commons.Label({
						text: {
							path: "CODE",
							formatter: sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.iam.IdentityAttributeSetting.Root")
						},
						design: sap.ui.commons.LabelDesign.Bold,
						textAlign: sap.ui.core.TextAlign.Right,
						width: "100%"
					});
					oLabel.setLabelFor(oControl);
					return new sap.ui.commons.layout.MatrixLayoutRow({
						cells: [new sap.ui.commons.layout.MatrixLayoutCell({
								content: [oLabel]
							})
    						, new sap.ui.commons.layout.MatrixLayoutCell()
    						, new sap.ui.commons.layout.MatrixLayoutCell({
								content: [oControl]
							})]
					});
				}
			}
		});
	},

	exit: function() {
		this.exitMessageSupportView();
		sap.ui.core.mvc.View.prototype.exit.apply(this, arguments);
	},

	getBoundPath: function(sPath) {
		return "{" + sPath + "}";
	}
}));