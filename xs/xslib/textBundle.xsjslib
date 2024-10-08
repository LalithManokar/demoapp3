var trace = $.import("sap.ino.xs.xslib", "trace");
var hq = $.import("sap.ino.xs.xslib", "hQuery");
var i18n = $.import("sap.ino.xs.xslib", "i18n");
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const SqlInjectionSafe = $.import("sap.ino.xs.xslib", "sqlInjectionSafe");

var whoAmI = 'sap.ino.xs.xslib.textBundle.xsjs';

function warning(line) {
	trace.warning(whoAmI, line);
}

function debug(line) {
	trace.debug(whoAmI, line);
}

var getTextBundle = _.wrap(getTextBundleObject, stringify);
var getExtensibleTextBundle = _.wrap(getExtensibleTextBundleObject, stringify);

var text = {};
var oObjectNames = {
	"nguii18n": ["nguii18n", "sap_ino_commons", "sap_ino_controls", "sap_ino_wall"]
};
var aLongTxt = ['t_phase', 't_status', 't_value_option', 't_value_option_list', 't_status_action', 't_criterion'];

function getNormalText(sObjectName, sTextId, aParameter, sPreferredLanguage, bEnableLinebreak, oHQ) {
	oHQ = oHQ || hq.hQuery(oConn);
	sObjectName = sObjectName || '';
	bEnableLinebreak = bEnableLinebreak || true;
	if (text[sObjectName + sTextId + sPreferredLanguage] === undefined) {
		var aResult = getExtensibleTextBundleObject(sObjectName, sPreferredLanguage, sTextId);
		if (aResult.length > 0) {
			var sResult = aResult[0].CONTENT;
			if (bEnableLinebreak) {
				var re = new RegExp("\\\\n", "mg");
				sResult = sResult.replace(re, "\n");
			}
			text[sObjectName + sTextId + sPreferredLanguage] = sResult;
		} else {
			text[sObjectName + sTextId + sPreferredLanguage] = sTextId;
		}
	}

	if (aParameter !== undefined && aParameter !== null) {
		return this.substitutePlaceholders(text[sObjectName + sTextId + sPreferredLanguage], aParameter);
	} else {
		return text[sObjectName + sTextId + sPreferredLanguage];
	}
}

function getText(sObjectName, sTextId, aParameter, sPreferredLanguage, bEnableLinebreak, oHQ) {
	oHQ = oHQ || hq.hQuery(oConn);
	// sPreferredLanguage = sPreferredLanguage || i18n.getSystemDefaultLanguage(oHQ) || 'en';
	// sObjectName = sObjectName || '';
	// bEnableLinebreak = bEnableLinebreak || true;
	// if (text[sObjectName + sTextId + sPreferredLanguage] === undefined) {
	//     var aResult = getExtensibleTextBundleObject(sObjectName, sPreferredLanguage, sTextId);
	//     if (aResult.length > 0) {
	//         var sResult = aResult[0].CONTENT;
	//         if (bEnableLinebreak) {
	//             var re = new RegExp("\\\\n", "mg");
	//             sResult = sResult.replace(re, "\n");
	//         }
	//         text[sObjectName + sTextId + sPreferredLanguage] = sResult;
	//     } else {
	//         text[sObjectName + sTextId + sPreferredLanguage] = sTextId;
	//     }
	// }

	// if (aParameter !== undefined && aParameter !== null) {
	//     return this.substitutePlaceholders(text[sObjectName + sTextId + sPreferredLanguage], aParameter);
	// } else {
	//     return text[sObjectName + sTextId + sPreferredLanguage];
	// }

	sPreferredLanguage = sPreferredLanguage || i18n.getSystemDefaultLanguage(oHQ) || 'en';

	return getNormalText(sObjectName, sTextId, aParameter, sPreferredLanguage, bEnableLinebreak, oHQ);
}

function preloadText(sObjectName, sTextId, sPreferredLanguage, bEnableLinebreak, oHQ) {
	oHQ = oHQ || hq.hQuery(oConn);
	sPreferredLanguage = sPreferredLanguage || i18n.getSystemDefaultLanguage(oHQ) || 'en';
	sObjectName = sObjectName || '';
	bEnableLinebreak = bEnableLinebreak || true;
	var aResult = getExtensibleTextBundleObject(sObjectName, sPreferredLanguage, sTextId);
	if (aResult.length > 0) {
		_.each(aResult, function(oResult) {
			var sResult = oResult.CONTENT;
			if (bEnableLinebreak) {
				var re = new RegExp("\\\\n", "mg");
				sResult = sResult.replace(re, "\n");
			}
			text[sObjectName + oResult.TEXT_ID + sPreferredLanguage] = sResult;
		});
	}
}

