/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.object.Campaign");
(function() {
	"use strict";
	jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
	jQuery.sap.require("sap.ui.ino.models.core.ReadSource");
	jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
	jQuery.sap.require("sap.ui.ino.models.core.Extensibility");
	jQuery.sap.require("sap.ui.ino.models.core.PropertyModel");
	jQuery.sap.require("sap.ui.ino.application.Message");
	jQuery.sap.require("sap.ui.ino.models.util.Date");
	jQuery.sap.require("sap.ui.ino.application.Configuration");

	var Status = {
		Draft: "sap.ino.config.CAMP_DRAFT",
		Published: "sap.ino.config.CAMP_PUBLISHED"
	};

	var Receivers = {
		'SUBMIT_IDEA': ['AUTHOR', 'COAUTHOR', 'PARTICIPANT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH', 'COACH', 'CAMPAIGN_MANAGER', 'CAMPAIGN_FOLLOWER'],
		'CHANGE_IDEA': ['AUTHOR', 'COAUTHOR', 'PARTICIPANT', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH', 'COACH',
			'CAMPAIGN_MANAGER', 'VOTER', 'COMMENTER', 'FOLLOWER'],
		'DELETE_IDEA': ['AUTHOR', 'COAUTHOR', 'PARTICIPANT', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH', 'COACH',
			'CAMPAIGN_MANAGER', 'VOTER', 'COMMENTER', 'FOLLOWER'],
		'CHANGE_IDEA_PHASE': ['AUTHOR', 'COAUTHOR', 'PARTICIPANT', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH',
			'COACH', 'CAMPAIGN_MANAGER', 'VOTER', 'COMMENTER', 'FOLLOWER'],
		'MERGE_IDEA': ['AUTHOR', 'COAUTHOR', 'PARTICIPANT', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH', 'COACH',
			'CAMPAIGN_MANAGER', 'VOTER', 'COMMENTER', 'FOLLOWER'],
		'VOTE_IDEA': ['AUTHOR', 'COAUTHOR', 'PARTICIPANT', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH', 'COACH',
			'CAMPAIGN_MANAGER', 'VOTER', 'COMMENTER', 'FOLLOWER'],
		'ADD_VOLUNTEER': ['AUTHOR', 'COAUTHOR', 'VOLUNTEER', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH', 'COACH',
			'CAMPAIGN_MANAGER'],
		'LOOKING_FOR_CONTRIBUTOR': ['AUTHOR', 'COAUTHOR', 'PARTICIPANT', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH',
			'COACH', 'CAMPAIGN_MANAGER', 'VOTER', 'COMMENTER',
			'FOLLOWER'],
		'CHANGE_DECISION': ['AUTHOR', 'COAUTHOR', 'PARTICIPANT', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH',
			'COACH', 'CAMPAIGN_MANAGER', 'VOTER', 'COMMENTER', 'FOLLOWER'],
		'CHANGE_AUTHOR': ['AUTHOR', 'COAUTHOR', 'PARTICIPANT', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH', 'COACH',
			'CAMPAIGN_MANAGER', 'VOTER', 'COMMENTER', 'FOLLOWER'],
		'ASSIGN_COACH': ['AUTHOR', 'COAUTHOR', 'PARTICIPANT', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH', 'COACH',
			'CAMPAIGN_MANAGER', 'VOTER', 'COMMENTER', 'FOLLOWER'],
		'UNASSIGN_COACH': ['AUTHOR', 'COAUTHOR', 'PARTICIPANT', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH', 'COACH',
			'CAMPAIGN_MANAGER', 'VOTER', 'COMMENTER', 'FOLLOWER'],
		'ASSIGN_EXPERT': ['AUTHOR', 'COAUTHOR', 'PARTICIPANT', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH', 'COACH',
			'CAMPAIGN_MANAGER', 'VOTER', 'COMMENTER', 'FOLLOWER'],
		'UNASSIGN_EXPERT': ['AUTHOR', 'COAUTHOR', 'PARTICIPANT', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH',
			'COACH', 'CAMPAIGN_MANAGER', 'VOTER', 'COMMENTER', 'FOLLOWER'],
		'REASSIGN_CAMPAIGN': ['AUTHOR', 'COAUTHOR', 'PARTICIPANT', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH',
			'COACH', 'CAMPAIGN_MANAGER', 'VOTER', 'COMMENTER', 'FOLLOWER'],
		'CREATE_IDEA_COMMENT': ['AUTHOR', 'COAUTHOR', 'PARTICIPANT', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH',
			'COACH', 'CAMPAIGN_MANAGER', 'VOTER', 'COMMENTER', 'FOLLOWER'],
		'EDIT_IDEA_COMMENT': ['AUTHOR', 'COAUTHOR', 'PARTICIPANT', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH',
			'COACH', 'CAMPAIGN_MANAGER', 'VOTER', 'COMMENTER', 'FOLLOWER'],
		'DELETE_IDEA_COMMENT': ['AUTHOR', 'COAUTHOR', 'PARTICIPANT', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH',
			'COACH', 'CAMPAIGN_MANAGER', 'VOTER', 'COMMENTER', 'FOLLOWER'],
		'REPLY_IDEA_COMMENT': ['AUTHOR', 'COAUTHOR', 'PARTICIPANT', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH',
			'COACH', 'CAMPAIGN_MANAGER', 'VOTER', 'COMMENTER', 'FOLLOWER'],
		'IDEA_FOLLOW_UP': ['FOLLOW_UP_PERSON'],
		'EVALUATION_SUBMITTED': ['ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH', 'COACH', 'CAMPAIGN_MANAGER'],
		'EVALUATION_PUBLISHED_TO_AUTHOR': ['AUTHOR', 'COAUTHOR', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH',
			'COACH', 'CAMPAIGN_MANAGER'],
		'EVALUATION_PUBLISHED_TO_COMMUNITY': ['AUTHOR', 'COAUTHOR', 'PARTICIPANT', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH',
			'RL_COACH', 'COACH', 'CAMPAIGN_MANAGER', 'VOTER', 'COMMENTER',
			'FOLLOWER'],
		'EVALUATION_UNPUBLISHED': ['AUTHOR', 'COAUTHOR', 'PARTICIPANT', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH',
			'COACH', 'CAMPAIGN_MANAGER', 'VOTER', 'COMMENTER', 'FOLLOWER'],
		'EVALUATION_REWORKED': ['AUTHOR', 'COAUTHOR', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH', 'COACH',
			'CAMPAIGN_MANAGER'],
		'EVALUATION_DELETED': ['AUTHOR', 'COAUTHOR', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH', 'COACH',
			'CAMPAIGN_MANAGER'],
		'CREATE_REWARD': ['AUTHOR', 'COAUTHOR', 'ASSIGNED_COACH', 'RL_COACH', 'COACH', 'CAMPAIGN_MANAGER'],
		'DELETE_REWARD': ['AUTHOR', 'COAUTHOR', 'ASSIGNED_COACH', 'RL_COACH', 'COACH', 'CAMPAIGN_MANAGER'],
		'CREATE_OBJECT': ['ASSIGNED_COACH', 'RL_COACH', 'COACH', 'CAMPAIGN_MANAGER'],
		'UPDATE_OBJECT': ['ASSIGNED_COACH', 'RL_COACH', 'COACH', 'CAMPAIGN_MANAGER'],
		'REMOVE_OBJECT': ['ASSIGNED_COACH', 'RL_COACH', 'COACH', 'CAMPAIGN_MANAGER'],
		'EVALUATION_REQUEST_CREATED': ['ASSIGNED_COACH', 'RL_COACH', 'COACH', 'CAMPAIGN_MANAGER', 'INVITED_EXPERT'],
		'EVALUATION_REQUEST_DELETED': ['ASSIGNED_COACH', 'RL_COACH', 'COACH', 'CAMPAIGN_MANAGER', 'INVITED_EXPERT'],
		'EVALUATION_REQUEST_FORWARDED': ['ASSIGNED_COACH', 'RL_COACH', 'COACH', 'CAMPAIGN_MANAGER', 'INVITED_EXPERT'],
		'EVALUATION_REQUEST_ACCEPTED': ['ASSIGNED_COACH', 'RL_COACH', 'COACH', 'CAMPAIGN_MANAGER', 'INVITED_EXPERT'],
		'EVALUATION_REQUEST_COMPLETED': ['ASSIGNED_COACH', 'RL_COACH', 'COACH', 'CAMPAIGN_MANAGER', 'INVITED_EXPERT'],
		'EVALUATION_REQUEST_REJECTED': ['ASSIGNED_COACH', 'RL_COACH', 'COACH', 'CAMPAIGN_MANAGER', 'INVITED_EXPERT'],
		'RECEIPT_OF_REQUEST_CLARIFICATION': ['ASSIGNED_COACH', 'RL_COACH', 'COACH', 'CAMPAIGN_MANAGER', 'INVITED_EXPERT'],
		'DELIVERY_OF_REQUEST_CLARIFICATION': ['ASSIGNED_COACH', 'RL_COACH', 'COACH', 'CAMPAIGN_MANAGER', 'INVITED_EXPERT'],
		'EVALUATION_REQUEST_DUE_TO_EXPIRE': ['ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH', 'COACH',
			'CAMPAIGN_MANAGER', 'INVITED_EXPERT'],
		'PUBLISH_CAMPAIGN': ['PARTICIPANT', 'EXPERT', 'COACH', 'CAMPAIGN_MANAGER', 'TAG_FOLLOWER'],
		'PUBLISH_FOR_REGISTRATION': ['CAMPAIGN_MANAGER'],
		'REGISTER_FOR_CAMPAIGN': ['APPLICANT', 'CAMPAIGN_MANAGER'],
		'APPROVAL_LETTER_FOR_REGISTRATION': ['APPLICANT', 'CAMPAIGN_MANAGER'],
		'REJECT_LETTER_FOR_REGISTRATION': ['APPLICANT', 'CAMPAIGN_MANAGER'],
		'STATUS_FOR_REGISTRATION_CAMPAIGN': ['APPLICANT', 'CAMPAIGN_MANAGER'],
		'PUBLISH_CAMPAIGN_BLOG': ['PARTICIPANT', 'EXPERT', 'COACH', 'CAMPAIGN_MANAGER', 'COMMENTER', 'FOLLOWER'],
		'EDIT_CAMPAIGN_BLOG': ['PARTICIPANT', 'EXPERT', 'COACH', 'CAMPAIGN_MANAGER', 'COMMENTER', 'FOLLOWER'],
		'DELETE_CAMPAIGN_BLOG': ['PARTICIPANT', 'EXPERT', 'COACH', 'CAMPAIGN_MANAGER', 'COMMENTER', 'FOLLOWER'],
		'CREATE_CAMPAIGN_COMMENT': ['PARTICIPANT', 'EXPERT', 'COACH', 'CAMPAIGN_MANAGER', 'COMMENTER', 'FOLLOWER'],
		'EDIT_CAMPAIGN_COMMENT': ['PARTICIPANT', 'EXPERT', 'COACH', 'CAMPAIGN_MANAGER', 'COMMENTER', 'FOLLOWER'],
		'DELETE_CAMPAIGN_COMMENT': ['PARTICIPANT', 'EXPERT', 'COACH', 'CAMPAIGN_MANAGER', 'COMMENTER', 'FOLLOWER'],
		'CHANGE_STATUS': ['AUTHOR', 'COAUTHOR', 'PARTICIPANT', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH', 'COACH',
			'CAMPAIGN_MANAGER', 'VOTER', 'COMMENTER', 'FOLLOWER'],
		'ADD_COAUTHOR': ['AUTHOR', 'COAUTHOR', 'PARTICIPANT', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH', 'COACH',
			'CAMPAIGN_MANAGER', 'VOTER', 'COMMENTER', 'FOLLOWER'],
		'REMOVE_COAUTHOR': ['AUTHOR', 'COAUTHOR', 'PARTICIPANT', 'ASSIGNED_EXPERT', 'RL_EXPERT', 'EXPERT', 'ASSIGNED_COACH', 'RL_COACH',
			'COACH', 'CAMPAIGN_MANAGER', 'VOTER', 'COMMENTER', 'FOLLOWER']
	};

	sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.Campaign", {
		objectName: "sap.ino.xs.object.campaign.Campaign",
		readSource: sap.ui.ino.models.core.ReadSource.getDefaultODataSource("CampaignFull"),
		invalidation: {
			entitySets: ["CampaignFull", "CampaignSmall", "CampaignSmallIdeaAssign", "CampaignCount", "CampaignSearch", "CampaignSearchParams"]
		},
		determinations: {
			onCreate: function(oData, oCampaign) {
				var dToday = sap.ui.ino.models.util.Date.setBeginOfDay(new Date());
				var dOneYearAfter = new Date();
				dOneYearAfter.setFullYear(dOneYearAfter.getFullYear() + 1);
				sap.ui.ino.models.util.Date.setEndOfDay(dOneYearAfter);

				var aVoteCodes = sap.ui.ino.models.core.CodeModel.getCodes("sap.ino.xs.object.campaign.VoteType.Root");
				var sVoteCode = undefined;
				if (aVoteCodes && aVoteCodes.length > 0) {
					sVoteCode = aVoteCodes[0].CODE;
				}

				var oInitialCampaignData = {
					VALID_FROM: dToday,
					VALID_TO: dOneYearAfter,
					SUBMIT_FROM: dToday,
					SUBMIT_TO: dOneYearAfter,
					IS_BLACK_BOX: 0,
					IS_AUTO_ASSIGN_RL_COACH: 0,
					IS_OPEN_ANONYMOUS_FUNCTION: 0,
					IS_OPEN_REGISTER_SETTING: 0,
					STATUS_CODE: Status.Draft,
					COLOR_CODE: "FFFFFF",
					VOTE_TYPE_CODE: sVoteCode,
					LanguageTexts: [],
					Managers: [],
					Experts: [],
					Coaches: [],
					Participants: [],
					AnonymousText: [],
					LanguagePages: [],
					Attachments: [],
					Tasks: [],
					SELECTED_TASK: -1,
					SELECTED_MILESTONE: -1,
					REWARD: 0,
					MAIL_TEMPLATE_CODE: sap.ui.ino.application.Configuration.getSystemSetting("sap.ino.config.NOTIFICATION_IMME_MAIL_TEMPLATE_CODE"),
					REWARD_UNIT_CODE: sap.ui.ino.application.Configuration.getSystemSettingsModel().getProperty("/sap.ino.config.REWARD_UNIT_CODE"),
					CampaignNotification: [],
					GAMIFICATION_DIMENSIONS: [],
					VANITY_CODE: ""
				};

				_mergeLanguageTexts(oInitialCampaignData, oCampaign);
				sap.ui.ino.models.core.Extensibility.initExtensionNode(oInitialCampaignData, "Extension", oCampaign);
				return oInitialCampaignData;
			},

			onRead: function(oData, oCampaign) {
				oData.VALID_FROM = sap.ui.ino.models.util.Date.convertToLocalDate(oData.VALID_FROM, false);
				oData.VALID_TO = sap.ui.ino.models.util.Date.convertToLocalDate(oData.VALID_TO, true);
				oData.SUBMIT_FROM = sap.ui.ino.models.util.Date.convertToLocalDate(oData.SUBMIT_FROM, false);
				oData.SUBMIT_TO = sap.ui.ino.models.util.Date.convertToLocalDate(oData.SUBMIT_TO, true);
				oData.REGISTER_FROM = sap.ui.ino.models.util.Date.convertToLocalDate(oData.REGISTER_FROM, false);
				oData.REGISTER_TO = sap.ui.ino.models.util.Date.convertToLocalDate(oData.REGISTER_TO, true);
				if (oData.Tasks) {
					jQuery.each(oData.Tasks, function(index, oTask) {
						oTask.START_DATE = sap.ui.ino.models.util.Date.convertToLocalDate(oTask.START_DATE, false);
						oTask.END_DATE = sap.ui.ino.models.util.Date.convertToLocalDate(oTask.END_DATE, true);
						if (oTask.Milestones) {
							jQuery.each(oTask.Milestones, function(i, oMilestone) {
								oMilestone.MILESTONE_DATE = sap.ui.ino.models.util.Date.convertToLocalDate(oMilestone.MILESTONE_DATE, false);
							});
						}
					});
				}
				_mergeLanguageTexts(oData, oCampaign);
				oData.LanguagePages.sort(function(a, b) {
					return a.PAGE_NO - b.PAGE_NO;
				});
				oData.Phases.sort(function(a, b) {
					return a.SEQUENCE_NO - b.SEQUENCE_NO;
				});
				sap.ui.ino.models.core.Extensibility.initExtensionNode(oData, "Extension", oCampaign);
				oData.MAJOR_CHANGE = false;
				if (!oData.Tasks) {
					oData.Tasks = [];
				}
				if (!oData.REWARD_UNIT_CODE) {
					oData.REWARD_UNIT_CODE = sap.ui.ino.application.Configuration.getSystemSettingsModel().getProperty(
						"/sap.ino.config.REWARD_UNIT_CODE");
				}
				if (oData.IS_AUTO_ASSIGN_RL_COACH === null || oData.IS_AUTO_ASSIGN_RL_COACH === undefined) {
					oData.IS_AUTO_ASSIGN_RL_COACH = 0;
				}
				if (oData.IS_OPEN_ANONYMOUS_FUNCTION === null || oData.IS_OPEN_ANONYMOUS_FUNCTION === undefined) {
					oData.IS_OPEN_ANONYMOUS_FUNCTION = 1;
				}
				if (oData.IS_OPEN_REGISTER_SETTING === null || oData.IS_OPEN_REGISTER_SETTING === undefined) {
					oData.IS_OPEN_REGISTER_SETTING = 0;
				}
				oData.Tasks = sortObjectArray(oData.Tasks, "SEQUENCE_NO");
				sortMilestoneArray(oData.Tasks);
				normalizeTaskSequenceNo(oData.Tasks);
				addMilestoneYears(oData);
				if (oData.CampaignIntegration) {
					for (var i = 0; i < oData.CampaignIntegration.length; i++) {
						if (oData.CampaignIntegration[i].AttributesLayout) {
							sortObjectArray(oData.CampaignIntegration[i].AttributesLayout, "DISPLAY_SEQUENCE");
						}
					}
				}
				oData.CampaignNotification.forEach(function(oAction) {
					if (oAction.CampaignNotificationReceiver) {
					    oAction.CampaignNotificationReceiver.forEach(function(oReceiver){
					        oReceiver.ROLE_NAME = sap.ui.getCore().getModel("i18n").getResourceBundle().getText('BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_ROLE_' +
											oReceiver.ROLE_CODE);
					    });
						oAction.CampaignNotificationReceiver.sort(function(oPrev, oNext) {
							if (oPrev.ROLE_NAME > oNext.ROLE_NAME) {
								return 1;
							} else if (oPrev.ROLE_NAME < oNext.ROLE_NAME) {
								return -1;
							} else {
								return 0;
							}
						});
					}
				});
				oData.GAMIFICATION_DIMENSIONS = [];
				if (oData.GamificationDimension && oData.GamificationDimension.length > 0) {
					oData.GamificationDimension.forEach(function(oDimension) {
						oData.GAMIFICATION_DIMENSIONS.push(oDimension.DIMENSION_ID);
					});
				}
				return oData;
			},

			onPersist: function(oData, oCampaign) {
				/*
				 * we need to invalidate all touched groups due to they must not be deleted if the are used in the
				 * campaign or they now can be deleted as they are no longer part of the campaign => we simply
				 * invalidate all groups
				 */
				sap.ui.ino.models.core.PropertyModel.invalidateCachedProperties("sap.ino.xs.object.iam.Group");
			},

			onNormalizeData: function(oCampaign) {
				// determine page number based on current array order
				// page numbers are cross-language which does not hurt as relative order in language is important
				jQuery.each(oCampaign.LanguagePages || [], function(iIndex, oPage) {
					oPage.PAGE_NO = iIndex;
				});

				jQuery.each(oCampaign.Phases || [], function(iIndex, oPage) {
					oPage.SEQUENCE_NO = iIndex;
				});
				// if(oCampaign.MAJOR_CHANGE){
				//   var record = {
				//       OBJECT_TYPE_CODE: "CAMPAIGN"
				//   };
				//   oCampaign.MajorChanges = [record];
				// }
				if (oCampaign.CampaignIntegration) {
					jQuery.each(oCampaign.CampaignIntegration, function(i, oCampaignIntegration) {
						if (oCampaignIntegration.AttributesLayout) {
							jQuery.each(oCampaignIntegration.AttributesLayout, function(iIndex, oLayout) {
								oLayout.DISPLAY_SEQUENCE = parseInt(oLayout.DISPLAY_SEQUENCE, 10);
							});
						}
					});
				}
				oCampaign.VALID_FROM = sap.ui.ino.models.util.Date.convertToUtcString(oCampaign.VALID_FROM, false);
				oCampaign.VALID_TO = sap.ui.ino.models.util.Date.convertToUtcString(oCampaign.VALID_TO, true);
				oCampaign.SUBMIT_FROM = sap.ui.ino.models.util.Date.convertToUtcString(oCampaign.SUBMIT_FROM, false);
				oCampaign.SUBMIT_TO = sap.ui.ino.models.util.Date.convertToUtcString(oCampaign.SUBMIT_TO, true);
				oCampaign.REGISTER_FROM = sap.ui.ino.models.util.Date.convertToUtcString(oCampaign.REGISTER_FROM, false);
				oCampaign.REGISTER_TO = sap.ui.ino.models.util.Date.convertToUtcString(oCampaign.REGISTER_TO, true);

				if (oCampaign.Tasks) {
					jQuery.each(oCampaign.Tasks, function(index, oTask) {
						oTask.START_DATE = sap.ui.ino.models.util.Date.convertToUtcString(oTask.START_DATE, false);
						oTask.END_DATE = sap.ui.ino.models.util.Date.convertToUtcString(oTask.END_DATE, true);
						if (oTask.Milestones) {
							jQuery.each(oTask.Milestones, function(i, oMilestone) {
								oMilestone.MILESTONE_DATE = sap.ui.ino.models.util.Date.convertToUtcString(oMilestone.MILESTONE_DATE, false);
							});
						}
					});
				}

				if (oCampaign.GAMIFICATION_DIMENSIONS) {
					var aSelGamificationDimension = oCampaign.GAMIFICATION_DIMENSIONS;
					for (var i = oCampaign.GamificationDimension.length - 1; i >= 0; i--) {
						var aCurrentDimension = aSelGamificationDimension.find(function(oDimension) {
							return Number(oCampaign.GamificationDimension[i].DIMENSION_ID) === Number(oDimension);
						});
						if (!aCurrentDimension || aCurrentDimension.length === 0) {
							oCampaign.GamificationDimension.splice(i, 1);
						}
					}
					var iId = -999999;
					aSelGamificationDimension.forEach(function(sDimension) {
						var aCurrentGamificationDimension = oCampaign.GamificationDimension.find(function(oGamificationDimension) {
							return Number(oGamificationDimension.DIMENSION_ID) === Number(sDimension);
						});
						if (!aCurrentGamificationDimension || aCurrentGamificationDimension.length === 0) {
							oCampaign.GamificationDimension.push({
								ID: iId++,
								DIMENSION_ID: Number(sDimension),
								CAMPAIGN_ID: oCampaign.ID
							});
						}
					});
				}
				return oCampaign;
			},

			onMergeConcurrentChanges: function(oMergeResult, oUserChange) {
				// When two users have created texts in the same language
				// there are two objects after standard merge
				// As the UI shows only one text per language we make sure that for this
				// case the user change wins
				jQuery.each(oUserChange.LanguageTexts || [], function(iIndex, oText) {
					if (oText.ID < 0) {
						var sLanguage = oText.LANG;
						var iId = oText.ID;
						var aDuplicate = jQuery.grep(oMergeResult.LanguageTexts || [], function(oText, iIndex) {
							return oText.LANG === sLanguage && oText.ID !== iId;
						});
						jQuery.sap.assert((aDuplicate.length <= 1));
						if (aDuplicate.length === 1) {
							// apply user change to existing text
							oText.ID = aDuplicate[0].ID;
							jQuery.extend(aDuplicate[0], oText);
							for (var i = 0; oMergeResult.LanguageTexts; i++) {
								if (oMergeResult.LanguageTexts[i].ID === iId) {
									oMergeResult.LanguageTexts.splice(i, 1);
									return;
								}
							}
						}
					}
				});

				return oMergeResult;
			}

		},
		actions: {
			publish: {
				enabledCheck: function(oCampaign, bEnabled) {
					if (bEnabled === undefined) {
						return oCampaign.getProperty("/property/actions/create/enabled");
					} else {
						var bUpdate = oCampaign.getProperty("/property/actions/update/enabled");
						var bSubmit = oCampaign.getProperty("/property/actions/submit/enabled");
						return bUpdate && bSubmit && bEnabled;
					}
				},
				execute: function(vKey, oCampaign, oParameter, oActionMetadata, oSettings) {
					var bDraft = (oCampaign.getProperty("/STATUS_CODE") == Status.Draft);

					var oDeferred = new jQuery.Deferred();
					var oModifyRequest = oCampaign.modify(oSettings);
					oModifyRequest.fail(oDeferred.reject);
					if (bDraft) {
						oModifyRequest.done(function() {
							var oSubmitRequest = oCampaign.submit(oSettings);
							oSubmitRequest.fail(oDeferred.reject);
							oSubmitRequest.done(oDeferred.resolve);
						});
					} else {
						oModifyRequest.done(oDeferred.resolve);
					}
					return oDeferred.promise();
				}
			},
			majorpublish: {
				enabledCheck: function(oCampaign, bEnabled) {
					if (bEnabled === undefined) {
						return oCampaign.getProperty("/property/actions/create/enabled");
					} else {
						var bUpdate = oCampaign.getProperty("/property/actions/update/enabled");
						var bSubmit = oCampaign.getProperty("/property/actions/submit/enabled");
						return bUpdate && bSubmit && bEnabled;
					}
				},
				execute: function(vKey, oCampaign, oParameter, oActionMetadata, oSettings) {
					var bDraft = (oCampaign.getProperty("/STATUS_CODE") == Status.Draft);

					var oDeferred = new jQuery.Deferred();
					var oModifyRequest = oCampaign.majorpublish(oSettings);
					oModifyRequest.fail(oDeferred.reject);
					oModifyRequest.done(oDeferred.resolve);
					return oDeferred.promise();
				}
			},
			save: {
				enabledCheck: function(oCampaign) {
					if (oCampaign.getProperty("/ID") < 0) {
						return oCampaign.getProperty("/property/actions/create/enabled");
					} else {
						var bUpdate = oCampaign.getProperty("/property/actions/update/enabled");
						var bDraft = (oCampaign.getProperty("/STATUS_CODE") == Status.Draft);
						return bUpdate && bDraft;
					}
				},
				execute: function(vKey, oCampaign, oParameter, oActionMetadata, oSettings) {
					return oCampaign.modify(oSettings);
				}
			}
		},

		setProperty: function(sPath, vValue) {
			if (sPath === "/SUBMIT_TO" || sPath === "/VALID_TO" || sPath === "/REGISTER_TO") {
				sap.ui.ino.models.util.Date.setEndOfDay(vValue);
			}
			return sap.ui.ino.models.core.ApplicationObject.prototype.setProperty.apply(this, arguments);
		},

		setCampaignImage: function(oData) {
			this._setImage(oData, "CAMPAIGN_DETAIL_IMG", "/CAMPAIGN_IMAGE_ASSIGN_ID", "/CAMPAIGN_IMAGE_ID");
		},

		setCampaignBackgroundImage: function(oData) {
			this._setImage(oData, "BACKGROUND_IMG", "/CAMPAIGN_BACKGROUND_IMAGE_ASSIGN_ID", "/CAMPAIGN_BACKGROUND_IMAGE_ID");
		},

		setCampaignMobileSmallBackgroundImage: function(oData) {
			this._setImage(oData, "SMALL_BACKGROUND_IMG", "/CAMPAIGN_SMALL_BACKGROUND_IMAGE_ASSIGN_ID", "/CAMPAIGN_SMALL_BACKGROUND_IMAGE_ID");
		},

		setCampaignListImage: function(oData) {
			this._setImage(oData, "CAMPAIGN_LIST_IMG", "/CAMPAIGN_LIST_IMAGE_ASSIGN_ID", "/CAMPAIGN_LIST_IMAGE_ID");
		},

		_Feeds: [],

		_setImage: function(oData, sRoleTypeCode, sAssignmentIdPropertyName, sAttachmentIdPropertyName) {
			var sPropertyName = "/Attachments";
			oData.ROLE_TYPE_CODE = sRoleTypeCode;
			var aChildrenData = this.getProperty(sPropertyName);
			aChildrenData = aChildrenData ? aChildrenData : [];
			var iAssignmentId = 0;
			var iAttachmentId = 0;
			jQuery.each(aChildrenData, function(oKey, sChildData) {
				if (sChildData.ATTACHMENT_ID == oData.ATTACHMENT_ID) {
					iAssignmentId = sChildData.ID;
					jQuery.each(aChildrenData, function(oKey, sChildData) {
						if (sChildData.ROLE_TYPE_CODE === sRoleTypeCode) {
							sChildData.ROLE_TYPE_CODE = "ATTACHMENT";
							iAttachmentId = sChildData.ATTACHMENT_ID;
						}
					});
					sChildData.ROLE_TYPE_CODE = oData.ROLE_TYPE_CODE;
					return false;
				}
				return true;
			});

			if (iAssignmentId == 0) {
				iAssignmentId = this.getNextHandle();
				oData.ID = iAssignmentId;
				jQuery.each(aChildrenData, function(oKey, sChildData) {
					if (sChildData.ROLE_TYPE_CODE === sRoleTypeCode) {
						sChildData.ROLE_TYPE_CODE = "ATTACHMENT";
						iAttachmentId = sChildData.ATTACHMENT_ID;
					}
				});
				aChildrenData.push(oData);
			}
			if (iAttachmentId != 0) {
				aChildrenData = jQuery.grep(aChildrenData, function(oChild, iIndex) {
					if (oChild.ATTACHMENT_ID !== iAttachmentId) {
						return true;
					}

					return false;
				});
			}
			this.setProperty(sAssignmentIdPropertyName, iAssignmentId);
			this.setProperty(sAttachmentIdPropertyName, oData.ATTACHMENT_ID);
			this.setProperty(sPropertyName, aChildrenData);
		},

		clearCampaignImage: function(assignmentId) {
			this._clearImage(assignmentId, "/CAMPAIGN_IMAGE_ASSIGN_ID", "/CAMPAIGN_IMAGE_ID");
		},

		clearCampaignBackgroundImage: function(assignmentId) {
			this._clearImage(assignmentId, "/CAMPAIGN_BACKGROUND_IMAGE_ASSIGN_ID", "/CAMPAIGN_BACKGROUND_IMAGE_ID");
		},

		clearCampaignMobileSmallBackgroundImage: function(assignmentId) {
			this._clearImage(assignmentId, "/CAMPAIGN_SMALL_BACKGROUND_IMAGE_ASSIGN_ID", "/CAMPAIGN_SMALL_BACKGROUND_IMAGE_ID");
		},

		clearCampaignListImage: function(assignmentId) {
			this._clearImage(assignmentId, "/CAMPAIGN_LIST_IMAGE_ASSIGN_ID", "/CAMPAIGN_LIST_IMAGE_ID");
		},

		_clearImage: function(assignmentId, sAssignmentIdPropertyName, sAttachmentIdPropertyName) {
			this.setProperty(sAssignmentIdPropertyName, null);
			this.setProperty(sAttachmentIdPropertyName, null);
			var sPropertyName = "/Attachments";
			var aChildrenData = this.getProperty(sPropertyName);
			aChildrenData = jQuery.grep(aChildrenData, function(oChild, iIndex) {
				if (oChild.ID !== assignmentId) {
					return true;
				}
				return false;
			});
			this.setProperty(sPropertyName, aChildrenData);
		},

		addAttachment: function(oNewAttachment) {
			oNewAttachment.ROLE_TYPE_CODE = "ATTACHMENT";
			this.addChild(oNewAttachment, "Attachments");
		},

		removeAttachment: function(iId) {
			var aAttachment = jQuery.grep(this.getProperty("/Attachments"), function(oAttachment) {
				return oAttachment.ID === iId;
			});
			var oAttachment = aAttachment && aAttachment[0];
			if (oAttachment) {
				if (oAttachment.ROLE_TYPE_CODE === "CAMPAIGN_DETAIL_IMG") {
					this.setProperty("/CAMPAIGN_IMAGE_ASSIGN_ID", null);
					this.setProperty("/CAMPAIGN_IMAGE_ID", null);
				} else if (oAttachment.ROLE_TYPE_CODE === "BACKGROUND_IMG") {
					this.setProperty("/CAMPAIGN_BACKGROUND_IMAGE_ASSIGN_ID", null);
					this.setProperty("/CAMPAIGN_BACKGROUND_IMAGE_ID", null);
				} else if (oAttachment.ROLE_TYPE_CODE === "SMALL_BACKGROUND_IMG") {
					this.setProperty("/CAMPAIGN_SMALL_BACKGROUND_IMAGE_ASSIGN_ID", null);
					this.setProperty("/CAMPAIGN_SMALL_BACKGROUND_IMAGE_ID", null);
				} else if (oAttachment.ROLE_TYPE_CODE === "CAMPAIGN_LIST_IMG") {
					this.setProperty("/CAMPAIGN_LIST_IMAGE_ASSIGN_ID", null);
					this.setProperty("/CAMPAIGN_LIST_IMAGE_ID", null);
				}
				this.removeChild(oAttachment);
			}
		},

		addTag: function(oNewTag) {
			var oMessage = undefined;
			var aTags = this.getProperty("/Tags");

			if (!oNewTag.NAME || jQuery.trim(oNewTag.NAME).length === 0) {
				oMessage = new sap.ui.ino.application.Message({
					key: "MSG_INVALID_EMPTY_TAG",
					level: sap.ui.core.MessageType.Error,
					group: "TAG"
				});
				return oMessage;
			}

			oNewTag.NAME = jQuery.trim(oNewTag.NAME);

			if (!oNewTag.TAG_ID && oNewTag.NAME) {
				// Tags are created "on the fly"
				// so for new tags (not only tag assignment)
				// a new handle is used
				oNewTag.TAG_ID = this.getNextHandle();
			}
			var aMatches = jQuery.grep(aTags, function(oTag) {
				return oTag.TAG_ID === oNewTag.TAG_ID;
			});

			if (aMatches.length === 0) {
				this.addChild(oNewTag, "Tags");
			}
		},

		// No XS HTML check possible, check on UI
		validateHTML: function(iId) {
			var aMessage = [];
			jQuery.each(this.getData().LanguagePages, function(i, oLanguagePage) {
				if (iId && oLanguagePage.ID !== iId) {
					return;
				}
				var aCodes = sap.ui.ino.models.core.CodeModel.getCodes("sap.ino.xs.object.basis.Language.Root", function(oLanguage) {
					return oLanguage.ISO_CODE.toUpperCase() === oLanguagePage.LANG.toUpperCase();
				});
				var oMessage = {
					"TYPE": "E",
					"MESSAGE": "MSG_CAMPAIGN_INVALID_HTML",
					"REF_ID": oLanguagePage.ID,
					"REF_NODE": "LanguagePages",
					"REF_FIELD": "HTML_CONTENT",
					"PARAMETERS": [oLanguagePage.TITLE, "{code>sap.ino.xs.object.basis.Language.Root:" + aCodes[0].CODE + "}"]
				};
				try {
					// Validate HTML
					var aResult = new jQuery(oLanguagePage.HTML_CONTENT);
					if (!aResult || aResult.length === 0) {
						aMessage.push(oMessage);
					}
				} catch (e) {
					aMessage.push(oMessage);
				}
			});
			return aMessage;
		},

		validateNotification: function() {
			var aMessage = [];
			// 			jQuery.each(this.getData().CampaignNotification, function(i, oNotification) {
			// 				var oMessage = {
			// 					"TYPE": "E",
			// 					"MESSAGE": "MSG_CAMPAIGN_INVALID_RECEIVER",
			// 					"REF_ID": oNotification.ID,
			// 					"REF_NODE": "/CampaignNotification/" + i,
			// 					"REF_FIELD": "CampaignNotificationReceiver",
			// 					"PARAMETERS": [oNotification.ACTION_CODE]
			// 				};

			// 				var iIndex = -1;
			// 				oNotification.CampaignNotificationReceiver.forEach(function(oReceiver, iReceiver) {
			// 					if (oReceiver.IS_RECEIVE_EMAIL === 1 && iIndex === -1) {
			// 						iIndex = iReceiver;
			// 					}
			// 				});
			// 				if (iIndex === -1) {
			// 					aMessage.push(oMessage);
			// 				}
			// 			});
			return aMessage;
		},

		determinePageCreate: function(sLangCode) {
			return {
				ID: this.getNextHandle(),
				PAGE_NO: 0,
				HTML_CONTENT: "<p></p>",
				TITLE: "",
				IS_VISIBLE: 1,
				LANG: sLangCode
			};
		},

		determinePhaseCreate: function() {
			var aPhases = this.getProperty("/Phases");
			var iSeqNo = 0;
			for (var ii = 0; ii < aPhases.length; ++ii) {
				iSeqNo = aPhases[ii]["SEQUENCE_NO"] >= iSeqNo ? aPhases[ii]["SEQUENCE_NO"] + 1 : iSeqNo;
			}

			var aPhaseCodes = sap.ui.ino.models.core.CodeModel.getCodes("sap.ino.xs.object.campaign.Phase.Root");
			var sPhaseCode = "";
			var bSuccess = true;
			// get a not used phase code
			for (var jj = 0; jj < aPhaseCodes.length; ++jj) {
				sPhaseCode = aPhaseCodes[jj]["CODE"];
				bSuccess = true;

				for (var kk = 0; kk < aPhases.length; ++kk) {
					if (sPhaseCode === aPhases[kk]["PHASE_CODE"]) {
						bSuccess = false;
						break;
					}
				}

				if (bSuccess) {
					break;
				}
			}

			var aStatusCodes = sap.ui.ino.models.core.CodeModel.getCodes("sap.ino.xs.object.status.Model.Root");
			var sStatusCode = (aStatusCodes && aStatusCodes.length > 0) ? aStatusCodes[0]["CODE"] : "";

			return {
				PHASE_CODE: sPhaseCode,
				STATUS_MODEL_CODE: sStatusCode,
				EVALUATION_MODEL_CODE: "",
				VOTING_ACTIVE: 1,
				SHOW_IDEA_IN_COMMUNITY: 1,
				IDEA_CONTENT_EDITABLE: 1,
				SEQUENCE_NO: iSeqNo,
				AUTO_EVAL_PUB_CODE: "",
				CampaignNotificationStatus: []
			};
		},

		determinNotificationCreate: function() {
			var that = this;
			var aCampaignNotification = this.getProperty('/CampaignNotification') || [];
			var Configuration = sap.ui.ino.application.Configuration;
			var sOdataPath = "/" + Configuration.getApplicationPath("sap.ino.config.URL_PATH_OD_BACKOFFICE");
			var oNotificationModel = new sap.ui.model.json.JSONModel(Configuration.getBackendRootURL() + sOdataPath +
				"/NotificationSystemSetting?$expand=Receivers&$skip=0&$top=1000&$orderby=ACTION_CODE%20asc");
			oNotificationModel.attachRequestCompleted(oNotificationModel, function() {
				var oData = oNotificationModel.getProperty("/d/results");
				var aNotificationAction = oData.filter(function(oItem) {
					return oItem.ALLOW_EMAIL_NOTIFICATION === 1 && Receivers.hasOwnProperty(oItem.ACTION_CODE);
				});
				var bModelChanged = false;
				aNotificationAction = aNotificationAction.map(function(oItem) {
					var aNotificationReceiver = [];
					var oAction = null;
					aCampaignNotification.forEach(function(o) {
						if (o.ACTION_CODE === oItem.ACTION_CODE) {
							oAction = o;
						}
					});
					var aTempReceivers = oItem.Receivers.results;
					if (!oAction) {
						if (aTempReceivers && aTempReceivers.length > 0) {
							aTempReceivers.forEach(function(oReceiver) {
								if (oReceiver.IS_RECEIVE_EMAIL) {
									aNotificationReceiver.push({
										ID: that.getNextHandle(),
										ROLE_CODE: oReceiver.ROLE_CODE,
										ROLE_NAME: sap.ui.getCore().getModel("i18n").getResourceBundle().getText('BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_ROLE_' +
											oReceiver.ROLE_CODE),
										IS_RECEIVE_EMAIL: that.getProperty('/ID') > 0 ? 0 : oReceiver.IS_RECEIVE_EMAIL
									});
								}
							});
						} else {
							Receivers[oItem.ACTION_CODE].forEach(function(sCode) {
								aNotificationReceiver.push({
									ID: that.getNextHandle(),
									ROLE_CODE: sCode,
									ROLE_NAME: sap.ui.getCore().getModel("i18n").getResourceBundle().getText('BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_ROLE_' +
										sCode),
									IS_RECEIVE_EMAIL: 0
								});
							});
						}
						if (aNotificationReceiver) {
							aNotificationReceiver.sort(function(oPrev, oNext) {
								if (oPrev.ROLE_NAME > oNext.ROLE_NAME) {
									return 1;
								} else if (oPrev.ROLE_NAME < oNext.ROLE_NAME) {
									return -1;
								} else {
									return 0;
								}
							});
						}
						bModelChanged = true;
						return {
							ID: that.getNextHandle(),
							ACTION_CODE: oItem.ACTION_CODE,
							TEXT_MODULE_CODE: that.getProperty('/ID') > 0 ? '' : (oItem.TEXT_MODULE_CODE || ''),
							CampaignNotificationReceiver: aNotificationReceiver
						};
					} else {
						oAction.CampaignNotificationReceiver = oAction.CampaignNotificationReceiver === null ? [] : oAction.CampaignNotificationReceiver;
						if (aTempReceivers && aTempReceivers.length > 0) {
							aTempReceivers.forEach(function(oTempReceiver) {
								var nIndex = oAction.CampaignNotificationReceiver.findIndex(function(oReceiver) {
									return oReceiver.ROLE_CODE === oTempReceiver.ROLE_CODE;
								});
								if (nIndex >= 0 && !oTempReceiver.IS_RECEIVE_EMAIL) {
									oAction.CampaignNotificationReceiver.splice(nIndex, 1);
									bModelChanged = true;
								} else if (nIndex < 0 && !!oTempReceiver.IS_RECEIVE_EMAIL) {
									oAction.CampaignNotificationReceiver.push({
										ID: that.getNextHandle(),
										ROLE_CODE: oTempReceiver.ROLE_CODE,
										ROLE_NAME: sap.ui.getCore().getModel("i18n").getResourceBundle().getText('BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_ROLE_' +
											oTempReceiver.ROLE_CODE),
										IS_RECEIVE_EMAIL: 0
									});
									bModelChanged = true;
								} else if (nIndex >= 0 && !!oTempReceiver.IS_RECEIVE_EMAIL) {
									oAction.CampaignNotificationReceiver[nIndex].ROLE_NAME = sap.ui.getCore().getModel("i18n").getResourceBundle().getText(
										'BO_CAMPAIGN_FACET_MAIL_NOTIFICATION_FLD_ROLE_' + oAction.CampaignNotificationReceiver[nIndex].ROLE_CODE);
								}
							});
						}
						if (oAction.CampaignNotificationReceiver) {
							oAction.CampaignNotificationReceiver.sort(function(oPrev, oNext) {
								if (oPrev.ROLE_NAME > oNext.ROLE_NAME) {
									return 1;
								} else if (oPrev.ROLE_NAME < oNext.ROLE_NAME) {
									return -1;
								} else {
									return 0;
								}
							});
						}
						return oAction;
					}
				});
				that.setProperty('/CampaignNotification', aNotificationAction);
				that.setProperty('/CampaignNotificationRefrsh', true);
				// workaround to fix issue when model is no change and switching facet to activity the save dailog will popup
				// todo: when changing notification in subnode, change event not fired
				if (!bModelChanged && that._oBeforeData) {
					that._oBeforeData.CampaignNotification = jQuery.extend(true, [], aNotificationAction);
				}
			}, this);
		},

		determinNotificationStatusCreate: function(sStatusModelCode, sTransitionCode) {
			var that = this;
			var aPhase = this.getProperty('/Phases');
			var iPhaseIndex = -1;
			var iNotificationIndex = -1;
			aPhase.map(function(oPhase, i) {
				oPhase.CampaignNotificationStatus = oPhase.CampaignNotificationStatus || [];
				if (oPhase.STATUS_MODEL_CODE === sStatusModelCode) {
					iPhaseIndex = iPhaseIndex > -1 ? iPhaseIndex : i;
					iNotificationIndex = iNotificationIndex > -1 ? iNotificationIndex : oPhase.CampaignNotificationStatus.length;
					var oStatus = {
						ID: that.getNextHandle(),
						STATUS_ACTION_CODE: sTransitionCode,
						TEXT_MODULE_CODE: ''
					};
					oPhase.CampaignNotificationStatus.push(oStatus);
				}
				return oPhase;
			});
			this.setProperty('/Phases', aPhase);
			return {
				iPhaseIndex: iPhaseIndex,
				iNotificationIndex: iNotificationIndex
			};
		},

		initGamificationDimensions: function() {
			var that = this;
			var Configuration = sap.ui.ino.application.Configuration;
			var sOdataPath = "/" + Configuration.getApplicationPath("sap.ino.config.URL_PATH_OD_BACKOFFICE");
			var oDimensionModel = new sap.ui.model.json.JSONModel(Configuration.getBackendRootURL() + sOdataPath +
				"/Dimension?$skip=0&$top=10&$filter=STATUS%20eq%201&$orderby=NAME%20asc");
			oDimensionModel.attachRequestCompleted(oDimensionModel, function() {
				var oData = oDimensionModel.getProperty("/d/results");
				that.setProperty('/ALL_GAMIFICATION_DIMENSIONS', oData);
			}, this);
		},

		updateSatausTextModuleCode: function(sStatusModelCode, sTransitionCode, sKey) {
			var aPhase = this.getProperty('/Phases');
			aPhase.map(function(oPhase) {
				if (oPhase.STATUS_MODEL_CODE === sStatusModelCode) {
					oPhase.CampaignNotificationStatus.forEach(function(oStatus) {
						if (oStatus.STATUS_ACTION_CODE === sTransitionCode) {
							oStatus.TEXT_MODULE_CODE = sKey;
						}
					});
				}
				return oPhase;
			});
			this.setProperty('/Phases', aPhase);
		},

		setData: function(oData) {
			sap.ui.ino.models.core.ApplicationObject.prototype.setData.apply(this, arguments);

			// this is done to give the possibility to trigger an update of the language binding, as the index of the
			// languages in the languagetexts might have changed
			var oEvtBus = sap.ui.getCore().getEventBus();
			oEvtBus.publish("sap.ui.ino.models.object.Campaign", "language_update", {});
		},

		addSubmissionMilestone: function(aMilestone) {
			var oSubmissionFrom = this.getProperty("/SUBMIT_FROM");
			var oSubmissionTo = this.getProperty("/SUBMIT_TO");
			var bExistsFrom = false;
			var bExistsTo = false;
			jQuery.each(aMilestone, function(index, milestone) {
				if (milestone.MILESTONE_CODE === "IDEA_SUBMIT_START") {
					bExistsFrom = true;
				}
				if (milestone.MILESTONE_CODE === "IDEA_SUBMIT_END") {
					bExistsTo = true;
				}
			});
			if (oSubmissionFrom && !bExistsFrom && oSubmissionFrom.getFullYear() < 9999) {
				aMilestone.push({
					"MILESTONE_CODE": "IDEA_SUBMIT_START",
					"MILESTONE_NAME": sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.Milestone.Root", "IDEA_SUBMIT_START"),
					"DATE_TYPE_CODE": "DAY",
					"MILESTONE_DATE": this.getProperty("/SUBMIT_FROM"),
					"IS_MILESTONE_DISPLAY": 0,
					"MILESTONE_COLOR_CODE": "E50082"
				});
			}
			if (oSubmissionTo && !bExistsTo && oSubmissionTo.getFullYear() < 9999) {
				aMilestone.push({
					"MILESTONE_CODE": "IDEA_SUBMIT_END",
					"MILESTONE_NAME": sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.Milestone.Root", "IDEA_SUBMIT_END"),
					"DATE_TYPE_CODE": "DAY",
					"MILESTONE_DATE": this.getProperty("/SUBMIT_TO"),
					"IS_MILESTONE_DISPLAY": 0,
					"MILESTONE_COLOR_CODE": "E50082"
				});
			}
		},

		addRegistratorMilestone: function(aMilestone) {
			var oRegistrationFrom = this.getProperty("/REGISTER_FROM");
			var oRegistrationTo = this.getProperty("/REGISTER_TO");
			var bExistsFrom = false;
			var bExistsTo = false;
			jQuery.each(aMilestone, function(index, milestone) {
				if (milestone.MILESTONE_CODE === "CAMP_REGISTER_START") {
					bExistsFrom = true;
				}
				if (milestone.MILESTONE_CODE === "CAMP_REGISTER_END") {
					bExistsTo = true;
				}
			});
			if (oRegistrationFrom && !bExistsFrom && oRegistrationFrom.getFullYear() < 9999) {
				aMilestone.push({
					"MILESTONE_CODE": "CAMP_REGISTER_START",
					"MILESTONE_NAME": sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.Milestone.Root", "CAMP_REGISTER_START"),
					"DATE_TYPE_CODE": "DAY",
					"MILESTONE_DATE": this.getProperty("/REGISTER_FROM"),
					"IS_MILESTONE_DISPLAY": 0,
					"MILESTONE_COLOR_CODE": "E50082"
				});
			}
			if (oRegistrationTo && !bExistsTo && oRegistrationTo.getFullYear() < 9999) {
				aMilestone.push({
					"MILESTONE_CODE": "CAMP_REGISTER_END",
					"MILESTONE_NAME": sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.Milestone.Root", "CAMP_REGISTER_END"),
					"DATE_TYPE_CODE": "DAY",
					"MILESTONE_DATE": this.getProperty("/REGISTER_TO"),
					"IS_MILESTONE_DISPLAY": 0,
					"MILESTONE_COLOR_CODE": "E50082"
				});
			}
		},

		addValidToMilestone: function(aMilestone) {
			var oValidTo = this.getProperty("/VALID_TO");
			var bExists = false;
			jQuery.each(aMilestone, function(index, milestone) {
				if (milestone.MILESTONE_CODE === "CAMP_END") {
					bExists = true;
				}
			});
			if (oValidTo && !bExists && oValidTo.getFullYear() < 9999) {
				aMilestone.push({
					"MILESTONE_CODE": "CAMP_END",
					"MILESTONE_NAME": sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.Milestone.Root", "CAMP_END"),
					"DATE_TYPE_CODE": "DAY",
					"MILESTONE_DATE": oValidTo,
					"IS_MILESTONE_DISPLAY": 0,
					"MILESTONE_COLOR_CODE": "E50082"
				});
			}
		},

		addOverallMilestone: function(aMilestone) {
			var bExistsFrom = false;
			var bExistsTo = false;
			jQuery.each(aMilestone, function(index, milestone) {
				if (milestone.MILESTONE_CODE === "CAMP_START") {
					bExistsFrom = true;
				}
				if (milestone.MILESTONE_CODE === "CAMP_END") {
					bExistsTo = true;
				}
			});
			if (!bExistsFrom) {
				aMilestone.push({
					"MILESTONE_CODE": "CAMP_START",
					"MILESTONE_NAME": sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.Milestone.Root", "CAMP_START"),
					"DATE_TYPE_CODE": "DAY",
					"MILESTONE_DATE": this.getProperty("/VALID_FROM"),
					"IS_MILESTONE_DISPLAY": 0,
					"MILESTONE_COLOR_CODE": "E50082"
				});
			}
			var oValidTo = this.getProperty("/VALID_TO");
			if (oValidTo && !bExistsTo && oValidTo.getFullYear() < 9999) {
				aMilestone.push({
					"MILESTONE_CODE": "CAMP_END",
					"MILESTONE_NAME": sap.ui.ino.models.core.CodeModel.getText("sap.ino.xs.object.basis.Milestone.Root", "CAMP_END"),
					"DATE_TYPE_CODE": "DAY",
					"MILESTONE_DATE": oValidTo,
					"IS_MILESTONE_DISPLAY": 0,
					"MILESTONE_COLOR_CODE": "E50082"
				});
			}
		},

		addSubmissionTask: function(aTask) {
			var oSubmissionFrom = this.getProperty("/SUBMIT_FROM");
			var oSubmissionTo = this.getProperty("/SUBMIT_TO");
			var bExistsRegistration = false;
			var existsTask;
			jQuery.each(aTask, function(index, oTask) {
				if (oTask.TASK_CODE === "sap.ino.config.CAMP_REGISTRATION") {
					bExistsRegistration = true;
				}
				if (oTask.TASK_CODE === "sap.ino.config.IDEA_SUBMISSION") {
					existsTask = oTask;
				}
			});
			if (!oSubmissionFrom || !oSubmissionTo) {
				if (existsTask) {
					aTask.splice(bExistsRegistration ? 2 : 1, 1);
				}
				return;
			}
			if (!existsTask) {
				existsTask = {
					"TASK_CODE": "sap.ino.config.IDEA_SUBMISSION",
					"START_DATE": oSubmissionFrom,
					"END_DATE": oSubmissionTo,
					"IS_TASK_DISPLAY": 1,
					"DATE_TYPE_CODE": "DAY",
					"MILESTONE_COUNT": 0,
					"Milestones": []
				};
				aTask.splice(bExistsRegistration ? 2 : 1, 0, existsTask);
			}
			this.addSubmissionMilestone(existsTask.Milestones);
			existsTask.MILESTONE_COUNT = existsTask.Milestones.length;

			//sort and get Object again
			var oData = this.getData();
			normalizeTaskSequenceNo(oData.Tasks);
			oData.Tasks = sortObjectArray(oData.Tasks, "SEQUENCE_NO");
			this.checkUpdate(true);
		},

		addRegistratorTask: function(aTask) {
			var oRegistrationFrom = this.getProperty("/REGISTER_FROM");
			var oRegistrationTo = this.getProperty("/REGISTER_TO");

			var existsTask = false;
			jQuery.each(aTask, function(index, oTask) {
				if (oTask.TASK_CODE === "sap.ino.config.CAMP_REGISTRATION") {
					existsTask = oTask;
				}
			});
			if (!oRegistrationFrom || !oRegistrationTo) {
				if (existsTask) {
					aTask.splice(1, 1);
				}
				return;
			}
			if (!existsTask) {
				existsTask = {
					"TASK_CODE": "sap.ino.config.CAMP_REGISTRATION",
					"START_DATE": oRegistrationFrom,
					"END_DATE": oRegistrationTo,
					"IS_TASK_DISPLAY": 1,
					"DATE_TYPE_CODE": "DAY",
					"MILESTONE_COUNT": 0,
					"Milestones": []
				};
				aTask.splice(1, 0, existsTask);
			}
			this.addRegistratorMilestone(existsTask.Milestones);
			existsTask.MILESTONE_COUNT = existsTask.Milestones.length;

			//sort and get Object again
			var oData = this.getData();
			normalizeTaskSequenceNo(oData.Tasks);
			oData.Tasks = sortObjectArray(oData.Tasks, "SEQUENCE_NO");
			this.checkUpdate(true);
		},

		addOverallTask: function(aTask) {
			var oCampaignTask = {
				"TASK_CODE": "sap.ino.config.CAMP_OVERALL",
				"START_DATE": this.getProperty("/VALID_FROM"),
				"END_DATE": this.getProperty("/VALID_TO"),
				"IS_TASK_DISPLAY": 1,
				"DATE_TYPE_CODE": "DAY",
				"Milestones": []
			};
			var bExists = false;
			jQuery.each(aTask, function(index, oTask) {
				if (oTask.TASK_CODE === "sap.ino.config.CAMP_OVERALL") {
					oCampaignTask = oTask;
					bExists = true;
				}
			});
			this.addOverallMilestone(oCampaignTask.Milestones);
			oCampaignTask.MILESTONE_COUNT = oCampaignTask.Milestones.length;
			if (!bExists) {
				aTask.splice(0, 0, oCampaignTask);
			}

			//sort and get Object again
			var oData = this.getData();
			normalizeTaskSequenceNo(oData.Tasks);
			oData.Tasks = sortObjectArray(oData.Tasks, "SEQUENCE_NO");
			this.checkUpdate(true);
		},

		addDefaultTasksAndMilestones: function() {
			var aTask = this.getProperty("/Tasks");
			if (!aTask) {
				aTask = [];
				this.setProperty("/Tasks", aTask);
			}

			this.addOverallTask(aTask);
			this.addRegistratorTask(aTask);
			this.addSubmissionTask(aTask);

			//sort and get Object again
			var oData = this.getData();
			normalizeTaskSequenceNo(oData.Tasks);
			oData.Tasks = sortObjectArray(oData.Tasks, "SEQUENCE_NO");
			this.checkUpdate(true);
		},

		newCampaignTask: function(sTaskCode, oCustomDate) {
			var oCampaignTask = {
				"TASK_CODE": sTaskCode,
				"START_DATE": oCustomDate.Day.Start,
				"END_DATE": oCustomDate.Day.End,
				"START_YEAR": oCustomDate.Year.Start.toString(),
				"END_YEAR": oCustomDate.Year.End.toString(),
				"START_MONTH_CODE": "sap.ino.config." + oCustomDate.Month.Start,
				"END_MONTH_CODE": "sap.ino.config." + oCustomDate.Month.End,
				"START_QUARTER_CODE": "sap.ino.config." + oCustomDate.Quarter.Start,
				"END_QUARTER_CODE": "sap.ino.config." + oCustomDate.Quarter.End,
				"IS_TASK_DISPLAY": 1,
				"DATE_TYPE_CODE": "DAY",
				"MILESTONE_COUNT": 0,
				"Milestones": []
			};
			var iHandle = this.getNextHandle();
			oCampaignTask.ID = iHandle;
			var oNodeArray = this.getProperty("/Tasks");
			if (!oNodeArray) {
				oNodeArray = [];
				this.setProperty("/Tasks", oNodeArray);
			}
			oNodeArray.push(oCampaignTask);

			//sort and get Object again
			var oData = this.getData();
			normalizeTaskSequenceNo(oData.Tasks);
			oData.Tasks = sortObjectArray(oData.Tasks, "SEQUENCE_NO");
			this.checkUpdate(true);
			return iHandle;
		},

		deleteCampaignTask: function(nIndex) {
			var aTasklist = this.getProperty("/Tasks");
			this.removeChild(aTasklist[nIndex], "Tasks");
		},

		moveTaskUp: function(oTask) {
			var oData = this.getData();
			var oPreviousTask = getPreviousTask(oTask, oData.Tasks);

			if (oPreviousTask) {
				var iPreviousTaskSequenceNo = oPreviousTask.SEQUENCE_NO;
				oPreviousTask.SEQUENCE_NO = oTask.SEQUENCE_NO;
				oTask.SEQUENCE_NO = iPreviousTaskSequenceNo;

				this.updateNode(oTask, "Tasks");
				this.updateNode(oPreviousTask, "Tasks");
				//sort and get data Again 
				oData = this.getData();
				oData.Transitions = sortObjectArray(oData.Tasks, "SEQUENCE_NO");
				this.setData(oData);
			}
		},

		moveTaskDown: function(oTask) {
			var oData = this.getData();
			var oNextTask = getNextTask(oTask, oData.Tasks);

			if (oNextTask) {
				var iNextTaskSequenceNo = oNextTask.SEQUENCE_NO;
				oNextTask.SEQUENCE_NO = oTask.SEQUENCE_NO;
				oTask.SEQUENCE_NO = iNextTaskSequenceNo;

				this.updateNode(oTask, "Tasks");
				this.updateNode(oNextTask, "Tasks");
				//sort and get data Again 
				oData = this.getData();
				oData.Transitions = sortObjectArray(oData.Tasks, "SEQUENCE_NO");
				this.setData(oData);
			}
		},

		newMilestone: function(nParentIndex, oCustomDate) {
			var sNodeName = "Tasks/" + nParentIndex + "/Milestones";
			var oMilestone = {
				"MILESTONE_NAME": "",
				"MILESTONE_DATE": oCustomDate.Day,
				"MILESTONE_YEAR": oCustomDate.Year.toString(),
				"MILESTONE_MONTH_CODE": "sap.ino.config." + oCustomDate.Month,
				"MILESTONE_QUARTER_CODE": "sap.ino.config." + oCustomDate.Quarter,
				"IS_MILESTONE_DISPLAY": 1,
				"DATE_TYPE_CODE": "DAY",
				"MILESTONE_COLOR_CODE": "E50082"
			};
			var iHandle = this.getNextHandle();
			oMilestone.ID = iHandle;
			var oNodeArray = this.getProperty("/" + sNodeName);
			if (!oNodeArray) {
				oNodeArray = [];
				this.setProperty("/" + sNodeName, oNodeArray);
			}
			oMilestone.SEQUENCE_NO = oNodeArray.length;
			oNodeArray.push(oMilestone);
			this.checkUpdate(true);
			var nCount = parseInt(this.getProperty("/Tasks/" + nParentIndex + "/MILESTONE_COUNT"), 10);
			this.setProperty("/Tasks/" + nParentIndex + "/MILESTONE_COUNT", nCount + 1);
			return iHandle;
		},

		deleteMilestone: function(nParentIndex, nIndex) {
			var oNodeArray = this.getProperty("/Tasks/" + nParentIndex + "/Milestones");
			if (!oNodeArray) {
				return;
			}
			oNodeArray.splice(nIndex, 1);
			this.checkUpdate(true);
			var nCount = parseInt(this.getProperty("/Tasks/" + nParentIndex + "/MILESTONE_COUNT"), 10);
			this.setProperty("/Tasks/" + nParentIndex + "/MILESTONE_COUNT", nCount - 1);
		},

		sortMilestones: function(aMilestones) {
			return sortObjectArray(aMilestones, "SortDate");
		},

		addMilestoneAttachment: function(oNewAttachment, nParentIndex, nIndex) {
			oNewAttachment.ROLE_TYPE_CODE = "ATTACHMENT";
			var sPath = "/Tasks/" + nParentIndex + "/Milestones/" + nIndex + "/Attachment";
			var aAttachment = this.getProperty(sPath);
			if (!aAttachment) {
				aAttachment = [];
				this.setProperty(sPath, aAttachment);
			}
			aAttachment.unshift(oNewAttachment);
			this.checkUpdate(true);
		},

		removeMilestoneAttachment: function(iId, nParentIndex, nIndex) {
			var sPath = "/Tasks/" + nParentIndex + "/Milestones/" + nIndex + "/Attachment";
			var aAttachment = jQuery.grep(this.getProperty(sPath), function(
				oAttachment) {
				return oAttachment.ID === iId;
			});
			var oDelAttachment = aAttachment && aAttachment[0];
			if (oDelAttachment) {
				this.removeChild(oDelAttachment);
			}
		},

		initMilestoneYears: function() {
			var aMilestoneStartYears = this.getProperty("/MILESTONE_START_YEARS");
			if (!aMilestoneStartYears) {
				aMilestoneStartYears = [];
				this.setProperty("/MILESTONE_START_YEARS", aMilestoneStartYears);
			} else {
				aMilestoneStartYears.length = 0;
			}
			var year = new Date().getUTCFullYear();
			var nStartYear = this.getProperty("/VALID_FROM").getUTCFullYear() - 1;
			var currentYear = nStartYear;
			for (; currentYear <= year + 10; currentYear++) {
				aMilestoneStartYears.push({
					yearkey: currentYear.toString()
				});
			}
		},

		newCampaignIntegration: function(oSysIntegration) {
			var oCampaignIntegration = {
				"APINAME": oSysIntegration.APINAME,
				"STATUS": oSysIntegration.STATUS,
				"SYSTEM_NAME": oSysIntegration.SYSTEM_NAME,
				"SYSTEM_PACKAGE_NAME": oSysIntegration.SYSTEM_PACKAGE_NAME,
				"TECHNICAL_NAME": oSysIntegration.TECHNICAL_NAME,
				"CREATE_METHOD": oSysIntegration.CREATE_METHOD,
				"CREATE_PATH": oSysIntegration.CREATE_PATH,
				"CREATE_REQ_JSON": oSysIntegration.CREATE_REQ_JSON,
				"CREATE_RES_JSON": oSysIntegration.CREATE_RES_JSON,
				"FETCH_METHOD": oSysIntegration.FETCH_METHOD,
				"FETCH_PATH": oSysIntegration.FETCH_PATH,
				"FETCH_REQ_JSON": oSysIntegration.FETCH_REQ_JSON,
				"FETCH_RES_JSON": oSysIntegration.FETCH_RES_JSON,
				"CREATE_LOCATION_ID":oSysIntegration.CREATE_LOCATION_ID,
				"FETCH_LOCATION_ID":oSysIntegration.FETCH_LOCATION_ID
			};
			var iHandle = this.getNextHandle();
			oCampaignIntegration.ID = iHandle;
			var oNodeArray = this.getProperty("/CampaignIntegration");
			if (!oNodeArray) {
				oNodeArray = [];
				this.setProperty("/CampaignIntegration", oNodeArray);
			}
			oNodeArray.push(oCampaignIntegration);
			//sort and get Object again
			this.checkUpdate(true);
			return iHandle;
		},

		deleteCampaignIntegration: function(nIndex) {
			var aIntegrationlist = this.getProperty("/CampaignIntegration");
			this.removeChild(aIntegrationlist[nIndex], "CampaignIntegration");
		},
		newFieldLayout: function(oContext) {
			var iHandle = this.getNextHandle();
			var oNodeArray = this.getProperty(oContext.sPath + "/AttributesLayout");
			if (!oNodeArray) {
				oNodeArray = [];
				this.setProperty(oContext.sPath + "/AttributesLayout", oNodeArray);
			}
			var oNewFieldLayout = {
				ID: this.getNextHandle(),
				API_ID: this.getProperty(oContext.sPath + "/ID"),
				DISPLAY_SEQUENCE: oNodeArray.length + 1,
				MAPPING_FIELD_CODE: ""
			};

			oNodeArray.push(oNewFieldLayout);
			this.checkUpdate(true);
			return iHandle;
		},
		delFieldLayout: function(oContext, nIndex) {
			var aLayoutlist = this.getProperty(oContext.sPath + "/AttributesLayout");
			this.removeChild(aLayoutlist[nIndex], "AttributesLayout");
			for (var i = 0; i < aLayoutlist.length; i++) {
				aLayoutlist[i].DISPLAY_SEQUENCE = i + 1;
			}
			this.setProperty(oContext.sPath + "/AttributesLayout", aLayoutlist);
		}
	});

	function _mergeLanguageTexts(oData, oCampaign) {
		var aExistingLanguageTexts = oData.LanguageTexts;
		var aCodes = sap.ui.ino.models.core.CodeModel.getCodes("sap.ino.xs.object.basis.Language.Root", function(oLanguage) {
			var aFound = jQuery.grep(aExistingLanguageTexts, function(oLanguageText) {
				return oLanguageText.LANG == oLanguage.ISO_CODE;
			});
			// only take currently unused language codes
			return aFound.length === 0;
		});

		var aInitialLanguageTexts = jQuery.map(aCodes, function(oLanguageCode) {
			return {
				LANG: oLanguageCode.ISO_CODE,
				ID: oCampaign.getNextHandle(),
				NAME: "",
				SHORT_NAME: "",
				DESCRIPTION: "",
				IDEA_DESCRIPTION_TEMPLATE: ""
			};
		});

		oData.LanguageTexts = oData.LanguageTexts.concat(aInitialLanguageTexts);

		return oData;
	}

	function sortObjectArray(aObject, skey) {
		aObject.sort(function(o1, o2) {
			if (!o1[skey]) {
				return 1;
			}
			if (!o2[skey]) {
				return -1;
			}
			if (o1[skey] < o2[skey]) {
				return -1;
			} else {
				return 1;
			}
		});

		return aObject;
	}

	function sortMilestoneArray(aTasks) {
		for (var i = 0; i < aTasks.length; i++) {
			if (!aTasks[i].Milestones) {
				aTasks[i].Milestones = [];
			}
			for (var j = 0; j < aTasks[i].Milestones.length; j++) {
				aTasks[i].Milestones[j].SortDate = new Date();
				aTasks[i].Milestones[j].SortDate.setTime(aTasks[i].Milestones[j].MILESTONE_DATE.getTime());
			}
		}
		for (var index = 0; index < aTasks.length; index++) {
			aTasks[index].Milestones = sortObjectArray(aTasks[index].Milestones, "SortDate");
		}
	}

	function getPreviousTask(oTask, aTasks) {
		for (var i = 0; i < aTasks.length; i++) {
			if (oTask.SEQUENCE_NO === aTasks[i].SEQUENCE_NO) {
				return aTasks[i - 1];
			}
		}
	}

	function getNextTask(oTask, aTasks) {
		for (var i = 0; i < aTasks.length; i++) {
			if (oTask.SEQUENCE_NO === aTasks[i].SEQUENCE_NO) {
				return aTasks[i + 1];
			}
		}
	}

	function normalizeTaskSequenceNo(aTasks) {
		if (aTasks) {
			for (var i = 0; i < aTasks.length; i++) {
				aTasks[i].SEQUENCE_NO = i + 1;
			}
		}
	}

	function addMilestoneYears(oData) {
		if (!oData.MILESTONE_START_YEARS) {
			oData.MILESTONE_START_YEARS = [];
		}
		var year = new Date().getUTCFullYear();
		var nStartYear = oData.VALID_FROM.getUTCFullYear() - 1;
		var currentYear = nStartYear;
		for (; currentYear <= year + 10; currentYear++) {
			oData.MILESTONE_START_YEARS.push({
				yearkey: currentYear.toString()
			});
		}
	}

	sap.ui.ino.models.object.Campaign.Status = Status;
})();