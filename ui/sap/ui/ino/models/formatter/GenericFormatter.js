/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.formatter.GenericFormatter");

(function() {

    sap.ui.ino.models.formatter.GenericFormatter = {};

    sap.ui.ino.models.formatter.GenericFormatter.formatIdNoHandle = function(iId) {
        if (iId === undefined || iId === null || iId < 0) {
            return "";
        }
        return iId;
    };

    sap.ui.ino.models.formatter.GenericFormatter.formatFalsyToBlank = function(vValue) {
        if (!vValue) {
            return "";
        }
        return vValue;
    };
})();