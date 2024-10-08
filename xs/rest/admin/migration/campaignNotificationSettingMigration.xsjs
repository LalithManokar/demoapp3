// campaignNotificationSettingMigration.xsjs
const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const oHQ = hQuery.hQuery(oConn);
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var ContentType = {
	Plain: "text/plain",
	JSON: "application/json"
};

if ($.request.method !== $.net.http.POST) {
	$.response.status = $.net.http.METHOD_NOT_ALLOWED;
	$.response.contentType = ContentType.Plain;
	$.response.setBody("Method not supported");
} else {
	try {
		var oWebReq = parseJSON($.request);
		checkParams(oWebReq);
		checkSourceCampaginId(oWebReq);
		migrateData(oWebReq);
		$.response.status = $.net.http.OK;
		$.response.contentType = ContentType.JSON;
		$.response.setBody("migrate data sucessfully!");
	} catch (e) {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.contentType = ContentType.JSON;
		$.response.setBody(e.toString());
	}
}

function parseJSON(oWebReq) {
	if (!oWebReq.body) {
		throw new Error("miss request body.");
	}

	var bodyAsString = oWebReq.body.asString();
	return JSON.parse(bodyAsString);
}

function checkParams(oReq) {
	if (!oReq.SOURCE_CAMP_ID) {
		throw new Error("miss SOURCE_CAMP_ID.");
	}
	if (Number.isNaN(Number(oReq.SOURCE_CAMP_ID))) {
		throw new Error("SOURCE_CAMP_ID is not number.");
	}
	if (!oReq.TARGET_CAMP_ID) {
		throw new Error("miss TARGET_CAMP_ID.");
	}
	if (!_.isArray(oReq.TARGET_CAMP_ID)) {
		throw new Error("TARGET_CAMP_ID is an array.");
	}
	if (oReq.TARGET_CAMP_ID.length <= 0) {
		throw new Error("no element in array TARGET_CAMP_ID.");
	}
	_.each(oReq.TARGET_CAMP_ID, function(oCampaignID) {
		if (Number.isNaN(Number(oCampaignID))) {
			throw new Error("TARGET_CAMP_ID(" + oCampaignID + ") is not number.");
		}
	});
	if (_.contains(oReq.TARGET_CAMP_ID, oReq.SOURCE_CAMP_ID)) {
		throw new Error("SOURCE_CAMP_ID in array TARGET_CAMP_ID.");
	}
}

function getCampPhaseData(oReq) {
	var sSql =
		`
    SELECT
	"ID",
	"CAMPAIGN_ID",
	"PHASE_CODE",
	"SEQUENCE_NO",
	"NEXT_PHASE_CODE",
	"STATUS_MODEL_CODE" 
FROM "SAP_INO"."sap.ino.db.campaign::t_campaign_phase" WHERE 1!=1 `;
	var aParams = [oReq.SOURCE_CAMP_ID];
	aParams = aParams.concat(oReq.TARGET_CAMP_ID);
	_.each(aParams, function() {
		sSql += " OR CAMPAIGN_ID = ? ";
	});
	var aCamps = oHQ.statement(sSql).execute(aParams);
	if (!aCamps || aCamps.length <= 0) {
		throw new Error("Invalid campaign ids.");
	}
	return aCamps;
}

function checkCampPhase(aCampPhase, oReq) {
	var aSourceCampPhase = _.filter(aCampPhase, function(oCampPhase) {
		return oCampPhase.CAMPAIGN_ID === oReq.SOURCE_CAMP_ID;
	});
	if (!aSourceCampPhase || aSourceCampPhase.length <= 0) {
		throw new Error("Invalid source campaign id.");
	}
	var aGroupCampPhase = _.groupBy(aCampPhase, function(oCampPhase) {
		return oCampPhase.CAMPAIGN_ID;
	});
	var aInvalidTarget = [],
		aInvalidCamp = [];
	_.each(aGroupCampPhase, function(oGrpCampPhase, key) {
		if (!oGrpCampPhase || oGrpCampPhase.length <= 0) {
			throw new Error("Invalid target campaign ids:" + key);
		}
		var bInvalidCamp = true;
		_.each(aSourceCampPhase, function(oSourceCampPhase) {
			var aCurrentFilterCampPhase = _.where(oGrpCampPhase, {
				"PHASE_CODE": oSourceCampPhase.PHASE_CODE,
				"SEQUENCE_NO": oSourceCampPhase.SEQUENCE_NO,
				"NEXT_PHASE_CODE": oSourceCampPhase.NEXT_PHASE_CODE,
				"STATUS_MODEL_CODE": oSourceCampPhase.STATUS_MODEL_CODE
			});
			if (!aCurrentFilterCampPhase || aCurrentFilterCampPhase.length !== 1) {
				aInvalidTarget.push(oGrpCampPhase);
				bInvalidCamp = false;
			}
		});
		if (!bInvalidCamp) {
			aInvalidCamp.push(key);
		}
	});
	if (aInvalidTarget.length > 0) {
		throw new Error(JSON.stringify({
			"SOURCE_PHASE": aSourceCampPhase,
			"TARGET_CAMPAIGN": aInvalidCamp
		}));
	}
}

function checkSourceCampaginId(oReq) {
	var aCampPhase = getCampPhaseData(oReq);
	checkCampPhase(aCampPhase, oReq);
}

function migrateData(oReq) {
	oHQ
		.procedure("SAP_INO", "sap.ino.db.newnotification::p_notification_campaign_setting_migration")
		.execute({
			"IT_TARGET_CAMPAIGN_ID": _.map(oReq.TARGET_CAMP_ID, function(id) {
				return {
					"ID": id
				};
			}),
			"IT_SOURCE_CAMPAIGN_ID": oReq.SOURCE_CAMP_ID
		});
		oHQ.getConnection().commit();
}

//end