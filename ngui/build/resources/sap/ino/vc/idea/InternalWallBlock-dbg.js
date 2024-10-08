sap.ui.define(['sap/uxap/BlockBase'],
    function(BlockBase) {
        "use strict";
        return BlockBase.extend("sap.ino.vc.idea.InternalWallBlock", {
            metadata: {
    			views: {
    				Collapsed: {
    					viewName: "sap.ino.vc.internal.InternalWall",
    					type: "XML"
    				},
    				Expanded: {
    					viewName: "sap.ino.vc.internal.InternalWall",
    					type: "XML"
    				}
    			}
		    }
        });
    });
