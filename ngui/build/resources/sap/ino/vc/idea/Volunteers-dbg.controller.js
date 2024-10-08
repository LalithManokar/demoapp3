sap.ui.define([
    "sap/ino/vc/commons/BaseObjectController",
    "sap/ino/vc/commons/BaseListController",
    "sap/ino/commons/application/Configuration",
    "sap/ui/Device",
    "sap/ino/vc/idea/mixins/DuplicateActionMixin",
    "sap/m/GroupHeaderListItem",
    "sap/ino/commons/models/object/Idea",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ui/model/Sorter"
], function (BaseController,
             BaseListController,
             Configuration,
             Device,
             DuplicateActionMixin,
             GroupHeaderListItem,
             Idea,
             JSONModel,
             ObjectListFormatter,
             Sorter) {
    "use strict";
    
    var oFormatter = {};
	jQuery.extend(oFormatter, BaseController.prototype.formatter);

	oFormatter.generateMailURL = function(sMailAddress) {
		var oContent = this.oView.getController().createMailContent();

		if (oContent) {
			//sap.m.URLHelper is a namescpace and can't be required in the define
			return sap.m.URLHelper.normalizeEmail(sMailAddress, oContent.subject, oContent.body);
		} else {
			return sap.m.URLHelper.normalizeEmail(sMailAddress);
		}
	};
    
    return BaseController.extend("sap.ino.vc.idea.Volunteers", {
        
        formatter: oFormatter,
        
        onBeforeRendering: function(oEvent) { 
            var iIdeaId = this.getObjectModel().getKey();
            if (!!iIdeaId) {
                var oVolunteerList = this.byId("volunteerlist");
                oVolunteerList.bindItems({
                    path: "data>Volunteers",
                    template: this.getItemTemplate()
                });
            }
        },
        
        getItemTemplate: function() {
            return this.getFragment("sap.ino.vc.idea.fragments.VolunteerListItem");
        }
    });
});