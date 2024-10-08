/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ino/controls/util/ColorSupport",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Label",
    "sap/m/Link",
    "sap/m/Text",
    "sap/ui/core/HTML",
    "sap/ui/core/TextAlign",
    "sap/ui/core/Icon",
    "sap/ino/controls/VoteType",
	"sap/base/security/sanitizeHTML"
], function(Control,
    ColorSupport,
    Button,
    ButtonType,
    Label,
    Link,
    Text,
    HTML,
    TextAlign,
    Icon,
    VoteType,
    sanitizeHTML) {
    "use strict";

    /**
     *
     * Constructor for the IdeaCard, a visual representation of an Idea. It can be used as an item (with renderer) within a list or as a
     * preview during idea creation etc.
     *
     * <ul>
     * <li>Properties
     * <ul>
     * <li>ideaDescription: idea description</li>
     * <li>ideaId: idea id</li>
     * <li>ideaName: name of the idea</li>
     * <li>ideaSubmittedAt: timestamp of the idea submission</li>
     * <li>ideaSubmitter: full name of the idea submitter</li>
     * <li>ideaSubmitterId: id of the idea's submitter</li>
     * <li>isDraft: is the idea in state draft</li>
     * <li>color: color of the campaign</li>
     * <li>campaignId: id of the campaign</li>
     * <li>campaignHref: URL of the campaign</li>
     * <li>campaignName: name of the campaign</li>
     * </ul>
     * </li>
     * <li>Aggregations
     * <ul>
     * <li>processPlaceholder: placeholder for process indicator</li>
     * <li>voteDisplayPlaceholder: placeholder for vote</li>
     * <li>commentPlaceholder: placeholder for comment control</li>
     * <li>image: placeholder for an image representation control</li>
     * <li>_campaignLink: aggregation storing the control rendering the campaign link</li>
     * <li>_campaignLinkBack: aggregation holds a control representing a link to idea's campaign</li>
     * <li>_ideaLink: aggregation holds a control representing a link to idea</li>
     * <li>_ideaLinkBack: aggregation holds a control representing a link to idea on the back side</li>
     * <li>_ideaDescription: aggregation holds a control representing an idea description</li>
     * <li>_ideaSubmitter: aggregation holds a control representing an idea's submitter</li>
     * <li>_ideaMoreLink: aggregation holds a control representing a link to idea</li>
     * <li>_flipButton: aggregation holds a control flipping the card to back</li>
     * <li>_commentButton: aggregation holds a control representing a navigation to idea comment section</li>
     * <li>_flipButtonBack: aggregation holds a control flipping the card to face</li>
     * <li>_draftLabel: aggregation holds a control representing the Draft label</li>
     * <li>_noticeStatusIcon: aggregation holds a control representing the notice status icon</li>
     * <li>_noticeCommentIcon: aggregation holds a control representing the notice comment icon</li>
     * <li>_noticeUpdateIcon: aggregation holds a control representing the notice update icon</li>
     * <li>_noticeCreateIcon: aggregation holds a control representing the notice create icon</li>
     * <li>_IdeaReadButton: aggregation holds a control representing the idea read Btn</li>
     * </ul>
     * </li>
     * <li>Events
     * <ul>
     * <li>openIdea: event is thrown when idea details are to be opened</li>
     * <li>openSubmitter: event is thrown when the idea's submitter details are to be opened</li>
     * <li>openCampaign: event is thrown when the campaign details are to be opened</li>
     * <li>press: event is thrown when the control istapped</li>
     * </ul>
     * </li>
     * </ul>
     * 
     * @class The IdeaCard is a representation of an Idea. It can be used as an item (with renderer) within a list or as a preview during idea creation etc.
     * @extends sap.ino.controls.Card
     * @version 1.3.0
     * 
     * @constructor
     * @public
     * @name sap.ino.controls.IdeaCard
     */
    var IdeaCard = Control.extend("sap.ino.controls.IdeaCard", {
        metadata: {
            properties: {
                "ideaCreatedAt": {
                    type: "string"
                },
                "ideaDescription": {
                    type: "string"
                },
                "ideaHref": {
                    type: "sap.ui.core.URI"
                },
                "ideaId": {
                    type: "int"
                },
                "ideaName": {
                    type: "string"
                },
                "ideaSubmittedAt": {
                    type: "string"
                },
                "ideaSubmitter": {
                    type: "string"
                },
                "ideaSubmitterId": {
                    type: "int"
                },
                "ideaSubmitterHref": {
                    type: "sap.ui.core.URI"
                },
                "isDraft": {
                    type: "boolean"
                },
                "isOpenForContributors": {
                    type: "boolean"
                },
                "color": {
				    type: "sap.ui.core.CSSColor"
				},
				"campaignId": {
				    type: "int"
				},
				"campaignHref": {
				    type: "sap.ui.core.URI"
				},
				"campaignName": {
				    type: "string"
				}
            },
            aggregations: {
                "commentDisplayPlaceholder": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "processDisplayPlaceholder": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "viewDisplayPlaceholder": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "anonymousDisplayPlaceholder": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "voteDisplayPlaceholder": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "votePlaceholder": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "followButton": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "image": {
                    type: "sap.m.Image",
                    multiple: false
                },
                "_campaignLink": {
                    type: "sap.m.Link",
                    multiple: false,
                    visibility: "hidden"
                },
                "_campaignLinkBack": {
                    type: "sap.m.Link",
                    multiple: false,
                    visibility: "hidden"
                },
                "_draftLabel": {
                    type: "sap.m.Label",
                    multiple: false,
                    visibility: "hidden"
                },                
                "_ideaDescription": {
                    type: "sap.ui.core.HTML",
                    multiple: false,
                    visibility: "hidden"
                },
                "_ideaLink": {
                    type: "sap.m.Link",
                    multiple: false,
                    visibility: "hidden"
                },
                "_ideaLinkBack": {
                    type: "sap.m.Link",
                    multiple: false,
                    visibility: "hidden"
                },
                "_ideaMoreLink": {
                    type: "sap.m.Link",
                    multiple: false,
                    visibility: "hidden"
                },
                "_ideaSubmitter": {
                    type: "sap.m.Link",
                    multiple: false,
                    visibility: "hidden"
                },
                "_flipButton": {
                    type: "sap.m.Button",
                    multiple: false,
                    visibility: "hidden"
                },
                "_commentButton": {
                    type: "sap.m.Button",
                    multiple: false,
                    visibility: "hidden"
                },
                "_flipButtonBack": {
                    type: "sap.m.Button",
                    multiple: false,
                    visibility: "hidden"
                },
                "contributorButton": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "_noticeStatusIcon" : {
                    type : "sap.ui.core.Icon",
                    multiple : false,
                    visibility : "hidden"
                },
                "_noticeCommentIcon" : {
                    type : "sap.ui.core.Icon",
                    multiple : false,
                    visibility : "hidden"
                },
                "_noticeUpdateIcon" : {
                    type : "sap.ui.core.Icon",
                    multiple : false,
                    visibility : "hidden"
                },
                "_noticeCreateIcon" : {
                    type : "sap.ui.core.Icon",
                    multiple : false,
                    visibility : "hidden"
                },
                "_IdeaReadButton": {
                    type: "sap.m.Button",
                    multiple: false,
                    visibility: "hidden"
                }
            },
            events: {
                openIdea: {},
                openSubmitter: {},
                press : {},
                openCampaign : {},
                openIdeaComment: {},
                readIdea:{}
            }
        },
        
        init: function () {
            this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.controls");
            this.isFront = true;
		},
		
		_getCampaignLink: function(sAggregationNameSuffix) {
            var that = this;
            var sAggregationName = "_campaignLink";
            if (sAggregationNameSuffix) {
                sAggregationName += sAggregationNameSuffix;
            }
            var oCampaignLink = this.getAggregation(sAggregationName);
            var sCampaignName = this.getProperty("campaignName");
            if (!oCampaignLink) {
                oCampaignLink = new Link({
                    id : this.getId() + sAggregationName,
                    href : this.getProperty("campaignHref"),
                    press : function(oEvent) {
                        // prevent href
                        oEvent.preventDefault();
                        that.fireOpenCampaign({campaignId: that.getProperty("campaignId")});
                    },
                    text: sCampaignName
                }).addStyleClass("sapInoIdeaCardAccessibilityCampaignLink");
                this.setAggregation(sAggregationName, oCampaignLink, true);
            }
            return oCampaignLink;
		},
        
        /*
         * Accessing aggregations
         */
        _getIdeaLink: function(sAggregationNameSuffix) {
            var that = this;
            var sAggregationName = "_ideaLink";
            if (sAggregationNameSuffix) {
                sAggregationName += sAggregationNameSuffix;
            }
            var oIdeaLink = this.getAggregation(sAggregationName);
            var sIdeaName = this.getProperty("ideaName");
            if (!oIdeaLink) {
                oIdeaLink = new Link({
                    id: this.getId() + sAggregationName,
                    href: this.getProperty("ideaHref"),
                    press: function(oEvent) {
                        // prevent href
                        oEvent.preventDefault();
                        
                        that.fireOpenIdea({
                            ideaId: that.getProperty("ideaId")
                        });
                    }//,
                    //text: sIdeaName
                }).setText(sIdeaName).addStyleClass("sapInoIdeaCardAccessibilityIdeaLink");
                this.setAggregation(sAggregationName, oIdeaLink, true);
            }
            if(this.getProperty("ideaHref")){
               oIdeaLink.setHref(this.getProperty("ideaHref"));
            }
            return oIdeaLink;
        },

        _getIdeaDescription: function() {
            var oIdeaDescription = this.getAggregation("_ideaDescription");
            if (!oIdeaDescription) {
                oIdeaDescription = new HTML({
                    content: "<span>" + (this.getProperty("ideaDescription") || "") + "</span>",
                    sanitizeContent: true,
                    preferDOM: false
                });
                this.setAggregation("_ideaDescription", oIdeaDescription, true);
            }
            return oIdeaDescription;
        },

        _getIdeaSubmitter: function() {
            var that = this;
            var oIdeaSubmitter = this.getAggregation("_ideaSubmitter");
            if (!oIdeaSubmitter) {
                oIdeaSubmitter = new Link({
                    id: this.getId() + "_ideaSubmitter",
                    press: function(oEvent) {
                        // prevent href to being used
                        oEvent.preventDefault();
                        
                        that._bIsFlipped = true;
                        that.fireOpenSubmitter({
                            ideaSubmitterId: that.getProperty("ideaSubmitterId")
                        });
                    },
                    // href to be used to open identity in new window
                    href : this.getProperty("ideaSubmitterHref"),
                    text: that._getIdeaSubmitterText()
                }).addStyleClass("sapInoIdeaCardAccessibilitySubmitter");
                this.setAggregation("_ideaSubmitter", oIdeaSubmitter, true);
            }
            return oIdeaSubmitter;
        },
        
        _getIdeaSubmitterText : function(){
            return this._oRB.getText("CTRL_IDEACARD_FLD_SUBMITTED_BY", [this.getProperty("ideaSubmitter"), this.getProperty("ideaSubmittedAt") || this.getProperty("ideaCreatedAt")]);
        },

        _getDraftLabel: function() {
            var that = this;
            var oDraftLabel = this.getAggregation("_draftLabel");
            if (!oDraftLabel) {
                oDraftLabel = new Label({
                    id: this.getId() + "_draftLabel",
                    text: that._oRB.getText("CTRL_IDEACARD_TIT_DRAFT"),
                    tooltip: that._oRB.getText("CTRL_IDEACARD_TIT_DRAFT"),
                    textAlign: TextAlign.Center
                });
                this.setAggregation("_draftLabel", oDraftLabel, true);
            }
            return oDraftLabel;
        },

        _getIdeaMoreLink: function(sAggregationNameSuffix) {
            var that = this;
            var sAggregationName = "_ideaMoreLink";
            if (sAggregationNameSuffix) {
                sAggregationName += sAggregationNameSuffix;
            }
            var oIdeaMoreLink = this.getAggregation(sAggregationName);
            var sIdeaName = this.getProperty("ideaName");
            if (!oIdeaMoreLink) {
                oIdeaMoreLink = new Link({
                    id: this.getId() + sAggregationName,
                    href: that.getProperty("ideaHref"),
                    press: function(oEvent) {
                        // prevent href
                        oEvent.preventDefault();
                        
                        that.fireOpenIdea({
                            ideaId: that.getProperty("ideaId")
                        });
                    },
                    text: that._oRB.getText("CTRL_IDEACARD_XLNK_MORE")/*,
                    tooltip: that._oRB.getText("CTRL_IDEACARD_ALT_IDEA_TOOLTIP", [sIdeaName])*/
                }).setTooltip(that._oRB.getText("CTRL_IDEACARD_ALT_IDEA_TOOLTIP", [sIdeaName])).addStyleClass("sapInoIdeaCardAccessibilityMoreButton");
                this.setAggregation(sAggregationName, oIdeaMoreLink, true);
            }
            return oIdeaMoreLink;
        },

        _getFlipButton: function(sAggregationNameSuffix) {
            var that = this;
            var sAggregationName = "_flipButton";
            if (sAggregationNameSuffix) {
                sAggregationName += sAggregationNameSuffix;
            }
            var oFlipButton = this.getAggregation(sAggregationName);
            if (!oFlipButton) {
                oFlipButton = new Button({
                    type: ButtonType.Transparent,
                    icon: "sap-icon://redo",
                    tooltip: that._oRB.getText("CTRL_IDEACARD_BUT_FLIP_BUTTON"),
                    press: function() {
                        that._flip();
                    },
                    enabled: true
                }).addStyleClass("sapInoIdeaCardAccessibilityFlipButton" + sAggregationNameSuffix);
                this.setAggregation(sAggregationName, oFlipButton, true);
            }
            return oFlipButton;
        },
        
        _getCommentButton: function(sAggregationNameSuffix) {
            var that = this;
            var sAggregationName = "_commentButton";
            if (sAggregationNameSuffix) {
                sAggregationName += sAggregationNameSuffix;
            }
            var oCommentButton = this.getAggregation(sAggregationName);
            if (!oCommentButton) {
                oCommentButton = new Button({
                    type: ButtonType.Transparent,
                    icon: "sap-icon://comment",
                    tooltip: {parts:[{path: 'data>COMMENT_HAS_PRIVILEGE'},{path:'data>PARTICIPANT_CAN_COMMENT'},{path:'data>OPEN_STATUS_SETTING'}],
                              formatter: function(iCommentHasPrivilege,iCanComment,iOpenStatusSetting){
                                var bStatusComment = iOpenStatusSetting > 0 && iCommentHasPrivilege > 0 || !iOpenStatusSetting;  
                                if(iCanComment > 0 && bStatusComment){
                                    return that._oRB.getText("CTRL_IDEACARD_BUT_COMMENT_BUTTON");
	                            }
	                            return that._oRB.getText("VOTE_MSG_COMMENT_NO_PRIVILEGE");
                              }},
                    press: function() {
                        that.fireOpenIdeaComment({
                            ideaId: that.getProperty("ideaId")
                        });
                    },
                    enabled: {parts:[{path: 'data>COMMENT_HAS_PRIVILEGE'},{path:'data>PARTICIPANT_CAN_COMMENT'},{path:'data>OPEN_STATUS_SETTING'}],
                              formatter: function(iCommentHasPrivilege,iCanComment,iOpenStatusSetting){
                                var bStatusComment = iOpenStatusSetting > 0 && iCommentHasPrivilege > 0 || !iOpenStatusSetting;  
                                return iCanComment > 0 && bStatusComment;
                              }}
                }).addStyleClass("sapInoIdeaCardBottomRibbonContent sapInoIdeaCardAccessibilityCommentButton");
                this.setAggregation(sAggregationName, oCommentButton, true);
            }
            return oCommentButton;
        },

        _getIdeaReadButton: function() {
            var that = this;
            var sAggregationName = "_IdeaReadButton";
            var oIdeaReadButton = this.getAggregation(sAggregationName);
            if (!oIdeaReadButton) {
                oIdeaReadButton = new Button({
                    type: ButtonType.Transparent,
                    icon: "sap-icon://InoIcons/idea_read",
                    tooltip: that._oRB.getText("IDEA_LIST_FLD_READ"),
                    press: function() {
                        that.fireReadIdea({
                            ideaId: that.getProperty("ideaId")
                        });
                    },
                    visible: "{= !!${data>SHOW_UPDATED_VIEWER} || !!${data>SHOW_COMMENT_VIEWER} || !!${data>SHOW_STATUSCHANGE_VIEWER}}"
                }).addStyleClass("ideaNoticeReadButton");
                this.setAggregation(sAggregationName, oIdeaReadButton, true);
            }
            return oIdeaReadButton;
        },

        _getNoticeStatusIcon : function() {
            var that = this;
            var oNoticeStatusIcon = this.getAggregation("_noticeStatusIcon");
            if (!oNoticeStatusIcon) {
                oNoticeStatusIcon = new Icon({
                    src : "sap-icon://InoIcons/new_status",
                    tooltip: that._oRB.getText("IDEA_LIST_ITEM_IDEA_STATUS"),
                    size: "1.5rem",
                    visible: "{= !!${data>SHOW_STATUSCHANGE_VIEWER}}",
                    press: function() {
                        that.fireOpenIdea({
                            ideaId: that.getProperty("ideaId")
                        });
                    }
                }).addStyleClass("ideaNoticeStatusIcon");
                this.setAggregation("_noticeStatusIcon", oNoticeStatusIcon, true);
            }
            return oNoticeStatusIcon;
        },

        _getNoticeCommentIcon : function() {
            var that = this;
            var oNoticeCommentIcon = this.getAggregation("_noticeCommentIcon");
            if (!oNoticeCommentIcon) {
                oNoticeCommentIcon = new Icon({
                    src : "sap-icon://InoIcons/new_comment",
                    tooltip: that._oRB.getText("IDEA_LIST_ITEM_IDEA_COMMENT"),
                    size: "1.5rem",
                    visible: "{= !!${data>SHOW_COMMENT_VIEWER}}",
                    press: function() {
                        that.fireOpenIdeaComment({
                            ideaId: that.getProperty("ideaId")
                        });
                    }
                }).addStyleClass("ideaNoticeCommentIcon");
                this.setAggregation("_noticeCommentIcon", oNoticeCommentIcon, true);
            }
            return oNoticeCommentIcon;
        },

        _getNoticeUpdateIcon : function() {
            var that = this;
            var oNoticeUpdateIcon = this.getAggregation("_noticeUpdateIcon");
            if (!oNoticeUpdateIcon) {
                oNoticeUpdateIcon = new Icon({
                    src : "sap-icon://InoIcons/idea_update",
                    tooltip: that._oRB.getText("IDEA_LIST_ITEM_IDEA_UPDATE"),
                    size: "1.5rem",
                    visible: "{= !!${data>SHOW_UPDATED_VIEWER}}",
                    press: function() {
                        that.fireOpenIdea({
                            ideaId: that.getProperty("ideaId")
                        });
                    }
                }).addStyleClass("ideaNoticeUpdateIcon");
                this.setAggregation("_noticeUpdateIcon", oNoticeUpdateIcon, true);
            }
            return oNoticeUpdateIcon;
        },
        
        _getNoticeCreateIcon : function() {
            var that = this;
            var oNoticeCreateIcon = this.getAggregation("_noticeCreateIcon");
            if (!oNoticeCreateIcon) {
                oNoticeCreateIcon = new Icon({
                    src : "sap-icon://InoIcons/idea_create",
                    tooltip: that._oRB.getText("IDEA_LIST_ITEM_IDEA_CREATE"),
                    size: "1.5rem",
                    visible: "{= !!${data>SHOW_CREATED_VIEWER}}",
                    press: function() {
                        that.fireOpenIdea({
                            ideaId: that.getProperty("ideaId")
                        });
                    }
                }).addStyleClass("ideaNoticeCreateIcon");
                this.setAggregation("_noticeCreateIcon", oNoticeCreateIcon, true);
            }
            return oNoticeCreateIcon;
        },

        _flip: function() {
            var oFlipper = this._getFlipper(this);
            if (oFlipper) {
                this._bIsFlipped = !this._bIsFlipped;
                oFlipper.classList.toggle("flip");
                if (!jQuery(oFlipper).hasClass("flip")) {
                    this._getFlipButton().focus();
                } else {
                    this._getFlipButton("Back").focus();
                }
            }
        },

        _getFlipper: function(oControl) {
            var aFlipper = oControl.$().find(".sapInoIdeaCardFlipContainer");
            if (aFlipper && aFlipper.length > 0) {
                return aFlipper[0];
            }
            return undefined;
        },
        
        onAfterRendering: function() {
            if (Control.prototype.onAfterRendering) {
                Control.prototype.onAfterRendering.apply(this, arguments);
            }
            
            this.initTabIndex();
            
            this.setAccessibility();
            
            this._initTabs();
        },

        setAccessibility: function(){
            var li = this.getParent();
            if(li && li.attachBrowserEvent){
                li.attachBrowserEvent('focus', function(event){
                    var target = event.target;
                    $(target).find('.ideaListFollow button').attr("tabindex", "0");
                });
                li.attachBrowserEvent('blur', function(event){
                    var target = event.target;
                    var starVote = $(target).find('.starVote');
                    $(target).find('.ideaListFollow button').attr('tabindex', '-1');
                    if(starVote && starVote.length){
                        starVote.attr('tabindex', '-1');
                    }
                });
            }
        },

        initTabIndex: function(){
            // required for accessibility => List tabbing
            this._getIdeaLink().$().attr("tabindex", "-1");
            this._getIdeaLink("Back").$().attr("tabindex", "-1");
            this._getFlipButton().$().attr("tabindex", "-1");
            this._getCommentButton().$().attr("tabindex", "-1");
            this._getFlipButton("Back").$().attr("tabindex", "-1");
            this._getCampaignLink().$().attr("tabindex", "-1");
            this._getCampaignLink("Back").$().attr("tabindex", "-1");
            this._getIdeaMoreLink().$().attr("tabindex", "-1");
            this._getIdeaSubmitter().$().attr("tabindex", "-1");
            
            //this.getAggregation("votePlaceholder").$().attr('tabindex', '-1');
            this.getAggregation("votePlaceholder").$().find('.starVote, button').attr('tabindex', '-1');
            this.getAggregation("followButton").$().find('button').attr("tabindex", "-1");
            this.getAggregation("contributorButton").$().find('button').attr("tabindex", "-1");
        },

        renderer: function (oRM, oControl) {
		    oRM.write("<div");
		    oRM.writeControlData(oControl);
			oRM.addClass("sapInoIdeaCard");
			oRM.addClass("sapUiSizeCompact");
			oRM.writeClasses();
			oRM.write(">");
			
			oControl._renderContent(oRM, oControl);

			oRM.write("</div>");
		},

        _renderContent: function(oRM, oControl) {
            oRM.write("<div");
            oRM.addClass("sapInoIdeaCardFlipContainer");
            if (this._bIsFlipped) {
                oRM.addClass("flip");
            }

            oRM.writeClasses();
            oRM.write(">");

            oRM.write("<div");
            oRM.addClass("sapInoIdeaCardFlipper");
            oRM.writeClasses();
            oRM.write(">");

            oControl._renderFrontContent(oRM, oControl);
            oControl._renderBackContent(oRM, oControl);

            oRM.write("</div>");

            oRM.write("</div>");
        },
        
        _renderImage: function(oRM, oControl) {
		    var oImage = oControl.getAggregation("image");
            if(oImage) {
                oRM.renderControl(oImage);
            }
		},
		

        /*
         * Rendering the card front face
         */
        _renderFrontContent: function(oRM, oControl) {
            oRM.write("<div");
            oRM.addClass("sapInoIdeaCardFront");
            oRM.writeClasses();
            oRM.write(">");

            oControl._renderTopRibbon(oRM, oControl);
            oControl._renderImage(oRM, oControl);
            oControl._renderTopPlaceholder(oRM, oControl);
            oControl._renderIdeaLink(oRM, oControl);
            oControl._renderBottomPlaceholder(oRM, oControl);
            oControl._renderIdeaNoticeIcon(oRM, oControl);
            oControl._renderBottomRibbon(oRM, oControl);
            oControl._renderFollowButton(oRM, oControl);
            oRM.write("</div>");
        },

        /*
         * Rendering the card front face
         */
        _renderBackContent: function(oRM, oControl) {
            oRM.write("<div");
            oRM.addClass("sapInoIdeaCardBack");
            oRM.writeClasses();
            oRM.write(">");

            oControl._renderTopRibbon(oRM, oControl, true);
            oControl._renderIdeaLink(oRM, oControl, true);
            oControl._renderIdeaSubmitter(oRM, oControl);
            oControl._renderIdeaDescription(oRM, oControl);
            oControl._renderIdeaMoreLink(oRM, oControl);
            oControl._renderBottomRibbon(oRM, oControl, true);

            oRM.write("</div>");
        },

        _renderIdeaLink: function(oRM, oControl, bRenderBack) {
            oRM.write("<div");
            oRM.addClass("sapInoIdeaCardIdeaLink");
            oRM.writeClasses();
            oRM.write(">");
            
            oRM.write("<div");
            oRM.addClass("sapInoIdeaCardIdeaLinkTooltip");
            oRM.writeAttributeEscaped("title", oControl._oRB.getText("CTRL_IDEACARD_ALT_IDEA_TOOLTIP", [this.getProperty("ideaName")]));
            oRM.writeClasses();
            oRM.write(">");

            if (bRenderBack) {
                oRM.renderControl(oControl._getIdeaLink("Back"));
            } else {
                oRM.renderControl(oControl._getIdeaLink());
            }
            
            oRM.write("</div>");
            
            if (this.getProperty("isOpenForContributors")) {
                oRM.renderControl(new Icon({
                    src: "sap-icon://InoIcons/shake_hands",
                    tooltip: oControl._oRB.getText("CTRL_IDEACARD_ALT_OPEN_CONTRIBUTION_TOOLTIP")
                }));
            }
            
            oRM.write("</div>");
        },

        _renderTopPlaceholder: function(oRM, oControl) {
            oRM.write("<div");
            oRM.addClass("sapInoIdeaCardTopPlaceholder");
            oRM.writeClasses();
            oRM.write(">");

            var oVoteDisplayPlaceholderControl = oControl.getAggregation("voteDisplayPlaceholder");
            if (oVoteDisplayPlaceholderControl) {
                oRM.renderControl(oVoteDisplayPlaceholderControl);
            }

            var oCommentDisplayPlaceholderControl = oControl.getAggregation("commentDisplayPlaceholder");
            if (oCommentDisplayPlaceholderControl) {
                oRM.renderControl(oCommentDisplayPlaceholderControl);
            }

            var oViewDisplayPlaceholderControl = oControl.getAggregation("viewDisplayPlaceholder");
            if (oViewDisplayPlaceholderControl) {
                oRM.renderControl(oViewDisplayPlaceholderControl);
            }
            
            var oAnonymousPlaceholderControl = oControl.getAggregation("anonymousDisplayPlaceholder");
            if (oAnonymousPlaceholderControl) {
                oRM.renderControl(oAnonymousPlaceholderControl);
            }

            oRM.write("</div>");
        },
        
        _renderBottomPlaceholder: function(oRM, oControl) {
            oRM.write("<div");
            oRM.addClass("sapInoIdeaCardBottomPlaceholder");
            oRM.writeClasses();
            oRM.write(">");

            if (oControl.getProperty("isDraft")) {
                oControl._renderDraftLabel(oRM, oControl);
            } else {
                var oProcessDisplayPlaceholderControl = oControl.getAggregation("processDisplayPlaceholder");
                if (oProcessDisplayPlaceholderControl) {
                    oRM.renderControl(oProcessDisplayPlaceholderControl);
                }
            }

            oRM.write("</div>");
        },

        _renderIdeaNoticeIcon: function(oRM, oControl) {
            oRM.write("<div");
            oRM.addClass("sapInoIdeaNoticeIconPlaceholder");
            oRM.writeClasses();
            oRM.write(">");
            oRM.renderControl(oControl._getNoticeStatusIcon());
            oRM.renderControl(oControl._getNoticeCommentIcon());
            oRM.renderControl(oControl._getNoticeUpdateIcon());
            //oRM.renderControl(oControl._getNoticeCreateIcon());
            oRM.write("</div>");
        },

        _renderFollowButton: function(oRM, oControl){
            oRM.write("<div");
            oRM.write(">");
    
            var oFollowButton = oControl.getAggregation("followButton");
            
            oRM.renderControl(oFollowButton);

            oRM.write("</div>");
        },
        
        _renderContributorButton: function(oRM, oControl){
            var contributorButton = oControl.getAggregation("contributorButton");
            contributorButton.addStyleClass("sapInoIdeaCardBottomRibbonContent sapInoIdeaCardAccessibilityContributorButton");
            oRM.renderControl(contributorButton);
        },
        
        _renderDraftLabel: function(oRM, oControl) {
            oRM.write("<div");
            oRM.addClass("sapInoIdeaCardDraftLabel");
            oRM.writeClasses();
            oRM.write(">");
            var oDraftLabel = oControl._getDraftLabel();
            oRM.renderControl(oDraftLabel);
            oRM.write("</div>");
        },

        _renderIdeaSubmitter: function(oRM, oControl) {
            oRM.write("<div");
            oRM.addClass("sapInoIdeaCardIdeaSubmitter");
            oRM.writeClasses();
            oRM.write(">");
            var oIdeaSubmitter = oControl._getIdeaSubmitter();
            oRM.renderControl(oIdeaSubmitter);
            oRM.write("</div>");
        },

        _renderIdeaDescription: function(oRM, oControl) {
            oRM.write("<div");
            oRM.addClass("sapInoIdeaCardIdeaDescription");
            oRM.writeClasses();
            oRM.write(">");
            var oIdeaDescription = oControl._getIdeaDescription();
            oRM.renderControl(oIdeaDescription);
            oRM.write("</div>");
        },

        _renderIdeaMoreLink: function(oRM, oControl) {
            oRM.write("<div");
            oRM.addClass("sapInoIdeaCardIdeaMoreLink");
            oRM.writeClasses();
            oRM.write(">");

            oRM.write("<div");
            oRM.addClass("sapInoIdeaCardIdeaMoreLinkTooltip");
            oRM.writeAttributeEscaped("title", oControl._oRB.getText("CTRL_IDEACARD_ALT_IDEA_TOOLTIP", [this.getProperty("ideaName")]));
            oRM.writeClasses();
            oRM.write(">");

            var oIdeaMoreLink = oControl._getIdeaMoreLink();
            oRM.renderControl(oIdeaMoreLink);
            oRM.write("</div>");
            
            oRM.write("</div>");
        },

        _renderBottomRibbon: function(oRM, oControl, bRenderBack) {
            oRM.write("<div");
            oRM.addClass("sapInoIdeaCardRibbon");
            oRM.addClass("sapInoIdeaCardBottomRibbon");
            oRM.writeClasses();
            oRM.write(">");

            if (!bRenderBack) {
                var oVotePlaceholderControl = oControl.getAggregation("votePlaceholder");
                if (oVotePlaceholderControl) {
                    oVotePlaceholderControl.addStyleClass("sapInoIdeaCardAccessibilityVote");
                    oVotePlaceholderControl.addStyleClass("sapInoIdeaCardBottomRibbonContent");
                    oRM.renderControl(oVotePlaceholderControl);
                }
                
                oRM.renderControl(oControl._getCommentButton());
                oControl._renderContributorButton(oRM, oControl);
            }

            oRM.write("<div");
            oRM.addClass("sapInoIdeaCardBottomRibbonContent");
            oRM.writeClasses();
            oRM.write(">");
            
            if (bRenderBack) {
                oRM.renderControl(oControl._getFlipButton("Back"));
            } else {
                oRM.renderControl(oControl._getFlipButton());
            }
            oRM.renderControl(oControl._getIdeaReadButton());
            oRM.write("</div>");
            oRM.write("</div>");
        },

        _renderTopRibbon: function(oRM, oControl, bRenderBack) {
            oRM.write("<div");
            oRM.addClass("sapInoIdeaCardRibbon sapInoIdeaCardTopRibbon");
            oRM.writeClasses();
            var sCampaignColor = oControl.getProperty("color");
            if (sCampaignColor && sCampaignColor.length === 7) {
                oRM.writeAttributeEscaped("style", "background-color: " + sCampaignColor);
            }
            oRM.write(">");
            
            // this is the text that is ALWAYS read by the screenreader, this is why we adapt it
            oRM.write("<span");
            oRM.addClass("sapInoIdeaCardAccessibilityText");
            oRM.addClass("sapUiInvisibleText");
            oRM.writeAttributeEscaped("title", this._oRB.getText("CTRL_IDEACARD_ALT_ACCESSIBILITY_TEXT_IDEA_LINK", [this.getProperty("ideaName")]));
            oRM.writeClasses();
            oRM.write("></span>");

            oRM.write("<div");
            oRM.addClass("sapInoIdeaCardCampaignLink");
            if (!sCampaignColor) {
                sCampaignColor = "#FFFFFF";
            }
            oRM.addClass("sapInoIdeaCardCampaignTitle" + ColorSupport.calculateTitleTextColor(sCampaignColor.substr(1, 2), sCampaignColor.substr(3, 2), sCampaignColor.substr(5, 2)));
            oRM.writeClasses();
            oRM.write(">");

            oRM.write("<div");
            oRM.addClass("sapInoIdeaCardCampaignLinkTooltip");
            oRM.writeAttributeEscaped("title", oControl._oRB.getText("CTRL_CARD_ALT_CAMPAIGN_TOOLTIP"));
            oRM.writeClasses();
            oRM.write(">");

            if (bRenderBack) {
                oRM.renderControl(oControl._getCampaignLink("Back"));
            } else {
                oRM.renderControl(oControl._getCampaignLink());
            }
            
            oRM.write("</div>");

            oRM.write("</div>");
            oRM.write("</div>");
        },
        
        ontouchstart : function(oEvent) {
            oEvent.setMarked();  
        },
        
        ontap : function(oEvent) {
            this.firePress();  
        },
        
        /**
         * Accessibility methods
         */
        getFocusDomRef: function() {
            if (this._bIsFlipped) {
                return this._getIdeaLink("Back").$();
            }
            return this._getIdeaLink().$();
        },
        
        onfocusin : function(oEvent) {
            if (!this._$AccessibilityText) {
                this._$AccessibilityText = this.$().find(".sapInoIdeaCardAccessibilityText");
            }
            
            if (!oEvent || !oEvent.target || !oEvent.target.className) {
                this._$AccessibilityText.attr("title", "");
                return;
            }
            
            if (oEvent.target.className.indexOf("sapInoIdeaCardAccessibilityCampaignLink") !== -1) {
                this._$AccessibilityText.attr("title", this._oRB.getText("CTRL_IDEACARD_ALT_ACCESSIBILITY_TEXT_CAMPAIGN_LINK", [this.getProperty("campaignName")]));
            }
            else if (oEvent.target.className.indexOf("sapInoIdeaCardAccessibilityFlipButtonBack") !== -1) {
                this._$AccessibilityText.attr("title", this._oRB.getText("CTRL_IDEACARD_ALT_ACCESSIBILITY_TEXT_FLIP_BACK"));
            }
            else if (oEvent.target.className.indexOf("sapInoIdeaCardAccessibilityFlipButton") !== -1) {
                this._$AccessibilityText.attr("title", this._oRB.getText("CTRL_IDEACARD_ALT_ACCESSIBILITY_TEXT_FLIP"));
            }
            else if (oEvent.target.className.indexOf("sapInoIdeaCardAccessibilitySubmitter") !== -1) {
                this._$AccessibilityText.attr("title", this._oRB.getText("CTRL_IDEACARD_ALT_ACCESSIBILITY_TEXT_SUBMITTER"));
            }
            else if (oEvent.target.className.indexOf("sapInoIdeaCardAccessibilityIdeaLink") !== -1) {
                this._$AccessibilityText.attr("title", this._oRB.getText("CTRL_IDEACARD_ALT_ACCESSIBILITY_TEXT_IDEA_LINK", [this.getProperty("ideaName")]));
            }
            else if (oEvent.target.className.indexOf("sapInoIdeaCardAccessibilityMoreButton") !== -1) {
                this._$AccessibilityText.attr("title", this._oRB.getText("CTRL_IDEACARD_ALT_ACCESSIBILITY_TEXT_MORE", [this.getProperty("ideaName")]));
            }
            else if (oEvent.target.className.indexOf("sapInoIdeaCardAccessibilityVote") !== -1) {
                this._$AccessibilityText.attr("title", this._oRB.getText("CTRL_IDEACARD_ALT_ACCESSIBILITY_TEXT_VOTE", [this.getProperty("ideaName")]));
            }
            else if (oEvent.target.className.indexOf('sapInoIdeaCardAccessibilityCommentButton') !== -1){
                this._$AccessibilityText.attr("title", this._oRB.getText("CTRL_IDEACARD_ALT_ACCESSIBILITY_TEXT_COMMENT", [this.getProperty("ideaName")]));
            }
            else if (oEvent.target.className.indexOf('sapInoIdeaCardAccessibilityContributorButton') !== -1){
                this._$AccessibilityText.attr("title", this._oRB.getText("CTRL_IDEACARD_ALT_ACCESSIBILITY_TEXT_CONTRIBUTOR", [this.getProperty("ideaName")]));
            }
            else {
                // this may be one of the different voting controls, where the focus target differs from the control itself
                var $Vote = jQuery(oEvent.target).closest(".sapInoIdeaCardAccessibilityVote");
                if ($Vote && $Vote.length > 0) {
                    this._$AccessibilityText.attr("title", this._oRB.getText("CTRL_IDEACARD_ALT_ACCESSIBILITY_TEXT_VOTE", [this.getProperty("ideaName")]));
                }
            }
        },
        
        _initTabs: function() {
            var oFlipButton = this._getFlipButton();
            var oBackFlipButton = this._getFlipButton("Back");
            oFlipButton.addStyleClass("sapInoIdeaCardFlipButton");
            oBackFlipButton.addStyleClass("sapInoIdeaCardFlipButton");

            var oFrontVote = this.getAggregation("votePlaceholder");
            var oFrontFollow = this.getAggregation("followButton");
            var oFrontContributor = this.getAggregation("contributorButton");

            this._aFrontTabs = [];
            this._aFrontTabs.push(this._getCampaignLink().$()[0].id);
            this._aFrontTabs.push(this._getIdeaLink().$()[0].id);
            if (oFrontVote.getEnabled()) {
                var $FrontVote = oFrontVote.$().find(".starVote, button");
                if ($FrontVote && $FrontVote.length > 0) {
                    this._aFrontTabs.push($FrontVote[0].id);
                     for(var oFrontNum = 1;oFrontNum < $FrontVote.length;oFrontNum++){
                            this._aFrontTabs.push($FrontVote[oFrontNum].id);
                        }
                }
            }
            if (oFrontFollow.getEnabled()){
                var $FrontFollow = oFrontFollow.$().find("button");
                if($FrontFollow && $FrontFollow.length){
                    this._aFrontTabs.push($FrontFollow[0].id);
                }
            }
            
            if(oFrontContributor.getEnabled()){
                var $contributorButton = oFrontContributor.$().find('button');
                if($contributorButton && $contributorButton.length){
                    this._aFrontTabs.push($contributorButton[0].id);
                }
            }
            this._aFrontTabs.push(this._getFlipButton().$()[0].id);
            this._aFrontTabs.push(this._getCommentButton().$()[0].id);

            this._aBackTabs = [];
            this._aBackTabs.push(this._getCampaignLink("Back").$()[0].id);
            this._aBackTabs.push(this._getIdeaLink("Back").$()[0].id);
            this._aBackTabs.push(this._getIdeaSubmitter().$()[0].id);
            this._aBackTabs.push(sanitizeHTML(this._getIdeaMoreLink().$()[0].id));
            this._aBackTabs.push(this._getFlipButton("Back").$()[0].id);
        },
        
        _getTabs: function() {
            if (this._bIsFlipped) {
                return this._aBackTabs;
            }
            return this._aFrontTabs;
        },
        
        _defaultOnKeyDown: function(oEvent) {
            if (Control.prototype.onkeydown) {
                Control.prototype.onkeydown.apply(this, arguments);
            }
        },
        
        onkeydown: function(oEvent) {
            var aTabs = this._getTabs();
            var fnUpdate = this._incr;

            if (oEvent.shiftKey || oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_UP || oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_LEFT) {
                fnUpdate = this._decr;
            }
         
            if (oEvent.keyCode === jQuery.sap.KeyCodes.ESCAPE) {
                this.getParent().focus();
            } else if (oEvent.keyCode === jQuery.sap.KeyCodes.TAB ||
                oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_DOWN ||
                oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_RIGHT ||
                oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_UP ||
                oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_LEFT) {
                var $Current = jQuery(":focus");
                var iIdx = -1;
                if ($Current && $Current.length > 0) {
                    iIdx = aTabs.indexOf($Current[0].id);
                    if (iIdx !== -1) {
                        iIdx = fnUpdate(iIdx, aTabs.length - 1);
                        this._focus(jQuery("#" + aTabs[iIdx]));

                        oEvent.preventDefault();
                        oEvent.stopPropagation();
                    } else {
                        this.getParent().focus();
                    }
                } else {
                    this.getParent().focus();
                }
            } else {
                this._defaultOnKeyDown(oEvent);
            }
        },
		
        _incr: function(iVal, iMax) {
            iVal++;
            if (iVal > iMax) {
                return 0;
            }
            return iVal;
        },

        _decr: function(iVal, iMax) {
            iVal--;
            if (iVal < 0) {
                return iMax;
            }
            return iVal;
        },
        
        _focus: function(oElement) {
            if (jQuery.type(oElement.focus) === "function") {
                setTimeout(function() {
                    oElement.focus();
                }, 0);
            }
        }
        /**
         * Accessibility methods end here
         */
    });

    IdeaCard.prototype.setIdeaDescription = function(sValue) {
        this.setProperty("ideaDescription", sValue);
        this._getIdeaDescription().setContent("<span>" + (sValue || "") + "</span>");
    };

    IdeaCard.prototype.setIdeaName = function(sValue) {
        this.setProperty("ideaName", sValue);
        var oIdeaLink = this._getIdeaLink();
        if (oIdeaLink) {
            oIdeaLink.setText(sValue);
        }
        oIdeaLink = this._getIdeaLink("Back");
        if (oIdeaLink) {
            oIdeaLink.setText(sValue);
        }
    };
    
    IdeaCard.prototype.setIdeaSubmittedAt = function(oValue) {
        this.setProperty("ideaSubmittedAt", oValue);
        this._getIdeaSubmitter().setText(this._getIdeaSubmitterText());
    };
    
    IdeaCard.prototype.setIdeaCreatedAt = function(oValue) {
        this.setProperty("ideaCreatedAt", oValue);
        this._getIdeaSubmitter().setText(this._getIdeaSubmitterText());
    };
    
    IdeaCard.prototype.setIdeaSubmitter = function(oValue) {
        this.setProperty("ideaSubmitter", oValue);
        this._getIdeaSubmitter().setText(this._getIdeaSubmitterText());
    };

    return IdeaCard;
});
