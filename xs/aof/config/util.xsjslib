var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var msg = $.import("sap.ino.xs.aof.lib", "message");
var confMessage = $.import("sap.ino.xs.aof.config", "message");
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var DB = $.import("sap.ino.xs.aof.core", "db");

var oConfigPackage;

function getConfigPackage(oHQ) {
    if (!oConfigPackage) {
        var aConfigPackage = oHQ.statement('select * from "sap.ino.db.config::v_config_content_package"').execute();
        if (aConfigPackage.length === 1) {
            oConfigPackage = aConfigPackage[0];
        }
    }
    return oConfigPackage;
}

function configPackageExists(oHQ) {
    return !!getConfigPackage(oHQ);
}

function getFullCode(sPackageId, sPlainCode) {
    return sPackageId + "." + sPlainCode;
}

/**
 * @param sConfigurationObject
 *            Name of the configuration object
 * @param sCode
 *            fully qualified code
 * @returns isCodeUsed
 */
function isCodeUsed(sConfigurationObjectName, sNodeName, sCode, oHQ) {
    var config = $.import("sap.ino.xs.aof.config", "activation");
    var oMsgBuf = msg.createMessageBuffer();

    var oScope = config.createScope(config.getConfigurationObjects(oMsgBuf), config.getStageObjects(oMsgBuf), config.getApplicationObjects(oMsgBuf));

    var aObject = _.union(oScope.getApplicationObjects(), oScope.getConfigurationObjects());

    var oTargetObject = oScope.getConfigurationObject(sConfigurationObjectName);
    var oTargetNode = oTargetObject.getNodeMetadata(sNodeName);
    var aInNodes = [oTargetNode];
    var aOutNodes = _.map(aObject, function(object) {
        return object.getAllNodeMetadata();
    });
    aOutNodes = _.flatten(aOutNodes);
    var aFKDescriptor = config.getForeignKeyToDescriptorsForNodes(aOutNodes, aInNodes);

    // for loop is used so that we can exit as soon as the first match has been found
    for (var i = 0; i < aFKDescriptor.length; i++) {
        var oFKDescriptor = aFKDescriptor[i];
        if (oFKDescriptor.sFKNodeName !== sNodeName) {
            continue;
        }
        // we select on the view provided by the configuration -> so we get usages also for inactive config objects
        var sSelect = 'select 1 as no from ' + oFKDescriptor.sSelectFrom + ' where "' + oFKDescriptor.sAttribute + '" = ?';
        var aResult = oHQ.statement(sSelect).execute(sCode);
        if (aResult && aResult.length > 0) {
            return true;
        }
    }
    return false;
}

function getMaxLengthOfPlainCode(oHQ) {
    var iCodeFieldLength = 100;
    var sPackage = getConfigPackage(oHQ);
    var iPackageLength = sPackage.PACKAGE_ID.length;
    iPackageLength++; // the . needs one character!
    return iCodeFieldLength - iPackageLength;
}

function getAllConfigurationPackages(oHQ) {
    var aConfigPackages = oHQ.statement('select ext_package_id from "sap.ino.db.basis::t_package_extension" where base_package_id = \'sap.ino.config\'').execute();
    return _.pluck(aConfigPackages, "EXT_PACKAGE_ID");
}

function getObjectOfType(sType, oHQ, msgBuf) {
    var sSelect = 'select name from "sap.ino.db.aof::t_application_object" where type_code = ?';
    var aNames;
    try {
        aNames = oHQ.statement(sSelect).execute(sType);
    } catch (err) {
        msgBuf.addMessage(msg.MessageSeverity.Error, confMessage.CONF_OBJECT_SELECT_EXCEPTION, "", "", "", err.toString(), sSelect);
        return null;
    }
    var aObjects = _.map(aNames, function(record) {
        try {
            var oObject = AOF.getMetadata(record.NAME);
            _markObjectNodesAs(oObject, sType);
            return oObject;
        } catch (err) {
            msgBuf.addMessage(msg.MessageSeverity.Error, confMessage.CONF_OBJECT_LOAD_EXCEPTION, "", "", "", record.NAME, err.name, err.message, err.fileName, err.lineNumber, err.columnNumber);
            return null;
        }
    });
    return _.reject(aObjects, function(o) {
        return !o;
    });
}

function _markObjectNodesAs(oMetadata, sObjectType) {
    var aNodes = oMetadata.getAllNodeMetadata();
    _.each(aNodes, function(oNode) {
        oNode._objectType = sObjectType;
    });
}

function getColumnListAsString(oNodeMetadata, sPrefix) {
    var sColumns = _.map(oNodeMetadata.attributes, function(attribute) {
        return ((sPrefix) ? sPrefix + "." : "") + attribute.name;
    }).join();
    if (oNodeMetadata.parentKey) {
        sColumns = sColumns + "," + ((sPrefix) ? sPrefix + "." : "") + oNodeMetadata.parentKey;
    }
    return sColumns;
}

function getStageViewAsString(oNodeMetadata) {
    var sView = "(select " + getColumnListAsString(oNodeMetadata) + " from (" + "select " + getColumnListAsString(oNodeMetadata, "s") + ", row_number() over (partition by s." + oNodeMetadata.primaryKey + " order by s." + oNodeMetadata.primaryKey + " desc, v.layer desc) r" + " from \"" + oNodeMetadata.table + "_stage\" as s" + " join \"sap.ino.db.basis::v_config_package_vector\" as v on s.package_id = v.package_id)" + " where r=1)";
    return sView;
}

function getConfigObjectName(sStageObjectName) {
    if (!sStageObjectName) {
        throw Error("Object name is empty");
    }
    return sStageObjectName.substring(0, sStageObjectName.length - 5);
}

function getStageObjectName(sObjectName) {
    if (!sObjectName) {
        throw Error("Object name is empty");
    }
    return sObjectName + "Stage";
}

function readStageObject(vKey, sConfigObjectName, oConfigMetadata) {
    oConfigMetadata = oConfigMetadata || AOF.getMetadata(sConfigObjectName);
    if (!oConfigMetadata) {
        throw Error("Invalid object name" + sConfigObjectName);
    }

    var oMap = {};
    _.each(oConfigMetadata.getAllNodeMetadata(), function(oNode) {
        oMap[oNode.table] = getStageViewAsString(oNode);
    });
    return DB.read(vKey, oConfigMetadata, true, oMap);
}
