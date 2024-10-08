var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var SchemaType = {
    Object : "Object",
    Node : "Node",
    RootNode : "RootNode",
    Attribute : "Attribute",
    Action : "Action",
    CustomAction : "CustomAction",

    Map : "Map",
    Array : "Array",
    Function : "Function",
    String : "String",
    Boolean : "Boolean",
    Number : "Number",
    None : "None"
};

// Definition of the Application Object Framework schema
var CORE_SCHEMA = {
    Object : {
        type : SchemaType.Map,
        definition : {
            type : {
                type : SchemaType.String
            },
            isExtensible : {
                type : SchemaType.Boolean
            },
            cascadeDelete : {
                type : SchemaType.Array,
                subType : SchemaType.String
            },
            Root : {
                required : true,
                type : SchemaType.RootNode
            },
            actions : {
                required : true,
                type : SchemaType.Map,
                constraints : {
                    optional : {
                        create : {
                            type : SchemaType.Action
                        },
                        copy : {
                            type : SchemaType.Action
                        },
                        update : {
                            type : SchemaType.Action
                        },
                        del : {
                            type : SchemaType.Action
                        },
                        read : {
                            type : SchemaType.Action
                        }
                    },
                    forbidden : {
                        exists : {},
                        properties : {},
                        staticProperties : {}
                    },
                    generic : {
                        type : SchemaType.CustomAction
                    }
                }
            }
        }
    },

    Node : {
        type : SchemaType.Map,
        definition : {
            table : {
                required : true,
                type : SchemaType.String
            },
            sequence : {
                type : SchemaType.String
            },
            historyTable : {
                type : SchemaType.String,
            },
            parentKey : {
                required : true,
                type : SchemaType.String
            },
            readOnly : {
                types : [SchemaType.Boolean, SchemaType.Function]
            },
            explicitAttributeDefinition : {
                type : SchemaType.Boolean
            },
            consistencyChecks : {
                type : SchemaType.Array,
                subType : SchemaType.Function
            },
            attributes : {
                type : SchemaType.Map,
                subType : SchemaType.Attribute
            },
            customProperties : {
                types : [SchemaType.Function, SchemaType.Map]
            },
            nodes : {
                type : SchemaType.Map,
                subType : SchemaType.Node
            }
        }
    },

    RootNode : {
        type : SchemaType.Map,
        template : SchemaType.Node,
        definition : {
            parentKey : {
                ignore : true
            },
            determinations : {
                type : SchemaType.Map,
                constraints : {
                    optional : {
                        onCreate : {
                            type : SchemaType.Array,
                            subType : SchemaType.Function
                        },
                        onPrepareCopy : {
                            type : SchemaType.Array,
                            subType : SchemaType.Function
                        },
                        onCopy : {
                            type : SchemaType.Array,
                            subType : SchemaType.Function
                        },
                        onUpdate : {
                            type : SchemaType.Array,
                            subType : SchemaType.Function
                        },
                        onModify : {
                            type : SchemaType.Array,
                            subType : SchemaType.Function
                        },
                        onDelete : {
                            type : SchemaType.Array,
                            subType : SchemaType.Function
                        },
                        onRead : {
                            type : SchemaType.Array,
                            subType : SchemaType.Function
                        },
                        onPersist : {
                            type : SchemaType.Array,
                            subType : SchemaType.Function
                        }
                    }
                }
            },
            activationCheck : {
                type : SchemaType.Function
            }
        }
    },

    Attribute : {
        type : SchemaType.Map,
        definition : {
            required : {
                type : SchemaType.Boolean
            },
            isPrimaryKey : {
                type : SchemaType.Boolean
            },
            foreignKeyTo : {
                type : SchemaType.String
            },
            foreignKeyIntraObject : {
                type : SchemaType.Boolean
            },
            constantKey : {
                types :  [SchemaType.String, SchemaType.Boolean, SchemaType.Number]
            },
            readOnly : {
                types : [SchemaType.Boolean, SchemaType.Function]
            },
            isName : {
                type : SchemaType.Boolean
            },
            concurrencyControl : {
                type : SchemaType.Boolean
            },
            minValue : {
                type : SchemaType.Number
            },
            maxValue : {
                type : SchemaType.Number
            },
            maxLength : {
                type : SchemaType.Number
            },
            consistencyChecks : {
                type : SchemaType.Array,
                subType : SchemaType.Function
            },
            customProperties : {
                types : [SchemaType.Function, SchemaType.Map]
            }
        }
    },

    Action : {
        type : SchemaType.Map,
        definition : {
            authorizationCheck : {
                required : true,
                types : [SchemaType.Function, SchemaType.None]
            },
            enabledCheck : {
                type : SchemaType.Function
            },
            executionCheck : {
                type : SchemaType.Function
            },
            persist : {
                type : SchemaType.Function
            },
            historyEvent : {
                type : SchemaType.String
            },
            customProperties : {
                types : [SchemaType.Function, SchemaType.Map]
            },
            isInternal : {
                type : SchemaType.Boolean
            },
            impacts : {
                type : SchemaType.Array,
                subType : SchemaType.String
            }
        }
    },

    CustomAction : {
        type : SchemaType.Map,
        template : SchemaType.Action,
        definition : {
            executionCheck : {
                ignore : true
            },
            execute : {
                required : true,
                type : SchemaType.Function
            },
            isStatic : {
                type : SchemaType.Boolean
            },
            massActionName : {
                type : SchemaType.String
            }
        }
    }
};

