/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["sap/ui/model/type/Integer"],function(I){"use strict";return I.extend("sap.ino.commons.models.types.IntNullableBooleanType",{formatValue:function(v,i){if(v===null||v===undefined||v===""){return v;}return I.prototype.formatValue.apply(this,[v,i]);},parseValue:function(v,i){if(v===null||v===undefined||v===""){return v;}return I.prototype.parseValue.apply(this,[v,i]);},validateValue:function(v){if(v===null||v===undefined||v===""){return true;}return I.prototype.validateValue.apply(this,[v]);}});});
