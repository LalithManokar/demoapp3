const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const trace = $.import("sap.ino.xs.xslib", "trace");
const message = $.import("sap.ino.xs.aof.lib","message");

const whoAmI = "sap.ino.xs.rest.admin.group_member.xsjslib";
const debug = function debug(line) {
    trace.debug(whoAmI, line);
};

const AOF = $.import("sap.ino.xs.aof.core", "framework");
const Group = AOF.getApplicationObject("sap.ino.xs.object.iam.Group");
const GroupLib = $.import("sap.ino.xs.object.iam", "Group");

const oHQ = $.import("sap.ino.xs.xslib", "dbConnection").getHQ();

const csvParser = $.import("sap.ino.xs.xslib", "csvParser");
const parse                    = csvParser.parse;
const nestedArrayToObjectArray = csvParser.nestedArrayToObjectArray;
const objectArrayToNestedArray = csvParser.objectArrayToNestedArray;
const generate                 = csvParser.generate;
const inferMap                 = csvParser.inferMap;

const util = $.import("sap.ino.xs.rest.admin.system", "util");
const mergeMessages     = util.mergeMessages;
const mergeMessage      = util.mergeMessage;


const fullHeader = ['GROUP_NAME', 'MEMBER_TYPE', 'MEMBER_NAME',
                    'MESSAGE', 'TYPE', 'REF_FIELD', 'PARAM_0', 'PARAM_1', 'PARAM_2', 'PARAM_3'];
const header = fullHeader.slice(0,3);

function toObjectArray(csv, header) {
    var parsedCSV = parse(csv);
    var firstRow = parsedCSV[0];
    var mapData = inferMap(firstRow, header);
    var result = [];
    if (mapData.isFirstRowMap) {
        debug("infered map: " + mapData.map);
        result = nestedArrayToObjectArray(parsedCSV.slice(1), mapData.map);
    } else {
        debug("first line is not a map");
        result = nestedArrayToObjectArray(parsedCSV, header);
    }
    result.hasHeader = mapData.isFirstRowMap;
    return result;
}

function toCSVResponse(input) {
    var withHeader = [fullHeader].concat(objectArrayToNestedArray(input, fullHeader));
    return generate(withHeader);
}

const readAllGroupsAndMembersStatement = oHQ.statement(
        'select '+
        '    group_identity.name as group_name, '+
        '    member_identity.type_code as member_type, '+
        '    map(member_identity.type_code, '+
        "        'GROUP', member_identity.name, "+
        "        'USER',  member_identity.user_name, "+
        "        '') as member_name "+
        'from '+
        '    "sap.ino.db.iam::t_identity_group_member" as members, '+
        '    "sap.ino.db.iam::t_identity" as group_identity, '+
        '    "sap.ino.db.iam::t_identity" as member_identity '+
        'where '+
        '    members.group_id  = group_identity.id '+
        'and members.member_id = member_identity.id '+
        'and group_identity.erased = 0 '+
        'and member_identity.erased = 0 '+
        'order by '+
        '    group_name, '+
        '    member_type, '+
        '    member_name'
    );

const getGroupAndMemberIdStatement = oHQ.statement(
        'select '+
        '    groups.id     as group_id, '+
        '    groups.erased as group_erased, '+
        '    member.id     as member_id, '+
        '    member.erased as member_erased '+
        'from '+
        '    (select ? as group_name, ? as type_code, ? as member_name from dummy) as input '+
        
        'left outer join "sap.ino.db.iam::t_identity" as groups '+
        '    on input.group_name = groups.name '+
        
        'left outer join ( '+
        "    select id, type_code, map(type_code, 'USER', upper(user_name), 'GROUP', name) as name, erased "+
        '    from "sap.ino.db.iam::t_identity" '+
        ') as member '+
        '    on input.member_name = member.name '
    );

