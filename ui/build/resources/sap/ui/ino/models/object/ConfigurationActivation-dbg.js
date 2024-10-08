/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.object.ConfigurationActivation");

(function() {
    "use strict";
    jQuery.sap.require("sap.ui.ino.application.Configuration");
    var Configuration = sap.ui.ino.application.Configuration;
    jQuery.sap.require("sap.ui.ino.models.core.CodeModel");
    jQuery.sap.require("sap.ui.ino.models.core.PropertyModel");

    sap.ui.ino.models.object.ConfigurationActivation = {};
    sap.ui.ino.models.object.ConfigurationActivation.activate = function() {
        var sServiceUrl = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/admin/application/config.xsjs";
        var sAction = "activate";
        var oAjaxPromise = jQuery.ajax({
            url : sServiceUrl + "/" + sAction,
            type : "POST",
            contentType : "application/json; charset=UTF-8",
            async : true
        });
        oAjaxPromise.done(function() {
            sap.ui.ino.models.core.CodeModel.refresh();
            sap.ui.ino.models.core.PropertyModel.refresh();
        });
        return oAjaxPromise;
    };

})();