const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var IAMMessage = $.import("sap.ino.xs.object.iam", "message");

const typeList = ['IDEA_VIEW', 'CAMPAIGN_VIEW', 'SCREEN_SIZE', 'FILTER', 'SIMILAR_IDEA', 'FILTER_ACTIVE_IDEA', 'REPORT_VIEW'];
const feedTypeList = ['CAMPAIGN_SETTING_VALUE', 'IDEA_SETTING_VALUE', 'TAG_SETTING_VALUE'];
const feedTypeNewList = ['CAMPAIGN_SETTING_VALUE', 'IDEA_SETTING_VALUE', 'TAG_SETTING_VALUE', 'FEEDS_KEY'];

const filterObjectTypeCode = ['CAMPAIGN', 'CUSTOM_IDEA_FORM', 'PHASE', 'STATUS_TYPE', 'STATUS', 'VOTE_NUMBER', 'RESPONSIBILITY_LIST',
	'AUTHOR', 'COACH', 'DUE_DATE', 'LATEST_UPDATE', 'COMPANY_VIEW'];
const filterObjectTypeCodeForCommunity = ['CAMPAIGN', 'CUSTOM_IDEA_FORM', 'PHASE', 'STATUS_TYPE', 'STATUS', 'VOTE_NUMBER',
	'RESPONSIBILITY_LIST', 'LATEST_UPDATE'];
const filterTypeCode = ['IDEA_LIST_FILTER', 'CAMPAIGN_LIST_FILTER'];

this.definition = {
	Root: {
		table: "sap.ino.db.iam::t_personalize_setting",
		sequence: "sap.ino.db.iam::s_personalize_setting",
		determinations: {},
		attributes: {
			IDENTITY_ID: {
				foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root",
				required: true
			},
			OBJECT_TYPE_CODE: {
				required: true
			},
			SETTING_VALUE: {
				required: true
			},
			CHANGED_AT: {
				readOnly: true,
				concurrencyControl: true
			}
		}
	},
	actions: {
		read: {
			authorizationCheck: false
		},
		create: {
			authorizationCheck: false
		},
		update: {
			authorizationCheck: true
		},
		del: {
			authorizationCheck: false
		},
		getSettings: {
			authorizationCheck: false,
			execute: getSettings,
			isStatic: true
		},
		updateSettings: {
			authorizationCheck: false,
			execute: updateSettings,
			isStatic: true
		},
		getNotificationSettings: {
			authorizationCheck: false,
			execute: getNotificationSettings,
			isStatic: true
		},
		updateNotificationSettings: {
			authorizationCheck: false,
			execute: updateNotificationSettings,
			isStatic: true
		},
		getFilterSettings: {
			authorizationCheck: false,
			execute: getFilterSettings,
			isStatic: true
		},
		getFilterSettingsForDialogForBackoffice: {
			authorizationCheck: false,
			execute: getFilterSettingsForDialogForBackoffice,
			isStatic: true
		},
		getFilterSettingsForDialogForCommunity: {
			authorizationCheck: false,
			execute: getFilterSettingsForDialogForCommunity,
			isStatic: true
		},
		updateFilterSettings: {
			authorizationCheck: false,
			execute: updateFilterSettings,
			isStatic: true
		},
		getFeedsSettings: {
			authorizationCheck: false,
			execute: getFeedsSettings,
			isStatic: true
		},
		updateFeedsSettings: {
			authorizationCheck: false,
			execute: updateFeedsSettings,
			isStatic: true
		},
		getNewNotificationSettings: {
			authorizationCheck: false,
			execute: getNewNotificationSettings,
			isStatic: true
		},
		updateNewNotificationSettings: {
			authorizationCheck: false,
			execute: updateNewNotificationSettings,
			isStatic: true
		},
		getNewFeedsSettings: {
			authorizationCheck: false,
			execute: getNewFeedsSettings,
			isStatic: true
		},
		updateNewFeedsSettings: {
			authorizationCheck: false,
			execute: updateNewFeedsSettings,
			isStatic: true
		},
		getQuickLinkSettings: {
			authorizationCheck: false,
			execute: getQuickLinkSettings,
			isStatic: true
		},
		updateQuickLinkSettings: {
			authorizationCheck: false,
			execute: updateQuickLinkSettings,
			isStatic: true
		},
		deleteQuickLinkSettings: {
			authorizationCheck: false,
			execute: deleteQuickLinkSettings,
			isStatic: true
		}
	}
};

function personalizeReadAuthorizationCheck(vKey, addMessage, oContext) {
	if (vKey !== oContext.getUser().ID) {
		return addMessage(Message.MessageSeverity.Error, IAMMessage.AUTH_MISSING_USER_SETTINGS_READ, vKey, "Root");
	}
	return true;
}

function personalizeUpdateAuthorizationCheck(vKey, addMessage, oContext) {
	if (vKey.identity_id !== oContext.getUser().ID) {
		return addMessage(Message.MessageSeverity.Error, IAMMessage.AUTH_MISSING_USER_SETTINGS_UPDATE, vKey.identity_id, "Root");
	}
	return true;
}

function getSettings(vKey, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	var userId = oContext.getUser().ID;
	var oHQ = oContext.getHQ();
	var sSelect = 'select * from "sap.ino.db.iam::cv_personalize_setting" where identity_id = ?';
	var aResult = oHQ.statement(sSelect).execute(userId);
	return _.object(_.pluck(aResult, 'OBJECT_TYPE_CODE'), _.map(_.pluck(aResult, 'SETTING_VALUE'), function(num) {
		return !!num;
	}));
}

function updateSettings(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	var userId = oContext.getUser().ID;
	var oHQ = oContext.getHQ();
	var personalizeModel = AOF.getApplicationObject("sap.ino.xs.object.iam.PersonalizeSetting");
	var sSelectQuery = 'select * from "sap.ino.db.iam::cv_personalize_setting" where identity_id = ?';
	var aResult = oHQ.statement(sSelectQuery).execute(userId);
	var resultObj, personalizeId;
	_.each(oReq.personalize, function(value, key) {
		resultObj = _.find(aResult, function(item) {
			return item.OBJECT_TYPE_CODE === key;
		});
		personalizeId = resultObj && resultObj.ID || undefined;
		if (!~typeList.indexOf(key)) {
			return false;
		}
		if (!personalizeId) {
			return personalizeModel.create({
				IDENTITY_ID: userId,
				OBJECT_TYPE_CODE: key,
				TYPE_CODE: 'PERSONALIZE',
				SETTING_VALUE: Number(value)
			});
		}
		if (resultObj.SETTING_VALUE !== Number(value)) {
			return personalizeModel.update({
				ID: personalizeId,
				SETTING_VALUE: Number(value)
			});
		}

	});
}

