/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.views.common.ExtensionPointHelper");

(function() {
    "use strict";

    sap.ui.ino.views.common.ExtensionPointHelper = {

        findCustomData : function(aCustomData, sProperty) {
            if (aCustomData && aCustomData.length > 0) {
                var aFilteredData = jQuery.grep(aCustomData, function(o, i) {
                    return o.getKey() == sProperty;
                });
                return aFilteredData.length > 0 ? aFilteredData[0].getValue() : undefined;
            }
            return undefined;
        },

        handleExtensionFields : function(oExtension, fnStartExtensionSection, fnExtensionField, fnEndExtensionSection) {
            if (oExtension) {
                if (jQuery.isArray(oExtension)) {
                    if (oExtension.length > 0) {
                        if (fnStartExtensionSection) {
                            fnStartExtensionSection(oExtension.length);
                        }
                        if (fnExtensionField) {
                            for (var i = 0; i < oExtension.length; i++) {
                                if (oExtension[i]) {
                                    fnExtensionField(oExtension[i]);
                                }
                            }
                        }
                        if (fnEndExtensionSection) {
                            fnEndExtensionSection(oExtension.length);
                        }
                    }
                } else {
                    if (fnStartExtensionSection) {
                        fnStartExtensionSection(1);
                    }
                    if (fnExtensionField) {
                        fnExtensionField(oExtension);
                    }
                    if (fnEndExtensionSection) {
                        fnEndExtensionSection(1);
                    }
                }
            }
        },

        getFacetExtensionThingGroup : function(oExtension) {
            if (oExtension) {
                var oContent = undefined;
                sap.ui.ino.views.common.ExtensionPointHelper.handleExtensionFields(oExtension, function(iCount) {
                    if (iCount > 1) {
                        if (sap.ui.commons) {
                            oContent = new sap.ui.commons.layout.MatrixLayout();
                        } else {
                            return undefined;
                        }
                    }
                }, function(oExtensionField) {
                    if (!oContent) {
                        oContent = oExtensionField;
                    } else {
                        if (sap.ui.commons && oContent) {
                            oContent.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
                                cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                                    content : oExtensionField
                                })]
                            }));
                        } else {
                            return undefined;
                        }
                    }
                });
                if (oContent) {
                    return new sap.ui.ux3.ThingGroup({
                        content : oContent
                    });
                }
            }
            return undefined;
        },

        getListExtensionColumns : function(oExtension) {
            var aExtColumn = [];
            if (oExtension) {
                sap.ui.ino.views.common.ExtensionPointHelper.handleExtensionFields(oExtension, undefined, function(
                        oExtensionField) {
                    aExtColumn.push(oExtensionField);
                });
                aExtColumn.sort(function(a, b) {
                    var aColumnIndex = sap.ui.ino.views.common.ExtensionPointHelper.findCustomData(a.getCustomData(),
                            "columnIndex");
                    var bColumnIndex = sap.ui.ino.views.common.ExtensionPointHelper.findCustomData(b.getCustomData(),
                            "columnIndex");
                    if (aColumnIndex != undefined && bColumnIndex != undefined) {
                        return aColumnIndex - bColumnIndex;
                    } else {
                        if (aColumnIndex != undefined) {
                            return -1;
                        } else if (bColumnIndex != undefined) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                });
            }
            return aExtColumn;
        }
    };
})();