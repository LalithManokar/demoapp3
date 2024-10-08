sap.ui.define(['sap/uxap/BlockBase'],
    function(BlockBase) {
        "use strict";
        return BlockBase.extend("sap.ino.vc.idea.InternalCommentBlock", {
            metadata: {
    			views: {
    				Collapsed: {
    					viewName: "sap.ino.vc.internal.InternalNote",
    					type: "XML"
    				},
    				Expanded: {
    					viewName: "sap.ino.vc.internal.InternalNote",
    					type: "XML"
    				}
    			}
		    }
        });
    });
