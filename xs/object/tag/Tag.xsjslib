const check = $.import("sap.ino.xs.aof.lib", "check");
const determine = $.import("sap.ino.xs.aof.lib", "determination");
const TagMessage = $.import("sap.ino.xs.object.tag", "message");
const Message = $.import("sap.ino.xs.aof.lib", "message");
const AOF = $.import("sap.ino.xs.aof.core", "framework");
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

this.definition = {
	actions: {
		create: {
			authorizationCheck: false
		},
		update: {
			authorizationCheck: false
		},
		del: {
			authorizationCheck: false,
			customProperties: deleteProperties
		},
		read: {
			authorizationCheck: false
		},
		reindex: {
			isStatic: true,
			authorizationCheck: false,
			execute: reindex
		},
		merge: {
			authorizationCheck: false,
			execute: merge,
			isStatic: false,
			customProperties: mergeProperties,
			impacts: ["sap.ino.xs.object.tag.Tag"]
		},
		mergeAllSimilarTags: {
			authorizationCheck: false,
			execute: mergeAllSimilarTags,
			isStatic: false,
			enabledCheck: mergeAllSimilarTagsEnabledCheck,
			customProperties: mergeAllSimilarTagsProperties
		}
	},
	Root: {
		table: "sap.ino.db.tag::t_tag",
		sequence: "sap.ino.db.tag::s_tag",
		consistencyChecks: [check.duplicateAlternativeKeyCheck("NAME", TagMessage.DUPLICATE_TAG, true), checkSpecialCharacters, 
					checkSpecialCharactersForVanityCode],
		determinations: {
			onModify: [determine.systemAdminData, removeLeadingOrTrailingWhitespace],
			onPersist: [updateIndex],
			onDelete: [deleteTagAssignments]
		},
		attributes: {
			ID: {
				isPrimaryKey: true
			},
			NAME: {
				required: true,
				isName: true
			},
			CREATED_AT: {
				readOnly: true
			},
			CREATED_BY_ID: {
				readOnly: true
			},
			CHANGED_AT: {
				readOnly: true,
				concurrencyControl: true
			},
			CHANGED_BY_ID: {
				readOnly: true
			}
		},
		nodes: {
			MemberOf: {
				table: "sap.ino.db.tag::t_assignment_tag",
				sequence: "sap.ino.db.tag::s_assignment_tag",
				parentKey: "TAG_ID",
				consistencyChecks: [check.duplicateCheck("TAG_GROUP_ID", TagMessage.TAG_DUPLICATE_GROUP_ASSIGNMENT)],
				attributes: {
					TAG_GROUP_ID: {
						required: true,
						foreignKeyTo: "sap.ino.xs.object.tag.TagGroup.Root"
					},
					OBJECT_TYPE_CODE: {
						readOnly: false
					},
					SEQUENCE_NO: {
						readOnly: false
					}
				}
			}
		}
	}
};

function mergeAllSimilarTags(vKey, oParameters, oWorkObject, addMessage, getNextHandle, oContext) {
	var aTags = _.uniq(_.pluck(retrieveSimilarTags(vKey, oContext), "SOURCE_ID"));
	merge(vKey, aTags, oWorkObject, addMessage, getNextHandle, oContext);

}

function mergeAllSimilarTagsProperties(vKey, oParameters, oWorkObject, addMessage, oContext, oNodeMetadata) {
	var aTags = _.uniq(_.pluck(retrieveSimilarTags(vKey, oContext), "SOURCE_ID"));
	return mergeProperties(vKey, aTags, oWorkObject, addMessage, oContext, oNodeMetadata);
}

function mergeAllSimilarTagsEnabledCheck(vKey, oPersistedObject, addMessage, oContext) {
	// false, if no tag is available in the table
	if (retrieveSimilarTags(vKey, oContext).length === 0) {
		addMessage(Message.MessageSeverity.Error, undefined, vKey, undefined, undefined);
	}
}

// Helper function to retrieve similar tags IDs from t_tag_similarity
function retrieveSimilarTags(vKey, oContext) {
	var hq = oContext.getHQ();
	return hq.statement('select SOURCE_ID from "SAP_INO"."sap.ino.db.tag::t_tag_similarity" where  TARGET_ID = ?').execute(vKey);
}

// Helper function to retrieve tag Names from t_tag
function retrieveTagNames(aIds, oContext) {
	var hq = oContext.getHQ();
	if (aIds === null || aIds.length === 0 || !_.isArray(aIds)) {
		return {};
	}
	var aParameters = [];
	for (var i = 0; i < aIds.length; i++) {
		aParameters.push("ID =?");
	}
	var sParameters = aParameters.join(" OR ");

	return hq.statement('select NAME, ID from "SAP_INO"."sap.ino.db.tag::t_tag" where  ' + sParameters).execute(aIds);
}

