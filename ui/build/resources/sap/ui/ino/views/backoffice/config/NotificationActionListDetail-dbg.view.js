/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */

sap.ui.jsview("sap.ui.ino.views.backoffice.config.NotificationActionListDetail", {
    getControllerName: function() {
        return "sap.ui.ino.views.backoffice.config.NotificationActionListDetail";
    },
    
    createContent: function() {
        var oLayout = new sap.ui.commons.layout.MatrixLayout({
            columns: 5,
            widths: ['10%', '15%', '10%', '15%', 'auto']
        });
        
        this._createGeneralContent(oLayout);
        
        // This is important to take the full height of the shell content
		this.setHeight('100%');
		// this avoids scrollbars for 100% height
		this.setDisplayBlock(true);

		var oPanel = new sap.ui.commons.Panel({
			content: oLayout,
			showCollapseIcon: false,
			areaDesign: sap.ui.commons.enums.AreaDesign.Plain,
			borderDesign: sap.ui.commons.enums.BorderDesign.None,
			text: "{i18n>BO_NOTIFICATION_ACTION_LIST_DETAIL_HEADER}"
		});

		return oPanel;
    },
    
    _createGeneralContent: function(oLayout) {
        var oController = this.getController();
        // action name & created at
        oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
            cells:[].concat(this._createTextElement(
                    "i18n>BO_NOTIFICATION_ACTION_LIST_DETAIL_LABEL_ACTION_NAME",
                    "ACTION_CODE",
                    function(sActionCode) {
    			        return oController.getText(sActionCode + "_TEXT");
    			    }
                )).concat(this._createTextElement(
                    "i18n>BO_NOTIFICATION_ACTION_LIST_DETAIL_LABEL_CREATED_AT",
                    "CREATED_AT",
                    undefined,
                    new sap.ui.model.type.Date()
                ))
        }));
        // tech name & created by
        oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
            cells:[].concat(this._createTextElement(
                    "i18n>BO_NOTIFICATION_ACTION_LIST_DETAIL_LABEL_TECH_NAME",
                    "ACTION_CODE"
                )).concat(this._createTextElement(
                    "i18n>BO_NOTIFICATION_ACTION_LIST_DETAIL_LABEL_CREATED_BY",
                    "CREATED_BY"
                ))
        }));
        // mail notification & changed at
        oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
            cells:[].concat(this._createCheckboxElement(
                    "i18n>BO_NOTIFICATION_ACTION_LIST_DETAIL_LABEL_MAIL_NOTIFICATION",
                    "ALLOW_EMAIL_NOTIFICATION"
                )).concat(this._createTextElement(
                    "i18n>BO_NOTIFICATION_ACTION_LIST_DETAIL_LABEL_CHANGED_AT",
                    "CHANGED_AT",
                    undefined,
                    new sap.ui.model.type.Date()
                ))
        }));
        // inbox notification & changed by
        oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
            cells:[].concat(this._createCheckboxElement(
                    "i18n>BO_NOTIFICATION_ACTION_LIST_DETAIL_LABEL_INBOX_NOTIFICATION",
                    "ALLOW_INBOX_NOTIFICATION"
                )).concat(this._createTextElement(
                    "i18n>BO_NOTIFICATION_ACTION_LIST_DETAIL_LABEL_CHANGED_BY",
                    "CHANGED_BY"
                ))
        }));
    },
    
    _createTextElement: function(sLabelPath, sContentPath, fnContentFormatter, oDataType) {
        oDataType = oDataType || new sap.ui.model.type.String();
        var oLabel = new sap.ui.commons.Label({
			text: {
			    path: sLabelPath
			},
			tooltip: {
			    path: sLabelPath
			},
			design: sap.ui.commons.LabelDesign.Bold,
			width: "100%"
		});
		
		var oContentOptions = {
		    text: {
			    path: sContentPath,
			    type: oDataType
			},
			width: "100%",
			wrapping: false
		};
		if (fnContentFormatter) {
		    oContentOptions.text.formatter = fnContentFormatter;
		}
		var oContent = new sap.ui.commons.TextView(oContentOptions);
		
		return [new sap.ui.commons.layout.MatrixLayoutCell({
		    content: [oLabel]
		}), new sap.ui.commons.layout.MatrixLayoutCell({
		    content: [oContent]
		})];
    },
    _createCheckboxElement: function(sLabelPath, sContentPath) {
        var oLabel = new sap.ui.commons.Label({
			text: {
			    path: sLabelPath
			},
			tooltip: {
			    path: sLabelPath
			},
			design: sap.ui.commons.LabelDesign.Bold,
			width: "100%"
		});
		
		var oContent = new sap.ui.commons.CheckBox({
		    checked: {
		        path: sContentPath,
		        formatter: function(iChekced) {
		            return !!iChekced;
		        } 
		    },
		    enabled: false
		});
		
		return [new sap.ui.commons.layout.MatrixLayoutCell({
		    content: [oLabel]
		}), new sap.ui.commons.layout.MatrixLayoutCell({
		    content: [oContent]
		})];
    }
});