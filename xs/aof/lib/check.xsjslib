var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var Message = $.import("sap.ino.xs.aof.lib", "message");
var Metadata = $.import("sap.ino.xs.aof.core", "metadata");

var Messages = this.Messages = {
    INVALID_FOREIGN_KEY : "MSG_INVALID_FOREIGN_KEY",
    INVALID_BOOL_VALUE : "MSG_INVALID_BOOL_VALUE",
    INVALID_MIN_VALUE : "MSG_INVALID_MIN_VALUE",
    INVALID_MAX_VALUE : "MSG_INVALID_MAX_VALUE",
    INVALID_MAX_LENGTH : "MSG_INVALID_MAX_LENGTH",
    INVALID_VALUE_OPTION : "MSG_INVALID_VALUE_OPTION",
    INVALID_OBJECT_TYPE : "MSG_INVALID_OBJECT_TYPE",
    INVALID_OBJECT_REF : "MSG_INVALID_OBJECT_REF",
    NOT_A_VALID_NUMBER : "MSG_VALUE_NOT_A_NUMBER",
    NOT_A_VALID_STRING : "MSG_VALUE_NOT_A_STRING",
    NOT_A_VALID_DATE : "MSG_VALUE_NOT_A_DATE",
    DUPLICATE_ALT_KEY : "MSG_DUPLICATE_ALT_KEY",
    NODE_CARDINALITY_ONE_VIOLATION : "MSG_NODE_CARDINALITY_ONE_VIOLATION"
};

// Attribute Checks
function attributeCheck(fnPred, sMsgKey) {
    var aParameter = _.rest(_.toArray(arguments), 2);
    return function(vKey, oData, fnMessage, oContext, oNodeMetadata) {
        if (!fnPred(oData.value)) {
            var vValue = oData.value;
            if (typeof vValue === "string") {
                // assure text does not contain html
                vValue = _.stripTags(vValue);
                // cut text if too long
                if (vValue.length > 100) {
                    vValue = vValue.substring(0, 100) + "...";
                }
            }
            fnMessage.apply(undefined, [Message.MessageSeverity.Error, sMsgKey, vKey, oNodeMetadata.name, oData.name, vValue].concat(aParameter));
        }
    };
}

function booleanCheck(vKey, oData, fnMessage, oContext, oNodeMetadata) {
    attributeCheck(function(vValue) {
        // Only 0 and 1 should be accepted as "boolean" values as this is the format which is used
        // for the database
        return (vValue === 0 || vValue === 1);
    }, Messages.INVALID_BOOL_VALUE)(vKey, oData, fnMessage, oContext, oNodeMetadata);
}

function integerCheck(vKey, oData, fnMessage, oContext, oNodeMetadata) {
    attributeCheck(function(vValue) {
        return !isNaN(vValue) && (parseInt(vValue,10) === vValue) && vValue <= 9007199254740991 && vValue >= -9007199254740991;
    }, Messages.NOT_A_VALID_NUMBER)(vKey, oData, fnMessage, oContext, oNodeMetadata);
}

function floatCheck(vKey, oData, fnMessage, oContext, oNodeMetadata) {
    attributeCheck(function(vValue) {
        return !isNaN(vValue);
    }, Messages.NOT_A_VALID_NUMBER)(vKey, oData, fnMessage, oContext, oNodeMetadata);
}

function stringCheck(vKey, oData, fnMessage, oContext, oNodeMetadata) {
    attributeCheck(function(vValue) {
        return _.isString(vValue);
    }, Messages.NOT_A_VALID_STRING)(vKey, oData, fnMessage, oContext, oNodeMetadata);
}

function dateCheck(vKey, oData, fnMessage, oContext, oNodeMetadata) {
    attributeCheck(function(vValue) {
        // this also handles leap years and month ends (only when using SpiderMonkey)
        return !isNaN(Date.parse(vValue));
    }, Messages.NOT_A_VALID_DATE)(vKey, oData, fnMessage, oContext, oNodeMetadata);
}

function minValueCheck(vKey, oData, fnMessage, oContext, oNodeMetadata) {
    var vMinValue = oNodeMetadata.attributes[oData.name].minValue;
    attributeCheck(function(vValue) {
        return vValue >= vMinValue;
    }, Messages.INVALID_MIN_VALUE, vMinValue)(vKey, oData, fnMessage, oContext, oNodeMetadata);
}

