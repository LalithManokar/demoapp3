/*!
 * @copyright@
 */
sap.ui.getCore().loadLibrary("sap.ino.wall");

sap.ui.define([
    "sap/ino/vc/commons/BaseVariantListController",
    "sap/ui/Device",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ino/vc/wall/WallMixin",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/models/object/Attachment",
    "sap/ino/commons/application/Configuration",
     "sap/m/MessageToast",
    "sap/ino/vc/attachment/AttachmentMixin",
    "sap/ino/vc/comment/RichCommentCntrlMixin",
    "sap/ino/vc/comment/RichCommentMixin",
    "sap/ino/vc/comment/RichCommentAttachmentMixin",
    "sap/ui/core/MessageType",
    "sap/ui/core/message/Message",
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
    "sap/ino/commons/models/types/IntBooleanType",
    "sap/ui/model/Sorter",
    "sap/ui/core/ListItem",
    "sap/ino/vc/commons/mixins/RichTextInitMixin"
], function(BaseController,
	Device,
	ObjectListFormatter,
	WallMixin,
	JSONModel,
	Attachment,
	Configuration,
	MessageToast, AttachmentMixin, RichCommentCntrlMixin, RichCommentMixin, RichCommentAttachmentMixin, MessageType, Message,
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
	IntBooleanType,
	Sorter,
	ListItem,
	RichTextInitMixin) {
	"use strict";

	var mVariant = {
		MY: "my",
		SHARED: "shared"
	};

	var mFilter = {
		NONE: "myWalls",
		MY: "myWalls",
		SHARED: "sharedWalls"
	};
	var mDataType = {
		BOOLEAN: "BOOL_VALUE",
		TEXT: "TEXT_VALUE",
		INTEGER: "NUM_VALUE",
		NUMERIC: "NUM_VALUE",
		RICHTEXT: "RICH_TEXT_VALUE",
		DATE: "DATE_VALUE"
	};
	var attachmentUploadUrl = Attachment.getEndpointURL();

	return BaseController.extend("sap.ino.vc.internal.InternalSection", jQuery.extend({}, WallMixin, AttachmentMixin, RichCommentCntrlMixin,
		RichCommentMixin,
		RichCommentAttachmentMixin,
		RichTextInitMixin, {
			/* Controller reacts when these routes match */
			routes: "idea-display",
			sectionName: "sectionInternal",
			list: {
				"Variants": {},
				"Picker": {
					"Variants": {
						"Values": [{
							"TEXT": "WALL_LIST_MIT_MY",
							"ACTION": mVariant.MY,
							"FILTER": mFilter.MY
                        }, {
							"TEXT": "WALL_LIST_MIT_SHARED",
							"ACTION": mVariant.SHARED,
							"FILTER": mFilter.SHARED
                        }]
					}
				}
			},

			/* ViewModel storing the current configuration of the list */
			view: {
				"Picker": {
					"VARIANT": undefined // mVariant.MY will be initialized in onWallAdd
				},
				"EDITABLE": undefined
			},

			formatter: ObjectListFormatter,

			objectListFormatter: ObjectListFormatter,

			onInit: function() {
				var that = this;
				that._wallMixinInit({
					wallId: "interalwalllistinidea",
					wallBindPath: "object>/InternalWalls",
					wallAddAction: function(oObject, oWallData) {
						oObject.addInternalWall(oWallData);
					},
					wallRemoveAction: function(oObject, oWallControl) {
						oObject.removeInternalWall(oWallControl.getStorageId());
						oObject.update();
					},
					wallData: function(oObject) {
						return oObject.getProperty("/InternalWalls");
					}
				});
				that.getList().addStyleClass("sapInoWallListPreviewItems");

				BaseController.prototype.onInit.apply(this, arguments);

				if (!that.getModel("local")) {
					that.setModel(new JSONModel({
						ATTACHMENT_UPLOAD_URL: attachmentUploadUrl
					}), "local");
				}
				this.getView().setModel(null, "comment");
				var oSetting = jQuery.extend(true, {}, this.defaultRichCommentSetting);
				oSetting.commentInputId = "internalNoteInputField";
				oSetting.commentListId = "internalNoteList";
				oSetting.commentContainerId = "rteInternalContainer";
				oSetting.commentInputId = "rteInternalCtrlInput";
				oSetting.delReplyConfirmMsgKey = "MSG_INTERNALNOTE_REPLY_DEL_CONFIRM";
				oSetting.delAllDataComfirmMsgKey = "MSG_INTERNALNOTE_DELETE_ALL_DATA_CONFIRM";
				oSetting.delSuccessfulMsgKey = "MSG_INTERNALNOTE_DEL_SUCCESS";
				oSetting.delBtnKey = "INTERNALNOTE_OBJECT_BTN_DELETE_INTERNALNOTE";
				oSetting.delBtnAllDataKey = "INTERNALNOTE_OBJECT_BTN_DELETE_ALL_DATA";
				oSetting.type = "internal";
				this.richCommentMixinInitRouterEvent(oSetting);
			},
			onRouteMatched: function(oEvent) {
				BaseController.prototype.onRouteMatched.apply(this, arguments);

			},
			onBeforeRendering: function() {
				this.view.EDITABLE = true;
				var oViewModel = this.getModel("view");
				oViewModel.setData(this.view, true);
				this._bindList();
				var oBinding = this.getList().getBinding("items");
				if (oBinding) {
					this._updateWallPreviewControls();
				}
				//for internal note
				// this.commentMixinInit({
				// 	commentInputId: "internalNoteInputField",
				// 	commentListId: "internalNoteList",
				// 	successMessageKey: "MSG_CREATE_SUCCESS_NOTE",
				// 	editDialogViewName: "sap.ino.vc.internal.EditInternalNoteDialog"
				// });
			},

			onAfterRendering: function() {

				this.getAdminFormFields();
				this.richCommentMixinInit();
				this.richAttachmentMixinInit();
				this._attachmentMixinInit({
					attachmentId: "InternalAttachments",
					updateObject: function(oObject) {
						oObject.update();
					},
					uploadSuccess: function(oObject, oResponse) {
						oObject.addInternalAttachment({
							"CREATED_BY_NAME": Configuration.getCurrentUser().NAME,
							"ATTACHMENT_ID": oResponse.attachmentId,
							"FILE_NAME": oResponse.fileName,
							"MEDIA_TYPE": oResponse.mediaType,
							"CREATED_AT": new Date()
						});
						oObject.update().fail(function() {
							oObject.getMessageParser().parse(oResponse);
							MessageToast.show(this.getText("OBJECT_MSG_ATTACHMENT_FAILED"));
							return true;
						});
					}
				});

				this.setAccessibilityProperty();

			},
			getAdminFormFields: function() {
				var oIdea = this.getModel("object");
				var oDisplayAdminFields = this.byId("vBoxForDisplayAdminFields");
				//this.byId("vBoxForAdminContentVisible").setVisible(true);
				if (this.getModel("editObject") && typeof(this.getModel("editObject").getProperty("/ID")) === "number" && (this.getModel("object").getProperty(
					"/ID") !== this.getModel("editObject").getProperty("/ID"))) {
					this.visibleSettingForAdminField();
					this.getModel("editObject").setData(null);
				}

				var that = this;
				this.bIsNew = true;
				if (!oIdea.oData.AdminFieldsValue) { //If the fields is not existed.
					oIdea.getDataInitializedPromise().done(function(oData) {
						if (oIdea.oData.AdminFieldsValue.length > 0) {
							that.bIsNew = false;
						}
						if (that.bIsNew) {
							that.getModel("data").read("/CampaignSmall(" + oIdea.oData.CAMPAIGN_ID + ")/AdminFormFields", {
								urlParameters: {
									"$orderby": "SEQUENCE_NO"
								},
								success: function(oResult) {
									var aFields = oResult.results;
									if (aFields.length === 0) {
										that.byId("vBoxForAdminContentVisible").setVisible(false);
									} else {
										that.byId("vBoxForAdminContentVisible").setVisible(true);
										that.byId("nameOfAdminForm").setText(aFields[0].FORM_DEFAULT_TEXT);
										that.addDisplayFormFields(oDisplayAdminFields, oIdea); //1219
										that.setModel(new sap.ui.model.json.JSONModel(), "AdminForm");
										that.getModel("AdminForm").setProperty("/CampaignAdminForm", aFields);
									}
								},
								error: function(oMessage) {
									MessageToast.show(oMessage.message);
								}
							});
						}
					});
				} else { //Exsited
					if (oIdea.oData.AdminFieldsValue.length > 0) {
						that.bIsNew = false;
						//	that.byId("editButtonForAdminFields").setEnabled(true);
						that.getModel("data").read("/CampaignSmall(" + oIdea.oData.CAMPAIGN_ID + ")/AdminFormFields", {
							urlParameters: {
								"$orderby": "SEQUENCE_NO"
							},
							success: function(oResult) {
								var aFields = oResult.results;
								that.setModel(new sap.ui.model.json.JSONModel(), "AdminForm");
								that.getModel("AdminForm").setProperty("/CampaignAdminForm", aFields);
							},
							error: function(oMessage) {
								MessageToast.show(oMessage.message);
							}
						});
						that.byId("vBoxForAdminContentVisible").setVisible(true);
						that.addDisplayFormFields(oDisplayAdminFields, oIdea); //1219
					} else {
						that.getModel("data").read("/CampaignSmall(" + oIdea.oData.CAMPAIGN_ID + ")/AdminFormFields", {
							urlParameters: {
								"$orderby": "SEQUENCE_NO"
							},
							success: function(oResult) {
								var aFields = oResult.results;
								if (aFields.length === 0) {
									that.byId("vBoxForAdminContentVisible").setVisible(false);
								} else {
									that.byId("vBoxForAdminContentVisible").setVisible(true);
									that.byId("nameOfAdminForm").setText(aFields[0].FORM_DEFAULT_TEXT);
									that.addDisplayFormFields(oDisplayAdminFields, oIdea); //1219
									that.setModel(new sap.ui.model.json.JSONModel(), "AdminForm");
									that.getModel("AdminForm").setProperty("/CampaignAdminForm", aFields);
								}
							},
							error: function(oMessage) {
								MessageToast.show(oMessage.message);
							}
						});
					}
				}

			},
			getVariantsPopover: function() {
				if (!this._getWallPickerDialog().isActive()) {
					return BaseController.prototype.getVariantsPopover.apply(this, arguments);
				} else {
					if (!this._oPickerVariantPopover) {
						this._oPickerVariantPopover = sap.ui.xmlfragment("sap.ino.vc.wall.fragments.PickerListVariants", this);
						// if (Device.system.phone) {
						//     this._oPickerVariantPopover = sap.ui.xmlfragment("sap.ino.vc.wall.fragments.PickerListVariantsDialog", this);
						// } else {
						//     this._oPickerVariantPopover = sap.ui.xmlfragment("sap.ino.vc.wall.fragments.PickerListVariants", this);
						// }
						this.getView().addDependent(this._oPickerVariantPopover);
					}
					return this._oPickerVariantPopover;
				}
			},

			getVariant: function(sAction) {
				if (!this._getWallPickerDialog().isActive()) {
					return BaseController.prototype.getVariant.apply(this, arguments);
				} else {
					return this._getListDefinitionEntry(sAction, "ACTION", "/Picker/Variants/Values");
				}
			},

			onVariantPress: function(sVariantAction, oEvent) {
				this.setViewProperty("/Picker/VARIANT", sVariantAction);
				var oWallPickerView = this._getWallPickerView();
				if (oWallPickerView) {
					oWallPickerView.getController().setViewProperty("/List/VARIANT", sVariantAction);
					oWallPickerView.invalidate();
				}
			},

			_onVariantPress: function(oEvent) {
				var oItem = oEvent.getSource();
				var oContext = oItem.getBindingContext("list");
				var sAction;
				var oObject;

				if (oContext) {
					oObject = oContext.getObject();
					sAction = oObject ? oObject.ACTION : undefined;
				}

				this.onVariantPress(sAction, oEvent);

				var oPopover = this.getVariantsPopover();
				if (typeof oPopover.close === "function") {
					oPopover.close();
				}
			},

			onWallPicked: function(oWallData) {
				this._bindList();
				var oBinding = this.getList().getBinding("items");
				var oIdea = this.getModel("object");
				if (oBinding) {
					var that = this;
					oIdea.update().done(
						function() {
							that._updateWallPreviewControls();
						});
				}
			},
			onSaveWithPub: function(oEvent) {
				var oController = this;
				jQuery.each(oController.aCheckBoxes, function(iIndex, oControl) {
					oControl.fireSelect();
				});
				if (!this.hasAnyClientErrorMessages()) {
					var aUpdateObject = [];
					var oRequestBody = {};
					var oUpdateObject = {};
					var sFieldValue;
					var oIdea = this.getModel("object");
					var oDisplayAdminFields = this.byId("vBoxForDisplayAdminFields");
					var sSaveUrl = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/idea.xsjs/" + this.getModel("object").getProperty("/ID");
					var oAdminFeildsValue = jQuery.extend(true, [], this.getModel("editObject").getProperty("/AdminFieldsValue"));
					oAdminFeildsValue.forEach(function(object) {
						sFieldValue = mDataType[object.DATATYPE_CODE];
						oUpdateObject[sFieldValue] = object[sFieldValue];
						oUpdateObject.ID = object.ID;
						oUpdateObject.FIELD_CODE = object.FIELD_CODE;
						oUpdateObject.RICH_TEXT_VALUE = object.RICH_TEXT_VALUE;
						if (object.IS_PUBLISH === 1) {
							oUpdateObject.STATE_OF_PUBLISH = 1;
							object.STATE_OF_PUBLISH = 1;
						} else {
							oUpdateObject.STATE_OF_PUBLISH = 0;
							object.STATE_OF_PUBLISH = 0;
						}
						aUpdateObject.push(oUpdateObject);
						oUpdateObject = {};
					});
					oRequestBody.AdminFieldsValue = aUpdateObject;
					oRequestBody.ID = this.getModel("object").getProperty("/ID");
					var that = this;
					var oUpdateAjax = jQuery.ajax({
						url: sSaveUrl,
						data: JSON.stringify(oRequestBody),
						type: "PUT",
						contentType: "application/json; charset=UTF-8",
						async: true,
						success: function(oResponse) {
							if (oResponse.GENERATED_IDS && oResponse.GENERATED_IDS !== null) {
								jQuery.each(oAdminFeildsValue, function(index, object) {
									object.ID = oResponse.GENERATED_IDS[object.ID] ? oResponse.GENERATED_IDS[object.ID] : object.ID;
								});
							}
							MessageToast.show(that.getText("OBJECT_MSG_ADMIN_FORM_SAVE_AS_PULISH_SUCCESS"));
							that.getModel("object").setProperty("/AdminFieldsValue", oAdminFeildsValue);
							that.getModel("editObject").setData(null);
							that.addDisplayFormFields(oDisplayAdminFields, oIdea);

							that.visibleSettingForAdminField(); //1219
							var oAdminFormFieldsCrl = that.byId("vBoxForAdminFields");
							oAdminFormFieldsCrl.removeAllItems();
							return true;
						},
						error: function(oResponse) {
							var sErrorMessage;
				// 			if (oResponse.responseJSON.MESSAGES.length > 0) {
				// 				for (var i = 0; i < oResponse.responseJSON.MESSAGES.length; i++) {
				// 					sErrorMessage = oResponse.responseJSON.MESSAGES[i].MESSAGE_TEXT + " ";
				// 				}
				// 			}
							sErrorMessage = oResponse.responseText;
							MessageToast.show(sErrorMessage ? sErrorMessage : that.getText("OBJECT_MSG_ADMIN_FORM_SAVE_FAILED"));
							return true;
						}
					});
				} else {
					MessageToast.show(this.getText("MSG_SAVE_USER_ERROR"));
				}
			},

			visibleSettingForAdminField: function() {
				var adminInputVisible = this.byId("vBoxForAdminFields").getVisible();
				this.byId("vBoxForAdminFields").setVisible(!adminInputVisible);
				this.byId("vBoxForDisplayAdminFields").setVisible(adminInputVisible);
				this.byId("overToolbarAdminButtons").setVisible(!adminInputVisible);
				this.byId("editButtonForAdminFields").setEnabled(adminInputVisible);
			},

			onEditButtonForAdminFields: function(oEvent) {
				var oAdminFormFieldsCrl = this.byId("vBoxForAdminFields");
				var oIdea = this.getModel("object");
				var oEditIdea;
				if (this.getModel("editObject") && (this.getModel("object").getProperty("/ID") === this.getModel("editObject").getProperty("/ID"))) {
					oEditIdea = this.getModel("editObject");
				} else {
					if (this.getModel("editObject")) {
						oEditIdea = this.getModel("editObject");
						oEditIdea = undefined;
					}
					var oNewAdminFormField = {};
					oNewAdminFormField = jQuery.extend(true, [], oIdea.getProperty("/AdminFieldsValue"));
					this.setModel(new sap.ui.model.json.JSONModel(), "editObject");
					oEditIdea = this.getModel("editObject");
					oEditIdea.setProperty("/AdminFieldsValue", oNewAdminFormField);
					oEditIdea.setProperty("/ID", this.getModel("object").getProperty("/ID"));
				}
				var aAdminFieldsValue = oIdea.oData.AdminFieldsValue;
				var aCampaignAdminForm = this.getModel("AdminForm").getProperty("/CampaignAdminForm");
				var oAdminFieldsValue;
				if (aAdminFieldsValue && aAdminFieldsValue.length > 0 && aCampaignAdminForm && aCampaignAdminForm.length > 0 &&
					aAdminFieldsValue[0].FORM_CODE === aCampaignAdminForm[0].FORM_CODE) {
					oAdminFieldsValue = oIdea.oData.AdminFieldsValue;
					var aNewFields = this.cacluateNewFieldsAdded(aCampaignAdminForm, aAdminFieldsValue);
					if (aNewFields && aNewFields.length > 0) {
						oAdminFieldsValue = oAdminFieldsValue.concat(aNewFields);
                        oEditIdea.setProperty("/AdminFieldsValue", oAdminFieldsValue);
        				oAdminFieldsValue.sort(function(o1, o2) {
        					if (o1.SEQUENCE_NO < o2.SEQUENCE_NO) {
        						return -1;
        					} else {
        						return 1;
        					}
        				});                        
					}
				} else {
					oAdminFieldsValue = oIdea.oData.AdminFieldsValue.length > 0 ? oIdea.oData.AdminFieldsValue : this.getModel("AdminForm").getProperty(
						"/CampaignAdminForm");
				}
				
				this.addFormFields.call(this, oAdminFieldsValue, oAdminFormFieldsCrl, oEditIdea);
				this.visibleSettingForAdminField();
			},

			cacluateNewFieldsAdded: function(campaignFields, fieldsValue) {
				var aNewFields = [];
				var fnFilterValue = function(fields, code) {
					return fields.filter(function(oValue) {
						return oValue.CODE === code;
					});
				};
				for (var i = 0; i < campaignFields.length; i++) {
					var aFilter = fnFilterValue(fieldsValue, campaignFields[i].CODE);
					if (aFilter.length === 0 && campaignFields[i].IS_ACTIVE) {
						aNewFields.push(campaignFields[i]);
					}
				}
				return aNewFields;

			},
			onAdminFormEditCancel: function() {
				var that = this;
				if (that.aCheckBoxes) {
					that.aCheckBoxes = [];
				}
				var oAdminFormFieldsCrl = this.byId("vBoxForAdminFields");
				oAdminFormFieldsCrl.removeAllItems();
				this.visibleSettingForAdminField();
				this.resetClientMessages();
				this.getModel("editObject").setData(null);
			},

			onSaveWithoutPub: function(oEvent) {
				var oController = this;
				jQuery.each(oController.aCheckBoxes, function(iIndex, oControl) {
					oControl.fireSelect();
				});
				if (!this.hasAnyClientErrorMessages()) {
					var aUpdateObject = [];
					var oRequestBody = {};
					var oUpdateObject = {};
					var sFieldValue;
					var oIdea = this.getModel("object");
					var oDisplayAdminFields = this.byId("vBoxForDisplayAdminFields");
					var sSaveUrl = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/idea.xsjs/" + this.getModel("object").getProperty("/ID") +
						"/updateAdminForms";
					var oAdminFeildsValue = jQuery.extend(true, [], this.getModel("editObject").getProperty("/AdminFieldsValue"));
					oAdminFeildsValue.forEach(function(object) {
						sFieldValue = mDataType[object.DATATYPE_CODE];
						oUpdateObject[sFieldValue] = object[sFieldValue];
						oUpdateObject.ID = object.ID;
						oUpdateObject.FIELD_CODE = object.FIELD_CODE;
						oUpdateObject.RICH_TEXT_VALUE = object.RICH_TEXT_VALUE;
						oUpdateObject.STATE_OF_PUBLISH = 0;
						object.STATE_OF_PUBLISH = 0;
						aUpdateObject.push(oUpdateObject);
						oUpdateObject = {};
					});
					oRequestBody.AdminFieldsValue = aUpdateObject;
					oRequestBody.ID = this.getModel("object").getProperty("/ID");
					var that = this;
					var oUpdateAjax = jQuery.ajax({
						url: sSaveUrl,
						data: JSON.stringify(oRequestBody),
						type: "POST",
						contentType: "application/json; charset=UTF-8",
						async: true,
						success: function(oResponse) {
							if (oResponse.GENERATED_IDS && oResponse.GENERATED_IDS !== null) {
								jQuery.each(oAdminFeildsValue, function(index, object) {
									object.ID = oResponse.GENERATED_IDS[object.ID] ? oResponse.GENERATED_IDS[object.ID] : object.ID;
								});
							}
							MessageToast.show(that.getText("OBJECT_MSG_ADMIN_FORM_SAVE_SUCCESS"));
							that.getModel("object").setProperty("/AdminFieldsValue", oAdminFeildsValue);
							that.getModel("editObject").setData(null);
							that.addDisplayFormFields(oDisplayAdminFields, oIdea);
							that.visibleSettingForAdminField(); //1219
							var oAdminFormFieldsCrl = that.byId("vBoxForAdminFields");
							oAdminFormFieldsCrl.removeAllItems();
							return true;
						},
						error: function(oResponse) {
							MessageToast.show(that.getText("OBJECT_MSG_ADMIN_FORM_SAVE_FAILED"));
							return true;
						}
					});
				} else {
					MessageToast.show(this.getText("MSG_SAVE_USER_ERROR"));
				}
			},

			addDisplayFormFields: function(oFormFields, oIdea) {
				var that = this;
				if (oFormFields.getItems().length > 0) {
					//remove all the fields
					oFormFields.removeAllItems();
				}
				jQuery.each(oIdea.oData.AdminFieldsValue, function(i, oField) {
					var lblText = oField.DEFAULT_TEXT + ":";

					if (oField.IS_DISPLAY_ONLY) {
						var oRichTextHtml = new sap.ui.core.HTML({
							sanitizeContent: true,
							preferDOM: false,
							content: oField.DISPLAY_TEXT
						});
						oFormFields.addItem(oRichTextHtml);

						return true;
					}

					if (oField.IS_PUBLISH && oField.STATE_OF_PUBLISH === 1) {

						lblText = oField.DEFAULT_TEXT + that.getText("OBJECT_MSG_ADMIN_FORM_FIELD_CAN_PUBLISH") + ":";
					} else if (oField.IS_PUBLISH) {
						lblText = oField.DEFAULT_TEXT + that.getText("OBJECT_MSG_ADMIN_FORM_FIELD_CANNOT_PUBLISH") + ":";
					}
					if (oField.UOM_CODE) {
						lblText = oField.DEFAULT_TEXT + "(" + CodeModel.getText("sap.ino.xs.object.basis.Unit.Root", oField.UOM_CODE) + "):";
					}
					var oLabel = new Label({
						text: lblText,
						tooltip: oField.DEFAULT_LONG_TEXT
					});
					oLabel.addStyleClass("sapInoIdeaFormLabelStyle");
					var sDataType;
					if (oField.DATATYPE_CODE === "BOOLEAN") {
						sDataType = "BOOL_VALUE";
					} else if (oField.DATATYPE_CODE === "TEXT") {
						sDataType = "TEXT_VALUE";
					} else if (oField.DATATYPE_CODE === "RICHTEXT") {
						sDataType = "RICH_TEXT_VALUE";
					} else if (oField.DATATYPE_CODE === "DATE") {
						sDataType = "DATE_VALUE";
					} else {
						sDataType = "NUM_VALUE";
					}
					var oTxt = oField[sDataType];
					var valueList = oField.valueOptionList;
					if (!valueList) {
						if (oField.VALUE_OPTION_LIST_CODE) {
							var sCodeTable = "sap.ino.xs.object.basis.ValueOptionList.Root_" + oField.VALUE_OPTION_LIST_CODE;
							valueList = CodeModel.getCodes(sCodeTable);
						}
					}
					if (!!valueList && valueList.length > 0 && oTxt !== undefined && oTxt !== null && oTxt !== "") {
						jQuery.each(valueList, function(index, data) {
							if (data.CODE.toString() === oTxt.toString()) {
								oTxt = data.DEFAULT_TEXT;
								return;
							}
						});
					}
					var checkBoxText = oField.DEFAULT_TEXT;
					if (oField.IS_PUBLISH && oField.STATE_OF_PUBLISH === 1) {
						checkBoxText = oField.DEFAULT_TEXT + that.getText("OBJECT_MSG_ADMIN_FORM_FIELD_CAN_PUBLISH");
					} else if (oField.IS_PUBLISH) {
						checkBoxText = oField.DEFAULT_TEXT + that.getText("OBJECT_MSG_ADMIN_FORM_FIELD_CANNOT_PUBLISH");
					}

					if (oField.DATATYPE_CODE === "BOOLEAN" && (!valueList || valueList.length === 0)) {
						var bChecked = false;
						if (oField[sDataType]) {
							bChecked = true;
						}

						var oCheckBox = new CheckBox({
							text: checkBoxText,
							selected: bChecked,
							editable: false,
							tooltip: oField.DEFAULT_LONG_TEXT
						});
						var oCheckBoxLabel = oCheckBox._getLabel();
						oCheckBoxLabel.addStyleClass("sapInoIdeaFormLabelStyle");
						oCheckBox.addStyleClass("sapInoIdeaFormChxBoxHeight");
						oFormFields.addItem(oCheckBox);
					} else {
						var contentLbl;
						if (oField.DATATYPE_CODE === "NUMERIC" && !!oTxt && (!valueList || valueList.length === 0)) {
							var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
								groupingEnabled: true,
								groupingSeparator: ","
							});
							contentLbl = new sap.m.Text();
							contentLbl.setText(oNumberFormat.format(oTxt));
						} else if (oField.DATATYPE_CODE === "RICHTEXT" && !!oTxt && (!valueList || valueList.length === 0)) {
							contentLbl = new sap.ui.core.HTML({
								sanitizeContent: true,
								preferDOM: false
							});
							contentLbl.setContent(oTxt);
						} else if (oField.DATATYPE_CODE === "DATE" && !!oTxt && (!valueList || valueList.length === 0)) {
							// 			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
							// 				relative: false
							// 			});
							contentLbl = new sap.m.Text();
							contentLbl.setText(that.formatter.toDate(oTxt));
						} else {
							contentLbl = new sap.m.Text();
							contentLbl.setText(oTxt);
						}
						oFormFields.addItem(oLabel);
						oFormFields.addItem(contentLbl);
					}
				});
			},

			addFormFields: function(aFields, oFormFields, oIdea, oDialogAction) {
				if (oFormFields.getItems().length > 0) {
					//remove all the fields
					oFormFields.removeAllItems();
				}
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
								minimum: (oField.MANDATORY ? 1 : 0)
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
						that.resetClientMessages();
						this.setValueState('None');
					}
				};
				var that = this;
				aFields = aFields.filter(function(oField){
				    if(!oField.ID){
				        return oField.IS_ACTIVE === 1;
				    }
				    return true;
				});
				
				jQuery.each(aFields, function(iId, oField) {
					if (!oField.IS_ACTIVE) {
						return true;
					}
					//bind Idea Model
					var oFieldValue;
				// 	if (oField.CODE !== oIdea.getProperty("/AdminFieldsValue/" + iId + "/CODE")) {
				// 		oFieldValue = jQuery.extend({
				// 			ID: that.getModel("object").getNextHandle(),
				// 			FIELD_CODE: oField.CODE
				// 		}, oField);
				// 	} else {
				// 		oFieldValue = oIdea.getProperty("/AdminFieldsValue/" + iId);
				// 	}
					//oIdea.setProperty("/AdminFieldsValue/" + iId, oFieldValue);				
					if(!oField.ID){
						oFieldValue = jQuery.extend({
							ID: that.getModel("object").getNextHandle(),
							FIELD_CODE: oField.CODE
						}, oField);	
                      that.getModel("editObject").setProperty("/AdminFieldsValue/" + iId, oFieldValue);						
					} else {
					    oFieldValue = that.getModel("editObject").getProperty("/AdminFieldsValue/" + iId);
					}
                     //oIdea.setProperty("/AdminFieldsValue/" + iId, oFieldValue);
					if (oField.IS_DISPLAY_ONLY) {
						var oRichTextHtml = new sap.ui.core.HTML({
							sanitizeContent: true,
							preferDOM: false,
							content: {
								model: "editObject",
								path: "/AdminFieldsValue/" + iId + "/DISPLAY_TEXT",
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
					if (oField.IS_PUBLISH && oField.STATE_OF_PUBLISH) {

						sUnitCodelbl = sUnitCodelbl + that.getText("OBJECT_MSG_ADMIN_FORM_FIELD_CAN_PUBLISH");
					} else if (oField.IS_PUBLISH) {
						sUnitCodelbl = sUnitCodelbl + that.getText("OBJECT_MSG_ADMIN_FORM_FIELD_CANNOT_PUBLISH");
					} else {
						sUnitCodelbl = sUnitCodelbl; // + that.getText('OBJECT_MSG_ADMIN_FORM_FIELD_CANNOT_PUBLISH');
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
						oLabel.addStyleClass("sapInoIdeaFormLabelStyle");
						oFormFields.addItem(oLabel);
						var sCodeTable = "sap.ino.xs.object.basis.ValueOptionList.Root_" + oField.VALUE_OPTION_LIST_CODE;
						oFieldValue.valueOptionList = CodeModel.getCodes(sCodeTable, function(oCode) {
							return oCode.ACTIVE === 1;
						});

						var sValueSelected = "editObject>/AdminFieldsValue/" + iId + "/" + sDataType;
						var oSelectedKey = {
							path: sValueSelected,
							type: fnGetDataType(oField)
						};
						var oComboBox = new ComboBox({
							tooltip: oField.DEFAULT_LONG_TEXT,
							selectedKey: oSelectedKey,
							width: "100%",
							//selectionChange: onSelectionChangeLaborDatum
							change: oField.MANDATORY ? onSelectionChangeLaborDatum : onSelectionChangeWrongData
						});
						oComboBox.addItem();
						var sKey = "{editObject>" + sDataType + "}";
						var oItemTemplate = new ListItem({
							key: sKey,
							text: "{editObject>DEFAULT_TEXT}"
						});
						var sBindingPath = "editObject>/AdminFieldsValue/" + iId + "/valueOptionList";
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
							var textEnd;
							if (oField.IS_PUBLISH && oField.STATE_OF_PUBLISH) {
								textEnd = oField.DEFAULT_TEXT + that.getText("OBJECT_MSG_ADMIN_FORM_FIELD_CAN_PUBLISH");
							} else if (oField.IS_PUBLISH) {
								textEnd = oField.DEFAULT_TEXT + that.getText("OBJECT_MSG_ADMIN_FORM_FIELD_CANNOT_PUBLISH");
							} else {
								textEnd = oField.DEFAULT_TEXT; //+ that.getText('OBJECT_MSG_ADMIN_FORM_FIELD_CANNOT_PUBLISH');
							}
							var oCheckBox = new CheckBox({
								text: textEnd,
								enabled: true,
								tooltip: oField.DEFAULT_LONG_TEXT,
								selected: {
									path: "editObject>/AdminFieldsValue/" + iId + "/BOOL_VALUE",
									type: 'sap.ino.commons.models.types.IntBooleanType'
								},
								select: bMandatory ? fnChkboxSelect : function() {}
							});
							var oChkLabel = oCheckBox._getLabel();
							if (bMandatory) { //Add * to the check box
								oChkLabel.addStyleClass("sapMLabelRequired");
								that.aCheckBoxes.push(oCheckBox);
							}
							oChkLabel.addStyleClass("sapInoIdeaFormLabelStyle");
							oCheckBox.addStyleClass("sapInoIdeaFormChxBoxHeight");
							oFormFields.addItem(oCheckBox);

						} else {
							var oFieldControl;
							var txtLabel = new Label({
								text: sUnitCodelbl,
								tooltip: oField.DEFAULT_LONG_TEXT,
								required: bMandatory
							});
							txtLabel.addStyleClass("sapInoIdeaFormLabelStyle");
							oFormFields.addItem(txtLabel);
							var oValue = {
								path: "editObject>/AdminFieldsValue/" + iId + "/" + sDataType,
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
									//	enabled: bEnableEdit,
									tooltip: oField.DEFAULT_LONG_TEXT,
									value: {
										path: oValue.path,
										type: fnGetDataType(oField)
									},
									width: "100%"
								});
							} else {
								oFieldControl = new Input({
									//	enabled: bEnableEdit,
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
				this._bEditAdminFormContorl = true;
			}
			//end
		}
	));
});