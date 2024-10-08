/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.UsageFacetView");
jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.ValueOptionListUsageCustomFormFacet", jQuery.extend({},
        sap.ui.ino.views.common.UsageFacetView, {

            getControllerName : function() {
                return "sap.ui.ino.views.backoffice.config.ValueOptionListUsageCustomFormFacet";
            },

            createColumns : function(){
                //needs to be redefined!
                //shall return an array of AnalyticalColumn Objects
                
                var aColumns = [];
                
                var oIdColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#ValueOptionListIdeaFormUsageType/IDEA_FORM_ID/@sap:label}",
                        visible:false
                    }),
                    template : new sap.ui.commons.TextView({
                        text : {
                            path : "IDEA_FORM_ID"
                        },
                        visible:false
                    }),
                    leadingProperty : "IDEA_FORM_ID",
                    grouped : false,
                    summed : false,
                    showIfGrouped : true,
                    sortProperty : "IDEA_FORM_ID",
                    width: "0px"
                });
                aColumns.push(oIdColumn);
                
                var oTechNameColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#ValueOptionListIdeaFormUsageType/CODE_NAME/@sap:label}"
                    }),
                    template : new sap.ui.commons.TextView({
                        text : {
                            path : "CODE_NAME",
                            formatter : sap.ui.ino.views.backoffice.config.Util.formatPlainCode
                        }
                    }),
                    leadingProperty : "CODE_NAME",
                    groupHeaderFormatter : sap.ui.ino.views.backoffice.config.Util.formatPlainCode,
                    grouped : true,
                    summed : false,
                    showIfGrouped : true,
                    sortProperty : "CODE_NAME"
                });
                aColumns.push(oTechNameColumn);
                
                var oNameColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#ValueOptionListIdeaFormUsageType/NAME/@sap:label}"
                    }),
                    template : new sap.ui.commons.Link({
                        text : {
                            path : "NAME",
                            type : new sap.ui.model.type.String()
                        },
                        press : function(oControlEvent) {
                            var oRowBindingContext = oControlEvent.getSource().getBindingContext();
                            var iObjectID = oRowBindingContext.getProperty("IDEA_FORM_ID");
                            sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewModelWindow(
                                    "configideaformlist", null,iObjectID);
                        }
                        
                    }),
                    leadingProperty : "NAME",
                    grouped : false,
                    summed : false,
                    sortProperty : "NAME",
                    showIfGrouped : true
                    
                });
                aColumns.push(oNameColumn);
                
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
                var oTagFilter = new sap.ui.model.Filter("CODE", sap.ui.model.FilterOperator.EQ, sCode);
                aFilters.push(oTagFilter);
                
                var oAbsoluteBinding = {
                        path : "/ValueOptionListIdeaFormUsage",
                        filters : aFilters,
                        sorter : [new sap.ui.model.Sorter("CODE_NAME")],
                        parameters : { 
                            provideTotalResultSize: true,
                            useBatchRequests : true,
                            provideGrandTotals: true
                        }
                };
                return oAbsoluteBinding;
            }

        }));
