/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.UsageFacetView");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.UnitUsageFacet", jQuery.extend({},
        sap.ui.ino.views.common.UsageFacetView, {

            getControllerName : function() {
                return "sap.ui.ino.views.backoffice.config.UnitUsageFacet";
            },

            createColumns : function(){
                //needs to be redefined!
                //shall return an array of AnalyticalColumn Objects
                
                var aColumns = [];
                
                var oCriterionColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#UnitUsageType/CRITERION_CODE/@sap:label}"
                    }),
                    template : new sap.ui.commons.TextView({
                        text : {
                            path : "CRITERION_CODE",
                            formatter : sap.ui.ino.views.backoffice.config.Util.formatPlainCode
                        }
                    }),
                    leadingProperty : "CRITERION_CODE",
                    groupHeaderFormatter : sap.ui.ino.views.backoffice.config.Util.formatPlainCode,
                    grouped : true,
                    summed : false,
                    showIfGrouped : true,
                    sortProperty : "CRITERION_CODE"
                });
                aColumns.push(oCriterionColumn);
                
                var oModelColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#UnitUsageType/MODEL_CODE/@sap:label}"
                    }),
                    template : new sap.ui.commons.TextView({
                        text : {
                            path : "MODEL_CODE",
                            formatter : sap.ui.ino.views.backoffice.config.Util.formatPlainCode
                        }
                    }),
                    leadingProperty : "MODEL_CODE",
                    groupHeaderFormatter : sap.ui.ino.views.backoffice.config.Util.formatPlainCode,
                    grouped : true,
                    summed : false,
                    showIfGrouped : true,
                    sortProperty : "MODEL_CODE"
                });
                aColumns.push(oModelColumn);
                
                var oCampaignColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#UnitUsageType/CAMPAIGN_NAME/@sap:label}"
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
                    grouped : true,
                    summed : false,
                    sortProperty : "CAMPAIGN_NAME",
                    showIfGrouped : true,
                    groupHeaderFormatter : this.groupHeaderTextFormatter
                });
                aColumns.push(oCampaignColumn);
                
                var oCampaignIDColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#UnitUsageType/CAMPAIGN_ID/@sap:label}"
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

                var oStatusColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#UnitUsageType/CAMPAIGN_STATUS_CODE/@sap:label}"
                    }),
                    template : new sap.ui.commons.TextView({
                        text : {
                            path : "CAMPAIGN_STATUS_CODE",
                            formatter : sap.ui.ino.models.core.CodeModel
                                        .getFormatter("sap.ino.xs.object.status.Status.Root")
                        }
                    }),
                    leadingProperty : "CAMPAIGN_STATUS_CODE",
                    grouped : true,
                    summed : false,
                    showIfGrouped : true,
                    sortProperty : "CAMPAIGN_STATUS_CODE"
                });
                aColumns.push(oStatusColumn);
                
                var oIdeaColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#UnitUsageType/IDEA_NAME/@sap:label}"
                    }),
                    template : new sap.ui.commons.Link({
                        text : {
                            path : "IDEA_NAME",
                            type : new sap.ui.model.type.String()
                        },
                        press : function(oControlEvent) {
                            var oRowBindingContext = oControlEvent.getSource().getBindingContext();
                            var iObjectID = oRowBindingContext.getProperty("IDEA_ID");
                            if(!iObjectID){
                                return;
                            }
                            sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow(
                                    "idea", {
                                        id : iObjectID,
                                        edit : false
                            });
                        }
                        
                    }),
                    leadingProperty : "IDEA_NAME",
                    grouped : false,
                    summed : false,
                    sortProperty : "IDEA_NAME",
                    showIfGrouped : true,
                    groupHeaderFormatter : this.groupHeaderTextFormatter
                });
                aColumns.push(oIdeaColumn);
                
                var oIdeaIDColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#UnitUsageType/IDEA_ID/@sap:label}"
                    }),
                    template : new sap.ui.commons.Link({
                        text : {
                            path : "IDEA_ID",
                            type : new sap.ui.model.type.String()
                        },
                        press : function(oControlEvent) {
                            var oRowBindingContext = oControlEvent.getSource().getBindingContext();
                            var iObjectID = oRowBindingContext.getProperty("IDEA_ID");
                            if(!iObjectID){
                                return;
                            }
                            sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow(
                                    "idea", {
                                        id : iObjectID,
                                        edit : false
                            });
                        }
                        
                    }),
                    leadingProperty : "IDEA_ID",
                    grouped : false,
                    summed : false,
                    inResult : true,
                    visible : false,
                    sortProperty : "IDEA_ID",
                    showIfGrouped : true,
                    groupHeaderFormatter : this.groupHeaderKeyFormatter
                });
                aColumns.push(oIdeaIDColumn);

                var oCountColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#UnitUsageType/EVALUATION_COUNT/@sap:label}"
                    }),
                    template : new sap.ui.commons.TextView({
                        text : {
                            path : "EVALUATION_COUNT",
                            type : new sap.ui.model.type.Integer()
                        }
                    }),
                    leadingProperty : "EVALUATION_COUNT",
                    grouped : false,
                    summed : true,
                    showIfGrouped : true,
                    sortProperty : "EVALUATION_COUNT"
                });
                aColumns.push(oCountColumn);
                                
                return aColumns;
            },
            
            getTableBindingInformation : function(){
                //needs to be redefined!
                //shall return an object containing the binding info to put into "bindRows" method
                var oController = this.getController();
                var oModel = oController.getModel();

                // get the Code
                var sCode = oModel.getProperty("/CODE");
                
                // Bind against /ValueOptionListUsage and add a filter CODE = sCode;
                
                var aFilters = [];
                var oTagFilter = new sap.ui.model.Filter("UNIT_CODE", sap.ui.model.FilterOperator.EQ, sCode);
                aFilters.push(oTagFilter);
                
                var oAbsoluteBinding = {
                        path : "/UnitUsage",
                        filters : aFilters,
                        sorter : [new sap.ui.model.Sorter("CRITERION_CODE")],
                        parameters : { 
                            provideTotalResultSize: true,
                            useBatchRequests : true,
                            provideGrandTotals: true
                        }
                };
                return oAbsoluteBinding;
            }

        }));
