/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.views.common.ThingInspectorAOController");
jQuery.sap.require("sap.ui.ino.application.backoffice.Application");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.models.object.SystemIntegration");
jQuery.sap.require("sap.ui.ino.application.Message");
jQuery.sap.require("sap.ui.model.json.JSONModel");

sap.ui.controller("sap.ui.ino.views.backoffice.integration.IntegrationMapping", jQuery.extend({},
	sap.ui.ino.views.common.ThingInspectorAOController, {

		mMessageParameters: {
			group: "configuration_sys_integration",
			save: {
				success: "MSG_INTEGRATION_MAPPING_SAVED"
			},
			del: {
				success: "MSG_INTEGRATION_MAPPING_DELETED", // text key for delete success message
				title: "BO_INTEGRATION_MAPPING_TIT_DEL", // text key for dialog title
				dialog: "BO_INTEGRATION_MAPPING_INS_DEL" // text key for dialog message
			}
		},

		createModel: function(iId) {
			if (!this.oModel) {
				this.oModel = new sap.ui.ino.models.object.SystemIntegration(iId > 0 ? iId : undefined, {
					actions: ["read", "modify", "create", "del", "update"],
					nodes: ["Root"],
					continuousUse: true,
					concurrencyEnabled: true
				});
			}

			var that = this;
			// get destinations
			var oDeffered = sap.ui.ino.models.object.SystemIntegration.getAllDestinations();
			// get INM mapping fields
			var oDeffered2 = sap.ui.ino.models.object.SystemIntegration.getAllMappingField();
			oDeffered2.done(function(oResp) {
				var oTI = that.getView().getInspector();
				if (oTI) {
					oResp.RESULT.unshift({
						FIELD_CODE: '',
						TEXT_CODE: '',
						TYPE_CODE: ''
					}
					);
					oTI.setModel(new sap.ui.model.json.JSONModel(oResp.RESULT.map(function(oResult) {
					    oResult.SELECTED = false;
					    return oResult;
					})), "inmFields");
				}
			});
			if (iId < 0) {
				this.oModel.setProperty("/STATUS", "active");
				oDeffered.done(function(oResp) {
					var oTI = that.getView().getInspector();
					if (oTI) {
						oResp.RESULT.unshift({
							"destPackage": "",
							"destName": "",
							"destHost": "",
							"destPort": null,
							"destPathPrefix": "",
							"destFullName": "",
							"standardName": "",
							"standardPackage": ""
						});
						oTI.setModel(new sap.ui.model.json.JSONModel(oResp.RESULT), "targetList");
					}
					return oResp.RESULT;
				});
			} else if (iId && iId > 0) {
				this.oModel.getDataInitializedPromise().done(function() {
					oDeffered.done(function(oResp) {
						var oTI = that.getView().getInspector();
						var oAppData = that.oModel.getData();
						if (oTI) {
							oResp.RESULT.unshift({
								"destPackage": "",
								"destName": "",
								"destHost": "",
								"destPort": null,
								"destPathPrefix": "",
								"destFullName": "",
    							"standardName": "",
    							"standardPackage": ""
							});
							oTI.setModel(new sap.ui.model.json.JSONModel(oResp.RESULT), "targetList");

							var oTargetDest = oResp.RESULT.filter(function(oDest) {
								return oDest.standardName === oAppData.SYSTEM_NAME;
							})[0];
							if (oTargetDest) {
							    that.oModel.setProperty('/targetHost', 
							        oTargetDest.destHost ? oTargetDest.destHost + ':' + oTargetDest.destPort + oTargetDest.destPathPrefix : '');
							}
						}
					});
				});
			}

			return this.oModel;
		},

		onInit: function() {
			sap.ui.ino.views.common.ThingInspectorAOController.onInit.apply(this, arguments);
			this.triggerRefreshOnClose = false;
		},
		
		onSave: function() {
		    var oAppData = this.oModel.getData();
		    this._bValid = true;
		    sap.ui.ino.application.backoffice.Application.getInstance().removeNotificationMessages('configuration_sys_integration', sap.ui.core.MessageType.Error);
		    if (oAppData.CREATE_REQ_JSON) {
		        this._checkMappingConfig(oAppData.CREATE_REQ_JSON, 'create_request');
		    }
		    if (oAppData.CREATE_RES_JSON) {
		        this._checkMappingConfig(oAppData.CREATE_RES_JSON, 'create_response');
		    }
		    if (oAppData.FETCH_REQ_JSON) {
		        this._checkMappingConfig(oAppData.FETCH_REQ_JSON, 'update_request');
		    }
		    if (oAppData.FETCH_RES_JSON) {
		        this._checkMappingConfig(oAppData.FETCH_RES_JSON, 'update_response');
		    }
		    if (!this._bValid) {
		        return;
		    }
		    
		    sap.ui.ino.views.common.ThingInspectorAOController.onSave.apply(this, arguments);
		},
		
		_checkMappingConfig: function(oMappingData, sTargetKey) {
		    var that = this;
		    if (Array.isArray(oMappingData.children)) {
		        oMappingData.children.forEach(function(oMapping) {
		            that._isValidMappingNode(oMapping, sTargetKey, "/" + oMapping.technicalName);
		        });
		    }
		},
		_isValidMappingNode: function(oMappingData, sTargetKey, sMappingPath) {
		    var that = this;
		    var oMsg = sap.ui.getCore().getModel(sap.ui.ino.application.ApplicationBase.MODEL_MSG);
		    if (oMappingData.children && oMappingData.children.length > 0) {
		        oMappingData.children.forEach(function(oSubMappingData) {
		            that._isValidMappingNode(oSubMappingData, sTargetKey, sMappingPath + "/" + oSubMappingData.technicalName);
		        });
		    } else {
		        if (sTargetKey.endsWith("request") && !oMappingData.technicalName) {
    		        this._bValid = false;
    		        // add invalid message
    		        sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessage(new sap.ui.ino.application.Message({
    		            key: 'mapping_config_invalid_' + sTargetKey + '_empty_techname',
    					level: sap.ui.core.MessageType.Error,
    					parameters: [],
    					group: 'configuration_sys_integration',
    					text: oMsg.getResourceBundle().getText('MSG_INTEGRATION_MAPPING_FIELD_EMPTY_TECHNAME')
    		        }));
    		    } else if (sTargetKey.endsWith("request") && oMappingData.dataType === 'Variant' && !oMappingData.mappingField) {
    		        this._bValid = false;
    		        // add invalid message
    		        sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessage(new sap.ui.ino.application.Message({
    		            key: 'mapping_config_invalid_' + sTargetKey + '_' + oMappingData.technicalName,
    					level: sap.ui.core.MessageType.Error,
    					parameters: [],
    					group: 'configuration_sys_integration',
    					text: oMsg.getResourceBundle().getText('MSG_INTEGRATION_MAPPING_FIELD_CONFIG_INVALID', [sTargetKey, oMappingData.technicalName])
    		        }));
    		    }else if (sTargetKey.endsWith("response") && oMappingData.dataType === 'Variant' && !oMappingData.technicalName) {
    		        this._bValid = false;
    		        // add invalid message
    		        sap.ui.ino.application.backoffice.Application.getInstance().addNotificationMessage(new sap.ui.ino.application.Message({
    		            key: 'mapping_config_invalid_' + sTargetKey + '_' + oMappingData.technicalName,
    					level: sap.ui.core.MessageType.Error,
    					parameters: [],
    					group: 'configuration_sys_integration',
    					text: oMsg.getResourceBundle().getText('MSG_INTEGRATION_MAPPING_FIELD_CONFIG_INVALID', [sTargetKey, oMappingData.mappingField])
    		        }));
    		    } else {
    		       oMappingData.mappingPath =  sMappingPath;
    		    }
		    }
		}

	}));