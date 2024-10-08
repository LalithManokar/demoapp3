/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.extensions.sap.ui.model.odata.ODataTreeBinding");
jQuery.sap.require("sap.ui.model.odata.ODataTreeBinding");

(function() {
    "use strict";

var _loadSubNodes = sap.ui.model.odata.ODataTreeBinding.prototype._loadSubNodes;
sap.ui.model.odata.ODataTreeBinding.prototype._loadSubNodes = function(sNodeId, iStartIndex, iLength, iThreshold, aParams, mParameters) {
    if (iLength === Number.MAX_VALUE) {
        iLength = 999999999; // Max number XSOData can take
    }
    return _loadSubNodes.apply(this, [sNodeId, iStartIndex, iLength, iThreshold, aParams, mParameters]);
}

})();