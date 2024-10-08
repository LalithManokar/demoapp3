sap.ui.define(['sap/uxap/BlockBase'],
    function(BlockBase) {
        "use strict";
        return BlockBase.extend("sap.ino.vc.idea.WallListBlock", {
            metadata: {
    			views: {
    				Collapsed: {
    					viewName: "sap.ino.vc.wall.ListInIdea",
    					type: "XML"
    				},
    				Expanded: {
    					viewName: "sap.ino.vc.wall.ListInIdea",
    					type: "XML"
    				}
    			}
		    }
        });
    });
