const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");

function _toFloat(sNumber) {
	var iNumber = parseFloat(sNumber);
	if (isNaN(iNumber)) {
		iNumber = 0;
	}
	return iNumber;
}

function _getValue(sDataType, nNumValue, bBoolValue, sTextValue) {
	var vValue = null;
	switch (sDataType) {
		case "INTEGER":
			vValue = Math.round(nNumValue);
			break;
		case "NUMERIC":
			vValue = nNumValue;
			break;
		case "BOOLEAN":
			vValue = bBoolValue === 1;
			break;
		case "TEXT":
			vValue = sTextValue;
			break;
		default:
			break;
	}
	switch (sDataType) {
		case "INTEGER":
		case "NUMERIC":
			if (Number.isNaN(vValue) || vValue === undefined || vValue === null) {
				vValue = 0;
			}
			break;
		case "BOOLEAN":
			if (vValue === undefined || vValue === null) {
				vValue = false;
			}
			break;
		case "TEXT":
			if (vValue === undefined || vValue === null) {
				vValue = "";
			}
			break;
		default:
			if (vValue === undefined || vValue === null) {
				vValue = "";
			}
			break;
	}
	return vValue;
}

function _booleanValueToString(iValue, sLang) {
	if (iValue === undefined || iValue === null) {
		return CommonUtil.getCodeText("EVALUATION_FLD_UNKNOWN", 'nguii18n', sLang);
	} else if (iValue === 1 || iValue === true) {
		return CommonUtil.getCodeText("EVALUATION_FLD_YES", 'nguii18n', sLang);
	} else if (iValue === 0 || iValue === false) {
		return CommonUtil.getCodeText("EVALUATION_FLD_NO", 'nguii18n', sLang);
	} else {
		return CommonUtil.getCodeText("EVALUATION_FLD_UNKNOWN", 'nguii18n', sLang);
	}
}

function _getFormattedValue(oHQ, sDataType, nNumValue, bBoolValue, sTextValue, sVoLCode, sUoMCode, sLang) {
	var vValue = _getValue(sDataType, nNumValue, bBoolValue, sTextValue);
	var sFormattedValue = "";
	if (sVoLCode) {
		sFormattedValue = CommonUtil.getOptionValueText(oHQ, sVoLCode, (sDataType === "BOOLEAN" ? 3 : (sDataType === "TEXT" ? 1 : 2)), sTextValue,
			nNumValue, bBoolValue);
	} else {
		switch (sDataType) {
			case "INTEGER":
				sFormattedValue = Math.round(vValue).toString();
				break;
			case "NUMERIC":
				sFormattedValue = parseInt(_toFloat(vValue) * 10) / 10;
				break;
			case "BOOLEAN":
				sFormattedValue = _booleanValueToString(vValue, sLang);
				break;
			case "TEXT":
				sFormattedValue = vValue;
				break;
			default:
				sFormattedValue = vValue.toString();
				break;
		}
	}
	if (!sFormattedValue) {
		sFormattedValue = "";
	}
	if (sUoMCode) {
		sFormattedValue = sFormattedValue + " " + CommonUtil.getUnitText(sUoMCode);
	}
	return sFormattedValue;
}

function _getEvaluationResult(oHQ, oResult, sLang) {
	return _getFormattedValue(oHQ, oResult.OV_RES_DATATYPE_CODE, oResult.OV_RES_NUM_VALUE, oResult.OV_RES_BOOL_VALUE, oResult.OV_RES_TEXT_VALUE,
		oResult.OV_RES_VALUE_OPTION_LIST_CODE, oResult.OV_RES_UOM_CODE, sLang);
}

function process(oHQ, oNotification, oResult, sLang) {
	if (oNotification.INVOLVED_ID > 0) {
		var sSql =
			`SELECT criteria.DATATYPE_CODE AS OV_RES_DATATYPE_CODE, 
	criterion_value.NUM_VALUE AS OV_RES_NUM_VALUE, 
	criterion_value.BOOL_VALUE AS OV_RES_BOOL_VALUE, 
	criterion_value.TEXT_VALUE AS OV_RES_TEXT_VALUE, 
	criteria.VALUE_OPTION_LIST_CODE AS OV_RES_VALUE_OPTION_LIST_CODE, 
	criteria.UOM_CODE AS OV_RES_UOM_CODE
FROM "sap.ino.db.evaluation::t_evaluation" AS evaluation
	INNER JOIN "sap.ino.db.evaluation::t_model" AS model
	ON evaluation.MODEL_CODE = model.CODE
	INNER JOIN "sap.ino.db.evaluation::t_criterion_value" AS criterion_value
	ON evaluation.ID = criterion_value.EVALUATION_ID
	INNER JOIN "sap.ino.db.evaluation::t_criterion" AS criteria
	ON criteria.CODE = criterion_value.CRITERION_CODE
WHERE IS_OVERALL_RESULT = 1
	AND EVALUATION_ID = ?
	AND (model.ENABLE_FORMULA = 0 or model.ENABLE_FORMULA is null)

UNION ALL

SELECT DISTINCT 'NUMERIC' AS OV_RES_DATATYPE_CODE, 
evaluation.CAL_NUM_VALUE AS OV_RES_NUM_VALUE, 
null AS OV_RES_BOOL_VALUE, 
null AS OV_RES_TEXT_VALUE, 
null AS OV_RES_VALUE_OPTION_LIST_CODE, 
null AS OV_RES_UOM_CODE
FROM "sap.ino.db.evaluation::t_evaluation" AS evaluation
INNER JOIN "sap.ino.db.evaluation::t_model" AS model
ON evaluation.MODEL_CODE = model.CODE
INNER JOIN "sap.ino.db.evaluation::t_criterion_value" AS criterion_value
ON evaluation.ID = criterion_value.EVALUATION_ID
INNER JOIN "sap.ino.db.evaluation::t_criterion" AS criteria
ON criteria.CODE = criterion_value.CRITERION_CODE
WHERE model.ENABLE_FORMULA = 1
AND EVALUATION_ID = ?;

`;
		var aResult = oHQ.statement(sSql).execute(oNotification.INVOLVED_ID, oNotification.INVOLVED_ID);
		if (aResult && aResult.length > 0) {
			CommonUtil.replacePlaceHolder(oResult, {
				"EVALUATION_RESULT": _getEvaluationResult(oHQ, aResult[0], sLang)
			});
		} else {
			CommonUtil.replacePlaceHolder(oResult, {
				"EVALUATION_RESULT": ""
			});
		}
	}
}