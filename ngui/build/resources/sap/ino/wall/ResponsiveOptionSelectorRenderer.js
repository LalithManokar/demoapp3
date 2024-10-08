/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.ResponsiveOptionSelectorRenderer");(function(){"use strict";sap.ino.wall.ResponsiveOptionSelectorRenderer={};sap.ino.wall.ResponsiveOptionSelectorRenderer.render=function(r,c){r.write("<div");r.writeControlData(c);r.addClass("sapInoWallROS");r.writeClasses();r.write(">");if(c.getEditable()){if(c.getMode()==="Large"){r.renderControl(c._getSegmentedButton());}else if(c.getMode()==="Small"){r.renderControl(c._getSelect());}}else{r.renderControl(c._getLabel());}r.write("</div>");};})();
