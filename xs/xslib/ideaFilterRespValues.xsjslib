//provide some functions to idea_filter_resp_values.xsjs service
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const ohQuery = $.import("sap.ino.xs.xslib", "hQuery");
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var oHQ = ohQuery.hQuery(oConn).setSchema("SAP_INO");

var fnExchange = function(aData) {
	var oGroupData = _.groupBy(aData, function(oData) {
		if (oData.PARENT_CODE) {
			return oData.PARENT_CODE;
		} else {
			return "empty";
		}
	});
	if (!oGroupData.empty) {
		return [];
	}
	var aRoots = oGroupData.empty.slice();
	var findChildrenNodes = function(aParentNodes) {
		_.each(aParentNodes, function(oRoot) {
			oRoot.children = [];
			oRoot.children = oRoot.children.concat(_.where(aData, {
				PARENT_CODE: oRoot.CODE
			}));
			if (oRoot.children.length > 0) {
				findChildrenNodes(oRoot.children);
			}
		});
	};
	findChildrenNodes(aRoots);
	return aRoots;
};

var deleteUnusedRespValues = function(aRespValues, aSelectedRespCodes) {
	if (!aRespValues) {
		return;
	}
	_.each(aRespValues, function(oRespValue) {
		if (oRespValue.children && oRespValue.children.length > 0) {
			deleteUnusedRespValues(oRespValue.children, aSelectedRespCodes);
		}
		if (_.where(aSelectedRespCodes, {
			CODE: oRespValue.CODE
		}).length === 0 && (!oRespValue.children || oRespValue.children.length === 0 || _.where(oRespValue.children, {
			IsDeleted: true
		}).length === oRespValue.children.length)) {
			oRespValue.IsDeleted = true;
		}
	});
};

var reconstructTree = function(aRespValues, aAllRespSelect) {
	if (!aAllRespSelect) {
		return;
	}
	_.each(aAllRespSelect, function(oRespSelect) {
		if (!oRespSelect.IsDeleted) {
			var currentResp = {
				"DEFAULT_TEXT": oRespSelect.DEFAULT_TEXT,
				"DEFAULT_LONG_TEXT": oRespSelect.DEFAULT_LONG_TEXT,
				"CODE": oRespSelect.CODE,
				"PARENT_CODE": oRespSelect.PARENT_CODE,
				"RESP_CODE":oRespSelect.RESP_CODE,
				"RESP_LIST_DEFAULT_TEXT": oRespSelect.RESP_LIST_DEFAULT_TEXT,
				"SEQUENCE_NO": oRespSelect.SEQUENCE_NO,
				"children": []
			};
			if (oRespSelect.children && oRespSelect.children.length > 0) {
				reconstructTree(currentResp.children, oRespSelect.children);
			}
			aRespValues.push(currentResp);
		}
	});
	
	
	
	//aRespValues = aTempRespValues;
};
	function sortObjectArray(aObjects, sSortKeyName) {
		aObjects.sort(function(o1, o2) {
			if (o1[sSortKeyName] < o2[sSortKeyName]) {
				return -1;
			} else {
				return 1;
			}
		});

		for (var i = 0; i < aObjects.length; i++) {
			// if there are children sort them too
			if (aObjects[i].children) {
				sortObjectArray(aObjects[i].children, sSortKeyName);
			}
		}

		return aObjects;
	};
	
function getRespValues(iCampaignId) {
	var vResult = {},
		aSelectedRespCodes;
	var oResponse = {
		status: $.net.http.OK,
		body: vResult
	};

	var sSelect =
		'select distinct resp_value_code as code, parent_value_code as parent_code, default_text, default_long_text from \
            "sap.ino.db.idea::v_idea_resp_value_for_filter"';

	if (iCampaignId) {
		sSelect = sSelect + " where campaign_id = ?";
		aSelectedRespCodes = oHQ.statement(sSelect).execute(iCampaignId);
	} else {
		aSelectedRespCodes = oHQ.statement(sSelect).execute();
	}

	if (!aSelectedRespCodes || aSelectedRespCodes.length === 0) {
		return oResponse;
	}

	var sAllRespSelect =
		`SELECT coalesce(
		resp_value_text.content, 
		resp_value.default_text
	) AS default_text, 
	resp_value.default_long_text, 
	resp_value.code as code,
	resp_value.parent_value_code as parent_code,
    resp_value.RESP_CODE,
    resp_value.SEQUENCE_NO,
    resp_list.default_text as resp_list_default_text	
   FROM "sap.ino.db.subresponsibility::t_responsibility_value_stage" AS resp_value
	LEFT OUTER JOIN "sap.ino.db.basis::v_resolved_text" AS resp_value_text
	ON resp_value.code = resp_value_text.text_id
    left outer join "sap.ino.db.subresponsibility::t_responsibility_stage" as resp_list
    on resp_list.code = resp_value.resp_code `;
	var aAllRespSelect = oHQ.statement(sAllRespSelect).execute();

	// exchange to hierarchy data
	aAllRespSelect = fnExchange(aAllRespSelect);
	deleteUnusedRespValues(aAllRespSelect, aSelectedRespCodes);
	vResult.RespValues = [];

	reconstructTree(vResult.RespValues, aAllRespSelect);
	
	
	//Add the responsibilit list to the root
	vResult.RespValues = sortObjectArray(vResult.RespValues, "SEQUENCE_NO");
	var aTempRespValues = [];
		      for(var i = 0; i < vResult.RespValues.length ;i++){
		          vResult.RespValues[i].PARENT_CODE = vResult.RespValues[i].RESP_CODE;
		      }	
	
    var aGroupData = _.groupBy(vResult.RespValues, function(oData) {
        return oData.RESP_CODE;
	});	
		_.each(aGroupData, function(aData) {
			var oRootResp = {
				"DEFAULT_TEXT": aData[0].RESP_LIST_DEFAULT_TEXT,
				"CODE": aData[0].RESP_CODE,
				"PARENT_CODE":null,
				"RESP_CODE":aData[0].RESP_CODE,
				"children": aData
			};   
			aTempRespValues.push(oRootResp);
		});	
	vResult.RespValues = aTempRespValues;
	
	return oResponse;
}