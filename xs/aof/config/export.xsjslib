var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var ContentType = {
    Plain : "text/plain",
    JSON : "application/json"
};

var csvParser = $.import("sap.ino.xs.xslib", "csvParser");
var repo = $.import("sap.ino.xsdc.xslib", "repo");

var AOF = $.import("sap.ino.xs.aof.core", "framework");
var ObjectType = AOF.ObjectType;
var Node = AOF.Node;
var meta = $.import("sap.ino.xs.aof.core", "metadata");
var db = $.import("sap.ino.xs.aof.core", "db");
var message = $.import("sap.ino.xs.aof.lib", "message");
var MessageSeverity = message.MessageSeverity;

var confMessage = $.import("sap.ino.xs.aof.config", "message");
var util = $.import("sap.ino.xs.aof.config", "util");

function handleRequest() {
    return TraceWrapper.wrap_request_handler(function() {
        return _handleRequest($.request, $.response);
    });
}

function _handleRequest(oRequest, oResponse) {
    if (oRequest.method !== $.net.http.PUT && oRequest.method !== $.net.http.POST) {
        oResponse.status = $.net.http.METHOD_NOT_ALLOWED;
        oResponse.contentType = ContentType.Plain;
        oResponse.setBody("Method not supported");
        return;
    }

    var oMsgBuf = message.createMessageBuffer();
    var oHQ = $.import("sap.ino.xs.xslib", "dbConnection").getHQ();
    try {
        var vResult = _exportContent(oHQ, oMsgBuf);
        if (oMsgBuf.getMinSeverity() <= MessageSeverity.Error) {
            oResponse.status = $.net.http.BAD_REQUEST;
            oResponse.contentType = ContentType.JSON;
            oResponse.setBody(JSON.stringify(oMsgBuf.getMessages()));
            oHQ.getConnection().rollback();
        } else {
            oResponse.status = $.net.http.OK;
            oResponse.contentType = ContentType.JSON;
            oResponse.setBody(JSON.stringify(vResult));
            oHQ.getConnection().commit();
        }
    } catch (oException) {
        oResponse.status = $.net.http.INTERNAL_SERVER_ERROR;
        oHQ.getConnection().rollback();
        throw oException;
    }
}

function _exportContent(oHQ, oMsgBuf) {
    var oPackage = util.getConfigPackage(oHQ);
    if (!oPackage) {
        oMsgBuf.addMessage(MessageSeverity.Fatal, confMessage.CONFIG_NOT_ENABLED);
        return undefined;
    }

    var sPackageId = oPackage.PACKAGE_ID;

    var aStageObject = util.getObjectOfType(ObjectType.Stage, oHQ, oMsgBuf);
    var aStageToExport = _.filter(aStageObject, _isContentExportable);

    var aExportFiles = _.flatten(_.map(aStageToExport, function(oStageObject) {
        var sConfigObjectName = util.getConfigObjectName(oStageObject.getObjectMetadata().name);
        var oConfigObjectMetadata = AOF.getMetadata(sConfigObjectName);
        return _.map(oStageObject.getAllNodeMetadata(), function(oStageNodeMetadata) {
            var oConfigNodeMetadata = oConfigObjectMetadata.getNodeMetadata(oStageNodeMetadata.name);
            if (!oConfigNodeMetadata) {
                // Fatal message to immediately stop import
                oMsgBuf.addMessage(MessageSeverity.Fatal, confMessage.CONFIG_NODE_MISSING, undefined, undefined, undefined, oStageNodeMetadata.name, sConfigObjectName);
                return undefined;
            }
            return _getExportFiles(oStageNodeMetadata, oConfigNodeMetadata, sPackageId, oHQ, oMsgBuf);
        });
    }));

    repo.upsertFiles(aExportFiles);
    return aExportFiles;
}

function _isContentExportable(oStageObject) {
    var oStageRoot = oStageObject.getNodeMetadata(Node.Root);
    return oStageRoot.customProperties && (oStageRoot.customProperties.contentOnlyInRepository === false);
}

function _getExportFiles(oStageNodeMetadata, oConfigNodeMetadata, sPackageId, oHQ, oMsgBuf) {
    var aResult = [];

    if (!oStageNodeMetadata.customProperties || !oStageNodeMetadata.customProperties.fileName) {
        // Fatal message to immediately stop import
        oMsgBuf.addMessage(MessageSeverity.Fatal, confMessage.CONFIG_FILE_MISSING, undefined, undefined, undefined, oStageNodeMetadata.qualifiedName);
        return aResult;
    }

    var aStageObjectNodeInstances = _readContent(oStageNodeMetadata, sPackageId, oHQ);
    var aExportColumns = oConfigNodeMetadata.persistedAttributes;
    var oCSVFile = {
        package : sPackageId,
        name : oStageNodeMetadata.customProperties.fileName,
        type : "csv",
        content : _toCSV(aStageObjectNodeInstances, aExportColumns)
    };
    aResult.push(oCSVFile);

    // Only continue when a text bundle exists
    if (!oConfigNodeMetadata.customProperties || !oConfigNodeMetadata.customProperties.codeTextBundle) {
        return aResult;
    }

    var sTextBundleName = _.last(oConfigNodeMetadata.customProperties.codeTextBundle.split("::"));
    if (!sTextBundleName) {
        oMsgBuf.addMessage(MessageSeverity.Fatal, confMessage.CONFIG_TEXT_BUNDLE_MISSING, undefined, undefined, undefined, oConfigNodeMetadata.qualifiedName);
        return aResult;
    }

    var oTextBundleFile = {
        package : sPackageId,
        name : sTextBundleName,
        type : "hdbtextbundle",
        content : _toTextBundle(aStageObjectNodeInstances)
    };
    aResult.push(oTextBundleFile);

    return aResult;
}

function _readContent(oStageNodeMetadata, sPackageId, oHQ) {
    var aContent = oHQ.statement('select * from "' + oStageNodeMetadata.table + '" where package_id = ?').execute(sPackageId);
    return db.mapNodeSelectResult(aContent, oStageNodeMetadata);
}

function _toCSV(aStageObjectNodeInstances, aColumns) {
    var aContent = csvParser.objectArrayToNestedArray(aStageObjectNodeInstances, aColumns);
    aContent = [aColumns].concat(aContent);
    return csvParser.generate(aContent, ";");
}

function _toTextBundle(aStageObjectNodeInstances) {
    var sResult = '# TRANSLATE\n';

    _.each(aStageObjectNodeInstances, function(oStageObjectNodeInstance) {
        var sCode = oStageObjectNodeInstance.CODE;
        if (!sCode) {
            return;
        }

        if (oStageObjectNodeInstance.DEFAULT_TEXT) {
            sResult += '# XTXT, 100\n';
            sResult += sCode + '=' + oStageObjectNodeInstance.DEFAULT_TEXT + '\n';
        }

        if (oStageObjectNodeInstance.DEFAULT_LONG_TEXT) {
            sResult += '# XTXT, 300\n';
            sResult += sCode + '_LONG=' + oStageObjectNodeInstance.DEFAULT_LONG_TEXT + '\n';
        }
    });

    return sResult;
}