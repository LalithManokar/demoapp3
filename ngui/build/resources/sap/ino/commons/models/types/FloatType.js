/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["sap/ui/model/type/Float","sap/ui/model/ParseException"],function(F,P){"use strict";return F.extend("sap.ino.commons.models.types.FloatType",{formatValue:function(v,i){return F.prototype.formatValue.apply(this,[v,i]);},parseValue:function(v,i){if(typeof v==="string"&&(v.indexOf(",")>-1||jQuery.trim(v).indexOf(" ")>-1)){var b=sap.ui.getCore().getLibraryResourceBundle();throw new P(b.getText("Integer.Invalid"));return;}return F.prototype.parseValue.apply(this,[v,i]);},validateValue:function(v){return F.prototype.validateValue.apply(this,[v]);}});});
