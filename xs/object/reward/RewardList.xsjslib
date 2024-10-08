var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var check = $.import("sap.ino.xs.aof.lib", "check");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var aof = $.import("sap.ino.xs.aof.core", "framework");
var status = $.import("sap.ino.xs.object.status", "Status");
var Idea = $.import("sap.ino.xs.object.idea", "Idea");
var Message = $.import("sap.ino.xs.aof.lib", "message");

var IdentityRole = $.import("sap.ino.xs.object.iam", "ObjectIdentityRole");
var RewardMessage = $.import("sap.ino.xs.object.reward", "message");
var DataType = $.import("sap.ino.xs.object.basis", "Datatype").DataType;
var SystemSettings = $.import("sap.ino.xs.xslib", "systemSettings");

var Status = {
	Submitted: "sap.ino.config.REWARD_SUBMITTED",
	PublishedToCommunity: "sap.ino.config.REWARD_PUB_COMMUNITY",
	PublishedToAuthor: "sap.ino.config.REWARD_PUB_AUTHOR"
};

var StatusAction = {
	UnPublish: "sap.ino.config.REWARD_UNPUBLISH",
	PublishToAuthor: "sap.ino.config.REWARD_PUB_AUTHOR",
	PublishToCommunity: "sap.ino.config.REWARD_PUB_COMMUNITY"
};

this.definition = {
	actions: {
		create: {
			authorizationCheck: auth.parentInstanceAccessCheck("sap.ino.db.reward::v_auth_rewards_create", "IDEA_ID", "IDEA_ID", RewardMessage.AUTH_MISSING_REWARD_CREATE),
			enabledCheck: createEnabledCheck,
			executionCheck: createExecutionCheck,
			historyEvent: "REWARD_CREATED"
		},
		update: {
			authorizationCheck: rewardBlockUpdate,
			historyEvent: "REWARD_UPDATED"
		},
		del: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.reward::v_auth_rewards_delete", "REWARD_LIST_ID", RewardMessage.AUTH_MISSING_REWARD_DELETE),
			enabledCheck: deleteEnabledCheck,
			historyEvent: "REWARD_DELETED"
		},
		read: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.reward::v_auth_rewards_read", "REWARD_LIST_ID", RewardMessage.AUTH_MISSING_REWARD_READ)
		},
		executeStatusTransition: {
			authorizationCheck: auth.instanceAccessCheck("sap.ino.db.reward::v_auth_rewards_status_transition", "REWARD_LIST_ID", RewardMessage.AUTH_MISSING_REWARD_STATUS_TRANS),
			execute: executeStatusTransition,
			historyEvent: "STATUS_ACTION",
			enabledCheck: executeStatusTransitionEnabledCheck
		},
		download: {
			authorizationCheck: false,
			execute: downloadRewards,
			historyEvent: "REWARD_DOWNLOAD",
			isStatic: true,
			isInternal: false
		},
		bulkDeleteRewards: {
			authorizationCheck: false,
			execute: bulkDeleteRewards,
			historyEvent: "REWARDS_DELETE",
			isStatic: true,
			isInternal: false
		},
		bulkDeleteIdeaRewards: {
			authorizationCheck: false,
			execute: bulkDeleteIdeaRewards,
			historyEvent: "REWARDS_IDEA_DELETE",
			isStatic: true,
			isInternal: false
		},
		//refer to Idea.xsjslib
		changeAuthorIdeaRewards: {
			authorizationCheck: false,
			execute: bulkChangeAuthorIdeaRewards,
			historyEvent: "REWARDS_CHANGE_AUTHOR",
			isStatic: true,
			isInternal: true
		}
	},
	Root: {
		table: "sap.ino.db.reward::t_reward_list",
		historyTable: "sap.ino.db.reward::t_reward_list_h",
		sequence: "sap.ino.db.reward::s_reward_list",
		determinations: {
			onCreate: [initRewardList],
			onModify: [determine.systemAdminData],
			onPersist: []
		},
		attributes: {
			IDEA_ID: {
				foreignKeyTo: "sap.ino.xs.object.idea.Idea.Root",
				readOnly: check.readOnlyAfterCreateCheck(RewardMessage.REWARD_UNCHANGEABLE)
			},
			IDEA_PHASE_CODE: {
				foreignKeyTo: "sap.ino.xs.object.campaign.Phase.Root",
				readOnly: check.readOnlyAfterCreateCheck(RewardMessage.REWARD_UNCHANGEABLE)
			},
			STATUS_CODE: {
				readOnly: true,
				foreignKeyTo: "sap.ino.xs.object.status.Status.Root"
			},
			CREATED_AT: {
				readOnly: true
			},
			CREATED_BY_ID: {
				readOnly: true
			},
			CHANGED_AT: {
				readOnly: true
			},
			CHANGED_BY_ID: {
				readOnly: true
			}
		},
		nodes: {
			Rewards: {
				table: "sap.ino.db.reward::t_reward",
				historyTable: "sap.ino.db.reward::t_reward_h",
				sequence: "sap.ino.db.reward::s_reward",
				parentKey: "REWARD_LIST_ID",
				attributes: {
					AUTHOR_ID: {
						foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root",
						readOnly: check.readOnlyAfterCreateCheck(RewardMessage.REWARD_UNCHANGEABLE)
					},
					REWARD_AMOUNT: {
						readOnly: check.readOnlyAfterCreateCheck(RewardMessage.REWARD_UNCHANGEABLE)
					},
					REWARD_UNIT: {
						readOnly: check.readOnlyAfterCreateCheck(RewardMessage.REWARD_UNCHANGEABLE)
					},
					REWARD_SHARE: {
						readOnly: check.readOnlyAfterCreateCheck(RewardMessage.REWARD_UNCHANGEABLE)
					}
				}
			}
		}
	}
};

