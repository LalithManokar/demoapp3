const HQ = $.import("sap.ino.xs.xslib", "hQuery");

function check(oConnection) {
    return true;
}

function run(oConnection) {
    const oHQ = HQ.hQuery(oConnection);

    oHQ.statement('call "SAP_INO"."sap.ino.setup.db::p_authorize_system" ()').execute();

    return true;
}

function clean(oConnection) {
    return true;
}
