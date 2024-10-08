sap.ui.define([
	"sap/m/ButtonType",
	"sap/ui/core/Control",
	"sap/ui/core/IconPool",
	"sap/m/ToggleButton"
], function(ButtonType, Control, IconPool, ToggleButton) {
    'use strict';
    
    return Control.extend("sap.ino.controls.IdeaVolunteer", {
        metadata: {
            properties: {
                "key": {
                    type: "int" 
                },
                "ideaId": {
                    type: "int"
                },
                "value": {
                    type: "boolean"
                },
                "onlyIcon": {
                    type: "boolean"
                },
                "tooltip": {
                    type: "string"
                },
                "visible": {
                    type: "boolean" 
                },
                "enabled": {
					type: "boolean"
				},
                "styleClass": {
                    type: "string"
                }
            },
            aggregations: {
                "_volunteer": {
                    type: "sap.m.ToggleButton",
                    multiple: false,
                    visibility: "hidden"
                }
            },
            events: {
                volunteer: {}
            }
        },
        init: function () {
            this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.controls");
        },
        _onVolunteer: function() {
            var bValue = this.getProperty("value");
            var iIdeaId = this.getProperty("ideaId");
            var iKey = this.getProperty("key");
            
            this.setProperty("value", !bValue);
            
            this.fireVolunteer({
                Key: iKey,
                Value: bValue,
                IdeaId: iIdeaId
            });
        },
        _getIcon: function() {
            var self = this;
            var oVolunteer = this.getAggregation("_volunteer");
            var oIcon = IconPool.getIconURI('raise_hand', 'InoIcons');
            var i18n = this.getModel("i18n").getResourceBundle();
            var bValue = this.getProperty("value");
            var sToolTip = bValue ? i18n.getText("LEAVE_VOLUNTEERS") : i18n.getText("ADD_VOLUNTEERS");
            
            if (!oVolunteer) {
                oVolunteer = new ToggleButton({
                    icon: oIcon,
                    visible: this.getProperty('visible'),
                    enabled: this.getProperty("enabled"),
                    pressed: bValue,
                    tooltip: sToolTip,
                    type: "Transparent",
                    // styled: false,
                    press: function() {
                        self._onVolunteer();
                    }
                });
                this.setAggregation("_volunteer", oVolunteer, true);
            } else {
                oVolunteer.setPressed(bValue);
                oVolunteer.setVisible(this.getProperty("visible"));
                oVolunteer.setEnabled(this.getProperty('enabled'));
                oVolunteer.setTooltip(sToolTip);
                oVolunteer.setIcon(oIcon);
            }
            
            return oVolunteer;
        },
        renderer: function (oRM, oControl) {
            var oVolunteer = oControl._getIcon();
            var isActive = oControl.getProperty('value') ? 'isActive' : '';
            
            oRM.write("<div");
            oRM.writeControlData(oControl);
            oRM.addClass(jQuery.sap.encodeHTML(oControl.getProperty('styleClass')));
            oRM.addClass(isActive);
            oRM.writeClasses();
            if (oControl.getTooltip_Text()) {
			    oRM.writeAttributeEscaped("title", oControl.getTooltip());
			}
			oRM.write(">");
			
			oRM.renderControl(oVolunteer);
			
			oRM.write("</div>");
        }
    });
});