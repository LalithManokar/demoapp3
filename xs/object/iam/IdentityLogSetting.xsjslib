var iamMsg = $.import("sap.ino.xs.object.iam", "message");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");

function authorizationCheck() {
	return auth.privilegeCheck("sap.ino.xs.rest.admin.application::execute", iamMsg.MSG_GENERIC_AUTH_ERROR);
}

this.definition = {
	actions: {
	    create:{
	        authorizationCheck: authorizationCheck()
	    },
		update: {
			authorizationCheck: authorizationCheck()
		},
		read: {
			authorizationCheck: authorizationCheck()
		}
	},
	Root: {
		table: "sap.ino.db.iam::t_identity_log_setting",
		sequence: "sap.ino.db.iam::s_identity_log_setting",
		customProperties: {
			codeTextBundle: "sap.ino.config::t_identity_attribute"
		},
		attributes: {
			CODE: {
				required: true
			}
		}
	}
};