/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOView");
jQuery.sap.require("sap.ui.core.ListItem");
jQuery.sap.require("sap.ui.commons.DropdownBox");
jQuery.sap.require("sap.ui.commons.RowRepeater");
jQuery.sap.require("sap.ui.commons.Button");
jQuery.sap.require("sap.ui.table.TreeTable");
jQuery.sap.require("sap.ui.model.Filter");
jQuery.sap.require("sap.ui.commons.MessageBox");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

sap.ui.jsview("sap.ui.ino.views.backoffice.integration.IntegrationMappingDefinitionFacet", jQuery.extend({}, sap.ui.ino.views.common.FacetAOView, {
	getControllerName: function() {
		return "sap.ui.ino.views.backoffice.integration.IntegrationMappingDefinitionFacet";
	},
	

	createFacetContent: function(oController) {
		var bEdit = oController.isInEditMode();

		var oGroupGeneral = this.createLayout(bEdit);
		return [oGroupGeneral];
	},

	createLayout: function(bEdit) {
		var oLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 5,
			widths: ['15%', '25%', '15%', '25%', 'auto']
		});

		this.createGeneralContent(oLayout, bEdit);
		this.createMappingContent(oLayout, bEdit);

		return new sap.ui.ux3.ThingGroup({
			title: this.getController().getTextPath("BO_MODEL_GENERAL_INFO_TIT"),
			content: [oLayout, new sap.ui.core.HTML({
				content: "<br/>",
				sanitizeContent: true
			})],
			colspan: true
		});
	},

	createGeneralContent: function(oLayout, bEdit) {
		var oNameLabel = this.createControl({
			Type: "label",
			Text: "BO_INTEGRATION_MAPPING_DETAIL_LABEL_NAME",
			Tooltip: "BO_INTEGRATION_MAPPING_DETAIL_LABEL_NAME"
		});
		var oNameField = this.createControl({
			Type: "textfield",
			Text: "/APINAME",
			Editable: bEdit,
			LabelControl: oNameLabel
		});
		var oStatusLabel = this.createControl({
			Type: "label",
			Text: "BO_INTEGRATION_MAPPING_DETAIL_LABEL_STATUS",
			Tooltip: "BO_INTEGRATION_MAPPING_DETAIL_LABEL_STATUS"
		});
		var oStatus = new sap.ui.commons.DropdownBox({
			selectedKey: this.getBoundPath("STATUS", true),
			editable: bEdit,
			required: true,
			width: "100%"
		});
		oStatusLabel.setLabelFor(oStatus);
		oStatus.addItem(new sap.ui.core.ListItem({
			key: "active",
			text: "{i18n>BO_INTEGRATION_MAPPING_DETAIL_ACTIVE_ITEM}"
		}));
		oStatus.addItem(new sap.ui.core.ListItem({
			key: "inactive",
			text: "{i18n>BO_INTEGRATION_MAPPING_DETAIL_INACTIVE_ITEM}"
		}));
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: oNameLabel
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oNameField
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oStatusLabel
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oStatus
			})]
		});
		oLayout.addRow(oRow);

		var oTechNameLabel = this.createControl({
			Type: "label",
			Text: "BO_INTEGRATION_MAPPING_DETAIL_LABEL_TECH_NAME",
			Tooltip: "BO_INTEGRATION_MAPPING_DETAIL_LABEL_TECH_NAME"
		});
		var oTechNameField = this.createControl({
			Type: "textfield",
			Text: "/TECHNICAL_NAME",
			Editable: bEdit,
			LabelControl: oTechNameLabel
		});
		var oTargetSysLabel = this.createControl({
			Type: "label",
			Text: "BO_INTEGRATION_MAPPING_DETAIL_LABEL_TARGET_SYSTEM",
			Tooltip: "BO_INTEGRATION_MAPPING_DETAIL_LABEL_TARGET_SYSTEM"
		});
		var oTargetSys = new sap.ui.commons.DropdownBox({
			selectedKey: this.getBoundPath("SYSTEM_NAME", true),
			editable: bEdit,
			width: "100%",
			required: true,
			change: function(oEvent) {
			    var oSelectedItem = oEvent.getParameter('selectedItem');
			    var oTI = this.getThingInspectorView().getInspector();
			    var oAppModel = oTI.getModel('applicationObject');
			    if (oSelectedItem) {
			        var oSelContext = oTI.getModel('targetList').getProperty(
                        oSelectedItem.getBindingContext('targetList').sPath);
                    oAppModel.setProperty('/SYSTEM_PACKAGE_NAME', oSelContext.standardPackage);
                    oAppModel.setProperty('/targetHost', oSelContext.destHost ? oSelContext.destHost + ':' + oSelContext.destPort + oSelContext.destPathPrefix : '');
			    }
			}.bind(this)
		});
		oTargetSysLabel.setLabelFor(oTargetSys);
		var oTargetItemTemp = new sap.ui.core.ListItem({
			key: "{targetList>standardName}",
			text: "{targetList>destName}"
		});
		oTargetSys.bindItems({
			path: "targetList>/",
			template: oTargetItemTemp
		});
		oRow = new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: oTechNameLabel
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oTechNameField
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oTargetSysLabel
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: oTargetSys
			})]
		});
		oLayout.addRow(oRow);
	},

	createMappingContent: function(oLayout, bEdit) {
	    oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
	        height: "1.5rem"
	    }));
		var that = this;
        var oMenuCreateButton = new sap.ui.commons.Button({
            lite : false,
            tooltip : "{i18n>BO_INTEGRATION_MAPPING_DETAIL_BUT_CREATE_OBJ}",
            text : "{i18n>BO_INTEGRATION_MAPPING_DETAIL_BUT_CREATE_OBJ}"
        });
        var oMenuUpdateButton = new sap.ui.commons.Button({
            lite : false,
            tooltip : "{i18n>BO_INTEGRATION_MAPPING_DETAIL_BUT_UPDATE_OBJ}",
            text : "{i18n>BO_INTEGRATION_MAPPING_DETAIL_BUT_UPDATE_OBJ}"
        });
        var oMenuButton = new sap.ui.commons.SegmentedButton({
            buttons: [oMenuCreateButton, oMenuUpdateButton],
            selectedButton: oMenuCreateButton,
            select: function(oEvent) {
                var sButId = oEvent.getParameter("selectedButtonId");
                that.oCreateMappingLayout.setVisible(sButId === oMenuCreateButton.getId());
				that.oFetchMappingLayout.setVisible(sButId === oMenuUpdateButton.getId());
            }
        });
		var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [oMenuButton],
			colSpan: 5
		});
		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [oCell]
		}));

        if (bEdit) {
            var oNoteText = new sap.ui.commons.Label({
    			text: "{i18n>MSG_INTEGRATION_MAPPING_DETAIL_NOTE_TEXT}"
    		});
    		oCell = new sap.ui.commons.layout.MatrixLayoutCell({
    			content: [oNoteText],
    			colSpan: 5
    		});
    		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
    			cells: [oCell]
    		}));
        }
		
		this.oCreateMappingLayout = this._createMappingDetail(oLayout, bEdit, "CREATE", true);
		this.oFetchMappingLayout = this._createMappingDetail(oLayout, bEdit, "FETCH", false);
	},

	_createMappingDetail: function(oLayout, bEdit, sObjectKey, bVisible) {
		var oSubLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 5,
			widths: ['15%', '25%', '15%', '25%', 'auto'],
			visible: bVisible
		});

		// url row
		var oHostLabel = this.createControl({
			Type: "label",
			Text: "BO_INTEGRATION_MAPPING_DETAIL_LABEL_HOST",
			Tooltip: "BO_INTEGRATION_MAPPING_DETAIL_LABEL_HOST"
		});
		var oHostField = new sap.ui.commons.TextView({
			ariaLabelledBy: oHostLabel,
			text: {
			    parts: ['applicationObject>/targetHost', 'applicationObject>/' + sObjectKey + '_PATH'],
			    formatter: function(sHost, sPath) {
			        return sHost ? sHost + sPath : "";
			    }
			}
		});

		oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oHostLabel]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oHostField],
				colSpan: 3
			})
			]
		}));

		// path row
		var oPathLabel = this.createControl({
			Type: "label",
			Text: "BO_INTEGRATION_MAPPING_DETAIL_LABEL_PATH_PREFIX",
			Tooltip: "BO_INTEGRATION_MAPPING_DETAIL_LABEL_PATH_PREFIX"
		});
		var oPathField = this.createControl({
			Type: "textfield",
			Text: '/' + sObjectKey + '_PATH', //sObjectKey === "createObj" ? "/CREATE_PATH" : "/FETCH_PATH",
			Editable: bEdit,
			LabelControl: oPathLabel
		});
		oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oPathLabel]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oPathField],
				colSpan: 3
			})]
		}));
		// api method row
		var oMethodLabel = this.createControl({
			Type: "label",
			Text: "BO_INTEGRATION_MAPPING_DETAIL_LABEL_API_METHOD",
			Tooltip: "BO_INTEGRATION_MAPPING_DETAIL_LABEL_API_METHOD"
		});
		var oMethod = new sap.ui.commons.DropdownBox({
			selectedKey: this.getBoundPath(sObjectKey + "_METHOD", true), //sObjectKey === "createObj" ? this.getBoundPath("CREATE_METHOD", true) : this.getBoundPath("FETCH_METHOD", true),
			editable: bEdit,
			width: "100%",
			required : this.getBoundPath("/meta/nodes/Root/attributes/" + sObjectKey + "_METHOD" + "/required")
		});
		oMethodLabel.setLabelFor(oMethod);
		oMethod.addItem(new sap.ui.core.ListItem({
			key: "",
			text: ""
		}));
		if (sObjectKey === "FETCH") {
		    oMethod.addItem(new sap.ui.core.ListItem({
    			key: "GET",
    			text: "{i18n>BO_INTEGRATION_MAPPING_DETAIL_GET_ITEM}"
    		}));
		}
		oMethod.addItem(new sap.ui.core.ListItem({
			key: "POST",
			text: "{i18n>BO_INTEGRATION_MAPPING_DETAIL_POST_ITEM}"
		}));
		oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oMethodLabel]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oMethod]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				colSpan: 2
			})]
		}));
	    
	    // token url row
	    var oTokenUrlLabel = this.createControl({
			Type: "label",
			Text: "BO_INTEGRATION_MAPPING_DETAIL_LABEL_TOKEN_FETCH_URL",
			Tooltip: "BO_INTEGRATION_MAPPING_DETAIL_LABEL_TOKEN_FETCH_URL"
		});
	    var oTokenUrlField = this.createControl({
			Type: "textfield",
			Text: '/' + sObjectKey + '_TOKEN_URL', //sObjectKey === "createObj" ? "/CREATE_TOKEN_URL" : "/FETCH_TOKEN_URL",
			Editable: bEdit,
			LabelControl: oTokenUrlLabel
		});
		oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oTokenUrlLabel]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oTokenUrlField],
				colSpan: 3
			})]
		}));
		// token key in request header
		var oTokenKeyLabel = this.createControl({
			Type: "label",
			Text: "BO_INTEGRATION_MAPPING_DETAIL_LABEL_TOKEN_FETCH_KEY",
			Tooltip: "BO_INTEGRATION_MAPPING_DETAIL_LABEL_TOKEN_FETCH_KEY"
		});
		var oTokenUKeyField = this.createControl({
			Type: "textfield",
			Text: '/' + sObjectKey + '_TOKEN_KEY', //sObjectKey === "createObj" ? "/CREATE_TOKEN_FETCH_KEY" : "/FETCH_TOKEN_FETCH_KEY",
			Editable: bEdit,
			LabelControl: oTokenKeyLabel
		});
		// token key value in request header
		var oTokenKeyValueLabel = this.createControl({
			Type: "label",
			Text: "BO_INTEGRATION_MAPPING_DETAIL_LABEL_TOKEN_FETCH_VALUE",
			Tooltip: "BO_INTEGRATION_MAPPING_DETAIL_LABEL_TOKEN_FETCH_VALUE"
		});
		var oTokenUKeyValueField = this.createControl({
			Type: "textfield",
			Text: '/' + sObjectKey + '_TOKEN_VALUE', //sObjectKey === "createObj" ? "/CREATE_TOKEN_FETCH_VALUE" : "/FETCH_TOKEN_FETCH_VALUE", 
			Editable: bEdit,
			LabelControl: oTokenKeyValueLabel
		});
		oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oTokenKeyLabel]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oTokenUKeyField]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oTokenKeyValueLabel]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oTokenUKeyValueField]
			})]
		}));
		
		// add indentifier location id 
		var oLocationIdLabel = this.createControl({
			Type: "label",
			Text: "BO_INTEGRATION_MAPPING_DETAIL_LABEL_LOCATION_ID",
			Tooltip: "BO_INTEGRATION_MAPPING_DETAIL_LABEL_LOCATION_ID"
		});
		var oLocationIdField = this.createControl({
			Type: "textfield",
			Text: '/' + sObjectKey + '_LOCATION_ID', //sObjectKey === "createObj" ? "/CREATE_TOKEN_FETCH_VALUE" : "/FETCH_TOKEN_FETCH_VALUE", 
			Editable: bEdit,
			LabelControl: oLocationIdLabel
		});
		oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [ new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oLocationIdLabel]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oLocationIdField]
			})]
		}));
		
		
		oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
	        height: "1.5rem"
	    }));
	    
		// request mapping
		var oReqMappingTree = this._createMappingTree('{i18n>BO_INTEGRATION_MAPPING_REQ_TABLE_TITLE}', bEdit);
		oReqMappingTree.bindRows({
			path: 'applicationObject>/' + sObjectKey + '_REQ_JSON',
			parameters: {
				arrayNames: ["children"],
				numberOfExpandedLevels: 1
			}
		});
		if (sObjectKey === "CREATE") {
		    oReqMappingTree.getTitle().addStyleClass("inmTitleReq inmTitleReqEnd");
		}
		oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oReqMappingTree],
				colSpan: 4
			})]
		}));
		// request mapping form
		var oReqMappingForm = this._createReqMappingForm(oSubLayout, sObjectKey, bEdit);
		oReqMappingTree.addCustomData(new sap.ui.core.CustomData({
		    key: 'mappingFormId',
		    value: oReqMappingForm.getId()
		}));
		
		oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
	        height: "1.5rem"
	    }));
		// response mapping
		var oRespMappingTree = this._createMappingTree('{i18n>BO_INTEGRATION_MAPPING_RESP_TABLE_TITLE}', bEdit);
		oRespMappingTree.bindRows({
			path: 'applicationObject>/' + sObjectKey + '_RES_JSON',
			parameters: {
				arrayNames: ["children"],
				numberOfExpandedLevels: 1
			}
		});
		//this[this._getMappingTreeName(sObjectKey, false)] = oRespMappingTree;
		oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oRespMappingTree],
				colSpan: 4
			})]
		}));
		// response mapping form
		var oRespMappingForm = this._createRespMappingForm(oSubLayout, sObjectKey, bEdit);
		oRespMappingTree.addCustomData(new sap.ui.core.CustomData({
		    key: 'mappingFormId',
		    value: oRespMappingForm.getId()
		}));

		// add to main layout
		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oSubLayout],
				colSpan: 5
			})]
		}));
		
		return oSubLayout;
	},
	_createMappingTree: function(sTitlePath, bEdit) {
		var oController = this.getController();
		var oTitle = new sap.m.Title({
			text: sTitlePath
		}).addStyleClass("sapInoIntegrationMappingTitle");
		var that = this;
		var oTreeTbl = new sap.ui.table.TreeTable({
			title: oTitle,
			selectionMode: 'Single',
			columns: [
	           new sap.ui.table.Column({
					label: '{i18n>BO_INTEGRATION_MAPPING_TREE_COL_TARGET_ATTR}',
					template: new sap.m.Text({
						text: '{applicationObject>technicalName}',
						tooltip: '{applicationObject>technicalName}',
						wrapping: false
					})
				}),
	           new sap.ui.table.Column({
					label: '{i18n>BO_INTEGRATION_MAPPING_TREE_COL_INM_ATTR}',
					template: new sap.m.Text({
						text: {
						    parts: ['applicationObject>mappingField', 'inmFields>/'],
						    formatter: function(sINMAttr, aINMAttrs) {
						        if (!sINMAttr) {
						            return "";
						        }
						        var oAttr = aINMAttrs.filter(function(oINMAttr) {
						            return oINMAttr.FIELD_CODE === sINMAttr;
						        })[0];
						        return oAttr ? oAttr.TEXT_CODE + ' (' + oAttr.FIELD_CODE + ')' : '';
						    }
						},
						wrapping: false
					})
				}),
	           new sap.ui.table.Column({
					label: '{i18n>BO_INTEGRATION_MAPPING_TREE_COL_VALUE_TYPE}',
					template: new sap.m.Text({
						text: {
						    path: 'applicationObject>dataType',
						    formatter: function(sDataType) {
						        if (sDataType === 'Variant') {
						            return that.getController().getTextModel().getText("BO_INTEGRATION_MAPPING_DETAIL_VARIANT_ITEM");
						        }
						        return sDataType;
						    }
						}
					})
				}),
	           new sap.ui.table.Column({
					label: '{i18n>BO_INTEGRATION_MAPPING_TREE_COL_VALUE}',
					template: new sap.m.Text({
						text: '{applicationObject>constantsValue}'
					})
				})
	       ]
		});
		var oToolbar = new sap.m.OverflowToolbar({
			content: [
	            new sap.ui.commons.Button({
					text: '{i18n>BO_INTEGRATION_MAPPING_TREE_BUT_IMPORT}',
					press: [oController.handleMappingImport, oController],
					lite: false,
					customData: new sap.ui.core.CustomData({
					    key: 'treeId',
					    value: oTreeTbl.getId()
					})
				}),
				// add sibling / add child / remove
				new sap.ui.commons.Button({
					text: '{i18n>BO_INTEGRATION_MAPPING_TREE_BUT_ADD_SIBLING}',
					press: [oController.handleAddSiblingNode, oController],
					lite: false,
					enabled: false,
					customData: new sap.ui.core.CustomData({
					    key: 'treeId',
					    value: oTreeTbl.getId()
					})
				}),
				new sap.ui.commons.Button({
					text: '{i18n>BO_INTEGRATION_MAPPING_TREE_BUT_ADD_CHILD}',
					press: [oController.handleAddChildNode, oController],
					lite: false,
					enabled: false,
					customData: new sap.ui.core.CustomData({
					    key: 'treeId',
					    value: oTreeTbl.getId()
					})
				}),
				new sap.ui.commons.Button({
					text: '{i18n>BO_INTEGRATION_MAPPING_TREE_BUT_REMOVE}',
					press: [oController.handleRemoveNode, oController],
					lite: false,
					enabled: false,
					customData: new sap.ui.core.CustomData({
					    key: 'treeId',
					    value: oTreeTbl.getId()
					})
				}),
				new sap.m.ToolbarSpacer(),
				new sap.ui.commons.Button({
				    text: '{i18n>BO_INTEGRATION_MAPPING_TREE_BUT_COLLAPSE_ALL}',
				    press: [oController.handleCollapseAll, oController],
				    lite: false,
					customData: new sap.ui.core.CustomData({
					    key: 'treeId',
					    value: oTreeTbl.getId()
					})
				}),
				new sap.ui.commons.Button({
				    text: '{i18n>BO_INTEGRATION_MAPPING_TREE_BUT_EXPAND_ALL}',
				    press: [oController.handleExpandAll, oController],
				    lite: false,
					customData: new sap.ui.core.CustomData({
					    key: 'treeId',
					    value: oTreeTbl.getId()
					})
				})
	        ],
			visible: bEdit
		});
		oTreeTbl.addExtension(oToolbar);
		oTreeTbl.attachRowSelectionChange(oController.handleMappingRowSelection, oController);
		return oTreeTbl;
	},
	_createReqMappingForm: function(oLayout, sObjectKey, bEdit) {
		var oSubLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 5,
			widths: ['15%', '25%', '15%', '25%', 'auto'],
			visible: false
		});
		
		// INM attribute
		var oINMAttrLabel = this.createControl({
			Type: "label",
			Text: "BO_INTEGRATION_MAPPING_TREE_COL_INM_ATTR",
			Tooltip: "BO_INTEGRATION_MAPPING_TREE_COL_INM_ATTR"
		});
		var oINMAttr = new sap.ui.commons.DropdownBox({
			editable: bEdit ? {
			    path: 'applicationObject>dataType',
			    formatter: function(sDataType) {
			        return sDataType === 'Variant';
			    }
			} : bEdit,
			width: "100%",
			selectedKey: "{applicationObject>mappingField}",
			displaySecondaryValues: true
		});
		var oItemTemp = new sap.ui.core.ListItem({
			key: "{inmFields>FIELD_CODE}",
			text: "{inmFields>TEXT_CODE}",
			additionalText: "{inmFields>FIELD_CODE}"
		});
		var oAttrFilter;
        if (sObjectKey === "CREATE") {
            oAttrFilter = new sap.ui.model.Filter({
                filters: [
                    new sap.ui.model.Filter({
        				path: 'TYPE_CODE',
        				operator: 'EQ',
        				value1: 'REQUEST_MAPPING'
        			}),
        			new sap.ui.model.Filter({
        				path: 'TYPE_CODE',
        				operator: 'EQ',
        				value1: ''
        			})
                ],
                and: false
            });
        } else {
            oAttrFilter = new sap.ui.model.Filter({
				path: 'TYPE_CODE',
				operator: 'NE',
				value1: 'NON_MAPPING_FIELD'
			});
        }
		oINMAttr.bindItems({
			path: "inmFields>/",
			filters: [oAttrFilter],
			template: oItemTemp
		});
