/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(["./MacroMetadata"],function(M){"use strict";var F=M.extend("sap.fe.macros.FilterBar",{name:"FilterBar",namespace:"sap.fe.macros",fragment:"sap.fe.macros.FilterBar",metadata:{designtime:"sap/fe/macros/FilterBar.designtime",metadataContexts:{entitySet:{required:true,$kind:"EntitySet"}},properties:{id:{type:"string"},hideBasicSearch:{type:"boolean",defaultValue:false},showAdaptFiltersButton:{type:"boolean",defaultValue:false},listBindingNames:{type:"string"},liveMode:{type:"boolean",defaultValue:false},draftEditStateModelName:{type:"string",defaultValue:false}},events:{}}});return F;});
