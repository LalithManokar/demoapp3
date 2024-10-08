var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
const getHQ = dbConnection.getHQ;
var oHQ = getHQ();

function sqlInjectionSafeCheck(sParameter){
    if(sParameter && isNaN(sParameter)){
        var sQuery = `
            SELECT IS_SQL_INJECTION_SAFE(?) "safe" FROM DUMMY
        `;
        var rs =  oHQ.statement(sQuery).execute(sParameter);
        return rs.length === 1 ? rs[0].safe : 'none parameter passed ';
    } else{
        return 'none parameter passed ';
    }
}

function sqlEscapeSingleQuotes(sParameter){
    if(sParameter && isNaN(sParameter)){
        var sQuery = `
            SELECT ESCAPE_SINGLE_QUOTES(?) "string" FROM DUMMY
        `;
        var rs =  oHQ.statement(sQuery).execute(sParameter);
        return rs.length === 1 ? rs[0].string : '';
    } else{
        return sParameter;
    }
}

function sqlEscapeDoubleQuotes(sParameter){
    if(sParameter && isNaN(sParameter)){
        var sQuery = `
            SELECT ESCAPE_DOUBLE_QUOTES(?) "string" FROM DUMMY
        `;
        var rs =  oHQ.statement(sQuery).execute(sParameter);
        return rs.length === 1 ? rs[0].string : '';
    } else{
        return '';
    }
}