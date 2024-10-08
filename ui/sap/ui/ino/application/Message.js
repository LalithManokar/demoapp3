/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.application.Message");
(function() {
    "use strict";

    /**
     * Extension of sap.ui.core.Message
     * 
     * <ul>
     * <li> Properties
     * <ul>
     * <li>key: technical key of a message. Serves as key for translation in text bundles, e.g. 'MSG_STRING_TOO_LONG'</li>
     * <li>parameters: array of parameters which should replace the placeholders {0}, {1} in the message text (see
     * SAPUI5 documentation for details)</li>
     * <li>group: an identifier of the logical group where this message belongs to. This is e.g. used in UI controls to
     * filter messages</li>
     * </ul>
     * </li>
     * 
     * <li> Associations
     * <ul>
     * <li>referenceControl: sap.ui.core.Control control which is related to that message</li>
     * </ul>
     * </li>
     * <ul>
     * 
     * </ul>
     * 
     */
    sap.ui.core.Message.extend("sap.ui.ino.application.Message", {
        metadata : {
            properties : {
                key : "string",
                parameters : "string[]",
                group : "string",
                backendMessage : "object"
            },

            associations : {
                referenceControl : "sap.ui.core.Control" // No "0..n" associations supported
            }
        },
        
        constructor : function(oSettings) {
            sap.ui.core.Message.apply(this, arguments);
            
            if (oSettings.raw) {
                if (oSettings.raw.status === 500 && oSettings.raw.responseText) {
                    var sText = oSettings.raw.responseText;
                    if (sText) {
                        sText = sText.replace(/<(.|\n)*?>/g, " ").replace(/\s+/g, " ").trim();
                    }
                    
                    this.setText(sText);
                }
            }
        },

        getReferenceControlInstance : function() {
            // associations are not stored as object references but as strings of element
            // ids however we want to return the reference control as object instance so that we can
            // e.g. the set value state method on it
            var sControlId = this.getReferenceControl();
            return sap.ui.getCore().byId(sControlId);
        },

        showValueState : function() {
            var oReferenceControl = this.getReferenceControlInstance();
            if (oReferenceControl && oReferenceControl.setValueState) {
                switch (this.getLevel()) {
                    case sap.ui.core.MessageType.Error :
                        oReferenceControl.setValueState(sap.ui.core.ValueState.Error);
                        break;
                    case sap.ui.core.MessageType.Warning :
                        oReferenceControl.setValueState(sap.ui.core.ValueState.Warning);
                        break;
                    case sap.ui.core.MessageType.Success :
                        oReferenceControl.setValueState(sap.ui.core.ValueState.Success);
                        break;
                    case sap.ui.core.MessageType.Information :
                        oReferenceControl.setValueState(sap.ui.core.ValueState.None);
                        break;
                    default :
                        oReferenceControl.setValueState(sap.ui.core.ValueState.None);
                }
            }
        },

        hideValueState : function() {
            var oReferenceControl = this.getReferenceControlInstance();
            if (oReferenceControl && oReferenceControl.setValueState) {
                oReferenceControl.setValueState(sap.ui.core.ValueState.None);
            }
        },

        destroy : function() {
            this.hideValueState();
            sap.ui.core.Message.prototype.destroy.apply(this, arguments);
        }

    });

})();