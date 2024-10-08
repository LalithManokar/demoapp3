const HQ = $.import("sap.ino.xs.xslib", "hQuery");

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_independent.96_setup_restart_database_verified.xsjslib';
function error(line) { trace.error(whoAmI, line); }
function info(line) { trace.info(whoAmI, line); }

function check(oConnection) {
    return true;
}

function run(oConnection, oLibraryMeta) {
    const hq = HQ.hQuery(oConnection);

    var aDatabaseRestartRequired = hq.statement(
        'select' +
        '    log.* ' +
        'from' +
        '    "SAP_INO"."sap.ino.setup.db::t_log" as log,' +
        '    "SYS"."M_DATABASE" as db ' +
        'where' +
        '    log.time > db.start_time '+
        'and log.VERSION       = ? ' +
        'and log.VERSION_SP    = ? ' +
        'and log.VERSION_PATCH = ? ' +
        "and log.name = 'sap.ino.setup.release_independent.95_setup_restart_database_required' " +
        "and log.step = 'run'"
    ).execute(String(oLibraryMeta.version), String(oLibraryMeta.version_sp), String(oLibraryMeta.version_patch));

    if (aDatabaseRestartRequired.length > 0) {
        error("A manual database restart is required.");
        error("Please restart the database manually.");
        error("After the restart rerun the setup to continue.");
        return false;
    } else {
        return true;
    }
}

function clean(oConnection) {
    return true;
}


