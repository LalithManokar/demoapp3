sap.ui.define(['sap/uxap/BlockBase'],
    function(BlockBase) {
        "use strict";
        return BlockBase.extend("sap.ino.vc.idea.RewardsBlock", {
            metadata: {
    			views: {
    				Collapsed: {
    					viewName: "sap.ino.vc.idea.Rewards",
    					type: "XML"
    				},
    				Expanded: {
    					viewName: "sap.ino.vc.idea.Rewards",
    					type: "XML"
    				}
    			}
		    }
        });
    });
