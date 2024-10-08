var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");

const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();

var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.core", "authorization");
var Registration = AOF.getApplicationObject("sap.ino.xs.object.campaign.Registration");
var Campaign = AOF.getApplicationObject("sap.ino.xs.object.campaign.Campaign");
var ContentType = {
	Plain: "text/plain",
	JSON: "application/json"
};

//get method 
var method = $.request.method;
(function() {
	//3 means method POST
	try {
		if (method === 3) {
		    
			var old_user = $.session.getUsername();
			//get the register para object from request
			var oRequestBody = _getPayloadObjectFromRequest($.request);
			//get managerIdentityId from table t_object_identity_role
			const managerIdentityId = oHQ.statement(
					'select  top 1 IDENTITY_ID from "sap.ino.db.iam::t_object_identity_role" where OBJECT_ID = ? and OBJECT_TYPE_CODE = ? and ROLE_CODE = ?'
				)
				.execute(oRequestBody.CAMPAIGN_ID, 'CAMPAIGN', 'CAMPAIGN_MANAGER');
			// get campaign manager username from table t_identity
			if(managerIdentityId.length > 0){
			const manager_userName = oHQ.statement(
				'select top 1 user_name from "sap.ino.db.iam::t_identity" where id = ?').execute(managerIdentityId[0].IDENTITY_ID);
				var operator = "username";
				if(!manager_userName[0].USER_NAME){
				    	const group_top1_member_name = oHQ.statement(
				' select TOP 1 user_name from "sap.ino.db.iam::v_group_member_transitive"  where group_id = ? and type_code = \'USER\'').execute(managerIdentityId[0].IDENTITY_ID);
				    operator = group_top1_member_name[0].USER_NAME;
				}else{
				    
				    operator = manager_userName[0].USER_NAME;
				}
			//check the corresponding campaign whether IS_REGISTER_AUTO_APPROVE
			const aIsAutoApprove = oHQ.statement(
				'select IS_REGISTER_AUTO_APPROVE from "sap.ino.db.campaign::t_campaign" where id = ?').execute(oRequestBody.CAMPAIGN_ID);
			var bIsAutoApprove = aIsAutoApprove[0].IS_REGISTER_AUTO_APPROVE;
			auth.setApplicationUser(old_user);
			//check the campaign whether auto approve
			if (bIsAutoApprove) {
				// create a registration for a campaign

				var oResponse = Registration.create(oRequestBody);

				var iKey = oResponse.generatedKeys[-1];

				//var oRegistration = Registration.read(iKey);

				auth.setApplicationUser(operator);
				//update the registration status
				oResponse = Registration.update({
					ID: iKey,
					STATUS: 'sap.ino.config.REGISTER_APPROVED',
					REASON: 'AUTO APPROVE'
				});
				oConn.commit();
				return;

			}
		}}
	} catch (e) {
		auth.setApplicationUser(old_user);
		oConn.rollback();
		return;
	}
	$.import("sap.ino.xs.aof.rest", "dispatcher").dispatchDefault();
}());

function _getPayloadObjectFromRequest(oRequest, oMapper) {
	// Currently we assume JSON payload. In future we could extend to other formats as well.
	try {
		if (oMapper && oMapper.requestMapper) {
			return oMapper.requestMapper(oRequest);
		}
		if (oRequest.body) {
			var oObject = JSON.parse(oRequest.body.asString());
			return oObject;
		} else {
			return null;
		}
	} catch (oException) {
		throw new HttpResponseException($.net.http.BAD_REQUEST, "Error in payload: " + oException.toString());
	}
}

function HttpResponseException(iStatus, sBody, sContentType) {
	this.fillResponse = function(oResponse) {
		oResponse.status = iStatus;
		oResponse.contentType = sContentType || ContentType.Plain;
		oResponse.setBody(sBody);
	};
}