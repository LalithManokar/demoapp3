var trace = $.import("sap.ino.xs.xslib", "trace");
var message = $.import("sap.ino.xs.aof.lib","message");

var whoAmI = "sap.ino.xs.rest.admin.system.util";
var debug = function debug(line) {
    trace.debug(whoAmI, line);
};

var csvParser = $.import("sap.ino.xs.xslib", "csvParser");
var parse                    = csvParser.parse;
var nestedArrayToObjectArray = csvParser.nestedArrayToObjectArray;
var objectArrayToNestedArray = csvParser.objectArrayToNestedArray;
var generate                 = csvParser.generate;
var inferMap                 = csvParser.inferMap;

function toObjectArray(csv, fullHeader, includeMessages) {
    // the code below assumes that the full header contains
    // all data columns plus 7 message handling colums
    var deltaInputHeader = fullHeader.slice(0, fullHeader.length-(includeMessages? 0 : 7));
    // the syncInputHeader is the deltaInputHeader with removed OPERATION column
    var syncInputHeader  = deltaInputHeader.slice(1);

    csv = csv || '';
    var parsedCSV = parse(csv);
    var firstRow = parsedCSV[0];
    var mapData = inferMap(firstRow, deltaInputHeader);
    var result = [];

    if (mapData.isFirstRowMap) {
        debug("infered delta input map: " + mapData.map);
        result = nestedArrayToObjectArray(parsedCSV.slice(1), mapData.map);
    } else {
        mapData = inferMap(firstRow, syncInputHeader);
        if (mapData.isFirstRowMap) {
            debug("infered full input map: " + mapData.map);
            result = nestedArrayToObjectArray(parsedCSV.slice(1), mapData.map);
            result.fullUpload = true;
        } else {
            debug("first line is not a map -> apply delta input mode");
            result = nestedArrayToObjectArray(parsedCSV, deltaInputHeader);
        }
    }
    return result;
}

function toCSVResponse(input, header) {
    var withHeader = [header].concat(objectArrayToNestedArray(input, header));
    return generate(withHeader);
}

function lock(oConn) {
    function lockMessage(sWhoLockedIt) {
        return {
            ok : false,
            // MSG_OBJECT_ALREADY_LOCKED={0} already locked by user {1}.
            message     : 'MSG_OBJECT_ALREADY_LOCKED',
            object_name : '"SAP_INO"."sap.ino.db.iam::t_identity"',
            locked_by   : sWhoLockedIt
        };
    }
    
    debug("acquire exclusive lock for sap.ino.db.iam::t_identity");
    for (var attempt = 0; attempt < 5; ++attempt) {
        try {
            const sLock = 'lock table "SAP_INO"."sap.ino.db.iam::t_identity" in exclusive mode nowait';
            oConn.executeUpdate(sLock);
            debug("lock acquired for sap.ino.db.iam::t_identity");
            return {ok : true};
        } catch (e) {
            const sWhoLocked =
                "select top 1 user_name from "+
                "    sys.m_connections as co inner join "+
                "    sys.m_object_locks as lo "+
                "on "+
                "    co.transaction_id = lo.lock_owner_transaction_id "+
                "where "+
                "    lo.object_name = 'sap.ino.db.iam::t_identity' "+
                "and lo.schema_name = 'SAP_INO' "+
                "and lo.lock_mode   = 'EXCLUSIVE' "+
                "order by start_time desc ";
            var oWhoLockedIt = oConn.executeQuery(sWhoLocked)[0];
            var sWhoLockedIt = oWhoLockedIt && oWhoLockedIt.USER_NAME;
    
            debug("failed to acquire lock for sap.ino.db.iam::t_identity, attempt: " + attempt);
            if (sWhoLockedIt) {
                debug("locked by " + sWhoLockedIt);
                return lockMessage(sWhoLockedIt);
            } else {
                // We were unable to determine who holds the lock.
                // --> the lock was released
                // --> a retry should allow us to lock or at least to
                //     find out who acquired the next lock
                // --> we retry to lock
                // If we are unlucky and fail several times we will give
                // up with a generic message
                debug("locked by unknown user");
            }
        }
    }
    return lockMessage("<unknown user>");
}

