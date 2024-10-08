/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/core/InvisibleText",
    "sap/m/Image",
    "sap/m/Link",
    "sap/m/Text",
    "sap/m/Button",
    "sap/ino/controls/util/ColorSupport",
    "sap/ino/controls/LabelledIcon",
    "sap/ui/Device",
    "sap/ui/core/ResizeHandler",
    "sap/ino/controls/CampaignType",
    "sap/ino/controls/CampaignStatusType",
    "sap/ino/commons/application/Configuration",
	"sap/base/security/sanitizeHTML"
], function(Control, InvisibleText, Image, Link, Text, Button, ColorSupport, LabelledIcon, Device, ResizeHandler, CampaignType,
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
	 * <li>ideaCount: Number of ideas in this campaign</li>
	 * <li>participantCount: Number of participants in this campaign</li>
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
	var CampaignFollowButton = Control.extend("sap.ino.controls.CampaignFollowButton", {
		metadata: {
			properties: {

				"objectId": {
					type: "int"
				},

				"type": {
					type: "sap.ino.controls.CampaignType",
					defaultValue: "Normal"
				},

				"openForSubmission": {
					type: "boolean"
				},
				"openForRegistration": {
					type: "boolean"
				}
			},
			aggregations: {
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

		/**
		 * @private
		 */
		_getCreateIdeaDescription: function() {
			var oDescr = this.getAggregation("_createIdeaDescription");

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
					type: "Transparent",
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
					type: "Transparent",
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

		renderer: function(oRm, oControl) {

		//	if (oControl._getRegisterButton() && oControl._getRegisterButton().getVisible()) {
				oRm.renderControl(oControl._getRegisterButton());
				oRm.renderControl(oControl._getRegisterDescription());
			//}

			if (oControl._displayCreateIdeaButton()) {
				oRm.renderControl(oControl._getCreateIdeaButton());
				oRm.renderControl(oControl._getCreateIdeaDescription());
			}

			oRm.renderControl(oControl._getFollowButton());

			if (oControl.getType() === "Managed") {
				oRm.renderControl(oControl._getSettingButton());
			}

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

		/**
		 * @private
		 */
		_initTabs: function() {
			this._tabs = [];

			if (this._displayCreateIdeaButton()) {
				this._tabs.push(sanitizeHTML(this._getCreateIdeaButton().$()[0].id));
			}
			if (this.getAggregation("followButton")) {
				this._tabs.push(sanitizeHTML(this.getAggregation("followButton").$().find("[tabindex=0],button")[0].id));
			}
			if (this.getAggregation('registerButton') && this.getAggregation('registerButton').$().length) {
				this._tabs.push(sanitizeHTML(this.getAggregation('registerButton').$()[0].id));
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

	CampaignFollowButton.prototype.RegistrationenForSubmission = function(bValue) {
		this.setProperty("openForSubmission", bValue);
	};

	CampaignFollowButton.prototype.setOpenForRegistration = function(bValue) {
		this.setProperty("openForRegistration", bValue);
	};

	return CampaignFollowButton;
});