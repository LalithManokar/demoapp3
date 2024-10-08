const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const ohQuery = $.import("sap.ino.xs.xslib", "hQuery");
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var oHQ = ohQuery.hQuery(oConn).setSchema("SAP_INO");

function getPersonalizeSettings(iUserId) {
    var sSql = 'select * from "sap.ino.db.iam::cv_personalize_setting" where identity_id = ?';
    var aResult = oHQ.statement(sSql).execute(iUserId);
	return _.object(_.pluck(aResult, 'OBJECT_TYPE_CODE'), _.map(_.pluck(aResult, 'SETTING_VALUE'), function(num) {
		return !!num;
	}));
}