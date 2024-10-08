/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.Hoverable");(function(){"use strict";sap.ui.core.Control.extend("sap.ino.wall.Hoverable",{metadata:{aggregations:{"content":{type:"sap.ui.core.Control",multiple:false}},events:{"enter":{},"leave":{}}}});sap.ino.wall.Hoverable.M_EVENTS={'enter':'enter','leave':'leave'};sap.ino.wall.Hoverable._TYPE_ENTER=0;sap.ino.wall.Hoverable._TYPE_LEAVE=1;sap.ino.wall.Hoverable.prototype.init=function(){this._iEventDelayTimerEnter=0;this._iEventDelayTimerLeave=0;this._blockEnter=false;};sap.ino.wall.Hoverable.prototype.exit=function(){this._iEventDelayTimerEnter=0;this._iEventDelayTimerLeave=0;this._blockEnter=false;};sap.ino.wall.Hoverable.prototype.onBeforeRendering=function(){var t=this,c=this.getContent(),o=c.onmouseover,O=c.onmouseout,f=c.ontouchstart,a=c.ontouchend;if(!this._initialized){if(sap.ui.Device.system.desktop){c.onmouseover=function(e){t._fireDelayedEnter(e);if(o){o.apply(this,arguments);}};c.onmouseout=function(e){t._fireDelayedLeave(e);if(O){O.apply(this,arguments);}};}else{c.ontouchstart=function(e){t._fireDelayedEnter(e);if(f){f.apply(this,arguments);}};c.ontouchend=function(e){t._fireDelayedLeave(e);if(a){a.apply(this,arguments);}};}this._initialized=true;}if(this.getContent().onBeforeRendering){this.getContent().onBeforeRendering.apply(this.getContent(),arguments);}};sap.ino.wall.Hoverable.prototype.onAfterRendering=function(){if(this.getContent().onAfterRendering){this.getContent().onAfterRendering.apply(this.getContent(),arguments);}};sap.ino.wall.Hoverable.prototype.rerender=function(){sap.ui.core.Control.prototype.rerender.apply(this.getContent(),arguments);};sap.ino.wall.Hoverable.prototype._fireDelayedEnter=function(e){var t=this;clearTimeout(this._iEventDelayTimerEnter);this._iEventDelayTimerEnter=setTimeout(function(){if(!t._blockEnter){t.fireEnter({event:e});t._blockEnter=true;}},100);};sap.ino.wall.Hoverable.prototype._fireDelayedLeave=function(e){var t=this;clearTimeout(this._iEventDelayTimerLeave);this._iEventDelayTimerLeave=setTimeout(function(){t.fireLeave({event:e});t._blockEnter=false;},100);};})();
