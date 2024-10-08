/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.models.types.RelativeDateTimeType");
jQuery.sap.require("sap.ui.ino.views.mashup.WidgetView");
jQuery.sap.require("sap.ui.ino.controls.WidgetRowItem");

sap.ui.jsview("sap.ui.ino.views.mashup.RecentIdeasWidget", jQuery.extend({}, sap.ui.ino.views.mashup.WidgetView, {

    getControllerName : function() {
        return "sap.ui.ino.views.mashup.RecentIdeasWidget";
    },

    getRepeaterTemplate : function(_oApp) {
    	 var _oTextBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();

        return new sap.ui.ino.controls.WidgetRowItem({
            imageId: "{TITLE_IMAGE_ID}",
            imageColor: "{CAMPAIGN_COLOR}",
            imageWidth: 90,
            title: "{NAME}",
            detailsURL : {
                path : "ID",
                formatter : function(iIdeaId) {
                    return _oApp.getExternalNavigationLink(
                            "sap.ino.config.URL_PATH_UI_FRONTOFFICE",
                            "idea",
                            iIdeaId
                        );
                }
            },
            footer: {
                path : "SUBMITTED_AT",
                type : new sap.ui.ino.models.types.RelativeDateTimeType()
            },
            subFooter : {
                path : "SUBMITTER_NAME",
                formatter : function(sName) {
                    return _oTextBundle.getText("MW_COMMON_FLD_BY", sName);
                }
            }
        });
    },

    getNoEntriesFoundTextCode : function() {
        return "{i18n>MW_RID_MSG_NO_IDEAS}";
    },

    getHeaderTextCode : function() {
        return "{i18n>MW_RID_TIT_RECENT_IDEAS}";
    },

    getFilter : function(iIdeaId) {
        var aFilter = [new sap.ui.model.Filter("STATUS", "NE", "'sap.ino.config.DRAFT'")];
        if (iIdeaId != 0) {
            aFilter.push(new sap.ui.model.Filter("ID", "EQ", iIdeaId));
        }
        return aFilter;
    },

    getBindingData : function(sSearchTerm, sTag, sFilterName) {
        if (sSearchTerm !== '' || sTag !== '') {
            return {
                Path : "/IdeaMediumSearchParams(searchToken='"+sSearchTerm+"',tagsToken='"+sTag+"',filterName='',filterBackoffice=0)/Results",
                Sorter : new sap.ui.model.Sorter("SUBMITTED_AT", true),
                SelectedAttributes : "ID,NAME,TITLE_IMAGE_ID,CAMPAIGN_COLOR,SUBMITTED_AT,SUBMITTER_NAME"
            };
        } else {
            return {
                Path : "/IdeaMediumCommunity",
                Sorter : new sap.ui.model.Sorter("SUBMITTED_AT", true),
                SelectedAttributes : "ID,NAME,TITLE_IMAGE_ID,CAMPAIGN_COLOR,SUBMITTED_AT,SUBMITTER_NAME"
            };
        }
    }
}));