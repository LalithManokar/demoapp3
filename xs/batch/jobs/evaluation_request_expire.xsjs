var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.core", "authorization");
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var message = $.import("sap.ino.xs.aof.lib", "message");
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();

function execute() {
	try {
	    var oHQ = hQuery.hQuery(oConn);
		var aAdmin = oHQ.statement(
			'select top 1 user_name from "sap.ino.db.iam::t_identity" where id = created_by_id order by erased asc, created_at asc').execute();
		var oAdmin = aAdmin && aAdmin.length !== 0 ? aAdmin[0] : undefined;
		if (!oAdmin) {
			throw new Error("fail to execute.");
		}
		auth.setApplicationUser(oAdmin.USER_NAME);
		var EvalReqItem = AOF.getApplicationObject("sap.ino.xs.object.evaluation.EvaluationRequestItem");
		var oResponse = EvalReqItem.bulkJobExpireItems();
		if(oResponse.messages && oResponse.messages.length > 0){
            return;
		}
		
		oConn.commit();
	} catch (e) {
        message.createMessage(
            message.MessageSeverity.Error,
            "MSG_BATCH_MAIL_FAILED_UNEXPECTEDLY",
            undefined, undefined, undefined, e.toString());
        oConn.rollback();
        throw e;
    }
}