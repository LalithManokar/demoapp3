/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.model.Filter");
jQuery.sap.require("sap.ui.model.Sorter");
jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.NotificationActionStatusModelFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {
    
    getControllerName: function() {
		return "sap.ui.ino.views.backoffice.config.NotificationActionStatusModelFacet";
	},
	
	createFacetContent: function(oController) {
	    var bEdit = oController.isInEditMode();

		var oGroupGeneral = this.createGeneralGroup(bEdit);
		var oGroupPreview = this.createStatusModelwGroup(bEdit);
		return [oGroupGeneral,oGroupPreview];
	},
	
	createGeneralGroup: function(bEdit) {
	    var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 5,
			widths: ['15%', '25%', '15%', '25%', 'auto']
		});
		
		var that = this;
		
		var oActionLabel = this.createControl({
	        Type: "label",
			Text: "BO_NOTIFICATION_ACTION_FACET_LABEL_ACTION_NAME",
			Tooltip: "BO_NOTIFICATION_ACTION_FACET_LABEL_ACTION_NAME"
	    }).setWidth("100%");
	    
	    var oActionField = new sap.ui.commons.TextView({
			text: {
			    path: "applicationObject>/ACTION_CODE",
			    formatter: function(sActionCode) {
			        return that.getText(sActionCode + "_TEXT");
			    }
			},
			width: "100%",
			wrapping: false,
			ariaLabelledBy: oActionLabel
		});
		
		var oTechNameLabel = this.createControl({
	        Type: "label",
			Text: "BO_NOTIFICATION_ACTION_LIST_DETAIL_LABEL_TECH_NAME",
			Tooltip: "BO_NOTIFICATION_ACTION_LIST_DETAIL_LABEL_TECH_NAME"
	    }).setWidth("100%");
	    
	    var oTechNameField = new sap.ui.commons.TextView({
			text: "{applicationObject>/ACTION_CODE}",
			width: "100%",
			wrapping: false,
			ariaLabelledBy: oTechNameLabel
		});
		
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
		    cells: [
		        new sap.ui.commons.layout.MatrixLayoutCell({
    				content: oActionLabel
    			}),
    			new sap.ui.commons.layout.MatrixLayoutCell({
    				content: oActionField
    			}),
    			new sap.ui.commons.layout.MatrixLayoutCell({
    				content: oTechNameLabel
    			}),
    			new sap.ui.commons.layout.MatrixLayoutCell({
    				content: oTechNameField
    			})
			]
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
	    this.createTemplateReciverContent(bEdit);
		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
	        cells: [
	            new sap.ui.commons.layout.MatrixLayoutCell({
    				content: this._oTemplateReceiverLayout,
    				colSpan: 5
    			})
	        ]
	    }));
		
		
		return new sap.ui.ux3.ThingGroup({
			title: this.getController().getTextPath("BO_NOTIFICATION_ACTION_FACET_GENERAL_INFO_TIT"),
			content: [oLayout, new sap.ui.core.HTML({
				content: "<br/>",
				sanitizeContent: true
			})],
			colspan: true
		});
	},
	createTemplateReciverContent: function(bEdit){
     this._oTemplateReceiverLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 5,
			widths: ['15%', '25%', '15%', '25%', 'auto'],
			visible: {
			    path: this.getFormatterPath("/ALLOW_EMAIL_NOTIFICATION"),
			    type: new sap.ui.ino.models.types.IntBooleanType()
			}
		});
	    
	    
	    var oReceiverLabel = this.createControl({
	        Type: "label",
			Text: "BO_NOTIFICATION_ACTION_FACET_LABEL_MAIL_RECEIVER",
			Tooltip: "BO_NOTIFICATION_ACTION_FACET_LABEL_MAIL_RECEIVER"
	    }).setWidth("100%");
	    
	    var oReceiverList = new sap.m.MultiComboBox({
            selectedKeys : "{applicationObject>/receivedRoles}",
            visible : bEdit,
            selectionChange : function(oEvent) {
                var oChangedItem = oEvent.getParameter("changedItem");
                var bSelected = oEvent.getParameter("selected");
                var oTokenizer = oEvent.getSource().data("relControl");
                if (bSelected) {
                    oTokenizer.addToken(new sap.m.Token({
                        key: oChangedItem.getKey(),
                        text: oChangedItem.getText()
                    }));
                } else {
                    var oDelToken = oTokenizer.getTokens().filter(function(oToken) {
                        return oToken.getKey() === oChangedItem.getKey();
                    })[0];
                    oTokenizer.removeToken(oDelToken);
                }
            },
            ariaLabelledBy : oReceiverLabel
        });
        
        this._oReceiverList = oReceiverList;
        
        oReceiverList.bindItems({
            path: "applicationObject>/Receivers",
            template: new sap.ui.core.ListItem({
				text: '{applicationObject>ROLE_NAME}',
				key: '{applicationObject>ROLE_CODE}'
			})
        });
        oReceiverList.addStyleClass("sapUiInoSettingsMultiComboBox");
        
        setTimeout(this._receiverBindingChange.bind(this), 0, bEdit);
        
        var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
	        cells: [
                new sap.ui.commons.layout.MatrixLayoutCell({
    				content: oReceiverLabel,
    				vAlign: "Top"
    			}),
    			new sap.ui.commons.layout.MatrixLayoutCell({
    				content: [oReceiverList],
    				colSpan: 3
    			})
            ]
	    }).addStyleClass("sapUiInoSettingsRow");
	    
	    this._oTemplateReceiverLayout.addRow(oRow);
	},
	createStatusModelwGroup: function() {
	    var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 5,
			widths: ['15%', '25%', '15%', '25%', 'auto']
		});
		
		var oNoteText = this.createControl({
	        Type: "label",
			Text: "BO_NOTIFICATION_ACTION_FACET_STATUS_MODEL_NOTES",
			Tooltip: "BO_NOTIFICATION_ACTION_FACET_STATUS_MODEL_NOTES"
	    });
	    
	    var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
		    cells: [
		        new sap.ui.commons.layout.MatrixLayoutCell({
    				content: oNoteText,
    				colSpan: 4
    			})
			]
		});
		
		oLayout.addRow(oRow);
		
		var oStatusModelTbl = new sap.ui.table.Table({
			selectionMode: 'Single',
			columns: [
	           new sap.ui.table.Column({
					label: '{i18n>BO_NOTIFICATION_ACTION_FACET_STATUS_MODEL_COL_TECH_NAME}',
					template: new sap.m.Link({
						text: {
						    path: "CODE",
							formatter: sap.ui.ino.views.backoffice.config.Util.formatPlainCode
						},
						press: function(oEvent) {
						    var iId = oEvent.getSource().getBindingContext().getObject().ID;
						    if (iId > 0) {
						        sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow("configstatusmodel", {
    								id: iId,
    								edit: false
    							});
						    }
						},
						wrapping: false
					}),
					width: '40%'
				}),
	           new sap.ui.table.Column({
					label: '{i18n>BO_NOTIFICATION_ACTION_FACET_STATUS_MODEL_COL_PACKAGE}',
					template: new sap.m.Text({
						text: '{PACKAGE_ID}',
						tooltip: '{PACKAGE_ID}',
						wrapping: false
					}),
					width: '30%'
				}),
	           new sap.ui.table.Column({
					label: '{i18n>BO_NOTIFICATION_ACTION_FACET_STATUS_MODEL_COL_NAME}',
					template: new sap.m.Text({
						text: '{DEFAULT_TEXT}',
						tooltip: '{DEFAULT_TEXT}',
						wrapping: false
					}),
					width: '30%'
				})
	       ]
		});
		
		oStatusModelTbl.bindRows({
			path: "/SearchStagingStatusModelParams(searchToken='')/Results",
			filters: [
			    new sap.ui.model.Filter("OBJECT_TYPE_CODE", "EQ", "IDEA")
			],
			sorter: new sap.ui.model.Sorter("CODE", false)
		});
		
		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
		    cells: [
		        new sap.ui.commons.layout.MatrixLayoutCell({
    				content: oStatusModelTbl,
    				colSpan: 4
    			})
			]
		});
		
		oLayout.addRow(oRow);
		
		
		return new sap.ui.ux3.ThingGroup({
			title: this.getController().getTextPath("BO_NOTIFICATION_ACTION_FACET_STATUS_MODELS_INFO_TIT"),
			content: [oLayout, new sap.ui.core.HTML({
				content: "<br/>",
				sanitizeContent: true
			})],
			colspan: true
		});
	},
	_receiverBindingChange: function(isEdit) {
	    this._oReceiverList.getBinding("items").attachChange(function() {
	        this._createReceiverTokenizer(isEdit);
	    }, this);
    },	
    _createReceiverTokenizer: function(isEdit) {
        var that = this;
        if (!this._oReceiverList.data("relControl")) {
            var oReceiverTokenizer = new sap.m.Tokenizer({
                tokens: this._oReceiverList.getSelectedItems().map(function(oItem) {
                    return new sap.m.Token({
                        key: oItem.getKey(),
                        text: that._formatRoleCodeName(oItem.getKey()),
                        editable: isEdit
                    });
                })
            });
            oReceiverTokenizer.addStyleClass("sapUiInoSettingsTokenizerWrap");
            oReceiverTokenizer.attachTokenUpdate(function(oEvent) {
                var aRemovedTokens = oEvent.getParameter("removedTokens");
                if (aRemovedTokens.length > 0) {
                    var aSelectedItems = this._oReceiverList.getSelectedItems().filter(function(oItem) {
                        return oItem.getKey() !== aRemovedTokens[0].getKey();
                    });
                    this._oReceiverList.setSelectedItems(aSelectedItems);
                    this._oReceiverList.fireSelectionFinish({
                        selectedItems: aSelectedItems
                    });
                }
            }, this);
            this._oReceiverList.data("relControl", oReceiverTokenizer);
            this._oReceiverList.getParent().addContent(oReceiverTokenizer);
        }
    },    
	_formatRoleCodeName: function(sRoleCode) {
        return this.getText('BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_ROLE_' + sRoleCode);
    }
}));