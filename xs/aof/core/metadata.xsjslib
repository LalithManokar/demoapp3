var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var DB = $.import("sap.ino.xs.aof.core", "db");

var ObjectType = {
    Standard : "STANDARD",
    Configuration : "CONFIGURATION",
    Stage : "STAGE",
    SystemConfiguration : "SYSTEM_CONFIGURATION"
};

var Node = {
    Root : "Root"
};

var DataType = {
    VARCHAR : "VARCHAR",
    NVARCHAR : "NVARCHAR",
    CLOB : "CLOB",
    NCLOB : "NCLOB",
    INTEGER : "INTEGER",
    TINYINT : "TINYINT",
    SMALLINT : "SMALLINT",
    BIGINT : "BIGINT",
    DECIMAL : "DECIMAL",
    SMALLDECIMAL : "SMALLDECIMAL",
    REAL : "REAL",
    DOUBLE : "DOUBLE",
    FLOAT : "FLOAT",
    TIMESTAMP : "TIMESTAMP",
    DATE : "DATE",
    TIME : "TIME",
    SECONDDATE : "SECONDDATE"
};

var aNumericType = [DataType.INTEGER, DataType.BIGINT, DataType.TINYINT, DataType.SMALLINT, DataType.DECIMAL, DataType.SMALLDECIMAL, DataType.REAL, DataType.FLOAT, DataType.DOUBLE];
function _isNumericDataType(sDataType) {
    return _.contains(aNumericType, sDataType);
}

var aIntegerType = [DataType.INTEGER,DataType.BIGINT,DataType.TINYINT,DataType.SMALLINT];
function _isIntegerDataType(sDataType) {
    return _.contains(aIntegerType, sDataType);
}

var aFloatType = [DataType.REAL, DataType.FLOAT, DataType.DOUBLE];
function _isFloatDataType(sDataType) {
    return _.contains(aFloatType, sDataType);
}

var aStringType = [DataType.VARCHAR, DataType.NVARCHAR, DataType.CLOB, DataType.NCLOB];
function _isCharacterDataType(sDataType) {
    return _.contains(aStringType, sDataType);
}

var aDateType = [DataType.TIMESTAMP, DataType.DATE, DataType.SECONDDATE];
function _isDateDataType(sDataType) {
    return _.contains(aDateType, sDataType);
}

var Action = {
    Create : 'create',
    Update : 'update',
    Del : 'del',
    Copy : 'copy',
    Exists : 'exists',
    Read : 'read',
    CalculateConcurrencyToken : 'calculateConcurrencyToken',
    Properties : 'properties',
    StaticProperties : 'staticProperties'
};

function getMetadata(sObjectName, oDefinition, oExtensionDefinition) {
    var oMetadata = _getObjectMetadata(sObjectName, oDefinition, oExtensionDefinition);
    // wrap metadata in accessor object
    return _getMetadataAccess(oMetadata);
}

function _getObjectMetadata(sObjectName, oDefinition, oExtensionDefinition) {

    var oMetadata = {
        name : sObjectName,
        type : oDefinition.type || ObjectType.Standard,
        isExtensible : true === oDefinition.isExtensible,
        cascadeDelete : oDefinition.cascadeDelete || [],
        nodes : {},
        actions : {}
    };

    _.visitObjectTree(oDefinition, function(oDefNode, sDefNodeKey, sDefParentKey, sDefParentNodeKey) {
        if (sDefNodeKey === Node.Root || sDefParentKey === "nodes") {
            if (oMetadata.nodes[sDefNodeKey]) {
                _.raiseException("Define node '" + sDefNodeKey + "' unique");
            }

            oMetadata.nodes[sDefNodeKey] = _getNodeMetadata(sDefNodeKey, oDefNode, sDefParentNodeKey);

            if (sDefParentNodeKey) {
                var oMetadataParentNode = oMetadata.nodes[sDefParentNodeKey];
                oMetadataParentNode.subNodes.push(sDefNodeKey);
            }
            return sDefNodeKey;
        }

        // Actions on top level only
        if (sDefParentNodeKey === undefined && sDefParentKey === "actions") {
            oMetadata.actions[sDefNodeKey] = _getActionMetadata(sDefNodeKey, oDefNode);
            return sDefNodeKey;
        }
        return undefined;
    });

    oMetadata.isConcurrencyControlEnabled = oMetadata.nodes.Root.concurrencyControlAttributes.length > 0;

    var aDefinitionPlugin = [$.import("sap.ino.xs.aof.plugin", "massAction")];
    _.each(aDefinitionPlugin, function(oPlugin) {
        oPlugin.enhanceDefinition(oMetadata);
    });
    
    if (!oMetadata.isExtensible && oExtensionDefinition) {
        _.raiseException("Object " + sObjectName + " cannot be extended.");
    }
    
    if (oMetadata.isExtensible && oExtensionDefinition) {
        oMetadata = _mergeExtensionDefinition(oMetadata, oExtensionDefinition);
    }
    return oMetadata;
}

