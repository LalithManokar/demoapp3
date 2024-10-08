// Libraries
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var Metadata = $.import("sap.ino.xs.aof.core", "metadata");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var MessageSeverity = Message.MessageSeverity;
var CancelProcessingException = Message.CancelProcessingException;

// "Enum" for framework db layer messages
var Messages = {
    BULK_CONDITION_MISSING : "MSG_BULK_CONDITION_MISSING",
    BULK_UNCLEAR_OPERATION_NODE : "MSG_BULK_UNCLEAR_OPERATION_NODE",
    BULK_INVALID_NODE_NAME : "MSG_BULK_INVALID_NODE_NAME",
    BULK_INVALID_OPERATION : "MSG_BULK_INVALID_OPERATION",
    BULK_PK_UPDATE_NOT_ALLOWED : "MSG_BULK_PK_UPDATE_NOT_ALLOWED",
    BULK_CK_UPDATE_NOT_ALLOWED : "MSG_BULK_CK_UPDATE_NOT_ALLOWED"
};

var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");

const getHQ = dbConnection.getHQ;
const getSecondaryHQ = dbConnection.getSecondaryHQ;
this.Transaction = {
    commit : function() {
        oConn.commit();
    },
    rollback : function() {
        oConn.rollback();
    }
};
var oHQ = getHQ();
var oConn = oHQ.getConnection();

var sDefaultSchema;
function setDefaultSchema(sSchema) {
    this.sDefaultSchema = sSchema;
}

var HistoryDBEvent = {
    Created : "CREATED",
    Updated : "UPDATED",
    Deleted : "DELETED"
};

var mObjectBuffer = {};
function read(vKey, oMetadataAccess, bBypassBuffer, mVirtualTables, bLock) {
    bBypassBuffer = (bBypassBuffer === undefined && bLock === undefined) ? false : (bBypassBuffer || bLock);

    var mTableRows;
    if (bBypassBuffer) {
        mTableRows = _readTableRows(vKey, oMetadataAccess, mVirtualTables, bLock);
        return _mapTableRowsToObject(mTableRows, oMetadataAccess);
    }

    var sObjectName = oMetadataAccess.getObjectMetadata().name;
    mObjectBuffer[sObjectName] = mObjectBuffer[sObjectName] || {};

    var oBufferedObject = mObjectBuffer[sObjectName][vKey];
    if (!oBufferedObject) {
        mTableRows = _readTableRowsBuffered(vKey, oMetadataAccess, mVirtualTables);
        if (_.isEqual(mTableRows, {})) {
            oBufferedObject = null;
        } else {
            oBufferedObject = _mapTableRowsToObject(mTableRows, oMetadataAccess);
        }
        mObjectBuffer[sObjectName][vKey] = oBufferedObject;
    }
    return oBufferedObject;
}

function create(oObject, oMetadataAccess, fnMessage, oContext) {
    // in create nothing is persisted, so we make a diff against an empty table
    // rows object
    var mPersistedTableRows = _getEmptyTableRows(oMetadataAccess);
    var mTableRows = _mapObjectToTableRows(oObject, oMetadataAccess);
    _modify(mPersistedTableRows, mTableRows, fnMessage, oContext);
}

function update(oObject, oMetadataAccess, fnMessage, oContext) {
    var sObjectName = oMetadataAccess.getObjectMetadata().name;
    var vKey = oMetadataAccess.getNodeKeyValue(Metadata.Node.Root, oObject);

    var mPersistedTableRows = _readTableRowsBuffered(vKey, oMetadataAccess);
    var mTableRows = _mapObjectToTableRows(oObject, oMetadataAccess);
    _modify(mPersistedTableRows, mTableRows, fnMessage, oContext);
    _invalidateBuffers(sObjectName, vKey);
}

function del(oObject, oMetadataAccess, fnMessage, oContext) {
    var sObjectName = oMetadataAccess.getObjectMetadata().name;
    var vKey = oMetadataAccess.getNodeKeyValue(Metadata.Node.Root, oObject);

    var mPersistedTableRows = _readTableRowsBuffered(vKey, oMetadataAccess);
    // when deleting the target are empty tables
    var mTableRows = _getEmptyTableRows(oMetadataAccess);
    _modify(mPersistedTableRows, mTableRows, fnMessage, oContext);
    _invalidateBuffers(sObjectName, vKey);
}

