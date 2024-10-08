$.import("sap.ino.xs.xslib", "hQuery");

const oConn = $.hdb.getConnection({ "sqlcc" : "sap.ino.xs.xslib::dbuser" });
const oHQ = $.sap.ino.xs.xslib.hQuery.hQuery(oConn);

var oSecondaryConnection;
var oSecondaryHQ;

var oDeprecatedConnection;

function getConnection() {
    return oConn;
}
function getHQ() {
    return oHQ;
}

function getSecondaryConnection(iIsolationLevel) {
    if (!oSecondaryConnection) {
        if(iIsolationLevel) {
            oSecondaryConnection = $.hdb.getConnection({ "isolationLevel" : iIsolationLevel, "sqlcc" : "sap.ino.xs.xslib::dbuser" });
        } else {
            oSecondaryConnection = $.hdb.getConnection({ "sqlcc" : "sap.ino.xs.xslib::dbuser" });
        }
        oSecondaryConnection.setAutoCommit(true);
    }
    return oSecondaryConnection;
}

// Especially User Management needs a second connection to execute autocommitting
// statements which would influence the other connection
function getSecondaryHQ() {
    if (!oSecondaryHQ) {
        oSecondaryHQ = $.sap.ino.xs.xslib.hQuery.hQuery(getSecondaryConnection());
    }
    return oSecondaryHQ;
}

function getDeprecatedConnection(iIsolationLevel, bForce) {
    if (!oDeprecatedConnection || bForce) {
        if(iIsolationLevel) {
            oDeprecatedConnection = $.db.getConnection({ "isolationLevel" : iIsolationLevel, "sqlcc" : "sap.ino.xs.xslib::dbuser" });
        } else {
            oDeprecatedConnection = $.db.getConnection({ "sqlcc" : "sap.ino.xs.xslib::dbuser" });
        }
        oDeprecatedConnection.setAutoCommit(true);
    }
    return oDeprecatedConnection;
}