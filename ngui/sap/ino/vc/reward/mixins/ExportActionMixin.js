sap.ui.define([
    "sap/ino/commons/util/Export",
    "sap/ino/commons/application/Configuration",
    "sap/ui/core/format/DateFormat",
    "sap/m/MessageToast"
], function(Export, Configuration, DateFormat, MessageToast) {
	"use strict";

	/**
	 * @class
	 * Mixin that provides export functionality
	 */
	var ExportMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	ExportMixin.onListExport = function(oEvent) {
	    if (!this._oExportActionSheet) {
			this._oExportActionSheet = this.createFragment("sap.ino.vc.commons.fragments.ExportActionSheet", this.getView().getId());
			this.getView().addDependent(this._oExportActionSheet);
		}
		if (oEvent.getSource().data("placement")) {
			this._oExportActionSheet.setPlacement(oEvent.getSource().data("placement"));
		}
		this._oExportActionSheet.triggerButton = oEvent.getSource();
		this._oExportActionSheet.openBy(oEvent.getSource());
	};

	ExportMixin.onListExportXLS = function(oEvent) {
		Export.i18n = this.getModel("i18n");
		var oExportControl = typeof this.getExportControl === "function" ? this.getExportControl() : this.getList();
		var fnCompleted = typeof this.fnCompleted === "function" ? this.fnCompleted : null;

		if (fnCompleted) {
			Export.exportAdvanced(oExportControl, "xls", this.getExportPrefix && this.getExportPrefix(), this._oExportActionSheet.triggerButton,
				Configuration.getCurrentUser().NAME, null, fnCompleted(this));
		} else {
			Export.exportAdvanced(oExportControl, "xls", this.getExportPrefix && this.getExportPrefix(), this._oExportActionSheet.triggerButton,
				Configuration.getCurrentUser().NAME);
		}
	};

	ExportMixin.onListExportCSV = function(oEvent) {
		Export.i18n = this.getModel("i18n");
		var oExportControl = typeof this.getExportControl === "function" ? this.getExportControl() : this.getList();
		var fnCompleted = typeof this.fnCompleted === "function" ? this.fnCompleted : null;

		if (fnCompleted) {
			Export.exportAdvanced(oExportControl, "csv", this.getExportPrefix && this.getExportPrefix(), this._oExportActionSheet.triggerButton,
				Configuration.getCurrentUser().NAME, null, fnCompleted(this));
		} else {
			Export.exportAdvanced(oExportControl, "csv", this.getExportPrefix && this.getExportPrefix(), this._oExportActionSheet.triggerButton,
				Configuration.getCurrentUser().NAME);
		}
	};

	ExportMixin.onListExportPPT = function(oEvent) {
		Export.i18n = this.getModel("i18n");
		var oExportControl = typeof this.getExportControl === "function" ? this.getExportControl() : this.getList();
		var fnCompleted = typeof this.fnCompleted === "function" ? this.fnCompleted : null;
		
		if (fnCompleted) {
			Export.exportAdvanced(oExportControl, "pptx", this.getExportPrefix && this.getExportPrefix(), this._oExportActionSheet.triggerButton,
				Configuration.getCurrentUser().NAME, null, fnCompleted(this));
		} else {
			Export.exportAdvanced(oExportControl, "pptx", this.getExportPrefix && this.getExportPrefix(), this._oExportActionSheet.triggerButton,
				Configuration.getCurrentUser().NAME, 50);
		}
		
	};

	ExportMixin.onChartExportSVG = function(oEvent) {
		Export.i18n = this.getModel("i18n");
		var oExportControl = typeof this.getExportChartControl === "function" ? this.getExportChartControl() : this.getChart();
		Export.exportChartAdvanced(oExportControl, this.getChartTitle && this.getChartTitle(), oEvent.getSource());
	};

	return ExportMixin;
});