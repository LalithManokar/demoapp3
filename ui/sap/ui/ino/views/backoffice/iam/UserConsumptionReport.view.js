/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailView");
jQuery.sap.require("sap.ui.ino.models.util.Table");

sap.ui.jsview("sap.ui.ino.views.backoffice.iam.UserConsumptionReport", jQuery.extend({},
	sap.ui.ino.views.common.MasterDetailView, {

		getControllerName: function() {
			return "sap.ui.ino.views.backoffice.iam.UserConsumptionReport";
		},
		
		createActionButtons: function() {
			return null;
		},
		
		createDetailsView: function() {
			return null;
		},
		
		createColumns: function(oTable) {
			var aColumns = [sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column({
					id: this.createId("GLAS_ID"),
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_USERCONSUMPTIONREPORT_LIST_ROW_GLAS_ID}"
					}),
					template: new sap.ui.commons.TextView({
						text: "{GLAS_ID}"
					})
				})), 
                 sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column({
					id: this.createId("YEAR_MONTH"),
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_USERCONSUMPTIONREPORT_LIST_ROW_YEAR_MONTH}"
					}),
					template: new sap.ui.commons.TextView({
						text: {
							parts: [{
								path: "YEAR"
							}, {
								path: "MONTH"
							}],
							formatter: function(nYear, nMonth) {
								return nYear + "/" + nMonth;
							}
						}
					})
				})), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column({
					id: this.createId("TOTAL_COUNT"),
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_USERCONSUMPTIONREPORT_LIST_ROW_TOTAL_COUNT}"
					}),
					template: new sap.ui.commons.TextView({
						text: {
							parts: [{
								path: "COMMUNITY_COUNT"
							}, {
								path: "OFFICE_COUNT"
							}],
							formatter: function(nCommunity, nOffice) {
								return nCommunity + nOffice;
							}
						}
					})
				})), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column({
					id: this.createId("COMMUNITY_COUNT"),
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_USERCONSUMPTIONREPORT_LIST_ROW_COMMUNITY_COUNT}"
					}),
					template: new sap.ui.commons.TextView({
						text: "{COMMUNITY_COUNT}"
					})
				})), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column({
					id: this.createId("OFFICE_COUNT"),
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_USERCONSUMPTIONREPORT_LIST_ROW_OFFICE_COUNT}"
					}),
					template: new sap.ui.commons.TextView({
						text: "{OFFICE_COUNT}"
					})
				}))];
			return aColumns;
		}
	}));