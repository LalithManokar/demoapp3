const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_1.1.0.06_delete_old_comments.xsjslib';

function error(line) {
    trace.error(whoAmI, line);
}
function info(line) {
    trace.info(whoAmI, line);
}

function check(oConnection) {
    const oHQ = HQ.hQuery(oConnection);

    var sStatement = 'select top 1 id from (select id from "SAP_INO"."sap.ino.db.idea::t_comment" union select id from "SAP_INO"."sap.ino.db.idea::t_comment_h")';
    var aResult = oHQ.statement(sStatement).execute();
    if (aResult.length < 1) {
        info('There is no data in the tables to delete, no need to do anything.');
        // no table entry, no need to delete anything
        return true;
    }

    const sStatementComment = 'select coalesce(old.id, new.id) as id '+
                              'from "SAP_INO"."sap.ino.db.idea::t_comment" as old ' +
                              'full outer join "SAP_INO"."sap.ino.db.comment::t_comment" as new ' +
                              'on old.id = new.id ' +
                              'where old.id is null or new.id is null';

    aResult = oHQ.statement(sStatementComment).execute();
    if(aResult.length > 0){
        info('"SAP_INO"."sap.ino.db.idea::t_comment" and "SAP_INO"."sap.ino.db.comment::t_comment" do not match; step 02_move_comments must run before.');
        return true;
    }

    const sStatementCommentHistory = 'select coalesce(old.id, new.id) as id '+
                                     'from "SAP_INO"."sap.ino.db.idea::t_comment_h" as old ' +
                                     'full outer join "SAP_INO"."sap.ino.db.comment::t_comment_h" as new ' +
                                     'on  old.history_db_event = new.history_db_event ' +
                                     'and old.history_biz_event = new.history_biz_event ' +
                                     'and old.history_at = new.history_at ' +
                                     'and old.history_actor_id = new.history_actor_id ' +
                                     'and old.id = new.id ' +
                                     'where old.id is null or new.id is null';

    var aResult = oHQ.statement(sStatementCommentHistory).execute();
    if(aResult.length > 0){
        info('"SAP_INO"."sap.ino.db.idea::t_comment_h" and "SAP_INO"."sap.ino.db.comment::t_comment_h" do not match; step 02_move_comments must run before.');
        return true;
    }

    //all clear!
    return true;
}

function run(oConnection) {
    const oHQ = HQ.hQuery(oConnection);

    var sStatement = 'select top 1 id from (select id from "SAP_INO"."sap.ino.db.idea::t_comment" union select id from "SAP_INO"."sap.ino.db.idea::t_comment_h")';
    var aResult = oHQ.statement(sStatement).execute();
    if (aResult.length < 1) {
        info('There is no data in the tables to delete, no need to do anything.');
        // no table entry, no need to delete anything
        return true;
    }

    const sStatementComment = 'select coalesce(old.id, new.id) as id '+
                              'from "SAP_INO"."sap.ino.db.idea::t_comment" as old ' +
                              'full outer join "SAP_INO"."sap.ino.db.comment::t_comment" as new ' +
                              'on old.id = new.id ' +
                              'where old.id is null or new.id is null';

    aResult = oHQ.statement(sStatementComment).execute();
    if(aResult.length > 0){
        error('"SAP_INO"."sap.ino.db.idea::t_comment" and "SAP_INO"."sap.ino.db.comment::t_comment" do not match; step 02_move_comments must run before.');
        return false;
    }

    const sStatementCommentHistory = 'select coalesce(old.id, new.id) as id '+
               'from "SAP_INO"."sap.ino.db.idea::t_comment_h" as old ' +
               'full outer join "SAP_INO"."sap.ino.db.comment::t_comment_h" as new ' +
               'on  old.history_db_event = new.history_db_event ' +
               'and old.history_biz_event = new.history_biz_event ' +
               'and old.history_at = new.history_at ' +
               'and old.history_actor_id = new.history_actor_id ' +
               'and old.id = new.id ' +
               'where old.id is null or new.id is null';

    var aResult = oHQ.statement(sStatementCommentHistory).execute();
    if(aResult.length > 0){
        error('"SAP_INO"."sap.ino.db.idea::t_comment_h" and "SAP_INO"."sap.ino.db.comment::t_comment_h" do not match; step 02_move_comments must run before.');
        return false;
    }

    var sCleanComment = 'delete from "SAP_INO"."sap.ino.db.idea::t_comment"';
    var sCleanCommentHistory = 'delete from "SAP_INO"."sap.ino.db.idea::t_comment_h"';

    oHQ.statement(sCleanComment).execute();
    info('Table content of "SAP_INO"."sap.ino.db.idea::t_comment" successfully deleted.');
    oHQ.statement(sCleanCommentHistory).execute();
    info('Table content of "SAP_INO"."sap.ino.db.idea::t_comment_h" successfully deleted.');

    return true;
}

function clean(oConnection) {
    //nothing to do
    return true;
}