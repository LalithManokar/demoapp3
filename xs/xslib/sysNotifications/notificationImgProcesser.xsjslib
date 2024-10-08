// notificationImgProcesser.xsjslib

const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const CommonUtil = $.import("sap.ino.xs.xslib.sysNotifications", "commonUtil");

function _getImgs(oHQ, sContentData, nCampId, oResult) {
	if (sContentData) {
		var oRegex = /src="cid:([^\/:*?\"<>|]+)"/g;
		sContentData = sContentData.replace(CommonUtil.RegularExpression.CAMPAIGN_TITLE_IMAGE, "cid:CAMPAIGN_TITLE_IMAGE");
		sContentData.replace(oRegex, function() {
			var oImage = CommonUtil.getImage(oHQ, arguments[1], arguments[1] === "CAMPAIGN_TITLE_IMAGE" ? (nCampId || -1) : undefined);
			if (oImage) {
				oResult.aImages.push(oImage);
			}
		});
// 		throw new Error(sContentData);
// 		sContentData.replace(CommonUtil.RegularExpression.CAMPAIGN_TITLE_IMAGE, function() {
// 			var oImage = CommonUtil.getImage(oHQ, "CAMPAIGN_TITLE_IMAGE", (nCampId || -1));
// 			if (oImage) {
// 				oResult.aImages.push(oImage);
// 			}
// 		});
	}
	oResult.ContentData = sContentData;
}

//getData
//should return an object like this:
// return {
// 		aImages: []
// 	};
function getData(oHQ, sContentData, nCampId) {
	var oResult = {
		aImages: [],
		ContentData: ""
	};
	_getImgs(oHQ, sContentData, nCampId, oResult);
	return oResult;
}