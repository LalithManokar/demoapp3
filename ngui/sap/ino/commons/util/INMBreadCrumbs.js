sap.ui.define([
    "sap/ino/commons/application/Configuration",
    "sap/ui/base/Object"], function(Configuration, Object) {
	var breadCrumbsTexts = [{
			"TEXT": "PAGE_TIT_HOME",
			"name": "home",
			"target": "home",
			"available": "all",
			"path": "home"
             }, {

			"name": "home-explicit",
			"target": "home"
             }, {
			"TEXT": "PAGE_TIT_IDEAS",
			"name": "idealist",
			"target": "idealist",
			"available": "idea-display",
			"path": "home/idealist"

             }, {
			"variant": true,
			"name": "idealistvariant",
			"target": "idealist",
			"available": "idea-display",
			"path": "home/idealistvariant"
             }, {
			"TEXT": "PAGE_TIT_WALLS",
			"name": "walllist",
			"target": "walllist",
			"available": "wall",
			"path": "home/walllist"
             }, {
			"variant": true,
			"name": "walllistvariant",
			"target": "walllist",
			"path": "home/walllist"
			 }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wall",
			"available": "wall",
			"target": "wall",
			"path": "home/walllist/wall"

             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremote",
			"target": "wallremote",
			"path": "home/walllist/wallremote",
			"available": "wall"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-headline",
			"target": "wallremoteitem-headline",
			"path": "home/walllist/wallremote/wallremoteitem-headline"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-sticker",
			"target": "wallremoteitem-sticker",
			"path": "home/walllist/wallremote/wallremoteitem-sticker"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-link",
			"target": "wallremoteitem-link",
			"path": "home/walllist/wallremote/wallremoteitem-link"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-image",
			"target": "wallremoteitem-image",
			"path": "home/walllist/wallremote/wallremoteitem-image"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-text",
			"target": "wallremoteitem-text",
			"path": "home/walllist/wallremote/wallremoteitem-text"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-sprite",
			"target": "wallremoteitem-sprite",
			"path": "home/walllist/wallremote/wallremoteitem-sprite"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-person",
			"target": "wallremoteitem-person",
			"path": "home/walllist/wallremote/wallremoteitem-person"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-video",
			"target": "wallremoteitem-video",
			"path": "home/walllist/wallremote/wallremoteitem-video"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-attachment",
			"target": "wallremoteitem-attachment",
			"path": "home/walllist/wallremote/wallremoteitem-attachment"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-group",
			"target": "wallremoteitem-group",
			"path": "home/walllist/wallremote/wallremoteitem-group"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-line",
			"target": "wallremoteitem-line",
			"path": "home/walllist/wallremote/wallremoteitem-line"
             }, {
			"oData": "Wall",
			"pattern": "id",
			"name": "wallremoteitem-arrow",
			"target": "wallremoteitem-arrow",
			"path": "home/walllist/wallremote/wallremoteitem-arrow"
             }, {
			"TEXT": "PAGE_TIT_CAMPAIGNS",
			"name": "campaignlist",
			"target": "campaignlist",
			"available": "campaign",
			"path": "home/campaignlist"
             }, {
			"variant": true,
			"name": "campaignlistvariant",
			"target": "campaignlist",
			"available": "campaign",
			"path": "home/campaignlistvariant"
             }, {
			"TEXT": "PAGE_TIT_PEOPLE",
			"name": "peoplelist",
			"target": "peoplelist",
			"path": "home/peoplelist"
             }, {
			"name": "peoplelistvariant",
			"target": "peoplelist",
			"path": "home/peoplelistvariant"
             }, {
			"TEXT": "PAGE_TIT_EXPERTFINDER",
			"name": "expertfinder",
			"target": "expertfinder",
			"path": "home/expertfinder"
             }, {
			"oData": "IdeaSmall",
			"pattern": "id",
			"name": "idea-display",
			"target": "idea-display",
			"available": "evaluation-display/evaluation-create/evaluationrequest-create/evaluationrequest-display/evaluationrequest-edit",
			"path": "home/idealist/idea-display"
             }, {
			"TEXT": "PAGE_TIT_IDEA_EDIT",
			"oData": "IdeaSmall",
			"name": "idea-edit",
			"target": "idea-modify",
			"path": "home/idealist/idea-display/idea-edit"
             }, {
			"TEXT": "PAGE_TIT_IDEA_CREATE",
			"name": "idea-create",
			"target": "idea-modify",
			"path": "home/idea-create"
              }, {
			"oData": "CampaignSmall",
			"pattern": "id",
			"name": "campaign",
			"target": "campaign",
			"available": "campaign-idealist/campaign-idealistvariant/bloglist/campaign-comment/campaign-feeds/campaign-managerlist/blog-create",
			"path": "home/campaignlist/campaign"
             }, {
			"TEXT": "PAGE_TIT_CAMPAIGN_COMMENT",
			"name": "campaign-comment",
			"target": "campaign-comment",
			"path": "home/campaignlist/campaign/campaign-comment"
             }, {
			"TEXT": "PAGE_TIT_CAMPAIGN_FEEDS",
			"name": "campaign-feeds",
			"target": "campaign-feeds",
			"path": "home/campaignlist/campaign/campaign-feeds"
             }, {
			"TEXT": "PAGE_TIT_CAMPAIGN_IDEAS",
			"name": "campaign-idealist",
			"target": "campaign-idealist",
			"available": "idea-display",
			"path": "home/campaignlist/campaign/campaign-idealist"
             }, {
			"variant": true,
			"name": "campaign-idealistvariant",
			"target": "campaign-idealist",
			"available": "idea-display",
			"path": "home/campaignlist/campaign/campaign-idealistvariant"
             }, {

			"name": "campaign-managerlist",
			"target": "campaign-managerlist",
			"path": "home/campaignlist/campaign/campaign-managerlist"
             }, {

			"name": "search",
			"target": "search"
             }, {

			"name": "searchcategory",
			"target": "searchcategory"
             }, {

			"name": "message",
			"target": "message"
             }, {

			"name": "vote",
			"target": "vote"
             }, {

			"name": "identitycard",
			"target": "identitycard"
             }, {

			"name": "processindicator",
			"target": "processindicator"
             }, {

			"name": "ideacard",
			"target": "ideacard"
             }, {

			"name": "campaigncard",
			"target": "campaigncard"
             }, {

			"name": "votedisplay",
			"target": "votedisplay",
			"path": "home/votedisplay"
             }, {
			"TEXT": "PAGE_TIT_REPORTS",
			"name": "reportlist",
			"target": "reportlist",
			"path": "home/reportlist"
             }, {
			"variant": true,
			"name": "reportlistvariant",
			"target": "reportlist",
			"path": "home/reportlistvariant"
             }, {
			"pattern": "code",
			"TEXT": "PAGE_TIT_REPORTS",
			"name": "report",
			"target": "report",
			"path": "home/report"
             }, {
			//"oData":"IdeaEvaluation",
			//"pattern": "id",
			"TEXT": "PAGE_TIT_EVALUATION",
			"name": "evaluation-display",
			"target": "evaluation-display",
			"path": "home/evaluation-display"
             }, {
			"TEXT": "PAGE_TIT_EVALUATION_EDIT",
			"name": "evaluation-edit",
			"target": "evaluation-modify",
			"path": "home/evaluation-display/evaluation-edit"
             },
		{

			"name": "welcomepage",
			"target": "welcomepage"
             }, {
			"TEXT": "PAGE_TIT_EVALUATION_CREATE",
			"name": "evaluation-create",
			"target": "evaluation-modify"
             }, {
			"TEXT": "PAGE_TIT_FEEDS",
			"name": "feedlist",
			"target": "feedlist",
			"path": "home/feedlist"
             }, {
			"TEXT": "PAGE_TIT_TAGS",
			"name": "taglist",
			"target": "taglist",
			"path": "home/taglist"
             }, {
			"variant": true,
			"name": "taglistvariant",
			"target": "taglist",
			"path": "home/taglistvariant"
             }, {

			"name": "followlist",
			"target": "followlist",
			"path": "home/followlist"
			 }, {
			"variant": true,
			"name": "followlistvariant",
			"target": "followlist",
			"path": "home/followlistvariant"
			 }, {
			"TEXT": "PAGE_TIT_REGISTER_PENDING",
			"name": "registerapprovallist",
			"target": "registerapprovallist",
			"path": "home/registerapprovallist"
			 }, {
			"variant": true,
			"name": "registerapprovallistvariant",
			"target": "registerapprovallist",
			"path": "home/registerapprovallistvariant"
			 }, {
			"TEXT": "PAGE_TIT_BLOGS",
			"name": "bloglist",
			"target": "bloglist",
			"available": "blog-display",
			"path": "home/bloglist"
             }, {
			"variant": true,
			"name": "bloglistvariant",
			"target": "bloglist",
			"available": "blog-display",
			"path": "home/bloglistvariant"
             }, {
			"TEXT": "PAGE_TIT_CAMPAIGN_IDEAS",
			"name": "campaign-bloglist",
			"target": "campaign-bloglist",
			"available": "blog-display",
			"path": "home/campaignlist/campaign/campaign-bloglist"
             }, {
			"variant": true,
			"name": "campaign-bloglistvariant",
			"target": "campaign-bloglist",
			"path": "home/campaignlist/campaign/campaign-bloglistvariant"
             }, {
			"TEXT": "PAGE_TIT_BLOG_EDIT",
			"name": "blog-edit",
			"target": "blog-modify",
			"path": "home/bloglist/blog-display/blog-edit"
             }, {
			"TEXT": "PAGE_TIT_BLOG_CREATE",
			"name": "blog-create",
			"target": "blog-modify",
			"path": "home/blog-create"
              }, {
			"oData": "CampaignBlogsSmall",
			"pattern": "id",
			"name": "blog-display",
			"available": "blog-display/blog-edit",
			"target": "blog-display",
			"path": "home/bloglist/blog-display"
              }, {
			"TEXT": "PAGE_TIT_EVALUATIONREQUEST_CREATE",
			"name": "evaluationrequest-create",
			"target": "evaluationrequestmodify",
			"path": "home/evaluationrequest-create"
             }, {
			"TEXT": "PAGE_TIT_EVALUATIONREQUEST_EDIT",
			"name": "evaluationrequest-edit",
			"target": "evaluationrequestmodify",
			"path": "home/evalreqlist/evaluationrequest-display/evaluationrequest-edit"
             }, {
			// "oData":"EvaluationRequestFull",
			//"pattern": "id",
			"TEXT": "PAGE_TIT_EVALUATIONREQUEST_DISPLAY",
			"name": "evaluationrequest-display",
			"target": "evaluationrequestdisplay",
			"available": "evaluationrequest-edit/evaluationrequest-item",
			"path": "home/evalreqlist/evaluationrequest-display"
             }, {
			//"oData":"EvaluationRequestFullItem",
			//	"pattern": "id",
			"TEXT": "PAGE_TIT_EVALUATIONREQUEST_ITEM",
			"name": "evaluationrequest-item",
			"target": "evaluationrequestitem",
			"path": "home/evalreqlist/evaluationrequest-display/evaluationrequest-item"
             }, {
			"TEXT": "PAGE_TIT_REWARDS",
			"name": "rewardlist",
			"target": "rewardlist",
			"path": "home/rewardlist"
             }, {
			"variant": true,
			"name": "rewardlistvariant",
			"target": "rewardlist",
			"path": "home/rewardlistvariant"
             }, {
			"TEXT": "PAGE_TIT_EVALUATION_REQUESTS",
			"name": "evalreqlist",
			"target": "evalreqlist",
			"path": "home/evalreqlist"

             }, {

			"variant": true,
			"name": "evalreqlistvariant",
			"target": "evalreqlist",
			"path": "home/evalreqlistvariant"
             }, {
			"TEXT": "PAGE_TIT_MY_SETTING",
			"name": "mySetting",
			"target": "mySetting",
			"path": "home/mySetting"
             }];

	var INMBreadCrumbs = Object.extend("sap.ino.commons.util.INMBreadCrumbs", {});
	INMBreadCrumbs.maintainBreadCrumbs = function(oBreadCrumbs, oCurrentRouteObject, oObjectModel, oBreadModel, sCurrentHash, sCurrentTitle) {
		var bGoonBread;
		var bLastBread;
		var oParameter;
		var aPath = sCurrentHash.split("/").length > 1 ? sCurrentHash.split("/")[1] : "";
		var sVariant = oCurrentRouteObject.variant ? sCurrentTitle.split("_").pop() : "";
		if (oBreadModel.getProperty("/CurrentAvailable") === "all") {
			bGoonBread = false;

		} else if (oBreadModel.getProperty("/CurrentAvailable") !== "none") {
			var aAvailablePath = oBreadModel.getProperty("/CurrentAvailable").split("/");
			aAvailablePath.forEach(function(sName, iPathIndex) {
				bGoonBread = sName === oCurrentRouteObject.name ? true : false;
				return;
			});
		} else {
			bGoonBread = false;
		}
		if (bGoonBread) {

			bLastBread = true;
			oParameter = null;
			this.addBreadCrumbs(oBreadCrumbs, oCurrentRouteObject, aPath, oBreadModel, bLastBread, oParameter, sVariant);
		} else {
			// Determine trail parts
			oBreadCrumbs.destroyLinks();

			var aParts = oCurrentRouteObject.path.split("/");
			var slength = aParts.length;

			aParts.forEach(jQuery.proxy(function(sName, iPathIndex) {
				var oCrumbs = this.getBreadObjectByName(sName);
				if (oCrumbs.pattern) {
					oParameter = {};
					oParameter[oCrumbs.pattern] = aPath;
				}
				bLastBread = slength === iPathIndex + 1;
				this.addBreadCrumbs(oBreadCrumbs, oCrumbs, aPath, oBreadModel, bLastBread, oParameter, sVariant);

			}, this));
		}
	};

	INMBreadCrumbs.addBreadCrumbs = function(oBreadCrumbs, oCrumbs, aPath, oBreadModel, bLastBread, oParameter, sVariant) {
		var sPrefix = Configuration.getBackendRootURL() + "/sap/ino/?env=development";
		var oDataPath = oCrumbs.oData + "(" + aPath + ")";
		var sName, sTitle, sVariantText;
		var sOdataPath = Configuration.hasCurrentUserPrivilege("sap.ino.ui::backoffice.access") ? "/sap/ino/xs/rest/backoffice/odata.xsodata/" :
			"/sap/ino/xs/rest/community/odata.xsodata/";
		if (oCrumbs.pattern) {
			var oObjectData = jQuery.ajax({
				url: Configuration.getBackendRootURL() + sOdataPath + oDataPath,
				type: "GET",
				dataType: "json",
				async: false

			});
			oObjectData.done(function(oResponse) {
				sName = oResponse.d.SHORT_NAME ? oResponse.d.SHORT_NAME : oResponse.d.NAME;
				sTitle = oResponse.d.TITLE ? oResponse.d.TITLE : sName;
			});

		}

		if (oCrumbs.variant) {
			var aArray = this.getCurrentView().getController().list.Variants;
			sVariantText = this.getObjectListVariantText(aArray, sVariant) ? this.getObjectListVariantText(aArray, sVariant) : oCrumbs.name;
		} else {
			sVariantText = this._i18n.getResourceBundle().getText(oCrumbs.TEXT);
		}

		oBreadCrumbs.addLink(new sap.m.Link({
			text: oCrumbs.pattern ? sTitle : sVariantText,
			target: "_top",
			enabled: bLastBread ? false : true,
			href: bLastBread ? window.location.href : sPrefix + this.getNavigationLink(oCrumbs.name, oParameter)
		}));
		if (bLastBread && oBreadCrumbs.getLinks().length > 1) {
			var sNumber = oBreadCrumbs.getLinks().length > 1 ? oBreadCrumbs.getLinks().length - 2 : oBreadCrumbs.getLinks().length - 1;
			oBreadCrumbs.getLinks()[sNumber].setEnabled(true);
		}
		oBreadModel.setProperty("/CurrentAvailable", oCrumbs.available ? oCrumbs.available : "none");
		oBreadModel.setProperty("/CurrentRoute", oCrumbs.name);
	};
	INMBreadCrumbs.setBreadCrumbsText = function(oBreadCrumbs, sText) {

		oBreadCrumbs.setCurrentLocationText(sText);

	};

	INMBreadCrumbs.getBreadObjectByPath = function(sText) {
		var breadCrumbsObject;
		jQuery.each(breadCrumbsTexts, function(i, val) {
			if (val.PATH === sText) {
				breadCrumbsObject = val;
			}

		});
		return breadCrumbsObject;
	};

	INMBreadCrumbs.getBreadObjectByName = function(sText) {
		var breadCrumbsObject;
		jQuery.each(breadCrumbsTexts, function(i, val) {
			if (val.name === sText) {
				breadCrumbsObject = val;
			}

		});
		return breadCrumbsObject;
	};

	INMBreadCrumbs.getObjectListVariantText = function(aArray, sText) {
		var aValues = aArray.Values;
		var sCode;
		jQuery.each(aValues, function(i, val) {
			if (val.ACTION === sText) {
				sCode = val.TEXT;
			}
		});
		return this._i18n.getResourceBundle().getText(sCode);
	};
		return INMBreadCrumbs;
});