const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var IAMMessage = $.import("sap.ino.xs.object.iam", "message");


const aObjectTypeCode = ['AUTHOR','EXPERT','COMMENT','VOTE'];

this.definition = {
	Root: {
		table: "sap.ino.db.idea::t_merge_idea_config",
		sequence: "sap.ino.db.idea::s_merge_idea_config",
		determinations: {
		   onModify: [determine.systemAdminData]
		},
		attributes: {
		                	OBJECT_TYPE_CODE: {
								required: true
							},
							ADD: {
								required: true
							},
							IGNORE: {
								required: true
							},
							PROMPT: {
							    required: true
							}
		}
	},
	actions: {
		read: {
			authorizationCheck: false
		},
		create: {
			authorizationCheck: false
		},
		update: {
			authorizationCheck: false
		},
		del: {
			authorizationCheck: false
		},
		saveMergeConfig: {
		    authorizationCheck: false,
		    execute: saveMergeConfig,
			isStatic: true
		},
		getMergeConfig: {
		    authorizationCheck: false,
		    execute: getMergeConfig,
			isStatic: true
		},
		test: {
		    authorizationCheck: false,
		    execute: test,
			isStatic: true
		}
	}
};

function saveMergeConfig(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode){
    const aMergeConfigObject = oReq.MERGE_CONFIG ? oReq.MERGE_CONFIG : [];
    if(aMergeConfigObject.length > 0){
        var MergeConfigAO = AOF.getApplicationObject("sap.ino.xs.object.idea.MergeConfig");
        var oHQ = oContext.getHQ();
        var sKeyQuery =
		'SELECT ID,OBJECT_TYPE_CODE FROM "sap.ino.db.idea::t_merge_idea_config" ';
    	var aKeyResult = oHQ.statement(sKeyQuery).execute();
    	var aKey = _.pluck(aKeyResult,'OBJECT_TYPE_CODE');
    	var oKeyObject = {};
    	aKeyResult.forEach(function(element){
    	    oKeyObject[element.OBJECT_TYPE_CODE] = element.ID;
    	});
        aMergeConfigObject.forEach(function(element){
            if(element.OBJECT_TYPE_CODE && ~aKey.indexOf(element.OBJECT_TYPE_CODE) && ~aObjectTypeCode.indexOf(element.OBJECT_TYPE_CODE)){
                MergeConfigAO.update({
                    ID:oKeyObject[element.OBJECT_TYPE_CODE],
                    ADD:element.ADD,
                    IGNORE:element.IGNORE,
                    PROMPT:element.PROMPT
                });
            }else if(element.OBJECT_TYPE_CODE && !~aKey.indexOf(element.OBJECT_TYPE_CODE) && ~aObjectTypeCode.indexOf(element.OBJECT_TYPE_CODE)){
                MergeConfigAO.create({
                    ID:-1,
                    OBJECT_TYPE_CODE:element.OBJECT_TYPE_CODE,
                    ADD:element.ADD,
                    IGNORE:element.IGNORE,
                    PROMPT:element.PROMPT
                });
            }
            
    });
    }
    
}

function getMergeConfig(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode){
    var oHQ = oContext.getHQ();
        var sMergeConfigQuery =
		'SELECT ID,OBJECT_TYPE_CODE,ADD,IGNORE,PROMPT FROM "sap.ino.db.idea::t_merge_idea_config" ';
    	var aMergeConfigResult = oHQ.statement(sMergeConfigQuery).execute();
    	
    	return aMergeConfigResult;
}

//test
function test(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode){
    var oHQ = oContext.getHQ();
        var sMergeConfigQuery = `
           select id from"sap.ino.db.campaign::t_campaign"
         where id not in 
             (select object_id from (select    distinct 
          limitation.identity_id,
          limitation.group_id,
          limitation.OBJECT_ID,
          limitation.OBJECT_TYPE_CODE,
          limitation.ACTION_CODE,
          limitation.DISABLED
   from"sap.ino.db.iam::v_object_identity_limitation_action" as limitation
   inner join (select object_role.* ,
vote.*
from "sap.ino.db.iam::v_object_identity_role_transitive" as object_role
left outer join "sap.ino.db.idea::t_vote" as vote
on vote.USER_ID = object_role.identity_id and vote.idea_id = object_role.object_id
where  object_id = ? and object_type_code = 'IDEA')as vote_user
   on vote_user.user_id = limitation.identity_id) as limitation
             where limitation.object_type_code = 'CAMPAIGN' and limitation.action_code = 'IDEA_VOTE')
        union all
        select distinct object_id as id from (select    distinct 
          limitation.identity_id,
          limitation.group_id,
          limitation.OBJECT_ID,
          limitation.OBJECT_TYPE_CODE,
          limitation.ACTION_CODE,
          limitation.DISABLED
   from"sap.ino.db.iam::v_object_identity_limitation_action" as limitation
   inner join (select object_role.* ,
vote.*
from "sap.ino.db.iam::v_object_identity_role_transitive" as object_role
left outer join "sap.ino.db.idea::t_vote" as vote
on vote.USER_ID = object_role.identity_id and vote.idea_id = object_role.object_id
where  object_id = ? and object_type_code = 'IDEA')as vote_user
   on vote_user.user_id = limitation.identity_id) as limitation
              where limitation.object_type_code = 'CAMPAIGN' and limitation.action_code = 'IDEA_VOTE' and limitation.disabled = 0
        `;
    	var aMergeConfigResult = oHQ.statement(sMergeConfigQuery).execute(319010,319010);
    	
    	return aMergeConfigResult.length;
}

//END