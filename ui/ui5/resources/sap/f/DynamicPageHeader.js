/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./library","sap/ui/Device","sap/ui/core/Control","sap/m/ToggleButton","sap/m/Button","./DynamicPageHeaderRenderer"],function(l,D,C,T,B,a){"use strict";var b=C.extend("sap.f.DynamicPageHeader",{metadata:{library:"sap.f",properties:{pinnable:{type:"boolean",group:"Appearance",defaultValue:true},backgroundDesign:{type:"sap.m.BackgroundDesign",group:"Appearance"}},defaultAggregation:"content",aggregations:{content:{type:"sap.ui.core.Control",multiple:true},_pinButton:{type:"sap.m.Button",multiple:false,visibility:"hidden"},_collapseButton:{type:"sap.m.Button",multiple:false,visibility:"hidden"}},designtime:"sap/f/designtime/DynamicPageHeader.designtime"}});b._getResourceBundle=function(){return sap.ui.getCore().getLibraryResourceBundle("sap.f");};b.ARIA={ARIA_CONTROLS:"aria-controls",ARIA_LABEL:"aria-label",LABEL_EXPANDED:b._getResourceBundle().getText("EXPANDED_HEADER"),LABEL_COLLAPSED:b._getResourceBundle().getText("SNAPPED_HEADER"),LABEL_PINNED:b._getResourceBundle().getText("PIN_HEADER"),LABEL_UNPINNED:b._getResourceBundle().getText("UNPIN_HEADER"),TOOLTIP_COLLAPSE_BUTTON:b._getResourceBundle().getText("COLLAPSE_HEADER_BUTTON_TOOLTIP"),STATE_TRUE:"true",STATE_FALSE:"false"};b.prototype.init=function(){this._bShowCollapseButton=true;};b.prototype.onAfterRendering=function(){this._initARIAState();this._initPinButtonARIAState();};b.prototype._togglePinButton=function(v){this._getPinButton().setPressed(v);};b.prototype._setShowPinBtn=function(v){this._getPinButton().$().toggleClass("sapUiHidden",!v);};b.prototype._pinUnpinFireEvent=function(){this.fireEvent("_pinUnpinPress");};b.prototype._onCollapseButtonPress=function(){this.fireEvent("_headerVisualIndicatorPress");};b.prototype._onCollapseButtonMouseOver=function(){this.fireEvent("_visualIndicatorMouseOver");};b.prototype._onCollapseButtonMouseOut=function(){this.fireEvent("_visualIndicatorMouseOut");};b.prototype._initARIAState=function(){var $=this.$();$.attr(b.ARIA.ARIA_LABEL,b.ARIA.LABEL_EXPANDED);};b.prototype._initPinButtonARIAState=function(){var $;if(this.getPinnable()){$=this._getPinButtonJQueryRef();$.attr(b.ARIA.ARIA_CONTROLS,this.getId());}};b.prototype._updateARIAState=function(e){var $=this.$();if(e){$.attr(b.ARIA.ARIA_LABEL,b.ARIA.LABEL_EXPANDED);}else{$.attr(b.ARIA.ARIA_LABEL,b.ARIA.LABEL_COLLAPSED);}};b.prototype._updateARIAPinButtonState=function(p){var P=this._getPinButton();if(p){P.setTooltip(b.ARIA.LABEL_UNPINNED);}else{P.setTooltip(b.ARIA.LABEL_PINNED);}};b.prototype._getPinButton=function(){if(!this.getAggregation("_pinButton")){var p=new T({id:this.getId()+"-pinBtn",icon:"sap-icon://pushpin-off",tooltip:b.ARIA.LABEL_PINNED,press:this._pinUnpinFireEvent.bind(this)}).addStyleClass("sapFDynamicPageHeaderPinButton");this.setAggregation("_pinButton",p,true);}return this.getAggregation("_pinButton");};b.prototype._getCollapseButton=function(){if(!this.getAggregation("_collapseButton")){var c=new B({id:this.getId()+"-collapseBtn",icon:"sap-icon://slim-arrow-up",press:this._onCollapseButtonPress.bind(this),tooltip:b.ARIA.TOOLTIP_COLLAPSE_BUTTON}).addStyleClass("sapFDynamicPageToggleHeaderIndicator");c.onmouseover=this._onCollapseButtonMouseOver.bind(this);c.onmouseout=this._onCollapseButtonMouseOut.bind(this);this.setAggregation("_collapseButton",c,true);}return this.getAggregation("_collapseButton");};b.prototype._toggleCollapseButton=function(t){this._setShowCollapseButton(t);this._getCollapseButton().$().toggleClass("sapUiHidden",!t);};b.prototype._getShowCollapseButton=function(){return this._bShowCollapseButton&&!!this.getContent().length;};b.prototype._setShowCollapseButton=function(v){this._bShowCollapseButton=!!v;};b.prototype._focusCollapseButton=function(){this._getCollapseButton().$().focus();};b.prototype._focusPinButton=function(){this._getPinButtonJQueryRef().focus();};b.prototype._getPinButtonJQueryRef=function(){return this._getPinButton().$();};b.prototype._getState=function(){var c=this.getContent(),h=c.length>0,H=this.getPinnable()&&h&&!D.system.phone,p=this._getPinButton(),o=this._getCollapseButton();o.toggleStyleClass("sapUiHidden",!this._getShowCollapseButton());return{content:c,headerHasContent:h,headerPinnable:H,hasContent:c.length>0,pinButton:p,collapseButton:o};};return b;});
