/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["sap/ui/model/type/Float","sap/ui/model/ParseException"],function(F,P){"use strict";return F.extend("sap.ino.commons.models.types.FloatNullableType",{formatValue:function(v,i){if(v===null||v===undefined||v===""){return v;}return F.prototype.formatValue.apply(this,[v,i]);},parseValue:function(v,i){if(v===null||v===undefined||v===""){return v;}return F.prototype.parseValue.apply(this,[v,i]);},validateValue:function(v){if(v===null||v===undefined||v===""){return true;}return F.prototype.validateValue.apply(this,[v]);}});});
