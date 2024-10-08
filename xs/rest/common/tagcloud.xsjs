/*
   Example calls:
   select default number of tags
   http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/tagcloud.xsjs

   select top 20
   http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/tagcloud.xsjs?TOP=20

   selection restricted to all ideas with TAG 2 AND 5
   http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/tagcloud.xsjs?TAG=2&TAG=5

   selection restricted to CAMPAIGN 2 OR 5
   http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/tagcloud.xsjs?CAMPAIGN=2&CAMPAIGN=5

   selection restricted to (CAMPAIGN 1 OR 3) AND (TAG 2 AND 5)
   http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/tagcloud.xsjs?TAG=2&TAG=5&CAMPAIGN=1&CAMPAIGN=3

   Debug examples:
   http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/tagcloud.xsjs/trace
   http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/tagcloud.xsjs/trace?TOP=10
 */

const hReadService = $.import("sap.ino.xs.xslib", "hReadService");

var testMap = {
	SEARCHTERM: {
		scalarName: "IV_SEARCHTERM"
	},
	FILTERNAME: {
		scalarName: "IV_FILTERNAME"
	},
	FILTER_BACKOFFICE: {
		scalarName: "IV_FILTER_BACKOFFICE"
	},
	CAMPAIGN: {
		scalarName: "IV_CAMPAIGN"
	},
	STEP: {
		scalarName: "IV_STEP"
	},
	STATUS: {
		scalarName: "IV_STATUS"
	},
	TAG: {
		tableName: "IT_TAG",
		columnName: "ID"
	},
	EXCL_STATUS: {
		tableName: "IT_EXCL_STATUS",
		columnName: "CODE"
	},
	TAG_STR: {
		scalarName: "IV_TAG_STR"
	},
	EXCL_STATUS_STR: {
		scalarName: "IV_EXCL_STATUS_STR"
	},
	SUB_STATUS: {
		scalarName: "IV_SUB_STATUS"
	},
	RESP_VALUE_CODE: {
		scalarName: "IV_RESP_VALUE_CODE"
	},
	VOTE_NUMBER: {
		scalarName: "IV_VOTE_NUMBER"
	},
	VOTE_OPERATOR: {
		scalarName: "IV_VOTE_OPERATOR"
	},
	PHASE: {
		scalarName: "IV_PHASE"
	},
	FOLLOW_UP_DATE: {
		scalarName: "IV_FOLLOW_UP_DATE"
	},
	AUTHORS: {
		scalarName: "IV_AUTHORS"
	},
	COACHES: {
		scalarName: "IV_COACHES"
	}
};

var testParameters = hReadService.mapInputParameters(testMap, $.request.parameters);
//TODO when should invoke this shortcut?
var shortcut = testParameters.IV_SEARCHTERM === "" &&
	testParameters.IV_STEP === "" &&
	testParameters.IV_STATUS === "" &&
	testParameters.IV_FILTERNAME === "" &&
	testParameters.IV_FILTER_BACKOFFICE === "" &&
	testParameters.IT_EXCL_STATUS.length <= 1 &&
	testParameters.IT_TAG.length === 0;