function processProcedure(sInput, oExternalControlledConnection, aHeader, sAppLogMessage, sProcedureName, fnRowSanitizer) {
    const aFullHeader = aHeader.concat(['MESSAGE', 'TYPE', 'REF_FIELD', 'PARAM_0', 'PARAM_1', 'PARAM_2', 'PARAM_3']);

    // notice that this connection is NOT tied to the technical user but to
    // the session user
    const oConn = oExternalControlledConnection || $.hdb.getConnection();
     
    const bAutoLock   = !oExternalControlledConnection;
    const bAutoCommit = !oExternalControlledConnection;
    
    // trigger application log
    message.createMessage(message.MessageSeverity.Info, sAppLogMessage);

    if (bAutoLock) {
        const oLock = lock(oConn);
        if (!oLock.ok) {
            const aMessage = [{
                MESSAGE: oLock.message,
                PARAM_0: oLock.object_name,
                PARAM_1: oLock.locked_by
            }];
            return toCSVResponse(aMessage, aFullHeader);
        }
    }

    debug("setup stream parser");
    const oStream = (function getObjectStream() {
        const Parser = $.import("sap.ino.xs.xslib", "csvStreamParser");
        const oRawStream = Parser.parseString(sInput);
        if (oRawStream.next()) {
            const sFirstRow = oRawStream.value();
            const oMapData = Parser.inferMap(sFirstRow, aHeader);
            if (oMapData.isFirstRowMap) {
                debug("infered full input map: " + oMapData.map);
                // first line was a header --> parse the remainder of the stream accordingly
                return Parser.mapArraysToObjects(oRawStream, oMapData.map);
            } else {
                debug("first line is not a map - using default map: " + aHeader);
                // first line was already parsed --> get hold of a new stream
                return Parser.mapArraysToObjects(Parser.parseString(sInput), aHeader);
            }
        } else {
            // return empty stream
            return oRawStream;
        }
    })();

    const aDBInput = oStream.reduce(fnRowSanitizer, []);

    debug("call "+sProcedureName);
    const fnStoredProcedure = oConn.loadProcedure("SAP_INO", sProcedureName);
    const aDBOutput = fnStoredProcedure(aDBInput);

    if (bAutoCommit) {
        debug("commit work and release lock");
        oConn.executeUpdate("commit work");
        oConn.close();
    }
    
    debug("return CSV response");
    if(aDBOutput.OT_USER_MESSAGE){
        return toCSVResponse(aDBOutput.OT_USER_MESSAGE, aFullHeader);
    }
    if(aDBOutput.OT_GROUP_MESSAGE){
        return toCSVResponse(aDBOutput.OT_GROUP_MESSAGE, aFullHeader);
    }
}

function mergeMessages(oRow, aMessages) {
    aMessages = aMessages || [];
    var i = 0;

    oRow.TYPE      = '';
    oRow.MESSAGE   = '';
    oRow.REF_FIELD = '';
    oRow.PARAM_0   = '';
    oRow.PARAM_1   = '';
    oRow.PARAM_2   = '';
    oRow.PARAM_3   = '';
    
    for (i = 0; i < aMessages.length; i++) {
        var oMessage = aMessages[i];
        var cTypeCode = message.MessageSeverityCharCode(oMessage.severity);

        // merge first error or last none error message to output
        oRow.TYPE      = cTypeCode;
        oRow.MESSAGE   = oMessage.messageKey;
        oRow.REF_FIELD = oMessage.refAttribute || '';
        oRow.PARAM_0   = oMessage.parameters[0] || '';
        oRow.PARAM_1   = oMessage.parameters[1] || '';
        oRow.PARAM_2   = oMessage.parameters[2] || '';
        oRow.PARAM_3   = oMessage.parameters[3] || '';

        message.createMessage(cTypeCode, 
            oMessage.messageKey,
            oMessage.refKey,
            oMessage.refNode,
            oMessage.refAttribute,
            oRow.PARAM_0, oRow.PARAM_1, oRow.PARAM_2, oRow.PARAM_3
        );

        if (oMessage.severity <= message.MessageSeverity.Error) {
            // merge first error message and stop further processing
            break;
        }
    }
    
    return oRow;
}

function mergeMessage(oRow, TYPE, MESSAGE, REF_FIELD, PARAM_0, PARAM_1, PARAM_2, PARAM_3) {
    oRow.TYPE      = TYPE;
    oRow.MESSAGE   = MESSAGE;
    oRow.REF_FIELD = REF_FIELD || '';
    oRow.PARAM_0   = PARAM_0 || '';
    oRow.PARAM_1   = PARAM_1 || '';
    oRow.PARAM_2   = PARAM_2 || '';
    oRow.PARAM_3   = PARAM_3 || '';
    
    message.createMessage(
        TYPE,
        MESSAGE,
        undefined, undefined, REF_FIELD,
        PARAM_0, PARAM_1, PARAM_2, PARAM_3 
    );
    
    return oRow;
}

function containsError(aMessages) {
    var i = 0;
    for (i = 0; i < aMessages.length; i++) {
        if (aMessages[i].severity <= message.MessageSeverity.Error) {
            return true;
        }
    }
    return false;
}

function checkPrincipalExists(oRow) {
    const auth = $.import("sap.ino.xs.aof.core", "authorization");

    if (auth.getApplicationUser() === undefined || auth.getApplicationUser() === null) {
        mergeMessage(oRow, 'E', 'MSG_PRINCIPAL_IDENTITY_UNKNOWN');
        return false;
    } else {
        return true;
    }
}

const AOF = $.import("sap.ino.xs.aof.core", "framework");
const oTransaction = AOF.getTransaction();
function sequenceExecution(oRow, sOperation, aSequence) {
    if (!checkPrincipalExists(oRow)) {
        return oRow;
    }

    var response;
    for (var i=0; i<aSequence.length; ++i) {
        try {
            response = aSequence[i](oRow);
        } catch (e) {
            oTransaction.rollback();
            throw(e);
        }
        if (containsError(response.messages)) {
            oTransaction.rollback();
            return mergeMessages(oRow, response.messages);
        }
    }    
    oTransaction.commit();
    oRow.OPERATION = sOperation;
    return mergeMessages(oRow, response.messages);
}