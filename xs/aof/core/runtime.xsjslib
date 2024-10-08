var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var DB = $.import("sap.ino.xs.aof.core", "db");
var Auth = $.import("sap.ino.xs.aof.core", "authorization");
var Metadata = $.import("sap.ino.xs.aof.core", "metadata");
var Message = $.import("sap.ino.xs.aof.lib", "message");
var auth2 = $.import("sap.ino.xs.aof.lib", "authorization");

var Runtime = this;

// "Enum" for framework internal messages
var Messages = {
    OBJECT_NOT_FOUND : "MSG_OBJECT_NOT_FOUND",
    INVALID_HANDLE_KEY : "MSG_INVALID_HANDLE_KEY",
    INVALID_OBJECT_KEY : "MSG_INVALID_OBJECT_KEY",
    NO_OBJECT_KEYS : "MSG_NO_OBJECT_KEYS",
    CONCURRENCY_TOKEN_CONFLICT : "MSG_CONCURRENCY_TOKEN_CONFLICT",
    CONCURRENCY_TOKEN_NOT_ENABLED : "MSG_CONCURRENCY_TOKEN_NOT_ENABLED",
    ATTRIBUTE_REQUIRED : "MSG_ATTRIBUTE_REQUIRED",
    NODE_READ_ONLY : "MSG_NODE_READ_ONLY",
    NODE_UNKNOWN : "MSG_NODE_UNKNOWN",
    NODE_INSTANCE_UNKNOWN : "MSG_NODE_INSTANCE_UNKNOWN",
    ATTRIBUTE_READ_ONLY : "MSG_ATTRIBUTE_READ_ONLY",
    INTERNAL_ACTION_CALLED : "MSG_INTERNAL_ACTION_CALLED"
};

var MessageSeverity = Message.MessageSeverity;
var CancelProcessingException = Message.CancelProcessingException;

var oPrivilegedContext;

