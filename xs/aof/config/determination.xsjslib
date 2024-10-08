var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var util = $.import("sap.ino.xs.aof.config", "util");
var activation = $.import("sap.ino.xs.aof.config", "activation");
var check = $.import("sap.ino.xs.aof.config", "check");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var ConfigMessage = $.import("sap.ino.xs.aof.config", "message");

function determineConfigPackage(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext) {
    var oConfigPackage = util.getConfigPackage(oContext.getHQ());
    oWorkObject.PACKAGE_ID = oConfigPackage ? oConfigPackage.PACKAGE_ID : undefined;
}

function determinePackageAndCode(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext) {
    var oConfigPackage = util.getConfigPackage(oContext.getHQ());
    if (!oConfigPackage) {
        return;
    }
    oWorkObject.PACKAGE_ID = oConfigPackage.PACKAGE_ID;
    oWorkObject.CODE = util.getFullCode(oConfigPackage.PACKAGE_ID, oWorkObject.PLAIN_CODE);
}

function activateContent(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext, oNodeMetadata) {
    // make really sure the config package is there AND it is the top most one (included in getConfigPackage)
    var oConfigPackage = util.getConfigPackage(oContext.getHQ());
    if (!oConfigPackage) {
        addMessage(Message.MessageSeverity.Error, ConfigMessage.CONFIG_NOT_ENABLED);
        return;
    }

    activation.activateSingleInstanceUnchecked(oWorkObject, oPersistedObject, oNodeMetadata.objectMetadata, addMessage, oContext);
}