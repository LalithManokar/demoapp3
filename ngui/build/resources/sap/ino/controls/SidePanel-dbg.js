/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/layout/HorizontalLayout",
    "sap/ui/core/Icon",
	"sap/base/security/sanitizeHTML"
], function(Control, HorizontalLayout, Icon, sanitizeHTML) {
    "use strict";

    /**
     * 
     * An side panel
     * 
     * <ul>
     * <li>Properties
     * <ul>
     * <li>openerSide: Side the opener is displayed</li>
     * <li>openerPosition: Position of the opener</li>
     * <li>openerIcon: Icon content of the opener</li>
     * <li>expanded: State if opener is expanded or collapsed</li>
     * <li>openerTooltipShow: Tooltip of opener in collapsed state</li>
     * <li>openerTooltipHide: Tooltip of opener in expanded state</li>
     * </ul>
     * </li>
     * <li>Aggregations
     * <ul>
     * <li>content: Content of the side panel</li>
     * <li>_openerIcon: Opener icon</li>
     * <li>_panel: Side panel</li>
     * </ul>
     * </li>
     * <li>Events
     * <ul>
     * </ul>
     * </li>
     * </ul>
     */

    var Orientation = {
        LEFT : 0,
        RIGHT : 1
    };

    var SidePanel = Control.extend("sap.ino.controls.SidePanel", {
        metadata : {
            properties : {
                openerSide : {
                    type : "int",
                    defaultValue : Orientation.RIGHT
                },
                openerPosition : { // 0% - begin, 100% - end
                    type : "sap.ui.core.CSSSize",
                    defaultValue : "10%"
                },
                openerIcon : {
                    type : "sap.ui.core.URI",
                    defaultValue : "sap-icon://settings"
                },
                expanded : {
                    type : "boolean",
                    defaultValue : false
                },
                openerTooltipShow : {
                    type : "string",
                    defaultValue : undefined
                },
                openerTooltipHide : {
                    type : "string",
                    defaultValue : undefined
                },
                showOpener : {
                    type: "boolean",
                    defaultValue : true
                },
                showBorder : {
                    type: "boolean",
                    defaultValue : true
                },
                width : {
                    type : "string"
                }
            },
            aggregations : {
                content : {
                    type : "sap.ui.core.Control",
                    multiple : false
                },
                _openerIcon : {
                    type : "sap.ui.core.Icon",
                    multiple : false,
                    visibility : "hidden"
                },
                _panel : {
                    type : "sap.ui.core.Control",
                    multiple : false,
                    visibility : "hidden"
                }
            }, 
            events : {
                changed : {}
            }
        },

        getOpenerIconControl : function() {
            var oOpenerIcon = this.getAggregation("_openerIcon");
            if (!oOpenerIcon) {
                oOpenerIcon = new Icon({
                    src : this.getOpenerIcon()
                });
                this.setAggregation("_openerIcon", oOpenerIcon, true);
            }
            return oOpenerIcon;
        },

        getPanel : function() {
            var oSidePanel = this.getAggregation("_panel");
            if (!oSidePanel) {
                oSidePanel = new HorizontalLayout();
                this.setAggregation("_panel", oSidePanel, true);
            }
            return oSidePanel;
        },

        constructor : function() {
            Control.apply(this, arguments);
            var oContent = this.getContent();
            if (oContent) {
                this.getPanel().addContent(oContent);
            }
        },

        exit : function() {
            var sOpenerId = this.getId() + "-opener";
            jQuery("#" + sOpenerId).off();
        },
        
        open : function() {
            if (this.getExpanded()) {
                return;
            }
            this.toggle();
        },
        
        close : function() {
            if (!this.getExpanded()) {
                return;
            }
            this.toggle();
        },

        toggle : function() {
            var that = this;
            var sAddStyle = that.getExpanded() ? "sapInoSidePanelCollapsed" : "sapInoSidePanelExpanded";
            var sRemoveStyle = that.getExpanded() ? "sapInoSidePanelExpanded" : "sapInoSidePanelCollapsed";

            jQuery("#" + that.getId()).addClass(sAddStyle);
            jQuery("#" + that.getId()).removeClass(sRemoveStyle);

            jQuery("#" + that.getId() + "-content").addClass(sAddStyle + "Content");
            jQuery("#" + that.getId() + "-content").removeClass(sRemoveStyle + "Content");

            jQuery("#" + that.getId() + "-content").attr("aria-expanded", !that.getExpanded());

            if (that.getExpanded()) {
                jQuery("#" + that.getId() + "-opener").attr("title", that.getOpenerTooltipShow() || "");
            } else {
                jQuery("#" + that.getId() + "-opener").attr("title", that.getOpenerTooltipHide() || "");
            }

            that.setProperty("expanded", !that.getExpanded(), true);
            that.fireChanged({"expanded" : that.getExpanded()});
        },
        
        onAfterRendering : function() {
            var that = this;
            var sOpenerId = this.getId() + "-opener";
            var sContentId = this.getId() + "-content";

            jQuery("#" + sOpenerId).off();

            var fnOpenerAction = function(oEvent) {
                if (oEvent.originalEvent && oEvent.originalEvent.keyCode === jQuery.sap.KeyCodes.TAB) {
                    return;
                }
                that.toggle();
            };

            jQuery("#" + sOpenerId).on("click", fnOpenerAction);
            jQuery("#" + sOpenerId).on("keypress", fnOpenerAction);
        },

        renderer : function(oRm, oControl) {
            var sControlStyle = ((oControl.getOpenerSide() === 0) ? "sapInoSidePanelLeft" : "sapInoSidePanelRight");
            var sContentStyle = ((oControl.getOpenerSide() === 0) ? "sapInoSidePanelContentLeft" : "sapInoSidePanelContentRight");
            var sOpenerStyle = ((oControl.getOpenerSide() === 0) ? "sapInoSidePanelOpenerLeft" : "sapInoSidePanelOpenerRight");
            var sExpandedStyle = ((oControl.getExpanded()) ? "sapInoSidePanelExpanded" : "sapInoSidePanelCollapsed");

            oRm.write('<div');
            oRm.writeControlData(oControl);
            oRm.addClass(sControlStyle);
            oRm.addClass(sExpandedStyle);
            oRm.writeClasses();
            if(oControl.getWidth()) {
                oRm.addStyle("width", sanitizeHTML(oControl.getWidth()));
                oRm.writeStyles();
            }
            oRm.write(">");

            // opener
            if(oControl.getShowOpener()) {
                oRm.write('<div id="' + sanitizeHTML(oControl.getId()) + '-opener" tabindex="0" aria-controls="' + sanitizeHTML(oControl.getId()) + '-content" role="button"');
                if (oControl.getExpanded()) {
                    oRm.writeAttributeEscaped("title", oControl.getOpenerTooltipHide() || "");
                } else {
                    oRm.writeAttributeEscaped("title", oControl.getOpenerTooltipShow() || "");
                }
                oRm.addClass(sOpenerStyle);
                oRm.writeClasses();
                oRm.write(">");
                var oOpenerIcon = oControl.getOpenerIconControl();
                oRm.renderControl(oOpenerIcon);
                oRm.write("</div>");
            }

            // content
            oRm.write('<div id="' + sanitizeHTML(oControl.getId()) + '-content" aria-expanded="' + sanitizeHTML(oControl.getExpanded()) + '" role="region"');
            oRm.addClass(sContentStyle);
            oRm.addClass(sExpandedStyle + "Content");
            oRm.writeClasses();
            if(!oControl.getShowBorder()) {
                oRm.addStyle("border", 0);
                oRm.writeStyles();
            }
            oRm.write(">");
            var oPanel = oControl.getPanel();
            oRm.renderControl(oPanel);
            oRm.write("</div>");

            oRm.write("</div>");
        }
    });

    SidePanel.Orientation = Orientation;

    return SidePanel;
});