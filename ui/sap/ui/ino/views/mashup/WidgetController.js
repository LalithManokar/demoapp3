/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

jQuery.sap.declare("sap.ui.ino.views.mashup.WidgetController");

(function() {
    "use strict";

    sap.ui.ino.views.mashup.WidgetController = {
        getApplication : function() {
            return sap.ui.ino.application.ApplicationBase.getApplication();
        }
    };
})();