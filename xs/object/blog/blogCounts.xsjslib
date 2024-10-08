/**
 * update is hooked as onPersist determination to Comment and Evaluation in order to update the materialized counts in
 * t_blog
 */
(function(exports) {

    function update(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext, oNodeMetadata) {
        var sObjectName = oNodeMetadata.objectMetadata.getObjectMetadata().name;
        if (sObjectName === "sap.ino.xs.object.blog.Comment" && oWorkObject.OBJECT_ID) {
            updateCommentCount(oWorkObject.OBJECT_ID, oContext.getHQ());
        }
    }

    function updateCommentCount(iBlogId, oHQ) {
        oHQ.statement('\
                update "sap.ino.db.blog::t_blog" as blog \
                set comment_count = (select count(id) from "sap.ino.db.blog::v_blog_comment" where object_id = blog.id) \
                where blog.id = ?').execute(iBlogId);
    }

    exports.update = update;

})(this);