function getNotificationSettings(vKey, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	var userId = oContext.getUser().ID;
	var oHQ = oContext.getHQ();

	var sMappingSelect = '	SELECT DISTINCT ' +
		'    ID, ' +
		'    CODE, ' +
		'    OBJECT_TYPE_CODE, ' +
		'    MAPPING_SETTING_CODE, ' +
		'    SETTING_VALUE, ' +
		'    SUBCATEGORY_CODE FROM ' +
		'(SELECT ' +
		'    setting.ID, ' +
		'    mapsetting.CODE, ' +
		'    mapsetting.OBJECT_TYPE_CODE, ' +
		'    mapsetting.MAPPING_SETTING_CODE, ' +
		'    IFNULL(setting.SETTING_VALUE, 1) AS SETTING_VALUE, ' +
		'    mapsetting.SUBCATEGORY_CODE, ' +
		'    ROW_NUMBER() OVER (PARTITION BY  MAPPING_SETTING_CODE ORDER BY CODE DESC) AS  r ' +
		'FROM     ' +
		'    "sap.ino.db.notification::t_notification_code_mapping_setting" AS mapsetting ' +
		'LEFT OUTER JOIN "sap.ino.db.iam::t_personalize_setting" AS setting ' +
		'    ON mapsetting.MAPPING_SETTING_CODE = setting.OBJECT_TYPE_CODE  ' +
		'    AND setting.TYPE_CODE = \'NOTIFICATION\' ' +
		'    AND setting.IDENTITY_ID = ? ' +
		'WHERE mapsetting.CODE LIKE \'sap.ino.config.%\' ) ' +
		'WHERE r=1 ' +
		'UNION ALL ' +
		'SELECT  ' +
		'    setting.ID, ' +
		'    NULL AS CODE, ' +
		'    setting.OBJECT_TYPE_CODE, ' +
		'    \'KEY\' AS MAPPING_SETTING_CODE, ' +
		'    IFNULL(setting.SETTING_VALUE, 1) AS SETTING_VALUE, ' +
		'    NULL AS SUBCATEGORY_CODE ' +
		'FROM "sap.ino.db.iam::t_personalize_setting" AS setting  ' +
		'WHERE  ' +
		'    IDENTITY_ID = ? AND TYPE_CODE = \'NOTIFICATION\' AND OBJECT_TYPE_CODE = \'NOTIFICATION_KEY\' ';
	var oResult = oHQ.statement(sMappingSelect).execute(userId, userId);
	return _.groupBy(oResult, function(data) {
		if (data.MAPPING_SETTING_CODE.indexOf("_") > -1) {
			return data.MAPPING_SETTING_CODE.substring(0, data.MAPPING_SETTING_CODE.indexOf("_"));
		} else {
			return data.MAPPING_SETTING_CODE;
		}
	});
}

function updateNotificationSettings(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	var userId = oContext.getUser().ID;
	var oHQ = oContext.getHQ();
	var personalizeModel = AOF.getApplicationObject("sap.ino.xs.object.iam.PersonalizeSetting");
	var sSelectQuery =
		'SELECT ID,SETTING_VALUE FROM "sap.ino.db.iam::t_personalize_setting" WHERE IDENTITY_ID = ? AND TYPE_CODE = \'NOTIFICATION\' AND OBJECT_TYPE_CODE = \'NEXT_TIME\' ';
	var aResult = oHQ.statement(sSelectQuery).execute(userId);

	var sKeyQuery =
		'SELECT ID,SETTING_VALUE FROM "sap.ino.db.iam::t_personalize_setting" WHERE IDENTITY_ID = ? AND TYPE_CODE = \'NOTIFICATION\' AND OBJECT_TYPE_CODE = \'NOTIFICATION_KEY\' ';
	var aKeyResult = oHQ.statement(sKeyQuery).execute(userId);

	var sCurrentTimeQuery =
		'SELECT VALUE FROM "sap.ino.db.notification::v_notification_email_scheduled_currentseconds"';
	var aCurrentTimeResult = oHQ.statement(sCurrentTimeQuery).execute();

	if (!oReq || !oReq.notification) {
		return;
	}

	if (oReq.notification.KEY && oReq.notification.KEY[0]) {
		//modify notification key
		if (aKeyResult && aKeyResult[0] && aKeyResult[0].ID) {
			personalizeModel.update({
				ID: aKeyResult[0].ID,
				SETTING_VALUE: oReq.notification.KEY[0].SETTING_VALUE
			});
		} else {
			personalizeModel.create({
				IDENTITY_ID: userId,
				OBJECT_TYPE_CODE: "NOTIFICATION_KEY",
				TYPE_CODE: 'NOTIFICATION',
				SETTING_VALUE: oReq.notification.KEY[0].SETTING_VALUE
			});
		}
		//modify notification next time
		if (aResult && aResult[0] && aResult[0].ID && aResult[0].ID > 0) {
			if (oReq.notification.KEY[0].SETTING_VALUE === 0 || oReq.notification.KEY[0].SETTING_VALUE === -1) {
				personalizeModel.del(aResult[0].ID);
			} else if (oReq.notification.KEY[0].SETTING_VALUE !== aKeyResult[0].SETTING_VALUE) {
				personalizeModel.update({
					ID: aResult[0].ID,
					SETTING_VALUE: Number(aCurrentTimeResult[0].VALUE.toString()) + Number(oReq.notification.KEY[0].SETTING_VALUE) * 24 * 60 * 60
				});
			}
		} else if(oReq.notification.KEY[0].SETTING_VALUE > 0){
			personalizeModel.create({
				IDENTITY_ID: userId,
				OBJECT_TYPE_CODE: "NEXT_TIME",
				TYPE_CODE: 'NOTIFICATION',
				SETTING_VALUE: Number(aCurrentTimeResult[0].VALUE.toString()) + Number(oReq.notification.KEY[0].SETTING_VALUE) * 24 * 60 * 60
			});
		}
	}
	//delete all config
	var sDelQuery =
		'DELETE FROM "sap.ino.db.iam::t_personalize_setting" where identity_id = ? AND TYPE_CODE = \'NOTIFICATION\' AND OBJECT_TYPE_CODE != \'NOTIFICATION_KEY\' ';
	sDelQuery += ' AND OBJECT_TYPE_CODE != \'NEXT_TIME\' ';
	oHQ.statement(sDelQuery).execute(userId);
	oHQ.getConnection().commit();

	//modify idea config
	if (oReq.notification.IDEA) {
		_.each(oReq.notification.IDEA, function(oData) {
			updateNotificationSettingConfig(oData);
		});
	}
	//modify campaign config
	if (oReq.notification.CAMPAIGN) {
		_.each(oReq.notification.CAMPAIGN, function(oData) {
			updateNotificationSettingConfig(oData);
		});
	}

	function updateNotificationSettingConfig(oData) {
		if (!oData) {
			return;
		}
		personalizeModel.create({
			IDENTITY_ID: userId,
			OBJECT_TYPE_CODE: oData.MAPPING_SETTING_CODE,
			TYPE_CODE: 'NOTIFICATION',
			SETTING_VALUE: Number(oData.SETTING_VALUE)
		});
	}
}

