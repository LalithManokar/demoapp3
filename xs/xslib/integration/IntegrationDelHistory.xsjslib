const commonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");

function delHistory(oHQ) {
	var bEnableDeleteIntegration = commonUtil.getSystemSetting(oHQ, "sap.ino.config.ENABLE_DELETE_INTEGRATION_HISTORY");
	var nDelDaysIntegration = commonUtil.getSystemSetting(oHQ, "sap.ino.config.DELETE_INTEGRATION_WITHIN_DAYS");
	if (bEnableDeleteIntegration && Number(bEnableDeleteIntegration) > 0 && nDelDaysIntegration && Number(nDelDaysIntegration) > 0) {
		var sDelIntegrationStatus =
			`
DELETE FROM "sap.ino.db.integration::t_monitor_integration" 
WHERE (ID IN (SELECT ID
		FROM "sap.ino.db.integration::t_monitor_integration"
		WHERE OPERATOR_AT < ADD_DAYS(CURRENT_UTCTIMESTAMP,?)))`;
		oHQ.statement(sDelIntegrationStatus).execute([0 - Number(nDelDaysIntegration)]);
	}
}