/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([],function(){"use strict";return{initExtensionNode:function(d,e,o){var m=o.getApplicationObjectMetadata();if(!d[e]||d[e].length===0){d[e]=[{}];}var E=d[e][0];jQuery.each(m.nodes[e].attributes,function(a,A){if(!A.readOnly&&a!="_ID"&&E[a]===undefined){E[a]=null;}if((E[a]===null||E[a]===undefined)&&!A.required&&!(A.customProperties&&A.customProperties.valueOptionList)&&!A.foreignKeyTo){if(A.dataType==="INTEGER"){E[a]=A.minValue!==undefined?A.minValue:0;}else if(A.dataType==="DOUBLE"){E[a]=A.minValue!==undefined?A.minValue:0.0;}}});return d;}};});
