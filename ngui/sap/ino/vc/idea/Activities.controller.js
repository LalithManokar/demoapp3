sap.ui.getCore().loadLibrary("sap.ino.wall");

sap.ui.define([
    "sap/ino/vc/commons/BaseObjectController",
    "sap/ino/commons/formatters/ObjectListFormatter",
    "sap/ino/vc/wall/util/WallFactory",
    "sap/ino/wall/WallPreview",
    "sap/ino/commons/application/Configuration",
    "sap/ui/model/json/JSONModel",
    "sap/ino/controls/IFrame",
    "sap/ui/core/CustomData",
    "sap/m/Label",
    "sap/m/Link",
    "sap/ino/controls/Image",
    "sap/m/Text",
    "sap/ui/core/mvc/XMLView",
    "sap/ui/core/mvc/ViewType",
    "sap/m/HBox",
    "sap/ui/core/HTML",
    "sap/ino/controls/IdentityActionCard",
    "sap/ino/commons/models/core/ClipboardModel",
    "sap/ino/vc/campaign/mixins/RegistrationMixin",
    "sap/ino/commons/models/object/User",
    "sap/ino/vc/idea/mixins/VoteMixin",
    "sap/ino/vc/commons/mixins/FollowMixin",
    "sap/ino/vc/idea/mixins/VolunteerMixin",
    "sap/ino/commons/models/core/CodeModel"
    ], function(BaseController, ObjectListFormatter, WallFactory, WallPreview, Configuration, JSONModel, IFrame, CustomData,
	Label, Link, Image, Text, XMLView, ViewType, HBox, HTML, IdentityActionCard, ClipboardModel, RegistrationMixin, User, VoteMixin,
	FollowMixin, VolunteerMixin, CodeModel) {

	"use strict";

	return BaseController.extend("sap.ino.vc.idea.Activities", jQuery.extend({}, RegistrationMixin, VoteMixin, FollowMixin, VolunteerMixin, {

		/** @member the formatter */
		formatter: ObjectListFormatter,

		// different change events affect different entities and are displayed differently
		/** @constant {array} change events leading to idea display - corresponds to following messages (listed for usage check analysis):
        ACTIVITIES_MSG_CREATED_sap.ino.config.COPIED_SOURCE ACTIVITIES_MSG_CREATED_sap.ino.config.COPIED_TARGET ACTIVITIES_MSG_CREATED_sap.ino.config.MERGED_SOURCE
        ACTIVITIES_MSG_CREATED_sap.ino.config.MERGED_TARGET ACTIVITIES_MSG_CREATED_sap.ino.config.DUPLICATE_SOURCE ACTIVITIES_MSG_DELETED_sap.ino.config.DUPLICATE_SOURCE
        ACTIVITIES_MSG_CREATED_sap.ino.config.DUPLICATE_TARGET ACTIVITIES_MSG_DELETED_sap.ino.config.DUPLICATE_TARGET*/
		DISPLAY_EVENTS_IDEA: ["CREATED_sap.ino.config.COPIED_SOURCE", "CREATED_sap.ino.config.COPIED_TARGET",
            "CREATED_sap.ino.config.DUPLICATE_SOURCE", "CREATED_sap.ino.config.DUPLICATE_TARGET",
            "CREATED_sap.ino.config.MERGED_SOURCE", "CREATED_sap.ino.config.MERGED_TARGET",
            "DELETED_sap.ino.config.DUPLICATE_SOURCE", "DELETED_sap.ino.config.DUPLICATE_TARGET"],
		/** @constant {array} change events leading to campaign display.
        ACTIVITIES_MSG_IDEA_CAMPAIGN_REASSIGN ACTIVITIES_MSG_STATUS_ACTION_SUBMIT ACTIVITIES_MSG_CAMPAIGN_PROCESS_CHANGE
        ACTIVITIES_MSG_CAMPAIGN_PHASE_CODE_REPLACEMENT ACTIVITIES_MSG_CAMPAIGN_STATUS_MODEL_CODE_REPLACEMENT
        ACTIVITIES_MSG_CAMPAIGN_VOTE_TYPE_REPLACEMENT
        */
		DISPLAY_EVENTS_CAMPAIGN: ["IDEA_CAMPAIGN_REASSIGN", "STATUS_ACTION_SUBMIT"],
		/** @constant {array} change events leading to wall display 
        ACTIVITIES_MSG_WALL_ASSIGNED ACTIVITIES_MSG_WALL_UNASSIGNED*/
		DISPLAY_EVENTS_WALL: ["WALL_ASSIGNED", "WALL_UNASSIGNED"],
		/** @constant {array} change events leading to evaluation display 
        ACTIVITIES_MSG_STATUS_ACTION_sap.ino.config.EVAL_PUB_SUBMITTER ACTIVITIES_MSG_STATUS_ACTION_sap.ino.config.EVAL_PUB_COMMUNITY 
        ACTIVITIES_MSG_STATUS_ACTION_sap.ino.config.EVAL_SUBMIT ACTIVITIES_MSG_STATUS_ACTION_sap.ino.config.EVAL_UNPUBLISH
        ACTIVITIES_MSG_STATUS_ACTION_sap.ino.config.EVAL_REWORK
        */
		DISPLAY_EVENTS_EVAL: ["STATUS_ACTION_sap.ino.config.EVAL_PUB_COMMUNITY",
			"STATUS_ACTION_sap.ino.config.EVAL_PUB_SUBMITTER", "STATUS_ACTION_sap.ino.config.EVAL_SUBMIT"],
		/** @constant {array} change events leading to text difference display 
        ACTIVITIES_MSG_IDEA_NAME_CHANGED ACTIVITIES_MSG_IDEA_NAME_DESCRIPTION_CHANGED ACTIVITIES_MSG_IDEA_DESCRIPTION_CHANGED */
		DISPLAY_EVENTS_DIFFTEXT: ["IDEA_NAME_CHANGED", "IDEA_NAME_DESCRIPTION_CHANGED"],
		/** @constant {array} change events leading to attachment display 
        ACTIVITIES_MSG_ATTACHMENT_ASSIGNED ACTIVITIES_MSG_ATTACHMENT_UNASSIGNED ACTIVITIES_MSG_ATTACHMENT_CHANGED
        */
		DISPLAY_EVENTS_ATTACHMENT: ["ATTACHMENT_ASSIGNED", "ATTACHMENT_UNASSIGNED"],
		/** @constant {array} change events leading to title image display 
        ACTIVITIES_MSG_IDEA_TITLE_IMAGE_ASSIGNED ACTIVITIES_MSG_IDEA_TITLE_IMAGE_CHANGED ACTIVITIES_MSG_IDEA_TITLE_IMAGE_UNASSIGNED
        */
		DISPLAY_EVENTS_TITLEIMG: ["IDEA_TITLE_IMAGE_ASSIGNED", "IDEA_TITLE_IMAGE_CHANGED"],
		/* "IDEA_TITLE_IMAGE_UNASSIGNED" */
		/** @constant {array} change events leading to authorbox display 
        ACTIVITIES_MSG_IDEA_COACH_CREATED ACTIVITIES_MSG_IDEA_COACH_DELETED ACTIVITIES_MSG_IDEA_CONTRIBUTOR_CREATED ACTIVITIES_MSG_IDEA_CONTRIBUTOR_DELETED
        ACTIVITIES_MSG_IDEA_EXPERT_CREATED ACTIVITIES_MSG_IDEA_EXPERT_DELETED
        */
		DISPLAY_EVENTS_PERSON: ["IDEA_COACH_CREATED", "IDEA_COACH_DELETED", "IDEA_CONTRIBUTOR_CREATED", "IDEA_CONTRIBUTOR_DELETED",
			"IDEA_EXPERT_CREATED", "IDEA_EXPERT_DELETED"],
		/** @constant {array} change events leading to link display 
        ACTIVITIES_MSG_LINK_CREATED ACTIVITIES_MSG_LINK_DELETED
        */
		DISPLAY_EVENTS_LINK: ["LINK_CREATED"],
		/* "LINK_DELETED" */
		/** @constant {array} change events leading to evaluation request display 
		ACTIVITIES_MSG_EVAL_REQ_CREATED ACTIVITIES_MSG_EVAL_REQ_UPDATED ACTIVITIES_MSG_EVAL_REQ_DELETED ACTIVITIES_MSG_EVAL_REQ_EXPIRED ACTIVITIES_MSG_EVAL_REQ_ITEM_CLARIFICATION_SENT
		ACTIVITIES_MSG_EVAL_REQ_EXPERT_FORWARDED ACTIVITIES_MSG_EVAL_REQ_CHECKED*/
		DISPLAY_EVENTS_EVAL_REQ: ["EVAL_REQ_CREATED", "EVAL_REQ_UPDATED", "EVAL_REQ_DELETED", "EVAL_REQ_EXPIRED", "EVAL_REQ_ITEM_CLARIFICATION_SENT",
		"EVAL_REQ_EXPERT_FORWARDED","EVAL_REQ_CHECKED"],
		/* other messages 
        ACTIVITIES_MSG_STATUS_ACTION_sap.ino.config.COMPLETE ACTIVITIES_MSG_STATUS_ACTION_sap.ino.config.DISCONTINUE ACTIVITIES_MSG_STATUS_ACTION_sap.ino.config.START_NEXT_PHASE
        ACTIVITIES_MSG_STATUS_ACTION_sap.ino.config.RESTART_PHASE ACTIVITIES_MSG_STATUS_ACTION_sap.ino.config.RESTART_PREV_PHASE ACTIVITIES_MSG_STATUS_ACTION_sap.ino.config.WAIT
        ACTIVITIES_MSG_STATUS_ACTION_sap.ino.config.START_PROCESS ACTIVITIES_MSG_STATUS_ACTION_sap.ino.config.REWORK_EVALUATION ACTIVITIES_MSG_STATUS_ACTION_sap.ino.config.DECISION_PREPARE
        ACTIVITIES_MSG_STATUS_ACTION_sap.ino.config.CONTINUE_PROJECT
        ACTIVITIES_MSG_IDEA_CREATED ACTIVITIES_MSG_IDEA_DELETED ACTIVITIES_MSG_IDEA_SUBMITTED
        */

		onInit: function() {
			BaseController.prototype.onInit.apply(this, arguments);

			// concat all classes of Activity events that may be expanded
			this.DISPLAY_EVENTS_EXPANDABLE = [].concat(
				this.DISPLAY_EVENTS_IDEA, this.DISPLAY_EVENTS_CAMPAIGN, this.DISPLAY_EVENTS_WALL,
				this.DISPLAY_EVENTS_PERSON, this.DISPLAY_EVENTS_DIFFTEXT, this.DISPLAY_EVENTS_ATTACHMENT,
				this.DISPLAY_EVENTS_LINK, this.DISPLAY_EVENTS_EVAL, this.DISPLAY_EVENTS_TITLEIMG, this.DISPLAY_EVENTS_EVAL_REQ
			);

			// attach to list's onAfterRendering for induction of grouping titles
			var oActivitiesList = this.getView().byId("ideaActivitiesList");
			oActivitiesList.addEventDelegate({
				onAfterRendering: this._applyGroupingHeaders.bind(this, oActivitiesList)
			});
			this._sResizeActivityList = this.attachListControlResized(oActivitiesList);
		},
		
		onBeforeRendering: function() { 
            var oActivitiesList = this.getView().byId("ideaActivitiesList");
            var oBindingInfo = oActivitiesList.getBindingInfo("items");
            oActivitiesList.bindItems(oBindingInfo);
        },

		onAfterRendering: function() {
			var oActivitiesList = this.getView().byId("ideaActivitiesList");
			var oBinding = oActivitiesList.getBinding("items");
			var that = this;
			if (oBinding) {
				oBinding.attachDataReceived(function() {
					that._applyGroupingHeaders(oActivitiesList);
				}, this);
			}
		},

		onExit: function() {
			BaseController.prototype.onExit.apply(this, arguments);
			this.detachListControlResized(this._sResizeActivityList);
		},

		/**
		 * formatter making sense of activity event names and converting it to a meaningful text
		 *
		 * Formatting activity messages is not straight-forward, as the activity event structure is
		 * a bit convoluted due to historic reasons. PARAM_0 and PARAM_1 are freely defined depending
		 * on the activity event's semantics. For these, see v_idea_activities.
		 *
		 * @see "SAP_INO"."sap.ino.db.idea::v_idea_activities"
		 * @param   {Object}    oValue      the Activity Object to be formatted
		 * @return  {string}                the formatted message
		 */
		msgformatter: function(oValue) {
			var sResult, sMsgKey, sParam0, sParam1, sCampName;
			if (oValue && oValue.CHANGE_EVENT) {
				sMsgKey = "ACTIVITIES_MSG_" + oValue.CHANGE_EVENT;
				if (oValue.CHANGE_CODE === "AUTO_COACH_ASSIGNED") {
					sMsgKey += "_AUTO_COACH_ASSIGNED";
				}
				sParam0 = oValue.PARAM_0;
				sParam1 = oValue.PARAM_1;
				sCampName = oValue.CAMPAIGN_NAME;
				// special case: for all STATUS_ACTION change events, param 0 is a phase code and has to be transformed to a readable phase
				if (oValue.CHANGE_EVENT.indexOf("STATUS_ACTION_") === 0) {
					sParam0 = this.formatter.ideaPhase(sParam0);
				}
				// special case: campaign changes, contain both phase (param0) and status (param1)
				if (oValue.CHANGE_EVENT.indexOf("CAMPAIGN_") === 0) {
					// can be either status of phase - try to format both
					sParam0 = this.formatter.ideaPhase(sParam0);
					sParam1 = this.formatter.ideaStatus(sParam1);
				}
				// special case: sub responsibility code change, param 0 and param1 is a sub responsibility code
				if (oValue.CHANGE_EVENT.indexOf("IDEA_RESP_VALUE_CODE") === 0) {
					// can be either status of phase - try to format both
					sParam0 = CodeModel.getText('sap.ino.xs.object.subresponsibility.ResponsibilityStage.RespValues', sParam0);
					sParam1 = CodeModel.getText('sap.ino.xs.object.subresponsibility.ResponsibilityStage.RespValues', sParam1);
				}
				sResult = this.getText(sMsgKey, ["", sParam0, sParam1, sCampName]);
				if(oValue.CHANGE_EVENT.indexOf("IDEA_CAMPAIGN_REASSIGN") > -1){
				    var sStatusText = this.formatter.ideaStatus(oValue.STATUS_CODE);
				    var sStatusTextBundle = this.getText(sMsgKey + "_STATUS", [sStatusText]);
				    sResult = sResult + sStatusTextBundle;
				}
				
				if (sResult === sMsgKey) {
					// key was not found
					if (oValue.CHANGE_EVENT.indexOf("STATUS_ACTION_") === 0) {
						// in case of status action: generate generic text
						var sStatusAction = this.formatter.ideaStatusAction(oValue.PARAM_1);
						var sStatus = this.formatter.ideaStatus(oValue.STATUS_CODE);
						sResult = this.getText("ACTIVITIES_MSG_STATUS_ACTION_GENERIC", ["", sStatusAction, sStatus, sCampName]);
					} else {
						// unknown change event - generic message
						sResult = this.getText("ACTIVITIES_MSG_GENERIC_CHANGE_EVENT", [oValue.CHANGE_EVENT]);
					}
				}
			}
			return sResult;
		},

		/**
		 * formatter deciding whether an activity item is expandable (has more information to be displayed)
		 *
		 * @param   {object}    oChangeEvent    the activity event (aka change event)
		 * @return  {boolean}   whether the item is expandable
		 */
		isExpandable: function(oChangeEvent) {
			var sEventName = oChangeEvent.CHANGE_EVENT;
			if (this.DISPLAY_EVENTS_EXPANDABLE.indexOf(sEventName) !== -1) {
				// all defined activities
				return true;
			} else if ((sEventName.indexOf("STATUS_ACTION_") === 0) && (oChangeEvent.PARAM_0_ID) && (sEventName.indexOf("EVAL_REWORK") === -1 && sEventName.indexOf("EVAL_UNPUBLISH") === -1)) {
				// special case: phase change and a decision ID is set
				return true;
			}
			return false;
		},

		/**
		 * adds idea to panel
		 *
		 * @private
		 * @param   {object}    oSourceCtrl     the originating source control
		 * @param   {int}       iIdeaId         an idea ID
		 */
		_createPanelIdea: function(oSourceCtrl, iIdeaId) {
			var oSourceCtrl2 = oSourceCtrl;
			var oCtrl;
			if (iIdeaId) {
				oCtrl = this.getFragment("sap.ino.vc.idea.fragments.FlatListItem").clone();
				oCtrl.addStyleClass("sapMListBGSolid");
				// as events are badly named, we have to add custom data "source type" so that we can differentiate
				// clicks on idea and campaign in onItemPress
				oCtrl.data("source-type", "idea");
				// damn you, one-time bindings!
				oCtrl.bindElement({
					path: "data>/IdeaMedium(" + iIdeaId + ")/"
				});
			} else {
				// idea has been deleted
				oCtrl = new Label({
					text: this.getText("ACTIVITIES_MSG_IDEA_NON_EXISTENT")
				});
			}
			oSourceCtrl2.addContent(oCtrl);
		},

		/**
		 * adds identity list item in panel
		 *
		 * @private
		 * @param   {object}    oSourceCtrl     the originating source control
		 * @param   {int}       iIdentId         an identity ID
		 */
		_createPanelIdentity: function(oSourceCtrl, iIdentId, sUserName, iImgId, sOrg, sRole) {
			var oCtrl;
			if (iIdentId) {
				oCtrl = new IdentityActionCard({
					identityId: iIdentId,
					userImageUrl: iImgId ? this.formatter.userImage(iImgId) : null,
					userOrganization: sOrg,
					userName: sUserName,
					userRole: sRole ? this.formatter.multipleRoleCodes(sRole) : null,
					actionable: false,
					pinnable: this.getModel("clipboard").getProperty("/enabled"),
					isPinned: this.formatIsUserInClipboard(iIdentId),
					pinPressed: [this.onUserPinPressed, this],
					identityPress: [this.onOpenIdentityQuickView, this]
				});
			}
			oSourceCtrl.addContent(oCtrl);
		},

		/**
		 * adds campaign card in panel
		 *
		 * @private
		 * @param   {object}    oSourceCtrl     the originating source control
		 * @param   {int}       iCampId         a campaign ID
		 */
		_createPanelCampaign: function(oSourceCtrl, iCampId) {
			var oCtrl, sWidth, oHBox;
			if (iCampId) {
				sWidth = this.formatter.widthCampaignCard(this.getModel("device"));
				oCtrl = this.getFragment("sap.ino.vc.campaign.fragments.CardListItem").clone();
				// HBox wrapper to enforce correct width
				oHBox = new sap.m.HBox({
					width: sWidth
				}).addItem(oCtrl);
				// as events are badly named, we have to add custom data "source type" so that we can differentiate
				// clicks on idea and campaign in onItemPress
				// additionally, the event is thrown by inner control
				oCtrl.getContent()[0].data("source-type", "campaign");
				oCtrl.bindElement("data>/CampaignFull(" + iCampId + ")/");
			}
			oSourceCtrl.addContent(oHBox);
		},

		/**
		 * adds wall in panel
		 *
		 * @private
		 * @param   {object}    oSourceCtrl     the originating source control
		 * @param   {int}       iWallId         a wall ID
		 */
		_createPanelWall: function(oSourceCtrl, iWallId) {
			if (iWallId) {
				var sURL = Configuration.getBackendRootURL() + Configuration.getApplicationObject("sap.ino.xs.object.wall.Wall") + "/" + iWallId;
				var oModel = new JSONModel(sURL);
				oModel.attachRequestCompleted({
					controller: this,
					wallId: iWallId
				}, this._onWallLoaded, oSourceCtrl);
			}
		},

		/**
		 * adds text diff content in panel
		 *
		 * Note: this is experimental
		 *
		 * @private
		 * @param   {object}    oSourceCtrl     the originating source control
		 * @param   {string}    sOld            text before change
		 * @param   {string}    sNew            text after changing
		 */
		_createPanelTextDiff: function(oSourceCtrl, sOld, sNew) {
			// evil: as sap.ui.core.HTML does not allow "addStyleClass", we have to manually add it here in a wrapping div
			var sHTML = "<div class=\"ideaActivityDiff\">" + this.getText("ACTIVITIES_MSG_TITLE_DIFF", [sOld && sOld.trim() || "", sNew && sNew.trim() ||
				""]) + "</div>";
			var oCtrl = new HTML({
				content: sHTML,
				sanitizeContent: true
			});
			//oHTML.addStyleClass("ideaActivityDiff");
			oSourceCtrl.addContent(oCtrl);
		},

		/**
		 * adds attachment in panel
		 *
		 * @private
		 * @param   {object}    oSourceCtrl     the originating source control
		 * @param   {int}       iAttmntId       an attachment ID
		 */
		_createPanelAttachment: function(oSourceCtrl, iAttmntId) {
			var oCtrl;
			if (iAttmntId) {
				oCtrl = this.createView({
					viewName: "sap.ino.vc.attachment.Attachment",
					type: ViewType.XML
				});
				// disable editing
				oCtrl.data("editable", false);
				oCtrl.byId("Attachments").setNoDataText(this.getText("ACTIVITIES_MSG_ATTACHMENT_NON_EXISTENT"));
				oCtrl.bindElement("data>/Attachment(" + iAttmntId + ")/");
			}
			oSourceCtrl.addContent(oCtrl);
		},

		/**
		 * adds title image in panel
		 *
		 * @private
		 * @param   {object}    oSourceCtrl     the originating source control
		 * @param   {int}       iImgId          an image ID
		 * @param   {string}    sImgTitle       the image's title
		 */
		_createPanelTitleImg: function(oSourceCtrl, iImgId, sImgTitle) {
			var oCtrl;
			if (iImgId) {
				var sURL = Configuration.getAttachmentDownloadURL(iImgId);
				oCtrl = new Image({
					src: sURL,
					objectId: iImgId,
					objectName: sImgTitle,
					alt: this.getText("ACTIVITIES_MSG_IMG_NON_EXISTENT")
				});
			}
			oSourceCtrl.addContent(oCtrl);
		},

		/**
		 * adds link in panel
		 *
		 * @private
		 * @param   {object}    oSourceCtrl     the originating source control
		 * @param   {string}    sURL            target URL
		 * @param   {string}    sText           displayed URL description
		 */
		_createPanelLink: function(oSourceCtrl, sURL, sText) {
			var oCtrl;
			if (sURL) {
				oCtrl = new Link({
					text: sText ? sText : sURL,
					target: "_blank",
					href: sURL
				});
			}
			oSourceCtrl.addContent(oCtrl);
		},

		/**
		 * adds link to evaluation in panel
		 *
		 * @private
		 * @param   {object}    oSourceCtrl     the originating source control
		 * @param   {int}       iEvalId         an evaluation ID
		 */
		_createPanelEvalLink: function(oSourceCtrl, iEvalId) {
			var oCtrl;
			if (iEvalId) {
				oCtrl = new Link({
					text: this.getText("ACTIVITIES_MSG_LINK_EVALUATION"),
					press: [this.onOpenEvaluation, this]
				});
			}
			oSourceCtrl.addContent(oCtrl);
		},

		_createPanelDecision: function(oSourceCtrl, iDecisionId) {
			var oCtrl;
			if (iDecisionId) {
				oCtrl = this.createFragment("sap.ino.vc.idea.fragments.DecisionPanel");
				oCtrl.bindElement("data>/IdeaStatusDecision(" + iDecisionId + ")/");
			}
			oSourceCtrl.addContent(oCtrl);
		},

		decisionMadeByFormatter: function(sDeciderName) {
			return this.getText("ACTIVITIES_MSG_DECISION_MADE_BY", [sDeciderName]);
		},

		decisionReasonFormatter: function(sReason) {
			return this.getText("ACTIVITIES_MSG_DECISION_REASON_COMMENTS", [sReason]);
		},

		decisionReasonCodeFormatter: function(sReasonCode) {
			var sReasonValue = this.formatter.valueOption(sReasonCode);
			return this.getText('ACTIVITIES_MSG_DECISION_REASON_CODE', [sReasonValue]);
		},

		onDecisionLinkPress: function(oEvent) {
			var oCtx = oEvent.getSource().getBindingContext("data");
			var sUrl = Configuration.getMailPreviewURL({
				DECISION: oCtx.getProperty("ID")
			});
			var oModel = new JSONModel(sUrl);
			oModel.attachRequestCompleted(this.onMailTextLoaded, this);
		},

		onMailTextLoaded: function(oEvent) {
			var oHTML = new IFrame({
				content: oEvent.getSource().getData().TEXT
			});
			if (!this._oMailViewDialog) {
				this._oMailViewDialog = this.createFragment("sap.ino.vc.idea.fragments.MailPreviewDialog");
				this.getView().addDependent(this._oMailViewDialog);
			}
			this._oMailViewDialog.addContent(oHTML);
			this._oMailViewDialog.open();
		},

		onMailViewClose: function(oEvent) {
			if (this._oMailViewDialog) {
				this._oMailViewDialog.close();
				this._oMailViewDialog.destroyContent();
			}
		},

		/**
		 * adds description to evaluation request in panel
		 *
		 * @private
		 * @param   {object}    oSourceCtrl     the originating source control
		 * @param   {int}       iEvalReqId      an evaluation request ID
		 * @param   {string}    sText           displayed  request description
		 */
		_createPanelEvalReqText: function(oSourceCtrl, iEvalReqId, sText) {
			var oCtrl;
			if (iEvalReqId) {
				var oLabel = new Label({
					text: this.getText("ACTIVITIES_MSG_EVAL_REQ_DESCRIPTION")
				});
				var oText = new Text({
					text: sText,
					maxLines: 2
				});
				oCtrl = new sap.m.HBox({
				}).addItem(oLabel).addItem(oText);
			}
			oSourceCtrl.addContent(oCtrl);
		},

		/**
		 * listens to expand event; creates controls lazily for displaying additional information about the activity item
		 **/
		onExpand: function(oEvent) {
			var oSourceCtrl = oEvent.getSource();
			var oChangeEvent = oSourceCtrl.getBindingContext("data");
			if (oEvent.getParameter("expand") && oChangeEvent) {
				// set class
				oSourceCtrl.toggleStyleClass("sapInoActivityExpanded");
				var oData = oChangeEvent.getObject();
				// get change event name
				var sChange = oData.CHANGE_EVENT;

				// expand - create components based on event
				if (this.DISPLAY_EVENTS_IDEA.indexOf(sChange) !== -1) {
					this._createPanelIdea(oSourceCtrl, oData.PARAM_0_ID);
				} else if (this.DISPLAY_EVENTS_PERSON.indexOf(sChange) !== -1) {
					//iIdentId, sUserName, iImgId, sOrg, sRole
					this._createPanelIdentity(oSourceCtrl, oData.PARAM_0_ID, oData.PARAM_0, oData.PARAM_1_ID, oData.PARAM_1);
				} else if (this.DISPLAY_EVENTS_CAMPAIGN.indexOf(sChange) !== -1) {
					this._createPanelCampaign(oSourceCtrl, oData.CAMPAIGN_ID);
				} else if (this.DISPLAY_EVENTS_WALL.indexOf(sChange) !== -1) {
					this._createPanelWall(oSourceCtrl, oData.PARAM_0_ID);
				} else if (this.DISPLAY_EVENTS_DIFFTEXT.indexOf(sChange) !== -1) {
					this._createPanelTextDiff(oSourceCtrl, oData.PARAM_1, oData.PARAM_0);
				} else if (this.DISPLAY_EVENTS_ATTACHMENT.indexOf(sChange) !== -1) {
					this._createPanelAttachment(oSourceCtrl, oData.PARAM_0_ID);
				} else if (this.DISPLAY_EVENTS_TITLEIMG.indexOf(sChange) !== -1) {
					this._createPanelTitleImg(oSourceCtrl, oData.PARAM_0_ID, oData.PARAM_0);
				} else if (this.DISPLAY_EVENTS_LINK.indexOf(sChange) !== -1) {
					this._createPanelLink(oSourceCtrl, oData.PARAM_1, oData.PARAM_0);
				} else if (this.DISPLAY_EVENTS_EVAL.indexOf(sChange) !== -1) {
					this._createPanelEvalLink(oSourceCtrl, oData.PARAM_0_ID);
				} else if (this.DISPLAY_EVENTS_EVAL_REQ.indexOf(sChange) !== -1) {
					this._createPanelEvalReqText(oSourceCtrl, oData.PARAM_0_ID, oData.PARAM_1);
				} else if ((sChange.indexOf("STATUS_ACTION_") === 0) && oData.PARAM_0_ID) {
					this._createPanelDecision(oSourceCtrl, oData.PARAM_0_ID, oData.PARAM_1_ID);
				}
			} else {
				oSourceCtrl.toggleStyleClass("sapInoActivityExpanded");
				// destroy all components on close
				oSourceCtrl.removeAllContent();
			}
		},

		/**
		 * called when the Wall JSON-model is loaded
		 *
		 * "this" in this context is the expanded Panel
		 */
		_onWallLoaded: function(oEvent, oParam) {
			var oSource = oEvent.getSource();
			var oData = oSource.oData;
			if (oData && oData.ID && oParam.controller) {
				var oWall = WallFactory.createWallFromInoJSON(oData);
				var oWallPreview = new WallPreview({
					owner: oData.CREATED_BY_NAME,
					hits: oData.VIEW_COUNT,
					press: [oParam, oParam.controller.onOpenWall, oParam.controller]
				});
				oWallPreview.setWall(oWall);
				this.addContent(oWallPreview);
			} else {
				this.addContent(new Text({
					text: {
						path: "i18n>ACTIVITIES_MSG_WALL_NON_EXISTENT"
					}
				}));
			}
		},

		onOpenEvaluation: function(oEvent) {
			var iEvalId = oEvent.getSource().getBindingContext("data").getProperty("PARAM_0_ID");
			if (iEvalId) {
				this.navigateTo("evaluation-display", {
					id: iEvalId
				});
			}
		},

		/**
		 * opens wall
		 */
		onOpenWall: function(oEvent, oParam) {
			var iWallId = oParam.wallId;
			if (iWallId) {
				this.navigateToWall("wall", {
					id: iWallId
				});
			}
		},

		/**
		 * Event listener for opening referenced ideas (fragment FlatListItem)
		 */
		onOpenIdea: function(oEvent) {
			var iIdeaId = oEvent.getSource().getBindingContext("data").getProperty("ID");
			if (iIdeaId) {
				this.navigateTo("idea-display", {
					id: iIdeaId
				});
			}
		},

		/**
		 * unfortunately-named event listener of CardListItem fragment for campaign navigation
		 */
		onItemPress: function(oEvent) {
			var oSource = oEvent.getSource();
			var sNavTarget;
			switch (oSource.data("source-type")) {
				case "idea":
					sNavTarget = "idea-display";
					break;
				case "campaign":
					sNavTarget = "campaign";
					break;
				default:
					break;
			}
			var iItemId = oEvent.getSource().getBindingContext("data").getProperty("ID");
			if (sNavTarget && iItemId) {
				this.navigateTo(sNavTarget, {
					id: iItemId
				});
			}
		},

		/**
		 * enriches DOM element with custom data element in order to display idea phase groups in Activity List
		 *
		 * @private
		 */
		_applyGroupingHeaders: function(oEvent) {
			var oSource = oEvent.getSource && oEvent.getSource() || oEvent;
			var aItems = oSource.getItems(),
				sCurrentPhase,
				sPrevPhase,
				sPhaseName,
				oItem;
			// run over phase codes with lag of one
			for (var i = 0; i < aItems.length; ++i) {
				oItem = aItems[i];
				sCurrentPhase = oItem.getBindingContext("data").getProperty("PHASE_CODE");
				if (sCurrentPhase !== sPrevPhase) {
					sPhaseName = this.formatter.ideaPhase(sCurrentPhase);
					if (sPhaseName) {
						oItem.$().attr("data-actgroup-title", this.getText("ACTIVITIES_TIT_PHASE_GROUP", sPhaseName));
						oItem.$().attr("aria-label", this.getText("ACTIVITIES_TIT_PHASE_GROUP", sPhaseName));
					}
				} else {
					oItem.$().removeAttr("data-actgroup-title");
					oItem.$().removeAttr("aria-label");
				}
				sPrevPhase = sCurrentPhase;
			}
		}

	}));
});