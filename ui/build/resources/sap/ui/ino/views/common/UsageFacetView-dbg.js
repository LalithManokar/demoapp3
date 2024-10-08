/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.views.common.UsageFacetView");
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");

(function() {

    sap.ui.ino.views.common.UsageFacetView = jQuery.extend({}, sap.ui.ino.views.common.FacetAOView,
    {
        oUsageTexts : {
            sHeaderLabel : "BO_COMMON_USAGE_EXP_HEADER",
            sNoteLabel : "BO_COMMON_USAGE_EXP_NOTE"
        },
        
        createFacetContent : function() {
            var oController = this.getController();
            oController.initUsageModel();
            var oUsageGroup = this.createUsageThingGroup();
            return [oUsageGroup];
        },   
        
        createColumns : function(){
            //needs to be redefined!
            //shall return an array of AnalyticalColumn Objects
        },
        
        needsSavedData : function() {
            return this.oController.getModel().isNew();
        },
        
        getTableBindingInformation : function(){
            //needs to be redefined!
            //shall return an object containing the binding info to put into "bindRows" method
        },
        
        groupHeaderTextFormatter : function(sTextValue, sKeyValue){
            //return null, the key Formatter must return the text, that provides the wanted result
            return null;
        },
        
        groupHeaderKeyFormatter : function(sKeyValue, sTextValue){
            return sTextValue;
        },

        createUsageThingGroup : function() {
            var aColumns = this.createColumns();
            
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
                content : [oHeaderLabel, oSpacer1, oUsageTable, oSpacer2, oNoteLabel]
            });

            return new sap.ui.ux3.ThingGroup({
                title : this.getController().getTextPath("BO_COMMON_USAGE_TIT"),
                content : [oVerticalLayout, new sap.ui.core.HTML({
                    content : "<br/>",
                    sanitizeContent : true
                })],
                colspan : true
            });

        }
    });

})();
    