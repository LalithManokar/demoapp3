/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.commons.TextView");
jQuery.sap.require("sap.ui.commons.layout.MatrixLayoutRow");
jQuery.sap.require("sap.ui.commons.layout.MatrixLayoutCell");
jQuery.sap.require("sap.ui.commons.layout.MatrixLayout");
jQuery.sap.require("sap.ui.commons.Label");
jQuery.sap.require("sap.ui.commons.LabelDesign");
jQuery.sap.require("sap.ui.table.TreeTable");
jQuery.sap.require("sap.m.OverflowToolbar");
jQuery.sap.require("sap.m.Title");
jQuery.sap.require("sap.ui.table.Column");
jQuery.sap.require("sap.m.SegmentedButton");
jQuery.sap.require("sap.m.SegmentedButtonItem");
jQuery.sap.require("sap.ui.model.type.Date");
jQuery.sap.require("sap.ui.model.type.String");

sap.ui.jsview("sap.ui.ino.views.backoffice.integration.IntegrationMappingListDetail", {
    
    getControllerName: function() {
        return "sap.ui.ino.views.backoffice.integration.IntegrationMappingListDetail";
    },
    
    createContent: function() {
        var oLayout = new sap.ui.commons.layout.MatrixLayout({
            columns: 7,
            widths: ['10%', '15%', '10%', '15%', '10%', '15%', 'auto']
        });
        
        this._createGeneralContent(oLayout);
        
        // This is important to take the full height of the shell content
		this.setHeight('100%');
		// this avoids scrollbars for 100% height
		this.setDisplayBlock(true);

		var oPanel = new sap.ui.commons.Panel({
			content: oLayout,
			showCollapseIcon: false,
			areaDesign: sap.ui.commons.enums.AreaDesign.Plain,
			borderDesign: sap.ui.commons.enums.BorderDesign.None,
			text: "{i18n>BO_INTEGRATION_MAPPING_DETAIL_HEADER}"
		});

		return oPanel;
    },
    
    _createGeneralContent: function(oLayout) {
        oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
            cells:[].concat(this._createElement(
                    "i18n>BO_INTEGRATION_MAPPING_DETAIL_LABEL_NAME",
                    "APINAME"
                )).concat(this._createElement(
                    "i18n>BO_INTEGRATION_MAPPING_DETAIL_LABEL_CREATE_ON",
                    "CREATED_AT",
                    new sap.ui.model.type.Date()
                )).concat(this._createElement(
                    "i18n>BO_INTEGRATION_MAPPING_DETAIL_LABEL_CREATE_BY",
                    "CREATE_BY"
                ))
        }));
        
        oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
            cells: [].concat(this._createElement(
                    "i18n>BO_INTEGRATION_MAPPING_DETAIL_LABEL_TECH_NAME",
                    "TECHNICAL_NAME"
                )).concat(this._createElement(
                    "i18n>BO_INTEGRATION_MAPPING_DETAIL_LABEL_STATUS",
                    "STATUS"
                )).concat(this._createElement(
                    "i18n>BO_INTEGRATION_MAPPING_DETAIL_LABEL_TARGET_SYSTEM",
                    "SYSTEM_NAME_EXTEND",
                    null,
                    2
                ))
        }));
        
        var that = this;
        oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
            cells: [ new sap.ui.commons.layout.MatrixLayoutCell({
                content: [
                    new sap.m.SegmentedButton({
            			items: [new sap.m.SegmentedButtonItem({
            			    key: "create",
            			    text: "{i18n>BO_INTEGRATION_MAPPING_DETAIL_BUT_CREATE_OBJ}"
            			}), new sap.m.SegmentedButtonItem({
            			    key: "update",
            			    text: "{i18n>BO_INTEGRATION_MAPPING_DETAIL_BUT_UPDATE_OBJ}"
            			})],
            			selectionChange: function(oEvent) {
            			    var sSelKey = oEvent.getParameter("item").getKey();
            		        that.oCreateObjectLayout.setVisible(sSelKey === "create");
            		        that.oFetchObjectLayout.setVisible(sSelKey === "update");
            			}
            		})  
                ],
                colSpan: 2
            })]
        }));
        
        this._createCreateObjContent(oLayout);
        this._createUpdateObjContent(oLayout);
    },
    
    _createCreateObjContent: function(oLayout) {
        var oSubLayout = new sap.ui.commons.layout.MatrixLayout({
            columns: 7,
            widths: ['10%', '15%', '10%', '15%', '10%', '15%', 'auto']
        });
        
        oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
            cells: [].concat(this._createElement(
                    "i18n>BO_INTEGRATION_MAPPING_DETAIL_LABEL_HOST",
                    "SYSTEM_HOST",
                    null,
                    5
                ))
                // .concat(this._createElement(
                //     "i18n>BO_INTEGRATION_MAPPING_DETAIL_LABEL_PORT",
                //     "SYSTEM_PORT"
                // ))
        }));
        
        oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
            cells: [].concat(this._createElement(
                "i18n>BO_INTEGRATION_MAPPING_DETAIL_LABEL_PATH_PREFIX",
                "CREATE_PATH"
            )) 
        }));
        
        oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
            cells: [].concat(this._createElement(
                "i18n>BO_INTEGRATION_MAPPING_DETAIL_LABEL_API_METHOD",
                "CREATE_METHOD"
            ))
        }));
        
        var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            content: [oSubLayout],
            colSpan: 7
        });
        var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
            cells: [oCell]
        });
        oLayout.addRow(oRow);
        
        this.oCreateObjectLayout = oSubLayout;
    },
    
    _createUpdateObjContent: function(oLayout) {
        var oSubLayout = new sap.ui.commons.layout.MatrixLayout({
            columns: 7,
            widths: ['10%', '15%', '10%', '15%', '10%', '15%', 'auto'],
            visible: false
        });
        
        oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
            cells: [].concat(this._createElement(
                    "i18n>BO_INTEGRATION_MAPPING_DETAIL_LABEL_HOST",
                    "SYSTEM_HOST",
                    null,
                    5
                ))
                // .concat(this._createElement(
                //     "i18n>BO_INTEGRATION_MAPPING_DETAIL_LABEL_PORT",
                //     "SYSTEM_PORT"
                // ))
            
        }));
        
        oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
            cells: [].concat(this._createElement(
                    "i18n>BO_INTEGRATION_MAPPING_DETAIL_LABEL_PATH_PREFIX",
                    "FETCH_PATH"
                ))
        }));
        
        oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
            cells: [].concat(this._createElement(
                    "i18n>BO_INTEGRATION_MAPPING_DETAIL_LABEL_API_METHOD",
                    "FETCH_METHOD"
                ))
        }));
        
        var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            content: [oSubLayout],
            colSpan: 7
        });
        var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
            cells: [oCell]
        });
        oLayout.addRow(oRow);
        
        this.oFetchObjectLayout = oSubLayout;
    },
    
    _createElement: function(sLabelPath, sContentPath, oDataType, iColSpan) {
        oDataType = oDataType || new sap.ui.model.type.String();
        iColSpan = iColSpan || 1;
        var oLabel = new sap.ui.commons.Label({
			text: {
			    path: sLabelPath
			},
			design: sap.ui.commons.LabelDesign.Bold
		});
		
		var oContent = new sap.ui.commons.TextView({
			text: {
			    path: sContentPath,
			    type: oDataType
			}
		});
		
		return [new sap.ui.commons.layout.MatrixLayoutCell({
		    content: [oLabel]
		}), new sap.ui.commons.layout.MatrixLayoutCell({
		    content: [oContent],
		    colSpan: iColSpan
		})];
    }
});