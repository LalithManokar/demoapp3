//provide some functions to idea_filter_resp_values.xsjs service
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const ohQuery = $.import("sap.ino.xs.xslib", "hQuery");
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var oHQ = ohQuery.hQuery(oConn).setSchema("SAP_INO");

function getRespValues() {
	var vResult = {};
	var oResponse = {
		status: $.net.http.OK,
		body: vResult
	};

	var sSelect =
		'select distinct resp_code as code, default_text, default_long_text from \
            "sap.ino.db.campaign::v_campaign_resp_value_for_filter"';
		vResult.RespValues = oHQ.statement(sSelect).execute();
	return oResponse;
}