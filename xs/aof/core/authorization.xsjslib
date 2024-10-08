var DB = $.import("sap.ino.xs.aof.core", "db");

var oApplicationUser;

// This method is only used for the special case of user self creation 
// via SAML and testing purposes
function setApplicationUser(sUserName) {
    var hq = DB.getHQ();
    // Statement cannot prepared thus we have to concatenate 
    // No SQL injection possible as statement only allows values after =
    hq.statement("set 'APPLICATIONUSER' = '" + sUserName + "'").execute();
    oApplicationUser = undefined;
}

function getApplicationUser() {
    if (oApplicationUser) {
        return oApplicationUser;
    }

    var hq = DB.getHQ();
    var sSelect = 'select ID, USER_NAME from "sap.ino.db.iam::t_identity" where user_name = session_context(\'APPLICATIONUSER\')';
    var oResult = hq.statement(sSelect).execute();
    if (oResult.length > 0) {
        oApplicationUser = {
            ID : oResult[0].ID,
            Name : oResult[0].USER_NAME
        };
    }

    return oApplicationUser;
}
