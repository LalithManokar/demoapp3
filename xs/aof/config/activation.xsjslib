var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var util = $.import("sap.ino.xs.aof.config", "util");
var frmwk = $.import("sap.ino.xs.aof.core", "framework");
var meta = $.import("sap.ino.xs.aof.core", "metadata");
var auth = $.import("sap.ino.xs.aof.core", "authorization");
var msg = $.import("sap.ino.xs.aof.lib", "message");
var DB = $.import("sap.ino.xs.aof.core", "db");
var importLib = $.import("sap.ino.xs.aof.config", "import");
var Message = $.import("sap.ino.xs.aof.lib", "message");
var configMessage = $.import("sap.ino.xs.aof.config", "message");

var CONFIG_TABLE = "sap.ino.db.basis::v_config_package_vector";

var ObjectTypes = {
    CONFIGURATION : "CONFIGURATION",
    STANDARD : "STANDARD",
    STAGE : "STAGE"
};

function _getStageTableName(sTableName) {
    if (!sTableName) {
        throw Error("Table name is empty");
    }
    return sTableName + "_stage";
}

function _getStageViewName(oNodeMetadata) {
    var sStageTable = oNodeMetadata.table + "_stage";
    return sStageTable.replace("::t_", "::v_");
}

function _quoteTableName(sTableName) {
    return "\"" + sTableName + "\"";
}

function _selectFromStringDependingOnObjectType(oNodeMetadata) {
    if (oNodeMetadata._objectType === ObjectTypes.CONFIGURATION) {
        return util.getStageViewAsString(oNodeMetadata);
    } else if (oNodeMetadata._objectType === ObjectTypes.STANDARD) {
        return _quoteTableName(oNodeMetadata.table);
    } else {
        throw new Error("Invalid object type");
    }
}

function readAllPrimaryKeysForConfNode(oNodeMetadata) {
    return readAllPrimaryKeysForTable(_getStageTableName(oNodeMetadata.table), oNodeMetadata.primaryKey);
}

function readAllPrimaryKeysForAppNode(oNodeMetadata) {
    return readAllPrimaryKeysForTable(oNodeMetadata.table, oNodeMetadata.primaryKey);
}

function readAllPrimaryKeysForTable(sTable, sPK, aConstantKeys) {
    var where = " where 1 = 1";
    var aPlaceholderValues = [];
    _.each(aConstantKeys, function(sValue, sColumn) {
        where += ' and "' + sColumn + '" = ? ';
        aPlaceholderValues.push(sValue);
    });
    var select = "select distinct " + sPK + " from \"" + sTable + "\"" + where + " order by " + sPK;
    var aInstances = _.map(DB.oHQ.statement(select).execute(aPlaceholderValues), function(rec) {
        return rec[sPK];
    });
    return aInstances;
}

function checkPackageIdsForStageNode(oNodeMetadata) {
    var select = "select package_id from \"" + oNodeMetadata.table + "\" where package_id not in (select package_id from \"" + CONFIG_TABLE + "\" )";
    var aIds = DB.oHQ.statement(select).execute();
    return {
        result : !(aIds && aIds.length > 0),
        packages : _.pluck(aIds, "PACKAGE_ID")
    };
}

/**
 * Gets all foreign key constraints in oNodeMetadata, that point on any node in the oObjectsMap. oNodeMetadata :
 * metadata of the object node with outbound foreign keys aObjectNodes : metadata of the object nodes to which the
 * foreign keys may point returns a list of descriptors
 */
function getForeignKeyDescriptorsForNode(oOutboundNode, aInboundNodes) {
    var aForeignKeyDesc = [];
    var FOREIGNKEYTO = "foreignKeyTo";
    _.each(_.filter(oOutboundNode.attributes, function(oAttribute) {
        return _.has(oAttribute, FOREIGNKEYTO);
    }), function(oAttribute) {
        _.each(_.where(aInboundNodes, {
            "qualifiedName" : oAttribute[FOREIGNKEYTO]
        }), function(oInboundNode) {
            var oFKDesc = {
                sTable : oOutboundNode.table,
                sPrimaryKey : oOutboundNode.primaryKey,
                sAttribute : oAttribute.name,
                sSelectFrom : _selectFromStringDependingOnObjectType(oOutboundNode),
                aConstantKeys : oOutboundNode.constantKeys,
                sFKObjectName : _.initial(oAttribute[FOREIGNKEYTO].split(".")).join("."),
                sFKNodeName : oInboundNode.name,
                sFKTable : oInboundNode.table,
                sFKPrimaryKey : oInboundNode.primaryKey,
                sFKSelectFrom : _selectFromStringDependingOnObjectType(oInboundNode),
                sOutboundNode : oOutboundNode.qualifiedName,
                sInboundNode : oInboundNode.qualifiedName
            };
            if (_.some(_.pairs(oFKDesc), function(pair) {
                return !pair[1];
            })) {
                throw new Error("invalid foreign key description " + JSON.stringify(oFKDesc));
            }
            aForeignKeyDesc.push(oFKDesc);
        });
    });
    return aForeignKeyDesc;
}