function exists(vKey, oMetadataAccess, sNodeName) {
    sNodeName = sNodeName || Metadata.Node.Root;
    var oNodeMetadata = oMetadataAccess.getNodeMetadata(sNodeName);

    if (!oNodeMetadata) {
        _.raiseException("Node " + sNodeName + " does not exist.");
    }

    var sSelect = 'select "' + oNodeMetadata.primaryKey + '" from "' + oNodeMetadata.table + '" where ' + oNodeMetadata.primaryKey + ' = ?';

    var aPlaceholderValues = [vKey];
    _.each(oNodeMetadata.constantKeys, function(sValue, sColumn) {
        sSelect += ' and "' + sColumn + '" = ? ';
        aPlaceholderValues.push(sValue);
    });

    var aResult = oHQ.statement(sSelect).execute(aPlaceholderValues);

    if (aResult.length > 1) {
        _.raiseException("Primary key definition of node '" + oNodeMetadata.name + "' is not unique");
    }
    return aResult.length === 1;
}

function getSequence(sSequenceName) {
    return function() {
        return oHQ.sequence("PUBLIC", sSequenceName).nextval();
    };
}

function getNodeMetadata(oNodeDefinition) {
    var sTable = oNodeDefinition.table;
    // this adds the name and schema on node level
    var oFullQualifiedTableName = _resolveSynonym(sTable);
    var aCatalogMetadata = _getColumnCatalogMetadata(oFullQualifiedTableName.schema, oFullQualifiedTableName.table);
    return _mapNodeFromTable(oNodeDefinition, oFullQualifiedTableName, aCatalogMetadata);
}

function getNodeKeys(oObject, oMetadataAccess) {
    var oTableRows = _mapObjectToTableRows(oObject, oMetadataAccess);
    return _.mapObjects(oTableRows, function(oTableRow, vKey) {
        return _.pluck(oTableRow.rows, oTableRow.primaryKey);
    });
}

function _modify(mPersistedTableRows, mTableRows, fnMessage, oContext) {
    var mTableRowDelta = _calculateRowDelta(mTableRows, mPersistedTableRows);
    var mHistoryTableDelta = _calculateHistoryTable(mTableRowDelta, oContext);
    _.extend(mTableRowDelta, mHistoryTableDelta);
    _writeTableRows(mTableRowDelta, fnMessage);
}

/**
 * 
 * @param oObject
 * @param oMetadataAccess
 * 
 * @returns { "node" : { "schema" : ABC, "primaryKey": "ID", "rows" : [ {ID: 5711, ATTR1: "5712"} ] }}
 */
function _mapObjectToTableRows(oObject, oMetadataAccess) {

    function getCleanWorkObjectNode(oWorkObjectNode, oNodeMetadata) {
        var oClone = _.cloneFiltered(oWorkObjectNode, function(vValue, sAttributeName) {
            return _.contains(oNodeMetadata.persistedAttributes, sAttributeName);
        });

        // add constant key attributes
        _.each(oNodeMetadata.constantKeys, function(sValue, sAttributeName) {
            oClone[sAttributeName] = sValue;
        });
        return oClone;
    }

    var mTableRows = {};

    // 1. Construct relational representation from tree
    Metadata.visitMetadataTree(oMetadataAccess, function(oNodeMetadata, oParent) {
        var aWorkObjectNode = [];
        var aCleanWorkObjectNode = [];

        // Root node
        if (!oParent) {
            aWorkObjectNode.push(oObject);
            aCleanWorkObjectNode = [getCleanWorkObjectNode(oObject, oNodeMetadata)];
        } else {
            // Sub nodes
            _.each(oParent.objects, function(oParentWorkObjectNode) {

                // child node not present
                if (!_.has(oParentWorkObjectNode, oNodeMetadata.name)) {
                    return;
                }
                var aWorkObjectChildNode = oParentWorkObjectNode[oNodeMetadata.name];

                var fnCleanWorkObjectNode = function(oWorkObjectChildNode) {
                    var oCleanWorkObjectChildNode = getCleanWorkObjectNode(oWorkObjectChildNode, oNodeMetadata);
                    var vParentKey = oParentWorkObjectNode[oParent.metadata.primaryKey];
                    oCleanWorkObjectChildNode[oNodeMetadata.parentKey] = vParentKey;
                    return oCleanWorkObjectChildNode;
                };

                var aCleanWorkObjectChildNode = _.map(aWorkObjectChildNode, fnCleanWorkObjectNode);

                aWorkObjectNode = aWorkObjectNode.concat(aWorkObjectChildNode);
                aCleanWorkObjectNode = aCleanWorkObjectNode.concat(aCleanWorkObjectChildNode);
            });
        }

        mTableRows[oNodeMetadata.name] = {
            schema : oNodeMetadata.schema,
            table : oNodeMetadata.table,
            historyTable : oNodeMetadata.historyTable,
            primaryKey : oNodeMetadata.primaryKey,
            isDatabasePrimaryKey : oNodeMetadata.isDatabasePrimaryKey,
            node : oNodeMetadata.name,
            rows : aCleanWorkObjectNode,
        };

        return {
            metadata : oNodeMetadata,
            objects : aWorkObjectNode
        };

    });
    return mTableRows;
}

