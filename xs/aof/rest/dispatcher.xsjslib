var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var RESTAdapter = $.import("sap.ino.xs.aof.rest", "adapter");

function dispatch(vDispatcherConfig, oMapper) {
    var rPath = /^(.*\.xsjs)/g;
    var aMatches = $.request.path.match(rPath);
    if (aMatches.length === 0) {
        _.raiseException("Invalid path " + $.request.path);
    }
    var sXSJSPath = aMatches[0];

    var oDefinition;
    if (_.isString(vDispatcherConfig)) {
        oDefinition = getDefinition(vDispatcherConfig);
    } else {
        oDefinition = vDispatcherConfig;
    }
    var sApplicationObjectName = oDefinition[sXSJSPath] || _.raiseException("No dispatcher definition found for path: " + sXSJSPath);
    return RESTAdapter.expose(sApplicationObjectName, oMapper);
}

function dispatchDefault(oMapper) {
    return dispatch(getDefaultDefinition(), oMapper);
}

function getDefaultDefinition() {
    return getDefinitionFromTable("sap.ino.db.aof::t_application_object");
}

function getDefinitionFromTable(sObjectTypeTable) {
    var DB = $.import("sap.ino.xs.aof.core", "db");
    return _.object(_.map(DB.getHQ().statement("select PATH, NAME from \"" + sObjectTypeTable + "\" where PATH <> '' and NAME <> ''").execute(), _.values));
}

function getDefaultReverseDefinition() {
    return getReverseDefinitionFromTable("sap.ino.db.aof::t_application_object");
}

function getReverseDefinitionFromTable(sObjectTypeTable) {
    return _.reduce(getDefinitionFromTable(sObjectTypeTable), function(oResult, sName, sPath) {
        oResult[sName] = sPath;
        return oResult;
    }, {});
}

function getDefinition(sDispatcherConfigPath) {
    var oDispatcherConfig = _.splitObjectPath(sDispatcherConfigPath);
    var DispatcherConfig = $.import(oDispatcherConfig.packageName, oDispatcherConfig.objectName);
    return DispatcherConfig.definition;
}

function getReverseDefinition(sDispatcherConfigPath) {
    return _.reduce(getDefinition(sDispatcherConfigPath), function(oResult, sName, sPath) {
        oResult[sName] = sPath;
        return oResult;
    }, {});
}