function initRewardList(vKey, oRewardList, oPersistedRewardList, addMessage, getNextHandle, oContext) {
	oRewardList.STATUS_CODE = Status.Submitted;

	if (!oRewardList.IDEA_ID) {
		addMessage(Message.MessageSeverity.Error, RewardMessage.REWARD_IDEA_MISSING, vKey);
		return;
	}

	var Idea = aof.getApplicationObject("sap.ino.xs.object.idea.Idea");
	var oIdea = Idea.read(oRewardList.IDEA_ID);
	if (!oIdea) {
		addMessage(Message.MessageSeverity.Error, RewardMessage.REWARD_IDEA_MISSING, vKey);
		return;
	}
	oRewardList.IDEA_PHASE_CODE = oIdea.PHASE_CODE;

	_.each(oRewardList.Rewards, function(oReward) {
		oReward.DOWNLOAD_COUNT = 0;
	});

	//need to add oReward.REWARD_UNIT
}

function executeStatusTransitionEnabledCheck(vKey, oRewardList, addMessage, oContext) {
	var oHQ = oContext.getHQ();
	var aStatusTransition = oHQ.statement(
		'   select * \
                    from "sap.ino.db.reward::v_reward_list_status_transition" \
                    where id = ?').execute(
		vKey);
	if (aStatusTransition.length === 0) {
		addMessage(Message.MessageSeverity.Error, RewardMessage.REWARD_NO_STATUS_TRANSITIONS, vKey);
	}
}

function createEnabledCheck(vKey, oRewardList, addMessage, oContext) {
	if (!oRewardList.IDEA_ID) {
		addMessage(Message.MessageSeverity.Error, RewardMessage.REWARD_IDEA_MISSING, vKey);
		return;
	} else {
		var Idea = aof.getApplicationObject("sap.ino.xs.object.idea.Idea");
		var oIdea = Idea.read(oRewardList.IDEA_ID);
		if (!oIdea) {
			addMessage(Message.MessageSeverity.Error, RewardMessage.REWARD_IDEA_MISSING, vKey);
			return;
		} else if (oIdea.ContributionShare.length === 0) {
			addMessage(Message.MessageSeverity.Error, RewardMessage.MSG_REWARD_IDEA_CONTRIBUTION_SHARE_MISSING, vKey);
			return;
		}

		var oHQ = oContext.getHQ();
		var bSystemRewardActive = SystemSettings.getValue("sap.ino.config.REWARD_ACTIVE", oHQ);
		if (!bSystemRewardActive) {
			addMessage(Message.MessageSeverity.Error, RewardMessage.SYSTEM_REWARD_UNACTIVE, vKey);
			return;
		}

		var aRewardList = oHQ.statement(
			'   select top 1 * \
                    from "sap.ino.db.reward::t_reward_list" \
                    where idea_id = ? and idea_phase_code = ?'
		).execute(
			[oRewardList.IDEA_ID, oIdea.PHASE_CODE]);

		if (aRewardList.length > 0) {
			addMessage(Message.MessageSeverity.Error, RewardMessage.MSG_REWARD_DUPLICATE, vKey);
			return;
		}
	}
}

