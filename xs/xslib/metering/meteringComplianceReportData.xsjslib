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

var ComplianceClient = (function() {
	var _SQL_ =
		"SELECT CAST(HASH_SHA256( \
    		to_binary(concat( \
    				T.id,  \
    				T.user_name \
    			)),  \
    		to_binary(T.id) \
    	) AS VARCHAR(64)) AS user, \
    	L.ACCESSED_AT AS instant \
    FROM ( \
    		SELECT ROW_NUMBER() OVER(PARTITION BY IDENTITY_ID ORDER BY ACCESSED_AT ASC) AS r, \
    			* \
    		FROM \"sap.ino.db.tracker::t_identity_views\" \
    		WHERE ACCESSED_AT < ADD_SECONDS( \
    					CURRENT_UTCDATE,  \
    					0 \
    				) \
    			AND ACCESSED_AT >= ADD_SECONDS( \
    					ADD_DAYS( \
    						CURRENT_UTCDATE, \
    						-1 \
    					), \
    					0 \
    				) \
    	) AS L \
    	INNER JOIN \"sap.ino.db.iam::t_identity\" AS T \
    	ON T.ID = L.IDENTITY_ID \
    WHERE L.r = 1;";

	return {
		getReportData: function() {
			var oDatas = [],
				oResults = hQuery.hQuery(oConn).statement(_SQL_).execute();
			if (!oResults || oResults.length === 0) {
				return null;
			}
			_.each(oResults,function(data){
			    oDatas.push({
					"metricKey": "sapinm.uniqueUsers",
					"value": 1,
					"instant": data.INSTANT,
					"clientUser": data.USER.toString().toLowerCase()
				});
			});
			return oDatas;
		}
	};
})();