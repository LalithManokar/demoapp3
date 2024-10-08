function systemAdminData(vKey, oWorkObject, oPersistedObject, fnMessage, fnHandle, oContext) {
    var sNowISO = oContext.getRequestTimestamp();

    var oUser = oContext.getUser();
    var iUserId = oUser && oUser.ID;

    if (!oWorkObject.CREATED_AT || oContext.getAction().name === "copy") {
        oWorkObject.CREATED_AT = sNowISO;
        oWorkObject.CREATED_BY_ID = iUserId;
    }

    oWorkObject.CHANGED_AT = sNowISO;
    oWorkObject.CHANGED_BY_ID = iUserId;
}