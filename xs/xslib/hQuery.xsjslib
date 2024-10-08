const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const trace = $.import("sap.ino.xs.xslib", "trace");
const iter = $.import("sap.ino.xs.xslib", "iterable");

const whoAmI = 'sap.ino.xs.xslib.hQuery';
function debug(line) { trace.debug(whoAmI, line); }

// Ensure that _cache is properly initialized even if no instance is yet created.
// This is necessary in case trace results are requested before any instance is created.
hQuery._cache = hQuery._cache || {key: [], content: []};

// HQuery

/**
 * Factory for HQuery
 * @param {$.hdb.Connection} oConnection
 */
function hQuery(oConnection) {
    var iIndex = hQuery._cache.key.indexOf(oConnection);
    if (iIndex < 0) {
        hQuery._cache.key.push(oConnection);
        hQuery._cache.content.push(new HQuery(oConnection));
        iIndex = hQuery._cache.key.indexOf(oConnection);
    }

    var oHQ = hQuery._cache.content[iIndex];

    // convenient breakpoint location
    // use the debugger to set bDebug to true
    var bDebug = false;
    if (bDebug) {
        var aConnection = oHQ.statement('SELECT CURRENT_CONNECTION FROM DUMMY').execute();
        debug(JSON.stringify(aConnection));
    }
    return oHQ;
}

/**
 * Database API Wrapper
 * 
 * @constructor
 * @param {$.hdb.Connection} oConnection
 */
function HQuery(oConnection) {
    logElapsed("HQuery - init");
    this.connection = oConnection;
    this.schemaName = undefined; // create property so we can pass it as argument
}

/**
 * @returns {$.hdb.Connection} oConnection
 **/
HQuery.prototype.getConnection = function() { 
    return this.connection; 
};

/**
 * @returns {string} - Database schema currently in use
 **/
HQuery.prototype.getSchema = function() { 
    return this.schemaName; 
};

/**
 * @param {string} sSchemaName
 * @returns {HQuery} - HQuery instance for method chaining
 */
HQuery.prototype.setSchema = function(sSchemaName) {
    this.schemaName = sSchemaName; 
    return this; 
};

/**
 * @param {string} sSchemaName - optional
 * @param {string} sTableName
 * @returns {HQueryTable}
 */
HQuery.prototype.table = function(sSchemaName, sTableName) {
    if (arguments.length === 1) {
        sTableName = sSchemaName;
        return hQueryTable(this.connection, this.schemaName, sTableName);
    } 
    return hQueryTable(this.connection, sSchemaName, sTableName);
};

/**
 * @param {string} sSchemaName - optional
 * @param {string} sProcedureName
 * @returns {HQueryProcedure}
 */
HQuery.prototype.procedure = function(sSchemaName, sProcedureName) {
    if (arguments.length === 1) {
        sProcedureName = sSchemaName;
        return hQueryProcedure(this.connection, this.schemaName, sProcedureName);
    }
    return hQueryProcedure(this.connection, sSchemaName, sProcedureName);
};

/**
 * @param {string} sSQLStatement 
 * @param {Array} aValues - Values for parameters in sSQLStatement
 * @returns {HQueryStatement}
 */
HQuery.prototype.statement = function(sSQLStatement, aValues) {
    if (arguments.length === 1) {
        return hQueryStatement(this.connection, this.schemaName, sSQLStatement);
    } else {
        return hQueryStatement(this.connection, this.schemaName, sSQLStatement).execute(aValues);
    }
};

/**
 * @param {string} sSchemaName - optional
 * @param {string} sTableName
 * @returns {Array} - all values in the table
 */
HQuery.prototype.read = function (sSchemaName, sTableName) {
    if (arguments.length === 1) {
        sTableName = sSchemaName;
        return HQread(this.connection, this.schemaName, sTableName);
    }
    return HQread(this.connection, sSchemaName, sTableName);
};

/**
 * @private
 */ 
function HQread(oConnection, sSchemaName, sTableName) {
    logElapsed("HQread("+sSchemaName+", "+sTableName+")");
    var sStatement = 'select * from ' + '"' + sSchemaName + '"."' + sTableName + '"';
    debug('execute statement: ' + sStatement);
    return resultSetToObject(oConnection.executeQuery(sStatement));
}


