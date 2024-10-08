/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/commons/models/core/CodeModel",
    "sap/ino/commons/application/Configuration"
], function(CodeModel, Configuration) {
	"use strict";

	var ReportUtil = {};

	ReportUtil.ReportViewType = {
		Graphical: "GRAPHIC",
		Table: "TABLE"
	};

	ReportUtil.getViewConfiguration = function(oConfiguration) {
		return oConfiguration.Views[oConfiguration.SelectedView];
	};

	ReportUtil.getPropertyVisibility = function(oViewConfiguration, sProperty) {
		if (oViewConfiguration.Dimensions.indexOf(sProperty) > -1 ||
			(oViewConfiguration.SecondaryDimensions &&
				oViewConfiguration.SecondaryDimensions.indexOf(sProperty) > -1) ||
			oViewConfiguration.Measures.indexOf(sProperty) > -1 ||
			(oViewConfiguration.SecondaryMeasures &&
				oViewConfiguration.SecondaryMeasures.indexOf(sProperty) > -1)) {
			return true;
		}
		return false;
	};

	ReportUtil.createFilter = function(oConfiguration, bParameterFilter, bViewFilter) {
		bParameterFilter = bParameterFilter === undefined ? true : bParameterFilter;
		bViewFilter = bViewFilter === undefined ? true : bViewFilter;

		var oViewConfiguration = this.getViewConfiguration(oConfiguration);
		var aFilter = [];
		if (bParameterFilter && oConfiguration.Parameters) {
			var aParameter = oConfiguration.Parameters;
			jQuery.each(aParameter, function(iIndex, oParameter) {
				var aParameterFilter = [];
				for (var i = 0; i < oParameter.Selection.length; i++) {
					aParameterFilter.push(new sap.ui.model.Filter(oParameter.Key, "EQ", oParameter.Selection[i]));
				}
				if (aParameterFilter.length > 0) {
					aFilter.push(new sap.ui.model.Filter(aParameterFilter, false));
				}
			});
		}
		if (bViewFilter &&
			oViewConfiguration.Filter !== null &&
			oViewConfiguration.Filter !== undefined) {
			for (var sFilterProperty in oViewConfiguration.Filter) {
				var sFilterValue = oViewConfiguration.Filter[sFilterProperty];
				var oViewFilter = new sap.ui.model.Filter(sFilterProperty, "EQ", sFilterValue);
				aFilter.push(oViewFilter);
			}
		}
		return aFilter;
	};

	ReportUtil.checkMandatoryParameters = function(oConfiguration) {
		if (!oConfiguration.Parameters) {
			return true;
		}

		var bMandatoryParametersMaintained = true;
		jQuery.each(oConfiguration.Parameters, function(iIndex, oParameter) {
			if (oParameter.Mandatory === true &&
				(oParameter.Selection === undefined ||
					oParameter.Selection === null ||
					oParameter.Selection.length === 0)) {
				bMandatoryParametersMaintained = false;
				return;
			}
		});
		return bMandatoryParametersMaintained;
	};

	ReportUtil.getRequestedAttributes = function(oViewConfiguration, bGraphic) {
		var aRequestedAttributes = [];

		if (bGraphic &&
			oViewConfiguration.Graphic &&
			oViewConfiguration.Graphic === "map") {
			aRequestedAttributes.push(oViewConfiguration.Map.Longitude);
			aRequestedAttributes.push(oViewConfiguration.Map.Latitude);
			aRequestedAttributes.push(oViewConfiguration.Map.Granularity);
		}
		aRequestedAttributes = aRequestedAttributes.concat(oViewConfiguration.Dimensions);
		if (oViewConfiguration.SecondaryDimensions) {
			aRequestedAttributes = aRequestedAttributes.concat(oViewConfiguration.SecondaryDimensions);
		}
		aRequestedAttributes = aRequestedAttributes.concat(oViewConfiguration.Measures);
		if (oViewConfiguration.SecondaryMeasures) {
			aRequestedAttributes = aRequestedAttributes.concat(oViewConfiguration.SecondaryMeasures);
		}
		if (oViewConfiguration.Sorters && oViewConfiguration.Sorters.length >= 1) {
			jQuery.each(oViewConfiguration.Sorters, function(index, oSorter) {
				if (aRequestedAttributes.indexOf(oSorter.columnKey) === -1) {
					aRequestedAttributes.unshift(oSorter.columnKey);
				}
			});
		}
		return aRequestedAttributes;
	};

	ReportUtil.parseConfigToObject = function(oReport) {
		//needs a complete Report Object as input and returns a complete report Object
		if (oReport.CONFIG !== undefined && oReport.CONFIG !== null) {
			if (typeof oReport.CONFIG === "string") {
				//oReport.CONFIG = oReport.CONFIG.replace(/""/g,"\"").replace(/"{/g,"{").replace(/}"/g,"}");
				oReport.CONFIG = JSON.parse(oReport.CONFIG);
			}
		} else {
			//nothing else to do
			return oReport;
		}

		if (oReport.CAMPAIGN_ID) {
			//force the single value parameter selection
			//make sure the Parameters section is there
			if (oReport.CONFIG.Parameters && oReport.CONFIG.Parameters.Campaign) {
				oReport.CONFIG.Parameters.Campaign.Selection = [oReport.CAMPAIGN_ID];
				oReport.CONFIG.Parameters.Campaign.SelectionString = oReport.CAMPAIGN_NAME;
			}
		}
		var fnGetText = sap.ino.commons.models.core.CodeModel.getFormatter("sap.ino.xs.object.analytics.ReportTemplate.Root");

		if (!oReport.CONFIG.Title) {
			if (oReport.REPORT_TEMPLATE_CODE) {
				oReport.CONFIG.Title = fnGetText(oReport.REPORT_TEMPLATE_CODE);
			} else if (oReport.CODE) {
				oReport.CONFIG.Title = fnGetText(oReport.CODE);
			} else if (oReport.DEFAULT_TEXT) {
				oReport.CONFIG.Title = oReport.DEFAULT_TEXT;
			}
		}
		if (!oReport.CONFIG.Description) {
			if (oReport.REPORT_TEMPLATE_CODE) {
				oReport.CONFIG.Description = fnGetText(oReport.REPORT_TEMPLATE_CODE);
			} else if (oReport.CODE) {
				oReport.CONFIG.Description = fnGetText(oReport.CODE);
			} else if (oReport.DEFAULT_LONG_TEXT) {
				oReport.CONFIG.Description = oReport.DEFAULT_LONG_TEXT;
			}
		}

		if (oReport.CONFIG.Views) {
			ReportUtil.deleteSorterInConfig(oReport.CONFIG);
		}
		return oReport;
	};

	ReportUtil.deleteSorterInConfig = function(oConfig) {
		if (oConfig && oConfig.Views) {
			jQuery.each(oConfig.Views, function(index, view) {
				if (view.Sorter) {
					view.Sorters = [{
						columnKey: view.Sorter.Path,
						operation: view.Sorter.Descending ? "Descending" : "Ascending"
					}];
					delete view.Sorter;
				}
			});
		}
	};

	ReportUtil.parseConfigToString = function(oReport) {
		//needs a complete Report Object as input and returns a complete report Object
		if (oReport.CONFIG !== undefined && oReport.CONFIG !== null) {
			oReport.CAMPAIGN_ID = null;
			if (oReport.CONFIG.Parameters) {
				var aCampaignSelection = oReport.CONFIG.Parameters.Campaign.Selection;
				if (aCampaignSelection !== undefined &&
					aCampaignSelection !== null &&
					aCampaignSelection.length === 1) {
					oReport.CAMPAIGN_ID = parseInt(aCampaignSelection[0], 10);
				}
			}
			if (typeof oReport.CONFIG === "object") {
				oReport.CONFIG = JSON.stringify(oReport.CONFIG);
			}
		}
		return oReport;
	};

	ReportUtil.getAnnotationXML = function(oConfiguration) {
		var sOdataPath = oConfiguration.ODataPath || Configuration.getApplicationPath("sap.ino.config.URL_PATH_OD_ANALYTICS");

		var oViewConfiguration = oConfiguration.Views[oConfiguration.SelectedView];
		var sChartType;
		try {
			sChartType = oViewConfiguration.Chart.Type.split("/")[1];
			sChartType = sChartType.charAt(0).toUpperCase() + sChartType.slice(1);
		} catch (e) {
			sChartType = "Column";
		}

		var sXML = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
			"<edmx:Edmx xmlns:edmx=\"http://docs.oasis-open.org/odata/ns/edmx\" Version=\"4.0\">" +
			"<edmx:Reference Uri=\"/" + sOdataPath + "/$metadata\">" +
			"<edmx:Include Alias=\"ANALYTICSODATA\" Namespace=\"sap.ino.rest\" />" +
			"</edmx:Reference>" +
			"<edmx:DataServices>" +
			"<Schema xmlns=\"http://docs.oasis-open.org/odata/ns/edm\" Namespace=\"sap.ino.rest\">" +
			"<Annotations Target=\"sap.ino.rest." + oConfiguration.DataSource + "Type\">" +
			"<Annotation Term=\"com.sap.vocabularies.UI.v1.Chart\">" +
			"<Record>" +
			"<PropertyValue Property=\"Title\" String=\"" + oViewConfiguration.DisplayName + "\" />" +
			"<PropertyValue Property=\"ChartType\" EnumMember=\"com.sap.vocabularies.UI.v1.ChartType/" + sChartType + "\" />" +
			"<PropertyValue Property=\"Dimensions\">" +
			"<Collection>";
		jQuery.each(oViewConfiguration.Dimensions, function(iIndex, sDimension) {
			sXML +=
				"<PropertyPath>" + sDimension + "</PropertyPath>";
		});
		if (oViewConfiguration.SecondaryDimensions) {
			jQuery.each(oViewConfiguration.SecondaryDimensions, function(iIndex, sDimension) {
				sXML +=
					"<PropertyPath>" + sDimension + "</PropertyPath>";
			});
		}
		sXML +=
			"</Collection>" +
			"</PropertyValue>" +
			"<PropertyValue Property=\"Measures\">" +
			"<Collection>";
		jQuery.each(oViewConfiguration.Measures, function(iIndex, sMeasure) {
			sXML +=
				"<PropertyPath>" + sMeasure + "</PropertyPath>";
		});
		if (oViewConfiguration.SecondaryMeasures) {
			jQuery.each(oViewConfiguration.SecondaryMeasures, function(iIndex, sMeasure) {
				sXML +=
					"<PropertyPath>" + sMeasure + "</PropertyPath>";
			});
		}
		sXML +=
			"</Collection>" +
			"</PropertyValue>" +
			"</Record>" +
			"</Annotation>" +
			"</Annotations>" +
			"</Schema>" +
			"</edmx:DataServices>" +
			"</edmx:Edmx>";
		return sXML;
	};

	return ReportUtil;
});