function maxValueCheck(vKey, oData, fnMessage, oContext, oNodeMetadata) {
    var vMaxValue = oNodeMetadata.attributes[oData.name].maxValue;
    attributeCheck(function(vValue) {
        return vValue <= vMaxValue;
    }, Messages.INVALID_MAX_VALUE, vMaxValue)(vKey, oData, fnMessage, oContext, oNodeMetadata);
}

function maxLengthCheck(vKey, oData, fnMessage, oContext, oNodeMetadata) {
    var vMaxLength = oNodeMetadata.attributes[oData.name].maxLength;
    attributeCheck(function(vValue) {
        return !vValue || vValue.length <= vMaxLength;
    }, Messages.INVALID_MAX_LENGTH, vMaxLength)(vKey, oData, fnMessage, oContext, oNodeMetadata);
}

function valueOptionListCheck(vKey, oData, fnMessage, oContext, oNodeMetadata) {
    var sValueOptionList = oNodeMetadata.attributes[oData.name].customProperties.valueOptionList;
    attributeCheck(function(vValue) {
        if (vValue === undefined || vValue === "") {
            return true;
        }

        var AOF = $.import("sap.ino.xs.aof.core", "framework");
        var ValueOptionList = AOF.getApplicationObject("sap.ino.xs.object.basis.ValueOptionList");
        var oValueOptionList = ValueOptionList.read(sValueOptionList);

        // the attribute to check depends on the datatype
        var mValueAttribute = {
            NUMERIC : "NUM_VALUE",
            INTEGER : "NUM_VALUE",
            BOOLEAN : "BOOL_VALUE",
            TEXT : "TEXT_VALUE"
        };
        var aValidValue = _.pluck(oValueOptionList.ValueOptions || [], mValueAttribute[oValueOptionList.DATATYPE_CODE]);
        return _.contains(aValidValue, vValue);
    }, Messages.INVALID_VALUE_OPTION, sValueOptionList)(vKey, oData, fnMessage, oContext, oNodeMetadata);
}

// Node Checks
function consistencyCheck(fnPred, sMsgKey, sAttributeName, sMsgAttributeName) {
    return function(vKey, oWorkObjectNode, fnMessage, oContext, oNodeMetadata) {
        var aInconsistentWorkObjectNode = fnPred(oWorkObjectNode);
        if (aInconsistentWorkObjectNode) {
            _.each(aInconsistentWorkObjectNode, function(oInconsistentWorkObjectNode) {
                var vNodeKey = oInconsistentWorkObjectNode[oNodeMetadata.primaryKey];
                var vValue;
                if (sMsgAttributeName && oInconsistentWorkObjectNode[sMsgAttributeName]) {
                    vValue = oInconsistentWorkObjectNode[sMsgAttributeName];
                } else if (sAttributeName && oInconsistentWorkObjectNode[sAttributeName]) {
                    vValue = oInconsistentWorkObjectNode[sAttributeName];
                }
                fnMessage(Message.MessageSeverity.Error, sMsgKey, vNodeKey, oNodeMetadata.name, sAttributeName, vValue);
            });
        }
    };
}

function interObjectForeignKeyCheck(vKey, oData, fnMessage, oContext, oNodeMetadata) {
    var Framework = $.import("sap.ino.xs.aof.core", "framework");

    var oAttribute = oNodeMetadata.attributes[oData.name];
    var aParts = oAttribute.foreignKeyTo.split(".");
    var sNodeName = _.last(aParts);
    var sObjectName = _.initial(aParts).join(".");

    var oApplicationObject = Framework.getApplicationObject(sObjectName);
    if (!oApplicationObject) {
        _.raiseException("Application object " + sObjectName + " referenced as foreign key in " + oAttribute.name + "does not exist");
    }
    var fnCheck = attributeCheck(_.partial(foreignKeyCheck, oApplicationObject, sNodeName), Messages.INVALID_FOREIGN_KEY);
    fnCheck(vKey, oData, fnMessage, oContext, oNodeMetadata);
}

