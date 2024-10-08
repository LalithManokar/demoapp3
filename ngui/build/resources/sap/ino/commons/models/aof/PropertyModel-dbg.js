/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/models/aof/MetaModel",
    "sap/ino/commons/models/aof/PropertyModelCache"
], function(JSONModel, MetaModel, PropertyModelCache) {
	"use strict";

	var Node = {
		Root: "Root",
		Extension: "Extension"
	};

	var oPropertiesCache = new PropertyModelCache({});

	var PropertyModel = JSONModel.extend("sap.aof.PropertyModel", {
		metadata: {
			events: {
				"modelInitialized": {},
				"modelCacheUpdated": {},
				"modelCacheInvalidated": {}
			}
		},

		/**
		 * @param sApplicationObjectName
		 *            name of the application object
		 * @param vKey
		 *            key of the application object instance
		 * @param oScope
		 *            scope object definition, e.g. the { nodes : ["Root"], actions : ["update", { "customAction" : { "A" : 1 } }],
		 *            staticActions : [ { "create" : { "OBJECT_ID" : 1 } } } ]
		 * @param bSync
		 *            properties are fetched synchronously
		 * @param fnModelInitialized
		 *            event triggered after model initialization
		 * @param oPropertyDefault
		 *            default data for properties
		 * @return instance of the property model
		 */
		constructor: function(sApplicationObjectName, vKey, oScope, bSync, fnModelInitialized, oPropertyDefault) {
			JSONModel.apply(this, []);
			if (fnModelInitialized) {
				this.attachEvent("modelInitialized", fnModelInitialized);
			}
			this.applicationObjectName = sApplicationObjectName;
			this.key = vKey;
			this.scope = oScope;
			this.syncRead = bSync;
			this.propertyDefault = oPropertyDefault;
			this.initDefault = false;
			this._load();
		},

		bindProperty: function(sPath, oContext, mParameters) {
			return JSONModel.prototype.bindProperty.apply(this, arguments);
		},

		_load: function() {
			var that = this;

			// Initialization
			if (!this.initDefault) {
				var oData = {
					nodes: {},
					actions: {}
				};
				if (this.scope.staticNodes) {
					jQuery.each(this.scope.staticNodes, function(i, sNodeName) {
						var bDefault = _readPropertyDefaultPath(that.propertyDefault, "readOnly", sNodeName);
						oData.nodes[sNodeName] = {
							readOnly: bDefault !== undefined ? bDefault : true,
							messages: []
						};
					});
				}
				if (this.scope.staticActions) {
					jQuery.each(this.scope.staticActions,
						function(i, vActionDef) {
							var sActionName = _getActionName(vActionDef);
							var bDefault = _readPropertyDefaultPath(that.propertyDefault, "enabled", undefined,
								sActionName);
							oData.actions[sActionName] = {
								enabled: bDefault !== undefined ? bDefault : false,
								messages: []
							};
						});
				}
				if (this.scope.nodes) {
					jQuery.each(this.scope.nodes, function(i, sNodeName) {
						var bDefault = _readPropertyDefaultPath(that.propertyDefault, "readOnly", sNodeName);
						oData.nodes[sNodeName] = {
							readOnly: bDefault !== undefined ? bDefault : true,
							messages: []
						};
						oData.nodes[sNodeName][that.key] = {
							readOnly: bDefault !== undefined ? bDefault : true,
							messages: []
						};
					});
				}
				if (this.scope.actions) {
					jQuery.each(this.scope.actions,
						function(i, vActionDef) {
							var sActionName = _getActionName(vActionDef);
							var bDefault = _readPropertyDefaultPath(that.propertyDefault, "enabled", undefined,
								sActionName);
							oData.actions[sActionName] = {
								enabled: bDefault !== undefined ? bDefault : false,
								messages: []
							};
						});
				}
				if (that.propertyDefault) {
					if (that.propertyDefault.nodes) {
						jQuery.each(that.propertyDefault.nodes, function(sNodeName, oNode) {
							var bDefault = oNode.readOnly;
							if (!oData.nodes[sNodeName]) {
								oData.nodes[sNodeName] = {
									readOnly: bDefault !== undefined ? bDefault : true,
									messages: []
								};
							}
						});
					}
					if (that.propertyDefault.actions) {
						jQuery.each(that.propertyDefault.actions, function(sActioneName, oAction) {
							var bDefault = oAction.enabled;
							if (!oData.actions[sActioneName]) {
								oData.actions[sActioneName] = {
									enabled: bDefault !== undefined ? bDefault : false,
									messages: []
								};
							}
						});
					}
				}
				this.setData(oData);
				this.initDefault = true;
			}
			var oDeferred = new jQuery.Deferred();
			this._oDataInitPromise = oDeferred.promise();
			_getProperties(this.applicationObjectName, this.key, this.scope, !this.syncRead, function(oProperties) {
				if (oProperties.properties && oProperties.properties[that.key]) {
					if (oProperties.properties[that.key].nodes) {
						jQuery.each(oProperties.properties[that.key].nodes, function(sNodeName, oNode) {
							// Optimization access for Root (duplicate data without key)
							if (sNodeName === Node.Root && oNode[that.key]) {
								jQuery.each(oNode[that.key], function(sProperty, oProperty) {
									oNode[sProperty] = oProperty;
								});
							}
							// Optimize access for Extension (duplicate data without key)
							if (sNodeName === Node.Extension) {
								var aKey = Object.keys(oNode);
								if (aKey.length === 1) {
									jQuery.each(oNode[aKey[0]], function(sProperty, oProperty) {
										oNode[sProperty] = oProperty;
									});
								}
							}
						});
						if (oProperties.properties[that.key].nodes) {
							jQuery.each(oProperties.properties[that.key].nodes, function(sNodeName, oNode) {
								that.setPropertyInternal("/nodes/" + sNodeName, oNode);
							});
						}
						if (oProperties.properties[that.key].actions) {
							jQuery.each(oProperties.properties[that.key].actions, function(sActionName, oAction) {
								that.setPropertyInternal("/actions/" + sActionName, oAction);
							});
						}
					}
				}
				if (oProperties.staticProperties) {
					if (oProperties.staticProperties.nodes) {
						jQuery.each(oProperties.staticProperties.nodes, function(sNodeName, oNode) {
							if (!that.getProperty("/nodes/" + sNodeName)) {
								that.setPropertyInternal("/nodes/" + sNodeName, oNode);
							}
						});
					}
					if (oProperties.staticProperties.actions) {
						jQuery.each(oProperties.staticProperties.actions, function(sActionName, oAction) {
							that.setPropertyInternal("/actions/" + sActionName, oAction);
						});
					}
				}
				oDeferred.resolve(that.getData());
				setTimeout(function() {
					that.fireEvent("modelInitialized");
				}, 0);
			});
		},

		setProperty: function() {
			// enforce that from outside nobody can change the properties
			// e.g. UI setting buttons explicitly to disabled
			return;
		},

		setPropertyInternal: function() {
			// Internal setter for properties
			JSONModel.prototype.setProperty.apply(this, arguments);
		},

		getNodeReadOnlyFormatter: function(sNodeName) {
			var that = this;
			return function(vKey) {
				vKey = vKey ? vKey : that.key;
				return !!that.getProperty("/nodes/" + sNodeName + "/" + vKey + "/readOnly");
			};
		},

		getNodeChangeableFormatter: function(sNodeName) {
			var that = this;
			return function(vKey) {
				vKey = vKey ? vKey : that.key;
				return !!that.getProperty("/nodes/" + sNodeName + "/" + vKey + "/changeable");
			};
		},

		getAttributeReadOnlyFormatter: function(sNodeName, sAttributeName) {
			var that = this;
			return function(vKey) {
				vKey = vKey ? vKey : that.key;
				return !!that.getProperty("/nodes/" + sNodeName + "/" + vKey + "/attributes/" +
					sAttributeName + "/readOnly");
			};
		},

		getAttributeChangeableFormatter: function(sNodeName, sAttributeName) {
			var that = this;
			return function(vKey) {
				vKey = vKey ? vKey : that.key;
				return !!that.getProperty("/nodes/" + sNodeName + "/" + vKey + "/attributes/" +
					sAttributeName + "/changeable");
			};
		},

		getActionEnabledFormatter: function(sActionName) {
			var that = this;
			return function(vKey) {
				return !!that.getProperty("/actions/" + sActionName + "/enabled");
			};
		},

		getStaticActionEnabledFormatter: function(sActionName) {
			return this.getActionEnabledFormatter(sActionName);
		},

		getProperties: function() {
			return this.getData();
		},

		sync: function(vKey, bSuppressInvalidateCache) {
			if (!bSuppressInvalidateCache) {
				PropertyModel.invalidateCachedProperties(this.applicationObjectName, this.key);
			}
			this.key = vKey || this.key;
			this._load();
		},

		getDataInitializedPromise: function() {
			return this._oDataInitPromise;
		}
	});

	function _getActionName(vActionDef) {
		if (typeof vActionDef === "object") {
			return Object.keys(vActionDef)[0];
		}
		return vActionDef;
	}

	function _getProperties(sApplicationObjectName, vKey, oScope, bAsync, fnSuccess) {
		var bReRead = false;
		var oProperty = oPropertiesCache.getProperty("/" + sApplicationObjectName);
		if (!oProperty) {
			oPropertiesCache.setProperty("/" + sApplicationObjectName, {
				nodes: {},
				actions: {}
			});
			bReRead = true;
		}
		if (vKey && (!oProperty || !oProperty[vKey])) {
			oPropertiesCache.setProperty("/" + sApplicationObjectName + "/" + vKey, {
				nodes: {},
				actions: {}
			});
			bReRead = true;
		} else {
			if (vKey) {
				if (!bReRead && oScope.nodes) {
					jQuery.each(oScope.nodes, function(iIndex, sNodeName) {
						if (!oPropertiesCache.getProperty("/" + sApplicationObjectName + "/" + vKey +
							"/nodes/" + sNodeName)) {
							bReRead = true;
						}
					});
				}
				if (!bReRead && oScope.actions) {
					jQuery.each(oScope.actions, function(iIndex, vActionDef) {
						if (typeof vActionDef === "object") {
							bReRead = true;
						} else {
							if (!oPropertiesCache.getProperty("/" + sApplicationObjectName + "/" + vKey +
								"/actions/" + vActionDef)) {
								bReRead = true;
							}
						}
					});
				}
			} else {
				if (!bReRead && oScope.staticNodes) {
					jQuery.each(oScope.staticNodes, function(iIndex, sNodeName) {
						if (!oPropertiesCache.getProperty("/" + sApplicationObjectName + "/nodes/" + sNodeName)) {
							bReRead = true;
						}
					});
				}
				if (!bReRead && !jQuery.isEmptyObject(oScope.staticActions)) {
					// Re-read static actions always, as static action parameters cannot be buffered
					bReRead = true;
				}
			}
		}
		var oSyncResult = {
			properties: {},
			staticProperties: {}
		};
		if (bReRead) {
			// Scope changed, trigger re-read
			_readProperties(sApplicationObjectName, vKey, oScope, bAsync).done(function(oNewProperty) {
				// Merge cache
				if (oNewProperty.properties) {
					var oNewProperties = oNewProperty.properties[vKey];
					if (oNewProperties) {
						if (oNewProperties.nodes) {
							jQuery.each(oNewProperties.nodes, function(sNodeName, oNode) {
								oPropertiesCache.setProperty("/" + sApplicationObjectName + "/" + vKey +
									"/nodes/" + sNodeName, oNode);
							});
						}
						if (oNewProperties.actions) {
							jQuery.each(oNewProperties.actions, function(sActionName, oAction) {
								oPropertiesCache.setProperty("/" + sApplicationObjectName + "/" + vKey +
									"/actions/" + sActionName, oAction);
							});
						}
					}
					oSyncResult.properties = oNewProperty.properties;
				}
				if (oNewProperty.staticProperties) {
					var oNewStaticProperties = oNewProperty.staticProperties;
					if (oNewStaticProperties) {
						if (oNewStaticProperties.nodes) {
							jQuery.each(oNewStaticProperties.nodes, function(sNodeName, oNode) {
								oPropertiesCache.setProperty("/" + sApplicationObjectName + "/nodes/" + sNodeName,
									oNode);
							});
						}
						if (oNewStaticProperties.actions) {
							jQuery.each(oNewStaticProperties.actions, function(sActionName, oAction) {
								oPropertiesCache.setProperty("/" + sApplicationObjectName + "/actions/" + sActionName,
									oAction);
							});
						}
					}
					oSyncResult.staticProperties = oNewProperty.staticProperties;
				}
				oPropertiesCache.fireEvent("modelCacheUpdated", oNewProperty);
				if (fnSuccess) {
					fnSuccess(oNewProperty);
				}
			});
		} else {
			if (vKey) {
				oSyncResult.properties[vKey] = oProperty[vKey];
			}
			oSyncResult.staticProperties = {
				nodes: oProperty.nodes,
				actions: oProperty.actions
			};
			if (fnSuccess) {
				fnSuccess({
					properties: oSyncResult.properties,
					staticProperties: oSyncResult.staticProperties
				});
			}
		}
		return oSyncResult;
	}

	function _readProperties(sApplicationObjectName, vKey, oScope, bAsync) {
		var aUrlParam, sUrlParam;
		var sEndpoint = MetaModel.getEndpoint(sApplicationObjectName);

		var bReadProperties = vKey && vKey > 0 && ((!!oScope.nodes && oScope.nodes.length > 0) || (!!oScope.actions && oScope.actions.length > 0));
		var bReadStaticProperties = (!!oScope.staticNodes && oScope.staticNodes.length > 0) || (!!oScope.staticActions && oScope.staticActions.length >
			0);

		// Nodes and Actions
		var oPropertiesRequest;
		if (bReadProperties) {
			aUrlParam = [];
			if (oScope.nodes) {
				jQuery.each(oScope.nodes, function(iIndex, sNodeName) {
					aUrlParam.push("node=" + sNodeName);
				});
			}
			if (oScope.actions) {
				jQuery.each(oScope.actions, function(iIndex, vActionDef) {
					if (typeof vActionDef === "object") {
						aUrlParam.push("action=" + encodeURI(JSON.stringify(vActionDef)));
					} else {
						aUrlParam.push("action=" + vActionDef);
					}
				});
			}
			sUrlParam = aUrlParam.length > 0 ? "?" + aUrlParam.join("&") : "";

			oPropertiesRequest = jQuery.ajax({
				url: sEndpoint + "/" + vKey + "/properties" + sUrlParam,
				async: bAsync,
				dataType: "json"
			});

			oPropertiesRequest.fail(function() {
				jQuery.sap.log.debug("Property request failed");
			});
		}

		// Static Nodes and Static Actions
		var oStaticPropertiesRequest;
		if (bReadStaticProperties) {
			aUrlParam = [];
			if (oScope.staticNodes) {
				jQuery.each(oScope.staticNodes, function(iIndex, sNodeName) {
					aUrlParam.push("node=" + sNodeName);
				});
			}
			if (oScope.staticActions) {
				jQuery.each(oScope.staticActions, function(iIndex, vActionDef) {
					if (typeof vActionDef === "object") {
						aUrlParam.push("action=" + encodeURI(JSON.stringify(vActionDef)));
					} else {
						aUrlParam.push("action=" + vActionDef);
					}
				});
			}
			sUrlParam = aUrlParam.length > 0 ? "?" + aUrlParam.join("&") : "";

			oStaticPropertiesRequest = jQuery.ajax({
				url: sEndpoint + "/staticProperties" + sUrlParam,
				async: bAsync,
				dataType: "json"
			});

			oStaticPropertiesRequest.fail(function() {
				jQuery.sap.log.debug("Static property request failed");
			});
		}
		var oDeferred = new jQuery.Deferred();

		jQuery.when(oPropertiesRequest, oStaticPropertiesRequest).done(function(aPropertiesResult, aStaticPropertiesResult) {
			var oResult = {};
			if (aPropertiesResult && aPropertiesResult.length > 0) {
				var oProperties = aPropertiesResult[0];
				if (oProperties) {
					if (oProperties[vKey] && oProperties[vKey].nodes) {
						jQuery.each(oProperties[vKey].nodes, function(sNodeName, oNode) {
							jQuery.each(oNode, function(vKey, oInstance) {
								oInstance.changeable = !oInstance.readOnly;
								jQuery.each(oInstance.attributes, function(sAttributeName, oAttribute) {
									oAttribute.changeable = !oAttribute.readOnly;
								});
							});
						});
					}
					oResult.properties = oProperties;
				}
			}
			if (aStaticPropertiesResult && aStaticPropertiesResult.length > 0) {
				var oStaticProperties = aStaticPropertiesResult[0];
				if (oStaticProperties) {
					if (oStaticProperties.nodes) {
						jQuery.each(oStaticProperties.nodes, function(sNodeName, oNode) {
							oNode.changeable = !oNode.readOnly;
							jQuery.each(oNode.attributes, function(sAttributeName, oAttribute) {
								oAttribute.changeable = !oAttribute.readOnly;
							});
						});
					}
					oResult.staticProperties = oStaticProperties;
				}
			}
			oDeferred.resolve(oResult);
		});

		return oDeferred.promise();
	}

	function _readPropertyPath(oProperties, sProperty, vKey, sNodeName, vNodeKey, sAttributeName, sActionName) {
		if (vKey) {
			if (oProperties.properties && oProperties.properties[vKey]) {
				var oInstance = oProperties.properties[vKey];
				if (sActionName && oInstance.actions && oInstance.actions[sActionName]) {
					var oAction = oInstance.actions[sActionName];
					return oAction[sProperty];
				} else if (sNodeName && oInstance.nodes && oInstance.nodes[sNodeName] &&
					oInstance.nodes[sNodeName][vNodeKey]) {
					var oNode = oInstance.nodes[sNodeName][vNodeKey];
					if (sAttributeName && oNode.attributes && oNode.attributes[sAttributeName]) {
						var oAttribute = oNode.attributes[sAttributeName];
						return oAttribute[sProperty];
					} else {
						return oNode[sProperty];
					}
				}
			}
		} else {
			if (sActionName && oProperties.staticProperties && oProperties.staticProperties.actions &&
				oProperties.staticProperties.actions[sActionName]) {
				var oStaticAction = oProperties.staticProperties.actions[sActionName];
				return oStaticAction[sProperty];
			} else if (sNodeName && oProperties.staticProperties && oProperties.staticProperties.nodes &&
				oProperties.staticProperties.nodes[sNodeName]) {
				var oStaticNode = oProperties.staticProperties.nodes[sNodeName];
				return oStaticNode[sProperty];
			}
		}
		return undefined;
	}

	function _readPropertyDefaultPath(oProperties, sProperty, sNodeName, sActionName) {
		if (oProperties) {
			if (sActionName && oProperties.actions && oProperties.actions[sActionName]) {
				var oAction = oProperties.actions[sActionName];
				return oAction[sProperty];
			} else if (sNodeName && oProperties.nodes && oProperties.nodes[sNodeName]) {
				var oNode = oProperties.nodes[sNodeName];
				return oNode[sProperty];
			}
		}
		return undefined;
	}

	PropertyModel.getNodeReadOnlyStaticFormatter = function(sApplicationObjectName, sNodeName) {
		return function(vKey, vNodeKey) {
			var oProperties = _getProperties(sApplicationObjectName, vKey, {
				nodes: [sNodeName]
			}, false);
			return !!_readPropertyPath(oProperties, "readOnly", vKey, sNodeName, vNodeKey || vKey);
		};
	};

	PropertyModel.getNodeChangeableStaticFormatter = function(sApplicationObjectName, sNodeName) {
		return function(vKey, vNodeKey) {
			var oProperties = _getProperties(sApplicationObjectName, vKey, {
				nodes: [sNodeName]
			}, false);
			return !!_readPropertyPath(oProperties, "changeable", vKey, sNodeName, vNodeKey || vKey);
		};
	};

	PropertyModel.getAttributeReadOnlyStaticFormatter = function(sApplicationObjectName,
		sNodeName, sAttributeName) {
		return function(vKey, vNodeKey) {
			var oProperties = _getProperties(sApplicationObjectName, vKey, {
				nodes: [sNodeName]
			}, false);
			return !!_readPropertyPath(oProperties, "readOnly", vKey, sNodeName, vNodeKey || vKey, sAttributeName);
		};
	};

	PropertyModel.getAttributeChangeableStaticFormatter = function(sApplicationObjectName,
		sNodeName, sAttributeName) {
		return function(vKey, vNodeKey) {
			var oProperties = _getProperties(sApplicationObjectName, vKey, {
				nodes: [sNodeName]
			}, false);
			return !!_readPropertyPath(oProperties, "changeable", vKey, sNodeName, vNodeKey || vKey, sAttributeName);
		};
	};

	PropertyModel.getActionEnabledStaticFormatter = function(sApplicationObjectName, sActionName, oParameter) {
		var bResult;
		var sResultContext;
		var fnParameter = typeof oParameter === "function" ? oParameter : undefined;
		return function(vKey, vNodeKey) {
			if (fnParameter) {
				if (!vKey) {
					return false;
				}
				oParameter = fnParameter(vKey, vNodeKey || vKey);
			}
			var sContext = JSON.stringify({
				key: vKey,
				parameter: oParameter
			});
			if (sResultContext === sContext && bResult !== undefined) {
				return bResult;
			}
			sResultContext = sContext;
			var oAction = null;
			if (oParameter) {
				oAction = {};
				oAction[sActionName] = oParameter;
			} else {
				oAction = sActionName;
			}
			var oProperties = _getProperties(sApplicationObjectName, vKey, {
				actions: [oAction]
			}, false);
			bResult = !!_readPropertyPath(oProperties, "enabled", vKey, undefined, undefined, undefined, sActionName);
			return bResult;
		};
	};

	PropertyModel.getStaticActionEnabledStaticFormatter = function(sApplicationObjectName,
		sActionName, oParameter) {
		var bResult;
		var sResultContext;
		var fnParameter = typeof oParameter === "function" ? oParameter : undefined;
		return function(vKey, vNodeKey) {
			if (fnParameter) {
				if (!vKey) {
					return false;
				}
				oParameter = fnParameter(vKey, vNodeKey || vKey);
			}
			var sContext = JSON.stringify({
				parameter: oParameter
			});
			if (sResultContext === sContext && bResult !== undefined) {
				return bResult;
			}
			sResultContext = sContext;
			var oStaticAction = {};
			oStaticAction[sActionName] = oParameter;
			var oProperties = _getProperties(sApplicationObjectName, undefined, {
				staticActions: [oStaticAction]
			}, false);
			bResult = !!_readPropertyPath(oProperties, "enabled", undefined, undefined, undefined, undefined, sActionName);
			return bResult;
		};
	};

	PropertyModel.getStaticActionEnabledDynamicFormatter = function(sApplicationObjectName,
		sActionName, oParameter) {
		var fnParameter = typeof oParameter === "function" ? oParameter : undefined;
		return function(vKey, vNodeKey) {
			var bResult;

			if (fnParameter) {
				if (!vKey) {
					return false;
				}
				oParameter = fnParameter(vKey, vNodeKey || vKey);
			}
			
			var oStaticAction = {};
			oStaticAction[sActionName] = oParameter;
			var oProperties = _getProperties(sApplicationObjectName, undefined, {
				staticActions: [oStaticAction]
			}, false);
			bResult = !!_readPropertyPath(oProperties, "enabled", undefined, undefined, undefined, undefined, sActionName);
			return bResult;
		};
	};

	PropertyModel.getCacheModel = function() {
		return oPropertiesCache;
	};

	PropertyModel.getCachedProperties = function(sApplicationObjectName) {
		if (!sApplicationObjectName) {
			return oPropertiesCache.getData();
		} else {
			return oPropertiesCache.getProperty("/" + sApplicationObjectName);
		}
	};

	PropertyModel.invalidateCachedProperties = function(sApplicationObjectName, vKey) {
		if (!vKey) {
			if (sApplicationObjectName) {
				var oData = oPropertiesCache.getData();
				delete oData[sApplicationObjectName];
				oPropertiesCache.setData(oData);
			} else {
				oPropertiesCache.setData({});
			}
		} else {
			var oProperty = oPropertiesCache.getProperty("/" + sApplicationObjectName);
			if (oProperty) {
				if (jQuery.isArray(vKey)) {
					jQuery.each(vKey, function(iIndex, vAKey) {
						delete oProperty[vAKey];
					});
				} else {
					delete oProperty[vKey];
				}
				oPropertiesCache.setProperty("/" + sApplicationObjectName, oProperty);
			}
		}
		oPropertiesCache.fireEvent("modelCacheInvalidated", {
			applicationObjectName: sApplicationObjectName,
			key: vKey
		});
	};

	PropertyModel.refresh = function() {
		PropertyModel.invalidateCachedProperties();
	};

	PropertyModel.setMetaModel = function(oMetaModel) {
		MetaModel = oMetaModel;
	};

	return PropertyModel;
});