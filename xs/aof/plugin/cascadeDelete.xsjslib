var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var DB = $.import("sap.ino.xs.aof.core", "db");

function enhanceNode(oNode, oMetadataAccess) {
    // Add onDelete determination to root to handle cascading delete
    var oObjectMetadata = oMetadataAccess.getObjectMetadata();
    if (oNode.name === "Root" && oObjectMetadata.cascadeDelete && oObjectMetadata.cascadeDelete.length > 0) {
        var fnCascadeDeleteDetermination = function(vKey, oWorkObject, oPersistedObject, addMessage) {
            _.each(oObjectMetadata.cascadeDelete, function(sObjectName) {
                var oCascadeObjectMetadata = _getCascadeObjectMetadata(sObjectName);
                var oCascadeRootMetadata = oCascadeObjectMetadata.getNodeMetadata("Root");
                var aFKAttributes = _getFKAttributes(oCascadeRootMetadata, oNode);
                if (!aFKAttributes) {
                    return;
                }

                var aParameters = _.map(aFKAttributes, function() {
                    return vKey;
                });

                // Find out keys of cascade object to delete
                var sWhereCondition = _.map(aFKAttributes, function(oFKAttribute) {
                    return oFKAttribute.name + ' = ?';
                }).join(' or ');
                sWhereCondition = '(' + sWhereCondition + ')';

                // Respect constant keys of cascade root node
                _.each(oCascadeRootMetadata.constantKeys, function(sValue, sColumn) {
                    sWhereCondition += ' and "' + sColumn + '" = ? ';
                    aParameters.push(sValue);
                });

                var sCascadeKeysStatement = 'select ' + oCascadeRootMetadata.primaryKey + ' from "' + oCascadeRootMetadata.table + '" where ' + sWhereCondition;
                var aCascadeKeys = _.pluck(DB.getHQ().statement(sCascadeKeysStatement).execute(aParameters), oCascadeRootMetadata.primaryKey);
                var oCascadeObject = oCascadeObjectMetadata.getApplicationObject();

                // Delegate deletion to cascading object
                _.each(aCascadeKeys, function(vCascadeKey) {
                    var oResponse = oCascadeObject.del(vCascadeKey);
                    addMessage(oResponse.messages);
                });
            });
        };
        oNode.determinations.onDelete.push(fnCascadeDeleteDetermination);
    }
}

function executeNodeBulkOperation(oResponse, oOperation, addMessage, oContext, bSimulate) {

    var oNodeMetadata = oOperation.nodeMetadata;
    var oObjectMetadata = oNodeMetadata.objectMetadata.getObjectMetadata();

    if (oOperation.name !== DB.BulkOperation.Del || oNodeMetadata.name !== "Root" || !oObjectMetadata.cascadeDelete) {
        return;
    }

    _.each(oObjectMetadata.cascadeDelete, function(sObjectName) {
        var oCascadeObjectMetadata = _getCascadeObjectMetadata(sObjectName);
        var oRootObjectMetadata = oCascadeObjectMetadata.getNodeMetadata("Root");

        var aFKAttributes = _getFKAttributes(oRootObjectMetadata, oNodeMetadata);
        if (!aFKAttributes) {
            return;
        }

        var oCascadeFilter = {
            condition : null,
            conditionParameters : []
        };

        var sCascadeCondition = _.map(aFKAttributes, function(oFKAttribute) {
            oCascadeFilter.conditionParameters = oCascadeFilter.conditionParameters.concat(oOperation.filter.conditionParameters);
            return oFKAttribute.name + ' in (select ' + oNodeMetadata.primaryKey + ' from "' + oNodeMetadata.table + DB._conditionNodeAlias(oOperation.filter) + '" where ' + oOperation.filter.condition + ')';
        }).join(' or ');

        oCascadeFilter.condition = sCascadeCondition;

        var oCascadeBulkAccess = DB.getBulkAccess(oCascadeObjectMetadata, oContext);
        var oResponse = oCascadeBulkAccess.del({
            Root : {}
        }, oCascadeFilter);
        addMessage(oResponse.messages);
    });
}

function _getFKAttributes(oTargetNode, oSourceNode) {
    var aFKAttributes = _.where(oTargetNode.attributes, {
        foreignKeyTo : oSourceNode.qualifiedName,
        foreignKeyIntraObject : false
    });
    return aFKAttributes;
}

function _getCascadeObjectMetadata(sObjectName) {
    var AOF = $.import("sap.ino.xs.aof.core", "framework");
    var oCascadeObjectMetadata = AOF.getMetadata(sObjectName);
    if (!oCascadeObjectMetadata) {
        _.raiseException("Application object " + sObjectName + " referenced as cascade delete in does not exist");
    }
    return oCascadeObjectMetadata;
}
