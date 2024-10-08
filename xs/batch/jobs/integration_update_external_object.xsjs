const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const message = $.import("sap.ino.xs.aof.lib", "message");
const systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
const ideaObjectIntegration = $.import("sap.ino.xs.object.integration", "IdeaObjectIntegration");
var AOF = $.import("sap.ino.xs.aof.core", "framework");

function execute() {
	const oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
	try {
		const oHQ = hQuery.hQuery(oConn);
		const bUnderMaintenance = systemSettings.isUnderMaintenance();
		if (bUnderMaintenance) {
			//do not run batch jobs if setup is incomplete
			message.createMessage(
				message.MessageSeverity.Error,
				"MSG_BATCH_SYSTEM_SETUP_RUNNING",
				undefined, undefined, undefined, undefined);
			return;
		}
		const sSelect =
			`select distinct 
			 current_utctimestamp as query_time, INTEGRATION_OBJECT_UUID,api_technical_name,idea_id,campaign_id 
                from "sap.ino.db.webhook::t_external_object_need_update" where need_update = 1 and created_at <= current_utctimestamp `;
		var aIntegrationObjects = oHQ.statement(sSelect).execute();

		if (aIntegrationObjects && aIntegrationObjects.length > 0) {
			for (var i = 0; i < aIntegrationObjects.length; i++) {
				var oRefreshReq = {
					IDEA_ID: aIntegrationObjects[i].IDEA_ID,
					CAMPAIGN_ID: aIntegrationObjects[i].CAMPAIGN_ID,
					API_TECH_NAME: aIntegrationObjects[i].API_TECHNICAL_NAME,
					INTEGRATION_OBJECT_UUID: aIntegrationObjects[i].INTEGRATION_OBJECT_UUID
				};
				var ideaObjectIntegrationAOF = AOF.getApplicationObject("sap.ino.xs.object.integration.IdeaObjectIntegration");
				var oResponse = ideaObjectIntegrationAOF.queryObject(oRefreshReq);
			}
			const sUpdateSQL =
				` update "sap.ino.db.webhook::t_external_object_need_update" 
                             set need_update = 0 where need_update = 1 and created_at <= ?`;
			oHQ.statement(sUpdateSQL).execute(aIntegrationObjects[0].QUERY_TIME);
			//Delete more than 3 months's data
			const sDeleteSql =
				`delete from "sap.ino.db.webhook::t_external_object_need_update" where need_update = 0 and days_between(created_at,?) >= 90`;
			oHQ.statement(sDeleteSql).execute(aIntegrationObjects[0].QUERY_TIME);
		}
		oConn.commit();
	} catch (e) {
		message.createMessage(
			message.MessageSeverity.Error,
			"MSG_BATCH_MAIL_FAILED_UNEXPECTEDLY",
			undefined, undefined, undefined, e.toString());
		oConn.rollback();
		throw e;
	} finally {
		oConn.close();
	}
}