// Construct tree from relational table row representation
function _mapTableRowsToObject(mTableRows, oMetadataAccess) {
    var oObject = {};

    Metadata.visitMetadataTree(oMetadataAccess, function(oNodeMetadata, oParent) {
        if (!mTableRows[oNodeMetadata.name]) {
            return undefined;
        }

        var aNodeData = mTableRows[oNodeMetadata.name].rows;
        var oInitialTransientAttributes = _.reduce(oNodeMetadata.transientAttributes, function(oObject, sAttributeName) {
            oObject[sAttributeName] = null;
            return oObject;
        }, {});

        // Root node
        if (!oParent) {
            _.extend(oObject, _.first(aNodeData), oInitialTransientAttributes);
            return {
                metadata : oNodeMetadata,
                objects : [oObject]
            };
        }

        // collect children to return the copies to next recursion level
        var aChildren = [];

        _.each(oParent.objects, function(oParentNode) {
            var oChildDataFilter = {};

            // retrieve child data for given parent instance
            // example for filter: { PARENT_ID : 5811 }
            oChildDataFilter[oNodeMetadata.parentKey] = oParentNode[oParent.metadata.primaryKey];
            var aChildData = _.where(aNodeData, oChildDataFilter);

            // Attach child data to parent, make parent key disappear from structure
            // Copy data so that the original data is not touched and messes the tree

            var aCleanChildren = _.map(aChildData, function(oChildData) {
                if (oNodeMetadata.primaryKey !== oNodeMetadata.parentKey) {
                    oChildData = _.omit(oChildData, oNodeMetadata.parentKey);
                }
                return _.extend(oChildData, oInitialTransientAttributes);
            });

            oParentNode[oNodeMetadata.name] = aCleanChildren;
            aChildren = aChildren.concat(aCleanChildren);
        });

        return {
            metadata : oNodeMetadata,
            objects : aChildren
        };
    });
    return oObject;
}

// This will buffer the table reads from the database until the
// next modification call to the store for the respective object
var mTableRowBuffer = {};
function _readTableRowsBuffered(vKey, oMetadataAccess, mVirtualTables) {
    var sObjectName = oMetadataAccess.getObjectMetadata().name;

    var mTableRows = mTableRowBuffer[sObjectName] && mTableRowBuffer[sObjectName][vKey];
    if (mTableRows) {
        return mTableRows;
    }

    mTableRows = _readTableRows(vKey, oMetadataAccess, mVirtualTables);
    if (!mTableRowBuffer[sObjectName]) {
        mTableRowBuffer[sObjectName] = {};
    }

    mTableRowBuffer[sObjectName][vKey] = mTableRows;
    return mTableRows;
}

function invalidateObject(sObjectName, vKey) {
    _invalidateBuffers(sObjectName, vKey);
}

function _invalidateBuffers(sObjectName, vKey) {
    if (vKey) {
        if (mObjectBuffer[sObjectName]) {
            delete mObjectBuffer[sObjectName][vKey];
        }

        if (mTableRowBuffer[sObjectName]) {
            delete mTableRowBuffer[sObjectName][vKey];
        }
    } else {
        mObjectBuffer[sObjectName] = {};
        mTableRowBuffer[sObjectName] = {};
    }
}

function _writeTableRows(mTableRowDelta, fnMessage) {
    _.each(mTableRowDelta, function(oTableRowDelta, sTable) {
        try {
            var oHQTable = oHQ.table(oTableRowDelta.schema, sTable);
            if (oTableRowDelta.deleteRows) {
                _deleteRows(sTable, oTableRowDelta.primaryKey, oTableRowDelta.deleteRows);
            }
            if (oTableRowDelta.insertRows) {
                oHQTable.insert(oTableRowDelta.insertRows);
            }
            if (oTableRowDelta.updateRows) {
                oHQTable.upsert(oTableRowDelta.updateRows);
            }
        } catch (oException) {
            throw oException;
        }
    });
}

