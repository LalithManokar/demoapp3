/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOController");
jQuery.sap.require("sap.ui.ino.models.object.GroupDetail");
jQuery.sap.require("sap.ui.ino.models.core.ReadSource");

sap.ui.controller("sap.ui.ino.views.backoffice.iam.GroupManagementInstance", jQuery.extend({}, sap.ui.ino.views.common.ThingInspectorAOController, {

    mMessageParameters : {
        group : "group",
        save : {
            success : "MSG_GROUP_SAVED"
        },
        del : {
            success : "MSG_GROUP_DELETED",
            title : "BO_GROUPMGMT_TIT_DEL_GROUP",
            dialog : "BO_GROUPMGMT_INS_DEL_GROUP"
        }
    },
    
	getODataPath: function() {
		// can be redefined if OData Model is needed;
		return "/Identity";
	},
	
    createModel : function(iId) {
        if (!this.oModel) {
            this.oModel = new sap.ui.ino.models.object.GroupDetail(iId > 0 ? iId : undefined, {
                //readSource: sap.ui.ino.models.core.ReadSource.getDefaultODataSource("Identity", {excludeNodes: ['Members']}),
                actions : ["create", "update", "modify", "del","cancel"],
				nodes: ["Root", "GroupAttribute"],
                continuousUse : true,
				concurrencyEnabled: true
            }); 
        }
        // we also need an oData Model
        this.bindODataModel(iId);
        return this.oModel;
    },
	onSave: function() {
	   return sap.ui.ino.views.common.ThingInspectorAOController.onSave.apply(this, arguments);
	}    
}));
