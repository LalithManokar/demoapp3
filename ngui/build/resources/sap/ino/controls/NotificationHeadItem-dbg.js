/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/unified/ShellHeadItem"
], function (ShellHeadItem) {
    "use strict";

    /**
     *
     * Specialized HeadShellItem to render Notification bubble
     *
     * <ul>
     * <li>Properties
     * <ul>
     * <li>notificationCount: number of Notifications. Displayed as number in the bubble</li>
     * </ul>
     * </li>
     * </ul>
     */
    return ShellHeadItem.extend("sap.ino.controls.NotificationHeadItem", {
        metadata: {
            properties: {
                notificationCount: {type: "string"}
            }
        },

        setNotificationCount : function(sCount) {
            if(sCount) {
                this.setProperty("notificationCount", sCount, true);
            }
            return this._refreshIcon();
        },

        _refreshIcon: function() {
            var oIcon = ShellHeadItem.prototype._refreshIcon.apply(this, arguments);
            var sCount = this.getNotificationCount();
            if(sCount === undefined) {
                return oIcon;
            }
            var iCount = parseInt(sCount, 10);
            if (jQuery("#notificationCount").length === 0 && iCount === 0) {
                return oIcon;
            }
            //Insert notificationCount elem if necessary
            if (jQuery("#notificationCount").length === 0 && iCount > 0) {
                this.$().append("<div id='notificationCount'/>");
            }
            if (iCount > 0) {
                jQuery("#notificationCount").addClass("sapInoNotificationCount");
                jQuery("#notificationCount").text(sCount);
            }
            else {
                jQuery("#notificationCount").remove();
            }
            return oIcon;
        }

    });
});