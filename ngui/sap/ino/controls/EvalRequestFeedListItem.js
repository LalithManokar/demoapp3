/*!
 * @copyright@
 */
sap.ui.define([
	"sap/m/FeedListItem"
], function(FeedListItem) {
	"use strict";
	var EvalRequestFeedListItem = FeedListItem.extend("sap.ino.controls.EvalRequestFeedListItem", {
		metadata: {
			properties: {
				"prefixSender": {
					type: "string",
					group: 'Data',
					defaultValue: null
				},
				"prefixToSender": {
					type: "string",
					group: 'Data',
					defaultValue: null
				},
				"toSender": {
					type: "string",
					group: 'Data',
					defaultValue: null
				}
			},
			events: {
				toSenderPress: {
					parameters: {
						domRef: {
							type: 'string'
						},
						getDomRef: {
							type: 'function'
						}
					}
				}
			}
		}
	});

	EvalRequestFeedListItem.prototype._getLinkToSender = function() {
		if (!this._oLinkToControl) {
			jQuery.sap.require('sap.m.Link');
			var that = this;
			this._oLinkToControl = new sap.m.Link({
				press: function() {
					that.fireToSenderPress({
						domRef: this.getDomRef(),
						getDomRef: this.getDomRef.bind(this)
					});
				}
			});
			this._oLinkToControl.setParent(this, null, true);
		}
		this._oLinkToControl.setProperty('text', this.getToSender(), true);
		this._oLinkToControl.setProperty('enabled', this.getSenderActive(), true);
		return this._oLinkToControl;
	};

	return EvalRequestFeedListItem;
});