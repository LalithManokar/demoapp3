sap.ui.define(['sap/uxap/BlockBase'],
    function(BlockBase) {
        "use strict";
        return BlockBase.extend("sap.ino.vc.idea.PPMBlock", {
            metadata: {
    			views: {
    				Collapsed: {
    					viewName: "sap.ino.vc.idea.PPM",
    					type: "XML"
    				},
    				Expanded: {
    					viewName: "sap.ino.vc.idea.PPM",
    					type: "XML"
    				}
    			}
		    }
        });
    });
