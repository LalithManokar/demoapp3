const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var IAMMessage = $.import("sap.ino.xs.object.iam", "message");


this.definition = {
	Root: {
		table: "sap.ino.db.integration::t_api_layout_copy",
		sequence: "sap.ino.db.integration::s_api_layout_copy",
		determinations: {
		   
		},
		attributes: {
		                	MAPPING_FIELD_CODE: {
								required: true
							},
							DISPLAY_NAME: {
								required: true
							},
							DISPLAY_SEQUENCE: {
								required: false
							},
							API_ID: {
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