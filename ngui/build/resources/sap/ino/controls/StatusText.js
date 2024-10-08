/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["sap/m/TextRenderer","sap/m/Text"],function(T,a){"use strict";var S=a.extend("sap.ino.controls.StatusText",{metadata:{properties:{statusColor:{type:"string"}}},renderer:T,onAfterRendering:function(){var s=this.getProperty("statusColor");if(s&&s.length===6){s="#"+s;}else{s="#333333";}if(this.getDomRef()){$(this.getDomRef()).css("color",s);}}});return S;});
