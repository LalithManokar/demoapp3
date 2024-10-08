var check = $.import("sap.ino.xs.aof.lib", "check");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var aof = $.import("sap.ino.xs.aof.core", "framework");
var DataType = $.import("sap.ino.xs.object.basis", "Datatype").DataType;
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var BasisMessage = $.import("sap.ino.xs.object.basis", "message");
var Message = $.import("sap.ino.xs.aof.lib", "message");
var AttachmentAssignment = $.import("sap.ino.xs.object.attachment", "Assignment");

var LocalSystemSetting = this.LocalSystemSetting = {
	EXPERT_FINDER_ACTIVE: "sap.ino.config.EXPERT_FINDER_ACTIVE",
	USAGE_REPORTING_ACTIVE: "sap.ino.config.USAGE_REPORTING_ACTIVE"
};

this.definition = {
	actions: {
		create: {
			authorizationCheck: false,
			historyEvent: "LOCAL_SETTING_CREATED"
		},
		update: {
			authorizationCheck: false,
			//executionCheck: RewardUnitCodeCheck,
			historyEvent: "LOCAL_SETTING_UPDATED"
		},
		del: {
			authorizationCheck: false,
			historyEvent: "LOCAL_SETTING_DELETED"
		},
		read: {
			authorizationCheck: false
		}
	},
	Root: {
		table: "sap.ino.db.basis::t_local_system_setting",
		sequence: "sap.ino.db.basis::s_local_system_setting",
		historyTable: "sap.ino.db.basis::t_local_system_setting_h",
		consistencyChecks: [check.duplicateAlternativeKeyCheck("CODE", BasisMessage.VALUE_OPTION_DUPLICATE_CODE, true), validSettingCheck],
		determinations: {
			onModify: [determine.systemAdminData, updateAnonymousSettingForAllCanpaigns, updateFeedEmailLatestTime]
		},
		nodes: {
			Attachments: AttachmentAssignment.node(AttachmentAssignment.ObjectType.LocalSystemSetting)
		},
		attributes: {
			CODE: {
				required: true,
				foreignKeyTo: "sap.ino.xs.object.basis.SystemSetting.Root"
			},
			CREATED_AT: {
				readOnly: true
			},
			CREATED_BY_ID: {
				readOnly: true
			},
			CHANGED_AT: {
				readOnly: true
			},
			CHANGED_BY_ID: {
				readOnly: true
			}
		}
	}
};

function validSettingCheck(vKey, oLocalSetting, addMessage, oContext) {
	var Setting = aof.getApplicationObject("sap.ino.xs.object.basis.SystemSetting");

	var oSettingInstance = Setting.read(oLocalSetting.CODE);
	if (!oSettingInstance) {
		addMessage(Message.MessageSeverity.Error, BasisMessage.LOCAL_SETTINGS_CODE_NOT_EXISTING, vKey);
		return;
	}
	if (oSettingInstance.HAS_LOCAL_SYSTEM_SETTING === 0) {
		addMessage(Message.MessageSeverity.Error, BasisMessage.LOCAL_SETTINGS_NO_LOCAL_SETTINGS, vKey);
		return;
	}
	var bValid = false;
	switch (oSettingInstance.DATATYPE_CODE) {
		case DataType.Boolean:
			bValid = _.toBool(oLocalSetting.VALUE) !== undefined;
			break;
		case DataType.Numeric:
			bValid = _.isFinite(oLocalSetting.VALUE);
			break;
		case DataType.Integer:
			bValid = _.isInteger(oLocalSetting.VALUE);
			break;
		case DataType.Text:
		case DataType.Code:
		case DataType.Token:
			bValid = oLocalSetting.VALUE === null || _.isString(oLocalSetting.VALUE);
			break;
		case DataType.Blob:
			bValid = _.isString(oLocalSetting.VALUE + "");
			break;
		default:
			break;
	}
	if (!bValid) {
		addMessage(Message.MessageSeverity.Error, BasisMessage.LOCAL_SETTINGS_WRONG_TYPE, vKey);
	}

	if (bValid && (oSettingInstance.DATATYPE_CODE === DataType.Text || oSettingInstance.DATATYPE_CODE === DataType.Blob)) {
		if (oLocalSetting.VALUE !== null && oLocalSetting.VALUE.length < 1) {
			addMessage(Message.MessageSeverity.Error, BasisMessage.VALUE_OPTION_INVALID_VALUE, vKey);
		}
	}
}

function updateFeedEmailLatestTime(vKey, oLocalSetting, oWorkObject, fnMessage, fnHandle, oContext) {
    // if(oLocalSetting && oWorkObject && oLocalSetting.CODE === 'sap.ino.config.SWITCH_OFF_FEED_EMAIL' && oLocalSetting.VALUE !== oWorkObject.VALUE){
    //     var oHQ = oContext.getHQ();
    //     oHQ.procedure("SAP_INO", "sap.ino.db.feed::p_feed_latest_time").execute({});
    // }
}

