sap.ui.define([
    "sap/ui/Device",
    "sap/ino/commons/application/Configuration",
    "sap/ui/core/UIComponent"
], function(Device, Configuration, UIComponent) {
	"use strict";

	/**
	 * @class
	 * Facet for view controllers that are used on the top level in the application, i.e. as direct child of the shell.
	 */
	var TopLevelPage = function() {
		throw "Facet may not be instantiated directly";
	};

	// TODO: onInit is called in onInit of BaseController, i.e. it can only be called for exactly one facet
	TopLevelPage._onInit = function() {
		var that = this;

		this._oComponent = this.getOwnerComponent();
		this._oRouter = this._oComponent ? this._oComponent.getRouter() : undefined;

		if (this.routes && this._oRouter) {
			if (jQuery.type(this.routes) === "array") {
				jQuery.each(this.routes, function(iIdx, sRoute) {
					that._oRouter.getRoute(sRoute).attachMatched(that._onRouteMatched, that);
				});
			} else if (jQuery.type(this.routes) === "string") {
				that._oRouter.getRoute(this.routes).attachMatched(that._onRouteMatched, that);
			}
		}

		this._oNavEventDelegate = {
			onBeforeShow: function(oEvent) {

				if (this.onBeforeShow) {
					this.onBeforeShow(oEvent);
				}

				if (!this._bOrientationHandlerAttached && !Device.system.desktop) {
					this._bOrientationHandlerAttached = true;
					Device.orientation.attachHandler(this._onOrientationChange, this);
				}

			},
			onAfterShow: function(oEvent) {

				if (this.onAfterShow) {
					this.onAfterShow(oEvent);
				}
				// Base controller to set initial focus
				if (this.setViewFocus) {
					this.setViewFocus();
				}
			},
			onBeforeHide: function(oEvent) {
				if (this.onBeforeHide) {
					this.onBeforeHide(oEvent);
					//this.initFullScreen();
				}
			},
			onAfterHide: function(oEvent) {
				if (this.onAfterHide) {
					this.onAfterHide(oEvent);
				}

				this._bOrientationHandlerAttached = false;
				Device.orientation.detachHandler(this._onOrientationChange, this);
			}
		};
		this.getView().addEventDelegate(this._oNavEventDelegate, this);

		// add the normal background if view does not specify sth else
		if (!this.getView().hasStyleClass("sapInoViewNoBackground")) {
			this.getView().addStyleClass("sapUiGlobalBackgroundColor sapUiGlobalBackgroundColorForce");
		}

		if (this._oRouter) {
			this._oRouter.attachRouteMatched(this._onAnyRouteMatched, this);
			this._oRouter.attachBypassed(that._onBypassed, that);
		}
	};

	// TODO: onInit is called in onInit of BaseController, i.e. it can only be called for exactly one facet
	TopLevelPage._onExit = function() {
		this.getView().removeEventDelegate(this._oNavEventDelegate);
	};

	TopLevelPage._onOrientationChange = function(oEvent) {
		if (this._onBaseOrientationChange) {
			this._onBaseOrientationChange(oEvent);
		}
		if (this.onOrientationChange) {
			this.onOrientationChange(oEvent);
		}
	};

	TopLevelPage.setBackgroundImages = function(sBackgroundImageId, sSmallBackgroundImageId) {
		var sBackgroundImageURL = this._selectAppropriateBackgroundImageURL(sBackgroundImageId, sSmallBackgroundImageId);
		if (sBackgroundImageURL) {
			this._setBackgroundImage(sBackgroundImageURL);
		}
	};

	TopLevelPage.resetBackgroundImage = function() {
		var sDefaultURL = this.getDefaultBackgroundImageURL();
		if (sDefaultURL) {
			this._setBackgroundImage(sDefaultURL);
		} else {
			this._removeBackgroundImage();
		}
	};

	TopLevelPage.getDefaultBackgroundImageURL = function() {
		var bIsHighContrast = Configuration.getTheme() === "THEME_HIGHCONTRAST";
		var sBackgroundImageURL = Configuration.getFrontofficeDefaultBackgroundImageURL(bIsHighContrast);
		var sSmallBackgroundImageId = Configuration.getMobileSmallDefaultBackgroundImageURL();

		return this._selectAppropriateBackgroundImageURL(sBackgroundImageURL, sSmallBackgroundImageId);
	};

	TopLevelPage.updateBackgroundColor = function(sColorCode) {
		function hexToRgb(hex) {
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : null;
		}

		function colorLuminance(hex, lum) {
			// validate hex string
			hex = String(hex).replace(/[^0-9a-f]/gi, '');
			if (hex.length < 6) {
				hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
			}
			lum = lum || 0;
			// convert to decimal and change luminosity
			var lighterColor = "#",
				c, i;
			for (i = 0; i < 3; i++) {
				c = parseInt(hex.substr(i * 2, 2), 16);
				c = Math.round(Math.min(Math.max(0, c + (c * lum)), 220)).toString(16);
				lighterColor += ("00" + c).substr(c.length);
			}
			return lighterColor;
		}
		if (sColorCode) {

			var oComponent = this.getOwnerComponent();
			var oRootController = oComponent.getRootController();
			var oShellRef = oRootController.byId("innerShell").getDomRef();
			var aRGB = hexToRgb(sColorCode);
			var hexLighter = colorLuminance(sColorCode, 0.7);
			var aRGBL = hexToRgb(hexLighter);
			$(oShellRef).css("background-color", "#" + sColorCode);
			if (sColorCode === "FFFFFF") {
				// sBGBodyColor = "";
				//$(oShellRef).css("background-image", sBGBodyColor);
				this.resetBackgroundImage();
			} else {
				$(oShellRef).css('background-image', 'none');
				var sBGBodyColorWebKit = "-webkit-linear-gradient(top, rgba(" + aRGB.r + "," + aRGB.g + "," + aRGB.b + "," + "0.2) 70%, rgba(" + aRGB.r +
					"," + aRGB.g + "," + aRGB.b + "," + "0.9) 100%)";
				var sBGBodyColorIE = "-ms-linear-gradient(top, #ffffff 10%, rgba(" + aRGB.r + "," + aRGB.g + "," + aRGB.b + "," + "0.9) 100%)";
				var sBGBodyColorW3C = "linear-gradient(to bottom, rgba(" + aRGBL.r + "," + aRGBL.g + "," + aRGBL.b + "," + "1) 30%, rgba(" + aRGB.r +
					"," + aRGB.g + "," + aRGB.b + "," + "1) 90%)";
				var sBGBodyColorFF = "-moz-linear-gradient(top, #ffffff 10%, rgba(" + aRGB.r + "," + aRGB.g + "," + aRGB.b + "," + "0.9) 100%)";
				$(oShellRef).css("background-image", sBGBodyColorWebKit);
				$(oShellRef).css("background-image", sBGBodyColorIE);
				$(oShellRef).css("background-image", sBGBodyColorW3C);
				$(oShellRef).css("background-image", sBGBodyColorFF);
			}
		} else {
			this.resetBackgroundImage();
		}

	};

	/**
	 * Takes some properties of the navigation source if they can be reused in the navigation target
	 * @param oSourceController The controller of the navigation source
	 * @returns {boolean} true/false if something was navigate
	 */
	TopLevelPage.reusePropertiesOnNavigation = function(oSourceController) {
		//Empty, return false, to indicate that nothing could be reused
		return false;
	};

	TopLevelPage._selectAppropriateBackgroundImageURL = function(sBackgroundImageURL, sSmallBackgroundImageURL) {
		var sImageURL = sBackgroundImageURL;
		if (Device.system.phone) {
			sImageURL = sSmallBackgroundImageURL;
		}

		if (jQuery.isNumeric(sImageURL)) {
			return Configuration.getAttachmentTitleImageDownloadURL(sImageURL);
		} else {
			//do not return the non-numeric images, as this is the default image. by default, we display nothing
			//return ("/" + sImageURL);
			return null;
		}
	};

	TopLevelPage._setBackgroundImage = function(sURL) {
		var oComponent = this.getOwnerComponent();
		var oRootController = oComponent.getRootController();
		var oShellRef = oRootController.byId("innerShell").getDomRef();
		if ($(oShellRef).css("background-image") !== sURL) {
			if (sURL) {
				$(oShellRef).css("background-image", "url(" + sURL + ")");
				oRootController.byId("app").setBackgroundOpacity(0.5);
			} else {
				$(oShellRef).css("background-image", "");
				oRootController.byId("app").setBackgroundOpacity(1);
			}
		}
	};

	// TODO removing the image from the app causes a rerendering e.g. of the idea list what results in losing the scrolling location => change this 
	TopLevelPage._removeBackgroundImage = function() {
		this._setBackgroundImage(undefined);
	};

	TopLevelPage._onRouteMatched = function(oEvent) {
		this._oComponent.setCurrentRoute(oEvent.getParameter("name"));
		if (jQuery.type(this.onRouteMatched) === "function") {
			if (this.getViewProperty("/HIDE_SYS_MSG") === true || this._oComponent.getRootController().byId("systemMessage").data().msgClosed) {
				this._oComponent.getRootController().byId("systemMessage").setProperty("visible", false);
				this._oComponent.getRootController().byId("innerShell").removeStyleClass("sapInoInnoMgmtMShellMsg");
			} else {
				this._oComponent.getRootController().byId("systemMessage").setProperty("visible", true);
				this._oComponent.getRootController().byId("innerShell").addStyleClass("sapInoInnoMgmtMShellMsg");
			}
			this.onRouteMatched(oEvent);
		}
		if (!this.bKeepMessages) {
			var oMsgMgr = sap.ui.getCore().getMessageManager();
			oMsgMgr.removeAllMessages();
		}
		if (!this.hasBackgroundImage || !this.hasBackgroundImage()) {
			this.resetBackgroundImage();
		}
		this._oComponent.getRootController().onAfterNavigate();
	};

	TopLevelPage._onAnyRouteMatched = function(oEvent) {
		if (jQuery.type(this.onAnyRouteMatched) === "function") {
			this.onAnyRouteMatched(oEvent);
		}
	};

	TopLevelPage._onBypassed = function(oEvent) {
		// TODO duplicate to JSON manifest
		this._oComponent.setCurrentRoute("home");
		this._oComponent.getRootController().onBypassedNavigate();
	};

	return TopLevelPage;
});