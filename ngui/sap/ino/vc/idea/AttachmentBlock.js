sap.ui.define(['sap/uxap/BlockBase'],
    function(BlockBase) {
        "use strict";
        return BlockBase.extend("sap.ino.vc.idea.AttachmentBlock", {
            metadata: {
    			views: {
    				Collapsed: {
    					viewName: "sap.ino.vc.attachment.Attachment",
    					type: "XML"
    				},
    				Expanded: {
    					viewName: "sap.ino.vc.attachment.Attachment",
    					type: "XML"
    				}
    			}
		    }
        });
    });
