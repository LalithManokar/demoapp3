/*!
 * @copyright@
 */
sap.ui.define([
    "sap/m/VBox"
], function(VBox) {
	"use strict";
	var VBoxWithSubmitEvent = VBox.extend("sap.ino.controls.VBoxWithSubmitEvent", {
		metadata: {
			events: {
				submit: {}
			}
		},
		renderer:"sap.m.VBoxRenderer"
	});
	VBoxWithSubmitEvent.prototype.onkeydown = function(oEvent) {
		if (oEvent.which === jQuery.sap.KeyCodes.ENTER) {
			this.fireSubmit({/* no parameters */});
		}
	};
	return VBoxWithSubmitEvent;
});