sap.ui.define(['sap/uxap/BlockBase'],
    function(BlockBase) {
        "use strict";
        return BlockBase.extend("sap.ino.vc.idea.VotesBlock", {
            metadata: {
    			views: {
    				Collapsed: {
    					viewName: "sap.ino.vc.idea.Votes",
    					id: "voteView",
    					type: "XML"
    				},
    				Expanded: {
    					viewName: "sap.ino.vc.idea.Votes",
    					id: "voteView",
    					type: "XML"
    				}
    			}
		    }
        });
    });
