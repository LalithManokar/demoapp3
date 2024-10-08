/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.controls.IFrame");
jQuery.sap.require("sap.ui.ino.views.common.GenericControl");
jQuery.sap.require("sap.ui.ino.models.types.IntBooleanType");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.NotificationActionWithTemplateFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {
    
    getControllerName: function() {
		return "sap.ui.ino.views.backoffice.config.NotificationActionWithTemplateFacet";
	},
	
	createFacetContent: function(oController) {
	    var bEdit = oController.isInEditMode();

		var oGroupGeneral = this.createGeneralGroup(bEdit);
		var oGroupPreview = this.createPreviewGroup(bEdit);
		return [oGroupGeneral, oGroupPreview];
	},
	
	createGeneralGroup: function(bEdit) {
	    var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 5,
			widths: ['15%', '25%', '15%', '25%', 'auto']
		});

		this.createGeneralContent(oLayout, bEdit);

		return new sap.ui.ux3.ThingGroup({
			title: this.getController().getTextPath("BO_NOTIFICATION_ACTION_FACET_GENERAL_INFO_TIT"),
			content: [
    			oLayout, 
    			new sap.ui.core.HTML({
    				content: "<br/>",
    				sanitizeContent: true
    			})
    		],
			colspan: true
		});
	},
	
	createPreviewGroup: function(bEdit) {
	    var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 3,
			widths: ['15%', '65%', 'auto'],
			visible: {
			    path: this.getFormatterPath("/ALLOW_EMAIL_NOTIFICATION"),
			    type: new sap.ui.ino.models.types.IntBooleanType()
			}
		});

		this.createPreviewContent(oLayout, bEdit);

		return new sap.ui.ux3.ThingGroup({
			title: this.getController().getTextPath("BO_NOTIFICATION_ACTION_FACET_PREVIEW_INFO_TIT"),
			content: [oLayout, new sap.ui.core.HTML({
				content: "<br/>",
				sanitizeContent: true
			})],
			colspan: true
		});
	},
	
	createGeneralContent: function(oLayout, bEdit) {
	    this._createGeneralSimpleContent(oLayout, bEdit);
	    this._createTemplateReciverContent(oLayout, bEdit);
	},
	
	_createGeneralSimpleContent: function(oLayout, bEdit) {
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
			text: {
			    path: "applicationObject>/ACTION_CODE"
			},
			width: "100%",
			wrapping: false,
			ariaLabelledBy: oTechNameLabel
		});
		
		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
		    cells: [
		        new sap.ui.commons.layout.MatrixLayoutCell({
    				content: oActionNameLabel
    			}),
    			new sap.ui.commons.layout.MatrixLayoutCell({
    				content: oActionNameField
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
		    cells: [
		        new sap.ui.commons.layout.MatrixLayoutCell({
    				content: oInboxLabel
    			}),
    			new sap.ui.commons.layout.MatrixLayoutCell({
    				content: oInboxField
    			}),
    			new sap.ui.commons.layout.MatrixLayoutCell({
    				content: oMailLabel
    			}),
    			new sap.ui.commons.layout.MatrixLayoutCell({
    				content: oMailField
    			})
			]
		});
		
		oLayout.addRow(oRow);
	},
	
	_createTemplateReciverContent: function(oLayout, bEdit) {
	    this._oTemplateReceiverLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 5,
			widths: ['15%', '25%', '15%', '25%', 'auto'],
			visible: {
			    path: this.getFormatterPath("/ALLOW_EMAIL_NOTIFICATION"),
			    type: new sap.ui.ino.models.types.IntBooleanType()
			}
		});
	    
	    var oTemplateLabel = this.createControl({
	        Type: "label",
			Text: "BO_NOTIFICATION_ACTION_FACET_LABEL_MAIL_TEMPLATE",
			Tooltip: "BO_NOTIFICATION_ACTION_FACET_LABEL_MAIL_TEMPLATE"
	    }).setWidth("100%");

        var oTemplateField = this.createDropDownBoxForCode({
	        Path : this.getFormatterPath("EMAIL_TEMPLATE_CODE", true),
	        CodeTable : "sap.ino.xs.object.notification.MailTemplate.Root",
	        Editable : false,
            LabelControl : oTemplateLabel
	    });

	    var oTextModuleLabel = this.createControl({
	        Type: "label",
			Text: "BO_NOTIFICATION_ACTION_FACET_LABEL_MAIL_TEXTMODULE",
			Tooltip: "BO_NOTIFICATION_ACTION_FACET_LABEL_MAIL_TEXTMODULE"
	    }).setWidth("100%");
	    this._oTextModuleDropdown = this.createDropDownBoxForCode({
	        Path : this.getFormatterPath("TEXT_MODULE_CODE", true),
	        CodeTable : "sap.ino.xs.object.basis.TextModule.Root",
	        Editable : bEdit,
	        WithEmpty : true,
            LabelControl : oTextModuleLabel
	    });
	    var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
	        cells: [
                new sap.ui.commons.layout.MatrixLayoutCell({
    				content: oTemplateLabel
    			}),
    			new sap.ui.commons.layout.MatrixLayoutCell({
    				content: oTemplateField
    			}),
    			new sap.ui.commons.layout.MatrixLayoutCell({
    				content: oTextModuleLabel
    			}),
    			new sap.ui.commons.layout.MatrixLayoutCell({
    				content: this._oTextModuleDropdown
    			})
            ]
	    });
	    this._oTemplateReceiverLayout.addRow(oRow);
	    
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
        
        oRow = new sap.ui.commons.layout.MatrixLayoutRow({
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
	    
	    oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
	        cells: [
	            new sap.ui.commons.layout.MatrixLayoutCell({
    				content: this._oTemplateReceiverLayout,
    				colSpan: 5
    			})
	        ]
	    }));
	},
	
	createPreviewContent: function(oLayout) {
	    var oLanguageLabel = this.createControl({
	        Type: "label",
			Text: "BO_NOTIFICATION_ACTION_FACET_LABEL_LANGUAGE",
			Tooltip: "BO_NOTIFICATION_ACTION_FACET_LABEL_LANGUAGE"
	    }).setWidth("100%");

        this._oLanguageList = new sap.ui.commons.DropdownBox({
            selectedKey : "{applicationObject>/previewLang}",
            width : "100%",
            items: {
                path: "code>/sap.ino.xs.object.basis.Language.Root",
                template: new sap.ui.core.ListItem({
                    key: "{code>ISO_CODE}",
                    text: "{code>DEFAULT_TEXT}"
                }),
                parameters: {
                    includeEmptyCode : true
                }
            },
            ariaLabelledBy : oLanguageLabel
        });
        
        var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
            cells: [
                new sap.ui.commons.layout.MatrixLayoutCell({
    				content: oLanguageLabel
    			}),
    			new sap.ui.commons.layout.MatrixLayoutCell({
    				content: this._oLanguageList
    			})
            ]
        });
        
        oLayout.addRow(oRow);
        
        var oReceiverLabel = this.createControl({
	        Type: "label",
			Text: "BO_NOTIFICATION_ACTION_FACET_LABEL_RECEIVER",
			Tooltip: "BO_NOTIFICATION_ACTION_FACET_LABEL_RECEIVER"
	    }).setWidth("100%");
	    
	    this._oReceiverField = new sap.ui.commons.DropdownBox({
            width: "100%",
            selectedKey: "{applicationObject>/previewRole}",
            items: {
                path: "applicationObject>/receivedRoles",
                template: new sap.ui.core.ListItem({
                    key: "{applicationObject>}",
                    text: {
                        path: 'applicationObject>',
                        formatter: this._formatRoleCodeName.bind(this)
                    }//"{applicationObject>}"
                })
            },
            ariaLabelledBy: oReceiverLabel
        });
        
        oRow = new sap.ui.commons.layout.MatrixLayoutRow({
            cells: [
                new sap.ui.commons.layout.MatrixLayoutCell({
    				content: oReceiverLabel
    			}),
    			new sap.ui.commons.layout.MatrixLayoutCell({
    				content: this._oReceiverField
    			})
            ]
        });
        
        oLayout.addRow(oRow);
        
        var oPreviewLabel = this.createControl({
	        Type: "label",
			Text: "BO_NOTIFICATION_ACTION_FACET_LABEL_TEMP_PREVIEW",
			Tooltip: "BO_NOTIFICATION_ACTION_FACET_LABEL_TEMP_PREVIEW"
	    });
	    
	    this._oPreviewField = new sap.ui.ino.controls.IFrame({
            height: "450px"
        });
        
        oPreviewLabel.setLabelFor(this._oPreviewField);
        
        oRow = new sap.ui.commons.layout.MatrixLayoutRow({
            cells: [
                new sap.ui.commons.layout.MatrixLayoutCell({
    				content: oPreviewLabel,
    				vAlign: "Top"
    			}),
    			new sap.ui.commons.layout.MatrixLayoutCell({
    				content: this._oPreviewField,
    				height: "450px"
    			})
            ]
        });
        
        oLayout.addRow(oRow);
	},
	
	createDropDownBoxForCode: function(oSettings) {
	    if (!oSettings.View) {
            oSettings.View = this;
        }
	    return sap.ui.ino.views.common.GenericControl.createDropDownBoxForCode(oSettings);
	},
	
	_receiverBindingChange: function(isEdit) {
	    this._oReceiverList.getBinding("items").attachChange(function() {
	        this._createReceiverTokenizer(isEdit);
	    }, this);
    },
    _createReceiverTokenizer: function(isEdit) {
        var that =this;
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