/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */

sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ino/commons/application/Configuration"
], function(JSONModel, Configuration) {

    var NOTIFICATION_SERVICE_ENDPOINT = Configuration.getBackendRootURL() + "/sap/ino/xs/rest/common/notification_messages.xsjs";
    var NOTIFICATION_TIMEOUT = 300000;

    return JSONModel.extend("sap.ino.commons.models.misc.Notifications", {

        constructor : function(bPollingActivated) {
            JSONModel.apply(this, []);
            this.bPollingActivated = bPollingActivated;
            this.setTimer();
        },

        setTimer : function() {
            if(!this.bPollingActivated) {
                return;
            }
            if(this._oTimer) {
                clearInterval(this._oTimer);
            }
            this._oTimer = setInterval(this.updateNotificationCount.bind(this), NOTIFICATION_TIMEOUT);
        },

        updateNotificationCount : function() {
            this.loadData(NOTIFICATION_SERVICE_ENDPOINT, "countOnly=true", true, "GET", true);
        },

        updateNotifications : function() {
            this.loadData(NOTIFICATION_SERVICE_ENDPOINT);
            this.setTimer();
        },

        markNotificationsAsRead : function(iLatestNotificationId) {
            this.setProperty("/NOTIFICATION_COUNT", "0");
            this.setProperty("/NOTIFICATIONS", null);
            jQuery.sap.require("sap.ino.commons.models.object.Notification");
            var Notification = sap.ino.commons.models.object.Notification;
            return Notification.readAllNotifications(iLatestNotificationId);
        },

        markNotificationAsRead : function(iNotificationId) {
            var iCount = this.getProperty("/NOTIFICATION_COUNT");
            iCount--;
            this.setProperty("/NOTIFICATION_COUNT", iCount);
            jQuery.sap.require("sap.ino.commons.models.object.Notification");
            var Notification = sap.ino.commons.models.object.Notification;
            return Notification.readNotification(iNotificationId);
        }
    });
});