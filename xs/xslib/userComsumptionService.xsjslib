const trace = $.import("sap.ino.xs.xslib", "trace");
const whoAmI = 'sap.ino.xs.xslib.meteringService.xsjslib';
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();

function warning(line) {
	trace.warning(whoAmI, line);
}

function debug(line) {
	trace.debug(whoAmI, line);
}

var UserConsumptionClient = (function() {
	var _SQL_ = "DELETE FROM \"sap.ino.db.tracker::t_identity_consumption\" WHERE EXECUTTION_AT < ADD_YEARS(CURRENT_UTCDATE,-3);";
	return {
		generateReportData: function() {
			hQuery.hQuery(oConn)
				.procedure("SAP_INO", "sap.ino.db.tracker::p_identity_consumption")
				.execute();
			oConn.commit();
		},
		cleanReportData: function() {
			hQuery.hQuery(oConn).statement(_SQL_).execute();
			oConn.commit();
		}
	};
})();