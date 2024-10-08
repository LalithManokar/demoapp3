sap.ui.define([
    "sap/ino/vc/idea/mixins/BaseActionMixin",
    "sap/ino/vc/commons/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/models/object/Idea",
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast",
    "sap/ui/Device",
    "sap/ui/core/ListItem",
    "sap/m/Token",
    "sap/ino/commons/models/object/User",
    "sap/ui/core/MessageType",
    "sap/ui/core/message/Message",
    "sap/m/MessageBox",
    "sap/ino/commons/application/Configuration"
], function(BaseActionMixin, BaseController, JSONModel, Idea, PropertyModel, Filter, FilterOperator, Sorter, MessageToast, Device, ListItem,
	Token, User, MessageType, Message, MessageBox, Configuration) {
	"use strict";

	/**
	 * Assignment Action - handles Assign Coach, Assign Me as Coach and Unassign Coach actions both for single ideas and mass actions
	 */
	var AssignmentActionMixin = jQuery.extend({}, BaseActionMixin);

	AssignmentActionMixin._openAssignmentActionSheet = function(oSource, sContext) {
		if (!this._oAssignActionSheet) {
			this._oAssignActionSheet = this.createFragment("sap.ino.vc.idea.fragments.AssignmentActionSheet", this.getView().getId());
			this.getView().addDependent(this._oAssignActionSheet);
		}
		this._oAssignActionSheet.data("context", sContext || "single");
		jQuery.sap.delayedCall(0, this, function() {
			this._oAssignActionSheet.openBy(oSource);
		});

	};

	/**
	 * Event handler: opens Assignment Action sheet for mass operations with assignment options and prepare the internal private model
	 *
	 * @param {Event} oEvent the event
	 * @return {undefined} Nothing
	 */
	AssignmentActionMixin.onMassAssignGeneral = function(oEvent) {
		var oSource = oEvent.getSource();
		if (this.getModel("assignment")) {
			this.getModel("assignment").destroy();
		}
		// preparing the model based on BaseActionMixin's aggregation function
		var oModel = new JSONModel();
		this.setModel(oModel, "assignment");
		var oAggregatedActions = this._computeActionAggregations();
		// mock property model structure for actions
		var _checkActionIsEnabled = function(bValue) {
			return !!bValue;
		};
		// 		var aAuthors = [];
		// 		jQuery.each(this._oSelectionMap, function(iIndex, oIdea) {
		// 	        var aAuthorList = oIdea.Authors.__list;
		// 	        jQuery.each(aAuthorList, function(iIndex, oAuthor){
		// 	            var sAuthor = Number(oAuthor.substr(oAuthor.indexOf("IDENTITY_ID=") + 12).replace(")", ""));
		// 	            if(aAuthors.indexOf(sAuthor) === -1){
		// 	                aAuthors.push(sAuthor);
		// 	            }
		// 	        });
		// 		});
		var oProps = {
			actions: {
				assignToMe: {
					enabled: oAggregatedActions.assignToMe.every(_checkActionIsEnabled)
				},
				assignCoach: {
					enabled: oAggregatedActions.assignCoach.every(_checkActionIsEnabled) && oAggregatedActions.campaigns.length === 1
				},
				unassignCoach: {
					enabled: oAggregatedActions.unassignCoach.every(_checkActionIsEnabled)
				},
				addExpert: {
					enabled: oAggregatedActions.addExpert.every(_checkActionIsEnabled)
				},
				assignTag: {
					enabled: oAggregatedActions.assignTag.every(_checkActionIsEnabled)
				},
				reassignCampaign: {
					enabled: oAggregatedActions.reassignCampaign.every(_checkActionIsEnabled) && oAggregatedActions.campaigns.length === 1
				}
			}
		};
		oModel.setProperty("/property", oProps);
		oModel.setProperty("/IDS", oAggregatedActions.ideas);
		oModel.setProperty("/CAMPAIGN_IDS", oAggregatedActions.campaigns);
		oModel.setProperty("/CAMPAIGN_ID", oAggregatedActions.campaigns[0]);
		oModel.setProperty("/RESP_VALUE_CODES", oAggregatedActions.respValueCode);
		// 		oModel.setProperty("/AUTHORS", aAuthors);
		oModel.setProperty("/UNASSIGN_IDS", jQuery.map(this._oSelectionMap, function(oIdea) {
				return oIdea.property.actions.unassignCoach.enabled ? oIdea.ID : null;
			})
			.filter(function(oValue) {
				return !!oValue;
			}));
		oModel.setProperty("/ASSIGNME_IDS", jQuery.map(this._oSelectionMap, function(oIdea) {
				return oIdea.property.actions.assignToMe.enabled ? oIdea.ID : null;
			})
			.filter(function(oValue) {
				return !!oValue;
			}));
		if (this.hasOwnProperty("_CampaignId")) {
			this.setViewProperty("/IS_CAMPAIGN_IDEA_LIST", true);
		} else {
			this.setViewProperty("/IS_CAMPAIGN_IDEA_LIST", false);
		}
		this.setViewProperty("/IS_DIALOG", true);
		this._openAssignmentActionSheet(oSource, "mass");
	};

	/**
	 * Event handler: Opens Assignment Action sheet with assignment options and prepare the internal private model
	 *
	 * @param {Event} oEvent the event
	 **/
	AssignmentActionMixin.onAssignGeneral = function(oEvent) {
		var oSource = oEvent.getSource();
		var that = this;

		this.saveCurrentFocusBeforeActionDialogOpen();

		// in case we are called within idea list, we have to re-create the actionsheet in order to compute visibility again
		if (!this.isActionContextSingleIdeaDisplay() && this._oAssignActionSheet) {
			//this._oAssignActionSheet.destroy();
			//delete this._oAssignActionSheet;
		}
		if (!this.isActionContextSingleIdeaDisplay()) {
			if (this.getModel("assignment")) {
				this.getModel("assignment").destroy();
			}
			// create new private Idea model copy if in list context
			this.setModel(new JSONModel(), "assignment");
			var iIdeaId = oSource.getBindingContext("data").getProperty("ID");
			var oSettings = {
				actions: ["assignCoach", "assignToMe", "unassignCoach", "addExpert", "assignTag", "reassignCampaign"]
			};
			var oProp = new PropertyModel("sap.ino.xs.object.idea.Idea", iIdeaId, oSettings, false, function(oPropertyEvent) {
				var oPropData = oPropertyEvent.getSource().getData();
				that.getModel("assignment").setProperty("/property", oPropData);
				that._openAssignmentActionSheet(oSource, "single");
			});
			this.getModel("assignment").setData(oSource.getBindingContext("data").getObject());

			// 			var aAuthors = [];
			//     		jQuery.each(this.getModel("assignment").getProperty("/Authors").__list, function(iIndex, oAuthor) {
			//     	        var sAuthor = Number(oAuthor.substr(oAuthor.indexOf("IDENTITY_ID=") + 12).replace(")", ""));
			// 	            if(aAuthors.indexOf(sAuthor) === -1){
			// 	                aAuthors.push(sAuthor);
			// 	            }
			//     		});
			//     		this.getModel("assignment").setProperty("/AUTHORS", aAuthors);
		} else {
			// just reference current object model
			this.setModel(this.getObjectModel(), "assignment");
			this._openAssignmentActionSheet(oSource, "single");
		}

	};

	/**
	 * executes an assignment action (call to backend)
	 *
	 * @param {string}      sActionName     the name of the action to execute
	 * @param {int|int[]}   vIdeaID         either a single idea ID or an array of idea IDs for mass actions
	 * @param {object}      oParameters     parameter map to hand on to action - in case of mass actions, "keys" parameter is automatically bound
	 * @param {object}      oMessages       message object (with success, error, confirm keys)
	 */
	AssignmentActionMixin._executeAssignAction = function(sActionName, vIdeaID, oParameters, oMessages, oAssignmentDialog) {
		var bIsMassAction = Array.isArray(vIdeaID);
		var oIdeaModel = this.isActionContextSingleIdeaDisplay() ? this.getObjectModel() : Idea;
		var oOptions = {
			parameters: oParameters,
			messages: oMessages,
			staticparameters: this.isActionContextSingleIdeaDisplay() || bIsMassAction ? undefined : vIdeaID //undefine: for model instance, vIdeaID: for model static method
		};
		var oDialog = oAssignmentDialog;
		if (bIsMassAction) {
			oOptions.parameters.keys = vIdeaID;
		}

		oDialog.setBusy(true);
		var that = this;
		var oActionPromise = BaseController.prototype.executeObjectAction.call(this, oIdeaModel, sActionName, oOptions);
		oActionPromise.always(function() {
			oDialog.setBusy(false);
		}).done(function() {
			// clean up different mass action states
			//oScrollbar._scrollTo(iLeft,iTop,0);
			that.resetActionState(bIsMassAction);
			that.restoreFocusAfterActionDialogClose();
			if (that.bindList) {
				that.bindList();
			}
		});
		return oActionPromise;
	};

	/**
	 * executes an "assignCoach" action on one or multiple ideas
	 *
	 * @param {int|int[]}   vIdeaID                 either a single idea ID or an array of idea IDs for mass actions
	 * @param {int}         iAssignedIdentityID     Coach's Identity ID to be assigned
	 * @param {string}      sCoachName              Coach's full name
	 * @param {int}         iCampaignId             The affected idea's campaign id
	 */
	AssignmentActionMixin._executeAssignCoachAction = function(vIdeaID, iAssignedIdentityID, sCoachName, iCampaignId) {
		var that = this;
		var oParameters = {
			IDENTITY_ID: iAssignedIdentityID,
			CAMPAIGN_ID: iCampaignId
		};
		var sActionName = Array.isArray(vIdeaID) ? "massAssignCoach" : "assignCoach";
		var oMessages = {
			success: function() {
				return that.getText("IDEA_OBJECT_MSG_COACH_ASSIGNED_SUCCESS", [sCoachName]);
			},
			error: function() {
				return that.getText("IDEA_OBJECT_MSG_COACH_ASSIGNED_ERROR", [sCoachName]);
			}
		};
		return this._executeAssignAction(sActionName, vIdeaID, oParameters, oMessages, this._getAssignCoachDialog());
	};

	AssignmentActionMixin._executeAssignExpertAction = function(vIdeaID, aAssignedIdentityID, sExpertName) {
		var that = this;
		var oParameters = {};
		var sActionName = Array.isArray(vIdeaID) ? "massAddExpert" : "addExpert";
		var oMessages = {
			success: function() {
				return that.getText("IDEA_OBJECT_MSG_EXPERT_ASSIGNED_SUCCESS", [sExpertName]);
			},
			error: function() {
				return that.getText("IDEA_OBJECT_MSG_EXPERT_ASSIGNED_ERROR", [sExpertName]);
			}
		};
		oParameters.Experts = aAssignedIdentityID;

		return this._executeAssignAction(sActionName, vIdeaID, oParameters, oMessages, this._getAssignExpertDialog());
	};

	/**
	 * executes an "unassignCoach" action on one or multiple ideas
	 *
	 * @param {int|int[]}   vIdeaID                 either a single idea ID or an array of idea IDs for mass actions
	 * @param {string}      sCoachName              Coach's full name
	 * @param {int}         iCampaignId             The affected idea's campaign id
	 */
	AssignmentActionMixin._executeUnassignCoachAction = function(vIdeaID, sCoachName, iCampaignId) {
		var that = this;
		var oParameters = {
			CAMPAIGN_ID: iCampaignId
		};
		var bIsMassAction = Array.isArray(vIdeaID);
		var sActionName = bIsMassAction ? "massUnassignCoach" : "unassignCoach";
		var oMessages = {
			success: function() {
				return that.getText(bIsMassAction ? "IDEA_OBJECT_MSG_COACH_UNASSIGNED_MASS_SUCCESS" : "IDEA_OBJECT_MSG_COACH_UNASSIGNED_SUCCESS", [
					sCoachName]);
			},
			error: function() {
				return that.getText(bIsMassAction ? "IDEA_OBJECT_MSG_COACH_UNASSIGNED_MASS_ERROR" : "IDEA_OBJECT_MSG_COACH_UNASSIGNED_ERROR", [
					sCoachName]);
			}
		};
		return this._executeAssignAction(sActionName, vIdeaID, oParameters, oMessages, this._getAssignCoachDialog());
	};

	AssignmentActionMixin._getAssignCoachDialog = function() {
		var oDialog = this._oAssignCoachDialog;
		if (!oDialog) {
			var _enhanceDialog = function(oSelectDialog) {
				oSelectDialog._oList.setMode("SingleSelectLeft");
				// remove default handler for single row selection change
				oSelectDialog._oList.mEventRegistry.selectionChange = [];
				//oSelectDialog._oDialog.setBeginButton(oSelectDialog._getOkButton());
				oSelectDialog._oDialog.setEndButton(oSelectDialog._getCancelButton());
			};
			oDialog = this.createFragment("sap.ino.vc.idea.fragments.AssignCoach", this.getView().getId());
			this.getView().addDependent(oDialog);
			this._oAssignCoachDialog = oDialog;
			_enhanceDialog(this._oAssignCoachDialog);
		}
		return oDialog;
	};

	AssignmentActionMixin._getAssignExpertDialog = function() {
		var that = this;
		var oDialog = this._oAssignExpertDialog;
		if (!oDialog) {
			oDialog = this.createFragment("sap.ino.vc.idea.fragments.AssignExpert", this.getView().getId());
			this.getView().addDependent(oDialog);
			this._oAssignExpertDialog = oDialog;
			// 			oDialog._dialog.removeAllButtons();
			// 			oDialog._dialog.setBeginButton(new sap.m.Button({
			// 				text: "{i18n>BTN_ADD_FROM_CLIPBOARD}",
			// 				press: [that.onAddFromClipboard, that],
			// 				visible: "{=!${device>/system/phone}}",
			// 				enabled: {
			// 					parts: [{
			// 						path: 'clipboard>/changed',
			// 						type: null
			// 					}],
			// 					formatter: function() {
			// 						var oClipboardModel = that.getModel("clipboard");
			// 						return oClipboardModel ? oClipboardModel.getProperty("/enabled") && !oClipboardModel.isClipboardEmpty(User) : false;
			// 					}
			// 				}
			// 			}));
			// 			oDialog._dialog.setEndButton(oDialog._getCancelButton());
			oDialog._dialog.addButton(new sap.m.Button({
				text: "{i18n>BTN_ADD_FROM_CLIPBOARD}",
				press: [that.onAddFromClipboard, that],
				visible: "{=!${device>/system/phone}}",
				enabled: {
					parts: [{
						path: 'clipboard>/changed',
						type: null
					}],
					formatter: function() {
						var oClipboardModel = that.getModel("clipboard");
						return oClipboardModel ? oClipboardModel.getProperty("/enabled") && !oClipboardModel.isClipboardEmpty(User) : false;
					}
				}
			}));
			oDialog._dialog.addButton(oDialog._getOkButton());
			oDialog._dialog.addButton(oDialog._getCancelButton());
		}
		return oDialog;
	};

	AssignmentActionMixin._getAssignTagDialog = function() {
		var oDialog = this._oAssignTagDialog;
		if (!oDialog) {
			oDialog = this.createFragment("sap.ino.vc.idea.fragments.AssignTag", this.getView().getId());
			this.getView().addDependent(oDialog);
			this._oAssignTagDialog = oDialog;
		}
		return oDialog;
	};

	AssignmentActionMixin._getReassignCampaignDialog = function() {
		var oDialog = this._oReassignCampaignDialog;
		if (!oDialog) {
			oDialog = this.createFragment("sap.ino.vc.idea.fragments.ReassignCampaign", this.getView().getId());
			this.getView().addDependent(oDialog);
			this._oReassignCampaignDialog = oDialog;
		}
		return oDialog;
	};

	/**
	 * binds the coach list to the SelectDialog's results according to the search term
	 *
	 * @param {string}  sSearchTerm         the search/filter term
	 * @param {int}     iCampaignId         the campaign's ID on which coaches to execute the search
	 * @param {string}  (sActionContext)    the context of the binding - if given, custom data "context" is set with this value.
	 *                                      This is for differentiating, whether the coach assignment was triggered for one or
	 *                                      multiple ideas.
	 */
	AssignmentActionMixin._bindAssignCoachList = function(sSearchTerm, iCampaignId, sActionContext) {
		var oDialog = this._getAssignCoachDialog();
		// we add custom data to preserve context of caller
		if (sActionContext) {
			oDialog.data("context", sActionContext);
		}
		oDialog.bindAggregation("items", {
			path: "data>/SearchCoach(searchToken='" + jQuery.sap.encodeURL(sSearchTerm || '*') + "')/Results",
			filters: [new Filter({
				path: "CAMPAIGN_ID",
				operator: FilterOperator.EQ,
				value1: iCampaignId
			})],
			sorter: new Sorter("NAME"),
			template: oDialog.getBindingInfo("items").template
		});
		return oDialog;
	};

	AssignmentActionMixin._bindAssignRespCoachList = function(sSearchTerm, sRespValueCode, iCampaignId, sActionContext) {
		var oDialog = this._getAssignCoachDialog();
		// we add custom data to preserve context of caller
		if (sActionContext) {
			oDialog.data("context", sActionContext);
		}
		oDialog.bindAggregation("items", {
			path: "data>/SearchCoach(searchToken='" + jQuery.sap.encodeURL(sSearchTerm || '*') + "')/Results",
			filters: new Filter({
				filters: [new Filter({
					path: "RESP_VALUE_CODE",
					operator: FilterOperator.EQ,
					value1: sRespValueCode
				}), new Filter({
					path: "CAMPAIGN_ID",
					operator: FilterOperator.EQ,
					value1: iCampaignId
				})],
				and: false
			}),
			sorter: new Sorter("NAME"),
			factory: function() {

			},
			template: oDialog.getBindingInfo("items").template
		});
		return oDialog;
	};
	AssignmentActionMixin.formatIdentityCardShow = function(iIdentityId) {
		var aBindedItems = this.byId("assignCoachDialog").getItems();
		for (var i = 0; i < aBindedItems.length - 1; i++) {
			var oldId = aBindedItems[i].getContent()[0].getProperty("identityId");
			if (oldId === iIdentityId) {
				return false;
			}
		}
		return true;
	};
	AssignmentActionMixin._bindAssignExpertList = function(sSearchTerm, vIdeaID) {
		var oDialog = this._getAssignExpertDialog();
		vIdeaID = Array.isArray(vIdeaID) ? vIdeaID : [vIdeaID];
		// 		var oFilter = [];
		// 		var aAuthors = [];
		// 		aAuthors = this.getModel("assignment").getProperty("/AUTHORS");
		// 	    jQuery.each(aAuthors, function(i, oAuthor){
		// 	        oFilter.push(new Filter({
		// 		        path: "ID",
		// 		        operator: FilterOperator.NE,
		// 				value1: oAuthor
		// 		    }));
		// 	    });

		oDialog.bindAggregation("items", {
			path: "data>/SearchProposedExpertParams(searchToken='" + jQuery.sap.encodeURL(sSearchTerm || '*') + "',ideasToken='" + vIdeaID.join(
				",") + "')/Results",
			sorter: new Sorter("NAME"),
			// 			filters: [new Filter({
			// 				filters: oFilter,
			// 				and: true
			// 			})],
			template: oDialog.getBindingInfo("items").template
		});
		return oDialog;
	};

	/**
	 * search event - rebinds search results to SelectDialog's result list
	 *
	 * @param {Event}   oEvent
	 */
	AssignmentActionMixin.onAssignCoachSearch = function(oEvent) {
		var sSearchTerm = oEvent.getParameter("value") || "*";
		var iCampaignId = this.getModel("assignment").getProperty("/CAMPAIGN_ID");
		var aRespValueCodes = this.getModel("assignment").getProperty("/RESP_VALUE_CODES");
		if (this.getModel("assignment").getProperty("/RESP_VALUE_CODE") || (aRespValueCodes && aRespValueCodes.length ===
			1 && aRespValueCodes[0] !== null)) {
			var sRespValueCode = this.getModel("assignment").getProperty("/RESP_VALUE_CODE");
			if (!sRespValueCode) {
				sRespValueCode = aRespValueCodes[0];
			}
			this._bindAssignRespCoachList(sSearchTerm, sRespValueCode, iCampaignId);
		} else {
			this._bindAssignCoachList(sSearchTerm, iCampaignId);
		}
	};

	AssignmentActionMixin.onAssignExpertSearch = function(oEvent) {
		var sSearchTerm = oEvent.getParameter("value") || "*";
		var oDialog = this._getAssignExpertDialog();
		var vIdeaID;
		if (oDialog.data("context") === "mass") {
			vIdeaID = this.getModel("assignment").getProperty("/IDS");
		} else {
			vIdeaID = this.getModel("assignment").getProperty("/ID");
		}
		this._bindAssignExpertList(sSearchTerm, vIdeaID);
	};

	/**
	 * selection event - triggered when a coach is selected for assignment
	 *
	 * Note: this needs to trigger both mass and single idea actions due to re-use of the
	 * coach selection dialog.
	 *
	 * @param {Event}   oEvent
	 */
	AssignmentActionMixin.onAssignCoachDialogOK = function(oEvent) {
		var oSelected = oEvent.getParameter("selectedItem");
		var oSource = oEvent.getSource();
		if (oSelected) {
			var oBindingContext = oSelected.getBindingContext("data");
			if (oBindingContext) {
				var iIdentityID = oBindingContext.getProperty("ID");
				var sCoachName = oBindingContext.getProperty("NAME");
				var iCampaignId = this.getModel("assignment").getProperty("/CAMPAIGN_ID");
				var vIdeaID;
				// we need to differentiate whether we are in mass or single idea context
				if (oSource.data("context") === "mass") {
					vIdeaID = this.getModel("assignment").getProperty("/IDS");
				} else {
					vIdeaID = this.getModel("assignment").getProperty("/ID");
				}
				this._executeAssignCoachAction(vIdeaID, iIdentityID, sCoachName, iCampaignId);
			}
		}
	};

	AssignmentActionMixin.onAssignExpertDialogOK = function(oEvent) {
		var aSelected = oEvent.getParameter("selectedItems");
		var oSource = oEvent.getSource();
		var aIdentityID = [];
		var aExpertName = [];
		if (aSelected.length) {
			jQuery.each(aSelected, function(i, item) {
				var oBindingContext = item.getBindingContext("data");
				if (oBindingContext) {
					var iIdentityID = oBindingContext.getProperty("ID");
					var sExpertName = oBindingContext.getProperty("NAME");
					aIdentityID.push({
						IDENTITY_ID: iIdentityID
					});
					aExpertName.push(sExpertName);
				}
			});
			var vIdeaID;
			// we need to differentiate whether we are in mass or single idea context
			if (oSource.data("context") === "mass") {
				vIdeaID = this.getModel("assignment").getProperty("/IDS");
			} else {
				vIdeaID = this.getModel("assignment").getProperty("/ID");
			}
			this._executeAssignExpertAction(vIdeaID, aIdentityID, aExpertName.join(","));
		}
	};

	/**
	 * event for coach assignment
	 *
	 * @param {Event}   oEvent
	 */
	AssignmentActionMixin.onAssignCoach = function(oEvent) {
		var sContext = oEvent.getSource().getParent().data("context");
		var iCampaignId = this.getModel("assignment").getProperty("/CAMPAIGN_ID");
		var aRespValueCodes = this.getModel("assignment").getProperty("/RESP_VALUE_CODES");
		if (this.getModel("assignment").getProperty("/RESP_VALUE_CODE") || (aRespValueCodes && aRespValueCodes.length ===
			1 && aRespValueCodes[0] !== null)) {
			var sRespValueCode = this.getModel("assignment").getProperty("/RESP_VALUE_CODE");
			if (!sRespValueCode) {
				sRespValueCode = aRespValueCodes[0];
			}
			this._bindAssignRespCoachList("*", sRespValueCode, iCampaignId, sContext).open();
		} else {
			this._bindAssignCoachList("*", iCampaignId, sContext).open();
		}
	};

	AssignmentActionMixin.onAssignExperts = function(oEvent) {
		var sContext = oEvent.getSource().getParent().data("context");
		var oDialog = this._getAssignExpertDialog();
		var vIdeaID;
		// we add custom data to preserve context of caller
		if (sContext) {
			oDialog.data("context", sContext);
		}
		if (sContext === "mass") {
			vIdeaID = this.getModel("assignment").getProperty("/IDS");
		} else {
			vIdeaID = this.getModel("assignment").getProperty("/ID");
		}
		this._bindAssignExpertList("*", vIdeaID).open();
	};

	AssignmentActionMixin.onassignTag = function(oEvent) {
		var sContext = oEvent.getSource().getParent().data("context");
		var oDialog = this._getAssignTagDialog();
		// we add custom data to preserve context of caller
		if (sContext) {
			oDialog.data("context", sContext);
		}
		this._INPUT_TAGS_SETTING = {
			suggestion: {
				key: "ID",
				text: "NAME",
				path: "data>/SearchTagsParams(searchToken='$suggestValue')/Results",
				filter: [],
				sorter: []
			},
			token: {
				key: "ID",
				text: "NAME"
			}
		};
		if (this.byId("Tags")) {
			this.addTagMultiInputHandling(this.byId("Tags"), this._INPUT_TAGS_SETTING);
		}
		oDialog.open();
	};

	AssignmentActionMixin.addTagMultiInputHandling = function(oControl, mSettings) {
		if (!oControl) {
			return;
		}

		var fnSuggestHandler = this._createSuggestHandler(mSettings.suggestion);
		oControl.attachSuggest(fnSuggestHandler, this);

		oControl.attachTokenChange(function(oEvent) {
			if (!this._aIgnoreTokenChanges || this._aIgnoreTokenChanges.filter(function(o) {
				return o.id === oEvent.oSource.id;
			}).length === 0) {
				if (oEvent.getParameter("type") === "tokensChanged" && (oEvent.getParameter("addedTokens").length > 0 || oEvent.getParameter(
					"removedTokens").length > 0) && mSettings.tokenChangeCallback) {
					mSettings.tokenChangeCallback.apply(this, [oEvent]);
				}
			}
		}, this);

		if (mSettings.identity) {
			this.setMultiInputContent(oControl, mSettings.identity);
		}
	};
	AssignmentActionMixin._findFilters = function(aKeys, fnGetKey) {
		this._INPUT_TAGS_SETTING.suggestion.filters = undefined;
		if (!aKeys || aKeys.length <= 0) {
			return;
		}

		var aFilters = [];
		jQuery.each(aKeys, function(index, oKey) {
			if (fnGetKey(oKey)) {
				aFilters.push(new sap.ui.model.Filter({
					path: "ID",
					operator: "NE",
					value1: fnGetKey(oKey)
				}));
			}
		});
		if (aFilters.length > 0) {
			this._INPUT_TAGS_SETTING.suggestion.filters = new sap.ui.model.Filter({
				filters: aFilters,
				and: true
			});
		}
	};
	AssignmentActionMixin.onTagValueChanged = function(oEvent) {
		this.resetClientMessages();
		var oMultiInput = oEvent.getSource();
		var sValue = oEvent.getParameter("value");
		if (!sValue) {
			return;
		}
		if (!oEvent.getSource().getAggregation("tokenizer")) {
			return;
		}
		var aTokens = oEvent.getSource().getAggregation("tokenizer").getAggregation("tokens");
		var aTag = sValue.split(",");
		aTag.forEach(function(sTag) {
			sTag = sTag.trim();
			if (sTag === "") {
				return;
			}

			var oToken = new Token({
				text: sTag
			});
			// This is an application internal flag to handle
			// model update correctly
			var bTokenExisted;
			aTokens.forEach(function(oToken) {
				if (oToken.getProperty("text") === sTag) {
					bTokenExisted = true;
					return;
				}
			});
			if (!bTokenExisted) {
				oToken.bApplicationCreated = true;
				oMultiInput.addToken(oToken);
			}
		});
		oMultiInput.setValue("");
	};
	AssignmentActionMixin.onTagChanged = function(oEvent) {
		this.resetClientMessages();
		var oMultiInput = oEvent.getSource();
		//New Added Logic 20170809			
		if (!oEvent.getSource().getAggregation("tokenizer")) {
			return;
		}
		var aTokens = oEvent.getSource().getAggregation("tokenizer").getAggregation("tokens");
		this._findFilters(aTokens, function(oToken) {
			return oToken.getProperty("key");
		});
		oMultiInput.setValue("");
	};

	/****Reassign Campagin********
	Open reassign Dialog and select the corresponding campaign for the mass/single idea ID
	************/
	AssignmentActionMixin.onReassignCampaign = function(oEvent) {
		var sContext = oEvent.getSource().getParent().data("context");
		var oDialog = this._getReassignCampaignDialog();
		if (sContext) {
			oDialog.data("context", sContext);
		}

		var oModel = this.getModel("assignment");
		oModel.setSizeLimit(500);

		var oCampaignCombox = this.byId("reassignCampaignList");
		var oRespList = this.byId("reassignCampaignRespList");
		this.setViewProperty("/DISPLAY_RESP_LIST", false);
		oCampaignCombox.setValue("");
		oRespList.setValue("");
		oDialog.open();
	};
	AssignmentActionMixin.onReassignCampaignDialogOK = function() {
		var that = this;
		var oCampaignCombox = this.byId("reassignCampaignList");
		var oRespList = this.byId("reassignCampaignRespList");
		var oModel = this.getModel("assignment");
		this.resetClientMessages();
		var sCampaignId = oCampaignCombox.getSelectedKey();
		if (this.checkReassignCampaignValidValue(oCampaignCombox, oRespList)) {
			var sOldFormCode = this.getOldCampaignFormCode(oModel);
			var sOldAdminFormCode = this.getOldCampaignAdminFormCode(oModel);
			if (sOldFormCode === oModel.getProperty("/REASSIGN_CAMPAIGN_FORM_CODE") && sOldAdminFormCode === oModel.getProperty(
				"/REASSIGN_CAMPAIGN_ADMIN_FORM_CODE")) { //The same Form Used marked as true
				this.popConfirmMessageBox([], oModel, true);
			} else if (!oModel.getProperty("/REASSIGN_CAMPAIGN_FORM_CODE") && !oModel.getProperty("/REASSIGN_CAMPAIGN_ADMIN_FORM_CODE")) { //Different form but null in the target
				this.popConfirmMessageBox([], oModel, false);
			} else {
				this.getModel("data").read("/CampaignSmall(" + sCampaignId + ")/FormFields", {
					success: function(res) {
						//Get Campaign Admin Form Field
						var aCampaignFormFields = res.results;
						that.getModel("data").read("/CampaignSmall(" + sCampaignId + ")/AdminFormFields", {
							success: function(oData) {
								oData.results.forEach(function(object) {
									object.FORM_TYPE_CODE = "ADMIN_FORM";
								});
								aCampaignFormFields = aCampaignFormFields.concat(oData.results);
								that.popConfirmMessageBox(aCampaignFormFields, oModel, false);
							}
						});

					}
				});
			}
		}

	};
	AssignmentActionMixin.onReassignCampaignDialogSearch = function(oEvent) {
		var sValue = jQuery.sap.encodeURL(oEvent.getParameter("value"));
		var sCampaignId = this.getModel("assignment").getProperty("/CAMPAIGN_ID");
		var oModel = this.getDefaultODataModel ? this.getDefaultODataModel() : this.getModel("data");
		var oViewModel = this.getModel("assignment");
		oModel.read("/CampaignSuggestionParams(searchToken='" + sValue + "',filterName='allCampaignsExceptDraft')/Results", {
			urlParameters: {
				"$orderby": "SHORT_NAME",
				"$filter": "ID ne " + sCampaignId
			},
			success: function(oData) {
				oViewModel.setProperty("/campaignSuggestion", oData.results);
			}
		});
	};

	AssignmentActionMixin.onReassignCampaignDialogItemsSelect = function(oEvent) {
		var that = this;
		var sSelectedKey = oEvent.getParameter("selectedItem").data("ID") + "";
		var oCampaignFilterList = this.byId("reassignCampaignList") || this.getFilterElementById("reassignCampaignList");
		var oCampaignFilterItems = oCampaignFilterList.getSuggestionItems();
		for (var i = 0; i < oCampaignFilterItems.length; i++) {
			if (oCampaignFilterItems[i].getProperty("key") === sSelectedKey) {
				oCampaignFilterList.setSelectionItem(oCampaignFilterItems[i]);
				that.onReassignCampaignChange();
				break;
			}
		}
	};

	AssignmentActionMixin.getOldCampaignAdminFormCode = function(oModel) {
		var oData = this.getModel("data").oData;
		var oDialog = this._getReassignCampaignDialog();
		var sContext = oDialog.data("context");
		var oRegex = /^IdeaMediumBackofficeSearch/igm;
		var sFormCode = null;
		if (sContext === "mass") {
			if (oData) {
				for (var oIdeaMedium in oData) {
					if (oData.hasOwnProperty(oIdeaMedium) && oRegex.exec(oIdeaMedium) && (oData[oIdeaMedium].CAMPAIGN_ID === oModel.getProperty(
						"/CAMPAIGN_ID"))) {
						sFormCode = oData[oIdeaMedium].CAMPAIGN_ADMIN_FORM_CODE;
						break;
					}
				}
				return sFormCode;
			}
		} else {
			return oModel.getProperty("/CAMPAIGN_ADMIN_FORM_CODE");
		}
	};
	AssignmentActionMixin.getOldCampaignFormCode = function(oModel) {
		var oData = this.getModel("data").oData;
		var oDialog = this._getReassignCampaignDialog();
		var sContext = oDialog.data("context");
		var oRegex = /^IdeaMediumBackofficeSearch/igm;
		var sFormCode = null;
		if (sContext === "mass") {
			if (oData) {
				for (var oIdeaMedium in oData) {
					if (oData.hasOwnProperty(oIdeaMedium) && oRegex.exec(oIdeaMedium) && (oData[oIdeaMedium].CAMPAIGN_ID === oModel.getProperty(
						"/CAMPAIGN_ID"))) {
						sFormCode = oData[oIdeaMedium].CAMPAIGN_FORM_CODE;
						break;
					}
				}
				return sFormCode;
			}
		} else {
			return oModel.getProperty("/CAMPAIGN_FORM_CODE");
		}
	};
	AssignmentActionMixin.popConfirmMessageBox = function(aCampaignFormFields, oModel, bSameForm) {
		var that = this;
		var oDialog = this._getReassignCampaignDialog();
		var sContext = oDialog.data("context");
		var vIdeaID;
		if (sContext === "mass") {
			vIdeaID = this.getModel("assignment").getProperty("/IDS");
		} else {
			vIdeaID = this.getModel("assignment").getProperty("/ID");
		}

		var fnExectueDialogAction = function(sDialogAction, aFormFields) {
			switch (sDialogAction) {
				case MessageBox.Action.OK:
					that._executeReassignCampaignAction(vIdeaID, aFormFields, oModel);
					break;
				case MessageBox.Action.CANCEL:
					break;
			}

			that.resetActionState(sContext === "mass");
			that.restoreFocusAfterActionDialogClose();
			that._oReassignCampaignDialog.close();
			if (that.getView().sViewName === "sap.ino.vc.idea.ListPage") {
				that.bindList();
			}
		};
		if (!bSameForm) {
			var aFieldsValue = [];
			if (aCampaignFormFields.length === 0) {
				MessageBox.confirm(this.getText("IDEA_LIST_REASSIGN_CAMPAIGN_MSG_CHG_NO_FORM_FIELD"), {
					actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
					onClose: function(sDialogAction) {
						fnExectueDialogAction(sDialogAction, aFieldsValue);
					}
				});
			} else { //Mark the mandatory formfields
				var bMandatory;
				var sFormType;
				for (var i = 0; i < aCampaignFormFields.length; i++) {
					if (aCampaignFormFields[i].MANDATORY) {
						bMandatory = true;
						sFormType = aCampaignFormFields[i].FORM_TYPE_CODE;
						break;
					}
					if (aCampaignFormFields[i].FORM_TYPE_CODE === "ADMIN_FORM") {
						aFieldsValue.push({
							FIELD_CODE: aCampaignFormFields[i].CODE,
							FORM_TYPE_CODE: "ADMIN_FORM"
						});
					} else {
						aFieldsValue.push({
							FIELD_CODE: aCampaignFormFields[i].CODE
						});
					}

				}
				if (bMandatory) {
				    var sShowText = sFormType === "ADMIN_FORM" ? this.getText("IDEA_LIST_REASSIGN_CAMPAIGN_MSG_NOCHG_ADMIN_FORM_FIELD") : this.getText("IDEA_LIST_REASSIGN_CAMPAIGN_MSG_NOCHG_FORM_FIELD");
					MessageBox.error(sShowText, {
						actions: [MessageBox.Action.OK],
						onClose: function(sDialogAction) {
							if (sDialogAction === MessageBox.Action.OK) {
								that.resetActionState(sContext === "mass");
								that.restoreFocusAfterActionDialogClose();
								that._oReassignCampaignDialog.close();
							}
						}
					});
				} else {
					/*****No mandatory fields, then pop message to discard the old formfields or use the new one*/
					MessageBox.confirm(this.getText("IDEA_LIST_REASSIGN_CAMPAIGN_MSG_CHG_FORM_FIELD"), {
						actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
						onClose: function(sDialogAction) {
							fnExectueDialogAction(sDialogAction, aFieldsValue);
						}
					});
				}

			}
		} else //Same form: update directly
		{
			that._executeReassignCampaignAction(vIdeaID, undefined, oModel);
			that.resetActionState(sContext === "mass");
			that.restoreFocusAfterActionDialogClose();
			that._oReassignCampaignDialog.close();
			if (that.getView().sViewName === "sap.ino.vc.idea.ListPage") {
				that.bindList();
			}
		}

	};
	AssignmentActionMixin.checkReassignCampaignValidValue = function(oCampaignList, oRespList) {
		var oModel = this.getModel("assignment");
		if (!oCampaignList.getSelectedItem()) {
			var oCampaignBoxMessage = new Message({
				code: "IDEA_LIST_REASSIGN_CAMPAIGN_MSG_NO_CAMPAIGN_ID",
				type: MessageType.Error
			});
			this.setClientMessage(oCampaignBoxMessage, oCampaignList);
			return false;
		} else {
			if (oModel.getProperty("/RESP_CODE")) {
				if (!oRespList.getSelectedItem()) {
					var oRespListMessage = new Message({
						code: "IDEA_LIST_REASSIGN_CAMPAIGN_MSG_NO_RESPLIST_VALUE",
						type: MessageType.Error
					});
					this.setClientMessage(oRespListMessage, oRespList);
					return false;
				} else {
					return true;
				}
			} else {
				return true;
			}

		}
	};

	AssignmentActionMixin.onReassignCampaignDialogCancel = function() {
		//var oDialog = this._getReassignCampaignDialog();
		this.restoreFocusAfterActionDialogClose();
		this._oReassignCampaignDialog.close();
	};
	AssignmentActionMixin.onReassignCampaignSuggestion = function(oEvent) {
		var oModel = this.getModel("assignment");
		var that = this;
		var sCampaignId = oModel.getProperty("/CAMPAIGN_ID");
		var oDataModel = this.getDefaultODataModel ? this.getDefaultODataModel() : this.getModel("data");
		var mEvent = jQuery.extend({}, oEvent, true);
		var sTerm = jQuery.sap.encodeURL(mEvent.getParameter("suggestValue"));
		this.resetClientMessages();
		oDataModel.read("/CampaignSuggestionParams(searchToken='" + sTerm + "',filterName='allCampaignsExceptDraft')/Results", {
			urlParameters: {
				"$orderby": "SHORT_NAME",
				"$filter": "ID ne " + sCampaignId
			},
			success: function(oData) {
				oModel.setProperty("/campaignSuggestion", oData.results);
				var oCampFilter = that.byId("reassignCampaignList") || that.getFilterElementById("reassignCampaignList");
				oCampFilter.setFilterSuggests(false);
			}
		});
	};
	AssignmentActionMixin.onHandleReassignCampaignHelp = function() {
		var that = this;
		var oViewModel = this.getModel("assignment");
		var sCampaignId = oViewModel.getProperty("/CAMPAIGN_ID");
		var oModel = this.getDefaultODataModel ? this.getDefaultODataModel() : this.getModel("data");
		oModel.read("/CampaignSuggestionParams(searchToken='',filterName='allCampaignsExceptDraft')/Results", {
			urlParameters: {
				"$orderby": "SHORT_NAME",
				"$filter": "ID ne " + sCampaignId
			},
			success: function(oData) {
				oViewModel.setProperty("/campaignSuggestion", oData.results);
				var oCampFilter = that.byId("reassignCampaignList") || that.getFilterElementById("reassignCampaignList");
				oCampFilter.setFilterSuggests(false);
				// create dialog
				var oCampaignlistDialog = that.createReassignCampaignListDialog();
				oCampaignlistDialog.open();
			}
		});
	};

	AssignmentActionMixin.createReassignCampaignListDialog = function() {
		if (!this._campaignDialog) {
			this._campaignDialog = this.createFragment("sap.ino.vc.idea.fragments.ReassignCampaignSuggestionSelectList", this.getView().getId());
			this.getView().addDependent(this._campaignDialog);
		}
		return this._campaignDialog;
	};
	AssignmentActionMixin.onReassignCampaignChange = function() {
		var that = this;
		var oModel = this.getModel("assignment");
		var oRespList = this.byId("reassignCampaignRespList");
		oRespList.setSelectedKey();
		var oCampaignRespCombox = this.byId("reassignCampaignList");
		var sCampaignId = oCampaignRespCombox.getSelectedKey();
		if (oCampaignRespCombox.getSelectedItem()) {
			this.resetClientMessages();
		}
		oModel.setProperty("/REASSIGN_CAMPAIGN_ID", parseInt(sCampaignId, 10));
		this.getModel("data").read("/CampaignSmall(" + sCampaignId + ")", {
			success: function(oData) {
				oModel.setProperty("/REASSIGN_CAMPAIGN_NAME", oData.NAME);
				oModel.setProperty("/REASSIGN_CAMPAIGN_FORM_CODE", oData.FORM_CODE);
				oModel.setProperty("/REASSIGN_CAMPAIGN_ADMIN_FORM_CODE", oData.ADMIN_FORM_CODE);
				if (oData.RESP_CODE) {
					that.setViewProperty("/DISPLAY_RESP_LIST", true);
					oModel.setProperty("/RESP_NAME", oData.RESP_NAME);
					oModel.setProperty("/RESP_CODE", oData.RESP_CODE);
					//that.bindingRespListValue(oData.RESP_CODE);
				} else {
					oModel.setProperty("/RESP_NAME", "");
					oModel.setProperty("/RESP_CODE", "");
					that.setViewProperty("/DISPLAY_RESP_LIST", false);
				}
			},
			error: function(oMessage) {
				//	MessageToast.show(oMessage.message);
			}
		});

	};
	AssignmentActionMixin.onRespValueChange = function(oEvent) {
		if (oEvent.getSource().getSelectedItem()) {
			this.resetClientMessages();
		}
	};
	AssignmentActionMixin.bindingRespListValue = function(sRespCode) {
		// 		var oItemTemplate, sBindingPath;
		// 		oItemTemplate = new ListItem({
		// 			key: "{data>CODE}",
		// 			text: "{data>NAME}"
		// 		});
		// 		sBindingPath = "data>/ResponsibilityValueSearchParams(searchToken='',respCode='" + sRespCode + "')/Results";

		// 		var oCampaignRespCombox = this.byId("reassignCampaignRespList");
		// 	   //this.getModel("assignment").setProperty("/Resp_Value",)
		// 		oCampaignRespCombox.bindSuggestionRows({
		// 			path: sBindingPath,
		// 			template: oItemTemplate,
		// 			sorter: new Sorter("NAME")
		// 		});
		var oCampaignRespCombox = this.byId("reassignCampaignRespList");
		var oModel = this.getModel("assignment");
		var sTerm = "";
		var that = this;
		this.getModel("data").read("/ResponsibilityValueSearchParams(searchToken='" + sTerm + "',respCode='" + sRespCode +
			"')/Results", {
				urlParameters: {
					"$orderby": "NAME"
				},
				success: function(oData) {
					oModel.setProperty("/Resp_Value", oData.results);
					oCampaignRespCombox.setFilterSuggests(false);
				}
			});

	};

	AssignmentActionMixin._executeReassignCampaignAction = function(vIdeaID, aFormFields, oModel) {
		var that = this;
		var oRespList = this.byId("reassignCampaignRespList");
		var sCampaignName = oModel.getProperty("/REASSIGN_CAMPAIGN_NAME");
		var aAdminForm = [];
		var aCustomIdeaForm = [];
		if (aFormFields && aFormFields.length > 0) {
			aFormFields.forEach(function(object) {
				if (object.FORM_TYPE_CODE && object.FORM_TYPE_CODE === "ADMIN_FORM") {
					delete object.FORM_TYPE_CODE;
					aAdminForm.push(object);
				} else {
					aCustomIdeaForm.push(object);
				}
			});
		}
		var oParameters = {
			CAMPAIGN_ID: oModel.getProperty("/REASSIGN_CAMPAIGN_ID"),
			FieldsValue: aCustomIdeaForm,
			AdminFieldsValue: aAdminForm,
			RESP_VALUE_CODE: oRespList.getSelectedKey()
		};
		var sActionName = Array.isArray(vIdeaID) ? "massReassignCampaign" : "reassignCampaign";
		var oMessages = {
			success: function() {
				return that.getText("IDEA_OBJECT_MSG_CAMPAIGN_REASSIGNED_SUCCESS", [sCampaignName]);
			},
			error: function() {
				return that.getText("IDEA_OBJECT_MSG_CAMPAIGN_REASSIGNED_ERROR", [sCampaignName]);
			}
		};
		return this._executeAssignAction(sActionName, vIdeaID, oParameters, oMessages, this._getReassignCampaignDialog());

	};
	/**
	 * event when dialog's cancel is clicked
	 *
	 * @param {Event}   oEvent
	 */
	AssignmentActionMixin.onAssignCoachDialogCancel = function(oEvent) {
		//var oSource = oEvent.getSource();
		//this.resetActionState(oSource.data("context") === "mass");
		this.restoreFocusAfterActionDialogClose();
	};

	AssignmentActionMixin.onAssignExpertDialogCancel = function(oEvent) {
		//var oSource = oEvent.getSource();
		// 		var oDialog = this._getAssignExpertDialog();
		// 		oDialog._dialog.close();
		// 		oDialog.destroy();
		// 		this._oAssignExpertDialog = undefined;
		//this.resetActionState(oSource.data("context") === "mass");
		this.restoreFocusAfterActionDialogClose();
	};

	AssignmentActionMixin.onAssignTagDialogCancel = function(oEvent) {
		//var oSource = oEvent.getSource();
		var oMultiInput = this.byId("Tags");
		var oDialog = this._getAssignTagDialog();
		if (oMultiInput) {
			oMultiInput.removeAllTokens();
			oMultiInput.setValue("");
		}
		if (this.resetInputTypeValidations) {
			this.resetInputTypeValidations(oDialog);
		}
		oDialog.close();
		this.restoreFocusAfterActionDialogClose();
	};

	AssignmentActionMixin.onAssignTagDialogOK = function(oEvent) {
		var oMultiInput = this.byId("Tags");
		var oSource = this._getAssignTagDialog();
		var vIdeaID;
		var that = this;
		this.resetClientMessages();
		if (oMultiInput) {
			var aTokens = oMultiInput.getTokens();
			var aNewTags = [];

			if (aTokens.length === 0) {
				var oMessage = new Message({
					code: "IDEA_LIST_ASSIGN_TAG_MSG_NO_TAG",
					type: MessageType.Error
				});
				this.setClientMessage(oMessage, oMultiInput);
			}
			if (!this.hasAnyClientErrorMessages()) {
				aTokens.forEach(function(oToken) {
					var oTag = {};
					var vKey = oToken.getKey();
					try {
						vKey = parseInt(oToken.getKey(), 10);
					} catch (e) {
						// Never mind, then there is no int
					}
					oTag.TAG_ID = vKey;
					oTag.NAME = oToken.getText();
					aNewTags.push(oTag);
				});

				// we need to differentiate whether we are in mass or single idea context
				if (oSource.data("context") === "mass") {
					vIdeaID = that.getModel("assignment").getProperty("/IDS");
				} else {
					vIdeaID = that.getModel("assignment").getProperty("/ID");
				}
				that._executeAssignTagAction(vIdeaID, aNewTags);

				oSource.close();
				this.resetActionState(oSource.data("context") === "mass");
				this.restoreFocusAfterActionDialogClose();
				this.bindList();
			}
		}
	};

	AssignmentActionMixin._executeAssignTagAction = function(vIdeaID, aNewTags) {
		var that = this;
		var oParameters = {};
		var sActionName = Array.isArray(vIdeaID) ? "massAssignTag" : "assignTag";
		var oMultiInput = this.byId("Tags");
		var oMessages = {
			success: function() {
				oMultiInput.removeAllTokens();
				oMultiInput.setValue("");
				return that.getText("IDEA_OBJECT_MSG_TAG_ASSIGNED_SUCCESS");
			},
			error: function() {
				return that.getText("IDEA_OBJECT_MSG_TAG_ASSIGNED_ERROR");
			}
		};
		oParameters.Tags = aNewTags;
		return this._executeAssignAction(sActionName, vIdeaID, oParameters, oMessages, this._getAssignTagDialog());
	};

	/**
	 * event for "me as coach" assignment
	 *
	 * @param {Event}   oEvent
	 */
	AssignmentActionMixin.onAssignMeAsCoach = function(oEvent) {
		var sContext = oEvent.getSource().getParent().data("context");
		var oUserModel = this.getModel("user");
		var iIdentityID = oUserModel.getProperty("/data/USER_ID");
		var sMyName = oUserModel.getProperty("/data/NAME");
		var iCampaignId = this.getModel("assignment").getProperty("/CAMPAIGN_ID");
		var vIdeaID;
		if (sContext === "mass") {
			vIdeaID = this.getModel("assignment").getProperty("/ASSIGNME_IDS");
		} else {
			vIdeaID = this.getModel("assignment").getProperty("/ID");
		}
		this._executeAssignCoachAction(vIdeaID, iIdentityID, sMyName, iCampaignId);
	};

	/**
	 * event for coach unassignment
	 *
	 * @param {Event}   oEvent
	 */
	AssignmentActionMixin.onUnassignCoach = function(oEvent) {
		var sContext = oEvent.getSource().getParent().data("context");
		var sCoachName = this.getModel("assignment").getProperty("/COACH_NAME") || undefined;
		var iCampaignId = this.getModel("assignment").getProperty("/CAMPAIGN_ID");
		var vIdeaID;
		if (sContext === "mass") {
			vIdeaID = this.getModel("assignment").getProperty("/UNASSIGN_IDS");
		} else {
			vIdeaID = this.getModel("assignment").getProperty("/ID");
		}
		this._executeUnassignCoachAction(vIdeaID, sCoachName, iCampaignId);
	};

	/**
	 * mass action on assignment
	 *
	 */
	AssignmentActionMixin.onMassAssign = function(oEvent) {

		// if it's a select all mass action
		if (this.getViewProperty("/List/SELECT_ALL")) {
			var oBindingParams = this.getBindingParameter();
			var bIsManaged = this._check4ManagingList();
			var sFilterParams = this.getList().getBinding('items').sFilterParams;
			var aTags = this.getViewProperty("/List/TAGS");
		    var tagGroup = {};
            var tagGroupKey = [];
            aTags.forEach(function(item,index){
                        if(!tagGroup[item.ROOTGROUPID]){
                            tagGroup[item.ROOTGROUPID] = [];
                            tagGroup[item.ROOTGROUPID].push(item.ID);
                            tagGroupKey.push(item.ROOTGROUPID);
                        } else {
                            tagGroup[item.ROOTGROUPID].push(item.ID);
                        }   
                    });
			

			var oParameter = {
				searchToken: oBindingParams.SearchTerm || "",
				tagsToken:  tagGroup[tagGroupKey[0]] ? tagGroup[tagGroupKey[0]].join(",") : "",
    			tagsToken1: tagGroup[tagGroupKey[1]] ? tagGroup[tagGroupKey[1]].join(",") : "",
    			tagsToken2: tagGroup[tagGroupKey[2]] ? tagGroup[tagGroupKey[2]].join(",") : "",
    			tagsToken3: tagGroup[tagGroupKey[3]] ? tagGroup[tagGroupKey[3]].join(",") : "",
    			tagsToken4: tagGroup[tagGroupKey[4]] ? tagGroup[tagGroupKey[4]].join(",") : "",
				filterName: oBindingParams.VariantFilter || "",
				filterBackoffice: bIsManaged ? "1" : "0",
				filterString: sFilterParams || ""
			};
			
			if (this.setQueryObjectIdeaformFilters) {
				this.setQueryObjectIdeaformFilters(oParameter);
			}
			
			if (this.getCampaignFormQuery) {
				oParameter.ideaFormId = this.getCampaignFormQuery() || "";
			}
			
			if(this.getSearchType){
			    oParameter.searchType = this.getSearchType();
			}
			
			if (this.setQueryObjectCompanyViewFilters) {
				this.setQueryObjectCompanyViewFilters(oParameter);
			}
			// call back end service
			var that = this;
			var oObjEvt = jQuery.extend({}, oEvent);
			var oSource = oEvent.getSource();
			// disable button
			oSource.setEnabled(false);
			jQuery.ajax({
				url: Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/select_all_ideas.xsjs",
				data: oParameter,
				success: function(res) {
					// enable button
					oSource.setEnabled(true);
					if (res.Ideas.length === 0) {
						MessageBox.show(that.getText("NO_IDEAS_AND_RELOAD_PAGE"), {
							icon: MessageBox.Icon.INFORMATION,
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function() {
								that.bindList();
							}
						});
						return;
					}
					// clear selection map
					that._oSelectionMap = {};
					jQuery.each(res.Ideas, function(iIdx, oData) {
						if (!that._oDeselectionMap[oData.ID]) {
							// create data structure as property model
							oData.property = that._createPropertyData(oData);
							that._oSelectionMap[oData.ID] = oData;
						}
					});
					// call general assign action
					that.onMassAssignGeneral(oObjEvt);
				},
				error: function(res) {
					MessageToast.show(that.getText(res.responseJSON.messageKey));
				}
			});
		} else {
			// general assign action
			this.onMassAssignGeneral(oEvent);
		}

	};
	/*-------------------------------------------------
	//Hierarchy for Responsibility List when Reassign Campaign
	--------------------------------------------------*/
	AssignmentActionMixin.convertToHierarchy = function(aObjects, sKeyName, sParentKeyName) {
		var aNodeObjects = this.createStructure(aObjects, sParentKeyName);
		var oTreeNode = aNodeObjects.root;
		this.arrToHierarchy(oTreeNode, aNodeObjects, sKeyName);
		return oTreeNode;
	};
	AssignmentActionMixin.createStructure = function(aNodes, sParentKeyName) {
		var aObjects = {
			root: []
		};
		for (var i = 0; i < aNodes.length; i++) {
			var sProName = "Sub_" + aNodes[i][sParentKeyName];
			if (!aNodes[i].children || !jQuery.isArray(aNodes[i].children)) {
				aNodes[i].children = []; // create empty array for children later
			}
			if (isNaN(parseInt(aNodes[i][sParentKeyName], 10))) {
				aObjects.root.push(aNodes[i]);
			} else {
				if (!aObjects.hasOwnProperty(sProName)) {
					aObjects[sProName] = [];
				}
				aObjects[sProName].push(aNodes[i]);
			}
		}
		return aObjects;
	};
	AssignmentActionMixin.arrToHierarchy = function(oTreeNode, aNodeObjects, sKeyName) {
		if (!oTreeNode || oTreeNode.length === 0) {
			return;
		}
		for (var i = 0; i < oTreeNode.length; i++) {
			var sProName = "Sub_" + oTreeNode[i][sKeyName];
			if (aNodeObjects.hasOwnProperty(sProName)) {
				oTreeNode[i].children = aNodeObjects[sProName];
				this.arrToHierarchy(oTreeNode[i].children, aNodeObjects, sKeyName);
			}
		}
	};

	AssignmentActionMixin.onRespListSuggestion = function(oEvent) {
		var that = this;
		var oModel = this.getModel("assignment");
		var mEvent = jQuery.extend({}, oEvent, true);
		var sTerm = jQuery.sap.encodeURL(mEvent.getParameter("suggestValue"));
		this.resetClientMessages();
		this.getModel("data").read("/ResponsibilityValueSearchParams(searchToken='" + sTerm + "',respCode='" + oModel.getProperty("/RESP_CODE") +
			"')/Results", {
				urlParameters: {
					"$orderby": "NAME"
				},
				success: function(oData) {
					oModel.setProperty("/Resp_Value", oData.results);
					that.byId("reassignCampaignRespList").setFilterSuggests(false);
				}
			});
	};
	AssignmentActionMixin.createRespListHierarchyDialog = function() {
		if (!this._oRespListTreeDialog) {
			this._oRespListTreeDialog = this.createFragment("sap.ino.vc.idea.fragments.ReassignCampaignResponsibilityListValue", this.getView().getId());
			this.getView().addDependent(this._oRespListTreeDialog);
		}
		return this._oRespListTreeDialog;
	};
	AssignmentActionMixin.onHandleRespListValueHelp = function(oEvent) {
		var that = this;
		var oReslistDialog = that.createRespListHierarchyDialog();
		oReslistDialog.open();
		oReslistDialog.setBusy(true);
		var oTreeTable = that.byId('respValueTreeTable');
		var oRespValueInput = that.byId('reassignCampaignRespList');
		var oModel = this.getModel("assignment");
		this.getModel("data").read("/ResponsibilityValueSearchParams(searchToken='',respCode='" + oModel.getProperty("/RESP_CODE") +
			"')/Results", {
				urlParameters: {
					"$orderby": "NAME"
				},
				success: function(oData) {
					oReslistDialog.setBusy(false);
					oModel.setProperty("/Resp_Value", oData.results);
					var aHierarchy_RespValue = that.convertToHierarchy(oData.results, "ID", "PARENT_VALUE_ID");
					oModel.setProperty("/Resp_Value_Tree", aHierarchy_RespValue);
					that.setViewProperty("/ENABLE_OK_BTN", false);

					that.resetClientMessages();
					that.byId('reassignCampaignRespList')._closeSuggestionPopup();

					oTreeTable.attachBrowserEvent("dblclick", function() {
						//Double click for the Popup RL list selection   
						if (oTreeTable.isIndexSelected(that._treeTableIndex)) {
							oTreeTable.removeSelectionInterval(that._treeTableIndex, that._treeTableIndex);
						} else {
							oTreeTable.addSelectionInterval(that._treeTableIndex, that._treeTableIndex);
						}
						if (that._treeTableIndex > -1) {
							var sBindingPath = oTreeTable.getContextByIndex(that._treeTableIndex).getPath();
							oRespValueInput.setSelectedKey(oModel.getProperty(sBindingPath + "/CODE"));
							oRespValueInput.setValue(oModel.getProperty(sBindingPath + "/NAME"));
							if (that._oRespListTreeDialog) {
								that._oRespListTreeDialog.close();
								that._oRespListTreeDialog.destroy();
								that._oRespListTreeDialog = undefined;
							}
						}
						that._treeTableIndex = -1;
					});
				},
				error: function(oMessage) {
					oModel.setProperty("/Resp_Value_Tree", []);
					oReslistDialog.setBusy(false);
					MessageToast.show(oMessage.message);
				}
			});
	};
	AssignmentActionMixin.onRespValueDialogClose = function() {
		if (this._oRespListTreeDialog) {
			this._oRespListTreeDialog.close();
			this._oRespListTreeDialog.destroy();
			this._oRespListTreeDialog = undefined;
		}
	};
	AssignmentActionMixin.onSelectedItem = function(oEvent) {
		var that = this;
		var oModel = this.getModel("assignment");
		var oRespValueTree = that.byId("respValueTreeTable");
		var oRespValueInput = that.byId('reassignCampaignRespList');
		var iIndex = oRespValueTree.getSelectedIndex();
		if (iIndex > -1) {
			var sBindingPath = oRespValueTree.getContextByIndex(iIndex).getPath();
			oRespValueInput.setSelectedKey(oModel.getProperty(sBindingPath + "/CODE"));
			oRespValueInput.setValue(oModel.getProperty(sBindingPath + "/NAME"));
		}
		if (this._oRespListTreeDialog) {
			this._oRespListTreeDialog.close();
			this._oRespListTreeDialog.destroy();
			this._oRespListTreeDialog = undefined;
		}
	};
	AssignmentActionMixin.onRespRowSelectionChange = function(oEvent) {
		var that = this;
		var oRespValueTree = that.byId("respValueTreeTable");
		var iIndex = oRespValueTree.getSelectedIndex();
		if (iIndex > -1) {
			this.setViewProperty("/ENABLE_OK_BTN", true);
			this._treeTableIndex = iIndex;
		} else {
			this.setViewProperty("/ENABLE_OK_BTN", false);
		}

	};
	return AssignmentActionMixin;
});