/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
jQuery.sap.require("sap.ui.model.json.JSONModel");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.commons.MessageBox");

sap.ui.controller("sap.ui.ino.views.backoffice.integration.IntegrationMappingDefinitionFacet", jQuery.extend({},
	sap.ui.ino.views.common.FacetAOController, {

		onAfterModelAction: function(sActionName) {
			if (sActionName === 'save') {
				this._refreshTargetSystemHostAndPort();
			}
		},

		onAfterModeSwitch: function(sNewMode) {
			if (sNewMode === 'edit' || sNewMode === 'display') {
				this._refreshTargetSystemHostAndPort();
			}
		},

		_refreshTargetSystemHostAndPort: function() {
			// set host & port
			var oAppModel = this.getModel("applicationObject");
			var oTargetSystem = this.getView().getThingInspectorView().getInspector().getModel('targetList').getData().filter(function(oSys) {
				return oSys.standardName === oAppModel.getProperty('/SYSTEM_NAME');
			})[0];
			if (oTargetSystem) {
				oAppModel.setProperty('/targetHost',
					oTargetSystem.destHost ? oTargetSystem.destHost + ':' + oTargetSystem.destPort + oTargetSystem.destPathPrefix : '');
			}
		},

		handleMappingImport: function(oEvent) {
			var sTreeId = oEvent.getSource().getCustomData()[0].getValue();
			var oTreeObjData = this.getModel("applicationObject").getProperty(sap.ui.getCore().byId(sTreeId).getBinding('rows').sPath);
			this._getImportDialog(sTreeId).open();
			if (oTreeObjData) {
				//this._oImportContent.setValue(JSON.stringify(this._newGlobalPayLoad(oTreeObjData), null, 4));
				this._oImportContent.setValue(JSON.stringify(this._tree2JsonTransfer(oTreeObjData), null, 4));
			}
		},

		handleMappingRowSelection: function(oEvent) {
			var sId = oEvent.getSource().getCustomData()[0].getValue();
			var oMappingForm = sap.ui.getCore().byId(sId);
			var aToolbarBtns = oEvent.getSource().getExtension()[0].getContent();
			if (oEvent.getSource().getSelectedIndex() === -1) {
				oMappingForm.setVisible(false);
		        [aToolbarBtns[1], aToolbarBtns[2], aToolbarBtns[3]].forEach(function(oBtn) {
					oBtn.setEnabled(false);
				});
				return;
			}
			aToolbarBtns[1].setEnabled(true); // add sibling button
			var oRowContext = this.getModel("applicationObject").getProperty(oEvent.getParameter('rowContext').sPath);
			if (!oRowContext.children || oRowContext.children.length === 0) {
				oMappingForm.setBindingContext(oEvent.getParameter('rowContext'), this.getModelName());
				oMappingForm.setVisible(true);
				aToolbarBtns[3].setEnabled(true); // remove button
				// add child button
				if (!oRowContext.technicalName || oRowContext.dataType || oRowContext.constantsValue || oRowContext.mappingField) {
					aToolbarBtns[2].setEnabled(false);
				} else {
					aToolbarBtns[2].setEnabled(true);
				}
			} else {
				oMappingForm.setVisible(false);
				aToolbarBtns[2].setEnabled(true); // add child button
				aToolbarBtns[3].setEnabled(false); // remove button
			}
		},

		handleCollapseAll: function(oEvent) {
			var sId = oEvent.getSource().getCustomData()[0].getValue();
			var oTree = sap.ui.getCore().byId(sId);
			oTree.collapseAll();
		},

		handleExpandAll: function(oEvent) {
			var sId = oEvent.getSource().getCustomData()[0].getValue();
			var oTree = sap.ui.getCore().byId(sId);
			oTree.expandToLevel(8);
		},

		checkMappingFieldBeenUsed: function(oMappingData, sMappedField) {
			var that = this;
			var bUsed;
			var oUsed = {
				cnt: 0
			};
			var aMappingData = oMappingData.children;
			if (Array.isArray(aMappingData)) {
				for (var i = 0; i < aMappingData.length; i++) {
					bUsed = that._isUsedMappingField(aMappingData[i], sMappedField, oUsed);
					if (bUsed) {
						return true;
					}
				}
			}
			return false;
		},

		_isUsedMappingField: function(oMappingData, sMappedField, oUsed) {
			var that = this;
			var bUsed;
			if (oMappingData.children && oMappingData.children.length > 0) {
				for (var i = 0; i < oMappingData.children.length; i++) {
					bUsed = that._isUsedMappingField(oMappingData.children[i], sMappedField, oUsed);
					if (bUsed) {
						return true;
					}
				}
			}
			if (oMappingData.mappingField === sMappedField) {
				oUsed.cnt += 1;
			}
			if (oUsed.cnt > 1) {
				return true;
			} else {
				return false;
			}
		},

		// json To tree
		_jsonToTree: function(jsondata, node, pathName) {
			var that = this;
			Object.keys(jsondata).forEach(function(element) {
				var object = jsondata[element];
				if (typeof(object) === 'object' && !Array.isArray(element)) {
					var subNode = {
						technicalName: element,
						children: []
					};
					node.push(subNode);
					that._jsonToTree(object, subNode.children, pathName + '/' + element);
				} else {
					node.push({
						technicalName: element,
						dataType: '',
						constantsValue: '',
						mappingField: '',
						mappingPath: pathName + '/' + element,
						displayName: ''
					});
				}
			});
		},

		_newRootNode: function(jsondata) {
			var rootNode = {
				children: []
			};
			this._jsonToTree(jsondata, rootNode.children, '');
			return rootNode;
		},

		// tree to json payload
		_treeToJsonPayload: function(treeObject, payload) {
			var children = treeObject.children;
			var that = this;
			if (children && children.length > 0) {
				children.forEach(function(element) {
					if (element.children && element.children.length > 0) {
						if (isNaN(element.children[0].technicalName)) {
							payload[element.technicalName] = {};
							that._treeToJsonPayload(element, payload[element.technicalName]);
						} else {
							payload[element.technicalName] = [];
							that._treeToJsonPayload(element, payload[element.technicalName]);
						}
					} else {
						that._treeToJsonPayload(element, payload);
					}
				});
			} else {
				that._processPayloadData(treeObject);
				if (Array.isArray(payload)) {
					var objectInArray = {};
					objectInArray[treeObject.technicalName] = '';
					payload.push(objectInArray);
				} else {
					payload[treeObject.technicalName] = '';
				}
			}
		},
		_newGlobalPayLoad: function(oTreeData) {
			var payload = {};
			this._treeToJsonPayload(oTreeData, payload);
			return payload;
		},
		_processPayloadData: function(metadata) {
			return metadata;
		},

		_getImportDialog: function(sTreeId) {
			if (!this._oImportDialog) {
				this._oImportDialog = new sap.m.Dialog({
					showHeader: false,
					buttons: [
		                new sap.m.Button({
							text: '{i18n>BO_INTEGRATION_MAPPING_IMPORT_BUT_SAVE}',
							press: this.handleImportSave.bind(this)
						}),
		                new sap.m.Button({
							text: '{i18n>BO_INTEGRATION_MAPPING_IMPORT_BUT_FORMAT}',
							press: this.handleImportFormat.bind(this)
						}),
		                new sap.m.Button({
							text: '{i18n>BO_INTEGRATION_MAPPING_IMPORT_BUT_CANCEL}',
							press: this.handleImportCancel.bind(this)
						})
		            ]
				});
				
				this._oImportDialog.addContent(this._getImportDialogContent());
			}
			this._oImportDialog.removeAllCustomData();
			this._oImportDialog.addCustomData(new sap.ui.core.CustomData({
				value: sTreeId
			}));
			return this._oImportDialog;
		},
		
		_getImportDialogContent: function() {
		    this._oImportContent = new sap.m.TextArea({
				rows: 30,
				cols: 100,
				maxLength: 10000
			});
		    return new sap.m.VBox({
		        items: [
		            new sap.m.HBox({
		                alignItems: 'Center',
		                items: [
		                    new sap.ui.core.HTML({
		                        content: '{i18n>BO_INTEGRATION_MAPPING_IMPORT_DIALOG_HELP_TEXT}'
		                    }),
		                    new sap.m.Button({
            					icon: 'sap-icon://sys-help',
            					type: 'Transparent',
            					tooltip: '{i18n>BO_INTEGRATION_MAPPING_IMPORT_DIALOG_HELP_TOOLTIP}',
            					press: this.handleImportDialogHelp.bind(this)
            				})
		                ]
		            }),
		            this._oImportContent
		        ]
		    });
		},

		handleImportSave: function() {
			sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages('configuration_sys_integration', sap.ui.core.MessageType
				.Error);
			var sJSONStr = this._oImportContent.getValue();
			var oExchangedJSON = "";
			if (sJSONStr) {
				try {
					//oExchangedJSON = this._newRootNode(JSON.parse(sJSONStr));
					oExchangedJSON = this._json2TreeTransfer(JSON.parse(sJSONStr));
				} catch (e) {
					var oMessageParameters = {
						key: 'integration_mapping_invalid',
						level: sap.ui.core.MessageType.Error,
						parameters: [],
						group: 'configuration_sys_integration',
						text: e.message
					};
					var oMessage = new sap.ui.ino.application.Message(oMessageParameters);
					sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessage(oMessage);
					return;
				}
			}
			var sTreeId = this._oImportDialog.getCustomData()[0].getValue();
			var oTreeTable = sap.ui.getCore().byId(sTreeId);
			var sBindingPath = oTreeTable.getBinding("rows").sPath;
			var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
			if (this.getModel("applicationObject").getProperty(sBindingPath)) {
				// show confirm
				sap.ui.commons.MessageBox.confirm(
					oMsg.getResourceBundle().getText('MSG_INTEGRATION_MAPPING_IMPORT_CONFIRM'),
					function(bConfirmed) {
						if (bConfirmed) {
							this.getModel("applicationObject").setProperty(sBindingPath, oExchangedJSON);
							oTreeTable.getBinding("rows").resume();
							this._oImportContent.setValue('');
							this._oImportDialog.close();
						}
					}.bind(this),
					this.getTextModel().getText("BO_INTEGRATION_MAPPING_IMPORT_CONFIRM_TITLE")
				);
			} else {
				this.getModel("applicationObject").setProperty(sBindingPath, oExchangedJSON);
				oTreeTable.getBinding("rows").resume();
				this._oImportContent.setValue('');
				this._oImportDialog.close();
			}
		},

		_json2TreeTransfer: function(jsonObj) {
			var __fnIsMappingField = function(vValue) {
				if (typeof(vValue) === "string") {
					return /\{\{([A-Z0-9]+_[A-Z0-9]+)(_*[A-Z0-9])*\}\}/g.test(vValue);
				}
				return false;
			};

			var __fnIsConstantField = function(vValue) {
				return vValue !== '';
			};

			var __fnGetDataType = function(vValue) {
				if (__fnIsMappingField(vValue)) {
					return 'Variant';
				}
				if (__fnIsConstantField(vValue)) {
					return 'Constant';
				}
				return '';
			};

			var __fnGetMappingField = function(sValue) {
				return /\{\{(([A-Z0-9]+_[A-Z0-9]+)(_*[A-Z0-9])*)\}\}/g.exec(sValue)[1];
				
			};

			var __fnGetConstantValue = function(vValue) {
				if (vValue === '{{null}}') {
					return '';
				}
				return vValue;
			};

			var __fnTransfer = function(jsondata, node, pathName) {
				Object.keys(jsondata).forEach(function(element) {
					var object = jsondata[element];
					if (typeof(object) === 'object' && !Array.isArray(element)) {
						var subNode = {
							technicalName: element,
							children: []
						};
						node.push(subNode);
						__fnTransfer(object, subNode.children, pathName + '/' + element);
					} else {
						var sDataType = __fnGetDataType(object);
						if (__fnIsMappingField(element)) {
							// response mapping for constant value
							node.push({
								technicalName: '',
								dataType: sDataType,
								constantsValue: __fnGetConstantValue(object),
								mappingField: __fnGetMappingField(element),
								mappingPath: pathName + '/' + element,
								displayName: ''
							});
						} else {
							node.push({
								technicalName: element,
								dataType: sDataType,
								constantsValue: sDataType === 'Constant' ? __fnGetConstantValue(object) : '',
								mappingField: sDataType === 'Variant' ? __fnGetMappingField(object) : '',
								mappingPath: pathName + '/' + element,
								displayName: ''
							});
						}
					}
				});
			};

			var rootNode = {
				children: []
			};
			__fnTransfer(jsonObj, rootNode.children, '');

			return rootNode;
		},

		_tree2JsonTransfer: function(treeObj) {
			var __fnGetMappingValue = function(treeNode) {
				if (treeNode.dataType === 'Variant') {
					return '{{' + treeNode.mappingField + '}}';
				} else if (treeNode.dataType === 'Constant') {
					return treeNode.constantsValue === '' ? '{{null}}' : treeNode.constantsValue;
				} else {
					return '';
				}
			};
			var __fnTransfer = function(treeData, jsonPayload) {
				var that = this;
				var children = treeData.children;
				if (children && children.length > 0) {
					children.forEach(function(element) {
						if (element.children && element.children.length > 0) {
							if (isNaN(parseInt(element.children[0].technicalName, 10))) {
								jsonPayload[element.technicalName] = {};
								__fnTransfer(element, jsonPayload[element.technicalName]);
							} else {
								jsonPayload[element.technicalName] = [];
								__fnTransfer(element, jsonPayload[element.technicalName]);
							}
						} else {
							__fnTransfer(element, jsonPayload);
						}
					});
				} else {
					that._processPayloadData(treeData);
					if (Array.isArray(jsonPayload)) {
						var objectInArray = {};
						if (treeData.technicalName === '') {
							objectInArray['{{' + treeData.mappingField + '}}'] = __fnGetMappingValue(treeData);
						} else {
							objectInArray[treeData.technicalName] = __fnGetMappingValue(treeData);
						}
						jsonPayload.push(objectInArray);
					} else {
						if (treeData.technicalName === '') {
							jsonPayload['{{' + treeData.mappingField + '}}'] = __fnGetMappingValue(treeData);
						} else {
							jsonPayload[treeData.technicalName] = __fnGetMappingValue(treeData);
						}
					}
				}
			}.bind(this);

			var oPayload = {};
			__fnTransfer(treeObj, oPayload);

			return oPayload;
		},

		handleImportFormat: function() {
			var sJSONStr = this._oImportContent.getValue();
			if (sJSONStr) {
				try {
					this._oImportContent.setValue(JSON.stringify(JSON.parse(sJSONStr), null, 4));
				} catch (e) {
					sap.ui.commons.MessageBox.alert(
						this.getTextModel().getText("BO_INTEGRATION_MAPPING_JSON_FORMAT_ERROR_INFO"),
						undefined,
						this.getTextModel().getText("BO_INTEGRATION_MAPPING_JSON_FORMAT_ERROR_TITLE")
					);
				}
			}
		},

		handleImportCancel: function() {
			this._oImportContent.setValue('');
			this._oImportDialog.close();
		},

		handleAddSiblingNode: function(oEvent) {
			var sTreeId = oEvent.getSource().getCustomData()[0].getValue();
			var oTreeTable = sap.ui.getCore().byId(sTreeId);
			if (oTreeTable.getSelectedIndex() === -1) {
				return;
			}
			var oSelectedRowContext = oTreeTable.getContextByIndex(oTreeTable.getSelectedIndex());
			var iPosIndex = oSelectedRowContext.sPath.lastIndexOf("/");
			var oModel = oTreeTable.getBinding("rows").getModel();
			// get parent child array
			var sParentPath = oSelectedRowContext.sPath.slice(0, iPosIndex);
			var aAllSiblingNodes = oModel.getProperty(sParentPath);
			// get current node index
			var iCurrentIndex = parseInt(oSelectedRowContext.sPath.slice(iPosIndex + 1), 10);
			aAllSiblingNodes.splice(iCurrentIndex + 1, 0, {
				constantsValue: "",
				dataType: "",
				displayName: "",
				mappingField: "",
				mappingPath: "",
				technicalName: ""
			});

			//oNewContextData.mappingPath = this._getMappingPath(oSelectedRowContext.sPath, oModel);
			oModel.setProperty(sParentPath, aAllSiblingNodes);
			oTreeTable.setSelectedIndex(oTreeTable.getSelectedIndex() + 1);
			// clear selection

		},

		handleAddChildNode: function(oEvent) {
			var sTreeId = oEvent.getSource().getCustomData()[0].getValue();
			var oTreeTable = sap.ui.getCore().byId(sTreeId);
			if (oTreeTable.getSelectedIndex() === -1) {
				return;
			}
			var oSelectedRowContext = oTreeTable.getContextByIndex(oTreeTable.getSelectedIndex());
			var oSelObj = oSelectedRowContext.getObject();
			var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
			if (oSelObj.dataType || oSelObj.constantsValue || oSelObj.mappingField) {
				// leaf node can't add child node
				sap.ui.commons.MessageBox.alert(
					oMsg.getResourceBundle().getText('MSG_INTEGRATION_MAPPING_ADD_CHILD_WARNING'),
					undefined,
					this.getTextModel().getText("BO_INTEGRATION_MAPPING_FIELD_DUPLICATE_WARNING_TITLE")
				);
				return;
			}
			var oModel = oTreeTable.getBinding("rows").getModel();
			var aChildren = [];
			var oRootNode = oModel.getProperty(oSelectedRowContext.sPath);
			if (oRootNode.hasOwnProperty("children")) {
				aChildren = oRootNode.children;
			}
			aChildren.push({
				constantsValue: "",
				dataType: "",
				displayName: "",
				mappingField: "",
				mappingPath: "",
				technicalName: ""
			});
			oModel.setProperty(oSelectedRowContext.sPath + "/children", aChildren);
			// expand current node
			oTreeTable.expand(oTreeTable.getSelectedIndex());
			// set selection
			oTreeTable.setSelectedIndex(oTreeTable.getSelectedIndex() + aChildren.length);
		},

		handleRemoveNode: function(oEvent) {
			var sTreeId = oEvent.getSource().getCustomData()[0].getValue();
			var oTreeTable = sap.ui.getCore().byId(sTreeId);
			if (oTreeTable.getSelectedIndex() === -1) {
				return;
			}
			var bLastChild = false;
			var oSelectedRowContext = oTreeTable.getContextByIndex(oTreeTable.getSelectedIndex());
			var oModel = oTreeTable.getBinding("rows").getModel();
			var sParentRowContextPath = oSelectedRowContext.sPath.slice(0, oSelectedRowContext.sPath.lastIndexOf('/children'));
			var oParentRowObject = oModel.getProperty(sParentRowContextPath);
			var iSelectedRowPos = parseInt(oSelectedRowContext.sPath.slice(oSelectedRowContext.sPath.lastIndexOf('/') + 1), 10);
			if (iSelectedRowPos === oParentRowObject.children.length - 1) {
				bLastChild = true;
			}
			oParentRowObject.children.splice(iSelectedRowPos, 1);
			if (oParentRowObject.children.length === 0) {
				// remove all child node will change parent node to leaf node
				oParentRowObject = {
					constantsValue: "",
					dataType: "",
					displayName: "",
					mappingField: "",
					mappingPath: "",
					technicalName: oParentRowObject.technicalName
				};
			}
			oModel.setProperty(sParentRowContextPath, oParentRowObject);
			// clear selection
			oTreeTable.clearSelection();
			// if remove the last one child, UI5 will not trigger selection change event
			if (bLastChild) {
				oTreeTable.fireRowSelectionChange({
					rowIndex: -1
				});
			}
		},

		handleImportDialogHelp: function(oEvent) {
			var oButton = oEvent.getSource();

			if (!this._oHelpPopover) {
				this._oHelpPopover = new sap.m.Popover({
					title: '{i18n>BO_INTEGRATION_MAPPING_IMPORT_DIALOG_HELP_TITLE}',
					content: new sap.m.List()
				});
				this._oHelpPopover.setModel(this.getView().getThingInspectorView().getInspector().getModel('inmFields'), 'inmFields');
			}
			this._oHelpPopover.getContent()[0].bindItems({
				path: 'inmFields>/',
				filters: this._getPopoverFilter(),
				template: new sap.m.DisplayListItem({
					label: '{inmFields>FIELD_CODE}'
				})
			});
			this._oHelpPopover.openBy(oButton);
		},

		_getPopoverFilter: function() {
			var sTreeId = this._oImportDialog.getCustomData()[0].getValue();
			var oTreeTable = sap.ui.getCore().byId(sTreeId);
			var sBindingPath = oTreeTable.getBinding("rows").sPath;
			if (sBindingPath.indexOf('_REQ_') > -1) {
				if (sBindingPath.indexOf('CREATE') > -1) {
					return new sap.ui.model.Filter({
						path: 'TYPE_CODE',
						operator: 'EQ',
						value1: 'REQUEST_MAPPING'
					});
				} else {
					return new sap.ui.model.Filter({
						filters: [
    					    new sap.ui.model.Filter({
    								path: 'TYPE_CODE',
    								operator: 'EQ',
    								value1: 'REQUEST_MAPPING'
    							}),
    						new sap.ui.model.Filter({
    								path: 'TYPE_CODE',
    								operator: 'EQ',
    								value1: 'RESPONSE_MAPPING'
    							})
    					],
						and: false
					});
				}
			} else if (sBindingPath.indexOf('_RES_') > -1) {
				return new sap.ui.model.Filter({
					path: 'TYPE_CODE',
					operator: 'EQ',
					value1: 'RESPONSE_MAPPING'
				});
			}
		},

		_getMappingPath: function(sSelectedRowPath, oModel) {
			var sMappingPath = "";
			var oReg = /\/children\/[0-9]*/g;
			while (oReg.exec(sSelectedRowPath) !== null) {
				sMappingPath += "/" + oModel.getProperty(sSelectedRowPath.slice(0, oReg.lastIndex)).technicalName;
			}
			return sMappingPath;
		},

		formatINMAttrName: function(sINMAttrKey, aINMAttrObjs) {
			var oINMAttr = aINMAttrObjs.filter(function(oAttr) {
				return oAttr.FIELD_CODE === sINMAttrKey;
			})[0];
			return oINMAttr ? oINMAttr.TEXT_CODE : "";
		}
	}));