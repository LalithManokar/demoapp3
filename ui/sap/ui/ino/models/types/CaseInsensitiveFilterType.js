/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.types.CaseInsensitiveFilterType");
(function() {
    "use strict";

    /**
     * This type is used in table columns to be able to filter case-insensitive
     * It can only be used when OData models are bound to it
     */
    sap.ui.model.type.String.extend("sap.ui.ino.models.types.CaseInsensitiveFilterType", {
        parseValue : function(sValue) {
            return "tolower('" + sValue + "')";
        }
    });
})();