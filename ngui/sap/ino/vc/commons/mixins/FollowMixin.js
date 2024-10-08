sap.ui.define([
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/m/MessageToast",
    "sap/ino/commons/models/object/IdeaFollow",
    "sap/ino/commons/models/object/CampaignFollow",
    "sap/ino/commons/models/object/TagFollow",
    "sap/ui/model/json/JSONModel"
], function(PropertyModel, MessageToast, IdeaFollow, CampaignFollow, TagFollow, JSONModel) {
    "use strict";
    
    var FollowMixin = function() {
        throw "Mixin may not be instantiated directly";
    };
    
    FollowMixin.onFollow = function(Event){
        var self = this;
        var value = Event.getParameter('value');
        var type = Event.getParameter('type');
        var objectId = Event.getParameter('objectId');
        var followService;
        var showMsg = value ? 'FOLLOW_REMOVE_FOLLOW_SUCCESS' : 'FOLLOW_MSG_FOLLOW_SUCCESS'; 
        var followButton = Event.getSource();
//         if (!this.oIdeaFollowModel) {
// 		    this.oIdeaFollowModel = new JSONModel();
// 		}
		if(!value){
		    this.oIdeaFollowModel = new JSONModel();
		}
		
// 		if(this.oIdeaFollowModel) {
// 		    var oIdeaFollow = this.oIdeaFollowModel.getProperty("/" + type + "(" + objectId + ")");
// 		    value = oIdeaFollow && oIdeaFollow.ID ? oIdeaFollow.ID : value;
// 		}
        
        switch (type) {
            case 'IDEA':
                followService = IdeaFollow.follow(objectId, type, value);
                break;
            case 'CAMPAIGN':
                followService = CampaignFollow.follow(objectId, type, value);  
                break;
            case 'TAG':
                followService = TagFollow.follow(objectId, type, value);
                break;
            default: 
                return false;
        }
        
        if(followButton && followButton.setEnabled){
            followButton.setEnabled(false);   
        }
    
        followService.done(function(callback){
            MessageToast.show(self.getText(showMsg));
            if(self.oIdeaFollowModel) {
			    var oResult = {
    			    ID: callback.GENERATED_IDS ? callback.GENERATED_IDS[-1] : undefined
    			};
			   self.oIdeaFollowModel.setProperty("/" + type + "(" + objectId + ")", oResult); 
			}
            followButton.setEnabled(true);
            followButton.rerender();
            if(self.isGlobalSearch){
                 self.getSearchResult(self.getViewProperty("/SEARCH_QUERY"));
            }            
        });
        
        followService.fail(function(){
		    if (followButton.setEnabled) {
				followButton.setEnabled(true);
			}
		});
    };
    
    return FollowMixin;
});