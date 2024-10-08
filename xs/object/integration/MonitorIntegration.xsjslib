const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var IAMMessage = $.import("sap.ino.xs.object.iam", "message");

this.definition = {
	Root: {
		table: "sap.ino.db.integration::t_monitor_integration",
		sequence: "sap.ino.db.integration::s_monitor_integration",
		determinations: {

		},
		attributes: {
			ID: {
				required: true
			},
			STATUS: {
				required: true
			},
			PATH: {
				required: false
			},
			RESPONSE_MESSAGE: {
				required: false
			},
			OBJECT_ID: {
				required: false
			},
			DIRECTION_PATH: {
				required: true
			},
			INTERFACE_NAME: {
				required: true
			},
			OPERATOR_BY_ID: {
				required: true
			},
			OPERATOR_AT: {
				required: true
			},
			OBJECT_PAYLOAD_JSON: {
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

//END