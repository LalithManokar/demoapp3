//provide some functions to send_identity_email.xsjs service
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var Auth = $.import("sap.ino.xs.aof.core", "authorization");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

function sendEmail(oSession, oParameter) {
	var vResult = {};
	var oResponse = {
		status: $.net.http.OK,
		body: vResult
	};

	function missToIdentity() {
		oResponse.status = $.net.http.INTERNAL_SERVER_ERROR;
		oResponse.body = "The parameter should contain TO_IDENTITY";
		return oResponse;
	}

	function missSubject() {
		oResponse.status = $.net.http.INTERNAL_SERVER_ERROR;
		oResponse.body = "The parameter should contain SUBJECT";
		return oResponse;
	}

	if (!oParameter.TO_IDENTITY) {
		missToIdentity();
		return oResponse;
	}

	if (!oParameter.SUBJECT) {
		missSubject();
		return oResponse;
	}

	var oConn = AOF.getTransaction();
	var IdentityMail = AOF.getApplicationObject("sap.ino.xs.object.iam.IdentityMail");

	if (oParameter.TO_IDENTITY instanceof Array) {
		_.each(oParameter.TO_IDENTITY, function(iIdentityID) {
			IdentityMail.create({
				ID: -1,
				SUBJECT: oParameter.SUBJECT,
				CONTENT: oParameter.CONTENT,
				TO_IDENTITY: iIdentityID
			});
		});
	} else if (!isNaN(oParameter.TO_IDENTITY)) {
		var oAOFResponse = IdentityMail.create({
			ID: -1,
			SUBJECT: oParameter.SUBJECT,
			CONTENT: oParameter.CONTENT,
			TO_IDENTITY: oParameter.TO_IDENTITY
		});
	}

	oConn.commit();

	return oResponse;
}