function intraObjectForeignKeyCheck(vKey, oWorkObject, fnMessage, oContext, oNodeMetadata) {
    var oMetadataAccess = oNodeMetadata.objectMetadata;

    function _getNodeName(sKey) {
        return (sKey === undefined) ? Metadata.Node.Root : sKey;
    }

    // collect all primary keys for each node in the object
    var mKeyForNode = {};
    _.visitInstanceTree(oWorkObject, function(oWorkObjectNode, sKey, bObjectInArray, oContext) {
        var sNodeName = _getNodeName(sKey);
        if (sNodeName === Metadata.Node.Root || bObjectInArray) {
            var oNodeMetadata = oMetadataAccess.getNodeMetadata(sNodeName);
            if (!oNodeMetadata) {
                return;
            }
            var vKey = oWorkObjectNode[oNodeMetadata.primaryKey];
            var oNodeKey = mKeyForNode[sNodeName];
            if (!oNodeKey) {
                oNodeKey = {};
                mKeyForNode[sNodeName] = oNodeKey;
            }
            oNodeKey[vKey] = true;
        }
    });

    // validate all intra-object foreign keys against all collected primary keys
    _.visitInstanceTree(oWorkObject, function(oWorkObjectNode, sKey, bObjectInArray, oContext) {
        var sNodeName = _getNodeName(sKey);
        var oNodeMetadata = oMetadataAccess.getNodeMetadata(sNodeName);
        if (!oNodeMetadata) {
            return;
        }
        if (sNodeName === Metadata.Node.Root || bObjectInArray) {
            var vNodeKey = oMetadataAccess.getNodeKeyValue(sNodeName, oWorkObjectNode);
            _.each(oNodeMetadata.attributes, function(oAttribute) {
                if (oAttribute.foreignKeyTo && oAttribute.foreignKeyIntraObject) {
                    var vForeignKeyValue = oWorkObjectNode[oAttribute.name];
                    if (!vForeignKeyValue) {
                        return;
                    }
                    var aParts = oAttribute.foreignKeyTo.split(".");
                    var sForeignKeyToNodeName = _.last(aParts);
                    if (!(mKeyForNode[sForeignKeyToNodeName] && mKeyForNode[sForeignKeyToNodeName][vForeignKeyValue])) {
                        fnMessage(Message.MessageSeverity.Error, Messages.INVALID_FOREIGN_KEY, vNodeKey, oNodeMetadata.name, oAttribute.name, vForeignKeyValue);
                    }
                }
            });
        }
    });
}

function objectReferenceCheck(sObjectTypeAttribute, sObjectKeyAttribute, sRefNodeName) {
    return function(vKey, oWorkObjectNode, addMessage, oContext, oNodeMetadata) {
        var aWorkObjectNode = _.isArray(oWorkObjectNode) ? oWorkObjectNode : [oWorkObjectNode];
        _.each(aWorkObjectNode, function(oWorkObjectNode) {
            var vNodeKey = oWorkObjectNode[oNodeMetadata.primaryKey];
            if (oWorkObjectNode[sObjectTypeAttribute] && oWorkObjectNode[sObjectKeyAttribute]) {
                var oHQ = oContext.getHQ();
                var aApplicationObjectName = oHQ.statement('select NAME, DESCRIPTION from "sap.ino.db.aof::t_application_object" where CODE = ?').execute(oWorkObjectNode[sObjectTypeAttribute]);
                if (aApplicationObjectName.length != 1) {
                    addMessage(Message.MessageSeverity.Error, Messages.INVALID_OBJECT_TYPE, vNodeKey, oNodeMetadata.name, sObjectTypeAttribute, oWorkObjectNode[sObjectTypeAttribute]);
                } else {
                    var sApplicationObjectName = aApplicationObjectName[0].NAME;
                    var sApplicationObjectDescription = aApplicationObjectName[0].DESCRIPTION;
                    var AOF = $.import("sap.ino.xs.aof.core", "framework");
                    var oApplicationObject = AOF.getApplicationObject(sApplicationObjectName);
                    var vForeignKey = oWorkObjectNode[sObjectKeyAttribute];
                    if (!oApplicationObject.exists(vForeignKey, sRefNodeName)) {
                        addMessage(Message.MessageSeverity.Error, Messages.INVALID_OBJECT_REF, vNodeKey, oNodeMetadata.name, sObjectKeyAttribute, sApplicationObjectDescription, oWorkObjectNode[sObjectKeyAttribute]);
                    }
                }
            }
        });
    };
}

