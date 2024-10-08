sap.ui.define([
	"sap/m/ButtonType",
	"sap/m/Button",
	"sap/ui/core/IconPool",
	"sap/m/ToggleButton",
	"sap/ui/core/InvisibleText"
], function(ButtonType, Button, IconPool, ToggleButton, InvisibleText) {
	'use strict';
	return Button.extend("sap.ino.controls.Follow", {
		metadata: {
			properties: {
				"Id": {
					type: "int"
				},
				//follow id , campaign id,tag id or idea id
				"objectId": {
					type: "int"
				},
				"enabled": {
					type: "boolean"
				},
				// follow type,campaign,tag or idea 
				"type": {
					type: "string"
				},
				//indicator: follow or unfollow
				"value": {
					type: "float"
				},
				"tooltip": {
					type: "string"
				},
				"onlyIcon": {
					type: "boolean"
				},
				"styleType": {
					type: "string"
				},
				"visible": {
					type: "boolean"
				},
				"showType": {
					type: "string",
					defaultValue: "card"
				}
			},
			aggregations: {
				"_follow": {
					type: "sap.m.ToggleButton",
					multiple: false,
					visibility: "hidden"
				},
				"_followDescription": {
				    type: "sap.ui.core.InvisibleText",
				    multiple: false,
					visibility: "hidden"
					
				}
			},
			events: {
				follow: {}
			}
		},
		init: function() {
			this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.controls");
		},
		_onFollow: function() {
			var value = this.getProperty('value');
			var objectId = this.getProperty('objectId');
			var type = this.getProperty('type');

			this.setProperty('value', this.getProperty('value') ? 0 : 1);

			this.fireFollow({
				value: value,
				objectId: objectId,
				type: type
			});
		},
		_followButton: function() {
			var followButton = this.getAggregation("_follow");
			var self = this;
			var value = self.getProperty('value');
			var showType = self.getProperty('showType');
			var i18n = self.getModel("i18n").getResourceBundle();
			var tooltips = value ? 'UNFOLLOW_TOOLTIP_' + self.getProperty('type') : 'FOLLOW_TOOLTIP_' + self.getProperty('type');
			var text = value ? i18n.getText('FOLLOW_STATUS_FOLLOWING') : i18n.getText('FOLLOW_STATUS_FOLLOW');
			var icon = value ? IconPool.getIconURI('following', 'InoIcons') : IconPool.getIconURI('follow', 'InoIcons');
			if (followButton) {
				followButton.setText(text);
				followButton.setPressed(!!value);
				followButton.setEnabled(self.getProperty('enabled'));
				followButton.setVisible(self.getProperty('visible'));
				followButton.setTooltip(i18n.getText(tooltips));
				followButton.setIcon(icon);
			} else {
				followButton = new ToggleButton({
				    ariaDescribedBy:this._getFollowDescription(i18n.getText(tooltips)),
					text: text,
					icon: icon,
					enabled: this.getProperty("enabled"),
					visible: this.getProperty('visible'),
					press: function() {
						self._onFollow();
					},
					pressed: !!value,
				// 	styled: false,
					tooltip: i18n.getText(tooltips),
					type: ButtonType.Transparent
				});
				this.setAggregation("_follow", followButton, true);
			}
			if (value) {
				followButton.attachBrowserEvent('mouseenter focus', function() {
					followButton.setIcon(IconPool.getIconURI('unfollow', 'InoIcons'));
					followButton.$().removeClass('isHover').addClass('isHover');
					followButton.setText(i18n.getText('FOLLOW_STATUS_UNFOLLOW'));
					return false;
				});
				followButton.attachBrowserEvent('mouseleave blur', function() {
					followButton.setIcon(IconPool.getIconURI('following', 'InoIcons'));
					followButton.$().removeClass('isHover');
					followButton.setText(i18n.getText('FOLLOW_STATUS_FOLLOWING'));
					return false;
				});
			} else {
				followButton.$().removeClass('isHover');
				followButton.aBindParameters = [];
			}

			return followButton;
		},
		_followIcon: function() {
			var followIcon = this.getAggregation("_follow");
			var self = this;
			var value = self.getProperty('value');
			var showType = self.getProperty('showType');
			var i18nModel = self.getModel("i18n");
			var i18n;
			if (i18nModel) {
				i18n = i18nModel.getResourceBundle();
			}
			var tooltips = value ? 'UNFOLLOW_TOOLTIP_' + self.getProperty('type') : 'FOLLOW_TOOLTIP_' + self.getProperty('type');
			var icon = value ? IconPool.getIconURI('following', 'InoIcons') : IconPool.getIconURI('follow', 'InoIcons');
			if (followIcon) {
				followIcon.setPressed(!!value);
				followIcon.setEnabled(self.getProperty('enabled'));
				followIcon.setVisible(self.getProperty('visible'));
				followIcon.setTooltip(i18n ? i18n.getText(tooltips) : "");
				followIcon.setIcon(icon);
			} else {
				followIcon = new ToggleButton({
				    ariaDescribedBy:this._getFollowDescription(i18n ? i18n.getText(tooltips) : ""),
					enabled: this.getProperty("enabled"),
					visible: this.getProperty('visible'),
					icon: icon,
					press: function() {
						self._onFollow();
					},
					pressed: !!value,
				// 	styled: false,
					tooltip: i18n ? i18n.getText(tooltips) : "",
					type: ButtonType.Transparent
				});
				this.setAggregation("_follow", followIcon, true);
			}
			if (value) {
				followIcon.attachBrowserEvent('mouseenter focus', function() {
					followIcon.setIcon(IconPool.getIconURI('unfollow', 'InoIcons'));
					followIcon.$().removeClass('isHover').addClass('isHover');
					return false;
				});
				followIcon.attachBrowserEvent('mouseleave blur', function() {
					followIcon.setIcon(IconPool.getIconURI('following', 'InoIcons'));
					followIcon.$().removeClass('isHover');
					return false;
				});
			} else {
				followIcon.$().removeClass('isHover');
				followIcon.aBindParameters = [];
			}
			return followIcon;
		},
		
		_getFollowDescription: function(text){
            var oDescr = this.getAggregation("_followDescription");
			if (!oDescr) {
				oDescr = new InvisibleText({
					text: text
				});
				this.setAggregation("_followDescription", oDescr);
			}
			return oDescr;
        },
		
		renderer: function(oRM, oControl) {
			var followComponent, followStyle;
			var onlyIcon = oControl.getProperty('onlyIcon');
			var showType = oControl.getProperty('showType');
			var styleType = oControl.getProperty('styleType') ? oControl.getProperty('styleType') : '';
			var isActive = oControl.getProperty('value') ? 'isActive' : '';
			if (onlyIcon) {
				followComponent = oControl._followIcon();
				followStyle = 'sapFollowIcon';
			} else {
				followComponent = oControl._followButton();
				followStyle = 'sapFollowButton';
			}
if( showType === "card"){
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.addClass(followStyle);
			oRM.addClass(styleType);
			oRM.addClass(isActive);

			oRM.writeClasses();
// 			if (oControl.getTooltip_Text()) {
// 				oRM.writeAttributeEscaped("title", oControl.getTooltip());
// 			}
			
			
			
			oRM.write(">");

			if (followComponent) {
				// ATTN.: DO NOT SET THE TOOLTIP FOR THE STARCONTROL LIKE THIS, AS THIS CAUSES A RERENDERING OF THE WHOLE LIST
				//oVoteControl.setTooltip(oControl.getTooltip_Text());
				oRM.renderControl(followComponent);
				oRM.renderControl(oControl._getFollowDescription());
			}

			oRM.write("</div>");
}else if(showType === "list"){
    //oRM.writeControlData(oControl);
    	if (followComponent) {
				// ATTN.: DO NOT SET THE TOOLTIP FOR THE STARCONTROL LIKE THIS, AS THIS CAUSES A RERENDERING OF THE WHOLE LIST
				//oVoteControl.setTooltip(oControl.getTooltip_Text());
				oRM.renderControl(followComponent);
				oRM.renderControl(oControl._getFollowDescription());
			}
}
		}
	});

});