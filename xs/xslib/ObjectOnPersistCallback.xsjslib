// action name mapping to call back function
var ideaLatestBo = $.import("sap.ino.xs.object.idea", "IdeaLatest");
var Dimension = $.import("sap.ino.xs.object.gamification", "Dimension");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

const definition = {
	Idea: {
		executeStatusTransition: [ideaStatusChangedOnpersist,gamificationChangeIdeaStatus],
		//submit: ideaSubmitOnpersist,
		submit: gamificationSubmitIdea,
		update: updateOnpersist,
		setStatusMerged: ideaMergedOnpersist,
		reassignCampaign: ideaReassignedOnpersist,
		del:[gamificationDeleteIdea]
	},
	Comment: {
		create: [commentCreateOnpersist,gamificationCreateIdeaComment,gamificationReplyIdeaComment],
		del:[gamificationDeleteIdeaComment,gamificationDeleteIdeaRepliedComment]
		
	},
	Vote:{
	    create:[gamificationVoteIdea],
	    del:[gamificationUnvoteIdea]
	},
	Evaluation:{
	    submit:[gamificationCreateEvaluation],
	    del:[gamificationDeleteEvaluation]
	}
};

function entry(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext, oNodeMetadata) {
	var objectName = oNodeMetadata && oNodeMetadata.objectMetadata.getObjectMetadata().name.length > 0 ? oNodeMetadata.objectMetadata.getObjectMetadata()
		.name.split('.')[oNodeMetadata.objectMetadata.getObjectMetadata().name.split('.').length - 1] : '';
	const actionObjectMapping = definition[objectName] ? definition[objectName][oContext.getAction().name] ? definition[objectName][oContext.getAction()
		.name] : undefined : undefined;
	if (oContext && oContext.getAction()) {

		if (actionObjectMapping && actionObjectMapping instanceof Array) {

			actionObjectMapping.forEach(function(item) {
				if (typeof item === 'function') {
					item.call(this, oWorkObject, oContext,oPersistedObject);
				}
			});
		} else {
			if (typeof actionObjectMapping === 'function') {
				actionObjectMapping.call(this, oWorkObject, oContext);
			}
		}
	}
}

function ideaStatusChangedOnpersist(oWorkObject, oContext) {
    var object_id = oWorkObject.ID;
    var involved_id = oWorkObject.CAMPAIGN_ID;
    ideaLatestBo.generateViewerForAction(object_id,'IDEA',involved_id,'CAMPAIGN','StatusChangeViewer', []);

}

function ideaMergedOnpersist(oWorkObject, oContext) {
    var object_id = oWorkObject.ID;
    var involved_id = oWorkObject.CAMPAIGN_ID;
    ideaLatestBo.generateViewerForAction(object_id,'IDEA',involved_id,'CAMPAIGN','StatusChangeViewer', []);

}

function ideaReassignedOnpersist(oWorkObject, oContext) {
    var object_id = oWorkObject.ID;
    var involved_id = oWorkObject.CAMPAIGN_ID;
    ideaLatestBo.generateViewerForAction(object_id,'IDEA',involved_id,'CAMPAIGN','StatusChangeViewer', []);

}

function ideaSubmitOnpersist(oWorkObject, oContext) {
    var object_id = oWorkObject.ID;
    var involved_id = oWorkObject.CAMPAIGN_ID;
    var co_author = oWorkObject.Contributors;
    ideaLatestBo.generateViewerForAction(object_id,'IDEA',involved_id,'CAMPAIGN','CreatedViewer', co_author);

}

function updateOnpersist(oWorkObject, oContext) {
    if(_.isArray(oWorkObject)){
    	_.each(oWorkObject, function(o){
    		ideaLatestBo.generateViewerForAction(o.ID,'IDEA',o.CAMPAIGN_ID,'CAMPAIGN','UpdatedViewer');
    	});
    }else{
        var object_id = oWorkObject.ID;
        var involved_id = oWorkObject.CAMPAIGN_ID;
    	ideaLatestBo.generateViewerForAction(object_id,'IDEA',involved_id,'CAMPAIGN','UpdatedViewer');
    }
}

function commentCreateOnpersist(oWorkObject, oContext) {
    var object_id = oWorkObject.OBJECT_ID;
    var involved_id = oWorkObject.ID;
    ideaLatestBo.generateViewerForAction(object_id,'IDEA',involved_id,'COMMENT','CommentViewer');
}




//gamification action 
function gamificationSubmitIdea(oWorkObject, oContext){
    var aPersona = Dimension.generatePersona(oWorkObject,oContext,['Submitter','Contributors']);
    //(action_code,oWorkObj,aPersona,oContext,bProcessIdeaStatusType,bProcessIdeaRole)
    Dimension.activityProcessEntry('SUBMIT_IDEA',oWorkObject,aPersona,oContext,false,false);
}

function gamificationVoteIdea(oWorkObject, oContext){
    var aPersona = Dimension.generatePersona(oWorkObject,oContext,['Actor']);
    var campaignId = Dimension.getCampaignIdByIdeaID(oWorkObject.IDEA_ID,oContext);
    var oDelegateObj = {
        ID: oWorkObject.IDEA_ID,
        CAMPAIGN_ID: campaignId
    };
    Dimension.activityProcessEntry('VOTE_IDEA',oDelegateObj,aPersona,oContext,false,false);
}

