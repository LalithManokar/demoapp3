const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");
var AttachmentAssignment = $.import("sap.ino.xs.object.attachment", "Assignment");
var TextBundle = $.import("sap.ino.xs.xslib", "textBundle");
var status = $.import("sap.ino.xs.object.status", "Status");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var IAMMessage = $.import("sap.ino.xs.object.iam", "message");
var DimensionMessage = $.import("sap.ino.xs.object.gamification", "message");

const aActivityObject = [
	{
		"CODE": "SUBMIT_IDEA",
		"PHASE_CONFIGURABLE": false,
		"TIME_CONFIGURABLE": false
                            },
	{
		"CODE": "VOTE_IDEA",
		"PHASE_CONFIGURABLE": false,
		"TIME_CONFIGURABLE": false
                            },
	{
		"CODE": "CREATE_IDEA_EVALUATION",
		"PHASE_CONFIGURABLE": false,
		"TIME_CONFIGURABLE": false
                            },
	{
		"CODE": "CHANGE_IDEA_PHASE",
		"PHASE_CONFIGURABLE": true,
		"TIME_CONFIGURABLE": false
                            },
	{
		"CODE": "CHANGE_IDEA_STATUS_TYPE_TO_IN_PROCESS",
		"PHASE_CONFIGURABLE": true,
		"TIME_CONFIGURABLE": false
                            },
	{
		"CODE": "CHANGE_IDEA_STATUS_TYPE_TO_COMPLETED",
		"PHASE_CONFIGURABLE": true,
		"TIME_CONFIGURABLE": false
                            },
	{
		"CODE": "CHANGE_IDEA_STATUS_TYPE_TO_DISCONTINUED",
		"PHASE_CONFIGURABLE": false,
		"TIME_CONFIGURABLE": false
                            },
	{
		"CODE": "CHANGE_IDEA_STATUS_TYPE_TO_COMPLETED_FOR_COACH",
		"PHASE_CONFIGURABLE": true,
		"TIME_CONFIGURABLE": false
                            },
	{
		"CODE": "CREATE_IDEA_COMMENT",
		"PHASE_CONFIGURABLE": false,
		"TIME_CONFIGURABLE": false
                            },
	{
		"CODE": "REPLY_IDEA_COMMENT",
		"PHASE_CONFIGURABLE": false,
		"TIME_CONFIGURABLE": true
                            },
	{
		"CODE": "DELETE_IDEA",
		"PHASE_CONFIGURABLE": true,
		"TIME_CONFIGURABLE": false
                            },
	{
		"CODE": "DELETE_IDEA_COMMENT",
		"PHASE_CONFIGURABLE": false,
		"TIME_CONFIGURABLE": false
                            },
	{
		"CODE": "DELETE_IDEA_EVALUATION",
		"PHASE_CONFIGURABLE": false,
		"TIME_CONFIGURABLE": false
                            },
	{
		"CODE": "DELETE_IDEA_REPLED_COMMENT",
		"PHASE_CONFIGURABLE": false,
		"TIME_CONFIGURABLE": false
                            },
	{
		"CODE": "UNVOTE_IDEA",
		"PHASE_CONFIGURABLE": false,
		"TIME_CONFIGURABLE": false
                            }

                        ];

