sap.ui.define([
    "sap/ino/vc/commons/BaseController",
    "sap/ino/commons/application/Configuration",
    "sap/ui/model/json/JSONModel",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ui/Device",
    "sap/ino/vc/commons/mixins/ClipboardMixin",
    "sap/ino/vc/commons/mixins/IdentityQuickviewMixin",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/m/SegmentedButtonItem"
], function(
	BaseController,
	Configuration,
	JSONModel,
	TopLevelPageFacet,
	Device,
	ClipboardMixin,
	IdentityQuickviewMixin,
	ObjectListFormatter,
	SegmentedButtonItem
) {
	"use strict";

	var oFormatter = {
		formatTitle: function(code, text) {
			return text;
		},
		formatMyRanking: function(iUserId) {
			var iCurrentUserId = Configuration.getCurrentUser().USER_ID;
			if (iUserId === iCurrentUserId) {
				return true;
			} else {
				return false;
			}
		},
		formatRankImage: function(iSequence) {
			var iSeq = parseInt(iSequence, 10);
			if (iSeq > 3) {
				return null;
			}
			var sPath = jQuery.sap.getModulePath("sap.ino.assets");
			if (iSeq === 1) {
				//"./ngui/sap/ino/assets/img/gold.png"		
				return sPath + "/img/leaderBoard/gold2x.png";
			} else if (iSeq === 2) {
				return sPath + "/img/leaderBoard/sliver2x.png";
			} else if (iSeq === 3) {
				return sPath + "/img/leaderBoard/bronze2x.png";
			}

		},
		formatVisbleNumber: function(iSequence) {
			if (parseInt(iSequence, 10) > 3) {
				return true;
			} else {
				return false;
			}
		},
		formatVisbleRankImage: function(iSequence) {
			if (parseInt(iSequence, 10) <= 3) {
				return true;
			} else {
				return false;
			}
		},
		formatTooltipRank: function(iSequence) {
			return this.getText("LEADER_BOARD_RANK", [iSequence]);
		}
	};

	jQuery.extend(oFormatter, ObjectListFormatter);

	return BaseController.extend("sap.ino.vc.gamification.LeaderBoard", jQuery.extend({}, TopLevelPageFacet, ClipboardMixin,
		IdentityQuickviewMixin, {
			routes: ["leaderboard"],

			formatter: oFormatter,

			view: {
				"showCommentDialogBtn": false
			},

			onInit: function() {
				BaseController.prototype.onInit.apply(this, arguments);
				this.oViewModel = this.getModel("view");
				this.oViewModel.setData(this.view, true);
			},

			onRouteMatched: function() {
				this.generateDimensionSegmentBtn();
			},
			generateDimensionSegmentBtn: function() {
				var that = this;
				var oSegBtn = this.byId('leaderBoardSegBtn');
				var sURL = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/dimension.xsjs/getAllActiveDimension";
				var oAjaxPromise = jQuery.ajax({
					url: sURL,
					headers: {
						"X-CSRF-Token": Configuration.getXSRFToken()
					},
					dataType: "json",
					type: "POST",
					contentType: "application/json; charset=UTF-8",
					async: true
				});
				oAjaxPromise.done(function(result) {
					var dimensionItems = result.RESULT.ALL_ACTIVE_DIMENSION;
					var oModel = new JSONModel();
					oModel.setData(dimensionItems);
					that.getView().setModel(oModel, "dimension");
					if (dimensionItems.length === 0) {
						return;
					}
					if (oSegBtn) {
						oSegBtn.removeAllItems();
						var oTemplate = new SegmentedButtonItem({
							text: "{dimension>NAME}",
							tooltip: "{dimension>NAME}",
							key: "{dimension>ID}",
							press: function(oEvent) {
								that.onPressItem(oEvent);
							}
						});
						oSegBtn.bindItems({
							path: "dimension>/",
							template: oTemplate
						});
					}
					var iWidth = dimensionItems.length * 10;
					oSegBtn.setWidth("80%");
					oSegBtn.fireSelect(oSegBtn.getItems()[0]);
					that.setViewProperty("/SELECTED_DIMENSION_ID", dimensionItems[0].ID);
					that.bindViewData();
				});
			},
			onPressItem: function(oEvent) {
				var oSource = oEvent.getSource();
				var oCurrentKey = oSource.getKey();
				var aItems = this.getModel("dimension").getData();
				for (var i = 0; i < aItems.length; i++) {
					if (oCurrentKey === aItems[i].ID.toString()) {
						this.setViewProperty("/SELECTED_DIMENSION_ID", aItems[i].ID);
						break;
					}
				}
				this.byId('leaderBoardSegBtn').setBusy(true);
				this.bindViewData();
			},
			bindViewData: function() {
				var that = this;
				var leaderBoardTemplate = this.getFragment("sap.ino.vc.gamification.fragments.leaderBoardItem");
				var oBody = {
					DIMENSION_ID: this.getViewProperty("/SELECTED_DIMENSION_ID")
				};
				var sURL = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/dimension.xsjs/getLeaderBoardByDimension";
				var oAjaxPromise = jQuery.ajax({
					url: sURL,
					headers: {
						"X-CSRF-Token": Configuration.getXSRFToken()
					},
					data: JSON.stringify(oBody),
					dataType: "json",
					type: "POST",
					contentType: "application/json; charset=UTF-8",
					async: true
				});
				oAjaxPromise.done(function(result) {
					var aLeaderBoardRanking = result.RESULT.LeaderBoardRanking;
					var oSelfRanking = result.RESULT.SelfRanking;
					var oModel = that.getView().getModel("dimension");
					var aLeaderBoardData = [],
						bSelfFound = false,
						sImageID = null,
						selfImageID = null;

					for (var i = 0; i < aLeaderBoardRanking.length; i++) {
						sImageID = null;
						if (JSON.stringify(aLeaderBoardRanking[i].BADGE) !== "{}" && aLeaderBoardRanking[i].BADGE.currentBadge.Attachment &&
							aLeaderBoardRanking[i].BADGE.currentBadge.Attachment.length > 0) {
							sImageID = aLeaderBoardRanking[i].BADGE.currentBadge.Attachment[0].ATTACHMENT_ID;
						}

						aLeaderBoardData.push({
							USER_ID: aLeaderBoardRanking[i].IDENTITY_ID,
							USER_NAME: aLeaderBoardRanking[i].NAME,
							IMAGE_ID: aLeaderBoardRanking[i].IDENTITY_IMAGE_ID,
							SEQUENCE: aLeaderBoardRanking[i].ranking,
							BADGE_IMAGE_ID: sImageID,
							BADGE_NAME: JSON.stringify(aLeaderBoardRanking[i].BADGE) !== "{}" ? aLeaderBoardRanking[i].BADGE.currentBadge.NAME : null
						});
						if (oSelfRanking && !bSelfFound) {
							bSelfFound = aLeaderBoardRanking[i].IDENTITY_ID === oSelfRanking.IDENTITY_ID ? true : false;
						}
					}
					if (oSelfRanking && !bSelfFound) {
						if (JSON.stringify(oSelfRanking.BADGE) !== "{}" && oSelfRanking.BADGE.currentBadge.Attachment && oSelfRanking.BADGE.currentBadge
							.Attachment.length > 0) {
							selfImageID = oSelfRanking.BADGE.currentBadge.Attachment[0].ATTACHMENT_ID;
						}

						aLeaderBoardData.push({
							USER_ID: oSelfRanking.IDENTITY_ID,
							USER_NAME: oSelfRanking.NAME,
							IMAGE_ID: oSelfRanking.IDENTITY_IMAGE_ID,
							SEQUENCE: oSelfRanking.ranking,
							BADGE_IMAGE_ID: selfImageID,
							BADGE_NAME: JSON.stringify(oSelfRanking.BADGE) !== "{}" ? oSelfRanking.BADGE.currentBadge.NAME : null
						});
					}
					oModel.setProperty("/LeaderBoardRanking", aLeaderBoardData);
					var oTemplate = {
						path: "dimension>/LeaderBoardRanking",
						template: leaderBoardTemplate
					};
					var oList = that.byId("leaderBoardList");
					oList.bindItems(oTemplate);
				});
				that.byId('leaderBoardSegBtn').setBusy(false);
			}
		}));
});