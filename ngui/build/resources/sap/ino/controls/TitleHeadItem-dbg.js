/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/unified/ShellHeadItem"
], function(ShellHeadItem) {
	"use strict";

	return ShellHeadItem.extend("sap.ino.controls.TitleHeadItem", {
		metadata: {
			properties: {
				text: {
					type: "string"
				}
			}
		},
		setText: function(sText) {
			if (sText) {
				this.setProperty("text", sText, true);
			}
			this._refreshIcon();
		},

		_refreshIcon: function() {
			var sText = this.getText();
			if (jQuery("#sapInoLogoTextInfo").length === 0) {
				this.$().append("<div tabindex='0' id='sapInoLogoTextInfo'/>");
			}
			this.$().removeAttr('tabindex');
			jQuery("#sapInoLogoTextInfo").addClass("sapInoLogoTextInfo");
			jQuery("#sapInoLogoTextInfo").text(sText);

			//return oIcon;
		}		

	});
});