const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const ohQuery = $.import("sap.ino.xs.xslib", "hQuery");
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var oHQ = ohQuery.hQuery(oConn).setSchema("SAP_INO");
var aWhitelist = [];
var textBundle = $.import("sap.ino.xs.xslib", "textBundle");
var AOF = $.import("sap.ino.xs.aof.core", "framework");

function WhitelistEntry(protocol, host, port, path){
	if (protocol) {
		this.protocol = protocol.toUpperCase();
	}
	if (host) {
		this.host = host.toUpperCase();
	}
	this.port = port;
	this.path = path;
}

function addUrlWhitelist(protocol, host, port, path) {
	var oEntry = new WhitelistEntry(protocol, host, port, path);
	var iIndex = aWhitelist.length;
	aWhitelist[iIndex] = oEntry;
}

function initURLWhitelist() {
    var sSelect = 'select * from "sap.ino.db.basis.ext::v_ext_url_whitelist"';
	var aURLWhitelist = oHQ.statement(sSelect).execute();
	if (aURLWhitelist.length > 0) {
	    _.each(aURLWhitelist, function(oWhitelistEntry) {
			addUrlWhitelist(oWhitelistEntry.PROTOCOL, oWhitelistEntry.HOST, oWhitelistEntry.PORT, oWhitelistEntry.PATH);
		});
	}
	sSelect = 'select * from "sap.ino.db.basis::v_ino_system_settings" ' +
                                "where key = 'host'";
	var aHost = oHQ.statement(sSelect).execute();
	var sHostUrl = aHost[0] && aHost[0].VALUE;
	var result = /^(?:([^:\/?#]+):)?((?:\/\/((?:\[[^\]]+\]|[^\/?#:]+))(?::([0-9]+))?)?([^?#]*))(?:\?([^#]*))?(?:#(.*))?$/.exec(sHostUrl);
	var sProtocol = result[1],
		sHost = result[3],
		sPort = result[4],
		sPath = result[5];
		
	if (result) {
	    addUrlWhitelist(sProtocol, sHost, sPort, sPath);
	}
}

function validateUrl(sUrl) {

	var result = /^(?:([^:\/?#]+):)?((?:\/\/((?:\[[^\]]+\]|[^\/?#:]+))(?::([0-9]+))?)?([^?#]*))(?:\?([^#]*))?(?:#(.*))?$/.exec(sUrl);
	if (!result) {
		return false;
	}
	
	var sProtocol = result[1],
		sBody = result[2],
		sHost = result[3],
		sPort = result[4],
		sPath = result[5],
		sQuery = result[6],
		sHash = result[7];

	var rCheckPath = /^([a-z0-9-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*$/i;
	var rCheckQuery = /^([a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9a-f]{2})*$/i;
	var rCheckFragment = rCheckQuery;
	var rCheckMail =
		/^([a-z0-9!$'*+:^_`{|}~-]|%[0-9a-f]{2})+(?:\.([a-z0-9!$'*+:^_`{|}~-]|%[0-9a-f]{2})+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
	var rCheckIPv4 = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
	var rCheckValidIPv4 = /^(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$/;
	var rCheckIPv6 = /^\[[^\]]+\]$/;
	var rCheckValidIPv6 =
		/^\[(((([0-9a-f]{1,4}:){6}|(::([0-9a-f]{1,4}:){5})|(([0-9a-f]{1,4})?::([0-9a-f]{1,4}:){4})|((([0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::([0-9a-f]{1,4}:){3})|((([0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::([0-9a-f]{1,4}:){2})|((([0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:)|((([0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::))(([0-9a-f]{1,4}:[0-9a-f]{1,4})|(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])))|((([0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4})|((([0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::))\]$/i;
	var rCheckHostName = /^([a-z0-9]([a-z0-9\-]*[a-z0-9])?\.)*[a-z0-9]([a-z0-9\-]*[a-z0-9])?$/i;
	var i = 0;

	// protocol
	if (sProtocol) {
		sProtocol = sProtocol.toUpperCase();
		if (aWhitelist.length <= 0) {
			// no whitelist -> check for default protocols
			if (!/^(https?|ftp)/i.test(sProtocol)) {
				return false;
			}
		}
	}

	// Host -> validity check for IP address or hostname
	if (sHost) {
		if (rCheckIPv4.test(sHost)) {
			if (!rCheckValidIPv4.test(sHost)) {
				//invalid ipv4 address
				return false;
			}
		} else if (rCheckIPv6.test(sHost)) {
			if (!rCheckValidIPv6.test(sHost)) {
				//invalid ipv6 address
				return false;
			}
		} else if (!rCheckHostName.test(sHost)) {
			// invalid host name
			return false;
		}
		sHost = sHost.toUpperCase();
	}

	// Path -> split for "/" and check if forbidden characters exist
	if (sPath) {
		if (sProtocol === "MAILTO") {
			var aAddresses = sBody.split(",");
			for (i = 0; i < aAddresses.length; i++) {
				if (!rCheckMail.test(aAddresses[i])) {
					// forbidden character found
					return false;
				}
			}
		} else {
			var aComponents = sPath.split("/");
			for (i = 0; i < aComponents.length; i++) {
				if (!rCheckPath.test(aComponents[i])) {
					// forbidden character found
					return false;
				}
			}
		}
	}

	// query
	if (sQuery) {
		if (!rCheckQuery.test(sQuery)) {
			// forbidden character found
			return false;
		}
	}

	// hash
	if (sHash) {
		if (!rCheckFragment.test(sHash)) {
			// forbidden character found
			return false;
		}
	}

	//filter whitelist
	if (aWhitelist.length > 0) {
		var bFound = false;
		var rFilter;
		for (i = 0; i < aWhitelist.length; i++) {
			if (!sProtocol || !aWhitelist[i].protocol || sProtocol === aWhitelist[i].protocol) {
				// protocol OK
				var bOk = false;
				if (sHost && aWhitelist[i].host && /^\*/.test(aWhitelist[i].host)) {
					// check for wildcard search at begin
					var sHostEscaped = aWhitelist[i].host.slice(1).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
					rFilter = RegExp(sHostEscaped + "$");
					if (rFilter.test(sHost)) {
						bOk = true;
					}
				} else if (!sHost || !aWhitelist[i].host || sHost === aWhitelist[i].host) {
					bOk = true;
				}
				if (bOk) {
					// host OK
					if ((!sHost && !sPort) || !aWhitelist[i].port || sPort === aWhitelist[i].port) {
						// port OK
						if (aWhitelist[i].path && /\*$/.test(aWhitelist[i].path)) {
							// check for wildcard search at end
							var sPathEscaped = aWhitelist[i].path.slice(0, -1).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
							rFilter = RegExp("^" + sPathEscaped);
							if (rFilter.test(sPath)) {
								bFound = true;
							}
						} else if (!aWhitelist[i].path || sPath === aWhitelist[i].path) {
							// path OK
							bFound = true;
						}
					}
				}
			}
			if (bFound) {
				break;
			}
		}
		if (!bFound) {
			return false;
		}
	}

	return true;
}

function migrate() {
	var sSelect = 'select distinct * from "sap.ino.db.basis::t_url_whitelist"';
	var result = oHQ.statement(sSelect).execute();
	var ID = oHQ.statement('select ifnull(max(id), 0) + 1 as ID from "sap.ino.db.basis::t_url_whitelist_ui_stage"').execute();
	var sSuffix = ID[0].ID || 1;
	var sPlainCode = textBundle.getText("uitexts", "BO_URL_WHITELIST_IMPORTED_PLAIN_CODE", [], "", false, oHQ);
	var iNextHandle = -1;
	if (result.length > 0) {
	    _.each(result, function(oUrlWhitelist){
	        var Whitelist = AOF.getApplicationObject("sap.ino.xs.object.basis.UrlWhitelistStage");
	        var oResponse = Whitelist.create({
				ID: iNextHandle,
				PLAIN_CODE: sPlainCode + '_' + sSuffix,
				DEFAULT_TEXT: oUrlWhitelist.HOST,
				PROTOCOL: oUrlWhitelist.PROTOCOL,
				HOST: oUrlWhitelist.HOST,
				PORT: oUrlWhitelist.PORT,
				PATH: oUrlWhitelist.PATH
			});
			if(oResponse.generatedKeys[iNextHandle]) {
			    var sProtocol = oUrlWhitelist.PROTOCOL ? '= \'' + oUrlWhitelist.PROTOCOL + '\'' : 'is null';
			    var sHost = oUrlWhitelist.HOST ? '= \'' + oUrlWhitelist.HOST + '\'' : 'is null';
			    var sPort = oUrlWhitelist.PORT ? '= \'' + oUrlWhitelist.PORT + '\'' : 'is null';
			    var sPath = oUrlWhitelist.PATH ? '= \'' + oUrlWhitelist.PATH + '\'' : 'is null';
			    var sDelete = 'delete from "sap.ino.db.basis::t_url_whitelist" where PROTOCOL ' + sProtocol + 
			    ' and HOST ' + sHost +
			    ' and PORT ' + sPort + 
			    ' and PATH ' + sPath;
			    oHQ.statement(sDelete).execute();
			}
			iNextHandle--;
			sSuffix++;
	    });
	}
}