/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.require("sap.ui.ino.models.object.UserSettings");
jQuery.sap.require("sap.ui.ino.application.ApplicationBase");
jQuery.sap.require("sap.ui.ino.controls.BusyIndicator");
jQuery.sap.require("sap.ui.ino.application.WebAnalytics");
/*jQuery.sap.require("sap.ui.ino.application.Configuration");
var Configuration = sap.ui.ino.application.Configuration;*/

sap.ui.controller("sap.ui.ino.views.common.UserSettings", {
    onInit : function() {
        this.getView().bindElement("/LogonUser(1)");

        var oLanguageItem = new sap.ui.core.ListItem({
            key : "{LOCALE}",
            text : {
                parts: [{path: "DEFAULT_TEXT"}, {path: "CODE"}],
                formatter: function(sDefaultText, sCode) {
                    var sText = this.getText(sCode);
                    if (sText === sCode || sText === "") {
                        return sDefaultText;
                    }
                    return sText;
                }
            }
        });

        var oLanguageDropdown = sap.ui.getCore().byId(this.getView().createId("languagedropdown"));
        oLanguageDropdown.bindAggregation("items", {
            path : "/Locale",
            template : oLanguageItem
        });

        var oApplication = sap.ui.ino.application.ApplicationBase.getApplication();
        var oUser = new sap.ui.ino.models.object.UserSettings(oApplication.getCurrentUserId(), {
            continuousUse : true,
            actions : ["updateUserLocale"]
        });

        this.sCurrentTracking = oUser.getProperty("/Settings/TRACKING");
        this.sCurrentTheme =  oUser.getProperty("/Settings/THEME");
        this.sCurrentLocale = oUser.getProperty("/Settings/LOCALE");

        this.getView().setModel(oUser, "write");
    },

    onCancel : function() {
        var oContainer = this.getView().getViewData().container;
        if (oContainer.isOpen()) {
            oContainer.close();
            // that.focus();
        }
        this.getView().getModel("write").revertChanges();
    },

    onSave : function() {
        var that = this;
        var oView = this.getView();

        var oContainer = oView.getViewData().container;
        if (oContainer.isOpen()) {
            oContainer.close();
            // that.focus();
        }

        function _save() {
            sap.ui.ino.controls.BusyIndicator.show(0);

            var oModel = oView.getModel("write");
            var oCore = sap.ui.getCore();
            var oLanguageDropdown = oCore.byId(oView.createId("languagedropdown"));
            var oNotificationMail = oCore.byId(oView.createId("mailNotificationCheckbox"));
            var oHighContrast = oCore.byId(oView.createId("highContrastCheckbox"));
            
            /*var oTracking = oCore.byId(oView.createId("trackingCheckbox"));
            var sTrackingValue = oModel.getProperty("/Settings/TRACKING");
            if(navigator.doNotTrack !== "1") {
                sTrackingValue = oTracking.getChecked() ? sap.ui.ino.application.ApplicationBase.DO_NOT_TRACK : sap.ui.ino.application.ApplicationBase.TRACK;
            }*/

            oModel.updateUserSettings([{
                SECTION : "locale",
                KEY : "locale",
                VALUE : oLanguageDropdown.getSelectedKey()
            }, 
            // {
            //     SECTION : "notification",
            //     KEY : "mail",
            //     VALUE : oNotificationMail.getChecked() ? sap.ui.ino.application.ApplicationBase.MAIL_ACTIVE : sap.ui.ino.application.ApplicationBase.MAIL_INACTIVE
            // }, 
            {
                SECTION : "ui",
                KEY : "theme",
                VALUE : oHighContrast.getChecked() ? sap.ui.ino.application.ApplicationBase.THEME_HIGHCONTRAST : sap.ui.ino.application.ApplicationBase.THEME_DEFAULT
            }/*, {
                SECTION : "usage_reporting",
                KEY : "tracking",
                VALUE : sTrackingValue
            }*/]);

            var oRequest = oModel.update(oLanguageDropdown.getSelectedKey());
            oRequest.always(function() {
                sap.ui.ino.controls.BusyIndicator.hide();
                // that.focus();

                /* Chrome scrollbar bug */
                // our combination of a permanent scrollbar at the body and no at the html tag causes
                // chrome sometimes to render 2 scrollbars, this bug cannot resolved by simply refreshing the
                // overflow attribute but requires to remove and add the css class that sets this attribute
                jQuery("body").removeClass("sapUiBody");
                setTimeout(function() {
                    jQuery("body").addClass("sapUiBody");

                    /*if(this.sCurrentTracking !== sap.ui.ino.application.ApplicationBase.DO_NOT_TRACK &&
                        oTracking.getChecked()) {
                        that.sCurrentTracking = oModel.getProperty("/Settings/TRACKING");
                        sap.ui.ino.application.WebAnalytics.stop();
                    } else if (this.sCurrentTracking === sap.ui.ino.application.ApplicationBase.DO_NOT_TRACK &&
                        !oTracking.getChecked()) {
                        that.sCurrentTracking = oModel.getProperty("/Settings/TRACKING");
                        sap.ui.ino.application.WebAnalytics.start(Configuration);
                    }*/

                    if (((this.sCurrentTheme === sap.ui.ino.application.ApplicationBase.THEME_HIGHCONTRAST && !oHighContrast.getChecked()) ||
                            (this.sCurrentTheme !== sap.ui.ino.application.ApplicationBase.THEME_HIGHCONTRAST && oHighContrast.getChecked())) ||
                        (this.sCurrentLocale !== oLanguageDropdown.getSelectedKey()))    {
                        that.sCurrentTheme =  oModel.getProperty("/Settings/THEME");
                        that.sCurrentLocale = oModel.getProperty("/Settings/LOCALE");
                        that.openRestartDialog();
                    }
                }, 500);
            });
        }

        var oPromise = oView.oUserImageFileUploader.crop();
        if (!oPromise) {
            _save();
        } else {
            oPromise.done(_save);
        }
    },

    openRestartDialog : function() {
        var oDialog;

        var oNowButton = new sap.ui.commons.Button({
            text : "{i18n>CTRL_USERSETTINGSCTRL_BUT_RESTART_NOW}",
            press : function() {
                location.reload();
                oDialog.close();
            }
        });

        oDialog = new sap.ui.commons.Dialog({
            title : "{i18n>CTRL_USERSETTINGSCTRL_TIT_SETTINGS_RESTART}",
            modal : true,
            resizable : false,
            content : [new sap.ui.layout.VerticalLayout({
                content : [new sap.ui.commons.TextView({
                    text : "{i18n>CTRL_USERSETTINGSCTRL_EXP_SETTINGS_RESTART}"
                })]
            })],
            buttons : [oNowButton, new sap.ui.commons.Button({
                text : "{i18n>CTRL_USERSETTINGSCTRL_BUT_RESTART_LATER}",
                press : function() {
                    oDialog.close();
                }
            })],
            defaultButton : oNowButton
        });

        oDialog.open();
    },

    getText : function(sTextKey, aParameter) {
        if (this.i18n === null) {
            this.i18n = sap.ui.getCore().getModel("i18n").getResourceBundle();
        }
        return this.i18n.getText(sTextKey, aParameter);
    },
    onPressValidationIcon: function()
    {
        
    }
});