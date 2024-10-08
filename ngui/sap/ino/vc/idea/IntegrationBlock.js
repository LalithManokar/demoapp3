sap.ui.define(['sap/uxap/BlockBase'],
    function(BlockBase) {
        "use strict";
        return BlockBase.extend("sap.ino.vc.idea.IntegrationBlock", {
            metadata: {
    			views: {
    				Collapsed: {
    					viewName: "sap.ino.vc.idea.Integration",
    					type: "XML"
    				},
    				Expanded: {
    					viewName: "sap.ino.vc.idea.Integration",
    					type: "XML"
    				}
    			}
		    }
        });
    });