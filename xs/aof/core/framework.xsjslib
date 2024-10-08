var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var Metadata = $.import("sap.ino.xs.aof.core", "metadata");
var Runtime = $.import("sap.ino.xs.aof.core", "runtime");
var Message = $.import("sap.ino.xs.aof.lib", "message");
var DB = $.import("sap.ino.xs.aof.core", "db");
var Auth = $.import("sap.ino.xs.aof.core", "authorization");

function getTransaction() {
    return DB.Transaction;
}

function getHQ() {
    return DB.getHQ();
}

this.ObjectType = _.clone(Metadata.ObjectType);
this.DataType = _.clone(Metadata.DataType);
this.Node = _.clone(Metadata.Node);
this.MessageSeverity = _.clone(Message.MessageSeverity);
this.Action = _.clone(Metadata.Action);
this.Messages = _.clone(Runtime.Messages);

this.bDisableExtensions = false;
function disableExtensions() {
    this.bDisableExtensions = true;
}

function setDefaultSchema(sDefaultSchema) {
    DB.setDefaultSchema(sDefaultSchema);
}

var getMetadata = _.memoize(function(sObjectName) {

    // if not existing application object meta data is not there yet
    // load the corresponding library which should defined the application object
    var oCoreLibrary = _loadApplicationObjectLibrary(sObjectName);

    if (oCoreLibrary.definition) {
        var oExtensionLibrary;
        if (true === oCoreLibrary.definition.isExtensible && !this.bDisableExtensions) {
            oExtensionLibrary = _loadApplicationObjectExtensionLibrary(sObjectName);
        }

        var oMetadata = Metadata.getMetadata(sObjectName, oCoreLibrary.definition, oExtensionLibrary && oExtensionLibrary.definition);
        oMetadata.getApplicationObject = function() {
            return getApplicationObject(sObjectName);
        };
        return oMetadata;
    }

    _.raiseException("Application object " + sObjectName + " not defined");
    return undefined;
});

var getApplicationObject = _.memoize(function(sObjectName, bPrivilegedAuthMode) {
    var oMetadata = getMetadata(sObjectName);
    var oRuntime = Runtime.getObjectFacade(oMetadata, bPrivilegedAuthMode);
    oRuntime.getMetadata = function() {
        return oMetadata;
    };
    return oRuntime;
}, function(sObjectName, bPrivilegedAuthMode) {
    return sObjectName + "-" + bPrivilegedAuthMode;
});

// Naming convention is that the Application Object needs
// to reside in a library with the same name (including package)
function _loadApplicationObjectLibrary(sObjectName) {
    try {
        var oObjectLocation = _.splitObjectPath(sObjectName);
        var oLibrary = $.import(oObjectLocation.packageName, oObjectLocation.objectName);
        return oLibrary;

    } catch (oImportException) {
        if (oImportException.message) {
            oImportException.message = oImportException.message.trim() + ": " + sObjectName;
        }
        _.raiseException(oImportException);
    }

    return undefined;
}

function _loadApplicationObjectExtensionLibrary(sObjectName) {
    var oObjectLocation = _.splitObjectPath(sObjectName);

    var oHQ = DB.getHQ();
    var aPackage = oHQ.statement('select EXT_PACKAGE_ID from "sap.ino.db.basis::t_package_extension" where base_package_id = ?').execute(oObjectLocation.packageName);
    if (!aPackage || aPackage.length === 0) {
        return undefined;
    }

    if (aPackage.length > 1) {
        _.raiseException(sObjectName + " can only be extended once.");
    }

    var sExtensionPackageName = aPackage[0].EXT_PACKAGE_ID;
    try {
        var oLibrary = $.import(sExtensionPackageName, oObjectLocation.objectName);
        return oLibrary;
    } catch (oImportException) {
        var bIsNotFoundException = oImportException.message.trim() === "import: failed to load the library";
        if (bIsNotFoundException) {
            return undefined;
        }
        _.raiseException(oImportException);
    }

    return undefined;
}