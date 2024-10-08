/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
 jQuery.sap.require("sap.ui.ino.views.common.UsageFacetView");
 jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");
 jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
 
 sap.ui.jsview("sap.ui.ino.views.backoffice.config.VoteTypeModifyUsageFacet", jQuery.extend({}, 
    sap.ui.ino.views.common.UsageFacetView, {
        
        getControllerName : function() {
            return "sap.ui.ino.views.backoffice.config.VoteTypeModifyUsageFacet";
        },
        
        createColumns : function() {
            
            var aColumns = [];
            
            var oModelColumn = new sap.ui.table.AnalyticalColumn({
                label : new sap.ui.commons.Label({
                    text : "{/#VoteTypeUsageType/VOTE_TYPE_CODE/@sap:label}"
                }),
                template : new sap.ui.commons.TextView({
                    text : {
                        path : "VOTE_TYPE_CODE",
                        formatter : sap.ui.ino.views.backoffice.config.Util.formatPlainCode
                    }
                }),
                leadingProperty : "VOTE_TYPE_CODE",
                groupHeaderFormatter : sap.ui.ino.views.backoffice.config.Util.formatPlainCode,
                grouped : true,
                summed : false,
                showIfGrouped : true,
                sortProperty : "VOTE_TYPE_CODE"
            });
            aColumns.push(oModelColumn);
            
            var oCampaignIdColumn = new sap.ui.table.AnalyticalColumn({
                label : new sap.ui.commons.Label({
                    text : "{/#VoteTypeUsageType/CAMPAIGN_ID/@sap:label}"
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
                    text : "{/#VoteTypeUsageType/CAMPAIGN_NAME/@sap:label}"
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
        
        getTableBindingInformation : function() {
            
            var oController = this.getController();
            var oModel = oController.getModel();
            
            // get the Code
            var sCode = oModel.getProperty("/CODE");
            
            var aFilters = [];
            var oTagFilter = new sap.ui.model.Filter("VOTE_TYPE_CODE", sap.ui.model.FilterOperator.EQ, sCode);
            aFilters.push(oTagFilter);
            
            var oAbusoluteBinding = {
                path : "/VoteTypeUsage",
                filters : aFilters,
                sorter : [new sap.ui.model.Sorter("CAMPAIGN_ID")],
                parameters : { 
                    provideTotalResultSize: true,
                    useBatchRequests : true,
                    provideGrandTotals: true
                }
            };
            return oAbusoluteBinding;
        }
 
 }));