function _getNodeMetadata(sNodeName, oNodeDefinition, sParentNodeName) {

    var oNode = DB.getNodeMetadata(oNodeDefinition);

    oNode.name = sNodeName;
    oNode.parentNode = sParentNodeName;
    oNode.subNodes = [];
    _.extend(oNode, _.pick(oNodeDefinition, 'table', 'historyTable', 'sequence', 'parentKey', 'readOnly', 'customProperties', 'activationCheck'));

    if (oNode.name !== Node.Root && !oNode.parentKey) {
        _.raiseException("Define parent key for node " + oNode.name);
    }

    if (oNode.readOnly === undefined) {
        oNode.readOnly = false;
    }

    if (_.isFunction(oNode.readOnly)) {
        oNode.checkReadOnly = oNode.readOnly;
        oNode.readOnly = false;
    }

    var aDefinitionPrimaryKeys = [];
    // The primary key on the database table may be overridden in the definition.
    // the definition has priority.
    if (oNodeDefinition.attributes) {
        aDefinitionPrimaryKeys = _.reduce(oNodeDefinition.attributes, function(aPrimaryKeys, oDefinition, sAttributeName) {
            if (oDefinition.isPrimaryKey) {
                aPrimaryKeys.push(sAttributeName);
            }
            return aPrimaryKeys;
        }, []);
    }

    if (aDefinitionPrimaryKeys.length === 0) {
        oNode.primaryKey = _.first(oNode.primaryKeys);
        oNode.isDatabasePrimaryKey = true;
        if (oNode.primaryKeys.length > 1) {
            _.raiseException("Define only one primary key for node " + sNodeName);
        }
    }

    if (aDefinitionPrimaryKeys.length === 1) {
        oNode.primaryKey = _.first(aDefinitionPrimaryKeys);
        oNode.isDatabasePrimaryKey = _.first(oNode.primaryKeys) === oNode.primaryKey;
        oNode.attributes = _.mapObjects(oNode.attributes, function(oAttribute) {
            oAttribute.isPrimaryKey = (oAttribute.name === oNode.primaryKey);
            return oAttribute;
        });
    }

    if (aDefinitionPrimaryKeys.length > 1) {
        oNode.primaryKey = undefined;
        _.raiseException("Define only one primary key for node" + sNodeName);
    }

    // remove array -> we have copied it to primaryKey
    delete oNode.primaryKeys;

    var fnFilterActiveAttributes = function(oAttribute) {
        if (!oNodeDefinition.explicitAttributeDefinition) {
            return true;
        }

        if (oAttribute.isPrimaryKey) {
            return true;
        }
        // If explicit attributes are enabled only the explicit listed once are included (besides the primary key)
        var oNodeDefAttribute = oNodeDefinition.attributes && oNodeDefinition.attributes[oAttribute.name];
        return !!oNodeDefAttribute;
    };

    var fnFilterHiddenAttributes = function(oAttribute) {
        return !fnFilterActiveAttributes(oAttribute);
    };

    oNode.hiddenAttributes = _.indexBy(_.filter(oNode.attributes, fnFilterHiddenAttributes), 'name');
    oNode.attributes = _.indexBy(_.filter(oNode.attributes, fnFilterActiveAttributes), 'name');

    oNode.persistedAttributes = _.pluck(oNode.attributes, 'name');

    // add transient attributes. Complete data from definition will be copied together with persisted attributes
    oNode.transientAttributes = _.difference(_.keys(oNodeDefinition.attributes || []), oNode.persistedAttributes);
    _.extend(oNode.attributes, _.indexBy(_.map(oNode.transientAttributes, function(sAttributeName) {
        return {
            name : sAttributeName,
            isPrimaryKey : false
        };
    }), 'name'));

    oNode.attributes = _.indexBy(_.map(_.filter(oNode.attributes, function(oAttribute) {
        // The parent key attribute is not part of the node
        // and thus we remove it from the attributes
        return !(oNode.parentKey && oNode.parentKey == oAttribute.name && oNode.parentKey !== oNode.primaryKey);
    }), function(oAttribute) {
        oAttribute.consistencyChecks = [];
        var oNodeDefAttribute = oNodeDefinition.attributes && oNodeDefinition.attributes[oAttribute.name];
        if (oNodeDefAttribute) {
            var aToPick = ['constantKey', 'consistencyChecks', 'required', 'readOnly', 'foreignKeyTo', 'foreignKeyIntraObject', 'concurrencyControl', 'customProperties', 'isName'];
            aToPick = aToPick.concat(_enrichAttributesToPick(oAttribute, oNodeDefAttribute));
            _.extend(oAttribute, _.pick.apply(undefined, [oNodeDefAttribute].concat(aToPick)));
        }

        if (oAttribute.constantKey) {
            oAttribute.readOnly = true;
        }

        if (oAttribute.readOnly === undefined) {
            oAttribute.readOnly = false;
        }

        if (oAttribute.foreignKeyTo && oAttribute.foreignKeyIntraObject === undefined) {
            oAttribute.foreignKeyIntraObject = false;
        }

        if (_.isFunction(oAttribute.readOnly)) {
            oAttribute.checkReadOnly = oAttribute.readOnly;
            oAttribute.readOnly = false;
        }

        if (oAttribute.isName === undefined) {
            oAttribute.isName = false;
        }

        oAttribute.persisted = _.contains(oNode.persistedAttributes, oAttribute.name);

        return oAttribute;
    }), 'name');

    oNode.concurrencyControlAttributes = _.pluck(_.where(oNode.attributes, {
        concurrencyControl : true
    }), 'name');

    oNode.constantKeys = {};
    _.each(oNode.attributes, function(oAttribute, sAttributeName) {
        if (oAttribute.constantKey !== undefined && oAttribute.constantKey !== null) {
            oNode.constantKeys[sAttributeName] = oAttribute.constantKey;
        }
    });

    oNode.consistencyChecks = oNodeDefinition.consistencyChecks || [];

    oNode.nameAttribute = null;
    _.each(oNode.attributes, function(oAttribute, sAttributeName) {
        if (oAttribute.isName) {
            if (!oNode.nameAttribute) {
                oNode.nameAttribute = sAttributeName;
            } else {
                _.raiseException("Define only one name attribute for node " + sNodeName);
            }
        }
    });

    // For root node determinations need to be copied
    if (sNodeName === Node.Root) {
        oNode.determinations = {
            onCreate : (oNodeDefinition.determinations && oNodeDefinition.determinations.onCreate) || [],
            onPrepareCopy : (oNodeDefinition.determinations && oNodeDefinition.determinations.onPrepareCopy) || [],
            onCopy : (oNodeDefinition.determinations && oNodeDefinition.determinations.onCopy) || [],
            onUpdate : (oNodeDefinition.determinations && oNodeDefinition.determinations.onUpdate) || [],
            onModify : (oNodeDefinition.determinations && oNodeDefinition.determinations.onModify) || [],
            onDelete : (oNodeDefinition.determinations && oNodeDefinition.determinations.onDelete) || [],
            onRead : (oNodeDefinition.determinations && oNodeDefinition.determinations.onRead) || [],
            onPersist : (oNodeDefinition.determinations && oNodeDefinition.determinations.onPersist) || []
        };
    }

    return oNode;
}

