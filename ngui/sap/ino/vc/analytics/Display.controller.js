sap.ui.define([
    "sap/ino/vc/commons/BaseObjectModifyController",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/commons/application/Configuration",
    "sap/ui/model/odata/ODataModel",
    "sap/ui/comp/smartfilterbar/ControlConfiguration",
    "sap/ui/comp/smartfilterbar/SelectOption",
    "sap/m/FlexItemData",
    "sap/m/SegmentedButtonItem",
    "sap/ui/comp/smartfilterbar/SmartFilterBar",
    "sap/ui/comp/smarttable/SmartTable",
    "sap/ui/comp/smartchart/SmartChart",
    "sap/ino/commons/models/object/Report",
    "sap/ino/commons/util/ReportUtil",
    "sap/ui/core/MessageType",
    "sap/ui/core/message/Message",
    "sap/m/Label",
    "sap/m/LabelDesign",
    "sap/ino/vc/commons/mixins/ExportMixin",
    "sap/ui/layout/VerticalLayout",
    "sap/ui/layout/HorizontalLayout",
    "sap/m/FlexBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
    ], function(BaseController, TopLevelPageFacet, Configuration,
	ODataModel, ControlConfiguration, SelectOption, FlexItemData, SegmentedButtonItem, SmartFilterBar, SmartTable, SmartChart, Report,
	ReportUtil, MessageType, Message, Label, LabelDesign, ExportMixin, VerticalLayout, HorizontalLayout, FlexBox, JSONModel, MessageBox) {
	"use strict";

	return BaseController.extend("sap.ino.vc.analytics.Display", jQuery.extend({}, TopLevelPageFacet, ExportMixin, {

		routes: ["report"],

		onInit: function() {
			BaseController.prototype.onInit.apply(this, arguments);

			this.oFlexItemData = new FlexItemData({
				growFactor: 0
			});

			this.oFlexItemLayoutData = new FlexItemData({
				growFactor: 1
			});

			this.oVBox = this.byId("oVBox");
			this.oSegmentedButton = this.byId("segmentedButton"); // maybe need to change code via xml view 
		},

		onRouteMatched: function(oEvent) {
            var bBOPrivilege = this.getModel("user").getProperty("/privileges")["sap.ino.ui::backoffice.access"];
            if(!bBOPrivilege){
              this.navigateTo("home"); 
              return;
              }			
			this.initFullScreen();

			this.setHelp("REPORT_DISPLAY");

			var oController = this;
			var sPath = oEvent.getParameter("arguments").code;
			this.sCampaignId = null;
			if (oEvent.getParameter("arguments")["?query"]) {
				this.sCampaignId = oEvent.getParameter("arguments")["?query"].campaign;
			}

			this.oObjectContext = {
				chartVisible: !Configuration.getPersonalize().REPORT_VIEW,
				tableVisible: !!Configuration.getPersonalize().REPORT_VIEW,
				saveButtonEnabled: true,
				otbFooterVisible: true,
				listBoxVisible: false,
				VBoxVisible: false,
				datePickerVisible: false
			};
			this.setModel(new JSONModel(this.oObjectContext), "objectContext");

			//remove all items , if using xml way ,maybe as below code ,we can delete them
			if (this.oSegmentedButton.getItems() && this.oSegmentedButton.getItems().length > 0) {
				this.oSegmentedButton.destroyItems();
				this.oSegmentedButton.destroyButtons();
			}
			//destroy the parameterDialog
			// 			if (this._oParameterDialog) {
			// 				this._oParameterDialog.destroy();
			// 				this._oParameterDialog = null;
			// 			}

			this.initModel(sPath);

			//add segmentedButton items
			if (this.oConfiguration.Views.length > 1) {
				jQuery.each(this.oConfiguration.Views, function(iIndex, oView) {
					var oItem = new SegmentedButtonItem({
						text: "{i18n>" + oView.DisplayName + "}",
						key: iIndex,
						width: "200px"
					});
					oController.oSegmentedButton.addItem(oItem);
				});
			}

			var aItem = this.oVBox.getItems();
			//smartChart  Note: Most of the attributes are not dynamic and cannot be changed once the control has been initialized.	
			if (aItem.length > 0) {
				this.oVBox.removeAllItems();
			}
			oController.aTempParameter = [];
			oController.iParameterIndex = 0;
			if (ReportUtil.checkMandatoryParameters(this.oConfiguration)) {
				this.freshViews(this.oConfiguration.SelectedView);
			}
		},

		initModel: function(sPath) {
			var oController = this;
			sPath = "/" + sPath;
			if (this.getOwnerComponent().getModel("data").getProperty(sPath)) {
				this.oConfig = this.getOwnerComponent().getModel("data").getProperty(sPath);
				this.oConfiguration = JSON.parse(this.oConfig.CONFIG);
				ReportUtil.deleteSorterInConfig(this.oConfiguration);
				oController.onAfterShow();
			} else {
				var sOdataPath = Configuration.getApplicationPath("sap.ino.config.URL_PATH_OD_BACKOFFICE");
				var oDataModel = new sap.ui.model.odata.ODataModel(Configuration.getBackendRootURL() + "/" + sOdataPath);

				oDataModel.read(sPath, {
					async: false,
					success: function(oData) {
						oController.oConfig = oData;
						oController.oConfiguration = JSON.parse(oData.CONFIG);
						ReportUtil.deleteSorterInConfig(oController.oConfiguration);
						oController.onAfterShow();
					}
				});
			}

			this.iSelectedView = this.oConfiguration.SelectedView;
			this.oSegmentedButton.setSelectedKey(this.iSelectedView.toString());

			this.oChartPage = this.byId("chartPage");
			this.oSaveButton = this.byId("saveButton");

			if (parseInt(this.oConfig.ID, 0) < 0) {
				//this.oChartPage.setText(this.oConfig.DEFAULT_TEXT);
				//this.oSaveButton.setEnabled(false);
				this.getModel("objectContext").setProperty("/saveButtonEnabled", false);
			} else {
				//this.oChartPage.setText(this.oConfiguration.Title);
				//this.oSaveButton.setEnabled(true);
				this.getModel("objectContext").setProperty("/saveButtonEnabled", true);
			}

			this.oModel = this.createModel(parseInt(this.oConfig.ID, 0), this.oConfig.CODE);
			this.setObjectModel(this.oModel);

			if (this.sCampaignId) {
				this.oConfiguration.Parameters.Campaign.Selection.push(this.sCampaignId);
				this.oTemplateDataRequest.done(function() {
					oController.getObjectModel().getProperty("/CONFIG").Parameters.Campaign.Selection.push(oController.sCampaignId);
				});
			}
			this._oSeletedTableView = 0;
		},

		onSaveAs: function() {
			this.getDialog().open();
			this.byId('reportTitle').setValue(this.oChartPage.getText());
		},

		onSave: function() {
			var oController = this;

			this.storeConfiguration();
			this.getObjectModel().setConfiguration(this.oConfiguration);
			var oRequest = this.executeObjectAction("modify");

			oRequest.always(function() {
				oController.setBusy(false);
			});
		},
		getDialog: function() {
			if (!this._oDialog) {
				this._oDialog = this.createFragment("sap.ino.vc.analytics.fragments.Dialog");
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},
		onSubmit: function() {
			var oController = this;

			this.storeConfiguration();
			this.oConfiguration.Title = this.byId('reportTitle').getValue();

			var oSettings = {
				continuousUse: true,
				actions: ["modify"],
				readSource: {
					model: this.getDefaultODataModel()
				}
			};
			oController.oModel = new Report(-1, oSettings);
			oController.oModel.setProperty("/ID", -1);
			oController.oModel.setConfiguration(this.oConfiguration);
			oController.setObjectModel(oController.oModel);

			var oDialog = this.getDialog();
			oDialog.setBusy(true);

			oController.resetClientMessages();
			var oRequest = oController.executeObjectAction("create");

			oRequest.done(function() {
				oDialog.close();
				oController.oChartPage.setText(oController.oConfiguration.Title);
				oController.oSaveButton.setEnabled(true);
				oController.getModel("objectContext").setProperty("/saveButtonEnabled", true);
			});

			oRequest.fail(function() {});

			oRequest.always(function() {
				oDialog.setBusy(false);
			});
		},

		onCancel: function() {
			this._oDialog.close();
		},

		createModel: function(iId, sCode) {
			var oSettings = {
				continuousUse: true,
				actions: ["modify"],
				readSource: {
					model: this.getDefaultODataModel()
				}
			};

			this.oModel = new Report(iId, oSettings);

			if (sCode !== undefined && sCode !== null) {
				if (!iId || iId < 0) {
					this.oTemplateDataRequest = this.oModel.setDataFromTemplate(sCode, this.getDefaultODataModel());
				}
			}
			if (!iId || iId < 0) {
				this._bSaveAllowed = false;
			} else {
				this._bSaveAllowed = true;
			}
			//everything done in this method is the initialization of the mode, make sure the change Manager does not recognize this as user change.
			this.oModel.setAfterInitChanges();

			return this.oModel;
		},

		onNavigateToChart: function() {
			// 			this.oSmartTable.setVisible(false);
			// 			this.oSmartChart.setVisible(true);
			var that = this;
			var oResult = this.checkSelectedClumns();
			if (oResult.errors.length > 0) { //this.getText("IDEA_LIST_REASSIGN_CAMPAIGN_MSG_CHG_NO_FORM_FIELD")
				MessageBox.error(sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_VALIDATION_CHARTTYPE"), {
					icon: MessageBox.Icon.ERROR,
					actions: [MessageBox.Action.CLOSE],
					onClose: function(sDialogAction) {
						that.byId("typeSegmentedButton").setSelectedButton(that.byId("navigateToTable"));
						that.getModel("objectContext").setProperty("/chartVisible", false);
						that.getModel("objectContext").setProperty("/tableVisible", true);
					}
				});
			} else {
				this.getModel("objectContext").setProperty("/chartVisible", true);
				this.getModel("objectContext").setProperty("/tableVisible", false);
				this.oSmartChart.applyVariant(this._convertTableSetingToChart());
			}
			this._oSeletedTableView = 0;
		},

		checkSelectedClumns: function() {
			var sChartType = this.oSmartChart.getChart().getChartType(); //fetchVariant().dimeasure.chartTypeKey;
			var aDimensionItems = [];
			var aMeasureItems = [];
			var allDefaultDimensions = this.oSmartChart.getChart().mAggregations.dimensions;
			var allDefaultMeasures = this.oSmartChart.getChart().mAggregations.measures;
			var aColumns = this.oSmartTable.getTable().mAggregations.columns;
			jQuery.each(aColumns, function(indexTb, dataTb) {
				if (dataTb.getProperty("visible")) {
					jQuery.each(allDefaultDimensions, function(indexD, dataD) {
						if (dataD.getProperty("name") === dataTb.getProperty("leadingProperty")) {
							aDimensionItems.push({
								"name": dataD.getProperty("name")
							});

						}
					});
					jQuery.each(allDefaultMeasures, function(indexM, dataM) {
						if (dataM.getProperty("name") === dataTb.getProperty("leadingProperty")) {
							aMeasureItems.push({
								"name": dataM.getProperty("name")
							});

						}

					});

				}

			});

			sap.ui.getCore().loadLibrary("sap.chart");
			var oResult = sap.chart.api.getChartTypeLayout(sChartType, aDimensionItems, aMeasureItems);
			return oResult;
		},
		onNavigateToTable: function() {
			// 			this.oSmartTable.setVisible(true);
			// 			this.oSmartChart.setVisible(false);
			var oObjectContext = this.getModel("objectContext");
			oObjectContext.setProperty("/chartVisible", false);
			oObjectContext.setProperty("/tableVisible", true);
			this._convertChartSetingToTable();
			this._oSeletedTableView = 1;
		},

		_formatChartType: function(sChartType) {
			var sChartTypeResult = "";
			if (sChartType && sChartType.indexOf("_") >= 0) {
				var stringArray = sChartType.split("_").reverse();
				jQuery.each(stringArray, function(iIndex, indexString) {
					var index = indexString.replace(/^(\w)(\w+)/, function(v, v1, v2) {
						return v1.toUpperCase() + v2.toLowerCase();
					});
					sChartTypeResult += index;
				});

				if (sChartTypeResult.indexOf("Horizontal") >= 0) {
					sChartTypeResult = sChartTypeResult.replace("Horizontal", "");
				}

				if (sChartTypeResult.indexOf("Vertical") >= 0) {
					sChartTypeResult = sChartTypeResult.replace("Vertical", "");
				}
			} else {
				if (sChartType !== "heatmap") {
					sChartTypeResult = sChartType;
				} else {
					sChartTypeResult = "HeatMap";
				}
			}
			return sChartTypeResult;
		},

		onSelect: function(oEvent) {
			this.storeConfiguration();
			this.iSelectedView = parseInt(oEvent.getParameters().key, 0);
			this.oConfiguration.SelectedView = this.iSelectedView;
			this.freshViews(this.iSelectedView);
		},

		freshViews: function(iSelectedView) {
			var index = this.getModel("objectContext").getProperty("/chartVisible") ? 0 : 1;
			var oTypeSegmentedButton = this.byId("typeSegmentedButton");
			oTypeSegmentedButton.setSelectedButton(oTypeSegmentedButton.getButtons()[index]);
			//this.byId("otbFooter").setVisible(true);
			this.getModel("objectContext").setProperty("/otbFooterVisible", true);
			this.sChartType = this.oConfiguration.Views[iSelectedView].Chart.Type;
			this.aDimensions = this.oConfiguration.Views[iSelectedView].Dimensions;
			this.aMeasures = this.oConfiguration.Views[iSelectedView].Measures;

			var aItem = this.oVBox.getItems();
			//smartChart  Note: Most of the attributes are not dynamic and cannot be changed once the control has been initialized.	
			if (aItem.length > 0) {
				this.oVBox.removeAllItems();
			}

			var oSmartFilterBar = new SmartFilterBar({
				showClearButton: true,
				layoutData: this.oFlexItemData,
				visible: false
			});

			var sAnalyticViewType = this.oConfiguration.DataSource + "Type";
			oSmartFilterBar.setEntityType(sAnalyticViewType);

			//filter odataModel
			var oGroupKeys = {};
			jQuery.each(this.oConfiguration.Parameters, function(iIndex, oParameter) {
				if (oParameter.hasOwnProperty("groupKey") && oParameter.groupKey) {
					oGroupKeys[oParameter.groupKey] = oGroupKeys[oParameter.groupKey] || [];
					oGroupKeys[oParameter.groupKey].push(oParameter);
					return true;
				}
				var vControlConfiguration = new ControlConfiguration({
					key: oParameter.Key,
					label: "{i18n>" + oParameter.DisplayName + "}",
					visibleInAdvancedArea: true
				});
				jQuery.each(oParameter.Selection, function(iSecondIndex, sSelection) {
					if (sSelection) {
						var vSelectOption = new SelectOption({
							low: sSelection
						});
						vControlConfiguration.addDefaultFilterValue(vSelectOption);
					} else {
						return true;
					}
				});
				oSmartFilterBar.addControlConfiguration(vControlConfiguration);
			});
			jQuery.each(oGroupKeys, function(sKey, aGroup) {
				var vControlConfiguration = new ControlConfiguration({
					key: sKey,
					label: "{i18n>" + aGroup[0].groupName + "}",
					visibleInAdvancedArea: true
				});
				var vSelectOption = new SelectOption({
					low: aGroup[0].Selection,
					high: aGroup[1].Selection + "T23:59:59",
					operator: "BT"
				});
				vControlConfiguration.addDefaultFilterValue(vSelectOption);
				oSmartFilterBar.addControlConfiguration(vControlConfiguration);
			});

			this.oSmartChart = new SmartChart({
				useChartPersonalisation: true,
				enableAutoBinding: true,
				layoutData: this.oFlexItemLayoutData,
				useVariantManagement: true,
				visible: "{objectContext>/chartVisible}"
				// showDrillBreadcrumbs: false
			});

			//this.oSmartChart._oDrillBreadcrumbs.setVisible(false);//smartChart showDrillBreadcrumbs property bug
			//this.oSmartChart.setVisible(true);
			// 			this.getModel("objectContext").setProperty("/chartVisible", true);
			// 			this.getModel("objectContext").setProperty("/tableVisible", false);
			if (this.aMeasures && this.aMeasures.length === 0) {
				this.getModel("objectContext").setProperty("/chartVisible", false);
				this.getModel("objectContext").setProperty("/tableVisible", true);
				this.byId("typeSegmentedButton").setSelectedButton(this.byId("navigateToTable"));
				this._oSeletedTableView = 1;
			}
			var sId = oSmartFilterBar.getId();
			this._sSmartFilterBarId = sId;
			this.oSmartChart.setSmartFilterId(sId);
			this.oSmartChart.setEntitySet(this.oConfiguration.DataSource);

			this.oConfiguration.SelectedView = this.iSelectedView;
			var sOdataPath = this.oConfiguration.ODataPath || Configuration.getApplicationPath("sap.ino.config.URL_PATH_OD_ANALYTICS");

			var mParameters = {
				json: false,
				loadAnnotationsJoined: true
			};

			var oAnalyticalChartModel = new ODataModel(Configuration.getBackendRootURL() + "/" + sOdataPath, mParameters);
			oAnalyticalChartModel.addAnnotationXML(ReportUtil.getAnnotationXML(this.oConfiguration));

			var oView = this.getView();
			oView.setModel(oAnalyticalChartModel);
			//add default sort of smart chart
			var oVariantSetting = {
				sort: {
					sortItems: []
				},
				filter: {
					filterItems: []
				}
			};
			if (this.oConfiguration.Views[iSelectedView].hasOwnProperty("Sorter") && this.oConfiguration.Views[iSelectedView].Sorter) {
				this.oConfiguration.Views[iSelectedView].Sorters = [{
					columnKey: this.oConfiguration.Views[iSelectedView].Sorter.Path,
					operation: this.oConfiguration.Views[iSelectedView].Sorter.Descending ? "Descending" : "Ascending"
				}];
				delete this.oConfiguration.Views[iSelectedView].Sorter;
			}
			if (this.oConfiguration.Views[iSelectedView].Sorters) {
				oVariantSetting.sort.sortItems = this.oConfiguration.Views[iSelectedView].Sorters;
			}
			if (this.oConfiguration.Views[iSelectedView].Filters) {
				oVariantSetting.filter.filterItems = this.oConfiguration.Views[iSelectedView].Filters;
			}
			//add fiter and sorter paramters to smart table
			this.oSmartChart.attachInitialise(null, function() {
				this.oSmartChart.applyVariant(oVariantSetting);
			}, this);
			this.oVBox.addItem(oSmartFilterBar);
			this.oVBox.addItem(this.oSmartChart);

			var that = this;
			setTimeout(function() {
				var oChart = that.oSmartChart.getChart();
				if (oChart) {
					oChart.setUiConfig({
						applicationSet: "fiori"
					});
				}
			}, 0);

			//add smart table
			var sVisibleFields = "";
			jQuery.each(this.oConfiguration.Views[iSelectedView].Dimensions, function(iIndex, sDimension) {
				sVisibleFields += (sDimension + ",");
			});

			if (this.oConfiguration.Views[iSelectedView].SecondaryDimensions) {
				jQuery.each(this.oConfiguration.Views[iSelectedView].SecondaryDimensions, function(iIndex, sDimension) {
					sVisibleFields += (sDimension + ",");
				});
			}

			jQuery.each(this.oConfiguration.Views[iSelectedView].Measures, function(iIndex, sMeasure) {
				sVisibleFields += (sMeasure + ",");
			});

			if (this.oConfiguration.Views[iSelectedView].SecondaryMeasures) {
				jQuery.each(this.oConfiguration.Views[iSelectedView].SecondaryMeasures, function(iIndex, sMeasure) {
					sVisibleFields += (sMeasure + ",");
				});
			}

			sVisibleFields = sVisibleFields.substring(0, sVisibleFields.length - 1);
			this._createSmartTable(sVisibleFields);
		},

		_createSmartTable: function(sVisibleFields) {
			if (this.oSmartTable) {
				this.oVBox.removeItem(this.oSmartTable);
				this.oSmartTable = undefined;
			}
			this.oSmartTable = new SmartTable({
				entitySet: this.oConfiguration.DataSource,
				smartFilterId: this._sSmartFilterBarId,
				tableType: "AnalyticalTable",
				useExportToExcel: true,
				useVariantManagement: false,
				useTablePersonalisation: true,
				header: "Views",
				showRowCount: true,
				enableAutoBinding: true,
				initiallyVisibleFields: sVisibleFields,
				ignoredFields: "ID",
				ignoreFromPersonalisation: "ID",
				layoutData: this.oFlexItemLayoutData,
				visible: "{objectContext>/tableVisible}"
			});
			this.oSmartTable.attachInitialise(function() {
				console.log(this.oSmartTable.getTable().getColumns());
			}, this);
			this.oSmartTable.attachBeforeRebindTable(function() {
				console.log(this.oSmartTable.getTable().getColumns());
			}, this);
			this.oVBox.addItem(this.oSmartTable);
		},

		fnGetFilter: function(oParam) {
			var oController = this,
				aFilter = [];
			for (var i = 0; i < oController.aTempParameter.length; i++) {
				var oParameter = oController.aTempParameter[i];
				if (oParam.Key === "CAMPAIGN_ID" || oParameter.Key.indexOf("SUBMISSION_DATE_") > -1) {
				    continue;
				}
				var aParameterFilter = [];
				for (var j = 0; j < oParameter.Selection.length; j++) {
					aParameterFilter.push(new sap.ui.model.Filter(oParameter.Key, "EQ", oParameter.Selection[j]));
				}
				if (aParameterFilter.length > 0) {
					aFilter.push(new sap.ui.model.Filter(aParameterFilter, false));
				}
			}
			var oReturn;
			if (aFilter.length > 0) {
				oReturn = new sap.ui.model.Filter(aFilter, true);
			}
			return oReturn;
		},

		fnBindData: function(oParameter, sDataSourcePath) {
			var oController = this,
				oView = oController.getView(),
				oListBox = oController.byId("listBox");
			oListBox.setAllowMultiSelect(oParameter.Multiselect);
			var oListBoxItem = new sap.ui.core.ListItem({
				key: "{" + oParameter.Key + "}",
				text: "{" + oParameter.Text + "}"
			});
			var oFilter = oController.fnGetFilter(oParameter);
			oListBox.bindAggregation("items", {
				path: "/" + (sDataSourcePath || oController.oConfiguration.DataSource),
				filters: oFilter,
				parameters: {
					select: oParameter.Key + "," + oParameter.Text
				},
				template: oListBoxItem,
				sorter: new sap.ui.model.Sorter(oParameter.Text, false)
			});
			if (oParameter.Selection !== undefined &&
				oParameter.Selection !== null &&
				oParameter.Selection.length > 0) {
				oListBox.getBinding("items").attachDataReceived(
					function() {
						oListBox.setBusy(false);
						oListBox.setSelectedKeys(oParameter.Selection);
					}
				);
			}
			var oDomRef = jQuery("#" + oView.createId("listBox-list"));
			oDomRef.attr("aria-require", oParameter.Mandatory || false);
		},

		_setListBox: function(oConfiguration) {
			var oController = this,
				sDataSource, oParameterModel,
				oListBox = oController.byId("listBox"),
				oDialog = this.getParameterDialog(),
				oParameters = oConfiguration.Parameters,
				aParameter = jQuery.map(oParameters, function(value) {
					return [value];
				});

			// 			oBtnNext.setText(aParameter.length > 1 ? this.getText("BO_ANA_BUT_NEXT") : this.getText("BO_ANA_BUT_OK"));
			var sODataPath = oConfiguration.ODataPath || Configuration.getApplicationPath("sap.ino.config.URL_PATH_OD_ANALYTICS");
			if (aParameter && aParameter[oController.iParameterIndex] && aParameter[oController.iParameterIndex].Key && aParameter[oController.iParameterIndex]
				.Key === "CAMPAIGN_ID") {
				sDataSource = "AuthCampaignReports";
				oParameterModel = new sap.ui.model.odata.v2.ODataModel(Configuration.getBackendRootURL() + "/" + Configuration.getApplicationPath(
					"sap.ino.config.URL_PATH_OD_BACKOFFICE"), {
					disableHeadRequestForToken: true
				});
				oParameterModel.setSizeLimit(10 * 1000);
			} else {
				sDataSource = undefined;
				oParameterModel = new sap.ui.model.odata.v2.ODataModel(Configuration.getBackendRootURL() + "/" + sODataPath, {
					disableHeadRequestForToken: true
				});
			}
			oListBox.setModel(oParameterModel);
			if (oDialog && oDialog.getParent()) {
				oDialog.getParent().setBusy(true);
			}
			oParameterModel.attachBatchRequestCompleted(function() {
				if (oDialog.getParent()) {
					oDialog.getParent().setBusy(false);
				}
				oListBox.setBusy(false);
				oDialog.open();
				oController.getModel("objectContext").setProperty("/listBoxVisible", true);
				oController.getModel("objectContext").setProperty("/VBoxVisible", false);
			});
			oController.fnBindData(aParameter[oController.iParameterIndex], sDataSource);
		},

		_bindCancelBtn: function() {
			var oController = this,
				oCancelButton = this.byId("parametercancelbutton"); // or use the way this.byId(__xmlview2--parametercancelbutton)
			var fnCancel = function() {
				var _oDialog = oController.byId("parameterDialog");
				oController.iParameterIndex = 0;
				_oDialog.close();
				if (oController.oVBox.getItems().length === 0) {
					oController.navigateBack();
				}
			};
			oCancelButton.attachPress(fnCancel);
		},

		_nextPress: function() {
			var oController = this;
			return function() {
				var oConfiguration = oController.oConfiguration,
					oParameters = oConfiguration.Parameters,
					aParameter = jQuery.map(oParameters, function(value) {
						return [value];
					}),
					oDatePicker = oController.byId("datePicker"),
					oLabel = oController.byId("dialogLabel");
				var oParameter = aParameter[oController.iParameterIndex];
				if (oParameter.ControlType && oParameter.ControlType === "DatePicker") {
					if (oParameter.Mandatory && !oDatePicker.getValue()) {
						if (oDatePicker.setValueState) {
							oDatePicker.setValueState(sap.ui.core.ValueState.Error);
						}
						return;
					}

					oController.aTempParameter[oController.iParameterIndex] = {};
					oController.aTempParameter[oController.iParameterIndex].Selection = oDatePicker.getValue();
					oController.aTempParameter[oController.iParameterIndex].SelectionString = oDatePicker.getValue();
					oController.aTempParameter[oController.iParameterIndex].Key = oParameter.Key;
				} else {
					var oListBox = oController.byId("listBox");
					var fnStoreParameter = function(oParameter) {
						var bStored = true;
						var aSelectedItems = oListBox.getSelectedItems();
						if (oParameter.Mandatory && aSelectedItems.length === 0) {
							oListBox.addStyleClass("sapUiInoListBoxErr");
							bStored = false;
						} else {
							var aParameterKeys = [];
							var aParameterNames = [];
							jQuery.each(aSelectedItems, function(iIndex, oItem) {
								aParameterKeys.push(oItem.getKey());
								aParameterNames.push(oItem.getText().trim());
							});

							var sSelectionString = aParameterNames.join(", ");
							oController.aTempParameter[oController.iParameterIndex] = {};
							oController.aTempParameter[oController.iParameterIndex].Selection = aParameterKeys;
							oController.aTempParameter[oController.iParameterIndex].SelectionString = sSelectionString;
							oController.aTempParameter[oController.iParameterIndex].Key = oParameter.Key;
						}
						return bStored;
					};
					if (!fnStoreParameter(aParameter[oController.iParameterIndex])) {
						return;
					}
					if ((aParameter && aParameter.length > 1 && oListBox.getModel().sServiceUrl.indexOf("analytics.xsodata") < 0) || (aParameter &&
						aParameter.length === 1 && aParameter[0].Key !== "CAMPAIGN_ID")) {
						var oChangeModel = new sap.ui.model.odata.v2.ODataModel(Configuration.getBackendRootURL() + "/" + (oConfiguration.ODataPath ||
							Configuration.getApplicationPath("sap.ino.config.URL_PATH_OD_ANALYTICS")), {
							disableHeadRequestForToken: true
						});
						oChangeModel.attachBatchRequestCompleted(function() {
							oListBox.setBusy(false);
						});
						if (oListBox.getBindingInfo("items").path.indexOf("AuthCampaignReports") > -1) {
							oListBox.removeAllItems();
							oListBox.setModel(null);
							oListBox.mBindingInfos.items.path = "";
						}
						oListBox.setModel(oChangeModel);
					}
					oListBox.setBusy(true);
				}
				oController.iParameterIndex += 1;
				oParameter = aParameter[oController.iParameterIndex];
				if (!oParameter) {
					oController._goNext(null, aParameter[oController.iParameterIndex]);
					return;
				}

				oLabel.setText(oController.getText(oParameter.DisplayName));
				oLabel.setRequired(oParameter.Mandatory || false);
				oController.getModel("objectContext").setProperty("/listBoxVisible", false);
				oController.getModel("objectContext").setProperty("/VBoxVisible", false);
				oController.getModel("objectContext").setProperty("/datePickerVisible", false);
				if (oParameter.ControlType && oParameter.ControlType === "DatePicker") {
					oController.getModel("objectContext").setProperty("/datePickerVisible", true);
					oController._goNext(null, aParameter[oController.iParameterIndex]);
					if (oDatePicker) {
						var sDatePickerValue = "";
						if (oController.aTempParameter && oController.aTempParameter[oController.iParameterIndex]) {
							sDatePickerValue = oController.aTempParameter[oController.iParameterIndex].Selection;
						}
						oDatePicker.setValue(sDatePickerValue);
						if (oDatePicker.setValueState) {
							oDatePicker.setValueState(sap.ui.core.ValueState.None);
						}
					}
				} else {
					oController.getModel("objectContext").setProperty("/listBoxVisible", true);
					oController._goNext(oController.fnBindData, aParameter[oController.iParameterIndex]);
				}
			};
		},

		_goNext: function(fnBind, oParameter) {
			var oController = this,
				oDialog = oController.getParameterDialog(),
				oConfiguration = oController.oConfiguration;
			var oParameters = oConfiguration.Parameters;
			var aParameter = jQuery.map(oParameters, function(value) {
				return [value];
			});
			if (oController.iParameterIndex === aParameter.length) {
				for (var i = 0; i < aParameter.length; i++) {
					aParameter[i].Selection = oController.aTempParameter[i].Selection;
					aParameter[i].SelectionString = oController.aTempParameter[i].SelectionString;
				}
				oController.iParameterIndex = 0;
				oDialog.close();

				oController.freshViews(oConfiguration.SelectedView);
			} else {
				if (oController.iParameterIndex === aParameter.length - 1) {
					oController.byId("parameterbutton").setText(oController.getText("BO_ANA_BUT_OK"));
				}
				if (fnBind) {
					fnBind.call(oController, oParameter);
				}
			}
		},

		getReportParameter: function() {
			var oConfiguration = this.oConfiguration,
				oController = this;
			if (!oConfiguration.Parameters) {
				return;
			}
			var oDialog = oController.getParameterDialog();
			if (oDialog && oDialog.isOpen()) {
				if (ReportUtil.checkMandatoryParameters(oConfiguration)) {
					oDialog.close();
				}
			}
			oController.getModel("objectContext").setProperty("/listBoxVisible", false);
			oController.getModel("objectContext").setProperty("/datePickerVisible", false);
			oController.getModel("objectContext").setProperty("/VBoxVisible", true);
			var oBtnNext = oController.byId("parameterbutton");
			// 			oBtnNext.removePress();
			oController.iParameterIndex = oController.iParameterIndex || 0;
			oController.aTempParameter = oController.aTempParameter || [];
			var oParameters = oConfiguration.Parameters;
			var aParameter = jQuery.map(oParameters, function(value) {
				return [value];
			});
			var oParameter = aParameter[oController.iParameterIndex];
			if (oParameter.ControlType && oParameter.ControlType === "DatePicker") {
				oController.getModel("objectContext").setProperty("/datePickerVisible", true);
				oDialog.open();
			} else {
				var oLabel = oController.byId("dialogLabel");
				oLabel.setText(oController.getText(oParameter.DisplayName));
				oLabel.setRequired(oParameter.Mandatory || false);
				oController._setListBox(oConfiguration);
			}
			oBtnNext.setText(aParameter.length > 1 ? oController.getText("BO_ANA_BUT_NEXT") : oController.getText("BO_ANA_BUT_OK"));
			if (!oController.hasNextBtnEvent) {
				oController.hasNextBtnEvent = true;
				oBtnNext.attachPress(oController._nextPress());
				oController._bindCancelBtn();
			}
		},

		getParameterDialog: function() {
			if (!this._oParameterDialog) {
                this.hasNextBtnEvent = false;
				this._oParameterDialog = this.createFragment("sap.ino.vc.analytics.fragments.ParameterDialog");
				this.getView().addDependent(this._oParameterDialog);
			}
			return this._oParameterDialog;
		},

		onFilter: function() {
			this.getReportParameter();
		},
		onShowFilter: function(oEvent) {
			if (!this._oPopover) {
				this._oPopover = this.createFragment("sap.ino.vc.analytics.fragments.Popover");
				this.getView().addDependent(this._oPopover);
			}

			if (this._oPopover.isOpen()) {
				this._oPopover.close();
			} else {
				this._oPopover.destroyContent();

				var oController = this;
				var oLayout = new VerticalLayout({
					width: "500px"
				});
				var oParameters = this.oConfiguration.Parameters;
				if (oParameters) {
					var bFirstParameter = true;
					jQuery.each(oParameters, function(iIndex, oParameter) {
						if (oParameter.SelectionString) {
							var aSelection = oParameter.SelectionString.split(",");
							var iLength = aSelection.length;
							for (var i = 0; i < iLength; i++) {
								if (bFirstParameter) {
									oLayout.addContent(oController.createFilterRow("{i18n>BO_ANA_FLD_SELECT_PARAMETER}"));
									bFirstParameter = false;
								}
								if (!i) {
									oLayout.addContent(oController.createFilterRow(
										"{i18n>" + oParameter.DisplayName + "}",
										aSelection[i]));
								} else {
									oLayout.addContent(oController.createFilterRow(
										undefined,
										aSelection[i]));
								}

							}
						}
					});
				}
				var oViewFilter = ReportUtil.getViewConfiguration(this.oConfiguration).FilterText;
				if (oViewFilter) {
					oLayout.addContent(oController.createFilterRow("{i18n>BO_ANA_FLD_LOCAL_VIEW_FILTER}"));
					jQuery.each(oViewFilter, function(sKey, sFilterValue) {
						oLayout.addContent(oController.createFilterRow(sKey, sFilterValue));
					});
				}

				if (oLayout.getContent().length === 0) {
					oLayout.addContent(oController.createFilterRow("{i18n>BO_ANA_FLD_NO_FILTER_SET}"));
				}

				this._oPopover.addContent(oLayout);

				var oButton = oEvent.getSource();
				jQuery.sap.delayedCall(0, this, function() {
					this._oPopover.openBy(oButton);
				});
			}
		},

		onAfterShow: function() {
			//check parameter
			if (this.oConfiguration && !ReportUtil.checkMandatoryParameters(this.oConfiguration)) {
				this.getReportParameter();
			}
		},

		onAfterHide: function() {
			var listBox = this.byId("listBox");
			if (listBox) {
				listBox.setModel(null);
			}
			this.oConfiguration = null;
			//because sometimes onroutematch excute after than onaftershow
			if (this._oParameterDialog) {
				this.getView().removeDependent(this._oParameterDialog);
				this._oParameterDialog.destroy();
				this._oParameterDialog = null;
			}
		},

		createFilterRow: function(sDimension, sValue) {
			var oDimensionLabel;
			if (sDimension) {
				oDimensionLabel = new Label({
					text: sDimension,
					width: "150px"
				});
			}
			var oValueLabel;
			if (sValue) {
				oValueLabel = new Label({
					text: sValue,
					width: "250px"
				});
			} else {
				oDimensionLabel.setDesign(LabelDesign.Bold);
				return new HorizontalLayout({
					content: [new FlexBox({
						alignItems: "Center",
						height: "40px",
						width: "150px",
						items: [oDimensionLabel]
					})]
				});
			}
			return new HorizontalLayout({
				content: [new FlexBox({
						alignItems: "Center",
						height: "40px",
						width: "150px",
						items: [oDimensionLabel]
					}),
				new FlexBox({
						alignItems: "Center",
						height: "40px",
						width: "250px",
						items: [oValueLabel]
					})]
			});
		},
		resetPendingChanges: function() {
			var oModel = this.getObjectModel();
			if (oModel && oModel.hasPendingChanges()) {
				oModel.revertChanges();
			}
			oModel.revertChanges();
			this._oReset = true;
		},
		hasPendingChanges: function() {
			if (this._oReset === true) {
				this._oReset = false;
				return false;
			}
			if (!this.oSmartChart || !this.oSmartTable) {
				return false;
			}
			if (!this.getObjectModel().getConfiguration()) {
				return false;
			}

			if (this.getObjectModel().getKey() < 0) {
				if (this.oConfiguration.Parameters && this.oConfiguration.Parameters.Campaign.Mandatory) {
					var boolResult = !!this.oConfiguration.Parameters.Campaign.Selection[0];
					return boolResult;
				} else {
					if (this.getObjectModel().getConfiguration().Description) {
						delete this.getObjectModel().getConfiguration().Description;
					}
					if (this.getObjectModel().getConfiguration().Title) {
						delete this.getObjectModel().getConfiguration().Title;
					}
				}
			}

			var vConfiguration = this.getObjectModel().getConfiguration();
			if (vConfiguration.Parameters && typeof(vConfiguration.Parameters.Campaign.Selection[0]) === "number") {
				vConfiguration.Parameters.Campaign.Selection[0] = vConfiguration.Parameters.Campaign.Selection[0].toString();
			}

			if (JSON.stringify(vConfiguration) !== JSON.stringify(this.oConfiguration)) {
				return true;
			}

			var currentChartType, currentDimensions, currentMeasures;
			var oCurrentVariant = this.oSmartChart.fetchVariant();
			if (!this._oSeletedTableView) {
				if (!oCurrentVariant || !oCurrentVariant.dimeasure) {
					currentChartType = this.sChartType;
					currentDimensions = this.aDimensions;
					currentMeasures = this.aMeasures;
				} else {
					currentChartType = "viz/" + this._formatChartType(oCurrentVariant.dimeasure.chartTypeKey);
					currentDimensions = [];
					currentMeasures = [];

					jQuery.each(oCurrentVariant.dimeasure.dimeasureItems, function(iIndex, indexDimeasure) {
						if (!indexDimeasure.visible) {
							return true;
						} else {
							if (indexDimeasure.role.indexOf("axis") >= 0) {
								currentMeasures.push(indexDimeasure.columnKey);
							} else {
								if (indexDimeasure.role === "category" || indexDimeasure.role === "series") {
									currentDimensions.push(indexDimeasure.columnKey);
								}
							}
						}
					});
				}
			} else {
				var oCurrentTableVariant = this.oSmartTable.fetchVariant();
				if (!oCurrentTableVariant || !oCurrentTableVariant.columns) {
					currentChartType = this.sChartType;
					currentDimensions = this.aDimensions;
					currentMeasures = this.aMeasures;
				} else {

					currentChartType = this.sChartType;
					currentDimensions = [];
					currentMeasures = [];

					var oCurrentTable = this.oSmartTable.getTable();
					var oTableColumns = oCurrentTable.getColumns();
					var oCurrentChart = this.oSmartChart.getChart();
					var aDimensions = oCurrentChart.getDimensions();
					var aMeasures = oCurrentChart.getMeasures();
					jQuery.each(oTableColumns, function(index, oColumn) {
						if (!oColumn.getVisible()) {
							return true;
						} else {
							jQuery.each(aDimensions, function(iIndex, dimension) {
								if (dimension.getName() === oColumn.getLeadingProperty()) {
									currentDimensions.push(dimension.getName());
								}
							});
							jQuery.each(aMeasures, function(iIndex, measure) {
								if (measure.getName() === oColumn.getLeadingProperty()) {
									currentMeasures.push(measure.getName());
								}

							});
						}
					});
				}
			}

			var oChartView = this.getObjectModel().getConfiguration().Views[this.iSelectedView];
			if (oChartView.Chart.Type !== currentChartType || JSON.stringify(oChartView.Dimensions) !== JSON.stringify(currentDimensions) ||
				JSON.stringify(oChartView.Measures) !== JSON.stringify(currentMeasures)) {
				return true;
			}

			return false;
		},

		storeConfiguration: function() {
			var currentChartType, currentDimensions, currentMeasures;
			var oCurrentVariant = this.oSmartChart.fetchVariant();
			if (!this._oSeletedTableView) {
				if (!oCurrentVariant || !oCurrentVariant.dimeasure) {
					currentChartType = this.sChartType;
					currentDimensions = this.aDimensions;
					currentMeasures = this.aMeasures;
				} else {

					currentChartType = "viz/" + this._formatChartType(oCurrentVariant.dimeasure.chartTypeKey);
					currentDimensions = [];
					currentMeasures = [];
					jQuery.each(oCurrentVariant.dimeasure.dimeasureItems, function(iIndex, indexDimeasure) {
						if (!indexDimeasure.visible) {
							return true;
						} else {
							if (indexDimeasure.role.indexOf("axis") >= 0) {
								currentMeasures.push(indexDimeasure.columnKey);
							} else {
								if (indexDimeasure.role === "category" || indexDimeasure.role === "series") {
									currentDimensions.push(indexDimeasure.columnKey);
								}
							}
						}
					});
				}
			} else {
				var oCurrentTableVariant = this.oSmartTable.fetchVariant();
				if (!oCurrentTableVariant || !oCurrentTableVariant.columns) {
					currentChartType = this.sChartType;
					currentDimensions = this.aDimensions;
					currentMeasures = this.aMeasures;
				} else {

					currentChartType = this.sChartType;
					currentDimensions = [];
					currentMeasures = [];

					var oCurrentTable = this.oSmartTable.getTable();
					var oTableColumns = oCurrentTable.getColumns();
					var oCurrentChart = this.oSmartChart.getChart();
					var aDimensions = oCurrentChart.getDimensions();
					var aMeasures = oCurrentChart.getMeasures();
					jQuery.each(oTableColumns, function(index, oColumn) {
						if (!oColumn.getVisible()) {
							return true;
						} else {
							jQuery.each(aDimensions, function(iIndex, dimension) {
								if (dimension.getName() === oColumn.getLeadingProperty()) {
									currentDimensions.push(dimension.getName());
								}
							});
							jQuery.each(aMeasures, function(iIndex, measure) {
								if (measure.getName() === oColumn.getLeadingProperty()) {
									currentMeasures.push(measure.getName());
								}

							});
						}

					});

				}

				if (!oCurrentVariant || !oCurrentVariant.dimeasure) {
					this.aDimensions = currentDimensions;
					this.aMeasures = currentMeasures;

				}

			}

			var oConfiguration = this.oConfiguration;
			oConfiguration.SelectedView = this.iSelectedView;
			oConfiguration.Views[this.iSelectedView].Chart.Type = currentChartType;
			oConfiguration.Views[this.iSelectedView].Measures = currentMeasures;
			oConfiguration.Views[this.iSelectedView].Dimensions = currentDimensions;
			if (oCurrentVariant) {
				if (oCurrentVariant.filter) {
					oConfiguration.Views[this.iSelectedView].Filters = oCurrentVariant.filter.filterItems;
				}
				if (oCurrentVariant.sort) {
					oConfiguration.Views[this.iSelectedView].Sorters = oCurrentVariant.sort.sortItems;
				}
			}
		},

		onExport: function(oEvent) {
			if (this.oSmartTable.getVisible()) {
				var oViewModel = this.getModel("view");
				if (oViewModel) {
					var oListProperty = oViewModel.getProperty("/List");
					if (!oListProperty) {
						oViewModel.setProperty("/List", {});
					}
					oViewModel.setProperty("/List/HIDE_PPT_EXPORT", true);
				}
				this.onListExport(oEvent);
			} else {
				this.onChartExportSVG(oEvent);
			}
		},

		getExportControl: function() {
			return this.oSmartTable.getTable();
		},

		getExportChartControl: function() {
			return this.oSmartChart._getVizFrame();
		},

		getChartTitle: function() {
			return this.oChartPage.getText();
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

		_convertChartSetingToTable: function() {
			var result = jQuery.extend(true, {}, this.oSmartChart.fetchVariant()),
				that = this;
			var aFields = [],
				oCurrentTxtPro, sCurrentTxtPro;
			result.columns = {
				columnsItems: []
			};
			var aColumnKeys = [].concat(this.oSmartChart.getChart().getVisibleDimensions())
				.concat(this.oSmartChart.getChart().getVisibleMeasures());
			var aTableColumns = this.oSmartTable._aColumnKeys;
			jQuery.each(aColumnKeys, function(index, data) {
				oCurrentTxtPro = that.oSmartChart.getChart().getDimensionByName(data);
				if (oCurrentTxtPro) {
					sCurrentTxtPro = oCurrentTxtPro.getTextProperty();
				}
				jQuery.each(aTableColumns, function(indexTb, dataTb) {
					if (data === dataTb || (sCurrentTxtPro && sCurrentTxtPro === dataTb)) {
						result.columns.columnsItems.push({
							"columnKey": dataTb,
							"visible": true
						});
						aFields.push(dataTb);
					}
				});
			});
			delete result.dimeasure;
			this._createSmartTable(aFields.join(","));
			this.oSmartTable.applyVariant(result);
		},

		_convertTableSetingToChart: function() {
			var result = jQuery.extend(true, {}, this.oSmartTable.fetchVariant());
			result.dimeasure = {
				chartTypeKey: this.oSmartChart.getChart().getProperty("chartType"),
				dimeasureItems: []
			};
			var aColumnsItems = [].concat(this.oSmartChart.getChart().mAggregations.dimensions)
				.concat(this.oSmartChart.getChart().mAggregations.measures);
			jQuery.each(this.oSmartTable.getTable().mAggregations.columns, function(indexTb, dataTb) {
				if (dataTb.getProperty("visible")) {
					jQuery.each(aColumnsItems, function(index, data) {
						if (data.getProperty("name") === dataTb.getProperty("leadingProperty")) {
							result.dimeasure.dimeasureItems.push({
								"columnKey": dataTb.getProperty("leadingProperty"),
								"visible": true,
								"role": data.getRole()
							});
						}
					});
				}
			});
			delete result.columns;
			return result;
		}
	}));
});