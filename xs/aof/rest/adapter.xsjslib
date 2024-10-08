var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var Message = $.import("sap.ino.xs.aof.lib", "message");
var RestMetadata = $.import("sap.ino.xs.aof.rest", "metadata");
var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var Action = AOF.Action;

var ContentType = {
    Plain : "text/plain",
    JSON : "application/json"
};

// Mapping from HTTP method to AOF action
var mMethodActionMap = {};
mMethodActionMap[$.net.http.GET] = Action.Read;
mMethodActionMap[$.net.http.POST] = Action.Create;
mMethodActionMap[$.net.http.PUT] = Action.Update;
mMethodActionMap[$.net.http.DEL] = Action.Del;

// This function exposes an application object to be consumed in a REST-like manner (or what we have
// defined as REST-like :-)
// Mapper is optional and may contain requestMapper or responseMapper functions
function expose(sObjectName, oMapper, bDefaultSchema) {
    // TraceWrapper cares for correctly setting the trace information
    // to the trace library and proper exception display (or hiding in a productive environment)
    return TraceWrapper.wrap_request_handler(function() {
        bDefaultSchema = (bDefaultSchema === undefined) ? true : bDefaultSchema;
        if (bDefaultSchema) {
            AOF.setDefaultSchema("SAP_INO");
        }

        return _handleRequest(sObjectName, $.request, $.response, oMapper);
    });
}

function HttpResponseException(iStatus, sBody, sContentType) {
    this.fillResponse = function(oResponse) {
        oResponse.status = iStatus;
        oResponse.contentType = sContentType || ContentType.Plain;
        oResponse.setBody(sBody);
    };
}

function _handleRequest(sObjectName, oRequest, oResponse, oMapper) {
    var oTransaction;
    try {
        oTransaction = AOF.getTransaction();
        if (oRequest.parameters && !!oRequest.parameters.get("$disableExtensions") && TraceWrapper.has_debug_authorization()) {
            AOF.disableExtensions();
        }

        var oApplicationObject = AOF.getApplicationObject(sObjectName);
        var oMetadata = oApplicationObject.getMetadata();

        var oRequestInfo = _getRequestInfo(oRequest);
        var oRequestObject = _getPayloadObjectFromRequest(oRequest, oMapper);

        var oExecutionResult;

        if (oRequestInfo.isMetadataRequest) {
            oExecutionResult = _getMetadata(sObjectName);
        }

        if (oRequestInfo.isPropertiesRequest) {
            oExecutionResult = _getProperties(oApplicationObject, oRequestInfo);
        }

        if (oRequestInfo.isStaticPropertiesRequest) {
            oExecutionResult = _getStaticProperties(oApplicationObject, oRequestInfo);
        }

        if (!oRequestInfo.isPropertiesRequest && !oRequestInfo.isStaticPropertiesRequest && !oRequestInfo.isMetadataRequest) {
            oExecutionResult = _executeAction(oMetadata, oRequestInfo, oApplicationObject, oRequestObject, _.first(oRequestInfo.keys), oMapper);
            if (oExecutionResult.status === $.net.http.OK || oExecutionResult.status === $.net.http.CREATED) {
                oTransaction.commit();
            } else {
                oTransaction.rollback();
            }
            if (oMapper && oMapper.responseMapper) {
                oExecutionResult = oMapper.responseMapper(oExecutionResult, oRequestInfo.action);
            }
        }

        oResponse.status = oExecutionResult.status;
        oResponse.contentType = oExecutionResult.contentType;
        oResponse.setBody(oExecutionResult.body);
        _.each(oExecutionResult.headers || [], function(sHeaderValue, sHeaderName) {
            oResponse.headers.set(sHeaderName, sHeaderValue);
        });

    } catch (oException) {
        if (oTransaction) {
            oTransaction.rollback();
        }
        if (oException instanceof HttpResponseException) {
            oException.fillResponse(oResponse);
        } else {
            throw oException;
        }
    }
}

