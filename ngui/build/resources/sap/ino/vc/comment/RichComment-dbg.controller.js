/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ino/vc/commons/BaseObjectModifyController",
    "sap/ino/vc/comment/RichCommentCntrlMixin",
    "sap/ino/vc/comment/RichCommentMixin",
    "sap/ino/vc/comment/RichCommentAttachmentMixin",
    "sap/ino/commons/models/object/IdeaLatest",   
    "sap/ino/commons/formatters/BaseFormatter"    
], function(BaseObjectModifyController, RichCommentCntrlMixin, RichCommentMixin, RichCommentAttachmentMixin, IdeaLatest, BaseFormatter) {
	"use strict";
	return BaseObjectModifyController.extend("sap.ino.vc.comment.RichComment", jQuery.extend({}, RichCommentCntrlMixin, RichCommentMixin,
		RichCommentAttachmentMixin, {
			routes: "idea-display",
			formatter: BaseFormatter,
			sectionName: "sectionComments",
			onInit: function() {
				BaseObjectModifyController.prototype.onInit.apply(this, arguments);
				this.getView().setModel(null, "comment");
				this.richCommentMixinInitRouterEvent();
			},

			onAfterRendering: function() {
				this.richCommentMixinInit();
				this.richAttachmentMixinInit();
				this.setAccessibilityProperty();
			}
			
		}
	));
});