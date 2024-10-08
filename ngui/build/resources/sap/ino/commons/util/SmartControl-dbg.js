sap.ui.define([
    "sap/ui/base/ManagedObject",
    "sap/ino/commons/models/aof/MetaModel",
    "sap/ino/commons/models/core/CodeModel",
    "sap/ino/commons/util/UIObjectConfig",
    "sap/ui/core/ListItem",
    "sap/m/Label"
], function(ManagedObject, MetaModel, CodeModel, UIObjectConfig, ListItem, Label) {
    "use strict";

    /**
     * @class
     * Smart Control Support
     */
    var SmartControl = function() {
        throw "May not be instantiated directly";
    };

    function getAttributePath(sNodeName, sAttributeName) {
        if (!sNodeName || sNodeName === "Root") {
            return "/" + sAttributeName;
        } else {
            return "/" + sNodeName + "/0/" + sAttributeName;
        }                
    }
    
    function getBindingPath(sModelName, sNodeName, sAttributeName) {
        if (sModelName === "data" || !sNodeName || sNodeName === "Root") {
            return sModelName + ">" + sAttributeName;
        } else {
            return sModelName + ">" + sNodeName + "/0/" + sAttributeName;    
        }
    }
    
    function getAttributeMetadata(sObjectName, sNodeName, sAttributeName, sAnnotationPath) {
        if (sAnnotationPath) {
            return MetaModel.getProperty("/" + sObjectName + "/nodes/" + sNodeName + "/attributes/" + sAttributeName + "/" + sAnnotationPath.replace(/\./, "/"));
        } else {
            return MetaModel.getProperty("/" + sObjectName + "/nodes/" + sNodeName + "/attributes/" + sAttributeName);    
        }        
    }
    
    function getObjectMetaPath(sModelName, sNodeName, sAttributeName, sAnnotationPath) {
        return sModelName + ">/meta/nodes/" + sNodeName + "/attributes/" + sAttributeName + "/" + sAnnotationPath.replace(/\./, "/");
    }
    
    function getObjectPropertyPath(sModelName, sNodeName, sAttributeName, sAnnotationPath) {
        return sModelName + ">/property/nodes/" + sNodeName + "/attributes/" + sAttributeName + "/" + sAnnotationPath.replace(/\./, "/");
    }
    
    SmartControl.getCodeFormatter = function(sObjectName, sNodeName, sAttributeName) {
        var sCode = getAttributeMetadata(sObjectName, sNodeName, sAttributeName, "foreignKeyTo");
        return CodeModel.getFormatter(sCode);
    };

    SmartControl.getCodeLongTextFormatter = function(sObjectName, sNodeName, sAttributeName) {
        var sCode = getAttributeMetadata(sObjectName, sNodeName, sAttributeName, "foreignKeyTo");
        return CodeModel.getLongTextFormatter(sCode);
    };

    SmartControl.getValueOptionListFormatter = function(sObjectName, sNodeName, sAttributeName) {
        var sValueOptionList = getAttributeMetadata(sObjectName, sNodeName, sAttributeName, "customProperties.valueOptionList");
        var sCode = "sap.ino.xs.object.basis.ValueOptionList.Root_" + sValueOptionList;
        return CodeModel.getFormatter(sCode);
    };

    SmartControl.getValueOptionListLongTextFormatter = function(sObjectName, sNodeName, sAttributeName) {
        var sValueOptionList = getAttributeMetadata(sObjectName, sNodeName, sAttributeName, "customProperties.valueOptionList");
        var sCode = "sap.ino.xs.object.basis.ValueOptionList.Root_" + sValueOptionList;
        return CodeModel.getLongTextFormatter(sCode);
    };
    
    SmartControl.getOpenObjectFormatter = function(oController, sObjectName, sNodeName, sAttributeName) {
        var sForeignKeyTo = getAttributeMetadata(sObjectName, sNodeName, sAttributeName, "foreignKeyTo");
        var oUIObjectConfigDefinition = UIObjectConfig.getDefinition(sForeignKeyTo);
        return function(vKey) {
            if (vKey && 
                oUIObjectConfigDefinition.navigation && 
                oUIObjectConfigDefinition.navigation.path && 
                oUIObjectConfigDefinition.navigation.key && 
                oController.getOwnerComponent()) {
                var oParameter = {};
                oParameter[oUIObjectConfigDefinition.navigation.key] = vKey;
                return oController.getOwnerComponent().getNavigationLink(oUIObjectConfigDefinition.navigation.path, oParameter);
            } else {
                return "javascript:void(0);";
            }
        };
    };
    
    SmartControl.getQuickViewPressedHandler = function(oController, sModelName, sObjectName, sNodeName, sAttributeName) {
        var sForeignKeyTo = getAttributeMetadata(sObjectName, sNodeName, sAttributeName, "foreignKeyTo");
        var oUIObjectConfigDefinition = UIObjectConfig.getDefinition(sForeignKeyTo);
        var oQuickView;
        return function(oEvent) {
            if (!oUIObjectConfigDefinition.quickView) {
                return;
            }
            var oSource = oEvent.getSource();
            if (oSource) {
                var vForeignKey = oSource.getBindingContext(sModelName) && 
                                  oSource.getBindingContext(sModelName).getProperty(sAttributeName);
                if (vForeignKey !== undefined && !oQuickView) {
                    oQuickView = sap.ui.xmlview({
                        viewName : oUIObjectConfigDefinition.quickView
                    });
                    oController.getView().addDependent(oQuickView);
                }
                if (oQuickView && oQuickView.getController()) {
                    oQuickView.getController().open(oSource, vForeignKey);    
                }
            }
        };
    };

    SmartControl.bindToCode = function(oController, oControl, sModelName, sObjectName, sNodeName, sAttributeName) {
        var bRequired = getAttributeMetadata(sObjectName, sNodeName, sAttributeName, "required");
        var sCode = getAttributeMetadata(sObjectName, sNodeName, sAttributeName, "foreignKeyTo");
        var bNoEmptyCode = getAttributeMetadata(sObjectName, sNodeName, sAttributeName, "customProperties.noEmptyCode");
        _bindToCode(oController, oControl, sModelName, sObjectName, sNodeName, sAttributeName, sCode, !bRequired && !bNoEmptyCode);
    };

    SmartControl.bindToValueOptionList = function(oController, oControl, sModelName, sObjectName, sNodeName, sAttributeName) {
        var bRequired = getAttributeMetadata(sObjectName, sNodeName, sAttributeName, "required");
        var sValueOptionList = getAttributeMetadata(sObjectName, sNodeName, sAttributeName, "customProperties.valueOptionList");
        var bNoEmptyCode = getAttributeMetadata(sObjectName, sNodeName, sAttributeName, "customProperties.noEmptyCode");
        var sCode = "sap.ino.xs.object.basis.ValueOptionList.Root_" + sValueOptionList;
        _bindToCode(oController, oControl, sModelName, sObjectName, sNodeName, sAttributeName, sCode, !bRequired && !bNoEmptyCode);
    };
    
    function _bindToCode(oController, oControl, sModelName, sObjectName, sNodeName, sAttributeName, sCode, bIncludeEmptyCode) {
        if (oControl.getMetadata().getAllProperties().selectedKey) {
            if (!oControl.getBindingInfo("selectedKey")) {
                var oItemTemplate = new ListItem({
                    key : {
                        path : "code>CODE"
                    },
                    text : {
                        path : "code>CODE",
                        formatter : CodeModel.getFormatter(sCode)
                    },
                    tooltip : {
                        path : "code>CODE",
                        formatter : CodeModel.getLongTextFormatter(sCode)
                    }
                });
                oControl.bindProperty("selectedKey", {
                    path : getBindingPath(sModelName, sNodeName, sAttributeName)
                });
                oControl.bindAggregation("items", {
                    path : "code>/" + sCode,
                    template : oItemTemplate,
                    sorter: { path: 'CODE' },
                    parameters : bIncludeEmptyCode ? {
                        includeEmptyCode : true
                    } : undefined
                });
            }
        } else if (oControl.getMetadata().getAllProperties().text) {
            if (!oControl.getBindingInfo("text")) {
                oControl.bindProperty("text", {
                    path : getBindingPath(sModelName, sNodeName, sAttributeName),
                    formatter : CodeModel.getFormatter(sCode)
                });
            }
        }
    };

    SmartControl.bindToForeignKey = function(oController, oControl, sModelName, sObjectName, sNodeName, sAttributeName) {
        var oDataModel = oController.getModel("data") || (oController.getOwnerComponent() && oController.getOwnerComponent().getModel("data")) || oControl.getModel("data");
        var sForeignKeyTo = getAttributeMetadata(sObjectName, sNodeName, sAttributeName, "foreignKeyTo");
        var oUIObjectConfigDefinition = UIObjectConfig.getDefinition(sForeignKeyTo);
        if (oControl.getMetadata().getAllProperties().value) {
            if (!oControl.getBindingInfo("value")) {
                var sAttributePath = getAttributePath(sNodeName, sAttributeName);
                oControl.bindProperty("value", {
                    path : getBindingPath(sModelName, sNodeName, sAttributeName),
                    formatter : function(vValue) {
                        var sResult = "";
                        if (vValue) {
                            jQuery.ajax({
                                url : oDataModel.sServiceUrl + "/" + oUIObjectConfigDefinition.instancePath + "(" + vValue + ")" + "/" + oUIObjectConfigDefinition.selectionField + "/$value",
                                async: false,
                                success : function(sData) {
                                    sResult = sData;
                                }
                            });
                        }
                        return sResult;
                    }
                });
                oControl.setShowSuggestion(true);
                oControl.bindProperty("placeholder", "i18n>GENERIC_CONTROL_TYPE_TO_SELECT");
                oControl.setFilterFunction(function(sValue, oItem) {
                    return true;
                });
                oControl.attachSuggest(function(oEvent) {
                    var sValue = oEvent.getParameter("suggestValue");
                    var oTemplate = new ListItem({
                        text : "{data>" + oUIObjectConfigDefinition.selectionField + "}",
                        additionalText : "{data>" + oUIObjectConfigDefinition.secondarySelectionField + "}",
                        key : "{data>" + oUIObjectConfigDefinition.selectionKey + "}"
                    });
                    oEvent.getSource().bindAggregation("suggestionItems", {
                        path : "data>" + UIObjectConfig.getSearchPath(sForeignKeyTo, sValue),
                        template : oTemplate,
                        parameters : oUIObjectConfigDefinition.parameters
                    });
                });
                oControl.attachLiveChange(function(oEvent) {
                    oControl.getModel(sModelName).setProperty(sAttributePath, null);
                });
                oControl.attachSuggestionItemSelected(function(oEvent) {
                    var oSelectedItem = oEvent.getParameters().selectedItem;
                    if (!oSelectedItem) {
                        var aResult = jQuery.grep(oControl.getSuggestionItems(), function(oSuggestionItem) {
                            return oSuggestionItem.getText() === oControl.getValue();
                        });
                        if (aResult.length > 0) {
                            oSelectedItem = aResult[0];
                        }
                    }
                    if (oSelectedItem) {
                        var vKey = oSelectedItem && parseInt(oSelectedItem.getKey(), 10);
                        oControl.getModel(sModelName).setProperty(sAttributePath, vKey);
                        var sName = oSelectedItem.getText();
                        oControl.setValue(sName);
                    } else {
                        oControl.setValue("");
                    }
                    oControl.focus();
                });
                oControl.attachSubmit(function(oEvent) {
                    var oSelectedItem;
                    var aResult = jQuery.grep(oControl.getSuggestionItems(), function(oSuggestionItem) {
                        return oSuggestionItem.getText() === oEvent.getParameter("value");
                    });
                    if (aResult.length > 0) {
                        oSelectedItem = aResult[0];
                    }
                    if (oSelectedItem) {
                        var vKey = oSelectedItem && parseInt(oSelectedItem.getKey(), 10);
                        oControl.getModel(sModelName).setProperty(sAttributePath, vKey);
                    } else {
                        oControl.getModel(sModelName).setProperty(sAttributePath, null);
                        oControl.setValue("");
                    }
                    oControl.focus();
                });
                oControl.addEventDelegate({
                    onfocusout : function(oEvent) {
                        if (oControl.getModel(sModelName).getProperty(sAttributePath) === null) {
                            var oSelectedItem;
                            var aResult = jQuery.grep(oControl.getSuggestionItems(), function(oSuggestionItem) {
                                return oSuggestionItem.getText() === oControl.getValue();
                            });
                            if (aResult.length > 0) {
                                oSelectedItem = aResult[0];
                            }
                            if (oSelectedItem) {
                                var vKey = oSelectedItem && parseInt(oSelectedItem.getKey(), 10);
                                oControl.getModel(sModelName).setProperty(sAttributePath, vKey);
                            } else {
                                oControl.setValue("");
                            }
                        }
                    }
                });
            }
        } else if (oControl.getMetadata().getAllProperties().text) {
            if (!oControl.getBindingInfo("text")) {
                oControl.bindProperty("text", {
                    path : getBindingPath(sModelName, sNodeName, sAttributeName),
                    formatter : function(vValue) {
                        var sResult = "";
                        if (vValue) {
                            jQuery.ajax({
                                url : oDataModel.sServiceUrl + "/" + oUIObjectConfigDefinition.instancePath + "(" + vValue + ")" + "/" + oUIObjectConfigDefinition.selectionField + "/$value",
                                async: false,
                                success : function(sData) {
                                    sResult = sData;
                                }
                            });
                        }
                        return sResult;
                    }
                });
            }
            if (typeof oControl.attachPress === "function" && oUIObjectConfigDefinition.quickView) {
                oControl.attachPress(SmartControl.getQuickViewPressedHandler(oController, sModelName, sObjectName, sNodeName, sAttributeName));
            } else if (oControl.getMetadata().getAllProperties().href && !oControl.getBindingInfo("href")) {
                if (oUIObjectConfigDefinition.navigation && 
                    oUIObjectConfigDefinition.navigation.path && 
                    oUIObjectConfigDefinition.navigation.key) {
                    oControl.bindProperty("href", {
                        path : getBindingPath(sModelName, sNodeName, sAttributeName),
                        formatter : SmartControl.getOpenObjectFormatter(oController, sObjectName, sNodeName, sAttributeName) 
                    });
                }
            }
        }
    };
        
    SmartControl.bindAll = function(oController, oControl, sModelName, sObjectName, sNodeName) {

        function fnFindObjects(oObject, sModelName, sObjectName, sNodeName) {
            for (var n in oObject.mAggregations) {
                var a = oObject.mAggregations[n];
                if (jQuery.isArray(a)) {
                    for (var i = 0; i < a.length; i++) {
                        fnVisitObject(a[i], sModelName, sObjectName, sNodeName);
                    }
                } else if (a instanceof ManagedObject) {
                    fnVisitObject(a, sModelName, sObjectName, sNodeName);
                }
            }
        }
        
        function fnVisitObject(oControl, sModelName, sObjectName, sNodeName) {
            if (oControl.data("aofModel")) {
                sModelName = oControl.data("aofModel"); 
            }
            if (oControl.data("aofObject")) {
                sObjectName = oControl.data("aofObject"); 
            }
            if (oControl.data("aofNode")) {
                sNodeName = oControl.data("aofNode"); 
            }
            SmartControl.bind(oController, oControl, sModelName, sObjectName, sNodeName);
            fnFindObjects(oControl, sModelName, sObjectName, sNodeName);
        }

        fnVisitObject(oControl, sModelName, sObjectName, sNodeName);
    };

    SmartControl.bind = function(oController, oControl, sModelName, sObjectName, sNodeName) {
        if (!oControl.data("aofAttribute")) {
            return;
        }
        var i18nModel = oController.getModel("i18n") || (oController.getOwnerComponent() && oController.getOwnerComponent().getModel("i18n")) || oControl.getModel("i18n");
        var i18n;
        if (i18nModel) {
            i18n = i18nModel.getResourceBundle();
        }
        if (oControl.data("aofModel")) {
            sModelName = oControl.data("aofModel"); 
        }
        sModelName = sModelName || "data";
        if (oControl.data("aofObject")) {
            sObjectName = oControl.data("aofObject"); 
        }
        if (oControl.data("aofNode")) {
            sNodeName = oControl.data("aofNode"); 
        }
        sNodeName = sNodeName || "Root";
        var sAttributeName = oControl.data("aofAttribute");
        var bUseValue = oControl.data("aofUseValue");
        var bLabelColon = oControl.data("aofColon");
        if (oControl.getMetadata().getAllProperties().required && sModelName !== "data") { 
            oControl.bindProperty("required", {
                path : getObjectMetaPath(sModelName, sNodeName, sAttributeName, "required")
            });
        }
        if (i18n && typeof oControl.setTooltip === "function") {
            oControl.setTooltip(i18n.getText(sObjectName + "." + sNodeName + "." + sAttributeName));  
        }
        var sForeignKeyTo = getAttributeMetadata(sObjectName, sNodeName, sAttributeName, "foreignKeyTo");
        if (sForeignKeyTo && 
           (oControl.getMetadata().getAllProperties().value || oControl.getMetadata().getAllProperties().selectedKey ||  
           (oControl.getMetadata().getAllProperties().text && !(oControl instanceof Label && !bUseValue))))  {
            if (!!UIObjectConfig.getDefinition(sForeignKeyTo)) {
                SmartControl.bindToForeignKey(oController, oControl, sModelName, sObjectName, sNodeName, sAttributeName);
            } else {
                SmartControl.bindToCode(oController, oControl, sModelName, sObjectName, sNodeName, sAttributeName);
            }
        } else {
            var sValueOptionList = getAttributeMetadata(sObjectName, sNodeName, sAttributeName, "customProperties.valueOptionList");
            if (sValueOptionList &&
               (oControl.getMetadata().getAllProperties().selectedKey || 
               (oControl.getMetadata().getAllProperties().text &&  !(oControl instanceof Label && !bUseValue))))  {
                SmartControl.bindToValueOptionList(oController, oControl, sModelName, sObjectName, sNodeName, sAttributeName);
            } else {
                if (oControl.getMetadata().getAllProperties().selected && !oControl.getBindingInfo("selected")) {
                    oControl.bindProperty("selected", {
                        path : getBindingPath(sModelName, sNodeName, sAttributeName)
                    });
                } else if (oControl.getMetadata().getAllProperties().text && !oControl.getBindingInfo("text")) {
                    if (oControl instanceof Label && !bUseValue) {
                        oControl.bindProperty("text", {
                            path : "i18n>" + sObjectName + "." + sNodeName + "." + sAttributeName,
                            formatter : function(sText) {
                                return sText + (bLabelColon ? ": " : "");
                            }
                        });
                        oControl.addStyleClass("sapInoLabelSpace");
                    } else {
                        oControl.bindProperty("text", {
                            path : getBindingPath(sModelName, sNodeName, sAttributeName),
                        });
                    }
                } else if (oControl.getMetadata().getAllProperties().value && !oControl.getBindingInfo("value")) {
                    oControl.bindProperty("value", {
                        path : getBindingPath(sModelName, sNodeName, sAttributeName)
                    });
                }                
                if (sModelName !== "data") {
                    if (oControl.getMetadata().getAllProperties().maxLength && !oControl.getBindingInfo("maxLength")) {
                        oControl.bindProperty("maxLength", {
                            path : getObjectMetaPath(sModelName, sNodeName, sAttributeName, "maxLength")
                        });
                    }
                    if (oControl.getMetadata().getAllProperties().min && !oControl.getBindingInfo("min")) {
                        oControl.bindProperty("min", {
                            path : getObjectMetaPath(sModelName, sNodeName, sAttributeName, "minValue")
                        });
                    }
                    if (oControl.getMetadata().getAllProperties().max && !oControl.getBindingInfo("max")) {
                        oControl.bindProperty("max", {
                            path : getObjectMetaPath(sModelName, sNodeName, sAttributeName, "maxValue")
                        });
                    }
                }
            }
        }
        if (sModelName !== "data") {
            if (oControl.getMetadata().getAllProperties().enabled) {
                if (!oControl.getBindingInfo("enabled")) {
                    oControl.bindProperty("enabled", {
                        path : getObjectPropertyPath(sModelName, sNodeName, sAttributeName, "changeable")
                    });
                }
            } else if (oControl.getMetadata().getAllProperties().editable) {
                if (!oControl.getBindingInfo("editable")) {
                    oControl.bindProperty("editable", {
                        path : getObjectPropertyPath(sModelName, sNodeName, sAttributeName, "changeable")
                    });            
                }
            }
        }
    };

    return SmartControl;
});