// Definition of the Application Object Framework extension schema
var EXTENSION_SCHEMA = {
    Object : {
        type : SchemaType.Map,
        definition : {
            Root : {
                type : SchemaType.RootNode
            },
            actions : {
                type : SchemaType.Map,
                constraints : {
                    optional : {
                        create : {
                            type : SchemaType.Action
                        },
                        copy : {
                            type : SchemaType.Action
                        },
                        update : {
                            type : SchemaType.Action
                        },
                        del : {
                            type : SchemaType.Action
                        },
                        read : {
                            type : SchemaType.Action
                        }
                    },
                    forbidden : {
                        exists : {},
                        properties : {},
                        staticProperties : {}
                    },
                    generic : {
                        type : SchemaType.CustomAction
                    }
                }
            }
        }
    },

    Node : {
        type : SchemaType.Map,
        definition : {
            readOnly : {
                types : [SchemaType.Boolean, SchemaType.Function]
            },
            consistencyChecks : {
                type : SchemaType.Array,
                subType : SchemaType.Function
            },
            attributes : {
                type : SchemaType.Map,
                subType : SchemaType.Attribute
            },
            customProperties : {
                types : [SchemaType.Function, SchemaType.Map]
            },
            nodes : {
                type : SchemaType.Map,
                subType : SchemaType.Node
            }
        }
    },

    RootNode : {
        type : SchemaType.Map,
        template : SchemaType.Node,
        definition : {
            determinations : {
                type : SchemaType.Map,
                constraints : {
                    optional : {
                        onCreate : {
                            type : SchemaType.Array,
                            subType : SchemaType.Function
                        },
                        onPrepareCopy : {
                            type : SchemaType.Array,
                            subType : SchemaType.Function
                        },
                        onCopy : {
                            type : SchemaType.Array,
                            subType : SchemaType.Function
                        },
                        onUpdate : {
                            type : SchemaType.Array,
                            subType : SchemaType.Function
                        },
                        onModify : {
                            type : SchemaType.Array,
                            subType : SchemaType.Function
                        },
                        onDelete : {
                            type : SchemaType.Array,
                            subType : SchemaType.Function
                        },
                        onRead : {
                            type : SchemaType.Array,
                            subType : SchemaType.Function
                        },
                        onPersist : {
                            type : SchemaType.Array,
                            subType : SchemaType.Function
                        }
                    }
                }
            }
        }
    },

    Attribute : {
        type : SchemaType.Map,
        definition : {
            required : {
                type : SchemaType.Boolean
            },
            foreignKeyTo : {
                type : SchemaType.String
            },
            readOnly : {
                types : [SchemaType.Boolean, SchemaType.Function]
            },
            minValue : {
                type : SchemaType.Number
            },
            maxValue : {
                type : SchemaType.Number
            },
            maxLength : {
                type : SchemaType.Number
            },
            consistencyChecks : {
                type : SchemaType.Array,
                subType : SchemaType.Function
            },
            customProperties : {
                types : [SchemaType.Function, SchemaType.Map]
            }
        }
    },

    Action : {
        type : SchemaType.Map,
        definition : {
            enabledCheck : {
                type : SchemaType.Function
            },
            executionCheck : {
                type : SchemaType.Function
            },
            customProperties : {
                types : [SchemaType.Function, SchemaType.Map]
            }
        }
    },

    CustomAction : {
        type : SchemaType.Map,
        template : SchemaType.Action,
        definition : {
            executionCheck : {
                ignore : true
            },
            execute : {
                type : SchemaType.Function
            }
        }
    }
};

