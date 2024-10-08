/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.UsageFacetView");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.IdeaFormModifyUsageFacet", jQuery.extend({},
	sap.ui.ino.views.common.UsageFacetView, {
		oUsageTexts: {
			sHeaderLabel: "BO_IDEA_FORM_ADMINISTRATION_USAGE_HEADER",
			sNoteLabel: "BO_IDEA_FORM_ADMINISTRATION_USAGE_NOTE"
		},

		getControllerName: function() {
			return "sap.ui.ino.views.backoffice.config.IdeaFormModifyUsageFacet";
		},
		createColumns: function() {
			//shall return an array of AnalyticalColumn Objects

			var aColumns = [];

			var oCampaignIDColumn = new sap.ui.table.AnalyticalColumn({
				label: new sap.ui.commons.Label({
					text: "{/#IdeaFormUsageType/CAMPAIGN_ID/@sap:label}"
				}),
				template: new sap.ui.commons.Link({
					text: {
						path: "CAMPAIGN_ID",
						type: new sap.ui.model.type.String()
					},
					press: function(oControlEvent) {
						var oRowBindingContext = oControlEvent.getSource().getBindingContext();
						var iObjectID = oRowBindingContext.getProperty("CAMPAIGN_ID");
						if (!iObjectID) {
							return;
						}
						sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow(
							"campaign", {
								id: iObjectID,
								edit: false
							});
					}

				}),
				leadingProperty: "CAMPAIGN_ID",
				grouped: true,
				summed: false,
				inResult: true,
				visible: false,
				sortProperty: "CAMPAIGN_ID",
				showIfGrouped: true,
				modelgroupHeaderFormatter: this.groupHeaderKeyFormatter
			});
			aColumns.push(oCampaignIDColumn);

			var oCampaignColumn = new sap.ui.table.AnalyticalColumn({
				label: new sap.ui.commons.Label({
					text: "{/#IdeaFormUsageType/CAMPAIGN_NAME/@sap:label}"
				}),
				template: new sap.ui.commons.Link({
					text: {
						path: "CAMPAIGN_NAME",
						type: new sap.ui.model.type.String()
					},
					press: function(oControlEvent) {
						var oRowBindingContext = oControlEvent.getSource().getBindingContext();
						var iObjectID = oRowBindingContext.getProperty("CAMPAIGN_ID");
						if (!iObjectID) {
							return;
						}
						sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow(
							"campaign", {
								id: iObjectID,
								edit: false
							});
					}

				}),
				leadingProperty: "CAMPAIGN_NAME",
				grouped: false,
				summed: false,
				sortProperty: "CAMPAIGN_NAME",
				showIfGrouped: true,
				groupHeaderFormatter: this.groupHeaderTextFormatter
			});
			aColumns.push(oCampaignColumn);

        //IDEA_NAME
			var oIdeaColumn = new sap.ui.table.AnalyticalColumn({
				label: new sap.ui.commons.Label({
					text: "{/#IdeaFormUsageType/IDEA_NAME/@sap:label}"
				}),
				template: new sap.ui.commons.Link({
					text: {
						path: "IDEA_NAME",
						type: new sap.ui.model.type.String()
					},
					press: function(oControlEvent) {
						var oRowBindingContext = oControlEvent.getSource().getBindingContext();
						var iObjectID = oRowBindingContext.getProperty("IDEA_ID");
						if (!iObjectID) {
							return;
						}
						sap.ui.ino.application.ApplicationBase.getApplication().
						navigateToExternal('sap.ino.config.URL_PATH_UI_FRONTOFFICE', 'idea', iObjectID);
					}
				}),
				leadingProperty: "IDEA_NAME",
				grouped: false,
				summed: false,
				sortProperty: "IDEA_NAME",
				showIfGrouped: true,
				groupHeaderFormatter: this.groupHeaderTextFormatter
			});
			aColumns.push(oIdeaColumn);

            //IDEA_ID
			var oIdeaIDColumn = new sap.ui.table.AnalyticalColumn({
				label: new sap.ui.commons.Label({
					text: "{/#IdeaFormUsageType/IDEA_ID/@sap:label}"
				}),
				template: new sap.ui.commons.Link({
					text: {
						path: "IDEA_ID",
						type: new sap.ui.model.type.String()
					},
					press: function(oControlEvent) {
						var oRowBindingContext = oControlEvent.getSource().getBindingContext();
						var iObjectID = oRowBindingContext.getProperty("IDEA_ID");
						if (!iObjectID) {
							return;
						}
						sap.ui.ino.application.ApplicationBase.getApplication().
						navigateToExternal('sap.ino.config.URL_PATH_UI_FRONTOFFICE', 'idea', iObjectID);
					}
				}),
				leadingProperty: "IDEA_ID",
				grouped: false,
				summed: false,
				inResult: true,
				visible: false,
				sortProperty: "IDEA_ID",
				showIfGrouped: true,
				groupHeaderFormatter: this.groupHeaderKeyFormatter
			});
			aColumns.push(oIdeaIDColumn);
            //Form_COUNT
			var oCountColumn = new sap.ui.table.AnalyticalColumn({
				label: new sap.ui.commons.Label({
					text: "{/#IdeaFormUsageType/FORM_COUNT/@sap:label}"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						path: "FORM_COUNT",
						type: new sap.ui.model.type.Integer()
					}
				}),
				leadingProperty: "FORM_COUNT",
				grouped: false,
				summed: true,
				showIfGrouped: true,
				sortProperty: "FORM_COUNT"
			});
			aColumns.push(oCountColumn);

			return aColumns;
		},
		
		 groupHeaderTextFormatter : function(sTextValue){
		     return sTextValue;
		 },
		
		getTableBindingInformation: function() {

			var oController = this.getController();
			var oModel = oController.getModel();

			// get the Code
			var sCode = oModel.getProperty("/CODE");

			// Bind against /TagsUsage and add a filter CODE = sCode;

			var aFilters = [];
			var oTagFilter = new sap.ui.model.Filter("FORM_CODE", sap.ui.model.FilterOperator.EQ, sCode);
			aFilters.push(oTagFilter);

			var oAbsoluteBinding = {
				path: "/IdeaFormUsage",
				filters : aFilters,
				sorter: [new sap.ui.model.Sorter("CAMPAIGN_NAME")],
				parameters: {
					provideTotalResultSize: true,
					useBatchRequests: true,
					provideGrandTotals: true
				}
			};
			return oAbsoluteBinding;
		}
	}));