function deleteTagAssignments(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext, oNodeMetadata) {
	var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
	var Campaign = AOF.getApplicationObject("sap.ino.xs.object.campaign.Campaign");
	var Responsibility = AOF.getApplicationObject("sap.ino.xs.object.subresponsibility.ResponsibilityStage");
	var TagGroup = AOF.getApplicationObject("sap.ino.xs.object.tag.TagGroup");
	var Blog = AOF.getApplicationObject("sap.ino.xs.object.blog.Blog");

	var oIdeaResponse = Idea.deleteTagAssignments(vKey);
	addMessage(oIdeaResponse.messages);

	var oCampaignResponse = Campaign.deleteTagAssignments(vKey);
	addMessage(oCampaignResponse.messages);

	var oResponsibilityResponse = Responsibility.deleteTagAssignments(vKey);
	addMessage(oResponsibilityResponse.messages);

	var oTagGroupResponse = TagGroup.deleteTagAssignments(vKey);
	addMessage(oTagGroupResponse.messages);

	var oBlogResponse = Blog.deleteTagAssignments(vKey);
	addMessage(oBlogResponse.messages);
}

function deleteProperties(vKey, oParameters, oTag, addMessage, oContext) {
	var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
	var Campaign = AOF.getApplicationObject("sap.ino.xs.object.campaign.Campaign");

	var oIdeaResponse = Idea.staticProperties({
		actions: [{
			name: "deleteTagAssignments",
			parameters: vKey
        }]
	});

	var oCampaignResponse = Campaign.staticProperties({
		actions: [{
			name: "deleteTagAssignments",
			parameters: vKey
        }]
	});

	return {
		"AFFECTED_IDEAS_COUNT": oIdeaResponse.actions.deleteTagAssignments.customProperties.AFFECTED_OBJECTS,
		"AFFECTED_CAMPAIGNS_COUNT": oCampaignResponse.actions.deleteTagAssignments.customProperties.AFFECTED_OBJECTS,
	};
}

function merge(vKey, aParameters, oWorkObject, addMessage, getNextHandle, oContext) {
	var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
	var Tag = AOF.getApplicationObject("sap.ino.xs.object.tag.Tag");
	var Campaign = AOF.getApplicationObject("sap.ino.xs.object.campaign.Campaign");
	var Responsibility = AOF.getApplicationObject("sap.ino.xs.object.subresponsibility.ResponsibilityStage");
	var TagGroup = AOF.getApplicationObject("sap.ino.xs.object.tag.TagGroup");
	var Blog = AOF.getApplicationObject("sap.ino.xs.object.blog.Blog");

	var aValidParameters = validateMergeParameters(aParameters, vKey, Tag, addMessage);
	if (aValidParameters.length === 0) {
		return false;
	}
	aParameters = aValidParameters;

	var oResponseIdea = Idea.mergeTagAssignments({
		leadingTagID: vKey,
		mergingTagIDs: aParameters
	});
	addMessage(oResponseIdea.messages);

	var oResponseCampaign = Campaign.mergeTagAssignments({
		leadingTagID: vKey,
		mergingTagIDs: aParameters
	});
	addMessage(oResponseCampaign.messages);

	var oResponseResponsibility = Responsibility.mergeTagAssignments({
		leadingTagID: vKey,
		mergingTagIDs: aParameters
	});
	addMessage(oResponseResponsibility.messages);

	var oResponseTagGroup = TagGroup.mergeTagAssignments({
		leadingTagID: vKey,
		mergingTagIDs: aParameters
	});
	addMessage(oResponseTagGroup.messages);

	var oResponseBlog = Blog.mergeTagAssignments({
		leadingTagID: vKey,
		mergingTagIDs: aParameters
	});
	addMessage(oResponseBlog.messages);

	_.each(aParameters, function(iTagID) {
		var oResponse = Tag.del(iTagID);
		addMessage(oResponse.messages);
	});
	return true;
}

function mergeProperties(vKey, aParameters, oWorkObject, addMessage, oContext, oNodeMetadata) {
	var Idea = AOF.getApplicationObject("sap.ino.xs.object.idea.Idea");
	var Tag = AOF.getApplicationObject("sap.ino.xs.object.tag.Tag");
	var Campaign = AOF.getApplicationObject("sap.ino.xs.object.campaign.Campaign");

	if (aParameters !== null && aParameters !== undefined) {
		var aValidParameters = validateMergeParameters(aParameters, vKey, Tag, addMessage);
		aParameters = aValidParameters;
	}

	var oIdeaResponse = Idea.staticProperties({
		actions: [{
			name: "mergeTagAssignments",
			parameters: {
				leadingTagID: vKey,
				mergingTagIDs: aParameters
			}
        }]
	});

	var oCampaignResponse = Campaign.staticProperties({
		actions: [{
			name: "mergeTagAssignments",
			parameters: {
				leadingTagID: vKey,
				mergingTagIDs: aParameters
			}
        }]
	});

	return {
		"AFFECTED_IDEAS_COUNT": oIdeaResponse.actions.mergeTagAssignments.customProperties.AFFECTED_OBJECTS_COUNT,
		"AFFECTED_CAMPAIGNS_COUNT": oCampaignResponse.actions.mergeTagAssignments.customProperties.AFFECTED_OBJECTS_COUNT,
		"AFFECTED_OBJECTS": retrieveTagNames(aParameters, oContext)
	};
}