function validateMetadataDefinition(oMetadataDefinition) {
    return _validateMetadataDefinition(oMetadataDefinition, CORE_SCHEMA);
}

function validateExtensionMetadataDefinition(oMetadataDefinition) {
    return _validateMetadataDefinition(oMetadataDefinition, EXTENSION_SCHEMA);
}

function _validateMetadataDefinition(oMetadataDefinition, oSchemaDefinition) {
    var aMessage = [];

    _.visitObjectTree(oMetadataDefinition, function(oDefinitionNode, sPropertyName, sParentPropertyName, oSchemaContext) {

        if (oSchemaContext && oSchemaContext.forbidden && _.has(oSchemaContext.forbidden, sPropertyName)) {
            return undefined;
        }

        var oSchema;
        var sSchemaType;
        var aSchemaTypes;
        var sSchemaSubType;

        if (!sPropertyName) {
            oSchema = _getSchemaForType(oSchemaDefinition, SchemaType.Object);
        } else {
            if (!oSchemaContext.inCollection) {
                oSchema = oSchemaContext.schema[sPropertyName];
                if (!oSchema && oSchemaContext.generic) {
                    oSchema = _getSchemaForType(oSchemaDefinition, oSchemaContext.generic.type);
                }
            } else {
                oSchema = oSchemaContext.schema;
            }
        }

        if (!oSchema) {
            return undefined;
        }

        sSchemaType = oSchema.type;
        sSchemaSubType = oSchema.subType;
        aSchemaTypes = oSchema.types;

        if (_isSchemaReference(sSchemaType, sSchemaSubType)) {
            oSchema = _resolveReferenceSchema(oSchemaDefinition, sSchemaType);
            if (oSchema) {
                sSchemaType = oSchema.type;
                sSchemaSubType = oSchema.subType;
            } else {
                oSchema = _resolveReferenceSchema(oSchemaDefinition, sSchemaSubType);
                sSchemaSubType = oSchema.type;
            }
        }

        if (!oSchema) {
            return undefined;
        }

        // Check Node Type
        aMessage = _.union(aMessage, _checkType(sPropertyName, oDefinitionNode, sSchemaType, sSchemaSubType, aSchemaTypes));

        if (_isCollectionType(sSchemaType) && sSchemaSubType) {
            return {
                schema : oSchema,
                inCollection : true
            };
        }

        // Check Definition (required, not allowed)
        if (oSchema.definition) {
            // Check if all required properties are in the definition
            aMessage = _.union(aMessage, _checkRequired(sPropertyName, oSchema.definition, oDefinitionNode));
            // Check if all properties in the definition are allowed according
            // to schema definition
            aMessage = _.union(aMessage, _checkNotAllowed(sPropertyName, oSchema.definition, oDefinitionNode));
            // Check Property type
            aMessage = _.union(aMessage, _checkPropertyType(sPropertyName, oSchema.definition, oDefinitionNode));
            return {
                schema : oSchema.definition
            };
        }

        // Check Constraints Definition (required, optional, generic)
        if (oSchema.constraints) {
            if (oSchema.constraints.required) {
                // Check if all required properties are in the definition
                aMessage = _.union(aMessage, _checkRequired(sPropertyName, oSchema.constraints.required, oDefinitionNode, true));
            }
            if (oSchema.constraints.optional) {
                // Check if all optional properties are not multiple times in
                // definition
                aMessage = _.union(aMessage, _checkDuplicates(sPropertyName, oSchema.constraints.optional, oDefinitionNode));
            }
            var oSchemaNodeDefinition = {};
            if (oSchema.constraints.required) {
                _.extend(oSchemaNodeDefinition, oSchema.constraints.required);
            }
            if (oSchema.constraints.optional) {
                _.extend(oSchemaNodeDefinition, oSchema.constraints.optional);
            }
            // Check if all properties in the definition are allowed according
            // to schema definition
            if (!oSchema.constraints.generic) {
                aMessage = _.union(aMessage, _checkNotAllowed(sPropertyName, oSchemaNodeDefinition, oDefinitionNode));
            }
            // Check for forbidden properties
            if (oSchema.constraints.forbidden) {
                aMessage = _.union(aMessage, _checkForbidden(sPropertyName, oSchema.constraints.forbidden, oDefinitionNode));
            }
            // Check Property type
            aMessage = _.union(aMessage, _checkPropertyType(sPropertyName, oSchemaNodeDefinition, oDefinitionNode));
            return {
                schema : oSchemaNodeDefinition,
                generic : oSchema.constraints.generic,
                forbidden : oSchema.constraints.forbidden
            };
        }

        return undefined;
    });

    return aMessage;
}

