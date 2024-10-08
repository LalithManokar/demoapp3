const HQ = $.import("sap.ino.xs.xslib", "hQuery");
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
const configuration = $.import("sap.ino.xs.aof.config", "activation");
var msg = $.import("sap.ino.xs.aof.lib", "message");

const TextBundle = $.import("sap.ino.xs.xslib", "textBundle");
const SystemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var IdentityRole = $.import("sap.ino.xs.object.iam", "ObjectIdentityRole");

const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const message = $.import("sap.ino.xs.aof.lib", "message");
const systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
const register = $.import("sap.ino.xs.xslib", "registrationApproval");

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_independent.97_setup_activate_configuration.xsjslib';

function error(line) {
	trace.error(whoAmI, line);
}

function info(line) {
	trace.info(whoAmI, line);
}

function check(oConnection) {

// 	var sStatement =
// 		"select distinct registration.id as register_id " +
// 		"from \"sap.ino.db.campaign::t_registration\" as registration " +
// 		"inner join \"sap.ino.db.campaign::t_campaign\" as campaign on registration.CAMPAIGN_ID = campaign.ID " +
// 		"where registration.status = 'sap.ino.config.REGISTER_NEW' and campaign.is_register_auto_approve = 1";

// 	var aRegistration = oHQ.statement(sStatement).execute();
// 	if (aRegistration.length === 0) {
// 		return false;
// 	}
	return true;
}

function run(oConnection) {
const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const oHQ = hQuery.hQuery(conn);

		try {

		

			update(oHQ, conn);
			
			return true;
		} catch (e) {
			$.response.setBody("errors ！");
			conn.rollback();
			conn.close();
		return false;
		}
	

	function update(oHQ, conn) {
        var sStatement1 = "insert into\"sap.ino.db.campaign::t_campaign_anonymous_text\" select\"sap.ino.db.campaign::s_campaign_anonymous_text\".nextval,'ANONYMOUS_FOR_ALL',id from\"sap.ino.db.campaign::t_campaign\"  ";
        var sStatement2 = "insert into\"sap.ino.db.campaign::t_campaign_anonymous_text\" select\"sap.ino.db.campaign::s_campaign_anonymous_text\".nextval,'NOT_ANONYMOUS_CAMPAIGN_MANAGER',id from\"sap.ino.db.campaign::t_campaign\" ";
        var sStatement3 = "insert into\"sap.ino.db.campaign::t_campaign_anonymous_text\" select\"sap.ino.db.campaign::s_campaign_anonymous_text\".nextval,'NOT_ANONYMOUS',id from\"sap.ino.db.campaign::t_campaign\" ";
        
		oHQ.statement(sStatement1).execute();
		oHQ.statement(sStatement2).execute();
		oHQ.statement(sStatement3).execute();
		$.response.setBody("work done！");
		conn.commit();
	}
	conn.close();
}

function clean(oConnection) {
	//nothing to do
	return true;
}