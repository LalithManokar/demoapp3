/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
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