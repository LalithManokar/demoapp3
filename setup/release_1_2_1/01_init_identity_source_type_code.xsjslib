const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_1.2.1.01_init_identity_source_type_code.xsjslib';

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
    // as before release 1.2. the only way to get users into the system was upload and with 1.2. the SOURCE_TYPE_CODE was introduced, 
    // we can set it to UPLOAD if NULL
    var sStatement = 'update "sap.ino.db.iam::t_identity" set source_type_code = \'UPLOAD\' where source_type_code is null and type_code = \'USER\'';
    oHQ.statement(sStatement).execute();

    // we assume that source type 'USER' is the standard way to create groups before 1.2. If anyway the group is updated by the group upload or 
    // the automatic group creation the source type code will then be overwritten                                                                                                        
    var sStatement = 'update "sap.ino.db.iam::t_identity" set source_type_code = \'USER\' where source_type_code is null and type_code = \'GROUP\'';
    oHQ.statement(sStatement).execute();

    return true;
}

function clean(oConnection) {
    return true;
}