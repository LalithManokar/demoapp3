var i18n = $.import("sap.ino.xs.xslib", "i18n");
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var oHQ = $.import("sap.ino.xs.xslib", "hQuery").hQuery(oConn);
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

const TextBundle = $.import("sap.ino.xs.xslib", "textBundle");
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");
const NotificationHostUrlProcesser = $.import("sap.ino.xs.xslib.sysNotifications", "notificationHostUrlProcesser");
const NotificationImgProcesser = $.import("sap.ino.xs.xslib.sysNotifications", "notificationImgProcesser");
const NotificationTextmoduleProcesser = $.import("sap.ino.xs.xslib.sysNotifications", "notificationTextmoduleProcesser");

function getActionConfig() {
	var sStatement =
		`SELECT mail_t.template, 
	text_module_t.text_module
FROM "sap.ino.db.newnotification::v_notification_system_setting" AS action
	INNER JOIN "sap.ino.db.notification::t_mail_template_t" AS mail_t
	ON mail_t.mail_template_code = action.email_template_code
	INNER JOIN "sap.ino.db.basis::t_text_module_t" AS text_module_t
	ON text_module_t.text_module_code = action.text_module_code
	INNER JOIN "sap.ino.db.basis::t_language_stage" AS lan
	ON mail_t.LANG = lan.iso_code
		AND text_module_t.LANG = lan.iso_code
	INNER JOIN "sap.ino.db.basis::v_local_system_setting_full" AS setting
	ON setting.value = lan.code
WHERE setting.code = 'sap.ino.config.DEFAULT_SYSTEM_LANGUAGE'
	AND action.action_code = ? `;
	var oActionConfig = oHQ.statement(sStatement).execute("CREATE_USER");
	return oActionConfig.length > 0 ? oActionConfig[0] : {};
}

function getCreateUserMailContent(sUserName, sFirstName, sLastName, sName, sUserPwd, iUserId) {
	//{{RECIPIENT_FIRST_NAME}},{{USER_NAME}}, {{USER_PASSWORD}},{{ACTOR_FIRST_NAME}}, {{ACTOR_LAST_NAME}}, {{SYSTEM_URL}},{{ACTOR_NAME}}
	var oData = {
		"RECIPIENT_FIRST_NAME": sFirstName,
		"RECIPIENT_LAST_NAME": sLastName,
		"RECIPIENT_NAME": sName,
		"USER_NAME": sUserName,
		"USER_PASSWORD": sUserPwd,
		"SYSTEM_URL": NotificationHostUrlProcesser.getFrontofficeUrl(oHQ, false)
	};
	var oActionConfig = getActionConfig();
	if (oActionConfig.TEMPLATE && oActionConfig.TEXT_MODULE) {
		var oContent = {};
		oContent.sContent = oActionConfig.TEMPLATE.replace("{{CONTENT}}",
			NotificationTextmoduleProcesser.parseTxtContent(oActionConfig.TEXT_MODULE, "CREATED_USER").content);
		CommonUtil.replacePlaceHolder(oContent, oData);
		CommonUtil.replacePlaceHolder(oContent, CommonUtil.getIdentity(oHQ, iUserId), "ACTOR_");
		oContent.aImgs = NotificationImgProcesser.getData(oHQ, oContent.sContent).aImages;
		return oContent;
	} else {
		return {
			aImgs: [],
			sContent: TextBundle.getText("messages", "MSG_IDENTITY_CREATE_USER_EMAIL_BODY_CONTENT", [sUserName, sUserPwd, NotificationHostUrlProcesser.getFrontofficeUrl(oHQ, false)])
		};
	}
}