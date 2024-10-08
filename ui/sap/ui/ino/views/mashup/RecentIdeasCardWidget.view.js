/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.application.ControlFactory");
jQuery.sap.require("sap.ui.ino.views.mashup.WidgetView");

sap.ui.jsview("sap.ui.ino.views.mashup.RecentIdeasCardWidget", jQuery.extend({}, sap.ui.ino.views.mashup.WidgetView, {

    getControllerName : function() {
        return "sap.ui.ino.views.mashup.RecentIdeasCardWidget";
    },

    getFloatHorizontal : function() {
        return true;
    },

    getRepeaterTemplate : function() {
        return sap.ui.ino.application.ControlFactory.createIdeaCard();
    },

    getNoEntriesFoundTextCode : function() {
        return "{i18n>MW_RCO_MSG_NO_IDEAS}";
    },

    getHeaderTextCode : function() {
        return "{i18n>MW_RID_TIT_RECENT_IDEAS}";
    },

    getFilter : function(iIdeaId) {
        var aFilter = [new sap.ui.model.Filter("STATUS", "NE", "sap.ino.config.DRAFT")];
        if (iIdeaId != 0) {
            aFilter.push(new sap.ui.model.Filter("ID", "EQ", iIdeaId));
        }
        return aFilter;
    },

    getBindingData : function(sSearchTerm, sTag, sFilterName) {
        if (sSearchTerm !== '' || sTag !== '') {
            return {
                Path : "/IdeaMediumSearchParams(searchToken='"+sSearchTerm+"',tagsToken='"+sTag+"',filterName='',filterBackoffice=0)/Results",
                Sorter : new sap.ui.model.Sorter("SUBMITTED_AT", true)
            };
        } else {
            return {
                Path : "/IdeaMediumCommunity",
                Sorter : new sap.ui.model.Sorter("SUBMITTED_AT", true)
            };
        }
    }
}));