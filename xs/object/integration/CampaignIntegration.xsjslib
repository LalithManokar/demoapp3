const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
const getHQ = dbConnection.getHQ;
var oLHQ = getHQ();
var Message = $.import("sap.ino.xs.aof.lib", "message");
var IAMMessage = $.import("sap.ino.xs.object.iam", "message");
//const Destination  = $.import("sap.ino.xs.rest.commonIntegration", "destinations");


this.definition = {
	Root: {
		table: "sap.ino.db.integration::t_campaign_integration",
		sequence: "sap.ino.db.integration::s_campaign_integration",
		determinations: {
		    onModify: [determine.systemAdminData]
		},
		attributes: {
		   CREATED_AT: {
				readOnly: true
			},
			CREATED_BY_ID: {
				readOnly: true
			},
			CHANGED_AT: {
				readOnly: true,
				concurrencyControl: true
			},
			CHANGED_BY_ID: {
				readOnly: true
			},
			APINAME:{
			    required:true
			},
			TECHNICAL_NAME:{
			    required:true
			},
			SYSTEM_NAME:{
			    required:true
			},
			SYSTEM_PACKAGE_NAME:{
			    required:true
			},
			CREATE_METHOD:{
			    required:true
			},
			CREATE_PATH:{
			    required:true
			},
			FETCH_METHOD:{
			    required:false
			},
			FETCH_PATH:{
			    required:false
			},
			CREATE_REQ_JSON:{
			    required:true
			},
			CREATE_RES_JSON:{
			    required:false
			},
			FETCH_REQ_JSON:{
			    required:false
			},
			FETCH_RES_JSON:{
			    required:false
			},
			STATUS:{
			    required:true
			},
			CAMPAIGN_ID:{
			    required:true
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