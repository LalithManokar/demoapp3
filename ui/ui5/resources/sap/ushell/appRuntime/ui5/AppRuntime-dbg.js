// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
prepareModules();
sap.ui.define([
    "sap/base/util/LoaderExtensions",
    "sap/ushell/appRuntime/ui5/AppRuntimePostMessageAPI",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr",
    "sap/ushell/appRuntime/ui5/AppRuntimeService",
    "sap/ui/thirdparty/URI",
    "sap/ushell/appRuntime/ui5/SessionHandlerAgent",
    "sap/ushell/appRuntime/ui5/services/AppLifeCycleAgent",
    "sap/ushell/appRuntime/ui5/services/ShellUIService",
    "sap/ushell/ui5service/UserStatus",
    "sap/ushell/appRuntime/ui5/services/AppConfiguration", //must be included, do not remove
    "sap/ushell/appRuntime/ui5/services/UserInfo", //must be included, do not remove
    "sap/ui/core/Popup",
    "sap/ui/thirdparty/jquery",
    "sap/base/util/isEmptyObject",
    "sap/base/Log",
    "sap/ui/core/ComponentContainer",
    "sap/ushell/appRuntime/ui5/renderers/fiori2/AccessKeysAgent",
    "sap/ui/core/BusyIndicator",
    "sap/ushell/iconfonts",
    "sap/ushell/utils/WindowUtils"
], function (
    LoaderExtensions,
    AppRuntimePostMessageAPI,
    AppCommunicationMgr,
    AppRuntimeService,
    URI,
    SessionHandlerAgent,
    AppLifeCycleAgent,
    ShellUIService,
    UserStatus,
    AppConfiguration,
    UserInfo,
    Popup,
    jQuery,
    isEmptyObject,
    Log,
    ComponentContainer,
    AccessKeysAgent,
    BusyIndicator,
    Iconfonts,
    WindowUtils
) {
    "use strict";

    var _that,
        oPageUriParams = new URI().search(true),
        oShellNavigationService,
        bURLHelperReplaced = false,
        fnOrigURLHelperRedirect,
        bPluginsLoaded = false,
        oStartupPlugins = {},
        oShellUIService;

    /**
     * Application runtime for UI5 applications running in iframe
     *
     * @private
     */
    function AppRuntime () {

        /**
         * @private
         */
        this.main = function () {
            jQuery("body").css("height", "100%").css("width", "100%");
            AppCommunicationMgr.init(true);
            this.getPageConfig();
            Promise.all([
                AppLifeCycleAgent.getURLParameters(_that._getURI())
            ]).then(function (values) {
                var oURLParameters = values[0],
                    sAppId = oURLParameters["sap-ui-app-id"];

                _that.setModulePaths();
                _that.init();
                Promise.all([
                    _that.initServicesContainer(),
                    _that.getAppInfo(sAppId)
                ]).then(function (values) {
                    var oAppInfo = values[1];
                    SessionHandlerAgent.init();
                    AccessKeysAgent.init();
                    _that.createApplication(sAppId, oURLParameters, oAppInfo)
                        .then(function (oCreateApplicationResult) {
                            _that.renderApplication(oCreateApplicationResult);
                        });
                });
            });
        };

        /**
         * @private
         */
        this._getURI = function () {
            return new URI().query(true);
        };

        /**
         * @private
         */
        this.init = function () {
            Iconfonts.registerFiori2IconFont();
            AppRuntimePostMessageAPI.registerCommHandlers({
                "sap.ushell.appRuntime": {
                    oServiceCalls: {
                        "hashChange": {
                            executeServiceCallFn: function (oServiceParams) {
                                var sHash = oServiceParams.oMessageData.body.sHash,
                                    oUrlParsing = sap.ushell.Container.getService("URLParsing");
                                if (typeof sHash === "string") {
                                    var oNewHash = oUrlParsing.parseShellHash(sHash),
                                        oOldHash = oUrlParsing.parseShellHash(window.hasher.getHash());
                                    if (oNewHash && oOldHash && oNewHash.semanticObject === oOldHash.semanticObject && oNewHash.action === oOldHash.action) {
                                        window.hasher.replaceHash(sHash);
                                    }
                                }
                                return new jQuery.Deferred().resolve().promise();
                            }
                        },
                        "setDirtyFlag": {
                            executeServiceCallFn: function (oServiceParams) {
                                var bIsDirty = oServiceParams.oMessageData.body.bIsDirty;
                                if (bIsDirty !== sap.ushell.Container.getDirtyFlag()) {
                                    sap.ushell.Container.setDirtyFlag(bIsDirty);
                                }
                                return new jQuery.Deferred().resolve().promise();
                            }
                        },
                        "themeChange": {
                            executeServiceCallFn: function (oServiceParams) {
                                var currentThemeId = oServiceParams.oMessageData.body.currentThemeId;
                                sap.ushell.Container.getUser().setTheme(currentThemeId);
                                return new jQuery.Deferred().resolve().promise();
                            }
                        },
                        "buttonClick": {
                            executeServiceCallFn: function (oServiceParams) {
                                sap.ushell.renderers.fiori2.Renderer.handleHeaderButtonClick(
                                    oServiceParams.oMessageData.body.buttonId
                                );
                                return new jQuery.Deferred().resolve().promise();
                            }
                        },
                        "executeLogoutFunctions": {
                            executeServiceCallFn: function (oServiceParams) {
                                return sap.ushell.Container.executeAsyncAndSyncLogoutFunctions();
                            }
                        },
                        "uiDensityChange": {
                            executeServiceCallFn: function (oServiceParams) {
                                var isTouch = oServiceParams.oMessageData.body.isTouch;
                                jQuery("body")
                                    .toggleClass("sapUiSizeCompact", (isTouch === "0"))
                                    .toggleClass("sapUiSizeCozy", (isTouch === "1"));
                                return new jQuery.Deferred().resolve().promise();
                            }
                        },
                        "handleDirtyStateProvider": {
                            executeServiceCallFn: function (oServiceParams) {
                                return new jQuery.Deferred().resolve(sap.ushell.Container.handleDirtyStateProvider(oServiceParams.oMessageData.body.oNavigationContext)).promise();
                            }
                        }
                    }
                }
            });
        };

        /**
         * @private
         */
        this.handleLinkElementOpen = function (sFLPURL, event) {
            try {
                if (event.isDefaultPrevented && event.isDefaultPrevented() === true) {
                    return;
                }
                var oTarget = event.target;

                if (oTarget && oTarget.tagName === "A" && oTarget.href && oTarget.href.indexOf('#') > 0) {
                    if (oTarget.target === "_blank") {
                        var sNewURL = _that.rebuildNewAppUrl(oTarget.href, sFLPURL);
                        if (sNewURL !== oTarget.href) {
                            WindowUtils.openURL(sNewURL);
                            //We're returning false to determine that the default browser behaviour should NOT take place
                            // and we will be the one to handle the opening of the link (with 'window.open').
                            event.preventDefault();
                        }
                    } else if (oTarget.target === undefined || oTarget.target === "") {
                        //if the new hash is different than the current one, this is a cross application navigation
                        // and we will use the ushell service for that in order to properly create a new browser history
                        // entry
                        var oTargetUrlParts = oTarget.href.split("#"),
                            oCurrUrlParts = document.URL.split("#");
                        if (oTargetUrlParts[0] ===  oCurrUrlParts[0]) {
                            var oTargetHashParts = oTargetUrlParts[1] && oTargetUrlParts[1].split("&/"),
                                oCurrHashParts = oCurrUrlParts[1] && oCurrUrlParts[1].split("&/");
                            if (typeof oTargetHashParts[0] === "string" && typeof oCurrHashParts[0] === "string" && oTargetHashParts[0] !== oCurrHashParts[0]) {
                                sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
                                    oCrossAppNavService.toExternal({
                                        target: {
                                            shellHash: oTargetUrlParts[1]
                                        }
                                    });
                                });
                                event.preventDefault();
                            }
                        }
                    }
                }
            } catch (error) {
                //do nothing means that the browser will take care of the click
            }
        };

        /**
         * @private
         */
        this.rebuildNewAppUrl = function (sTargetUrl, sFLPUrl) {
            var sTargetUrlSplit = sTargetUrl.split('#');
            //Check if the destination URL equals to the IFrame URL
            if (sTargetUrlSplit[0].length === 0 || sTargetUrlSplit[0] === document.URL.split('#')[0]) {
                //Replace the Iframe URL with the FLP URL or Add it before the #
                return sFLPUrl + "#" + sTargetUrlSplit[1];
            }
            return sTargetUrl;
        };

        /**
         * @private
         */
        this.getStartupPlugins = function () {
            return oStartupPlugins;
        };

        /**
         * @private
         */
        this.inIframe = function () {
            try {
                return window.self !== window.top;
            } catch (e) {
                return true;
            }
        };

        /**
         * @private
         */
        this.getPageConfig = function () {
            var metaData,
                shellConfig = {};

            metaData = jQuery("meta[name='sap.ushellConfig.ui5appruntime']")[0];
            if (metaData !== undefined) {
                shellConfig = JSON.parse(metaData.content);
            }
            window["sap-ushell-config"] = jQuery.extend(true, {}, getDefaultShellConfig(), shellConfig);
        };

        /**
         * @private
         */
        this.setModulePaths = function () {
            if (window["sap-ushell-config"].modulePaths) {
                var keys = Object.keys(window["sap-ushell-config"].modulePaths);
                for (var key in keys) {
                    (function () {
                        var paths = {};
                        paths[keys[key].replace(/\./g, "/")] = window["sap-ushell-config"].modulePaths[keys[key]];
                        sap.ui.loader.config({ paths: paths });
                    }());
                }
            }
        };

        /**
         * @private
         */
        this.initServicesContainer = function () {
            return new Promise(function (fnResolve) {
                sap.ui.require(["sap/ushell/appRuntime/ui5/services/Container"], function (oContainer) {
                    oContainer.bootstrap("apprt", { apprt: "sap.ushell.appRuntime.ui5.services.adapters" }).then(function () {
                        //This section refers for the usecase where clicking on an Iframe link in order to open another Iframe
                        //application in a new tab. If the destination URL equals to the IFrame URL, it means that the destination
                        // Iframe URL is wrong and should be replaced with the FLP URL.
                        sap.ushell.Container.getFLPUrlAsync().then(function (sFLPURL) {
                            jQuery(document).on("click.appruntime", _that.handleLinkElementOpen.bind(_that, sFLPURL));
                            jQuery(document).on("keydown.appruntime", function (event) {
                                if (event.code === "Enter") {
                                    return _that.handleLinkElementOpen(sFLPURL, event);
                                }
                            });
                        });
                        fnResolve();
                    });
                });
            });
        };

        /**
         * @private
         */
        this._getURIParams = function () {
            return oPageUriParams;
        };

        /**
         * @private
         */
        this.getAppInfo = function (sAppId) {
            var oData = window["sap-ushell-config"].ui5appruntime.config.appIndex.data,
                sModule = window["sap-ushell-config"].ui5appruntime.config.appIndex.module;

            return new Promise(function (fnResolve) {
                if (oData && !isEmptyObject(oData)) {
                    AppLifeCycleAgent.init(sModule, _that.createApplication.bind(_that), _that.renderApplication.bind(_that), sAppId, oData);
                    fnResolve(oData);
                } else {
                    AppLifeCycleAgent.init(sModule, _that.createApplication.bind(_that), _that.renderApplication.bind(_that));
                    AppLifeCycleAgent.getAppInfo(sAppId).then(function (oAppInfo) {
                        fnResolve(oAppInfo);
                    });
                }
            });
        };

        /**
         * @private
         */
        this.setApplicationParameters = function (oAppInfo, oURLParameters) {
            var oStartupParameters,
                sSapIntentParam,
                sStartupParametersWithoutSapIntentParam,
                oDeferred = new jQuery.Deferred();

            function buildFinalParamsString(sSimpleParams, sIntentParams) {
                var sParams = "";
                if (sSimpleParams && sSimpleParams.length > 0) {
                    sParams = (sSimpleParams.startsWith("?") ? "" : "?") + sSimpleParams;
                }
                if (sIntentParams && sIntentParams.length > 0) {
                    sParams += (sParams.length > 0 ? "&" : "?") + sIntentParams;
                }
                return sParams;
            }

            if (oURLParameters.hasOwnProperty("sap-startup-params")) {
                oStartupParameters = (new URI("?" + oURLParameters["sap-startup-params"])).query(true);
                if (oStartupParameters.hasOwnProperty("sap-intent-param")) {
                    sSapIntentParam = oStartupParameters["sap-intent-param"];
                    delete oStartupParameters["sap-intent-param"];
                }
                sStartupParametersWithoutSapIntentParam = (new URI("?")).query(oStartupParameters).toString();

                //Handle the case when the parameters that were sent to the application were more than 1000 characters and in
                //the URL we see a shorten value of the parameters
                if (sSapIntentParam) {
                    AppRuntimeService.sendMessageToOuterShell("sap.ushell.services.CrossApplicationNavigation.getAppStateData", { "sAppStateKey": sSapIntentParam })
                        .then(function (sMoreParams) {
                            oAppInfo.url += buildFinalParamsString(sStartupParametersWithoutSapIntentParam, sMoreParams);
                            oDeferred.resolve();
                        }, function (sError) {
                            oAppInfo.url += buildFinalParamsString(sStartupParametersWithoutSapIntentParam);
                            oDeferred.resolve();
                        });
                } else {
                    oAppInfo.url += buildFinalParamsString(sStartupParametersWithoutSapIntentParam);
                    oDeferred.resolve();
                }
            } else {
                oDeferred.resolve();
            }

            return oDeferred.promise();
        };

        /**
         * @private
         */
        this.setHashChangedCallback = function () {
            function treatHashChanged (newHash, oldHash) {
                if (window.hasher.disableCFLPUpdate === true) {
                    return;
                }
                if (newHash && typeof newHash === "string" && newHash.length > 0) {
                    if (oldHash && typeof oldHash === "string" && oldHash.length > 0) {
                        var oTargetHashParts = newHash.split("&/"),
                            oCurrHashParts = oldHash.split("&/");
                        if (oTargetHashParts[0] !== oCurrHashParts[0]) {
                            sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
                                oCrossAppNavService.toExternal({
                                    target: {
                                        shellHash: newHash
                                    }
                                });
                            });
                            return;
                        }
                    }
                    AppRuntimeService.sendMessageToOuterShell(
                        "sap.ushell.appRuntime.hashChange",
                        { "newHash": newHash }
                    );
                }
            }
            window.hasher.changed.add(treatHashChanged.bind(this), this);
        };

        this.createApplication = function (sAppId, oURLParameters, oAppInfo) {
            var oParser = sap.ushell.Container.getService("URLParsing"),
                sHash = oParser.getHash(window.location.href);
            var oParsedHash = oParser.parseShellHash(sHash);
            var fnPopupOpenCloseHandler = function (oEvent) {
                    AppRuntimeService.sendMessageToOuterShell(
                        "sap.ushell.services.ShellUIService.showShellUIBlocker",
                        { "bShow": oEvent.getParameters().visible }
                    );
                };

            return new Promise(function (fnResolve) {
                var oComponentContainer = new ComponentContainer({
                    id: sAppId + "-content",
                    width: "100%",
                    height: "100%"
                });

                oComponentContainer.addStyleClass("sapAppRuntimeBaseStyle");

                var isTouch = "0";
                if (oPageUriParams.hasOwnProperty("sap-touch")) {
                    isTouch = oPageUriParams["sap-touch"];
                    if (isTouch !== "0" && isTouch !== "1") {
                        isTouch = "0";
                    }
                }
                jQuery("body")
                    .toggleClass("sapUiSizeCompact", (isTouch === "0"))
                    .toggleClass("sapUiSizeCozy", (isTouch === "1"));

                if (!oShellNavigationService) {
                    sap.ushell.renderers.fiori2.utils.init();
                    oShellNavigationService = sap.ushell.Container.getService("ShellNavigation");
                    oShellNavigationService.init(function () { });
                }

                if (oShellUIService === undefined) {
                    /* eslint-disable no-new */
                    oShellUIService = new ShellUIService({ scopeObject: oComponentContainer, scopeType: "component" });
                    new UserStatus({ scopeObject: oComponentContainer, scopeType: "component" });
                    /* eslint-enable no-new */
                    AppLifeCycleAgent.setShellUIService(oShellUIService);
                }

                if (Popup.attachBlockLayerStateChange) {
                    Popup.attachBlockLayerStateChange(fnPopupOpenCloseHandler);
                }

                _that.setApplicationParameters(oAppInfo, oURLParameters).done(function () {
                    _that.setHashChangedCallback();
                    sap.ushell.Container.getServiceAsync("Ui5ComponentLoader").then(function (oUi5ComponentLoader) {
                        oUi5ComponentLoader.createComponent(
                            {
                                ui5ComponentName: sAppId,
                                applicationDependencies: oAppInfo,
                                url: oAppInfo.url
                            },
                            oParsedHash,
                            false
                        ).then(function (oResolutionResultWithComponentHandle) {
                            sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function (oAppLifeCycleService) {
                                oAppLifeCycleService.prepareCurrentAppObject(
                                    "UI5",
                                    oResolutionResultWithComponentHandle.componentHandle.getInstance(),
                                    false,
                                    undefined
                                );
                                try {
                                    var oCurrentApp = oAppLifeCycleService.getCurrentApplication();
                                    var oMetaData = oResolutionResultWithComponentHandle.componentHandle.getMetadata();
                                    var oAppInfo = {};

                                    oAppInfo.appVersion = oMetaData.getVersion();
                                    Promise.all([
                                        oCurrentApp.getTechnicalParameter("sap-fiori-id"),
                                        oCurrentApp.getTechnicalParameter("sap-ach")
                                    ]).then(function (values) {
                                        if (Array.isArray(values[0]) && values[0][0]) {
                                            oAppInfo.appId = values[0][0];
                                        }
                                        if (Array.isArray(values[1]) && values[1][0]) {
                                            oAppInfo.appSupportInfo = values[1][0];
                                        }
                                        oAppInfo.appFrameworkId = "UI5";
                                        oAppInfo.technicalAppComponentId = oAppInfo.ui5ComponentName;
                                        AppRuntimeService.sendMessageToOuterShell("sap.ushell.services.AppLifeCycle.setNewAppInfo", {info: oAppInfo});
                                    });
                                } catch (error) {
                                    //do nothing
                                }
                            });
                            _that.overrideUrlHelperFuncs();
                            _that.loadPlugins();
                            fnResolve({
                                oComponentContainer: oComponentContainer,
                                oResolutionResultWithComponentHandle: oResolutionResultWithComponentHandle
                            });
                        });
                    });
                });
            });
        };

        /**
         * @private
         */
        this.overrideUrlHelperFuncs = function () {
            if (bURLHelperReplaced === true) {
                return;
            }
            bURLHelperReplaced = true;

            if (sap.m && sap.m.URLHelper) {
                sap.m.URLHelper.triggerEmail = function (sTo, sSubject, sBody, sCc, sBcc) {
                    AppRuntimeService.sendMessageToOuterShell("sap.ushell.services.ShellUIService.sendEmail", {
                        sTo: sTo,
                        sSubject: sSubject,
                        sBody: sBody,
                        sCc: sCc,
                        sBcc: sBcc,
                        sIFrameURL: document.URL,
                        bSetAppStateToPublic: true
                    });
                };

                fnOrigURLHelperRedirect = sap.m.URLHelper.redirect;
                sap.m.URLHelper.redirect = function (sURL, bNewWindow) {
                    if (sURL && bNewWindow === true && sURL.indexOf('#') >= 0) {
                        sap.ushell.Container.getFLPUrlAsync().then(function (sFLPURL) {
                            var sNewURL = _that.rebuildNewAppUrl(sURL, sFLPURL);
                            fnOrigURLHelperRedirect.call(sap.m.URLHelper, sNewURL, bNewWindow);
                        });
                    } else {
                        fnOrigURLHelperRedirect.call(sap.m.URLHelper, sURL, bNewWindow);
                    }
                };
            }
        };

        /**
         * @private
         */
        this.loadPlugins = function() {
            if (bPluginsLoaded === true) {
                return;
            }

            registerRTAPluginAgent();
            registerWAPluginAgent();
            bPluginsLoaded = true;
            sap.ushell.Container.getServiceAsync("PluginManager").then(function (PluginManagerService) {
                PluginManagerService.loadPlugins("RendererExtensions");
            });
        };

        /**
         * This method registers the RTA agent plugin in the AppRuntime.
         * This agent plugin will be loaded only if the FLP will loads the RTA plugin
         * @private
         */
        function registerRTAPluginAgent() {
            sap.ushell.Container.getService("PluginManager").registerPlugins({
                RTAPluginAgent: {
                    component: "sap.ushell.appRuntime.ui5.plugins.rtaAgent",
                    url: jQuery.sap.getResourcePath("sap/ushell/appRuntime/ui5/plugins/rtaAgent"),
                    config: {
                        "sap-plugin-agent": true
                    }
                }
            });
        }

        /**
         * This method registers the WA agent plugin in the AppRuntime.
         * This agent plugin will be loaded only if the FLP loads the WA plugin
         * @private
         */
        function registerWAPluginAgent() {
            var scriptURL;
            if (oPageUriParams.hasOwnProperty("sap-wa-debug") && oPageUriParams["sap-wa-debug"] == "dev") {
                scriptURL = "https://education3.hana.ondemand.com/education3/web_assistant/framework/FioriAgent.js";
            } else if (oPageUriParams.hasOwnProperty("sap-wa-debug") && oPageUriParams["sap-wa-debug"] == "prev") {
                scriptURL = "https://webassistant-outlook.enable-now.cloud.sap/web_assistant/framework/FioriAgent.js";
            } else { //production script
                scriptURL = "https://webassistant.enable-now.cloud.sap/web_assistant/framework/FioriAgent.js";
            }

            sap.ushell.Container.getService("PluginManager").registerPlugins({
                WAPluginAgent: {
                    component: "sap.ushell.appRuntime.ui5.plugins.scriptAgent",
                    url: jQuery.sap.getResourcePath("sap/ushell/appRuntime/ui5/plugins/scriptAgent"),
                    config: {
                        "sap-plugin-agent": true,
                        "url": scriptURL
                    }
                }
            });
        }

        /**
         * @private
         */
        this.renderApplication = function (oCreateApplicationResult) {
            oCreateApplicationResult.oComponentContainer
                .setComponent(oCreateApplicationResult.oResolutionResultWithComponentHandle.componentHandle.getInstance())
                .placeAt("content");
            BusyIndicator.hide();
            window.setTimeout(function () {
                if (oCreateApplicationResult.oResolutionResultWithComponentHandle.componentHandle.getInstance().active) {
                    oCreateApplicationResult.oResolutionResultWithComponentHandle.componentHandle.getInstance().active();
                }
            }, 0);
            AppLifeCycleAgent.setComponent(oCreateApplicationResult.oComponentContainer);
        };
    }

    /**
     * @private
     */
    function getDefaultShellConfig () {
        return {
            services: {
                CrossApplicationNavigation: {
                    module: "sap.ushell.appRuntime.ui5.services.CrossApplicationNavigation",
                    adapter: {
                        module: "sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"
                    }
                },
                NavTargetResolution: {
                    module: "sap.ushell.appRuntime.ui5.services.NavTargetResolution",
                    adapter: {
                        module: "sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"
                    }
                },
                ShellNavigation: {
                    module: "sap.ushell.appRuntime.ui5.services.ShellNavigation",
                    adapter: {
                        module: "sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"
                    }
                },
                AppConfiguration: {
                    module: "sap.ushell.appRuntime.ui5.services.AppConfiguration"
                },
                Bookmark: {
                    module: "sap.ushell.appRuntime.ui5.services.Bookmark",
                    adapter: {
                        module: "sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"
                    }
                },
                LaunchPage: {
                    module: "sap.ushell.appRuntime.ui5.services.LaunchPage",
                    adapter: {
                        module: "sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"
                    }
                },
                UserInfo: {
                    module: "sap.ushell.appRuntime.ui5.services.UserInfo",
                    adapter: {
                        module: "sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"
                    }
                },
                AppState: {
                    module: "sap.ushell.appRuntime.ui5.services.AppState",
                    adapter: {
                        module: "sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"
                    }
                },
                PluginManager: {
                    module: "sap.ushell.appRuntime.ui5.services.PluginManager",
                    config: {
                        isBlueBox: true
                    }
                },
                Ui5ComponentLoader: {
                    config: {
                        amendedLoading: false
                    }
                }
            }
        };
    }

    var appRuntime = new AppRuntime();
    _that = appRuntime;
    appRuntime.main();
    return appRuntime;
});

