var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

const trace = $.import("sap.ino.xs.xslib", "trace");
var httpdest = $.import("sap.hana.xs.admin.server.httpDestination", "httpdest");


function getAllDestinations() {
    
	var oDestData = {
		"action": "getHTTPDest",
		"package": "sap.ino.xs.rest.commonIntegration",
		"name": "Destination1"
	};
	var aDestinations = [];
	for (var i = 0; i < 20; i++) {
		oDestData.package = "sap.ino.xs.rest.commonIntegration";
		oDestData.name = "Destination" + (i + 1);
		var oStandardDestination = httpdest.getHTTPDest(oDestData);
		var oResultDestination;
		var bIsLastExtension = oStandardDestination.isLastExtension;
		if (oStandardDestination.isLastExtension) {
			oResultDestination = {
				destPackage: oStandardDestination.package,
				destName: oStandardDestination.name,
				destHost: oStandardDestination.host,
				destPort: oStandardDestination.port,
				destPathPrefix: oStandardDestination.pathPrefix,
				destFullName: oStandardDestination.fullName,
				standardPackage: oStandardDestination.package,
				standardName: oStandardDestination.name				
			};
			aDestinations.push(oResultDestination);
		} else {
		    var oExtendDestination = {};
			var oCurrentDestination = oStandardDestination;
			while (!bIsLastExtension) {
				///Get the latested Extension            
				var aDestInfo = oCurrentDestination.lastExtension.split(":");
				oDestData.name = aDestInfo[1].substr(0, aDestInfo[1].indexOf(".xshttpdest"));
				oDestData.package = aDestInfo[0];
				oExtendDestination = httpdest.getHTTPDest(oDestData);
				bIsLastExtension = oExtendDestination.isLastExtension;
				oCurrentDestination = oExtendDestination;
			}
			oResultDestination = {
				destPackage: oExtendDestination.package,
				destName: oExtendDestination.name,
				destHost: oExtendDestination.host,
				destPort: oExtendDestination.port,
				destPathPrefix: oExtendDestination.pathPrefix,
				destFullName: oExtendDestination.fullName,
				standardPackage: oStandardDestination.package,
				standardName: oStandardDestination.name
			};
			aDestinations.push(oResultDestination);
		}
	}
	return aDestinations;
}


function getDestination(sPackage, sName) {
	var oDestData = {
		"action": "getHTTPDest",
		"package": sPackage,
		"name": sName
	};
	var oStandardDestination = httpdest.getHTTPDest(oDestData);
	var oResultDestination;
	var bIsLastExtension = oStandardDestination.isLastExtension;
	if (oStandardDestination.isLastExtension) {
		oResultDestination = {
				destPackage: oStandardDestination.package,
				destName: oStandardDestination.name,
				destHost: oStandardDestination.host,
				destPort: oStandardDestination.port,
				destPathPrefix: oStandardDestination.pathPrefix,
				destFullName: oStandardDestination.fullName,
				standardPackage: oStandardDestination.package,
				standardName: oStandardDestination.name				
		};
	} else {
		var oCurrentDestination = oStandardDestination;
	var oExtendDestination = {};		
		while (!bIsLastExtension) {
			///Get the latested Extension            
			var aDestInfo = oCurrentDestination.lastExtension.split(":");
			oDestData.name = aDestInfo[1].substr(0, aDestInfo[1].indexOf(".xshttpdest"));
			oDestData.package = aDestInfo[0];
		    oExtendDestination = httpdest.getHTTPDest(oDestData);
			bIsLastExtension = oExtendDestination.isLastExtension;
			oCurrentDestination = oExtendDestination;
		}
		oResultDestination = {
				destPackage: oExtendDestination.package,
				destName: oExtendDestination.name,
				destHost: oExtendDestination.host,
				destPort: oExtendDestination.port,
				destPathPrefix: oExtendDestination.pathPrefix,
				destFullName: oExtendDestination.fullName,
				standardPackage: oStandardDestination.package,
				standardName: oStandardDestination.name				
		};

	}
	return oResultDestination;
}

function readDestination(sPackage,sName) {
//When Call Deestination, need to read destionation then put this to the request parameters    
	return $.net.http.readDestination(sPackage, sName);
}



