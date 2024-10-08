/*!
 * SAP Innovation Management (c) Copyright 2016 SAP AG. All rights reserved.
 */
(function() {
    "use strict";

    // Somehow the test environment is loaded although we are not in test mode
    // so we have to remove it there - otherwise Less Support does not work
    if (window.sap.ui.test && window.sap.ui.test.qunit) {
        delete window.sap.ui.test.qunit;
    }

    /** ********************** LESS *********************** */
    jQuery.sap.require("sap.ui.core.plugin.LessSupport");
    
    window.less = {
        env : "development",
        errorReporting : function(sMethod, ex, sRootHref) {
            if (sMethod === "add") {
                jQuery.sap.log.error("Failed to parse: " + sRootHref, ex);
            }
        }
    };

    sap.ui.core.plugin.LessSupport.prototype.getLastModified = function(sUrl) {
        if (sUrl.indexOf("/sap/ino/controls") !== -1 && jQuery.sap.endsWith(sUrl, ".less")) {
            return new Date();
        } else if (sUrl.indexOf("/sap/ino/wall") !== -1 && jQuery.sap.endsWith(sUrl, ".less")) {
            return new Date();
        } else {
            return Date.parse("1970-01-01");
        }
    };
    
    // Different backend not supported in build version => sap.ino.commons library not known here
    var sBackend = jQuery.sap.getUriParameters().get("backend");
    if (sBackend) {
        jQuery.sap.require("sap.ino.commons.application.Configuration");
        sap.ino.commons.application.Configuration.setBackendRootURL(sBackend);
    }
})();