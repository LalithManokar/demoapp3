var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var trace = $.import("sap.ino.xs.xslib", "trace");

function debug(sLine) {
    trace.debug("sap.ino.xs.xslib.repo", sLine);
}

var packageExists = _.wrap(packageExistsInternal, connection);
var hasPackageReadAuthorization = _.wrap(hasPackageReadAuthorizationInternal, connection);
var getFiles = _.wrap(getFilesInternal, connection);
var fileExists = _.wrap(fileExistsInternal, connection);
var readFile = _.wrap(readFileInternal, connection);
var readImage = _.wrap(readImageInternal, connection);
var upsertFiles = _.wrap(upsertFilesInternal, connection);
var deleteFile = _.wrap(deleteFileInternal, connection);

var packageExistsSQLCC = _.wrap(packageExistsInternal, sqlccConnection);
var hasPackageReadAuthorizationSQLCC = _.wrap(hasPackageReadAuthorizationInternal, sqlccConnection);
var getFilesSQLCC = _.wrap(getFilesInternal, sqlccConnection);
var fileExistsSQLCC = _.wrap(fileExistsInternal, sqlccConnection);
var readFileSQLCC = _.wrap(readFileInternal, sqlccConnection);
var readImageSQLCC = _.wrap(readImageInternal, sqlccConnection);
var upsertFilesSQLCC = _.wrap(upsertFilesInternal, sqlccConnection);
var deleteFileSQLCC = _.wrap(deleteFileInternal, sqlccConnection);

function readBinaryDataInternal(sPackage, sName, sType, oConnection) {
    if(arguments.length === 2) {
        sPackage = arguments[0].package;
        sName = arguments[0].name;
        sType = arguments[0].type;
        oConnection = arguments[1];
    }

    var oObjectId = $.repo.createObjectId("", sPackage, sName, sType);
    var oActiveSession = $.repo.createActiveSession(oConnection);
    var oFileContent = $.repo.readObject(oActiveSession, oObjectId);

    return oFileContent;
}

function readFileInternal() {
    var oFileContent = readBinaryDataInternal.apply(this, arguments);

    if (!oFileContent) {
        return null;
    }

    if (oFileContent.bdata !== undefined && oFileContent.bdata.byteLength > 0) {
        return String.fromCharCode.apply(null, new Uint8Array(oFileContent.bdata));
    } else {
        return oFileContent.cdata;
    }
}

//do not convert the binary data to string.
function readImageInternal(sPackage, sName, sType, oConnection) {
    var oFileContent = readBinaryDataInternal.apply(this, arguments);

    if (!oFileContent) {
        return null;
    }

    return oFileContent.bdata;
}

function getFilesInternal(sPackage, oFilter, oConnection) {
    var oActiveSession = $.repo.createActiveSession(oConnection);
    var oObjectFilter = $.repo.createObjectFilter("", sPackage, "*", "*", "*", [oFilter.type]);
    var aFiles = $.repo.findObjects(oActiveSession, oObjectFilter, 1, 0);
    return _.map(aFiles, function(oFile) {
        return {
            package : oFile.objectID.package,
            name : oFile.objectID.name,
            type : oFile.objectID.stype
        };
    });
}

function hasPackageReadAuthorizationInternal(sPackage, oConnection) {
    var oActiveSession = $.repo.createActiveSession(oConnection);
    // TODO change this to $.repo.checkAuthorization once it is there
    return $.repo.existsPackage(oActiveSession, "", sPackage);
}

function packageExistsInternal(sPackage, oConnection) {
    var oActiveSession = $.repo.createActiveSession(oConnection);
    return $.repo.existsPackage(oActiveSession, "", sPackage);
}

function fileExistsInternal(sPackage, sFileName, sType, oConnection) {
    var oActiveSession = $.repo.createActiveSession(oConnection);
    var oObjectFilter = $.repo.createObjectFilter("", sPackage, "*", "*", "*", [sType]);
    var aFiles = $.repo.findObjects(oActiveSession, oObjectFilter, 1, 0);
    var oResult = _.find(aFiles, function(oFile) {
        return oFile.objectID.name === sFileName;
    });
    return oResult === undefined ? false : true;
}