function substitutePlaceholders(sTemplate, aTemplateParameter) {
	var sResult = sTemplate;

	for (var i = 0; i < aTemplateParameter.length; ++i) {
		var re = new RegExp("(^|\\W)\\{" + i + "\\}(\\W|$)", "mg");
		sResult = sResult.replace(re, "$1" + aTemplateParameter[i] + "$2");
	}
	return sResult;
}

function getTextBundleObject(sTableName, sCodeColumn, sTextColumn, sLanguageColumn, sLocale, sCode, bPseudo) {
	var sStatement;
	var sContentColumn;

	if (sLocale) {
		// For pseudo translation: content is blob and therefore not limited => introduce a default limit of 5000 chars for ui testing
		sContentColumn = bPseudo ? "LEFT('[[[' || RPAD(" + sTextColumn + ", 4994, '+') || ']]]', 5000)" : sTextColumn;

		sStatement = "select " + sCodeColumn + " as text_id, " + sContentColumn + " as content from (" +
			"select " + sCodeColumn + ", " + sTextColumn + ", row_number() over (partition by " + sCodeColumn + " order by ord asc) r " +
			"from (" +
			"select " +
			"tc." + sCodeColumn + ", tc." + sTextColumn + ", o.ord " +
			"from " +
			sTableName + " as tc " +
			"cross join (" +
			"select ? as lang, 1 as ord from dummy " +
			"union all " +
			"select iso_code as lang, 2 as ord from \"sap.ino.db.basis::v_sys_default_language\" " +
			") as o " +
			"where " +
			"o.lang = tc." + sLanguageColumn;
		if (sCode) {
			sStatement = sStatement + " and tc." + sCodeColumn + " = '" + sCode + "'";
		}
		sStatement = sStatement + ")" + ") where r = 1";
	} else {
		// For pseudo translation: content is blob and therefore not limited => introduce a default limit of 5000 chars for ui testing
		sContentColumn = bPseudo ? "LEFT('[[[' || RPAD(tc." + sTextColumn + ", 4994, '+') || ']]]', 5000)" : "tc." + sTextColumn;

		sStatement =
			"select " +
			"tc." + sCodeColumn + " as text_id, " + sContentColumn + " as content " +
			"from " +
			sTableName + " as tc " +
			"inner join (" +
			"select iso_code as lang from \"sap.ino.db.basis::v_sys_default_language\" " +
			") as o " +
			"on " +
			"tc." + sLanguageColumn + " = o.lang";

		if (sCode) {
			sStatement = sStatement + " and tc." + sCodeColumn + " = '" + sCode + "'";
		}
	}

	var oHQ = $.sap.ino.xs.xslib.hQuery.hQuery(oConn);
	if (sLocale) {
		return oHQ.statement(sStatement).execute(sLocale);
	} else {
		return oHQ.statement(sStatement).execute();
	}
}

