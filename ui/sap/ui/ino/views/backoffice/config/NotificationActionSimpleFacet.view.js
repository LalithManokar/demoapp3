/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.NotificationActionSimpleFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {
    
    getControllerName: function() {
		return "sap.ui.ino.views.backoffice.config.NotificationActionSimpleFacet";
	},
	
	createFacetContent: function(oController) {
	    var bEdit = oController.isInEditMode();

		var oGroupGeneral = this.createLayout(bEdit);
		return [oGroupGeneral];
	},
	
	createLayout: function(bEdit) {
	    var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 5,
			widths: ['15%', '25%', '15%', '25%', 'auto']
		});

		this.createGeneralContent(oLayout, bEdit);

		return new sap.ui.ux3.ThingGroup({
			title: this.getController().getTextPath("BO_MODEL_GENERAL_INFO_TIT"),
			content: [oLayout, new sap.ui.core.HTML({
				content: "<br/>",
				sanitizeContent: true
			})],
			colspan: true
		});
	},
	
	createGeneralContent: function(oLayout, bEdit) {
	    var oRow;
	    var that = this;
	    
	    var oActionNameLabel = this.createControl({
	        Type: "label",
			Text: "BO_NOTIFICATION_ACTION_FACET_LABEL_ACTION_NAME",
			Tooltip: "BO_NOTIFICATION_ACTION_FACET_LABEL_ACTION_NAME"
	    }).setWidth("100%");
	    
	    var oActionNameField = new sap.ui.commons.TextView({
			text: {
			    path: "applicationObject>/ACTION_CODE",
			    formatter: function(sActionCode) {
			        return that.getText(sActionCode + "_TEXT");
			    }
			},
			width: "100%",
			wrapping: false,
			ariaLabelledBy: oActionNameLabel
		});
		
		var oTechNameLabel = this.createControl({
	        Type: "label",
			Text: "BO_NOTIFICATION_ACTION_FACET_LABEL_TECH_NAME",
			Tooltip: "BO_NOTIFICATION_ACTION_FACET_LABEL_TECH_NAME"
	    }).setWidth("100%");
	    
	    var oTechNameField = new sap.ui.commons.TextView({
			text: "{applicationObject>/ACTION_CODE}",
			width: "100%",
			wrapping: false,
			ariaLabelledBy: oTechNameLabel
		});
		
		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
            cells: [oActionNameLabel, oActionNameField, oTechNameLabel, oTechNameField].map(function(o) {
                return new sap.ui.commons.layout.MatrixLayoutCell({
    				content: o
    			});
            })
		});
		
		oLayout.addRow(oRow);
		
		var oInboxLabel = this.createControl({
	        Type: "label",
			Text: "BO_NOTIFICATION_ACTION_FACET_LABEL_ALLOW_INBOX_NOTIFICATION",
			Tooltip: "BO_NOTIFICATION_ACTION_FACET_LABEL_ALLOW_INBOX_NOTIFICATION"
	    }).setWidth("100%");
	    
	    var oInboxField = this.createControl({
	        Type: "checkbox",
	        Text: "/ALLOW_INBOX_NOTIFICATION",
	        LabelControl: oInboxLabel,
	        Editable: bEdit
	    });
		
		var oMailLabel = this.createControl({
	        Type: "label",
			Text: "BO_NOTIFICATION_ACTION_FACET_LABEL_ALLOW_MAIL_NOTIFICATION",
			Tooltip: "BO_NOTIFICATION_ACTION_FACET_LABEL_ALLOW_MAIL_NOTIFICATION"
	    }).setWidth("100%");
	    
	    var oMailField = this.createControl({
	        Type: "checkbox",
	        Text: "/ALLOW_EMAIL_NOTIFICATION",
	        LabelControl: oMailLabel,
	        Editable: bEdit
	    });
		
		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
		    cells: [oInboxLabel, oInboxField, oMailLabel, oMailField].map(function(o) {
                return new sap.ui.commons.layout.MatrixLayoutCell({
    				content: o
    			});
            })
		});
		
		oLayout.addRow(oRow);
	}
}));