/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.controls.TextView");
jQuery.sap.require("sap.ui.ino.models.core.InvalidationManager");
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.VoteTypeListDetails", {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.config.VoteTypeListDetails";
	},

	setRowContext: function(oBindingContext) {
		if (!oBindingContext) {
			return;
		}
		var iID = oBindingContext.getProperty("ID");

		var sKey = "StagingVoteType(" + iID + ")";
		sap.ui.ino.models.core.InvalidationManager.validateEntity(sKey);
		var sPath = "/" + sKey;
		this.bindElement(sPath);

	},

	createContent: function(oController) {
		var oPanel = new sap.ui.commons.Panel({
			showCollapseIcon: false,
			areaDesign: sap.ui.commons.enums.AreaDesign.Plain,
			borderDesign: sap.ui.commons.enums.BorderDesign.None,
			text: "{i18n>BO_VOTE_TYPE_LIST_DETAILS}"
		});

		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			layoutFixed: true,
			columns: 4,
			width: '100%',
			widths: ['20%', '20%', '30%', "30%"]
		});

		var oRow = this.createVoteTypeDetailRow();
		oLayout.addRow(oRow);

		oPanel.addContent(oLayout);

		return oPanel;

	},

	createVoteTypeDetailRow: function() {
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();

		var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			vAlign: sap.ui.commons.layout.VAlign.Top,
			hAlign: sap.ui.commons.layout.HAlign.Begin
		});
		var oContent = this.createVoteTypeDetailLeft();
		oCell.addContent(oContent);
		oRow.addCell(oCell);

		oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			vAlign: sap.ui.commons.layout.VAlign.Top,
			hAlign: sap.ui.commons.layout.HAlign.Begin
		});
		oContent = this.createVoteTypeDetailMiddle();
		oCell.addContent(oContent);
		oRow.addCell(oCell);

		oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			vAlign: sap.ui.commons.layout.VAlign.Top,
			hAlign: sap.ui.commons.layout.HAlign.Begin
		});
		oContent = this.createVoteTypeDetailRight();
		oCell.addContent(oContent);
		oRow.addCell(oCell);

		oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			vAlign: sap.ui.commons.layout.VAlign.Top,
			hAlign: sap.ui.commons.layout.HAlign.Begin
		});
		oContent = this.createVoteTypeDetailEnd();
		oCell.addContent(oContent);
		oRow.addCell(oCell);

		return oRow;
	},

	createVoteTypeDetailLeft: function() {
		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			layoutFixed: true,
			columns: 2,
			width: '100%',
			widths: ['120px', '80%']
		});

		var oLabel = new sap.ui.commons.Label({
			text: "{i18n>BO_VOTE_TYPE_FLD_TYPE_CODE}",
			design: sap.ui.commons.LabelDesign.Bold
		});

		var oText = new sap.ui.ino.controls.TextView({
			text: {
				path: "TYPE_CODE"
			}
		});

		oLabel.setLabelFor(oText);

		oLayout.createRow(oLabel, oText);

		return oLayout;
	},

	createVoteTypeDetailMiddle: function() {
		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			layoutFixed: true,
			columns: 2,
			width: '100%',
			widths: ['120px', '80%']
		});

		var oLabel = new sap.ui.commons.Label({
			text: "{i18n>BO_VOTE_TYPE_FLD_PUBLIC_VOTE}",
			design: sap.ui.commons.LabelDesign.Bold
		});

		var oCheckBox = new sap.ui.commons.CheckBox({
			editable: false,
			checked: {
				path: "PUBLIC_VOTE",
				type: new sap.ui.ino.models.types.IntBooleanType()
			}
		});

		oLabel.setLabelFor(oCheckBox);

		oLayout.createRow(oLabel, oCheckBox);

		return oLayout;
	},

	createVoteTypeDetailRight: function() {
		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			layoutFixed: true,
			columns: 2,
			width: '100%',
			widths: ['200px', '80%']
		});

		var oLabel = new sap.ui.commons.Label({
			text: "{i18n>BO_VOTE_TYPE_FLD_PUBLISH_VOTE}",
			design: sap.ui.commons.LabelDesign.Bold
		});

		var oCheckBox = new sap.ui.commons.CheckBox({
			editable: false,
			checked: {
				path: "PUBLISH_VOTE",
				type: new sap.ui.ino.models.types.IntBooleanType()
			}
		});

		oLabel.setLabelFor(oCheckBox);

		oLayout.createRow(oLabel, oCheckBox);

		return oLayout;
	},

	createVoteTypeDetailEnd: function() {
		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			layoutFixed: true,
			columns: 2,
			width: '100%',
			widths: ['180px', '80%']
		});

		var oLabel = new sap.ui.commons.Label({
			text: "{i18n>BO_VOTE_TYPE_FLD_COMMENT_TYPE}",
			design: sap.ui.commons.LabelDesign.Bold
		});

		var oText = new sap.ui.ino.controls.TextView({
			text: {
				path: "VOTE_COMMENT_TYPE",
				formatter: this.getController().formatVoteCommentType
			}
		});

		oLabel.setLabelFor(oText);

		oLayout.createRow(oLabel, oText);

		return oLayout;
	}
});