function updateAnonymousSettingForAllCanpaigns(vKey, oLocalSetting, oWorkObject, fnMessage, fnHandle, oContext) {
	var oHQ = oContext.getHQ();
	const aAnonymousSettingCode = ['sap.ino.config.ANONYMOUS_ENABLE', 'sap.ino.config.ANONYMOUS_FOR_ENABLE_ALL',
		'sap.ino.config.ANONYMOUS_FOR_ENABLE_PARTLY', 'sap.ino.config.ANONYMOUS_FOR_PARTLY_OPTION'];
	if (!!~aAnonymousSettingCode.indexOf(oLocalSetting.CODE) && (!oWorkObject || oWorkObject.VALUE !== oLocalSetting.VALUE)) {
		var sUpdateSql, sAnonymousTextCode;
		switch (oLocalSetting.CODE) {
			case aAnonymousSettingCode[0]:
				sUpdateSql = 'UPDATE \"sap.ino.db.campaign::t_campaign\" SET IS_OPEN_ANONYMOUS_FUNCTION = ?';
				oHQ.statement(sUpdateSql).execute(oLocalSetting.VALUE);
				break;
			case aAnonymousSettingCode[1]:
				sAnonymousTextCode = 'ANONYMOUS_FOR_ALL';
				sUpdateSql = 'DELETE FROM \"sap.ino.db.campaign::t_campaign_anonymous_text\" WHERE CODE = ?';
				oHQ.statement(sUpdateSql).execute(sAnonymousTextCode);
				break;
			case aAnonymousSettingCode[2]:
				sAnonymousTextCode = 'ANONYMOUS_FOR_ALL';
				sUpdateSql = 'DELETE FROM \"sap.ino.db.campaign::t_campaign_anonymous_text\" WHERE CODE != \'NOT_ANONYMOUS\' AND CODE != ? ';
				oHQ.statement(sUpdateSql).execute(sAnonymousTextCode);
				break;
			case aAnonymousSettingCode[3]:
				var sOtherAnonymousOption = ',NOT_ANONYMOUS,ANONYMOUS_FOR_ALL,NOT_ANONYMOUS_CAMPAIGN_MANAGER';
				var alAnonymousText = oLocalSetting.VALUE.concat(sOtherAnonymousOption);
				sUpdateSql = oHQ.procedure("SAP_INO", "sap.ino.db.campaign::p_update_campaign_partially_anonymous_text");
				sUpdateSql.execute(alAnonymousText);
				break;
		}
	}
}

// function RewardUnitCodeCheck(vKey, oChangeRequest, oWorkObject, oPersistedWorkObject, addMessage, oContext){
//      /*
//     * The  following logic add by Dino
//     * Behavior is when the Reward be checked, the reward unit code cannot be empty.
//     */
//     //  var oStatement = oContext.getHQ().statement('select value from "sap.ino.db.basis::t_local_system_setting" where code = "sap.ino.config.REWARD_UNIT_CODE"');
//     //     var aResult = oStatement.execute();
//     // if(oWorkObject.CODE === "sap.ino.config.REWARD_ACTIVE" && oWorkObject.VALUE === 1){

//     //     if (aResult.length){
//     //         fnMessage(Message.MessageSeverity.Error, BasisMessage.VALUE_REWARD_UNIT_CODE_INVALID_VALUE, vKey);
//     //     }
//     // }
//     // 
//     var oStatement = oContext.getHQ().statement('select value from "sap.ino.db.basis::t_local_system_setting" where code = ?');
//     var aRewardActiveResult = oStatement.execute("sap.ino.config.REWARD_ACTIVE");
//     var aRewardUnitResult = oStatement.execute("sap.ino.config.REWARD_UNIT_CODE");
//     var rewardActiveValue = aRewardActiveResult[0].VALUE;
//     var rewardUnitValue = aRewardUnitResult[0].VALUE;
//     // if (rewardActiveValue === '1' && rewardUnitValue === null){
//     //     fnMessage(Message.MessageSeverity.Error, BasisMessage.VALUE_REWARD_UNIT_CODE_INVALID_VALUE, vKey);
//     // }
//     // if (oWorkObject.CODE === 'sap.ino.com.config.REWARD_ACTIVE' && oWorkObject.VALUE === '1'){
//     //     if (oWorkObject.CODE === 'sap.ino.com.config.REWARD_UNIT_CODE' && oWorkObject.VALUE === null){
//     //         fnMessage(Message.MessageSeverity.Error, BasisMessage.VALUE_REWARD_UNIT_CODE_INVALID_VALUE, vKey);
//     //     }
//     // }
//     if (oWorkObject.CODE === 'sap.ino.config.REWARD_UNIT_CODE'){
//         if (oWorkObject.VALUE === '' && rewardActiveValue === '1'){
//             addMessage(Message.MessageSeverity.Error, BasisMessage.VALUE_REWARD_UNIT_CODE_INVALID_VALUE, vKey);
//         }
//     }
//     //if (oWorkObject.CODE === 'sap.ino.config.REWARD_ACTIVE' && oWorkObject.VALUE === '1'){
//     if(rewardActiveValue === '1'){
//         // if (oWorkObject.CODE === 'sap.ino.config.REWARD_ACTIVE' && oWorkObject.VALUE === '1'){
//         //     return;
//         // }
//         if (oWorkObject.CODE === 'sap.ino.config.REWARD_UNIT_CODE' && oWorkObject.VALUE === ''){
//             addMessage(Message.MessageSeverity.Error, BasisMessage.VALUE_REWARD_UNIT_CODE_INVALID_VALUE, vKey);
//         }
//         else{
//             if (rewardUnitValue === null && oWorkObject.CODE === 'sap.ino.config.REWARD_UNIT_CODE' && oWorkObject.VALUE !== ''){
//                 addMessage(Message.MessageSeverity.Error, BasisMessage.VALUE_REWARD_UNIT_CODE_INVALID_VALUE, vKey);
//             }
//         }
//     }

// }