sap.ui.define([
    "sap/ino/commons/models/object/IdeaVolunteer",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function(IdeaVolunteer, MessageToast, JSONModel) {
    "use strict";

	/**
	 * @class
	 * Mixin that provides an event for user voting
	 */
	var VolunteerMixin = function() {
		throw "Mixin may not be instantiated directly";
	};
	
	VolunteerMixin.toggleVolunteer = function(oEvent) {
	    var iKey = oEvent.getParameter("Key");
	    var bValue = oEvent.getParameter("Value");
	    var iIdeaId = oEvent.getParameter("IdeaId");
	    var self = this;
	    var oVolunteerControl = oEvent.getSource();
// 	    if (!this.oIdeaVolunteerModel) {
// 		    this.oIdeaVolunteerModel = new JSONModel();
// 		}
		if(!iKey){
		    this.oIdeaVolunteerModel = new JSONModel();
		}
		
// 		if(this.oIdeaVolunteerModel) {
// 		    var oIdeaVolunteer = this.oIdeaVolunteerModel.getProperty("/" + iIdeaId);
// 		    //iKey = oIdeaVolunteer ? oIdeaVolunteer.ID : iKey;
// 		    iKey = iKey ? iKey : oIdeaVolunteer.ID;
// 		}
	    
	    var showMsg = bValue ? "VOLUNTEERS_LEAVE_SUCCESS" : "VOLUNTEERS_ADD_SUCCESS";
	    
	    var oResponse = IdeaVolunteer.toggleVolunteer(iKey, iIdeaId);
	    
	    if (oVolunteerControl.setEnabled) {
			oVolunteerControl.setEnabled(false);
		}
    		
	    oResponse.done(function(oEvent) {
	        var oVolunteerList = sap.ui.getCore().byId("volunteerView--volunteerlist");
	        if (oVolunteerList) {
	            var oBindingInfo = oVolunteerList.getBindingInfo("items");
	            oVolunteerList.bindItems(oBindingInfo);
	        }
	        MessageToast.show(self.getText(showMsg));
	        
			if(self.oIdeaVolunteerModel) {
			    var oResult = {
    			    ID: oEvent.GENERATED_IDS ? oEvent.GENERATED_IDS[-1] : null
    			};
			   self.oIdeaVolunteerModel.setProperty("/" + iIdeaId, oResult); 
			}
	        if (oVolunteerControl.setEnabled) {
    			oVolunteerControl.setEnabled(true);
    		}
    		if(self.isGlobalSearch){
                 self.getSearchResult(self.getViewProperty("/SEARCH_QUERY"));
            }  
	    });
	    
	    oResponse.fail(function(){
		    if (oVolunteerControl.setEnabled) {
				oVolunteerControl.setEnabled(true);
			}
		});
	};
	
	return VolunteerMixin;
});