/*!
 * @copyright@
 */
sap.ui.define([
    "sap/m/SegmentedButtonItem"
], function(SegmentedButtonItem) {
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
	return SegmentedButtonItem.extend("sap.ino.controls.NoticeSegmentedButtonItem", {
		metadata: {
			properties: {
				displayNotice: {
					type: "boolean",
					default: false
				},
				textVisible: {
					type: "boolean",
					default: false
				}				
			}
		}

	});
});