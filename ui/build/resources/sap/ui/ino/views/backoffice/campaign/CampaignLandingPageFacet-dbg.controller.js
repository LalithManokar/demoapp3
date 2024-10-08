/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");

sap.ui.controller("sap.ui.ino.views.backoffice.campaign.CampaignLandingPageFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOController, {

    setCampaignImage : function(iAttachmenId, sFileName, sMediaType) {
    	this._setImage(this.getModel().setCampaignImage, iAttachmenId, sFileName, sMediaType);
    },

    setCampaignBackgroundImage : function(iAttachmenId, sFileName, sMediaType) {
    	this._setImage(this.getModel().setCampaignBackgroundImage, iAttachmenId, sFileName, sMediaType);
    },
    
    setCampaignMobileSmallBackgroundImage : function(iAttachmenId, sFileName, sMediaType) {
    	this._setImage(this.getModel().setCampaignMobileSmallBackgroundImage, iAttachmenId, sFileName, sMediaType);
    },
    
    setCampaignListImage : function(iAttachmenId, sFileName, sMediaType) {
    	this._setImage(this.getModel().setCampaignListImage, iAttachmenId, sFileName, sMediaType);
    },
    
    _setImage : function(fMethod, iAttachmenId, sFileName, sMediaType) {
    	fMethod.call(this.getModel(), {
            ATTACHMENT_ID : iAttachmenId,
            FILE_NAME : sFileName,
            MEDIA_TYPE : sMediaType
        });
    },
        
    clearCampaignImage : function(iAssignmentId) {
        this.getModel().clearCampaignImage(iAssignmentId);
    },
    
    clearCampaignBackgroundImage : function(iAssignmentId) {
        this.getModel().clearCampaignBackgroundImage(iAssignmentId);
    },
    
    clearCampaignMobileSmallBackgroundImage : function(iAssignmentId) {
        this.getModel().clearCampaignMobileSmallBackgroundImage(iAssignmentId);
    },
    
    clearCampaignListImage : function(iAttachmenId) {
    	 this.getModel().clearCampaignListImage(iAttachmenId);
    },

    addAttachment : function(attachmentId, fileName, mediaType) {
        this.getModel().addAttachment({
            ATTACHMENT_ID : attachmentId,
            FILE_NAME : fileName,
            MEDIA_TYPE : mediaType
        });
    },

    removeAttachment : function(assignmentId) {
        this.getModel().removeAttachment(assignmentId);
    },

    _handleColorPickerLiveChange : function(oEvent) {
        var oColors = oEvent.getParameters();
        if (oColors.hex && oColors.hex.length == 7) {
            this.getModel().setProperty("/COLOR_CODE", oColors.hex.substr(1));
        } else {
            // Invalid color, default to white
            this.getModel().setProperty("/COLOR_CODE", "FFFFFF");
        }
    },

    onAfterModeSwitch : function() {
        this._initialLanguageBinding();
    },

    _initialLanguageBinding : function() {
        this.getThingInspectorController()._initialLanguageBinding(this.getView());
    },

    onLanguageChange : function(oEvent) {
        var oView = this.getView();
        if (oEvent.getParameter("liveValue")) {
            oEvent.getSource().setValue(oEvent.getParameter("liveValue"));
        }
        var aItems = oEvent.getSource().getItems();
        var sKey = oEvent.getSource().getSelectedKey();
        var oItem = undefined;

        var aLanguages = this.getModel().oData["LanguageTexts"];
        if (aLanguages) {
            // Remember current selection to display the correct value after
			// mode switch
            if (sKey) {
                this.getThingInspectorController()._sCurrentLanguageKey = sKey;
            }
            for (var ii = 0; ii < aItems.length; ++ii) {
                if (aItems[ii].getKey() === sKey) {
                    oItem = aItems[ii];
                    break;
                }
            }
            if (oItem) {
                var sLanguage = undefined;
                for (var i = 0; i < aLanguages.length; i++) {
                    var oLanguage = this.getThingInspectorController().getLanguageByLang(aLanguages[i].LANG);
                    if (oLanguage && oLanguage.CODE === sKey) {
                        sLanguage = aLanguages[i].LANG;
                        this.getThingInspectorController()._sCurrentLanguage = sLanguage;
                        break;
                    }
                }
                if (sLanguage) {
                    oView._oTable.unbindRows();
                    oView._oTable.bindRows({
                        path : this.getFormatterPath("LanguagePages", true),
                        filters : [new sap.ui.model.Filter("LANG", "EQ", sLanguage)]
                    });
                    oView._oTable.setSelectedIndex(-1);
                    oView._oPageTemplate.setVisible(false);
                    this._updateButtons();
                }
            }
        }
        setTimeout(function() {
            oView.revalidateMessages();
        }, 500);
    },

    selectPageRow : function(iRow) {
        var oView = this.getView();
        oView._oTable.setFirstVisibleRow(iRow);
        oView._oTable.setSelectedIndex(iRow);
        if (oView._oPageTitle) {
            // timeout required due to rendering delay
            setTimeout(function() {
                oView._oPageTitle.focus();
            }, 500);
        }      
    },

    _processPages : function(fnCheck, fnDo, fnRefresh) {
        var oTIController = this.getThingInspectorController();
        var aPages = this.getModel().getProperty("/LanguagePages");

        var aLangPages = [];
        var aOtherPages = [];

        jQuery.each(aPages, function(i, oPage) {
            if (oPage.LANG === oTIController._sCurrentLanguage) {
                aLangPages.push(oPage);
            } else {
                aOtherPages.push(oPage);
            }
        });

        var iSelectedIndex = this.getView()._oTable.getSelectedIndex();
        if (fnCheck && fnCheck(iSelectedIndex, aLangPages.length, this.getView()._oTable.getRows().length)) {
            if (fnDo) {
                fnDo(iSelectedIndex, aLangPages, oTIController._sCurrentLanguage);

                aPages = aLangPages.concat(aOtherPages);
                this.getModel().setProperty("/LanguagePages", aPages);
                this._updateTable();

                if(fnRefresh) {
                	fnRefresh(iSelectedIndex, aLangPages.length);
                }
            }
        }
    },

    onNewButtonPressed : function(oEvent) {
        var oController = this;
        this._processPages(function(iSelectedIndex, iPageCount, iRowCount) {
            return true;
        }, function(iSelectedIndex, aPages, sLangKey) {
            aPages.splice(0, 0, oController.getModel().determinePageCreate(sLangKey));
        }, function(iSelectedIndex, iPageCount) {
            oController.selectPageRow(0);
            oController.getThingInspectorController().initLanguageTemplateModel("/LanguagePages/0");
        });
    },

    onDeleteButtonPressed : function(oEvent) {
        var oView = this.getView();
        this._processPages(function(iSelectedIndex, iPageCount, iRowCount) {
            return iSelectedIndex >= 0 && iSelectedIndex < iPageCount;
        }, function(iSelectedIndex, aPages, sLangKey) {
            aPages.splice(iSelectedIndex, 1);
        }, function(iSelectedIndex, iPageCount) {
            if (iSelectedIndex < iPageCount) {
                oView._oTable.setSelectedIndex(iSelectedIndex);
                oView.getThingInspectorController().initLanguageTemplateModel("/LanguagePages/" + iSelectedIndex);
            } else {
                oView._oTable.setSelectedIndex(-1);
            }
        });
    },

    onUpButtonPressed : function(oEvent) {
        var oView = this.getView();
        this._processPages(function(iSelectedIndex, iPageCount, iRowCount) {
            return iSelectedIndex > 0 && iSelectedIndex < iPageCount;
        }, function(iSelectedIndex, aPages, sLangKey) {
            var oTemp = aPages[iSelectedIndex];
            aPages[iSelectedIndex] = aPages[iSelectedIndex - 1];
            aPages[iSelectedIndex - 1] = oTemp;
        }, function(iSelectedIndex, iPageCount) {
            oView._oTable.setSelectedIndex(iSelectedIndex - 1);
        });
    },

    onDownButtonPressed : function(oEvent) {
        var oView = this.getView();
        this._processPages(function(iSelectedIndex, iPageCount, iRowCount) {
            return iSelectedIndex >= 0 && iSelectedIndex < iPageCount - 1;
        }, function(iSelectedIndex, aPages, sLangKey) {
            var oTemp = aPages[iSelectedIndex];
            aPages[iSelectedIndex] = aPages[iSelectedIndex + 1];
            aPages[iSelectedIndex + 1] = oTemp;
        }, function(iSelectedIndex, iPageCount) {
            oView._oTable.setSelectedIndex(iSelectedIndex + 1);
        });
    },

    _updateButtons : function(iSelectedIndex) {
        if (this.isInEditMode()) {
            var oView = this.getView();
            if (iSelectedIndex < 0) {
                oView._oDeleteButton.setEnabled(false);
                oView._oUpButton.setEnabled(false);
                oView._oDownButton.setEnabled(false);
            } else {
                oView._oDeleteButton.setEnabled(true);
                this._processPages(function(iSelectedIndex, iPageCount, iRowCount) {
                    oView._oUpButton.setEnabled(iSelectedIndex > 0);
                    oView._oDownButton.setEnabled(iSelectedIndex < iPageCount - 1);
                });
            }
        }
    },

    onPreviewRefresh : function() {
        var that = this;
        var oView = this.getView();
        var oCampaign = that.getModel();
        var oTIController = this.getThingInspectorController();
        oTIController.clearMessages("html_preview");

        var iRefId = 0;
        if (oView._oTable.getSelectedIndex() > -1 && oView._oTable.getContextByIndex(oView._oTable.getSelectedIndex())) {
            iRefId = oView._oTable.getContextByIndex(oView._oTable.getSelectedIndex()).getObject().ID;
        }

        try {
            var $IFrame = document.getElementsByName("campaign_preview");
            if ($IFrame && $IFrame.length > 0) {
                var oIFrame = $IFrame[0];
                if (oIFrame.contentWindow.createContent) {
                    if (!this.isInEditMode()) {
                        var sId = oIFrame.getAttribute("data-sap-id");
                        var oTextControl = sap.ui.getCore().byId(sId) || that.getView()._oText;
                        if (oTextControl) {
                            var sContent = oTextControl.getValue ? oTextControl.getValue() : oTextControl.getContent();
                            this.validateHTML(sContent);
                            oIFrame.contentWindow.createContent([sContent], false);
                        }
                    }
                    else {
                        var sContent = oView._oText.getValue();
                        if (sContent) {
                            this.validateHTML(sContent);
                            oIFrame.contentWindow.createContent([sContent], false);
                        }
                    }
                } else {
                    oIFrame.onload = function() {
                        var $IFrame = document.getElementsByName("campaign_preview");
                        if ($IFrame && $IFrame.length > 0) {
                            var oIFrame = $IFrame[0];
                            if (!that.isInEditMode()) {
                                var sId = oIFrame.getAttribute("data-sap-id");
                                var oTextControl = sap.ui.getCore().byId(sId) || that.getView()._oText;
                                if (oTextControl) {
                                    var sContent = oTextControl.getValue ? oTextControl.getValue() : oTextControl.getContent();
                                    try {
                                        that.validateHTML(sContent);
                                        oIFrame.contentWindow.createContent([sContent], false);
                                    } catch (e) {
                                        // Invalid HTML
                                        oTIController.addMessages(oCampaign.validateHTML(iRefId), "html_preview");
                                        oView.revalidateMessages();
                                    }
                                }
                            }
                            else {
                                setTimeout(function() {
                                    var sContent = oView._oText.getValue();
                                    if (sContent) {
                                        that.validateHTML(sContent);
                                        oIFrame.contentWindow.createContent([sContent], false);
                                    }
                                }, 200);
                            }
                        }
                    };
                }
            }
        } catch (e) {
            // Invalid HTML
            oTIController.addMessages(oCampaign.validateHTML(iRefId), "html_preview");
        }
        oView.revalidateMessages();
    },

    validateHTML : function(sContent) {
        // Validate HTML
        var aResult = new jQuery(sContent);
        if (!aResult || aResult.length == 0) {
            throw new Error("Invalid HTML");
        }
    },

    onSelectionChanged : function(oSelectedRowContext, iSelectedIndex, oTable, bEdit) {
        var oView = this.getView();
        var oController = this;
        oView._oPageTemplate.setBindingContext(oSelectedRowContext, oController.getModelName());
        setTimeout(function() {
            if (!oView._oPageTemplate.getVisible()) {
                // Wait until the text control is rendered before reading the
				// content
                oView._oPageTemplate.onAfterRendering = function() {
                    oController.onPreviewRefresh();
                };
            }
            oView._oPageTemplate.setVisible(iSelectedIndex >= 0);
            oController.onPreviewRefresh();
            if (!bEdit) {
                return;
            }
            oController._updateButtons(iSelectedIndex);
        }, 250);
        
        // WORKAROUND FOR RTE VALUE BINDING PROBLEM
        if (oSelectedRowContext && oSelectedRowContext.sPath) {
            this.getThingInspectorController().initLanguageTemplateModel(oSelectedRowContext.sPath);
        }
    },

    _updateTable : function() {
        var oView = this.getView();
        oView._oTable.unbindRows();
        oView._oTable.bindRows({
            path : this.getFormatterPath("LanguagePages", true),
            filters : [new sap.ui.model.Filter("LANG", "EQ", this.getThingInspectorController()._sCurrentLanguage)]
        });
        // Force re-rendering to update the rows itself
        oView._oTable.rerender();
    }
}));