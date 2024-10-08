var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var repo = $.import("sap.ino.xsdc.xslib", "repo");
var util = $.import("sap.ino.xs.aof.config", "util");
var meta = $.import("sap.ino.xs.aof.core", "metadata");
var message = $.import("sap.ino.xs.aof.lib", "message");
var MessageSeverity = message.MessageSeverity;
var confMessage = $.import("sap.ino.xs.aof.config", "message");
var csvParser = $.import("sap.ino.xs.xslib", "csvParser");


var AOF = $.import("sap.ino.xs.aof.core", "framework");
var ObjectType = AOF.ObjectType;

function importAllContent(oHQ, oMsgBuf) {
    var aConfigPackages = util.getAllConfigurationPackages(oHQ);
    _.each(aConfigPackages, function(sPackageId) {
        if (!repo.hasPackageReadAuthorization(sPackageId)) {
            // Fatal message to immediately stop import
            oMsgBuf.addMessage(MessageSeverity.Fatal, confMessage.CONFIG_IMPORT_PACKAGE_AUTH, undefined, undefined, undefined, sPackageId);
        }
        importContent(sPackageId, oHQ, oMsgBuf);
    });
    runAfterImport(oHQ, oMsgBuf);
}

function importContent(sPackageId, oHQ, oMsgBuf) {
    var aImportFiles = _getImportFiles(sPackageId, oHQ, oMsgBuf);
    _.each(aImportFiles, function(oFile) {
        _importFile(oFile, repo, oHQ, oMsgBuf);
    });
}

function _getImportFiles(sPackageId, oHQ, oMsgBuf) {
    var aStageObject = util.getObjectOfType(ObjectType.Stage, oHQ, oMsgBuf);
    var aImportFile = [];

    var oActiveContentPackage = util.getConfigPackage(oHQ);
    var sActiveContentPackageId = oActiveContentPackage && oActiveContentPackage.PACKAGE_ID;

    _.each(aStageObject, function(oStageObject) {
        var aNodeMetadata = oStageObject.getAllNodeMetadata();
        var sConfigObjectName = util.getConfigObjectName(oStageObject.getObjectMetadata().name);
        var oConfigObjectMetadata = AOF.getMetadata(sConfigObjectName);

        if (sPackageId === sActiveContentPackageId) {
            // We may only import when *all* content of the configuration object
            // is maintained in repository. If this is not the case the staging table content is leading
            // and may not be overridden by any import
            var oStageRootNodeMetadata = oStageObject.getNodeMetadata(AOF.Node.Root);
            if (oStageRootNodeMetadata.customProperties && oStageRootNodeMetadata.customProperties.contentOnlyInRepository === false) {
                return;
            }
        }

        _.each(aNodeMetadata, function(oNodeMetadata) {
            var oConfigNodeMetadata = oConfigObjectMetadata.getNodeMetadata(oNodeMetadata.name);
            if (!oConfigNodeMetadata) {
                // Fatal message to immediately stop import
                oMsgBuf.addMessage(MessageSeverity.Fatal, confMessage.CONFIG_NODE_MISSING, undefined, undefined, undefined, oNodeMetadata.name, sConfigObjectName);
                return;
            }

            // Only columns in configuration object are relevant for import
            var aImportColumns = oConfigNodeMetadata.persistedAttributes;

            if (!oNodeMetadata.customProperties || !oNodeMetadata.customProperties.fileName) {
                // Fatal message to immediately stop import
                oMsgBuf.addMessage(MessageSeverity.Fatal, confMessage.CONFIG_FILE_MISSING, undefined, undefined, undefined, oNodeMetadata.qualifiedName);
                return;
            }

            var oFile = {
                package : sPackageId,
                file : oNodeMetadata.customProperties.fileName,
                type : "csv",
                table : oNodeMetadata.table,
                schema : oNodeMetadata.schema,
                node : oNodeMetadata.qualifiedName,
                columns : aImportColumns
            };
            aImportFile.push(oFile);
        });
    });

    return aImportFile;
}

function _importFile(oFile, oRepo, oHQ, oMsgBuf) {
    var sFileContent = oRepo.readFile(oFile.package, oFile.file, oFile.type);
    if (sFileContent === null || sFileContent === undefined) {
        return;
    }
    var aStageObjectInstance = _parseFileContent(oFile, sFileContent, oMsgBuf);
    if (aStageObjectInstance) {
        _updateDB(oFile, aStageObjectInstance, oHQ, oMsgBuf);
    }
}

function _parseFileContent(oFile, sContent, oMsgBuf) {
    var aContent = csvParser.parse(sContent, ";");
    var aMap = csvParser.inferHeaderMap(aContent, oFile.columns);
    if (aMap === undefined) {
        // try if using "comma" as separator leads to more success
        aContent = csvParser.parse(sContent, ",");
        aMap = csvParser.inferHeaderMap(aContent, oFile.columns);
        if (aMap === undefined) {
            var sFullFileName = oFile.package + "." + oFile.file;
            oMsgBuf.addMessage(MessageSeverity.Error, confMessage.CONFIG_IMPORT_FILE_HEADER_MISSING, undefined, undefined, undefined, sFullFileName);
            return undefined;
        }
    }

    var aStageObjectInstance = csvParser.nestedArrayToObjectArray(aContent.slice(1), aMap);
    aStageObjectInstance = _.map(aStageObjectInstance, function(oStageObjectInstance) {
        return _.mapObjects(oStageObjectInstance, function(vValue) {
            // empty Strings are treated as undefined (to stay compatible to HDBTI import)
            // undefined is persisted as null
            return (vValue === '') ? undefined : vValue;
        });
    });

    aStageObjectInstance = _.reject(aStageObjectInstance, _isEmptyObject);

    _.each(aStageObjectInstance, function(oStageObjectInstance) {
        oStageObjectInstance.PACKAGE_ID = oFile.package;
    });
    return aStageObjectInstance;
}

