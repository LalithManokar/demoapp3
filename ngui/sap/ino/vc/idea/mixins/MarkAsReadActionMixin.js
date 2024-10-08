sap.ui.define([
    "sap/ino/vc/idea/mixins/BaseActionMixin",
    "sap/ino/vc/commons/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/models/object/Idea",
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast",
    "sap/ui/Device",
    "sap/ui/core/ListItem",
    "sap/m/Token",
    "sap/ino/commons/models/object/User",
    "sap/ui/core/MessageType",
    "sap/ui/core/message/Message",
    "sap/m/MessageBox",
    "sap/ino/commons/application/Configuration",
    "sap/ino/commons/models/object/IdeaLatest",
    "sap/ui/core/BusyIndicator"
], function(BaseActionMixin, BaseController, JSONModel, Idea, PropertyModel, Filter, FilterOperator, Sorter, MessageToast, Device, ListItem,
	Token, User, MessageType, Message, MessageBox, Configuration, IdeaLatest, BusyIndicator) {
	"use strict";
	var MarkAsReadActionMixin = jQuery.extend({}, BaseActionMixin);
	var mLatestUpdate = {
		NEW_IDEAS: "SHOW_CREATED_VIEWER",
		NEW_UPDATES: "SHOW_UPDATED_VIEWER",
		NEW_STATUSES: "SHOW_STATUSCHANGE_VIEWER",
		NEW_COMMENTS: "SHOW_COMMENT_VIEWER"
	};
	MarkAsReadActionMixin.onMassMarkAsRead = function(oEvent) {
		var oSource = oEvent.getSource();
		if (this.getModel("markAsRead")) {
			this.getModel("markAsRead").destroy();
		}
		var aLatestUpdate = this.getViewProperty("/List/LATEST_UPDATE");
		var aItems = this.getList().getItems();
		var oEnableProperty = {
			markAllRead: true,
			//"NEW_IDEAS": true,
			"NEW_UPDATES": true,
			"NEW_STATUSES": true,
			"NEW_COMMENTS": true
		};
		if (aLatestUpdate && aLatestUpdate.length > 0) {
			jQuery.each(mLatestUpdate, function(key, value) {
				oEnableProperty[key] = aLatestUpdate.indexOf(value) > -1 ? true : false;
			});
			oEnableProperty.markAllRead = false;
		}
		if (aItems.length === 0) {
			oEnableProperty = {
				markAllRead: false,
				//"NEW_IDEAS": false,
				"NEW_UPDATES": false,
				"NEW_STATUSES": false,
				"NEW_COMMENTS": false
			};
		}
		var oModel = new JSONModel(oEnableProperty);
		this.setModel(oModel, "markAsRead");

		this._openMarkAsReadActionSheet(oSource);
	};

	MarkAsReadActionMixin._openMarkAsReadActionSheet = function(oSource) {
		if (!this._oMarkReadActionSheet) {
			this._oMarkReadActionSheet = this.createFragment("sap.ino.vc.idea.fragments.MarkAsReadActionSheet", this.getView().getId());
			this.getView().addDependent(this._oMarkReadActionSheet);
		}
		jQuery.sap.delayedCall(0, this, function() {
			this._oMarkReadActionSheet.openBy(oSource);
		});
	};

	MarkAsReadActionMixin.onMarkAllRead = function(oEvent) {
		this.onMarkAsReadCommon(oEvent, 'all');
	};
	MarkAsReadActionMixin.onMarkCreatedRead = function(oEvent) {
		this.onMarkAsReadCommon(oEvent, 'created');
	};
	MarkAsReadActionMixin.onMarkStatusRead = function(oEvent) {
		this.onMarkAsReadCommon(oEvent, 'status');
	};
	MarkAsReadActionMixin.onMarkUpdatedRead = function(oEvent) {
		this.onMarkAsReadCommon(oEvent, 'updated');
	};
	MarkAsReadActionMixin.onMarkCommentRead = function(oEvent) {
		this.onMarkAsReadCommon(oEvent, 'comment');
	};

	MarkAsReadActionMixin.onMarkAsReadCommon = function(oEvent, sType) {
		//According to different type to call different service, after that then rebind list.
		var aTypeCode = [];
		switch (sType) {
// 			case 'created':
// 				aTypeCode.push("CreatedViewer");
// 				break;
			case 'status':
				aTypeCode.push("StatusChangeViewer");
				break;
			case 'updated':
				aTypeCode.push("UpdatedViewer");
				break;
			case 'comment':
				aTypeCode.push("CommentViewer");
				break;
			case 'all':
				aTypeCode = ["CreatedViewer", "UpdatedViewer", "StatusChangeViewer", "CommentViewer"];
				break;
		}
		//var oDataPra = {"TYPE_CODE": aTypeCode};
		var oParameters = this._getFilterParameters();
		oParameters.TYPE_CODE = aTypeCode;
		var oRequest = IdeaLatest.deleteViewerByObjectIdAndTypeCode(oParameters);
		var that = this;
		BusyIndicator.show(0);
		oRequest.done(function(oRes) {
			MessageToast.show(that.getText("IDEA_OBJECT_MSG_MARK_AS_READ_SUCCESS"));
			BusyIndicator.hide();
			that.getIdeaFilterCount(that.getQuery());				
			that.bindList();
		}).fail(function(oRes) {
			MessageToast.show(that.getText("IDEA_OBJECT_MSG_MARK_AS_READ_FAIL"));

		});

	};
	MarkAsReadActionMixin._getFilterParameters = function() {
		var oBindingParams = this.getBindingParameter();
		var bIsManaged = this._check4ManagingList();
		var sFilterParams = this.getList().getBinding('items').sFilterParams;

		var sIdeaformFilters = this.getIdeaformFilters().replace(/\'/g, "").replace(/\"/g, "").split(",");
		var aCompanyViewFilters = this.getCompanyViewFilters().replace(/\'/g, "").replace(/\"/g, "").split(",");
		var aTags = this.getViewProperty("/List/TAGS");
		var tagGroup = {};
		var tagGroupKey = [];
		aTags.forEach(function(item, index) {
			if (!tagGroup[item.ROOTGROUPID]) {
				tagGroup[item.ROOTGROUPID] = [];
				tagGroup[item.ROOTGROUPID].push(item.ID);
				tagGroupKey.push(item.ROOTGROUPID);
			} else {
				tagGroup[item.ROOTGROUPID].push(item.ID);
			}
		});

		var oParameter = {
			searchToken: oBindingParams.SearchTerm || "",
			tagsToken: tagGroup[tagGroupKey[0]] ? tagGroup[tagGroupKey[0]].join(",") : "",
			tagsToken1: tagGroup[tagGroupKey[1]] ? tagGroup[tagGroupKey[1]].join(",") : "",
			tagsToken2: tagGroup[tagGroupKey[2]] ? tagGroup[tagGroupKey[2]].join(",") : "",
			tagsToken3: tagGroup[tagGroupKey[3]] ? tagGroup[tagGroupKey[3]].join(",") : "",
			tagsToken4: tagGroup[tagGroupKey[4]] ? tagGroup[tagGroupKey[4]].join(",") : "",
			filterName: oBindingParams.VariantFilter || "",
			filterBackoffice: bIsManaged ? "1" : "0",
			c1: sIdeaformFilters[1].slice(3) || "",
			o1: sIdeaformFilters[2].slice(3) || -1,
			v1: unescape(sIdeaformFilters[3].slice(3)) || "",
			c2: sIdeaformFilters[4].slice(3) || "",
			o2: sIdeaformFilters[5].slice(3) || -1,
			v2: unescape(sIdeaformFilters[6].slice(3)) || "",
			c3: sIdeaformFilters[7].slice(3) || "",
			o3: sIdeaformFilters[8].slice(3) || -1,
			v3: unescape(sIdeaformFilters[9].slice(3)) || "",
			cvy: aCompanyViewFilters[3].slice(4) || 0,
			cvr: aCompanyViewFilters[2].slice(4) || 0,
			cvt: decodeURIComponent(aCompanyViewFilters[1].slice(4)) || "",
			filterString: sFilterParams || ""
		};
		oParameter.ideasId = "";
		if(!bIsManaged){
		    var oGroupVariant = this.getGroupViewParameters(oBindingParams);
		    oParameter.cvy = oGroupVariant.groupType;
		    oParameter.cvr = oGroupVariant.groupRole;
		    oParameter.cvt = oGroupVariant.groupToken;
		} else {
		    oParameter.searchType = this.getSearchType();
		}
		

		var sFilterContent = oParameter.filterString ? (/\$filter=(.*)/gm.exec(sFilterParams)[1]) : "";

		oParameter.filterString = "$filter=(" + sFilterContent + ")";

		return oParameter;
	};
	MarkAsReadActionMixin.onIdeaReadPress = function(oEvent) {
		var oItem = oEvent.getSource();
		var oContext = oItem.getBindingContext("data");
		var oParameters = {},
			aTypeCode = [];
		aTypeCode = ["CreatedViewer", "UpdatedViewer", "StatusChangeViewer", "CommentViewer"];
		oParameters.TYPE_CODE = aTypeCode;
		oParameters.IDEA_ID = oContext.getProperty("ID");
		var oRequest = IdeaLatest.deleteViewerByObjectIdAndTypeCode(oParameters);
		var that = this;
		oRequest.done(function(oRes) {
			MessageToast.show(that.getText("IDEA_OBJECT_MSG_MARK_AS_READ_SUCCESS"));
			that.getIdeaFilterCount(that.getQuery());				
			that.bindList();
		}).fail(function(oRes) {
			MessageToast.show(that.getText("IDEA_OBJECT_MSG_MARK_AS_READ_FAIL"));
		});
	};
	return MarkAsReadActionMixin;
});