function getExtensibleTextBundleObject(sObjectName, sLocale, sTextId, bPseudo) {
	var sStatement;
	var sContentColumn;

	if (bPseudo) {
		sContentColumn = "CASE WHEN tc.max_length > 0 THEN " +
			"CASE WHEN tc.max_length < 6 " +
			"THEN LEFT('[]]]]]', tc.max_length) " +
			"ELSE LEFT('[[[' || RPAD(tc.content, tc.max_length - 6, '+') || ']]]', tc.max_length) " +
			"END " +
			"ELSE " +
			"'[[[' || RPAD(tc.content, 4994, '+') || ']]]' " +
			"END as content";
	} else {
		sContentColumn = "tc.content";
	}

	var sObjectTable;
	switch (sObjectName) {
		case 't_phase':
			sObjectTable = 'sap.ino.db.campaign::t_phase';
			break;
		case 't_status':
			sObjectTable = 'sap.ino.db.status::t_status';
			break;
		case 't_vote_type':
			sObjectTable = 'sap.ino.db.campaign::t_vote_type';
			break;
		case 't_unit':
			sObjectTable = 'sap.ino.db.basis::t_unit';
			break;
		case 't_status_model':
			sObjectTable = 'sap.ino.db.status::t_status_model';
			break;
		case 't_auto_publication':
			sObjectTable = 'sap.ino.db.evaluation::t_auto_publication';
			break;
		case 't_model':
			sObjectTable = 'sap.ino.db.evaluation::t_model';
			break;
		case 't_responsibility_stage':
			sObjectTable = 'sap.ino.db.subresponsibility::t_responsibility_stage';
			break;
		case 't_form':
			sObjectTable = 'sap.ino.db.ideaform::t_form';
			break;
		case 't_value_option':
			sObjectTable = 'sap.ino.db.basis::t_value_option';
			break;
		case 't_value_option_list':
			sObjectTable = 'sap.ino.db.basis::t_value_option_list';
			break;
		case 't_criterion':
			sObjectTable = 'sap.ino.db.evaluation::t_criterion';
			break;
		case 't_status_action':
			sObjectTable = 'sap.ino.db.status::t_status_action';
			break;
	}

	if (sLocale) {
		sStatement = "select text_id, content from ( " +
			"select text_id, content, row_number() over (partition by text_id order by layer desc, ord asc) r " +
			"from ( " +
			"select " +
			"tc.text_id, tc.lang, " + sContentColumn + ", tc.layer, o.ord  " +
			"from ( " +
			"( select " +
			"tc.text_id, tc.lang, tc.content, ext.layer " + (bPseudo ? ", t.max_length " : "") +
			"from " +
			"_sys_repo.active_content_text_content as tc " +
			"inner join " +
			"\"sap.ino.db.basis::t_package_extension\" as ext " +
			"on " +
			"ext.ext_package_id = tc.package_id " + getObjectCondition(sObjectName);
		// 			"and tc.object_name = ? ";
		if (sTextId) {
			sStatement = sStatement + "and tc.text_id like '" + SqlInjectionSafe.sqlEscapeSingleQuotes(sTextId) + "' ";
		}

		if (bPseudo) {
			sStatement += "inner join  _sys_repo.active_content_text as t  on  tc.text_id = t.text_id ";
		}

		sStatement = sStatement +
			") union all ( " +
			"select " +
			"tc.text_id, tc.lang, tc.content, 0 as layer " + (bPseudo ? ", t.max_length " : "") +
			"from ";
		if (bPseudo) {
			sStatement = sStatement + "_sys_repo.active_content_text as t, ";
		}

		sStatement = sStatement + "_sys_repo.active_content_text_content as tc " +
			"where " +
			"tc.package_id = 'sap.ino.text' " + getObjectCondition(sObjectName);
		// 			"and tc.object_name = ? ";

		if (sTextId) {
			sStatement = sStatement +
				"and tc.text_id like '" + SqlInjectionSafe.sqlEscapeSingleQuotes(sTextId) + "' ";
		}

		if (bPseudo) {
			sStatement = sStatement + "and tc.text_id = t.text_id ";
		}

		if (sObjectTable) {
			sStatement = sStatement +
				") union all ( " +
				"select " +
				"t_object.code as text_id, " +
				"'' as lang, " +
				"t_object.default_text as content, " +
				"-1 as layer " +
				"from " +
				"\"" + sObjectTable + "\" as t_object ";
			if (sTextId) {
				sStatement = sStatement +
					"where " +
					"t_object.code = '" + SqlInjectionSafe.sqlEscapeSingleQuotes(sTextId) + "' ";
			}
			if (aLongTxt.indexOf(sObjectName) > -1) {
				sStatement = sStatement +
					") union all ( " +
					"select " +
					"CONCAT(t_object.code,\'_LONG\') as text_id, " +
					"'' as lang, " +
					"t_object.default_long_text as content, " +
					"-1 as layer " +
					"from " +
					"\"" + sObjectTable + "\" as t_object ";
				if (sTextId) {
					sStatement = sStatement +
						"where " +
						"t_object.code = '" + SqlInjectionSafe.sqlEscapeSingleQuotes(sTextId) + "' ";
				}
			}
		}

		sStatement = sStatement +
			") ) as tc " +
			"cross join ( " +
			"select ? as lang, 1 as ord from dummy " +
			"union all " +
			"select iso_code as lang, 2 as ord from \"sap.ino.db.basis::v_sys_default_language\" " +
			"union all " +
			"select '' as lang, 3 as ord from dummy " +
			") as o " +
			"where " +
			"o.lang = tc.lang " +
			") " +
			") where r = 1";
	} else {
		if (bPseudo) {
			sStatement = "select text_id, content from (" +
				"select text_id, " + sContentColumn + ", row_number() over (partition by text_id order by layer desc) r " +
				"from (" +
				"( select " +
				"tc.text_id, tc.content, ext.layer, t.max_length " +
				"from " +
				"_sys_repo.active_content_text_content as tc " +
				"inner join " +
				"_sys_repo.active_content_text as t " +
				"on " +
				"tc.text_id = t.text_id " +
				"inner join  " +
				"\"sap.ino.db.basis::t_package_extension\" as ext " +
				"on " +
				"ext.ext_package_id = tcont.package_id " + getObjectCondition(sObjectName) +
			// "and tc.object_name = ? " +
			"and tc.lang = '' ) " +
				"union all " +
				"( select " +
				"tc.text_id, tc.content, 0 as layer, t.max_length " +
				"from " +
				"_sys_repo.active_content_text_content as tc, " +
				"_sys_repo.active_content_text as t " +
				"where " +
				"tc.package_id = 'sap.ino.text' " + getObjectCondition(sObjectName) +
			// "and tc.object_name = ? " +
			"and tc.lang = '' " +
				"and tc.text_id = t.text_id ) ";
			if (sTextId) {
				sStatement = sStatement +
					"and tc.text_id like '" + SqlInjectionSafe.sqlEscapeSingleQuotes(sTextId) + "' ";
			}
			sStatement = sStatement +
				") as tc " +
				") where r = 1";
		} else {
			sStatement = "select text_id, content from (" +
				"select text_id, content, row_number() over (partition by text_id order by layer desc) r " +
				"from ( " +
				"( select " +
				"tc.text_id, tc.content, ext.layer " +
				"from " +
				"_sys_repo.active_content_text_content as tc " +
				"inner join  " +
				"\"sap.ino.db.basis::t_package_extension\" as ext " +
				"on " +
				"ext.ext_package_id = tc.package_id ";
			if (sTextId) {
				sStatement = sStatement +
					"and tc.text_id like '" + SqlInjectionSafe.sqlEscapeSingleQuotes(sTextId) + "' ";
			}
			sStatement = sStatement + getObjectCondition(sObjectName) +
			// "and tc.object_name = ? " +
			"and tc.lang = '' ) " +
				"union all " +
				"( select " +
				"tc.text_id, tc.content, 0 as layer " +
				"from " +
				"_sys_repo.active_content_text_content as tc " +
				"where " +
				"tc.package_id = 'sap.ino.text' ";
			if (sTextId) {
				sStatement = sStatement +
					"and tc.text_id like '" + SqlInjectionSafe.sqlEscapeSingleQuotes(sTextId) + "' ";
			}
			sStatement = sStatement + getObjectCondition(sObjectName) +
			// "and tc.object_name = ? " +
			"and tc.lang = '' ";

			if (sObjectTable) {
				sStatement = sStatement +
					") union all ( " +
					"select " +
					"t_object.code as text_id, " +
					"t_object.default_text as content, " +
					"-1 as layer " +
					"from " +
					"\"" + sObjectTable + "\" as t_object ";
				if (sTextId) {
					sStatement = sStatement +
						"where " +
						"t_object.code = '" + SqlInjectionSafe.sqlEscapeSingleQuotes(sTextId) + "' ";
				}
				if (aLongTxt.indexOf(sObjectName) > -1) {
					sStatement = sStatement +
						") union all ( " +
						"select " +
						"CONCAT(t_object.code,\'_LONG\') as text_id, " +
						"t_object.default_long_text as content, " +
						"-1 as layer " +
						"from " +
						"\"" + sObjectTable + "\" as t_object ";
					if (sTextId) {
						sStatement = sStatement +
							"where " +
							"t_object.code = '" + SqlInjectionSafe.sqlEscapeSingleQuotes(sTextId) + "' ";
					}
				}
			}

			sStatement = sStatement +
				") " +
				") " +
				") where r = 1";
		}
	}

	var oHQ = $.sap.ino.xs.xslib.hQuery.hQuery(oConn);
	if (sLocale) {
		return oHQ.statement(sStatement).execute(getObjectParamFromCondition(sObjectName).concat([sLocale]));
	} else {
		return oHQ.statement(sStatement).execute(getObjectParamFromCondition(sObjectName));
	}
}

