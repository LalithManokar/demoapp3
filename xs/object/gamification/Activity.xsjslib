var determine = $.import("sap.ino.xs.aof.lib", "determination");
this.definition = {
	Root: {
		table: "sap.ino.db.gamification::t_activity_log",
		sequence: "sap.ino.db.gamification::s_activity_log",
		determinations: {
			onModify: [determine.systemAdminData]
		},
		attributes: {
		    DIMENSION_ID:{
		        required: true
		    },
		    ACTOR_ID:{
		        required: true
		    },
		    OBJECT_ID:{
		        required: true
		    },
		    OBJECT_TYPE_CODE:{
		        required: true
		    },
			CODE: {
				required: true
			},
			PHASE_CODE: {
				required: false
			},
			WITHIN_TIME: {
				required: false
			},
			TIME_UNIT: {
				required: false
			},
			VALUE: {
				required: true
			}
		},
		nodes: {
			UserAffected: {
				table: "sap.ino.db.gamification::t_identity_log_for_activity",
				sequence: "sap.ino.db.gamification::s_identity_log_for_activity",
				parentKey: "ACTIVITY_ID",
				attributes: {
                        IDENTITY_ID:{
                            required: true
                        }
				}
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