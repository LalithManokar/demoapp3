/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["sap/m/List"],function(L){"use strict";return L.extend("sap.ino.controls.WrappingList",{metadata:{properties:{wrapping:{type:"boolean",defaultValue:false},overwirteOnkeydown:{type:"boolean",defaultValue:true}}},init:function(){var t=this;L.prototype.init.apply(this,arguments);this.addEventDelegate({onAfterRendering:function(){var w=t.getWrapping();var T=t.$();T.addClass("sapInoWrappingList");if(w){T.removeClass("sapInoWrappingListNoWrap");T.addClass("sapInoWrappingListWrap");}else{T.removeClass("sapInoWrappingListWrap");T.addClass("sapInoWrappingListNoWrap");}}});},setNavigationItems:function(){this.getItemNavigation().setTableMode(!this.getWrapping());L.prototype.setNavigationItems.apply(this,arguments);},_isRendered:function(){if(this._bIsInDOM===undefined||this._bIsInDOM===0){this._bIsInDOM=jQuery.sap.byId(this.getId()).length;}return this._bIsInDOM;},setWrapping:function(w){if(this.getWrapping()!==w){this.setProperty("wrapping",w,true);if(this._isRendered()){var t=this.$();if(w){t.removeClass("sapInoWrappingListNoWrap");t.addClass("sapInoWrappingListWrap");}else{t.removeClass("sapInoWrappingListWrap");t.addClass("sapInoWrappingListNoWrap");}}}return this;},onkeydown:function(e){if(!this.getWrapping()||!this.getOverwirteOnkeydown()){return;}var c=this.$();var n;var C;var d=false;var i=false;var a=this.$().find("[tabindex!=-1]:focusable");if(a&&a.length>0){if(a[a.length-1]===e.target){i=true;}}if(!i&&e.keyCode===jQuery.sap.KeyCodes.TAB){if(e.shiftKey){do{n=c.prev();if(n&&n.length>0){C=n.find("[tabindex!=-1]:focusable");if(C&&C.length>0){this._focus(jQuery(C[C.length-1]));d=true;break;}if(n.attr("tabindex")!=="-1"&&n.is(":focusable")){this._focus(n);d=true;break;}}n=c.parent();c=n;}while(n&&n.length>0);}else{var l=jQuery(a[a.length-1]);n=l.next();do{if(n&&n.length>0){if(n.attr("tabindex")!=="-1"&&n.is(":focusable")){this._focus(n);d=true;break;}C=n.find("[tabindex!=-1]:focusable");if(C&&C.length>0){this._focus(jQuery(C[0]));d=true;break;}l=n;}else{l=l.parent();}n=l.next();while(n.length===0&&l.parent().length>0){l=l.parent();n=l.next();}}while(n&&n.length>0);}if(!d){this._focus(jQuery("html").find("[tabindex!=-1]:focusable")[0]);}e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();}else{L.prototype.onkeydown.apply(this,arguments);}},_focus:function(e){if(e&&jQuery.type(e.focus)==="function"){setTimeout(function(){e.focus();},10);}},renderer:"sap.m.ListRenderer"});});
