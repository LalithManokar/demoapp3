sap.ui.define([
    "./BaseObjectController",
    "sap/ui/Device",
    "sap/ui/core/ListItem",
    "sap/m/Token",
    "sap/m/Tokenizer",
    "sap/ui/core/MessageType"
], function(BaseController,
	Device,
	ListItem,
	Token,
	Tokenizer,
	MessageType) {
	"use strict";

	/**
	 * Base Controller to use when editing single object instances
	 * To use it instantiate the application object instance and set it with setObjectModel
	 */
	return BaseController.extend("sap.ino.vc.commons.BaseObjectModifyController", {

		onInit: function() {
			BaseController.prototype.onInit.apply(this, arguments);
		},

		onRouteMatched: function(oEvent) {
			var that = this;
			var sRoute = oEvent.getParameter("name");
			var oRouteArgs = oEvent.getParameter("arguments");

			var oView = this.getView();

			this.setObjectExists(true);
			oView.setBusy(true);

			this.resetInputTypeValidations();

			var iObjectKey;
			// implicit logic: when id argument is missing this means object creation
			if (oRouteArgs.id) {
				try {
					iObjectKey = parseInt(oRouteArgs.id, 10);
				} catch (oError) {
					jQuery.sap.log.error("Failed parsing key argument", oError, "sap.ino.vc.commons.BaseObjectModify.controller");
					return;
				}
			}

			var oObject = this.getObjectModel();
			if (!oObject || !iObjectKey || oObject.getKey() !== iObjectKey) {
				oObject = this.createObjectModel(iObjectKey, sRoute, oRouteArgs);
			}

			// Always set model for clean binding data states of prior usages 
			this.setObjectModel(oObject);
			oObject.getDataInitializedPromise().always(function() {
				oView.setBusy(false);
			});

			oObject.getDataInitializedPromise().fail(function() {
				that.setObjectExists(false);
                if(that.preCheck){
                    that.checkObjectExists(oObject.getObjectName(), oObject.getKey() || oObject.getInitKey());
                }
			});
		},

		/**
		 * Cancels object editing and navigates back
		 */
		onCancel: function() {
			// ask the user if the pending changes should be thrown away => during navigation
			//this.resetPendingChanges();
			this.navigateBack();
		},

		/**
		 * Deletes current object and navigates home
		 */
		onDelete: function(oEvent) {
			var oController = this;
			var oDelBtn = oEvent.getSource();
			var oDelRequest = this.executeObjectAction("del", {
				messages: {
					confirm: "MSG_DEL_CONFIRM",
					success: "MSG_DEL_SUCCESS"
				}
			});
			oDelRequest.done(function(oResponse) {
				if (oResponse && oResponse.confirmationCancelled === true) {
					if (oDelBtn && jQuery.type(oDelBtn.focus) === "function") {
						oDelBtn.focus();
					}
					return;
				}
				oController.navigateTo("home");
			});
		},

		/**
		 * Method to check if there are pending changes to write to the backend
		 *
		 * @returns true/false if the belonging object model has pending changes
		 */
		hasPendingChanges: function() {
			var oModel = this.getObjectModel();
			if (oModel) {
				return oModel.hasPendingChanges();
			}
			return false;
		},

		/**
		 * Adds token handling to a MultiInput control so that the application object
		 * is updated correctly and item suggestions work. Focus is direct children
		 * of the Root node. Suggestions work on basis of the OData model
		 * @param oControl
		 * @param mSettings {
		 *      childNodeName : string
		 *      childNodeNameSingular : string
		 *      suggestion : {
		 *          key: Key attribute for the suggestion items
		 *          text: Attribute to use as text for suggestion items
		 *          additionalText: Attribute to use as additional text for suggestion items
		 *          path: path in the OData model to use for suggestions, the placeholder $suggestValue
		 *                will be replaced by the token
		 *      },
		 *      token : {
		 *          key: Key attribute to add as token
		 *          text: Attribute to use as text for tokens,
		 *          editable: whether the delected icon show
		 *      }
		 */
		addMultiInputHandling: function(oControl, mSettings) {
			if (!oControl) {
				return;
			}
            var that = this;
			var oTokenTemplate = new Token({
				key: "{object>" + mSettings.token.key + "}",
				text: "{object>" + mSettings.token.text + "}",
				editable: that._getEditable(mSettings.token)
			});
			oControl.bindAggregation("tokens", {
				path: "object>" + mSettings.childNodeName,
				template: oTokenTemplate
			});
			var fnSuggestHandler = that._createSuggestHandler(mSettings.suggestion);
			oControl.attachSuggest(fnSuggestHandler, that);

			var fnTokenChangedHandler = that._createTokenChangedHandler(mSettings);
			oControl.attachTokenChange(fnTokenChangedHandler, that);
		},

		_getEditable: function(oToken) {
			if (!oToken.hasOwnProperty("editable")) {
				return true;
			}
			var sType = typeof oToken.editable;
			if (sType === "string" || (sType === "object" && oToken.editable.hasOwnProperty("path"))) {
				return oToken.editable;
			}
			return !!oToken.editable;
		},

		_createTokenChangedHandler: function(mSettings) {
			return function(oEvent) {
				var sType = oEvent.getParameter("type");
				// This is the only type where we can distinguish adding tokens with a binding or not
				if (sType === Tokenizer.TokenChangeType.Removed ||
					sType === Tokenizer.TokenChangeType.RemovedAll ||
					(sType === Tokenizer.TokenChangeType.Added && !oEvent.getParameter("token").bApplicationCreated)) {
					return;
				}

				var aAddedToken = oEvent.getParameter("addedTokens") || [oEvent.getParameter("token")] || [];
				var aRemovedToken = oEvent.getParameter("removedTokens") || [];

				var oObject = this.getObjectModel();
				aAddedToken.forEach(function(oToken) {
					var oNewChild = {};
					var vKey = oToken.getKey();
					try {
						vKey = parseInt(oToken.getKey(), 10);
					} catch (e) {
						// Never mind, then there is no int
					}
					oNewChild[mSettings.token.key] = vKey;
					oNewChild[mSettings.token.text] = oToken.getText();

					var sAccessorName = "add" + mSettings.childNodeNameSingular;
					var oMessage;
					if (oObject[sAccessorName]) {
						oMessage = oObject[sAccessorName].apply(oObject, [oNewChild]);
					} else {
						oMessage = oObject.addChild(oNewChild, mSettings.childNodeName);
					}

					if (oMessage && oMessage.type === MessageType.Error) {
						oToken.destroy();
					}
				});

				aRemovedToken.forEach(function(oToken) {
					// sometimes in mobile UI5 sends nested arrays for that event
					// in which we are  not interested
					if (!oToken.getBindingContext) {
						return;
					}

					var oBindingContext = oToken.getBindingContext("object");
					if (!oBindingContext) {
						// Nothing to do in the model
						return;
					}

					var oChild = oBindingContext.getObject();
					oObject.removeChild(oChild);
				});
			};
		}
	});
});