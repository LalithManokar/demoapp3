const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const readService = $.import('sap.ino.xs.xslib', 'hReadService');
const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
const SqlInjectionSafe = $.import("sap.ino.xs.xslib", "sqlInjectionSafe");
const Connection = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const Query = $.import("sap.ino.xs.xslib", "hQuery");
const HQ = Query.hQuery(Connection);
// readService.process({
// }, $.request, $.response);

function _handleRequest(req, res) {
	var searchToken = SqlInjectionSafe.sqlEscapeSingleQuotes(req.parameters.get("keyword") || '');
	var searchType = req.parameters.get('type') || '';
	var campaign_id = SqlInjectionSafe.sqlEscapeSingleQuotes(req.parameters.get('id') || '');
	var isManaged = SqlInjectionSafe.sqlEscapeSingleQuotes(req.parameters.get('managed'));
	var oIdeaBody;
	var body = {};
	// if(searchToken !== null){
	//     searchToken = searchToken.replace(/\'/g,"");
	// }
	var aPeopleSeting = HQ.statement('SELECT 1 from "sap.ino.db.basis::v_system_setting" WHERE CODE = \'sap.ino.config.PEOPLE_MENU_FOR_ALL_ACTIVE\' AND VALUE = 1')
				.execute();
	switch (searchType) {

		case 'campaign':
			var oBlogBody = HQ.statement('select top 4 * from "sap.ino.db.blog::v_blogs_global_search" ( \'PLACEHOLDER\' = (\'$$searchToken$$\',\'' +
				searchToken + '\' ),\'PLACEHOLDER\' = (\'$$filterName$$\',\'' + 'publishedBlogs' + '\' ),\'PLACEHOLDER\' = (\'$$campaign_id$$\',\'' +
				campaign_id + '\' ))').execute();
			oIdeaBody = HQ.statement('select  top 11 * from "sap.ino.db.idea::v_idea_global_search" ( \'PLACEHOLDER\' = (\'$$searchToken$$\',\'' +
				searchToken + '\'),\'PLACEHOLDER\' = (\'$$filterBackoffice$$\',\'' + isManaged + '\' ),\'PLACEHOLDER\' = (\'$$campaign_id$$\',\'' +
				campaign_id + '\' ))').execute();
			body = {
				Ideas: {
					data: oIdeaBody.slice(0, 10),
					counts: oIdeaBody.length
				},
				Blogs: {
					data: oBlogBody.slice(0, 3),
					counts: oBlogBody.length
				}
			};
			break;
		case 'all':
			var oCampaignBody = HQ.statement(
				'select top 7 * from "sap.ino.db.campaign::v_campaign_global_search" ( \'PLACEHOLDER\' = (\'$$searchToken$$\',\'' + searchToken +
				'\'),\'PLACEHOLDER\' = (\'$$filterBackoffice$$\',\'' + isManaged + '\' ))').execute();
			oIdeaBody = HQ.statement('select  top 11 * from "sap.ino.db.idea::v_idea_global_search" ( \'PLACEHOLDER\' = (\'$$searchToken$$\',\'' +
				searchToken + '\'),\'PLACEHOLDER\' = (\'$$filterBackoffice$$\',\'' + isManaged + '\' ),\'PLACEHOLDER\' = (\'$$campaign_id$$\',\'' + '' +
				'\' ))').execute();
			var oTagBody = HQ.statement(
					'select top 13 * from "sap.ino.db.tag.ext::V_EXT_TAGS_ALL_SEARCH" ( \'PLACEHOLDER\' = (\'$$searchToken$$\',\'' + searchToken + '\'))')
				.execute();
			var oUserBody = [];
			if(aPeopleSeting && aPeopleSeting.length > 0){
			    oUserBody = HQ.statement(
					'select top 10 * from "sap.ino.db.iam.ext::V_EXT_IDENTITY_SEARCH" ( \'PLACEHOLDER\' = (\'$$searchToken$$\',\'' + searchToken + '\'))')
				.execute();
			}
			var oWallBody = HQ.statement('select top 6 * from "sap.ino.db.wall::v_wall_global_search" ( \'PLACEHOLDER\' = (\'$$searchToken$$\',\'' +
				searchToken + '\'))').execute();
			body = {
				Campaigns: {
					data: oCampaignBody.slice(0, 6),
					counts: oCampaignBody.length
				},
				Ideas: {
					data: oIdeaBody.slice(0, 10),
					counts: oIdeaBody.length
				},
				Tags: {
					data: oTagBody.slice(0, 12),
					counts: oTagBody.length
				},
				Users: {
					data: oUserBody.length === 0 ? void 0 : oUserBody.slice(0, 9),
					counts: oUserBody.length
				},
				Walls: {
					data: oWallBody.slice(0, 5),
					counts: oWallBody.length
				}
			};
			break;
		default:
			body = {
				Campaigns: HQ.statement('select * from "sap.ino.db.campaign::v_campaign_global_search" ( \'PLACEHOLDER\' = (\'$$searchToken$$\',\'' +
					searchToken + '\'))').execute(),
				Ideas: HQ.statement('select * from "sap.ino.db.idea::v_idea_global_search" ( \'PLACEHOLDER\' = (\'$$searchToken$$\',\'' + searchToken +
					'\'))').execute(),
				Tags: HQ.statement('select top 12 * from "sap.ino.db.tag.ext::V_EXT_TAGS_ALL_SEARCH" ( \'PLACEHOLDER\' = (\'$$searchToken$$\',\'' +
					searchToken + '\'))').execute(),
				Users: aPeopleSeting && aPeopleSeting.length > 0 ? HQ.statement('select top 9 * from "sap.ino.db.iam.ext::V_EXT_IDENTITY_SEARCH" ( \'PLACEHOLDER\' = (\'$$searchToken$$\',\'' +
					searchToken + '\'))').execute() : void 0,
				Walls: HQ.statement('select top 5 * from "sap.ino.db.wall::v_wall_global_search" ( \'PLACEHOLDER\' = (\'$$searchToken$$\',\'' +
					searchToken + '\'))').execute()
			};
			break;
	}
	res.status = $.net.http.OK;
	res.contentType = 'appliction/json';
	res.setBody(JSON.stringify(body));
}

TraceWrapper.wrap_request_handler(function() {
	return _handleRequest($.request, $.response);
});