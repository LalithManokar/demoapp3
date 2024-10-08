/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.WallItemLineRenderer");(function(){"use strict";jQuery.sap.require("sap.ino.wall.WallItemBaseRenderer");jQuery.sap.require("sap.ui.core.IconPool");jQuery.sap.require("sap.ino.wall.config.Config");sap.ino.wall.WallItemLineRenderer=sap.ui.core.Renderer.extend(sap.ino.wall.WallItemBaseRenderer);sap.ino.wall.WallItemLineRenderer.render=function(r,c){r.write("<div");r.writeControlData(c);r.writeAttribute("tabindex","-1");r.addClass("sapInoWallWIB");r.addClass("sapInoWallWILine"+c.getOrientation());if(c.getFlipped()){r.addClass("flipped");}r.writeClasses();r.writeAttribute("style","left: "+(c.getOrientation()==="HORIZONTAL"?"0px":c.getX())+"; top: "+(c.getOrientation()==="HORIZONTAL"?c.getY():"0px")+"; z-index:"+c.getDepth());r.write(">");if(this.renderItem){this.renderItem(r,c);}if(sap.ino.wall.config.Config.getDebugPositioning()){r.write('<div class="sapInoWallWIBIntersectionBox"></div>');r.write('<div class="sapInoWallWIBNeighbourBox" style="padding: '+sap.ino.wall.config.Config.getWallCollisionThreshold()+'px; left: -'+sap.ino.wall.config.Config.getWallCollisionThreshold()+'px; top: -'+sap.ino.wall.config.Config.getWallCollisionThreshold()+'px"></div>');}r.write("</div>");};sap.ino.wall.WallItemLineRenderer.renderItem=function(r,c){var i=c.getId(),b=c.getStyle();var d=13-parseInt(c.getThickness()/2);var D=(c.getOrientation()==="VERTICAL")?"width":"height";r.write("<div class=\"flippable\">");r.write("<div id="+c.getId()+"-front");r.addClass("sapInoWallWILine");r.addClass("sapInoWallWILine"+c.getOrientation());r.addClass("sapInoWallWILine"+b);r.addClass("front");r.writeClasses();r.write(">");if(!sap.ino.wall.config.Config.getDebugPositioning()){r.write("<div class=\"sapInoWallWILineFirst\" style=\""+D+": "+d+"px; border-width: ");r.writeEscaped(c.getThickness().toString());r.write("px; border-color: ");r.writeEscaped(c.getColor());r.write("; border-"+(c.getOrientation()==="HORIZONTAL"?"bottom":"right")+"-style: ");r.writeEscaped(b.toLowerCase());r.write("\">");r.write("</div>");r.write("<div class=\"sapInoWallWILineSecond\" style=\""+D+": "+d+"px;\">");r.write("</div>");}else{r.write("front");}r.write("</div>");r.write("<div id="+c.getId()+"-back");r.addClass("sapInoWallWILine");r.addClass("sapInoWallWILine"+c.getOrientation());r.addClass("sapInoWallWILine"+b);r.addClass("back");r.writeClasses();r.write(">");if(!sap.ino.wall.config.Config.getDebugPositioning()){r.write("<div class=\"sapInoWallWILineFirst\" style=\""+D+": "+d+"px; border-width: ");r.writeEscaped(c.getThickness().toString());r.write("px; border-color: ");r.writeEscaped(c.getColor());r.write("; border-"+(c.getOrientation()==="HORIZONTAL"?"bottom":"right")+"-style: ");r.writeEscaped(b.toLowerCase());r.write("\">");r.write("</div>");r.write("<div class=\"sapInoWallWILineSecond\" style=\""+D+": "+d+"px;\">");r.write("</div>");var B=c.$().find(".sapInoWallWILineEditButtons");var s="";if(B){s=B.attr("style");}r.write("<div id=\""+i+"-editButtons\" style=\""+s+"\" class=\"sapInoWallWILineEditButtons\">");r.renderControl(c._getButtonOrientationH());r.renderControl(c._getButtonOrientationV());r.renderControl(c._getButtonStyleSolid());r.renderControl(c._getButtonStyleDashed());r.renderControl(c._getButtonStyleDotted());r.renderControl(c._getButtonThickness1px());r.renderControl(c._getButtonThickness3px());r.renderControl(c._getButtonThickness5px());r.renderControl(c._getButtonColorSelector());r.renderControl(c._getButtonFlip().setIcon("sap-icon://undo").removeStyleClass("sapInoWallWIFlipBackButton").addStyleClass("sapInoWallWILineButton"));r.write("</div>");}else{r.write("front");}r.write("</div>");r.write("</div>");};})();
