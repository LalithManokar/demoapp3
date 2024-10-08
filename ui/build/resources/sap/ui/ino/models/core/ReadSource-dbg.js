/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.core.ReadSource");
jQuery.sap.require("sap.ui.ino.models.core.MetaModel");

(function() {
    "use strict";
    sap.ui.ino.models.core.ReadSource = {};

    var Node = {
        Root : "Root"
    };

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
    sap.ui.ino.models.core.ReadSource.getDefaultODataSource = function(sEntitySetName, oSettings, oODataModel) {
        var fnDefaultReadSource = undefined;
        fnDefaultReadSource = function(vKey, sObjectName, oMetadata, oAdditionalSettings) {
            var oResultData = {};

            vKey = typeof (vKey) === "string" ? "'" + vKey + "'" : vKey;
            if (jQuery.isPlainObject(vKey)) {
                var aKeys = jQuery.map(vKey, function(sValue, sName) {
                    return sName + "='" + sValue + "'";
                });
                vKey = aKeys.join(",");
            }

            var sBasePath = sEntitySetName + "(" + vKey + ")";
            oODataModel = oODataModel || sap.ui.getCore().getModel();

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

            // Read entity
            var bAsync = true;
            if (oSettings && oSettings.async != undefined) {
                bAsync = oSettings.async;
            }

            var bUseBuffer = oSettings && oSettings.useBuffer;

            var aDeferred = [];

            var oDeferred = new jQuery.Deferred();
            if (!bUseBuffer) {
                oODataModel.read(sBasePath, null, aParameter, bAsync, function(oData) {
                    jQuery.extend(oResultData, defaultDeepPaths(cleanData(oData), aDeepChildPath));
                    oDeferred.resolve(oData);
                }, function(oError) {
                    oODataModel.fireRequestFailed((oError && oError.response) ? oError.response : {
                        statusCode : 400
                    });
                    oDeferred.reject(oError);
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
                var aSorter = oNode && [new sap.ui.model.Sorter(oNode.primaryKey)];

                if (!bUseBuffer) {
                    oODataModel.read(sChildPath, {
                        async : true,
                        // make sure to have a defined sort order, which is usually the insert order
                        sorters : aSorter,
                        success : function(oData) {
                            oResultData[sNodeName] = cleanData(oData);
                            oDeferred.resolve(oData);
                        },
                        error : function(oError) {
                            if (oError.response.statusCode == 404) {
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
            };

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
                        if (sDeepChildPath.indexOf(sNodeName) == 0) {
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
            for ( var sNodeName in oNodes) {
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
                for ( var sNodeName in oSettings.deepChildPaths) {
                    if (oSettings && oSettings.excludeNodes && oSettings.excludeNodes.indexOf(sNodeName) >= 0) {
                        continue;
                    }
                    var sDeepChildPath = oSettings.deepChildPaths[sNodeName];
                    if (sDeepChildPath.indexOf("/") != -1) {
                        aDeepChildPath.push(sDeepChildPath);
                    }
                }
            }
            // Remove duplicates
            aDeepChildPath = aDeepChildPath.filter(function(value, index, array) {
                return array.indexOf(value) == index;
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
                    async : oAdditionalSettings.async != undefined ? oAdditionalSettings.async : oSettings.async,
                    onlyRoot : oAdditionalSettings.onlyRoot != undefined ? oAdditionalSettings.onlyRoot : oSettings.onlyRoot,
                    useBuffer : oAdditionalSettings.useBuffer != undefined ? oAdditionalSettings.useBuffer : oSettings.useBuffer
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
     * oSettings.headers: Header object pass to the ajax call
     */

    sap.ui.ino.models.core.ReadSource.getDefaultAOFSource = function(oSettings) {
        return function(vKey, sObjectName, oMetadata, oAdditionalSettings) {
            var oDeferred = new jQuery.Deferred();

            var oEffectiveSettings = jQuery.extend({}, oSettings, oAdditionalSettings);

            var sURL = sap.ui.ino.models.core.MetaModel.getEndpoint(sObjectName);
            var oAjaxPromise = jQuery.ajax({
                url : sURL + "/" + vKey,
                type : "GET",
                dataType : "json",
                cache : oEffectiveSettings.cache,
                contentType : "application/json",
                headers : oEffectiveSettings.headers || undefined
            });

            oAjaxPromise.done(function(oResponse, sStatusText, oJQXHR) {
                var sConcurrencyToken = oJQXHR.getResponseHeader("ETag");
                oDeferred.resolve(oResponse, sConcurrencyToken);
            });
            oAjaxPromise.fail(function(oResponse) {
                oDeferred.reject(oResponse);
            });

            return oDeferred.promise();
        };
    };

    function cleanData(oData) {
        if (!oData) {
            return {};
        }
        oData = jQuery.extend(true, {}, oData);
        var oCleanData = undefined;
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

    sap.ui.ino.models.core.ReadSource.cleanData = cleanData;
}());