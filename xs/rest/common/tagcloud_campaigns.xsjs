/*
   Example calls:
   select default number of tags
   http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/tagcloud_campaigns.xsjs

   selection restricted to all campaigns with TAG 2 AND 5
   http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/tagcloud_campaigns.xsjs?TAG=2&TAG=5

   debug
   http://ld8580.wdf.sap.corp:8000/sap/ino/xs/rest/tagcloud_campaigns.xsjs/trace
*/

const hReadService = $.import("sap.ino.xs.xslib", "hReadService");

var configuration = {};

configuration[$.net.http.GET] = {
	procedureName: "sap.ino.db.campaign.ext::p_ext_campaign_tag_cloud_by_group",
	inputParameterMap: {
		SEARCHTERM: {
			scalarName: "IV_SEARCHTERM",
			defaultValue: ""
		},
		FILTERNAME: {
			scalarName: "IV_FILTERNAME",
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
		RESP_VALUE_CODE: {
			scalarName: "IV_RESP_VALUE_CODE"
		},
		HAS_BLOG: {
			scalarName: "IV_HAS_BLOG"
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

var outputArray = {};
outputArray = hReadService.process(configuration, $.request, $.response, outputArray);

const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const oHQ = hQuery.hQuery(oConn);
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var operationArray = outputArray.RANKED_TAG;
//start find root tag group
var aRootTagGroup = startFind(operationArray);
outputArray.TAG_GROUP = [];
aRootTagGroup = uniqTagGroup(aRootTagGroup);
combineTagGroupObj(aRootTagGroup, outputArray.TAG_GROUP);

$.response.contentType = "application/json";
$.response.setBody(JSON.stringify(outputArray));
$.response.status = $.net.http.OK;

function startFind(operationArray) {
	var aFinalRootGroup = [];
	var aTemp = [];
	if (operationArray.length > 0) {
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