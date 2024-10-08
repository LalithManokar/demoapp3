/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.Pos");(function(){"use strict";sap.ui.core.Element.extend("sap.ino.wall.Pos",{metadata:{properties:{"x":{type:"float",group:"Misc",defaultValue:-1},"y":{type:"float",group:"Misc",defaultValue:-1}}}});sap.ino.wall.Pos.prototype.floorify=function(){this.setX(Math.floor(this.getX()));this.setY(Math.floor(this.getY()));};})();
