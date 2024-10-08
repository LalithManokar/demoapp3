/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.models.core.InvalidationManager");
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");
jQuery.sap.require("sap.ui.ino.controls.StatusModelVizData");
jQuery.sap.require("sap.ui.ino.controls.StatusModelViz");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

sap.ui.jsview("sap.ui.ino.views.backoffice.statusconfig.StatusModelListDetails", {

	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.statusconfig.StatusModelListDetails";
	},

	setRowContext: function(oBindingContext) {
		if (!oBindingContext) {
			return;
		}
		var iID = oBindingContext.getProperty("ID");

		var sKey = "StagingStatusModelCode(" + iID + ")/Transitions";
		sap.ui.ino.models.core.InvalidationManager.validateEntity(sKey);
		var sPath = "/" + sKey;
		this.oStatusModelViz.bindData({
			path: sPath,
			template: this.oStatusModelVizData,
			templateShareable: true
		});
	},

	createContent: function(oController) {
		var oPanel = new sap.ui.commons.Panel({
			showCollapseIcon: false,
			areaDesign: sap.ui.commons.enums.AreaDesign.Plain,
			borderDesign: sap.ui.commons.enums.BorderDesign.None,
			text: "{i18n>BO_STATUS_MODEL_LIST_DETAILS_HEADER}"
		});

		var oStatusViz = this.createDetailRow();
		oPanel.addContent(oStatusViz);

		return oPanel;

	},

	createDetailRow: function() {
		var oStatusViz = this._createStatusModellViz();
		oStatusViz.setLayoutData(new sap.ui.layout.GridData({
			span: "L6 M12 S12"
		}));
		return oStatusViz;
	},

	_createStatusModellViz: function() {
		var oLayout = new sap.ui.layout.VerticalLayout({
			visible: true,
			width: "100%"
		});

		this.oStatusModelVizData = new sap.ui.ino.controls.StatusModelVizData({
			code: "{CODE}",
			currentStatusCode: "{CURRENT_STATUS_CODE}",
			currentStatusType: "{CURRENT_STATUS_TYPE}",
			nextStatusCode: "{NEXT_STATUS_CODE}",
			nextStatusType: "{NEXT_STATUS_TYPE}",
			statusActionCode: "{STATUS_ACTION_CODE}",
			decisionRelevant: {
				path: "DECISION_RELEVANT",
				type: new sap.ui.ino.models.types.IntBooleanType()
			},
			decisionReasonListCode: "{DECISION_REASON_LIST_CODE}"
		});

		oLayout.addContent(new sap.ui.commons.Label({
			text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_PHASES_VISUALIZATION}",
			design: sap.ui.commons.LabelDesign.Bold,
			textAlign: sap.ui.core.TextAlign.Left,
			width: "100%"
		}));
		var oStatusModelViz;
		var fnClick;
		fnClick = function(oEvent) {
			var oDialog = new sap.ui.commons.Dialog({
				title: "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_PHASES_VISUALIZATION}",
				content: oStatusModelViz.clone().setWidth("100%").setHeight("100%").detachEvent("click", fnClick),
				minWidth: "300px",
				width: "700px",
				minHeight: "300px",
				height: "610px",
				resizable: false,
				autoClose: true
			});
			oDialog.open();
		};

		var oDiagramLegendLabel = new sap.ui.commons.Label({
			text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_PHASES_VISUALIZATION_LEGEND}",
			textAlign: sap.ui.core.TextAlign.Left,
			width: "80%",
			wrapping: true
		});

		var oDiagramReasonLabel = new sap.ui.commons.Label({
			text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_PHASES_VISUALIZATION_REASON}",
			textAlign: sap.ui.core.TextAlign.Left,
			width: "80%",
			wrapping: true
		});
		
		var oDiagramNoImageLabel = new sap.ui.commons.Label({
			text: "{i18n>BO_CAMPAIGN_FACET_PROCESS_FLD_PHASES_NODISPLAY_DIAGRAM_DES}",
			textAlign: sap.ui.core.TextAlign.Left,
			width: "80%",
			wrapping: true
		}).addStyleClass('sapUiNodiaplayedDes');
	
		oStatusModelViz = new sap.ui.ino.controls.StatusModelViz({
			width: "600px",
			height: "350px",
			warning: sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_TEXT).getResourceBundle().getText("BO_CAMPAIGN_FACET_PROCESS_FLD_PHASES_WARNING_DIAGRAM_DES"),
			click: fnClick,
			diagramLegend: oDiagramLegendLabel,
			diagramReason: oDiagramReasonLabel,
			diagramNoImage: oDiagramNoImageLabel
		});
		oLayout.addContent(oStatusModelViz);

		this.oStatusModelViz = oStatusModelViz;
		this.oStatusModelVizLayout = oLayout;

		return oLayout;
	}
});