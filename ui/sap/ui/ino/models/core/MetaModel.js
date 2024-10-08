/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.core.MetaModel");

(function() {
    "use strict";

    jQuery.sap.require("sap.ui.ino.application.Configuration");
    var Configuration = sap.ui.ino.application.Configuration;

    var mApplicationObject = null;

    sap.ui.model.json.JSONModel.extend("sap.ui.ino.models.core.MetaModel", {
        metadata : {
            events : {
                "modelInitialized" : {}
            }
        },
    });

    var oSelf = new sap.ui.ino.models.core.MetaModel({});
    sap.ui.ino.models.core.MetaModel = oSelf;

    // the intention is to make the metadata cacheable in future
    var fnGetMetadata = getBackendMetadata;

    // !Attention *getMetadata* is already in use by SAPUI5
    sap.ui.ino.models.core.MetaModel.getApplicationObjectMetadata = function(sObjectName, fnResult) {
        if (!oSelf.getProperty("/" + sObjectName)) {
            fnGetMetadata(sObjectName, function(oMetadata) {
                var oMappedMetadata = mapMetadata(oMetadata);
                oSelf.setProperty("/" + sObjectName, oMappedMetadata);
                if (fnResult) {
                    fnResult(oMappedMetadata);
                    // Avoid triggering result function and event again, in case the metadata are fetched synchronously 
                    fnResult = undefined;
                }
                oSelf.fireEvent("modelInitialized");
            });
        }

        var oMetadata = oSelf.getProperty("/" + sObjectName);
        if (fnResult) {
            fnResult(oMetadata);
            oSelf.fireEvent("modelInitialized");
        };
        return oMetadata;
    };

    sap.ui.ino.models.core.MetaModel.bindProperty = function(sPath, oContext, mParameters) {
        if (sPath) {
            var aPaths = sPath.split("/");
            if (aPaths.length > 2) {
                var sObjectName = aPaths[1];
                // this method loads object metadata lazy
                oSelf.getApplicationObjectMetadata(sObjectName);
            }
        }
        var oBinding = new sap.ui.model.json.JSONPropertyBinding(this, sPath, oContext, mParameters);
        return oBinding;
    };

    sap.ui.ino.models.core.MetaModel.getEndpoint = function(sApplicationObjectName) {
        var sBackendRootURL = Configuration.getBackendRootURL();
        if (!mApplicationObject) {
            mApplicationObject = Configuration.getApplicationObjects();
        }
        return sBackendRootURL + mApplicationObject[sApplicationObjectName];
    };

    function mapMetadata(oMetadata) {
        // "changeable" as additional metadata
        // as reverse to readOnly as this fits better
        // for binding controls "editable" property
        jQuery.each(oMetadata.nodes, function(sNodeName, oNode) {
            jQuery.each(oNode.attributes, function(sAttributeName, oAttribute) {
                oAttribute.changeable = !oAttribute.readOnly;
            });
        });

        return oMetadata;
    }

    function getBackendMetadata(sObjectName, fnSuccess) {
        var sURL = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/static/meta.xsjs/" + sObjectName;
        var oMetadataRequest = jQuery.ajax({
            url : sURL,
            async : false,
            datatype : "json"
        });

        oMetadataRequest.done(function(oMetadata) {
            fnSuccess(oMetadata);
        });
    }

}());