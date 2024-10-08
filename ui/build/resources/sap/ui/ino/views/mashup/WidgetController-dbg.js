/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
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