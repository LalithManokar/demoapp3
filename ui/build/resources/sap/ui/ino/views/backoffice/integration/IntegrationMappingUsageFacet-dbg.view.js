/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.UsageFacetView");
jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.model.Filter");

sap.ui.jsview("sap.ui.ino.views.backoffice.integration.IntegrationMappingUsageFacet",
	jQuery.extend({}, sap.ui.ino.views.common.UsageFacetView, {

    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.integration.IntegrationMappingUsageFacet";
    },
    
    createColumns: function() {
        var aColumns = [];
            
        var oModelColumn = new sap.ui.table.AnalyticalColumn({
            label : new sap.ui.commons.Label({
                text : "{/#IntegrationUsageType/API_TECHNICAL_NAME/@sap:label}"
            }),
            template : new sap.ui.commons.TextView({
                text : {
                    path : "API_TECHNICAL_NAME",
                    formatter : sap.ui.ino.views.backoffice.config.Util.formatPlainCode
                }
            }),
            leadingProperty : "API_TECHNICAL_NAME",
            groupHeaderFormatter : sap.ui.ino.views.backoffice.config.Util.formatPlainCode,
            grouped : true,
            summed : false,
            showIfGrouped : true,
            sortProperty : "API_TECHNICAL_NAME"
        });
        aColumns.push(oModelColumn);
        
        var oCampaignIdColumn = new sap.ui.table.AnalyticalColumn({
            label : new sap.ui.commons.Label({
                text : "{/#IntegrationUsageType/CAMPAIGN_ID/@sap:label}"
            }),
            template : new sap.ui.commons.Link({
                text : {
                    path : "CAMPAIGN_ID",
                    type : new sap.ui.model.type.String()
                },
                press : function(oControlEvent) {
                    var oRowBindingContext = oControlEvent.getSource().getBindingContext();
                    var iObjectID = oRowBindingContext.getProperty("CAMPAIGN_ID");
                    if(!iObjectID){
                        return;
                    }
                    sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow(
                        "campaign", {
                            id : iObjectID,
                            edit : false
                    });
                }
            }),
            leadingProperty : "CAMPAIGN_ID",
            grouped : true,
            summed : false,
            inResult : true,
            sortProperty : "CAMPAIGN_ID",
            showIfGrouped : true
        });
        aColumns.push(oCampaignIdColumn);
        
        var oCampaignColumn = new sap.ui.table.AnalyticalColumn({
            label : new sap.ui.commons.Label({
                text : "{/#IntegrationUsageType/CAMPAIGN_NAME/@sap:label}"
            }),
            template : new sap.ui.commons.Link({
                text : {
                    path : "CAMPAIGN_NAME",
                    type : new sap.ui.model.type.String()
                },
                press : function(oControlEvent) {
                    var oRowBindingContext = oControlEvent.getSource().getBindingContext();
                    var iObjectID = oRowBindingContext.getProperty("CAMPAIGN_ID");
                    if(!iObjectID){
                        return;
                    }
                    sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow(
                        "campaign", {
                            id : iObjectID,
                            edit : false
                    });
                }
            }),
            leadingProperty : "CAMPAIGN_NAME",
            grouped : false,
            summed : false,
            sortProperty : "CAMPAIGN_NAME",
            showIfGrouped : true
        });
        aColumns.push(oCampaignColumn);
        
        return aColumns;
    },
    
    getTableBindingInformation: function() {
        var oController = this.getController();
        var oModel = oController.getModel();
        var oFilter = new sap.ui.model.Filter("API_TECHNICAL_NAME", sap.ui.model.FilterOperator.EQ, oModel.getProperty("/TECHNICAL_NAME"));
        
        
        var oAbusoluteBinding = {
            path : "/IntegrationUsage",
            filters: [oFilter],
            sorter : [new sap.ui.model.Sorter("API_TECHNICAL_NAME")],
            parameters : { 
                provideTotalResultSize: true,
                useBatchRequests : true,
                provideGrandTotals: true
            }
        };
        return oAbusoluteBinding;
    }
}));