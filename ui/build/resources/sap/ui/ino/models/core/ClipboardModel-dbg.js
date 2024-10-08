/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.core.ClipboardModel");
jQuery.sap.require("sap.ui.ino.models.core.ApplicationObjectChange");
jQuery.sap.require("sap.ui.ino.models.core.InvalidationManager");
jQuery.sap.require("sap.ui.ino.application.Configuration");
jQuery.sap.require("jquery.sap.storage");

(function() {
    "use strict";

    var OBJECT_PATH = "object";
    var ENTRY_PATH = "entry";
    var CHANGED_PATH = "changed";
    var IS_EMPTY_PATH = "isEmpty";

    var Node = {
        Root : "Root"
    };

    sap.ui.model.json.JSONModel.extend("sap.ui.ino.models.core.ClipboardModel", {

        metadata : {
            events : {
                "objectAdded" : {},
                "objectRemoved" : {},
                "objectRevalidated" : {},
                "objectInvalid" : {},
                "clipboardOpen" : {}
            }
        },

        constructor : function(sName) {
            sap.ui.model.json.JSONModel.apply(this, []);
            this.initialized = false;
            this.namesRead = false;
            this.clipboardVisible = false;
            this.name = sName;
            var that = this;
            sap.ui.ino.models.core.InvalidationManager.attachEvent("dirtyObjectRegistered", function(oEvent) {
                if (!oEvent.getParameter("deleted")) {
                    that._validateDirtyObject(oEvent);
                }
            });
            sap.ui.ino.models.core.ApplicationObjectChange.attachChange(sap.ui.ino.models.core.ApplicationObjectChange.Action.Del, function(oEvent) {
                that.remove(oEvent.getParameter("object"), oEvent.getParameter("key"));
            });
        },

        _changed : function() {
            this.setProperty("/" + CHANGED_PATH, new Date());
            this._isEmpty();
        },

        _isEmpty : function() {
            this.setProperty("/" + IS_EMPTY_PATH, this.isClipboardEmpty());
        },

        _entry : function(oApplicationObject, vKey, sName) {
            return {
                objectName : oApplicationObject.getMetadata().getName(),
                key : vKey,
                name : sName
            };
        },

        _setName : function(oApplicationObject, vKey) {
            var oDeferred = new jQuery.Deferred();
            if (!oApplicationObject.readSource) {
                return oDeferred;
            }
            var oMetadata = oApplicationObject.getApplicationObjectMetadata();
            var oPromise = this.getObjectForKey(oApplicationObject, vKey);
            var that = this;
            oPromise.done(function(oData) {
                if (oData) {
                    var sObjectName = oApplicationObject.getMetadata().getName();
                    var sNameAttribute = oMetadata.nodes[Node.Root].nameAttribute;
                    var sName = oData[sNameAttribute];
                    var aResult = jQuery.grep(that.getProperty("/" + OBJECT_PATH) || [], function(oObject) {
                        return oObject.name == sObjectName;
                    });
                    if (aResult.length != 0) {
                        var oObject = aResult[0];
                        aResult = jQuery.grep(oObject[ENTRY_PATH] || [], function(oEntry) {
                            return oEntry.key == vKey;
                        });
                        if (aResult.length != 0) {
                            var oEntry = aResult[0];
                            oEntry.name = sName;
                        }
                    }
                    that.checkUpdate(true);
                    oDeferred.resolve();
                } else {
                    that._invalidObject(oApplicationObject, vKey, oDeferred);
                }
            });
            oPromise.fail(function(oError) {
                that._invalidObject(oApplicationObject, vKey, oDeferred);
            });
            return oDeferred.promise();
        },

        _invalidObject : function(oApplicationObject, vKey, oDeferred) {
            this.remove(oApplicationObject, vKey);
            this.fireEvent("objectInvalid", {
                applicationObject : oApplicationObject,
                key : vKey,
                entrySet : oApplicationObject.readSource.entitySetName,
                entityKey : this._getEntityKey(oApplicationObject, vKey)
            });
            oDeferred.reject();
        },

        prepare : function() {
            this._initialize();
        },

        _initialize : function() {
            if (!this.initialized) {
                this.initialized = true;
                this._loadState();
            }
        },

        _validateDirtyObject : function(oEvent) {
            this._initialize();
            var that = this;
            var oApplicationObject = oEvent.getParameter("applicationObject");
            var vKey = oEvent.getParameter("key");
            var sEntityKey = oEvent.getParameter("entityKey");
            if (this.isInClipboard(oApplicationObject, vKey)) {
                if (sap.ui.ino.models.core.InvalidationManager.validateObject(oApplicationObject, vKey, sEntityKey)) {
                    that.revalidate(oApplicationObject, vKey);
                }
            }
        },
        
        _validateObject : function(oApplicationObject, vKey) {
            return sap.ui.ino.models.core.InvalidationManager.validateObject(oApplicationObject, vKey, 
                    this._getEntityKey(oApplicationObject, vKey));
        },
        
        _getEntityKey : function(oApplicationObject, vKey) {
            return oApplicationObject.readSource.entitySetName + "(" + vKey + ")";
        },
        
        clipboardOpened : function() {
            this._initialize();
            this.clipboardVisible = true;
            if (!this.namesRead) {
                this.namesRead = true;
                this.revalidate();
            }
            this._storeState();
        },

        clipboardClosed : function() {
            this._initialize();
            this.clipboardVisible = false;
            this._storeState();
        },

        toggle : function(oApplicationObject, vKey, sName) {
            this._initialize();
            if (!this.isInClipboard(oApplicationObject, vKey)) {
                this.add(oApplicationObject, vKey, sName);
                return true;
            }
            this.remove(oApplicationObject, vKey);
            return false;
        },

        add : function(oApplicationObject, vKey, sName) {
            this._initialize();
            if (vKey <= 0) {
                return;
            }
            
            sName = sName || "";
            var oDeferred = new jQuery.Deferred();

            var sObjectName = oApplicationObject.getMetadata().getName();
            var oEntry = this._entry(oApplicationObject, vKey, sName);

            var sArrayPath = "/" + OBJECT_PATH;
            var aObject = this.getProperty(sArrayPath);
            if (!aObject) {
                aObject = [];
                this.setProperty(sArrayPath, aObject);
            }
            var aResult = jQuery.grep(aObject || [], function(oObject) {
                return oObject.name == sObjectName;
            });
            var oObject = null;
            if (aResult.length == 0) {
                oObject = {
                    name : sObjectName,
                };
                oObject[ENTRY_PATH] = [];
                aObject.push(oObject);
            } else {
                oObject = aResult[0];
            }
            aResult = jQuery.grep(oObject[ENTRY_PATH] || [], function(oAEntry) {
                return oAEntry.key == vKey;
            });
            var oNewEntry = null;
            if (aResult.length == 0) {
                oNewEntry = oEntry;
                oObject[ENTRY_PATH].push(oNewEntry);
                this._validateObject(oApplicationObject, vKey);
                this._setName(oApplicationObject, vKey).done(oDeferred.resolve);
            } else {
                oNewEntry = aResult[0];
                oNewEntry.name = sName;
                oDeferred.resolve();
            }

            this._storeState();
            this.checkUpdate(true);
            this._changed();

            this.fireEvent("objectAdded", {
                objectName : sObjectName,
                key : vKey,
                entry : oEntry
            });

            return oDeferred.promise();
        },

        remove : function(oApplicationObject, vKey) {
            this._initialize();
            var sObjectName = undefined;

            if (oApplicationObject) {
                sObjectName = oApplicationObject.getMetadata().getName();
                var aObject = this.getProperty("/" + OBJECT_PATH) || [];
                var aResult = jQuery.grep(aObject, function(oObject) {
                    return oObject.name == sObjectName;
                });
                if (aResult.length != 0) {
                    var oObject = aResult[0];
                    if (vKey) {
                        aResult = jQuery.grep(oObject[ENTRY_PATH] || [], function(oEntry) {
                            return oEntry.key == vKey;
                        });
                        if (aResult.length != 0) {
                            var oEntry = aResult[0];
                            oObject[ENTRY_PATH].splice(jQuery.inArray(oEntry, oObject[ENTRY_PATH]), 1);
                        }
                        if (oObject[ENTRY_PATH].length == 0) {
                            aObject.splice(jQuery.inArray(oObject, aObject), 1);
                        }
                    } else {
                        aObject.splice(jQuery.inArray(oObject, aObject), 1);
                    }
                }
                if (aObject && aObject.length == 0) {
                    this.setData({});
                }
            } else {
                this.setData({});
            }

            this._storeState();
            this.checkUpdate(true);
            this._changed();

            this.fireEvent("objectRemoved", {
                objectName : sObjectName,
                key : vKey
            });
        },

        revalidate : function(oApplicationObject, vKey) {
            this._initialize();
            var that = this;
            if (oApplicationObject) {
                var sObjectName = oApplicationObject.getMetadata().getName();
                if (vKey) {
                    this._setName(oApplicationObject, vKey).done(function() {
                        that.fireEvent("objectRevalidated", {
                            objectName : sObjectName,
                            key : vKey
                        });
                    });
                } else {
                    var aResult = jQuery.grep(this.getProperty("/" + OBJECT_PATH) || [], function(oObject) {
                        return oObject.name == sObjectName;
                    });
                    if (aResult.length != 0) {
                        var oObject = aResult[0];
                        jQuery.each(oObject[ENTRY_PATH], function(iIndex, oEntry) {
                            var vKey = oEntry.key;
                            that._setName(oApplicationObject, vKey).done(function() {
                                that.fireEvent("objectRevalidated", {
                                    objectName : oObject.name,
                                    key : vKey
                                });
                            });
                        });
                    }
                }
            } else {
                jQuery.each(this.getProperty("/" + OBJECT_PATH) || [], function(iIndex, oObject) {
                    oApplicationObject = sap.ui.ino.models.core.ClipboardModel.loadObject(oObject.name);
                    jQuery.each(oObject[ENTRY_PATH], function(iIndex, oEntry) {
                        var vKey = oEntry.key;
                        that._setName(oApplicationObject, vKey).done(function() {
                            that.fireEvent("objectRevalidated", {
                                objectName : oObject.name,
                                key : vKey
                            });
                        });
                    });
                });
            }
        },

        isInClipboard : function(oApplicationObject, vKey) {
            this._initialize();
            var aResult = jQuery.grep(this.getProperty("/" + OBJECT_PATH) || [], function(oObject) {
                return oObject.name == oApplicationObject.getMetadata().getName();
            });
            if (aResult.length != 0) {
                var oObject = aResult[0];
                aResult = jQuery.grep(oObject[ENTRY_PATH] || [], function(oEntry) {
                    return oEntry.key == vKey;
                });
                if (aResult.length != 0) {
                    return true;
                }
            }
            return false;
        },

        isClipboardEmpty : function(oApplicationObject) {
            if (!oApplicationObject) {
                return (this.getProperty("/" + OBJECT_PATH) || []).length <= 0;
            }
            var aResult = jQuery.grep(this.getProperty("/" + OBJECT_PATH) || [], function(oObject) {
                return oObject.name == oApplicationObject.getMetadata().getName();
            });
            if (aResult.length != 0) {
                var oObject = aResult[0];
                return (oObject[ENTRY_PATH] || []).length <= 0;
            }
            return true;
        },
        
        getObjectForKey : function(oApplicationObject, vKey) {
            var oMetadata = oApplicationObject.getApplicationObjectMetadata();
            return oApplicationObject.readSource(vKey, oApplicationObject.getObjectName(), oMetadata, {
                onlyRoot : true,
                useBuffer : true
            });
        },
        
        getObjectKeys : function(oApplicationObject, vFilterKey) {
            this._initialize();
            var aKey = [];
            if (oApplicationObject) {
                var aResult = jQuery.grep(this.getProperty("/" + OBJECT_PATH) || [], function(oObject) {
                    return oObject.name == oApplicationObject.getMetadata().getName();
                });
                if (aResult.length != 0) {
                    var oObject = aResult[0];
                    jQuery.each(oObject[ENTRY_PATH], function(iIndex, oEntry) {
                        aKey.push(oEntry.key);
                    });
                }
            }
            if (vFilterKey) {
                var iIndex = aKey.indexOf(vFilterKey);
                if (iIndex > -1) {
                    aKey.splice(iIndex, 1);
                }
            }
            return aKey;
        },

        setProperty : function() {
            this._initialize();
            sap.ui.model.json.JSONModel.prototype.setProperty.apply(this, arguments);
        },

        getProperty : function() {
            this._initialize();
            return sap.ui.model.json.JSONModel.prototype.getProperty.apply(this, arguments);
        },

        _loadState : function() {
            var that = this;
            var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
            var vKey = this._getStateKey();
            var sState = oStorage.get(vKey);
            if (sState) {
                try {
                    var oData = {};
                    oData[OBJECT_PATH] = [];
                    var oState = JSON.parse(sState);
                    if (oState.userId == sap.ui.ino.application.Configuration.getCurrentUser().USER_ID) {
                        delete oState.userId;
                        if (oState.clipboardVisible) {
                            this.clipboardVisible = true;
                        }
                        delete oState.clipboardVisible;
                        jQuery.each(oState, function(sObjectName, aKey) {
                            var oObject = {
                                name : sObjectName
                            };
                            oObject[ENTRY_PATH] = [];
                            var oApplicationObject = sap.ui.ino.models.core.ClipboardModel.loadObject(sObjectName);
                            jQuery.each(aKey, function(iIndex, vKey) {
                                var oEntry = that._entry(oApplicationObject, vKey, "");
                                oObject[ENTRY_PATH].push(oEntry);
                            });
                            oData[OBJECT_PATH].push(oObject);
                        });
                    }
                    this.setData(oData);
                    this._changed();
                    if (this.clipboardVisible) {
                        this.fireEvent("clipboardOpen");
                    }
                    this._storeState();
                } catch (e) {
                    jQuery.sap.log.debug("JSON string " + sState + " from local storage for could not be parsed for key " + vKey, undefined, "ClipboardModel");
                }
            }
        },

        _storeState : function() {
            var oState = {
                userId : sap.ui.ino.application.Configuration.getCurrentUser().USER_ID,
                clipboardVisible : this.clipboardVisible
            };
            jQuery.each(this.getProperty("/" + OBJECT_PATH) || [], function(iIndex, oObject) {
                var aKey = [];
                jQuery.each(oObject[ENTRY_PATH], function(iIndex, oEntry) {
                    aKey.push(oEntry.key);
                });
                oState[oObject.name] = aKey;
            });
            var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
            var vKey = this._getStateKey();
            var bOK = oStorage.put(vKey, JSON.stringify(oState));
            if (!bOK) {
                jQuery.sap.log.debug("State could not be stored in local storage for key " + vKey, undefined, "ClipboardModel");
            }
        },

        _getStateKey : function() {
            return this.getMetadata().getName() + "-" + this.name;
        }
    });

    sap.ui.ino.models.core.ClipboardModel.loadObject = function(sObjectName) {
        jQuery.sap.require(sObjectName);
        return jQuery.sap.getObject(sObjectName, 0);
    };

    var oSharedClipboard = null;
    sap.ui.ino.models.core.ClipboardModel.sharedInstance = function() {
        if (!oSharedClipboard) {
            oSharedClipboard = new sap.ui.ino.models.core.ClipboardModel("__shared_instance__");
        }
        return oSharedClipboard;
    };

    sap.ui.ino.models.core.ClipboardModel.getInSharedClipboardFormatter = function(oApplicationObject) {
        return function(vKey) {
            return sap.ui.ino.models.core.ClipboardModel.sharedInstance.isInClipboard(oApplicationObject, vKey);
        };
    };

    sap.ui.ino.models.core.ClipboardModel.getSharedClipboardNotEmptyFormatter = function(oApplicationObject) {
        return function() {
            return !sap.ui.ino.models.core.ClipboardModel.sharedInstance().isClipboardEmpty(oApplicationObject);
        };
    };
}());