// 		var oINMAttrName = new sap.ui.commons.TextView({
// 			ariaLabelledBy: oINMAttrLabel,
// 			text: {
// 			    parts: ['applicationObject>mappingField', 'inmFields>/'],
// 			    formatter: this.getController().formatINMAttrName
// 			}
// 		});
		
		// value
		var oValueLabel = this.createControl({
			Type: "label",
			Text: "BO_INTEGRATION_MAPPING_TREE_COL_VALUE",
			Tooltip: "BO_INTEGRATION_MAPPING_TREE_COL_VALUE"
		});
        var oValue = new sap.ui.commons.TextField({
            value : "{applicationObject>constantsValue}",
            maxLength : 100,
            editable: bEdit ? {
			    path: 'applicationObject>dataType',
			    formatter: function(sDataType) {
			        return sDataType === 'Constant';
			    }
			} : bEdit,
            width : '100%',
            ariaLabelledBy : oValueLabel
        });

		// value type
		var oValueTypeLabel = this.createControl({
			Type: "label",
			Text: "BO_INTEGRATION_MAPPING_TREE_COL_VALUE_TYPE",
			Tooltip: "BO_INTEGRATION_MAPPING_TREE_COL_VALUE_TYPE"
		});
		var oValueType = new sap.ui.commons.DropdownBox({
			editable: bEdit,
			width: "100%",
			selectedKey: "{applicationObject>dataType}",
			change: function(oEvent) {
			    var sKey = oEvent.getParameter('selectedItem').getKey();
			    if (sKey === 'Variant') {
			        oValue.setValue('');
			    } else if (sKey === 'Constant') {
			        oINMAttr.setSelectedKey('');
			    } else {
			        oValue.setValue('');
			        oINMAttr.setSelectedKey('');
			    }
			}.bind(this)
		});
		oValueType.addItem(new sap.ui.core.ListItem({
			key: "",
			text: ""
		}));
		oValueType.addItem(new sap.ui.core.ListItem({
			key: "Variant",
			text: "{i18n>BO_INTEGRATION_MAPPING_DETAIL_VARIANT_ITEM}"
		}));
		oValueType.addItem(new sap.ui.core.ListItem({
			key: "Constant",
			text: "{i18n>BO_INTEGRATION_MAPPING_DETAIL_CONSTANT_ITEM}"
		}));
		
		// target system attribute
		var oTargetLabel = this.createControl({
			Type: "label",
			Text: "BO_INTEGRATION_MAPPING_TREE_COL_TARGET_ATTR",
			Tooltip: "BO_INTEGRATION_MAPPING_TREE_COL_TARGET_ATTR"
		});
        var oTarget = new sap.ui.commons.TextField({
            value : "{applicationObject>technicalName}",
            maxLength : 50,
            editable: bEdit,
            width : '100%',
            ariaLabelledBy : oTargetLabel
        });
		
		// add value type row
		oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oValueTypeLabel]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oValueType]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				colSpan: 3
			})]
		}));
		
		// add inm attribute row
		oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oINMAttrLabel]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oINMAttr]
			})