function stringify(fnFunction) {
	try {
		var aArgs = _.toArray(arguments).slice(1);
		var aResult = fnFunction.apply(this, aArgs);
		var sResult = "";
		_.each(aResult, function(oText) {
			if (typeof oText.CONTENT === "string") {
				sResult += oText.TEXT_ID + "=" + oText.CONTENT + "\r\n";
			} else if (oText.CONTENT === null) {
				sResult += oText.TEXT_ID + "=\r\n";
			} else {
				sResult += oText.TEXT_ID + "=" + $.util.stringify(oText.CONTENT) + "\r\n";
			}
		});
		return sResult;
	} catch (e) {
		return "";
	}
}

function getObjectCondition(sObjectName) {
	var result = " and (tc.object_name = ? ";
	if (sObjectName && oObjectNames.hasOwnProperty(sObjectName) && oObjectNames[sObjectName].length > 0) {
		var aObjectNames = oObjectNames[sObjectName];
		for (var index = 0; index <= aObjectNames.length - 2; index++) {
			result += " OR tc.object_name = ? ";
		}
	}
	return result + ") ";
}

function getObjectParamFromCondition(sObjectName) {
	if (sObjectName && oObjectNames.hasOwnProperty(sObjectName)) {
		return oObjectNames[sObjectName].concat(oObjectNames[sObjectName]);
	}
	return [sObjectName, sObjectName];
}