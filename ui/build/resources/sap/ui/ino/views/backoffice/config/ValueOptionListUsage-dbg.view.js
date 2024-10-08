/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.models.core.CodeModel");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.ValueOptionListUsage", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {
    
    oUsageTexts : {
        sHeaderLabel : "BO_COMMON_USAGE_EXP_HEADER",
        sNoteLabel : "BO_COMMON_USAGE_EXP_NOTE"
    },
    
    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.config.ValueOptionListUsage";
    },
    
    createFacetContent : function(oController) {
        
        var oController = this.getController();
        oController.initUsageModel();
        
        var oTable = this.createEvaluationTable();
        
        var oTable2 = this.createVoteTypeTable();
        
        return [oTable, oTable2];
    },
    
    createEvaluationTable : function() {
        var aColumns = this.createEvaluationColumns();
            
        var oUsageTable = new sap.ui.table.AnalyticalTable({
            sumOnTop : true,
            columns : aColumns,
            selectionMode: sap.ui.table.SelectionMode.Single,
            selectionBehavior : sap.ui.table.SelectionBehavior.RowSelector,
            allowColumnReordering: true,
            showColumnVisibilityMenu: true,
            enableColumnFreeze: true,
            enableCellFilter: true,
            width : "100%",
            visibleRowCount: 20,
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Interactive,
            numberOfExpandedLevels : 0,
            columnVisibilityMenuSorter: function(a, b) {
                var fnGetColumnName = function(oColumn) {
                    return oColumn.getName() || (oColumn.getLabel() && oColumn.getLabel().getText ? oColumn.getLabel().getText() : "");
                };
                return fnGetColumnName(a).localeCompare(fnGetColumnName(b));
            }
        });
        
        //propagate model manually, as S**kUI5 does not do that all the time
        var oModel = this.getModel();
        oUsageTable.setModel(oModel);

        var oBindingInformation = this.getTableBindingInformation();
        oUsageTable.bindRows(oBindingInformation);

        var oHeaderLabel = this.createControl({
            Type : "label", 
            Text : this.oUsageTexts.sHeaderLabel,
            Tooltip : this.oUsageTexts.sHeaderLabel
        });
        var oNoteLabel = this.createControl({
            Type : "label", 
            Text : this.oUsageTexts.sNoteLabel, 
            Tooltip : this.oUsageTexts.sNoteLabel
        });
        var oSpacer1 = new sap.ui.core.HTML({
            content : "<br/>",
            sanitizeContent : true
        });
        var oSpacer2 = new sap.ui.core.HTML({
            content : "<br/>",
            sanitizeContent : true
        });

        var oVerticalLayout = new sap.ui.layout.VerticalLayout({
            width : "100%",
            content : [oHeaderLabel, oSpacer1, oUsageTable, oSpacer2]
        });
        
        return new sap.ui.ux3.ThingGroup({
            title : this.getController().getTextPath("BO_COMMON_USAGE_TIT"),
            content : [oVerticalLayout, new sap.ui.core.HTML({
                content : "<br/>",
                sanitizeContent : true
            })],
            colspan : true
        });
    },
    
    createEvaluationColumns : function() {
        var aColumns = [];
                
        var oCriterionColumn = new sap.ui.table.AnalyticalColumn({
            label : new sap.ui.commons.Label({
                text : "{/#ValueOptionListUsageType/CRITERION_CODE/@sap:label}"
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
                text : "{/#ValueOptionListUsageType/MODEL_CODE/@sap:label}"
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
                text : "{/#ValueOptionListUsageType/CAMPAIGN_NAME/@sap:label}"
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
            showIfGrouped : true,
            groupHeaderFormatter : this.groupHeaderTextFormatter
        });
        aColumns.push(oCampaignColumn);
        
        var oCampaignIDColumn = new sap.ui.table.AnalyticalColumn({
            label : new sap.ui.commons.Label({
                text : "{/#ValueOptionListUsageType/CAMPAIGN_ID/@sap:label}"
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
                text : "{/#ValueOptionListUsageType/CAMPAIGN_STATUS_CODE/@sap:label}"
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
                text : "{/#ValueOptionListUsageType/IDEA_NAME/@sap:label}"
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
                text : "{/#ValueOptionListUsageType/IDEA_ID/@sap:label}"
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
                text : "{/#ValueOptionListUsageType/EVALUATION_COUNT/@sap:label}"
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
        var oTagFilter = new sap.ui.model.Filter("VALUE_OPTION_LIST_CODE", sap.ui.model.FilterOperator.EQ, sCode);
        aFilters.push(oTagFilter);
        
        var oAbsoluteBinding = {
            path : "/ValueOptionListUsage",
            filters : aFilters,
            sorter : [new sap.ui.model.Sorter("CRITERION_CODE")],
            parameters : { 
                provideTotalResultSize: true,
                useBatchRequests : true,
                provideGrandTotals: true
            }
        };
        return oAbsoluteBinding;
    },
    
    createVoteTypeTable : function() {
        var aColumns = this.createVoteTypeColumns();
            
        var oUsageTable = new sap.ui.table.AnalyticalTable({
            sumOnTop : true,
            columns : aColumns,
            selectionMode: sap.ui.table.SelectionMode.Single,
            selectionBehavior : sap.ui.table.SelectionBehavior.RowSelector,
            allowColumnReordering: true,
            showColumnVisibilityMenu: true,
            enableColumnFreeze: true,
            enableCellFilter: true,
            width : "100%",
            visibleRowCount: 20,
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Interactive,
            numberOfExpandedLevels : 0,
            columnVisibilityMenuSorter: function(a, b) {
                var fnGetColumnName = function(oColumn) {
                    return oColumn.getName() || (oColumn.getLabel() && oColumn.getLabel().getText ? oColumn.getLabel().getText() : "");
                };
                return fnGetColumnName(a).localeCompare(fnGetColumnName(b));
            }
        });
        
        //propagate model manually, as S**kUI5 does not do that all the time
        var oModel = this.getModel();
        oUsageTable.setModel(oModel);

        var oBindingInformation = this.getTableBindingInformation2();
        oUsageTable.bindRows(oBindingInformation);

        var oHeaderLabel = this.createControl({
            Type : "label", 
            Text : this.oUsageTexts.sHeaderLabel,
            Tooltip : this.oUsageTexts.sHeaderLabel
        });
        var oNoteLabel = this.createControl({
            Type : "label", 
            Text : this.oUsageTexts.sNoteLabel, 
            Tooltip : this.oUsageTexts.sNoteLabel
        });
        var oSpacer1 = new sap.ui.core.HTML({
            content : "<br/>",
            sanitizeContent : true
        });
        var oSpacer2 = new sap.ui.core.HTML({
            content : "<br/>",
            sanitizeContent : true
        });

        var oVerticalLayout = new sap.ui.layout.VerticalLayout({
            width : "100%",
            content : [oHeaderLabel, oSpacer1, oUsageTable, oSpacer2]
        });
        
        return new sap.ui.ux3.ThingGroup({
            title : this.getController().getTextPath("BO_COMMON_USAGE_TIT"),
            content : [oVerticalLayout, new sap.ui.core.HTML({
                content : "<br/>",
                sanitizeContent : true
            })],
            colspan : true
        });
    },
    
    createVoteTypeColumns : function() {
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
    
    getTableBindingInformation2 : function() {
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
    
    /*createFacetContent : function(oController) {
        this.oFacets = {};
        this.oTI = new sap.ui.ux3.ThingViewer(this.createId("TV"), {
            title : "Test Viewer",
            facets : [
                new sap.ui.ux3.NavigationItem({key : "sap.ui.ino.views.backoffice.config.ValueOptionListUsageFacet", text : "Evaluation"}),
		        new sap.ui.ux3.NavigationItem({key : "votetype", text : "Vote Type"}),
		        new sap.ui.ux3.NavigationItem({key : "statusmodel", text : "Status Model"})
		    ],
		    facetSelected: this.getController().facetSelected
        });
        this.oTI.oView = this;
        return [new sap.ui.ux3.ThingGroup({
            title : this.getController().getTextPath("BO_VALUE_OPTION_LIST_TIT_GENERAL_INFO"),
            content : [this.oTI],
            colspan : true
        })];
    },
    
    getInspector: function() {
        return this.oTI;
    }*/
}));