var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

function ResponseData(){
    return {
        "status": 0,
		"data": {},
		"msg": ""
    };
}

function generateUpdateSql(object, aAllowUpdateFields){
    const updateObj = {
      sStatement:'',
      aValue:[]
    };
    const aStatment = [];
    _.mapObjects(object, function(vValue, vKey) {
        if(aAllowUpdateFields.indexOf(vKey) > -1 ){
            const sStatement  = vKey + ' = ?';
            aStatment.push(sStatement);
            updateObj.aValue.push(vValue);
        }
        
    });
    updateObj.sStatement = aStatment.join(',');
    return updateObj;
}

function updateObjectByUserName(table, updateObj, userName, oHQ){
    if(updateObj.sStatement && updateObj.sStatement !== '' && userName){
        updateObj.aValue.push(userName);
        var oRes =  oHQ.statement(
    			'update ' + table + ' set ' + updateObj.sStatement + ' where user_name = ?'
    		)
    			.execute(updateObj.aValue);
    	return oRes;
    }
}