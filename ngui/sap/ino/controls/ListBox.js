/*!
 * @copyright@
 */
sap.ui.define([
	"sap/ui/commons/ListBox"
], function(ListBox) {
	"use strict";
	/**
	 * Works similar to sap.ui.commons.ListBox without the need of pressing the ctrl key in case of multiselect
	 *
	 * @see sap.ui.commons.ListBox
	 */

	return ListBox.extend("sap.ino.controls.ListBox", {
		_handleUserActivationPlain: function(iIndex, oItem) {
			if (this.getAllowMultiSelect()) {
				this._handleUserActivationCtrl(iIndex, oItem);
			} else {
				ListBox.prototype._handleUserActivationPlain.apply(this, [iIndex, oItem]);
			}
		},

		renderer: "sap.ui.commons.ListBoxRenderer"
	});
});