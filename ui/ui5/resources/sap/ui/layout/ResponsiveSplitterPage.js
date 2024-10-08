/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./library","sap/ui/core/Core","sap/ui/core/Control"],function(l,C,a){"use strict";var R=a.extend("sap.ui.layout.ResponsiveSplitterPage",{metadata:{library:"sap.ui.layout",associations:{content:{type:"sap.ui.core.Control",multiple:false,singularName:"content"}}},getContent:function(){return C.byId(this.getAssociation("content"));},renderer:function(r,c){r.write("<div");r.addClass("sapUiResponsiveSplitterPage");r.writeControlData(c);r.writeClasses();r.write(">");var b=c.getContent();if(b){r.renderControl(b);}r.write("</div>");}});R.prototype.containsControl=function(c){var o=C.byId(this.getAssociation("content"));if(!o){return false;}if(o.isA("sap.ui.layout.AssociativeSplitter")){return o.containsControl(c);}return o.getId()===c;};return R;});
