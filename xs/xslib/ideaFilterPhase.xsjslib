//provide some functions to idea_filter_phase.xsjs service
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const ohQuery = $.import("sap.ino.xs.xslib", "hQuery");
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var oHQ = ohQuery.hQuery(oConn).setSchema("SAP_INO");

function getPhases(iCampaignId) {
	var vResult = {};
	var oResponse = {
		status: $.net.http.OK,
		body: vResult
	};

	var sSelect =
		'select distinct phase as code, default_text, default_long_text from \
            "sap.ino.db.idea::v_idea_phase_for_filter"';

	if (iCampaignId) {
		sSelect = sSelect + " where campaign_id = ?";
		vResult.Phases = oHQ.statement(sSelect).execute(iCampaignId);
	} else {
		vResult.Phases = oHQ.statement(sSelect).execute();
	}

	return oResponse;
}