const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_2.2.11_delete_default+email_setting_user_parameter.xsjslib';

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
    var sStatement = 'DELETE FROM "sap.ino.db.basis::t_user_parameter" WHERE section = \'notification\' AND key = \'mail\' ; ';
    oHQ.statement(sStatement).execute();
    return true;
}

function clean(oConnection) {
    return true;
}