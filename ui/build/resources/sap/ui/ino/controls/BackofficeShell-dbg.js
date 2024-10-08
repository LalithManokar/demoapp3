/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.BackofficeShell");

(function() {
    // "use strict";

    jQuery.sap.require("sap.ui.ux3.Shell");
    jQuery.sap.require("sap.ui.ino.controls.BackofficeShellHeader");
    jQuery.sap.require("sap.ui.ino.application.ApplicationBase");

    /**
     * A shell is a component that has a header that contains a title and a content. The tile has a default size of
     * 318px * 126px and needs to be included in a TileBrowser control.
     * 
     * <ul>
     * <li>Properties
     * <ul>
     * <li>objectId: Id of the object that is visualized by this tile. Needed to rearrange tiles on the screen</li>
     * <li>headerTitle: Title of the tile.</li>
     * <li>headerColor: Color code of the tile header</li>
     * <li>headerMetadata: Object that is thrown when a click on the tile header is performed</li>
     * <li>tileMetadata: Object that is thrown when a click on the tile is performed</li>
     * </ul>
     * </li>
     * <li>Aggregations
     * <ul>
     * <li>content: Control containing the content of the tile</li>
     * </ul>
     * <li>Events
     * <ul>
     * <li>headerClicked: The event is thrown when the header is clicked and a headerMetadata object is available.</li>
     * <li>tileClicked: The event is thrown when a click on the tile is performed. The event contains the tileMetadata
     * object.</li>
     * <li>tileDeleted: Event is thrown when the delete button is pressed. The TileContainer has to be set to edit mode
     * before.</li>
     * </ul>
     * </li>
     * </ul>
     */

    sap.ui.ux3.Shell.extend("sap.ui.ino.controls.BackofficeShell", {
        metadata : {
            properties : {
                headerHomeTitle : "string",
                settingsBtnTooltipText: "string"
            },
            events : {
                campaignSettingsPressed : {},
            }
        },
        constructor : function() {
            sap.ui.ux3.Shell.apply(this, arguments);
            this.initCustomHeaderElements();
        },

        initCustomHeaderElements : function() {
            this.oHeaderSettingsBtn = new sap.ui.commons.Button({
                icon : "sap-icon://action-settings",
            }).addStyleClass("sapUiInoBOShellHeaderSettingsBtn");
            
            this.oHomeBtn = new sap.ui.commons.Button({
                icon : "sap-icon://home",
                press : [this, this.homeBtnPressed, this]
            }).addStyleClass("sapUiInoBOShellHeaderHomeBtn").addStyleClass("sapUiInoBOShellHeaderHomeText")
            
            

            this.oHeaderElement = new sap.ui.ino.controls.BackofficeShellHeader("sapUiInoBOShellHeaderLayoutId", {
                colorCode : "{COLOR_CODE}",
                campaignId : "{ID}",
                content : [this.oHomeBtn, new sap.ui.commons.TextView({
                    text : "{SHORT_NAME}",
                }).addStyleClass("sapUiInoBOShellHeaderText"), this.oHeaderSettingsBtn],
                visible : false
            }).addStyleClass("sapUiInoBOShellHeaderLayout");
            this.oHeaderSettingsBtn.attachPress(this.oHeaderElement, this.oHeaderElement.settingsBtnPressed, this.oHeaderElement);
            this.getHeaderItems()[0].insertContent(this.oHeaderElement, 0);
        },

        homeBtnPressed : function(oEvent) {
            sap.ui.ino.application.ApplicationBase.getApplication().navigateHome();
        },

        bindHeaderElement : function(bVisible, sBindingPath) {

            if (bVisible && sBindingPath) {
                this.oHeaderElement.bindElement(sBindingPath);
                this.oHeaderElement.setVisible(true);
                this.oHomeBtn.setText(this.getHeaderHomeTitle());
                this.oHeaderSettingsBtn.setTooltip(this.getSettingsBtnTooltipText());

                this.addStyleClass("sapUiInoTopShell");
            } else {
                this.removeStyleClass("sapUiInoTopShell");
                this.$().parents("body").css("background-image", "");
                this.oHeaderElement.setVisible(false);
                this.oHomeBtn.setText("");
                this.oHeaderSettingsBtn.setTooltip("");
                this.oHeaderElement.updateHeaderColor();
            }
        },

        renderer : "sap.ui.ux3.ShellRenderer"
    })
})();