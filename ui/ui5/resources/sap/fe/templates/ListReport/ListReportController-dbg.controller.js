/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

/* global hasher */
sap.ui.define(
	[
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/fe/controllerextensions/Transaction",
		"sap/fe/controllerextensions/Routing",
		"sap/fe/controllerextensions/EditFlow",
		"sap/fe/macros/field/FieldRuntime",
		"sap/fe/actions/messageHandling",
		"sap/ui/mdc/base/ConditionModel",
		"sap/base/Log",
		"sap/base/util/ObjectPath"
		//"sap/fe/controllerextensions/AppState" The AppState is currently deactivated
	],
	function(Controller, JSONModel, Transaction, Routing, EditFlow, FieldRuntime, messageHandling, ConditionModel, Log, ObjectPath) {
		"use strict";

		/*
	 This coding is deactivated as the FLP does not yet support dynamic tiles for OData v4 - activate once
	 the FLP supports OData v4 as well
	 This coding needs to be adapted to the refactoring then for example ListBindingInfo shall be used
	 instead of the ListBinding

	 function fnCreateRequestUrl(oBinding, sPath, oContext, aUrlParams, bBatch){
	 // create the url for the service
	 var sNormalizedPath,
	 aAllUrlParameters = [],
	 sUrl = "";

	 if (sPath && sPath.indexOf('?') !== -1 ) {
	 sPath = sPath.substr(0, sPath.indexOf('?'));
	 }

	 if (!oContext && !jQuery.sap.startsWith(sPath,"/")) {
	 jQuery.sap.log.fatal(oBinding + " path " + sPath + " must be absolute if no Context is set");
	 }

	 sNormalizedPath = oBinding.getModel().resolve(sPath, oContext);

	 //An extra / is present at the end of the sServiceUrl, taking the normalized url from index 1
	 if (!bBatch) {
	 sUrl = oBinding.getModel().sServiceUrl + sNormalizedPath.substr(1);
	 } else {
	 sUrl = sNormalizedPath.substr(sNormalizedPath.indexOf('/') + 1);
	 }

	 if (aUrlParams) {
	 aAllUrlParameters = aAllUrlParameters.concat(aUrlParams);
	 }

	 if (aAllUrlParameters && aAllUrlParameters.length > 0) {
	 sUrl += "?" + aAllUrlParameters.join("&");
	 }
	 return sUrl;
	 }

	 function fnGetDownloadUrl(oBinding) {
	 var aParams = [];

	 if (oBinding.sFilterParams) {
	 aParams.push(oBinding.sFilterParams);
	 }

	 if (oBinding.sCustomParams) {
	 aParams.push(oBinding.sCustomParams);
	 }

	 if (oBinding.mParameters) {
	 if (oBinding.mParameters.$count) {
	 aParams.push("$count="+oBinding.mParameters.$count);
	 }

	 if (oBinding.mParameters.$filter) {
	 aParams.push("$filter=("+oBinding.mParameters.$filter.replace(/'/g,"%27").replace(/ /g,"%20")+")");
	 }

	 if (oBinding.mParameters.$select) {
	 aParams.push("$select="+oBinding.mParameters.$select.replace(/'/g,"%27").replace(/,/g,"%2c"));
	 }

	 // we can skip the $expand for now as the count shall be the same to avoid unnecessary read requests in the backend
	 // if (oBinding.mParameters.$expand) {
	 // 	aParams.push("$expand="+oBinding.mParameters.$expand.replace(/'/g,"%27").replace(/\//g,"%2f"));
	 // }

	 // we set $top to 0 to avoid that any data is requested - we are only interested in the count
	 aParams.push("$top=0");
	 }

	 var sPath = oBinding.getModel().resolve(oBinding.sPath,oBinding.oContext);

	 if (sPath) {
	 return fnCreateRequestUrl(oBinding,sPath, null, aParams);
	 }
	 }*/

		return Controller.extend("sap.fe.templates.ListReport.ListReportController", {
			transaction: Transaction,
			routing: Routing,
			editFlow: EditFlow,
			//appState : AppState, The AppState is currently deactivated

			// TODO: get rid of this
			// it's currently needed to show the transient messages after the table request fails
			// we assume that the table should show those messages in the future
			messageHandling: messageHandling,

			onInit: function() {
				// set filter bar to disabled until app state is loaded
				// TODO: there seems to be a big in the filter layout - to be checked
				//this.oFilterBar.setEnabled(false);

				// disable for now - TODO: enable with actions again
				//this.setShareModel();

				// Set internal UI model and model from transaction controller
				this.getView().setModel(new JSONModel(), "sap.fe.templates.ListReport");
				this.getView().setModel(this.editFlow.getUIStateModel(), "ui");
				this.getView().setModel(new JSONModel(), "localUI");

				// request a new appState Model for the view
				/*
			 // The AppState is currently deactivated
			this.appState.requestAppStateModel(this.getView().getId()).then(function(oAppStateModel){
				that.getView().setModel(oAppStateModel, "sap.fe.appState");

				// This is only a workaround as the controls do not yet support binding the appState
				var oAppState = oAppStateModel.getData();
				if (oAppState && oAppState.filterBar) {
					// an app state exists, apply it
					that.applyAppStateToFilterBar().then(function () {
						// enable filterbar once the app state is applied
						that.oFilterBar.setEnabled(true);
					});
				} else {
					that.oFilterBar.setEnabled(true);
				}

				// attach to further app state changed
				//oAppStateModel.bindList("/").attachChange(that.applyAppStateToFilterBar.bind(that));
			});
			*/
			},
			onAfterBinding: function(oBindingContext) {
				var that = this,
					bShouldRefresh,
					oView = this.getView(),
					oModel = oView.getModel(),
					oFilterBar = this.byId("fe::fb::" + this.getView().getViewData().entitySetName),
					sListReportTableId = oFilterBar.data("listBindingNames");

				oModel.getBindingForReference(sListReportTableId).then(function(oListBinding) {
					bShouldRefresh = that.routing.getDirtyState();
					if (Object.keys(bShouldRefresh).length > 0) {
						oListBinding.refresh();
						that.routing.resetDirtyState();
					}
				});
			},
			// This is only a workaround as the filterBar does not yet support binding the appState
			/*
		 // The AppState is currently deactivated
		createAppStateFromFilterBar: function () {
			var sFilterBarAppState = this.oFilterBar.getAppState();

			if (!sFilterBarAppState) {
				// no app state exists and filter bar does not have any app state relevant changes, there is
				// no need to generate an app state
				return;
			}

			var oAppState = {
				filterBar: sFilterBarAppState
			};

			this.getView().getModel("sap.fe.appState").setData(oAppState);
		},

		// This is only a workaround as the filterBar does not yet support binding the appState
		applyAppStateToFilterBar: function () {
			var	oAppState = this.getView().getModel("sap.fe.appState").getData();

			if (oAppState && oAppState.filterBar) {
				return this.oFilterBar.setAppState(oAppState.filterBar);
			}
		},
		*/

			setShareModel: function() {
				// TODO: deactivated for now - currently there is no _templPriv anymore, to be discussed
				// this method is currently not called anymore from the init method

				var fnGetUser = ObjectPath.get("sap.ushell.Container.getUser");
				//var oManifest = this.getOwnerComponent().getAppComponent().getMetadata().getManifestEntry("sap.ui");
				//var sBookmarkIcon = (oManifest && oManifest.icons && oManifest.icons.icon) || "";

				//shareModel: Holds all the sharing relevant information and info used in XML view
				var oShareInfo = {
					bookmarkTitle: document.title, //To name the bookmark according to the app title.
					bookmarkCustomUrl: function() {
						var sHash = hasher.getHash();
						return sHash ? "#" + sHash : window.location.href;
					},
					/*
				 To be activated once the FLP shows the count - see comment above
				 bookmarkServiceUrl: function() {
				 //var oTable = oTable.getInnerTable(); oTable is already the sap.fe table (but not the inner one)
				 // we should use table.getListBindingInfo instead of the binding
				 var oBinding = oTable.getBinding("rows") || oTable.getBinding("items");
				 return oBinding ? fnGetDownloadUrl(oBinding) : "";
				 },*/
					isShareInJamActive: !!fnGetUser && fnGetUser().isJamActive()
				};

				var oTemplatePrivateModel = this.getOwnerComponent().getModel("_templPriv");
				oTemplatePrivateModel.setProperty("/listReport/share", oShareInfo);
			},

			handlers: {
				onShareListReportActionButtonPress: function(oEvent) {
					var localI18nRef = this.getView()
						.getModel("sap.fe.i18n")
						.getResourceBundle();
					if (!this._oShareActionButton) {
						this._oShareActionButton = sap.ui.xmlfragment("sap.fe.templates.ListReport.ShareSheet", {
							shareEmailPressed: function() {
								sap.m.URLHelper.triggerEmail(
									null,
									localI18nRef.getText("SAPFE_EMAIL_SUBJECT", [document.title]),
									document.URL
								);
							},
							//TODO: JAM integration to be implemented
							shareJamPressed: function() {}
						});
						this.getView().addDependent(this._oShareActionButton);
					}
					this._oShareActionButton.openBy(oEvent.getSource());
				},
				onSearch: function(oEvent, sListBindingName, mConditions) {
					var oModel = this.getView().getModel(),
						mConditions = mConditions || oEvent.getParameter("conditions"),
						sListBindingName = sListBindingName || oEvent.getSource().data("listBindingNames"),
						oConditionModel;

					if (oModel === undefined) {
						this.getView().attachEventOnce(
							"modelContextChange",
							this.handlers.onSearch.bind(this, oEvent, sListBindingName, mConditions)
						);
					} else {
						oModel.getBindingForReference(sListBindingName).then(function(oListBinding) {
							oConditionModel = ConditionModel.getFor(oListBinding);
							oConditionModel.removeAllConditions();
							oConditionModel.setConditions(mConditions);
							if (oListBinding.isSuspended()) {
								oListBinding.resume();
							}
							oConditionModel.applyFilters(oListBinding, true);
						});
					}
				},
				onFieldValueChange: function(oEvent) {
					this.editFlow.syncTask(oEvent.getParameter("promise"));
					FieldRuntime.handleChange(oEvent);
				}
			}
		});
	}
);
