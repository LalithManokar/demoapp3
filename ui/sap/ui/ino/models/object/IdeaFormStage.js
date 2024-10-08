/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.object.IdeaFormStage");

(function() {
	"use strict";

	jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
	jQuery.sap.require("sap.ui.ino.models.core.ReadSource");

	sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.IdeaFormStage", {
		objectName: "sap.ino.xs.object.ideaform.IdeaFormStage",

		readSource: sap.ui.ino.models.core.ReadSource.getDefaultODataSource("StagingIdeaForm", {}),

		invalidation: {
			entitySets: ["StagingIdeaForm", "StagingIdeaFormSearch"]
		},

		determinations: {
			onCreate: function(oDefaultData, objectInstance) {
				return {
					"ID": -1,
					"PLAIN_CODE": "",
					"DEFAULT_TEXT": "",
					"DEFAULT_LONG_TEXT": ""
				};
			},

			onRead: function(oDefaultData, objectInstance) {
			    var oIdeaForm = oDefaultData;
			    
			    oIdeaForm.Fields = sortObjectArray(oIdeaForm.Fields, "SEQUENCE_NO");
			    normalizeSequenceNo(oIdeaForm.Fields);
			    
			    return oIdeaForm;
			}
		},

		addField: addField,
		moveFieldUp: moveFieldUp,
		moveFieldDown: moveFieldDown,
		removeField: removeField,
		getPreviewModel: getPreviewModel,
		setProperty : setProperty
	});
})();

function addField() {
	var oData, iHandle

	var oField = {
		"PLAIN_CODE": "",
		"DATATYPE_CODE": "",
		"SEQUENCE_NO": 1,
		"DEFAULT_TEXT": "",
		"DEFAULT_LONG_TEXT": "",
		"VALUE_OPTION_LIST_CODE": "",
		"MANDATORY": 0,
		"IS_ACTIVE": 1,
		"IS_DISPLAY_ONLY": 0,
		"UOM_CODE": "",
		"NUM_VALUE_MIN": null,
		"NUM_VALUE_MAX": null,
		"NUM_VALUE_STEP_SIZE": null
	};

	//determine the correct sequence number
	oData = this.getData();

	oField.SEQUENCE_NO = getNextSequenceNo(oField, oData.Fields);

	iHandle = this.addChild(oField, "Fields");

	//sort and get Object again
	oData = this.getData();
	normalizeSequenceNo(oData.Fields);
	
	oData.Fields = sortObjectArray(oData.Fields, "SEQUENCE_NO");
	
	//normalize sequence number

	
	this.setData(oData);

	return iHandle;
}

function moveFieldUp(oField) {
	var oData = this.getData();
	var oPreviousField = getPreviousField(oField, oData.Fields);

	if (oPreviousField) {
		var iPreviousFieldSequenceNo = oPreviousField.SEQUENCE_NO;
		oPreviousField.SEQUENCE_NO = oField.SEQUENCE_NO;
		oField.SEQUENCE_NO = iPreviousFieldSequenceNo;

		this.updateNode(oField, "Fields");
		this.updateNode(oPreviousField, "Fields");

		//sort and get data Again 
		oData = this.getData();
		oData.Fields = sortObjectArray(oData.Fields, "SEQUENCE_NO");
		this.setData(oData);
	}
}

function moveFieldDown(oField) {
	var oData = this.getData();
	var oNextField = getNextField(oField, oData.Fields);

	if (oNextField) {
		var iNextFieldSequenceNo = oNextField.SEQUENCE_NO;
		oNextField.SEQUENCE_NO = oField.SEQUENCE_NO;
		oField.SEQUENCE_NO = iNextFieldSequenceNo;

		this.updateNode(oField, "Fields");
		this.updateNode(oNextField, "Fields");

		//sort and get data Again 
		oData = this.getData();
		oData.Fields = sortObjectArray(oData.Fields, "SEQUENCE_NO");
		this.setData(oData);
	}

}

function removeField(oField) {
	this.removeChild(oField);
}

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

function getNextField(oField, aFields) {
	for (var i = 0; i < aFields.length; i++) {
		if (oField.SEQUENCE_NO === aFields[i].SEQUENCE_NO) {
			return aFields[i + 1];
		}
	}
}

function getPreviousField(oField, aFields) {
	for (var i = 0; i < aFields.length; i++) {
		if (oField.SEQUENCE_NO === aFields[i].SEQUENCE_NO) {
			return aFields[i - 1];
		}
	}
}

function getNextSequenceNo(oField, aFields) {
	return aFields.length;
}

function getPreviewModel() {
	if (!this.oPreviewModel) {
		this.oPreviewModel = new sap.ui.model.json.JSONModel();
	}

	var oData = jQuery.extend(true, {}, this.getData());

	oData["IDEA_ID"] = 0;
	oData["STATUS_CODE"] = "";
	oData["IDEA_PHASE_CODE"] = "";

	this.oPreviewModel.setData(oData);

	return this.oPreviewModel;
}

function normalizeSequenceNo(aFields){
    if(aFields){
        for(var i = 0; i < aFields.length ; i++){
            aFields[i].SEQUENCE_NO = i + 1;
        }
    }
}

function setProperty(sPath, oValue, oContext) {
	// allow null values for min and may
	var bSuccess = false;
	if (sPath === "NUM_VALUE_MIN" || sPath === "NUM_VALUE_MAX") {
		if (oValue === "") {
			oValue = null;
			arguments[1] = null;
		} else {
			var sDataType = oContext.getProperty("DATATYPE_CODE");
			var nValue = 0;
			if (sDataType == 'INTEGER') {
				nValue = parseFloat(oValue);
				nValue = Math.round(nValue);
				nValue = parseInt(nValue);
			} else {
				nValue = parseFloat(oValue);
			}
			arguments[1] = nValue;
		}
	}
	bSuccess = sap.ui.ino.models.core.ApplicationObject.prototype.setProperty.apply(this, arguments);
	return bSuccess;
}
