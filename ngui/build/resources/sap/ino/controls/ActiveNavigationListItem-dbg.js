/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/tnt/NavigationListItem",
    "sap/m/Button",
	"sap/m/ButtonType",
	"sap/ui/core/RenderManager"
], function (NavigationListItem, Button, ButtonType, RenderManager)  {
	"use strict";
	
    /**
     * Works like sap.tnt.NavigationListItem. An additional button will be shown on the right side of the control.
     * 
     * <ul>
     * <li>Properties>
     * <ul>
     * buttonIcon: icon that will be rendered for th button
     * </ul>
     * </li>
     * <li>Events
     * <ul>
     * press: user has hit the button placed on the list item
     * </ul>
     * </li>
     * </ul>
     * 
     * @see sap.tnt.NavigationListItem
     */
    
    var ActiveNavigationListItem = NavigationListItem.extend("sap.ino.controls.ActiveNavigationListItem", {
        metadata : {
            properties : {
                selected : {
                    type : "boolean",
                    defaultValue : false
                },
                visible : {
                    type : "boolean",
                    defaultValue : true
                },
                buttonIcon : {
                    type : "sap.ui.core.URI"
                },
                buttonTooltip : {
                    type : "string",
                    defaultValue: ""
                }
            },
            aggregations : {
                _button : {
                    type : "sap.m.Button",
                    multiple : false,
                    visibility : "hidden"
                }
            },
            events : {
                press : {}
            }
        }
    });
    
    ActiveNavigationListItem.prototype.render = function (oRm, oControl) {
        //is the list expanded?
        // if(!this.getVisible()) {
        //     return;
        // }

        var that = this;
        var aItems = this.getAggregation("items");
        if(oControl.getExpanded() && (!aItems || aItems.length === 0) && this.getButtonIcon()) {
            var oNLIRenderManager = new RenderManager();
            if (NavigationListItem.prototype.render) {
                NavigationListItem.prototype.render.apply(this, [oNLIRenderManager, oControl]);
            }
            
            var sHTML = oNLIRenderManager.aBuffer.join("");
            var oButton = this.getAggregation("_button");
            if(!oButton) {
                oButton = new Button({
                    icon: this.getButtonIcon(),
                    type: ButtonType.Transparent,
                    tooltip: this.getTooltip()
                });
                jQuery(oButton)[0].attachPress(that, function(oEvent) {
                    oEvent.cancelBubble();
                    var oParams = {
                        item: that
                    };
                    that.firePress(oParams);
                });
                oButton.addStyleClass("sapInoActiveNavigationListItemButton");
                // fix add new object to clipboard 
                //this.setAggregation("_button", oButton);
            }
    
            var oButtonHTML = oNLIRenderManager.getHTML(oButton);
            var oHTML = jQuery(sHTML);
            oHTML.append(oButtonHTML);
            oHTML.addClass("sapInoActiveNavigationListItem");
            if(this.getText() !== ''){
                oRm.unsafeHtml(oHTML.outerHTML());
            }
        } else {
            if (NavigationListItem.prototype.render) {
                NavigationListItem.prototype.render.apply(this, [oRm, oControl]);
            }
        }
        setTimeout(function() {
            if(that.getSelected()) {
                that._inoSelect();
            } else {
                that._inoUnselect();
            }
        }, 0);
    };
    
    ActiveNavigationListItem.prototype._inoSelect = function () {
		var $this = this.$(),
			navList = this.getNavigationList();
		if (!navList) {
		    return;
		}
        if(!$this.hasClass('sapInoNavLIItemSelected')) {
		    $this.addClass('sapInoNavLIItemSelected');
        }
        
        
    };
    
    ActiveNavigationListItem.prototype._inoUnselect = function () {
		var $this = this.$(),
			navList = this.getNavigationList();
	
		if (!navList) {
			return;
		}        
		if($this.hasClass('sapInoNavLIItemSelected')) {
            $this.removeClass('sapInoNavLIItemSelected');
        }
    };
    
    return ActiveNavigationListItem;
});