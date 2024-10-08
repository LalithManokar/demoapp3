/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.controls.TextView");
jQuery.sap.require("sap.ui.ino.models.core.InvalidationManager");
jQuery.sap.require("sap.ui.ino.application.backoffice.ControlFactory");

sap.ui.jsview("sap.ui.ino.views.backoffice.tag.TagListDetails", {

    getControllerName : function() {
        return "sap.ui.ino.views.backoffice.tag.TagListDetails";
    },

    setRowContext : function(oBindingContext) {
        if (!oBindingContext) {
            return;
        }
        var sId = oBindingContext.getProperty("ID");

        var sKey = "Tags(" + sId + ")";
        sap.ui.ino.models.core.InvalidationManager.validateEntity(sKey);
        var sPath = "/" + sKey;
        this.bindElement(sPath);
    },

    createContent : function(oController) {
        var oPanel = new sap.ui.commons.Panel({
            showCollapseIcon : false,
            areaDesign : sap.ui.commons.enums.AreaDesign.Plain,
            borderDesign : sap.ui.commons.enums.BorderDesign.None,
            text : "{i18n>BO_TAG_LIST_DETAILS_HEADER}"
        }).addStyleClass("sapUiInoTagListDetail");

        var oLayout = new sap.ui.commons.layout.MatrixLayout({
            layoutFixed : true,
            columns : 3,
            width : '100%',
            widths : ['33%', '33%', '34%']
        });

        var oRow = this.createTagDetailRow();
        oLayout.addRow(oRow);

        oPanel.addContent(oLayout);

        return oPanel;

    },

    createTagDetailRow : function() {
        var oRow = new sap.ui.commons.layout.MatrixLayoutRow();

        var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            vAlign : sap.ui.commons.layout.VAlign.Top,
            hAlign : sap.ui.commons.layout.HAlign.Begin
        });
        var oContent = this.createTagDetailLeft();
        oCell.addContent(oContent);
        oRow.addCell(oCell);

        oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            vAlign : sap.ui.commons.layout.VAlign.Top,
            hAlign : sap.ui.commons.layout.HAlign.Begin
        });
        oContent = this.createTagDetailMiddle();
        oCell.addContent(oContent);
        oRow.addCell(oCell);

        oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            vAlign : sap.ui.commons.layout.VAlign.Top,
            hAlign : sap.ui.commons.layout.HAlign.Begin
        });
        oContent = this.createTagDetailRight();
        oCell.addContent(oContent);
        oRow.addCell(oCell);

        return oRow;
    },

    createTagDetailLeft : function() {
        var oLayout = new sap.ui.commons.layout.MatrixLayout({
            layoutFixed : true,
            columns : 2,
            width : '100%',
            widths : ['120px', '80%']
        });

        var oLabel = new sap.ui.commons.Label({
            text : "{i18n>BO_TAG_FLD_TEXT}",
            design : sap.ui.commons.LabelDesign.Bold
        });

        var oText = new sap.ui.ino.controls.TextView({
            text : {
                path : "NAME"
            }
        });

        oLabel.setLabelFor(oText);

        oLayout.createRow(oLabel, oText);

        return oLayout;
    },

    createTagDetailMiddle : function() {
        var oLayout = new sap.ui.commons.layout.MatrixLayout({
            layoutFixed : true,
            columns : 2,
            width : '100%',
            widths : ['120px', '80%']
        });

        var oLabel = new sap.ui.commons.Label({
            text : "{i18n>BO_TAG_FLD_CREATED_AT}",
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

    createTagDetailRight : function() {
        var oLayout = new sap.ui.commons.layout.MatrixLayout({
            layoutFixed : true,
            columns : 2,
            width : '100%',
            widths : ['120px', '80%']
        });

        var oLabel = new sap.ui.commons.Label({
            text : "{i18n>BO_TAG_FLD_CREATED_BY}",
            design : sap.ui.commons.LabelDesign.Bold
        });

        var oLink = new sap.ui.commons.Link({
            text : "{CREATED_BY}",
            press : sap.ui.ino.application.backoffice.ControlFactory.getOpenIdentityHandler("CREATED_BY_ID", "user")
        });

        oLabel.setLabelFor(oLink);

        oLayout.createRow(oLabel, oLink);

        return oLayout;
    },

});