function getFeedsSettings(vKey, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	var userId = oContext.getUser().ID;
	var oHQ = oContext.getHQ();
	var sSelect = 'SELECT * FROM "sap.ino.db.iam::t_personalize_setting" WHERE IDENTITY_ID = ? AND TYPE_CODE = \'FEEDS\'';
	var aResult = oHQ.statement(sSelect).execute(userId);
	// 	var sSysSelect =
	// 		'SELECT TOP 1 VALUE FROM "sap.ino.db.basis::t_user_parameter" WHERE USER_ID = ? AND SECTION = \'notification\' AND KEY = \'mail\' ';
	// 	var aSysResult = oHQ.statement(sSysSelect).execute(userId);
	var oResult = _.object(_.pluck(aResult, 'OBJECT_TYPE_CODE'), _.map(_.pluck(aResult, 'SETTING_VALUE'), function(num) {
		return !!num;
	}));
	// 	var overallValue = true;
	// 	if (aSysResult && aSysResult.length > 0 && aSysResult[0].VALUE === "inactive") {
	// 		overallValue = false;
	// 	}
	// 	oResult.OVERALL_SETTING_VALUE = overallValue;
	return oResult;
}

function updateFeedsSettings(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	var userId = oContext.getUser().ID;
	var oHQ = oContext.getHQ();
	var personalizeModel = AOF.getApplicationObject("sap.ino.xs.object.iam.PersonalizeSetting");
	var sSelectQuery = 'SELECT * from "sap.ino.db.iam::t_personalize_setting"  WHERE IDENTITY_ID = ? AND TYPE_CODE = \'FEEDS\'';
	var aResult = oHQ.statement(sSelectQuery).execute(userId);
	var resultObj, feedSettingId;
	_.each(oReq.feeds, function(value, feed) {
		var settingValue = Number(value);
		resultObj = _.find(aResult, function(item) {
			return item.OBJECT_TYPE_CODE === feed;
		});
		feedSettingId = resultObj && resultObj.ID || undefined;
		if (!~feedTypeList.indexOf(feed)) {
			return false;
		}
		if (!feedSettingId) {
			return personalizeModel.create({
				IDENTITY_ID: userId,
				OBJECT_TYPE_CODE: feed,
				TYPE_CODE: 'FEEDS',
				SETTING_VALUE: settingValue,
				CHANGED_AT: oContext.getRequestTimestamp()
			});
		}
		if (resultObj.SETTING_VALUE !== settingValue) {
			return personalizeModel.update({
				ID: feedSettingId,
				SETTING_VALUE: settingValue,
				CHANGED_AT: oContext.getRequestTimestamp()
			});
		}
	});
	// 	var sUpdateStatement = "UPSERT \"sap.ino.db.basis::t_user_parameter\" VALUES (?, ?, ?, ?) WITH PRIMARY KEY";
	// 	oHQ.statement(sUpdateStatement).execute(oContext.getUser().ID, "notification", "mail", Number(oReq.feeds.OVERALL_SETTING_VALUE) === 1 ?
	// 		"active" : "inactive");
}

function getFilterSettings(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	var userId = oContext.getUser().ID;
	var oHQ = oContext.getHQ();
	var sSelectQuery =
		'select OBJECT_TYPE_CODE,TYPE_CODE,SETTING_VALUE,SEQUENCE from \"sap.ino.db.iam::t_personalize_setting\" where IDENTITY_ID = ? and TYPE_CODE = \'IDEA_LIST_FILTER\'';
	var aResult = oHQ.statement(sSelectQuery).execute(userId);
	var oResponse = {};

	var sSystemSettingSelectQuery = "select local_setting.value as value," +
		"setting.value as default_value " +
		"from \"sap.ino.db.basis::v_local_system_setting\" as local_setting " +
		"left outer join \"sap.ino.db.basis::t_system_setting\" as setting " +
		"on  local_setting.code = setting.code " +
		"where local_setting.code = \'sap.ino.config.IDEA_FILTERS_CONFIG\'";
	var aSystemSettingResult = oHQ.statement(sSystemSettingSelectQuery).execute();
	var aSettingValue;
	if (aSystemSettingResult[0].VALUE !== null) {
		aSettingValue = aSystemSettingResult[0].VALUE;
	} else {
		aSettingValue = aSystemSettingResult[0].DEFAULT_VALUE;
	}

	if (aResult.length === 0) {
		_.each(filterObjectTypeCode, function(item, index) {
			if (~aSettingValue.indexOf(item)) {
				oResponse[item] = {
					VALUE: 1,
					SEQUENCE: null
				};
			}

		});
	} else {
		_.each(aResult, function(item, index) {
			if (~aSettingValue.indexOf(item.OBJECT_TYPE_CODE)) {
				oResponse[item.OBJECT_TYPE_CODE] = {
					VALUE: item.SETTING_VALUE,
					SEQUENCE: item.SEQUENCE
				};
			}

		});
	}

	return oResponse;
}

