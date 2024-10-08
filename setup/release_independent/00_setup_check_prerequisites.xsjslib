const HQ = $.import("sap.ino.xs.xslib", "hQuery");
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

const trace = $.import("sap.ino.xs.xslib", "trace");
const whoAmI = 'sap.ino.setup.release_independent.00_setup_check_prerequisites.xsjslib';
function error(line) { trace.error(whoAmI, line); }
function info(line) { trace.info(whoAmI, line); }

const oRequiredHDBVersion = {
        VERSION : 1,
        VERSION_SP : 112,
        VERSION_PATCH : 3
};

function checkVersion(oRequiredVersion, oActualVersion, sComponent){
    if(oRequiredVersion.VERSION > oActualVersion.VERSION){
        error('Version of component '+sComponent+' is smaller than required. Required: '+JSON.stringify(oRequiredVersion)+' Actual: '+JSON.stringify(oActualVersion));
        return false;
    } else if ((oRequiredVersion.VERSION_SP > oActualVersion.VERSION_SP) && (oRequiredVersion.VERSION == oActualVersion.VERSION)){
        error('Version of component '+sComponent+' is smaller than required. Required: '+JSON.stringify(oRequiredVersion)+' Actual: '+JSON.stringify(oActualVersion));
        return false;
    } else if ((oRequiredVersion.VERSION_PATCH > oActualVersion.VERSION_PATCH) && (oRequiredVersion.VERSION_SP == oActualVersion.VERSION_SP) && (oRequiredVersion.VERSION == oActualVersion.VERSION)){
        error('Version of component '+sComponent+' is smaller than required. Required: '+JSON.stringify(oRequiredVersion)+' Actual: '+JSON.stringify(oActualVersion));
        return false;
    } else {
        info('Version of component '+sComponent+' is sufficient. Required: '+JSON.stringify(oRequiredVersion)+' Actual: '+JSON.stringify(oActualVersion));
        return true;
    }
}


function checkSecurityPrincipalExists(oHQ) {
    const sSelect = 'select ID, USER_NAME from "sap.ino.db.iam::t_identity" where user_name = session_context(\'APPLICATIONUSER\')';
    const oResult = oHQ.statement(sSelect).execute();

    return oResult.length == 1;
}

function checkRepositoryInconsistencies(oHQ) {
    var sSelect = 'select to_int(count(*)) as invalid_object_count from "sap.ino.setup.db::v_inconsistent_repo_object"';
    var oResult = oHQ.statement(sSelect).execute()[0];
    if (oResult.INVALID_OBJECT_COUNT === 0) {
        return true;
    }
    
    error('Deployment of Innovation Management failed: ' + 
        oResult.INVALID_OBJECT_COUNT + ' repository objects are inconsistent.');
    
    sSelect = 'select top 100 object, object_status from "sap.ino.setup.db::v_inconsistent_repo_object"';
    var aResult = oHQ.statement(sSelect).execute();
    _.each(aResult,function(oResult){
        error(oResult.OBJECT + ": object status " + oResult.OBJECT_STATUS);
    });
    if (oResult.INVALID_OBJECT_COUNT > 100) {
        error('  ... (' + (oResult.INVALID_OBJECT_COUNT - 100) + ' more).');
    }
}

function check(oConnection) {
    const oHQ = HQ.hQuery(oConnection);

    // if (!checkSecurityPrincipalExists(oHQ)) {
    //     // MSG_PRINCIPAL_IDENTITY_UNKNOWN="Database user {0} is not a registered application user"
    //     error("MSG_PRINCIPAL_IDENTITY_UNKNOWN - Database user "+
    //           + $.session.getUsername() +
    //           " is not a registered application user");
    //     return false;
    // }

    const sStatement = "select version from SYS.M_DATABASE";
    const aResult = oHQ.statement(sStatement).execute();
    if (aResult.length < 1) {
        // no table entry, no need to move anything
        error('DB Version could not be determined');
        return false;
    }

    //version is a string in a format like: 1.00.84.00.396663
    const sHDBVersion = aResult[0].VERSION;
    const aHDBVersion = sHDBVersion.split(".");
    const oHDBVersion = {
            VERSION : parseInt(aHDBVersion[0]),
            VERSION_SP : parseInt(aHDBVersion[2]),
            VERSION_PATCH : parseInt(aHDBVersion[3]),
    }
    var bOK = checkVersion(oRequiredHDBVersion, oHDBVersion, 'HDB');
    bOK = bOK && checkRepositoryInconsistencies(oHQ);
    return bOK;
}

function run(oConnection) {
    //nothing to do
    return true;
}

function clean(oConnection) {
    //nothing to do
    return true;
}