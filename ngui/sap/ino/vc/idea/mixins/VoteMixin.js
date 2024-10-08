sap.ui.define([
    "sap/ino/commons/models/object/Vote",
    "sap/ino/commons/models/object/IdeaFollow",
    "sap/m/MessageToast",
    "sap/ino/commons/models/core/CodeModel",
    "sap/ui/model/json/JSONModel"
], function(Vote, IdeaFollow, MessageToast, CodeModel, JSONModel) {
	"use strict";

	/**
	 * @class
	 * Mixin that provides an event for user voting
	 */
	var oVotedByGroupType = {
		COM: "Company",
		COST: "Cost Center",
		ORG: "Organization",
		OFF: "Office"
	};
	var oVoteType = {
		TYPE_STAR: "STAR",
		TYPE_LIKE: "LIKE",
		TYPE_LIKE_DISLIKE: "LIKE_DISLIKE"
	};
	var VoteMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	VoteMixin.onUserVote = function(oEvent) {
		var oDialog = this.getVoteMixinDialog();
		var ideaId = oEvent.getParameter('objectId');
		var sPropertyUrl = this.getPropertyUrl(ideaId);
		var sVoteCommentType = this.getModel('data').getProperty(sPropertyUrl + '/VOTE_COMMENT_TYPE');
		var sVoteReasonCode = this.getModel('data').getProperty(sPropertyUrl + '/VOTE_REASON_CODE');
		var bPublicVote = this.getModel('data').getProperty(sPropertyUrl + '/PUBLIC_VOTE');
		var aCodes;
		this.dialogParameters = oEvent.getParameters();
		this.dialogSource = oEvent.getSource();
		this.resetClientMessages();
		var oMessageManager = new sap.ui.getCore().getMessageManager();
		oMessageManager.removeAllMessages();
        var iVoteId = oEvent.getParameter('voteId');
        
        if(!iVoteId){
          this.oIdeaVoteModel = new JSONModel();  
        }
// 		if (!this.oIdeaVoteModel) {
// 			this.oIdeaVoteModel = new JSONModel();
// 		}

		if (!sVoteCommentType || sVoteCommentType === null || sVoteCommentType === '') {
			return this.onSubmit();
		}

		if (!this.dialogSource.getProperty('value')) {
			return this.onSubmit();
		}

		if (sVoteCommentType === 'LIST' && sVoteReasonCode) {
			var sCodeTable = "sap.ino.xs.object.basis.ValueOptionList.ValueOptions";
			aCodes = CodeModel.getCodes(sCodeTable, function(oCode) {
				return oCode.LIST_CODE === sVoteReasonCode && oCode.ACTIVE === 1;
			});
		}

		var oVote = {
			VOTE_COMMENT_TYPE: sVoteCommentType,
			VOTE_REASON_CODE: sVoteReasonCode,
			VOTE_COMMENT_LIST: aCodes,
			PUBLIC_VOTE: bPublicVote,
			VOTE_COMMENT: "",
			VOTE_REASON: aCodes && aCodes[0].CODE || ""
		};

		this.oVoteModel = new JSONModel();
		this.oVoteModel.setData(oVote);

		oDialog.setModel(this.oVoteModel, "vote");

		oDialog.open();
	};

	VoteMixin.getPropertyUrl = function(ideaId) {
		var propertyKey = ['IdeaMediumCommunity', 'MyIdeaMediumCommunity', 'IdeaMediumBackofficeSearch', 'IdeaFull'];
		return this.CheckProperty(propertyKey, ideaId);
	};

	VoteMixin.CheckProperty = function(aList, ideaId) {
		var aKeyList = aList,
			sProperty;
		if (!aKeyList || !ideaId) {
			return false;
		}
		for (var i = 0; i < aKeyList.length; i++) {
			sProperty = this.getEntityKey(aKeyList[i], ideaId);
			if (sProperty) {
				return '/' + sProperty;
			}
		}
	};

	VoteMixin.getEntityKey = function(sEntitySetName, vKey) {
		var oCalcViewRegex = new RegExp("^" + sEntitySetName + "\\(.*" + vKey + "\\)$");
		var oCalcViewRegex2 = new RegExp("^" + sEntitySetName + "\\(.*(')(" + vKey + ")\\1\\)$");
		var oCalcViewRegex3 = new RegExp("^" + sEntitySetName + "\\(.*=" + vKey + "\\)$");
		var oCalcViewRegex4 = new RegExp("^" + sEntitySetName + "\\(.*(=')(" + vKey + ")\\1\\)$");
		var oData = this.getModel('data').getProperty("/");
		var sEntityKey;
		var aEntityKey = [];
		jQuery.each(oData, function(sKey) {
			if (oCalcViewRegex.test(sKey) || oCalcViewRegex2.test(sKey)) {
				aEntityKey.push(sKey);
			}
		});
		if (aEntityKey.length > 1) {
			aEntityKey.forEach(function(sKey) {
				if (oCalcViewRegex3.test(sKey) || oCalcViewRegex4.test(sKey)) {
					sEntityKey = sKey;
				}
			});
		} else {
			sEntityKey = aEntityKey && aEntityKey[0];
		}
		return sEntityKey;
	};

	VoteMixin.onSubmit = function(oEvent) {
		var self = this;
		var oVote;
		var oVoteControl = this.dialogSource;
		var voteReason = this._oVoteMixinDialog.getModel('vote') ? this._oVoteMixinDialog.getModel('vote').getProperty('/VOTE_REASON') : '';
		var voteComment = this._oVoteMixinDialog.getModel('vote') ? this._oVoteMixinDialog.getModel('vote').getProperty('/VOTE_COMMENT') : '';
		var iIdeaId = this.dialogParameters.objectId;
		//var oIdeaVote = this.oIdeaVoteModel.getProperty("/" + iIdeaId);
		var iScore = this.dialogParameters.value;
		//var iVoteId = oIdeaVote ? oIdeaVote.ID : this.dialogParameters.voteId;
		var iVoteId = this.dialogParameters.voteId;
		var sRoute = this.routes && this.routes.length ? this.routes[0] : undefined;
		if (!this.hasAnyClientErrorMessages()) {
			oVote = Vote.vote(iIdeaId, iScore, iVoteId, voteReason, voteComment);

			if (oVoteControl.setEnabled) {
				oVoteControl.setEnabled(false);
			}
		}
		var sPropertyUrl = this.getPropertyUrl(this.dialogParameters.objectId);
		var sVotedByGroup = this.getModel('data').getProperty(sPropertyUrl + '/VOTED_BY_GROUP');
		//Begin---Auto Follow when user votes	   
		var iFollowId = this.getModel('data').getProperty(sPropertyUrl + '/FOLLOW');
		var iAutoFollow = this.getModel('data').getProperty(sPropertyUrl + '/AUTO_FOLLOW');
		var sVoteTypeCode = this.getModel('data').getProperty(sPropertyUrl + '/VOTE_TYPE_TYPE_CODE');
		var bFollowAble = true;
		//End--- Auto Follow when user votes	    
		var sVoteMode = oVote.mode;
		if (oVote) {
			if (sVoteMode === "DEL_VOTE") {
				oVote.vote.done(function() {
					var sListId = "voteView--voteList";
					var oVoteList = sap.ui.getCore().byId(sListId);
					if (oVoteList) {
						var oBindingInfo = oVoteList.getBindingInfo("items");
						oVoteList.bindItems(oBindingInfo);
					}
					if (!sVotedByGroup) {
						MessageToast.show(self.getText("VOTE_MSG_REMOVE_VOTE_SUCCESS"));
					} else {
						MessageToast.show(self.getText("VOTE_MSG_REMOVE_VOTE_BY_GROUP_SUCCESS", [oVotedByGroupType[sVotedByGroup]]));
						// refresh group vote list
						var oGroupList = sap.ui.getCore().byId("voteView--groupVoteList");
						if (oGroupList) {
							var oBindingInfoGroup = oGroupList.getBindingInfo("items");
							oGroupList.bindItems(oBindingInfoGroup);
						}
					}
					var oVoteResult = {
						ID: null,
						SCORE: 0
					};
					if (self.oIdeaVoteModel) {
						self.oIdeaVoteModel.setProperty("/" + iIdeaId, oVoteResult);
					}

					if (oVoteControl.setEnabled) {
						oVoteControl.setEnabled(true);
					}
					//When it's the global search, the idea object when vote, 
					//this vote count will affect on the label immediately
				// 	if (sRoute && sRoute.indexOf("search") > -1) {
				// 		self.globalSearchAllVoteCount(sVoteMode, oVoteResult);
				// 	}
    		  if(self.isGlobalSearch){
                 self.getSearchResult(self.getViewProperty("/SEARCH_QUERY"));
                }  				
				});
			} else if (sVoteMode === "MODIFY_VOTE") {
				oVote.vote.done(function(oEvent) {
					var sListId = "voteView--voteList";
					var oVoteList = sap.ui.getCore().byId(sListId);
					if (oVoteList) {
						var oBindingInfo = oVoteList.getBindingInfo("items");
						oVoteList.bindItems(oBindingInfo);
					}
					if (!sVotedByGroup) {
						MessageToast.show(self.getText("VOTE_MSG_VOTE_SUCCESS"));
					} else {
						MessageToast.show(self.getText("VOTE_MSG_VOTE_BY_GROUP_SUCCESS", [oVotedByGroupType[sVotedByGroup]]));
						// refresh group vote list
						var oGroupList = sap.ui.getCore().byId("voteView--groupVoteList");
						if (oGroupList) {
							var oBindingInfoGroup = oGroupList.getBindingInfo("items");
							oGroupList.bindItems(oBindingInfoGroup);
						}
					}

					var oVoteResult = {
						ID: oEvent.GENERATED_IDS[-1] || iVoteId,
						SCORE: iScore
					};
					if (self.oIdeaVoteModel) {
						self.oIdeaVoteModel.setProperty("/" + iIdeaId, oVoteResult);
					}
					if (oVoteControl.setEnabled) {
						oVoteControl.setEnabled(true);
					}
					//Auto Follow Function when Vote
					if (sVoteTypeCode === "STAR") {
						var iMaxStarNo = self.getModel('data').getProperty(sPropertyUrl + '/MAX_STAR_NO');
						bFollowAble = iScore && iMaxStarNo && iScore >= (iMaxStarNo - 1) ? true : false;
					} else if (sVoteTypeCode === "LIKE_DISLIKE") {
						bFollowAble = iScore > 0 ? true : false;
					}
					if (!iFollowId && iAutoFollow && bFollowAble) {
						self.onVotedFollow();
					}
					//When it's the global search, the idea object when vote, 
					//this vote count will affect on the label immediately
				// 	if (sRoute && sRoute.indexOf("search") > -1) {
				// 		self.globalSearchAllVoteCount(sVoteMode, oVoteResult);
				// 	}
				if(self.isGlobalSearch){
                 self.getSearchResult(self.getViewProperty("/SEARCH_QUERY"));
                }  	
				});
			}
			oVote.vote.fail(function(data) {
				if (oVoteControl.setEnabled) {
					oVoteControl.setEnabled(true);
				}
				MessageToast.show(data.MESSAGES.length === 1 ? data.MESSAGES[0].MESSAGE_TEXT : self.getText("VOTE_MSG_VOTING_NOT_POSSIBLE"));
			});

			this.getVoteMixinDialog().setModel("", "vote");
			return this.getVoteMixinDialog().close();
		}
	};
	VoteMixin.onVotedFollow = function() {
		var that = this;
		var iIdeaId = this.dialogParameters.objectId;
		var oFollow = IdeaFollow.follow(iIdeaId, "IDEA", 0);
		oFollow.done();
		// 		if (!this.oIdeaFollowModel) {
		// 			this.oIdeaFollowModel = new JSONModel();
		// 		}
		// 		oFollow.done(function(callback) {
		// 			if (that.oIdeaFollowModel) {
		// 				var oResult = {
		// 					ID: callback.GENERATED_IDS ? callback.GENERATED_IDS[-1] : undefined
		// 				};
		// 				that.oIdeaFollowModel.setProperty("/IDEA" + "(" + iIdeaId + ")", oResult);
		// 			}
		// 		});
	};
	VoteMixin.globalSearchAllVoteCount = function(voteMode, voteResult) {
		var oDataModel = this.getModel("data");
		var oEventSource = this.dialogParameters;
		var aSearchIdeas = oDataModel.oData.Ideas.data;
		var iCurrentIdea = oEventSource.objectId;
		var oIdeaOperating, iIndex;
		jQuery.each(aSearchIdeas, function(index, objectIdea) {
			if (objectIdea.ID === iCurrentIdea) {
				oIdeaOperating = objectIdea;
				iIndex = index;
				return false;
			}
		});
		if (oIdeaOperating) {
			//For different Vote types, to update the model directly which will show current user's action result   
			switch (oIdeaOperating.VOTE_TYPE_TYPE_CODE) {
				case oVoteType.TYPE_LIKE:
					if (voteMode === "MODIFY_VOTE") {
						oIdeaOperating.VOTE_COUNT += 1;
					} else {
						oIdeaOperating.VOTE_COUNT -= 1;
					}
					oIdeaOperating.USER_SCORE = oEventSource.value;
					oIdeaOperating.SCORE = oIdeaOperating.VOTE_COUNT;
					oIdeaOperating.VOTE_ID = voteResult.ID;
					break;
				case oVoteType.TYPE_LIKE_DISLIKE:
					if (voteMode === "MODIFY_VOTE") {
						oIdeaOperating.NEG_VOTES = oEventSource.value === -1 ? oIdeaOperating.NEG_VOTES + 1 : oIdeaOperating.NEG_VOTES;
						oIdeaOperating.POS_VOTES = oEventSource.value === 1 ? oIdeaOperating.POS_VOTES + 1 : oIdeaOperating.POS_VOTES;
						oIdeaOperating.POS_VOTES = oEventSource.value === -1 && oEventSource.oldValue === 1 ? oIdeaOperating.POS_VOTES - 1 : oIdeaOperating
							.POS_VOTES;
						oIdeaOperating.NEG_VOTES = oEventSource.value === 1 && oEventSource.oldValue === -1 ? oIdeaOperating.NEG_VOTES - 1 : oIdeaOperating
							.NEG_VOTES;
					} else {
						oIdeaOperating.POS_VOTES = oEventSource.oldValue === 1 ? oIdeaOperating.POS_VOTES - 1 : oIdeaOperating.POS_VOTES;
						oIdeaOperating.NEG_VOTES = oEventSource.oldValue === -1 ? oIdeaOperating.NEG_VOTES - 1 : oIdeaOperating.NEG_VOTES;
					}
					oIdeaOperating.USER_SCORE = oEventSource.value;
					oIdeaOperating.VOTE_ID = voteResult.ID;
					break;
				case oVoteType.TYPE_STAR:
				    var fScore = oIdeaOperating.SCORE * oIdeaOperating.VOTE_COUNT;
				    var foldUserScore = oIdeaOperating.USER_SCORE;
					if (voteMode === "MODIFY_VOTE") {
						oIdeaOperating.VOTE_COUNT = oIdeaOperating.USER_SCORE ? oIdeaOperating.VOTE_COUNT : oIdeaOperating.VOTE_COUNT + 1;
					} else {
						oIdeaOperating.VOTE_COUNT = oIdeaOperating.VOTE_COUNT - 1;
					}
					oIdeaOperating.USER_SCORE = oEventSource.value;
					oIdeaOperating.SCORE = oIdeaOperating.VOTE_COUNT ? ( fScore + oIdeaOperating.USER_SCORE - foldUserScore) / oIdeaOperating.VOTE_COUNT : 0;
					oIdeaOperating.VOTE_ID = voteResult.ID;
					break;
				default:
					break;
			}
			oDataModel.setProperty("/Ideas/data/" + iIndex, oIdeaOperating);
		}
	};
	VoteMixin.onCloseDialog = function(oEvent) {
		this.dialogSource.setValue(this.dialogParameters.oldValue);
		this.getVoteMixinDialog().setModel("", "vote");
		return this.getVoteMixinDialog().close();
	};

	VoteMixin.getVoteMixinDialog = function() {
		if (!this._oVoteMixinDialog) {
			this._oVoteMixinDialog = this.createFragment('sap.ino.vc.idea.fragments.VoteMixin');
			this.getView().addDependent(this._oVoteMixinDialog);
		}
		return this._oVoteMixinDialog;
	};

	VoteMixin.transitionTitle = function(voteText) {
		var text, voteType;
		var parameters = this.dialogParameters;
		if (voteText) {
			text = CodeModel.getText("sap.ino.xs.object.basis.ValueOptionList.Root", voteText);
		} else {
			text = this.getText('IDEA_VOTE_DEFAULT_TITLE');
		}

		switch (parameters.type) {
			case 'LIKE':
				voteType = 'IDEA_VOTE_LIKE';
				break;
			case 'LIKE_DISLIKE':
				voteType = parameters.value === 1 ? 'IDEA_VOTE_LIKE' : 'IDEA_VOTE_DISLIKE';
				break;
			case 'STAR':
				voteType = 'IDEA_VOTE_STAR';
				break;
			default:
				voteType = 'IDEA_VOTE_LIKE';
				break;
		}

		return this.getText(voteType, [text]);
	};

	VoteMixin.onIdeaCommentPress = function(oEvent) {
		var iIdeaId;

		if (oEvent.getParameter("ideaId")) {
			iIdeaId = oEvent.getParameter("ideaId");
		} else {
			try {
				if (oEvent.getSource().getProperty("objectId")) {
					iIdeaId = oEvent.getSource().getProperty("objectId");
				}
			} catch (e) {
				iIdeaId = oEvent.getSource().getBindingContext("data").getProperty("ID");
			}
		}
		if (iIdeaId) {
			this.navigateTo("idea-display", {
				id: iIdeaId,
				query: {
					section: "sectionComments"
				}
			});
		}
	};

	return VoteMixin;
});