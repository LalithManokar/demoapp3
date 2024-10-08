/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["sap/ui/core/Control","sap/ui/layout/HorizontalLayout","sap/ui/core/Icon","sap/base/security/sanitizeHTML"],function(C,H,I,s){"use strict";var a=C.extend("sap.ino.controls.ColorRibbon",{metadata:{properties:{color:{type:"string"}}},renderer:function(r,c){r.write("<div");r.writeControlData(c);r.writeClasses();var b=s(c.getColor());if(b&&b.length===6){b="#"+b;}else{b="#FFFFFF";}r.addStyle("background-color",b);r.writeStyles();r.write("></div>");}});return a;});