function prepareModules () {
    "use strict";

    sap.ui.require(["sap/ui/core/BusyIndicator"], function (BusyIndicator) {
        BusyIndicator.show(0);
    });

    //when appruntime is loaded, we will avoid loading specific
    //dependencies as they are not in use
    if (document.URL.indexOf("ui5appruntime") > 0) {
        sap.ui.define("sap/ushell/ApplicationType", [], function () {
            return {
                URL: {
                    type: "URL"
                },
                WDA: {
                    type: "WDA"
                },
                TR: {
                    type: "TR"
                },
                NWBC: {
                    type: "NWBC"
                },
                WCF: {
                    type: "WCF"
                },
                SAPUI5: {
                    type: "SAPUI5"
                }
            };
        });
        sap.ui.define("sap/ushell/components/applicationIntegration/AppLifeCycle", [], function () {return {};});
        sap.ui.define("sap/ushell/services/_AppState/WindowAdapter", [], function () {return function() {};});
        sap.ui.define("sap/ushell/services/_AppState/SequentializingAdapter", [], function () {return function() {};});
        sap.ui.define("sap/ushell/services/_AppState/Sequentializer", [], function () {return function() {};});
        sap.ui.define("sap/ushell/services/Configuration", [], function () {
            function Configuration() {
                this.attachSizeBehaviorUpdate = function() {};
                this.hasNoAdapter = true;
            }
            Configuration.hasNoAdapter = true;
            return Configuration;
        });
        sap.ui.define("sap/ushell/services/_PluginManager/Extensions", [], function () {return function() {};});
    }
}