// returns false if tag does not exist or oParameters is empty
function validateMergeParameters(aParameters, vKey, Tag, addMessage) {
	aParameters = _.uniq(_.without(aParameters, vKey));
	if (aParameters === null || aParameters === undefined || aParameters.length === 0) {
		addMessage(Message.MessageSeverity.Error, TagMessage.TAG_IS_NOT_VALID, undefined, undefined, vKey);
		return [];
	}
	var tagsNotExisting = false;
	_.each(aParameters, function(tagID) {
		if (!Tag.exists(tagID)) {
			addMessage(Message.MessageSeverity.Error, TagMessage.TAG_DOES_NOT_EXIST, undefined, undefined, vKey);
			tagsNotExisting = true;
		}
	});
	if (tagsNotExisting) {
		return [];
	}
	return aParameters;
}

function checkSpecialCharacters(vKey, oTag, addMessage, oContext) {
	// deny special characters
	if (/[\;+\,+]/.exec(oTag.NAME)) {
		addMessage(Message.MessageSeverity.Error, TagMessage.SPECIAL_CHARACTER_TAG, vKey, undefined, "NAME");
	}
}

function removeLeadingOrTrailingWhitespace(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext, oNodeMetadata) {
	oWorkObject.NAME = oWorkObject.NAME.replace(/^\s+|\s+$/g, '');
}

// The tags have an inverse trigram index and a similarity matrix.
// Those are used for matching "similar" tags.
const
	max_editDistance_for_similar_tags = 4;

function reindex(oParameters, oBulkAccess, addMessage, getNextHandle, oContext) {
	const oHQ = oContext.getHQ();
	reindexAllTags(oHQ);
}

function reindexAllTags(oHQ) {
	recomputeAllTrigrams(oHQ);

	oHQ.statement('delete from "SAP_INO"."sap.ino.db.tag::t_tag_similarity"').execute();

	var aRelatedTags = readRelatedTags(oHQ);
	determineRelevantTagRelations(oHQ, aRelatedTags);
}

function updateIndex(vKey, oWorkObject, oPersistedObject, addMessage, getNextHandle, oContext, oNodeMetadata) {
	const
		hq = oContext.getHQ();

	var isDelete = oContext.getAction().name == AOF.Action.Del;
	var oTag = oWorkObject;

	RecomputeTrigramsForTags(hq, oTag.ID, oTag.NAME, isDelete);

	hq.statement('delete from "SAP_INO"."sap.ino.db.tag::t_tag_similarity" where ? in (SOURCE_ID, TARGET_ID)').execute(oTag.ID);
	if (isDelete) {
		return;
	}

	var aRelatedTags = readTagRelatedTags(hq, oTag.ID);
	determineRelevantTagRelations(hq, aRelatedTags);
}

function determineRelevantTagRelations(hq, aRelatedTags) {
	_.each(aRelatedTags, function(relation) {
		relation.editDistance = editDistance(relation.SOURCE_TAG, relation.TARGET_TAG, max_editDistance_for_similar_tags);
	});
	aRelatedTags = _.filter(aRelatedTags, function(relation) {
		return relation.editDistance <= max_editDistance_for_similar_tags;
	});

	var insert_tag_similarity = hq.statement(
		'insert into "SAP_INO"."sap.ino.db.tag::t_tag_similarity" (source_id, target_id, edit_distance) values(? ,?, ?)');
	_.each(aRelatedTags, function(relation) {
		insert_tag_similarity.execute(relation.SOURCE_TAG_ID, relation.TARGET_TAG_ID, relation.editDistance);
		insert_tag_similarity.execute(relation.TARGET_TAG_ID, relation.SOURCE_TAG_ID, relation.editDistance);
	});
}

function determineTrigrams(word) {
	var trigrams = [];
	var normalized_word = ' ' + word.toLowerCase() + ' ';
	for (var i = 0; i < normalized_word.length - 2; ++i) {
		trigrams.push(normalized_word.slice(i, i + 3));
	}
	return _.uniq(trigrams);
}

