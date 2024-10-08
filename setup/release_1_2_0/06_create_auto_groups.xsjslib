const HQ = $.import("sap.ino.xs.xslib", "hQuery");

function check(oConnection) {
    return true;
}

function run(oConnection) {
    const oHQ = HQ.hQuery(oConnection);
    oHQ.procedure("SAP_INO","sap.ino.db.iam::p_auto_group_all").execute();
    return true;
}

function clean(oConnection) {
    return true;
}