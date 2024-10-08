/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ui/base/Object"

], function(Object) {
	"use strict";

	var Configuration = Object.extend("sap.ino.commons.application.Configuration", {});

	var sBackendRootURL = window.location.protocol + '//' + window.location.host;

	Configuration.getBackendRootURL = function() {
		return sBackendRootURL;
	};

	Configuration.getMailPreviewURL = function(oParameterMap) {
		return Configuration.getBackendRootURL() + "/" +
			Configuration.getSystemSetting("sap.ino.config.URL_PATH_XS_MAIL_PREVIEW") + "?" +
			jQuery.sap.encodeURLParameters(oParameterMap);
	};

	Configuration.getTextMoudleURL = function(oParameterMap) {
		return Configuration.getBackendRootURL() + "/" +
			Configuration.getSystemSetting("sap.ino.config.URL_PATH_XS_TEXT_MODULE") + "?" +
			jQuery.sap.encodeURLParameters(oParameterMap);
	};

	Configuration.getTagcloudServiceURL = function(iCampaignId, aTagIds, sSearchTerm, sVariantFilter, bExcludeDrafts, bIsManaged, aFilters) {
		var sPath = Configuration.getBackendRootURL() + "/" +
			Configuration.getSystemSetting("sap.ino.config.URL_PATH_XS_TAGCLOUD") + "?";
		var aParams = [];
		if (iCampaignId) {
			aParams.push("CAMPAIGN=" + iCampaignId);
		}
		if (aTagIds) {
			aParams = aParams.concat(aTagIds.map(function(iTagId) {
				return "TAG=" + iTagId;
			}));
		}
		if (sSearchTerm) {
			aParams.push("SEARCHTERM=" + jQuery.sap.encodeURL(sSearchTerm));
		}
		if (bExcludeDrafts) {
			aParams.push("EXCL_STATUS=sap.ino.config.DRAFT");
		}
		if (sVariantFilter) {
			aParams.push("FILTERNAME=" + sVariantFilter);
		}
		aParams.push("FILTER_BACKOFFICE=" + (bIsManaged ? 1 : 0));
		jQuery.each(aFilters, function(index, filter) {
			if (filter.key && filter.value) {
				aParams.push(filter.key.toUpperCase() + "=" + encodeURIComponent(filter.value));
			}
		});
		return sPath + aParams.join("&");
	};

	function _buildExpertServiceURL(sMode, vItems, iLimitExperts, iLimitIdeas) {
		var sParam = sMode === "tag" ? "TAG=" : "ID=";
		var sEndpoint = sMode === "tag" ? "/bytag?" : "/byid?";
		if (vItems && !Array.isArray(vItems)) {
			vItems = [vItems];
		}
		var sLimitExperts = iLimitExperts ? "&limit=" + iLimitExperts : "";
		var sLimitIdeas = iLimitIdeas ? "&ideas=" + iLimitIdeas : "";
		return vItems ?
			Configuration.getBackendRootURL() + "/" + Configuration.getSystemSetting("sap.ino.config.URL_PATH_XS_EXPERT_SERVICE") + sEndpoint +
			vItems.map(function(sItem) {
				return sParam + encodeURIComponent(sItem);
			}).join("&") + sLimitExperts + sLimitIdeas : null;
	}

	Configuration.getIdeaExpertsByTagsURL = function(vTags, iLimitExperts, iLimitIdeas) {
		return _buildExpertServiceURL("tag", vTags, iLimitExperts, iLimitIdeas);
	};

	Configuration.getIdeaExpertsByIdeaURL = function(vId, iLimitExperts, iLimitIdeas) {
		return _buildExpertServiceURL("id", vId, iLimitExperts, iLimitIdeas);
	};

	Configuration.getRelatedIdeasURL = function(iIdeaId) {
		if (iIdeaId && iIdeaId > 0) {
			return Configuration.getBackendRootURL() + "/" +
				Configuration.getSystemSetting("sap.ino.config.URL_PATH_XS_RELATED_IDEAS_BY_ID") + "/" + iIdeaId;
		} else {
			return null;
		}
	};

	Configuration.getRelatedIdeasByTextURL = function(iIdeaId) {
		if (typeof iIdeaId === 'number' && (iIdeaId % 1) === 0) {
			return Configuration.getBackendRootURL() + "/" +
				Configuration.getSystemSetting("sap.ino.config.URL_PATH_XS_RELATED_IDEAS_BY_TEXT") + "/" + iIdeaId;
		} else {
			return null;
		}
	};

	Configuration.getUserProfileByTextURL = function(iIdentityId) {
		if (typeof iIdentityId === 'number' && (iIdentityId % 1) === 0) {
			return Configuration.getBackendRootURL() + "/" +
				Configuration.getSystemSetting("sap.ino.config.URL_PATH_IAM_IDENTITY_PROFILE");
		} else {
			return null;
		}
	};

	Configuration.getCampaignSettingsURL = function(iCampaignId, bEdit) {
		if (typeof iCampaignId === 'number' && (iCampaignId % 1) === 0) {
			return Configuration.getBackendRootURL() + "/" +
				Configuration.getSystemSetting("sap.ino.config.URL_PATH_UI_BACKOFFICE") + encodeURI('#campaign/{"id": ' + iCampaignId + ', "mode": ' +
					(bEdit ? '"edit"' : '"display"') + '}');
		} else {
			return null;
		}
	};

	Configuration.getAttachmentDownloadURL = function(iAttachmentId, sDefaultURL, sCompressedType) {
		if (iAttachmentId && iAttachmentId > 0) {
			sCompressedType = sCompressedType ? "?type=" + sCompressedType : '';
			return Configuration.getBackendRootURL() + "/" +
				Configuration.getSystemSetting("sap.ino.config.URL_PATH_XS_ATTACHMENT_DOWNLOAD") + "/" + iAttachmentId + sCompressedType;
		} else {
			if (sDefaultURL) {
				return sDefaultURL;
			}
			return null;
		}
	};

	Configuration.getAttachmentTitleImageDownloadURL = function(iAttachmentTitleImageId, sDefaultURL, sCompressedType) {
		if (iAttachmentTitleImageId && iAttachmentTitleImageId > 0) {
			sCompressedType = sCompressedType ? "?type=" + sCompressedType : '';
			return Configuration.getBackendRootURL() + "/" +
				Configuration.getSystemSetting("sap.ino.config.URL_PATH_XS_ATTACHMENT_TITLE_IMAGE_DOWNLOAD") + "/" + iAttachmentTitleImageId +
				sCompressedType;
		} else {
			if (sDefaultURL) {
				return sDefaultURL;
			}
			return null;
		}
	};

	Configuration.getResourceBundleURL = function(sResourceName) {
		if (sResourceName) {
			var sResourcePath = Configuration.getSystemSetting("sap.ino.config.URL_PATH_XS_RESOURCE");
			if (!sResourcePath) {
				return null;
			}

			return Configuration.getBackendRootURL() + "/" +
				sResourcePath + "/" +
				sResourceName + ".properties";
		} else {
			return null;
		}
	};

	Configuration.setBackendRootURL = function(sTheBackendRootURL) {
		sBackendRootURL = sTheBackendRootURL;
	};

	var bBackendTraceActive = !!jQuery.sap.getUriParameters().get("sap-ino-backendtrace");
	Configuration.isBackendTraceActive = function() {
		return bBackendTraceActive;
	};

	Configuration.setBackendTraceActive = function(bActive) {
		bBackendTraceActive = bActive;
	};

	var bExtensionsDisabled = !!jQuery.sap.getUriParameters().get("sap-ino-disable-extensions");
	Configuration.isExtensionsDisabled = function() {
		return bExtensionsDisabled;
	};

	Configuration.getStylePaths = function() {
		return this.getBackendConfiguration().styles;
	};

	Configuration.getComponentName = function() {
		return this.getBackendConfiguration().componentName;
	};

	Configuration.isComponentActive = function(sComponent) {
		if (this.getBackendConfiguration().systemSettings[sComponent] === undefined || isNaN(this.getBackendConfiguration().systemSettings[
			sComponent].VALUE)) {
			return false;
		}
		return !!parseInt(this.getBackendConfiguration().systemSettings[sComponent].VALUE, 10);
	};

	Configuration.getSystemSetting = function(sKey) {
		return this.getBackendConfiguration().systemSettings && this.getBackendConfiguration().systemSettings[sKey] && this.getBackendConfiguration()
			.systemSettings[sKey].VALUE;
	};

	Configuration.getApplicationPath = function(sApplication) {
		return this.getBackendConfiguration().systemSettings[sApplication] && this.getBackendConfiguration().systemSettings[sApplication].VALUE;
	};

	Configuration.getFullApplicationPath = function(sApplication) {
		return this.getBackendRootURL() + "/" + this.getApplicationPath(sApplication);
	};

	Configuration.getApplicationObjects = function() {
		return this.getBackendConfiguration().applicationObjects;
	};

	Configuration.getApplicationObject = function(sName) {
		return this.getBackendConfiguration().applicationObjects[sName];
	};

	Configuration.getSystemDefaultLanguage = function() {
		return this.getBackendConfiguration().systemDefaultLanguage;
	};

	Configuration.getURLWhitelist = function() {
		return this.getBackendConfiguration().urlWhitelist;
	};

	Configuration.getCustomConfigurationPackage = function() {
		return this.getBackendConfiguration().customConfigurationPackage;
	};

	Configuration.getInconsistentPackages = function() {
		return this.getBackendConfiguration().inconsistentPackages;
	};

	Configuration.systemMessage = function() {
		return this.getBackendConfiguration().systemMessage;
	};

	Configuration.getSWABaseURL = function() {
		var sURL = Configuration.getSystemSetting("sap.ino.config.URL_PATH_SWA_BASE");
		if (Configuration.isAbsoluteURL(sURL)) {
			return sURL;
		} else {
			return Configuration.getBackendRootURL() + "/" + sURL;
		}
	};

	Configuration.getSWATrackerURL = function() {
		var sURL = Configuration.getSystemSetting("sap.ino.config.URL_PATH_SWA_TRACKER");
		if (Configuration.isAbsoluteURL(sURL)) {
			return sURL;
		} else {
			return Configuration.getBackendRootURL() + "/" + sURL;
		}
	};

	Configuration.isUsageReportingActive = function() {
		var sTrackingActive = Configuration.getSystemSetting("sap.ino.config.SWA_ACTIVE");
		var sReportingActive = Configuration.getSystemSetting("sap.ino.config.USAGE_REPORTING_ACTIVE");
		if (sTrackingActive === "0") {
			return false;
		} else if (sTrackingActive === "1" && sReportingActive === "0" && (this.hasCurrentUserPrivilege(
			"sap.ino.xs.rest.admin.application::execute") || this.hasCurrentUserPrivilege(
			"sap.ino.ui::camps_coach_role") || this.hasCurrentUserPrivilege(
			"sap.ino.ui::camps_mgr_role"))) {
			return true;
		} else if (sTrackingActive === "1" && sReportingActive === "1") {
			return true;
		} else {
			return false;
		}
	};

	Configuration.getFrontofficeDefaultBackgroundImageURL = function(bIsHighContrast) {
		var sURL = Configuration.getSystemSetting("sap.ino.config.URL_PATH_UI_FRONTOFFICE_DEFAULT_BACKGROUND_IMAGE");
		if (bIsHighContrast) {
			sURL = Configuration.getSystemSetting("sap.ino.config.URL_PATH_UI_FRONTOFFICE_DEFAULT_HC_BACKGROUND_IMAGE");
		}
		return sURL;
	};

	Configuration.getMobileSmallDefaultBackgroundImageURL = function() {
		return Configuration.getSystemSetting("sap.ino.config.URL_PATH_UI_MOBILE_SMALL_DEFAULT_BACKGROUND_IMAGE");
	};

	Configuration.getPPMURL = function() {
		return Configuration.getBackendRootURL() + "/" +
			Configuration.getSystemSetting("sap.ino.config.URL_PATH_XS_PPM");
	};
	Configuration.setupCompleted = function() {
		return this.getBackendConfiguration().setupCompleted;
	};

	Configuration.getXSRFToken = function() {
		return this.getBackendConfiguration().XSRFToken;
	};

	Configuration.setXSRFToken = function(sToken) {
		this.getBackendConfiguration().XSRFToken = sToken;
		jQuery.ajaxSetup({
			headers: {
				"X-CSRF-Token": sToken
			}
		});
		var jquerySelfSetup = jQuery.ajaxSetup.bind(jQuery);
		jQuery.ajaxSetup = function(target, settings) {
			var result = jquerySelfSetup(target, settings);
			var oRegex = new RegExp(Configuration.getBackendRootURL(), "igm");
			if (result.type === "GET" && settings && Configuration.isAbsoluteURL(settings.url) && !oRegex.test(settings.url)) {
				delete result.headers["X-CSRF-Token"];
			}
			return result;
		};
	};

	Configuration.validateXSRFToken = function(oResponse) {
		if (oResponse.status === 403) {
			var sXSRF = oResponse.getResponseHeader("x-csrf-token");
			if (sXSRF && sXSRF.toLowerCase() === "required") {
				// No longer valid -> refresh
				var sPingURL = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/ping.xsjs";
				var oAjaxPromise = jQuery.ajax({
					url: sPingURL,
					headers: {
						"X-CSRF-Token": "Fetch"
					},
					type: "GET",
					contentType: "application/json; charset=UTF-8",
					async: false
				});
				oAjaxPromise.done(function(oResponseBody, sResponseText, oResponse) {
					Configuration.setXSRFToken(oResponse.getResponseHeader("X-CSRF-Token"));
				});
				return false;
			}
		}
		return true;
	};

	Configuration.getTheme = function() {
		return this.getBackendConfiguration().theme;
	};

	Configuration.getCurrentUser = function() {
		// this function seems a bit foreign here - however the data is loaded
		// with the bootstrap.xsjs and Configuration is the accessor to it
		// bIncludePrivileges will only where when getCurrentUser is the first call
		return this.getBackendConfiguration().user;
	};

	Configuration.getCurrentUserPrivileges = function() {
		// see getCurrentUser(...)
		return this.getBackendConfiguration().privileges;
	};

	Configuration.hasCurrentUserPrivilege = function(sPrivilege) {
		return !!this.getCurrentUserPrivileges()[sPrivilege];
	};

	Configuration.getBackendConfiguration = function() {
		return getBackendConfiguration(this.getBackendRootURL());
	};

	Configuration.refreshBackendConfiguration = function() {
		oBackendConfiguration = null;
		this.getBackendConfiguration();
	};

	Configuration.isAbsoluteURL = function(sURL) {
		if (sURL.search(/^http(s)?:\/\//) === -1) {
			return false;
		} else {
			return true;
		}
	};

	Configuration.isDevelopmentEnv = function() {
		return (window.location.search || "").indexOf("development") > -1;
	};

	var oBackendConfiguration;

	var oConfigModel;
	Configuration.getSystemSettingsModel = function() {
		if (!oConfigModel) {
			oConfigModel = new sap.ui.model.json.JSONModel({});
		}
		return oConfigModel;
	};

	var oUserModel;
	Configuration.getUserModel = function() {
		if (!oUserModel) {
			oUserModel = new sap.ui.model.json.JSONModel({});
		}
		return oUserModel;
	};

	var oSearchModel;
	Configuration.getSearchModel = function() {
		if (!oSearchModel) {
			oSearchModel = new sap.ui.model.json.JSONModel({});
		}
		return oSearchModel;
	};
	var oCampaignFilterCountModel;
	Configuration.getCampaignFilterCountModel = function() {
		if (!oCampaignFilterCountModel) {
			oCampaignFilterCountModel = new sap.ui.model.json.JSONModel({});
		}
		return oCampaignFilterCountModel;
	};

	Configuration.getCampaignFilterCountProperty = function() {
		var model = this.getCampaignFilterCountModel();
		return model.getProperty('/CampaignFilterCountModel');
	};

	Configuration.setCampaignFilterCountProperty = function(obj) {
		var model = this.getCampaignFilterCountModel();
		return model.setProperty("/CampaignFilterCountModel", obj);
	};
	Configuration.getCampaignFilterCount = function(searchToken, oCampaignModel, aVariants) {

		var sURL = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/campaign_filter_count.xsjs";
		var oAjaxPromise = jQuery.ajax({
			url: sURL,
			headers: {
				"X-CSRF-Token": "Fetch"
			},
			data: searchToken,
			type: "GET",
			contentType: "application/json; charset=UTF-8",
			async: true
		});
		Configuration.getErrorMessage = function() {
			return oAjaxPromise.responseText;
		};

		oAjaxPromise.done(function(oResponse) {

			oCampaignFilterCountModel = {
				all: oResponse[0].AMOUNT,
				active: oResponse[1].AMOUNT,
				open: oResponse[2].AMOUNT,
				future: oResponse[3].AMOUNT,
				past: oResponse[4].AMOUNT,
				registered: oResponse[5].AMOUNT,
				manage: oResponse[6].AMOUNT,
				draft: oResponse[7].AMOUNT,
				publish: oResponse[8].AMOUNT,
				submittable: oResponse[9].AMOUNT

			};
			for (var i = 0; i < aVariants.length; i += 1) {
				oCampaignModel.setProperty("/Variants/Values/" + i + "/COUNT", oCampaignFilterCountModel[oCampaignModel.getProperty(
					"/Variants/Values/" + i + "/ACTION")]);

			}
			//   Configuration.setCampaignFilterCountProperty(oCampaignFilterCount);
		});
		oAjaxPromise.fail(function(oResponse) {
			oBackendConfiguration = {};
			jQuery.sap.log.error("Reading user info failed.");
			jQuery.sap.log.error(oResponse.responseText);
			Configuration.userErrorMessage = oResponse.responseText;
		});

		return oCampaignFilterCountModel;
	};
	var oIdeaFilterCountModel, oIdeaFilterCountJsonModel;
	Configuration.getIdeaFilterCountModel = function() {
		if (!oIdeaFilterCountJsonModel) {
			oIdeaFilterCountJsonModel = new sap.ui.model.json.JSONModel({});
		}
		return oIdeaFilterCountJsonModel;
	};

	Configuration.getIdeaFilterCountData = function() {
		return this.getIdeaFilterCountModel().getProperty('/FilterCountModel');
	};

	Configuration.setIdeaFilterCountModel = function(obj) {
		var model = this.getIdeaFilterCountModel();
		return model.setProperty('/FilterCountModel', obj);
	};
	Configuration.getIdeaFilterCount = function(oCamObeject, oModel, aVariants, oCurrentLink) {
		var sURL, that = this;
		sURL = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/idea_filter_count.xsjs";
		var oAjaxPromise = jQuery.ajax({
			url: sURL,
			headers: {
				"X-CSRF-Token": "Fetch"
			},
			data: oCamObeject,
			type: "GET",
			contentType: "application/json; charset=UTF-8",
			async: true
		});
		Configuration.getErrorMessage = function() {
			return oAjaxPromise.responseText;
		};

		oAjaxPromise.done(function(oResponse) {

			oIdeaFilterCountModel = {
				all: oResponse.all || 0,
				my: oResponse.myAuthoredIdeas || 0,
				voted: oResponse.myVotedIdeas || 0,
				commented: oResponse.myCommentedIdeas || 0,
				vote: oResponse.ideasIcanVoteFor || 0,
				completed: oResponse.completedIdeas || 0,
				eval: oResponse.myEvaluatedIdeas || 0,
				evalpending: oResponse.myEvaluatableIdeas || 0,
				manage: oResponse.IdeaTobeManaged || 0,
				managedcompleted: oResponse.ManagedCompletedIdeas || 0,
				follow: oResponse.followedupIdeas || 0,
				unassigned: oResponse.unassignedCoach || 0,
				coachme: oResponse.coachedIdeasByMe || 0,
				evaldone: oResponse.evaluatedIdeas || 0,
				evalopen: oResponse.openForEvaluation || 0,
				mygroup: oResponse.myGroupAuthoredIdeas || 0,
				mygroupvoted: oResponse.myGroupVotedIdeas || 0,
				mygroupcommented: oResponse.myGroupCommentedIdeas || 0,
				following: oResponse.myFollowingIdeas || 0

			};
			that.setIdeaFilterCountModel(oIdeaFilterCountModel);
			for (var i = 0; i < aVariants.length; i += 1) {
				if (oModel.getProperty("/Variants/Values/" + i + "/TYPE_CODE") === "QUICK_LINK_STANDARD_IDEA") {
					oModel.setProperty("/Variants/Values/" + i + "/COUNT", oIdeaFilterCountModel[oModel.getProperty(
						"/Variants/Values/" + i + "/ACTION")]);
				}

				if (oCurrentLink && oModel.getProperty("/Variants/Values/" + i + "/ID") === oCurrentLink.ID) {
					oModel.setProperty("/Variants/Values/" + i + "/COUNT", oIdeaFilterCountModel[oCurrentLink.ACTION]);
				}
			}

		});
		oAjaxPromise.fail(function(oResponse) {
			oBackendConfiguration = {};
			jQuery.sap.log.error("Reading user info failed.");
			jQuery.sap.log.error(oResponse.responseText);
			Configuration.userErrorMessage = oResponse.responseText;
		});

		return oModel;
	};

	Configuration.getCustomerCount = function(ID, oModel) {
		var sURL;
		sURL = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/idea_filter_count.xsjs";
		var oAjaxPromise = jQuery.ajax({
			url: sURL,
			headers: {
				"X-CSRF-Token": "Fetch"
			},
			data: {
				quickLinkId: ID
			},
			type: "GET",
			contentType: "application/json; charset=UTF-8",
			async: true
		});
		Configuration.getErrorMessage = function() {
			return oAjaxPromise.responseText;
		};

		oAjaxPromise.done(function(oResponse) {
			for (var i = 0; i < oModel.getProperty("/Variants/Values/").length; i += 1) {
				if (oModel.getProperty("/Variants/Values/" + i + "/ID") === ID) {
					oModel.setProperty("/Variants/Values/" + i + "/COUNT", oResponse[0].AMOUNT);
				}
			}
		});
		oAjaxPromise.fail(function(oResponse) {
			oBackendConfiguration = {};
			jQuery.sap.log.error("Reading user info failed.");
			jQuery.sap.log.error(oResponse.responseText);
			Configuration.userErrorMessage = oResponse.responseText;
		});

		return true;
	};

	function getBackendConfiguration(sRootURL) {
		if (!oBackendConfiguration || jQuery.isEmptyObject(oBackendConfiguration)) {
			// login.xsjs is not cached and returns user logon information
			// ui_config.xsjs is cached and returns static configuration information
			// X-CSRF-Token may only be retrieved from *un*-cached services
			var sUserURL = sRootURL + "/sap/ino/xs/rest/login/login.xsjs/";
			// Include privileges only when required as it is performance-intensive
			sUserURL += "?locale=" + sap.ui.getCore().getConfiguration().getLanguage();
			sUserURL += "&includePrivileges=true";

			var sConfigURL = sRootURL + "/sap/ino/xs/rest/static/ui_config.xsjs";
			var oAjaxPromise = jQuery.ajax({
				url: sUserURL,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				type: "GET",
				contentType: "application/json; charset=UTF-8",
				async: false
			});
			Configuration.getErrorMessage = function() {
				return oAjaxPromise.responseText;
			};

			var fnAddModel = function(oResponse) {
				var oConfig = {};
				jQuery.each(oResponse.systemSettings, function(iIndex, oObject) {
					oConfig[oObject.CODE] = oObject.VALUE;
				});
				//Backend root URL is set individually
				oConfig.BACKEND_ROOT_URL = Configuration.getBackendRootURL();
				//Gamification Setting				
				jQuery.each(oResponse.gamificationSetting, function(code, value) {
					oConfig[code] = value;
				});
				Configuration.getSystemSettingsModel().setData(oConfig);
			};

			oAjaxPromise.done(function(oResponse, sResponseText, oXHR) {
				if (typeof oResponse === 'object' && oResponse.hasOwnProperty("user")) {
					oBackendConfiguration = oResponse;

					Configuration.setXSRFToken(oXHR.getResponseHeader("X-CSRF-Token"));
					var oParameters = {
					    /* 
					    * file: \sap\ino\ngui\sap\ino\apps\ino\index.xsjslib
					    * gSAPInoAppName from window object
					    */
						appName: gSAPInoAppName || ""
					};
					if (Configuration.isExtensionsDisabled()) {
						oParameters.disableExtensions = true;
					}
					oAjaxPromise = jQuery.ajax({
						url: sConfigURL,
						type: "GET",
						data: oParameters,
						contentType: "application/json; charset=UTF-8",
						async: false
					});

					oAjaxPromise.done(function(oResponse) {
						jQuery.extend(oBackendConfiguration, oResponse);
						Configuration.getUserModel().setProperty("/data", oBackendConfiguration.user);
						Configuration.getUserModel().setProperty("/privileges", oBackendConfiguration.privileges);
						fnAddModel(oResponse);
					});

					oAjaxPromise.fail(function() {
						oBackendConfiguration = {};
						jQuery.sap.log.error("reading backend configuration failed.");
					});
				} else {
					oBackendConfiguration = {};
					jQuery.sap.log.error("Reading user info failed.");
					jQuery.sap.log.error(oResponse.responseText);
				}
			});
			oAjaxPromise.fail(function(oResponse) {
				oBackendConfiguration = {};
				jQuery.sap.log.error("Reading user info failed.");
				jQuery.sap.log.error(oResponse.responseText);
				Configuration.userErrorMessage = oResponse.responseText;
			});
		}
		return oBackendConfiguration;
	}

	var personalize;

	function getPersonalizeSync() {
		var sUrl = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/personalizeSettings.xsjs";
		var oAjax = jQuery.ajax({
			url: sUrl,
			headers: {
				"X-CSRF-Token": "Fetch"
			},
			type: "GET",
			contentType: "application/json; charset=UTF-8",
			async: false
		});
		return oAjax.responseText ? JSON.parse(oAjax.responseText) : {};
	}

	Configuration.personalizeModel = function() {
		if (!personalize) {
			personalize = new sap.ui.model.json.JSONModel({});
		}
		return personalize;
	};

	Configuration.getPersonalize = function() {
		var model = this.personalizeModel();
		//return model.getProperty('/personalizeSetting');
		var oPersonalizeSetting = model.getProperty('/personalizeSetting');
		if (!oPersonalizeSetting) {
			oPersonalizeSetting = getPersonalizeSync();
			model.setProperty('/personalizeSetting', oPersonalizeSetting);
		}
		return model.getProperty('/personalizeSetting');
	};

	Configuration.setPersonalize = function(obj) {
		var model = this.personalizeModel();
		return model.setProperty('/personalizeSetting', obj);
	};

	Configuration.updateCampaignViewCount = function() {

		var sURL = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/update_campaign_viewCount.xsjs";
		var oAjaxPromise = jQuery.ajax({
			url: sURL,
			headers: {
				"X-CSRF-Token": "Fetch"
			},
			type: "GET",
			contentType: "application/json; charset=UTF-8",
			async: false
		});
		Configuration.getErrorMessage = function() {
			return oAjaxPromise.responseText;
		};

		oAjaxPromise.fail(function(oResponse) {
			oBackendConfiguration = {};
			jQuery.sap.log.error("Reading user info failed.");
			jQuery.sap.log.error(oResponse.responseText);
			Configuration.userErrorMessage = oResponse.responseText;
		});

		return;
	};
	Configuration.getGroupConfiguration = function() {
		var oGroupSetting = {
			GROUP: this.getSystemSetting("sap.ino.config.IDEA_COMPANY_VIEW_OPTION") === "sap.ino.config.ORGANIZATION" ? "ORGANIZATION" : "COMPANY", //ORGANIZATION
			DISPLAY_LABEL: this.getSystemSetting("sap.ino.config.IDEA_COMPANY_VIEW_TXT"),
			ENABLE_GROUP_VIEW: this.getSystemSetting("sap.ino.config.ENABLE_IDEA_COMPANY_VIEW") === "1" ? true : false
		};

		return oGroupSetting;
	};

	Configuration.getSysCompanyLabel = function() {
		return this.getGroupConfiguration().DISPLAY_LABEL;
	};

	Configuration.getSysCompanyEnable = function() {
		if (this.getGroupConfiguration().ENABLE_GROUP_VIEW) {
			return 1;
		}
		return 0;
	};

	Configuration.getSysCompanyView = function() {
		if (this.getGroupConfiguration().GROUP === "ORGANIZATION") {
			return "2";
		}
		return "1";
	};
	Configuration.getCustomReportsEnable = function() {
		if (this.getSystemSetting("sap.ino.config.ENABLE_CUSTOM_REPORTS") * 1) {
			return true;
		}
		return false;
	};
	Configuration.getCustomReportsTile = function() {
		return this.getSystemSetting("sap.ino.config.CUSTOM_REPORTS_TILE_NAME")
	};
	return Configuration;
});