function _isReferenceType(sType) {
    switch (sType) {
        case SchemaType.Object :
        case SchemaType.Node :
        case SchemaType.RootNode :
        case SchemaType.Attribute :
        case SchemaType.Action :
        case SchemaType.CustomAction :
            return true;
    }
    return false;
}

function _isCollectionType(sType) {
    return sType == SchemaType.Map || sType == SchemaType.Array;
}

function _checkRequired(sPropertyName, oSchemaDefinition, oDefinitionNode, bAllRequired) {
    var aMessage = [];
    _.each(oSchemaDefinition, function(oSchemaDefinitionProperty, oSchemaDefinitionPropertyName) {
        var aDefinitionNodeProperty = _.filter(oDefinitionNode, function(oDefinitionNodeProperty, oDefinitionNodePropertyName) {
            return oDefinitionNodePropertyName == oSchemaDefinitionPropertyName;
        });
        if (oSchemaDefinitionProperty.required || bAllRequired) {
            if (!aDefinitionNodeProperty || aDefinitionNodeProperty.length === 0) {
                aMessage.push("Schema property \"" + oSchemaDefinitionPropertyName + "\" is missing in " + (sPropertyName ? "property \"" + sPropertyName + "\" with " : "") + "definition \"" + JSON.stringify(oDefinitionNode) + "\"");
            }
        } else if (aDefinitionNodeProperty.length > 1) {

            aMessage.push("Duplicate schema property \"" + oSchemaDefinitionPropertyName + "\" found in " + (sPropertyName ? "property \"" + sPropertyName + "\" with " : "") + "definition \"" + JSON.stringify(oDefinitionNode) + "\"");
        }
    });
    return aMessage;
}

function _checkDuplicates(sPropertyName, oSchemaDefinition, oDefinitionNode) {
    var aMessage = [];
    _.each(oSchemaDefinition, function(oSchemaDefinitionProperty, oSchemaDefinitionPropertyName) {
        var aDefinitionNodeProperty = _.filter(oDefinitionNode, function(oDefinitionNodeProperty, oDefinitionNodePropertyName) {
            return oDefinitionNodePropertyName == oSchemaDefinitionPropertyName;
        });
        if (aDefinitionNodeProperty && aDefinitionNodeProperty.length > 1) {
            aMessage.push("Duplicate schema property \"" + oSchemaDefinitionPropertyName + "\" found in " + (sPropertyName ? "property \"" + sPropertyName + "\" with " : "") + "definition \"" + JSON.stringify(oDefinitionNode) + "\"");
        }
    });
    return aMessage;
}

function _checkNotAllowed(sPropertyName, oSchemaDefinition, oDefinitionNode) {
    var aMessage = [];
    _.each(oDefinitionNode, function(oDefinitionNodeProperty, oDefinitionNodePropertyName) {
        var oSchemaDefinitionProperty = _.find(oSchemaDefinition, function(oSchemaDefinitionProperty, oSchemaDefinitionPropertyName) {
            return oDefinitionNodePropertyName == oSchemaDefinitionPropertyName;
        });
        if (!oSchemaDefinitionProperty) {
            aMessage.push("Property \"" + oDefinitionNodePropertyName + "\" of " + (sPropertyName ? "property \"" + sPropertyName + "\" with " : "") + "definition \"" + JSON.stringify(oDefinitionNode) + "\" is not allowed according to schema");
        }
    });
    return aMessage;
}

function _checkForbidden(sPropertyName, oSchemaDefinition, oDefinitionNode) {
    var aMessage = [];
    _.each(oDefinitionNode, function(oDefinitionNodeProperty, oDefinitionNodePropertyName) {
        var oSchemaDefinitionProperty = _.find(oSchemaDefinition, function(oSchemaDefinitionProperty, oSchemaDefinitionPropertyName) {
            return oDefinitionNodePropertyName == oSchemaDefinitionPropertyName;
        });
        if (oSchemaDefinitionProperty) {
            aMessage.push("Property \"" + oDefinitionNodePropertyName + "\" of " + (sPropertyName ? "property \"" + sPropertyName + "\" with " : "") + "definition \"" + JSON.stringify(oDefinitionNode) + "\" is not allowed according to schema");
        }
    });
    return aMessage;
}