/**
 * Gets all foreign key constraints in all nodes in aOutNodes, that point on any node in the oObjectsMap. aOutNodes :
 * list of object nodes with outgoing foreign keys oInNodes : list of object nodes to which the foreign keys point
 * returns a list of descriptors
 */
function getForeignKeyToDescriptorsForNodes(aOutNodes, aInNodes) {
    var aForeignKeyDesc = [];
    _.each(aOutNodes, function(oOutNode) {
        var aDescriptors = getForeignKeyDescriptorsForNode(oOutNode, aInNodes);
        _.each(aDescriptors, function(oForeignNode) {
            aForeignKeyDesc.push(oForeignNode);
        });
    });
    return aForeignKeyDesc;
}

/**
 * DEPRECATED use getForeignKeyToDescriptorsForNodes instead Gets all foreign key constraints in all nodes on all
 * application objects in aObjects, that point on any node in the oObjectsMap. aObjects : list of metadata of
 * application objects oObjectsMap : map of object names to the objects returns a list of descriptors
 */
function getForeignKeyToDescriptorsForObjects(aObjects, oObjectsMap, sNodeName) {
    var aForeignKeyDesc = [];
    _.each(aObjects, function(object) {
        _.each(object.getAllNodeMetadata(), function(oNode) {
            var aInNodes = _.flatten(_.map(_.values(oObjectsMap), function(oObject) {
                return oObject.getAllNodeMetadata();
            }));
            if (sNodeName) {
                aInNodes = _.filter(aInNodes, function(node) {
                    return node.name === sNodeName;
                });
            }
            var aDescriptors = getForeignKeyDescriptorsForNode(oNode, aInNodes);
            _.each(aDescriptors, function(oForeignNode) {
                aForeignKeyDesc.push(oForeignNode);
            });
        });
    });
    return aForeignKeyDesc;
}

/**
 * From the list of keys aKeys filter out the instances with unresolved foreign key constraint oFKDesc. If aKeys is null
 * all instances with satisfied fk constraints are returned. If bNullAllowed is true, instances with an empty foreign
 * key are allowed. aKeys : list of primary keys bNullAllowed : true if empty foreign keys are allowed oFKDesc : foreign
 * key description returns array of resolved and array of unresolved instances
 */
function filterForeignKeyConstraint(aKeys, bNullAllowed, oFKDesc) {
    var sSelect;
    var aResolvedInstances = [];
    var aUnresolvedInstances = [];

    var where = "(1 = 1";
    var aPlaceholderValues = [];
    _.each(oFKDesc.aConstantKeys, function(sValue, sColumn) {
        where += ' and "' + sColumn + '" = ? ';
        aPlaceholderValues.push(sValue);
    });
    where = where + ")";

    if (bNullAllowed) {
        sSelect = "select h." + oFKDesc.sPrimaryKey + " as id," + " case when" + " h." + oFKDesc.sAttribute + " is null or" + " h." + oFKDesc.sAttribute + " in (select f." + oFKDesc.sFKPrimaryKey + " from " + oFKDesc.sFKSelectFrom + " as f)" + " then 1 else 0 end as good" + " from " + oFKDesc.sSelectFrom + " as h" + " where " + where + " order by id asc";
    } else {
        sSelect = "select h." + oFKDesc.sPrimaryKey + " as id," + " case when" + " h." + oFKDesc.sAttribute + " in (select f." + oFKDesc.sFKPrimaryKey + " from " + oFKDesc.sFKSelectFrom + " as f)" + " then 1 else 0 end as good" + " from " + oFKDesc.sSelectFrom + " as h" + " where " + where + " order by id asc";
    }
    var aResult = DB.oHQ.statement(sSelect).execute(aPlaceholderValues);
    var _resolved = [];
    var _unresolved = [];
    _.each(aResult, function(result) {
        if (result.GOOD == 1) {
            _resolved.push(result.ID);
        } else {
            _unresolved.push(result.ID);
        }
    });
    if (aKeys) {
        aResolvedInstances = _.sortedIntersection(_resolved, aKeys);
        aUnresolvedInstances = _.sortedIntersection(_unresolved, aKeys);
    } else {
        aResolvedInstances = _resolved;
        aUnresolvedInstances = _unresolved;
    }
    return {
        aResolvedInstances : aResolvedInstances,
        aUnresolvedInstances : aUnresolvedInstances
    };
}

