/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/core/message/MessageParser",
    "sap/ui/core/message/Message",
    "sap/ui/core/MessageType"
], function (MessageParser, Message, MessageType) {
    "use strict";

    var mMessageTypeMapping = {
        'E' : MessageType.Error,
        'W' : MessageType.Warning,
        'I' : MessageType.Information,
        'S' : MessageType.Success
    };

    function mapMessage(oAOFMessage, oProcessor) {
        // we can only map root fields at the moment
        var sTarget = (oAOFMessage.REF_NODE === undefined || oAOFMessage.REF_NODE === "Root") ? "/" + oAOFMessage.REF_FIELD : "/" + oAOFMessage.REF_NODE;
        return new Message({
            type : mMessageTypeMapping[oAOFMessage.TYPE] || MessageType.None,
            code : oAOFMessage.MESSAGE,
            message : oAOFMessage.MESSAGE_TEXT,
            description : oAOFMessage.MESSAGE_TEXT,
            target : sTarget,
            processor : oProcessor
        });
    }

    return MessageParser.extend("sap.ino.commons.models.aof.MessageParser", {
        constructor : function(){
            MessageParser.prototype.constructor.apply(this, arguments);
            this.aPreviousMessages = [];
        },

        parse : function(oResponse) {
            oResponse = oResponse || {};
            var oProcessor = this.getProcessor();
            var aNewMessages = jQuery.map(oResponse.MESSAGES || oResponse.messages || [], function (oMessage) {
                return mapMessage(oMessage, oProcessor);
            });
            this.getProcessor().fireMessageChange({
                oldMessages: this.aPreviousMessages,
                newMessages: aNewMessages
            });
            this.aPreviousMessages = aNewMessages;
        }
    });
});