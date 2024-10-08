const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");
const HostUrlProcesser = $.import("sap.ino.xs.xslib.sysNotifications", "notificationHostUrlProcesser");

function process(oHQ, oNotification, oResult, sLang) {
	var sSql =
		`
    SELECT eval_request.description AS EVALUATION_REQUEST_DESCRIPTION, 
	eval_request.accept_date AS EVALUATION_REQUEST_ACCEPTANCE_DATE, 
	eval_request.complete_date AS EVALUATION_REQUEST_COMPLETION_DATE, 
	eval_request_item.STATUS_CODE
FROM "sap.ino.db.evaluation::t_evaluation_request_item" AS eval_request_item
	INNER JOIN "sap.ino.db.evaluation::t_evaluation_request" AS eval_request
	ON eval_request_item.EVAL_REQ_ID = eval_request.ID
	INNER JOIN "sap.ino.db.status::t_status" AS status
	ON eval_request_item.STATUS_CODE = status.CODE
WHERE 1 = 1 
`;
	if (oNotification.OBJECT_TYPE_CODE === "EVAL_REQUEST") {
		sSql += " AND eval_request_item.EVAL_REQ_ID = ? ";
	} else if (oNotification.OBJECT_TYPE_CODE === "EVAL_REQUEST_ITEM") {
		sSql += " AND eval_request_item.ID = ? ";
	}
	var aResultData = oHQ.statement(sSql).execute(oNotification.OBJECT_ID);
	if (aResultData && aResultData.length > 0) {
		var oData = aResultData[0];
		oData.EVALUATION_REQUEST_ACCEPTANCE_DATE = !oData.EVALUATION_REQUEST_ACCEPTANCE_DATE ? "" : CommonUtil.formatDate(new Date(oData.EVALUATION_REQUEST_ACCEPTANCE_DATE));
		oData.EVALUATION_REQUEST_COMPLETION_DATE = !oData.EVALUATION_REQUEST_COMPLETION_DATE ? "" : CommonUtil.formatDate(new Date(oData.EVALUATION_REQUEST_COMPLETION_DATE));
		oData.EVALUATION_REQUEST_STATUS = CommonUtil.getCodeText(oData.STATUS_CODE, "t_status", sLang);
		CommonUtil.replacePlaceHolder(oResult, oData);
	}
}