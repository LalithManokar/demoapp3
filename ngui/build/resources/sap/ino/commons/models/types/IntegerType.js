/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["sap/ui/model/type/Integer","sap/ui/model/ParseException"],function(I,P){"use strict";return I.extend("sap.ino.commons.models.types.IntegerType",{formatValue:function(v,i){return I.prototype.formatValue.apply(this,[v,i]);},parseValue:function(v,i){if(v.indexOf(",")>-1||jQuery.trim(v).indexOf(" ")>-1){var b=sap.ui.getCore().getLibraryResourceBundle();throw new P(b.getText("Integer.Invalid"));return;}return I.prototype.parseValue.apply(this,[v,i]);},validateValue:function(v){return I.prototype.validateValue.apply(this,[v]);}});});
