sap.ui.define([
    "sap/ino/vc/commons/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/ino/commons/application/Configuration",
    "sap/ino/controls/Milestone",
    "sap/ui/core/ResizeHandler"
], function(BaseController, JSONModel, PropertyModel, Configuration, Milestone, ResizeHandler) {
	"use strict";

	var milestoneMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	milestoneMixin.bindResize = function() {
		var self = this;
		this._sResizeRegId = ResizeHandler.register(this.getView(), function() {
			return self._onResize(self);
		});
	};

	milestoneMixin._onResize = function() {
		this.buildMilestone();
	};

	milestoneMixin.bindMilestone = function(iCampaignId) {
		var self = this;
		var sPath = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/campaign_task_milestone.xsjs";
		var aParameter = [];
		if (iCampaignId) {
			aParameter.push("CAMPAIGN_ID=" + iCampaignId);
		}

		if (aParameter.length > 0) {
			sPath = sPath + "?" + aParameter.join("&");
		}

        this.destroyMilestone();

		var milestoneModel = new JSONModel(sPath);
		this.getView().setModel(milestoneModel, "milestoneTask");
		milestoneModel.attachRequestCompleted(null, function() {
			var oData = milestoneModel.getData();
			self.renderData(oData);
			self.buildMilestone();
		}, milestoneModel);
	};

	milestoneMixin.renderData = function(data) {
		if (!data) {
			return false;
		}
		if (!data.Tasks || !data.Tasks.results || !data.Tasks.results.length) {
			return false;
		}
		var self = this;
		var tasks = data.Tasks.results;
		var attachmentLabel = self.getText("MILESTONE_ATTACHMENT_DOWNLOAD");
		for (var i = 0; i < tasks.length; i++) {
			tasks[i].Milestones = tasks[i].Milestones.results;
			tasks[i].END_DATE = new Date(tasks[i].END_DATE);
			tasks[i].START_DATE = new Date(tasks[i].START_DATE);
			if (!tasks[i].Milestones || !tasks[i].Milestones.length) {
				continue;
			}
			for (var x = 0; x < tasks[i].Milestones.length; x++) {
			    tasks[i].Milestones[x].MILESTONE_DATE = new Date(tasks[i].Milestones[x].MILESTONE_DATE);
				tasks[i].Milestones[x].Attachment = tasks[i].Milestones[x].Attachment.results;
				if (!tasks[i].Milestones[x].Attachment || !tasks[i].Milestones[x].Attachment.length) {
					continue;
				}
				for (var j = 0; j < tasks[i].Milestones[x].Attachment.length; j++) {
					tasks[i].Milestones[x].Attachment[j].LABEL = attachmentLabel;
					tasks[i].Milestones[x].Attachment[j].ATTACHMENT_URL = Configuration.getAttachmentDownloadURL(tasks[i].Milestones[x].Attachment[j].ATTACHMENT_ID);
				}
			}
		}
		this.tasks = tasks;
	};

	milestoneMixin.buildMilestone = function() {
		
		if (!this.tasks || !this.tasks.length) {
			return false;
		}
		var aTasks = this.tasks;
		
		for(var i = 0; i < aTasks.length; i++){
		 
		 var iStartUtcTime = aTasks[i].START_DATE.getTime() + aTasks[i].START_DATE.getTimezoneOffset() * 60 * 1000;
		 aTasks[i].START_DATE = new Date(iStartUtcTime);
		 var iEndUtcTime = aTasks[i].END_DATE.getTime() + aTasks[i].END_DATE.getTimezoneOffset() * 60 * 1000;
		 aTasks[i].END_DATE = new Date(iEndUtcTime);
		}
		var view = this.getView();
		var milestoneElement = view.byId('milestoneContainer');
		milestoneElement.destroyItems();
		
		milestoneElement.addItem(new sap.ino.controls.Milestone({
			tasks: this.tasks,
			visible: true
		}));
		if(!this._sResizeRegId){
		this.bindResize();		    
		}

	};
	
	milestoneMixin.destroyMilestone = function(){
	    var view = this.getView();
    	var milestoneElement = view.byId('milestoneContainer');
    	milestoneElement.destroyItems();
    	this.tasks = [];
	};
	
	return milestoneMixin;
});