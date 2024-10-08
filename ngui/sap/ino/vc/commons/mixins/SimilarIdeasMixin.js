sap.ui.define([], function() {
	"use strict";

	/**
	 * @class
	 * Mixin that relate to similar ideas
	 */
	var SimilarIdeasMixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	SimilarIdeasMixin.groupByCampaignId = function(aIdeaList, nSelectedCampaignId, nSelectedCampaignName) {
		if (!aIdeaList) {
			return aIdeaList;
		}
		var that = this;
		var aIdeaGroups = [];
		//var selectedCampaignGroup;
		
		var selectedIdeaGroups = [];
		var  otherIdeaGroups = [];
		jQuery.each(aIdeaList, function(index, oIdea) {
			if (oIdea.CAMPAIGN_ID === nSelectedCampaignId) {
				selectedIdeaGroups.push(oIdea);
			}else{
			    otherIdeaGroups.push(oIdea);
			}
		});
        aIdeaGroups.push({
        	GROUP_NAME: that.getText("IDEA_SIMILAR_CURRENT_CAMPAIGN_NAME"),
        	IDEAS: selectedIdeaGroups
        });
        aIdeaGroups.push({
        	GROUP_NAME: that.getText("IDEA_SIMILAR_OTHER_CAMPAIGN_NAME"),
        	IDEAS: otherIdeaGroups
        });

// 		jQuery.each(aIdeaList, function(index, oIdea) {
// 			if (that._filterByCampaignId(aIdeaGroups, oIdea.CAMPAIGN_ID).length === 0) {
// 				aIdeaGroups.push({
// 					CAMPAIGN_ID: oIdea.CAMPAIGN_ID,
// 					CAMPAIGN_NAME: oIdea.CAMPAIGN_NAME,
// 					IDEAS: that._getIdeas(aIdeaList, oIdea)
// 				});
// 			}
// 		});
// 		aIdeaGroups.sort(function(oPrevious, oNextField) {
// 			return that._sort(oPrevious, oNextField, "CAMPAIGN_ID");
// 		});
// 		jQuery.each(aIdeaGroups, function(index, oIdea) {
// 			if(oIdea.CAMPAIGN_ID === nSelectedCampaignId){
// 			    selectedCampaignGroup = aIdeaGroups.splice(index, 1);
// 			    aIdeaGroups.unshift({
// 					CAMPAIGN_ID: selectedCampaignGroup.CAMPAIGN_ID,
// 					CAMPAIGN_NAME: selectedCampaignGroup.CAMPAIGN_NAME,
// 					IDEAS: selectedCampaignGroup.IDEAS
// 				});
// 			    return false;
// 			}
// 		});
		return aIdeaGroups;
	};

	SimilarIdeasMixin._sort = function(oPrevious, oNext, sSortField) {
		if (oPrevious[sSortField] === null) {
			return 1;
		}
		if (oNext[sSortField] === null) {
			return -1;
		}
		var oPreviousField = oPrevious[sSortField];
		var oNextField = oNext[sSortField];
		if (oPreviousField > oNextField) {
			return 1;
		}
		if (oPreviousField < oNextField) {
			return -1;
		}
		return 0;
	};

	SimilarIdeasMixin._getIdeas = function(aIdeaList, oCurrentIdea) {
		var that = this;
		var result = jQuery.map(that._filterByCampaignId(aIdeaList, oCurrentIdea.CAMPAIGN_ID), function(oIdea) {
			return {
				ID: oIdea.ID,
				NAME: oIdea.NAME,
				AGG_SCORE: oIdea.AGG_SCORE
			};
		});
		result.sort(function(oPrevious, oNextField) {
			return that._sort(oPrevious, oNextField, "AGG_SCORE");
		});
		return result;
	};

	SimilarIdeasMixin._filterByCampaignId = function(aIdeaList, nCampaignId) {
		return jQuery.grep(aIdeaList, function(element) {
			return nCampaignId === element.CAMPAIGN_ID;
		});
	};

	return SimilarIdeasMixin;
});