/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.ColorPickerRenderer");(function(){"use strict";sap.ino.wall.ColorPickerRenderer={};sap.ino.wall.ColorPickerRenderer.render=function(r,c){r.write("<span");r.writeControlData(c);r.addClass("sapInoWallColorPicker");r.writeClasses();r.write(">");r.write("</span>");};})();
