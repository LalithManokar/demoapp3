/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/core/util/XMLPreprocessor","sap/fe/macros/PhantomUtil","./FilterField.metadata","./FilterBar.metadata","./MicroChart.metadata","./Contact.metadata"],function(X,P,F,a,M,C){"use strict";var n="sap.fe.macros",c=["Table","Form","FormContainer","Field",a,F,"Chart","ValueHelp",M,C].map(function(e){if(typeof e==="string"){return{name:e,namespace:n,metadata:{metadataContexts:{},properties:{},events:{}}};}return e;});function r(){c.forEach(function(e){P.register(e);});}function d(){c.forEach(function(e){X.plugIn(null,e.namespace,e.name);});}r();return{register:r,deregister:d};});
