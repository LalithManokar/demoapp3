const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var oHQ = $.import("sap.ino.xs.xslib", "hQuery").hQuery(oConn).setSchema('_SYS_XS');

function check(sPackage, sAuthorizationMethod) {
	var oPackageConfiguration;
	var oSAMLConfig;
	var oLoginConfigStatement = oHQ.statement("select configuration from \"_SYS_XS\".\"RUNTIME_CONFIGURATION\" where package_id = ?");
	var fnCheck = function(item) {
		return item.method === sAuthorizationMethod;
	};

	while (sPackage !== "") {
		var oResult = oLoginConfigStatement.execute(sPackage);

		if (oResult.length > 0) {
			var sPackageConfiguration = oResult[0].CONFIGURATION;
			if (sPackageConfiguration && sPackageConfiguration !== "") {
				oPackageConfiguration = JSON.parse(sPackageConfiguration);
				oSAMLConfig = _.find(oPackageConfiguration.authentication, fnCheck);
				break;
			}
		}
		sPackage = sPackage.substr(0, sPackage.lastIndexOf('.'));
	}

	return oSAMLConfig !== undefined;
}