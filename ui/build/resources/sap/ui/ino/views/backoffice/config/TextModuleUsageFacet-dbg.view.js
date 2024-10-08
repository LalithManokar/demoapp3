/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.UsageFacetView");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.TextModuleUsageFacet", jQuery.extend({},
        sap.ui.ino.views.common.UsageFacetView, {

            getControllerName : function() {
                return "sap.ui.ino.views.backoffice.config.TextModuleUsageFacet";
            },

            createColumns : function(){
                //needs to be redefined!
                //shall return an array of AnalyticalColumn Objects
                var aColumns = [];
                var i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
                
                var oTypeColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#TextModuleUsageType/OBJECT_TYPE/@sap:label}"
                    }),
                    template : new sap.ui.commons.Label({
                        text : {
                            path : "OBJECT_TYPE",
                            type : new sap.ui.model.type.String(),
                            formatter : function(sType) {
                                if(sType === null || sType === undefined) {
                                    return null;
                                }
                                return i18n.getText("BO_TEXT_MODULE_FLD_" + sType);
                            }
                        }
                    }),
                    leadingProperty : "OBJECT_TYPE",
                    grouped : false,
                    summed : false,                   
                    sortProperty : "OBJECT_TYPE",
                    showIfGrouped : true,
                    groupHeaderFormatter : this.groupHeaderTextFormatter
                });
                aColumns.push(oTypeColumn);

                var oObjectNameColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#TextModuleUsageType/OBJECT_NAME/@sap:label}"
                    }),
                    template : new sap.ui.commons.Link({
                        text : {
                            path : "OBJECT_NAME",
                            type : new sap.ui.model.type.String(),
                            formatter : function(sName) {
                                if(sName === null || sName === undefined) {
                                    return null;
                                }
                                var sText = i18n.getText(sName + "_TEXT");
                                if(sText === sName + "_TEXT"){
                                    return sName;
                                }
                                return sText;
                            }
                        },
                        press : function(oControlEvent) {
                            var oRowBindingContext = oControlEvent.getSource().getBindingContext();
                            var iObjectID = oRowBindingContext.getProperty("OBJECT_ID");
                            if(!iObjectID){
                                return;
                            }
                            var sObjectType = oRowBindingContext.getProperty("OBJECT_TYPE").toLowerCase();
                            sap.ui.ino.application.ApplicationBase.getApplication().navigateToInNewWindow(
                                sObjectType, {
                                    id : iObjectID,
                                    edit : false
                            });
                        }
                    }),
                    leadingProperty : "OBJECT_NAME",
                    grouped : false,
                    summed : false,                   
                    sortProperty : "OBJECT_NAME",
                    showIfGrouped : true,
                    groupHeaderFormatter : this.groupHeaderTextFormatter
                });
                aColumns.push(oObjectNameColumn);
                
                var oObjectIDColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#TextModuleUsageType/OBJECT_ID/@sap:label}"
                    }),
                    template : new sap.ui.commons.Link({
                        text : {
                            path : "OBJECT_ID",
                            type : new sap.ui.model.type.String()
                        }
                    }),
                    leadingProperty : "OBJECT_ID",
                    grouped : false,
                    summed : false,
                    inResult : true,
                    visible : false,
                    sortProperty : "OBJECT_ID",
                    showIfGrouped : true,
                    groupHeaderFormatter : this.groupHeaderKeyFormatter
                });
                aColumns.push(oObjectIDColumn);

                var oCountColumn = new sap.ui.table.AnalyticalColumn({
                    label : new sap.ui.commons.Label({
                        text : "{/#TextModuleUsageType/USAGE_COUNT/@sap:label}"
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
                var sCode = this.getController().getModel().getProperty("/CODE");                
                // Bind against /ValueOptionListUsage and add a filter CODE = sCode;                
                var aFilters = [];
                var oTagFilter = new sap.ui.model.Filter("TEXT_MODULE_CODE", sap.ui.model.FilterOperator.EQ, sCode);
                aFilters.push(oTagFilter);
                
                var oAbsoluteBinding = {
                        path : "/TextModuleUsage",
                        filters : aFilters,
                        sorter : [new sap.ui.model.Sorter("OBJECT_TYPE")],
                        parameters : { 
                            provideTotalResultSize: true,
                            useBatchRequests : true,
                            provideGrandTotals: true
                        }
                };
                return oAbsoluteBinding;
            }

        }));
