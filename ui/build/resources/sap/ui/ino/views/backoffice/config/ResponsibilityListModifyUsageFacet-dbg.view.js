/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.UsageFacetView");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.ResponsibilityListModifyUsageFacet", jQuery.extend({},
	sap.ui.ino.views.common.UsageFacetView, {
		oUsageTexts: {
			sHeaderLabel: "BO_RESPONSIBILITY_LIST_USAGE_EXP_HEADER",
		 	sNoteLabel: "BO_RESPONSIBILITY_LIST_USAGE_EXP_NOTE"
		},

		getControllerName: function() {
			return "sap.ui.ino.views.backoffice.config.ResponsibilityListModifyUsageFacet";
		},
		createColumns: function() {
			//needs to be redefined!
			//shall return an array of AnalyticalColumn Objects

			var aColumns = [];

			var oCampaignIDColumn = new sap.ui.table.AnalyticalColumn({
				label: new sap.ui.commons.Label({
					text: "{/#ResponsibilityUsageType/CAMPAIGN_ID/@sap:label}"
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
				visible: true,
				sortProperty: "CAMPAIGN_ID",
				showIfGrouped: true,
				modelgroupHeaderFormatter: this.groupHeaderKeyFormatter
			});
			aColumns.push(oCampaignIDColumn); 

			var oCampaignColumn = new sap.ui.table.AnalyticalColumn({
				label: new sap.ui.commons.Label({
					text: "{/#ResponsibilityUsageType/CAMPAIGN_NAME/@sap:label}"
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
            //RESP-COUNT
			var oCountColumn = new sap.ui.table.AnalyticalColumn({
				label: new sap.ui.commons.Label({
					text: "{/#ResponsibilityUsageType/RESP_COUNT/@sap:label}"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						path: "RESP_COUNT",
						type: new sap.ui.model.type.Integer()
					}
				}),
				leadingProperty: "RESP_COUNT",
				grouped: false,
				summed: false,
				showIfGrouped: true,
				sortProperty: "RESP_COUNT"
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
			var oTagFilter = new sap.ui.model.Filter("RESP_CODE", sap.ui.model.FilterOperator.EQ, sCode);
			aFilters.push(oTagFilter);

			var oAbsoluteBinding = {
				path: "/ResponsibilityUsage",
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