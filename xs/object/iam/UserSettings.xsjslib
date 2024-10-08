var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var IdentityMessage = $.import("sap.ino.xs.object.iam", "message");
var AttachmentAssignment = $.import("sap.ino.xs.object.attachment", "Assignment");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var IAMMessage = $.import("sap.ino.xs.object.iam", "message");

this.definition = {
	actions: {
		update: {
			authorizationCheck: function(vKey, oRequest, fnMessage, oContext) {
				if (vKey != oContext.getUser().ID) {
					fnMessage(AOF.MessageSeverity.Fatal, IdentityMessage.AUTH_MISSING_USER_SETTINGS_UPDATE, vKey, AOF.Node.Root, null);
					return false;
				}
				return true;
			},
			historyEvent: "USER_SETTINGS_UPDATED"
		},
		read: {
			authorizationCheck: function(vKey, oRequest, fnMessage, oContext) {
				if (vKey != oContext.getUser().ID) {
					fnMessage(AOF.MessageSeverity.Fatal, IdentityMessage.AUTH_MISSING_USER_SETTINGS_READ, vKey, AOF.Node.Root, null);
					return false;
				}
				return true;
			}
		},
		updateUserLocale: {
			authorizationCheck: function(vKey, oRequest, fnMessage, oContext) {
				if (vKey != oContext.getUser().ID) {
					fnMessage(AOF.MessageSeverity.Fatal, IdentityMessage.AUTH_MISSING_USER_SETTINGS_UPDATE, vKey, AOF.Node.Root, null);
					return false;
				}
				return true;
			},
			execute: function(vKey, oParameters, oUserSettings, addMessage, getNextHandle, oContext) {
				var oHQ = oContext.getHQ();
				var sValidateStatement = "SELECT locale from \"sap.ino.db.basis::f_check_locale\"(?)";
				var aResult = oHQ.statement(sValidateStatement).execute(oParameters.LOCALE);

				var sLocale = aResult[0].LOCALE;
				var sUpdateStatement = "UPSERT \"sap.ino.db.basis::t_user_parameter\" VALUES (?, 'locale', 'locale', ?) WITH PRIMARY KEY";
				oHQ.statement(sUpdateStatement).execute(oContext.getUser().ID, sLocale);

				return sLocale;
			}
		},
		updateUserTheme: {
			authorizationCheck: function(vKey, oRequest, fnMessage, oContext) {
				if (vKey != oContext.getUser().ID) {
					fnMessage(AOF.MessageSeverity.Fatal, IdentityMessage.AUTH_MISSING_USER_SETTINGS_UPDATE, vKey, AOF.Node.Root, null);
					return false;
				}
				return true;
			},
			execute: function(vKey, oParameters, oUserSettings, addMessage, getNextHandle, oContext) {
				var oHQ = oContext.getHQ();
				var sUpdateStatement = "UPSERT \"sap.ino.db.basis::t_user_parameter\" VALUES (?, 'ui', 'theme', ?) WITH PRIMARY KEY";
				oHQ.statement(sUpdateStatement).execute(oContext.getUser().ID, oParameters.VALUE);
			}
		},
		updateUserSettings: {
			authorizationCheck: function(vKey, oRequest, fnMessage, oContext) {
				if (vKey != oContext.getUser().ID) {
					fnMessage(AOF.MessageSeverity.Fatal, IdentityMessage.AUTH_MISSING_USER_SETTINGS_UPDATE, vKey, AOF.Node.Root, null);
					return false;
				}
				return true;
			},
			execute: function(vKey, aParameters, oUserSettings, addMessage, getNextHandle, oContext) {
				var oHQ = oContext.getHQ();
				var sUpdateStatement = "UPSERT \"sap.ino.db.basis::t_user_parameter\" VALUES (?, ?, ?, ?) WITH PRIMARY KEY";

				for (var oObject in aParameters) {
					var oParameter = aParameters[oObject];
					if (oParameter.SECTION === "system" && oParameter.KEY === "consent_terms_condition" && oParameter.VALUE === 0) {
						var SystemSettings = $.import("sap.ino.xs.xslib", "systemSettings");
						var sTermCode = SystemSettings.getValue("sap.ino.config.TERMS_AND_CONDITIONS_TEXT", oHQ) || undefined;
						var sSelectTerm, aTermModule, sTermChangedAt, sTermId;
						var sInsertStatement =
							'INSERT INTO "SAP_INO"."sap.ino.db.iam::t_term_accept_history"(ID, TERM_CODE, TERM_ID, TERM_CHANGED_AT, USER_ID, TERM_ACCEPTED_AT, TERM_ACTION_CODE) ' +
							' SELECT "sap.ino.db.iam::s_term_accept_history".nextval, ?, ?, ?, ?, ?, ?  FROM dummy;';
						if (sTermCode) {
							sSelectTerm = 'select * from "sap.ino.db.basis::t_text_module_stage" where code = ?';
							aTermModule = oHQ.statement(sSelectTerm).execute(sTermCode);
							sTermChangedAt = aTermModule.length > 0 ? aTermModule[0].CHANGED_AT : undefined;
							sTermId = aTermModule.length > 0 ? aTermModule[0].ID : undefined;
						}
						var sSelStatement = 'SELECT 1 FROM "SAP_INO"."sap.ino.db.iam::v_term_accept_history_latest" '
						    +' WHERE TERM_CODE = ? AND TERM_ID = ? AND TERM_CHANGED_AT = ? AND  USER_ID = ? AND TERM_ACTION_CODE = 1';
						var aExists = oHQ
							.statement(sSelStatement)
							.execute(sTermCode, sTermId, sTermChangedAt, oContext.getUser().ID);
						if(aExists && aExists.length >= 1){
						    return;
						}
						oHQ
							.statement(sInsertStatement)
							.execute(sTermCode, sTermId, sTermChangedAt, oContext.getUser().ID, oContext.getRequestTimestamp(), 1);
					} else {
						if (oParameter.SECTION === "locale") {
							var sValidateStatement = "SELECT locale from \"sap.ino.db.basis::f_check_locale\"(?)";
							var aResult = oHQ.statement(sValidateStatement).execute(oParameter.VALUE);

							if (oParameter.VALUE !== aResult[0].LOCALE) {
								addMessage(Message.MessageSeverity.Error, IAMMessage.LOCALE_INVALID, vKey, AOF.NODE.ROOT, "LOCALE", oParameter.VALUE);
								return;
							}
						}

						oHQ.statement(sUpdateStatement).execute(oContext.getUser().ID, oParameter.SECTION, oParameter.KEY, oParameter.VALUE);
					}
				}
			}
		}
	},
	Root: {
		table: "sap.ino.db.iam::t_identity",
		readOnly: true,
		nodes: {
			Attachments: AttachmentAssignment.node(AttachmentAssignment.ObjectType.Identity)
		}
	}
};