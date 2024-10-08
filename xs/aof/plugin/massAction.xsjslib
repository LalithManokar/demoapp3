var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var Message = $.import("sap.ino.xs.aof.lib", "message");

function enhanceDefinition(oMetadata) {
    _.each(oMetadata.actions, function(oAction, sActionName) {
        if (oAction.massActionName) {
            if (oMetadata.actions[oAction.massActionName]) {
                _.raiseException("Mass action '" + oAction.massActionName + "' conflicts with standard action");
            }
            if (oAction.massActionName && oAction.isStatic) {
                _.raiseException("Mass action '" + oAction.massActionName + "' is not allowed for static action");
            }
            oMetadata.actions[oAction.massActionName] = {};
            oMetadata.actions[oAction.massActionName].name = oAction.massActionName;
            oMetadata.actions[oAction.massActionName].isFrameworkAction = false;
            oMetadata.actions[oAction.massActionName].isInternal = false;
            oMetadata.actions[oAction.massActionName].isStatic = true;
            oMetadata.actions[oAction.massActionName].isMassAction = true;
            oMetadata.actions[oAction.massActionName].authorizationCheck = false;
            oMetadata.actions[oAction.massActionName].historyEvent = oAction.historyEvent;
            oMetadata.actions[oAction.massActionName].impacts = oAction.impacts;
            if (_.isPlainObject(oAction.customProperties)) {
            	oMetadata.actions[oAction.massActionName].customProperties = _.clone(oAction.customProperties);
            } else if (_.isFunction(oAction.customProperties)) {
            	oMetadata.actions[oAction.massActionName].customProperties = oAction.customProperties;
            }
            oMetadata.actions[oAction.massActionName].execute = function(oParameters, oBulkAccess, addMessage, oContext) {
                if (!_.isObject(oParameters)) {
                    addMessage(Message.MessageSeverity.Fatal, "MSG_NO_OBJECT_KEYS", undefined, "Root");
                    return {};
                }
                var aKey = oParameters.keys;
                if (!_.isArray(aKey)) {
                    addMessage(Message.MessageSeverity.Fatal, "MSG_NO_OBJECT_KEYS", undefined, "Root");
                    return {};
                }

                var Framework = $.import("sap.ino.xs.aof.core", "framework");
                var oApplicationObject = Framework.getApplicationObject(oMetadata.name);
                if (!oApplicationObject) {
                    _.raiseException("Error while loading Application object " + oMetadata.name);
                }

                oParameters = _.omit(oParameters, "keys");
                var oGeneratedKeys = {};
                var oMassResult = {};

                _.each(aKey, function(vKey) {
                    var oResponse = oApplicationObject[sActionName](vKey, oParameters);
                    addMessage(oResponse.messages);
                    oGeneratedKeys = _.extend(oGeneratedKeys, oResponse.generatedKeys || {});
                    if (oResponse.result) {
                        oMassResult[vKey] = oResponse.result;
                    }
                });

                return {
                    generatedKeys : oGeneratedKeys,
                    massResult : oMassResult
                };
            };
        }
    });
}