function _checkPropertyType(sPropertyName, oSchemaDefinition, oDefinitionNode) {
    var aMessage = [];
    _.each(oSchemaDefinition, function(oSchemaDefinitionProperty, oSchemaDefinitionPropertyName) {
        var aDefinitionNodeProperty = _.filter(oDefinitionNode, function(oDefinitionNodeProperty, oDefinitionNodePropertyName) {
            return oDefinitionNodePropertyName == oSchemaDefinitionPropertyName;
        });
        if (aDefinitionNodeProperty && aDefinitionNodeProperty.length > 0) {
            var oDefinitionNodeProperty = aDefinitionNodeProperty[0];
            if (!_.isPlainObject(oDefinitionNodeProperty) && !_.isArray(oDefinitionNodeProperty)) {
                var sSchemaType = oSchemaDefinitionProperty.type;
                var sSchemaSubType = oSchemaDefinitionProperty.subType ? oSchemaDefinitionProperty.subType : undefined;
                var aSchemaTypes = oSchemaDefinitionProperty.types;
                aMessage = _.union(aMessage, _checkType(oSchemaDefinitionPropertyName, oDefinitionNodeProperty, sSchemaType, sSchemaSubType, aSchemaTypes));
            }
        }
    });
    return aMessage;
}

function _checkType(sPropertyName, vDefinition, sType, sSubType, aTypes) {
    if (sType) {
        aTypes = [sType];
    }
    var bValid = vDefinition === undefined || !!_.find(aTypes, function(sType) {
        return function() {
            switch (sType) {
                case SchemaType.Map :
                    return _.isPlainObject;
                case SchemaType.Array :
                    return _.isArray;
                case SchemaType.Function :
                    return _.isFunction;
                case SchemaType.String :
                    return _.isString;
                case SchemaType.Boolean :
                    return _.isBoolean;
                case SchemaType.Number :
                    return _.isNumber;
                case SchemaType.None :
                    return (function(vDefinition) {
                        return _.isNull || (_.isBoolean(vDefinition) && vDefinition === false);
                    });
                default :
                    return function() {
                        return false;
                    };
            }
        }()(vDefinition);
    });
    var aMessage = [];
    if (sSubType && (_.isPlainObject(vDefinition) || _.isArray(vDefinition))) {
        aMessage = _.reduce(vDefinition, function(aMessage, vSubDefinition) {
            return _.union(aMessage, _checkType(sPropertyName, vSubDefinition, sSubType, undefined, undefined));
        }, aMessage);
        bValid = bValid && aMessage.length === 0;
    }
    if (!bValid) {
        var sErrorText = "Definition ";
        if (sPropertyName) {
            sErrorText = "Property \"" + sPropertyName + "\" with definition ";
        }
        sErrorText += "\"" + JSON.stringify(vDefinition) + "\" is not ";
        sErrorText += aTypes.join(", ");
        if (sSubType) {
            sErrorText += " of " + sSubType;
        }
        aMessage.push(sErrorText);
    }
    return aMessage;
}

function _isSchemaReference(sSchemaType, sSchemaSubType) {
    return _isReferenceType(sSchemaType) || _isReferenceType(sSchemaSubType);
}

function _resolveReferenceSchema(oSchemaDefinition, sSchemaType) {
    if (_isReferenceType(sSchemaType)) {
        return _getSchemaForType(oSchemaDefinition, sSchemaType);
    }
    return undefined;
}

function _getSchema(oSchemaDefinition, oSchemaContext) {
    var oSchema = _.copyDeep(oSchemaContext);
    if (oSchema.template) {
        var oSchemaTemplate = _getSchemaForType(oSchemaDefinition, oSchema.template);
        oSchema.definition = _.extend(oSchemaTemplate.definition, oSchema.definition);
    }
    _.each(oSchema.definition, function(oSchemaDefinitionProperty, oSchemaDefinitionPropertyName) {
        if (oSchemaDefinitionProperty.ignore) {
            delete oSchema.definition[oSchemaDefinitionPropertyName];
        }
    });
    delete oSchema.template;
    return oSchema;
}

function _getSchemaForType(oSchemaDefinition, sType) {
    return _getSchema(oSchemaDefinition, oSchemaDefinition[sType]);
}