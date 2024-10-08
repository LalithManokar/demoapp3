function setWallSession(oData, oHQ) {
    oData.WALL_SESSION_UUID = null;
    var aResult = oHQ.statement("select session_context('WALL_SESSION_UUID') as WALL_SESSION_UUID from dummy").execute();
    if (aResult.length > 0) {
        oData.WALL_SESSION_UUID = aResult[0].WALL_SESSION_UUID;
    }
}

function updateWallSession(sHistoryTable, vKey, vTimestamp, oHQ) {
    // AOF DB stores last valid wall session uuid
    // The following code updates the history table with current wall session uuid 
    var aResult = oHQ.statement("select session_context('WALL_SESSION_UUID') as WALL_SESSION_UUID from dummy").execute();
    if (aResult.length > 0) {
        oHQ.statement("update \"" + sHistoryTable + "\" set WALL_SESSION_UUID = ? where ID = ? and HISTORY_AT = TO_TIMESTAMP(?)").execute(aResult[0].WALL_SESSION_UUID, vKey, vTimestamp);
    }
}