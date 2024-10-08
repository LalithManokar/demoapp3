$.import("sap.ino.xs.xslib", "hQuery");
var PARSER = $.import("sap.ino.xs.xslib", "csvParser");
var tableMapping = $.import("sap.ino.xs.rest.transport", "transportTableMapping");
//Database Connection
var conn = $.db.getConnection();
// hQuery and sequence
var hq = $.sap.ino.xs.xslib.hQuery.hQuery(conn);

function importData(oHQ, oReq, oMessage) {
	var oZip;
	if (oReq.body) {
		oZip = new $.util.Zip(oReq.body.asArrayBuffer());
	} else {
		oMessage.type = "E";
		oMessage.message = "Request doesn't contain any body!";
		return;
	}
	importPreparedData(oHQ, oZip, oMessage);
}

function insteadPackage(sContent, sPackage, tPackage) {
	if (sContent.indexOf(sPackage) === 0) {
		sContent = sContent.replace(sPackage, tPackage);
	}
	return sContent;
}

function importPreparedData(oHQ, oZip, oMessage) {
	var sUserName = $.session.getUsername();
	var sQueryIdentityID = 'select top 1 ID from "sap.ino.db.iam::v_identity" where user_name = ?';
	var aIdentityID = oHQ.statement(sQueryIdentityID).execute(sUserName);
	if (aIdentityID.length === 0) {
		oMessage.message = "Identity id is not existed";
		oMessage.type = "E";
		return;
	}
	var sSourcePackage, sTargetPackage;
	if (!oZip["T_PACKAGE_INFO.csv"]) {
		oMessage.message = "Original Package info Table file ( T_PACKAGE_INFO.csv ) not include in the Zip File!";
		oMessage.type = "E";
		return;
	} else {
		var aPackageContent = $.util.stringify(oZip["T_PACKAGE_INFO.csv"]).split("\r");
		aPackageContent.shift();
		if (aPackageContent.length === 0) {
			oMessage.message = "Original Package info table content is empty!";
			oMessage.type = "E";
			return;
		}
		sSourcePackage = aPackageContent[0].substring(0, aPackageContent[0].length - 1).split(",")[0];
	}

	///Get current system data
	var sQueryCurrentPackage = 'select *  from "sap.ino.db.config::t_config_content_package"';
	var aPackageResult = oHQ.statement(sQueryCurrentPackage).execute();
	if (aPackageResult.length === 0) {
		oMessage.message = "System Package is not existed";
		oMessage.type = "E";
		return;
	}
	sTargetPackage = aPackageResult[0].PACKAGE_ID;

	for (var tableAttr in oZip) {
		var i, j, aInsertData = [];
		var oDate = new Date();
		var sTableName = tableAttr.split(".")[0];
		if (tableMapping.oTableMapping[sTableName] && sTableName !== "T_PACKAGE_INFO") {
			oMessage.tables.push(tableMapping.oTableMapping[sTableName]);
			var aTableContent = $.util.stringify(oZip[tableAttr]).split("\r");
			var sHeader = aTableContent.shift();
			var aHeader = sHeader.substring(0, sHeader.length - 1).split(",");
			for (i = 0; i < aTableContent.length; i++) {
				if (!aTableContent[i].trim()) {
					continue;
				}
				var aRowContent = aTableContent[i].substring(0, aTableContent[i].length - 1).split(",");
				var oInsertObject = {};
				for (j = 0; j < aRowContent.length; j++) {
					//Replace the special character to back(<comma> -> ','  <breakline> - > '\n') 
					aRowContent[j] = typeof(aRowContent[j]) === "string" ? aRowContent[j].replace(/<comma>/g, ",") : aRowContent[j];
					aRowContent[j] = typeof(aRowContent[j]) === "string" ? aRowContent[j].replace(/<breakline>/g, "\n") : aRowContent[j];
					aRowContent[j] = tableMapping.oIgnoreField[aHeader[j]] ? aIdentityID[0].ID : aRowContent[j];

					aRowContent[j] = aHeader[j] === "DEFAULT_COACH" ? null : aRowContent[j];
					aRowContent[j] = aHeader[j] === "CREATED_AT" ? oDate : aRowContent[j];
					aRowContent[j] = aHeader[j] === "CHANGED_AT" ? oDate : aRowContent[j];
					//Replace Package to traget system
					aRowContent[j] = tableMapping.oPackageCodeField[aHeader[j]] ? insteadPackage(aRowContent[j], sSourcePackage, sTargetPackage) :
						aRowContent[j];
					oInsertObject[aHeader[j]] = aRowContent[j];
				}
				aInsertData.push(oInsertObject);
			}
			oMessage.message = tableMapping.oTableMapping[sTableName] + "-";
			var sDeleteData = 'delete  from "' + tableMapping.oTableMapping[sTableName] + '"';
			oHQ.statement(sDeleteData).execute();
			oHQ.table("SAP_INO", tableMapping.oTableMapping[sTableName]).insert(aInsertData);
		}
	}
	if (oMessage.tables.length > 0) {
		oMessage.type = "S";
		oMessage.message = "Tables Imported Successfully";
	} else {
		oMessage.type = "S";
		oMessage.message = "No Table Imported!";
	}
}