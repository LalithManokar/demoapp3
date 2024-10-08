/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObject",
    "sap/ino/commons/models/core/ReadSource"
], function(ApplicationObject, ReadSource) {
	"use strict";

	var Vote = ApplicationObject.extend("sap.ino.commons.models.object.Vote", {
		objectName: "sap.ino.xs.object.idea.Vote",
		readSource: ReadSource.getDefaultAOFSource(),
		invalidation: {
			entitySets: ["IdeaVote"]
		},
		actionImpacts: {
			"del": [{
				"objectName": "sap.ino.commons.models.object.Idea",
				"objectKey": "IDEA_ID",
				"impactedAttributes": ["NEG_VOTES", "POS_VOTES", "SCORE", "USER_SCORE", "VOTE_COUNT", "VOTE_ID","FOLLOW"]
			}],
			"create": [{
				"objectName": "sap.ino.commons.models.object.Idea",
				"objectKey": "IDEA_ID",
				"impactedAttributes": ["NEG_VOTES", "POS_VOTES", "SCORE", "USER_SCORE", "VOTE_COUNT", "VOTE_ID","FOLLOW"]
			}],
			"update": [{
				"objectName": "sap.ino.commons.models.object.Idea",
				"objectKey": "IDEA_ID",
				"impactedAttributes": ["NEG_VOTES", "POS_VOTES", "SCORE", "USER_SCORE", "VOTE_COUNT", "VOTE_ID","FOLLOW"]
			}]
		}
	});

	Vote.TYPE_STAR = "STAR";
	Vote.TYPE_LIKE = "LIKE";
	Vote.TYPE_LIKE_DISLIKE = "LIKE_DISLIKE";

	Vote.vote = function(iObjectId, iScore, iVoteId, iReasonCode, sReasonComment) {
		if (!iScore) {
			return {
				vote: Vote.del(iVoteId || -1, {
					IDEA_ID: iObjectId
				}),
				mode: "DEL_VOTE"
			};
		} else {
			return {
				vote: Vote.modify(iVoteId || -1, {
					IDEA_ID: iObjectId,
					SCORE: iScore,
					VOTE_REASON: iReasonCode,
					VOTE_COMMENT: sReasonComment
				}),
				mode: "MODIFY_VOTE"
			};
		}
	};

	return Vote;
});