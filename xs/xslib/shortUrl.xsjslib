const ohQuery = $.import("sap.ino.xs.xslib", "hQuery");
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var oHQ = ohQuery.hQuery(oConn).setSchema("SAP_INO");
var systemSettings = $.import("sap.ino.xs.xslib", "systemSettings");

function findRootGroup(nId, tagAssignments, oGroup) {
	tagAssignments.forEach(function(oAssignment) {
		if (oAssignment.TAG_ID === nId && oAssignment.SEQUENCE_NO === 1) {
			oGroup.ID = oAssignment.TAG_GROUP_ID;
		}
		if (oAssignment.TAG_ID === nId && oAssignment.SEQUENCE_NO > 1) {
			findRootGroup(oAssignment.TAG_GROUP_ID, tagAssignments, oGroup);
		}
	});
}

function findGroup(nId, tagAssignments) {
	var groupId;
	tagAssignments.forEach(function(oAssignment) {
		if (oAssignment.TAG_ID === nId) {
			groupId = oAssignment.TAG_GROUP_ID;
		}
	});
	return groupId;
}

function forwardUrl() {
	var param = $.request.queryPath;
	var sOriginUrl = systemSettings.getIniValue('host', oHQ);
	var host = sOriginUrl + '/sap/ino/';
	if (param) {
		var bCampaign = true;
		param = param.replace("index.xsjs/", "");
		if (param.indexOf("all/") > -1) {
			host += "#/campaigns-all/?sort=tolower(NAME) ASC";
			bCampaign = false;
		}
		if (param.indexOf("active/") > -1) {
			host += "#/campaigns-active/?sort=tolower(NAME) ASC";
			bCampaign = false;
		}
		if (param.indexOf("open/") > -1) {
			host += "#/campaigns-open/?sort=tolower(NAME) ASC";
			bCampaign = false;
		}
		if (!bCampaign) {
			var iLastSlash = param.indexOf("/");
			if (iLastSlash > -1) {
				param = param.substring(iLastSlash + 1);
				if (param && /^([a-zA-Z]|\d|-|_){1,30}$/.test(param)) {
					var tagAssignments = oHQ.statement('SELECT * FROM "sap.ino.db.tag::t_assignment_tag" WHERE 1 = 1 ORDER BY TAG_ID DESC').execute();
					var tagList = oHQ.statement('SELECT tag.ID, tag.NAME FROM "sap.ino.db.tag::t_tag" AS tag WHERE upper(tag.VANITY_CODE) = ?').execute(
						param.toUpperCase());
					if (tagList && tagList.length > 0) {
						tagList.forEach(function(oTag) {
							oTag.NAME = encodeURIComponent(oTag.NAME);
							var oCurrentGroup = {
								ID: "other"
							};
							findRootGroup(oTag.ID, tagAssignments, oCurrentGroup);
							oTag.ROOTGROUPID = oCurrentGroup.ID;
							var parentGroup = findGroup(oTag.ID, tagAssignments);
							if (parentGroup) {
								oTag.GROUP_ID = parentGroup;
							}
						});
						host += '&tags=' + encodeURIComponent(encodeURIComponent(JSON.stringify(tagList)));
					}
				}
			}
		} else if (/^([a-zA-Z]|\d|-|_){1,30}$/.test(param)) {
			var campaign = oHQ.statement('SELECT ID FROM "sap.ino.db.campaign::t_campaign" WHERE upper(VANITY_CODE) = ?').execute(param.toUpperCase());
			if (campaign && campaign.length > 0) {
				host += '#/campaign/' + campaign[0].ID;
			}
		}
	}
	$.response.status = 301;
	$.response.headers.set('Location', host);
}