function _isEmptyObject(oObject) {
    return _.every(oObject, function(vProperty) {
        return vProperty === undefined || vProperty === null;
    });
}

function _updateDB(oFile, aStageObjectInstance, oHQ, oMsgBuf) {
    // delete everything to handle deletions in CSV file
    oHQ.statement('delete from "' + oFile.schema + '"."' + oFile.table + '" where package_id = ?').execute(oFile.package);
    oHQ.table(oFile.schema, oFile.table).insert(aStageObjectInstance);
}

function runAfterImport(oHQ, oMsgBuf) {
    var aConfigurationObjects = util.getObjectOfType(ObjectType.Configuration, oHQ, oMsgBuf);
    _.each(aConfigurationObjects, function(oConfigurationObject) {
        var oStageObject = AOF.getMetadata(util.getStageObjectName(oConfigurationObject.getObjectMetadata().name));
        _completeImportedContent(oConfigurationObject, oStageObject, oHQ);
    });
}

function _completeImportedContent(oConfigurationObject, oStageObject, oHQ) {
    // Imported staging tables do not have IDs, only codes
    // IDs are generated and intra object FK ID associations updated based on the codes so that
    // imported object can be accessed and maintained via AOF

    meta.visitMetadataTree(oStageObject, function(oNodeMetadata, oParentMetadata) {

        updatePlainCodeWorkaround(oNodeMetadata);

        var sIdGenerationStmt = getIdGenerationStatement(oNodeMetadata);
        oHQ.statement(sIdGenerationStmt).execute();

        if (oParentMetadata) {
            var sIntraObjectIdUpdateStmt = getIntraObjectIdUpdateStatement(oNodeMetadata, oParentMetadata);
            oHQ.statement(sIntraObjectIdUpdateStmt).execute();
        }

        return oNodeMetadata;
    });

    function updatePlainCodeWorkaround(oNodeMetadata) {
        // Due to a HANA XS bug (CSN 1480365 2014) we need to fill the plain code in Javascript
        // Once the bug is fixed the plain code can be determined by calling the following function
        // like this plain_code = "sap.ino.db.basis::f_last_delimited_substring"(code, \'.\')
        // in the id generation statement
        var sImportedStagingObjectSelect = '\
                select code, package_id\
                from "' + oNodeMetadata.table + '"\
                where ' + oNodeMetadata.primaryKey + ' is null';

        var aImportedStagingObjects = oHQ.statement(sImportedStagingObjectSelect).execute();
        _.each(aImportedStagingObjects, function(oStagingObject) {
            var sPlainCode = _.last(oStagingObject.CODE.split('.'));
            var sPlainCodeUpdate = '\
                update "' + oNodeMetadata.table + '"\
                set plain_code = ? \
                where code = ? and package_id = ?';
            oHQ.statement(sPlainCodeUpdate).execute(sPlainCode, oStagingObject.CODE, oStagingObject.PACKAGE_ID);
        });
    }

    function getIdGenerationStatement(oNodeMetadata) {
        var sStatement = '\
            update "' + oNodeMetadata.table + '"\
            set ' + oNodeMetadata.primaryKey + ' = "' + oNodeMetadata.sequence + '".nextval\
            where ' + oNodeMetadata.primaryKey + ' is null';
        return sStatement;
    }

    function getIntraObjectIdUpdateStatement(oNodeMetadata, oParentMetadata) {
        var sIntraObjectIdUpdateStatement;

        var sConfigurationChildParentKey = oConfigurationObject.getNodeMetadata(oNodeMetadata.name).parentKey;
        var sConfigurationParentKey = oConfigurationObject.getNodeMetadata(oParentMetadata.name).primaryKey;

        var sParentKeySetter = oNodeMetadata.parentKey + ' = (\
            select ' + oParentMetadata.primaryKey + ' from "' + oParentMetadata.table + '" as parent where \
                parent.package_id = node.package_id and\
                parent.' + sConfigurationParentKey + ' = ' + 'node.' + sConfigurationChildParentKey + '\
            )';

        var aIntraObjectFKAttributes = _.where(oNodeMetadata.attributes, {
            foreignKeyIntraObject : true
        }) || [];

        var aIntraObjectFKSetters = _.map(aIntraObjectFKAttributes, function(oAttribute) {
            var sForeignKeyToNodeName = _.last(oAttribute.foreignKeyTo.split("."));
            var oForeignKeyNodeMetadata = oStageObject.getNodeMetadata(sForeignKeyToNodeName);
            var sForeignKeyConfigPrimaryKey = oConfigurationObject.getNodeMetadata(sForeignKeyToNodeName).primaryKey;

            // Code corresponding code attribute is found by naming convention -> _ID --> _CODE
            var sAttributeCodeName = oAttribute.name.replace(/_ID$/, "_CODE");
            return oAttribute.name + ' = (\
                    select ' + oForeignKeyNodeMetadata.primaryKey + ' from "' + oForeignKeyNodeMetadata.table + '" as fk where \
                        fk.package_id = node.package_id and\
                        fk.' + sForeignKeyConfigPrimaryKey + ' = node.' + sAttributeCodeName + '\
                    )';
        });

        var sSetters = [sParentKeySetter].concat(aIntraObjectFKSetters);

        // to be sure to have no inconsistencies side we update the complete staging table -> no where condition to
        // select not set intra object keys / parentKeys
        sIntraObjectIdUpdateStatement = 'update "' + oNodeMetadata.table + '" as node set ' + sSetters.join(",");
        return sIntraObjectIdUpdateStatement;
    }
}