/**
 * Checks whether all foreign key constraints of all nodes of all application objects in aApplicationObjects pointing to
 * any node of any configuration object in oConfigurationObjectsMap are satisfied. If any of the constraints to a
 * configuration object is not satisfied the object is returned in the array of inconsistent configuration objects
 * aInconsistentCOs and for each missing foreign key a message is written to the message buffer. oScope : contains the
 * application and the configuration objects oMsgBuf : a message buffer returns an array of valid configuration objects
 */
function filterExternalForeignKeys(oScope, oMsgBuf) {
    var aConsistentCOs = [];
    var oFKDescGrouped = oScope.getForeignKeyDescriptorsFromApplicationToConfigurationGroupedByNodeName();
    _.each(oScope.getConfigurationObjects(), function(oConf) {
        var bConsistent = true;
        var sObjectName = oConf.getObjectMetadata().name;
        _.each(oConf.getAllNodeMetadata(), function(oNode) {
            var aFKDescForNode = oFKDescGrouped[sObjectName + oNode.name];
            _.each(aFKDescForNode, function(oFKDesc) {
                var result = filterForeignKeyConstraint(null, true, oFKDesc);
                _.each(result.aUnresolvedInstances, function(inst) {
                    oMsgBuf.addMessage(Message.MessageSeverity.Error, configMessage.CONF_OBJECT_EXTERNAL_FK_UNRESOLVED, "", "", "", oFKDesc.sFKObjectName, oFKDesc.sInboundNode, oFKDesc.sFKTable, oFKDesc.sFKPrimaryKey, "", oFKDesc.sOutboundNode, oFKDesc.sTable, oFKDesc.sAttribute, inst);
                    bConsistent = false;
                });
            });
        });
        if (bConsistent) {
            aConsistentCOs.push(oConf);
        }
    });
    return aConsistentCOs;
}

/**
 * Checks whether there is a correct stage object for each configuration object in the list aConfigurationObjects.
 * oScope : contains the application and the configuration objects oMsgBuf : a message buffer returns array of checked
 * configuration objects
 */
function filterStageConsistency(oScope, oMsgBuf) {
    var afilteredCOs = _.filter(oScope.getConfigurationObjects(), function(oConf) {
        try {
            var i = 0;
            var aNodes = oConf.getAllNodeMetadata();

            var oStageMetadata = oScope.getStageObject(util.getStageObjectName(oConf.getObjectMetadata().name));
            if (!oStageMetadata)
                throw new Error("No stage object");

            var oStageObjectMetadata = oStageMetadata.getObjectMetadata();
            if (!oStageObjectMetadata)
                throw new Error("Stage object can not be loaded");

            var aStageNodes = oStageMetadata.getAllNodeMetadata();
            if (aStageNodes.length !== aNodes.length)
                throw new Error("Number of nodes in stage object is not the same as the number of nodes in conf object");

            for (i = 0; i < aStageNodes.length; i++) {
                if (aStageNodes[i].name != aNodes[i].name)
                    throw new Error("Invalid node name in stage object");
                if (!aNodes[i].table)
                    throw new Error("No table for node " + aNodes[i].name);
                if (aStageNodes[i].table !== _getStageTableName(aNodes[i].table))
                    throw new Error("Invalid table name in stage object");
            }

            // _.each(aStageNodes, function(oNode) {
            //     var oCheckResult = checkPackageIdsForStageNode(oNode);
            //     if (!oCheckResult.result)
            //         throw new Error("Following config packages used, but not extended from base config package 'sap.ino.config': " + oCheckResult.packages.join(", "));
            // });
            return true;
        } catch (err) {
            oMsgBuf.addMessage(Message.MessageSeverity.Error, configMessage.CONF_OBJECT_STAGE_EXCEPTION, "", "", "", oConf.getObjectMetadata().name, err.toString());
            return false;
        }
    });
    return afilteredCOs;
}

function filterConfigurationObjects(oScope, msgBuf) {
    // filter out inconsistent configuration objects
    var aConfigurationObjects = filterStageConsistency(oScope, msgBuf);

    // filter out objects that would violate external foreign key constraints
    aConfigurationObjects = _.intersection(filterExternalForeignKeys(oScope, msgBuf), aConfigurationObjects);

    return aConfigurationObjects;
}