function _getActionMetadata(sActionName, oActionDefinition) {
    var oActionMetadata = _.pick(oActionDefinition, 'authorizationCheck', 'enabledCheck', 'executionCheck', 'execute', 'persist', 'historyEvent', 'customProperties', 'isStatic', 'isInternal', 'impacts', 'massActionName');
    oActionMetadata.name = sActionName;

    // For special actions (specifically the CUD actions) execution may not be specified
    // as its execution is defined by the framework
    oActionMetadata.isFrameworkAction = _.contains(this.Action, sActionName);

    if (oActionMetadata.execute && oActionMetadata.isFrameworkAction) {
        _.raiseException("Action " + sActionName + " does not allow execute to be defined");
    }

    if (oActionMetadata.isStatic && oActionMetadata.isFrameworkAction) {
        _.raiseException("Action " + sActionName + " does not allow isStatic to be defined");
    }

    if (!oActionMetadata.execute && !oActionMetadata.isFrameworkAction) {
        _.raiseException("Custom action " + sActionName + " needs execute to be defined");
    }

    if (oActionMetadata.executionCheck && !oActionMetadata.isFrameworkAction) {
        _.raiseException("Custom action " + sActionName + " may not define an execution check");
    }

    if (oActionMetadata.authorizationCheck === undefined) {
        _.raiseException("Action " + sActionName + " needs authorizationCheck to be defined");
    }

    oActionMetadata.isStatic = oActionMetadata.isStatic || (sActionName === Action.Create);
    oActionMetadata.isInternal = oActionMetadata.isInternal || false;

    return oActionMetadata;
}

