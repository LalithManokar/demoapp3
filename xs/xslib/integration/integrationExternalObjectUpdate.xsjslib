const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var EnhancementSpot = $.import("sap.ino.xs.xslib.enhancement", "EnhancementSpot");
const ideaObjectIntegration = $.import("sap.ino.xs.object.integration", "IdeaObjectIntegration");
var authSetUser = $.import("sap.ino.xs.aof.core", "authorization");

function updateExternalObject(oHQ, oReq, oMessage) {
	var oBody, aHeaders;
	if (oReq.body) {
		oBody = JSON.parse(oReq.body.asString());
	} else {
		oMessage.type = "E";
		oMessage.message = "Request doesn't contain any body!";
		return;
	}
	aHeaders = oReq.headers;

	//2.Get the system and object id for the destination
	var aDestinations = getHttpDestinationsInfo(oHQ);

	var oSystemAndObjectKey = getSystemAndObjectKey(oHQ, oReq, oBody, aHeaders, aDestinations, oMessage);

	var sBody = JSON.stringify(oBody);
	//Store the need updated data into table.
	storeUpdateExternalObject(oHQ, oSystemAndObjectKey, sBody, oMessage);

}

function getHttpDestinationsInfo(oHQ) {
	var sQueryDest =
		`select package_id,object_name,host,port from "_SYS_XS"."HTTP_DESTINATIONS" 
                      where package_id = 'sap.ino.xs.rest.commonIntegration' 
                      and object_name in('Destination1','Destination2','Destination3','Destination4','Destination5')`;
	var aDestinations = oHQ.statement(sQueryDest).execute();
	return aDestinations;
}

function getSystemAndObjectKey(oHQ, oReq, oBody, aHeaders, aDestinations, oMessage) {
	//For Jira
	//var host = oBody.issue.self;
	var oIntegrationExternalObjectUpdateEs = EnhancementSpot.get("sap.ino.xs.xslib.integration.IntegrationExternalObjectUpdateEs");
	var oSysteminfoAndObjectKey = {
		systemHost: null,
		objectKey: null
	};

	if (oIntegrationExternalObjectUpdateEs) {
		oIntegrationExternalObjectUpdateEs.getSysteminfoAndObjectKey(oReq, oBody, aHeaders, oSysteminfoAndObjectKey);
	}
	oSysteminfoAndObjectKey.systemIDs = [];
	for (var i = 0; i < aDestinations.length; i++) {
		if (aDestinations[i].HOST === oSysteminfoAndObjectKey.systemHost) {
			oSysteminfoAndObjectKey.systemIDs.push(aDestinations[i].OBJECT_NAME);
		}
	}
	if (oSysteminfoAndObjectKey.systemIDs.length === 0) {
		oMessage.type = "E";
		oMessage.message = "System Host is not found";
		return;
	}

	return oSysteminfoAndObjectKey;
}

function storeUpdateExternalObject(oHQ, oSysObjectInfo, oBody, oMessage) {
	if (!oSysObjectInfo) {
		return;
	}
	var aIntegrationObjects = [];
	var sIntegrationObject =
		`
               select integration_object_uuid, 
               api_technical_name,
               idea_id,
               idea.campaign_id from "sap.ino.db.integration::t_idea_object_integration"  as object_integration
               left outer join "sap.ino.db.idea::t_idea" as idea on object_integration.idea_id = idea.id
               where object_integration.mapping_field_code = 'OBJECT_ID' 
               and object_integration.system_name = ? and object_integration.mapping_field_value = ? `;
	for (var i = 0; i < oSysObjectInfo.systemIDs.length; i++) {

		aIntegrationObjects = oHQ.statement(sIntegrationObject).execute(oSysObjectInfo.systemIDs[i], oSysObjectInfo.objectKey);
		if (aIntegrationObjects.length > 0) {
			var oUpdateObject = {
				IDEA_ID: aIntegrationObjects[0].IDEA_ID,
				CAMPAIGN_ID: aIntegrationObjects[0].CAMPAIGN_ID,
				API_TECH_NAME: aIntegrationObjects[0].API_TECHNICAL_NAME,
				INTEGRATION_OBJECT_UUID: aIntegrationObjects[0].INTEGRATION_OBJECT_UUID,
				HOST: oSysObjectInfo.systemHost,
				DESTINATION_NAME: oSysObjectInfo.systemIDs[i],
				OBJECT_KEY: oSysObjectInfo.objectKey
			};
			var sCreateRecord =
				`INSERT INTO "sap.ino.db.webhook::t_external_object_need_update" 
          values("sap.ino.db.webhook::s_external_object_need_update".nextval,?,?,?,?,current_utctimestamp,1,?,?,?,?)`;
			oHQ.statement(sCreateRecord).execute(oUpdateObject.INTEGRATION_OBJECT_UUID, oUpdateObject.HOST, oUpdateObject.DESTINATION_NAME,
				oUpdateObject.OBJECT_KEY, oBody.toString(), oUpdateObject.IDEA_ID, oUpdateObject.CAMPAIGN_ID, oUpdateObject.API_TECH_NAME);
			oMessage.type = "S";
			oMessage.message = "Post Successfully";
			break;
		}
	}
	if (!oMessage.type) {
		oMessage.type = "W";
		oMessage.message = "Record not found. Nothing to Post";
	}

}