sap.ui.define(['sap/uxap/BlockBase'],
    function(BlockBase) {
        "use strict";
        return BlockBase.extend("sap.ino.vc.idea.CommentRichBlock", {
            metadata: {
    			views: {
    				Collapsed: {
    					viewName: "sap.ino.vc.comment.RichComment",
    					type: "XML"
    				},
    				Expanded: {
    					viewName: "sap.ino.vc.comment.RichComment",
    					type: "XML"
    				}
    			}
		    }
        });
    });