/**
 * @param {string} sSchemaName - optional
 * @param {string} sSequenceName
 * @returns {HQuerySequence}
 */
HQuery.prototype.sequence = function(sSchemaName, sSequenceName) {
    if (arguments.length === 1) {
        sSequenceName = sSchemaName;
        return hQuerySequence(this.connection, this.schemaName, sSequenceName);
    }
    return hQuerySequence(this.connection, sSchemaName, sSequenceName);
};

// Table

/**
 * Factory for HQueryTable
 * @param {$.hdb.Connection}
 * @param {string} sSchemaName
 * @param {string} sTableName
 */
function hQueryTable(oConnection, sSchemaName, sTableName) {
    return new HQueryTable(oConnection, sSchemaName, sTableName);
}

/**
 * Database table
 * 
 * @constructor
 * @param {$.hdb.Connection}
 * @param {string} sSchemaName
 * @param {string} sTableName
 **/ 
function HQueryTable(oConnection, sSchemaName, sTableName) {
    this.connection = oConnection;
    this.schemaName = sSchemaName;
    this.tableName = sTableName;
}

/**
 * @returns {Array} all (!) table rows
 */
HQueryTable.prototype.read = function() { 
    return HQread(this.connection, this.schemaName, this.tableName); 
};

/**
 * Inserts one or multiple rows
 * @param {Array} aContent
 * @returns {HQueryTable}
 */
HQueryTable.prototype.insert = function(vContent) {
    HQmodify(this.connection, this.schemaName, this.tableName, vContent, false);
    return this;
};

/**
 * Upserts one or multiple rows
 * @param {Array} aContent
 * @returns {HQueryTable}
 */
HQueryTable.prototype.upsert = function(vContent) {
    HQmodify(this.connection, this.schemaName, this.tableName, vContent, true);
    return this;
};

/**
 * @private
 */
function HQmodify (oConnection, sSchemaName, sTableName, vContent, bUpsert) {
    logElapsed("HQinsert "+sSchemaName+", "+sTableName+") - start");
    if (vContent.length === 0) {
        logElapsed("HQmodify "+sSchemaName+", "+sTableName+") - shortcut done");
        return;
    }

    // we expect an array of rows, if a single row is passed make it an array 
    var aContent = [].concat(vContent);
    if (!aContent || aContent.length === 0) {
        return;
    }

    // the columns to map are the super set of all columns provided
    var aColumns = _.uniq(_.reduce(aContent, function(aResult, object) { 
        return aResult.concat(_.keys(object));
    }, []));
 
    // normalize objects on common columns: 
    // remove unnecessary ones and fill-up missing ones with undefined
    aContent = _.map(aContent, function(object) {
        return _.map(aColumns, function(column){
            return mapNull(object[column]);
        });
    });

    var aPlaceholders = _.map(aColumns, function() { return '?'; });

    var sStatement = bUpsert? 'upsert ': 'insert into ';
    sStatement += '"' + sSchemaName + '"."' + sTableName + '" (';
    sStatement += aColumns.join(',');
    sStatement += ') values (' + aPlaceholders.join(',') +')';

    if (bUpsert) {
        sStatement += ' with primary key';
    }

    logElapsed("HQmodify "+sSchemaName+", "+sTableName+") - before execute");

    oConnection.executeUpdate(sStatement, aContent);

    logElapsed("HQinsert "+sSchemaName+", "+sTableName+") - execute");
    logElapsed("HQinsert "+sSchemaName+", "+sTableName+") - done");
}

/**
 * Truncates complete table
 * @returns {HQueryTable}
 */
HQueryTable.prototype.truncate = function() {
    HQtruncate(this.connection, this.schemaName, this.tableName);
    return this;
};

function HQtruncate(oConnection, sSchemaName, sTableName) {
    logElapsed("HQtruncate("+sSchemaName+", "+sTableName+")");
    var sStatement = 'truncate table ' + '"' + sSchemaName + '"."' + sTableName + '"';
    debug('execute statement: ' + sStatement);
    return oConnection.executeUpdate(sStatement);
}

