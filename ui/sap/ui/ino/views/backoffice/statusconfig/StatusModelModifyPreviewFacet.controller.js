/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");

sap.ui.controller("sap.ui.ino.views.backoffice.statusconfig.StatusModelModifyPreviewFacet", jQuery.extend({},
    sap.ui.ino.views.common.FacetAOController, {
        sPreviewModelName : "StatusModelPreview",
        
        onAfterModelAction : function(){
            // Users can override to subscribe
            // function is called after a TI save/model action on the active Facet to do facet specific stuff  
            this.setPreviewModel();
        },
        
        setPreviewModel: function(){
            var oModel  = this.getModel();
            var oView   = this.getView();
            
            oView.setModel(oModel, this.sPreviewModelName);
        },
        
        getPreviewModel:function(){
            return this.getView().getModel(this.sPreviewModelName);
        }
        
    }));