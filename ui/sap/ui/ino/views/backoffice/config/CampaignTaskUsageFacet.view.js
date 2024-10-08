/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.UsageFacetView");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.CampaignTaskUsageFacet", jQuery.extend({},
	sap.ui.ino.views.common.UsageFacetView, {

		getControllerName: function() {
			return "sap.ui.ino.views.backoffice.config.CampaignTaskUsageFacet";
		},

		createColumns: function() {
			var aColumns = [];
			var oCampaignColumn = new sap.ui.table.AnalyticalColumn({
				label: new sap.ui.commons.Label({
					text: "{/#MilestoneTaskUsageType/CAMPAIGN_NAME/@sap:label}"
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

			var oCampaignIDColumn = new sap.ui.table.AnalyticalColumn({
				label: new sap.ui.commons.Label({
					text: "{/#MilestoneTaskUsageType/CAMPAIGN_ID/@sap:label}"
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
				grouped: false,
				summed: false,
				inResult: true,
				visible: false,
				sortProperty: "CAMPAIGN_ID",
				showIfGrouped: true,
				groupHeaderFormatter: this.groupHeaderKeyFormatter
			});
			aColumns.push(oCampaignIDColumn);

			var oCountColumn = new sap.ui.table.AnalyticalColumn({
				label: new sap.ui.commons.Label({
					text: "{/#MilestoneTaskUsageType/TASK_COUNT/@sap:label}"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						path: "TASK_COUNT",
						type: new sap.ui.model.type.Integer()
					}
				}),
				leadingProperty: "TASK_COUNT",
				grouped: false,
				summed: true,
				showIfGrouped: true,
				sortProperty: "TASK_COUNT"
			});
			aColumns.push(oCountColumn);

			return aColumns;
		},

		getTableBindingInformation: function() {
			var sCode = this.getController().getModel().getProperty("/CODE");
			var aFilters = [];
			var oTagFilter = new sap.ui.model.Filter("MILS_TASK_CODE", sap.ui.model.FilterOperator.EQ, sCode);
			aFilters.push(oTagFilter);

			var oAbsoluteBinding = {
				path: "/MilestoneTaskUsage",
				filters: aFilters,
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