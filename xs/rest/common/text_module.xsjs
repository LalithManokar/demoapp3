const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const oHQ = $.import("sap.ino.xs.xslib", "hQuery").hQuery(conn);
const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const tracker = $.import("sap.ino.xs.xslib", "tracker");
var authSetUser = $.import("sap.ino.xs.aof.core", "authorization");

var AOF = $.import("sap.ino.xs.aof.core", "framework");

var ContentType = {
	Plain: "text/plain",
	JSON: "application/json"
};

var _handleRequest = function(req, res) {
	var iCampaignId, sPhaseCode, sStatusActionCode, sStatusModelCode, iStatusCodeId, iCampaignPhaseId, sTextModule, sStatusCode,
		sNextStatusCode;
	iCampaignId = req.parameters.get("CAMPAIGN_ID");
	sPhaseCode = req.parameters.get("PHASE");
	sStatusActionCode = req.parameters.get("STATUS_ACTION_CODE");
	sStatusCode = req.parameters.get("STATUS_CODE");
	sNextStatusCode = req.parameters.get("NEXT_STATUS_CODE");

	iCampaignPhaseId = oHQ.statement(
		'SELECT ID FROM "sap.ino.db.campaign::t_campaign_phase" WHERE CAMPAIGN_ID = ?' +
		'AND PHASE_CODE = ?').execute(iCampaignId, sPhaseCode);

	sStatusModelCode = oHQ.statement(
		'SELECT STATUS_MODEL_CODE FROM "sap.ino.db.campaign::t_campaign_phase" WHERE CAMPAIGN_ID = ?' +
		'AND PHASE_CODE = ?').execute(iCampaignId, sPhaseCode);

	if (iCampaignPhaseId.length > 0 && sStatusModelCode.length > 0) {
		if (sStatusActionCode === 'sap.ino.config.START_NEXT_PHASE' || sStatusActionCode === 'sap.ino.config.RESTART_PREV_PHASE') {
			iStatusCodeId = oHQ.statement(
				'SELECT CODE FROM "sap.ino.db.status::t_status_model_transition" ' +
				' WHERE STATUS_MODEL_CODE = ? AND STATUS_ACTION_CODE = ? ' +
				' AND CURRENT_STATUS_CODE = ? ')
				.execute(sStatusModelCode[0].STATUS_MODEL_CODE, sStatusActionCode, sStatusCode);
		} else {
			iStatusCodeId = oHQ.statement(
				'SELECT CODE FROM "sap.ino.db.status::t_status_model_transition" ' +
				' WHERE STATUS_MODEL_CODE = ? AND STATUS_ACTION_CODE = ? ' +
				' AND CURRENT_STATUS_CODE = ? AND NEXT_STATUS_CODE = ? ')
				.execute(sStatusModelCode[0].STATUS_MODEL_CODE, sStatusActionCode, sStatusCode, sNextStatusCode);
		}

		if (iStatusCodeId.length > 0) {
			sTextModule = oHQ.statement(
				'SELECT TEXT_MODULE_CODE FROM "sap.ino.db.newnotification::t_notification_campaign_status_setting" ' +
				'WHERE CAMPAIGN_PHASE_ID = ? AND STATUS_ACTION_CODE = ?').execute(iCampaignPhaseId[0].ID, iStatusCodeId[0].CODE);

			if (sTextModule.length > 0) {
				res.status = $.net.http.OK;
				res.contentType = ContentType.JSON;
				res.setBody(JSON.stringify(sTextModule));
			} else {
				res.status = $.net.http.OK;
				res.contentType = ContentType.JSON;
				res.setBody("");
			}
		}
	}
};

TraceWrapper.wrap_request_handler(function() {
	return _handleRequest($.request, $.response);
});