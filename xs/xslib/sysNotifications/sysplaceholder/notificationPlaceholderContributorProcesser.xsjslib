const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");

function process(oHQ, oNotification, oResult) {
	CommonUtil.replacePlaceHolder(oResult, CommonUtil.getIdentity(oHQ, oNotification.OWNER_ID), "AUTHOR_");
}