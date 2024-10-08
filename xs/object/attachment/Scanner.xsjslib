var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const trace = $.import("sap.ino.xs.xslib", "trace");
const whoAmI = 'sap.ino.xs.object.attachment.Scan.xsjslib';

function error(line) {
	trace.error(whoAmI, line);
}

var ContentType = {
	JSON: "application/json"
};

function _getPPMDestination() {
	return $.net.http.readDestination("sap.ino.xs.object.attachment", "malwarescan");
}

function preCheck() {
	var oHttpClient = new $.net.http.Client();
	try {
		var oDest = _getPPMDestination();
		var oRequest = new $.net.http.Request($.net.http.GET, '/info');
		oRequest.headers.set("accept", ContentType.JSON);
		var oResponse = oHttpClient.request(oRequest, oDest).getResponse();
		if (oResponse.status === 200) {
			return true;
		}
		error(oResponse.body.asString());
		return false;
	} catch (ex) {
		error(ex);
		return false;
	} finally {
		oHttpClient.close();
	}
}

function scan(oContent) {
	var oHttpClient = new $.net.http.Client();
	try {
		var oDest = _getPPMDestination();
		var oRequest = new $.net.http.Request($.net.http.POST, '/scan');
		oRequest.headers.set("accept", ContentType.JSON);
		oRequest.headers.set("Content-Type", "application/octet-stream");
		oRequest.setBody(oContent);
		var oResponse = oHttpClient.request(oRequest, oDest).getResponse();
		if (oResponse.status === 200) {
			var oResult = JSON.parse(oResponse.body.asString());
			if (!oResult.malwareDetected) {
				return {
					success: true
				};
			}
			return {
				success: false,
				msg: oResult.finding
			};
		}
		error(oResponse.body.asString());
		return {
			success: false
		};
	} catch (ex) {
		error(ex);
		return {
			success: false,
			msg: ex
		};
	} finally {
		oHttpClient.close();
	}
}