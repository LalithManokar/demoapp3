/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ino/commons/models/aof/ApplicationObject",
    "sap/ui/core/message/Message",
    "sap/ui/core/MessageType",
    "sap/ino/commons/models/core/ReadSource",
    "sap/ino/commons/util/DateUtil"
], function(ApplicationObject,
	Message,
	MessageType,
	ReadSource,
	DateUtil) {
	"use strict";

	var EvaluationRequest = ApplicationObject.extend("sap.ino.commons.models.object.EvaluationRequest", {
		objectName: "sap.ino.xs.object.evaluation.EvaluationRequest",
		readSource: ReadSource.getDefaultODataSource("EvaluationRequest", {}),
		invalidation: {
			//entitySets: ["EvaluationRequest"]
		},
		determinations: {
			onCreate: _determineCreate,
			onRead: _read
		},
		actionImpacts: {
			"create": [{
				"objectName": "sap.ino.commons.models.object.Idea",
				"objectKey": "IDEA_ID",
				"impactedAttributes": ["EvaluationRequests", "IDEA_HAS_INCOMPLETED_EVAL_REQ"]
			}],
			"del": [{
				"objectName": "sap.ino.commons.models.object.Idea",
				"objectKey": "IDEA_ID",
				"impactedAttributes": ["EvaluationRequests", "IDEA_HAS_INCOMPLETED_EVAL_REQ"]
			}]
		},
		addExpert: addExpert,
		removeExpert: removeExpert,
		onNormalizeData: function(oReqEval) {
			oReqEval.ACCEPT_DATE = DateUtil.convertToUtcString(oReqEval.ACCEPT_DATE);
			oReqEval.COMPLETE_DATE = DateUtil.convertToUtcString(oReqEval.COMPLETE_DATE);
			return oReqEval;
		}
	});

	function _determineCreate() {
		var dAcceptDate = new Date();
		dAcceptDate.setDate(dAcceptDate.getDate() + 1);
		var dCompleteDate = new Date();
		dCompleteDate.setDate(dCompleteDate.getDate() + 7);
		return {
			//"ACCEPT_DATE": dAcceptDate,
			//"COMPLETE_DATE": dCompleteDate,
			"STATUS": "sap.ino.config.EVAL_REQ_DEFAULT"
		};
	}

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
		return ["ITEM_ID_" + data.EVAL_REQ_ITEM_ID + "_CREATED_BY_ID_" + data.CREATED_BY_ID + "_TO_IDENTITY_" + data.TO_IDENTITY, "ITEM_ID_" +
			data.EVAL_REQ_ITEM_ID + "_CREATED_BY_ID_" + data.TO_IDENTITY + "_TO_IDENTITY_" + data.CREATED_BY_ID];
	}

	function convertClarifications(oEvalRequest) {
		var result = [];
		if (!oEvalRequest || oEvalRequest.length === 0) {
			return result;
		}
		var oGroup = {};
		jQuery.each(oEvalRequest, function(index, data) {
			var aKey = _getKey(data);
			if (oGroup.hasOwnProperty(aKey[0])) {
				oGroup[aKey[0]].push(data);
			} else if (oGroup.hasOwnProperty(aKey[1])) {
				oGroup[aKey[1]].push(data);
			} else {
				oGroup[aKey[0]] = [];
				oGroup[aKey[0]].push(data);
			}
		});
		jQuery.each(oGroup, function(index, data) {
			var oFirstData = filterFirstData(data);
			data.splice(oFirstData.Index, 1);
			result.push({
				"CLARIFICATION_ENABLED": oFirstData.Data.CLARIFICATION_ENABLED,
				"CREATED_BY_ID": oFirstData.Data.CREATED_BY_ID,
				"EVAL_REQ_ITEM_ID": oFirstData.Data.EVAL_REQ_ITEM_ID,
				"TO_IDENTITY": oFirstData.Data.TO_IDENTITY,
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
		if (!(oEvalRequest.ACCEPT_DATE instanceof Date)) {
			oEvalRequest.ACCEPT_DATE = new Date(oData.ACCEPT_DATE);
		} else {
			oEvalRequest.ACCEPT_DATE = DateUtil.convertToLocalDate(oData.ACCEPT_DATE);
		}
		if (!(oEvalRequest.COMPLETE_DATE instanceof Date)) {
			oEvalRequest.COMPLETE_DATE = new Date(oData.COMPLETE_DATE);
		} else {
			oEvalRequest.COMPLETE_DATE = DateUtil.convertToLocalDate(oData.COMPLETE_DATE);
		}
		if (oEvalRequest.Clarifications) {
			oEvalRequest.ExpertsClarifications = convertClarifications(oEvalRequest.Clarifications);
		}
		return oEvalRequest;
	}

	function addExpert(oNewExpert) {
		/* jshint validthis: true */
		var oMessage;

		if (!oNewExpert.NAME || jQuery.trim(oNewExpert.NAME).length === 0) {
			oMessage = new Message({
				key: "MSG_IDEA_INVALID_EMPTY_EXPERT",
				type: MessageType.Error,
				group: "EXPERT"
			});
			return oMessage;
		}

		if (!oNewExpert.IDENTITY_ID) {
			oMessage = new Message({
				key: "MSG_IDEA_INVALID_EXPERT",
				type: MessageType.Error,
				group: "EXPERT"
			});
			return oMessage;
		}

		var aExperts = this.getProperty("/Experts");
		var aMatches = jQuery.grep(aExperts, function(oExpert) {
			return oExpert.IDENTITY_ID === oNewExpert.IDENTITY_ID;
		});
		if (aMatches.length === 0) {
			this.addChild(oNewExpert, "Experts");
		}
	}

	function removeExpert(iExpertId) {
		/* jshint validthis: true */
		var aExperts = this.getProperty("/Experts");
		var aMatches = jQuery.grep(aExperts, function(oExpert) {
			return oExpert.IDENTITY_ID === iExpertId;
		});
		var oRemoveExpert = aMatches[0];
		if (oRemoveExpert) {
			this.removeChild(oRemoveExpert, "Experts");
		}
	}

	return EvaluationRequest;
});