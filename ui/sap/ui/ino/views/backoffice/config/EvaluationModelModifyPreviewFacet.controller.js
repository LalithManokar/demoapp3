/*!
 * @copyright@
 */
jQuery.sap.require("sap.ui.ino.views.common.FacetAOController");
jQuery.sap.require("sap.ui.ino.models.object.Evaluation");

sap.ui.controller("sap.ui.ino.views.backoffice.config.EvaluationModelModifyPreviewFacet", jQuery.extend({},
        sap.ui.ino.views.common.FacetAOController, {
    
    sPreviewModelName : "EvaluationModelPreview",
    
    onAfterModelAction : function(){
        // Users can override to subscribe
        // function is called after a TI save/model action on the active Facet to do facet specific stuff
        this.setPreviewModel();
       },
    
    setPreviewModel : function(){
        var oModel = this.getModel();
        var oView = this.getView();
        var oPreviewModel = oModel.getPreviewModel();
        var oPreviewEvaluationData = oPreviewModel.getData();
        oPreviewEvaluationData.statusCode = sap.ui.ino.models.object.Evaluation.Status.Draft;
        oPreviewEvaluationData.CriterionValues = oPreviewEvaluationData.Criterion;
        delete oPreviewEvaluationData.Criterion;
        var oPreviewEvaluationModel = new sap.ui.ino.models.object.Evaluation(oPreviewEvaluationData);
        oView.setModel(oPreviewEvaluationModel, this.sPreviewModelName);
    }
    
}));