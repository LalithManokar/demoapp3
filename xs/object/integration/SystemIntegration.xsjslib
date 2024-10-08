const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var IntegrationMessage = $.import("sap.ino.xs.object.integration", "message");

const TypeCode = ['CREATEAPI', 'QUERYAPI'];

this.definition = {
	Root: {
		table: "sap.ino.db.integration::t_system_integration",
		sequence: "sap.ino.db.integration::s_system_integration",
		determinations: {
			onCreate: [initAPI, checkForTechnicalName],
			onModify: [determine.systemAdminData],
			onUpdate: [checkUpdateTechnicalName],
			onPersist: [updateAllCampIntegration]
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
			APINAME: {
				required: true
			},
			TECHNICAL_NAME: {
				required: true
			},
			SYSTEM_NAME: {
				required: true
			},
			SYSTEM_PACKAGE_NAME: {
				required: true
			},
			CREATE_METHOD: {
				required: true
			},
			CREATE_PATH: {
				required: false
			},
			FETCH_METHOD: {
				required: false
			},
			FETCH_PATH: {
				required: false
			},
			CREATE_REQ_JSON: {
				required: true
			},
			CREATE_RES_JSON: {
				required: false
			},
			FETCH_REQ_JSON: {
				required: false
			},
			FETCH_RES_JSON: {
				required: false
			},
			STATUS: {
				required: true
			},
			CREATE_TOKEN_URL: {
				required: false
			},
			CREATE_TOKEN_KEY: {
				required: false
			},
			CREATE_TOKEN_VALUE: {
				required: false
			},
			FETCH_TOKEN_URL: {
				required: false
			},
			FETCH_TOKEN_KEY: {
				required: false
			},
			FETCH_TOKEN_VALUE: {
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
			authorizationCheck: false,
			executionCheck: delExecutionCheck
		},
		getAllDestinations: {
			authorizationCheck: false,
			execute: getAllDestinations,
			isStatic: true
		},
		getAllMappingField: {
			authorizationCheck: false,
			execute: getAllMappingField,
			isStatic: true
		},
		syncMappingField: {
		    authorizationCheck: false,
			execute: syncMappingField,
			isStatic: true
		}
	}
};

function syncMappingField(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {
    const integrationSync = $.import("sap.ino.xs.xslib.integration", "integrationSync");
    const system_integration_technincal_name = oReq.TECHNICAL_NAME ? oReq.TECHNICAL_NAME : '';
    integrationSync.execute(system_integration_technincal_name)
}

function checkForTechnicalName(vKey, oAPI, oPersistedObject, addMessage, fnNextHandle, oContext) {
	//handle unique technical name of api 
	var oHQ = oContext.getHQ();
	const sApiTechnicalQuery = 'select technical_name from "sap.ino.db.integration::t_system_integration"';
	var aApiTechnicalname = oHQ.statement(sApiTechnicalQuery).execute();
	var bError = false;
	aApiTechnicalname.forEach(function(element) {
		if (!bError && element.TECHNICAL_NAME === oAPI.TECHNICAL_NAME) {
			bError = true;
		}
	});

	if (bError) {
		return addMessage(Message.MessageSeverity.Error, IntegrationMessage.INTEGRATION_TECHNICALNAME_DUPLICATE_WARNING, vKey, "Root",
			"TECHNICAL_NAME");
	}
}

function checkUpdateTechnicalName(vKey, oAPI, oPersistedObject, addMessage, fnNextHandle, oContext) {
	//handle unique technical name of api 
	var oHQ = oContext.getHQ();
	const sApiTechnicalQuery = 'select technical_name,ID from "sap.ino.db.integration::t_system_integration"';
	var aApiTechnicalname = oHQ.statement(sApiTechnicalQuery).execute();
	var bError = false;
	aApiTechnicalname.forEach(function(element) {
		if (!bError && element.TECHNICAL_NAME === oAPI.TECHNICAL_NAME && element.ID !== oAPI.ID) {
			bError = true;
		}
	});

	if (bError) {
		return addMessage(Message.MessageSeverity.Error, IntegrationMessage.INTEGRATION_TECHNICALNAME_DUPLICATE_WARNING, vKey, "Root",
			"TECHNICAL_NAME");
	}
	const sSelect = 'SELECT 1 FROM "sap.ino.db.integration::t_campaign_integration" WHERE TECHNICAL_NAME=?';
	var result = oHQ.statement(sSelect).execute(oPersistedObject.TECHNICAL_NAME);

	if (oPersistedObject && result.length >= 1 && oAPI.TECHNICAL_NAME !== oPersistedObject.TECHNICAL_NAME) {
		return addMessage(Message.MessageSeverity.Error, IntegrationMessage.INTEGRATION_TECHNICALNAME_UNCHANGABLE_WARNING, vKey, "Root",
			"TECHNICAL_NAME");
	}
// 	if (oPersistedObject && result.length >= 1 && (oAPI.TECHNICAL_NAME !== oPersistedObject.TECHNICAL_NAME || oAPI.CREATE_REQ_JSON !==
// 		oPersistedObject.CREATE_REQ_JSON || oAPI.CREATE_RES_JSON !== oPersistedObject.CREATE_RES_JSON || oAPI.FETCH_REQ_JSON !==
// 		oPersistedObject.FETCH_REQ_JSON || oAPI.FETCH_RES_JSON !== oPersistedObject.FETCH_RES_JSON)) {
// 		return addMessage(Message.MessageSeverity.Error, IntegrationMessage.INTEGRATION_MAPPING_UNCHANGABLE_WARNING, vKey, "Root",
// 			"MAPPING_FIELD");
// 	}
}

function updateAllCampIntegration(vKey, oAPI, oPersistedObject, fnMessage, fnNextHandle, oContext) {
	if (oContext.getAction().name !== 'update') {
		return;
	}
	var oHQ = oContext.getHQ();
	const sApiTechnicalQuery =
		`UPDATE "sap.ino.db.integration::t_campaign_integration" 
	SET CREATE_METHOD=?,CREATE_PATH=?,FETCH_METHOD=?,FETCH_PATH=?,STATUS=?,APINAME=?,SYSTEM_NAME=?,SYSTEM_PACKAGE_NAME=?
	WHERE TECHNICAL_NAME=?`;
	oHQ.statement(sApiTechnicalQuery).execute([oAPI.CREATE_METHOD, oAPI.CREATE_PATH, oAPI.FETCH_METHOD,
		oAPI.FETCH_PATH, oAPI.STATUS, oAPI.APINAME, oAPI.SYSTEM_NAME, oAPI.SYSTEM_PACKAGE_NAME,oAPI.TECHNICAL_NAME]);
}

function initAPI(vKey, oAPI, oPersistedObject, addMessage, fnNextHandle, oContext) {
	oAPI.CREATED_AT = null;
	oAPI.CREATED_BY = null;
	oAPI.CHANGED_AT = null;
	oAPI.CHANGED_BY = null;
	// 	sApiTechnicalQuery.forEach(function(element){
	// 	    if()
	// 	});
}

function delExecutionCheck(vKey, oChangeRequest, oWorkObject, oPersistedObject, addMessage, oContext) {
	var oHQ = oContext.getHQ();
	const sSelect = 'SELECT 1 FROM "sap.ino.db.integration::t_campaign_integration" WHERE TECHNICAL_NAME=?';
	var result = oHQ.statement(sSelect).execute(oPersistedObject.TECHNICAL_NAME);
	if (result.length >= 1) {
		return addMessage(Message.MessageSeverity.Error, IntegrationMessage.INTEGRATION_TECHNICALNAME_DELETION_WARNING, vKey, "Root",
			"TECHNICAL_NAME");
	}
}

function getAllDestinations() {
	var Destination = $.import("sap.ino.xs.rest.commonIntegration", "destinations");
	return Destination.getAllDestinations();
}

function getAllMappingField(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode) {

	var oHQ = oContext.getHQ();
	var sSelectQuery = 'select FIELD_CODE,TEXT_CODE,TYPE_CODE from "sap.ino.db.integration::t_integration_field_mapping" ';
	var aResult = oHQ.statement(sSelectQuery).execute();
	return aResult;
}

//END
