/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/unified/ShellHeadItem",
    'sap/ui/core/IconPool'
], function(
	ShellHeadItem,
	IconPool) {
	"use strict";

	/**
	 *
	 * Specialized HeadShellItem to render Back button
	 *
	 * <ul>
	 * <li>Properties
	 * <ul>
	 * <li>path: binding path to menu items</li>
	 * </ul>
	 * </li>
	 * </ul>
	 */
	return ShellHeadItem.extend("sap.ino.controls.BackHeadItem", {
		metadata: {
			properties: {
				enabled: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				}
			},
			events: {
				backMenuOpen: {}
			}
		},

		onclick: function(oEvent) {
			oEvent.preventDefault();
		},

		_toggleIcon: function($Link, sIconName) {
			if (IconPool.isIconURI(sIconName)) {
				var oIconInfo = IconPool.getIconInfo(sIconName);
				if (oIconInfo) {
					$Link.find("span").text(oIconInfo.content).css("font-family", "'" + oIconInfo.fontFamily + "'");
				}
			}
		},

		_refreshIcon: function() {
			var that = this;
			var $LinkBegin = this.$();
			var i18nModel = sap.ui.getCore().getLibraryResourceBundle("sap.ino.controls");
            var sTitle;
			if(i18nModel){
			  sTitle = i18nModel.getText("CTRL_NAVIGATION_HISTORY");
			}
			ShellHeadItem.prototype._refreshIcon.apply(this, arguments);
			if(!this.getVisible() || $LinkBegin.next(".sapInoBackBtnEnd").length > 0){
			    return;
			}
			$LinkBegin.addClass("sapInoBackBtnBegin");
			$LinkBegin.attr('title', this.getTooltip());
			
			if (!$LinkBegin.next().hasClass("sapInoBackBtnEnd")) {
				$LinkBegin.after($(
					"<a role='button' aria-haspopup='true' tabindex='0' title='" + sTitle + "' href='javascript:void(0);' class='sapUiUfdShellHeadItm sapInoBackBtnEnd'><span></span></a>"));
			}
			var sIconName = "sap-icon://slim-arrow-down";
			var $LinkEnd = $LinkBegin.next();
			this._toggleIcon($LinkEnd, sIconName);
			if (!this.getEnabled()) {
				$LinkBegin
					.addClass("sapMLnkDsbl")
					.attr("aria-disabled", true)
					.attr("disabled", true)
					.unbind("click");
				$LinkEnd
					.addClass("sapMLnkDsbl")
					.attr("aria-disabled", true)
					.attr("disabled", true)
					.unbind("click");
			} else {
				$LinkBegin
					.removeClass("sapMLnkDsbl")
					.attr("aria-disabled", false)
					.attr("disabled", false)
					.bind("click", function(oEvent) {
						that.firePress();
						oEvent.preventDefault();
					});
				$LinkEnd
					.removeClass("sapMLnkDsbl")
					.attr("aria-disabled", false)
					.attr("disabled", false)
					.bind("click", function(oEvent) {
						that._toggleIcon($LinkEnd, "sap-icon://slim-arrow-up");
						that.fireBackMenuOpen();
						oEvent.preventDefault();
					});
			}

		},

		setEnabled: function(bEnabled) {
			bEnabled = !!bEnabled;
			this.setProperty("enabled", bEnabled, true);
			if (this.getDomRef()) {
				this._refreshIcon();
			}
			return this;
		}
	});
});