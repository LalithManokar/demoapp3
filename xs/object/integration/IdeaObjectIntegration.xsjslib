const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var authSetUser = $.import("sap.ino.xs.aof.core", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
const getHQ = dbConnection.getHQ;
var oLHQ = getHQ();
var Message = $.import("sap.ino.xs.aof.lib", "message");
var IAMMessage = $.import("sap.ino.xs.object.iam", "message");
var EnhancementSpot = $.import("sap.ino.xs.xslib.enhancement", "EnhancementSpot");
var IntegrationMessage = $.import("sap.ino.xs.object.integration", "message");
//const Destination  = $.import("sap.ino.xs.xslib", "destinations");

this.definition = {
	isExtensible: true,
	Root: {
		table: "sap.ino.db.integration::t_idea_object_integration",
		sequence: "sap.ino.db.integration::s_idea_object_integration",
		determinations: {
			onModify: [determine.systemAdminData]
		},
		attributes: {
			CREATED_AT: {
				readOnly: true
			},
			CREATED_BY_ID: {
				readOnly: true
			},
			CHANGED_AT: {
				readOnly: true,
				concurrencyControl: true
			},
			CHANGED_BY_ID: {
				readOnly: true
			},
			API_TECHNICAL_NAME: {
				required: true
			},
			SYSTEM_NAME: {
				required: true
			},
			SYSTEM_PACKAGE_NAME: {
				required: true
			},
			MAPPING_FIELD_CODE: {
				required: true
			},
			MAPPING_FIELD_VALUE: {
				required: true
			},
			IDEA_ID: {
				foreignKeyTo: "sap.ino.xs.object.idea.Idea.Root",
				required: true
			},
			API_ID: {
				required: true
			},
			INTEGRATION_OBJECT_UUID: {
				required: true
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
		createObject: {
			authorizationCheck: false,
			execute: createObject,
			enabledCheck: createObjectEnabledCheck,
			isStatic: true
		},
		queryObject: {
			authorizationCheck: false,
			execute: queryObject,
			enabledCheck: queryObjectEnabledCheck,
			isStatic: true
		},
		removeObject: {
			authorizationCheck: false,
			execute: removeObject,
			isStatic: true
		},
		getAllApiFromCampaign: {
			authorizationCheck: false,
			execute: getAllApiFromCampaign,
			isStatic: true
		},
		getIdeaIntegrationList: {
			authorizationCheck: false,
			execute: getIdeaIntegrationList,
			isStatic: true
		},
		linkExistedObject: {
			authorizationCheck: false,
			execute: linkExistedObject,
			enabledCheck: linkExistedObjectEnableCheck,
			isStatic: true
		},
		testFunction: {
			authorizationCheck: false,
			execute: testFunction,
			isStatic: true
		}
	}
};

//remove object
function removeObject(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	if (oReq.INTEGRATION_OBJECT_UUID) {
		var oUser = oContext.getUser();
		var iUserId = oUser && oUser.ID;
		var aResponse = [];
		const sUuid = oReq.INTEGRATION_OBJECT_UUID;
		var IdeaObjectAO = AOF.getApplicationObject("sap.ino.xs.object.integration.IdeaObjectIntegration");
		const aIntegrationObjectQuery =
			`select ID,API_TECHNICAL_NAME,IDEA_ID
                            from "sap.ino.db.integration::t_idea_object_integration"
                            where INTEGRATION_OBJECT_UUID = ? `;
		var aIntegrationObjectResult = oLHQ.statement(aIntegrationObjectQuery).execute(sUuid);
		aIntegrationObjectResult.forEach(function(element) {
			var oResponse = IdeaObjectAO.del(element.ID);
			if (oResponse.messages.length > 0) {
				aResponse.push(oResponse.messages);
			}
		});
		if (aResponse.length < 1) {
			var sSQLCampaign =
				`select CAMPAIGN_ID
                            from "sap.ino.db.idea::t_idea"
                            where id = ? `;
			var aCampaginResult = oLHQ.statement(sSQLCampaign).execute(aIntegrationObjectResult[0].IDEA_ID);
			var oCreateHistorySQL = 'INSERT INTO "sap.ino.db.integration::t_idea_object_integration_h"' +
				'values("sap.ino.db.integration::s_idea_object_integration_h".nextval,\'DELETED\',\'OBJECT_DELETE\',CURRENT_UTCTIMESTAMP,\'' + iUserId +
				'\',\'' + aIntegrationObjectResult[0].IDEA_ID + '\',\'' + aIntegrationObjectResult[0].API_TECHNICAL_NAME + '\',\'' + sUuid + '\',\'' +
				aCampaginResult[0].CAMPAIGN_ID + '\')';
			oLHQ.statement(oCreateHistorySQL).execute();
		}
	}
}

//get all API from specific campaign
function getAllApiFromCampaign(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	const Destination = $.import("sap.ino.xs.rest.commonIntegration", "destinations");
	if (oReq.CAMPAIGN_ID) {
		const campaign_id = oReq.CAMPAIGN_ID;
		// get api info
		const aCampaignApiResult = queryAllApiFromCampaign(campaign_id);

		if (aCampaignApiResult.length > 0) {
			aCampaignApiResult.forEach(function(element) {
				const oTargetSystem = Destination.getDestination(element.SYSTEM_PACKAGE_NAME, element.SYSTEM_NAME);
				const sTargetSystemName = oTargetSystem ? oTargetSystem.destName : 'undefined system';
				element.targetSystemName = sTargetSystemName;
			});
		}
		return aCampaignApiResult;
	}

}

//query all apis of campaign 
function queryAllApiFromCampaign(campaign_id) {
	const aCampaignApiQuery =
		`select TECHNICAL_NAME,APINAME,SYSTEM_NAME,SYSTEM_PACKAGE_NAME 
                            from"sap.ino.db.integration::v_campaign_integration"
                            where campaign_id = ? and STATUS = 'active'`;
	var aCampaignApiResult = oLHQ.statement(aCampaignApiQuery).execute(campaign_id);
	return aCampaignApiResult;
}

//enable check for create idea object integration
function createObjectEnabledCheck(oReq, oIdea, addMessage, oContext) {
	const campaign_id = oReq.CAMPAIGN_ID;
	var oHQ = oContext.getHQ();
	const sSelectCampaignIntegrationQuery =
		`select TOP 1 campaign_integration.CREATE_REQ_JSON,campaign.IS_INTEGRATION_ACTIVE
                                                from "sap.ino.db.integration::t_campaign_integration" as campaign_integration 
                                                left outer join "sap.ino.db.campaign::t_campaign" as campaign
                                                on campaign.id = campaign_integration.campaign_id
                                                where campaign.id = ?`;
	const aCampaignIntegration = oHQ.statement(sSelectCampaignIntegrationQuery).execute(campaign_id);
	if (aCampaignIntegration.length > 0 && aCampaignIntegration[0].CREATE_REQ_JSON && aCampaignIntegration[0].IS_INTEGRATION_ACTIVE) {
		return true;
	} else {
		addMessage(Message.MessageSeverity.Error, '', '', "Root");
	}
}

function linkExistedObjectEnableCheck(oReq, oIdea, addMessage, oContext) {
	const campaign_id = oReq.CAMPAIGN_ID;
	var oHQ = oContext.getHQ();
	const sSelectCampaignIntegrationQuery =
		`select TOP 1 campaign_integration.FETCH_RES_JSON,campaign.IS_INTEGRATION_ACTIVE
                                                from "sap.ino.db.integration::t_campaign_integration" as campaign_integration 
                                                left outer join "sap.ino.db.campaign::t_campaign" as campaign
                                                on campaign.id = campaign_integration.campaign_id
                                                where campaign.id = ?`;
	const aCampaignIntegration = oHQ.statement(sSelectCampaignIntegrationQuery).execute(campaign_id);
	if (aCampaignIntegration.length > 0 && aCampaignIntegration[0].IS_INTEGRATION_ACTIVE) {
		return true;
	} else {
		addMessage(Message.MessageSeverity.Error, '', '', "Root");
	}
}

//enable check for query object 
function queryObjectEnabledCheck(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	if (oReq.API_TECH_NAME && oReq.CAMPAIGN_ID && oReq.IDEA_ID) {
		const apiTechnicalName = oReq.API_TECH_NAME;
		const campaign_id = oReq.CAMPAIGN_ID;
		const idea_id = oReq.IDEA_ID;
		// get api info
		const oApiInfoObject = getApiInfo(apiTechnicalName, campaign_id, 'QUERY');
		return oApiInfoObject;
	}
}

// query api for specific object from other integration system
function queryObject(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	if (oReq.API_TECH_NAME && oReq.CAMPAIGN_ID && oReq.IDEA_ID && oReq.INTEGRATION_OBJECT_UUID) {
		const apiTechnicalName = oReq.API_TECH_NAME;
		const campaign_id = oReq.CAMPAIGN_ID;
		const idea_id = oReq.IDEA_ID;
		const sUuid = oReq.INTEGRATION_OBJECT_UUID;
		const sType = 'QUERY';
		// get api info
		const oApiInfoObject = getApiInfo(apiTechnicalName, campaign_id, sType);

		if (oApiInfoObject) {
			//get idea mapping object 
			const oMappingIdeaObject = prepareIdeaObject(idea_id, oApiInfoObject, sUuid);
			//generate payload
			const oPayload = newGlobalPayLoad(oApiInfoObject, oMappingIdeaObject);
			//prepare http request
			const oHttpRequest = preRequestHandler(oApiInfoObject, oMappingIdeaObject);
			var oResponse;
			//send request to target system
			try {
				oResponse = sendRequest(oApiInfoObject, oHttpRequest, oPayload);
				if (oApiInfoObject.resMetadata) {
					saveResponseMappingField(oResponse, oApiInfoObject, idea_id, sType, sUuid);
				}
				return true;
			} catch (e) {
				if (!oResponse || oResponse.status === 200) {
					oResponse = {
						status: 0,
						message: e.message
					};
				}
				throw e;
			} finally {
				if (!oResponse) {
					oResponse = {
						status: 0,
						message: 'Could not get any response from target system because of connection failed ,please check configuration of destination and make sure the server of destination is normally up'
					};
				}
				var resMonitor = storeMonitoringInfo(oContext, oResponse, oApiInfoObject, idea_id, oPayload, oHttpRequest, sType, campaign_id,
					apiTechnicalName, sUuid);
				return {
					status: oResponse.status,
					generatedId: resMonitor ? resMonitor.generatedKeys : ''
				};
			}
		} else {
			addMessage(Message.MessageSeverity.Error, IntegrationMessage.INTEGRATION_API_REMOVED_FROM_CAMPAIGN);
		}
	} else {
		return false;
	}
}

// create api for specific object from other integration system
function createObject(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	if (oReq.API_TECH_NAME && oReq.CAMPAIGN_ID && oReq.IDEA_ID) {
		const apiTechnicalName = oReq.API_TECH_NAME;
		const campaign_id = oReq.CAMPAIGN_ID;
		const idea_id = oReq.IDEA_ID;
		const sType = 'CREATE';
		var sUuid = '';
		// get api info
		const oApiInfoObject = getApiInfo(apiTechnicalName, campaign_id, sType);
		if (oApiInfoObject) {

			//get idea mapping object 
			const oMappingIdeaObject = prepareIdeaObject(idea_id, oApiInfoObject);
			//generate payload
			const oPayload = newGlobalPayLoad(oApiInfoObject, oMappingIdeaObject);
			//prepare http request
			const oHttpRequest = preRequestHandler(oApiInfoObject, oMappingIdeaObject);
			if (oPayload) {
				var oResponse;
				//send request to target system
				try {
					oResponse = sendRequest(oApiInfoObject, oHttpRequest, oPayload);
					if (oApiInfoObject.resMetadata) {
						sUuid = saveResponseMappingField(oResponse, oApiInfoObject, idea_id, sType);
					}
					return true;
				} catch (e) {
					if (!oResponse || oResponse.status === 200) {
						oResponse = {
							status: 0,
							message: e.message
						};
					}
					throw e;
				} finally {
					if (!oResponse) {
						oResponse = {
							status: 0,
							message: 'Could not get any response from target system because of connection failed ,please check configuration of destination and make sure the server of destination is normally up'
						};
					}
					var resMonitor = storeMonitoringInfo(oContext, oResponse, oApiInfoObject, idea_id, oPayload, oHttpRequest, sType, campaign_id,
						apiTechnicalName,
						sUuid);
					return {
						status: oResponse.status,
						generatedId: resMonitor ? resMonitor.generatedKeys : ''
					};
				}

			}
		}
	} else {
		return false;
	}
}
// Link 3rd object for corresponding api for idea
function linkExistedObject(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	//This will get the query API info, then go to 3rd system to get the corresponding data and create the corresponding data in our system;    
	var sObjectType = oReq.OBJECT_TYPE;
	if (oReq.API_TECH_NAME && oReq.CAMPAIGN_ID && oReq.IDEA_ID && oReq.OBJECT_ID) {
		const apiTechnicalName = oReq.API_TECH_NAME;
		const campaign_id = oReq.CAMPAIGN_ID;
		const idea_id = oReq.IDEA_ID;
		var sUuid = '';
		// get api info
		const oApiInfoObject = getApiInfo(apiTechnicalName, campaign_id, 'QUERY');

		//generate payload
		if (oApiInfoObject) {
			const oMappingIdeaObject = prepareIdeaObject(idea_id, oApiInfoObject);
			const oPayload = newGlobalPayLoad(oApiInfoObject, oMappingIdeaObject);
			const oHttpRequest = preLinkRequestHandler(oApiInfoObject, oReq);
			if (oPayload) {
				var oResponse;
				var bExisted = false;
				//send request to target system
				try {
					oResponse = sendRequest(oApiInfoObject, oHttpRequest, oPayload);
					if (oApiInfoObject.resMetadata) {
						//Create new Object in our system
						bExisted = queryObjectExisted(oApiInfoObject, oResponse, idea_id, oReq.OBJECT_ID, oContext);
						if (!bExisted) {
							sUuid = saveResponseMappingField(oResponse, oApiInfoObject, idea_id, 'CREATE');
						}
					}
					return true;
				} catch (e) {
					if (!oResponse || oResponse.status === 200) {
						oResponse = {
							status: 0,
							message: e.message
						};
					}
					throw e;
				} finally {
					if (!oResponse) {
						oResponse = {
							status: 0,
							message: 'Could not get any response from target system because of connection failed ,please check configuration of destination and make sure the server of destination is normally up'
						};
					}
					var resMonitor = storeMonitoringInfo(oContext, oResponse, oApiInfoObject, idea_id, oPayload, oHttpRequest, "CREATE", campaign_id,
						apiTechnicalName,
						sUuid);
					return {
						status: oResponse.status,
						generatedId: resMonitor ? resMonitor.generatedKeys : '',
						existed: bExisted
					};
				}

			}
		}
	} else {
		return false;
	}
}
//prepare api Link request 
function preLinkRequestHandler(oApiInfo, oReq) {

	//get request object
	var method;
	if (oApiInfo.method === 'POST') {
		method = $.net.http.POST;
	} else if (oApiInfo.method === 'GET') {
		method = $.net.http.GET;
	} else {
		return false;
	}
	var aPathVariable = oApiInfo.path.split('$');
	_.each(aPathVariable, function(item, index) {
		if (item === "OBJECT_ID") {
			aPathVariable[index] = encodeURIComponent(oReq.OBJECT_ID);
		} else if (item === "OBJECT_TYPE") {
			aPathVariable[index] = encodeURIComponent(oReq.OBJECT_TYPE);
		}
	});

	var sProcessedPath = aPathVariable.join('');

	if (oApiInfo.locationId !== null) {
		sProcessedPath += encodeURIComponent('?location_id=' + oApiInfo.locationId);
	}
	var oRequest = new $.net.http.Request(method, sProcessedPath);

	return oRequest;
}

function queryObjectExisted(oApiInfoObject, oResponse, idea_id, object_id, oContext) {
	const oMappingJson = generateResMappingJson(oApiInfoObject);
	const oRespJson = JSON.parse(oResponse.body.asString());
	var oHQ = oContext.getHQ();
	var sResponseObjectID, sQuerySql, aResult = [];
	_.each(oMappingJson, function(value, code) {
		if (value && code === "OBJECT_ID") {
			sResponseObjectID = findMappingField(value.PATH, oRespJson);
			return false;
		}
	});
	if (sResponseObjectID) {
		sQuerySql = 'select id from "sap.ino.db.integration::t_idea_object_integration" where idea_id = ? and mapping_field_code = ? and ' +
			'( mapping_field_value = ?  or mapping_field_value = ? )';
		aResult = oHQ.statement(sQuerySql).execute(idea_id, 'OBJECT_ID', sResponseObjectID, object_id);
	} else {
		sQuerySql =
			'select id from "sap.ino.db.integration::t_idea_object_integration" where idea_id = ? and mapping_field_code = ? and mapping_field_value = ? ';
		aResult = oHQ.statement(sQuerySql).execute(idea_id, 'OBJECT_ID', object_id);
	}
	return aResult.length > 0;

}

function testFunction(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	if (oReq.API_TECH_NAME && oReq.CAMPAIGN_ID && oReq.IDEA_ID) {
		const apiTechnicalName = oReq.API_TECH_NAME;
		const campaign_id = oReq.CAMPAIGN_ID;
		const idea_id = oReq.IDEA_ID;
		const oMappingIdeaObject = prepareIdeaObject(idea_id);
		const oApiInfoObject = getApiInfo(apiTechnicalName, campaign_id, 'CREATE');
		return newGlobalPayLoad(oApiInfoObject, oMappingIdeaObject);

		// const oPayload = newGlobalPayLoad(oApiInfoObject);
		// const oHttpRequest = preRequestHandler(oApiInfoObject);
		// if(oPayload){
		//  sendRequest(oApiInfoObject,oHttpRequest,oPayload);
		//  }
	} else {
		return false;
	}
	//return  prepareIdeaObject(oReq.IDEA_ID);
}

function sendRequest(oApiInfo, oReq, oPayload) {
	const Destination = $.import("sap.ino.xs.rest.commonIntegration", "destinations");
	//get http client
	var oHttpClient = new $.net.http.Client();
	var sAuthTokenAndCookie;

	// get desination
	const oDestination = Destination.readDestination(oApiInfo.standardPackageName, oApiInfo.standardName);
	if (oApiInfo.tokenUrl) {
		sAuthTokenAndCookie = getAuthTokenAndCookies(oApiInfo, oDestination);
		oReq.headers.set("X-CSRF-TOKEN", sAuthTokenAndCookie.token);
		for (var i = 0; i < sAuthTokenAndCookie.cookie.length; i++) {
			oReq.cookies.set(sAuthTokenAndCookie.cookie[i].name, sAuthTokenAndCookie.cookie[i].value);
		}
	}
	oReq.headers.set("Content-Type", "application/json");
	oReq.headers.set("Accept", "application/json");
	
    var oIdeaObjectIntegrationEs = EnhancementSpot.get("sap.ino.xs.object.integration.IdeaObjectIntegrationEs");
	if (oIdeaObjectIntegrationEs) {
		oIdeaObjectIntegrationEs.enhanceRequest(oReq, oApiInfo);
	}
	
	// var hexData = $.util.codec.encodeHex(JSON.stringify(oPayload));
	// var payloadAsarrayBuffer =  $.util.codec.decodeHex(hexData);
	if (oPayload) {
		// 		oReq.cookies = sAuthToken.cookie;
		oReq.setBody(JSON.stringify(oPayload));
	}
	var oResponse = oHttpClient.request(oReq, oDestination).getResponse();
	return oResponse;
}

//get Token
function getAuthTokenAndCookies(oApiInfo, oDestination) {
	var oBody;
	var aHeaders = [{
		key: oApiInfo.tokenKey,
		value: oApiInfo.tokenValue
	}];
	var response = sendTokenRequest(oDestination, "GET", oApiInfo.tokenUrl, aHeaders,
			'', "when getting auth token from auth service failed"),
		token;
	if (response.headers) {
		for (var c in response.headers) {
			if (response.headers[c].name === 'x-csrf-token') {
				token = response.headers[c].value;
			}
		}
	} else {
		throw new Error("getting token failure.");
	}
	var myCookies = [];
	if (response.cookies) {
		for (var o in response.cookies) {
			myCookies.push(response.cookies[o]);
		}
	} else {
		throw new Error("getting token failure.");
	}

	return {
		token: token,
		cookie: myCookies
	};
}

//get token request
function sendTokenRequest(sDestination, sMethod, sUrl, aHeaders, sBody, sMsg) {
	var _HTTP_METHOD_ = {
		'GET': $.net.http.GET,
		'POST': $.net.http.POST
	};
	var request = new $.net.http.Request(_HTTP_METHOD_[sMethod], sUrl);
	if (aHeaders && aHeaders.length > 0) {
		_.each(aHeaders, function(header) {
			request.headers.set(header.key, header.value);
		});
	}
	if (sBody) {
		request.setBody(sBody);
	}
	var oTokenclient = new $.net.http.Client();
	var response = oTokenclient.request(request, sDestination).getResponse();
	checkTokenResponseStatus(response, sMsg);
	return response;
}

//check Token ResponseStatus
function checkTokenResponseStatus(oResponse, sMsg) {
	for (var c in oResponse.headers) {
		if (oResponse.headers[c].name === '~status_code' && oResponse.headers[c].value !== '200' && oResponse.headers[c].value !== '204') {
			throw new Error(sMsg);
		}
	}
}

//prepare api request 
function preRequestHandler(oApiInfo, oIdea) {

	//get request object
	var method;
	if (oApiInfo.method === 'POST') {
		method = $.net.http.POST;
	} else if (oApiInfo.method === 'GET') {
		method = $.net.http.GET;
	} else {
		return false;
	}
	var sProcessedPath = handleApiPath(oApiInfo.path, oIdea);
	if (oApiInfo.locationId !== null) {
		sProcessedPath += encodeURIComponent('?location_id=' + oApiInfo.locationId);
	}
	var oRequest = new $.net.http.Request(method, sProcessedPath);

	return oRequest;
}

//handle variable of api path 
function handleApiPath(sPath, oIdea) {
	const aResponseObject = oIdea.RESPONSE_OBJECT;
	//const regexp = /(?<=\$\{).*(?=\})/;
	//const aPathVariable = sPath.match(regexp);
	var aPathVariable = sPath.split('$');
	_.each(aPathVariable, function(item, index) {
		aResponseObject.forEach(function(element) {
			if (element.MAPPING_FIELD_CODE === item) {
				aPathVariable[index] = encodeURIComponent(element.MAPPING_FIELD_VALUE);
			}
		});
	});
	return aPathVariable.join('');
}

//select mapiing field code
function prepareIdeaObject(idea_id, oApiInfoObject, sUuid) {
	// prepare basic idea object
	const oBasicIdeaObjectQuery =
		`select 
    top 1
    idea.ID AS IDEA_ID,
    idea.NAME AS IDEA_NAME,
    idea.DESCRIPTION AS IDEA_DESCRIPTION,
    idea.CAMPAIGN_ID AS CAMPAIGN_ID,
    idea.CREATED_AT AS IDEA_CREATED_AT,
    idea.CHANGED_AT AS IDEA_LAST_CHANGED_AT,
    campaign.name AS CAMPAIGN_NAME,
    idea_author.user_name AS IDEA_SUBMITTER_USER_ID,
    idea_author.name AS IDEA_SUBMITTER_NAME,
    idea_author.email AS IDEA_SUBMITTER_EMAIL,
    idea.PHASE_CODE AS IDEA_PHASE_CODE,
    phase.DEFAULT_LONG_TEXT AS IDEA_PHASE_NAME,
    idea.STATUS_CODE AS IDEA_STATUS_CODE,
    status.DEFAULT_LONG_TEXT AS IDEA_STTAUS_NAME,
    idea_coach.user_name AS IDEA_COACH_USER_ID,
    idea_coach.name AS IDEA_COACH_NAME,
    idea_coach.email AS IDEA_COACH_EMAIL,
    idea_score.user_score AS IDEA_VOTE_SCORE
    from"sap.ino.db.idea::t_idea" as idea
    inner join "sap.ino.db.idea::v_vote_idea_score" as idea_score
    on idea_score.idea_id = idea.id
    inner join "sap.ino.db.idea::v_idea_author" as idea_author
    on idea_author.idea_id = idea.id and idea_author.identity_id = idea.CREATED_BY_ID
    inner join "sap.ino.db.status::t_status" as status
    on status.code = idea.status_code
    inner join "sap.ino.db.campaign::t_phase" as phase
    on phase.code = idea.phase_code
    inner join "sap.ino.db.campaign::t_campaign_t" as campaign
    on campaign.campaign_id = idea.campaign_id
    left outer  join "sap.ino.db.idea::v_idea_coach" as idea_coach
    on idea_coach.idea_id = idea.id
    where idea.id = ?`;
	var aBasicIdeaResult = oLHQ.statement(oBasicIdeaObjectQuery).execute(idea_id);

	//parepare coauthor 
	const oIdeaCoauthorQuery =
		`select user_name as IDEA_COAUTHOR_USER_ID,
                                name as IDEA_COAUTHOR_NAME,
                                email as IDEA_COAUTHOR_EMAIL
                                from "sap.ino.db.idea::v_idea_contributors"
                                where idea_id = ?`;
	var aIdeaCoauthorResult = oLHQ.statement(oIdeaCoauthorQuery).execute(idea_id);
	//prepare expert
	const oIdeaExpertQuery =
		`select user_name as IDEA_EXPERT_USER_ID,
                              name as IDEA_EXPERT_NAME,
                              email as IDEA_EXPERT_EMAIL
                                from "sap.ino.db.idea::v_idea_experts"
                                where idea_id = ?`;
	var aIdeaExpertResult = oLHQ.statement(oIdeaExpertQuery).execute(idea_id);
	//prepare campaign manager
	const oIdeaCampaignManagerQuery =
		`select manager.user_name as CAMPAIGN_MANAGER_USER_ID,
                                     manager.name as CAMPAIGN_MANAGER_NAME,
                                     manager.email as CAMPAIGN_MANAGER_EMAIL
                                     from"sap.ino.db.idea::t_idea" as idea
                                     inner join  "sap.ino.db.campaign::v_campaign_manager_transitive" as manager
                                     on manager.campaign_id = idea.campaign_id
                                     where idea.id = ?`;
	var aIdeaCampaignManagerResult = oLHQ.statement(oIdeaCampaignManagerQuery).execute(idea_id);
	//prepare decision
	const oIdeaDecisionQuery =
		`select 
        decision.DECIDER_USER_NAME as IDEA_DECISION_MAKER_USER_ID,
        decision.DECIDER_NAME as IDEA_DECISION_MAKER_NAME,
        decision.DECISION_DATE as IDEA_DECISION_DATE,
        decision.REASON as IDEA_DECISION_REASON
        from"sap.ino.db.idea::v_decision_latest" AS decision
        where idea_id = ?`;
	var aIdeaDecisionResult = oLHQ.statement(oIdeaDecisionQuery).execute(idea_id);
	//prepare tags
	const oIdeaTagsQuery = `select NAME AS IDEA_TAGS from "sap.ino.db.idea::v_idea_tag"
                                where idea_id = ?`;
	var aIdeaTagsResult = oLHQ.statement(oIdeaTagsQuery).execute(idea_id);

	var aResponseObjectsResult;
	if (sUuid) {
		//prepare response object stored in our side
		const oResponseObjectsQuery =
			`select ID,MAPPING_FIELD_CODE,MAPPING_FIELD_VALUE,INTEGRATION_OBJECT_UUID from"sap.ino.db.integration::t_idea_object_integration" 
                                        where INTEGRATION_OBJECT_UUID = ?`;
		aResponseObjectsResult = oLHQ.statement(oResponseObjectsQuery).execute(sUuid);
	} else {
		aResponseObjectsResult = [];
	}

	const oBasicIdea = aBasicIdeaResult.length === 1 ? aBasicIdeaResult[0] : {};
	const aIdeaCoauthor = aIdeaCoauthorResult;
	const aIdeaExpert = aIdeaExpertResult;
	const aIdeaCampaignManager = aIdeaCampaignManagerResult;
	const oIdeaDecision = aIdeaDecisionResult.length === 1 ? aIdeaDecisionResult[0] : {};
	const aIdeaTags = aIdeaTagsResult;
	const aResponseObject = aResponseObjectsResult;
	const sCurIdeaUrl = _getHost() + "/sap/ino/#/idea/" + idea_id;
	var oResult = _.extend(oBasicIdea, {
			IDEA_COAUTHOR_USER_ID: _.pluck(aIdeaCoauthor, 'IDEA_COAUTHOR_USER_ID')
		}, {
			IDEA_COAUTHOR_NAME: _.pluck(aIdeaCoauthor, 'IDEA_COAUTHOR_NAME')
		}, {
			IDEA_COAUTHOR_EMAIL: _.pluck(aIdeaCoauthor, 'IDEA_COAUTHOR_EMAIL')
		}, {
			IDEA_EXPERT_USER_ID: _.pluck(aIdeaExpert, 'IDEA_EXPERT_USER_ID')
		}, {
			IDEA_EXPERT_NAME: _.pluck(aIdeaExpert, 'IDEA_EXPERT_NAME')
		}, {
			IDEA_EXPERT_EMAIL: _.pluck(aIdeaExpert, 'IDEA_EXPERT_EMAIL')
		}, {
			CAMPAIGN_MANAGER_USER_ID: _.pluck(aIdeaCampaignManager, 'CAMPAIGN_MANAGER_USER_ID')
		}, {
			CAMPAIGN_MANAGER_NAME: _.pluck(aIdeaCampaignManager, 'CAMPAIGN_MANAGER_NAME')
		}, {
			CAMPAIGN_MANAGER_EMAIL: _.pluck(aIdeaCampaignManager, 'CAMPAIGN_MANAGER_EMAIL')
		},
		oIdeaDecision, {
			RESPONSE_OBJECT: aResponseObject
		}, {
			IDEA_TAGS: _.pluck(aIdeaTags, 'IDEA_TAGS')
		}, {
			IDEA_URL: sCurIdeaUrl
		}
	);
	return dataConvertion(oResult, oApiInfoObject);
}

//convertion interface for technical user
function dataConvertion(oIdeaObject, oApiInfo) {
	var oIdeaObjectIntegrationEs = EnhancementSpot.get("sap.ino.xs.object.integration.IdeaObjectIntegrationEs");
	if (oIdeaObjectIntegrationEs) {
		oIdeaObjectIntegrationEs.enhanceIdeaInfo(oIdeaObject, oApiInfo);
	}
	return oIdeaObject;
}

//get host 
function _getHost() {
	var SystemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
	var defaultSysHost = SystemSettings.getIniValue('host', oLHQ);
	if (!$.request || !$.request.headers || !$.request.headers.get('clientprotocol') || !$.request.headers.get('host')) {
		return defaultSysHost;
	}
	return $.request.headers.get('clientprotocol') + "://" + $.request.headers.get('host');
}

//tree to json payload
function treeToJsonPayload(treeObject, payload, oIdea) {
	var children = treeObject.children;
	const that = this;
	if (children && children.length > 0) {
		children.forEach(function(element) {
			if (element.children && element.children.length > 0) {
				if (isNaN(element.children[0].technicalName)) {
					payload[element.technicalName] = {};
					that.treeToJsonPayload(element, payload[element.technicalName], oIdea);
				} else {
					payload[element.technicalName] = [];
					that.treeToJsonPayload(element, payload[element.technicalName], oIdea);
				}
			} else {
				that.treeToJsonPayload(element, payload, oIdea);
			}
		});
	} else {
		const preValue = that.processPayloadData(treeObject, oIdea);
		if (Array.isArray(payload)) {
			if (isNaN(parseInt(treeObject.technicalName))) {
				const objectInArray = {};
				objectInArray[treeObject.technicalName] = preValue;
				payload.push(objectInArray);
			} else {
				payload.push(preValue);
			}

		} else {
			payload[treeObject.technicalName] = preValue;
		}
	}
}

//process payload data 
function processPayloadData(metadata, oIdea) {
	if (metadata.dataType === 'Constant') {
		return metadata.constantsValue ? metadata.constantsValue : '';
	} else if (metadata.dataType === 'Variant') {
		if (metadata.mappingField === "IDEA_DESCRIPTION") {
			return oIdea[metadata.mappingField] ? _.stripTags(oIdea[metadata.mappingField]) : '';
		}
		return oIdea[metadata.mappingField] ? oIdea[metadata.mappingField] : '';
	} else {
		return '';
	}
}

//generate payload 
function newGlobalPayLoad(oApiInfo, oIdea) {
	var payload = {};
	if (oApiInfo.reqMetadata !== null) {
		const treeObejct = JSON.parse(oApiInfo.reqMetadata);
		// const fomatTree = {
		//       children:treeObejct
		//   };
		this.treeToJsonPayload(treeObejct, payload, oIdea);
	}
	return payload;
}

//getter function for api object

function getApiInfo(apiTechnicalName, campaign_id, apiType) {
	const sSelectMetadata =
		`select top 1 campaign.ID,
        		campaign.CAMPAIGN_ID,
        		campaign.SYSTEM_NAME,
        		campaign.SYSTEM_PACKAGE_NAME,
        		campaign.CREATE_METHOD,
        		campaign.CREATE_PATH,
        		campaign.FETCH_METHOD,
        		campaign.FETCH_PATH,
        		campaign.CREATE_REQ_JSON,
        		campaign.CREATE_RES_JSON,
        		campaign.FETCH_REQ_JSON,
        		campaign.FETCH_RES_JSON,
        		system.CREATE_TOKEN_URL,
        		system.CREATE_TOKEN_KEY,
        		system.CREATE_TOKEN_VALUE,
        		system.FETCH_TOKEN_URL,
        		system.FETCH_TOKEN_KEY,
        		system.FETCH_TOKEN_VALUE,
        		system.FETCH_LOCATION_ID,
        		system.CREATE_LOCATION_ID,
        		campaign.TECHNICAL_NAME AS API_TECHNICAL_NAME 
        		from"sap.ino.db.integration::t_campaign_integration" as campaign 
        		left outer join "sap.ino.db.integration::t_system_integration" as system 
        		on campaign.TECHNICAL_NAME=system.TECHNICAL_NAME
        		where campaign.TECHNICAL_NAME = ? and campaign.CAMPAIGN_ID = ? `;
	var aApiInfoResult = oLHQ.statement(sSelectMetadata).execute(apiTechnicalName, campaign_id);
	var sPackageName;
	var sStandardName;
	if (aApiInfoResult.length > 0) {
		sPackageName = aApiInfoResult[0].SYSTEM_PACKAGE_NAME;
		sStandardName = aApiInfoResult[0].SYSTEM_NAME;
	} else {
		return false;
	}
	var oApiObject;
	if (apiType === 'CREATE') {
		oApiObject = {
			standardPackageName: sPackageName,
			standardName: sStandardName,
			id: aApiInfoResult[0].ID,
			campaignId: aApiInfoResult[0].CAMPAIGN_ID,
			method: aApiInfoResult[0].CREATE_METHOD,
			path: aApiInfoResult[0].CREATE_PATH,
			apiName: aApiInfoResult[0].API_TECHNICAL_NAME,
			reqMetadata: aApiInfoResult[0].CREATE_REQ_JSON,
			resMetadata: aApiInfoResult[0].CREATE_RES_JSON,
			tokenUrl: aApiInfoResult[0].CREATE_TOKEN_URL,
			tokenKey: aApiInfoResult[0].CREATE_TOKEN_KEY,
			tokenValue: aApiInfoResult[0].CREATE_TOKEN_VALUE,
			locationId: aApiInfoResult[0].CREATE_LOCATION_ID
		};
	} else if (apiType === 'QUERY') {
		oApiObject = {
			standardPackageName: sPackageName,
			standardName: sStandardName,
			id: aApiInfoResult[0].ID,
			campaignId: aApiInfoResult[0].CAMPAIGN_ID,
			method: aApiInfoResult[0].FETCH_METHOD,
			path: aApiInfoResult[0].FETCH_PATH,
			apiName: aApiInfoResult[0].API_TECHNICAL_NAME,
			reqMetadata: aApiInfoResult[0].FETCH_REQ_JSON,
			resMetadata: aApiInfoResult[0].FETCH_RES_JSON,
			tokenUrl: aApiInfoResult[0].FETCH_TOKEN_URL,
			tokenKey: aApiInfoResult[0].FETCH_TOKEN_KEY,
			tokenValue: aApiInfoResult[0].FETCH_TOKEN_VALUE,
			locationId: aApiInfoResult[0].FETCH_LOCATION_ID
		};
	}
	return oApiObject;

}

//handle response of target system after successfully request 
function handleResponse(oResponse, oMappingJson, idea_id, oApiInfo, sType, sUuid) {
	var IdeaObjectAO = AOF.getApplicationObject("sap.ino.xs.object.integration.IdeaObjectIntegration");
	const sNewUuid = $.util.createUuid();
	var oIdeaObjectIntegrationEs = EnhancementSpot.get("sap.ino.xs.object.integration.IdeaObjectIntegrationEs");
	if (oIdeaObjectIntegrationEs) {
		oIdeaObjectIntegrationEs.enhanceResponseInfo(oResponse, oApiInfo);
	}
	//  
	var oResMessages = [];
	if (sType === 'CREATE') {
		_.each(oMappingJson, function(value, code) {
			if (value) {
				var oRes = IdeaObjectAO.create({
					ID: -1,
					API_TECHNICAL_NAME: oApiInfo.apiName,
					SYSTEM_NAME: oApiInfo.standardName,
					SYSTEM_PACKAGE_NAME: oApiInfo.standardPackageName,
					MAPPING_FIELD_CODE: code,
					MAPPING_FIELD_VALUE: findMappingField(value.PATH, oResponse),
					API_ID: oApiInfo.id,
					IDEA_ID: idea_id,
					INTEGRATION_OBJECT_UUID: sNewUuid
				});
				if (oRes.messages.length > 0) {
					oResMessages.push(oRes.messages);
				}
			}
		});
		if (oResMessages.length < 1) {
			return sNewUuid;
		}

	} else if (sType === 'QUERY') {
		const sSeleteOldRecords =
			`select MAPPING_FIELD_CODE,ID from"sap.ino.db.integration::t_idea_object_integration" where INTEGRATION_OBJECT_UUID = ?`;
		const aSeleteOldRecordsResult = oLHQ.statement(sSeleteOldRecords).execute(sUuid);
		const aOldRecords = _.pluck(aSeleteOldRecordsResult, 'MAPPING_FIELD_CODE');
		var oOldRecord = {};
		aSeleteOldRecordsResult.forEach(function(element) {
			oOldRecord[element.MAPPING_FIELD_CODE] = element.ID;
		});

		_.each(oMappingJson, function(value, code) {

			if (value && !~aOldRecords.indexOf(code)) {
				IdeaObjectAO.create({
					ID: -1,
					API_TECHNICAL_NAME: oApiInfo.apiName,
					SYSTEM_NAME: oApiInfo.standardName,
					SYSTEM_PACKAGE_NAME: oApiInfo.standardPackageName,
					MAPPING_FIELD_CODE: code,
					MAPPING_FIELD_VALUE: value.CONSTANT_VALUE ? value.CONSTANT_VALUE : findMappingField(value.PATH, oResponse),
					API_ID: oApiInfo.id,
					IDEA_ID: idea_id,
					INTEGRATION_OBJECT_UUID: sUuid
				});

			} else {
				IdeaObjectAO.update({
					ID: oOldRecord[code],
					API_ID: oApiInfo.id,
					MAPPING_FIELD_VALUE: findMappingField(value.PATH, oResponse)
				});
			}
		});
	}
}

// generate response mapping json
function generateResMappingJson(oApiInfo) {
	const aIdeaObjectFieldsQuery =
		'select field_code from "sap.ino.db.integration::t_integration_field_mapping" where type_code = \'RESPONSE_MAPPING\'';
	const aIdeaObjectMappingField = oLHQ.statement(aIdeaObjectFieldsQuery).execute();

	// loop full tree to find mapping field in response object 
	var oMappingJson = {};
	const treeObejct = JSON.parse(oApiInfo.resMetadata);
	this.treeToMappingJson(treeObejct, oMappingJson, _.pluck(aIdeaObjectMappingField, 'FIELD_CODE'));
	return oMappingJson;
}

//loop full tree to find mapping field in response object 
function treeToMappingJson(treeObject, oMappingJson, aIdeaObjectMappingField) {
	var children = treeObject.children;
	const that = this;
	if (children && children.length > 0) {
		children.forEach(function(element) {
			if (element.children && element.children.length > 0) {
				that.treeToMappingJson(element, oMappingJson, aIdeaObjectMappingField);
			} else {
				// only fill the predefined fields in Mapping json
				if (element.mappingField && ~aIdeaObjectMappingField.indexOf(element.mappingField)) {
					oMappingJson[element.mappingField] = {
						PATH: element.mappingPath,
						CONSTANT_VALUE: element.constantsValue ? element.constantsValue : null
					};
				}
			}
		});
	}

}

//handle sequence and display name 
function handleDisplay() {

}

//store the mapping fields of response
function saveResponseMappingField(oResponse, oApiInfo, idea_id, sType, sUuid) {
	try {
		const oResposneJson = JSON.parse(oResponse.body.asString());
		// generate response mapping json
		const oMappingJson = generateResMappingJson(oApiInfo);
		var sCreatedUuid = handleResponse(JSON.parse(oResponse.body.asString()), oMappingJson, idea_id, oApiInfo, sType, sUuid);
	} catch (parseError) {
		throw parseError;
	}

	return sCreatedUuid;
}

//store monitoring info in database after request seding regardless successful or not
function storeMonitoringInfo(oContext, oResponse, oApiInfo, idea_id, oPayload, oHttpRequest, sType, campaign_id, apiTechnicalName,
	object_uuid) {
	var monitorAO = AOF.getApplicationObject("sap.ino.xs.object.integration.MonitorIntegration");
	var sNowISO = oContext.getRequestTimestamp();
	var oUser = oContext.getUser();
	var iUserId = oUser && oUser.ID;
	var oRes = monitorAO.create({
		ID: -1,
		STATUS: oResponse.status,
		RESPONSE_MESSAGE: oResponse.body ? oResponse.body.asString() : oResponse.message,
		OBJECT_ID: idea_id,
		DIRECTION_PATH: 'Outbound',
		PATH: oHttpRequest ? oHttpRequest.path : "",
		INTERFACE_NAME: oApiInfo.apiName,
		OPERATOR_BY_ID: iUserId,
		OPERATOR_AT: sNowISO,
		OBJECT_PAYLOAD_JSON: JSON.stringify(oPayload)
	});

	if (oResponse.status < 300 && object_uuid) {
		var sDBEvent = sType === "QUERY" ? "UPDATED" : "CREATED";
		var sHisEvent = sType === "QUERY" ? "OBJECT_UPDATE" : "OBJECT_CREATE";
		var sCrtUpd = sType === "QUERY" ? "CHANGED_AT" : "CREATED_AT";
		var oHQ = oContext.getHQ();

		var oCreateHistorySQL = 'INSERT INTO "sap.ino.db.integration::t_idea_object_integration_h"' +
			'SELECT TOP 1 "sap.ino.db.integration::s_idea_object_integration_h".nextval,\'' + sDBEvent + '\',\'' + sHisEvent + '\',' + sCrtUpd +
			',\'' + iUserId +
			'\',\'' + idea_id + '\',\'' + apiTechnicalName + '\',\'' + object_uuid + '\',\'' + campaign_id +
			'\' FROM "sap.ino.db.integration::t_idea_object_integration" WHERE INTEGRATION_OBJECT_UUID = ? ORDER BY ' + sCrtUpd + ' DESC';
		oHQ.statement(oCreateHistorySQL).execute(object_uuid);
	}

	return oRes;
}

//To find mapping filed from response of query api to store in database
function findMappingField(path, jsonObject) {
	const pathArray = path.split('/');
	let mappingObject = jsonObject;
	pathArray.forEach(function(item) {
		if (item !== '') {
			mappingObject = mappingObject[item] ? mappingObject[item] : '';
		}
	});
	return mappingObject;
}

//get idea object list of integration    
function getIdeaIntegrationList(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
	const idea_id = oReq.IDEA_ID;
	const campaign_id = oReq.CAMPAIGN_ID;
	const aIdeaObjectFieldsQuery =
		`
    select integration.integration_object_uuid,
    integration.CREATE_AT,
    integration.CHANGED_AT,
    integration.CODE,
    integration.VALUE,
    integration.DISPLAY_NAME,
    integration.SEQUENCE,
    integration.API_TECHNICAL_NAME,
    integration.FETCH_METHOD,
    integration.FETCH_PATH,
    integration.status,
    max(idea_object_integration.api_id) as api_id
    from( 
                    select      idea_integration.integration_object_uuid,
                                idea_integration.idea_id,
                                                STRING_AGG(idea_integration.CREATED_AT, '※') AS CREATE_AT ,
                                                STRING_AGG(idea_integration.CHANGED_AT, '※') AS CHANGED_AT ,
                                                STRING_AGG(idea_integration.MAPPING_FIELD_CODE, '※') AS CODE ,
                                                STRING_AGG(idea_integration.MAPPING_FIELD_VALUE, '※')  AS VALUE, 
                                                STRING_AGG(idea_integration.DISPLAY_NAME, '※')  AS DISPLAY_NAME, 
                                                STRING_AGG(idea_integration.DISPLAY_SEQUENCE, '※')  AS SEQUENCE,
                                                idea_integration.API_TECHNICAL_NAME,
                                                --max(idea_integration.API_ID),
                                                campaign_integration.ID AS API_ID,
                                                campaign_integration.FETCH_METHOD,
                                                campaign_integration.FETCH_PATH,
                                                campaign_integration.status
                                    from (select object_integration.*,
                                                   cur_layout.DISPLAY_NAME,
                                                   cur_layout.DISPLAY_SEQUENCE
                                            from "sap.ino.db.integration::t_idea_object_integration" as object_integration
                                            inner join "sap.ino.db.integration::t_campaign_integration_api_attributes_layout" as cur_layout
                                            on cur_layout.api_id = object_integration.api_id and cur_layout.MAPPING_FIELD_CODE = object_integration.MAPPING_FIELD_CODE
                                            union all 
                                            select object_integration.*,
                                                   old_layout.DISPLAY_NAME,
                                                   old_layout.DISPLAY_SEQUENCE
                                            from "sap.ino.db.integration::t_idea_object_integration" as object_integration
                                            inner join "sap.ino.db.integration::t_api_layout_copy" as old_layout
                                            on old_layout.api_id = object_integration.api_id  and old_layout.MAPPING_FIELD_CODE = object_integration.MAPPING_FIELD_CODE)
                                    as idea_integration
                                    left outer join "sap.ino.db.integration::t_campaign_integration" as campaign_integration
                                    on campaign_integration.TECHNICAL_NAME = idea_integration.API_TECHNICAL_NAME and campaign_integration.campaign_id = ?

                                    where idea_id =  ?
                                    group by idea_integration.integration_object_uuid,
                                             idea_integration.idea_id,
                                             idea_integration.API_TECHNICAL_NAME,
                                             idea_integration.API_ID,
                                             campaign_integration.ID,
                                             campaign_integration.FETCH_METHOD,
                                             campaign_integration.FETCH_PATH,
                                             campaign_integration.status
    ) as integration
    left outer join "sap.ino.db.integration::t_idea_object_integration" as idea_object_integration
    on idea_object_integration.API_TECHNICAL_NAME = integration.API_TECHNICAL_NAME and idea_object_integration.idea_id = integration.idea_id
    group by integration.integration_object_uuid,
    integration.CREATE_AT,
    integration.CHANGED_AT,
    integration.CODE,
    integration.VALUE,
    integration.DISPLAY_NAME,
    integration.SEQUENCE,
    integration.API_TECHNICAL_NAME,
    integration.FETCH_METHOD,
    integration.FETCH_PATH,
    integration.status`;
	const aIdeaObjectMappingField = oLHQ.statement(aIdeaObjectFieldsQuery).execute(campaign_id, idea_id);

	const aIdeaObjectLayoutQuery =
		`
                                        select * from(
                                        select ID,API_ID,MAPPING_FIELD_CODE,DISPLAY_NAME,DISPLAY_SEQUENCE from"sap.ino.db.integration::t_campaign_integration_api_attributes_layout"
                                        union 
                                        select * from "sap.ino.db.integration::t_api_layout_copy")
                                        `;
	const aIdeaObjectLayoutResult = oLHQ.statement(aIdeaObjectLayoutQuery).execute();
	var aIdeaObjectLayout = _.groupBy(aIdeaObjectLayoutResult, 'API_ID');

	// preocess 
	var aIdeaIntegrationList = [];
	aIdeaObjectMappingField.forEach(function(element) {
		const integrationObject = {};
		const aSequence = element.SEQUENCE.split('※');
		const aDisplayName = element.DISPLAY_NAME.split('※');
		const sUuid = element.INTEGRATION_OBJECT_UUID;
		const aFieldCode = element.CODE.split('※');
		const aValue = element.VALUE.split('※');
		const sAPI_ID = element.API_ID;
		const aCreateDate = _.map(element.CREATE_AT.split('※'), function(element) {
			var aTime = element.split(' ');
			return {
				newDate: new Date(aTime.join('T')),
				oldDate: element
			};
		});
		const aRefreshDate = _.map(element.CHANGED_AT.split('※'), function(element) {
			var aTime = element.split(' ');
			return {
				newDate: new Date(aTime.join('T')),
				oldDate: element
			};
		});
		const dMostLate = getMostDate(aRefreshDate, 'max').oldDate ? getMostDate(aRefreshDate, 'max').oldDate : 'Invlid Date';
		const oMostEarly = getMostDate(aCreateDate, 'min').oldDate ? getMostDate(aCreateDate, 'min').oldDate : 'Invlid Date';

		var bQueryEnable = false;

		const aLayoutSequence = _.pluck(aIdeaObjectLayout[sAPI_ID], 'DISPLAY_SEQUENCE');
		var oDisplayName = {};
		aSequence.forEach(function(element, index) {
			oDisplayName[element] = aDisplayName[index];
		});
		var oFieldCode = {};
		aSequence.forEach(function(element, index) {
			oFieldCode[element] = aFieldCode[index];
		});
		var oValue = {};
		aSequence.forEach(function(element, index) {
			oValue[element] = aValue[index];
		});

		if (element.FETCH_METHOD && element.FETCH_PATH && element.STATUS === 'active') {
			bQueryEnable = true;
		}

		_.each(aLayoutSequence, function(item, index) {
			if (item && !~aSequence.indexOf(item.toString())) {
				const oUnUsedLayout = _.find(aIdeaObjectLayout[sAPI_ID], function(element) {
					return element.DISPLAY_SEQUENCE === item;
				});
				if (oUnUsedLayout.MAPPING_FIELD_CODE === 'CREATED_AT' || oUnUsedLayout.MAPPING_FIELD_CODE === 'LAST_REFRESHED_AT') {
					integrationObject[item] = {
						displayName: oUnUsedLayout.DISPLAY_NAME,
						fieldCode: oUnUsedLayout.MAPPING_FIELD_CODE,
						value: oUnUsedLayout.MAPPING_FIELD_CODE === 'CREATED_AT' ? oMostEarly.toString() : dMostLate.toString()
					};
				} else {
					integrationObject[item] = {
						displayName: oUnUsedLayout.DISPLAY_NAME,
						fieldCode: oUnUsedLayout.MAPPING_FIELD_CODE,
						value: ''
					};
				}

			} else {
				integrationObject[item] = {
					displayName: oDisplayName[item],
					fieldCode: oFieldCode[item],
					value: oValue[item]
				};
			}
		});

		integrationObject.API_TECHNICAL_NAME = element.API_TECHNICAL_NAME;
		integrationObject.QUERY_ENABLE = bQueryEnable;
		integrationObject.INTEGRATION_OBJECT_UUID = sUuid;
		integrationObject.API_ID = sAPI_ID;
		integrationObject.LAST_REFRESHED_DATE = dMostLate;
		aIdeaIntegrationList.push(integrationObject);
	});

	return aIdeaIntegrationList;

}

function getMostDate(aDateList, sType) {
	var temp = aDateList[0];
	if (sType === 'max') {
		for (var i = 0; i < aDateList.length - 1; i++) {
			if (temp.newDate < aDateList[i].newDate) {
				temp = aDateList[i];
			}
		}
	} else if (sType === 'min') {
		for (var j = 0; j < aDateList.length - 1; j++) {
			if (temp.newDate > aDateList[j].newDate) {
				temp = aDateList[j];
			}
		}
	}
	return temp;
}

//END