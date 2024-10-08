/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["sap/m/VBox"],function(V){"use strict";var a=V.extend("sap.ino.controls.VBoxWithSubmitEvent",{metadata:{events:{submit:{}}},renderer:"sap.m.VBoxRenderer"});a.prototype.onkeydown=function(e){if(e.which===jQuery.sap.KeyCodes.ENTER){this.fireSubmit({});}};return a;});
