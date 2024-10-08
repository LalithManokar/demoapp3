const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_1.2.0.08_init_comment_type.xsjslib';

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
    const sStatement = 'update "sap.ino.db.comment::t_comment" as comment set comment.type_code = \'COMMUNITY_COMMENT\' where comment.type_code is null';
    oHQ.statement(sStatement).execute();
    return true;
}

function clean(oConnection) {
    return true;
}