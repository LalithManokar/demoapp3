/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.MasterDetailView");
jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");
jQuery.sap.require("sap.ui.ino.models.util.Table");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.UnitList", jQuery.extend({},
        sap.ui.ino.views.common.MasterDetailView, {
            getControllerName : function() {
                return "sap.ui.ino.views.backoffice.config.UnitList";
            },

            hasPendingChanges : function() {
                return this.getController().hasPendingChanges();
            },

            createColumns : function() {
                var oController = this.getController();
                
                return [sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("CODE"), {
                    label : new sap.ui.commons.Label({
                        text : "{i18n>BO_UNIT_ROW_CODE}"
                    }),
                    template : new sap.ui.commons.Link({
                        text : {
                            path : "CODE",
                            formatter : sap.ui.ino.views.backoffice.config.Util.formatPlainCode
                        },
                        press : function(oEvent) {
                            var oBindingContext = oEvent.getSource().getBindingContext();
                            var iId = oBindingContext.getObject().ID;
                            oController.onNavigateToUnit(iId);
                        },
                    }),
                    sortProperty : "CODE",
                    filterProperty : "CODE"
                })), 
                
                sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("PACKAGE_ID"), {
                    label : new sap.ui.commons.Label({
                        text : "{i18n>BO_UNIT_ROW_PACKAGE_ID}"
                    }),
                    template : new sap.ui.commons.TextView({
                        text : "{PACKAGE_ID}"
                    }),
                    sortProperty : "PACKAGE_ID",
                    filterProperty : "PACKAGE_ID"
                })),

                sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("DEFAULT_TEXT"), {
                    label : new sap.ui.commons.Label({
                        text : "{i18n>BO_UNIT_ROW_DEFAULT_TEXT}"
                    }),
                    template : new sap.ui.commons.TextView({
                        text : "{DEFAULT_TEXT}"
                    }),
                    sortProperty : "DEFAULT_TEXT",
                    filterProperty : "DEFAULT_TEXT"
                })),

                sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("DEFAULT_LONG_TEXT"), {
                    label : new sap.ui.commons.Label({
                        text : "{i18n>BO_UNIT_ROW_DEFAULT_LONG_TEXT}"
                    }),
                    template : new sap.ui.commons.TextView({
                        text : "{DEFAULT_LONG_TEXT}"
                    }),
                    sortProperty : "DEFAULT_LONG_TEXT",
                    filterProperty : "DEFAULT_LONG_TEXT"
                })),

                new sap.ui.table.Column(this.createId("CREATED_AT"), {
                    label : new sap.ui.commons.Label({
                        text : "{i18n>BO_UNIT_ROW_CREATED_AT}"
                    }),
                    template : new sap.ui.commons.TextView({
                        text : {
                            path : "CREATED_AT",
                            type : new sap.ui.model.type.Date()
                        }
                    }),
                    sortProperty : "CREATED_AT"
                    // cannot be filtered by intention, due to problem w/ date filter
                }),

                sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("CREATED_BY"), {
                    label : new sap.ui.commons.Label({
                        text : "{i18n>BO_UNIT_ROW_CREATED_BY}"
                    }),
                    template : new sap.ui.commons.Link({
                        text : "{CREATED_BY}",
                        press : sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CREATED_BY_ID", "user")
                    }),
                    sortProperty : "CREATED_BY",
                    filterProperty : "CREATED_BY"
                })),

                new sap.ui.table.Column(this.createId("CHANGED_AT"), {
                    label : new sap.ui.commons.Label({
                        text : "{i18n>BO_UNIT_ROW_CHANGED_AT}"
                    }),
                    template : new sap.ui.commons.TextView({
                        text : {
                            path : "CHANGED_AT",
                            type : new sap.ui.model.type.Date()
                        }
                    }),
                    sortProperty : "CHANGED_AT"
                    // cannot be filtered by intention, due to problem w/ date filter
                }),

                sap.ui.ino.models.util.Table.caseInsensitiveColumn(new sap.ui.table.Column(this.createId("CHANGED_BY"), {
                    label : new sap.ui.commons.Label({
                        text : "{i18n>BO_UNIT_ROW_CHANGED_BY}"
                    }),
                    template : new sap.ui.commons.Link({
                        text : "{CHANGED_BY}",
                        press : sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CHANGED_BY_ID", "user")
                    }),
                    sortProperty : "CHANGED_BY",
                    filterProperty : "CHANGED_BY"
                }))];
            },

            createActionButtons : function(oController) {
                this._oCreateButton = new sap.ui.commons.Button({
                    id : this.createId("BUT_CREATE"),
                    text : "{i18n>BO_UNIT_BUT_CREATE}",
                    press : [oController.onCreatePressed, oController],
                    lite : false,
                    enabled : "{property>/actions/create/enabled}"
                });

                this._oEditButton = new sap.ui.commons.Button({
                    id : this.createId("BUT_EDIT"),
                    text : "{i18n>BO_UNIT_BUT_EDIT}",
                    press : [oController.onEditPressed, oController],
                    lite : false,
                    enabled : "{property>/actions/update/enabled}"
                });
                
                this._oCopyButton = new sap.ui.commons.Button({
                    id : this.createId("BUT_COPY"),
                    text : "{i18n>BO_UNIT_BUT_COPY}",
                    press : [oController.onCopyAsPressed, oController],
                    lite : false,
                    enabled : "{property>/actions/copy/enabled}"
                });

                this._oDeleteButton = new sap.ui.commons.Button({
                    id : this.createId("BUT_DELETE"),
                    text : "{i18n>BO_UNIT_BUT_DELETE}",
                    press : [oController.onDeletePressed, oController],
                    lite : false,
                    enabled : "{property>/actions/del/enabled}"
                });
                
                //also create the CopyAsDialog 
                this.createCopyAsDialog();

                return [this._oCreateButton, this._oEditButton, this._oCopyButton, this._oDeleteButton];
            },

            createDetailsView : function() {
                return sap.ui.jsview("sap.ui.ino.views.backoffice.config.UnitListDetails");
            },
            
            createCopyAsDialog : function() {
                var oOverlay = this;
                var oDialogCopyButton = new sap.ui.commons.Button({
                    text : "{i18n>BO_COMMON_BUT_COPY}",
                    press : function(oEvent) {
                        oOverlay.getController().onCopyPressed(oOverlay.oCopyAsCodeField.getValue());
                    }
                });
                var oDialogCancelButton = new sap.ui.commons.Button({
                    text : "{i18n>BO_COMMON_BUT_CANCEL}",
                    press : function() {
                        oOverlay.oCopyAsDialog.close();
                    }
                });
                
                var oCopyAsCodeLabel = new sap.ui.commons.Label({
                    text: "{i18n>BO_UNIT_FLD_PLAIN_CODE}"
                });
                
                this.oCopyAsCodeField = new sap.ui.commons.TextField({
                    ariaLabelledBy : oCopyAsCodeLabel,
                    liveChange : function(oEvent) {
                    	oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
                        if(oEvent.getParameters().liveValue.length > 0) {
                            oDialogCopyButton.setEnabled(true);
                        } else {
                            oDialogCopyButton.setEnabled(false);
                        }
                    }
                });
                
                oCopyAsCodeLabel.setLabelFor(this.oCopyAsCodeField);
                
                var oCopyAsLayout = new sap.ui.commons.layout.MatrixLayout({
                    columns : 2,
                    widths : ['140px', '60%']
                });  
                
                var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
                    cells : [new sap.ui.commons.layout.MatrixLayoutCell({
                        content : oCopyAsCodeLabel,
                        vAlign : sap.ui.commons.layout.VAlign.Top,
                        hAlign : sap.ui.commons.layout.HAlign.Begin
                    }), new sap.ui.commons.layout.MatrixLayoutCell({
                        content : this.oCopyAsCodeField,
                        vAlign : sap.ui.commons.layout.VAlign.Top,
                        hAlign : sap.ui.commons.layout.HAlign.Begin
                    })]
                });
                oCopyAsLayout.addRow(oRow);
                
                this.oCopyAsDialog = new sap.ui.commons.Dialog({
                    title : "{i18n>BO_UNIT_TIT_DIALOG_COPY}",
                    content : [oCopyAsLayout]
                });
                this.oCopyAsDialog.addButton(oDialogCopyButton);
                this.oCopyAsDialog.addButton(oDialogCancelButton);
            },
            
            getCopyAsDialog : function(){
            	return this.oCopyAsDialog;
            },
            
            getCopyAsCodeField : function(){
            	return this.oCopyAsCodeField;
            }
        }));