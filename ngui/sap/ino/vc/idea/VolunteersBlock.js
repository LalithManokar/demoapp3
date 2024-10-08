sap.ui.define(['sap/uxap/BlockBase'],
    function(BlockBase) {
        "use strict";
        return BlockBase.extend("sap.ino.vc.idea.VolunteersBlock", {
            metadata: {
    			views: {
    				Collapsed: {
    					viewName: "sap.ino.vc.idea.Volunteers",
    					id: "volunteerView",
    					type: "XML"
    				},
    				Expanded: {
    					viewName: "sap.ino.vc.idea.Volunteers",
    					id: "volunteerView",
    					type: "XML"
    				}
    			}
		    }
        });
    });