function _executeAction(oMetadata, oRequestInfo, oApplicationObject, oRequestObject, vKey, oMapper) {
    var sAction = oRequestInfo.action;
    var aAction = _.pluck(oMetadata.getActions(), 'name');
    if (!_.contains(aAction, sAction)) {
        throw new HttpResponseException($.net.http.METHOD_NOT_ALLOWED, "Unknown action");
    }

    var sConcurrencyToken = oRequestInfo.concurrencyToken;

    var oResponse;

    switch (sAction) {
        case Action.Create :
            oResponse = _getModifyResponse(oApplicationObject.create(oRequestObject), $.net.http.CREATED);
            break;
        case Action.Update :
            oResponse = _getModifyResponse(oApplicationObject.update(oRequestObject, sConcurrencyToken), $.net.http.OK);
            break;
        case Action.Del :
            oResponse = _getModifyResponse(oApplicationObject.del(vKey, sConcurrencyToken), $.net.http.OK);
            break;
        case Action.Read :
            var oObject = oApplicationObject.read(vKey);
            if (oObject === null) {
                throw new HttpResponseException($.net.http.NOT_FOUND, "Not found");
            }
            oResponse = _getReadResponse(vKey, oObject, oApplicationObject);
            break;
        // Custom Actions (and core copy)
        default :
            var oActionMetadata = _.findWhere(oMetadata.getActions(), {
                name : sAction
            });
            if (oActionMetadata.isStatic === true) {
                oResponse = _getModifyResponse(oApplicationObject[sAction](oRequestObject), $.net.http.OK);
            } else {
                oResponse = _getModifyResponse(oApplicationObject[sAction](vKey, oRequestObject, sConcurrencyToken), $.net.http.OK);
            }
    }
    return oResponse;
}

function _getModifyResponse(oResult, iSuccessStatus) {
    var iMinSeverity;
    var bContainsAuthMessage = false;
    var bContainsConcurrencyConflictMessage = false;
    if (oResult.messages && oResult.messages.length > 0) {
        iMinSeverity = _.min(_.pluck(oResult.messages, 'severity'));
        bContainsAuthMessage = !!_.find(oResult.messages, function(oMessage) {
            return oMessage.messageKey && oMessage.messageKey.indexOf("AUTH") > -1;
        });

        bContainsConcurrencyConflictMessage = !!_.findWhere(oResult.messages, {
            messageKey : AOF.Messages.CONCURRENCY_TOKEN_CONFLICT
        });
    }

    var iStatus = iSuccessStatus;
    if (iMinSeverity <= AOF.MessageSeverity.Error) {
        if (bContainsAuthMessage) {
            iStatus = $.net.http.FORBIDDEN;
        } else if (bContainsConcurrencyConflictMessage) {
            iStatus = $.net.http.PRECONDITION_FAILED;
        } else {
            iStatus = $.net.http.BAD_REQUEST;
        }
    }

    var oBody = _mapActionResult(oResult);
    var oResponse = {
        status : iStatus,
        contentType : ContentType.JSON,
        body : JSON.stringify(oBody)
    };

    if (oResult.concurrencyToken) {
        oResponse.headers = {
            ETag : oResult.concurrencyToken
        };
    }

    return oResponse;
}

function _getReadResponse(vKey, oActionResult, oApplicationObject) {
    var oResult = {};

    if (oResult.messages) {
        oResult = _mapActionResult(oActionResult);
    } else {
        if (oApplicationObject.getMetadata().getObjectMetadata().isConcurrencyControlEnabled === true) {
            var sETag = oApplicationObject.calculateConcurrencyToken(vKey, oActionResult);
            oResult.headers = {
                ETag : sETag
            };
        }
        oResult.status = $.net.http.OK;
        oResult.contentType = ContentType.JSON;
        oResult.body = JSON.stringify(oActionResult);
    }

    return oResult;
}

