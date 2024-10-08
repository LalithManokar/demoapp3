/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObject",
    "sap/ino/commons/application/Configuration",
    "sap/ui/core/message/Message",
    "sap/ui/core/MessageType",
    "sap/ui/model/ParseException",
    "sap/ino/commons/models/core/ReadSource"
], function(ApplicationObject,
	Configuration,
	Message,
	MessageType,
	ParseException,
	ReadSource) {
	"use strict";

	var EvaluationRequestItem = ApplicationObject.extend("sap.ino.commons.models.object.EvaluationRequestItem", {
		objectName: "sap.ino.xs.object.evaluation.EvaluationRequestItem",
		readSource: ReadSource.getDefaultODataSource("EvaluationRequestItem", {}),
		invalidation: {
			entitySets: []
		},
		actions: {
			executeStatusTransition: {

			}
		},
		determinations: {
			onRead: _read
		}
	});

	function filterFirstData(aData) {
		var result = {
			"Data": aData[0],
			"Index": 0
		};
		jQuery.each(aData, function(index, data) {
			if (result.Data.CREATED_AT > data.CREATED_AT) {
				result.Data = data;
				result.Index = index;
			}
		});
		return result;
	}

	function _getKey(data) {
		return "ITEM_ID_" + data.EVAL_REQ_ITEM_ID + "_CREATED_BY_ID_" + (data.CREATED_BY_ID ^ data.TO_IDENTITY);
	}

	function convertClarifications(oEvalRequest) {
		var result = [];
		if (!oEvalRequest || oEvalRequest.length === 0) {
			return result;
		}
		var oGroup = {};
		jQuery.each(oEvalRequest, function(index, data) {
			var sKey = _getKey(data);
			if (!oGroup.hasOwnProperty(sKey)) {
				oGroup[sKey] = [];
			}
			oGroup[sKey].push(data);
		});
		jQuery.each(oGroup, function(index, data) {
			var oFirstData = filterFirstData(data);
			data.splice(oFirstData.Index, 1);
			result.push({
				"CLARIFICATION_ENABLED": oFirstData.Data.CLARIFICATION_ENABLED,
			    "CREATED_BY_ID":oFirstData.Data.CREATED_BY_ID,
				"EVAL_REQ_ITEM_ID": oFirstData.Data.EVAL_REQ_ITEM_ID,
				"CREATED_BY_NAME": oFirstData.Data.CREATED_BY_NAME,
				"CREATED_BY_IMAGE_ID": oFirstData.Data.CREATED_BY_IMAGE_ID,
				"CONTENT": oFirstData.Data.CONTENT,
				"CREATED_AT": oFirstData.Data.CREATED_AT,
				"Communications": data
			});
		});
		return result;
	}

	function _read(oData) {
		var oEvalRequest = oData;
		if (oEvalRequest.Clarifications) {
			oEvalRequest.ExpertsClarifications = convertClarifications(oEvalRequest.Clarifications);
			oEvalRequest.InitRefObjectId = oEvalRequest.EVAL_REQ_ID;
		}
		return oEvalRequest;
	}
	return EvaluationRequestItem;
});