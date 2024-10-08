/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.core.PropertyModel");

(function() {
    "use strict";
    
    jQuery.sap.require("sap.ui.ino.models.core.MetaModel");
    jQuery.sap.require("sap.ui.ino.models.core.PropertyModelCache");
    
    var Node = {
        Root : "Root",
        Extension : "Extension"
    };

    var oPropertiesCache = new sap.ui.ino.models.core.PropertyModelCache({});
    
    sap.ui.model.json.JSONModel.extend("sap.ui.ino.models.core.PropertyModel", {

        metadata : {
            events : {
                "modelInitialized" : {},
                "modelModified" : {}
            }
        },

        /**
         * @param sApplicationObjectName
         *            name of the application object
         * @param vKey
         *            key of the application object instance
         * @param oScope
         *            scope object definition, e.g. the { nodes : ["Root"], actions : ["update", { "customAction" : { "A" : 1 } }], 
         *            staticActions : [ { "create" : { "IDEA_ID" : 1 } } } ]
         * @param bSync
         *            properties are fetched synchronously
         * @param fnModelInitialized
         *            event triggered after model initialization
         * @param oPropertyDefault
         *            default data for properties
         * @return instance of the property model
         */
        constructor : function(sApplicationObjectName, vKey, oScope, bSync, fnModelInitialized, oPropertyDefault) {
            sap.ui.model.json.JSONModel.apply(this, []);
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

        bindProperty : function(sPath, oContext, mParameters) {
            return sap.ui.model.json.JSONModel.prototype.bindProperty.apply(this, arguments);
        },

        _load : function() {
            var that = this;
            var initCount = 0;
            // Initialization
            if (!this.initDefault) {
                var oData = {
                    nodes : {},
                    actions : {}
                };
                if (this.scope.staticNodes) {
                    jQuery.each(this.scope.staticNodes, function(i, sNodeName) {
                        var bDefault = _readPropertyDefaultPath(that.propertyDefault, "readOnly", sNodeName);
                        oData.nodes[sNodeName] = {
                            readOnly : bDefault != undefined ? bDefault : true,
                            messages : []
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
                                    enabled : bDefault != undefined ? bDefault : false,
                                    messages : []
                                };
                            });
                }
                if (this.scope.nodes) {
                    jQuery.each(this.scope.nodes, function(i, sNodeName) {
                        var bDefault = _readPropertyDefaultPath(that.propertyDefault, "readOnly", sNodeName);
                        oData.nodes[sNodeName] = {
                            readOnly : bDefault != undefined ? bDefault : true,
                            messages : []
                        };
                        oData.nodes[sNodeName][that.key] = {
                            readOnly : bDefault != undefined ? bDefault : true,
                            messages : []
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
                                    enabled : bDefault != undefined ? bDefault : false,
                                    messages : []
                                };
                            });
                }
                if (that.propertyDefault) {
                    if (that.propertyDefault.nodes) {
                        jQuery.each(that.propertyDefault.nodes, function(sNodeName, oNode) {
                            var bDefault = oNode.readOnly;
                            if (!oData.nodes[sNodeName]) {
                                oData.nodes[sNodeName] = {
                                    readOnly : bDefault != undefined ? bDefault : true,
                                    messages : []
                                };
                            }
                        });
                    }
                    if (that.propertyDefault.actions) {
                        jQuery.each(that.propertyDefault.actions, function(sActioneName, oAction) {
                            var bDefault = oAction.enabled;
                            if (!oData.actions[sActioneName]) {
                                oData.actions[sActioneName] = {
                                    enabled : bDefault != undefined ? bDefault : false,
                                    messages : []
                                };
                            }
                        });
                    }
                }
                this.setData(oData);
                this.initDefault = true;
            }
            _getProperties(this.applicationObjectName, this.key, this.scope, !this.syncRead, function(oProperties,
                    iRequestCount) {
                if (oProperties.properties && oProperties.properties[that.key]) {
                    if (oProperties.properties[that.key].nodes) {
                        jQuery.each(oProperties.properties[that.key].nodes, function(sNodeName, oNode) {
                            // Optimization access for Root (duplicate data without key)
                            if (sNodeName == Node.Root && oNode[that.key]) {
                                jQuery.each(oNode[that.key], function(sProperty, oProperty) {
                                    oNode[sProperty] = oProperty;
                                });
                            }
                            // Optimize access for Extension (duplicate data without key)
                            if (sNodeName == Node.Extension) {
                                var aKey = Object.keys(oNode);
                                if (aKey.length == 1) {
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

                initCount++;
                if (initCount == iRequestCount) {
                    that.fireEvent("modelInitialized");
                }
            });
        },

        setProperty : function() {
            // enforce that from outside nobody can change the properties
            // e.g. UI setting buttons explicitly to disabled
            return;
        },

        setPropertyInternal : function() {
            // Internal setter for properties
            sap.ui.model.json.JSONModel.prototype.setProperty.apply(this, arguments);
        },

        getNodeReadOnlyFormatter : function(sNodeName) {
            var that = this;
            return function(vKey) {
                vKey = vKey ? vKey : that.key;
                return !!that.getProperty("/nodes/" + sNodeName + "/" + vKey + "/readOnly");
            };
        },

        getNodeChangeableFormatter : function(sNodeName) {
            var that = this;
            return function(vKey) {
                vKey = vKey ? vKey : that.key;
                return !!that.getProperty("/nodes/" + sNodeName + "/" + vKey + "/changeable");
            };
        },

        getAttributeReadOnlyFormatter : function(sNodeName, sAttributeName) {
            var that = this;
            return function(vKey) {
                vKey = vKey ? vKey : that.key;
                return !!that.getProperty("/nodes/" + sNodeName + "/" + vKey + "/attributes/" + sAttributeName
                        + "/readOnly");
            };
        },

        getAttributeChangeableFormatter : function(sNodeName, sAttributeName) {
            var that = this;
            return function(vKey) {
                vKey = vKey ? vKey : that.key;
                return !!that.getProperty("/nodes/" + sNodeName + "/" + vKey + "/attributes/" + sAttributeName
                        + "/changeable");
            };
        },

        getActionEnabledFormatter : function(sActionName) {
        	var that = this;
            return function(vKey) {
                return !!that.getProperty("/actions/" + sActionName + "/enabled");
            };
        },

        getStaticActionEnabledFormatter : function(sActionName) {
            return this.getActionEnabledFormatter(sActionName);
        },

        getProperties : function() {
            return this.getData();
        },

        sync : function(vKey) {
            sap.ui.ino.models.core.PropertyModel.invalidateCachedProperties(this.applicationObjectName, this.key);
            this.key = vKey || this.key;
            this._load();
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
                nodes : {},
                actions : {}
            });
            bReRead = true;
        }
        if (vKey && (!oProperty || !oProperty[vKey])) {
            oPropertiesCache.setProperty("/" + sApplicationObjectName + "/" + vKey, {
                nodes : {},
                actions : {}
            });
            bReRead = true;
        } else {
            if (vKey) {
                if (!bReRead && oScope.nodes) {
                    jQuery.each(oScope.nodes, function(iIndex, sNodeName) {
                        if (!oPropertiesCache.getProperty("/" + sApplicationObjectName + "/" + vKey + "/nodes/"
                                + sNodeName)) {
                            bReRead = true;
                        }
                    });
                }
                if (!bReRead && oScope.actions) {
                    jQuery.each(oScope.actions, function(iIndex, vActionDef) {
                        if (typeof vActionDef === "object") {
                            bReRead = true;
                        } else {
                            if (!oPropertiesCache.getProperty("/" + sApplicationObjectName + "/" + vKey + "/actions/"
                                    + vActionDef)) {
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
            properties : {},
            staticProperties : {}
        };
        if (bReRead) {
            // Scope changed, trigger re-read
            _readProperties(sApplicationObjectName, vKey, oScope, bAsync, function(oNewProperty, iRequestCount) {
                // Merge cache
                if (oNewProperty.properties) {
                    var oNewProperties = oNewProperty.properties[vKey];
                    if (oNewProperties) {
                        if (oNewProperties.nodes) {
                            jQuery.each(oNewProperties.nodes, function(sNodeName, oNode) {
                                oPropertiesCache.setProperty("/" + sApplicationObjectName + "/" + vKey + "/nodes/"
                                        + sNodeName, oNode);
                            });
                        }
                        if (oNewProperties.actions) {
                            jQuery.each(oNewProperties.actions, function(sActionName, oAction) {
                                oPropertiesCache.setProperty("/" + sApplicationObjectName + "/" + vKey + "/actions/"
                                        + sActionName, oAction);
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
                    fnSuccess(oNewProperty, iRequestCount);
                }
            });
        } else {
            if (vKey) {
                oSyncResult.properties[vKey] = oProperty[vKey];
            }
            oSyncResult.staticProperties = {
                nodes : oProperty.nodes,
                actions : oProperty.actions
            };
            if (fnSuccess) {
                fnSuccess({
                    properties : oSyncResult.properties
                }, 2);
            }
            if (fnSuccess) {
                fnSuccess({
                    staticProperties : oSyncResult.staticProperties
                }, 2);
            }
        }
        return oSyncResult;
    }

    function _readProperties(sApplicationObjectName, vKey, oScope, bAsync, fnSuccess) {
        var sEndpoint = sap.ui.ino.models.core.MetaModel.getEndpoint(sApplicationObjectName);

        var bReadProperties = vKey && vKey > 0 && (oScope.nodes || oScope.actions);
        var bReadStaticProperties = !!oScope.staticNodes || !!oScope.staticActions;
        var iRequestCount = (bReadProperties ? 1 : 0) + (bReadStaticProperties ? 1 : 0);

        if (iRequestCount == 0) {
            fnSuccess({}, 1);
            return;
        }

        // Nodes and Actions
        if (bReadProperties) {
            var aUrlParam = [];
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
            var sUrlParam = aUrlParam.length > 0 ? "?" + aUrlParam.join("&") : "";

            var oPropertiesRequest = jQuery.ajax({
                url : sEndpoint + "/" + vKey + "/properties" + sUrlParam,
                async : bAsync,
                dataType : "json"
            });

            oPropertiesRequest.done(function(oProperties) {
                if (oProperties && oProperties[vKey] && oProperties[vKey].nodes) {
                    jQuery.each(oProperties[vKey].nodes, function(sNodeName, oNode) {
                        jQuery.each(oNode, function(vKey, oInstance) {
                            oInstance.changeable = !oInstance.readOnly;
                            jQuery.each(oInstance.attributes, function(sAttributeName, oAttribute) {
                                oAttribute.changeable = !oAttribute.readOnly;
                            });
                        });
                    });
                }
                if (fnSuccess) {
                    fnSuccess({
                        properties : oProperties
                    }, iRequestCount);
                }
            });

            oPropertiesRequest.fail(function() {
                jQuery.sap.log.debug("Property request failed");
            });
        }

        // Static Nodes and Static Actions
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

            var oStaticPropertiesRequest = jQuery.ajax({
                url : sEndpoint + "/staticProperties" + sUrlParam,
                async : bAsync,
                dataType : "json"
            });

            oStaticPropertiesRequest.done(function(oStaticProperties) {
                if (oStaticProperties && oStaticProperties.nodes) {
                    jQuery.each(oStaticProperties.nodes, function(sNodeName, oNode) {
                        oNode.changeable = !oNode.readOnly;
                        jQuery.each(oNode.attributes, function(sAttributeName, oAttribute) {
                            oAttribute.changeable = !oAttribute.readOnly;
                        });
                    });
                }
                if (fnSuccess) {
                    fnSuccess({
                        staticProperties : oStaticProperties
                    }, iRequestCount);
                }
            });

            oStaticPropertiesRequest.fail(function() {
                jQuery.sap.log.debug("Static property request failed");
            });
        }
    }

    function _readPropertyPath(oProperties, sProperty, vKey, sNodeName, vNodeKey, sAttributeName, sActionName) {
        if (vKey) {
            if (oProperties.properties && oProperties.properties[vKey]) {
                var oInstance = oProperties.properties[vKey];
                if (sActionName && oInstance.actions && oInstance.actions[sActionName]) {
                    var oAction = oInstance.actions[sActionName];
                    return oAction[sProperty];
                } else if (sNodeName && oInstance.nodes && oInstance.nodes[sNodeName]
                        && oInstance.nodes[sNodeName][vNodeKey]) {
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
            if (sActionName && oProperties.staticProperties && oProperties.staticProperties.actions
                    && oProperties.staticProperties.actions[sActionName]) {
                var oStaticAction = oProperties.staticProperties.actions[sActionName];
                return oStaticAction[sProperty];
            } else if (sNodeName && oProperties.staticProperties && oProperties.staticProperties.nodes
                    && oProperties.staticProperties.nodes[sNodeName]) {
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

    sap.ui.ino.models.core.PropertyModel.getNodeReadOnlyStaticFormatter = function(sApplicationObjectName, sNodeName) {
        return function(vKey, vNodeKey) {
            var oProperties = _getProperties(sApplicationObjectName, vKey, {
                nodes : [sNodeName]
            }, false);
            return !!_readPropertyPath(oProperties, "readOnly", vKey, sNodeName, vNodeKey || vKey);
        };
    };

    sap.ui.ino.models.core.PropertyModel.getNodeChangeableStaticFormatter = function(sApplicationObjectName, sNodeName) {
        return function(vKey, vNodeKey) {
            var oProperties = _getProperties(sApplicationObjectName, vKey, {
                nodes : [sNodeName]
            }, false);
            return !!_readPropertyPath(oProperties, "changeable", vKey, sNodeName, vNodeKey || vKey);
        };
    };

    sap.ui.ino.models.core.PropertyModel.getAttributeReadOnlyStaticFormatter = function(sApplicationObjectName,
            sNodeName, sAttributeName) {
        return function(vKey, vNodeKey) {
            var oProperties = _getProperties(sApplicationObjectName, vKey, {
                nodes : [sNodeName]
            }, false);
            return !!_readPropertyPath(oProperties, "readOnly", vKey, sNodeName, vNodeKey || vKey, sAttributeName);
        };
    };

    sap.ui.ino.models.core.PropertyModel.getAttributeChangeableStaticFormatter = function(sApplicationObjectName,
            sNodeName, sAttributeName) {
        return function(vKey, vNodeKey) {
            var oProperties = _getProperties(sApplicationObjectName, vKey, {
                nodes : [sNodeName]
            }, false);
            return !!_readPropertyPath(oProperties, "changeable", vKey, sNodeName, vNodeKey || vKey, sAttributeName);
        };
    };

    sap.ui.ino.models.core.PropertyModel.getActionEnabledStaticFormatter = function(sApplicationObjectName, sActionName, oParameter) {
        var fnParameter = typeof oParameter === "function" ? oParameter : undefined;
        return function(vKey, vNodeKey) {
            if (fnParameter) {
                if (!vKey) {
                    return false;
                }
                oParameter = fnParameter(vKey, vNodeKey || vKey);
            }
            var oAction = null;
            if (oParameter) {
                oAction = {};
                oAction[sActionName] = oParameter;
            } else {
                oAction = sActionName;
            }
            var oProperties = _getProperties(sApplicationObjectName, vKey, {
                actions : [oAction]
            }, false);
            return !!_readPropertyPath(oProperties, "enabled", vKey, undefined, undefined, undefined, sActionName);
        };
    };

    sap.ui.ino.models.core.PropertyModel.getStaticActionEnabledStaticFormatter = function(sApplicationObjectName,
            sActionName, oParameter) {
        var fnParameter = typeof oParameter === "function" ? oParameter : undefined;
        return function(vKey, vNodeKey) {
            if (fnParameter) {
                if (!vKey) {
                    return false;
                }
                oParameter = fnParameter(vKey, vNodeKey || vKey);
            }
            var oStaticAction = {};
            oStaticAction[sActionName] = oParameter;
            var oProperties = _getProperties(sApplicationObjectName, undefined, {
                staticActions : [oStaticAction]
            }, false);
            return !!_readPropertyPath(oProperties, "enabled", undefined, undefined, undefined, undefined, sActionName);
        };
    };

    sap.ui.ino.models.core.PropertyModel.getCacheModel = function() {
        return oPropertiesCache;
    };

    sap.ui.ino.models.core.PropertyModel.getCachedProperties = function(sApplicationObjectName) {
        if (!sApplicationObjectName) {
            return oPropertiesCache.getData();
        } else {
            return oPropertiesCache.getProperty("/" + sApplicationObjectName);
        }
    };

    sap.ui.ino.models.core.PropertyModel.invalidateCachedProperties = function(sApplicationObjectName, vKey) {
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
            applicationObjectName : sApplicationObjectName,
            key : vKey
        });
    };
    
    sap.ui.ino.models.core.PropertyModel.refresh = function() {
        sap.ui.ino.models.core.PropertyModel.invalidateCachedProperties();
    };
}());