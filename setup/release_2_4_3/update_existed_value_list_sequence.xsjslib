const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");
var AOF = $.import("sap.ino.xs.aof.core", "framework");
const trace = $.import("sap.ino.xs.xslib", "trace");

const whoAmI = 'sap.ino.setup.release_2_4_3.update_existed_value_list_sequence.xsjslib';

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
    var sQueryValueListCode = 'select id,code from "sap.ino.db.basis::t_value_option_list_stage" where code not like ?';
    
    var aValueListCode =  oHQ.statement(sQueryValueListCode).execute("sap.ino.config.%");
    if( aValueListCode.length > 0){
        for(var i = 0; i < aValueListCode.length; i++ ){
        
        var sQueryValueListOption = 'select id, sequence_no from "sap.ino.db.basis::t_value_option_stage" where list_code = ? ';
        var aValueOptions = oHQ.statement(sQueryValueListOption).execute(aValueListCode[i].CODE);
        if(aValueOptions.length > 0 && !aValueOptions[0].SEQUENCE_NO){
            var aValueOptionsObjects = [];
            for(var j = 0; j < aValueOptions.length; j ++){
                aValueOptions[j].SEQUENCE_NO = j + 1;
                aValueOptionsObjects.push({ID:aValueOptions[j].ID,SEQUENCE_NO:aValueOptions[j].SEQUENCE_NO});
            }
        	var oValueList = AOF.getApplicationObject("sap.ino.xs.object.basis.ValueOptionListStage"); 
        	oValueList.update({ID:aValueListCode[i].ID,ValueOptions:aValueOptionsObjects});
        	                  
        }
        
        }
    }
    
    
    return true;	 
}

function clean(oConnection) {
    return true;
}