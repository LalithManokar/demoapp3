const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");

const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_2_3_0.init_existed_data_in_custom_idea_form.xsjslib';

function error(line) {
    trace.error(whoAmI, line);
}
function info(line) {
    trace.info(whoAmI, line);
}

function check(oConnection) {
    return true;
}

function run(oConnection) {
    const oHQ = HQ.hQuery(oConnection);
	var sSelect = 'select ID, IS_EXTERNAL from "sap.ino.db.iam::v_auth_application_user"';
	var aResult = oHQ.statement(sSelect).execute();
	 if(aResult.length > 0){
    var iUserID = aResult[0].ID;  
    ///Update History Table
    const sHistoryDel = 'insert into "sap.ino.db.ideaform::t_field_value_h" ' +
    'select \'DELETE\',\'IDEA_UPDATE\',CURRENT_TIMESTAMP,' + iUserID + ',field.*  from  "sap.ino.db.ideaform::t_field_value"  as field ';
	oHQ.statement(sHistoryDel).execute();
    const sHistoryUpdate = ' insert into "sap.ino.db.ideaform::t_field_value_h"' +
    'select \'UPDATE\',\'IDEA_UPDATE\',CURRENT_TIMESTAMP,' + iUserID + ',field.*  from  "sap.ino.db.ideaform::t_field_value"  as field ';
    oHQ.statement(sHistoryUpdate).execute();
    
    ///Actual Operation
	var sStatement1 = 'delete from "sap.ino.db.ideaform::t_field_value"'
      + 'where field_type_code is null and idea_id in (  select idea_id from "sap.ino.db.ideaform::t_field_value" where field_type_code = \'CUSTOM_FIELD\');';
    oHQ.statement(sStatement1).execute();
	var sStatement2 = 'update "sap.ino.db.ideaform::t_field_value" set field_type_code = \'CUSTOM_FIELD\' where field_type_code is null;';
    oHQ.statement(sStatement2).execute();
	 }
    return true;	 
}

function clean(oConnection) {
    return true;
}