function getObjectFacade(oMetadataAccess, bPrivilegedAuthMode) {

    var DeterminationEvent = {
        OnCreate : "onCreate",
        OnPrepareCopy : "onPrepareCopy",
        OnCopy : "onCopy",
        OnUpdate : "onUpdate",
        OnModify : "onModify",
        OnDelete : "onDelete",
        OnRead : "onRead",
        OnPersist : "onPersist"
    };

    var oFacade = {
        create : getCreateProcessor(),
        copy : getCopyProcessor(),
        update : getUpdateProcessor(),
        del : getDeleteProcessor(),
        exists : getExistsProcessor(),
        read : getReadProcessor(),
        calculateConcurrencyToken : getConcurrencyTokenProcessor(),
        properties : getPropertiesProcessor(),
        staticProperties : getStaticPropertiesProcessor()
    };

    var oCustomActions = getCustomActions();
    _.extend(oFacade, oCustomActions);

    function filterRegisteredGeneratedKeys(mGeneratedKeys, oHandleManager) {
        var mFilteredGeneratedKeys = {};
        _.each(mGeneratedKeys, function(vKey, vHandle) {
            if (oHandleManager.isRegisteredHandle(vHandle)) {
                mFilteredGeneratedKeys[vHandle] = vKey;
            }
        });
        return mFilteredGeneratedKeys;
    }

    function process(oAction, fnFun) {
        var oResponse = {
            messages : []
        };
        var oResult = oResponse;
        var oMessageBuffer = Message.createMessageBuffer();
        var oContext = _createContext(oAction);
        var oHandleManager = createHandleManager();

        try {

            // Internal action may only be called in context of other AOF execution
            // which is recognized by an existing authorization context
            if (oAction.isInternal && !oPrivilegedContext) {
                oMessageBuffer.addMessage(MessageSeverity.Fatal, Messages.INTERNAL_ACTION_CALLED);
            }

            var oFnResult = fnFun(oResponse, oMessageBuffer, oContext.external, oContext.internal, oHandleManager);
            if (oFnResult !== undefined) {
                oResult = oFnResult;
            }
        } catch (oException) {
            // exception is raised by message buffer when abort message
            // is added
            if (!(oException instanceof CancelProcessingException)) {
                throw oException;
            }
        } finally {
            oResponse.messages = oMessageBuffer.getMessages();
            if (oPrivilegedContext === oContext.external) {
                oPrivilegedContext = undefined;
            }
            var oConcurrencyConflictMessage = _.findWhere(oResponse.messages, {
                messageKey : Messages.CONCURRENCY_TOKEN_CONFLICT
            });

            if (oConcurrencyConflictMessage) {
                oResponse.concurrencyToken = oConcurrencyConflictMessage.parameters[0];
            }

        }
        return oResult;
    }
    
    function hasIgnoreAuthCheck(){
        return auth2.hasIgnoreAuthCheck();
    }
    
    function callAuthCheck(fnCheckAuth, vKey, oWorkObject, oMessageBuffer, oContext) {
        if (bPrivilegedAuthMode || oPrivilegedContext) {
            return;
        }
        if(!hasIgnoreAuthCheck()){
            fnCheckAuth(vKey, oWorkObject, oMessageBuffer.addMessage, oContext);
        }
        // No sense to continue when an error occurred in authorization check
        if (oMessageBuffer.getMinSeverity() <= MessageSeverity.Error) {
            throw new CancelProcessingException();
        }

        oPrivilegedContext = oPrivilegedContext || oContext;
    }

    function callStaticAuthCheck(fnCheckAuth, oParameters, oMessageBuffer, oContext) {
        var fnAuthCheckWrapper = function(vKey, oParameters, addMessage, oContext) {
            // No key for static auth check callback
            fnCheckAuth(oParameters, addMessage, oContext);
        };
        callAuthCheck(fnAuthCheckWrapper, undefined, oParameters, oMessageBuffer, oContext);
    }

    function callEnabledCheck(fnCheckEnabled, vKey, oWorkObject, oMessageBuffer, oContext) {
        if (!fnCheckEnabled) {
            return;
        }
        if(!hasIgnoreAuthCheck()){
            fnCheckEnabled(vKey, oWorkObject, oMessageBuffer.addMessage, oContext);
        }
        // No sense to continue when an error occurred in enabled check
        if (oMessageBuffer.getMinSeverity() <= MessageSeverity.Error) {
            throw new CancelProcessingException();
        }
    }

    function callStaticEnabledCheck(fnCheckEnabled, oParameters, oBulkAccess, oMessageBuffer, oContext) {
        var fnEnabledCheckWrapper = function(vKey, oParameters, addMessage, oContext) {
            // No key for static enabled check callback
            fnCheckEnabled(oParameters, oBulkAccess, addMessage, oContext);
        };
        callEnabledCheck(fnEnabledCheckWrapper, undefined, oParameters, oMessageBuffer, oContext);
    }

    function callExecutionCheck(fnCheckExecution, vKey, oChangeRequest, oWorkObject, oPersistedObject, oMessageBuffer, oContext) {
        if (!fnCheckExecution) {
            return;
        }
        
        if(!hasIgnoreAuthCheck()){
            fnCheckExecution(vKey, oChangeRequest, oWorkObject, oPersistedObject, oMessageBuffer.addMessage, oContext);
        }
        
        // No sense to continue when an error occurred in execution check
        if (oMessageBuffer.getMinSeverity() <= MessageSeverity.Error) {
            throw new CancelProcessingException();
        }
    }

    function callDeterminations(aEvent, vKey, oWorkObject, oPersistedObject, oMessageBuffer, oContext, oHandleManager, oActionInfo) {
        // Currently only determination on root node can exist
        // Execution of determinations on sub-nodes may be necessary for inclusion objects
        var oRootMetadata = oMetadataAccess.getNodeMetadata(Metadata.Node.Root);
        _.each(aEvent, function(sEvent) {
            _.each(oRootMetadata.determinations[sEvent], function(fnDetermination) {
                fnDetermination(vKey, oWorkObject, oPersistedObject, oMessageBuffer.addMessage, oHandleManager.getNextHandle, oContext, oRootMetadata, oActionInfo || {});
            });
        });

        // No sense to continue with validations and database update when determinations
        // are erroneous
        if (oMessageBuffer.getMinSeverity() <= MessageSeverity.Error) {
            throw new CancelProcessingException();
        }

        // Determinations might have created new node instances. For those constant keys need to be set.
        // As the constant keys could have been changed in determinations also for existing instances
        // they are reset for all node instances
        _.visitInstanceTree(oWorkObject, function(oNodeInstance, sKey, bObjectInArray, oContext) {
            var sNodeName = _getNodeName(sKey);
            var oNodeMetadata = oMetadataAccess.getNodeMetadata(sNodeName);
            if (sNodeName === Metadata.Node.Root || bObjectInArray) {
                _.each(oNodeMetadata.constantKeys, function(sValue, sAttributeName) {
                    oNodeInstance[sAttributeName] = sValue;
                });
            }
        });
    }

    function callReadDetermination(vKey, oObject, oContext) {
        var oRootMetadata = oMetadataAccess.getNodeMetadata(Metadata.Node.Root);
        _.each(oRootMetadata.determinations.onRead, function(fnOnRead) {
            fnOnRead(vKey, oObject, oRootMetadata, oContext);
        });
        return oObject;
    }

    function callConsistencyChecks(vKey, oWorkObject, oMessageBuffer, oContext) {
        _.visitInstanceTree(oWorkObject, function(oWorkObjectNode, sKey, bObjectInArray) {
            var sNodeName = _getNodeName(sKey);
            var oNodeMetadata = oMetadataAccess.getNodeMetadata(sNodeName);

            if (!bObjectInArray) {
                _.each(oNodeMetadata.consistencyChecks, function(fnCheck) {
                    fnCheck(vKey, oWorkObjectNode, oMessageBuffer.addMessage, oContext, oNodeMetadata);
                });
            }
            
            if (sNodeName === Metadata.Node.Root || bObjectInArray) {
                var vNodeKey = oMetadataAccess.getNodeKeyValue(sNodeName, oWorkObjectNode);
                _.each(oNodeMetadata.attributes, function(oAttribute) {
                    var vValue = oWorkObjectNode[oAttribute.name];
                    if (!_.isSet(vValue)) {
                        if (oAttribute.required && !oAttribute.isPrimaryKey) {
                            oMessageBuffer.addMessage(MessageSeverity.Error, Messages.ATTRIBUTE_REQUIRED, vNodeKey, sNodeName, oAttribute.name);
                        }
                        return;
                    }
                    if (oAttribute.consistencyChecks) {
                        _.each(oAttribute.consistencyChecks, function(fnCheck) {
                            fnCheck(vNodeKey, {
                                name : oAttribute.name,
                                value : vValue
                            }, oMessageBuffer.addMessage, oContext, oNodeMetadata);
                        });
                    }
                });
            }
        });

        // This is a hard-stop, otherwise this results in database exceptions
        if (oMessageBuffer.getMinSeverity() <= MessageSeverity.Error) {
            throw new CancelProcessingException();
        }
    }

    function read(vKey, oContext, bLock) {
        var oObject = DB.read(vKey, oMetadataAccess, undefined, undefined, bLock);
        if (_.isEqual(oObject, {}) || oObject === null || oObject === undefined) {
            return null;
        }
        return callReadDetermination(vKey, oObject, oContext);
    }

    function persist(vKey, oWorkObject, fnDefaultPersist, oActionMetadata, oMetadataAccess, addMessage, oContext) {
        if (oActionMetadata.persist && _.isFunction(oActionMetadata.persist)) {
            var oDB = {
                create : function(oObject) {
                    DB.create(oObject, oMetadataAccess, addMessage, oContext);
                },
                update : function(oObject) {
                    DB.update(oObject, oMetadataAccess, addMessage, oContext);
                },
                del : function(oObject) {
                    DB.del(oObject, oMetadataAccess, addMessage, oContext);
                }
            };
            oActionMetadata.persist(vKey, oWorkObject, oDB, addMessage, oContext);
        } else {
            fnDefaultPersist();
        }
    }

    function calculateConcurrencyToken(oObject) {
        var oRootMetadata = oMetadataAccess.getNodeMetadata(Metadata.Node.Root);
        var oTokenObject = _.pick.apply(undefined, [oObject].concat(oRootMetadata.concurrencyControlAttributes));
        return JSON.stringify(oTokenObject);
    }

    function checkConcurrencyConflict(vKey, oPersistedObject, sConcurrencyToken, addMessage) {
        if (!sConcurrencyToken) {
            return;
        }

        if (!oMetadataAccess.getObjectMetadata().isConcurrencyControlEnabled) {
            addMessage(MessageSeverity.Fatal, Messages.CONCURRENCY_TOKEN_NOT_ENABLED, vKey, Metadata.Node.Root);
            return;
        }

        var sValidToken = calculateConcurrencyToken(oPersistedObject);
        if (sValidToken !== sConcurrencyToken) {
            addMessage(MessageSeverity.Fatal, Messages.CONCURRENCY_TOKEN_CONFLICT, vKey, Metadata.Node.Root, undefined, sValidToken);
        }
    }

    function addConcurrencyToken(oResponse, oObject) {
        if (oMetadataAccess.getObjectMetadata().isConcurrencyControlEnabled) {
            oResponse.concurrencyToken = calculateConcurrencyToken(oObject);
        }
    }

    function updateIntraObjectForeignKeys(mGeneratedKeys, oWorkObject, oMetadataAccess, fnAddMessage, oContext) {
        _.visitInstanceTree(oWorkObject, function(oWorkObjectNode, sKey, bObjectInArray, oContext) {
            var sNodeName = _getNodeName(sKey);
            if (sNodeName === Metadata.Node.Root || bObjectInArray) {
                var oNodeMetadata = oMetadataAccess.getNodeMetadata(sNodeName);
                if (!oNodeMetadata) {
                    fnAddMessage(MessageSeverity.Fatal, Messages.NODE_UNKNOWN, null, sNodeName, null, sNodeName);
                    return;
                }
                _.each(oNodeMetadata.attributes, function(oAttribute) {
                    if (oAttribute.foreignKeyIntraObject) {
                        var vNewKey = mGeneratedKeys[oWorkObjectNode[oAttribute.name]];
                        if (vNewKey) {
                            oWorkObjectNode[oAttribute.name] = vNewKey;
                        }
                    }
                });
            }
        });
    }

    function getCreateProcessor() {
        var oActionMetadata = oMetadataAccess.getActions()[Metadata.Action.Create];
        if (!oActionMetadata) {
            return undefined;
        }

        return function(oCreateRequest) {
            return process(oActionMetadata, function(oResponse, oMessageBuffer, oContext, oInternalContext, oHandleManager) {

                oInternalContext.setProcessedObject(oCreateRequest);

                callAuthCheck(oActionMetadata.authorizationCheck, undefined, oCreateRequest, oMessageBuffer, oContext);

                var oNewObject = _initNewObject(oMetadataAccess);
                var oWorkObject = _mergeObjects(oNewObject, oCreateRequest, oMetadataAccess, oMessageBuffer, function(vKey, oCleanSourceObject, sNodeName) {
                    if (!oHandleManager.isHandle(vKey)) {
                        oMessageBuffer.addMessage(MessageSeverity.Fatal, Messages.INVALID_HANDLE_KEY, vKey, sNodeName);
                    }
                    oHandleManager.registerUsedHandle(vKey);
                }, oContext);

                oInternalContext.setProcessedObject(oWorkObject);

                if (oActionMetadata.enabledCheck) {
                    callEnabledCheck(oActionMetadata.enabledCheck, undefined, oWorkObject, oMessageBuffer, oContext);
                }

                if (oActionMetadata.executionCheck) {
                    callExecutionCheck(oActionMetadata.executionCheck, undefined, oCreateRequest, oWorkObject, undefined, oMessageBuffer, oContext);
                }

                callDeterminations([DeterminationEvent.OnCreate, DeterminationEvent.OnModify], undefined, oWorkObject, null, oMessageBuffer, oContext, oHandleManager);

                callConsistencyChecks(undefined, oWorkObject, oMessageBuffer, oContext);

                var mGeneratedKeys = generateKeys(oWorkObject, oHandleManager, oMetadataAccess);

                updateIntraObjectForeignKeys(mGeneratedKeys, oWorkObject, oMetadataAccess, oMessageBuffer.addMessage, oContext);

                oResponse.generatedKeys = filterRegisteredGeneratedKeys(mGeneratedKeys, oHandleManager);

                var fnCreate = function() {
                    DB.create(oWorkObject, oMetadataAccess, oMessageBuffer.addMessage, oContext);
                };

                persist(undefined, oWorkObject, fnCreate, oActionMetadata, oMetadataAccess, oMessageBuffer.addMessage, oContext);

                addConcurrencyToken(oResponse, oWorkObject);

                // after DB.create the work object has been persisted so we pass the work object also as persisted
                // object
                callDeterminations([DeterminationEvent.OnPersist], undefined, oWorkObject, oWorkObject, oMessageBuffer, oContext, oHandleManager);

            });
        };
    }

    function getCopyProcessor() {
        var oActionMetadata = oMetadataAccess.getActions()[Metadata.Action.Copy];
        if (!oActionMetadata) {
            return undefined;
        }

        return function(vOriginalKey, oCopyRequest) {
            return process(oActionMetadata, function(oResponse, oMessageBuffer, oContext, oInternalContext, oHandleManager) {
                if (!vOriginalKey) {
                    oMessageBuffer.addMessage(MessageSeverity.Fatal, Messages.INVALID_OBJECT_KEY, undefined, Metadata.Node.Root);
                }

                var oPersistedObject = read(vOriginalKey, oContext, true);
                if (!oPersistedObject) {
                    oMessageBuffer.addMessage(MessageSeverity.Fatal, Messages.OBJECT_NOT_FOUND, vOriginalKey, Metadata.Node.Root);
                }

                oInternalContext.setProcessedObject(oPersistedObject);

                callAuthCheck(oActionMetadata.authorizationCheck, vOriginalKey, oPersistedObject, oMessageBuffer, oContext);

                if (oActionMetadata.enabledCheck) {
                    callEnabledCheck(oActionMetadata.enabledCheck, vOriginalKey, oPersistedObject, oMessageBuffer, oContext);
                }

                var oCopy = _.copyDeep(oPersistedObject);

                callDeterminations([DeterminationEvent.OnPrepareCopy], undefined, oCopy, oPersistedObject, oMessageBuffer, oContext, oHandleManager);

                // Register used handles
                _.visitInstanceTree(oCopyRequest, function(oCopyRequestNode, sKey, bObjectInArray, oContext) {
                    var sNodeName = _getNodeName(sKey);
                    if (sNodeName === Metadata.Node.Root || bObjectInArray) {
                        var oNodeMetadata = oMetadataAccess.getNodeMetadata(sNodeName);
                        if (!oNodeMetadata) {
                            oMessageBuffer.addMessage(MessageSeverity.Fatal, Messages.NODE_UNKNOWN, null, sNodeName, null, sNodeName);
                        }
                        var vKey = oCopyRequestNode[oNodeMetadata.primaryKey];
                        if (!oHandleManager.isHandle(vKey)) {
                            oMessageBuffer.addMessage(MessageSeverity.Fatal, Messages.INVALID_HANDLE_KEY, vKey, sNodeName);
                        }
                        oHandleManager.registerUsedHandle(vKey);
                    }
                });

                // remove all original keys in copy and draw new handles
                // store handles for original key per node
                var mHandleForNodeKey = {};
                _.visitInstanceTree(oCopy, function(oNodeCopy, sKey, bObjectInArray, oContext) {
                    var sNodeName = _getNodeName(sKey);
                    if (sNodeName === Metadata.Node.Root || bObjectInArray) {
                        var oNodeMetadata = oMetadataAccess.getNodeMetadata(sNodeName);
                        if (!oNodeMetadata) {
                            oMessageBuffer.addMessage(MessageSeverity.Fatal, Messages.NODE_UNKNOWN, null, sNodeName, null, sNodeName);
                        }
                        var vKey = oNodeCopy[oNodeMetadata.primaryKey];
                        var vHandle = oHandleManager.getNextHandle();
                        oNodeCopy[oNodeMetadata.primaryKey] = vHandle;

                        var oNodeKey = mHandleForNodeKey[sNodeName];
                        if (!oNodeKey) {
                            oNodeKey = {};
                            mHandleForNodeKey[sNodeName] = oNodeKey;
                        }
                        oNodeKey[vKey] = vHandle;
                    }
                });

                // Handle is merged with copy object, registered handles mapping needs to be adjusted for root
                var oWorkObject = _mergeObjects(oCopy, oCopyRequest, oMetadataAccess, oMessageBuffer, function(vKey, oCleanSourceObject, sNodeName) {
                    if (sNodeName === Metadata.Node.Root && oHandleManager.isHandle(vKey)) {
                        var oNodeMetadata = oMetadataAccess.getNodeMetadata(sNodeName);
                        if (!oNodeMetadata) {
                            oMessageBuffer.addMessage(MessageSeverity.Fatal, Messages.NODE_UNKNOWN, null, sNodeName, null, sNodeName);
                        }
                        mHandleForNodeKey[sNodeName][oPersistedObject[oNodeMetadata.primaryKey]] = vKey;
                    }
                }, oContext);

                oInternalContext.setProcessedObject(oWorkObject);

                // Traverse object and adjust intra-object foreign keys to above drawn handles
                _.visitInstanceTree(oWorkObject, function(oWorkObjectNode, sKey, bObjectInArray, oContext) {
                    var sNodeName = _getNodeName(sKey);
                    if (sNodeName === Metadata.Node.Root || bObjectInArray) {
                        var oNodeMetadata = oMetadataAccess.getNodeMetadata(sNodeName);
                        if (!oNodeMetadata) {
                            oMessageBuffer.addMessage(MessageSeverity.Fatal, Messages.NODE_UNKNOWN, null, sNodeName, null, sNodeName);
                            return;
                        }
                        _.each(oNodeMetadata.attributes, function(oAttribute) {
                            if (oAttribute.foreignKeyTo && oAttribute.foreignKeyIntraObject) {
                                var vForeignKeyValue = oWorkObjectNode[oAttribute.name];
                                if (!vForeignKeyValue) {
                                    return;
                                }
                                var aParts = oAttribute.foreignKeyTo.split(".");
                                var sForeignKeyToNodeName = _.last(aParts);
                                oWorkObjectNode[oAttribute.name] = mHandleForNodeKey[sForeignKeyToNodeName][vForeignKeyValue];
                            }
                        });
                    }
                });

                if (oActionMetadata.executionCheck) {
                    callExecutionCheck(oActionMetadata.executionCheck, undefined, oCopyRequest, oWorkObject, undefined, oMessageBuffer, oContext);
                }

                callDeterminations([DeterminationEvent.OnCopy], undefined, oWorkObject, oPersistedObject, oMessageBuffer, oContext, oHandleManager);
                callDeterminations([DeterminationEvent.OnModify], undefined, oWorkObject, null, oMessageBuffer, oContext, oHandleManager);

                callConsistencyChecks(undefined, oWorkObject, oMessageBuffer, oContext);

                var mGeneratedKeys = generateKeys(oWorkObject, oHandleManager, oMetadataAccess);

                updateIntraObjectForeignKeys(mGeneratedKeys, oWorkObject, oMetadataAccess, oMessageBuffer.addMessage, oContext);

                oResponse.generatedKeys = filterRegisteredGeneratedKeys(mGeneratedKeys, oHandleManager);

                var fnCreate = function() {
                    DB.create(oWorkObject, oMetadataAccess, oMessageBuffer.addMessage, oContext);
                };

                persist(undefined, oWorkObject, fnCreate, oActionMetadata, oMetadataAccess, oMessageBuffer.addMessage, oContext);

                addConcurrencyToken(oResponse, oWorkObject);

                // after DB.create the work object has been persisted so we pass the work object also as
                // persisted
                // object
                callDeterminations([DeterminationEvent.OnPersist], undefined, oWorkObject, oWorkObject, oMessageBuffer, oContext, oHandleManager, {
                    originalKey : vOriginalKey
                });
            });
        };
    }

    function getUpdateProcessor() {
        var oActionMetadata = oMetadataAccess.getActions()[Metadata.Action.Update];
        if (!oActionMetadata) {
            return undefined;
        }

        return function(oUpdateRequest, sConcurrencyToken) {
            return process(oActionMetadata, function(oResponse, oMessageBuffer, oContext, oInternalContext, oHandleManager) {
                var vKey = oMetadataAccess.getNodeKeyValue(Metadata.Node.Root, oUpdateRequest);
                if (!vKey) {
                    oMessageBuffer.addMessage(MessageSeverity.Fatal, Messages.INVALID_OBJECT_KEY, undefined, Metadata.Node.Root);
                }

                var oPersistedObject = read(vKey, oContext, true);
                if (!oPersistedObject) {
                    oMessageBuffer.addMessage(MessageSeverity.Fatal, Messages.OBJECT_NOT_FOUND, vKey, Metadata.Node.Root);
                }

                oInternalContext.setProcessedObject(oPersistedObject);

                callAuthCheck(oActionMetadata.authorizationCheck, vKey, oPersistedObject, oMessageBuffer, oContext);

                checkConcurrencyConflict(vKey, oPersistedObject, sConcurrencyToken, oMessageBuffer.addMessage);

                if (oActionMetadata.enabledCheck) {
                    callEnabledCheck(oActionMetadata.enabledCheck, vKey, oPersistedObject, oMessageBuffer, oContext);
                }

                var oWorkObject = _mergeObjects(_.copyDeep(oPersistedObject), oUpdateRequest, oMetadataAccess, oMessageBuffer, oHandleManager.registerUsedHandle, oContext);

                oInternalContext.setProcessedObject(oWorkObject);

                if (oActionMetadata.executionCheck) {
                    callExecutionCheck(oActionMetadata.executionCheck, vKey, oUpdateRequest, oWorkObject, oPersistedObject, oMessageBuffer, oContext);
                }

                callDeterminations([DeterminationEvent.OnUpdate, DeterminationEvent.OnModify], vKey, oWorkObject, oPersistedObject, oMessageBuffer, oContext, oHandleManager);

                callConsistencyChecks(vKey, oWorkObject, oMessageBuffer, oContext);

                var mGeneratedKeys = generateKeys(oWorkObject, oHandleManager, oMetadataAccess);

                updateIntraObjectForeignKeys(mGeneratedKeys, oWorkObject, oMetadataAccess, oMessageBuffer.addMessage, oContext);

                oResponse.generatedKeys = filterRegisteredGeneratedKeys(mGeneratedKeys, oHandleManager);

                var fnUpdate = function() {
                    DB.update(oWorkObject, oMetadataAccess, oMessageBuffer.addMessage, oContext);
                };
                persist(vKey, oWorkObject, fnUpdate, oActionMetadata, oMetadataAccess, oMessageBuffer.addMessage, oContext);

                addConcurrencyToken(oResponse, oWorkObject);

                callDeterminations([DeterminationEvent.OnPersist], vKey, oWorkObject, oPersistedObject, oMessageBuffer, oContext, oHandleManager);
            });
        };
    }

    function getDeleteProcessor() {
        var oActionMetadata = oMetadataAccess.getActions()[Metadata.Action.Del];
        if (!oActionMetadata) {
            return undefined;
        }

        return function(vKey, sConcurrencyToken) {
            return process(oActionMetadata, function(oResponse, oMessageBuffer, oContext, oInternalContext, oHandleManager) {
                if (!vKey) {
                    oMessageBuffer.addMessage(MessageSeverity.Fatal, Messages.INVALID_OBJECT_KEY, undefined, Metadata.Node.Root);
                }
                var oPersistedObject = read(vKey, oContext, true);
                if (!oPersistedObject) {
                    oMessageBuffer.addMessage(MessageSeverity.Fatal, Messages.OBJECT_NOT_FOUND, vKey, Metadata.Node.Root);
                }

                oInternalContext.setProcessedObject(oPersistedObject);

                callAuthCheck(oActionMetadata.authorizationCheck, vKey, oPersistedObject, oMessageBuffer, oContext);

                checkConcurrencyConflict(vKey, oPersistedObject, sConcurrencyToken, oMessageBuffer.addMessage);

                if (oActionMetadata.enabledCheck) {
                    callEnabledCheck(oActionMetadata.enabledCheck, vKey, oPersistedObject, oMessageBuffer, oContext);
                }

                var oWorkObject = _.copyDeep(oPersistedObject);

                oInternalContext.setProcessedObject(oWorkObject);

                if (oActionMetadata.executionCheck) {
                    callExecutionCheck(oActionMetadata.executionCheck, vKey, undefined, oWorkObject, oPersistedObject, oMessageBuffer, oContext);
                }

                callDeterminations([DeterminationEvent.OnDelete], vKey, oWorkObject, oPersistedObject, oMessageBuffer, oContext, oHandleManager);

                var fnDel = function() {
                    DB.del(oWorkObject, oMetadataAccess, oMessageBuffer.addMessage, oContext);
                };
                persist(vKey, oWorkObject, fnDel, oActionMetadata, oMetadataAccess, oMessageBuffer.addMessage, oContext);

                callDeterminations([DeterminationEvent.OnPersist], vKey, oWorkObject, oPersistedObject, oMessageBuffer, oContext, oHandleManager);
            });
        };
    }

    function getExistsProcessor() {
        return function(vKey, sNodeName) {
            return process({
                name : Metadata.Action.Exists
            }, function(oResponse, oMessageBuffer, oContext, oInternalContext, oHandleManager) {
                if (!vKey) {
                    oMessageBuffer.addMessage(MessageSeverity.Fatal, Messages.INVALID_OBJECT_KEY, undefined, Metadata.Node.Root);
                }
                return DB.exists(vKey, oMetadataAccess, sNodeName);
            });
        };
    }

    function getReadProcessor() {
        var oActionMetadata = oMetadataAccess.getActions()[Metadata.Action.Read];
        if (!oActionMetadata) {
            return undefined;
        }
        return function(vKey) {
            return process(oActionMetadata, function(oResponse, oMessageBuffer, oContext, oInternalContext, oHandleManager) {
                if (!vKey) {
                    oMessageBuffer.addMessage(MessageSeverity.Fatal, Messages.INVALID_OBJECT_KEY, undefined, Metadata.Node.Root);
                }
                var oPersistedObject = read(vKey, oContext);

                oInternalContext.setProcessedObject(oPersistedObject);

                if (oPersistedObject) {
                    callAuthCheck(oActionMetadata.authorizationCheck, vKey, oPersistedObject, oMessageBuffer, oContext);
                }
                // Only return copies as otherwise the framework internal buffer can be modified by reference
                return oPersistedObject ? _.copyDeep(oPersistedObject) : oPersistedObject;
            });
        };
    }

    function getConcurrencyTokenProcessor() {
        if (!oMetadataAccess.getObjectMetadata().isConcurrencyControlEnabled) {
            return undefined;
        }

        return function(vKey, oObject) {
            return process({
                name : Metadata.Action.CalculateConcurrencyToken
            }, function(oResponse, oMessageBuffer, oContext, oInternalContext, oHandleManager) {
                if (!vKey) {
                    oMessageBuffer.addMessage(MessageSeverity.Fatal, Messages.INVALID_OBJECT_KEY, undefined, Metadata.Node.Root);
                }
                oObject = oObject || read(vKey, oContext);
                if (!oObject) {
                    oMessageBuffer.addMessage(MessageSeverity.Fatal, Messages.OBJECT_NOT_FOUND, vKey, Metadata.Node.Root);
                }
                return calculateConcurrencyToken(oObject);
            });
        };
    }

    function getCustomActions() {
        var oCustomActions = {};
        _.each(oMetadataAccess.getActions(), function(oAction) {
            if (!oAction.isFrameworkAction) {
                oCustomActions[oAction.name] = oAction.isStatic ? getStaticCustomActionProcessor(oAction) : getCustomActionProcessor(oAction);
            }
        });
        return oCustomActions;
    }

    function getCustomActionProcessor(oActionMetadata) {
        return function(vKey, oParameters, sConcurrencyToken) {
            return process(oActionMetadata, function(oResponse, oMessageBuffer, oContext, oInternalContext, oHandleManager) {
                if (!vKey) {
                    oMessageBuffer.addMessage(MessageSeverity.Fatal, Messages.INVALID_OBJECT_KEY, undefined, Metadata.Node.Root);
                }

                var oPersistedObject = read(vKey, oContext, true);
                if (!oPersistedObject) {
                    oMessageBuffer.addMessage(MessageSeverity.Fatal, Messages.OBJECT_NOT_FOUND, vKey, Metadata.Node.Root);
                }

                oInternalContext.setProcessedObject(oPersistedObject);

                callAuthCheck(oActionMetadata.authorizationCheck, vKey, oPersistedObject, oMessageBuffer, oContext);

                checkConcurrencyConflict(vKey, oPersistedObject, sConcurrencyToken, oMessageBuffer.addMessage);

                if (oActionMetadata.enabledCheck) {
                    callEnabledCheck(oActionMetadata.enabledCheck, vKey, oPersistedObject, oMessageBuffer, oContext);
                }

                var oWorkObject = _.copyDeep(oPersistedObject);

                oInternalContext.setProcessedObject(oWorkObject);

                oResponse.result = oActionMetadata.execute(vKey, oParameters, oWorkObject, oMessageBuffer.addMessage, oHandleManager.getNextHandle, oContext, oMetadataAccess, oHandleManager.registerUsedHandle);

                callDeterminations([DeterminationEvent.OnUpdate, DeterminationEvent.OnModify], vKey, oWorkObject, oPersistedObject, oMessageBuffer, oContext, oHandleManager);

                callConsistencyChecks(vKey, oWorkObject, oMessageBuffer, oContext);

                var mGeneratedKeys = generateKeys(oWorkObject, oHandleManager, oMetadataAccess);

                updateIntraObjectForeignKeys(mGeneratedKeys, oWorkObject, oMetadataAccess, oMessageBuffer.addMessage, oContext);

                oResponse.generatedKeys = filterRegisteredGeneratedKeys(mGeneratedKeys, oHandleManager);

                var fnUpdate = function() {
                    DB.update(oWorkObject, oMetadataAccess, oMessageBuffer.addMessage, oContext);
                };
                persist(vKey, oWorkObject, fnUpdate, oActionMetadata, oMetadataAccess, oMessageBuffer.addMessage, oContext);
                addConcurrencyToken(oResponse, oWorkObject);
                callDeterminations([DeterminationEvent.OnPersist], vKey, oWorkObject, oPersistedObject, oMessageBuffer, oContext, oHandleManager);
            });
        };
    }

    function getStaticCustomActionProcessor(oActionMetadata) {
        return function(oParameters) {
            return process(oActionMetadata, function(oResponse, oMessageBuffer, oContext, oInternalContext, oHandleManager) {
                callStaticAuthCheck(oActionMetadata.authorizationCheck, oParameters, oMessageBuffer, oContext);

                if (oActionMetadata.enabledCheck) {
                    var oReadOnlyBulkAccess = DB.getBulkAccess(oMetadataAccess, oContext, true);
                    callStaticEnabledCheck(oActionMetadata.enabledCheck, oParameters, oReadOnlyBulkAccess, oMessageBuffer, oContext);
                }

                var oBulkAccess = DB.getBulkAccess(oMetadataAccess, oContext);
                oResponse.result = oActionMetadata.execute(oParameters, oBulkAccess, oMessageBuffer.addMessage, oHandleManager.getNextHandle, oContext, oMetadataAccess);
            });
        };
    }

    function getPropertiesProcessor() {

        return function(vKey, oScope) {
            var oResult = {};
            var oContext = _createContext(undefined);
            var oMessageBuffer = Message.createMessageBuffer();
            if (!vKey) {
                oMessageBuffer.addMessage(MessageSeverity.Error, Messages.INVALID_OBJECT_KEY, undefined, Metadata.Node.Root);
                oResult.messages = oMessageBuffer.getMessages();
                return oResult;
            }

            var oPersistedObject = read(vKey, oContext.external);
            if (!oPersistedObject) {
                oMessageBuffer.addMessage(MessageSeverity.Error, Messages.OBJECT_NOT_FOUND, vKey, Metadata.Node.Root);
                oResult.messages = oMessageBuffer.getMessages();
                return oResult;
            }

            oResult = {
                actions : {},
                nodes : {}
            };

            // Actions
            if (oScope.actions) {
                var aActionPropertyRequest = [];
                // array of objects {
                // // action: actionMetadata,
                // // parameters : vParameters
                // }
                if (oScope.actions === true) {
                    aActionPropertyRequest = _.map(oMetadataAccess.getActions(), function(oActionMetadata) {
                        return {
                            action : oActionMetadata,
                            parameters : null
                        };
                    });
                } else {
                    var aAllActionMetadata = oMetadataAccess.getActions();
                    _.each(oScope.actions, function(vAction) {
                        var sActionName = _.isString(vAction) ? vAction : vAction.name;
                        var oActionParameters = _.isPlainObject(vAction) ? vAction.parameters : null;
                        if (aAllActionMetadata[sActionName]) {
                            aActionPropertyRequest.push({
                                action : aAllActionMetadata[sActionName],
                                parameters : oActionParameters
                            });
                        }
                    });
                }

                aActionPropertyRequest = _.filter(aActionPropertyRequest, function(oActionPropertyRequest) {
                    return !oActionPropertyRequest.action.isStatic && !_.contains([Metadata.Action.Create, Metadata.Action.Read, Metadata.Action.Exists, Metadata.Action.Properties], oActionPropertyRequest.action.name);
                });

                _.each(aActionPropertyRequest, function(oActionPropertyRequest) {
                    var oActionMetadata = oActionPropertyRequest.action;
                    var oProcessMessageBuffer;
                    var oActionResult = {};
                    process(oActionMetadata, function(oResponse, oMessageBuffer, oContext, oInternalContext, oHandleManager) {

                        oProcessMessageBuffer = oMessageBuffer;
                        oProcessMessageBuffer.suppressLogging(true);

                        oInternalContext.setProcessedObject(oPersistedObject);

                        if (oActionMetadata.customProperties && _.isPlainObject(oActionMetadata.customProperties)) {
                            oActionResult.customProperties = oActionMetadata.customProperties;
                        }

                        callAuthCheck(oActionMetadata.authorizationCheck, vKey, oPersistedObject, oMessageBuffer, oContext);

                        // Dynamic custom properties need to run after auth check in privileged mode
                        // Static are returned before auth check will eventually abort execution
                        if (oActionMetadata.customProperties && _.isFunction(oActionMetadata.customProperties)) {
                            oActionResult.customProperties = oActionMetadata.customProperties(vKey, oActionPropertyRequest.parameters, oPersistedObject, oMessageBuffer.addMessage, oContext, oActionMetadata, oMetadataAccess);
                        }

                        if (oActionMetadata.enabledCheck) {
                            callEnabledCheck(oActionMetadata.enabledCheck, vKey, oPersistedObject, oMessageBuffer, oContext);
                        }

                    });

                    oActionResult.enabled = oProcessMessageBuffer.getMinSeverity() > MessageSeverity.Error;
                    oActionResult.messages = oProcessMessageBuffer.getMessages();

                    oResult.actions[oActionMetadata.name] = oActionResult;
                });
            }

            // Nodes and attributes
            if (!oScope.nodes) {
                return oResult;
            }

            var aRequestedNodes = [];
            if (oScope.nodes === true) {
                aRequestedNodes = _.pluck(oMetadataAccess.getAllNodeMetadata(), 'name');
            } else {
                aRequestedNodes = oScope.nodes;
            }

            oContext.internal.setProcessedObject(oPersistedObject);

            try {
                // Properties always run in privileged mode, if action is allowed (needed for dynamic readOnly
                // functions)
                oPrivilegedContext = oContext.external;

                _.visitInstanceTree(oPersistedObject, function(oObjectNode, sKey, bObjectInArray) {
                    var sNodeName = _getNodeName(sKey);
                    var oNodeMetadata = oMetadataAccess.getNodeMetadata(sNodeName);
                    if (sNodeName === Metadata.Node.Root || bObjectInArray) {
                        if (!_.contains(aRequestedNodes, sNodeName)) {
                            return;
                        }

                        var vNodeKey = oMetadataAccess.getNodeKeyValue(sNodeName, oObjectNode);
                        var oNodeResult = {
                            messages : [],
                            attributes : {}
                        };

                        var oNodeMessageBuffer = Message.createMessageBuffer();
                        oNodeMessageBuffer.suppressLogging(true);

                        if (!oResult.nodes[sNodeName]) {
                            oResult.nodes[sNodeName] = {};
                        }

                        oResult.nodes[sNodeName][vNodeKey] = oNodeResult;

                        oNodeResult.readOnly = _.toBool(oNodeMetadata.readOnly || (oNodeMetadata.checkReadOnly && oNodeMetadata.checkReadOnly(vNodeKey, oObjectNode, oNodeMessageBuffer.addMessage, oContext.external, oNodeMetadata)));

                        if (oNodeMetadata.customProperties) {
                            if (_.isFunction(oNodeMetadata.customProperties)) {
                                oNodeResult.customProperties = oNodeMetadata.customProperties(vNodeKey, oObjectNode, oNodeMessageBuffer.addMessage, oContext.external, oNodeMetadata);
                            } else {
                                oNodeResult.customProperties = oNodeMetadata.customProperties;
                            }
                        }

                        oNodeResult.messages = oNodeMessageBuffer.getMessages();

                        _.each(oNodeMetadata.attributes, function(oAttributeMetadata) {

                            var oAttributeResult = {
                                messages : []
                            };
                            oNodeResult.attributes[oAttributeMetadata.name] = oAttributeResult;

                            var oAttributeMessageBuffer = Message.createMessageBuffer();
                            oAttributeMessageBuffer.suppressLogging(true);

                            if (oAttributeMetadata.customProperties) {
                                if (_.isFunction(oAttributeMetadata.customProperties)) {
                                    oAttributeResult.customProperties = oAttributeMetadata.customProperties(vNodeKey, oObjectNode, oAttributeMessageBuffer.addMessage, oContext.external, oNodeMetadata);
                                } else {
                                    oAttributeResult.customProperties = oAttributeMetadata.customProperties;
                                }
                            }

                            if (oNodeResult.readOnly) {
                                oAttributeResult.readOnly = true;
                                return;
                            }

                            oAttributeResult.readOnly = _.toBool(oAttributeMetadata.readOnly || (oAttributeMetadata.checkReadOnly && oAttributeMetadata.checkReadOnly(vNodeKey, oObjectNode, oAttributeMessageBuffer.addMessage, oContext.external, oNodeMetadata)));

                            oAttributeResult.messages = oAttributeMessageBuffer.getMessages();
                        });
                    }
                });
            } catch (oException) {
                throw oException;
            } finally {
                if (oPrivilegedContext === oContext.external) {
                    oPrivilegedContext = undefined;
                }
            }
            return oResult;
        };
    }

    function getStaticPropertiesProcessor() {
        return function(oScope) {
            var oResult = {
                actions : {},
                nodes : {}
            };

            if (oScope.actions) {
                _.each(oScope.actions, function(oAction) {
                    var sActionName = oAction.name;
                    var oParameter = oAction.parameters;
                    var oActionResult = {
                        enabled : true,
                        messages : []
                    };

                    var oActionMetadata = oMetadataAccess.getActions()[sActionName];
                    if (!oActionMetadata.isStatic) {
                        return;
                    }

                    var oProcessMessageBuffer;

                    process(oActionMetadata, function(oResponse, oMessageBuffer, oContext, oInternalContext, oHandleManager) {

                        oProcessMessageBuffer = oMessageBuffer;
                        oProcessMessageBuffer.suppressLogging(true);

                        if (oActionMetadata.customProperties && _.isPlainObject(oActionMetadata.customProperties)) {
                            oActionResult.customProperties = oActionMetadata.customProperties;
                        }

                        // Create action needs special treatment as check interfaces adhere to instance base action
                        // signature historically
                        if (sActionName === Metadata.Action.Create) {
                            callAuthCheck(oActionMetadata.authorizationCheck, undefined, oParameter, oMessageBuffer, oContext);
                        } else {
                            callStaticAuthCheck(oActionMetadata.authorizationCheck, oParameter, oMessageBuffer, oContext);
                        }

                        var oReadOnlyBulkAccess = DB.getBulkAccess(oMetadataAccess, oContext, true);

                        // Dynamic custom properties need to run after auth check in privileged mode
                        // Static are returned before auth check will eventually abort execution
                        if (oActionMetadata.customProperties && _.isFunction(oActionMetadata.customProperties)) {
                            oActionResult.customProperties = oActionMetadata.customProperties(oParameter, oReadOnlyBulkAccess, oMessageBuffer.addMessage, oContext, oActionMetadata, oMetadataAccess);
                        }

                        if (oActionMetadata.enabledCheck) {
                            if (sActionName === Metadata.Action.Create) {
                                callEnabledCheck(oActionMetadata.enabledCheck, undefined, oParameter, oMessageBuffer, oContext);
                            } else {
                                callStaticEnabledCheck(oActionMetadata.enabledCheck, oParameter, oReadOnlyBulkAccess, oMessageBuffer, oContext);
                            }
                        }
                    });

                    oActionResult.messages = oProcessMessageBuffer.getMessages();
                    if (oProcessMessageBuffer.getMinSeverity() <= MessageSeverity.Error) {
                        oActionResult.enabled = false;
                    }

                    oResult.actions[sActionName] = oActionResult;
                });
            }

            if (!oScope.nodes) {
                return oResult;
            }

            var aRequestedNodes = [];
            if (oScope.nodes === true) {
                aRequestedNodes = _.pluck(oMetadataAccess.getAllNodeMetadata(), 'name');
            } else {
                aRequestedNodes = oScope.nodes;
            }

            _.each(oMetadataAccess.getAllNodeMetadata(), function(oNodeMetadata) {
                if (_.contains(aRequestedNodes, oNodeMetadata.name)) {
                    var oNodeResult = {
                        readOnly : oNodeMetadata.readOnly,
                        attributes : _.mapObjects(oNodeMetadata.attributes, function(oAttribute) {
                            return _.pick(oAttribute, "readOnly");
                        })
                    };

                    if (oNodeMetadata.customProperties && _.isPlainObject(oNodeMetadata.customProperties)) {
                        oNodeResult.customProperties = oNodeMetadata.customProperties;
                    }

                    oResult.nodes[oNodeMetadata.name] = oNodeResult;
                }
            });

            return oResult;
        };
    }

    return oFacade;
}