this.definition = {
	Root: {
		table: "sap.ino.db.gamification::t_dimension",
		sequence: "sap.ino.db.gamification::s_dimension",
		determinations: {
			onModify: [determine.systemAdminData]
		},
		attributes: {
			ID: {
				isPrimaryKey: true
			},
			CREATED_AT: {
				readOnly: true
			},
			CREATED_BY_ID: {
				readOnly: true,
				foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
			},
			CHANGED_AT: {
				readOnly: true,
				concurrencyControl: true
			},
			CHANGED_BY_ID: {
				readOnly: true,
				foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
			},
			NAME: {
				required: true
			},
			UNIT: {
				required: true
			},
			TECHNICAL_NAME: {
				required: true
			},
			SCOPE: {
				required: true
			},
			STATUS: {
				required: true
			},
			DESCRIPTION: {
				required: false
			},
			REDEEM: {
				required: true
			}
		},
		nodes: {
			Activity: {
				table: "sap.ino.db.gamification::t_activity",
				sequence: "sap.ino.db.gamification::s_activity",
				parentKey: "DIMENSION_ID",
				attributes: {
					ID: {
						isPrimaryKey: true
					},
					CODE: {
						required: true
					},
					PHASE_CODE: {
						required: false
					},
					WITHIN_TIME: {
						required: false
					},
					TIME_UNIT: {
						required: false
					},
					VALUE: {
						required: true
					}
				}
			},
			Badge: {
				table: "sap.ino.db.gamification::t_badge",
				sequence: "sap.ino.db.gamification::s_badge",
				parentKey: "DIMENSION_ID",
				attributes: {
					NAME: {
						required: true
					},
					BADGE_VALUE: {
						required: true
					},
					DESCRIPTION: {
						required: false
					}
				},
				nodes: {
					Attachment: AttachmentAssignment.node(AttachmentAssignment.ObjectType.Dimension)
				}
			}
		}
	},
	actions: {
		read: {
			authorizationCheck: false
		},
		create: {
			authorizationCheck: false,
			executionCheck: modifyExecutionCheck,
			historyEvent: "DIMENSION_CREATED"
		},
		copy: {
			authorizationCheck: false,
			executionCheck: modifyExecutionCheck,
			historyEvent: "DIMENSION_CREATED"
		},
		update: {
			authorizationCheck: false,
			executionCheck: modifyExecutionCheck,
			historyEvent: "DIMENSION_UPDTATED"
		},
		del: {
			authorizationCheck: false,
			executionCheck: deleteExecutionCheck,
			historyEvent: "DIMENSION_DELETED"
		},
		getAllActivities: {
			authorizationCheck: false,
			execute: getAllActivities,
			isStatic: true
		},
		getLeaderBoardByDimension: {
			authorizationCheck: false,
			execute: getLeaderBoardByDimension,
			isStatic: true
		},
		getAllActiveDimension: {
			authorizationCheck: false,
			execute: getAllActiveDimension,
			isStatic: true
		}
	}
};

function modifyExecutionCheck(vKey, oChangeRequest, oDimension, oPersistedDimension, addMessage, oContext) {
	if (oPersistedDimension) {
		if (oPersistedDimension.TECHNICAL_NAME !== oDimension.TECHNICAL_NAME) {
			addMessage(Message.MessageSeverity.Error, DimensionMessage.DIMENSION_TECHNICAL_NAME_NOT_CHANGED, oDimension.ID, "Root");
			return;
		}
	} else {
		var oTechnicalNameSelectStatment = oContext.getHQ().statement(
			'select id from "sap.ino.db.gamification::t_dimension" where technical_name = ?');
		var aTechnicalNameSelectResult = oTechnicalNameSelectStatment.execute(oDimension.TECHNICAL_NAME);
		if (aTechnicalNameSelectResult.length > 0) {
			addMessage(Message.MessageSeverity.Error, DimensionMessage.DIMENSION_TECHNICAL_NAME_DUPLICATED, oDimension.ID, "Root");
			return;
		}
	}

	if (!oPersistedDimension || (!oPersistedDimension.STATUS && oDimension.STATUS === 1)) {
		var oStatment = oContext.getHQ().statement(
			'select id from "sap.ino.db.gamification::t_dimension" where status = 1');
		var aResult = oStatment.execute();
		if (oDimension.STATUS === 1 && aResult.length >= 5) {
			addMessage(Message.MessageSeverity.Error, DimensionMessage.DIMENSION_ONLY_FIVE_ACTIVE, oDimension.ID, "Root");
			return;
		}
	}
	updateActivitiesExecutionCheck(vKey, oChangeRequest, oDimension, oPersistedDimension, addMessage, oContext);
	updateBadgesExecutionCheck(vKey, oChangeRequest, oDimension, oPersistedDimension, addMessage, oContext);
}

