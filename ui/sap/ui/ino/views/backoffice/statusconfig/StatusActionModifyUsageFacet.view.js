/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.UsageFacetView");
jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

sap.ui.jsview("sap.ui.ino.views.backoffice.statusconfig.StatusActionModifyUsageFacet", jQuery.extend({},
	sap.ui.ino.views.common.UsageFacetView, {

		getControllerName: function() {
			return "sap.ui.ino.views.backoffice.statusconfig.StatusActionModifyUsageFacet";
		},

		createColumns: function() {

			var aColumns = [];

			var oModelColumn = new sap.ui.table.AnalyticalColumn({
				label: new sap.ui.commons.Label({
					text: "{/#StatusActionUsageType/STATUS_ACTION_CODE/@sap:label}"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						path: "STATUS_ACTION_CODE",
						formatter: sap.ui.ino.views.backoffice.config.Util.formatPlainCode
					}
				}),
				leadingProperty: "STATUS_ACTION_CODE",
				groupHeaderFormatter: sap.ui.ino.views.backoffice.config.Util.formatPlainCode,
				grouped: false,
				summed: false,
				showIfGrouped: true,
				sortProperty: "STATUS_ACTION_CODE"
			});
			aColumns.push(oModelColumn);

			var oStatusActionNameColumn = new sap.ui.table.AnalyticalColumn({
				label: new sap.ui.commons.Label({
					text: "{/#StatusActionUsageType/STATUS_ACTION_NAME/@sap:label}"
				}),
				template: new sap.ui.commons.TextView({
					text: {
						path: "STATUS_ACTION_NAME"
					}
				}),
				leadingProperty: "STATUS_ACTION_NAME",
				grouped: true,
				summed: false,
				inResult: true,
				sortProperty: "STATUS_ACTION_NAME",
				showIfGrouped: true
			});
			aColumns.push(oStatusActionNameColumn);

			var oStatusModelColumn = new sap.ui.table.AnalyticalColumn({
				label: new sap.ui.commons.Label({
					text: "{/#StatusActionUsageType/STATUS_MODEL_ID/@sap:label}"
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
					text: "{/#StatusActionUsageType/STATUS_MODEL_NAME/@sap:label}"
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
			var oTagFilter = new sap.ui.model.Filter("STATUS_ACTION_CODE", sap.ui.model.FilterOperator.EQ, sCode);
			aFilters.push(oTagFilter);

			var oAbusoluteBinding = {
				path: "/StatusActionUsage",
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