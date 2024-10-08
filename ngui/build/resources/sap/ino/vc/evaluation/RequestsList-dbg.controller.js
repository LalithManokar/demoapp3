sap.ui.define([
    "sap/ui/Device",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ino/commons/application/Configuration",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ino/commons/models/aof/ApplicationObjectChange",
    "sap/ino/controls/OrientationType",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ino/vc/commons/BaseVariantListController",
    "sap/ino/vc/evaluation/mixins/MassActionMixin"
], function(
	Device,
	Sorter,
	Filter,
	FilterOperator,
	MessageBox,
	Configuration,
	ObjectListFormatter,
	ApplicationObjectChange,
	OrientationType,
	TopLevelPageFacet,
	BaseController,
	MassActionMixin) {
	"use strict";

	var mRoutes = {
		EVALREQ: "evalreqlist",
		EVALREQ_VARIANT: "evalreqlistvariant"
	};

	var mVariant = {
		EVAL_REQ_ALL: "all",
		EVAL_REQ_FOR_ME: "forme",
		EVAL_REQ_FOR_ME_OVERDUE: "formeoverdue",
		EVAL_REQ_MY: "my",
		EVAL_REQ_MY_OVERDUE: "myoverdue"
	};

	var mFilter = {
		NONE: undefined,
		EVAL_REQ_FOR_ME: "forMe",
		EVAL_REQ_FOR_ME_OVERDUE: "forMeOverdue",
		EVAL_REQ_MY: "byMe",
		EVAL_REQ_MY_OVERDUE: "byMeOverdue"
	};

	var mList = {
	   	NAME:"EVAL_REQ_LIST_MIT_NAME",
		Variants: {
			DEFAULT_VARIANT: mVariant.EVAL_REQ_ALL,
			TITLE: "EVAL_REQ_LIST_MIT_ALL",
		
			Values: [{
				TEXT: "EVAL_REQ_LIST_MIT_ALL",
				ACTION: mVariant.EVAL_REQ_ALL,
				FILTER: mFilter.NONE,
				MANAGE: false
            }, {
				TEXT: "EVAL_REQ_LIST_MIT_FOR_ME",
				ACTION: mVariant.EVAL_REQ_FOR_ME,
				HIERARCHY_LEVEL: "1",
				FILTER: mFilter.EVAL_REQ_FOR_ME,
				MANAGE: false
            }, {
				TEXT: "EVAL_REQ_LIST_MIT_FOR_ME_OVERDUE",
				ACTION: mVariant.EVAL_REQ_FOR_ME_OVERDUE,
				HIERARCHY_LEVEL: "1",
				FILTER: mFilter.EVAL_REQ_FOR_ME_OVERDUE,
				MANAGE: false
            }, {
				TEXT: "EVAL_REQ_LIST_MIT_MY",
				ACTION: mVariant.EVAL_REQ_MY,
				HIERARCHY_LEVEL: "1",
				FILTER: mFilter.EVAL_REQ_MY,
				MANAGE: true
            }, {
				TEXT: "EVAL_REQ_LIST_MIT_MY_OVERDUE",
				ACTION: mVariant.EVAL_REQ_MY_OVERDUE,
				HIERARCHY_LEVEL: "1",
				FILTER: mFilter.EVAL_REQ_MY_OVERDUE,
				MANAGE: true
            }]
		}
	};

	var oList = BaseController.extend("sap.ino.vc.evaluation.RequestsList", jQuery.extend({}, TopLevelPageFacet, MassActionMixin, {

		formatter: jQuery.extend({}, ObjectListFormatter),

		list: mList,

		routes: ["evalreqlist", "evalreqlistvariant"],

		view: {
			"List": {
				"VARIANT": mVariant.EVAL_REQ_ALL,
				"MANAGE": false,
				"TAGS": [],
				"IS_TAGS_SELECTION": false,
				"TAGCLOUD": true,
				"TAGCLOUD_EXPABLE": true,
				"TAGCLOUD_EXP": false,
				"TAGCLOUD_BAR_VISIBLE": false
			},
			"ORIENTATION": OrientationType.PORTRAIT
		},

		onInit: function() {
			BaseController.prototype.onInit.apply(this, arguments);
			this.oViewModel = this.getModel("view");
			this.oViewModel.setData(this.view, true);
			this.initApplicationObjectChangeListeners();
		},

		onRouteMatched: function(oEvent) {
			this.setGlobalFilter([]);
			this.setHelp("EVALREQ_LIST");
			this.show(oEvent);
			this._bInnerViewNavigation = true;
		},

		onCampaignDialogItemsSelect: function(oEvent) {
		    var sSelectedKey = oEvent.getParameter("selectedItem").data("ID") + "";
			var oCampaignFilterList = this.byId("panelFilterFragment--campaignFilterList");
			oCampaignFilterList.getBinding("suggestionItems").filter([]);
			var oCampaignFilterItems = oCampaignFilterList.getSuggestionItems();
			for (var i = 0; i < oCampaignFilterItems.length; i++) {
				if (oCampaignFilterItems[i].getProperty("key") === sSelectedKey) {
					oCampaignFilterList.setSelectionItem(oCampaignFilterItems[i]);
					break;
				}
			}
			if(sSelectedKey !== this.getViewProperty("/List/CAMPAIGN")){
			    this.setViewProperty("/List/CAMPAIGN", sSelectedKey);
			    this.setFilter(new Filter("CAMPAIGN_ID", FilterOperator.EQ, sSelectedKey));
			    this._filter();
			}
		},

		onCampaignDialogSearch: function(oEvent) {
		    var oBinding = oEvent.getParameter("itemsBinding");
			var sValue = jQuery.sap.encodeURL(oEvent.getParameter("value"));
			oBinding.filter(new Filter("SHORT_NAME", FilterOperator.Contains, sValue));
			oBinding.sort(new Sorter("SHORT_NAME"));
		},

		onCampaignSuggestion: function(oEvent) {
		    var oViewModel = this.getModel("view");
		    var oBinding = oEvent.getSource().getBinding("suggestionItems");
			var mEvent = jQuery.extend({}, oEvent, true);
			var sValue = mEvent.getParameter("suggestValue");
			this.resetClientMessages();
			this.byId("panelFilterFragment--campaignFilterList").setFilterSuggests(false);
			oViewModel.setProperty("/campaignSuggestion", this._aCampaignSuggestion);
			oBinding.filter(new Filter("SHORT_NAME", FilterOperator.Contains, sValue));
			oBinding.sort(new Sorter("SHORT_NAME"));
		},

		onFilterReset: function() {
			this.setViewProperty("/List/IDEA_TITLE", "");
			this.setViewProperty("/List/CAMPAIGN_TITLE", "");
			this.setViewProperty("/List/EXPERT_NAME", "");
			this.setViewProperty("/List/STATUS_TEXT", "");
			this.setViewProperty("/List/CAMPAIGN", undefined);
			this.setViewProperty("/List/ACCEPT_DATE", undefined);
			this.setViewProperty("/List/COMPLETE_DATE", undefined);
			var oTable = this.getList();
			var oColumns = oTable.getColumns();
			for (var i = 0; i < oColumns.length; i++) {
				oTable.filter(oColumns[i], null);
			}
			this.byId("panelFilterFragment--campaignFilterList").setValue(undefined);
			this.setFilter([]);

			if (!Device.system.desktop) {
				//no navigation on mobile phones yet
				return;
			}
		},

		onFilterCampaignChange: function(oEvent) {
			var sSelectedKey = oEvent.getParameter("selectedItem") ? Number(oEvent.getParameter("selectedItem").getProperty("key")) : undefined;
			if(sSelectedKey !== this.getViewProperty("/List/CAMPAIGN")){
			    this.setViewProperty("/List/CAMPAIGN", sSelectedKey);
			    this.setFilter(new Filter("CAMPAIGN_ID", FilterOperator.EQ, sSelectedKey));
			    this._filter();
			}
		},
		
		onClearCampaignFilter: function(oEvent) {
		    var sValue = oEvent.getParameter("value");
		    if (sValue.trim() === "") {
		        this.setViewProperty("/List/CAMPAIGN", undefined );
			    this.setFilter([]);
			    this._filter();
		    }
		},

		onHandleCampaignFilterHelp: function() {
			var oViewModel = this.getModel("view");
			if(!this._oCampaignlistDialog){
			    this._oCampaignlistDialog = this.createCampaignListDialog();
			}
			oViewModel.setProperty("/campaignSuggestion", this._aCampaignSuggestion);
			this._oCampaignlistDialog.open();
		},

		onOrientationChange: function() {},

		onTableFilter: function(oEvent) {
			oEvent.preventDefault();
			var oColumn = oEvent.getParameter("column");
			var sValue = oEvent.getParameter("value");
			var sId = oColumn.getId().substr(oColumn.getId().lastIndexOf("-") + 1);

			switch (sId) {
				case "colIdeaTitle":
					this.setViewProperty("/List/IDEA_TITLE", sValue);
					break;
				case "colExpert":
					this.setViewProperty("/List/EXPERT_NAME", sValue);
					break;
				case "colCampaign":
					this.setViewProperty("/List/CAMPAIGN_TITLE", sValue);
					break;
				case "colStatus":
					this.setViewProperty("/List/STATUS_TEXT", sValue);
					break;
				case "colAcceptDate":
					this.setViewProperty("/List/ACCEPT_DATE", sValue);
					break;
				case "colCompleteDate":
					this.setViewProperty("/List/COMPLETE_DATE", sValue);
					break;
				default:
					break;
			}

			oColumn.setFiltered(Boolean(sValue));
			this._filter();
		},

		onTableSelectionChange: function(oEvent) {
			var oTable = this.getList();
			var aSelect = oTable.getSelectedIndices();
			var aStatusForAcceptReject = jQuery.grep(aSelect, function(iIndex) {
				var sStatus = oTable.getContextByIndex(iIndex).getProperty("STATUS_CODE");
				return sStatus === "sap.ino.config.EVAL_REQ_REQUESTED" || sStatus === "sap.ino.config.EVAL_REQ_IN_CLARIFICATION";
			});
			var aStatusForCreate = jQuery.grep(aSelect, function(iIndex) {
				var sStatus = oTable.getContextByIndex(iIndex).getProperty("STATUS_CODE");
				return sStatus !== "sap.ino.config.EVAL_REQ_REJECTED" && sStatus !== "sap.ino.config.EVAL_REQ_COMPLETED" && sStatus !==
					"sap.ino.config.EVAL_REQ_EXPIRED";
			});
			var aStatusForFoward = jQuery.grep(aSelect, function(iIndex) {
				var sStatus = oTable.getContextByIndex(iIndex).getProperty("STATUS_CODE");
				return sStatus !== "sap.ino.config.EVAL_REQ_REJECTED" && sStatus !== "sap.ino.config.EVAL_REQ_COMPLETED" && sStatus !==
					"sap.ino.config.EVAL_REQ_EXPIRED" && sStatus !== "sap.ino.config.EVAL_REQ_ACCEPTED";
			});

			/* select items which shares the same "EVAL_REQ_ID" */
			if (this.getViewProperty("/List/IS_EVAL_REQ_LIST_BY_ME")) {
				// if (!this._bIsWarnedForEvalReq) {
				// 	this._bIsWarnedForEvalReq = true;
				// 	MessageBox.show(this.getText("SELECTION_WITH_EVAL_REQ_MESSAGE"), MessageBox.Icon.INFORMATION, this.getText("MESSAGE_TIT_WARNING"), [
				// 		MessageBox.Action.OK]);
				// }
				// if (this._bIsTableSelectionChanging) {
				// 	/* when selecting items and triggering this event, do not handle this event */
				// 	return;
				// }

				// var bSelected = aSelect.indexOf(oEvent.getParameter("rowIndex")) >= 0 ? true : false;
				// var iCount = oEvent.getParameter("rowIndex") === -1 || oEvent.getParameter("selectAll") ? 0 : oTable._getRowCount();
				// var iEvalReqId = oEvent.getParameter("rowIndex") === -1 || oEvent.getParameter("selectAll") ? 0 : oTable.getContextByIndex(oEvent.getParameter(
				// 	"rowIndex")).getProperty("EVAL_REQ_ID");

				// for (var j = 0; j < iCount; j++) {
				// 	this._bIsTableSelectionChanging = true;
				// 	if (oTable.getContextByIndex(j).getProperty("EVAL_REQ_ID") === iEvalReqId && j !== oEvent.getParameter("rowIndex")) {
				// 		if (bSelected) {
				// 			oTable.addSelectionInterval(j, j);
				// 		} else {
				// 			oTable.removeSelectionInterval(j, j);
				// 		}
				// 	}
				// }

				if (this.byId("sapInoMassDeleteBtn")) {
					this.byId("sapInoMassDeleteBtn").setEnabled(aSelect.length > 0);
				}

				// this._bIsTableSelectionChanging = false;
			}

			if (this.byId("sapInoAcceptBtn") && this.byId("sapInoRejectBtn") && this.byId("sapInoFowardBtn") && this.byId(
				"sapInoCreateBtn")) {
				this.byId("sapInoAcceptBtn").setEnabled(aSelect.length > 0 && aStatusForAcceptReject.length === aSelect.length);
				this.byId("sapInoRejectBtn").setEnabled(aSelect.length > 0 && aStatusForAcceptReject.length === aSelect.length);
				this.byId("sapInoFowardBtn").setEnabled(aSelect.length > 0 && aStatusForFoward.length === aSelect.length);
				this.byId("sapInoCreateBtn").setEnabled(aSelect.length > 0 && aStatusForCreate.length === aSelect.length);
			}
		},

		onTableColumnMenuOpen: function(oEvent) {
			var oMenu = oEvent.getParameter("menu");
			var sId = oEvent.getParameters().id;
			sId = sId.substr(sId.lastIndexOf("-") + 1);
			if (sId === "colAcceptDate" || sId === "colCompleteDate") {
				oMenu.onAfterRendering = function() {
					var oItem = $(oMenu.getItems()[2].getDomRef());
					oItem.find("label").html(this.getText("EVAL_REQ_LIST_FLD_WITHIN_NEXT"));
					oItem.find("input").addClass("sapUiTinyMarginBeginEnd").attr("style", "width:5em").attr("type", "number").attr("min", "1").after(
						"<label class='sapUiMnuTfItemLbl'>" + this.getText("EVAL_REQ_LIST_FLD_DAYS") + "</label>");
				};
			}
		},
		
		onTableBtnPress: function(oEvent){
            var oSource = oEvent.getSource();
            var iEvalId = oSource.getBindingContext("data").getProperty("ID");
            this.navigateTo("evaluationrequest-item", {
                id: iEvalId
            });
		},

		_filter: function() {
			var that = this;
			var aFilters = [];
			if (this.getViewProperty("/List/CAMPAIGN")) {
				aFilters.push(new Filter("CAMPAIGN_ID", FilterOperator.EQ, this.getViewProperty("/List/CAMPAIGN")));
			}
			if (this.getViewProperty("/List/CAMPAIGN_TITLE")) {
				aFilters.push(new Filter({
					path: "CAMPAIGN_TITLE",
					test: function(oValue) {
						var sValue = that.getViewProperty("/List/CAMPAIGN_TITLE");
						if (oValue && oValue.toLowerCase().indexOf(sValue.trim().toLowerCase()) >= 0) {
							return true;
						}
						return false;
					}
				}));
			}
			if (this.getViewProperty("/List/IDEA_TITLE")) {
				aFilters.push(new Filter({
					path: "IDEA_TITLE",
					test: function(oValue) {
						var sValue = that.getViewProperty("/List/IDEA_TITLE");
						if (oValue && oValue.toLowerCase().indexOf(sValue.trim().toLowerCase()) >= 0) {
							return true;
						}
						return false;
					}
				}));
			}
			if (this.getViewProperty("/List/EXPERT_NAME")) {
				aFilters.push(new Filter({
					path: "EXPERT_NAME",
					test: function(oValue) {
						var sValue = that.getViewProperty("/List/EXPERT_NAME");
						if (oValue && oValue.toLowerCase().indexOf(sValue.trim().toLowerCase()) >= 0) {
							return true;
						}
						return false;
					}
				}));
			}
			if (this.getViewProperty("/List/STATUS_TEXT")) {
				aFilters.push(new Filter({
					path: "STATUS_TEXT",
					test: function(oValue) {
						var sValue = that.getViewProperty("/List/STATUS_TEXT");
						if (oValue && oValue.toLowerCase().indexOf(sValue.trim().toLowerCase()) >= 0) {
							return true;
						}
						return false;
					}
				}));
			}
			if (this.getViewProperty("/List/ACCEPT_DATE")) {
				aFilters.push(new Filter({
					path: "ACCEPT_DATE",
					test: function(oValue) {
						var oDate = new Date();
						var sValue = that.getViewProperty("/List/ACCEPT_DATE");
						if (!oValue || isNaN(sValue)) {
							return false;
						}
						sValue = parseInt(sValue, 10);
						if (oDate.setDate(oDate.getDate() + sValue) < oValue) {
							return false;
						}
						return true;
					}
				}));
			}
			if (this.getViewProperty("/List/COMPLETE_DATE")) {
				aFilters.push(new Filter({
					path: "COMPLETE_DATE",
					test: function(oValue) {
						var oDate = new Date();
						var sValue = that.getViewProperty("/List/COMPLETE_DATE");
						if (!oValue || isNaN(sValue)) {
							return false;
						}
						sValue = parseInt(sValue, 10);
						if (oDate.setDate(oDate.getDate() + sValue) < oValue) {
							return false;
						}
						return true;
					}
				}));
			}
			this.getList()
				.getBinding("rows")
				.filter(aFilters.length ? new Filter(aFilters, true) : null, "Application");
		},

		_check4ManagingList: function() {
			var bBackoffice = Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access");

			if (bBackoffice) {
				var sVariant = this.getViewProperty("/List/VARIANT");
				var aVariants = this.getListProperty("/Variants/Values");

				var vVariant = jQuery.grep(aVariants, function(oVariant) {
					return oVariant.ACTION === sVariant;
				});

				vVariant = (vVariant && vVariant.length > 0) ? vVariant[0] : {};

				return vVariant.MANAGE || vVariant.CAMPAIGN_MANAGE || false;
			}

			return false;
		},

		bindList: function() {
		    var that = this;
			this.saveState();

			// see MassActionMixin.js - cleans all internal state for mass action execution
			this.resetActionState();

			var sPath = "";
			var bIsLandscape = false;
			var oBindingParameter = this.getBindingParameter();
			
			function fnCallback(){
			    var aData = arguments[0].getParameter("data").results;
			    var aNewData = [];
			    var oViewModel = that.getModel("view");
			    jQuery.each(aData, function(iIndex, oItem){
			        if(jQuery.grep(aNewData, function(oNewItem){
			            return oNewItem.ID === oItem.CAMPAIGN_ID;
			        }).length === 0 || aNewData.length === 0){
			            aNewData.push({
			                ID: oItem.CAMPAIGN_ID,
			                SHORT_NAME: oItem.CAMPAIGN_TITLE
			            });
			        }
			    });
			    oViewModel.setProperty("/campaignSuggestion", aNewData);
			    that._aCampaignSuggestion = aNewData;
			    that._filter();
			}

			sPath += "SearchEvaluationRequestParams";
			sPath += "(filterName='" + (oBindingParameter.VariantFilter || "") + "'" + ")/Results";

			this.setPath("data>/" + sPath);

			if ((!Device.system.desktop && Device.orientation.landscape) ||
				(Device.system.desktop && this.getViewProperty("/ORIENTATION") === OrientationType.LANDSCAPE)) {
				bIsLandscape = true;
			}

			this.getList().bindRows({
				parameters: {
					operationMode: "Client"
				},
				sorter: new Sorter("COMPLETE_DATE", false),
				path: this.getPath(),
				events: {
					dataRequested: function() {
						jQuery.each(that.getBusyControls(), function(iIdx, oControl) {
							if (jQuery.type(oControl.setBusy) === "function") {
								oControl.setBusy(true);
							}
						});
					},
					dataReceived: function() {
						jQuery.each(that.getBusyControls(), function(iIdx, oControl) {
							if (jQuery.type(oControl.setBusy) === "function") {
								oControl.setBusy(false);
							}
						});

						if (jQuery.type(fnCallback) === "function") {
							fnCallback.apply(this,arguments);
						}
					}
				}
			});
		},

		createCampaignListDialog: function() {
			if (!this._campaignDialog) {
				this._campaignDialog = this.createFragment("sap.ino.vc.idea.fragments.CampaignSuggestionSelectList", this.getView().getId());
				this.getView().addDependent(this._campaignDialog);
			}
			return this._campaignDialog;
		},

		getBindingParameter: function() {
			var sVariant, sVariantFilter;
			sVariant = this.getViewProperty("/List/VARIANT");
			sVariantFilter = this.getCurrentVariant().FILTER;
			var sSearchTerm = this.getViewProperty("/List/SEARCH");
			var aTags = this.getViewProperty("/List/TAGS");
			var sCampaignId = this.getViewProperty("/List/CAMPAIGN");

			var aTagId = jQuery.map(aTags, function(oTag) {
				return oTag.ID;
			});

			return {
				Variant: sVariant,
				VariantFilter: sVariantFilter,
				SearchTerm: sSearchTerm,
				TagIds: aTagId,
				CampaignId: sCampaignId
			};
		},

		getList: function() {
			return this.byId("tablelist--evaluationrequestlist");
		},

		getVariantVisibility: function(sVariant) {
			var aVariants, bVisible;

			aVariants = this.getModel("list").getProperty("/Variants/Values");

			for (var i = 0; i < aVariants.length; i += 1) {
				var oVariant = aVariants[i];

				if (oVariant.ACTION === sVariant) {
					bVisible = oVariant.VISIBLE;
				}
			}

			return bVisible;
		},
		
		initApplicationObjectChangeListeners: function() {
			var that = this;
			var aActions = ["create", "del", "modifyAndSubmit", "executeStatusTransition", "forward"];

			var fnAOChangeListener = function(oEvent) {
				var sAction = oEvent.getParameter("actionName");
				if (sAction && aActions.indexOf(sAction) > -1 && oEvent.getParameter("object").getMetadata().getName() ===
					"sap.ino.commons.models.object.EvaluationRequestItem") {
					that.bindList();
				}
			};

			ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Create, fnAOChangeListener);
			ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Del, fnAOChangeListener);
			ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.Action, fnAOChangeListener);
		},

		show: function(oEvent, oObject) {
			var oQuery;
			var sVariant;
			if (oEvent && oEvent.getParameter) {
				var oArguments = oEvent.getParameter("arguments");
				oQuery = oArguments["?query"];
				sVariant = oArguments.variant;
			} else {
				sVariant = oObject.variant;
				oQuery = oObject;
			}

			var that = this;

			var sDefaultVariant = this.getListProperty("/Variants/DEFAULT_VARIANT");
			this.setViewProperty("/isre", sVariant || sDefaultVariant);

			sVariant = this.getViewProperty("/isre");
			var oVariant = this.getVariant(sVariant);
			this.setViewProperty("/List/VARIANT", oVariant.ACTION);

			var bBound = this.getList() && this.getList().isBound("rows");

			var bRebindRequired = this.hasStateChanged(this.getCurrentRoute(), sVariant, oQuery, Device.orientation.portrait);
			bRebindRequired = bRebindRequired || this._bListChanged;
			this._bListChanged = false;

			if (!bBound || bRebindRequired) {
				// update the VISIBILITY flag of all variants for binding in Filter
				this.setVariantVisibility();

				this.setParameters(oQuery, oVariant);

				//TODO move to ListPage
				var iOrientation = this.getViewProperty("/ORIENTATION");
				this.onOrientationChange(Device.system.desktop ? iOrientation : Device.orientation);

				//check visiablity for current Variiant
				var bVisible = this.getVariantVisibility(sVariant);

				if (bVisible === false || typeof(bVisible) === "undefined") {
					MessageBox.show(
						that.getText("NOT_AUTHORIZED_MESSAGE"),
						MessageBox.Icon.INFORMATION,
						that.getText("NOT_AUTHORIZED_DIALOG_TITLE"), [MessageBox.Action.OK],
						function() {
							that.navigateTo("home");
						});
					return;
				}

				this.bindList();
			}
		},

		setParameters: function(oQuery, oVariant) {
			oQuery = oQuery || {};
			var sVariant = oVariant.ACTION;
			this.setViewProperty("/List/HAS_BACKOFFICE", Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access"));
			this.setViewProperty("/List/TAGCLOUD", false);
			this.setViewProperty("/List/MANAGE", true);
			this.setViewProperty("/List/IS_EVAL_REQ_LIST", true);
			this.setViewProperty("/List/IS_EVAL_REQ_LIST_FOR_ME", false);
			this.setViewProperty("/List/IS_EVAL_REQ_LIST_BY_ME", false);
			this.setViewProperty("/List/IS_EVAL_REQ_LIST_ALL", false);
			this.setViewProperty("/DISABLE_ORIENTATION", true);
			if ([mVariant.EVAL_REQ_FOR_ME, mVariant.EVAL_REQ_FOR_ME_OVERDUE].indexOf(sVariant) >= 0) {
				this.setViewProperty("/List/IS_EVAL_REQ_LIST_FOR_ME", true);
				this.setViewProperty("/List/IS_EVAL_REQ_LIST_BY_ME", false);
				this.setViewProperty("/List/IS_EVAL_REQ_LIST_ALL", false);
				this.setViewProperty("/List/SELECTION_MODE", "Single");
			} else if ([mVariant.EVAL_REQ_MY, mVariant.EVAL_REQ_MY_OVERDUE].indexOf(sVariant) >= 0) {
				this.setViewProperty("/List/IS_EVAL_REQ_LIST_BY_ME", true);
				this.setViewProperty("/List/IS_EVAL_REQ_LIST_FOR_ME", false);
				this.setViewProperty("/List/IS_EVAL_REQ_LIST_ALL", false);
				this.setViewProperty("/List/SELECTION_MODE", "MultiToggle");
			} else {
				this.setViewProperty("/List/IS_EVAL_REQ_LIST_BY_ME", false);
				this.setViewProperty("/List/IS_EVAL_REQ_LIST_FOR_ME", false);
				this.setViewProperty("/List/IS_EVAL_REQ_LIST_ALL", true);
				this.setViewProperty("/List/SELECTION_MODE", "Single");
			}
			this.setViewProperty("/List/MANAGE", !this.getViewProperty("/List/IS_EVAL_REQ_LIST_ALL") && !oVariant.MANAGE || (oVariant.MANAGE &&
				Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access")));
		},

		setVariantVisibility: function() {
			var aVariants = this.getModel("list").getProperty("/Variants/Values");

			for (var i = 0; i < aVariants.length; i += 1) {
				var oVariant = aVariants[i];
				var bIsManage = oVariant.MANAGE || false;
				var bIsExpert = oVariant.EXPERT || false;
				var bIsCampaignManage = oVariant.CAMPAIGN_MANAGE || false;

				var bVisible =  Configuration.getSystemSetting("sap.ino.config.EVAL_REQ_ACTIVE") === "1" &&
					(!bIsManage && !bIsExpert && !bIsCampaignManage) ||
					// user has expert role and variant is for experts
					(bIsExpert && Configuration.hasCurrentUserPrivilege("sap.ino.ui::expert")) ||
					// user has campaign manager role and variant is for campaign manager
					(bIsCampaignManage && Configuration.hasCurrentUserPrivilege("sap.ino.ui::campaign_manager")) ||
					// user has general backoffice privileges and variant has manage flag
					(bIsManage && Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access"));
				this.getModel("list").setProperty("/Variants/Values/" + i + "/VISIBLE", bVisible);
			}
		}

	}));

	oList.list = mList;
	oList.routes = mRoutes;

	return oList;
});