var check = $.import("sap.ino.xs.aof.lib", "check");
var Message = $.import("sap.ino.xs.aof.lib", "message");
var AOF = $.import("sap.ino.xs.aof.core", "framework");

this.definition = {
    actions : {
        create : {
            authorizationCheck : false,
            historyEvent: "STATUS_AUTHORIZATION_CREATED"
        },
        update : {
            authorizationCheck : false,
            historyEvent: "STATUS_AUTHORIZATION_UPDATED"
        },
        read : {
            authorizationCheck : false
        },
        del : {
            authorizationCheck : false,
            historyEvent: "STATUS_AUTHORIZATION_DELETED"
        }
    },
    Root : {
        table : "sap.ino.db.status::t_status_authorization_stage",
        sequence : "sap.ino.db.status::s_status_authorization_stage",
        consistencyChecks : [check.duplicateCheck("SETTING_CODE", Message.DUPLICATE_IDENTITY)],
        nodes: {
          AuthorizationForStatus : {
                table : "sap.ino.db.status::t_status_authorization",
                sequence : "sap.ino.db.status::s_status_authorization",
            	historyTable: "sap.ino.db.status::t_status_authorization_h",
                parentKey : "ID_OF_STATUS_AUTHORIZATION_STAGE",
                readOnly : false,
                attributes: {
					ID :{
					    isPrimaryKey: true
					},
					ROLE_CODE: {
						required: true
					},
					ACTION_CODE : {
					    required: true
					},
					CAN_DO_ACTION:{
					    required:true
					}
				}
            }
        },
        attributes : {
                    ID : {
                        isPrimaryKey:true
                    },
					VALUE :{
					    required:true
					},
					SETTING_CODE: {
						required: true
					},
					ID_OF_STATUS_STAGE:{
					   	required: true
					}
        }
    }
};