function _deleteRows(sTable, sPrimaryKey, aRows) {
    if (!aRows || aRows.length === 0) {
        return;
    }

    var sPlaceholders = _.map(_.range(aRows.length), _.constant('?')).join(",");
    var sDelete = 'delete from "' + sTable + '" where ' + sPrimaryKey + ' in (' + sPlaceholders + ')';
    oHQ.statement(sDelete).execute(_.pluck(aRows, sPrimaryKey));
}

function _getEmptyTableRows(oMetadataAccess) {
    var mTableRows = {};
    _.each(oMetadataAccess.getAllNodeMetadata(), function(oNodeMetadata) {
        mTableRows[oNodeMetadata.name] = {
            schema : oNodeMetadata.schema,
            table : oNodeMetadata.table,
            primaryKey : oNodeMetadata.primaryKey,
            isDatabasePrimaryKey : oNodeMetadata.isDatabasePrimaryKey,
            historyTable : oNodeMetadata.historyTable,
            node : oNodeMetadata.name,
            rows : []
        };
    });
    return mTableRows;
}

function _readTableRows(vKey, oMetadataAccess, mVirtualTables, bLock) {
    var mTableRows = {};
    mVirtualTables = mVirtualTables || {};

    // Virtual tables allow to read the data from another "virtual" data source which is a
    // sql statement returning a view-like structure. It is being used for retrieving the object representation
    // from staging tables

    // Prerequisite is of course that the sql statement has exactly the same columns
    // as the "real" table

    // the parameter bLock locks the root instance within the running transaction

    var oRootMetadata = oMetadataAccess.getNodeMetadata(Metadata.Node.Root);
    Metadata.visitMetadataTree(oMetadataAccess, function(oNodeMetadata, aParentKeys) {
        var sSelect, aNodeData;
        var aPlaceholderValues = [];

        var sSource = mVirtualTables[oNodeMetadata.table] || ('"' + oNodeMetadata.table + '"');
        // Root node
        if (!aParentKeys) {
            sSelect = 'select * from ' + sSource + ' where ' + oNodeMetadata.primaryKey + ' = ?';
            aParentKeys = [vKey];
        } else {
            if (aParentKeys.length === 0) {
                return [];
            }
            var sPlaceholders = _.map(aParentKeys, _.constant('?')).join(",");
            sSelect = 'select * from ' + sSource + ' where ' + oNodeMetadata.parentKey + ' in (' + sPlaceholders + ')';
        }

        aPlaceholderValues = aPlaceholderValues.concat(aParentKeys);

        _.each(oNodeMetadata.constantKeys, function(sValue, sColumn) {
            sSelect += ' and "' + sColumn + '" = ? ';
            aPlaceholderValues.push(sValue);
        });

        // Lock root node
        if (bLock && oNodeMetadata.name === Metadata.Node.Root) {
            sSelect += ' for update';
        }

        aNodeData = mapNodeSelectResult(oHQ.statement(sSelect).execute(aPlaceholderValues), oNodeMetadata);
        mTableRows[oNodeMetadata.name] = {
            schema : oNodeMetadata.schema,
            table : oNodeMetadata.table,
            primaryKey : oNodeMetadata.primaryKey,
            node : oNodeMetadata.name,
            rows : aNodeData
        };
        return _.pluck(aNodeData, oNodeMetadata.primaryKey);
    });

    // If root node is empty return empty object as object does not exist
    if (mTableRows[oRootMetadata.name].rows.length === 0) {
        return {};
    }
    return mTableRows;
}

function mapNodeSelectResult(aResult, oNodeMetadata) {
    return _.map(aResult,function _normalizeData(oObject) {
        return _.mapObjects(oObject, function(vValue, vKey) {
            var sDataType = oNodeMetadata.attributes[vKey] && oNodeMetadata.attributes[vKey].dataType;
            if (!sDataType) {
                return vValue;
            }
            if (vValue instanceof ArrayBuffer && (sDataType ===  Metadata.DataType.CLOB || sDataType ===  Metadata.DataType.NCLOB)) {
                // decode string from UTF-8 representation in array buffer
                return $.util.stringify(vValue);
            }
            if (sDataType === Metadata.DataType.DATE && _.isString(vValue)) {
                // the database API returns the ISO timestamp string, we need to cut it off
                // to just get the date part
                return vValue.substring(0,10);
            }
            return vValue;
        });
    });
}

