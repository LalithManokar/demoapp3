const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_1.1.0.09_move_reports.xsjslib';

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
    const oHQ = HQ.hQuery(oConnection);

    const sMoveStatement = 'update "SAP_INO"."sap.ino.db.analytics::t_custom_report" set config = configuration where config is null';
    oHQ.statement(sMoveStatement).execute();

    return true;
}

function clean(oConnection) {
    return true;
}