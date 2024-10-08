//
const message = $.import("sap.ino.xs.aof.lib", "message");
const systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
var MeteringClient = $.import("sap.ino.xs.xslib.metering", "meteringService").MeteringClient;
var UsageClient = $.import("sap.ino.xs.xslib.metering", "meteringUsageReportData").UsageClient;
var ComplianceClient = $.import("sap.ino.xs.xslib.metering", "meteringComplianceReportData").ComplianceClient;
var UserConsumptionClient = $.import("sap.ino.xs.xslib", "userComsumptionService").UserConsumptionClient;

function execute() {
	const bUnderMaintenance = systemSettings.isUnderMaintenance();
	//undefined--disable,0--disable,1--premise report,2--cloud report,4--premise and cloud report
	const consumptionReportType = systemSettings.getIniValue("consumptionreporttype") * 1;
	if (bUnderMaintenance) {
		var msg = message.createMessage(message.MessageSeverity.Error,
			"MSG_BATCH_SYSTEM_SETUP_RUNNING", undefined, undefined, undefined, undefined);
		throw msg.messageText;
	}
	try {
		switch (consumptionReportType) {
			case 1:
				UserConsumptionClient.generateReportData();
				UserConsumptionClient.cleanReportData();
				break;
			case 2:
				MeteringClient.postMeteringData(undefined, undefined, UsageClient.getReportData());
				MeteringClient.postMeteringData(undefined, undefined, ComplianceClient.getReportData(), "/meteringservice/usagedata");
				break;
			case 4:
				UserConsumptionClient.generateReportData();
				UserConsumptionClient.cleanReportData();
				
				MeteringClient.postMeteringData(undefined, undefined, UsageClient.getReportData());
				MeteringClient.postMeteringData(undefined, undefined, ComplianceClient.getReportData(), "/meteringservice/usagedata");
				break;
			default:
				break;
		}
	} catch (ex) {
		throw message.createMessage(
			message.MessageSeverity.Error,
			"MSG_BATCH_METERING_SERVICE_FAILED_UNEXPECTEDLY",
			undefined, undefined, undefined, (ex.message || ex.toString())).messageText;
	}
}