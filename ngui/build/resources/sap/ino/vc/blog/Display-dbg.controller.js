sap.ui.define([
    "sap/ino/vc/commons/BaseObjectController",
    "sap/ino/commons/models/object/Blog",
    "sap/m/MessageToast",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/application/Configuration",
    "sap/ino/commons/formatters/BaseFormatter",
    "sap/ino/vc/commons/mixins/TagCardMixin",
    "sap/ino/vc/commons/mixins/FollowMixin"
], function(BaseController, Blog, MessageToast, TopLevelPageFacet, JSONModel, Configuration, BaseFormatter, TagCardMixin, FollowMixin) {
	"use strict";

	return BaseController.extend("sap.ino.vc.blog.Display", jQuery.extend({}, TopLevelPageFacet, TagCardMixin, FollowMixin, {
		routes: ["blog-display"],

		onInit: function() {
			BaseController.prototype.onInit.apply(this, arguments);
			this.setViewProperty("/EDIT", false);
		},

		onRouteMatched: function() {
			BaseController.prototype.onRouteMatched.apply(this, arguments);
			this.setHelp("CAMPAIGN_BLOG_MODIFY");
		},

		createObjectModel: function(vObjectKey) {
			var oSettings = {
				nodes: ["Root"],
				actions: ["modify", "del", "unPublish"],
				continuousUse: true,
				readSource: {
					model: this.getDefaultODataModel()
				}
			};
			var oModel = new Blog(vObjectKey, oSettings);
			oModel.setProperty("/InitRefObjectId", vObjectKey);
			return oModel;
		},

		getODataEntitySet: function() {
			// can be redefined if OData Model is needed;
			return "CampaignBlogsFull";
		},

		onEdit: function() {
			var oCurrrentModel = this.getObjectModel();
			this.navigateTo("blog-edit", {
				id: oCurrrentModel.getKey()
			});
		},
		onOpenCreator: function(oEvent) {
			var oSource = oEvent.getSource();
			var iIdentityId = oSource.getBindingContext("data").getProperty("CREATED_BY_ID");
			if (!this.oIdentityCardView) {
				this.oIdentityCardView = sap.ui.xmlview({
					viewName: "sap.ino.vc.iam.IdentityCard"
				});
				this.getView().addDependent(this.oIdentityCardView);
			}
			this.oIdentityCardView.getController().open(oSource, iIdentityId);
		},
		/**
		 * Cancels object editing and navigates back
		 */
		onCancel: function() {
			// ask the user if the pending changes should be thrown away => during navigation
			//this.resetPendingChanges();
			this.navigateBack();
		},

		onPublish: function() {
			this._executeAction("majorPublishSubmit");
		},

		onPublishAction: function(oEvent) {
			var sItem = oEvent.getParameter("item");
			if (!sItem) {
				return;
			}
			this._executeAction(sItem.getProperty("key") || "publishSubmit");
		},

		onUnPublish: function() {
			this._executeAction("unPublishSubmit");
		},

		onCampaignPressed: function(oEvent) {
			// prevent href
			oEvent.preventDefault();

			var iId = this.getObjectModel().getProperty("/CAMPAIGN_ID");
			this.navigateTo("campaign", {
				id: iId
			});
		},

		onImgPressed: function(oEvent) {
			sap.m.URLHelper.redirect(oEvent.oSource.getProperty("src"), true);
		},

		onIconPressed: function(oEvent) {
			var oItemList = oEvent.oSource.oParent.getItems();
			if (oItemList && oItemList.length >= 2) {
				sap.m.URLHelper.redirect(oItemList[2].getProperty("href"), true);
			}
		},

		showPopupTagCard: function(oEvent) {
			this._bIsTokenPressed = true;
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("sap.ino.vc.tag.fragments.TagCardPopover", this);
				this.getView().addDependent(this._oPopover);
			}
			var oToken = oEvent.getSource();
			var sPath = "/SearchTagsAll(searchToken='',ID=" + oToken.getKey() + ")";
			var oDatamodel = this.getModel("data");
			var that = this;
			oDatamodel.read(sPath, {
				async: true,
				success: function(oData) {
					var oModel = new JSONModel();
					oModel.setData(oData);
					that._oPopover.setModel(oModel, "Tag");
					jQuery.sap.delayedCall(0, that, function() {
						that._oPopover.openBy(oToken);
					});
				}
			});
		},

		_executeAction: function(sAction) {
			var oController = this;
			oController.resetClientMessages();
			oController.executeObjectAction(sAction);
		},

		iconUrl: function(fileName) {
			var e = this._splitFilename(fileName).extension;
			if (jQuery.type(e) === 'string') {
				e = e.toLowerCase();
			}
			switch (e) {
				case '.bmp':
				case '.jpg':
				case '.jpeg':
				case '.png':
					return "sap-icon://camera";
				case '.csv':
				case '.xls':
				case '.xlsx':
					return 'sap-icon://excel-attachment';
				case '.doc':
				case '.docx':
				case '.odt':
					return 'sap-icon://doc-attachment';
				case '.pdf':
					return 'sap-icon://pdf-attachment';
				case '.ppt':
				case '.pptx':
					return 'sap-icon://ppt-attachment';
				case '.txt':
					return 'sap-icon://document-text';
				default:
					return 'sap-icon://document';
			}
		},
		_splitFilename: function(s) {
			var r = {};
			var n = s.split('.');
			if (n.length === 1) {
				r.extension = '';
				r.name = n.pop();
				return r;
			}
			r.extension = '.' + n.pop();
			r.name = n.join('.');
			return r;
		}
	}));
});