/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.WallItemVideoRenderer");

(function() {
    "use strict";

    jQuery.sap.require("sap.ino.wall.WallItemBaseRenderer");
    jQuery.sap.require("sap.ui.core.IconPool");
    jQuery.sap.require("sap.ino.wall.config.Config");

    /**
     * @class WallItemVideo renderer.
     * @static
     */
    sap.ino.wall.WallItemVideoRenderer = sap.ui.core.Renderer.extend(sap.ino.wall.WallItemBaseRenderer);

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     * 
     * @param {sap.ui.core.RenderManager}
     *            oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control}
     *            oControl an object representation of the control that should be rendered
     */

    sap.ino.wall.WallItemVideoRenderer.renderItem = function(oRM, oControl) {
        var oInputTitle, oBusyIndicator = oControl._getBusyIndicator(), oPreview = oControl._getImagePreview();

        // start wrapper
        oRM.write("<div class=\"flippable sapInoWallWIVideo\">");

        /* front panel (view) */

        // black solid border
        oRM.write("<div id=" + oControl.getId() + "-front");
        oRM.addClass("sapInoWallWIV");
        oRM.addClass("gradients");
        oRM.addClass("front");
        oRM.writeClasses();
        oRM.write(">");

        // black border
        oRM.write("<div id=" + oControl.getId() + "-frontOuterOuter");
        oRM.addClass("sapInoWallWIVOuterOuter");
        oRM.writeClasses();
        oRM.write(">");

        // black film dots
        oRM.write("<div id=" + oControl.getId() + "-frontOuter");
        oRM.addClass("sapInoWallWIVOuter");
        oRM.writeClasses();
        oRM.write(">");

        // black background and padding
        oRM.write("<div id=" + oControl.getId() + "-frontInner");
        oRM.addClass("sapInoWallWIVInner");
        oRM.writeClasses();
        oRM.write(">");

        // add busy state to preview
        if (oControl.getStatus() === "Busy") {
            oPreview.addStyleClass("sapInoWallImageBusy");
        }

        // image wrapper
        oRM.write('<div id="' + oControl.getId() + '-imagePreviewWrapper" style="min-height: 117px">');

        // image
        if (oPreview) {
            oRM.renderControl(oPreview.addStyleClass("noflip").attachTap(function(oEvent) {
                var oVideoDialog = null, oSegmentedButton;
    
                if (oControl._bMoving) {
                    return;
                }
    
                oSegmentedButton = new sap.m.SegmentedButton({
                    width : "100%",
                    buttons : [new sap.m.Button(oControl.getId() + "-buttonS", {
                        icon : "sap-icon://play",
                        width : "25%",
                        text : "S"
                    }), new sap.m.Button(oControl.getId() + "-buttonM", {
                        icon : "sap-icon://play",
                        width : "25%",
                        text : "M"
                    }), new sap.m.Button(oControl.getId() + "-buttonL", {
                        icon : "sap-icon://play",
                        width : "25%",
                        text : "L"
                    }), new sap.m.Button(oControl.getId() + "-buttonFS", {
                        icon : "sap-icon://full-screen",
                        width : "25%",
                        text : "FS"
                    })],
                    select : function(oEvent) {
                        var selectedId = oEvent.getParameter('id');
                        if (selectedId === oControl.getId() + "-buttonS") {
                            oVideoDialog.setStretch(false);
                            // TODO: don't know why this does not work but on HTML control calling $() method returns []
                            // oVideoDialog.getContent()[0].$().attr("width", "320").attr("height", "240");
                            oVideoDialog.$().find("iframe").attr("width", "320").attr("height", "240");
                        } else if (selectedId === oControl.getId() + "-buttonM") {
                            oVideoDialog.setStretch(false);
                            oVideoDialog.$().find("iframe").attr("width", "640").attr("height", "390");
                        } else if (selectedId === oControl.getId() + "-buttonL") {
                            oVideoDialog.setStretch(false);
                            oVideoDialog.$().find("iframe").attr("width", "845").attr("height", "480");
                        } else if (selectedId === oControl.getId() + "-buttonFS") {
                            oVideoDialog.setStretch(true);
                            // resize video after dialog has put itself to fullscreen size
                            setTimeout(function() {
                                oVideoDialog.$().find("iframe").attr("width", "100%").attr("height", oVideoDialog.$().find(".sapMDialogScroll").height());
                            }, 0);
                        }
                    }
                }).addStyleClass("sapInoWallWIVSizes");
                oSegmentedButton.setSelectedButton(oSegmentedButton.getButtons()[1]); // m
    
                // workaround to fix flickering caused by css measurement in SegmentedButton
                oSegmentedButton._fCalcBtnWidth = function() {
                    // do nothing here
                };
                oVideoDialog = new sap.m.Dialog({
                    stretch : sap.ui.Device.system.phone,
                    horizontalScrolling : false,
                    verticalScrolling : false,
                    afterOpen : function() {
                        // make video full-screen on phone
                        if (sap.ui.Device.system.phone) {
                            oVideoDialog.$().find("iframe").attr("width", "100%").attr("height", oVideoDialog.$().find(".sapMDialogSection").height());
                        }
                    },
                    customHeader : new sap.m.Bar({
                        contentLeft : [sap.ui.core.IconPool.createControlByURI({
                            src : "sap-icon://video"
                        }, sap.m.Image).addStyleClass("sapInoWallWIVDialogIcon"), new sap.m.Label({
                            text : oControl.getTitle(),
                        }).addStyleClass("sapInoWallWIVDialog")],
                        contentRight : new sap.m.Button({
                            icon : "sap-icon://decline",
                            press : function() {
                                oVideoDialog.close();
                                oVideoDialog.destroy();
                                oVideoDialog = null;
                                oSegmentedButton.destroy();
                                oSegmentedButton = null;
                            }
                        })
                    }),
                }).addStyleClass("sapInoWallWIVDialog");
    
                // only show size adjustments and scrollbars on tablet and desktop devices
                if (!sap.ui.Device.system.phone) {
                    oVideoDialog.setHorizontalScrolling(true);
                    oVideoDialog.setVerticalScrolling(true);
                    oVideoDialog.setSubHeader(new sap.m.Bar({
                        contentLeft : [oSegmentedButton]
                    }));
                }
    
                if (/youtu\.be/.test(oControl.getVideo())) {
                    // youtube short URL
                    var sVideoId = /youtu\.be\/(.*)/.exec(oControl.getVideo())[1];
                    oVideoDialog.addContent(new sap.ui.core.HTML({
                        content : '<iframe width="640" height="390" id="' + oControl.getId() + '-video" src="https://www.youtube.com/embed/' + sVideoId + '" frameborder="0" allowfullscreen></iframe>',
                        sanitizeContent : true
                    }));
                } else if (/www\.youtube\.com/.test(oControl.getVideo())) {
                    var sVideoId = /www.youtube.com\/watch\?v=(.*)/.exec(oControl.getVideo())[1];
                    oVideoDialog.addContent(new sap.ui.core.HTML({
                        content : '<iframe width="640" height="390" id="' + oControl.getId() + '-video" src="https://www.youtube.com/embed/' + sVideoId + '" frameborder="0" allowfullscreen></iframe>',
                        sanitizeContent : true
                    }));
                } else {
                    oVideoDialog.destroy();
                    return false;
                }
                oVideoDialog.open();
            }));
        }
        
        // wrapper end
        oRM.write("</div>");

        // render a busy indicator
        if (oControl.getStatus() !== "Busy") {
            oBusyIndicator.addStyleClass("sapInoWallInvisible");
        }
        oRM.renderControl(oBusyIndicator);

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // title
            oRM.write("<div class=\"sapInoWallWITitle sapInoWallWITitleText\">");
            oRM.writeEscaped(oControl.getTitle());
            oRM.write("</div>");
        } else {
            oRM.write("front");
        }

        oRM.write("</div>");
        oRM.write("</div>");
        oRM.write("</div>");
        oRM.write("</div>");

        /* back panel (edit) */

        oRM.write("<div id=" + oControl.getId() + "-back");
        oRM.addClass("sapInoWallWIV");
        oRM.addClass("gradients");
        oRM.addClass("back");
        oRM.writeClasses();
        oRM.write(">");

        // black film dots
        oRM.write("<div id=" + oControl.getId() + "-frontOuter");
        oRM.addClass("sapInoWallWIVOuter");
        oRM.writeClasses();
        oRM.write(">");

        // black background and padding
        oRM.write("<div id=" + oControl.getId() + "-frontInner");
        oRM.addClass("sapInoWallWIVInner");
        oRM.writeClasses();
        oRM.write(">");

        if (!sap.ino.wall.config.Config.getDebugPositioning()) {
            // title
            oRM.write("<div class=\"sapInoWallWITitleEdit\">");
            oInputTitle = oControl._getInputTitle().setProperty("placeholder", oControl._oRB.getText("WALL_ITEMVIDEO_PLACEHOLDER_TITLE"), true);
            oRM.renderControl(oInputTitle);
            oRM.write("</div>");

            // video URL
            oRM.write("<div class=\"sapInoWallWIVVideoEdit\">");
            oRM.renderControl(oControl._getInputVideo());
            oRM.write("</div>");
            oRM.write("<div class=\"sapInoWallWIVEdithint\">");
            oRM.write(oControl._oRB.getText("WALL_ITEMVIDEO_EDITHINT"));
            oRM.write("</div>");
        } else {
            oRM.write("back");
        }

        oRM.write("</div>");
        oRM.write("</div>");
        oRM.write("</div>");

        // back button
        oRM.renderControl(oControl._getButtonFlip());

        // end wrapper
        oRM.write("</div>");
    };

})();