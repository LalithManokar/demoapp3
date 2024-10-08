const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");
var AOF = $.import("sap.ino.xs.aof.core", "framework");
const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_2_4_9.update_existed_idea_form_active.xsjslib';

function error(line) {
    trace.error(whoAmI, line);
}
function info(line) {
    trace.info(whoAmI, line);
}

function check(oConnection) {
    return true;
}

function run(oConnection) {
    const oHQ = HQ.hQuery(oConnection);
    var sUpdateIdeaFormActive = 'update "sap.ino.db.ideaform::t_field" set is_active = 1';
     oHQ.statement(sUpdateIdeaFormActive).execute();
     var sUpdateIdeaFormActiveStage = 'update "sap.ino.db.ideaform::t_field_stage" set is_active = 1';
     oHQ.statement(sUpdateIdeaFormActiveStage).execute();     
    return true;	 
}

function clean(oConnection) {
    return true;
}