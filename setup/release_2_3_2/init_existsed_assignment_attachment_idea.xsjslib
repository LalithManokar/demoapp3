// init_existsed_assignment_attachment_idea
const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
const HQ = $.import("sap.ino.xs.xslib", "hQuery");
const trace = $.import("sap.ino.xs.xslib", "trace");
const whoAmI = 'sap.ino.setup.release_2_3_2.init_existsed_assignment_attachment_idea.xsjslib';

function error(line) {
	trace.error(whoAmI, line);
}

function info(line) {
	trace.info(whoAmI, line);
}

function check(oConnection) {
	return true;
}

function run(oConnection) {
	const oHQ = HQ.hQuery(oConnection);
	var sSelect =
		`SELECT idea.ID, 
	idea.DESCRIPTION
FROM "sap.ino.db.idea::t_idea" AS idea
	LEFT OUTER JOIN "sap.ino.db.attachment::t_attachment_assignment" AS att
	ON idea.ID = att.OWNER_ID
		AND OWNER_TYPE_CODE = 'IDEACONTENT'
		AND ROLE_TYPE_CODE = 'IDEA_CONTENT_IMG' 
		AND FILTER_TYPE_CODE = 'FRONTOFFICE'
WHERE att.ID IS NULL AND idea.description LIKE '%attachment_download.xsjs%';
	`;
	var aResult = oHQ.statement(sSelect).execute();
	if (!aResult || aResult.length <= 0) {
		return true;
	};
	var reg = new RegExp("attachment_download\.xsjs/(\\d+)\"", "g"),
		oAssignments = {
			IT_ASSIGNMENT_IDS: []
		},
		oRegResult = {};
	_.each(aResult, function(oItem) {
		do {
			oRegResult = reg.exec(oItem.DESCRIPTION);
			if (oRegResult && oRegResult.length === 2) {
				oAssignments.IT_ASSIGNMENT_IDS.push({
					OWNER_ID: oItem.ID,
					ATTACHMENT_ID: parseInt(oRegResult[1]),
					OWNER_TYPE_CODE: "IDEACONTENT",
					ROLE_TYPE_CODE: "IDEA_CONTENT_IMG",
					FILTER_TYPE_CODE: "FRONTOFFICE"
				});
			}
		}
		while (oRegResult !== null);
	});

	oHQ
		.procedure("SAP_INO", "sap.ino.db.attachment::p_init_exists_object_assignment")
		.execute(oAssignments)
	oHQ.getConnection().commit();
	return true;
}

function clean(oConnection) {
	return true;
}