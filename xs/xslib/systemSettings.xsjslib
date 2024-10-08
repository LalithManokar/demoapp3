const trace = $.import("sap.ino.xs.xslib", "trace");
const whoAmI = 'sap.ino.xs.xslib.systemSettings.xsjs';
function warning(line) { trace.warning(whoAmI, line); }
function debug(line)   { trace.debug(whoAmI, line); }

const setupDriver = $.import("sap.ino.setup.xslib", "driver");
const oConnection = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const HQ = $.import("sap.ino.xs.xslib", "hQuery");
const hq = HQ.hQuery(oConnection);

//get values set in the Innovation Management Section of the xsengine.ini file
function getIniValue(sCode, oHQ) {
    if (sCode === undefined || sCode === null) {
        return undefined;
    }

    if (!oHQ) {
        oHQ = hq;
    }

    var sSelect = 'select value from "sap.ino.db.basis::v_ino_system_settings" where key = ?';
    var oResult = oHQ.statement(sSelect).execute(sCode);
    if(oResult.length < 1) {
        return undefined;
    }
    return oResult[0].VALUE;
}

function getValue(sCode, oHQ) {
    if (sCode === undefined || sCode === null) {
        return undefined;
    }

    if (!oHQ) {
        oHQ = hq;
    }

    var sSelect = 'select value from "sap.ino.db.basis.ext::v_ext_system_setting" where code = ?';
    var oResult = oHQ.statement(sSelect).execute(sCode);
    if(oResult.length < 1) {
        return undefined;
    }
    return oResult[0].VALUE;
}

function isUnderMaintenance() {
    const bSetupCompleted = setupDriver.setupCompleted();
    
    const sMaintenanceModeQuery = 'SELECT 1 as no from "sap.ino.db.basis::v_ino_system_settings" ' +
                                  "where key = 'maintenance_mode' and value = '1'";
    const result = hq.statement(sMaintenanceModeQuery).execute();
    const bUnderMaintenance = result.length !== 0;
    
    return bUnderMaintenance || !bSetupCompleted;
}

function systemMessage(){
    
    const sSystemMessageQuery = 'select value from "sap.ino.db.basis::v_ino_system_settings" ' +
                                "where key = 'system_message'";
    const oResult = hq.statement(sSystemMessageQuery).execute();
    
    if(oResult.length < 1){
        return undefined;
    }
    
    return oResult[0].VALUE;
    
}