function _enrichAttributesToPick(oAttributeMetadata, oAttributeDefinition) {
    var aToPick = [];

    if (oAttributeMetadata.dataType && _isNumericDataType(oAttributeMetadata.dataType)) {
        aToPick.push('minValue', 'maxValue');
    }

    if (oAttributeDefinition.maxLength && oAttributeMetadata.dataType && _isCharacterDataType(oAttributeMetadata.dataType)) {
        if (oAttributeDefinition.maxLength < oAttributeMetadata.maxLength) {
            aToPick.push('maxLength');
        }
    }
    return aToPick;
}

function _mergeExtensionDefinition(oMetadata, oExtensionDefinition) {
    _.visitObjectTree(oExtensionDefinition, function(oDefNode, sDefNodeKey, sDefParentKey, sDefParentNodeKey) {
        if (sDefNodeKey === Node.Root || sDefParentKey === "nodes") {
            var oNodeMetadata = oMetadata.nodes[sDefNodeKey];
            if (!oNodeMetadata) {
                _.raiseException("Node '" + sDefNodeKey + "' not defined");
            }
            _mergeExtensionNodeMetadata(oNodeMetadata, oDefNode);
            return sDefNodeKey;
        }

        // Actions on top level only
        if (sDefParentNodeKey === undefined && sDefParentKey === "actions") {
            var oActionMetadata = oMetadata.actions[sDefNodeKey];
            if (!oActionMetadata) {
                _.raiseException("Action '" + sDefNodeKey + "' not defined");
            }
            _mergeExtensionActionMetadata(oActionMetadata, oDefNode);
            return sDefNodeKey;
        }
        return undefined;
    });
    return oMetadata;
}

function _mergeExtensionNodeMetadata(oNodeMetadata, oExtensionDefNode) {
    oNodeMetadata.consistencyChecks = oNodeMetadata.consistencyChecks.concat(oExtensionDefNode.consistencyChecks || []);

    _.each(oNodeMetadata.determinations || [], function(aDetermination, sType) {
        if (!oExtensionDefNode.determinations) {
            return;
        }
        oNodeMetadata.determinations[sType] = aDetermination.concat(oExtensionDefNode.determinations[sType] || []);
    });

    _mergeReadOnly(oNodeMetadata, oExtensionDefNode);
    _mergeCustomProperties(oNodeMetadata, oExtensionDefNode);

    _.each(oExtensionDefNode.attributes || [], function(oExtensionDefAttribute, sAttributeName) {
        var oAttributeMetadata = oNodeMetadata.attributes[sAttributeName];
        var bNewAttribute = false;

        if (!oAttributeMetadata) {
            oAttributeMetadata = oNodeMetadata.hiddenAttributes[sAttributeName];
            bNewAttribute = true;
            if (!oAttributeMetadata) {
                _.raiseException("Attribute '" + sAttributeName + "' not defined");
            }
        }

        if (bNewAttribute) {
            var aToPick = ['foreignKeyTo', 'readOnly', 'required', 'consistencyChecks', 'customProperties'];
            aToPick = aToPick.concat(_enrichAttributesToPick(oAttributeMetadata, oExtensionDefAttribute));

            var oAttribute = _.extend(oAttributeMetadata, _.pick.apply(undefined, [oExtensionDefAttribute].concat(aToPick)));

            if (oAttribute.readOnly === undefined) {
                oAttribute.readOnly = false;
            }

            if (_.isFunction(oAttribute.readOnly)) {
                oAttribute.checkReadOnly = oAttribute.readOnly;
                oAttribute.readOnly = false;
            }

            oNodeMetadata.attributes[sAttributeName] = oAttribute;
            oNodeMetadata.persistedAttributes.push(sAttributeName);
        } else {
            // Extensions can only make it more restrictive
            if (oExtensionDefAttribute.required) {
                oAttributeMetadata.required = true;
            }
            oAttributeMetadata.consistencyChecks = oAttributeMetadata.consistencyChecks.concat(oExtensionDefAttribute.consistencyChecks || []);
            _mergeReadOnly(oAttributeMetadata, oExtensionDefAttribute);
            _mergeCustomProperties(oAttributeMetadata, oExtensionDefAttribute);
        }
    });
}

