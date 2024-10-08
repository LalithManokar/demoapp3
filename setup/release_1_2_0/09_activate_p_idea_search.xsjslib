const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");
const repo = $.import("sap.ino.xsdc.xslib", "repo");
const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_1.2.0.09_activate_p_idea_search.xsjslib';

function error(line) {
    trace.error(whoAmI, line);
}
function info(line) {
    trace.info(whoAmI, line);
}

function check(oConnection) {
    return true;
}

function run(oConnection) {
    // the procedure sap.ino.db.idea::p_idea_search contains SQL code, 
    // especially the "contains" operator which only is valid, when a fulltext index 
    // has been created on a BLOB column. However fulltext indices are created after import
    // of the delivery unit.

    // The approach is that the "contains" operator part of the procedure is commented out
    // in p_idea_search with a special comment --ACTIVATE_AFTER_IMPORT and that this comment
    // is removed by this after import method

    // This after import method needs to be run for EVERY patch as the SAP delivery will change 
    // the code of p_idea_search again

    // This after import method may not be run in the development system, as this would change
    // the delivery

    var oFile = {
        package : "sap.ino.db.idea",
        name : "p_idea_search",
        type : "hdbprocedure"
    };

    var oHQ = HQ.hQuery(oConnection);
    var aOriginalSystem = oHQ.statement("select 'X' as is_original from _sys_repo.package_catalog where package_id = ? and src_system = (select system_id from m_database)").execute(oFile.package);
    if (aOriginalSystem && aOriginalSystem.length >= 1) {
        info('Skipped as this system is original system');
        return true;
    }

    // An own serializable, old-school $.db connection is needed for accessing the repository
    var oRepoConn = $.db.getConnection($.db.isolation.SERIALIZABLE);
    var sProcedureCode = repo.readFileSQLCC(oFile, oRepoConn);
    if (!sProcedureCode) {
        error(oFile.package + "::" + oFile.name + "." + oFile.type + " could not be retrieved from repository.");
        return false;
    }

    var sUnlockedProcedureCode = unlockAfterImportCode(sProcedureCode);
    if (!sUnlockedProcedureCode) {
        error("After import code is empty.");
        return false;
    }

    oFile.content = sUnlockedProcedureCode;
    repo.upsertFilesSQLCC([oFile], oRepoConn);

    oRepoConn.close();
    return true;
}

function clean(oConnection) {
    // clean is not necessary, the repo library takes care 
    // that everything is rolled back properly in case of an error
    return true;
}

function unlockAfterImportCode(sString) {
    var rAfterImportComment = /--ACTIVATE_AFTER_IMPORT--/mg;
    return sString.replace(rAfterImportComment, " ");
}