function gamificationChangeIdeaStatus(oWorkObject, oContext, oPersistedObject){
    var aPersona = Dimension.generatePersona(oWorkObject,oContext,['Submitter','Contributors']);
    //(action_code,oWorkObj,aPersona,oContext,bProcessIdeaStatusType,bProcessIdeaRole)
    if(oWorkObject.PHASE_CODE !== oPersistedObject.PHASE_CODE) {
        Dimension.activityProcessEntry('CHANGE_IDEA_PHASE',oWorkObject,aPersona,oContext,false,false);
    }else{
        Dimension.activityProcessEntry('CHANGE_IDEA_STATUS',oWorkObject,aPersona,oContext,true,false);
    }
    
}

function gamificationCreateIdeaComment(oWorkObject, oContext){
    if(!oWorkObject.PARENT_ID){
    var aPersona = Dimension.generatePersona(oWorkObject,oContext,['Actor']);
    var campaignId = Dimension.getCampaignIdByIdeaID(oWorkObject.OBJECT_ID,oContext);
    var oDelegateObj = {
        ID: oWorkObject.OBJECT_ID,
        CAMPAIGN_ID: campaignId
    };
    Dimension.activityProcessEntry('CREATE_IDEA_COMMENT',oDelegateObj,aPersona,oContext,false,false);
    }
}

function gamificationReplyIdeaComment(oWorkObject, oContext){
    if(oWorkObject.PARENT_ID){
    var aPersona = Dimension.generatePersona(oWorkObject,oContext,['Actor']);
    var campaignId = Dimension.getCampaignIdByIdeaID(oWorkObject.OBJECT_ID,oContext);
    var oDelegateObj = {
        ID: oWorkObject.OBJECT_ID,
        CAMPAIGN_ID: campaignId,
        PARENT_ID: oWorkObject.PARENT_ID
    };
    Dimension.activityProcessEntry('REPLY_IDEA_COMMENT',oDelegateObj,aPersona,oContext,false,false);
    }
}

function gamificationDeleteIdea(oWorkObject, oContext){
    var aPersona = Dimension.generatePersona(oWorkObject,oContext,['Submitter','Contributors']);
    Dimension.activityProcessEntry('DELETE_IDEA',oWorkObject,aPersona,oContext,false,false);
}

function gamificationDeleteIdeaComment(oWorkObject, oContext){
    if(!oWorkObject.PARENT_ID){
    var aPersona = Dimension.generatePersona(oWorkObject,oContext,['CreatedBy']);
    var campaignId = Dimension.getCampaignIdByIdeaID(oWorkObject.OBJECT_ID,oContext);
    var oDelegateObj = {
        ID: oWorkObject.OBJECT_ID,
        CAMPAIGN_ID: campaignId
    };
    Dimension.activityProcessEntry('DELETE_IDEA_COMMENT',oDelegateObj,aPersona,oContext,false,false);
    }
}

function gamificationDeleteIdeaRepliedComment(oWorkObject, oContext){
    if(oWorkObject.PARENT_ID){
    var aPersona = Dimension.generatePersona(oWorkObject,oContext,['CreatedBy']);
    var campaignId = Dimension.getCampaignIdByIdeaID(oWorkObject.OBJECT_ID,oContext);
    var oDelegateObj = {
        ID: oWorkObject.OBJECT_ID,
        CAMPAIGN_ID: campaignId,
        PARENT_ID: oWorkObject.PARENT_ID
    };
    Dimension.activityProcessEntry('DELETE_IDEA_REPLED_COMMENT',oDelegateObj,aPersona,oContext,false,false);
    }
}

function gamificationUnvoteIdea(oWorkObject, oContext){
   var aPersona = Dimension.generatePersona(oWorkObject,oContext,['Actor']);
    var campaignId = Dimension.getCampaignIdByIdeaID(oWorkObject.IDEA_ID,oContext);
    var oDelegateObj = {
        ID: oWorkObject.IDEA_ID,
        CAMPAIGN_ID: campaignId
    };
    Dimension.activityProcessEntry('UNVOTE_IDEA',oDelegateObj,aPersona,oContext,false,false);
}

function gamificationCreateEvaluation(oWorkObject, oContext){
    var aPersona = Dimension.generatePersona(oWorkObject,oContext,['Actor']);
    var campaignId = Dimension.getCampaignIdByIdeaID(oWorkObject.IDEA_ID,oContext);
    var oDelegateObj = {
        ID: oWorkObject.IDEA_ID,
        CAMPAIGN_ID: campaignId
    };
    Dimension.activityProcessEntry('CREATE_IDEA_EVALUATION',oDelegateObj,aPersona,oContext,false,false);
}

function gamificationDeleteEvaluation(oWorkObject, oContext){
    var aPersona = Dimension.generatePersona(oWorkObject,oContext,['CreatedBy']);
    var campaignId = Dimension.getCampaignIdByIdeaID(oWorkObject.IDEA_ID,oContext);
    var oDelegateObj = {
        ID: oWorkObject.IDEA_ID,
        CAMPAIGN_ID: campaignId
    };
    Dimension.activityProcessEntry('DELETE_IDEA_EVALUATION',oDelegateObj,aPersona,oContext,false,false);
}