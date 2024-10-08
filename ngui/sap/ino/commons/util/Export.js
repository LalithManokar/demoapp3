/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/odata/ODataModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/PropertyBinding",
    "sap/ui/model/CompositeBinding",
    "sap/ui/model/type/Date",
    "sap/ui/model/type/DateTime",
    "sap/ui/model/type/Time",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/Link",
    "sap/m/Text",
    "sap/m/Label",
    "sap/m/List",
    "sap/m/Table",
    "sap/ui/table/Table",
    "sap/ui/core/Icon",
    "sap/ui/core/BusyIndicator",
    "sap/ino/commons/application/Configuration",
    "sap/ino/commons/util/ExportPPT",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/HBox"
], function(DateFormat, ODataModel, ODataModelV2, PropertyBinding, CompositeBinding, DateType, DateTimeType, TimeType, MessageBox,
	MessageToast, Link, Text, Label, List, Table, UITable, Icon, BusyIndicator, Configuration, ExportPPT, Filter, FilterOperator, HBox) {
	"use strict";

	var FORMAT_CSV = "csv";
	var FORMAT_XLS = "xls";
	var FORMAT_TXT = "txt";
	var FORMAT_XML = "xml";
	var FORMAT_PPTX = "pptx";

	var CHARSET_UTF8 = "utf-8";

	var MIME_TYPE_CSV = "text/csv";
	var MIME_TYPE_XLS = "application/vnd.ms-excel";
	var MIME_TYPE_PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

	var RECORD_CONFIRM_THRESHOLD = 9999;
	var RECORD_MAX_THRESHOLD_CSV = 2500;
	var RECORD_MAX_THRESHOLD_XLS = 1000;
	var RECORD_MAX_THRESHOLD_PPTX = 50;

	var DEFAULT_PREFIX = "Export";
	var CSV_SEP = ";";

	function hasCustomKey(oControl, sKey) {
		var aData = oControl.getAggregation("customData");
		if (aData) {
			for (var i = 0; i < aData.length; i++) {
				if (aData[i].getKey() === sKey) {
					return true;
				}
			}
		}
		return false;
	}

	function isExportable(oControl) {
		return !hasCustomKey(oControl, "exportIgnore");
	}

	function isExportColumn(oColumn) {
		return hasCustomKey(oColumn, "is_export");
	}

	return {

		_oBrowser: sap.ui.Device.browser,

		_getBinding: function(oControl) {
			if (oControl instanceof List) {
				return oControl.getBinding("items");
			} else if (oControl instanceof Table || oControl instanceof UITable) {
				return oControl.getBinding("rows");
			}
			return null;
		},

		_getModel: function(oControl) {
			if (oControl instanceof List) {
				return oControl.getModel("data");
			} else if (oControl instanceof Table) {
				return oControl.getModel("data");
			} else if (oControl instanceof UITable) {
				return oControl.getModel() || oControl.getModel("data");
			}
			return null;
		},

		_getSelect: function(oControl) {
			var oBinding = this._getBinding(oControl);
			if (oControl instanceof List) {
				return undefined;
			} else if (oControl instanceof Table) {
				return undefined;
			} else if (oControl instanceof UITable) {
				if (!oBinding.aAnalyticalInfo) { //for non-smarttable
					return oControl.getSelectedIndices();
				}
				return oBinding.aAnalyticalInfo && oBinding.aAnalyticalInfo.filter(function(oAnalyticalInfo) {
					return oAnalyticalInfo.visible;
				}).map(function(oAnalyticalInfo) {
					return oAnalyticalInfo.name;
				});
			}
			return undefined;
		},

		_getControls: function(oControl) {
			var mControl = {};

			function addControl(sLabel, oControl, sId) {
				if (oControl && (oControl instanceof Link || oControl instanceof Text || oControl instanceof HBox)) {
					if (sLabel) {
						sLabel = sLabel.trim();
						if (sLabel.indexOf(":", sLabel.length - 1) !== -1) {
							sLabel = sLabel.substring(0, sLabel.length - 1);
						}
						sId = sId || sLabel;
						if (!mControl[sId]) {
							mControl[sId] = {
								"label": sLabel,
								"ctrl": oControl
							};
							return true;
						}
					}
				}
				return false;
			}

			if (oControl instanceof List) {
				if (oControl.getItems().length > 0) {
					var oFirstItem = oControl.getItems()[0];
					var aContentItem = oFirstItem.findAggregatedObjects(true);
					var sLabel = "",
						sId = "";
					jQuery.each(aContentItem, function(iIndex, oContentItem) {
						if (!isExportable(oContentItem)) {
							return;
						}
						if (oContentItem instanceof Label && oContentItem.getText()) {
							sLabel = oContentItem.getText();
							sId = oContentItem.sId;
							if (oContentItem.getLabelFor()) {
								var oContentItemRef = sap.ui.getCore().byId(oContentItem.getLabelFor());
								addControl(sLabel, oContentItemRef, sId);
							}
						}
						if (!sLabel && oContentItem.getTooltip()) {
							sLabel = oContentItem.getTooltip();
						}
						if (oContentItem.data("exportLabel")) {
							sLabel = oContentItem.data("exportLabel");
						}
						if (addControl(sLabel, oContentItem)) {
							sLabel = "";
						}
						sId = "";
					});
				}
			} else if (oControl instanceof Table || oControl instanceof UITable) {
				var aColumn = oControl.getColumns();
				jQuery.each(aColumn, function(index, oColumn) {
					if (isExportable(oColumn) && (oColumn.getVisible() || isExportColumn(oColumn) || oControl.data("bExportAllColumns"))) {
						var sLabel = "",
							sId;
						var oLabel = oColumn.getLabel();
						if (oLabel) {
							sLabel = oLabel.getText();
							sId = oLabel.sId;
						}
						var oContentItem = oColumn.getTemplate();
						if (addControl(sLabel, oContentItem, sId)) {
							sLabel = "";
							sId = "";
						}
					}
				});
			}
			return mControl;
		},

		_readContent: function(oSourceControl, sFormat, iLimit) {
			var that = this;

			var oExportData = {
				headers: [],
				rows: []
			};

			var mControl = this._getControls(oSourceControl);
			jQuery.each(mControl, function(sId, oControl) {
				oExportData.headers.push(oControl.label);
			});
			if (oExportData.headers.length === 0) {
				MessageToast.show(that._getText("GENERAL_EXPORT_TIT_EXPORT_NO_DATA"));
				return jQuery.Deferred().reject();
			}

			var oURLParameters = {
				"$inlinecount": "allpages",
				"$format": "json"
			};
			if (oSourceControl && oSourceControl.getModel() && oSourceControl.getModel().getHeaders() && oSourceControl.getModel().getHeaders().Accept &&
				oSourceControl.getModel().getHeaders().Accept.indexOf("xml") > -1) {
				oURLParameters["$format"] = "xml";
			}
			var oSelectFilter;
			if (iLimit > 0) {
				oURLParameters.$top = iLimit;
			}
			var aSelect = this._getSelect(oSourceControl);
			if (aSelect) {
				//define a function to check if it is a number array
				var isNumArray = function(array) {
					var bIsNum = true;

					jQuery.each(array, function(iIndex, oIndex) {
						if (isNaN(oIndex)) {
							bIsNum = false;
							return false;
						}
					});

					return bIsNum;
				};
				if (isNumArray(aSelect)) {
					//If the array is a number type, it is a Rewards List, get the REWARD_LIST_ID of the select rows
					var aFilter = [];
					var aRewardListId = [];
					var bGamification = oSourceControl.getId().indexOf('gamificationReportTable') > -1 ? true : false;
					var bGamificationDetail = oSourceControl.getId().indexOf('gamificationReportTableDetail') > -1 ? true : false;
					jQuery.each(aSelect, function(iIndex, iSelect) {
						var iId = oSourceControl.getContextByIndex(iSelect).getProperty("REWARD_LIST_ID");
						if (!bGamification) {
							if (aRewardListId.indexOf(iId) === -1) {
								aRewardListId.push(iId);
								aFilter.push(new Filter("REWARD_LIST_ID", FilterOperator.EQ, parseInt(iId, 10)));
							}
						} else {
							///For gamification Parts
							if (bGamificationDetail) {
								var iActivityId = oSourceControl.getContextByIndex(iSelect).getProperty("ACTIVITY_ID");
								aFilter.push(new Filter("ACTIVITY_ID", FilterOperator.EQ, iActivityId));
							} else {
								var iDimensionId = oSourceControl.getContextByIndex(iSelect).getProperty("DIMENSION_ID");
								var iIdentityId = oSourceControl.getContextByIndex(iSelect).getProperty("IDENTITY_ID");
								aFilter.push(new Filter([new Filter("DIMENSION_ID", FilterOperator.EQ, iDimensionId),
						                          new Filter("IDENTITY_ID", FilterOperator.EQ, iIdentityId)], true));
							}
						}
					});
					oSelectFilter = new Filter(aFilter, false);
				} else {
					oURLParameters.$select = aSelect.join(",");
				}
			}

			var oBinding = this._getBinding(oSourceControl);
			if (oBinding && oBinding.aSorter) {
				for (var indexSorter = 0; indexSorter < oBinding.aSorter.length; indexSorter++) {
					if (aSelect.indexOf(oBinding.aSorter[indexSorter].sPath) < 0) {
						if (oURLParameters.$select && oURLParameters.$select.length > 0) {
							oURLParameters.$select += "," + oBinding.aSorter[indexSorter].sPath;
						} else {
							oURLParameters.$select = oBinding.aSorter[indexSorter].sPath;
						}
						//aSelect.push(oBinding.aSorter[indexSorter].sPath);
					}
				}
			}

			var sPath = oBinding.getPath();
			var oDeferred = jQuery.Deferred();
			this._getModel(oSourceControl).read(sPath, {
				filters: oBinding.aFilters.concat(oBinding.aApplicationFilters, oBinding.aFilter || [], oBinding.aApplicationFilter || [],
					oSelectFilter || []),
				sorters: oBinding.aSorters.concat(oBinding.aSorter || []),
				urlParameters: oURLParameters,
				success: function(oData) {
					var aResult = oData.results;
					if (sFormat === FORMAT_PPTX) {
						oDeferred.resolve(aResult);
					} else {
						for (var i = 0; i < aResult.length; i++) {
							var oRow = {
								cells: []
							};
							/* to keep the download count data consistent between exporting files and database*/
							if (aResult[i].hasOwnProperty("DOWNLOAD_COUNT")) {
								aResult[i].DOWNLOAD_COUNT += 1;
							}
							jQuery.each(mControl, function(sHeader, oControl) {
								var oCell = {
									header: oControl.label
								};
								var oEntry = aResult[i];
								var oCtr = oControl.ctrl;
								var sType = "String";
								var sContent = "";
								var oContentRaw, oResult, sHref;

								if (oCtr instanceof HBox && oCtr.getItems().length > 0) {
									var aItems = oCtr.getItems();
									var oContentObject = {content:"",contentRaw:""};
									for (var j = 0; j < aItems.length; j++) {
									oContentObject = that.getHBoxContent(aItems[j],sType,oEntry,oContentObject);
									}
									sContent = oContentObject.content;
									oContentRaw = oContentObject.contentRaw;									

								} else {
									var oBindingInfo = oCtr.getBindingInfo("href");
									if (oBindingInfo) {
										sType = "Href";
										var oBindingInfoHref = oCtr.getBindingInfo("href");
										oBindingInfo = null;
									}
									if (!oBindingInfo) {
										oBindingInfo = oCtr.getBindingInfo("text");
									}
									if (!oBindingInfo) {
										oBindingInfo = oCtr.getBindingInfo("value");
									}
									if (!oBindingInfo) {
										oBindingInfo = oCtr.getBindingInfo("checked");
										if (oBindingInfo) {
											sType = "Boolean";
										}
									}
									if (!oBindingInfo) {
										oBindingInfo = oCtr.getBindingInfo("tooltip");
									}

									if (oBindingInfo) {
										if (oBindingInfo.binding) {
											oResult = that._getDataForBinding(oCtr, oEntry, oBindingInfo.binding);
											if (oResult.type) {
												sType = oResult.type;
											}
											sContent = oResult.content;
											oContentRaw = oResult.contentRaw;
										} else if (oBindingInfo.parts) {
											oResult = that._getDataForParts(oCtr, oEntry, oBindingInfo);
											if (oResult.type) {
												sType = oResult.type;
											}
											sContent = oResult.content;
											oContentRaw = oResult.contentRaw;
										}
									}
									if (oBindingInfoHref) {
										if (oBindingInfoHref.binding) {
											oResult = that._getDataForBinding(oCtr, oEntry, oBindingInfoHref.binding);
										} else if (oBindingInfoHref.parts) {
											oResult = that._getDataForParts(oCtr, oEntry, oBindingInfoHref);
										}
										sType = "Href";
										sHref = Configuration.getFullApplicationPath("sap.ino.config.URL_PATH_UI_FRONTOFFICE") + "/" + oResult.content;
									}
								}

								if (sContent === null || sContent === undefined) {
									sContent = "";
								}
								if (typeof sContent === "boolean") {
									sType = "Boolean";
								} else if (typeof sContent === "number") {
									if (parseInt(sContent, 10) === sContent) {
										sType = "Integer";
									} else {
										sType = "Number";
									}
								} else if(jQuery.type(sContent) === "date"){
								    sType = "String";
								    sContent = sContent.toLocaleString();
								}
								
								if (sContent && typeof sContent === "string") {
									sContent = sContent.replace(/(\r\n|\n|\r)/gm, " ");
									sContent = sContent.replace('"', '\"');
								}
								oCell.content = sContent;
								oCell.contentRaw = oContentRaw;
								if (sHref) {
									oCell.href = sHref;
								}
								oCell.type = sType;
								oRow.cells.push(oCell);
							});
							oExportData.rows.push(oRow);
						}
						oDeferred.resolve(oExportData);
					}
				},
				error: function() {
					oDeferred.resolve(oExportData);
				}
			});
			return oDeferred.promise();
		},
		getHBoxContent: function(oCtr, sType, oEntry,oTextValue) {
		    var that = this;
			var oResult;
			var oBindingInfo;
			if (!oBindingInfo) {
				oBindingInfo = oCtr.getBindingInfo("text");
			}
			if (!oBindingInfo) {
				oBindingInfo = oCtr.getBindingInfo("value");
			}
			if (!oBindingInfo) {
				oBindingInfo = oCtr.getBindingInfo("tooltip");
			}

			if (oBindingInfo) {
				if (oBindingInfo.binding) {
					oResult = that._getDataForBinding(oCtr, oEntry, oBindingInfo.binding);
					oTextValue.content = oResult.content ? oTextValue.content + oResult.content : oTextValue.content;
					oTextValue.contentRaw = oResult.contentRaw ? oTextValue.contentRaw + oResult.contentRaw : oTextValue.contentRaw;
				} else if (oBindingInfo.parts) {
					oResult = that._getDataForParts(oCtr, oEntry, oBindingInfo);
					oTextValue.content = oResult.content ? oTextValue.content + oResult.content : oTextValue.content;
					oTextValue.contentRaw = oResult.contentRaw ? oTextValue.contentRaw + oResult.contentRaw : oTextValue.contentRaw;
				}
			}

			return oTextValue;
		},
		_getDataForBinding: function(oControl, oData, oBinding) {
			var that = this;

			var sType, oResult;
			var aValue = [];

			if (oBinding instanceof CompositeBinding) {
				jQuery.each(oBinding.aBindings, function(iIndex, oSubBinding) {
					oResult = that._getDataForPropertyBinding(oControl, oData, oSubBinding);
					if (oResult.type) {
						sType = oResult.type;
					}
					aValue.push(oResult.value);
				});
			} else if (oBinding instanceof PropertyBinding) {
				oResult = that._getDataForPropertyBinding(oControl, oData, oBinding);
				if (oResult.type) {
					sType = oResult.type;
				}
				aValue.push(oResult.value);
			}

			if (oBinding.getType() instanceof DateType) {
				sType = "Date";
			} else if (oBinding.getType() instanceof TimeType) {
				sType = "Time";
			} else if (oBinding.getType() instanceof DateTimeType) {
				sType = "DateTime";
			}

			var sContent = "";
			var oContentRaw;

			if (!oControl.data("exportRaw")) {
				if (oBinding instanceof CompositeBinding) {
					if (oBinding && oBinding.getFormatter()) {
						sContent = oBinding.getFormatter().apply(oBinding, aValue);
					} else if (oBinding && oBinding.getType()) {
						sContent = oBinding.getType().formatValue(aValue, oBinding.sInternalType || "any");
					} else if (aValue.length > 1) {
						sContent = aValue.join(" ");
					} else if (aValue.length > 0) {
						sContent = aValue[0];
					}
				} else if (aValue.length > 0) {
					sContent = aValue[0];
				}
			}

			if (aValue.length > 0) {
				oContentRaw = aValue[0];
			}

			return {
				type: sType,
				content: sContent,
				contentRaw: oContentRaw
			};
		},

		_getDataForPropertyBinding: function(oControl, oData, oBinding) {
			var sType;
			var vValue = this._getDataForPath(oControl, oData, oBinding);

			if (oBinding.getType() instanceof DateType) {
				sType = "Date";
			} else if (oBinding.getType() instanceof TimeType) {
				sType = "Time";
			} else if (oBinding.getType() instanceof DateTimeType) {
				sType = "DateTime";
			}

			if (vValue instanceof Date) {
				sType = "Date";
			}

			return {
				type: sType,
				value: vValue
			};
		},

		_getDataForPath: function(oControl, oData, oBinding) {
			var vValue;

			if (oBinding.getModel()) {
				if (oBinding.getModel() === this.i18n) {
					vValue = this._getText(oBinding.getPath());
				} else {
					vValue = oData[oBinding.getPath()];
				}
			}

			if (!oControl.data("exportRaw")) {
				if (oBinding.getType()) {
					vValue = oBinding.getType().formatValue(vValue, oBinding.sInternalType || "any");
				}
				if (oBinding.getFormatter()) {
					vValue = oBinding.getFormatter().apply(oBinding, [vValue]);
				}
			}

			return vValue;
		},

		_getDataForParts: function(oControl, oData, oBinding) {
			var that = this;

			var sType;
			var aValue = [];

			if (oBinding.type) {
				if (oBinding.type instanceof DateType) {
					sType = "Date";
				} else if (oBinding.type instanceof TimeType) {
					sType = "Time";
				} else if (oBinding.type instanceof DateTimeType) {
					sType = "DateTime";
				}
			}
			jQuery.each(oBinding.parts, function(index, oBindingPart) {
				aValue.push(that._getDataForPart(oControl, oData, oBindingPart));
			});

			var sContent = "";
			var oContentRaw;

			if (!oControl.data("exportRaw")) {
				if (oBinding.formatter) {
					sContent = oBinding.formatter.apply(this, aValue);
				} else if (aValue.length > 1) {
					sContent = aValue.join(" ");
				} else if (aValue.length > 0) {
					sContent = aValue[0];
				}
			}

			if (aValue.length > 0) {
				oContentRaw = aValue[0];
			}

			return {
				type: sType,
				content: sContent,
				contentRaw: oContentRaw
			};
		},

		_getDataForPart: function(oControl, oData, oBinding) {
			var vValue = oData[oBinding.path];

			if (!oControl.data("exportRaw")) {
				if (oBinding.type) {
					vValue = oBinding.type.formatValue(vValue, "any");
				}
				if (oBinding.formatter) {
					vValue = oBinding.formatter.apply(oBinding, [vValue]);
				}
			}

			return vValue;
		},

		_convertToFormat: function(oExportData, sFormat, sFilename, sAuthor, sPrefix) {
			if (sFormat === FORMAT_PPTX) {
				ExportPPT.i18n = this.i18n;
				return ExportPPT.convertToFormatPPTX(oExportData);
			} else {
				var oDeferred = jQuery.Deferred();
				if (sFormat == FORMAT_CSV) {
					oDeferred.resolve(this._convertToFormatCSV(oExportData, sFilename, sAuthor, sPrefix));
				} else if (sFormat == FORMAT_XLS) {
					oDeferred.resolve(this._convertToFormatXLS(oExportData, sFilename, sAuthor, sPrefix));
				} else {
					oDeferred.resolve("");
				}
				return oDeferred.promise();
			}
		},

		_convertToFormatCSV: function(oExportData, sFilename, sAuthor, sPrefix) {
			var csv = ["\uFEFF"];

			for (var i = 0; i < oExportData.headers.length; i++) {
				var sHeader = oExportData.headers[i];
				csv.push('"' + sHeader + '"');
				csv.push(",");
			}

			csv.push("\n");

			for (i = 0; i < oExportData.rows.length; i++) {
				var oRow = oExportData.rows[i];
				for (var j = 0; j < oRow.cells.length; j++) {
					var oCell = oRow.cells[j];
					if (oCell.type === "Date" && oCell.contentRaw) {
						csv.push('"' + oCell.contentRaw.toLocaleDateString() + '"');
					} else {
						csv.push('"' + oCell.content + '"');
					}
					csv.push(",");
				}
				csv.push("\n");
			}

			return csv.join("");
		},

		_convertToFormatXLS: function(oExportData, sFilename, sAuthor, sPrefix) {
			var xls = "<?xml version=\"1.0\"?>" +
				"<Workbook xmlns=\"urn:schemas-microsoft-com:office:spreadsheet\" " +
				"xmlns:o=\"urn:schemas-microsoft-com:office:office\" " +
				"xmlns:x=\"urn:schemas-microsoft-com:office:excel\" " +
				"xmlns:ss=\"urn:schemas-microsoft-com:office:spreadsheet\" " +
				"xmlns:html=\"http://www.w3.org/TR/REC-html40\">" +
				"<DocumentProperties xmlns=\"urn:schemas-microsoft-com:office:office\">" +
				"<LastAuthor>" +
				jQuery.sap.encodeXML(sAuthor ? sAuthor : "Microsoft Office User") +
				"</LastAuthor>" +
				"<Created>" +
				new Date().toISOString() +
				"</Created>" +
				"<Version>14.0</Version>" +
				"</DocumentProperties>" +
				"<OfficeDocumentSettings xmlns=\"urn:schemas-microsoft-com:office:office\">" +
				"<AllowPNG/>" +
				"</OfficeDocumentSettings>" +
				"<ExcelWorkbook xmlns=\"urn:schemas-microsoft-com:office:excel\">" +
				"<WindowHeight>10300</WindowHeight>" +
				"<WindowWidth>25720</WindowWidth>" +
				"<WindowTopX>900</WindowTopX>" +
				"<WindowTopY>100</WindowTopY>" +
				"<ProtectStructure>False</ProtectStructure>" +
				"<ProtectWindows>False</ProtectWindows>" +
				"</ExcelWorkbook>" +
				"<Styles>" +
				"<Style ss:ID=\"Default\" ss:Name=\"Normal\">" +
				"<Alignment ss:Vertical=\"Bottom\"/>" +
				"<Borders/>" +
				"<Font ss:FontName=\"Calibri\" ss:Size=\"12\" ss:Color=\"#000000\"/>" +
				"<Interior/>" +
				"<NumberFormat/>" +
				"<Protection/>" +
				"</Style>" +
				"<Style ss:ID=\"s62\">" +
				"<Font ss:FontName=\"Calibri\" ss:Size=\"12\" ss:Color=\"#000000\" ss:Bold=\"1\"/>" +
				"</Style>" +
				"<Style ss:ID=\"s63\">" +
				"<NumberFormat ss:Format=\"Short Date\"/>" +
				"</Style>" +
				"<Style ss:ID=\"s64\">" +
				"<NumberFormat ss:Format=\"Fixed\"/>" +
				"</Style>" +
				"<Style ss:ID=\"s65\">" +
				"<NumberFormat ss:Format=\"0\"/>" +
				"</Style>" +
				"<Style ss:ID=\"s66\" ss:Name=\"Hyperlink\">" +
				"<Font ss:Color=\"#0563C1\" ss:Underline=\"Single\"/>" +
				"</Style>" +
				"</Styles>";

			xls += "<Worksheet ss:Name=\"" +
				jQuery.sap.encodeXML(sPrefix ? sPrefix : DEFAULT_PREFIX) + "\">" +
				"<Names>" +
				"<NamedRange ss:Name=\"_FilterDatabase\" ss:RefersTo=\"=Export!R1C1:R1C" + oExportData.headers.length + "\" ss:Hidden=\"1\"/>" +
				"</Names>" +
				"<Table ss:ExpandedColumnCount=\"" + oExportData.headers.length + "\" ss:ExpandedRowCount=\"" + (oExportData.rows.length + 1) + "\" " +
				"x:FullColumns=\"1\" x:FullRows=\"1\" ss:DefaultColumnWidth=\"150\" ss:DefaultRowHeight=\"15\">";

			xls += "<Row ss:AutoFitHeight=\"0\">";
			for (var i = 0; i < oExportData.headers.length; i++) {
				var sHeader = oExportData.headers[i];
				xls += "<Cell ss:StyleID=\"s62\"><Data ss:Type=\"String\">" + jQuery.sap.encodeXML(sHeader) +
					"</Data><NamedCell ss:Name=\"_FilterDatabase\"/></Cell>";
			}
			xls += "</Row>";

			for (i = 0; i < oExportData.rows.length; i++) {
				var oRow = oExportData.rows[i];
				xls += "<Row ss:AutoFitHeight=\"0\">";
				for (var j = 0; j < oRow.cells.length; j++) {
					var oCell = oRow.cells[j];
					var sType = "String";
					var sContent = oCell.content;
					var sStyle = "";
					if (oCell.type == "Date" && oCell.contentRaw) {
						sType = "DateTime";
						var oDate = new Date(oCell.contentRaw);
						sContent = oDate.toISOString();
						if (sContent[sContent.length - 1] == "Z") {
							sContent = sContent.substring(0, sContent.length - 1);
						}
						sStyle = " ss:StyleID=\"s63\"";
					} else if (oCell.type == "Number") {
						sType = "Number";
						sStyle = " ss:StyleID=\"s64\"";
					} else if (oCell.type == "Integer") {
						sType = "Number";
						sStyle = " ss:StyleID=\"s65\"";
					} else if (oCell.type == "Boolean") {
						sType = "Boolean";
						sContent = sContent ? 1 : 0;
					} else if (oCell.type == "Href") {
						sStyle = " ss:StyleID=\"s66\" ss:HRef=\"" + oCell.href + "\"";
					}
					if (sType === "String") {
						if (sContent.indexOf("=") === 0) {
							sContent = sContent.replace(/=/, " =");
						}
						sContent = jQuery.sap.encodeXML(sContent);
					}
					xls += "<Cell" + sStyle + "><Data ss:Type=\"" + sType + "\">" + sContent + "</Data></Cell>";
				}
				xls += "</Row>";
			}

			xls += "</Table>" +
				"<WorksheetOptions xmlns=\"urn:schemas-microsoft-com:office:excel\">" +
				"<PageSetup>" +
				"<Header x:Margin=\"0.3\"/>" +
				"<Footer x:Margin=\"0.3\"/>" +
				"<PageMargins x:Bottom=\"0.75\" x:Left=\"0.7\" x:Right=\"0.7\" x:Top=\"0.75\"/>" +
				"</PageSetup>" +
				"<Unsynced/>" +
				"<PageLayoutZoom>0</PageLayoutZoom>" +
				"<Selected/>" +
				"<FreezePanes/>" +
				"<FrozenNoSplit/>" +
				"<SplitHorizontal>1</SplitHorizontal>" +
				"<TopRowBottomPane>1</TopRowBottomPane>" +
				"<ActivePane>2</ActivePane>" +
				"<Panes>" +
				"<Pane><Number>3</Number></Pane>" +
				"<Pane><Number>2</Number><ActiveRow>1</ActiveRow></Pane>" +
				"</Panes>" +
				"<ProtectObjects>False</ProtectObjects>" +
				"<ProtectScenarios>False</ProtectScenarios>" +
				"</WorksheetOptions>" +
				"<AutoFilter xmlns=\"urn:schemas-microsoft-com:office:excel\" x:Range=\"R1C1:R1C" + oExportData.headers.length + "\"/>" +
				"</Worksheet>";
			xls += "</Workbook>";

			return xls;
		},

		_downloadContent: function(sExportData, sFilename, sMimeType, sCharset) {
			var downloadLink = jQuery("<a/>", {
				download: sFilename,
				style: {
					display: "none"
				}
			});
			jQuery("body").append(downloadLink);
			var sUrl;
			if (this._oBrowser.name === this._oBrowser.BROWSER.SAFARI) {
				if (sMimeType === MIME_TYPE_PPTX) {
					sUrl = window.URL.createObjectURL(sExportData);
				} else {
					sUrl = "data:" + sMimeType + ";" + sCharset + "," + encodeURIComponent(sExportData);
				}
				var oWindow = window.open(sUrl, "_blank");
				setTimeout(function() {
					oWindow.close();
				}, 250);
			} else if (this._oBrowser.name === this._oBrowser.BROWSER.INTERNET_EXPLORER) {
				jQuery(downloadLink).click(function() {
					window.navigator.msSaveOrOpenBlob(sExportData, sFilename);
				});
				downloadLink[0].click();
			} else {
				if (sMimeType === MIME_TYPE_PPTX) {
					sUrl = window.URL.createObjectURL(sExportData);
				} else {
					sUrl = "data:" + sMimeType;
					if (sCharset) {
						sUrl += ";charset=" + sCharset;
					}
					sUrl += "," + encodeURIComponent(sExportData);
				}

				jQuery(downloadLink).attr("href", sUrl);
				downloadLink[0].click();
			}
		},

		_saveContent: function(sExportData, sFilename, sMimeType, sCharset) {
			if (sMimeType === MIME_TYPE_CSV) {
				sFilename += "." + FORMAT_TXT;
			} else if (sMimeType === MIME_TYPE_XLS) {
				if (this._oBrowser.version < 11) {
					sFilename += "." + FORMAT_XML;
				}
			}

			var ifr = document.createElement("iframe");
			ifr.id = "if1";
			ifr.location = "about.blank";
			ifr.style.display = "none";
			document.getElementsByTagName("body")[0].appendChild(ifr);

			var innerDocument = document.getElementById("if1").contentWindow.document;
			innerDocument.open(sMimeType, "replace");
			if (sCharset) {
				innerDocument.charset = sCharset;
			}
			innerDocument.write(sExportData);
			innerDocument.close();
			if (sCharset) {
				document.charset = sCharset;
			}
			innerDocument.execCommand("SaveAs", false, sFilename);
			document.getElementsByTagName("body")[0].removeChild(ifr);
		},

		_showConfirmationPopup: function(fnOK, fnCancel, iCount) {
			MessageBox.confirm(this._getText("GENERAL_EXPORT_INS_EXPORT_CONFIRMATION", [iCount]), {
				title: this._getText("GENERAL_EXPORT_TIT_EXPORT_CONFIRMATION"),
				icon: MessageBox.Icon.NONE,
				onClose: function(bResult) {
					if (bResult == "OK") {
						fnOK();
					} else {
						fnCancel();
					}
				}
			});
		},

		_showConfirmationPopupMax: function(fnOK, fnCancel, iCount, iMax) {
			MessageBox.confirm(this._getText("GENERAL_EXPORT_INS_EXPORT_CONFIRMATION_MAX", [iCount, iMax]), {
				title: this._getText("GENERAL_EXPORT_TIT_EXPORT_CONFIRMATION"),
				icon: MessageBox.Icon.NONE,
				onClose: function(bResult) {
					if (bResult == "OK") {
						fnOK();
					} else {
						fnCancel();
					}
				}
			});
		},

		_showIEInstructionPopup: function(fnOK, fnCancel, sFormat) {
			if (sFormat === FORMAT_XLS && this._oBrowser.version >= 11) {
				fnOK();
				return;
			}
			var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			var vStorageKey = "sap.ino.commons.util.Export-IEInstructionPopupNotShowAgain-" + sFormat.toUpperCase();
			if (!oStorage.get(vStorageKey)) {
				MessageBox.confirm(this._getText("GENERAL_EXPORT_INS_EXPORT_IE_INSTRUCTION_DESCR_" + sFormat.toUpperCase()), {
					title: this._getText("GENERAL_EXPORT_INS_EXPORT_IE_INSTRUCTION_TITLE"),
					icon: MessageBox.Icon.NONE,
					onClose: function(bResult) {
						if (bResult == "OK") {
							oStorage.put(vStorageKey, true);
							fnOK();
						} else {
							fnCancel();
						}
					}
				});
			} else {
				fnOK();
			}
		},

		_getText: function() {
			if (this.i18n) {
				return this.i18n.getResourceBundle().getText.apply(this.i18n.getResourceBundle(), arguments);
			}
			return "";
		},

		exportEnabled: function(oControl) {
			if (this._getModel(oControl) instanceof ODataModel ||
				this._getModel(oControl) instanceof ODataModelV2) {
				return true;
			}
			return false;
		},

		/**
		 * Export all data for current control bindings as file
		 *
		 * @param oControl
		 *            list/table control containing the binding definitions and formatters
		 * @param sFormat
		 *            format of the exported file (CSV or XLS)
		 * @param sFilename
		 *            filename of the exported file
		 * @param fnComplete
		 *            called when the export was completed
		 * @param sAuthor
		 *            author of the exported file
		 * @param sPrefix
		 *            prefix for names, e.g. worksheet
		 * @param iLimit
		 *            number of records, if not defined or <= 0 all records are returned
		 * @returns boolean flag, if export was started
		 */
		exportContent: function(oControl, sFormat, sFilename, fnComplete, sAuthor, sPrefix, iLimit) {
			if (!this.exportEnabled(oControl)) {
				return false;
			}
			if (sFormat != FORMAT_CSV && sFormat != FORMAT_XLS && sFormat != FORMAT_PPTX) {
				return false;
			}
			var that = this;

			function fnProcess(iLimit) {
				sFilename = sFilename || DEFAULT_PREFIX + "." + sFormat;
				var sMimeType, sCharset = "";
				switch (sFormat) {
					case FORMAT_CSV:
						sMimeType = MIME_TYPE_CSV;
						sCharset = CHARSET_UTF8;
						break;
					case FORMAT_XLS:
						sMimeType = MIME_TYPE_XLS;
						break;
					case FORMAT_PPTX:
						sMimeType = MIME_TYPE_PPTX;
						break;
					default:
						break;
				}
				that._readContent(oControl, sFormat, iLimit).done(function(oExportData) {
					var oConvertPromise = that._convertToFormat(oExportData, sFormat, sFilename, sAuthor, sPrefix);
					oConvertPromise.done(function(oFileContent) {
						if (that._oBrowser.name !== that._oBrowser.BROWSER.INTERNET_EXPLORER || sMimeType === MIME_TYPE_PPTX) {
							that._downloadContent(oFileContent, sFilename, sMimeType, sCharset);
							fnComplete();
						} else {
							that._showIEInstructionPopup(function() {
								that._saveContent(oFileContent, sFilename, sMimeType, sCharset);
								fnComplete();
							}, function() {
								fnComplete();
							}, sFormat);
						}
					});
					oConvertPromise.fail(function() {
						fnComplete();
					});
				}).fail(function() {
					fnComplete();
				});
			}

			var oBinding = this._getBinding(oControl);

			if (sFormat === FORMAT_PPTX && oBinding.sPath.indexOf("/Idea") !== 0) {
				//PPTX Export is available for Ideas only!
				return false;
			}

			var iMax = 0;
			switch (sFormat) {
				case FORMAT_CSV:
					iMax = RECORD_MAX_THRESHOLD_CSV;
					break;
				case FORMAT_XLS:
					iMax = RECORD_MAX_THRESHOLD_XLS;
					break;
				case FORMAT_PPTX:
					iMax = RECORD_MAX_THRESHOLD_PPTX;
					break;
				default:
					break;
			}
			var iCount;
			if (oBinding.bLengthFinal || oBinding.iTotalSize) {
				iCount = oBinding.iLength || oBinding.iTotalSize || iMax;
			} else {
				// this happens when no inline count is requested and only parts
				// have actually been loaded -> we request everything
				iCount = iMax;
			}

			if (iLimit > 0) {
				iCount = iLimit < iCount ? iLimit : iCount;
			}

			if (iCount > iMax) {
				this._showConfirmationPopupMax(function() {
					fnProcess(iMax);
				}, fnComplete, iCount, iMax);
			} else if (iCount >= RECORD_CONFIRM_THRESHOLD) {
				this._showConfirmationPopup(function() {
					fnProcess(iLimit);
				}, fnComplete, iCount, sFormat);
			} else {
				fnProcess(iLimit);
			}
			return true;
		},

		/**
		 * Export all data for current control bindings as file
		 *
		 * @param oControl
		 *            list/table control containing the binding definitions and formatters
		 * @param sFormat
		 *            format of the exported file (CSV or XLS)
		 * @param sPrefix
		 *            prefix e.g. for creating filename including current date and time
		 * @param oExportButton
		 *            export button that is disabled and set to busy during export
		 * @param sAuthor
		 *            author of the exported file
		 * @param iLimit
		 *            number of records, if not defined or <= 0 all records are returned
		 * @param fnCompleted
		 *            called when the export is completed
		 */
		exportAdvanced: function(oControl, sFormat, sPrefix, oExportButton, sAuthor, iLimit, fnCompleted) {
			var that = this;
			BusyIndicator.show(0);
			if (oExportButton) {
				oExportButton.setEnabled(false);
			}
			sPrefix = sPrefix ? this._getText(sPrefix) : DEFAULT_PREFIX;
			sPrefix = sPrefix.replace(new RegExp("[^a-zA-Z0-9 .-]"), "_");
			var sFilename = sPrefix;
			var oDateFormat = DateFormat.getDateTimeInstance({
				pattern: "dd-MM-yyyy_HH-mm"
			});
			sFilename += "_" + oDateFormat.format(new Date());
			sFilename += "." + sFormat;
			setTimeout(function() {
				if (!that.exportContent(oControl, sFormat, sFilename, function() {
					if (oExportButton) {
						oExportButton.setEnabled(true);
					}
					BusyIndicator.hide();
					if (fnCompleted) {
						fnCompleted();
					}
				}, sAuthor, sPrefix, iLimit)) {
					if (oExportButton) {
						oExportButton.setEnabled(true);
					}
					BusyIndicator.hide();
					if (fnCompleted) {
						fnCompleted();
					}
				}
			}, 0);
		},

		/**
		 * Export all data for current control bindings as file
		 *
		 * @param oControl
		 *            list/table control containing the binding definitions and formatters
		 * @param sPrefix
		 *            prefix e.g. for creating filename including current date and time
		 * @param oExportButton
		 *            export button that is disabled and set to busy during export
		 * @param sAuthor
		 *            author of the exported file
		 * @param fnCompleted
		 *            called when the export is completed
		 */
		exportChartAdvanced: function(oControl, sPrefix, oExportButton, fnCompleted) {
			var that = this;
			BusyIndicator.show(0);
			if (oExportButton) {
				oExportButton.setEnabled(false);
			}
			var oDateFormat = DateFormat.getDateTimeInstance({
				pattern: "dd-MM-yyyy_HH-mm"
			});
			var sFilename = sPrefix;
			sFilename += "_" + oDateFormat.format(new Date());
			sFilename += ".svg";
			setTimeout(function() {
				var sContent = oControl.exportToSVGString();
				if (that._oBrowser.name != that._oBrowser.BROWSER.INTERNET_EXPLORER) {
					that._downloadContent(sContent, sFilename, "image/svg+xml", "");
				} else {
					that._saveContent(sContent, sFilename, "image/svg+xml", "");
				}
				if (oExportButton) {
					oExportButton.setEnabled(true);
				}
				BusyIndicator.hide();
				if (fnCompleted) {
					fnCompleted();
				}
			}, 0);
		},

		exportAdvancedIdea: function(sFormat, oParam, oExportButton, fnTxt) {
			this._generateContent(sFormat, oParam, oExportButton, this._autoDownloadContent, fnTxt);
		},

		_generateContent: function(sFormat, oParam, oExportButton, fnCompleted, fnTxt) {
			var that = this;
			BusyIndicator.show(0);
			if (oExportButton) {
				oExportButton.setEnabled(false);
			}
			jQuery.ajax({
				url: Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/export_idea.xsjs",
				data: oParam
			}).always(function() {
				if (oExportButton) {
					oExportButton.setEnabled(true);
				}
				BusyIndicator.hide();
			}).done(function(res) {
				MessageToast.show(fnTxt(res.messageKey));
				//res.url = "http://ld8580.wdf.sap.corp:8008/sap/ino/xs/rest/common/attachment_download.xsjs/134115";
				fnCompleted.call(that, res.downloadUrl);
			}).fail(function(res) {
				MessageToast.show(fnTxt(res.responseJSON.messageKey));
			});
		},
		_autoDownloadContent: function(sUrl) {
			if (!sUrl) {
				return;
			}
			if (!/^http(s)?/.test(sUrl)) {
				sUrl = window.location.protocol + "//" + sUrl;
			}
			var downloadLink = jQuery("<a/>", {
				style: {
					display: "none"
				}
			});
			jQuery("body").append(downloadLink);
			if (this._oBrowser.name === this._oBrowser.BROWSER.SAFARI) {
				var oWindow = window.open(sUrl, "_blank");
				setTimeout(function() {
					oWindow.close();
				}, 250);
			} else {
				jQuery(downloadLink).attr("href", sUrl);
				downloadLink[0].click();
			}
		}
	};
});