/*
 * Runtime context provides access to framework services to the application and enables later to change access to
 * different paths.
 */
function _createContext(oAction) {
    // Across calls we need to keep the timestamp
    var sTimestamp = oPrivilegedContext ? oPrivilegedContext.getRequestTimestamp() : new Date().toISOString();
    var sHistoryEvent;
    var oContextProcessedObject = null;
    return {
        external : {
            getHQ : DB.getHQ,
            // A secondary HQuery for SQL execution which should not influence commit of the main HQ used by the
            // framework
            // The secondary HQ autoCommits
            getSecondaryHQ : function() {
                return DB.getSecondaryHQ();
            },
            getUser : Auth.getApplicationUser,
            getAction : function() {
                return oAction;
            },
            getRequestTimestamp : function() {
                return sTimestamp;
            },
            getHistoryEvent : function() {
                return sHistoryEvent || (oAction && oAction.historyEvent);
            },
            setHistoryEvent : function(sNewHistoryEvent) {
                sHistoryEvent = sNewHistoryEvent;
            },
            getProcessedObject : function() {
                return oContextProcessedObject;
            }
        },
        internal : {
            setProcessedObject : function(oProcessedObject) {
                oContextProcessedObject = oProcessedObject;
            }
        }
    };
}

function isHandle(vValue) {
    return !vValue || parseInt(vValue) < 0;
}

