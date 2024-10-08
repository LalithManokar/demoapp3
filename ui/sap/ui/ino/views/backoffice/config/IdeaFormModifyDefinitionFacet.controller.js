/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
sap.ui.controller("sap.ui.ino.views.backoffice.config.IdeaFormModifyDefinitionFacet", jQuery.extend({},
        sap.ui.ino.views.common.FacetAOController, {
            onExit : function(){
               this.getView().oFieldsDetailView.exit();
            },
            onLiveChange : function(oEvent){
                 oEvent.getSource().setValue(oEvent.getParameter("liveValue"));
            },
            onAfterModelAction :function(){
               // this.getView().oFieldsDetailView.getController().refresh();
            },
            onIsAdminFormChange: function(oEvent){
                var oModel = this.getModel("applicationObject");
                var aFields = oModel.getProperty("/Fields");
                if(oModel.getProperty("/IS_ADMIN_FORM"))
                {//If this is admin form, then update the PUBULISH to unchecked,clear the hiden's value
                    jQuery.each(aFields, function(index,oField){
                        oField.IS_HIDDEN = 0;
                    });
                    
                }
                else{//If this is not admin form, then update the HIDEN to unchecked, clear the publish value
                    jQuery.each(aFields, function(index,oField){
                        oField.IS_PUBLISH = 0;
                    });
                }
            }
        }));