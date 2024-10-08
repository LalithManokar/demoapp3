/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["sap/ui/model/SimpleType"],function(S){"use strict";return S.extend("sap.ino.commons.models.types.StringBooleanType",{formatValue:function(v){return v==="1";},parseValue:function(v){return v?"1":"0";},validateValue:function(v){return v==="0"||v==="1";}});});
