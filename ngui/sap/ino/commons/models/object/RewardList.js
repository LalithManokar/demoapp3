/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObject",
    "sap/ino/commons/models/core/CodeModel",
    "sap/ino/commons/application/Configuration",
    "sap/ui/model/type/Float",
    "sap/ui/model/type/Integer",
    "sap/ui/core/message/Message",
    "sap/ui/core/MessageType",
    "sap/ui/model/ParseException",
    "sap/ino/commons/models/core/ReadSource"
], function(ApplicationObject,
	CodeModel,
	Configuration,
	Float,
	Integer,
	Message,
	MessageType,
	ParseException,
	ReadSource) {
	"use strict";

	var RewardList = ApplicationObject.extend("sap.ino.commons.models.object.RewardList", {
		objectName: "sap.ino.xs.object.reward.RewardList",
		readSource: ReadSource.getDefaultODataSource("IdeaRewardList", {}),
		invalidation: {
			entitySets: ["IdeaRewardList", "RewardSearch", "IdeaMediumBackofficeSearch", "IdeaReward"]
		},
		actionImpacts: {
			"create": [{
				"objectName": "sap.ino.commons.models.object.Idea",
				"objectKey": "IDEA_ID",
				"impactedAttributes": ["CONTRIBUTION_READ_ONLY", "IDEA_PHASE_NEED_REWARD", "IDEA_HAS_REWARDS"]
			}],
			"del": [{
				"objectName": "sap.ino.commons.models.object.Idea",
				"objectKey": "IDEA_ID",
				"impactedAttributes": ["CONTRIBUTION_READ_ONLY", "IDEA_PHASE_NEED_REWARD", "IDEA_HAS_REWARDS"]
			}]
		},
		determinations: {
			onCreate: _determineCreate
		}
	});

	function _determineCreate(oData, oModel) {
		var oCurrentUser = Configuration.getCurrentUser();
		return {
			"CREATED_AT": new Date(),
			"CREATED_BY_NAME": oCurrentUser.NAME,
			"OBJECT_TYPE_CODE": "IDEA",
			"STATUS_CODE": "sap.ino.config.REWARD_DRAFT",
			"OBJECT_ID": oData.OBJECT_ID || 0
		};
	}

	return RewardList;
});