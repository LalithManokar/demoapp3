const trace = $.import("sap.ino.xs.xslib", "trace");
const message = $.import("sap.ino.xs.aof.lib","message");

const whoAmI = "sap.ino.xs.rest.admin.system.user_upload";
const debug = function debug(line) {
    trace.debug(whoAmI, line);
};

const util = $.import("sap.ino.xs.rest.admin.system", "util");

const onlyZeroOrWhitespace = /^[0\s]*$/;

function process(sInput, oExternalControlledConnection) {
    const aHeader = ['USER_NAME', 'IS_EXTERNAL', 'FIRST_NAME', 'LAST_NAME', 'NAME',
                     'EMAIL', 'PHONE', 'MOBILE', 'COST_CENTER', 'ORGANIZATION', 'OFFICE', 
                     'COMPANY', 'STREET', 'CITY', 'COUNTRY', 'ZIP_CODE', 'VALIDATION_TO'];

    const sAppLogMessage = "MSG_USER_UPLOAD";
    const sProcedureName = "sap.ino.db.iam.admin::user_upload_roundup";

    function rowSanitizer(aRows, oRow) {
        oRow.LINE_NO      = aRows.length;
        oRow.NAME         = oRow.NAME         || '';
        oRow.FIRST_NAME   = oRow.FIRST_NAME   || '';
        oRow.LAST_NAME    = oRow.LAST_NAME    || '';
        oRow.EMAIL        = oRow.EMAIL        || '';
        oRow.USER_NAME    = oRow.USER_NAME    || '';
        oRow.IS_EXTERNAL  = oRow.IS_EXTERNAL  || '';
        oRow.IS_EXTERNAL  = onlyZeroOrWhitespace.test(oRow.IS_EXTERNAL)? 0: 1;
        oRow.PHONE        = oRow.PHONE        || '';
        oRow.MOBILE       = oRow.MOBILE       || '';
        oRow.COST_CENTER  = oRow.COST_CENTER  || '';
        oRow.ORGANIZATION = oRow.ORGANIZATION || '';
        oRow.OFFICE       = oRow.OFFICE       || '';
        oRow.DESCRIPTION  = oRow.DESCRIPTION  || '';
        oRow.COMPANY      = oRow.COMPANY      || '';
        oRow.STREET       = oRow.STREET       || '';
        oRow.CITY         = oRow.CITY         || '';
        oRow.COUNTRY      = oRow.COUNTRY      || '';
        oRow.ZIP_CODE     = oRow.ZIP_CODE     || '';
        oRow.VALIDATION_TO  = oRow.VALIDATION_TO || '9999-12-31';
        aRows.push(oRow);
        return aRows;
    }

    return util.processProcedure(sInput, oExternalControlledConnection, aHeader, sAppLogMessage, sProcedureName, rowSanitizer);
}

function process_delete(sInput, oExternalControlledConnection) {
    const aHeader = ['USER_NAME'];

    const sAppLogMessage = "MSG_USER_UPLOAD_DELETE";
    const sProcedureName = "sap.ino.db.iam.admin::user_upload_delete_roundup";
    
    function rowSanitizer(aRows, oRow) {
        oRow.LINE_NO      = aRows.length;
        oRow.USER_NAME    = oRow.USER_NAME || '';

        aRows.push(oRow);
        return aRows;
    }

    return util.processProcedure(sInput, oExternalControlledConnection, aHeader, sAppLogMessage, sProcedureName, rowSanitizer);
}
