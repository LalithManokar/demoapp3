/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.UsageFacetView");
jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.ValueOptionListUsageVoteTypeFacet", jQuery.extend({},
        sap.ui.ino.views.common.UsageFacetView, {

            getControllerName : function() {
                return "sap.ui.ino.views.backoffice.config.ValueOptionListUsageVoteTypeFacet";
            },

            createColumns : function(){
                //needs to be redefined!
                //shall return an array of AnalyticalColumn Objects
                
                var aColumns = [];
                
                var oCriterionColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#ValueOptionListVoteTypeUsageType/VOTE_TYPE_CODE/@sap:label}"
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
                aColumns.push(oCriterionColumn);
                
                var oModelColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#ValueOptionListVoteTypeUsageType/VALUE_LIST_CODE/@sap:label}"
                    }),
                    template : new sap.ui.commons.TextView({
                        text : {
                            path : "VALUE_LIST_CODE",
                            formatter : sap.ui.ino.views.backoffice.config.Util.formatPlainCode
                        }
                    }),
                    leadingProperty : "VALUE_LIST_CODE",
                    groupHeaderFormatter : sap.ui.ino.views.backoffice.config.Util.formatPlainCode,
                    grouped : true,
                    summed : false,
                    showIfGrouped : true,
                    sortProperty : "VALUE_LIST_CODE"
                });
                aColumns.push(oModelColumn);
                
                var oCampaignColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#ValueOptionListVoteTypeUsageType/CAMPAIGN_NAME/@sap:label}"
                    }),
                    template : new sap.ui.commons.Link({
                        text : {
                            path : "CAMPAIGN_NAME",
                            type : new sap.ui.model.type.String()
                        },
                        press : function(oControlEvent) {
                            var oRowBindingContext = oControlEvent.getSource().getBindingContext();
                            var iObjectID = oRowBindingContext.getProperty("CAMPAIGN_ID");
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
                    showIfGrouped : true
                    
                });
                aColumns.push(oCampaignColumn);
                
                var oCampaignIDColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#ValueOptionListVoteTypeUsageType/CAMPAIGN_ID/@sap:label}"
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
                        text : "{/#ValueOptionListVoteTypeUsageType/USAGE_COUNT/@sap:label}"
                    }),
                    template : new sap.ui.commons.TextView({
                        text : {
                            path : "USAGE_COUNT",
                            type : new sap.ui.model.type.Integer()
                        }
                    }),
                    leadingProperty : "USAGE_COUNT",
                    grouped : false,
                    summed : true,
                    showIfGrouped : true,
                    sortProperty : "USAGE_COUNT"
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
                var oTagFilter = new sap.ui.model.Filter("VALUE_LIST_CODE", sap.ui.model.FilterOperator.EQ, sCode);
                aFilters.push(oTagFilter);
                
                var oAbsoluteBinding = {
                        path : "/ValueOptionListVoteTypeUsage",
                        filters : aFilters,
                        sorter : [new sap.ui.model.Sorter("VOTE_TYPE_CODE")],
                        parameters : { 
                            provideTotalResultSize: true,
                            useBatchRequests : true,
                            provideGrandTotals: true
                        }
                };
                return oAbsoluteBinding;
            }

        }));
