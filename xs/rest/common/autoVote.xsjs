const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const tracker = $.import("sap.ino.xs.xslib", "tracker");
var authSetUser = $.import("sap.ino.xs.aof.core", "authorization");

var AOF = $.import("sap.ino.xs.aof.core", "framework");

var ContentType = {
	Plain: "text/plain",
	JSON: "application/json"
};

var _handleRequest = function(req, res) {
	var oHQ = hQuery.hQuery(conn);
	var oMessage = {
		type: null,
		message: null
	};
	var aMessages = [];
	var oConnection = oHQ.getConnection();
	// 		if (req.method !== $.net.http.POST) {
	// 			$.response.status = $.net.http.METHOD_NOT_ALLOWED;
	// 			$.response.contentType = ContentType.Plain;
	// 			$.response.setBody("Method not supported");
	// 			return;
	// 		}
	try {
		//var oBody = JSON.parse(req.body.asString());
		var sSelectSQL =
			`select idea_data.*,identity.user_name,vote_type.type_code as vote_type_type_code,vote_type.max_star_no from (
     select history_actor_id,id,count(*) as CNT from "sap.ino.db.idea::t_idea_h" 
     where history_biz_event in ('STATUS_ACTION_SUBMIT','AUTO_VOTE') AND  created_at >= '2020-06-05'
     group by history_actor_id,id order by id desc ) as idea_data 
     inner join "sap.ino.db.iam::v_identity" as identity on idea_data.history_actor_id = identity.id 
     inner join "sap.ino.db.idea::t_idea" as idea on idea.id = idea_data.id 
     left outer join "sap.ino.db.campaign::t_campaign" as campaign 
     on campaign.id = idea.campaign_id 
     left outer join "sap.ino.db.campaign::t_vote_type" as vote_type
     on vote_type.code = campaign.vote_type_code
     where CNT = 1 order by user_name`;
		var aIdeas = oHQ.statement(sSelectSQL).execute();
		if (aIdeas.length > 0) {
			var sLastUserName;
			 authSetUser.setApplicationUser(aIdeas[0].USER_NAME);
			for (var i = 0; i < aIdeas.length; i++) {
				if (sLastUserName !== aIdeas[i].USER_NAME) {
					authSetUser.setApplicationUser(aIdeas[i].USER_NAME);
				} 
				var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
				var oResponse = Idea.autoVote(aIdeas[i].ID, {
					VOTE_TYPE_TYPE_CODE: aIdeas[i].VOTE_TYPE_TYPE_CODE,
					MAX_STAR_NO: aIdeas[i].MAX_STAR_NO
				});
				sLastUserName = aIdeas[i].USER_NAME;
				if (oResponse.messages.length > 0) {
					aMessages.push({
						type: "E",
						IDEA_ID: aIdeas[i].ID,
						message: oResponse.messages
					});					
				} else {
					aMessages.push({
						type: "S",
						IDEA_ID: aIdeas[i].ID,
						message: "Auto Vote successfully"
					});
				}
			}

		} else {
			oMessage.type = "E";
			oMessage.message = "No Ideas to process!";
			aMessages.push(oMessage);
		}

	} catch (e) {
		oMessage.type = "E";
		oMessage.message = e.message;
		aMessages.push(oMessage);
	} finally {
		oConnection.commit();
		oConnection.close();
	}

	// 	if (oMessage.type === 'E') {
	// 		res.status = $.net.http.ACCEPTED;
	// 		res.contentType = ContentType.JSON;
	// 		res.setBody(JSON.stringify(oMessage));
	// 	} else {
	res.status = $.net.http.OK;
	res.contentType = ContentType.JSON;
	res.setBody(JSON.stringify(aMessages));
	// 	}
};

TraceWrapper.wrap_request_handler(function() {
	return _handleRequest($.request, $.response);
});