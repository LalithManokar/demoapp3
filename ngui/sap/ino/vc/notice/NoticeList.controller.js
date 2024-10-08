sap.ui.define([
    "sap/ino/vc/commons/BaseController",
    "sap/ino/commons/application/Configuration",
    "sap/ui/model/json/JSONModel",
    "sap/ino/vc/commons/TopLevelPageFacet",
    "sap/ui/Device",
    "sap/ino/vc/commons/mixins/ClipboardMixin",
    "sap/ino/vc/commons/mixins/IdentityQuickviewMixin",
    "sap/ino/commons/formatters/ObjectListFormatter"
], function(
	BaseController,
	Configuration,
	JSONModel,
	TopLevelPageFacet,
	Device,
	ClipboardMixin,
	IdentityQuickviewMixin,
	ObjectListFormatter
) {
	"use strict";

	var mList = {
		"newIdeas": {
			sPath: "data>/MyIdeaMediumCommunity"
		},
		"newStatus": {
			sPath: "data>/IdeaMediumCommunity"
		},
		"newComments": {
			sPath: "data>/IdeaMediumSearchParams(searchToken='',tagsToken='',tagsToken1='',tagsToken2='',tagsToken3='',tagsToken4='',filterName='completedIdeas',filterBackoffice=0,c1='',o1=-2,v1='',c2='',o2=-1,v2='',c3='',o3=-1,v3='')/Results"
		}
	};
	
	var IdeaComment = [{
	    ID: 36338,
        CREATED_AT: "/Date(1566541324522)/",
        CREATED_BY_ID: 814053,
        CHANGED_AT: "/Date(1566541324522)/",
        CHANGED_BY_ID: 814053,
        OBJECT_ID: 314794,
        COMMENT: "Can you demo the POC to us.",
        PARENT_ID: null,
        CHANGED_BY_NAME: "Allen Zhang",
        CHANGED_BY_EMAIL: "allen.zhang07@sap.com",
        CHANGED_BY_PHONE: null,
        CHANGED_BY_MOBILE: "1",
        CHANGED_BY_OFFICE: null,
        CHANGED_BY_IMAGE_ID: null,
        CREATED_BY_NAME: "Allen Zhang",
        CREATED_BY_EMAIL: "allen.zhang07@sap.com",
        CREATED_BY_PHONE: null,
        CREATED_BY_MOBILE: "1",
        CREATED_BY_OFFICE: null,
        CREATED_BY_IMAGE_ID: null,
        HAS_ATTACHMENTS: 0,
        HAS_REPLIES: 1,
        CAN_UPDATE: 1,
        CAN_DELETE: 1,
        SOURCE_ID: null,
        STATUS: 0,
        ChildrenComments:[{
            ID: 36338,
            CREATED_AT: "/Date(1566541324522)/",
            CREATED_BY_ID: 814053,
            CHANGED_AT: "/Date(1566541324522)/",
            CHANGED_BY_ID: 814053,
            OBJECT_ID: 314794,
            COMMENT: "Can you demo the POC to us.",
            PARENT_ID: null,
            CHANGED_BY_NAME: "Allen Zhang",
            CHANGED_BY_EMAIL: "allen.zhang07@sap.com",
            CHANGED_BY_PHONE: null,
            CHANGED_BY_MOBILE: "1",
            CHANGED_BY_OFFICE: null,
            CHANGED_BY_IMAGE_ID: null,
            CREATED_BY_NAME: "Allen Zhang",
            CREATED_BY_EMAIL: "allen.zhang07@sap.com",
            CREATED_BY_PHONE: null,
            CREATED_BY_MOBILE: "1",
            CREATED_BY_OFFICE: null,
            CREATED_BY_IMAGE_ID: null,
            HAS_ATTACHMENTS: 0,
            HAS_REPLIES: 1,
            CAN_UPDATE: 1,
            CAN_DELETE: 1,
            SOURCE_ID: null,
            STATUS: 0
        }]
    }];

	return BaseController.extend("sap.ino.vc.notice.NoticeList", jQuery.extend({}, TopLevelPageFacet, ClipboardMixin, IdentityQuickviewMixin, {
		routes: ["noticelist"],

		formatter: jQuery.extend({}, ObjectListFormatter),

		view: {
			"showCommentDialogBtn": false
		},

		onInit: function() {
			BaseController.prototype.onInit.apply(this, arguments);
			this.oViewModel = this.getModel("view");
			this.oViewModel.setData(this.view, true);
		},

		onRouteMatched: function() {
			this.bindViewData();
		},
		
		onItemPress: function(oEvent) {
			var oItem = oEvent.getSource();
			var oContext = oItem.getBindingContext("data");
			if (oContext) {
				this.navigateTo("idea-display", {
					id: oContext.getProperty("ID")
				});
			}
		},

		onNoticeListTypeSelect: function(oEvent) {
			this._sIdeaViewKey = oEvent.getParameter("key");

			this.onSwitchButtonStyle(oEvent);

			if (this._sIdeaViewKey === "newComments") {
				this.setViewProperty("/showCommentDialogBtn", true);
			} else {
				this.setViewProperty("/showCommentDialogBtn", false);
			}
			this._bindIdeas(this._sIdeaViewKey);
		},

		bindViewData: function() {
			var sIdeaViewKey;
			sIdeaViewKey = this.byId("sapInoNoticeUpdateButtons").getSelectedKey();
			this._sIdeaViewKey = sIdeaViewKey || Object.keys(mList)[0];
			this._bindIdeas(this._sIdeaViewKey);
		},

		_bindIdeas: function(sKey) {
			var disableImage = Configuration.getSystemSetting("sap.ino.config.DISABLE_IDEA_IMAGE") * 1 || Configuration.getSystemSetting(
				"sap.ino.config.DISABLE_IDEA_IMAGE_HIDE_PHASE_BAR") * 1;
			var template = Number(disableImage) ? this.getFragment("sap.ino.vc.notice.fragments.NoticeListItemNoImage") : this.getFragment(
				"sap.ino.vc.notice.fragments.NoticeListItem");
			var oTemplate = {
				path: mList[sKey].sPath,
				template: template
			};
			var that = this;
			var oList = this.byId("noticeIdeaList");
			oList.bindItems(oTemplate);
			oList.attachEventOnce("updateFinished", function(oEvent) {
				that.onResizeLayoutChange(null, that._sCurrentLayout);
			});
		},

		onSwitchButtonStyle: function(oEvent) {
			var oSource = oEvent.getSource();
			var aItems = oSource.getItems();
			var oKey = oSource.getSelectedKey();
			var sIconName,iPosition;
			jQuery.each(aItems, function(index, oItem) {
				if (oItem.getKey() === oKey) {
					oItem.setDisplayNotice(false);
					oItem.setTextVisible(true);
					sIconName = oItem.getIcon();
					oItem.setIcon(sIconName + "-selected");
				} else {
					oItem.setDisplayNotice(true);
					oItem.setTextVisible(false);
					sIconName = oItem.getIcon();
					iPosition = sIconName.indexOf("-selected");
					if(iPosition > 0){
					  oItem.setIcon(sIconName.substr(0,iPosition));  
					}
				}
			});
		},
		
		openCommentDialog: function(oEvent) {
			if (!this._oCommentDialogPopover) {
				this._oCommentDialogPopover = this.createFragment("sap.ino.vc.notice.fragments.NoticeCommentDialog");
				this.getView().addDependent(this._oCommentDialogPopover);

			}
			if (!this._oCommentDialogPopover.isOpen()) {
			    this._oCommentDialogPopover.setModel(new JSONModel(oEvent.getSource().getBindingContext("data").getObject()), "CommentData");
			    this._oCommentDialogPopover.setModel(new JSONModel(IdeaComment), "IdeaComment");
				this._oCommentDialogPopover.openBy(oEvent.getSource());
			} else {
				this.closeNotifications();
			}
		},

		closeNotifications: function() {
			if (this._oCommentDialogPopover && this._oCommentDialogPopover.isOpen()) {
				this._oCommentDialogPopover.close();
			}
		}

	}));

});