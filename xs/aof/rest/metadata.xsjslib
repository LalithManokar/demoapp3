var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var DB = $.import("sap.ino.xs.aof.core", "db");

function handleRequest() {
    return TraceWrapper.wrap_request_handler(function() {
        return _handleRequest($.request, $.response);
    });
}

function getMetadata(sObjectName) {
    var oMetadata = AOF.getMetadata(sObjectName);
    if (!oMetadata) {
        return undefined;
    }
    var aNodeMetadata = oMetadata.getAllNodeMetadata();

    var oMetadataResult = oMetadata.getObjectMetadata();
    oMetadataResult.nodes = _.indexBy(_.map(aNodeMetadata, function(oNodeMetadata) {
        var oNodeMetadataResult = _.pick(oNodeMetadata, 'name', 'readOnly', 'primaryKey', 'parentNode',
                'customProperties', 'nameAttribute');
        oNodeMetadataResult.attributes = _.mapObjects(oNodeMetadata.attributes, function(oAttributeMetadata) {
            return _.pick(oAttributeMetadata, 'name', 'dataType', 'readOnly', 'maxLength', 'isPrimaryKey', 'required',
                    'minValue', 'maxValue', 'foreignKeyTo', 'customProperties', 'concurrencyControl');
        });
        return oNodeMetadataResult;
    }), "name");

    var aActionMetadata = _.where(oMetadata.getActions(), {
        isInternal : false
    });
    oMetadataResult.actions = _.indexBy(_.map(aActionMetadata, function(oActionMetadata) {
        return _.pick(oActionMetadata, 'name', 'customProperties', 'isStatic', 'isMassAction', 'isFrameworkAction', 'impacts');
    }), 'name');
    return oMetadataResult;
}

function getAllMetadata() {
    var aMetadata = [];
    var oHQ = DB.getHQ();
    var aObjects = oHQ.statement('select name from "sap.ino.db.aof::t_application_object"').execute();
    _.each(aObjects, function(oObject) {
        aMetadata.push(getMetadata(oObject.NAME));
    });
    return aMetadata;
}

var _handleRequest = function(oRequest, oResponse) {
    var sObjectName = oRequest.queryPath;
    if (sObjectName) {
        var oMetadata = getMetadata(sObjectName);
        if (oMetadata) {
            oResponse.status = $.net.http.OK;
            oResponse.contentType = "application/json";
            oResponse.cacheControl = "public, max-age=3600";
            oResponse.setBody(JSON.stringify(oMetadata));
        } else {
            oResponse.status = $.net.http.NOT_FOUND;
        }    
    }
    else {
        var aMetadata = getAllMetadata();
        oResponse.status = $.net.http.OK;
        oResponse.contentType = "application/json";
        oResponse.cacheControl = "public, max-age=3600";
        oResponse.setBody(JSON.stringify(aMetadata));
    }
};