function updateActivitiesExecutionCheck(vKey, oChangeRequest, oDimension, oPersistedDimension, addMessage, oContext) {
	if (oDimension.Activity.length === 0) {
		addMessage(Message.MessageSeverity.Error, DimensionMessage.DIMENSION_ACTIVITY_AT_LEAST_ONE_EXISTED, vKey, "Root");
		return;
	}
	const dictionaryForDimension = {};
	oDimension.Activity.forEach(function(dimension) {
		if (dictionaryForDimension[dimension.CODE]) {
			dictionaryForDimension[dimension.CODE].push(dimension);
		} else {
			dictionaryForDimension[dimension.CODE] = [dimension]
		}
	});
	var isDuplicatedActivity = false;
	var sDuplicatedString = '';
	oDimension.Activity.forEach(function(check, index) {
		if (!isDuplicatedActivity) {
			const aTempActivities = dictionaryForDimension[check.CODE].filter(function(source) {
				var sourceUnit = 1;
				var checkUnit = 1;
				if (source.TIME_UNIT === 'H') {
					sourceUnit = 1;
				} else if (source.TIME_UNIT === 'D') {
					sourceUnit = 24;
				}
				if (check.TIME_UNIT === 'H') {
					checkUnit = 1;
				} else if (check.TIME_UNIT === 'D') {
					checkUnit = 24;
				}
				return check.CODE === source.CODE && check.PHASE_CODE === source.PHASE_CODE && check.WITHIN_TIME * checkUnit === source.WITHIN_TIME *
					sourceUnit
			});
			if (aTempActivities.length > 1) {
				isDuplicatedActivity = true
				sDuplicatedString = aTempActivities[0].CODE
			}
		}
	});
	if (isDuplicatedActivity) {
		addMessage(Message.MessageSeverity.Error, DimensionMessage.DIMENSION_ACTIVITIES_DUPLICATED, vKey, "Root", "CODE", TextBundle.getText(
			"uitexts", "BO_GAMIFICATION_DIMENSION_ACTIVITY_" + sDuplicatedString, [], "", false, oContext.getHQ()));
		return;
	}
}

function updateBadgesExecutionCheck(vKey, oChangeRequest, oDimension, oPersistedDimension, addMessage, oContext) {
	if (oDimension.Badge.length > 1) {
		var isDupliacatedValue = false;
		var sDuplicatedString = '';
		oDimension.Badge.forEach(function(check) {
			if (!isDupliacatedValue) {
				const aTempBadge = oDimension.Badge.filter(function(source) {
					return check.BADGE_VALUE === source.BADGE_VALUE;
				});
				if (aTempBadge.length > 1) {
					isDupliacatedValue = true
					sDuplicatedString = aTempBadge[0].NAME
				}
			}
		});
		if (isDupliacatedValue) {
			addMessage(Message.MessageSeverity.Error, DimensionMessage.DIMENSION_BADGE_DUPLICATED_VALUE, vKey, "Root", "CODE", TextBundle.getText(
				"uitexts", sDuplicatedString, [], "", false, oContext.getHQ()));
			return;
		}
	}
}

function getAllActivities(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	return aActivityObject;
}

function activityProcessEntry(action_code, oWorkObj, aPersona, oContext, bProcessIdeaStatusType, bProcessIdeaRole) {
	const isEnabledGamification = readCampaignGamificationSetting(oWorkObj.CAMPAIGN_ID, oContext);
	// var isEnabledGamification = false;
	if (isEnabledGamification) {
		const curUserId = oContext.getUser().ID;
		if (bProcessIdeaStatusType) {
			action_code += processIdeaStatustype(oWorkObj);
		}
		if (bProcessIdeaRole) {
			var oProcessRes = processIdeaRole(oWorkObj, oContext, aPersona);
			action_code += oProcessRes.str;
			aPersona = oProcessRes.newPersona;
		}
		const aActivities = getAllActiveActivities(oContext, action_code, oWorkObj.CAMPAIGN_ID);
		if (aActivities && aActivities.length > 0) {
			if (action_code === 'REPLY_IDEA_COMMENT') {
				const Comment = AOF.getApplicationObject("sap.ino.xs.object.idea.Comment");
				var oParentComment = Comment.read(oWorkObj.PARENT_ID);
				const curTimeOffset = (new Date().valueOf() - new Date(oParentComment.CHANGED_AT).valueOf()) / 1000 / 3600;
				processActivitisHasWithinTime(oWorkObj, aActivities, aPersona, curUserId, curTimeOffset);
			} else {
				processActivities(oWorkObj, aActivities, aPersona, curUserId, oContext);
			}
		}
	}
}

function processIdeaStatustype(oWorkObject) {

	if (oWorkObject.STATUS_CODE) {
		var sStatusType = status.getStatusType(oWorkObject.STATUS_CODE);
		if (sStatusType) {
			return '_TYPE_TO_' + sStatusType + '%';
		} else {
			return '';
		}

	}

}

