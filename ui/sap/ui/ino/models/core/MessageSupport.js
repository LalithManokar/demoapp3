/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.core.MessageSupport");

(function() {
    "use strict";

    jQuery.sap.require("sap.ui.ino.application.Message");
    jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
    jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

    var BackendMessageType = {
        Error : 'E',
        Warning : 'W',
        Info : 'I',
        Success : 'S'
    };

    sap.ui.ino.models.core.MessageSupport = {

        convertBackendMessages : function(aBackendMessages, oView, sGroup) {
            var aConvertedMessages = [];
            for (var i = 0; i < aBackendMessages.length; i++) {
                aConvertedMessages.push(this.convertBackendMessage(aBackendMessages[i], oView, sGroup));
            }
            return aConvertedMessages;
        },

        convertBackendMessage : function(oBackendMessage, oView, sGroup) {
            var mapTypeToLevel = function(sBackendMsgType) {
                switch (sBackendMsgType) {
                    case BackendMessageType.Error :
                        return sap.ui.core.MessageType.Error;
                    case BackendMessageType.Warning :
                        return sap.ui.core.MessageType.Warning;
                    case BackendMessageType.Info :
                        return sap.ui.core.MessageType.Information;
                    case BackendMessageType.Success :
                        return sap.ui.core.MessageType.Success;
                    default :
                        return sap.ui.core.MessageType.None;
                }
            };
            var oMessageParameters = {};
            oMessageParameters.key = oBackendMessage.MESSAGE;
            oMessageParameters.level = mapTypeToLevel(oBackendMessage.TYPE);
            oMessageParameters.parameters = oBackendMessage.PARAMETERS;
            if (oView && oView.findReferenceControlForBackendField) {
                oMessageParameters.referenceControl = oView.findReferenceControlForBackendField(
                        oBackendMessage.REF_FIELD, oBackendMessage.REF_NODE, oBackendMessage.REF_ID);
            } else {
                oMessageParameters.referenceControl = null;
            }
            oMessageParameters.group = sGroup;
            oMessageParameters.backendMessage = oBackendMessage;
            var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
            this.determineTextByKey(oMessage);
            return oMessage;
        },

        determineTextByKey : function(oMessage) {
            if (!oMessage.getText() && oMessage.getKey && oMessage.getKey()) {
                var oMsgBundle = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
                var aParameters = this.replaceTextInParameters(oMessage.getParameters());
                var sMsgText = oMsgBundle.getResourceBundle().getText(oMessage.getKey(), aParameters);
                oMessage.setText(sMsgText);
            }
        },

        replaceTextInParameters : function(aParameters) {
            var oMsgBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
            if (!aParameters) {
                return;
            }
            return jQuery.map(aParameters, function(sParameter, iIndex) {
                if (sParameter && sParameter.length > 0) {
                    var aMatch = /\{code>(.*):(.*)\}/.exec(sParameter);
                    if (aMatch) {
                        return sap.ui.ino.models.core.CodeModel.getFormatter(aMatch[1])(aMatch[2]);
                    }
                    aMatch = /\{(.*)\}/.exec(sParameter);
                    if (aMatch) {
                        return oMsgBundle.getText(aMatch[1]);
                    }
                }
                return sParameter;
            });
        }
    };
})();