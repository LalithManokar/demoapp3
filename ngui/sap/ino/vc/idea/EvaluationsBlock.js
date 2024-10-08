sap.ui.define(['sap/uxap/BlockBase'],
    function(BlockBase) {
        "use strict";
        return BlockBase.extend("sap.ino.vc.idea.EvaluationsBlock", {
            metadata: {
    			views: {
    				Collapsed: {
    					viewName: "sap.ino.vc.idea.Evaluations",
    					type: "XML"
    				},
    				Expanded: {
    					viewName: "sap.ino.vc.idea.Evaluations",
    					type: "XML"
    				}
    			}
		    }
        });
    });
