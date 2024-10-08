const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
var Message = $.import("sap.ino.xs.aof.lib", "message");


this.definition = {
	Root: {
		table: "sap.ino.db.newnotification::t_notification_system_setting_local",
		sequence: "sap.ino.db.newnotification::s_notification_system_setting_local",		
		determinations: {
			onModify: [determine.systemAdminData]
		},
		attributes: {
			CHANGED_AT: {
				readOnly: true,
				concurrencyControl: true
			},
			CHANGED_BY_ID: {
				readOnly: true
			},
			ACTION_CODE: {
				required: true
			}
// 			,
// 			EMAIL_TEMPLATE_CODE:{
// 			   required: true  
// 			 }, 
//             TEXT_MODULE_CODE:{
//               required: true
//             } 
		},
		nodes:{
		    Receivers:{
		     table: "sap.ino.db.newnotification::t_notification_system_setting_receiver_local",
		     sequence: "sap.ino.db.newnotification::s_notification_system_setting_receiver_local",			     
		     parentKey:"ACTION_ID"
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