function _calculateRowDelta(mTargetRows, mSourceRows) {
    var mResult = {};
    _.each(mTargetRows, function(oTableRow, sNode) {
        var sTable = oTableRow.table;
        var oNodeResult = {};

        oNodeResult = _.groupBy(oTableRow.rows, function(oTargetRow) {
            // Try to find the target row in the source based on primary key equality
            var oSourceRow = _.find(mSourceRows[sNode] && mSourceRows[sNode].rows, function(oSourceRow) {
                return oSourceRow[oTableRow.primaryKey] === oTargetRow[oTableRow.primaryKey];
            });
            return !oSourceRow ? "insertRows" : _.isEqual(oSourceRow, oTargetRow) ? "unchangedRows" : "updateRows";
        });

        var aRowKeysToDelete = [];
        oNodeResult.deleteRows = [];
        if (mSourceRows[sNode]) {
            var aPersistedKeys = _.pluck(mSourceRows[sNode].rows, oTableRow.primaryKey);
            var aRemainingKeys = _.pluck(mTargetRows[sNode].rows, oTableRow.primaryKey);

            aRowKeysToDelete = _.difference(aPersistedKeys, aRemainingKeys);

            oNodeResult.deleteRows = _.filter(mSourceRows[sNode].rows, function(oSourceRow) {
                return _.contains(aRowKeysToDelete, oSourceRow[oTableRow.primaryKey]);
            });
        }

        // Upsert -> delete and insert for "logical" primary keys
        if (!oTableRow.isDatabasePrimaryKey) {
            oNodeResult.deleteRows = (oNodeResult.deleteRows || []).concat(oNodeResult.updateRows || []);
            oNodeResult.insertRows = (oNodeResult.insertRows || []).concat(oNodeResult.updateRows || []);
            oNodeResult.updateRows = [];
        }

        mResult[sTable] = mResult[sTable] || _.pick(oTableRow, 'schema', 'historyTable', 'node', 'primaryKey', 'isDatabasePrimaryKey');

        // The same table can be used in multiple nodes (by using different constant keys)
        mResult[sTable].insertRows = (mResult[sTable].insertRows || []).concat(oNodeResult.insertRows || []);
        mResult[sTable].updateRows = (mResult[sTable].updateRows || []).concat(oNodeResult.updateRows || []);
        mResult[sTable].deleteRows = (mResult[sTable].deleteRows || []).concat(oNodeResult.deleteRows || []);
    });
    return mResult;
}

function _calculateHistoryTable(oTableDeltas, oContext) {

    function mapHistoryRow(sHistoryDBEvent, oRow) {
        var oHistoryRow = _.clone(oRow);
        oHistoryRow.HISTORY_DB_EVENT = sHistoryDBEvent;
        oHistoryRow.HISTORY_BIZ_EVENT = oContext.getHistoryEvent();
        oHistoryRow.HISTORY_AT = oContext.getRequestTimestamp();
        var oUser = oContext.getUser();
        oHistoryRow.HISTORY_ACTOR_ID = oUser && oUser.ID;
        return oHistoryRow;
    }

    var mResult = {};
    _.each(oTableDeltas, function(oTableDelta) {
        if (!oTableDelta.historyTable) {
            return;
        }

        var oHistoryTable = {};
        mResult[oTableDelta.historyTable] = oHistoryTable;

        // assuming the same schema as the source table
        oHistoryTable.schema = oTableDelta.schema;
        // history is for same node
        oHistoryTable.node = oTableDelta.node;
        // primary is only needed for deletion it can be omitted for history tables as they are "insert only"
        oHistoryTable.primaryKey = undefined;
        var aCreatedRows = _.map(oTableDelta.insertRows || [], _.partial(mapHistoryRow, HistoryDBEvent.Created)) || [];
        var aUpdatedRows = _.map(oTableDelta.updateRows || [], _.partial(mapHistoryRow, HistoryDBEvent.Updated)) || [];
        var aDeletedRows = _.map(oTableDelta.deleteRows || [], _.partial(mapHistoryRow, HistoryDBEvent.Deleted)) || [];

        oHistoryTable.insertRows = [].concat(aCreatedRows, aUpdatedRows, aDeletedRows);

    });

    return mResult;

}

function _resolveSynonym(sTableSynonym) {
    if (this.sDefaultSchema) {
        return {
            table : sTableSynonym,
            schema : this.sDefaultSchema
        };
    }

    var aResult = oHQ.statement("select\
                        object_name as \"table\",\
                        object_schema as \"schema\"\
                     from synonyms\
                     where schema_name = 'PUBLIC' and\
                           synonym_name = ?").execute(sTableSynonym);
    if (_.size(aResult) === 0) {
        _.raiseException("Table " + sTableSynonym + " does not exist.");
    }
    return _.first(aResult);
}

