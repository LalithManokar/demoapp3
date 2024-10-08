sap.ui.define(["sap/ino/commons/application/Configuration",
    "sap/ui/core/format/DateFormat",
    "sap/ino/commons/models/types/StringBooleanType"],
	function(Configuration, DateFormat, StringBooleanType) {
		var IdeaFormCriteriaFilterMixin = function() {
			throw "Mixin may not be instantiated directly";
		};
		var DateFormatter = DateFormat.getInstance({
			pattern: "YYYY-MM-dd"
		});
		var Operator = {
			empty: {
				TEXT: "",
				ACTION: -1
			},
			eq: {
				TEXT: "OPERATOR_MIT_EQ",
				ACTION: 0
			},
			ge: {
				TEXT: "OPERATOR_MIT_GE",
				ACTION: 1
			},
			le: {
				TEXT: "OPERATOR_MIT_LE",
				ACTION: 2
			},
			like: {
				TEXT: "OPERATOR_MIT_LIKE",
				ACTION: 3
			}
		};

		var DefaultControlTypes = {
			"BOOLEAN": 1,
			"INTEGER": 2,
			"NUMERIC": 2,
			"DATE": 4,
			"TEXT": 8,
			"RICHTEXT": 8,
			"VALUEOPTIONLIST": 16
		};
		var DefaultOperators = {
			"BOOLEAN": [Operator.eq],
			"INTEGER": [Operator.eq, Operator.ge, Operator.le],
			"NUMERIC": [Operator.eq, Operator.ge, Operator.le],
			"DATE": [Operator.eq, Operator.ge, Operator.le],
			"TEXT": [Operator.like],
			"RICHTEXT": [Operator.like]
		};

		function setOperatorType(sPath, sDataType, sValueOptionList) {
			var aOperators = [Operator.eq];
			if (!sDataType) {
				aOperators = [Operator.empty];
			} else if (!sValueOptionList) {
				aOperators = DefaultOperators[sDataType];
			}
			var defaultAction = this.getFilterItem(sPath + "/CriteriaOp");
			if (!this.getFilterItem(sPath + "/CriteriaOp")) {
				defaultAction = aOperators[0].ACTION;
			}
			this.setFilterItem(sPath + "/IdeaFormOperator", aOperators);
			this.setFilterItem(sPath + "/CriteriaOp", defaultAction);
		}

		function setControlType(sPath, sDataType, sValueOptionList) {
			var nValueDataType = -1;
			if (sValueOptionList) {
				sDataType = "VALUEOPTIONLIST";
			}
			if (sDataType) {
				nValueDataType = DefaultControlTypes[sDataType];
			}
			this.setFilterItem(sPath + "/CriteriaValueDataType", nValueDataType);
		}

		function getValueOptionListDefer(sValueOptionListCode) {
			var defer = new jQuery.Deferred();
			var oModel = this.getDefaultODataModel ? this.getDefaultODataModel() : this.getModel("data");
			var sPathPrefix = Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access") ? "/StagingValueOptions" : "/ValueOptions";
			oModel.read(sPathPrefix, {
				urlParameters: {
					"$orderby": "SEQUENCE_NO",
					"$filter": "LIST_CODE eq '" + sValueOptionListCode + "'"
				},
				success: function(oData) {
					var oResults = oData.results;
					oResults.unshift({
						CODE: "",
						DEFAULT_TEXT: ""
					});
					defer.resolve(oResults);
				}
			});
			return defer.promise();
		}

		function setValueOptionList(sPath, sValueOptionList) {
			var that = this;
			if (!sValueOptionList) {
				if (sPath) {
					this.setFilterItem(sPath + "/CriteriaValueList", []);
				}
				return;
			}
			getValueOptionListDefer.call(this, sValueOptionList).then(function(oResults) {
				that.setFilterItem(sPath + "/CriteriaValueList", oResults);
			});
		}

		function clearIdeaFormList() {
			var oResults = [];
			oResults.unshift({
				CODE: "",
				DATATYPE_CODE: "",
				DEFAULT_TEXT: ""
			});
			this.setFilterItem("/IdeaFormList", oResults);
		}

		function initDefualtIdeaFormCriterias() {
			this.setFilterItem("/IdeaFormCriterias", [{
				CriteriaID: 0,
				CriteriaCode: '',
				CriteriaOp: -1,
				CriteriaType: -1,
				CriteriaValue: undefined,
				CriteriaValueCode: undefined,
				IdeaFormOperator: [],
				CriteriaValueDataType: 0,
				CriteriaValueList: [],
				CriteriaTime: new Date().getTime()
		    }]);
		}

		function getIdeaFormFieldsCriteriaDefer() {
			var sIdeaFormId = this.getFilterItem("/CAMPAIGNFORM");
			var sCampId = this.getViewProperty("/List/CAMPAIGN");
			var defer = new jQuery.Deferred();
			if (!sIdeaFormId && !sCampId) {
				defer.resolve();
				return defer.promise();
			}
			var bIsManaged = Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access");
			var oModel = this.getDefaultODataModel ? this.getDefaultODataModel() : this.getModel("data");
			oModel.read("/IdeaFormFieldSuggestionParams(CampaignID=" + (sCampId || -1) + ",FormID='" + (sIdeaFormId || "") + "',filterBackoffice=" +
				(bIsManaged ? 1 : 0) + ")/Results", {
					success: function(oData) {
						var oResults = jQuery.extend(true, {}, oData).results;
						oResults.unshift({
							CODE: "",
							DATATYPE_CODE: "",
							DEFAULT_TEXT: ""
						});
						defer.resolve(oResults);
					}
				});
			return defer.promise();
		}

		function initIdeaFormCriteriaFromQueryString(oQuery) {
			var that = this;
			var aIdeaFormCriterias = [],
				aIdeaFormList = that.getFilterItem("/IdeaFormList");

			for (var index = 1; index <= 3; index++) {
				if (oQuery.hasOwnProperty("c" + index)) {
					aIdeaFormCriterias.push({
						CriteriaID: index - 1,
						CriteriaCode: oQuery["c" + index],
						CriteriaOp: oQuery["o" + index],
						CriteriaType: oQuery["t" + index],
						CriteriaValue: oQuery["v" + index],
						CriteriaValueCode: oQuery["vc" + index],
						IdeaFormOperator: [],
						CriteriaValueDataType: oQuery["vdt" + index],
						CriteriaValueList: [],
						CriteriaTime: new Date().getTime()
					});
				}
			}
			aIdeaFormCriterias[0].CriteriaValue = decodeURIComponent(aIdeaFormCriterias[0].CriteriaValue);
			that.setFilterItem("/IdeaFormCriterias", aIdeaFormCriterias);

			function initIdeaForm() {
				aIdeaFormList = that.getFilterItem("/IdeaFormList");
				for (var i = 0; i < aIdeaFormCriterias.length; i++) {
					for (var j = 0; j < aIdeaFormList.length; j++) {
						if (aIdeaFormList[j].CODE === aIdeaFormCriterias[i].CriteriaCode) {
							//change operator
							setOperatorType.call(that, "/IdeaFormCriterias/" + i, aIdeaFormList[j].DATATYPE_CODE, aIdeaFormList[j].VALUE_OPTION_LIST_CODE);
							//change the control type
							setControlType.call(that, "/IdeaFormCriterias/" + i, aIdeaFormList[j].DATATYPE_CODE, aIdeaFormList[j].VALUE_OPTION_LIST_CODE);
							//change value option list
							setValueOptionList.call(that, "/IdeaFormCriterias/" + i, aIdeaFormList[j].VALUE_OPTION_LIST_CODE);
						}
					}
				}
			}
			if (!aIdeaFormList) {
				getIdeaFormFieldsCriteriaDefer.call(that).then(function(oResults) {
					that.setFilterItem("/IdeaFormList", oResults);
					initIdeaForm();
				});
			} else {
				initIdeaForm();
			}
		}

		function getUtcDate(sValue) {
			var result = JSON.stringify(new Date(sValue + " 00:00:00"));
			return result.replace(/"/g, "");
		}

		function getCriteriaValue(index) {
			if (this.getFilterItem("/IdeaFormCriterias/" + index + "/CriteriaValueDataType") === 4 && !!this.getFilterItem("/IdeaFormCriterias/" +
				index + "/CriteriaValue")) {
				return getUtcDate.call(this, this.getFilterItem("/IdeaFormCriterias/" + index + "/CriteriaValue"));
			}
			return this.getFilterItem("/IdeaFormCriterias/" + index + "/CriteriaValue") || "";
		}

		IdeaFormCriteriaFilterMixin.hasIdeaformFilters = function() {
			var aCriterias = this.getFilterItem("/IdeaFormCriterias");
			if (!aCriterias || aCriterias.length <= 0) {
				return false;
			}
			return aCriterias[0].CriteriaCode;
		};

		IdeaFormCriteriaFilterMixin.initIdeaFormItems = function(oQuery) {
			if (!oQuery || !oQuery.hasOwnProperty("c1")) {
				initDefualtIdeaFormCriterias.call(this);
				return;
			}
			initIdeaFormCriteriaFromQueryString.call(this, oQuery);
		};

		IdeaFormCriteriaFilterMixin.getIdeaformQuery = function(oQuery) {
			var aCriterias = this.getFilterItem("/IdeaFormCriterias");
			if (!aCriterias || aCriterias.length <= 0) {
				return;
			}
			for (var index = 0; index < 3; index++) {
				if (index > aCriterias.length - 1 || !this.getFilterItem("/IdeaFormCriterias/" + index + "/CriteriaCode")) {
					continue;
				}
				oQuery["c" + (index + 1)] = this.getFilterItem("/IdeaFormCriterias/" + index + "/CriteriaCode");
				oQuery["o" + (index + 1)] = this.getFilterItem("/IdeaFormCriterias/" + index + "/CriteriaOp");
				oQuery["v" + (index + 1)] = getCriteriaValue.call(this, index);
			}
		};

		IdeaFormCriteriaFilterMixin.getEmptyIdeaformFilters = function() {
			return ",c1='',o1=-1,v1='',c2='',o2=-1,v2='',c3='',o3=-1,v3=''";
		};

		IdeaFormCriteriaFilterMixin.setQueryObjectIdeaformFilters = function(oParameter) {
			var aCriterias = this.getFilterItem("/IdeaFormCriterias");
			for (var index = 0; index < 3; index++) {
				oParameter["c" + (index + 1)] = '';
				oParameter["o" + (index + 1)] = -1;
				oParameter["v" + (index + 1)] = '';
			}
			if (!aCriterias || aCriterias.length <= 0) {
				return;
			}

			for (index = 0; index < 3; index++) {
				if (index > aCriterias.length - 1 || !this.getFilterItem("/IdeaFormCriterias/" + index + "/CriteriaCode")) {
					continue;
				}
				oParameter["c" + (index + 1)] = this.getFilterItem("/IdeaFormCriterias/" + index + "/CriteriaCode");
				oParameter["o" + (index + 1)] = this.getFilterItem("/IdeaFormCriterias/" + index + "/CriteriaOp");
				oParameter["v" + (index + 1)] = encodeURIComponent(getCriteriaValue.call(this, index));
			}
		};

		IdeaFormCriteriaFilterMixin.getIdeaformFilters = function() {
			var aCriterias = this.getFilterItem("/IdeaFormCriterias");
			if (!aCriterias || aCriterias.length <= 0) {
				return this.getEmptyIdeaformFilters();
			}
			var sResult = "";
			for (var index = 0; index < 3; index++) {
				if (index > aCriterias.length - 1 || !this.getFilterItem("/IdeaFormCriterias/" + index + "/CriteriaCode")) {
					sResult += ",c" + (index + 1) + "=''";
					sResult += ",o" + (index + 1) + "=-1";
					sResult += ",v" + (index + 1) + "=''";
					continue;
				}
				sResult += ",c" + (index + 1) + "='" + this.getFilterItem("/IdeaFormCriterias/" + index + "/CriteriaCode") + "'";
				sResult += ",o" + (index + 1) + "=" + this.getFilterItem("/IdeaFormCriterias/" + index + "/CriteriaOp");
				sResult += ",v" + (index + 1) + "='" + encodeURIComponent(getCriteriaValue.call(this, index)) + "'";
			}
			return sResult;
		};

		IdeaFormCriteriaFilterMixin.setIdeaformCriteriaToQuery = function(oQuery) {
			var aCriterias = this.getFilterItem("/IdeaFormCriterias");
			if (!aCriterias || aCriterias.length <= 0 || !aCriterias[0].CriteriaCode) {
				return;
			}
			for (var index = 0; index < aCriterias.length; index++) {
				oQuery["c" + (index + 1)] = this.getFilterItem("/IdeaFormCriterias/" + index + "/CriteriaCode");
				oQuery["o" + (index + 1)] = this.getFilterItem("/IdeaFormCriterias/" + index + "/CriteriaOp");
				oQuery["v" + (index + 1)] = encodeURIComponent(this.getFilterItem("/IdeaFormCriterias/" + index + "/CriteriaValue"));
				oQuery["vc" + (index + 1)] = this.getFilterItem("/IdeaFormCriterias/" + index + "/CriteriaValueCode");
				oQuery["vdt" + (index + 1)] = this.getFilterItem("/IdeaFormCriterias/" + index + "/CriteriaValueDataType");
			}
		};

		IdeaFormCriteriaFilterMixin.restIdeaFormFieldsCriterias = function() {
			clearIdeaFormList.call(this);
			initDefualtIdeaFormCriterias.call(this);
		};

		IdeaFormCriteriaFilterMixin.clearIdeaFormFieldsCriterias = function() {
			clearIdeaFormList.call(this);
			initDefualtIdeaFormCriterias.call(this);
		};

		IdeaFormCriteriaFilterMixin.getIdeaFormFieldsCriterias = function() {
			var that = this;
			getIdeaFormFieldsCriteriaDefer.call(that).then(function(oResults) {
				that.setFilterItem("/IdeaFormList", oResults);
			});
		};

		IdeaFormCriteriaFilterMixin.CriteriaCodeChange = function(oEvent) {
			var oSource = oEvent.getSource();
			var aCusData = oEvent.getParameter("selectedItem").getAggregation("customData");
			var sDataType = aCusData[0].getProperty("value");
			var sValueOptionList = aCusData[1].getProperty("value");
			var sPath = oSource.getBinding("selectedKey").getContext().sPath;
			//change operator
			setOperatorType.call(this, sPath, sDataType, sValueOptionList);
			//change the control type
			setControlType.call(this, sPath, sDataType, sValueOptionList);
			//change value option list
			setValueOptionList.call(this, sPath, sValueOptionList);
			this.setFilterItem(sPath + "/CriteriaValue", (sDataType === "BOOLEAN" ? "0" : ""));
			this.setFilterItem(sPath + "/CriteriaValueCode", "");
		};

		IdeaFormCriteriaFilterMixin.onAddCriteriaFilter = function() {
			var aIdeaFormCriterias = this.getFilterItem("/IdeaFormCriterias");
			aIdeaFormCriterias.push({
				CriteriaID: aIdeaFormCriterias.length,
				CriteriaCode: '',
				CriteriaOp: -1,
				CriteriaType: -1,
				CriteriaValue: undefined,
				CriteriaValueCode: undefined,
				IdeaFormOperator: [],
				CriteriaValueDataType: 0,
				CriteriaValueList: [],
				CriteriaTime: new Date().getTime()
			});
			this.setFilterItem("/IdeaFormCriterias", aIdeaFormCriterias);
			for (var index = 0; index < aIdeaFormCriterias.length; index++) {
				this.setFilterItem("/IdeaFormCriterias/" + index + "/CriteriaTime", new Date().getTime());
			}
		};

		IdeaFormCriteriaFilterMixin.onRemoveCriteriaFilter = function() {
			var aIdeaFormCriterias = this.getFilterItem("/IdeaFormCriterias");
			aIdeaFormCriterias.pop();
			this.setFilterItem("/IdeaFormCriterias", aIdeaFormCriterias);

			for (var index = 0; index < aIdeaFormCriterias.length; index++) {
				this.setFilterItem("/IdeaFormCriterias/" + index + "/CriteriaTime", new Date().getTime());
			}
		};

		IdeaFormCriteriaFilterMixin.onDataPickerCriteriaValueChange = function(oEvent) {
			var sPath = oEvent.getSource().getBindingInfo("value").binding.getContext().sPath;
			this.setFilterItem(sPath + "/CriteriaValue", DateFormatter.format(oEvent.getSource().getDateValue()));
		};

		IdeaFormCriteriaFilterMixin.onCriteriaValueCodeChange = function(oEvent) {
			var sPath = oEvent.getSource().getBindingInfo("selectedKey").binding.getContext().sPath;
			var sCriteriaValue = '',
				aValueOptionList = this.getFilterItem(sPath + "/CriteriaValueList"),
				DefaultValueOptionTypes = {
					"BOOLEAN": "BOOL_VALUE",
					"INTEGER": "NUM_VALUE",
					"NUMERIC": "NUM_VALUE",
					"TEXT": "TEXT_VALUE"
				};
			if (aValueOptionList) {
				for (var index = 0; index < aValueOptionList.length; index++) {
					if (aValueOptionList[index].CODE === this.getFilterItem(sPath + "/CriteriaValueCode") && DefaultValueOptionTypes.hasOwnProperty(
						aValueOptionList[index].DATATYPE_CODE)) {
						sCriteriaValue = aValueOptionList[index][DefaultValueOptionTypes[aValueOptionList[index].DATATYPE_CODE]];
						break;
					}
				}
			}
			this.setFilterItem(sPath + "/CriteriaValue", sCriteriaValue);
		};

		IdeaFormCriteriaFilterMixin.addCriteriaFilterFormatter = function(aCriterias, nCriteriaID, nCriteriaTime) {
			return aCriterias && aCriterias.length < 3 && aCriterias.length - 1 === nCriteriaID && nCriteriaTime > 0;
		};

		IdeaFormCriteriaFilterMixin.removeCriteriaFilterFormatter = function(aCriterias, nCriteriaID, nCriteriaTime) {
			return aCriterias && aCriterias.length > 1 && aCriterias.length - 1 === nCriteriaID && nCriteriaTime > 0;
		};

		IdeaFormCriteriaFilterMixin.campaignIdeaFormFormatter = function(sCampValue, sIdeaFormValue, aIdeaFormList,sPersonalize) {
		    if(!sPersonalize){
		        return false;
		    }
			if (!sCampValue && !sIdeaFormValue) {
				return false;
			}
			return aIdeaFormList && aIdeaFormList.length > 1;
		};

		return IdeaFormCriteriaFilterMixin;
	});