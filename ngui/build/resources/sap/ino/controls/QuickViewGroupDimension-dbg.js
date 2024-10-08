/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/m/QuickViewGroup"
], function(QuickViewGroup) {
	"use strict";

	return QuickViewGroup.extend("sap.ino.controls.QuickViewGroupDimension", {
		metadata: {
			properties: {
				dimensionTitle: {
					type: "string",
					defaultValue: ""
				},
				headingIcon: {
					type: "string",
					defaultValue: ""
				},
				totalPoints:{
                    type: "int", 
				    defaultValue:""
				},
				pointsToNextLevel:{
                    type: "int", 
				    defaultValue:""				    
				},
				currentPointsBWBadge: {
                    type: "int", 
				    defaultValue:""					    
				},
				diffPointsToNextLevel:{
                    type: "int", 
				    defaultValue:""					    
				},
				startLevel:{
					type: "string",
					defaultValue: ""				    
				},
				nextLevel:{
					type: "string",
					defaultValue: ""				    
				},
				dimensionUnit: {
				    type: "string",
					defaultValue: ""			    
				},
				redeemPoints:{
                     type: "int", 
				     default:""					    
				},
				redeemEnabled:{
	                type: "boolean",
				    defaultValue: false				    
				},
				showOnlyDimension:{
	                type: "boolean",
				    defaultValue: false				    
				}				
			}//,
        //   aggregations:{
        //     dimensionElements:{
        //         type:"sap.ino.controls.QuickViewGroupDimensionElement",
        //         multiple: true
        //     }
        //     }
		}
	});
});