/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.views.common.PeopleFacetController");
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
jQuery.sap.require("sap.ui.ino.models.object.Group");
jQuery.sap.require("sap.ui.ino.models.object.User");
jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.ControlFactory");

(function() {

	sap.ui.ino.views.common.PeopleFacetController = jQuery.extend({}, sap.ui.ino.views.common.FacetAOController, {

		__oIdentityFields: {},

		__handleTabSelection: function() {
			this.getThingInspectorController().__iCurrentSelectedTab = this.getView().__oTabStrip.getSelectedIndex();
			for (var sKey in this.__oIdentityFields) {
				this.__oIdentityFields[sKey].setValueState(sap.ui.core.ValueState.None);
			}
			this.getThingInspectorController().clearFacetMessages();
		},

		__reSelectTab: function() {
			if (this.getThingInspectorController().__iCurrentSelectedTab && this.getView().__oTabStrip) {
				this.getView().__oTabStrip.setSelectedIndex(this.getThingInspectorController().__iCurrentSelectedTab);
			}
		},

		__addIdentity: function(oField, oRowRepeater, sChildPath, sIdentifier, oSettings) {
			if (oField.getValue() === "") {
				this.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error,
					"MSG_" + this.getView().__sTextPrefix + "_FLD_REQUIRED_" + sIdentifier, oField);
			} else {
				oField.setValueState(sap.ui.core.ValueState.None);
				var sKey = oField.getSelectedKey();
				var bSuccess = false;

				for (var i = 0; i < oField.getItems().length; ++i) {
					if (sKey === oField.getItems()[i].getKey()) {

						var oBindingInfo = oField.getBindingInfo("items");
						if (oBindingInfo && oBindingInfo.binding && oBindingInfo.binding.getContexts()) {
							var aContexts = oBindingInfo.binding.getContexts();
							if (aContexts.length > i) {
								var oIdentity = aContexts[i].getObject();
								bSuccess = this.__doAddIdentity(oRowRepeater, oIdentity, sChildPath, sIdentifier, oSettings);
							}
						}
						break;
					}
				}
				if (!bSuccess) {
					this.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error,
						"MSG_" + this.getView().__sTextPrefix + "_FLD_VALUE_INVALID_" + sIdentifier, oField);
				} else {
					oField.setValue("");
					oField.unbindItems();
				}
			}
		},

		__addIdentityFromClipboard: function(oRowRepeater, sChildPath, sIdentifier, oSettings) {
			var that = this;
			var oClipboard = sap.ui.ino.models.core.ClipboardModel.sharedInstance();
			var aUserKeys = oClipboard.getObjectKeys(sap.ui.ino.models.object.User);
			var aGroupKeys = oClipboard.getObjectKeys(sap.ui.ino.models.object.Group);
			var aIdentityKeys = aUserKeys.concat(aGroupKeys);

			if (!aIdentityKeys || aIdentityKeys == []) {
				this.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error,
					"MSG_CLIPBOARD_EMPTY_USER_GROUP", oClipboard);
			} else {
				var sKey = "";

				for (var i = 0; i < aUserKeys.length; ++i) {
					sKey = aUserKeys[i];

					var oReadRequest = oClipboard.getObjectForKey(sap.ui.ino.models.object.User, sKey);
					oReadRequest.done(function(oIdentity) {
						var bUserSuccess = that.__doAddIdentity(oRowRepeater, oIdentity, sChildPath, sIdentifier, oSettings);
						if (!bUserSuccess) {
							that.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error,
								"MSG_" + that.getView().__sTextPrefix + "_FLD_VALUE_INVALID_" + sIdentifier, oClipboard);
						}
					});
					oReadRequest.fail(function(oIdentity) {
						that.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error,
							"MSG_" + that.getView().__sTextPrefix + "_FLD_VALUE_INVALID_" + sIdentifier, oClipboard);
					});
				}
				for (var i = 0; i < aGroupKeys.length; ++i) {
					sKey = aGroupKeys[i];

					var oReadRequest = oClipboard.getObjectForKey(sap.ui.ino.models.object.Group, sKey);
					oReadRequest.done(function(oIdentity) {
						var bGroupSuccess = that.__doAddIdentity(oRowRepeater, oIdentity, sChildPath, sIdentifier, oSettings);
						if (!bGroupSuccess) {
							that.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error,
								"MSG_" + that.getView().__sTextPrefix + "_FLD_VALUE_INVALID_" + sIdentifier, oClipboard);
						}
					});
					oReadRequest.fail(function(oIdentity) {
						that.getThingInspectorController().setFacetMessage(sap.ui.core.MessageType.Error,
							"MSG_" + that.getView().__sTextPrefix + "_FLD_VALUE_INVALID_" + sIdentifier, oClipboard);
					});
				}
			}
		},

		__doAddIdentity: function(oRowRepeater, oIdentity, sChildPath, sIdentifier, oSettings) {
			var bSuccess = false;
			if (oIdentity) {
				// we need to copy as the identity may be re-read while editing and the handle would be overwritten by the id 
				// but we don't care about the subnodes, so no deep copy is required
				var oIdentity2Add = jQuery.extend({}, oIdentity);
				this.__cleanIdentity(oIdentity2Add);

				oIdentity2Add.IDENTITY_ID = oIdentity2Add.ID;
				oIdentity2Add.ID = this.getModel().getNextHandle();
				if(sIdentifier === "PARTICIPATE"){
			        oIdentity2Add.CAN_SUBMIT = 1;
				    oIdentity2Add.CAN_COMMENT = 1;
				    oIdentity2Add.CAN_VOTE = 1;
				    oIdentity2Add.LimitOfParticipants = [{
					"ACTION_CODE": "IDEA_VOTE",
					"DISABLED": 0
                		 },
				{
					"ACTION_CODE": "CAMPAIGN_SUBMIT",
					"DISABLED": 0
                		 },
				{
					"ACTION_CODE": "IDEA_COMMENT",
					"DISABLED": 0
                		 }];
				}else if(sIdentifier === "REGISTRATION"){
				    oIdentity2Add.DISABLED = 0;
				    oIdentity2Add.REGISTER_DISABLED = 0;
				} else {
			        oIdentity2Add.DISPLAY_HOMEPAGE = 0;
				    oIdentity2Add.LimitOfCampaignManagers = [{
					"ACTION_CODE": "MGR_DISPLAY_HOMEPAGE",
					"DISABLED": 1
                		 }];				    
				}
				
			

				// check for duplicates => if the user is faster than the context update
				var bIsDuplicate = false;
				var aIdentities = this.getModel().getProperty("/" + sChildPath);
				aIdentities = aIdentities || [];
				for (var j = 0; j < aIdentities.length; ++j) {
					if (aIdentities[j].IDENTITY_ID === oIdentity2Add.IDENTITY_ID) {
						bIsDuplicate = true;
						break;
					}
				}
				if (!bIsDuplicate) {
					if (oSettings.single) {
						this.getModel().setProperty("/" + sChildPath, []);
					}
					var iHandle = this.getModel().addChild(oIdentity2Add, sChildPath);
					oRowRepeater.lastPage();
					bSuccess = iHandle < 0;
					this.didAddIdentity(oIdentity2Add, sChildPath, sIdentifier);
				}
			}
			return bSuccess;
		},

		didAddIdentity: function(oIdentity, sChildPath, sIdentifier) {},

		didRemoveIdentity: function(oIdentity, sChildPath, sIdentifier) {},

		__removeIdentity: function(oEvent, oRowRepeater, sChildPath, sIdentifier, oSettings) {
			var oSource = oEvent.getSource();
			var oContext = oSource.getBindingContext(this.getModelName());
			if (oSource && oContext) {
				var oIdentity = oContext.getObject();
				if (oIdentity) {
					this.getModel().removeChild(oIdentity);
					this.didRemoveIdentity(oIdentity, sChildPath, sIdentifier);
				}
			}
		},

		__toggleClipboardIdentity: function(oEvent) {
			var oSource = oEvent.getSource();
			var oContext = oSource.getBindingContext(this.getModelName());
			if (oSource && oContext) {
				var oIdentity = oContext.getObject();
				if (oIdentity) {
					var vKey = oIdentity.IDENTITY_ID;
					var sTypeCode = oIdentity.TYPE_CODE;
					var oApplicationObject = null;
					if (sTypeCode == "GROUP") {
						oApplicationObject = sap.ui.ino.models.object.Group;
					} else {
						oApplicationObject = sap.ui.ino.models.object.User;
					}
					sap.ui.ino.models.core.ClipboardModel.sharedInstance().toggle(oApplicationObject, vKey);
				}
			}
		},

		__cleanIdentity: function(oIdentity) {
			delete oIdentity["__metadata"];
			delete oIdentity["Groups"];
			delete oIdentity["SEARCH_SCORE"];
		},

		__createMailBody: function(sType, iId) {
			var oApp = sap.ui.ino.application.ApplicationBase.getApplication();
			var sURL = oApp.getEncodedNavigationLink('sap.ino.config.URL_PATH_UI_FRONTOFFICE', sType, iId);
			var sBody = sap.ui.getCore().getModel("i18n").getResourceBundle().getText("GENERAL_MSG_MAIL_TEMPLATE_" + sType.toUpperCase(), [sURL]);
			return sBody;
		},

		__sendMail: function(aRecipients, sSubject) {
			var oView = this.getView();

			var oMailObject = sap.ui.ino.application.ControlFactory.createMailObject();

			var iId = this.getModel().getProperty(oView.__oGlobalSettings.mailSettings.key);
			var sMailBody = this.__createMailBody(oView.__oGlobalSettings.mailSettings.type, iId);

			oMailObject.executeMailTo(aRecipients, sMailBody, sSubject);
		},

		__onNavigateToModel: function(iId, sMode) {
			if (!iId) {
				return;
			}
			sMode = sMode || "display";
			var oModifyView = sap.ui.jsview("sap.ui.ino.views.backoffice.config.ResponsibilityListModify");
			oModifyView.show(iId, "edit");
			oModifyView.oTI.destroyActionBar();
		},

		__updateResp: function(iId, bCanEdit) {
			var oModifyView = sap.ui.jsview("sap.ui.ino.views.backoffice.config.ResponsibilityListModify");
			oModifyView.show(iId || -1, bCanEdit ? "edit" : "display");
			if (!bCanEdit) {
				oModifyView.oTI.destroyActionBar();
			}
		},

		__updateUserGroup: function(iId, bCanEdit) {
			var oModifyView = sap.ui.jsview("sap.ui.ino.views.backoffice.iam.GroupManagementInstance");
			oModifyView.show(iId || -1, bCanEdit ? "edit" : "display");
			if (!bCanEdit) {
				oModifyView.oTI.destroyActionBar();
			}
		}
	});
})();