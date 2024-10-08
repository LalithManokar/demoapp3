/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.views.common.MessageSupportView");
jQuery.sap.require("sap.ui.ino.models.core.MessageSupport");
jQuery.sap.require("sap.ui.ino.application.Message");

(function() {
    "use strict";
    sap.ui.ino.views.common.MessageSupportView = {

        MESSAGE_LOG_MODEL_NAME : "messages",
        // These are the properties which carry the value of an input control
        // (unfortunately different ones for different controls in SAPUI5)
        INPUT_CONTROL_VALUE_PROPERTIES : ["selectedKey", "selectedIndex", "checked", "value", "attachmentId", "items"],

        initMessageSupportView : function() {

            // There is a message model per view to keep track
            // of the view specific error messages which can be bound
            // to controls to display the messages
            var oMsgLog = new sap.ui.model.json.JSONModel({
                messages : []
            });
            this.setModel(oMsgLog, this.MESSAGE_LOG_MODEL_NAME);

            // map of client side validation exceptions
            this.__aClientValidationMessages = {};

            this.__oBindingLookupRoot = this;

            // Activate validation handling
            sap.ui.getCore().attachParseError(this.__onParseError, this);
            sap.ui.getCore().attachValidationError(this.__onValidationError, this);
            sap.ui.getCore().attachValidationSuccess(this.__onValidationSuccess, this);
        },

        __mapEventToMessages : function(oValidationEvent) {
            var oControl = oValidationEvent.getParameter("element");

            // Only check validations no controls with bound value property
            if (!oControl.getBinding("value")) {
                return;
            }

            var that = this;
            var getLabelTextForControl = function(oInputControl) {
                var aChildren = that.findAggregatedObjects(true);
                for (var i = 0; i < aChildren.length; i++) {
                    var oControl = aChildren[i];
                    if ((sap.ui.commons && oControl instanceof sap.ui.commons.Label) || (sap.m && oControl instanceof sap.m.Label)) {
                        if (oControl.getLabelFor() === oInputControl.getId() || (oControl.getLabelForRendering && oControl.getLabelForRendering() === oInputControl.getId())) {
                            return oControl.getText();
                        }
                    }
                }
                if (oInputControl.getParent() && oInputControl.getParent().getMetadata() && oInputControl.getParent().getMetadata().getName() === "sap.ui.table.Row") {
                    var iColumnIndex = oInputControl.data("sap-ui-colindex");
                    if (oInputControl.getParent().getParent()) {
                        var oColumn = oInputControl.getParent().getParent().getColumns()[iColumnIndex];
                        if (oColumn.getLabel() && oColumn.getLabel().getText()) {
                            return oColumn.getLabel().getText();
                        }
                    }
                    return;
                }
                // In thing inspectors look for next thing group in parent hierarchy to find a label, when no direct
                // label can be found
                var oParent = oInputControl.getParent();
                while (oParent) {
                    if (oParent.getMetadata().getName() === "sap.ui.ux3.ThingGroup") {
                        var sText = oParent.getTitle();
                        return sText;
                    }
                    oParent = oParent.getParent();
                }
            };

            var aConstraints = oValidationEvent.getParameter("exception").violatedConstraints;
            var sExceptionMessage = oValidationEvent.getParameter("exception").message;
            if (!aConstraints) {
                aConstraints = [];
            }

            var oType = oValidationEvent.getParameter("type");
            var sLabelText = getLabelTextForControl(oControl);

            var aMessages = [];

            var oMessageParameters = {
                referenceControl : oControl,
                level : sap.ui.core.MessageType.Error,
                group : "validation"
            };

            for (var i = 0; i < aConstraints.length; i++) {

                // reset to initial
                delete oMessageParameters.key;
                delete oMessageParameters.parameters;

                switch (aConstraints[i]) {
                    case "minLength" :
                        if (!sLabelText) {
                            oMessageParameters.key = "MSG_MANDATORY_FIELD";
                        } else {
                            oMessageParameters.key = "MSG_MANDATORY_FIELD_LABEL";
                            oMessageParameters.parameters = [sLabelText];
                        }
                        break;
                    case "maxLength" :
                        if (!sLabelText) {
                            oMessageParameters.key = "MSG_STRING_TOO_LONG";
                            oMessageParameters.parameters = [oType.oConstraints.maxLength];
                        } else {
                            oMessageParameters.key = "MSG_STRING_TOO_LONG_LABEL";
                            oMessageParameters.parameters = [sLabelText, oType.oConstraints.maxLength];
                        }
                        break;
                    case "minimum" :
                        var valueMin = oControl.getBinding("value").getType().oConstraints.minimum;
                        var sType = oControl.getBinding("value").getType().getName();

                        switch (sType) {
                            case "Date" :
                                // Minimum = 1 is misused to indicated mandatory date
                                oMessageParameters.key = "MSG_MANDATORY_FIELD";
                                break;
                            case "Float" :
                                if (!sLabelText) {
                                    oMessageParameters.key = "MSG_DECIMAL_MINIMUM";
                                    oMessageParameters.parameters = [valueMin];
                                } else {
                                    oMessageParameters.key = "MSG_DECIMAL_MINIMUM_LABEL";
                                    oMessageParameters.parameters = [sLabelText, valueMin];
                                }
                                break;
                            default :
                                if (!sLabelText) {
                                    oMessageParameters.key = "MSG_INTEGER_MINIMUM";
                                    oMessageParameters.parameters = [valueMin];
                                } else {
                                    oMessageParameters.key = "MSG_INTEGER_MINIMUM_LABEL";
                                    oMessageParameters.parameters = [sLabelText, valueMin];
                                }
                                break;
                        }
                        break;
                    case "maximum" :
                        var valueMax = oControl.getBinding("value").getType().oConstraints.maximum;
                        var isInteger = oControl.getBinding("value").getType().getName() === "Integer";

                        if (!sLabelText) {
                            if (isInteger) {
                                oMessageParameters.key = "MSG_INTEGER_MAXIMUM";
                            } else {
                                oMessageParameters.key = "MSG_DECIMAL_MAXIMUM";
                            }
                            oMessageParameters.parameters = [valueMax];
                        } else {
                            if (isInteger) {
                                oMessageParameters.key = "MSG_INTEGER_MAXIMUM_LABEL";
                            } else {
                                oMessageParameters.key = "MSG_DECIMAL_MAXIMUM_LABEL";
                            }
                            oMessageParameters.parameters = [sLabelText, valueMax];
                        }
                        break;
                    default :
                        if (!sLabelText) {
                            oMessageParameters.key = "MSG_INVALID_VALUE";
                        } else {
                            oMessageParameters.key = "MSG_INVALID_VALUE_LABEL";
                            oMessageParameters.parameters = [sLabelText];
                        }
                        break;
                }
                aMessages.push(new sap.ui.ino.application.Message(oMessageParameters));
            }

            // No constraints -> just one message for the validation event
            if (aMessages.length == 0) {

                if (sExceptionMessage) {
                    oMessageParameters.text = sExceptionMessage;
                    aMessages.push(new sap.ui.ino.application.Message(oMessageParameters));
                } else {
                    if (!sLabelText) {
                        oMessageParameters.key = "MSG_INVALID_VALUE";
                    } else {
                        oMessageParameters.key = "MSG_INVALID_VALUE_LABEL";
                        oMessageParameters.parameters = [sLabelText];
                    }
                    aMessages.push(new sap.ui.ino.application.Message(oMessageParameters));
                }
            }

            return aMessages;
        },

        __onParseError : function(oEvent) {
            var oElement = oEvent.getParameter("element");
            if (this.__isVisibleElement(oElement)) {
                this.__aClientValidationMessages[oElement.getId()] = this.__mapEventToMessages(oEvent);
            }
        },

        __onValidationError : function(oEvent) {
            var oElement = oEvent.getParameter("element");
            if (this.__isVisibleElement(oElement)) {
                this.__aClientValidationMessages[oElement.getId()] = this.__mapEventToMessages(oEvent);
            }
        },

        __isVisibleElement : function(oElement) {
            if (oElement.getParent() && oElement.getParent().getMetadata() && oElement.getParent().getMetadata().getName() === "sap.ui.table.Row" && oElement.getParent()._bHidden) {
                return false;
            }
            if (oElement.sParentAggregationName === "template") {
                return false;
            }
            return true;
        },

        __onValidationSuccess : function(oEvent) {
            var oElement = oEvent.getParameter("element");
            if (oElement.setValueState) {
                oElement.setValueState(sap.ui.core.ValueState.None);
            }
            delete this.__aClientValidationMessages[oElement.getId()];
        },

        exitMessageSupportView : function() {
            sap.ui.getCore().detachParseError(this.__onParseError, this);
            sap.ui.getCore().detachValidationError(this.__onValidationError, this);
            sap.ui.getCore().detachValidationSuccess(this.__onValidationSuccess, this);
        },

        setBindingLookupRoot : function(oRoot) {
            this.__oBindingLookupRoot = oRoot;
            var oMsgLog = this.getModel(this.MESSAGE_LOG_MODEL_NAME);
            this.__oBindingLookupRoot.setModel(oMsgLog, this.MESSAGE_LOG_MODEL_NAME);
            this.__aBindingReverseLookup = null;
        },

        resetBindingLookup : function() {
            this.__aBindingReverseLookup = null;
        },

        showValidationMessages : function() {
            var that = this;

            var getInputControls = function() {
                if (!that.__aBindingReverseLookup) {
                    that.__initBindingLookup();
                }
                var aInputControls = [];
                for ( var path in that.__aBindingReverseLookup) {
                    var aReverseLookup = that.__aBindingReverseLookup[path];
                    for (var i = 0; i < aReverseLookup.length; i++) {
                        var oControl = aReverseLookup[i].control;
                        if (oControl.setValue) {
                            aInputControls.push(oControl);
                        }
                    }
                }
                return aInputControls;
            };

            // For mandatory fields validation does not run automatically when no value is
            // entered. We enforce this by calling updating the model property directly
            // with the control value
            var enforceMandatoryFieldValidation = function() {
                var aControls = getInputControls();
                for (var i = 0; i < aControls.length; i++) {
                    var oControl = aControls[i];
                    if (oControl.getValue) {
                        var bEditable = ((oControl.getEditable && oControl.getEditable()) &&
                                          (!oControl.getEnabled || oControl.getEnabled()));
                        if (bEditable) {
                            oControl.updateModelProperty("value", oControl.getValue(), oControl.getValue());
                        }
                    }
                }
            };

            this.__aClientValidationMessages = {};
            enforceMandatoryFieldValidation();
            this.removeAllMessages();

            // jQuery map flattens the array in array structure we have
            var aFlattenedMessages = jQuery.map(this.__aClientValidationMessages, function(oObject) {
                return oObject;
            });

            jQuery.each(aFlattenedMessages, function(oKey, oValidationMessage) {
                that.addMessage(oValidationMessage);
            });
        },

        addValidationMessage : function(oMessage) {
            this.__aClientValidationMessages[oMessage.getReferenceControl()] = this.__aClientValidationMessages[oMessage.getReferenceControl()] || [];
            this.__aClientValidationMessages[oMessage.getReferenceControl()].push(oMessage);
            this.addMessage(oMessage);
        },

        hasValidationMessages : function() {
            return !jQuery.isEmptyObject(this.__aClientValidationMessages);
        },

        hasMessages : function() {
            var oMsgLog = this.getModel(this.MESSAGE_LOG_MODEL_NAME);
            var aMessages = oMsgLog.getProperty("/messages");
            return !jQuery.isEmptyObject(aMessages);
        },

        addMessage : function(oMessage) {
            sap.ui.ino.models.core.MessageSupport.determineTextByKey(oMessage);

            var oMsgLog = this.getModel(this.MESSAGE_LOG_MODEL_NAME);
            var aMessages = oMsgLog.getProperty("/messages");
            // Put new messages always on top
            aMessages.unshift(oMessage);
            this.sortMessages(aMessages);

            // as we update by reference we have to force the update trigger
            oMsgLog.checkUpdate(true);

            this.showMessageValueState(oMessage);
        },

        addMessages : function(aMessages) {
            for (var i = 0; i < aMessages; i++) {
                this.addMessage(aMessages[i]);
            }
        },

        revalidateTableMessages : function(oTable, sRefNode) {
            this.resetBindingLookup();
            this.revalidateMessages();
            jQuery.each(oTable.getRows(), function(j, oRow) {
            	jQuery(oRow.getDomRef()).removeClass("markErrorCell");
            });
            jQuery.each(this.getMessages(), function(i, oMessage) {
                var oBackendMessage = oMessage.getBackendMessage();
                if (oBackendMessage && oBackendMessage.REF_NODE === sRefNode) {
                    jQuery.each(oTable.getRows(), function(j, oRow) {
                        var oContext = oRow.getCells()[0].getBinding("text").getContext();
                        if (oContext) {
                            if (oContext.getObject().ID === oBackendMessage.REF_ID) {
                                jQuery(oRow.getDomRef()).addClass("markErrorCell");
                                return false;
                            }
                            return true;
                        }
                    });
                }
            });
        },

        revalidateMessages : function() {
            var that = this;
            var oMsgLog = this.getModel(this.MESSAGE_LOG_MODEL_NAME);
            var aMessages = oMsgLog.getProperty("/messages");
            jQuery.each(aMessages, function(i, oMessage) {
                that.hideMessageValueState(oMessage);
                oMessage.setReferenceControl(null);
            });
            jQuery.each(aMessages, function(i, oMessage) {
                var oBackendMessage = oMessage.getBackendMessage();
                if (oBackendMessage) {
                    oMessage.setReferenceControl(that.findReferenceControlForBackendField(oBackendMessage.REF_FIELD, oBackendMessage.REF_NODE, oBackendMessage.REF_ID));
                    that.showMessageValueState(oMessage);
                }
            });
        },

        showMessageValueState : function(oMessage) {
            oMessage.showValueState();
        },

        hideMessageValueState : function(oMessage) {
            oMessage.hideValueState();
        },

        setValueState : function(oReferenceControl, oMessage) {
            if (oReferenceControl && oReferenceControl.setValueState) {
                switch (oMessage.getLevel()) {
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

        clearValueState : function(oReferenceControl) {
            if (oReferenceControl && oReferenceControl.setValueState) {
                oReferenceControl.setValueState(sap.ui.core.ValueState.None);
            }
        },

        addBackendMessage : function(oBackendMessage, sGroup) {
            var oConvertedMessage = sap.ui.ino.models.core.MessageSupport.convertBackendMessage(oBackendMessage, this, sGroup);
            this.addMessage(oConvertedMessage);
            return oConvertedMessage;
        },

        addBackendMessages : function(aBackendMessages, sGroup) {
            var aConvertedMessages = [];
            if (aBackendMessages) {
                for (var i = 0; i < aBackendMessages.length; i++) {
                    var oConvertedMessage = this.addBackendMessage(aBackendMessages[i], sGroup);
                    aConvertedMessages.push(oConvertedMessage);
                }
            }
            return aConvertedMessages;
        },

        replaceBackendMessages : function(aBackendMessages, sGroup) {
            this.removeAllMessages(sGroup);
            this.addBackendMessages(aBackendMessages, sGroup);
        },

        getMessages : function(sGroup) {
            var oMsgLog = this.getModel(this.MESSAGE_LOG_MODEL_NAME);
            var aMessages = oMsgLog.getProperty("/messages");

            return jQuery.map(aMessages, function(oMessage) {
                if (!sGroup || sGroup === oMessage.getGroup()) {
                    return oMessage;
                }
            });
        },

        sortMessages : function(aMessage) {
            if (aMessage.length > 1) {
                aMessage.sort(function(oMsg1, oMsg2) {
                    var iSeverityMsg1 = 0;
                    switch (oMsg1.getLevel()) {
                        case sap.ui.core.MessageType.Error :
                            iSeverityMsg1 = 1;
                            break;
                        case sap.ui.core.MessageType.Success :
                            iSeverityMsg1 = 2;
                            break;
                        case sap.ui.core.MessageType.Warning :
                            iSeverityMsg1 = 3;
                            break;
                        case sap.ui.core.MessageType.Information :
                            iSeverityMsg1 = 4;
                            break;
                        case sap.ui.core.MessageType.None :
                            iSeverityMsg1 = 5;
                            break;
                        default :
                            iSeverityMsg1 = 5;
                            break;
                    }
                    var iSeverityMsg2 = 0;
                    switch (oMsg2.getLevel()) {
                        case sap.ui.core.MessageType.Error :
                            iSeverityMsg2 = 1;
                            break;
                        case sap.ui.core.MessageType.Success :
                            iSeverityMsg2 = 2;
                            break;
                        case sap.ui.core.MessageType.Warning :
                            iSeverityMsg2 = 3;
                            break;
                        case sap.ui.core.MessageType.Information :
                            iSeverityMsg2 = 4;
                            break;
                        case sap.ui.core.MessageType.None :
                            iSeverityMsg2 = 5;
                            break;
                        default :
                            iSeverityMsg2 = 5;
                            break;
                    }
                    return iSeverityMsg1 - iSeverityMsg2;
                });
            }
        },

        removeAllMessages : function(sGroup, sLevel) {
            var oMsgLog = this.getModel(this.MESSAGE_LOG_MODEL_NAME);
            var aMessages = oMsgLog.getProperty("/messages");
            var that = this;
            // we keep all message which are not in the given group
            // (or none if group is not given
            var aFilteredMessages = jQuery.map(aMessages, function(oMessage) {
                if ((!sGroup || sGroup === oMessage.getGroup()) && (!sLevel || sLevel === oMessage.getLevel())) {
                    that.hideMessageValueState(oMessage);
                    return null;
                }
                return oMessage;
            });
            oMsgLog.setProperty("/messages", aFilteredMessages);
        },

        removeMessageWithRefId : function(iRefId, sGroup) {
            var oMsgLog = this.getModel(this.MESSAGE_LOG_MODEL_NAME);
            var aMessages = oMsgLog.getProperty("/messages");
            var that = this;
            var aFilteredMessages = jQuery.map(aMessages, function(oMessage) {
                if (oMessage.getBackendMessage() && oMessage.getBackendMessage().REF_ID == iRefId && (!sGroup || sGroup === oMessage.getGroup())) {
                    that.hideMessageValueState(oMessage);
                    return null;
                }
                return oMessage;
            });
            oMsgLog.setProperty("/messages", aFilteredMessages);
        },

        removeMessagesForControl : function(oControl) {
            if (!oControl) {
                return;
            }
            var oMsgLog = this.getModel(this.MESSAGE_LOG_MODEL_NAME);
            var aMessages = oMsgLog.getProperty("/messages");
            var that = this;
            // we keep all message which are not in the given group
            // (or none if group is not given
            var aFilteredMessages = jQuery.map(aMessages, function(oMessage) {
                if (oControl === oMessage.getReferenceControlInstance()) {
                    that.hideMessageValueState(oMessage);
                    return null;
                } else {
                    return oMessage;
                }
            });

            oMsgLog.setProperty("/messages", aFilteredMessages);
        },

        getBindingReverseLookupControls : function(sFieldName) {
            if (!this.__aBindingReverseLookup) {
                this.__initBindingLookup();
            }
            var aReverseLookup = this.__aBindingReverseLookup[sFieldName] || [];
            var aActiveReverseLookup = [];
            jQuery.each(aReverseLookup, function(i, oReverseLookup) {
                var oControl = oReverseLookup.control;
                if (oControl.getEnabled && oControl.getEnabled() && oControl.getEditable && oControl.getEditable()) {
                    aActiveReverseLookup.push(oReverseLookup);
                }
            });
            return aActiveReverseLookup;
        },

        findReferenceControlForBackendField : function(sFieldName, sNodeName, iRefId) {
            if (!sFieldName) {
                return null;
            }
            if (!this.getBindingReverseLookupControls) {
                return null;
            }
            var sPathName = !sNodeName || sNodeName == "Root" ? sFieldName : sNodeName + "/" + sFieldName;
            var aReverseLookup = this.getBindingReverseLookupControls(sPathName);
            if (!aReverseLookup) {
                return null;
            }

            // Handle controls with context binding (e.g. in a table, tree control or a details view)
            for (var i = 0; i < aReverseLookup.length; i++) {
                var oControl = aReverseLookup[i].control;
                var oBinding = aReverseLookup[i].binding;
                if (oBinding && oBinding.getContext()) {
                    var iId = oBinding.getContext().getProperty("ID");
                    if (iRefId == iId) {
                        return oControl;
                    }
                }
            }

            // Handle only control with no context binding, otherwise it shall be handled above
            // We take the first controls which allows setting a value state
            for (var i = 0; i < aReverseLookup.length; i++) {
                var oControl = aReverseLookup[i].control;
                var oBinding = aReverseLookup[i].binding;
                if (oBinding && !oBinding.getContext() && oControl.setValueState) {
                    return oControl;
                }
            }

            // No control found for backend field
            return null;
        },

        __initBindingLookup : function() {
            this.__aBindingReverseLookup = {};

            function getBindingContext(oBinding) {
                var sBindingContext = "";
                if (oBinding.getContext() && oBinding.getContext().getPath) {
                    var sContextPath = oBinding.getContext().getPath();
                    var iPos = sContextPath.lastIndexOf("/");
                    if (iPos > -1) {
                        sBindingContext = sContextPath.substr(0, iPos + 1);
                    }
                }
                return sBindingContext;
            }

            /*
             * This builds up an associated array from property name to input controls which are bound to this property
             */
            var aChildControls = this.__oBindingLookupRoot.findAggregatedObjects(true);
            for (var j = 0; j < aChildControls.length; j++) {

                var oChildControl = aChildControls[j];
                var oMetaData = oChildControl.getMetadata();

                for (var p = 0; p < this.INPUT_CONTROL_VALUE_PROPERTIES.length; p++) {
                    var sProperty = this.INPUT_CONTROL_VALUE_PROPERTIES[p];

                    if (oMetaData.hasProperty(sProperty) || oMetaData.hasAggregation(sProperty)) {
                        var oBindingInfo = oChildControl.getBindingInfo(sProperty);
                        if (oBindingInfo && oBindingInfo.binding) {

                            var aPath = [];
                            if ((!oBindingInfo.parts || oBindingInfo.parts.length <= 1) && oBindingInfo.binding.getPath()) {
                                aPath.push(getBindingContext(oBindingInfo.binding) + oBindingInfo.binding.getPath());
                            } else if (oBindingInfo.binding.getBindings && oBindingInfo.binding.getBindings()) {
                                var aBinding = oBindingInfo.binding.getBindings();
                                for (var ii = 0; ii < aBinding.length; ii++) {
                                    var oBinding = aBinding[ii];
                                    if (oBinding.getPath()) {
                                        aPath.push(getBindingContext(oBinding) + oBinding.getPath());
                                    }
                                }
                            }

                            for (var ii = 0; ii < aPath.length; ii++) {
                                var sBindingPath = aPath[ii];
                                var aPart = sBindingPath.split("/");
                                sBindingPath = "";
                                for (var jj = 0; jj < aPart.length; jj++) {
                                    var sPart = aPart[jj];
                                    // Handle hierarchy binding (number and children)
                                    if (isNaN(sPart) && sPart != "children") {
                                        sBindingPath += "/" + sPart;
                                    }
                                }
                                if (sBindingPath.indexOf("/") == 0) {
                                    sBindingPath = sBindingPath.substring(1);
                                }
                                if (!this.__aBindingReverseLookup[sBindingPath]) {
                                    this.__aBindingReverseLookup[sBindingPath] = [];
                                }
                                this.__aBindingReverseLookup[sBindingPath].push({
                                    control : oChildControl,
                                    binding : oBindingInfo.binding
                                });
                            }
                        }
                    }
                }
            }
        }
    };
})();