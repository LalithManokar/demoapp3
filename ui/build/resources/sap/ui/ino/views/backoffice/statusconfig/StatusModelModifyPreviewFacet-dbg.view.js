/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.controls.StatusModelVizData");
jQuery.sap.require("sap.ui.ino.controls.StatusModelViz");
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

sap.ui.jsview("sap.ui.ino.views.backoffice.statusconfig.StatusModelModifyPreviewFacet", jQuery.extend({},
	sap.ui.ino.views.common.FacetAOView, {
		getControllerName: function() {
			return "sap.ui.ino.views.backoffice.statusconfig.StatusModelModifyPreviewFacet";
		},

		needsSavedData: function() {
			//can be overwritten: Returns true when the Facet needs a saved data state to run. 
			//TI will bring a save popup to save. If data is not saved facet will not be displayed
			return true;
		},

		onShow: function() {
			//it is crucial that the data of the TI was saved before the onShow is called as the preview Model needs the saved data
			var oController = this.getController();
			oController.setPreviewModel();
		},

		createFacetContent: function() {
			var oPreviewGroup = this.createLayoutPreview();
			return [oPreviewGroup];
		},
		createLayoutPreview: function() {
			var oStatusModelDetailThingGrup, oPreviewModel, oStatusModelPreview;
			//set and Get preview Model
			var oController = this.getController();
			oController.setPreviewModel();
			oPreviewModel = oController.getPreviewModel();

			oStatusModelPreview = new sap.ui.commons.Panel({
				showCollapseIcon: false,
				areaDesign: sap.ui.commons.enums.AreaDesign.Plain,
				borderDesign: sap.ui.commons.enums.BorderDesign.None,
				text: "{i18n>BO_STATUS_MODEL_LIST_DETAILS_HEADER}"
			});

			var oStatusViz = this._createStatusModellViz();
			oStatusViz.setLayoutData(new sap.ui.layout.GridData({
				span: "L6 M12 S12"
			}));
			oStatusModelPreview.addContent(oStatusViz);

			//Binding Context to IdeaFormPreview
			this.oStatusModelViz.setModel(oPreviewModel);

			this.oStatusModelViz.bindData({
				path: this.geViztBindingPath(),
				template: this.oStatusModelVizData,
				templateShareable: true
			});

			oStatusModelDetailThingGrup = new sap.ui.ux3.ThingGroup({
				title: this.getController().getTextPath("BO_IDEA_FORM_ADMINISTRATION_PREVIEW_TIT"),
				content: [oStatusModelPreview],
				colspan: true
			});

			return oStatusModelDetailThingGrup;
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
				width: "900px",
				height: "600px",
				warning: sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_TEXT).getResourceBundle().getText("BO_CAMPAIGN_FACET_PROCESS_FLD_PHASES_WARNING_DIAGRAM_DES"),
				diagramLegend: oDiagramLegendLabel,
				diagramReason: oDiagramReasonLabel,
				diagramNoImage: oDiagramNoImageLabel
			});
			oLayout.addContent(oStatusModelViz);

			this.oStatusModelViz = oStatusModelViz;
			this.oStatusModelVizLayout = oLayout;

			return oLayout;
		},

		geViztBindingPath: function() {
			return "/Transitions";
		}
	}));