/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/core/Control",
	"sap/m/Image",
	"sap/ui/core/Icon",
	"sap/m/Link",
	"sap/m/Text",
	"sap/m/Size",
	"sap/ui/core/Orientation"
], function(Control, Image, Icon, Link, Text, Size, Orientation) {
	"use strict";

	/**
	 *
	 * A control that displays a User / Identity
	 *
	 * <ul><li>Properties
	 *   <ul>
	 *     <li></li>
	 *     <li></li>
	 *     <li></li>
	 *     <li></li>
	 *   </ul></li>
	 * <li>Aggregations
	 *   <ul>
	 *   </ul></li>
	 * <li>Events
	 *  <ul>
	 *   </ul></li>
	 * </ul>
	 */

	var IdentityCard = Control.extend("sap.ino.controls.IdentityCard", {
		metadata: {
			properties: {
				identityId: {
					type: "int"
				},
				userImageUrl: {
					type: "sap.ui.core.URI"
				},
				imageSize: {
					type: "sap.m.Size",
					defaultValue: "M"
				},
				userName: {
					type: "string"
				},
				userOrganization: {
					type: "string"
				},
				orientation: {
					type: "sap.ui.core.Orientation",
					defaultValue: "Horizontal"
				}
			},
			aggregations: {
				actions: {
					type: "sap.ui.core.Control",
					multiple: true,
					singularName: "action"
				},
				content: {
					type: "sap.ui.core.Control",
					multiple: true
				},
				contribution: {
					type: "sap.ui.core.Control",
					multiple: false
				},
				_nameLink: {
					type: "sap.m.Link",
					multiple: false,
					visibility: "hidden"
				},
				_organizationLabel: {
					type: "sap.m.Text",
					multiple: false,
					visibility: "hidden"
				},
				_userImage: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				}
			},
			events: {
				identityPress: {}
			},
			defaultAggregation: "content"
		},

		init: function() {

		},

		setUserImageUrl: function(sURL) {
			var oImgCtrl = this.getAggregation("_userImage");
			var oImg;
			if (oImgCtrl) {
				if (sURL && this.getProperty("userImageUrl") !== sURL) {
					oImg = new Image({
						src: sURL,
						decorative: true,
						press: this.fireNavigateToUser.bind(this)
					});
					oImg.addStyleClass("sapInoUserImage");
				} else if (!sURL && oImgCtrl.getMetadata().getName() === "sap.m.Image") {
					oImg = new Icon({
						src: "sap-icon://person-placeholder",
						decorative: true,
						useIconTooltip: false,
						press: this.fireNavigateToUser.bind(this)
					});
					oImg.addStyleClass("sapInoUserIcon");
				}
			} else {
				if (sURL) {
					oImg = new Image({
						src: sURL,
						decorative: true,
						press: this.fireNavigateToUser.bind(this)
					});
					oImg.addStyleClass("sapInoUserImage");
				} else {
					oImg = new Icon({
						src: "sap-icon://person-placeholder",
						decorative: true,
						useIconTooltip: false,
						press: this.fireNavigateToUser.bind(this)
					});
					oImg.addStyleClass("sapInoUserIcon");
				}
			}
			if (oImg) {
				this.setAggregation("_userImage", oImg);
			}
			this.setProperty("userImageUrl", sURL);
			return this;
		},

		setUserName: function(sUserName) {
			if (sUserName && this.getProperty("userName") !== sUserName && this.getIdentityId() !== 0) {
				this.setAggregation("_nameLink", new Link({
					text: sUserName,
					press: this.fireNavigateToUser.bind(this),
					wrapping: false
				}).setTooltip(sUserName));
			}
			this.setProperty("userName", sUserName);
			return this;
		},

		setUserOrganization: function(sOrganization) {
			if (sOrganization) {
				this.setAggregation("_organizationLabel", new Text({
					text: sOrganization,
					wrapping: true
				}));
			}
			this.setProperty("userOrganization", sOrganization);
			return this;
		},

		/**
		 * helper function that fires the identityPress event with parameters
		 */
		fireNavigateToUser: function(oEvent) {
			this.fireIdentityPress({
				identityId: this.getIdentityId(),
				actualSource: oEvent.getSource()
			});
			return this;
		},

		/**
		 * helper function that - if needed - lazily creates a user icon - only called from renderer
		 *
		 * @returns {Icon|Image}        the respective user icon/image
		 */
		getImageAggregation: function() {
			if (!this.getAggregation("_userImage")) {
				// lazily initializing the icon
				this.setUserImageUrl();
			}
			return this.getAggregation("_userImage");
		},

		renderer: function(oRM, oControl) {
			oRM.write("<div ");
			oRM.writeControlData(oControl);
			oRM.addClass("sapInoIdentityCard");
			if (oControl.getOrientation() === Orientation.Vertical) {
				oRM.addClass("sapInoIdentityCardVertical");
			} else {
				oRM.addClass("sapInoIdentityCardHorizontal");
			}
			oRM.writeClasses();

			//oRM.addStyle("width", oControl.getWidth());
			oRM.writeStyles();

			oRM.write(">");

			// image or icon
			var oImg = oControl.getImageAggregation();
			var sImageSize = oControl.getImageSize();
			if (sImageSize === Size.XS) {
				oImg.addStyleClass("sapInoUserImageXSmall");
			} else if (sImageSize === Size.S) {
			    oImg.addStyleClass("sapInoUserImageSmall");
			} else if (sImageSize === Size.L) {
				oImg.addStyleClass("sapInoUserImageLarge");
			} else {
				oImg.addStyleClass("sapInoUserImageMedium");
			}
			oRM.write("<div ");
			oRM.addClass("sapInoUserImageWrapper");
			oRM.writeClasses();
			oRM.write(">");
			oRM.renderControl(oImg);
			oRM.write("</div>");

			// the "meat"
			oRM.write("<div");
			oRM.addClass("sapInoUserContentWrapper");
			oRM.writeClasses();
			oRM.write(">");
			var oNameLink = oControl.getAggregation("_nameLink");
			if (oNameLink) {
				oRM.renderControl(oNameLink);
			}
			var oOrg = oControl.getAggregation("_organizationLabel");
			if (oOrg) {
				oRM.renderControl(oOrg);
			}

			var aContent = oControl.getContent();
			if (aContent && aContent.length > 0) {
				for (var i = 0; i < aContent.length; i = i + 1) {
					oRM.renderControl(aContent[i]);
				}
			}

			oRM.write("</div>");
			
			// actions
			var aActions = oControl.getActions();
			if (aActions && aActions.length > 0) {
				oRM.write("<div");
				oRM.addClass("sapInoUserActionWrapper");
				oRM.writeClasses();
				oRM.write(">");
				//Add DIV to include all btns
				oRM.write("<div");
				oRM.addClass("sapInoActionBtnWrapper");
				oRM.writeClasses();
				oRM.write(">");
				for (i = 0; i < aActions.length; i = i + 1) {
					oRM.renderControl(aActions[i]);
				}
				oRM.write("</div>");
            //Add Contribution
			var oContribution = oControl.getAggregation("contribution");
			 if(oContribution)
			  {	
			    oRM.renderControl(oContribution);
			    
			  }
				oRM.write("</div>");
			}
			oRM.write("</div>");
		},

		onAfterRendering: function() {
			// we need to manually remove the tabindex 0, as this is set due to the press listener
			// but it does not make sense to make it tabable additionally to the link
			var oImg = this.getImageAggregation();
			if (oImg) {
				oImg.$().attr("tabindex", "-1");
			}
		}

	});

	return IdentityCard;
});