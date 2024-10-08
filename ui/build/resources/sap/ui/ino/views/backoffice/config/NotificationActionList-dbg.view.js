/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailView");
jQuery.sap.require("sap.ui.ino.models.util.Table");
jQuery.sap.require("sap.ui.model.type.Date");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.NotificationActionList", jQuery.extend({}, sap.ui.ino.views.common.MasterDetailView, {
    
    getControllerName: function() {
		return "sap.ui.ino.views.backoffice.config.NotificationActionList";
	},

	hasPendingChanges: function() {
		return this.getController().hasPendingChanges();
	},
	
	createActionButtons: function() {
	    var oController = this.getController();
	    this._oEditButton = new sap.ui.commons.Button({
			id: this.createId("BUT_EDIT"),
			text: "{i18n>BO_NOTIFICATION_ACTION_LIST_BUT_Edit}",
			press: [oController.handleEdit, oController],
			lite: false,
			enabled: "{property>/actions/update/enabled}"
		});
	    return [this._oEditButton];
	},
	
	createColumns: function() {
	    var oController = this.getController();
	    var oDateType = new sap.ui.model.type.Date();
	    
	    return [sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("ACTION_CODE"), {
				label: new sap.ui.commons.Label({
					text: "{i18n>BO_NOTIFICATION_ACTION_LIST_COL_ACTION}"
				}),
				template: new sap.ui.commons.Link({
					text: {
					    path: "ACTION_CODE",
					    formatter: function(sActionCode) {
					        return oController.getTextModel().getText(sActionCode + "_TEXT");
					    }
					},
					press: function(oEvent) {
						var oBindingContext = oEvent.getSource().getBindingContext();
						var oBindingObject = oBindingContext.getObject();
						oController.onNavigateToModel(oBindingObject.ID, oBindingObject.ACTION_TYPE_CODE, false);
					}
				})
	    })), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("ACTION_TYPE_CODE"), {
				label: new sap.ui.commons.Label({
					text: "{i18n>BO_NOTIFICATION_ACTION_LIST_COL_ACTION_TYPE}"
				}),
				template: new sap.ui.commons.TextView({
					text: {
					    path: "ACTION_TYPE_CODE",
					    formatter: function(sActionTypeCode) {
					        return ["SYSTEM", "FOLLOW"].indexOf(sActionTypeCode) > -1
					                ? oController.getTextModel().getText("BO_NOTIFICATION_ACTION_LIST_COL_SYSTEM_ACTION")
					                : oController.getTextModel().getText("BO_NOTIFICATION_ACTION_LIST_COL_CAMPAIGN_ACTION");
					    }
					}
				})
	    })), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("ALLOW_INBOX_NOTIFICATION"), {
				label: new sap.ui.commons.Label({
					text: "{i18n>BO_NOTIFICATION_ACTION_LIST_COL_INBOX_NOTIFICATION}"
				}),
				template: new sap.ui.commons.CheckBox({
					checked: {
					    path: "ALLOW_INBOX_NOTIFICATION",
					    formatter: function(iChecked) {
					        return !!iChecked;
					    }
					},//"{= !!${ALLOW_INBOX_NOTIFICATION}}",
					enabled: false
				})
		})), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("ALLOW_EMAIL_NOTIFICATION"), {
				label: new sap.ui.commons.Label({
					text: "{i18n>BO_NOTIFICATION_ACTION_LIST_COL_MAIL_NOTIFICATION}"
				}),
				template: new sap.ui.commons.CheckBox({
					checked: {
					    path: "ALLOW_EMAIL_NOTIFICATION",
					    formatter: function(iChecked) {
					        return !!iChecked;
					    }
					}, //"{= !!${ALLOW_MAIL_NOTIFICATION}}",
					enabled: false
				})
		})), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("CHANGED_AT"), {
				label: new sap.ui.commons.Label({
					text: "{i18n>BO_NOTIFICATION_ACTION_LIST_COL_CHANGED_AT}"
				}),
				template: new sap.ui.commons.TextView({
					text: {
					    path: "CHANGED_AT",
					    type : oDateType
					}
				})
		})), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("CHANGED_BY"), {
				label: new sap.ui.commons.Label({
					text: "{i18n>BO_NOTIFICATION_ACTION_LIST_COL_CHANGED_BY}"
				}),
				template: new sap.ui.commons.TextView({
					text: "{CHANGED_BY}"
				})
		}))];
	},
	
	createDetailsView: function() {
	    return sap.ui.jsview("sap.ui.ino.views.backoffice.config.NotificationActionListDetail");
	}
}));