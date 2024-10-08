/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.views.common.UsageFacetController");
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");

jQuery.sap.require("sap.ui.ino.application.Configuration");
var Configuration = sap.ui.ino.application.Configuration;

(function() {

    sap.ui.ino.views.common.UsageFacetController = jQuery.extend({}, sap.ui.ino.views.common.FacetAOController, {

        initUsageModel : function() {
            // per default the usage views are in the analytical service
            var sOdataPath = Configuration.getApplicationPath("sap.ino.config.URL_PATH_OD_USAGE");
            var oUsageModel = new sap.ui.model.odata.ODataModel(Configuration.getBackendRootURL() + '/' + sOdataPath, false);

            var oView = this.getView();
            oView.setModel(oUsageModel);
        }

    });
})();