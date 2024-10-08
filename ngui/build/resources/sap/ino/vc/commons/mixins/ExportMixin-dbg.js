sap.ui.define([
    //"sap/ino/commons/util/Export",
    "sap/ino/commons/application/Configuration",
    "sap/ui/core/format/DateFormat",
    "sap/m/MessageToast",
    "sap/ui/core/BusyIndicator",
    "sap/ino/vc/idea/mixins/IdeaFormCriteriaFilterMixin"
], function( /*Export, */ Configuration, DateFormat, MessageToast, BusyIndicator1) {
	"use strict";

	/**
	 * @class
	 * Mixin that provides export functionality
	 */
	var ExportMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	var CallExportService = function(sFormat, oExportControl) {
		//call a backend service to generate the XLS/CSV/PPTX file
		var that = this;
		var oParameter = this._getExportParam(sFormat, oExportControl);
		if (!oParameter) {
			BusyIndicator1.hide();
			return;
		}
		jQuery.ajax({
			url: Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/export_idea.xsjs",
			data: oParameter,
			beforeSend: function() {
				that.setBusy(true);
			},
			success: function(res, status, xhr) {
				that.setBusy(false);
				BusyIndicator1.hide();
				MessageToast.show(that.getText(res.messageKey));
			},
			error: function(res, status, xhr) {
				that.setBusy(false);
				BusyIndicator1.hide();
				MessageToast.show(that.getText(res.responseJSON.messageKey));
			}
		});
	};

	/*ExportMixin.onExportTopSheetShow = function(oEvent) {
	    if (!this._oExportTopSheet) {
	        this._oExportTopSheet = this.createFragment("sap.ino.vc.commons.fragments.ExportTopSheet", this.getView().getId());
	        this.getView().addDependent(this._oExportTopSheet);
	    }
	    if (oEvent.getSource().data("placement")) {
			this._oExportTopSheet.setPlacement(oEvent.getSource().data("placement"));
		}
		this._oExportTopSheet.triggerButton = oEvent.getSource();
		this._oExportTopSheet.openBy(oEvent.getSource());
	};*/

	ExportMixin.onListExport = function(oEvent) {
		if (!this._oExportActionSheet) {
			this._oExportActionSheet = this.createFragment("sap.ino.vc.commons.fragments.ExportActionSheet", this.getView().getId());
			this.getView().addDependent(this._oExportActionSheet);
		}
		if (oEvent.getSource().data("placement")) {
			this._oExportActionSheet.setPlacement(oEvent.getSource().data("placement"));
		}
		this._oExportActionSheet.triggerButton = oEvent.getSource();
		this._oExportActionSheet.openBy(oEvent.getSource());
	};

	ExportMixin.onListExportXLS = function(oEvent) {
		/*Export.i18n = this.getModel("i18n");
		var oExportControl = typeof this.getExportControl === "function" ? this.getExportControl() : this.getList();
		var fnCompleted = typeof this.fnCompleted === "function" ? this.fnCompleted : null;
        
		if (this._IsExportIdeaViaEmail()) {
			//call a backend service to generate the XLS file
			CallExportService.call(this, "xls", oExportControl);
		} else if (this._IsExportIdeaDirectly()) {
		    var oParameter = this._getExportParam("xls",oExportControl);
            if(!oParameter){
                return;
            }
            oParameter.ISNOTSENDEMAIL =  true;
			Export.exportAdvancedIdea("xls", oParameter, this._oExportActionSheet.triggerButton, this.getText.bind(this));
		} else if (fnCompleted) {
			Export.exportAdvanced(oExportControl, "xls", this.getExportPrefix && this.getExportPrefix(), this._oExportActionSheet.triggerButton,
				Configuration.getCurrentUser().NAME, null, fnCompleted(this));
		} else {
			Export.exportAdvanced(oExportControl, "xls", this.getExportPrefix && this.getExportPrefix(), this._oExportActionSheet.triggerButton,
				Configuration.getCurrentUser().NAME);
		}*/
		var that = this,
			oLimitCount = {
				xls: 2000
			};
		if (!that._checkExportCount("xls", oLimitCount)) {
			MessageToast.show(that.getText("EXPORT_XLS_LIMIT_COUNT_MSG", oLimitCount.xls));
			return;
		}
		BusyIndicator1.show(0);
		setTimeout(function() {
			sap.ui.require(["sap/ino/commons/util/Export"], function(Export) {
				Export.i18n = that.getModel("i18n");
				var oExportControl = typeof that.getExportControl === "function" ? that.getExportControl() : that.getList();
				var fnCompleted = typeof that.fnCompleted === "function" ? that.fnCompleted : null;

				if (that._IsExportIdeaViaEmail()) {
					//call a backend service to generate the XLS file
					CallExportService.call(that, "xls", oExportControl);
				} else if (that._IsExportIdeaDirectly()) {
					var oParameter = that._getExportParam("xls", oExportControl);
					if (!oParameter) {
						BusyIndicator1.hide();
						return;
					}
					oParameter.ISNOTSENDEMAIL = true;
					Export.exportAdvancedIdea("xls", oParameter, that._oExportActionSheet.triggerButton, that.getText.bind(that));
				} else if (fnCompleted) {
					Export.exportAdvanced(oExportControl, "xls", that.getExportPrefix && that.getExportPrefix(), that._oExportActionSheet.triggerButton,
						Configuration.getCurrentUser().NAME, null, fnCompleted(that));
				} else {
					Export.exportAdvanced(oExportControl, "xls", that.getExportPrefix && that.getExportPrefix(), that._oExportActionSheet.triggerButton,
						Configuration.getCurrentUser().NAME);
				}
			});
		});
	};

	ExportMixin.onListExportCSV = function(oEvent) {
		/*Export.i18n = this.getModel("i18n");
		var oExportControl = typeof this.getExportControl === "function" ? this.getExportControl() : this.getList();
		var fnCompleted = typeof this.fnCompleted === "function" ? this.fnCompleted : null;

		if (this._IsExportIdeaViaEmail()) {
			//call a backend service to generate the CSV file
			CallExportService.call(this, "csv", oExportControl);
		} else if (this._IsExportIdeaDirectly()) { 
		    var oParameter = this._getExportParam("csv",oExportControl);
            if(!oParameter){
                return;
            }
            oParameter.ISNOTSENDEMAIL =  true;
			Export.exportAdvancedIdea("csv", oParameter, this._oExportActionSheet.triggerButton, this.getText.bind(this));
		} else if (fnCompleted) {
			Export.exportAdvanced(oExportControl, "csv", this.getExportPrefix && this.getExportPrefix(), this._oExportActionSheet.triggerButton,
				Configuration.getCurrentUser().NAME, null, fnCompleted(this));
		} else {
			Export.exportAdvanced(oExportControl, "csv", this.getExportPrefix && this.getExportPrefix(), this._oExportActionSheet.triggerButton,
				Configuration.getCurrentUser().NAME);
		}*/
		var that = this,
			oLimitCount = {
				csv: 3000
			};
		if (!that._checkExportCount("csv", oLimitCount)) {
			MessageToast.show(that.getText("EXPORT_CSV_LIMIT_COUNT_MSG", oLimitCount.csv));
			return;
		}
		BusyIndicator1.show(0);
		setTimeout(function() {
			sap.ui.require(["sap/ino/commons/util/Export"], function(Export) {
				Export.i18n = that.getModel("i18n");
				var oExportControl = typeof that.getExportControl === "function" ? that.getExportControl() : that.getList();
				var fnCompleted = typeof that.fnCompleted === "function" ? that.fnCompleted : null;

				if (that._IsExportIdeaViaEmail()) {
					//call a backend service to generate the CSV file
					CallExportService.call(that, "csv", oExportControl);
				} else if (that._IsExportIdeaDirectly()) {
					var oParameter = that._getExportParam("csv", oExportControl);
					if (!oParameter) {
						BusyIndicator1.hide();
						return;
					}
					oParameter.ISNOTSENDEMAIL = true;
					Export.exportAdvancedIdea("csv", oParameter, that._oExportActionSheet.triggerButton, that.getText.bind(that));
				} else if (fnCompleted) {
					Export.exportAdvanced(oExportControl, "csv", that.getExportPrefix && that.getExportPrefix(), that._oExportActionSheet.triggerButton,
						Configuration.getCurrentUser().NAME, null, fnCompleted(that));
				} else {
					Export.exportAdvanced(oExportControl, "csv", that.getExportPrefix && that.getExportPrefix(), that._oExportActionSheet.triggerButton,
						Configuration.getCurrentUser().NAME);
				}
			});
		});
	};

	ExportMixin.onListExportPPT = function(oEvent) {
		/*Export.i18n = this.getModel("i18n");
		var oExportControl = typeof this.getExportControl === "function" ? this.getExportControl() : this.getList();
		var fnCompleted = typeof this.fnCompleted === "function" ? this.fnCompleted : null;

		if (this._IsExportIdeaViaEmail()) {
			//call a backend service to generate the PPT file
			CallExportService.call(this, "pptx", oExportControl);
		} else if (this._IsExportIdeaDirectly()) {
		    var oParameter = this._getExportParam("pptx",oExportControl);
            if(!oParameter){
                return;
            }
            oParameter.ISNOTSENDEMAIL =  true;
			Export.exportAdvancedIdea("pptx", oParameter, this._oExportActionSheet.triggerButton, this.getText.bind(this));
		} else if (fnCompleted) {
			Export.exportAdvanced(oExportControl, "pptx", this.getExportPrefix && this.getExportPrefix(), this._oExportActionSheet.triggerButton,
				Configuration.getCurrentUser().NAME, null, fnCompleted(this));
		} else {
			Export.exportAdvanced(oExportControl, "pptx", this.getExportPrefix && this.getExportPrefix(), this._oExportActionSheet.triggerButton,
				Configuration.getCurrentUser().NAME, 50);
		}*/

		// 		CallExportService.call(this, "pptx", oExportControl);
		// 		Export.exportAdvanced(oExportControl, "pptx", this.getExportPrefix && this.getExportPrefix(), this._oExportActionSheet.triggerButton,
		// 			Configuration.getCurrentUser().NAME, 50); 

		var that = this,
			oLimitCount = {
				pptx: 2000
			};
		if (!that._checkExportCount("pptx", oLimitCount)) {
			MessageToast.show(that.getText("EXPORT_PPTX_LIMIT_COUNT_MSG", oLimitCount.pptx));
			return;
		}
		BusyIndicator1.show(0);
		setTimeout(function() {
			sap.ui.require(["sap/ino/commons/util/Export"], function(Export) {
				Export.i18n = that.getModel("i18n");
				var oExportControl = typeof that.getExportControl === "function" ? that.getExportControl() : that.getList();
				var fnCompleted = typeof that.fnCompleted === "function" ? that.fnCompleted : null;

				if (that._IsExportIdeaViaEmail()) {
					//call a backend service to generate the PPT file
					CallExportService.call(that, "pptx", oExportControl);
				} else if (that._IsExportIdeaDirectly()) {
					var oParameter = that._getExportParam("pptx", oExportControl);
					if (!oParameter) {
						BusyIndicator1.hide();
						return;
					}
					oParameter.ISNOTSENDEMAIL = true;
					Export.exportAdvancedIdea("pptx", oParameter, that._oExportActionSheet.triggerButton, that.getText.bind(that));
				} else if (fnCompleted) {
					Export.exportAdvanced(oExportControl, "pptx", that.getExportPrefix && that.getExportPrefix(), that._oExportActionSheet.triggerButton,
						Configuration.getCurrentUser().NAME, null, fnCompleted(that));
				} else {
					Export.exportAdvanced(oExportControl, "pptx", that.getExportPrefix && that.getExportPrefix(), that._oExportActionSheet.triggerButton,
						Configuration.getCurrentUser().NAME, 50);
				}
			});
		});
	};

	ExportMixin._IsExportIdeaViaEmail = function() {
		return this.getExportPrefix && this.getExportPrefix() === this.getText("EXPORT_PREFIX_IDEA") && this.getViewProperty(
			"/List/EXPORT_IDEA_VIA_EMAIL");
	};

	ExportMixin._IsExportIdeaDirectly = function() {
		return this.getExportPrefix && this.getExportPrefix() === this.getText("EXPORT_PREFIX_IDEA");
	};

	ExportMixin._getExportParam = function(sFormat, oExportControl) {
		var oBindingParams = this.getBindingParameter();
		var bIsManaged = this._check4ManagingList();
		var sFilterParams = oExportControl.getBinding('items').sFilterParams;

		var oDateFormat = DateFormat.getDateTimeInstance({
			pattern: "dd-MM-yyyy_HH-mm"
		});
		var sFilename = this.getText("EXPORT_PREFIX_IDEA") + "_" + oDateFormat.format(new Date());
		var sIdeaformFilters = typeof this.getIdeaformFilters === "function" ? this.getIdeaformFilters().replace(/\'/g, "").replace(/\"/g, "").split(",") : undefined;
		var aCompanyViewFilters = typeof this.getCompanyViewFilters === "function" ? this.getCompanyViewFilters().replace(/\'/g, "").replace(/\"/g, "").split(",") : undefined;
		var aTags = this.getViewProperty("/List/TAGS");
		var tagGroup = {};
		var tagGroupKey = [];
		aTags.forEach(function(item, index) {
			if (!tagGroup[item.ROOTGROUPID]) {
				tagGroup[item.ROOTGROUPID] = [];
				tagGroup[item.ROOTGROUPID].push(item.ID);
				tagGroupKey.push(item.ROOTGROUPID);
			} else {
				tagGroup[item.ROOTGROUPID].push(item.ID);
			}
		});

		var oParameter = {
			searchToken: oBindingParams.SearchTerm || "",
			tagsToken: tagGroup[tagGroupKey[0]] ? tagGroup[tagGroupKey[0]].join(",") : "",
			tagsToken1: tagGroup[tagGroupKey[1]] ? tagGroup[tagGroupKey[1]].join(",") : "",
			tagsToken2: tagGroup[tagGroupKey[2]] ? tagGroup[tagGroupKey[2]].join(",") : "",
			tagsToken3: tagGroup[tagGroupKey[3]] ? tagGroup[tagGroupKey[3]].join(",") : "",
			tagsToken4: tagGroup[tagGroupKey[4]] ? tagGroup[tagGroupKey[4]].join(",") : "",
			filterName: oBindingParams.VariantFilter || "",
			filterBackoffice: bIsManaged ? "1" : "0",
			c1: sIdeaformFilters ? (sIdeaformFilters[1].slice(3) || "" ) : "",
			o1: sIdeaformFilters ? (sIdeaformFilters[2].slice(3) || -1 ) : -1,
			v1: sIdeaformFilters ? (decodeURIComponent(sIdeaformFilters[3].slice(3)) || "") : "",
			c2: sIdeaformFilters ? (sIdeaformFilters[4].slice(3) || "") : "",
			o2: sIdeaformFilters ? (sIdeaformFilters[5].slice(3) || -1 ) : "",
			v2: sIdeaformFilters ? (decodeURIComponent(sIdeaformFilters[6].slice(3)) || "") : "",
			c3: sIdeaformFilters ? (sIdeaformFilters[7].slice(3) || "" ) : "",
			o3: sIdeaformFilters ? (sIdeaformFilters[8].slice(3) || -1) : -1,
			v3: sIdeaformFilters ? (decodeURIComponent(sIdeaformFilters[9].slice(3)) || "") : "",
			cvy: aCompanyViewFilters ? (aCompanyViewFilters[3].slice(4) || 0 ) : 0,
			cvr: aCompanyViewFilters ? (aCompanyViewFilters[2].slice(4) || 0 ) : 0,
			cvt: aCompanyViewFilters ? (decodeURIComponent(aCompanyViewFilters[1].slice(4)) || "") : "",
			filterString: sFilterParams || "",
			fileName: sFilename,
			fileFormat: sFormat
		};
		if(!bIsManaged){
		var oGroupVariant = typeof this.getGroupViewParameters === "function" ? this.getGroupViewParameters(oBindingParams) : undefined;
		    oParameter.cvy = oGroupVariant ? oGroupVariant.groupType : 0;
		    oParameter.cvr = oGroupVariant ? oGroupVariant.groupRole : 0;
		    oParameter.cvt = oGroupVariant ? oGroupVariant.groupToken : "";		    
		} else {
            oParameter.searchType = typeof this.getSearchType === "function" ? this.getSearchType() : 0;		    
		}

		var sFilterContent = oParameter.filterString ? (/\$filter=(.*)/gm.exec(sFilterParams)[1]) : "";

		var aIdeasId = [];
		if (this.getViewProperty("/List/SELECT_ALL") || this.getViewProperty("/List/EXPORT_ALL")) {
			oParameter.ideasId = "";
			for (var p in this._oDeselectionMap) {
				if (this._oDeselectionMap.hasOwnProperty(p)) {
					sFilterContent += "%20and%20ID%20ne%20" + p;
				}
			}
			if (sFilterContent.indexOf("%20and%20") === 0) {
				sFilterContent = sFilterContent.slice(9);
			}
			oParameter.filterString = "$filter=(" + sFilterContent + ")";
		} else {
			jQuery.each(this._oSelectionMap, function(iIdx, oData) {
				aIdeasId.push(oData.ID);
			});
			// if this is no selected items then not do export
			if (aIdeasId.length === 0) {
				MessageToast.show(this.getText("MSG_EXPORT_IDEA_NO_SELECTED"));
				return undefined;
			}
			oParameter.ideasId = aIdeasId.join(",");
		}
		return oParameter;
	};

	ExportMixin.onChartExportSVG = function(oEvent) {
		/*Export.i18n = this.getModel("i18n");
		var oExportControl = typeof this.getExportChartControl === "function" ? this.getExportChartControl() : this.getChart();
		Export.exportChartAdvanced(oExportControl, this.getChartTitle && this.getChartTitle(), oEvent.getSource());*/

		var that = this;
		BusyIndicator1.show(0);
		setTimeout(function() {
			sap.ui.require(["sap/ino/commons/util/Export"], function(Export) {
				Export.i18n = that.getModel("i18n");
				var oExportControl = typeof that.getExportChartControl === "function" ? that.getExportChartControl() : that.getChart();
				Export.exportChartAdvanced(oExportControl, that.getChartTitle && that.getChartTitle(), oEvent.getSource());
			});
		});
	};

	ExportMixin._checkExportCount = function(sType, oLimitCount) {
		var that = this,
			oCountConfig = {
				"xls": 2000,
				"csv": 3000,
				"pptx": 2000
			};
		var viewName = that.getView().getProperty("viewName");
		if (viewName && viewName.indexOf("idea") <= 0) {
			return true;
		}
		var sCountConfig = Configuration.getSystemSetting("sap.ino.config.COUNT_LIMIT_EXPORT_IDEAS"),
			aCountConfig;
		if (sCountConfig) {
			aCountConfig = sCountConfig.split("|");
			oCountConfig.xls = Number(aCountConfig[0]);
			oCountConfig.csv = Number(aCountConfig[1]);
			oCountConfig.pptx = Number(aCountConfig[2]);
		}
		oLimitCount[sType] = oCountConfig[sType];
		var oExportControl = typeof that.getExportControl === "function" ? that.getExportControl() : that.getList();
		if (!oExportControl) {
			return true;
		}
		var oParameter = that._getExportParam(sType, oExportControl);
		if (!oParameter) {
			return true;
		}
		if (oParameter.ideasId && oParameter.ideasId.split(",").length <= oCountConfig[sType]) {
			return true;
		}
		if (!that.getView().getModel("view") || !that.getView().getModel("view").getProperty("/List/VARIANT")) {
			return true;
		}
		var filterName = that.getView().getModel("view").getProperty("/List/VARIANT");
		var oCount = Configuration.getIdeaFilterCountData();
		if (oCount && oCount[filterName] && oCount[filterName] > oCountConfig[sType]) {
			return false;
		}

		return true;
	};

	return ExportMixin;
});