// upsert of files in repository - all or nothing
function upsertFilesInternal(aFiles, oConnection) {
    if (!aFiles || aFiles.length === 0) {
        return;
    }

    var oInactiveSession = $.repo.createInactiveSession(oConnection, "");
    var oActiveSession = $.repo.createActiveSession(oConnection);
    var aObjectsToActivate = [];

    _.each(aFiles, function(oFile) {
        var oObjectId = $.repo.createObjectId("", oFile.package, oFile.name, oFile.type);
        var oMetadata = $.repo.readObjectMetadata(oActiveSession, oObjectId);
        if (!oMetadata) {
            oMetadata = $.repo.createInactiveMetadata();
        }

        if(oFile.isBinary) {
            oMetadata = $.repo.writeObject(oInactiveSession, oObjectId, oMetadata, "", oFile.content);
        } else {
            oMetadata = $.repo.writeObject(oInactiveSession, oObjectId, oMetadata, oFile.content);
        }
        if (oInactiveSession.errorCode) {
            debug("Write error: " + JSON.stringify(oInactiveSession.errorMsg));
            throw new RepositoryError(oInactiveSession.errorMsg, oInactiveSession.errorCode);
        }
        aObjectsToActivate.push(oObjectId);
    });

    // Intermediary commit is necessary, so that inactive objects can be activated
    oConnection.commit();

    if (aObjectsToActivate.length > 0) {
        var oActivationResult = $.repo.activateObjects(oInactiveSession, aObjectsToActivate, $.repo.ACTIVATION_CASCADE_ONE_PHASE);
        if (oInactiveSession.errorCode) {
            var sErrorMsg = oInactiveSession.errorMsg;
            var sErrorCode = oInactiveSession.errorCode;
            debug("Activation error: " + JSON.stringify(oActivationResult));

            // make sure no inactive objects remain which cause trouble for next calls
            $.repo.revertObjects(oInactiveSession, aObjectsToActivate);
            oConnection.commit();

            throw new RepositoryError(sErrorMsg, sErrorCode);
        }
        oConnection.commit();
    }
}

function deleteFileInternal(sPackage, sName, sType, oConnection) {
    if(arguments.length === 2) {
        sPackage = arguments[0].package;
        sName = arguments[0].name;
        sType = arguments[0].type;
        oConnection = arguments[1];
    }

    var oObjectId = $.repo.createObjectId("", sPackage, sName, sType);
    var oInactiveSession = $.repo.createInactiveSession(oConnection, "");
    
    $.repo.deleteObject(oInactiveSession, oObjectId);
    oConnection.commit();
    
    var oActivationResult = $.repo.activateObjects(oInactiveSession, [oObjectId], $.repo.ACTIVATION_CASCADE_ONE_PHASE);
    if (oInactiveSession.errorCode) {
        var sErrorMsg = oInactiveSession.errorMsg;
        var sErrorCode = oInactiveSession.errorCode;
        debug("Activation error: " + JSON.stringify(oActivationResult));

        // make sure no inactive objects remain which cause trouble for next calls
        $.repo.revertObjects(oInactiveSession, [oObjectId]);
        oConnection.commit();

        throw new RepositoryError(sErrorMsg, sErrorCode);
    }
    oConnection.commit();
}

function sqlccConnection(fnFunction) {
    var aArgs = _.toArray(arguments).slice(1);
    var oConnection = _.last(aArgs);
    try {
        return fnFunction.apply(this, aArgs);
    } finally {
        if (oConnection) {
            oConnection.rollback();
        }
    }
}

function connection(fnFunction) {
    var oConnection;
    try {
        var aArgs = _.toArray(arguments).slice(1);
        oConnection = $.db.getConnection($.db.isolation.SERIALIZABLE);
        aArgs.push(oConnection);
        return fnFunction.apply(this, aArgs);
    } finally {
        if (oConnection) {
            oConnection.rollback();
            oConnection.close();
        }
    }
}

function RepositoryError(sMessage, sErrorCode) {
    Error.call(this, sMessage);
    this.errorCode = sErrorCode;
    this.message = sMessage;
}

RepositoryError.prototype = Object.create(Error.prototype);
RepositoryError.prototype.constructor = RepositoryError;
