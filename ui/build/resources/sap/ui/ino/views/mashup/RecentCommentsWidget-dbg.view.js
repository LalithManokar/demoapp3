/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.controls.ThemeFactory");
jQuery.sap.require("sap.ui.ino.models.types.RelativeDateTimeType");
jQuery.sap.require("sap.ui.ino.views.mashup.WidgetView");
jQuery.sap.require("sap.ui.ino.controls.WidgetRowItem");

sap.ui.jsview("sap.ui.ino.views.mashup.RecentCommentsWidget", jQuery.extend({}, sap.ui.ino.views.mashup.WidgetView, {

    getControllerName : function() {
        return "sap.ui.ino.views.mashup.RecentCommentsWidget";
    },

    getRepeaterTemplate : function(_oApp) {
        var _oTextBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();

        return new sap.ui.ino.controls.WidgetRowItem({
            title: "{COMMENT}",
            defaultImageURL: sap.ui.ino.controls.ThemeFactory.getImage("comment.png"),
            imageWidth: 40,
            imageHeightFactor: 1,
            allowMultilineTitle: true,
            detailsURL : {
                path : "OBJECT_ID",
                formatter : function(iIdeaId) {
                    return _oApp.getExternalNavigationLink(
                            "sap.ino.config.URL_PATH_UI_FRONTOFFICE",
                            "idea",
                            iIdeaId
                        );
                }
            },
            subTitle: "{IDEA_NAME}",
            footer: {
                path : "CREATED_AT",
                type : new sap.ui.ino.models.types.RelativeDateTimeType()
            },
            subFooter : {
                path : "CREATED_BY_NAME",
                formatter : function(sName) {
                    return _oTextBundle.getText("MW_COMMON_FLD_BY", sName);
                }
            }
        });
    },

    getNoEntriesFoundTextCode : function() {
        return "{i18n>MW_RCO_MSG_NO_COMMENTS}";
    },

    getHeaderTextCode : function() {
        return "{i18n>MW_RCO_TIT_RECENT_COMMENTS}";
    },

    getFilter : function(iIdeaId) {
        var aFilter = [];
        if (iIdeaId != 0) {
            aFilter.push(new sap.ui.model.Filter("OBJECT_ID", "EQ", iIdeaId));
        }
        return aFilter;
    },

    getBindingData : function() {
        return {
            Path: "/IdeaRecentComment",
            Sorter: new sap.ui.model.Sorter("CREATED_AT", true),
            SelectedAttributes: "COMMENT,OBJECT_ID,IDEA_NAME,CREATED_AT,CREATED_BY_NAME"			
        };
    }
}));