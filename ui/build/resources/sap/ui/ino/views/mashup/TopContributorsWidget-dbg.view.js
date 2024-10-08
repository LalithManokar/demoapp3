/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.application.Configuration");
var Configuration = sap.ui.ino.application.Configuration;
jQuery.sap.require("sap.ui.ino.controls.ThemeFactory");
jQuery.sap.require("sap.ui.ino.controls.WidgetRowItem");
jQuery.sap.require("sap.ui.ino.views.mashup.WidgetView");

sap.ui.jsview("sap.ui.ino.views.mashup.TopContributorsWidget", jQuery.extend({}, sap.ui.ino.views.mashup.WidgetView, {

    getControllerName : function() {
        return "sap.ui.ino.views.mashup.TopContributorsWidget";
    },

    getRepeaterTemplate : function() {
        var _oTextBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();

        return new sap.ui.ino.controls.WidgetRowItem({
            imageId: "{CONTRIBUTOR_IMAGE_ID}",
            defaultImageURL: sap.ui.ino.controls.ThemeFactory.getImage("user_48x48.png"),
            relativeImageWidth: 5,
            imageHeightFactor: 1.29,
            title: "{CONTRIBUTOR_NAME}",
            subTitle: "{i18n>MW_TCO_FLD_CONTRIBUTOR}",
            footer: {
                path: "IDEA_COUNT",
                formatter : function(iCount) {
                    return _oTextBundle.getText("MW_TCO_FLD_CONTRIBUTED", iCount);
                }
            }
        });
    },

    getNoEntriesFoundTextCode : function() {
        return "{i18n>MW_RCO_MSG_NO_CONTRIBUTORS}";
    },

    getHeaderTextCode : function() {
        return "{i18n>MW_TCO_TIT_TOP_CONTRIBUTORS}";
    },

    getFilter : function(iIdeaId) {
        var aFilter = [];
        if (iIdeaId != 0) {
            aFilter.push(new sap.ui.model.Filter("OBJECT_ID", "EQ", iIdeaId));
        }
        return aFilter;
    },

    getBindingData : function(sSearchTerm, sTag, sFilterName) {
        return {
            Model : new sap.ui.model.odata.ODataModel(
                    Configuration.getFullApplicationPath("sap.ino.config.URL_PATH_OD_APPLICATION"), false),
            Path : "/MashupContributors",
            Sorter : new sap.ui.model.Sorter("IDEA_COUNT", true),
            SelectedAttributes : "CONTRIBUTOR_NAME,CONTRIBUTOR_IMAGE_ID,IDEA_COUNT"
        };
    }
}));