function processIdeaRole(oWorkObject, oContext, aPersona) {
	const curUserId = oContext.getUser().ID;
	const sQueryCurUserRole =
		`select * from "sap.ino.db.iam::t_object_identity_role" where object_id = ? and object_type_code = 'IDEA' and role_code = 'IDEA_COACH' and identity_id = ?`;
	var aIdeaCoach = oContext.getHQ().statement(sQueryCurUserRole).execute(oWorkObject.ID, curUserId);
	var sStatusType = status.getStatusType(oWorkObject.STATUS_CODE);
	if (aIdeaCoach.length > 0 && sStatusType === 'COMPLETED') {
		return {
			str: '_FOR_COACH',
			newPersona: generatePersona(oWorkObject, oContext, ['Coach'])

		}
	} else {
		return {
			str: '',
			newPersona: aPersona
		};
	}

}

function getAllActiveActivities(oContext, activity_code, campaign_id) {
	const sQueryActiveActivity =
		`select activity.* from "sap.ino.db.campaign::t_campaign_gamification_dimension"  as campaign
                        left outer join "sap.ino.db.gamification::t_activity" as activity
                        on campaign.dimension_id = activity.dimension_id
                        left outer join "sap.ino.db.gamification::t_dimension" as dimension
                        on dimension.id = campaign.dimension_id
                        where activity.CODE like ? and campaign.CAMPAIGN_ID = ? and dimension.status = 1`;
	var aActivities = oContext.getHQ().statement(sQueryActiveActivity).execute(activity_code, campaign_id);
	return aActivities;
}

function processActivities(oWorkObject, aActivities, aPersona, actorId, oContext) {
	const ActivityBO = AOF.getApplicationObject("sap.ino.xs.object.gamification.Activity");
	var oCreationResult = {};
	if (aActivities.length > 0) {
		var tempPersona;
		aActivities.forEach(function(item) {
			if (item.CODE === 'CHANGE_IDEA_STATUS_TYPE_TO_COMPLETED_FOR_COACH') {
				tempPersona = generatePersona(oWorkObject, oContext, ['Coach'])
			}
			if (item.PHASE_CODE && item.PHASE_CODE === oWorkObject.PHASE_CODE) {
				// do add activity record

				oCreationResult = ActivityBO.create({
					ID: -1,
					DIMENSION_ID: item.DIMENSION_ID,
					ACTOR_ID: actorId,
					OBJECT_ID: oWorkObject.ID,
					OBJECT_TYPE_CODE: 'IDEA',
					CODE: item.CODE,
					PHASE_CODE: item.PHASE_CODE,
					VALUE: item.VALUE,
					UserAffected: tempPersona ? tempPersona : aPersona
				});
			} else if (!item.PHASE_CODE && !item.WITHIN_TIME) {
				// do add record
				oCreationResult = ActivityBO.create({
					ID: -1,
					DIMENSION_ID: item.DIMENSION_ID,
					ACTOR_ID: actorId,
					OBJECT_ID: oWorkObject.ID,
					OBJECT_TYPE_CODE: 'IDEA',
					CODE: item.CODE,
					VALUE: item.VALUE,
					UserAffected: tempPersona ? tempPersona : aPersona
				});
			}

		});

	}
	return oCreationResult;
}

function processActivitisHasWithinTime(oWorkObject, aActivities, aPersona, actorId, curTimeOffset) {
	const ActivityBO = AOF.getApplicationObject("sap.ino.xs.object.gamification.Activity");
	aActivities.forEach(function(item) {
		if (item.TIME_UNIT === 'H') {
			item.timeOffset = item.WITHIN_TIME;
		} else if (item.TIME_UNIT === 'D') {
			item.timeOffset = item.WITHIN_TIME * 24;
		}
	});
	const oGroupedActivities = _.groupBy(aActivities, 'DIMENSION_ID');
	var oCreationResult = {};
	_.each(oGroupedActivities, function(arr, dimension_id) {
		var oFilteredActivity = null;
		const aSortedList = _.sortBy(arr, 'timeOffset');
		aSortedList.forEach(function(item) {
			if ((oFilteredActivity === null) && curTimeOffset <= item.timeOffset) {
				oFilteredActivity = item;
			}
		});
		// do add record
		if (oFilteredActivity !== null) {
			oCreationResult = ActivityBO.create({
				ID: -1,
				DIMENSION_ID: oFilteredActivity.DIMENSION_ID,
				ACTOR_ID: actorId,
				OBJECT_ID: oWorkObject.ID,
				OBJECT_TYPE_CODE: 'IDEA',
				CODE: oFilteredActivity.CODE,
				WITHIN_TIME: oFilteredActivity.WITHIN_TIME,
				TIME_UNIT: oFilteredActivity.TIME_UNIT,
				VALUE: oFilteredActivity.VALUE,
				UserAffected: aPersona
			});
		}
	})
	return oCreationResult
}

