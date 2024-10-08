/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */ 
jQuery.sap.declare("sap.ui.ino.controls.ProcessIndicator");
(function() {
    "use strict";

    /**
     * 
     * Control displaying the current status of a process.
     * 
     * <ul>
     * <li>Properties
     * <ul>
     * <li>processSteps: Total number of process steps</li>
     * <li>currentStep: Currently active process step</li>
     * <li>width: Desired width of the control</li>
     * <li>height: Desired height of the control</li>
     * <li>processRunning: If true, the displayed process is active and running</li>
     * <li>style: The display style of the process</li>
     * <li>tooltip: Text used to describe the process</li>
     * </ul>
     * </ul>
     */
    sap.ui.core.Control.extend("sap.ui.ino.controls.ProcessIndicator", {
        metadata : {
            properties : {
                processSteps : {
                    type : "int",
                    defaultValue : 6
                },
                currentStep : {
                    type : "int",
                    defaultValue : 1
                },
                width : {
                    type : "int",
                    defaultValue : 160
                },
                height : {
                    type : "int",
                    defaultValue : 15
                },
                processRunning : {
                    type : "boolean",
                    defaultValue : true
                },
                style : {
                    type : "string",
                    defaultValue : "bubbles"
                },
                tooltip : {
                    type : "string",
                    defaultValue : ""
                },
                count : {
                    type : "object",
                    defaultValue : undefined
                },
                progressIndicatorActive : {
                    type : "string",
                    defaultValue : "sapUiProcessIndicatorActive"
                },
                progressIndicatorInactive : {
                    type : "string",
                    defaultValue : "sapUiProcessIndicatorInactive"
                },
                progressIndicatorStopped : {
                    type : "string",
                    defaultValue : "sapUiProcessIndicatorStopped"
                }
            }
        },

        init : function() {
            if (sap.ui.core.Control.prototype.init) {
                sap.ui.core.Control.prototype.init.apply(this, arguments);
            }
        },

        renderer : function(oRm, oControl) {
            var steps = oControl.getProcessSteps();
            var current = oControl.getCurrentStep();
            var running = oControl.getProcessRunning();
            var aCount = oControl.getCount();

            var height = oControl.getHeight();
            var width = oControl.getWidth();

            var diameter = height;
            var lineWidth = width;

            var startY = diameter / 2;
            var startX = diameter / 2;

            var spacer = 15;
            if(aCount) {
                diameter = height - 20;
                lineWidth = width - spacer * 2 - diameter;
                startX = diameter / 2 + spacer;
                startY = diameter / 2;
            } 

            var lineHeight = diameter / 2.5;

            var stepX = 0;
            
            if (oControl.getStyle() != "bubbles") {
                lineHeight = diameter;
                startX = 25;
            }
            
            if (steps >= 2) {
                if(aCount) {
                    stepX = lineWidth / (steps - 1);
                } else {
                    stepX = (lineWidth - startX*2) / (steps - 1);
                }
            }
            
            var progressLineWidth = ((current < 0) ? 0 : current * stepX);

            if (current >= steps) {
                progressLineWidth = lineWidth;
            }

            function line(x, y, width, height, styleClass) {
                var startY = y - height / 2;

                oRm.write("<rect x='" + x + "' y='" + startY + "' width='" + width
                        + "px' height='" + height + "px'");
                oRm.addClass(styleClass);
                oRm.writeClasses();
                oRm.write("/>");
            }

            function circle(x, y, radius, styleClass) {
                oRm.write("<circle cx='" + x + "' cy='" + y + "' r='" + radius
                        + "'");
                oRm.addClass(styleClass);
                oRm.writeClasses();
                oRm.write("/>");
            }

            function text(x, y, text, styleClass) {
                oRm.write("<text x='" + x + "' y='" + y + "'");
                oRm.write(">");
                oRm.write(text);
                oRm.write("</text>");
            }
            
            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.addStyle("width", width + "px");
            oRm.addStyle("height", height + "px");
            oRm.addStyle("overflow", "hidden");
            oRm.writeStyles();
            oRm.writeClasses();
            if (oControl.getTooltip()) {
            	oRm.write(" title = '" + oControl.getTooltip() + ": " + (oControl.getCurrentStep() + 1) + "/" + oControl.getProcessSteps() + "'");
            }
            oRm.write(">");
            
            // accessibility: can be read w/ VPC
            oRm.write("<span style=\"position:absolute;clip:rect(1px,1px,1px,1px)\">" + oControl.getTooltip() + ": " + (oControl.getCurrentStep() + 1) + "/" + oControl.getProcessSteps() + "</span>");
            
            oRm.write("<svg");
            oRm.writeAttribute("focusable", "false"); // required by IE
            oRm.addStyle("width", width + "px");
            oRm.addStyle("height", height + "px");
            oRm.writeStyles();
            oRm.writeClasses();
            oRm.write(">");

            var cl = oControl.getProgressIndicatorActive();
            if (!running) {
                cl = oControl.getProgressIndicatorStopped();
            }

            if (steps > 1) {
                line(startX, startY, progressLineWidth, lineHeight, cl);
                if(aCount) {
                    line(startX + progressLineWidth, startY, lineWidth - progressLineWidth, lineHeight,
                            oControl.getProgressIndicatorInactive());
                } else {
                    line(startX + progressLineWidth, startY, lineWidth - progressLineWidth - diameter, lineHeight,
                            oControl.getProgressIndicatorInactive());
                }
            }

            if (oControl.getStyle() == "bubbles") {
                for ( var i = 0; i < steps; i++) {

                    var x = i * stepX + startX;

                    var c = cl;
                    if (i > current) {
                        c = oControl.getProgressIndicatorInactive();
                    }

                    circle(x, startY, diameter / 2, c);

                    if(aCount) {
                    	// limit to one digit behind comma
                    	var val = aCount[i] * 10;
                    	val = Math.round(val);
                    	val = val / 10;
                    	
                    	// TODO : enable translation here but be aware of the limited available width 
                        if(val < 10) {
                            x = x-3;
                        } else if(val < 100) {
                            x = x-7;
                        } else if(val < 1000) {
                            x = x-11;
                        } else if(val < 5000) {
                        	val = ">1K";
                            x = x-11;
                        } else if(val < 10000) {
                        	val = ">5K";
                            x = x-11;
                        } else if(val < 1000000) {
                        	val = ">10K";
                            x = x-15;
                        } else {
                        	val = ">1M";
                            x = x-11;
                        }

                        var y = startY + diameter + 10;
                        text(x, y, val);
                    }
                }
            }

            oRm.write("</script>");

            oRm.write("</svg>");
            oRm.write("</div>");

        },

        onBeforeRendering : function() {

        },

        onAfterRendering : function() {
        },

        onclick : function(evt) {
        }
    });
})();