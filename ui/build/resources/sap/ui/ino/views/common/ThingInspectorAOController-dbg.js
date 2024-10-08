/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.views.common.ThingInspectorAOController");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.controls.MessageBox");
jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");
jQuery.sap.require("sap.ui.ino.application.Configuration");


(function() {

	var MessageParam = {
		Group: "group",
		SuccessKey: "success",
		Save: "save",
		Delete: "del",
		Title: "title",
		Dialog: "dialog",
		NoBusy: "noBusy"
	};

	sap.ui.ino.views.common.ThingInspectorAOController = {

		onInit: function() {
			sap.ui.ino.application.backoffice.Application.getInstance().setActiveOverlay(this.getView());

			jQuery(document).on("keyup", jQuery.proxy(this.handlekeyup, this));
			jQuery(document).on("click", jQuery.proxy(this.handleclick, this));

			this.isOdataModelBound = false;
		},

		onExit: function() {
			sap.ui.ino.application.backoffice.Application.getInstance().clearActiveOverlay();

			jQuery(document).off("keyup", jQuery.proxy(this.handlekeyup));
			jQuery(document).off("click", jQuery.proxy(this.handleclick, this));
		},

		handleclick: function(oEvent) {
			var oActiveFacet = this.getActiveFacet();
			if (oActiveFacet.onclick && typeof oActiveFacet.onclick === "function") {
				oActiveFacet.onclick(oEvent);
			}
		},

		handlekeyup: function(oEvent) {
			var oActiveFacet = this.getActiveFacet();
			if (oActiveFacet.onkeyup && typeof oActiveFacet.onkeyup === "function") {
				oActiveFacet.onkeyup(oEvent);
			}
		},

		isNew: function() {
			if (this.getModel()) {
				return this.getModel().isNew();
			}
			return false;
		},

		hasPendingChanges: function() {
			if (this.getModel()) {
				return this.getModel().hasPendingChanges();
			} else {
				var activeFacet = this.getActiveFacet();
				if (activeFacet !== null) {
					return activeFacet.hasPendingChanges();
				}
				return false;
			}
		},

		actionSelected: function(oEvent) {
			var oAction = oEvent.getParameter("action");
			oAction.fireSelect({
				id: oAction.getId(),
				action: oAction
			});

			// keep the focus in the action bar
			var oTI = this.oView.getInspector();
			if (oTI && oTI._oThingViewer) {
				var oActionBar = oTI.getActionBar();

				if (oActionBar) {
					var aActionButtons = oActionBar.getAggregation("_businessActionButtons");
					if (aActionButtons && aActionButtons.length > 0) {
						var $Focus = jQuery(":focus");
						if ($Focus && $Focus.context && $Focus.context.activeElement && $Focus.context.activeElement.id && $Focus.context.activeElement.id.indexOf(
							'--TI-actionBar-') < 0) {
							var c = 0;
							while (!aActionButtons[c].getEnabled() && c < aActionButtons.length) {
								c++;
							}
							if (c < aActionButtons.length) {
								aActionButtons[c].focus();
							}
						}
					}
				}
			}
		},

		selectFacet: function(sFacetKey) {
			var oTI = this.oView.getInspector();
			var facets = oTI.getFacets();
			jQuery.each(facets, function(iIndex, oFacet) {
				if (oFacet.getKey() == sFacetKey) {
					oTI.setSelectedFacet(oFacet);
					return;
				}
			});
			// simulate facetSelected Event
			this.facetSelected.call(oTI, null, sFacetKey);
		},

		/**
		 * scope: this = ThingInspector
		 */
		facetSelected: function(oEvent, sFacetKey) {
			var oController = this.oView.getController();
			var oTI = this;
			var activeFacet = oController.getActiveFacet();
			var newFacetKey = sFacetKey ? sFacetKey : oEvent.getParameter("key");
			var oNewFacet = oController.getFacet(newFacetKey);
			if (activeFacet != null) {
				activeFacet._onHide();
			}

			//determine navigation back to the old facet if new Facet cannot be displayed
			var oldFacetNav = null;
			for (var i = 0; i < oTI.getFacets().length; i++) {
				var nav = oTI.getFacets()[i];
				if (nav.getKey() == oController.selectedFacet) {
					oldFacetNav = nav;
				}
			}

			if (oController.selectedFacet == null || oController.selectedFacet === newFacetKey) {
				oController.facetSelectedCallback(oEvent);
			} else if (oController.getMode() !== 'display' && activeFacet != null && activeFacet.hasPendingChanges()) {
				//active facet has its own data state and data needs to be saved to avoid data loss
				if (!oController.getModel() || !oController.getModel().hasPendingChanges()) {
					//display data loss popup
					var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
					oApp.isNavigationAllowed(function() {
						activeFacet.cancelChanges();
						activeFacet.getController().setMode("display");
						oController.facetSelectedCallback(newFacetKey);
					}, function() {
						//switch back
						oTI.setSelectedFacet(oldFacetNav);
					});
				}
			} else if (oController.getMode() !== 'display' && activeFacet != null && oNewFacet.needsSavedData() && (oController.hasPendingChanges() || oController.isNew())) {
				//new Facet needs saved data and data is not saved so far -> Save Popup
				function saveDataForFacetSwitch(bConfirmed) {
					if (bConfirmed) {
						var oPromise = oController.onSave();
						oPromise.done(function(oResponse) {
							oController.facetSelectedCallback(newFacetKey);
						});
						oPromise.fail(function(oResponse) {
							//switch back
							oTI.setSelectedFacet(oldFacetNav);
						});
					} else {
						//switch back
						oTI.setSelectedFacet(oldFacetNav);
					}
				};
				var oBundle = oController.getTextModel();
				sap.ui.ino.controls.MessageBox.confirm(oBundle.getText("BO_TI_INS_SAVE"), saveDataForFacetSwitch,
					oBundle.getText("BO_COMMON_SAVE_TIT"));
			} else {
				oController.facetSelectedCallback(newFacetKey);
			}
			if (oController.isInEditMode()) {
				this.oView.resetBindingLookup();
				this.oView.revalidateMessages();
			}
		},

		facetSelectedCallback: function(oEvent) {
			var oView = this.getView();
			var oTI = oView.getInspector();
			var sKey;
			if (typeof oEvent == "string") {
				sKey = oEvent;
			} else {
				sKey = oEvent.getParameter("key");
			}
			this.selectedFacet = sKey;
			oTI.removeAllFacetContent();

			var oFacet = this.getFacet(sKey);
			var oContent = oFacet._createFacetContent(oFacet.getController());
			if (oContent) {
				for (var i = 0; i < oContent.length; i++) {
					oTI.addFacetContent(oContent[i]);
				}
			}
			oFacet._onShow();
			this.initActions();
			this.clearFacetMessages(undefined, sap.ui.core.MessageType.Success);
		},

		initActions: function() {
			var oView = this.getView();
			var aActions = oView.aActions[this.getMode()];
			var oTI = oView.getInspector();
			oTI.removeAllActions();

			for (var i = 0; i < aActions.length; i++) {
				oTI.addAction(aActions[i]);
			}
		},

		initFacets: function() {
			var oView = this.getView();
			var sKey = this.selectedFacet;
			var oTI = oView.getInspector();
			oTI.destroyFacetContent();

			if (!sKey) {
				return;
			}
			var oFacet = this.getFacet(sKey);
			var oContent = oFacet._createFacetContent(oFacet.getController());
			if (oContent) {
				for (var i = 0; i < oContent.length; i++) {
					oTI.addFacetContent(oContent[i]);
				}
			}
		},

		getFacet: function(sKey) {
			var oView = this.getView();
			var oFacet = oView.oFacets[sKey];
			if (!oFacet) {
				oFacet = sap.ui.jsview(oView.createId(sKey), sKey);
				oView.oFacets[sKey] = oFacet;
				oFacet.initWithMode(this.getMode());
				oFacet.getController().setThingInspectorController(this);
			}
			return oFacet;
		},

		getActiveFacet: function() {
			if (this.selectedFacet) {
				return this.oView.oFacets[this.selectedFacet];
			}
			return null;
		},

		// Event Handler for close button on the upper right corner
		close: function(oEvent) {
			if (oEvent) {
				oEvent.preventDefault();
			}
			var oView = this.oView;
			var oController = oView.getController();
			if (oController) {
				oController.closeFunction(oView);
			}
		},

		closeFunction: function(oView) {
			var oApp = sap.ui.ino.application.ApplicationBase.getApplication();
			oApp.isNavigationAllowed(function() {
				oView.close();
			});
		},

		openNew: function(oEvent) {
			var oView = this.getView();
			sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow(oView.sType.toLowerCase(), {
				id: this.getModelKey(),
				mode: "display"
			});
		},

		onEnterEditMode: function() {
			// Users can override to subscribe
		},

		onExitEditMode: function() {
			// Users can override to subscribe
		},

		initModel: function(iId) {
			// We need the model in any case for the header content on the side
			var bModelwasInitial = (!this.oModel);
			this.isOdataModelBound = false;
			this.iId = iId || this.getModelKey();
			this.createModel(this.iId);
			this.bindODataModel(this.iId);
			this.bindInstance(bModelwasInitial);
		},

		getModel: function() {
			if (!this.oModel) {
				this.createModel(this.iId);
			}
			return this.oModel;
		},

		getModelKey: function() {
			var iId = this.oModel && this.oModel.getKey();
			return iId || this.iId;
		},

		createModel: function(iId) {
			if (!this.oModel) {
				jQuery.sap.log
					.warning(
						"createModel() is not implemented in the generic ThingInspector " +
						"since the Write Model is specific to the entity being written. Please override this method in your implementation",
						undefined, "sap.ui.ino.views.common.ThingInspectorAOController");
				this.oModel = null; // redefine that
			}
			return this.oModel;
		},

		getODataPath: function() {
			//can be redefined if OData Model is needed;
			return null;
		},

		bindODataModel: function(iId) {
			var sPath = this.getODataPath();
			if (!this.isOdataModelBound && sPath && iId > 0) {
				this.getView().bindElement(sPath + "(" + iId + ")");
				this.isOdataModelBound = true;
			}
		},

		setMode: function(sMode) {
			if (sMode == null || sMode == "") {
				sMode = "display";
			}
			if (sMode == "display" || sMode == "edit") {
				if (this.sMode !== sMode) {

					if (sMode == "edit") {
						this.getView().resetBindingLookup();
					}

					// get Controller of Facets (if it exists)
					var oView = this.getView();
					var oFacet = oView.oFacets[this.selectedFacet];
					var oFacetController = null;
					if (oFacet != null) {
						oFacetController = oFacet.getController();
					}

					if (this.sMode == "edit") {
						// switch from edit to display
						this.onExitEditMode();
						if (oFacetController != null) {
							oFacetController.onExitEditMode();
						}
					} else {
						// switch from display to edit
						this.onEnterEditMode();
						if (oFacetController != null) {
							oFacetController.onEnterEditMode();
						}
					}
					this.sMode = sMode;
					this.triggerModeSwitch();
				}
			} else {
				jQuery.sap.log.warning(
					"SetMode was called on a ThingInspector with an invalid mode argument: " + sMode, undefined,
					"sap.ui.ino.views.common.ThingInspectorAOController");
			}
		},

		revalidate: function() {
			this.bindInstance(false);
		},

		bindInstance: function(bInit) {
			var oTI = this.getView().getInspector();
			if (oTI) {
				oTI.setModel(this.getModel(), this.sModelName);
			}
		},

		triggerModeSwitch: function() {
			var oView = this.getView();
			var oTI = oView.getInspector();
			if (oTI) {
				for (var key in oView.oFacets) {
					if (oView.oFacets.hasOwnProperty(key)) {
						oView.oFacets[key].getController().setMode(this.getMode());
					}
				}
				this.initActions();
				//initialize facets/destroy all content
				this.initFacets();
				for (var key in oView.oFacets) {
					if (oView.oFacets.hasOwnProperty(key)) {
						oView.oFacets[key].getController().onAfterModeSwitch(this.getMode());
					}
				}
				//facet was initialized, make sure the onShow is triggered again
				var sKey = this.selectedFacet;
				var oFacet = this.getFacet(sKey);
				oFacet._onShow();
			}
		},

		reloadActiveFacet: function() {
			var oView = this.getView();
			var oTI = oView.getInspector();
			oTI.destroyFacetContent();

			var oFacet = this.getActiveFacet();
			var oContent = oFacet._createFacetContent(oFacet.getController());
			if (oContent) {
				for (var i = 0; i < oContent.length; i++) {
					oTI.addFacetContent(oContent[i]);
				}
			}
			this.initActions();
			// oFacet.initSupportView();
			if (oFacet.initSupportView) {
				oFacet.initSupportView();
			}
		},

		getMode: function() {
			return this.sMode;
		},

		isInMode: function(sMode) {
			return (this.sMode === sMode);
		},

		isInEditMode: function() {
			return this.isInMode("edit");
		},

		setEditMode: function(bEdit) {
			if (bEdit) {
				this.setMode("edit");
			} else {
				this.setMode("display");
			}
		},

		sTextModelPrefix: "i18n>",
		sCodeModelPrefix: "code>",

		sModelPrefix: "applicationObject>",
		sModelName: "applicationObject",

		getTextModelPrefix: function() {
			return this.sTextModelPrefix;
		},

		getCodeModelPrefix: function() {
			return this.sCodeModelPrefix;
		},

		getTextModel: function() {
			if (!this.i18n) {
				this.i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
			}
			return this.i18n;
		},

		getTextModelLanguageKey: function() {
			if (!this._sLanguageKey) {
				var sLanguageKey = this.getTextModel().sLocale;
				sLanguageKey = sLanguageKey.replace("_", "-");
				var iIdx = sLanguageKey.indexOf("-");
				if (iIdx != -1) {
					sLanguageKey = sLanguageKey.substring(0, iIdx);
				}
				this._sLanguageKey = sLanguageKey;
			}

			return this._sLanguageKey;
		},

		getModelPrefix: function() {
			return this.sModelPrefix;
		},

		getModelName: function() {
			return this.sModelName;
		},

		getBoundPath: function(oBinding, absolute) {
			if (typeof oBinding == "object") {
				return oBinding;
			}
			if (absolute) {
				return "{" + this.getModelPrefix() + "/" + oBinding + "}";
			} else {
				return "{" + this.getModelPrefix() + oBinding + "}";
			}
		},
		setModelOfAuthorizationForStatus: function(oModel) {
			return this.oView.getInspector().setModel(oModel, "oStatusAuthSettingCode");
		},
		getBoundObject: function(oBinding, absolute, oType) {
			if (typeof oBinding == "object") {
				return oBinding;
			}
			if (oType) {
				if (absolute) {
					return {
						path: this.getModelPrefix() + "/" + oBinding,
						type: oType
					};
				} else {
					return {
						path: this.getModelPrefix() + oBinding,
						type: oType
					};
				}
			} else {
				if (absolute) {
					return {
						path: this.getModelPrefix() + "/" + oBinding
					};
				} else {
					return {
						path: this.getModelPrefix() + oBinding
					};
				}
			}
		},

		getFormatterPath: function(oBinding, absolute) {
			if (typeof oBinding == "object") {
				return oBinding;
			}
			if (absolute) {
				return this.getModelPrefix() + "/" + oBinding;
			} else {
				return this.getModelPrefix() + oBinding;
			}
		},

		getTextPath: function(oBinding) {
			if (typeof oBinding == "object") {
				return oBinding;
			}
			return "{" + this.getTextModelPrefix() + oBinding + "}";
		},

		// handler for the close button (standard button)
		onClose: function() {
			this.closeFunction(this.oView);
		},

		onCancel: function() {
			var oModel = this.getModel();
			var that = this;
			var oApp = sap.ui.ino.application.ApplicationBase.getApplication();
			if (!oModel.isNew()) {
				oApp.isNavigationAllowed(function() {
					oModel.revertChanges();
					that.setEditMode(false);
					that.clearFacetMessages();
					sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages();

					that.getModel().getDataInitializedPromise().done(function() {
						var aDisplayActions = that.getView().aActions["display"];
						if (aDisplayActions && aDisplayActions.length > 0) {
							setTimeout(function() {
								var aButton = aDisplayActions[0].getParent().getAggregation("_businessActionButtons");
								if (aButton && aButton.length > 0) {
									aButton[0].focus();
								}
							}, 0);
						}
					});
				});
			} else {
				// close handles navigation allowed
				that.closeFunction(that.oView);
			}
		},

		onEdit: function() {
			var oView = this.getView();

			this.setEditMode(true);
			this.bindInstance();

			this.getModel().getDataInitializedPromise().done(function() {
				var aEditActions = oView.aActions["edit"];
				if (aEditActions && aEditActions.length > 0) {
					setTimeout(function() {
						var aButton = aEditActions[0].getParent().getAggregation("_businessActionButtons");
						if (aButton && aButton.length > 0) {
							aButton[0].focus();
						}
					}, 0);
				}
			});
		},

		onChange: function() {
			if (typeof this._fnChangeCallback === "function") {
				this._fnChangeCallback();
			}
		},

		onToggleClipboard: function() {
			var oModel = this.getModel();
			var vKey = this.getModelKey();
			sap.ui.ino.models.core.ClipboardModel.sharedInstance().toggle(oModel, vKey);
		},

		onDelete: function() {
			return this.onModelAction(this.getModel().del, MessageParam.Delete, true, true);
		},

		onSave: function() {
			return this.onModelAction(this.getModel().modify, MessageParam.Save, true, false);
		},
    
        getStatusModelData: function(statusModelData,statusDefaultData){
		    var statusCodeArray = statusModelData.getProperty("/AuthorizationForStatus");
		    var statusType = statusDefaultData.getProperty("/STATUS_TYPE");
		    var statusRes = {};
		    statusRes.ID = statusModelData.getProperty("/ID");
		    statusRes.ID_OF_STATUS_STAGE = statusDefaultData.getProperty("/ID");
		    
		    statusRes.VALUE = statusModelData.getProperty("/STATUSTYPECHECK");
		    statusRes.SETTING_CODE = "OPEN_STATUS_AUTHORIZATION";
		    statusRes.AuthorizationForStatus = [];
		    for(var i = 0; i < statusCodeArray.length; i++ ){
		        if(statusType === statusCodeArray[i].STATUS_TYPE){
		            var AuthForStatusList = {
		                ACTION_CODE: statusCodeArray[i].ACTION_CODE,
		                ROLE_CODE: statusCodeArray[i].ROLE_CODE,
		                CAN_DO_ACTION: Number(statusCodeArray[i].CHECK)
		            };
		            statusRes.AuthorizationForStatus.push(AuthForStatusList);
		            switch(statusCodeArray[i].ROLE_CODE){
		                case "IDEA_SUBMITTER":
		            	    statusRes.AuthorizationForStatus.push({
		            		ACTION_CODE: statusCodeArray[i].ACTION_CODE,
		                    ROLE_CODE: "IDEA_CONTRIBUTOR",
		                    CAN_DO_ACTION: Number(statusCodeArray[i].CHECK)
		            	    });
		            	    break;
		            	case "CAMPAIGN_EXPERT":
		            	    statusRes.AuthorizationForStatus.push({
		            		ACTION_CODE: statusCodeArray[i].ACTION_CODE,
		                    ROLE_CODE: "IDEA_EXPERT",
		                    CAN_DO_ACTION: Number(statusCodeArray[i].CHECK)
		            	    });
		            	    statusRes.AuthorizationForStatus.push({
		            		ACTION_CODE: statusCodeArray[i].ACTION_CODE,
		                    ROLE_CODE: "RESP_EXPERT",
		                    CAN_DO_ACTION: Number(statusCodeArray[i].CHECK)
		            	    });
		            	    break;
		            	case "CAMPAIGN_COACH":
		            	    statusRes.AuthorizationForStatus.push({
		            		ACTION_CODE: statusCodeArray[i].ACTION_CODE,
		                    ROLE_CODE: "IDEA_COACH",
		                    CAN_DO_ACTION: Number(statusCodeArray[i].CHECK)
		            	    });
		            	    statusRes.AuthorizationForStatus.push({
		            		ACTION_CODE: statusCodeArray[i].ACTION_CODE,
		                    ROLE_CODE: "RESP_COACH",
		                    CAN_DO_ACTION: Number(statusCodeArray[i].CHECK)
		            	    });
		            	    break;
		            }
		        }
		    }
		    return statusRes;
        },

		onStatusNameSave: function(oEvent) {
		    var that = this;
		    var statusModelData = oEvent.getSource().getModel("oStatusAuthSettingCode");
		    var statusDefaultData = oEvent.getSource().getModel("applicationObject");
		    var backendServiceUrl;
			return this.onModelAction(this.getModel().modify, MessageParam.Save, true, false).done(function(res) {
			    var statusRes = that.getStatusModelData(statusModelData,statusDefaultData);
			    var PostOrPut;
			    if(res.GENERATED_IDS !== undefined){
			        statusRes.ID_OF_STATUS_STAGE = res.GENERATED_IDS[-1] ? res.GENERATED_IDS[-1] : statusRes.ID_OF_STATUS_STAGE;
			    }
			     if(statusRes.ID === -1){
			        PostOrPut = "POST";
			        backendServiceUrl = "/authorization_for_status.xsjs";
			    }else{
			    	 PostOrPut = "PUT";
			        backendServiceUrl = "/authorization_for_status.xsjs/" + statusRes.ID;
			    }
				var XSJSUrl = sap.ui.ino.application.Configuration.getBackendRootURL() +  "/sap/ino/xs/rest/backoffice" +  backendServiceUrl;
				jQuery.ajax({
					url: XSJSUrl,
					type: PostOrPut,
					contentType: "application/json",
					async: true,
					data: JSON.stringify(statusRes)
				}).done(function(response){
                    if(response.GENERATED_IDS[-1] !== undefined){
			         statusModelData.setProperty("/ID", response.GENERATED_IDS[-1]);
			    }
			        that.getModel("applicationObject").hasPendingChanges = function() {
					return false;
				};
				});
			});
		},

		onModelAction: function(fnAction, sSection, bChange, bClose, bIgnoreConcurrencyConflict, oParameters) {
			var oView = this.getView();
			var that = this;
			var oModel = this.getModel();
			var bMessageGroup = false;
			var oDeferred = new jQuery.Deferred();
			var mModelActionArguments = {
				fnAction: fnAction,
				sSection: sSection,
				bChange: bChange,
				bClose: bClose
			};

			var bBusy = !(this.mMessageParameters[sSection] && this.mMessageParameters[sSection][MessageParam.NoBusy]);

			if (this.mMessageParameters[MessageParam.Group]) {
				bMessageGroup = true;
				sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages();
				this.clearFacetMessages();

				oView.removeAllMessages();
				oView.showValidationMessages();
				if (oView.hasValidationMessages()) {
					sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessages(
						oView.getMessages());
					oDeferred.reject();
					return oDeferred.promise();
				}

			} else {
				jQuery.sap.log.warning("No message group defined, message handling disabled", null,
					"sap.ui.ino.views.common.ThingInspectorAOController");
			}

			function fnRun(bResult) {
				if (bResult) {
					if (oModel) {
						oView.setBusy(bBusy);
						var aArguments = fnAction.isCustomAction ? [oParameters, bIgnoreConcurrencyConflict] : [bIgnoreConcurrencyConflict];
						var oRequest = fnAction.apply(oModel, aArguments);

						oRequest.always(function(oResponse) {
							oView.setBusy(false);
						});

						oRequest.done(function(oResponse) {
							if (bChange) {
								that.onChange();
							}

							if (bClose) {
								that.close();
							}

							if (oResponse.MESSAGES && bMessageGroup) {
								for (var i = oResponse.MESSAGES.length - 1; i >= 0; i--) {
									var oView = that.getView();
									var oMessage = oView.addBackendMessage(oResponse.MESSAGES[i], that.mMessageParameters[MessageParam.Group]);
									sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessage(
										oMessage);
								}
								if (that.getActiveFacet() && that.getActiveFacet().revalidateMessages) {
									that.getActiveFacet().revalidateMessages();
								}
							}

							if (bMessageGroup && that.mMessageParameters[sSection] && that.mMessageParameters[sSection][MessageParam.SuccessKey]) {
								var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
								var oMessageParameters = {
									key: that.mMessageParameters[sSection][MessageParam.SuccessKey],
									level: sap.ui.core.MessageType.Success,
									parameters: [],
									group: that.mMessageParameters[MessageParam.Group],
									text: oMsg.getResourceBundle().getText(
										that.mMessageParameters[sSection][MessageParam.SuccessKey])
								};

								var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
								var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
								oApp.addNotificationMessage(oMessage);
							}

							var oEvtBus = sap.ui.getCore().getEventBus();
							oEvtBus.publish(that.oView.getControllerName(), "model_" + sSection, {
								bSuccess: true
							});

							//call the facet specific after Model Action Callback
							if (that.getActiveFacet() && that.getActiveFacet().getController().onAfterModelAction) {
								that.getActiveFacet().getController().onAfterModelAction(sSection);
								that.onAfterModelAction(sSection);
							}

							oDeferred.resolve(oResponse);
						});

						oRequest.fail(function(oResponse) {
							if (oResponse.concurrencyConflict) {
								that.handleConcurrencyConflict(mModelActionArguments);
							} else {
								if (oResponse.MESSAGES && bMessageGroup) {
									for (var i = oResponse.MESSAGES.length - 1; i >= 0; i--) {
										var oView = that.getView();
										var oMessage = oView.addBackendMessage(oResponse.MESSAGES[i], that.mMessageParameters[MessageParam.Group]);
										sap.ui.ino.application.backoffice.Application.getInstance()
											.addNotificationMessage(oMessage);
									}
									if (that.getActiveFacet() && that.getActiveFacet().revalidateMessages) {
										that.getActiveFacet().revalidateMessages();
									}
								}

								var oEvtBus = sap.ui.getCore().getEventBus();
								oEvtBus.publish(that.oView.getControllerName(), "model_" + sSection, {
									bSuccess: false
								});
							}
							oDeferred.reject(oResponse);
						});
					} else {
						oDeferred.reject();
					}
				} else {
					oDeferred.reject();
				}
			}

			if (this.mMessageParameters[sSection] && this.mMessageParameters[sSection][MessageParam.Dialog] && this.mMessageParameters[sSection][
				MessageParam.Title]) {
				var oBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
				sap.ui.ino.controls.MessageBox.confirm(oBundle
					.getText(this.mMessageParameters[sSection][MessageParam.Dialog]), fnRun, oBundle
					.getText(this.mMessageParameters[sSection][MessageParam.Title]));
			} else {
				fnRun(true);
			}

			return oDeferred.promise();
		},

		onAfterModelAction: function(sActionName) {
			// Redefine when needed
		},

		handleConcurrencyConflict: function(mActionArguments) {
			var oDialog = null;
			var oCancelButton = new sap.ui.commons.Button({
				text: "{i18n>BO_COMMON_BUT_CANCEL}",
				press: function() {
					oDialog.close();
				}
			});

			function forceModelAction() {
				this.onModelAction.apply(this, [mActionArguments.fnAction, mActionArguments.sSection,
                        mActionArguments.bChange, mActionArguments.bClose, true]);
				oDialog.close();
			}

			function merge() {
				this.getModel().mergeConcurrentChanges();
				var sSuccessMsgKey = "GENERAL_APPPLICATION_MSG_CONCURRENCY_CONFLICT_MERGE_SUCCESS";
				var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
				var oMessage = new sap.ui.ino.application.Message({
					key: sSuccessMsgKey,
					level: sap.ui.core.MessageType.Success,
					text: oMsg.getResourceBundle().getText(sSuccessMsgKey)
				});
				var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
				oApp.addNotificationMessage(oMessage);
				oDialog.close();
			}

			function showMostRecentObject() {
				this.openNew();
			}

			oDialog = new sap.ui.commons.Dialog({
				title: "{i18n>GENERAL_APPLICATION_TIT_CONCURRENCY_CONFLICT}",
				modal: true,
				resizable: false,
				content: [new sap.ui.layout.VerticalLayout({
					content: [new sap.ui.commons.TextView({
						text: "{i18n>GENERAL_APPLICATION_EXP_CONCURRENCY_CONFLICT}"
					}), new sap.ui.commons.TextView({}), new sap.ui.commons.Link({
						text: "{i18n>GENERAL_APPPLICATION_BUT_CONCURRENCY_CONFLICT_VIEW_OTHER_STATE}",
						press: [showMostRecentObject, this]
					})]
				})],
				buttons: [new sap.ui.commons.Button({
					text: "{i18n>GENERAL_APPPLICATION_BUT_CONCURRENCY_CONFLICT_FORCE}",
					press: [forceModelAction, this]
				}), new sap.ui.commons.Button({
					text: "{i18n>GENERAL_APPPLICATION_BUT_CONCURRENCY_CONFLICT_MERGE}",
					press: [merge, this]
				}), oCancelButton],
				defaultButton: oCancelButton
			});
			oDialog.open();
		},

		_oMessageReferenceControl: undefined,

		setFacetMessage: function(oLevel, sMsgCode, oControl) {
			if (this.mMessageParameters[MessageParam.Group]) {
				sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages(
					this.mMessageParameters[MessageParam.Group] + "_facet");
				sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages(
					this.mMessageParameters[MessageParam.Group]);
			} else {
				jQuery.sap.log.warning("No message group defined, message handling disabled", null,
					"sap.ui.ino.views.common.ThingInspectorAOController");
				return;
			}

			if (this._oMessageReferenceControl && this._oMessageReferenceControl.setValueState) {
				this._oMessageReferenceControl.setValueState(sap.ui.core.ValueState.None);
			}

			var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
			var oMessageParameters = {
				key: sMsgCode,
				level: oLevel,
				parameters: [],
				group: this.mMessageParameters[MessageParam.Group] + "_facet",
				text: oMsg.getResourceBundle().getText(sMsgCode),
				referenceControl: oControl
			};
			var oMessage = new sap.ui.ino.application.Message(oMessageParameters);

			sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessage(oMessage);
			oMessage.showValueState();

			this._oMessageReferenceControl = oControl;
		},

		clearFacetMessages: function(sGroup, sLevel) {
			if (this.mMessageParameters[MessageParam.Group]) {
				sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages(
					this.mMessageParameters[MessageParam.Group] + "_facet", sLevel);

				if (this._oMessageReferenceControl && this._oMessageReferenceControl.setValueState) {
					this._oMessageReferenceControl.setValueState(sap.ui.core.ValueState.None);
					this._oMessageReferenceControl = undefined;
				}
			}
			this.getView().removeAllMessages(sGroup, sLevel);
		},

		clearMessages: function(sGroup) {
			sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages(sGroup);
			this.clearFacetMessages(sGroup);
		},

		addMessages: function(aMessage, sGroup) {
			var aBackendMessages = this.getView().addBackendMessages(aMessage, sGroup);
			for (var i = 0; i < aBackendMessages.length; i++) {
				sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessage(aBackendMessages[i]);
			}
		}
	};

	sap.ui.ino.views.common.ThingInspectorAOController.MessageParam = MessageParam;

})();