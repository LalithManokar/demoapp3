/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailView");
jQuery.sap.require("sap.ui.ino.models.util.Table");

sap.ui.jsview("sap.ui.ino.views.backoffice.monitoring.NotificationsEmailMonitorList", jQuery.extend({}, sap.ui.ino.views.common.MasterDetailView, {
        getControllerName: function() {
			return "sap.ui.ino.views.backoffice.monitoring.NotificationsEmailMonitorList";
		},

		hasPendingChanges: function() {
			return this.getController().hasPendingChanges();
		},
		
		createActionButtons: function(oController) {
		    this._oResendButton = new sap.ui.commons.Button({
				id: this.createId("BUT_RESEND"),
				text: "{i18n>BO_NOTIFICATION_MONITOR_LIST_BUT_RESEND}",
				press: [oController.handleResend, oController],
				lite: false,
				enabled: true
			});
			this._oDeleteButton = new sap.ui.commons.Button({
				id: this.createId("BUT_DELETE"),
				text: "{i18n>BO_NOTIFICATION_MONITOR_LIST_BUT_DELETE}",
				press: [oController.handleDelete, oController],
				lite: false,
				enabled: "{property>/actions/del/enabled}"
			});
			this._oRefreshButton = new sap.ui.commons.Button({
    			id: this.createId("BUT_REFRESH"),
    			text: "{i18n>BO_NOTIFICATION_MONITOR_LIST_BUT_REFRESH}",
    			press: [oController.handleRefresh, oController],
    			lite: false,
    			enabled: true
			});
			return [this._oDeleteButton,this._oRefreshButton,this._oResendButton];
		},
		
		createColumns: function() {
		    return [sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("EMAIL_ACTION_CODE"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_NOTIFICATION_MONITOR_LIST_COL_ACTION}"
					}),
					template: new sap.ui.commons.TextView({
						text: "{ACTION_CODE}"
					}),
                    filterProperty : "ACTION_CODE",
                    sortProperty : "ACTION_CODE"
			})), new sap.ui.table.Column(this.createId("EMAIL_STATUS"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_NOTIFICATION_MONITOR_LIST_COL_STATUS}"
					}),
					template: new sap.ui.commons.TextView({
					    text: "{MAIL_STATUS_CODE}"
					}),
                    filterProperty : "MAIL_STATUS_CODE",
                    sortProperty : "MAIL_STATUS_CODE"
		    }), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("EMAIL_STATUS_REASON"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_NOTIFICATION_MONITOR_LIST_COL_STATUS_REASON}"
					}),
					template: new sap.ui.commons.TextView({
						text: "{MAIL_STATUS_REASON}"
					}),
                    filterProperty : "MAIL_STATUS_REASON",
                    sortProperty : "MAIL_STATUS_REASON"
			})), new sap.ui.table.Column(this.createId("EMAIL_SEND_AT"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_NOTIFICATION_MONITOR_LIST_COL_SEND_AT}"
					}),
					template: new sap.ui.commons.TextView({
					    text: {
    						path: "SENTAT",
    						type : new sap.ui.model.type.DateTime()
					    }
					}),
					sortProperty : "SENTAT"
			}), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("MAIL_RECIPIENT"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_NOTIFICATION_MONITOR_LIST_COL_MAIL_RECIPIENT}"
					}),
					template: new sap.ui.commons.TextView({
						text: "{MAILRECIPIENT}"
					}),
                    filterProperty : "MAILRECIPIENT",
					sortProperty : "MAILRECIPIENT"
			})),sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("ROLE_CODE"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_NOTIFICATION_MONITOR_LIST_COL_ROLE_CODE}"
					}),
					template: new sap.ui.commons.TextView({
						text: "{ROLE_CODE}"
					})
			})), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("OBJECT_TYPE"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_NOTIFICATION_MONITOR_LIST_COL_OBJECT_TYPE}"
					}),
					template: new sap.ui.commons.TextView({
						text: "{OBJECT_TYPE_CODE}"
					}),
					filterProperty : "OBJECT_TYPE_CODE",
					sortProperty : "OBJECT_TYPE_CODE"
			})), new sap.ui.table.Column(this.createId("OBJECT_ID"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_NOTIFICATION_MONITOR_LIST_COL_OBJECT_ID}"
					}),
					template: new sap.ui.commons.TextView({
					    text: {
    						path: "OBJECT_ID",
    						type : new sap.ui.model.type.Integer()
					    }
					}),
					sortProperty : "OBJECT_ID",
                    filterProperty : "OBJECT_ID",
                    filterType : new sap.ui.model.type.Integer()
			}),new sap.ui.table.Column(this.createId("CAMPAIGN_ID"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_NOTIFICATION_MONITOR_LIST_COL_CAMPAIGN_ID}"
					}),
					template: new sap.ui.commons.TextView({
					    text: {
    						path: "CAMPAIGN_ID",
    						type : new sap.ui.model.type.Integer()
					    }
					}),
					sortProperty : "CAMPAIGN_ID",
					filterProperty : "CAMPAIGN_ID",
					filterType : new sap.ui.model.type.Integer()
			}),sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("CAMPAIGN_NAME"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_NOTIFICATION_MONITOR_LIST_COL_CAMPAIGN_NAME}"
					}),
					template: new sap.ui.commons.TextView({
					    text: "{CAMPAIGN_NAME}"
					}),
					filterProperty : "CAMPAIGN_NAME",
					sortProperty : "CAMPAIGN_NAME"
			}))];
		},
		
		createDetailsView: function() {
		    return null;
		},
		
		_getPayLoadDialog: function(oPayLoad) {
			this._oPayLoadDialog = new sap.m.Dialog({
				showHeader: false,
				buttons: [
				    new sap.m.Button({
						text: '{i18n>BO_INTEGRATION_MAPPING_IMPORT_BUT_FORMAT}',
						press: this.handlePayLoadFormat.bind(this)
					}),
	                new sap.m.Button({
						text: '{i18n>BO_INTEGRATION_MAPPING_IMPORT_BUT_CANCEL}',
						press: this.handlePayLoadCancel.bind(this)
					})
	            ]
			});
			this._oPayLoadContent = new sap.m.TextArea({
	            rows: 30,
	            cols: 100
	        });
	        this._oPayLoadContent.setValue(oPayLoad);
	        this._oPayLoadDialog.addContent(this._oPayLoadContent);
	
			return this._oPayLoadDialog;
		},
		
		handlePayLoadFormat: function() {
			var sJSONStr = this._oPayLoadContent.getValue();
			this._oPayLoadContent.setValue(JSON.stringify(JSON.parse(sJSONStr), null, 4));
		},
		
		handlePayLoadCancel: function() {
		    this._oPayLoadDialog.close();
		}
		
}));