sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObjectChange",
    "sap/ino/vc/commons/BaseObjectController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/ui/core/ValueState",
    "sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Text",
    "sap/ino/commons/models/object/IdeaObjectIntegration",
    "sap/m/MessageBox",
    "sap/m/FlexBox",
    "sap/m/Link",
    "sap/ino/commons/application/Configuration"
], function(ApplicationObjectChange, BaseController, JSONModel, MessageToast, Dialog, DialogType, ValueState, Button, ButtonType, Text, IdeaObjectIntegration, MessageBox, FlexBox, Link, Configuration) {
	"use strict";

	return BaseController.extend("sap.ino.vc.idea.Integration", {

		onInit: function() {
			BaseController.prototype.onInit.apply(this, arguments);
			var oIntegrationModel = new JSONModel();
			this._initHandleIdeaObjectIntegrationAOChange();
			this.getView().setModel(oIntegrationModel, "integration");
            this._oRouter = this.getOwnerComponent().getRouter();			
			this._oRouter.attachRouteMatched(this._getIntegrationObjectList, this);
		},
		visibleLink: function(oFieldCode) {
			if (oFieldCode && oFieldCode.indexOf('URL') > -1) {
				return true;
			} else {
				return false;
			}
		},
		visibleText: function(oFieldCode) {
			if (oFieldCode && oFieldCode.indexOf('URL') > -1) {
				return false;
			} else {
				return true;
			}
		},
		visibleField: function(oFieldCode) {
			if (oFieldCode) {
				return true;
			} else {
				return false;
			}
		},
		onAfterRendering: function() {
			var oIntegrationModel = this.getModel("integration");
			var that = this;
			var oIdea = this.getObjectModel();
			var sRouterContext = this.getOwnerComponent().getRouter().getContext();
			
			if (oIdea && oIdea.getProperty("/ID") && sRouterContext.indexOf("sectionIntegration") > -1 ) {
				this.getView().setBusy(true);
				IdeaObjectIntegration.getIdeaIntegrationList({
					IDEA_ID: oIdea.getProperty("/ID"),
					CAMPAIGN_ID: oIdea.getProperty("/CAMPAIGN_ID")
				}).done(function(results) {
					oIntegrationModel.setData(results.RESULT);
					that.getView().setBusy(false);
				});
			}
		},
		_getIntegrationObjectList: function(){
			var oIntegrationModel = this.getModel("integration");
			var that = this;			
			var sRouterContext = this.getOwnerComponent().getRouter().getContext();			
			if(this.getCurrentRoute() === "idea-display" && sRouterContext.indexOf("sectionIntegration") > -1 ){
			var oIdea = this.getObjectModel();			    
			if (oIdea && oIdea.getProperty("/ID")) {
				this.getView().setBusy(true);
				IdeaObjectIntegration.getIdeaIntegrationList({
					IDEA_ID: oIdea.getProperty("/ID"),
					CAMPAIGN_ID: oIdea.getProperty("/CAMPAIGN_ID")
				}).done(function(results) {
					oIntegrationModel.setData(results.RESULT);
					that.getView().setBusy(false);
				});
			}	
			}
		},
		visibleRefresh: function(bVisible) {
			return bVisible;
		},
		enableRemove: function(bEnable) {
			return true;
		},
		formatDate: function(value, oFieldCode) {
			if (oFieldCode && (oFieldCode.indexOf('CREATED_AT') > -1 || oFieldCode.indexOf('LAST_REFRESHED_AT') > -1 || oFieldCode.indexOf('DATE') > -1)) {
				var oUtcDate = new Date(value);
				var iMins = oUtcDate.getTimezoneOffset();
				var oActualTime = oUtcDate.getTime() + ( - iMins * 60 * 1000);
				var oDate = new Date(oActualTime);
				if (!oDate.getTime()) {
					//Once Date invalid
					return value;
				} else {
					var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "MMM d, yyyy HH:mm:ss"
					});
					return oDateFormat.format(oDate);
				}
			} else {
				return value;
			}
		},
		enableLink: function(oLinkValue) {
		    if(!oLinkValue){
		        return false;
		    }
			oLinkValue = oLinkValue.trim();
			if (!oLinkValue || oLinkValue === "") {
				return false;
			}
			if (oLinkValue && oLinkValue.indexOf("http://") !== 0 && oLinkValue.indexOf("https://") !== 0 && oLinkValue.indexOf("mailto:") !== 0) {
				oLinkValue = "http://" + oLinkValue;
			}

			return jQuery.sap.validateUrl(oLinkValue);

		},
		onPressRefresh: function(oEvent) {
			var oSource = oEvent.getSource();
			oSource.setBusy(true);
			var that = this;
			var oBinding = oSource.getBinding("enabled");
			var sPath = oBinding.getContext().sPath;
			var oIntegrationModel = this.getModel("integration");
			var oIdea = this.getObjectModel();
			var oRefreshReq = {
				IDEA_ID: oIdea.getProperty("/ID"),
				CAMPAIGN_ID: oIdea.getProperty("/CAMPAIGN_ID"),
				API_TECH_NAME: oIntegrationModel.getProperty(sPath + "/API_TECHNICAL_NAME"),
				INTEGRATION_OBJECT_UUID: oIntegrationModel.getProperty(sPath + "/INTEGRATION_OBJECT_UUID")
			};
			var oPrimiseRequest = IdeaObjectIntegration.queryObject(oRefreshReq);
			oPrimiseRequest.done(function(res) {
			    oSource.setBusy(false);
			    var requestText = 	res.RESULT.status.toString().includes('20') ? 'Your request to refresh the integration object has been sent successfully.' : 'Your request to refresh the integration object has been failed.';
			    var sShowText = requestText + 'The request ID is ' + (res.RESULT.generatedId ? res.RESULT.generatedId[-1] : '') + ' and message status is: ' + (res.RESULT.status ? res.RESULT.status : '') + '.';   
			    var oTextControl = new Text({text: sShowText});
			    var oLinkControl = new Link({
                    href : Configuration.getBackendRootURL() + '/sap/ino/config#integrationMonitorList',
                    text: 'For more detail, please navigate to Innovation Office->Monitor->Integration',
                    target: '_blank'
                });
				if (!this.oSuccessMessageDialog) {
				this.oSuccessMessageDialog = new Dialog({
					type: DialogType.Message,
					title: res.RESULT.status.toString().includes('20') ? ValueState.Success : ValueState.Error,
					state: res.RESULT.status.toString().includes('20') ? ValueState.Success : ValueState.Error,
					content:new FlexBox({
            					items: [oTextControl,oLinkControl],
            					alignItems: "Start",
            					justifyContent: "Start",
            					alignContent: "Start"
            		}),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "OK",
						press: function () {
							this.oSuccessMessageDialog.close();
						}.bind(this)
					})
				});
			}

			this.oSuccessMessageDialog.open();

			});
			oPrimiseRequest.fail(function(oMessage) {
			    oSource.setBusy(false);
				if (oMessage.MESSAGES.length > 0) {
					MessageToast.show(oMessage.MESSAGES[0].MESSAGE_TEXT);
				} else {
					MessageToast.show(that.getText("IDEA_OBJECT_INTEGRATION_REFRESH_FAIL"));
				}
			});
		},
		onPressRemove: function(oEvent) {
			var oSource = oEvent.getSource();
			var that = this;
			var oBinding = oSource.getBinding("enabled");
			var sPath = oBinding.getContext().sPath;
			var oIntegrationModel = this.getModel("integration");
			var sObjectUUID = oIntegrationModel.getProperty(sPath + "/INTEGRATION_OBJECT_UUID");
			MessageBox.confirm(that.getText("IDEA_OBJECT_INTEGRATION_MSG_CONFIRM_REMOVE"), {
				title: that.getText("IDEA_OBJECT_INTEGRATION_REMOVE_POP_TITLE"),
				icon: MessageBox.Icon.WARNING,
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				onClose: function(sDialogAction) {
					if (sDialogAction === MessageBox.Action.OK) {
						IdeaObjectIntegration.removeObject({
							INTEGRATION_OBJECT_UUID: sObjectUUID
						}).done(function() {
							MessageToast.show(that.getText("IDEA_OBJECT_INTEGRATION_REMOVE_SUCCESS"));
						}).fail(function() {
							MessageToast.show(that.getText("IDEA_OBJECT_INTEGRATION_REMOVE_FAIL"));
						});
					}
				}
			});
		},
		_initHandleIdeaObjectIntegrationAOChange: function() {
			var that = this;

			var fnAOChangeListener = function(oEvent) {
				var sAction = oEvent && oEvent.getParameter("actionName");
				var oChangeRequest = oEvent.getParameter("changeRequest");
				if (oEvent.getParameter("object").getMetadata().getName() === "sap.ino.commons.models.object.IdeaObjectIntegration") {

					if (sAction && ["createObject", "queryObject", "removeObject","linkExistedObject"].indexOf(sAction) > -1) {
						//that.rebindList(that.getView().byId("integrationObjectsList"));
						var oIdea = that.getObjectModel();
						var oIntegrationModel = that.getModel("integration");
						IdeaObjectIntegration.getIdeaIntegrationList({
							IDEA_ID: oIdea.getProperty("/ID"),
							CAMPAIGN_ID: oIdea.getProperty("/CAMPAIGN_ID")
						}).done(function(results) {
							oIntegrationModel.setData(results.RESULT);
						});
					}
				}
			};
			ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Action, fnAOChangeListener);
		},

		rebindList: function(oList) {
			if (oList) {
				var oBindingInfo = oList.getBindingInfo("items");
				oList.bindItems(oBindingInfo);
			}
		}

	});
});