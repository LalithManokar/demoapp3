/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.object.SystemIntegration");
(function() {
    "use strict";

    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");
    
    function handleRead(oData) {
        if (oData.CREATE_REQ_JSON) {
            oData.CREATE_REQ_JSON = JSON.parse(oData.CREATE_REQ_JSON);
        }
        if (oData.CREATE_RES_JSON) {
            oData.CREATE_RES_JSON = JSON.parse(oData.CREATE_RES_JSON);
        }
        if (oData.FETCH_RES_JSON) {
            oData.FETCH_RES_JSON = JSON.parse(oData.FETCH_RES_JSON);
        }
        if (oData.FETCH_REQ_JSON) {
            oData.FETCH_REQ_JSON = JSON.parse(oData.FETCH_REQ_JSON);
        }
    }
    
    function handleNormalizeData(oData) {
        if (oData.CREATE_REQ_JSON) {
            oData.CREATE_REQ_JSON = JSON.stringify(oData.CREATE_REQ_JSON);
        }
        if (oData.CREATE_RES_JSON) {
            oData.CREATE_RES_JSON = JSON.stringify(oData.CREATE_RES_JSON);
        }
        if (oData.FETCH_RES_JSON) {
            oData.FETCH_RES_JSON = JSON.stringify(oData.FETCH_RES_JSON);
        }
        if (oData.FETCH_REQ_JSON) {
            oData.FETCH_REQ_JSON = JSON.stringify(oData.FETCH_REQ_JSON);
        }
        return oData;
    }

    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.SystemIntegration", {
        objectName : "sap.ino.xs.object.integration.SystemIntegration",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultODataSource("SystemIntegration"),
        determinations: {
            onRead: handleRead,
            onNormalizeData: handleNormalizeData
        }
    });
})();