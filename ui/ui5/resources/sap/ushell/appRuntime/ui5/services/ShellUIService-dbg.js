// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/core/service/ServiceFactoryRegistry",
    "sap/ui/core/service/ServiceFactory",
    "sap/ui/core/service/Service",
    "../../../ui5service/_ShellUIService/shelluiservice.class.factory",
    "sap/ushell/appRuntime/ui5/AppRuntimePostMessageAPI",
    "sap/ushell/appRuntime/ui5/AppRuntimeService",
    "sap/ui/thirdparty/jquery"
], function (ServiceFactoryRegistry, ServiceFactory, Service, fnDefineClass, AppRuntimePostMessageAPI, AppRuntimeService, jQuery) {
    "use strict";

    var oService = fnDefineClass({
        serviceRegistry: ServiceFactoryRegistry,
        serviceFactory: ServiceFactory,
        service: Service
    });

    var sLastSetTitle,
        bRegistered = false,
        fnBackNavigationCallback;

    var ShellUIServiceProxy = oService.extend("sap.ushell.appRuntime.services.ShellUIService", {

        setTitle: function (sTitle) {
            sLastSetTitle = sTitle;
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.ShellUIService.setTitle", {
                    sTitle: sTitle
                });
        },

        getTitle: function () {
            return sLastSetTitle;
        },

        setHierarchy: function (aHierarchyLevels) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.ShellUIService.setHierarchy", {
                    aHierarchyLevels: aHierarchyLevels
                });
        },

        setRelatedApps: function (aRelatedApps) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.ShellUIService.setRelatedApps", {
                    aRelatedApps: aRelatedApps
                });
        },

        setBackNavigation: function (fnCallback) {
            var oMessage;

            if (!bRegistered) {
                bRegistered = true;
                AppRuntimePostMessageAPI.registerCommHandlers({
                    "sap.ushell.appRuntime": {
                        oServiceCalls: {
                            handleBackNavigation: {
                                executeServiceCallFn: function (oServiceParams) {
                                    if (fnBackNavigationCallback) {
                                        fnBackNavigationCallback();
                                    } else {
                                        window.history.back();
                                    }
                                    return new jQuery.Deferred().resolve().promise();
                                }
                            }
                        }
                    }
                });
            }

            fnBackNavigationCallback = fnCallback;
            if (fnBackNavigationCallback === undefined) {
                oMessage = {};
            } else {
                oMessage = {
                    callbackMessage: {
                        service: "sap.ushell.appRuntime.handleBackNavigation"
                    }
                };
            }
            AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.ui5service.ShellUIService.setBackNavigation", oMessage);
        },

        _getBackNavigationCallback: function () {
            return fnBackNavigationCallback;
        },

        _resetBackNavigationCallback: function () {
            fnBackNavigationCallback = undefined;
        }      
    });

    return ShellUIServiceProxy;
}, true);
