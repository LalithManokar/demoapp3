sap.ui.define(['sap/uxap/BlockBase'],
    function(BlockBase) {
        "use strict";
        return BlockBase.extend("sap.ino.vc.idea.RelatedIdeasBlock", {
            metadata: {
    			views: {
    				Collapsed: {
    					viewName: "sap.ino.vc.idea.RelatedIdeas",
    					type: "XML"
    				},
    				Expanded: {
    					viewName: "sap.ino.vc.idea.RelatedIdeas",
    					type: "XML"
    				}
    			}
		    }
        });
    });
