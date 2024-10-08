(function(exports) {
	"use strict";

	const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
	const ohQuery = $.import("sap.ino.xs.xslib", "hQuery");
	var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
	var oHQ = ohQuery.hQuery(oConn).setSchema("SAP_INO");

	const MAX_NR_OF_RESULTS = 50;
	const DEFAULT_NR_OF_RESULTS = 12;
	// all supported languages taken into account for automatic language detection - see table sap.ino.db.basis::t_language
	const SUPPORTED_LANGUAGES = ["EN", "DE", "ES", "FR", "JA", "PT", "RU", "ZH"];

	/**
	 * Returns similar ideas for given information
	 *
	 * @param   {integer}   iIdeaId         if a number is given, the respective idea is filtered out of the result set
	 * @param   {array}     aIdeaNameTerms  significant terms of idea title ("NAME")
	 * @param   {array}     aIdeaDescTerms  significant terms of description
	 * @param   {array}     aTags           tags attached to the idea
	 * @param   {boolean}   bFilterDrafts   flag whether to filter ideas in draft status
	 * @param   {integer}   iLimit          max number of results (default 13, max 50)
	 * @param   {integer}   iCampId         Campaign ID
	 * @return  {array}                     most similar ideas to the given one
	 */
	function querySimilarIdeas(iIdeaId, aIdeaNameTerms, aIdeaDescTerms, aTags, bFilterDrafts, iLimit, iCampId) {
		// check for aTags validity
		if (!aTags || !Array.isArray(aTags)) {
			aTags = [];
		}
		// check limit bounds, 1 to MAX_NR_OF_RESULTS
		iLimit = Math.max(Math.min(parseInt(iLimit, 10) || DEFAULT_NR_OF_RESULTS, MAX_NR_OF_RESULTS), 1);
		if (iIdeaId !== parseInt(iIdeaId, 10)) {
			// a valid source idea ID was not given, so we do not filter that out of the results
			iIdeaId = null;
		}
		//Get Current User ID in system
		
		var sUserName = $.session.getUsername();
		var iUserID;
 		var aResult = oHQ.statement('select id from \"sap.ino.db.iam::t_identity\" where user_name = ? ').execute(sUserName);
		if(aResult && aResult.length > 0){
		    iUserID = aResult[0].ID;
		}
		
		// check for maximum HANA Integer value, otherwise HANA will fail
		iIdeaId = Math.max(Math.min(iIdeaId, 2147483647), -2147483648);
		// get similar ideas query
		var query_template = 'select \'sap.ino.config.SIMILAR\' as semantic, descsim.SCORE as SIM_SCORE, ' +
			/* Note: $.hdb API has an issue with computed values as no metadata is available - converting values takes as default a too short (N)VARCHAR, 
            sometimes resulting in a casting error.
            The following line can be uncommented as soon as that works. (Remember to uncomment SNIPPETS-line below as well)
            */
			// descsim.NAME as SNIPPET_NAME, descsim.DESCRIPTION as SNIPPET_DESCRIPTION, ' +
			// Note: Tag DICE similarity measure only boosts the aggregated score
			'tag_similarity.DICE as SIM_DICE, LEAST(COALESCE (descsim.SCORE + 0.2 * tag_similarity.DICE, descsim.SCORE, tag_similarity.DICE), 1.0) as AGG_SCORE, ' +
			'ideas.* ' +
			'from "SAP_INO"."sap.ino.db.idea::v_idea_similar" ideas ' +
			'join ' +
			'( ' +
			'	select ID, ' +
			// uncomment if bug explained above is fixed
			//'       SNIPPETS(DESCRIPTION) as DESCRIPTION, SNIPPETS(NAME) as NAME, ' +
			'       SCORE() as SCORE ' +
			'	from "sap.ino.db.idea::t_idea"  ' +
			'	where  ' +
			'		contains(description, ? , LINGUISTIC, weight(0.4)) or ' +
			'		contains(name, ?, FUZZY(0.8, \'textSearch=compare, considerNonMatchingTokens=input\'), weight(0.6)) ' +
			'	) descsim ' +
			'on descsim.ID = ideas.ID ' +
			'left outer join  ' +
			'(SELECT IDEA_ID as IDEA_ID2, (2 * MATCHES) / (NR_OF_TAGS_INPUT + NR_OF_TAGS_IDEA) as DICE ' +
			'from ( ' +
			'select IDEA_ID, ? as NR_OF_TAGS_INPUT, count(nr) as NR_OF_TAGS_IDEA, sum(nr) as MATCHES ' +
			'   from (' +
			'	select idea_id, ' +
			'case when ' + ((aTags && aTags.length > 0) ? 'name in (' + aTags.map(function() {
				return "?";
			}).join(", ") + ')' : '1 = 0') +
			' then 1 else 0 end as nr from "sap.ino.db.idea::v_idea_tag" ) ' +
			'   group by IDEA_ID ) ' +
			'	where MATCHES > 0 ' +
			') tag_similarity ' +
			'on tag_similarity.IDEA_ID2 = descsim.ID ' +
			'where ideas.ID != ? ';
			var sIdeaFilter = iUserID ? ' and ((ideas.status_code <> \'sap.ino.config.DRAFT\' and ideas.created_by_id <> ' + iUserID +
			' and ideas.is_black_box <> 1 and ideas.show_idea_in_community = 1 ) or ideas.created_by_id = ' + iUserID + ')' : ' and ideas.status_code <> \'sap.ino.config.DRAFT\'';
		    var sCondition = (bFilterDrafts ? sIdeaFilter : '') +
			'order by AGG_SCORE desc limit ? ' +
			'with hint (NO_SUBPLAN_SHARING)';
		// prepare search term queries and pack into parameters
		var aParams = [aIdeaDescTerms.join(" OR "), aIdeaNameTerms.join(" OR "), aTags && aTags.length || 0].concat(aTags || []);
		// add idea id and limit
		aParams = aParams.concat([iIdeaId]);
		if (iCampId) {
			aParams = aParams.concat([iCampId]);
		}
		var result = [],
			iDirffent = iLimit;
		if (iCampId > 0) {
			var aSameCampaignResult = oHQ.statement(query_template + " AND ideas.CAMPAIGN_ID = ? " + sCondition).execute(aParams.concat([6]));
			if (aSameCampaignResult && aSameCampaignResult.length > 0) {
				result = result.concat(aSameCampaignResult);
				iDirffent = iLimit - aSameCampaignResult.length;
			}
			var aDirffentCampaignResult = oHQ.statement(query_template + " AND ideas.CAMPAIGN_ID != ? " + sCondition).execute(aParams.concat([
			iDirffent]));
			if (aDirffentCampaignResult && aDirffentCampaignResult.length > 0) {
				result = result.concat(aDirffentCampaignResult);
			}
		} else {
			result = oHQ.statement(query_template + sCondition).execute(aParams.concat([iLimit]));
		}
		return result;
	}

	/**
	 * filters the data structure returned by TA's <code>analyse</code> function and maps to a flat array of search terms
	 *
	 * The old API is still supported in SP10 onwards, but is slightly less performant and does not return an autodetected language.
	 *
	 * @param   {array}     aTokens     result <code>.token</code>s of TA's analyse function
	 * @return  {array}                 flat array of tokens for generating search query
	 */
	function filterTermsOldAPI(aTokens) {
		return _.uniq(aTokens.filter(function(item) {
			// filter all tokens smaller than 3 characters & incorrectly recognized "the" 
			if ((item.term.length < 3) || (item.term === "the") || (item.term === "The")) {
				return false;
			}
			// only retain nouns & topics - "unknown" are usually relevant as well
			return ["noun", "unknown", "proper name"].indexOf(item.stype) >= 0;
		}).map(function(item) {
			// get normalized terms where available or otherwise the raw token
			return item.nterm || item.term;
		}));
	}

	/**
	 * filters the data structure returned by the new <code>$.text.analysis</code> API (HANA SP10+) and maps to a flat array of search terms
	 *
	 * The new API is slightly more performant but has a different result object signature.
	 *
	 * @param   {array}     aTokens     result <code>.token</code>s of new TA API
	 * @return  {array}                 flat array of tokens for generating search query
	 */
	function filterTermsNewAPI(aTokens) {
		return _.uniq(aTokens.filter(function(item) {
			// filter all tokens smaller than 3 characters & incorrectly recognized "the" 
			if ((item.token.length < 3) || (item.token === "the") || (item.token === "The")) {
				return false;
			}
			// only retain nouns & topics - "unknown" are usually relevant as well
			return ["noun", "unknown", "proper name"].indexOf(item.partOfSpeech) >= 0;
		}).map(function(item) {
			// get normalized terms where available or otherwise the raw token
			return item.normalizedToken || item.token;
		}));
	}

	/**
	 * Returns similar ideas for a given name, description and tags, possibly id (e.g. if the idea is edited)
	 *
	 * @param   {integer}       ideaId              a valid id of an idea, if available
	 * @param   {string}        sIdeaName           the name (title) of the idea
	 * @param   {string}        sIdeaDescription    the description of the idea
	 * @param   {array}         aTags               Array of tags (strings) attached to this idea
	 * @param   {string}        [sLanguage]         optional; used to override default language English for linguistic analysis (if known beforehand)
	 * @param   {boolean}       [bFilterDrafts]     optional; flag to indicate that ideas in draft status should be filtered
	 * @param   {integer}       iLimit              optional: max number of results
	 * @returns {array}                             the most similar ideas
	 */
	function getSimilarIdeasByText(ideaId, sIdeaName, sIdeaDescription, aTags, sLanguage, bFilterDrafts, iLimit, iCampId) {
		var aNameTerms = [],
			aDescTerms = [];
		if ($.text && $.text.analysis && $.text.analysis.Session) {
			// new text analysis API, SP10+
			var oSession = new $.text.analysis.Session({
				configuration: 'EXTRACTION_CORE'
			});
			var oNameTA = oSession.analyze({
				inputDocumentText: sIdeaName || '',
				mimeType: "text/plain",
				languageDetection: SUPPORTED_LANGUAGES,
				language: sLanguage || ''
			});
			var oDescTA = oSession.analyze({
				inputDocumentText: sIdeaDescription || '',
				mimeType: "text/html",
				languageDetection: SUPPORTED_LANGUAGES,
				language: sLanguage || ''
			});
			if (oDescTA && oNameTA) {
				// detected language
				sLanguage = sLanguage || oDescTA.language || oNameTA.language || 'en';
				aNameTerms = filterTermsNewAPI(oNameTA.tokens);
				aDescTerms = filterTermsNewAPI(oDescTA.tokens);
			}
		} else {
			// old API - deprecated but here for backwards compatibility
			const oTA = $.db.textanalysis;
			sLanguage = sLanguage || 'en';
			// get relevant terms of document
			aNameTerms = filterTermsOldAPI(oTA.analyse(sIdeaName || '', null, sLanguage, "text/plain", "EXTRACTION_CORE").tokens);
			aDescTerms = filterTermsOldAPI(oTA.analyse(sIdeaDescription || '', null, sLanguage, "text/html", "EXTRACTION_CORE").tokens);
		}
		var oResult = querySimilarIdeas(ideaId, aNameTerms, aDescTerms, aTags, bFilterDrafts, iLimit, iCampId);
		return oResult;
	}

	/**
	 * Returns similar ideas for a given idea id
	 *
	 * @param   {integer}       iIdeaId         a valid id of an idea
	 * @param   {integer}       bFilterDrafts   flag to indicate that ideas in draft status should be filtered
	 * @param   {integer}       iLimit          optional: max number of results
	 * @returns {array}                         the most similar ideas
	 */
	function getSimilarIdeasById(iIdeaId, bFilterDrafts, iLimit, iCampId) {
		// HANA's INT bounds
		iIdeaId = Math.max(Math.min(parseInt(iIdeaId, 10), 2147483647), -2147483648);
		var query = 'select * ' +
			'from ( ' +
			'select id, \'name\' as target, string_agg(term, \' OR \' ) as query ' +
			'from ( ' +
			'select id, coalesce (ta_stem, ta_normalized, ta_token) as term ' +
			'from "SAP_INO"."$TA_sap.ino.db.idea::i_idea_name" ' +
			'where ta_type in (\'noun\', \'proper name\', \'unknown\') ' +
			'and length(ta_token) > 2 ' +
			// damn "the"
			'and ta_normalized != \'the\' ' +
			'group by id, coalesce (ta_stem, ta_normalized, ta_token) ' +
			') group by id ' +
			'union all ' +
			'select id, \'description\' as target, string_agg(term, \' OR \') as query ' +
			'from ( ' +
			'select id, coalesce (ta_stem, ta_normalized, ta_token) as term ' +
			'from "SAP_INO"."$TA_sap.ino.db.idea::i_idea_description" ' +
			'where ta_type in (\'noun\', \'proper name\', \'unknown\') ' +
			'and length(ta_token) > 2 ' +
			// damn "the"
			'and ta_normalized != \'the\' ' +
			'group by id, coalesce (ta_stem, ta_normalized, ta_token) ' +
			') group by id ' +
			') where id = ?';
		var terms = oHQ.statement(query).execute(iIdeaId);
		if (terms.length !== 2) {
			return [];
		}
		var aTitleTerms = _.findWhere(terms, {
				TARGET: "name"
			}).QUERY,
			aDescTerms = _.findWhere(terms, {
				TARGET: "description"
			}).QUERY;
		// get tags
		var aTags = oHQ.statement('select name from "sap.ino.db.idea::v_idea_tag" where IDEA_ID = ?')
			.execute(iIdeaId)
			.map(function(item) {
				return item.NAME;
			});
		return querySimilarIdeas(iIdeaId, [aTitleTerms], [aDescTerms], aTags, bFilterDrafts, iLimit, iCampId);
	}

	/** exported functions & fields, public interface **/
	exports.getSimilarIdeasById = getSimilarIdeasById;
	exports.getSimilarIdeasByText = getSimilarIdeasByText;
	exports.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
}(this));