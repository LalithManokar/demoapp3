/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
      "sap/ino/commons/models/aof/ApplicationObject",
      "sap/ino/commons/models/core/ReadSource",
      "sap/ino/commons/util/ReportUtil"
     ], function(ApplicationObject, ReadSource, ReportUtil) {
	"use strict";

	var Report = ApplicationObject.extend("sap.ino.commons.models.object.Report", {
		objectName: "sap.ino.xs.object.analytics.Report",
		readSource: ReadSource.getDefaultODataSource("MyReports", {
			async: false
		}),
		invalidation: {
			entitySets: ["MyReports"]
		},
		determinations: {
			onCreate: determineCreate,
			onRead: determineRead,
			onNormalizeData: determineNormalizedData,
			onUpdateHandles: updateHandles
		},
		setConfiguration: setConfiguration,
		getConfiguration: getConfiguration,
		setCampaignContext: setCampaignContext,
		setDataFromTemplate: setDataFromTemplate,
		setReportOrderSequence: setReportOrderSequence
	});

	function setConfiguration(oConfiguration) {
		if (typeof(oConfiguration) === "string") {
			oConfiguration = JSON.parse(oConfiguration);
		}
		this.setProperty("/CONFIG", oConfiguration);
	}

	function getConfiguration() {
		return this.getProperty("/CONFIG");
	}

	function setReportOrderSequence(iOrderSequence) {
		this.setProperty("/ORDER_SEQUENCE", iOrderSequence);
	}

	function setDataFromTemplate(sReportTemplateCode, sDataModel) {
		var oReadModel = sDataModel;
		var oReport = this;
		var oDeferred = new jQuery.Deferred();

		var fnReadComplete = function(oData) {
			oData = ReportUtil.parseConfigToObject(oData);
			oReport.setConfiguration(oData.CONFIG);
			oDeferred.resolve(oData);
		};

		oReadModel.read("/ReportTemplates(CODE='" + sReportTemplateCode + "')", {
			context: null,
			urlParameters: null,
			success: fnReadComplete
		});
		
		return oDeferred.promise();
	}

	function setCampaignContext(iCampaignId, sCampaignName) {
		this.setProperty("/CAMPAIGN_ID", iCampaignId);
		this.setProperty("/CAMPAIGN_NAME", sCampaignName);

		if (iCampaignId !== undefined && iCampaignId !== null) {
			//force the single value parameter selection
			var oConfiguration = this.getProperty("/CONFIG");
			if (oConfiguration.Parameters && oConfiguration.Parameters.Campaign) {
				oConfiguration.Parameters.Campaign.Selection = [iCampaignId];
				oConfiguration.Parameters.Campaign.SelectionString = sCampaignName;
				this.setProperty("/CONFIG", oConfiguration);
			}
		}
	}

	function determineCreate() {
		return {
			"ID": -1,
			"CAMPAIGN_ID": null,
			"CONFIG": null,
			"ORDER_SEQUENCE": null
		};
	}

	function determineRead(oDefaultData) {
		oDefaultData = ReportUtil.parseConfigToObject(oDefaultData);
		return oDefaultData;
	}

	function determineNormalizedData(oDefaultData) {
		oDefaultData = ReportUtil.parseConfigToString(oDefaultData);
		return oDefaultData;
	}

	//as the determineNormalizedData function does not influence the current object, but only the data
	//sent to the database the CONFIG is not stored as a string.
	//Therefore the updateHandles function tries to update the handles of the CONFIG object
	function updateHandles(oObject, mGeneratedKeys) {
		if (oObject.ID) {
			// check if there is an entry in the generated keys for the ID
			if (mGeneratedKeys[oObject.ID]) {
				oObject.ID = mGeneratedKeys[oObject.ID];
			}
		}
		return oObject;
	}

	return Report;
});