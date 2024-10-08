/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(["./MacroMetadata"],function(M){"use strict";var F=M.extend("sap.fe.macros.FilterField",{name:"FilterField",namespace:"sap.fe.macros",fragment:"sap.fe.macros.FilterField",metadata:{stereotype:"xmlmacro",designtime:"sap/fe/macros/FilterField.designtime",metadataContexts:{entitySet:{required:true,$kind:"EntitySet"},property:{required:true,$kind:"Property"}},properties:{idPrefix:{type:"string",defaultValue:"FF"},vhIdPrefix:{type:"string",defaultValue:"FFVH"}},events:{}}});return F;});
