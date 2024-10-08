/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ino/commons/formatters/BaseListFormatter",
    "sap/m/GroupHeaderListItem",
    "sap/ui/base/Object"
], function(BaseListFormatter,
            GroupHeaderListItem,
            Object) {
    "use strict";
    
    var oListFormatter = Object.extend("sap.ino.commons.formatters.ListFormatter", {});
    
    jQuery.extend(oListFormatter, BaseListFormatter);
    
    oListFormatter.listThreshold = function(oSystem) {
        if (oSystem.desktop) {
            return 20;
        }
        else if (oSystem.tablet) {
            return 20;
        }
        else {
            return 10;
        }
    };
        
    oListFormatter.showFilter = function(sStatus, sPhase) {
        return !!(sStatus || sPhase);
    };

    return oListFormatter;
});