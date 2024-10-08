sap.ui.define(["sap/ino/vc/commons/BaseObjectController","sap/ino/commons/models/core/CodeModel","sap/ino/controls/EvaluationData","sap/ino/controls/EvaluationDataCriterionValue","sap/ino/vc/evaluation/EvaluationFormatter","sap/ui/model/Sorter","sap/ino/commons/models/types/StringNumberType"],function(B,C,E,a,b,S,c){"use strict";var d=function(){throw"Facet may not be instantiated directly";};var f={};jQuery.extend(f,b);d.formatter=f;d.onCriterionPressed=function(e){var s=e.getSource();if(s){var p=s.getBindingContext("object")&&s.getBindingContext("object").getPath();if(p){if(!this.oCriterionValueHelpView){this.oCriterionValueHelpView=sap.ui.xmlview({viewName:"sap.ino.vc.evaluation.CriterionValueHelp"});this.getView().addDependent(this.oCriterionValueHelpView);}if(this.oCriterionValueHelpView&&this.oCriterionValueHelpView.getController()){this.oCriterionValueHelpView.getController().open(s,p);}}}};d.onEvaluatorPressed=function(e){var s=e.getSource();if(s){var i=s.getBindingContext("object")&&s.getBindingContext("object").getProperty("EVALUATOR_ID");if(i!==undefined&&!this.oIdentityCardView){this.oIdentityCardView=sap.ui.xmlview({viewName:"sap.ino.vc.iam.IdentityCard"});this.getView().addDependent(this.oIdentityCardView);}if(this.oIdentityCardView&&this.oIdentityCardView.getController()){this.oIdentityCardView.getController().open(s,i);}}};d.initMatrixControl=function(){var o=new a({criterionId:{path:"object>ID",mode:"OneTime"},criterionCode:{path:"object>CODE",mode:"OneTime"},parentCriterionCode:{path:"object>PARENT_CRITERION_CODE",mode:"OneTime"},criterionName:{path:"object>CODE",formatter:function(s){return f.criterionCode(s);},mode:"OneTime"},criterionDescription:{path:"object>CODE",formatter:function(s){return f.criterionCodeLongText(s);},mode:"OneTime"},criterionDataType:{path:"object>DATATYPE_CODE",mode:"OneTime"},criterionValue:{parts:[{path:"object>TEXT_VALUE"},{path:"object>BOOL_VALUE"},{path:"object>NUM_VALUE"},{path:"object>DATATYPE_CODE"}],formatter:function(t,h,n,s){return f.getValue(s,n,h,t);}},criterionLabel:{parts:[{path:"object>VALUE_OPTION_LIST_CODE"},{path:"object>CODE"},{path:"object>TEXT_VALUE"},{path:"object>BOOL_VALUE"},{path:"object>NUM_VALUE"},{path:"object>DATATYPE_CODE"}],formatter:function(v,s,t,h,n,i){var l=f.criterionCode(s);var V=f.getValue(i,n,h,t);var T=l+": ";if(v){var j=C.getConfigObjectNodeForValueOptionList(v);T=T+C.getText(j,V);}else{T=T+V;}return T;}},numValueMin:{path:"object>NUM_VALUE_MIN",type:new c(),mode:"OneTime"},numValueMax:{path:"object>NUM_VALUE_MAX",type:new c(),mode:"OneTime"},numValueStepSize:{path:"object>NUM_VALUE_STEP_SIZE",type:new c(),mode:"OneTime"},comment:"{object>COMMENT}",isDone:"{object>IS_DONE}",sequenceNo:{path:"object>SEQUENCE_NO",mode:"OneTime"},isOverallResult:{path:"object>IS_OVERALL_RESULT",mode:"OneTime"},uomCode:{path:"object>UOM_CODE",mode:"OneTime"},valueOptionListLabelCodes:{path:"object>VALUE_OPTION_LIST_CODE",formatter:function(l){if(!l){return null;}var s=C.getConfigObjectNodeForValueOptionList(l);var q=C.getCodes(s);var h=q.sort(function(j,k){return j.CODE-k.CODE;});for(var i=0;i<h.length;i++){h[i].TEXT=C.getText(s,h[i].CODE);}return h;}},aggregationType:{path:"object>AGGREGATION_TYPE",mode:"OneTime"},weight:{path:"object>WEIGHT",formatter:function(w){return f.getWeight(w);},mode:"OneTime"},xAxisCriterionCode:{path:"object>X_AXIS_CRITERION_CODE",mode:"OneTime"},xAxisCriterionCodeLabel:{path:"object>X_AXIS_CRITERION_CODE",formatter:function(h){return f.uomCode(h);},mode:"OneTime"},xAxisSegmentNo:{path:"object>X_AXIS_SEGMENT_NO",mode:"OneTime"},yAxisCriterionCode:{path:"object>Y_AXIS_CRITERION_CODE",mode:"OneTime"},yAxisCriterionCodeLabel:{path:"{object>Y_AXIS_CRITERION_CODE}",formatter:function(h){return f.uomCode(h);},mode:"OneTime"},yAxisSegmentNo:{path:"object>Y_AXIS_SEGMENT_NO",mode:"OneTime"},visParam1CriterionCode:{path:"object>VIS_PARAM_1_CRITERION_CODE",mode:"OneTime"},visParam1CriterionCodeLabel:{path:"object>UOM_CODE",formatter:function(h){return f.uomCode(h);},mode:"OneTime"},visParam2CriterionCode:{path:"object>VIS_PARAM_2_CRITERION_CODE",mode:"OneTime"},visParam2CriterionCodeLabel:{path:"object>UOM_CODE",formatter:function(h){return f.uomCode(h);},mode:"OneTime"}});this._oEvalDataTemplate=new E({evaluationId:"{object>ID}",modelCode:"{object>MODEL_CODE}",modelName:{path:"object>MODEL_CODE",formatter:function(s){return f.modelCode(s);}},modelDescription:{path:"object>MODEL_CODE",formatter:function(s){return f.modelCodeLongText(s);}},ideaId:"{object>IDEA_ID}",statusCode:"{object>STATUS_CODE}",ideaPhaseCode:"{object>IDEA_PHASE_CODE}",evaluatorId:"{object>EVALUATOR_ID}",evaluatorName:"{object>EVALUATOR_NAME}",evaluationDate:{path:"object>CHANGED_AT",type:new sap.ui.model.type.Date({style:"medium"})},overallResult:function(){return{parts:[{path:"OV_RES_DATATYPE_CODE"},{path:"OV_RES_NUM_VALUE"},{path:"OV_RES_BOOL_VALUE"},{path:"OV_RES_TEXT_VALUE"},{path:"OV_RES_VALUE_OPTION_LIST_CODE"},{path:"OV_RES_UOM_CODE"}],formatter:function(){return function(D,n,h,t,v,u){return f.getFormattedValue(D,n,h,t,v,u);};}};},values:{path:"object>CriterionValues",template:o,sorter:new S("SEQUENCE_NO",false),templateShareable:true}});var e=this.byId("evaluationMatrix");var g=e.getBinding();if(g){g.attachChange(e.prepareMatrix,e);}};d.bindMatrix=function(){var m=this.getView().byId("evaluationMatrix");m.addAggregation("evalData",this._oEvalDataTemplate);m.bindElement({path:"/",model:"object"});};d.onDelete=function(e){var o=this;var D=e.getSource();var g=this.executeObjectAction("del",{messages:{confirm:"MSG_DEL_CONFIRM",success:"MSG_DEL_SUCCESS"}});g.done(function(r){if(r&&r.confirmationCancelled===true){if(D&&jQuery.type(D.focus)==="function"){D.focus();}return;}o.onDeleteNavBack("idea",true);});};d.onSubmit=function(){var o=this;var e=o.getObjectModel();var i=e.isNew();var s=o.executeObjectAction("modifyAndSubmit",{messages:{confirm:"EVALUATION_OBJECT_MSG_SUBMIT_CONFIRM",success:function(){return o.getText("EVALUATION_OBJECT_MSG_SUBMIT_OK");}},parameters:{IDEA_ID:e.getProperty("/IDEA_ID"),EVAL_REQ_ITEM_ID:e.getProperty("/EVAL_REQ_ITEM_ID")}});s.done(function(r){e.getPropertyModel().getDataInitializedPromise().done(function(){if(o.setStatusChangeButtons){o.setStatusChangeButtons();}});if(r&&r.confirmationCancelled===true){o.byId("evaluationSubmitBtn").focus();return;}if(i){o.navigateTo("evaluation-display",{id:e.getKey()},true);}else{o.navigateBack();}});};return d;});
