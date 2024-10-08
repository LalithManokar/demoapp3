const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
var trace = $.import("sap.ino.xs.xslib", "trace");
var debug = function debug(line) {
    trace.debug("sap.ino.xs.xslib.performance", line);
};

const systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");

const ContentType = {
    Plain : "text/plain",
    JSON : "application/json"
};

const message = $.import("sap.ino.xs.aof.lib", "message");
const MessageSeverity = message.MessageSeverity;

function getHDBVersion(oHQ) {
	const aDBResult = oHQ.statement("select version from SYS.M_DATABASE").execute();
	if (aDBResult.length < 1) {
		//throw new Error("DB Version could not be determined");
		return null;
	} else {
		const sHDBVersion = aDBResult[0].VERSION;
		const aHDBVersion = sHDBVersion.split(".");
		const oHDBVersion = {
			HANA_VERSION: parseInt(aHDBVersion[0], 0),
			HANA_VERSION_SP: parseInt(aHDBVersion[2], 0),
			HANA_VERSION_PATCH: parseInt(aHDBVersion[3], 0)
		};
		return oHDBVersion;
	}
}

function getAllHints(oHQ) {
    return oHQ.statement("select " + 
        " to_int(hana_version) as hana_version," + 
        " to_int(hana_version_sp) as hana_version_sp," +
        " statement_hash," + 
        " hints" + 
        " from \"sap.ino.db.basis::t_config_hint\"")
        .execute();
}

function getPlanCacheEntries(aHashes, oHQ) {
    var sPlanCacheSQL = 
    "select " + 
    "    plan_cache.plan_id, " + 
    "    plan_cache.statement_hash as plan_statement_hash, " + 
    "    plan_cache.is_pinned_plan, " + 
    "    pinned_plan.hint_string as plan_hint_string " + 
    "from m_sql_plan_cache as plan_cache " + 
    "left outer join pinned_sql_plans as pinned_plan " + 
    "   on pinned_plan.pinned_plan_id = plan_cache.pinned_plan_id " +
    "where " + 
    "   plan_cache.statement_hash = ? and " + 
    "   plan_cache.is_valid = 'TRUE' and " + 
    "   plan_cache.port in (select port from m_services where service_name = 'indexserver')";

    return _.flatten(_.map(aHashes, function(sHash) {
        return oHQ.statement(sPlanCacheSQL).execute(sHash);
    }));
}

/** 
 * Determines query hints that should be pinned and unpinned
 */
function determinePinActions(oHDBVersion, aHints, aPlanCache) {
    var oResult = {
        hintsToPin : [],
        hintsToUnpin : []
    };

    if (!aPlanCache || aPlanCache.length === 0) {
        return oResult;
    }

    // Hints for higher HDB version should not be considered
    var aPotentialHints = _.filter(aHints, function compareHanaVersion(oHint) {
        return oHint.HANA_VERSION <= oHDBVersion.HANA_VERSION && 
               oHint.HANA_VERSION_SP <= oHDBVersion.HANA_VERSION_SP;
    });

    var oHintsByHash = _.groupBy(aPotentialHints, function groupByHash(oHint){
        return oHint.STATEMENT_HASH;
    });
    
    var mTargetHintByHash = {};

    // find out the most recent hints that are given per hash
    _.each(oHintsByHash, function(aHashHints, sHash) {
        aHashHints = _.unique(aHashHints, false, function(oHint){
            return oHint.HANA_VERSION + "_" + oHint.HANA_VERSION_SP;
        });

        aHashHints.sort(function(oHintA, oHintB){
            if (oHintA.HANA_VERSION < oHintB.HANA_VERSION) { 
                return -1;
            }

            if (oHintA.HANA_VERSION > oHintB.HANA_VERSION) {
                return 1;
            }

            if (oHintA.HANA_VERSION === oHintB.HANA_VERSION) {
                return oHintA.HANA_VERSION_SP < oHintB.HANA_VERSION_SP ? -1 : 1;
            }
        });
        mTargetHintByHash[sHash] = _.last(aHashHints).HINTS;
    });

    debug("Target hints determined: " + JSON.stringify(mTargetHintByHash));

    var mPinActions = _.groupBy(aPlanCache, function(oPlanCache) {
        var sTargetHint = mTargetHintByHash[oPlanCache.PLAN_STATEMENT_HASH];
        if (!sTargetHint || sTargetHint.toUpperCase() === "NONE" ) {
            return "unpin";
        }

        if (oPlanCache.IS_PINNED_PLAN === 'FALSE') {
            return "pin";
        }

        // Compare current applied hints with target hint
        // PLAN_HINT_STRING looks as follows: [Version]0.2[HintInfo] WITH HINT (no_join_thru_join)
        oPlanCache.PLAN_HINT_STRING = oPlanCache.PLAN_HINT_STRING || "";
        if (oPlanCache.IS_PINNED_PLAN === 'TRUE' && 
            oPlanCache.PLAN_HINT_STRING.indexOf("(" + sTargetHint + ")") === -1) {
            return "pin";
        }
        return "noop";
    });

    debug("Pin actions determined: " + JSON.stringify(mPinActions));

    const fnProjectResult = function(oPlan) {
        return {
            PLAN_ID : oPlan.PLAN_ID,
            STATEMENT_HASH : oPlan.PLAN_STATEMENT_HASH,
            HINTS : mTargetHintByHash[oPlan.PLAN_STATEMENT_HASH]
        };
    };

    oResult.hintsToPin   = (mPinActions.pin   && _.map(mPinActions.pin,   fnProjectResult)) || [];
    oResult.hintsToUnpin = (mPinActions.unpin && _.map(mPinActions.unpin, fnProjectResult)) || [];
    return oResult;
}


