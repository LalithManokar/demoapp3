sap.ui.define(['sap/uxap/BlockBase'],
    function(BlockBase) {
        "use strict";
        return BlockBase.extend("sap.ino.vc.idea.InternalAttachmentBlock", {
            metadata: {
    			views: {
    				Collapsed: {
    					viewName: "sap.ino.vc.internal.InternalAttachment",
    					type: "XML"
    				},
    				Expanded: {
    					viewName: "sap.ino.vc.internal.InternalAttachment",
    					type: "XML"
    				}
    			}
		    }
        });
    });
