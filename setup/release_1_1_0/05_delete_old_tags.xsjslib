const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_1.1.0.05_delete_old_tags.xsjslib';

function error(line) {
    trace.error(whoAmI, line);
}
function info(line) {
    trace.info(whoAmI, line);
}

function check(oConnection) {
    const oHQ = HQ.hQuery(oConnection);

    var sStatement = 'select top 1 id from (select id from "SAP_INO"."sap.ino.db.idea::t_tag" union select id from "SAP_INO"."sap.ino.db.idea::t_idea_tag")';
    var aResult = oHQ.statement(sStatement).execute();
    if (aResult.length < 1) {
        info('There is no data in the tables to delete, no need to do anything.');
        // no table entry, no need to delete anything
        return true;
    }

    const sStatementTag = 'select coalesce(old.id, new.id) as id '+
                          'from "SAP_INO"."sap.ino.db.idea::t_tag" as old ' +
                          'full outer join "SAP_INO"."sap.ino.db.tag::t_tag" as new ' +
                          'on old.id = new.id ' +
                          'where old.id is null or new.id is null';

    aResult = oHQ.statement(sStatementTag).execute();
    if(aResult.length > 0){
        info('"SAP_INO"."sap.ino.db.idea::t_tag" and "SAP_INO"."sap.ino.db.tag::t_tag" do not match; Step 01_move_tags must be executed before;');
    }

    const sStatementTagUsage = 'select coalesce(old.id, new.id) as id '+
                               'from "SAP_INO"."sap.ino.db.idea::t_idea_tag" as old ' +
                               'full outer join "SAP_INO"."sap.ino.db.tag::t_object_tag" as new ' +
                               'on old.id = new.id ' +
                               'where old.id is null or new.id is null';

    aResult = oHQ.statement(sStatementTagUsage).execute();
    if(aResult.length > 0){
        info('"SAP_INO"."sap.ino.db.idea::t_idea_tag" and "SAP_INO"."sap.ino.db.tag::t_object_tag" do not match; Step 01_move_tags must be executed before;');
    }

    //all clear!
    return true;
}

function run(oConnection) {
    const oHQ = HQ.hQuery(oConnection);

    var sStatement = 'select top 1 id from (select id from "SAP_INO"."sap.ino.db.idea::t_tag" union select id from "SAP_INO"."sap.ino.db.idea::t_idea_tag")';
    var aResult = oHQ.statement(sStatement).execute();
    if (aResult.length < 1) {
        info('There is no data in the tables to delete, no need to do anything.');
        // no table entry, no need to delete anything
        return true;
    }

    const sStatementTag = 'select coalesce(old.id, new.id) as id '+
                          'from "SAP_INO"."sap.ino.db.idea::t_tag" as old ' +
                          'full outer join "SAP_INO"."sap.ino.db.tag::t_tag" as new ' +
                          'on old.id = new.id ' +
                          'where old.id is null or new.id is null';

    aResult = oHQ.statement(sStatementTag).execute();
    if(aResult.length > 0){
        error('"SAP_INO"."sap.ino.db.idea::t_tag" and "SAP_INO"."sap.ino.db.tag::t_tag" do not match; Step 01_move_tags must be executed before;');
        return false;
    }

    const sStatementTagUsage = 'select coalesce(old.id, new.id) as id '+
                               'from "SAP_INO"."sap.ino.db.idea::t_idea_tag" as old ' +
                               'full outer join "SAP_INO"."sap.ino.db.tag::t_object_tag" as new ' +
                               'on old.id = new.id ' +
                               'where old.id is null or new.id is null';

    aResult = oHQ.statement(sStatementTagUsage).execute();
    if(aResult.length > 0){
        error('"SAP_INO"."sap.ino.db.idea::t_idea_tag" and "SAP_INO"."sap.ino.db.tag::t_object_tag" do not match; Step 01_move_tags must be executed before;');
        return false;
    }

    var sCleanTag = 'delete from "SAP_INO"."sap.ino.db.idea::t_tag"';
    var sCleanTagUsage = 'delete from "SAP_INO"."sap.ino.db.idea::t_idea_tag"';

    oHQ.statement(sCleanTag).execute();
    info('Table content of "SAP_INO"."sap.ino.db.idea::t_tag" successfully deleted.');
    oHQ.statement(sCleanTagUsage).execute();
    info('Table content of "SAP_INO"."sap.ino.db.idea::t_idea_tag" successfully deleted.');

    return true;
}

function clean(oConnection) {
    //nothing to do
    return true;
}