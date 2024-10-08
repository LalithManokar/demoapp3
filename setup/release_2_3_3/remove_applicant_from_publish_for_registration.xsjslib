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
        var sStatement = `delete from "sap.ino.db.newnotification::t_notification_campaign_setting_receiver"
                                where id in (select receiver.id from "sap.ino.db.newnotification::t_notification_campaign_setting_receiver" as receiver
                                inner join "sap.ino.db.newnotification::t_notification_campaign_setting" as campaign
                                on campaign.ID = receiver.action_id
                                where receiver.ROLE_CODE = 'APPLICANT' and campaign.action_code = 'PUBLISH_FOR_REGISTRATION')`;

		var result = oHQ.statement(sStatement).execute();
		$.response.setBody("work done！");
		conn.commit();
	}
	conn.close();
}

function clean(oConnection) {
	//nothing to do
	return true;
}