function getPinSql(sPlanId, sHint) {
	return "ALTER SYSTEM PIN SQL PLAN CACHE ENTRY " + sPlanId + " WITH HINT(" + sHint + ")";
}

function pinHints(aHints,oHQ) {
    _.each(aHints, function(oHint) {
        var sPinSQL = getPinSql(oHint.PLAN_ID, oHint.HINTS);
        debug("About to pin plan: " + oHint.PLAN_ID);
        oHQ.statement(sPinSQL).execute();
        debug("Pinned plan " + oHint.PLAN_ID + " with hints " + oHint.HINTS);
    });
}

function getUnpinSql(sPlanId) {
	return "ALTER SYSTEM UNPIN SQL PLAN CACHE ENTRY " + sPlanId;
}

function unpinHints(aHints,oHQ) {
    _.each(aHints, function(oHint) {
        var sUnpinSQL = getUnpinSql(oHint.PLAN_ID);
        debug("About to unpin plan " + oHint.PLAN_ID);
        oHQ.statement(sUnpinSQL).execute();
        debug("Unpinned plan " + oHint.PLAN_ID);
    });
}

function setupHints(oHQ, oMsgBuf) {
        var oHDBVersion = getHDBVersion(oHQ);
        if (oHDBVersion.HANA_VERSION === 1 && oHDBVersion.HANA_VERSION_SP < 112 ) {
            oMsgBuf.addMessage(MessageSeverity.ERROR, "Query hints are not supported by HANA version" + JSON.stringify(oHDBVersion));
            return;
        }

        var aHints = getAllHints(oHQ);
        var aPlanCache = getPlanCacheEntries(_.pluck(aHints, 'STATEMENT_HASH'),oHQ);
        var oPinActions = determinePinActions(oHDBVersion,aHints,aPlanCache);

        unpinHints(oPinActions.hintsToUnpin, oHQ);
        pinHints(oPinActions.hintsToPin, oHQ);
}

function _handleRequest(oRequest, oResponse) {
    if (oRequest.method !== $.net.http.PUT && oRequest.method !== $.net.http.POST) {
        oResponse.status = $.net.http.METHOD_NOT_ALLOWED;
        oResponse.contentType = ContentType.Plain;
        oResponse.setBody("Method not supported");
        return;
    }

    var oMsgBuf = message.createMessageBuffer();
    var oHQ = $.import("sap.ino.xs.xslib", "dbConnection").getHQ();
    try {
        setupHints(oHQ, oMsgBuf);
        if (oMsgBuf.getMinSeverity() <= MessageSeverity.Error) {
            oResponse.status = $.net.http.BAD_REQUEST;
            oResponse.contentType = ContentType.JSON;
            oResponse.setBody(JSON.stringify(oMsgBuf.getMessages()));
            oHQ.getConnection().rollback();
        } else {
            oResponse.status = $.net.http.OK;
            oResponse.contentType = ContentType.JSON;
            oHQ.getConnection().commit();
        }
    } catch (oException) {
        oResponse.status = $.net.http.INTERNAL_SERVER_ERROR;
        oHQ.getConnection().rollback();
        throw oException;
    }
}

function handleRequest() {
    return TraceWrapper.wrap_request_handler(function() {
        return _handleRequest($.request, $.response);
    });
}

function executeInBatch() {
    var oMsgBuf = message.createMessageBuffer();
    var oHQ = $.import("sap.ino.xs.xslib", "dbConnection").getHQ();

    try {
        const bUnderMaintenance = systemSettings.isUnderMaintenance();
        if (bUnderMaintenance) {
            //do not run batch jobs if setup is incomplete
            message.createMessage(
                message.MessageSeverity.Error,
                "MSG_BATCH_SYSTEM_SETUP_RUNNING",
                undefined, undefined, undefined, undefined);
            return;
        }
        setupHints(oHQ, oMsgBuf);
        if (oMsgBuf.getMinSeverity() <= MessageSeverity.Error) {
            throw (JSON.stringify(oMsgBuf.getMessages()));
        } else {
            oHQ.getConnection().commit();
        }
    } catch (oException) {
        message.createMessage(
            message.MessageSeverity.Error,
            "MSG_BATCH_SETUP_HINTS_FAILED_UNEXPECTEDLY",
            undefined, undefined, undefined, oException.toString());
        oHQ.getConnection().rollback();
        throw oException;
    }
}
