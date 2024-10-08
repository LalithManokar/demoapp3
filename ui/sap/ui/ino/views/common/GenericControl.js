/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.views.common.GenericControl");

(function() {
    "use strict";

    jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");
    jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
    jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");
    jQuery.sap.require("sap.ui.model.json.JSONModel");
    jQuery.sap.require("sap.m.Tokenizer");
    jQuery.sap.require("sap.m.Token");
    sap.ui.ino.views.common.GenericControl = {
        create : function(oSettings) {
            var sNode = oSettings.Node || "Root";
            var oView = oSettings.View;
            var sType = oSettings.Type;
            var sText = oSettings.Text;
            var sTooltip = oSettings.Tooltip;
            var vEditable = oSettings.Editable;
            var bVisible = oSettings.Visible;
            var sUrl = oSettings.URL;
            var oDataType = oSettings.DataType;
            var oLabelControl = oSettings.LabelControl;
            var fnOnChange = oSettings.onChange;
            var fnOnLiveChange = oSettings.onLiveChange;

            if (bVisible == undefined || bVisible == null) {
                bVisible = true;
            }

            if (vEditable == undefined || vEditable == null) {
                vEditable = true;
            }

            if (vEditable.Property) {
                vEditable.path = oView.getFormatterPath("/property/nodes/" + sNode + "/attributes" + sText + "/" + vEditable.Property);
            };

            if (sType == "link") {
                var oLink = new sap.ui.commons.Link({
                    text : oView.getBoundPath(sText),
                    href : sUrl,
                    tooltip : sTooltip ? "{i18n>" + sTooltip + "}" : undefined,
                    target : "_blank",
                    visible : bVisible,
                    ariaLabelledBy : oLabelControl ? oLabelControl : undefined
                });
                if (oLabelControl && typeof oLabelControl.setLabelFor === "function") {
                    oLabelControl.setLabelFor(oLink);
                }
                return oLink;
            } else if (sType == "checkbox") {
                if (!oDataType) {
                    oDataType = new sap.ui.ino.models.types.IntBooleanType();
                };
                var oBox = new sap.ui.commons.CheckBox({
                    checked : {
                        path : oView.getFormatterPath(sText),
                        type : oDataType,
                        visible : bVisible
                    },
                    tooltip : sTooltip ? "{i18n>" + sTooltip + "}" : undefined,
                    enabled : vEditable,
                    visible : bVisible,
                    ariaLabelledBy : oLabelControl ? oLabelControl : undefined,
                    change : fnOnChange ? [fnOnChange, oView] : [function() {
                        return;
                    }, oView]
                });
                if (oLabelControl && typeof oLabelControl.setLabelFor === "function") {
                    oLabelControl.setLabelFor(oBox);
                }
                return oBox;
            } else if (sType == "title") {
                return new sap.ui.commons.Title({
                    text : "{i18n>" + sText + "}",
                    tooltip : sTooltip ? "{i18n>" + sTooltip + "}" : undefined,
                    visible : bVisible
                });
            } else if (sType == "label") {
                var oLabel = new sap.ui.commons.Label({
                    text : "{i18n>" + sText + "}",
                    tooltip : sTooltip ? "{i18n>" + sTooltip + "}" : undefined,
                    visible : bVisible,
                    labelFor : oLabelControl ? oLabelControl : undefined
                });
                if (oLabelControl && typeof oLabelControl.removeAllAriaLabelledBy === "function"
                        && typeof oLabelControl.addAriaLabelledBy === "function") {
                    oLabelControl.removeAllAriaLabelledBy();
                    oLabelControl.addAriaLabelledBy(oLabel);
                }
                return oLabel;
            } else if (sType == "textfield") {
                var sMetaPath = "";
                if (typeof sText == "object") {
                    if (sText.path.charAt(0) == "/") {
                        sMetaPath = sText.path.substring(1);
                    } else {
                        sMetaPath = sText.path;
                    }
                } else {
                    if (sText.charAt(0) == "/") {
                        sMetaPath = sText.substring(1);
                    } else {
                        sMetaPath = sText;
                    }
                }

                if (!oDataType) {
                    oDataType = new sap.ui.model.type.String();
                };

                var oField = new sap.ui.commons.TextField({
                    value : oView.getBoundObject(sText, false, oDataType), // "{" + sBindingPrefix + sText + "}",
                    editable : vEditable,
                    maxLength : oView.getBoundPath("/meta/nodes/" + sNode + "/attributes/" + sMetaPath + "/maxLength"),
                    required : oView.getBoundPath("/meta/nodes/" + sNode + "/attributes/" + sMetaPath + "/required"),
                    visible : bVisible,
                    width : '100%',
                    tooltip : sTooltip ? "{i18n>" + sTooltip + "}" : undefined,
                    change : fnOnChange ? [fnOnChange, oView] : [function() {
                        return;
                    }, oView],
                    liveChange : oView.getController().onLiveChange ? [oView.getController().onLiveChange,
                            oView.getController()] : [function() {
                        return;
                    }, oView],
                    ariaLabelledBy : oLabelControl ? oLabelControl : undefined
                });
                if (oLabelControl && typeof oLabelControl.setLabelFor === "function") {
                    oLabelControl.setLabelFor(oField);
                }
                return oField;
            } else if (sType == "textarea") {
                var sMetaPath = "";
                if (typeof sText == "object") {
                    if (sText.path.charAt(0) == "/") {
                        sMetaPath = sText.path.substring(1);
                    } else {
                        sMetaPath = sText.path;
                    }
                } else {
                    if (sText.charAt(0) == "/") {
                        sMetaPath = sText.substring(1);
                    } else {
                        sMetaPath = sText;
                    }
                }

                if (!oDataType) {
                    oDataType = new sap.ui.model.type.String();
                };

                var oArea = new sap.ui.commons.TextArea({
                    rows : 4,
                    value : oView.getBoundObject(sText, false, oDataType),
                    editable : vEditable,
                    maxLength : oView.getBoundPath("/meta/nodes/" + sNode + "/attributes/" + sMetaPath + "/maxLength"),
                    required : oView.getBoundPath("/meta/nodes/" + sNode + "/attributes/" + sMetaPath + "/required"),
                    visible : bVisible,
                    width : "100%",
                    ariaLabelledBy : oLabelControl ? oLabelControl : undefined
                });
                if (oLabelControl && typeof oLabelControl.setLabelFor === "function") {
                    oLabelControl.setLabelFor(oArea);
                }
                return oArea;
            } else if (!sType || sType == "textview") {
                var oTextView = new sap.ui.commons.TextView({
                    text : oView.getBoundPath(sText),
                    tooltip : sTooltip ? "{i18n>" + sTooltip + "}" : undefined,
                    visible : bVisible,
                    ariaLabelledBy : oLabelControl ? oLabelControl : undefined
                });
                if (oLabelControl && typeof oLabelControl.setLabelFor === "function") {
                    oLabelControl.setLabelFor(oTextView);
                }
                return oTextView;
            }
        },

        createDropDownBoxForCode : function(oSettings) {
            var iId = oSettings.Id;
            var oView = oSettings.View;
            var sPath = oSettings.Path;
            var bEdit = oSettings.Editable;
            var bVisible = oSettings.Visible;
            var oLabel = oSettings.LabelControl;
            var fnOnChange = oSettings.onChange;
            var fnOnLiveChange = oSettings.onLiveChange;

            var oDropDownBox = null;
            oDropDownBox = new sap.ui.commons.DropdownBox({
                id : iId,
                selectedKey : oView.getBoundPath(sPath),
                editable : bEdit,
                visible : bVisible,
                displaySecondaryValues: oSettings.DisplaySecondaryValues || false,
                width : oSettings.Width ? oSettings.Width : "100%",
                change : fnOnChange ? [fnOnChange, oView] : [function() {
                    return;
                }, oView],
                liveChange : fnOnLiveChange ? [fnOnLiveChange, oView] : [function() {
                    return;
                }, oView],
                ariaLabelledBy : oLabel ? oLabel : undefined
            });

            if (oLabel && typeof oLabel.setLabelFor === "function") {
                oLabel.setLabelFor(oDropDownBox);
            }

            this.bindDropDownBoxForCode(oDropDownBox, oSettings);
            
            return oDropDownBox;
        },
        
        
        bindDropDownBoxForCode : function(oDropDownBox, oSettings){
            var oView = oSettings.View;
            var sCodeTable = oSettings.CodeTable;
            var bWithEmpty = oSettings.WithEmpty;
            var aFilters = oSettings.Filters;
            var oSorter = oSettings.Sorter;
        	var oShowTechName = oSettings.ShowTechName || false;
            var sCodePath = oView.getController().getCodeModelPrefix() + "CODE";
            var sCodeBoundPath = "{" + sCodePath + "}";
            var sCodeItemPath = oView.getController().getCodeModelPrefix() + "/" + sCodeTable;

//            var oItemTemplate = new sap.ui.core.ListItem({
//                text : {
//                   path : sCodePath,
//                    formatter : sap.ui.ino.models.core.CodeModel.getFormatter(sCodeTable), // defined in
                // config.xsodata
//                },
//                key : sCodeBoundPath,
//                tooltip : {
//                    path : sCodePath,
//                    formatter : sap.ui.ino.models.core.CodeModel.getLongTextFormatter(sCodeTable),
//                }
//            });
            var oItemTemplate;
			if (oShowTechName) {
				oItemTemplate = new sap.ui.core.ListItem({
					text: {
						path: sCodePath,
						formatter: sap.ui.ino.models.core.CodeModel.getFormatter(sCodeTable) // defined in
						// config.xsodata
					},
					key: sCodeBoundPath,
					additionalText: {
						path: sCodePath,
						formatter: function(sCode) {
							return sap.ui.ino.views.backoffice.config.Util.formatPlainCode(sCode);
						}
					},
					tooltip: {
						path: sCodePath,
						formatter: sap.ui.ino.models.core.CodeModel.getLongTextFormatter(sCodeTable)
					}
				});
			} else {
				oItemTemplate = new sap.ui.core.ListItem({
					text: {
						path: sCodePath,
						formatter: sap.ui.ino.models.core.CodeModel.getFormatter(sCodeTable) // defined in
						// config.xsodata
					},
					key: sCodeBoundPath,
					tooltip: {
						path: sCodePath,
						formatter: sap.ui.ino.models.core.CodeModel.getLongTextFormatter(sCodeTable)
					}
				});
			}
			
            var oBindingInfo = {
                path : sCodeItemPath,
                template : oItemTemplate,
                filters : aFilters,
                parameters : {
                    includeEmptyCode : bWithEmpty
                },
                length: 1000
            };
            if(oSorter){
                oBindingInfo.sorter = oSorter;
            }
            oDropDownBox.bindItems(oBindingInfo);
        },
        
        createMultiComboBox: function(oSettings, sCode) {
            var iId = oSettings.Id;
            var oView = oSettings.View;
            var aSelKeys = oSettings.SelKeys;
            var bEdit = oSettings.Editable;
            var bVisible = oSettings.Visible;
            var oLabel = oSettings.LabelControl;
            var fnOnSelectionChange = oSettings.onSelectionChange;

            var oMultiComboBox = null;
            oMultiComboBox = new sap.m.MultiComboBox({
                id : iId,
                selectedKeys : aSelKeys,
                editable : bEdit,
                visible : bVisible,
                showSecondaryValues: oSettings.DisplaySecondaryValues || false,
                width : oSettings.Width ? oSettings.Width : "100%",
                selectionChange : fnOnSelectionChange ? [fnOnSelectionChange, oView] : [function() {
                    return;
                }, oView],
                ariaLabelledBy : oLabel ? oLabel : undefined
            });
            oMultiComboBox.addStyleClass("sapUiInoSettingsMultiComboBox");

            if (oLabel && typeof oLabel.setLabelFor === "function") {
                oLabel.setLabelFor(oMultiComboBox);
            }

            this.bindMultiComboBoxItems(oMultiComboBox, oView, sCode);
            
            return oMultiComboBox;
        },
        
        bindMultiComboBoxItems: function(oControl, oView, sCode) {
            var oTextBundle = oView.getModel("i18n").getResourceBundle();
            var oItemTemplate;
            if(sCode === 'sap.ino.config.IDEA_FILTERS_CONFIG'){
                oControl.setModel(new sap.ui.model.json.JSONModel([{
                        code: 'CAMPAIGN',
                        text: oTextBundle.getText('BO_LOCAL_SYSTEM_SETTING_IDEA_FILTER_ITEM_CAMPAING')
                    }, {
                        code: 'CUSTOM_IDEA_FORM',
                        text: oTextBundle.getText('BO_LOCAL_SYSTEM_SETTING_IDEA_FILTER_ITEM_CUSTIDEAFORM')
                    }, {
                        code: 'PHASE',
                        text: oTextBundle.getText('BO_LOCAL_SYSTEM_SETTING_IDEA_FILTER_ITEM_PHASE')
                    }, {
                        code: 'STATUS_TYPE',
                        text: oTextBundle.getText('BO_LOCAL_SYSTEM_SETTING_IDEA_FILTER_ITEM_STATUSTYPE')
                    }, {
                        code: 'STATUS',
                        text: oTextBundle.getText('BO_LOCAL_SYSTEM_SETTING_IDEA_FILTER_ITEM_STATUS')
                    }, {
                        code: 'VOTE_NUMBER',
                        text: oTextBundle.getText('BO_LOCAL_SYSTEM_SETTING_IDEA_FILTER_ITEM_VOTENUMBER')
                    }, {
                        code: 'RESPONSIBILITY_LIST',
                        text: oTextBundle.getText('BO_LOCAL_SYSTEM_SETTING_IDEA_FILTER_ITEM_RESPLIST')
                    }, {
                        code: 'AUTHOR',
                        text: oTextBundle.getText('BO_LOCAL_SYSTEM_SETTING_IDEA_FILTER_ITEM_AUTHOR')
                    }, {
                        code: 'COACH',
                        text: oTextBundle.getText('BO_LOCAL_SYSTEM_SETTING_IDEA_FILTER_ITEM_COACH')
                    }, {
                        code: 'DUE_DATE',
                        text: oTextBundle.getText('BO_LOCAL_SYSTEM_SETTING_IDEA_FILTER_ITEM_DUE')
                    },{
                        code: 'LATEST_UPDATE',
                        text: oTextBundle.getText('BO_LOCAL_SYSTEM_SETTING_IDEA_FILTER_ITEM_LATEST_UPDATE')                        
                    },{
                        code: 'COMPANY_VIEW',
                        text: oTextBundle.getText('BO_LOCAL_SYSTEM_SETTING_IDEA_FILTER_COMPANY_VIEW')
                    }]), 'ideaFilters');
                 oItemTemplate = new sap.ui.core.ListItem({
        				text: '{ideaFilters>text}',
        				key: '{ideaFilters>code}',
        				tooltip: '{ideaFilters>text}'
        			});
        			
        			oControl.bindItems({
        			    path : 'ideaFilters>/',
                        template : oItemTemplate
        			});
            }else if(sCode === 'sap.ino.config.ANONYMOUS_FOR_PARTLY_OPTION'){
                oControl.setModel(new sap.ui.model.json.JSONModel([{
                        code: 'VISIBLE_TO_COACH',
                        text: oTextBundle.getText('BO_LOCAL_SYSTEM_SETTING_PARTIALLY_VISIBLE_TO_COACH')
                    }, {
                        code: 'VISIBLE_TO_EXPERT',
                        text: oTextBundle.getText('BO_LOCAL_SYSTEM_SETTING_PARTIALLY_VISIBLE_TO_EXPERT')
                    }, {
                        code: 'VISIBLE_TO_PARTICIPANT',
                        text: oTextBundle.getText('BO_LOCAL_SYSTEM_SETTING_PARTIALLY_VISIBLE_TO_PARTICIPANT')
                    }, {
                        code: 'VISIBLE_TO_COACH_AND_EXPERT',
                        text: oTextBundle.getText('BO_LOCAL_SYSTEM_SETTING_PARTIALLY_VISIBLE_TO_COACH_AND_EXPERT')
                    }, {
                        code: 'VISIBLE_TO_COACH_POOL',
                        text: oTextBundle.getText('BO_LOCAL_SYSTEM_SETTING_PARTIALLY_VISIBLE_TO_COACH_POOL')
                    }, {
                        code: 'VISIBLE_TO_EXPERT_POOL',
                        text: oTextBundle.getText('BO_LOCAL_SYSTEM_SETTING_PARTIALLY_VISIBLE_TO_EXPERT_POOL')
                    }, {
                        code: 'VISIBLE_TO_COACH_POOL_AND_EXPERT_POOL',
                        text: oTextBundle.getText('BO_LOCAL_SYSTEM_SETTING_PARTIALLY_VISIBLE_TO_COACH_POOL_AND_EXPERT_POOL')
                    }]), 'partiallyAnonymousOptions');
                 oItemTemplate = new sap.ui.core.ListItem({
        				text: '{partiallyAnonymousOptions>text}',
        				key: '{partiallyAnonymousOptions>code}',
        				tooltip: '{partiallyAnonymousOptions>text}'
        			});
        			
        			oControl.bindItems({
        			    path : 'partiallyAnonymousOptions>/',
                        template : oItemTemplate
        			});
            }

        },
        
        createTokenizer: function(oSettings) {
            var oMultiComboBox = oSettings.MultiComboBox;
            var oTokenizer = new sap.m.Tokenizer({
                tokens: oMultiComboBox.getSelectedItems().map(function(oItem) {
                    return {
                        key: oItem.getKey(),
                        text: oItem.getText()
                    };
                })
            });
            oTokenizer.addStyleClass("sapUiInoSettingsTokenizerWrap");
            oTokenizer.attachTokenUpdate(function(oEvent) {
                var aRemovedTokens = oEvent.getParameter("removedTokens");
                if (aRemovedTokens.length > 0) {
                    var aSelectedItems = oMultiComboBox.getSelectedItems().filter(function(oItem) {
                        return oItem.getKey() !== aRemovedTokens[0].getKey();
                    });
                    oMultiComboBox.setSelectedItems(aSelectedItems);
                    oMultiComboBox.fireSelectionFinish({
                        selectedItems: aSelectedItems
                    });
                }
            });
            return oTokenizer;
        },
        
        _handleIdeaFiltersSelChange: function(oTokenizer, oEvent) {
            var oChangedItem = oEvent.getParameter("changedItem");
            var bSelected = oEvent.getParameter("selected");
            if (bSelected) {
                oTokenizer.addToken(new sap.m.Token({
                    key: oChangedItem.getKey(),
                    text: oChangedItem.getText()
                }));
            } else {
                var oDelToken = oTokenizer.getTokens().filter(function(oToken) {
                    return oToken.getKey() === oChangedItem.getKey();
                })[0];
                oTokenizer.removeToken(oDelToken);
            }
        },
        createDropDownBox:function(oSettings){
            var iId = oSettings.Id;
            var oView = oSettings.View;
            var sPath = oSettings.Path;
            var bEdit = oSettings.Editable;
            var bVisible = oSettings.Visible;
            var oLabel = oSettings.LabelControl;
            var fnOnChange = oSettings.onChange;
            var fnOnLiveChange = oSettings.onLiveChange;

            var oDropDownBox = null;
            oDropDownBox = new sap.ui.commons.DropdownBox({
                id : iId,
                selectedKey : oView.getBoundPath(sPath),
                editable : bEdit,
                visible : bVisible,
                displaySecondaryValues: oSettings.DisplaySecondaryValues || false,
                width : oSettings.Width ? oSettings.Width : "100%",
                change : fnOnChange ? [fnOnChange, oView] : [function() {
                    return;
                }, oView],
                liveChange : fnOnLiveChange ? [fnOnLiveChange, oView] : [function() {
                    return;
                }, oView],
                ariaLabelledBy : oLabel ? oLabel : undefined
            });

            if (oLabel && typeof oLabel.setLabelFor === "function") {
                oLabel.setLabelFor(oDropDownBox);
            }

            this.bindDropDownBox(oDropDownBox, oSettings);
            
            return oDropDownBox;            
        },
        bindDropDownBox: function(oDropDownBox, oSettings){
             var oView = oSettings.View;
            // var sCodeTable = oSettings.CodeTable;
            var bWithEmpty = oSettings.WithEmpty;
            // var aFilters = oSettings.Filters;
            // var oSorter = oSettings.Sorter;
            // var sCodePath = oView.getController().getCodeModelPrefix() + "CODE";
            // var sCodeBoundPath = "{" + sCodePath + "}";
            // var sCodeItemPath = oView.getController().getCodeModelPrefix() + "/" + sCodeTable;
            var oTextBundle = oView.getModel("i18n").getResourceBundle();
                oDropDownBox.setModel(new sap.ui.model.json.JSONModel([{
                        code: 'DAY',
                        text: oTextBundle.getText('BO_LOCAL_SYSTEM_SETTING_RETENTION_PERIOD_UNIT_DAY')
                    }, {
                        code: 'MONTH',
                        text: oTextBundle.getText('BO_LOCAL_SYSTEM_SETTING_RETENTION_PERIOD_UNIT_MONTH')
                    }, {
                        code: 'YEAR',
                        text: oTextBundle.getText('BO_LOCAL_SYSTEM_SETTING_RETENTION_PERIOD_UNIT_YEAR')
                    }]), 'retentionPeriodUnit');

            var oItemTemplate = new sap.ui.core.ListItem({
        				text: '{retentionPeriodUnit>text}',
        				key: '{retentionPeriodUnit>code}',
        				tooltip: '{retentionPeriodUnit>text}'
            });

            var oBindingInfo = {
                path : 'retentionPeriodUnit>/',
                template : oItemTemplate,
                parameters : {
                    includeEmptyCode : bWithEmpty
                },
                length: 1000
            };
            oDropDownBox.bindItems(oBindingInfo);           
        }
    };
})();