// generate persona for activity 
// possible value of aProperties : 'Submitter','Contributors','Coach','Experts','Actor'
function generatePersona(oWorkObject, oContext, aProperties) {
	const aIdentity = [];
	if (aProperties.indexOf('CreatedBy') > -1) {
		aIdentity.push({
			IDENTITY_ID: oWorkObject.CREATED_BY_ID
		});
	}
	if (aProperties.indexOf('Actor') > -1) {
		aIdentity.push({
			IDENTITY_ID: oContext.getUser().ID
		});
	} else {
		aProperties.forEach(function(item) {
			if (oWorkObject[item]) {
				oWorkObject[item].forEach(function(user) {
					aIdentity.push({
						IDENTITY_ID: user.IDENTITY_ID
					});
				});
			}
		});
	}

	return aIdentity;

}

//generate campaign id from idea id
function getCampaignIdByIdeaID(idea_id, oContext) {
	const sQueryCampaignID = `select CAMPAIGN_ID from "sap.ino.db.idea::t_idea" where id = ?`;
	var aCampaign = oContext.getHQ().statement(sQueryCampaignID).execute(idea_id);
	return aCampaign.length > 0 ? aCampaign[0].CAMPAIGN_ID : 0;
}

//read gamificationSetting from campaign
function readCampaignGamificationSetting(campaignId, oContext) {
	if (campaignId) {
		const sQueryCampaignGamificationSetting = `select IS_GAMIFICATION_ACTIVE from "sap.ino.db.campaign::t_campaign" where id = ?`;
		var aCampaign = oContext.getHQ().statement(sQueryCampaignGamificationSetting).execute(campaignId);
		return aCampaign[0].IS_GAMIFICATION_ACTIVE ? true : false;
	}
}

// generate user profile for gamification
function getUserProfileForGamification(sUserId, oHQ, sCurUserId) {
	if (sUserId) {
		var aGamification = [];
		var bSelfProfile = sUserId === sCurUserId;
		var AOFDimension = AOF.getApplicationObject("sap.ino.xs.object.gamification.Dimension");
		var sGamificationSettingQuery =
			`select top 1 IFNULL(publish_badge,'') as publish_badge from "sap.ino.db.gamification::t_gamification_setting"`;
		var aGamificationSettingRes = oHQ.statement(sGamificationSettingQuery).execute();
		var aPublishBadge = aGamificationSettingRes.length > 0 ? aGamificationSettingRes[0].PUBLISH_BADGE.split(',') : [];
		var sSelectAllActiveDimenison =
			` select dimension.redeem,dimension.id,dimension.name,unit.default_text as dimension_unit,ifnull(sum(value),0) as total  from "sap.ino.db.gamification::t_dimension" as dimension
                                       left outer join (select * from "sap.ino.db.gamification::t_activity_log" as activity
                                       
                                       inner join "sap.ino.db.gamification::t_identity_log_for_activity" as identity
                                       on activity.id = identity.activity_id and  identity_id = ?)as activity
                                       on dimension.id = activity.dimension_id
                                       inner join "sap.ino.db.basis::t_unit" as unit
                                       on dimension.unit = unit.code
                                       where dimension.status = 1  
                                       group by dimension.redeem,dimension.id,dimension.name,unit.default_text,identity_id 
                                       order by dimension.redeem,dimension.name`;
		var aAllActiveDimenisonResult = oHQ.statement(sSelectAllActiveDimenison).execute(sUserId);
		if (aAllActiveDimenisonResult.length > 0) {
			aAllActiveDimenisonResult.forEach(function(item) {
				var consumedValueForDimension = 0
				if (aPublishBadge.indexOf(item.ID.toString()) > -1 && !item.REDEEM) {
					var oDimension = AOFDimension.read(item.ID);
					var aBadge = oDimension.Badge;
					var oBadge = {};
					if (aBadge.length > 0) {
						const aSortedBadge = _.sortBy(aBadge, 'BADGE_VALUE');
						aSortedBadge.reverse();
						if (item.TOTAL >= aSortedBadge[aSortedBadge.length - 1].BADGE_VALUE) {
							aSortedBadge.forEach(function(badge, index) {
								if (!oBadge.currentBadge && item.TOTAL >= badge.BADGE_VALUE) {
									oBadge.currentBadge = badge
									if (aSortedBadge[index - 1]) {
										oBadge.nextBadge = aSortedBadge[index - 1];
									} else {
										oBadge.nextBadge = {};
									}
								}

							});
						} else {
							oBadge.currentBadge = {};
							oBadge.nextBadge = aSortedBadge[aSortedBadge.length - 1];
						}
					}

					if (oDimension.REDEEM) {
						consumedValueForDimension = getUserConsumedValueForDimension(sUserId, item.ID, oHQ);
					}

					if (bSelfProfile) {
						aGamification.push({
							ID: item.ID,
							NAME: item.NAME,
							TOTAL: item.TOTAL,
							UNIT: item.DIMENSION_UNIT,
							REDEEM: oDimension.REDEEM,
							TOTAL_FOR_REDEEM: oDimension.REDEEM ? item.TOTAL - consumedValueForDimension : 0,
							BADGE: oBadge
						});
					} else {
						aGamification.push({
							ID: item.ID,
							NAME: item.NAME,
							BADGE: oBadge
						});
					}
				} else if (aPublishBadge.indexOf(item.ID.toString()) > -1 && item.REDEEM) {
					var consumedValueForDimension = getUserConsumedValueForDimension(sUserId, item.ID, oHQ);
					if (bSelfProfile) {
						aGamification.push({
							ID: item.ID,
							NAME: item.NAME,
							TOTAL: item.TOTAL,
							UNIT: item.DIMENSION_UNIT,
							REDEEM: item.REDEEM,
							TOTAL_FOR_REDEEM: item.REDEEM ? item.TOTAL - consumedValueForDimension : 0,
							BADGE: {}
						});
					}
				}
			});
		}
		return aGamification
	}

}

