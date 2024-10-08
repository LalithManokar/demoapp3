/*!
 * @copyright@
 */
sap.ui.define([
    "./BaseBlockController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ino/commons/formatters/ObjectFormatter",
    "./mixins/IdentityQuickviewMixin",
    "./mixins/ClipboardMixin",
    "./mixins/IdentityCardSendMailMixin",
    "sap/ui/core/MessageType"
], function(BaseController,
	JSONModel,
	MessageToast,
	ObjectFormatter,
	IdentityQuickviewMixin,
	ClipboardMixin,
	IdentityCardSendMailMixin,
	MessageType) {

	/**
	 * Base Controller to use when dealing with single object instances
	 * To use it instantiate the application object instance and set it with setObjectModel
	 *
	 */

	return BaseController.extend("sap.ino.vc.commons.BaseObjectController", jQuery.extend({},
		IdentityQuickviewMixin, ClipboardMixin, IdentityCardSendMailMixin, {

			formatter: ObjectFormatter,

			onInit: function() {
				BaseController.prototype.onInit.apply(this, arguments);
			},

			onExit: function() {
				if (BaseController.prototype.onExit) {
					BaseController.prototype.onExit.apply(this, arguments);
				}
				this.releaseObjectModel();
			},

			/**
			 * Sets an object to as current object model, it will be set on view level
			 * and bind it in the view
			 *
			 * Afterwards you can use it on the view using the name "object"
			 *
			 * @param oModel
			 * @param bSuppressBGImage indicating that BG Image is not affected.
			 */
			setObjectModel: function(oModel) {
				if (oModel !== this.getView().getModel("object") && this.hasOwnModel("object")) {
					this.releaseObjectModel();
				} else {
					// When using the same model instance
					// we set it to null. So we ensure that all the
					// binding states are reset to initial (instead of dirty)
					// from prior type validations
					this.getView().setModel(null, "object");
				}

				this.getView().setModel(oModel, "object");
				this.getView().bindElement({
					path: "object>/"
				});
			},

			releaseObjectModel: function() {
				var oOldObjectModel = this.getView().getModel("object");
				if (oOldObjectModel) {
					oOldObjectModel.releaseFromSyncMode();
					oOldObjectModel.destroy();
				}
			},

			/**
			 * @abstract
			 * @returns new application object model
			 */
			createObjectModel: function(vObjectKey, sRoute, oRouteArgs) {},

			/**
			 * @returns current object
			 */
			getObjectModel: function() {
				var oObjectModel = this.getView().getModel("object");
				if (oObjectModel && oObjectModel.isDeleted()) {
					this.setObjectExists(false);
					this.setObjectModel(undefined);
					return undefined;
				}
				return oObjectModel;
			},

			/**
			 * Method to check if there are pending changes to write to the backend
			 *
			 * @returns true/false if the belonging object model has pending changes
			 */
			hasPendingChanges: function() {
				return false;
			},

			/**
			 * Method to reset the changes if there are pending changes
			 *
			 */
			resetPendingChanges: function() {
				var oModel = this.getObjectModel();
				if (oModel && oModel.hasPendingChanges()) {
					oModel.revertChanges();
				}
			},

			/**
			 * Method to check if a given Model matches to the object model of this controller and therefore could be used also
			 * @param oModel Model to check
			 * @returns true/false if the belonging object model matches
			 */
			doModelsMatch: function(oModel) {
				if (!oModel) {
					return false;
				}
				var oOwnModel = this.getObjectModel();
				if (!oOwnModel) {
					return false;
				}

				if (oModel.getObjectName() === oOwnModel.getObjectName() && oModel.getKey() === oOwnModel.getKey()) {
					return true;
				}

				return false;
			},

			/**
			 * @abstract
			 * @returns name of OData entity
			 */
			getODataEntitySet: function() {
				// can be redefined if OData Model is needed;
				return null;
			},

			/**
			 * Binds view to object instance of oData model
			 * Afterwards you can bind on the view with the named model "data"
			 * @param iId : Integer
			 */
			bindDefaultODataModel: function(iId, fnCallback) {
				var that = this;

				var sEntitySet = this.getODataEntitySet();
				if (sEntitySet && iId > 0) {
					this.getView().bindElement({
						path: "data>/" + sEntitySet + "(" + iId + ")",
						events: {
							dataRequested: function() {
								jQuery.each(that.getBusyControls(), function(iIdx, oControl) {
									if (jQuery.type(oControl.setBusy) === "function") {
										oControl.setBusy(true);
									}
								});
							},
							dataReceived: function(oEvent) {
								jQuery.each(that.getBusyControls(), function(iIdx, oControl) {
									if (jQuery.type(oControl.setBusy) === "function") {
										oControl.setBusy(false);
									}
								});

								if (oEvent.getParameter("data") === undefined) {
									// error happened when reading the object
									that.setObjectExists(false);
								} else {
									that.setObjectExists(true);
								}

								if (typeof fnCallback === "function") {
									fnCallback.apply(that);
								}
							},
							change: function() {
								// "dataReceived" might be called too late for not found objects
								// So we it whether an object exists by checking if the model has data
								// with the given path
								var bObjectExists = this.getModel().getProperty(this.getPath()) !== undefined;
								that.setObjectExists(bObjectExists);
							}
						}
					});

					// if no request is needed, immediately trigger the callback
					if (typeof fnCallback === "function") {
						var oContext = this.getView().getBindingContext("data");
						if (oContext && oContext.getPath() === ("/" + sEntitySet + "(" + iId + ")")) {
							fnCallback.apply(that);
						}
					}
				}
			},

			getDefaultODataModelEntity: function(iId) {
				return this.getModel("data").getProperty("/" + this.getODataEntitySet() + "(" + iId + ")");
			},

			onRouteMatched: function(oEvent) {
				var that = this;
				var sRoute = oEvent.getParameter("name");
				var oRouteArgs = oEvent.getParameter("arguments");
				var iObjectKey;
				try {
					iObjectKey = parseInt(oRouteArgs.id, 10);
				} catch (oError) {
					return;
				}

				var oObject = this.getObjectModel();
				if (!oObject || oObject.getKey() !== iObjectKey) {
					oObject = this.createObjectModel(iObjectKey, sRoute, oRouteArgs);
					this.setObjectModel(oObject);
					oObject.getDataInitializedPromise().fail(function() {
						that.setObjectExists(false);
						if (that.preCheck) {
							that.checkObjectExists(oObject.getObjectName(), oObject.getKey() || oObject.getInitKey());
						}
					});
					oObject.getDataInitializedPromise().done(function() {
						that.setObjectExists(true);
					});
				}

				this.bindDefaultODataModel(iObjectKey);
				var oQuery = oRouteArgs["?query"];
				var sSection = (oQuery && oQuery.section) || "sectionDetails";
				this.showSection(sSection);
			},

			onTabSelect: function(oEvent) {
				var oSection = oEvent.getParameter("section");
				this.navigateTo(this.getCurrentRoute(), {
					id: this.getObjectModel().getKey(),
					query: {
						section: this.getLocalElementId(oSection)
					}
				}, true /*no history*/ );
			},

			showSection: function(sLocalSectionId, sObjectPageLayoutId) {
				var that = this;
				var oLayout = this.byId(sObjectPageLayoutId ? sObjectPageLayoutId : "objectpage");
				if (!oLayout) {
					return;
				}

				var oSection = this.byId(sLocalSectionId);
				if (!oSection) {
					return;
				}

				var sSectionId = oSection.getId();

				oLayout.addEventDelegate({
					onAfterRendering: jQuery.proxy(function() {
						//need to wait for the scrollEnablement to be active
						jQuery.sap.delayedCall(500, oLayout, oLayout.scrollToSection, [sSectionId]);
					}, that)
				});

				var fnScrollToSection = function() {
					oLayout.scrollToSection(sSectionId);
					var oBar = oLayout.getAggregation("_anchorBar");
					// wait for anchorbar to be ready for scroll
					jQuery.sap.delayedCall(500, this, function() {
						oBar.scrollToSection(sSectionId);
					});
					that.setViewProperty("/objectPageSection", sLocalSectionId);
				};

				var oLayoutReady = jQuery.Deferred();
				oLayoutReady.done(fnScrollToSection);

				// Checking _bDomReady is unfortunately the only chance to find out
				// whether scroll to section will already work
				// The object page layout waits internally at least 350 ms after
				// you can really use it.
				if (oLayout._bDomReady === true) {
					oLayoutReady.resolve();
				} else {
					var fnCheckReady = function() {
						if (oLayout._bDomReady === true) {
							oLayoutReady.resolve();
						} else {
							jQuery.sap.delayedCall(500, this, fnCheckReady);
						}
					};
					jQuery.sap.delayedCall(500, this, fnCheckReady);
				}
			},

			onShowMessages: function(oEvent) {
				this.byId("messagePopover").openBy(oEvent.getSource());
			},

			/**
			 * Executes an action on the current object
			 * @public
			 * @param sActionName
			 * @param {object}  (oOptions)    object with additional options (keys "messages", "objectModelExt", "parameters")
			 *      messages : optional object for messages {
			 *          confirm : text key or function for confirmation messages
			 *          success : text key or function for success messages
			 *          error: text key or function for error messages
			 *      }
			 *      objectModelExt: optional object model when different from getObjectObject
			 *      parameters: optional additional parameters in an JS object to be handed over to backend
			 * @returns Promise
			 *      In case a confirmation is requested success is indicated also when cancel is pressed.
			 *      The response object contains an attribute "confirmationCancelled" when cancellation
			 *      has been pressed
			 */
			executeObjectAction: function(sActionName, oOptions) {
				var oObjectModel = (oOptions && oOptions.objectModelExt) || this.getObjectModel();

				if (oObjectModel instanceof sap.ino.commons.models.object.Idea && oObjectModel.getProperty("/STATUS_CODE") ===
					"sap.ino.config.DRAFT" && ((sActionName === "modify" && oObjectModel.getProperty("/NAME")) || sActionName === "del")) {
					this.enforceInputTypeValidations();
					this.resetInputTypeValidations(this.getView());
				} else if (this.hasAnyClientErrorMessages()) {
					var oDeferred = new jQuery.Deferred();
					if (oObjectModel instanceof sap.ino.commons.models.object.Idea) {
						var aErrorMessages = this.getErrorClientMessages(this.getOwnerComponent().getModel("message").getData());
						var sErrorText = this.getText("MSG_SAVE_USER_ERROR");
						if (aErrorMessages.length > 0) {
							sErrorText = aErrorMessages[0].message;
						}
						MessageToast.show(sErrorText);
					} else {
						MessageToast.show(this.getText("MSG_SAVE_USER_ERROR"));
					}
					oDeferred.reject();
					return oDeferred.promise();
				}
				return BaseController.prototype.executeObjectAction.call(this, oObjectModel, sActionName, oOptions);
			},
			executeObjectActionPrototypeDirectly: function(sActionName, oOptions) {
				var oObjectModel = (oOptions && oOptions.objectModelExt) || this.getObjectModel();
				return BaseController.prototype.executeObjectAction.call(this, oObjectModel, sActionName, oOptions);
			},			
			getErrorClientMessages: function(aMessages) {

				if (this._previousClientMessages && this._previousClientMessages.length > 0) {
					return this._previousClientMessages;
				}
				var aErrorMesages = aMessages.filter(function(oMessage) {
					return oMessage.processor.getMetadata().getName() === "sap.ui.core.message.ControlMessageProcessor" && oMessage.type ===
						MessageType.Error;
				});
				return aErrorMesages;
			}

		}));
});