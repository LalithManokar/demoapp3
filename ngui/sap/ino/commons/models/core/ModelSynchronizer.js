/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObjectChange",
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/ui/base/ManagedObject",
    "sap/ui/model/odata/v2/ODataListBinding"
], function(ApplicationObjectChange,
            PropertyModel,
            ManagedObject,
            ODataListBinding) {
    "use strict";

    /**
     * A collection of application object instances to be synchronized
     */
    var oObjects = {}; 
    
    /**
     * A collection of application object instance dependencies. One dependence is an object:
     * 1. application object instance
     * 2. dependent model instance
     * 3. function to be called when the application object instance is changed
     */
    var oDependencies = {};
    
    /**
     * A reference to the global OData model that has to be synchronized.
     */
    var oODataModel;
    
    var ModelSynchronizer = ManagedObject.extend("sap.ino.commons.models.core.ModelSynchronizer", {
        metadata : {
        }
    });

    ModelSynchronizer = new ModelSynchronizer({});

    /**
     * Copies the values of oData object properties to the corresponding
     * properties of oInstance application object.
     */
    function updateAOInstance(oNewInstanceData, oAOInstance) {
        if (oAOInstance && oNewInstanceData) {
            for (var prop in oNewInstanceData) {
                if (oNewInstanceData.hasOwnProperty(prop)) {
                    oAOInstance.setProperty("/" + prop, oNewInstanceData[prop]);
                }
            }
            return true;
        }
        return false;
    }

    /**
     * Copies the values of oSource object properties to
     * the corresponding properties of oTarget object.
     */
    function copyProperties(oSource, oTarget) {
        if (oSource && oTarget) {
            for (var prop in oTarget) {
                if (oSource.hasOwnProperty(prop) && oTarget.hasOwnProperty(prop)) {
                    if(oTarget[prop] && typeof oTarget[prop] === "object" && (oTarget[prop].hasOwnProperty("__deferred") 
                        || oTarget[prop].hasOwnProperty("__list")
                        || oTarget[prop].hasOwnProperty("__ref"))){
                        continue;
                    }
                    oTarget[prop] = oSource[prop];
                }
            }
            return true;
        }
        return false;
    }

    /**
     * Constructs an OData entity key from the entity name and an object key
     */
    function getEntityKey(sEntitySetName, vKey) {
        var oCalcViewRegex = new RegExp("^" + sEntitySetName + "\\(.*" + vKey + "\\)$");
        var oCalcViewRegex2 = new RegExp("^" + sEntitySetName + "\\(.*(')(" + vKey + ")\\1\\)$");
        var oCalcViewRegex3 = new RegExp("^" + sEntitySetName + "\\(.*=" + vKey + "\\)$");
        var oCalcViewRegex4 = new RegExp("^" + sEntitySetName + "\\(.*(=')(" + vKey + ")\\1\\)$");
        var oData = oODataModel.getProperty("/");
    	var sEntityKey;
    	var aEntityKey=[];
        jQuery.each(oData, function(sKey) {
            if (oCalcViewRegex.test(sKey) || oCalcViewRegex2.test(sKey)) {
                aEntityKey.push(sKey);
            }
        });
        if (aEntityKey.length > 1) {
            aEntityKey.forEach(function(sKey) {
                if (oCalcViewRegex3.test(sKey) || oCalcViewRegex4.test(sKey)) {
                    sEntityKey = sKey;
                }
            } );
        } else {
            sEntityKey = aEntityKey && aEntityKey[0];
        }    
        return sEntityKey;
    }
    
    function removeEntityFromListBindings(sEntityKey, aListBindingsToUpdate){
        var aUpdatedListBindings;
        if (aListBindingsToUpdate && aListBindingsToUpdate.length > 0) {
            aUpdatedListBindings = [];
            aListBindingsToUpdate.forEach(function(oBindingToUpdate) {
                var iContextIndex = -1;
                if (oBindingToUpdate.aLastContexts && oBindingToUpdate.aLastContexts.length > 0) {
                    oBindingToUpdate.aLastContexts.forEach(function(oLastContext, iCurrentContextIndex) {
                        if (oLastContext.getPath() === "/" + sEntityKey) {
                            iContextIndex = iCurrentContextIndex;
                        }
                    });
                }
                
                if (iContextIndex > -1) {
                    aUpdatedListBindings.push({
                        "index": iContextIndex,
                        "bindingContext": oBindingToUpdate.aLastContexts[iContextIndex],
                        "bindingToUpdate": oBindingToUpdate,
                        "isClientOperation": oBindingToUpdate.bClientOperation,
                        "allKeys": oBindingToUpdate.aAllKeys
                    });
                    oBindingToUpdate.bClientOperation = true;
                    oBindingToUpdate.aAllKeys = oBindingToUpdate.aKeys.slice();
                    oBindingToUpdate.aKeys.splice(iContextIndex, 1);
                    oBindingToUpdate.aLastContexts.splice(iContextIndex, 1);
                }
            });
        }
        return aUpdatedListBindings;
    }
    
    function addEntityToListBindings(mBindingsToUpdate) {
        jQuery.each(mBindingsToUpdate, function(sEntityKey, aCurrentBindingsToUpdate) {
            aCurrentBindingsToUpdate.forEach(function(oTemp) {
                oTemp.bindingToUpdate.bClientOperation = true;
                oTemp.bindingToUpdate.aAllKeys = oTemp.bindingToUpdate.aKeys.slice();
                oTemp.bindingToUpdate.aKeys.splice(oTemp.index, 0, sEntityKey);
                oTemp.bindingToUpdate.aLastContexts.splice(oTemp.index, 0, oTemp.bindingContext);
            });
        });
    }
    
    function resetListBindingParameters(mBindingsToUpdate) {
        jQuery.each(mBindingsToUpdate, function(sEntityKey, aCurrentBindingsToUpdate) {
            aCurrentBindingsToUpdate.forEach(function(oTemp) {
                oTemp.bindingToUpdate.bClientOperation = oTemp.isClientOperation;
                oTemp.bindingToUpdate.aAllKeys = oTemp.allKeys;
            });
        });
    }
    
    /**
     * Copies the content of oData object to the OData entities identified by
     * entity set names contained in aEntitySetNames and vKey
     */
    function syncODataModels(aEntitySetNames, vKey, oData) {
        var mBindingsToUpdate = {};
        var mChangedEntities = {};
        var bListBindingRequiresUpdate = false;
        jQuery.each(aEntitySetNames, function(iIndex, sEntitySetName) {
            function odataListBindingWithMatchingEntitySetName(oBinding) {
                function getPrefixBeforeType(sName){
                    if (sName && sName.length > 3) {
                        return sName.substring(0, sName.length - 4);
                    }
                    return sName;
                }
                if (oBinding instanceof ODataListBinding) {
                    var sBindingEntitySetName = oBinding && oBinding.oEntityType && oBinding.oEntityType.name;
                    sBindingEntitySetName = getPrefixBeforeType(sBindingEntitySetName) + "Type" === sBindingEntitySetName ? getPrefixBeforeType(sBindingEntitySetName) : undefined;
                    return sBindingEntitySetName === sEntitySetName || oBinding.getPath() === "/" + sEntitySetName;
                }
                return false;
            }
            var sEntityKey = getEntityKey(sEntitySetName, vKey);
            var oTarget = oODataModel.getProperty("/" + sEntityKey);
            if (oTarget) {
                copyProperties(oData, oTarget);
                mChangedEntities[sEntityKey] = true;
                var aListBindingsToUpdate = oODataModel.aBindings.filter(odataListBindingWithMatchingEntitySetName);
                bListBindingRequiresUpdate = aListBindingsToUpdate.length > 0;
                if (bListBindingRequiresUpdate) {
                    var aBindingsToUpdate = removeEntityFromListBindings(sEntityKey, aListBindingsToUpdate);
                    if (aBindingsToUpdate) {
                        mBindingsToUpdate[sEntityKey] = aBindingsToUpdate;
                    }
                }
            }
        });
        oODataModel.checkUpdate(true, false, mChangedEntities);
        if (bListBindingRequiresUpdate) {
            addEntityToListBindings(mBindingsToUpdate);
            oODataModel.checkUpdate(true, false, mChangedEntities);
            resetListBindingParameters(mBindingsToUpdate);
        }
    }
    
    /**
     * Adds the application object instance to the collection of 
     * application object instances to be kept in sync
     */
    ModelSynchronizer.putApplicationObject = function(sApplicationObjectKey, oInstance) {
        var sApplicationObjectName = oInstance.getApplicationObject().getMetadata().getName();
        if (!oObjects[sApplicationObjectName]) {
            oObjects[sApplicationObjectName] = {};
        }
        if (!oObjects[sApplicationObjectName][sApplicationObjectKey]) {
            oObjects[sApplicationObjectName][sApplicationObjectKey] = [];
        }
        var aInstances = oObjects[sApplicationObjectName][sApplicationObjectKey];
        if (jQuery.inArray(oInstance, aInstances) === -1) {
            aInstances.push(oInstance);
        }
    };
    
    /**
     * Remove application object instance from the list of instances synchronized by ModelSynchronizer.
     */
    ModelSynchronizer.removeApplicationObject = function(sApplicationObjectKey, oInstance) {
        var sApplicationObjectName = oInstance.getApplicationObject().getMetadata().getName();
        var aInstances = oObjects && oObjects[sApplicationObjectName] && oObjects[sApplicationObjectName][sApplicationObjectKey];
        if (aInstances) {
            oObjects[sApplicationObjectName][sApplicationObjectKey] = jQuery.grep(aInstances, function(oAOInstance, iIndex){
                return oInstance !== oAOInstance;
            });    
        }
    };
    
    /**
     * Retrieves a set of application object instances with the given type and key
     */
    ModelSynchronizer.getApplicationObject = function(sApplicationObjectName, sApplicationObjectKey) {
        return oObjects && oObjects[sApplicationObjectName] && oObjects[sApplicationObjectName][sApplicationObjectKey];
    };
    
    /**
     * Add a dependency between two models. The dependency consists of the application object instance,
     * the dependent model instance, and a function that is executed. Once the application object instance
     * is changed, the function is called with arguments:
     * the changed application object instance and the dependent model.
     */
    ModelSynchronizer.addAOInstanceDependency = function(oAOInstance, oDependentModel, fnSyncFunction) {
        if (oAOInstance && oDependentModel && fnSyncFunction) {
            var oInstanceDependencies = oDependencies[oAOInstance];
            if (!oInstanceDependencies) {
                oDependencies[oAOInstance] = {};
                oInstanceDependencies = oDependencies[oAOInstance];
            }
            oInstanceDependencies[oDependentModel] = {"dependentModel": oDependentModel, "syncFunction": fnSyncFunction};
            return true;
        }
        return false;
    };
    
    /**
     * Set an ODataModel to be kept in sync
     */
    ModelSynchronizer.setODataModel = function(oNewODataModel) {
        oODataModel = oNewODataModel;
    };
    
    /**
     * Obtain an ODataModel that is kept in sync
     */
    ModelSynchronizer.getODataModel = function() {
        return oODataModel;
    };
    
    ModelSynchronizer._getApplicationObjectByName = function(sImpactedObjectName) {
        jQuery.sap.require(sImpactedObjectName);
        return jQuery.sap.getObject(sImpactedObjectName, 0);
    };
    
    ModelSynchronizer.syncEntity = function (oEntitySet) {
        var oDeferred = new jQuery.Deferred();
        var sEntityKey = getEntityKey(oEntitySet.entitySetName, oEntitySet.entitySetKey);
            if (sEntityKey) {
                oODataModel.read("/" + sEntityKey, {
                success: function(oData) {
                    syncODataModels([oEntitySet.entitySetName], oEntitySet.entitySetKey, oData);
                    oDeferred.resolve({
                        success: true
                    });
                },
                error: function(oRequestInfo) {
                    // 404 is OK entities might not me there any more due to different
                    // filter criteria e.g. in OData
                    if (oRequestInfo.response.statusCode !== 404) {
                        jQuery.sap.log.error("Error when retrieving " + oEntitySet.entitySetKey,
                            undefined,
                            "sap.ino.commons.models.core.ModelSynchronizer");
                    }
                    oDeferred.reject({
                        success: true
                    });
                }
            });
        } else {
            oDeferred.reject({
                success: true
            });
        }
        
        return oDeferred.promise();
    };
    
    ModelSynchronizer.update = function (oInstance, sActionName, oApplicationObject, vKey, oData, oChangeRequest) {
        if (oInstance) {
            oApplicationObject = oApplicationObject || oInstance.getApplicationObject();
            vKey = vKey || oInstance.getKey();
            oData = oData || oInstance.getData();
        }
        var aEntitySetNames = oApplicationObject && oApplicationObject.invalidation && oApplicationObject.invalidation.entitySets;
        var aAOInstances;
        if (oData) {
            /**
             * The application object that triggered the change event
             * has inconsistent OData models. These models have to be updated.
             */
            if (aEntitySetNames) {
                syncODataModels(aEntitySetNames, vKey, oData);
            }
            aAOInstances = vKey && oApplicationObject && ModelSynchronizer.getApplicationObject(oApplicationObject.getMetadata().getName(), vKey);
            if (aAOInstances && aAOInstances.length > 1) {
                jQuery.each(aAOInstances, function(iIndex, oAOInstance){
                    if (oAOInstance !== oInstance) {
                        updateAOInstance(oData, oAOInstance);
                    }
                });
                //update property models of the impacted AO instances
                if (oInstance && oInstance.getPropertyModel()) {
                    oInstance.getPropertyModel().getDataInitializedPromise().done(function () {
                        jQuery.each(aAOInstances, function(iIndex, oAOInstance){
                            if (oAOInstance !== oInstance && oAOInstance.getPropertyModel()) {
                                oAOInstance.getPropertyModel().sync(vKey, true);
                            }
                        });    
                    });
                }
            }
        } else {
            // A static action is handled
            if (!oInstance && vKey && sActionName !== "del") {
                var sAOName = oApplicationObject.getMetadata().getName();
                var oStaticAO = ModelSynchronizer._getApplicationObjectByName(sAOName);
                var oStaticRequest = oStaticAO.readData(vKey, {model: oODataModel, onlyRoot: true});
                if (oStaticRequest) {
                    oStaticRequest.done(function (oSData) {
                        if (aEntitySetNames) {
                            syncODataModels(aEntitySetNames, vKey, oSData);
                        }
                        // Check if there is an application objects instance to be updated
                        var aSAOInstances = ModelSynchronizer.getApplicationObject(sAOName, vKey);
                        if (aSAOInstances) {
                            jQuery.each(aSAOInstances, function(iIndex, oSAOInstance){
                                updateAOInstance(oSData, oSAOInstance);
                            });
                        }
                    });
                }
                PropertyModel.invalidateCachedProperties(oApplicationObject.getObjectName(), vKey);
            }
        }
        
        /**
         * The change of application object that triggered the event impacts other
         * application objects. The models describing these objects have to be updated
         */
        // Check if there are application object types that are impacted by the application object event
        var aImpacted = sActionName &&
                        oApplicationObject.actionImpacts &&
                        oApplicationObject.actionImpacts[sActionName];
            
        var aImpactedAOs = [];
        if (aImpacted) {
            aImpacted.forEach(function(oImpacted) {
                if (oImpacted.objectName !== undefined) {
                    aImpactedAOs.push(oImpacted);
                }
            });
        }
        if (aImpactedAOs && aImpactedAOs.length > 0) {
            // There are application object types impacted by the application object event
            jQuery.each(aImpactedAOs, function(iIndex, oImpacted) {
                // Retrieve data about the impacted application objects
                var sImpactedObjectName = oImpacted.objectName;
                var aObjectKey = oChangeRequest &&
                                 oImpacted.objectKey &&
                                 oChangeRequest[oImpacted.objectKey];
                if (aObjectKey && !Array.isArray(aObjectKey)) {
                    aObjectKey = [aObjectKey];
                }
                if (aObjectKey && sImpactedObjectName) {
                    var oImpactedAO = ModelSynchronizer._getApplicationObjectByName(sImpactedObjectName);
                    // Request the new data for the impacted application object
                    var sImpactedAOName = oImpactedAO.getMetadata().getName();
                    var oSettings = {model: oODataModel, projection: oImpacted.impactedAttributes};
                    jQuery.each(aObjectKey, function (iObjectKeyIndex, vObjectKey) {
                        var oApplicationObjectRequest = oImpactedAO.readSource(vObjectKey,
                                                                               sImpactedAOName,
                                                                               {},
                                                                               oSettings);
                        oApplicationObjectRequest.done(function(oTempData) {
                            var aImpactedEntitySetNames = oImpactedAO &&
                                                          oImpactedAO.invalidation &&
                                                          oImpactedAO.invalidation.entitySets;
                            syncODataModels(aImpactedEntitySetNames, vObjectKey, oTempData);
                            // Check if there is an application objects instance to be updated
                            aAOInstances = ModelSynchronizer.getApplicationObject(sImpactedObjectName, vObjectKey);
                            if (aAOInstances) {
                                jQuery.each(aAOInstances, function(iAOInstanceIndex, oAOInstance){
                                    updateAOInstance(oTempData, oAOInstance);
                                });
                            }
                        });
                    });
                }
            });
        }

        if (aImpacted) {
            aImpacted.forEach(function(oImpacted) {
                if (oImpacted.entitySetName !== undefined) {
                    ModelSynchronizer.syncEntity(oImpacted);
                }
            });
        }
        
        // Check if changed application object instance has additional dependents that need an update
        var oInstanceDependencies = oInstance && oDependencies && oDependencies[oInstance];
        if (oInstanceDependencies) {
            jQuery.each(oInstanceDependencies, function(i, oDependency){
                if (oDependency && oDependency.dependentModel && oDependency.syncFunction) {
                    oDependency.syncFunction(oInstance, oDependency.dependentModel);
                }
            });
        }
        
        if (sActionName === "del" && aAOInstances) {
            aAOInstances.forEach(function(oAOInstance) {
                ModelSynchronizer.removeApplicationObject(oInstance.getKey(), oAOInstance);
                oAOInstance._isDeleted = true;
            });
            delete oObjects[oApplicationObject.getMetadata().getName()][vKey];
        }
    };

    ApplicationObjectChange.attachChange(ApplicationObjectChange.Action.All, function (oEvent) {
        var oInstance = oEvent.getParameter("instance");
        var sActionName = oEvent.getParameter("actionName");
        var oApplicationObject = oEvent.getParameter("object");
        var vKey = oEvent.getParameter("key");
        var oData = oEvent.getParameter("dataUpdate");
        var oChangeRequest = oEvent.getParameter("changeRequest"); 
        ModelSynchronizer.update(oInstance, sActionName, oApplicationObject, vKey, oData, oChangeRequest);
    });
    
    return ModelSynchronizer;
});