function _getMetadata(sObjectName) {
    var oResult = {};

    var oMetadataResult = RestMetadata.getMetadata(sObjectName);
    if (oMetadataResult) {
        oResult.status = $.net.http.OK;
        oResult.contentType = ContentType.JSON;
        oResult.body = JSON.stringify(oMetadataResult);
    } else {
        oResult.status = $.net.http.NOT_FOUND;
    }
    return oResult;
}

function _getProperties(oApplicationObject, oRequestInfo) {
    var oResult = {};

    var oPropertiesResult = {};
    _.each(oRequestInfo.keys, function(vKey) {
        var oProperties = oApplicationObject.properties(vKey, {
            actions : oRequestInfo.requestedActions,
            nodes : oRequestInfo.requestedNodes
        });

        if (oProperties && oProperties.actions) {
            oProperties.actions = _.mapObjects(oProperties.actions, function(oObject) {
                oObject.messages = Message.mapMessagesToResult(oObject.messages);
                return oObject;
            });
        }

        oPropertiesResult[vKey] = oProperties;
    });

    oResult.status = $.net.http.OK;
    oResult.contentType = ContentType.JSON;
    oResult.body = JSON.stringify(oPropertiesResult);

    return oResult;
}

function _getStaticProperties(oApplicationObject, oRequestInfo) {
    var oResult = {};
    var oProperties = oApplicationObject.staticProperties({
        actions : oRequestInfo.requestedActions,
        nodes : oRequestInfo.requestedNodes
    });

    oProperties.actions = _.mapObjects(oProperties.actions, function(oObject) {
        oObject.messages = Message.mapMessagesToResult(oObject.messages);
        return oObject;
    });

    oResult.status = $.net.http.OK;
    oResult.contentType = ContentType.JSON;
    oResult.body = JSON.stringify(oProperties);

    return oResult;
}

function _mapActionResult(oActionResult) {
    var oResult = {};
    oResult.GENERATED_IDS = oActionResult.generatedKeys;
    if (oActionResult.messages) {
        oResult.MESSAGES = Message.mapMessagesToResult(oActionResult.messages);
    }
    if (oActionResult.result) {
        oResult.RESULT = oActionResult.result;
    }
    return oResult;
}

