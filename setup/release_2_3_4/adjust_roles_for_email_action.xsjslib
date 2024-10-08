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
	    // add assigned coach 
	    var sPreCheckStatementForAssignedRole = `select ROLE_CODE from "sap.ino.db.newnotification::t_notification_campaign_setting_receiver" where role_code in ('ASSIGNED_COACH' ,'FOLLOW_UP_PERSON','ASSIGNED_EXPERT')`;
	    var conditionResult = oHQ.statement(sPreCheckStatementForAssignedRole).execute();
	    if(conditionResult && conditionResult.length === 0){
	        
	    
        var sStatement1 = `insert into "sap.ino.db.newnotification::t_notification_campaign_setting_receiver"(ID,ACTION_ID,ROLE_CODE,IS_RECEIVE_EMAIL)
                            select "sap.ino.db.newnotification::s_notification_campaign_setting_receiver".nextval as id,
                            action_id,
                            'ASSIGNED_COACH',
                            0
                            from"sap.ino.db.newnotification::t_notification_campaign_setting_receiver" as receiver
                            inner join "sap.ino.db.newnotification::t_notification_campaign_setting" as campaign
                            on campaign.ID = receiver.action_id
                            where receiver.ROLE_CODE = 'COACH' and 
                            campaign.action_code not in('DELETE_CAMPAIGN_COMMENT','EDIT_CAMPAIGN_COMMENT','CREATE_CAMPAIGN_COMMENT','DELETE_CAMPAIGN_BLOG','EDIT_CAMPAIGN_BLOG','PUBLISH_CAMPAIGN_BLOG','PUBLISH_CAMPAIGN')`;
        //add RL coach 
        var sStatement2 = `insert into "sap.ino.db.newnotification::t_notification_campaign_setting_receiver"(ID,ACTION_ID,ROLE_CODE,IS_RECEIVE_EMAIL)
                            select "sap.ino.db.newnotification::s_notification_campaign_setting_receiver".nextval as id,
                            action_id,
                            'RL_COACH',
                            0
                            from"sap.ino.db.newnotification::t_notification_campaign_setting_receiver" as receiver
                            inner join "sap.ino.db.newnotification::t_notification_campaign_setting" as campaign
                            on campaign.ID = receiver.action_id
                            where receiver.ROLE_CODE = 'COACH' and 
                            campaign.action_code not in('DELETE_CAMPAIGN_COMMENT','EDIT_CAMPAIGN_COMMENT','CREATE_CAMPAIGN_COMMENT','DELETE_CAMPAIGN_BLOG','EDIT_CAMPAIGN_BLOG','PUBLISH_CAMPAIGN_BLOG','PUBLISH_CAMPAIGN')`;
        //add assigned expert
        var sStatement3 = `insert into "sap.ino.db.newnotification::t_notification_campaign_setting_receiver"(ID,ACTION_ID,ROLE_CODE,IS_RECEIVE_EMAIL)
                            select "sap.ino.db.newnotification::s_notification_campaign_setting_receiver".nextval as id,
                            action_id,
                            'ASSIGNED_EXPERT',
                            0
                            from"sap.ino.db.newnotification::t_notification_campaign_setting_receiver" as receiver
                            inner join "sap.ino.db.newnotification::t_notification_campaign_setting" as campaign
                            on campaign.ID = receiver.action_id
                            where receiver.ROLE_CODE = 'EXPERT' and 
                            campaign.action_code not in('DELETE_CAMPAIGN_COMMENT','EDIT_CAMPAIGN_COMMENT','CREATE_CAMPAIGN_COMMENT','DELETE_CAMPAIGN_BLOG','EDIT_CAMPAIGN_BLOG','PUBLISH_CAMPAIGN_BLOG','PUBLISH_CAMPAIGN')`;
        var sStatement4 = `insert into "sap.ino.db.newnotification::t_notification_campaign_setting_receiver"(ID,ACTION_ID,ROLE_CODE,IS_RECEIVE_EMAIL)
                            select "sap.ino.db.newnotification::s_notification_campaign_setting_receiver".nextval as id,
                            action_id,
                            'RL_EXPERT',
                            0
                            from"sap.ino.db.newnotification::t_notification_campaign_setting_receiver" as receiver
                            inner join "sap.ino.db.newnotification::t_notification_campaign_setting" as campaign
                            on campaign.ID = receiver.action_id
                            where receiver.ROLE_CODE = 'EXPERT' and 
                            campaign.action_code not in('DELETE_CAMPAIGN_COMMENT','EDIT_CAMPAIGN_COMMENT','CREATE_CAMPAIGN_COMMENT','DELETE_CAMPAIGN_BLOG','EDIT_CAMPAIGN_BLOG','PUBLISH_CAMPAIGN_BLOG','PUBLISH_CAMPAIGN')`;
        // REMOVE 'ASSIGNED_EXPERT','COMMENTER','FOLLOWER','VOTER' FOR SUBMIT IDEA
        var sStatement5 = `DELETE from "sap.ino.db.newnotification::t_notification_campaign_setting_receiver"
                                where id in (select receiver.id from "sap.ino.db.newnotification::t_notification_campaign_setting_receiver" as receiver
                                inner join "sap.ino.db.newnotification::t_notification_campaign_setting" as campaign
                                on campaign.ID = receiver.action_id
                                where receiver.ROLE_CODE in('ASSIGNED_EXPERT','COMMENTER','FOLLOWER','VOTER') and campaign.action_code = 'SUBMIT_IDEA')`;
        // ADD APPLICANT FOR APPROVE LEFFTER FOR REGISTRTION
        var sStatement6 = `insert into "sap.ino.db.newnotification::t_notification_campaign_setting_receiver"(ID,ACTION_ID,ROLE_CODE,IS_RECEIVE_EMAIL)
                            select "sap.ino.db.newnotification::s_notification_campaign_setting_receiver".nextval as id,
                            action_id,
                            'APPLICANT',
                            0
                            from"sap.ino.db.newnotification::t_notification_campaign_setting_receiver" as receiver
                            inner join "sap.ino.db.newnotification::t_notification_campaign_setting" as campaign
                            on campaign.ID = receiver.action_id
                            where
                            campaign.action_code = 'APPROVAL_LETTER_FOR_REGISTRATION'`;
        // remove EVALUATION_REQUEST_DUE_TO_EXPIRE_IN_ONE_DAY action
        var sStatement7 = `DELETE from "sap.ino.db.newnotification::t_notification_campaign_setting_receiver"
                                where id in (select receiver.id from "sap.ino.db.newnotification::t_notification_campaign_setting_receiver" as receiver
                                inner join "sap.ino.db.newnotification::t_notification_campaign_setting" as campaign
                                on campaign.ID = receiver.action_id
                                where  campaign.action_code = 'EVALUATION_REQUEST_DUE_TO_EXPIRE_IN_ONE_DAY')`;
        var sStatement7_2 = ` delete from "sap.ino.db.newnotification::t_notification_campaign_setting" where action_code = 'EVALUATION_REQUEST_DUE_TO_EXPIRE_IN_ONE_DAY'`;
        //add idea follow up person and remove other roles
        var sStatement8 = `DELETE from "sap.ino.db.newnotification::t_notification_campaign_setting_receiver"
                                where id in (select receiver.id from "sap.ino.db.newnotification::t_notification_campaign_setting_receiver" as receiver
                                inner join "sap.ino.db.newnotification::t_notification_campaign_setting" as campaign
                                on campaign.ID = receiver.action_id
                                where  campaign.action_code = 'IDEA_FOLLOW_UP')`;
        var sStatement8_2 = `insert into "sap.ino.db.newnotification::t_notification_campaign_setting_receiver"(ID,ACTION_ID,ROLE_CODE,IS_RECEIVE_EMAIL)
                            select "sap.ino.db.newnotification::s_notification_campaign_setting_receiver".nextval as id,
                            campaign.id,
                            'FOLLOW_UP_PERSON',
                            0
                            from "sap.ino.db.newnotification::t_notification_campaign_setting" as campaign
                            where campaign.action_code = 'IDEA_FOLLOW_UP'`;
        //remove commenter and follower for publish campaign
        var sStatement9 = `DELETE from "sap.ino.db.newnotification::t_notification_campaign_setting_receiver"
                                where id in (select receiver.id from "sap.ino.db.newnotification::t_notification_campaign_setting_receiver" as receiver
                                inner join "sap.ino.db.newnotification::t_notification_campaign_setting" as campaign
                                on campaign.ID = receiver.action_id
                                where receiver.ROLE_CODE in('COMMENTER','FOLLOWER') and campaign.action_code = 'PUBLISH_CAMPAIGN')`;
		 oHQ.statement(sStatement1).execute();
		 oHQ.statement(sStatement2).execute();
		 oHQ.statement(sStatement3).execute();
		 oHQ.statement(sStatement4).execute();
		 oHQ.statement(sStatement5).execute();
		 oHQ.statement(sStatement6).execute();
		 oHQ.statement(sStatement7).execute();
		 oHQ.statement(sStatement7_2).execute();
		 oHQ.statement(sStatement8).execute();
		 oHQ.statement(sStatement8_2).execute();
		 oHQ.statement(sStatement9).execute();
		 $.response.setBody("work done！");
	        }else{
	        $.response.setBody(" Due to repeated installation, skip this step！");
	    }
		conn.commit();
	}
	conn.close();
}

function clean(oConnection) {
	//nothing to do
	return true;
}