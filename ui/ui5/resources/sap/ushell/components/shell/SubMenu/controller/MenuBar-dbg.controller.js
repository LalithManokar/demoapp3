// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("sap.ushell.components.shell.SubMenu.controller.MenuBar", {
        onMenuItemSelection: function (event) {
            var sSelectedMenuIntent = event.getParameter("key");
            var oURLParsingService = sap.ushell.Container.getServiceAsync("URLParsing");
            var oCANService = sap.ushell.Container.getServiceAsync("CrossApplicationNavigation");

            Promise.all([oURLParsingService, oCANService]).then(function (aServices) {
                oURLParsingService = aServices[0];
                oCANService = aServices[1];

                var oParsedShellHash = oURLParsingService.parseShellHash(sSelectedMenuIntent);
                oCANService.toExternal({
                    target: {
                        semanticObject: oParsedShellHash.semanticObject,
                        action: oParsedShellHash.action
                    },
                    params: oParsedShellHash.params
                });
            });
        }
    });
});