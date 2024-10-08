sap.ui.define([
    "sap/ino/commons/formatters/BaseFormatter",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/message/ControlMessageProcessor",
    "sap/m/InputBase",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/ino/commons/application/Configuration",
    "sap/ui/core/ListItem",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/MessageType",
    "sap/m/MultiInput",
    "sap/ino/commons/util/UIObjectConfig",
    "sap/m/Select",
    "sap/ino/commons/util/SmartControl",
    "sap/ui/core/ResizeHandler",
    "sap/m/ComboBox",
   "sap/ino/commons/models/aof/MetaModel"
], function(BaseFormatter,
	Controller,
	ControlMessageProcessor,
	InputBase,
	JSONModel,
	ResourceModel,
	UIComponent,
	Device,
	Configuration,
	ListItem,
	MessageToast,
	MessageBox,
	MessageType,
	MultiInput,
	UIObjectConfig,
	Select,
	SmartControl,
	ResizeHandler,
	ComboBox,
	MetaModel) {
	// 	"use strict";

	MetaModel.getBackendAllMetadata();
	return Controller.extend("sap.ino.vc.commons.BaseController", {

		formatter: BaseFormatter,

		/* all controls in this array are turned busy during loading data through a base controller */
		aBusyControls: [],

		onInit: function() {
			sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
			this._previousClientMessages = [];
			this._controlMessageProcessor = new ControlMessageProcessor();
			if (Controller.prototype.onInit) {
				Controller.prototype.onInit.apply(this, arguments);
			}

			// Initialization for "Facets" that are not in the inheritance chain
			if (this._onInit) {
				this._onInit();
			}

			if (!this.getModel("view")) {
				this.setModel(new JSONModel({
					Layouts: {
						SimpleFormLayout: {
							labelSpanL: 12,
							labelSpanM: 12,
							emptySpanL: 1,
							emptySpanM: 1,
							breakpointL: 1024,
							breakpointM: 600,
							layout: "ResponsiveGridLayout"
						}
					}
				}), "view");
			}

			this.setObjectExists(true);

			if (this.getOwnerComponent()) {
				this.setModel(this.getOwnerComponent().getModel("component"), "component");
			}

			// Smart Control support for XML views
			var oCustomData = this.getView().data();
			if (!oCustomData.aofSmartControl && this.getView().getContent()) {
				oCustomData = this.getView().getContent()[0].data();
			}
			if (oCustomData.aofSmartControl) {
				SmartControl.bindAll(this, this.getView());
			}
		},

		onAfterRendering: function() {
			var personalizeSettings = Configuration.getPersonalize();
			if (personalizeSettings && personalizeSettings.SCREEN_SIZE) {
				this.setFullScreen(personalizeSettings.SCREEN_SIZE);
			}
		},

		onExit: function() {
			// Initialization for "Facets" that are not in the inheritance chain
			if (this._onExit) {
				this._onExit();
			}

			var oViewModel = this.getModel("view");
			if (oViewModel) {
				oViewModel.destroy();
			}
			if (Controller.prototype.onExit) {
				Controller.prototype.onExit.apply(this, arguments);
			}
		},

		destroy: function() {
			Controller.prototype.destroy.apply(this.arguments);
		},

		/* the route the view currently displays */
		getCurrentRoute: function() {
			return this.getOwnerComponent().getCurrentRoute();
		},

		getBusyControls: function() {
			return this.aBusyControls;
		},

		getDensityClass: function() {
			if (jQuery("body").hasClass("sapUiSizeCozy")) {
				return "sapUiSizeCozy";
			} else {
				return "sapUiSizeCompact";
			}
		},

		createView: function(oViewData) {
			var oView;
			this.getOwnerComponent().runAsOwner(function() {
				oView = sap.ui.view(oViewData);
			});
			return oView;
		},

		getLocalElementId: function(oElement) {
			var sId = oElement.getId();
			var aIdParts = sId.split("--"); // -- is the separator which is used for element ids nested in views
			return aIdParts[aIdParts.length - 1];
		},

		createFragment: function(sFragmentName, sFragmentId) {
			// parameter sFragmentId is optional
			var oController = this;
			var oFragment;
			this.getOwnerComponent().runAsOwner(function() {
				if (!sFragmentId) {
					oFragment = sap.ui.xmlfragment(oController.getView().getId(), sFragmentName, oController);
				} else {
					oFragment = sap.ui.xmlfragment(sFragmentId, sFragmentName, oController);
				}
				oController.onFragmentCreated(sFragmentName, oFragment);
			});
			return oFragment;
		},

		getFragment: function(sFragmentName, sFragmentId) {
			if (!this._mFragmentCache) {
				this._mFragmentCache = {};
			}
			if (!this._mFragmentCache[sFragmentName]) {
				this._mFragmentCache[sFragmentName] = this.createFragment(sFragmentName, sFragmentId);
			}
			return this._mFragmentCache[sFragmentName];
		},

		onFragmentCreated: function(sFragmentName, oFragment) {
			// Smart Control support for XML fragments
			if (jQuery.type(oFragment) === "object" && oFragment.data("aofSmartControl")) {
				SmartControl.bindAll(this, oFragment);
			}
		},

		setViewData: function(oViewData, bMerge) {
			this.getModel("view").setData(oViewData, bMerge);
		},

		setViewProperty: function(sProperty, vValue) {
			return this.getModel("view").setProperty(sProperty, vValue);
		},

		getViewProperty: function(sProperty) {
			return this.getModel("view").getProperty(sProperty);
		},

		setObjectExists: function(bObjectExists) {
			this.setViewProperty("/objectExists", bObjectExists);
		},

		getObjectExists: function() {
			return this.getViewProperty("/objectExists");
		},

		onNavBack: function() {
			this.getOwnerComponent().getRouter().onNavBack();
		},

		onDeleteNavBack: function(sOnDeleteHash, bReplace) {
			this.getOwnerComponent().getRouter().onDeleteNavBack(sOnDeleteHash, bReplace);
		},

		navigateBack: function() {
			this.onNavBack();
		},

		navigateTo: function(sTarget, oData, bReplace, bNoBusy) {
			this.getOwnerComponent().navigateTo(sTarget, oData, bReplace, bNoBusy);
		},

		navigateToWall: function(sTarget, oData, bReplace, bNoBusy) {
			sTarget = (sTarget === "wall" && Device.system.phone) ? "wallremote" : sTarget;
			this.getOwnerComponent().navigateTo(sTarget, oData, bReplace, bNoBusy);
		},

		navigateToExternal: function(sTarget, oData) {
			this.getOwnerComponent().navigateToExternal(sTarget, oData);
		},

		navigateToByURL: function(sURL) {
			this.getOwnerComponent().navigateToByURL(sURL);
		},

		navigateToInNewWindow: function(sTarget, oData) {
			this.getOwnerComponent().navigateToInNewWindow(sTarget, oData);
		},

		navigateToByURLInNewWindow: function(sURL) {
			this.getOwnerComponent().navigateToByURLInNewWindow(sURL);
		},

		getRouter: function() {
			return UIComponent.getRouterFor(this);
		},

		getOwnerComponent: function() {
			if (this._oComponent) {
				return this._oComponent;
			}
			this._oComponent = Controller.prototype.getOwnerComponent.apply(this, arguments);
			if (this._oComponent) {
				return this._oComponent;
			}
			var oView = this.getView();
			while (oView.getParent()) {
				oView = oView.getParent();
				this._oComponent = oView.getController && oView.getController().getOwnerComponent();
				if (this._oComponent) {
					break;
				}
			}
			return this._oComponent;
		},

		setBusy: function(bBusy) {
			this.getView().setBusy(bBusy);
		},

		getBusy: function() {
			this.getView().getBusy();
		},

		_getTextModel: function() {
			if (!this._i18n) {
				this._i18n = this.getOwnerComponent() && this.getOwnerComponent().getModel("i18n");
			}
			return this._i18n;
		},

		getText: function(sText, aParameters) {
			if (this._getTextModel()) {
				return this._getTextModel().getResourceBundle().getText(sText, aParameters);
			}
		},

		hasOwnModel: function(sModelName) {
			return !!this.getView().oModels[sModelName];
		},

		getDefaultODataModel: function() {
			return this.getOwnerComponent().getModel("data");
		},

		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		_onBindingChange: function() {
			var oElementBinding = this.getView().getElementBinding();
			// No data for the binding
			if (oElementBinding && !oElementBinding.getBoundContext()) {
				this.getOwnerComponent().getRouter().getTargets().display("notFound");
			}
		},

		setViewFocus: function() {
			var that = this;
			setTimeout(function() {
				// do not update the focus, if we have it already sitting on a control
				if (!sap.ui.getCore().getCurrentFocusedControlId()) {
					var oControl;
					if (jQuery.type(that.initialFocus) === "string") {
						oControl = that.byId(that.initialFocus);
						if (oControl && oControl.$() && oControl.$().is(":visible") && jQuery.type(oControl.focus) === "function") {
							oControl.focus();
						}
					} else if (jQuery.type(that.initialFocus) === "array") {
						for (var ii = 0; ii < that.initialFocus.length; ii++) {
							oControl = that.byId(that.initialFocus[ii]);
							if (oControl && oControl.$() && oControl.$().is(":visible") && jQuery.type(oControl.focus) === "function") {
								oControl.focus();
								break;
							}
						}
					}
				}
			}, 100);
		},

		toggleFullScreen: function() {
			var oMShell = this.getOwnerComponent().getShell();
			oMShell.setAppWidthLimited(!oMShell.getAppWidthLimited());

			this.getModel("component").setProperty("/FULLSCREEN", !oMShell.getAppWidthLimited());

			var oIdeaLink = this.byId('ideaLink');
			if (oIdeaLink && oMShell.getAppWidthLimited()) {
				oIdeaLink.addStyleClass("sapInoIdeaListIdeaNameTitle");
			} else if (oIdeaLink && !oMShell.getAppWidthLimited() && oIdeaLink.hasStyleClass("sapInoIdeaListIdeaNameTitle")) {
				oIdeaLink.removeStyleClass("sapInoIdeaListIdeaNameTitle");
			}

		},

		setFullScreen: function(bState) {
			var oMShell = this.getOwnerComponent().getShell();
			var componentModel = this.getModel("component");
			oMShell.setAppWidthLimited(!bState);
			if (componentModel) {
				componentModel.setProperty("/FULLSCREEN", !oMShell.getAppWidthLimited());
			}
		},

		getFullScreen: function() {
			return !this.getOwnerComponent().getShell().getAppWidthLimited();
		},

		/* *************** MULTI INPUT HELPER *************** */
		_createSuggestHandler: function(mSettings) {
			if (Device.system.desktop) {
				return function(oEvent) {
					//check if we should suggest at all
					var oControl = oEvent.getSource();
					if (oControl.getMaxTokens() && oControl.getMaxTokens() <= oControl.getTokens().length) {
						oControl.removeAllSuggestionItems();
						return;
					}

					var sToken = oEvent.getParameter("suggestValue");
					var oListTemplate = new ListItem({
						key: "{data>" + mSettings.key + "}",
						text: "{data>" + mSettings.text + "}",
						additionalText: mSettings.additionalText && "{data>" + mSettings.additionalText + "}"
					});

					var sSuggestPath = mSettings.path.replace("$suggestValue", jQuery.sap.encodeURL(sToken));
					var sSelect = mSettings.key + "," + mSettings.text;
					if (mSettings.additionalText) {
						sSelect = sSelect + "," + mSettings.additionalText;
					}

					oEvent.getSource().bindAggregation("suggestionItems", {
						path: sSuggestPath,
						template: oListTemplate,
						filters: mSettings.filters,
						sorter: mSettings.sorter,
						parameters: {
							select: sSelect
						}
					});
				};
			} else {
				// special handling for mobile as binding triggers a focusout and therefore a change of of the multiinput
				return function(oEvent) {
					//check if we should suggest at all
					var oControl = oEvent.getSource();
					if (oControl.getMaxTokens() && oControl.getMaxTokens() <= oControl.getTokens().length) {
						oControl.removeAllSuggestionItems();
						return;
					}

					var sToken = oEvent.getParameter("suggestValue");

					var sSuggestPath = mSettings.path.replace("$suggestValue", jQuery.sap.encodeURL(sToken));
					sSuggestPath = sSuggestPath.replace("data>", "");
					sSuggestPath = sSuggestPath.replace("object>", "");

					var sSelect = mSettings.key + "," + mSettings.text;
					if (mSettings.additionalText) {
						sSelect = sSelect + "," + mSettings.additionalText;
					}

					//coding on UI5 internal: avoid flickering, but also works w/o setting this flag
					oControl._bBindingUpdated = true;
					oControl.getModel("data").read(sSuggestPath, {
						filters: mSettings.filters,
						sorter: mSettings.sorter,
						success: function(oData) {
							oControl.removeAllSuggestionItems();
							// we cannot set all items at once, therefore we use 
							// 0..n-1 addAggregation w/o list update
							// n addSuggestionItem which triggers a list refresh
							for (var ii = 0; ii < oData.results.length - 1; ii++) {
								oControl.addAggregation("suggestionItems", new ListItem({
									key: oData.results[ii][mSettings.key],
									text: oData.results[ii][mSettings.text],
									additionalText: mSettings.additionalText && oData.results[ii][mSettings.additionalText]
								}), true);
							}
							if (oData.results.length > 0) {
								oControl.addSuggestionItem(new ListItem({
									key: oData.results[oData.results.length - 1][mSettings.key],
									text: oData.results[oData.results.length - 1][mSettings.text],
									additionalText: mSettings.additionalText && oData.results[oData.results.length - 1][mSettings.additionalText]
								}));
							}
						}
					});
				};
			}
		},

		/* *************** Action execution ****************** */

		/**
		 * Executes an action on a given object model
		 * @public
		 * @param oObjectModel
		 * @param sActionName
		 * @param {object}  (oOptions)    object with additional options (keys "messages", "parameters", "staticparameters")
		 *      messages : optional object for messages {
		 *          confirm : text key or function for confirmation messages
		 *          success : text key or function for success messages
		 *          error: text key or function for error messages
		 *      }
		 *      parameters: optional additional parameters in an JS object to be handed over to backend
		 *      staticparameters: optional parameters to be given in case the action should not be called on an instance
		 * @returns Promise
		 *      In case a confirmation is requested success is indicated also when cancel is pressed.
		 *      The response object contains an attribute "confirmationCancelled" when cancellation
		 *      has been pressed
		 */
		executeObjectAction: function(oObjectModel, sActionName, oOptions) {
			var that = this;
			var oMessageCallbacks = oOptions && oOptions.messages || {};
			var oParameters = oOptions && oOptions.parameters || {};
			var oStaticParam = oOptions && oOptions.staticparameters || null;
			var oExecutionPromise;

			function getMessageText(vInput, sDefault, oServiceResult) {
				if (!vInput) {
					return that.getText(sDefault);
				}
				if (typeof vInput === "function") {
					return vInput(oServiceResult);
				} else {
					return that.getText(vInput);
				}
			}

			function handleConcurrencyConflict() {
				if (!that._oConcurrentEditDialog) {
					var oResourceModel = that._getTextModel();
					// initial concurrecy state 
					that._oConcurrencyModel = oObjectModel;
					that._sActionName = sActionName;
					that._oConcurrentEditDialog = that.createFragment("sap.ino.vc.commons.fragments.ConcurrentEditDialog");
					that._oConcurrentEditDialog.setModel(oResourceModel, 'i18n');
					that.getView().addDependent(that._oConcurrentEditDialog);

				}
				that._oConcurrentEditDialog.open();
			}

			var fnExecute = function() {
				that.getView().setBusy(true);
				var oActionRequest;
				if (oStaticParam) {
					// in case the action is called statically (without model instance)
					oActionRequest = oObjectModel[sActionName].apply(oObjectModel, [oStaticParam, oParameters]);
				} else {
					// for calling with model instance
					oActionRequest = oObjectModel[sActionName].apply(oObjectModel, [oParameters]);
				}

				oActionRequest.always(function() {
					that.getView().setBusy(false);
				});

				oActionRequest.done(function(oResponse) {
					var sMsg = getMessageText(oMessageCallbacks.success, "MSG_SAVE_SUCCESS", oResponse);
					if (sMsg) {
						MessageToast.show(sMsg, {
							autoClose: false
						});
					}
				});
				oActionRequest.fail(function(oResponse) {
					if (oResponse) {
						if (oResponse.concurrencyConflict) {
							handleConcurrencyConflict();
						} else {

							var sMsg = getMessageText(oMessageCallbacks.error, "MSG_SAVE_USER_ERROR", oResponse);
							if (sMsg) {
								MessageToast.show(sMsg, {
									autoClose: false
								});
							}
						}
					}

				});
				return oActionRequest;
			};

			if (oMessageCallbacks.confirm) {
				var oDeferred = new jQuery.Deferred();
				MessageBox.confirm(getMessageText(oMessageCallbacks.confirm), {
					onClose: function(sDialogAction) {
						if (sDialogAction !== MessageBox.Action.OK) {
							// the parameter true means: I have been cancelled
							oDeferred.resolve({
								confirmationCancelled: true
							});
							return;
						} else {
							var oActionRequest = fnExecute();
							oActionRequest.done(oDeferred.resolve);
							oActionRequest.fail(oDeferred.reject);
						}
					}
				});
				oExecutionPromise = oDeferred.promise();
			} else {
				oExecutionPromise = fnExecute();
			}
			return oExecutionPromise;
		},

		//************handle Conflict*************

		onIngoreConflict: function() {
			if (this._oConcurrentEditDialog) {
				var oOption = {};
				oOption.parameters = {};
				oOption.parameters.bIgnoreConcurrencyConflict = true;

				this.executeObjectAction(this._sActionName, oOption);
				this._oConcurrentEditDialog.close();
			}

			this._cleanConcurrencyState();
		},

		onMergeConflict: function() {
			if (this._oConcurrentEditDialog) {
				this._oConcurrencyModel.mergeConcurrentChanges();
				this._oConcurrentEditDialog.close();
			}

			this._cleanConcurrencyState();
		},
		showLatestVestion: function() {
			var sObjectName, sPath, sKey, sLatestVersionURL;

			sObjectName = this._oConcurrencyModel.getObjectName();
			var oUIObjectConfigDefinition = UIObjectConfig.getDefinition(sObjectName);
			sPath = oUIObjectConfigDefinition.navigation.path;
			sKey = oUIObjectConfigDefinition.navigation.key;

			var oParameter = {};
			oParameter[sKey] = this._oConcurrencyModel.getKey();
			sLatestVersionURL = this.getNavigationLink(sPath, oParameter);
			var windower = window.open(sLatestVersionURL, "_blank");
			windower.opener = null;
		},

		onCancelConflict: function() {
			if (this._oConcurrentEditDialog) {
				this._oConcurrentEditDialog.close();
			}

			this._cleanConcurrencyState();
		},

		_cleanConcurrencyState: function() {

			this._oConcurrentEditDialog.destroy();

			delete this._oConcurrencyModel;
			delete this._sActionName;
			delete this._oConcurrentEditDialog;
		},

		getNavigationLink: function(sRouteName, oParameter) {
			return this.getOwnerComponent().getNavigationLink(sRouteName, oParameter);
		},

		/* *************** HELP *************** */

		setHelp: function() {
			if (!arguments || !arguments.length) {
				return false;
			}
			var text = '';
			for (var i = 0; i < arguments.length; i++) {
				text += this.getText("HELP_EXP_" + arguments[i]);
			}
			var oComponent = this.getOwnerComponent();
			oComponent.setHelpContent(text);
		},

		scrollDockElement: function(sPageId, sElementId, fBiasDefault, fOffsetDefault) {
			var that = this;
			var iInitOffset = 0;
			var iInitBias = 0;

			function scrollDockElement($oScrollContainer, $oControl) {
				var iCurrentOffset = parseInt($oScrollContainer.parent().find(".sapUxAPObjectPageWrapperTransform").css("padding-top"), 10);
				if (iInitOffset === 0) {
					iInitOffset = iCurrentOffset;
				}
				iCurrentOffset = iCurrentOffset === 0 ? iInitOffset : iCurrentOffset;
				var iCurrentBias = parseInt($oScrollContainer.find(".sapUxAPObjectPageHeaderDetails").height(), 10);
				if (iInitBias === 0) {
					iInitBias = iCurrentBias;
				}
				iCurrentBias = iCurrentBias === 0 ? iInitBias : iCurrentBias;
				var fOffset = fOffsetDefault !== undefined ? fOffsetDefault : iCurrentOffset;
				var fBias = fBiasDefault !== undefined ? fBiasDefault : iCurrentBias;
				if ($oScrollContainer.scrollTop() >= fBias) {
					$oControl.css("position", "absolute");
					$oControl.css("top", ($oScrollContainer.scrollTop() + fOffset) + "px");
				} else {
					$oControl.css("position", "relative");
					$oControl.css("top", 0);
				}
			}

			this.byId(sPageId).addEventDelegate({
				onAfterRendering: function(oEvent) {
					var $oScrollContainer = jQuery(oEvent.srcControl.getDomRef()).find(".sapUxAPObjectPageWrapper");
					$oScrollContainer.scroll(function() {
						scrollDockElement(jQuery(this), jQuery(that.byId(sElementId).getDomRef()));
					});
				}
			});
			this.byId(sElementId).addEventDelegate({
				onAfterRendering: function(oEvent) {
					var $oScrollContainer = jQuery(that.byId(sPageId).getDomRef()).find(".sapUxAPObjectPageWrapper");
					scrollDockElement($oScrollContainer, jQuery(oEvent.srcControl.getDomRef()));
				}
			});
		},

		attachListControlResized: function(oListControl) {
			if (oListControl) {
				return ResizeHandler.register(oListControl, this.onListControlResize);
			}
		},

		detachListControlResized: function(sResizeRegId) {
			if (sResizeRegId) {
				ResizeHandler.deregister(sResizeRegId);
			}
		},

		onListControlResize: function(oEvent) {
			var that = oEvent.control;
			var iWidth = oEvent.size.width;
			var iOldWidth = oEvent.oldSize ? oEvent.oldSize.width : -1;
			var aThresholds = [400, 500, 600, 700,
                800, 900, 1000,
                1100, 1200, 1300, Infinity];
			var aStyleClasses = ["sapInoListWidthXXXXS", "sapInoListWidthXXXS", "sapInoListWidthXXS", "sapInoListWidthXS",
                "sapInoListWidthS", "sapInoListWidthM", "sapInoListWidthL",
                "sapInoListWidthXL", "sapInoListWidthXXL", "sapInoListWidthXXXL", "sapInoListWidthXXXXL"];

			// closest index of old width
			var iOldIdx = aThresholds.reduce(function(iPrev, iCurr, iIdx) {
				if (iOldWidth >= iCurr) {
					return iIdx;
				} else {
					return iPrev;
				}
			}, 0);
			// closest index of current width in relation to aThresholds values
			var iClosestIdx = aThresholds.reduce(function(iPrev, iCurr, iIdx) {
				if (iWidth >= iCurr) {
					return iIdx;
				} else {
					return iPrev;
				}
			}, 0);

			if (iOldIdx !== iClosestIdx || iOldWidth === -1 || iOldWidth === 0) {
				// remove old class and add new
				for (var i = 0; i < aStyleClasses.length; i += 1) {
					that.removeStyleClass(aStyleClasses[i]);
				}
				that.addStyleClass(aStyleClasses[iClosestIdx]);
			}
		},

		/**
		 * Sets a specific client message to a target control
		 * It needs to manually reset with resetClientMessages
		 *
		 * @param oMessage : sap.ui.core.message.Message
		 * @param oTargetControl optional target input control to update
		 */
		setClientMessage: function(oMessage, oTargetControl) {
			this.resetClientMessages();

			var sTarget = oTargetControl && oTargetControl.getId() + "/value";
			oMessage.setTarget(sTarget);
			oMessage.setMessage(this.getText(oMessage.getCode()));
			// TODO: Open UI5 bug so that we can use the setter for the processor
			oMessage.processor = this._controlMessageProcessor;
			var aMessages = [oMessage];
			sap.ui.getCore().getMessageManager().addMessages(aMessages);
			this._previousClientMessages = aMessages;
		},

		/**
		 * Reset the message set in setClientMessage
		 */
		resetClientMessages: function(sTargetId) {
			var oMsgMgr = sap.ui.getCore().getMessageManager();
			var aData = oMsgMgr.getMessageModel().getData();
			if (aData.length > 0) {
				// fails if previous msg are not part of model data
				var aIntersect = jQuery.grep(this._previousClientMessages, function(oMessageData) {
					return jQuery.grep(aData, function(oData) {
						return oData.id === oMessageData.id && (!sTargetId || (sTargetId && oData.target && oData.target.indexOf(sTargetId) > -1));
					}).length > 0;
				});
				if (aIntersect.length > 0) {
					oMsgMgr.removeMessages(this._previousClientMessages);
					this._previousClientMessages = [];
				}
			}
		},

		/**
		 * was a "manual" client message set?
		 */
		hasClientMessages: function() {
			return this._previousClientMessages && this._previousClientMessages.length > 0;
		},

		/**
		 * Checks whether client error messages are present in the current view
		 * @returns {boolean}
		 */
		hasAnyClientErrorMessages: function() {
			this.enforceInputTypeValidations();
			var oMessageModel = this.getOwnerComponent().getModel("message");
			var aMessages = oMessageModel.getData();

			if (this.hasClientMessages()) {
				return true;
			}

			return aMessages.reduce(function(bPrevious, oMessage) {
				var sProcessorName = oMessage.processor.getMetadata().getName();
				return bPrevious || (sProcessorName === "sap.ui.core.message.ControlMessageProcessor" && oMessage.type === MessageType.Error);
			}, false);
		},

		/**
		 * Returns all controls which are ready to input
		 * @public
		 * @returns {Array.<Control>}
		 */
		getInputReadyControls: function(oV) {
			var oView = oV;
			if (!oView) {
				oView = this.getView();
			}
			var aControls = oView.findAggregatedObjects(true, function(oControl) {
				return (!oControl.getVisible || oControl.getVisible()) &&
					(!oControl.getEnabled || oControl.getEnabled()) &&
					(!oControl.getEditable || oControl.getEditable()) &&
					(oControl instanceof InputBase ||
						oControl instanceof Select ||
						oControl.getMetadata().getName() === "sap.ino.controls.MobileTextEditor" ||
						oControl.getMetadata().getName() === "sap.ui.richtexteditor.RichTextEditor" ||
						oControl.getMetadata().getName() === "sap.ino.controls.RichTextEditor"
					);
			});
			return aControls;
		},

		resetInputTypeValidations: function(oView) {
			sap.ui.getCore().getMessageManager().removeMessages(this.getViewMessages(oView));
		},

		hasMessages: function(oView) {
			var aViewMessages = this.getViewMessages(oView);
			if (aViewMessages && aViewMessages.length > 0) {
				return true;
			}
			return false;
		},

		getViewMessages: function(oView) {
			var aInputControls = this.getInputReadyControls(oView);
			var aViewMessages = [];
			jQuery.each(aInputControls, function(iIndex, oControl) {
				if (oControl.fireValidationSuccess) {
					oControl.fireValidationSuccess({
						element: oControl
					}, false, true);
				}
				if (oControl.setValueState) {
					oControl.setValueState(sap.ui.core.ValueState.None);
				}
				// collect the messages caused by this view
				// and that have to be removed
				var oBinding;
				if (oControl.getValue) {
					oBinding = oControl.getBinding("value");
				} else if (oControl.getSelectedKey) {
					oBinding = oControl.getBinding("selectedKey");
				}
				var aControlMessages = oBinding && oBinding.getDataState() && oBinding.getDataState().getMessages();
				if (aControlMessages && aControlMessages.length > 0) {
					aViewMessages = aViewMessages.concat(aControlMessages);
				}
			});
			return aViewMessages;
		},

		/**
		 * enforces type validations of input controls which have
		 * not been touched by users aldready, e.g. mandatory fields
		 **/
		enforceInputTypeValidations: function() {
			var that = this;
			var aInputControls = this.getInputReadyControls();
			jQuery.each(aInputControls, function(iIndex, oControl) {
				if (oControl.getDateValue && oControl.isBound("dateValue")) {
					oControl.updateModelProperty("dateValue", oControl.getDateValue(), oControl.getDateValue());
				} else if (oControl.getSelectedKey && oControl.mProperties && oControl.mProperties.hasOwnProperty("selectedKey")) {
					oControl.updateModelProperty("selectedKey", oControl.getSelectedKey(), oControl.getSelectedKey());
				} else if (oControl._oEditor && oControl._oEditor.getContent) { //walk arround for incident 1670549550
					if (oControl._oEditor.getBody()) {
						oControl.updateModelProperty("value", oControl._oEditor.getContent(), oControl._oEditor.getContent());
					}
				} else if (oControl.getValue) {
					oControl.updateModelProperty("value", oControl.getValue(), oControl.getValue());

					if (oControl instanceof MultiInput) {
						if (oControl.getValue()) {
							// there must not be any value but only tokens
							oControl.fireValidationError({
								element: oControl,
								property: "value",
								message: that.getText("MSG_MULTI_INPUT_INVALID_VALUE")
							}, false, true);
						} else {
							oControl.fireValidationSuccess({
								element: oControl,
								property: "value"
							}, false, true);
						}
					}
				} else {
					console.assert(false, "no property found to enforceInputTypeValidations of sap.ino.vc.commons.BaseObjectController");
				}
			});
		},

		getModuelModel: function() {
			var oModuleBundle = new ResourceModel({
				// INM-418: add timestamp to retrieve this resource from backend instead of local cache every time when terms and conditions info updated.
				bundleUrl: Configuration.getResourceBundleURL("moduletexts") + '?t=' + Date.now()
			});
			return oModuleBundle;
		},

		onTermsConditionsClose: function() {
			var that = this;

			var oTermData = {
				"TERM_CODE": this.getModel('module').getProperty("sap.ino.config.TERM_CODE"),
				"TERM_CHANGED_AT": this.getModel('module').getProperty('sap.ino.config.TERM_CHANGED_AT')
			};

			var fnTermAcceptCallBack = Configuration.getUserModel().getProperty("/data/TERMACCEPTCALLBACK");

			var fnAcceptTermConditionSucess = function() {
				that.getTermsDialog().close();

				Configuration.getUserModel().setProperty("/data/TERM_ACCEPTED", 1);

				if (fnTermAcceptCallBack) {
					fnTermAcceptCallBack();
				}
			};

			var fnAcceptTermConditionFailed = function() {
				MessageToast.show(that.getText("USER_TERM_AND_CONDITIONS_FAILD"));
			};

			//"1" Active Term & Condtion,  "0" , Deactive Term & Conditioan
			var sTermConditionActive = Configuration.getSystemSetting("sap.ino.config.TERMS_AND_CONDITIONS_ACTIVE");
			var sTermCode = Configuration.getSystemSetting("sap.ino.config.TERMS_AND_CONDITIONS_TEXT");

			if (sTermConditionActive === '1' && sTermCode) {
				//this._setUerTermCondition(oTermData, fnAcceptTermCondition);
				this.setUserTermCondition(oTermData, fnAcceptTermConditionSucess, fnAcceptTermConditionFailed);
			} else {
				this.getTermsDialog().close();

				if (fnTermAcceptCallBack) {
					fnTermAcceptCallBack();
				}
			}

		},

		onTermConditionSelected: function(oEvent) {
			var bSelected = oEvent.getParameter("selected");

			Configuration.getUserModel().setProperty("/data/USER_ACCEPTED", bSelected ? 1 : 0);

		},

		getTermsDialog: function(oController) {

			if (!this._oTermsDialog) {
				this._oTermsDialog = sap.ui.xmlfragment("sap.ino.vc.shell.fragments.TermsDialog", oController);
				//set i18n config model
				this._oTermsDialog.setModel(this._oComponent.getModel("i18n"), 'i18n');
				this._oTermsDialog.setModel(Configuration.getSystemSettingsModel(), 'config');

				oController.getView().addDependent(this._oTermsDialog);
			}

			return this._oTermsDialog;
		},
		setUserTermCondition: function(oData, fnSuccessAccept, fnFailedAccept) {
			var sTermServiceURI;
			if (!fnSuccessAccept) {
				return;
			}
			if (!fnFailedAccept) {
				return;
			}

			sTermServiceURI = "/" + Configuration.getSystemSetting("sap.ino.config.URL_PATH_XS_TERM_ACCEPT");

			jQuery.ajax({
				url: Configuration.getBackendRootURL() + sTermServiceURI,
				headers: {
					"X-CSRF-Token": Configuration.getXSRFToken()
				},
				method: "POST",
				cache: false,
				data: JSON.stringify(oData),
				success: fnSuccessAccept,
				error: fnFailedAccept
			});
		},

		checkObjectExists: function(sObjectName, nId) {
			var that = this;
			that.setBusy(true);
			jQuery.ajax({
				url: Configuration.getBackendRootURL() + "/sap/ino/xs/rest/community/objectCheck.xsjs",
				headers: {
					"X-CSRF-Token": Configuration.getXSRFToken()
				},
				method: "POST",
				cache: false,
				data: JSON.stringify({
					"ObjectName": sObjectName,
					"ID": nId
				}),
				success: function(oResponse) {
					that.setBusy(false);
					if (!oResponse) {
						that.setViewProperty("/insufficientObjectExists", {
							EXISTS: false
						});
						return;
					}
					that.setViewProperty("/insufficientObjectExists", {
						EXISTS: true,
						ID: oResponse.ID,
						REF_ID: oResponse.REF_ID,
						REF_NAME: oResponse.REF_NAME,
						OBJECT_NAME: sObjectName
					});
				},
				error: function() {
					that.setBusy(false);
					that.setViewProperty("/insufficientObjectExists", {
						EXISTS: false
					});
				}
			});
		}
	});
});