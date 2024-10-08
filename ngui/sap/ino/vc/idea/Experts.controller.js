sap.ui.define([
    "sap/ino/vc/commons/BaseObjectController",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/application/Configuration",
    "sap/ino/commons/models/object/User",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/Device",
    "sap/ui/core/ListItem",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ino/vc/idea/mixins/AddExpertFromClipboardMixin"
], function(BaseController, JSONModel, Configuration, User, Filter, FilterOperator, Device, ListItem, MessageToast, MessageBox,
	AddExpertFromClipboardMixin) {
	"use strict";

	return BaseController.extend("sap.ino.vc.idea.Experts", jQuery.extend({}, AddExpertFromClipboardMixin, {

		view: {
			IDEACARD_SECTION_VISIBLE: 'STAT', // used in ExpertDetails.fragment.xml
			CLIPBOARD_ITEM_SELECT_COUNTER: 0, // used to refresh data bindings
			IS_EVALUATION_REQUEST: false // used to distinguish whether in evaluation request dialog or idea detail page
		},

		aSelectedExperts: [],

		onInit: function() {
			BaseController.prototype.onInit.apply(this, arguments);
			this.getView().setModel(new JSONModel(this.view), "view");
		},

		onBeforeRendering: function() {
			var that = this;
			var oView = this.getView();
			var iIdeaId;
			if (this.getObjectModel() && this.getObjectModel().getData().hasOwnProperty("IDEA_ID")) {
				this.setViewProperty("/IS_EVALUATION_REQUEST", true);
				iIdeaId = this.getObjectModel() && this.getObjectModel().getData().IDEA_ID;
			} else {
				this.setViewProperty("/IS_EVALUATION_REQUEST", false);
				iIdeaId = this.getObjectModel() && this.getObjectModel().getKey();
			}

			if (!this._iIdeaId || this._iIdeaId !== iIdeaId) {
				this._iIdeaId = iIdeaId;
				// proposed idea experts (community)
				var oProposedExperts = new JSONModel(Configuration.getIdeaExpertsByIdeaURL(iIdeaId));
				oView.setModel(oProposedExperts, "proposedExperts");
			}

			if (!this.getViewProperty("/IS_EVALUATION_REQUEST")) {
				this.getObjectModel().read("/Experts", {
					success: function() {
						var oBindingInfo = that.byId("ideaExperts").getBindingInfo("content");
						that.byId("ideaExperts").unbindAggregation("content");
						that.byId("ideaExperts").bindAggregation("content", oBindingInfo);
					}
				});
			}
		},

		onExpertExpand: function(oEvent) {
			var oItem = oEvent.getSource().getParent(); // selected List Item
			oItem.toggleStyleClass("sapInoIdeaExpertItemSelected");
		},

		onOpenIdea: function(oEvent) {
			if (Device.system.phone) {
				this.getView().getParent().close();
			}
			var oContext = oEvent.getSource().getBindingContext("proposedExperts");
			var iIdeaId = oContext.getProperty("IDEA/ID");
			if (iIdeaId) {
				this.navigateTo("idea-display", {
					id: iIdeaId
				});
			}
		},

		onSuggestIdeaExpert: function(oEvent) {
			var oControl = oEvent.getSource();
			var sValue = oEvent.getParameter("suggestValue");
			var oTemplate = new ListItem({
				text: "{data>NAME}",
				additionalText: "{data>USER_NAME}",
				key: "{data>ID}"
			});
			var sSuggestPath = "/SearchIdentity(searchToken='" + jQuery.sap.encodeURL(sValue) + "')/Results";

			var oFilter = this._getSuggestExpertFilter();

			if (Device.system.desktop) {
				oControl.bindAggregation("suggestionItems", {
					path: "data>" + sSuggestPath,
					template: oTemplate,
					filters: oFilter,
					parameters: {
						select: "searchToken,ID,NAME,USER_NAME"
					}
				});
			} else { // tablet or smartphone - workaround for loosing focus on tablets
				oControl._bBindingUpdated = true;
				oControl.getModel("data").read(sSuggestPath, {
					filters: oFilter,
					success: function(oData) {
						oControl.removeAllSuggestionItems();
						// we cannot set all items at once, therefore we use 
						// 0..n-1 addAggregation w/o list update
						// n addSuggestionItem which triggers a list refresh
						for (var ii = 0; ii < oData.results.length - 1; ii++) {
							oControl.addAggregation("suggestionItems", new ListItem({
								key: oData.results[ii].ID,
								text: oData.results[ii].NAME,
								additionalText: oData.results[ii].USER_NAME
							}), true);
						}
						if (oData.results.length > 0) {
							oControl.addSuggestionItem(new ListItem({
								key: oData.results[oData.results.length - 1].ID,
								text: oData.results[oData.results.length - 1].NAME,
								additionalText: oData.results[oData.results.length - 1].USER_NAME
							}));
						}
					}
				});
			}

			this.aSelectedExperts = [];
		},

		_getSuggestExpertFilter: function() {
			var aFilter = [];
			var aContributors = this.getObjectModel().getProperty("/SubmitterContributorsCoach");
			jQuery.each(aContributors, function(i, oContributor) {
				if (oContributor.ROLE_CODE === "IDEA_SUBMITTER" || oContributor.ROLE_CODE === "IDEA_CONTRIBUTOR") {
					var oFilter = new Filter({
						path: "ID",
						operator: FilterOperator.NE,
						value1: oContributor.IDENTITY_ID
					});
					aFilter.push(oFilter);
				}
			});
			return (aFilter.length === 0) ? [] : [new Filter(aFilter, true)];
		},

		onAddInputExpert: function(oEvent) {
			var oInputSuggestUsers = this.byId("suggestUser");
			var oSelectedItem = oEvent.getParameters().selectedItem;
			if (!oSelectedItem) {
				var aResult = jQuery.grep(oInputSuggestUsers.getSuggestionItems(), function(oSuggestionItem) {
					return oSuggestionItem.getText() === oInputSuggestUsers.getValue();
				});
				if (aResult.length > 0) {
					oSelectedItem = aResult[0];
				}
			}
			if (oSelectedItem) {
				var iExpertId = oSelectedItem && parseInt(oSelectedItem.getKey(), 10);
				this.openAddExpertDialog(iExpertId);
			}
			oInputSuggestUsers.setValue("");
			oInputSuggestUsers.focus();
		},

		onAddInputExpertForDialog: function(oEvent) {
			var oSelectedItem = oEvent.getParameters().selectedItem;
			if (oSelectedItem) {
				var iExpertId = oSelectedItem && parseInt(oSelectedItem.getKey(), 10);
				var sExpertName = oSelectedItem.getText();
				var aExpert = [{
					IDENTITY_ID: iExpertId,
					NAME: sExpertName
				}];
				this._addExpert(aExpert, sExpertName);
			}
		},

		getAddExpertDialog: function() {
			if (!this._oAddExpertDialog) {
				this._oAddExpertDialog = this.createFragment("sap.ino.vc.idea.fragments.AddExpert");
				this.getView().addDependent(this._oAddExpertDialog);
			}
			return this._oAddExpertDialog;
		},

		openAddExpertDialog: function(iExpertId) {
			var sEntityPath = "data>/Identity(" + iExpertId + ")";
			var oDialog = this.getAddExpertDialog();
			oDialog.bindElement({
				path: sEntityPath
			});
			oDialog.open();
		},

		onAddExpertDialogOK: function() {
			var oContext = this.getAddExpertDialog().getBindingContext("data");
			var iExpertId = oContext.getProperty("ID");
			var aExpert = [{
				IDENTITY_ID: iExpertId
				}];
			this._addExpert(aExpert, oContext.getProperty("NAME"));
			var oDialog = this.getAddExpertDialog();
			oDialog.close();
		},

		onAddExpertDialogCancel: function() {
			var oDialog = this.getAddExpertDialog();
			oDialog.close();
		},

		onAddRemoveExpert: function(oEvent) {
			var sAction = oEvent.getParameter("action");
			var iExpertId = oEvent.getParameter("identityId");
			var sExpertName = oEvent.getParameter("userName");
			var aExpert = [{
				IDENTITY_ID: iExpertId
			}];
			switch (sAction) {
				case "add":
					this.openAddExpertDialog(iExpertId);
					break;
				case "remove":
					this._removeExpert(aExpert, sExpertName);
					break;
				default:
					break;

			}
		},

		onAddRemoveExpertForDialog: function(oEvent) {
			var sAction = oEvent.getParameter("action");
			var iExpertId = oEvent.getParameter("identityId");
			var sExpertName = oEvent.getParameter("userName");
			var aExpert = [{
				IDENTITY_ID: iExpertId,
				NAME: sExpertName
			}];
			switch (sAction) {
				case "add":
					this._addExpert(aExpert);
					break;
				case "remove":
					this._removeExpert(aExpert);
					break;
				default:
					break;
			}
		},

		onTokenDelete: function(oEvent) {
			var oToken = oEvent.getSource();
			var iExpertId = Number(oToken.getKey());
			var aExpert = [{
				IDENTITY_ID: iExpertId
			}];
			this._removeExpert(aExpert);
		},

		isExpertActionable: function(iExpertId, bPrivilege, aIdeaExperts) {
			bPrivilege = bPrivilege || this.getObjectModel().getProperty("/property/nodes/Root/customProperties/backofficeChangeExpertPrivilege");
			aIdeaExperts = aIdeaExperts || this.getObjectModel().getProperty("/Experts");
			var aContributors = this.getObjectModel().getProperty("/SubmitterContributorsCoach");
			return !!(bPrivilege && aIdeaExperts && jQuery.isArray(aIdeaExperts) &&
				jQuery.grep(aIdeaExperts, function(o) {
					return o.IDENTITY_ID === iExpertId;
				}).length === 0 &&
				jQuery.grep(aContributors, function(o) {
					return (o.ROLE_CODE === "IDEA_SUBMITTER" || o.ROLE_CODE === "IDEA_CONTRIBUTOR") && o.IDENTITY_ID === iExpertId;
				}).length === 0);
		},

		isExpertAddedForDialog: function(iExpertId, aExperts) {
			aExperts = aExperts || this.getObjectModel().getProperty("/Experts") || [];
			return !!(jQuery.isArray(aExperts) &&
				jQuery.grep(aExperts, function(o) {
					return o.IDENTITY_ID === iExpertId;
				}).length === 0);
		},

		respExpertsFormatter: function(txt, val) {
			return jQuery.sap.formatMessage(txt, val || "");
		},

		// 		_addExpert: function(iExpertId, sExpertName) {
		// 			var that = this;
		// 			var oModel = this.getObjectModel();
		// 			var oNewExpert = {
		// 				IDENTITY_ID: iExpertId,
		// 				NAME: sExpertName
		// 			};
		// 			if (this.getViewProperty("/IS_EVALUATION_REQUEST")) {
		// 				oModel.addExpert(oNewExpert);
		// 			} else {
		// 				var oParameters = {
		// 					IDENTITY_ID: iExpertId
		// 				};
		// 				var oMessages = {
		// 					success: function() {
		// 						return that.getText("IDEA_OBJECT_MSG_EXPERT_ASSIGNED_SUCCESS", [sExpertName]);
		// 					},
		// 					error: function() {
		// 						return that.getText("IDEA_OBJECT_MSG_EXPERT_ASSIGNED_ERROR", [sExpertName]);
		// 					}
		// 				};
		// 				var oOptions = {
		// 					parameters: oParameters,
		// 					messages: oMessages,
		// 					staticparameters: undefined
		// 				};
		// 				var oActionPromise = BaseController.prototype.executeObjectAction.call(this, oModel, 'addExpert', oOptions);
		// 				return oActionPromise;
		// 			}
		// 		},

		// 		_removeExpert: function(iExpertId) {
		// 			var that = this;
		// 			var oModel = this.getObjectModel();

		// 			if (this.getViewProperty("/IS_EVALUATION_REQUEST")) {
		// 				oModel = this.getObjectModel();
		// 				oModel.removeExpert(iExpertId);
		// 			} else {
		// 				MessageBox.confirm(this.getText("MSG_DEL_CONFIRM"), {
		// 					onClose: function(sDialogAction) {
		// 						if (sDialogAction !== MessageBox.Action.OK) {
		// 							return;
		// 						} else {
		// 							var oMessage = oModel.removeExpert(iExpertId);
		// 							if (oMessage) {
		// 								MessageToast.show(that.getText("EXPERTS_MSG_UPDATE_FAILED"));
		// 							} else {
		// 								var oPromise = oModel.modify();
		// 								oPromise.fail(function() {
		// 									MessageToast.show(that.getText("EXPERTS_MSG_UPDATE_FAILED"));
		// 								});
		// 							}
		// 						}
		// 					}
		// 				});
		// 			}
		// 		}

	}));
});