function getFilterSettingsForDialogForBackoffice(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	var userId = oContext.getUser().ID;
	var oHQ = oContext.getHQ();
	var sSelectQuery =
		'select OBJECT_TYPE_CODE,TYPE_CODE,SETTING_VALUE,SEQUENCE from \"sap.ino.db.iam::t_personalize_setting\" where IDENTITY_ID = ? and TYPE_CODE = \'IDEA_LIST_FILTER\'';
	var aResult = oHQ.statement(sSelectQuery).execute(userId);

	var sSystemSettingSelectQuery = "select local_setting.value as value," +
		"setting.value as default_value " +
		"from \"sap.ino.db.basis::v_local_system_setting\" as local_setting " +
		"left outer join \"sap.ino.db.basis::t_system_setting\" as setting " +
		"on  local_setting.code = setting.code " +
		"where local_setting.code = \'sap.ino.config.IDEA_FILTERS_CONFIG\'";
	var aSystemSettingResult = oHQ.statement(sSystemSettingSelectQuery).execute();
	var aSettingValue;
	if (aSystemSettingResult[0].VALUE !== null) {
		aSettingValue = aSystemSettingResult[0].VALUE;
	} else {
		aSettingValue = aSystemSettingResult[0].DEFAULT_VALUE;
	}

	var oResponse = [];
	if (aResult.length === 0) {
		_.each(filterObjectTypeCode, function(item, index) {
			if (~aSettingValue.indexOf(item)) {
				var oObject = {
					CODE: item,
					VALUE: true,
					SEQUENCE: null
				};
				oResponse.push(oObject);
			}

		});
	} else {
		var systemAllFilterOption = aSettingValue.split(',');
		_.each(systemAllFilterOption, function(item, index) {
			if (~aSettingValue.indexOf(item) && ~filterObjectTypeCode.indexOf(item)) {
				var temp = _.find(aResult, function(person) {
					return person.OBJECT_TYPE_CODE == item;
				});
				var oObject;
				if (temp) {
					oObject = {
						CODE: temp.OBJECT_TYPE_CODE,
						VALUE: !!temp.SETTING_VALUE,
						SEQUENCE: temp.SEQUENCE
					};
					oResponse.push(oObject);
				} else {
					oObject = {
						CODE: item,
						VALUE: false,
						SEQUENCE: 0
					};
					oResponse.push(oObject);
				}

			}
		});
	}

	return oResponse;
}

function getFilterSettingsForDialogForCommunity(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	var userId = oContext.getUser().ID;
	var oHQ = oContext.getHQ();
	var sSelectQuery =
		'select OBJECT_TYPE_CODE,TYPE_CODE,SETTING_VALUE,SEQUENCE from \"sap.ino.db.iam::t_personalize_setting\" where IDENTITY_ID = ? and TYPE_CODE = \'IDEA_LIST_FILTER\'';
	var aResult = oHQ.statement(sSelectQuery).execute(userId);

	var sSystemSettingSelectQuery = "select local_setting.value as value," +
		"setting.value as default_value " +
		"from \"sap.ino.db.basis::v_local_system_setting\" as local_setting " +
		"left outer join \"sap.ino.db.basis::t_system_setting\" as setting " +
		"on  local_setting.code = setting.code " +
		"where local_setting.code = \'sap.ino.config.IDEA_FILTERS_CONFIG\'";
	var aSystemSettingResult = oHQ.statement(sSystemSettingSelectQuery).execute();
	var aSettingValue;
	if (aSystemSettingResult[0].VALUE !== null) {
		aSettingValue = aSystemSettingResult[0].VALUE;
	} else {
		aSettingValue = aSystemSettingResult[0].DEFAULT_VALUE;
	}

	var oResponse = [];
	if (aResult.length === 0) {
		_.each(filterObjectTypeCodeForCommunity, function(item, index) {
			if (~aSettingValue.indexOf(item)) {
				var oObject = {
					CODE: item,
					VALUE: true,
					SEQUENCE: null
				};
				oResponse.push(oObject);
			}

		});
	} else {
		var systemAllFilterOption = aSettingValue.split(',');
		_.each(systemAllFilterOption, function(item, index) {
			if (~aSettingValue.indexOf(item) && ~filterObjectTypeCodeForCommunity.indexOf(item)) {
				var temp = _.find(aResult, function(person) {
					return person.OBJECT_TYPE_CODE == item;
				});
				var oObject;
				if (temp) {
					oObject = {
						CODE: temp.OBJECT_TYPE_CODE,
						VALUE: !!temp.SETTING_VALUE,
						SEQUENCE: temp.SEQUENCE
					};
					oResponse.push(oObject);
				} else {
					oObject = {
						CODE: item,
						VALUE: false,
						SEQUENCE: 0
					};
					oResponse.push(oObject);
				}

			}
		});
	}

	return oResponse;
}

function updateFilterSettings(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	var userId = oContext.getUser().ID;
	var oHQ = oContext.getHQ();
	var sSelectQuery =
		'select ID,OBJECT_TYPE_CODE from \"sap.ino.db.iam::t_personalize_setting\" where IDENTITY_ID = ? and TYPE_CODE = \'IDEA_LIST_FILTER\'';
	var aResult = oHQ.statement(sSelectQuery).execute(userId);
	var personalizeModel = AOF.getApplicationObject("sap.ino.xs.object.iam.PersonalizeSetting");
	var resultObj, filterSettingId;

	_.each(oReq.IDEA_LIST_FILTER_PERSONALIZATION, function(value, code) {
		var settingObject = value;
		resultObj = _.find(aResult, function(item) {
			return item.OBJECT_TYPE_CODE === code;
		});
		filterSettingId = resultObj && resultObj.ID || undefined;
		if (!~filterObjectTypeCode.indexOf(code)) {
			return false;
		}
		if (!filterSettingId) {
			return personalizeModel.create({
				IDENTITY_ID: userId,
				OBJECT_TYPE_CODE: code,
				TYPE_CODE: 'IDEA_LIST_FILTER',
				SETTING_VALUE: settingObject.VALUE,
				CHANGED_AT: oContext.getRequestTimestamp(),
				SEQUENCE: settingObject.SEQUENCE
			});
		}
		if (resultObj.SETTING_VALUE !== settingObject.VALUE || resultObj.SEQUENCE !== settingObject.SEQUENCE) {
			return personalizeModel.update({
				ID: filterSettingId,
				SETTING_VALUE: settingObject.VALUE,
				CHANGED_AT: oContext.getRequestTimestamp(),
				SEQUENCE: settingObject.SEQUENCE
			});
		}
	});
}

