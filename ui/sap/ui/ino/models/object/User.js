/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.object.User");
(function() {
	"use strict";
	jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
	jQuery.sap.require("sap.ui.ino.models.core.ReadSource");
	jQuery.sap.require("sap.ui.ino.application.Configuration");
	var Configuration = sap.ui.ino.application.Configuration;
	var StaticRoles = {
		CommunityUser: "COMMUNITY_USER",
		InnovationOfficeUser: "INNOVATION_OFFICE_USER",
		InnovationManager: "INNOVATION_MANAGER",
		SystemManager: "INNOVATION_SYSTEM_MANAGER"
	};
	var CatagoryType = {
		campaign: "CAMPAIGN",
		idea: "IDEA",
		blog: "BLOG",
		campaigncomment: "CAMP_COMMENT",
		ideacomment: "IDEA_COMMENT",
		reward: "REWARD",
		evaluation: "EVAL",
		tag: "TAG",
		wall: "WALL"
	};
	var _fnCopyArrayOfObjects = function(aArray) {
		var aNew = [];

		if (aArray) {
			for (var ii = 0; ii < aArray.length; ii++) {
				aNew.push(jQuery.extend(true, {}, aArray[ii]));
			}
		}
		return aNew;
	};

	sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.User", {
		objectName: "sap.ino.xs.object.iam.User",
		readSource: sap.ui.ino.models.core.ReadSource.getDefaultODataSource("Identity"),
		invalidation: {
			entitySets: ["Identity", "SearchIdentity"]
		},
		determinations: {
			onCreate: function(oDefaultData, objectInstance) {
				return {
					"ID": -1,
					"NAME": "",
					"SOURCE_TYPE_CODE": "UPLOAD",
					"VALIDATION_TO": new Date("9999-12-31T00:00:00.000Z")
				};
			},
			onRead: function(oData, oUser) {

				var oDeferred = new jQuery.Deferred();

				sap.ui.getCore().getModel().read("/IdentityStaticRole(" + oData.ID + ")/Results", null, null, false, function(oRoles) {
					var aResults = oRoles ? oRoles.results : [];
					var aRoles = [];

					jQuery.each(aResults, function(iIdx, oValue) {
						aRoles.push({
							ID: aResults[iIdx].ID,
							ROLE_CODE: aResults[iIdx].ROLE_CODE,
							TECHNICAL_ROLE_CODE: aResults[iIdx].TECHNICAL_ROLE_CODE
						});
					});
					/*Construct DPP data*/
					oData.DISPLAY_DISCLOSE_DATA = false;
					if (Configuration.getCurrentUser().USER_ID === oData.ID) {
						oData.DISPLAY_DISCLOSE_DATA = true;
					} else {
						oData.DISPLAY_DISCLOSE_DATA = false;
					}
					if (!oData.VALIDATION_TO) {
						oData.VALIDATION_TO = new Date("9999-12-31T00:00:00.000Z");
					}
					oData.UserDisCloseDataDownload = [];
					oData.UserDiscloseData = constructData(oData.UserDiscloseData, oData.UserDisCloseDataDownload);
					oData.Roles = aRoles;
					oData.BeforeRoles = _fnCopyArrayOfObjects(aRoles);

					oDeferred.resolve(oData);
				});

				return oDeferred.promise();
			}
		},
		actions: {
			saveAndRoleAssignment: {
				execute: function(vKey, oUser) {

					var aRoles = oUser.getProperty("/Roles");
					var aBeforeRoles = oUser.getProperty("/BeforeRoles");
					oUser.setProperty("/Roles", undefined);
					oUser.setProperty("/BeforeRoles", undefined);

					var oDeferred = new jQuery.Deferred();
					var oModifyRequest = oUser.modify();
					oModifyRequest.fail(oDeferred.reject);
					oModifyRequest.done(function(oResponseData) {
						var oRoles = {
							STATIC_ROLE_ASSIGNMENT: []
						};
						if (aRoles) {
							for (var ii = 0; ii < aRoles.length; ++ii) {
								oRoles.STATIC_ROLE_ASSIGNMENT.push({
									ROLE_CODE: aRoles[ii].ROLE_CODE
								});
							}
						}
						var oAssignRequest = oUser.assignStaticRoles(oRoles);

						oAssignRequest.always(function() {
							oUser.setProperty("/Roles", aRoles);
							oUser.setProperty("/BeforeRoles", _fnCopyArrayOfObjects(aRoles));
						});
						oAssignRequest.fail(oDeferred.reject);
						oAssignRequest.done(function() {
							oDeferred.resolve(oResponseData);
						});
					});
					return oDeferred.promise();
				}
			}
		}
	});

	function constructData(aDiscloseData, arrAllData) {
		var oTextModel = sap.ui.getCore().getModel("i18n").getResourceBundle();
		var arrCampaigns = [],
			arrCampaignComments = [],
			arrBlogs = [],
			arrIdeas = [],
			arrRewards = [],
			arrEvaluations = [],
			arrIdeaComments = [],
			arrTags = [],
			arrWalls = [];
		var campaigns = 0,
			campaignComments = 0,
			blogs = 0,
			ideas = 0,
			rewards = 0,
			evaluations = 0,
			ideaComments = 0,
			tags = 0,
			walls = 0;
		var oModuleObject = {
			name: "",
			record: null,
			id: null,
			corrObjectId: null,
			corrObjectName: null,
			children: []
		};
		var oTemplate = {
			name: "",
			record: null,
			type: null
		};
		var arrDiscloseData = aDiscloseData;
		for (var i = 0; i < arrDiscloseData.length; i++) {
			if (arrDiscloseData[i].OBJECT_TYPE_CODE === "CAMPAIGN" && arrDiscloseData[i].ROLE_CODE === "CAMPAIGN_MANAGER") {
				campaigns++;
				oModuleObject = {
					name: arrDiscloseData[i].NAME ? arrDiscloseData[i].NAME : arrDiscloseData[i].OBJECT_ID,
					id: arrDiscloseData[i].OBJECT_ID,
					record: arrDiscloseData[i].OBJECT_COUNT,
					corrObjectId: arrDiscloseData[i].CORR_OBJECT_ID,
					corrObjectName: arrDiscloseData[i].CORR_OBJECT_NAME,
					children: [],
					type: CatagoryType.campaign
				};
				arrCampaigns.push(oModuleObject);
				oTemplate = {
					name: arrDiscloseData[i].NAME,
					id: arrDiscloseData[i].OBJECT_ID,
					record: arrDiscloseData[i].OBJECT_COUNT,
					type: oTextModel.getText("BO_IDENT_DISCLOSE_DATA_ROW_CAMPAIGN")
				};
				arrAllData.push(oTemplate);
			}
			if (arrDiscloseData[i].OBJECT_TYPE_CODE === "CAMPAIGN_COMMENT" && arrDiscloseData[i].ROLE_CODE === "COMMENT_OWNER") {
				campaignComments++;
				oModuleObject = {
					name: arrDiscloseData[i].OBJECT_ID,
					id: arrDiscloseData[i].OBJECT_ID,
					record: arrDiscloseData[i].OBJECT_COUNT,
					corrObjectId: arrDiscloseData[i].CORR_OBJECT_ID,
					corrObjectName: arrDiscloseData[i].CORR_OBJECT_NAME,
					children: [],
					type: CatagoryType.campaigncomment
				};
				arrCampaignComments.push(oModuleObject);
				oTemplate = {
					name: arrDiscloseData[i].NAME,
					id: arrDiscloseData[i].OBJECT_ID,
					record: arrDiscloseData[i].OBJECT_COUNT,
					type: oTextModel.getText("BO_IDENT_DISCLOSE_DATA_ROW_CAMP_COMMENT")
				};
				arrAllData.push(oTemplate);
			}
			if (arrDiscloseData[i].OBJECT_TYPE_CODE === "BLOG" && arrDiscloseData[i].ROLE_CODE === "BLOG_AUTHOR") {
				blogs++;
				oModuleObject = {
					name: arrDiscloseData[i].NAME ? arrDiscloseData[i].NAME : arrDiscloseData[i].OBJECT_ID,
					id: arrDiscloseData[i].OBJECT_ID,
					record: arrDiscloseData[i].OBJECT_COUNT,
					corrObjectId: arrDiscloseData[i].CORR_OBJECT_ID,
					corrObjectName: arrDiscloseData[i].CORR_OBJECT_NAME,
					children: [],
					type: CatagoryType.blog
				};
				arrBlogs.push(oModuleObject);
				oTemplate = {
					name: arrDiscloseData[i].NAME,
					id: arrDiscloseData[i].OBJECT_ID,
					record: arrDiscloseData[i].OBJECT_COUNT,
					type: oTextModel.getText("BO_IDENT_DISCLOSE_DATA_ROW_BLOG")
				};
				arrAllData.push(oTemplate);
			}

			if (arrDiscloseData[i].OBJECT_TYPE_CODE === "IDEA" && arrDiscloseData[i].ROLE_CODE === "IDEA_SUBMITTER") {
				ideas++;
				oModuleObject = {
					name: arrDiscloseData[i].NAME ? arrDiscloseData[i].NAME : arrDiscloseData[i].OBJECT_ID,
					id: arrDiscloseData[i].OBJECT_ID,
					record: arrDiscloseData[i].OBJECT_COUNT,
					corrObjectId: arrDiscloseData[i].CORR_OBJECT_ID,
					corrObjectName: arrDiscloseData[i].CORR_OBJECT_NAME,
					children: [],
					type: CatagoryType.idea
				};
				arrIdeas.push(oModuleObject);
				oTemplate = {
					name: arrDiscloseData[i].NAME,
					id: arrDiscloseData[i].OBJECT_ID,
					record: arrDiscloseData[i].OBJECT_COUNT,
					type: oTextModel.getText("BO_IDENT_DISCLOSE_DATA_ROW_IDEA")
				};
				arrAllData.push(oTemplate);
			}
			if (arrDiscloseData[i].OBJECT_TYPE_CODE === "REWARD" && arrDiscloseData[i].ROLE_CODE === "REWARD_OWNER") {
				rewards++;
				oModuleObject = {
					name: arrDiscloseData[i].OBJECT_ID,
					id: arrDiscloseData[i].OBJECT_ID,
					record: arrDiscloseData[i].OBJECT_COUNT,
					corrObjectId: arrDiscloseData[i].CORR_OBJECT_ID,
					corrObjectName: arrDiscloseData[i].CORR_OBJECT_NAME,
					children: [],
					type: CatagoryType.reward
				};
				arrRewards.push(oModuleObject);
				oTemplate = {
					name: arrDiscloseData[i].NAME,
					id: arrDiscloseData[i].OBJECT_ID,
					record: arrDiscloseData[i].OBJECT_COUNT,
					type: oTextModel.getText("BO_IDENT_DISCLOSE_DATA_ROW_REWARD")
				};
				arrAllData.push(oTemplate);
			}
			if (arrDiscloseData[i].OBJECT_TYPE_CODE === "EVALUATION" && arrDiscloseData[i].ROLE_CODE === "EVALUATION_OWNER") {
				evaluations++;
				oModuleObject = {
					name: arrDiscloseData[i].OBJECT_ID,
					id: arrDiscloseData[i].OBJECT_ID,
					record: arrDiscloseData[i].OBJECT_COUNT,
					corrObjectId: arrDiscloseData[i].CORR_OBJECT_ID,
					corrObjectName: arrDiscloseData[i].CORR_OBJECT_NAME,
					children: [],
					type: CatagoryType.evaluation
				};
				arrEvaluations.push(oModuleObject);
				oTemplate = {
					name: arrDiscloseData[i].NAME,
					id: arrDiscloseData[i].OBJECT_ID,
					record: arrDiscloseData[i].OBJECT_COUNT,
					type: oTextModel.getText("BO_IDENT_DISCLOSE_DATA_ROW_EVALUATION")
				};
				arrAllData.push(oTemplate);
			}
			if (arrDiscloseData[i].OBJECT_TYPE_CODE === "IDEA_COMMENT" && arrDiscloseData[i].ROLE_CODE === "IDEA_COMMENT_OWNER") {
				ideaComments++;
				oModuleObject = {
					name: arrDiscloseData[i].OBJECT_ID,
					id: arrDiscloseData[i].OBJECT_ID,
					record: arrDiscloseData[i].OBJECT_COUNT,
					corrObjectId: arrDiscloseData[i].CORR_OBJECT_ID,
					corrObjectName: arrDiscloseData[i].CORR_OBJECT_NAME,
					children: [],
					type: CatagoryType.ideacomment
				};
				arrIdeaComments.push(oModuleObject);
				oTemplate = {
					name: arrDiscloseData[i].NAME,
					id: arrDiscloseData[i].OBJECT_ID,
					record: arrDiscloseData[i].OBJECT_COUNT,
					type: oTextModel.getText("BO_IDENT_DISCLOSE_DATA_ROW_IDEA_COMMENT")
				};
				arrAllData.push(oTemplate);
			}
			if (arrDiscloseData[i].OBJECT_TYPE_CODE === "TAG" && arrDiscloseData[i].ROLE_CODE === "TAG_OWNER") {
				tags++;
				oModuleObject = {
					name: arrDiscloseData[i].NAME ? arrDiscloseData[i].NAME : arrDiscloseData[i].OBJECT_ID,
					id: arrDiscloseData[i].OBJECT_ID,
					record: arrDiscloseData[i].OBJECT_COUNT,
					corrObjectId: arrDiscloseData[i].CORR_OBJECT_ID,
					corrObjectName: arrDiscloseData[i].CORR_OBJECT_NAME,
					children: [],
					type: CatagoryType.tag
				};
				arrTags.push(oModuleObject);
				oTemplate = {
					name: arrDiscloseData[i].NAME,
					id: arrDiscloseData[i].OBJECT_ID,
					record: arrDiscloseData[i].OBJECT_COUNT,
					type: oTextModel.getText("BO_IDENT_DISCLOSE_DATA_ROW_TAG")
				};
				arrAllData.push(oTemplate);
			}
			if (arrDiscloseData[i].OBJECT_TYPE_CODE === "WALL" && arrDiscloseData[i].ROLE_CODE === "WALL_OWNER") {
				walls++;
				oModuleObject = {
					name: arrDiscloseData[i].NAME ? arrDiscloseData[i].NAME : arrDiscloseData[i].OBJECT_ID,
					id: arrDiscloseData[i].OBJECT_ID,
					record: arrDiscloseData[i].OBJECT_COUNT,
					corrObjectId: arrDiscloseData[i].CORR_OBJECT_ID,
					corrObjectName: arrDiscloseData[i].CORR_OBJECT_NAME,
					children: [],
					type: CatagoryType.wall
				};
				arrWalls.push(oModuleObject);
				oTemplate = {
					name: arrDiscloseData[i].NAME,
					id: arrDiscloseData[i].OBJECT_ID,
					record: arrDiscloseData[i].OBJECT_COUNT,
					type: oTextModel.getText("BO_IDENT_DISCLOSE_DATA_ROW_WALL")
				};
				arrAllData.push(oTemplate);
			}

		}
		var arrLevelbottom = [
			{
				name: oTextModel.getText("BO_IDENT_DISCLOSE_DATA_ROW_CAMPAIGNS"),
				type: CatagoryType.campaign,
				record: campaigns,
				id: null,
				corrObjectId: null,
				corrObjectName: null,
				children: arrCampaigns
			},
			{
				name: oTextModel.getText("BO_IDENT_DISCLOSE_DATA_ROW_BLOGS"),
				type: CatagoryType.campaign,
				record: blogs,
				id: null,
				corrObjectId: null,
				corrObjectName: null,
				children: arrBlogs
			},
			{
				name: oTextModel.getText("BO_IDENT_DISCLOSE_DATA_ROW_COMMENT"),
				type: CatagoryType.campaign,
				record: campaignComments,
				id: null,
				corrObjectId: null,
				corrObjectName: "CAMPAIGN_COMMENT",
				children: arrCampaignComments
			},
			{
				name: oTextModel.getText("BO_IDENT_DISCLOSE_DATA_ROW_IDEAS"),
				type: CatagoryType.idea,
				record: ideas,
				id: null,
				corrObjectId: null,
				corrObjectName: null,
				children: arrIdeas
			},
			{
				name: oTextModel.getText("BO_IDENT_DISCLOSE_DATA_ROW_REWARD"),
				type: CatagoryType.idea,
				record: rewards,
				id: null,
				corrObjectId: null,
				corrObjectName: null,
				children: arrRewards
			},
			{
				name: oTextModel.getText("BO_IDENT_DISCLOSE_DATA_ROW_EVALUATION"),
				type: CatagoryType.idea,
				record: evaluations,
				id: null,
				corrObjectId: null,
				corrObjectName: null,
				children: arrEvaluations
			},
			{
				name: oTextModel.getText("BO_IDENT_DISCLOSE_DATA_ROW_COMMENT"),
				type: CatagoryType.idea,
				record: ideaComments,
				id: null,
				corrObjectId: null,
				corrObjectName: "IDEA_COMMENT",
				children: arrIdeaComments
			},
			{
				name: oTextModel.getText("BO_IDENT_DISCLOSE_DATA_ROW_TAGS"),
				type: CatagoryType.tag,
				record: tags,
				id: null,
				corrObjectId: null,
				corrObjectName: null,
				children: arrTags
			},
			{
				name: oTextModel.getText("BO_IDENT_DISCLOSE_DATA_ROW_WALLS"),
				type: CatagoryType.wall,
				record: walls,
				id: null,
				corrObjectId: null,
				corrObjectName: null,
				children: arrWalls
			}
                        ];

		var arrCampaignsLevelMedium = [],
			arrIdeasLevelMedium = [],
			arrTagsLevelMedium = [],
			arrWallsLevelMedium = [];
		arrLevelbottom.forEach(function(oLevel) {
			if (oLevel.type === CatagoryType.campaign) {
				arrCampaignsLevelMedium.push(oLevel);
			} else if (oLevel.type === CatagoryType.idea) {
				arrIdeasLevelMedium.push(oLevel);
			} else if (oLevel.type === CatagoryType.tag) {
				arrTagsLevelMedium.push(oLevel);
			} else if (oLevel.type === CatagoryType.wall) {
				arrWallsLevelMedium.push(oLevel);
			}
		});
		var arrNode = [];
		oModuleObject = {
			name: oTextModel.getText("BO_IDENT_DISCLOSE_DATA_ROW_CAMPAIGN"),
			record: null,
			id: null,
			corrObjectId: null,
			corrObjectName: null,
			children: arrCampaignsLevelMedium
		};
		arrNode.push(oModuleObject);
		oModuleObject = {
			name: oTextModel.getText("BO_IDENT_DISCLOSE_DATA_ROW_IDEA"),
			record: null,
			id: null,
			corrObjectId: null,
			corrObjectName: null,
			children: arrIdeasLevelMedium
		};
		arrNode.push(oModuleObject);
		oModuleObject = {
			name: oTextModel.getText("BO_IDENT_DISCLOSE_DATA_ROW_TAG"),
			record: null,
			id: null,
			corrObjectId: null,
			corrObjectName: null,
			children: arrTagsLevelMedium
		};
		arrNode.push(oModuleObject);
		oModuleObject = {
			name: oTextModel.getText("BO_IDENT_DISCLOSE_DATA_ROW_WALL"),
			record: null,
			id: null,
			corrObjectId: null,
			corrObjectName: null,
			children: arrWallsLevelMedium
		};
		arrNode.push(oModuleObject);

		return arrNode;
	}
	sap.ui.ino.models.object.User.prototype.oModuleObject = function() {
		var bObjectChanges = sap.ui.ino.models.core.ApplicationObject.prototype.oModuleObject.apply(this);
		if (!bObjectChanges) {
			var aRoles = this.getProperty("/Roles");
			var aBeforeRoles = this.getProperty("/BeforeRoles");

			return !jQuery.sap.equal(aRoles, aBeforeRoles);
		}
		return true;
	};

	sap.ui.ino.models.object.User.prototype.revertChanges = function() {
		var aBeforeRoles = _fnCopyArrayOfObjects(this.getProperty("/BeforeRoles"));
		sap.ui.ino.models.core.ApplicationObject.prototype.revertChanges.apply(this);
		this.setProperty("/Roles", aBeforeRoles);
		this.setProperty("/BeforeRoles", _fnCopyArrayOfObjects(aBeforeRoles));
	};

	sap.ui.ino.models.object.User.StaticRoles = StaticRoles;
})();