/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.UsageFacetView");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

sap.ui.jsview("sap.ui.ino.views.backoffice.tag.TagUsageFacet", jQuery.extend({}, sap.ui.ino.views.common.UsageFacetView, {

    oUsageTexts : {
        sHeaderLabel : "BO_TAG_INS_USAGE_HEADER",
        sNoteLabel : "BO_COMMON_USAGE_EXP_NOTE"
    },

    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.tag.TagUsageFacet";
    },

    createColumns : function() {
        // needs to be redefined!
        // shall return an array of AnalyticalColumn Objects
        return [new sap.ui.table.AnalyticalColumn({
            label : new sap.ui.commons.Label({
                text : "{/#TagsUsageType/OBJECT_TYPE_DESCRIPTION/@sap:label}"
            }),
            template : new sap.ui.commons.Label({
                text : "{OBJECT_TYPE_DESCRIPTION}"
            }),
            sortProperty : "OBJECT_TYPE_DESCRIPTION",
            leadingProperty : "OBJECT_TYPE_DESCRIPTION",
            grouped : true,
            summed : false,
            inResult : true,
            showIfGrouped : true,
            autoResizable : true,
            groupHeaderFormatter : this.groupHeaderTextFormatter
        }), new sap.ui.table.AnalyticalColumn({
            label : new sap.ui.commons.Label({
                text : "{/#TagsUsageType/OBJECT_TYPE_CODE/@sap:label}"
            }),
            template : new sap.ui.commons.Label({
                text : "{OBJECT_TYPE_CODE}"
            }),
            sortProperty : "OBJECT_TYPE_CODE",
            leadingProperty : "OBJECT_TYPE_CODE",
            grouped : false,
            summed : false,
            inResult : true,
            visible : false,
            showIfGrouped : true,
            autoResizable : true,
            groupHeaderFormatter : this.groupHeaderKeyFormatter
        }), new sap.ui.table.AnalyticalColumn({
            label : new sap.ui.commons.Label({
                text : "{/#TagsUsageType/OBJECT_NAME/@sap:label}"
            }),
            template : new sap.ui.commons.Link({
                text : "{OBJECT_NAME}",
                press : function(oControlEvent) {
                    var oRowBindingContext = oControlEvent.getSource().getBindingContext();
                    var sObjectType = oRowBindingContext.getProperty("OBJECT_TYPE_CODE");
                    var iObjectID = oRowBindingContext.getProperty("OBJECT_ID");
                    if (!iObjectID) {
                        return;
                    }
                    if (sObjectType === 'IDEA') {
                        sap.ui.ino.application.ApplicationBase.getApplication().
                                navigateToExternal('sap.ino.config.URL_PATH_UI_FRONTOFFICE', 'idea', iObjectID);
                    } else if (sObjectType === 'CAMPAIGN') {
                        sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow("campaign", {
                            id : iObjectID,
                            edit : false
                        });
                    }
                }
            }),
            sortProperty : "OBJECT_NAME",
            leadingProperty : "OBJECT_NAME",
            grouped : false,
            summed : false,
            inResult : true,
            showIfGrouped : true,
            autoResizable : true,
            groupHeaderFormatter : this.groupHeaderTextFormatter
        }), new sap.ui.table.AnalyticalColumn({
            label : new sap.ui.commons.Label({
                text : "{/#TagsUsageType/OBJECT_ID/@sap:label}"
            }),
            template : new sap.ui.commons.Link({
                text : "{OBJECT_ID}",
                press : function(oControlEvent) {
                    var oRowBindingContext = oControlEvent.getSource().getBindingContext();
                    var sObjectType = oRowBindingContext.getProperty("OBJECT_TYPE_CODE");
                    var iObjectID = oRowBindingContext.getProperty("OBJECT_ID");
                    if (!iObjectID) {
                        return;
                    }
                    if (sObjectType === 'IDEA') {
                        sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow("idea", {
                            id : iObjectID,
                            edit : false
                        });
                    } else if (sObjectType === 'CAMPAIGN') {
                        sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow("campaign", {
                            id : iObjectID,
                            edit : false
                        });
                    }
                }
            }),
            sortProperty : "OBJECT_ID",
            leadingProperty : "OBJECT_ID",
            grouped : false,
            summed : false,
            inResult : true,
            visible : false,
            showIfGrouped : true,
            autoResizable : true,
            groupHeaderFormatter : this.groupHeaderKeyFormatter
        }), new sap.ui.table.AnalyticalColumn({
            label : new sap.ui.commons.Label({
                text : "{/#TagsUsageType/USAGE_COUNT/@sap:label}"
            }),
            template : new sap.ui.commons.Label({
                text : "{USAGE_COUNT}"
            }),
            sortProperty : "USAGE_COUNT",
            leadingProperty : "USAGE_COUNT",
            grouped : false,
            summed : true,
            inResult : true,
            showIfGrouped : true,
            autoResizable : true
        })];
    },

    getTableBindingInformation : function() {
        // needs to be redefined!
        // shall return an object containing the binding info to put into "bindRows" method
        var oController = this.getController();
        var oModel = oController.getModel();

        // get the ID
        var iID = oModel.getProperty("/ID");

        // Bind against /TagsUsage and add a filter ID = iID;

        var sID = "" + iID + "";

        var aFilters = [];
        var oTagFilter = new sap.ui.model.Filter("ID", sap.ui.model.FilterOperator.EQ, sID);
        aFilters.push(oTagFilter);

        var oAbsoluteBinding = {
            path : "/TagsUsage",
            filters : aFilters,
            parameters : {
                provideTotalResultSize : true,
                useBatchRequests : true,
                provideGrandTotals : true,
            }
        }
        return oAbsoluteBinding;
    },

    revalidateMessages : function() {
        var oThingInspectorView = this.getController().getThingInspectorController().getView();
        oThingInspectorView.revalidateMessages();
    },
    
}));