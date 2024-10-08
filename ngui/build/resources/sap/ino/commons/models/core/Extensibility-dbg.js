/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([], function() {
    "use strict";
    return {
        initExtensionNode : function(oData, sExtensionNodeName, oObjectInstance) {
            var oMetadata = oObjectInstance.getApplicationObjectMetadata();
            if (!oData[sExtensionNodeName] || oData[sExtensionNodeName].length === 0) {
                oData[sExtensionNodeName] = [{}];
            }
            var oExtension = oData[sExtensionNodeName][0];
            jQuery.each(oMetadata.nodes[sExtensionNodeName].attributes, function(sAttributeName, oAttributeMetadata) {
                if (!oAttributeMetadata.readOnly && sAttributeName != "_ID" && oExtension[sAttributeName] === undefined) {
                    oExtension[sAttributeName] = null;
                }
                if ((oExtension[sAttributeName] === null || oExtension[sAttributeName] === undefined) && 
                    !oAttributeMetadata.required && 
                    !(oAttributeMetadata.customProperties && oAttributeMetadata.customProperties.valueOptionList) && 
                    !oAttributeMetadata.foreignKeyTo) {
                    if (oAttributeMetadata.dataType === "INTEGER") {
                        oExtension[sAttributeName] = oAttributeMetadata.minValue !== undefined ? oAttributeMetadata.minValue : 0;  
                    } else if (oAttributeMetadata.dataType === "DOUBLE") {
                        oExtension[sAttributeName] = oAttributeMetadata.minValue !== undefined ? oAttributeMetadata.minValue : 0.0;
                    }
                }
            });
            return oData;
        }
    };
});