function filterParentKeyInstances(aInstances, sObjectName, oNodeMetadata, oParent, msgBuf) {
    var oFKDesc = {
        sTable : _getStageTableName(oNodeMetadata.table),
        sPrimaryKey : oNodeMetadata.primaryKey,
        sAttribute : oNodeMetadata.parentKey,
        sSelectFrom : _selectFromStringDependingOnObjectType(oNodeMetadata),
        aConstantKeys : [],
        sFKObjectName : sObjectName,
        sFKNodeName : oParent.name,
        sFKTable : oParent.table,
        sFKPrimaryKey : oParent.primaryKey,
        sFKSelectFrom : _selectFromStringDependingOnObjectType(oParent),
        sOutboundNode : oNodeMetadata.qualifiedName,
        sInboundNode : oParent.qualifiedName
    };

    if (_.some(_.pairs(oFKDesc), function(pair) {
        return !pair[1];
    })) {
        throw new Error("invalid foreign key description " + JSON.stringify(oFKDesc));
    }

    var oFilterResult = filterForeignKeyConstraint(aInstances, false, oFKDesc);
    _.each(oFilterResult.aUnresolvedInstances, function(sKey) {
        msgBuf.addMessage(Message.MessageSeverity.Error, configMessage.CONF_OBJECT_REC_PK_UNRESOLVED, "", "", "", oFKDesc.sFKObjectName, oFKDesc.sInboundNode, oFKDesc.sFKTable, oFKDesc.sOutboundNode, oFKDesc.sTable, oFKDesc.sAttribute, sKey);
    });
    return oFilterResult.aResolvedInstances;
}

function filterForeignKeyInstances(aInstances, sObjectName, oNodeMetadata, oScope, msgBuf) {
    var _aFKDesc = getForeignKeyDescriptorsForNode(oNodeMetadata, _.flatten(_.map(_.values(oScope.getApplicationObjectsMap()), function(oObject) {
        return oObject.getAllNodeMetadata();
    })));
    var aFKDesc = _.union(_aFKDesc, getForeignKeyDescriptorsForNode(oNodeMetadata, _.flatten(_.map(_.values(oScope.getConfigurationObjectsMap()), function(oObject) {
        return oObject.getAllNodeMetadata();
    }))));
    _.each(aFKDesc, function(oFKDesc) {
        oFKDesc.sTable = _getStageTableName(oFKDesc.sTable);
        var oFilterResult = filterForeignKeyConstraint(aInstances, true, oFKDesc);
        _.each(oFilterResult.aUnresolvedInstances, function(sKey) {
            msgBuf.addMessage(Message.MessageSeverity.Error, configMessage.CONF_OBJECT_REC_FK_UNRESOLVED, "", "", "", oFKDesc.sFKObjectName, oFKDesc.sInboundNode, oFKDesc.sFKTable, "", sObjectName, oFKDesc.sOutboundNode, oFKDesc.sTable, oFKDesc.sAttribute, sKey);
        });
        aInstances = oFilterResult.aResolvedInstances;
    });
    return aInstances;
}

function retrieveValidInstances(oConfigurationObject, oNodeMetadata, oParent, oScope, msgBuf) {

    var aInstances = readAllPrimaryKeysForTable(_getStageTableName(oNodeMetadata.table), oNodeMetadata.primaryKey);

    // separate configuration records that have unresolved parent keys
    if (oParent) {
        aInstances = filterParentKeyInstances(aInstances, oConfigurationObject.getObjectMetadata().name, oNodeMetadata, oParent, msgBuf);
    }

    // separate configuration records that have unresolved foreign keys
    aInstances = filterForeignKeyInstances(aInstances, oConfigurationObject.getObjectMetadata().name, oNodeMetadata, oScope, msgBuf);

    return aInstances;
}

function externalActivationCheck(oConfigurationObject, oScope, msgBuf) {
    var aErrInstances = [];
    var sObjectName = oConfigurationObject.getObjectMetadata().name;
    var oRootNode = oConfigurationObject.getNodeMetadata("Root");
    var aNodes = oConfigurationObject.getAllNodeMetadata();
    var oStageObject = oScope.getStageObject(util.getStageObjectName(sObjectName));
    var oStageRootNode = oStageObject.getNodeMetadata("Root");
    if (oStageRootNode.activationCheck) {
        var aInstances = readAllPrimaryKeysForTable(oStageRootNode.table, oRootNode.primaryKey);
        _.each(aInstances, function(sId) {
            var oBefore = DB.read(sId, oConfigurationObject);
            var oStage = util.readStageObject(sId, undefined, oConfigurationObject);
            var _msgBuf = msg.createMessageBuffer();
            try {
                oStageRootNode.activationCheck(oBefore, oStage, _msgBuf.addMessage, oScope);
                if (_msgBuf.hasMessages() && _msgBuf.getMinSeverity() < msg.MessageSeverity.Warning) {
                    var _oNodeKeys = DB.getNodeKeys(oStage, oConfigurationObject);
                    _oNodeKeys.ObjectName = sObjectName;
                    aErrInstances.push(_oNodeKeys);
                }
            } catch (err) {
                msgBuf.addMessage(Message.MessageSeverity.Error, configMessage.CONF_OBJECT_REC_EXT_CHECK_EXCEPTION, "", "", "", oStageRootNode.qualifiedName, sId, err.name, err.message, err.fileName, err.lineNumber, err.columnNumber);
                var _oNodeKeys = DB.getNodeKeys(oStage, oConfigurationObject);
                _oNodeKeys.ObjectName = sObjectName;
                aErrInstances.push(_oNodeKeys);
            }
            msgBuf.addAllFrom(_msgBuf);
        });
    }
    return aErrInstances;
}

