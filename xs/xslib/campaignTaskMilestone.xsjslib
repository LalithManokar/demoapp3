//provide some functions to campaign_task_milestone.xsjs service
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const ohQuery = $.import("sap.ino.xs.xslib", "hQuery");
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var oHQ = ohQuery.hQuery(oConn).setSchema("SAP_INO");

function getMilestone(sCampaignId) {
    var oResult = {
        Tasks : {}
    };
    var oResponse = {
		status: $.net.http.OK,
		body: oResult
	};
	
    var sEnableMilestoneSelect = 'SELECT TOP 1 1 AS COUNTNUMBER FROM "sap.ino.db.campaign::t_campaign" WHERE ID = ? AND IS_MILESTONE_ACTIVE = 1';
	
	if(oHQ.statement(sEnableMilestoneSelect).execute(sCampaignId).length <= 0){
	    return oResponse;
	}
	
	var sTaskSelect = 'select * from "sap.ino.db.campaign.ext::v_ext_campaign_task" where campaign_id = ?';

	var sMilestoneSelect = 'select * from "sap.ino.db.campaign.ext::v_ext_campaign_milestone" where campaign_task_id = ?';

	var sAttachmentSelect = 'select * from "sap.ino.db.attachment::t_attachment_assignment" where owner_id = ? and owner_type_code = ?';
	
	oResult.Tasks.results = oHQ.statement(sTaskSelect).execute(sCampaignId);
	
	_.each(oResult.Tasks.results, function(oTask) {
	    oTask.Milestones = {};
	    oTask.Milestones.results = oHQ.statement(sMilestoneSelect).execute(oTask.ID);
	    
	    _.each(oTask.Milestones.results, function(oMilestone) {
	        oMilestone.Attachment = {};
	        oMilestone.Attachment.results = oHQ.statement(sAttachmentSelect).execute(oMilestone.ID, 'MILESTONE');
	    });
	});
	
	return oResponse;
}