function executeStatusTransition(vKey, oParameters, oRewardList, addMessage, getNextHandle, oContext) {
	if (!oParameters || !oParameters.STATUS_ACTION_CODE) {
		addMessage(Message.MessageSeverity.Error, RewardMessage.REWARD_INVALID_STATUS_TRANSITION, vKey);
	}

	var sStatusActionCode = oParameters.STATUS_ACTION_CODE;

	var oHQ = oContext.getHQ();
	var aStatusTransition = oHQ.statement(
		'   select * \
	                    from "sap.ino.db.reward::v_reward_list_status_transition" \
	                    where id = ? and status_action_code = ?'
	).execute(vKey, sStatusActionCode);

	_executeStatusTransition(vKey, aStatusTransition, oRewardList, addMessage, oContext);
}

function _executeStatusTransition(vKey, aStatusTransition, oRewardList, addMessage, oContext) {
	if (_.size(aStatusTransition) !== 1) {
		addMessage(Message.MessageSeverity.Error, RewardMessage.REWARD_INVALID_STATUS_TRANSITION, vKey);
		return;
	}
	var oStatusTransition = _.first(aStatusTransition);
	oRewardList.STATUS_CODE = oStatusTransition.NEXT_STATUS_CODE;
	oContext.setHistoryEvent("STATUS_ACTION_" + oStatusTransition.STATUS_ACTION_CODE);
}

function rewardBlockUpdate(vKey, oPersistedObject, addMessage, oContext) {
	addMessage(Message.MessageSeverity.Error, RewardMessage.AUTH_MISSING_REWARD_UPDATE, vKey);
	return false;
}

function downloadRewards(oParameters, oBulkAccess, addMessage, getNextHandle, oContext) {
	if (oParameters && oParameters.REWARD_LIST_ID) {
		var sUpdate = 'update  "sap.ino.db.reward::t_reward" set DOWNLOAD_COUNT = DOWNLOAD_COUNT + 1 where REWARD_LIST_ID in (' +
			oParameters.REWARD_LIST_ID.join(',') + ')';
		var oHQ = oContext.getHQ();
		oHQ.statement(sUpdate).execute();
	} else {
		addMessage(Message.MessageSeverity.Error, RewardMessage.REWARD_DOWNLOAD_PARAMETER_REQUIRED, undefined, "Rewards", "REWARD_LIST_ID");
	}
}

function bulkDeleteRewards(oParameters, oBulkAccess, addMessage, getNextHandle, oContext) {
	if (oParameters && oParameters.REWARD_ID && oParameters.REWARD_LIST_ID) {
		var sSelect = 'select top 1 * from "sap.ino.db.reward::t_reward" where download_count > 0 and ID in (' +
			oParameters.REWARD_ID.join(',') + ')';
		var oHQ = oContext.getHQ();
		var aResult = oHQ.statement(sSelect).execute();

		if (aResult.length > 0) {
			//if any rewards have been download, they shouldn't be delete
			addMessage(Message.MessageSeverity.Error, RewardMessage.REWARDS_DELETE_FAILURE, undefined, "Rewards", "REWARD_ID");
		} else {
			_.each(oParameters.REWARD_LIST_ID, function(iRewardListId) {
				var oResponse = oBulkAccess.del({
					Root: {
						nodes: {
							Rewards: {
								attributes: {
									CHANGED_BY_ID: oContext.getUser().ID,
									CHANGED_AT: oContext.getRequestTimestamp()
								}
							}
						},
						attributes: {
							CHANGED_BY_ID: oContext.getUser().ID,
							CHANGED_AT: oContext.getRequestTimestamp()
						}
					}
				}, {
					condition: "ID = ?",
					conditionParameters: iRewardListId
				});

				addMessage(oResponse.messages);
			});
		}

	} else {
		addMessage(Message.MessageSeverity.Error, RewardMessage.REWARD_BULK_DELETE_PARAMETER_REQUIRED, undefined, "Rewards", "REWARD_LIST_ID");
	}
}

function bulkDeleteIdeaRewards(oParameters, oBulkAccess, addMessage, getNextHandle, oContext) {
	if (oParameters && oParameters.IDEA_ID) {
		var oResponse = oBulkAccess.del({
			Root: {
				nodes: {
					Rewards: {
						attributes: {
							CHANGED_BY_ID: oContext.getUser().ID,
							CHANGED_AT: oContext.getRequestTimestamp()
						}
					}
				},
				attributes: {
					CHANGED_BY_ID: oContext.getUser().ID,
					CHANGED_AT: oContext.getRequestTimestamp()
				}
			}
		}, {
			condition: "IDEA_ID = ?",
			conditionParameters: oParameters.IDEA_ID
		});

		addMessage(oResponse.messages);

	} else {
		addMessage(Message.MessageSeverity.Error, RewardMessage.IDEA_REWARD_BULK_DELETE_PARAMETER_REQUIRED, undefined, "Rewards",
			"REWARD_LIST_ID");
	}
}

