/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.application.Configuration");

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.config.ResponsibilityListValueUsage", {
	_configuration: sap.ui.ino.application.Configuration,

	setCode: function(sCode) {
		var control = this.getView().oUsageTableControl;
		control.setModel(this._getResponsibilityListValueModel());
		control.bindRows(this._getTableBindingInformation(sCode));
	},

	_getResponsibilityListValueModel: function() {
		var sOdataPath = this._configuration.getApplicationPath("sap.ino.config.URL_PATH_OD_USAGE");
		return new sap.ui.model.odata.ODataModel(this._configuration.getBackendRootURL() + "/" + sOdataPath, false);
	},

	_getTableBindingInformation: function(respValueCode) {
		var aFilters = [];
		var oRespValueCodeFilter = new sap.ui.model.Filter("RESP_VALUE_CODE", sap.ui.model.FilterOperator.EQ, respValueCode);
		aFilters.push(oRespValueCodeFilter);
		var oAbsoluteBinding = {
			path: "/ResponsibilityValueUsage",
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
});