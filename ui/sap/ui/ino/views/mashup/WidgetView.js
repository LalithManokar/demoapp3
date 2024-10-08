/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.views.mashup.WidgetView");

jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.mashup.Application");

jQuery.sap.require("sap.ui.ino.controls.TextView");
jQuery.sap.require("sap.ui.ino.controls.Widget");
jQuery.sap.require("sap.ui.ino.controls.Repeater");
jQuery.sap.require("sap.ui.ino.controls.WidgetBannerData");

jQuery.sap.require("sap.ui.ino.application.Configuration");
var Configuration = sap.ui.ino.application.Configuration;

(function() {
    "use strict";

    sap.ui.ino.views.mashup.WidgetView = {
        // Function needs to be overridden
        getControllerName : function() {
            return undefined;
        },

        getFloatHorizontal : function() {
            return false;
        },

        setHistoryState : function(path) {
           var iIdeaId = 0;
           var iCampaignId = 0;
           var top = 10;
           var sSearchTerm = "";
           var sTag = "";
           var sFilter = "";
           if (path) {
               if (!isNaN(parseInt(path.idea, 10))) {
                   iIdeaId = parseInt(path.idea, 10);
               }
               if (!isNaN(parseInt(path.campaign, 10))) {
                   iCampaignId = parseInt(path.campaign, 10);
               }
               if (!isNaN(parseInt(path.top, 10))) {
                   top = parseInt(path.top, 10);
               }
               if (path.tag) {
                   sTag = path.tag;
               }
               if (path.searchTerm) {
                   sSearchTerm = path.searchTerm;
               }
               if (path.filter) {
                   sFilter = path.filter;
               }
               if (path.bannerStyleCover && path.bannerStyleCover === "false") {
                   this.oWidgetBannerDataTemplate.setImageStyle("contain");
               }
               if (path.hideBanner && path.hideBanner === "true") {
                   this.oWidget.setBannerVisible(false);
               }
               if (path.hideHeader && path.hideHeader === "true") {
                   this.oWidget.setHeaderVisible(false);
               }
               this.oRepeater.setShowMoreSteps(top);
            }

            var aFilter = this.getFilter(iIdeaId);
            if (iCampaignId !== 0) {
                this.oWidgetBannerDataTemplate.bindElement({
                    path : "/CampaignFull(" + iCampaignId + ")",
                    parameters : {
                       select : "ID,NAME,COLOR_CODE,CAMPAIGN_IMAGE_ID"
                    }
                });
                this.oWidget.bannerData = this.oWidgetBannerDataTemplate;
                aFilter.push(new sap.ui.model.Filter("CAMPAIGN_ID", "EQ", iCampaignId));
            }

            var oBindingData = this.getBindingData(sSearchTerm, sTag, sFilter);

            if(oBindingData.Model) {
                this.oRepeater.setModel(oBindingData.Model);
            }

            var oParameters;
            if(oBindingData.SelectedAttributes) {
                oParameters = {
                    select : oBindingData.SelectedAttributes
                };
            }

            this.oRepeater.bindRows({
                path : oBindingData.Path,
                template : this.oTemplate,
                sorter : oBindingData.Sorter,
                filters : aFilter,
                parameters : oParameters
            });
        },

        attachRequestFailed : function(oEvent) {
            var oApplication = sap.ui.ino.application.mashup.Application.getInstance();
            var oMsgBundle = new sap.ui.model.resource.ResourceModel({
                bundleUrl : Configuration.getResourceBundleURL(sap.ui.ino.application.ApplicationBase.RESOURCE_MESSAGE)
            });
            var statusCode = oEvent.getParameter("statusCode");
            switch (statusCode) {
                case 404 :
                    oApplication.showError(oMsgBundle.getResourceBundle().getText("MSG_HTTP_ERROR_404_CAMP_DETAIL"));
                    break;
                default :
                    oApplication.showError(oMsgBundle.getResourceBundle().getText("MSG_HTTP_ERROR_" + "GENERAL"));
                    break;
            }
        },

        createContent : function() {
            this.setHeight("100%");
            var _oApp = sap.ui.ino.application.ApplicationBase.getApplication();

            this.oWidgetBannerDataTemplate = new sap.ui.ino.controls.WidgetBannerData({
                title : "{NAME}",
                colorCode : "{COLOR_CODE}",
                detailsURL : {
                    path : "ID",
                    formatter : function(iCampaignId) {
                        return _oApp.getExternalNavigationLink(
                                "sap.ino.config.URL_PATH_UI_FRONTOFFICE",
                                "campaign",
                                iCampaignId
                            );
                    }
                },
                imageId : "{CAMPAIGN_IMAGE_ID}"
            });

            var oShowMoreButton = new sap.ui.commons.Link({
                text : "{i18n>MW_COMMON_BUT_SHOW_MORE}"
            });
            oShowMoreButton.addStyleClass("sapUiInoWidgetRowShowMore");
            
            this.oRepeater = new sap.ui.ino.controls.Repeater({
                floatHorizontal : this.getFloatHorizontal(),
                waitingText : "{i18n>MW_COMMON_MSG_LOADING}",
                noData : new sap.ui.ino.controls.TextView({
                    text : this.getNoEntriesFoundTextCode()
                }),
                showMoreSteps : 10,
                showMoreButton : oShowMoreButton
            });

            this.oTemplate = this.getRepeaterTemplate(_oApp);

            this.oWidget = new sap.ui.ino.controls.Widget({
                headerText : this.getHeaderTextCode(),
                bannerData : this.oWidgetBannerDataTemplate,
                content : this.oRepeater
            });

            return this.oWidget;
        }
    };
})();
