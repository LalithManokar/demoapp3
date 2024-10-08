const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_2_2_1_6.init_existed_data_in_value_option_list.xsjslib';

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
	var sStatement1 = 'update "sap.ino.db.basis::t_value_option" set active = ? where active is null';
    oHQ.statement(sStatement1).execute(1);
	var sStatement2 = 'update "sap.ino.db.basis::t_value_option_stage" set active = ? where active is null';
    oHQ.statement(sStatement2).execute(1);
    return true;
}

function clean(oConnection) {
    return true;
}