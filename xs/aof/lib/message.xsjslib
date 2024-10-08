var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var log = $.import("sap.ino.xs.xslib", "log").log;
var textBundle = $.import("sap.ino.xs.xslib", "textBundle");
var i18n = $.import("sap.ino.xs.xslib", "i18n");
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");

var MessageSeverity = this.MessageSeverity = {
    Success : 6,
    Debug : 5,
    Info : 4,
    Warning : 3,
    Error : 2,
    Fatal : 1
};

function MessageSeverityCharCode(iSeverity) {
    // Fatal application fatal error messages are not logged as fatal, but as errors
    // as fatal log messages are supposed to indicate fatal technical state
    var cCharCode = [undefined, 'E', 'E', 'W', 'I', 'D', 'S'][iSeverity];
    return cCharCode || iSeverity.toString();
}

function createMessageBuffer(bSupressExceptionOnProcessCancellingMessage) {
    var bSuppressLogging = false;
    var aMessage = [];
    var iMinSeverity = MessageSeverity.Debug;
    var oMessageBuffer;
    oMessageBuffer = {
        addMessage : function(iSeverity, sMsgKey, sRefKey, sRefNode, sRefAttribute) {
            if (arguments.length == 1) {
                var oMessage = arguments[0];
                if (!_.isArray(oMessage)) {
                    aMessage.push(oMessage);
                    iSeverity = oMessage.severity;
                } else {
                    if (oMessage.length === 0) {
                        return;
                    }
                    iSeverity = iMinSeverity;
                    _.each(oMessage, function(oAMessage) {
                        aMessage.push(oAMessage);
                        iSeverity = !iSeverity ? oAMessage.severity : Math.min(iSeverity, oAMessage.severity);
                    });
                }
            } else {
                // addMessage has 6 parameters + message parameters so we need to squeeze
                // in bLog at index 5
                var aArguments = _.toArray(arguments);
                if (aArguments.length <= 5) {
                    aArguments[5] = !bSuppressLogging;
                } else {
                    aArguments.splice(5, 0, !bSuppressLogging);
                }
                aMessage.push(_createMessage.apply(undefined, aArguments));
            }
            iMinSeverity = Math.min(iMinSeverity, iSeverity);
            if (!bSupressExceptionOnProcessCancellingMessage && oMessageBuffer.processingCancelled()) {
                throw new CancelProcessingException();
            }
        },
        processingCancelled : function() {
            return iMinSeverity <= MessageSeverity.Fatal;
        },
        getMessages : function() {
            return _.sortBy(aMessage, "severity", function(iSeverity) {
                return iSeverity;
            });
        },
        getMinSeverity : function() {
            return iMinSeverity;
        },
        hasMessages : function() {
            return aMessage.length > 0;
        },
        addAllFrom : function(other) {
            aMessage = _.union(aMessage, other.getMessages());
        },
        suppressLogging : function(bOn) {
            bSuppressLogging = bOn;
        }
    };
    return oMessageBuffer;
}

function createMessage(iSeverity, sMsgKey, sRefKey, sRefNode, sRefAttribute) {
    // _createMessage has 6 parameters + message parameters so we need to squeeze
    // in bLog at index 5
    var aArguments = _.toArray(arguments);
    if (aArguments.length <= 5) {
        aArguments[5] = true;
    } else {
        aArguments.splice(5, 0, true);
    }

    return _createMessage.apply(undefined, aArguments);
}

function _createMessage(iSeverity, sMsgKey, sRefKey, sRefNode, sRefAttribute, bLog) {
    sRefNode = sRefNode === undefined ? "Root" : sRefNode;

    var oMessage = {
        severity : iSeverity,
        messageKey : sMsgKey,
        refKey : sRefKey,
        refNode : sRefNode,
        refAttribute : sRefAttribute,
        parameters : _.rest(_.toArray(arguments), 6)
    };
    
    var oDBConnection = dbConnection.getConnection();
    var oHQ = hQuery.hQuery(oDBConnection);

    oMessage.messageText = getMessageText(oMessage, oHQ);

    if (bLog) {
        var oLogMessage = _.clone(oMessage);
        oLogMessage.severity = MessageSeverityCharCode(oMessage.severity);
        log(oLogMessage);
    }

    return oMessage;
}

function getMessageText(oMessage, oHQ) {
    var sLang = i18n.getSessionLanguage(oHQ);
    var sText = textBundle.getText("messages", oMessage.messageKey, oMessage.parameters, sLang, true, oHQ);
    return sText;
}

function getMessageArrayText(aMessages, oHQ) {
    var aMessageText = [];
    for (var ii = 0; ii < aMessages.length; ++ii) {
        var oMessage = aMessages[ii];
        var sText = getMessageText(oMessage, oHQ);
        aMessageText.push(sText);
    }
    return aMessageText;
}

function mapMessagesToResult(aMessages) {
    var mSeverityMapping = {};
    // Fatal is new - to stay compatible we map it to E
    mSeverityMapping[MessageSeverity.Fatal] = "E";
    mSeverityMapping[MessageSeverity.Error] = "E";
    mSeverityMapping[MessageSeverity.Warning] = "W";
    mSeverityMapping[MessageSeverity.Info] = "I";
    mSeverityMapping[MessageSeverity.Debug] = "D";

    return _.map(aMessages, function(oMessage) {
        return _.mapObject(oMessage, {
            severity : {
                key : "TYPE",
                copy : function(vValue) {
                    return mSeverityMapping[vValue];
                }
            },
            messageKey : "MESSAGE",
            messageText : "MESSAGE_TEXT",
            refKey : "REF_ID",
            refObject : "REF_OBJECT",
            refNode : "REF_NODE",
            refAttribute : "REF_FIELD",
            parameters : "PARAMETERS"
        });
    });
}

function CancelProcessingException() {
}