function createExecutionCheck(vKey, oChangeRequest, oRewardList, oPersistedRewardList, addMessage, oContext) {
	//check empty Rewards item
	if (oRewardList.Rewards.length === 0) {
		addMessage(Message.MessageSeverity.Error, RewardMessage.REWARD_ITEM_MISSING, vKey);
	}
}

function deleteEnabledCheck(vKey, oRewardList, addMessage, oContext) {
	for (var i = 0; i < oRewardList.Rewards.length; i++) {
		if (oRewardList.Rewards[i].DOWNLOAD_COUNT > 0) {
			//if any rewards have been download, they shouldn't be delete
			addMessage(Message.MessageSeverity.Error, RewardMessage.REWARDS_DELETE_FAILURE, undefined, "Rewards", "REWARD_ID");
			return;
		}
	}
}

function bulkChangeAuthorIdeaRewards(oParameters, oBulkAccess, addMessage, getNextHandle, oContext) {
	if (oParameters && oParameters.ORIGIN_AUTHOR_ID && oParameters.AUTHOR_ID && oParameters.keys) {
		var sHistorySql =
			`
INSERT INTO "SAP_INO"."sap.ino.db.reward::t_reward_h"(
	"HISTORY_DB_EVENT",
	"HISTORY_BIZ_EVENT",
	"HISTORY_AT",
	"HISTORY_ACTOR_ID",
	"ID",
	"AUTHOR_ID" ,
	"REWARD_AMOUNT",
	"REWARD_UNIT",
	"REWARD_SHARE",
	"DOWNLOAD_COUNT",
	"CREATED_AT",
	"CREATED_BY_ID",
	"CHANGED_AT",
	"CHANGED_BY_ID",
	"REWARD_LIST_ID"
)  
SELECT 	'UPDATED',
	'REWARDS_CHANGE_AUTHOR',
	?,
	?,
	RE."ID",
	?,
	RE."REWARD_AMOUNT",
	RE."REWARD_UNIT",
	RE."REWARD_SHARE",
	RE."DOWNLOAD_COUNT",
	RE."CREATED_AT",
	RE."CREATED_BY_ID",
	?,
	?,
	RE."REWARD_LIST_ID"
FROM "sap.ino.db.reward::t_reward" AS RE
INNER JOIN "sap.ino.db.reward::t_reward_list" AS RL
ON RE.REWARD_LIST_ID = RL.ID
WHERE RE.DOWNLOAD_COUNT = 0 AND RE.AUTHOR_ID = ? 
`;
		var sCondition = "AND (RL.IDEA_ID = ? ";
		for (var index = 1; index < oParameters.keys.length; index++) {
			sCondition += " OR RL.IDEA_ID = ? ";
		}
		sHistorySql = sHistorySql + sCondition + ")";

		var sUpdateSql =
			`
UPDATE RE
SET RE.AUTHOR_ID = ?, 
	RE.CHANGED_AT = ?, 
	RE.CHANGED_BY_ID = ?
FROM "sap.ino.db.reward::t_reward" AS RE
	INNER JOIN "sap.ino.db.reward::t_reward_list" AS RL
	ON RE.REWARD_LIST_ID = RL.ID
WHERE RE.DOWNLOAD_COUNT < 1 AND RE.AUTHOR_ID = ? 
`;
		sUpdateSql = sUpdateSql + sCondition + ")";

		var oHQ = oContext.getHQ();
		try {
			oHQ.statement(sHistorySql).execute([oContext.getRequestTimestamp(), oContext.getUser().ID,
			oParameters.AUTHOR_ID, oContext.getRequestTimestamp(), oContext.getUser().ID, oParameters.ORIGIN_AUTHOR_ID].concat(oParameters.keys));

			oHQ.statement(sUpdateSql).execute([oParameters.AUTHOR_ID, oContext.getRequestTimestamp(), oContext.getUser().ID,
		oParameters.ORIGIN_AUTHOR_ID].concat(oParameters.keys));
		} catch (e) {
            TraceWrapper.log_exception(e);
			addMessage(Message.MessageSeverity.Error, RewardMessage.IDEA_REWARD_BULK_CHANGE_AUTHOR_PARAMETER_REQUIRED, undefined, "", "");
		}
	}
}