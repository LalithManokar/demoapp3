/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.extensions.sap.ui.ux3.Shell");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

sap.ui.jsview("sap.ui.ino.views.common.BootstrapError", {

    getControllerName : function() {
        return "sap.ui.ino.views.common.BootstrapError";
    },
    
    createContent : function() {
        this.setHeight("100%");
        this.setDisplayBlock(true);
        
        var oLayout = new sap.ui.commons.layout.MatrixLayout({
            width : "100%",
            height : "100%",
            columns : 1
        });

        oLayout.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
            hAlign : sap.ui.commons.layout.HAlign.Center,
            content : new sap.ui.commons.FormattedTextView({
                htmlText : this.getViewData().errorMessage
            })
        }));

        // Make our require check happy
        var oDummy = sap.ui.ino.extensions.sap.ui.ux3.Shell;

        var oShell = new sap.ui.ux3.Shell({
            showLogoutButton : true,
            showSearchTool : false,
            showInspectorTool : false,
            showFeederTool : false,
            showTools : false,
            showPane : false,
            designType : sap.ui.ux3.ShellDesignType.Crystal,
            content : oLayout,
            logout : function() {
                sap.ui.ino.application.ApplicationBase.logout();
            },
            fullHeightContent : true
        });

        this.addStyleClass("sapUiInoBootstrapError");
        return oShell;
    }
});