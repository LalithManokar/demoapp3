const TextBundle = $.import("sap.ino.xs.xslib", "textBundle");
const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const Mail = $.import("sap.ino.xs.xslib", "mail");
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");

this.processEmailSubject = function(oHQ, oNotification) {
	if (!oNotification || oNotification.OBJECT_TYPE_CODE !== "IDEA") {
		return void 0;
	}
	var sSubjectIdea = TextBundle.getText("messages", "MSG_NOTIFICATION_SUBJECT_FOR_IDEA");
	if (!sSubjectIdea || sSubjectIdea === "MSG_NOTIFICATION_SUBJECT_FOR_IDEA") {
		return void 0;
	}
	// 	TraceWrapper.log_exception(new Error(sSubjectIdea));
	if (sSubjectIdea.indexOf("{{IDEA_ID}}") > -1 || sSubjectIdea.indexOf("{{IDEA_NAME}}") > -1) {
		var oIdea = CommonUtil.getIdeaData(oHQ, oNotification.OBJECT_ID);
		if (oIdea) {
			sSubjectIdea = sSubjectIdea.replace("{{IDEA_ID}}", oIdea.IDEA_ID);
			sSubjectIdea = sSubjectIdea.replace("{{IDEA_NAME}}", oIdea.IDEA_NAME);
		}
	}
	return sSubjectIdea;
};