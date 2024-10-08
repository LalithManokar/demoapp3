/*!
 * @copyright@
 */

jQuery.sap.require("sap.ui.ino.views.common.PeopleFacetController");
jQuery.sap.require("sap.ui.ino.models.core.ClipboardModel");
jQuery.sap.require("sap.ui.ino.models.object.Tag");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.application.Configuration");
var Configuration = sap.ui.ino.application.Configuration;

sap.ui.controller("sap.ui.ino.views.backoffice.config.ResponsibilityListValueCriteria", jQuery.extend({}, sap.ui.ino.views.common.PeopleFacetController, {

	onLiveChange: function(oEvent) {
		oEvent.getSource().setValue(oEvent.getParameter("liveValue"));
	},

	setParentController: function(oController) {
		this.oParentController = oController;
	},

	getUsageModel: function() {
		var sOdataPath = Configuration.getApplicationPath("sap.ino.config.URL_PATH_OD_USAGE");
		var oUsageModel = new sap.ui.model.odata.ODataModel(Configuration.getBackendRootURL() + '/' + sOdataPath, false);

		return oUsageModel;
	},

	getModelName: function() {
		return this.oParentController.getModelName();
	},

	isInEditMode: function() {
		return this.oParentController.isInEditMode();
	},

	getModel: function() {
		return this.oParentController.getModel();
	},

	onAddSibling: function(oEvent, oSelectedRowContext) {
		var oModel = this.getModel();
		var iHandle;
		if (!oSelectedRowContext) {
			//add RespValue to the FirstLevle
			iHandle = oModel.addSibling(undefined);
		} else {
			var sID = oModel.getProperty("PARENT_VALUE_ID", oSelectedRowContext);
			iHandle = oModel.addSibling(sID);
		}

		if (iHandle !== 0) {
			this.getView().setRespValuesContextBySiblingID(iHandle);
		}
	},

	onAddChild: function(oEvent, oSelectedRowContext) {
		if (!oSelectedRowContext) {
			var oTextModel = this.getTextModel();
			jQuery.sap.log.error(oTextModel.getText("BO_RESPONSIBILITY_LIST_INS_SELECT_CRITERION"));
			return;
		}
		var oModel = this.getModel();
		var sParentID = oModel.getProperty("ID", oSelectedRowContext);

		var ihandle = oModel.addSubRespValue(sParentID);
		this.getView().setRespValuesContextByChildID(sParentID, ihandle);
	},
	onCopyRespValues: function(oEvent, oSelectedRowContext) {
		var oTextModel = this.getTextModel();
		if (!oSelectedRowContext) {
			jQuery.sap.log.error(oTextModel.getText("BO_RESPONSIBILITY_LIST_INS_SELECT_CRITERION"));
			return;
		}
		var oRespValues = oSelectedRowContext.getObject();
		var oView = this.getView();
		var sCopyPlainCode = oRespValues.PLAIN_CODE;
		var sPrefix = oTextModel.getText("BO_RESPONSIBILITY_LIST_COPY_CODE_PREFIX");
		sCopyPlainCode = sPrefix + sCopyPlainCode;
		oView.oCopyAsCodeField.setValue(sCopyPlainCode);
		oView.oCopyAsDialog.open();
	},

	onCopyPressed: function(sCopyPlainCode, oSelectedRowContext) {
		var oModel = this.getModel();
		var oTextModel = this.getTextModel();
		var sPrefix = oTextModel.getText("BO_RESPONSIBILITY_LIST_COPY_CODE_PREFIX");
		sPrefix = sPrefix + oSelectedRowContext.getObject().DEFAULT_TEXT;
		var iHandle = oModel.copyRespValue(sCopyPlainCode, sPrefix, oSelectedRowContext.getObject());
		if (iHandle) {
			this.getView().setRespValuesContextByID(iHandle);
			this.getView().getCopyAsDialog().close();
		}
	},

	onMoveRespValueUp: function(oEvent, oSelectedRowContext) {
		if (!oSelectedRowContext) {
			var oTextModel = this.getTextModel();
			jQuery.sap.log.error(oTextModel.getText("BO_RESPONSIBILITY_LIST_INS_SELECT_CRITERION"));
			return;
		}
		var oModel = this.getModel();
		var oRespValue = oSelectedRowContext.getObject();
		oModel.moveRespValueUp(oRespValue);
		this.getView().setRespValuesContextByID(oRespValue.ID);
 
	},
	onMoveRespValueDown: function(oEvent, oSelectedRowContext) {
		if (!oSelectedRowContext) {
			var oTextModel = this.getTextModel();
			jQuery.sap.log.error(oTextModel.getText("BO_RESPONSIBILITY_LIST_INS_SELECT_CRITERION"));
			return;
		}
		var oModel = this.getModel();
		var oRespValue = oSelectedRowContext.getObject();

		oModel.moveRespValueDown(oRespValue);
		this.getView().setRespValuesContextByID(oRespValue.ID);
	},
 
	onDeleteRespValues: function(oEvent, oSelectedRowContext) {
		if (!oSelectedRowContext) {
			var oTextModel = this.getTextModel();
			jQuery.sap.log.error(oTextModel.getText("BO_RESPONSIBILITY_LIST_INS_SELECT_CRITERION"));
			return;
		}
		this.oSeletedRespValue = oSelectedRowContext.getObject();
		var oModel = this.getModel();
		var oUsageMode = this.getUsageModel();
		var sPath = "/ResponsibilityValueUsage";

		if (this.oSeletedRespValue.ID > 0) {
			//read the corresponding usage entry, then confirmed that whether it could be deleted or not 
			oUsageMode.read(sPath, this.getUsageModeParamers(this.oSeletedRespValue));
		} else {
			this.getView().oRespValuesTable.setSelectedIndex(-1);
			this.getView().oRespValuesDetailLayout.destroyRows();
			this.getView().oDeleteButton.setEnabled(false);
			oModel.removeRespValue(this.oSeletedRespValue);
		}
	},
	onSelectionChanged: function(oSelectedRowContext, iSelectedIndex, oTable) {
	    this.getThingInspectorController().clearFacetMessages();
		if (iSelectedIndex >= 0) {
			this.getView().setRespValueContext(oSelectedRowContext);
		} else {
			this.getView().setRespValueContext(null);
		}
	},

	onExpandAllRespValues: function() {
		var oTreeTable = this.getView().oRespValuesTable;
		var nCount = this._getResponsibilityCount();
		for (var index = 0; index < nCount; index++) {
			oTreeTable.expand(index);
		}
		//delat call revalidate messages because it would not render all fields immediately
		this.getView().delayRevalidateMessages();
	},

	_getResponsibilityCount: function() {
		var oModel = this.getModel().getProperty("/RespValues");
		return this._getChildrenCount(oModel);
	},

	_getChildrenCount: function(oModel) {
		var nCount = 0;
		if (!oModel || oModel.length <= 0) {
			return nCount;
		}
		for (var index = 0; index < oModel.length; index++) {
			nCount++;
			nCount += this._getChildrenCount(oModel[index].children);
		}
		return nCount;
	},

	//get Usage Filter from Responsiblity list Value children nodes 
	getUsageFilterForDeletingRespValue: function(aRespValues, aFilters) {
		if (aRespValues && aRespValues.length !== 0) {
			for (var i = 0; i < aRespValues.length; i++) {
				var aFilter = new sap.ui.model.Filter("RESP_VALUE_CODE", sap.ui.model.FilterOperator.EQ, aRespValues[i].CODE);
				aFilters.push(aFilter);

				if (aRespValues[i].children && aRespValues[i].children.length !== 0) {
					aFilters = this.getUsageFilterForDeletingRespValue(aRespValues[i].children, aFilters);
				}
			}
			return aFilters;
		}

		return aFilters;
	},

	getUsageModeParamers: function(oSeletedRespValue) {
		var oModel = this.getModel();
		var that = this;
		var aFilters = [];

		//Get filters from currently responsiblity list valude node
		var aFilter = new sap.ui.model.Filter("RESP_VALUE_CODE", sap.ui.model.FilterOperator.EQ, oSeletedRespValue.CODE);
		aFilters.push(aFilter);

		//get filters from children nodes in seleted Responsiblity List Values
		var oSeletedRespValues = oModel.getRespValuesByParentValueId(oSeletedRespValue.ID);
		aFilters = this.getUsageFilterForDeletingRespValue(oSeletedRespValues, aFilters);

		var fnOnSucessToReadRespValueUsage = function(oData) {

			var iRespValueUsageCount = oData.results.length;

			var oDeleteRespValueDialogContent = that.getDeleteRespValueDialogContent(iRespValueUsageCount);

			that.oDeleteRespValueDialog = that.getDeleteRespValueDialog(iRespValueUsageCount);
			that.oDeleteRespValueDialog.addContent(oDeleteRespValueDialogContent);
			that.getView().addDependent(that.oDeleteRespValueDialog);

			that.oDeleteRespValueDialog.open();

		};

		var fnOnFailedToReadRespValueUsage = function() {

		};

		return {
			filters: aFilters,
			success: fnOnSucessToReadRespValueUsage,
			error: fnOnFailedToReadRespValueUsage
		};

	},
	getDeterminationForDeletionAction: function(iRespValueUsageCount) {
		var oData = this.getModel().getData();

		//selected responsibility List value not in RootNode
		if (this.oSeletedRespValue.PARENT_VALUE_ID !== null) {
			return true;
		}

		//responsibility List only have one root node, and it is selected
		if (oData.RespValues && oData.RespValues.length === 1 && this.oSeletedRespValue.PARENT_VALUE_ID === null) {
			return false;
		}

		//a. selected responsibility List value in Root node 
		//b. responsibility List have more that one Root Node
		//c. selected responsibility List value is used by idea
		if (oData.RespValues && oData.RespValues.length > 1 && this.oSeletedRespValue.PARENT_VALUE_ID === null && iRespValueUsageCount === 0) {

			return true;
		}

		return false;

	},

	getDeleteRespValueDialogContent: function(iRespValueUsageCount) {
		var oDeleteRespValueGeneralText = new sap.ui.commons.TextView({
			text: this.getRespValueGeneralTextForDeletion(iRespValueUsageCount)
		});

		var oAffectedIdeaText = new sap.ui.commons.TextView({
			text: this.getAffectedIdeaTextForDeletion(iRespValueUsageCount),
			visible: iRespValueUsageCount ? true : false
		});

		var oReassignRespValueText = new sap.ui.commons.TextView({
			text: this.getTextModel().getText("BO_RESPONSIBILITY_LIST_CRITERIA_EXP_DELETE_RESPVALUE_REASSIGN"),
			visible: iRespValueUsageCount && this.getDeterminationForDeletionAction(iRespValueUsageCount) ? true : false
		});

		var oDeleteRespValueConfirmationLayout = new sap.ui.commons.layout.VerticalLayout({
			content: [oDeleteRespValueGeneralText, oAffectedIdeaText, oReassignRespValueText]
		});

		return oDeleteRespValueConfirmationLayout;
	},

	getRespValueGeneralTextForDeletion: function(iRespValueUsageCount) {
		var bDeletionActionForRootNode;
		//selected responsibility List value not in RootNode
		if (this.oSeletedRespValue.PARENT_VALUE_ID !== null) {
			return this.getTextModel().getText("BO_RESPONSIBILITY_LIST_CRITERIA_EXP_DELETE_RESPVALUE_GERNERAL", [this.oSeletedRespValue.DEFAULT_TEXT]);
		}

		//get delete action status for Root Node
		bDeletionActionForRootNode = this.getDeterminationForDeletionAction(iRespValueUsageCount);

		if (bDeletionActionForRootNode) {
			return this.getTextModel().getText("BO_RESPONSIBILITY_LIST_CRITERIA_EXP_DELETE_RESPVALUE_ROOT_GERNERAL", [this.oSeletedRespValue.DEFAULT_TEXT]);
		} else {
			return this.getTextModel().getText("BO_RESPONSIBILITY_LIST_CRITERIA_EXP_DELETE_RESPVALUE_ROOT_NOT_ALLOWED", [this.oSeletedRespValue.DEFAULT_TEXT]);
		}

	},

	getAffectedIdeaTextForDeletion: function(iRespValueUsageCount) {
		//selected responsibility List value not in RootNode
		if (this.oSeletedRespValue.PARENT_VALUE_ID !== null) {
			return this.getTextModel().getText("BO_RESPONSIBILITY_LIST_CRITERIA_EXP_DELETE_RESPVALUE_AFFECTED_IDEA", [iRespValueUsageCount]);
		}

		return this.getTextModel().getText("BO_RESPONSIBILITY_LIST_CRITERIA_EXP_DELETE_RESPVALUE_ROOT_NOT_ALLOWED_ROOT_CAUSE", [
			iRespValueUsageCount]);

	},

	getDeleteRespValueDialog: function(iRespValueUsageCount) {
		var that = this;

		var oCancelButton = new sap.ui.commons.Button({
			text: this.getDeterminationForDeletionAction(iRespValueUsageCount) ? this.getTextModel().getText("BO_COMMON_BUT_CANCEL") : this.getTextModel()
				.getText("BO_COMMON_BUT_OK"),
			press: function() {
				if (that.oDeleteRespValueDialog) {
					that.oDeleteRespValueDialog.close();
				}
			}
		});

		var oConfirmButton = new sap.ui.commons.Button({
			text: this.getTextModel().getText("BO_COMMON_BUT_CONFIRM"),
			press: function() {
				var oModel = that.getModel();
				if (oModel && that.oSeletedRespValue && that.oDeleteRespValueDialog) {

					that.getView().oRespValuesTable.setSelectedIndex(-1);
					that.getView().oDeleteButton.setEnabled(false);
					oModel.removeRespValue(this.oSeletedRespValue);

					oModel.removeRespValue(that.oSeletedRespValue);
					that.getView().oRespValuesDetailLayout.destroyRows();
					that.getView().oRespValuesDetailLayout.removeAllRows();

					that.oDeleteRespValueDialog.close();
				}
			},
			visible: this.getDeterminationForDeletionAction(iRespValueUsageCount)
		});

		var oDeleteRespValueDialog = new sap.ui.commons.Dialog({
			title: this.getTextModel().getText("BO_RESPONSIBILITY_LIST_CRITERIA_TIT_DELETE_RESPVALUE")
		});

		oDeleteRespValueDialog.addButton(oConfirmButton);
		oDeleteRespValueDialog.addButton(oCancelButton);

		return oDeleteRespValueDialog;
	},

	getModelPrefix: function() {
		return this.oParentController.getModelPrefix();
	},

	getTextPath: function(oBinding) {
		if (typeof oBinding === "object") {
			return oBinding;
		}
		return "{" + this.getTextModelPrefix() + oBinding + "}";
	},

	getTextModelPrefix: function() {
		return this.oParentController.getTextModelPrefix();
	},

	getBoundPath: function(oBinding, absolute) {
		if (typeof oBinding === "object") {
			return oBinding;
		}
		if (absolute) {
			return "{" + this.getModelPrefix() + "/" + oBinding + "}";
		} else {
			return "{" + this.getModelPrefix() + oBinding + "}";
		}
	},

	getBoundObject: function(oBinding, absolute, oType) {
		if (typeof oBinding === "object") {
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
	getTextModel: function() {
		if (!this.i18n) {
			this.i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
		}
		return this.i18n;
	},

	getFormatterPath: function(oBinding, absolute) {
		if (typeof oBinding === "object") {
			return oBinding;
		}
		if (absolute) {
			return this.getModelPrefix() + "/" + oBinding;
		} else {
			return this.getModelPrefix() + oBinding;
		}
	},

	getThingInspectorController: function() {
		return this.oParentController.getThingInspectorController();
	},

	getThingInspectorView: function() {
		return this.getThingInspectorController().getView();
	},

	addTagsFromClipboard: function(oButton, sNodeName) {
		var oController = this;
		var oClipboard = sap.ui.ino.models.core.ClipboardModel.sharedInstance();
		var aTagKeys = oClipboard.getObjectKeys(sap.ui.ino.models.object.Tag);
		var oResponsibility = this.getModel();

		jQuery.each(aTagKeys, function(iTagKeyIndex, oTagKey) {
			var oReadRequest = oClipboard.getObjectForKey(sap.ui.ino.models.object.Tag, oTagKey);
			oReadRequest.done(function(oTag) {
				var oMessage = oResponsibility.addTag({
					TAG_ID: oTag.ID,
					NAME: oTag.NAME
				}, sNodeName);
				if (oMessage) {
					oMessage.setReferenceControl(oButton);
					oController.getThingInspectorView().addMessage(oMessage);
				}
			});

			oReadRequest.fail(function(oTag) {
				var oMessage = new sap.ui.ino.application.Message({
					key: "MSG_IDEA_FLD_TAG_LOAD_FAILED",
					level: sap.ui.core.MessageType.Error,
					group: "TAG",
					parameters: [oTagKey]
				});
				oController.getThingInspectorView().addMessage(oMessage);
			});
		});
	},

	onTagAdded: function(oTextField, sNodeName) {
		var oTIView = this.getThingInspectorView();
		oTIView.removeAllMessages("TAG");
		var oSelectedItem = sap.ui.getCore().byId(oTextField.getSelectedItemId());
		var iTagId;
		var sName;

		if (oSelectedItem) {
			iTagId = parseInt(oSelectedItem.getKey(), 10);
			sName = oSelectedItem.getText();
		} else {
			sName = oTextField.getValue();
		}

		var oResponsibility = this.getModel();
		var oMessage = oResponsibility.addTag({
			TAG_ID: iTagId,
			NAME: sName
		}, sNodeName);

		if (oMessage) {
			oMessage.setReferenceControl(oTextField);
			oTIView.addMessage(oMessage);
		} else {
			oTextField.setValue("");
		}
	},

	onTagRemoved: function(oEvent) {
		var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
		oApp.removeNotificationMessages("TAG");
		var oTag = oEvent.getSource().getBindingContext(this.getModelName()).getObject();
		this.getModel().removeChild(oTag);
	},

	getBindingPath: function(oBindingContext) {
		if (!oBindingContext || !oBindingContext.sPath) {
			throw new Error("invalid path");
		}
		var path = oBindingContext.sPath + "/";
		if (oBindingContext.sPath.indexOf("/") === 0) {
			path = oBindingContext.sPath.substring(1) + "/";
		}
		return path;
	},

	onActiveChange: function(oEvent) {
		var oController = this;
		var sPath = oEvent.getSource().getBindingInfo("checked").binding.getContext().sPath;
		var oModel = oController.getModel();
		var aChildrens = oModel.getProperty(sPath).children;
		var bParentActive = oEvent.getParameter("checked");
		
		oController._deactiveResponsibility(oController, aChildrens, bParentActive);
	},

	_deactiveResponsibility: function(oController, aChildrens, bParentActive) {
		if (!aChildrens || aChildrens.length <= 0) {
			return;
		}
		jQuery.each(aChildrens, function(index, data) {
			data.IS_ACTIVE = bParentActive;
			data.IS_PARENT_ACTIVE = bParentActive;
			oController._deactiveResponsibility(oController, data.children, bParentActive);
		});
	},
	
	onLinkUrlChanged: function(oEvent) {
	    var sURL = oEvent.getParameter("newValue");
	    var oControl = oEvent.getSource();
	    
        sURL = sURL.trim();
	    if (sURL && sURL.indexOf("http://") !== 0 && sURL.indexOf("https://") !== 0 && sURL.indexOf("mailto:") !== 0) {
			sURL = "http://" + sURL;
			if(oControl) {
			    oControl.setValue(sURL);
			}
		}

		if (!sURL || sURL === "" || !jQuery.sap.validateUrl(sURL)) {
    	    var oMessage = new sap.ui.ino.application.Message({
    					key: "MSG_RESPONSIBILITY_VALUE_INVALID_URL",
    					level: sap.ui.core.MessageType.Error,
    					group: "URL",
    					parameters: [sURL]
    				});
    		if (oControl) {
		       oControl.setValueState(sap.ui.core.ValueState.Error);
		       oMessage.setReferenceControl(oControl);
		    }		
    		this.getThingInspectorView().addValidationMessage(oMessage);	
		} else {
		    if (oControl) {
		        this.getThingInspectorView().removeMessagesForControl(oControl);
		    }
		}
	},
	onSortRespValues: function(oEvent,sortType){
		var oModel = this.getModel();	
		oModel.sortRespValuesByName(sortType);
	    
	}
	
}));