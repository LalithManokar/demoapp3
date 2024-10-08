const trace = $.import("sap.ino.xs.xslib", "trace");
const whoAmI = 'sap.ino.xs.xslib.meteringService.xsjslib';
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();

function warning(line) {
	trace.warning(whoAmI, line);
}

function debug(line) {
	trace.debug(whoAmI, line);
}

var MeteringClient = (function() {
	var _HTTP_METHOD_ = {
			'GET': $.net.http.GET,
			'POST': $.net.http.POST
		},
		_client = new $.net.http.Client(),
		_sAuthToken,
		_aBody = [],
		_getAuthorization = function() {
			return {
				key: "Authorization",
				value: "Bearer " + _sAuthToken
			};
		};
	var _checkResponseStatus = function(oResponse, sMsg) {
		for (var c in oResponse.headers) {
			if (oResponse.headers[c].name === '~status_code' && oResponse.headers[c].value !== '200' && oResponse.headers[c].value !== '204') {
				var sDeatailMsg = !oResponse.body ? "" : oResponse.body.asString();
				throw new Error(sMsg + ", the status code of response is " + (oResponse.headers[c].value || "").toString() + "\r\nthe deatail:\r\n" +
					(sDeatailMsg || "").replace(/[{}]/g, ""));
			}
		}
	};

	var _sendRequest = function(sDestination, sMethod, sUrl, aHeaders, sBody, sMsg) {
		//var destination = $.net.http.readDestination("sap.ino.xs.rest", sDestination);
		var request = new $.net.http.Request(_HTTP_METHOD_[sMethod], sUrl);
		if (aHeaders && aHeaders.length > 0) {
			_.each(aHeaders, function(header) {
				request.headers.set(header.key, header.value);
			});
		}
		if (sBody) {
			request.setBody(sBody);
		}
		var response = _client.request(request, sDestination).getResponse();
		_checkResponseStatus(response, sMsg);
		return response;
	};

	var _getAuthToken = function(authDestination) {
		var oBody;
		var aHeaders = [{
			key: "accept",
			value: "application/json"
		}, {
			key: "Content-Type",
			value: "application/x-www-form-urlencoded"
		}];
		var response = _sendRequest(authDestination, "POST", "/token?grant_type=client_credentials&scope=read+write", aHeaders,
			'', "when getting auth token from auth service");
		if (response.body) {
			try {
				oBody = JSON.parse(response.body.asString());
			} catch (e) {
				oBody = response.body.asString();
			}
		}
		if (!oBody || !oBody.hasOwnProperty("access_token")) {
			throw new Error("getting token failure.");
		}
		_sAuthToken = oBody.access_token;
	};

	var _postMeteringData = function(meteringDestination, oReportData, sInterfaceUrl) {
		var aHeaders = [_getAuthorization(), {
				key: "Content-Type",
				value: "application/json"
		}],
			instant = new Date();
		var subaccount = systemSettings.getIniValue("subaccount") || "defaultAccount";
		_sendRequestData(meteringDestination, aHeaders, instant, subaccount.toLowerCase(), oReportData, sInterfaceUrl);
	};

	var _sendRequestData = function(meteringDestination, aHeaders, instant, subaccount, oReportData, sInterfaceUrl) {
		var basicKeys = ["metricKey", "application", "tenantAccount", "instant", "value"],
			keys = Object.keys(oReportData[0]),
			dKeys = _.difference(keys, basicKeys);
		_.each(oReportData, function(reportData) {
			var data = {
				"metricKey": reportData.metricKey,
				"application": "sapino",
				"tenantAccount": subaccount,
				"instant": !reportData.instant ? instant.toString() : new Date(reportData.instant).toString(),
				"value": reportData.value
			};
			_.each(dKeys, function(key) {
				data[key] = reportData[key];
			});
			_aBody.push(data);
		});
		_sendRequest(meteringDestination, "POST", sInterfaceUrl || "/meteringservice/meteringdata", aHeaders, JSON.stringify(_aBody),
			"when posting data into metering service");
	};

	var _getPostData = function() {
		return JSON.stringify(_aBody);
	};

	var _getMeteringData = function(meteringDestination, sInterfaceUrl) {
		var aHeaders = [_getAuthorization()];
		var response = _sendRequest(meteringDestination, "GET", (sInterfaceUrl || "/meteringservice/meteringdata") +
			"?$select=metricKey,value,instant,account,tenantAccount&$orderBy=instant%20desc&metricKey=sapinm.*",
			aHeaders, '', "when geting data from metering service");
		var myCookies = [],
			myHeader = [],
			myBody;
		for (var c in response.cookies) {
			myCookies.push(response.cookies[c]);
		}
		for (var h in response.headers) {
			myHeader.push(response.headers[h]);
		}
		if (response.body) {
			try {
				myBody = JSON.parse(response.body.asString());
			} catch (e) {
				myBody = response.body.asString();
			}
		}
		$.response.contentType = "application/json";
		$.response.setBody(JSON.stringify({
			"status": response.status,
			"body": myBody,
			"cookies": myCookies,
			"headers": myHeader
		}));
	};

	return {
		postMeteringData: function(authDestination, meteringDestination, oReportData, sInterfaceUrl) {
			if (!oReportData) {
				return;
			}
			var authDest = authDestination || $.net.http.readDestination("sap.ino.xs.xslib.metering", "oauthasservices");
			var meteringDest = meteringDestination || $.net.http.readDestination("sap.ino.xs.xslib.metering", "meteringservice");
			if (!_sAuthToken) {
				_getAuthToken(authDest);
			}
			_postMeteringData(meteringDest, oReportData, sInterfaceUrl);
		},
		getMeteringData: function(authDestination, meteringDestination) {
			var authDest = authDestination || $.net.http.readDestination("sap.ino.xs.xslib.metering", "oauthasservices");
			var meteringDest = meteringDestination || $.net.http.readDestination("sap.ino.xs.xslib.metering", "meteringservice");
			if (!_sAuthToken) {
				_getAuthToken(authDest);
			}
			return _getMeteringData(meteringDest);
		},
		getPostData: function() {
			return _getPostData();
		}
	};
})();