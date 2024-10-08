const trace = $.import("sap.ino.xs.xslib", "trace");
const message = $.import("sap.ino.xs.aof.lib","message");

const whoAmI = "sap.ino.xs.rest.admin.system.group_upload";
const debug = function debug(line) {
    trace.debug(whoAmI, line);
};

const util = $.import("sap.ino.xs.rest.admin.system", "util");
const SystemSettings = $.import("sap.ino.xs.xslib", "systemSettings");

function process(sInput, oExternalControlledConnection) {
    var sResult = SystemSettings.getValue("sap.ino.config.OPEN_GROUP_FOR_COMMUNITY_USER");
    
    function rowSanitizer(aRows, oRow) {
        oRow.LINE_NO          = aRows.length;
        oRow.GROUP_NAME       = oRow.GROUP_NAME.trim() || '';
        oRow.MEMBER_TYPE_CODE = oRow.MEMBER_TYPE_CODE  || '';
        oRow.MEMBER_NAME      = oRow.MEMBER_NAME.trim() || '';

        aRows.push(oRow);
        return aRows;
    }
    
    function rowSanitizerOpen(aRows, oRow) {
        oRow.LINE_NO          = aRows.length;
        oRow.GROUP_NAME       = oRow.GROUP_NAME.trim() || '';
        oRow.MEMBER_TYPE_CODE = oRow.MEMBER_TYPE_CODE  || '';
        oRow.MEMBER_NAME      = oRow.MEMBER_NAME.trim() || '';
        oRow.IS_PUBLIC        = oRow.IS_PUBLIC || '';

        aRows.push(oRow);
        return aRows;
    }
    
    if (sResult !== '0'){
        const aHeaderOpen = ['GROUP_NAME', 'MEMBER_TYPE_CODE', 'MEMBER_NAME','IS_PUBLIC'];
    
        const sAppLogMessageOpen = "MSG_GROUP_UPLOAD";
        const sProcedureNameOpen = "sap.ino.db.iam.admin::group_upload_roundup_open";
        return util.processProcedure(sInput, oExternalControlledConnection, aHeaderOpen, sAppLogMessageOpen, sProcedureNameOpen, rowSanitizerOpen);
    }else{
        const aHeader = ['GROUP_NAME', 'MEMBER_TYPE_CODE', 'MEMBER_NAME'];
    
        const sAppLogMessage = "MSG_GROUP_UPLOAD";
        const sProcedureName = "sap.ino.db.iam.admin::group_upload_roundup";
        return util.processProcedure(sInput, oExternalControlledConnection, aHeader, sAppLogMessage, sProcedureName, rowSanitizer);  
        
    }
    
    
    
}

function process_delete(sInput, oExternalControlledConnection) {
    const aHeader = ['GROUP_NAME'];

    const sAppLogMessage = "MSG_GROUP_UPLOAD_DELETE";
    const sProcedureName = "sap.ino.db.iam.admin::group_upload_delete_roundup";
    
    function rowSanitizer(aRows, oRow) {
        oRow.LINE_NO      = aRows.length;
        oRow.GROUP_NAME   = oRow.GROUP_NAME.trim() || '';

        aRows.push(oRow);
        return aRows;
    }

    return util.processProcedure(sInput, oExternalControlledConnection, aHeader, sAppLogMessage, sProcedureName, rowSanitizer);
}