function getNewNotificationSettings(vKey, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	var userId = oContext.getUser().ID;
	var oHQ = oContext.getHQ();

	var sMappingSelect = '	SELECT DISTINCT ' +
		'    ID, ' +
		'    ACTION_CODE, ' +
		'    ACTION_TYPE_CODE, ' +
		'    SETTING_VALUE FROM ' +
		'(SELECT ' +
		'    setting.ID, ' +
		'    mapsetting.ACTION_CODE, ' +
		'    mapsetting.ACTION_TYPE_CODE, ' +
		'    IFNULL(setting.SETTING_VALUE, 1) AS SETTING_VALUE, ' +
		'    ROW_NUMBER() OVER (PARTITION BY  ACTION_CODE ORDER BY ACTION_CODE DESC) AS  r ' +
		'FROM     ' +
		'    "sap.ino.db.newnotification::v_notification_system_setting" AS mapsetting ' +
		'LEFT OUTER JOIN "sap.ino.db.iam::t_personalize_setting" AS setting ' +
		'    ON mapsetting.ACTION_CODE = setting.OBJECT_TYPE_CODE  ' +
		'    AND setting.TYPE_CODE = \'NEWNOTIFICATION\' ' +
		'    AND setting.IDENTITY_ID = ?  ' +
		'    WHERE mapsetting.ALLOW_EMAIL_NOTIFICATION = 1)' +
		'WHERE r=1 ' +
		'UNION ALL ' +
		'SELECT  ' +
		'    setting.ID, ' +
		'    \'NEWKEY\' AS ACTION_CODE, ' +
		'    \'NEWNOTIFICATION_KEY\' AS ACTION_TYPE_CODE, ' +
		'    IFNULL(setting.SETTING_VALUE, 1) AS SETTING_VALUE ' +
		'FROM "sap.ino.db.iam::t_personalize_setting" AS setting  ' +
		'WHERE  ' +
		'    IDENTITY_ID = ? AND TYPE_CODE = \'NEWNOTIFICATION\' AND OBJECT_TYPE_CODE = \'NEWNOTIFICATION_KEY\' ';
	var oResult = oHQ.statement(sMappingSelect).execute(userId, userId);
	return _.groupBy(oResult, function(data) {
		if (data.ACTION_TYPE_CODE.indexOf("_") > -1) {
			return "NEWKEY";
		} else {
			return data.ACTION_TYPE_CODE;
		}
	});
}

function updateNewNotificationSettings(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	var userId = oContext.getUser().ID;
	var oHQ = oContext.getHQ();
	var personalizeModel = AOF.getApplicationObject("sap.ino.xs.object.iam.PersonalizeSetting");
	var sSelectQuery =
		'SELECT ID,SETTING_VALUE FROM "sap.ino.db.iam::t_personalize_setting" WHERE IDENTITY_ID = ? AND TYPE_CODE = \'NEWNOTIFICATION\' AND OBJECT_TYPE_CODE = \'NEXT_TIME\' ';
	var aResult = oHQ.statement(sSelectQuery).execute(userId);

	var sKeyQuery =
		'SELECT ID,SETTING_VALUE FROM "sap.ino.db.iam::t_personalize_setting" WHERE IDENTITY_ID = ? AND TYPE_CODE = \'NEWNOTIFICATION\' AND OBJECT_TYPE_CODE = \'NEWNOTIFICATION_KEY\' ';
	var aKeyResult = oHQ.statement(sKeyQuery).execute(userId);

	var sCurrentTimeQuery =
		'SELECT VALUE FROM "sap.ino.db.notification::v_notification_email_scheduled_currentseconds"';
	var aCurrentTimeResult = oHQ.statement(sCurrentTimeQuery).execute();

	if (!oReq || !oReq.notification) {
		return;
	}

	if (oReq.notification.NEWKEY && oReq.notification.NEWKEY[0]) {
		//modify notification key
		if (aKeyResult && aKeyResult[0] && aKeyResult[0].ID) {
			personalizeModel.update({
				ID: aKeyResult[0].ID,
				SETTING_VALUE: oReq.notification.NEWKEY[0].SETTING_VALUE
			});
		} else {
			personalizeModel.create({
				IDENTITY_ID: userId,
				OBJECT_TYPE_CODE: "NEWNOTIFICATION_KEY",
				TYPE_CODE: 'NEWNOTIFICATION',
				SETTING_VALUE: oReq.notification.NEWKEY[0].SETTING_VALUE
			});
		}
		//modify notification next time
		if (aResult && aResult[0] && aResult[0].ID && aResult[0].ID > 0) {
			if (oReq.notification.NEWKEY[0].SETTING_VALUE === 0 || oReq.notification.NEWKEY[0].SETTING_VALUE === -1) {
				personalizeModel.del(aResult[0].ID);
			} else if (oReq.notification.NEWKEY[0].SETTING_VALUE !== aKeyResult[0].SETTING_VALUE) {
				personalizeModel.update({
					ID: aResult[0].ID,
					SETTING_VALUE: Number(aCurrentTimeResult[0].VALUE.toString()) + Number(oReq.notification.NEWKEY[0].SETTING_VALUE) * 24 * 60 * 60
				});
			}
		} else if(oReq.notification.NEWKEY[0].SETTING_VALUE > 0){
			personalizeModel.create({
				IDENTITY_ID: userId,
				OBJECT_TYPE_CODE: "NEXT_TIME",
				TYPE_CODE: 'NEWNOTIFICATION',
				SETTING_VALUE: Number(aCurrentTimeResult[0].VALUE.toString()) + Number(oReq.notification.NEWKEY[0].SETTING_VALUE) * 24 * 60 * 60
			});
		}
	}
	//delete all config
	var sDelQuery =
		'DELETE FROM "sap.ino.db.iam::t_personalize_setting" where identity_id = ? AND TYPE_CODE = \'NEWNOTIFICATION\' AND OBJECT_TYPE_CODE != \'NEWNOTIFICATION_KEY\' ';
	sDelQuery += ' AND OBJECT_TYPE_CODE != \'NEXT_TIME\' ';
	oHQ.statement(sDelQuery).execute(userId);
	oHQ.getConnection().commit();

	//modify idea config
	if (oReq.notification.IDEA) {
		_.each(oReq.notification.IDEA, function(oData) {
			updateNewNotificationSettingConfig(oData);
		});
	}
	//modify campaign config
	if (oReq.notification.CAMPAIGN) {
		_.each(oReq.notification.CAMPAIGN, function(oData) {
			updateNewNotificationSettingConfig(oData);
		});
	}

	if (oReq.notification.FOLLOW) {
		_.each(oReq.notification.FOLLOW, function(oData) {
			updateNewNotificationSettingConfig(oData);
		});
	}

	if (oReq.notification.STATUS) {
		_.each(oReq.notification.STATUS, function(oData) {
			updateNewNotificationSettingConfig(oData);
		});
	}

	function updateNewNotificationSettingConfig(oData) {
		if (!oData) {
			return;
		}
		personalizeModel.create({
			IDENTITY_ID: userId,
			OBJECT_TYPE_CODE: oData.ACTION_CODE,
			TYPE_CODE: 'NEWNOTIFICATION',
			SETTING_VALUE: Number(oData.SETTING_VALUE)
		});
	}
}

