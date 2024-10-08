/*!
 * @copyright@
 */
 
jQuery.sap.require("sap.ui.model.json.JSONModel");
jQuery.sap.require("sap.ui.ino.models.object.MergeConfig");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");

sap.ui.core.mvc.Controller.extend("sap.ui.ino.views.backoffice.config.IdeaMergeRule", {
    
    hasPendingChanges: function() {
        return this.isPageDataChanged();
    },
    
    initRuleModel: function() {
        var i18nModel = sap.ui.getCore().getModel("i18n").getResourceBundle();
        var oDeffered = sap.ui.ino.models.object.MergeConfig.getMergeConfig();
        oDeffered.done(function(oData) {
            if (oData.RESULT.length === 0) {
                oData.RESULT = [{
                    MERGE_TYPE: i18nModel.getText('BO_IDEA_MERGE_RULE_TABLE_LABEL_AUTHOR'),
                    ADD: false,
                    IGNORE: false,
                    PROMPT: true,
                    OBJECT_TYPE_CODE: 'AUTHOR'
                }, {
                    MERGE_TYPE: i18nModel.getText('BO_IDEA_MERGE_RULE_TABLE_LABEL_EXPERTS'),
                    ADD: false,
                    IGNORE: false,
                    PROMPT: true,
                    OBJECT_TYPE_CODE: 'EXPERT'
                }, {
                    MERGE_TYPE: i18nModel.getText('BO_IDEA_MERGE_RULE_TABLE_LABEL_VOTES'),
                    ADD: false,
                    IGNORE: false,
                    PROMPT: true,
                    OBJECT_TYPE_CODE: 'VOTE'
                }, {
                    MERGE_TYPE: i18nModel.getText('BO_IDEA_MERGE_RULE_TABLE_LABEL_COMMENTS'),
                    ADD: false,
                    IGNORE: false,
                    PROMPT: true,
                    OBJECT_TYPE_CODE: 'COMMENT'
                }];
            } else {
                oData.RESULT.forEach(function(oRule) {
                    switch(oRule.OBJECT_TYPE_CODE) {
                        case "AUTHOR":
                            oRule.MERGE_TYPE = i18nModel.getText('BO_IDEA_MERGE_RULE_TABLE_LABEL_AUTHOR');
                            break;
                        case "EXPERT":
                            oRule.MERGE_TYPE = i18nModel.getText('BO_IDEA_MERGE_RULE_TABLE_LABEL_EXPERTS');
                            break;
                        case "VOTE":
                            oRule.MERGE_TYPE = i18nModel.getText('BO_IDEA_MERGE_RULE_TABLE_LABEL_VOTES');
                            break;
                        case "COMMENT":
                            oRule.MERGE_TYPE = i18nModel.getText('BO_IDEA_MERGE_RULE_TABLE_LABEL_COMMENTS');
                            break;
                    }
                    oRule.ADD = !!oRule.ADD;
                    oRule.IGNORE = !!oRule.IGNORE;
                    oRule.PROMPT = !!oRule.PROMPT;
                });
            }
            
            this.oOrignalRule = oData.RESULT.map(function(oRule) {
                var oNewRule = {};
                Object.keys(oRule).forEach(function(sKey) {
                    oNewRule[sKey] = oRule[sKey];
                });
                return oNewRule;
            });
            
            var oRuleModel = new sap.ui.model.json.JSONModel(oData.RESULT);
            oRuleModel.attachPropertyChange(this.handlePageDataChanged, this);
            
            this.getView().setModel(oRuleModel, 'rule');
        }.bind(this));
    },
    
    handlePageDataChanged: function() {
        if (this.isPageDataChanged()) {
            this.getView().oSaveButton.setEnabled(true);
        } else {
            this.getView().oSaveButton.setEnabled(false);
        }
    },
    
    isPageDataChanged: function() {
        var sPageData = JSON.stringify(this.getView().getModel('rule').getData());
        var sOrignalData = JSON.stringify(this.oOrignalRule);
        
        return sPageData !== sOrignalData;
    },
    
    handleSave: function() {
        var that = this;
        var oPayloadData = this.getView().getModel("rule").getData().map(function(oRule) {
            return {
                ID: oRule.ID || -1,
                ADD: oRule.ADD ? 1 : 0,
                IGNORE: oRule.IGNORE ? 1 : 0,
                PROMPT: oRule.PROMPT ? 1 : 0,
                OBJECT_TYPE_CODE: oRule.OBJECT_TYPE_CODE
            };
        });
        var oDeffered = sap.ui.ino.models.object.MergeConfig.saveMergeConfig({
            MERGE_CONFIG: oPayloadData
        });
        oDeffered.done(function() {
            var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
            var oMessageParameters = {
				key: "MSG_IDEA_MERGE_RULE_SAVED",
				level: sap.ui.core.MessageType.Success,
				parameters: [],
				group: "idea_merge_rule",
				text: oMsg.getResourceBundle().getText("MSG_IDEA_MERGE_RULE_SAVED")
			};
			var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
			var oApp = sap.ui.ino.application.backoffice.Application.getInstance();
			oApp.removeNotificationMessages("idea_merge_rule");
            oApp.addNotificationMessage(oMessage);
            
            // disable save button
            that.getView().oSaveButton.setEnabled(false);
            that.oOrignalRule = that.getView().getModel("rule").getData().map(function(oRule) {
                var oNewRule = {};
                Object.keys(oRule).forEach(function(sKey) {
                    oNewRule[sKey] = oRule[sKey];
                });
                return oNewRule;
            });
        });
        oDeffered.fail(function(oResponse) {
            var aActionMessages = sap.ui.ino.models.core.MessageSupport.convertBackendMessages(oResponse.MESSAGES, that.getView(),
				"idea_merge_rule");
			if (aActionMessages && aActionMessages.length > 0) {
				sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessages(aActionMessages);
			}
        });
    }
});