function getUserConsumedValueForDimension(sUserId, sDimensionId, oHQ) {
	var sSelectConsumedValueForDimenison =
		` select IFNULL(sum(consumed_value),0) as consumed_value from  "sap.ino.db.gamification::t_gamification_transaction"
                                             where IDENTITY_ID = ? and dimension_id = ?`;

	var aConsumedValueForDimenisonResult = oHQ.statement(sSelectConsumedValueForDimenison).execute(sUserId, sDimensionId);
	return aConsumedValueForDimenisonResult[0].CONSUMED_VALUE;
}

function getLeaderBoardByDimension(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	var sDimensionId = oReq.DIMENSION_ID;
	var sUserId = oContext.getUser().ID;
	var oHQ = oContext.getHQ();
	var sSelectLeaderBoardForDimenison =
		` select ifnull(sum(value),0) as total,
                                                  activity.identity_id,  
                                                  identity.name,
                                                  attachment_assign.attachment_id as identity_image_id
                                       from "sap.ino.db.gamification::t_dimension" as dimension
                                       left outer join (select * from "sap.ino.db.gamification::t_activity_log" as activity
                                       
                                       inner join "sap.ino.db.gamification::t_identity_log_for_activity" as identity_activity
                                       on activity.id = identity_activity.activity_id )as activity
                                       on dimension.id = activity.dimension_id
                                       left outer join "sap.ino.db.iam::t_identity" as identity
                                       on activity.identity_id = identity.id
                                       left outer join "sap.ino.db.attachment::t_attachment_assignment" as attachment_assign
                                    	on attachment_assign.owner_id = activity.identity_id and
                                       	   attachment_assign.owner_type_code = 'IDENTITY' and
                                           attachment_assign.role_type_code = 'IDENTITY_IMAGE'
                                       where dimension_id = ?
                                       group by identity_id, identity.name, attachment_assign.attachment_id
                                       order by total desc`;

	var aLeaderBoardForDimenisonResult = oHQ.statement(sSelectLeaderBoardForDimenison).execute(sDimensionId);
		var AOFDimension = AOF.getApplicationObject("sap.ino.xs.object.gamification.Dimension");
		var oDimension = AOFDimension.read(sDimensionId);	
	if (aLeaderBoardForDimenisonResult.length > 0) {
		var same = 0;
		var prescore = 0;
		var ranking = 0;
		var oSelf;
		aLeaderBoardForDimenisonResult.forEach(function(item) {
			if (item.TOTAL !== 0) {
				if (item.TOTAL === prescore) {
					item.ranking = ranking;
					same++;
				} else {
					ranking = ranking + same;
					ranking++;
					same = 0;
					prescore = item.TOTAL;
					item.ranking = ranking;
				}
				if (!oSelf && sUserId === item.IDENTITY_ID) {
				    
					oSelf = item;
				}
			}
		});
	}

	var aTempLeaderBoardForDimenisonResult = aLeaderBoardForDimenisonResult.slice(0, 5);
	if (aTempLeaderBoardForDimenisonResult.length > 0) {
		aTempLeaderBoardForDimenisonResult.forEach(function(item) {
			var aBadge = oDimension.Badge;
			var oBadge = {};
			if (aBadge.length > 0) {
				const aSortedBadge = _.sortBy(aBadge, 'BADGE_VALUE');
				aSortedBadge.reverse();
				if (item.TOTAL >= aSortedBadge[aSortedBadge.length - 1].BADGE_VALUE) {
					aSortedBadge.forEach(function(badge, index) {
						if (!oBadge.currentBadge && item.TOTAL >= badge.BADGE_VALUE) {
							oBadge.currentBadge = badge
							if (aSortedBadge[index - 1]) {
								oBadge.nextBadge = aSortedBadge[index - 1];
							} else {
								oBadge.nextBadge = {};
							}
						}

					});
				} else {
					oBadge.currentBadge = {};
				}
			}
			item.BADGE = oBadge;
 
		});

	}
	  if(oSelf){
			var aBadge = oDimension.Badge;
			var oBadge = {};
			if (aBadge.length > 0) {
				const aSortedBadge = _.sortBy(aBadge, 'BADGE_VALUE');
				aSortedBadge.reverse();
				if (oSelf.TOTAL >= aSortedBadge[aSortedBadge.length - 1].BADGE_VALUE) {
					aSortedBadge.forEach(function(badge, index) {
						if (!oBadge.currentBadge && oSelf.TOTAL >= badge.BADGE_VALUE) {
							oBadge.currentBadge = badge
							if (aSortedBadge[index - 1]) {
								oBadge.nextBadge = aSortedBadge[index - 1];
							} else {
								oBadge.nextBadge = {};
							}
						}

					});
				} else {
					oBadge.currentBadge = {};
				}
			}
			oSelf.BADGE = oBadge;	    
	}
	
	return {
		LeaderBoardRanking: aLeaderBoardForDimenisonResult.slice(0, 5),
		SelfRanking: oSelf
	}
}

