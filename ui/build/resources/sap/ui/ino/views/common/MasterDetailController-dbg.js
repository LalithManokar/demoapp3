/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.views.common.MasterDetailController");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");
jQuery.sap.require("sap.ui.ino.views.common.TableExport");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.models.core.InvalidationManager");
jQuery.sap.require("sap.ui.ino.views.common.ExtensionPointHelper");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.models.core.ApplicationObjectChange");
jQuery.sap.require("sap.ui.ino.controls.BusyIndicator");
jQuery.sap.require("jquery.sap.storage");

(function() {
	"use strict";
	var ExtensionPointHelper = sap.ui.ino.views.common.ExtensionPointHelper;
	var DEFAULT_TABLE_VIEW = "default";

	sap.ui.ino.views.common.MasterDetailController = {
		onInit: function() {
			this._mSettings = this.getSettings();
			this._enhanceSettingsWithExtension();
			// here we store the sorts which a user has triggered (they are not accessible from the binding)
			this._oUserSorter = null;
			this.getView().getTable().attachSort(this._onTableSort, this);
			// These are binding path parameters which are changed/influenced by users
			this._mDynamicBindingPathParameters = {
				searchTerm: '',
				tagsToken: ''
			};
			this._oCurrentTableView = null;
			this._setCurrentTableView(DEFAULT_TABLE_VIEW);
			// Write model
			if (this.createWriteModel) {
				var oWriteModel = this.createWriteModel();
				this.getView().setModel(oWriteModel, "write");
			}

			this._initApplicationObjectChangeListeners();
			this.setDataLoading(true);

			if (this.onAfterInit) {
				this.onAfterInit();
			}

			if (this.updateSelectObjectModel) {
				this.updateSelectObjectModel();
			}
			if (this.updatePropertyModel) {
				this.updatePropertyModel();
			}
		},

		setDataLoading: function(bLoading) {
			var oBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
			var oTable = this.getView().getTable();

			if (bLoading) {
				oTable.setNoData(oBundle.getText("BO_APPLICATION_MSG_LOADING"));
			} else {
				oTable.setNoData(oBundle.getText("BO_APPLICATION_MSG_NODATA"));
			}
		},

		_initApplicationObjectChangeListeners: function() {
			var that = this;
			var sApplicationObject = that._mSettings.sApplicationObject;

			var fRevalidateTableEntity = function(oEvent, oTable) {
				var vKey = oEvent.getParameter("key");
				if (vKey) {
					if (oTable && oTable.getBindingInfo("rows") && oTable.getBindingInfo("rows").binding) {
						var aTableEntityKeys = oTable.getBindingInfo("rows").binding.aKeys;
						jQuery.each(aTableEntityKeys, function(iTableEntityKeyIndex, sTableEntityKey) {
							if (sap.ui.ino.models.core.InvalidationManager.entityKeyContainsId(sTableEntityKey, vKey)) {
								that.revalidate(sTableEntityKey);
							}
						});
					}
				}
			};

			this._fUpdateFunction = function(oEvent) {
				var sChangedApplicationObject = oEvent.getParameter("object").getMetadata().getName();
				if (sChangedApplicationObject === sApplicationObject) {
					if (that.isFullTableRefreshRequired(oEvent.getParameter("actionName"), oEvent.getParameter("instanceData"))) {
						that.refreshTableView(oEvent.getParameter("key"));
					} else {
						fRevalidateTableEntity(oEvent, that.getView().getTable());
					}
				}
			};
			sap.ui.ino.models.core.ApplicationObjectChange.attachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Update, this._fUpdateFunction);

			this._fCreateFunction = function(oEvent) {
				var sCreatedApplicationObject = oEvent.getParameter("object").getMetadata().getName();
				if (sCreatedApplicationObject === sApplicationObject) {
					that.refreshTableView();
				}
			};
			sap.ui.ino.models.core.ApplicationObjectChange.attachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Create, this._fCreateFunction);

			this._fCopyFunction = function(oEvent) {
				var sCopiedApplicationObject = oEvent.getParameter("object").getMetadata().getName();
				if (sCopiedApplicationObject === sApplicationObject) {
					that.refreshTableView(oEvent.getParameter("key"));
				}
			};
			sap.ui.ino.models.core.ApplicationObjectChange.attachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Copy, this._fCopyFunction);

			this._fDelFunction = function(oEvent) {
				var sDeletedApplicationObject = oEvent.getParameter("object").getMetadata().getName();
				if (sDeletedApplicationObject === sApplicationObject) {
					that.refreshTableView();
				}
			};
			sap.ui.ino.models.core.ApplicationObjectChange.attachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Del, this._fDelFunction);

			this._fCustomActionFunction = function(oEvent) {
				var sActionName = oEvent.getParameter("actionName");
				var bFullTableRefreshed = false;
				if (oEvent.getParameter("object").getApplicationObjectMetadata().actions[sActionName]) {
					var aImpactedApplicationObjects = oEvent.getParameter("object").getApplicationObjectMetadata().actions[sActionName].impacts;
					if (aImpactedApplicationObjects && jQuery.isArray(aImpactedApplicationObjects)) {
						jQuery.sap.require(sApplicationObject);
						var sControllerApplicationObject = jQuery.sap.getObject(sApplicationObject, 0).objectName;
						if (jQuery.inArray(sControllerApplicationObject, aImpactedApplicationObjects) > -1) {
							that.refreshTableView(oEvent.getParameter("key"));
							bFullTableRefreshed = true;
						}
					}
				}
				// some custom actions require a refresh of the full table
				if (that.isFullTableRefreshRequired(sActionName)) {
					that.refreshTableView(oEvent.getParameter("key"));
					bFullTableRefreshed = true;
				}
				var sInitiatingApplicationObject = oEvent.getParameter("object").getMetadata().getName();
				if (sInitiatingApplicationObject === sApplicationObject && !bFullTableRefreshed) {
					fRevalidateTableEntity(oEvent, that.getView().getTable());
				}
			};

			sap.ui.ino.models.core.ApplicationObjectChange.attachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Action, this._fCustomActionFunction);
		},

		setHistoryState: function(oHistoryState) {
			this.switchTableView(oHistoryState);
		},

		// by default no full table refresh is required. a specific controller
		// can redefine this method on demand to trigger full table refresh
		isFullTableRefreshRequired: function(sCustomActionName) {
			return false;
		},

		onExit: function(oEvent) {
			this._storeState();
			var oDetailsView = this.getView()._oDetailsView;
			if (oDetailsView) {
				oDetailsView.destroy();
				this.getView()._oDetailsView = null;
			}
			this._detachApplicationObjectListeners();
		},

		_detachApplicationObjectListeners: function() {
			sap.ui.ino.models.core.ApplicationObjectChange.detachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Update, this._fUpdateFunction);
			sap.ui.ino.models.core.ApplicationObjectChange.detachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Create, this._fCreateFunction);
			sap.ui.ino.models.core.ApplicationObjectChange.detachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Copy, this._fCopyFunction);
			sap.ui.ino.models.core.ApplicationObjectChange.detachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Del, this._fDelFunction);
			sap.ui.ino.models.core.ApplicationObjectChange.detachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Action, this._fCustomActionFunction);
		},

		_enhanceSettingsWithExtension: function() {
			var oTable = this.getView().getTable();
			var aColumn = oTable.getColumns();
			var oController = this;
			jQuery.each(aColumn, function(sIndex, oColumn) {
				var aCustomData = oColumn.getCustomData();
				var bIsExtension = ExtensionPointHelper.findCustomData(aCustomData, "isExtension");
				if (bIsExtension) {
					var sColumnName = ExtensionPointHelper.findCustomData(aCustomData, "columnName");
					var bFilteredEnabled = ExtensionPointHelper.findCustomData(aCustomData, "filteringEnabled");
					var aFilteredCodes = ExtensionPointHelper.findCustomData(aCustomData, "filteredCodes");
					var sCodeTable = ExtensionPointHelper.findCustomData(aCustomData, "codeTable");
					var aTableView = ExtensionPointHelper.findCustomData(aCustomData, "tableViews");
					// Add filtering menu for codes
					if (bFilteredEnabled && sCodeTable) {
						var oFilterMenu = new sap.ui.commons.Menu({
							items: [sap.ui.ino.application.backoffice.ControlFactory.createTableColumnCodeFilterMenu(oTable, oColumn, sCodeTable,
								aFilteredCodes)]
						});
						oColumn.setMenu(oFilterMenu);
					}
					// Register column as visible
					jQuery.each(oController._mSettings.mTableViews, function(sViewName, oTableView) {
						if (!aTableView || aTableView.length == 0 || aTableView.indexOf(sViewName) != -1) {
							// if not specified all columns are displayed
							if (oTableView.aVisibleColumns) {
								oTableView.aVisibleColumns.push(sColumnName);
							}
						}
					});
				}
			});
		},

		switchTableView: function(oViewState) {
			if (oViewState) {
				if (oViewState.campaignId && this.setCampaignId) {
					this.setCampaignId(oViewState.campaignId);
				}
				this._setCurrentTableView(oViewState.tableView);
			}
			this._setTableTitle();
			this.showColumns(this._oCurrentTableView.aVisibleColumns);
			this.showActionButtons(this._oCurrentTableView.aVisibleActionButtons);
			var bShowPreview = this._oCurrentTableView.showPreview != undefined ? this._oCurrentTableView.showPreview : true;
			var iVisibleRowCount = this._oCurrentTableView.visibleRowCount != undefined && bShowPreview ? this._oCurrentTableView.visibleRowCount :
				10;
			this._setVisibleRowCount(iVisibleRowCount);
			this._enforcePreviewState(bShowPreview);
			this.refreshTableView();
		},

		refreshTableView: function(sApplicationObjectId) {
			this._enableRowSelectionEnabledButtons(false);
			this.getView()._oExportButton.setVisible(sap.ui.ino.views.common.TableExport.exportEnabled(this.getView()._oTable));
			this._bindTableRows(sApplicationObjectId);
		},

		onExport: function(oEvent) {
			var oMenuItem = oEvent.getParameter("item");
			var sFormat = oMenuItem.getCustomData()[0].getValue();
			var sPrefix = this._oCurrentTableView.sExportFilenamePrefix || this._mSettings.sExportFilenamePrefix;
			var sAuthor = sap.ui.ino.application.ApplicationBase.getApplication().getCurrentUserName();
			sap.ui.ino.views.common.TableExport.exportAdvanced(this.getView()._oTable, sFormat, sPrefix, this.getView()._oExportButton, sAuthor);
		},

		onShowPreview: function() {
			// this is called to enforce the state ALWAYS do not check _bShowPreview flag this will destroy storage of
			// table state
			this._bShowPreview = true;
			var oLayout = this.getView()._oMasterDetailLayout;
			// The details content is not added at the beginning. As a selection has to be happen to make it visible
			oLayout.removeStyleClass("sapUiInoBackofficeFullHeight");
			var oTable = this.getView()._oTable;
			oTable.setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Interactive);
			oTable.setVisibleRowCount(this._iVisibleRowCount);
			// show preview again as no selection event is raised
			var oSelectedRowContext = this.getSelectedRowContext();
			if (oSelectedRowContext) {
				this._showDetailsView(oSelectedRowContext);
			}
		},

		onHidePreview: function() {
			// this is called to enforce the state ALWAYS do not check _bShowPreview flag this will destroy storage of
			// table state
			this._bShowPreview = false;
			var oLayout = this.getView()._oMasterDetailLayout;
			this._hideDetailsView();
			oLayout.addStyleClass("sapUiInoBackofficeFullHeight");	
			var oTable = this.getView()._oTable;
			this._iVisibleRowCount = oTable.getVisibleRowCount(); // Visible row count is changeable by user
			oTable.setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Auto);
		},

		getSelectedRowObject: function() {
			return this.getSelectedRowContext().getObject();
		},

		getSelectedRowContext: function() {
			var oTable = this.getView().getTable();
			var iIndex = oTable.getSelectedIndex();
			if (iIndex < 0) {
				return null;
			}
			return oTable.getContextByIndex(iIndex);
		},

		getSelectedId: function() {
			var oBindingContext = this.getView().getSelectedRowContext();
			if (oBindingContext) {
				return oBindingContext.getObject().ID;
			}
			return undefined;
		},

		setSelectedId: function(iID) {
			var oView = this.getView();
			var aRows = oView._oTable.getRows();
			for (var i = 0; i < aRows.length; i++) {
				var oRowContext = oView._oTable.getContextByIndex(i);
				if (oRowContext) {
					var iRowID = oRowContext.getObject().ID;
					if (iRowID == iID) {
						oView.setSelectedRow(i);
						return true;
					}
				}
			}

			return false;
		},

		onSearch: function(oEvent) {
			var sSearchTerm = oEvent.getParameter("query").replace(/'/g, "''");
			this._mDynamicBindingPathParameters.searchTerm = sSearchTerm;
			this._bindTableRows();
		},

		setDynamicBindingPathParameter: function(sParameter, sValue) {
			this._mDynamicBindingPathParameters[sParameter] = sValue;
			this._bindTableRows();
		},

		clearSelection: function() {
			this.onSelectionChanged(null, -1, this.getView()._oTable);
		},

		onSelectionChanged: function(oSelectedRowContext, iSelectedIndex, oTable) {
			var that = this;
			that.getView().setBusy(true);
			var oSelectedObjectsResponse = this.getSelectedObjects();
			oSelectedObjectsResponse.done(function(aSelectedObjects) {
				that._aSelectedObjects = aSelectedObjects;
				// keep write model instance in sync with selection to adjust
				// action properties
				var oWriteModel = that.getWriteModel && that.getWriteModel();
				if (oWriteModel) {
					if (oSelectedRowContext && iSelectedIndex > -1) {
						oWriteModel.setBindingContext(oSelectedRowContext);
					} else {
						oWriteModel.setBindingContext(null);
						oTable.setSelectedIndex(-1);
						iSelectedIndex = -1;
					}
				}
				if (that.updateSelectObjectModel) {
					that.updateSelectObjectModel();
				}
				if (that.updatePropertyModel) {
					that.updatePropertyModel();
				}
				var aSelectedIndices = oTable.getSelectedIndices();
				if (aSelectedIndices && aSelectedIndices.length === 0) {
					that._enableRowSelectionEnabledButtons(false);
				} else if (aSelectedIndices && aSelectedIndices.length > 1) {
					that._enableRowSelectionEnabledButtons(true);
				} else if (aSelectedIndices && aSelectedIndices.length === 1) {
					that._enableRowSelectionEnabledButtons(aSelectedIndices[0] > -1);
				}
				that.getView().setBusy(false);
				// open/close details view
				if (!that._bShowPreview) {
					return;
				}
				if (iSelectedIndex > -1) {
					that._showDetailsView(oSelectedRowContext);
				} else {
					that._hideDetailsView();
				}
			});
		},

		isSelectionPositive: function() {
			var bSelectionPositive = true;
			var oTable = this.getView().getTable();
			var aSelectedRowIndices = oTable.getSelectedIndices();
			if (aSelectedRowIndices && aSelectedRowIndices.length > 1) {
				var oBinding = oTable.getBinding("rows");
				if (oBinding && oBinding.aKeys && oBinding.aKeys.length <= aSelectedRowIndices.length) {
					bSelectionPositive = false;
				} else {
					bSelectionPositive = this._bSelectionPositive;
				}
			}
			this._bSelectionPositive = bSelectionPositive;

			return bSelectionPositive;
		},

		getSelectedObjects: function() {
			var aSelectedObjects = [];
			var oDeferred = jQuery.Deferred();
			var oPromise = oDeferred.promise();
			var oTable = this.getView().getTable();
			var aSelectedRowIndices = oTable.getSelectedIndices();
			var that = this;
			if (aSelectedRowIndices && aSelectedRowIndices.length > 0) {
				var i = 0;
				while (i < aSelectedRowIndices.length && oTable.getContextByIndex(aSelectedRowIndices[i]) && oTable.getContextByIndex(
					aSelectedRowIndices[i]).getObject()) {
					aSelectedObjects.push(this.parseObject(oTable.getContextByIndex(aSelectedRowIndices[i]).getObject()));
					i++;
				}
				if (!this.isSelectionPositive()) {
					if (i < aSelectedRowIndices.length - 1) {

						var oTopIndexResponse = this.readCount();
						oTopIndexResponse.done(function(iTopIndex) {
							var sUrl = undefined;
							if (oTable.getBinding().getDownloadUrl) {
								sUrl = oTable.getBinding().getDownloadUrl();
							}
							var sParamSep = "&";
							if (iTopIndex > 0) {
								sUrl = sUrl + sParamSep + "$top=" + iTopIndex;
							}
							sUrl = sUrl + sParamSep + "$skip=" + aSelectedRowIndices[i] + sParamSep + "$select=" + that.getAttributes();
							oTable.getModel().read(sUrl, null, null, false, function(oData) {
								if (aSelectedRowIndices[aSelectedRowIndices.length - 1] < iTopIndex) {
									for (var j = i; j < aSelectedRowIndices.length; j++) {
										var oObject = oData.results[aSelectedRowIndices[j] - aSelectedRowIndices[i]];
										if (oObject) {
											aSelectedObjects.push(that.parseObject(oObject));
										}
									}
									for (var j = aSelectedRowIndices[aSelectedRowIndices.length - 1] + 1; j < iTopIndex; j++) {
										if (oData.results[j]) {
											aSelectedObjects.push(that.parseObject(oData.results[j]));
										}
									}
								} else {
									for (var j = i; aSelectedRowIndices[j] < iTopIndex; j++) {
										var oObject = oData.results[aSelectedRowIndices[j] - aSelectedRowIndices[i]];
										if (oObject) {
											aSelectedObjects.push(that.parseObject(oObject));
										}
									}
								}
								oDeferred.resolve(aSelectedObjects);
							});
						});
					} else {
						oDeferred.resolve(aSelectedObjects);
					}
				} else {
					oDeferred.resolve(aSelectedObjects);
				}
			} else {
				oDeferred.resolve(aSelectedObjects);
			}

			return oPromise;
		},

		parseObject: function(oObject) {
			var loadedObject = {};
			var aSelectAllRequiredAttributes = this._mSettings.aSelectAllRequiredAttributes;
			if (aSelectAllRequiredAttributes === undefined || aSelectAllRequiredAttributes.length === 0) {
				aSelectAllRequiredAttributes = ["ID"];
			}
			jQuery.each(aSelectAllRequiredAttributes, function(iIndex, sAttributeName) {
				loadedObject[sAttributeName] = oObject[sAttributeName];
			});

			return loadedObject;
		},

		getAttributes: function() {
			var sAttributes = "";
			var aRequiredAttributes = this._mSettings.aSelectAllRequiredAttributes;
			for (var iIndex = 0; iIndex < aRequiredAttributes.length; iIndex++) {
				sAttributes += aRequiredAttributes[iIndex];
				if (iIndex !== aRequiredAttributes.length - 1) {
					sAttributes += ",";
				}
			}

			return sAttributes;
		},

		readCount: function() {
			var sUrl = undefined;
			var oTable = this.getView().getTable();
			var oTableBinding = oTable.getBinding();

			if (oTableBinding.getDownloadUrl) {
				var aUrlComponents = oTableBinding.getDownloadUrl().split("?");
				sUrl = aUrlComponents[0] + "/$count?" + aUrlComponents[1];
			}

			return jQuery.ajax({
				url: sUrl,
				type: "GET",
				contentType: "application/json; charset=UTF-8"
			});
		},

		executeActionForSelectedRow: function(sActionName, fnSuccess, fnError, oTriggerButton) {
			this.executeActionForSelectedRowWithData(sActionName, null, fnSuccess, fnError, oTriggerButton);
		},

		executeActionForSelectedRowWithData: function(sActionName, oData, fnSuccess, fnError, oTriggerButton) {
			var oView = this.getView();
			var oTable = oView.getTable();
			var oWriteModel = this.getWriteModel();
			if (!oWriteModel) {
				jQuery.sap.log.error("Execute of action only works if write model is created in createWriteModel", undefined,
					"sap.ui.ino.views.common.MasterDetailController");
				return;
			}
			// Not all views are message-enabled
			if (oView.removeAllMessages) {
				oView.removeAllMessages("actionMessages");
			}
			sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("actionMessages");
			// hide it to avoid undesired fetching of (invalid) navigation attributes causing
			// 400 HTTP errors for calculation views
			this._hideDetailsView();
			this._enableStaticActionButtons(false);
			if (oTriggerButton) {
				oTriggerButton.setBusy(true);
			}
			var that = this;
			var fnActionParamSuccess = function() {
				that._enableStaticActionButtons(true);
				if (oTriggerButton) {
					oTriggerButton.setBusy(false);
				}
				if (fnSuccess) {
					fnSuccess();
				}
			};
			var fnActionParamError = function(oResponse) {
				that._enableStaticActionButtons(true);
				if (oTriggerButton) {
					oTriggerButton.setBusy(false);
				}
				var aActionMessages = sap.ui.ino.models.core.MessageSupport.convertBackendMessages(oResponse.MESSAGES, oView, "actionMessages");
				if (aActionMessages) {
					// Not all views are message-enabled
					if (oView.addMessages) {
						oView.addMessages(aActionMessages);
					}
					sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessages(aActionMessages);
				}
				if (fnError) {
					fnError(oResponse);
				}
			};
			// Remember properties for later restore after refresh
			var iSelectedIndex = oTable.getSelectedIndex();
			var iFirstVisibleRow = oTable.getFirstVisibleRow();
			var oTableListBinding = oTable.getBinding("rows");
			var fnRefreshCompleted = undefined;
			fnRefreshCompleted = function() {
				// Setting to -1 and back makes sure that a selection changed event is triggered
				oTable.setSelectedIndex(-1);
				oTable.setSelectedIndex(iSelectedIndex);
				oTable.setFirstVisibleRow(iFirstVisibleRow);
				oTableListBinding.detachDataReceived(fnRefreshCompleted);
			};
			oTableListBinding.attachDataReceived(fnRefreshCompleted);
			if (oData) {
				oWriteModel[sActionName](oData, fnActionParamSuccess, fnActionParamError);
			} else {
				oWriteModel[sActionName](fnActionParamSuccess, fnActionParamError);
			}
		},

		executeActionRequest: function(oActionRequest, oTriggerButton, bRefresh, bMassAction, bShowBusyIndicator) {
			var oView = this.getView();
			// Not all views are message-enabled
			if (oView.removeAllMessages) {
				oView.removeAllMessages("actionMessages");
			}
			sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages("actionMessages");
			this._enableStaticActionButtons(false);
			if (oTriggerButton) {
				oTriggerButton.setBusy(true);
			}
			var that = this;
			if (bMassAction) {
				sap.ui.ino.controls.BusyIndicator.show(0);
				oActionRequest.done(function() {
					that._enableStaticActionButtons(true);
					if (oTriggerButton) {
						oTriggerButton.setBusy(false);
					}
					sap.ui.ino.controls.BusyIndicator.hide();
				});

				oActionRequest.fail(function(oResponse) {
					that._enableStaticActionButtons(true);
					if (oTriggerButton) {
						oTriggerButton.setBusy(false);
					}
					var aActionMessages = sap.ui.ino.models.core.MessageSupport.convertBackendMessages(oResponse.MESSAGES, oView, "actionMessages");
					if (aActionMessages) {
						// Not all views are message-enabled
						if (oView.addMessages) {
							oView.addMessages(aActionMessages);
						}
						sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessages(aActionMessages);
					}
					sap.ui.ino.controls.BusyIndicator.hide();
				});
			} else {
				if (bShowBusyIndicator) {
					sap.ui.ino.controls.BusyIndicator.show(0);
				}
				oActionRequest.done(function() {
					if (bShowBusyIndicator) {
						sap.ui.ino.controls.BusyIndicator.hide();
					}
					that._enableStaticActionButtons(true);
					if (oTriggerButton) {
						oTriggerButton.setBusy(false);
					}
				});

				oActionRequest.fail(function(oResponse) {
					if (bShowBusyIndicator) {
						sap.ui.ino.controls.BusyIndicator.hide();
					}
					that._enableStaticActionButtons(true);
					if (oTriggerButton) {
						oTriggerButton.setBusy(false);
					}
					var aActionMessages = sap.ui.ino.models.core.MessageSupport.convertBackendMessages(oResponse.MESSAGES, oView, "actionMessages");
					if (aActionMessages) {
						// Not all views are message-enabled
						if (oView.addMessages) {
							oView.addMessages(aActionMessages);
						}
						sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessages(aActionMessages);
					}
				});
			}
		},

		revalidate: function(sEntityKey) {
			var oSelectedRowContext = this.getSelectedRowContext();
			// There is a / which needs to be removed
			if (!sEntityKey && oSelectedRowContext) {
				sEntityKey = oSelectedRowContext.getPath().substring(1);
			}

			var bSuccess = sap.ui.ino.models.core.InvalidationManager.validateEntity(sEntityKey);
			if (bSuccess) {
				// Make sure that the details view updates as well
				this._setDetailViewContext(oSelectedRowContext);
				if (this.updateSelectObjectModel) {
					this.updateSelectObjectModel();
				}
				if (this.updatePropertyModel) {
					this.updatePropertyModel();
					var aSelectedIndices = this.getView().getTable().getSelectedIndices();
					if (aSelectedIndices && aSelectedIndices.length > 1) {
						this._enableRowSelectionEnabledButtons(true);
					}
					this._enableStaticActionButtons(true);
				}
			}
		},

		showColumns: function(aVisibleColumnNames) {
			var aColumns = this.getView().getTable().getColumns();
			this._adjustControlVisibility(aColumns, aVisibleColumnNames);
			if (this.onAfterShowColumns) {
				this.onAfterShowColumns(this._sCurrentTableViewName, this._oCurrentTableView);
			}
		},

		showActionButtons: function(aVisibleActionButtonNames) {
			var aActionButtons = this.getView().getTable().getToolbar().getItems();
			this._adjustControlVisibility(aActionButtons, aVisibleActionButtonNames);
			if (this.onAfterShowButtons) {
				this.onAfterShowButtons(this._sCurrentTableViewName, this._oCurrentTableView);
			}
		},

		getCurrentTableViewName: function() {
			return this._sCurrentTableViewName;
		},

		getTextModel: function() {
			if (this.i18n == null) {
				this.i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
			}
			return this.i18n;
		},

		_enforcePreviewState: function(bShowPreview) {
			var oSegmentedButtons = this.getView()._oSegmentedButton;
			var iNumberOfButtons = oSegmentedButtons.getButtons().length;
			if (!bShowPreview) {
				oSegmentedButtons.setSelectedButton(oSegmentedButtons.getButtons()[iNumberOfButtons - 1]);
				this.onHidePreview();
			} else {
				oSegmentedButtons.setSelectedButton(oSegmentedButtons.getButtons()[iNumberOfButtons - 2]);
				this.onShowPreview();
			}
		},

		_setVisibleRowCount: function(iVisibleRowCount) {
			this._iVisibleRowCount = iVisibleRowCount;
			this.getView().getTable().setVisibleRowCount(iVisibleRowCount);
		},

		_enableStaticActionButtons: function(bEnabled) {
			// Static action buttons are buttons without an action property binding
			// For those enabling/disabling is in control of the user interface
			var oView = this.getView();
			if (!oView || oView.bIsDestroyed) {
				// View may be destroyed already!
				return;
			}
			var that = this;
			var bMultipleRowsSelected = that._areMultipleRowsSelected();
			var aMultiSelectionEnabledButtonNames = that._mSettings.aMultiSelectionEnabledButtons || [];
			if (bMultipleRowsSelected) {
				var aMultiSelectionEnabledButtonIds = jQuery.map(aMultiSelectionEnabledButtonNames, function(sButtonName) {
					return that.createId(sButtonName);
				});
			}

			var aActionButtons = this.oView.getTable().getToolbar().getItems();
			var aAlwaysEnabledButtonNames = that._mSettings.aAlwaysEnabledButtons || [];
			var aAlwaysEnabledButtonIds = jQuery.map(aAlwaysEnabledButtonNames, function(sButtonName) {
				return that.createId(sButtonName);
			});
			jQuery.each(aActionButtons, function(iIndex, oButton) {
				var oBinding = oButton.getBinding("enabled");
				if (jQuery.inArray(oButton.getId(), aAlwaysEnabledButtonIds) > -1) {
					oButton.setEnabled(true);
				} else {
					if (bMultipleRowsSelected) {
						if (oButton.getEnabled() && jQuery.inArray(oButton.getId(), aMultiSelectionEnabledButtonIds) > -1) {
							oButton.setEnabled(bEnabled);
						} else {
							oButton.setEnabled(false);
						}
					} else {
						if (!oBinding) {
							oButton.setEnabled(bEnabled);
						}
					}
				}
			});
		},

		_enableRowSelectionEnabledButtons: function(bEnabled) {
			// Buttons declared as row selection buttons are only active if a table
			// row has been selected and if there is no binding for action properties
			var aSelectionEnabledButtonNames = this._oCurrentTableView.aRowSelectionEnabledButtons || this._mSettings.aRowSelectionEnabledButtons;
			if (!aSelectionEnabledButtonNames) {
				return;
			}
			// map names to view specific runtime button IDs
			var that = this;
			var aRowSelectionEnabledButtonIds = jQuery.map(aSelectionEnabledButtonNames, function(sButtonName) {
				return that.createId(sButtonName);
			});
			if (this.getView().getTable().getToolbar()) {
				var aActionButtons = this.getView().getTable().getToolbar().getItems();
				var bMultipleRowsSelected = that._areMultipleRowsSelected();
				var aMultiSelectionEnabledButtonNames = that._mSettings.aMultiSelectionEnabledButtons || [];
				if (bMultipleRowsSelected) {
					var aMultiSelectionEnabledButtonIds = jQuery.map(aMultiSelectionEnabledButtonNames, function(sButtonName) {
						return that.createId(sButtonName);
					});
				}
				var aAlwaysEnabledButtonNames = that._mSettings.aAlwaysEnabledButtons || [];
				var aAlwaysEnabledButtonIds = jQuery.map(aAlwaysEnabledButtonNames, function(sButtonName) {
					return that.createId(sButtonName);
				});
				jQuery.each(aActionButtons, function(iIndex, oButton) {
					var oBinding = oButton.getBinding("enabled");
					if (jQuery.inArray(oButton.getId(), aAlwaysEnabledButtonIds) > -1) {
						oButton.setEnabled(true);
					} else {
						if (bMultipleRowsSelected) {
							if (oButton.getEnabled() && jQuery.inArray(oButton.getId(), aMultiSelectionEnabledButtonIds) > -1) {
								oButton.setEnabled(bEnabled);
							} else {
								oButton.setEnabled(false);
							}
						} else {
							if ((!oBinding || bEnabled === false) && jQuery.inArray(oButton.getId(), aRowSelectionEnabledButtonIds) > -1) {
								oButton.setEnabled(bEnabled);
							}
						}
					}
				});
			}
		},

		_areMultipleRowsSelected: function() {
			return (this.getView()._oTable.getSelectionMode() === sap.ui.table.SelectionMode.Multi) && (this.getView().getTable().getSelectedIndices()
				.length > 1);
		},

		_adjustControlVisibility: function(aControls, aVisibleControlNames) {
			// No buttons specified -> show all
			if (aVisibleControlNames === undefined || aVisibleControlNames === null) {
				jQuery.each(aControls, function(sIndex, oControl) {
					if (oControl.setVisible) {
						oControl.setVisible(true);
					}
				});
				return;
			}
			var that = this;
			// Names used in views are prefixed to make them globally unique. To compare
			// control ids with the given button names mapping to the view id has to be done
			// before
			var aVisibleControlIds = jQuery.map(aVisibleControlNames, function(sControlName) {
				return that.createId(sControlName);
			});
			jQuery.each(aControls, function(sIndex, oControl) {
				var bShowControl = (jQuery.inArray(oControl.getId(), aVisibleControlIds) > -1);
				if (typeof oControl.setVisible === "function") {
					oControl.setVisible(bShowControl);
				}
			});
		},

		_getColumnById: function(sId) {
			var aColumns = this.getView().getTable().getColumns();
			var sColumnId = this.createId(sId);
			var aColumnById = jQuery(aColumns).filter(function(iIndex) {
				var oColumn = aColumns[iIndex];
				return oColumn.getId() === sColumnId;
			});
			if (aColumnById.length > 0) {
				return aColumnById[0];
			}
			return null;
		},

		_hideDetailsView: function() {
			var oLayout = this.getView()._oMasterDetailLayout;
			var oDetailsView = this.getView()._oDetailsView;
			this._setDetailViewContext(null);
			if (oDetailsView && typeof oDetailsView.setVisible === "function") {
				oDetailsView.setVisible(false);
			}
		},

		_showDetailsView: function(oSelectedRowContext) {
			var oLayout = this.getView()._oMasterDetailLayout;
			var oDetailsView = this.getView()._oDetailsView;
			this._setDetailViewContext(oSelectedRowContext);
			if (oDetailsView && typeof oDetailsView.setVisible === "function") {
				oDetailsView.setVisible(true);
			}
		},

		_setDetailViewContext: function(oSelectedRowContext) {
			var oDetailsView = this.getView()._oDetailsView;
			if (!oDetailsView || oDetailsView.bIsDestroyed) {
				return;
			}
			if (oDetailsView.setRowContext) {
				oDetailsView.setRowContext(oSelectedRowContext);
			} else {
				oDetailsView.setBindingContext(oSelectedRowContext);
			}
		},

		_setCurrentTableView: function(sTableViewName) {
			var sViewName = sTableViewName;
			if (sTableViewName === DEFAULT_TABLE_VIEW || sTableViewName === undefined || sTableViewName === null) {
				jQuery.each(this._mSettings.mTableViews, function(sTableView, oValue) {
					if (oValue["default"]) {
						sViewName = sTableView;
					}
				});
			};
			this._sCurrentTableViewName = sViewName;
			this._oCurrentTableView = this._mSettings.mTableViews[sViewName];
			var oState = this._getStoredState();
			if (oState) {
				this._oCurrentTableView = jQuery.extend({}, this._oCurrentTableView, oState);
			}
		},

		_setTableTitle: function() {
			var sTitle = this._oCurrentTableView.sTitle || this._mSettings.sTitle;
			if (sTitle) {
				var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
				this.getView()._oTable.setTitle(i18n.getText(sTitle));
			}
		},

		_getBindingPath: function() {
			// This method is supposed to
			// replace all parameters indicated by { } in the binding path template
			// by their current values
			var sBindingPathTemplate = this._oCurrentTableView.sBindingPathTemplate || this._mSettings.sBindingPathTemplate;
			var sBindingPath = sBindingPathTemplate;
			// Combine dynamic binding path parameters with the static ones defined for a table view
			var mBindingPathParameters = jQuery.extend({}, this._mDynamicBindingPathParameters, this._oCurrentTableView.mBindingPathParameters);
			jQuery.each(mBindingPathParameters, function(sKey, sValue) {
				var sParameterName = "{" + sKey + "}";
				var sEncodedValue = jQuery.sap.encodeURL(sValue).replace(/'/g, "''");
				sBindingPath = sBindingPath.replace(sParameterName, sEncodedValue);
			});
			return sBindingPath;
		},

		_onTableSort: function(oEvent) {
			var oColumn = oEvent.getParameter("column");
			var sSortOrder = oEvent.getParameter("sortOrder");
			this._oUserSorter = new sap.ui.model.Sorter(oColumn.getSortProperty(), sSortOrder === sap.ui.table.SortOrder.Descending);
		},

		_bindTableRows: function(sApplicationObjectId) {
			var oTable = this.getView().getTable();
			// preserve existing filters which are lost
			// after a new binding
			var oBinding = oTable.getBinding("rows");
			var aFilters = oBinding ? oBinding.aFilters : [];
			var aBindingFilters = this._oCurrentTableView.aFilters || [];
			if (this._mSettings.aStaticFilters) {
				aBindingFilters = aBindingFilters.concat(this._mSettings.aStaticFilters);
			}
			var sBindingPath = this._getBindingPath();
			oTable.bindRows({
				path: sBindingPath,
				filters: aBindingFilters,
				sorter: this._oUserSorter || this._oCurrentTableView.oSorter,
				parameters: this._oCurrentTableView.mBindingParameters || this._mSettings.mBindingParameters,
				events: {
					dataReceived: function(oEvent) {}
				}
			});
			var that = this;
			var iSelectedIndex = this.getView().getSelectedRow();
			var iFirstVisibleRow = this.getView().getTable().getFirstVisibleRow();
			// Reset selection in order to avoid issues when the preview is open
			// and the calculation view re-read would lead to invalid odata reads for
			// dependent attributes
			oTable.setSelectedIndex(-1);
			// Existing filters need to be set explicitly. When setting them at "bindRows" they are considered
			// predefined filters which are always valid and are not changeable by table filtering etc.
			// get new binding
			oBinding = oTable.getBinding("rows");
			if (!oBinding) {
				jQuery.sap.log.error("Table binding not available after bind rows." + " Please if check if parent control is already set", null,
					"sap.ui.ino.views.common.MasterDetailController");
				return;
			} else {
				var fnComplete = null;
				fnComplete = function(oEvent) {
					oBinding.detachDataReceived(fnComplete);
					//wait till after the data was rendered
					setTimeout(function() {
						that.setDataLoading(false);
					}, 10);
				};
				oBinding.attachDataReceived(fnComplete);
				that.setDataLoading(true);
			}
			var oDeferred = new jQuery.Deferred();
			var oResponse = oDeferred.promise();
			oResponse.done(function(sImpactedApplicationObjectId) {
				if (sImpactedApplicationObjectId) {
					that.setSelectedId(sImpactedApplicationObjectId);
				} else {
					that.clearSelection();
				}
			});

			oBinding.attachDataReceived(function(oEvent) {
				if (oEvent.getParameter("data")) {
					oDeferred.resolve(sApplicationObjectId);
				}
			});

			if (aFilters && aFilters.length > 0) {
				// this will cause an additional roundtrip which eventually cancels
				// the request triggered by bindRows thus we only do it when necessary
				oBinding.filter(aFilters, sap.ui.model.FilterType.Control);
			}
		},

		_getStoredState: function() {
			var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			var vKey = this._getStateKey();
			var sState = oStorage.get(vKey);
			if (!sState) {
				return;
			}
			try {
				return JSON.parse(sState);
			} catch (e) {
				jQuery.sap.log.debug("JSON string " + sState + "could not be parsed", undefined, "MasterDetailController");
				return;
			}
		},

		_storeState: function() {
			var oState = {
				showPreview: this._bShowPreview,
				visibleRowCount: this.getView().getTable().getVisibleRowCount()
			};
			var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			var vKey = this._getStateKey();
			var bOK = oStorage.put(vKey, JSON.stringify(oState));
			if (!bOK) {
				jQuery.sap.log.debug("State could not be stored in local storage for key " + vKey, undefined, "MasterDetailController");
			}
		},

		_getStateKey: function() {
			return this.getMetadata().getName() + "-" + this._sCurrentTableViewName;
		}
	};
})();