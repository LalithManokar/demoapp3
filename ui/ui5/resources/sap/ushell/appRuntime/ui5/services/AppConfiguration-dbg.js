// Copyright (c) 2009-2017 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/appRuntime/ui5/AppRuntimeService",
    "sap/ui/core/IconPool",
    "sap/ushell/resources",
    "sap/m/library"
], function (AppConfiguration, AppRuntimeService, IconPool, resources, mobileLibrary) {
    "use strict";

    function AppConfigurationProxy () {
        var aIdsOfAddedButtons = [];

        sap.ushell.services.AppConfiguration = this;

        AppConfiguration.constructor.call(this);

        this.setApplicationFullWidth = function (bValue) {
            AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.AppConfiguration.setApplicationFullWidth", {
                    bValue: bValue
                });
        };

        this.addApplicationSettingsButtons = function (aButtons) {
            var i;

            for (i = 0; i < aButtons.length; i++) {
                var oCurrentButton = aButtons[i];
                oCurrentButton.setIcon(oCurrentButton.getIcon() || IconPool.getIconURI("customize"));
                // in case the button has the text "Settings" we change it to "App Setting" in order prevent name collision
                if (resources.i18n.getText("userSettings") === oCurrentButton.getProperty("text")) {
                    oCurrentButton.setProperty("text", resources.i18n.getText("userAppSettings"));
                }
                oCurrentButton.setType(mobileLibrary.ButtonType.Unstyled);
            }

            sap.ushell.renderers.fiori2.RendererExtensions.removeOptionsActionSheetButton(aIdsOfAddedButtons, "app")
                .done(function () {
                    aIdsOfAddedButtons = aButtons;
                    sap.ushell.renderers.fiori2.RendererExtensions.addOptionsActionSheetButton(aIdsOfAddedButtons, "app");
                });
        };
    }

    return new AppConfigurationProxy();
}, true);
