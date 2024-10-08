/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailView");
jQuery.sap.require("sap.ui.ino.models.util.Table");

sap.ui.jsview("sap.ui.ino.views.backoffice.monitoring.IntegrationMonitorList", jQuery.extend({}, sap.ui.ino.views.common.MasterDetailView, {
        getControllerName: function() {
			return "sap.ui.ino.views.backoffice.monitoring.IntegrationMonitorList";
		},

		hasPendingChanges: function() {
			return this.getController().hasPendingChanges();
		},
		
		createActionButtons: function(oController) {
			this._oDeleteButton = new sap.ui.commons.Button({
				id: this.createId("BUT_DELETE"),
				text: "{i18n>BO_INTEGRATION_MONITOR_LIST_BUT_DELETE}",
				press: [oController.handleDelete, oController],
				lite: false,
				enabled: "{property>/actions/del/enabled}"
			});
			this._oRefreshButton = new sap.ui.commons.Button({
    			id: this.createId("BUT_REFRESH"),
    			text: "{i18n>BO_INTEGRATION_MONITOR_LIST_BUT_REFRESH}",
    			press: [oController.handleRefresh, oController],
    			lite: false,
    			enabled: true
			});
			return [this._oDeleteButton,this._oRefreshButton];
		},
		
		createColumns: function() {
		    return [sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("ID"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_INTEGRATION_MONITOR_LIST_COL_ID}"
					}),
					template: new sap.ui.commons.TextView({
						text: "{ID}"
					})
			})), new sap.ui.table.Column(this.createId("STATUS"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_INTEGRATION_MONITOR_LIST_COL_STATUS}"
					}),
					template: new sap.ui.commons.TextView({
					    text: {
    						path: "STATUS",
    						type: new sap.ui.model.type.Integer(),
    						formatter: function(status) {
							    var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
								if (status === "0") {
									return i18n.getText("BO_INTEGRATION_MONITOR_LIST_STATUS_MSG");
								}else{
								    return status;
								}
							}
					    }
					}),
					sortProperty : "STATUS",
                    filterProperty : "STATUS",
                    filterType : new sap.ui.model.type.Integer()
		    }), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("MESSAGE"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_INTEGRATION_MONITOR_LIST_COL_MESSAGE}"
					}),
					template: new sap.ui.commons.Link({
						text: "{RESPONSE_MESSAGE}",
						press: function(oEvent) {
							var oBindingContext = oEvent.getSource().getBindingContext();
							var oPayLoad = oBindingContext.getObject().RESPONSE_MESSAGE;
						    this._getPayLoadDialog(oPayLoad).open();
						}.bind(this)
					})
			})), new sap.ui.table.Column(this.createId("OBJECT_ID"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_INTEGRATION_MAPPING_LIST_COL_DOCUMENT_ID}"
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
			}), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("PATH"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_INTEGRATION_MAPPING_LIST_COL_PATH}"
					}),
					template: new sap.ui.commons.TextView({
						text: "{PATH}"
					}),
					sortProperty : "PATH",
                    filterProperty : "PATH"
			})), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("DIRECTION_PATH"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_INTEGRATION_MAPPING_LIST_COL_DIRECTION}"
					}),
					template: new sap.ui.commons.TextView({
						text: "{DIRECTION_PATH}"
					}),
					sortProperty : "DIRECTION_PATH",
                    filterProperty : "DIRECTION_PATH"
			})), sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("INTERFACE_NAME"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_INTEGRATION_MAPPING_LIST_COL_INTERFACE_NAME}"
					}),
					template: new sap.ui.commons.TextView({
						text: "{INTERFACE_NAME}"
					}),
					sortProperty : "INTERFACE_NAME",
                    filterProperty : "INTERFACE_NAME"
			})),sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("OPERATOR_BY"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_INTEGRATION_MAPPING_LIST_COL_EXECUTED_BY}"
					}),
					template: new sap.ui.commons.TextView({
						text: "{OPERATOR_BY}"
					}),
					sortProperty : "OPERATOR_BY",
                    filterProperty : "OPERATOR_BY"
			})),sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("OPERATOR_AT"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_INTEGRATION_MAPPING_LIST_COL_EXECUTED_AT}"
					}),
					template: new sap.ui.commons.TextView({
					    text: {
    						path: "OPERATOR_AT",
    						type : new sap.ui.model.type.DateTime()
					    }
					})
			})),sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("OBJECT_PAYLOAD_JSON"), {
					label: new sap.ui.commons.Label({
						text: "{i18n>BO_INTEGRATION_MAPPING_LIST_COL_PAYLOAD}"
					}),
					template: new sap.ui.commons.Link({
						text: "<>",
						press: function(oEvent) {
							var oBindingContext = oEvent.getSource().getBindingContext();
							var oPayLoad = oBindingContext.getObject().OBJECT_PAYLOAD_JSON;
						    this._getPayLoadDialog(oPayLoad).open();
						}.bind(this)
					})
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