function _getColumnCatalogMetadata(sSchema, sTable) {
    // due to performance reasons we are not joining the
    // synonym table so the schema needs to be specified
    return oHQ.statement("\
                select\
                    col.column_name,\
                    col.data_type_name,\
                    col.length,\
                    col.scale,\
                    col.is_nullable,\
                    ifnull(cons.is_primary_key, 'FALSE') as is_primary_key\
                from table_columns as col\
                    left outer join constraints as cons\
                        on  cons.schema_name = col.schema_name and\
                            cons.table_name = col.table_name and\
                            cons.column_name = col.column_name and\
                            cons.is_primary_key = 'TRUE'\
                where\
                col.schema_name = ? and\
                 col.table_name = ?").execute(sSchema, sTable);
}

function _mapNodeFromTable(oNodeDefinition, oFullQualifiedTableName, aCatalogMetadata) {
    var oNode = {};

    // this adds the name and schema on node level
    _.extend(oNode, oFullQualifiedTableName);

    var aMappedAttributes = _.map(aCatalogMetadata, function(oCatalogMetadata) {
        return _.mapObject(oCatalogMetadata, {
            COLUMN_NAME : 'name',
            IS_NULLABLE : {
                key : 'required',
                copy : _.compose(_.not, _.toBool)
            },
            DATA_TYPE_NAME : 'dataType',
            LENGTH : {
                key : 'maxLength',
                check : _.exists
            },
            SCALE : {
                key : 'scale',
                check : _.exists
            },
            IS_PRIMARY_KEY : {
                key : 'isPrimaryKey',
                copy : _.toBool
            }
        });
    });

    var aPrimaryKeys = _.where(aMappedAttributes, {
        isPrimaryKey : true
    });

    // At runtime the framework can only deal with *one* primary key
    // However primary keys can be overriden in the AO definition
    // so for the database metadata multiple primary keys are accepted
    oNode.primaryKeys = _.pluck(aPrimaryKeys, 'name');
    oNode.attributes = _.indexBy(aMappedAttributes, 'name');
    return oNode;
}

function getBulkAccess(oMetadataAccess, oContext, bDefaultSimulate) {
    return {
        update : _getBulkUpdateProcessor(oMetadataAccess, oContext, bDefaultSimulate),
        del : _getBulkDeleteProcessor(oMetadataAccess, oContext, bDefaultSimulate)
    };
}

var BulkOperation = {
    Update : "update",
    Del : "del"
};

function _getBulkUpdateProcessor(oMetadata, oContext, bDefaultSimulate) {
    return function(oRequest, oFilter, bSimulate) {
        return _processBulkRequest(BulkOperation.Update, oRequest, oFilter, oMetadata, oContext, bDefaultSimulate || bSimulate);
    };
}

function _getBulkDeleteProcessor(oMetadata, oContext, bDefaultSimulate) {
    return function(oRequest, oFilter, bSimulate) {
        return _processBulkRequest(BulkOperation.Del, oRequest, oFilter, oMetadata, oContext, bDefaultSimulate || bSimulate);
    };
}

function _processBulkRequest(sBulkOperation, oChangeRequest, oFilter, oMetadata, oContext, bSimulate) {
    var oResponse = {
        messages : [],
        affectedNodes : {}
    };

    var oMessageBuffer = Message.createMessageBuffer();
    oMessageBuffer.suppressLogging(bSimulate);

    try {
        var aBulkOperations = _deriveNodeBulkOperations(sBulkOperation, oChangeRequest, oFilter, oMessageBuffer.addMessage, oMetadata, oContext);
        _.each(aBulkOperations, function(oOperation) {
            var oNodeResult = _executeNodeBulkOperation(oOperation, oMessageBuffer.addMessage, oContext, bSimulate);
            oResponse.affectedNodes[oOperation.nodeMetadata.name] = oNodeResult;
        });

        _invalidateBuffers(oMetadata.getObjectMetadata().name);

    } catch (oException) {
        // exception is raised by message buffer when abort message
        // is added
        if (!(oException instanceof CancelProcessingException)) {
            throw oException;
        }
    } finally {
        oResponse.messages = oMessageBuffer.getMessages();
    }
    return oResponse;
}

function _conditionNodeAlias(oFilter) {
    return oFilter.conditionNodeAlias ? " as " + oFilter.conditionNodeAlias + " " : "";
}

