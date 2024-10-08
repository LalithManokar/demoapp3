const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_1.1.0.01_move_tags.xsjslib';

function error(line) {
    trace.error(whoAmI, line);
}
function info(line) {
    trace.info(whoAmI, line);
}

function check(oConnection) {
    const oHQ = HQ.hQuery(oConnection);
    var sStatement = 'select top 1 id from "SAP_INO"."sap.ino.db.idea::t_tag"';
    var aResult = oHQ.statement(sStatement).execute();
    if (aResult.length < 1) {
        // no table entry, no need to move anything
        return true;
    }

    sStatement = 'select top 1 id from "SAP_INO"."sap.ino.db.tag::t_tag"';
    aResult = oHQ.statement(sStatement).execute();
    if (aResult.length > 0) {
        error('sap.ino.db.tag::t_tag already contains data');
        return false;
    }

    sStatement = 'select top 1 id from "SAP_INO"."sap.ino.db.tag::t_object_tag"';
    aResult = oHQ.statement(sStatement).execute();
    if (aResult.length > 0) {
        error('sap.ino.db.tag::t_object_tag already contains data');
        return false;
    }
    
    //all clear -> true
    return true;
}

function run(oConnection) {
    const oHQ = HQ.hQuery(oConnection);
    
    var sStatement = 'select top 1 id from "SAP_INO"."sap.ino.db.idea::t_tag"';
    var aResult = oHQ.statement(sStatement).execute();
    if (aResult.length < 1) {
        return true;
    };
        
    const sMoveTag      = 'insert into "SAP_INO"."sap.ino.db.tag::t_tag" ' +
                          '(ID, NAME, CREATED_AT, CREATED_BY_ID, CHANGED_AT, CHANGED_BY_ID) ' +
                          'select ID, NAME, current_timestamp, null, current_timestamp, null ' +
                          'from "SAP_INO"."sap.ino.db.idea::t_tag"';
    const sMoveTagUsage = 'insert into "SAP_INO"."sap.ino.db.tag::t_object_tag" ' +
                          '(ID, OBJECT_TYPE_CODE, OBJECT_ID, TAG_ID) ' +
                          'select ID as ID, \'IDEA\' as OBJECT_TYPE_CODE, IDEA_ID as OBJECT_ID, TAG_ID as TAG_ID ' +
                          'from "SAP_INO"."sap.ino.db.idea::t_idea_tag"';

    oHQ.statement(sMoveTag).execute();
    info('Tags successfully moved.')
    oHQ.statement(sMoveTagUsage).execute();
    info('Tag Usages successfully moved.')
        
    return true;
}

function clean(oConnection) {
    const oHQ = HQ.hQuery(oConnection);
    
    var sCleanTag = 'delete from "SAP_INO"."sap.ino.db.tag::t_tag"';
    var sCleanTagUsage = 'delete from "SAP_INO"."sap.ino.db.tag::t_object_tag"';
    
    oHQ.statement(sCleanTag).execute();
    oHQ.statement(sCleanTagUsage).execute();
    return true;
}