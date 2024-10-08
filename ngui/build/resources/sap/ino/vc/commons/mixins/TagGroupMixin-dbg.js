sap.ui.define([], function() {
	"use strict";

	/**
	 * @class
	 * Mixin that relate to tag group
	 */
	var TagGroupMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	TagGroupMixin.groupByTagGroup = function(aGroupList, aSelectedTag, sOtherTxt) {
		if (!aGroupList) {
			return aGroupList;
		}
		var that = this;
		var aRankedTag = aGroupList;
		aRankedTag.sort(function(oPrevious, oNext) {
			return that._sortTag(oPrevious, oNext, "GROUP_NAME");
		});
		var aTagGroups = [];
		jQuery.each(aRankedTag, function(index, oGroup) {
			if (that._filterByGroupId(aTagGroups, oGroup.GROUP_ID).length === 0) {
				aTagGroups.push({
					GROUP_EXPANDED: that._filterByGroupId(aSelectedTag, oGroup.GROUP_ID).length > 0,
					GROUP_DESCRIPTION: oGroup.GROUP_DESCRIPTION,
					GROUP_ID: oGroup.GROUP_ID,
					GROUP_NAME: oGroup.GROUP_NAME || sOtherTxt,
					GROUP_TAGS: that._getTagFromGroup(aRankedTag, oGroup)
				});
			}
		});
		return aTagGroups;
	};

	TagGroupMixin.setTagCloudProperty = function(oTagData, bHasGroup) {
		if (oTagData.length === 1 && !bHasGroup) {
			oTagData[0].GROUP_EXPANDED = true;
			this.setViewProperty("/List/TAGCLOUD_EXPABLE", false);
			this.setViewProperty("/List/TAGCLOUD_EXP", true);
			this.setViewProperty("/List/TAGCLOUD_BAR_VISIBLE", false);
		} else {
			this.setViewProperty("/List/TAGCLOUD_EXPABLE", true);
			this.setViewProperty("/List/TAGCLOUD_EXP", false);
			this.setViewProperty("/List/TAGCLOUD_BAR_VISIBLE", true);
		}
	};

	TagGroupMixin._sortTag = function(oPrevious, oNext, sSortField) {
		if (oPrevious[sSortField] === null) {
			return 1;
		}
		if (oNext[sSortField] === null) {
			return -1;
		}
		var oPreviousField = oPrevious[sSortField].toUpperCase();
		var oNextField = oNext[sSortField].toUpperCase();
		if (oPreviousField > oNextField) {
			return 1;
		}
		if (oPreviousField < oNextField) {
			return -1;
		}
		return 0;
	};

	TagGroupMixin._getTagFromGroup = function(oRankedTag, oCurrentGroup) {
		var that = this;
		var result = jQuery.map(that._filterByGroupId(oRankedTag, oCurrentGroup.GROUP_ID), function(oGroup) {
			return {
				GROUP_ID: oCurrentGroup.GROUP_ID,
				ID: oGroup.ID,
				NAME: oGroup.NAME,
				RANK: oGroup.RANK
			};
		});
		result.sort(function(oPrevious, oNextField) {
			return that._sortTag(oPrevious, oNextField, "NAME");
		});
		return result;
	};

	TagGroupMixin._filterByGroupId = function(aGroupList, sGroupId) {
		return jQuery.grep(aGroupList, function(element) {
			return sGroupId === element.GROUP_ID;
		});
	};

	return TagGroupMixin;
});