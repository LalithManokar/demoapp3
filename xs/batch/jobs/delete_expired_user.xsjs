const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const message = $.import("sap.ino.xs.aof.lib", "message");
const systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

function execute(input) {
	const oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
	const oHQ = hQuery.hQuery(oConn);
	var hasError = false,
		oError;

	const bUnderMaintenance = systemSettings.isUnderMaintenance();
	if (bUnderMaintenance) {
		//do not run batch jobs if setup is incomplete
		message.createMessage(
			message.MessageSeverity.Error,
			"MSG_BATCH_SYSTEM_SETUP_RUNNING",
			undefined, undefined, undefined, undefined);
		return;
	}
	try {
		const procedure = oHQ.procedure("SAP_INO", "sap.ino.db.iam::p_delete_user");
		procedure.execute({});
		oConn.commit();
		if (input.EnableDeleteHanaDbUser !== 1) {
			return;
		}
		const sUserSql =
			`
        SELECT DISTINCT H.USER_NAME
FROM "sap.ino.db.iam::t_identity" AS IDEN
	INNER JOIN "sap.ino.db.iam::t_identity_h" AS H
	ON IDEN.ID = H.ID
	INNER JOIN sys.users AS U
	ON H.USER_NAME = U.USER_NAME
WHERE IDEN.ERASED = 1
	AND H.USER_NAME IS NOT NULL
	AND H.USER_NAME <> 'ERASED'
	AND H.USER_NAME <> 'erased'
	AND H.USER_NAME <> 'IAM_XSUNIT'
	AND H.USER_NAME <> 'IAM_XSUNIT2'
	AND NOT (EXISTS (SELECT 1
			FROM "sap.ino.db.iam::t_identity" AS IDEN_N
			WHERE U.USER_NAME = IDEN_N.USER_NAME
				AND IDEN_N.ERASED <> 1));
        `;
		var aUsers = oHQ.statement(sUserSql).execute();
		if (aUsers && aUsers.length > 0) {
			_.each(aUsers, function(oUser) {
				if (!!oUser.USER_NAME) {
					try {
						oHQ.statement("drop user " + oUser.USER_NAME).execute();
					} catch (ex) {
						hasError = true;
						oError = ex;
					}
				}
			});
		}
	} catch (e) {
		message.createMessage(
			message.MessageSeverity.Error,
			"MSG_BATCH_MAIL_FAILED_UNEXPECTEDLY",
			undefined, undefined, undefined, e.toString());
		oConn.rollback();
		oConn.close();
		throw e;
	}
	if (hasError) {
		message.createMessage(
			message.MessageSeverity.Error,
			"MSG_BATCH_MAIL_FAILED_UNEXPECTEDLY",
			undefined, undefined, undefined, oError.toString());
		throw oError;
	}
}