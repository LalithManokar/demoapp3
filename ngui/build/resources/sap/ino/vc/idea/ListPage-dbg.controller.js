sap.ui.define([
    "sap/ino/vc/idea/List.controller",
    "sap/ino/vc/commons/TopLevelPageFacet"
], function(IdeaList,
	TopLevelPageFacet) {
	"use strict";

	return IdeaList.extend("sap.ino.vc.idea.ListPage", jQuery.extend({}, TopLevelPageFacet, {
		/* Controller reacts when these routes match */
		routes: ["idealist", "idealistvariant"],

		onRouteMatched: function(oEvent) {
			this.setGlobalFilter([]);
			this.setHelp("IDEA_LIST");
			if (this.getRoute() === 'idealist') {
			    this._iCampaignId = null;
			    this.campaignId = null;
			}
			this.show(oEvent);
		},

		onAfterShow: function() {
// 			this._bPreviouslyFullscreen = this.getFullScreen();
// 			if (!this._bPreviouslyFullscreen) {
// 				this.setFullScreen(true);
// 			}
		},

		onBeforeHide: function() {
// 			this.setFullScreen(this._bPreviouslyFullscreen);
		}
	}));
});