function getNewFeedsSettings(vKey, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	var userId = oContext.getUser().ID;
	var oHQ = oContext.getHQ();
	var sSelect = 'SELECT * FROM "sap.ino.db.iam::t_personalize_setting" WHERE IDENTITY_ID = ? AND TYPE_CODE = \'FEEDS\'';
	var aResult = oHQ.statement(sSelect).execute(userId);
	// 	var sSysSelect =
	// 		'SELECT TOP 1 VALUE FROM "sap.ino.db.basis::t_user_parameter" WHERE USER_ID = ? AND SECTION = \'notification\' AND KEY = \'mail\' ';
	// 	var aSysResult = oHQ.statement(sSysSelect).execute(userId);
	var oResult = _.object(_.pluck(aResult, 'OBJECT_TYPE_CODE'), _.map(_.pluck(aResult, 'SETTING_VALUE'), function(value) {
		return value;
	}));
	// 	var overallValue = true;
	// 	if (aSysResult && aSysResult.length > 0 && aSysResult[0].VALUE === "inactive") {
	// 		overallValue = false;
	// 	}
	// 	oResult.OVERALL_SETTING_VALUE = overallValue;
	return oResult;
}

function updateNewFeedsSettings(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	var userId = oContext.getUser().ID;
	var oHQ = oContext.getHQ();
	var personalizeModel = AOF.getApplicationObject("sap.ino.xs.object.iam.PersonalizeSetting");

	var sSelectNextTimeQuery =
		'SELECT ID,SETTING_VALUE FROM "sap.ino.db.iam::t_personalize_setting" WHERE IDENTITY_ID = ? AND TYPE_CODE = \'FEEDS\' AND OBJECT_TYPE_CODE = \'NEXT_TIME\' ';
	var aNextTimeResult = oHQ.statement(sSelectNextTimeQuery).execute(userId);

	var sSelectQuery = 'SELECT * from "sap.ino.db.iam::t_personalize_setting"  WHERE IDENTITY_ID = ? AND TYPE_CODE = \'FEEDS\'';
	var aResult = oHQ.statement(sSelectQuery).execute(userId);

	var sCurrentTimeQuery =
		'SELECT VALUE FROM "sap.ino.db.notification::v_notification_email_scheduled_currentseconds"';
	var aCurrentTimeResult = oHQ.statement(sCurrentTimeQuery).execute();

	var resultObj, feedSettingId;
	_.each(oReq.newfeeds, function(value, feed) {
		var settingValue = Number(value);
		resultObj = _.find(aResult, function(item) {
			return item.OBJECT_TYPE_CODE === feed;
		});
		feedSettingId = resultObj && resultObj.ID || undefined;
		if (!~feedTypeNewList.indexOf(feed)) {
			return false;
		}
		if (!feedSettingId) {
			return personalizeModel.create({
				IDENTITY_ID: userId,
				OBJECT_TYPE_CODE: feed,
				TYPE_CODE: 'FEEDS',
				SETTING_VALUE: settingValue,
				CHANGED_AT: oContext.getRequestTimestamp()
			});
		}
		if (resultObj.SETTING_VALUE !== settingValue) {
			return personalizeModel.update({
				ID: feedSettingId,
				SETTING_VALUE: settingValue,
				CHANGED_AT: oContext.getRequestTimestamp()
			});
		}
	});

	//modify notification next time
	if (aNextTimeResult && aNextTimeResult[0] && aNextTimeResult[0].ID && aNextTimeResult[0].ID > 0) {
		if (oReq.newfeeds.FEEDS_KEY === -1) {
			personalizeModel.del(aNextTimeResult[0].ID);
		} else {
			personalizeModel.update({
				ID: aNextTimeResult[0].ID,
				SETTING_VALUE: Number(aCurrentTimeResult[0].VALUE.toString()) + Number(oReq.newfeeds.FEEDS_KEY) * 24 * 60 * 60
			});
		}
	} else {
		personalizeModel.create({
			IDENTITY_ID: userId,
			OBJECT_TYPE_CODE: "NEXT_TIME",
			TYPE_CODE: 'FEEDS',
			SETTING_VALUE: Number(aCurrentTimeResult[0].VALUE.toString()) + Number(oReq.newfeeds.FEEDS_KEY) * 24 * 60 * 60
		});
	}
	// 	var sUpdateStatement = "UPSERT \"sap.ino.db.basis::t_user_parameter\" VALUES (?, ?, ?, ?) WITH PRIMARY KEY";
	// 	oHQ.statement(sUpdateStatement).execute(oContext.getUser().ID, "notification", "mail", Number(oReq.feeds.OVERALL_SETTING_VALUE) === 1 ?
	// 		"active" : "inactive");
}

