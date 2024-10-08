const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_1.2.0.05_init_idea_counts.xsjslib';

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
    const sStatement = '\
        update "sap.ino.db.idea::t_idea" as idea set\
            comment_count = (select count(id) from "sap.ino.db.idea::v_idea_comment" where object_id = idea.id),\
            evaluation_count = (select count(id) from "sap.ino.db.evaluation::v_evaluation" as eval where idea_id = idea.id and eval.status_code != \'sap.ino.config.EVAL_DRAFT\'),\
            evaluation_in_phase_count = (   select count(id) from "sap.ino.db.evaluation::v_evaluation" as eval \
                                                    where   eval.idea_id = idea.id and \
                                                            eval.status_code != \'sap.ino.config.EVAL_DRAFT\' and \
                                                            eval.idea_phase_code = idea.phase_code   )\
        ';
    oHQ.statement(sStatement).execute();
    return true;
}

function clean(oConnection) {
    return true;
}