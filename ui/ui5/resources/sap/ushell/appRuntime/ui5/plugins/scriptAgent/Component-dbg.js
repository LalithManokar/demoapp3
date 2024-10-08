// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define([
        "sap/ui/core/Component",
        "sap/ui/thirdparty/jquery",
        "sap/base/Log"
    ],
    function (
        Component, jQuery, Log
    ) {
        "use strict";

        return Component.extend("sap.ushell.appRuntime.ui5.plugins.scriptAgent.Component", {
            metadata: {
                version: "1.0.0",
                dependencies: {
                    libs: [ "sap.m" ],
                    components: []
                }
            },

            init: function () {
                var mConfig = this.getComponentData();
                try {
                    jQuery.getScript(mConfig.config.url);
                } catch (ex) {
                    Log.error(ex);
                }
            }
        });
    });
