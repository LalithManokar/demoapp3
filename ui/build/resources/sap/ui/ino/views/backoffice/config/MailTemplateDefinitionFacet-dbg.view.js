/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.views.common.GenericControl");
jQuery.sap.require("sap.ui.ino.controls.ContentPane");
jQuery.sap.require("sap.ui.ino.application.ControlFactory");
jQuery.sap.require("sap.ui.ino.controls.AttachmentControl");
jQuery.sap.require("sap.ui.ino.controls.Attachment");
jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("sap.ui.ino.controls.FileUploader");
jQuery.sap.require("sap.ui.ino.controls.FileUploaderStyle");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");
jQuery.sap.require("sap.ui.ino.controls.AriaLivePriority");
jQuery.sap.require("sap.ui.ino.controls.MessageBox");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.MailTemplateDefinitionFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {
    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.config.MailTemplateDefinitionFacet";
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
        oTemplateLayout.addRow(this._createAttachmentRow(bEdit));

        var oTemplateGroup = new sap.ui.ux3.ThingGroup({
            title : this.getController().getTextPath("BO_MAIL_TEMPLATE_TIT_TEMPLATE_INFO"),
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
            Text : "BO_MAIL_TEMPLATE_FLD_DEFAULT_TEXT",
            Tooltip : "BO_MAIL_TEMPLATE_FLD_DEFAULT_TEXT"
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
            Text : "BO_MAIL_TEMPLATE_FLD_PLAIN_CODE",
            Tooltip : "BO_MAIL_TEMPLATE_FLD_PLAIN_CODE"
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
            Text : "BO_MAIL_TEMPLATE_FLD_LANGUAGE",
            Tooltip : "BO_MAIL_TEMPLATE_FLD_LANGUAGE"
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
            Text : "BO_MAIL_TEMPLATE_FLD_TEMPLATE",
            Tooltip : "BO_MAIL_TEMPLATE_FLD_TEMPLATE"
        });
    	
    	if (bEdit) {
    	   // sId, sValueBindingPath, sHeight, bAdvancedMode, bValidateBlank, bSanitizeValue, sFileLabel, bHideImg,bHideEmoticons
            // this._oTemplate = sap.ui.ino.application.ControlFactory.createRichTextEditor(undefined, "specialLanguageModel>/TEMPLATE", "600px"
            // , true, false, false, 'EMAIL_TEMPLATE');
            this._oTemplate = sap.ui.ino.application.ControlFactory.createRichTextEditorWithSetting({
				"sId": undefined,
				"sValueBindingPath": "specialLanguageModel>/TEMPLATE",
				"sHeight": "600px",
				"bAdvancedMode": true,
				"bValidateBlank": false,
				"bSanitizeValue": false,
				"sFileLabel": undefined,
				"bHideImg": false,
				"bHideEmoticons": false,
				"fnUpload": function(oConfiguration, oAttachment, oFileBlob, oFile, sLabel, fnSuccess, fnFailure) {
				    // oFile, sFilename, fnSuccess, fnError, sURL, sFileLabel
				    var sUrl = sap.ui.ino.application.Configuration.getBackendRootURL() + "/" +
                        sap.ui.ino.application.Configuration.getSystemSetting("sap.ino.config.URL_PATH_XS_ATTACHMENT_REPOSITORY");
                    var fileName = oFile.filename().replace("blobid", "image_" + new Date().getTime());
					oAttachment.uploadFile(oFileBlob, fileName, undefined, undefined, sUrl, undefined)
						.done(function(oResponse) {
							fnSuccess(sap.ui.ino.application.Configuration.getBackendRootURL() + "/" + oResponse.PATH.replaceAll(".","/") + "/" + fileName);
						}).fail(function(oResponse) {
						    if(oResponse && oResponse.ERROR && oResponse.MESSAGES 
						        && oResponse.MESSAGES[0].MESSAGE === "MSG_ATTACHMENT_FILE_EXISTS"){
						        fnSuccess(sap.ui.ino.application.Configuration.getBackendRootURL() + "/" + oResponse.PATH.replaceAll(".","/") + "/" + fileName);
						        return;
						    }
							fnFailure();
						});
				}
			});
            // WORKAROUND FOR RTE VALUE BINDING PROBLEM
            oView._oTemplate.attachChange(function() {
                var sValue = oView._oTemplate.getValue();
                
                if (oController.getModel() && oController.getModel().getData() && jQuery.type(oController.getModel().getData().MailTemplateText) === "array") {
                    var aLang = oController.getModel().getData().MailTemplateText;
                    for (var ii = 0; ii < aLang.length; ++ii) {
                        if (aLang[ii].LANG === oView.getThingInspectorController()._sCurrentLanguage) {
                            oController.getModel().setProperty("/MailTemplateText/" + ii + "/TEMPLATE", sValue);
                            break;
                        }
                    }                                                 
                }
            }, this);
        } else {
            this._oTemplate = new sap.ui.core.HTML({
                content : {
                    path : this.getFormatterPath("TEMPLATE", false),
                    formatter : function(sTemplate) {
                        // content is expected to be wrapped by proper HTML
                        // we ensure this by adding the divs around it
                        return "<div style='word-wrap: break-word;'>" + (sTemplate || "") + "</div>";
                    }
                },
                sanitizeContent : true
            }).addStyleClass("sapUiInoMailTemplateHTML");
        }
    	
        return new sap.ui.commons.layout.MatrixLayoutRow({
            cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                content : oTemplateLabel,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            }), new sap.ui.commons.layout.MatrixLayoutCell({
                content : this._oTemplate,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            })]
        });
    },
    
    _createAttachmentRow : function(bEdit) {
        var oAttachmentLabel = this.createControl({
            Type : "label",
            Text : "BO_MAIL_TEMPLATE_FLD_ATTACHMENT",
            Tooltip : "BO_MAIL_TEMPLATE_FLD_ATTACHMENT"
        });
        
        this.oAttachmentControl = new sap.ui.ino.controls.AttachmentControl({
            title : "{i18n>CTRL_ATTACHMENT_CONTROL_TITLE}",
            footer : new sap.ui.commons.HorizontalDivider({
                height : sap.ui.commons.HorizontalDividerHeight.Large
            })
        });
        this.oAttachmentControl.addStyleClass("sapUiLblRelevant");
        
        var oAttachmentControl, oAttachmentTemplate;
        if(bEdit) {
            var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
            var that = this;
            var oController = this.getController();
            var sCustomConfigPackage = sap.ui.ino.application.Configuration.getCustomConfigurationPackage() + ".attachment";
            oAttachmentTemplate = new sap.ui.ino.controls.Attachment({
                mediaType : "{MEDIA_TYPE}",
                fileName : "{FILE_NAME}",
                url : {
                    path : "PATH",
                    formatter : function(sPath) {
                        return sap.ui.ino.application.Configuration.getBackendRootURL() + "/" + sPath;
                    }
                },
                editable : {
                    path : "PACKAGE_ID",
                    formatter : function(sPackageId) {
                        return sPackageId === sCustomConfigPackage;
                    }
                },
                handleRemoveInternal : false,
                remove : function(oEvent) {
                    var sFileName = oEvent.getParameter("filename");
                    var sMediaType = oEvent.getParameter("mediaType");
                    
                    oApp.removeNotificationMessages("repositoryattachment");
                    
                    function fnDelete(bResult) {
                        if (bResult) {
                            var oPromise = oController.onRemove(sFileName, sMediaType);
                            oPromise.done(function() {
                                oAttachmentControl.bindAttachments({
                                    path : "/RepositoryAttachment",
                                    template : oAttachmentTemplate
                                });
                            });
                            oPromise.fail(function(oResponse) {
                                if (oResponse.MESSAGES) {
                                    for (var i = oResponse.MESSAGES.length - 1; i >= 0; i--) {
                                        var msg = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(oResponse.MESSAGES[i], that, "repositoryattachment");
                                        oApp.addNotificationMessage(msg);
                                    }
                                }
                            });
                        }
                    }
            
                    var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
                    sap.ui.ino.controls.MessageBox.confirm(i18n.getText("BO_MAIL_TEMPLATE_INS_DELETE_ATTACHMENT"), fnDelete, i18n.getText("BO_MAIL_TEMPLATE_TIT_DELETE_ATTACHMENT"));
                }
            });

            var oAttachmentFileUploader = new sap.ui.ino.controls.FileUploader({
                rtMode : true,
                uploadTooltip : "{i18n>CTRL_ATTACHMENT_CONTROL_ADD}",
                style : sap.ui.ino.controls.FileUploaderStyle.Attachment,
                uploadSuccessful : function() {
                    oApp.removeNotificationMessages("attachments");
                    oAttachmentControl.bindAttachments({
                        path : "/RepositoryAttachment",
                        template : oAttachmentTemplate
                    });
                },
                uploadFailed : function(evt) {
                    oApp.removeNotificationMessages("attachments");
                    for (var i = 0; i < evt.getParameters().messages.length; i++) {
                        var msg_raw = evt.getParameters().messages[i];
                        var msg = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(msg_raw, this, "attachments");
                        oApp.addNotificationMessage(msg);
                    }
                }
            });

            oAttachmentControl = new sap.ui.ino.controls.AttachmentControl({
                attachmentFileUploader : oAttachmentFileUploader,
                ariaLivePriority : sap.ui.ino.controls.AriaLivePriority.assertive
            });

            oAttachmentControl.bindAttachments({
                path : "/RepositoryAttachment",
                template : oAttachmentTemplate
            });
        } else {
            oAttachmentControl = new sap.ui.ino.controls.AttachmentControl();

            oAttachmentTemplate = new sap.ui.ino.controls.Attachment({
                mediaType : "{MEDIA_TYPE}",
                fileName : "{FILE_NAME}",
                url : {
                    path : "PATH",
                    formatter : function(sPath) {
                        return sap.ui.ino.application.Configuration.getBackendRootURL() + "/" + sPath;
                    }
                },
                editable : false
            });

            oAttachmentControl.bindAttachments({
                path : "/RepositoryAttachment",
                template : oAttachmentTemplate
            });
        }

        return new sap.ui.commons.layout.MatrixLayoutRow({
            cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                content : oAttachmentLabel,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            }), new sap.ui.commons.layout.MatrixLayoutCell({
                content : oAttachmentControl,
                vAlign : sap.ui.commons.layout.VAlign.Top,
                hAlign : sap.ui.commons.layout.HAlign.Begin
            })]
        });
    },
    
    getMailTemplate : function() {
        return this._oTemplate;
    }
}));