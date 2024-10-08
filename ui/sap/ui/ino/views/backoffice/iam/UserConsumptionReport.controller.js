/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailController");
sap.ui.controller("sap.ui.ino.views.backoffice.iam.UserConsumptionReport", jQuery.extend({},
	sap.ui.ino.views.common.MasterDetailController, {
		getSettings: function() {
			var mSettings = {
				sBindingPathTemplate: "/IdentityViewReport",
				mTableViews: {
					"default": {
						"default": true,
						showPreview: false,
						visibleRowCount: 12,
						oSorter: [new sap.ui.model.Sorter("YEAR", true), new sap.ui.model.Sorter("MONTH", true)],
						aVisibleColumns: ["GLAS_ID", "YEAR_MONTH", "TOTAL_COUNT", "COMMUNITY_COUNT", "OFFICE_COUNT"]
					}
				}
			};
			return mSettings;
		}
	}));