function _getQuickLinkFilterInfo(sLink, oContext) {
	sLink = sLink || '';
	sLink = sLink.split('?');
	if (sLink.length >= 2) {
		sLink = sLink[1];
	}
	var aFilter = sLink !== '' ? sLink.split('&') : [];
	var oResult = {};
	var oHQ = oContext.getHQ();
	var sQuery = '';
	var oQueryResult;
	_.each(aFilter, function(sFilter) {
	    // only number and comma allowed to avoid insecure character
		var oRegex = /(.*)=([\d,]+)/;
		var aFound = sFilter.match(oRegex);
		if (aFound && aFound.length === 3) {
			var sKey = aFound[1].toUpperCase();
			var sValue = aFound[2];
			switch (sKey) {
				case 'CAMPAIGN':
					sQuery = `select descr.name from "sap.ino.db.campaign::t_campaign" as campaign 
    					left outer join "sap.ino.db.campaign::v_campaign_t_locale" as descr
                        on campaign.id = descr.campaign_id 
                        where campaign.id=` + sValue;
					oQueryResult = oHQ.statement(sQuery).execute();
					sValue = oQueryResult.length ? oQueryResult[0].NAME : sValue;
					break;
				case 'IDEAFORMID':
					break;
				case 'AUTHORS':
					sQuery = `select name from "sap.ino.db.iam::t_identity" where id in (` + sValue + `)`;
					oQueryResult = oHQ.statement(sQuery).execute();
					oQueryResult = _.map(oQueryResult, function(o) {
						return o.NAME;
					});
					sValue = oQueryResult.length ? oQueryResult.join(',') : sValue;
					break;
				case 'COACHS':
					sQuery = `select name from "sap.ino.db.iam::t_identity" where id in (` + sValue + `)`;
					oQueryResult = oHQ.statement(sQuery).execute();
					oQueryResult = _.map(oQueryResult, function(o) {
						return o.NAME;
					});
					sValue = oQueryResult.length ? oQueryResult.join(',') : sValue;
					break;
				default:
					break;
			}
			oResult[sKey] = sValue;
		}

	});
	return oResult;
}

function _isQuickLinkEnabled(sLink, sDefaultFilter, sFilter) {
	sDefaultFilter = sDefaultFilter || '';
	sFilter = sFilter || '';
	var aDefaultFilter = sDefaultFilter.split(',');
	var aFilter = sFilter.split(',');
	var aDisabledFilter = _.difference(aDefaultFilter, aFilter);
	var bEnabled = true;
	_.each(aDisabledFilter, function(sFilterName) {
		switch (sFilterName) {
			case 'CAMPAIGN':
				bEnabled = !/campaign=([^&]+)/.test(sLink);
				break;
			case 'CUSTOM_IDEA_FORM':
				bEnabled = !/ideaformid=([^&]+)/.test(sLink);
				break;
			case 'PHASE':
				bEnabled = !/phase=([^&]+)/.test(sLink);
				break;
			case 'STATUS_TYPE':
				bEnabled = !/status=([^&]+)/.test(sLink);
				break;
			case 'STATUS':
				bEnabled = !/subStatus=([^&]+)/.test(sLink);
				break;
			case 'VOTE_NUMBER':
				bEnabled = !/voteNum=([^&]+)/.test(sLink);
				break;
			case 'RESPONSIBILITY_LIST':
				bEnabled = !/respCode=([^&]+)/.test(sLink);
				break;
			case 'AUTHOR':
				bEnabled = !/authors=([^&]+)/.test(sLink);
				break;
			case 'COACH':
				bEnabled = !/coaches=([^&]+)/.test(sLink);
				break;
			case 'DUE_DATE':
				bEnabled = !/dueFrom=([^&]+)/.test(sLink) || !/dueTo=([^&]+)/.test(sLink);
				break;
			default:
				break;
		}
	});
	return bEnabled;
}

