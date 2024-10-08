const message = $.import("sap.ino.xs.aof.lib", "message");
const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");

function execute() {
    const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
    const hq = hQuery.hQuery(conn);
    try {

        const bUnderMaintenance = systemSettings.isUnderMaintenance();
        if (bUnderMaintenance) {
            // do not run batch jobs if setup is incomplete
            message.createMessage(message.MessageSeverity.Error, "MSG_BATCH_SYSTEM_SETUP_RUNNING", undefined, undefined, undefined, undefined);
            return;
        }

        hq.setSchema('SAP_INO');

        var sSQL = "delete from \"sap.ino.db.iam::t_object_identity_role\" where OBJECT_ID in (select ID from \"sap.ino.db.attachment::v_attachment_orphans\") and OBJECT_TYPE_CODE = 'ATTACHMENT' and ROLE_CODE = 'ATTACHMENT_OWNER'";
        hq.statement(sSQL).execute();
        
        sSQL = "delete from \"sap.ino.db.attachment::t_attachment_data\" where ID in (select ID from \"sap.ino.db.attachment::v_attachment_orphans\")";
        hq.statement(sSQL).execute();
        
        sSQL = "delete from \"sap.ino.db.attachment::t_attachment\" where ID in (select ID from \"sap.ino.db.attachment::v_attachment_orphans\")";
        hq.statement(sSQL).execute();
        
        // clean up deleted ideas' terms in TA indices
        const Indices = ["$TA_sap.ino.db.idea::i_idea_description", "$TA_sap.ino.db.idea::i_idea_name"];
        const SQL = [
            'delete from "SAP_INO"."{TA_INDEX}"',
            'where ID not in (',
            'select ID from "sap.ino.db.idea::t_idea"',
            ')'].join(" ");
        
        for (var i = 0; i < Indices.length; i += 1) {
            sSQL = SQL.replace("{TA_INDEX}", Indices[i]);
            hq.statement(sSQL).execute();
        }
        // clean up deleted blogs' terms in TA indices
        const Indices_blog = ["$TA_sap.ino.db.blog::i_blog_description", "$TA_sap.ino.db.blog::i_blog_title"];
        const SQL_blog = [
            'delete from "SAP_INO"."{TA_INDEX}"',
            'where ID not in (',
            'select ID from "sap.ino.db.blog::t_blog"',
            ')'].join(" ");
        
        for (var j = 0; j < Indices_blog.length; j += 1) {
            sSQL = SQL_blog.replace("{TA_INDEX}", Indices_blog[j]);
            hq.statement(sSQL).execute();
        }
        conn.commit();
    } catch (e) {
        message.createMessage(message.MessageSeverity.Error, "MSG_BATCH_DELETE_ORPHANS_FAILED_UNEXPECTEDLY", undefined, undefined, undefined, e.toString());
        conn.rollback();
        throw e;
    }
}