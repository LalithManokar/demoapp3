/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.ScrollableToolbarRenderer");(function(){"use strict";sap.ino.wall.ScrollableToolbarRenderer={};sap.ino.wall.ScrollableToolbarRenderer.render=function(r,c){var i=c.getContent();if(!c.getVisible()){return;}r.write("<div ");r.addClass("sapInoWallScrollableToolbar");r.addClass("sapInoWallScrollableToolbar"+c.getOrientation());if(c._scrollable){r.addClass("sapInoWallScrollableToolbarScrollable");if(!c._bPreviousScrollForward){r.addClass("sapInoWallScrollableToolbarNoScrollForward");}if(!c._bPreviousScrollBack){r.addClass("sapInoWallScrollableToolbarNoScrollBack");}}else{r.addClass("sapInoWallScrollableToolbarNotScrollable");}r.writeControlData(c);r.writeClasses();r.write(">");r.renderControl(c._getScrollingArrow(c.getOrientation()==="Horizontal"?"left":"up"));if(c._bDoScroll){r.write("<div id='"+c.getId()+"-scrollContainer' class='sapInoWallScrollableToolbarScrollContainer'>");}r.write("<div id='"+c.getId()+"-head'");r.addClass("sapInoWallScrollableToolbarInner");r.writeClasses();r.write(">");jQuery.each(i,function(I,o){if(!o.getVisible()){return;}r.renderControl(o);});r.write("</div>");if(c._bDoScroll){r.write("</div>");}r.renderControl(c._getScrollingArrow(c.getOrientation()==="Horizontal"?"right":"down"));r.write("</div>");};})();
