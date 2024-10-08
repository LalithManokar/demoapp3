/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
jQuery.sap.require("sap.ui.ino.application.Configuration");
var Configuration = sap.ui.ino.application.Configuration;

sap.ui.controller("sap.ui.ino.views.backoffice.config.ValueOptionListUsage", 
    jQuery.extend({}, sap.ui.ino.views.common.FacetAOController, {
        
        initUsageModel : function() {
            // per default the usage views are in the analytical service
            var sOdataPath = Configuration.getApplicationPath("sap.ino.config.URL_PATH_OD_USAGE");
            var oUsageModel = new sap.ui.model.odata.ODataModel(Configuration.getBackendRootURL() + '/' + sOdataPath, false);

            var oView = this.getView();
            oView.setModel(oUsageModel);
        }
        
        /*facetSelected : function(oEvent, sFacetKey) {
            var oController = this.oView.getController();
            oController.facetSelectedCallback(oEvent);
        },
        
        facetSelectedCallback : function(oEvent) {
            var oView = this.getView();
            var oTI = oView.getInspector();
            var sKey;
            if (typeof oEvent == "string") {
                sKey = oEvent;
            } else {
                sKey = oEvent.getParameter("key");
            }
            this.selectedFacet = sKey;
            oTI.removeAllFacetContent();

            var oFacet = this.getFacet(sKey);
            var oContent = oFacet._createFacetContent(oFacet.getController());
            if (oContent) {
                for (var i = 0; i < oContent.length; i++) {
                    oTI.addFacetContent(oContent[i]);
                }
            }
            oFacet._onShow();
        },
        
        getFacet : function(sKey){
            var oView = this.getView();
            var oFacet = oView.oFacets[sKey];
            if (!oFacet) {
                oFacet = sap.ui.jsview(oView.createId(sKey), sKey);
                oView.oFacets[sKey] = oFacet;
                oFacet.initWithMode(this.getMode());
                oFacet.getController().setThingInspectorController(this);
            }
            return oFacet;
        }*/
    }));