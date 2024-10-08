/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.object.ValueOptionListStage");

(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");

    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.ValueOptionListStage", {
        objectName : "sap.ino.xs.object.basis.ValueOptionListStage",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultODataSource("StagingValueOptionList"),
        invalidation : {
            entitySets : ["StagingValueOptionList", "StagingValueOptionListSearch"]
        },
        determinations : {
            onCreate : function(oDefaultData, objectInstance) {
                return {
                    "ID" : -1,
                    "PLAIN_CODE" : "",
                    "DATATYPE_CODE" : "TEXT",
                    "DEFAULT_TEXT" : "",
                    "DEFAULT_LONG_TEXT" : ""
                };
            },
            onRead : function(oDefaultData, objectInstance) {
                var sDataTypeCode = oDefaultData.DATATYPE_CODE;
                
                 oDefaultData.ValueOptions = sortObjectArray(oDefaultData.ValueOptions, "SEQUENCE_NO");
                var aValueOption = oDefaultData.ValueOptions;
                if(aValueOption){
                    for (var i = 0; i < aValueOption.length; i++) {
                        var oValueOption = aValueOption[i];
                        switch (sDataTypeCode) {
                            case "INTEGER" :
                                oValueOption.VALUE = oValueOption.NUM_VALUE;
                                break;
                            case "NUMERIC" :
                                oValueOption.VALUE = oValueOption.NUM_VALUE;
                                break;
                            case "TEXT" :
                                oValueOption.VALUE = oValueOption.TEXT_VALUE;
                                break;
                            case "BOOLEAN" :
                                oValueOption.VALUE = oValueOption.BOOL_VALUE;
                                break;
                            default:
                                break;
                        }
                    }
                }
                return oDefaultData;
            },
            onNormalizeData : function(oData) {
                var sDataTypeCode = oData.DATATYPE_CODE;
                var aValueOption = oData.ValueOptions;
                if(aValueOption){
                    for (var i = 0; i < aValueOption.length; i++) {
                        var oValueOption = aValueOption[i];
                        switch (sDataTypeCode) {
                            case "INTEGER" :
                                var iValue = parseInt(oValueOption.VALUE, 10) || 0;
                                oValueOption.NUM_VALUE = iValue;
                                break;
                            case "NUMERIC" :
                                var fValue = parseFloat(oValueOption.VALUE) || 0.0;
                                oValueOption.NUM_VALUE = fValue;
                                break;
                            case "TEXT" :
                                oValueOption.TEXT_VALUE = oValueOption.VALUE;
                                break;
                            case "BOOLEAN" :
                                var bBool = 0;
                                if (oValueOption.VALUE && 
                                    oValueOption.VALUE.toString().toLowerCase().trim() != "false" && 
                                    oValueOption.VALUE.toString().toLowerCase().trim() != "0") {
                                    bBool = 1;
                                }
                                oValueOption.BOOL_VALUE = bBool;
                                break;
                            default:
                                break;
                        }
                    }
                }
                return oData;
            }
        },
        setProperty : setProperty,
        addValueOption : addValueOption,
        moveUpValueOption: moveUpValueOption,
        moveDownValueOption: moveDownValueOption,        
        removeValueOption : removeValueOption,
        normalizeSequenceNo: normalizeSequenceNo,
        sortValueOptionByName:sortValueOptionByName        
    });

    function setProperty(sPath, oValue, oContext) {
        var bSuccess = false;
        bSuccess = sap.ui.ino.models.core.ApplicationObject.prototype.setProperty.apply(this, arguments);
        if (arguments && arguments.length >= 3) {
            if (sPath === "/DATATYPE_CODE" && oContext === undefined) {
                var aValueOption = this.getProperty("/ValueOptions/");
                if (aValueOption) {
	                for (var i = 0; i < aValueOption.length; i++) {
	                    var oValueOption = aValueOption[i];
	                    oValueOption.NUM_VALUE = null;
	                    oValueOption.TEXT_VALUE = null;
	                    oValueOption.BOOL_VALUE = null;
	                    switch (this.oData.DATATYPE_CODE) {
	                        case "INTEGER" :
	                            var iInt = parseInt(oValueOption.VALUE, 10) || 0;
	                            oValueOption.NUM_VALUE = iInt;
	                            oValueOption.VALUE = iInt;
	                            break;
	                        case "NUMERIC" :
	                            var fNumeric = parseFloat(oValueOption.VALUE) || 0.0;
	                            oValueOption.NUM_VALUE = fNumeric;
	                            oValueOption.VALUE = fNumeric;
	                            break;
	                        case "TEXT" :
	                            oValueOption.TEXT_VALUE = oValueOption.VALUE.toString();
	                            oValueOption.VALUE = oValueOption.VALUE.toString();
	                            break;
	                        case "BOOLEAN" :
	                            var bBool = 0;
	                            if (oValueOption.VALUE && 
	                                oValueOption.VALUE.toString().toLowerCase().trim() != "false" && 
	                                oValueOption.VALUE.toString().toLowerCase().trim() != "0") {
	                                bBool = 1;
	                            }
	                            oValueOption.BOOL_VALUE = bBool;
	                            oValueOption.VALUE = bBool;
	                            break;
	                         default:
	                            break;   
	                    }
	                }
                }
                bSuccess = this.setProperty("/ValueOptions", aValueOption);
            }
        }
        return bSuccess;
    }

    function addValueOption() {
           var oData = this.getData();        
           normalizeSequenceNo(oData.ValueOptions);
           var oValueOption = {
            "PLAIN_CODE" : "",
            "VALUE" : "",
            "TEXT_VALUE" : "",
            "NUM_VALUE" : null,
            "BOOL_VALUE" : null,
            "DEFAULT_TEXT" : "",
            "DEFAULT_LONG_TEXT" : "",
            "ACTIVE": 1
        };

	oValueOption.SEQUENCE_NO = getNextSequenceNo(oValueOption, oData.ValueOptions);        
        
        this.addChild(oValueOption, "ValueOptions");
        normalizeSequenceNo(oData.ValueOptions);
        oData.ValueOptions = sortObjectArray(oData.ValueOptions, "SEQUENCE_NO");
        this.setData(oData);
    }
    
    function removeValueOption(oValueOption) {
        this.removeChild(oValueOption);
    }
})();

