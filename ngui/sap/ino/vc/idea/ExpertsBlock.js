sap.ui.define(['sap/uxap/BlockBase'],
    function(BlockBase) {
        "use strict";
        return BlockBase.extend("sap.ino.vc.idea.ExpertsBlock", {
            metadata: {
    			views: {
    				Collapsed: {
    					viewName: "sap.ino.vc.idea.Experts",
    					type: "XML"
    				},
    				Expanded: {
    					viewName: "sap.ino.vc.idea.Experts",
    					type: "XML"
    				}
    			}
		    }
        });
    });
