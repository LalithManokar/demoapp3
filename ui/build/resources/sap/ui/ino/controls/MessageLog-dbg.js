/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.MessageLog");
(function() {
    "use strict";
    
    /**
     * 
     * A message log holding and displaying an array of messages in different groups.
     * 
     * <ul>
     * <li>Properties
     * <ul>
     * <li>messages: Array of all messages the log holds</li>
     * <li>groups: Array of groups. Only messages of these groups are displayed. If empty all messages are dsplayed.</li>
     * </ul>
     * </li>
     * </ul>
     */
    sap.ui.core.Control.extend("sap.ui.ino.controls.MessageLog", {
        metadata : {
            properties : {
                "messages" : "object[]",
                "groups" : "string[]",
                "limitHeight" : "sap.ui.ino.controls.MessageLog.LimitHeight"
            }
        },

        _getClassForLevel : function(sLevel) {
            switch (sLevel) {
                case sap.ui.core.MessageType.Error :
                    return 'sapUiInoMessageLogError';
                case sap.ui.core.MessageType.Information :
                    return 'sapUiInoMessageLogInformation';
                case sap.ui.core.MessageType.None :
                    return 'sapUiInoMessageLogNone';
                case sap.ui.core.MessageType.Success :
                    return 'sapUiInoMessageLogSuccess';
                case sap.ui.core.MessageType.Warning :
                    return 'sapUiInoMessageLogWarning';
                default :
                    return "";
            }
        },

        // messages are filtered by group, if no groups are set
        // all messages are displayed
        _getMessagesToDisplay : function() {
            var aGroups = this.getGroups();
            if (!aGroups) {
                return this.getMessages();
            }
            
            if ( this.getMessages() != null )
            {
                return jQuery.grep(this.getMessages(), function(oMessage) {
                    return (jQuery.inArray(oMessage.getGroup(), aGroups) >= 0);
                });
            }
            else {
                return [];
            }
        },

        renderer : function(oRm, oControl) {
            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.writeAttribute("role", "alert");
            oRm.addClass("sapUiInoMessageLog");
            
            var sLimit = oControl.getLimitHeight();
            if (sLimit) {
                oRm.addClass("sapUiInoMessageLogHeight" + sLimit);
            }

            var aMessages = oControl._getMessagesToDisplay() || [];

            if (aMessages.length <= 0) {
                oRm.addClass("sapUiInoMessageLogEmpty");
            }

            oRm.writeClasses();
            oRm.write(">");

            oRm.write("<ul>");
            for ( var i = 0; i < aMessages.length; i++) {
                oRm.write("<li");
                oRm.addClass(oControl._getClassForLevel(aMessages[i].getLevel()));
                oRm.writeClasses();
                oRm.write(">");

                oRm.writeEscaped(aMessages[i].getText());
                oRm.write("</li>");
            }

            oRm.write("</ul>");
            oRm.write("</div>");

        }
    });
    
    sap.ui.ino.controls.MessageLog.LimitHeight = {
        None : "",
        Small : "Small",
        Medium : "Medium",
        Large : "Lage"
    };

})();