function sortObjectArray(aFields, skey) {
	aFields.sort(function(o1, o2) {
		if (o1[skey] < o2[skey]) {
			return -1;
		} else {
			return 1;
		}
	});

	return aFields;
}

function normalizeSequenceNo(aFields){
    if(aFields){
        for(var i = 0; i < aFields.length ; i++){
            aFields[i].SEQUENCE_NO = i + 1;
        }
    }
}

function getNextSequenceNo(oField, aFields) {
	return aFields.length;
}

function getPreviousField(oField, aFields) {
	for (var i = 0; i < aFields.length; i++) {
		if (oField.SEQUENCE_NO === aFields[i].SEQUENCE_NO) {
			return aFields[i - 1];
		}
	}
}

function getNextField(oField, aFields) {
	for (var i = 0; i < aFields.length; i++) {
		if (oField.SEQUENCE_NO === aFields[i].SEQUENCE_NO) {
			return aFields[i + 1];
		}
	}
}

function moveUpValueOption(oValueOption){
	var oData = this.getData();
	var oPreviousObject = getPreviousField(oValueOption, oData.ValueOptions);  
	   if(oPreviousObject){
		var iPreviousFieldSequenceNo = oPreviousObject.SEQUENCE_NO;
		oPreviousObject.SEQUENCE_NO = oValueOption.SEQUENCE_NO;
		oValueOption.SEQUENCE_NO = iPreviousFieldSequenceNo;    
		this.updateNode(oValueOption, "ValueOptions");
		this.updateNode(oPreviousObject, "ValueOptions");
		oData = this.getData();
		oData.ValueOptions = sortObjectArray(oData.ValueOptions, "SEQUENCE_NO");
		this.setData(oData);
	   }
}
function moveDownValueOption(oValueOption){
 	var oData = this.getData();
	var oNextObject = getNextField(oValueOption, oData.ValueOptions);

	if (oNextObject) {
		var iNextFieldSequenceNo = oNextObject.SEQUENCE_NO;
		oNextObject.SEQUENCE_NO = oValueOption.SEQUENCE_NO;
		oValueOption.SEQUENCE_NO = iNextFieldSequenceNo;

		this.updateNode(oValueOption, "ValueOptions");
		this.updateNode(oNextObject, "ValueOptions");

		//sort and get data Again 
		oData = this.getData();
		oData.ValueOptions = sortObjectArray(oData.ValueOptions, "SEQUENCE_NO");
		this.setData(oData);
	}   
}
	function sortObjectArrayByName(aObjects, sSortKeyName,sortType) {
		if(sortType === "ASC"){
		  aObjects.sort(function(o1, o2) {
			if (o1[sSortKeyName] < o2[sSortKeyName]) {
				return -1;
			} else {
				return 1;
			}
		});
		} else {
		  aObjects.sort(function(o1, o2) {
			if (o1[sSortKeyName] > o2[sSortKeyName]) {
				return -1;
			} else {
				return 1;
			}
		});		    
		}
		return aObjects;
	}
	function sortValueOptionByName(sortType){
	    var oData = this.getData();
		var aValueOptions = oData.ValueOptions;
		if(aValueOptions.length <= 0){
		    return;
		}
		oData.aValueOptions = sortObjectArrayByName(aValueOptions, "DEFAULT_TEXT",sortType);
        normalizeSequenceNo(oData.aValueOptions);		
		this.setData(oData);
	}