function _deriveNodeBulkOperations(sBulkOperation, oRequest, oFilter, addMessage, oMetadata, oContext) {
    if (!oFilter || !oFilter.condition) {
        addMessage(MessageSeverity.Fatal, Messages.BULK_CONDITION_MISSING);
    }

    var aRequestNodes = _.keys(oRequest);
    if (aRequestNodes.length != 1) {
        addMessage(MessageSeverity.Fatal, Messages.BULK_UNCLEAR_OPERATION_NODE);
    }

    var sLeadingBulkOperationNodeName = aRequestNodes[0];
    var aNodeBulkOperations = [];

    function _deriveOperationsFromRequestData(oNodeSubRequest, oFilter, sNodeName, oChildNodeMetadata) {
        var oNodeMetadata = oMetadata.getNodeMetadata(sNodeName);
        if (!oNodeMetadata) {
            addMessage(MessageSeverity.Fatal, Messages.BULK_INVALID_NODE_NAME);
        }

        var oChangePerNode = {};
        var oFilterPerNode = _.clone(oFilter);

        var oNodeBulkOperation = {
            name : sBulkOperation,
            change : oChangePerNode,
            filter : oFilterPerNode,
            nodeMetadata : oNodeMetadata
        };

        // Updates of parent nodes need to be processed before child nodes
        // updating child nodes can invalidate the selection condition
        aNodeBulkOperations.unshift(oNodeBulkOperation);

        if (oChildNodeMetadata) {
            // Parents are updated when children are deleted
            if (sBulkOperation === BulkOperation.Del) {
                oNodeBulkOperation.name = BulkOperation.Update;
            }

            var sParentFilterCondition = oNodeMetadata.primaryKey + " in ( select " + oChildNodeMetadata.parentKey + ' from "' + oChildNodeMetadata.table + '"' + _conditionNodeAlias(oFilter) + " where " + oFilter.condition + ")";
            oFilterPerNode.condition = sParentFilterCondition;
            // node alias only on leading node
            oFilterPerNode.conditionNodeAlias = null;
        }

        _.each(oNodeMetadata.constantKeys, function(sValue, sColumn) {
            oFilterPerNode.condition += ' and "' + sColumn + '" = ? ';
            oFilterPerNode.conditionParameters.push(sValue);
        });

        _.each(oNodeSubRequest, function(vValue, vProp) {
            if (oNodeMetadata.parentNode === vProp) {
                _deriveOperationsFromRequestData(vValue, oFilterPerNode, vProp, oNodeMetadata);
                return;
            }
            if (_.contains(oNodeMetadata.persistedAttributes, vProp)) {
                if (vProp === oNodeMetadata.primaryKey) {
                    addMessage(MessageSeverity.Fatal, Messages.BULK_PK_UPDATE_NOT_ALLOWED);
                }

                if (oNodeMetadata.constantKeys && oNodeMetadata.constantKeys[vProp] !== undefined) {
                    addMessage(MessageSeverity.Fatal, Messages.BULK_CK_UPDATE_NOT_ALLOWED);
                }

                oChangePerNode[vProp] = vValue;
            }
        });
    }

    function _deriveChildDeleteOperations(oParentNodeMetadata, oFilter) {
        var aChildNodes = oMetadata.getSubNodeMetadata(oParentNodeMetadata.name);
        if (aChildNodes.length === 0) {
            return;
        }
        _.each(aChildNodes, function(oChildNodeMetadata) {
            var oChildFilter = _.clone(oFilter);

            // node alias only on leading node
            oChildFilter.conditionNodeAlias = null;
            oChildFilter.condition = oChildNodeMetadata.parentKey + " in ( select " + oParentNodeMetadata.primaryKey + ' from "' + oParentNodeMetadata.schema + '"."' + oParentNodeMetadata.table + '"' + _conditionNodeAlias(oFilter) + " where " + oFilter.condition + ")";

            _.each(oChildNodeMetadata.constantKeys, function(sValue, sColumn) {
                oChildFilter.condition += ' and "' + sColumn + '" = ? ';
                oChildFilter.conditionParameters.push(sValue);
            });

            var oChildDeleteOperation = {
                name : BulkOperation.Del,
                change : {},
                filter : oChildFilter,
                nodeMetadata : oChildNodeMetadata
            };
            // delete children before parents otherwise children cannot be identified any more
            aNodeBulkOperations.unshift(oChildDeleteOperation);
            _deriveChildDeleteOperations(oChildNodeMetadata, oChildFilter);
        });
    }

    _deriveOperationsFromRequestData(oRequest[sLeadingBulkOperationNodeName], oFilter, sLeadingBulkOperationNodeName);
    if (sBulkOperation === BulkOperation.Del) {
        _deriveChildDeleteOperations(oMetadata.getNodeMetadata(sLeadingBulkOperationNodeName), oFilter);
    }

    return aNodeBulkOperations;

}