function duplicateCheck(sAttributeName, sMsgKey, bIgnoreCase, sMsgAttribute) {
    return consistencyCheck(_.partial(containsDuplicates, sAttributeName, bIgnoreCase), sMsgKey, sAttributeName, sMsgAttribute);
}

var containsDuplicates = function(sAttributeName, bIgnoreCase, aWorkObjectNode) {
    if (!_.isArray(aWorkObjectNode)) {
        return [];
    }
    var aDuplicate = _.filter(aWorkObjectNode, function(oWorkObjectNode) {
        var vValue = oWorkObjectNode[sAttributeName];
        if (vValue === undefined || vValue === null) {
            return false;
        }
        return !!_.find(aWorkObjectNode, function(oOtherWorkObjectNode) {
            var vOtherValue = oOtherWorkObjectNode && oOtherWorkObjectNode[sAttributeName];
            if (vOtherValue === undefined || vOtherValue === null) {
                return false;
            }

            if (bIgnoreCase && _.isString(vValue)) {
                vValue = vValue.toUpperCase();
            }

            if (bIgnoreCase && _.isString(vOtherValue)) {
                vOtherValue = vOtherValue.toUpperCase();
            }

            return oWorkObjectNode != oOtherWorkObjectNode && vValue == vOtherValue;
        });
    });
    return aDuplicate;
};

function duplicateAlternativeKeyCheck(sAltKeyName, sMsgKey, bIgnoreCase) {
    return function(vKey, oWorkObjectNode, addMessage, oContext, oNodeMetadata) {
        var vAltKeyValue = oWorkObjectNode[sAltKeyName];
        if (bIgnoreCase && vAltKeyValue && _.isString(vAltKeyValue)) {
            vAltKeyValue = vAltKeyValue.toUpperCase();
        }

        var sKeyName = oNodeMetadata.primaryKey;
        var vKeyValue = oWorkObjectNode[sKeyName];
        var sTable = oNodeMetadata.table;
        var sAltKey = bIgnoreCase ? "upper(" + sAltKeyName + ")" : sAltKeyName;
        var oHQ = oContext.getHQ();
        var aAltKeyDuplicate = oHQ.statement('select * from "' + sTable + '" where ' + sAltKey + " = ? and " + sKeyName + " != ?").execute(vAltKeyValue, vKeyValue);
        if (aAltKeyDuplicate.length > 0) {
            addMessage(Message.MessageSeverity.Error, sMsgKey || Messages.DUPLICATE_ALT_KEY, vKeyValue, 'Root', sAltKeyName, oWorkObjectNode[sAltKeyName]);
        }
    };
}

function DBForeignKeyCheck(sAltKeyName, sMsgKey, sTable, sColumn) {
    return function(vKey, oWorkObjectNode, addMessage, oContext, oNodeMetadata) {
        var vAltKeyValue = oWorkObjectNode[sAltKeyName];
        var oHQ = oContext.getHQ();
        var aAltKeyRecord = oHQ.statement('select top 1 1 as exists from ' + sTable + ' where ' + sAltKeyName + " = ?").execute(vAltKeyValue);
        if (aAltKeyRecord.length === 0) {
            addMessage(Message.MessageSeverity.Error, sMsgKey || Messages.INVALID_FOREIGN_KEY, vAltKeyValue, 'Root', sAltKeyName, vAltKeyValue);
        }
    };
}

function readOnlyAfterCreateCheck(sMsgKey) {
    return function(vKey, oPersistedObjectNode, addMessage, oContext, oNodeMetadata) {
        var bReadOnly = !!vKey;
        if (bReadOnly) {
            addMessage(Message.MessageSeverity.Error, sMsgKey, vKey, oNodeMetadata.name);
        }
        return bReadOnly;
    };
}

// AOF Internal re-use checks
function foreignKeyCheck(oApplicationObject, sNodeName, vForeignKey) {
    return vForeignKey ? oApplicationObject.exists(vForeignKey, sNodeName) : true;
}

function cardinalityOneCheck() {
    return consistencyCheck(function(aNode) {
        return ((aNode === undefined) || aNode.length <= 1) ? [] : aNode;
    }, Messages.NODE_CARDINALITY_ONE_VIOLATION);
}