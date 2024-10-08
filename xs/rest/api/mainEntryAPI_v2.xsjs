const SystemSetting = $.import("sap.ino.xs.xslib", "systemSettings");
var sqlUtil = $.import("sap.ino.xs.rest.api", "sqlUtil");
var util = $.import("sap.ino.xs.rest.api", "util");

var ResponseData = sqlUtil.ResponseData;
var returnInf = new ResponseData();
var oReq, JSONstr;
if(!SystemSetting.isUnderMaintenance()){
        try {
        	oReq = util.parseJSON();
        } catch (e) {
        	returnInf.status = 400;
        	returnInf.msg =  "Please check  Specification of parameters";
        	util.handleResponse(returnInf);
        }
        
        if (oReq.method) {
        	try {
        	var method = oReq.method;
        	var str = oReq.method.split("_");
        	var object = str[0];
        	var url = "sap.ino.xs.rest.api.v2.object." + object;
        	var main = $.import(url, method);
        	main[method](oReq, returnInf);
            }
            catch(e){
            	$.response.setBody(e.toString());
            }
        }
    }else{
            $.response.status = 503;
        	returnInf.status = 503;
        	returnInf.msg = "System is under maintenance, please contact your system admin";
        	JSONstr = JSON.stringify(returnInf, null, 4);
        	$.response.contentType = "applition/json";
        	$.response.setBody(JSONstr);
    }