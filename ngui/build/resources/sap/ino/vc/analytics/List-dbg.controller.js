sap.ui.define([
    "sap/ui/Device",
    "sap/ino/vc/commons/BaseVariantListController",
    "sap/ui/model/Sorter",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ui/model/odata/ODataModel",
    "sap/ui/model/odata/v4/ODataModel",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/models/object/Report",
    "sap/ino/commons/util/ReportUtil",
    "sap/ui/model/Filter",
    "sap/ino/commons/application/Configuration",
    "sap/suite/ui/microchart/ColumnMicroChart",
    "sap/suite/ui/microchart/AreaMicroChart",
    "sap/suite/ui/microchart/ComparisonMicroChart",
    "sap/suite/ui/microchart/HarveyBallMicroChart",
    "sap/suite/ui/microchart/RadialMicroChart",
    "sap/ino/commons/models/core/CodeModel",
    "sap/m/MessageBox",
    "sap/ui/core/HTML",
    "sap/m/Text",
    "sap/m/MessageToast",
    "sap/ino/commons/models/object/Attachment"    
], function(
	Device,
	BaseController,
	Sorter,
	ObjectListFormatter,
	TopLevelPageFacet,
	ODataModel,
	V4ODataModel,
	JSONModel,
	Report,
	ReportUtil,
	Filter,
	Configuration,
	ColumnMicroChart,
	AreaMicroChart,
	ComparisonMicroChart,
	HarveyBallMicroChart,
	RadialMicroChart,
	CodeModel,
	MessageBox,
	HTML,
	Text,
	MessageToast,
	Attachment) {
	"use strict";

	var mFilter = {
		IDENTITY_ID: "IDENTITY_ID"
	};

	var mVariant = {
		MY: "my",
		STANDARD: "standard",
		CUSTOM_REPORTS: "customReports"
	};

	var mPath = {
		MY: "data>/MyReports",
		STANDARD: "data>/ReportTemplates"
	};

	var mChartType = {
		bar: "Comparison",
		column: "Column",
		line: "Area",
		pie: "HarveyBall",
		donut: "Radial",
		heatmap: "Column",
		bullet: "Comparison",
		barstacked: "Comparison",
		columnstacked: "Column",
		barstacked100: "Comparison",
		columnstacked100: "Column",
		waterfall: "Column",
		combination: "Column",
		scatter: "Area",
		bubble: "Area",
		combinationstacked: "Column",
		bardual: "Comparison",
		columndual: "Column",
		linedual: "Area",
		barstackeddual: "Comparison",
		columnstackeddual: "Column",
		combinationstackeddual: "Column",
		barstackeddual100: "Comparison",
		columnstackeddual100: "Column",

		lastmonthschart: "Column",
		processindicator: "Column",
		piechart: "HarveyBall",

		toplist: "Comparison",
		currentmonthlist: "Comparison"
	};

	var mColor = ["Good", "Neutral", "Critical", "Error"];

	var mList = {
		ADJUSTMENT_TITLE: "ANALYTICS_LIST_TIT_ADJUSTMENT",
		Variants: {
			DEFAULT_VARIANT: mVariant.MY,
			TITLE: "ANALYTICS_LIST_TIT_VARIANTS",
			Values: [{
					TEXT: "ANALYTIC_MY_REPORT_LIST",
					ACTION: mVariant.MY,
					FILTER: mFilter.IDENTITY_ID,
					FILTER_VALUE: Configuration.getCurrentUser(true).USER_ID,
					PATH: mPath.MY,
					VISIBLE: true
            }, {
					TEXT: "ANALYTIC_STANDARD_REPORT_LIST",
					ACTION: mVariant.STANDARD,
					PATH: mPath.STANDARD,
					VISIBLE: true
            },
				{
					TEXT: Configuration.getCustomReportsTile(),
					ACTION: mVariant.CUSTOM_REPORTS,
					VISIBLE: Configuration.getCustomReportsEnable()
					//	PATH: mPath.STANDARD                
            }]
		}
	};

	var oFormatter = {

		formatterReportText: function(sText, sAction) {
			if (sAction === mVariant.CUSTOM_REPORTS) {
				return sText;
			} else {
				return this.getText(sText);
			}
			return "";
		},
		visibleCreateBtn: function(bValue) {
			return bValue;
		},
		formatNoDataVisible: function(bContent, bEdit) {
			return !bContent && !bEdit;
		},
	    visibleEditRichtext: function(bEdit,bBackOffice){
	        return !!bEdit && bBackOffice; 
	    },
	    visibleOperationBox: function(bInnMgr,sAction){
	        return bInnMgr && (sAction === mVariant.CUSTOM_REPORTS);
	    },
	    visibleSaveActionsBtn: function(bEdit,bBackOffice,sAction){
	        return !!bEdit && bBackOffice && (sAction === mVariant.CUSTOM_REPORTS);
	    }
	};

	jQuery.extend(oFormatter, ObjectListFormatter);

	return BaseController.extend("sap.ino.vc.analytics.List", jQuery.extend({}, TopLevelPageFacet, {
		/* Controller reacts when these routes match */
		routes: ["reportlist", "reportlistvariant"],

		/* ListModel defining filter, sorter and variants of the list */
		list: mList,

		// id of control that get initial focus
		initialFocus: "filterButton",

		view: {
			"List": {
				"VARIANT": mVariant.MY,
				"CAMPAIGN": undefined,
				"TAGCLOUD": false
			}
		},

		formatter: oFormatter,

		onInit: function() {
			BaseController.prototype.onInit.apply(this, arguments);

			sap.ui.getCore().loadLibrary("sap.suite.ui.microchart");
			sap.ui.getCore().loadLibrary("sap.ui.comp");
			sap.ui.getCore().loadLibrary("sap.chart");
			sap.ui.getCore().loadLibrary("sap.viz");

			var sAnalyticsPath = Configuration.getBackendRootURL() + "/" + Configuration.getApplicationPath(
				"sap.ino.config.URL_PATH_OD_ANALYTICS");
			this.oDataModel = new ODataModel(sAnalyticsPath);

			var oViewModel = this.getModel("view");
			oViewModel.setData(this.view, true);

		},

		onRouteMatched: function(oEvent, oObject) {
            var bBOPrivilege = this.getModel("user").getProperty("/privileges")["sap.ino.ui::backoffice.access"];
            if(!bBOPrivilege){
              this.navigateTo("home"); 
              return;
              }
			var sVariant;
			var oQuery;
			if (oEvent && oEvent.getParameter) {
				var oArguments = oEvent.getParameter("arguments");
				this._sRoute = oEvent.getParameter("name");
				oQuery = oArguments["?query"];
				sVariant = oArguments.variant;
			} else {
				this._sRoute = oEvent;
				oQuery = oObject;
				sVariant = oObject.variant;
			}

			var sDefaultVariant = this.getListProperty("/Variants/DEFAULT_VARIANT");
			var oVariant = this.getVariant(sVariant);

			var bBound = this.getList().isBound("items");
			var bRebindRequired = this.hasStateChanged(this._sRoute, sVariant, oQuery);

			this.constructCustomReportsInfo(sVariant);

			if (!bBound || bRebindRequired) {
				oVariant = oVariant || this.getVariant(sDefaultVariant);
				this.setParameters(oQuery, oVariant);
				this.bindList();
			}

			this.setHelp("REPORT_LIST");
		},

		// this function is only called if the extending controller implements the top level page facet
		onBeforeHide: function() {
			this._bFullscreenReset = true;
			this.setFullScreen(this._bPreviouslyFullscreen);
		},

		onAfterShow: function() {
			if (this.byId("sapInoPanelAnalytics") && this.byId("sapInoPanelAnalytics").getDomRef() && this.byId("sapInoPanelAnalytics").getDomRef()
				.querySelector(".sapMPanelContent")) {
				var dom = this.byId("sapInoPanelAnalytics").getDomRef();
				var sHeight = dom.querySelector(".sapMPanelContent").style.height;
				if (sHeight === "0px" || sHeight === "100%") {
					var toolbarDomRef = jQuery(dom.querySelector(".sapInoHomeTitledPanelNav"));
					dom.querySelector(".sapMPanelContent").style.height = (jQuery(dom).height() - toolbarDomRef.height() -
						parseInt(toolbarDomRef.css("padding-top"), 10) - parseInt(toolbarDomRef.css("padding-bottom"), 10)) + "px";
				}
			}
		},

		setParameters: function(oQuery, oVariant) {
			oQuery = oQuery || {};

			var iCampaign = oQuery.campaign;

			this.setViewProperty("/List/VARIANT", oVariant.ACTION);
			this.setViewProperty("/List/CAMPAIGN", iCampaign);
		},

		getList: function() {
			return this.byId("reportlist");
		},

		bindList: function() {
			var that = this;
			if (this.getViewProperty("/List/VARIANT") === mVariant.CUSTOM_REPORTS) {
				//Get the request for the configuration
			} else if (this.getViewProperty("/List/CAMPAIGN") && this.getViewProperty("/List/VARIANT") === "standard") {
				this.getModel("data").read("/CampaignSmall(" + this.getViewProperty("/List/CAMPAIGN") + ")", {
					success: function(oData) {
						that.bindItems(oData);
					}
				});
			} else {
				this.bindItems();
			}
		},

		bindItems: function(oCampaign) {
			var that = this;

			var oCurrentVariant = this.getCurrentVariant();

			var aFilter = [];

			if (oCurrentVariant.FILTER && oCurrentVariant.FILTER_VALUE) {
				aFilter = [new Filter(oCurrentVariant.FILTER, "EQ", oCurrentVariant.FILTER_VALUE)];
			}
			if (oCurrentVariant.ACTION === mVariant.MY && this.getViewProperty("/List/CAMPAIGN")) {
				aFilter.push(new Filter("CAMPAIGN_ID", "EQ", this.getViewProperty("/List/CAMPAIGN")));
			}
			if (!Configuration.isComponentActive('sap.ino.config.USAGE_REPORTING_ACTIVE')) {
				var oUsageReportingFilter = new sap.ui.model.Filter("IS_USAGE_REPORT", sap.ui.model.FilterOperator.NE, 1);
				aFilter.push(oUsageReportingFilter);
			}
			var oReportList = this.getList();

			var fnGetText = sap.ino.commons.models.core.CodeModel.getFormatter("sap.ino.xs.object.analytics.ReportTemplate.Root");
			//oReportList.destroyItems();
			oReportList.bindItems({
				path: oCurrentVariant.PATH,
				filters: aFilter,
				factory: function(sId, oContext) {
					var oTileModel = {
						DELETE_BUTTON_VISIBLE: true,
						CHART_VISIBLE: true
					};

					var oCardItem = that.createFragment("sap.ino.vc.analytics.fragments.CardListItem", sId);

					var oReport = oContext.getObject();
					var oConfiguration;
					if (typeof(oReport.CONFIG) === 'string') {
						oConfiguration = JSON.parse(oReport.CONFIG);
					} else {
						oConfiguration = JSON.parse(JSON.stringify(oReport.CONFIG)); //to avoid the pointer assignment
					}

					oTileModel.TITLE = oConfiguration.Title || fnGetText(oReport.CODE);
					oTileModel.CAMPAIGN_NAME = oReport.CAMPAIGN_NAME || (oCampaign && oCampaign.SHORT_NAME) || that.getText(
						"ANALYTICS_LIST_CROSS_CAMPAIGN");

					var sCampaignColor = oReport.CAMPAIGN_COLOR || (oCampaign && oCampaign.COLOR_CODE);
					if (sCampaignColor && sCampaignColor.length === 6) {
						sCampaignColor = "background-color: #" + sCampaignColor;
					}
					oTileModel.CAMPAIGN_COLOR = "<div style=\"height: 4px; width: 200px; " + sCampaignColor + " \" />";

					if (that.getViewProperty("/List/VARIANT") === mVariant.STANDARD) {
						oTileModel.DELETE_BUTTON_VISIBLE = false;
					}

					if (oCampaign &&
						oConfiguration.Parameters &&
						oConfiguration.Parameters.Campaign) {
						oConfiguration.Parameters.Campaign.Selection = [oCampaign.ID];
					}
					if (!ReportUtil.checkMandatoryParameters(oConfiguration)) {
						oTileModel.CHART_VISIBLE = false;
						oTileModel.UNIT = that.getText("ANALYTICS_LIST_MISSING_PARAMETER");
					} else {
						var oTileConfiguration = jQuery.extend({}, oConfiguration.Views[oConfiguration.SelectedView], oConfiguration.Tile);
						oTileConfiguration.Chart.Type = mChartType[(oTileConfiguration.Content || oTileConfiguration.Chart.Type.split("/")[1]).toLowerCase()];
						var oReadParameter = that.getReadParameter(oConfiguration, oTileConfiguration);

						var oTileUnit = oTileConfiguration.Unit || oTileConfiguration.Tile.Unit;
						oTileModel.UNIT = oTileUnit ? that.getText(oTileUnit) : undefined;

						oReadParameter.success = function(oData) {
							var oChart = that.createChart(oTileConfiguration);
							oChart.setTooltip(that.createChartTooltip(oData.results, oTileConfiguration));
							that.addChartItems(oChart, oData.results, oTileConfiguration);
							if (oCardItem.getContent().length > 0) {
								var oHBox = oCardItem.getContent()[0].getItems()[2].getItems()[1];
								oHBox.removeAllItems();
								oHBox.addItem(oChart);
							}
						};

						that.oDataModel.read("/" + oConfiguration.DataSource, oReadParameter);
					}
					oCardItem.setModel(new JSONModel(oTileModel), "tile");

					return oCardItem;
				},
				events: {
					dataRequested: function() {
						jQuery.each(that.getBusyControls(), function(iIdx, oControl) {
							if (jQuery.type(oControl.setBusy) === "function") {
								oControl.setBusy(true);
							}
						});
					},
					dataReceived: function() {
						jQuery.each(that.getBusyControls(), function(iIdx, oControl) {
							if (jQuery.type(oControl.setBusy) === "function") {
								oControl.setBusy(false);
							}
						});
					}
				}
			});
		},

		onDelete: function(oEvent) {
			var oMyReportList = this.getList();
			var oItem = oEvent.getSource().getParent().getParent().getParent();

			var reportId = /(.+)?(?:\(|（)(.+)(?=\)|）)/.exec(oItem.getBindingContext("data").sPath)[2];
			var idNumber = parseInt(reportId, 0);

			var oView = this.getView();

			MessageBox.confirm(this.getText("MSG_DEL_CONFIRM"), {
				onClose: function(sDialogAction) {
					if (sDialogAction !== MessageBox.Action.OK) {
						return;
					} else {
						oView.setBusy(true);
						var oRequest = Report.del(idNumber);

						oRequest.always(function() {
							oView.setBusy(false);
						});

						oRequest.done(function() {
							oMyReportList.removeItem(oItem);
						});

						oRequest.fail(function() {});
					}
				}
			});
		},

		onItemPress: function(oEvent) {
			var oItem = oEvent.getSource();
			var oContext = oItem.getBindingContext("data");
			var sPath = oContext.sPath.substr(1);
			this.navigateTo("report", {
				code: sPath
			});
		},

		initFullScreen: function() {
			// only read previous setting if we already restored it
			// routing from campaign homepage to campaign homepage would not restore, as view is not hidden
			if (this._bFullscreenReset === undefined || this._bFullscreenReset === true) {
				this._bPreviouslyFullscreen = this.getFullScreen();
			}
			this.setFullScreen(true);
			this._bFullscreenReset = false;
		},

		getReadParameter: function(oConfiguration, oTileConfiguration) {
			var aTileChartSorter;
			if (oTileConfiguration.Sorter) {
				aTileChartSorter = [new Sorter({
					path: oTileConfiguration.Sorter.Path,
					descending: oTileConfiguration.Sorter.Descending
				})];
			}

			var aSelect;
			if (oTileConfiguration.Dimension && oTileConfiguration.Dimension[0]) {
				aSelect = [oTileConfiguration.Dimension, oTileConfiguration.Dimensions[0]];
			} else if (oTileConfiguration.Dimensions && oTileConfiguration.Dimensions[0]) {
				aSelect = [oTileConfiguration.Dimensions[0]];
			}
			if (oTileConfiguration.Sorter && aSelect[0] !== oTileConfiguration.Sorter.Path) {
				aSelect.push(oTileConfiguration.Sorter.Path);
			}
			if (oTileConfiguration.Measure && oTileConfiguration.Measure[0]) {
				aSelect.push(oTileConfiguration.Measure, oTileConfiguration.Measures[0]);
			} else if (oTileConfiguration.Measures && oTileConfiguration.Measures[0]) {
				aSelect.push(oTileConfiguration.Measures[0]);
			}
			var aResult = [];
			for (var i = 0; i < aSelect.length; i++) {
				if (aSelect[i]) {
					aResult.push(aSelect[i]);
				}
			}
			aSelect = aResult;

			return {
				async: true,
				sorters: aTileChartSorter,
				urlParameters: {
					"$select": aSelect.join(","),
					"$top": oTileConfiguration.Top || 5
				}
			};
		},

		createChart: function(oTileConfiguration) {
			var oChart;

			var oConfig = {
				"size": "S",
				"tooltip": this.getText("ANALYTICS_LIST_MISSING_PARAMETER")
			};

			switch (oTileConfiguration.Chart.Type) {
				case "Area":
					oChart = new AreaMicroChart(oConfig);
					break;
				case "Comparison":
					oChart = new ComparisonMicroChart(oConfig);
					break;
				case "HarveyBall":
					oChart = new HarveyBallMicroChart(jQuery.extend(oConfig, {
						total: 100,
						totalScale: " ",
						showFractions: true
					}));
					break;
				case "Radial":
					oChart = new RadialMicroChart(oConfig);
					break;
				default:
					oChart = new ColumnMicroChart(oConfig);
					break;
			}
			oChart.addStyleClass("sapUiSmallMargin");
			oChart.addStyleClass("sapUiMediumMarginBegin");
			oChart.addStyleClass("sapInoAnalyticsDefaultChart");

			return oChart;
		},

		addChartItems: function(oChart, aData, oTileConfiguration) {
			var sMicroChartType = oTileConfiguration.Chart.Type;
			var sDimension = oTileConfiguration.Dimension || oTileConfiguration.Dimensions[0];
			var sMeasure = oTileConfiguration.Measure || oTileConfiguration.Measures[0];

			switch (sMicroChartType) {
				case "Column":
					jQuery.each(aData, function(iIndex, oResult) {
						oChart.addColumn(new sap.suite.ui.microchart.ColumnMicroChartData({
							color: mColor[iIndex % 4],
							label: oResult[sDimension],
							value: oResult[sMeasure]
						}));
					});
					break;
				case "Area":
					var oAreaMicroChartItem = new sap.suite.ui.microchart.AreaMicroChartItem({
						color: "Good"
					});
					var iXLength = 100 / aData.length;
					jQuery.each(aData, function(iIndex, oResult) {
						oAreaMicroChartItem.addPoint(new sap.suite.ui.microchart.AreaMicroChartPoint({
							x: iXLength * iIndex,
							y: oResult[sMeasure]
						}));
					});
					oChart.addLine(oAreaMicroChartItem);
					break;
				case "Comparison":
					jQuery.each(aData, function(iIndex, oResult) {
						oChart.addData(new sap.suite.ui.microchart.ComparisonMicroChartData({
							color: mColor[iIndex % 4],
							title: oResult[sDimension],
							value: oResult[sMeasure]
						}));
					});
					break;
				case "HarveyBall":
					var fTotal = 0;

					jQuery.each(aData, function(iIndex, oResult) {
						oChart.addItem(new sap.suite.ui.microchart.HarveyBallMicroChartItem({
							color: "Good",
							fractionLabel: oResult[sDimension],
							fraction: oResult[sMeasure],
							fractionScale: " "
						}));

						fTotal += oResult[sMeasure];
					});

					if (fTotal) {
						oChart.setTotal(fTotal);
					}
					break;
				case "Radial":
					var fRadialTotal = 0;
					jQuery.each(aData, function(iIndex, oData) {
						fRadialTotal += oData[sMeasure];
					});

					oChart.setTotal(fRadialTotal);
					oChart.setFraction(aData[0][sMeasure]);
					oChart.setValueColor("Good");
					break;
				default:
					jQuery.each(aData, function(iIndex, oResult) {
						oChart.addColumn(new sap.suite.ui.microchart.ColumnMicroChartData({
							color: mColor[iIndex % 4],
							label: oResult[sDimension],
							value: oResult[sMeasure]
						}));
					});
					break;
			}
		},

		createChartTooltip: function(aData, oViewConfig) {
			var sTooltip = "";

			jQuery.each(aData, function(iIndex, oResult) {
				sTooltip += oResult[oViewConfig.Dimension || oViewConfig.Dimensions[0]] + " " + (oResult[oViewConfig.Measure || oViewConfig.Measures[
					0]] || 0);
				sTooltip += (iIndex !== aData.length) ? "\n" : "";
			});

			return sTooltip;
		},

		getQuery: function() {
			var oQuery = {};

			var iCampaign = this.getViewProperty("/List/CAMPAIGN");
			if (iCampaign) {
				oQuery.campaign = iCampaign;
			}

			return oQuery;
		},

		onVariantPress: function(sVariantAction) {
			var oQuery = this.getQuery();

			// do not show invalid filters in URL => they are ignored, but we don't want to confuse users
			this.removeInvalidFilters(oQuery);

			if (sVariantAction) {
				this.navigateTo(this.getRoute(true), {
					variant: sVariantAction,
					query: oQuery
				}, true, true);
			} else {
				this.navigateTo(this.getRoute(false), {
					query: oQuery
				}, true, true);
			}
		},
		constructCustomReportsInfo: function(sVariant) {
            var bInnMgr = this.getModel("user").getProperty("/privileges/sap.ino.xs.rest.admin.application::execute");
            
            var bBackOffice = this.getModel("user").getProperty("/privileges/sap.ino.ui::backoffice.access");
				this.getView().getModel("list").setProperty("/IS_INN_MGR", bInnMgr);
				this.getView().getModel("list").setProperty("/BACKOFFICE_ACCESSABLE", bBackOffice);	
				this.getView().getModel("list").setProperty("/CURRENT_ACTION_SELECTED", sVariant);	   
				if(!sVariant){
				 this.getView().getModel("list").setProperty("/CURRENT_ACTION_SELECTED", mVariant.MY);	   
				}
				
			if (!this.getView().getModel("customReport")) {
				var oModel = new JSONModel();
				this.getView().setModel(oModel, 'customReport');
			}				
			if (sVariant === mVariant.CUSTOM_REPORTS) {
                if(!Configuration.getCustomReportsEnable()){
				this.navigateTo(this.getRoute(true), {
					variant: mVariant.MY,
					query: {}
				}, true, true);		        
		    }			    
				this.getXCSRFTOKEN();
				this.byId("reportlist").setVisible(false);
				this.byId('customReports').setVisible(true);
				this.getCustomReportsInfo();
			} else {
				this.byId('customReports').setVisible(false);
				this.byId("reportlist").setVisible(true);
			}
		},
		getCustomReportsInfo: function() {
			var oReportVbox = this.byId('customReports');
			oReportVbox.removeAllItems();
			oReportVbox.destroyItems();
			var that = this;
			var oRichTextControl = sap.ui.xmlfragment({
				id: that.getView().getId(),
				fragmentName: "sap.ino.vc.analytics.fragments.CustomReportRichTxt"
			}, that);
			oRichTextControl.attachReady(function() {
				this.bindProperty("value", {
					path: 'customReport>/content'
				});
			});
			oReportVbox.addItem(oRichTextControl);
			var oRichTextHtml = new HTML({
				sanitizeContent: true,
				preferDOM: false,
				visible:{
					parts: ['customReport>/hasContent', 'customReport>/EDIT_STATUS','list>/BACKOFFICE_ACCESSABLE'],
					formatter: function(bContent, bEdit,bBackOffice) {
						return bContent && !bEdit && bBackOffice;
					},
					type: null
				},
				content: {
					model: "customReport",
					path: '/content',
					formatter: that.formatter.wrapHTML
				}
			});
			oReportVbox.addItem(oRichTextHtml);
			var oTextField = new Text({
				text: this.getText("ANALYITCS_CUSTOM_REPORTS_TEXT_NO_DATA"),
				visible: {
					parts: ['customReport>/hasContent', 'customReport>/EDIT_STATUS'],
					formatter: function(bContent, bEdit) {
						return !bContent && !bEdit;
					},
					type: null
				}
			});
			oReportVbox.addItem(oTextField);
			var oRequest = {
				"ACTION": "QUERY"
			};
			var sURL = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/backoffice/customReports.xsjs";
			var oAjaxPromise = jQuery.ajax({
				url: sURL,
				headers: {
					"X-CSRF-Token": that._xCSRFToken
				},
				data: JSON.stringify(oRequest),
				type: "POST",
				contentType: "application/json; charset=UTF-8",
				async: false
			});
			oAjaxPromise.done(function(oResponseBody, sResponseText) {
				var oCurrentModel = that.getView().getModel("customReport");
				oCurrentModel.setData(oResponseBody.data);
				oCurrentModel.setProperty("/old_content",oCurrentModel.getProperty("/content"));				
				oCurrentModel.setProperty("/EDIT_STATUS", false);
				if (oCurrentModel.getProperty("/hasContent")) {
					oCurrentModel.setProperty("/CAN_CREATE", false);
					oCurrentModel.setProperty("/CAN_DELETE", true);
					oCurrentModel.setProperty("/CAN_MODIFY", true);
				} else {
					oCurrentModel.setProperty("/CAN_CREATE", true);
					oCurrentModel.setProperty("/CAN_DELETE", false);
					oCurrentModel.setProperty("/CAN_MODIFY", false);
				}
				
			});
		},
		
		beforeEditorInit: function(c){
		    	c.mParameters.configuration.paste_data_images = true;
				c.mParameters.configuration.automatic_uploads = true;
				c.mParameters.configuration.powerpaste_word_import = "clean";
				c.mParameters.configuration.powerpaste_html_import = "clean";
						c.mParameters.configuration.images_upload_handler = function(oFile, success, failure) {
							var oFileToUpload = oFile.blob();
							var sFileLabel = "CUSTOM_REPORT";
							// oFileToUpload.name = "image-" + (new Date()).getTime() + Math.floor(Math.random() * 1000) + "." + oFileToUpload.type.substr(oFileToUpload.type.lastIndexOf("/") + 1);
							if (oFileToUpload) {
								Attachment.uploadFileIncludeFileLabel(oFileToUpload, sFileLabel).done(function(oResponse) {
									success(Configuration.getAttachmentDownloadURL(oResponse.attachmentId));
								}).fail(function() {
									failure();
								});
							}
						};
						c.mParameters.configuration.paste_postprocess = function(editor, fragment) {
							window.tinymce.activeEditor.uploadImages();
						};				
				
				
				
		},
		getXCSRFTOKEN: function() {
			var that = this;
			var sPingURL = window.location.protocol + '//' + window.location.host + "/sap/ino/xs/rest/common/ping.xsjs";
			var oAjaxPromise = jQuery.ajax({
				url: sPingURL,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				type: "GET",
				contentType: "application/json; charset=UTF-8",
				async: false
			});
			oAjaxPromise.done(function(oResponseBody, sResponseText, oResponse) {
				that._xCSRFToken = oResponse.getResponseHeader("X-CSRF-Token");
			});
		},
		onCreateCustomReportStyle: function() {
			var oModel = this.getView().getModel("customReport");
			oModel.setProperty("/CAN_CREATE", false);
		    oModel.setProperty("/ACTION", "CREATE");
			oModel.setProperty("/EDIT_STATUS", true);
		},
		onModifyCustomReportStyle: function() {
			var oModel = this.getView().getModel("customReport");
			oModel.setProperty("/CAN_MODIFY", false);
		    oModel.setProperty("/ACTION", "UPDATE");			
			oModel.setProperty("/EDIT_STATUS", true);
		},
		onDeleteCustomReportStyle: function() {
			var oModel = this.getView().getModel("customReport");
			oModel.setProperty("/CAN_DELETE", false);
			//oModel.setProperty("/EDIT_STATUS", false);
		    var that = this;	
		var fnDelete = function(){
			var oRequest = {
				"ACTION": "DELETE"
			};
            var oReportVbox = that.byId('customReports');
			oReportVbox.setBusy(true);			
			var sURL = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/backoffice/customReports.xsjs";
			var oAjaxPromise = jQuery.ajax({
				url: sURL,
				headers: {
					"X-CSRF-Token": that._xCSRFToken
				},
				data: JSON.stringify(oRequest),
				type: "POST",
				contentType: "application/json; charset=UTF-8",
				async: false
			});
			oAjaxPromise.done(function(oResponseBody) {
			    oReportVbox.setBusy(false);
                 if(oResponseBody.type === "S"){
                    MessageToast.show(that.getText("ANALYITCS_CUSTOM_REPORTS_DELETE_SUCCESSFULLY"));
                    that.constructCustomReportsInfo(mVariant.CUSTOM_REPORTS);
                 } else {
                      oModel.setProperty("/CAN_DELETE", true);
                      MessageToast.show(oResponseBody.message);
                 }
			});	
			oAjaxPromise.fail(function(oResponse){
			    oReportVbox.setBusy(false);
			    oModel.setProperty("/CAN_DELETE", true);
			    MessageToast.show(oResponse.responseText); 
			});
		};		    
			//MessageBox to confirm;
					MessageBox.show(this.getText("ANALYITCS_CUSTOM_REPORTS_DELETE_BOX_MSG"), {
						title: this.getText("ANALYITCS_CUSTOM_REPORTS_DELETE_BOX_TITLE"),
						icon: MessageBox.Icon.WARNING,
						actions: [MessageBox.Action.YES, MessageBox.Action.NO],
						onClose: function(sDialogAction) {
							if (sDialogAction === MessageBox.Action.YES) {
								fnDelete();
								oModel.setProperty("/EDIT_STATUS", false);
							} else {
			                     oModel.setProperty("/CAN_DELETE", true);							    
							}
						}
					});	
			
		},
		onCustomReportStyleCancel: function() {
			var oModel = this.getView().getModel("customReport");	
			var that = this;
            if(oModel.getProperty("/old_content") === oModel.getProperty("/content")){
             this.constructCustomReportsInfo(mVariant.CUSTOM_REPORTS);
            } else {
					MessageBox.show(this.getText("ANALYITCS_CUSTOM_REPORTS_CANCEL_BOX_MSG"), {
						title: this.getText("ANALYITCS_CUSTOM_REPORTS_CANCEL_BOX_TITLE"),
						icon: MessageBox.Icon.WARNING,
						actions: [MessageBox.Action.YES, MessageBox.Action.NO],
						onClose: function(sDialogAction) {
							if (sDialogAction === MessageBox.Action.YES) {
							   oModel.setProperty("/ACTION", null);
							   that.constructCustomReportsInfo(mVariant.CUSTOM_REPORTS);
							} 
						}
					});
            }
            
		},
		hasPendingChanges: function() {
            var oModel = this.getView().getModel("customReport");
            
            if(oModel && oModel.getProperty("/old_content") !== oModel.getProperty("/content")) {
				return true;
			}
			return false;
		},		
    	resetPendingChanges: function() {
    			var oModel = this.getView().getModel("customReport");
				if(oModel && oModel.getProperty("/old_content") !== oModel.getProperty("/content")) {
				oModel.setProperty("/content",oModel.getProperty("/old_content"));
			}
    		},
		cancelOperationAction: function(){
		    var oSegmentButtons = this.byId("sapInoCampHomeIdeasButtons");
		    oSegmentButtons.setSelectedKey(mVariant.CUSTOM_REPORTS);
		},
		onCustomReportStyleSave: function() {
			var oModel = this.getView().getModel("customReport");			    
		    var that = this;
			var oRequest = {
				"ACTION": oModel.getProperty("/ACTION"),
				"CONTENT":oModel.getProperty("/content")
			};
			if(!oModel.getProperty("/ACTION")){
			    return;
			}
           var oReportVbox = this.byId('customReports');
			oReportVbox.setBusy(true);			
			var sURL = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/backoffice/customReports.xsjs";
			var oAjaxPromise = jQuery.ajax({
				url: sURL,
				headers: {
					"X-CSRF-Token": that._xCSRFToken
				},
				data: JSON.stringify(oRequest),
				type: "POST",
				contentType: "application/json; charset=UTF-8",
				async: false
			});
			
			oAjaxPromise.done(function(oResponseBody, sResponseText) {
			    oReportVbox.setBusy(false);
                 if(oResponseBody.type === "S"){
                    //messageToast() 
                    MessageToast.show(that.getText("ANALYITCS_CUSTOM_REPORTS_SAVE_SUCCESSFULLY"));
                    that.constructCustomReportsInfo(mVariant.CUSTOM_REPORTS);
                 } else {
                     MessageToast.show(oResponseBody.message); 
                 }
			});	
			oAjaxPromise.fail(function(oResponse){
			    oReportVbox.setBusy(false);
			    MessageToast.show(oResponse.responseText); 
			});
		}
	}));
});