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

var UsageClient = (function() {
	var _SQL_ =
		"SELECT \
    COUNT(1) AS count \
FROM \"sap.ino.db.iam::t_identity\" \
UNION ALL \
SELECT \
    COUNT(DISTINCT IDEN.IDENTITY_ID) AS  count \
FROM  \"sap.ino.db.tracker::t_identity_views\" AS iden \
WHERE \
	iden.ACCESSED_AT >= ADD_SECONDS(ADD_DAYS(CURRENT_UTCDATE, -1),0) \
    AND iden.ACCESSED_AT < ADD_SECONDS(CURRENT_UTCDATE, 0) \
UNION ALL \
SELECT COUNT(DISTINCT role_transitive.identity_id) AS count \
FROM \"sap.ino.db.iam::v_object_identity_role_transitive\" AS role_transitive \
INNER JOIN \"sap.ino.db.iam::t_role_privilege\" AS role_priv \
	ON role_priv.role_code = role_transitive.role_code \
INNER JOIN \"sap.ino.db.tracker::t_identity_views\" AS iden \
    ON iden.identity_id = role_transitive.identity_id \
WHERE \
	(role_transitive.object_type_code = 'CAMPAIGN' OR role_transitive.object_type_code = 'RESPONSIBILITY' )  \
	AND role_priv.privilege = 'CAMP_IDEA_BACKOFFICE' \
	AND iden.ACCESSED_AT >= ADD_SECONDS(ADD_DAYS(CURRENT_UTCDATE, -1),0) \
	AND iden.ACCESSED_AT < ADD_SECONDS(CURRENT_UTCDATE, 0)";

	return {
		getReportData: function() {
			var oCounts = hQuery.hQuery(oConn).statement(_SQL_).execute();

			return [{
				"metricKey": "sapinm.UserCount",
				"value": oCounts[0].COUNT.toString()
	        }, {
				"metricKey": "sapinm.CommunityUserCount",
				"value": oCounts[1].COUNT.toString() - oCounts[2].COUNT.toString()
	        }, {
				"metricKey": "sapinm.BackofficeUserCount",
				"value": oCounts[2].COUNT.toString()
	        }];
		}
	};
})();