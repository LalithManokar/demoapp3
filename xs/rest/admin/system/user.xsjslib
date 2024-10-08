const trace = $.import("sap.ino.xs.xslib", "trace");
const message = $.import("sap.ino.xs.aof.lib","message");

const whoAmI = "sap.ino.xs.rest.admin.system.user.xsjslib";
const debug = function debug(line) {
    trace.debug(whoAmI, line);
};

const AOF = $.import("sap.ino.xs.aof.core", "framework");
const User = AOF.getApplicationObject("sap.ino.xs.object.iam.User");
const SourceTypeCode = $.import("sap.ino.xs.object.iam", "SourceTypeCode");
const UserLib = $.import("sap.ino.xs.object.iam", "User");

const oHQ = $.import("sap.ino.xs.xslib", "dbConnection").getHQ();

const util = $.import("sap.ino.xs.rest.admin.system", "util");
const toObjectArray     = util.toObjectArray;
const toCSVResponse     = util.toCSVResponse;
const mergeMessages     = util.mergeMessages;
const mergeMessage      = util.mergeMessage;
const containsError     = util.containsError;
const sequenceExecution = util.sequenceExecution;

const fullHeader = ['OPERATION', 'USER_NAME', 'IS_EXTERNAL', 'FIRST_NAME', 'LAST_NAME', 'NAME',
                    'EMAIL', 'PHONE', 'MOBILE', 'COST_CENTER', 'ORGANIZATION', 'OFFICE',
                    'MESSAGE', 'TYPE', 'REF_FIELD', 'PARAM_0', 'PARAM_1', 'PARAM_2', 'PARAM_3'];

const executableOperations = ['CREATE', 'ALTER', 'DROP'];

const createSingleUser = function(oRow) {
    return sequenceExecution(oRow, 'CREATED', [
        function (oRow) {
            var oResponse = User.create(oRow);
            oRow.ID = oResponse.generatedKeys && oResponse.generatedKeys[oRow.ID] || oRow.ID;
            return oResponse;
        },
        function (oRow) { 
            return User.assignStaticRoles(oRow.ID, {STATIC_ROLE_ASSIGNMENT : [{ROLE_CODE : 'COMMUNITY_USER'}]});
        }
    ]);
};

const alterSingleUser = function(oRow) {
    return sequenceExecution(oRow, 'ALTERED', [User.update]);
};

const dropSingleUser = function(oRow) {
    return sequenceExecution(oRow, 'DROPPED', [
        function (oRow){ return User.del(oRow.ID); }
    ]);
};


function process(input) {
    UserLib.setBatchMode();
    
    // trigger application log
    message.createMessage(message.MessageSeverity.Info, "MSG_USER_UPLOAD");
    
    // parse input and find out if full upload is required
    var parsedInput = toObjectArray(input, fullHeader);

    // detect duplicate input entries, create a hashmap for backwards mapping
    var rowByUserName = {};
    (function () {
        for (var row=0; row < parsedInput.length; ++row) {
    
            var onlyZeroOrWhitespace = /^[0\s]*$/; 
            parsedInput[row].IS_EXTERNAL = onlyZeroOrWhitespace.test(parsedInput[row].IS_EXTERNAL)? 0: 1; 
      
            var operation = parsedInput[row].OPERATION || "";
            if (executableOperations.indexOf(operation) >= 0) {
                if (rowByUserName[parsedInput[row].USER_NAME] === undefined) {
                    rowByUserName[parsedInput[row].USER_NAME] = row;
                } else {
                    parsedInput[row] = mergeMessage(parsedInput[row], 'E', 'MSG_USER_UPLOAD_DUPLICATE_USER_NAME', 'USER_NAME');
                    // instead of removing the row and merging it in later on, we flag it accordingly
                    parsedInput[row].skipped = true;
                }
            }
        }
    }());

    // read sap.ino.db.iam::v_identity to determine the proper identity IDs for those that do exist
    // and put the result into a hashmap
    var identities = oHQ.statement('select ID, USER_NAME from "sap.ino.db.iam::v_identity" where TYPE_CODE = \'USER\'').execute();
    var idByUserName = {};
    var i;
    for (i=0; i<identities.length; ++i) {
        idByUserName[identities[i].USER_NAME] = identities[i].ID;
    }

    // map full upload to delta upload
    if (parsedInput.fullUpload) {
        // in case of full upload mode determine the operations
        // CREATE for new users
        // ALTER for existing users
        for (i=0; i<parsedInput.length; ++i) {
            parsedInput[i].OPERATION = idByUserName[parsedInput[i].USER_NAME] === undefined? 'CREATE': 'ALTER';
        }
    }

    // distribute by operation type
    var result = [];
    var preliminaryId = -1;
    for (var rowIndex=0; rowIndex < parsedInput.length; ++rowIndex) {
        var row = parsedInput[rowIndex];
        if (row.skipped) {
            result.push(row);
        } else {
            switch (row.OPERATION) {
                case 'CREATE':
                    row.ID = preliminaryId--;
                    row.SOURCE_TYPE_CODE = SourceTypeCode.SourceTypeCode.Upload;
                    result.push(createSingleUser(row));
                    break;
                case 'ALTER':
                    if (idByUserName[row.USER_NAME] === undefined) {
                        row = mergeMessage(row, 'E', 'MSG_USER_UPLOAD_USER_NOT_FOUND', 'USER_NAME');
                        result.push(row);
                    } else {
                        row.ID = idByUserName[row.USER_NAME];
                        row.SOURCE_TYPE_CODE = SourceTypeCode.SourceTypeCode.Upload;
                        result.push(alterSingleUser(row));
                    }
                    break;
                case 'DROP':
                    if (idByUserName[row.USER_NAME] === undefined) {
                        // we assume that a drop for something that does not exist is some kind of success
                        row = mergeMessage(row, 'S', 'MSG_USER_UPLOAD_USER_NOT_FOUND', 'USER_NAME');
                        row.OPERATION = 'DROPPED';
                        result.push(row);
                    } else {
                        row.ID = idByUserName[row.USER_NAME];
                        result.push(dropSingleUser(row));
                    }
                    break;
            }
        }
    }

    // in case of full upload add the missing DELETE operations to the result
    if (parsedInput.fullUpload) {
        for (i=0; i<identities.length; ++i) {
            var deleteRequestRow = {OPERATION: 'DROP'};
            if (rowByUserName[identities[i].USER_NAME] === undefined) {
                // USER_NAME not contained in input
                deleteRequestRow.USER_NAME = identities[i].USER_NAME;
                deleteRequestRow = mergeMessage(deleteRequestRow, 'E', 'MSG_USER_UPLOAD_NO_IMPLICIT_DROP', 'USER_NAME');
                result.push(deleteRequestRow);
            }
        }
    }

    UserLib.finalizeBatchMode(oHQ);
    return (
        "This service is DEPRECATED, please use the new service /sap/ino/xs/rest/admin/system/user_upload.xsjs instead\n" +
        toCSVResponse(result, fullHeader)
    );
}
