sap.ui.define([
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"],
	function(Filter, FilterOperator) {
		var CampaignFormFilterMixin = function() {
			throw "Mixin may not be instantiated directly";
		};

		CampaignFormFilterMixin.initCampaignFormItems = function() {
			var sIdeaFormId = this.getFilterItem("/CAMPAIGNFORM");
			if (!sIdeaFormId) {
				return;
			}
			var oModel = this.getDefaultODataModel ? this.getDefaultODataModel() : this.getModel("data");
			var that = this;
			var bIsManaged = this._check4ManagingList();

			oModel.read("/CampaignFormSuggestionParams(searchToken='',filterBackoffice=" + (bIsManaged ? 1 : 0) + ")/Results", {
				urlParameters: {
					"$orderby": "DEFAULT_TEXT",
					"$filter": "CODE eq '" + (sIdeaFormId || "") + "'"
				},
				success: function(oData) {
					that.setFilterItem("/campaignFormSuggestion", oData.results);
					var oCampaignFormFilter = that.byId("campaignFormFilterList") || that.getFilterElementById("campaignFormFilterList");
					oCampaignFormFilter.setFilterSuggests(false);
					if (oCampaignFormFilter.getSuggestionItems().length > 0) {
						oCampaignFormFilter.setSelectionItem(oCampaignFormFilter.getSuggestionItems()[0]);
					}
				}
			});
		};

		CampaignFormFilterMixin.onCampaignFormSuggestion = function(oEvent) {
			var that = this;
			var oModel = that.getDefaultODataModel ? that.getDefaultODataModel() : that.getModel("data");
			var mEvent = jQuery.extend({}, oEvent, true);
			var sTerm = jQuery.sap.encodeURL(mEvent.getParameter("suggestValue"));
			that.resetClientMessages();
			var bIsManaged = this._check4ManagingList();
			oModel.read("/CampaignFormSuggestionParams(searchToken='" + sTerm + "',filterBackoffice=" + (bIsManaged ? 1 : 0) + ")/Results", {
				urlParameters: {
					"$orderby": "DEFAULT_TEXT"
				},
				success: function(oData) {
					that.setFilterItem("/campaignFormSuggestion", oData.results);
					var oCampFilter = that.byId("campaignFormFilterList") || that.getFilterElementById("campaignFormFilterList");
					oCampFilter.setFilterSuggests(false);
				}
			});
		};

		CampaignFormFilterMixin.hasCampaignFormFilter = function() {
			return !!this.getFilterItem("/CAMPAIGNFORM");
		};

		CampaignFormFilterMixin.getCampaignFormFilter = function() {
			return new Filter({
				filters: [
                    new Filter("CAMPAIGN_FORM_CODE", FilterOperator.EQ, (this.getFilterItem("/CAMPAIGNFORM") || "")),
					new Filter("CAMPAIGN_ADMIN_FORM_CODE", FilterOperator.EQ, (this.getFilterItem("/CAMPAIGNFORM") || ""))],
				and: false
			});
		};

		CampaignFormFilterMixin.getCampaignFormQuery = function() {
			return this.getFilterItem("/CAMPAIGNFORM");
		};

		CampaignFormFilterMixin.restCampaignForm = function() {
			this.setCampaignForm("");
		};

		CampaignFormFilterMixin.setCampaignForm = function(sIdeaFormId) {
			this.setFilterItem("/CAMPAIGNFORM", sIdeaFormId);
		};

		CampaignFormFilterMixin.onHandleCampaignFormFilterHelp = function() {
			var that = this;
			var oModel = that.getDefaultODataModel ? that.getDefaultODataModel() : that.getModel("data");
			var bIsManaged = this._check4ManagingList();
			oModel.read("/CampaignFormSuggestionParams(searchToken='',filterBackoffice=" + (bIsManaged ? 1 : 0) + ")/Results", {
				urlParameters: {
					"$orderby": "DEFAULT_TEXT"
				},
				success: function(oData) {
					that.setFilterItem("/campaignFormSuggestion", oData.results);
					var oCampFilter = that.byId("campaignFormFilterList") || that.getFilterElementById("campaignFormFilterList");
					oCampFilter.setFilterSuggests(false);
					// create dialog
					var oCampaignFormListDialog = that.createCampaignFormListDialog();
					oCampaignFormListDialog.open();
				}
			});
		};

		CampaignFormFilterMixin.createCampaignFormListDialog = function() {
			if (!this._campaignFormDialog) {
				this._campaignFormDialog = this.createFragment("sap.ino.vc.idea.fragments.CampaignFormSuggestionSelectList", this.getView().getId());
				this.getView().addDependent(this._campaignFormDialog);
			}
			return this._campaignFormDialog;
		};

		CampaignFormFilterMixin.onCampaignFormDialogSearch = function(oEvent) {
			var sValue = jQuery.sap.encodeURL(oEvent.getParameter("value"));
			var oModel = this.getDefaultODataModel ? this.getDefaultODataModel() : this.getModel("data");
			var that = this;
			var bIsManaged = this._check4ManagingList();
			oModel.read("/CampaignFormSuggestionParams(searchToken='" + sValue + "',filterBackoffice=" + (bIsManaged ? 1 : 0) + ")/Results", {
				urlParameters: {
					"$orderby": "DEFAULT_TEXT"
				},
				success: function(oData) {
					that.setFilterItem("/campaignFormSuggestion", oData.results);
				}
			});
		};

		CampaignFormFilterMixin.onCampaignFormDialogItemsSelect = function(oEvent) {
			var sSelectedKey = oEvent.getParameter("selectedItem").data("CODE") + "";
			var oCampaignFormFilterList = this.byId("campaignFormFilterList") || this.getFilterElementById("campaignFormFilterList");
			var oCampaignFormFilterItems = oCampaignFormFilterList.getSuggestionItems();
			for (var i = 0; i < oCampaignFormFilterItems.length; i++) {
				if (oCampaignFormFilterItems[i].getProperty("key") === sSelectedKey) {
					oCampaignFormFilterList.setSelectionItem(oCampaignFormFilterItems[i]);
					break;
				}
			}
			this.setFilterItem("/CAMPAIGNFORM", sSelectedKey);
			this.clearIdeaFormFieldsCriterias();
			this.getIdeaFormFieldsCriterias();
		};

		CampaignFormFilterMixin.onFilterCampaignFormChange = function(oEvent) {
			var oSource = oEvent.getParameter("selectedItem");
			if (oSource) {
				var sSelectedKey = oSource.getProperty("key");
				this.setFilterItem("/CAMPAIGNFORM", sSelectedKey);

				this.clearIdeaFormFieldsCriterias();
				this.getIdeaFormFieldsCriterias();
			}
		};

		CampaignFormFilterMixin.onClearCampaignFormFilter = function(oEvent) {
			var sValue = oEvent.getParameter("value");
			if (sValue.trim() === "") {
				this.setFilterItem("/CAMPAIGNFORM", "");
			}
			this.clearIdeaFormFieldsCriterias();
		};

		CampaignFormFilterMixin.campaignFormFormatter = function(sValue, sPersonalize) {
			return !sValue && !!sPersonalize;
		};

		CampaignFormFilterMixin.campaignFormLabelFormatter = function(sValue, sPersonalize, sIdeaFormValue, aIdeaFormList) {
		    if(!sPersonalize){
		        return false;
		    }
		    if(!sValue){
		        return true;
		    }
			return aIdeaFormList && aIdeaFormList.length > 1;
		};

		return CampaignFormFilterMixin;
	});