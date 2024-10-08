/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Core","sap/ui/core/ValueStateSupport","sap/ui/core/library","sap/ui/Device"],function(C,V,c,D){"use strict";var a=c.ValueState;var R={apiVersion:2};R.render=function(r,o){this.addWOuterDivStyles(r,o);this.addInnerDivStyles(r,o);this.renderSvg(r,o);this.renderInput(r,o);this.closeDiv(r);r.renderControl(o._oLabel);this.renderTooltip(r,o);this.closeDiv(r);};R.addWOuterDivStyles=function(r,o){var i=o.getId(),e=o.getEnabled(),n=!o.getProperty("editableParent"),N=!o.getEditable()||n,v=o.getValueState();r.openStart("div",o).class("sapMRb");if(o.getUseEntireWidth()){r.style("width",o.getWidth());}var t=this.getTooltipText(o);if(t){r.attr("title",t);}r.accessibilityState(o,{role:"radio",readonly:null,selected:null,checked:o.getSelected(),disabled:N?true:undefined,labelledby:{value:i+"-label",append:true},describedby:{value:(t?i+"-Descr":undefined),append:true}});if(o.getSelected()){r.class("sapMRbSel");}if(!e){r.class("sapMRbDis");}if(N){r.class("sapMRbRo");}if(v===a.Error){r.class("sapMRbErr");}if(v===a.Warning){r.class("sapMRbWarn");}if(v===a.Success){r.class("sapMRbSucc");}if(v===a.Information){r.class("sapMRbInfo");}if(e){r.attr("tabindex",o.hasOwnProperty("_iTabIndex")?o._iTabIndex:0);}r.openEnd();};R.addInnerDivStyles=function(r,o){r.openStart("div").class("sapMRbB");if(!this.isButtonReadOnly(o)&&D.system.desktop){r.class("sapMRbHoverable");}r.openEnd();};R.renderSvg=function(r,o){r.openStart("svg").attr("xmlns","http://www.w3.org/2000/svg").attr("version","1.0").accessibilityState({role:"presentation"}).class("sapMRbSvg").openEnd();r.openStart("circle",o.getId()+"-Button").attr("stroke","black").attr("r","50%").attr("stroke-width","2").attr("fill","none").class("sapMRbBOut").openEnd().close("circle");r.openStart("circle").attr("r","22%").attr("stroke-width","10").class("sapMRbBInn").openEnd().close("circle");r.close("svg");};R.renderInput=function(r,o){r.voidStart("input",o.getId()+"-RB").attr("type","radio").attr("tabindex","-1").attr("name",o.getGroupName());if(o.getSelected()){r.attr("checked","checked");}if(this.isButtonReadOnly(o)){r.attr("readonly","readonly");r.attr("disabled","disabled");}r.voidEnd();};R.renderTooltip=function(r,o){var t=this.getTooltipText(o);if(t&&C.getConfiguration().getAccessibility()){r.openStart("span",o.getId()+"-Descr").style("display","none").openEnd().text(t).close("span");}};R.isButtonReadOnly=function(r){var e=r.getEnabled(),n=!r.getProperty("editableParent"),N=!r.getEditable()||n;return!e||N;};R.closeDiv=function(r){r.close("div");};R.getTooltipText=function(r){var v=r.getProperty("valueStateText"),t=r.getTooltip_AsString();if(v){return(t?t+" - ":"")+v;}else{return V.enrichTooltip(r,t);}};return R;},true);
