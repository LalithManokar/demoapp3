/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["sap/ui/unified/ShellHeadItem"],function(S){"use strict";return S.extend("sap.ino.controls.TitleHeadItem",{metadata:{properties:{text:{type:"string"}}},setText:function(t){if(t){this.setProperty("text",t,true);}this._refreshIcon();},_refreshIcon:function(){var t=this.getText();if(jQuery("#sapInoLogoTextInfo").length===0){this.$().append("<div tabindex='0' id='sapInoLogoTextInfo'/>");}this.$().removeAttr('tabindex');jQuery("#sapInoLogoTextInfo").addClass("sapInoLogoTextInfo");jQuery("#sapInoLogoTextInfo").text(t);}});});
