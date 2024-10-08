/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.object.StatusModelStage");

(function() {
	"use strict";
	jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
	jQuery.sap.require("sap.ui.ino.models.core.ReadSource");

	sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.StatusModelStage", {
		objectName: "sap.ino.xs.object.status.ModelStage",
		readSource: sap.ui.ino.models.core.ReadSource.getDefaultODataSource("StagingStatusModelCode"),
		invalidation: {
			entitySets: ["StagingStatusModelCode", "SearchStagingStatusModel"]
		},
		determinations: {
			onRead: _setShowReason,
			onNormalizeData: _normalizeData
		},
		addTransition: addTransition,
		removeTransition: removeTransition,
		moveUpTransition: moveUpTransition,
		moveDownTransition: moveDownTransition
	});

	function _setShowReason(oData, objectInstance) {
		if (oData.Transitions === undefined) {
			oData.SHOW_REASON = 0;
			return oData;
		} else if (oData.Transitions.length < 1) {
			oData.SHOW_REASON = 0;
		} else {
			oData.SHOW_REASON = oData.Transitions[0].DECISION_REASON_LIST_VISIBLE;
		}
		/*        Sort the data and mark the sequence for the history data    */
		if (oData.Transitions.length > 1) {
			oData.Transitions = sortObjectArray(oData.Transitions, "SEQUENCE_NO");
		}

		return oData;
	}

	function _normalizeData(oData) {
		var showReason = oData.SHOW_REASON;
		if (oData.Transitions) {
			for (var i = 0; i < oData.Transitions.length; i++) {
				oData.Transitions[i].DECISION_REASON_LIST_VISIBLE = showReason;
			}
			return oData;
		}
	}
})();

function addTransition() {
	var oData, iHandle;
	var oTransition = {
		"PLAIN_CODE": "",
		"CURRENT_STATUS_CODE": "",
		"NEXT_STATUS_CODE": "",
		"STATUS_ACTION_CODE": "",
		"DEFAULT_TEXT": "",
		"DEFAULT_LONG_TEXT": "",
		"DECISION_RELEVANT": "",
		"DECISION_REASON_LIST_CODE": "",
		"TEXT_MODULE_CODE": "",
		"DECISION_REASON_LIST_VISIBLE": 0,
		"CURRENT_STATUS_TYPE": "",
		"NEXT_STATUS_TYPE": "",
		"SEQUENCE_NO":1
	};

	//determine the correct sequence number
	oData = this.getData();

	oTransition.SEQUENCE_NO = getNextSequenceNo(oTransition, oData.Transitions);

	iHandle = this.addChild(oTransition, "Transitions");

	//sort and get Object again
	oData = this.getData();
	normalizeSequenceNo(oData.Transitions);
	oData.Transitions = sortObjectArray(oData.Transitions, "SEQUENCE_NO");
	this.setData(oData);

	return iHandle;
}

function removeTransition(oTransition) {
	this.removeChild(oTransition);
}

function moveUpTransition(oTransition) {
	var oData = this.getData();
	var oPreviousField = getPreviousField(oTransition, oData.Transitions);

	if (oPreviousField) {
		var iPreviousFieldSequenceNo = oPreviousField.SEQUENCE_NO;
		oPreviousField.SEQUENCE_NO = oTransition.SEQUENCE_NO;
		oTransition.SEQUENCE_NO = iPreviousFieldSequenceNo;

		this.updateNode(oTransition, "Transitions");
		this.updateNode(oPreviousField, "Transitions");

		//sort and get data Again 
		oData = this.getData();
		oData.Transitions = sortObjectArray(oData.Transitions, "SEQUENCE_NO");
		this.setData(oData);
	}
}

function moveDownTransition(oTransition) {
	var oData = this.getData();
	var oNextField = getNextField(oTransition, oData.Transitions);

	if (oNextField) {
		var iNextFieldSequenceNo = oNextField.SEQUENCE_NO;
		oNextField.SEQUENCE_NO = oTransition.SEQUENCE_NO;
		oTransition.SEQUENCE_NO = iNextFieldSequenceNo;

		this.updateNode(oTransition, "Transitions");
		this.updateNode(oNextField, "Transitions");

		//sort and get data Again 
		oData = this.getData();
		oData.Transitions = sortObjectArray(oData.Transitions, "SEQUENCE_NO");
		this.setData(oData);
	}
}

function sortObjectArray(aTransitions, skey) {
	if (!aTransitions[0].SEQUENCE_NO) {
	    normalizeSequenceNo(aTransitions);
	}
	aTransitions.sort(function(o1, o2) {
		if (o1[skey] < o2[skey]) {
			return -1;
		} else {
			return 1;
		}
	});

	return aTransitions;
}
function getNextSequenceNo(oTransition, aTransitions) {
	return aTransitions.length;
}
function normalizeSequenceNo(aTransitions){
    if(aTransitions){
        for(var i = 0; i < aTransitions.length ; i++){
            aTransitions[i].SEQUENCE_NO = i + 1;
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
function getNextField(oField, aFields) {
	for (var i = 0; i < aFields.length; i++) {
		if (oField.SEQUENCE_NO === aFields[i].SEQUENCE_NO) {
			return aFields[i + 1];
		}
	}
}