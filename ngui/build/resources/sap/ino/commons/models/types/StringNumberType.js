/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["sap/ui/model/SimpleType"],function(S){"use strict";return S.extend("sap.ino.commons.models.types.StringNumberType",{formatValue:function(v,i){if(v===null){return null;}if(i==="float"){return parseFloat(v);}return 0;},parseValue:function(v,i){return v.toString();},validateValue:function(v){return true;}});});
