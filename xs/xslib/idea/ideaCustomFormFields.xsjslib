var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var hQuery = $.import("sap.ino.xs.xslib", "hQuery");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();

function getFieldCode() {

    var oResult = oHQ.statement(
            "select " +
                "code as field_code, " +
                "form_code " +
            "from " +
                "\"SAP_INO\".\"sap.ino.db.ideaform::t_field\";"
    ).execute();
    
    return oResult;
}

function getFormFields(campaignId) {
    var index = 0;
    var oResult = this.getFieldCode();
    var selectClause =  "select" +
                " idea.id as idea_id," +
                " idea.name as idea_name," +
                " idea.campaign_id as campaign_id," +
                " camp.name as campaign_name," +
                " field_value.comment," +
                " field_value.field_code as field_code," +
                " field_value.field_type_code as field_type," +
                " form.code as form_code," +
                " form.DEFAULT_TEXT as form_name,";
    _.each(oResult, function(oField){
        var fieldCode = oField.FIELD_CODE;
        var formCode = oField.FORM_CODE;
        var caseClause = "\ncase when field.code = " + "'" + fieldCode + "'\n" +
                            "then case when value_option.code <> " + "''\n" +
                            "\tthen value_option.default_text\n" +
                            "\telse\n" +
                            "\t\tcase field.datatype_code\n" +
                            "\t\t\twhen" + " 'BOOLEAN' " + "then cast ((case when field_value.bool_value = 1 then" + " 'yes' " + "else" + " 'no' " + "end) as nvarchar(1024))\n" +
                            "\t\t\twhen" + " 'TEXT' " + "then cast (field_value.text_value as nvarchar(1024))\n" +
                            "\t\t\twhen" + " 'INTEGER' " + "then cast (field_value.num_value as nvarchar(1024))\n" +
                            "\t\t\twhen" + " 'NUMERIC' " + "then cast (field_value.num_value as nvarchar(1024)) \n" +
                            "\t\t\twhen" + " 'RICHTEXT' " + "then cast (field_value.rich_text_value as nvarchar(1024)) \n" +
                            "\t\t\telse cast (" + "'" + "'" + " as nvarchar(1024))\n" +
                            "\t\t\tend\n" +
                            "\tend\n" +
                            "end as " + '"' + formCode.substring(formCode.lastIndexOf('.') + 1) + '.' + fieldCode.substring(fieldCode.lastIndexOf('.') + 1) + '"' + ",";
        index += 1;
        if (index === oResult.length) {
            caseClause = caseClause.substring(0, caseClause.lastIndexOf(','));
        }
        selectClause += caseClause;                    
    });
    var joinClause = "\nfrom \"sap.ino.db.ideaform::t_field_value\" as field_value" +
                 "\ninner join \"sap.ino.db.ideaform::t_field\" as field" +
                 "\non field.code = field_value.field_code" +
                 "\ninner join \"sap.ino.db.ideaform::t_form\" as form" +
                 "\non field.form_code = form.code" +
                 "\nleft outer join \"sap.ino.db.idea::t_idea\" as idea" +
                 "\non idea.id = field_value.idea_id" +
                 "\nleft outer join \"sap.ino.db.campaign::v_campaign_t_locale\" as camp" +
                 "\non camp.campaign_id = idea.campaign_id" +
                 "\nleft outer join \"sap.ino.db.campaign::t_phase\" as phase" +
                 "\non idea.phase_code = phase.code" +
                 "\nleft outer join \"sap.ino.db.basis::t_value_option\" as value_option" +
                 "\non field.value_option_list_code = value_option.list_code" +
                 "\nand (field_value.num_value = value_option.num_value or field_value.bool_value = value_option.bool_value or field_value.text_value = value_option.text_value)" +
                 "\nwhere idea.campaign_id = ?;";
    selectClause = selectClause + joinClause;
	var oFields = oHQ.statement(selectClause).execute(campaignId);
	oConn.commit();
	return oFields;
}