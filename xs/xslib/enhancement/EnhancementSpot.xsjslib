var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var DB = $.import("sap.ino.xs.xslib", "dbConnection");
var oHQ = DB.getHQ();

this.get = function(sEnhancementSpot) {
    var oObjectLocation = _.splitObjectPath(sEnhancementSpot);
    var oLibrary = loadLibrary(oObjectLocation.packageName, oObjectLocation.objectName);
    if (!oLibrary) {
        _.raiseException("Enhancement Spot implementation '" + sEnhancementSpot + "' not found");
    }
    var aPackage = oHQ.statement('select EXT_PACKAGE_ID from "sap.ino.db.basis::t_package_extension" where base_package_id = ? order by LAYER asc').execute(oObjectLocation.packageName);
    if (aPackage && aPackage.length > 0) {
        _.each(aPackage, function (oPackage) {
            var oExtLibrary = loadLibrary(oPackage.EXT_PACKAGE_ID, oObjectLocation.objectName);
            if (oExtLibrary) {
                _.extend(oLibrary, oExtLibrary);
            }
        });
    }
    return oLibrary;
};

function loadLibrary(sObjectPackageName, sObjectName) {
    try { 
        return $.import(sObjectPackageName, sObjectName);
    } catch (oImportException) {
        var bIsNotFoundException = oImportException.message.trim() === "import: failed to load the library";
        if (bIsNotFoundException) {
            return undefined;
        }
        _.raiseException(oImportException);
    }
}