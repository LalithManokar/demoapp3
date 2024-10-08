sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObject",
    "sap/ino/commons/models/core/ReadSource"
], function(ApplicationObject, ReadSource) {
	"use strict";
	return ApplicationObject.extend('sap.ino.commons.models.object.Registration', {
        objectName: "sap.ino.xs.object.campaign.Registration",
		readSource: ReadSource.getDefaultAOFSource(),
		actionImpacts: {
		    "create":[
		        {
				    "objectName": "sap.ino.commons.models.object.Campaign",
				    "objectKey": "CAMPAIGN_ID",
				    "impactedAttributes": ["REGISTER_ID", "REGISTER_STATUS", "IS_OPEN_FOR_REGISTRATION"]
			    }
		    ],
		    "update":[
		        {
				    "objectName": "sap.ino.commons.models.object.Campaign",
				    "objectKey": "CAMPAIGN_ID",
				    "impactedAttributes": ["REGISTER_ID", "REGISTER_STATUS"]
			    }
		    ],
			"del": [
			    {
				    "objectName": "sap.ino.commons.models.object.Campaign",
				    "objectKey": "CAMPAIGN_ID",
				    "impactedAttributes": ["REGISTER_ID", "REGISTER_STATUS","IS_OPEN_FOR_REGISTRATION"]
			    }
			]
		},
		Register: function(id, campaignId){
		    return this.modify(id || -1, { CAMPAIGN_ID:campaignId, STATUS:'sap.ino.config.REGISTER_NEW' });
		},
		Approved: function(id){
		    return this.update(id, { STATUS: 'sap.ino.config.REGISTER_APPROVED', REGISTER_ID:id});
		},
		Rejected: function(id,reason){
		    return this.update(id, { STATUS: 'sap.ino.config.REGISTER_REJECTED', REGISTER_ID:id,REASON:reason});
		},
		Leave: function(id, campaignId){
		    return this.del(id, { CAMPAIGN_ID:campaignId });
		}
	});
});