sap.ui.define(["sap/ino/commons/application/Configuration"],
	function(Configuration) {
		var CompanyViewFilterMixin = function() {
			throw "Mixin may not be instantiated directly";
		};

		function initDefaultCompanyViewCriterias() {
			this.setFilterItem("/CompanyViewCriterias", {
				CriteriaType: Configuration.getSysCompanyView(),
				CriteriaToken: '',
				CriteriaRole: '1',
				CriteriaEnable: Configuration.getSysCompanyEnable(),
				CriteriaLabel: Configuration.getSysCompanyLabel()
			});
		}

		function initCompanyViewCriteriaFromQueryString(oQuery) {
			var that = this;
			var oCompanyViewCriterias = {
				CriteriaType: Configuration.getSysCompanyView(),
				CriteriaToken: '',
				CriteriaRole: '1',
				CriteriaEnable: Configuration.getSysCompanyEnable(),
				CriteriaLabel: Configuration.getSysCompanyLabel()
			};

			if (oQuery.hasOwnProperty("cvt")) {
				oCompanyViewCriterias.CriteriaToken = decodeURIComponent(oQuery.cvt);
			}
			if (oQuery.hasOwnProperty("cvr")) {
				oCompanyViewCriterias.CriteriaRole = decodeURIComponent(oQuery.cvr);
			}
			that.setFilterItem("/CompanyViewCriterias", oCompanyViewCriterias);
		}

		CompanyViewFilterMixin.initCompanyView = function() {
			initDefaultCompanyViewCriterias.call(this);
			this.setFilterItem("/CompanyViewRoleList", [
				{
					KEY: "1",
					TEXT: this.getText("LIST_TIT_FILTER_ORGANIZATION_VIEW_ROLE_SUBMITTER")
			    }, {
					KEY: "2",
					TEXT: this.getText("LIST_TIT_FILTER_ORGANIZATION_VIEW_ROLE_VOTER")
			    }, {
					KEY: "3",
					TEXT: this.getText("LIST_TIT_FILTER_ORGANIZATION_VIEW_ROLE_COMMENTER")
			    }]);
		};

		CompanyViewFilterMixin.hasCompanyViewFilters = function() {
			var aCriterias = this.getFilterItem("/CompanyViewCriterias");
			if (!aCriterias) {
				return false;
			}
			return aCriterias.CriteriaToken;
		};

		CompanyViewFilterMixin.initCompanyViewItems = function(oQuery) {
			if (!oQuery || !oQuery.hasOwnProperty("cvt")) {
				initDefaultCompanyViewCriterias.call(this);
				return;
			}
			initCompanyViewCriteriaFromQueryString.call(this, oQuery);
		};

		CompanyViewFilterMixin.getCompanyViewQuery = function(oQuery) {
			var aCriterias = this.getFilterItem("/CompanyViewCriterias");
			if (!aCriterias) {
				return;
			}
			oQuery.cvt = decodeURIComponent(this.getFilterItem("/CompanyViewCriterias/CriteriaToken"));
			oQuery.cvr = this.getFilterItem("/CompanyViewCriterias/CriteriaRole");
			oQuery.cvy = this.getFilterItem("/CompanyViewCriterias/CriteriaType");
		};

		CompanyViewFilterMixin.getEmptyCompanyViewFilters = function() {
			return ",cvt='',cvr=1,cvy=1";
		};

		CompanyViewFilterMixin.setQueryObjectCompanyViewFilters = function(oParameter) {
			var aCriterias = this.getFilterItem("/CompanyViewCriterias");
			oParameter.cvt = '';
			oParameter.cvr = '1';
			oParameter.cvy = Configuration.getSysCompanyView();
			if (!aCriterias) {
				return;
			}
			
			oParameter.cvy = this.getFilterItem("/CompanyViewCriterias/CriteriaType");
			oParameter.cvr = this.getFilterItem("/CompanyViewCriterias/CriteriaRole");
			oParameter.cvt = encodeURIComponent(this.getFilterItem("/CompanyViewCriterias/CriteriaToken"));
		};

		CompanyViewFilterMixin.getCompanyViewFilters = function() {
			var aCriterias = this.getFilterItem("/CompanyViewCriterias");
			if (!aCriterias || !Configuration.getSysCompanyEnable()) {
				return this.getEmptyCompanyViewFilters();
			}
			return ",cvt='" + encodeURIComponent(this.getFilterItem("/CompanyViewCriterias/CriteriaToken")) + "',cvr=" + this.getFilterItem(
				"/CompanyViewCriterias/CriteriaRole") + ",cvy=" + this.getFilterItem("/CompanyViewCriterias/CriteriaType");
		};

		CompanyViewFilterMixin.setCompanyCriteriaToQuery = function(oQuery) {
			var aCriterias = this.getFilterItem("/CompanyViewCriterias");
			if (!aCriterias || !aCriterias.CriteriaToken) {
				return;
			}
			oQuery.cvy = Configuration.getSysCompanyView();
			oQuery.cvr = this.getFilterItem("/CompanyViewCriterias/CriteriaRole");
			oQuery.cvt = encodeURIComponent(this.getFilterItem("/CompanyViewCriterias/CriteriaToken"));
		};

		CompanyViewFilterMixin.resetCompanyCriterias = function() {
			initDefaultCompanyViewCriterias.call(this);
		};

		CompanyViewFilterMixin.onCompanyViewRoleChange = function(oEvent) {
			this.setFilterItem("/CompanyViewCriterias/CriteriaRole", oEvent.getParameter("selectedItem").getKey());
		};

		CompanyViewFilterMixin.onFilterCompanyViewChange = function(oEvent) {
			var oSource = oEvent.getParameter("selectedItem");
			if (oSource) {
				var sSelectedKey = oSource.getProperty("key");
				this.setFilterItem("/CompanyViewCriterias/CriteriaToken", sSelectedKey);
			}
		};

		CompanyViewFilterMixin.onCompanyViewSuggestion = function(oEvent) {
			var that = this;
			var oModel = that.getDefaultODataModel ? that.getDefaultODataModel() : that.getModel("data");
			var mEvent = jQuery.extend({}, oEvent, true);
			var sTerm = jQuery.sap.encodeURL(mEvent.getParameter("suggestValue"));
			var type = Configuration.getSysCompanyView(),
				sTypeName = type === "1" ? "COMPANY" : "ORGANIZATION";
			that.resetClientMessages();
			oModel.read("/SearchIdentityOrgCompanyParams(searchToken='" + sTerm + "')/Results", {
				urlParameters: {
					"$orderby": "SEARCH_SCORE",
					"$filter": "TYPENAME eq '" + type + "'"
				},
				success: function(oData) {
					var aSuggestion = [];
					if (oData.results) {
						oData.results.forEach(function(oItem) {
							aSuggestion.push({
								"DEFAULT_TEXT": oItem[sTypeName],
								"DISPLAY_LABEL": oItem.DISPLAYLABEL
							});
						});
					}
					that.setFilterItem("/companyViewSuggestion", aSuggestion);
					var oCampFilter = that.byId("companyViewFilterList") || that.getFilterElementById("companyViewFilterList");
					oCampFilter.setFilterSuggests(false);
				}
			});
		};

		CompanyViewFilterMixin.companyViewTitle = function(sValue) {
			if (!sValue) {
				return "";
			}
			return sValue === "1" ? this.getText("LIST_TIT_FILTER_COMPANY_VIEW_HEADER") : this.getText("LIST_TIT_FILTER_ORGANIZATION_VIEW_HEADER");
		};
		return CompanyViewFilterMixin;
	});