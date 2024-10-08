/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ino/commons/formatters/BaseFormatter",
    "sap/ino/commons/models/core/CodeModel",
    "sap/ui/base/Object",
    "sap/ino/commons/formatters/ObjectFormatter",
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/ino/commons/models/aof/PropertyModelCache"
], function(
    BaseFormatter,
    CodeModel,
	Object,
	ObjectFormatter,
	PropertyModel,
	PropertyModelCache) {
	"use strict";

	var oRewardFormatter = Object.extend("sap.ino.vc.idea.RewardFormatter", {});
	jQuery.extend(oRewardFormatter, ObjectFormatter);

	var fnRewardCreateFormatter = PropertyModel.getStaticActionEnabledDynamicFormatter(
		"sap.ino.xs.object.reward.RewardList", "create", function(iIdeaId) {
			return {
				IDEA_ID: iIdeaId
			};
		});

	oRewardFormatter.createRewardEnabled = function(iIdeaId,SUBMITTER_ID) {
	    if(SUBMITTER_ID === 0){
	        return false;
	    }
		if (iIdeaId) {
			return fnRewardCreateFormatter(iIdeaId);
		}
		return false;
	};
	oRewardFormatter.rewardAmountUnit = function(iAmount, sUnit) {
		sUnit = sUnit === null ? "" : " " + sUnit;
		return iAmount + sUnit;
	};

	oRewardFormatter.addPercentage = function(iNumber) {
		iNumber = Math.round(Number(iNumber));
		return String(iNumber) + "%";
	};
	oRewardFormatter.addPercentageDetail = function(iNumber) {
	   if(iNumber === undefined || !iNumber) 
	   {
	      return '';
	   }
	   else
		{iNumber = Math.round(Number(iNumber));
		return String(iNumber) + "%";
		}
	};

	oRewardFormatter.maxFractionFormatter = function(nNumber, nDigits) {
		var number = parseFloat(nNumber);
		if (isNaN(number)) {
			return nNumber;
		}
		var precious = parseInt(nDigits, 10);
		if (isNaN(precious)) {
			precious = 2;
		}
		var nPrecious = Math.pow(10, precious);
		return Math.round(number * nPrecious) / nPrecious;
	};
	
	oRewardFormatter.ideaNavigationLink = function (iId, sSection) {
        if (!isNaN(parseInt(iId, 10))) {
            var oParams = {id: iId};
            if (sSection) {
                oParams.query = {
                    section: sSection
                };
            }
            return BaseFormatter.navigationLink.apply(this, ["idea-display", oParams]);
        }
        return "";
    };

	return oRewardFormatter;
});