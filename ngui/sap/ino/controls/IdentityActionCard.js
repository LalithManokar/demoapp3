/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ino/controls/IdentityCard",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/ToggleButton",
	"sap/m/ButtonType"
], function (Control,IdentityCard, Button, Text, ToggleButton, ButtonType) {
	"use strict";
	
	/**
     * 
     * A control that displays a User / Identity
     * 
     * <ul><li>Properties
     *   <ul>
     *     <li></li>
     *     <li></li>
     *     <li></li>
     *     <li></li>
     *   </ul></li>
     * <li>Aggregations
     *   <ul>
     *   </ul></li>
     * <li>Events
     *  <ul>
     *   </ul></li>
     * </ul>
     */
     
    var IdentityActionCard = IdentityCard.extend("sap.ino.controls.IdentityActionCard", {
        metadata: {
            properties: {
                userRole: {
                    type: "string"
                },
                actionable: {
                    type: "boolean"
                },
                mailable: {
                    type: "boolean"
                },
                pinnable: {
                    type: "boolean"
                },
                isAdd: {
                    type: "boolean"
                },
                isPinned: {
                    type: "boolean"
                }
            },
            events: {
                pinPressed: {},
                addRemovePressed: {},
                mailPressed: {}
            }
        },
        
        init: function() {
            IdentityCard.prototype.init.call(this, arguments);
            
            this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ino.controls");
            
            this.addStyleClass("sapInoIdentityBox sapUiTinyMarginBeginEnd sapUiTinyMarginTopBottom sapThemeBaseBG sapUiResponsiveContentPadding");
            
            this.addContent(new Text({text: "", visible: false, wrapping:true}));
            this.addAction(new ToggleButton({
                type: ButtonType.Transparent, icon: "sap-icon://pushpin-off", 
                visible: false, 
                press: this._firePinPressed.bind(this)
            }).addStyleClass("sapInoPinBtn"));
            this.addAction(new Button({
                type: ButtonType.Transparent, icon: "sap-icon://add",
                visible: false, press: 
                this._fireAddRemovePressed.bind(this)
            }).addStyleClass("sapInoIdentityAddRemoveBtn"));
            this.addAction(new Button({
                type: ButtonType.Transparent, icon: "sap-icon://email",
                visible: false, press: 
                this._fireMailPressed.bind(this)
            }));
        },
        
        setUserRole: function(sRole) {
            var oRoleText = this.getContent()[0];
            oRoleText.setText(sRole);
            oRoleText.setVisible(!!sRole);
            this.setProperty("userRole", sRole);
            return this;
        },
        
        setActionable: function(bIsActionable) {
            var oActionBtn = this.getActions()[1];
            oActionBtn.setVisible(bIsActionable);
            this.setProperty("actionable", bIsActionable);
            return this;
        },
        
        setMailable: function(bIsMailable) {
            var oActionBtn = this.getActions()[2];
            oActionBtn.setVisible(bIsMailable);
            this.setProperty("mailable", bIsMailable);
            return this;
        },
        
        setIsAdd: function(bIsAdd) {
            var oActionBtn = this.getActions()[1];
            oActionBtn.setIcon(bIsAdd ? "sap-icon://add" : "sap-icon://decline");
            oActionBtn.setTooltip(this._oRB.getText(bIsAdd ? "CTRL_IDENTITY_CARD_BTN_TOOLTIP_ADD" : "CTRL_IDENTITY_CARD_BTN_TOOLTIP_REMOVE"));
            this.setProperty("isAdd", bIsAdd);
            return this;
        },
        
        setPinnable: function(bIsPinnable) {
            var oPinBtn = this.getActions()[0];
            oPinBtn.setVisible(bIsPinnable);
            this.setProperty("pinnable", bIsPinnable);
            return this;
        },
        
        setIsPinned: function(bIsPinned) {
            var oPinBtn = this.getActions()[0];
            oPinBtn.setTooltip(this._oRB.getText(bIsPinned ? "CTRL_CLIPBOARD_BTN_TOOLTIP_PERSON_REMOVE" : "CTRL_CLIPBOARD_BTN_TOOLTIP_PERSON_ADD"));
            oPinBtn.setPressed(bIsPinned);
            this.setProperty("isPinned", bIsPinned);
            return this;
        },
        
        _firePinPressed: function(oEvent) {
            this.firePinPressed({
                identityId: this.getIdentityId(), 
                userName: this.getUserName(), 
                pinned: oEvent.getSource().getPressed()
            });
        }, 
        
        _fireAddRemovePressed: function(oEvent) {
            this.fireAddRemovePressed({
                identityId: this.getIdentityId(),
                userName: this.getUserName(),
                action: this.getIsAdd() ? "add" : "remove"
            });
        },
        
        _fireMailPressed: function(oEvent) {
            this.fireMailPressed({
                identityId: this.getIdentityId(),
                userName: this.getUserName()
            });
        }, 
        
        renderer : "sap.ino.controls.IdentityCardRenderer",
        

        onAfterRendering : function() {
            IdentityCard.prototype.onAfterRendering.call(this, arguments);
            this._initTabs();
        },
        
        /**
		 * @private
		 */
		_initTabs: function() {
			this._tabs = [];
			var that = this;
			if(this.getAggregation("_nameLink")){
			    this._tabs.push(this.getAggregation("_nameLink").$()[0].id);
			}
			this.getActions().forEach(function(item){
			    if(item.$().length > 0){
			        that._tabs.push(item.$()[0].id);
			    }
			});
		},
		/**
		 * @private
		 */
		_getTabs: function() {
			return this._tabs;
		},

		onkeydown: function(oEvent) {
			var aTabs = this._getTabs();
			var bForward = true;
			var fnUpdate = this._incr;

			if (oEvent.shiftKey || oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_UP || oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_LEFT) {
				fnUpdate = this._decr;
				bForward = false;
			}
	   //     //jump out from list		
    //         if(oEvent.shiftKey || oEvent.keyCode === jQuery.sap.KeyCodes.TAB){
    //             this.getParent().getParent().focus();
    //             oEvent.preventDefault();
				// oEvent.stopPropagation();
    //         }			

			if (oEvent.keyCode === jQuery.sap.KeyCodes.ESCAPE) {
				this.getParent().focus();
			} else if (oEvent.keyCode === jQuery.sap.KeyCodes.TAB ||
				oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_DOWN ||
				oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_RIGHT ||
				oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_UP ||
				oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_LEFT) {
				var iIdx = -1;
				if (document.activeElement) {
					iIdx = aTabs.indexOf(document.activeElement.id);
					if (iIdx === -1){
					    return;
					}
					if ( ( bForward && iIdx < aTabs.length - 1) || (!bForward && iIdx > 0 )){
						iIdx = fnUpdate(iIdx, aTabs.length - 1);
						this._focus(jQuery("#" + aTabs[iIdx]));
						oEvent.preventDefault();
						oEvent.stopPropagation();
					}
				} 
			}
		},

		/**
		 * @private
		 */
		_incr: function(iVal, iMax) {
			iVal++;
			if (iVal > iMax) {
				return 0;
			}
			return iVal;
		},

		/**
		 * @private
		 */
		_decr: function(iVal, iMax) {
			iVal--;
			if (iVal < 0) {
				return iMax;
			}
			return iVal;
		},

		/**
		 * @private
		 */
		_focus: function(oElement) {
			if (jQuery.type(oElement.focus) === "function") {
				setTimeout(function() {
					oElement.focus();
				}, 0);
			}
		}
        
    });
    
	return IdentityActionCard;
});
