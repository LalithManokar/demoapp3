/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.views.common.MasterDetailView");
jQuery.sap.require("sap.ui.ino.controls.ThemeFactory");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");
jQuery.sap.require("sap.ui.ino.views.common.ExtensionPointHelper");
jQuery.sap.require("sap.ui.ino.views.extensibility.StableIdentifier");
var StableIdentifier = sap.ui.ino.views.extensibility.StableIdentifier;

(function() {
    "use strict";

    sap.ui.ino.views.common.MasterDetailView = {

        setHistoryState : function(oHistoryState) {
            var that = this;
            var oBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
            var oTable = this.getTable();
            if (oTable) {
                oTable.setNoData(oBundle.getText("BO_APPLICATION_MSG_LOADING"));
            }

            this.getController().setHistoryState(oHistoryState);

            // workaround: the segmented button needs a rerendering, otherwise it is not part of the tabchain of the
            // toolbar
            for (var ii = 0; ii < 10; ++ii) {
                setTimeout(function() {
                    that._oSegmentedButton.rerender();
                }, 500 * ii);
            }
        },

        createContent : function(oController) {
            // This is important to take the full height of the shell content
            this.setHeight('100%');
            // this avoids scrollbars for 100% height
            this.setDisplayBlock(true);

            var aActionButtons = this.createActionButtons(oController);
            // Disable all buttons initially
            jQuery(aActionButtons, function(iIndex, oButton) {
                oButton.setEnabled(false);
            });
            this._oDetailsView = this.createDetailsView();
            if (this._oDetailsView && typeof this._oDetailsView.setVisible === "function") {
            	this._oDetailsView.setVisible(false);
            }

            var oPreviewButton = new sap.ui.commons.Button({
                lite : false,
                tooltip : "{i18n>GENERAL_MASTER_DETAIL_BUT_SHOW_TABLE_PREVIEW}",
                icon : sap.ui.ino.controls.ThemeFactory.getImage("list_preview.png"),
                iconSelected : sap.ui.ino.controls.ThemeFactory.getImage("list_preview_hover.png"),
                iconHovered : sap.ui.ino.controls.ThemeFactory.getImage("list_preview_active.png"),
                press : [oController.onShowPreview, oController]
            });

            var oRowOnlyButton = new sap.ui.commons.Button({
                lite : false,
                tooltip : "{i18n>GENERAL_MASTER_DETAIL_BUT_SHOW_TABLE_ALL_ROWS}",
                icon : sap.ui.ino.controls.ThemeFactory.getImage("list.png"),
                iconSelected : sap.ui.ino.controls.ThemeFactory.getImage("list_hover.png"),
                iconHovered : sap.ui.ino.controls.ThemeFactory.getImage("list_active.png"),
                press : [oController.onHidePreview, oController]
            });

            var aButtons = [oPreviewButton, oRowOnlyButton];
            if (this.getAdditionalViewButton && this.getAdditionalViewButton(oController) != undefined) {
                aButtons.unshift(this.getAdditionalViewButton(oController));
            }

            this._oSegmentedButton = new sap.ui.commons.SegmentedButton({
                buttons : aButtons,
                selectedButton : oPreviewButton
            }).addStyleClass("sapUiInoSegmentedButtonStyle");

            this._oExportButton = sap.ui.ino.application.backoffice.ControlFactory.createExportButton([oController.onExport, oController], this.createId(StableIdentifier.BackOffice.List.Action.Export));

            this._oExtensionArea = this.createTableExtensionArea();

            this.oSearchField = new sap.ui.commons.SearchField({
                enableListSuggest : false,
                enableFilterMode : true,
                enableClear : true,
                maxLength : 1000,
                search : [oController.onSearch, oController]
            });

            this.oTableToolbar = new sap.ui.commons.Toolbar({
                items : aActionButtons,
                rightItems : [this._oExportButton, this.oSearchField, this._oSegmentedButton]
            });

            this._oTable = this.createTable();

            var aColumn = this.createColumns(this._oTable);

            // EXTENSION POINT
            if (this.createExtensionColumnFragment) {
                var aExtColumn = sap.ui.ino.views.common.ExtensionPointHelper.getListExtensionColumns(this.createExtensionColumnFragment());
                jQuery.each(aExtColumn, function(iIndex, oColumn) {
                    var columnIndex = sap.ui.ino.views.common.ExtensionPointHelper.findCustomData(oColumn.getCustomData(), "columnIndex");
                    if (columnIndex != undefined && columnIndex >= 0 && columnIndex < aColumn.length) {
                        aColumn.splice(columnIndex, 0, oColumn);
                    } else {
                        aColumn.push(oColumn);
                    }
                });
            }

            // Disable visibility of columns by default. Are set visible according to current view settings
            jQuery.each(aColumn, function(iIndex, oColumn) {
                oColumn.setVisible(false);
            });

            var oTable = this._oTable;
            jQuery.each(aColumn, function(iIndex, oColumn) {
                oTable.addColumn(oColumn);
            });

            this._oMasterDetailLayout = new sap.ui.layout.VerticalLayout({
                content : [this._oTable],
                width : "100%"
            });
            
            this._oMasterDetailLayout.addContent(this._oDetailsView);

            return this._oMasterDetailLayout;
        },
        
        createTable:function(){
            var oController = this.getController();
            return new sap.ui.table.Table({
                enableColumnReordering : false,
                visibleRowCountMode : sap.ui.table.VisibleRowCountMode.Interactive,
                visibleRowCount : 7,
                minAutoRowCount : 1,
                columnHeaderHeight : 30,
                selectionMode : sap.ui.table.SelectionMode.Single,
                selectionBehavior : sap.ui.table.SelectionBehavior.RowSelector,
                rowSelectionChange : function(oEvent) {
                    oController.onSelectionChanged(oEvent.getParameter("rowContext"), oEvent.getSource().getSelectedIndex(), oEvent.getSource());
                },
                toolbar : this.oTableToolbar,
                extension : this._oExtensionArea
            });
        },
        
        setMultiToggleSelectionMode : function(){
        	this._oTable.setSelectionMode(sap.ui.table.SelectionMode.MultiToggle);
        },

        getAdditionalViewButton : function(oController) {

        },

        getTable : function() {
            return this._oTable;
        },

        getSelectedRowContext : function() {
            var selectedIndex = this._oTable.getSelectedIndex();
            if (selectedIndex > -1 && this._oTable.getContextByIndex(selectedIndex) != null) {
                return this._oTable.getContextByIndex(selectedIndex);
            };
            return null;
        },
        
        getSelectedRowsContext : function(){
        	var that = this;
        	var aSelectedIndices = this._oTable.getSelectedIndices();
        	var aContextBySelectedRows = [];
        	
        	if (aSelectedIndices && aSelectedIndices.length !== 0){
        		jQuery.each(aSelectedIndices, function(iIdx, iSelectedIndex){
        			var oContextByIndex = that._oTable.getContextByIndex(iSelectedIndex);
        			if(oContextByIndex){
        				aContextBySelectedRows.push(oContextByIndex);
        			}
        			
        		});
        	}
        	
        	return aContextBySelectedRows;
        },

        setSelectedRow : function(iIndex) {
            this._oTable.setSelectedIndex(iIndex);
        },

        getSelectedRow : function() {
            return this._oTable.getSelectedIndex();
        },

        createTableExtensionArea : function() {
            return undefined;
        }
    };
})();