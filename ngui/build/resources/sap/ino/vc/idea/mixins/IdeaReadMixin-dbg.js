sap.ui.define([
    "sap/ino/commons/models/object/IdeaRead",
    "sap/m/MessageToast",
    "sap/ino/commons/models/core/CodeModel",
    "sap/ui/model/json/JSONModel"
], function(IdeaRead, MessageToast, CodeModel, JSONModel) {
	"use strict";


	var ideaReadMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

    ideaReadMixin.checkIdeaRead = function(id){
        return !!id;
    };
    
    ideaReadMixin.isRead = function(isRead){
        return !isRead;
    };
    
    ideaReadMixin.onMarkRead = function(event){
        var source = event.getSource();
        var custData = source.getCustomData() && source.getCustomData();
        var readId = custData[0] && custData[0].getValue();
        var ideaId = custData[1] && custData[1].getValue();
        //var layoutData = source.getLayoutData();
        IdeaRead.markRead(readId, {IDEA_ID: ideaId}).done(function(data){
            if(data){
                source.setEnabled(false);
                source.setProperty('enabled', false);
                //source.setLayoutData(layoutData.setPriority('Disappear'));
            }
        });
    };
    
	return ideaReadMixin;
});