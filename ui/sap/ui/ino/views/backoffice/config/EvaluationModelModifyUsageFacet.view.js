/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.UsageFacetView");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.EvaluationModelModifyUsageFacet", jQuery.extend({},
        sap.ui.ino.views.common.UsageFacetView, {

            oUsageTexts : {
                sHeaderLabel : "BO_MODEL_USAGE_EXP_HEADER",
                sNoteLabel : "BO_MODEL_USAGE_EXP_NOTE"
            },
    
            getControllerName : function() {
                return "sap.ui.ino.views.backoffice.config.EvaluationModelModifyUsageFacet";
            },

            createColumns : function(){
                //needs to be redefined!
                //shall return an array of AnalyticalColumn Objects
                
                var aColumns = [];
                
                var oCampaignIDColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#EvaluationModelUsageType/CAMPAIGN_ID/@sap:label}"
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
                    visible : false,
                    sortProperty : "CAMPAIGN_ID",
                    showIfGrouped : true,
                    modelgroupHeaderFormatter : this.groupHeaderKeyFormatter
                });
                aColumns.push(oCampaignIDColumn);
                
                var oCampaignColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#EvaluationModelUsageType/CAMPAIGN_NAME/@sap:label}"
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

                var oStatusColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#EvaluationModelUsageType/CAMPAIGN_STATUS_CODE/@sap:label}"
                    }),
                    template : new sap.ui.commons.TextView({
                        text : {
                            path : "CAMPAIGN_STATUS_CODE",
                            formatter : sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.status.Status.Root")
                        }
                    }),
                    groupHeaderFormatter : sap.ui.ino.models.core.CodeModel.getFormatter("sap.ino.xs.object.status.Status.Root"),
                    leadingProperty : "CAMPAIGN_STATUS_CODE",
                    grouped : true,
                    summed : false,
                    showIfGrouped : true,
                    sortProperty : "CAMPAIGN_STATUS_CODE"
                });
                aColumns.push(oStatusColumn);
                
                var oIdeaColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#EvaluationModelUsageType/IDEA_NAME/@sap:label}"
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
                            sap.ui.ino.application.ApplicationBase.getApplication().
                                navigateToExternal('sap.ino.config.URL_PATH_UI_FRONTOFFICE', 'idea', iObjectID);
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
                        text : "{/#EvaluationModelUsageType/IDEA_ID/@sap:label}"
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
                            sap.ui.ino.application.ApplicationBase.getApplication().
                                navigateToExternal('sap.ino.config.URL_PATH_UI_FRONTOFFICE', 'idea', iObjectID);
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
                        text : "{/#EvaluationModelUsageType/EVALUATION_COUNT/@sap:label}"
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
                
                // Bind against /TagsUsage and add a filter CODE = sCode;
                
                var aFilters = [];
                var oTagFilter = new sap.ui.model.Filter("MODEL_CODE", sap.ui.model.FilterOperator.EQ, sCode);
                aFilters.push(oTagFilter);
                
                var oAbsoluteBinding = {
                        path : "/EvaluationModelUsage",
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
