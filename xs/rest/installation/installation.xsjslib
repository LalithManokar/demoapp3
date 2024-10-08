(function(exports) {
	"use strict";
	$.import("sap.ino.xs.xslib", "hQuery");
	var driver = $.import("sap.ino.setup.xslib", "driver");
	var jobSchedulerStatus = $.import("sap.hana.xs.admin.jobs.server.common", "jobSchedulerStatus");
	var lib = $.import("sap.hana.xs.admin.server.common", "lib");
	var pkg = $.import("sap.hana.xs.admin.server.common", "pkg");
	var remote = $.import("sap.hana.ide.common.plugin.securitysystem.server", "remote");
	var sqlcc = $.import("sap.hana.xs.admin.server.sqlcc", "sqlcc");
	var oMsg = $.import("sap.ino.xs.rest.installation", "message");
	var trace = $.import("sap.ino.xs.xslib", "trace");
	var common = $.import("sap.ino.xs.rest.installation", "common");
	var oConn = $.hdb.getConnection({
		"sqlcc": "sap.ino.xs.rest.installation::installation_dbuser"
	});
	var oHQ = $.sap.ino.xs.xslib.hQuery.hQuery(oConn);
	var TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
	var logger = $.import("sap.ino.xs.rest.installation", "log");

	function responseError(sMsg) {
		return {
			success: false,
			msg: sMsg || "no message text"
		};
	}

	function preCheck() {
		var prevVersion = common.readBaseRelease();
		var du_version = common.getDuVersion();
		// 		logger.log({
		// 			actionCode: "PRE_CHECK",
		// 			status: 1,
		// 			msg: "DONE"
		// 		});
		var bUpgrade = false;
		if(prevVersion && prevVersion.version && prevVersion.version > 0){
		    bUpgrade = true;
		}
		return {
			success: true,
			upgrade: bUpgrade,
			prevVersion: prevVersion,
			du_version: du_version
		};
	}

	function saveSetting(reqBody) {
		if (!reqBody.INNO_MANAGER_ACCOUNT) {
			return responseError(oMsg.PARAM_MISSING_INNO_MANAGER_ACCOUNT);
		}
		if (!reqBody.INNO_MANAGER_FIRST_NAME) {
			return responseError(oMsg.PARAM_MISSING_INNO_MANAGER_FIRST_NAME);
		}
		if (!reqBody.INNO_MANAGER_LAST_NAME) {
			return responseError(oMsg.PARAM_MISSING_INNO_MANAGER_LAST_NAME);
		}
		if (!reqBody.INNO_MANAGER_PASSWORD) {
			return responseError(oMsg.PARAM_MISSING_INNO_MANAGER_PASSWORD);
		}
		if (!reqBody.INNO_MANAGER_REPASSWORD) {
			return responseError(oMsg.PARAM_MISSING_INNO_MANAGER_REPASSWORD);
		}
		if (reqBody.INNO_MANAGER_PASSWORD !== reqBody.INNO_MANAGER_REPASSWORD) {
			return responseError(oMsg.PARAM_INNO_MANAGER_PASSWORD_INCONSISTENT);
		}
		if (!reqBody.INNO_MANAGER_EMAIL) {
			return responseError(oMsg.PARAM_MISSING_INNO_MANAGER_EMAIL);
		}
		if (reqBody.INNO_MANAGER_EMAIL && !/^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim.test(reqBody.INNO_MANAGER_EMAIL)) {
			return responseError(oMsg.PARAM_INVALID_INNO_MANAGER_EMAIL);
		}
		if (!reqBody.TECH_USER_ACCOUNT) {
			return responseError(oMsg.PARAM_MISSING_TECH_USER_ACCOUNT);
		}
		if (!reqBody.TECH_USER_PASSWORD) {
			return responseError(oMsg.PARAM_MISSING_TECH_USER_PASSWORD);
		}
		if (!reqBody.TECH_USER_REPASSWORD) {
			return responseError(oMsg.PARAM_MISSING_TECH_USER_REPASSWORD);
		}
		if (reqBody.TECH_USER_PASSWORD !== reqBody.TECH_USER_REPASSWORD) {
			return responseError(oMsg.PARAM_TECH_USER_PASSWORD_INCONSISTENT);
		}
		if (!reqBody.PACKAGE_NAME) {
			return responseError(oMsg.PARAM_MISSING_PACKAGE_NAME);
		}
		var sSQL = "UPSERT \"SAP_INO\".\"sap.ino.db.installation::t_installation_setting\" VALUES(1,?,CURRENT_UTCTIMESTAMP)";
		oHQ.statement(sSQL).execute(JSON.stringify(reqBody));
		oConn.commit();
		logger.log({
			actionCode: "SAVE_SETTING",
			status: 1,
			msg: "DONE"
		});
		return {
			success: true
		};
	}

	function getSettingInfo() {
		var sSQL = 'SELECT VALUE FROM "SAP_INO"."sap.ino.db.installation::t_installation_setting" WHERE ID = 1';
		var aResult = oHQ.statement(sSQL).execute();

		if (aResult && aResult.length === 1 && aResult[0].VALUE) {
			return {
				success: true,
				data: JSON.parse(aResult[0].VALUE)
			};
		}
		return {
			success: false
		};
	}

	function createUsers() {
		var sSQL = 'SELECT VALUE FROM "SAP_INO"."sap.ino.db.installation::t_installation_setting" WHERE ID = 1';
		var aResult = oHQ.statement(sSQL).execute();
		if (aResult && aResult.length === 1 && aResult[0].VALUE) {
			try {
				var oInfo = JSON.parse(aResult[0].VALUE);
				aResult = oHQ.statement('select USER_NAME from  sys.users where user_name = upper(?)').execute(oInfo.INNO_MANAGER_ACCOUNT);
				if (!aResult || aResult.length === 0) {
					oHQ.statement('CREATE USER ' + oInfo.INNO_MANAGER_ACCOUNT + ' PASSWORD "' + oInfo.INNO_MANAGER_PASSWORD + '";').execute();
				}

				aResult = oHQ.statement('select USER_NAME from  sys.users where user_name = upper(?)').execute(oInfo.TECH_USER_ACCOUNT);
				if (!aResult || aResult.length === 0) {
					oHQ.statement('CREATE USER ' + oInfo.TECH_USER_ACCOUNT + ' PASSWORD "' + oInfo.TECH_USER_PASSWORD + '";').execute();
					oHQ.statement('ALTER USER ' + oInfo.TECH_USER_ACCOUNT + ' DISABLE PASSWORD LIFETIME;').execute();
				}

				oHQ.procedure("SAP_INO", "sap.ino.db.installation::p_create_user_and_assign_role").execute(oInfo.INNO_MANAGER_ACCOUNT,
					oInfo.INNO_MANAGER_FIRST_NAME, oInfo.INNO_MANAGER_LAST_NAME, oInfo.INNO_MANAGER_EMAIL,
					oInfo.TECH_USER_ACCOUNT);

				oHQ.statement('GRANT REPO.EDIT_NATIVE_OBJECTS ON "' + oInfo.PACKAGE_NAME + '" TO  ' + oInfo.INNO_MANAGER_ACCOUNT + ';').execute();
				oHQ.statement('GRANT REPO.ACTIVATE_NATIVE_OBJECTS ON "' + oInfo.PACKAGE_NAME + '" TO  ' + oInfo.INNO_MANAGER_ACCOUNT + ';').execute();
				oHQ.statement('GRANT REPO.MAINTAIN_NATIVE_PACKAGES ON "' + oInfo.PACKAGE_NAME + '" TO  ' + oInfo.INNO_MANAGER_ACCOUNT + ';').execute();
				oHQ.statement('GRANT REPO.EDIT_IMPORTED_OBJECTS ON "' + oInfo.PACKAGE_NAME + '" TO  ' + oInfo.INNO_MANAGER_ACCOUNT + ';').execute();
				oHQ.statement('GRANT REPO.ACTIVATE_IMPORTED_OBJECTS ON "' + oInfo.PACKAGE_NAME + '" TO  ' + oInfo.INNO_MANAGER_ACCOUNT + ';').execute();
				oHQ.statement('GRANT REPO.MAINTAIN_IMPORTED_PACKAGES ON "' + oInfo.PACKAGE_NAME + '" TO  ' + oInfo.INNO_MANAGER_ACCOUNT + ';').execute();
				oHQ.statement('GRANT  REPO.READ on "' + oInfo.PACKAGE_NAME + '.attachment" TO  ' + oInfo.TECH_USER_ACCOUNT + ';').execute();

				oHQ.statement('GRANT  REPO.EDIT_NATIVE_OBJECTS on "' + oInfo.PACKAGE_NAME + '.attachment" TO  ' + oInfo.TECH_USER_ACCOUNT + ';').execute();
				oHQ.statement('GRANT  REPO.ACTIVATE_NATIVE_OBJECTS on "' + oInfo.PACKAGE_NAME + '.attachment" TO  ' + oInfo.TECH_USER_ACCOUNT + ';').execute();
				oHQ.statement('GRANT  REPO.MAINTAIN_NATIVE_PACKAGES on "' + oInfo.PACKAGE_NAME + '.attachment" TO  ' + oInfo.TECH_USER_ACCOUNT + ';').execute();
				oHQ.statement('GRANT  REPO.EDIT_IMPORTED_OBJECTS on "' + oInfo.PACKAGE_NAME + '.attachment" TO  ' + oInfo.TECH_USER_ACCOUNT + ';').execute();
				oHQ.statement('GRANT  REPO.ACTIVATE_IMPORTED_OBJECTS on "' + oInfo.PACKAGE_NAME + '.attachment" TO  ' + oInfo.TECH_USER_ACCOUNT + ';').execute();
				oHQ.statement('GRANT  REPO.MAINTAIN_IMPORTED_PACKAGES on "' + oInfo.PACKAGE_NAME + '.attachment" TO  ' + oInfo.TECH_USER_ACCOUNT + ';').execute();
					
				oConn.commit();
				logger.log({
					actionCode: "CREATE_USER",
					status: 1,
					msg: "DONE"
				});
				return {
					success: true
				};
			} catch (ex) {
				logger.log({
					actionCode: "CREATE_USER",
					status: 2,
					msg: TraceWrapper.stringify_exception(ex)
				});
				return {
					success: false,
					msg: TraceWrapper.stringify_exception(ex)
				};
			}
		}
	}

	function setSqlcc() {
		var sSQL = 'SELECT VALUE FROM "SAP_INO"."sap.ino.db.installation::t_installation_setting" WHERE ID = 1';
		var aResult = oHQ.statement(sSQL).execute();
		if (aResult && aResult.length === 1 && aResult[0].VALUE) {
			try {
				var oInfo = JSON.parse(aResult[0].VALUE);
				var data = {
					"NAME": "sap.ino.xs.xslib::dbuser",
					"PACKAGE_ID": "sap.ino.xs.xslib",
					"OBJECT_NAME": "dbuser",
					"USERNAME": oInfo.TECH_USER_ACCOUNT.toLocaleUpperCase(),
					"DESCRIPTION": "INM SQL connection",
					"ASSIGNED_BY": oInfo.INNO_MANAGER_ACCOUNT.toLocaleUpperCase(),
					"ASSIGNED_AT": "",
					"STATUS": "ACTIVE",
					"AUTO_USER_ROLE": null,
					"AUTO_USER": null,
					"action": "editSQLCC"
				};
				sqlcc.editSQLCC(data);
				/*var packageName = "aInfo.PACKAGE_NAME" + ".attachment";
				var activeSession = $.repo.createActiveSession(pkg.getConnection());
				if (!$.repo.existsPackage(activeSession, "", packageName)) {
					var systemOverview = lib.getSystemOverview();
					var packageInfo = $.repo.newPackageInfo('', packageName,
						systemOverview['Instance ID'], '', '', '', '');
					var ret = $.repo.createPackage(activeSession, packageInfo, null);
					if (!ret) {
						throw "Could not create package " + packageName;
					}
				}
				remote.updatePrivilegesForUser({
					"userInfo": {
						"userName": oInfo.TECH_USER_ACCOUNT.toLocaleUpperCase(),
						"password": "",
						"samlInfo": [],
						"x509Info": [],
						"userParameters": {
							"alteredEntries": [],
							"RemovedEntries": []
						},
						"state": "edit"
					},
					"privilegesToRevoke": [],
					"privilegesToGrant": [{
						"grantor": oInfo.INNO_MANAGER_ACCOUNT.toLocaleUpperCase(),
						"objectName": packageName,
						"objectType": "REPO",
						"schemaName": packageName,
						"privilege": "REPO.READ",
						"isGrantable": "FALSE",
						"state": "new",
						"objectId": packageName + "-" + packageName + "-" + oInfo.INNO_MANAGER_ACCOUNT.toLocaleUpperCase() +
							"-REPO.READ"
						}, {
						"grantor": oInfo.INNO_MANAGER_ACCOUNT.toLocaleUpperCase(),
						"objectName": packageName,
						"objectType": "REPO",
						"schemaName": packageName,
						"privilege": "REPO.EDIT_NATIVE_OBJECTS",
						"isGrantable": "FALSE",
						"state": "new",
						"objectId": packageName + "-" + packageName + "-" + oInfo.INNO_MANAGER_ACCOUNT.toLocaleUpperCase() +
							"-REPO.EDIT_NATIVE_OBJECTS"
						}, {
						"grantor": oInfo.INNO_MANAGER_ACCOUNT.toLocaleUpperCase(),
						"objectName": packageName,
						"objectType": "REPO",
						"schemaName": packageName,
						"privilege": "REPO.ACTIVATE_NATIVE_OBJECTS",
						"isGrantable": "FALSE",
						"state": "new",
						"objectId": packageName + "-" + packageName + "-" + oInfo.INNO_MANAGER_ACCOUNT.toLocaleUpperCase() +
							"-REPO.ACTIVATE_NATIVE_OBJECTS"
						}, {
						"grantor": oInfo.INNO_MANAGER_ACCOUNT.toLocaleUpperCase(),
						"objectName": packageName,
						"objectType": "REPO",
						"schemaName": packageName,
						"privilege": "REPO.MAINTAIN_NATIVE_PACKAGES",
						"isGrantable": "FALSE",
						"state": "new",
						"objectId": packageName + "-" + packageName + "-" + oInfo.INNO_MANAGER_ACCOUNT.toLocaleUpperCase() +
							"-REPO.MAINTAIN_NATIVE_PACKAGES"
						}, {
						"grantor": oInfo.INNO_MANAGER_ACCOUNT.toLocaleUpperCase(),
						"objectName": packageName,
						"objectType": "REPO",
						"schemaName": packageName,
						"privilege": "REPO.EDIT_IMPORTED_OBJECTS",
						"isGrantable": "FALSE",
						"state": "new",
						"objectId": packageName + "-" + packageName + "-" + oInfo.INNO_MANAGER_ACCOUNT.toLocaleUpperCase() +
							"-REPO.EDIT_IMPORTED_OBJECTS"
						}, {
						"grantor": oInfo.INNO_MANAGER_ACCOUNT.toLocaleUpperCase(),
						"objectName": packageName,
						"objectType": "REPO",
						"schemaName": packageName,
						"privilege": "REPO.ACTIVATE_IMPORTED_OBJECTS",
						"isGrantable": "FALSE",
						"state": "new",
						"objectId": packageName + "-" + packageName + "-" + oInfo.INNO_MANAGER_ACCOUNT.toLocaleUpperCase() +
							"-REPO.ACTIVATE_IMPORTED_OBJECTS"
						}, {
						"grantor": oInfo.INNO_MANAGER_ACCOUNT.toLocaleUpperCase(),
						"objectName": packageName,
						"objectType": "REPO",
						"schemaName": packageName,
						"privilege": "REPO.MAINTAIN_IMPORTED_PACKAGES",
						"isGrantable": "FALSE",
						"state": "new",
						"objectId": packageName + "-" + packageName + "-" + oInfo.INNO_MANAGER_ACCOUNT.toLocaleUpperCase() +
							"-REPO.MAINTAIN_IMPORTED_PACKAGES"
						}]
				});*/
				logger.log({
					actionCode: "SET_SQLCC",
					status: 1,
					msg: "DONE"
				});
				return {
					success: true
				};
			} catch (ex) {
				logger.log({
					actionCode: "SET_SQLCC",
					status: 2,
					msg: TraceWrapper.stringify_exception(ex)
				});
				return {
					success: false,
					msg: TraceWrapper.stringify_exception(ex)
				};
			}
		}
	}

	function runNewConfig() {
		try {
			driver.run($.request, $.response);
			if ($.response.status === $.net.http.OK || trace.getTransientTrace().indexOf('A manual database restart is required') > -1) {
				logger.log({
					actionCode: "RUN_NEW_CONFIG",
					status: 1,
					msg: "DONE"
				});
				return {
					success: true
				};
			}
			logger.log({
				actionCode: "RUN_NEW_CONFIG",
				status: 2,
				msg: trace.getTransientTrace()
			});
			return {
				success: false,
				msg: trace.getTransientTrace()
			};
		} catch (ex) {
			logger.log({
				actionCode: "RUN_NEW_CONFIG",
				status: 2,
				msg: TraceWrapper.stringify_exception(ex)
			});
			return {
				success: false,
				msg: TraceWrapper.stringify_exception(ex)
			};
		}
	}

	function runConfig() {
		try {
			driver.run($.request, $.response);
			if ($.response.status === $.net.http.OK) {
				logger.log({
					actionCode: "RUN_CONFIG",
					status: 1,
					msg: "DONE"
				});
				return {
					success: true
				};
			}
			logger.log({
				actionCode: "RUN_CONFIG",
				status: 2,
				msg: trace.getTransientTrace()
			});
			return {
				success: false,
				msg: trace.getTransientTrace()
			};
		} catch (ex) {
			logger.log({
				actionCode: "RUN_CONFIG",
				status: 2,
				msg: TraceWrapper.stringify_exception(ex)
			});
			return {
				success: false,
				msg: TraceWrapper.stringify_exception(ex)
			};
		}
	}

	function checkRestartDB() {
		var aDatabaseRestartRequired = oHQ.statement(
			'select ' +
			'    log.* ' +
			'from ' +
			'    "SAP_INO"."sap.ino.setup.db::t_log" as log,' +
			'    "SYS"."M_DATABASE" as db ' +
			'where ' +
			'    log.time > db.start_time ' +
			"and log.name = 'sap.ino.setup.release_independent.95_setup_restart_database_required' " +
			"and log.step = 'run' "
		).execute();
		if (aDatabaseRestartRequired.length > 0) {
			logger.log({
				actionCode: "RESTART_DB",
				status: 2,
				msg: "Please restart the database manually."
			});
			return {
				success: false,
				msg: "Please restart the database manually."
			};
		}
		logger.log({
			actionCode: "RESTART_DB",
			status: 1,
			msg: "DONE"
		});
		return {
			success: true
		};
	}

	function setSystemConfig() {
		var sSQL = 'SELECT VALUE FROM "SAP_INO"."sap.ino.db.installation::t_installation_setting" WHERE ID = 1';
		var aResult = oHQ.statement(sSQL).execute();
		if (aResult && aResult.length === 1 && aResult[0].VALUE) {
			try {
				var oInfo = JSON.parse(aResult[0].VALUE);
				var sServerSql = "ALTER SYSTEM ALTER CONFIGURATION('xsengine.ini', 'DATABASE') SET('smtp', 'server_host') = '" + oInfo.SMTP_SERVER +
					"'";
				var sServerPortSql = "ALTER SYSTEM ALTER CONFIGURATION ('xsengine.ini', 'DATABASE') SET ('smtp', 'server_port') = '" + oInfo.SMTP_PORT +
					"'";
				oHQ.statement(sServerSql).execute();
				oHQ.statement(sServerPortSql).execute();
				oHQ.statement(
					"ALTER SYSTEM ALTER CONFIGURATION ('indexserver.ini', 'DATABASE') set('authentication', 'session_cookie_validity_time') = '3600'").execute();
				oHQ.statement("ALTER SYSTEM ALTER CONFIGURATION ('xsengine.ini', 'DATABASE') set('httpserver', 'sessiontimeout') = '14400'").execute();
				oHQ.statement("ALTER SYSTEM ALTER CONFIGURATION ('xsengine.ini', 'DATABASE') set('httpserver', 'max_request_runtime') = '14400'").execute();
				oHQ.statement(
					"ALTER SYSTEM ALTER CONFIGURATION ('xsengine.ini', 'DATABASE') SET ('jsvm', 'max_runtime_bytes')= '1073741824' WITH RECONFIGURE").execute();
				oHQ.statement(
					"ALTER SYSTEM ALTER CONFIGURATION ('xsengine.ini', 'DATABASE') SET ('jsvm', 'max_runtime_follow_up')= '14400' WITH RECONFIGURE").execute();
				oConn.commit();
				logger.log({
					actionCode: "SET_SYS_CONFIG",
					status: 1,
					msg: "DONE"
				});
				return {
					success: true
				};
			} catch (ex) {
				logger.log({
					actionCode: "SET_SYS_CONFIG",
					status: 2,
					msg: TraceWrapper.stringify_exception(ex)
				});
				return {
					success: false,
					msg: TraceWrapper.stringify_exception(ex)
				};
			}
		}
	}

	function setApplicationConfig() {
		var sSQL = 'SELECT VALUE FROM "SAP_INO"."sap.ino.db.installation::t_installation_setting" WHERE ID = 1';
		var aResult = oHQ.statement(sSQL).execute();
		if (aResult && aResult.length === 1 && aResult[0].VALUE) {
			try {
				var oInfo = JSON.parse(aResult[0].VALUE);
				var sHostSql = "ALTER SYSTEM ALTER CONFIGURATION('xsengine.ini', 'DATABASE') SET ('innovation_management', 'host') = '" + oInfo.INTERNAL_HOST +
					"'";
				var sExternalHostSql =
					"ALTER SYSTEM ALTER CONFIGURATION('xsengine.ini', 'DATABASE') SET ('innovation_management', 'host_external') = '" + oInfo.EXTERNAL_HOST +
					"'";
				var sEmailSenderSql = "ALTER SYSTEM ALTER CONFIGURATION('xsengine.ini', 'DATABASE') SET ('innovation_management', 'email_sender') = '" +
					oInfo.EMAIL_SENDER + "'";
				oHQ.statement(sHostSql).execute();
				oHQ.statement(sExternalHostSql).execute();
				oHQ.statement(sEmailSenderSql).execute();
				oHQ.procedure("SAP_INO", "sap.ino.db.config.admin::set_config_package").execute(oInfo.PACKAGE_NAME);
				oConn.commit();
				logger.log({
					actionCode: "SET_APP_CONFIG",
					status: 1,
					msg: "DONE"
				});
				return {
					success: true
				};
			} catch (ex) {
				logger.log({
					actionCode: "SET_APP_CONFIG",
					status: 2,
					msg: TraceWrapper.stringify_exception(ex)
				});
				return {
					success: false,
					msg: TraceWrapper.stringify_exception(ex)
				};
			}
		}
	}

	function setSystemCache() {
		var sSQL = 'SELECT VALUE FROM "SAP_INO"."sap.ino.db.installation::t_installation_setting" WHERE ID = 1';
		var aResult = oHQ.statement(sSQL).execute();
		if (aResult && aResult.length === 1 && aResult[0].VALUE) {
			try {
				var oInfo = JSON.parse(aResult[0].VALUE);
				if (oInfo.PERFORMANCE.TIME_OUT > 0) {
					oHQ.statement(
						"ALTER SYSTEM ALTER CONFIGURATION ('indexserver.ini', 'DATABASE') set ('saml', 'assertion_timeout') = '" + oInfo.PERFORMANCE.TIME_OUT +
						"' with reconfigure").execute();
				}

				// if (oInfo.PERFORMANCE.CACHE_ZERO_ENABLE) {
				// 	oHQ.statement(
				// 		"alter system alter configuration ('webdispatcher.ini', 'DATABASE') set ('profile', 'icm/http/server_cache_0') = 'PREFIX=/sap/ino/ui/ui5/, CACHEDIR=$(DIR_INSTANCE)/wdisp/cache' with reconfigure"
				// 	).execute();
				// }

				// if (oInfo.PERFORMANCE.CACHE_ZERO_SIZE > 0) {
				// 	oHQ.statement(
				// 		"alter system alter configuration ('webdispatcher.ini', 'DATABASE') set ('profile', 'icm/http/server_cache_0/max_entries') = ? with reconfigure"
				// 	).execute(oInfo.PERFORMANCE.CACHE_ZERO_SIZE);
				// }

				if (oInfo.PERFORMANCE.RECOMPILATION_ENABLED) {
					oHQ.statement(
						"ALTER SYSTEM ALTER CONFIGURATION ('indexserver.ini', 'DATABASE') SET ('sql','plan_cache_auto_recompilation_enabled') = 'true' with reconfigure"
					).execute();
				} else {
					oHQ.statement(
						"ALTER SYSTEM ALTER CONFIGURATION ('indexserver.ini', 'DATABASE') SET ('sql','plan_cache_auto_recompilation_enabled') = 'false' with reconfigure"
					).execute();
				}

				if (oInfo.PERFORMANCE.PLAN_CACHE_SIZE > 0) {
					oHQ.statement(
						"alter system alter configuration ('indexserver.ini', 'database') SET ('sql','plan_cache_size') = '" + oInfo.PERFORMANCE.PLAN_CACHE_SIZE +
						"' with reconfigure").execute();
				}

				if (oInfo.PERFORMANCE.THRESHOLD_FACTOR > 0) {
					oHQ.statement(
						"ALTER SYSTEM ALTER CONFIGURATION ('indexserver.ini', 'DATABASE') SET ('cache', 'cs_statistics_cache_invalidation_threshold_factor') = '" +
						oInfo.PERFORMANCE.THRESHOLD_FACTOR + "' with reconfigure"
					).execute();
				}

				if (oInfo.PERFORMANCE.CACHE_ENABLE) {
					oHQ.statement(
						"alter system alter configuration ('indexserver.ini', 'database') SET ('cache', 'resultcache_enabled') = 'yes' with reconfigure").execute();
				} else {
					oHQ.statement(
						"alter system alter configuration ('indexserver.ini', 'database') SET ('cache', 'resultcache_enabled') = 'no' with reconfigure").execute();
				}

				if (oInfo.PERFORMANCE.WHITE_LIST) {
					oHQ.statement(
						"alter system alter configuration ('indexserver.ini', 'database') SET ('cache', 'resultcache_white_list') = '\"SAP_INO\".*' with reconfigure"
					).execute();
				}

				if (oInfo.PERFORMANCE.CACHE_SIZE > 0) {
					oHQ.statement(
						"alter system alter configuration ('indexserver.ini', 'database') SET ('cache', 'resultcache_maximum_value_size_in_bytes') ='" +
						oInfo.PERFORMANCE.CACHE_SIZE + "'"
					).execute();
				}
				oConn.commit();
				logger.log({
					actionCode: "SET_SYS_CACHE",
					status: 1,
					msg: "DONE"
				});
				return {
					success: true
				};
			} catch (ex) {
				logger.log({
					actionCode: "SET_SYS_CACHE",
					status: 2,
					msg: TraceWrapper.stringify_exception(ex)
				});
				return {
					success: false,
					msg: TraceWrapper.stringify_exception(ex)
				};
			}
		}
	}

	function setSystemTimeout(reqBody) {
		try {
			oHQ.statement("ALTER SYSTEM ALTER CONFIGURATION ('xsengine.ini', 'DATABASE') set ('scheduler', 'enabled') = 'false'").execute();
			jobSchedulerStatus.toggleSchedulerEnabled({
				"enabled": "false"
			});
			oHQ.statement("ALTER SYSTEM ALTER CONFIGURATION ('xsengine.ini', 'DATABASE') set('httpserver', 'sessiontimeout') = '14400'").execute();
			oHQ.statement("ALTER SYSTEM ALTER CONFIGURATION ('xsengine.ini', 'DATABASE') set('httpserver', 'max_request_runtime') = '14400'").execute();
			oHQ.statement(
				"ALTER SYSTEM ALTER CONFIGURATION ('xsengine.ini', 'DATABASE') SET ('jsvm', 'max_runtime_follow_up')= '14400' WITH RECONFIGURE").execute();
			oHQ.statement(
				"ALTER SYSTEM ALTER CONFIGURATION ('xsengine.ini', 'SYSTEM') set('innovation_management', 'maintenance_mode') = '1'").execute();
			if (reqBody.sMaintanceMsg) {
				oHQ.statement(
					"alter system alter configuration ('xsengine.ini', 'SYSTEM') set('innovation_management', 'system_message') = '" + reqBody.sMaintanceMsg +
					"' ").execute();
			}
			oConn.commit();
			logger.log({
				actionCode: "SET_SYS_TIMEOUT",
				status: 1,
				msg: "DONE"
			});
			return {
				success: true
			};
		} catch (ex) {
			logger.log({
				actionCode: "SET_SYS_TIMEOUT",
				status: 2,
				msg: TraceWrapper.stringify_exception(ex)
			});
			return {
				success: false,
				msg: TraceWrapper.stringify_exception(ex)
			};
		}
	}

	function rollTimeout() {
		oHQ.statement(
			"ALTER SYSTEM ALTER CONFIGURATION ('xsengine.ini', 'SYSTEM') set('innovation_management', 'maintenance_mode') = '0'").execute();
		oHQ.statement("ALTER SYSTEM ALTER CONFIGURATION ('xsengine.ini', 'DATABASE') set ('scheduler', 'enabled') = 'true'").execute();
		jobSchedulerStatus.toggleSchedulerEnabled({
			"enabled": "true"
		});
		oHQ.statement("ALTER SYSTEM ALTER CONFIGURATION ('xsengine.ini', 'DATABASE') unset('httpserver', 'sessiontimeout')").execute();
		oHQ.statement("ALTER SYSTEM ALTER CONFIGURATION ('xsengine.ini', 'DATABASE') unset('httpserver', 'max_request_runtime')").execute();
		oHQ.statement("ALTER SYSTEM ALTER CONFIGURATION ('xsengine.ini', 'DATABASE') unset ('jsvm', 'max_runtime_follow_up')").execute();
		oConn.commit();
	}

	function cancelTimeout() {
		try {
			rollTimeout();
			logger.log({
				actionCode: "CANCEL_TIMEOUT",
				status: 1,
				msg: "DONE"
			});
			return {
				success: true
			};
		} catch (ex) {
			logger.log({
				actionCode: "CANCEL_TIMEOUT",
				status: 2,
				msg: TraceWrapper.stringify_exception(ex)
			});
			return {
				success: false,
				msg: TraceWrapper.stringify_exception(ex)
			};
		}
	}

	function revokeTimeout() {
		try {
			rollTimeout();
			logger.log({
				actionCode: "REVOKE_TIMEOUT",
				status: 1,
				msg: "DONE"
			});
			logger.log({
				actionCode: "WORK_DONE",
				status: 1,
				msg: "DONE"
			});
			return {
				success: true
			};
		} catch (ex) {
			logger.log({
				actionCode: "REVOKE_TIMEOUT",
				status: 2,
				msg: TraceWrapper.stringify_exception(ex)
			});
			return {
				success: false,
				msg: TraceWrapper.stringify_exception(ex)
			};
		}
	}

	exports.preCheck = preCheck;
	exports.saveSetting = saveSetting;
	exports.getSettingInfo = getSettingInfo;
	exports.createUser = createUsers;
	exports.setSqlcc = setSqlcc;
	exports.runNewConfig = runNewConfig;
	exports.checkRestartDB = checkRestartDB;
	exports.runConfig = runConfig;
	exports.setSystemConfig = setSystemConfig;
	exports.setApplicationConfig = setApplicationConfig;
	exports.setSystemCache = setSystemCache;
	exports.setSystemTimeout = setSystemTimeout;
	exports.cancelTimeout = cancelTimeout;
	exports.revokeTimeout = revokeTimeout;
}(this));