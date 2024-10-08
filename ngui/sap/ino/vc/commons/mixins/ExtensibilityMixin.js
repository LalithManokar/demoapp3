sap.ui.define([
    "sap/ino/commons/models/aof/MetaModel",
    "sap/ino/commons/models/core/CodeModel",
    "sap/ino/commons/util/SmartControl",
    "sap/ino/commons/util/UIObjectConfig",
    "sap/ui/core/ValueState",
    "sap/ui/core/format/DateFormat",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/CheckBox",
    "sap/m/Select",
    "sap/m/DatePicker",
    "sap/ui/core/ListItem"
], function(MetaModel, CodeModel, SmartControl, UIObjectConfig, ValueState, DateFormat, Label, Input, CheckBox, Select, DatePicker, ListItem) {
    "use strict";

    /**
     * @class
     * Mixin that provides common functionality for extensibility handling
     */
    var ExtensibilityMixin = function() {
        throw "Mixin may not be instantiated directly";
    };

    var DateFormatter = DateFormat.getInstance({pattern: "YYYY-MM-dd"});
    
    // Array of ordered extension field names of type String, e.g ["_INT_02", "_TEXT_01"]
    ExtensibilityMixin.sortExtensionFields = [];
    // Array of ordered extension field names of type String, e.g ["_INT_02", "_TEXT_01"] 
    ExtensibilityMixin.filterExtensionFields = [];

    ExtensibilityMixin._extensibilityExtensionFieldSorter = function() {
        var that = this;
        var aExtensionSorter = [];
        var oCustomData = this.getView().data();
        if (!oCustomData["aofObject"] && this.getView().getContent().length > 0) {
            oCustomData = this.getView().getContent()[0].data();
        }
        if (oCustomData["aofObject"]) {
            var oMetaData = MetaModel.getApplicationObjectMetadata(oCustomData["aofObject"]);
            if (oMetaData.nodes.Extension) {
                jQuery.each(that.sortExtensionFields, function(iIndex, sExtensionField) {
                    if (sExtensionField === "_ID" || sExtensionField === "_OBJECT_TYPE_CODE") {
                        return;
                    }
                    if (oMetaData.nodes.Extension.attributes[sExtensionField]) {
                        var oAttribute = oMetaData.nodes.Extension.attributes[sExtensionField];
                        aExtensionSorter.push({
                            TEXT : oMetaData.name + ".Extension." + oAttribute.name,
                            ACTION : oAttribute.name,
                            DEFAULT_ORDER : "ASC"
                        });
                    }
                });                
            }
        }
        return aExtensionSorter;
    };

    ExtensibilityMixin._extensibilityExtensionFilterItems = function(oFilterItemsLayout) {
        var that = this;
        var oCustomData = this.getView().data();
        if (!oCustomData["aofObject"] && this.getView().getContent().length > 0) {
            oCustomData = this.getView().getContent()[0].data();
        }
        if (oCustomData["aofObject"]) {
            var oMetaData = MetaModel.getApplicationObjectMetadata(oCustomData["aofObject"]);
            if (oMetaData.nodes.Extension) {
                jQuery.each(that.filterExtensionFields, function(iIndex, sExtensionField) {
                    if (sExtensionField === "_ID" || sExtensionField === "_OBJECT_TYPE_CODE") {
                        return;
                    }
                    if (oMetaData.nodes.Extension.attributes[sExtensionField]) {
                        var oAttribute = oMetaData.nodes.Extension.attributes[sExtensionField];
                        var sIsVisibleExpression = "{= ${user>/privileges/sap.ino.ui::backoffice.access} && ${view>/List/MANAGE} === true }"; 
                        var oControl;
                        
                        switch (oAttribute.dataType) {
                            case "TIMESTAMP":
                                // Timestamp type is not supported for filtering
                                oControl = null;
                                break;
                            case "DATE":
                                oControl = new DatePicker({
                                    visible : sIsVisibleExpression,
                                    width : "100%",
                                    value : "{view>/List/EXTENSION/" + oAttribute.name + "}",
                                    change : function(oEvent) {
                                        if (oEvent.getParameter("valid")) {
                                            oEvent.getSource().setValueState(ValueState.None);
                                            var sValue = oEvent.getSource().getDateValue();
                                            sValue = DateFormatter.format(sValue);
                                            that.setViewProperty("/List/EXTENSION/" + oAttribute.name, sValue);
                                            that.navigateIntern(that.getQuery(), true, true);
                                        } else {
                                            oEvent.getSource().setValueState(ValueState.Error);
                                        }
                                    }
                                });
                                break;
                            case "TINYINT":
                                oControl = new CheckBox({
                                    visible : sIsVisibleExpression,
                                    width : "100%",
                                    selected : {
                                        path : "view>/List/EXTENSION/" + oAttribute.name,
                                        formatter : function(vValue) {
                                            return vValue === 1 || vValue === "1";
                                        }
                                    },
                                    select : function(oEvent) {
                                        var bSelected = oEvent.getParameter("selected");
                                        that.setViewProperty("/List/EXTENSION/" + oAttribute.name, bSelected ? 1 : null);
                                        that.navigateIntern(that.getQuery(), true, true);
                                    }
                                });
                                break;
                            default:
                                oControl = new Input({
                                    visible : sIsVisibleExpression,
                                    value : "{view>/List/EXTENSION/" + oAttribute.name + "}",
                                    change : function(oEvent) {
                                        that.navigateIntern(that.getQuery(), true, true);
                                    },
                                    width : "100%"
                                });
                                break;                                
                        }
                        
                        if (oAttribute.foreignKeyTo && !!UIObjectConfig.getDefinition(oAttribute.foreignKeyTo)) {
                            // Foreign Key to object is not supported for filtering
                            oControl = null;
                        }
                        
                        if ((oAttribute.customProperties && oAttribute.customProperties.valueOptionList) || 
                            (oAttribute.foreignKeyTo && !UIObjectConfig.getDefinition(oAttribute.foreignKeyTo))) {
                            var sCode = oAttribute.foreignKeyTo;
                            if (oAttribute.customProperties && oAttribute.customProperties.valueOptionList) {
                                sCode = "sap.ino.xs.object.basis.ValueOptionList.Root_" + oAttribute.customProperties.valueOptionList;
                            }
                            oControl = new Select({
                                visible : sIsVisibleExpression,
                                selectedKey : "{view>/List/EXTENSION/" + oAttribute.name + "}",
                                change : function(oEvent) {
                                    that.navigateIntern(that.getQuery(), true, true);
                                },
                                items : {
                                    path : "code>/" + sCode,
                                    template : new ListItem({
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
                                    }),
                                    sorter: { path: 'CODE' },
                                    parameters : {
                                        includeEmptyCode : true
                                    }
                                },
                                width : "100%"
                            }); 
                        }
                        
                        if (oControl) {
                            oControl.addStyleClass("sapUiSmallMarginBottom");
                            var oLabel = new Label({
                                text : "{i18n>" + oMetaData.name + ".Extension." + oAttribute.name + "}",
                                visible : sIsVisibleExpression
                            });
                            if (oControl.addAriaLabelledBy) {
                                oControl.addAriaLabelledBy(oLabel);
                            }
                            oFilterItemsLayout.addContent(oLabel);
                            oFilterItemsLayout.addContent(oControl);
                        }                        
                    }
                });
            }
        }
    };

    return ExtensibilityMixin;
});