// 			, new sap.ui.commons.layout.MatrixLayoutCell({
// 				content: [oINMAttrName]
// 			})
			, new sap.ui.commons.layout.MatrixLayoutCell({
				colSpan: 3
			})]
		}));
        
        // add value row
		oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oValueLabel]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oValue]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				colSpan: 3
			})]
		}));
		
		// add target attribute row
		oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oTargetLabel]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oTarget]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				colSpan: 3
			})]
		}));

		// add to main layout
		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oSubLayout],
				colSpan: 5
			})]
		}));
		
		return oSubLayout;
	},
	_createRespMappingForm: function(oLayout, sObjectKey, bEdit) {
		var oSubLayout = new sap.ui.commons.layout.MatrixLayout({
			columns: 5,
			widths: ['15%', '25%', '15%', '25%', 'auto'],
			visible: false
		});
		
		// value
		var oValueLabel = this.createControl({
			Type: "label",
			Text: "BO_INTEGRATION_MAPPING_TREE_COL_VALUE",
			Tooltip: "BO_INTEGRATION_MAPPING_TREE_COL_VALUE"
		});
		var oValue = new sap.ui.commons.TextField({
            value : "{applicationObject>constantsValue}",
            maxLength : 100,
            editable: bEdit ? {
			    path: 'applicationObject>dataType',
			    formatter: function(sDataType) {
			        return sDataType === 'Constant';
			    }
			} : bEdit,
            width : '100%',
            ariaLabelledBy : oValueLabel
        });
        
        // INM attribute
		var oINMAttrLabel = this.createControl({
			Type: "label",
			Text: "BO_INTEGRATION_MAPPING_TREE_COL_INM_ATTR",
			Tooltip: "BO_INTEGRATION_MAPPING_TREE_COL_INM_ATTR"
		});
		var oINMAttr = new sap.ui.commons.DropdownBox({
			editable: bEdit,
			selectedKey: "{applicationObject>mappingField}",
			width: "100%",
			displaySecondaryValues: true,
			change: function(oEvent) {
			    var oSelectedItem = oEvent.getParameter('selectedItem');
			    if (!oSelectedItem || oSelectedItem.getKey() === '') {
			        return;
			    }
                var oAppData = this.getController().getModel('applicationObject').getData();
                var oSelectedTableRowContext = sap.ui.getCore().byId(oEvent.getSource().getCustomData()[0].getValue()).getBindingContext('applicationObject');
                var bUsed = this.getController().checkMappingFieldBeenUsed(
                        sObjectKey === 'CREATE' ? oAppData.CREATE_RES_JSON : oAppData.FETCH_RES_JSON, 
                        oSelectedItem.getKey()
                        // , oSelectedTableRowContext.oModel.getProperty(oSelectedTableRowContext.sPath).technicalName
                );
                var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
                var oSourceCtrl = oEvent.getSource();
                if (bUsed) {
                    // alert not allowed to mapping
			        sap.ui.commons.MessageBox.alert(
			            oMsg.getResourceBundle().getText('MSG_INTEGRATION_MAPPING_FIELD_DUPLICATE_WARNING', 
			                [oSelectedTableRowContext.oModel.getProperty(oSelectedTableRowContext.sPath).technicalName]
                        ), 
			            function() {
                            oSourceCtrl.setSelectedKey('');
    		            },
    		            this.getController().getTextModel().getText("BO_INTEGRATION_MAPPING_FIELD_DUPLICATE_WARNING_TITLE")
                    );
                }
			}.bind(this)
		});
		var oItemTemp = new sap.ui.core.ListItem({
			key: "{inmFields>FIELD_CODE}",
			text: "{inmFields>TEXT_CODE}",
			additionalText: "{inmFields>FIELD_CODE}"
		});
		oINMAttr.bindItems({
			path: "inmFields>/",
            filters: [new sap.ui.model.Filter({
                filters: [
                    new sap.ui.model.Filter({
        				path: 'TYPE_CODE',
        				operator: 'EQ',
        				value1: 'RESPONSE_MAPPING'
        			}),
        			new sap.ui.model.Filter({
        				path: 'TYPE_CODE',
        				operator: 'EQ',
        				value1: ''
        			})
                ],
                and: false
            })],
			template: oItemTemp
		});
		oINMAttr.addCustomData(new sap.ui.core.CustomData({
		    key: 'mappingTreeId',
		    value: oSubLayout.getId()
		}));
		
		// target system attribute
		var oTargetLabel = this.createControl({
			Type: "label",
			Text: "BO_INTEGRATION_MAPPING_TREE_COL_TARGET_ATTR",
			Tooltip: "BO_INTEGRATION_MAPPING_TREE_COL_TARGET_ATTR"
		});
        var oTarget = new sap.ui.commons.TextField({
            value : "{applicationObject>technicalName}",
            maxLength : 50,
            // editable: bEdit,
            editable: bEdit ? {
			    path: 'applicationObject>dataType',
			    formatter: function(sDataType) {
			        return sDataType === 'Variant';
			    }
			} : bEdit,
            width : '100%',
            ariaLabelledBy : oTargetLabel
        });
		
		// value type
		var oValueTypeLabel = this.createControl({
			Type: "label",
			Text: "BO_INTEGRATION_MAPPING_TREE_COL_VALUE_TYPE",
			Tooltip: "BO_INTEGRATION_MAPPING_TREE_COL_VALUE_TYPE"
		});
	    var oValueType = new sap.ui.commons.DropdownBox({
			editable: bEdit,
			width: "100%",
			selectedKey: "{applicationObject>dataType}",
			change: function(oEvent) {
			    var sKey = oEvent.getParameter('selectedItem').getKey();
			    var sTargetAttr = oTarget.getValue();
			    var sOrignalTargetAttr = oTarget.getCustomData()[0] ? oTarget.getCustomData()[0].getValue() : "";
			    if (sKey === 'Variant') {
			        oValue.setValue('');
			        if (sOrignalTargetAttr) {
			            oTarget.setValue(sOrignalTargetAttr);
			        }
			    } else if (sKey === 'Constant') {
			        if (sTargetAttr && !sOrignalTargetAttr) {
    			        oTarget.addCustomData(new sap.ui.core.CustomData({
    			            value: sTargetAttr
    			        }));
			        }
			        oTarget.setValue('');
			    } else {
			        oValue.setValue('');
			        oTarget.setValue('');
			    }
			}.bind(this)
		});
		oValueType.addItem(new sap.ui.core.ListItem({
			key: "",
			text: ""
		}));
		oValueType.addItem(new sap.ui.core.ListItem({
			key: "Variant",
			text: "{i18n>BO_INTEGRATION_MAPPING_DETAIL_VARIANT_ITEM}"
		}));
		oValueType.addItem(new sap.ui.core.ListItem({
			key: "Constant",
			text: "{i18n>BO_INTEGRATION_MAPPING_DETAIL_CONSTANT_ITEM}"
		}));
		oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oValueTypeLabel]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oValueType]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				colSpan: 2
			})]
		}));
		
        // add target system attribute row
		oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oTargetLabel]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oTarget]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				colSpan: 2
			})]
		}));
		
		// add inm attribute row
		oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oINMAttrLabel]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oINMAttr]
			})
// 			, new sap.ui.commons.layout.MatrixLayoutCell({
// 				content: [oINMAttrName]
// 			})
			, new sap.ui.commons.layout.MatrixLayoutCell({
				colSpan: 3
			})]
		}));
        
        // add value row
		oSubLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oValueLabel]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oValue]
			}), new sap.ui.commons.layout.MatrixLayoutCell({
				colSpan: 2
			})]
		}));

		// add to main layout
		oLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells: [new sap.ui.commons.layout.MatrixLayoutCell({
				content: [oSubLayout],
				colSpan: 5
			})]
		}));
		
		return oSubLayout;
	},
	setMappingFormContext: function(oMappingForm, oBindingContext) {
	    oMappingForm.setBindingContext(oBindingContext, this.getController().getModelName());
	}
}));