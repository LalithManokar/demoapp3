var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

const trace = $.import("sap.ino.xs.xslib", "trace");


function getStandardDestination(sPackage,sName){
  	return $.net.http.readDestination(sPackage, sName);  
}