function recomputeAllTrigrams(hq) {
	hq.statement('delete from "SAP_INO"."sap.ino.db.tag::t_tag_trigram_index"').execute();

	var aTags = hq.statement('SELECT ID, NAME FROM "SAP_INO"."sap.ino.db.tag::t_tag"').execute();

	var insertTrigram = hq.statement('insert into "SAP_INO"."sap.ino.db.tag::t_tag_trigram_index" (trigram, tag_id) values(? ,?)');
	_.each(aTags, function(o_tag) {
		_.each(determineTrigrams(o_tag.NAME), function(s_trigram) {
			insertTrigram.execute(s_trigram, o_tag.ID);
		});
	});
}

function RecomputeTrigramsForTags(hq, tagID, tagName, isDelete) {
	hq.statement('delete from "SAP_INO"."sap.ino.db.tag::t_tag_trigram_index" where TAG_ID = ?').execute(tagID);

	if (isDelete) {
		return;
	}

	var insertTrigram = hq.statement('insert into "SAP_INO"."sap.ino.db.tag::t_tag_trigram_index" (trigram, tag_id) values(? ,?)');
	_.each(determineTrigrams(tagName), function(sTrigram) {
		insertTrigram.execute(sTrigram, tagID);
	});
}

function readRelatedTags(hq) {
	var aRelatedTags = hq.statement('select distinct' + '    inds.tag_id as source_tag_id,' + '    s.name      as source_tag,' +
		'    indt.tag_id as target_tag_id,' + '    t.name      as target_tag ' + 'from' +
		'    "SAP_INO"."sap.ino.db.tag::t_tag_trigram_index" as inds,' + '    "SAP_INO"."sap.ino.db.tag::t_tag"               as s, ' +
		'    "SAP_INO"."sap.ino.db.tag::t_tag_trigram_index" as indt,' + '    "SAP_INO"."sap.ino.db.tag::t_tag"               as t  ' + 'where' +
		'    inds.trigram = indt.trigram ' + 'and inds.tag_id  < indt.tag_id ' + 'and s.id = inds.tag_id ' + 'and t.id = indt.tag_id ').execute();
	return aRelatedTags;
}

function readTagRelatedTags(hq, tag_id) {
	var aRelatedTags = hq.statement('select distinct' + '    inds.tag_id as source_tag_id,' + '    s.name      as source_tag,' +
		'    indt.tag_id as target_tag_id,' + '    t.name      as target_tag ' + 'from' +
		'    "SAP_INO"."sap.ino.db.tag::t_tag_trigram_index" as inds,' + '    "SAP_INO"."sap.ino.db.tag::t_tag"               as s, ' +
		'    "SAP_INO"."sap.ino.db.tag::t_tag_trigram_index" as indt,' + '    "SAP_INO"."sap.ino.db.tag::t_tag"               as t  ' + 'where' +
		'    inds.trigram = indt.trigram ' + 'and s.id = inds.tag_id ' + 'and t.id = indt.tag_id ' + 'and s.id = ?' + 'and t.id != ?').execute(
		tag_id, tag_id);
	return aRelatedTags;
}

function min3(a, b, c) {
	return Math.min(a, Math.min(b, c));
}

function editDistance(sSource, sTarget, max) {
	// max = max edit distance, anything above max will return max+1
	var n = sSource.length;
	var m = sTarget.length;

	if (Math.abs(n - m) > max) {
		return max + 1;
	}

	sSource = sSource.toLowerCase();
	sTarget = sTarget.toLowerCase();

	if (sSource == sTarget) {
		return 0;
	}

	var aPrev = [];
	var aCurrent = [];
	for (var j = 0; j <= Math.min(m, max + 1); ++j) {
		aCurrent[j] = j;
	}
	for (var i = 1; i <= n; i++) {
		aPrev = aCurrent;
		aCurrent = [];

		if (i <= max) {
			aCurrent[0] = i;
		} else {
			aCurrent[Math.max(1, i - max) - 1] = max + 1;
		}
		for (j = Math.max(1, i - max); j <= Math.min(m, i + max); j++) {
			var cost = ((sSource.charAt(i - 1) == (sTarget.charAt(j - 1))) ? 0 : 1);
			aCurrent[j] = min3(aPrev[j] + 1, aCurrent[j - 1] + 1, aPrev[j - 1] + cost);
		}
		aCurrent[j] = max + 1;
	}
	return aCurrent[m] <= max ? aCurrent[m] : max + 1;
}

function checkSpecialCharactersForVanityCode(vKey, oTag, addMessage, oContext) {
	// deny special characters
	if (oTag.VANITY_CODE && !/^([a-zA-Z]|\d|-|_){1,30}$/.test(oTag.VANITY_CODE)) {
		addMessage(Message.MessageSeverity.Error, TagMessage.TAG_INVALID_VANITY_CODE, vKey, undefined, "VANITY_CODE");
	}
}

//end