const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_1.1.0.02_move_comments.xsjslib';

function error(line) {
    trace.error(whoAmI, line);
}
function info(line) {
    trace.info(whoAmI, line);
}

function check(oConnection) {
    const oHQ = HQ.hQuery(oConnection);
    var sStatement = 'select top 1 id from "SAP_INO"."sap.ino.db.idea::t_comment"';
    var aResult = oHQ.statement(sStatement).execute();
    if (aResult.length < 1) {
        // no table entry, no need to move anything
        return true;
    }

    sStatement = 'select top 1 id from "SAP_INO"."sap.ino.db.comment::t_comment"';
    aResult = oHQ.statement(sStatement).execute();
    if (aResult.length > 0) {
        error('sap.ino.db.comment::t_comment already contains data');
        return false;
    }

    sStatement = 'select top 1 id from "SAP_INO"."sap.ino.db.comment::t_comment_h"';
    aResult = oHQ.statement(sStatement).execute();
    if (aResult.length > 0) {
        error('sap.ino.db.comment::t_comment_h already contains data');
        return false;
    }
    
    //all clear -> true
    return true;
}

function run(oConnection) {
    const oHQ = HQ.hQuery(oConnection);
    
    var sStatement = 'select top 1 id from "SAP_INO"."sap.ino.db.idea::t_comment"';
    var aResult = oHQ.statement(sStatement).execute();
    if (aResult.length < 1) {
        return true;
    };
        
    const sMoveComment          = 'insert into "SAP_INO"."sap.ino.db.comment::t_comment" ' +
                                  '(ID, CREATED_AT, CREATED_BY_ID, CHANGED_AT, CHANGED_BY_ID, OBJECT_ID, COMMENT, OBJECT_TYPE_CODE) ' +
                                  'select ID, CREATED_AT, CREATED_BY_ID, CHANGED_AT, CHANGED_BY_ID, IDEA_ID as OBJECT_ID, COMMENT, \'IDEA\' as OBJECT_TYPE_CODE ' +
                                  'from "SAP_INO"."sap.ino.db.idea::t_comment"';
    const sMoveCommentHistory   = 'insert into "SAP_INO"."sap.ino.db.comment::t_comment_h" ' +
                                  '(HISTORY_DB_EVENT, HISTORY_BIZ_EVENT, HISTORY_AT, HISTORY_ACTOR_ID, ID, CREATED_AT, CREATED_BY_ID, CHANGED_AT, CHANGED_BY_ID, OBJECT_ID, COMMENT, OBJECT_TYPE_CODE) ' +
                                  'select HISTORY_DB_EVENT, HISTORY_BIZ_EVENT, HISTORY_AT, HISTORY_ACTOR_ID, ID, CREATED_AT, CREATED_BY_ID, CHANGED_AT, CHANGED_BY_ID, IDEA_ID as OBJECT_ID, COMMENT, \'IDEA\' as OBJECT_TYPE_CODE ' +
                                  'from "SAP_INO"."sap.ino.db.idea::t_comment_h"';

    oHQ.statement(sMoveComment).execute();
    info('Comments successfully moved.')
    oHQ.statement(sMoveCommentHistory).execute();
    info('Comment History successfully moved.')
        
    return true;
}

function clean(oConnection) {
    const oHQ = HQ.hQuery(oConnection);
    
    var sCleanComment = 'delete from "SAP_INO"."sap.ino.db.comment::t_comment"';
    var sCleanCommentHistory = 'delete from "SAP_INO"."sap.ino.db.comment::t_comment_h"';
    
    oHQ.statement(sCleanComment).execute();
    oHQ.statement(sCleanCommentHistory).execute();
    return true;
}