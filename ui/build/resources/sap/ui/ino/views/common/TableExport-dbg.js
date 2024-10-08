/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.views.common.TableExport");
jQuery.sap.require("sap.ui.ino.controls.MessageBox");
jQuery.sap.require("sap.ui.ino.controls.BusyIndicator");

(function() {
    "use strict";

    var FORMAT_CSV = "csv";
    var FORMAT_XLS = "xls";
    var FORMAT_TXT = "txt";
    var FORMAT_XML = "xml";
    var FORMAT_HTML = "html";

    var CHARSET_UTF8 = "utf-8";

    var MIME_TYPE_CSV = "text/csv";
    var MIME_TYPE_XLS = "application/vnd.ms-excel";

    var RECORD_CONFIRM_THRESHOLD = 9999;
    var RECORD_MAX_THRESHOLD_CSV = 2500;
    var RECORD_MAX_THRESHOLD_XLS = 1000;

    var DEFAULT_PREFIX = "Export";
    var CSV_SEP = ";";

    function isColumnExportable(oColumn) {
        if (!oColumn.getVisible()) {
            return false;
        }

        var aIgnore = jQuery.grep(oColumn.getCustomData(), function(oCustomData) {
            return oCustomData.getKey() === "ignoreExport" && oCustomData.getValue() === true;
        });
        return aIgnore.length === 0;
    }

    sap.ui.ino.views.common.TableExport = {

        _oBrowser : sap.ui.Device.browser,
        _i18n : sap.ui.getCore().getModel("i18n").getResourceBundle(),

        _readContent : function(oTable, iLimit) {
            var oExportData = {
                headers : [],
                rows : []
            };

            var sUrl = undefined;
            var oTableBinding = oTable.getBinding();
            var oContext = oTableBinding.getContext();

            var sParamSep = "?";

            if (oTableBinding.getDownloadUrl) {
                sUrl = oTableBinding.getDownloadUrl();
                sUrl = sUrl.substr(oTableBinding.getModel().sServiceUrl.length);
                sParamSep = "&";
            } else if (oContext) {
                sUrl =  oTableBinding.getContext().sPath + "/" + oTableBinding.sPath;
            } else {
                sUrl =  oTableBinding.sPath;
            }

            if (iLimit > 0) {
                sUrl = sUrl + sParamSep + "$top=" + iLimit;
                sParamSep = "&";
            }
            if (!oTableBinding.getDownloadUrl) {
                // if the complete download URL was not provided so far, put the parameters together
                if (oTableBinding.sSortParams) {
                    sUrl = sUrl + sParamSep + oTableBinding.sSortParams;
                    sParamSep = "&";
                }
                if (oTableBinding.sFilterParams) {
                    sUrl = sUrl + sParamSep + oTableBinding.sFilterParams;
                    sParamSep = "&";
                }
                if (oTableBinding.sCustomParams) {
                    sUrl = sUrl + sParamSep + oTableBinding.sCustomParams;
                    sParamSep = "&";
                }
            }
            sUrl = sUrl + sParamSep + "$inlinecount=allpages";
            sParamSep = "&";

            var aData = null;
            oTable.getModel().read(sUrl, null, null, false, function(oData) {
                aData = oData.results;
            });

            var aColumn = oTable.getColumns();

            jQuery.each(aColumn, function(index, oColumn) {
                if (isColumnExportable(oColumn)) {
                    var oLabel = oColumn.getLabel();
                    if (oLabel && oLabel.getText) {
                        oExportData.headers.push(oLabel.getText());
                    } else {
                        oExportData.headers.push("");
                    }
                }
            });

            var that = this;
            for (var i = 0; i < aData.length; i++) {
                var oRow = {
                    cells : []
                };
                var j = 0;
                jQuery.each(aColumn, function(index, oColumn) {
                    if (isColumnExportable(oColumn)) {
                        var oCell = {
                            header : oExportData.headers[j++]
                        };
                        var oData = aData[i];
                        
                        var sType = "String";
                        var oBindingInfo = oColumn.getTemplate().getBindingInfo("href");
                        if (!oBindingInfo) {
                            oBindingInfo = oColumn.getTemplate().getBindingInfo("text");
                        }
                        if (!oBindingInfo) {
                            oBindingInfo = oColumn.getTemplate().getBindingInfo("value");
                        }
                        if (!oBindingInfo) {
                            oBindingInfo = oColumn.getTemplate().getBindingInfo("checked");
                            if (oBindingInfo) {
                                sType = "Boolean";
                            }
                        }
                        if (!oBindingInfo) {
                            oBindingInfo = oColumn.getTemplate().getBindingInfo("tooltip");
                        }

                        var sContent = "";
                        var oContentRaw = null;
                        if (oBindingInfo) {
                            var aValue = [];
                            var aValueRaw = [];

                            if (oBindingInfo.type) {
                                if (oBindingInfo.type instanceof sap.ui.model.type.Date) {
                                    sType = "Date";
                                } else if (oBindingInfo.type instanceof sap.ui.model.type.Time) {
                                    sType = "Time";
                                } else if (oBindingInfo.type instanceof sap.ui.model.type.DateTime) {
                                    sType = "DateTime";
                                }
                            }

                            jQuery.each(oBindingInfo.parts, function(index, oBindingPart) {
                                aValue.push(that._getDataForPath(oData, oBindingPart.path, oBindingPart.type));
                                aValueRaw.push(that._getDataForPath(oData, oBindingPart.path));
                            });

                            if (oBindingInfo.formatter) {
                                sContent = oBindingInfo.formatter.apply(this, aValue);
                            } else if (aValue.length > 0) {
                                sContent = aValue[0];
                            }
                            if (sContent === null || sContent === undefined) {
                                sContent = "";
                            }
                            if (typeof sContent == "boolean") {
                                sType = "Boolean";
                            } else if (typeof sContent == "number") {
                                sType = "Number";
                            }
                            if (sContent && typeof sContent == "string") {
                                sContent = sContent.replace(/(\r\n|\n|\r)/gm, " ");
                                sContent = sContent.replace('"', '\"');
                            }

                            if (aValueRaw.length > 0) {
                                oContentRaw = aValueRaw[0];
                            }
                        }
                        oCell.content = sContent;
                        oCell.contentRaw = oContentRaw;
                        oCell.type = sType;
                        oRow.cells.push(oCell);
                    }
                });
                oExportData.rows.push(oRow);
            }
            return oExportData;
        },

        _getDataForPath : function(oData, sPath, oType) {
            var aSplit = sPath.split("/");
            for (var i = 0; i < aSplit.length; i++) {
                if (!oData) {
                    break;
                }
                var sSplit = aSplit[i];
                if (sSplit) {
                    oData = oData[sSplit];
                }
            }
            if (oType) {
                oData = oType.formatValue(oData, "any");
            }
            return oData;
        },

        _convertToFormat : function(oExportData, sFormat, sFilename, sAuthor, sPrefix) {
            if (sFormat == FORMAT_CSV) {
                return this._convertToFormatCSV(oExportData, sFilename, sAuthor, sPrefix);
            } else if (sFormat == FORMAT_XLS) {
                return this._convertToFormatXLS(oExportData, sFilename, sAuthor, sPrefix);
            }
            return "";
        },

        _convertToFormatCSV : function(oExportData, sFilename, sAuthor, sPrefix) {
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
					} else if(oCell.type === "String"){
						csv.push('"' + ((oCell.content || "").startsWith('=') ? (" " + (oCell.content || "")) : oCell.content )+ '"');
					} else {
						csv.push('"' + oCell.content + '"');
					}
                    csv.push(",");
                }
                csv.push("\n");
            }

            return csv.join("");
        },

        _convertToFormatXLS : function(oExportData, sFilename, sAuthor, sPrefix) {
            var xls = "<?xml version=\"1.0\"?>" + "<Workbook xmlns=\"urn:schemas-microsoft-com:office:spreadsheet\" " + "xmlns:o=\"urn:schemas-microsoft-com:office:office\" " + "xmlns:x=\"urn:schemas-microsoft-com:office:excel\" " + "xmlns:ss=\"urn:schemas-microsoft-com:office:spreadsheet\" " + "xmlns:html=\"http://www.w3.org/TR/REC-html40\">" + "<DocumentProperties xmlns=\"urn:schemas-microsoft-com:office:office\">" + "<LastAuthor>" + jQuery.sap.encodeXML(sAuthor ? sAuthor : "Microsoft Office User") + "</LastAuthor>" + "<Created>" + new Date().toISOString() + "</Created>" + "<Version>14.0</Version>" + "</DocumentProperties>" + "<OfficeDocumentSettings xmlns=\"urn:schemas-microsoft-com:office:office\">" + "<AllowPNG/>" + "</OfficeDocumentSettings>" + "<ExcelWorkbook xmlns=\"urn:schemas-microsoft-com:office:excel\">" + "<WindowHeight>10300</WindowHeight>" + "<WindowWidth>25720</WindowWidth>" + "<WindowTopX>900</WindowTopX>" + "<WindowTopY>100</WindowTopY>"
                    + "<ProtectStructure>False</ProtectStructure>" + "<ProtectWindows>False</ProtectWindows>" + "</ExcelWorkbook>" + "<Styles>" + "<Style ss:ID=\"Default\" ss:Name=\"Normal\">" + "<Alignment ss:Vertical=\"Bottom\"/>" + "<Borders/>" + "<Font ss:FontName=\"Calibri\" ss:Size=\"12\" ss:Color=\"#000000\"/>" + "<Interior/>" + "<NumberFormat/>" + "<Protection/>" + "</Style>" + "<Style ss:ID=\"s62\">" + "<Font ss:FontName=\"Calibri\" ss:Size=\"12\" ss:Color=\"#000000\" ss:Bold=\"1\"/>" + "</Style>" + "<Style ss:ID=\"s63\">" + "<NumberFormat ss:Format=\"Short Date\"/>" + "</Style>" + "<Style ss:ID=\"s64\">" + "<NumberFormat ss:Format=\"Fixed\"/>" + "</Style>" + "</Styles>";

            xls += "<Worksheet ss:Name=\"" + jQuery.sap.encodeXML(sPrefix ? sPrefix : DEFAULT_PREFIX) + "\">" + "<Names>" + "<NamedRange ss:Name=\"_FilterDatabase\" ss:RefersTo=\"=Export!R1C1:R1C" + oExportData.headers.length + "\" ss:Hidden=\"1\"/>" + "</Names>" + "<Table ss:ExpandedColumnCount=\"" + oExportData.headers.length + "\" ss:ExpandedRowCount=\"" + (oExportData.rows.length + 1) + "\" " + "x:FullColumns=\"1\" x:FullRows=\"1\" ss:DefaultColumnWidth=\"150\" ss:DefaultRowHeight=\"15\">";

            xls += "<Row ss:AutoFitHeight=\"0\">";
            for (var i = 0; i < oExportData.headers.length; i++) {
                var sHeader = oExportData.headers[i];
                xls += "<Cell ss:StyleID=\"s62\"><Data ss:Type=\"String\">" + jQuery.sap.encodeXML(sHeader) + "</Data><NamedCell ss:Name=\"_FilterDatabase\"/></Cell>";
            }
            xls += "</Row>";

            for (var i = 0; i < oExportData.rows.length; i++) {
                var oRow = oExportData.rows[i];
                xls += "<Row ss:AutoFitHeight=\"0\">";
                for (var j = 0; j < oRow.cells.length; j++) {
                    var oCell = oRow.cells[j];
                    var sType = "String";
                    var sContent = oCell.content;
                    var sStyle = "";
                    if (oCell.type == "Date" && oCell.contentRaw) {
                        sType = "DateTime";
                        sContent = oCell.contentRaw.toISOString();
                        if (sContent[sContent.length - 1] == "Z") {
                            sContent = sContent.substring(0, sContent.length - 1);
                        }
                        sStyle = " ss:StyleID=\"s63\"";
                    } else if (oCell.type == "Number") {
                        sType = "Number";
                        sStyle = " ss:StyleID=\"s64\"";
                    } else if (oCell.type == "Boolean") {
                        sType = "Boolean";
                        sContent = sContent ? 1 : 0;
                    }
                    if (sType === "String") {
                        sContent = jQuery.sap.encodeXML(sContent);
                    }
                    xls += "<Cell" + sStyle + "><Data ss:Type=\"" + sType + "\">" + sContent + "</Data></Cell>";
                }
                xls += "</Row>";
            }

            xls += "</Table>" + "<WorksheetOptions xmlns=\"urn:schemas-microsoft-com:office:excel\">" + "<PageSetup>" + "<Header x:Margin=\"0.3\"/>" + "<Footer x:Margin=\"0.3\"/>" + "<PageMargins x:Bottom=\"0.75\" x:Left=\"0.7\" x:Right=\"0.7\" x:Top=\"0.75\"/>" + "</PageSetup>" + "<Unsynced/>" + "<PageLayoutZoom>0</PageLayoutZoom>" + "<Selected/>" + "<FreezePanes/>" + "<FrozenNoSplit/>" + "<SplitHorizontal>1</SplitHorizontal>" + "<TopRowBottomPane>1</TopRowBottomPane>" + "<ActivePane>2</ActivePane>" + "<Panes>" + "<Pane><Number>3</Number></Pane>" + "<Pane><Number>2</Number><ActiveRow>1</ActiveRow></Pane>" + "</Panes>" + "<ProtectObjects>False</ProtectObjects>" + "<ProtectScenarios>False</ProtectScenarios>" + "</WorksheetOptions>" + "<AutoFilter xmlns=\"urn:schemas-microsoft-com:office:excel\" x:Range=\"R1C1:R1C" + oExportData.headers.length + "\"/>" + "</Worksheet>";

            xls += "</Workbook>";

            return xls;
        },

        _downloadContent : function(sExportData, sFilename, sMimeType, sCharset) {
            var downloadLink = jQuery("<a/>", {
                download : sFilename,
                style : {
                    display : "none"
                }
            });
            jQuery("body").append(downloadLink);
            if (this._oBrowser.name == this._oBrowser.BROWSER.SAFARI) {
                var oWindow = window.open("data:" + sMimeType + ";" + sCharset + "," + encodeURIComponent(sExportData), "_blank");
                setTimeout(function() {
                    oWindow.close();
                }, 250);
            } else {
                var sUrl = "data:" + sMimeType;
                if (sCharset) {
                    sUrl += ";charset=" + sCharset;
                }
                sUrl += "," + encodeURIComponent(sExportData);
                jQuery(downloadLink).attr("href", sUrl);
                downloadLink[0].click();
            }
        },

        _saveContent : function(sExportData, sFilename, sMimeType, sCharset) {
            if (sMimeType == MIME_TYPE_CSV) {
                sFilename += "." + FORMAT_TXT;
            } else if (sMimeType == MIME_TYPE_XLS) {
                sFilename += "." + FORMAT_XML;
            }
            var dialog = false;
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
            dialog = innerDocument.execCommand("SaveAs", false, sFilename);
            document.getElementsByTagName("body")[0].removeChild(ifr);
            return dialog;
        },

        _showConfirmationPopup : function(fnOK, fnCancel, iCount) {
            sap.ui.ino.controls.MessageBox.show(this._i18n.getText("GENERAL_EXPORT_INS_EXPORT_CONFIRMATION", [iCount]), sap.ui.commons.MessageBox.Icon.NONE, this._i18n.getText("GENERAL_EXPORT_TIT_EXPORT_CONFIRMATION"), [sap.ui.commons.MessageBox.Action.OK, sap.ui.commons.MessageBox.Action.CANCEL], function(bResult) {
                if (bResult == "OK") {
                    fnOK();
                } else {
                    fnCancel();
                }
            }, sap.ui.commons.MessageBox.Action.OK);
        },

        _showConfirmationPopupMax : function(fnOK, fnCancel, iCount, iMax) {
            sap.ui.ino.controls.MessageBox.show(this._i18n.getText("GENERAL_EXPORT_INS_EXPORT_CONFIRMATION_MAX", [iCount, iMax]), sap.ui.commons.MessageBox.Icon.NONE, this._i18n.getText("GENERAL_EXPORT_TIT_EXPORT_CONFIRMATION"), [sap.ui.commons.MessageBox.Action.OK, sap.ui.commons.MessageBox.Action.CANCEL], function(bResult) {
                if (bResult == "OK") {
                    fnOK();
                } else {
                    fnCancel();
                }
            }, sap.ui.commons.MessageBox.Action.OK);
        },

        _showIEInstructionPopup : function(fnOK, fnCancel, sFormat) {
            var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
            var vStorageKey = "sap.ui.ino.views.common.TableExport-IEInstructionPopupNotShowAgain-" + sFormat.toUpperCase();
            if (!oStorage.get(vStorageKey)) {
                sap.ui.ino.controls.MessageBox.show(this._i18n.getText("GENERAL_EXPORT_INS_EXPORT_IE_INSTRUCTION_DESCR_" + sFormat.toUpperCase()), sap.ui.commons.MessageBox.Icon.NONE, this._i18n.getText("GENERAL_EXPORT_INS_EXPORT_IE_INSTRUCTION_TITLE"), [sap.ui.commons.MessageBox.Action.OK, sap.ui.commons.MessageBox.Action.CANCEL], function(bResult) {
                    if (bResult == "OK") {
                        oStorage.put(vStorageKey, true);
                        fnOK();
                    } else {
                        fnCancel();
                    }
                }, sap.ui.commons.MessageBox.Action.OK);
            } else {
                fnOK();
            }
        },

        exportEnabled : function(oTable) {
            if (!(oTable.getModel() instanceof sap.ui.model.odata.ODataModel)) {
                return false;
            }
            return true;
        },

        /**
         * Export all table data for current table binding view as file
         * 
         * @param oTable
         *            table object containing the column definition and formatters
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
        exportContent : function(oTable, sFormat, sFilename, fnComplete, sAuthor, sPrefix, iLimit) {
            if (!this.exportEnabled(oTable)) {
                return false;
            }
            if (sFormat != FORMAT_CSV && sFormat != FORMAT_XLS) {
                return false;
            }
            var that = this;
            function fnProcess(iLimit) {
                sFilename = sFilename || DEFAULT_PREFIX + "." + sFormat;
                var sMimeType = sFormat == FORMAT_CSV ? MIME_TYPE_CSV : MIME_TYPE_XLS;
                var sCharset = sFormat == FORMAT_CSV ? CHARSET_UTF8 : "";
                var oExportData = that._readContent(oTable, iLimit);
                var sExportData = that._convertToFormat(oExportData, sFormat, sFilename, sAuthor, sPrefix);
                if (that._oBrowser.name != that._oBrowser.BROWSER.INTERNET_EXPLORER) {
                    that._downloadContent(sExportData, sFilename, sMimeType, sCharset);
                    fnComplete();
                } else {
                    that._showIEInstructionPopup(function() {
                        that._saveContent(sExportData, sFilename, sMimeType, sCharset);
                        fnComplete();
                    }, function() {
                        fnComplete();
                    }, sFormat);
                }
            }

            var oBinding = oTable.getBinding();

            var iMax = sFormat == FORMAT_CSV ? RECORD_MAX_THRESHOLD_CSV : RECORD_MAX_THRESHOLD_XLS;
            var iCount = undefined;
            if (oBinding.bLengthFinal || oBinding.iTotalSize) {
                iCount = oBinding.iLength || oBinding.iTotalSize || iMax;
            } else {
                // this happens when no inline count is requested and only parts of the table
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
         * Export all table data for current table binding view as file
         * 
         * @param oTable
         *            table object containing the column definition and formatters
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
         */
        exportAdvanced : function(oTable, sFormat, sPrefix, oExportButton, sAuthor, iLimit) {
            var that = this;
            oExportButton.setEnabled(false);
            sap.ui.ino.controls.BusyIndicator.show(0);
            sPrefix = sPrefix ? this._i18n.getText(sPrefix) : DEFAULT_PREFIX;
            sPrefix = sPrefix.replace(new RegExp("[^a-zA-Z0-9 .-]"), "_");
            var sFilename = sPrefix;
            var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                pattern : "dd-MM-yyyy_HH-mm"
            });
            sFilename += "_" + oDateFormat.format(new Date());
            sFilename += "." + sFormat;
            setTimeout(function() {
                if (!that.exportContent(oTable, sFormat, sFilename, function() {
                    oExportButton.setEnabled(true);
                    sap.ui.ino.controls.BusyIndicator.hide();
                }, sAuthor, sPrefix, iLimit)) {
                    oExportButton.setEnabled(true);
                    sap.ui.ino.controls.BusyIndicator.hide();
                }
            }, 0);
        }
    };
})();