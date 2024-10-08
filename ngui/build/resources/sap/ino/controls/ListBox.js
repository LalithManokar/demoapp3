/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["sap/ui/commons/ListBox"],function(L){"use strict";return L.extend("sap.ino.controls.ListBox",{_handleUserActivationPlain:function(i,I){if(this.getAllowMultiSelect()){this._handleUserActivationCtrl(i,I);}else{L.prototype._handleUserActivationPlain.apply(this,[i,I]);}},renderer:"sap.ui.commons.ListBoxRenderer"});});