var configuration = {};
if (shortcut) {
	testMap.EXCL_STATUS = {
		scalarName: "IV_EXCL_STATUS"
	};
	testParameters.IV_EXCL_STATUS = testParameters.IT_EXCL_STATUS.length === 1 ? testParameters.IT_EXCL_STATUS[0].CODE : "";
	configuration[$.net.http.GET] = {
		// shortcut
		procedureName: "sap.ino.db.idea.ext::p_ext_idea_tag_group_cloud_by_campaign",
		inputParameterMap: {
			CAMPAIGN: {
				scalarName: "IV_CAMPAIGN_ID",
				defaultValue: ""
			},
			EXCL_STATUS: {
				scalarName: "IV_EXCL_STATUS",
				defaultValue: ""
			}
		},
		outputParameterMap: {
			WITHOUT_GROUP: {
				scalarName: "OV_WITHOUT_TAGGROUP",
				defaultValue: ""
			},
			RANKED_TAG: {
				tableName: "OT_RANKED_TAG"
			}
		}
	};
} else {
	if (testParameters.IT_TAG.length > 1) {
		for (var index in testParameters.IT_TAG) {
			testParameters.IV_TAG_STR += (testParameters.IT_TAG[index].ID + ';');
		}
		testParameters.IV_TAG_STR = testParameters.IV_TAG_STR.substring(0, testParameters.IV_TAG_STR.Length - 1);
	}
	if (testParameters.IT_EXCL_STATUS.length > 1) {
		for (var index in testParameters.IT_EXCL_STATUS) {
			testParameters.IV_EXCL_STATUS_STR += (testParameters.IT_EXCL_STATUS[index].CODE + ';');
		}
		testParameters.IV_EXCL_STATUS_STR = testParameters.IV_EXCL_STATUS_STR.substring(0, testParameters.IV_EXCL_STATUS_STR.Length - 1);
	}
	configuration[$.net.http.GET] = {
		procedureName: "sap.ino.db.idea.ext::p_ext_idea_tag_cloud_by_group",
		inputParameterMap: {
			SEARCHTERM: {
				scalarName: "IV_SEARCHTERM",
				defaultValue: ""
			},
			FILTERNAME: {
				scalarName: "IV_FILTERNAME",
				defaultValue: ""
			},
			FILTER_BACKOFFICE: {
				scalarName: "IV_FILTER_BACKOFFICE",
				defaultValue: 0
			},
			CAMPAIGN: {
				scalarName: "IV_CAMPAIGN",
				defaultValue: ""
			},
			STEP: {
				scalarName: "IV_STEP",
				defaultValue: -1
			},
			STATUS: {
				scalarName: "IV_STATUS",
				defaultValue: ""
			},
			IDEAFILTERCONTINUINGCHANGE: {
				scalarName: "IV_IDEA_CONTINUING_CHANGE",
				defaultValue: ""
			},
			TAG: {
				scalarName: "IV_TAG_STR",
				defaultValue: ""
			},
			EXCL_STATUS: {
				scalarName: "IV_EXCL_STATUS_STR",
				defaultValue: ""
			},
			SUB_STATUS: {
				scalarName: "IV_SUB_STATUS",
				defaultValue: ""
			},
			RESP_VALUE_CODE: {
				scalarName: "IV_RESP_VALUE_CODE",
				defaultValue: ""
			},
			VOTE_NUMBER: {
				scalarName: "IV_VOTE_NUMBER",
				defaultValue: ""
			},
			VOTE_OPERATOR: {
				scalarName: "IV_VOTE_OPERATOR",
				defaultValue: ""
			},
			PHASE: {
				scalarName: "IV_PHASE",
				defaultValue: ""
			},
			FOLLOW_UP_DATE: {
				scalarName: "IV_FOLLOW_UP_DATE",
				defaultValue: ""
			},
			AUTHORS: {
				scalarName: "IV_AUTHORS",
				defaultValue: ""
			},
			COACHES: {
				scalarName: "IV_COACHES",
				defaultValue: ""
			}
		},
		outputParameterMap: {
			WITHOUT_GROUP: {
				scalarName: "OV_WITHOUT_TAGGROUP",
				defaultValue: ""
			},
			RANKED_TAG: {
				tableName: "OT_RANKED_TAG"
			}
		}
	};
}

var outputArray = {};
outputArray = hReadService.process(configuration, $.request, $.response, outputArray) || {};

const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const oHQ = hQuery.hQuery(oConn);
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

if (outputArray.RANKED_TAG !== null) {
	var operationArray = outputArray.RANKED_TAG;
	//start find root tag group
	var aRootTagGroup = startFind(operationArray);
	outputArray.TAG_GROUP = [];
	aRootTagGroup = uniqTagGroup(aRootTagGroup);
	combineTagGroupObj(aRootTagGroup, outputArray.TAG_GROUP);
}

$.response.contentType = "application/json";
$.response.setBody(JSON.stringify(outputArray));
$.response.status = $.net.http.OK;

function startFind(operationArray) {
	var aFinalRootGroup = [];
	var aTemp = [];
	if (operationArray && operationArray.length > 0) {
		_.each(operationArray, function(object, index) {
			if (object.GROUP_ID !== null) {
				aTemp = findRootTagGroup(object.GROUP_ID, aTemp);
				aFinalRootGroup = aFinalRootGroup.concat(aTemp);
			}
			aTemp = [];
		});
	}
	return aFinalRootGroup;
}

function findRootTagGroup(sTagGroupId, aFinalRootGroup) {
	var aRootTagResult = oHQ.statement(
		'select * from"sap.ino.db.tag::v_assignment_tag_and_group" where tag_id = ? and object_type_code = \'TAG_GROUP\''
	).execute(sTagGroupId);
	if (aRootTagResult.length === 0) {
		aFinalRootGroup.push(sTagGroupId);
		return aFinalRootGroup;
	} else if (aRootTagResult.length > 1) {
		for (var i = 0; i < aRootTagResult.length; i++) {
			aFinalRootGroup = findRootTagGroup(aRootTagResult[i].TAG_GROUP_ID, aFinalRootGroup);
		}
	} else {
		aFinalRootGroup = findRootTagGroup(aRootTagResult[0].TAG_GROUP_ID, aFinalRootGroup);
	}
	return aFinalRootGroup;
}

function uniqTagGroup(array) {
	var temp = [];
	for (var i = 0; i < array.length; i++) {
		if (temp.indexOf(array[i]) === -1) {
			temp.push(array[i]);
		}
	}
	return temp;

}

function combineTagGroupObj(aTagGroupId, aTagGroup) {
	for (var i = 0; i < aTagGroupId.length; i++) {
		var oTagGroupResult = oHQ.statement(
			'select * from"sap.ino.db.tag::t_group_tag" where id = ? '
		).execute(aTagGroupId[i]);

		var oTagGroup = {
			GROUP_ID: oTagGroupResult[0].ID,
			GROUP_NAME: oTagGroupResult[0].NAME,
			GROUP_DESCRIPTION: oTagGroupResult[0].DESCRIPTION
		};
		aTagGroup.push(oTagGroup);
	}
}