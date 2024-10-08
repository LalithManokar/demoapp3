var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.core", "authorization");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
const getHQ = dbConnection.getHQ;
var oHQ = getHQ();
var oConn = oHQ.getConnection();

assignment($.request);

function assignment(oRequest) {
	var GroupAssignment = AOF.getApplicationObject("sap.ino.xs.object.iam.GroupAssignment");
	var body =JSON.parse(oRequest.body.asString());
	var oPlayLoad = {

		ID: parseInt(body.ID),
		MemberOf: [{
			ID: -2,
			GROUP_ID: parseInt(body.MemberOf)
         }]

	};

	var oject;
	var group = oPlayLoad.MemberOf;
	var sId = oPlayLoad.MemberOf[0].GROUP_ID;
	const group_ID = oHQ.statement(
		'select group_id from "sap.ino.db.iam::t_identity_group_member" where MEMBER_ID = ?'
	).execute(oPlayLoad.ID);
	for (var i = 0; i < group_ID.length; i++) {
		if (group_ID[i].GROUP_ID !== sId) {
			oject = {
				ID: -2,
				GROUP_ID: group_ID[i].GROUP_ID
			};
			group.unshift(oject);
		} else {
			delete group[i];
		}
	}
	oPlayLoad.MemberOf = group;
	var oResponse = GroupAssignment.update(oPlayLoad);
	oConn.commit();

}