function findChildrenForInstance(oObject, oParentMetadata, key, aChildren) {
    var sObjectName = oObject.getObjectMetadata().name;
    var _aChildren = _.map(oParentMetadata.subNodes, function(sNodeName) {
        var oNodeMetadata = oObject.getNodeMetadata(sNodeName);
        var sSelect = "select " + oNodeMetadata.primaryKey + " from " + util.getStageViewAsString(oNodeMetadata) + " where " + oNodeMetadata.parentKey + " = ? order by " + oNodeMetadata.primaryKey;
        var result = DB.oHQ.statement(sSelect).execute(key);
        var keys = _.map(result, function(inst) {
            return inst[oNodeMetadata.primaryKey];
        });
        return (keys.length > 0) ? {
            objectName : sObjectName,
            nodeName : oNodeMetadata.name,
            node : oNodeMetadata,
            keys : keys
        } : null;
    });
    _aChildren = _.reject(_aChildren, function(o) {
        return !o;
    });
    return (aChildren) ? _.union(aChildren, _aChildren) : _aChildren;
}

function findChildrenForInstances(oObject, aParents, aChildren) {
    var _aChildren = [];
    _.each(aParents, function(oElement) {
        _.each(oElement.keys, function(key) {
            _aChildren = findChildrenForInstance(oObject, oElement.node, key, _aChildren);
        });
    });
    return (aChildren) ? _.union(aChildren, _aChildren) : _aChildren;
}

function findChildrenForInstanceRecursively(oObject, oParentMetadata, key) {
    var sObjectName = oObject.getObjectMetadata().name;
    var sNodeName = oParentMetadata.name;
    var oRootElement = {
        objectName : sObjectName,
        nodeName : sNodeName,
        node : oParentMetadata,
        keys : [key]
    };
    var aChildren = [oRootElement];
    var _aParents = [oRootElement];
    var _aChildren = [];
    var iGrowth = 1;
    while (iGrowth > 0) {
        _aChildren = findChildrenForInstances(oObject, _aParents);
        iGrowth = _aChildren.length;
        _aParents = _aChildren;
        aChildren = _.union(aChildren, _aChildren);
    }
    return aChildren;
}

function insertStatementsForConfigurationInstances(oNodeMetadata) {
    var sSelectFrom = _selectFromStringDependingOnObjectType(oNodeMetadata);
    var sToTable = oNodeMetadata.table;
    var sKey = oNodeMetadata.primaryKey;
    var sColumns = util.getColumnListAsString(oNodeMetadata);
    return "insert into \"" + sToTable + "\" (" + sColumns + ") (select " + sColumns + " from " + sSelectFrom + " where " + sKey + " = ?)";
}

function executeInsertsForConfigurationInstances(oNodeMetadata, aKeys, msgBuf) {
    var sInsert = insertStatementsForConfigurationInstances(oNodeMetadata);
    _.each(aKeys, function(key) {
        try {
            DB.oHQ.statement(sInsert).execute(key);
        } catch (err) {
            msgBuf.addMessage(Message.MessageSeverity.Error, configMessage.CONF_OBJECT_REC_INSERT_EXCEPTION, "", "", "", oNodeMetadata.table, key, err.toString(), sInsert);
        }
    });
}

function clearConfigurationTable(oNodeMetadata, msgBuf) {
    var sDelete = "delete from \"" + oNodeMetadata.table + "\"";
    try {
        DB.oHQ.statement(sDelete).execute();
    } catch (err) {
        msgBuf.addMessage(Message.MessageSeverity.Error, configMessage.CONF_OBJECT_DELETE_EXCEPTION, "", "", "", oNodeMetadata.table, err.toString(), sDelete);
        return false;
    }
    return true;
}

function selectAllFromConfigurationTable(oNodeMetadata) {
    return DB.oHQ.statement("select * from \"" + oNodeMetadata.table + "\"").execute();
}

function getConfigurationObjects(oMsgBuf) {
    return util.getObjectOfType(ObjectTypes.CONFIGURATION, DB.getHQ(), oMsgBuf);
}