function _mergeExtensionActionMetadata(oActionMetadata, oExtensionDefAction) {
    oActionMetadata.enabledCheck = oActionMetadata.enabledCheck ? _.chain(oActionMetadata.enabledCheck, oExtensionDefAction.enabledCheck || undefined) : oExtensionDefAction.enabledCheck;

    if (oExtensionDefAction.executionCheck && !oActionMetadata.isFrameworkAction) {
        _.raiseException("Custom action " + oActionMetadata.name + " may not define an execution check");
    }

    oActionMetadata.executionCheck = oActionMetadata.executionCheck ? _.chain(oActionMetadata.executionCheck, oExtensionDefAction.executionCheck || undefined) : oExtensionDefAction.executionCheck;

    if (oActionMetadata.execute) {
        oActionMetadata.execute = _.chain(oActionMetadata.execute, oExtensionDefAction.execute || undefined);
    }
    _mergeCustomProperties(oActionMetadata, oExtensionDefAction);
}

function _mergeReadOnly(oMetadata, oExtensionDef) {
    if (oMetadata.readOnly === false && true === oExtensionDef.readOnly) {
        oMetadata.readOnly = true;
        oMetadata.checkReadOnly = undefined;
    }

    if (oExtensionDef.readOnly && _.isFunction(oExtensionDef.readOnly)) {
        if (oMetadata.readOnly === true) {
            _.raiseException("Static defined ReadOnly cannot be overwritten with function");
        }
        oMetadata.checkReadOnly = _.chainReduce(function(oResult, oReturn) {
            return oResult || oReturn;
        }, false, oMetadata.checkReadOnly || undefined, oExtensionDef.readOnly);
    }
}

function _mergeCustomProperties(oMetadata, oExtensionDef) {
    if (oExtensionDef.customProperties) {
        oMetadata.customProperties = _.chainReduce(function(oResult, oReturn) {
            // Order is important: Core always wins for duplicate keys
            return _.extend(oReturn, oResult);
        }, {}, oMetadata.customProperties || {}, oExtensionDef.customProperties);
    }
}

