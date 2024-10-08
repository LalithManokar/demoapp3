/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.UsageFacetView");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.MailTemplateUsageFacet", jQuery.extend({},
        sap.ui.ino.views.common.UsageFacetView, {

            getControllerName : function() {
                return "sap.ui.ino.views.backoffice.config.MailTemplateUsageFacet";
            },

            createColumns : function(){
                //needs to be redefined!
                //shall return an array of AnalyticalColumn Objects
                var aColumns = [];
                
                var oCampaignColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#MailTemplateUsageType/CAMPAIGN_NAME/@sap:label}"
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
                    showIfGrouped : true,
                    groupHeaderFormatter : this.groupHeaderTextFormatter
                });
                aColumns.push(oCampaignColumn);
                
                var oCampaignIDColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#MailTemplateUsageType/CAMPAIGN_ID/@sap:label}"
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
                    grouped : false,
                    summed : false,
                    inResult : true,
                    visible : false,
                    sortProperty : "CAMPAIGN_ID",
                    showIfGrouped : true,
                    groupHeaderFormatter : this.groupHeaderKeyFormatter
                });
                aColumns.push(oCampaignIDColumn);

                var oCountColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#MailTemplateUsageType/CAMPAIGN_COUNT/@sap:label}"
                    }),
                    template : new sap.ui.commons.TextView({
                        text : {
                            path : "CAMPAIGN_COUNT",
                            type : new sap.ui.model.type.Integer()
                        }
                    }),
                    leadingProperty : "CAMPAIGN_COUNT",
                    grouped : false,
                    summed : true,
                    showIfGrouped : true,
                    sortProperty : "CAMPAIGN_COUNT"
                });
                aColumns.push(oCountColumn);
                                
                return aColumns;
            },
            
            getTableBindingInformation : function(){
                var sCode = this.getController().getModel().getProperty("/CODE");                
                // Bind against /ValueOptionListUsage and add a filter CODE = sCode;                
                var aFilters = [];
                var oTagFilter = new sap.ui.model.Filter("MAIL_TEMPLATE_CODE", sap.ui.model.FilterOperator.EQ, sCode);
                aFilters.push(oTagFilter);
                
                var oAbsoluteBinding = {
                        path : "/MailTemplateUsage",
                        filters : aFilters,
                        sorter : [new sap.ui.model.Sorter("CAMPAIGN_NAME")],
                        parameters : { 
                            provideTotalResultSize: true,
                            useBatchRequests : true,
                            provideGrandTotals: true
                        }
                };
                return oAbsoluteBinding;
            }

        }));