function createHandleManager() {
    var iNextHandle = -1;
    var iMinUsedHandle = 0;

    return {
        getNextHandle : function() {
            return iNextHandle--;
        },
        isRegisteredHandle : function(iHandle) {
            return iHandle >= iMinUsedHandle;
        },
        registerUsedHandle : function(iHandle) {
            if (isHandle(iHandle)) {
                if (iHandle <= iNextHandle) {
                    iNextHandle = iHandle - 1;
                }
                if (iHandle < iMinUsedHandle) {
                    iMinUsedHandle = iHandle;
                }
            }
        },
        isHandle : isHandle
    };
}

function generateKeys(oWorkObject, oHandleManager, oMetadataAccess) {
    var mGeneratedKeys = {};

    _.visitInstanceTree(oWorkObject, function(oWorkObjectNode, sKey, bObjectInArray, vParentKey) {
        if (_.isArray(oWorkObjectNode)) {
            return undefined;
        }

        var sNodeName = _getNodeName(sKey);

        var oNodeMetadata = oMetadataAccess.getNodeMetadata(sNodeName);
        // Function could be instantiated only once per node (and not per instance of nodes
        var fnSequence = oMetadataAccess.getNodeSequence(sNodeName);

        var vKey = oMetadataAccess.getNodeKeyValue(sNodeName, oWorkObjectNode);
        if (oHandleManager.isHandle(vKey)) {
            var vNextKey;
            if (oNodeMetadata.primaryKey === oNodeMetadata.parentKey) {
                vNextKey = vParentKey;
            } else {
                if (!fnSequence) {
                    _.raiseException("Define sequence for node " + sNodeName);
                }
                vNextKey = fnSequence();
            }
            oMetadataAccess.setNodeKeyValue(sNodeName, vNextKey, oWorkObjectNode);
            if (vKey) {
                mGeneratedKeys[vKey] = vNextKey;
            }
            vKey = vNextKey;
        }
        return vKey;
    });
    return mGeneratedKeys;
}