function getApplicationObjects(oMsgBuf) {
    return util.getObjectOfType(ObjectTypes.STANDARD, DB.getHQ(), oMsgBuf);
}

function getStageObjects(oMsgBuf) {
    return util.getObjectOfType(ObjectTypes.STAGE, DB.getHQ(), oMsgBuf);
}

function createScope(aConfigurationObjects, aStageObjects, aApplicationObjects, oHq) {
    var _aConfigurationObjects = aConfigurationObjects;
    var _aStageObjects = aStageObjects;
    var _aApplicationObjects = aApplicationObjects;
    var _oConfigurationObjectsMap = _.indexBy(_aConfigurationObjects, function(oConf) {
        return oConf.getObjectMetadata().name;
    });
    var _oStageObjectsMap = _.indexBy(_aStageObjects, function(oConf) {
        return oConf.getObjectMetadata().name;
    });
    var _oApplicationObjectsMap = _.indexBy(_aApplicationObjects, function(oConf) {
        return oConf.getObjectMetadata().name;
    });
    var _aApplicationNodes = _.flatten(_.map(_.values(_aApplicationObjects), function(oObject) {
        return oObject.getAllNodeMetadata();
    }));
    var _aConfigurationNodes = _.flatten(_.map(_.values(_aConfigurationObjects), function(oObject) {
        return oObject.getAllNodeMetadata();
    }));
    var _aForeignKeyDescriptorsFromApplicationToConfiguration = getForeignKeyToDescriptorsForNodes(_aApplicationNodes, _aConfigurationNodes);
    var _oForeignKeyDescriptorsFromApplicationToConfigurationGroupedByNodeName = _.groupBy(_aForeignKeyDescriptorsFromApplicationToConfiguration, function(desc) {
        return desc.sFKObjectName + desc.sFKNodeName;
    });

    var oScope = {
        isConfigurationObject : function(sName) {
            return _.has(_oConfigurationObjectsMap, sName);
        },
        isStageObject : function(sName) {
            return _.has(_oStageObjectsMap, sName);
        },
        isApplicationObject : function(sName) {
            return _.has(_oApplicationObjectsMap, sName);
        },
        getConfigurationObjects : function() {
            return _aConfigurationObjects;
        },
        getStageObjects : function() {
            return _aStageObjects;
        },
        getApplicationObjects : function() {
            return _aApplicationObjects;
        },
        getConfigurationObjectsMap : function() {
            return _oConfigurationObjectsMap;
        },
        getStageObjectsMap : function() {
            return _oStageObjectsMap;
        },
        getApplicationObjectsMap : function() {
            return _oApplicationObjectsMap;
        },
        getConfigurationObject : function(sName) {
            return _oConfigurationObjectsMap[sName];
        },
        getStageObject : function(sName) {
            return _oStageObjectsMap[sName];
        },
        getApplicationObject : function(sName) {
            return _oApplicationObjectsMap[sName];
        },
        getHQ : function() {
            return oHq;
        },
        getApplicationNodes : function() {
            return _aApplicationNodes;
        },
        getConfigurationNodes : function() {
            return _aConfigurationNodes;
        },
        getForeignKeyDescriptorsFromApplicationToConfiguration : function() {
            return _aForeignKeyDescriptorsFromApplicationToConfiguration;
        },
        getForeignKeyDescriptorsFromApplicationToConfigurationGroupedByNodeName : function() {
            return _oForeignKeyDescriptorsFromApplicationToConfigurationGroupedByNodeName;
        }
    };
    return oScope;
}

function activateConfiguration(oScope, msgBuf) {
    var aConfigurationObjects = filterConfigurationObjects(oScope, msgBuf);

    _.each(aConfigurationObjects, function(oConfigurationObject) {
        var sObjectName = oConfigurationObject.getObjectMetadata().name;
        try {
            var aExternallyRejected = externalActivationCheck(oConfigurationObject, oScope, msgBuf);
            meta.visitMetadataTree(oConfigurationObject, function(oNodeMetadata, oParent) {
                var oNodeName = oNodeMetadata.name;
                var aInstances = retrieveValidInstances(oConfigurationObject, oNodeMetadata, oParent, oScope, msgBuf);
                aInstances = _.reject(aInstances, function(key) {
                    var element = _.find(aExternallyRejected, function(rejected) {
                        return (rejected.ObjectName === sObjectName && rejected[oNodeName] && _.indexOf(rejected[oNodeName], key) != -1);
                    });
                    return element;
                });
                if (clearConfigurationTable(oNodeMetadata, msgBuf)) {
                    executeInsertsForConfigurationInstances(oNodeMetadata, aInstances, msgBuf);
                }
                return oNodeMetadata;
            });
        } catch (err) {
            msgBuf.addMessage(Message.MessageSeverity.Error, configMessage.CONF_OBJECT_ACTIVATE_EXCEPTION, "", "", "", oConfigurationObject.getObjectMetadata().name, err.name, err.message, err.fileName, err.lineNumber, err.columnNumber);
        }
    });
}

