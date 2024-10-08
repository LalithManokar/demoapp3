// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/Log",
    "sap/ushell/User",
    "sap/ui/thirdparty/jquery",
    "sap/base/util/ObjectPath"
], function (Log, User, jQuery, ObjectPath) {
    "use strict";
    var ContainerAdapter = function (oSystem, sParameter, oConfig) {

        var oUser,
            sLogoutUrl,
            sKeepAliveURL,
            sKeepAliveMethod;

        this.load = function () {
            var userInfo;

            sLogoutUrl = ObjectPath.get("config.systemProperties.logoutUrl", oConfig);
            sKeepAliveURL = ObjectPath.get("config.systemProperties.sessionKeepAlive.url", oConfig);
            sKeepAliveMethod = ObjectPath.get("config.systemProperties.sessionKeepAlive.method", oConfig);

            //prepare user object
            userInfo = jQuery.extend(
                true,
                {id: ""},
                ObjectPath.get("config.userProfile.defaults", oConfig)
            );
            oUser = new User(userInfo);
            setSAPUI5Settings(userInfo);

            return new jQuery.Deferred().resolve().promise();
        };

        this.getSystem = function () {
            return oSystem;
        };

        this.getUser = function () {
            return oUser;
        };

        this.logout = function () {
            var oDeferred = new jQuery.Deferred();

            try {
                if (typeof sLogoutUrl === "string" && sLogoutUrl.length > 0) {
                    this._logoutViaHiddenIFrame(oDeferred, sLogoutUrl);
                    //resolve after 4 seconds if no response came from the logout iframe
                    setTimeout(oDeferred.resolve, 4000);
                } else {
                    oDeferred.resolve();
                }
            } catch (e) {
                Log.error(
                    "logout from iframe " + document.URL + " failed",
                    e,
                    "sap.ushell.appRuntime.ui5.SessionHandlerAgent");
                oDeferred.resolve();
            }

            return oDeferred.promise();
        };

        this._logoutViaHiddenIFrame = function (oDeferred, sUrl) {
            var oFrame = document.createElement("iframe"),
                sSafeUrl = sUrl.replace(/"/g, "\\\"");

            window.addEventListener("message", function (oEvent) {
                if ((oEvent.data && oEvent.data.url) === sUrl) {
                    oDeferred.resolve();
                }
            });

            oFrame.style.visibility = "hidden";
            oFrame.setAttribute("src", sUrl);

            function onload () {
                this.contentWindow.parent.postMessage({
                    url: sSafeUrl,
                    request_id: "dummy-logout-id"
                }, "*");
            }

            oFrame.addEventListener("load", onload);
            oFrame.addEventListener("error", onload);

            document.body.appendChild(oFrame);
        };

        this.sessionKeepAlive = function () {
            if (typeof sKeepAliveURL === "string" && sKeepAliveURL.length > 0 &&
                typeof sKeepAliveMethod === "string" && sKeepAliveMethod.length > 0) {
                var oXHR = new XMLHttpRequest();
                oXHR.open(sKeepAliveMethod, sKeepAliveURL, /*async=*/true);

                oXHR.onreadystatechange = function () {
                    if (this.readyState === /*DONE*/4) {
                        Log.debug("Server session was extended");
                    }
                };

                oXHR.send();
            }
        };

        function setSAPUI5Settings (oSettings) {
            var oCore = sap.ui.getCore(),
                oConfiguration = oCore.getConfiguration(),
                oFormatSettings = oConfiguration.getFormatSettings();
            if (oSettings.sapDateFormat) {
                oFormatSettings.setLegacyDateFormat(oSettings.sapDateFormat);
            }
            if (oSettings.sapDateCalendarCustomizing) {
                oFormatSettings.setLegacyDateCalendarCustomizing(oSettings.sapDateCalendarCustomizing);
            }
            if (oSettings.sapNumberFormat) {
                oFormatSettings.setLegacyNumberFormat(oSettings.sapNumberFormat);
            }
            if (oSettings.sapTimeFormat) {
                oFormatSettings.setLegacyTimeFormat(oSettings.sapTimeFormat);
            }
            if (typeof oSettings.currencyFormats === "object") {
                oFormatSettings.addCustomCurrencies(oSettings.currencyFormats);
            }
        }
    };

    return ContainerAdapter;
}, /* bExport= */ true);