function _initNewObject(oMetadataAccess) {
    var oNewObject = {};
    var oNodeMetadata = oMetadataAccess.getNodeMetadata(Metadata.Node.Root);
    _.each(oNodeMetadata.attributes, function(oAttributeMetadata) {
        oNewObject[oAttributeMetadata.name] = null;
    });

    var aSubNodeMetadata = oMetadataAccess.getSubNodeMetadata(Metadata.Node.Root);
    _.each(aSubNodeMetadata, function(oNodeMetadata) {
        oNewObject[oNodeMetadata.name] = [];
    });

    return oNewObject;
}

function _mergeObjects(oDestination, oSource, oMetadataAccess, oMessageBuffer, fnVisitObject, oRequestContext) {

    _.visitInstanceTree(oSource, function(oSourceObject, sKey, bObjectInArray, oContext) {
        var sNodeName = _getNodeName(sKey);
        var oNodeMetadata = oMetadataAccess.getNodeMetadata(sNodeName);
        if (!oNodeMetadata) {
            oMessageBuffer.addMessage(MessageSeverity.Fatal, Messages.NODE_UNKNOWN, null, sNodeName, null, sNodeName);
            return {
                key : sKey,
                destinationObject : {}
            };
        }
        var bReadOnly = oNodeMetadata.readOnly;

        var vKey;
        var oDestinationObject;

        if (!oContext || bObjectInArray) {

            // Root node
            if (!oContext) {
                oDestinationObject = oDestination;
                vKey = oMetadataAccess.getNodeKeyValue(sNodeName, oDestinationObject);
                bReadOnly = bReadOnly || (oNodeMetadata.checkReadOnly && oNodeMetadata.checkReadOnly(vKey, oDestinationObject, oMessageBuffer.addMessage, oRequestContext, oNodeMetadata));
            } else {
                var vSourceKey = oMetadataAccess.getNodeKeyValue(sNodeName, oSourceObject);
                oDestinationObject = _.find(oContext.allDestinationObjects, function(oDestinationObject) {
                    return vSourceKey === oMetadataAccess.getNodeKeyValue(sNodeName, oDestinationObject);
                });
                if (oDestinationObject) {
                    // Read only check has been done in call for array
                    bReadOnly = bReadOnly || !_.isUndefined(_.find(oContext.readOnlyDestinationObjects, function(oDestinationObject) {
                        return vSourceKey === oMetadataAccess.getNodeKeyValue(sNodeName, oDestinationObject);
                    }));
                } else {
                    // New instance
                    if (!isHandle(vSourceKey)) {
                        oMessageBuffer.addMessage(MessageSeverity.Fatal, Messages.NODE_INSTANCE_UNKNOWN, vSourceKey, sNodeName, oNodeMetadata.primaryKey, vSourceKey, sNodeName);
                    }
                    bReadOnly = bReadOnly || (oNodeMetadata.checkReadOnly && oNodeMetadata.checkReadOnly(undefined, {}, oMessageBuffer.addMessage, oRequestContext, oNodeMetadata));
                }
            }

            if (!bReadOnly) {

                var oCleanSourceObject = {};
                vKey = oMetadataAccess.getNodeKeyValue(sNodeName, oDestinationObject);

                _.each(oNodeMetadata.attributes, function(oMetadataAttribute) {
                    if (_.has(oSourceObject, oMetadataAttribute.name)) {
                        var bAttrChanged = !_.has(oDestinationObject || {}, oMetadataAttribute.name) || !_.isEqual(oDestinationObject[oMetadataAttribute.name], oSourceObject[oMetadataAttribute.name]);

                        if (bAttrChanged && oMetadataAttribute.readOnly) {
                            oMessageBuffer.addMessage(MessageSeverity.Warning, Messages.ATTRIBUTE_READ_ONLY, vKey, sNodeName, oMetadataAttribute.name, oMetadataAttribute.name);
                        } else if (bAttrChanged && oMetadataAttribute.checkReadOnly && oMetadataAttribute.checkReadOnly(vKey, oDestinationObject, oMessageBuffer.addMessage, oRequestContext, oNodeMetadata)) {
                            oMessageBuffer.addMessage(MessageSeverity.Warning, Messages.ATTRIBUTE_READ_ONLY, vKey, sNodeName, oMetadataAttribute.name, oMetadataAttribute.name);
                        } else {
                            oCleanSourceObject[oMetadataAttribute.name] = oSourceObject[oMetadataAttribute.name];
                        }
                    }
                });

                // Set constant key values
                _.each(oNodeMetadata.constantKeys, function(sValue, sAttributeName) {
                    oCleanSourceObject[sAttributeName] = sValue;
                });

                if (oDestinationObject) {
                    _.extend(oDestinationObject, oCleanSourceObject);
                } else {
                    oDestinationObject = oCleanSourceObject;
                }
                if (oContext) {
                    oContext.destinationObjects.push(oDestinationObject);
                }

                if (fnVisitObject) {
                    vKey = oMetadataAccess.getNodeKeyValue(sNodeName, oSourceObject);
                    fnVisitObject(vKey, oCleanSourceObject, sNodeName);
                }

            } else {
                if (!!_.find(oNodeMetadata.persistedAttributes, function(sAttributeName) {
                    return sAttributeName !== oNodeMetadata.primaryKey && _.has(oSourceObject, sAttributeName);
                })) {
                    vKey = oMetadataAccess.getNodeKeyValue(sNodeName, oSourceObject);
                    oMessageBuffer.addMessage(MessageSeverity.Warning, Messages.NODE_READ_ONLY, vKey, sNodeName, undefined, sNodeName);
                }
            }

            return {
                key : sKey,
                destinationObject : oDestinationObject
            };

        } else {

            oDestinationObject = oContext.destinationObject;

            var aAllDestinationChildObject = [];
            var aReadOnlyDestinationChildObject = [];

            if (oDestinationObject && oDestinationObject[sNodeName]) {
                aAllDestinationChildObject = oDestinationObject[sNodeName];
                aReadOnlyDestinationChildObject = _.filter(aAllDestinationChildObject, function(oDestinationChildObject) {
                    var vKey = oMetadataAccess.getNodeKeyValue(sNodeName, oDestinationChildObject);
                    var bReadOnly = oNodeMetadata.readOnly || (oNodeMetadata.checkReadOnly && oNodeMetadata.checkReadOnly(vKey, oDestinationChildObject, oMessageBuffer.addMessage, oRequestContext, oNodeMetadata));
                    if (bReadOnly) {
                        // Set only constant key values
                        _.each(oNodeMetadata.constantKeys, function(sValue, sAttributeName) {
                            oDestinationChildObject[sAttributeName] = sValue;
                        });
                    }
                    return bReadOnly;
                });
            }

            oDestinationObject[sNodeName] = _.clone(aReadOnlyDestinationChildObject);

            return {
                key : sKey,
                destinationObjects : oDestinationObject[sNodeName],
                readOnlyDestinationObjects : aReadOnlyDestinationChildObject,
                allDestinationObjects : aAllDestinationChildObject
            };
        }
    });

    return oDestination;
}

function _getNodeName(sKey) {
    return (sKey === undefined) ? Metadata.Node.Root : sKey;
}