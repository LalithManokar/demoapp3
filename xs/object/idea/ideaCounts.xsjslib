/**
 * update is hooked as onPersist determination to Comment and Evaluation in order to update the materialized counts in
 * t_idea
 */
(function(exports) {

    function update(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext, oNodeMetadata) {
        var sObjectName = oNodeMetadata.objectMetadata.getObjectMetadata().name;
        if ((sObjectName === "sap.ino.xs.object.idea.Comment" || sObjectName === "sap.ino.xs.object.comment.CommentForIdeaMerge") && oWorkObject.OBJECT_ID) {
            updateCommentCount(oWorkObject.OBJECT_ID, oContext.getHQ());
        }
        if (sObjectName === "sap.ino.xs.object.evaluation.Evaluation" && oWorkObject.IDEA_ID) {
            updateEvaluationCounts(oWorkObject.IDEA_ID, oContext.getHQ());
        }

        if (sObjectName === "sap.ino.xs.object.idea.Idea" && oWorkObject.ID && (oWorkObject.PHASE_CODE != oPersistedObject.PHASE_CODE)) {
            updateEvaluationCounts(oWorkObject.ID, oContext.getHQ());
        }
    }

    function updateCommentCount(iIdeaId, oHQ) {
        oHQ.statement('\
                update "sap.ino.db.idea::t_idea" as idea \
                set comment_count = (select count(id) from "sap.ino.db.idea::v_idea_comment" where object_id = idea.id and parent_id is null ) \
                where idea.id = ?').execute(iIdeaId);
    }

    function updateEvaluationCounts(iIdeaId, oHQ) {
        oHQ.statement('\
                update "sap.ino.db.idea::t_idea" as idea \
                set \
                    evaluation_count = (select count(id) from "sap.ino.db.evaluation::v_evaluation" \
                                          where idea_id = idea.id and status_code != \'sap.ino.config.EVAL_DRAFT\'), \
                    evaluation_in_phase_count = (   select count(id) from "sap.ino.db.evaluation::v_evaluation" as eval \
                                                    where   eval.idea_id = idea.id and \
                                                            eval.status_code != \'sap.ino.config.EVAL_DRAFT\' and \
                                                            eval.idea_phase_code = idea.phase_code   )\
                where idea.id = ?').execute(iIdeaId);
    }

    exports.update = update;

})(this);