function _getMetadataAccess(oMetadata) {
    var oMetadataAccess = {};
    var sObjectName = oMetadata.name;

    var mNodes = {};
    var mActions;
    var aNodePlugin = [$.import("sap.ino.xs.aof.plugin", "cascadeDelete")];

    function getMetadataForNode(sNodeName) {
        if (!mNodes[sNodeName]) {
            var oNodeMetadata = oMetadata.nodes[sNodeName];
            mNodes[sNodeName] = oNodeMetadata && getNodeMetadataAccess(oNodeMetadata);
            if (mNodes[sNodeName]) {
                mNodes[sNodeName].objectMetadata = oMetadataAccess;
            }
        }
        return mNodes[sNodeName];
    }

    function getNodeMetadataAccess(oNodeMetadata) {
        if (!oNodeMetadata) {
            return undefined;
        }
        var oFilteredNode = _.pick(oNodeMetadata, 'table', 'historyTable', 'schema', 'sequence', 'parentNode', 'subNodes', 'primaryKey', 'isDatabasePrimaryKey', 'name', 'parentKey', 'constantKeys', 'transientAttributes', 'persistedAttributes', 'concurrencyControlAttributes', 'nameAttribute', 'determinations', 'consistencyChecks', 'readOnly', 'checkReadOnly', 'customProperties', 'activationCheck');

        oFilteredNode.qualifiedName = sObjectName + "." + oFilteredNode.name;

        oFilteredNode.attributes = _.mapObjects(oNodeMetadata.attributes, function(oAttribute) {
            var Checks = $.import("sap.ino.xs.aof.lib", "check");
            var oAttributeClone = _.clone(oAttribute);
            oAttributeClone.consistencyChecks = oAttributeClone.consistencyChecks || [];

            // read-only attributes are filled in determinations. The determination takes care so that the
            // attributes are only filled with correct references, so no need to execute a foreign key check
            if (oAttribute.foreignKeyTo && false === oAttribute.readOnly) {
                if (!oAttribute.foreignKeyIntraObject) {
                    oAttributeClone.consistencyChecks.push(Checks.interObjectForeignKeyCheck);
                } else {
                    var oRootMetadata = getMetadataForNode(Node.Root);
                    oRootMetadata.consistencyChecks = oRootMetadata.consistencyChecks || [];
                    oRootMetadata.consistencyChecks.push(Checks.intraObjectForeignKeyCheck);
                }
            }

            if (oAttribute.dataType && _isIntegerDataType(oAttribute.dataType)) {
                oAttributeClone.consistencyChecks.push(Checks.integerCheck);
            }
            if (oAttribute.dataType && _isFloatDataType(oAttribute.dataType)) {
                oAttributeClone.consistencyChecks.push(Checks.floatCheck);
            }
            if (oAttribute.dataType && _isCharacterDataType(oAttribute.dataType)) {
                oAttributeClone.consistencyChecks.push(Checks.stringCheck);
            }
            if (oAttribute.dataType && _isDateDataType(oAttribute.dataType)) {
                oAttributeClone.consistencyChecks.push(Checks.dateCheck);
            }
            if (oAttribute.minValue !== undefined && oAttribute.minValue !== null) {
                oAttributeClone.consistencyChecks.push(Checks.minValueCheck);
            }
            if (oAttribute.maxValue !== undefined && oAttribute.maxValue !== null) {
                oAttributeClone.consistencyChecks.push(Checks.maxValueCheck);
            }
            if (oAttribute.dataType && _isCharacterDataType(oAttribute.dataType)) {
                oAttributeClone.consistencyChecks.push(Checks.maxLengthCheck);
            }

            return oAttributeClone;
        });

        _.each(aNodePlugin, function(oPlugin) {
            oPlugin.enhanceNode(oFilteredNode, oMetadataAccess);
        });

        return oFilteredNode;
    }

    oMetadataAccess.getObjectMetadata = function() {
        return _.pick(oMetadata, 'name', 'type', 'isConcurrencyControlEnabled', 'cascadeDelete');
    };

    oMetadataAccess.getNodeKeyValue = function getNodeKeyValue(sNodeName, oNodeData) {
        var sPrimaryKey = getMetadataForNode(sNodeName).primaryKey;
        return oNodeData && _.has(oNodeData, sPrimaryKey) ? oNodeData[sPrimaryKey] : undefined;
    };

    oMetadataAccess.setNodeKeyValue = function(sNodeName, vKey, oNodeData) {
        oNodeData[getMetadataForNode(sNodeName).primaryKey] = vKey;
    };

    oMetadataAccess.getNodeSequence = function(sNodeName) {
        var oNodeMetadata = getMetadataForNode(sNodeName);
        if (!oNodeMetadata.sequence) {
            return undefined;
        }
        return DB.getSequence(oNodeMetadata.sequence);
    };

    oMetadataAccess.getNodeMetadata = function(sNodeName) {
        return getMetadataForNode(sNodeName);
    };

    oMetadataAccess.getAllNodeMetadata = function() {
        return _.map(oMetadata.nodes, function(oNode) {
            return getMetadataForNode(oNode.name);
        });
    };

    // vNode is either the node name or an instance of the metadata access
    oMetadataAccess.getSubNodeMetadata = function(vNode) {
        var sNodeName = _.isString(vNode) ? vNode : vNode.name;
        var oNodeMetadata = getMetadataForNode(sNodeName);
        return _.map(oNodeMetadata.subNodes, function(sSubNodeName) {
            return oMetadataAccess.getNodeMetadata(sSubNodeName);
        });
    };

    oMetadataAccess.getActions = function() {
        if (mActions) {
            return mActions;
        }

        var fnTrue = _.constant(true);

        mActions = {};
        _.each(oMetadata.actions, function(oAction) {
            var oActionClone = _.clone(oAction);
            if (oActionClone.authorizationCheck === false || oActionClone.authorizationCheck === null) {
                oActionClone.authorizationCheck = fnTrue;
            }
            mActions[oAction.name] = oActionClone;
        });

        return mActions;
    };

    return oMetadataAccess;
}

function visitMetadataTree(oMetadataAccess, fnHandler) {
    _.visitObjectTree(oMetadataAccess.getNodeMetadata(Node.Root), function(oNodeMetadata, vIgnore1, vIgnore2, oParent) {
        return fnHandler(oNodeMetadata, oParent);
    }, oMetadataAccess.getSubNodeMetadata);
}