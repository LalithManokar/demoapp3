var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var Message = $.import("sap.ino.xs.aof.lib", "message");
var ConfigMessage = $.import("sap.ino.xs.aof.config", "message");
var util = $.import("sap.ino.xs.aof.config", "util");

function configEnabledCheck(vKey, oObject, addMessage, oContext) {
    var oConfigPackage = util.getConfigPackage(oContext.getHQ());
    if (!oConfigPackage) {
        addMessage(Message.MessageSeverity.Error, ConfigMessage.CONFIG_NOT_ENABLED);
        return;
    }

    if (oObject && oObject.PACKAGE_ID && oConfigPackage.PACKAGE_ID != oObject.PACKAGE_ID) {
        addMessage(Message.MessageSeverity.Error, ConfigMessage.CONFIG_DIFFERENT_PACKAGE, vKey, 'Root', 'PACKAGE_ID', oConfigPackage.PACKAGE_ID, oObject.PACKAGE_ID);
    }
}

function configAvailableCheck(vKey, oObject, addMessage, oContext) {
    var oConfigPackage = util.getConfigPackage(oContext.getHQ());
    if (!oConfigPackage) {
        addMessage(Message.MessageSeverity.Error, ConfigMessage.CONFIG_NOT_ENABLED, vKey, 'Root', 'PACKAGE_ID');
        return;
    }
}

function validPlainCodeCheck(vKey, oAttribute, addMessage, oContext, oNodeMetadata) {
    if (!oAttribute.value || oAttribute.value.indexOf(".") != -1 || oAttribute.value.indexOf(" ") != -1 || !_.isASCII(oAttribute.value)) {
        addMessage(Message.MessageSeverity.Error, ConfigMessage.CONFIG_INVALID_PLAIN_CODE, vKey, oNodeMetadata.name,
                "PLAIN_CODE", oAttribute.value || undefined);
    }
}
