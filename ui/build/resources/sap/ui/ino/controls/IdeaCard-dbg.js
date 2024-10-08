/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.IdeaCard");

(function() {
    "use strict";

    jQuery.sap.require("sap.ui.ino.models.object.Vote");
    jQuery.sap.require("sap.ui.ino.controls.ProcessIndicator");
    jQuery.sap.require("sap.ui.ino.controls.LikeButton");
    jQuery.sap.require("sap.ui.ino.controls.LikeDislike");
    jQuery.sap.require("sap.ui.ino.controls.AccessibilitySupport");
    jQuery.sap.require("sap.ui.ino.controls.FileUploader");
    jQuery.sap.require("sap.ui.ino.controls.ColorSupport");
    // Force to load NumberFormat, otherwise star voting is not displayed correctly upon initial UI load
    jQuery.sap.require("sap.ui.core.format.NumberFormat");
    var ColorSupport = sap.ui.ino.controls.ColorSupport;

    /**
     * 
     * The IdeaCard is a representation of an Idea. It can be used as an item (with renderer) within a list or as a
     * preview during idea creation etc.
     * 
     * <ul>
     * <li>Properties
     * <ul>
     * <li>ideaId: The ID of the idea used to identify the idea </li>
     * <li>showFrontOnStart: By default the front of the IdeaCard is shown when rendering the card the first time. If
     * this property is set to false the back of the card is show, when rendering the first time. </li>
     * <li>campaignTitle: The title that is shown on the very top of the front and back of the card. </li>
     * <li>campaignColor: The background color of the campaign title at the very top of the card. The color is given as
     * HEX string RRGGBB w/o the leading # (e.g. "3F567A" instead of "#3F567A"). </li>
     * <li>title: The title of the idea, shown at the front and the back.</li>
     * <li>detailsURL: The URL (absolute or relative) pointing to the details screen of the idea.</li>
     * <li>campaignURL: The URL (absolute or relative) pointing to the idea campaign.</li>
     * <li>videoSrc: The path to a video this IdeaCard is showing. If this property is not set the IdeaCard refers to
     * the imageSrc property. The property is used within a source tag of a video tag. </li>
     * <li>imageSrc: This property is not used if videoSrc is specified. This property specifies the path to an image
     * that is shown on the front of this IdeaCard. If neither the imageSrc nor the videoSrc is specified the IdeaCard
     * displays the title in the media area instead. </li>
     * <li>preDescriptionLine: On the back of the IdeaCard one line directly above the description is shown. This line
     * can e.g. be used to display the author and the date the idea was created at.</li>
     * <li>commentCount: The amount of comments posted to this idea. </li>
     * <li>commentText: The tooltip text for the comment icon. </li>
     * <li>ideaScore: Voting score of the idea (use this property together with the vote type LIKE). </li>
     * <li>userScore: The voting score of the user (valid for both vote types LIKE and LIKE_DISLIKE). </li>
     * <li>ideaScoreLike: Positive voting score of the idea (use this property together with the property
     * ideaScoreDisLike and the vote type LIKE_DISLIKE). </li>
     * <li>ideaScoreDislike: Negative voting score of the idea (use this property together with the property
     * ideaScoreLike and the vote type LIKE_DISLIKE). </li>
     * <li>campaignOpenForVote: Is the corresponding campaign of this idea open for votes. </li>
     * <li>campaignClosed: Is the corresponding campaign closed</li>
     * <li>campaignClosedText: Text if the the corresponding campaign is closed</li>
     * <li>voteType: Voting type of the campaign either LIKE or LIKE_DISLIKE. </li>
     * <li>text: The description of the idea is shown on the back of the card (truncated and trimmed). </li>
     * <li>processSteps: Indicates the total length of the process the idea is part of. </li>
     * <li>currentStep: The current process step the idea is in. </li>
     * <li>processRunning: True indicates that the process is active, false indicates that the process has stopped.
     * </li>
     * <li>style: The style of the process indicator. </li>
     * <li>navigationMode: If true the card offers links to navigate to a details view. </li>
     * <li>commentNavigationMode: If true the card offers a link to navigate to a comments section. Only relevant of
     * navigationMode is false</li>
     * <li>editMode: If true voting buttons etc. on the card are deactivated. This property does activate the file
     * uploader. </li>
     * <li>phaseText: The phase the process is currently in. </li>
     * <li>statusText: The status the process is currently in. </li>
     * <li>iconMode: if true a smaller card with no interaction possibilities is displayed. </li>
     * <li>moreButtonText: The text of the "more"-Button on the back of the card. </li>
     * <li>flipButtonTooltip: The tooltip of the flip idea card button.</li>
     * <li>mobileMode: true for mobile mode.</li>
     * </ul>
     * </li>
     * <li>Aggregations
     * <ul>
     * <li>fileUploader: control displayed in the media area of the card and used to upload a title picture. </li>
     * </ul>
     * </li>
     * <li>Events
     * <li>votingChanged: </li>
     * </ul>
     * </li>
     * </ul>
     */
    sap.ui.ino.controls.AccessibilitySupport.extend("sap.ui.ino.controls.IdeaCard", {
        metadata : {
            properties : {
                ideaId : {
                    type : "int",
                    defaultValue : 0
                },
                showFrontOnStart : {
                    type : "boolean",
                    defaultValue : true
                },
                campaignId : {
                    type : "int",
                    defaultValue : 0
                },
                campaignTitle : "string",
                campaignColor : "string", // default color can be set via CSS
                title : "string",
                detailsURL : "string",
                campaignURL : "string",
                campaignTarget : {
                    type : "string",
                    defaultValue : ""
                },
                videoSrc : "string",
                imageSrc : "string",
                mediaType : "string",
                commentCount : {
                    type : "int",
                    defaultValue : 0
                },
                commentText : {
                    type : "string",
                    defaultValue : ""
                },
                ideaScore : {
                    type : "float",
                    defaultValue : 0
                },
                userScore : {
                    type : "int",
                    defaultValue : 0
                },
                ideaScoreLike : {
                    type : "int",
                    defaultValue : 0
                },
                ideaScoreDislike : {
                    type : "int",
                    defaultValue : 0
                },
                campaignOpenForVote : {
                    type : "int",
                    defaultValue : 0
                },
                campaignClosed : {
                    type : "int",
                    defaultValue : 0
                },
                campaignClosedText : {
                    type : "string",
                    defaultValue : ""
                },
                voteType : {
                    type : "string",
                    defaultValue : "NONE"
                },
                voteCount : {
                    type : "int",
                    defaultValue : 0
                },
                voteId : {
                    type : "int",
                    defaultValue : -1
                },
                maxStarNo : {
                    type : "int",
                    defaultValue : 5
                },
                isVoteActive : {
                    type : "boolean",
                    defaultType : true
                },
                text : "string",
                processSteps : {
                    type : "int",
                    defaultValue : 6
                },
                currentStep : {
                    type : "int",
                    defaultValue : -1
                },
                processRunning : {
                    type : "boolean",
                    defaultValue : true
                },
                style : {
                    type : "string",
                    defaultValue : "bubbles"
                },
                phaseText : {
                    type : "string",
                    defaultValue : ""
                },
                statusText : {
                    type : "string",
                    defaultValue : ""
                },
                navigationMode : {
                    type : "boolean",
                    defaultValue : true
                },
                commentNavigationMode : {
                    type : "boolean",
                    defaultValue : false
                },
                editMode : {
                    type : "boolean",
                    defaultValue : false
                },
                isDraft : {
                    type : "boolean",
                    defaultValue : false
                },
                iconMode : {
                    type : "boolean",
                    defaultValue : false
                },
                moreButtonText : "string",
                flipButtonTooltip : "string",
                mobileMode : {
                    type : "boolean",
                    defaultValue : false
                }
            },
            aggregations : {
                "fileUploader" : {
                    type : "sap.ui.ino.controls.FileUploader",
                    multiple : false,
                    bindable : "bindable"
                },
                "preDescriptionLine" : {
                    type : "sap.ui.commons.Label",
                    multiple : false
                },
                "_ideaCardTitleLink" : {
                    type : "sap.ui.commons.Link",
                    multiple : false,
                    hidden : true
                },
                "_videoButton" : {
                    type : "sap.ui.commons.Button",
                    multiple : false,
                    visibility : "hidden"
                }
            },
            events : {
                votingChanged : {},
                onCommentClicked : {}
            }
        },

        init : function() {
            if (sap.ui.core.Control.prototype.init) {
                sap.ui.core.Control.prototype.init.apply(this, arguments);
            }
        },

        _renderTopRibbon : function(oRm, oControl) {

            var oModel = sap.ui.getCore().getModel("i18n");
            var oTxtBundle = oModel.getResourceBundle();

            oRm.write("<div");
            oRm.addClass("sapUiIdeaCardTopRibbon sapUiIdeaCardRibbon");
            var sColor = oControl.getCampaignColor();
            if (sColor && sColor.length === 6) {
                oRm.writeAttributeEscaped("style", "background-color: #" + oControl.getCampaignColor());
            }
            oRm.writeAttribute("role", "group");
            oRm.writeAttribute("aria-labelledby", oControl.getId() + "_ideatitle");
            oRm.writeClasses();
            oRm.write(">");

            oRm.write("<div");
            oRm.addClass("sapUiIdeaCardCampaignCenter");
            oRm.writeClasses();
            oRm.write(">");

            oRm.write("<div");
            oRm.addClass("sapUiIdeaCardCampaignSection");
            oRm.writeClasses();
            oRm.write(">");

            if (oControl.getCampaignTitle()) {
                var sTarget = oControl.getCampaignTarget();

                if (oControl.getCampaignURL()) {
                    var oIdeaCardCampaignLink = new sap.ui.commons.Link({
                        text : oControl.getCampaignTitle(),
                        href : oControl.getCampaignURL(),
                        tooltip : oTxtBundle.getText("CTRL_IDEACARD_EXP_CAMPAIGN_TOOLTIP", [oControl.getCampaignTitle()]),
                        target : (sTarget && sTarget.length > 0) ? sTarget : undefined
                    }).addStyleClass("sapUiIdeaCardCampaignLink");
                    oRm.renderControl(oIdeaCardCampaignLink);
                } else {
                    var oIdeaCardCampaignText = new sap.ui.commons.TextView({
                        text : oControl.getCampaignTitle(),
                        tooltip : oTxtBundle.getText("CTRL_IDEACARD_EXP_CAMPAIGN_TOOLTIP", [oControl.getCampaignTitle()]),
                    }).addStyleClass("sapUiIdeaCardCampaignTitle");
                    oRm.renderControl(oIdeaCardCampaignText);
                }
            }

            oRm.write("</div>");

            oRm.write("</div>");

            oRm.write("</div>");
        },

        _renderBottomRibbon : function(oRm, oControl, sFlip) {

            var oFlipButton = new sap.ui.commons.Button({
                lite : true,
                press : function(oEvent) {
                    oControl.flip(true);
                },
                tooltip : this.getFlipButtonTooltip() || ""
            }).addStyleClass("sapUiIdeaCardFlipButton").addStyleClass("sapUiInoIdeaCard_flip").addStyleClass("spriteIdeaCard");

            if (oControl.getMobileMode()) {
                oRm.renderControl(oFlipButton);
            }
            
            oRm.write("<div role=\"toolbar\" aria-label=\"" + this.getFlipButtonTooltip() + "\"");
            oRm.addClass("sapUiIdeaCardBottomRibbon sapUiIdeaCardRibbon");
            oRm.writeClasses();
            oRm.write(">");
            
            if (!oControl.getMobileMode()) {
                oRm.renderControl(oFlipButton);
            }
            // END: sapUiIdeaCardBottomRibbon
            oRm.write("</div>");
        },

        _frontRenderer : function(oRm, oControl) {

            var oModel = sap.ui.getCore().getModel("i18n");
            var oTxtBundle = oModel.getResourceBundle();

            var bIsDraft = oControl.getIsDraft();

            // START: sapUiIdeaCardFlipFront - container that is flipped
            oRm.write("<div");
            oRm.addClass("sapUiIdeaCardFlipFront");
            oRm.writeClasses();
            oRm.write(">");

            oControl._renderTopRibbon(oRm, oControl);

            // START: sapUiIdeaCardHeader - containing the title of the idea
            oRm.write("<div");
            oRm.addClass("sapUiIdeaCardHeader");
            oRm.writeClasses();
            oRm.write(">");

            // in no navigation mode or in icon mode no navigation to the details view
            // can be triggered via the title
            if (!oControl.getNavigationMode() || oControl.getIconMode()) {
                oRm.write("<div");
                oRm.addClass("sapUiIdeaCardTitle");
                oRm.writeAttribute("id", oControl.getId() + "_ideatitle");
                oRm.writeClasses();
                oRm.write(">");
                if (oControl.getTitle()) {
                    oRm.writeEscaped(oControl.getTitle());
                }
                oRm.write("</div>");
            } else {
                var oIdeaCardTitleLink = this.getAggregation("_ideaCardTitleLink");
                if (oIdeaCardTitleLink === undefined || oIdeaCardTitleLink === null) {
                    oIdeaCardTitleLink = new sap.ui.commons.Link({
                        id : oControl.getId() + "_ideatitle",
                        text : oControl.getTitle(),
                        href : oControl.getDetailsURL(),
                        tooltip : oTxtBundle.getText("CTRL_IDEACARD_EXP_IDEA_TOOLTIP", [oControl.getTitle()]),
                        target : "_blank"
                    }).addStyleClass("sapUiIdeaCardTitle sapUiIdeaCardTitleLink");
                    oRm.renderControl(oIdeaCardTitleLink);

                    this.setAggregation("_ideaCardTitleLink", oIdeaCardTitleLink, true);
                } else {
                    oIdeaCardTitleLink.setText(oControl.getTitle());
                    oIdeaCardTitleLink.setTooltip(oTxtBundle.getText("CTRL_IDEACARD_EXP_IDEA_TOOLTIP", [oControl.getTitle()]));
                    oRm.renderControl(oIdeaCardTitleLink);
                }
            }

            // END: sapUiIdeaCardHeader
            oRm.write("</div>");

            // START: sapUiIdeaCardFlipFrontMedia - containing the media area
            if (oControl.getNavigationMode() && !oControl.getIconMode()) {
                oRm.write("<a");
                oRm.addClass("sapUiIdeaCardMediaTextLink");
                oRm.writeAttributeEscaped("tabindex", "-1");
                oRm.writeAttributeEscaped("title", oTxtBundle.getText("CTRL_IDEACARD_EXP_IDEA_TOOLTIP", [oControl.getTitle()]));
                oRm.writeClasses();
                if (oControl.getDetailsURL()) {
                    oRm.writeAttributeEscaped("href", oControl.getDetailsURL());
                    oRm.writeAttributeEscaped("target", "_blank");
                }
                oRm.write(">");
            }
            oRm.write("<div");
            oRm.addClass("sapUiIdeaCardFlipFrontMedia");
            oRm.writeClasses();
            oRm.write(">");

            if (oControl.getVideoSrc()) {
                oRm.write("<video preload='metadata'");
                oRm.writeAttribute("id", "video_" + oControl.getId());
                oRm.addClass("sapUiIdeaCardFlipFrontMediaVideo");
                oRm.writeClasses();
                // hide the sapUiIdeaCardFlipFrontMediaVideoOverlay in case of an error
                // this is for IE
                oRm.write(" onerror=\"jQuery(this.parentElement.childNodes[1]).hide();jQuery(this.parentElement.childNodes[2]).show();\"");
                oRm.write(">");
                oRm.write("<source type='");
                oRm.writeEscaped(oControl.getMediaType());
                oRm.write("' src='");
                oRm.writeEscaped(oControl.getVideoSrc());
                oRm.write("'");
                // hide the sapUiIdeaCardFlipFrontMediaVideoOverlay in case of an error
                // this is for Chrome and FF
                oRm.write(" onerror=\"jQuery(this.parentElement.parentElement.childNodes[1]).hide();jQuery(this.parentElement.parentElement.childNodes[2]).show();\"");
                oRm.write("></source>");
                oRm.write("</video>");
                oRm.write("<div");
                oRm.addClass("sapUiIdeaCardFlipFrontMediaVideoOverlay");
                oRm.writeClasses();
                oRm.write(">");

                var oVideoButton = oControl.getAggregation("_videoButton");
                if (!oVideoButton) {
                    oVideoButton = new sap.ui.commons.Button({
                        lite : true,
                        tooltip : oTxtBundle.getText("CTRL_IDEACARD_VIDEO_BUTTON"),
                        press : function(oEvent) {
                            oEvent.cancelBubble();
                            oEvent.preventDefault();
                            oControl.togglePlay();
                            oControl.getFocusDomRef().focus();
                        }
                    });
                    oVideoButton.addStyleClass("sapUiInoIdeaCard_play");
                    oVideoButton.addStyleClass("spriteIdeaCard");
                    oControl.setAggregation("_videoButton", oVideoButton);
                }
                oRm.renderControl(oVideoButton);

                oRm.write("</div>");
                oRm.write("<div");
                oRm.addClass("sapUiIdeaCardFlipFrontMediaVideoOverlayError");
                oRm.addClass("spriteIdeaCard");
                oRm.addClass("sapUiInoIdeaCard_error");
                oRm.writeClasses();
                oRm.write("/>");

            } else if (oControl.getImageSrc()) {
                oRm.write("<div");
                oRm.addClass("sapUiIdeaCardFlipFrontMediaImage");
                oRm.writeClasses();
                oRm.write("/>");
            } else {
                oRm.write("<div");
                oRm.addClass("sapUiIdeaCardFlipFrontMediaTextContainer");
                var sColor = oControl.getCampaignColor();
                if (sColor && sColor.length === 6) {
                    oRm.writeAttributeEscaped("style", "opacity: 0.4; color: " + ColorSupport.calculateMediaTextColor(sColor.substr(0, 2), sColor.substr(2, 2), sColor.substr(4, 2)) + "; background-color: #" + sColor);
                }
                oRm.writeClasses();
                oRm.write(">");

                oRm.write("<div");
                oRm.addClass("sapUiIdeaCardFlipFrontMediaText");
                oRm.writeClasses();
                oRm.write(">");
                if (oControl.getTitle()) {
                    oRm.writeEscaped(oControl.getTitle());
                }
                oRm.write("</div>");

                oRm.write("</div>");
            }

            if (oControl.getEditMode() && oControl.getFileUploader()) {
                oRm.write("<div");
                oRm.addClass("sapUiIdeaCardFlipFileUploader");
                oRm.writeClasses();
                oRm.write(">");
                oRm.renderControl(oControl.getFileUploader());
                oRm.write("</div>");
            }

            // END: sapUiIdeaCardFlipFrontMedia
            oRm.write("</div>");

            if (oControl.getNavigationMode() && !oControl.getIconMode()) {
                oRm.write("</a>");
            }

            // START: sapUiIdeaCardFlipFrontProcessContainer
            oRm.write("<div");
            oRm.addClass("sapUiIdeaCardFlipFrontProcessContainer");
            oRm.writeClasses();
            oRm.write(">");

            // START: sapUiIdeaCardFlipFrontProcess - the control showing the process indicator
            oRm.write("<div");
            oRm.addClass("sapUiIdeaCardFlipFrontProcess");
            oRm.writeClasses();
            oRm.write(">");

            var oControlPI = new sap.ui.ino.controls.ProcessIndicator({
                width : 196,
                height : 12,
                processSteps : oControl.getProcessSteps(),
                currentStep : bIsDraft ? -1 : oControl.getCurrentStep(),
                processRunning : oControl.getProcessRunning(),
                style : oControl.getStyle(),
                tooltip : oTxtBundle.getText("CTRL_IDEACARD_EXP_PROGRESS_INDICATOR")
            });
            oRm.renderControl(oControlPI);

            if (!bIsDraft) {
                oRm.write("<div");
                oRm.addClass("sapUiIdeaCardFlipFrontProcessPhase");
                oRm.writeClasses();
                oRm.write(">");
                oRm.writeEscaped(oTxtBundle.getText("CTRL_IDEACARD_FLD_PHASE") + ": ");
                oRm.write("<span");
                oRm.addClass("sapUiIdeaCardFlipFrontProcessPhaseText");
                oRm.writeAttributeEscaped("title", oControl.getPhaseText());
                oRm.writeClasses();
                oRm.write(">");
                oRm.writeEscaped(oControl.getPhaseText());
                oRm.write("</span>");
                oRm.write("</div>");
            }

            oRm.write("<div");
            oRm.addClass("sapUiIdeaCardFlipFrontProcessStatus");
            oRm.writeClasses();
            oRm.write(">");
            oRm.writeEscaped(oTxtBundle.getText("CTRL_IDEACARD_FLD_STATUS") + ": ");
            oRm.write("<span");
            oRm.addClass("sapUiIdeaCardFlipFrontProcessStatusText");
            if (bIsDraft) {
                oRm.writeAttributeEscaped("title", oTxtBundle.getText("CTRL_IDEACARD_FLD_DRAFT"));
            } else if (oControl.getStatusText()) {
                oRm.writeAttributeEscaped("title", oControl.getStatusText());
            }
            oRm.writeClasses();
            oRm.write(">");
            if (bIsDraft) {
                oRm.writeEscaped(oTxtBundle.getText("CTRL_IDEACARD_FLD_DRAFT"));
            } else if (oControl.getStatusText()) {
                oRm.writeEscaped(oControl.getStatusText());
            }
            oRm.write("</span>");
            oRm.write("</div>");

            // END: sapUiIdeaCardFlipFrontProcess
            oRm.write("</div>");

            // END: sapUiIdeaCardFlipFrontProcessContainer
            oRm.write("</div>");

            // START: sapUiIdeaCardFooter1
            oRm.write("<div role=\"toolbar\" aria-label=\"" + oTxtBundle.getText("CTRL_IDEACARD_EXP_ARIA_LABEL_VOTING_COMMENT_GROUP") + "\"");
            oRm.addClass("sapUiIdeaCardFooter1");
            oRm.writeClasses();
            oRm.write(">");

            // START: sapUiIdeaCardLineSeparator
            oRm.write("<div");
            oRm.addClass("sapUiIdeaCardLineSeparator");
            oRm.writeClasses();
            oRm.write("></div>");
            // END: sapUiIdeaCardLineSeparator

            // START: sapUiIdeaCardButtonGroup - displaying all the buttons
            oRm.write("<div");
            oRm.addClass("sapUiIdeaCardButtonGroup");
            oRm.writeClasses();
            oRm.write(">");

            oRm.write("<span");
            oRm.addClass("sapUiIdeaCardButtonGroupInner");
            oRm.writeClasses();
            oRm.write(">");

            if (bIsDraft) {
                var oDraft = new sap.ui.commons.Label({
                    text : oTxtBundle.getText("CTRL_IDEACARD_FLD_DRAFT")
                }).addStyleClass("sapUiIdeaCardDraftIdentifier");

                oDraft.setTooltip(oTxtBundle.getText("CTRL_IDEACARD_EXP_IDEA_DRAFT"));
                oRm.renderControl(oDraft);
            } else {
                var sInactiveText = oTxtBundle.getText("CTRL_IDEACARD_VOTE_EXP_CAMPAIGN_PHASE_INACTVE_GENERIC");
                if (oControl.getEditMode()) {
                    sInactiveText = oTxtBundle.getText("CTRL_IDEACARD_VOTE_EXP_EDIT_MODE");
                } else {
                    if (!oControl.getProcessRunning()) {
                        sInactiveText = oTxtBundle.getText("CTRL_IDEACARD_VOTE_EXP_STATUS_INACTVE");
                    } else if (oControl.getPhaseText()) {
                        sInactiveText = oTxtBundle.getText("CTRL_IDEACARD_VOTE_EXP_CAMPAIGN_PHASE_INACTVE", [oControl.getPhaseText()]);
                    }
                }

                var bVotingActive = !oControl.getEditMode() && oControl.getIsVoteActive() && oControl.getProcessRunning();
                var iIdeaId = oControl.getIdeaId();

                oControl._oVotingControl = undefined;

                var vote = function(iScore) {
                    // Voting not possible in old UI
                };

                if (oControl.getVoteType() === sap.ui.ino.models.object.Vote.TYPE_LIKE) {
                    var oLikeButton = new sap.ui.ino.controls.LikeButton({
                        ideaId : oControl.getIdeaId(),
                        ideaScore : oControl.getIdeaScore(),
                        likeSelected : (oControl.getUserScore() > 0),
                        readOnly : oControl.getIdeaId() < 0 || oControl.getIconMode() || !bVotingActive,
                        like : function(oEvent) {
                            vote(1);
                        },
                        unvote : function(oEvent) {
                            vote(null);
                        }
                    }).addStyleClass("sapUiIdeaCardButtonGroupEntry");
                    oRm.renderControl(oLikeButton);
                    oControl._oVotingControl = oLikeButton;
                } else if (oControl.getVoteType() === sap.ui.ino.models.object.Vote.TYPE_LIKE_DISLIKE) {
                    var oLikeDislike = new sap.ui.ino.controls.LikeDislike({
                        ideaId : oControl.getIdeaId(),
                        ideaScoreLike : oControl.getIdeaScoreLike(),
                        ideaScoreDislike : oControl.getIdeaScoreDislike(),
                        status : (oControl.getUserScore() > 0 ? "like" : (oControl.getUserScore() < 0 ? "dislike" : "unselected")),
                        readOnly : oControl.getIdeaId() < 0 || oControl.getIconMode() || !bVotingActive,
                        like : function(oEvent) {
                            vote(1);
                        },
                        dislike : function(oEvent) {
                            vote(-1);
                        },
                        unvote : function(oEvent) {
                            vote(null);
                        }
                    }).addStyleClass("sapUiIdeaCardButtonGroupEntry");
                    oRm.renderControl(oLikeDislike);
                    oControl._oVotingControl = oLikeDislike;
                } else if (oControl.getVoteType() === sap.ui.ino.models.object.Vote.TYPE_STAR) {
                    var bEdit = bVotingActive && (oControl.getIdeaId() > 0) && !oControl.getIconMode();

                    var oRating = new sap.ui.commons.RatingIndicator({
                        maxValue : oControl.getMaxStarNo(),
                        visualMode : sap.ui.commons.RatingIndicatorVisualMode.Continuous,
                        averageValue : oControl.getIdeaScore(),
                        value : sap.ui.commons.RatingIndicator.NoValue,
                        editable : bEdit,
                        change : function(oEvent) {
                            var iScore = oEvent.getParameter("value");
                            vote(iScore);
                            var oRatingControl = oEvent.getSource();
                            oRatingControl.setAverageValue(oControl.getIdeaScore());
                        }
                    }).addStyleClass("sapUiIdeaCardStarVoting");

                    // Only average value is used, user value is not displayed
                    // it needs to be set afterwards as lazy loading in UI5
                    // might cause the Enumeration to be undefined
                    oRating.setValue(sap.ui.commons.RatingIndicator.NoValue);

                    oControl._oVotingControl = oRating;

                    oRm.write("<div");
                    oRm.addClass("sapUiIdeaCardButtonGroupEntry");
                    oRm.writeClasses();
                    oRm.write(">");

                    oRm.renderControl(oRating);

                    oRm.write("<div");
                    oRm.addClass("sapUiIdeaCardStarDescription");
                    oRm.writeClasses();

                    var sStarDescription = "";
                    if (sap.ui.core.format.NumberFormat) {
                        var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                            maxFractionDigits : 1
                        });

                        var sPostfix = (oControl.getVoteCount() === 1) ? "_ONE_VOTE" : "";

                        if (!oControl.getIdeaScore()) {
                            sStarDescription = oTxtBundle.getText("CTRL_IDEACARD_STAR_RATING_DESCR_NONE");
                        } else if (!oControl.getUserScore()) {
                            sStarDescription = oTxtBundle.getText("CTRL_IDEACARD_STAR_RATING_DESCR_NONE_USER" + sPostfix, [oNumberFormat.format(oControl.getIdeaScore()), oControl.getVoteCount()]);
                        } else {
                            sStarDescription = oTxtBundle.getText("CTRL_IDEACARD_STAR_RATING_DESCR" + sPostfix, [oNumberFormat.format(oControl.getIdeaScore()), oControl.getVoteCount(), oControl.getUserScore()]);
                        }

                        oRm.writeAttributeEscaped("title", sStarDescription);
                        oRm.write(">");

                        oRm.writeEscaped(sStarDescription);
                    } else {
                        oRm.write(">");
                    }

                    oRm.write("</div>");
                    oRm.write("</div>");
                }

                oRm.write("<div");
                oRm.addClass("sapUiIdeaCardCommentLink sapUiIdeaCardButtonGroupEntry");
                oRm.writeClasses();
                oRm.write(">");

                // in no navigation mode or in icon mode no navigation to the details view
                // can be triggered via the comment count
                if ((!oControl.getNavigationMode() && !oControl.getCommentNavigationMode()) || oControl.getIconMode()) {
                    oRm.write("<div");
                    oRm.addClass("sapUiIdeaCardCommentImage");
                    oRm.addClass("spriteIdeaCard");
                    oRm.addClass("sapUiInoIdeaCard_Comment");
                    oRm.writeClasses();
                    oRm.writeAttributeEscaped("title", oControl.getCommentText());
                    oRm.write("></div>");
                } else {
                    var oIdeaCardCommentButton = new sap.ui.commons.Button({
                        lite : true,
                        press : function() {
                            oControl.fireOnCommentClicked();
                        }
                    }).addStyleClass("sapUiIdeaCardCommentImage").addStyleClass("spriteIdeaCard").addStyleClass("sapUiInoIdeaCard_Comment");
                    oIdeaCardCommentButton.setTooltip(oControl.getCommentText());
                    oRm.renderControl(oIdeaCardCommentButton);
                }

                oRm.write("<div");
                oRm.addClass("sapUiIdeaCardCommentCount");
                oRm.writeClasses();
                oRm.write(">" + oControl.getCommentCount() + "</div>");

                oRm.write("</div>");
            }

            oRm.write("</span>");
            // END: sapUiIdeaCardButtonGroup
            oRm.write("</div>");

            // END: sapUiIdeaCardFooter1
            oRm.write("</div>");

            oControl._renderBottomRibbon(oRm, oControl, "front");

            // END: sapUiIdeaCardFlipFront
            oRm.write("</div>");
        },

        _backRenderer : function(oRm, oControl) {

            var oModel = sap.ui.getCore().getModel("i18n");
            var oTxtBundle = oModel.getResourceBundle();

            // START: sapUiIdeaCardFlipBack - container that is flipped
            oRm.write("<div");
            oRm.addClass("sapUiIdeaCardFlipBack");
            oRm.writeClasses();
            oRm.write(">");

            oControl._renderTopRibbon(oRm, oControl);

            // START: sapUiIdeaCardHeader
            oRm.write("<div");
            oRm.addClass("sapUiIdeaCardHeader");
            oRm.writeClasses();
            oRm.write(">");

            // in no navigation mode or in icon mode no navigation to the details view
            // can be triggered via the title
            if (!oControl.getNavigationMode() || oControl.getIconMode()) {
                oRm.write("<div");
                oRm.addClass("sapUiIdeaCardTitle");
                oRm.writeClasses();
                oRm.write(">");
                if (oControl.getTitle()) {
                    oRm.writeEscaped(oControl.getTitle());
                }
                oRm.write("</div>");
            } else {
                var oIdeaCardTitleLink = new sap.ui.commons.Link({
                    text : oControl.getTitle(),
                    href : oControl.getDetailsURL(),
                    tooltip : oTxtBundle.getText("CTRL_IDEACARD_EXP_IDEA_TOOLTIP", [oControl.getTitle()]),
                    target : "_blank"
                }).addStyleClass("sapUiIdeaCardTitle sapUiIdeaCardTitleLink");
                oRm.renderControl(oIdeaCardTitleLink);
            }
            // END: sapUiIdeaCardHeader
            oRm.write("</div>");

            // START: sapUiIdeaCardBackDescription
            oRm.write("<div");
            oRm.addClass("sapUiIdeaCardBackDescription");
            oRm.writeClasses();
            oRm.write(">");

            oRm.write("<div");
            oRm.addClass("sapUiIdeaCardBackPreDescLine");
            oRm.writeClasses();
            oRm.write(">");
            var oPreDescriptionLine = oControl.getPreDescriptionLine();
            if (oPreDescriptionLine) {
                oPreDescriptionLine.addStyleClass("sapUiIdeaCardBackPreDescLine");
                oRm.renderControl(oPreDescriptionLine);
            }
            oRm.write("</div>");

            oRm.write("<div");
            oRm.addClass("sapUiIdeaCardBackText");
            oRm.writeClasses();
            oRm.write(">");
            if (oControl.getText()) {
                var sText = oControl._convertDescriptionText(oControl.getText());
                oRm.write(sText); // sText is already escaped
            }
            oRm.write("</div>");
            oRm.write("<div");
            oRm.addClass("sapUiIdeaCardBackTextCutted");
            oRm.writeClasses();
            oRm.write(">...</div>");

            // START: sapUiIdeaCardFooter2
            oRm.write("<div");
            oRm.addClass("sapUiIdeaCardFooter2");
            oRm.writeClasses();
            oRm.write(">");

            // in edit mode, in no navigation mode or in icon mode no navigation to the details view
            // can be triggered via the title
            if (oControl.getMoreButtonText() && !oControl.getEditMode() && oControl.getNavigationMode() && !oControl.getIconMode()) {
                var oIdeaCardMoreLink = new sap.ui.commons.Link({
                    text : oControl.getMoreButtonText(),
                    href : oControl.getDetailsURL(),
                    tooltip : oTxtBundle.getText("CTRL_IDEACARD_EXP_IDEA_TOOLTIP", [oControl.getTitle()]),
                    target : "_blank"
                }).addStyleClass("sapUiIdeaCardMoreButton");
                oRm.renderControl(oIdeaCardMoreLink);
            }
            // END: sapUiIdeaCardFooter2
            oRm.write("</div>");

            // START: sapUiIdeaCardFooter1
            oRm.write("<div");
            oRm.addClass("sapUiIdeaCardFooter1");
            oRm.writeClasses();
            oRm.write(">");

            oRm.write("<div");
            oRm.addClass("sapUiIdeaCardLineSeparator");
            oRm.writeClasses();
            oRm.write("></div>");

            // END: sapUiIdeaCardFooter1
            oRm.write("</div>");

            // END: sapUiIdeaCardBackDescription
            oRm.write("</div>");

            oControl._renderBottomRibbon(oRm, oControl, "back");

            // END: sapUiIdeaCardFlipBack
            oRm.write("</div>");
        },

        getAccessibilityContainerId : function() {
            return this.getId() + "_selector";
        },

        renderer : function(oRm, oControl) {
            
            var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
            var bIsDraft = oControl.getIsDraft();
            
            // remember the side (front or back) that is shown to the user
            if (oControl.isFront !== true && oControl.isFront !== false) {
                oControl.isFront = oControl.getShowFrontOnStart();
            }

            oRm.write("<div ");
            oRm.writeControlData(oControl);
            
            // render the side shown the last time to the user
            if (!oControl.isFront) {
                oRm.addClass("sapUiIdeaCardFlipTurn");
            } else {
                oRm.addClass("sapUiIdeaCardFlipInit");
            }
            oRm.writeClasses();
            

            if (oControl.getAriaLivePriority()) {
                oRm.writeAttribute("aria-live", oControl.getAriaLivePriority());
            }
            oRm.write(">");
            oRm.write("<div ");
            
            if (oControl.getComplexTabbing()) {
                oRm.writeAttribute("id", oControl.getId() + "_selector");
                oRm.writeAttribute("tabindex", "0");
                oRm.writeAttribute("aria-labelledby", oControl.getId() + "-idea-label");
            }

            oRm.addClass("sapUiIdeaCardFlipContainer");
            oRm.writeClasses();
            oRm.write(">");

            if (oControl.getComplexTabbing()) {
                oRm.write("<div");
                oRm.writeAttribute("tabindex", "0");
                oRm.writeAttribute("id", "sapUiInoAccessibleTabBeforeEntry" + oControl.getId());
                oRm.addClass("sapUiInoAccessibleTabBefore");
                oRm.writeClasses();
                oRm.write("></div>");
                oRm.write("<div");
                oRm.writeAttribute("tabindex", "0");
                oRm.writeAttribute("id", "sapUiInoAccessibleTabBeforeExit" + oControl.getId());
                oRm.addClass("sapUiInoAccessibleTabBefore");
                oRm.writeClasses();
                oRm.write("></div>");
                
                oRm.write("<div");
                oRm.writeAttribute("id", oControl.getId() + "-idea-label");
                oRm.addClass("sapUiInoIdeaCardAccessibleLabel");
                oRm.writeClasses();
                oRm.write(">");
                if (bIsDraft) {
                    oRm.writeEscaped(i18n.getText("CTRL_IDEACARD_EXP_ARIA_LABEL_DRAFT", [oControl.getTitle()]));
                }
                else {
                    var sVote = i18n.getText("CTRL_IDEACARD_EXP_ARIA_LABEL_VOTING_EXT_LIKE_NO");
                    if (oControl.getVoteType() === sap.ui.ino.models.object.Vote.TYPE_STAR) {
                        sVote = i18n.getText("CTRL_IDEACARD_EXP_ARIA_LABEL_VOTING_EXT_STAR", [oControl.getIdeaScore(), oControl.getMaxStarNo()]);
                    }
                    else if (oControl.getVoteType() === sap.ui.ino.models.object.Vote.TYPE_LIKE) {
                        sVote = i18n.getText("CTRL_IDEACARD_EXP_ARIA_LABEL_VOTING_EXT_LIKE", [oControl.getIdeaScore()]);
                    }
                    else if (oControl.getVoteType() === sap.ui.ino.models.object.Vote.TYPE_LIKE_DISLIKE) {
                        sVote = i18n.getText("CTRL_IDEACARD_EXP_ARIA_LABEL_VOTING_EXT_LIKE_DISLIKE", [oControl.getIdeaScoreLike(), oControl.getIdeaScoreDislike()]);
                    }
                    
                    oRm.writeEscaped(i18n.getText("CTRL_IDEACARD_EXP_ARIA_LABEL", [oControl.getTitle(), oControl.getPhaseText(), oControl.getCurrentStep() + 1, oControl.getProcessSteps(), oControl.getStatusText(), sVote, oControl.getCommentCount()]));
                }
                oRm.write("</div>");
            }

            oRm.write("<div");
            oRm.addClass("sapUiIdeaCard sapUiIdeaCardFlip");
            oRm.writeClasses();
            oRm.write(">");

            oControl._frontRenderer(oRm, oControl);
            oControl._backRenderer(oRm, oControl);

            oRm.write("</div>");

            if (oControl.getComplexTabbing()) {
                oRm.write("<div");
                oRm.writeAttribute("tabindex", "0");
                oRm.writeAttribute("id", "sapUiInoAccessibleTabAfterExit" + oControl.getId());
                oRm.addClass("sapUiInoAccessibleTabAfter");
                oRm.writeClasses();
                oRm.write("></div>");
                oRm.write("<div");
                oRm.writeAttribute("tabindex", "0");
                oRm.writeAttribute("id", "sapUiInoAccessibleTabAfterEntry" + oControl.getId());
                oRm.addClass("sapUiInoAccessibleTabAfter");
                oRm.writeClasses();
                oRm.write("></div>");
            }

            oRm.write("</div>");
            oRm.write("</div>");
        },

        onAfterRendering : function() {
            var oControl = this;

            jQuery(this.$().find(".sapUiIdeaCardFlipFrontMediaVideo")).click(function(event) {
                return oControl.togglePlay(event);
            });
            jQuery(this.$().find(".sapUiIdeaCardFlipFrontMediaVideoOverlay")).click(function(event) {
                return oControl.togglePlay(event);
            });

            var videoDOM = document.getElementById("video_" + this.getId());
            if (videoDOM) {
                videoDOM.onended = function() {
                    var overlay = jQuery(oControl.$().find(".sapUiIdeaCardFlipFrontMediaVideoOverlay"))[0];
                    jQuery(overlay).css("opacity", 1);
                    videoDOM.load();
                    oControl.getAggregation("_videoButton").focus();
                };
            }
            if (this.getImageSrc() && !(oControl.getEditMode() && oControl.getFileUploader())) {
                var preview = jQuery(this.getDomRef()).find(".sapUiIdeaCardFlipFrontMediaImage");
                jQuery(preview).css("background-image", "url(" + this.getImageSrc() + ")");
            }
            var sColor = oControl.getCampaignColor();
            if (sColor && sColor.length === 6) {
                var sTextColorStyle = "sapUiIdeaCardCampaignTitle" + ColorSupport.calculateTitleTextColor(sColor.substr(0, 2), sColor.substr(2, 2), sColor.substr(4, 2));
                var aCampaignLink = jQuery(oControl.getDomRef()).find(".sapUiIdeaCardCampaignLink");
                aCampaignLink.addClass(sTextColorStyle);
                var aCampaignTitle = jQuery(oControl.getDomRef()).find(".sapUiIdeaCardCampaignTitle");
                aCampaignTitle.addClass(sTextColorStyle);
            }

            sap.ui.ino.controls.AccessibilitySupport.prototype.onAfterRendering.apply(this, arguments);
        },

        flip : function(bFocusChange) {
            var card = document.getElementById(this.getId());
            var regExp = new RegExp('(\\s|^)sapUiIdeaCardFlipTurn(\\s|$)');
            if (card.className.match(regExp)) {
                card.className = card.className.replace(new RegExp('(\\s|^)sapUiIdeaCardFlipTurnDelay(\\s|$)'), ' ');
                card.className = card.className.replace(new RegExp('(\\s|^)sapUiIdeaCardFlipTurn(\\s|$)'), ' ');
                card.className += " sapUiIdeaCardFlipInit";
                card.className = card.className.replace('  ', ' ');
            } else {
                card.className = card.className.replace(new RegExp('(\\s|^)sapUiIdeaCardFlipInit(\\s|$)'), ' ');
                card.className += " sapUiIdeaCardFlipTurn sapUiIdeaCardFlipTurnDelay";
                card.className = card.className.replace('  ', ' ');
            }
            this.isFront = !this.isFront;

            if (bFocusChange) {
                var $this = this.$();
                var that = this;
                // set the focus to the now shown flip button
                var aFlipButtons = $this.find(".sapUiIdeaCardFlipButton");
                // due to the dom representation the first button is the front button
                setTimeout(function() {
                    jQuery(aFlipButtons[that.isFront ? 0 : 1]).focus();
                }, 320); // TODO that's ugly due to dependency to CSS, but it looks like the focus only works after
                // the animation
            }
        },

        showsFront : function() {
            return this.isFront;
        },

        togglePlay : function(event) {
            var video = document.getElementById("video_" + this.getId());
            if (jQuery(video).hasClass("sapUiIdeaCardFlipFrontMediaVideoOverlay")) {
                video = jQuery(video).parent().find(".sapUiIdeaCardFlipFrontMediaVideo")[0];
            }
            var overlay = jQuery(video).parent().find(".sapUiIdeaCardFlipFrontMediaVideoOverlay")[0];
            var oVideoButton = jQuery(this.getAggregation("_videoButton").getDomRef());
            if (video.paused) {
                if (this.getEditMode()) {
                    jQuery(oVideoButton).removeClass("sapUiInoIdeaCard_play");
                    jQuery(oVideoButton).addClass("sapUiInoIdeaCard_pause");
                } else {
                    jQuery(overlay).css("opacity", 0);
                }
                video.play();
            } else {
                jQuery(oVideoButton).removeClass("sapUiInoIdeaCard_pause");
                jQuery(oVideoButton).addClass("sapUiInoIdeaCard_play");
                jQuery(overlay).css("opacity", 1);
                video.pause();
            }
            if (event) {
                event.stopPropagation();
            } else {
                window.event.cancelBubble = true;
            }
            return false;
        },

        _convertDescriptionText : function(sText) {
            jQuery.sap.assert(typeof sText === "string", "sText must be a string");
            // remove tags from text
            sText = jQuery("<p>" + sText + "</p>").text();
            sText = jQuery.trim(sText);
            sText = jQuery.sap.encodeHTML(sText);

            return sText;
        },

        handleActionFirst : function(oEvent) {
            if (!this.isFront) {
                this.flip(false);
            }
            return sap.ui.ino.controls.AccessibilitySupport.prototype.handleActionFirst.apply(this, [oEvent]);
        },

        handleActionLast : function(oEvent) {
            if (this.isFront) {
                this.flip(false);
            }
            return sap.ui.ino.controls.AccessibilitySupport.prototype.handleActionLast.apply(this, [oEvent]);
        },

        _handleAction : function(oEvent, bNext) {
            var $this = this.$();
            // only walk through the currently displayed card side
            // due to the dom representation the first button is the front button
            var aFlipButtons = $this.find(".sapUiIdeaCardFlipButton");
            var oLast = jQuery(aFlipButtons[this.isFront ? 0 : 1]); // included
            var oBefore = this.isFront ? $this.find("#sapUiInoAccessibleTabBeforeExit" + this.getId()) : jQuery(aFlipButtons[0]);

            var aAll = $this.find("[tabindex=0]");
            var iLast = aAll.index(oLast);
            var iBefore = aAll.index(oBefore);

            // for the fileuploader we would need the srcElement here, but that is not supported in FF
            // therefore this special handling
            var oCurrent = jQuery(oEvent.srcControl.getFocusDomRef());
            var iIndex = aAll.index(oCurrent);
            if (iIndex === -1) {
                var oChildren = oCurrent.find("[tabindex=0]");
                if (oChildren && oChildren.length > 0) {
                    iIndex = aAll.index(oChildren[0]);
                }
            }

            if (bNext) {
                if (iIndex === -1) {
                    // current focus is on the container => focus first element
                    iIndex = iBefore;
                }

                if (iIndex === iLast) {
                    iIndex = iBefore;
                }

                oCurrent = aAll[iIndex + 1];
            } else {
                if (iIndex === -1) {
                    iIndex = iLast + 1;
                }

                if (iIndex === iBefore + 1) {
                    iIndex = iLast + 1;
                }

                oCurrent = aAll[iIndex - 1];
            }

            oCurrent.focus();
            return true;
        },

        handleActionNext : function(oEvent) {
            return this._handleAction(oEvent, true);
        },

        handleActionPrevious : function(oEvent) {
            return this._handleAction(oEvent, false);
        },

        handleNoActionSpace : function(oEvent) {
            this.flip(false);
            return true;
        },

        setActionMode : function(bAction) {
            this._bActionMode = bAction;
        },

        enterActionMode : function(oEvent) {
            // select idea title when entering action mode
            var $this = this.$();
            var aEnter = $this.find(".sapUiIdeaCardTitleLink");
            this._bActionMode = true;
            if (aEnter.length > 1) {
                var oEnter = jQuery(aEnter[this.isFront ? 0 : 1]);
                oEnter.focus();
                return true;
            } else {
                return sap.ui.ino.controls.AccessibilitySupport.prototype.enterActionMode.apply(this, [oEvent]);
            }
        }

    });
})();