// Procedures

/**
 * Factory for HQueryProcedure
 * @param {$.hdb.Connection}
 * @param {string} sSchemaName
 * @param {string} sProcedureName
 * @returns {HQueryProcedure}
 */
function hQueryProcedure(oConnection, sSchemaName, sProcedureName) {
    return new HQueryProcedure(oConnection, sSchemaName, sProcedureName);
}

/**
 * SQLScript Procedure
 * @constructor
 * @param {$.hdb.Connection}
 * @param {string} sSchemaName
 * @param {string} sProcedureName
 */ 
function HQueryProcedure(oConnection, sSchemaName, sProcedureName) {
    logElapsed("HQueryProcedure("+sSchemaName+", "+sProcedureName+")");
    this.connection = oConnection;
    this.schemaName = sSchemaName;
    this.procedure_name = sProcedureName;
}

/**
 * Executes procedure with given variable number of arguments
 * @param variable arguments
 * @returns {object} result
 */ 
HQueryProcedure.prototype.execute = function() {
    var fnProc = this.connection.loadProcedure(this.schemaName, this.procedure_name);
    var result = fnProc.apply(undefined, arguments);
    return resultSetToObject(result);
};

// Statement

/**
 * Factory for HQueryStatement
 * @param {$.hdb.Connection}
 * @param {string} sSchemaName
 * @param {string} sSQLStatement
 * @returns {HQueryStatement}
 */
function hQueryStatement(oConnection, sSchemaName, sSQLStatement) {
    return new HQueryStatement(oConnection, sSchemaName, sSQLStatement);
}

/**
 * SQL Statement (except CALL)
 * @constructor
 * @param {$.hdb.Connection}
 * @param {string} sSchemaName
 * @param {string} sSQLStatement
 */ 
function HQueryStatement(oConnection, sSchemaName, sSQLStatement) {
    logElapsed("HQueryStatement("+sSchemaName+", "+sSQLStatement+")");
    this.connection = oConnection;
    this.schemaName = sSchemaName;
    this.sqlStatement = sSQLStatement;
}

/**
 * Executes statement with variable number of arguments.
 * There must be exactly one argument per statement parameter (?)
 * @param variable arguments
 * @returns {Array} - Array of objects for SELECT, Integer for other statements
 */

HQueryStatement.prototype.execute = function(aValues) {
    var fnMethod;
    var vResult;
    if (isUpdateQuery(this.sqlStatement)) {
        fnMethod = this.connection.executeUpdate;
    } else {
        fnMethod = this.connection.executeQuery;
    }

    if (arguments.length > 0) {
        if (!(aValues instanceof Array)) {
            aValues = _.toArray(arguments);
        }
        aValues = _.map(aValues, mapNull);
        vResult = fnMethod.apply(this.connection, [this.sqlStatement].concat(aValues));
    } else {
        if(this.sqlStatement.indexOf("t_status_authorization") + 1){
            var sqlText = this.sqlStatement;
        }
        vResult = fnMethod.call(this.connection, this.sqlStatement);
    }

    if (vResult && vResult.length !== undefined) {
        return resultSetToObject(vResult);
    }
    return vResult;
};

// Sequence

/**
 * Factory for HQuerySequence
 * @param {$.hdb.Connection}
 * @param {string} sSchemaName
 * @param {string} sSequenceName
 * @returns {HDBQuerySequence}
 */
function hQuerySequence(oConnection, sSchemaName, sSequenceName) {
    return new HQuerySequence(oConnection, sSchemaName, sSequenceName);
}

/**
 * Database sequence
 * @constructor
 * @param {$.hdb.Connection}
 * @param {string} sSchemaName
 * @param {string} sSequenceName
 */

function HQuerySequence(oConnection, sSchemaName, sSequenceName) {
    logElapsed("HQuerySequence("+sSchemaName+", "+sSequenceName+")");
    this.connection = oConnection;
    this.schemaName = sSchemaName;
    this.sequenceName = sSequenceName;
}

/**
 * Next value of sequence
 * @returns {Integer}
 */ 
