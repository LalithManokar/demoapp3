/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.core.InvalidationManager");
jQuery.sap.require("sap.ui.ino.models.core.PropertyModel");

(function() {
    "use strict";

    var mDirtyObjects = {};

    sap.ui.base.ManagedObject.extend("sap.ui.ino.models.core.InvalidationManager", {
        metadata : {
            events : {
                "dirtyObjectRegistered" : {},
                "entityRevalidated" : {}
            }
        },
    });

    sap.ui.ino.models.core.InvalidationManager = new sap.ui.ino.models.core.InvalidationManager({});

    sap.ui.ino.models.core.InvalidationManager.registerDirtyObject = function(oApplicationObject, vKey, dChanged, bDeleted) {
        var that = this;
        dChanged = dChanged || new Date();
        sap.ui.ino.models.core.PropertyModel.invalidateCachedProperties(oApplicationObject.getObjectName(), vKey);
        if (!oApplicationObject.invalidation || !oApplicationObject.invalidation.entitySets) {
            return;
        }
        jQuery.each(oApplicationObject.invalidation.entitySets, function(iIndex, sEntitySet) {
            var sEntityKey = getEntityKey(sEntitySet, vKey);
            mDirtyObjects[sEntityKey] = dChanged;
            that.fireEvent("dirtyObjectRegistered", {
                applicationObject : oApplicationObject,
                key : vKey,
                entityKey : sEntityKey,
                deleted : bDeleted
            });
        });
    };

    sap.ui.ino.models.core.InvalidationManager.validateObject = function(oApplicationObject, vKey, sFilterEntityKey, oModel) {
        var sEntitySet = oApplicationObject.readSource.entitySetName;
        if (sEntitySet) {
            var sEntityKey = getEntityKey(sEntitySet, vKey);
            if (!sFilterEntityKey || sEntityKey == sFilterEntityKey) {
                return sap.ui.ino.models.core.InvalidationManager.validateEntity(sEntityKey, oModel);
            }
        }
        return false;
    };
    
    sap.ui.ino.models.core.InvalidationManager.validateObjectAll = function(oApplicationObject, vKey, sFilterEntityKey, oModel) {
        var bValidated = false;
        jQuery.each(oApplicationObject.invalidation.entitySets || [], function(iIndex, sEntitySet) {
            var sEntityKey = getEntityKey(sEntitySet, vKey);
            if (!sFilterEntityKey || sEntityKey == sFilterEntityKey) {
                if (sap.ui.ino.models.core.InvalidationManager.validateEntity(sEntityKey, oModel)) {
                    bValidated = true;
                }
            }
        });
        return bValidated;
    };

    sap.ui.ino.models.core.InvalidationManager.validateEntity = function(sEntityKey, oModel) {
        sEntityKey = normalizeEntityKey(sEntityKey);
        oModel = oModel || sap.ui.getCore().getModel();
        var dDirtyObjectChanged = getDirtyObject(sEntityKey);
        var oEntity = oModel.oData[sEntityKey];
        if (!oEntity || !dDirtyObjectChanged) {
            return true;
        }

        var dReadChangedAt = oEntity.CHANGED_AT;
        if (!dReadChangedAt || (dReadChangedAt.getTime() < dDirtyObjectChanged.getTime())) {
            var bSuccess = revalidateObject(sEntityKey, oModel);
            if (bSuccess) {
                this.fireEvent("entityRevalidated", {
                    entityKey : sEntityKey
                });
            }
            return bSuccess;
        }
        return true;
    };

    sap.ui.ino.models.core.InvalidationManager.getDirtyObjects = function() {
        return jQuery.extend({}, mDirtyObjects);
    };

    sap.ui.ino.models.core.InvalidationManager.recalculateAttributes = function(oApplicationObject, vKey, fnCalculate,
            oModel) {
        if (!oApplicationObject.invalidation || !oApplicationObject.invalidation.entitySets) {
            return;
        }
        var that = this;
        oModel = oModel || sap.ui.getCore().getModel();
        jQuery.each(oApplicationObject.invalidation.entitySets, function(iIndex, sEntitySet) {
            var aEntityKey = [];
            var sEntityKey = getEntityKey(sEntitySet, vKey);
            var oEntity = oModel.getProperty("/" + sEntityKey);
            if (oEntity) {
                aEntityKey.push(sEntityKey);
            } else {
            	aEntityKey = sap.ui.ino.models.core.InvalidationManager.findEntityKeys(sEntitySet, vKey, oModel);
            }
            jQuery.each(aEntityKey, function(iIndex, sEntityKey) {
                var getProperty = function(sProperty) {
                    return oModel.getProperty("/" + sEntityKey + "/" + sProperty);
                };
                var setProperty = function(sProperty, vValue) {
                    if (vValue !== undefined) {
                        // this is needed for OData models which prevent any change after the first unsubmitted one
                        // as we use OData in read-only mode this is not an issue
                        oModel.sChangeKey = null;
                        oModel.setProperty("/" + sEntityKey + "/" + sProperty, vValue);
                        that.fireEvent("entityRevalidated", {
                            entityKey : sEntityKey
                        });
                    }
                };
                fnCalculate(sEntitySet, getProperty, setProperty);
            });
        });
    };
    
    sap.ui.ino.models.core.InvalidationManager.findEntityKeys = function(sEntitySet, vKey, oModel){
    	var oCalcViewRegex = new RegExp("^" + sEntitySet + "\\(.*ID=" + vKey + "\\)$");
    	oModel = oModel || sap.ui.getCore().getModel();
        var oData = oModel.getProperty("/");
    	var aEntityKey = [];
        jQuery.each(oData, function(sKey) {
            if (oCalcViewRegex.test(sKey)) {
                aEntityKey.push(sKey);
            }
        });

        return aEntityKey;
    };
    
    sap.ui.ino.models.core.InvalidationManager.findEntityKeysWithFilter = function(sEntitySet, fnFilter, oModel){
        var rViewRegex = new RegExp("^" + sEntitySet + "\\(([0-9]*)\\)$");
        var rCalcViewRegex = new RegExp("^" + sEntitySet + "\\(.*ID=([0-9]*)\\)$");
        oModel = oModel || sap.ui.getCore().getModel();
        var aEntityKey = [];
        jQuery.each(oModel.oData, function(vEntitySetKey, oEntityData) {
            var vKey = null;
            var aMatch = rViewRegex.exec(vEntitySetKey);
            if (aMatch && aMatch.length > 1) {
                vKey = aMatch[1];
            } else {
                var aMatch = rCalcViewRegex.exec(vEntitySetKey);
                if (aMatch && aMatch.length > 1) {
                    vKey = aMatch[1];
                }
            }
            if (vKey) {
                if (fnFilter({
                    entitySetKey : vEntitySetKey, 
                    key : parseInt(vKey),
                    data : oEntityData
                })) {
                    aEntityKey.push(vKey);
                }
            }
        });
        return aEntityKey;
    };
    
    sap.ui.ino.models.core.InvalidationManager.entityKeyContainsId = function(sTableEntityKey, sId){
    	var aKeys = [/^(.*)\((.*)ID=(\d*)\)/,
    	             /^(.*)\((\d*)\)/];
    	for(var i = 0; i < aKeys.length; i ++){
    		if(aKeys[i].test(sTableEntityKey)){
                var aMatch = aKeys[i].exec(sTableEntityKey);
                if (aMatch && aMatch[aMatch.length - 1] === (sId + "")) {
                	return true;
                }
        	}	
    	}
    	
    	return false;
    };

    function getDirtyObject(sEntityKey) {
        var oDirtyObject = mDirtyObjects[sEntityKey];

        /**
         * Search calculation views do have a combined key containing the filter parameters and as last one the real
         * entity key
         * 
         * Example: IdeaMediumSearch(searchToken='ABC',tagsToken='',filterName='',ID=65)
         * 
         * As we cannot foresee when marking an object as dirty what searches have been done we parse the ID out of the
         * string and match it without the other tokens with the dirty buffer
         */

        if (!oDirtyObject) {
            var sNormalizedKey = undefined;
            var rKey = /^(.*)\(.*ID=(\d*)/;
            var aMatch = rKey.exec(sEntityKey);
            if (aMatch && aMatch.length > 2) {
                sNormalizedKey = getEntityKey(aMatch[1], aMatch[2]);
                oDirtyObject = mDirtyObjects[sNormalizedKey];
            }
        }

        return oDirtyObject;
    }

    function normalizeEntityKey(sEntityKey) {
        if (sEntityKey && sEntityKey.indexOf("/") === 0) {
            return sEntityKey.substr(1);
        } else {
            return sEntityKey;
        }
    }

    function getEntityKey(sEntitySet, vKey) {
        return sEntitySet + "(" + vKey + ")";
    };

    function revalidateObject(sKey, oModel) {
        delete oModel.oData[sKey];
        delete oModel.mContexts["/" + sKey];
        var bSuccess = true;
        oModel.read(sKey, null, null, false, function(oData) {
            // this is needed for OData models which prevent any change after the first unsubmitted one
            // as we use OData in read-only mode this is not an issue
            oModel.sChangeKey = null;
            // 2 slashes are required to create the correct object path in UI5
            oModel.setProperty("//" + sKey, oData);
            bSuccess = true;
        }, function(oRequestInfo) {
            // 404 is OK entities might not me there any more due to different
            // filter criteria e.g. in OData
            if (oRequestInfo.response.statusCode != 404) {
                jQuery.sap.log.error("Error when retrieving " + sKey, undefined,
                        "sap.ui.ino.models.core.InvalidationManager");
            }
            bSuccess = false;
        });
        return bSuccess;
    }

})();