// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define([
	"sap/ushell/appRuntime/ui5/AppRuntimePostMessageAPI",
	"sap/ushell/appRuntime/ui5/AppRuntimeService",
	"sap/base/util/UriParameters",
	"sap/ui/thirdparty/URI",
	"sap/ui/thirdparty/jquery",
	"sap/ushell/appRuntime/ui5/services/TunnelsAgent",
	"sap/ushell/appRuntime/ui5/services/AppDelegationBootstrap",
	"sap/ui/Device",
	"sap/ui/core/BusyIndicator",
        "sap/base/Log"
], function (AppRuntimePostMessageAPI, AppRuntimeService, UriParameters, URI, jQuery, tunnelsAgent, delegationBootstrap, Device, BusyIndicator, Log) {
	"use strict";

	function AppLifeCycleAgent (oConfig) {
		var that = this,
			sAppResolutionModule,
			oAppResolution,
			oAppResolutionCache = {},
			fnCreateApplication,
			oCachedApplications = {},
			oAppDirtyStateProviders = {},
			oRunningApp,
			fnRenderApp,
			eventHandlers = {},
                        oAppBackNavigationFunc = {},
                        oShellUIService;

		this.init = function (sModule, ofnCreateApplication, ofnRenderApp, sAppId, oAppInfo) {
			sAppResolutionModule = sModule;
			fnCreateApplication = ofnCreateApplication;
			fnRenderApp = ofnRenderApp;

			if (sAppId && oAppInfo) {
				oAppResolutionCache[sAppId] = JSON.parse(JSON.stringify(oAppInfo));
			}
			//register this create & destroy as a appLifeCycleCommunication handler
			AppRuntimePostMessageAPI.registerCommHandlers({
				"sap.ushell.services.appLifeCycle": {
					"oServiceCalls": {
						"create": {
							executeServiceCallFn: function (oMessageData) {
								var oMsg = JSON.parse(oMessageData.oMessage.data),
								    sAppId = new UriParameters(oMsg.body.sUrl).get("sap-ui-app-id");

								window.hasher.disableCFLPUpdate = true;
								window.hasher.replaceHash("");
								window.hasher.replaceHash(oMsg.body.sHash);
								window.hasher.disableCFLPUpdate = false;
								that.create(sAppId, oMsg.body.sUrl);
								return new jQuery.Deferred().resolve().promise();
							}
						},
						"destroy": {
							executeServiceCallFn: function (oMessageData) {
								var oMsg = JSON.parse(oMessageData.oMessage.data);
								that.destroy(oMsg.body.sCacheId);
								return new jQuery.Deferred().resolve().promise();
							}
						},
						"store": {
							executeServiceCallFn: function (oMessageData) {
								var oMsg = JSON.parse(oMessageData.oMessage.data);
								that.store(oMsg.body.sCacheId);
								return new jQuery.Deferred().resolve().promise();
							}
						},
						"restore": {
							executeServiceCallFn: function (oMessageData) {
								var oMsg = JSON.parse(oMessageData.oMessage.data);

								window.hasher.disableCFLPUpdate = true;
								window.hasher.replaceHash("");
								window.hasher.replaceHash(oMsg.body.sHash);
								window.hasher.disableCFLPUpdate = false;
								that.restore(oMsg.body.sCacheId);
								return new jQuery.Deferred().resolve().promise();
							}
						}
					}
				},
				"sap.ushell.eventDelegation": {
					"oServiceCalls": {
						"registerEventHandler": {
							executeServiceCallFn: function (oServiceParams) {
								var sEventObject = JSON.parse(oServiceParams.oMessageData.body.sEventObject),
									eventKey = sEventObject.eventKey,
									eventData = sEventObject.eventData;
								if (eventHandlers.hasOwnProperty(eventKey)) {
									var handlersList = eventHandlers[eventKey];
									for (var handlerIndex = 0; handlerIndex < handlersList.length; handlerIndex++) {
										handlersList[handlerIndex](eventData);
									}
								}
								return new jQuery.Deferred().resolve().promise();
							}
						}
					}
				}
			});
			this.initialSetup();
		};

		this.initialSetup = function () {

			delegationBootstrap.bootstrap();

                        AppRuntimeService.sendMessageToOuterShell(
                            "sap.ushell.services.appLifeCycle.setup", {
                                isStateful: true,
                                isKeepAlive: true,
                                isIframeValid: true,
                                session: {
                                   bLogoutSupport: true
                                }
                            });
		};

		this.restore = function (sStorageKey) {
			var oCachedEntry = oCachedApplications[sStorageKey],
				oApp = oCachedEntry.getComponentInstance();

			sap.ui.getCore().getEventBus().publish("launchpad", "appOpening", {});
			oCachedEntry.setVisible(true);
			// re-register application's dirty state providers when restored
			if (oAppDirtyStateProviders[sStorageKey] && sap.ushell.Container) {
				sap.ushell.Container.setAsyncDirtyStateProviders(oAppDirtyStateProviders[sStorageKey]);
			}
                        if (oShellUIService) {
                            oShellUIService.setBackNavigation(oAppBackNavigationFunc[sStorageKey]);
                        }

			if (oApp) {
				if (oApp.restore) {
					oApp.restore();
				}

				if (oApp.getRouter && oApp.getRouter() && oApp.getRouter().initialize) {
					oApp.getRouter().initialize();
				}

				oRunningApp = oCachedEntry;
			}
			sap.ui.getCore().getEventBus().publish("sap.ushell", "appOpened", {});
		};

		this.store = function (sStorageKey) {
			var oCachedEntry = oRunningApp,
				oApp;

			oCachedApplications[sStorageKey] = oCachedEntry;
                        if (oShellUIService) {
                            oAppBackNavigationFunc[sStorageKey] = oShellUIService._getBackNavigationCallback();
                        }

			oApp = oCachedEntry.getComponentInstance();
			oCachedEntry.setVisible(false);
			// keep application's dirty state providers when stored
			if (sap.ushell.Container) {
				oAppDirtyStateProviders[sStorageKey] = sap.ushell.Container.getAsyncDirtyStateProviders();
				sap.ushell.Container.cleanDirtyStateProviderArray();
			}
			if (oApp) {
				if (oApp.suspend) {
					oApp.suspend();
				}
				if (oApp.getRouter && oApp.getRouter()) {
					oApp.getRouter().stop();
				}
			}
			sap.ui.getCore().getEventBus().publish("sap.ushell", "appClosed", {});
		};

		this.getURLParameters = function (oUrlParameters) {
			return new Promise(function (fnResolve, fnReject) {
				if (oUrlParameters.hasOwnProperty("sap-intent-param")) {
					var sAppStateKey = oUrlParameters["sap-intent-param"];
					AppRuntimeService.sendMessageToOuterShell("sap.ushell.services.CrossApplicationNavigation.getAppStateData", { "sAppStateKey": sAppStateKey })
						.then(function (sParameters) {
							delete oUrlParameters["sap-intent-param"];
							var oUrlParametersExpanded = jQuery.extend({}, oUrlParameters, (new URI("?" + sParameters)).query(true), true);
							fnResolve(oUrlParametersExpanded);
						}, function (sError) {
							fnResolve(oUrlParameters);
						});
				} else {
					fnResolve(oUrlParameters);
				}
			});
		};

		this.getAppInfo = function (appId) {
			return new Promise(function (fnResolve) {
				function fnGetAppInfo() {
					oAppResolution.getAppInfo(appId).then(function (oAppInfo) {
						oAppResolutionCache[appId] = (JSON.parse(JSON.stringify(oAppInfo)));
						fnResolve(oAppInfo);
					});
				}

				if (oAppResolutionCache[appId]) {
					fnResolve(JSON.parse(JSON.stringify(oAppResolutionCache[appId])));
				} else if (oAppResolution) {
					fnGetAppInfo();
				} else {
					sap.ui.require([sAppResolutionModule.replace(/\./g, "/")], function (oObj) {
						oAppResolution = oObj;
						fnGetAppInfo();
					});
				}
			});
		};

		this.create = function (appId, sUrl) {
			//BusyIndicator work in hidden iframe only in chrome
			if (Device.browser.chrome) {
				BusyIndicator.show(0);
			}
                        if (oShellUIService) {
                            oShellUIService._resetBackNavigationCallback();
                        }

			sap.ui.getCore().getEventBus().publish("launchpad", "appOpening", {});
			var applicationInfoPromis = new Promise(function (fnResolve) {
				that.getAppInfo(appId).then(function (oAppInfo) {
					fnResolve(oAppInfo);
				});
			}).then(function (oAppInfo) {
				that.getURLParameters(new URI(sUrl).query(true)).then(function (oURLParameters) {
					fnCreateApplication(appId, oURLParameters, oAppInfo)
						.then(function (oCreateApplicationResult) {
							fnRenderApp(oCreateApplicationResult);
							sap.ui.getCore().getEventBus().publish("sap.ushell", "appOpened", {});
						});
				});
			});

			return applicationInfoPromis;
		};

		this.setComponent = function (oApp) {
			oRunningApp = oApp;
		};

		this.destroy = function (sStorageKey) {
                        function appDestroy(oApplication) {
                            var sAppId = oApplication.sId || "<unkown>";
                            try {
                                oApplication.destroy();
                            } catch (e) {
                                Log.error("exception when trying to close sapui5 application with id '" + sAppId +
                                    "' when running inside the appruntim iframe '" + document.URL +
                                        "'. This error must be fixed in order for the iframe to operate properly.\n",
                                    e.stack,
                                    "sap.ushell.appRuntime.ui5.services.AppLifeCycleAgent::destroy");
                            }
                        }

			if (sStorageKey && oCachedApplications[sStorageKey]) {
				if (oCachedApplications[sStorageKey] === oRunningApp) {
					oRunningApp = undefined;
				}
				appDestroy(oCachedApplications[sStorageKey]);
				delete oCachedApplications[sStorageKey];
			} else if (oRunningApp) {
				appDestroy(oRunningApp);
				oRunningApp = undefined;
			}
			sap.ushell.Container.cleanDirtyStateProviderArray();
                        if (oShellUIService) {
                            oShellUIService._resetBackNavigationCallback();
                        }
			sap.ui.getCore().getEventBus().publish("sap.ushell", "appClosed", {});
		};

		this.jsonStringifyFn = function (oJson) {
			var sResult = JSON.stringify(oJson, function (key, value) {
				return (typeof value === "function") ? value.toString() : value;
			});

			return sResult;
		};

                this.setShellUIService = function (oService) {
                    oShellUIService = oService;
                };
	}

	return new AppLifeCycleAgent();
}, true);

