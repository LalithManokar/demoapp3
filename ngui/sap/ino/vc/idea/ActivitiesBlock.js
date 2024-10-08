sap.ui.define(['sap/uxap/BlockBase'],
    function(BlockBase) {
        "use strict";
        var fnBlock = BlockBase.extend("sap.ino.vc.idea.ActivitiesBlock", {
            metadata: {
    			views: {
    				Collapsed: {
    					viewName: "sap.ino.vc.idea.Activities",
    					type: "XML"
    				},
    				Expanded: {
    					viewName: "sap.ino.vc.idea.Activities",
    					type: "XML"
    				}
    			}
		    }
        });
        return fnBlock;
    });
