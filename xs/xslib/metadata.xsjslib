var Message = $.import("sap.ino.xs.aof.lib", "message");
var Repo = $.import("sap.ino.xsdc.xslib", "repo");
var DBConnection = $.import("sap.ino.xs.xslib", "dbConnection");
var METADATA = $.import("sap.ino.xs.aof.rest", "metadata");

function prepareFile() {
	var sFileName = 'allmetadata.json';
	var content = JSON.stringify(METADATA.getAllMetadata());
	var oFile = {
		content: content,
		package: "sap.ino.ngui.build.resources.sap.ino.corelib",
		filename: sFileName,
		isBinary: false
	};

	oFile.size = oFile.content ? oFile.content.byteLength : 0;

	var p = oFile.filename.lastIndexOf(".");
	oFile.type = oFile.filename.substring(p + 1);
	oFile.name = oFile.filename.substring(0, p);

	return oFile;
}

function storeFile(oFile, oDBConnection) {
	Repo.upsertFilesSQLCC([oFile], oDBConnection);
}

function internalProcess(){
	var oDBConnection = DBConnection.getDeprecatedConnection($.db.isolation.SERIALIZABLE, true);
	var oFile = prepareFile();
	oDBConnection.setAutoCommit(false);
	storeFile(oFile, oDBConnection);
	oDBConnection.commit();
	oDBConnection.close();
}

function process(oRequest, oResponse) {
	internalProcess();
    oResponse.setBody("Generated meta data successfully.");
}

