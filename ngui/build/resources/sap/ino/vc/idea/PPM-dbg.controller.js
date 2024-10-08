sap.ui.getCore().loadLibrary("sap.ino.wall");

sap.ui.define([
    "sap/ino/vc/commons/BaseObjectController",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ino/commons/application/Configuration",
    "sap/ui/model/odata/ODataModel",
    "sap/ui/core/format/NumberFormat"
    ], function(BaseController, ObjectListFormatter, Configuration, ODataModel, NumberFormat) {

	"use strict";

	//mapping object type with corresponding fragment
	var oPPMMapping = {
		"DPO": "sap.ino.vc.idea.fragments.PPMProjectDetail",
		"PPO": "sap.ino.vc.idea.fragments.PPMItemDetail",
		"TPO": "sap.ino.vc.idea.fragments.PPMTaskDetail",
		"TTO": "sap.ino.vc.idea.fragments.PPMTaskDetail"
	};

	return BaseController.extend("sap.ino.vc.idea.PPM", {

		/** @member the formatter */
		formatter: jQuery.extend({
			currentStep: function(currentStep) {
				return currentStep - 1;
			},
			successProbability: function(sSuccessProbability) {
				var oNumberFormat = NumberFormat.getPercentInstance({
					maxFractionDigits: 3
				});
				return oNumberFormat.format(sSuccessProbability / 1000);
			}
		}, this.formatter, ObjectListFormatter),

		onInit: function() {
			BaseController.prototype.onInit.apply(this, arguments);

			var sServiceURL = Configuration.getPPMURL();
			this.oPPMModel = new ODataModel(sServiceURL, false);
			this.setModel(this.oPPMModel, "ppm");
		},

		onBeforeRendering: function(oEvent) {
			var vIdeaId = this.getObjectModel().getProperty("/ID");
			var sIdeaId = ("0000000000" + vIdeaId).slice(-10);
			var oList = this.getView().byId("ideaPPMList");
			var ofilter = new sap.ui.model.Filter("IdeaID", "EQ", sIdeaId);

			oList.getBinding("items").filter(ofilter);
		},

		/**
		 * listens to expand event; creates controls lazily for displaying additional information about the PPM object detail
		 **/
		onExpand: function(oEvent) {
			var oSourceCtrl = oEvent.getSource();
			var oChangeEvent = oSourceCtrl.getBindingContext("ppm");
			if (oEvent.getParameter("expand") && oChangeEvent) {
				oSourceCtrl.toggleStyleClass("sapInoPPMExpanded");
				var oData = oChangeEvent.getObject();
				var sObjectType = oData.LinkedObjectType;
				var aPathComponents = oData.LinkedEntity.split("/");
				var sPath = aPathComponents[aPathComponents.length - 2];
				var oCtrl;

				if (sPath) {
					oCtrl = this.createFragment(oPPMMapping[sObjectType]);
					oCtrl.bindElement("ppm>/" + sPath);
				}
				oSourceCtrl.addContent(oCtrl);
			} else {
				oSourceCtrl.toggleStyleClass("sapInoPPMExpanded");
				// destroy all components on close
				oSourceCtrl.removeAllContent();
			}
		}
	});
});