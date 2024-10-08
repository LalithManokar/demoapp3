sap.ui.define(['sap/uxap/BlockBase'],
    function(BlockBase) {
        "use strict";
        return BlockBase.extend("sap.ino.vc.blog.CommentBlock", {
            metadata: {
    			views: {
    				Collapsed: {
    					viewName: "sap.ino.vc.comment.Comment",
    					type: "XML"
    				},
    				Expanded: {
    					viewName: "sap.ino.vc.comment.Comment",
    					type: "XML"
    				}
    			}
		    }
        });
    });