function _executeNodeBulkOperation(oOperation, addMessage, oContext, bSimulate) {
    bSimulate = bSimulate || false;
    var oNodeMetadata = oOperation.nodeMetadata;

    var oResponse = {
        operation : oOperation.name,
        count : 0
    };

    if (oOperation.name === BulkOperation.Update && _.isEqual(oOperation.change, {})) {
        return oResponse;
    }

    var sCountStatement = 'select to_integer(count(*)) as cnt from "' + oNodeMetadata.schema + '"."' + oNodeMetadata.table + '"' + _conditionNodeAlias(oOperation.filter) + ' where ' + oOperation.filter.condition;
    oResponse.count = oHQ.statement(sCountStatement).execute(oOperation.filter.conditionParameters)[0].CNT;

    if (bSimulate) {
        return oResponse;
    }

    var aNodePlugin = [$.import("sap.ino.xs.aof.plugin", "cascadeDelete")];
    _.each(aNodePlugin, function(oPlugin) {
        oPlugin.executeNodeBulkOperation(oResponse, oOperation, addMessage, oContext, bSimulate);
    });

    var sHistoryStatement = null;
    var aHistoryParameterValues = [];

    // History table update
    if (oNodeMetadata.historyTable) {

        var mOperationHistoryEvent = {};
        mOperationHistoryEvent[BulkOperation.Update] = HistoryDBEvent.Updated;
        mOperationHistoryEvent[BulkOperation.Del] = HistoryDBEvent.Deleted;
        var sHistoryDBEvent = mOperationHistoryEvent[oOperation.name];

        var sHistorySelect = "select\
         ? as history_db_event,\
         ? as history_biz_event,\
         ? as history_at,\
         ? as history_actor_id,";

        aHistoryParameterValues.push(sHistoryDBEvent);
        aHistoryParameterValues.push(oContext.getHistoryEvent());
        aHistoryParameterValues.push(oContext.getRequestTimestamp());
        // string conversion necessary as internal type of prepared parameter is string
        aHistoryParameterValues.push((oContext.getUser().ID).toString());

        var aHistoryColumns = _.map(oNodeMetadata.persistedAttributes, function(sAttributeName) {
            var vChangedValue = oOperation.change[sAttributeName];
            if (vChangedValue !== undefined) {
                // string conversion necessary as internal type of prepared parameter is string
                aHistoryParameterValues.push((vChangedValue).toString());
                return '? as ' + sAttributeName;
            } else {
                return sAttributeName;
            }
        });

        sHistorySelect += aHistoryColumns.join(",");
        sHistorySelect += ' from "' + oNodeMetadata.schema + '"."' + oNodeMetadata.table + '"' + _conditionNodeAlias(oOperation.filter) + " where " + oOperation.filter.condition;

        if (oOperation.filter.conditionParameters) {
            aHistoryParameterValues = aHistoryParameterValues.concat(oOperation.filter.conditionParameters);
        }

        sHistoryStatement = 'insert into "' + oNodeMetadata.schema + '"."' + oNodeMetadata.historyTable + '" (history_db_event, history_biz_event, history_at, history_actor_id,' + oNodeMetadata.persistedAttributes.join(",") + ") " + sHistorySelect;
    }

    var sOperationStatement = "";
    var aParameterValues = [];
    switch (oOperation.name) {
        case BulkOperation.Update :
            var aFieldUpdates = _.map(oOperation.change, function(vValue, sAttributeName) {
                aParameterValues.push(vValue);
                return sAttributeName + "= ?";
            });
            sOperationStatement = 'update "' + oNodeMetadata.schema + '"."' + oNodeMetadata.table + '"' + _conditionNodeAlias(oOperation.filter) + " set " + aFieldUpdates.join(", ") + " where " + oOperation.filter.condition;
            break;
        case BulkOperation.Del :
            sOperationStatement = 'delete from "' + oNodeMetadata.schema + '"."' + oNodeMetadata.table + '"' + _conditionNodeAlias(oOperation.filter) + " where " + oOperation.filter.condition;
            break;
        default :
            addMessage(MessageSeverity.Fatal, Messages.BULK_INVALID_OPERATION);
            break;
    }

    if (sHistoryStatement) {
        // History needs to be written before the actual oepration is done as
        // conditions might be affected by operation, especially after delete values cannot
        // be restored any more
        oHQ.statement(sHistoryStatement).execute(aHistoryParameterValues);
    }

    if (oOperation.filter.conditionParameters) {
        aParameterValues = aParameterValues.concat(oOperation.filter.conditionParameters);
    }

    oHQ.statement(sOperationStatement).execute(aParameterValues);
    return oResponse;
}
