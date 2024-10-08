sap.ui.define([
    "sap/ino/vc/commons/BaseObjectModifyController",
    "sap/ino/commons/models/object/Idea",
    "sap/ino/commons/models/object/Attachment",
    "sap/ino/commons/application/WebAnalytics",
    "sap/m/Token",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/core/ListItem",
    "sap/ui/core/HTML",
    "sap/ino/commons/application/Configuration",
    "sap/ino/controls/MobileTextEditor",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/MessageType",
    "sap/ui/core/message/Message",
    "sap/ui/core/ResizeHandler",
    "sap/ui/Device",
    "sap/m/MessageBox",
    "sap/m/Label",
    "sap/m/CheckBox",
    "sap/m/Input",
    "sap/m/ComboBox",
    "sap/ino/commons/models/core/CodeModel",
    "sap/ui/model/type/String",
    "sap/ino/commons/models/types/IntegerType",
    "sap/ino/commons/models/types/FloatType",
    "sap/ui/model/odata/type/Date",
    "sap/ino/commons/models/types/IntegerNullableType",
    "sap/ino/commons/models/types/FloatNullableType",
    "sap/ino/commons/models/types/IntNullableBooleanType",
    "sap/ino/vc/commons/mixins/SimilarIdeasMixin",
    "sap/ino/vc/commons/mixins/RichTextInitMixin"
], function(
	BaseController,
	Idea,
	Attachment,
	WebAnalytics,
	Token,
	MessageToast,
	Filter,
	FilterOperator,
	Sorter,
	ListItem,
	HTML,
	Configuration,
	MobileTextEditor,
	TopLevelPageFacet,
	JSONModel,
	MessageType,
	Message,
	ResizeHandler,
	Device,
	MessageBox,
	Label,
	CheckBox,
	Input,
	ComboBox,
	CodeModel,
	StringType,
	IntegerType,
	FloatType,
	DateType,
	IntegerNullableType,
	FloatNullableType,
	IntNullableBooleanType,
	SimilarIdeasMixin,
	RichTextInitMixin) {
	"use strict";
	var mDataType = {
		BOOLEAN: "BOOL_VALUE",
		TEXT: "TEXT_VALUE",
		INTEGER: "NUM_VALUE",
		NUMERIC: "NUM_VALUE",
		RICHTEXT: "RICH_TEXT_VALUE",
		DATE: "DATE_VALUE"
	};
	
	return BaseController.extend("sap.ino.vc.idea.Modify", jQuery.extend({}, TopLevelPageFacet, SimilarIdeasMixin, RichTextInitMixin, {
		routes: ["idea-edit", "idea-create"],
		preCheck: true,
		onInit: function() {
			BaseController.prototype.onInit.apply(this, arguments);
			this._dViewShown = jQuery.Deferred();
			this.setViewProperty("/EDIT", true);
			this.setViewProperty("/ATTACHMENT_UPLOAD_URL", Attachment.getEndpointURL());
			this.addMultiInputHandling(this.byId("Contributors"), {
				childNodeName: "Contributors",
				childNodeNameSingular: "Contributor",
				suggestion: {
					key: "ID",
					text: "NAME",
					additionalText: "USER_NAME",
					path: "data>/SearchIdentity(searchToken='$suggestValue')/Results",
					filters: [new Filter({
						path: "TYPE_CODE",
						operator: FilterOperator.EQ,
						value1: "USER"
					})],
					sorter: new Sorter("NAME")
				},
				token: {
					key: "IDENTITY_ID",
					text: "NAME",
					editable: "{=!${object>/CONTRIBUTION_READ_ONLY}}"
				}
			});

			this.addMultiInputHandling(this.byId("Tags"), {
				childNodeName: "Tags",
				childNodeNameSingular: "Tag",
				suggestion: {
					key: "NAME",
					text: "NAME",
					path: "data>/SearchTagsParams(searchToken='$suggestValue')/Results",
					filter: [],
					sorter: []
				},
				token: {
					key: "NAME",
					text: "NAME"
				}
			});
		},

		onRouteMatched: function(oEvent) {
			//CSN :1680062499　dropdownlist value is not been reset
			var oCampaignComboBox = this.byId("campaignComboBox");
			oCampaignComboBox.setValue(undefined);
			var oMode = oEvent.getParameters().name;
			var that = this;
			//this.destroyRTE();
			BaseController.prototype.onRouteMatched.apply(this, arguments);
			// idea object model has to be set before executing promises
			var oIdea = this.getObjectModel();
			oIdea.getDataInitializedPromise().done(function(oData) {
				that.bindCampaignList(oData, oIdea.isNew());
				that.bindAnonymousList(oData, oIdea.isNew());
				oIdea.setProperty("/OLD_RESP_NAME", oIdea.getProperty("/RESP_VALUE_NAME"));
				that._oldCampaignId = oIdea.getProperty("/CAMPAIGN_ID");
				that._oldCampaignForm = oIdea.getProperty("/CAMPAIGN_FORM_CODE");
				//Set Idea form Fields Value when Edit Mode
				var oFormFields = that.byId("ideaFormAddFields");
				if (oMode === "idea-edit") {
					//Set the Responsibility List Row
					that.setRespListProperty.call(that, oIdea, oIdea.oData.RESP_NAME);
					if (oFormFields.getItems()[0]) {
						//remove all the fields
						oFormFields.removeAllItems();
					}
					if (oIdea.oData.CAMPAIGN_ID) {
						that.getModel("data").read("/CampaignSmall(" + oIdea.oData.CAMPAIGN_ID + ")/FormFields", {
							urlParameters: {
								"$orderby": "SEQUENCE_NO"
							},
							success: function(oResult) {
								var aFields = oResult.results;
								//that.addFormFields.call(that, aFields, oFormFields, oIdea);
								var aFormFieldsValue = oIdea.oData.FieldsValue;
								if (aFields && aFormFieldsValue && aFormFieldsValue.length > 0 && aFields.length > 0 && aFields[0].FORM_CODE ===
									aFormFieldsValue[0].FORM_CODE) {
								// 	var iLength = aFields.length - aFormFieldsValue.length;
								// 	var aNewAddFields = [];
								// 	aNewAddFields = aFields.splice(aFormFieldsValue.length, iLength);
									var aNewAddFields = that.cacluateNewFieldsAdded(aFields,aFormFieldsValue);
									oIdea.setProperty("/NEW_ADDED_FIELDS", aNewAddFields);
								}
								that.addFormFields.call(that, oIdea.oData.FieldsValue, oFormFields, oIdea);
							},
							error: function(oMessage) {
								MessageToast.show(oMessage.message);
							}
						});

					}
					that.syncAuthorToContributionShare();
				} else {
					that.setRespListProperty.call(that, oIdea, oIdea.oData.RESP_VALUE_CODE);
					if (oFormFields.getItems()[0]) {
						//remove all the fields
						oFormFields.removeAllItems();
					}
					//From the campaign page to create Idea, go to read the Campaign's form fields	
					if (oIdea.oData.CAMPAIGN_ID) {
						that.getModel("data").read("/CampaignSmall(" + oIdea.oData.CAMPAIGN_ID + ")/FormFields", {
							urlParameters: {
								"$orderby": "SEQUENCE_NO"
							},
							success: function(oResult) {
								var aFields = oResult.results;
								that.addFormFields.call(that, aFields, oFormFields, oIdea);
							},
							error: function(oMessage) {
								MessageToast.show(oMessage.message);
							}
						});

					}
				}

			});

			jQuery.when(oIdea.getPropertyModelInitializedPromise(), this._dViewShown).done(function(oProperties) {
				that.initRTE(oProperties);
				that.initIdeaDetails();
				//When delete an idea then press create idea button the page will display 'object not existed'
				if (that.getObjectModel().isNew() && !that.getObjectExists()) {
					that.setObjectExists(true);
				}
				if (!that.getObjectModel().getPropertyModel().getProperty("/actions/modify/enabled") && !that.getObjectModel().getPropertyModel().getProperty(
					"/actions/del/enabled")) {
					that.setObjectExists(false);
				}
			});

			var systeamSetting = Configuration.getSystemSetting("sap.ino.config.DISABLE_IDEA_IMAGE");
			var systeamSettingPhaseBar = Configuration.getSystemSetting("sap.ino.config.DISABLE_IDEA_IMAGE_HIDE_PHASE_BAR");
			this.setViewProperty('/ENABLE_IDEA_IMAGE', !(systeamSetting * 1) && !(systeamSettingPhaseBar * 1));

			this.setHelp("IDEA_MODIFY");
			this.showSection("sectionDetails");
			this.byId("RespList").onAfterRendering = function() {
				sap.m.Input.prototype.onAfterRendering.apply(this);
				that.byId("NAME").focus();
			};
		},
        cacluateNewFieldsAdded: function(campaignFields,fieldsValue){
            var aNewFields = [];
            var fnFilterValue = function(fields, code){
                return fields.filter(function(oValue){
                    return oValue.CODE === code;
                });
            };
           for(var i = 0 ; i < campaignFields.length; i++){
                var aFilter = fnFilterValue(fieldsValue,campaignFields[i].CODE);
                if(aFilter.length === 0 && campaignFields[i].IS_ACTIVE){
                    aNewFields.push(campaignFields[i]);
                }
           }
           return aNewFields;
           
        },
		/*
		 * Deletes current object and navigates idea list
		 */
		onDelete: function(oEvent) {
			var oController = this;
			var oDelBtn = oEvent.getSource();
			var oObjectModel = oController.getObjectModel();
			var ppmConfig = Configuration.getSystemSettingsModel().getProperty("/sap.ino.config.PPM_INTEGRATION_ACTIVE");
			var intObjectExisted = oObjectModel.getProperty("/INTEGRATION_OBJECT_EXIST");
			var bHasReward = oObjectModel.getPropertyModel().getProperty("/actions/del/customProperties/hasReward");
			var bDeleteAllowed = oObjectModel.getPropertyModel().getProperty("/actions/del/enabled");
			var bIsMergedWithVote = oObjectModel.getPropertyModel().getProperty("/actions/del/customProperties/isMergeedWithVote");
			if (bHasReward) {
				//has reward ==> can't delete
				MessageToast.show(this.getText("MSG_IDEA_HAVE_REWARD_CANNOT_DELETE"));
			} else if (!bDeleteAllowed) {
				MessageToast.show(this.getText("OBJECT_MSG_DELETE_FAILED"));
			} else if (bIsMergedWithVote) {
				MessageToast.show(this.getText("MSG_IDEA_MERGED_WITH_VOTE_CANNOT_DELETE"));
			} else {
				//EVALUATION 
				var bHasEvaluation = oObjectModel.getProperty("/EVALUATION_COUNT");
				var isManager = oObjectModel.getPropertyModel().getProperty("/actions/del/customProperties/isManager");
				if (!bHasEvaluation || (bHasEvaluation && isManager)) {
					//havn't evaluation / hava evaluation and the user is manager/coach ==>add ppm check, then delete
					//var msgConfirm = ppmConfig === "1" ? "MSG_IDEA_CAMP_MANAGER_DEL_CONFIRM_HAVE_PPM" : "MSG_DEL_CONFIRM";
					var msgConfirm = "MSG_DEL_CONFIRM";
					if (ppmConfig === "1" || intObjectExisted) { //PPM Check and integration object check
						msgConfirm = "MSG_IDEA_CAMP_MANAGER_DEL_CONFIRM_HAVE_PPM_INTEGRATION";
					}

					var oDelRequest = oController.executeObjectAction("del", {
						messages: {
							confirm: msgConfirm,
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
						oController.navigateTo("idealist");
					});
					// 	oDelRequest.fail(function(oResponse) {
					// 		if (oResponse.MESSAGES && oResponse.MESSAGES.length > 0) {
					// 			MessageToast.show(oResponse.MESSAGES[0].MESSAGE_TEXT);
					// 		}
					// 	}); 

				} else {
					//has evaluation and he user is submitter==> can't delete idea
					MessageToast.show(this.getText("MSG_IDEA_DEL_FAILED_SUBMITTER_HAVE_EVALUATION"));
				}
			}
			/***
			oModel.read("/IdeaFull(" + oObjectModel.getProperty("/ID") + ")/EvaluationRequestsNumber/$count", {
				success: function(oResult) {
					var mgrPrivilege = oObjectModel.getPropertyModel().getProperty("/actions/del/customProperties/isManager"),
						oEvalReqCount = Number(oResult);
					if (!mgrPrivilege && oEvalReqCount >= 1) {
						MessageToast.show(oController.getText("MSG_IDEA_EXISTS_EVALUATION_REQUEST"));
						return;
					}
					var msgConfirm = oEvalReqCount >= 1 ? "MSG_IDEA_CAMP_MANAGER_DEL_CONFIRM" : "MSG_DEL_CONFIRM";
					var oDelRequest = oController.executeObjectAction("del", {
						messages: {
							confirm: msgConfirm,
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
						oController.navigateTo("idealist");
					});
					oDelRequest.fail(function(oResponse) {
						if (oResponse.MESSAGES && oResponse.MESSAGES.length > 0) {
							MessageToast.show(oResponse.MESSAGES[0].MESSAGE_TEXT);
						}
					});
				}
			});
			***/
		},

		onCampaignSelectionChange: function() {
			var that = this;
			var oIdea = this.getObjectModel();
			var oFormFields = this.byId("ideaFormAddFields");
			this.resetClientMessages();
			if (oFormFields.getItems()[0]) {
				//remove all the fields
				oFormFields.removeAllItems();
				if (oIdea._isNew) {
					oIdea.oData.FieldsValue = [];
				}
			}
			//Clear the Responsiblity List Value field
			oIdea.setProperty("/RESP_VALUE_CODE", "");
			oIdea.setProperty("/RESP_VALUE_NAME", "");
			oIdea.setProperty("/RESP_VALUE_DESCRIPTION", "");
			var oComboBox = this.byId("campaignComboBox");
			var sCampaignId = oComboBox.getSelectedKey();

			if (sCampaignId > 0 && oComboBox) {
				var sCampaignTitle = oComboBox.getItemByKey(sCampaignId).getProperty("text");
				oComboBox.setValue(sCampaignTitle);
			}
			if (!oIdea._isNew) {
				//When Edit mode, if the idea form is not the same with the Campagin
				//then Pop-up message box to decide use which form  
				//If Formfields Not changed, then no need to reload the new fields from the campaign 
				this.onFormChanged.call(this, oIdea, sCampaignId, oFormFields, oComboBox);
				//that.syncAuthorToContributionShare();
			} else {
				//When create Idea, read campaign odata directly
				if (sCampaignId) {
					this.getModel("data").read("/CampaignSmall(" + sCampaignId + ")/FormFields", {
						urlParameters: {
							"$orderby": "SEQUENCE_NO"
						},
						success: function(oData) {
							var mFields = oData.results;
							that.addFormFields.call(that, mFields, oFormFields, oIdea);
							//that.syncAuthorToContributionShare();
						},
						error: function(oMessage) {
							MessageToast.show(oMessage.message);
						}
					});
				}
			}
			var oIdeaData = this.getModel("data");
			oIdeaData.attachRequestCompleted(oIdeaData, that.syncAuthorToContributionShareBinding, that);
			this.bindSimilarIdeas();
			this.bindAnonymousList(oIdeaData, oIdea.isNew(), sCampaignId);
			//var sPrefix = Configuration.getBackendRootURL() + "/sap/ino/";
			//var newIdeaCreationUrl = sPrefix + this.getNavigationLink(this.getCurrentRoute()) + "?campaign=" + sCampaignId;
			//window.history.pushState(null, null, newIdeaCreationUrl);
		},

		addFormFields: function(aFields, oFormFields, oIdea, oDialogAction) {
			var that = this;
			if (that.aCheckBoxes) {
				that.aCheckBoxes = [];
			}
			if (that.aComboBoxes) {
				that.aComboBoxes = [];
			}
			var fnGetDataType = function(oField) {
				var oType;

				switch (oField.DATATYPE_CODE) {
					case "BOOLEAN":
						oType = !oField.VALUE_OPTION_LIST_CODE ? new IntNullableBooleanType(null) : new sap.ino.commons.models.types.IntegerType();
						break;
					case "INTEGER":
						if (oField.MANDATORY) {
							oType = new IntegerType(null, {
								minimum: (oField.NUM_VALUE_MIN || undefined),
								maximum: (oField.NUM_VALUE_MAX || undefined)
							});
						} else {
							oType = new IntegerNullableType(null, {
								minimum: (oField.NUM_VALUE_MIN || undefined),
								maximum: (oField.NUM_VALUE_MAX || undefined)
							});
						}

						break;
					case "NUMERIC":
						if (oField.MANDATORY) {
							oType = new FloatType({
								groupingEnabled: false
							}, {
								minimum: (oField.NUM_VALUE_MIN || undefined),
								maximum: (oField.NUM_VALUE_MAX || undefined)
							});
						} else {
							oType = new FloatNullableType({
								groupingEnabled: false
							}, {
								minimum: (oField.NUM_VALUE_MIN || undefined),
								maximum: (oField.NUM_VALUE_MAX || undefined)
							});
						}
						break;
					case "TEXT":
						oType = new StringType(null, {
							minLength: (oField.MANDATORY ? 1 : undefined)
						});
						break;
					case "RICHTEXT":
						oType = new StringType(null, {
							minLength: (oField.MANDATORY ? 1 : undefined)
						});
						break;
					case "DATE":
						oType = new DateType(null, {
							nullable: (oField.MANDATORY ? false : true)
						});
						break;
					default:
						break;
				}

				return oType;
			};
			//fix bug for next monday
			var onSelectionChangeLaborDatum = function(oEvent) {
				var sValue = oEvent.getParameters().value;
				var oSource = oEvent.getSource();
				var oItem = oSource.getItemByText(sValue);
				if (oItem === null) {
					var oMessage = new Message({
						code: "IDEA_FORM_MSG_DROPDOWN_LIST",
						type: MessageType.Error
					});
					this.oIdeaFormMessage = oMessage;
					that.setClientMessage(oMessage, this);
				} else {
					that.resetClientMessages();
				}
			};
			var onSelectionChangeWrongData = function(oEvent) {
				var oSource = oEvent.getSource();
				var sValue = oSource.getValue();
				var oItem = oSource.getItemByText(sValue);
				if (sValue && !oItem) {
					that.setClientMessage(
						new Message({
							code: "IDEA_FORM_MSG_DROPDOWN_LIST",
							type: MessageType.Error
						}),
						this);
				} else {
					that.resetClientMessages();
				}
			};
			var fnChkboxSelect = function(oEvent) {
				if (!this.getSelected()) {
					this.setValueState('Error');
					that.setClientMessage(
						new Message({
							code: "IDEA_OBJECT_MSG_CHECK_BOX_UNTICK",
							type: MessageType.Error
						}), this);

				} else {
					that.resetClientMessages(oEvent.getParameter('id'));
					this.setValueState('None');
				}
			};
			var bEnableEdit = oIdea.getPropertyModel().getProperty("/nodes/Root/attributes/CAMPAIGN_ID/changeable");
			var aNewAddedFields = oIdea.getProperty("/NEW_ADDED_FIELDS");
			if (aNewAddedFields && aNewAddedFields.length > 0) {
				aFields = aFields.concat(aNewAddedFields);
			//Sort by Sequence Number
    		  aFields.sort(function(o1, o2) {
    			if (o1.SEQUENCE_NO < o2.SEQUENCE_NO) {
    				return -1;
    			} else {
    				return 1;
    			}
    		});	
    		oIdea.setProperty("/FieldsValue/",aFields);				
			}
			
			jQuery.each(aFields, function(iId, oField) {
			    if(!oField.IS_ACTIVE){
			        return true;
			    }
			    
				if (oIdea._isNew || oDialogAction === MessageBox.Action.OK || !oField.ID) {
					//bind Idea Model
					var oFieldValue = jQuery.extend({
						ID: oIdea.getNextHandle(),
						FIELD_CODE: oField.CODE
					}, oField);
					oIdea.setProperty("/FieldsValue/" + iId, oFieldValue);
				}
				
				if(oField.IS_DISPLAY_ONLY){
				var oRichTextHtml = new HTML({
					sanitizeContent: true,
					preferDOM: false,
					content: {
						model: "object",
						path: "/FieldsValue/" + iId + "/DISPLAY_TEXT",
						formatter: that.formatter.wrapHTML
					}
				});
				 oFormFields.addItem(oRichTextHtml);
				 return true;   
				}
				var sUnitCodelbl;
				if (oField.UOM_CODE) {
					sUnitCodelbl = oField.DEFAULT_TEXT + "(" + CodeModel.getText("sap.ino.xs.object.basis.Unit.Root", oField.UOM_CODE) + ")";
				} else {
					sUnitCodelbl = oField.DEFAULT_TEXT;
				}
				var bMandatory = false;
				if (oField.MANDATORY === 1) {
					bMandatory = true;
				}
				var sDataType;
				sDataType = mDataType[oField.DATATYPE_CODE];
				if (oField.VALUE_OPTION_LIST_CODE) {
					//Valuelist used, then got the value List
					var oLabel = new Label({
						text: sUnitCodelbl,
						tooltip: oField.DEFAULT_LONG_TEXT,
						required: bMandatory
					});
					if (oField.IS_HIDDEN_SETTING && oField.IS_HIDDEN_SETTING === 1) {
						oLabel.setTooltip(that.getText("IDEA_EDIT_FORM_HIDDEN_TOOLTIP"));
					} else if (oField.IS_HIDDEN_SETTING === undefined && oField.IS_HIDDEN === 1) {
						oLabel.setTooltip(that.getText("IDEA_EDIT_FORM_HIDDEN_TOOLTIP"));
					}
					oLabel.addStyleClass("sapInoIdeaFormLabelStyle");
					oFormFields.addItem(oLabel);
					var sCodeTable = "sap.ino.xs.object.basis.ValueOptionList.Root_" + oField.VALUE_OPTION_LIST_CODE;
					//if (oIdea._isNew || oDialogAction === MessageBox.Action.OK) {
					if (oFieldValue) {
						oFieldValue.valueOptionList = CodeModel.getCodes(sCodeTable, function(oCode) {
							return oCode.ACTIVE === 1;
						});
					} else {
						oField.valueOptionList = CodeModel.getCodes(sCodeTable, function(oCode) {
							return oCode.ACTIVE === 1;
						});
					}
					//}

					var sValueSelected = "object>/FieldsValue/" + iId + "/" + sDataType;
					var oSelectedKey = {
						path: sValueSelected,
						type: fnGetDataType(oField)
					};
					var oComboBox = new ComboBox({
						enabled: bEnableEdit,
						tooltip: oField.DEFAULT_LONG_TEXT,
						selectedKey: oSelectedKey,
						width: "100%",
						//selectionChange: onSelectionChangeLaborDatum
						change: oField.MANDATORY ? onSelectionChangeLaborDatum : onSelectionChangeWrongData
					});
					oComboBox.addItem();
					var sKey = "{object>" + sDataType + "}";
					var oItemTemplate = new ListItem({
						key: sKey,
						text: "{object>DEFAULT_TEXT}"
					});
					var sBindingPath = "object>/FieldsValue/" + iId + "/valueOptionList";
					oComboBox.bindItems({
						path: sBindingPath,
						template: oItemTemplate,
						sorter: new Sorter("SEQUENCE_NO")
					});
					if (!that.aComboBoxes) {
						that.aComboBoxes = [];
					}
					that.aComboBoxes.push(oComboBox);
					oFormFields.addItem(oComboBox);
				} else {
					if (oField.DATATYPE_CODE === "BOOLEAN") {
						if (!that.aCheckBoxes) {
							that.aCheckBoxes = [];
						}
						var oCheckBox = new CheckBox({
							text: oField.DEFAULT_TEXT,
							enabled: bEnableEdit,
							tooltip: oField.DEFAULT_LONG_TEXT,
							selected: "{object>/FieldsValue/" + iId + "/BOOL_VALUE}",
							select: bMandatory ? fnChkboxSelect : function() {}
						});
						if (oField.IS_HIDDEN_SETTING && oField.IS_HIDDEN_SETTING === 1) {
							oCheckBox.setTooltip(that.getText("IDEA_EDIT_FORM_HIDDEN_TOOLTIP"));
						} else if (oField.IS_HIDDEN_SETTING === undefined && oField.IS_HIDDEN === 1) {
							oCheckBox.setTooltip(that.getText("IDEA_EDIT_FORM_HIDDEN_TOOLTIP"));
						}
						var oChkLabel = oCheckBox._getLabel();
						if (bMandatory) { //Add * to the check box
							oChkLabel.addStyleClass("sapMLabelRequired");
							that.aCheckBoxes.push(oCheckBox);
						}
						oChkLabel.addStyleClass("sapInoIdeaFormLabelStyle");
						oFormFields.addItem(oCheckBox);

					} else {
						var oFieldControl;
						var txtLabel = new Label({
							text: sUnitCodelbl,
							tooltip: oField.DEFAULT_LONG_TEXT,
							required: bMandatory
						});
						if (oField.IS_HIDDEN_SETTING && oField.IS_HIDDEN_SETTING === 1) {
							txtLabel.setTooltip(that.getText("IDEA_EDIT_FORM_HIDDEN_TOOLTIP"));
						} else if (oField.IS_HIDDEN_SETTING === undefined && oField.IS_HIDDEN === 1) {
							txtLabel.setTooltip(that.getText("IDEA_EDIT_FORM_HIDDEN_TOOLTIP"));
						}
						txtLabel.addStyleClass("sapInoIdeaFormLabelStyle");
						oFormFields.addItem(txtLabel);
						var oValue = {
							path: "object>/FieldsValue/" + iId + "/" + sDataType,
							type: fnGetDataType(oField)
							//type:new sap.ui.model.type.Integer(null) ???nullable new type to identify
						};
						if (oField.DATATYPE_CODE === "RICHTEXT") {
							// Otherwise there the RTE is not rendered properly when the application is launched uncached
							oFieldControl = sap.ui.xmlfragment({
								id: that.getView().getId(),
								fragmentName: "sap.ino.vc.idea.fragments.IdeaRichTxt"
							}, that);
							oFieldControl.attachReady(function() {
								this.bindProperty("value", {
									path: oValue.path,
									type: fnGetDataType(oField)
								});
							});
						} else if (oField.DATATYPE_CODE === "DATE") {
							oFieldControl = new sap.m.DatePicker({
								enabled: bEnableEdit,
								tooltip: oField.DEFAULT_LONG_TEXT,
								value: {
									path: oValue.path,
									type: fnGetDataType(oField)
								},
								width: "100%"
							});
						} else {
							oFieldControl = new Input({
								enabled: bEnableEdit,
								tooltip: oField.DEFAULT_LONG_TEXT,
								value: oValue,
								width: "100%"
							});

						}
						if (oFieldControl.addAriaLabelledBy) {
							oFieldControl.addAriaLabelledBy(txtLabel);
						}
						oFieldControl.addStyleClass("sapUiSmallMarginBottom");
						oFormFields.addItem(oFieldControl);
					}

				}
			});
		},

		setRespListProperty: function(oIdea, sCode) {
			var oRespListInput = this.byId("RespList");
			if (sCode) {
				oRespListInput.setVisible(true);
			} else {
				oRespListInput.setVisible(false);
			}
			if (oIdea.oData.RESP_CODE) {
				this.getModel("data").read("/ResponsibilityValueSearchParams(searchToken='',respCode='" + oIdea.oData.RESP_CODE + "')/Results", {
					urlParameters: {
						"$orderby": "NAME"
					},
					success: function(oData) {
						oIdea.setProperty("/Resp_Value", oData.results);
					}
				});
			}

		},
		onSuggestionList: function(oEvent) {
			var that = this;
			var oIdea = this.getObjectModel();
			var mEvent = jQuery.extend({}, oEvent, true);
			var sTerm = jQuery.sap.encodeURL(mEvent.getParameter("suggestValue"));
			this.resetClientMessages();
			this.getModel("data").read("/ResponsibilityValueSearchParams(searchToken='" + sTerm + "',respCode='" + oIdea.oData.RESP_CODE +
				"')/Results", {
					urlParameters: {
						"$orderby": "NAME"
					},
					success: function(oData) {
						oIdea.setProperty("/Resp_Value", oData.results);
						that.byId("RespList").setFilterSuggests(false);
					}
				});
		},
		onSuggestionSelected: function(oEvent) {
			/*			this.resetClientMessages();
			var oIdea = this.getObjectModel();
			var sBindingPath = oEvent.getParameter("selectedItem").oBindingContexts.object.sPath;
            this.onRespValueChangedMessageBox.call(this,oIdea,sBindingPath);*/
		},
		onHandleValueHelp: function(oEvent) {
			var that = this;
			var oReslistDialog = that.createRespListDialog();
			oReslistDialog.open();
			oReslistDialog.setBusy(true);
			var oTreeTable = that.byId('respValueTreeTable');
			var oIdea = this.getObjectModel();
			this.getModel("data").read("/ResponsibilityValueSearchParams(searchToken='',respCode='" + oIdea.oData.RESP_CODE + "')/Results", {
				urlParameters: {
					"$orderby": "SEQUENCE_NO"
				},
				success: function(oData) {
					oReslistDialog.setBusy(false);
					oIdea.setProperty("/Resp_Value", oData.results);
					var aHierarchy_RespValue = that.convertToHierarchy(oData.results, "ID", "PARENT_VALUE_ID");
					oIdea.setProperty("/Resp_Value_Tree", aHierarchy_RespValue);
					that.setViewProperty("/ENABLE_OK_BTN", false);

					that.resetClientMessages();
					that.byId('RespList')._closeSuggestionPopup();

					oTreeTable.attachBrowserEvent("dblclick", function() {
						//Double click for the Popup RL list selection   
						if (oTreeTable.isIndexSelected(that._treeTableIndex)) {
							oTreeTable.removeSelectionInterval(that._treeTableIndex, that._treeTableIndex);
						} else {
							oTreeTable.addSelectionInterval(that._treeTableIndex, that._treeTableIndex);
						}
						if (that._treeTableIndex > -1) {
							var sBindingPath = oTreeTable.getContextByIndex(that._treeTableIndex).getPath();
							that.onRespValueChangedMessageBox.call(that, oIdea, sBindingPath);

							if (that._oRespListDialog) {
								that._oRespListDialog.close();
								that._oRespListDialog.destroy();
								that._oRespListDialog = undefined;
							}
						}
						that._treeTableIndex = -1;
					});
				},
				error: function(oMessage) {
					oIdea.setProperty("/Resp_Value_Tree", []);
					oReslistDialog.setBusy(false);
					MessageToast.show(oMessage.message);
				}
			});
		},
		convertToHierarchy: function(aObjects, sKeyName, sParentKeyName) {
			var aNodeObjects = this.createStructure(aObjects, sParentKeyName);
			var oTreeNode = aNodeObjects.root;
			this.arrToHierarchy(oTreeNode, aNodeObjects, sKeyName);
			return oTreeNode;
		},
		createStructure: function(aNodes, sParentKeyName) {
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
		},
		arrToHierarchy: function(oTreeNode, aNodeObjects, sKeyName) {
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
		},
		onRespValueDialogClose: function() {
			if (this._oRespListDialog) {
				this._oRespListDialog.close();
				this._oRespListDialog.destroy();
				this._oRespListDialog = undefined;
			}
		},
		onRespRowSelectionChange: function(oEvent) {
			var that = this;
			var oRespValueTree = that.byId("respValueTreeTable");
			var iIndex = oRespValueTree.getSelectedIndex();
			if (iIndex > -1) {
				this.setViewProperty("/ENABLE_OK_BTN", true);
				this._treeTableIndex = iIndex;
			} else {
				this.setViewProperty("/ENABLE_OK_BTN", false);
			}

		},
		createRespListDialog: function() {
			if (!this._oRespListDialog) {
				this._oRespListDialog = this.createFragment("sap.ino.vc.idea.fragments.ResponsibilityListValue", this.getView().getId());
				this.getView().addDependent(this._oRespListDialog);
			}
			return this._oRespListDialog;

		},
		onSearchRespValue: function(oEvent) {
			var sValue = jQuery.sap.encodeURL(oEvent.getParameter("value"));
			var oIdea = this.getObjectModel();
			this.getModel("data").read("/ResponsibilityValueSearchParams(searchToken='" + sValue + "',respCode='" + oIdea.oData.RESP_CODE +
				"')/Results", {
					urlParameters: {
						"$orderby": "NAME"
					},
					success: function(oData) {
						oIdea.setProperty("/Resp_Value", oData.results);
					}
				});

		},
		onSelectedItem: function(oEvent) {
			var that = this;
			var oIdea = this.getObjectModel();
			var oRespValueTree = that.byId("respValueTreeTable");
			var iIndex = oRespValueTree.getSelectedIndex();
			if (iIndex > -1) {
				var sBindingPath = oRespValueTree.getContextByIndex(iIndex).getPath();
				that.onRespValueChangedMessageBox.call(that, oIdea, sBindingPath);
			}
			if (this._oRespListDialog) {
				this._oRespListDialog.close();
				this._oRespListDialog.destroy();
				this._oRespListDialog = undefined;
			}
		},
		setIdeaModelRespValueProperty: function(oIdea, sBindingPath) {
			oIdea.setProperty("/RESP_VALUE_CODE", oIdea.getProperty(sBindingPath).CODE);
			oIdea.setProperty("/RESP_VALUE_NAME", oIdea.getProperty(sBindingPath).NAME);
			oIdea.setProperty("/RESP_VALUE_BINDING_CODE", oIdea.getProperty(sBindingPath).CODE);
			oIdea.setProperty("/OLD_RESP_NAME", oIdea.getProperty("/RESP_VALUE_NAME"));
		},
		onRespValueChangedMessageBox: function(oIdea, sBindingPath) {
			var that = this;
			if (!oIdea._isNew) { //Modify
				var oCurrentUser = Configuration.getCurrentUser();
				var aSubmitters = oIdea.oData.SubmitterContributors;
				var oSumbitter = aSubmitters.filter(function(submitter) {
					return submitter.IDENTITY_ID === oCurrentUser.USER_ID;
				});
				var sCode = oIdea.getProperty("/RESP_VALUE_CODE");
				var sSelectCode = oIdea.getProperty(sBindingPath).CODE;
				if (!oSumbitter.length && sCode !== sSelectCode) //Login user is not a submiiter,popup the message
				{
					MessageBox.show(this.getText("IDEA_OBJECT_MSG_RESP_LIST_VALUE_CHG", oIdea.getProperty("/RESP_NAME")), {
						title: this.getText("IDEA_OBJECT_RESP_LIST_POP_TITLE", oIdea.getProperty("/RESP_NAME")),
						icon: MessageBox.Icon.WARNING,
						actions: [MessageBox.Action.YES, MessageBox.Action.NO],
						onClose: function(sDialogAction) {
							if (sDialogAction === MessageBox.Action.YES) {
								that.setIdeaModelRespValueProperty(oIdea, sBindingPath);
							} else {
								oIdea.setProperty("/RESP_VALUE_NAME", oIdea.getProperty("/OLD_RESP_NAME"));
							}
						}
					});
				} else //No Need to popup message
				{
					that.setIdeaModelRespValueProperty(oIdea, sBindingPath);
				}
			} else { //Create
				that.setIdeaModelRespValueProperty(oIdea, sBindingPath);
			}
		},
		onRespListValueChange: function() {
			var oRespListInput = this.byId("RespList");
			var oIdea = this.getObjectModel();
			var sValue = oRespListInput.getValue().trim();
			var aRespListValues = oIdea.getProperty("/Resp_Value");
			var sBindingPath;
			var that = this;
			jQuery.each(aRespListValues, function(index, oRespListValue) {
				if (sValue === oRespListValue.NAME.trim()) {
					sBindingPath = "/Resp_Value/" + index;
					return false;
				}
			});
			if (sBindingPath) {
				that.onRespValueChangedMessageBox.call(that, oIdea, sBindingPath);
			} else { //Mean find no any values
				oIdea.setProperty("/RESP_VALUE_BINDING_CODE", "");
				that.resetClientMessages();
				that.setClientMessage(
					new Message({
						code: "IDEA_OBJECT_MSG_RESP_LIST_VALUE_WRONG_INPUT",
						type: MessageType.Error
					}),
					that.byId("RespList"));
			}
		},
		onFormChanged: function(oIdea, sCampaignId, oFormFields, oCampaignComboBox) {
			var aFields;
			var that = this;
			var soldFormCode = that._oldCampaignForm;
			var bChangeable = oIdea.getPropertyModel().getProperty("/nodes/Root/attributes/NAME/changeable");
			this.getModel("data").read("/CampaignSmall(" + sCampaignId + ")/FormFields", {
				urlParameters: {
					"$orderby": "SEQUENCE_NO"
				},
				success: function(oData) {
					aFields = oData.results;
					if (bChangeable) {
						if (!aFields.length && soldFormCode) {
							//New Campaign FormCode is null
							MessageBox.confirm(that.getText("IDEA_OBJECT_MSG_CONFIRM_CAMPAIGN_CHG"), {
								title: that.getText("IDEA_OBJECT_EDIT_POP_TITLE"),
								icon: MessageBox.Icon.WARNING,
								actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
								onClose: function(sDialogAction) {
									if (sDialogAction === MessageBox.Action.OK) {
										oIdea.oData.FieldsValue = aFields;
										oIdea.setProperty("/NEW_ADDED_FIELDS", []);
										that.addFormFields.call(that, aFields, oFormFields, oIdea, sDialogAction);
										that._oldCampaignId = oCampaignComboBox.getSelectedKey();
										that._oldCampaignForm = null;
									} else {
										that.addFormFields.call(that, oIdea.oData.FieldsValue, oFormFields, oIdea);
										oCampaignComboBox.setSelectedKey(that._oldCampaignId);
									}
								}
							});
						} else if (aFields.length && soldFormCode !== aFields[0].FORM_CODE) {
							MessageBox.show(that.getText("IDEA_OBJECT_MSG_EDIT_CAMPAIGN_CHG"), {
								title: that.getText("IDEA_OBJECT_EDIT_POP_TITLE"),
								icon: MessageBox.Icon.WARNING,
								actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
								onClose: function(sDialogAction) {
									if (sDialogAction === MessageBox.Action.OK) {
										oIdea.oData.FieldsValue = aFields;
										oIdea.setProperty("/NEW_ADDED_FIELDS", []);
										that.addFormFields.call(that, aFields, oFormFields, oIdea, sDialogAction);
										that._oldCampaignId = oCampaignComboBox.getSelectedKey();
										that._oldCampaignForm = aFields[0].FORM_CODE;
									} else {
										that.addFormFields.call(that, oIdea.oData.FieldsValue, oFormFields, oIdea);
										oCampaignComboBox.setSelectedKey(that._oldCampaignId);
									}
								}
							});
						} else {
							that.addFormFields.call(that, oIdea.oData.FieldsValue, oFormFields, oIdea);
						}
					} else {
						that.addFormFields.call(that, oIdea.oData.FieldsValue, oFormFields, oIdea);
					}
				},
				error: function(oMessage) {
					MessageToast.show(oMessage.message);
				}
			});
		},

		onContributorsTokenChanged: function(oControlEvent) {
			if (this._checkContributionReadOnly() || !this._checkContributionEnable() || !oControlEvent || oControlEvent.getParameters().type !==
				"tokensChanged") {
				return;
			}
			var oIdea = this.getObjectModel();
			var removedTokens = oControlEvent.getParameters().removedTokens;
			var oCurrentUser = Configuration.getCurrentUser();
			var addedTokens = oControlEvent.getParameters().addedTokens;
			var aContributionShare = oIdea.getProperty("/ContributionShare");
			var nCreateId = oIdea.isNew() ? oCurrentUser.USER_ID : oIdea.getProperty("/CREATED_BY_ID");
			var sCreateName = oIdea.isNew() ? oCurrentUser.NAME : oIdea.getProperty("/CREATED_BY_NAME");
			if (!!removedTokens && removedTokens.length > 0) {
				var nKey = parseInt(removedTokens[0].getKey(), 10);
				if (nCreateId === nKey) {
					return;
				}
				for (var index = aContributionShare.length - 1; index >= 0; --index) {
					if (aContributionShare[index].AUTHOR_ID === nKey) {
						aContributionShare.splice(index, 1);
					}
				}
				if (!!aContributionShare && aContributionShare.length === 1 && aContributionShare[0].AUTHOR_ID === nCreateId) {
					aContributionShare = [];
				}
				oIdea.setProperty("/ContributionShare", aContributionShare);
			} else if (!!addedTokens && addedTokens.length > 0) {
				var nCoAuthorID = parseInt(addedTokens[0].getKey(), 10);
				if (!aContributionShare || aContributionShare.length === 0) {
					oIdea.addChild({
						AUTHOR_ID: nCreateId,
						AUTHOR_NAME: sCreateName
					}, "ContributionShare");
				}
				if (nCreateId === nCoAuthorID) {
					return;
				}
				oIdea.addChild({
					AUTHOR_ID: nCoAuthorID,
					AUTHOR_NAME: addedTokens[0].getText()
				}, "ContributionShare");
			}
		},

		setRespValueChangeMsg: function() {
			var oRespListInput = this.byId("RespList");
			var oIdea = this.getObjectModel();
			var sBindingCode = oIdea.getProperty("/RESP_VALUE_BINDING_CODE");
			var aRespListValues = oIdea.getProperty("/Resp_Value");
			var that = this;
			if (!aRespListValues && !sBindingCode) { //No action for the list when click the save as draft then subbmit
				sBindingCode = oIdea.getProperty("/RESP_VALUE_CODE");
			}
			if (!sBindingCode) //Marked this Resp Value by manual type
			{
				var sValue = oRespListInput.getValue().trim();
				jQuery.each(aRespListValues, function(index, oRespListValue) {
					if (sValue === oRespListValue.NAME.trim()) {
						sBindingCode = oRespListValue.CODE;
						return false;
					}
				});
				if (!sBindingCode) { //Find no matched values
					that.setClientMessage(
						new Message({
							code: "IDEA_OBJECT_MSG_RESP_LIST_VALUE_WRONG_INPUT",
							type: MessageType.Error
						}),
						that.byId("RespList"));
				}
			}
		},
		createObjectModel: function(vObjectKey, sRoute, oRouteArgs) {
			var oSettings = {
				nodes: ["Root", "Extension"],
				actions: ["modify", "modifyAndSubmit", "del"],
				continuousUse: true,
				concurrencyEnabled: true,
				readSource: {
					model: this.getDefaultODataModel(),
					includeNodes: [{
							name: "ReassignCampaigns",
							parentNode: "Root",
							primaryKey: "KEY"
                    },
						{
							name: "RespExperts",
							parentNode: "Root",
							primaryKey: "ID"
							}]
				}
			};

			var oIdea;
			// object creation
			if (!vObjectKey) {
				var mQuery = oRouteArgs["?query"] || {};
				var oDefaults;
				try {
					oDefaults = {
						CAMPAIGN_ID: mQuery.campaign ? parseInt(mQuery.campaign, 10) : 0,
						NAME: mQuery.title,
						RESP_VALUE_CODE: mQuery.RespList,
						RESP_VALUE_NAME: mQuery.RespList && CodeModel.getText(
							"sap.ino.xs.object.subresponsibility.ResponsibilityStage.RespValues", mQuery.RespList),
						DESCRIPTION: mQuery.description,
						Tags: mQuery.tags && mQuery.tags.split(","),
						Walls: mQuery.wall ? [{
							WALL_ID: parseInt(mQuery.wall, 10)
                        }] : undefined
					};
				} catch (oError) {
					jQuery.sap.log.error("Failed parsing creation arguments", oError, "sap.ino.vc.idea.Modify.controller");
				}
				oIdea = new Idea(oDefaults, oSettings);
			} else {
				WebAnalytics.logIdeaView(vObjectKey);
				oIdea = new Idea(vObjectKey, oSettings);
			}
			return oIdea;
		},

		initIdeaDetails: function() {
			this._sTitleText = undefined;
			this._sDescriptionText = undefined;
			this._aTags = undefined;
			this._oSimilarModel = undefined;
			this.expandSimilarIdeasOnInit();
		},

		onAnonymousSelectionChange: function(oEvent) {
			var oComboBox = this.byId("anonymousComboBox");
			var object = this.getObjectModel();
			var key = oComboBox.getSelectedKey();
			object.setProperty("/AnonymousFor/0/", {
				"ANONYMOUS_FOR": key
			});
		},

		bindAnonymousList: function(oData, bIdeaIsNew, sCamId) {
			var oComboBox = this.byId("anonymousComboBox");
			var oLabel = this.byId("anonymousOptionLabel");
			var sCampaignId = oData.CAMPAIGN_ID;
			if (sCamId) {
				sCampaignId = sCamId;
			}

			if (oComboBox) {
				var curUserId = this.getModel("user").getProperty("/data").USER_ID;
				var oItemTemplate, sBindingPath;
				var that = this;

				if (oData.AnonymousFor && oData.AnonymousFor.length > 0) {
					oComboBox.setSelectedKey(oData.AnonymousFor[0].ANONYMOUS_FOR);
				} else {
					oComboBox.setSelectedKey("");
				}
				oItemTemplate = new ListItem({
					key: "{data>ANONYMOUS_FOR}",
					text: {
						path: "data>ANONYMOUS_FOR",
						formatter: function(sCode) {
							switch (sCode) {
								case "NONE":
									return that.getText("IDEA_NOT_ANONYMOUS");
								case "ALL":
									return that.getText("IDEA_ANONYMOUS_FOR_ALL");
								case "PARTLY":
									return that.getText("IDEA_NOT_ANONYMOUS_CAMPAIGN_MANAGER");
								case "COACH":
									return that.getText("IDEA_NOT_ANONYMOUS_COACH");
								case "EXPERT":
									return that.getText("IDEA_NOT_ANONYMOUS_EXPERT");
								case "PARTICIPANT":
									return that.getText("IDEA_NOT_ANONYMOUS_PARTICIPANT");
								case "COACH_AND_EXPERT":
									return that.getText("IDEA_NOT_ANONYMOUS_COACH_AND_EXPERT");
								case "COACH_POOL":
									return that.getText("IDEA_NOT_ANONYMOUS_COACH_POOL");
								case "EXPERT_POOL":
									return that.getText("IDEA_NOT_ANONYMOUS_EXPERT_POOL");
								case "COACH_POOL_AND_EXPERT_POOL":
									return that.getText("IDEA_NOT_ANONYMOUS_COACH_POOL_AND_EXPERT_POOL");
							}

						}
					}
				});
				sBindingPath = "data>/IdeaAnonymous";

				if (sCampaignId) {
					oComboBox.bindItems({
						path: sBindingPath,
						template: oItemTemplate,
						filters: [new Filter({
							path: "CAMPAIGN_ID",
							operator: FilterOperator.EQ,
							value1: Number(sCampaignId)
						})]
					});
				} else {
					oComboBox.bindItems({
						path: sBindingPath,
						template: oItemTemplate
					});
				}
				var object = this.getObjectModel();
				var oBinding = oComboBox.getBinding("items");
				if (oBinding) {
					oBinding.attachDataReceived(function(oAnonymousText) {
						if (oAnonymousText.getParameters().data.results.length <= 1) {
							if (oAnonymousText.getParameters().data.results.length > 0) {
								oComboBox.setSelectedKey(oAnonymousText.getParameters().data.results[0].ANONYMOUS_FOR);
								var key = oComboBox.getSelectedKey();
								object.setProperty("/AnonymousFor/0/", {
									"ANONYMOUS_FOR": key
								});
							} else {
								oLabel.setVisible(false);
								oComboBox.setVisible(false);
							}
							oComboBox.setEditable(false);
						} else {
							oComboBox.setEditable(true);
						}
						if (oData.CREATED_BY_ID === curUserId || bIdeaIsNew) {
							oComboBox.setEditable(true);
						} else {
							oComboBox.setEditable(false);
						}
					}, this);
				}
			}
		},

		bindCampaignList: function(oData, bIdeaIsNew) {
			var oComboBox = this.byId("campaignComboBox");
			var oItemTemplate, sBindingPath;
			var that = this;

			// When idea is saved and campaign is assigned
			// the possible campaigns to reassign are dependent on the idea 
			// and not only on the user thus we need to get the data from the object
			// model
			if (oData.CAMPAIGN_ID && !bIdeaIsNew) {
				oItemTemplate = new ListItem({
					key: "{object>ID}",
					text: "{object>SHORT_NAME}"
				});
				sBindingPath = "object>/ReassignCampaigns";
			} else {
				oItemTemplate = new ListItem({
					key: "{data>ID}",
					text: "{data>SHORT_NAME}"
				});
				sBindingPath = "data>/CampaignSmallIdeaAssign";
			}

			oComboBox.bindItems({
				path: sBindingPath,
				template: oItemTemplate,
				sorter: new Sorter("SHORT_NAME"),
				length: 500
			});

			var oBinding = oComboBox.getBinding("items");
			if (oBinding) {
				oBinding.attachDataReceived(function() {
					that.checkCampaignAllowtoAssign(oData.CAMPAIGN_ID);
				}, this);
			}
		},

		initRTE: function(oProperties) {
			var that = this;
			if (!Device.system.desktop) {
				return;
			}
			this.destroyRTE();
			var bEditable = (oProperties && oProperties.nodes.Root.attributes) ? oProperties.nodes.Root.attributes.DESCRIPTION.changeable :
				true;

			// If it is not editable an HTML element is used as RTE otherwise updates
			// descriptions  also in read-only mode which leads to wrong data-loss handling
			// and the situation that ideas with non-editable descriptions cannot be saved any more

			var oRichTextContainer = this.byId("rteContainer");
			var oRichTextControl;
			that._TextControlID = "richtextControl_" + new Date().getTime();

			if (bEditable) {
				// Otherwise there the RTE is not rendered properly when the application is launched uncached
				jQuery.sap.require("sap.ino.controls.RichTextEditor");
				oRichTextControl = new sap.ino.controls.RichTextEditor({
					id: this.createId(that._TextControlID),
					width: "100%",
					editable: true,
					editorType: "TinyMCE4",
					height: "300px",
					showGroupInsert: true,
					showGroupLink: true,
					showGroupFont: true,
					beforeEditorInit: function(c) {
						c.mParameters.configuration.plugins = c.mParameters.configuration.plugins.replace("image,", "");
						c.mParameters.configuration.link_context_toolbar = true;
						c.mParameters.configuration.plugins = c.mParameters.configuration.plugins.replace("powerpaste", "powerpaste,imagetools");
						c.mParameters.configuration.paste_data_images = true;
						c.mParameters.configuration.automatic_uploads = true;
						c.mParameters.configuration.powerpaste_word_import = "clean";
						c.mParameters.configuration.powerpaste_html_import = "clean";
						c.mParameters.configuration.default_link_target = "_blank";
						c.mParameters.configuration.images_upload_handler = function(oFile, success, failure) {
							var oFileToUpload = oFile.blob();
							// oFileToUpload.name = "image-" + (new Date()).getTime() + Math.floor(Math.random() * 1000) + "." + oFileToUpload.type.substr(oFileToUpload.type.lastIndexOf("/") + 1);
							if (oFileToUpload) {
								Attachment.uploadFile(oFileToUpload).done(function(oResponse) {
									var oIdea = that.getObjectModel();
									success(Configuration.getAttachmentDownloadURL(oResponse.attachmentId));
									oIdea.setProperty("/DESCRIPTION", jQuery.sap._sanitizeHTML(window.tinymce.activeEditor.getContent()));
								}).fail(function() {
									failure();
									MessageToast.show(that.getText("IDEA_OBJECT_MSG_TITLE_IMAGE_CROP_FAILED"));
								});
							}
						};
						c.mParameters.configuration.paste_postprocess = function(editor, fragment) {
							window.tinymce.activeEditor.uploadImages();
						};
					}
				});

				oRichTextControl.attachReady(function onRTEReady() {
					this.bindProperty("value", {
						model: "object",
						path: "DESCRIPTION"
					});
					that._onResize();
					if (!this._sResizeRegId) {
						this._sResizeRegId = ResizeHandler.register(that.getView(), that._onResize);
					}
				});
				oRichTextControl.onAfterRendering = function() {
					sap.ino.controls.RichTextEditor.prototype.onAfterRendering.apply(this);
					that.byId("NAME").focus();
					jQuery("#" + that.byId('objectpage').getId() + "-opwrapper").animate({
						scrollTop: 0
					}, 100);

				};
			} else {
				oRichTextControl = new HTML({
					id: this.createId(that._TextControlID),
					sanitizeContent: true,
					preferDOM: false,
					content: {
						model: "object",
						path: "DESCRIPTION",
						formatter: this.formatter.wrapHTML
					}
				});
			}

			setTimeout(function() {
				oRichTextContainer.destroyItems();
				oRichTextContainer.addItem(oRichTextControl);
			}, 500);
		},

		destroyRTE: function() {
			// Desktop: we use the RTE and need to calculate the best height
			if (this._sResizeRegId) {
				ResizeHandler.deregister(this._sResizeRegId);
			}

			// destroy RTE  when screen is not displayed any more as it will go mad
			// when bindings change and it is not displayed (yet)
			var oRTE = this.getRTE();
			if (oRTE) {
				oRTE.destroy();
			}
		},

		getRTE: function() {
			return this.byId(this._TextControlID);
		},

		// resizes the height of the richtext editor and the similar ideas
		_onResize: function(oEvent) {
			var oView;
			var iHeight;
			var iOldHeight;
			if (oEvent) {
				oView = oEvent.control;
				iHeight = oEvent.size.height;
				iOldHeight = oEvent.oldSize.height;
			} else {
				oView = this.getView();
				iHeight = oView.$().height();
				iOldHeight = 0;
			}

			var oRTE = oView.getController().getRTE();
			if (!oRTE || oRTE.getMetadata().getName() !== "sap.ino.controls.RichTextEditor") {
				return;
			}

			if (Math.abs(iHeight - iOldHeight) > 0) {
				var $Container = oView.$().find(".sapInoIdeaModify");
				// this requires px values
				var iMin = parseInt($Container.css("min-height"), 10) || 400;
				var iMax = parseInt($Container.css("max-height"), 10) || 1000;

				// the surounding container give only little possibilities to get the correct height
				// so we substract from the whole view the heights of the toolbar, header, other fields, ...
				iHeight = iHeight - 600;
				iHeight = iHeight < iMin ? iMin : iHeight;
				iHeight = iHeight > iMax ? iMax : iHeight;
				oRTE.setHeight(iHeight + "px");

				// we need to "wait" till the RTE has resized to its real height
				// this reals height differs from the given height
				setTimeout(function() {
					var $RealRTE = oView.$().find(".mce-tinymce.mce-container");
					var sRealRTEHeight = $RealRTE.css("height");
					// we assume 1.) the same value for top and bottom and 2.) a px value
					var iRTEBorder = parseFloat($RealRTE.css("border-width"), 10);
					if (iRTEBorder) {
						sRealRTEHeight = (parseFloat(sRealRTEHeight, 10) + (2 * iRTEBorder)) + "px";
					}
					var oSimilarIdeas = oView.getController().byId("similarIdeas");
					oSimilarIdeas.setHeight(sRealRTEHeight);
				}, 0);
			}
		},

		onCampaignPressed: function(oEvent) {
			var iId = this.getObjectModel().getProperty("/CAMPAIGN_ID");
			this.navigateTo("campaign", {
				id: iId
			}, true);
		},

		onTagChanged: function(oEvent) {
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
		},

		onTagTokenChanged: function(oEvent) {
			var oMultiInput = oEvent.getSource();

			if (!oEvent.getSource().getAggregation("tokenizer")) {
				return;
			}

			oMultiInput.setValue("");
		},

		getLinkDialog: function() {
			if (!this._oLinkDialog) {
				this._oLinkDialog = this.createFragment("sap.ino.vc.idea.fragments.Link", this.getView().getId());
				this.getView().addDependent(this._oLinkDialog);
				this._oLinkDialog.setInitialFocus(this.createId("URLInput"));
			}
			return this._oLinkDialog;
		},

		onAddLinkDialogCancel: function(oEvent) {
			this.resetClientMessages();
			this._oLinkDialog.close();
		},

		onAddLink: function(oEvent) {
			var oDialog = this.getLinkDialog();
			oDialog.setModel(new JSONModel({
				URL: "",
				LABEL: ""
			}), "link");
			oDialog.bindElement({
				path: "link>/"
			});

			this.resetClientMessages();
			oDialog.open();
		},

		onAddLinkDialogOK: function(oEvent) {
			var oDialog = this.getLinkDialog();
			var oModel = oDialog.getModel("link");

			var iId = oModel.getProperty("/ID");
			var sURL = oModel.getProperty("/URL");
			var sLabel = oModel.getProperty("/LABEL");

			this.resetClientMessages();
			var oMessage = this.getObjectModel().modifyLink(iId, sURL, sLabel);
			if (oMessage) {
				this.setClientMessage(oMessage, this.byId("URLInput"));
			} else {
				oDialog.close();
			}
		},

		onEditLink: function(oEvent) {
			var oDialog = this.getLinkDialog();
			var oBindingContext = oEvent.getSource().getBindingContext("object");

			var iId = this.getObjectModel().getProperty(oBindingContext.sPath + "/ID");
			var sURL = this.getObjectModel().getProperty(oBindingContext.sPath + "/URL");
			var sLabel = this.getObjectModel().getProperty(oBindingContext.sPath + "/LABEL");

			this.resetClientMessages();
			oDialog.setModel(new JSONModel({
				ID: iId,
				URL: sURL,
				LABEL: sLabel
			}), "link");
			oDialog.bindElement({
				path: "link>/"
			});
			oDialog.open();
		},

		onDeleteLink: function(oEvent) {
			var oObject = this.getObjectModel();
			var oChild = oEvent.getSource().getBindingContext("object").getObject();
			oObject.removeChild(oChild);
		},

		crop: function() {
			var that = this;
			var oDeferred = jQuery.Deferred();
			var oTitleImageCropping = this.byId("imageCropping");
			var oFile = oTitleImageCropping.crop();
			// in case the upload image has the same width/height with the cropping image		
			if (oFile) {
				var iAttachmentId = this.getObjectModel().getData().TITLE_IMAGE_ID;
				Attachment.uploadFile(oFile, null, iAttachmentId, true).done(function(oResponse) {
					if (oResponse.attachmentId) {
						var oObject = that.getObjectModel();
						oObject.setTitleImage({
							"ATTACHMENT_ID": oResponse.attachmentId,
							"FILE_NAME": oResponse.fileName,
							"MEDIA_TYPE": oResponse.mediaType
						});
					}
					oDeferred.resolve({
						messages: [{
							"TYPE": "I",
							"MESSAGE": "IDEA_OBJECT_MSG_TITLE_IMAGE_CROP",
							"MESSAGE_TEXT": that.getText("IDEA_OBJECT_MSG_TITLE_IMAGE_CROP"),
							"REF_FIELD": ""
                        }]
					});
				}).fail(function() {
					MessageToast.show(that.getText("IDEA_OBJECT_MSG_TITLE_IMAGE_CROP_FAILED"));
					oDeferred.reject();
				});
			} else {
				oDeferred.resolve();
			}
			return oDeferred.promise();
		},

		checkContributionShare: function() {
			if (!this._checkContributionEnable()) {
				return true;
			}
			var aContributionShare = this.getObjectModel().getProperty("/ContributionShare");
			if (!aContributionShare || aContributionShare.length === 0) {
				return true;
			}
			var sum = 0;
			jQuery.each(aContributionShare, function(index, data) {
				sum += data.PERCENTAGE;
			});
			return sum === 100;
		},

		addAuthorToContributionShare: function() {
			if (!this._checkContributionEnable()) {
				return;
			}
			var oIdea = this.getObjectModel();
			var oCurrentUser = Configuration.getCurrentUser();
			var aContributionShare = oIdea.getProperty("/ContributionShare");
			var nCreateId = oIdea.isNew() ? oCurrentUser.USER_ID : oIdea.getProperty("/CREATED_BY_ID");
			var sCreateName = oIdea.isNew() ? oCurrentUser.NAME : oIdea.getProperty("/CREATED_BY_NAME");
			if (!aContributionShare || aContributionShare.length === 0) {
				oIdea.addChild({
					AUTHOR_ID: nCreateId,
					AUTHOR_NAME: sCreateName,
					PERCENTAGE: 100.00
				}, "ContributionShare");
			}
		},

		formatterContributionShare: function() {
			var oIdea = this.getObjectModel();
			var aContributionShare = oIdea.getProperty("/ContributionShare");

			jQuery.each(aContributionShare, function(index, oData) {
				if (oData.PERCENTAGE > 0) {
					oIdea.setProperty("/ContributionShare/" + index + "/PERCENTAGE", parseInt(oData.PERCENTAGE, 10));
				} else {
					oIdea.setProperty("/ContributionShare/" + index + "/PERCENTAGE", 0);
				}
			});
		},

		checkCampaignAllowtoAssign: function(iCampaignId) {
			var sCampaignId = String(iCampaignId);
			var oCampaignComboBox = this.byId("campaignComboBox");
			var oController = this;

			if (iCampaignId && !oCampaignComboBox.getItemByKey(sCampaignId)) {
				oController.setClientMessage(
					new Message({
						code: "IDEA_OBJECT_MSG_CAMPAIGN_NOT_ALLOWED",
						type: MessageType.Error
					}),
					oController.byId("campaignComboBox"));
				oCampaignComboBox.setSelectedItemId();
			}
		},

		syncAuthorToContributionShareBinding: function() {
			if (!!arguments && arguments.length > 0 && !!arguments[0].getParameters() && arguments[0].getParameters().hasOwnProperty("url") &&
				/xsodata\/CampaignSmall\(\d+\)$/i.test(arguments[0].getParameters().url)) {
				this.syncAuthorToContributionShare();
				var oIdeaData = this.getModel("data");
				oIdeaData.detachRequestCompleted(this.syncAuthorToContributionShareBinding, this);
			}
		},

		syncAuthorToContributionShare: function() {
			var oIdea = this.getObjectModel();
			var oCurrentUser = Configuration.getCurrentUser();
			var aContributionShare = oIdea.getProperty("/ContributionShare");
			var aAuthors = oIdea.getProperty("/Contributors");
			if (this._checkContributionEnable()) {
				jQuery.each(aAuthors, function(index, oAuthor) {
					if (jQuery.grep(aContributionShare, function(data) {
						return data.AUTHOR_ID === oAuthor.IDENTITY_ID;
					}).length === 0) {
						oIdea.addChild({
							AUTHOR_ID: oAuthor.IDENTITY_ID,
							AUTHOR_NAME: oAuthor.NAME
						}, "ContributionShare");
					}
				});
				aContributionShare = oIdea.getProperty("/ContributionShare");
				var nCreateId = oIdea.isNew() ? oCurrentUser.USER_ID : oIdea.getProperty("/CREATED_BY_ID");
				var sCreateName = oIdea.isNew() ? oCurrentUser.NAME : oIdea.getProperty("/CREATED_BY_NAME");
				for (var index = aContributionShare.length - 1; index >= 0; --index) {
					if (aContributionShare[index].AUTHOR_ID !== nCreateId && jQuery.grep(aAuthors, function(data) {
						return data.IDENTITY_ID === aContributionShare[index].AUTHOR_ID;
					}).length === 0) {
						if (aContributionShare[index].ID < 0) {
							aContributionShare.splice(index, 1);
						}
					}
				}
				aContributionShare = oIdea.getProperty("/ContributionShare");
				if (jQuery.grep(aContributionShare, function(data) {
					return nCreateId === data.AUTHOR_ID;
				}).length === 0) {
					oIdea.addChild({
						AUTHOR_ID: nCreateId,
						AUTHOR_NAME: sCreateName,
						PERCENTAGE: aContributionShare.length > 1 ? 0.00 : 100.00
					}, "ContributionShare");
				}
			}
		},
        clearIdeaFormDisplayOnlyFields: function(){
            var oIdea = this.getObjectModel();
            var aFields = oIdea.getProperty("/FieldsValue");
            var aExcludeDisplayOnlyFields = [];
            jQuery.each(aFields,function(index,oField){
                if(!oField.IS_DISPLAY_ONLY){
                  aExcludeDisplayOnlyFields.push(oField);  
                }
            });
            if(aExcludeDisplayOnlyFields.length > 0){
               oIdea.setProperty("/FieldsValue",aExcludeDisplayOnlyFields); 
            }
        },
		onSave: function() {
			var oController = this;
			oController.resetClientMessages();
			oController.addAuthorToContributionShare();
			oController.formatterContributionShare();
			//oController.clearIdeaFormDisplayOnlyFields();
			if (!oController.checkContributionShare()) {
				MessageToast.show(oController.getText("MSG_REWARD_CONTRIBUTION_SHARE_SUM_ERROR"));
				return;
			}
			var iDefaultCoach;
			var fnSave = function() {
				oController.crop().done(function(oCropResult) {
					oController._CheckContentAttachments(oController.getObjectModel());
					if (oController.byId("RespList").getVisible() && oController.getObjectModel().getProperty("/SUBMITTED_AT")) {
						if (!oController.getObjectModel().getProperty("/RESP_VALUE_NAME")) {
							oController.setClientMessage(
								new Message({
									code: "IDEA_OBJECT_MSG_RESP_LIST_VALUE_EMPTY_SAVE",
									type: MessageType.Error
								}),
								oController.byId("RespList"));
						} else {
							oController.setRespValueChangeMsg.call(oController);
						}
					}
					if (oController.getObjectModel().getProperty("/SUBMITTED_AT")) {
						//when submitted,then modify and save  need to check the invaild value for Idea form
						jQuery.each(oController.aComboBoxes, function(iIndex, oControl) {
							if (oControl instanceof sap.m.ComboBox && !oControl.getItemByText(oControl.getValue())) {
								oControl.fireChange();
							}
						});
						jQuery.each(oController.aCheckBoxes, function(iIndex, oControl) {
							oControl.fireSelect();
						});
					}
					var bIsNewIdea = oController.getObjectModel().isNew();
					var oModifyRequest, oIdeaModel;
					oIdeaModel = oController.getObjectModel();
					if (!oIdeaModel.getUserChanges().RESP_VALUE_CODE) {
						iDefaultCoach = null;
					}
					if (iDefaultCoach) {
						oModifyRequest = oController.executeObjectAction("modifyAndAutoAssignCoach", {
							parameters: {
								DEFAULT_COACH: iDefaultCoach
							}
						});
					} else {
						oModifyRequest = oController.executeObjectAction("modify");
					}
					oModifyRequest.done(function(oResponse) {
						var oIdea = oController.getObjectModel();
						if (!oController.getObjectModel().oData.CAMPAIGN_ID) {
							oIdea.setProperty("/RESP_LIST_VISIBLE", false);
						}
						oController._refreshWallList();
				// 		if (bIsNewIdea) {
							// navigate the first time after creation
							oController.navigateTo("idea-display", {
								id: oIdea.getKey()
							}, true);
				// 		} else {
				// 			jQuery.when(oIdea.getPropertyModelInitializedPromise(), oController._dViewShown).done(function(oProperties) {
				// 				oController.initRTE(oProperties);
				// 				// var oFormFields = oController.byId("ideaFormAddFields");
				// 				// oFormFields.removeAllItems();
				// 				// oController.addFormFields.call(oController, oIdea.oData.FieldsValue, oController.byId("ideaFormAddFields"), oIdea);								
				// 			});
				// 		}
						if (oCropResult) {
							oIdea.getMessageParser().parse(oCropResult);
						}
					});
				});
			};
			var fnDelVote = function() {
				if (oController.getObjectModel().delVotesSimulate()) {
					MessageBox.confirm(oController.getText("OBJECT_MSG_VOTES_DELETE_CONFIRMATION"), {
						onClose: function(sDialogAction) {
							if (sDialogAction === MessageBox.Action.OK) {
								fnSave();
							}
						}
					});
				} else {
					fnSave();
				}
			};
			var oIdea = oController.getObjectModel();
			var aCoaches = oIdea.getProperty("/Coach");
			iDefaultCoach = oController.defaultAutoAssignCoach(oController, oIdea);
			if (oIdea.getProperty("/SUBMITTED_AT") && aCoaches && aCoaches.length > 0 && iDefaultCoach && oIdea.getUserChanges().RESP_VALUE_CODE) {
				MessageBox.confirm(oController.getText("IDEA_OBJECT_MSG_CONFIRM_COACH_CHG"), {
					icon: MessageBox.Icon.WARNING,
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					onClose: function(sDialogAction) {
						if (sDialogAction === MessageBox.Action.NO) {
							iDefaultCoach = null;
						}
						fnDelVote();
					}
				});
			} else {
				if (!oIdea.getProperty("/SUBMITTED_AT")) {
					iDefaultCoach = null;
				}
				fnDelVote();
			}
		},
		defaultAutoAssignCoach: function(oController, oIdea) {
			var aRespValues = oIdea.getProperty("/Resp_Value");
			var sRespValueCode = oIdea.getProperty("/RESP_VALUE_CODE");
			var bAutoAssign = oIdea.getProperty("/AUTO_ASSIGN_RL_COACH");
			var iDefaultCoach;
			if (!aRespValues && oIdea.getProperty("/STATUS") === "sap.ino.config.DRAFT") {
				iDefaultCoach = oIdea.getProperty("/DEFAULT_COACH");
			} else {
				if (bAutoAssign && sRespValueCode && aRespValues) {
					jQuery.each(aRespValues, function(index, oRespValue) {
						if (oRespValue.CODE === sRespValueCode) {
							iDefaultCoach = oRespValue.DEFAULT_COACH;
							return false;
						}
					});
				}
			}
			return iDefaultCoach;

		},
		matchTemplate: function() {
			var oIdea = this.getObjectModel();
			var sDescription = oIdea.getProperty("/DESCRIPTION");
			var sIdeaDescriptionTemplate = oIdea.getProperty("/IDEA_DESCRIPTION_TEMPLATE") || "";
			var sIdeaDescriptionTemplateHTML = "<p>" + sIdeaDescriptionTemplate + "</p>";
			return sIdeaDescriptionTemplate !== "" && (sDescription === sIdeaDescriptionTemplate || sDescription ===
				sIdeaDescriptionTemplateHTML);
		},

		onSubmit: function() {
			var oController = this;
			oController.resetClientMessages();
			oController.addAuthorToContributionShare();
			oController.formatterContributionShare();
			//oController.clearIdeaFormDisplayOnlyFields();
			jQuery.each(oController.aComboBoxes, function(iIndex, oControl) {
				if (oControl instanceof sap.m.ComboBox && !oControl.getItemByText(oControl.getValue())) {
					oControl.fireChange();
				}
			});
			jQuery.each(oController.aCheckBoxes, function(iIndex, oControl) {
				oControl.fireSelect();
			});
			if (!oController.checkContributionShare()) {
				MessageToast.show(oController.getText("MSG_REWARD_CONTRIBUTION_SHARE_SUM_ERROR"));
				return;
			}
			var oIdea = oController.getObjectModel();

			var iDefaultCoach = oController.defaultAutoAssignCoach(oController, oIdea);
			this.crop().done(function(oCropResult) {
				oController._CheckContentAttachments(oIdea);
				if (!oController.getObjectModel().getProperty("/CAMPAIGN_ID")) {
					oController.setClientMessage(
						new Message({
							code: "IDEA_OBJECT_MSG_CAMPAIGN_EMPTY_SUBMIT",
							type: MessageType.Error
						}),
						oController.byId("campaignComboBox"));
				}
				if (oController.byId("RespList").getVisible()) {
					if (!oController.getObjectModel().getProperty("/RESP_VALUE_NAME")) {
						oController.setClientMessage(
							new Message({
								code: "IDEA_OBJECT_MSG_RESP_LIST_VALUE_EMPTY_SUBMIT",
								type: MessageType.Error
							}),
							oController.byId("RespList"));
					} else {
						oController.setRespValueChangeMsg.call(oController);
					}
				}

				if (oController.matchTemplate()) {
					oController.setClientMessage(
						new Message({
							code: "IDEA_OBJECT_MSG_TEMPLATE_NOT_CHANGE",
							type: MessageType.Error
						}),
						oController.getRTE());
				}

				var oSubmitRequest = oController.executeObjectAction("modifyAndSubmit", {
					messages: {
						confirm: "IDEA_OBJECT_MSG_SUBMIT_CONFIRM",
						success: function() {
							return oController.getText("IDEA_OBJECT_MSG_SUBMIT_OK", oIdea.getProperty("/NAME"));
						}
					},
					parameters: {
						CAMPAIGN_ID: oIdea.getProperty("/CAMPAIGN_ID")
					}
				});
				oSubmitRequest.done(function(oResponse) {
					if (oResponse && oResponse.confirmationCancelled === true) {
						oController.byId("ideaSubmitBtn").focus();
						return;
					}
					if (iDefaultCoach) {
					    
						var oModifyRequest = oController.executeObjectActionPrototypeDirectly("autoAssignCoach", {
							parameters: {
								DEFAULT_COACH: iDefaultCoach
							}
						});
						oModifyRequest.always(function() {
							oController.navigateTo("idea-display", {
								id: oIdea.getKey()
							}, true);
							if (oCropResult) {
								oIdea.getMessageParser().parse(oCropResult);
							}						    
						});
					} else {
						oController.navigateTo("idea-display", {
							id: oIdea.getKey()
						}, true);
						if (oCropResult) {
							oIdea.getMessageParser().parse(oCropResult);
						}
					}
				});
			});
		},
		onFileUploaderChange: function(oEvent) {
			var oFileUploader = oEvent.getSource();
			var aFile = oEvent.getParameter("files");
			oFileUploader.setBusy(true);
			Attachment.prepareFileUploader(oFileUploader, aFile);
		},

		onFileUploaderComplete: function(oEvent) {
			var oResponse = Attachment.parseUploadResponse(oEvent.getParameter("responseRaw"));
			var oFileUploader = oEvent.getSource();
			if (oResponse) {
				var oObject = this.getObjectModel();
				oObject.getMessageParser().parse(oResponse);
				if (oResponse.success) {
					oObject.setTitleImage({
						"ATTACHMENT_ID": oResponse.attachmentId,
						"FILE_NAME": oResponse.fileName,
						"MEDIA_TYPE": oResponse.mediaType
					});
				} else {
					MessageToast.show(this.getText("IDEA_OBJECT_MSG_TITLE_IMAGE_FAILED"));
				}
			} else {
				MessageToast.show(this.getText("IDEA_OBJECT_MSG_TITLE_IMAGE_ERROR"));
			}
			oFileUploader.setBusy(false);
			oFileUploader.clear();
		},

		onFileTypeMissMatch: function(oEvent) {
			MessageToast.show(this.getText("IDEA_OBJECT_MSG_TITLE_IMAGE_TYPE_MISS_MATCH"));
		},

		onTitleImageClear: function(oEvent) {
			var oObject = this.getObjectModel();
			oObject.clearTitleImage();
		},

		onTitleImageCrop: function(oEvent) {
			this.crop();
		},

		_refreshWallList: function() {
			this.getView().byId("wallsection").invalidate();
		},

		onTitleChange: function(oEvent) {
			this.bindSimilarIdeas();
		},

		getIdeaDisplayLink: function(iIdeaId) {
			return this.getNavigationLink("idea-display", {
				id: iIdeaId
			});
		},
		formatSimilarIdeaName: function(name, statusCode) {
			if (statusCode === "sap.ino.config.DRAFT") {
				return "[" + this.getText("IDEA_OBJECT_FIELD_SIMILAR_IDEAS_DRAFT") + "]" + name;
			} else {
				return name;
			}
		},
		getEditorContentLive: function() {
			var oRTE = this.getRTE();
			if (!oRTE) {
				return "";
			}

			// Read-only HTML control
			if (oRTE.getContent) {
				return oRTE.getContent();
			}

			try {
				// Real richtext editor
				if (oRTE && oRTE.getNativeApi() && (oRTE.getNativeApi().getDoc() || oRTE.getNativeApi().bodyElement)) {
					return oRTE && oRTE.getNativeApi() && oRTE.getNativeApi().getContent(); //tinymce.min.js:formatted:15909 Uncaught TypeError: Cannot read property 'body' of null(…)
				} else {
					return "";
				}
			} catch (e) {
				jQuery.sap.log.error("Editor content could not be retrieved: " + e.toString(), "", "sap.ino.vc.idea.Modify.controller.js");
			}
		},

		onAfterShow: function() {
			this._dViewShown.resolve();
		},

		onBeforeHide: function() {
			jQuery.sap.clearIntervalCall(this._sRefreshSimilarIdeasTimer);
			this._sRefreshSimilarIdeasTimer = null;
		},

		onAfterHide: function() {
			// create a new deferred for next display
			this._dViewShown = jQuery.Deferred();
			// RTE needs to be removed when the screen is not visible any more
			// as it model based bindings fail when it is not displayed
			this.destroyRTE();
		},

		expandSimilarIdeasOnInit: function() {
			if (!Device.system.desktop) {
				return;
			}
			var oControl = this.byId("similarIdeas");
			var oIdea = this.getObjectModel();
			var sStatusCode = oIdea && oIdea.getProperty("/STATUS_CODE");
			// Only first phase is interesting for similar ideas in edit mode
			var iProcessStep = oIdea && oIdea.getProperty("/STEP");
			var similarPersonalize = Configuration.getPersonalize().SIMILAR_IDEA;
			if (oIdea.isNew()) {
				this.getView().setModel(new JSONModel({}), "similarIdeas");
				this._setInterval4SimilarIdeas();
				if (similarPersonalize) {
					this.onShowSimilarIdeas();
				}
			} else if (oControl && ((sStatusCode === 'sap.ino.config.NEW_IN_PHASE' && iProcessStep === 0) || sStatusCode ===
				'sap.ino.config.DRAFT')) {
				this.bindSimilarIdeas();
				this._setInterval4SimilarIdeas();
				if (similarPersonalize) {
					this.onShowSimilarIdeas();
				}
			} else {
				this.onToggleSimilarIdeas(undefined, true);
			}

		},

		getAvaliableWidth: function() {
			return this.getView().$().find(".sapInfoIdeaName").width();
		},

		onShowSimilarIdeas: function() {
			var oSimilarIdeas = this.getView().byId("similarIdeas");
			var bHasSpecailStyle = oSimilarIdeas.hasStyleClass('sapInoIdeaSimilarIdeasExpanded');
			if (!bHasSpecailStyle) {
				oSimilarIdeas.addStyleClass("sapInoIdeaSimilarIdeasExpanded");
			}
		},

		bindSimilarIdeas: function() {
			var oController = this;
			var oIdea = this.getObjectModel();
			//if (!this._oSimilarModel) {
			this._oSimilarModel = new JSONModel();
			//}
			var iIdeaId = oIdea.getProperty("/ID");
			var mParameters = {
				name: oIdea.getProperty("/NAME"),
				description: this.getEditorContentLive(),
				campId: oIdea.getProperty("/CAMPAIGN_ID"),
				filterDraft: true,
				limit: 12
			};
			if (oIdea && oIdea.getProperty("/Tags") && oIdea.getProperty("/Tags").length > 0) {
				var aTags = [];
				oIdea.getProperty("/Tags").forEach(function(oTag) {
					aTags.push(oTag.NAME);
				});
				mParameters.tags = JSON.stringify(aTags);
			}

			if (Configuration.getRelatedIdeasByTextURL(iIdeaId)) {
				this._oSimilarModel.loadData(Configuration.getRelatedIdeasByTextURL(iIdeaId), mParameters, true, "POST");
				this._oSimilarModel.attachRequestCompleted(null, function() {
					var oIdeasData = oController.groupByCampaignId(oController._oSimilarModel.getData(), oIdea.oData.CAMPAIGN_ID, oIdea.oData.CAMPAIGN_NAME);
					oController._oSimilarModel.setData({
						"similarIdeasData": oIdeasData
					}, false);
					this.getView().setModel(this._oSimilarModel, "similarIdeas");
				}, this);
			}
		},

		isDescriptionChanged: function(sNewDescriptionText) {
			if (sNewDescriptionText === null || sNewDescriptionText === undefined) {
				return false;
			}
			return (this._sDescriptionText === undefined && sNewDescriptionText.length > 0) || (this._sDescriptionText !== undefined && this._sDescriptionText !==
				sNewDescriptionText);
		},

		isTitleChanged: function(sNewTitleText) {
			if (sNewTitleText === null || sNewTitleText === undefined) {
				return false;
			}
			return (this._sTitleText === undefined && sNewTitleText.length > 0) || (this._sTitleText !== undefined && this._sTitleText !==
				sNewTitleText);
		},

		isTagsChanged: function(aNewTags) {
			return $(this._aTags).not(aNewTags).length !== 0 || $(aNewTags).not(this._aTags).length !== 0;
		},

		refreshSimilarIdeas: function() {
			var sNewTitleText = this.getObjectModel().getProperty("/NAME");
			var sNewDescriptionText = this.getEditorContentLive();
			var aNewTags = this.getObjectModel().getProperty("/Tags");
			if (this.isDescriptionChanged(sNewDescriptionText) || this.isTitleChanged(sNewTitleText) || this.isTagsChanged(aNewTags)) {
				this.bindSimilarIdeas();
				this._sTitleText = sNewTitleText;
				this._sDescriptionText = sNewDescriptionText;
				this._aTags = aNewTags;
			}
		},

		onToggleSimilarIdeas: function(oEvent, bForceDisable) {
			var oSimilarIdeas = this.getView().byId("similarIdeas");
			if (bForceDisable || oSimilarIdeas.hasStyleClass('sapInoIdeaSimilarIdeasExpanded')) {
				oSimilarIdeas.removeStyleClass("sapInoIdeaSimilarIdeasExpanded");
				if (this._sRefreshSimilarIdeasTimer) {
					jQuery.sap.clearIntervalCall(this._sRefreshSimilarIdeasTimer);
					this._sRefreshSimilarIdeasTimer = null;
				}
			} else {
				oSimilarIdeas.addStyleClass("sapInoIdeaSimilarIdeasExpanded");
				this.bindSimilarIdeas();
				this._setInterval4SimilarIdeas();
			}
		},

		onRespListHint: function(oEvent) {
			var oDialog = this._getRespListHintDialog();
			var oIdea = this.getObjectModel();
			var sCode = oIdea.getProperty("/RESP_VALUE_CODE");
			oDialog.bindElement({
				path: "data>/RespValues('" + sCode + "')/"
			});
			oDialog.open();
		},

		onRespListHintDialogClose: function() {
			var oDialog = this._getRespListHintDialog();
			oDialog.close();
		},

		_getRespListHintDialog: function() {
			var oDialog = this._oRespListHintDialog;
			if (!oDialog) {
				oDialog = this.createFragment("sap.ino.vc.idea.fragments.ResponsibilityDetail", this.getView().getId());
				this.getView().addDependent(oDialog);
				this._oRespListHintDialog = oDialog;
				this._oRespListHintDialog.setInitialFocus(this.createId("TagToken"));
			}
			return oDialog;
		},

		_setInterval4SimilarIdeas: function() {
			if (!this._sRefreshSimilarIdeasTimer) {
				this._sRefreshSimilarIdeasTimer = jQuery.sap.intervalCall(5000, this, this.refreshSimilarIdeas);
			}
		},

		contributionShareFormatter: function(oContributionShare, bRewardActive) {
			if (!bRewardActive || !oContributionShare || oContributionShare.length <= 1) {
				return false;
			}
			return true;
		},
		_checkContributionReadOnly: function() {
			return this.getObjectModel().getProperty("/CONTRIBUTION_READ_ONLY");
		},

		_checkContributionEnable: function() {
			return this.getObjectModel().getProperty("/REWARD_ACTIVE");
		},

		_CheckContentAttachments: function(oModel) {
			var content = oModel.getProperty("/DESCRIPTION"),
				aContentAttachments = [],
				aNewContentAttachments = [],
				aOriginContentAttachments = oModel.getProperty("/ContentAttachments");
			if (!content) {
				return;
			}
			var reg = new RegExp("<img.*attachment_download\.xsjs/(\\d+)\"", "g"),
				result;
			do {
				result = reg.exec(content);
				if (result && result.length === 2) {
					aContentAttachments.push(result[1]);
				}
			}
			while (result !== null);
			var tag = false,
				oTempAttachment = void 0;
			for (var i = 0; i <= aContentAttachments.length - 1; i++) {
				tag = false;
				oTempAttachment = undefined;
				for (var j = 0; j <= aOriginContentAttachments.length - 1; j++) {
					if (Number(aContentAttachments[i]) === aOriginContentAttachments[j].ATTACHMENT_ID) {
						tag = true;
						oTempAttachment = aOriginContentAttachments[j];
						break;
					}
				}
				if (tag) {
					aNewContentAttachments.push(oTempAttachment);
				} else {
					aNewContentAttachments.push({
						ID: oModel.getNextHandle(),
						ATTACHMENT_ID: Number(aContentAttachments[i])
					});
				}
			}
			oModel.setProperty("/ContentAttachments", aNewContentAttachments);
		},
		resetPendingChanges: function() {
			BaseController.prototype.resetPendingChanges.apply(this, arguments);
// 			var oCampaignComboBox = this.byId("campaignComboBox");
// 			if (oCampaignComboBox) {
// 				oCampaignComboBox.setValue(undefined);
// 				oCampaignComboBox.setSelection(undefined);
// 			}

// 			var oFormFields = this.byId("ideaFormAddFields");
// 			if (oFormFields) {
// 				oFormFields.removeAllItems();
// 			}
		}

	}));
});