function getAllActiveDimension(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	var oHQ = oContext.getHQ();
	var sGamificationSettingQuery =
			`select top 1 IFNULL(publish_badge,'') as publish_badge from "sap.ino.db.gamification::t_gamification_setting"`;
	var aGamificationSettingRes = oHQ.statement(sGamificationSettingQuery).execute();
	var sBadgeString;
	if(aGamificationSettingRes.length > 0){
	    sBadgeString = aGamificationSettingRes[0].PUBLISH_BADGE ?  "(" + aGamificationSettingRes[0].PUBLISH_BADGE + ")" : "";
	} else {
	    sBadgeString = "";
	}
	
	
	if(sBadgeString.length > 0){
	var sGamificationDimensionsQuery =
		'SELECT ID,NAME FROM "sap.ino.db.gamification::t_dimension" where status = 1 and ID in ' + sBadgeString + ' order by name';
	var aGamificationDimensionsResult = oHQ.statement(sGamificationDimensionsQuery).execute();
	} else {
	    aGamificationDimensionsResult = [];
	}

	return {
		ALL_ACTIVE_DIMENSION: aGamificationDimensionsResult
	}
}

function deleteExecutionCheck(Key, oChangeRequest, oDimension, oPersistedDimension, addMessage, oContext) {
	var oActivitySelectStatment = oContext.getHQ().statement(
		'select top 1 id from "sap.ino.db.gamification::t_activity_log" where dimension_id = ?');
	var aActivitySelectResult = oActivitySelectStatment.execute(oDimension.ID);
	if (aActivitySelectResult.length > 0) {
		addMessage(Message.MessageSeverity.Error, DimensionMessage.DIMENSION_CANNOT_DELETE, oDimension.ID, "Root");
		return;
	}
}

//END