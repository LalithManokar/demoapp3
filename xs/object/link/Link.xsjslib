var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var Message = $.import("sap.ino.xs.aof.lib", "message");
var LinkMessage = $.import("sap.ino.xs.object.link", "message");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");

var Type = this.Type = {
    URL : "URL",
    OBJECT : "OBJECT",
};

var ObjectType = this.ObjectType = {
    Idea : "IDEA"
};

var Semantic = this.Semantic = {
    Copied : "sap.ino.config.COPIED",
    Merged : "sap.ino.config.MERGED",
    Duplicate : "sap.ino.config.DUPLICATE",
    Similar : "sap.ino.config.SIMILAR"
};

function node(sObjectType, sTypeCode, bReadOnly) {
    return {
        table : "sap.ino.db.link::t_link",
        historyTable : "sap.ino.db.link::t_link_h",
        sequence : "sap.ino.db.link::s_link",
        parentKey : "OBJECT_ID",
        readOnly : bReadOnly,
        consistencyChecks : [linkCheck, check.objectReferenceCheck("TARGET_OBJECT_TYPE_CODE", "TARGET_OBJECT_ID", "Root")],
        attributes : {
            OBJECT_TYPE_CODE : {
                constantKey : sObjectType
            },
            TYPE_CODE : {
                constantKey : sTypeCode,
                foreignKeyTo : "sap.ino.xs.object.link.LinkType.Root"
            },
            TARGET_OBJECT_TYPE_CODE : {
                foreignKeyTo : "sap.ino.xs.aof.object.ApplicationObject.Root"
            },
            SEMANTIC : {
                foreignKeyTo : "sap.ino.xs.object.link.LinkSemantic.Root"
            }
        }
    };
}

function linkCheck(vKey, aWorkObjectNode, addMessage, oContext) {
    _.each(aWorkObjectNode, function(oWorkObjectNode) {
        if (!oWorkObjectNode.TYPE_CODE) {
            addMessage(Message.MessageSeverity.Error, LinkMessage.LINK_INVALID_TYPE, vKey, "Links", "TYPE_CODE");
        } else if (oWorkObjectNode.TYPE_CODE == Type.URL && !oWorkObjectNode.URL) {
            addMessage(Message.MessageSeverity.Error, LinkMessage.LINK_URL_EMPTY, vKey, "Links", "URL");
        } else if (oWorkObjectNode.TYPE_CODE == Type.OBJECT) {
            if (!oWorkObjectNode.TARGET_OBJECT_TYPE_CODE) {
                addMessage(Message.MessageSeverity.Error, LinkMessage.LINK_TARGET_OBJECT_TYPE_CODE_EMPTY, vKey, "Links", "TARGET_OBJECT_TYPE_CODE");
            } else if (!oWorkObjectNode.TARGET_OBJECT_ID) {
                addMessage(Message.MessageSeverity.Error, LinkMessage.LINK_TARGET_OBJECT_ID_EMPTY, vKey, "Links", "TARGET_OBJECT_ID");
            }
        }
    });
}