/*!
 * @copyright@
 */
 jQuery.sap.require("sap.ui.ino.views.common.UsageFacetView");
 jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");
 jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
 
 sap.ui.jsview("sap.ui.ino.views.backoffice.statusconfig.StatusModelModifyUsageFacet", jQuery.extend({}, 
    sap.ui.ino.views.common.UsageFacetView, {
        
        getControllerName : function() {
            return "sap.ui.ino.views.backoffice.statusconfig.StatusModelModifyUsageFacet";
        },
        
        createColumns : function() {
            
            var aColumns = [];
            
            var oModelColumn = new sap.ui.table.AnalyticalColumn({
                label : new sap.ui.commons.Label({
                    text : "{/#StatusModelUsageType/MODEL_CODE/@sap:label}"
                }),
                template : new sap.ui.commons.TextView({
                    text : {
                        path : "MODEL_CODE",
                        formatter : sap.ui.ino.views.backoffice.config.Util.formatPlainCode
                    }
                }),
                leadingProperty : "MODEL_CODE",
                groupHeaderFormatter : sap.ui.ino.views.backoffice.config.Util.formatPlainCode,
                grouped : false,
                summed : false,
                showIfGrouped : true,
                sortProperty : "MODEL_CODE"
            });
            aColumns.push(oModelColumn);
            
            var oCampaignIdColumn = new sap.ui.table.AnalyticalColumn({
                label : new sap.ui.commons.Label({
                    text : "{/#StatusModelUsageType/CAMPAIGN_ID/@sap:label}"
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
                    text : "{/#StatusModelUsageType/CAMPAIGN_NAME/@sap:label}"
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
            
            var oCampaignPhaseColumn = new sap.ui.table.AnalyticalColumn({
                label : new sap.ui.commons.Label({
                    text : "{/#StatusModelUsageType/CAMPAIGN_PHASE/@sap:label}"
                }),
                template : new sap.ui.commons.TextView({
                    text : {
                        path : "CAMPAIGN_PHASE",
                        formatter : sap.ui.ino.views.backoffice.config.Util.formatPlainCode
                    }
                }),
                leadingProperty : "CAMPAIGN_PHASE",
                grouped : false,
                summed : false,
                showIfGrouped : true,
                sortProperty : "CAMPAIGN_PHASE"
            });
            aColumns.push(oCampaignPhaseColumn);
            
            return aColumns;
        },

        getTableBindingInformation : function() {
            
            var oController = this.getController();
            var oModel = oController.getModel();
            
            // get the Code
            var sCode = oModel.getProperty("/CODE");
            
            var aFilters = [];
            var oTagFilter = new sap.ui.model.Filter("MODEL_CODE", sap.ui.model.FilterOperator.EQ, sCode);
            aFilters.push(oTagFilter);
            
            var oAbusoluteBinding = {
                path : "/StatusModelUsage",
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