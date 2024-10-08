/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ino/commons/models/aof/MetaModel",
    "sap/ui/base/ManagedObject",
    "sap/ui/model/Sorter",
    "sap/ui/core/format/DateFormat"
], function(MetaModel, ManagedObject, Sorter, DateFormat) {
    "use strict";
    var ReadSource = {};

    var Node = {
        Root : "Root"
    };
    
    var oDateFormat = DateFormat.getDateInstance({
        pattern : "yyyy-MM-dd"
    });

    /*
     * Read the data for the specified entity set from OData. One-level children are read in separate calls, deeper
     * children are read with the Root node using OData expands. The deep child paths and the nodes to read can be
     * controlled with the settings parameters:
     * 
     * oSettings.deepChildPaths = { SubNode1 : "SubNode1/Node1" } oSettings.excludeNodes = ["Node1"];
     * oSettings.includeNodes = [{ name : "Node1", parentNode : "Root" }]; 
     * oSettings.async = false 
     * oSettings.onlyRoot = true 
     * oSettings.useBuffer = true
     * 
     * Static settings and dynamic additional settings are merged before reading the source
     */
    ReadSource.getDefaultODataSource = function(sEntitySetName, oSettings, oODataModel) {
        var fnDefaultReadSource = function(vKey, sObjectName, oMetadata, oAdditionalSettings) {
            oODataModel = oODataModel || oAdditionalSettings.model;
            var grpSetting = oAdditionalSettings.groupSetting;
            var oResultData = {};

            vKey = typeof (vKey) === "string" ? "'" + vKey + "'" : vKey;
            if (jQuery.isPlainObject(vKey)) {
                var aKeys = jQuery.map(vKey, function(sValue, sName) {
                    return sName + "='" + sValue + "'";
                });
                vKey = aKeys.join(",");
            }

            var sBasePath = "/" + sEntitySetName + "(" + vKey + ")";
            var aParameter = null;

            // Combine metadata nodes and included nodes
            var oNodes = jQuery.extend({}, oMetadata.nodes);

            // Settings
            oSettings = fnDefaultReadSource.settings(oAdditionalSettings);

            if (oSettings && oSettings.includeNodes) {
                jQuery.each(oSettings.includeNodes, function(i, oIncludeNode) {
                    if (!oNodes[oIncludeNode.name]) {
                        oNodes[oIncludeNode.name] = oIncludeNode;
                    }
                });
            }
            
            // Handle deep child nodes as expand parameters
            var aDeepChildPath = getDeepChildPaths(oNodes);
            if (aDeepChildPath.length > 0) {
                aParameter = ["$expand=" + aDeepChildPath.join(",")];
            }
            
            if (oSettings && oSettings.projection && oSettings.projection.length > 0) {
                var sSelect = "$select=";
                jQuery.each(oSettings.projection, function(i, oAttributeName) {
                    if (oSettings.projection.length - 1 === i) {
                        sSelect += oAttributeName;
                    } else {
                        sSelect += oAttributeName + ",";
                    }
                });
                if (!aParameter) {
                    aParameter = [];
                }
                aParameter.push(sSelect);
            }

            // Read entity
            var bAsync = true;
            if (oSettings && oSettings.async !== undefined) {
                bAsync = oSettings.async;
            }

            var bUseBuffer = oSettings && oSettings.useBuffer;

            var aDeferred = [];

            var oDeferred = new jQuery.Deferred();
            if (!bUseBuffer) {
                oODataModel.read(sBasePath, {
                    urlParameters : aParameter,
                    success : function(oData) {
                        jQuery.extend(oResultData, defaultDeepPaths(cleanData(oData), aDeepChildPath));
                        oDeferred.resolve(oData);
                    },
                    error : function(oError) {
                        oODataModel.fireRequestFailed((oError && oError.response) ? oError.response : {
                            statusCode : 400
                        });
                        oDeferred.reject(oError);
                    }
                });
            } else {
                oODataModel.createBindingContext("/" + sBasePath, null, aParameter, function(oContext) {
                    if (oContext && oContext.getObject()) {
                        var oData = oContext.getObject();
                        jQuery.extend(oResultData, defaultDeepPaths(cleanData(oData), aDeepChildPath));
                        oDeferred.resolve(oData);
                    } else {
                        oDeferred.reject();
                    }
                });
            }
            aDeferred.push(oDeferred);

            // Read entity association
            function readChildData(sNodeName) {
                var sChildPath = sBasePath + "/" + sNodeName;
                var oDeferred = new jQuery.Deferred();
                var oNode = oMetadata.nodes[sNodeName];
                var aSorter = oNode && [new Sorter(oNode.primaryKey)];

                if (!bUseBuffer) {
                    oODataModel.read(sChildPath, {
                        async : true,
                        groupId: grpSetting && grpSetting[sNodeName],
                        // make sure to have a defined sort order, which is usually the insert order
                        sorters : aSorter,
                        success : function(oData) {
                            oResultData[sNodeName] = cleanData(oData);
                            oDeferred.resolve(oData);
                        },
                        error : function(oError) {
                            if (oError.statusCode == 404) {
                                oResultData[sNodeName] = [];
                                oDeferred.resolve([]);
                            } else {
                                oDeferred.reject(oError);
                            }
                        }
                    });
                } else {
                    oODataModel.createBindingContext("/" + sChildPath, null, null, function(oContext) {
                        if (oContext && oContext.getObject()) {
                            var oData = oContext.getObject();
                            oResultData[sNodeName] = cleanData(oData);
                            oDeferred.resolve(oData);
                        } else {
                            oDeferred.resolve([]);
                        }
                    });
                }
                return oDeferred;
            }

            var bOnlyRoot = oSettings && oSettings.onlyRoot;
            if (!bOnlyRoot) {
                for ( var sNodeName in oNodes) {
                    var oNode = oNodes[sNodeName];
                    if (oNode.name == Node.Root || oNode.parentNode != Node.Root) {
                        continue;
                    }
                    if (oSettings && oSettings.excludeNodes && oSettings.excludeNodes.indexOf(sNodeName) >= 0) {
                        continue;
                    }
                    var bFound = false;
                    for (var i = 0; i < aDeepChildPath.length; i++) {
                        var sDeepChildPath = aDeepChildPath[i];
                        if (sDeepChildPath.indexOf(sNodeName) === 0) {
                            bFound = true;
                            break;
                        }
                    }
                    if (oSettings && oSettings.deepChildPaths) {
                        if (oSettings.deepChildPaths[sNodeName]) {
                            bFound = true;
                        }
                    }
                    if (bFound) {
                        continue;
                    }
                    aDeferred.push(readChildData(sNodeName));
                }
            }

            var oResultDeferred = new jQuery.Deferred();
            var oPromise = jQuery.when.apply(jQuery, aDeferred);
            oPromise.done(function() {
                var sConcurrencyToken = oMetadata.isConcurrencyControlEnabled ? calculateConcurrencyToken(oResultData, oMetadata.nodes[Node.Root]) : undefined;
                visitTree(oResultData, oMetadata, "Root", processODataNode);
                oResultDeferred.resolve(oResultData, sConcurrencyToken);
            });
            oPromise.fail(function(oError) {
                oResultDeferred.reject(oError);
            });
            return oResultDeferred.promise();
        };

        function defaultDeepPaths(oData, aDeepChildPath) {
            for (var i = 0; i < aDeepChildPath.length; i++) {
                var sDeepChildPath = aDeepChildPath[i];
                var aDeepChildPathPart = sDeepChildPath.split("/");
                var oDataPart = oData;
                for (var j = 0; j < aDeepChildPathPart.length; j++) {
                    var sDeepChildPathPart = aDeepChildPathPart[j];
                    if (oDataPart[sDeepChildPathPart] === undefined) {
                        break;
                    }
                    if (oDataPart[sDeepChildPathPart] == null) {
                        oDataPart[sDeepChildPathPart] = [];
                        break;
                    }
                    oDataPart = oDataPart[sDeepChildPathPart];
                }
            }
            return oData;
        }

        function getDeepChildPaths(oNodes) {
            var aDeepChildPath = [];
            var sNodeName;
            for (sNodeName in oNodes) {
                var oNode = oNodes[sNodeName];
                if (oNode.name == Node.Root) {
                    continue;
                }
                if (oSettings && oSettings.excludeNodes && oSettings.excludeNodes.indexOf(sNodeName) >= 0) {
                    continue;
                }
                if (oSettings && oSettings.deepChildPaths && oSettings.deepChildPaths[sNodeName]) {
                    continue;
                }
                var sChildPath = buildDeepPath(oNode, oNodes);
                if (sChildPath && sChildPath.indexOf("/") != -1) {
                    aDeepChildPath.push(sChildPath);
                }
            }
            if (oSettings && oSettings.deepChildPaths) {
                for (sNodeName in oSettings.deepChildPaths) {
                    if (oSettings && oSettings.excludeNodes && oSettings.excludeNodes.indexOf(sNodeName) >= 0) {
                        continue;
                    }
                    var sDeepChildPath = oSettings.deepChildPaths[sNodeName];
                    if (sDeepChildPath.indexOf("/") !== -1) {
                        aDeepChildPath.push(sDeepChildPath);
                    }
                }
            }
            // Remove duplicates
            aDeepChildPath = aDeepChildPath.filter(function(value, index, array) {
                return array.indexOf(value) === index;
            });
            aDeepChildPath.sort();
            return aDeepChildPath;
        }

        function buildDeepPath(oNode, oNodes) {
            var sPath = oNode.name;
            while (oNode.parentNode && oNode.parentNode != Node.Root) {
                oNode = oNodes[oNode.parentNode];
                sPath = oNode.name + "/" + sPath;
            }
            return sPath;
        }

        function calculateConcurrencyToken(oData, oNode) {
            var oTokenObject = {};
            jQuery.each(oNode.attributes, function(sAttributeName, oAttribute) {
                if (oAttribute.concurrencyControl) {
                    var sValue = oData[sAttributeName];
                    if (sValue instanceof Date) {
                        sValue = sValue.toISOString();
                    }
                    oTokenObject[sAttributeName] = sValue;
                }
            });
            return JSON.stringify(oTokenObject);
        }

        (function(oSettings) {
            fnDefaultReadSource.settings = function(oAdditionalSettings) {
                if (oAdditionalSettings) {
                    return mergeSettings(oSettings, oAdditionalSettings);
                }
                return oSettings;
            };

            function mergeSettings(oSettings, oAdditionalSettings) {
                oSettings = oSettings || {};
                oAdditionalSettings = oAdditionalSettings || {};
                return {
                    deepChildPaths : jQuery.extend(oSettings.deepChildPaths || {}, oAdditionalSettings.deepChildPaths || {}),
                    excludeNodes : (oSettings.excludeNodes || []).concat(oAdditionalSettings.excludeNodes || []),
                    includeNodes : (oSettings.includeNodes || []).concat(oAdditionalSettings.includeNodes || []),
                    projection : (oSettings.projection || []).concat(oAdditionalSettings.projection || []),
                    async : oAdditionalSettings.async !== undefined ? oAdditionalSettings.async : oSettings.async,
                    onlyRoot : oAdditionalSettings.onlyRoot !== undefined ? oAdditionalSettings.onlyRoot : oSettings.onlyRoot,
                    useBuffer : oAdditionalSettings.useBuffer !== undefined ? oAdditionalSettings.useBuffer : oSettings.useBuffer
                };
            }
        }(oSettings));

        fnDefaultReadSource.entitySetName = sEntitySetName;

        return fnDefaultReadSource;
    };

    /*
     * Read the data for the specified entity set from default AOF endpoint
     * 
     * Static settings and dynamic additional settings are merged before reading the source
     * 
     * oSettings.cache: Flag to control the cache behaviour of the ajax call
     * oSettings.async: Flag to control the async processing of the ajax call
     * oSettings.headers: Header object pass to the ajax call
     */

    ReadSource.getDefaultAOFSource = function(oSettings) {
        return function(vKey, sObjectName, oMetadata, oAdditionalSettings) {
            var oDeferred = new jQuery.Deferred();

            var oEffectiveSettings = jQuery.extend({}, oSettings, oAdditionalSettings);

            var sURL = MetaModel.getEndpoint(sObjectName);
            var oAjaxPromise = jQuery.ajax({
                url : sURL + "/" + vKey,
                type : "GET",
                dataType : "json",
                async : oEffectiveSettings.async !== undefined ? oEffectiveSettings.async : true,
                cache : oEffectiveSettings.cache,
                contentType : "application/json",
                headers : oEffectiveSettings.headers || undefined
            });

            oAjaxPromise.done(function(oResponse, sStatusText, oJQXHR) {
                var sConcurrencyToken = oJQXHR.getResponseHeader("ETag");
                visitTree(oResponse, oMetadata, "Root", processNode);
                oDeferred.resolve(oResponse, sConcurrencyToken);
            });
            oAjaxPromise.fail(function(oResponse) {
                oDeferred.reject(oResponse);
            });

            return oDeferred.promise();
        };
    };
    
    function processNode(oNode, oNodesMetadata, sNodeName) {
        if (oNode && oNodesMetadata && sNodeName && jQuery.isPlainObject(oNode)) {
            var aNodeAttributesMetadata = oNodesMetadata.nodes && 
                                      oNodesMetadata.nodes[sNodeName] && 
                                      oNodesMetadata.nodes[sNodeName].attributes;
            if (aNodeAttributesMetadata) {
                jQuery.each(aNodeAttributesMetadata, function(iIndex, oAttribute){
                    if (oAttribute.dataType) { 
                       if (oAttribute.dataType === "TIMESTAMP") {
                           oNode[iIndex] = new Date(oNode[iIndex]);
                       }
                    }
                });
            }
        }
    }
    
    function processODataNode(oNode, oNodesMetadata, sNodeName) {
        if (oNode && oNodesMetadata && sNodeName && jQuery.isPlainObject(oNode)) {
            var aNodeAttributesMetadata = oNodesMetadata.nodes && 
                                      oNodesMetadata.nodes[sNodeName] && 
                                      oNodesMetadata.nodes[sNodeName].attributes;
            if (aNodeAttributesMetadata) {
                jQuery.each(aNodeAttributesMetadata, function(iIndex, oAttribute){
                    if (oAttribute.dataType && oAttribute.dataType === "DOUBLE") {
                        if (oNode[iIndex] !== null) {
                            oNode[iIndex] = parseFloat(oNode[iIndex]);
                        }
                    }
                    if (oAttribute.dataType === "DATE") {
                        oNode[iIndex] = oDateFormat.format(oNode[iIndex]);
                    }
                });
            }
        }
    }
    
    function visitTree(oNode, oNodesMetadata, sNodeName, fnProcessNode) {
        if (oNode && oNodesMetadata && sNodeName && fnProcessNode) {
            fnProcessNode(oNode, oNodesMetadata, sNodeName);
            for (var sProperty in oNode) {
                var aChildNodes = oNode[sProperty];
                if (aChildNodes && oNode.hasOwnProperty(sProperty) && jQuery.isArray(aChildNodes) && aChildNodes.length > 0) {
                    jQuery.each(aChildNodes, function (iIndex, oChildNode) {
                        if(jQuery.isPlainObject(oChildNode)) {
                            visitTree(oChildNode, oNodesMetadata, sProperty, fnProcessNode);
                        }
                    });
                }
            }
        }
    }

    function cleanData(oData) {
        if (!oData) {
            return {};
        }
        oData = jQuery.extend(true, {}, oData);
        var oCleanData;
        if (oData.results) {
            // Remove artificial results structure
            oCleanData = [];
            jQuery.each(oData.results, function(i, oResultData) {
                oCleanData.push(cleanData(oResultData));
            });
        } else {
            // Remove artificial metadata structure
            if (oData.__metadata) {
                delete oData.__metadata;
            }
            // Remove artificial deferred structure (recursively)
            jQuery.each(oData, function(sProperty, oProperty) {
                if (oProperty && oProperty.constructor == Object) {
                    if (oProperty.__deferred) {
                        delete oData[sProperty];
                    } else {
                        oData[sProperty] = cleanData(oProperty);
                    }
                }
                if (oProperty && jQuery.isArray(oProperty)) {
                    jQuery.each(oProperty, function(i, oChildProperty) {
                        cleanData(oChildProperty);
                    });
                }
            });
            oCleanData = oData;
        }
        return oCleanData;
    }

    ReadSource.cleanData = cleanData;
    
    ReadSource.setMetaModel = function(oMetaModel) {
        MetaModel = oMetaModel;
    };
    
    return ReadSource;
});