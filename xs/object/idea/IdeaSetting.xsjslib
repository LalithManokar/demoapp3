const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var IAMMessage = $.import("sap.ino.xs.object.iam", "message");

var Anonymous = this.Anonymous = {
	NONE: "NONE",
	PARTLY: "PARTLY",
	ALL: "ALL"
};

this.definition = {
	Root: {
		table: "sap.ino.db.idea::t_ideas_setting",
		sequence: "sap.ino.db.idea::s_ideas_setting",
		determinations: {},
		attributes: {
			ANONYMOUS_FOR: {
				required: true
			},
			IDEA_ID: {
				required: true
			}
		}
	},
	actions: {
		read: {
			authorizationCheck: false
		},
		create: {
			authorizationCheck: false
		},
		update: {
			authorizationCheck: false
		},
		del: {
			authorizationCheck: false
		}
	}
};