function getQuickLinkSettings(vKey, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
    var aTypeCode = ['QUICK_LINK_STANDARD_IDEA','QUICK_LINK_CUSTOM_IDEA','QUICK_LINK_STANDARD_CAMPAIGN','QUICK_LINK_CUSTOM_CAMPAIGN'];
	var userId = oContext.getUser().ID;
	var oHQ = oContext.getHQ();
	var sTypeCode = Array.isArray(vKey.TYPE_CODE) && vKey.TYPE_CODE.length > 0 ? _.map(vKey.TYPE_CODE, function(v) {
	    if(aTypeCode.indexOf(v) > -1){
		    return "'" + v + "'";
	    }
	}).join(',') : "'QUICK_LINK_STANDARD_IDEA','QUICK_LINK_CUSTOM_IDEA','QUICK_LINK_STANDARD_CAMPAIGN','QUICK_LINK_CUSTOM_CAMPAIGN'";
	var sSelectQuery =
		`SELECT setting.ID,setting.OBJECT_TYPE_CODE,setting.SETTING_VALUE AS ACTIVE,setting.TYPE_CODE,setting.SEQUENCE,quicklink.LINK_TEXT,quicklink.LINK_URL, 1 as ENABLED
	    FROM "sap.ino.db.iam::t_personalize_setting" AS setting 
    	LEFT JOIN "sap.ino.db.iam::t_personalize_setting_quicklink" AS quicklink 
    	ON setting.ID = quicklink.ID 
    	WHERE IDENTITY_ID = ? 
    	AND setting.TYPE_CODE IN (` +
		sTypeCode + `)`;
	var sIdeaFilterQuery =
		`select default_value, value from "sap.ino.db.basis::v_local_system_setting_full" where code = 'sap.ino.config.IDEA_FILTERS_CONFIG'`;
	var aIdeaFilter = oHQ.statement(sIdeaFilterQuery).execute();
	var aQuickLink = oHQ.statement(sSelectQuery).execute(userId);
	_.each(aQuickLink, function(oQuickLink) {
		if (oQuickLink.LINK_URL) {
			// remove campaign id from path
			oQuickLink.LINK_URL = oQuickLink.LINK_URL.replace(/campaign\/\d+\//, '');
			if (aIdeaFilter[0]) {
				oQuickLink.ENABLED = _isQuickLinkEnabled(oQuickLink.LINK_URL, aIdeaFilter[0].DEFAULT_VALUE, aIdeaFilter[0].VALUE) ? 1 : 0;
			}
			oQuickLink.FILTER_INFO = _getQuickLinkFilterInfo(oQuickLink.LINK_URL, oContext);
		}
	});
	return aQuickLink;
}

function _updateQuickLink(oParameter, oContext, bDelete, addMessage) {
	var oHQ = oContext.getHQ();

	var sSelectQuery = 'SELECT * FROM "sap.ino.db.iam::t_personalize_setting_quicklink" WHERE ID=?';
	var aResult = oHQ.statement(sSelectQuery).execute(oParameter[2]);

	var sUpdateSql;
	if (aResult.length) {
		if (bDelete) {
			sUpdateSql = 'DELETE FROM "sap.ino.db.iam::t_personalize_setting_quicklink" WHERE ID=?';
		} else {
			sUpdateSql = 'UPDATE "sap.ino.db.iam::t_personalize_setting_quicklink" SET LINK_TEXT=?, LINK_URL=? WHERE ID=?';
		}
	} else {
		sUpdateSql = 'INSERT INTO "sap.ino.db.iam::t_personalize_setting_quicklink" (LINK_TEXT,LINK_URL,ID) VALUES (?,?,?)';
	}
	try {
		if (bDelete) {
			oHQ.statement(sUpdateSql).execute(oParameter[2]);
		} else {
			oHQ.statement(sUpdateSql).execute(oParameter);
		}
	} catch (e) {
		if (e.code === 274) {
			addMessage(Message.MessageSeverity.Error, IAMMessage.QUICK_LINK_URL_MAX_LENGTH_VIOLATED, oParameter[2], "Root", undefined, [oParameter[1]]);
		}
		throw e;
	}
}

function updateQuickLinkSettings(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	var userId = oContext.getUser().ID;
	var oHQ = oContext.getHQ();
	var personalizeModel = AOF.getApplicationObject("sap.ino.xs.object.iam.PersonalizeSetting");

	var sSelectQuery =
		`SELECT * from "sap.ino.db.iam::t_personalize_setting" AS setting 
    	LEFT JOIN "sap.ino.db.iam::t_personalize_setting_quicklink" as quicklink 
    	ON setting.ID = quicklink.ID 
    	WHERE setting.IDENTITY_ID = ? 
    	AND setting.TYPE_CODE IN ('QUICK_LINK_STANDARD_IDEA','QUICK_LINK_CUSTOM_IDEA','QUICK_LINK_STANDARD_CAMPAIGN','QUICK_LINK_CUSTOM_CAMPAIGN')`;
	var aResult = oHQ.statement(sSelectQuery).execute(userId);

	_.each(oReq, function(value) {
		var resultObj = _.find(aResult, function(o) {
			return o.ID === value.ID || (o.TYPE_CODE.indexOf('QUICK_LINK_STANDARD_') >= 0 && o.TYPE_CODE === value.TYPE_CODE && o.OBJECT_TYPE_CODE ===
				value.OBJECT_TYPE_CODE);
		});
		var vKey = resultObj && resultObj.ID || undefined;
		var oResponse;
		var bDelete = value.DELETE === 1;
		var bStandard = value.TYPE_CODE.indexOf('QUICK_LINK_STANDARD_') >= 0;
		if (!vKey) { //create
			oResponse = personalizeModel.create({
				ID: -1,
				IDENTITY_ID: userId,
				OBJECT_TYPE_CODE: value.OBJECT_TYPE_CODE,
				TYPE_CODE: value.TYPE_CODE,
				SETTING_VALUE: value.ACTIVE,
				SEQUENCE: value.SEQUENCE
			});
			vKey = oResponse.generatedKeys && oResponse.generatedKeys[-1];
		} else {
			if (value.ID != vKey) {
				addMessage(Message.MessageSeverity.Error, IAMMessage.QUICK_LINK_STANDARD_ITEM_EXISTED, vKey, "Root", undefined, [resultObj.OBJECT_TYPE_CODE]);
				return;
			}
			if (bDelete) { //delete
				if (bStandard) {
					// forbid to delete standard item
					addMessage(Message.MessageSeverity.Error, IAMMessage.QUICK_LINK_STANDARD_NOT_ALLOW_TO_DELETE, value.ID, "Root");
				} else {
					oResponse = personalizeModel.del(vKey);
				}
			} else { //update
				if (resultObj.ACTIVE !== value.ACTIVE || resultObj.SEQUENCE !== value.SEQUENCE) {
					oResponse = personalizeModel.update({
						ID: vKey,
						SETTING_VALUE: value.ACTIVE,
						SEQUENCE: value.SEQUENCE
					});
				}
			}
		}
		addMessage(oResponse.messages);
		if (!bStandard) {
			_updateQuickLink([value.LINK_TEXT, value.LINK_URL, vKey], oContext, bDelete, addMessage);
		}
		return oResponse;
	});

}

function deleteQuickLinkSettings(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	var userId = oContext.getUser().ID;
	var aKey = _.uniq(_.map(oReq, 'ID'));
	var oHQ = oContext.getHQ();

	// delete quick link setting
	var sSelectQuery = `SELECT * FROM "sap.ino.db.iam::t_personalize_setting"
    	WHERE IDENTITY_ID = ? 
    	AND ID IN (` + aKey.join(',') +
		`)
    	AND TYPE_CODE IN ('QUICK_LINK_STANDARD_IDEA','QUICK_LINK_CUSTOM_IDEA','QUICK_LINK_STANDARD_CAMPAIGN','QUICK_LINK_CUSTOM_CAMPAIGN')`;
	var aResult = oHQ.statement(sSelectQuery).execute(userId);
	var oStandardResult = _.find(aResult, function(o) {
		return o.TYPE_CODE.indexOf('QUICK_LINK_STANDARD_') >= 0;
	});
	var sResult = '';
	var sDelQuery;
	aResult = _.map(aResult, 'ID');
	if (aResult.length && aResult.length === aKey.length) {
		if (oStandardResult) {
			// forbid to delete standard item
			addMessage(Message.MessageSeverity.Error, IAMMessage.QUICK_LINK_STANDARD_NOT_ALLOW_TO_DELETE, oStandardResult.ID, "Root");
		} else {
			// deletion begins
			sResult = aResult.join(',');
			sDelQuery = `DELETE FROM "sap.ino.db.iam::t_personalize_setting" WHERE IDENTITY_ID = ? AND ID IN (` + sResult + `)`;
			try {
				oHQ.statement(sDelQuery).execute(userId);
			} catch (e) {
				throw e;
			}
			sDelQuery = `DELETE FROM "sap.ino.db.iam::t_personalize_setting_quicklink" WHERE ID IN (` + sResult + `)`;
			try {
				oHQ.statement(sDelQuery).execute();
			} catch (e) {
				throw e;
			}

		}
	} else {
		sResult = _.difference(aKey, aResult).join(',');
		addMessage(Message.MessageSeverity.Error, IAMMessage.QUICK_LINK_OBJECT_NOT_FOUND, sResult, "Root", undefined, [sResult]);
	}
}

//END