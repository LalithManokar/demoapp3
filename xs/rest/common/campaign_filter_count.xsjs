var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
var SQLInjectionCheck = $.import("sap.ino.xs.xslib", "sqlInjectionSafe");

const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();
var searchToken = SQLInjectionCheck.sqlEscapeSingleQuotes($.request.parameters.get("searchToken") || '');
var resp_code = SQLInjectionCheck.sqlEscapeSingleQuotes($.request.parameters.get("resp_code") || '');
var has_camp_blog = SQLInjectionCheck.sqlEscapeSingleQuotes($.request.parameters.get("has_camp_blog") || '');
var tagTokens  = SQLInjectionCheck.sqlEscapeSingleQuotes($.request.parameters.get("tagTokens") || '');
var tagTokens1 = SQLInjectionCheck.sqlEscapeSingleQuotes($.request.parameters.get("tagTokens1") || '');
var tagTokens2 = SQLInjectionCheck.sqlEscapeSingleQuotes($.request.parameters.get("tagTokens2") || '');
var tagTokens3 = SQLInjectionCheck.sqlEscapeSingleQuotes($.request.parameters.get("tagTokens3") || '');
var tagTokens4 = SQLInjectionCheck.sqlEscapeSingleQuotes($.request.parameters.get("tagTokens4") || '');

const t_filter_count =  oHQ.procedure("SAP_INO", "sap.ino.db.campaign::p_campaign_list_filter_count").execute(searchToken,resp_code,has_camp_blog,tagTokens,tagTokens1,tagTokens2,tagTokens3,tagTokens4);

var result = JSON.stringify(t_filter_count.OT_CAMPAIGN_FILTER_COUNT, null, 4);
$.response.contentType = "applition/json";
$.response.setBody(result);