/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.views.common.GenericControl");
jQuery.sap.require("sap.ui.ino.controls.ContentPane");
jQuery.sap.require("sap.ui.ino.application.ControlFactory");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.TextModuleDefinitionFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {

    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.config.TextModuleDefinitionFacet";
    },

    onShow : function() {
        this.getController()._initialLanguageBinding();
    },

    createFacetContent : function(oController) {
        var bEdit = oController.isInEditMode();

        var oGeneralDataLayout = new sap.ui.commons.layout.MatrixLayout({
            columns : 4,
            widths : ["100px", "150px", "100px", "40%"]
        });

        oGeneralDataLayout.addRow(this._createTitleRow(bEdit));
        oGeneralDataLayout.addRow(this._createCodeRow(bEdit));
        
        var oGenaralGroup = new sap.ui.ux3.ThingGroup({
            title : this.getController().getTextPath("BO_VALUE_OPTION_LIST_TIT_GENERAL_INFO"),
            content : [oGeneralDataLayout, new sap.ui.core.HTML({
                content : "<br/>",
                sanitizeContent : true
            })],
            colspan : true
        });
        
        var oTemplateLayout = new sap.ui.commons.layout.MatrixLayout({
            columns : 4,
            widths : ["100px", "100%"]
        });

        oTemplateLayout.addRow(this._createLanguageRow(bEdit));
        oTemplateLayout.addRow(this._createTemplateRow(bEdit));

        var oTemplateGroup = new sap.ui.ux3.ThingGroup({
            title : this.getController().getTextPath("BO_TEXT_MODULE_TIT_TEMPLATE_INFO"),
            content : [oTemplateLayout, new sap.ui.core.HTML({
                content : "<br/>",
                sanitizeContent : true
            })],
            colspan : true
        });

        return [oGenaralGroup, oTemplateGroup];
    },
    
    _createTitleRow : function(bEdit) {
        var oNameLabel = this.createControl({
            Type : "label",
            Text : "BO_TEXT_MODULE_FLD_DEFAULT_TEXT",
            Tooltip : "BO_TEXT_MODULE_FLD_DEFAULT_TEXT"
        });

        var oNameField;
        if(bEdit) {
            oNameField = this.createControl({
                Type : "textfield",
                Text : "/DEFAULT_TEXT",
                LabelControl : oNameLabel
            });
        } else {
            oNameField = new sap.ui.commons.Label({
                text: this.getBoundPath("/DEFAULT_TEXT", false)
            }).addStyleClass("sapUiInoTILabelPadding");
        }

        var oDescriptionLabel = this.createControl({
            Type : "label",
            Text : "BO_MAIL_TEMPLATE_FLD_DEFAULT_LONG_TEXT",
            Tooltip : "BO_MAIL_TEMPLATE_FLD_DEFAULT_LONG_TEXT"
        });

        var oDescriptionField = this.createControl({
            Type : "textarea",
            Text : "/DEFAULT_LONG_TEXT",
            Editable : bEdit,
            LabelControl : oDescriptionLabel
        });

        return new sap.ui.commons.layout.MatrixLayoutRow({
            cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                content : oNameLabel,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            }), new sap.ui.commons.layout.MatrixLayoutCell({
                content : oNameField,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            }), new sap.ui.commons.layout.MatrixLayoutCell({
                content : oDescriptionLabel,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Center,
                rowSpan : 2
            }), new sap.ui.commons.layout.MatrixLayoutCell({
                content : oDescriptionField,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin,
                rowSpan : 2
            })]
        });
    },
    
    _createCodeRow : function(bEdit) {
        var oCodeLabel = this.createControl({
            Type : "label",
            Text : "BO_TEXT_MODULE_FLD_PLAIN_CODE",
            Tooltip : "BO_TEXT_MODULE_FLD_PLAIN_CODE"
        });

        var oCodeField;
        if(bEdit) {
            oCodeField = this.createControl({
                Type : bEdit === true ? "textfield" : "label",
                Text : "/PLAIN_CODE",
                LabelControl : oCodeLabel
            });
        } else {
            oCodeField = new sap.ui.commons.Label({
                text: this.getBoundPath("/PLAIN_CODE", false)
            }).addStyleClass("sapUiInoTILabelPadding");
        }

        return new sap.ui.commons.layout.MatrixLayoutRow({
            cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                content : oCodeLabel,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            }), new sap.ui.commons.layout.MatrixLayoutCell({
                content : oCodeField,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            })]
        });
    },
    
    _createLanguageRow : function() {
        /*
         * Language
         */
        var oLanguageLabel = this.createControl({
            Type : "label",
            Text : "BO_TEXT_MODULE_FLD_LANGUAGE",
            Tooltip : "BO_TEXT_MODULE_FLD_LANGUAGE"
        });

        var oController = this.getController();
        this._oLanguageDropdown = sap.ui.ino.views.common.GenericControl.createDropDownBoxForCode({
            Path : "",
            CodeTable : "sap.ino.xs.object.basis.Language.Root",
            Visible : true,
            onChange : function(oEvent) {
                oController.onLanguageChange(oEvent);
            },
            onLiveChange : function(oEvent) {
                oController.onLanguageChange(oEvent);
            },
            WithEmpty : false,
            LabelControl : oLanguageLabel,
            View : this
        });

        var oView = this;
        oController.getModel().getDataInitializedPromise().done(function() {
            oView._oLanguageDropdown.fireChange({
                newValue : oView._oLanguageDropdown.getSelectedKey()
            });
        });

        var oLanguageContainer = new sap.ui.ino.controls.ContentPane({
            fullsize : false,
            content : this._oLanguageDropdown
        });

        return new sap.ui.commons.layout.MatrixLayoutRow({
            cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                content : oLanguageLabel,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            }), new sap.ui.commons.layout.MatrixLayoutCell({
                content : oLanguageContainer,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            })]
        });
    },
    
    _getLanguageDropdown : function() {
        return this._oLanguageDropdown;
    },
    
    _createTemplateRow : function(bEdit) {
        var oView = this;
        var oController = this.getController();
        
    	var oTemplateLabel = this.createControl({
            Type : "label",
            Text : "BO_TEXT_MODULE_FLD_TEXT",
            Tooltip : "BO_TEXT_MODULE_FLD_TEXT"
        });
    	
    	if (bEdit) {
            this._oModule = sap.ui.ino.application.ControlFactory.createRichTextEditor(undefined, "specialLanguageModel>/TEXT_MODULE", "600px", true, false, false);
            
            // WORKAROUND FOR RTE VALUE BINDING PROBLEM
            oView._oModule.attachChange(function() {
                var sValue = oView._oModule.getValue();
                
                if (oController.getModel() && oController.getModel().getData() && jQuery.type(oController.getModel().getData().TextModuleText) === "array") {
                    var aLang = oController.getModel().getData().TextModuleText;
                    for (var ii = 0; ii < aLang.length; ++ii) {
                        if (aLang[ii].LANG === oView.getThingInspectorController()._sCurrentLanguage) {
                            oController.getModel().setProperty("/TextModuleText/" + ii + "/TEXT_MODULE", sValue);
                            break;
                        }
                    }                                                 
                }
            }, this);
        } else {
            this._oModule = new sap.ui.core.HTML({
                content : {
                    path : this.getFormatterPath("TEXT_MODULE", false),
                    formatter : function(sText) {
                        // content is expected to be wrapped by proper HTML
                        // we ensure this by adding the divs around it
                        return "<div style='word-wrap: break-word;'>" + (sText || "") + "</div>";
                    }
                },
                sanitizeContent : true
            });
        }
    	
        return new sap.ui.commons.layout.MatrixLayoutRow({
            cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                content : oTemplateLabel,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            }), new sap.ui.commons.layout.MatrixLayoutCell({
                content : this._oModule,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            })]
        });
    },
    
    getTextModule : function() {
        return this._oModule;
    }
}));