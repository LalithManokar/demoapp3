var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();

function getCriterionCode() {

    var oResult = oHQ.statement(
            "select " +
                "criterion.code as criterion_code, " +
                "model.code as model_code " +
            "from " +
                "\"SAP_INO\".\"sap.ino.db.evaluation::t_criterion\" as criterion " +
            "left outer join " + 
                "\"SAP_INO\".\"sap.ino.db.evaluation::t_model\" as model " +
            "on " +
                "criterion.model_code = model.code "
    ).execute();
    
    return oResult;
}

function getEvaluationCriterions(campaignId, phaseName) {
    var index = 0;
    var oResult = this.getCriterionCode();
    var selectClause =  "select" +
                " evaluation.idea_id," +
                " evaluation.idea_name," +
                " evaluation.campaign_id," +
                " evaluation.campaign_name," +
                " phase.default_text as phase_name," +
                " phase.code as phase_code," +
                " model.code as model_code," +
                " model.default_text as model_name," +
                " status.default_text as evaluation_status," +
                " evaluation.comment as evaluation_comment," +
                " evaluation.evaluator_name," +
                " criterion_value.criterion_code,";
    _.each(oResult, function(oCriterion){
        var criterionCode = oCriterion.CRITERION_CODE;
        var modelCode = oCriterion.MODEL_CODE;
        var caseClause = "\ncase when criterion_value.criterion_code = " + "'" + criterionCode + "'\n" +
                            "then case when criterion_value.value_option_list_code <> " + "''\n" +
                            "\tthen value_option.default_text\n" +
                            "\telse\n" +
                            "\t\tcase criterion_value.datatype_code\n" +
                            "\t\t\twhen" + " 'BOOLEAN' " + "then cast ((case when criterion_value.bool_value = 1 then" + " 'yes' " + "else" + " 'no' " + "end) as varchar)\n" +
                            "\t\t\twhen" + " 'TEXT' " + "then cast (criterion_value.text_value as varchar)\n" +
                            "\t\t\twhen" + " 'INTEGER' " + "then cast (criterion_value.num_value as varchar)\n" +
                            "\t\t\twhen" + " 'NUMERIC' " + "then cast (criterion_value.num_value as varchar) \n" +
                            "\t\t\telse cast (" + "'" + "'" + " as varchar)\n" +
                            "\t\t\tend\n" +
                            "\tend\n" +
                            "end as " + '"' + modelCode.substring(modelCode.lastIndexOf('.') + 1) + '.' + criterionCode.substring(criterionCode.lastIndexOf('.') + 1) + '"' + ",";
        index += 1;
        if (index === oResult.length) {
            caseClause = caseClause.substring(0, caseClause.lastIndexOf(','));
        }
        selectClause += caseClause;                    
    });
    var joinClause = "\nfrom \"sap.ino.db.evaluation::v_evaluation\" as evaluation" +
                 "\nleft outer join \"sap.ino.db.status::t_status\" as status" +
                 "\non evaluation.status_code = status.code" +
                 "\nleft outer join \"sap.ino.db.evaluation::t_model\" as model" +
                 "\non evaluation.model_code = model.code" +
                 "\nleft outer join \"sap.ino.db.campaign::t_phase\" as phase" +
                 "\non evaluation.idea_phase_code = phase.code" +
                 "\nleft outer join \"sap.ino.db.evaluation::v_criterion_value\" as criterion_value" +
                 "\non evaluation.id = criterion_value.evaluation_id" +
                 "\nleft outer join \"sap.ino.db.basis::t_value_option\" as value_option" +
                 "\non criterion_value.value_option_list_code = value_option.list_code" +
                 "\nand (criterion_value.num_value = value_option.num_value or criterion_value.bool_value = value_option.bool_value or criterion_value.text_value = value_option.text_value)" +
                 "\nwhere evaluation.campaign_id = ? and phase.default_text like ?;";
    selectClause = selectClause + joinClause;
	var oCriterions = oHQ.statement(selectClause).execute(campaignId, '%' + phaseName + '%');
	oConn.commit();
	return oCriterions;
}