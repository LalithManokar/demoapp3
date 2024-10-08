/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/json/JSONPropertyBinding",
    "sap/ino/commons/application/Configuration"
], function (JSONModel, JSONPropertyBinding, Configuration) {
    "use strict";

    var mApplicationObject = null;

    var MetaModel = JSONModel.extend("sap.ino.commons.models.aof.MetaModel", {
        metadata : {
            events : {
                "modelInitialized" : {}
            }
        }
    });

    MetaModel = new MetaModel({});

    // the intention is to make the metadata cacheable in future
    var fnGetMetadata = getBackendMetadata;

    // !Attention *getMetadata* is already in use by SAPUI5
    MetaModel.getApplicationObjectMetadata = function(sObjectName, fnResult) {
        if (!MetaModel.getProperty("/" + sObjectName)) {
            fnGetMetadata(sObjectName, function(oMetadata) {
                var oMappedMetadata = mapMetadata(oMetadata);
                MetaModel.setProperty("/" + sObjectName, oMappedMetadata);
                if (fnResult) {
                    fnResult(oMappedMetadata);
                    // Avoid triggering result function and event again, in case the metadata are fetched synchronously 
                    fnResult = undefined;
                }
                MetaModel.fireEvent("modelInitialized");
            });
        }

        var oMetadata = MetaModel.getProperty("/" + sObjectName);
        if (fnResult) {
            fnResult(oMetadata);
            MetaModel.fireEvent("modelInitialized");
        }
        return oMetadata;
    };

    MetaModel.bindProperty = function(sPath, oContext, mParameters) {
        if (sPath) {
            var aPaths = sPath.split("/");
            if (aPaths.length > 2) {
                var sObjectName = aPaths[1];
                // this method loads object metadata lazy
                MetaModel.getApplicationObjectMetadata(sObjectName);
            }
        }
        var oBinding = new JSONPropertyBinding(this, sPath, oContext, mParameters);
        return oBinding;
    };

    MetaModel.getEndpoint = function(sApplicationObjectName) {
        var sBackendRootURL = Configuration.getBackendRootURL();
        if (!mApplicationObject) {
            mApplicationObject = Configuration.getApplicationObjects();
        }
        return sBackendRootURL + mApplicationObject[sApplicationObjectName];
    };
    
    MetaModel.getBackendAllMetadata = function() {
		if (Configuration.isDevelopmentEnv()) {
			return;
		}
		var currentModelMeta;
		var sURL = Configuration.getBackendRootURL() + "/sap/ino/ngui/build/resources/sap/ino/corelib/allmetadata.json";
		var oMetadataRequest = jQuery.ajax({
			url: sURL,
			async: false,
			datatype: "json"
		});

		oMetadataRequest.done(function(oMetadatas) {
			for (var index = 0, length = oMetadatas.length; index <= length - 1; index++) {
			    currentModelMeta = oMetadatas[index].name;
				if (currentModelMeta && !MetaModel.getProperty("/" + currentModelMeta)) {
					var oMappedMetadata = mapMetadata(oMetadatas[index]);
					MetaModel.setProperty("/" + currentModelMeta, oMappedMetadata);
				}
			}
		});
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
    
    return MetaModel;
});
