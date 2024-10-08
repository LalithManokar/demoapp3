/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/models/aof/MetaModel",
    "sap/ino/commons/models/aof/ApplicationObject",
    "sap/ino/commons/models/aof/ApplicationObjectChange",
    "sap/ino/commons/application/Configuration",
    "sap/ui/model/BindingMode",
    "sap/ui/model/json/JSONListBinding",
    "sap/ui/model/odata/ODataModel",
    "sap/ui/model/resource/ResourceModel"
], function (JSONModel, MetaModel, ApplicationObject, ApplicationObjectChange, Configuration, BindingMode, JSONListBinding, ODataModel, ResourceModel) {
    "use strict";


    jQuery.sap.declare("sap.ino.commons.models.core.CodeModel");
    
    var ObjectType = ApplicationObject.ObjectType;

    /**
     * Per configuration object node there is property in the model containing all code values (and texts). The model
     * buffers the whole node to avoid separate requests.
     * 
     * Example structure: { sap.ino.xs.object.campaign.Phase.Root: [ { CODE: sap.ino.config.PRE_SCREENING, TEXT:
     * "Pre-Screening", LONG_TEXT: "ABC" } ] }
     */

    sap.ino.commons.models.core.CodeModel = new JSONModel({});

    var CodeModel = sap.ino.commons.models.core.CodeModel;

    CodeModel.sDefaultBindingMode = BindingMode.OneWay;
    CodeModel.mSupportedBindingModes = {
        "OneWay" : true,
        "OneTime" : true,
        "TwoWay" : false
    };

    // clean up code buffer, so that new / deleted entries are reflected
    ApplicationObjectChange.attachChange(undefined, function(oEvent) {
        var oMetadata = oEvent.getParameter("object").getApplicationObjectMetadata();
        if (oMetadata.type === ObjectType.Stage) {
            // remove "Stage" at the end
            var sConfigObjectName = oMetadata.name.substring(0, oMetadata.name.length - 5);
            CodeModel.refresh(sConfigObjectName);
        }
    });

    var VALUE_OPTION_LIST_PREFIX = "sap.ino.xs.object.basis.ValueOptionList.Root_";
    var VALUE_OPTION_CODE_TABLE = "sap.ino.xs.object.basis.ValueOptionList.ValueOptions";
    var VALUE_OPTION_LIST_TABLE = "sap.ino.xs.object.basis.ValueOptionList.Root";
    var DATATYPE_INTEGER = "INTEGER";
    var DATATYPE_NUMERIC = "NUMERIC";
    var DATATYPE_BOOLEAN = "BOOLEAN";
    var DATATYPE_TEXT = "TEXT";

    var _oODataModel = null;

    function _getODataModel() {
        if (_oODataModel === null) {
            _oODataModel = new ODataModel(Configuration.getFullApplicationPath("sap.ino.config.URL_PATH_OD_CONFIGURATION"), true);
        }

        return _oODataModel;
    }

    function _isValueOptionListTable(sConfigObjectNode) {
        return jQuery.sap.startsWith(sConfigObjectNode, VALUE_OPTION_LIST_PREFIX);
    }

    function _getValueOptionListCode(sConfigObjectNode) {
        var aParts = sConfigObjectNode.split(VALUE_OPTION_LIST_PREFIX, 2);
        if (aParts.length === 2) {
            return aParts[1];
        } else {
            return null;
        }
    }

    function _sortCodesByText(oA, oB) {
        if (oA.TEXT > oB.TEXT) {
            return 1;
        }
        if (oA.TEXT < oB.TEXT) {
            return -1;
        }
        return 0;
    }

	function _sortCodesByTextReverse(oA, oB){
		if (oA.TEXT > oB.TEXT) {
			return -1;
		}
		if (oA.TEXT < oB.TEXT) {
			return 1;
		}
		return 0;	    
	}    

    function _sortCodesByValueField(sValueField) {
        return function(oA, oB) {
            if(sValueField === "NUM_VALUE"){
                oA[sValueField] = parseFloat(oA[sValueField]);
                oB[sValueField] = parseFloat(oB[sValueField]);
            }
            if (oA[sValueField] > oB[sValueField]) {
                return 1;
            }
            if (oA[sValueField] < oB[sValueField]) {
                return -1;
            }
            return 0;
        };
    }
    function _sortCodesBySequenceNo(sValueField){
    return function(o1, o2) {
			if (o1[sValueField] < o2[sValueField]) {
				return -1;
			} else {
				return 1;
			}
		};      
    }    

    function _readCodeValues(sConfigObjectNode) {

        var oODataModel = _getODataModel();
        var sPath = sConfigObjectNode;

        // Value option list are a specific case as they are generic code lists with a shared persistency
        // To users of the code model we hide that fact and each value option list is a configuration object node with
        // the following naming convention: "sap.ino.xs.object.basis.ValueOptionList.Root_" + oValueOptionListCode
        if (_isValueOptionListTable(sConfigObjectNode)) {
            var sValueOptionListCode = _getValueOptionListCode(sConfigObjectNode);

            // We read all value options codes and filter by list code
            // Attention: _getCode might call _readCodeValues again, take care of endless loops!
            var aValues = _getCode(VALUE_OPTION_CODE_TABLE, function(oCode) {
                return oCode.LIST_CODE === sValueOptionListCode;
            });

            var oValueOptionList = _getCode(VALUE_OPTION_LIST_TABLE, sValueOptionListCode);

            // Sort options according to their value
            var sValueField = "";
            switch (oValueOptionList.DATATYPE_CODE) {
                case DATATYPE_INTEGER :
                case DATATYPE_NUMERIC :
                    sValueField = "NUM_VALUE";
                    break;
                case DATATYPE_BOOLEAN :
                    sValueField = "BOOL_VALUE";
                    break;
                case DATATYPE_TEXT :
                    sValueField = "NUM_VALUE";
                    break;
                default :
                    break;
            }
            //aValues.sort(_sortCodesByValueField(sValueField));
			 //aValues.sort(_sortCodesByTextReverse);
            aValues.sort(_sortCodesBySequenceNo("SEQUENCE_NO"));
            // based on the type of the value option, the code is set to
            // the defined value, so that dropdowns can work as expected
            var aResultValues = jQuery.map(aValues, function(oCode) {
                var oCodeCopy = jQuery.extend({}, oCode);

                switch (oValueOptionList.DATATYPE_CODE) {
                    case DATATYPE_INTEGER :
                        oCodeCopy.NUM_VALUE = parseInt(oCodeCopy.NUM_VALUE, 10);
                        oCodeCopy.CODE = oCodeCopy.NUM_VALUE;
                        break;
                    case DATATYPE_NUMERIC :
                        oCodeCopy.NUM_VALUE = parseFloat(oCodeCopy.NUM_VALUE);
                        oCodeCopy.CODE = oCodeCopy.NUM_VALUE;
                        break;
                    case DATATYPE_BOOLEAN :
                        // value options for Boolean does not make real sense
                        // but to be complete we consider this as well
                        oCodeCopy.CODE = oCodeCopy.BOOL_VALUE;
                        break;
                    case DATATYPE_TEXT :
                        oCodeCopy.CODE = oCodeCopy.TEXT_VALUE;
                        break;
                    default :
                        break;
                }
                return oCodeCopy;
            });
            return aResultValues;
        }

        var aCodes = [];

        // At the moment we do synchronous read (4th parameter = false) in order
        // to simplify the API. As code fetching is fast and happens only once per configuration object node
        // this seems OK from a responsive UI point of view
        oODataModel.read(sPath, null, null, false, function(oResponse) {
            if (oResponse && oResponse.results && oResponse.results.length > 0) {
                jQuery.each(oResponse.results, function(iIndex, oCode) {

                    // copy it, as we also delete data
                    oCode = jQuery.extend({}, oCode);
                    delete oCode.__metadata;

                    oCode.TEXT = _getBundleText(sConfigObjectNode, oCode.CODE);
                    // Set default text if no bundle text is available
                    if (oCode.DEFAULT_TEXT && (oCode.TEXT === null || !oCode.TEXT)) {
                        oCode.TEXT = oCode.DEFAULT_TEXT;
                    }
                    if(["sap.ino.xs.object.iam.IdentityLogSetting.Root"].indexOf(sConfigObjectNode) === -1){
                        oCode.LONG_TEXT = _getBundleLongText(sConfigObjectNode, oCode.CODE);
                    }
                    // Set default text if no bundle text is available
                    // If there is still nothing to display use short text
                    if (oCode.LONG_TEXT === null) {
                        if (oCode.DEFAULT_LONG_TEXT) {
                            oCode.LONG_TEXT = oCode.DEFAULT_LONG_TEXT;
                        } else {
                            oCode.LONG_TEXT = oCode.TEXT;
                        }
                    }

                    aCodes.push(oCode);
                });
            }
        });

        // Sort it alphabetically by text
        if(sPath !== "sap.ino.xs.object.basis.ValueOptionList.ValueOptions"){
            return aCodes.sort(_sortCodesByText);
        }
        else {
            return  aCodes.sort(_sortCodesBySequenceNo("SEQUENCE_NO"));
        }
    }

    /**
     * @param sConfigObjectNode
     * @param vCodeFilter
     *            Optional. If vCode is a string: only the code object for the code value is returned, if function: it
     *            is used as filter function for jQuery.grep to filter code values
     * @returns Array<Code> || <Code> 
     * Example: ({CODE: "sap.ino.config.A", TEXT: "ABC"})
     */
    function _getCode(sConfigObjectNode, vCodeFilter, mParameters) {
        var aCodes = CodeModel.getProperty("/" + sConfigObjectNode);
        var aParamCodes;
        if (mParameters) {
            aParamCodes = CodeModel.getProperty("/" + JSON.stringify(mParameters) + "/" + sConfigObjectNode);
        }
        if (aCodes === null || aCodes === undefined) {
            aCodes = _readCodeValues(sConfigObjectNode);
            CodeModel.setProperty("/" + sConfigObjectNode, aCodes);
        }

        if (mParameters && aParamCodes) {
            aCodes = aParamCodes;
        }

        // add codes based on parameters
        if (mParameters && !aParamCodes) {
            if (mParameters.includeEmptyCode === true) {
                var oEmptyCode = {
                    CODE : "",
                    TEXT : "",
                    LONG_TEXT : ""
                };
                aParamCodes = [oEmptyCode].concat(aCodes);
            } else {
                aParamCodes = aCodes;
            }

            aCodes = aParamCodes;
            var oCodeTable = CodeModel.getProperty("/" + JSON.stringify(mParameters)) || {};
            oCodeTable[sConfigObjectNode] = aParamCodes;
            CodeModel.setProperty("/" + JSON.stringify(mParameters), oCodeTable);
        }

        if (vCodeFilter === undefined || vCodeFilter === "") {
            return aCodes;
        }

        var fnFilter = vCodeFilter;
        if (!jQuery.isFunction(fnFilter)) {
            fnFilter = function(oCode) {
                return (oCode.CODE === vCodeFilter);
            };
        }

        if (fnFilter && jQuery.isFunction(fnFilter)) {
            var aFilteredCodes = jQuery.grep(aCodes, fnFilter);
            if (!jQuery.isFunction(vCodeFilter)) {
                return aFilteredCodes[0];
            } else {
                return aFilteredCodes;
            }
        }

        return aCodes;
    }

    function _getBundleText(sConfigObjectNode, sCode) {
        // We have to use "getProperty()". getResourceBundle.getText() does NOT consider the custom texts
        var sText;
		if(_getResourceModel(sConfigObjectNode)){
		    sText = _getResourceModel(sConfigObjectNode).getProperty(sCode);
		}
		
        if (sText === sCode) {
            return null;
        } else {
            return sText;
        }
    }

    function _getBundleLongText(sConfigObjectNode, sCode) {
        // We have to use "getProperty()". getResourceBundle.getText() does NOT consider the custom texts
        var sLongTextKey = sCode + "_LONG";
        var sText;
		if(_getResourceModel(sConfigObjectNode)){
		    sText = _getResourceModel(sConfigObjectNode).getProperty(sLongTextKey);
		}
        if (sText === sLongTextKey) {
            return null;
        } else {
            return sText;
        }
    }

    var _mResourceModels = {};
    function _getResourceModel(sConfigObjectNode) {
        // The "code Table" is referenced by AOF object name + node name
        // The textbundle is annoted as custom property "codeTextBundle"
        // at each node

        if (_mResourceModels[sConfigObjectNode]) {
            return _mResourceModels[sConfigObjectNode];
        }

        var aNameParts = sConfigObjectNode.split(".");
        var sNodeName = aNameParts.pop();
        var sObjectName = aNameParts.join(".");
        var oMetadata = MetaModel.getApplicationObjectMetadata(sObjectName);
        if (!oMetadata) {
            throw Error("Please provide valid fully qualified AOF object node reference");
        }

        var oModel;
		if (oMetadata.nodes[sNodeName].customProperties && oMetadata.nodes[sNodeName].customProperties.codeTextBundle) {
			oModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl: _getResourceName(oMetadata.nodes[sNodeName].customProperties.codeTextBundle)
			});
		}

        _mResourceModels[sConfigObjectNode] = oModel;
        return oModel;
    }

    function _getResourceName(sResourceName) {
        if (sResourceName.indexOf("::") > -1) {
            var aParts = arguments[0].split("::");
            sResourceName = aParts[1];
        }
        return Configuration.getResourceBundleURL(sResourceName);
    }

    function _getTextFormatter(fnTextAccess, sConfigObjectNode) {
        if (sConfigObjectNode) {
            return function(sCode) {
                return fnTextAccess(sConfigObjectNode, sCode);
            };
        } else {
            return function(sConfigObjectNode, sCode) {
                return fnTextAccess(sConfigObjectNode, sCode);
            };
        }
    }

    function _getTextInternal(sConfigObjectNode, sCode, sTextProperty) {
        if (sCode === null || sCode === undefined) {
            return "";
        }

        var oCode = _getCode(sConfigObjectNode, sCode);
        if (!oCode) {
            return sCode;
        }

        return oCode[sTextProperty];
    }

    // we override bindList in order to implement lazy loading of codes
    // when the code model is bound
    CodeModel.bindList = function(sPath, oContext, aSorters, aFilters, mParameters) {

        // iStartIndex and iLength are ignored as code lists are always fetched completely
        // If binding context is given no loading is necessary as code lists are loaded completely
        // If sPath is root path we do not load all codes

        // get rid of the leading / in the path
        var sCodeTableName = sPath.substring(1, sPath.length);

        if (!oContext && sPath != "/") {
            // this method load the codes lazy
            CodeModel.getCodes(sCodeTableName, undefined, mParameters);
        }

        if (mParameters) {
            sPath = "/" + JSON.stringify(mParameters) + "/" + sCodeTableName;
        }

        var oBinding = new JSONListBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
        return oBinding;
    };

    /**
     * @param sConfigObjectNode
     *            Name of configuration object node
     * @param fnFilterFunction
     *            optional function to filter results (@see jQuery.grep)
     * @return an array of code value and text tuples [{CODE: "SAP_DISCONTINUED", TEXT:"Rejected"}]
     */
    CodeModel.getCodes = function(sConfigObjectNode, fnFilterFunction, mParameters) {
        return _getCode(sConfigObjectNode, fnFilterFunction, mParameters);
    };

    /**
     * @param sConfigObjectNode
     *            Name of configuration object node
     * @param sCode
     *            code in the node
     * @return short text of code
     */

    CodeModel.getText = function(sConfigObjectNode, sCode) {
        return _getTextInternal(sConfigObjectNode, sCode, "TEXT");
    };

    /**
     * @param sConfigObjectNode
     *            Name of configuration object node
     * @param sCode
     *            code in the node
     * @return long, descriptive text of code
     */
    CodeModel.getLongText = function(sConfigObjectNode, sCode) {
        return _getTextInternal(sConfigObjectNode, sCode, "LONG_TEXT");
    };

    /**
     * @param sConfigObjectNode
     *            Name of configuration object node
     * @return formatter function to be used as formatter in SAPUI5, which formats codes to its short text
     */
    CodeModel.getFormatter = function(sConfigObjectNode) {
        return _getTextFormatter(CodeModel.getText, sConfigObjectNode);
    };

    /**
     * @param sConfigObjectNode
     *            Name of configuration object node
     * @return formatter function to be used as formatter in SAPUI5, which formats codes to its long text
     */
    CodeModel.getLongTextFormatter = function(sConfigObjectNode) {
        return _getTextFormatter(CodeModel.getLongText, sConfigObjectNode);
    };
    
    /**
     * @param sValueOptionListCode
     *            Code of the Value option List
     * @return configuration object node to use for getting the formatter functions
     */
    CodeModel.getConfigObjectNodeForValueOptionList = function(sValueOptionListCode){
        return VALUE_OPTION_LIST_PREFIX + sValueOptionListCode;
    };

    CodeModel.refresh = function(sObjectName) {
        if (!sObjectName) {
            CodeModel.setData({});
            return;
        }
        var aPathsToInitialize = [];
        jQuery.each(CodeModel.getData(), function(sProperty, vValue) {
            if (sProperty.lastIndexOf(sObjectName) != -1) {
                aPathsToInitialize.push("/" + sProperty);
                return;
            }

            // Check also the parameterized part of the code model
            if (jQuery.isPlainObject(vValue)) {
                jQuery.each(vValue, function(sChildProperty) {
                    if (sChildProperty.lastIndexOf(sObjectName) != -1) {
                        aPathsToInitialize.push("/" + sProperty + "/" + sChildProperty);
                    }
                });
            }
        });

        jQuery.each(aPathsToInitialize, function(iIndex, sPath) {
            CodeModel.setProperty(sPath, null);
        });
    };
    
    return sap.ino.commons.models.core.CodeModel;
});