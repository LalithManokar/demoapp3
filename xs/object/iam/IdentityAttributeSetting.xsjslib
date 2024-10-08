this.definition = {
	actions: {
		create: {
			authorizationCheck: false
		},
		update: {
			authorizationCheck: false
		},
		read: {
			authorizationCheck: false
		}
	},
	Root: {
		table: "sap.ino.db.iam::t_identity_attribute_setting",
		sequence: "sap.ino.db.iam::s_identity_attribute_setting",
		customProperties: {
			codeTextBundle: "sap.ino.config::t_identity_attribute"
		},
		attributes: {
			CODE: {
				required: true
			},
			IS_PUBLIC: {
				required: true
			}
		}
	}
};