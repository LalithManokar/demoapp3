var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var check = $.import("sap.ino.xs.aof.lib", "check");
var Message = $.import("sap.ino.xs.aof.lib", "message");

var TagMessage = $.import("sap.ino.xs.object.tag", "message");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");

var getHQ = dbConnection.getHQ;
var oHQ = getHQ();

this.ObjectTypeCode = {
    Idea : "IDEA",
    Campaign : "CAMPAIGN",
    Identity : "IDENTITY",
    Responsibility : "RESPONSIBILITY",
    Blog : "BLOG" 
};

function includeDeleteTagAssignment() {
    return {
        isStatic : true,
        isInternal : true,
        authorizationCheck : false,
        historyEvent : "TAG_ASSIGNMENT_DELETED",
        execute : deleteTagAssignments,
        customProperties : deleteTagAssignmentsProperties
    };
}

function includeMergeTagAssignment() {
    return {
        isStatic : true,
        isInternal : true,
        authorizationCheck : false,
        historyEvent : "TAG_ASSIGNMENT_DELETED",
        execute : mergeTagAssignments,
        customProperties : mergeTagAssignmentsProperties
    };
}

function node(sObjectTypeCode) {
    return {
        table : "sap.ino.db.tag::t_object_tag",
        historyTable : "sap.ino.db.tag::t_object_tag_h",
        sequence : "sap.ino.db.tag::s_object_tag",
        parentKey : "OBJECT_ID",
        // check.duplicateCheck("NAME", TagMessage.DUPLICATE_TAG_ASSIGN) is redundant as NAME only possible once per NAME (alt. key check in Tag)
        consistencyChecks : [check.duplicateCheck("TAG_ID", TagMessage.DUPLICATE_TAG_ASSIGN, false, "NAME")],
        attributes : {
            TAG_ID : {
                foreignKeyTo : "sap.ino.xs.object.tag.Tag.Root"
            },
            OBJECT_TYPE_CODE : {
                constantKey : sObjectTypeCode
            },
            // transient field for creation of not existing tags
            NAME : {},
            VANITY_CODE: {}
        }
    };
}

function createTags(vKey, oWorkObject, oPersistedObject, addMessage, fnNextHandle, oContext) {
    if (oWorkObject.Tags === undefined) {
        return;
    }
    

    // Tags need to be created when the referenced TAG_ID is a handle, i.e. < 0
    // Generated keys are not returned of the idea caller as they are not mapped to primary key of the node
    var aNewTags = _.filter(oWorkObject.Tags, function(oTag) {

        var sSelectTag;
        var aExistingTag;

        if (oTag.TAG_ID >= 0) {
            // Read NAME for error messages
            sSelectTag = 'select id, name,vanity_code from "sap.ino.db.tag::t_tag" where id = ?';
            aExistingTag = oContext.getHQ().statement(sSelectTag).execute(oTag.TAG_ID);
            if (aExistingTag.length >= 1) {
                oTag.NAME =  aExistingTag[0].NAME;
                oTag.VANITY_CODE =  aExistingTag[0].VANITY_CODE;
            }
            return false;
        }

        // Check really if tag does not exist as otherwise clients could create endlessly the same tags
        if (!oTag.NAME) {
            return false;
        }
        
        sSelectTag = 'select id from "sap.ino.db.tag::t_tag" where UPPER(name) = UPPER(?)';
        aExistingTag = oContext.getHQ().statement(sSelectTag).execute(oTag.NAME);
        if (aExistingTag.length >= 1) {
            oTag.TAG_ID = aExistingTag[0].ID;
            return false;
        }
        return true;
    });

    if (_.size(aNewTags) === 0) {
        return;
    }

    // Ensure no duplicates within the new tags
    var aDuplicates = check.containsDuplicates("NAME", true, aNewTags);
    if (aDuplicates && aDuplicates.length > 0) {
        _.each(aDuplicates, function(oTag) {
            addMessage(Message.MessageSeverity.Error, TagMessage.DUPLICATE_TAG_ASSIGN, vKey, "Tags", "NAME", oTag.NAME);
        });
        // continue creation only with the other ones
        aNewTags = _.difference(aNewTags, aDuplicates);
    }

    var Tag = $.import("sap.ino.xs.aof.core", "framework").getApplicationObject("sap.ino.xs.object.tag.Tag");

    _.each(aNewTags, function(oNewTag) {
        var oCreateResponse = Tag.create({
            ID : oNewTag.ID, // the id of the tag assignment is used so that error messages are assigned correctly
            NAME : oNewTag.NAME
        });

        oNewTag.TAG_ID = oCreateResponse.generatedKeys && oCreateResponse.generatedKeys[oNewTag.ID];

        _.each(oCreateResponse.messages, function(oMessage) {
            // Parameters are passed as varargs
            var aArguments = [oMessage.severity, oMessage.messageKey, oMessage.refKey, "Tags", oMessage.refAttribute].concat(oMessage.parameters);
            addMessage.apply(undefined, aArguments);
        });
    });
}