function getGroupAndMemberID(oRow) {
    var aResult = getGroupAndMemberIdStatement.execute(
            oRow.GROUP_NAME,
            oRow.MEMBER_TYPE,
            oRow.MEMBER_TYPE === 'USER' ? (oRow.MEMBER_NAME && oRow.MEMBER_NAME.toUpperCase()) : oRow.MEMBER_NAME
    );
    var oResult = aResult[0];
    oRow.GROUP_ID = oResult.GROUP_ID;
    oRow.MEMBER_ID = oResult.MEMBER_ID; 
}

function checkAndDetermine(oRow) {
    const GROUP_NAME = oRow.GROUP_NAME;
    const MEMBER_TYPE = oRow.MEMBER_TYPE;
    const MEMBER_NAME = oRow.MEMBER_NAME;
    
    var oMessage = {};
    
    if (MEMBER_TYPE !== 'GROUP' && MEMBER_TYPE !== 'USER' && MEMBER_TYPE !== '') {
        mergeMessage(oRow, 'E', 'MSG_IDENTITY_TYPE_NOT_EXISTS', 'MEMBER_TYPE', MEMBER_TYPE);
    } else {
        // We process single records since we can not pass tables to the DB API
        getGroupAndMemberID(oRow);
        if (!oRow.GROUP_ID) {
            mergeMessage(oRow, 'E', 'MSG_IDENTITY_GROUP_NOT_EXISTS', 'GROUP_NAME', oRow.GROUP_NAME);
        } else 
        if (MEMBER_TYPE !== '' && !oRow.MEMBER_ID) {
            mergeMessage(oRow, 'E', 'MSG_IDENTITY_MEMBER_NOT_EXISTS', 'MEMBER_NAME', oRow.MEMBER_TYPE, oRow.MEMBER_NAME);
        }
    }

    return oRow;
}

function process(input) {
    GroupLib.setBatchMode();
    message.createMessage(message.MessageSeverity.Info, "MSG_GROUP_MEMBER_UPLOAD");
        
    var parsedInput = toObjectArray(input, header);
    if (parsedInput.length === 0) {
        if (parsedInput.hasHeader) {
            // empty request with header --> dump all group member assignments to output
            return toCSVResponse(readAllGroupsAndMembersStatement.execute());
        } else {
            // empty request --> return header
            return toCSVResponse([]);
        }
    } else {
        var GroupsById = {};
        
        parsedInput.forEach(function(oRow, rowNumber) {
            checkAndDetermine(oRow);
            
            // create AOF compliant update request
            if (!oRow.MESSAGE) {
                if (!GroupsById[oRow.GROUP_ID]) {
                    GroupsById[oRow.GROUP_ID] = { 
                        ID : oRow.GROUP_ID, 
                        NAME: oRow.GROUP_NAME, 
                        Members: [],
                        firstRowWithThisGroup : rowNumber
                    };
                }
                if (oRow.MEMBER_ID) {
                    GroupsById[oRow.GROUP_ID].Members.push({
                        // use -rowNumber-1 as transient id in order to enable easier backwards mapping
                        // notice that -0 == 0 hence 0 can not be used as a transient ID
                        ID: -rowNumber-1,
                        MEMBER_ID: oRow.MEMBER_ID
                    });
                }
            }
        });
        
        _.each(GroupsById, function(oGroup) {
            var oResponse = Group.update(oGroup);
            
            var oMessagesByRowNumber = _.groupBy(oResponse.messages, function(oMessage) {
                var REF_ID = oMessage.refKey;
                return REF_ID < 0? -REF_ID-1 // backwards mapping to get row number
                                 : GroupsById[REF_ID].firstRowWithThisGroup;
            });
            _.each(oMessagesByRowNumber, function(aMessages, rowNumber) {
                mergeMessages(parsedInput[rowNumber], aMessages);
            });
        });

        GroupLib.finalizeBatchMode(oHQ);
        return (
            "This service is DEPRECATED, please use the new service /sap/ino/xs/rest/admin/system/group_upload.xsjs instead\n" +
            toCSVResponse(parsedInput)
        );
    }
}