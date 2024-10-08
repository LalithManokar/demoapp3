/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/core/InvisibleText",
    "sap/m/Image",
    "sap/m/Link",
    "sap/m/Text",
    "sap/m/FormattedText",
    "sap/m/Button",
    "sap/ino/controls/util/ColorSupport",
    "sap/ino/controls/LabelledIcon",
    "sap/ui/Device",
    "sap/ui/core/ResizeHandler",
    "sap/ino/controls/CampaignType",
    "sap/ino/controls/CampaignStatusType",
    "sap/ino/commons/application/Configuration",
	"sap/base/security/sanitizeHTML"
], function(Control, InvisibleText, Image, Link, Text, FormattedText, Button, ColorSupport, LabelledIcon, Device, ResizeHandler, CampaignType,
	CampaignStatusType, Configuration, sanitizeHTML) {
	"use strict";
	/**
	 *
	 * Constructor for a visual representation of a Campaign. It can be used as an item (incl. renderer) within a list
	 * (type "Small" or "Normal") or as a banner on top of a OPL (type "Banner").
	 *
	 * <ul>
	 * <li>Properties
	 * <ul>
	 * <li>color: The color of the campaign</li>
	 * <li>objectId: Id of the campaign</li>
	 * <li>href: For type "Normal" the title links to this href, e.g. an OPL</li>
	 * <li>title: The campaign title (not displayed for type "Small", link for type "Normal", text for type "Banner")</li>
	 * <li>type: Option for visual representation of the campaign: "Small" icon, "Normal" card or "Banner" with background image</li>
	 * <li>width: Width of the whole "Small" and "Normal" control, width of the info box of the "Banner" that spans 100%</li>
	 * <li>height: Height of the control, not including margins of the "Banner"</li>
	 * <li>image: An image representation of the campaign, used as background for type "Banner" and as image for the other types</li>
	 * <li>date: A text string (usually the end date of the campaign) displayed at the bottom</li>
	 * <li>submissionDate: A text string (usually the idea submission end date of the campaign) displayed at the bottom</li>
	 * <li>registrationDate: A text string (usually the registration end date of the campaign) displayed at the bottom</li>
	 * <li>dateTooltip: A string (usually the end date of the campaign) displayed at the date</li>
	 * <li>submissionDateTooltip: A string (usually the idea submission end date of the campaign) displayed at the submissionDate</li>
	 * <li>registrationDateTooltip: A string (usually the registration end date of the campaign) displayed at the registrationDate</li>
	 * <li>ideaCount: Number of ideas in this campaign</li>
	 * <li>participantCount: Number of participants in this campaign</li>
	 * <li>activeParticipantCount: Number of avtive participants in this campaign</li>
	 * <li>viewCount: Number of views</li>
	 * <li>openForSubmission: If true a create-idea-button is shown</li>
	 * <li>openForRegistration: If true a register-button is shown</li>
	 * </ul>
	 * </li>
	 * <li>Events
	 * <ul>
	 * <li>press: event is thrown when control or title link is tapped</li>
	 * <li>createIdea: event is thrown when the submit-idea-button is pressed</li>
	 * </ul>
	 * </li>
	 * </ul>
	 *
	 * @class The Campaign represents a Campaign. It can be used as an item (incl. renderer) within a list or as banner.
	 * @extends sap.ino.controls.Card
	 * @version 2.0
	 *
	 * @constructor
	 * @public
	 * @name sap.ino.controls.Campaign
	 */
	var Campaign = Control.extend("sap.ino.controls.Campaign", {
		metadata: {
			properties: {
				"color": {
					type: "sap.ui.core.CSSColor",
					defaultValue: "#FFFFFF"
				},
				"objectId": {
					type: "int"
				},
				"isManaged": {
					type: "string",
					defaultValue: "false"
				},
				"href": {
					type: "sap.ui.core.URI"
				},
				"title": {
					type: "string"
				},
				"type": {
					type: "sap.ino.controls.CampaignType",
					defaultValue: "Banner"
				},

				"status": {
					type: "sap.ino.controls.CampaignStatusType",
					defaultValue: CampaignStatusType.Published
				},
				"width": {
					type: "sap.ui.core.CSSSize",
					defaultValue: "300px"
				},
				"height": {
					type: "sap.ui.core.CSSSize",
					defaultValue: "160px"
				},
				"image": {
					type: "sap.ui.core.URI"
				},
				"date": {
					type: "string"
				},
				"submissionDate": {
					type: "string"
				},
				"registrationDate": {
					type: "string"
				},
				"dateTooltip": {
					type: "string"
				},
				"submissionDateTooltip": {
					type: "string"
				},
				"registrationDateTooltip": {
					type: "string"
				},
				"ideaCount": {
					type: "sap.ui.model.odata.type.Int64"
				},
				"participantCount": {
					type: "sap.ui.model.odata.type.Int64"
				},
				"activeParticipantCount": {
					type: "sap.ui.model.odata.type.Int64"
				},
				"viewCount": {
					type: "sap.ui.model.odata.type.Int64"
				},
				"openForSubmission": {
					type: "boolean"
				},
				"openForRegistration": {
					type: "boolean"
				},
				"isInnovationView": {
					type: "string",
					defaultValue: "true"
				},
			},
			aggregations: {
				"_image": {
					type: "sap.m.Image",
					multiple: false,
					visibility: "hidden"
				},
				"_title": {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				},
				"_date": {
					type: "sap.m.FormattedText",
					multiple: false,
					visibility: "hidden"
				},
				"_submissionDate": {
					type: "sap.m.FormattedText",
					multiple: false,
					visibility: "hidden"
				},
				"_registrationDate": {
					type: "sap.m.FormattedText",
					multiple: false,
					visibility: "hidden"
				},
				"_ideaCount": {
					type: "sap.ino.controls.LabelledIcon",
					multiple: false,
					visibility: "hidden"
				},
				"_participantCount": {
					type: "sap.ino.controls.LabelledIcon",
					multiple: false,
					visibility: "hidden"
				},
				"_activeParticipantCount": {
					type: "sap.ino.controls.LabelledIcon",
					multiple: false,
					visibility: "hidden"
				},
				"_isManaged": {
					type: "string",
					defaultValue: "false"
				},
				"_viewCount": {
					type: "sap.ino.controls.LabelledIcon",
					multiple: false,
					visibility: "hidden"
				},
				"_createIdeaButton": {
					type: "sap.m.Button",
					multiple: false,
					visibility: "hidden"
				},
				"registerButton": {
					type: "sap.ui.core.Control",
					multiple: false
				},
				"campaignSettingButton": {
					type: "sap.ui.core.Control",
					multiple: false

				},
				"_titleDescription": {
					type: "sap.ui.core.InvisibleText",
					multiple: false,
					visibility: "hidden"
				},
				"_createIdeaDescription": {
					type: "sap.ui.core.InvisibleText",
					multiple: false,
					visibility: "hidden"
				},
				"_registerDescription": {
					type: "sap.ui.core.InvisibleText",
					multiple: false,
					visibility: "hidden"
				},
				"_settingDescription": {
					type: "sap.ui.core.InvisibleText",
					multiple: false,
					visibility: "hidden"
				},
				"followButton": {
					type: "sap.ui.core.Control",
					multiple: false
				}
			},
			events: {
				press: {},
				createIdea: {},
				openSetting: {}
			}

		},

		/**
		 * Getter for property <code>color</code>. The color in hex value format with leading "#".
		 *
		 * Default value is <code>FFFFFF</code>
		 *
		 * @return {string} the value of property <code>color</code>
		 * @public
		 * @name sap.ino.controls.Campaign#getColor
		 * @function
		 */

		/**
		 * Setter for property <code>color</code>.
		 *
		 * Default value is <code>FFFFFF</code>
		 *
		 * @param {string} sColor new value (with leading "#") for property <code>color</code>
		 * @public
		 * @name sap.ino.controls.Campaign#setColor
		 * @function
		 */

		/**
		 * @private
		 */
		init: function() {
			this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.controls");
			this._sResizeRegId = ResizeHandler.register(this, this._onResize);
		},

		/**
		 * @private
		 */
		exit: function() {
			ResizeHandler.deregister(this._sResizeRegId);
			this.destroyAggregation('_image');
		},

		/**
		 * @private
		 */
		_onResize: function(oEvent) {
			// if triggered via event this.oControl, else this
			var oControl = this.oControl || this;
			var oImage;

			if (oControl.getType() === CampaignType.Banner) {
				var $Info = oControl.$().find(".sapInoCampaignInfo");
				var iBuffer = 30;
				var iBufferExceptional = 20; // this buffer is to avoid jumping if shrink removes the need for a scrollbar

				if ($Info && $Info.length > 0) {
					var iLeftMargin = parseInt($Info.css("margin-left"), 10) || 0;

					if (oEvent.size.width < 2 * parseInt(oControl.getWidth(), 10) && !oControl.$().hasClass("sapInoCampaignSqueeze")) {
						oControl.$().addClass("sapInoCampaignSqueeze");
						return;
					}

					if (oEvent.size.width < iLeftMargin + parseInt(oControl.getWidth(), 10) + iBuffer && !oControl.$().hasClass("sapInoCampaignShrink")) {
						oControl._iLeftMargin = iLeftMargin;
						oControl.$().addClass("sapInoCampaignShrink");
						return;
					}

					if (oEvent.size.width > (oControl._iLeftMargin || 0) + parseInt(oControl.getWidth(), 10) + iBuffer + iBufferExceptional && oControl
						.$().hasClass("sapInoCampaignShrink")) {
						oControl.$().removeClass("sapInoCampaignShrink");

						if (Device.system.phone) {
							oImage = oControl._getImage();
							if (oImage && !oImage.getVisible()) {
								oImage.setVisible(true);
							}
						}
						return;
					}

					if (oEvent.size.width >= 2 * parseInt(oControl.getWidth(), 10) && oControl.$().hasClass("sapInoCampaignSqueeze")) {
						oControl.$().removeClass("sapInoCampaignSqueeze");
						return;
					}
				}
			} else {
				if (Device.system.phone) {
					oImage = oControl._getImage();
					if (oImage && !oImage.getVisible()) {
						oImage.setVisible(true);
					}
				}
			}
		},

		/**
		 * @private
		 */
		_getCount: function(sKey, sIcon, sTextKey) {
			var oCount = this.getAggregation("_" + sKey);
			// undefined counts are not rendered at all
			if (!oCount && this.getProperty(sKey) !== undefined) {
				oCount = new LabelledIcon({
					iconUrl: sIcon,
					label: this.getProperty(sKey),
					tooltip: this._oRB.getText(sTextKey)
				});
				this.setAggregation("_" + sKey, oCount, true);
			}
			return oCount;
		},

		/**
		 * @private
		 */
		_getIdeaCount: function() {
			return this._getCount("ideaCount", "sap-icon://InoIcons/idea", "CTRL_CAMPAIGN_EXP_IDEA_COUNT");
		},

		/**
		 * @private
		 */
		_getParticipantCount: function() {
			return this._getCount("participantCount", "sap-icon://group", "CTRL_CAMPAIGN_EXP_PARTICIPANT_COUNT");
		},

		/**
		 * @private
		 */
		_getActiveParticipantCount: function() {
			return this._getCount("activeParticipantCount", "sap-icon://InoIcons/active-participates", "CTRL_CAMPAIGN_EXP_ACTIVE_PARTICIPANT_COUNT");
		},

		/**
		 * @private
		 */
		_getViewCount: function() {
			return this._getCount("viewCount", "sap-icon://show", "CTRL_CAMPAIGN_EXP_VIEW_COUNT");
		},

		_getDate: function() {
			var oDate = this.getAggregation("_date");
			if (!oDate) {
				oDate = new FormattedText({
					htmlText: this.getProperty("date") || "",
				// 	maxLines: 2,
					tooltip: this.getProperty("dateTooltip")
				}).addStyleClass("sapInoCampaignDate sapInoCampaignMaxSize");
				this.setAggregation("_date", oDate, true);
			}
			return oDate;
		},

		_getSubmissionDate: function() {
			var oDate = this.getAggregation("_submissionDate");
			if (!oDate) {
				oDate = new FormattedText({
					htmlText: this.getProperty("submissionDate") || "",
				// 	maxLines: 2,
				// sanitizeContent:true,
					tooltip: this.getProperty("submissionDateTooltip")
				}).addStyleClass("sapInoCampaignDate sapInoCampaignMaxSize");
				this.setAggregation("_submissionDate", oDate, true);
			}
			return oDate;
		},
		_getManaged: function() {
			var isManaged = this.getAggregation("_isManaged");
			if (!isManaged) {
				isManaged = "false";
			}
			return isManaged;
		},
		_getRegistrationDate: function() {
			var oDate = this.getAggregation("_registrationDate");
			if (!oDate) {
				oDate = new FormattedText({
					htmlText: this.getProperty("registrationDate") || "",
				// 	maxLines: 2,
				// sanitizeContent:true,
					tooltip: this.getProperty("registrationDateTooltip")
				}).addStyleClass("sapInoCampaignDate sapInoCampaignMaxSize");
				this.setAggregation("_registrationDate", oDate, true);
			}
			return oDate;
		},

		/**
		 * @private
		 */
		_getImage: function() {
			var oImage = this.getAggregation("_image");
			if (!oImage) {
				var sURL = this.getProperty("image");
				if (sURL) {
					oImage = new Image({
						src: sURL,
						mode: "Background",
						width: "100%",
						height: "100%",
						visible: !Device.system.phone,
						densityAware: false
					});
					this.setAggregation("_image", oImage);
				}
			}
			return oImage;
		},

		/**
		 * @private
		 */
		_getTitleDescription: function() {
			var oDescr = this.getAggregation("_titleDescription");
			if (!oDescr) {
				/*oDescr = new InvisibleText({
					text: this._oRB.getText("CTRL_CAMPAIGN_EXP_NAV_LINK", [this.getProperty("title")])
				});*/
				oDescr = new InvisibleText().setText(this._oRB.getText("CTRL_CAMPAIGN_EXP_NAV_LINK", [this.getProperty("title")]));
				if (this.getProperty("title")) {
					this.setAggregation("_titleDescription", oDescr);
				}
			}
			return oDescr;
		},

		/**
		 * @private
		 */
		_getTitle: function() {
			var that = this;
			var oTitle = this.getAggregation("_title");
			if (!oTitle) {
				var sTitle = this.getProperty("title");
				if (sTitle) {
					if (this.getType() === CampaignType.Banner) {
						if (this.hasListeners("press")) {
							oTitle = new Link({
								ariaDescribedBy: that._getTitleDescription(),
								//text: sTitle,
								wrapping: true,
								href: jQuery.sap.validateUrl(this.getProperty("href")) ? this.getProperty("href") : "",
								press: function(oEvent) {
									// prevent href
									oEvent.preventDefault();
									that.firePress({
										campaignId: that.getProperty("objectId")
									});
								}
							}).setText(sTitle).addStyleClass("sapInoCampaignTitle sapInoCampaignMaxSize");
						} else {
							oTitle = new Text({
								//text: sTitle,
								wrapping: true
							}).setText(sTitle).addStyleClass("sapInoCampaignTitle sapInoCampaignMaxSize");
						}
					} else {
						oTitle = new Link({
							ariaDescribedBy: that._getTitleDescription(),
							//text: sTitle,
							wrapping: true,
							href: jQuery.sap.validateUrl(this.getProperty("href")) ? this.getProperty("href") : "",
							press: function(oEvent) {
								// prevent href
								oEvent.preventDefault();
								that.firePress({
									campaignId: that.getProperty("objectId")
								});
							}
						}).setText(sTitle).addStyleClass("sapInoCampaignTitle sapInoCampaignMaxSize");
					}
					this.setAggregation("_title", oTitle);
				}
			}
			return oTitle;
		},

		/**
		 * @private
		 */
		_getCreateIdeaDescription: function() {
			var oDescr = this.getAggregation("_createIdeaDescription");
			if (!oDescr) {
				oDescr = new InvisibleText({
					text: this._oRB.getText("CTRL_CAMPAIGN_EXP_CREATE_IDEA_DESCRIPTION", [this.getProperty("title")])
				});
				if (this.getProperty("title")) {
					this.setAggregation("_createIdeaDescription", oDescr);
				}
			}
			return oDescr;
		},

		_getFollowButton: function() {
			var followButton = this.getAggregation("followButton");
			return followButton;
		},
		_getRegisterDescription: function() {
			var oDescr = this.getAggregation("_registerDescription");
			if (!oDescr) {
				oDescr = new InvisibleText({
					text: this._oRB.getText("CTRL_CAMPAIGN_EXP_REGISTER_DESCRIPTION")
				});
				this.setAggregation("_registerDescription", oDescr);
			}
			return oDescr;
		},
		_getSettingButton: function() {
			var that = this;
			var oSettingButton = this.getAggregation("campaignSettingButton");
			if (!oSettingButton) {
				oSettingButton = new Button({
					ariaDescribedBy: that._getSettingDescription(),
					icon: "sap-icon://action-settings",
					tooltip: that._oRB.getText("CTRL_CAMPAIGN_EXP_SETTING_DESCRIPTION"),
					press: function(oEvent) {
						oEvent.preventDefault();

						that.fireOpenSetting();
					},
					enabled: true
				});

				this.setAggregation("campaignSettingButton", oSettingButton, true);
			}
			return oSettingButton;

		},
		_getSettingDescription: function() {
			var oDescr = this.getAggregation("_settingDescription");
			if (!oDescr) {
				oDescr = new InvisibleText({
					text: this._oRB.getText("CTRL_CAMPAIGN_EXP_SETTING_DESCRIPTION")
				});
				this.setAggregation("_settingDescription", oDescr);
			}
			return oDescr;
		},

		_getRegisterButton: function() {
			var registerButton = this.getAggregation('registerButton');
			if (registerButton) {
				registerButton.addAriaDescribedBy(this._getRegisterDescription());
			}
			return registerButton;
		},
		/**
		 * @private
		 */
		_getCreateIdeaButton: function() {
			var that = this;
			var oCreateIdeaButton = this.getAggregation("_createIdeaButton");
			if (!oCreateIdeaButton) {
				oCreateIdeaButton = new Button({
					ariaDescribedBy: that._getCreateIdeaDescription(),
					icon: "sap-icon://InoIcons/idea-add",
					tooltip: that._oRB.getText("CTRL_CAMPAIGN_EXP_BTN_CREATE_IDEA"),
					press: function(oEvent) {
						oEvent.preventDefault();
						that.fireCreateIdea({
							campaignId: that.getProperty("objectId")
						});
					},
					enabled: true
				});

				this.setAggregation("_createIdeaButton", oCreateIdeaButton, true);
			}
			return oCreateIdeaButton;
		},

		/**
		 * @private
		 */
		_displayCreateIdeaButton: function() {
			return this.getOpenForSubmission() && this.hasListeners("createIdea");
		},

		onAfterRendering: function() {
			// correct initial display 
			this._onResize({
				size: {
					width: this.$().width()
				}
			});

			var aBottomClass = [".sapInoCampaignInfoBottomCounts", ".sapInoCampaignInfoBottom"];
			var that = this;

			aBottomClass.forEach(function(sBottomClass) {

				var $Info = that.$().find(".sapInoCampaignInfo");
				var $InfoTop = that.$().find(".sapInoCampaignInfoTop");
				var $InfoBottom = that.$().find(".sapInoCampaignInfoBottom");
				var $Control = that.$().find(sBottomClass);

				if ($Info && $Info.length > 0 && $InfoTop && $InfoTop.length > 0 && $InfoBottom && $InfoBottom.length > 0) {
					var iTopPadding = (parseInt($InfoTop.css("padding-top"), 10) || 0) + (parseInt($InfoTop.css("padding-bottom"), 10) || 0);
					var iBottomPadding = (parseInt($InfoBottom.css("padding-top"), 10) || 0) + (parseInt($InfoBottom.css("padding-bottom"), 10) || 0);
					if ($Info.height() < $InfoTop.height() + iTopPadding + $InfoBottom.height() + iBottomPadding) {
						if (!$Control.hasClass("sapInoCampaignHide")) {
							$Control.addClass("sapInoCampaignHide");
						}
					}
				}
			});

			this._initTabs();
		},

		renderer: function(oRm, oControl) {
			var sColor = sanitizeHTML(oControl.getColor());

			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addStyle("background-color", sColor);
			oRm.writeStyles();
			oRm.addClass("sapInoCampaign");
			oRm.addClass("sapInoCampaign" + sanitizeHTML(oControl.getType()));
			if (!sColor) {
				sColor = "#FFFFFF";
			}
			oRm.addClass("sapInoCampaign" + ColorSupport.calculateTitleTextColor(sColor.substr(1, 2), sColor.substr(3, 2), sColor.substr(5, 2)));
			oRm.writeClasses();
			oRm.write(">");

			if (oControl.getType() === CampaignType.Banner) {
				oRm.write("<style>#" + sanitizeHTML(oControl.getId()) + ".sapInoCampaignSqueeze { height : " + sanitizeHTML(oControl.getHeight()) + "; }</style>");
			}

			oControl._renderContent(oRm, oControl);

			oRm.write("</div>");
		},

		_renderContent: function(oRm, oControl) {
			var sColor = sanitizeHTML(oControl.getColor());
			oRm.write("<div");
			oRm.addStyle("width", sanitizeHTML(oControl.getWidth()));
			oRm.addStyle("height", sanitizeHTML(oControl.getHeight()));
			oRm.writeStyles();
			oRm.write(">");

			var sInfoWidth = oControl.getWidth();
			if (oControl._getImage() && oControl.getType() === CampaignType.Normal) {
				sInfoWidth = "60%";
			} else if (oControl._getImage() && oControl.getType() === CampaignType.Small) {
				sInfoWidth = "50%";
			} else if (oControl._getImage() && oControl.getType() === CampaignType.Banner) {
				if (Device.system.phone) {
					sInfoWidth = "97%";
				}

				oRm.write("<div");
				oRm.addStyle("width", "100%");
				oRm.addStyle("height", "100%");
				oRm.writeStyles();
				oRm.addClass("sapInoCampaignImage");
				oRm.writeClasses();
				oRm.write(">");

				oRm.renderControl(oControl._getImage());

				oRm.write("</div>");
			}

			oRm.write("<div");
			oRm.addStyle("width", sInfoWidth);
			oRm.addStyle("height", sanitizeHTML(oControl.getHeight()));
			oRm.addStyle("background-color", sColor);
			oRm.writeStyles();
			oRm.addClass("sapInoCampaignInfo");
			oRm.writeClasses();
			oRm.write(">");

			// this is an assumption about the padding (1 rem) of the container
			// if needed change this to calculate the correct value from padding, margin and border
			oRm.write("<style>#" + sanitizeHTML(oControl.getId()) + " .sapInoCampaignMaxSize { max-width : calc(" + sanitizeHTML(oControl.getWidth()) + " - 2rem); }</style>");

			oRm.write("<div");
			oRm.addClass("sapInoCampaignInfoTop");
			oRm.writeClasses();
			oRm.write(">");

			var oTitle = oControl._getTitle();
			if (oTitle) {
				oRm.renderControl(oTitle);
				// TODO: correctly style this
				if (oControl.getStatus() === CampaignStatusType.Draft) {
					oRm.write("<div");
					oRm.addClass("sapInoCampaignInfoDraftIndicator");
					oRm.writeClasses();
					oRm.write(">");
					oRm.write(oControl._oRB.getText("CTRL_CAMPAIGNCARD_MSG_DRAFT"));
					oRm.write("</div>");
				}
				if (oTitle instanceof Link) {
					oRm.renderControl(oControl._getTitleDescription());
				}
			}

			oRm.write("</div>");

			oRm.write("<div");
			oRm.addClass("sapInoCampaignInfoBottom");
			oRm.writeClasses();
			oRm.write(">");

			oRm.write("<div");
			oRm.addClass("sapInoCampaignInfoBottomDate");
			oRm.writeClasses();
			oRm.write(">");

			if (oControl.getOpenForRegistration() && oControl._getRegistrationDate()) {
				oRm.renderControl(oControl._getRegistrationDate());
			} else if (oControl._getSubmissionDate()) {
				oRm.renderControl(oControl._getSubmissionDate());
			}
			if (oControl._getDate()) {
				oRm.renderControl(oControl._getDate());
			}

			oRm.write("</div>");

			oRm.write("<div");
			oRm.addClass("sapInoCampaignInfoBottomCounts");
			oRm.writeClasses();
			oRm.write(">");

			if (oControl._getIdeaCount()) {
				oRm.renderControl(oControl._getIdeaCount().addStyleClass("sapInoCampaignInfoBottomCount"));
			}
			if (oControl._getViewCount() && this.getProperty("isInnovationView") === "true") {
				oRm.renderControl(oControl._getViewCount().addStyleClass("sapInoCampaignInfoBottomCount"));
			}
			if (oControl._getParticipantCount() && this.getProperty("isInnovationView") === "true") {
				oRm.renderControl(oControl._getParticipantCount().addStyleClass("sapInoCampaignInfoBottomCount"));
			}
			if (oControl._getActiveParticipantCount() && this.getProperty("isInnovationView") === "true") {
				oRm.renderControl(oControl._getActiveParticipantCount().addStyleClass("sapInoCampaignInfoBottomCount"));
			}

			oRm.write("</div>");

			oRm.write("</div>");

			oRm.write("</div>");

			if (oControl._getImage() && (oControl.getType() === CampaignType.Normal || oControl.getType() === CampaignType.Small)) {

				var iWidth = 100 - parseInt(sInfoWidth, 10);

				oRm.write("<div");
				oRm.addStyle("width", iWidth + "%");
				oRm.addStyle("height", oControl.getHeight());
				oRm.writeStyles();
				oRm.addClass("sapInoCampaignImage");
				oRm.writeClasses();
				oRm.write(">");

				oRm.renderControl(oControl._getImage());

				oRm.write("</div>");
			}

			oRm.write("<div");
			oRm.addClass("sapInoCampaignClear");
			oRm.writeClasses();
			oRm.write(">");

			oRm.write("</div>");

			oRm.write("<div");
			oRm.addClass('sapInoCampaignButtons');
			oRm.writeClasses();
			oRm.write('>');

			oRm.write("<div");
			oRm.addClass('sapInoCampaignRegisterButton');
			oRm.writeClasses();
			oRm.write('>');

			if (oControl._getRegisterButton() && oControl._getRegisterButton().getVisible()) {
				oRm.renderControl(oControl._getRegisterButton());
				oRm.renderControl(oControl._getRegisterDescription());
			}

			oRm.write('</div>');

			oRm.write("<div");
			oRm.addClass("sapInoCampaignCreateIdeaButton");
			oRm.writeClasses();
			oRm.write(">");

			if (oControl._displayCreateIdeaButton() && oControl.getType() === "Normal") {
				oRm.renderControl(oControl._getCreateIdeaButton());
				oRm.renderControl(oControl._getCreateIdeaDescription());
			}

			oRm.write("</div>");

			oRm.write("<div");
			oRm.addClass('sapInoCampaignFollowButton');
			oRm.writeClasses();
			oRm.write('>');

			oRm.renderControl(oControl._getFollowButton());

			oRm.write('</div>');

			oRm.write("<div");
			oRm.addClass('sapInoCampaignFollowButton');
			oRm.writeClasses();
			oRm.write('>');
			if (this.getProperty("isManaged") === "true") {
				oRm.renderControl(oControl._getSettingButton());
			}
			oRm.write('</div>');
			oRm.write("</div>");

			oRm.write("</div>");
		},

		ontap: function(oEvent) {
			if ((oEvent.srcControl && oEvent.srcControl.sParentAggregationName === "_follow") || (oEvent.srcControl.getParent() && oEvent.srcControl
				.getParent().sParentAggregationName === "_follow")) {
				return false;
			}
			if ((oEvent.srcControl && oEvent.srcControl.sParentAggregationName === "registerButton") || (oEvent.srcControl.getParent() && oEvent.srcControl
				.getParent().sParentAggregationName === "registerButton")) {
				return false;
			}
			// the create idea button could be srcControl in IE or parent in Chrome 
			if ((!oEvent.srcControl || oEvent.srcControl !== this._getCreateIdeaButton()) &&
				(!oEvent.srcControl.getParent() || (oEvent.srcControl.getParent() && oEvent.srcControl.getParent() !== this._getCreateIdeaButton()))
			) {
				if ((!oEvent.srcControl || oEvent.srcControl !== this._getSettingButton()) &&
					(!oEvent.srcControl.getParent() || (oEvent.srcControl.getParent() && oEvent.srcControl.getParent() !== this._getSettingButton()))
				) {
					oEvent.stopPropagation();
					this.firePress({
						campaignId: this.getObjectId()
					});
				}
			}
		},

		getFocusDomRef: function() {
			if (this._getTitle() instanceof Link) {
				return this._getTitle().$();
			} else if (this._displayCreateIdeaButton()) {
				this._getCreateIdeaButton().$();
			} else {
				return undefined;
			}
		},

		/**
		 * @private
		 */
		_initTabs: function() {
			this._tabs = [];
			if (this._getTitle() instanceof Link) {
				this._tabs.push(this._getTitle().$()[0].id);
			}
			if (this._displayCreateIdeaButton() && this.getType() === "Normal") {
				this._tabs.push(this._getCreateIdeaButton().$()[0].id);
			}
			if (this.getAggregation("followButton")) {
				this._tabs.push(this.getAggregation("followButton").$().find("[tabindex=0],button")[0].id);
			}
			if (this.getAggregation('registerButton') && this.getAggregation('registerButton').$().length) {
				this._tabs.push(this.getAggregation('registerButton').$()[0].id);
			}
		},

		/**
		 * @private
		 */
		_getTabs: function() {
			return this._tabs;
		},

		/**
		 * @private
		 */
		_defaultOnKeyDown: function(oEvent) {
			if (Control.prototype.onkeydown) {
				Control.prototype.onkeydown.apply(this, arguments);
			}
		},

		onkeydown: function(oEvent) {
			var aTabs = this._getTabs();
			var fnUpdate = this._incr;

			if (this.getType() !== CampaignType.Normal) {
				this._defaultOnKeyDown(oEvent);
				return;
			}

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
			event.stopPropagation();
		},

		/**
		 * @private
		 */
		_incr: function(iVal, iMax) {
			iVal++;
			if (iVal > iMax) {
				return 0;
			}
			return iVal;
		},

		/**
		 * @private
		 */
		_decr: function(iVal, iMax) {
			iVal--;
			if (iVal < 0) {
				return iMax;
			}
			return iVal;
		},

		/**
		 * @private
		 */
		_focus: function(oElement) {
			if (jQuery.type(oElement.focus) === "function") {
				setTimeout(function() {
					oElement.focus();
				}, 0);
			}
		}
	});

	Campaign.prototype.setDate = function(sValue) {
		this.setProperty("date", sValue);
		this._getDate().setHtmlText(sValue);
	};

	Campaign.prototype.setSubmissionDate = function(sValue) {
		this.setProperty("submissionDate", sValue);
		this._getSubmissionDate().setHtmlText(sValue);
	};

	Campaign.prototype.setRegistrationDate = function(sValue) {
		this.setProperty("registrationDate", sValue);
		this._getRegistrationDate().setHtmlText(sValue);
	};
	
	Campaign.prototype.setDateTooltip = function(sValue) {
		this.setProperty("dateTooltip", sValue);
		this._getDate().setTooltip(sValue);
	};

	Campaign.prototype.setSubmissionDateTooltip = function(sValue) {
		this.setProperty("submissionDateTooltip", sValue);
		this._getSubmissionDate().setTooltip(sValue);
	};

	Campaign.prototype.setRegistrationDateTooltip = function(sValue) {
		this.setProperty("registrationDateTooltip", sValue);
		this._getRegistrationDate().setTooltip(sValue);
	};

	Campaign.prototype.setIdeaCount = function(iValue) {
		this.setProperty("ideaCount", iValue);
		if (this._getIdeaCount()) {
			this._getIdeaCount().setLabel(iValue);
		}
	};

	Campaign.prototype.setParticipantCount = function(iValue) {
		this.setProperty("participantCount", iValue);
		if (this._getParticipantCount()) {
			this._getParticipantCount().setLabel(iValue);
		}
	};

	Campaign.prototype.setActiveParticipantCount = function(iValue) {
		this.setProperty("activeParticipantCount", iValue);
		if (this._getActiveParticipantCount()) {
			this._getActiveParticipantCount().setLabel(iValue);
		}
	};

	Campaign.prototype.setViewCount = function(iValue) {
		this.setProperty("viewCount", iValue);
		if (this._getViewCount()) {
			this._getViewCount().setLabel(iValue);
		}
	};

	Campaign.prototype.RegistrationenForSubmission = function(bValue) {
		this.setProperty("openForSubmission", bValue);
	};

	Campaign.prototype.setOpenForRegistration = function(bValue) {
		this.setProperty("openForRegistration", bValue);
	};

	Campaign.prototype.setTitle = function(sValue) {
		this.setProperty("title", sValue);
		if (this._getTitle()) {
			this._getTitle().setText(sValue);
		}
	};

	Campaign.prototype.setHref = function(sValue) {
		this.setProperty("href", sValue);
		if (this._getTitle() && this._getTitle().setHref) {
			this._getTitle().setHref(sValue);
		}
	};

	Campaign.prototype.setImage = function(sValue) {
		this.setProperty("image", sValue);
		if (this._getImage()) {
			this._getImage().setSrc(sValue);
		}
	};

	return Campaign;
});