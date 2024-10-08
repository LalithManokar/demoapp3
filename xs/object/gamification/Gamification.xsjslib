const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var IAMMessage = $.import("sap.ino.xs.object.iam", "message");

const aObjectTypeCode = ['AUTHOR', 'EXPERT', 'COMMENT', 'VOTE'];

this.definition = {
	Root: {
		table: "sap.ino.db.gamification::t_gamification_setting",
		sequence: "sap.ino.db.gamification::s_gamification_setting",
		determinations: {
			onModify: [determine.systemAdminData]
		},
		attributes: {
			ENABLE_GAMIFICATION: {
				required: true
			},
			ENABLE_LEADERBOARD: {
				required: true
			},
			PUBLISH_BADGE: {
				required: false
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
			authorizationCheck: false
		},
		del: {
			authorizationCheck: false
		},
		saveGamificationSetting: {
			authorizationCheck: false,
			execute: saveGamificationSetting,
			isStatic: true
		},
		getGamificationSetting: {
			authorizationCheck: false,
			execute: getGamificationSetting,
			isStatic: true
		}
	}
};

function saveGamificationSetting(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	var oGamificationSetting = oReq.GAMIFICATION_SETTING ? oReq.GAMIFICATION_SETTING : null;
	if (oGamificationSetting) {
		var GamificationAO = AOF.getApplicationObject("sap.ino.xs.object.gamification.Gamification");
		var oHQ = oContext.getHQ();
		var sIdQuery =
			'SELECT ID FROM "sap.ino.db.gamification::t_gamification_setting"';
		var aResult = oHQ.statement(sIdQuery).execute();
		if (aResult.length > 0) {
			GamificationAO.update({
				ID: oGamificationSetting.ID,
				ENABLE_GAMIFICATION: oGamificationSetting.ENABLE_GAMIFICATION,
				ENABLE_LEADERBOARD: oGamificationSetting.ENABLE_LEADERBOARD,
				PUBLISH_BADGE: oGamificationSetting.PUBLISH_BADGE
			});
		} else {
			GamificationAO.create({
				ID: -1,
				ENABLE_GAMIFICATION: oGamificationSetting.ENABLE_GAMIFICATION,
				ENABLE_LEADERBOARD: oGamificationSetting.ENABLE_LEADERBOARD,
				PUBLISH_BADGE: oGamificationSetting.PUBLISH_BADGE
			});
		}

	}

}

function getGamificationSetting(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	var oHQ = oContext.getHQ();
	var defaultSettingObj = {
		ENABLE_GAMIFICATION: 0,
		ENABLE_LEADERBOARD: 0,
		PUBLISH_BADGE: '',
		ALL_DIMENSION: []
	};
	const allActiveDimension = [];
	var sGamificationDimensionsQuery =
		'SELECT ID,NAME FROM "sap.ino.db.gamification::t_dimension" where status = 1 ';
	var aGamificationDimensionsResult = oHQ.statement(sGamificationDimensionsQuery).execute();
	aGamificationDimensionsResult.forEach(function(item) {
		allActiveDimension.push({
			ID: item.ID,
			NAME: item.NAME
		});
	});

	var sGamificationSettingQuery =
		'SELECT * FROM "sap.ino.db.gamification::t_gamification_setting" ';
	var aGamificationSettingResult = oHQ.statement(sGamificationSettingQuery).execute();
	if (aGamificationSettingResult.length > 0) {
		aGamificationSettingResult[0].ALL_DIMENSION = allActiveDimension;
	} else {
		defaultSettingObj.ALL_DIMENSION = allActiveDimension;
	}

	return aGamificationSettingResult.length > 0 ? aGamificationSettingResult[0] : defaultSettingObj;
}

//END