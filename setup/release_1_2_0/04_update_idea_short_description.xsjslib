const HQ = $.import("sap.ino.xs.xslib", "hQuery");

function check(oConnection) {
    return true;
}

function run(oConnection) {
    const oHQ = HQ.hQuery(oConnection);
    const sMoveStatement = 'update "SAP_INO"."sap.ino.db.idea::t_idea" set short_description = to_nvarchar(left(description, 500)) where short_description is null';
    oHQ.statement(sMoveStatement).execute();
    return true;
}

function clean(oConnection) {
    return true;
}
