/*!
 * @copyright@
 */
 
jQuery.sap.require("sap.ui.ino.views.common.MessageSupportView");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.IdeaMergeRule", jQuery.extend({}, sap.ui.ino.views.common.MessageSupportView, {
    
    init: function() {
        this.initMessageSupportView();
        this.getController().initRuleModel();
    },

    exit: function() {
        this.exitMessageSupportView();
        sap.ui.core.mvc.View.prototype.exit.apply(this, arguments);
    },

    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.config.IdeaMergeRule";
    },

    hasPendingChanges : function() {
        return this.getController().hasPendingChanges();
    },
    
    createContent: function() {
        var oController = this.getController();
        
        var oLayout = new sap.ui.commons.layout.MatrixLayout({
            columns : 3,
            widths : ["60%", "20%", "auto"]
        });

        var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
        this.oSaveButton = new sap.ui.commons.Button({
            text : "{i18n>BO_IDEA_MERGE_RULE_BUT_SAVE}",
            press : [oController.handleSave, oController],
            lite : false,
            enabled : false
        });

        var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            content : [this.oSaveButton],
            colSpan: 3
        });
        oRow.addCell(oCell);
        oLayout.addRow(oRow);
        
        oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
	        height: "1.5rem"
	    }));
        
        oRow = new sap.ui.commons.layout.MatrixLayoutRow();
        
        // create merge rule content
        this.oContentLayout = this._createMergeRuleContent();
        
        oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            content : [this.oContentLayout]
        });

        oRow.addCell(oCell);
        
        oCell = new sap.ui.commons.layout.MatrixLayoutCell();
        oRow.addCell(oCell);
        oLayout.addRow(oRow);
        
        return oLayout;
    },
    
    _createMergeRuleContent: function() {
        return new sap.ui.table.Table({
            selectionMode: "None",
            rows: "{rule>/}",
            visibleRowCount: 4,
            columns: [
                new sap.ui.table.Column({
                    hAlign: 'Center',
					multiLabels: [new sap.m.Label({
					    text: '{i18n>BO_IDEA_MERGE_RULE_TABLE_COL_MERGE_TYPE}',
					    textAlign: 'Center',
					    width: '100%'
					})],
					template: new sap.m.Text({
						text: '{rule>MERGE_TYPE}'
					})
				}),
				new sap.ui.table.Column({
				    hAlign: 'Center',
				    headerSpan: [3, 1],
					multiLabels: [
					    new sap.m.Label({
					        text: '{i18n>BO_IDEA_MERGE_RULE_TABLE_COL_MERGE_ACTION}',
					        textAlign: 'Center',
					        width: '100%'
					    }),
					    new sap.m.Label({
					        text: '{i18n>BO_IDEA_MERGE_RULE_TABLE_COL_ACTION_ADD}',
					        textAlign: 'Center',
					        width: '100%'
					    })
					],
					template: new sap.m.RadioButton({
						selected: '{rule>ADD}',
						groupName: '{rule>OBJECT_TYPE_CODE}'
					})
				}),
				new sap.ui.table.Column({
				    hAlign: 'Center',
					multiLabels: [
					    new sap.m.Label({
					        text: '{i18n>BO_IDEA_MERGE_RULE_TABLE_COL_MERGE_ACTION}',
					        textAlign: 'Center',
					        width: '100%'
					    }),
					    new sap.m.Label({
					        text: '{i18n>BO_IDEA_MERGE_RULE_TABLE_COL_ACTION_IGNORE}',
					        textAlign: 'Center',
					        width: '100%'
					    })
					],
					template: new sap.m.RadioButton({
						selected: '{rule>IGNORE}',
						groupName: '{rule>OBJECT_TYPE_CODE}'
					})
				}),
				new sap.ui.table.Column({
				    hAlign: 'Center',
					multiLabels: [
					    new sap.m.Label({
					        text: '{i18n>BO_IDEA_MERGE_RULE_TABLE_COL_MERGE_ACTION}',
					        textAlign: 'Center',
					        width: '100%'
					    }),
					    new sap.m.Label({
					        text: '{i18n>BO_IDEA_MERGE_RULE_TABLE_COL_ACTION_PROMPT}',
					        textAlign: 'Center',
					        width: '100%'
					    })
					],
					template: new sap.m.RadioButton({
						selected: '{rule>PROMPT}',
						groupName: '{rule>OBJECT_TYPE_CODE}'
					})
				})
            ]
        }).addStyleClass("sapInoIdeaMergeRuleTbl");
    }
}));