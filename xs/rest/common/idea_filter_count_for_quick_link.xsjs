var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
var SQLInjectionCheck = $.import("sap.ino.xs.xslib", "sqlInjectionSafe");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var t_filter_count;

//out of security reason wo need to escape single quotes in every parameter
var filtername = $.request.parameters.get("filtername") || '';
var bShowBackoffice = $.request.parameters.get("bShowBackoffice") === 'true' ? 1 : 0;
var oCamaignId = $.request.parameters.get("CAMPAIGN_ID") || '';
var oIdeaFilterChange = $.request.parameters.get("oIdeaFilterChange") || '';
var searchToken = $.request.parameters.get("searchToken") || '';
var phase = $.request.parameters.get("phase") || '';
var status_code = $.request.parameters.get("status_code") || '';
var status_type = $.request.parameters.get("status_type") || '';
var resp_code = $.request.parameters.get("resp_code") || '';
var dueFrom = $.request.parameters.get("dueFrom") || '';
var dueTo = $.request.parameters.get("dueTo") || '';
var vote_count = $.request.parameters.get("vote_num") || '';
var vote_operator = $.request.parameters.get("vote_operator") || '';
var authorsToken = $.request.parameters.get("authorKeys") || '';
var coachKeys = $.request.parameters.get("coachKeys") || '';
var latestUpdate = $.request.parameters.get("latestUpdate") || '';
var tagTokens = $.request.parameters.get("tagTokens") || '';
var tagTokens1 = $.request.parameters.get("tagTokens1") || '';
var tagTokens2 = $.request.parameters.get("tagTokens2") || '';
var tagTokens3 = $.request.parameters.get("tagTokens3") || '';
var tagTokens4 = $.request.parameters.get("tagTokens4") || '';
//idea form
var ideaFormId = $.request.parameters.get("ideaFormId") || '';
var ifcode = $.request.parameters.get("c1") || '';
var ifop = $.request.parameters.get("o1") || -1;
var ifvalue = $.request.parameters.get("v1") || '';
var iscode = $.request.parameters.get("c2") || '';
var isop = $.request.parameters.get("o2") || -1;
var isvalue = $.request.parameters.get("v2") || '';
var itcode = $.request.parameters.get("c3") || '';
var itop = $.request.parameters.get("o3") || -1;
var itvalue = $.request.parameters.get("v3") || '';

//	var oParameters = formatParams($.request.parameters);

try {
	t_filter_count = oHQ.procedure("SAP_INO", "sap.ino.db.idea.optimize::p_idea_filter_count_for_quicklink").execute(searchToken, oCamaignId,
		phase, latestUpdate, status_code, resp_code, dueFrom, vote_count, vote_operator, authorsToken, coachKeys, status_type, tagTokens,
		oIdeaFilterChange, dueTo, ifcode, ifop, ifvalue, iscode, isop, isvalue, itcode, itop, itvalue, ideaFormId, tagTokens1, tagTokens2,
		tagTokens3, tagTokens4, filtername);
	var out_put = {};
	t_filter_count.OT_IDEA_FILTER_COUNT.map(function(item) {
		out_put[item.FILTER_NAME] = item.AMOUNT;
	});
	var result = JSON.stringify(out_put, null, 4);
	$.response.contentType = "applition/json";
	$.response.setBody(result);
} catch (e) {
	throw e;
}