sap.ui.define(['sap/uxap/BlockBase'],
    function(BlockBase) {
        "use strict";
        return BlockBase.extend("sap.ino.vc.idea.InternalSectionBlock", {
            metadata: {
    			views: {
    				Collapsed: {
    					viewName: "sap.ino.vc.internal.InternalSection",
    					type: "XML"
    				},
    				Expanded: {
    					viewName: "sap.ino.vc.internal.InternalSection",
    					type: "XML"
    				}
    			}
		    }
        });
    });