var HISTORY_SEQUENCE = "sap.ino.db.config::s_activation_history";
var HISTORY_TABLE = "sap.ino.db.config::t_activation_history";

function writeActivationHistory(sStatus, oHQ) {
    sStatus = "'" + sStatus + "'";
    var sSequence = "select \"" + HISTORY_SEQUENCE + "\".nextval as val from dummy";
    var sNextValue = oHQ.statement(sSequence).execute()[0].VAL;
    var oAppUser = auth.getApplicationUser();
    var sAppUserId =  oAppUser ? oAppUser.ID : -1;
    var sTime = new Date().toISOString();
    var sInsert = "insert into \"" + HISTORY_TABLE + "\" (ID, ACTIVATED_AT, ACTIVATED_BY_ID, STATUS) values (?, ?, ?, ?)";
    oHQ.statement(sInsert).execute(sNextValue, sTime, sAppUserId, sStatus);
    oHQ.getConnection().commit();
}

function _mapMessagesToResult(aMessages) {
    var mSeverityMapping = {};
    // Fatal is new - to stay compatible we map it to E
    mSeverityMapping[msg.MessageSeverity.Fatal] = "E";
    mSeverityMapping[msg.MessageSeverity.Error] = "E";
    mSeverityMapping[msg.MessageSeverity.Warning] = "W";
    mSeverityMapping[msg.MessageSeverity.Info] = "I";
    mSeverityMapping[msg.MessageSeverity.Debug] = "D";

    return _.map(aMessages, function(oMessage) {
        return _.mapObject(oMessage, {
            severity : {
                key : "TYPE",
                copy : function(vValue) {
                    return mSeverityMapping[vValue];
                },
            },
            messageKey : "MESSAGE",
            refKey : "REF_ID",
            refNode : "REF_NODE",
            refAttribute : "REF_FIELD",
            parameters : "PARAMETERS"
        });
    });
}

function _mapError(err) {
    return {
        name : err.name,
        message : err.message,
        fileName : err.fileName,
        lineNumber : err.lineNumber,
        columnNumber : err.columnNumber
    };
}

function handleActivation(oResponse) {
    var msgBuf = msg.createMessageBuffer();
    var o2ndHQ;
    var aMessageText;

    try {
        var oHQ = DB.getHQ();
        var aConfigurationObjects = getConfigurationObjects(msgBuf);

        fullActivation(msgBuf, oHQ);

        var aMessages = msgBuf.getMessages();

        if (msgBuf.getMinSeverity() <= msg.MessageSeverity.Error) {
            DB.Transaction.rollback();

            o2ndHQ = DB.getSecondaryHQ();
            writeActivationHistory("FAILURE", o2ndHQ);
            aMessageText = msg.getMessageArrayText(aMessages, o2ndHQ);
            o2ndHQ.getConnection().close();

            oHQ.getConnection().close();

            oResponse.status = $.net.http.BAD_REQUEST;
            oResponse.contentType = "application/json";
            oResponse.setBody(JSON.stringify(aMessageText));
        } else {
            DB.Transaction.commit();

            o2ndHQ = DB.getSecondaryHQ();
            writeActivationHistory("SUCCESS", o2ndHQ);

            var aObjectNames = [];
            _.each(aConfigurationObjects, function(oObject) {
                var oMetadata = oObject.getObjectMetadata();
                aObjectNames.push(oMetadata.name);
            });
            
            var sObjectNames = JSON.stringify(aObjectNames);

            msgBuf.addMessage(Message.MessageSeverity.Info, configMessage.CONF_OBJECT_ACTIVATED_OBJECTS, "", "", "", sObjectNames);
            aMessages = msgBuf.getMessages();

            aMessageText = msg.getMessageArrayText(aMessages, o2ndHQ);
            o2ndHQ.getConnection().close();
            
            oHQ.getConnection().close();
            
            oResponse.status = $.net.http.CREATED;
            oResponse.contentType = "application/json";
            oResponse.setBody(JSON.stringify(aMessageText));
        }
        return;
    } catch (err) {
        o2ndHQ = DB.getSecondaryHQ();
        writeActivationHistory("FAILURE", o2ndHQ);

        var sBody;
        if (err instanceof msg.CancelProcessingException) {
            var messages = msgBuf.getMessages();
            aMessageText = msg.getMessageArrayText(messages, o2ndHQ);
            sBody = JSON.stringify(aMessageText);
        } else {
            sBody = JSON.stringify(_mapError(err));
        }
        o2ndHQ.getConnection().close();

        try {
            DB.Transaction.rollback();
            DB.getHQ().getConnection().close();
        }
        catch(e){ 
            /* when connection was closed before an exception occurs */ 
        }

        oResponse.status = $.net.http.INTERNAL_SERVER_ERROR;
        oResponse.contentType = "application/json";
        oResponse.setBody(sBody);
        return;
    }
}

