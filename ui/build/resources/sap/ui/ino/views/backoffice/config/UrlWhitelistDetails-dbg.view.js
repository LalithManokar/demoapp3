/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.controls.TextView");
jQuery.sap.require("sap.ui.ino.views.backoffice.config.Util");
jQuery.sap.require("sap.ui.ino.models.core.InvalidationManager");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");

sap.ui.jsview("sap.ui.ino.views.backoffice.config.UrlWhitelistDetails", {

    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.config.UrlWhitelistDetails";
    },

    setRowContext : function(oBindingContext) {
        if (!oBindingContext) {
            return;
        }
        var iID = oBindingContext.getProperty("ID");

        var sKey = "StagingUrlWhitelist(" + iID + ")";
        sap.ui.ino.models.core.InvalidationManager.validateEntity(sKey);
        var sPath = "/" + sKey;
        this.bindElement(sPath);
    },

    createContent : function(oController) {
        var oPanel = new sap.ui.commons.Panel({
            showCollapseIcon : false,
            areaDesign : sap.ui.commons.enums.AreaDesign.Plain,
            borderDesign : sap.ui.commons.enums.BorderDesign.None,
            text : "{i18n>BO_URL_WHITELIST_DETAILS_HEADER}"
        });

        var oLayout = new sap.ui.commons.layout.MatrixLayout({
            layoutFixed : true,
            columns : 3,
            width : '100%',
            widths : ['33%', '33%', '34%']
        });

        var oRow = this.createUrlWhitelistDetailRow();
        oLayout.addRow(oRow);

        oPanel.addContent(oLayout);

        return oPanel;

    },

    createUrlWhitelistDetailRow : function() {
        var oRow = new sap.ui.commons.layout.MatrixLayoutRow();

        var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            vAlign : sap.ui.commons.layout.VAlign.Top,
            hAlign : sap.ui.commons.layout.HAlign.Begin
        });
        var oContent = this.createUrlWhitelistDetailLeft();
        oCell.addContent(oContent);
        oRow.addCell(oCell);

        oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            vAlign : sap.ui.commons.layout.VAlign.Top,
            hAlign : sap.ui.commons.layout.HAlign.Begin
        });
        oContent = this.createUrlWhitelistDetailMiddle();
        oCell.addContent(oContent);
        oRow.addCell(oCell);

        oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            vAlign : sap.ui.commons.layout.VAlign.Top,
            hAlign : sap.ui.commons.layout.HAlign.Begin
        });
        oContent = this.createUrlWhitelistDetailRight();
        oCell.addContent(oContent);
        oRow.addCell(oCell);

        return oRow;
    },

    createUrlWhitelistDetailLeft : function() {
        var oLayout = new sap.ui.commons.layout.MatrixLayout({
            layoutFixed : true,
            columns : 2,
            width : '100%',
            widths : ['120px', '80%']
        });

        var oLabel = new sap.ui.commons.Label({
            text : "{i18n>BO_URL_WHITELIST_FLD_TEXT}",
            design : sap.ui.commons.LabelDesign.Bold
        });

        var oText = new sap.ui.ino.controls.TextView({
            text : {
                path : "CODE",
                formatter : sap.ui.ino.views.backoffice.config.Util.formatPlainCode
            }
        });

        oLabel.setLabelFor(oText);

        oLayout.createRow(oLabel, oText);

        return oLayout;
    },

    createUrlWhitelistDetailMiddle : function() {
        var oLayout = new sap.ui.commons.layout.MatrixLayout({
            layoutFixed : true,
            columns : 2,
            width : '100%',
            widths : ['120px', '80%']
        });

        var oLabel = new sap.ui.commons.Label({
            text : "{i18n>BO_URL_WHITELIST_FLD_CREATED_AT}",
            design : sap.ui.commons.LabelDesign.Bold
        });

        var oText = new sap.ui.ino.controls.TextView({
            text : {
                path : "CREATED_AT",
                type : new sap.ui.model.type.Date()
            }
        });

        oLabel.setLabelFor(oText);

        oLayout.createRow(oLabel, oText);

        return oLayout;
    },

    createUrlWhitelistDetailRight : function() {
        var oLayout = new sap.ui.commons.layout.MatrixLayout({
            layoutFixed : true,
            columns : 2,
            width : '100%',
            widths : ['120px', '80%']
        });

        var oLabel = new sap.ui.commons.Label({
            text : "{i18n>BO_URL_WHITELIST_FLD_CREATED_BY}",
            design : sap.ui.commons.LabelDesign.Bold
        });

        var oLink = new sap.ui.commons.Link({
            text : "{CREATED_BY}",
            press : sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CREATED_BY_ID", "user")
        });

        oLabel.setLabelFor(oLink);

        oLayout.createRow(oLabel, oLink);

        return oLayout;
    }

});