/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
	"sap/m/TextRenderer",
	"sap/m/Text"
], function(TextRenderer,
	Text) {
	"use strict";

	var StatusText = Text.extend("sap.ino.controls.StatusText", {
		metadata: {
			properties: {
				statusColor: {
					type: "string"
				}
			}
		},

		renderer: TextRenderer,
  
        
		onAfterRendering: function() {
		  //  Text.prototype.onAfterRendering.apply(this);
			var sStatusColor = this.getProperty("statusColor");
			if (sStatusColor && sStatusColor.length === 6) {
				sStatusColor = "#" + sStatusColor;
			} else {
				sStatusColor = "#333333";
			}
			if(this.getDomRef()){
			    $(this.getDomRef()).css("color",sStatusColor);
			}
		}
	});
	
	return StatusText;
});