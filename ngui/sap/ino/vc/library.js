/*!
 * @copyright@
 */
sap.ui.define([
    "sap/ui/core/library",
    "sap/m/library"
], function() {
    "use strict";
    
    sap.ui.getCore().initLibrary({
        name : "sap.ino.vc",
        dependencies : ["sap.ui.core", "sap.m"],
        types : [], 
        interfaces : [],
        controls : [
            "sap.ino.vc.commons.BaseController",
            "sap.ino.vc.commons.BaseListController",
            "sap.ino.vc.commons.BaseObjectController",
            "sap.ino.vc.commons.BaseObjectModifyController",
            "sap.ino.vc.commons.BaseVariantListController",
            "sap.ino.vc.commons.TopLevelPageFacet",
            "sap.ino.vc.evaluation.EvaluationFacet",
            "sap.ino.vc.evaluation.EvaluationFormatter",
            "sap.ino.vc.idea.ActivitiesBlock",
            "sap.ino.vc.idea.AttachmentBlock",
            "sap.ino.vc.idea.CommentBlock",
            "sap.ino.vc.idea.EvaluationsBlock",
            "sap.ino.vc.idea.ExpertFinderBlock",
            "sap.ino.vc.idea.ListInIdeaBlock",
            "sap.ino.vc.idea.RelatedIdeasBlock",
            "sap.ino.vc.wall.util.Helper",
            "sap.ino.vc.wall.util.WallFactory"
        ],
        noLibraryCSS: true, 
        elements : [
        ],
        version : "@version@" 
    });
});