function _getRequestInfo(oRequest) {

    var oResult = {
        action : undefined,
        keys : [],
        object : undefined,
        isMetadataRequest : false,
        isPropertiesRequest : false,
        concurrencyToken : undefined
    };

    // Custom actions have to be submitted via POST
    // CRUD actions may be but are also defaulted from the HTTP method

    // the action might be at first or second place
    // query parts starting trace are not considered as actions
    // as appending /trace (or trace[e|d|i|w]) starts tracing

    // The following cases have to be distinguished for queryString
    // 1. test.xsjs/1/action_name
    // 2. test.xsjs/1/action_name/trace
    // 3. test.xsjs/traced (standard action with tracing)
    // 4. test.xsjs/1/traced
    // 5. test.xsjs
    // 6. test.xsjs/metadata
    // 7. test.xsjs/properties?key=1&key=2&action=update&action=customAction&node=Root
    // 8. test.xsjs/1/properties?action=update&action=customAction&node=Root
    // 9. test.xsjs/staticProperties?action={ create : { ref_id : 1 }}

    var sAction;
    var vKey;
    var sQueryPath = oRequest.queryPath;

    function mapToInt(vKey) {
        return (!isNaN(vKey)) ? parseInt(vKey, 10) : vKey;
    }

    if (sQueryPath) {
        var aParts = sQueryPath.split("/") || [];
        var bIgnoreLast = _.last(aParts).startsWith("trace");
        if (bIgnoreLast) {
            aParts = _.initial(aParts);
        }

        if (oRequest.method === $.net.http.DEL || oRequest.method === $.net.http.PUT || oRequest.method === $.net.http.GET) {
            vKey = _.first(aParts);
        }

        if (oRequest.method === $.net.http.POST) {
            sAction = _.last(aParts);
            if (aParts.length >= 2) {
                vKey = _.first(aParts);
            }
        }

        vKey = mapToInt(vKey);

        if (_.first(aParts) === "metadata") {
            oResult.isMetadataRequest = true;
            return oResult;
        }

        var aAction;
        var aNode;

        if (_.first(aParts) === "staticProperties") {
            oResult.isStaticPropertiesRequest = true;
            aAction = _.map(_.pluck(_.where(oRequest.parameters, {
                name : 'action'
            }), 'value'), JSON.parse);

            oResult.requestedActions = _.map(aAction, function(oAction) {
                var sActionName = _.first(_.keys(oAction));
                return {
                    name : sActionName,
                    parameters : oAction[sActionName]
                };
            });

            aNode = _.pluck(_.where(oRequest.parameters, {
                name : 'node'
            }), 'value');

            oResult.requestedNodes = _.contains(aNode, 'all') || aNode;
            return oResult;
        }

        if (_.first(aParts) === "properties") {
            oResult.isPropertiesRequest = true;
            oResult.keys = _.map(_.pluck(_.where(oRequest.parameters, {
                name : 'key'
            }), 'value'), mapToInt);
        }

        if (_.size(aParts) >= 2 && aParts[1] === "properties") {
            oResult.isPropertiesRequest = true;
            oResult.keys = [vKey];
        }

        if (oResult.isPropertiesRequest === true) {
            aAction = _.pluck(_.where(oRequest.parameters, {
                name : 'action'
            }), 'value');

            aAction = _.map(aAction, function(vAction) {
                // is either just an action name or an object with name and parameters
                try {
                    var oAction = JSON.parse(vAction);
                    var sActionName = _.first(_.keys(oAction));
                    return {
                        name : sActionName,
                        parameters : oAction[sActionName]
                    };
                } catch (e) {
                    return vAction;
                }
            });

            oResult.requestedActions = _.contains(aAction, 'all') || aAction;

            aNode = _.pluck(_.where(oRequest.parameters, {
                name : 'node'
            }), 'value');

            oResult.requestedNodes = _.contains(aNode, 'all') || aNode;
            return oResult;
        }
    }

    // if no action given -> map to default action of HTTP method
    if (!sAction) {
        sAction = mMethodActionMap[oRequest.method];
    }

    if (!sAction) {
        throw new HttpResponseException($.net.http.METHOD_NOT_ALLOWED, "Unknown Action");
    }

    oResult.concurrencyToken = oRequest.headers && oRequest.headers.get("If-Match");
    if (oResult.concurrencyToken === "*") {
        oResult.concurrencyToken = undefined;
    }

    oResult.action = sAction;
    oResult.keys = [vKey];

    return oResult;

}

function _getPayloadObjectFromRequest(oRequest, oMapper) {
    // Currently we assume JSON payload. In future we could extend to other formats as well.
    try {
        if (oMapper && oMapper.requestMapper) {
            return oMapper.requestMapper(oRequest);
        }
        if (oRequest.body) {
            var oObject = JSON.parse(oRequest.body.asString());
            return oObject;
        } else {
            return null;
        }
    } catch (oException) {
        throw new HttpResponseException($.net.http.BAD_REQUEST, "Error in payload: " + oException.toString());
    }
}

/* Public functions as re-use for outside consumers */

function handleRequest(sObjectName, oRequest, oResponse, oMapper) {
    return _handleRequest(sObjectName, oRequest, oResponse, oMapper);
}

function mapMessages(aMessages) {
    return Message.mapMessagesToResult(aMessages);
}

function getBodyPayload(oRequest) {
    return _getPayloadObjectFromRequest(oRequest);
}