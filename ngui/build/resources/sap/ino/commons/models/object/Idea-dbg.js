/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObject",
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/ino/commons/models/core/ReadSource",
    "sap/ino/commons/models/core/Extensibility",
    "sap/ino/commons/application/Configuration",
    "sap/ui/core/message/Message",
    "sap/ui/core/MessageType",
    "sap/ui/core/format/DateFormat",
    "sap/ino/controls/IdeaAttachmentRoleType",
    "sap/ino/controls/IdeaStatusType",
    "sap/ino/controls/IdeaStatusActionType",
    "sap/ino/commons/models/core/CodeModel"
], function(ApplicationObject, PropertyModel, ReadSource, Extensibility, Configuration,
	Message, MessageType, DateFormat, IdeaAttachmentRoleType, IdeaStatusType, IdeaStatusActionType, CodeModel) {
	"use strict";

	var Idea = ApplicationObject.extend("sap.ino.commons.models.object.Idea", {
		objectName: "sap.ino.xs.object.idea.Idea",
		readSource: ReadSource.getDefaultODataSource("IdeaFull", {
			excludeNodes: ["Relations"],
			includeNodes: ["Evaluations"]
		}),
		invalidation: {
			entitySets: ["IdeaFull", "IdeaMedium", "IdeaMediumCommunity", "IdeaSmall", "IdeaMediumSearch", "IdeaMediumBackofficeSearch",
				"CampaignEntityCount", "MyIdeaMediumCommunity", "MyIdeaFollow"]
		},
		actionImpacts: {
			"create": [{
				"entitySetName": "EntityCount",
				"entitySetKey": "1",
				"impactedAttributes": ["AUTHORED_IDEA_COUNT"]
			}],
			"modifyAndSubmit": [{
				"objectName": "sap.ino.commons.models.object.Campaign",
				"objectKey": "CAMPAIGN_ID",
				"impactedAttributes": ["UNASSIGNED_IDEAS_COUNT"]
                        }],
			"assignCoach": [{
				"objectName": "sap.ino.commons.models.object.Campaign",
				"objectKey": "CAMPAIGN_ID",
				"impactedAttributes": ["UNASSIGNED_IDEAS_COUNT"]
                        }],
			"modifyAndAutoAssignCoach": [{
				"objectName": "sap.ino.commons.models.object.Campaign",
				"objectKey": "CAMPAIGN_ID",
				"impactedAttributes": ["UNASSIGNED_IDEAS_COUNT"]
                        }],      
			"autoAssignCoach": [{
				"objectName": "sap.ino.commons.models.object.Campaign",
				"objectKey": "CAMPAIGN_ID",
				"impactedAttributes": ["UNASSIGNED_IDEAS_COUNT"]
                        }],                    
			"unassignCoach": [{
				"objectName": "sap.ino.commons.models.object.Campaign",
				"objectKey": "CAMPAIGN_ID",
				"impactedAttributes": ["UNASSIGNED_IDEAS_COUNT"]
                        }],
			"del": [{
				"entitySetName": "EntityCount",
				"entitySetKey": "1",
				"impactedAttributes": ["AUTHORED_IDEA_COUNT"]
			}]
		},
		determinations: {
			onCreate: determineCreate,
			onRead: determineRead
		
		},
		actions: {
			executeStatusTransition: {
				initParameter: initStatusTransitionParameters
			},
			modifyAndSubmit: {
				enabledCheck: function(oIdea) {
					var sStatus = oIdea.getProperty("/STATUS_CODE");
					return sStatus === IdeaStatusType.Draft;
				},
				execute: function(vKey, oIdea, oParameter, oActionMetadata, oSettings) {
					var oDeferred = new jQuery.Deferred();
					var oModifyRequest = oIdea.modify(oSettings);
					oModifyRequest.fail(oDeferred.reject);
					oModifyRequest.done(function() {
						var oSubmitRequest = oIdea.submit(oParameter, oSettings);
						oSubmitRequest.fail(oDeferred.reject);
						oSubmitRequest.done(function() {
					        oParameter.VOTE_TYPE_TYPE_CODE = oIdea.getProperty("/VOTE_TYPE_TYPE_CODE");
					        oParameter.MAX_STAR_NO = oIdea.getProperty("/MAX_STAR_NO");
					        if(oIdea.getProperty("/VOTING_ACTIVE") && oIdea.getProperty("/AUTO_VOTE")){
					            var oAutoVoteRequest = oIdea.autoVote(oParameter, oSettings);
    							oAutoVoteRequest.fail(oDeferred.reject);
    							oAutoVoteRequest.done(oDeferred.resolve);
					        }
					        else{
                             oDeferred.resolve(); 
					        }
						});
					});
					return oDeferred.promise();
				}
			},
			del: {
				enabledCheck: function(oIdea, bEnabled) {
					if (bEnabled === undefined) {
						return false;
					}
				}
			},
			modifyAndAutoAssignCoach:{
				execute: function(vKey, oIdea, oParameter, oActionMetadata, oSettings) {
					var oDeferred = new jQuery.Deferred();
					var oModifyRequest = oIdea.modify(oSettings);
					oModifyRequest.fail(oDeferred.reject);
					if(oIdea.getData().COACH_ID === oParameter.DEFAULT_COACH){
						oModifyRequest.done(oDeferred.resolve);
					}else{
					oModifyRequest.done(function() {
						var oAutoAssignCoachRequest = oIdea.autoAssignCoach(oParameter, oSettings);
						oAutoAssignCoachRequest.fail(oDeferred.reject);
						oAutoAssignCoachRequest.done(oDeferred.resolve);
					});
					}
					return oDeferred.promise();
				}			    
			}
		},
		setProperty: setProperty,
		setData: setData,
		addWall: addWall,
		removeWall: removeWall,
		addInternalWall: addInternalWall,
		removeInternalWall: removeInternalWall,
		addContributor: addContributor,
		//addExpert: addExpert,
		//removeExpert: removeExpert,
		addTag: addTag,
		modifyLink: modifyLink,
		addLink: addLink,
		addAttachment: addAttachment,
		addInternalAttachment: addInternalAttachment,
		removeAttachment: removeAttachment,
		setTitleImage: setTitleImage,
		clearTitleImage: clearTitleImage,
		hasInitialDescription: hasInitialDescription,
		isSubmitted: isSubmitted,
		createWall: createWall,
		delVotesSimulate: delVotesSimulate
	});

	Idea.isPhaseChange = function(sStatusAction) {
		return sStatusAction === IdeaStatusActionType.nextPhase || sStatusAction === IdeaStatusActionType.prevPhase;
	};

	Idea.isFinalStatus = function(sStatusCode) {
		return sStatusCode === IdeaStatusType.Discontinued || sStatusCode === IdeaStatusType.Completed || sStatusCode === IdeaStatusType.Merged;
	};

	function setProperty(sPath, vValue, oContext, bAsyncUpdate) {
		/* jshint validthis: true */
		var bSuccess = false;
		bSuccess = ApplicationObject.prototype.setProperty.apply(this, arguments);

		// Normalize the path to be able to deal with bindings where the property of the root
		// model starts with "/"
		var sPropName = (sPath[0] === "/" ? sPath.substring(1) : sPath);
		if (sPropName === "CAMPAIGN_ID") {
			var oDataModel = this.getReadSourceModel();
			var oIdea = this;
			var iCampaignId = vValue;

			// this happens when invalid values are entered in the combobox
			if (iCampaignId === "" || iCampaignId === "0") {
				iCampaignId = 0;
				ApplicationObject.prototype.setProperty.apply(this, [sPath, iCampaignId, oContext, bAsyncUpdate]);
			}

			var fnSetCampaignDetails = function(oCampaign) {
				oIdea.setProperty("/CAMPAIGN_NAME", oCampaign.NAME);
				oIdea.setProperty("/CAMPAIGN_SHORT_NAME", oCampaign.SHORT_NAME);
				oIdea.setProperty("/CAMPAIGN_COLOR", oCampaign.COLOR_CODE);
				oIdea.setProperty("/STEPS", oCampaign.PHASE_COUNT);
				oIdea.setProperty("/CAMPAIGN_BACKGROUND_IMAGE_ID", oCampaign.CAMPAIGN_BACKGROUND_IMAGE_ID);
				oIdea.setProperty("/CAMPAIGN_SMALL_BACKGROUND_IMAGE_ID", oCampaign.CAMPAIGN_SMALL_BACKGROUND_IMAGE_ID);
				oIdea.setProperty("/CAMPAIGN_VOTE_TYPE_CODE", oCampaign.VOTE_TYPE_CODE);
				oIdea.setProperty("/RESP_NAME", oCampaign.RESP_NAME);
				oIdea.setProperty("/RESP_CODE",oCampaign.RESP_CODE);
				oIdea.setProperty("/RESP_DESCRIPTION", oCampaign.RESP_DESCRIPTION);
				oIdea.setProperty("/RESP_LIST_VISIBLE",false);
				oIdea.setProperty("/REWARD_ACTIVE",oCampaign.REWARD_ACTIVE);
				oIdea.setProperty("/AUTO_ASSIGN_RL_COACH",oCampaign.IS_AUTO_ASSIGN_RL_COACH);
				oIdea.setProperty("/OPEN_ANONYMOUS_FOR_IDEA",oCampaign.IS_OPEN_ANONYMOUS_FUNCTION);
				if  (oCampaign.RESP_CODE)
				{
				    oIdea.setProperty("/RESP_LIST_VISIBLE",true);
				}
				if (oIdea.hasInitialDescription(oCampaign.IDEA_DESCRIPTION_TEMPLATE)) {
					oIdea.setProperty("/IDEA_DESCRIPTION_TEMPLATE", oCampaign.IDEA_DESCRIPTION_TEMPLATE || "");
					oIdea.setProperty("/DESCRIPTION", oCampaign.IDEA_DESCRIPTION_TEMPLATE || "");
				}
			};
			if (iCampaignId === 0) {
				fnSetCampaignDetails({
					NAME: "",
					SHORT_NAME: "",
					COLOR_CODE: "",
					PHASE_COUNT: 4,
					IDEA_DESCRIPTION_TEMPLATE: ""
				});
			} else {
				oDataModel.read("/CampaignSmall(" + iCampaignId + ")", {
					success: function(oCampaign) {
						fnSetCampaignDetails(oCampaign);
					}
				});
			}
		}
		return bSuccess;
	}

	function setData(oData) {
		/* jshint validthis: true */
		ApplicationObject.prototype.setData.apply(this, arguments);
		if (oData.CAMPAIGN_ID > 0) {
			this.setProperty("/CAMPAIGN_ID", oData.CAMPAIGN_ID);
		}
	}

	function initWalls(oData) {
		oData.Walls = jQuery.extend(true, [], oData.Walls || []);
		oData.InternalWalls = jQuery.extend(true, [], oData.InternalWalls || []);
		var aWall = oData.Walls.concat(oData.InternalWalls);
		if (aWall && aWall.length > 0) {
			var aWallId = [];
			jQuery.each(aWall, function(index, oWall) {
				aWallId.push(oWall.WALL_ID);
			});
			// Executed synchronously as otherwise RichText-Editor will crash, if data is set asynchronously
			jQuery.sap.require("sap.ino.commons.models.object.Wall");
			var Wall = sap.ino.commons.models.object.Wall;
			Wall.readWalls(aWallId, false).done(function(aWallUpdate) {
				jQuery.each(aWall, function(index, oWall) {
					jQuery.each(aWallUpdate, function(index, oWallUpdate) {
						if (oWall.WALL_ID === oWallUpdate.ID) {
							oWall.NAME = oWallUpdate.NAME;
							oWall.BACKGROUND_IMAGE_URL = oWallUpdate.BACKGROUND_IMAGE_URL;
							oWall.BACKGROUND_IMAGE_ZOOM = oWallUpdate.BACKGROUND_IMAGE_ZOOM;
							oWall.BACKGROUND_IMAGE_REPEAT = oWallUpdate.BACKGROUND_IMAGE_REPEAT;
							oWall.BACKGROUND_COLOR = oWallUpdate.BACKGROUND_COLOR;
							oWall.BackgroundImage = oWallUpdate.BackgroundImage || [];
							oWall.CREATED_BY_NAME = oWallUpdate.CREATED_BY_NAME;
							oWall.Items = [];
							jQuery.each(oWallUpdate.Items || [], function(index, oItem) {
								if (oItem.WALL_ID === oWall.WALL_ID) {
									oWall.Items.push(oItem);
								}
							});
						}
					});
				});
			});
		}
		return oData;
	}
	
	function addContributionShare(oData){
	    var aContributionShare = oData.ContributionShare;
	    jQuery.each(oData.SubmitterContributorsCoach, function(iIndex, oPerson){
	        if(oPerson.ROLE_CODE === "IDEA_SUBMITTER" || oPerson.ROLE_CODE === "IDEA_CONTRIBUTOR" ){
	            var aContribution = aContributionShare.filter(function(oShare){
	                return oShare.AUTHOR_ID === oPerson.IDENTITY_ID;
	            });
	            
	            if(aContribution.length > 0){
	                oPerson.iContributionShare = aContribution[0].PERCENTAGE;
	            }
	        }
	    });
	}

	function determineCreate(oData, oIdea) {
		var aTag = jQuery.map(oData.Tags || [], function(sTag) {
			return {
				ID: oIdea.getNextHandle(),
				NAME: sTag
			};
		});
		var oCurrentUser = Configuration.getCurrentUser();

		var oDataObject = {
			"NAME": oData.NAME || "",
			"DESCRIPTION": oData.DESCRIPTION || "",
			"STATUS_CODE": IdeaStatusType.Draft,
			"CREATED_AT": new Date(),
			"CREATED_BY_NAME": oCurrentUser.NAME,
			"STEP": -1,
			"STEPS": 4,
			"CAMPAIGN_NAME": null,
			"CAMPAIGN_ID": oData.CAMPAIGN_ID || 0,
			"Tags": aTag,
			"Walls": oData.Walls && oData.Walls.length > 0 ? oData.Walls : []
		};
		oDataObject = initWalls(oDataObject);
		return Extensibility.initExtensionNode(oDataObject, "Extension", oIdea);
	}

	function _buildValueList(oData) {
		//put into separate function
		jQuery.each(oData.FieldsValue, function(iIndex, oFieldValue) {
			if (oFieldValue.VALUE_OPTION_LIST_CODE) {
				var sCodeTable = "sap.ino.xs.object.basis.ValueOptionList.Root_" + oFieldValue.VALUE_OPTION_LIST_CODE;
				oFieldValue.valueOptionList = CodeModel.getCodes(sCodeTable, function(oCode) {
							return oCode.ACTIVE === 1;
						});
			}
		});
	}
	

	function determineRead(oData, oIdea) {
		oData = initWalls(oData);
		oData.SubmitterContributorsCoach = (oData.Submitter || []).concat(oData.Contributors || []).concat(oData.Coach || []);
		oData.SubmitterContributors = (oData.Submitter || []).concat(oData.Contributors || []);
		oData.SubmitterCoach = oData.Coach;
		addContributionShare(oData);//add contribution share percentage to Contributors 
		//add valuelist option
		_buildValueList(oData);
		if(oIdea.getProperty("/EDITABLE") !== undefined){
		    oData.EDITABLE = oIdea.getProperty("/EDITABLE");
		}
		if(oData.FieldsValue && oData.FieldsValue.length > 0){
		 oData.FieldsValue.sort(function(o1, o2) {
    			if (o1.SEQUENCE_NO < o2.SEQUENCE_NO) {
    				return -1;
    			} else {
    				return 1;
    			}
    		});	
	      }
		if(oData.AdminFieldsValue && oData.AdminFieldsValue.length > 0){
		 oData.AdminFieldsValue.sort(function(o1, o2) {
    			if (o1.SEQUENCE_NO < o2.SEQUENCE_NO) {
    				return -1;
    			} else {
    				return 1;
    			}
    		});	
	      }		
		return Extensibility.initExtensionNode(oData, "Extension", oIdea);
	}
    
	function initStatusTransitionParameters(oParameter, oPropertyModel, sStatusAction) {
		var oDateFormat = DateFormat.getDateInstance({
			pattern: "yyyy-MM-dd"
		});
		var sTodaysDate = oDateFormat.format(new Date());

		var sUserName = "";
		var iUserId = null;

		var oUser = Configuration.getCurrentUser();
		if (oUser) {
			sUserName = oUser.NAME;
			iUserId = oUser.USER_ID;
		}

		oParameter.STATUS_ACTION_CODE = sStatusAction; // does not need to be set

		var aStatusTransition = oPropertyModel.getProperty("/actions/executeStatusTransition/customProperties/statusTransitions");

		var oStatusTransition = jQuery.grep(aStatusTransition, function(oTransition) {
			return oTransition.STATUS_ACTION_CODE === sStatusAction;
		})[0];
		oParameter.REWARD_ACTIVE = oStatusTransition && oStatusTransition.REWARD_ACTIVE;
		oParameter.NEXT_STATUS_CODE = oStatusTransition && oStatusTransition.NEXT_STATUS_CODE;
		oParameter.NEXT_PHASE_CODE = oStatusTransition && oStatusTransition.NEXT_PHASE_CODE;
		oParameter.IS_PHASE_CHANGE = oStatusTransition && Idea.isPhaseChange(sStatusAction);
		oParameter.IS_DECISION_RELEVANT = !!(oStatusTransition && oStatusTransition.DECISION_RELEVANT);
		oParameter.INCLUDE_RESPONSE = oStatusTransition && oStatusTransition.INCLUDE_RESPONSE;
		oParameter.DECISION_REASON_LIST_CODE = oStatusTransition && oStatusTransition.DECISION_REASON_LIST_CODE;
		oParameter.DECISION_REASON_LIST_VISIBLE = oStatusTransition && oStatusTransition.DECISION_REASON_LIST_VISIBLE;
		oParameter.TEXT_MODULE_CODE = oStatusTransition && oStatusTransition.TEXT_MODULE_CODE;
		oParameter.DECIDER_ID = iUserId;
		if (oParameter.IS_DECISION_RELEVANT) {
			oParameter.DECISION_DATE = sTodaysDate;
			oParameter.REASON = "";
			oParameter.SEND_RESPONSE = oParameter.INCLUDE_RESPONSE;
			oParameter.RESPONSE = "";
			oParameter.DECIDER_NAME = sUserName;
			oParameter.NOTIFY_AUTHOR = true;
			oParameter.REASON_CODE = "";
			oParameter.LINK_LABEL = "";
			oParameter.LINK_URL = "";
			if (oParameter.DECISION_REASON_LIST_CODE) {
				var sCodeTable = "sap.ino.xs.object.basis.ValueOptionList.ValueOptions";
				oParameter.reasonList = CodeModel.getCodes(sCodeTable, function(oCode) {
					return oCode.LIST_CODE === oParameter.DECISION_REASON_LIST_CODE && oCode.ACTIVE === 1;
				});
			}
		}

	}

	function addWall(oNewWall) {
		/* jshint validthis: true */
		var aWall = this.getProperty("/Walls");
		var aMatches = jQuery.grep(aWall, function(oWall) {
			return oWall.WALL_ID === oNewWall.WALL_ID;
		});
		if (aMatches.length === 0) {
			delete oNewWall.ID;
			this.addChild(oNewWall, "Walls");
			oNewWall.WALL_ASSIGN_ID = oNewWall.ID;
		}
	}

	function removeWall(iWallId) {
		/* jshint validthis: true */
		var that = this;
		var aWall = jQuery.grep(that.getProperty("/Walls") || [], function(oWall) {
			return oWall.WALL_ID === iWallId;
		});
		jQuery.each(aWall, function(index, oWall) {
			that.removeChild(oWall);
		});
	}

	function addInternalWall(oNewWall) {
		/* jshint validthis: true */
		var aWall = this.getProperty("/InternalWalls");
		var aMatches = jQuery.grep(aWall, function(oWall) {
			return oWall.WALL_ID === oNewWall.WALL_ID;
		});
		if (aMatches.length === 0) {
			delete oNewWall.ID;
			this.addChild(oNewWall, "InternalWalls");
			oNewWall.WALL_ASSIGN_ID = oNewWall.ID;
		}
	}

	function removeInternalWall(iWallId) {
		/* jshint validthis: true */
		var that = this;
		var aWall = jQuery.grep(that.getProperty("/InternalWalls") || [], function(oWall) {
			return oWall.WALL_ID === iWallId;
		});
		jQuery.each(aWall, function(index, oWall) {
			that.removeChild(oWall);
		});
	}

	function addContributor(oNewContributor) {
		/* jshint validthis: true */
		var oMessage;

		if (!oNewContributor.NAME || jQuery.trim(oNewContributor.NAME).length === 0) {
			oMessage = new Message({
				key: "MSG_IDEA_INVALID_EMPTY_CONTRIBUTOR",
				type: MessageType.Error,
				group: "CONTRIBUTOR"
			});
			return oMessage;
		}

		if (!oNewContributor.IDENTITY_ID) {
			oMessage = new Message({
				key: "MSG_IDEA_INVALID_CONTRIBUTOR",
				type: MessageType.Error,
				group: "CONTRIBUTOR"
			});
			return oMessage;
		}

		var aContributors = this.getProperty("/Contributors");
		var aMatches = jQuery.grep(aContributors, function(oContributor) {
			return oContributor.IDENTITY_ID === oNewContributor.IDENTITY_ID;
		});
		if (aMatches.length === 0) {
			this.addChild(oNewContributor, "Contributors");
		}
	}

	function addExpert(oNewExpert) {
		/* jshint validthis: true */
		var oMessage;

		if (!oNewExpert.NAME || jQuery.trim(oNewExpert.NAME).length === 0) {
			oMessage = new Message({
				key: "MSG_IDEA_INVALID_EMPTY_EXPERT",
				type: MessageType.Error,
				group: "EXPERT"
			});
			return oMessage;
		}

		if (!oNewExpert.IDENTITY_ID) {
			oMessage = new Message({
				key: "MSG_IDEA_INVALID_EXPERT",
				type: MessageType.Error,
				group: "EXPERT"
			});
			return oMessage;
		}

		var aExperts = this.getProperty("/Experts");
		var aMatches = jQuery.grep(aExperts, function(oExpert) {
			return oExpert.IDENTITY_ID === oNewExpert.IDENTITY_ID;
		});
		if (aMatches.length === 0) {
			this.addChild(oNewExpert, "Experts");
		}
	}

	function removeExpert(iExpertId) {
		/* jshint validthis: true */
		var aExperts = this.getProperty("/Experts");
		var aMatches = jQuery.grep(aExperts, function(oExpert) {
			return oExpert.IDENTITY_ID === iExpertId;
		});
		var oRemoveExpert = aMatches[0];
		if (oRemoveExpert) {
			this.removeChild(oRemoveExpert, "Experts");
		}
	}

	function addTag(oNewTag) {
		/* jshint validthis: true */
		var oMessage;
		var aTags = this.getProperty("/Tags");

		if (!oNewTag.NAME || jQuery.trim(oNewTag.NAME).length === 0) {
			oMessage = new Message({
				key: "MSG_INVALID_EMPTY_TAG",
				type: MessageType.Error,
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
			return oTag.NAME.toLowerCase() === oNewTag.NAME.toLowerCase();
		});

		if (aMatches.length === 0) {
			this.addChild(oNewTag, "Tags");
		} else {
			return new Message({
				key: "MSG_DUPLICATE_TAG",
				type: MessageType.Error
			});
		}
	}

	function modifyLink(iId, sURL, sLabel) {
		/* jshint validthis: true */
		return this.addLink(sURL, sLabel, iId);
	}

	function addLink(sURL, sLabel, iId) {
		/* jshint validthis: true */
		var oMessage;
		sURL = sURL.trim();

		if (!sURL || sURL === "") {
			oMessage = new Message({
				code: "IDEA_OBJECT_MSG_LINK_URL_NOT_ALLOWED",
				type: MessageType.Error
			});
			return oMessage;
		}

		if (sURL && sURL.indexOf("http://") !== 0 && sURL.indexOf("https://") !== 0 && sURL.indexOf("mailto:") !== 0) {
			sURL = "http://" + sURL;
		}

		if (!sURL || sURL === "" || !jQuery.sap.validateUrl(sURL)) {
			oMessage = new Message({
				code: "IDEA_OBJECT_MSG_LINK_URL_NOT_ALLOWED",
				type: MessageType.Error
			}); 
			return oMessage;
		}

		if (!sLabel || sLabel === "") {
			sLabel = null;
		}

		var oLink = {
			ID: iId,
			LABEL: sLabel,
			URL: sURL
		};

		if (iId !== undefined) {
			this.updateNode(oLink, "Links");
		} else {
			this.addChild(oLink, "Links");
		}
	}

	function addRelation(sObjectTypeCode, vKey, sSemantic) {
		/* jshint validthis: true */
		this.addChild({
			TARGET_OBJECT_TYPE_CODE: sObjectTypeCode,
			TARGET_OBJECT_ID: vKey,
			SEMANTIC: sSemantic
		}, "Relations");
	}

	function addAttachment(oNewAttachment) {
		/* jshint validthis: true */
		oNewAttachment.ROLE_TYPE_CODE = "ATTACHMENT";
		this.addChild(oNewAttachment, "Attachments");
	}

	function addInternalAttachment(oNewAttachment) {
		/* jshint validthis: true */
		oNewAttachment.ROLE_TYPE_CODE = "ATTACHMENT";
		this.addChild(oNewAttachment, "InternalAttachments");
	}

	function removeAttachment(iId) {
		/* jshint validthis: true */
		var aAttachment = jQuery.grep(this.getProperty("/Attachments") || [], function(oAttachment) {
			return oAttachment.ATTACHMENT_ID === iId;
		});
		var oAttachment = aAttachment && aAttachment[0];
		if (oAttachment) {
			if (oAttachment.ROLE_TYPE_CODE === "IDEA_TITLE_IMAGE") {
				this.setProperty("/TITLE_IMAGE_ASSIGN_ID", null);
				this.setProperty("/TITLE_IMAGE_ID", null);
			}
			this.removeChild(oAttachment);
		}
		var aInternalAttachment = jQuery.grep(this.getProperty("/InternalAttachments") || [], function(oInternalAttachment) {
			return oInternalAttachment.ID === iId;
		});
		var oInternalAttachment = aInternalAttachment && aInternalAttachment[0];
		if (oInternalAttachment) {
			this.removeChild(oInternalAttachment);
		}
	}

	function resetTitleImages(aAttachment) {
		jQuery.each(aAttachment, function(iIndex, oAttachment) {
			if (oAttachment.ROLE_TYPE_CODE === IdeaAttachmentRoleType.TitleImage) {
				oAttachment.ROLE_TYPE_CODE = IdeaAttachmentRoleType.Standard;
			}
		});
	}

	function removeOldTitleImages(aAttachment) {
		return jQuery.grep(aAttachment, function(oAttachment) {
			return oAttachment.ROLE_TYPE_CODE !== IdeaAttachmentRoleType.TitleImage;
		});
	}

	function setTitleImage(oInput) {
		/* jshint validthis: true */
		var aAllAttachment = this.getProperty("/Attachments");
		var aAttachment = jQuery.grep(aAllAttachment || [], function(oAttachment) {
			return oAttachment.ATTACHMENT_ID === oInput.ATTACHMENT_ID;
		});

		// Remove old title images
		aAllAttachment = removeOldTitleImages(aAllAttachment);

		var oTitleImage = aAttachment && aAttachment[0];
		if (!oTitleImage) {
			var aAllInternalAttachment = this.getProperty("/InternalAttachments");
			var aInternalAttachment = jQuery.grep(aAllInternalAttachment || [], function(oAttachment) {
				return oAttachment.ATTACHMENT_ID === oInput.ATTACHMENT_ID;
			});
			oTitleImage = aInternalAttachment && aInternalAttachment[0];
			if (oTitleImage) {
				oTitleImage = jQuery.extend({}, oTitleImage);
			} else {
				oTitleImage = {};
			}
			oTitleImage.ID = this.getNextHandle();
			aAllAttachment.push(oTitleImage);
		}

		oTitleImage.ATTACHMENT_ID = oInput.ATTACHMENT_ID;
		oTitleImage.FILE_NAME = oInput.FILE_NAME ? oInput.FILE_NAME : oTitleImage.FILE_NAME;
		oTitleImage.MEDIA_TYPE = oInput.MEDIA_TYPE ? oInput.MEDIA_TYPE : oTitleImage.MEDIA_TYPE;
		oTitleImage.ROLE_TYPE_CODE = IdeaAttachmentRoleType.TitleImage;

		this.setProperty("/TITLE_IMAGE_ASSIGN_ID", oTitleImage.ID);
		this.setProperty("/TITLE_IMAGE_ID", oTitleImage.ATTACHMENT_ID);
		this.setProperty("/TITLE_IMAGE_MEDIA_TYPE", oTitleImage.MEDIA_TYPE);
		this.setProperty("/Attachments", aAllAttachment);
	}

	function clearTitleImage() {
		/* jshint validthis: true */
		var aAllAttachment = this.getProperty("/Attachments");
		aAllAttachment = removeOldTitleImages(aAllAttachment);
		this.setProperty("/Attachments", aAllAttachment);
		this.setProperty("/TITLE_IMAGE_ASSIGN_ID", null);
		this.setProperty("/TITLE_IMAGE_ID", null);
		this.setProperty("/TITLE_IMAGE_MEDIA_TYPE", null);
	}

	function hasInitialDescription(sCampaignIdeaDescriptionTemplate) {
		/* jshint validthis: true */
		var sDescription = this.getProperty("/DESCRIPTION");
		var sIdeaDescriptionTemplate = this.getProperty("/IDEA_DESCRIPTION_TEMPLATE") || sCampaignIdeaDescriptionTemplate || "";
		var sIdeaDescriptionTemplateHTML = "<p>" + sIdeaDescriptionTemplate + "</p>";
		return !sDescription || sDescription === "" || sDescription === "<br>" || sDescription === "<div><br></div>" || sDescription ===
			sIdeaDescriptionTemplate || sDescription === sIdeaDescriptionTemplateHTML;
	}

	function isSubmitted() {
		/* jshint validthis: true */
		return (this.getProperty("/SUBMITTED_AT") !== null);
	}

	function _mapType(sType) {
		var AttachmentType = {
			DOCUMENT: "DOCUMENT",
			IMAGE: "IMAGE",
			VIDEO: "VIDEO",
			AUDIO: "AUDIO",
			TEXT: "TEXT",
			ERROR: "ERROR",
			DEFAULT: "DOCUMENT"
		};

		if (sType === AttachmentType.IMAGE || sType.indexOf("image/") === 0) {
			sType = AttachmentType.IMAGE;
		} else if (sType === AttachmentType.VIDEO || sType.indexOf("video/") === 0) {
			sType = AttachmentType.VIDEO;
		} else if (sType === AttachmentType.AUDIO || sType.indexOf("audio/") === 0) {
			sType = AttachmentType.AUDIO;
		} else if (sType === AttachmentType.TEXT || sType.indexOf("text/") === 0) {
			sType = AttachmentType.TEXT;
		} else if (sType === AttachmentType.ERROR) {
			sType = AttachmentType.ERROR;
		} else if (sType === AttachmentType.DOCUMENT) {
			sType = AttachmentType.DOCUMENT;
		} else {
			sType = AttachmentType.DEFAULT;
		}

		return sType;
	}

	function delVotesSimulate() {
		/* jshint validthis: true */
		//check if voting method differs after campaign changed
		var methodchange = this.getProperty("/VOTE_TYPE_CODE") !== this.getProperty("/CAMPAIGN_VOTE_TYPE_CODE");
		var hasvotes = this.getProperty("/VOTE_COUNT") > 0;
		return (methodchange && hasvotes);

	}

	function createWall(oComponent) {
		/* jshint validthis: true */
		var oIdea = this.getData();
		var oModel = this;

		var center = 4900;
		var size = 200;
		var zIndex = 1;
		var row = 0;
		var heightOffset = 0;
		var aWallItem = [];
		var aLinkID = [];

		function addItem(oItem, xOffset, yOffset, width, height) {
			oItem.POSITION_X = center + (xOffset || 0);
			oItem.POSITION_Y = center + (yOffset || 0) + (size * row) + heightOffset;
			oItem.WIDTH = width || size;
			oItem.HEIGHT = height || size;
			oItem.ZINDEX = zIndex;
			aWallItem.push(oItem);
			zIndex++;
			row++;
			if (height) {
				heightOffset += (height - (size / 2));
			}
		}

		function addItems(aItem, xOffset, yOffset, width, height, space) {
			if (aItem.length === 0) {
				return;
			}
			var itemWidth = ((width || size) + (space || 0));
			var totalWidth = aItem.length * itemWidth;
			jQuery.each(aItem, function(iIndex, oItem) {
				oItem.POSITION_X = center + (xOffset || 0) - (totalWidth / 2) + (iIndex + 0.5) * itemWidth;
				oItem.POSITION_Y = center + (yOffset || 0) + (size * row) + heightOffset;
				oItem.WIDTH = width || size;
				oItem.HEIGHT = height || size;
				oItem.ZINDEX = zIndex;
				aWallItem.push(oItem);
				zIndex++;
			});
			row++;
			if (height) {
				heightOffset += (height - (size / 2));
			}
		}

		// Link to Idea
		addItem({
			"WALL_ITEM_TYPE_CODE": "sap.ino.config.LINK",
			"CONTENT": {
				"TEXT": oIdea.NAME || "",
				"ICON": "IDEA",
				"URL": oComponent.getNavigationLink("idea-display", {
					id: this.getKey()
				})
			}
		}, 50);

		// Author
		addItem({
			"WALL_ITEM_TYPE_CODE": "sap.ino.config.PERSON",
			"CONTENT": {
				"NAME": oIdea.SUBMITTER_NAME || "",
				"PHONE": "",
				"EMAIL": oIdea.SUBMITTER_EMAIL || "",
				"ORIGIN_ID": oIdea.SUBMITTER_ID,
				"REQUEST_IMAGE": true
			}
		});

		// Co-Authors
		if (oIdea.Contributors && oIdea.Contributors.length > 0) {
			var aContributor = [];
			jQuery.each(oIdea.Contributors, function(iIndex, oContributor) {
				aContributor.push({
					"WALL_ITEM_TYPE_CODE": "sap.ino.config.PERSON",
					"CONTENT": {
						"NAME": oContributor.NAME || "",
						"PHONE": "",
						"EMAIL": oContributor.EMAIL || "",
						"ORIGIN_ID": oContributor.IDENTITY_ID,
						"REQUEST_IMAGE": true
					}
				});
			});
			addItems(aContributor);
		}

		// Campaign Name
		if (oIdea.CAMPAIGN_NAME) {
			addItem({
				"WALL_ITEM_TYPE_CODE": "sap.ino.config.HEADLINE",
				"CONTENT": {
					"TEXT": oIdea.CAMPAIGN_NAME || "",
					"STYLE": "BRAG",
					"SIZE": "H3"
				}
			}, -25, 50);
		}

		// Description
		if (oIdea.DESCRIPTION) {
			addItem({
				"WALL_ITEM_TYPE_CODE": "sap.ino.config.TEXT",
				"CONTENT": {
					"CAPTION": oIdea.NAME || "",
					"TEXT": oIdea.DESCRIPTION || ""
				}
			}, -275, 0, 800, 400);
		}

		// Tags
		if (oIdea.Tags && oIdea.Tags.length > 0) {
			var aTag = [];
			jQuery.each(oIdea.Tags, function(iIndex, oTag) {
				aTag.push({
					"WALL_ITEM_TYPE_CODE": "sap.ino.config.HEADLINE",
					"CONTENT": {
						"TEXT": oTag.NAME || "",
						"STYLE": "COOL",
						"SIZE": "H5"
					}
				});
			});
			addItems(aTag);
		}

		// Links
		if (oIdea.Links && oIdea.Links.length > 0) {
			var aLink = [];
			jQuery.each(oIdea.Links, function(iIndex, oLink) {
				aLinkID.push(oLink.ID);
				aLink.push({
					"WALL_ITEM_TYPE_CODE": "sap.ino.config.LINK",
					"CONTENT": {
						"TEXT": oLink.LABEL || oLink.URL || "",
						"ICON": "MISC",
						"URL": oLink.URL || ""
					}
				});
			});
			addItems(aLink, 50, -50);
		}

		// Attachments
		if (oIdea.Attachments && oIdea.Attachments.length > 0) {
			var aImage = [];
			var aAttachment = [];
			jQuery.each(oIdea.Attachments, function(iIndex, oAttachment) {
				if (oAttachment.MEDIA_TYPE.indexOf("image/") === 0) {
					aImage.push({
						"WALL_ITEM_TYPE_CODE": "sap.ino.config.IMAGE",
						"CONTENT": {
							"CAPTION": oAttachment.FILE_NAME || "",
							"SHOW_AS_ICON": false
						},
						"Image": [{
							"ATTACHMENT_ID": oAttachment.ATTACHMENT_ID
                        }]
					});
				} else {
					aAttachment.push({
						"WALL_ITEM_TYPE_CODE": "sap.ino.config.ATTACHMENT",
						"CONTENT": {
							"CAPTION": oAttachment.FILE_NAME || "",
							"TYPE": _mapType(oAttachment.MEDIA_TYPE),
							"FILE_NAME": oAttachment.FILE_NAME || ""
						},
						"Attachment": [{
							"ATTACHMENT_ID": oAttachment.ATTACHMENT_ID
                        }]
					});
				}
			});
			addItems(aImage, 0, 0, 0, 0, 50);
			addItems(aAttachment, 0, 50, 0, 0, 50);
		}
		jQuery.sap.require("sap.ino.commons.models.object.Wall");
		var Wall = sap.ino.commons.models.object.Wall;

		var oDeferred = new jQuery.Deferred();
		var that = this;
		var oRequest = Wall.create({
			ID: -1,
			NAME: oIdea.NAME,
			WALL_TYPE_CODE: "sap.ino.config.WALL",
			BACKGROUND_COLOR: oIdea.CAMPAIGN_COLOR || "FFFFFF",
			IDEA_ID: oIdea.ID,
			Items: aWallItem
		});
		oRequest.done(function(oResponse) {
			var iWallID = oResponse.GENERATED_IDS[-1];
			var bCreateLink = false;
			if (Configuration.getCurrentUser().USER_ID === oIdea.SUBMITTER_ID) {
				bCreateLink = true;
			}
			if (oIdea.Contributors && oIdea.Contributors.length > 0) {
				jQuery.each(oIdea.Contributors, function(iIndex, oContributor) {
					if (Configuration.getCurrentUser().USER_ID == oContributor.IDENTITY_ID) {
						bCreateLink = true;
					}
				});
			}
			if (bCreateLink) {
				var aLink = [];
				jQuery.each(aLinkID, function(index, iLinkID) {
					aLink.push({
						ID: iLinkID
					});
				});
				aLink.push({
					ID: -1,
					LABEL: oComponent.getModel("i18n").getResourceBundle().getText("IDEA_OBJECT_TIT_WALL", [oIdea.NAME]),
					URL: oComponent.getNavigationLink("wall", {
						id: iWallID
					})
				});
				that.setProperty("/Links", aLink);
				that.update();
			}

			oDeferred.resolve(iWallID);
		});
		
		oRequest.fail(function(oResponse){
		    oModel.getMessageParser().parse(oResponse);
		});

		return oDeferred.promise();
	}

	return Idea;
});