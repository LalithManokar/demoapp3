/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.core.ApplicationObject");

(function() {
    "use strict";

    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObjectChange");
    jQuery.sap.require("sap.ui.ino.models.core.InvalidationManager");
    jQuery.sap.require("sap.ui.ino.models.core.PropertyModel");
    jQuery.sap.require("sap.ui.ino.models.util.Ajax");

    var ObjectType = {
        Standard: "STANDARD",
        Configuration: "CONFIGURATION",
        Stage: "STAGE",
        SystemConfiguration: "SYSTEM_CONFIGURATION"
    };

    var Node = {
        Root: "Root"
    };

    var Action = {
        Create: "create",
        Copy: "copy",
        Update: "update",
        Del: "del",
        Modify: "modify"
    };

    var oMetaModel = null;

    sap.ui.model.json.JSONModel.extend("sap.ui.ino.models.core.ApplicationObject", {
        constructor: function(vKey, oSettings) {
            sap.ui.model.json.JSONModel.apply(this, []);
            this._initKey = vKey;
            this._continuousUse = (oSettings && oSettings.continuousUse) || false;
            this._oSettings = oSettings;
            this._oReadSourceSettings = oSettings && oSettings.readSource;
            this._bLastBackendSyncSuppressed = false;
            if (vKey === undefined || (jQuery.isNumeric(vKey) && vKey <= 0)) {
                vKey = {};
            }
            if (!vKey || isPlainObject(vKey)) {
                var oDefaultData = undefined;
                if (isPlainObject(vKey)) {
                    oDefaultData = vKey;
                }
                initCreateData(this, oDefaultData);
                initPropertyModel(vKey, this, {
                    actions: oSettings && oSettings.actions,
                    staticActions: oSettings && oSettings.staticActions,
                    nodes: oSettings && oSettings.nodes
                }, oDefaultData);
            } else {
                initUpdateData(this, vKey);
                var oDefaultData = {};
                var oMetadata = this.getApplicationObjectMetadata();
                oDefaultData[oMetadata.nodes.Root.primaryKey] = vKey;
                initPropertyModel(vKey, this, {
                    actions: oSettings && oSettings.actions,
                    staticActions: oSettings && oSettings.staticActions,
                    nodes: oSettings && oSettings.nodes
                }, oDefaultData);
            }
        }
    });

    sap.ui.ino.models.core.ApplicationObject.ObjectType = ObjectType;
    sap.ui.ino.models.core.ApplicationObject.Action = Action;
    sap.ui.ino.models.core.ApplicationObject.Node = Node;

    var fnDefaultExtend = sap.ui.ino.models.core.ApplicationObject.extend;
    sap.ui.ino.models.core.ApplicationObject.extend = function(sClass, oClassInfo) {
        jQuery.sap.assert(oClassInfo.objectName, "objectName needs to be defined");

        jQuery.sap.require("sap.ui.ino.models.core.MetaModel");
        if (!oMetaModel) {
            oMetaModel = sap.ui.ino.models.core.MetaModel;
        }

        var oMetadata = oMetaModel.getApplicationObjectMetadata(oClassInfo.objectName);

        jQuery.sap.assert(oMetadata, "Metadata for object " + oClassInfo.objectName + " not available");
        if (!oMetadata) {
            fnDefaultExtend.call(this, sClass, oClassInfo);
            return;
        }
        var oApplicationObject = fnDefaultExtend.call(this, sClass, oClassInfo);

        oApplicationObject.prototype.getApplicationObject = function() {
            return oApplicationObject;
        };

        // getMetadata is already taken by UI5 :-)
        oApplicationObject.getApplicationObjectMetadata = function() {
            return oMetadata;
        };

        oApplicationObject.getObjectName = function() {
            return oClassInfo.objectName;
        };

        oApplicationObject.getEndpointURL = oApplicationObject.prototype.getEndpointURL = function() {
            return oMetaModel.getEndpoint(oClassInfo.objectName);
        };

        oApplicationObject.readData = function(vKey, oSettings) {
            return oApplicationObject.readSource(vKey, oApplicationObject.getObjectName(), oApplicationObject.getApplicationObjectMetadata(), oSettings);
        };

        // remembers action call stack action
        // to be able to recognize internal and external calls
        var iActionCallLevel = 0;
        oApplicationObject.beginAction = function() {
            iActionCallLevel++;
        };

        oApplicationObject.endAction = function() {
            iActionCallLevel--;
        };

        oApplicationObject.isInitiatingAction = function() {
            return iActionCallLevel === 1;
        };

        oApplicationObject.process = process;
        oApplicationObject.parseResponse = parseResponse;
        oApplicationObject.registerDirtyObject = registerDirtyObject;

        var oActionMethods = getActionMethods(oApplicationObject);
        jQuery.extend(oApplicationObject.prototype, oActionMethods.instanceMethods);
        jQuery.extend(oApplicationObject, oActionMethods.staticMethods, oClassInfo);

        return oApplicationObject;
    };

    function isPlainObject(oObject) {
        if (!oObject) {
            return false;
        };
        return oObject.constructor === Object;
    }

    function getActionName(vActionDef) {
        if (typeof vActionDef === "object") {
            return Object.keys(vActionDef)[0];
        }
        return vActionDef;
    }

    function visitDataTree(oData, sNodeName, fnVisit, oParent, oContext) {
        if (!isPlainObject(oData)) {
            return;
        }

        fnVisit(oData, sNodeName, oParent, oContext);
        var oNewContext;
        if(fnVisit.length >= 4){
                oNewContext = jQuery.extend(true, {}, oContext, {
                parentNodeName: sNodeName,
                parentData: oData
            });
        }
        jQuery.each(oData, function(sName, oValue) {
            if (jQuery.isArray(oValue)) {
                jQuery.each(oValue, function(iIndex, oArrayElement) {
                    visitDataTree(oArrayElement, sName, fnVisit, oValue, oNewContext);
                });
            } else {
                visitDataTree(oValue, sNodeName, fnVisit, oParent, oNewContext);
            }
        });
    }

    function visitNodeDataTree(oData, sNodeName, fnVisit, oParent, oContext) {
        if (!isPlainObject(oData) && !jQuery.isArray(oData)) {
            return;
        }
        fnVisit(jQuery.isArray(oData) ? oData : [oData], sNodeName, oParent, oContext);
        var oNewContext;
        if (isPlainObject(oData)) {
            if(fnVisit.length >= 4){
                 oNewContext = jQuery.extend(true, {}, oContext, {
                    parentNodeName: sNodeName,
                    parentData: oData
                });
            }
            jQuery.each(oData, function(sName, oValue) {
                if (jQuery.isArray(oValue)) {
                    visitNodeDataTree(oValue, sName, fnVisit, oData, oNewContext);
                }
            });
        } else if (jQuery.isArray(oData)) {
            jQuery.each(oData, function(index, oDataInstance) {
                jQuery.each(oDataInstance, function(sName, oValue) {
                    if (jQuery.isArray(oValue)) {
                        if(fnVisit.length >= 4){
                            oNewContext = jQuery.extend(true, {}, oContext, {
                                parentNodeName: sNodeName,
                                parentData: oData
                            });
                        }
                        visitNodeDataTree(oValue, sName, fnVisit, oDataInstance, oNewContext);
                    }
                });
            });
        }
    }

    function findNodeInstance(oMetadata, oData, sFindNodeName, vFindKey) {
        if (sFindNodeName === Node.Root && oData[oMetadata.nodes.Root.primaryKey] === vFindKey) {
            return oData;
        };
        var oResult;
        visitDataTree(oData, Node.Root, function(oChild, sNodeName, oParent) {
            if (sNodeName === sFindNodeName && oChild[oMetadata.nodes[sNodeName].primaryKey] === vFindKey) {
                oResult = oChild;
            }
        });
        return oResult;
    }

    function findNode(oMetadata, oData, sFindNodeName) {
        if (sFindNodeName === Node.Root) {
            return [oData];
        };
        var oResult;
        visitNodeDataTree(oData, Node.Root, function(oChild, sNodeName, oParent) {
            if (sNodeName === sFindNodeName) {
                oResult = oChild;
            }
        });
        return oResult;
    }

    function isNodePresent(oData, sFindNodeName) {
        if (sFindNodeName === Node.Root && oData) {
            return true;
        }
        var bResult = false;
        visitDataTree(oData, Node.Root, function(oChild, sNodeName, oParent) {
            if (sNodeName === sFindNodeName) {
                bResult = true;
            }
        });
        return bResult;
    }

    function calculateChangeRequest(oApplicationObject, oBeforeImage, oCurrentImage, bComplete, oObjectInstance) {
        var oMetadata = oApplicationObject.getApplicationObjectMetadata();

        function cleanAttributes(oObjectData) {
            var oCleanData = jQuery.extend(true, {}, oObjectData);
            // recursively remove attributes/nodes not known to the backend
            visitDataTree(oCleanData, Node.Root, function(oData, sNodeName) {
                jQuery.each(oData, function(sName) {
                    var oAttributeMetadata = oMetadata.nodes[sNodeName] && oMetadata.nodes[sNodeName].attributes[sName];
                    var oNodeMetadata = oMetadata.nodes[sName];
                    if (!bComplete && !oAttributeMetadata && !oNodeMetadata) {
                        delete oData[sName];
                        return;
                    }

                    if (!bComplete && oAttributeMetadata && oAttributeMetadata.readOnly && !oAttributeMetadata.isPrimaryKey) {
                        delete oData[sName];
                        return;
                    }

                    // Open: Consider readOnly node with not read-only subnodes
                    if (!bComplete && oNodeMetadata && oNodeMetadata.readOnly) {
                        delete oData[sName];
                        return;
                    }

                    if (oAttributeMetadata) {
                        oData[sName] = mapInitialValueToNull(oData[sName], oAttributeMetadata);
                    }

                });
            });
            return oCleanData;
        }

        if (oApplicationObject.determinations && oApplicationObject.determinations.onNormalizeData) {
            // Data normalization is necessary when read model and the data model assumed for backend are
            // structurally completely different, e.g. to provide better UI binding for it
            // onNormalize is supposed to transform data to the model expected by the backend
            oCurrentImage = jQuery.extend(true, {}, oCurrentImage);
            oCurrentImage = oApplicationObject.determinations.onNormalizeData(oCurrentImage, oObjectInstance);

            oBeforeImage = jQuery.extend(true, {}, oBeforeImage);
            oBeforeImage = oApplicationObject.determinations.onNormalizeData(oBeforeImage, oObjectInstance);
        }

        var oCleanCurrentImage = cleanAttributes(oCurrentImage);
        var oCleanBeforeImage = cleanAttributes(oBeforeImage);

        if (!bComplete) {
            // Only transfer changed deltas
            visitDataTree(oCleanCurrentImage, Node.Root, function(oCurrentData, sNodeName) {
                var sPKName = oMetadata.nodes[sNodeName].primaryKey;
                var vNodeKey = oCurrentData[sPKName];
                var oBeforeImage = findNodeInstance(oMetadata, oCleanBeforeImage, sNodeName, vNodeKey);
                // New nodes are always transferred completely
                if (oCurrentData[sPKName] <= 0) {
                    return;
                }
                jQuery.each(oCurrentData, function(sName, oValue) {
                    var oBeforeValue = oBeforeImage && oBeforeImage[sName];
                    // delete values which are not changed, never delete the primary key
                    if (jQuery.sap.equal(oBeforeValue, oValue) && sName !== sPKName) {
                        delete oCurrentData[sName];
                    };
                });
            });
        }
        
        return oCleanCurrentImage;
    }

    function getActionMethods(oApplicationObject) {
        var oObject = {
            instanceMethods: {
                create: getCreateProcessor(oApplicationObject),
                copy: getCopyProcessor(oApplicationObject),
                update: getUpdateProcessor(oApplicationObject),
                modify: getModifyProcessor(oApplicationObject),
                del: getDeleteProcessor(oApplicationObject)
            },
            staticMethods: {
                create: getStaticCreateProcessor(oApplicationObject),
                copy: getStaticCopyProcessor(oApplicationObject),
                update: getStaticUpdateProcessor(oApplicationObject),
                modify: getStaticModifyProcessor(oApplicationObject),
                del: getStaticDeleteProcessor(oApplicationObject)
            }
        };

        function isFrameworkAction(sActionName) {
            return jQuery.map(Action, function(sAction) {
                return sAction;
            }).indexOf(sActionName) >= 0;
        }

        var oMetadata = oApplicationObject.getApplicationObjectMetadata();
        var oActions = jQuery.extend({}, oMetadata.actions || {});

        jQuery.each(oApplicationObject.prototype.actions || [], function(sActionName, oActionDefinition) {
            if (!oMetadata.actions[sActionName] && oActionDefinition.execute && jQuery.isFunction(oActionDefinition.execute)) {
                oActions[sActionName] = {
                    name: sActionName
                };
            }
        });

        jQuery.each(oActions, function(sActionName, oActionMetadata) {
            if (isFrameworkAction(sActionName)) {
                return;
            }

            if (oActionMetadata.isStatic === true) {
                oObject.staticMethods[sActionName] = getStaticCustomStaticActionProcessor(oApplicationObject, oActionMetadata);
            } else {
                oObject.instanceMethods[sActionName] = getCustomActionProcessor(oApplicationObject, oActionMetadata);
                oObject.staticMethods[sActionName] = getStaticCustomActionProcessor(oApplicationObject, oActionMetadata);
            }

            var sParameterModelMethod = sActionName + "Model";
            var fnParameterModelMethod = getCustomActionParameterProcessor(oApplicationObject, oActionMetadata);
            oObject.instanceMethods[sParameterModelMethod] = fnParameterModelMethod;
            oObject.staticMethods[sParameterModelMethod] = fnParameterModelMethod;
        });

        return oObject;
    }

    function process(oAjaxSettings) {
        return sap.ui.ino.models.util.Ajax.process(oAjaxSettings);
    }

    function parseResponse(oResponse) {
        return sap.ui.ino.models.util.Ajax.parseResponse(oResponse);
    }

    function registerDirtyObject(aApplicationObjectIds, oApplicationObjectChangeAction) {
        var that = this;
        var oDate = new Date();
        jQuery.each(aApplicationObjectIds, function(iIndex, iApplicationObjectId) {
            sap.ui.ino.models.core.InvalidationManager.registerDirtyObject(that, iApplicationObjectId, oDate);
            sap.ui.ino.models.core.ApplicationObjectChange.fireChange(that, iApplicationObjectId, oApplicationObjectChangeAction);
        });
    }

    function updateConcurrencyTokenOnFail(oObjectInstance, oDeferred) {
        return function(oResponse) {
            var sConcurrencyToken = oResponse.getHeader("ETag");
            oObjectInstance.setConflictConcurrencyToken(sConcurrencyToken);
            oDeferred.reject(oResponse);
        };
    }

    function create(oApplicationObject, oChangeRequest, oHeaders, bProcessSync) {
        var sURL = oApplicationObject.getEndpointURL();
        var oMetadata = oApplicationObject.getApplicationObjectMetadata();
        if (!oChangeRequest[oMetadata.nodes.Root.primaryKey]) {
            oChangeRequest[oMetadata.nodes.Root.primaryKey] = -1;
        }
        oHeaders = oHeaders || {};
        return oApplicationObject.process({
            url: sURL,
            type: "POST",
            contentType: "application/json; charset=UTF-8",
            data: JSON.stringify(oChangeRequest),
            headers: oHeaders,
            async: !bProcessSync
        });
    }

    function getCreateProcessor(oApplicationObject) {
        var oMetadata = oApplicationObject.getApplicationObjectMetadata();
        if (!oMetadata.actions.create) {
            return undefined;
        }
        return function(oSettings) {
            oApplicationObject.beginAction();
            var bSuppressBackendSync = (oSettings && oSettings.suppressBackendSync) ? true : false;
            var bProcessSync = (oSettings && oSettings.processSync) ? true : false;
            var oObjectInstance = this;
            var oChangeRequest = this.getChangeRequest();
            var oCreateRequest = create(oApplicationObject, oChangeRequest, oObjectInstance.processHeaders(), bProcessSync);
            var oDeferred = new jQuery.Deferred();
            oCreateRequest.done(function(oResponse) {
                if (oResponse.GENERATED_IDS) {
                    updateHandles(oObjectInstance, oResponse.GENERATED_IDS);
                    oObjectInstance._isNew = false;
                }
                onPersist(oApplicationObject, oObjectInstance.getKey(), oChangeRequest, oObjectInstance, oMetadata.actions.create, bSuppressBackendSync);
                if (!bSuppressBackendSync) {
                    delete oObjectInstance._oDeterminationData;
                }
                oObjectInstance._bLastBackendSyncSuppressed = bSuppressBackendSync;
                oObjectInstance._resolveAfterInitialize(oDeferred, oResponse, true);
            });
            oCreateRequest.fail(oApplicationObject.endAction, oDeferred.reject);
            return oDeferred.promise();
        };
    }

    function getStaticCreateProcessor(oApplicationObject) {
        var oMetadata = oApplicationObject.getApplicationObjectMetadata();
        if (!oMetadata.actions.create) {
            return undefined;
        }
        return function(oChangeRequest) {
            oApplicationObject.beginAction();
            var oRequest = create(oApplicationObject, oChangeRequest);
            oRequest.done(function(oResponse) {
                var vKey = undefined;
                if (oResponse.GENERATED_IDS) {
                    vKey = oResponse.GENERATED_IDS[oChangeRequest[oMetadata.nodes.Root.primaryKey]];
                }
                onPersist(oApplicationObject, vKey, oChangeRequest, undefined, oMetadata.actions.create);
            });
            oRequest.fail(oApplicationObject.endAction);
            return oRequest;
        };
    }

    function copy(oApplicationObject, vKey, oCopyRequest, oHeaders, bProcessSync) {
        var sURL = oApplicationObject.getEndpointURL();
        var oMetadata = oApplicationObject.getApplicationObjectMetadata();
        if (!oCopyRequest[oMetadata.nodes.Root.primaryKey]) {
            oCopyRequest[oMetadata.nodes.Root.primaryKey] = -1;
        }
        oHeaders = oHeaders || {};
        return oApplicationObject.process({
            url: sURL + "/" + vKey + "/copy",
            type: "POST",
            contentType: "application/json; charset=UTF-8",
            data: JSON.stringify(oCopyRequest),
            headers: oHeaders,
            async: !bProcessSync
        });
    }

    function getCopyProcessor(oApplicationObject) {
        var oMetadata = oApplicationObject.getApplicationObjectMetadata();
        if (!oMetadata.actions.copy) {
            return undefined;
        }
        return function(oCopyData, oCopySettings) {
            oApplicationObject.beginAction();
            var oObjectInstance = this;
            var vKey = this.getKey();
            if (this.isNew()) {
                jQuery.sap.log.error("Backend copy cannot be done on new objects");
                return;
            }
            var bProcessSync = (oCopySettings && oCopySettings.processSync) ? true : false;

            var oSettings = jQuery.extend({}, this._oSettings);
            var vCopyHandle = (oCopyData && oCopyData[oMetadata.nodes.Root.primaryKey]) || -1;
            var oCopyRequest = copy(oApplicationObject, vKey, oCopyData, oObjectInstance.processHeaders(), bProcessSync);
            var oDeferred = new jQuery.Deferred();

            oCopyRequest.done(function(oResponse) {
                var oCopyInstance = new oApplicationObject(oResponse.GENERATED_IDS[vCopyHandle], oSettings);
                onPersist(oApplicationObject, oCopyInstance.getInitKey(), oCopyData, oCopyInstance, oMetadata.actions.copy);
                oDeferred.resolve(oCopyInstance);
            });
            oCopyRequest.fail(oApplicationObject.endAction, oDeferred.reject);
            return oDeferred.promise();
        };
    }

    function getStaticCopyProcessor(oApplicationObject) {
        var oMetadata = oApplicationObject.getApplicationObjectMetadata();
        if (!oMetadata.actions.copy) {
            return undefined;
        }
        return function(vKey, oCopyRequest) {
            oApplicationObject.beginAction();
            var oRequest = copy(oApplicationObject, vKey, oCopyRequest);
            oRequest.done(function(oResponse) {
                onPersist(oApplicationObject, oResponse.GENERATED_IDS[-1], oCopyRequest, undefined, oMetadata.actions.copy);
            });
            oRequest.fail(oApplicationObject.endAction);
            return oRequest;
        };
    }

    function update(oApplicationObject, vKey, oChangeRequest, sConcurrencyToken, oHeaders, bProcessSync) {
        var sURL = oApplicationObject.getEndpointURL();
        var oMetadata = oApplicationObject.getApplicationObjectMetadata();
        if (!oChangeRequest[oMetadata.nodes.Root.primaryKey]) {
            oChangeRequest[oMetadata.nodes.Root.primaryKey] = vKey;
        }
        var oEmptyUpdate = {};
        oEmptyUpdate[oMetadata.nodes.Root.primaryKey] = vKey;
        if (jQuery.sap.equal(oChangeRequest, oEmptyUpdate)) {
            var oDeferred = new jQuery.Deferred();
            oDeferred.resolve({});
            return oDeferred.promise();
        }
        oHeaders = oHeaders || {};
        if (sConcurrencyToken) {
            oHeaders["If-Match"] = sConcurrencyToken;
        }
        return oApplicationObject.process({
            url: sURL + "/" + vKey,
            type: "PUT",
            contentType: "application/json; charset=UTF-8",
            data: JSON.stringify(oChangeRequest),
            headers: oHeaders,
            async: !bProcessSync
        });
    }

    function getUpdateProcessor(oApplicationObject) {
        var oMetadata = oApplicationObject.getApplicationObjectMetadata();
        if (!oMetadata.actions.update) {
            return undefined;
        }
        return function(oSettings) {
            oApplicationObject.beginAction();

            var bSuppressBackendSync = (jQuery.isPlainObject(oSettings) && oSettings.suppressBackendSync) ? oSettings.suppressBackendSync : false;
            var bIgnoreConcurrencyConflict = (jQuery.isPlainObject(oSettings)) ? oSettings.bIgnoreConcurrencyConflict : oSettings;
            var bProcessSync = (jQuery.isPlainObject(oSettings) && oSettings.processSync) ? oSettings.processSync : false;
            var oObjectInstance = this;
            var oDeferred = new jQuery.Deferred();

            var vKey = this.getKey();
            var oChangeRequest = this.getChangeRequest();
            this.applyConflictConcurrencyToken(bIgnoreConcurrencyConflict);
            var oUpdateRequest = update(oApplicationObject, vKey, oChangeRequest, oObjectInstance._sConcurrencyToken, oObjectInstance.processHeaders(), bProcessSync);
            oUpdateRequest.done(function(oResponse) {
                if (oResponse.GENERATED_IDS) {
                    if (!oObjectInstance._continuousUse) {
                        updateHandles(oObjectInstance, oResponse.GENERATED_IDS);
                    }
                }
                onPersist(oApplicationObject, oObjectInstance.getKey(), oChangeRequest, oObjectInstance, oMetadata.actions.update, bSuppressBackendSync);
                oObjectInstance._bLastBackendSyncSuppressed = bSuppressBackendSync;
                oObjectInstance._resolveAfterInitialize(oDeferred, oResponse);
            });
            oUpdateRequest.fail(updateConcurrencyTokenOnFail(oObjectInstance, oDeferred), oApplicationObject.endAction);

            return oDeferred.promise();
        };
    }

    function getStaticUpdateProcessor(oApplicationObject) {
        var oMetadata = oApplicationObject.getApplicationObjectMetadata();
        if (!oMetadata.actions.update) {
            return undefined;
        }
        return function(vKey, oChangeRequest) {
            oApplicationObject.beginAction();
            var oRequest = update(oApplicationObject, vKey, oChangeRequest);
            oRequest.done(function() {
                onPersist(oApplicationObject, vKey, oChangeRequest, undefined, oMetadata.actions.update);
            });

            oRequest.fail(oApplicationObject.endAction);
            return oRequest;
        };
    }

    function getModifyProcessor(oApplicationObject) {
        var oMetadata = oApplicationObject.getApplicationObjectMetadata();
        if (!oMetadata.actions.create && !oMetadata.actions.update) {
            return undefined;
        }
        return function(oSettings) {
            if (this.isNew()) {
                return this.create(oSettings);
            } else {
                return this.update(oSettings);
            }
        };
    }

    function getStaticModifyProcessor(oApplicationObject) {
        var oMetadata = oApplicationObject.getApplicationObjectMetadata();
        if (!oMetadata.actions.create && !oMetadata.actions.update) {
            return undefined;
        }
        return function(vKey, oChangeRequest) {
            if (vKey === undefined || (jQuery.isNumeric(vKey) && vKey <= 0)) {
                oApplicationObject.beginAction();

                var oRequest = create(oApplicationObject, oChangeRequest);
                oRequest.done(function(oResponse) {
                    var vKey = undefined;
                    if (oResponse.GENERATED_IDS) {
                        vKey = oResponse.GENERATED_IDS[oChangeRequest[oMetadata.nodes.Root.primaryKey]];
                    }
                    onPersist(oApplicationObject, vKey, oChangeRequest, undefined, oMetadata.actions.create);
                });
                oRequest.fail(oApplicationObject.endAction);
                return oRequest;
            } else {
                oApplicationObject.beginAction(oApplicationObject, oMetadata.actions.update);
                var oRequest = update(oApplicationObject, vKey, oChangeRequest);
                oRequest.done(function() {
                    onPersist(oApplicationObject, vKey, oChangeRequest, undefined, oMetadata.actions.update);
                });
                oRequest.fail(oApplicationObject.endAction);
                return oRequest;
            }
        };
    }

    function del(oApplicationObject, vKey, sConcurrencyToken, oHeaders, bProcessSync) {
        var sURL = oApplicationObject.getEndpointURL();
        oHeaders = oHeaders || {};
        if (sConcurrencyToken) {
            oHeaders["If-Match"] = sConcurrencyToken;
        }
        return oApplicationObject.process({
            url: sURL + "/" + vKey,
            type: "DELETE",
            headers: oHeaders,
            async: !bProcessSync
        });
    };

    function getDeleteProcessor(oApplicationObject) {
        var oMetadata = oApplicationObject.getApplicationObjectMetadata();
        if (!oMetadata.actions.del) {
            return undefined;
        }
        return function(bIgnoreConcurrencyConflict, oSettings) {
            var oObjectInstance = this;
            if (this.isNew()) {
                // New objects are not known to the backend
                // so for deletion nothing needs to be done
                // Return a "dummy" promise
                var oDeferred = new jQuery.Deferred();
                oDeferred.resolve({
                    MESSAGES: []
                });
                return oDeferred.promise();
            }

            oApplicationObject.beginAction();

            var bProcessSync = (oSettings && oSettings.processSync) ? true : false;

            var oDeleteDeferred = new jQuery.Deferred();
            // make sure delete request is sent after data initialization has happened
            this._oDataInitPromise.done(function() {
                oObjectInstance.applyConflictConcurrencyToken(bIgnoreConcurrencyConflict);
                var oDeleteRequest = del(oApplicationObject, oObjectInstance.getKey(), oObjectInstance._sConcurrencyToken, oObjectInstance.processHeaders(), bProcessSync);
                oDeleteRequest.done(function() {
                    // Revert pending changes after deletion
                    oObjectInstance.revertChanges();
                    onPersist(oApplicationObject, oObjectInstance.getKey(), undefined, oObjectInstance, oMetadata.actions.del);
                    oDeleteDeferred.resolve.apply(undefined, arguments);
                });
                oDeleteRequest.fail(updateConcurrencyTokenOnFail(oObjectInstance, oDeleteDeferred), oApplicationObject.endAction);
            });
            return oDeleteDeferred.promise();
        };
    }

    function getStaticDeleteProcessor(oApplicationObject) {
        var oMetadata = oApplicationObject.getApplicationObjectMetadata();
        if (!oMetadata.actions.del) {
            return undefined;
        }
        return function(vKey) {
            oApplicationObject.beginAction();
            var oRequest = del(oApplicationObject, vKey);
            oRequest.done(function() {
                onPersist(oApplicationObject, vKey, undefined, undefined, oMetadata.actions.del);
            });

            oRequest.fail(oApplicationObject.endAction);
            return oRequest;
        };
    }

    function executeCustomAction(oApplicationObject, oActionMetadata, vKey, oParameter, sConcurrencyToken, oHeaders, bProcessSync) {
        var sURL = oApplicationObject.getEndpointURL();
        var oAjaxSettings = {
            url: sURL + "/" + vKey + "/" + oActionMetadata.name,
            type: "POST",
        };
        if (oParameter) {
            oAjaxSettings.contentType = "application/json; charset=UTF-8";
            oAjaxSettings.data = JSON.stringify(oParameter);
        }
        oHeaders = oHeaders || {};
        if (sConcurrencyToken) {
            oHeaders["If-Match"] = sConcurrencyToken;
        }
        oAjaxSettings.headers = oHeaders;
        oAjaxSettings.async = !bProcessSync;
        return oApplicationObject.process(oAjaxSettings);
    }

    function executeCustomStaticAction(oApplicationObject, oActionMetadata, oParameter, oHeaders) {
        oApplicationObject.beginAction();
        var sURL = oApplicationObject.getEndpointURL();
        var oAjaxSettings = {
            url: sURL + "/" + oActionMetadata.name,
            type: "POST",
        };
        if (oParameter) {
            oAjaxSettings.contentType = "application/json; charset=UTF-8";
            oAjaxSettings.data = JSON.stringify(oParameter);
        }
        oHeaders = oHeaders || {};
        var oRequest = oApplicationObject.process(oAjaxSettings);
        oRequest.always(oApplicationObject.endAction);
        if (oActionMetadata.isMassAction) {
            oRequest.done(function() {
                jQuery.each(oParameter.keys, function(iIndex, vKey) {
                    sap.ui.ino.models.core.InvalidationManager.registerDirtyObject(oApplicationObject, vKey, new Date(), oActionMetadata.name === Action.Del);
                    sap.ui.ino.models.core.ApplicationObjectChange.fireChange(oApplicationObject, vKey, oActionMetadata.name);
                });
            });
        }
        return oRequest;
    }

    function getCustomActionProcessor(oApplicationObject, oActionMetadata) {
        var fnCustomActionProcessor = function(oParameter, oSettings) {
            oApplicationObject.beginAction();

            var oMetadata = oApplicationObject.getApplicationObjectMetadata();
            var bSuppressBackendSync = (jQuery.isPlainObject(oSettings) && oSettings.suppressBackendSync) ? oSettings.suppressBackendSync : false;
            var bIgnoreConcurrencyConflict = (jQuery.isPlainObject(oSettings)) ? oSettings.bIgnoreConcurrencyConflict : oSettings;
            var bProcessSync = (jQuery.isPlainObject(oSettings) && oSettings.processSync) ? oSettings.processSync : false;
            var oObjectInstance = this;
            var vKey = this.getKey();
            var oDeferred = new jQuery.Deferred();
            var oActionRequest;
            var bIsBackendAction = !! oMetadata.actions[oActionMetadata.name];
            if (bIsBackendAction) {
                oObjectInstance.applyConflictConcurrencyToken(bIgnoreConcurrencyConflict);
                oActionRequest = executeCustomAction(oApplicationObject, oActionMetadata, vKey, oParameter, oObjectInstance._sConcurrencyToken, oObjectInstance.processHeaders(), bProcessSync);
                oActionRequest.fail(oApplicationObject.endAction, updateConcurrencyTokenOnFail(oObjectInstance, oDeferred));
                oActionRequest.done(function(oResponse, sSuccess, oAjaxResponse) {
                    var sConcurrencyToken = oAjaxResponse.getResponseHeader("ETag");
                    oObjectInstance.setConcurrencyToken(sConcurrencyToken);
                });
            } else {
                var fnActionExecute = this.actions[oActionMetadata.name].execute;
                oActionRequest = fnActionExecute(vKey, oObjectInstance, oParameter, oActionMetadata, oSettings);
                if (oActionRequest && jQuery.isFunction(oActionRequest.done)) {
                    oActionRequest.fail(oApplicationObject.endAction, oDeferred.reject);
                } else {
                    var oWrapper = new jQuery.Deferred();
                    var oActionResult = oActionRequest;
                    oActionRequest = oWrapper.promise();
                    oWrapper.resolve(oActionResult);
                }
            }
            oActionRequest.done(function(oResponse) {
                vKey = oObjectInstance.getKey();
                onPersist(oApplicationObject, vKey, oParameter, oObjectInstance, oActionMetadata, bSuppressBackendSync || !bIsBackendAction);
                oObjectInstance._bLastBackendSyncSuppressed = bSuppressBackendSync;
                oObjectInstance._resolveAfterInitialize(oDeferred, oResponse);
            });
            return oDeferred.promise();
        };
        fnCustomActionProcessor.isCustomAction = true;
        return fnCustomActionProcessor;
    }

    function getStaticCustomActionProcessor(oApplicationObject, oActionMetadata) {
        return function(vKey, oParameter) {
            var oRequest = undefined;
            var oMetadata = oApplicationObject.getApplicationObjectMetadata();
            oApplicationObject.beginAction();

            if (oMetadata.actions[oActionMetadata.name]) {
                var sURL = oApplicationObject.getEndpointURL();
                var oAjaxSettings = {
                    url: sURL + "/" + vKey + "/" + oActionMetadata.name,
                    type: "POST",
                };
                if (oParameter) {
                    oAjaxSettings.contentType = "application/json; charset=UTF-8";
                    oAjaxSettings.data = JSON.stringify(oParameter);
                }
                oRequest = executeCustomAction(oApplicationObject, oActionMetadata, vKey, oParameter);
            } else {
                var oDeferred = new jQuery.Deferred();
                var fnActionExecute = oApplicationObject.prototype.actions[oActionMetadata.name].execute;
                var oExecResult = fnActionExecute(vKey, undefined, oParameter, oActionMetadata);
                if (oExecResult && jQuery.isFunction(oExecResult.done)) {
                    oExecResult.done(oDeferred.resolve);
                    oExecResult.fail(oDeferred.reject);
                } else {
                    oDeferred.resolve(oExecResult);
                }
                oRequest = oDeferred.promise();
            }
            oRequest.done(function() {
                onPersist(oApplicationObject, vKey, oParameter, undefined, oActionMetadata);
            });

            oRequest.fail(oApplicationObject.endAction);
            return oRequest;
        };
    }

    function getStaticCustomStaticActionProcessor(oApplicationObject, oActionMetadata) {
        return function(oParameter) {
            return executeCustomStaticAction(oApplicationObject, oActionMetadata, oParameter);
        };
    }

    function getCustomActionParameterProcessor(oApplicationObject, oActionMetadata) {
        return function() {
            var oModel = new sap.ui.model.json.JSONModel();
            var oParameter = {};
            var fnParameterInit = oApplicationObject.prototype.actions[oActionMetadata.name].initParameter;
            if (fnParameterInit) {
                fnParameterInit.apply(undefined, [oParameter].concat(jQuery.makeArray(arguments)));
            }
            oModel.setData(oParameter);
            return oModel;
        };
    }

    function onPersist(oApplicationObject, vKey, oChangeRequest, oObjectInstance, oActionMetadata, bSuppressBackendSync) {
        var oDate = new Date();
        if (vKey) {
            sap.ui.ino.models.core.InvalidationManager.registerDirtyObject(oApplicationObject, vKey, oDate, oActionMetadata.name === Action.Del);
        }
        if (oObjectInstance && oObjectInstance._oPropertyModel && oObjectInstance._continuousUse && oActionMetadata.name != Action.Del && !bSuppressBackendSync) {
            // After successful create the new (permanent) key is passed
            oObjectInstance._oPropertyModel.sync(vKey);
        }

        if (oObjectInstance && oObjectInstance._continuousUse && oActionMetadata.name != Action.Del && !bSuppressBackendSync) {
            initUpdateData(oObjectInstance, vKey);
        }

        if (oObjectInstance && bSuppressBackendSync) {
            oObjectInstance._oBeforeData = jQuery.extend(true, {}, oObjectInstance.getData());
        }

        if (oApplicationObject.determinations && oApplicationObject.determinations.onPersist) {
            var fnRegisterDirtyObject = function(oApplicationObject, vKey, bDeleted) {
                sap.ui.ino.models.core.InvalidationManager.registerDirtyObject(oApplicationObject, vKey, oDate, bDeleted);
            };
            oApplicationObject.determinations.onPersist(vKey, oChangeRequest, oObjectInstance && oObjectInstance.getData(), oActionMetadata, fnRegisterDirtyObject);
        }

        // Trigger eventing only for initiating action, not for nested actions
        if (oApplicationObject.isInitiatingAction()) {
            sap.ui.ino.models.core.ApplicationObjectChange.fireChange(oApplicationObject, vKey, oActionMetadata.name, oObjectInstance && oObjectInstance.getData());
        }
        oApplicationObject.endAction();
    }

    function initCreateData(oObjectInstance, oDefaultData) {
        function getInitialValue(oAttributeMetadata) {
            if (mTypeMapping[oAttributeMetadata.dataType] === "sap.ui.model.type.String") {
                return "";
            } else {
                return null;
            }
        }

        var oMetadata = oObjectInstance.getApplicationObjectMetadata();

        var oData = {};
        jQuery.each(oMetadata.nodes.Root.attributes, function(sAttributeName, oAttributeMetadata) {
            oData[sAttributeName] = getInitialValue(oAttributeMetadata);
        });

        jQuery.each(oMetadata.nodes, function(iIndex, oNode) {
            if (oNode.parentNode && oNode.parentNode === Node.Root) {
                var oReadSourceSettings = oObjectInstance.readSource && oObjectInstance.readSource.settings && oObjectInstance.readSource.settings(oObjectInstance._oReadSourceSettings);
                if (!(oReadSourceSettings && oReadSourceSettings.excludeNodes && oReadSourceSettings.excludeNodes.indexOf(oNode.name) > -1)) {
                    oData[oNode.name] = [];
                }
            }
        });

        jQuery.extend(oData, oDefaultData);
        var oDeferred = new jQuery.Deferred();
        oObjectInstance._oDataInitPromise = oDeferred.promise();

        function handleInitDone(oInitData) {
            if (oInitData) {
                jQuery.extend(oData, oInitData);
            }
            oData[oMetadata.nodes.Root.primaryKey] = oObjectInstance.getNextHandle();
            oObjectInstance.setData(oData);
            // Modifications could have been made in setData using setProperty
            oData = oObjectInstance.getData();
            oObjectInstance._oDeterminationData = jQuery.extend(true, {}, oData);
            oObjectInstance._isNew = true;
            oDeferred.resolve(oData);
        };

        if (oObjectInstance.determinations && oObjectInstance.determinations.onCreate) {
            var oDetResult = oObjectInstance.determinations.onCreate(oData, oObjectInstance);
            if (oDetResult && jQuery.isFunction(oDetResult.done)) {
                oDetResult.done(handleInitDone);
            } else {
                handleInitDone(oDetResult);
            }
        } else {
            handleInitDone({});
        }
    }

    function initUpdateData(oObjectInstance, vKey, bMergeConcurrentChanges) {
        var oMetadata = oObjectInstance.getApplicationObjectMetadata();

        var oDeferred = new jQuery.Deferred();
        oObjectInstance._oDataInitPromise = oDeferred.promise();
        oObjectInstance._isNew = false;

        if (oObjectInstance.readSource) {
            oObjectInstance._lastReadDate = new Date();
            var oReadPromise = oObjectInstance.readSource(vKey, oObjectInstance.getObjectName(), oMetadata, oObjectInstance._oReadSourceSettings);
            oReadPromise.done(function(oData, sConcurrencyToken) {
                var oDataBeforeMerge;

                if (!oData) {
                    jQuery.sap.log.error("Object " + vKey + " does not exist (" + oObjectInstance.getObjectName() + ")");
                    return;
                }

                if (bMergeConcurrentChanges) {
                    oDataBeforeMerge = oData;
                    oData = oObjectInstance._mergeConcurrentChanges(oData);
                }

                mapNullToInitialValues(oData, oObjectInstance.getApplicationObject());

                function handleInitDone(oInitData) {
                    if (oInitData) {
                        jQuery.extend(oData, oInitData);
                    }
                    oData[oMetadata.nodes.Root.primaryKey] = vKey;
                    oObjectInstance.setData(oData);
                    oObjectInstance._oBeforeData = jQuery.extend(true, {}, oDataBeforeMerge || oData);
                    oObjectInstance.setConcurrencyToken(sConcurrencyToken);
                    oDeferred.resolve(oData);
                }

                if (oObjectInstance.determinations && oObjectInstance.determinations.onRead) {
                    var oDetResult = oObjectInstance.determinations.onRead(oData, oObjectInstance);
                    if (oDetResult && jQuery.isFunction(oDetResult.done)) {
                        oDetResult.done(handleInitDone);
                    } else {
                        handleInitDone(oDetResult);
                    }
                } else {
                    handleInitDone({});
                }

            });
            oReadPromise.fail(function() {
                jQuery.sap.log.error("Reading object " + vKey + " failed (" + oObjectInstance.getObjectName() + ")");
                oDeferred.reject();
            });
        } else {
            var oData = {};
            oData[oMetadata.nodes.Root.primaryKey] = vKey;
            oObjectInstance.setData(oData);
            oObjectInstance._oBeforeData = jQuery.extend(true, {}, oData);;
            oDeferred.resolve(oData);
        }
    }

    function initPropertyModel(vKey, oObjectInstance, oScope, oDefaultData) {
        if (!oScope.nodes && !oScope.actions && !oScope.staticActions) {
            return;
        }

        var oMetadata = oObjectInstance.getApplicationObjectMetadata();

        var oPropertyScope = {
            nodes: [],
            actions: [],
            staticActions: []
        };

        if (oScope.nodes) {
            jQuery.each(oScope.nodes, function(iIndex, sNodeName) {
                if (oMetadata.nodes[sNodeName]) {
                    oPropertyScope.nodes.push(sNodeName);
                }
            });
        }

        var aScopeActionName = [];
        if (oScope.actions) {
            jQuery.each(oScope.actions, function(iIndex, vActionDef) {
                var sActionName = getActionName(vActionDef);
                if (oMetadata.actions[sActionName] && sActionName != Action.Create) {
                    oPropertyScope.actions.push(vActionDef);
                }
                aScopeActionName.push(sActionName);
            });
        }

        var aScopeStaticActionName = [];
        if (oScope.staticActions) {
            jQuery.each(oScope.staticActions, function(iIndex, vActionDef) {
                var sActionName = getActionName(vActionDef);
                if (oMetadata.actions[sActionName]) {
                    oPropertyScope.staticActions.push(vActionDef);
                }
                aScopeStaticActionName.push(sActionName);
            });
        }

        var iModifyIndex = aScopeActionName.indexOf(Action.Modify);
        if (iModifyIndex >= 0) {
            if (aScopeActionName.indexOf(Action.Update) < 0) {
                oPropertyScope.actions.push(Action.Update);
            }
        }
        var iCreateIndex = aScopeActionName.indexOf(Action.Create);
        var iStaticCreateIndex = aScopeStaticActionName.indexOf(Action.Create);
        if (oObjectInstance._isNew && (iModifyIndex >= 0 || iCreateIndex >= 0) && iStaticCreateIndex < 0) {
            var oStaticCreateAction = {};
            /*var oCreateData = {};
            jQuery.each(oDefaultData, function(sAttribute, oValue) {
                if (oValue != undefined && oValue != null && !jQuery.isArray(oValue)) {
                    oCreateData[sAttribute] = oValue;
                }
            });*/
            oStaticCreateAction[Action.Create] = oDefaultData;
            oPropertyScope.staticActions.push(oStaticCreateAction);
        }
        var oDeferred = new jQuery.Deferred();
        oObjectInstance._oPropertyModelInitPromise = oDeferred.promise();

        function updatePropertyModel(oEvent) {
            var oPropertyModel = oEvent.getSource();
            oObjectInstance._oPropertyModel = oPropertyModel;
            // make sure the enabled checks do have the full initialization data available
            oObjectInstance.getDataInitializedPromise().done(function() {
                if (iModifyIndex >= 0) {
                    var bModifyEnabled = undefined;
                    if (oObjectInstance._isNew) {
                        bModifyEnabled = oPropertyModel.getProperty("/actions/create/enabled");
                    } else {
                        bModifyEnabled = oPropertyModel.getProperty("/actions/update/enabled");
                    }
                    if (bModifyEnabled !== undefined) {
                        oPropertyModel.setPropertyInternal("/actions/modify", {
                            enabled: bModifyEnabled
                        });
                    }
                }
                jQuery.each((oScope.actions || []).concat(oScope.staticActions || []), function(iIndex, vActionDef) {
                    var sActionName = getActionName(vActionDef);
                    var fnEnabledCheck = oObjectInstance.actions && oObjectInstance.actions[sActionName] && oObjectInstance.actions[sActionName].enabledCheck;
                    if (fnEnabledCheck) {
                        var sPropertyPath = "/actions/" + sActionName;
                        var bPropertyModelEnabled = oPropertyModel.getProperty(sPropertyPath + "/enabled");
                        var bCheckResult = fnEnabledCheck(oObjectInstance, bPropertyModelEnabled);
                        if (bCheckResult !== undefined) {
                            oPropertyModel.setPropertyInternal(sPropertyPath, {
                                enabled: bCheckResult
                            });
                        }
                    }
                });
                oDeferred.resolve(oPropertyModel.getData());
            });

            oPropertyModel.fireEvent("modelModified");
        }

        // Set property defaults
        var oPropertyDefault = {
            actions: {
                modify: {
                    enabled: false
                }
            }
        };
        jQuery.each((oScope.actions || []).concat(oScope.staticActions || []), function(iIndex, vActionDef) {
            var sActionName = getActionName(vActionDef);
            var fnExecute = oObjectInstance.actions && oObjectInstance.actions[sActionName] && oObjectInstance.actions[sActionName].execute;
            if (fnExecute) {
                oPropertyDefault.actions[sActionName] = {
                    enabled: false
                };
            }
        });

        var oPropertyModel = new sap.ui.ino.models.core.PropertyModel(oObjectInstance.getObjectName(), vKey, oPropertyScope, false, updatePropertyModel, oPropertyDefault);
        oObjectInstance._oPropertyModel = oPropertyModel;
    }

    function updateHandles(oObject, mGeneratedKeys) {
        var oMetadata = oObject.getApplicationObjectMetadata();
        var oApplicationObject = oObject.getApplicationObject();
        var oData = oObject.getProperty("/");

        if (oApplicationObject.determinations && oApplicationObject.determinations.onUpdateHandles) {
            oData = oApplicationObject.determinations.onUpdateHandles(oData, mGeneratedKeys);
        } else {
            visitDataTree(oData, Node.Root, function(oData, sNodeName) {
                var oNodeMetadata = oMetadata.nodes[sNodeName];
                if (!oNodeMetadata) {
                    // ignore artificial nodes
                    return;
                }
                var vPrimaryKey = oData[oNodeMetadata.primaryKey];
                if (mGeneratedKeys[vPrimaryKey]) {
                    oData[oNodeMetadata.primaryKey] = mGeneratedKeys[vPrimaryKey];
                }
            });
        }
        oObject.setData(oData);
    }

    var mTypeMapping = {
        "NVARCHAR": "sap.ui.model.type.String",
        "VARCHAR": "sap.ui.model.type.String",
        "CHAR": "sap.ui.model.type.String",
        "NCHAR": "sap.ui.model.type.String",
        "INTEGER": "sap.ui.model.type.Integer",
        "INT": "sap.ui.model.type.Integer",
        "TINYINT": "sap.ui.model.type.Integer",
        "SMALLINT": "sap.ui.model.type.Integer",
        "BIGINT": "sap.ui.model.type.Integer",
        "SMALLDECIMAL": "sap.ui.model.type.Float",
        "DECIMAL": "sap.ui.model.type.Float",
        "DOUBLE": "sap.ui.model.type.Float",
        "REAL": "sap.ui.model.type.Float",
        "FLOAT": "sap.ui.model.type.Float",
        "DATE": "sap.ui.model.type.Date",
        "SECONDDATE": "sap.ui.model.type.DateTime",
        "TIMESTAMP": "sap.ui.model.type.DateTime",
        "TIME": "sap.ui.model.type.Time"
    };

    function mapNullToInitialValues(oObjectData, oApplicationObject) {
        var oMetadata = oApplicationObject.getApplicationObjectMetadata();
        visitDataTree(oObjectData, Node.Root, function(oData, sNodeName) {
            jQuery.each(oData, function(sName) {
                var oAttributeMetadata = oMetadata.nodes[sNodeName] && oMetadata.nodes[sNodeName].attributes[sName];
                if (oAttributeMetadata) {
                    oData[sName] = mapNullToInitialValue(oData[sName], oAttributeMetadata);
                }
            });
        });
    }

    function mapNullToInitialValue(vValue, oAttributeMetadata) {
        if (vValue !== null) {
            return vValue;
        }
        if (!oAttributeMetadata) {
            return vValue;
        }
        var sTypeName = mTypeMapping[oAttributeMetadata.dataType];
        if (!sTypeName) {
            return null;
        }
        // Other types need to follow but are not as straight-forward as String
        switch (sTypeName) {
            case "sap.ui.model.type.String":
                return "";
            default:
                return null;
        }
    }

    function mapInitialValueToNull(vValue, oAttributeMetadata) {
        if (!oAttributeMetadata) {
            return vValue;
        }
        var sTypeName = mTypeMapping[oAttributeMetadata.dataType];
        if (!sTypeName) {
            return vValue;
        }
        // Other types need to follow but are not as straight-forward as String
        switch (sTypeName) {
            case "sap.ui.model.type.String":
                return (vValue === "") ? null : vValue;
            default:
                return vValue;
        }
    }

    function getBindingType(oBinding, oMetadata) {
        var sPath = oBinding.getPath();
        var oContext = oBinding.getContext();
        sPath = oContext ? oContext.getPath() + "/" + sPath : sPath;

        var aPath = sPath.split("/");
        // remove empty first element
        var sBindingPrefix = aPath.shift();
        if (isReservedBindingPrefix(sBindingPrefix)) {
            return undefined;
        }
        var sAttributeName = aPath.pop();
        // For structured bindings (:1) the path is like /SUBNODE/ATTRIBUTE
        // For subnodes in arrays the path is like /SUBNODE/1/ATTRIBUTE
        var sNodeName = undefined;

        if (aPath.length === 0) {
            sNodeName = Node.Root;
        }

        if (aPath.length === 1) {
            sNodeName = aPath.pop();
        }

        if (aPath.length > 1) {
            sNodeName = aPath.pop() && aPath.pop();
        }

        jQuery.sap.log.debug(sNodeName, "getBindingType could not retrieve node for " + sPath);

        if (oMetadata.nodes[sNodeName] === undefined) {
            // This is the case when the read source contains additional nodes
            return undefined;
        }
        var oAttributeMetadata = oMetadata.nodes[sNodeName].attributes[sAttributeName];
        if (!oAttributeMetadata) {
            // This is the case when the read source contains additional attributes
            return undefined;
        }

        var sTypeName = mTypeMapping[oAttributeMetadata.dataType];
        if (!sTypeName) {
            return undefined;
        }

        var oType = undefined;

        switch (sTypeName) {
            case "sap.ui.model.type.String":
                oType = new sap.ui.model.type.String(null, {
                    minLength: (oAttributeMetadata.required ? 1 : undefined),
                    maxLength: (oAttributeMetadata.maxLength || undefined)
                });
                break;
            case "sap.ui.model.type.Integer":
                oType = new sap.ui.model.type.Integer();
                break;
            case "sap.ui.model.type.Float":
                oType = new sap.ui.model.type.Float();
                break;
            case "sap.ui.model.type.Date":
                oType = new sap.ui.model.type.Date({
                    source: {
                        pattern: "yyyy-MM-dd"
                    },
                    style: "medium"
                }, {
                    minimum: oAttributeMetadata.required ? "1970-01-01" : undefined
                });
                break;
            case "sap.ui.model.type.DateTime":
                oType = new sap.ui.model.type.DateTime({
                    style: "medium"
                }, {
                    minimum: oAttributeMetadata.required ? "1970-01-01T00:00:00Z" : undefined
                });
                break;
            case "sap.ui.model.type.Time":
                oType = new sap.ui.model.type.Time({
                    style: "medium"
                }, {
                    minimum: oAttributeMetadata.required ? "00:00:00" : undefined
                });
                break;
            default:
                break;
        }
        return oType;
    }

    var BindingPrefix = {
        Meta: "meta",
        Property: "property"
    };

    function isReservedBindingPrefix(sBindingPrefix) {
        return jQuery.map(BindingPrefix, function(sBindingPrefix) {
            return sBindingPrefix;
        }).indexOf(sBindingPrefix) >= 0;
    }

    function getDelegateModelInfo(oObjectInstance, sPath) {
        if (sPath) {
            var bAbsolute = sPath[0] === "/";
            var aPaths = sPath.split("/");
            if (!bAbsolute) {
                aPaths.splice(0, 0, "");
            }
            if (aPaths.length > 2) {
                var sBindingPrefix = aPaths[1];
                if (sBindingPrefix === BindingPrefix.Meta) {
                    var sObjectName = oObjectInstance.getObjectName();
                    var aMetadataPath = [sObjectName].concat(aPaths.slice(2));
                    var sMetadataPath = (bAbsolute ? "/" : "") + aMetadataPath.join("/");
                    return {
                        model: oMetaModel,
                        path: sMetadataPath
                    };
                }

                if (sBindingPrefix === BindingPrefix.Property) {
                    var sPropertyPath = (bAbsolute ? "/" : "") + aPaths.slice(2).join("/");
                    if (!oObjectInstance._oPropertyModel) {
                        jQuery.sap.log.error("Scope for property binding needs to be defined when creating the object");
                    }
                    return {
                        model: oObjectInstance._oPropertyModel,
                        path: sPropertyPath
                    };
                }
            }
        }
        return undefined;
    }

    sap.ui.ino.models.core.ApplicationObject.prototype.bindProperty = function(sPath, oContext, mParameters) {
        // meta and property access is delegated to different models
        // data of the object instance itself is kept in the instances' JSON model
        var oDelegateModelInfo = getDelegateModelInfo(this, sPath);
        if (!oDelegateModelInfo) {
            return sap.ui.model.json.JSONModel.prototype.bindProperty.apply(this, arguments);
        }
        return new sap.ui.model.json.JSONPropertyBinding(oDelegateModelInfo.model, oDelegateModelInfo.path, oContext, mParameters);
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.bindList = function(sPath, oContext, aSorters, aFilters, mParameters) {
        // meta and property access is delegated to different models
        // data of the object instance itself is kept in the instances' JSON model
        var oDelegateModelInfo = getDelegateModelInfo(this, sPath);
        if (!oDelegateModelInfo) {
            return sap.ui.model.json.JSONModel.prototype.bindList.apply(this, arguments);
        }

        return new sap.ui.model.json.JSONListBinding(oDelegateModelInfo.model, oDelegateModelInfo.path, oContext, aSorters, aFilters, mParameters);
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.getProperty = function(sPath, oContext) {
        // meta and property access is delegate to different models
        // data of the object instance itself is kept in the instances' JSON model
        var oDelegateModelInfo = getDelegateModelInfo(this, sPath);
        if (!oDelegateModelInfo) {
            return sap.ui.model.json.JSONModel.prototype.getProperty.apply(this, arguments);
        }
        return oDelegateModelInfo.model.getProperty(oDelegateModelInfo.path);
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.getPropertyModel = function() {
        return this._oPropertyModel;
    };

    // Add Binding is used for setting the type as it is called later than bindProperty
    // When doing so in bindProperty the set type is reset by SAPUI5
    sap.ui.ino.models.core.ApplicationObject.prototype.addBinding = function(oBinding) {
        sap.ui.model.json.JSONModel.prototype.addBinding.apply(this, arguments);
        if (oBinding instanceof sap.ui.model.PropertyBinding) {
            var oControlType = oBinding.getType();
            // Don't override types specified in the control binding
            if (oControlType === undefined) {
                var oBindingType = getBindingType(oBinding, this.getApplicationObjectMetadata());
                if (oBindingType) {
                    oBinding.setType(oBindingType, oBinding.sInternalType);
                }
            }
        }
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.process = process;
    sap.ui.ino.models.core.ApplicationObject.prototype.processHeaders = function() {
        return null;
    };
    sap.ui.ino.models.core.ApplicationObject.prototype.parseResponse = parseResponse;

    sap.ui.ino.models.core.ApplicationObject.prototype.readData = function(oSettings) {
        return this.getApplicationObject().readData(this.getKey(), oSettings);
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.getLastReadDate = function() {
        return this._lastReadDate;
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.getKey = function() {
        var oData = this.getData();
        var oMetadata = this.getApplicationObjectMetadata();
        return oData[oMetadata.nodes.Root.primaryKey];
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.getInitKey = function() {
        return this._initKey;
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.getApplicationObjectMetadata = function() {
        return this.getApplicationObject().getApplicationObjectMetadata();
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.getObjectName = function() {
        return this.getApplicationObject().getObjectName();
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.getDataInitializedPromise = function() {
        return this._oDataInitPromise;
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.getPropertyModelInitializedPromise = function() {
        return this._oPropertyModelInitPromise;
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.hasPendingChanges = function() {
        var oMetadata = this.getApplicationObjectMetadata();
        var oUserChanges = this.getUserChanges();
        // primary key is always part of the change request -> ignore it for comparison
        delete oUserChanges[oMetadata.nodes.Root.primaryKey];

        var bResult = !jQuery.sap.equal(oUserChanges, {});
        if (bResult) {
            jQuery.sap.log.info("Pending changes: user change:" + JSON.stringify(oUserChanges));
        }
        return bResult;
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.getChangeRequest = function(bComplete) {
        return calculateChangeRequest(this.getApplicationObject(), this._oBeforeData || {}, this.getData(), bComplete, this);
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.getUserChanges = function() {
        // User changes are all changes which need to be sent to backend MINUS changes triggered by defaulting data by
        // frontend determinations
        var oResult = {};
        var oMetadata = this.getApplicationObjectMetadata();

        var oDeterminationChangeRequest = undefined;
        if (this._oDeterminationData) {
            oDeterminationChangeRequest = calculateChangeRequest(this.getApplicationObject(), {}, this._oDeterminationData, false, this);
        };
        var oChangeRequest = this.getChangeRequest();

        oResult = oChangeRequest;
        if (oDeterminationChangeRequest) {
            if (jQuery.sap.equal(oDeterminationChangeRequest, oChangeRequest)) {
                return {};
            }
            // Remove attributes from change request when no difference to determination attributes exists
            visitDataTree(oResult, Node.Root, function(oData, sNodeName, oParent) {
                // Find matching node in determination data
                var oDeterminationNode = findNodeInstance(oMetadata, oDeterminationChangeRequest, sNodeName, oData[oMetadata.nodes[sNodeName].primaryKey]);
                if (oDeterminationNode) {
                    jQuery.each(oData, function(sName, vValue) {
                        if (jQuery.isArray(vValue)) {
                            return;
                        }
                        if (jQuery.sap.equal(oDeterminationNode[sName], vValue)) {
                            delete oData[sName];
                        }
                    });
                }
            });
            // Remove nodes from change request when no difference to determination nodes exists
            visitNodeDataTree(oResult, Node.Root, function(oData, sNodeName, oParent) {
                if (sNodeName != Node.Root) {
                    var oDeterminationNode = findNode(oMetadata, oDeterminationChangeRequest, sNodeName);
                    if (oDeterminationNode) {
                        if (oData.length == oDeterminationNode.length) {
                            var bUserChange = false;
                            jQuery.each(oData, function(index, oDataInstance) {
                                if (!jQuery.isEmptyObject(oDataInstance)) {
                                    bUserChange = true;
                                    return false;
                                }
                                return true;
                            });
                            if (!bUserChange) {
                                delete oParent[sNodeName];
                            }
                        }
                    }
                }
            });
        }
        return oResult;
    };

    sap.ui.ino.models.core.ApplicationObject.prototype._resolveAfterInitialize = function(oDeferred) {
        var oDataInitializedPromise = this.getDataInitializedPromise();
        // all arguments after oDeferred are used for resolving the deferred
        var aResolveArguments = Array.prototype.slice.call(arguments, 1);
        if (oDataInitializedPromise) {
            // "Really done" is when data has been initialized again and the application object is
            // in a consistent state
            oDataInitializedPromise.done(function() {
                oDeferred.resolve.apply(oDeferred, aResolveArguments);
            });
        } else {
            oDeferred.resolve.apply(oDeferred, aResolveArguments);
        }
    };

    sap.ui.ino.models.core.ApplicationObject.prototype._mergeConcurrentChanges = function(oData) {
        var that = this;
        var oMetadata = this.getApplicationObjectMetadata();
        var oApplicationObject = this.getApplicationObject();
        var oUserChange = this.getUserChanges();
        var oCurrentStateComplete = this.getChangeRequest(true);
        var oMergeResult = jQuery.extend(true, {}, oData);

        var oNormalizedBeforeImage = that._oBeforeData;
        if (oApplicationObject.determinations && oApplicationObject.determinations.onNormalizeData) {
            oNormalizedBeforeImage = jQuery.extend(true, {}, oNormalizedBeforeImage);
            oNormalizedBeforeImage = oApplicationObject.determinations.onNormalizeData(oNormalizedBeforeImage, this);
        }

        // 1. find same instances and overwrite data changed by the current user
        visitDataTree(oMergeResult, Node.Root, function(oData, sNodeName, oParent) {
            var sKeyName = oMetadata.nodes[sNodeName].primaryKey;
            var vKey = oData[sKeyName];
            var bNodePresent = isNodePresent(oUserChange, sNodeName);
            // if node is not present, it is unchanged
            if (bNodePresent) {
                // Find matching node user changes
                var oUserChangeInstance = findNodeInstance(oMetadata, oUserChange, sNodeName, vKey);
                if (oUserChangeInstance) {

                    jQuery.each(oData, function(sName, vValue) {
                        if (jQuery.isArray(vValue)) {
                            return;
                        }
                        if (oUserChangeInstance[sName] !== undefined) {
                            oData[sName] = oUserChangeInstance[sName];
                        }
                    });
                } else {
                    // Not in current state: if node was explicitely deleted we will remove it
                    // Explicit remove is recognized by checking whether the node was there before
                    var oBeforeInstance = findNodeInstance(oMetadata, oNormalizedBeforeImage, sNodeName, vKey);
                    if (oBeforeInstance) {
                        for (var i = 0; i < oParent.length; i++) {
                            if (oParent[i][sKeyName] === vKey) {
                                oParent.splice(i, 1);
                                return;
                            }
                        }
                    }
                }
            }
        });

        // 2. add instances in user change not present in backend data
        // Two reasons: it is a new instance or the instance has been deleted
        // we need the current state in order to restore deleted backend nodes
        visitDataTree(oUserChange, Node.Root, function(oData, sNodeName, oParent, oContext) {
            var sPKName = oMetadata.nodes[sNodeName].primaryKey;
            var sParentNodeName = oMetadata.nodes[sNodeName].parentNode;
            var sParentNodePK = sParentNodeName && oMetadata.nodes[sParentNodeName].primaryKey;
            var oNodeInstance = findNodeInstance(oMetadata, oMergeResult, sNodeName, oData[sPKName]);
            if (!oNodeInstance) {

                // This is only the "place holder" object in the node which was not touched
                // as it has been deleted concurrently we will not recreate it again
                if (Object.keys(oData).length === 1 && oData[sPKName]) {
                    return;
                }

                var oNewNodeInstance = jQuery.extend(true, {}, oData);
                var oNodeInstanceData = findNodeInstance(oMetadata, oCurrentStateComplete, sNodeName, oNewNodeInstance[sPKName]);
                if (oNodeInstanceData) {
                    oNewNodeInstance = jQuery.extend(true, {}, oNodeInstanceData);
                }
                // make sure entries deleted in the meanwhile get a proper handle
                // deleted entries are kept in merge as changes might have been done already
                if (oNewNodeInstance[sPKName] >= 0) {
                    oNewNodeInstance[sPKName] = that.getNextHandle();
                }
                var vParentKey = oContext.parentData[sParentNodePK];
                var oParentInstance = findNodeInstance(oMetadata, oMergeResult, sParentNodeName, vParentKey);
                if (oParentInstance) {
                    oParentInstance[sNodeName] = oParentInstance[sNodeName] || [];
                    oParentInstance[sNodeName].push(oNewNodeInstance);
                } else {
                    jQuery.sap.log.fatal("Merging may only be enabled for objects where deleting parents is impossible");
                }
            }
        });

        if (oApplicationObject.determinations && oApplicationObject.determinations.onMergeConcurrentChanges) {
            oMergeResult = oApplicationObject.determinations.onMergeConcurrentChanges(oMergeResult, oUserChange);
        }
        return oMergeResult;
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.isNew = function() {
        if (this._isNew === undefined) {
            // initialize correctly, if it is undefined it must be new
            this._isNew = true;
        }
        return this._isNew;
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.setProperty = function(sPath, vValue, oContext) {
        // redefined for better debugging
        return sap.ui.model.json.JSONModel.prototype.setProperty.apply(this, arguments);
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.revertChanges = function() {
        if (this.isNew()) {
            this.setData(jQuery.extend(true, {}, this._oDeterminationData) || {});
        } else {
            this.setData(jQuery.extend(true, {}, this._oBeforeData) || {});
        }
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.sync = function() {
        // syncs object state with backend after external update
        // After successful create the new (permanent) key is passed
        if (this._oPropertyModel) {
            this._oPropertyModel.sync(this.getKey());
        }
        initUpdateData(this, this.getKey());
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.mergeConcurrentChanges = function() {
        initUpdateData(this, this.getKey(), true);
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.setConcurrencyToken = function(sConcurrencyToken) {
        if (this._oSettings && this._oSettings.concurrencyEnabled) {
            this._sConcurrencyToken = sConcurrencyToken;
        }
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.setConflictConcurrencyToken = function(sConcurrencyToken) {
        // In conflict state we remember the token so that we can enforce it, if users wish to ignore the conflict
        if (this._oSettings && this._oSettings.concurrencyEnabled) {
            this._sConflictConcurrencyToken = sConcurrencyToken;
        }
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.applyConflictConcurrencyToken = function(bIgnoreConcurrencyConflict) {
        if (bIgnoreConcurrencyConflict) {
            this._sConcurrencyToken = this._sConflictConcurrencyToken;
        }
        this._sConflictConcurrencyToken = undefined;
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.resolveConflictManually = function() {
        this.applyConflictConcurrencyToken(true);
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.updateNode = function(oNode, sNodeName) {
        var oMetadata = this.getApplicationObject().getApplicationObjectMetadata();
        var oNodeMetadata = oMetadata.nodes[sNodeName];
        if (!oNodeMetadata) {
            jQuery.sap.log.error(sNodeName + " in " + this.getObjectName() + " is not known");
            return;
        }

        // move over the tree and replace the node with the same key
        visitDataTree(this.getData(), sNodeName, function(oData, sNodeName, oParent) {
            if (oData[oNodeMetadata.primaryKey] == oNode[oNodeMetadata.primaryKey]) {
                // found! overwrite!
                oData = jQuery.extend(false, oData, oNode);
            };
        });
        this.checkUpdate(true);
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.addChild = function(oChild, sNodeName) {
        var oMetadata = this.getApplicationObject().getApplicationObjectMetadata();
        var oNodeMetadata = oMetadata.nodes[sNodeName];
        if (!oNodeMetadata) {
            jQuery.sap.log.error(sNodeName + " in " + this.getObjectName() + " is not known");
            return 0;
        }

        if (oNodeMetadata.parentNode !== Node.Root) {
            jQuery.sap.log.error("addChild only works for subnodes of Root");
            return 0;
        }

        var iHandle = this.getNextHandle();
        oChild[oNodeMetadata.primaryKey] = iHandle;
        var oNodeArray = this.getProperty("/" + sNodeName);
        if (!oNodeArray) {
            oNodeArray = [];
            this.setProperty("/" + sNodeName, oNodeArray);
        }
        oNodeArray.push(oChild);
        this.checkUpdate(true);
        return iHandle;
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.removeChild = function(oChild) {
        visitDataTree(this.getData(), Node.Root, function(oData, sNodeName, oParent) {
            if (oData === oChild) {
                if (!oParent || !jQuery.isArray(oParent)) {
                    jQuery.sap.log.error("No parent available to remove child");
                    return;
                }
                var iIndex = oParent.indexOf(oChild);
                if (iIndex >= 0) {
                    oParent.splice(iIndex, 1);
                } else {
                    jQuery.sap.log.error("Child not found");
                }
            }
        });
        this.checkUpdate(true);
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.getNextHandle = function() {
        if (!this._iNextHandle) {
            this._iNextHandle = -1;
        }
        return this._iNextHandle--;
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.setAfterInitChanges = function() {
        if (this.isNew()) {
            this._oDeterminationData = jQuery.extend(true, {}, this.getData());
        } else {
            this._oBeforeData = jQuery.extend(true, {}, this.getData());
        }
    };

    sap.ui.ino.models.core.ApplicationObject.prototype.getBeforeData = function() {
        return this._oBeforeData;
    };

    sap.ui.ino.models.core.ApplicationObject.setMetaModel = function(oModel) {
        oMetaModel = oModel;
    };

}());