HQuerySequence.prototype.nextval = function() {
    return HQnextval(this.connection, this.schemaName, this.sequenceName);
};

/**
 * @private
 */
function HQnextval(oConnection, sSchemaName, sSequenceName) {
    logElapsed("HQnextval("+sSchemaName+", "+sSequenceName+")");
    var sStatement = 'select cast("' + sSchemaName  + '"."' + sSequenceName + '".nextval as integer) as key from dummy';
    var aResult = oConnection.executeQuery(sStatement);
    return aResult[0].KEY;
}

// Utilities

function warning(line) { 
    trace.warning(whoAmI, line); 
}

function debug(line) { 
    trace.debug(whoAmI, line); 
}

function logElapsed(label) {
    function pad(number) { return ("     "+number).slice(-5); }

    if (this.start === undefined) {
        this.start = parseInt(new Date().getTime(), 10);
        this.previous = this.start;
        debug('[delta, total]: ' +
              pad(0) + ' ms, ' +
              pad(0) + ' ms, ' + label);

    } else {
        var current = parseInt(new Date().getTime(), 10);
        debug('[delta, total]: ' +
              pad((current-this.previous)) + ' ms, ' +
              pad((current-this.start))    + ' ms, ' + label);
        this.previous = current;
    }
}


function isUpdateQuery(sSQLStatement) {
    var sStatement = sSQLStatement.toLowerCase().trim();
    return sStatement.indexOf("select") !== 0;
}

function isProcedureResult(oResult){
    // unfortunately instanceof does not work when comparing it to $.hdb.ProcedureResult
    return (oResult.toString() === "[object ProcedureResult]");
}

function isResultSet(oResult){
       // unfortunately instanceof does not work when comparing it to $.hdb.ResultSet
    return (oResult.toString() === "[object ResultSet]");
}

function resultSetToObject(oResult) {
    if (isProcedureResult(oResult)) {
        return _.mapObjects(oResult, function(vValue) {
            return isResultSet(vValue) ? resultSetToObject(vValue) : normalizeValue(vValue);
        });
    }

    // Result Set
    return _.map(oResult, function(oResultRecord) {
            // we need to clone so that the _ operations work correctly
            oResultRecord = _.clone(oResultRecord);
            return _.mapObjects(oResultRecord, normalizeValue);
    });
}

function normalizeValue(vValue){
    if (vValue instanceof Date) {
        // to return exactly the ISO string as on database
        // we need to eliminate the locale effect (server locale) of Date object
        // offset in minutes needs to be subtracted from milliseconds since 1970
        var sIsoDateString =  (new Date(vValue.getTime() - vValue.getTimezoneOffset() * 60 * 1000)).toISOString();
        // year -1 indicates time without any date
        if (vValue.getFullYear() === -1) {
            return  sIsoDateString.split("T",2)[1].substring(0,8);
        }
        return sIsoDateString;
    }
    return vValue;
}

function mapNull(vValue){
    // We have decided application-wide to treat "" as null (including AOF)
    if(vValue === undefined || vValue === "") {
        return null;
    } else {
        return vValue;
    }
}

function getTrace() {
    // this will retrieve anything that was explicitly traced with the SQL TRACE statement

    var trace = { connection: []};
    for (var connection_index=0; connection_index < this.hQuery._cache.key.length; ++connection_index) {
        var hq = this.hQuery._cache.content[connection_index];
        var connectionDescription = {index: connection_index,
                                     SQLSCRIPT_TRACE: hq.statement('SELECT * FROM SYS.SQLSCRIPT_TRACE').execute()};

        trace.connection.push(connectionDescription);
        for (var trace_table_index=0; trace_table_index < connectionDescription.SQLSCRIPT_TRACE.length ; ++trace_table_index) {
            var table_name = connectionDescription.SQLSCRIPT_TRACE[trace_table_index].TABLE_NAME;
            connectionDescription.SQLSCRIPT_TRACE[trace_table_index].CONTENT = hq.statement('SELECT * FROM '+ $.session.getUsername() + '.' + table_name).execute();
        }
    }
    return trace;
}
