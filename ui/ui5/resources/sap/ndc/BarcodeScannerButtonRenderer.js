/*!
 * SAPUI5
 * (c) Copyright 2009-2022 SAP SE. All rights reserved.
 */
sap.ui.define([],function(){"use strict";var B={};B.render=function(r,c){if(!c.getVisible()){return;}r.write("<span");r.writeControlData(c);r.addStyle("display","inline-block");r.addStyle("width",c.getWidth());r.writeStyles();r.write(">");r.renderControl(c.getAggregation("_btn"));r.write("</span>");};return B;},true);