function mergeTagAssignments(oParameters, oBulkAccess, addMessage, getNextHandle, oContext) {
    _.each(oParameters.mergingTagIDs, function(iMergingTagID) {
        var oResponse = oBulkAccess.update({
            Tags : {
                TAG_ID : oParameters.leadingTagID,
                Root : {
                    CHANGED_BY_ID : oContext.getUser().ID,
                    CHANGED_AT : oContext.getRequestTimestamp()
                }
            }
        }, {
            condition : 'tag_id = ? ' + 'and object_id not in ' + '(select object_id from "sap.ino.db.tag::t_object_tag" as tags2 ' + 'where tags2.object_id = tags.object_id and tags2.object_type_code = tags.object_type_code and tags2.tag_id=?)',
            conditionParameters : [iMergingTagID, oParameters.leadingTagID],
            conditionNodeAlias : "tags"
        });
        addMessage(oResponse.messages);
    });
}

function mergeTagAssignmentsProperties(oParameters, oBulkAccess, addMessage, oContext, oActionMetadata, oMetadata) {
    // We cannot reuse the execution logic in simulate mode. As the counting does not work correctly
    // when being done in the loop. Objects with multiple assigned tags are counted twice. Ideas where
    // the replaced tag is already there are not counted at all

    if (!oParameters || !oParameters.mergingTagIDs || oParameters.mergingTagIDs.length === 0) {
        return {
            "AFFECTED_OBJECTS_COUNT" : 0
        };
    }

    var aTagConditions = _.map(oParameters.mergingTagIDs, function(iTagID) {
        return "tag_id = ?";
    });

    var sCount = '\
        select to_integer(count(distinct object_id)) as count\
        from "sap.ino.db.tag::t_object_tag" \
        where (' + aTagConditions.join(" or ") + ')\
                and object_type_code = ?';

    var sObjectTypeCode = oMetadata.getNodeMetadata("Tags").attributes.OBJECT_TYPE_CODE.constantKey;
    var aResult = oContext.getHQ().statement(sCount).execute(oParameters.mergingTagIDs.concat([sObjectTypeCode]));

    return {
        "AFFECTED_OBJECTS_COUNT" : aResult[0].COUNT,
    };
}

function getDeleteTagAssignmentsBulkStatement(oContext) {
    return {
        Tags : {
            Root : {
                CHANGED_BY_ID : oContext.getUser().ID,
                CHANGED_AT : oContext.getRequestTimestamp()
            }
        }
    };
}

function getDeleteTagAssignmentsBulkCondition(iTagID) {
    return {
        condition : 'tag_id = ?',
        conditionParameters : [iTagID]
    };
}

function deleteTagAssignments(iTagID, oBulkAccess, addMessage, getNextHandle, oContext) {
    var oStatement = getDeleteTagAssignmentsBulkStatement(oContext);
    var oCondition = getDeleteTagAssignmentsBulkCondition(iTagID);
    var oResponse = oBulkAccess.del(oStatement, oCondition, false);
    addMessage(oResponse.messages);
}

function deleteTagAssignmentsProperties(iTagID, oBulkAccess, addMessage, oContext) {
    var oStatement = getDeleteTagAssignmentsBulkStatement(oContext);
    var oCondition = getDeleteTagAssignmentsBulkCondition(iTagID);
    var oResponse = oBulkAccess.del(oStatement, oCondition, true);
    // simulative call
    addMessage(oResponse.messages);

    return {
        "AFFECTED_OBJECTS" : oResponse.affectedNodes.Root.count
    };
}