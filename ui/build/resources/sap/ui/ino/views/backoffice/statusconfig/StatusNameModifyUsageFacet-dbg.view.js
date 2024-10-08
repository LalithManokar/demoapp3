/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.UsageFacetView");
jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

sap.ui.jsview("sap.ui.ino.views.backoffice.statusconfig.StatusNameModifyUsageFacet", jQuery.extend({},
	sap.ui.ino.views.common.UsageFacetView, {

		getControllerName: function() {
			return "sap.ui.ino.views.backoffice.statusconfig.StatusNameModifyUsageFacet";
		},

		createColumns: function() {

			var aColumns = [];

			var oModelColumn = new sap.ui.table.AnalyticalColumn({
				label: new sap.ui.commons.Label({
					text: "{/#StatusUsageType/STATUS_CODE/@sap:label}"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						path: "STATUS_CODE",
						formatter: sap.ui.ino.views.backoffice.config.Util.formatPlainCode
					}
				}),
				leadingProperty: "STATUS_CODE",
				groupHeaderFormatter: sap.ui.ino.views.backoffice.config.Util.formatPlainCode,
				grouped: false,
				summed: false,
				showIfGrouped: true,
				sortProperty: "STATUS_CODE"
			});
			aColumns.push(oModelColumn);

			var oStatusActionNameColumn = new sap.ui.table.AnalyticalColumn({
				label: new sap.ui.commons.Label({
					text: "{/#StatusUsageType/STATUS_NAME/@sap:label}"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						path: "STATUS_NAME"
					}
				}),
				leadingProperty: "STATUS_NAME",
				grouped: true,
				summed: false,
				inResult: true,
				sortProperty: "STATUS_NAME",
				showIfGrouped: true
			});
			aColumns.push(oStatusActionNameColumn);

			var oStatusModelColumn = new sap.ui.table.AnalyticalColumn({
				label: new sap.ui.commons.Label({
					text: "{/#StatusUsageType/STATUS_MODEL_ID/@sap:label}"
				}),
				template: new sap.ui.commons.Link({
					text: {
						path: "STATUS_MODEL_ID",
						type: new sap.ui.model.type.String()
					},
					press: function(oControlEvent) {
						var oRowBindingContext = oControlEvent.getSource().getBindingContext();
						var iObjectID = oRowBindingContext.getProperty("STATUS_MODEL_ID");
						if (!iObjectID) {
							return;
						}
						sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow(
							"configstatusmodel", {
								id: iObjectID,
								edit: false
							});
					}
				}),
				leadingProperty: "STATUS_MODEL_ID",
				grouped: false,
				summed: false,
				sortProperty: "STATUS_MODEL_ID",
				showIfGrouped: true
			});
			aColumns.push(oStatusModelColumn);

			var oStatusModelNameColumn = new sap.ui.table.AnalyticalColumn({
				label: new sap.ui.commons.Label({
					text: "{/#StatusUsageType/STATUS_MODEL_NAME/@sap:label}"
				}),
				template: new sap.ui.commons.Link({
					text: {
						path: "STATUS_MODEL_NAME",
						type: new sap.ui.model.type.String()
					},
					press: function(oControlEvent) {
						var oRowBindingContext = oControlEvent.getSource().getBindingContext();
						var iObjectID = oRowBindingContext.getProperty("STATUS_MODEL_ID");
						if (!iObjectID) {
							return;
						}
						sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow(
							"configstatusmodel", {
								id: iObjectID,
								edit: false
							});
					}
				}),
				leadingProperty: "STATUS_MODEL_NAME",
				grouped: false,
				summed: false,
				sortProperty: "STATUS_MODEL_NAME",
				showIfGrouped: true
			});
			aColumns.push(oStatusModelNameColumn);

			return aColumns;
		},

		getTableBindingInformation: function() {

			var oController = this.getController();
			var oModel = oController.getModel();

			// get the Code
			var sCode = oModel.getProperty("/CODE");

			var aFilters = [];
			var oTagFilter = new sap.ui.model.Filter("STATUS_CODE", sap.ui.model.FilterOperator.EQ, sCode);
			aFilters.push(oTagFilter);

			var oAbusoluteBinding = {
				path: "/StatusUsage",
				filters: aFilters,
				sorter: [new sap.ui.model.Sorter("STATUS_MODEL_ID")],
				parameters: {
					provideTotalResultSize: true,
					useBatchRequests: true,
					provideGrandTotals: true
				}
			};
			return oAbusoluteBinding;
		}
	}));