function getFullScope(msgBuf, oHQ){
    importLib.importAllContent(oHQ, msgBuf);

    var aConfigurationObjects = getConfigurationObjects(msgBuf);
    var aApplicationObjects = getApplicationObjects(msgBuf);
    var aStageObjects = getStageObjects(msgBuf);

    var oScope = createScope(aConfigurationObjects, aStageObjects, aApplicationObjects, oHQ);
    return oScope;
}

function fullActivation(msgBuf, oHQ) {
    var oUser = auth.getApplicationUser();
    if (!oUser) {
        // msgBuf.addMessage(Message.MessageSeverity.Fatal, configMessage.CONFIG_ACTIVATION_BY_UNKNOWN_USER, undefined, undefined, undefined, $.session.getUsername());
    }
    var oScope = getFullScope(msgBuf, oHQ);
    activateConfiguration(oScope, msgBuf);
}

function activateSingleInstanceUnchecked(oStageObjectInstance, oStageObjectBeforeInstance, oStageObject, addMessage, oContext) {
    var oConfigurationObject = frmwk.getMetadata(util.getConfigObjectName(oStageObject.getObjectMetadata().name));
    _activateSingleInstanceUnchecked(oStageObjectInstance, oStageObjectBeforeInstance, oStageObject, oConfigurationObject, addMessage, oContext);
}

function _instanceInDifferentPackageExists(oStageObjectInstance, oStageObject, oConfigurationObject) {
    var sConfigPrimaryKey = oConfigurationObject.getNodeMetadata(frmwk.Node.Root).primaryKey;
    var sStagePrimaryKey = oStageObject.getNodeMetadata(frmwk.Node.Root).primaryKey;
    var sStageTable = oStageObject.getNodeMetadata(frmwk.Node.Root).table;

    var aOtherInstances = DB.getHQ().statement('\
            select top 1 ' + sStagePrimaryKey + '\
            from "' + sStageTable + '"\
            where ' + sConfigPrimaryKey + ' = ? and (' + sStagePrimaryKey + ' <> ? or ' + sStagePrimaryKey + ' is null )\
            ').execute(oStageObjectInstance[sConfigPrimaryKey], oStageObjectInstance[sStagePrimaryKey]);

    return aOtherInstances.length > 0;
}

function _activateSingleInstanceUnchecked(oStageObjectInstance, oStageObjectBeforeInstance, oStageObject, oConfigurationObject, addMessage, oContext) {

    var sActionName = oContext.getAction().name;

    if (sActionName === frmwk.Action.Del && _instanceInDifferentPackageExists(oStageObjectInstance, oStageObject, oConfigurationObject)) {
        // Only warning so that staging object can still be saved
        addMessage(Message.MessageSeverity.Warning, configMessage.CONF_NO_SINGLE_ACTIVATION);
        return;
    }

    var fnPersist;
    switch (sActionName) {
        case frmwk.Action.Create :
        case frmwk.Action.Copy :
            fnPersist = DB.create;
            break;
        case frmwk.Action.Del :
            fnPersist = DB.del;
            break;
        // Update or custom action
        default :
            fnPersist = function(oObject, oMetadata, addMessage, oContext) {
                var sConfigPrimaryKey = oConfigurationObject.getNodeMetadata(frmwk.Node.Root).primaryKey;
                var bConfigPrimaryKeyChanged = oStageObjectBeforeInstance && (oStageObjectBeforeInstance[sConfigPrimaryKey] !== oStageObjectInstance[sConfigPrimaryKey]);
                if (bConfigPrimaryKeyChanged) {
                    DB.del(oStageObjectBeforeInstance, oConfigurationObject, addMessage, oContext);
                    if (!DB.exists(oStageObjectInstance[sConfigPrimaryKey], oConfigurationObject)) {
                        DB.create(oStageObjectInstance, oConfigurationObject, addMessage, oContext);
                    } else {
                        // pathological case: that new code might be there already by imported content
                        // do an update instead
                        DB.update.apply(DB, arguments);
                    }
                } else {
                    DB.update.apply(DB, arguments);
                }
            };
            break;
    }
    fnPersist(oStageObjectInstance, oConfigurationObject, addMessage, oContext);
}
