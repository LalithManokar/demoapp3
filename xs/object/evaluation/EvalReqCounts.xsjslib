/**
 * update is hooked as onPersist determination to Comment and Evaluation in order to update the materialized counts in
 * t_evalua_request
 */
(function(exports) {

    function update(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext, oNodeMetadata) {
        var sObjectName = oNodeMetadata.objectMetadata.getObjectMetadata().name;
        if (sObjectName === "sap.ino.xs.object.evaluation.EvalReqComment" && oWorkObject.OBJECT_ID) {
            updateCommentCount(oWorkObject.OBJECT_ID, oContext.getHQ());
        }
    }

    function updateCommentCount(iEvalReqId, oHQ) {
        oHQ.statement('\
                update "sap.ino.db.evaluation::t_evaluation_request" as eval_req \
                set comment_count = (select count(id) from "sap.ino.db.evaluation::v_evaluation_request_comment" where object_id = eval_req.id) \
                where eval_req.id = ?').execute(iEvalReqId);
    }

    exports.update = update;

})(this);